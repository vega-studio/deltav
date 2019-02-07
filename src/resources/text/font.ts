import * as html2canvas from "html2canvas";
import { IResourceType, ResourceType } from "../../types";
import { IdentifyByKey } from "../../util/identify-by-key";
interface IVec2 {
  x: number;
  y: number;
}

interface IGlyphMetrics {
  // This canvas is used to render all the glyphs
  canvas: HTMLCanvasElement;
  // This defines how many glyphs in a row
  glyphWide: number;
  // This is a map used to find glyph metrics by the glyph
  // Topleft is the rendered glyph that makes the glyph perfect fitted in the center of a cell
  glyphs: Map<string, {gridNumber: number, topLeft: IVec2}>;
}

/**
 * This is the method to test the kerning estimated
 * by rendering the whole sentence letter by letter
 */
function renderByPairs(
  str: string,
  fontSize: number,
  fontFamily: string,
  pairs: Map<string, Map<string, IVec2>>,
  offsets: Map<string, [number, number]>
) {
  // Start point
  let x = 0;
  let y = 10;

  const testCanvas = document.createElement('canvas');
  testCanvas.width = 500;
  const ctx = testCanvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = "red";
    ctx.textAlign = "left";
    ctx.textBaseline  = "hanging";
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillText(str, x, y);
    ctx.fillStyle = "red";

    // Fill text letter after letter
    for (let i = 0; i < str.length; i++) {
      const cur = str[i];
      // First letter
      if (i === 0) {
        ctx.fillText(cur, x, y);
      }

      // When there is a blank, move x position 6 pixels
      else if (cur === ' ') {
        x += 6;
      }

      // When there is a pre letter, set offset by pairs
      else {
        const pre = str[i - 1] === ' ' ? str[i - 2] : str[i - 1];
        const neighbours = pairs.get(pre);
        if (neighbours) {
          const offset = neighbours.get(cur);
          const offsetPre = offsets.get(pre);
          const offsetCur = offsets.get(cur);
          if (offset && offsetPre && offsetCur) {
            x += offset.x + offsetPre[0] - offsetCur[0];
            y += offset.y + offsetPre[1] - offsetCur[1];
            ctx.fillText(cur, x, y);
          }
        }
      }
    }
  }

 document.getElementsByTagName('div')[0].appendChild(testCanvas);
}

/**
 * This function is calculate the offset of adjacent letters
 */
function renderEachPair(
  str: string,
  fontSize: number,
  fontFamily: string,
  pairs: Map<string, Map<string, IVec2>>,
  offsets: Map<string, [number, number]>
) {
  const str1 = str.replace(/ /g, "");

  // Create the table
  const table = document.createElement('table');
  const col = 8;
  const row = Math.ceil((str1.length - 1) / col);
  const cellWidth = fontSize * 2;
  const cellHeight = fontSize * 2;

  // Render each pair to cell of the table
  for (let i = 0; i < str1.length - 1; i += col) {
    const tr = document.createElement('tr');
    tr.setAttribute('style', `height:${cellHeight}px;`);

    // Render each tr with col number of td
    for (let j = 0; j < col && i + j < str1.length - 1; j++) {
      const td = document.createElement('td');
      td.setAttribute('style', `width:${cellWidth}px; height:${cellHeight}px;`);

      const leftStr = str1[i + j];
      const rightStr = str1[i + j + 1];

      const div = document.createElement('div');

      // Each td has two spans
      const leftSpan = document.createElement('span');
      const rightSpan = document.createElement('span');

      const leftColor = 'color:#ff0000;';
      const rightColor = 'color:#0000ff;';

      const size = `font-size:${fontSize}px;` ;
      const family = `font-family:${fontFamily};`;

      const leftStyle = leftColor + size + family;
      const rightStyle = rightColor + size + family;

      leftSpan.setAttribute(
        'style',
        leftStyle
      );
      rightSpan.setAttribute(
        'style',
        rightStyle
      );

      leftSpan.innerText = leftStr;
      rightSpan.innerText = rightStr;
      div.appendChild(leftSpan);
      div.appendChild(rightSpan);

      td.appendChild(div);
      tr.appendChild(td);
    }
    table.appendChild(tr);

  }

  document.getElementsByTagName('div')[0].appendChild(table);

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

  // config for html2canvas
  // Detail from https://html2canvas.hertzen.com/configuration
  const config = {
    backgroundColor: null
  };

  html2canvas(table, config).then(canvas => {
    document.getElementsByTagName('div')[0].appendChild(canvas);

    // width and height of each cell
    const w = canvas.width / col;
    const h = canvas.height / row;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const r = data[((canvas.width * y) + x) * 4 + 0];
          const g = data[((canvas.width * y) + x) * 4 + 1];
          const b = data[((canvas.width * y) + x) * 4 + 2];

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
        const vec = {
          x: min[2] - min[0],
          y: min[3] - min[1]
        };

        const rightLetters = pairs.get(left);
        if (rightLetters) {
          rightLetters.set(right, vec);
        }
      }

      // Test the pair by rendering all the letters
      renderByPairs(
        str,
        fontSize,
        fontFamily,
        pairs,
        offsets
      );

    }
  });

}

