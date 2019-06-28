import { InstanceProvider } from "../../../instance-provider/instance-provider";
import { fontRequest, IFontResourceRequest } from "../../../resources";
import { KernedLayout } from "../../../resources/text/font-map";
import {
  createLayer,
  ILayerConstructionClass,
  LayerInitializer
} from "../../../surface/layer";
import { InstanceDiffType, ResourceType } from "../../../types";
import { IAutoEasingMethod } from "../../../util/auto-easing-method";
import { copy2, copy4, dot2, scale2, Vec, Vec2 } from "../../../util/vector";
import { Anchor, AnchorType, ScaleMode } from "../../types";
import { ILayer2DProps, Layer2D } from "../../view/layer-2d";
import { GlyphInstance } from "./glyph-instance";
import { GlyphLayer, IGlyphLayerOptions } from "./glyph-layer";
import { LabelInstance } from "./label-instance";

/**
 * Default characters for truncating a label.
 */
const DEFAULT_TRUNCATION = "...";

/**
 * This is a lookup to quickly find the proper calculation for setting the correct anchor
 * position based on the anchor type.
 */
const anchorCalculator: {
  [key: number]: (anchor: Anchor, label: LabelInstance) => void;
} = {
  [AnchorType.TopLeft]: (anchor: Anchor, _label: LabelInstance) => {
    anchor.x = 0;
    anchor.y = 0;
  },
  [AnchorType.TopMiddle]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = label.size[0] / 2.0;
    anchor.y = 0;
  },
  [AnchorType.TopRight]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = label.size[0];
    anchor.y = 0;
  },
  [AnchorType.MiddleLeft]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = 0;
    anchor.y = label.size[1] / 2;
  },
  [AnchorType.Middle]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = label.size[0] / 2.0;
    anchor.y = label.size[1] / 2.0;
  },
  [AnchorType.MiddleRight]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = label.size[0];
    anchor.y = label.size[1] / 2.0;
  },
  [AnchorType.BottomLeft]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = 0;
    anchor.y = label.size[1];
  },
  [AnchorType.BottomMiddle]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = label.size[0] / 2.0;
    anchor.y = label.size[1];
  },
  [AnchorType.BottomRight]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = label.size[0];
    anchor.y = label.size[1];
  },
  [AnchorType.Custom]: (anchor: Anchor, _label: LabelInstance) => {
    anchor.x = anchor.x || 0;
    anchor.y = anchor.y || 0;
  }
};

const directions: Vec2[] = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [0, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1]
].map((dir: Vec2) => {
  const mag = Math.sqrt(dot2(dir, dir));
  return scale2(dir, 1 / -mag);
});

/**
 * Lookup to quickly calculate the padding direction based on the the provided anchor type.
 */
const paddingCalculator: {
  [key: number]: (anchor: Anchor) => void;
} = {
  [AnchorType.TopLeft]: (anchor: Anchor) => {
    anchor.paddingDirection = scale2(directions[0], anchor.padding);
  },
  [AnchorType.TopMiddle]: (anchor: Anchor) => {
    anchor.paddingDirection = scale2(directions[1], anchor.padding);
  },
  [AnchorType.TopRight]: (anchor: Anchor) => {
    anchor.paddingDirection = scale2(directions[2], anchor.padding);
  },
  [AnchorType.MiddleLeft]: (anchor: Anchor) => {
    anchor.paddingDirection = scale2(directions[3], anchor.padding);
  },
  [AnchorType.Middle]: (anchor: Anchor) => {
    anchor.paddingDirection = [0, 0];
  },
  [AnchorType.MiddleRight]: (anchor: Anchor) => {
    anchor.paddingDirection = scale2(directions[5], anchor.padding);
  },
  [AnchorType.BottomLeft]: (anchor: Anchor) => {
    anchor.paddingDirection = scale2(directions[6], anchor.padding);
  },
  [AnchorType.BottomMiddle]: (anchor: Anchor) => {
    anchor.paddingDirection = scale2(directions[7], anchor.padding);
  },
  [AnchorType.BottomRight]: (anchor: Anchor) => {
    anchor.paddingDirection = scale2(directions[8], anchor.padding);
  },
  [AnchorType.Custom]: (anchor: Anchor) => {
    anchor.paddingDirection = anchor.paddingDirection;
  }
};

/**
 * Constructor props for making a new label layer
 */
