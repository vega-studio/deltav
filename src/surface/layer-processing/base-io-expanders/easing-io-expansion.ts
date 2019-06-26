import { Instance } from "../../../instance-provider";
import {
  ShaderDeclarationStatements,
  ShaderIOHeaderInjectionResult
} from "../../../shaders/processing/base-shader-io-injection";
import { MetricsProcessing } from "../../../shaders/processing/metrics-processing";
import { ILayerProps, Layer } from "../../../surface/layer";
import {
  FrameMetrics,
  IEasingInstanceAttribute,
  IEasingProps,
  IInstanceAttribute,
  InstanceAttributeSize,
  InstanceIOValue,
  IUniform,
  IVertexAttribute,
  ShaderInjectionTarget
} from "../../../types";
import { AutoEasingLoopStyle } from "../../../util/auto-easing-method";
import { EasingProps } from "../../../util/easing-props";
import {
  IShaderTemplateRequirements,
  shaderTemplate
} from "../../../util/shader-templating";
import { Vec, VecMath, VecMethods } from "../../../util/vector";
import { BaseIOExpansion, ShaderIOExpansion } from "../base-io-expansion";

const debugCtx = "EasingIOExpansion";

const { abs, max } = Math;

const BLANK_EASING_PROPS: IEasingProps = {
  duration: 0,
  start: [0],
  end: [0],
  startTime: 0
};

/** Converts a size to a shader type */
const sizeToType: { [key: number]: string } = {
  1: "float",
  2: "vec2",
  3: "vec3",
  4: "vec4",
  9: "mat3",
  16: "mat4",
  /** This is the special case for instance attributes that want an atlas resource */
  99: "vec4"
};

/**
 * These are the templating names used within Auto Easing gpu methods
 */
const templateVars = {
  easingMethod: "easingMethod",
  T: "T"
};

/**
 * Tests an attribute to see if it is an easing attribute
 */
function isEasingAttribute<T extends Instance>(
  attr: any
): attr is IEasingInstanceAttribute<T> {
  return Boolean(attr) && attr.easing && attr.size !== undefined;
}

/**
 * This is an expansion handler for easing attributes.
 */
export class EasingIOExpansion extends BaseIOExpansion {
  /** This is used to make it easy to remember an easing attribute's original name */
  private baseAttributeName = new Map<IInstanceAttribute<Instance>, string>();

