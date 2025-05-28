import { Attribute } from "./attribute.js";
import { GLProxy } from "./gl-proxy.js";
import type { IndexBuffer } from "./index-buffer.js";

/**
 * This represents a buffer of data that is expressed as attributes to be placed
 * within a scene. This is generally paired with a Material in a Model to
 * indicate the configuration for how the buffer should be rendered.
 */
export class Geometry {
  /** The attributes bound to this geometry.  */
  private _attributes: { [key: string]: Attribute } = {};
  private _attributeMap?: Map<string, Attribute>;

  /** Get a Map representation of the attributes keyed by name */
  get attributes() {
    if (this._attributeMap) return this._attributeMap;
    this._attributeMap = new Map(Object.entries(this._attributes));
    return this._attributeMap;
  }
  /** The optional index buffer bound to this geometry. */
  private _indexBuffer?: IndexBuffer;
  get indexBuffer() {
    return this._indexBuffer;
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
  maxInstancedCount = 0;
  /**
   * If all attributes added are instanced or not instanced, then this geometry
   * is not instanced
   */
  isInstanced = false;

  /**
   * Adds an attribute to this geometry. This will associate the attribute's
   * buffer to an attribute with the same name used within the shader program.
   */
  addAttribute(name: string, attribute: Attribute) {
    delete this._attributeMap;
    this._attributes[name] = attribute;
    this.isInstanced = false;
    let didChange: number | undefined;

    // This is not required for the gl layer attribute, but it is helpful for
    // debugging purposes to have the name of the attribute
    attribute.name = name;

    // Check to see if the attributes are uniform or not in instancing
    Object.values(this._attributes).forEach((attr) => {
      const check = attr.isInstanced ? 1 : 0;
      // Initialize the check value if it has not been yet
      if (didChange === undefined) didChange = check;
      // If a change occurs then we have dynamic and instanced attributes,
      // which means this geometry is instanced drawing
      if ((didChange ^ check) === 1) this.isInstanced = true;
    });
  }

  /**
   * Applies an index buffer to this geometry which causes this geometry to
   * render with drawElements/drawElementsInstanced instead of
   * drawArrays/drawArraysInstanced.
   *
   * This allows for more efficient use of complex vertex data and reduces the
   * need for copies of the data in the buffers.
   */
  setIndexBuffer(indexBuffer: IndexBuffer) {
    this._indexBuffer = indexBuffer;
  }

  /**
   * Removes any attributes associated with the specified identifying name.
   */
  removeAttribute(name: string) {
    delete this._attributeMap;
    delete this._attributes[name];
  }

  /**
   * This loops through this geometry's attributes and index buffer and resizes
   * the buffers backing them to support the number of vertices specified.
   *
   * The index buffer is provided a different sizing option as it can represent
   * more vertices than the attributes represent.
   *
   * Resizing causes a full commit of all the buffers backing the geometry and
   * regenerates the VAO if available.
   */
  resizeVertexCount(vertexCount: number, indexCount?: number) {
    const attributes = Object.values(this._attributes);

    // Rebuild each attribute one at a time (this saves the most RAM to allow
    // for the old buffer to exist one at a time and be cleared right away
    // before moving onto the next one)
    for (const attribute of attributes) {
      attribute.resize(vertexCount);
    }

    // Cause the GL context to be rebuilt
    if (this.gl) {
      this.gl.proxy.disposeGeometry(this);
    }

    // If we have an index buffer and a resize was requested, perform the resize
    // routine on the index buffer. This will properly cast the index buffer to
    // the appropriate data type based on the number of referenced vertices.
    if (this._indexBuffer && indexCount !== void 0) {
      this._indexBuffer.resize(indexCount, vertexCount);
    }
  }

  /**
   * Destroys this resource and frees resources it consumes on the GPU.
   */
  destroy() {
    delete this._attributeMap;
    this.attributes.forEach((attribute) => attribute.destroy());
    this.indexBuffer?.destroy();

    if (this.gl) {
      this.gl.proxy.disposeGeometry(this);
    }

    this._attributes = {};
  }

  /**
   * Triggers a rebuild of the this geometry's backing gl context. This does NOT
   * affect the attributes or index buffer.
   */
  rebuild() {
    delete this._attributeMap;
    this.gl?.proxy.disposeGeometry(this);
  }
}
