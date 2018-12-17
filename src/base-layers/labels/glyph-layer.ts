import { InstanceProvider } from "src/instance-provider";
import { ILayerProps, Layer } from "../../surface/layer";
import { InstanceAttributeSize, IShaderInitialization, ResourceType, ShaderInjectionTarget, VertexAttributeSize } from "../../types";
import { GlyphInstance } from "./glyph-instance";

/**
 * Options available to this layer as props.
 */
export interface IGlyphLayerOptions<T extends GlyphInstance> extends ILayerProps<T> {
  /** This is the font resource this pulls from in order to render the glyphs */
  resourceKey: string;
}

/**
 * Handles rendering single character glyphs using SDF and MSDF techniques
 */
export class GlyphLayer<T extends GlyphInstance, U extends IGlyphLayerOptions<T>> extends Layer<T, U> {
  /** Set up the default props so our auto complete is a happier place */
  static defaultProps: IGlyphLayerOptions<GlyphInstance> = {
    key: '',
    data: new InstanceProvider<GlyphInstance>(),
    resourceKey: 'No resource specified',
    scene: 'default',
  };

  /**
   * Create the Shader IO needed to tie our instances and the GPU together.
   */
  initShader(): IShaderInitialization<T> {

    const vertexToNormal: { [key: number]: number } = {
      0: 1,
      1: 1,
      2: -1,
      3: 1,
      4: -1,
      5: -1
    };

    const vertexToSide: { [key: number]: number } = {
      0: 0,
      1: 0,
      2: 0,
      3: 1,
      4: 1,
      5: 1
    };

    return {
      fs: '',
      instanceAttributes: [
        {
          name: 'origin',
          size: InstanceAttributeSize.TWO,
          update: o => o.origin,
        },
        {
          name: 'offset',
          size: InstanceAttributeSize.TWO,
          update: o => o.offset
        },
        {
          name: 'resource',
          resource: {
            key: this.props.resourceKey,
            name: 'fontMap',
            shaderInjection: ShaderInjectionTarget.ALL,
            type: ResourceType.FONT,
          },
          update: o => this.resource.request(this, o, o.resourceRequest),
        }
      ],
      uniforms: [],
      vertexAttributes: [
        // TODO: This is from the heinous evils of THREEJS and their inability to fix a bug within our lifetimes.
        // Right now position is REQUIRED in order for rendering to occur, otherwise the draw range gets updated to
        // Zero against your wishes.
        {
          name: "position",
          size: VertexAttributeSize.THREE,
          update: (vertex: number) => [
            // Normal
            vertexToNormal[vertex],
            // The side of the quad
            vertexToSide[vertex],
            0
          ]
        }
      ],
      vertexCount: 6,
      vs: '',
    };
  }
}
