/**
 * The purpose of this file is to provide a means to render glyphs to a grid and to provide
 * an approach to estimating kerning values for characters utilizing any custom embedded font
 * in a web page.
 */

import * as html2canvas from "html2canvas";
import { WebGLStat } from "src/gl/webgl-stat";
import { IResourceType, ResourceType } from "../../types";
import { Vec2 } from "../../util";
import { IdentifyByKey } from "../../util/identify-by-key";
import { renderGlyph } from "./glyph-renderer";

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
  pairs: { all: string; pairs: KerningPairs }
) {
  const str1 = pairs.all.replace(/ /g, "");

  // Create the table
  const table = document.createElement("div");
  const col = Math.floor(WebGLStat.MAX_TEXTURE_SIZE / (fontSize * 2));
  const row = Math.ceil((str1.length - 1) / col);
  const cellWidth = fontSize * 2;
  const cellHeight = fontSize * 2;

  table.style.display = "table";
  table.style.width = `${WebGLStat.MAX_TEXTURE_SIZE}px`;
  table.style.textAlign = "center";
  table.style.tableLayout = "fixed";

  // Render each pair to cell of the table
  for (let i = 0; i < str1.length - 1; i += col) {
    const tr = document.createElement("div");
    tr.style.display = "table-row";
    tr.style.height = `${cellHeight}px`;
    tr.style.width = `width:${WebGLStat.MAX_TEXTURE_SIZE}px`;

    // We track how much room is remaining so we can inject an empty cell at the end to ensure
    // the table doesn't stretch to fill
    let remaining = WebGLStat.MAX_TEXTURE_SIZE;

    // Render each tr with col number of td
    for (let j = 0; j < col && i + j < str1.length - 1; j++) {
      const td = document.createElement("div");
      td.style.display = "table-cell";
      td.style.width = `${cellWidth}px`;
      td.style.height = `${cellHeight}px`;

      const leftStr = str1[i + j];
      const rightStr = str1[i + j + 1];

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

  // document.getElementsByTagName('body')[0].appendChild(table);

  // Init the array for left-top corners for each letter in a pair
  // [leftLetter->left, leftLetter->top, rightLetter->left, rightLetter->top]
  const mins: [number, number, number, number][] = [];
  for (let i = 0; i < str1.length - 1; i++) {
    mins.push([
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER
    ]);
  }

  // Config for html2canvas
  // Detail from https://html2canvas.hertzen.com/configuration
  const config = {
    backgroundColor: null
  };

  const canvas = await html2canvas(table, config);
  // document.getElementsByTagName('div')[0].appendChild(canvas);

  // Width and height of each cell
  const w = canvas.width / col;
  const h = canvas.height / row;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const r = data[(canvas.width * y + x) * 4 + 0];
        const g = data[(canvas.width * y + x) * 4 + 1];
        const b = data[(canvas.width * y + x) * 4 + 2];

        // get index of pair by the position of pixel
        const index = Math.floor(y / h) * col + Math.floor(x / w);

        if (index < mins.length) {
          const minRX = mins[index][0];
          const minRY = mins[index][1];
          const minBX = mins[index][2];
          const minBY = mins[index][3];

          // Red pixel is for left letter
          if (r > 0 && g === 0 && b === 0) {
            if (x < minRX) mins[index][0] = x;
            if (y < minRY) mins[index][1] = y;
          }

          // Blue pixel is for right letter
          if (r === 0 && g === 0 && b > 0) {
            if (x < minBX) mins[index][2] = x;
            if (y < minBY) mins[index][3] = y;
          }
        }
      }
    }

    // Set pairs map based on mins array
    for (let i = 0; i < mins.length; i++) {
      const left = str1[i];
      const right = str1[i + 1];
      const min = mins[i];
      const vec: Vec2 = [min[2] - min[0], min[3] - min[1]];
      const rightLetters = pairs.pairs[left];

      if (rightLetters) {
        rightLetters[right] = vec;
      }
    }
  }
}

/**
 * This function takes a string to return a map with next letters of each letter
 */
function stringToPairs(
  str: string,
  existing: KerningPairs
): { all: string; pairs: KerningPairs } {
  // Remove all the blanks
  str = str.replace(/ /g, "");

  let all = "";
  const pairs: KerningPairs = {};

  for (let i = 0; i < str.length - 1; i++) {
    const current = str[i];
    const next = str[i + 1];

    if (!pairs[current]) {
      pairs[current] = {};
    }

    const neighbours = pairs[current];
    if (neighbours) {
      // Don't remake a pair for already existing pairs
      if (!existing[current] || existing[current][next]) {
        neighbours[next] = [0, 0];
        all += `${current}${next}`;
      }
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
  estimateKerning(
    str: string,
    fontString: string,
    fontSize: number,
    existing: KerningPairs
  ) {
    const pairInfo = stringToPairs(str, existing);
    // const offsets = estimateOffset(str, fontSize, fontFamily);
    renderEachPair(fontString, fontSize, pairInfo);

    return pairInfo;
  }
}
