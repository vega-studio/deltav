/**
 * The purpose of this file is to provide a means to render glyphs to a grid and to provide
 * an approach to estimating kerning values for characters utilizing any custom embedded font
 * in a web page.
 */
import * as html2canvas from "html2canvas";
import { WebGLStat } from "../../gl/webgl-stat";
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

export type KerningInfo = {
  all: string[];
  pairs: KerningPairs;
  spaceWidth: number;
};

/**
 * This function is calculate the offset of adjacent letters
 */
async function renderEachPair(
  fontString: string,
  fontSize: number,
  pairs: KerningInfo,
  calculateSpace: boolean
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
  let columnIndex = 0;
  let currentRow;
  let rowSpacer;
  let remainingSpace = 0;

  // Render each pair to cell of the table
  while (currentPair < pairs.all.length) {
    const tr = document.createElement("div");
    currentRow = tr;
    tr.style.display = "table-row";
    tr.style.height = `${cellHeight}px`;
    tr.style.width = `width:${contextWidth}px`;

    // We track how much room is remaining so we can inject an empty cell at the end to ensure
    // the table doesn't stretch to fill
    let remaining = contextWidth;

    // Render each tr with col number of td
    for (
      columnIndex = 0;
      columnIndex < maxColumns && currentPair < pairs.all.length;
      columnIndex++
    ) {
      const td = document.createElement("div");
      td.style.display = "table-cell";
      td.style.width = `${cellWidth}px`;
      td.style.height = `${cellHeight}px`;
      td.style.overflow = "hidden";
      td.style.font = fontString;

      const pair = pairs.all[currentPair];
      currentPair++;
      const leftStr = pair[0];
      const rightStr = pair[1];

      // Each td has two spans
      const leftSpan = document.createElement("span");
      const rightSpan = document.createElement("span");
      leftSpan.style.color = "#ff0000";
      rightSpan.style.color = "#0000ff";

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
      rowSpacer = td;
    } else {
      rowSpacer = null;
    }

    remainingSpace = remaining;
    table.appendChild(tr);
  }

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

  // This stores how large the test character's rendering is that will be used for analyzing
  // how large a space between characters is.
  let testSpaceCharacterWidth = 0;
  let doSpaceCheck = false;

  // If the distance of a space is required, then we add in one more additional cell
  if (calculateSpace) {
    const testChar = pairs.all[0][0];
    const td = document.createElement("div");
    td.style.display = "table-cell";
    td.style.width = `${cellWidth}px`;
    td.style.height = `${cellHeight}px`;
    td.style.overflow = "hidden";
    td.style.font = fontString;

    // The test character for the spacing will be the first character in the pairs we
    // wanted to render.
    const render = await renderGlyph(testChar, 128, 128, fontString);

    if (render) {
      // Keep how wide the test character is for after the kerning calculation so we can accurately
      // determine how large a space is by subtracting the width of the character from the kerning distance.
      testSpaceCharacterWidth = render.size[0];
      // We create two of the test characters and place a space between them. This will allow
      td.innerHTML = `<span style="color:#ff0000">${testChar}</span> <span style="color:#0000ff">${testChar}</span>`;

      // If the last row has room for the rendering, then we just add to it
      if (columnIndex < maxColumns && currentRow) {
        currentRow.appendChild(td);
        remainingSpace -= cellWidth;

        // If a spacer at the end of the row is present, it should be adjusted to the size needed
        // It should also be moved to the end of the child list
        if (rowSpacer) {
          rowSpacer.remove();

          if (remainingSpace > 0) {
            currentRow.style.width = `${remainingSpace}px`;
            currentRow.appendChild(rowSpacer);
          }
        }
      }

      // Otherwise, we make a new row to inject into
      else {
        const tr = document.createElement("div");
        currentRow = tr;
        tr.style.display = "table-row";
        tr.style.height = `${cellHeight}px`;
        tr.style.width = `width:${contextWidth}px`;
        currentRow.appendChild(td);
        table.appendChild(tr);

        // Inject a spacer to fill the remaining space
        rowSpacer = document.createElement("div");
        rowSpacer.style.display = "table-cell";
        rowSpacer.style.width = `${(maxColumns - 1) * cellWidth}px`;
        tr.appendChild(rowSpacer);
      }

      // Add an additional min tracker for the check
      mins.push([
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER
      ]);

      // Indicate the space check is indeed happening
      doSpaceCheck = true;
    }
  }

  // The element must be a part of the body for html2canvas to work
  document.getElementsByTagName("body")[0].appendChild(table);

  // Config for html2canvas
  const config: Html2Canvas.Html2CanvasOptions = {
    backgroundColor: null,
    logging: debug.enabled
  };

  debug("Rendering table for font kerning analysis", pairs, table);
  const canvas = await html2canvas(table, config);

  if (!canvas) {
    console.warn("Could not convert DOM structure to canvas");
    return;
  }

  // table.remove();

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
    // Before letter processing, remove and analyze processing for the 'space' character
    if (doSpaceCheck) {
      const min = mins.pop();
      if (min) {
        const vec: Vec2 = [min[2] - min[0], 0];
        const exact = scale2(vec, 1 / window.devicePixelRatio);
        pairs.spaceWidth = Math.ceil(exact[0]) - testSpaceCharacterWidth;
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
  existing: KerningPairs,
  out?: KerningInfo
): KerningInfo {
  // Remove all the whitespace
  str = str.replace(/\s/g, "");
  const all: string[] = (out && out.all) || [];
  const pairs: KerningPairs = (out && out.pairs) || {};

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
      all.push(`${left}${right}`);
    }
  }

  return {
    all,
    pairs,
    spaceWidth: 0
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
    str: string[],
    fontString: string,
    fontSize: number,
    existing: KerningPairs,
    includeSpace: boolean
  ) {
    // Get all of the new pairs of letters that need kerning infoz
    const pairInfo: KerningInfo = {
      all: [],
      pairs: {},
      spaceWidth: 0
    };

    debug("Estimating Kerning for", str);

    for (let i = 0, iMax = str.length; i < iMax; ++i) {
      const s = str[i];
      stringToPairs(s, existing, pairInfo);
    }

    // Only if there are new kerning needs do we actually need to run this method
    if (pairInfo.all.length > 0) {
      await renderEachPair(fontString, fontSize, pairInfo, includeSpace);
    }

    return pairInfo;
  }
}
