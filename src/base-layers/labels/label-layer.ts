import { InstanceProvider } from "../../instance-provider/instance-provider";
import { Bounds } from "../../primitives";
import { fontRequest, IFontResourceRequest } from "../../resources";
import { ILayerProps, Layer } from "../../surface/layer";
import {
  createLayer,
  ILayerConstructionClass,
  LayerInitializer
} from "../../surface/layer-surface";
import {
  InstanceDiffType,
  IProjection,
  ResourceType,
  isWhiteSpace
} from "../../types";
import { IAutoEasingMethod } from "../../util/auto-easing-method";
import { copy2, copy4, divide2, subtract2, Vec, Vec2 } from "../../util/vector";
import { Anchor, AnchorType } from "../types";
import { GlyphInstance } from "./glyph-instance";
import { GlyphLayer, IGlyphLayerOptions } from "./glyph-layer";
import { LabelInstance } from "./label-instance";
import { FontMap, KernedLayout } from "src/resources/text/font-map";

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
    anchor.x = -anchor.padding;
    anchor.y = -anchor.padding;
  },
  [AnchorType.TopMiddle]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = label.size[0] / 2.0;
    anchor.y = -anchor.padding;
  },
  [AnchorType.TopRight]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = label.size[0] + anchor.padding;
    anchor.y = -anchor.padding;
  },
  [AnchorType.MiddleLeft]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = -anchor.padding;
    anchor.y = label.size[1] / 2;
  },
  [AnchorType.Middle]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = label.size[0] / 2.0;
    anchor.y = label.size[1] / 2.0;
  },
  [AnchorType.MiddleRight]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = label.size[0] + anchor.padding;
    anchor.y = label.size[1] / 2.0;
  },
  [AnchorType.BottomLeft]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = -anchor.padding;
    anchor.y = label.size[1] + anchor.padding;
  },
  [AnchorType.BottomMiddle]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = label.size[0] / 2.0;
    anchor.y = label.size[1] + anchor.padding;
  },
  [AnchorType.BottomRight]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = label.size[0] + anchor.padding;
    anchor.y = label.size[1] + anchor.padding;
  },
  [AnchorType.Custom]: (anchor: Anchor, _label: LabelInstance) => {
    anchor.x = anchor.x || 0;
    anchor.y = anchor.y || 0;
  }
};

/**
 * Constructor props for making a new label layer
 */
