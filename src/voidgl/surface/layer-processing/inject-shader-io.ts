/**
 * This file is dedicted to the all important step of processing desired inputs from the layer
 * and coming up with automated generated uniforms and attributes that the shader's will need
 * in order to operate with the conveniences the library offers. This includes things such as
 * injecting camera projection uniforms, resource uniforms, animation adjustments etc etc.
 */
import * as Three from "three";
import { Instance } from "../../instance-provider/instance";
import {
  IAtlasInstanceAttribute,
  IEasingInstanceAttribute,
  IEasingProps,
  IInstanceAttribute,
  InstanceAttributeSize,
  InstanceBlockIndex,
  IShaderInitialization,
  IUniform,
  IUniformInternal,
  IValueInstanceAttribute,
  IVertexAttribute,
  IVertexAttributeInternal,
  PickType,
  ShaderInjectionTarget,
  UniformSize,
  VertexAttributeSize
} from "../../types";
import { uid, Vec } from "../../util";
import { AutoEasingLoopStyle } from "../../util/auto-easing-method";
import { ILayerProps, Layer } from "../layer";
import { getLayerBufferType, LayerBufferType } from "./layer-buffer-type";
import { packAttributes } from "./pack-attributes";

const { abs } = Math;

/**
 * This is a lookup for a test vector for the provided size
 */
const testStartVector: { [key: number]: Vec } = {
  [InstanceAttributeSize.ONE]: [1],
  [InstanceAttributeSize.TWO]: [1, 2],
  [InstanceAttributeSize.THREE]: [1, 2, 3],
  [InstanceAttributeSize.FOUR]: [1, 2, 3, 4]
};

/**
 * This is a lookup for a test vector for the provided size
 */
const testEndVector: { [key: number]: Vec } = {
  [InstanceAttributeSize.ONE]: [4],
  [InstanceAttributeSize.TWO]: [4, 3],
  [InstanceAttributeSize.THREE]: [4, 3, 2],
  [InstanceAttributeSize.FOUR]: [4, 3, 2, 1]
};

const emptyTexture = new Three.Texture();

function isAtlasAttribute<T extends Instance>(
  attr: any
): attr is IAtlasInstanceAttribute<T> {
  return Boolean(attr) && attr.atlas;
}

function isEasingAttribute<T extends Instance>(
  attr: any
): attr is IEasingInstanceAttribute<T> {
  return Boolean(attr) && attr.easing && attr.size !== undefined;
}

function isInstanceAttribute<T extends Instance>(
  attr: any
): attr is IInstanceAttribute<T> {
  return Boolean(attr);
}

function isVertexAttribute(attr: any): attr is IVertexAttribute {
  return Boolean(attr);
}

function isUniform(attr: any): attr is IUniform {
  return Boolean(attr);
}

function toVertexAttributeInternal(
  attribute: IVertexAttribute
): IVertexAttributeInternal {
  return Object.assign({}, attribute, { materialAttribute: null });
}

function toUniformInternal(uniform: IUniform): IUniformInternal {
  return Object.assign({}, uniform, { materialUniforms: [] });
}

/**
 * This sorts the attributes such that the attributes that MUST be updated first are put to the top.
 * This is necessary for complex attributes like atlas and easing attributes who have other attributes
 * that have dependent behaviors based on their source attribute.
 */
function sortNeedsUpdateFirstToTop<T extends Instance>(
  a: IInstanceAttribute<T>,
  b: IInstanceAttribute<T>
) {
  if (a.atlas && !b.atlas) return -1;
  if (a.easing && !b.easing) return -1;
  return 1;
}

/**
 * This generates any uniforms needed for when a layer is requesting
 */
function generateAtlasResourceUniforms<
  T extends Instance,
  U extends ILayerProps<T>