  /**
   * Provides expanded IO for attributes with easing properties.
   *
   * Most of this process is hijacking the existing easing attribute to inject it's own
   * update method to handle calculating current position to animate to a new position
   * when a value is changed.
   *
   * This also provides new child attributes that must be changed when the original attributes
   * value is changed.
   */
  expand<T extends Instance, U extends ILayerProps<T>>(
    layer: Layer<T, U>,
    instanceAttributes: IInstanceAttribute<T>[],
    _vertexAttributes: IVertexAttribute[],
    _uniforms: IUniform[]
  ): ShaderIOExpansion<T> {
    const usedInstanceAttributes = new Set<number>();
    const easingAttributes: IEasingInstanceAttribute<T>[] = [];
    const newAttributes: IInstanceAttribute<T>[] = [];

    // We gather all of the easing attributes first so we can modify the attribute array
    // On next pass
    for (const attribute of instanceAttributes) {
      if (isEasingAttribute(attribute)) {
        easingAttributes.push(attribute);
      }
    }

    const easingIds: { [key: string]: number } = {};
    layer.easingId = easingIds;

    // Now loop through each easing attribute and generate attributes needed for the easing method
    for (let i = 0, iMax = easingAttributes.length; i < iMax; ++i) {
      const attribute = easingAttributes[i];
      const { cpu: easing, loop, uid: providedUID } = attribute.easing;
      const { name, size, update } = attribute;
      const easingUID = providedUID;

      // The attribute that is the primary attribute that declares the easing attribute
      // will become the "_end" attribute as whenever it is set, it will change the
      // destination value of the easing method.
      this.baseAttributeName.set(attribute, attribute.name);
      attribute.name = `_${attribute.name}_end`;

      // Make our easing ID lookup so instances can access their easing information for higher level
      // animation control.
      easingIds[attribute.name] = easingUID;

      // Ensure the AutoEasing method is unique
      if (usedInstanceAttributes.has(easingUID)) {
        console.error(
          "Undefined behavior occurs if you reuse an IAutoEasingMethod. Please ensure you are using uid() from the util to give the IAutoEasingMethod its uid, or just use the default provided methods"
        );
      }

      // Flag the uid of the easing method as used
      usedInstanceAttributes.add(easingUID);
      // We keep this in a scope above the update as we utilize the fact that the attributes will update
      // In the order they are declared for a single instance. The attributes will all share this information.
      const attributeDataShare: { values: IEasingProps } = {
        values: BLANK_EASING_PROPS
      };

      // Remove declaring any variables within the scope of the update method for speed
      let delay: number,
        attributeDelay: number,
        attributeDuration: number,
        duration: number,
        easingValues: IEasingProps,
        timeValue: number,
        end: InstanceIOValue,
        currentTime: number,
        frameMetrics: FrameMetrics,
        values: IEasingProps | undefined,
        vecMethods: VecMethods<Vec>;

      // Hijack the update from the attribute to a new update method which will
      // Be able to interact with the values for the easing methodology
      attribute.update = instance => {
        frameMetrics = layer.surface.frameMetrics;
        // We retrieve properties that we want to be dynamic from the easing equation
        attributeDelay = attribute.easing.delay;
        attributeDuration = attribute.easing.duration;
        // First get the value that is to be our new destination
        end = update(instance);
        currentTime = frameMetrics.currentTime;
        // Get the easing values specific to an instance.
        values = instance.easing.get(easingUID);

        // If the easing values do not exist yet, make them now
        if (!vecMethods || !values) {
          // Get all of the vector methods that apply to the provided item
          vecMethods = VecMath(end);

          values = new EasingProps({
            duration: attributeDuration,
            end: vecMethods.copy(end),
            start: vecMethods.copy(end),
            startTime: currentTime
          });

          // Make sure the instance contains the current easing values
          instance.easing.set(easingUID, values);
        }

        // On instance reactivation we want the easing to just be at it's end value
        else if (instance.reactivate) {
          values.end = vecMethods.copy(end);
          values.start = vecMethods.copy(end);
          values.startTime = currentTime;
        }

        // Assign the established values
        easingValues = values;
        duration = attributeDuration;
        delay = attributeDelay;

        if (easingValues.isTimeSet) {
          duration = easingValues.duration || attributeDuration;
          delay = easingValues.delay || 0;
        }

        if (!easingValues.isManualStart) {
          // Previous position time value
          timeValue = 1;

          switch (loop) {
            // Continuous means we start at 0 and let the time go to infinity
            case AutoEasingLoopStyle.CONTINUOUS:
              timeValue = (currentTime - easingValues.startTime) / duration;
              break;

            // Repeat means going from 0 to 1 then 0 to 1 etc etc
            case AutoEasingLoopStyle.REPEAT:
              timeValue =
                ((currentTime - easingValues.startTime) / duration) % 1;
              break;

            // Reflect means going from 0 to 1 then 1 to 0 then 0 to 1 etc etc
            case AutoEasingLoopStyle.REFLECT:
              const timePassed =
                (currentTime - easingValues.startTime) / duration;
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
        }

        // Set the current time as the start time of our animation
        easingValues.startTime = currentTime + delay;
        // Set the provided value as our destination
        easingValues.end = vecMethods.copy(end);
        // Update the information shared between this attribute and it's children
        attributeDataShare.values = easingValues;

        /** Set layer's animation end time */
        layer.animationEndTime = max(
          layer.animationEndTime,
          easingValues.startTime + duration + frameMetrics.frameDuration
        );

        return end;
      };

      // The attribute is going to generate some child attributes
      // Making the additional attributes children of this attribute
      // will force them to update when the parent attribute is updated.
      attribute.childAttributes = attribute.childAttributes || [];

      // Attribute for the start value of the animation
      const startAttr: IInstanceAttribute<T> = {
        name: `_${name}_start`,
        parentAttribute: attribute,
        size,
        update: _o => attributeDataShare.values.start
      };

      attribute.childAttributes.push(startAttr);
      newAttributes.push(startAttr);

      // Attribute for the starting time of the animation
      const startTimeAttr: IInstanceAttribute<T> = {
        name: `_${name}_start_time`,
        parentAttribute: attribute,
        size: InstanceAttributeSize.ONE,
        update: _o => [attributeDataShare.values.startTime]
      };

      attribute.childAttributes.push(startTimeAttr);
      newAttributes.push(startTimeAttr);

      // Attribute for how long the animation will run
      const durationAttr: IInstanceAttribute<T> = {
        name: `_${name}_duration`,
        parentAttribute: attribute,
        size: InstanceAttributeSize.ONE,
        update: _o => [attributeDataShare.values.duration]
      };

      attribute.childAttributes.push(durationAttr);
      newAttributes.push(durationAttr);
    }

    // Return all of the new attributes to work with
    return {
      instanceAttributes: newAttributes,
      vertexAttributes: [],
      uniforms: []
    };
  }

  /**
   * Validates the IO about to be expanded.
   */
  validate<T extends Instance, U extends ILayerProps<T>>(
    _layer: Layer<T, U>,
    instanceAttributes: IInstanceAttribute<T>[],
    _vertexAttributes: IVertexAttribute[],
    _uniforms: IUniform[]
  ): boolean {
    let foundError = false;

    instanceAttributes.forEach(attribute => {
      if (attribute.easing && attribute.resource) {
        console.warn(
          "An instance attribute can not have both easing and resource properties. Undefined behavior will occur."
        );
        console.warn(attribute);

        foundError = true;
      }

      if (attribute.easing) {
        if (attribute.size === undefined) {
          console.warn(
            "An Instance Attribute with easing MUST have a size declared"
          );
        }
      }
    });

    return !foundError;
  }

  /**
   * Easing provides some unique destructuring for the packed in vertex information.
   */
  processAttributeDestructuring(
    _layer: Layer<Instance, ILayerProps<Instance>>,
    declarations: ShaderDeclarationStatements,
    _metrics: MetricsProcessing,
    _vertexAttributes: IVertexAttribute[],
    instanceAttributes: IInstanceAttribute<Instance>[],
    _uniforms: IUniform[]
  ): string {
    // We analyze our instance attributes for easing attributes. When we find an attribute with
    // easing, we can make a quick assumption about the names of attributes provided that we can easily
    // use to destructure a properly named attribute that contains the correct algorithm to produce
    // the specified easing for the attribute.
    const out = "";

    for (let i = 0, iMax = instanceAttributes.length; i < iMax; ++i) {
      const attribute = instanceAttributes[i];

      // If this is the source easing attribute, we must add it in as an eased method along with a calculation for the
      // Easing interpolation time value based on the current time and the injected start time of the change.
      if (!attribute.easing || !attribute.size) continue;
      // Get the base name of the attribute since the original name gets changed for the expansion process.
      const baseName = this.baseAttributeName.get(attribute);

      if (!baseName) {
        console.warn(
          "Could not determine a base name for an easing attribute."
        );
        continue;
      }

      // Clear the basename out as it's only needed for this operation.
      this.baseAttributeName.delete(attribute);

      // We first write in the time calculation based on the loop style of the easing method
      const time = `_${baseName}_time`;
      const duration = `_${baseName}_duration`;
      const startTime = `_${baseName}_start_time`;

      switch (attribute.easing.loop) {
        // Continuous means letting the time go from 0 to infinity
        case AutoEasingLoopStyle.CONTINUOUS: {
          this.setDeclaration(
            declarations,
            time,
            `  float ${time} = (currentTime - ${startTime}) / ${duration};\n`,
            debugCtx
          );
          break;
        }

        // Repeat means going from 0 to 1 then 0 to 1 etc etc
        case AutoEasingLoopStyle.REPEAT: {
          this.setDeclaration(
            declarations,
            time,
            `  float ${time} = clamp(fract((currentTime - ${startTime}) / ${duration}), 0.0, 1.0);\n`,
            debugCtx
          );
          break;
        }

        // Reflect means going from 0 to 1 then 1 to 0 then 0 to 1 etc etc
        case AutoEasingLoopStyle.REFLECT: {
          const timePassed = `_${baseName}_timePassed`;
          const pingPong = `_${baseName}_pingPong`;

          // Get the time passed in a linear fashion
          this.setDeclaration(
            declarations,
            timePassed,
            `  float ${timePassed} = (currentTime - ${startTime}) / ${duration};\n`,
            debugCtx
          );
          // Make a triangle wave from the time passed to ping pong the value
          this.setDeclaration(
            declarations,
            pingPong,
            `  float ${pingPong} = abs((fract(${timePassed} / 2.0)) - 0.5) * 2.0;\n`,
            debugCtx
          );
          // Ensure we're clamped to the right values
          this.setDeclaration(
            declarations,
            time,
            `  float ${time} = clamp(${pingPong}, 0.0, 1.0);\n`,
            debugCtx
          );
          break;
        }

        // No loop means just linear time
        case AutoEasingLoopStyle.NONE:
        default: {
          this.setDeclaration(
            declarations,
            time,
            `  float ${time} = clamp((currentTime - ${startTime}) / ${duration}, 0.0, 1.0);\n`,
            debugCtx
          );
          break;
        }
      }

      // After the time calculation we inject the actual easing equation to calculate the value needed
      // for the attribute in the shader
      this.setDeclaration(
        declarations,
        baseName,
        `  ${sizeToType[attribute.size]} ${baseName} = ${
          attribute.easing.methodName
        }(_${baseName}_start, _${baseName}_end, _${baseName}_time);\n`,
        debugCtx
      );
    }

    return out;
  }

  /**
   * For easing, the header must be populated with the easing method
   */
  processHeaderInjection(
    target: ShaderInjectionTarget,
    declarations: ShaderDeclarationStatements,
    _layer: Layer<Instance, ILayerProps<Instance>>,
    _metrics: MetricsProcessing,
    _vertexAttributes: IVertexAttribute[],
    instanceAttributes: IInstanceAttribute<Instance>[],
    _uniforms: IUniform[]
  ): ShaderIOHeaderInjectionResult {
    const out = { injection: "" };

    // Easing equations are only applicable to the vertex shader where attribute destructuring happens
    if (target !== ShaderInjectionTarget.VERTEX) return out;

    const methods = new Map<string, Map<InstanceAttributeSize, string>>();
    out.injection = "// Auto Easing Methods specified by the layer\n";

    // First dedupe the methods needed by their method name
    instanceAttributes.forEach(attribute => {
      if (attribute.easing && attribute.size) {
        let methodSizes = methods.get(attribute.easing.methodName);

        if (!methodSizes) {
          methodSizes = new Map<InstanceAttributeSize, string>();
          methods.set(attribute.easing.methodName, methodSizes);
        }

        methodSizes.set(attribute.size, attribute.easing.gpu);
      }
    });

    if (methods.size === 0) {
      out.injection = "";
      return out;
    }

    const required: IShaderTemplateRequirements = {
      name: "Easing Method Generation",
      values: [templateVars.easingMethod]
    };

    // Now generate the full blown method for each element. We create overloaded methods for
    // Each method name for each vector size required
    methods.forEach(
      (methodSizes: Map<InstanceAttributeSize, string>, methodName: string) => {
        methodSizes.forEach((method, size) => {
          const sizeType = sizeToType[size];

          const templateOptions: { [key: string]: string } = {
            [templateVars.easingMethod]: `${sizeType} ${methodName}(${sizeType} start, ${sizeType} end, float t)`,
            [templateVars.T]: `${sizeType}`
          };

          const results = shaderTemplate({
            options: templateOptions,
            required,
            shader: method
          });

          this.setDeclaration(
            declarations,
            `${sizeType} ${methodName}`,
            `${results.shader}\n`,
            debugCtx
          );
        });
      }
    );

    return out;
  }
}