export interface ILabelLayerProps<T extends LabelInstance>
  extends ILayer2DProps<T> {
  /** Animation methods for various properties of the glyphs */
  animate?: {
    anchor?: IAutoEasingMethod<Vec>;
    color?: IAutoEasingMethod<Vec>;
    offset?: IAutoEasingMethod<Vec>;
    origin?: IAutoEasingMethod<Vec>;
  };
  /** A custom layer to handle rendering glyph instances */
  customGlyphLayer?: ILayerConstructionClass<
    GlyphInstance,
    IGlyphLayerOptions<GlyphInstance>
  >;
  /** String identifier of the resource font to use for the layer */
  resourceKey?: string;
  /** The scaling strategy the labels will use wheh scaling the scene up and down */
  scaleMode?: ScaleMode;
  /**
   * This defines what characters to use to indicate truncation of labels when needed. This
   * defaults to ellipses or three periods '...'
   */
  truncation?: string;
  /** This indicates whether a label is in a textarea */
  inTextArea?: boolean;
}

/**
 * This is a composite layer that will take in and manage Label Instances. The true instance
 * that will be rendered as a result of a Label Instance will simply be Glyph Instances. Hence
 * this is a composite layer that is merely a manager to split up the label's requested string
 * into Glyphs to render.
 */
export class LabelLayer<
  T extends LabelInstance,
  U extends ILabelLayerProps<T>
