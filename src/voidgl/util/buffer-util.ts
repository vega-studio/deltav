/**
 * This class and set of methods is provided to attempt to create as efficient as possible
 * methods for updating large vertex buffers with values. The first portion of the file is
 * a list of methods and registers. This is to prevent any instantiation needed for the methods
 * and registers to exist. Also, the methods have no useable parent scope to ensure nothing like
 * a 'this' is used. These methods utilize the registers and their own simple loops to pound
 * through large amounts of information while providing capabilities to edit vertices in batches.
 *
 * You will also notice there are many many similar methods with just a single extra parameter
 * here and there. This is to prevent ANY calculations on trying to determine a proper parameter set
 * while also making method calls directly without any .call or .apply.
 *
 * The number of update methods is how many differing attributes are supported. If you need more supported
 * attributes add an updateBufferN method and provide the required attributes. Insert the logic in the EXACT
 * pattern seen in the other methods. DO NOT attempt to add additional logic lest the performance be something
 * terrible.
 *
 * The BufferUtil class makes use of these methods and registers. It also provides some very handy methods
 * for working with your large buffers.
 */

import {
  BufferAttribute,
  BufferGeometry,
  IUniform,
  Mesh,
  ShaderMaterial,
  TrianglesDrawMode,
  TriangleStripDrawMode,
  Vector4,
} from 'three';
import { IVertexAttribute } from 'voidgl/types';
import { BaseBuffer } from './base-buffer';
import { MultiShapeBufferCache } from './multi-shape-buffer-cache';
import { WebGLStat } from './webgl-stat';
const debugGenerator = require('debug');
const debug = require('debug')('WebGLSurface:BufferUtil');

export enum TriangleOrientation {
  // The triangles points are clockwise
  CW,
  // The triangles points are Counter clockwise
  CCW,
  // The triangles points are linear, thus degenerate
  DEGENERATE,
}

export enum AttributeSize {
  ONE,
  TWO,
  THREE,
  FOUR,
}

export enum UniformAttributeSize {
  ONE,
  TWO,
  THREE,
  FOUR,
}

/**
 * This specifies some intiialization info regarding vertex attributes.
 */
export interface IAttributeInfo {
  customFill?(buffer: Float32Array, vertex: number, start: number, defaults: number[]): void;
  defaults: number[],
  initWithBuffer?: Float32Array;
  name: string,
  size: AttributeSize,
}

/**
 * This specifies some initialization info regarding attributes that are packed
 * into a uniform instance buffer.
 */
export interface IUniformAttribute {
  name: string,
  size: UniformAttributeSize,
  block: number,
}

export interface IUniformBuffer {
  blocksPerInstance: number;
  buffer: Vector4[];
  maxInstances: number;
}

/**
 * These are all of the items needed for rendering and determining if a re-render
 * is necessary
 */
export interface IBufferItems<T, U> {
  attributes: IAttributeInfo[],
  currentData: T[],
  geometry: BufferGeometry,
  system: U,
  uniformAttributes: IUniformAttribute[],
  uniformBuffer: IUniformBuffer,
}

export type InitVertexBufferMethod<T, U> = () => BaseBuffer<T, U>;
export type UpdateVertexBufferMethod<T, U> = (vertexBuffer: BaseBuffer<T, U>, shapeBuffer: T[]) => boolean;

/**
 * These are for fast look ups of the default values provided
 * Doing this fashion avoids array look ups in the defaults values
 */
let defaultsHolder0: number = 0;
let defaultsHolder1: number = 0;
let defaultsHolder2: number = 0;
let defaultsHolder3: number = 0;

/**
 * These are for fast look ups of attribute buffers that are going
 * through the update process. We do everything to mitigate array look ups
 * when and where we can
 */
let attrRegister0: number[] = [];
let attrRegister1: number[] = [];
let attrRegister2: number[] = [];
let attrRegister3: number[] = [];
let attrRegister4: number[] = [];
let attrRegister5: number[] = [];
let attrRegister6: number[] = [];
let attrRegister7: number[] = [];
let attrRegister8: number[] = [];
let attrRegister9: number[] = [];
let attrRegister10: number[] = [];

let attrIndex0: number = 0;
let attrIndex1: number = 0;
let attrIndex2: number = 0;
let attrIndex3: number = 0;
let attrIndex4: number = 0;
let attrIndex5: number = 0;
let attrIndex6: number = 0;
let attrIndex7: number = 0;
let attrIndex8: number = 0;
let attrIndex9: number = 0;
let attrIndex10: number = 0;

let attrIndexIncr0: number = 0;
let attrIndexIncr1: number = 0;
let attrIndexIncr2: number = 0;
let attrIndexIncr3: number = 0;
let attrIndexIncr4: number = 0;
let attrIndexIncr5: number = 0;
let attrIndexIncr6: number = 0;
let attrIndexIncr7: number = 0;
let attrIndexIncr8: number = 0;
let attrIndexIncr9: number = 0;
let attrIndexIncr10: number = 0;

