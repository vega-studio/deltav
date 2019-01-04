declare module "tiny-sdf";

declare module "tiny-sdf" {
  export interface ITinyGenerator {
    draw(char: string): { glyph: Uint8ClampedArray, size: number, bounds: { x: number, y: number, width: number, height: number } };
  }
}