> extends Layer2D<T, U> {
  static defaultProps: ILabelLayerProps<LabelInstance> = {
    key: "",
    data: new InstanceProvider<LabelInstance>()
  };

  /**
   * When this is flagged, we must do a complete recomputation of all our label's glyphs positions and kernings.
   * This event really only takes place when the font resource changes.
   */
  fullUpdate: boolean = false;
  /** Provider for the glyph layer this layer manages */
  glyphProvider = new InstanceProvider<GlyphInstance>();
  /**
   * Tracks all assigned glyphs for the given label.
   */
  labelToGlyphs = new Map<LabelInstance, GlyphInstance[]>();
  /**
   * This maps a label to it's request made for all of the kerning information needed for the label.
   */
  labelToKerningRequest = new Map<LabelInstance, IFontResourceRequest>();
  /**
   * This stores all of the glyphs the label is waiting on to fire the onReady event.
   */
  labelWaitingOnGlyph = new Map<LabelInstance, Set<GlyphInstance>>();
  /**
   * These are the property ids for the instances that we need to know when they changed so we can adjust
   * the underlying glyphs.
   */
  propertyIds: { [key: string]: number } | undefined;
  /**
   * This stores the kerning request for the truncation characters.
   */
  truncationKerningRequest?: IFontResourceRequest;
  /**
   * This is the width of the truncation glyphs.
   */
  truncationWidth: number = -1;

  /**
   * This provides the child layers that will render on behalf of this layer.
   *
   * For Labels, a label is simply a group of well placed glyphs. So we defer all of
   * the labels changes by converting the label into glyphs and applying the changes to
   * it's set of glyphs.
   */
  childLayers(): LayerInitializer[] {
    return [
      createLayer(this.props.customGlyphLayer || GlyphLayer, {
        animate: this.props.animate,
        data: this.glyphProvider,
        key: `${this.id}.glyphs`,
        resourceKey: this.props.resourceKey,
        scaleMode: this.props.scaleMode || ScaleMode.BOUND_MAX,
        inTextArea: this.props.inTextArea
      })
    ];
  }

  /**
   * We override the draw method of the layer to handle the diffs of the provider in a
   * custom fashion by delegating the changes of the provider to the child layers.
   */
  draw() {
    // Retrieve changes properly
    const changes = this.resolveChanges();
    // No changes, nothing to be done
    if (changes.length <= 0) return;

    // Make sure our instance property ids are established for the instance type involved
    // We want only the ids of changes that causes us to
    if (!this.propertyIds) {
      const instance = changes[0][0];
      this.propertyIds = this.getInstanceObservableIds(instance, [
        "text",
        "active",
        "anchor",
        "color",
        "origin",
        "fontSize",
        "maxWidth",
        "maxScale",
        "letterSpacing"
      ]);
    }

    const {
      text: textId,
      active: activeId,
      anchor: anchorId,
      color: colorId,
      origin: originId,
      fontSize: fontSizeId,
      maxWidth: maxWidthId,
      maxScale: maxScaleId,
      letterSpacing: letterSpacingId
    } = this.propertyIds;

    for (let i = 0, iMax = changes.length; i < iMax; ++i) {
      const [instance, diffType, changed] = changes[i];

      switch (diffType) {
        case InstanceDiffType.CHANGE:
          // Perform the insert action instead of the change if the label has never been registered
          if (!this.labelToGlyphs.get(instance)) {
            this.insert(instance);
            continue;
          }

          // If text was changed, the glyphs all need updating of their characters and
          // possibly have glyphs added or removed to handle the issue.
          if (changed[textId] !== undefined) {
            this.invalidateRequest(instance);
            this.layoutGlyphs(instance);
          } else if (changed[activeId] !== undefined) {
            if (instance.active) {
              this.layoutGlyphs(instance);
              this.showGlyphs(instance);
            } else {
              this.hideGlyphs(instance);
            }
          }

          if (changed[anchorId]) {
            this.updateAnchor(instance);
          }

          if (changed[colorId] !== undefined) {
            this.updateGlyphColors(instance);
          }

          if (changed[originId] !== undefined) {
            this.updateGlyphOrigins(instance);
          }

          if (changed[maxScaleId] !== undefined) {
            this.updateGlyphMaxScales(instance);
          }

          if (changed[fontSizeId] !== undefined) {
            this.invalidateRequest(instance);
            this.layoutGlyphs(instance);
          }

          if (changed[maxWidthId] !== undefined) {
            this.invalidateRequest(instance);
            this.layoutGlyphs(instance);
          }

          if (changed[letterSpacingId] !== undefined) {
            this.invalidateRequest(instance);
            this.layoutGlyphs(instance);
          }
          break;

        case InstanceDiffType.INSERT:
          this.insert(instance);
          break;

        case InstanceDiffType.REMOVE:
          const glyphs = this.labelToGlyphs.get(instance);

          if (glyphs) {
            for (let i = 0, iMax = glyphs.length; i < iMax; ++i) {
              this.glyphProvider.remove(glyphs[i]);
            }

            this.labelToGlyphs.delete(instance);
            this.labelToKerningRequest.delete(instance);
            this.labelWaitingOnGlyph.delete(instance);
          }
          break;
      }
    }
  }

  /**
   * Handles first insertion operation for the label
   */
  private insert(instance: T) {
    // Our management flag is dependent on if the label has glyph storage or not
    if (!instance.preload) {
      const storage = this.labelToGlyphs.get(instance);
      if (!storage) this.labelToGlyphs.set(instance, []);
    }

    // Make sure the instance is removed from the provider for preloads
    else {
      this.props.data.remove(instance);
    }

    // Insertions force a full update of all glyphs for the label
    this.layoutGlyphs(instance);
  }

  /**
   * When the glyph is ready to render this executes.
   */
  handleGlyphReady = (glyph: GlyphInstance) => {
    // The glyph must be associated to have this work
    if (!glyph.parentLabel) {
      // If no parent label, we should not have this glyph returningfalse alarms to this method
      delete glyph.onReady;

      return;
    }

    // Get the label this glyph is a part of
    const label = glyph.parentLabel;
    // Get the list of glyphs the label is waiting on.
    const waiting = this.labelWaitingOnGlyph.get(glyph.parentLabel);

    if (!waiting) {
      return;
    }

    // Clear this glyph from the waiting list
    if (waiting.has(glyph)) {
      waiting.delete(glyph);

      if (waiting.size <= 0) {
        // If the waiting list is empty we can get the label to execute it's ready handler
        const onReady = label.onReady;
        // Execute the callback if present
        if (onReady) onReady(label);
      }
    }
  };

  /**
   * Unmounts all of the glyphs that make the lable
   */
  hideGlyphs(instance: T) {
    const glyphs = this.labelToGlyphs.get(instance);
    if (!glyphs) return;

    for (let i = 0, iMax = glyphs.length; i < iMax; ++i) {
      this.glyphProvider.remove(glyphs[i]);
    }
  }

  /**
   * Tell the system this layer is not providing any rendering IO information for the GPU to render.
   */
  initShader() {
    return null;
  }

  /**
   * This invalidates the request for the instance thus requiring a new request to be made
   * to trigger the layout of the label.
   */
  invalidateRequest(instance: T) {
    this.labelToKerningRequest.delete(instance);
  }

  /**
   * This uses calculated kerning information to place the glyph relative to it's left character neighbor.
   * The first glyph will use metrics of the glyphs drop down amount to determine where the glyph
   * will be placed.
   */
  layoutGlyphs(instance: T) {
    // Make sure the kerning is ready
    if (!this.updateKerning(instance)) return;
    // Instance must be active
    if (!instance.active) return;
    // Get the kerning request for the instance
    const kerningRequest = this.labelToKerningRequest.get(instance);
    // We must have kerning calculated for the instance to be valid for laying out the glyphs
    if (!kerningRequest || !kerningRequest.fontMap) return;
    // See if our request provided the metrics for the text yet
    const requestMetrics = kerningRequest.metrics;
    if (!requestMetrics || !requestMetrics.layout) return;

    // Get the layout that will be used for the request
    const layout = requestMetrics.layout;
    // Update the glyphs based on the provided layout
    this.updateGlyphs(instance, layout);
    // Get the glyphs of the label
    const glyphs = instance.glyphs;
    // Store the calculated size of the label
    instance.size = layout.size;
    // Update the calculated anchor for the label now that size is determined
    anchorCalculator[instance.anchor.type](instance.anchor, instance);
    paddingCalculator[instance.anchor.type](instance.anchor);

    const anchor = instance.anchor;
    const padding = instance.anchor.paddingDirection;

    // Apply the offsets calculated to each glyph
    for (
      let i = 0, iMax = Math.min(layout.positions.length, glyphs.length);
      i < iMax;
      ++i
    ) {
      const offset = layout.positions[i];
      const glyph = glyphs[i];
      glyph.offset = offset;
      glyph.fontScale = layout.fontScale;
      glyph.anchor = [anchor.x || 0, anchor.y || 0];
      glyph.origin = copy2(instance.origin);
      glyph.padding = padding || [0, 0];

      glyph.maxScale = instance.maxScale;
    }
  }

  /**
   * This layer does not have or use a buffer manager thus it must track management of an instance
   * in it's own way.
   */
  managesInstance(instance: T) {
    return Boolean(this.labelToGlyphs.get(instance));
  }

  /**
   * This makes a label's glyphs visible by adding them to the glyph layer rendering the glyphs.
   */
  showGlyphs(instance: T) {
    const glyphs = this.labelToGlyphs.get(instance);
    if (!glyphs) return;

    for (let i = 0, iMax = glyphs.length; i < iMax; ++i) {
      this.glyphProvider.add(glyphs[i]);
    }
  }

  /**
   * Updates the anchor position of the instance when set
   */
  updateAnchor(instance: T) {
    const glyphs = instance.glyphs;
    if (!glyphs) return;

    anchorCalculator[instance.anchor.type](instance.anchor, instance);
    paddingCalculator[instance.anchor.type](instance.anchor);

    const anchor = instance.anchor;
    const padding = instance.anchor.paddingDirection;

    for (let i = 0, iMax = glyphs.length; i < iMax; ++i) {
      glyphs[i].anchor = [anchor.x || 0, anchor.y || 0];
      glyphs[i].padding = padding || [0, 0];
    }
  }

  /**
   * This ensures the correct number of glyphs is being provided for the label indicated.
   */
  updateGlyphs(instance: T, layout: KernedLayout) {
    // Get the current glyphs rendering for the label
    let currentGlyphs = this.labelToGlyphs.get(instance);

    // Make sure we have glyph storage
    if (!currentGlyphs) {
      currentGlyphs = [];
      this.labelToGlyphs.set(instance, currentGlyphs);
    }

    // Get the current list of glyphs in the waiting queue
    let waiting = this.labelWaitingOnGlyph.get(instance);

    if (!waiting) {
      waiting = new Set();
      this.labelWaitingOnGlyph.set(instance, waiting);
    }

    // Update the character used by existing glyphs
    for (
      let i = 0, iMax = Math.min(currentGlyphs.length, layout.glyphs.length);
      i < iMax;
      ++i
    ) {
      const glyph = currentGlyphs[i];

      if (glyph.character !== layout.glyphs[i]) {
        glyph.character = layout.glyphs[i];

        if (
          !glyph.request ||
          !glyph.request.fontMap ||
          !glyph.request.fontMap.glyphMap[glyph.character]
        ) {
          waiting.add(glyph);
        }
      }
    }

    // Make any missing glyphs
    if (currentGlyphs.length < layout.glyphs.length) {
      let sourceIndex = 0;

      for (
        let i = currentGlyphs.length, iMax = layout.glyphs.length;
        i < iMax;
        ++i, ++sourceIndex
      ) {
        const char = layout.glyphs[i];
        const glyph = new GlyphInstance({
          character: char,
          color: instance.color,
          origin: instance.origin,
          maxScale: instance.maxScale,
          onReady: this.handleGlyphReady
        });

        glyph.parentLabel = instance;
        currentGlyphs.push(glyph);

        if (instance.active) {
          this.glyphProvider.add(glyph);
        }

        waiting.add(glyph);
      }
    }

    // Remove excess glyphs
    else if (currentGlyphs.length > layout.glyphs.length) {
      for (
        let i = layout.glyphs.length, iMax = currentGlyphs.length;
        i < iMax;
        ++i
      ) {
        const glyph = currentGlyphs[i];
        this.glyphProvider.remove(glyph);
      }

      // Remove the glyphs from the list the label utilizes
      while (currentGlyphs.length > layout.glyphs.length) currentGlyphs.pop();
    }

    // Update the list of glyphs that are utilized for the label's rendering
    instance.glyphs = currentGlyphs;
  }

  /**
   * Updates the glyph colors to match the label's glyph colors
   */
  updateGlyphColors(instance: T) {
    const glyphs = instance.glyphs;
    if (!glyphs) return;

    for (let i = 0, iMax = glyphs.length; i < iMax; ++i) {
      glyphs[i].color = copy4(instance.color);
    }
  }

  /**
   * This updates all of the glyphs for the label to have the same position
   * as the label.
   */
  updateGlyphOrigins(instance: T) {
    const glyphs = instance.glyphs;
    if (!glyphs) return;
    const origin = instance.origin;

    for (let i = 0, iMax = glyphs.length; i < iMax; ++i) {
      glyphs[i].origin = [origin[0], origin[1]];
    }
  }

  /**
   * This updates all of the glyphs for the label to have the same position
   * as the label.
   */
  updateGlyphMaxScales(instance: T) {
    const glyphs = instance.glyphs;
    if (!glyphs) return;
    const maxScale = instance.maxScale;

    for (let i = 0, iMax = glyphs.length; i < iMax; ++i) {
      glyphs[i].maxScale = maxScale;
    }
  }

  /**
   * Checks the label to ensure calculated kerning supports the text specified.
   *
   * Returns true when the kerning information is already available
   */
  updateKerning(instance: T) {
    // A change in glyphs requires a potential kerning request
    let labelKerningRequest = this.labelToKerningRequest.get(instance);
    // This is the text the label will be making for the request
    const checkText = instance.text;

    // If we have the label kerning request, we should check to see if the font map
    // supports the contents of the label.
    if (labelKerningRequest) {
      // If the request already embodies the request for the text, we just see if the
      // font map has been provided yet to indicate if the kerning information is ready
      if (
        labelKerningRequest.kerningPairs &&
        labelKerningRequest.kerningPairs.indexOf(checkText) > -1
      ) {
        return Boolean(labelKerningRequest.fontMap);
      }

      // If the request exists for a different text, and the font map does not support
      // the kerning needs of the text, then we must make a new request.
      if (
        labelKerningRequest.fontMap &&
        !labelKerningRequest.fontMap.supportsKerning(
          checkText.replace(/\s/g, "")
        )
      ) {
        this.labelToKerningRequest.delete(instance);
        labelKerningRequest = undefined;
      }

      // Otherwise, nothing needs to happen and we can use the font map for kerning information
      else {
        return true;
      }
    }

    // If no request is present we must make one
    if (!labelKerningRequest) {
      const metrics: IFontResourceRequest["metrics"] = {
        // We want the request to return all of the metrics for the text as well
        fontSize: instance.fontSize,
        text: instance.text,
        letterSpacing: instance.letterSpacing
      };

      // Include truncation metrics if the text needs it
      if (instance.maxWidth > 0) {
        metrics.maxWidth = instance.maxWidth;
        metrics.truncation = this.props.truncation || DEFAULT_TRUNCATION;
      }

      // Make the request for retrieving the kerning information.
      labelKerningRequest = fontRequest({
        key: this.props.resourceKey || "",
        character: "",
        kerningPairs: [checkText],
        metrics
      });

      // In order for the glyphs to be laid out, we need the font map to get the kerning information.
      // So we send out a request to the font manager for the resource.
      // Once the kerning information has been retrieved, the label active property will be triggered
      // to true.
      if (!instance.preload) {
        this.resource.request(this, instance, labelKerningRequest, {
          resource: {
            type: ResourceType.FONT,
            key: this.props.resourceKey || ""
          }
        });

        this.labelToKerningRequest.set(instance, labelKerningRequest);
      }

      // For preload labels, simply make the request, but modify the resource trigger to fire off the ready
      // event for the label
      else {
        instance.resourceTrigger = () => {
          if (instance.onReady) instance.onReady(instance);
        };

        this.resource.request(this, instance, labelKerningRequest);
      }

      return false;
    }

    return true;
  }

  /**
   * If our resource changes, we need a full update of all instances.
   * If our provider changes, we probably want to ensure our property identifiers are correct.
   */
  willUpdateProps(newProps: U) {
    if (newProps.data !== this.props.data) {
      delete this.propertyIds;
    }

    // Scale mode change changes the shader needs of the underlying glyphs
    if (newProps.scaleMode !== this.props.scaleMode) {
      this.rebuildLayer();
    }

    if (newProps.resourceKey !== this.props.resourceKey) {
      this.fullUpdate = true;
    }
  }
}