/**
 * This function takes a string to return a map with next letters of each letter
 */
function stringToPairs(str: string): Map<string, Map<string, IVec2>>  {
  // Remove all the blanks
  str = str.replace(/ /g, "");

  const pairs = new Map<string, Map<string, IVec2>>() ;

  for (let i = 0; i < str.length - 1; i++) {
    const current = str[i];
    const next = str[i + 1];
    if (!pairs.has(current)) {
      pairs.set(current, new Map<string, IVec2>());
    }
    const neighbours = pairs.get(current);
    if (neighbours) {
      neighbours.set(next, {x: 0, y: 0});
    }
  }

  return pairs;
}

/**
 * This is used to get the top-left corner position of each letter
 */
function estimateOffset(
  str: string,
  fontSize: number,
  fontFamily: string
): Map<string, [number, number]> {
  const offsets = new Map<string, [number, number]>();

  // Remove all the blanks
  str = str.replace(/ /g, "");

  for (let i = 0; i < str.length; i ++) {
    let minX = Number.MAX_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;

    // Canvas size is set twice the fontSize in order to cover the whole letter
    const canvas = document.createElement('canvas');
    canvas.width = fontSize * 2;
    canvas.height = fontSize * 2;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = ` ${fontSize}px ${fontFamily};`;
      ctx.textAlign = "left";
      ctx.textBaseline  = "hanging";
      ctx.fillText(str[i], 10, 10);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const a = data[(canvas.width * y + x) * 4 + 3];

          // When alpha is not zero, set the minX and minY
          if (a !== 0) {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
          }
        }
      }
    }

    offsets.set(str[i], [minX, minY]);
 }

 return offsets;
}

/**
 * This function is used to get the biggest Y and smallest Y of all the pixels in a single letter
 */
function measureHeight(
  letter: string,
  fontSize: number,
  fontFamily: string,
  glyphGridCellSize: number
): [number, number] {

  // Create the
  const canvas: HTMLCanvasElement = document.createElement("canvas");
  canvas.width = glyphGridCellSize;
  canvas.height = glyphGridCellSize;

  let firstY = -1;
  let lastY = -1;

  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = "middle";
    ctx.fillText(letter, glyphGridCellSize / 2, glyphGridCellSize / 2);
    const data = ctx.getImageData(0, 0, glyphGridCellSize, glyphGridCellSize).data;

    // Find the firstY from top to bottom
    for (let y = 0; y <= glyphGridCellSize; y++) {
      for (let x = 0; x <= glyphGridCellSize; x++) {
        const alpha = data[((glyphGridCellSize * y) + x) * 4 + 3];

        if (alpha > 0) {
            firstY = y;
            // Exit the x loop if the first pixel with alpha is found
            break;
        }
      }

      // Exit the y loop
      if (firstY >= 0) break;
    }

    // Find the lastY from bottom to top
    for (let y = glyphGridCellSize; y >= 0; y--) {
      for (let x = 0; x <= glyphGridCellSize; x++) {
        const alpha = data[((glyphGridCellSize * y) + x) * 4 + 3];

        if (alpha > 0) {
            lastY = y;
            // Exit the x loop
            break;
        }
      }

      // Exit the y loop
      if (lastY >= 0) break;
    }
  }

  return [firstY, lastY];
}