/** This is used to define a starting batch location to aid in continuing batch updates */
let lastBatchRegister: number = 0;
let isStreamUpdatingRegister: boolean = false;

/**
 * This takes our list of attribute buffers and applies them to the registers for rapid lookups
 *
 * @param {number[][]} attributeBuffers The buffers for each attribute to be updated
 * @param {number[]} incrementValues How much each batch increments it's lookup index
 */
function applyAttributeRegisters(attributeBuffers: number[][], incrementValues: number[]) {
  attrRegister0 = attributeBuffers[0];
  attrRegister1 = attributeBuffers[1];
  attrRegister2 = attributeBuffers[2];
  attrRegister3 = attributeBuffers[3];
  attrRegister4 = attributeBuffers[4];
  attrRegister5 = attributeBuffers[5];
  attrRegister6 = attributeBuffers[6];
  attrRegister7 = attributeBuffers[7];
  attrRegister8 = attributeBuffers[8];
  attrRegister9 = attributeBuffers[9];
  attrRegister10 = attributeBuffers[10];

  attrIndexIncr0 = incrementValues[0];
  attrIndexIncr1 = incrementValues[1];
  attrIndexIncr2 = incrementValues[2];
  attrIndexIncr3 = incrementValues[3];
  attrIndexIncr4 = incrementValues[4];
  attrIndexIncr5 = incrementValues[5];
  attrIndexIncr6 = incrementValues[6];
  attrIndexIncr7 = incrementValues[7];
  attrIndexIncr8 = incrementValues[8];
  attrIndexIncr9 = incrementValues[9];
  attrIndexIncr10 = incrementValues[10];
}

/**
 * The following methods are targetted at executing the update accessor with varying number
 * of parameters while mitigating array look ups.
 *
 * @param {number} numBatches The number of batches to execute
 * @param {Function} updateAccessor The accessor function that will update the buffer values
 */
function updateBuffer1(numBatches: number, updateAccessor: Function) {
  for (let i = lastBatchRegister; i < numBatches; ++i) {
    attrIndex0 = i * attrIndexIncr0;
    updateAccessor(i - lastBatchRegister, attrRegister0, attrIndex0);
  }
}

function updateBuffer2(numBatches: number, updateAccessor: Function) {
  for (let i = lastBatchRegister; i < numBatches; ++i) {
    attrIndex0 = i * attrIndexIncr0;
    attrIndex1 = i * attrIndexIncr1;
    updateAccessor(i - lastBatchRegister, attrRegister0, attrIndex0, attrRegister1, attrIndex1);
  }
}

function updateBuffer3(numBatches: number, updateAccessor: Function) {
  for (let i = lastBatchRegister; i < numBatches; ++i) {
    attrIndex0 = i * attrIndexIncr0;
    attrIndex1 = i * attrIndexIncr1;
    attrIndex2 = i * attrIndexIncr2;
    updateAccessor(i - lastBatchRegister, attrRegister0, attrIndex0, attrRegister1, attrIndex1, attrRegister2, attrIndex2);
  }
}

function updateBuffer4(numBatches: number, updateAccessor: Function) {
  for (let i = lastBatchRegister; i < numBatches; ++i) {
    attrIndex0 = i * attrIndexIncr0;
    attrIndex1 = i * attrIndexIncr1;
    attrIndex2 = i * attrIndexIncr2;
    attrIndex3 = i * attrIndexIncr3;
    updateAccessor(i - lastBatchRegister, attrRegister0, attrIndex0, attrRegister1, attrIndex1, attrRegister2, attrIndex2, attrRegister3, attrIndex3);
  }
}

function updateBuffer5(numBatches: number, updateAccessor: Function) {
  for (let i = lastBatchRegister; i < numBatches; ++i) {
    attrIndex0 = i * attrIndexIncr0;
    attrIndex1 = i * attrIndexIncr1;
    attrIndex2 = i * attrIndexIncr2;
    attrIndex3 = i * attrIndexIncr3;
    attrIndex4 = i * attrIndexIncr4;
    updateAccessor(i - lastBatchRegister, attrRegister0, attrIndex0, attrRegister1, attrIndex1, attrRegister2, attrIndex2, attrRegister3, attrIndex3, attrRegister4, attrIndex4);
  }
}

function updateBuffer6(numBatches: number, updateAccessor: Function) {
  for (let i = lastBatchRegister; i < numBatches; ++i) {
    attrIndex0 = i * attrIndexIncr0;
    attrIndex1 = i * attrIndexIncr1;
    attrIndex2 = i * attrIndexIncr2;
    attrIndex3 = i * attrIndexIncr3;
    attrIndex4 = i * attrIndexIncr4;
    attrIndex5 = i * attrIndexIncr5;
    updateAccessor(i - lastBatchRegister, attrRegister0, attrIndex0, attrRegister1, attrIndex1, attrRegister2, attrIndex2, attrRegister3, attrIndex3, attrRegister4, attrIndex4, attrRegister5, attrIndex5);
  }
}

