import { dot2, subtract2, Vec2 } from "../../util/vector";

const { ceil, max, log2, pow, sqrt } = Math;

/** This is the pixel that  */
const NO_DATA: Vec2 = [-1, -1];

/**
 * Gets the seed array for the JFA
 */
function getSeed(canvas: HTMLCanvasElement, imageData: Uint8ClampedArray) {
  const { width, height } = canvas;
  let a;
  const buffer: Vec2[][] = [];
  const inverse: Vec2[][] = [];

  for (let i = 0; i < width; ++i) {
    buffer[i] = [];
    inverse[i] = [];

    for (let k = 0; k < height; ++k) {
      const redIndex = k * (width * 4) + i * 4;
      a = imageData[redIndex + 3];

      // Any non-transparent pixel is a seed
      if (a) {
        buffer[i][k] = [i, k];
        inverse[i][k] = NO_DATA;
      } else {
        buffer[i][k] = NO_DATA;
        inverse[i][k] = [i, k];
      }
    }
  }

  return {
    seed: buffer,
    inverse
  };
}

/**
 * Makes a buffer the same size as the input buffer. This assumes that the
 * input buffer is N x M in size, meaning each row is the same size.
 */
function makeEmptyBuffer(buffer: Vec2[][]) {
  const newBuffer: Vec2[][] = [];

  for (let i = 0, iMax = buffer.length; i < iMax; ++i) {
    newBuffer[i] = [];
  }

  return newBuffer;
}

/**
 * Takes a positional buffer and converts it to a distance field that is normalized to 0 - 255
 */
function normalizedDistanceField(
  buffer: Vec2[][],
  noData: Vec2,
  negate: boolean = false
) {
  const sign = negate ? -1 : 1;
  let position: Vec2, current: Vec2, direction: Vec2;
  let distance;
  const distanceBuffer: number[][] = [];
  let maxDistance: number = -1;

  // Calculate the distances and get the max distance so we can normalize the output
  for (let x = 0, xMax = buffer.length; x < xMax; ++x) {
    const col = buffer[x];
    distanceBuffer[x] = [];

    for (let y = 0, yMax = col.length; y < yMax; ++y) {
      position = col[y];

      if (position === noData) {
        distance = 256;
      } else {
        current = [x, y];
        direction = subtract2(position, current);
        distance = sqrt(dot2(direction, direction));
      }

      // Store the distance in our buffer for when we generate the canvas rendering
      distanceBuffer[x][y] = distance;
      // Update our max distance found so we can normalize the values
      maxDistance = max(distance, maxDistance);
    }
  }

  // Convert our distance buffer to our canvas buffer
  for (let x = 0, xMax = buffer.length; x < xMax; ++x) {
    const col = buffer[x];

    for (let y = 0, yMax = col.length; y < yMax; ++y) {
      distance = distanceBuffer[x][y];
      distanceBuffer[x][y] = distance / maxDistance * 255 * sign;
    }
  }

  return distanceBuffer;
}

/**
 * Takes the positional buffer of JFA and maps it to an Image Data buffer to be rendered as the canvas
 */
function mapToDistanceField(
  toSeedBuffer: Vec2[][],
  fromSeedBuffer: Vec2[][],
  noData: Vec2,
  outBuffer: Uint8ClampedArray
) {
  let outColor;
  // This is the distance field repsenting our distance to the seed values
  const toSeedDistance = normalizedDistanceField(toSeedBuffer, noData, true);
  // This is the negated distance field from the seed to the nearest non-seed slot
  const fromSeedDistance = normalizedDistanceField(
    fromSeedBuffer,
    noData,
    false
  );

  const width = toSeedDistance.length;
  const outputDistance = toSeedDistance;

  // Combine the buffers to get our font SDF
  for (let x = 0, xMax = toSeedDistance.length; x < xMax; ++x) {
    const toSeedCol = toSeedDistance[x];
    const fromSeedCol = fromSeedDistance[x];

    for (let y = 0, yMax = toSeedCol.length; y < yMax; ++y) {
      const toSeed = toSeedCol[y];
      const fromSeed = fromSeedCol[y];

      toSeedCol[y] = toSeed + fromSeed;
    }
  }

  for (let x = 0, xMax = outputDistance.length; x < xMax; ++x) {
    const toSeedCol = outputDistance[x];

    for (let y = 0, yMax = toSeedCol.length; y < yMax; ++y) {
      outColor = toSeedCol[y];
      // We use the 1 - signed distance (images are more human happy and algo happy)
      outColor = outColor;

      const redIndex = y * (width * 4) + x * 4;
      outBuffer[redIndex] = outColor;
      outBuffer[redIndex + 1] = outColor;
      outBuffer[redIndex + 2] = outColor;
      outBuffer[redIndex + 3] = 255;
    }
  }
}

/**
 * This contains the JFA pass logic portion of the algorithm. This requires the seedBuffer
 * and the number of passes to execute.
 */
