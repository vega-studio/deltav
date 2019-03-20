/**
 * The purpose of this file is to provide a means to render glyphs to a grid and to provide
 * an approach to estimating kerning values for characters utilizing any custom embedded font
 * in a web page.
 */

import * as html2canvas from "html2canvas";
import { WebGLStat } from "src/gl/webgl-stat";
import { IResourceType, ResourceType } from "../../types";
import { scale2, Vec2 } from "../../util";
import { IdentifyByKey } from "../../util/identify-by-key";
import { renderGlyph } from "./glyph-renderer";

const debug = require("debug")("performance");
const { floor } = Math;

type IGlyphRenderMetrics = {
  [key: string]: { glyph: ImageData; glyphIndex: number };
};

export type KerningPairs = {
  [leftLetter: string]: { [rightLtter: string]: Vec2 };
};

/**
 * This function is calculate the offset of adjacent letters
 */
async function renderEachPair(
  fontString: string,
  fontSize: number,
  pairs: { all: string[]; pairs: KerningPairs }
) {
  // Calculate the max width the system can reliably handle
  const contextWidth = WebGLStat.MAX_TEXTURE_SIZE / window.devicePixelRatio;
  // Create the table
  const table = document.createElement("div");
  const maxColumns = floor(contextWidth / (fontSize * 2));
  const cellWidth = fontSize * 2;
  const cellHeight = fontSize * 2;

  table.style.display = "table";
  table.style.width = `${contextWidth}px`;
  table.style.textAlign = "center";
  table.style.tableLayout = "fixed";
  table.style.position = "relative";
  table.style.left = "0px";
  table.style.top = `${window.innerHeight}px`;

  let currentPair = 0;

  // Render each pair to cell of the table
  while (currentPair < pairs.all.length) {
    const tr = document.createElement("div");
    tr.style.display = "table-row";
    tr.style.height = `${cellHeight}px`;
    tr.style.width = `width:${contextWidth}px`;

    // We track how much room is remaining so we can inject an empty cell at the end to ensure
    // the table doesn't stretch to fill
    let remaining = contextWidth;

    // Render each tr with col number of td
    for (let j = 0; j < maxColumns && currentPair < pairs.all.length; j++) {
      const td = document.createElement("div");
      td.style.display = "table-cell";
      td.style.width = `${cellWidth}px`;
      td.style.height = `${cellHeight}px`;

      const pair = pairs.all[currentPair];
      currentPair++;
      const leftStr = pair[0];
      const rightStr = pair[1];

      // Each td has two spans
      const leftSpan = document.createElement("span");
      const rightSpan = document.createElement("span");
      const leftColor = "color:#ff0000;";
      const rightColor = "color:#0000ff;";
      const size = `font:${fontString}`;
      const leftStyle = leftColor + size;
      const rightStyle = rightColor + size;

      leftSpan.setAttribute("style", leftStyle);
      rightSpan.setAttribute("style", rightStyle);

      leftSpan.innerText = leftStr;
      rightSpan.innerText = rightStr;

      td.appendChild(leftSpan);
      td.appendChild(rightSpan);
      tr.appendChild(td);

      remaining -= cellWidth;
    }

    if (remaining >= 0) {
      const td = document.createElement("div");
      td.style.display = "table-cell";
      td.style.width = `${remaining}px`;
      tr.appendChild(td);
    }

    table.appendChild(tr);
  }

  document.getElementsByTagName("body")[0].appendChild(table);

  // Init the array for left-top corners for each letter in a pair
  // [leftLetter->left, leftLetter->top, rightLetter->left, rightLetter->top]
  const mins: [number, number, number, number][] = [];
  for (let i = 0; i < pairs.all.length; i++) {
    mins.push([
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER
    ]);
  }

  // Config for html2canvas
  // Detail from https://html2canvas.hertzen.com/configuration
  const config: Html2Canvas.Html2CanvasOptions = {
    // Transparent background makes analyzing easier
    backgroundColor: null,
    // If performance debugging is enabled, then log the html2canvas performance logs
    logging: debug.enabled
  };

  debug("Rendering table for font kerning analysis", pairs, table);
  const canvas = await html2canvas(table, config);
  table.remove();

  // Width and height of each cell
  const w = cellWidth * window.devicePixelRatio;
  const h = cellHeight * window.devicePixelRatio;

  const ctx = canvas.getContext("2d");
  debug("Analyzing rendered canvas", canvas);

  if (ctx) {
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let pixel, r, g, b, min, index;

    for (let y = 0, canvasHeight = canvas.height; y < canvasHeight; y++) {
      for (let x = 0, canvasWidth = canvas.width; x < canvasWidth; x++) {
        pixel = (canvasWidth * y + x) * 4;
        r = data[pixel + 0];
        g = data[pixel + 1];
        b = data[pixel + 2];

        // Get the index of the pair by the position of pixel
        index = floor(y / h) * maxColumns + floor(x / w);

        if (index < mins.length) {
          min = mins[index];

          // Red pixel is for left letter
          if (r > 0 && g === 0 && b === 0) {
            if (x < min[0]) min[0] = x;
            if (y < min[1]) min[1] = y;
          }

          // Blue pixel is for right letter
          if (r === 0 && g === 0 && b > 0) {
            if (x < min[2]) min[2] = x;
            if (y < min[3]) min[3] = y;
          }
        }
      }
    }

    // Set pairs map based on mins array
    for (let i = 0, iMax = mins.length; i < iMax; i++) {
      const pair = pairs.all[i];
      const left = pair[0];
      const right = pair[1];
      const min = mins[i];
      const vec: Vec2 = [min[2] - min[0], min[3] - min[1]];
      const rightLetters = pairs.pairs[left];

      if (rightLetters) {
        // The calculations done on the space are in a devices pixel ratio. So we must
        // adjust by that ratio to make it normal world space coordinates.
        const exact = scale2(vec, 1 / window.devicePixelRatio);
        rightLetters[right] = [Math.ceil(exact[0]), exact[1]];
      }
    }
  } else {
    console.warn(
      "html2canvas did not produce a valid canvas context to analyze"
    );
  }

  debug("Kerning rendering analysis complete", pairs.pairs);
}

