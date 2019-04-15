import { Instance } from "../../../instance-provider";
import { ILayerProps, Layer } from "../../../surface/layer";
import {
  FrameMetrics,
  IEasingInstanceAttribute,
  IEasingProps,
  IInstanceAttribute,
  InstanceAttributeSize,
  InstanceIOValue,
  IUniform,
  IVertexAttribute
} from "../../../types";
import { AutoEasingLoopStyle } from "../../../util/auto-easing-method";
import { EasingProps } from "../../../util/easing-props";
import { BaseIOExpansion, ShaderIOExpansion } from "../base-io-expansion";

const { abs, max } = Math;

const BLANK_EASING_PROPS: IEasingProps = {
  duration: 0,
  start: [0],
  end: [0],
  startTime: 0
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
        values: IEasingProps | undefined;

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
        if (!values) {
          values = new EasingProps({
            duration: attributeDuration,
            end,
            start: end,
            startTime: currentTime
          });

          // Make sure the instance contains the current easing values
          instance.easing.set(easingUID, values);
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
        easingValues.end = end;
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
      attribute.childAttributes = [];

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
}