function jfaPasses(seedBuffer: Vec2[][], passes: number) {
  const width = seedBuffer.length;
  const height = seedBuffer[0].length;
  // Set the current out to the seed as the each pass places the out into the read as the first step
  let readBuffer: Vec2[][] = makeEmptyBuffer(seedBuffer);
  let outBuffer: Vec2[][] = seedBuffer;
  let c: Vec2;
  let delta: Vec2;
  let samples: Vec2[];
  let nearestValue: number;
  let nearestIndex: number;
  let distance;
  let x, y, i;

  // We run the JFA passes over the buffers until complete
  for (let pass = 0; pass < passes; ++pass) {
    // We dont want to destroy the old read buffer as we will just write over the old data
    // so we don't allocate a new buffer for each pass.
    const temp = readBuffer;
    // Swap the out buffer from last pass to the read buffer of this pass
    readBuffer = outBuffer;
    // We now write to the other buffer
    outBuffer = temp;
    // Next make a new out buffer to write into
    const offset = pow(2, passes - pass - 1);

    // Now loop through all of the buffer 'pixels' and take the JFA sampling
    for (x = 0; x < width; ++x) {
      for (y = 0; y < height; ++y) {
        c = [x, y];
        samples = [
          (readBuffer[x - offset] || [])[y - offset] || NO_DATA,
          (readBuffer[x] || [])[y - offset] || NO_DATA,
          (readBuffer[x + offset] || [])[y - offset] || NO_DATA,
          (readBuffer[x - offset] || [])[y] || NO_DATA,
          (readBuffer[x] || [])[y] || NO_DATA,
          (readBuffer[x + offset] || [])[y] || NO_DATA,
          (readBuffer[x - offset] || [])[y + offset] || NO_DATA,
          (readBuffer[x] || [])[y + offset] || NO_DATA,
          (readBuffer[x + offset] || [])[y + offset] || NO_DATA
        ];

        nearestIndex = 0;
        nearestValue = Number.MAX_VALUE;

        for (i = 0; i < 9; ++i) {
          const s = samples[i];

          // NO_DATA does not require analysis
          if (s !== NO_DATA) {
            delta = subtract2(s, c);
            distance = dot2(delta, delta);

            if (distance < nearestValue) {
              nearestValue = distance;
              nearestIndex = i;
            }
          }
        }

        // We write to the buffer with our result which will either be NO_DATA or a pixel location
        outBuffer[x][y] = samples[nearestIndex];
      }
    }
  }

  return outBuffer;
}

/**
 * Redraws the contents of the provided canvas as a signed distance field.
 * Signed distance fields are great for many techniques.
 *
 * As of right now this SDF merely represents distance to nearest occupied
 * pixel.
 *
 * This  particular SDF calculation utilizes JFA
 *
 * This algortihm follows the following:
 * Make a buffer that is the size of the canvas and seed it with values equal to the pixel position of filled pixels
 * Next calculate how many passes JFA will need to run based on the size of the canvas: log_2(max dimension of the canvas)
 * Next sample the buffer in a 3x3 grid with each having an offset that is 2^(number of passes - current pass - 1). The center
 * sample is the current pixel.
 * Each sample will contain either NO DATA or will contain the pixel position of the nearest filled pixel.
 * Each sample will calculate the distance of the sample to the current pixel position, the nearest sample will fill the buffer at
 * that position.
 *
 * After all passes, the buffer should be filled with the nearest pixel positions. You can take that and map it to either distances
 * or use other techniques desired.
 */
export function convertToSDF(
  canvas: HTMLCanvasElement,
  mapMethod: (
    toSeedBuffer: Vec2[][],
    fromSeedBuffer: Vec2[][],
    noDataObject: Vec2,
    outData: Uint8ClampedArray
  ) => void = mapToDistanceField
) {
  const { width, height } = canvas;
  const context = canvas.getContext("2d");
  if (!context) return;

  const imageData = context.getImageData(0, 0, width, height).data;

  // This gets the dimension to use as our max dimension for the JFA algorithm pass calculation
  const maxDimension = max(width, height);
  // Determine how many passes to execute
  const passes = ceil(log2(maxDimension));
  // This is the initial seed buffer for the JFA
  const seedBuffer = getSeed(canvas, imageData);
  // Runt he passes on the initial seed buffer to make the positional buffer
  const positionBuffer = jfaPasses(seedBuffer.seed, passes);
  const inversePositionBuffer = jfaPasses(seedBuffer.inverse, passes);
  // Make an image data object that we can manipulate and apply to the canvas
  const outImageData = new ImageData(width, height);
  // Map the positional buffer to something that can be rendered to a canvas. By default, this will
  // be a distance field.
  mapMethod(positionBuffer, inversePositionBuffer, NO_DATA, outImageData.data);
  // Render the out data to the input canvas
  context.putImageData(outImageData, 0, 0);
}

/**
 * Makes a SDF of the input font specified
 */
export function makeFontSDF(_canvas: HTMLCanvasElement) {
  // TODO
}
