import { IFontResourceRequest } from "src/resources";
import { Instance, observable } from "../../instance-provider";
import { Vec2, Vec4 } from "../../util/vector";

/**
 * Instance representing a single glyph being rendered.
 */
export class GlyphInstance extends Instance {
  /** This is the anchor point of the glyph to which the glyph scales and rotates about and is positioned */
  @observable origin: Vec2 = [0, 0];
  /** The top left location of this glyph offset from it's origin */
  @observable offset: Vec2 = [0, 0];
  /**
   * This is the character grid code of the glyph. This is mostly managed by the Font Manager.
   * Glyphs are placed on a texture in a grid, this code represents which character to pinpoint
   * exactly. This is done by using the metrics provided in the texture's uniform resource properties.
   *
   * Take the character code % # of glyphs in a row = the column the glyph is on
   * Take floor(character code / # of glyphs in a row) = the row the glyph is on
   *
   * Use the glyph metrics provided by the resource to target the texture coordinates the glyph is located.
   */
  @observable character: number = 0;
  /** The color to tint the glyph */
  @observable color: Vec4 = [1, 1, 1, 1];
  /** This is the resource request used to retrieve the glyph metrics needed to render properly */
  @observable private _resourceRequest: IFontResourceRequest;

  get resourceRequest() {
    return this._resourceRequest;
  }

  /**
   * This will trigger when the resource nmanager is ready to render this glyph.
   */
  resourceTrigger() {
    this.offset = this.offset;
    this.origin = this.origin;
    this.character = this.character;
    this.color = this.color;
  }
}
