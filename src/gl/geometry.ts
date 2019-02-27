import { Attribute } from "src/gl/attribute";

/**
 * This represents a buffer of data that is expressed as attributes to be placed
 * within a scene. This is generally paired with a Material in a Model to indicate
 * the configuration for how the buffer should be rendered.
 */
export class Geometry {
  /** The attributes bound to this geometry.  */
  private _attributes: { [key: string]: Attribute } = {};
  get attributes() {
    return new Map(Object.entries(this._attributes));
  }
  /** This contains any gl specific state associated with this object */
  gl = {};
  /** Number of instances this geometry covers */
  maxInstancedCount: number = 0;

  /**
   * Adds an attribute to this geometry. This will associate the attribute's buffer to an attribute
   * with the same name used within the shader program.
   */
  addAttribute(name: string, attribute: Attribute) {
    this._attributes[name] = attribute;
  }

  /**
   * Removes any attributes associated with the specified identifying name.
   */
  removeAttribute(name: string) {
    delete this._attributes[name];
  }

  dispose() {
    // TODO
  }
}