/**
 * This function takes a string to return a map with next letters of each letter
 */
function stringToPairs(
  str: string,
  existing: KerningPairs
): { all: string[]; pairs: KerningPairs } {
  // Remove all the blanks
  str = str.replace(/ /g, "");
  const all: string[] = [];
  const pairs: KerningPairs = {};

  for (let i = 0; i < str.length - 1; i++) {
    const left = str[i];
    const right = str[i + 1];
    let neighbors = pairs[left];

    if (!neighbors) {
      neighbors = pairs[left] = {};
    }

    // Don't remake a pair for already existing pairs
    if ((!existing[left] || !existing[left][right]) && !neighbors[right]) {
      neighbors[right] = [0, 0];
      all.push(`${left}${right} `);
    }
  }

  return {
    all,
    pairs
  };
}

export interface IFontOptions extends IdentifyByKey, IResourceType {
  /** This resource must have it's type explcitly be set to a Font */
  type: ResourceType.FONT;
}

export class FontRenderer {
  /**
   * This function takes a sentence and grid info
   * Returns a canvas with a list of glyphs where each glyph fits cnetered within each grid cell
   */
  makeBitmapGlyphs(
    glyphs: string,
    fontString: string,
    fontSize: number
  ): IGlyphRenderMetrics {
    // It is used to store the metrics of each glyph
    const map: IGlyphRenderMetrics = {};
    // Get all unique glyphs provided
    const uniqueGlyphs = new Set();

    for (let i = 0, iMax = glyphs.length; i < iMax; ++i) {
      uniqueGlyphs.add(glyphs[i]);
    }

    // Get the characters to be rendered
    const chars = Array.from(uniqueGlyphs.values());

    for (let i = 0, iMax = chars.length; i < iMax; ++i) {
      const char = chars[i];
      const glyph = renderGlyph(char, fontSize * 2, fontSize * 2, fontString);

      if (glyph) {
        map[char] = {
          glyph: glyph.data,
          glyphIndex: i
        };
      } else {
        console.warn(
          "Unable to render character",
          char,
          "to font map for rendering."
        );
      }
    }

    return map;
  }

  /**
   * This performs a special rendering to guess kerning of letters of embedded fonts (fonts we don't
   * have access to their raw font files). This will provide kerning information of a letter by providing
   * the distance from a 'left' letter's top left  corner to the 'right' letter's topleft corner.
   */
  async estimateKerning(
    str: string,
    fontString: string,
    fontSize: number,
    existing: KerningPairs
  ) {
    // Get all of the new pairs of letters that need kerning infoz
    const pairInfo = stringToPairs(str, existing);
    debug("Estimating Kerning for", str);

    // Only if there are new kerning needs do we actually need to run this method
    if (pairInfo.all.length > 0) {
      await renderEachPair(fontString, fontSize, pairInfo);
    }

    return pairInfo;
  }
}