>(layer: Layer<T, U>, instanceAttributes: IInstanceAttribute<T>[]) {
  // Retrieve all of the instance attributes that are atlas references
  const atlasInstanceAttributes: IAtlasInstanceAttribute<T>[] = [];
  // Key: The atlas uniform name requested
  const requestedAtlasInjections = new Map<string, [boolean, boolean]>();

  // Get the atlas requests that have unique names. We only need one uniform
  // For a single unique provided name. We also must merge the requests for
  // Vertex and fragment injections
  instanceAttributes.forEach(
    (attribute: IValueInstanceAttribute<T> | IAtlasInstanceAttribute<T>) => {
      if (isAtlasAttribute(attribute)) {
        // Auto set the size of the attribute. Attribute's that are a resource automatically
        // Consume a size of four
        attribute.size = InstanceAttributeSize.FOUR;
        attribute.blockIndex = InstanceBlockIndex.ONE;
        // Get the atlas resource uniform (sampler2D) injection targets. We default to only the
        // Fragment shader as it's the most commonly used location for sampler2Ds
        const injection: number =
          attribute.atlas.shaderInjection || ShaderInjectionTarget.FRAGMENT;
        // See if we already have an injection for the given injected uniform name for an atlas resource.
        const injections = requestedAtlasInjections.get(attribute.atlas.name);

        if (injections) {
          requestedAtlasInjections.set(attribute.atlas.name, [
            injections[0] ||
              injection === ShaderInjectionTarget.VERTEX ||
              injection === ShaderInjectionTarget.ALL,
            injections[1] ||
              injection === ShaderInjectionTarget.FRAGMENT ||
              injection === ShaderInjectionTarget.ALL
          ]);
        } else {
          atlasInstanceAttributes.push(attribute);
          requestedAtlasInjections.set(attribute.atlas.name, [
            injection === ShaderInjectionTarget.VERTEX ||
              injection === ShaderInjectionTarget.ALL,
            injection === ShaderInjectionTarget.FRAGMENT ||
              injection === ShaderInjectionTarget.ALL
          ]);
        }
      }
    }
  );

  // Make uniforms for all of the unique atlas requests.
  return atlasInstanceAttributes.map(instanceAttribute => {
    let injection: ShaderInjectionTarget = ShaderInjectionTarget.FRAGMENT;

    if (instanceAttribute.atlas) {
      const injections = requestedAtlasInjections.get(
        instanceAttribute.atlas.name
      );

      if (injections) {
        injection =
          (injections[0] && injections[1] && ShaderInjectionTarget.ALL) ||
          (injections[0] && !injections[1] && ShaderInjectionTarget.VERTEX) ||
          (!injections[0] && injections[1] && ShaderInjectionTarget.FRAGMENT) ||
          injection;
      }
    }

    return {
      name: instanceAttribute.atlas.name,
      shaderInjection: injection,
      size: UniformSize.ATLAS,
      update: () =>
        layer.resource.getAtlasTexture(instanceAttribute.atlas.key) ||
        emptyTexture
    };
  });
}

/**
 * This modifies the instance attributes in a way that produces enough attributes to handle the easing equations
 * being performed on the gpu.
 */
