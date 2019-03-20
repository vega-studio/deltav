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
  isWhiteSpace,
  ResourceType
} from "../../types";
import { IAutoEasingMethod } from "../../util/auto-easing-method";
import {
  add2,
  copy4,
  divide2,
  scale2,
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

        const topLeft = subtract2(label.position, anchorEffect);

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
          subtract2(label.position, divide2(anchorEffect, view.camera.scale))
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
        "position",
        "fontSize"
      ]);
    }

    const {
      text: textId,
      active: activeId,
      color: colorId,
      position: positionId,
      fontSize: fontSizeId
    } = this.propertyIds;

    for (let i = 0, iMax = changes.length; i < iMax; ++i) {
      const [instance, diffType, changed] = changes[i];

      switch (diffType) {
        case InstanceDiffType.CHANGE:
          // If text was changed, the glyphs all need updating of their characters and
          // possibly have glyphs added or removed to handle the issue.
          if (changed[textId] !== undefined) {
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

          if (changed[positionId] !== undefined) {
            this.updateGlyphPositions(instance);
          }

          if (changed[fontSizeId] !== undefined) {
            this.updateGlyphFontSizes(instance);
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
    waiting.delete(glyph);

    if (waiting.size <= 0) {
      // If the waiting list is empty we can get the label to execute it's ready handler
      const onReady = label.onReady;
      // Execute the callback if present
      if (onReady) onReady(label);
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
    const kerning = fontMap.kerning;
    const whiteSpaceKerning = this.props.whiteSpaceKerning || 10;

    // Calculate the scaling of the font which would be the font map's rendered glyph size
    // as a ratio to the label's desired font size.
    const fontScale =
      instance.fontSize / fontMap.fontSource.size * this.view.pixelRatio;

    // First we layout the glyphs based on kerning. We do not care where they should be located initially
    // We just lay them out in some fashion so we can understand the dimensions of the label itself.
    // The order of the glyphs is in correct order for how they are rendered for the label
    const glyph = glyphs[0];
    // First glyph is set to position zero
    glyph.offset = [0, 0];
    // Initialize the first glyph as the first left letter
    let leftGlyph = glyph;
    // Get the image so we can determine the min and max y of the glyphs
    let image = fontMap.glyphMap[glyph.character];
    // Start with the initial glyph dimensions as the min and max y the label will have
    let minY = 0;
    let maxY = image.pixelHeight;

    // Now loop through each letter and position each respective character away from the previous character
    // based on the kerning value
    for (let i = 1, iMax = glyphs.length; i < iMax; ++i) {
      // Get the next glyph to position
      const glyph = glyphs[i];
      // Make sure the font scale is up to date for the glyph
      glyph.fontScale = fontScale;
      // Retrieve the kerning for the glyph pair
      const kern = kerning[leftGlyph.character][glyph.character] || [0, 0];
      // Make the offset be relative to the previous glyph offset with the extra kerning to make
      // the layout of the glyphs relative to each other be correct.
      // We also add in the white space precedingg the glyph
      glyph.offset = add2(add2(leftGlyph.offset, scale2(kern, fontScale)), [
        glyph.whiteSpace * whiteSpaceKerning * fontScale,
        0
      ]);
      // Get the glyph rendering from the font map
      image = fontMap.glyphMap[glyph.character];
      // Use the offset and the rendering height to determine the top and bottom of the glyph
      minY = Math.min(glyph.offset[1], minY);
      maxY = Math.max(glyph.offset[1] + image.pixelHeight, maxY);
      // Make this processed glyph the next glyph that is 'to the left' for the next glyph
      leftGlyph = glyph;
    }

    // Now we have positioned all of our glyphs with relative kerning.
    // We can now get a width and height of the total label
    const height = maxY - minY;
    // The width is the last glyph's offset plus it's rendered width. We can use image
    // here for it's image as the last glyphs image after the loop will be stored here.
    const width =
      glyphs[glyphs.length - 1].offset[0] + image.pixelWidth * fontScale;
    // Update the instance with the calculated width of the label
    instance.size = [width, height];
    // Update the calculated anchor for the label now that size is determined
    anchorCalculator[instance.anchor.type](instance.anchor, instance);
    const anchor = instance.anchor;

    // Move all of the glyphs by -minY. This will effectively frame the label where the
    // top left is 0,0 relative to all of the contents of the label.
    // We also apply the calculated anchor at this time for the label
    for (let i = 0, iMax = glyphs.length; i < iMax; ++i) {
      const glyph = glyphs[i];
      glyph.offset[1] -= minY;
      glyph.anchor = [anchor.x || 0, anchor.y || 0];
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
    const text = instance.text.replace(/\s/g, "");
    const sourceText = instance.text;

    // Make sure we have glyph storage
    if (!currentGlyphs) {
      currentGlyphs = [];
      this.labelToGlyphs.set(instance, currentGlyphs);
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
        let sourceChar = sourceText[sourceIndex];
        const glyph = new GlyphInstance({
          character: char,
          color: instance.color,
          position: instance.position,
          onReady: this.handleGlyphReady
        });

        glyph.parentLabel = instance;
        currentGlyphs.push(glyph);

        // Gather the preceding whitespace of the glyph
        while (isWhiteSpace(sourceChar)) {
          glyph.whiteSpace++;
          sourceChar = sourceText[++sourceIndex];
        }

        if (instance.active) {
          this.glyphProvider.add(glyph);
        }

        let waiting = this.labelWaitingOnGlyph.get(instance);

        if (!waiting) {
          waiting = new Set();
          this.labelWaitingOnGlyph.set(instance, waiting);
        }

        waiting.add(glyph);
      }
    }

    // Remove excess glyphs
    else if (currentGlyphs.length > instance.text.length) {
      for (
        let i = instance.text.length, iMax = currentGlyphs.length;
        i < iMax;
        ++i
      ) {
        const glyph = currentGlyphs[i];
        this.glyphProvider.remove(glyph);
      }
    }

    // Update the list of glyphs that are utilized for the label's rendering
    instance.glyphs = currentGlyphs;
  }

  /**
   * Updates the glyph colors to match the label's glyph colors
   */
  updateGlyphColors(instance: T) {
    const glyphs = this.labelToGlyphs.get(instance);
    if (!glyphs) return;

    for (let i = 0, iMax = glyphs.length; i < iMax; ++i) {
      glyphs[i].color = copy4(instance.color);
    }
  }

  /**
   * Updates all the glyph's font scale for a label.
   */
  updateGlyphFontSizes(instance: T) {
    const glyphs = this.labelToGlyphs.get(instance);
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
  updateGlyphPositions(instance: T) {
    const glyphs = this.labelToGlyphs.get(instance);
    if (!glyphs) return;
    const position = instance.position;

    for (let i = 0, iMax = glyphs.length; i < iMax; ++i) {
      glyphs[i].position = [position[0], position[1]];
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
