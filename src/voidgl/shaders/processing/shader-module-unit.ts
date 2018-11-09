import { Omit, ShaderInjectionTarget } from "../../types";

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

  /** This is the content that replaces shader imports */
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

  constructor(options: ShaderModuleUnitOptions) {
    Object.assign(this, options);
  }

  /**
   * Makes this unit unable to be modified in anyway
   */
  lock() {
    this._isLocked = true;
  }
}
