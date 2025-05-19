import { Layer } from "../../surface/layer.js";
import { InstanceAttributeSize, ShaderInjectionTarget } from "../../types.js";
import { ShaderModule } from "../processing";
import picking from "./shader-fragments/picking.vs";

ShaderModule.register([
  {
    moduleId: "picking",
    description:
      "Internal use only. Provides methods\nand constants to make the picking processes work.",
    content: picking,
    compatibility: ShaderInjectionTarget.VERTEX,

    instanceAttributes: (_layer: Layer<any, any>) => [
      {
        name: "_pickingColor",
        size: InstanceAttributeSize.FOUR,
        shaderInjection: ShaderInjectionTarget.VERTEX,
        update: (o) => {
          // We start from white and move down so the colors are more visible
          // For debugging
          const color = 0xffffff - o.uid;

          // Do bit maths to get float components out of the int color
          return [
            ((color & 0xff0000) >> 16) / 255.0,
            ((color & 0x00ff00) >> 8) / 255.0,
            (color & 0x0000ff) / 255.0,
            1,
          ];
        },
      },
    ],
  },
]);