function updateBuffer7(numBatches: number, updateAccessor: Function) {
  for (let i = lastBatchRegister; i < numBatches; ++i) {
    attrIndex0 = i * attrIndexIncr0;
    attrIndex1 = i * attrIndexIncr1;
    attrIndex2 = i * attrIndexIncr2;
    attrIndex3 = i * attrIndexIncr3;
    attrIndex4 = i * attrIndexIncr4;
    attrIndex5 = i * attrIndexIncr5;
    attrIndex6 = i * attrIndexIncr6;
    updateAccessor(i - lastBatchRegister, attrRegister0, attrIndex0, attrRegister1, attrIndex1, attrRegister2, attrIndex2, attrRegister3, attrIndex3, attrRegister4, attrIndex4, attrRegister5, attrIndex5, attrRegister6, attrIndex6);
  }
}

function updateBuffer8(numBatches: number, updateAccessor: Function) {
  for (let i = lastBatchRegister; i < numBatches; ++i) {
    attrIndex0 = i * attrIndexIncr0;
    attrIndex1 = i * attrIndexIncr1;
    attrIndex2 = i * attrIndexIncr2;
    attrIndex3 = i * attrIndexIncr3;
    attrIndex4 = i * attrIndexIncr4;
    attrIndex5 = i * attrIndexIncr5;
    attrIndex6 = i * attrIndexIncr6;
    attrIndex7 = i * attrIndexIncr7;
    updateAccessor(
      i - lastBatchRegister,
      attrRegister0, attrIndex0,
      attrRegister1, attrIndex1,
      attrRegister2, attrIndex2,
      attrRegister3, attrIndex3,
      attrRegister4, attrIndex4,
      attrRegister5, attrIndex5,
      attrRegister6, attrIndex6,
      attrRegister7, attrIndex7,
    );
  }
}

function updateBuffer9(numBatches: number, updateAccessor: Function) {
  for (let i = lastBatchRegister; i < numBatches; ++i) {
    attrIndex0 = i * attrIndexIncr0;
    attrIndex1 = i * attrIndexIncr1;
    attrIndex2 = i * attrIndexIncr2;
    attrIndex3 = i * attrIndexIncr3;
    attrIndex4 = i * attrIndexIncr4;
    attrIndex5 = i * attrIndexIncr5;
    attrIndex6 = i * attrIndexIncr6;
    attrIndex7 = i * attrIndexIncr7;
    attrIndex8 = i * attrIndexIncr8;
    updateAccessor(
      i - lastBatchRegister,
      attrRegister0, attrIndex0,
      attrRegister1, attrIndex1,
      attrRegister2, attrIndex2,
      attrRegister3, attrIndex3,
      attrRegister4, attrIndex4,
      attrRegister5, attrIndex5,
      attrRegister6, attrIndex6,
      attrRegister7, attrIndex7,
      attrRegister8, attrIndex8,
    );
  }
}

function updateBuffer10(numBatches: number, updateAccessor: Function) {
  for (let i = lastBatchRegister; i < numBatches; ++i) {
    attrIndex0 = i * attrIndexIncr0;
    attrIndex1 = i * attrIndexIncr1;
    attrIndex2 = i * attrIndexIncr2;
    attrIndex3 = i * attrIndexIncr3;
    attrIndex4 = i * attrIndexIncr4;
    attrIndex5 = i * attrIndexIncr5;
    attrIndex6 = i * attrIndexIncr6;
    attrIndex7 = i * attrIndexIncr7;
    attrIndex8 = i * attrIndexIncr8;
    attrIndex9 = i * attrIndexIncr9;
    updateAccessor(
      i - lastBatchRegister,
      attrRegister0, attrIndex0,
      attrRegister1, attrIndex1,
      attrRegister2, attrIndex2,
      attrRegister3, attrIndex3,
      attrRegister4, attrIndex4,
      attrRegister5, attrIndex5,
      attrRegister6, attrIndex6,
      attrRegister7, attrIndex7,
      attrRegister8, attrIndex8,
      attrRegister9, attrIndex9,
    );
  }
}

function updateBuffer11(numBatches: number, updateAccessor: Function) {
  for (let i = lastBatchRegister; i < numBatches; ++i) {
    attrIndex0 = i * attrIndexIncr0;
    attrIndex1 = i * attrIndexIncr1;
    attrIndex2 = i * attrIndexIncr2;
    attrIndex3 = i * attrIndexIncr3;
    attrIndex4 = i * attrIndexIncr4;
    attrIndex5 = i * attrIndexIncr5;
    attrIndex6 = i * attrIndexIncr6;
    attrIndex7 = i * attrIndexIncr7;
    attrIndex8 = i * attrIndexIncr8;
    attrIndex9 = i * attrIndexIncr9;
    attrIndex10 = i * attrIndexIncr10;
    updateAccessor(
      i - lastBatchRegister,
      attrRegister0, attrIndex0,
      attrRegister1, attrIndex1,
      attrRegister2, attrIndex2,
      attrRegister3, attrIndex3,
      attrRegister4, attrIndex4,
      attrRegister5, attrIndex5,
      attrRegister6, attrIndex6,
      attrRegister7, attrIndex7,
      attrRegister8, attrIndex8,
      attrRegister9, attrIndex9,
      attrRegister10, attrIndex10,
    );
  }
}

