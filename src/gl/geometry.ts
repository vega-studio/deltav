import { Attribute } from "./attribute";
import { GLProxy } from "./gl-proxy";

/**
 * This represents a buffer of data that is expressed as attributes to be placed
 * within a scene. This is generally paired with a Material in a Model to
 * indicate the configuration for how the buffer should be rendered.
 */
export class Geometry {
  /** The attributes bound to this geometry.  */
  private _attributes: { [key: string]: Attribute } = {};
  get attributes() {
    return new Map(Object.entries(this._attributes));
  }
  /** This contains any gl specific state associated with this object */
  gl?: {
    /**
     * Potentially generated VAO for the attributes beneath this geometry. If
     * available this can greatly speed up set up and rendering for each draw
     * call. Hardware must support it for WebGL 2 or via extension.
     */
    vao?: WebGLVertexArrayObject;
    /** Proxy communication with the GL context */
    proxy: GLProxy;
  };
  /** Number of instances this geometry covers */
  maxInstancedCount: number = 0;
  /**
   * If all attributes added are instanced or not instanced, then this geometry
   * is not instanced
   */
  isInstanced: boolean = false;

  /**
   * Adds an attribute to this geometry. This will associate the attribute's
   * buffer to an attribute with the same name used within the shader program.
   */
  addAttribute(name: string, attribute: Attribute) {
    this._attributes[name] = attribute;
    this.isInstanced = false;
    let didChange: number | undefined;

    // Check to see if the attributes are uniform or not in instancing
    Object.values(this._attributes).forEach(attr => {
      const check = attr.isInstanced ? 1 : 0;
      // Initialize the check value if it has not been yet
      if (didChange === undefined) didChange = check;
      // If a change occurs then we have dynamic and instanced attributes,
      // which means this geometry is instanced drawing
      if ((didChange ^ check) === 1) this.isInstanced = true;
    });
  }

  /**
   * Removes any attributes associated with the specified identifying name.
   */
  removeAttribute(name: string) {
    delete this._attributes[name];
  }

  /**
   * Destroys this resource and frees resources it consumes on the GPU.
   */
  destroy() {
    this.attributes.forEach(attribute => attribute.destroy());

    if (this.gl) {
      this.gl.proxy.disposeGeometry(this);
    }
  }
}
