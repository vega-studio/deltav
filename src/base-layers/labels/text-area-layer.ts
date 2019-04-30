/**
 * TODO: This layer is still a WIP!
 */

import { InstanceProvider } from "../../instance-provider/instance-provider";
import { Bounds } from "../../primitives";
import { ILayerProps, Layer } from "../../surface/layer";
import {
  createLayer,
  ILayerConstructionClass,
  LayerInitializer
} from "../../surface/layer-surface";
import { InstanceDiffType, IProjection } from "../../types";
import { IAutoEasingMethod } from "../../util/auto-easing-method";
import { copy4, divide2, subtract2, Vec, Vec2 } from "../../util/vector";
import { RectangleInstance, RectangleLayer } from "../rectangle";
import { ScaleMode } from "../types";
import { GlyphInstance } from "./glyph-instance";
import { IGlyphLayerOptions } from "./glyph-layer";
import { LabelInstance } from "./label-instance";
import { LabelLayer } from "./label-layer";
import {
  SpecialLetter,
  TextAreaInstance,
  WordWrap
} from "./text-area-instance";

/**
 * This is a lookup to quickly find the proper calculation for setting the correct anchor
 * position based on the anchor type.
 */
// const anchorCalculator: {
//   [key: number]: (anchor: Anchor, label: TextAreaInstance) => void;
// } = {
//   [AnchorType.TopLeft]: (anchor: Anchor, _label: TextAreaInstance) => {
//     anchor.x = -anchor.padding;
//     anchor.y = -anchor.padding;
//   },
//   [AnchorType.TopMiddle]: (anchor: Anchor, label: TextAreaInstance) => {
//     anchor.x = label.maxWidth / 2.0;
//     anchor.y = -anchor.padding;
//   },
//   [AnchorType.TopRight]: (anchor: Anchor, label: TextAreaInstance) => {
//     anchor.x = label.maxWidth + anchor.padding;
//     anchor.y = -anchor.padding;
//   },
//   [AnchorType.MiddleLeft]: (anchor: Anchor, label: TextAreaInstance) => {
//     anchor.x = -anchor.padding;
//     anchor.y = label.maxHeight / 2;
//   },
//   [AnchorType.Middle]: (anchor: Anchor, label: TextAreaInstance) => {
//     anchor.x = label.maxWidth / 2.0;
//     anchor.y = label.maxHeight / 2.0;
//   },
//   [AnchorType.MiddleRight]: (anchor: Anchor, label: TextAreaInstance) => {
//     anchor.x = label.maxWidth + anchor.padding;
//     anchor.y = label.maxHeight / 2.0;
//   },
//   [AnchorType.BottomLeft]: (anchor: Anchor, label: TextAreaInstance) => {
//     anchor.x = -anchor.padding;
//     anchor.y = label.maxHeight + anchor.padding;
//   },
//   [AnchorType.BottomMiddle]: (anchor: Anchor, label: TextAreaInstance) => {
//     anchor.x = label.maxWidth / 2.0;
//     anchor.y = label.maxHeight + anchor.padding;
//   },
//   [AnchorType.BottomRight]: (anchor: Anchor, label: TextAreaInstance) => {
//     anchor.x = label.maxWidth + anchor.padding;
//     anchor.y = label.maxHeight + anchor.padding;
//   },
//   [AnchorType.Custom]: (anchor: Anchor, _label: TextAreaInstance) => {
//     anchor.x = anchor.x || 0;
//     anchor.y = anchor.y || 0;
//   }
// };

