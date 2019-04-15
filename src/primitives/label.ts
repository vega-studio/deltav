export type Label = {
  /** The color the label should render as */
  color: [number, number, number, number];
  /** The font of the label */
  fontFamily: string;
  /** The font size of the label in px */
  fontSize: number;
  /** Stylization of the font */
  fontStyle: "normal" | "italic" | "oblique" | "initial" | "inherit";
  /** The weight of the font */
  fontWeight:
    | "normal"
    | "bold"
    | "bolder"
    | "lighter"
    | "inherit"
    | "initial"
    | "unset"
    | 100
    | 200
    | 300
    | 400
    | 500
    | 600
    | 700
    | 800
    | 900;
  /** Max width in pixels the label is allowed to be */
  maxWidth: number;
  /** This will be the text that should render with  */
  text: string;
};
