import { ViewOutputInformationType } from "../types";
import { uid } from "../util/uid";
import { GLProxy } from "./gl-proxy";
import { GLSettings } from "./gl-settings";
import { Material } from "./material";
import { Texture } from "./texture";

/**
 * This specifies a buffer and matches it to a hinting output type. The buffer
 * can be a Texture or a ColorBuffer of sorts. The outputType really only
 * matters for Texture types as it is used to help link Texture resources that
 * other processes are capable of providing information for.
 */
export type RenderBufferOutputTarget = {
  outputType: number;
  buffer: GLSettings.RenderTarget.ColorBufferFormat | Texture;
};

/**
 * These are the options available for creating a new RenderTarget.
 */
export interface IRenderTargetOptions {
  /**
   * Specifies the buffers the render target will render into when draw calls
   * happen.
   */
  buffers: {
    /**
     * The color buffer attachment. This allows multiple color buffers for MRT
     * when available.
     */
    color?: RenderBufferOutputTarget | RenderBufferOutputTarget[];
    /**
     * The depth buffer attachment. Exclusion automatically makes depth testing
     * not work.
     */
    depth?: GLSettings.RenderTarget.DepthBufferFormat | Texture;
    /**
     * The stencil buffer attachment. Exclusion automatically disables stencil
     * testing.
     */
    stencil?: GLSettings.RenderTarget.StencilBufferFormat | Texture;
  };
  /**
   * The height of the render target. This is used when the textures are not
   * dictating the width and the height. This is required if no Textures are
   * specified as a buffer.
   */
  height?: number;
  /**
   * If set to true, then disposing this render target will NOT cause the
   * targets that are textures to be disposed when this is disposed.
   */
  retainTextureTargets?: boolean;
  /**
   * The width of the render target. This is used when the textures are not
   * dictating the width and the width. This is required if no Textures are
   * specified as a buffer.
   */
  width?: number;
}

/**
 * This represents an FBO render target to be rendered into. This can manage
 * several targets at once for MRT (or within compatibility modes).
 *
 * DO NOT EDIT existing render targets after they are constructed. Just dispose
 * of old targets and create new ones.
 */
export class RenderTarget {
  /** UID for the object */
  get uid() {
    return this._uid;
  }
  private _uid = uid();

  /** The buffer settings utilized in rendering this target */
  get buffers() {
    return {
      color: Array.isArray(this._buffers.color)
        ? this._buffers.color.slice(0)
        : this._buffers.color,
      depth: this._buffers.depth,
      stencil: this._buffers.stencil
    };
  }
  private _buffers: IRenderTargetOptions["buffers"];
  /**
   * The height of the render target. This is automatically set if any of the
   * buffers are a Texture object. Otherwise, this reflects the value provided
   * in the options.
   */
  get height() {
    return this._height;
  }
  private _height: number;
  /**
   * The width of the render target. This is automatically set if any of the
   * buffers are a Texture object. Otherwise, this reflects the value provided
   * in the options.
   */
  get width() {
    return this._width;
  }
  private _width: number;
  /**
   * This is a flag indicating if the render target passed it's frame buffer
   * status check
   */
  get validFramebuffer() {
    return this._validFramebuffer;
  }
  private _validFramebuffer: boolean = false;

  /**
   * Flag indicating whether or not to preserve render targets that are textures
   * or not. This is set to true for when a RenderTarget is being disposed, thus
   * cleaning out the FBO and it's attachments, but we need the Texture to live
   * on for additional purposes.
   */
  retainTextureTargets: boolean = false;

  /**
   * This contains gl state that is processed and identified for the render
   * target. Modifying this outside of the framework is guaranteed to break
   * something.
   */
  gl?: {
    /** Identifier for the FBO object representing this target */
    fboId: WebGLFramebuffer;
    /**
     * Each material that is generated has the potential to need a FBO to
     * properly target the buffers it is capable of rendering to.
     */
    fboByMaterial: WeakMap<Material, WebGLFramebuffer>;
    /** The color buffer(s) this target is rendering into */
    colorBufferId?:
      | { data: WebGLRenderbuffer; outputType: number }
      | { data: Texture; outputType: number }
      | { data: WebGLRenderbuffer | Texture; outputType: number }[];
    /** The depth buffer this target is rendering into */
    depthBufferId?: WebGLRenderbuffer | Texture;
    /** The stencil buffer this target is rendering into */
    stencilBufferId?: WebGLRenderbuffer | Texture;
    /** The managing GL proxy of this target */
    proxy: GLProxy;
  };

  constructor(options: IRenderTargetOptions) {
    this._buffers = {
      color: Array.isArray(options.buffers.color)
        ? options.buffers.color.slice(0)
        : options.buffers.color,
      depth: options.buffers.depth,
      stencil: options.buffers.stencil
    };
    this._width = options.width || 0;
    this._height = options.height || 0;
    this.retainTextureTargets = options.retainTextureTargets || false;
    this.getDimensions();
  }

