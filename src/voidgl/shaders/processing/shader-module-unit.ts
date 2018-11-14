import { Layer } from "src/voidgl/surface/layer";
import { IUniform, Omit, ShaderInjectionTarget } from "../../types";

/** This is the message used when a module unit is attempted to be modified after it has been locked down */
const LOCKED_MODULE_UNIT_MESSAGE =
  "Once a ShaderModuleUnit has been registered, you CAN NOT modify it! Module ID:";

/** Options for the constructor for a new ShaderModuleUnit */
export type ShaderModuleUnitOptions = Omit<Partial<ShaderModuleUnit>, "lock">;

/**
 * This is a module unit that can be registered as a ShaderModule which the system will use to resolve
 * imports within a shader.
 */
export class ShaderModuleUnit {
  private _isLocked: boolean;
  private _content: string;
  private _compatibility: ShaderInjectionTarget;
  private _moduleId: string;
  private _dependents: string[] | null = null;

  /**
   * This is the content that replaces shader imports
   */
  get content(): string {
    return this._content;
  }
  set content(val: string) {
    if (this._isLocked) {
      console.warn(LOCKED_MODULE_UNIT_MESSAGE, this._moduleId);
      return;
    }

    this._content = val;
  }

  /**
   * This defines which shader type the content is compatible with. You can only have one content assigned
   * per each ShaderInjectionTarget type. Thus you can have a module such as 'picking' with two unique implementations
   * one for Fragment and one for Vertex shaders. Or you can assign it to both.
   */
  get compatibility(): ShaderInjectionTarget {
    return this._compatibility;
  }
  set compatibility(val: ShaderInjectionTarget) {
    if (this._isLocked) {
      console.warn(LOCKED_MODULE_UNIT_MESSAGE, this._moduleId);
      return;
    }

    this._compatibility = val;
  }

  /**
   * This is the list of module id dependents this unit will need. We store
   * this here so the module can be analyzed once. Import statements will be stripped and the sub module contents will
   * be added to the top of the contents of the shader. This only stores ids, as the ids will still need to be analyzed
   * so duplication can be prevented.
   */
  get dependents(): string[] | null {
    return this._dependents;
  }
  set dependents(val: string[] | null) {
    // If this has been locked AND the dependents have been established then dependents can not be
    // adjusted.
    if (this._isLocked && this._dependents !== null) {
      console.warn(LOCKED_MODULE_UNIT_MESSAGE, this._moduleId);
      return;
    }

    this._dependents = val;
  }

  /**
   * Indicates this unit cannot be modified anymore.
   */
  isLocked() {
    return this._isLocked;
  }

  /**
   * Allows a module to prevent overrides by another module using the same moduleId.
   * Attempted overrides will throw warnings.
   */
  isFinal?: boolean;
  /** This is the string ID a shader must use to include the provided content. */
  get moduleId(): string {
    return this._moduleId;
  }
  set moduleId(val: string) {
    if (this._isLocked) {
      console.warn(LOCKED_MODULE_UNIT_MESSAGE, this._moduleId);
      return;
    }

    this._moduleId = val;
  }

  /**
   * These are uniforms that get added to the layer's uniforms ShaderIO when this module is included.
   */
  uniforms?(layer: Layer<any, any>): IUniform[];

  /**
   * Default ctor for creating a new Shader Module Unit to be registered with the system.
   */
  constructor(options: ShaderModuleUnitOptions) {
    Object.assign(this, options);
  }

  /**
   * Applies the content after it's been processed for import statements. You can not set the content this way
   * again after processing has happened.
   */
  applyAnalyzedContent(content: string) {
    if (this._isLocked && this.dependents !== null) {
      console.warn(LOCKED_MODULE_UNIT_MESSAGE, this._moduleId);
      return;
    }

    this._content = content;
  }

  /**
   * Makes this unit unable to be modified in anyway
   */
  lock() {
    this._isLocked = true;
  }
}
