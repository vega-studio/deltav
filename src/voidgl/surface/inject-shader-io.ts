/**
 * This file is dedicted to the all important step of processing desired inputs from the layer
 * and coming up with automated generated uniforms and attributes that the shader's will need
 * in order to operate with the conveniences the library offers. This includes things such as
 * injecting camera projection uniforms, resource uniforms, animation adjustments etc etc.
 */
import * as Three from 'three';
import { IShaderInitialization, Layer } from '../surface/layer';
import {
  IAtlasInstanceAttribute,
  IInstanceAttribute,
  InstanceAttributeSize,
  InstanceBlockIndex,
  IUniform,
  IUniformInternal,
  IValueInstanceAttribute,
  IVertexAttribute,
  IVertexAttributeInternal,
  PickType,
  ShaderInjectionTarget,
  UniformSize,
  VertexAttributeSize,
} from '../types';
import { Instance } from '../util/instance';

const emptyTexture = new Three.Texture();

function isAtlasAttribute<T extends Instance>(attr: any): attr is IAtlasInstanceAttribute<T> {
  return Boolean(attr) && attr.atlas;
}

function isInstanceAttribute<T extends Instance>(attr: any): attr is IInstanceAttribute<T> {
  return Boolean(attr);
}

function isVertexAttribute(attr: any): attr is IVertexAttribute {
  return Boolean(attr);
}

function isUniform(attr: any): attr is IUniform {
  return Boolean(attr);
}

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
  let found: [number, number] | null = null;
  let maxBlock = 0;

  attributes.forEach(instanceAttribute => {
    const block = instanceAttribute.block;
    const index = instanceAttribute.blockIndex;
    const size = instanceAttribute.size || 1;

    if (index === undefined) {
      return;
    }

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

/**
 * This finds a uniform block that is completely empty
 */
function findEmpty4Block(attributes: IInstanceAttribute<any>[]): number {
  const usedBlocks = new Map<number, boolean>();

  attributes.forEach(instanceAttribute => {
    usedBlocks.set(instanceAttribute.block, true);
  });

  let found = 0;

  while (usedBlocks.get(found)) {
    found++;
  }

  return found;
}

function sortByResourceAttributes<T extends Instance>(a: IInstanceAttribute<T>, b: IInstanceAttribute<T>) {
  if (a.atlas && !b.atlas) return -1;
  return 1;
}

export function injectShaderIO<T extends Instance>(layer: Layer<T, any, any>, shaderIO: IShaderInitialization<T>) {
  // Retrieve all of the instance attributes that are atlas references
  const atlasInstanceAttributes: IAtlasInstanceAttribute<T>[] = [];
  // Key: The atlas uniform name requested
  const requestedAtlasInjections = new Map<string, [boolean, boolean]>();
  // All of the instance attributes with nulls filtered out
  const instanceAttributes = (shaderIO.instanceAttributes || []).filter(isInstanceAttribute);
  // All of the vertex attributes with nulls filtered out
  const vertexAttributes = (shaderIO.vertexAttributes || []).filter(isVertexAttribute);
  // All of the uniforms with nulls filtered out
  const uniforms = (shaderIO.uniforms || []).filter(isUniform);

  // Get the atlas requests that have unique names. We only need one uniform
  // For a single unique provided name. We also must merge the requests for
  // Vertex and fragment injections
  instanceAttributes.forEach((attribute: IValueInstanceAttribute<T> | IAtlasInstanceAttribute<T>) => {
    if (isAtlasAttribute(attribute)) {
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
    let injection: ShaderInjectionTarget = ShaderInjectionTarget.FRAGMENT;

    if (instanceAttribute.atlas) {
      const injections = requestedAtlasInjections.get(instanceAttribute.atlas.name);

      if (injections) {
        injection =
          (injections[0] && injections[1] && ShaderInjectionTarget.ALL) ||
          (injections[0] && !injections[1] && ShaderInjectionTarget.VERTEX) ||
          (!injections[0] && injections[1] && ShaderInjectionTarget.FRAGMENT) ||
          injection
        ;
      }
    }

    return {
      name: instanceAttribute.atlas.name,
      shaderInjection: injection,
      size: UniformSize.ATLAS,
      update: () => layer.resource.getAtlasTexture(instanceAttribute.atlas.key) || emptyTexture,
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
  const fillBlock = findEmptyBlock(instanceAttributes);
  // This is injected so the system can control when an instance should not be rendered.
  // This allows for holes to be in the buffer without having to correct them immediately
  const addedInstanceAttributes: IInstanceAttribute<T>[] = [{
    block: fillBlock[0],
    blockIndex: fillBlock[1],
    name: '_active',
    size: InstanceAttributeSize.ONE,
    update: (o) => [o.active ? 1 : 0],
  }];

  // If the layer is designed for single picking, then we add a Uniform that controls
  // When picking is enabled. We also add in an instance attribute that defines the color used for
  // Representing an instance
  if (layer.picking.type === PickType.SINGLE) {
    addedUniforms.push({
      name: 'pickingActive',
      shaderInjection: ShaderInjectionTarget.ALL,
      size: UniformSize.ONE,
      update: () => [layer.picking.currentPickMode === PickType.SINGLE ? 1.0 : 0.0],
    });

    // Find a compltely empty block within all instance attributes provided and injected
    const emptyFillBlock = findEmpty4Block(
      instanceAttributes
      .concat(addedInstanceAttributes),
    );
    addedInstanceAttributes.push({
      block: emptyFillBlock,
      blockIndex: InstanceBlockIndex.ONE,
      name: '_pickingColor',
      size: InstanceAttributeSize.FOUR,
      update: (o) => {
        // We start from white and move down so the colors are more visible
        // For debugging
        const color = 0xFFFFFF - o.uid;

        // Do bit maths do get float components out of the int color
        return [
          (color >> 16) / 255.0,
          ((color & 0x00FF00) >> 8) / 255.0,
          (color & 0x0000FF) / 255.0,
          1,
        ];
      },
    });
  }

  // Set the active attribute to the layer for quick reference
  layer.activeAttribute = addedInstanceAttributes[0];

  // These are the additional Vertex Attributes injected into the shader IO stream
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
  const allVertexAttributes: IVertexAttributeInternal[] =
    addedVertexAttributes
    .concat(vertexAttributes || [])
    .map(toVertexAttributeInternal)
  ;

  const allUniforms =
    addedUniforms
    .concat(uniforms)
    .map(toUniformInternal)
  ;

  const allInstanceAttributes =
    addedInstanceAttributes
    .concat(instanceAttributes)
    .sort(sortByResourceAttributes)
  ;

  return {
    instanceAttributes: allInstanceAttributes,
    uniforms: allUniforms,
    vertexAttributes: allVertexAttributes,
  };
}
