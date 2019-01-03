declare module "tiny-sdf";

declare module "tiny-sdf" {
  export interface ITinyGenerator {
    draw(char: string): ImageData;
  }
}
