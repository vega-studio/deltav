/**
 * This file is dedicted to the all important step of processing desired inputs from the layer
 * and coming up with automated generated uniforms and attributes that the shader's will need
 * in order to operate with the conveniences the library offers. This includes things such as
 * injecting camera projection uniforms, resource uniforms, animation adjustments etc etc.
 */

import { IShaderInitialization, Layer } from '../surface/layer';
import { IInstanceAttribute, InstanceAttributeSize, InstanceBlockIndex, IUniform, IUniformInternal, IVertexAttribute, IVertexAttributeInternal, ShaderInjectionTarget, UniformSize, VertexAttributeSize } from '../types';
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

function sortByResourceAttributes<T>(a: IInstanceAttribute<T>, b: IInstanceAttribute<T>) {
  if (a.atlas && !b.atlas) return -1;
  return 1;
}

export function injectShaderIO<T extends Instance>(layer: Layer<T, any, any>, shaderIO: IShaderInitialization<T>) {
  // Retrieve all of the instance attributes that are atlas references
  const atlasInstanceAttributes: IInstanceAttribute<T>[] = [];
  // Key: The atlas uniform name requested
  const requestedAtlasInjections = new Map<string, [boolean, boolean]>();

  // Get the atlas requests that have unique names. We only need one uniform
  // For a single unique provided name. We also must merge the requests for
  // Vertex and fragment injections
  shaderIO.instanceAttributes.forEach(attribute => {
    if (attribute.atlas) {
      // Auto set the size of the attribute. Attribute's that are a resource automatically
      // Consume a size of four
      attribute.size = InstanceAttributeSize.FOUR;
      attribute.blockIndex = InstanceBlockIndex.ONE;
      // Get the atlas resource uniform (sampler2D) injection targets. We default to only the
      // Fragment shader as it's the most commonly used location for sampler2Ds
      const injection: number = attribute.atlas.shaderInjection || ShaderInjectionTarget.FRAGMENT;
      // See if we already have an injection for the given injected uniform name for an atlas resource.
      const injections = requestedAtlasInjections.get(attribute.atlas.name);

      if (injections) {
        requestedAtlasInjections.set(attribute.atlas.name, [
          injections[0] ||
          injection === ShaderInjectionTarget.VERTEX ||
          injection === ShaderInjectionTarget.ALL,
          injections[1] ||
          injection === ShaderInjectionTarget.FRAGMENT ||
          injection === ShaderInjectionTarget.ALL,
        ]);
      }

      else {
        atlasInstanceAttributes.push(attribute);
        requestedAtlasInjections.set(attribute.atlas.name, [
          injection === ShaderInjectionTarget.VERTEX ||
          injection === ShaderInjectionTarget.ALL,
          injection === ShaderInjectionTarget.FRAGMENT ||
          injection === ShaderInjectionTarget.ALL,
        ]);
      }
    }
  });

  // Make uniforms for all of the unique atlas requests.
  const atlasUniforms: IUniform[] = atlasInstanceAttributes.map(instanceAttribute => {
    const injections = requestedAtlasInjections.get(instanceAttribute.atlas.name);
    const injection =
      (injections[0] && injections[1] && ShaderInjectionTarget.ALL) ||
      (injections[0] && !injections[1] && ShaderInjectionTarget.VERTEX) ||
      (!injections[0] && injections[1] && ShaderInjectionTarget.FRAGMENT)
    ;

    return {
      name: instanceAttribute.atlas.name,
      shaderInjection: injection,
      size: UniformSize.ATLAS,
      update: () => layer.resource.getAtlasTexture(instanceAttribute.atlas.key),
    };
  });

  // These are the uniforms that should be present in the shader for basic operation
  const addedUniforms: IUniform[] = atlasUniforms.concat([
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
    // This injects the camera scaling uniforms that need to be present for projecting in a more
    // Chart centric style
    {
      name: 'viewSize',
      size: UniformSize.TWO,
      update: () => [layer.view.viewBounds.width, layer.view.viewBounds.height],
    },
    // This injects the current layer's pixel ratio so pixel ratio dependent items can react to it
    // Things like gl_PointSize will need this metric if not working in clip space
    {
      name: 'pixelRatio',
      size: UniformSize.ONE,
      update: () => [layer.view.pixelRatio],
    },
  ]);

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

  // Set the active attribute to the layer for quick reference
  layer.activeAttribute = addedInstanceAttributes[0];

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
    .sort(sortByResourceAttributes)
  ;

  return {
    instanceAttributes,
    uniforms,
    vertexAttributes,
  };
}
