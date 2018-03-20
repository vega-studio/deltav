import { IShaderInitialization, Layer } from '../surface/layer';
import { IInstanceAttribute, InstanceAttributeSize, InstanceBlockIndex, IUniform, IUniformInternal, IVertexAttribute, IVertexAttributeInternal, UniformSize, VertexAttributeSize } from '../types';
import { Instance } from '../util/instance';

function toVertexAttributeInternal(attribute: IVertexAttribute): IVertexAttributeInternal {
  return Object.assign({}, attribute, { materialAttribute: null });
}

function toUniformInternal(uniform: IUniform): IUniformInternal {
  return Object.assign({}, uniform, { materialUniforms: [] });
}

/**
 * This searches through attribute packing for the first empty slot it can find to fill.
 * If a slot is not available it will just start a new block.
 */
function findEmptyBlock(attributes: IInstanceAttribute<any>[]): [number, number] {
  const blocks = new Map<number, Map<number, boolean>>();
  let found: [number, number] = null;
  let maxBlock = 0;

  attributes.forEach(instanceAttribute => {
    const block = instanceAttribute.block;
    const index = instanceAttribute.blockIndex;
    const size = instanceAttribute.size;
    let usedBlocks = blocks.get(block);

    maxBlock = Math.max(block, maxBlock);

    if (!usedBlocks) {
      usedBlocks = new Map<number, boolean>();
      blocks.set(block, usedBlocks);
    }

    for (let i = index, end = index + size; i < end; ++i) {
      usedBlocks.set(i, true);
    }
  });

  blocks.forEach((usedBlocks, block) => {
    if (!usedBlocks.get(1)) found = [block, InstanceBlockIndex.ONE];
    if (!usedBlocks.get(2)) found = [block, InstanceBlockIndex.TWO];
    if (!usedBlocks.get(3)) found = [block, InstanceBlockIndex.THREE];
    if (!usedBlocks.get(4)) found = [block, InstanceBlockIndex.FOUR];
  });

  // If no block was ever found, then we take the max block detected and make
  // A new block after it
  if (!found) {
    found = [maxBlock + 1, 0];
  }

  return found;
}

export function injectShaderIO<T extends Instance>(layer: Layer<T, any, any>, shaderIO: IShaderInitialization<T>) {
  // Let us examine the IO specified by the layer and see if there is any special needs that can generate
  // Extra IO to help facilitate those needs, such as a Layer requesting an Atlas resource.
  const usesAtlasResource = Boolean(shaderIO.instanceAttributes.find(attribute => attribute.size === InstanceAttributeSize.ATLAS));

  // These are the uniforms that should be present in the shader for basic operation
  const addedUniforms: IUniform[] = [
    // This injects the projection matrix from the view camera
    {
      name: 'projection',
      size: UniformSize.MATRIX4,
      update: () => layer.view.viewCamera.baseCamera.projectionMatrix.elements,
    },
    // This injects the model view matrix from the view camera
    {
      name: 'modelView',
      size: UniformSize.MATRIX4,
      update: () => layer.view.viewCamera.baseCamera.matrix.elements,
    },
    // This injects the camera offset uniforms that need to be present for projecting in a more
    // Chart centric style
    {
      name: 'cameraOffset',
      size: UniformSize.THREE,
      update: () => layer.view.camera.offset,
    },
    // This injects the camera scaling uniforms that need to be present for projecting in a more
    // Chart centric style
    {
      name: 'cameraScale',
      size: UniformSize.THREE,
      update: () => layer.view.camera.scale,
    },
  ].filter(Boolean);

  // Seek an empty block within the layer provided uniforms so we can fill a hole potentially
  // With the _active attribute.
  const fillBlock = findEmptyBlock(shaderIO.instanceAttributes);
  const addedInstanceAttributes: IInstanceAttribute<T>[] = [
    // This is injected so the system can control when an instance should not be rendered.
    // This allows for holes to be in the buffer without having to correct them immediately
    {
      block: fillBlock[0],
      blockIndex: fillBlock[1],
      name: '_active',
      size: InstanceAttributeSize.ONE,
      update: (o) => [o.active ? 1 : 0],
    },
  ];

  const addedVertexAttributes: IVertexAttribute[] = [
    // We add an inherent instance attribute to our vertices so they can determine the instancing
    // Data to retrieve.
    {
      name: 'instance',
      size: VertexAttributeSize.ONE,
      // We no op this as our geomtry generating routine will establish the values needed here
      update: () => [0],
    },
  ];

  // Aggregate all of the injected shaderIO with the layer's shaderIO
  const vertexAttributes: IVertexAttributeInternal[] =
    addedVertexAttributes
    .concat(shaderIO.vertexAttributes)
    .map(toVertexAttributeInternal)
  ;

  const uniforms =
    addedUniforms
    .concat(shaderIO.uniforms)
    .map(toUniformInternal)
  ;

  const instanceAttributes =
    addedInstanceAttributes
    .concat(shaderIO.instanceAttributes)
  ;

  return {
    instanceAttributes,
    uniforms,
    vertexAttributes,
  };
}