  /**
   * Free all resources associated with this render target.
   */
  dispose() {
    if (this.gl) {
      this.gl.proxy.disposeRenderTarget(this);
    }
  }

  /**
   * Retrieves all color buffers associated with this target and returns them as
   * a guaranteed list.
   */
  getBuffers() {
    if (Array.isArray(this.buffers.color)) {
      return this.buffers.color;
    } else if (this.buffers.color) {
      return [this.buffers.color];
    }

    return [];
  }

  /**
   * Gets an ordered list of all output types this render target handles.
   */
  getOutputTypes() {
    return this.getBuffers().map(buffer => buffer.outputType);
  }

  /**
   * This analyzes the buffers for Textures to infer the width and height. This
   * also ensures all Texture objects are the same size to prevent errors.
   */
  private getDimensions() {
    const textures: Texture[] = [];

    if (this._buffers.color instanceof Texture) {
      textures.push(this._buffers.color);
    }

    if (Array.isArray(this._buffers.color)) {
      this._buffers.color.forEach(buffer => {
        if (buffer instanceof Texture) {
          textures.push(buffer);
        }
      });
    }

    if (this._buffers.depth instanceof Texture) {
      textures.push(this._buffers.depth);
    }

    if (this._buffers.stencil instanceof Texture) {
      textures.push(this._buffers.stencil);
    }

    if (textures.length > 0 && textures[0].data) {
      const { width, height } = textures[0].data;

      textures.forEach(texture => {
        if (!texture.data) return;
        const { width: checkWidth, height: checkHeight } = texture.data;

        if (checkWidth !== width || checkHeight !== height) {
          console.warn(
            "Texture applied to the render target is invalid as it does not match dimensions of all textures applied:",
            texture,
            textures,
            "The texture will be removed as a target for the render target"
          );

          this.removeTextureFromBuffer(texture);
        }
      });

      this._width = width;
      this._height = height;
    } else if (!this._width || !this._height) {
      console.warn(
        "A RenderTarget was not able to establish valid dimensions. This target had no texture buffers and did not specify valid width and height values.",
        this
      );
    }
  }

  /**
   * Retrieves all of the textures associated with this render target
   */
  getTextures() {
    const textures: Texture[] = [];

    if (Array.isArray(this.buffers.color)) {
      this.buffers.color.forEach(buffer => {
        if (buffer.buffer instanceof Texture) {
          textures.push(buffer.buffer);
        }
      });
    } else if (this.buffers.color) {
      if (this.buffers.color.buffer instanceof Texture) {
        textures.push(this.buffers.color.buffer);
      }
    }

    if (this.buffers.depth instanceof Texture) {
      textures.push(this.buffers.depth);
    }

    if (this.buffers.stencil instanceof Texture) {
      textures.push(this.buffers.stencil);
    }

    return textures;
  }

  /**
   * This is a simple check to see if this render target is merely a color
   * buffer target type. This is a useful check for the renderer as being a
   * simple single color buffer target has implications to matching the render
   * target to materials.
   */
  isColorTarget() {
    if (Array.isArray(this.buffers.color)) {
      if (this.buffers.color.length === 1) {
        return (
          this.buffers.color[0].outputType === ViewOutputInformationType.COLOR
        );
      }
    } else {
      return this.buffers.color?.outputType === ViewOutputInformationType.COLOR;
    }

    return false;
  }

  /**
   * Cleanses a texture from being used as a buffer
   */
  private removeTextureFromBuffer(texture: Texture) {
    if (Array.isArray(this._buffers.color)) {
      const found = this._buffers.color.find(b => b.buffer === texture);
      if (!found) return;
      const index = this._buffers.color.indexOf(found);
      if (index > -1) this._buffers.color.splice(index, 1);
    } else if (this._buffers.color?.buffer === texture) {
      delete this._buffers.color;
    }

    if (this._buffers.depth === texture) {
      delete this._buffers.depth;
    }

    if (this._buffers.stencil === texture) {
      delete this._buffers.stencil;
    }
  }

  /**
   * Changes the size of this render target. This is a VERY costly operation. It
   * will delete all existing buffers associated with this target. Change the
   * intended size of each buffer / texture, then cause the buffer / texture to
   * get recreated with the new size settings.
   *
   * This operation clears any existing texture contents that may have existed.
   */
  setSize(width: number, height: number) {
    // Delete all previous GL content
    this.dispose();
    // Set our new width and height desires
    this._width = width;
    this._height = height;
    // Adjust all of the texture objects data to size properly
    const textures = this.getTextures();

    textures.forEach(texture => {
      texture.data = {
        buffer: null,
        height,
        width
      };
    });
  }

  /**
   * Flags this render target as having a valid framebuffer for rendering.
   */
  setAsValid() {
    this._validFramebuffer = true;
  }
}