export interface ILabelLayerProps<T extends LabelInstance>
  extends ILayerProps<T> {
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
  /**
   * This defines what characters to use to indicate truncation of labels when needed. This
   * defaults to ellipses or three periods '...'
   */
  truncation?: string;
  /** This number represents how much space each whitespace characters represents */
  whiteSpaceKerning?: number;
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
> extends Layer<T, U> {
  static defaultProps: ILabelLayerProps<LabelInstance> = {
    key: "",
    data: new InstanceProvider<LabelInstance>(),
    scene: "default"
  };

  /** Provider for the glyph layer this layer manages */
  glyphProvider = new InstanceProvider<GlyphInstance>();
  /**
   * These are the property ids for the instances that we need to know when they changed so we can adjust
   * the underlying glyphs.
   */
  propertyIds: { [key: string]: number } | undefined;
  /**
   * When this is flagged, we must do a complete recomputation of all our label's glyphs positions and kernings.
   * This event really only takes place when the font resource changes.
   */
  fullUpdate: boolean = false;
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
   * This stores the kerning request for the truncation characters.
   */
  truncationKerningRequest?: IFontResourceRequest;
  /**
   * This is the width of the truncation glyphs.
   */
  truncationWidth: number = -1;

  /**
   * We provide bounds and hit test information for the instances for this layer to allow for mouse picking
   * of elements
   */
  getInstancePickingMethods() {
    return {
      // Provide the calculated AABB world bounds for a given image
      boundsAccessor: (label: T) => {
        const anchorEffect: Vec2 = [0, 0];

        if (label.anchor) {
          anchorEffect[0] = label.anchor.x || 0;
          anchorEffect[1] = label.anchor.y || 0;
        }

        const topLeft = subtract2(label.origin, anchorEffect);

        return new Bounds({
          height: label.size[1],
          width: label.size[0],
          x: topLeft[0],
          y: topLeft[1]
        });
      },

      // Provide a precise hit test for the circle
      hitTest: (label: T, point: Vec2, view: IProjection) => {
        // If we never allow the image to scale, then the bounds will grow and shrink to counter the effects
        // Of the camera zoom
        // The location is within the world, but we reverse project the anchor spread
        const anchorEffect: Vec2 = [0, 0];

        if (label.anchor) {
          anchorEffect[0] = label.anchor.x || 0;
          anchorEffect[1] = label.anchor.y || 0;
        }

        const topLeft = view.worldToScreen(
          subtract2(label.origin, divide2(anchorEffect, view.camera.scale))
        );

        const screenPoint = view.worldToScreen(point);

        // Reverse project the size and we should be within the distorted world coordinates
        const bounds = new Bounds({
          height: label.size[1],
          width: label.size[0],
          x: topLeft[0],
          y: topLeft[1]
        });

        return bounds.containsPoint(screenPoint);
      }
    };
  }

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
        key: `${this.id}_glyphs`,
        resourceKey: this.props.resourceKey,
        scene: this.props.scene
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
        "color",
        "origin",
        "fontSize",
        "maxWidth"
      ]);
    }

    const {
      text: textId,
      active: activeId,
      color: colorId,
      origin: originId,
      fontSize: fontSizeId,
      maxWidth: maxWidthId
    } = this.propertyIds;

    for (let i = 0, iMax = changes.length; i < iMax; ++i) {
      const [instance, diffType, changed] = changes[i];

      switch (diffType) {
        case InstanceDiffType.CHANGE:
          // If text was changed, the glyphs all need updating of their characters and
          // possibly have glyphs added or removed to handle the issue.
          if (changed[textId] !== undefined) {
            instance.willCheckTruncation = true;
            instance.truncatedText = "";
            this.updateGlyphs(instance);
            this.layoutGlyphs(instance);
          } else if (changed[activeId] !== undefined) {
            if (instance.active) {
              this.layoutGlyphs(instance);
              this.showGlyphs(instance);
            } else {
              this.hideGlyphs(instance);
            }
          }

          if (changed[colorId] !== undefined) {
            this.updateGlyphColors(instance);
          }

          if (changed[originId] !== undefined) {
            this.updateGlyphOrigins(instance);
          }

          if (changed[fontSizeId] !== undefined) {
            instance.willCheckTruncation = true;
            instance.truncatedText = "";
            this.updateGlyphFontSizes(instance);
            this.layoutGlyphs(instance);
          }

          if (changed[maxWidthId] !== undefined) {
            instance.willCheckTruncation = true;
            instance.truncatedText = "";
            this.layoutGlyphs(instance);
          }
          break;

        case InstanceDiffType.INSERT:
          // Insertions force a full update of all glyphs for the label
          this.updateGlyphs(instance);
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
    // Glyphs must be established for the label to continue
    const glyphs = this.labelToGlyphs.get(instance);
    if (!glyphs || glyphs.length === 0) return;

    const fontMap = kerningRequest.fontMap;
    const layout = fontMap.getStringLayout(
      instance.truncatedText || instance.text,
      instance.fontSize,
      this.view.pixelRatio
    );

    // Let's now look to process truncation if it is needed for the label
    if (instance.willCheckTruncation && instance.maxWidth > 0) {
      if (!this.updateTruncation(instance, fontMap, layout)) {
        return;
      }
    }

    // Store the calculated size of the label
    instance.size = layout.size;
    // Update the calculated anchor for the label now that size is determined
    anchorCalculator[instance.anchor.type](instance.anchor, instance);
    const anchor = instance.anchor;

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
   * This ensures the correct number of glyphs is being provided for the label indicated.
   */
  updateGlyphs(instance: T) {
    // Make sure the kerning is updated for the label if needed. This also puts the label
    // in the correct state for showing or not showing it's glyphs
    this.updateKerning(instance);

    let currentGlyphs = this.labelToGlyphs.get(instance);
    const glyphText = instance.truncatedText || instance.text;
    const text = glyphText.replace(/\s/g, "");
    const sourceText = glyphText;

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
      let i = 0, iMax = Math.min(currentGlyphs.length, text.length);
      i < iMax;
      ++i
    ) {
      const glyph = currentGlyphs[i];

      if (glyph.character !== text[i]) {
        glyph.character = text[i];

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
    if (currentGlyphs.length < text.length) {
      let sourceIndex = 0;

      for (
        let i = currentGlyphs.length,
          iMax = text.length,
          iMax2 = sourceText.length;
        i < iMax && sourceIndex < iMax2;
        ++i, ++sourceIndex
      ) {
        const char = text[i];
        const glyph = new GlyphInstance({
          character: char,
          color: instance.color,
          origin: instance.origin,
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
    else if (currentGlyphs.length > text.length) {
      for (let i = text.length, iMax = currentGlyphs.length; i < iMax; ++i) {
        const glyph = currentGlyphs[i];
        this.glyphProvider.remove(glyph);
      }

      // Remove the glyphs from the list the label utilizes
      while (currentGlyphs.length > text.length) currentGlyphs.pop();
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
   * Updates all the glyph's font scale for a label.
   */
  updateGlyphFontSizes(instance: T) {
    const glyphs = instance.glyphs;
    if (!glyphs) return;
    const request = this.labelToKerningRequest.get(instance);
    if (!request) return;
    const fontMap = request.fontMap;
    if (!fontMap) return;

    // This is the font scale of the glyph based on the label's requested font size
    // vs the font resources rendered font size.
    const fontScale =
      instance.fontSize / fontMap.fontSource.size * this.view.pixelRatio;

    for (let i = 0, iMax = glyphs.length; i < iMax; ++i) {
      glyphs[i].fontScale = fontScale;
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
   * Checks the label to ensure calculated kerning supports the text specified.
   *
   * Returns true when the kerning information is already available
   */
  updateKerning(instance: T) {
    // Flag indicating this label is waiting for it's truncation kerning to be calculated
    let needsTruncationKerning = false;
    // A change in glyphs requires a potential kerning request
    let labelKerningRequest = this.labelToKerningRequest.get(instance);

    // Let's make sure truncation kerning is available and needed
    // A max width indicates truncation is needed for this label
    if (instance.maxWidth > 0) {
      // Check to see if the truncation characters have a kerning request made
      // If not, we must make one
      if (!this.truncationKerningRequest) {
        this.truncationKerningRequest = fontRequest({
          character: "",
          kerningPairs: this.props.truncation || DEFAULT_TRUNCATION
        });

        this.resource.request(this, instance, this.truncationKerningRequest, {
          resource: {
            type: ResourceType.FONT,
            key: this.props.resourceKey || ""
          }
        });

        needsTruncationKerning = true;
      }

      // If the request is made, then we must see if the request is complete
      else {
        needsTruncationKerning = Boolean(this.truncationKerningRequest.fontMap);
      }
    }

    const checkText = instance.truncatedText || instance.text;

    // If we have the label kerning request, we should check to see if the font map
    // supports the contents of the label.
    if (labelKerningRequest) {
      // If the request already embodies the request for the text, we just see if the
      // font map has been provided yet to indicate if the kerning information is ready
      if (labelKerningRequest.kerningPairs === checkText) {
        return Boolean(labelKerningRequest.fontMap) && !needsTruncationKerning;
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
        return !needsTruncationKerning;
      }
    }

    // If no request is present we must make one
    if (!labelKerningRequest) {
      // Make the request for retrieving the kerning information.
      labelKerningRequest = fontRequest({
        character: "",
        kerningPairs: checkText
      });

      // In order for the glyphs to be laid out, we need the font map to get the kerning information.
      // So we send out a request to the font manager for the resource.
      // Once the kerning information has been retrieved, the label active  property will be triggered
      // to true.
      this.resource.request(this, instance, labelKerningRequest, {
        resource: {
          type: ResourceType.FONT,
          key: this.props.resourceKey || ""
        }
      });

      this.labelToKerningRequest.set(instance, labelKerningRequest);

      return false;
    }

    return !needsTruncationKerning;
  }

  /**
   * Updates the truncation rendering of the text.
   */
  private updateTruncation(
    instance: T,
    fontMap: FontMap,
    layout: KernedLayout
  ) {
    // Flag the truncation check as being finished and not needed for minor changes
    instance.willCheckTruncation = false;
    // These are the characters to be used in truncated labels
    const truncation = this.props.truncation || DEFAULT_TRUNCATION;

    // If the label exceeds the specified maxWidth then truncation must take places
    if (layout.size[0] > instance.maxWidth) {
      // Make sure the truncation glyphs have been measured
      if (this.truncationWidth < 0) {
        const truncLayout = fontMap.getStringLayout(
          truncation,
          instance.fontSize,
          this.view.pixelRatio
        );

        this.truncationWidth = fontMap.getStringWidth(
          truncLayout,
          0,
          truncation.length
        );
      }

      // Now find a width of glyphs + the width of the truncation that will fit within the maxWidth
      // If the truncation width is wider than the max width, then let's just hide the label altogether
      if (this.truncationWidth > instance.maxWidth) {
        instance.active = false;
        return;
      }

      // Otherwise, let's do the search for the correct glyphs to show that will fit properly.
      // We will use a simple binary search to find the appropriate length to use.
      const maxWidth = instance.maxWidth;
      let left = 0;
      let right = layout.positions.length;
      let cursor = 0;
      let check = 0;
      let char = "";

      while (left !== right) {
        cursor = Math.floor((right - left) / 2) + left;
        char = layout.glyphs[cursor];
        check =
          layout.positions[cursor][0] +
          fontMap.glyphMap[char].pixelWidth +
          this.truncationWidth;

        if (check > maxWidth) right = cursor;
        else if (check < maxWidth) left = cursor;
        else break;

        if (Math.abs(left - right) <= 1) {
          if (check < maxWidth) break;
          cursor--;
          break;
        }
      }

      // Our cursor should now be pointing to the letter that will be our truncation point
      // We must make sure with the characters specified it does fit, if not, we only render
      // the truncation glyphs
      check =
        layout.positions[cursor][0] +
        fontMap.glyphMap[char].pixelWidth +
        this.truncationWidth;

      if (check < maxWidth) {
        // Loop through the text and find the glyph matching to the actual text with glyphs
        let glyphIndex = 0;
        let charIndex = 0;

        for (
          let i = 0, iMax = instance.text.length;
          i < iMax && glyphIndex <= cursor;
          ++i
        ) {
          const char = instance.text[i];

          charIndex++;
          if (!isWhiteSpace(char)) glyphIndex++;
        }

        instance.truncatedText = `${instance.text.substr(
          0,
          charIndex
        )}${truncation}`;
      } else {
        instance.truncatedText = truncation;
      }

      // Now that the truncated text is applied, we make sure the glyphs are up to date
      // and we make sure we have proper kerning support.
      this.updateGlyphs(instance);
      if (!this.updateKerning(instance)) return false;
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

    if (newProps.resourceKey !== this.props.resourceKey) {
      this.fullUpdate = true;
    }
  }
}
