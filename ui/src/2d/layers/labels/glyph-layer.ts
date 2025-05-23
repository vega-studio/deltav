import { InstanceProvider } from "../../../instance-provider";
import { IAutoEasingMethod, Vec, Vec2 } from "../../../math";
import {
  fontRequest,
  FontResourceRequestFetch,
  IFontResourceRequest,
} from "../../../resources";
import {
  createMaterialOptions,
  IInstanceAttribute,
  ILayerMaterialOptions,
  InstanceAttributeSize,
  IShaderInitialization,
  VertexAttributeSize,
} from "../../../types.js";
import { CommonMaterialOptions } from "../../../util";
import { ScaleMode } from "../../types.js";
import { ILayer2DProps, Layer2D } from "../../view/layer-2d.js";
import { GlyphInstance } from "./glyph-instance.js";
import GlyphLayerAlwaysFS from "./glyph-layer-always.fs";
import GlyphLayerAlwaysVS from "./glyph-layer-always.vs";
import GlyphLayerBoundMaxFS from "./glyph-layer-bound-max.fs";
import GlyphLayerBoundMaxVS from "./glyph-layer-bound-max.vs";
import GlyphLayerNeverFS from "./glyph-layer-never.fs";
import GlyphLayerNeverVS from "./glyph-layer-never.vs";
import TextAreaLayerAlwaysFS from "./text-area-layer-always.fs";
import TextAreaLayerAlwaysVS from "./text-area-layer-always.vs";
import TextAreaLayerBoundMaxFS from "./text-area-layer-bound-max.fs";
import TextAreaLayerBoundMaxVS from "./text-area-layer-bound-max.vs";
import TextAreaLayerNeverFS from "./text-area-layer-never.fs";
import TextAreaLayerNeverVS from "./text-area-layer-never.vs";

/**
 * Options available to this layer as props.
 */
export interface IGlyphLayerOptions<T extends GlyphInstance>
  extends ILayer2DProps<T> {
  /** Specifies which attributes to animate */
  animate?: {
    anchor?: IAutoEasingMethod<Vec>;
    color?: IAutoEasingMethod<Vec>;
    offset?: IAutoEasingMethod<Vec>;
    origin?: IAutoEasingMethod<Vec>;
  };
  /** This is the font resource this pulls from in order to render the glyphs */
  resourceKey?: string;
  /** This is the scaling strategy the glyph will use when text is involved. */
  scaleMode?: ScaleMode;
  /** This indicates whether a glyph is in a textArea */
  inTextArea?: boolean;
}

/**
 * Handles rendering single character glyphs using SDF and MSDF techniques
 */
export class GlyphLayer<
  T extends GlyphInstance,
  U extends IGlyphLayerOptions<T>,
