import { Attribute, Geometry } from "../../gl";
import {
  type IIndexBufferInternal,
  IndexBufferSize,
  isNumber,
  IVertexAttribute,
  IVertexAttributeInternal,
  ShaderIOValue,
} from "../../types";
import { IndexBuffer } from "../../gl/index-buffer";
import { Instance } from "../../instance-provider/instance";
import { Layer } from "../layer";

function isNumberCluster(
  val: ShaderIOValue
): val is
  | [number]
  | [number, number]
  | [number, number, number]
  | [number, number, number, number] {
  return isNumber(val[0]);
}

/**
 * Produces the initial geometry for the vertex attributes and index buffers.
 *
 * These buffers can be manipulated and adjusted in the buffer managers, but
 * this provides a baseline for them to work with.
 */
export function generateLayerGeometry<T extends Instance>(
  _layer: Layer<T, any>,
  _maxInstancesPerBuffer: number,
  vertexAttributes: IVertexAttributeInternal[],
  vertexCount: number,
  indexBuffer?: IIndexBufferInternal
): Geometry {
  // Make the new buffers to be updated
  const vertexBuffers = [];

  for (let i = 0, end = vertexAttributes.length; i < end; ++i) {
    const attribute = vertexAttributes[i];
    vertexBuffers.push(new Float32Array(attribute.size * vertexCount));
  }

  // Let's now fill in the baseline geometry with the instances we will be
  // generating First we ask the layer for a single instance's buffer setup
  const endk = vertexAttributes.length;
  let buffer: Float32Array;
  let attribute: IVertexAttribute;
  let value: ShaderIOValue;
  let formatError = false;

  for (let i = 0, end = vertexCount; i < end; ++i) {
    for (let k = 0; k < endk; ++k) {
      attribute = vertexAttributes[k];
      buffer = vertexBuffers[k];
      value = attribute.update(i);

      if (isNumberCluster(value)) {
        for (
          let j = i * attribute.size, endj = j + attribute.size, index = 0;
          j < endj;
          ++j, ++index
        ) {
          buffer[j] = value[index];
        }
      } else {
        formatError = true;
      }
    }
  }

  if (formatError) {
    console.warn(
      "A vertex buffer updating method should not use arrays of arrays of numbers."
    );
  }

  // Now we can generate the attributes and apply them to a geometry object
  const geometry = new Geometry();

  // Generate the attributes, they are all Vertex attributes, thus instancing
  // does not get flagged on them.
  for (let i = 0, end = vertexAttributes.length; i < end; ++i) {
    const attribute = vertexAttributes[i];
    const materialAttribute = new Attribute(vertexBuffers[i], attribute.size);
    attribute.materialAttribute = materialAttribute;
    geometry.addAttribute(attribute.name, materialAttribute);
  }

  // Now we generate the initial index buffer for the geometry if it exists in
  // the shader intialization data.
  if (indexBuffer) {
    const totalIndices = indexBuffer.indexCount;
    const nextIndex = indexBuffer.update;
    const size = indexBuffer.size;
    let buffer: Uint8Array | Uint16Array | Uint32Array;

    // If were at more then 4 billion vertices references, we throw an error as
    // that's the max webgl2 supports.
    if (vertexCount > 4294967296) {
      throw new Error(
        "The maximum number of indices supported by webgl2 is 4294967296. You may have a vertex count or index count that is too large."
      );
    }

    switch (size) {
      case IndexBufferSize.UINT8:
        if (vertexCount > 65536) {
          buffer = new Uint32Array(totalIndices);
        } else if (vertexCount > 256) {
          buffer = new Uint16Array(totalIndices);
        } else {
          buffer = new Uint8Array(totalIndices);
        }
        break;

      case IndexBufferSize.UINT16:
        if (vertexCount > 65536) {
          buffer = new Uint32Array(totalIndices);
        } else {
          buffer = new Uint16Array(totalIndices);
        }
        break;

      case IndexBufferSize.UINT32:
        buffer = new Uint32Array(totalIndices);
        break;
    }

    // Loop through the total indices and populate our buffer
    for (let i = 0, end = totalIndices; i < end; ++i) {
      buffer[i] = nextIndex(i);
    }

    // Create the index buffer
    const materialIndexBuffer = new IndexBuffer(buffer, false, false);
    indexBuffer.materialIndexBuffer = materialIndexBuffer;
    geometry.setIndexBuffer(materialIndexBuffer);
  }

  return geometry;
}