function generateEasingAttributes<T extends Instance, U extends ILayerProps<T>>(
  layer: Layer<T, U>,
  instanceAttributes: IInstanceAttribute<T>[]
) {
  const easingAttributes: IEasingInstanceAttribute<T>[] = [];

  // We gather all of the easing attributes first so we can modify the attribute array
  // On next pass
  for (const attribute of instanceAttributes) {
    if (isEasingAttribute(attribute)) {
      easingAttributes.push(attribute);
    }
  }

  // Now loop through each easing attribute and generate attributes needed for the easing method
  for (const attribute of easingAttributes) {
    const { cpu: easing, loop } = attribute.easing;
    const { name, size, update } = attribute;
    const easingUID = uid();

    // We keep this in a scope above the update as we utilize the fact that the attributes will update
    // In order for a single instance to our advantage.
    let easingValues: IEasingProps;

    // Hijack the update from the attribute to a new update method which will
    // Be able to interact with the values for the easing methodology
    attribute.update = o => {
      // We retrieve properties that we want to be dynamic from the easing equation
      const { delay, duration } = attribute.easing;
      // First get the value that is to be our new destination
      const end = update(o);
      const currentTime = layer.surface.frameMetrics.currentTime;

      // Get the easing values specific to an instance
      easingValues = o.easing.get(easingUID) || {
        duration,
        end,
        start: end,
        startTime: currentTime
      };

      // Previous position time value
      let timeValue = 1;

      switch (loop) {
        // Continuous means we start at 0 and let the time go to infinity
        case AutoEasingLoopStyle.CONTINUOUS:
          timeValue = (currentTime - easingValues.startTime) / duration;
          break;

        // Repeat means going from 0 to 1 then 0 to 1 etc etc
        case AutoEasingLoopStyle.REPEAT:
          timeValue = ((currentTime - easingValues.startTime) / duration) % 1;
          break;

        // Reflect means going from 0 to 1 then 1 to 0 then 0 to 1 etc etc
        case AutoEasingLoopStyle.REFLECT:
          const timePassed = (currentTime - easingValues.startTime) / duration;
          // This is a triangle wave for an input
          timeValue = abs((timePassed / 2.0) % 1 - 0.5) * 2.0;
          break;

        // No loop means just linear time
        case AutoEasingLoopStyle.NONE:
        default:
          timeValue = (currentTime - easingValues.startTime) / duration;
          break;
      }

      // Now get the value of where our instance currently is located this frame
      easingValues.start = easing(
        easingValues.start,
        easingValues.end,
        timeValue
      );
      // Set the current time as the start time of our animation
      easingValues.startTime = currentTime + delay;
      // Set the provided value as our destination
      easingValues.end = end;
      // Make sure the instance contains the current easing values
      o.easing.set(easingUID, easingValues);

      return end;
    };

    // The attribute is going to generate some child attributes
    attribute.childAttributes = [];

    // Find a slot available for our new start value
    const startAttr: IInstanceAttribute<T> = {
      name: `_${name}_start`,
      parentAttribute: attribute,
      size,
      update: _o => easingValues.start
    };

    attribute.childAttributes.push(startAttr);
    instanceAttributes.push(startAttr);

    // Find a slot available for our new start time
    const startTimeAttr: IInstanceAttribute<T> = {
      name: `_${name}_start_time`,
      parentAttribute: attribute,
      size: InstanceAttributeSize.ONE,
      update: _o => [easingValues.startTime]
    };

    attribute.childAttributes.push(startTimeAttr);
    instanceAttributes.push(startTimeAttr);

    // Find a slot available for our duration
    const durationAttr: IInstanceAttribute<T> = {
      name: `_${name}_duration`,
      parentAttribute: attribute,
      size: InstanceAttributeSize.ONE,
      update: _o => [easingValues.duration]
    };

    attribute.childAttributes.push(durationAttr);
    instanceAttributes.push(durationAttr);
  }
}

function generatePickingUniforms<T extends Instance, U extends ILayerProps<T>>(
  layer: Layer<T, U>
): IUniform[] {
  if (layer.picking.type === PickType.SINGLE) {
    return [
      {
        name: "pickingActive",
        shaderInjection: ShaderInjectionTarget.ALL,
        size: UniformSize.ONE,
        update: () => [
          layer.picking.currentPickMode === PickType.SINGLE ? 1.0 : 0.0
        ]
      }
    ];
  }

  return [];
}

function generatePickingAttributes<
  T extends Instance,
  U extends ILayerProps<T>
>(layer: Layer<T, U>): IInstanceAttribute<T>[] {
  if (layer.picking.type === PickType.SINGLE) {
    return [
      {
        name: "_pickingColor",
        size: InstanceAttributeSize.FOUR,
        update: o => {
          // We start from white and move down so the colors are more visible
          // For debugging
          const color = 0xffffff - o.uid;

          // Do bit maths do get float components out of the int color
          return [
            (color >> 16) / 255.0,
            ((color & 0x00ff00) >> 8) / 255.0,
            (color & 0x0000ff) / 255.0,
            1
          ];
        }
      }
    ];
  }

  return [];
}

