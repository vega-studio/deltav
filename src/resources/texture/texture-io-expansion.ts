import { BaseResourceManager } from "src/resources/base-resource-manager";
import { Texture } from "../../gl/texture";
import { Instance } from "../../instance-provider/instance";
import { ILayerProps, Layer } from "../../surface/layer";
import {
  BaseIOExpansion,
  ShaderIOExpansion
} from "../../surface/layer-processing/base-io-expansion";
import {
  IInstanceAttribute,
  InstanceAttributeSize,
  InstanceBlockIndex,
  IResourceInstanceAttribute,
  IResourceType,
  IUniform,
  IValueInstanceAttribute,
  IVertexAttribute,
  ShaderInjectionTarget,
  UniformSize
} from "../../types";

/** Empty texture that will default to the zero texture and unit */
const emptyTexture = new Texture({
  data: {
    width: 1,
    height: 1,
    data: new Uint8ClampedArray(4)
  }
});

/** Resource Attribute typeguard */
function isTextureAttribute<T extends Instance>(
  attr: any,
  resourceType: number
): attr is IResourceInstanceAttribute<T> {
  return (
    attr &&
    attr.resource &&
    attr.resource.type === resourceType &&
    attr.resource.name !== undefined &&
    attr.resource.key !== undefined
  );
}

/**
 * Minimal information a resource is required to have to operate for this expander.
 */
interface ITextureIOExpansionResource extends IResourceType {
  data: {
    width: number;
    height: number;
  };

  texture: Texture;
}

/**
 * This is an expansion handler for resource attributes that requires a texture to be
 * included as a uniform on behalf of the attribute.
 */
export class TextureIOExpansion extends BaseIOExpansion {
  /** The manager which will contain the texture object to be used */
  manager: BaseResourceManager<ITextureIOExpansionResource, any>;
  /** The resource type this expansion filters on */
  resourceType: number;

  constructor(resourceType: number, manager: BaseResourceManager<any, any>) {
    super();
    this.manager = manager;
    this.resourceType = resourceType;
  }

  /**
   * Provides expanded IO for attributes with resource properties.
   */
  expand<T extends Instance, U extends ILayerProps<T>>(
    _layer: Layer<T, U>,
    instanceAttributes: IInstanceAttribute<T>[],
    _vertexAttributes: IVertexAttribute[],
    _uniforms: IUniform[]
  ): ShaderIOExpansion<T> {
    // Retrieve all of the instance attributes that are atlas references
    const atlasInstanceAttributes: IResourceInstanceAttribute<T>[] = [];
    // Key: The atlas uniform name requested
    const requestedTextureInjections = new Map<string, [boolean, boolean]>();

    // Get the atlas requests that have unique names. We only need one uniform
    // For a single unique provided name. We also must merge the requests for
    // Vertex and fragment injections
    instanceAttributes.forEach(
      (
        attribute: IValueInstanceAttribute<T> | IResourceInstanceAttribute<T>
      ) => {
        if (isTextureAttribute(attribute, this.resourceType)) {
          // Auto set the size of the attribute. Attribute's that are a resource automatically
          // Consume a size of four
          attribute.size = InstanceAttributeSize.FOUR;
          attribute.blockIndex = InstanceBlockIndex.ONE;
          // Get the atlas resource uniform (sampler2D) injection targets. We default to only the
          // Fragment shader as it's the most commonly used location for sampler2Ds
          const injection: number =
            attribute.resource.shaderInjection ||
            ShaderInjectionTarget.FRAGMENT;
          // See if we already have an injection for the given injected uniform name for an atlas resource.
          const injections = requestedTextureInjections.get(
            attribute.resource.name
          );

          if (injections) {
            requestedTextureInjections.set(attribute.resource.name, [
              injections[0] ||
                injection === ShaderInjectionTarget.VERTEX ||
                injection === ShaderInjectionTarget.ALL,
              injections[1] ||
                injection === ShaderInjectionTarget.FRAGMENT ||
                injection === ShaderInjectionTarget.ALL
            ]);
          } else {
            atlasInstanceAttributes.push(attribute);
            requestedTextureInjections.set(attribute.resource.name, [
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
          const injections = requestedTextureInjections.get(
            instanceAttribute.resource.name
          );

          if (injections) {
            injection =
              (injections[0] && injections[1] && ShaderInjectionTarget.ALL) ||
              (injections[0] &&
                !injections[1] &&
                ShaderInjectionTarget.VERTEX) ||
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
              const resource = this.manager.getResource(
                instanceAttribute.resource.key
              );

              if (resource) {
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
              const resource = this.manager.getResource(
                instanceAttribute.resource.key
              );

              if (resource) {
                const texture = resource.texture;

                if (texture && texture.data) {
                  const { width, height } = texture.data;
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

    return {
      instanceAttributes: [],
      vertexAttributes: [],
      uniforms: flatten
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
    });

    return !foundError;
  }
}