/**
 * This takes the defaults array provided and loads them into our default
 * lookup values
 *
 * @param {number[]} defaults The array with the default values in them for our buffer attribute
 */
function applyDefaultsHolders(defaults: number[]) {
  defaultsHolder0 = defaults[0] || 0;
  defaultsHolder1 = defaults[1] || 0;
  defaultsHolder2 = defaults[2] || 0;
  defaultsHolder3 = defaults[3] || 0;
}

/**
 * The following methods are rapid ways of populating the buffer without
 * setting up a generic loop. This saves on performance by not creating a loop
 * nor allocating the variables necessary for the generic loop.
 *
 * @param {Float32Array} buffer The buffer to populate
 * @param {number} start The index the data should be populated into
 */
function fillSize1(buffer: Float32Array, start: number) {
  buffer[start] = defaultsHolder0;
}

function fillSize2(buffer: Float32Array, start: number) {
  buffer[start] = defaultsHolder0;
  buffer[++start] = defaultsHolder1;
}

function fillSize3(buffer: Float32Array, start: number) {
  buffer[start] = defaultsHolder0;
  buffer[++start] = defaultsHolder1;
  buffer[++start] = defaultsHolder2;
}

function fillSize4(buffer: Float32Array, start: number) {
  buffer[start] = defaultsHolder0;
  buffer[++start] = defaultsHolder1;
  buffer[++start] = defaultsHolder2;
  buffer[++start] = defaultsHolder3;
}

function isList<T>(val: T | T[]): val is T[] {
  if (Array.isArray(val)) return true;
  return false;
}

/**
 * This is a quick lookup to find the correct filler method for the given attribute size
 */
const fillMethodLookUp = {
  [AttributeSize.ONE]: fillSize1,
  [AttributeSize.TWO]: fillSize2,
  [AttributeSize.THREE]: fillSize3,
  [AttributeSize.FOUR]: fillSize4,
};

const updateBufferLookUp: {[key: number]: (numBatches: number, updateAccessor: Function) => void} = {
  1: updateBuffer1,
  2: updateBuffer2,
  3: updateBuffer3,
  4: updateBuffer4,
  5: updateBuffer5,
  6: updateBuffer6,
  7: updateBuffer7,
  8: updateBuffer8,
  9: updateBuffer9,
  10: updateBuffer10,
  11: updateBuffer11,
};

/**
 * This provides methods for handling common buffer tasks such as construction
 * and population.
 */
export class BufferUtil {
  /**
   * This places our updateBuffer into a mode where the updates start at index 0 of the
   * buffer. Subsequent calls will start where the previous call left off. This lets
   * you stream in updates to the buffer rather than just update the entire buffer
   * all at once.
   */
  static beginUpdates() {
    isStreamUpdatingRegister = true;
    lastBatchRegister = 0;
  }

  /**
   * This takes the buffer items and cleans up their use within memory as best as possible.
   *
   * @param bufferItems
   */
  static dispose<T, U>(buffers: IBufferItems<T, U>[]) {
    if (buffers) {
      buffers.forEach(bufferItems => {
        bufferItems.attributes = null;
        bufferItems.currentData = null;
        bufferItems.geometry.dispose();
        bufferItems.geometry = null;
        bufferItems.system = null;
      });
    }
  }

  /**
   * This stops updates streaming into the buffers and makes it where an update
   * will always just start at the beginning of the buffer.
   */
  static endUpdates(): number {
    const totalBatches = lastBatchRegister;
    isStreamUpdatingRegister = false;
    lastBatchRegister = 0;

    return totalBatches;
  }

