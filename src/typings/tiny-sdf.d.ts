declare module "tiny-sdf" {
  let tinySDF: tinySDF.ITinySDF;
  export = tinySDF;

  namespace tinySDF {
    export interface ITinySDF {
      (
        fontSize: number,
        buffer: number,
        radius: number,
        cutoff: number,
        family: string
      ): tinySDF.ITinySDFGen;
    }

    export interface ITinySDFGen {
      generate(char: string): ImageData;
    }
  }
}
