import { computed, observable } from 'mobx';
import { Label } from '../../primitives/label';
import { AtlasResource, LabelAtlasResource, LabelRasterizer } from '../../surface/texture';
import { IInstanceOptions, Instance } from '../../util/instance';

export enum AnchorType {
  BottomLeft,
  BottomMiddle,
  BottomRight,
  Custom,
  Middle,
  MiddleLeft,
  MiddleRight,
  TopLeft,
  TopMiddle,
  TopRight,
}

export type Anchor = {
  /** When the anchor gets calculated on the label, this allows the anchor to go beyond the borders of the label by this amount */
  padding: number;
  /** This is the location of the anchor. If a custom anchor is specified, then the x and y are not automatically populated */
  type: AnchorType,
  /** This is populated with the anchor's location relative to the label's surface */
  x?: number,
  /** This is populated with the anchor's location relative to the label's surface */
  y?: number,
};

export interface ILabelInstanceOptions extends IInstanceOptions, Label {
  /**
   * The point on the label which will be placed in world space via the x, y coords. This is also the point
   * which the label will be scaled around.
   */
  anchor?: Anchor;
  /** The color the label should render as */
  color: [number, number, number, number];
  /** The font of the label */
  fontFamily: string;
  /** The font size of the label in px */
  fontSize: number;
  /** Stylization of the font */
  fontStyle: Label['fontStyle'];
  /** The weight of the font */
  fontWeight: Label['fontWeight'];
  /** This will be the text that should render with  */
  text: string;
  /** The x coordinate where the label will be anchored to in world space */
  x?: number;
  /** The y coordinate where the label will be anchored to in world space */
  y?: number;
}

/** This is to make a clear type that references label text values */
type TextValue = string;
/** This is to make a clear type that references label css font values */
type CSSFont = string;
/**
 * This is a reference for a rasterization that has reference counting. When the references go to zero,
 * the rasterization should be invalidated and resources freed for the rasterization.
 */
type RasterizationReference = {
  resource: LabelAtlasResource;
  references: number;
};

/**
 * This is a lookup to find existing rasterizations for a particularly created label so that every
 * new label does not have to go through the rasterization process.
 */
const rasterizationLookUp = new Map<TextValue, Map<CSSFont, RasterizationReference>>();

/**
 * This is a lookup to quickly find the proper calculation for setting the correct anchor
 * position based on the anchor type.
 */
const anchorCalculator: {[key: number]: (anchor: Anchor, label: LabelInstance) => void} = {
  [AnchorType.TopLeft]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = -anchor.padding;
    anchor.y = -anchor.padding;
  },
  [AnchorType.TopMiddle]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = (label.width + anchor.padding * 2.0) / 2.0;
    anchor.y = -anchor.padding;
  },
  [AnchorType.TopRight]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = label.width + anchor.padding;
    anchor.y = -anchor.padding;
  },
  [AnchorType.MiddleLeft]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = -anchor.padding;
    anchor.y = (label.height + anchor.padding * 2.0) / 2;
  },
  [AnchorType.Middle]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = (label.width + anchor.padding * 2.0) / 2.0;
    anchor.y = (label.height + anchor.padding * 2.0) / 2.0;
  },
  [AnchorType.MiddleRight]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = label.width + anchor.padding;
    anchor.y = (label.height + anchor.padding * 2.0) / 2.0;
  },
  [AnchorType.BottomLeft]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = -anchor.padding;
    anchor.y = label.height + anchor.padding;
  },
  [AnchorType.BottomMiddle]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = (label.width + anchor.padding * 2.0) / 2.0;
    anchor.y = label.height + anchor.padding;
  },
  [AnchorType.BottomRight]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = label.width + anchor.padding;
    anchor.y = label.height + anchor.padding;
  },
  [AnchorType.Custom]: (anchor: Anchor, label: LabelInstance) => {
    anchor.x = anchor.x || 0;
    anchor.y = anchor.y || 0;
  },
};

/**
 * This generates a new label instance which will render a single line of text for a given layer.
 * There are restrictions surrounding labels due to texture sizes and rendering limitations.
 *
 * Currently, we only support rendering a label via canvas, then rendering it to an Atlas texture
 * which is used to render to cards in the world for rendering. This is highly performant, but means:
 *
 * - Labels should only be so long.
 * - Multiline is not supported inherently
 * - Once a label is constructed, only SOME properties can be altered thereafter
 *
 * A label that is constructed can only have some properties set upon creating the label and are locked
 * thereafter. The only way to modify them would be to destroy the label, then construct a new label
 * with the modifications. This has to deal with performance regarding rasterizing the label
 */
export class LabelInstance extends Instance implements Label {
  /** This is the rendered color of the label */
  @observable color: [number, number, number, number] = [0, 0, 0, 1];
  /** The x coordinate where the label will be anchored to in world space */
  @observable x?: number;
  /** The y coordinate where the label will be anchored to in world space */
  @observable y?: number;

