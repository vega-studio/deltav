import { fontRequest, IFontResourceRequest } from "../../../src/resources";
import { InstanceProvider } from "../../instance-provider/instance-provider";
import { Bounds } from "../../primitives";
import { ILayerProps, Layer } from "../../surface/layer";
import {
  createLayer,
  ILayerConstructionClass,
  LayerInitializer
} from "../../surface/layer-surface";
import {
  InstanceDiffType,
  IProjection,
  newLineRegEx,
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
import { RectangleInstance, RectangleLayer } from "../rectangle";
import { ScaleMode } from "../types";
import { GlyphInstance } from "./glyph-instance";
import { IGlyphLayerOptions } from "./glyph-layer";
import { LabelInstance } from "./label-instance";
import { LabelLayer } from "./label-layer";
import {
  NewLineCharacterMode,
  TextAlignment,
  TextAreaInstance,
  TextAreaLabel,
  WordWrap
} from "./text-area-instance";

/**
 * Get the offsetY of a word by comparing offsetYs of all its letters. So we can put the word to the
 * the right position.
 */
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
 * Split words from a text by space and new line sign
 */
function generateWords(text: string): string[] {
  const wordsToLayout: string[] = [];
  const lines: string[] = text.split(newLineRegEx);

  for (let i = 0, endi = lines.length - 1; i < endi; i++) {
    const line = lines[i];
    const wordsInLine = line.split(" ");

    wordsInLine.forEach(word => {
      if (word !== "") {
        wordsToLayout.push(word);
      }
    });

    // Create an element with text "/n" to indicate a new line will be created
    wordsToLayout.push("/n");
  }

  const lastLine = lines[lines.length - 1];
  const wordsInLine = lastLine.split(" ");

  wordsInLine.forEach(word => {
    if (word !== "") {
      wordsToLayout.push(word);
    }
  });

  return wordsToLayout;
}

/**
 * Generate the map for every glyph to offsetY, then we can use info to get correct offsetY for
 * every label by checking all the letters' offsetY of a label.
 */
function generateGlyphOffsetYMap(
  instance: TextAreaInstance,
  kerningRequest: IFontResourceRequest
) {
  const glyphToOffsetY = new Map<string, number>();

  if (kerningRequest.fontMap) {
    const sourceFontSize = kerningRequest.fontMap.fontSource.size;
    const fontScale = instance.fontSize / sourceFontSize;
    const fontMap = kerningRequest.fontMap;
    const checkText = instance.text.replace(/\s/g, "");
    let minY = Number.MAX_SAFE_INTEGER;
    let offsetY = 0;
    let kernY;
    let leftChar = "";

    for (let i = 0, iMax = checkText.length; i < iMax; ++i) {
      const char = checkText[i];
      kernY = 0;

      if (leftChar) {
        kernY = fontMap.kerning[leftChar][char][1] || 0;
      }

      offsetY = offsetY + kernY * fontScale;
      glyphToOffsetY.set(char, offsetY);
      minY = Math.min(offsetY, minY);
      leftChar = char;
    }

    glyphToOffsetY.forEach((value, key) => {
      glyphToOffsetY.set(key, value - minY);
    });
  }

  return glyphToOffsetY;
}

/**
 * Generate glyphWidths for a label in a TextAreaInstance. It stores the widths of the first letter,
 * width of the first two letters, width of the first three letters untill the width of the label.
 * It will help to know where to wrap a word in character wordwrap mode.
 */
function getGlyphWidths(
  label: LabelInstance,
  instance: TextAreaInstance,
  kerningRequest: IFontResourceRequest
) {
  const glyphWidths = [];
  const sourceFontSize = kerningRequest.fontMap
    ? kerningRequest.fontMap.fontSource.size
    : instance.fontSize;

  const fontScale = instance.fontSize / sourceFontSize;

  let leftChar = "";
  let currentWidth = 0;
  let offset: Vec2 = [0, 0];

  for (let i = 0, iMax = label.text.length; i < iMax; i++) {
    const char = label.text[i];

    if (kerningRequest.fontMap) {
      let kern: Vec2 = [0, 0];

      if (leftChar) {
        kern = kerningRequest.fontMap.kerning[leftChar][char] || [0, 0];
      }

      offset = add2(offset, scale2(kern, fontScale));
      if (i !== 0) offset = add2(offset, [instance.letterSpacing, 0]);
      const image = kerningRequest.fontMap.glyphMap[char];
      currentWidth = offset[0] + image.pixelWidth * fontScale;
      glyphWidths.push(currentWidth);
      leftChar = char;
    }
  }

  return glyphWidths;
}

/**
 * Constructor props for making a new label layer
 */
export interface ITextAreaLayerProps<T extends LabelInstance>
  extends ILayerProps<T> {
  /** Animation methods for various properties of the glyphs */
  animateLabel?: {
    anchor?: IAutoEasingMethod<Vec>;
    color?: IAutoEasingMethod<Vec>;
    offset?: IAutoEasingMethod<Vec>;
    origin?: IAutoEasingMethod<Vec>;
  };
  /** Animation methods fro various properties of the borders */
  animateBorder?: {
    color?: IAutoEasingMethod<Vec>;
    location?: IAutoEasingMethod<Vec>;
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

  providers = {
    /** Provider for the label layer this layer manages */
    labels: new InstanceProvider<LabelInstance>(),
    /** Provider for the rectangle layer that renders the border of text area */
    rectangles: new InstanceProvider<RectangleInstance>()
  };

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
  /** Tracks all assigned labels to the text area */
  areaToLabels = new Map<TextAreaInstance, TextAreaLabel[]>();
  /** Tracks the labels assigned to an area and are grouped by the line they appear within */
  areaToLines = new Map<TextAreaInstance, LabelInstance[][]>();
  /** This stores all of the glyphs the label is waiting on to fire the onReady event. */
  areaWaitingOnLabel = new Map<TextAreaInstance, Set<LabelInstance>>();
  /** This stores kerningRequest of TextAreaInstance */
  areaTokerningRequest = new Map<TextAreaInstance, IFontResourceRequest>();
  /** This stores splited words of a textArea */
  areaToWords = new Map<TextAreaInstance, string[]>();

  labelsInLine: LabelInstance[] = [];

  /**
   * We provide bounds and hit test information for the instances for this layer to allow for mouse picking
   * of elements
   */
  getInstancePickingMethods() {
    return {
      // Provide the calculated AABB world bounds for a given image
      boundsAccessor: (TextArea: T) => {
        const anchorEffect: Vec2 = [0, 0];

        if (TextArea.anchor) {
          anchorEffect[0] = TextArea.anchor.x || 0;
          anchorEffect[1] = TextArea.anchor.y || 0;
        }

        const topLeft = subtract2(TextArea.origin, anchorEffect);

        return new Bounds({
          height: TextArea.maxHeight,
          width: TextArea.maxWidth,
          x: topLeft[0],
          y: topLeft[1]
        });
      },

      // Provide a precise hit test for the circle
      hitTest: (TextArea: T, point: Vec2, view: IProjection) => {
        // If we never allow the image to scale, then the bounds will grow and shrink to counter the effects
        // Of the camera zoom
        // The location is within the world, but we reverse project the anchor spread
        const anchorEffect: Vec2 = [0, 0];

        if (TextArea.anchor) {
          anchorEffect[0] = TextArea.anchor.x || 0;
          anchorEffect[1] = TextArea.anchor.y || 0;
        }

        const topLeft = view.worldToScreen(
          subtract2(TextArea.origin, divide2(anchorEffect, view.camera.scale))
        );

        const screenPoint = view.worldToScreen(point);

        // Reverse project the size and we should be within the distorted world coordinates
        const bounds = new Bounds({
          height: TextArea.maxHeight,
          width: TextArea.maxWidth,
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
    const animateLabel = this.props.animateLabel || {};
    const animateBorder = this.props.animateBorder || {};

    return [
      createLayer(LabelLayer, {
        animate: animateLabel,
        customGlyphLayer: this.props.customGlyphLayer,
        data: this.providers.labels,
        key: `${this.id}.labels`,
        resourceKey: this.props.resourceKey,
        scene: this.props.scene,
        scaleMode: ScaleMode.BOUND_MAX
      }),
      createLayer(RectangleLayer, {
        animate: {
          color: animateBorder.color,
          location: animateBorder.location
        },
        data: this.providers.rectangles,
        key: `${this.id}.border`,
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
        "borderWidth",
        "color",
        "fontSize",
        "hasBorder",
        "letterSpacing",
        "lineHeight",
        "maxHeight",
        "maxWidth",
        "origin",
        "padding",
        "text",
        "wordWrap"
      ]);
    }

    const {
      active: activeId,
      alignment: alignmentId,
      borderWidth: borderWidthId,
      color: colorId,
      fontSize: fontSizeId,
      hasBorder: hasBorderId,
      letterSpacing: letterSpacingId,
      lineHeight: lineHeightId,
      maxHeight: maxHeightId,
      maxWidth: maxWidthId,
      origin: originId,
      padding: paddingId,
      text: textId,
      wordWrap: wordWrapId
    } = this.propertyIds;

    for (let i = 0, iMax = changes.length; i < iMax; ++i) {
      const [instance, diffType, changed] = changes[i];

      switch (diffType) {
        case InstanceDiffType.CHANGE:
          // Perform the insert action instead of the change if the textArea has never been registered
          if (!this.areaToLabels.get(instance)) {
            this.insert(instance);
            continue;
          }
          // If text was changed, the glyphs all need updating of their characters and
          // possibly have glyphs added or removed to handle the issue.
          if (changed[textId] !== undefined) {
            this.clear(instance);
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

          if (changed[alignmentId] !== undefined) {
            this.clear(instance);
            this.updateLabels(instance);
            this.layoutLabels(instance);
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

          if (changed[wordWrapId] !== undefined) {
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

          if (changed[paddingId] !== undefined) {
            this.updateTextAreaSize(instance);
          }

          if (changed[borderWidthId] !== undefined) {
            this.updateBorderWidth(instance);
          }

          if (changed[hasBorderId] !== undefined) {
            this.updateBorder(instance);
          }

          if (changed[letterSpacingId] !== undefined) {
            this.updateLetterSpacing(instance);
          }

          break;

        case InstanceDiffType.INSERT:
          // Insertions force a full update of all labels for the text-area
          this.insert(instance);
          break;

        case InstanceDiffType.REMOVE:
          const labels = this.areaToLabels.get(instance);

          if (labels) {
            for (let i = 0, iMax = labels.length; i < iMax; ++i) {
              const label = labels[i];
              if (label instanceof LabelInstance) {
                this.providers.labels.remove(label);
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
   * Handles insertion operation for the textArea
   */
  private insert(instance: T) {
    this.layout(instance);
    this.updateLabels(instance);
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
        this.providers.labels.remove(label);
      }
    }
  }

  /**
   * Tell the system this layer is not providing any rendering IO information for the GPU to render.
   */
  initShader() {
    return null;
  }

  /** When text is changed, labels should be clear in order to generate new labels */
  clear(instance: T) {
    const labels = instance.labels;

    for (let i = 0, iMax = labels.length; i < iMax; i++) {
      const label = labels[i];
      if (label instanceof LabelInstance) {
        this.providers.labels.remove(label);
      }
    }

    instance.labels = [];
    const newLabels = instance.newLabels;

    for (let i = 0, iMax = newLabels.length; i < iMax; i++) {
      const label = newLabels[i];
      if (label instanceof LabelInstance) {
        this.providers.labels.remove(label);
      }
    }

    instance.newLabels = [];
    this.areaToLabels.delete(instance);
    this.areaWaitingOnLabel.delete(instance);
    this.areaToWords.delete(instance);
  }

  /** When a label exceeds the maxWidth of a textArea, sperate it into several parts */
  seperateLabel(
    instance: TextAreaInstance,
    label: LabelInstance,
    glyphToHeight: Map<string, number>,
    word: string,
    index: number,
    currentX: number,
    currentY: number,
    spaceWidth: number,
    glyphWidths: number[]
    // labelsInLine: LabelInstance[]
  ): [number, number] {
    const topPadding = instance.padding[0];
    const rightPadding = instance.padding[1] || 0;
    const bottomPadding = instance.padding[2] || 0;
    const leftPadding = instance.padding[3] || 0;
    const maxWidth = instance.maxWidth - leftPadding - rightPadding;
    const maxHeight = instance.maxHeight - topPadding - bottomPadding;
    const originX = instance.origin[0] + leftPadding;
    const originY = instance.origin[1] + topPadding;

    label.active = false;

    // Label1
    const text1 = word.substring(0, index + 1);
    const offsetY1 = getOffsetY(text1, glyphToHeight);

    const label1 = new LabelInstance({
      color: instance.color,
      fontSize: instance.fontSize,
      letterSpacing: instance.letterSpacing,
      origin: [originX + currentX, originY + currentY + offsetY1],
      text: text1
    });

    label1.size = [glyphWidths[index], label.size[1]];
    this.providers.labels.add(label1);
    instance.newLabels.push(label1);

    this.labelsInLine.push(label1);
    currentX += label1.getWidth() + spaceWidth;

    // New Line if word wrap mode is normal
    if (
      instance.wordWrap === WordWrap.CHARACTER ||
      instance.wordWrap === WordWrap.WORD
    ) {
      this.setTextAlignment(currentX, spaceWidth, maxWidth, instance.alignment);

      currentX = 0;
      currentY += instance.lineHeight;

      // Label2
      if (currentY + instance.lineHeight <= maxHeight) {
        let widthLeft =
          glyphWidths[glyphWidths.length - 1] - glyphWidths[index];

        while (
          widthLeft > maxWidth &&
          currentY + instance.lineHeight <= maxHeight
        ) {
          // currentX = 0;
          let lastIndexOfLine = glyphWidths.length - 1;

          // Get the lastIndex in a label that stay in current line
          while (glyphWidths[lastIndexOfLine] - glyphWidths[index] > maxWidth) {
            lastIndexOfLine--;
          }

          const text = word.substring(index + 1, lastIndexOfLine + 1);
          const offsetY = getOffsetY(text, glyphToHeight);
          const label3 = new LabelInstance({
            color: instance.color,
            fontSize: instance.fontSize,
            letterSpacing: instance.letterSpacing,
            origin: [originX + currentX, originY + currentY + offsetY],
            text
          });

          label3.size = [
            glyphWidths[lastIndexOfLine] - glyphWidths[index],
            label.size[1]
          ];

          currentX += label3.getWidth() + spaceWidth;

          this.labelsInLine.push(label3);

          this.providers.labels.add(label3);
          instance.newLabels.push(label3);

          this.setTextAlignment(
            currentX,
            spaceWidth,
            maxWidth,
            instance.alignment
          );

          currentX = 0;
          currentY += instance.lineHeight;
          index = lastIndexOfLine;
          widthLeft = glyphWidths[glyphWidths.length - 1] - glyphWidths[index];
        }

        if (currentY + instance.lineHeight <= maxHeight) {
          const text2 = word.substring(index + 1);
          const offsetY2 = getOffsetY(text2, glyphToHeight);
          const label2 = new LabelInstance({
            color: instance.color,
            fontSize: instance.fontSize,
            letterSpacing: instance.letterSpacing,
            origin: [originX + currentX, originY + currentY + offsetY2],
            text: text2
          });

          label2.size = [
            glyphWidths[glyphWidths.length - 1] - glyphWidths[index],
            label.size[1]
          ];

          this.labelsInLine.push(label2);

          const widths: number[] = [];

          for (let i = index + 1; i < glyphWidths.length; i++) {
            widths.push(glyphWidths[i] - glyphWidths[index]);
          }

          this.providers.labels.add(label2);
          instance.newLabels.push(label2);

          currentX += label2.getWidth() + spaceWidth;
        }
      }
    }

    // If wordWrap is NONE, stay in the line
    else if (instance.wordWrap === WordWrap.NONE) {
      currentX += label1.getWidth() + spaceWidth;
    }

    return [currentX, currentY];
  }

  /**
   * This updates textAreaInstance after lineWrap is changed
   */
  updateLabelLineWrap(instance: T) {
    const labels = this.areaToLabels.get(instance);
    if (!labels) return;

    // Set active of all labels to be true in order to awake those hidden labels when wrapping word
    for (let i = 0, iMax = labels.length; i < iMax; ++i) {
      const label = labels[i];
      if (label instanceof LabelInstance) {
        label.active = true;
      }
    }

    // Clear all new labels
    for (let i = 0, iMax = instance.newLabels.length; i < iMax; ++i) {
      const label = instance.newLabels[i];
      this.providers.labels.remove(label);
    }

    instance.newLabels = [];
    this.layoutLabels(instance);
  }

  /**
   * This updates textAreaInstance after lineHeight is changed
   */
  updateLabelLineHeight(instance: T) {
    const labels = this.areaToLabels.get(instance);
    if (!labels) return;

    // Set active of all labels to be true in order to awake those hidden labels when wrapping word
    for (let i = 0, iMax = labels.length; i < iMax; ++i) {
      const label = labels[i];
      if (label instanceof LabelInstance) {
        label.active = true;
      }
    }

    // Clear all new labels
    for (let i = 0, iMax = instance.newLabels.length; i < iMax; ++i) {
      const label = instance.newLabels[i];
      this.providers.labels.remove(label);
    }

    instance.newLabels = [];
    this.layoutLabels(instance);
  }

  /**
   * This updates textAreaInstance after textArea width or height is changed
   */
  updateTextAreaSize(instance: T) {
    const labels = this.areaToLabels.get(instance);
    if (!labels) return;

    // Set active of all labels to be true in order to awake those hidden labels when wrapping word
    for (let i = 0, iMax = labels.length; i < iMax; ++i) {
      const label = labels[i];
      if (label instanceof LabelInstance) {
        label.active = true;
      }
    }

    // Clear all new labels
    for (let i = 0, iMax = instance.newLabels.length; i < iMax; ++i) {
      const label = instance.newLabels[i];
      this.providers.labels.remove(label);
    }

    instance.newLabels = [];

    // Clear all borders
    for (let i = 0, iMax = instance.borders.length; i < iMax; ++i) {
      const border = instance.borders[i];
      this.providers.rectangles.remove(border);
    }

    instance.borders = [];
    this.layoutBorder(instance);
    this.layoutLabels(instance);
  }

  /**
   * Update thickness of border
   */
  updateBorderWidth(instance: T) {
    // Clear all borders
    for (let i = 0, iMax = instance.borders.length; i < iMax; ++i) {
      const border = instance.borders[i];
      this.providers.rectangles.remove(border);
    }

    instance.borders = [];
    this.layoutBorder(instance);
  }

  /**
   * Update the border of textArea to remove border or add border
   */
  updateBorder(instance: T) {
    if (instance.hasBorder) {
      this.layoutBorder(instance);
    } else {
      for (let i = 0, iMax = instance.borders.length; i < iMax; ++i) {
        const border = instance.borders[i];
        this.providers.rectangles.remove(border);
      }

      instance.borders = [];
    }
  }

  /**
   * Update letterSpacing of all labels in textArea
   */
  updateLetterSpacing(instance: T) {
    this.clear(instance);
    this.updateLabels(instance);
    this.layout(instance);
  }

  /**
   * Sets the alignment of TextArea by adjusting all the labels' origin
   */
  setTextAlignment(
    currentX: number,
    spaceWidth: number,
    maxWidth: number,
    alignment: TextAlignment
  ) {
    if (currentX - spaceWidth < maxWidth) {
      if (alignment !== TextAlignment.LEFT) {
        const offset = maxWidth - currentX + spaceWidth;
        const toMove = alignment === TextAlignment.RIGHT ? offset : offset / 2;

        this.labelsInLine.forEach(label => {
          label.origin = [label.origin[0] + toMove, label.origin[1]];
        });
      }
    }

    // Empty the labels array
    this.labelsInLine = [];
  }

  /**
   * Layout the border of textAreaInstance
   */
  layoutBorder(instance: T) {
    if (instance.hasBorder) {
      const borderWidth = instance.borderWidth;
      const topBorder: RectangleInstance = new RectangleInstance({
        color: instance.color,
        size: [instance.maxWidth + 2 * borderWidth, borderWidth],
        position: [
          instance.origin[0] - borderWidth,
          instance.origin[1] - borderWidth
        ]
      });

      const leftBorder: RectangleInstance = new RectangleInstance({
        color: instance.color,
        size: [borderWidth, instance.maxHeight + 2 * borderWidth],
        position: [
          instance.origin[0] - borderWidth,
          instance.origin[1] - borderWidth
        ]
      });

      const rightBorder: RectangleInstance = new RectangleInstance({
        color: instance.color,
        size: [borderWidth, instance.maxHeight + 2 * borderWidth],
        position: [
          instance.origin[0] + instance.maxWidth,
          instance.origin[1] - borderWidth
        ]
      });

      const bottomBorder: RectangleInstance = new RectangleInstance({
        color: instance.color,
        size: [instance.maxWidth + 2 * borderWidth, borderWidth],
        position: [
          instance.origin[0] - borderWidth,
          instance.origin[1] + instance.maxHeight
        ]
      });

      this.providers.rectangles.add(topBorder);
      this.providers.rectangles.add(leftBorder);
      this.providers.rectangles.add(rightBorder);
      this.providers.rectangles.add(bottomBorder);

      instance.borders.push(topBorder);
      instance.borders.push(leftBorder);
      instance.borders.push(rightBorder);
      instance.borders.push(bottomBorder);
    }
  }

  /**
   * Calculate the positions of labels
   */
  layoutLabels(instance: T) {
    const kerningRequest = this.areaTokerningRequest.get(instance);
    if (!kerningRequest) return;

    const topPadding = instance.padding[0];
    const rightPadding = instance.padding[1] || 0;
    const bottomPadding = instance.padding[2] || 0;
    const leftPadding = instance.padding[3] || 0;
    const maxWidth = instance.maxWidth - leftPadding - rightPadding;
    const maxHeight = instance.maxHeight - topPadding - bottomPadding;
    const originX = instance.origin[0] + leftPadding;
    const originY = instance.origin[1] + topPadding;
    let spaceWidth = 0;

    if (instance.spaceWidth) {
      spaceWidth = instance.spaceWidth;
    } else {
      if (kerningRequest.fontMap) {
        const fontSourceSize = kerningRequest.fontMap.fontSource.size;
        const fontScale = instance.fontSize / fontSourceSize;
        spaceWidth = kerningRequest.fontMap.spaceWidth * fontScale;
      } else {
        spaceWidth = this.props.whiteSpaceKerning || instance.fontSize / 2;
      }

      instance.spaceWidth = spaceWidth;
    }

    const glyphToOffsetY = generateGlyphOffsetYMap(instance, kerningRequest);
    let currentX = 0;
    let currentY = 0;

    this.labelsInLine = [];

    // Layout labels within maxWidth and maxHeight one after one, line after line.
    // Labels which exceed maxHeight will be hidden, labels which exceed maxWidth will be wrap,
    // hidden to move to next line based on wordWrap mode.
    for (let i = 0, endi = instance.labels.length; i < endi; ++i) {
      const label = instance.labels[i];

      if (label instanceof LabelInstance) {
        const width = label.getWidth();
        const offsetY = getOffsetY(label.text, glyphToOffsetY);
        const glyphWidths = getGlyphWidths(label, instance, kerningRequest);

        // Make sure all the labels are within maxHeight and first letter is not bigger than maxWidth
        if (
          currentY + instance.lineHeight <= maxHeight &&
          glyphWidths[0] <= maxWidth
        ) {
          // Whole label can be put within maxWidth
          if (currentX + width <= maxWidth) {
            label.origin = [originX + currentX, originY + currentY + offsetY];
            currentX += width + spaceWidth;
            this.labelsInLine.push(label);

            if (currentX >= maxWidth) {
              // If next label is not NEWLINE, no need to move to next line
              if (
                instance.wordWrap === WordWrap.CHARACTER &&
                i + 1 < endi &&
                instance.labels[i + 1] !== NewLineCharacterMode.NEWLINE
              ) {
                this.setTextAlignment(
                  currentX,
                  spaceWidth,
                  maxWidth,
                  instance.alignment
                );

                currentX = 0;
                currentY += instance.lineHeight;
              }
            }
          } else {
            /*labelsInLine.forEach(label => {
              label.origin = [label.origin[0] + 500, label.origin[1]];
            });
            labelsInLine = [];*/
            // A label which will just put to next line if it exceeds the maxWidth when in WORD mode
            // The label's width should be smaller than maxWidth
            if (
              instance.wordWrap === WordWrap.WORD &&
              label.getWidth() <= instance.maxWidth
            ) {
              this.setTextAlignment(
                currentX,
                spaceWidth,
                maxWidth,
                instance.alignment
              );

              currentX = 0;
              currentY += instance.lineHeight;

              if (currentY + instance.lineHeight <= maxHeight) {
                label.origin = [
                  originX + currentX,
                  originY + currentY + offsetY
                ];
                currentX += label.getWidth() + spaceWidth;
              } else {
                label.active = false;
              }
            }
            // A label will be cut into two parts if label's width exceeds maxwidth
            else {
              const spaceLeft = maxWidth - currentX;
              let index = glyphWidths.length - 1;
              const word = label.text;

              // Find the index to retrieve the part of word that stay in this line
              while (glyphWidths[index] > spaceLeft) {
                index--;
              }

              // Some part of label stay in this line
              if (index >= 0) {
                const sizes = this.seperateLabel(
                  instance,
                  label,
                  glyphToOffsetY,
                  word,
                  index,
                  currentX,
                  currentY,
                  spaceWidth,
                  glyphWidths
                );

                currentX = sizes[0];
                currentY = sizes[1];
              }
              // The whole word moves to next line or set active false if index < 0
              else {
                if (
                  instance.wordWrap === WordWrap.CHARACTER ||
                  instance.wordWrap === WordWrap.WORD
                ) {
                  this.setTextAlignment(
                    currentX,
                    spaceWidth,
                    maxWidth,
                    instance.alignment
                  );

                  // Move position to next line
                  currentY += instance.lineHeight;
                  currentX = 0;

                  if (currentY + instance.lineHeight < maxHeight) {
                    // Put label with in the line
                    if (currentX + label.getWidth() <= maxWidth) {
                      // const offsetY = getOffsetY(label.text, glyphToHeight);
                      label.origin = [
                        originX + currentX,
                        originY + currentY + offsetY
                      ];

                      this.labelsInLine.push(label);

                      currentX += label.getWidth() + spaceWidth;

                      if (
                        currentX >= maxWidth &&
                        i + 1 < endi &&
                        instance.labels[i + 1] !== NewLineCharacterMode.NEWLINE
                      ) {
                        this.setTextAlignment(
                          currentX,
                          spaceWidth,
                          maxWidth,
                          instance.alignment
                        );

                        currentX = 0;
                        currentY += instance.lineHeight;
                      }
                    }
                    // Put part of label in this line, move other part to following lines
                    else {
                      const spaceLeft = maxWidth - currentX;
                      // const glyphWidths = label.glyphWidths;
                      let index = glyphWidths.length - 1;
                      const word = label.text;

                      while (glyphWidths[index] > spaceLeft) {
                        index--;
                      }

                      if (index >= 0) {
                        const sizes = this.seperateLabel(
                          instance,
                          label,
                          glyphToOffsetY,
                          word,
                          index,
                          currentX,
                          currentY,
                          spaceWidth,
                          glyphWidths
                        );

                        currentX = sizes[0];
                        currentY = sizes[1];
                      }
                    }
                  }
                  // Exceeds maxHeight
                  else {
                    label.active = false;
                  }
                }
                // Word which is supposed to put to next line set false when lineWrap is none
                else if (instance.wordWrap === WordWrap.NONE) {
                  label.active = false;
                }
              }
            }
          }
        }

        // Exceeds maxHeight
        else {
          label.active = false;
        }
      }

      // New line
      else if (label === NewLineCharacterMode.NEWLINE) {
        this.setTextAlignment(
          currentX,
          spaceWidth,
          maxWidth,
          instance.alignment
        );

        currentX = 0;
        currentY += instance.lineHeight;
      }
    }

    this.setTextAlignment(currentX, spaceWidth, maxWidth, instance.alignment);
  }

  /**
   * This uses calculated kerning information to place the glyph relative to it's left character neighbor.
   * The first glyph will use metrics of the glyphs drop down amount to determine where the glyph
   * will be placed.
   */
  layout(instance: T) {
    this.updateKerning(instance);
    const kerningRequest = this.areaTokerningRequest.get(instance);
    if (!kerningRequest || !kerningRequest.fontMap) return;

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
   * Update kerning of textArea Instance, retrieve kerning request from map or create a new one
   */
  updateKerning(instance: T) {
    let labelKerningRequest = this.areaTokerningRequest.get(instance);
    const checkText = instance.text;

    if (labelKerningRequest) {
      if (
        labelKerningRequest.kerningPairs &&
        labelKerningRequest.kerningPairs.indexOf(checkText) > -1
      ) {
        return Boolean(labelKerningRequest.fontMap);
      }

      if (
        labelKerningRequest.fontMap &&
        !labelKerningRequest.fontMap.supportsKerning(checkText)
      ) {
        this.areaTokerningRequest.delete(instance);
        labelKerningRequest = undefined;
      } else {
        return false;
      }
    } else {
      const metrics: IFontResourceRequest["metrics"] = {
        fontSize: instance.fontSize,
        text: instance.text,
        letterSpacing: instance.letterSpacing
      };

      labelKerningRequest = fontRequest({
        character: "",
        kerningPairs: [checkText],
        metrics
      });

      if (!instance.preload) {
        this.resource.request(this, instance, labelKerningRequest, {
          resource: {
            type: ResourceType.FONT,
            key: this.props.resourceKey || ""
          }
        });

        this.areaTokerningRequest.set(instance, labelKerningRequest);
      } else {
        instance.resourceTrigger = () => {
          if (instance.onReady) instance.onReady(instance);
        };

        this.resource.request(this, instance, labelKerningRequest, {
          resource: {
            type: ResourceType.FONT,
            key: this.props.resourceKey || ""
          }
        });
      }

      return false;
    }

    return true;
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
        this.providers.labels.add(label);
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

    let wordsToLayout = this.areaToWords.get(instance);

    if (!wordsToLayout) {
      wordsToLayout = generateWords(instance.text);
    }

    if (currentLabels.length < wordsToLayout.length) {
      for (
        let i = currentLabels.length, iMax = wordsToLayout.length;
        i < iMax;
        ++i
      ) {
        const word = wordsToLayout[i];

        if (word === "/n") {
          currentLabels.push(NewLineCharacterMode.NEWLINE);
        } else {
          // Initial position for labelInstance
          const position: [number, number] = [
            Number.MIN_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER
          ];

          const label = new LabelInstance({
            active: false,
            color: instance.color,
            fontSize: instance.fontSize,
            letterSpacing: instance.letterSpacing,
            origin: position,
            text: word,
            onReady: this.handleLabelReady
          });

          label.parentTextArea = instance;
          currentLabels.push(label);
          this.providers.labels.add(label);
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
    this.clear(instance);
    this.updateLabels(instance);
    this.areaTokerningRequest.delete(instance);
    this.layout(instance);
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
      border.position = [
        border.position[0] + origin[0] - oldOrigin[0],
        border.position[1] + origin[1] - oldOrigin[1]
      ];
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
