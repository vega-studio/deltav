import React from "react";

import { FontJSX } from "../../../ui/src/index.js";

/**
 * The font every 2D text fixture uses: a dynamic sans-serif font map
 * rasterised at FONT_SOURCE_SIZE, so a label of that fontSize has
 * fontScale 1 (world units = font map pixels).
 */
export const FONT_SOURCE_SIZE = 32;

export const fontResource = (
  <FontJSX
    name="font"
    dynamic={true}
    fontSource={{
      family: "sans-serif",
      size: FONT_SOURCE_SIZE,
      weight: "normal",
      type: undefined,
    }}
  />
);