function generateBaseUniforms<T extends Instance, U extends ILayerProps<T>>(
  layer: Layer<T, U>
): IUniform[] {
  return [
    // This injects the projection matrix from the view camera
    {
      name: "projection",
      size: UniformSize.MATRIX4,
      update: () => layer.view.viewCamera.baseCamera.projectionMatrix.elements
    },
    // This injects the model view matrix from the view camera
    {
      name: "modelView",
      size: UniformSize.MATRIX4,
      update: () => layer.view.viewCamera.baseCamera.matrix.elements
    },
    // This injects the camera offset uniforms that need to be present for projecting in a more
    // Chart centric style
    {
      name: "cameraOffset",
      size: UniformSize.THREE,
      update: () => layer.view.camera.offset
    },
    // This injects the camera scaling uniforms that need to be present for projecting in a more
    // Chart centric style
    {
      name: "cameraScale",
      size: UniformSize.THREE,
      update: () => layer.view.camera.scale
    },
    // This injects the camera scaling uniforms that need to be present for projecting in a more
    // Chart centric style
    {
      name: "viewSize",
      size: UniformSize.TWO,
      update: () => [layer.view.viewBounds.width, layer.view.viewBounds.height]
    },
    // This injects the current layer's pixel ratio so pixel ratio dependent items can react to it
    // Things like gl_PointSize will need this metric if not working in clip space
    {
      name: "pixelRatio",
      size: UniformSize.ONE,
      update: () => [layer.view.pixelRatio]
    },
    // This will be the current frame's current time which is updated in the layer's surface draw call
    {
      name: "currentTime",
      size: UniformSize.ONE,
      update: () => [layer.surface.frameMetrics.currentTime]
    }
  ];
}

/**
 * This creates the base instance attributes that are ALWAYS present
 */
function generateBaseInstanceAttributes<T extends Instance>(
  layer: Layer<T, any>
): IInstanceAttribute<T>[] {
  // This is injected so the system can control when an instance should not be rendered.
  // This allows for holes to be in the buffer without having to correct them immediately
  const activeAttribute: IInstanceAttribute<T> = {
    name: "_active",
    size: InstanceAttributeSize.ONE,
    update: o => [o.active ? 1 : 0]
  };

  // Set the active attribute to the layer for quick reference
  layer.activeAttribute = activeAttribute;

  return [activeAttribute];
}

/**
 * This creates the base vertex attributes that are ALWAYS present
 */
function generateBaseVertexAttributes<T extends Instance>(
  layer: Layer<T, any>
): IVertexAttribute[] {
  // Only the uniform buffering strategy requires instance information in it's vertex attributes
  if (layer.bufferType === LayerBufferType.UNIFORM) {
    return [
      // We add an inherent instance attribute to our vertices so they can determine the instancing
      // Data to retrieve.
      {
        name: "instance",
        size: VertexAttributeSize.ONE,
        // We no op this as our geomtry generating routine will establish the values needed here
        update: () => [0]
      }
    ];
  }

  return [];
}

function compareVec(a: Vec, b: Vec) {
  if (a.length !== b.length) return false;

  for (let i = 0, end = a.length; i < end; ++i) {
    if (Math.round(a[i] * 100) / 100 !== Math.round(b[i] * 100) / 100) {
      return false;
    }
  }

  return true;
}

function validateInstanceAttributes<T extends Instance>(
  layer: Layer<T, any>,
  instanceAttributes: IInstanceAttribute<T>[],
  vertexAttributes: IVertexAttribute[]
) {
  instanceAttributes.forEach(attribute => {
    if (attribute.name === undefined) {
      console.warn(
        "All instance attributes MUST have a name on Layer:",
        layer.id
      );
    }

    if (
      instanceAttributes.find(
        attr => attr !== attribute && attr.name === attribute.name
      )
    ) {
      console.warn(
        "An instance attribute can not have the same name used more than once:",
        attribute.name
      );
    }

    if (vertexAttributes.find(attr => attr.name === attribute.name)) {
      console.warn(
        "An instance attribute and a vertex attribute in a layer can not share the same name:",
        attribute.name
      );
    }

    if (attribute.easing && attribute.atlas) {
      console.warn(
        "An instance attribute can not have both easing and atlas properties. Undefined behavior will occur."
      );
      console.warn(attribute);
    }

    if (!attribute.atlas) {
      if (attribute.size === undefined) {
        console.warn("An instance attribute requires the size to be defined.");
        console.warn(attribute);
      }
    }

    if (attribute.easing) {
      if (attribute.size !== undefined) {
        const testStart = testStartVector[attribute.size];
        const testEnd = testEndVector[attribute.size];
        const validationRules = attribute.easing.validation || {};

        let test = attribute.easing.cpu(testStart, testEnd, 0);
        if (!compareVec(test, testStart)) {
          console.warn(
            "Auto Easing Validation Failed: using a time of 0 does not produce the start value"
          );
          console.warn("Start:", testStart, "End:", testEnd, "Result:", test);
          console.warn(attribute);
        }

        test = attribute.easing.cpu(testStart, testEnd, 1);
        if (
          !validationRules.ignoreEndValueCheck &&
          !compareVec(test, testEnd)
        ) {
          console.warn(
            "Auto Easing Validation Failed: using a time of 1 does not produce the end value"
          );
          console.warn("Start:", testStart, "End:", testEnd, "Result:", test);
          console.warn(attribute);
        }

        test = attribute.easing.cpu(testStart, testEnd, -1);
        if (!compareVec(test, testStart)) {
          console.warn(
            "Auto Easing Validation Failed: using a time of -1 does not produce the start value"
          );
          console.warn("Start:", testStart, "End:", testEnd, "Result:", test);
          console.warn(attribute);
        }

        test = attribute.easing.cpu(testStart, testEnd, 2);
        if (
          !validationRules.ignoreOverTimeCheck &&
          !compareVec(test, testEnd)
        ) {
          console.warn(
            "Auto Easing Validation Failed: using a time of 2 does not produce the end value"
          );
          console.warn("Start:", testStart, "End:", testEnd, "Result:", test);
          console.warn(attribute);
        }
      } else {
        console.warn(
          "An Instance Attribute with easing MUST have a size declared"
        );
      }
    }
  });
}

