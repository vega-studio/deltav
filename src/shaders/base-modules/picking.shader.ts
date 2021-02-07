import { Layer } from "../../surface/layer";
import { InstanceAttributeSize, ShaderInjectionTarget } from "../../types";
import { ShaderModule } from "../processing";

ShaderModule.register([
  {
    moduleId: "picking",
    description:
      "Internal use only. Provides methods\nand constants to make the picking processes work.",
    content: require("./shader-fragments/picking.vs"),
    compatibility: ShaderInjectionTarget.VERTEX,

    instanceAttributes: (_layer: Layer<any, any>) => [
      {
        name: "_pickingColor",
        size: InstanceAttributeSize.FOUR,
        update: o => {
          // We start from white and move down so the colors are more visible
          // For debugging
          const color = 0xffffff - o.uid;

          // Do bit maths to get float components out of the int color
          return [
            ((color & 0xff0000) >> 16) / 255.0,
            ((color & 0x00ff00) >> 8) / 255.0,
            (color & 0x0000ff) / 255.0,
            1
          ];
        }
      }
    ]
  }
]);
