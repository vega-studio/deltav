/**
 * TODO: This layer is still a WIP!
 */

import { LabelLayer } from "src/base-layers/labels/label-layer";
import { TextAreaInstance } from "src/base-layers/labels/text-area-instance";
import { InstanceProvider } from "../../instance-provider/instance-provider";
import { Bounds } from "../../primitives";
import { fontRequest } from "../../resources";
import { ILayerProps, Layer } from "../../surface/layer";
import {
  createLayer,
  ILayerConstructionClass,
  LayerInitializer
} from "../../surface/layer-surface";
import {
  InstanceDiffType,
  IProjection,
  isWhiteSpace,
  newLineRegEx,
  ResourceType
} from "../../types";
import { IAutoEasingMethod } from "../../util/auto-easing-method";
import {
  copy4,
  divide2,
  subtract2,
  Vec,
  Vec2
} from "../../util/vector";
import { Anchor, AnchorType } from "../types";
import { GlyphInstance } from "./glyph-instance";
import { GlyphLayer, IGlyphLayerOptions } from "./glyph-layer";
import { LabelInstance } from "./label-instance";

/**
 * This is a lookup to quickly find the proper calculation for setting the correct anchor
 * position based on the anchor type.
 */
const anchorCalculator: {
  [key: number]: (anchor: Anchor, label: TextAreaInstance) => void;
} = {
  [AnchorType.TopLeft]: (anchor: Anchor, _label: TextAreaInstance) => {
    anchor.x = -anchor.padding;
    anchor.y = -anchor.padding;
  },
  [AnchorType.TopMiddle]: (anchor: Anchor, label: TextAreaInstance) => {
    anchor.x = label.maxWidth / 2.0;
    anchor.y = -anchor.padding;
  },
  [AnchorType.TopRight]: (anchor: Anchor, label: TextAreaInstance) => {
    anchor.x = label.maxWidth + anchor.padding;
    anchor.y = -anchor.padding;
  },
  [AnchorType.MiddleLeft]: (anchor: Anchor, label: TextAreaInstance) => {
    anchor.x = -anchor.padding;
    anchor.y = label.maxHeight / 2;
  },
  [AnchorType.Middle]: (anchor: Anchor, label: TextAreaInstance) => {
    anchor.x = label.maxWidth / 2.0;
    anchor.y = label.maxHeight / 2.0;
  },
  [AnchorType.MiddleRight]: (anchor: Anchor, label: TextAreaInstance) => {
    anchor.x = label.maxWidth + anchor.padding;
    anchor.y = label.maxHeight / 2.0;
  },
  [AnchorType.BottomLeft]: (anchor: Anchor, label: TextAreaInstance) => {
    anchor.x = -anchor.padding;
    anchor.y = label.maxHeight + anchor.padding;
  },
  [AnchorType.BottomMiddle]: (anchor: Anchor, label: TextAreaInstance) => {
    anchor.x = label.maxWidth / 2.0;
    anchor.y = label.maxHeight + anchor.padding;
  },
  [AnchorType.BottomRight]: (anchor: Anchor, label: TextAreaInstance) => {
    anchor.x = label.maxWidth + anchor.padding;
    anchor.y = label.maxHeight + anchor.padding;
  },
  [AnchorType.Custom]: (anchor: Anchor, _label: TextAreaInstance) => {
    anchor.x = anchor.x || 0;
    anchor.y = anchor.y || 0;
  }
};

/**
 * Constructor props for making a new label layer
 */
export interface ITextAreaLayerProps<T extends LabelInstance>
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
  /** This number represents how much space each whitespace characters represents */
  whiteSpaceKerning?: number;
}

/**
 * This is a composite layer that will take in and manage Label Instances. The true instance
 * that will be rendered as a result of a Label Instance will simply be Glyph Instances. Hence
 * this is a composite layer that is merely a manager to split up the label's requested string
 * into Glyphs to render.
 */
export class TextAreaLayer<
  T extends TextAreaInstance,
  U extends ITextAreaLayerProps<T>