  // The following properties are properties that are locked in after creating this label
  // As the properties are completely locked into how the label was rasterized and can not
  // Nor should not be easily adjusted for performance concerns

  private _cssFont: string = '';
  private _fontFamily: string = 'Arial';
  private _fontSize: number = 12;
  private _fontStyle: Label['fontStyle'] = 'normal';
  private _fontWeight: Label['fontWeight'] = 400;
  private _text: string = '';
  private _width: number = 0;
  private _height: number = 0;
  private _isDestroyed: boolean = false;
  private _rasterization: RasterizationReference;

  // The following are the getters for the locked in parameters of the label so we can read
  // The properties but not set any of them.

  /**
   * This is the full css string that represents this label. This + the text of the label is essentially
   * a unique identifier for the rendering of the label and is used to key the rasterization of the label
   * so that label rasterization can be shared for similar labels.
   */
  get cssFont() { return this._cssFont; }
  /** This flag indicates if this label is valid anymore */
  get isDestroyed() { return this._isDestroyed; }
  /** This is the font family of the label */
  get fontFamily() { return this._fontFamily; }
  /**
   * This is the size of the label in pixels. For Labels, this correlates to the rendering font size.
   * The true pixel height of the label is calculated and placed into the height property for the label.
   */
  get fontSize() { return this._fontSize; }
  /** This is the style of the font (italic, oblique, etc) */
  get fontStyle() { return this._fontStyle; }
  /** This is the font weight specified for the label (bold, normal, etc). */
  get fontWeight() { return this._fontWeight; }
  /** This gets the atlas resource that is uniquely idenfied for this label */
  get resource() { return this._rasterization.resource; }
  /** This is the label's text. */
  get text() { return this._text; }

  /**
   * This is the width in world space of the label. If there is no camera distortion,
   * this would be the width of the label in pixels on the screen.
   */
  get width() {
    return this._width;
  }

  /**
   * This is the height in world space of the label. If there is no camera distortion,
   * this would be the height of the label in pixels on the screen.
   */
  get height() {
    return this._height;
  }

  // These are properties that can be altered, but have side effects from being changed

  /** This is the anchor location on the  */
  @observable private _anchor: Anchor = {
    padding: 0,
    type: AnchorType.TopLeft,
    x: 0,
    y: 0,
  };

  constructor(options: ILabelInstanceOptions) {
    super(options);

    this.color = options.color;
    this._fontFamily = options.fontFamily;
    this._fontSize = options.fontSize;
    this._fontStyle = options.fontStyle;
    this._fontWeight = options.fontWeight;
    this._text = options.text;

    // We get the CSS font string for this label so we can uniquely identify the rasterization
    // Easily.
    this._cssFont = LabelRasterizer.makeCSSFont(this, 1);
    // Look for other same texts that have been rasterized
    const rasterizations = rasterizationLookUp.get(this._text);
    let rasterization: RasterizationReference;

    if (rasterizations) {
      // Look for those texts that have been rasterized in the same fashion that this label is requesting
      rasterization = rasterizations.get(this._cssFont);

      // If a rasterization exists, we must increment the use reference
      if (rasterization) {
        rasterization.references++;
      }
    }

    // If we have not found an existing rasterization
    if (!rasterization) {
      rasterization = {
        references: 1,
        resource: new LabelAtlasResource(this),
      };

      // Rasterize the resource generated for this label. We need it immediately rasterized so
      // That we can utilize the dimensions for calculations.
      LabelRasterizer.renderSync(rasterization.resource);
    }

    this._rasterization = rasterization;
    this._width = rasterization.resource.rasterization.world.width;
    this._height = rasterization.resource.rasterization.world.height;

    // Make sure the anchor is set to the appropriate location
    this.setAnchor(options.anchor);
  }

  /**
   * Labels are a sort of unique case where the use of a label should be destroyed as rasterization
   * resources are in a way kept alive through reference counting.
   */
  destroy() {
    if (!this._isDestroyed) {
      this._isDestroyed = true;
      this._rasterization.references--;

      // If all references are cleared, then the rasterization needs to be eradicated
      if (this._rasterization.references === 0) {
        this._rasterization.resource;
      }
    }
  }

  @computed
  get anchor() {
    return this._anchor;
  }

  /**
   * This applies a new anchor to this label and properly determines it's anchor position on the label
   */
  setAnchor(anchor: Anchor) {
    const newAnchor = {
      padding: anchor.padding || 0,
      type: anchor.type,
      x: anchor.x || 0,
      y: anchor.y || 0,
    };

    // Calculate the new anchors position values
    anchorCalculator[newAnchor.type](newAnchor, this);
    // Apply the anchor
    this._anchor = newAnchor;
  }
}
