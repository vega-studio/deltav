import { Texture } from "../../gl/texture";
import { Instance } from "../../instance-provider/instance";
import { isAtlasResource } from "../../resources/texture/atlas";
import {
  IInstanceAttribute,
  InstanceAttributeSize,
  InstanceBlockIndex,
  IResourceInstanceAttribute,
  IUniform,
  IValueInstanceAttribute,
  ResourceType,
  ShaderInjectionTarget,
  UniformSize
} from "../../types";
import { ILayerProps, Layer } from "../layer";

/** Empty texture that will default to the zero texture and unit */
const emptyTexture = new Texture({
  data: {
    width: 1,
    height: 1,
    data: new Uint8ClampedArray(4)
  }
});

function isAtlasAttribute<T extends Instance>(
  attr: any
): attr is IResourceInstanceAttribute<T> {
  return (
    Boolean(attr) && attr.resource && attr.resource.type === ResourceType.ATLAS
  );
}

/**
 * This generates any uniforms needed for when a layer is requesting
 */
export function generateAtlasResourceUniforms<
  T extends Instance,
  U extends ILayerProps<T>
>(layer: Layer<T, U>, instanceAttributes: IInstanceAttribute<T>[]) {
  // Retrieve all of the instance attributes that are atlas references
  const atlasInstanceAttributes: IResourceInstanceAttribute<T>[] = [];
  // Key: The atlas uniform name requested
  const requestedAtlasInjections = new Map<string, [boolean, boolean]>();

  // Get the atlas requests that have unique names. We only need one uniform
  // For a single unique provided name. We also must merge the requests for
  // Vertex and fragment injections
  instanceAttributes.forEach(
    (attribute: IValueInstanceAttribute<T> | IResourceInstanceAttribute<T>) => {
      if (isAtlasAttribute(attribute)) {
        // Auto set the size of the attribute. Attribute's that are a resource automatically
        // Consume a size of four
        attribute.size = InstanceAttributeSize.FOUR;
        attribute.blockIndex = InstanceBlockIndex.ONE;
        // Get the atlas resource uniform (sampler2D) injection targets. We default to only the
        // Fragment shader as it's the most commonly used location for sampler2Ds
        const injection: number =
          attribute.resource.shaderInjection || ShaderInjectionTarget.FRAGMENT;
        // See if we already have an injection for the given injected uniform name for an atlas resource.
        const injections = requestedAtlasInjections.get(
          attribute.resource.name
        );

        if (injections) {
          requestedAtlasInjections.set(attribute.resource.name, [
            injections[0] ||
              injection === ShaderInjectionTarget.VERTEX ||
              injection === ShaderInjectionTarget.ALL,
            injections[1] ||
              injection === ShaderInjectionTarget.FRAGMENT ||
              injection === ShaderInjectionTarget.ALL
          ]);
        } else {
          atlasInstanceAttributes.push(attribute);
          requestedAtlasInjections.set(attribute.resource.name, [
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

      if (instanceAttribute.resource) {
        const injections = requestedAtlasInjections.get(
          instanceAttribute.resource.name
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
          name: instanceAttribute.resource.name,
          shaderInjection: injection,
          size: UniformSize.ATLAS,
          update: () => {
            const resource = layer.resource
              .getManager(ResourceType.ATLAS)
              .getResource(instanceAttribute.resource.key);

            if (isAtlasResource(resource)) {
              return resource.texture || emptyTexture;
            }

            return emptyTexture;
          }
        },
        {
          name: `${instanceAttribute.resource.name}_size`,
          shaderInjection: injection,
          size: UniformSize.TWO,
          update: () => {
            const resource = layer.resource
              .getManager(ResourceType.ATLAS)
              .getResource(instanceAttribute.resource.key);

            if (isAtlasResource(resource)) {
              const atlas = resource.texture;

              if (atlas && atlas.data) {
                const { width, height } = atlas.data;
                return [width || 1, height || 1];
              }
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