> extends Layer<T, U> {
  static defaultProps: ITextAreaLayerProps<TextAreaInstance> = {
    key: "",
    data: new InstanceProvider<TextAreaInstance>(),
    scene: "default"
  };

  /** Provider for the glyph layer this layer manages */
  labelProvider = new InstanceProvider<LabelInstance>();
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
   * Tracks all assigned labels to the text area
   */
  areaToLabels = new Map<TextAreaInstance, LabelInstance[]>();
  /**
   * Tracks the labels assigned to an area and are grouped by the line they appear within,
   */
  areaToLines = new Map<TextAreaInstance, LabelInstance[][]>();
  /**
   * This stores all of the glyphs the label is waiting on to fire the onReady event.
   */
  areaWaitingOnLabel = new Map<TextAreaInstance, Set<LabelInstance>>();

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
      createLayer(LabelLayer, {
        animate: this.props.animate,
        customGlyphLayer: this.props.customGlyphLayer,
        data: this.labelProvider,
        key: `${this.id}_labels`,
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
        "active",
        "alignment",
        "color",
        "fontSize",
        "lineHeight",
        "lineWrap",
        "origin",
        "text",
      ]);
    }

    const {
      text: textId,
      active: activeId,
      color: colorId,
      origin: originId,
      fontSize: fontSizeId,
      alignment: alignmentId,
      lineWrap: lineWrapId,
      lineHeight: lineHeightId,
    } = this.propertyIds;

    for (let i = 0, iMax = changes.length; i < iMax; ++i) {
      const [instance, diffType, changed] = changes[i];

      switch (diffType) {
        case InstanceDiffType.CHANGE:
          // If text was changed, the glyphs all need updating of their characters and
          // possibly have glyphs added or removed to handle the issue.
          if (changed[textId] !== undefined) {
            this.updateLabels(instance);
            this.layoutLabels(instance);
          } else if (changed[activeId] !== undefined) {
            if (instance.active) {
              this.layoutLabels(instance);
              this.showGlyphs(instance);
            } else {
              this.hideLabels(instance);
            }
          }

          if (changed[colorId] !== undefined) {
            this.updateGlyphColors(instance);
          }

          if (changed[originId] !== undefined) {
            this.updateGlyphOrigins(instance);
          }

          if (changed[fontSizeId] !== undefined) {
            this.updateGlyphFontSizes(instance);
          }
          break;

        case InstanceDiffType.INSERT:
          // Insertions force a full update of all glyphs for the label
          this.updateLabels(instance);
          break;

        case InstanceDiffType.REMOVE:
          const glyphs = this.areaToLabels.get(instance);

          if (glyphs) {
            for (let i = 0, iMax = glyphs.length; i < iMax; ++i) {
              this.labelProvider.remove(glyphs[i]);
            }

            this.areaToLabels.delete(instance);
            this.labelToKerningRequest.delete(instance);
            this.areaWaitingOnLabel.delete(instance);
          }
          break;
      }
    }
  }

  /**
   * When the glyph is ready to render this executes.
   */
  handleLabelReady = (label: LabelInstance) => {
    // The glyph must be associated to have this work
    if (!label.parentTextArea) {
      // If no parent text area, we should not have this glyph returningfalse alarms to this method
      delete label.onReady;

      return;
    }

    // Get the text area this label is a part of
    const textArea = label.parentTextArea;
    // Get the list of glyphs the label is waiting on.
    const waiting = this.areaWaitingOnLabel.get(textArea);

    if (!waiting) {
      return;
    }

    // Clear this glyph from the waiting list
    if (waiting.has(textArea)) {
      waiting.delete(textArea);

      if (waiting.size <= 0) {
        // If the waiting list is empty we can get the label to execute it's ready handler
        const onReady = textArea.onReady;
        // Execute the callback if present
        if (onReady) onReady(textArea);
      }
    }
  };

  /**
   * Unmounts all of the glyphs that make the lable
   */
  hideLabels(instance: T) {
    const labels = this.areaToLabels.get(instance);
    if (!labels) return;

    for (let i = 0, iMax = labels.length; i < iMax; ++i) {
      this.labelProvider.remove(labels[i]);
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
  layoutLabels(instance: T) {
    // Make sure the labels are all rendered
    const waiting = this.areaWaitingOnLabel.get(instance);
    if (waiting && waiting.size > 0) return;
    // Instance must be active
    if (!instance.active) return;
    // Glyphs must be established for the label to continue
    const labels = this.areaToLabels.get(instance);
    if (!labels || labels.length === 0) return;

    // This is the spacing between the labels for white spacing
    const whiteSpaceKerning = this.props.whiteSpaceKerning || 10;
    // Calculate the scaling of the font which would be the font map's rendered glyph size
    // as a ratio to the label's desired font size. This is already calculated for the glyphs of a label.
    const fontScale = labels[0].glyphs[0].fontScale;
  }

  /**
   * This layer does not have or use a buffer manager thus it must track management of an instance
   * in it's own way.
   */
  managesInstance(instance: T) {
    return Boolean(this.areaToLabels.get(instance));
  }

  /**
   * This makes a label's glyphs visible by adding them to the glyph layer rendering the glyphs.
   */
  showGlyphs(instance: T) {
    const glyphs = this.areaToLabels.get(instance);
    if (!glyphs) return;

    for (let i = 0, iMax = glyphs.length; i < iMax; ++i) {
      this.labelProvider.add(glyphs[i]);
    }
  }

  /**
   * This ensures the correct number of glyphs is being provided for the label indicated.
   */
  updateLabels(instance: T) {
    let currentLines = this.areaToLines.get(instance);
    const sourceLines = instance.text.split(newLineRegEx);

    // Make sure we have glyph storage
    if (!currentLines) {
      currentLines = [];
      this.areaToLines.set(instance, currentLines);
    }

    // Update the existing lines
    for (
      let i = 0, iMax = Math.min(currentLines.length, text.length);
      i < iMax;
      ++i
    ) {
      const glyph = currentLabels[i];

      if (glyph.character !== text[i]) {
        glyph.character = text[i];
      }
    }

    // Make any missing glyphs
    if (currentLabels.length < text.length) {
      let sourceIndex = 0;

      for (
        let i = currentLabels.length,
          iMax = text.length,
          iMax2 = sourceText.length;
        i < iMax && sourceIndex < iMax2;
        ++i, ++sourceIndex
      ) {
        const char = text[i];
        let sourceChar = sourceText[sourceIndex];
        const glyph = new GlyphInstance({
          character: char,
          color: instance.color,
          origin: instance.origin,
          onReady: this.handleLabelReady
        });

        glyph.parentLabel = instance;
        currentLabels.push(glyph);

        // Gather the preceding whitespace of the glyph
        while (isWhiteSpace(sourceChar)) {
          glyph.whiteSpace++;
          sourceChar = sourceText[++sourceIndex];
        }

        if (instance.active) {
          this.labelProvider.add(glyph);
        }

        let waiting = this.areaWaitingOnLabel.get(instance);

        if (!waiting) {
          waiting = new Set();
          this.areaWaitingOnLabel.set(instance, waiting);
        }

        waiting.add(glyph);
      }
    }

    // Remove excess glyphs
    else if (currentLabels.length > instance.text.length) {
      for (
        let i = instance.text.length, iMax = currentLabels.length;
        i < iMax;
        ++i
      ) {
        const glyph = currentLabels[i];
        this.labelProvider.remove(glyph);
      }
    }

    // Update the list of glyphs that are utilized for the label's rendering
    instance.glyphs = currentLabels;
  }

  /**
   * Updates the glyph colors to match the label's glyph colors
   */
  updateGlyphColors(instance: T) {
    const glyphs = this.areaToLabels.get(instance);
    if (!glyphs) return;

    for (let i = 0, iMax = glyphs.length; i < iMax; ++i) {
      glyphs[i].color = copy4(instance.color);
    }
  }

  /**
   * Updates all the glyph's font scale for a label.
   */
  updateGlyphFontSizes(instance: T) {
    const glyphs = this.areaToLabels.get(instance);
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
    const glyphs = this.areaToLabels.get(instance);
    if (!glyphs) return;
    const origin = instance.origin;

    for (let i = 0, iMax = glyphs.length; i < iMax; ++i) {
      glyphs[i].origin = [origin[0], origin[1]];
    }

    console.log("SIZE", instance.size);
    console.log("ANCHOR", instance.anchor.x, instance.anchor.y);
    console.log("ORIGIN", instance.origin);
  }

  /**
   * Checks the label to ensure calculated kerning supports the text specified.
   *
   * Returns true when the kerning information is already available
   */
  updateKerning(instance: T) {
    // A change in glyphs requires a potential kerning request
    let labelKerningRequest = this.labelToKerningRequest.get(instance);

    // If we have the label kerning request, we should check to see if the font map
    // supports the contents of the label.
    if (labelKerningRequest) {
      // If the request already embodies the request for the text, we just see if the
      // font map has been provided yet to indicate if the kerning information is ready
      if (labelKerningRequest.kerningPairs === instance.text) {
        return Boolean(labelKerningRequest.fontMap);
      }

      // If the request exists for a different text, and the font map does not support
      // the kerning needs of the text, then we must make a new request.
      if (
        labelKerningRequest.fontMap &&
        !labelKerningRequest.fontMap.supportsKerning(instance.text)
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
      // Make the request for retrieving the kerning information.
      labelKerningRequest = fontRequest({
        character: "",
        kerningPairs: instance.text
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