  /**
   * It is often needed to examine a given buffer and see how the triangles are packed in.
   * This is a common debugging need and will speed up debugging significantly.
   *
   * @param {IBufferItems<T, U>} bufferItems This is the buffer whose structure we want
   *                                         to examine.
   * @param {string} message This is the message for the debug statement. There are two
   *                         predefined %o. The first is the vertex information the second
   *                         is the uniform info. Leave null for a default message.
   * @param {string} debugNamespace The namespace for the debugging info.
   */
  static examineBuffer<T, U extends Mesh>(bufferItems: IBufferItems<T, U>, message: string, debugNamespace: string) {
    // Get the appropriate debug namespace
    const debugBuffer = debugGenerator(debugNamespace);

    // Quick quit if the debugger is not enabled
    if (!debugBuffer.enabled) {
      return;
    }

    const attributes = bufferItems.attributes;
    const buffer = bufferItems.geometry;
    // Get the attributes by name out of the three js buffer
    const bufferAttributes: any[] = attributes.map((attr: IAttributeInfo) => (buffer.attributes as any)[attr.name]);
    // Get the raw number buffers
    const attributeBuffers: number[][] = bufferAttributes.map((attr: any) => attr.array as number[]);

    // This will store all of the examined triangles for easy viewing
    const triangles = [];

    if (bufferItems.system.drawMode === TrianglesDrawMode) {
      let currentVertex = 0;
      let attrSize = 0;
      let currentIndex = 0;
      const length = buffer.drawRange.start + buffer.drawRange.count;

      while (currentVertex < length) {
        const tri: any = {
          vertex_0: {},
          vertex_1: {},
          vertex_2: {},
        };

        // Each new triangle is a culmination of three vertices which are packed in
        // The buffer with no vertex sharing
        for (let i = 0; i < 3; ++i) {
          attributes.forEach((attr, index) => {
            attrSize = attr.size + 1;
            currentIndex = currentVertex * attrSize;
            tri[`vertex_${i}`][attr.name] = attributeBuffers[index].slice(currentIndex, currentIndex + attrSize);
          });

          // Move to the next vertex
          currentVertex++;
        }

        // Store the calculated tri
        triangles.push(tri);
      }
    }

    else if (bufferItems.system.drawMode === TriangleStripDrawMode) {
      let currentVertex = 0;
      let attrSize = 0;
      let currentIndex = 0;
      const length = buffer.drawRange.start + buffer.drawRange.count;

      while (currentVertex < length) {
        const tri: any = {
          vertex_0: {},
          vertex_1: {},
          vertex_2: {},
        };

        // Each new triangle is three vertices, where the first two are shared with
        // The previous triangle's last two vertices
        for (let i = 0; i < 3; ++i) {
          attributes.forEach((attr, index) => {
            attrSize = attr.size + 1;
            currentIndex = currentVertex * attrSize;
            tri[`vertex_${i}`][attr.name] = attributeBuffers[index].slice(currentIndex, currentIndex + attrSize);
          });

          // Move to the next vertex
          currentVertex++;
        }

        // Go back two vertices as the next tri will use them + the next vertex to
        // Make the next triangle
        currentVertex -= 2;

        // Store the calculated tri
        triangles.push(tri);
      }
    }

    // Log the debug info to the console using the debug utility
    debugBuffer(message || 'vertices: %o uniforms: %o', {
      drawRange: buffer.drawRange,
      triangles,
    }, (bufferItems.system.material as ShaderMaterial).uniforms);
  }

  /**
   * Aids in taking in multiple multibuffers and flattening it to a single list
   *
   * @param multiShapeBuffers
   */
  static flattenMultiBuffers<T>(multiShapeBuffers: MultiShapeBufferCache<T | T[]>[]) {
    let all: T[] = [];

    function isCluster(value: (T | T[])[]): value is T[][] {
      return value[0] && Array.isArray(value[0]);
    }

    multiShapeBuffers.forEach(multiBuffer => {
      multiBuffer.getBuffers().forEach(buffer => {
        if (isCluster(buffer)) {
          buffer.forEach(cluster => all = all.concat(cluster));
        }

        else {
          all = all.concat(buffer as T[]);
        }
      });
    });

    return all;
  }