/**
 * This is the primary method that analyzes all shader IO and determines which elements needs to be automatically injected
 * into the shader.
 */
export function injectShaderIO<T extends Instance, U extends ILayerProps<T>>(
  gl: WebGLRenderingContext,
  layer: Layer<T, U>,
  shaderIO: IShaderInitialization<T>
) {
  // All of the instance attributes with nulls filtered out
  const instanceAttributes = (shaderIO.instanceAttributes || []).filter(
    isInstanceAttribute
  );
  // All of the vertex attributes with nulls filtered out
  const vertexAttributes = (shaderIO.vertexAttributes || []).filter(
    isVertexAttribute
  );
  // All of the uniforms with nulls filtered out
  const uniforms = (shaderIO.uniforms || []).filter(isUniform);
  // Do a validation pass of the attributes injected so we can provide feedback as to why things behave odd
  validateInstanceAttributes(layer, instanceAttributes, vertexAttributes);
  // Generates all of the attributes needed to make attributes automagically be eased when changed
  generateEasingAttributes(layer, instanceAttributes);
  // Get the uniforms needed to facilitate atlas resource requests if any exists
  let addedUniforms: IUniform[] = uniforms.concat(
    generateAtlasResourceUniforms(layer, instanceAttributes)
  );
  // These are the uniforms that should be present in the shader for basic operation
  addedUniforms = addedUniforms.concat(generateBaseUniforms(layer));
  // Add in uniforms for picking
  addedUniforms = addedUniforms.concat(generatePickingUniforms(layer));
  // Create the base instance attributes that must be present
  let addedInstanceAttributes = instanceAttributes.concat(
    generateBaseInstanceAttributes(layer)
  );
  // Add in attributes for picking
  addedInstanceAttributes = addedInstanceAttributes.concat(
    generatePickingAttributes(layer)
  );

  const allUniforms = addedUniforms.map(toUniformInternal);

  const allInstanceAttributes = addedInstanceAttributes.sort(
    sortNeedsUpdateFirstToTop
  );

  // Let's pack in our attributes automagically so we can determine block and block indices.
  packAttributes(allInstanceAttributes);
  // Before we make the vertex attributes, we must determine the buffering strategy our layer will utilize
  getLayerBufferType(gl, layer, vertexAttributes, allInstanceAttributes);

  // Create the base vertex attributes that must be present
  const addedVertexAttributes: IVertexAttribute[] = generateBaseVertexAttributes(
    layer
  );

  // Aggregate all of the injected shaderIO with the layer's shaderIO
  const allVertexAttributes: IVertexAttributeInternal[] = addedVertexAttributes
    .concat(vertexAttributes || [])
    .map(toVertexAttributeInternal);

  return {
    instanceAttributes: allInstanceAttributes,
    uniforms: allUniforms,
    vertexAttributes: allVertexAttributes
  };
}