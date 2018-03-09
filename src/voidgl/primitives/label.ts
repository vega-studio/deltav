export type Label = {
  /** The color the label should render as */
  color: string;
  /** The font of the label */
  fontFamily: string;
  /** The font size of the label in px */
  fontSize: number;
  /** Stylization of the font */
  fontStyle: string;
  /** The weight of the font */
  fontWeight: 'normal' | 'bold' | 'bolder' | 'lighter' | 'inherit' | 'initial' | 'unset' | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  /** The rasterization metrics of the label */
  rasterization: {
    /**
     * This is an image rendering of the label.
     * WARNING: This will ONLY SOMETIMES be populated. The system can choose
     * when to consume this as it chooses as it can be a major memory eater if
     * permanently left in place. DO NOT RELY on this being available.
     */
    canvas?: HTMLCanvasElement;
    /** The label pixel dimensions as it is rendered to texture space on an atlas */
    texture: {
      height: number;
      width: number;
    };
    /** The label dimensions as it would be rendered in world space */
    world: {
      height: number;
      width: number;
    };
  };
  /** When set to true, the label will render 4x */
  superSample: boolean;
  /** This will be the text that should render with  */
  text: string;
};