  /**
   * @static
   * This helps aid in updating a complex multi buffer. It will establish when a new
   * buffer needs to be created and initialized and it will automatically call a BaseBuffer's
   * update when an update is detected as a need for the buffer.
   *
   * @param multiShapeBuffer
   * @param buffers
   * @param init
   *
   * @return {boolean} True if a buffer was updated
   */
  static updateMultiBuffer<T, U>(multiShapeBuffer: MultiShapeBufferCache<T> | MultiShapeBufferCache<T>[], buffers: BaseBuffer<T, U>[], init: InitVertexBufferMethod<T, U>, update: UpdateVertexBufferMethod<T, U>, forceUpdates?: boolean): boolean {
    // If no buffers provided, then we do not need to update anything
    if (!multiShapeBuffer) {
      return false;
    }

    // This flag indicates whether an update occurred or not
    let didUpdate = false;
    // Get the shape buffers we need rendered into vertex buffers
    let shapeBuffers;

    // If this is a list of multibuffers, we flatten out all of the sub buffers
    // This is a one level deep flatten as we do not want to accidentally handle shape clustering here
    if (isList(multiShapeBuffer)) {
      shapeBuffers = multiShapeBuffer.reduce((flat, toFlatten) => flat.concat(toFlatten.getBuffers()), []);
    }

    // The input is simply a single multibuffer. Just get it's list of buffers
    else {
      shapeBuffers = multiShapeBuffer.getBuffers();
    }

    // Make a lookup to identify the buffers that already exists for the given multi shape buffers
    const bufferLookup = new Map<T[], BaseBuffer<T, U>>();
    buffers.forEach(buffer => bufferLookup.set(buffer.bufferItems.currentData, buffer));

    // This will store all of the shape buffers that needs to be rendered into a vertex buffer
    let needsBuffer: T[][] = [];

    // If we're forcing updates then we should be ensuring all shapeBuffers needs a buffer
    // And leave all of the bufferLookup so they will all be updated with the provided needed shape buffer updates
    if (forceUpdates) {
      needsBuffer = [].concat(shapeBuffers);
    }

    // If a buffer for the shape buffer exists the buffer does not need an update, as it did not change
    // Then remove the buffer for that shape buffer
    // Otherwise, the shape buffer needs an update
    else {
      shapeBuffers.forEach(shapes => {
        if (bufferLookup.get(shapes)) {
          bufferLookup.delete(shapes);
        }

        else if (shapes.length > 0) {
          needsBuffer.push(shapes);
        }
      });
    }

    // All buffers remaining in the buffer lookup are available for re-rendering the
    // Shape buffers that still needs updates

    // If the shape buffers needing updates is greater than the vertex buffers available
    // Then we update with what we have and initialize any additional vertex buffers needed
    if (needsBuffer.length >= bufferLookup.size) {
      // Take any buffer that is not found with an existing shape buffer and update it
      // With a buffer that needs an update
      bufferLookup.forEach((value: BaseBuffer<T, U>) => {
        didUpdate = update(value, needsBuffer.shift()) || didUpdate;
      });

      // Any remaining buffers that need updates will have to initialize a buffer
      // To cram it in
      needsBuffer.forEach(shapeBuffer => {
        const vertexBuffer = init();
        buffers.push(vertexBuffer);
        didUpdate = update(vertexBuffer, shapeBuffer) || didUpdate;
      });
    }

    // If the buffers available are greater than the shape buffers to be rendered
    // Then we update the vertex buffers needed, and we update the remaining vertex
    // Buffers with zero draw ranges
    else {
      const vertexBuffers = Array.from(bufferLookup.values());
      needsBuffer.forEach(shapeBuffer => {
        const vertexBuffer = vertexBuffers.shift();
        didUpdate = update(vertexBuffer, shapeBuffer) || didUpdate;
      });

      vertexBuffers.forEach(buffer => {
        buffer.bufferItems.geometry.setDrawRange(0, 0);
      });
    }

    return didUpdate;
  }

  /**
   * @static
   * This handles many of the common tasks associated with constructing a new buffer
   * such as applying the name, generating the buffer, and populating default values to
   * that buffer.
   *
   * @param {number} numVertices The number of vertices this buffer will have
   * @param {IAttributeInfo[]} attributes A description of each attribute in the buffer
   *
   * @returns {BufferGeometry} The newly made buffer
   */
  static makeBuffer(numVertices: number, attributes: IVertexAttribute[]): BufferGeometry {
    const iMax = attributes.length;
    const geometry = new BufferGeometry();
    let totalAttributeSize = 0;
    let foundPosition: boolean = false;

    for (let i = 0; i < iMax; ++i) {
      const attribute = attributes[i];
      const attributeSize = attribute.size;
      totalAttributeSize += attributeSize;
      const name = attribute.name;
      const injectBuffer = attribute.initWithBuffer;
      const buffer = injectBuffer || new Float32Array(attributeSize * numVertices);
      const fillMethod = fillMethodLookUp[attribute.size - 1];
      const customFill = attribute.update;
      const defaults = attribute.defaults;

      if (name === 'position') {
        foundPosition = true;
      }

      // If an explicit buffer was not provided, then we fill with the defaults
      if (!injectBuffer) {
        if (customFill) {
          // Let the custom fill method populate the buffer with whatever so be desired
          for (let k = 0; k < numVertices; ++k) {
            customFill(buffer, k, k * attributeSize, defaults);
          }
        }

        else {
          // We set up our default value registers before executing the fill method
          applyDefaultsHolders(defaults);

          // Fill our buffer with the indicated default values
          for (let k = 0; k < numVertices; ++k) {
            fillMethod(buffer, k * attributeSize);
          }
        }
      }

      // Apply the buffer to our geometry buffer
      const attr = new BufferAttribute(buffer, attributeSize);
      attr.setDynamic(true);
      geometry.addAttribute(name, attr);
      debug('Made Buffer Attribute:', name, attributeSize);
    }

    if (!foundPosition) {
      console.warn(
        'It is recommended you ALWAYS use the position attribute as one of your attributes',
        'There are features of threejs that REQUIRES this to be in place (even if not explicitly',
        'documented). You don\'t have to use for exact position information, rather fill it with something',
        'you need. Failure to do so will have you see consequences that are EXTREMELY hard to find.',
      );
    }

    if (totalAttributeSize > 16) {
      console.warn('A Buffer has specified more attributes than available. The max is 16 and the buffer provided:', totalAttributeSize);
    }

    return geometry;
  }

