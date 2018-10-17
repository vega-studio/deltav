import * as Three from "three";
import { Instance } from "../../instance-provider/instance";
import {
  IAtlasInstanceAttribute,
  IInstanceAttribute,
  InstanceAttributeSize,
  InstanceBlockIndex,
  IUniform,
  IValueInstanceAttribute,
  ShaderInjectionTarget,
  UniformSize
} from "../../types";
import { ILayerProps, Layer } from "../layer";

const emptyTexture = new Three.Texture();

function isAtlasAttribute<T extends Instance>(
  attr: any
): attr is IAtlasInstanceAttribute<T> {
  return Boolean(attr) && attr.atlas;
}

/**
 * This generates any uniforms needed for when a layer is requesting
 */
export function generateAtlasResourceUniforms<
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
  const uniforms = atlasInstanceAttributes.map(
    (instanceAttribute): IUniform[] => {
      let injection: ShaderInjectionTarget = ShaderInjectionTarget.FRAGMENT;

      if (instanceAttribute.atlas) {
        const injections = requestedAtlasInjections.get(
          instanceAttribute.atlas.name
        );

        if (injections) {
          injection =
            (injections[0] && injections[1] && ShaderInjectionTarget.ALL) ||
            (injections[0] && !injections[1] && ShaderInjectionTarget.VERTEX) ||
            (!injections[0] &&
              injections[1] &&
              ShaderInjectionTarget.FRAGMENT) ||
            injection;
        }
      }

      return [
        {
          name: instanceAttribute.atlas.name,
          shaderInjection: injection,
          size: UniformSize.ATLAS,
          update: () =>
            layer.resource.getAtlasTexture(instanceAttribute.atlas.key) ||
            emptyTexture
        },
        {
          name: `${instanceAttribute.atlas.name}_size`,
          shaderInjection: injection,
          size: UniformSize.TWO,
          update: () => {
            const atlas = layer.resource.getAtlasTexture(
              instanceAttribute.atlas.key
            );

            if (atlas && atlas.image) {
              const { width, height } = atlas.image;
              return [width || 1, height || 1];
            }

            return [1, 1];
          }
        }
      ];
    }
  );

  const flatten: IUniform[] = [];
  uniforms.forEach(list => list.forEach(uniform => flatten.push(uniform)));

  return flatten;
}