export interface IFontOptions extends IdentifyByKey, IResourceType {
  /** This resource must have it's type explcitly be set to a Font */
  type: ResourceType.FONT;
}

export class Font {
  constructor(options: IFontOptions) {
    //
  }

  /**
   * This function takes a sentence and grid info
   * Returns a canvas with a list of glyphs where each glyph fits cnetered with each grid cell
   * @param glyphs can be a string or single letter
   * @param fontSize
   * @param fontFamily
   * @param glyphGridWidth
   * @param glyphGridCellSize
   */
  makeBitmapGlyphs(
    glyphs: string,
    fontSize: number,
    fontFamily: string,
    glyphGridWidth: number,
    glyphGridCellSize: number
  ): IGlyphMetrics {

    // This defines how many cells in a row
    const glyphWide = glyphGridWidth / glyphGridCellSize;
    // It is used to store the metrics of each glyph
    const map = new Map<string, {gridNumber: number, topLeft: IVec2}>();
    // Split the glyphs
    const chars = glyphs.split("");
    // It is used to render all the glyph
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width = glyphGridWidth;
    canvas.height = glyphGridWidth;

    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.font = `;$;{fontSize;}px; $;{fontFamily;}`;

      // Measure width and height of each glyph to set the map
      for	(let i = 0, charLength = chars.length; i < charLength; i++) {
        const s = chars[i];
        const size = ctx.measureText(s);
        const height = measureHeight(s, fontSize, fontFamily,  glyphGridCellSize);

        map.set(s, {
          gridNumber: i,
          topLeft: {
            x: glyphGridCellSize / 2 - size.width / 2,
            y: glyphGridCellSize  - (height[0] + height[1]) / 2,
          },
        });
      }

      // Draw borders of each cell
      ctx.beginPath();
      ctx.strokeStyle = "black";
      ctx.lineWidth = 4;

      for (let i = 0; i <= glyphWide; i++) {
        ctx.moveTo(i * glyphGridCellSize, 0);
        ctx.lineTo(i * glyphGridCellSize, canvas.height);
        ctx.moveTo(0, i * glyphGridCellSize);
        ctx.lineTo(canvas.width, i * glyphGridCellSize);
      }

      ctx.stroke();

      // Draw horizontal and vertical center line of each cell
      ctx.beginPath();
      ctx.strokeStyle = "green";
      ctx.lineWidth = 1;

      for (let i = 0; i <= glyphWide; i++) {
        ctx.moveTo(i * glyphGridCellSize + glyphGridCellSize / 2, 0);
        ctx.lineTo(i * glyphGridCellSize + glyphGridCellSize / 2, canvas.height);
        ctx.moveTo(0, i * glyphGridCellSize + glyphGridCellSize / 2);
        ctx.lineTo(canvas.width, i * glyphGridCellSize + glyphGridCellSize / 2);
      }

      ctx.stroke();

      // Render all the glyphs use info from map
      ctx.fillStyle = "#FF0000";
      chars.forEach(c => {
        const glyph = map.get(c);

        if (glyph) {
          const index = glyph.gridNumber;
          const tl = glyph.topLeft;
          const j = Math.floor(index / glyphWide);
          const i = index % glyphWide;
          const x = i * glyphGridCellSize;
          const y = j * glyphGridCellSize;
          ctx.textBaseline = "middle";
          ctx.fillText(c, x + tl.x, y + tl.y);
        }
      });
    }

    return {
      canvas,
      glyphWide,
      glyphs: map,
    };
  }

  estimateKerning(
    str: string,
    fontSize: number,
    fontFamily: string
  ) {
    const pairs = stringToPairs(str);
    const offsets = estimateOffset(str, fontSize, fontFamily);
    renderEachPair(str, fontSize, fontFamily, pairs, offsets);
  }

}