  /**
   *
   * @param attributes
   * @param sharedBuffer
   */
  static shareBuffer(attributes: IAttributeInfo[], sharedBuffer: BufferGeometry) {
    const bufferAttributes = sharedBuffer.attributes;
    const newBuffer = new BufferGeometry();

    for (const attr of attributes) {
      const shareAttribute = (bufferAttributes as any)[attr.name] as BufferAttribute;

      if (shareAttribute) {
        newBuffer.addAttribute(attr.name, shareAttribute);
      }

      else {
        console.warn('Could not find attribute', attr, 'in the buffer to be shared. Can not share buffers properly');
      }
    }

    return newBuffer;
  }

  /**
   * Generates the necessary metrics based on uniform attributes to generate a uniform buffer for
   * rendering.
   *
   * @param uniforms
   */
  static makeUniformBuffer(uniforms: IUniformAttribute[]): IUniformBuffer {
    let maxBlock = 0;
    const buffer: Vector4[] = [];
    const uniformBufferBlockMax = WebGLStat.MAX_VERTEX_INSTANCE_DATA;
    const sizeCheck: {[key: number]: number} = {};

    uniforms.forEach(uniform => {
      maxBlock = Math.max(uniform.block, maxBlock);
      const check = sizeCheck[uniform.block] = (sizeCheck[uniform.block] || 0) + (uniform.size + 1);

      if (check > 4) {
        console.warn('There were too many uniform attribute usages of a single block:', uniform);
      }
    });

    for (let i = 0; i < uniformBufferBlockMax; ++i) {
      buffer.push(new Vector4(0, 0, 0, 0));
    }

    return {
      blocksPerInstance: maxBlock + 1,
      buffer,
      maxInstances: Math.floor(uniformBufferBlockMax / maxBlock),
    };
  }

  /**
   * @static
   * This handles many of the common tasks associated with updating a buffer. You specify how many vertices
   * to update in a batch and you specify how many batches are present.
   *
   * Batches are used to represent your full shape object that is being loaded from the cpu:
   *
   * IE- you have a rectangle object you wish to update in your buffer. This takes around 6 vertices typically
   * so you make your vertexBatch 6 and the numBatches the number of quads you need to update in the buffer.
   *
   * You then provide an accessor which aids in pointing to the buffer items that need updating. The accessor has
   * variable arguments depending on the attributes you inject in.
   *
   * If you have attributes like:
   * [
   *  {name: position, size: AttributeSize.Three},
   *  {name: color, size: AttributeSize.Four},
   * ]
   *
   * Then your accessor will be delievered arguments in this form:
   *
   * function(batchIndex: number, positionBuffer: number[], positionIndex: number, colorBuffer: number[], colorIndex: number)
   *
   * NOTE: The params handed in ARE ORDERED BY the attributes injected in
   *
   * You then can update the buffers based on the index information handed alongside each buffer
   *
   * @param {T[]} newData The new data that is going to be injected into the buffer. This must be a NEW REFERENCE of data
   *                      that does NOT match the reference in the bufferItems.currentData. So newData !== bufferItems.currentData
   *                      in order for the update to occur.
   * @param {BufferGeometry} bufferItems The buffer related items used to identify how to update the buffer
   * @param {number} vertexBatch The number of vertices to include per update batch
   * @param {number} numBatches The number of batches to execute
   * @param {Function} updateAccessor The accessor for performing the data update to the buffer
   * @param {boolean} force This bypasses the typical checks that determines if the buffer SHOULD update.
   *
   * @return {boolean} True if the buffer was updated with this call
   */
  static updateBuffer<T, U>(newData: T[], bufferItems: IBufferItems<T, U>, vertexBatch: number, numBatches: number, updateAccessor: Function, force?: boolean): boolean {
    const attributes = bufferItems.attributes;
    const buffer = bufferItems.geometry;

    // If we passed the data check on the first pass, then all future streamed updates
    // Should pass as well
    const testPerformed = lastBatchRegister !== 0 && isStreamUpdatingRegister;

    // We check if there is a reference change in the data indicating a buffer push needs to happen
    if ((newData !== undefined && newData !== bufferItems.currentData) || testPerformed || force) {
      // If we aren't streaming updates, then we always start at the beginning
      if (!isStreamUpdatingRegister) {
        // Reset out last batch register as this is an entriely new update
        lastBatchRegister = 0;
      }

      // Flag the newly rendered data as our current data
      bufferItems.currentData = newData;
      // Get the attributes by name out of the three js buffer
      const bufferAttributes: any[] = attributes.map((attr: IAttributeInfo) => (buffer.attributes as any)[attr.name]);
      // Get the raw number buffers
      const attributeBuffers: number[][] = bufferAttributes.map((attr: any) => attr.array as number[]);
      // Determine what kind of buffer pointer increments we will need
      const incrementValues: number[] = attributes.map((attr: IAttributeInfo) => (attr.size + 1) * vertexBatch);
      // Apply all data needed to any registers we need
      applyAttributeRegisters(attributeBuffers, incrementValues);
      // Get the method that will perform the update based on number of attributes
      const updateMethod = updateBufferLookUp[attributes.length];
      // Execute the update method
      updateMethod(numBatches + lastBatchRegister, updateAccessor);
      // Flag each buffer attribute for needing an update
      bufferAttributes.forEach((attr: BufferAttribute) => {
        if (attr.updateRange) {
          attr.updateRange.offset = 0;
          attr.updateRange.count = vertexBatch * (lastBatchRegister + numBatches) * attr.itemSize;
        }
        attr.needsUpdate = true;
      });
      // Move our register forward in case we are in a stream update
      lastBatchRegister += numBatches;

      return true;
    }

    // Even if the data does not match, keep moving forward the appropriate amount in
    // The buffer
    else {
      // Move our register forward in case we are in a stream update
      lastBatchRegister += numBatches;
    }

    return false;
  }