> extends Layer2D<T, U> {
  /** Set up the default props so our auto complete is a happier place */
  static defaultProps: IGlyphLayerOptions<GlyphInstance> = {
    key: "",
    data: new InstanceProvider<GlyphInstance>(),
    resourceKey: "No resource specified",
  };

  /**
   * Easy access names of each attribute to make easing controls easier
   */
  static attributeNames = {
    color: "color",
    depth: "depth",
    anchor: "anchor",
    origin: "origin",
    offset: "offset",
  };

  /**
   * These are all of the requests the glyphs have generated for each character. This let's us
   * recycle requests for same glyphs.
   */
  glyphRequests: { [key: string]: IFontResourceRequest } = {};

  /**
   * Create the Shader IO needed to tie our instances and the GPU together.
   */
  initShader(): IShaderInitialization<T> {
    const animate = this.props.animate || {};
    const {
      anchor: animateAnchor,
      color: animateColor,
      offset: animateOffset,
      origin: animateOrigin,
    } = animate;

    const vertexInfo: { [key: number]: Vec2 } = {
      0: [0, 0],
      1: [0, 0],
      2: [1, 0],
      3: [0, 1],
      4: [1, 1],
      5: [1, 1],
    };

    const glyphTextureAttr: IInstanceAttribute<T> = {
      name: "texture",
      resource: {
        key: () => this.props.resourceKey || "",
        name: "fontMap",
      },
      update: (o) => {
        const char = o.character;

        if (!o.request || o.character !== o.request.character) {
          if (this.glyphRequests[o.character]) {
            o.request = this.glyphRequests[o.character];
          } else {
            o.request = fontRequest({
              key: this.props.resourceKey || "",
              character: char,
            });

            this.glyphRequests[o.character] = o.request;
          }

          // Do a check to see if the request has been resolved. If so, the glyph is ready.
          if (o.request.fontMap) {
            if (o.onReady) o.onReady(o);
          }
        }

        o.request.fetch = FontResourceRequestFetch.TEXCOORDS;
        return this.resource.request(this, o, o.request);
      },
    };

    /**
     * We must make this attribute a child attribute as it is based on the exact same property
     * as another attribute from an instance. This ensures that the change on the instance property
     * triggers this attribute as well.
     */
    const glyphSizeAttr: IInstanceAttribute<T> = {
      name: "glyphSize",
      parentAttribute: glyphTextureAttr,
      resource: {
        key: () => this.props.resourceKey || "",
        name: "fontMap",
      },
      size: InstanceAttributeSize.TWO,
      update: (o) => {
        const char = o.character;

        if (!o.request || o.character !== o.request.character) {
          if (this.glyphRequests[o.character]) {
            o.request = this.glyphRequests[o.character];
          } else {
            o.request = fontRequest({
              key: this.props.resourceKey || "",
              character: char,
            });

            this.glyphRequests[o.character] = o.request;
          }

          // Do a check to see if the request has been resolved. If so, the glyph is ready.
          if (o.request.fontMap) {
            if (o.onReady) o.onReady(o);
          }
        }

        o.request.fetch = FontResourceRequestFetch.IMAGE_SIZE;
        return this.resource.request(this, o, o.request);
      },
    };

    glyphTextureAttr.childAttributes = [glyphSizeAttr];

    let fs: string, vs: string;
    const scaleMode = this.props.scaleMode || ScaleMode.ALWAYS;

    switch (scaleMode) {
      case ScaleMode.BOUND_MAX: {
        fs = this.props.inTextArea
          ? TextAreaLayerBoundMaxFS
          : GlyphLayerBoundMaxFS;
        vs = this.props.inTextArea
          ? TextAreaLayerBoundMaxVS
          : GlyphLayerBoundMaxVS;
        break;
      }

      case ScaleMode.NEVER: {
        fs = this.props.inTextArea ? GlyphLayerNeverFS : TextAreaLayerNeverFS;
        vs = this.props.inTextArea ? TextAreaLayerNeverVS : GlyphLayerNeverVS;
        break;
      }

      case ScaleMode.ALWAYS: {
        fs = this.props.inTextArea ? TextAreaLayerAlwaysFS : GlyphLayerAlwaysFS;
        vs = this.props.inTextArea ? TextAreaLayerAlwaysVS : GlyphLayerAlwaysVS;
        break;
      }

      default: {
        fs = GlyphLayerAlwaysFS;
        vs = GlyphLayerAlwaysVS;
        break;
      }
    }

    return {
      fs,
      instanceAttributes: [
        {
          easing: animateColor,
          name: GlyphLayer.attributeNames.color,
          size: InstanceAttributeSize.FOUR,
          update: (o) => o.color,
        },
        {
          name: GlyphLayer.attributeNames.depth,
          size: InstanceAttributeSize.ONE,
          update: (o) => [o.depth],
        },
        {
          name: "fontScale",
          size: InstanceAttributeSize.ONE,
          update: (o) => [o.fontScale],
        },
        {
          easing: animateAnchor,
          name: GlyphLayer.attributeNames.anchor,
          size: InstanceAttributeSize.TWO,
          update: (o) => o.anchor,
        },
        {
          easing: animateOrigin,
          name: GlyphLayer.attributeNames.origin,
          size: InstanceAttributeSize.TWO,
          update: (o) => o.origin,
        },
        {
          easing: animateOffset,
          name: GlyphLayer.attributeNames.offset,
          size: InstanceAttributeSize.TWO,
          update: (o) => o.offset,
        },
        {
          name: "padding",
          size: InstanceAttributeSize.TWO,
          update: (o) => o.padding,
        },
        {
          name: "maxScale",
          size: InstanceAttributeSize.ONE,
          update: (o) => [o.maxScale],
        },
        glyphSizeAttr,
        glyphTextureAttr,
      ],
      uniforms: [],
      vertexAttributes: [
        {
          name: "normals",
          size: VertexAttributeSize.TWO,
          update: (vertex: number) =>
            // Quad vertex side information
            vertexInfo[vertex],
        },
      ],
      vertexCount: 6,
      vs,
    };
  }

  draw() {
    super.draw();
  }

  /**
   * Set up material options for the layer
   */
  getMaterialOptions(): ILayerMaterialOptions {
    return Object.assign(
      {},
      CommonMaterialOptions.transparentImageBlending,
      createMaterialOptions({
        depthTest: false,
      })
    );
  }

  /**
   * Handle changes that need special handling
   */
  willUpdateProps(nextProps: U) {
    // If the target resource changes, then we must make all of the requests re-process their requests for the new
    // resource.
    if (nextProps.resourceKey !== this.props.resourceKey) {
      Object.values(this.glyphRequests).forEach((req) => {
        delete req.fontMap;
        req.key = nextProps.resourceKey || "";
      });
      this.rebuildLayer();
    }
  }
}