function getOffsetY(text: string, map: Map<string, number>) {
  let offsetY = Number.MAX_SAFE_INTEGER;
  for (let i = 0, endi = text.length; i < endi; i++) {
    const c = text[i];
    const height = map.get(c);

    if (height === 0) {
      offsetY = 0;
    } else if (height && height < offsetY) {
      offsetY = height;
    }
  }

  return offsetY === Number.MAX_SAFE_INTEGER ? 0 : offsetY;
}

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
  /** Provider for the rectangle layer that renders the border of text area */
  recProvider = new InstanceProvider<RectangleInstance>();
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
  areaToLabels = new Map<TextAreaInstance, (LabelInstance | SpecialLetter)[]>();
  /**
   * Tracks the labels assigned to an area and are grouped by the line they appear within,
   */
  areaToLines = new Map<TextAreaInstance, LabelInstance[][]>();
  /**
   * This stores all of the glyphs the label is waiting on to fire the onReady event.
   */
  areaWaitingOnLabel = new Map<TextAreaInstance, Set<LabelInstance>>();
  /**
   * This stores the glyph to y offset map of each TextAreaInstance
   */
  areaToGlyphHeights = new Map<TextAreaInstance, Map<string, number>>();

  /**
   * We provide bounds and hit test information for the instances for this layer to allow for mouse picking
   * of elements
   */

  /* TO MODIFY */
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
    const animate = this.props.animate || {};
    return [
      createLayer(LabelLayer, {
        animate: this.props.animate,
        customGlyphLayer: this.props.customGlyphLayer,
        data: this.labelProvider,
        key: `${this.id}_labels`,
        resourceKey: this.props.resourceKey,
        scene: this.props.scene,
        scaleMode: ScaleMode.BOUND_MAX
      }),
      createLayer(RectangleLayer, {
        animate: {
          color: animate.color,
          location: animate.origin
        },
        data: this.recProvider,
        key: `${this.id}_border`,
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
        "maxWidth",
        "maxHeight",
        "origin",
        "text"
      ]);
    }

    const {
      text: textId,
      active: activeId,
      color: colorId,
      origin: originId,
      fontSize: fontSizeId,
      lineWrap: lineWrapId,
      lineHeight: lineHeightId,
      maxWidth: maxWidthId,
      maxHeight: maxHeightId
    } = this.propertyIds;

    for (let i = 0, iMax = changes.length; i < iMax; ++i) {
      const [instance, diffType, changed] = changes[i];

      switch (diffType) {
        case InstanceDiffType.CHANGE:
          // If text was changed, the glyphs all need updating of their characters and
          // possibly have glyphs added or removed to handle the issue.
          if (changed[textId] !== undefined) {
            this.updateLabels(instance);
            this.layout(instance);
          } else if (changed[activeId] !== undefined) {
            if (instance.active) {
              this.layout(instance);
              this.showLabels(instance);
            } else {
              this.hideLabels(instance);
            }
          }

          if (changed[colorId] !== undefined) {
            this.updateLabelColors(instance);
          }

          if (changed[originId] !== undefined) {
            this.updateLabelOrigins(instance);
          }

          if (changed[fontSizeId] !== undefined) {
            this.updateLabelFontSizes(instance);
          }

          if (changed[lineWrapId] !== undefined) {
            this.updateLabelLineWrap(instance);
          }

          if (changed[lineHeightId] !== undefined) {
            this.updateLabelLineHeight(instance);
          }

          if (changed[maxWidthId] !== undefined) {
            this.updateTextAreaSize(instance);
          }

          if (changed[maxHeightId] !== undefined) {
            this.updateTextAreaSize(instance);
          }
          break;

        case InstanceDiffType.INSERT:
          // Insertions force a full update of all labels for the text-area
          this.layout(instance);
          this.updateLabels(instance);
          break;

        case InstanceDiffType.REMOVE:
          const labels = this.areaToLabels.get(instance);

          if (labels) {
            for (let i = 0, iMax = labels.length; i < iMax; ++i) {
              const label = labels[i];
              if (label instanceof LabelInstance) {
                this.labelProvider.remove(label);
              }
            }

            this.areaToLabels.delete(instance);
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
      // If no parent text area, we should not have this glyph returning false alarms to this method
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

    // Clear this label from the waiting list
    if (waiting.has(label)) {
      waiting.delete(label);

      if (waiting.size <= 0) {
        textArea.active = true;
        // If the waiting list is empty we can get the label to execute it's ready handler
        const onReady = textArea.onReady;
        // Execute the callback if present
        if (onReady) onReady(textArea);
      }
    }
  };

  /**
   * Unmount all of the glyphs that make the label
   */
  hideLabels(instance: T) {
    const labels = this.areaToLabels.get(instance);
    if (!labels) return;

    for (let i = 0, iMax = labels.length; i < iMax; ++i) {
      const label = labels[i];
      if (label instanceof LabelInstance) {
        this.labelProvider.remove(label);
      }
    }
  }

  /**
   * Tell the system this layer is not providing any rendering IO information for the GPU to render.
   */
  initShader() {
    return null;
  }

  /** This updates textAreaInstance after lineWrap is changed */
  updateLabelLineWrap(instance: T) {
    const labels = instance.labels;

    // Set active and toShow of all labels to be true
    for (let i = 0, iMax = labels.length; i < iMax; ++i) {
      const label = labels[i];
      if (label instanceof LabelInstance) {
        label.toShow = true;
        label.active = true;
      }
    }

    // Clear all new labels
    for (let i = 0, iMax = instance.newLabels.length; i < iMax; ++i) {
      const label = instance.newLabels[i];
      this.labelProvider.remove(label);
    }

    instance.newLabels = [];
    this.layoutLabels(instance);
  }

  /** This updates textAreaInstance after lineHeight is changed */
  updateLabelLineHeight(instance: T) {
    const labels = instance.labels;

    // Set active and toShow of all labels to be true
    for (let i = 0, iMax = labels.length; i < iMax; ++i) {
      const label = labels[i];
      if (label instanceof LabelInstance) {
        label.toShow = true;
        label.active = true;
      }
    }

    // Clear all new labels
    for (let i = 0, iMax = instance.newLabels.length; i < iMax; ++i) {
      const label = instance.newLabels[i];
      this.labelProvider.remove(label);
    }

    instance.newLabels = [];

    this.layoutLabels(instance);
  }

  /** This updates textAreaInstance after textArea width or height is changed */
  updateTextAreaSize(instance: T) {
    const labels = instance.labels;
    if (!labels) return;

    // Set active and toShow of all labels to be true
    for (let i = 0, iMax = labels.length; i < iMax; ++i) {
      const label = labels[i];
      if (label instanceof LabelInstance) {
        label.toShow = true;
        label.active = true;
      }
    }

    // Clear all new labels
    for (let i = 0, iMax = instance.newLabels.length; i < iMax; ++i) {
      const label = instance.newLabels[i];
      this.labelProvider.remove(label);
    }

    instance.newLabels = [];

    // Clear all borders
    for (let i = 0, iMax = instance.borders.length; i < iMax; ++i) {
      const border = instance.borders[i];
      this.recProvider.remove(border);
    }

    instance.borders = [];

    this.layoutBorder(instance);
    this.layoutLabels(instance);
  }

  /** Layout the border of textAreaInstance */
  layoutBorder(instance: T) {
    const topBorder: RectangleInstance = new RectangleInstance({
      color: instance.color,
      height: 1,
      width: instance.maxWidth,
      x: instance.origin[0],
      y: instance.origin[1]
    });

    const leftBorder: RectangleInstance = new RectangleInstance({
      color: instance.color,
      height: instance.maxHeight,
      width: 1,
      x: instance.origin[0],
      y: instance.origin[1]
    });

    const rightBorder: RectangleInstance = new RectangleInstance({
      color: instance.color,
      height: instance.maxHeight,
      width: 1,
      x: instance.origin[0] + instance.maxWidth,
      y: instance.origin[1]
    });

    const bottomBorder: RectangleInstance = new RectangleInstance({
      color: instance.color,
      height: 1,
      width: instance.maxWidth,
      x: instance.origin[0],
      y: instance.origin[1] + instance.maxHeight
    });

    this.recProvider.add(topBorder);
    this.recProvider.add(leftBorder);
    this.recProvider.add(rightBorder);
    this.recProvider.add(bottomBorder);

    instance.borders.push(topBorder);
    instance.borders.push(leftBorder);
    instance.borders.push(rightBorder);
    instance.borders.push(bottomBorder);
  }

  /** Calculate the positions of labels */
  layoutLabels(instance: T) {
    const spaceWidth = this.props.whiteSpaceKerning || instance.fontSize / 2;

    let glyphToHeight = this.areaToGlyphHeights.get(instance);
    const heights: number[] = [];

    if (!glyphToHeight) {
      const charToHeight = new Map<string, number>();
      if (instance.labelForMap) {
        const glyphs = instance.labelForMap.glyphs;
        glyphs.forEach(glyph => {
          if (!charToHeight.has(glyph.character)) {
            const height = glyph.offset[1];
            charToHeight.set(glyph.character, height);
            heights.push(height);
          }
        });

        instance.labelForMap.active = false;
        instance.labelForMap.toShow = false;
      }
      glyphToHeight = charToHeight;
      this.areaToGlyphHeights.set(instance, charToHeight);
    }

    let currentX = 0;
    let currentY = 0;

    for (let i = 0, endi = instance.labels.length; i < endi; ++i) {
      const label = instance.labels[i];

      if (label instanceof LabelInstance) {
        label.toShow = true;
        const width = label.getWidth();

        // Make sure all the labels are within maxHeight
        if (currentY + instance.lineHeight <= instance.maxHeight) {
          // Whole label can be put within maxWidth
          if (currentX + width <= instance.maxWidth) {
            const offsetY = getOffsetY(label.text, glyphToHeight);
            label.origin = [
              instance.origin[0] + currentX,
              instance.origin[1] + currentY + offsetY
            ];
            currentX += width + spaceWidth;
          }
          // A label will be cut into two parts if label's width exceeds maxwidth
          else {
            const widthLeft = instance.maxWidth - currentX;
            const glyphWidths = label.glyphWidths;
            let index = glyphWidths.length - 1;
            const word = label.text;

            while (glyphWidths[index] > widthLeft) {
              index--;
            }

            // Some part of label stay in this line
            if (index >= 0) {
              label.active = false;
              label.toShow = false;
              // Label1
              const text1 = word.substring(0, index + 1);
              const offsetY1 = getOffsetY(text1, glyphToHeight);

              const label1 = new LabelInstance({
                color: instance.color,
                fontSize: instance.fontSize,
                origin: [
                  instance.origin[0] + currentX,
                  instance.origin[1] + currentY + offsetY1
                ],
                text: text1
              });

              label1.size = [glyphWidths[index], label.size[1]];
              const widths: number[] = [];
              for (let i = 0; i <= index; i++) widths.push(glyphWidths[i]);
              label1.glyphWidths = widths;
              console.warn(
                `label1 ${label1.text} size ${label1.size}, widths ${
                  label1.glyphWidths
                }`
              );
              this.labelProvider.add(label1);
              instance.newLabels.push(label1);

              // New Line if word wrap mode is normal
              if (instance.lineWrap === WordWrap.NORMAL) {
                currentY += instance.lineHeight;
                currentX = 0;

                // Label2
                if (currentY + instance.lineHeight <= instance.maxHeight) {
                  const text2 = word.substring(index + 1);
                  const offsetY2 = getOffsetY(text2, glyphToHeight);
                  const label2 = new LabelInstance({
                    color: instance.color,
                    fontSize: instance.fontSize,
                    origin: [
                      instance.origin[0] + currentX,
                      instance.origin[1] + currentY + offsetY2
                    ],
                    text: text2
                  });

                  // set size
                  label2.size = [
                    glyphWidths[glyphWidths.length - 1] - glyphWidths[index],
                    label.size[1]
                  ];

                  const widths: number[] = [];
                  for (let i = index + 1; i < glyphWidths.length; i++) {
                    widths.push(glyphWidths[i] - glyphWidths[index]);
                  }

                  label2.glyphWidths = widths;

                  console.warn(
                    `label2 ${label2.text} size ${label2.size}, widths ${
                      label2.glyphWidths
                    }`
                  );
                  // set glyphs
                  this.labelProvider.add(label2);
                  instance.newLabels.push(label2);

                  currentX += label2.getWidth() + spaceWidth;
                }
              }
              // If wordWrap is NONE, stay in the line
              else if (instance.lineWrap === WordWrap.NONE) {
                currentX += label1.getWidth() + spaceWidth;
              }
            }
            // The whole word should move to next line or set active false
            else {
              if (instance.lineWrap === WordWrap.NORMAL) {
                // New Line
                currentY += instance.lineHeight;
                currentX = 0;

                if (currentY + instance.lineHeight < instance.maxHeight) {
                  const offsetY = getOffsetY(label.text, glyphToHeight);
                  label.origin = [
                    instance.origin[0] + currentX,
                    instance.origin[1] + currentY + offsetY
                  ];

                  currentX += label.getWidth() + spaceWidth;
                } else {
                  label.active = false;
                  label.toShow = false;
                }
              } else if (instance.lineWrap === WordWrap.NONE) {
                label.active = false;
                label.toShow = false;
              }
            }
          }
        } else {
          label.active = false;
          label.toShow = false;
        }
      }
      // New line
      else if (label === SpecialLetter.NEWLINE) {
        currentX = 0;
        currentY += instance.lineHeight;
      }
    }
  }

  /**
   * This uses calculated kerning information to place the glyph relative to it's left character neighbor.
   * The first glyph will use metrics of the glyphs drop down amount to determine where the glyph
   * will be placed.
   */
  layout(instance: T) {
    // Make sure the labels are all rendered
    const waiting = this.areaWaitingOnLabel.get(instance);
    if (waiting && waiting.size > 0) return;
    // Instance must be active
    if (!instance.active) return;
    // Glyphs must be established for the label to continue
    const labels = this.areaToLabels.get(instance);
    if (!labels || labels.length === 0) return;

    this.updateLabels(instance);
    this.layoutBorder(instance);
    this.layoutLabels(instance);
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
  showLabels(instance: T) {
    const labels = this.areaToLabels.get(instance);
    if (!labels) return;

    for (let i = 0, iMax = labels.length; i < iMax; ++i) {
      const label = labels[i];
      if (label instanceof LabelInstance) {
        this.labelProvider.add(label);
      }
    }
  }

  /**
   * This ensures the correct number of glyphs is being provided for the label indicated.
   */
  updateLabels(instance: T) {
    let currentLabels = this.areaToLabels.get(instance);

    if (!currentLabels) {
      currentLabels = [];
      this.areaToLabels.set(instance, currentLabels);
    }

    let waiting = this.areaWaitingOnLabel.get(instance);

    if (!waiting) {
      waiting = new Set();
      this.areaWaitingOnLabel.set(instance, waiting);
    }

    // Create labelForMap
    if (!instance.labelForMap) {
      // Generate the text for the label
      let mapText = "";
      const set: Set<string> = new Set<string>();
      for (let i = 0; i < instance.text.length; i++) {
        const c = instance.text[i];
        if (!set.has(c)) {
          mapText += c;
          set.add(c);
        }
      }
      set.clear();

      const label = new LabelInstance({
        color: instance.color,
        fontSize: instance.fontSize,
        origin: [0, 0],
        text: mapText,
        onReady: this.handleLabelReady
      });

      this.labelProvider.add(label);
      instance.labelForMap = label;
    }

    const labelsToLayout = instance.labelsToLayout;

    if (currentLabels.length < labelsToLayout.length) {
      for (
        let i = currentLabels.length, iMax = labelsToLayout.length;
        i < iMax;
        ++i
      ) {
        const word = labelsToLayout[i].text;

        if (word === "/n") {
          currentLabels.push(SpecialLetter.NEWLINE);
        } else {
          const position = labelsToLayout[i].position;
          const label = new LabelInstance({
            color: instance.color,
            fontSize: instance.fontSize,
            origin: position,
            text: word,
            onReady: this.handleLabelReady
          });

          label.parentTextArea = instance;
          currentLabels.push(label);

          if (instance.active) {
            //
          }
          /* Right now, I just added it */
          this.labelProvider.add(label);

          waiting.add(label);
        }
      }
    }

    instance.labels = currentLabels;
  }

  /**
   * Updates the label colors to match the label's label colors
   */
  updateLabelColors(instance: T) {
    const labels = this.areaToLabels.get(instance);
    if (!labels) return;

    for (let i = 0, iMax = labels.length; i < iMax; ++i) {
      const label = labels[i];
      if (label instanceof LabelInstance) {
        label.color = copy4(instance.color);
      }
    }

    for (let i = 0, endi = instance.newLabels.length; i < endi; ++i) {
      instance.newLabels[i].color = copy4(instance.color);
    }

    for (let i = 0, endi = instance.borders.length; i < endi; ++i) {
      instance.borders[i].color = copy4(instance.color);
    }
  }

  /**
   * Updates fontsize of all labels
   */
  updateLabelFontSizes(instance: T) {
    const labels = instance.labels;

    // Set fontSize of all labels
    if (instance.labelForMap) {
      instance.labelForMap.fontSize = instance.fontSize;
    }

    for (let i = 0, iMax = labels.length; i < iMax; ++i) {
      const label = labels[i];
      if (label instanceof LabelInstance) {
        label.active = true;
        label.fontSize = instance.fontSize;
      }
    }

    this.areaToLabels.set(instance, labels);
    instance.labels = labels;

    // Clear new labels
    for (let i = 0, iMax = instance.newLabels.length; i < iMax; ++i) {
      const label = instance.newLabels[i];
      this.labelProvider.remove(label);
    }

    instance.newLabels = [];

    const oldFontSize = instance.oldFontSize;
    const newFontSize = instance.fontSize;

    // Calculate size of all labels
    instance.labels.forEach(label => {
      if (label instanceof LabelInstance) {
        label.active = true;

        label.size = [
          label.size[0] * newFontSize / oldFontSize,
          label.size[1] * newFontSize / oldFontSize
        ];

        // glyphWidths update
        for (let i = 0, endi = label.glyphWidths.length; i < endi; ++i) {
          label.glyphWidths[i] *= newFontSize / oldFontSize;
        }
      }
    });

    // Map Update
    const glyphToHeights = this.areaToGlyphHeights.get(instance);
    if (glyphToHeights) {
      glyphToHeights.forEach((value, key) => {
        const newValue = value * newFontSize / oldFontSize;
        glyphToHeights.set(key, newValue);
      });
      this.areaToGlyphHeights.set(instance, glyphToHeights);
    }

    instance.oldFontSize = instance.fontSize;

    this.layoutLabels(instance);
  }

  /**
   * This updates all of the labels for the label to have the same position
   * as the label.
   */
  updateLabelOrigins(instance: T) {
    const labels = this.areaToLabels.get(instance);
    if (!labels) return;
    const origin = instance.origin;
    const oldOrigin = instance.oldOrigin;

    // Update new origins of all labels
    for (let i = 0, iMax = labels.length; i < iMax; ++i) {
      const label = labels[i];
      if (label instanceof LabelInstance) {
        const labelOrigin = label.origin;
        label.origin = [
          labelOrigin[0] + origin[0] - oldOrigin[0],
          labelOrigin[1] + origin[1] - oldOrigin[1]
        ];
      }
    }

    // Update new origins of all new labels
    for (let i = 0, iMax = instance.newLabels.length; i < iMax; ++i) {
      const label = instance.newLabels[i];
      if (label instanceof LabelInstance) {
        const labelOrigin = label.origin;
        label.origin = [
          labelOrigin[0] + origin[0] - oldOrigin[0],
          labelOrigin[1] + origin[1] - oldOrigin[1]
        ];
      }
    }

    // Update all borders new location
    for (let i = 0, iMax = instance.borders.length; i < iMax; ++i) {
      const border = instance.borders[i];
      border.x += origin[0] - oldOrigin[0];
      border.y += origin[1] - oldOrigin[1];
    }

    instance.oldOrigin = instance.origin;
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