  /**
   * This is an alternative way to specify data for rendering. This updates information within the
   * uniform blocks to specify instancing data (the alternative is just updating a vertex buffer
   * with all of the data needed for every piece of geometry for every instance). This update method
   * CAN save massive amounts of committed data for large geometry items (ie curves). It requires a
   * different pipeline to make work (your shader must specify a uniform vec4 instanceData[], and
   * your shape buffer to vertex buffer conversion must have a static vertex buffer).
   *
   * This is like a vertex buffer update except the updateAccessor will be of this format:
   *
   * updateAccessor(instanceIndex: number, uniformBlock0: Vector4, ..., uniformBlockN: Vector4);
   *
   * Where the uniform blocks provided will appear in the same order the IUniformAttributes were in
   * when the uniform buffer was created.
   *
   */
  static updateUniformBuffer<T, U>(newData: T[], bufferItems: IBufferItems<T, U>, instanceBatchSize: number, updateAccessor: Function, force?: boolean): boolean {
    // If we passed the data check on the first pass, then all future streamed updates
    // Should pass as well
    const testPerformed = lastBatchRegister !== 0 && isStreamUpdatingRegister;

    // We check if there is a reference change in the data indicating a buffer push needs to happen
    if ((newData !== undefined && newData !== bufferItems.currentData) || testPerformed || force) {
      // If we aren't streaming updates, then we always start at the beginning
      if (!isStreamUpdatingRegister) {
        // Reset out last batch register as this is an entriely new update
        lastBatchRegister = 0;
      }

      const material: ShaderMaterial = (bufferItems.system as any).material as ShaderMaterial;
      const uniforms: {[key: string]: IUniform} = material.uniforms;
      const instanceData: IUniform = uniforms.instanceData;
      bufferItems.currentData = newData;

      // If the instance data uniform is available and it is the proper vec4 array type, then we
      // Are able to update the uniform buffer
      if (instanceData && (instanceData as any).type === 'v4v' || (instanceData as any).type === 'bvec4' && bufferItems.uniformBuffer) {
        const attributes = bufferItems.uniformAttributes;
        const blocksPerInstance = bufferItems.uniformBuffer.blocksPerInstance;
        const buffer = bufferItems.uniformBuffer.buffer;
        const maxInstances = bufferItems.uniformBuffer.maxInstances;
        let currentInstance = lastBatchRegister;
        let currentInstanceStartBlock = lastBatchRegister * blocksPerInstance;

        // We loop and update as many instances as specified, only up to the
        // Number of instances allowed for the uniform buffer
        for (let i = 0; i < instanceBatchSize && currentInstance < maxInstances; ++i) {
          // Our current instance depends on our lastBatchRegister we utilize
          // When begin() is called
          currentInstance = lastBatchRegister + i;
          // We get the first block the instance will utilize
          currentInstanceStartBlock = blocksPerInstance * currentInstance;
          // This will contain all of our arguments the accessor will use
          const updateArguments: any[] = [currentInstance];

          // Loop through the attributes in the order they appear and gather the block they will
          // Update
          for (const attribute of attributes) {
            updateArguments.push(buffer[attribute.block + currentInstanceStartBlock]);
          }

          // Call the update accessor for the instance using the gathered arguments
          // TODO: This should be done with registers like vertex array buffer updates for Optimal
          // Performance. A method apply is very slow compared to the register way.
          updateAccessor.apply(null, updateArguments);
        }

        // Tell the uniform to update with the new dataset
        instanceData.value = [].concat(buffer);
      }

      else {
        console.warn('A uniform buffer update was specified on a material that lacks uniform buffer usage');
        return false;
      }

      // Move our register forward in case we are in a stream update
      lastBatchRegister += instanceBatchSize;

      return true;
    }

    // Even if the data does not match, keep moving forward the appropriate amount in
    // The buffer
    else {
      // Move our register forward in case we are in a stream update
      lastBatchRegister += instanceBatchSize;
    }

    return false;
  }

  /**
   * This makes all of the typical items used in creating and managing a buffer of items rendered to the screen
   *
   * @returns {IBufferItems<T>} An empty object of the particular buffer items needed
   */
  static makeBufferItems<T, U>(): IBufferItems<T, U> {
    return {
      attributes: [],
      currentData: [],
      geometry: null,
      system: null,
      uniformAttributes: [],
      uniformBuffer: null,
    };
  }
}
