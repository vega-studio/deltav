import { Layer } from "../../surface/layer";
import {
  InstanceAttributeSize,
  PickType,
  ShaderInjectionTarget,
  UniformSize
} from "../../types";
import { ShaderModule } from "../processing";

ShaderModule.register([
  {
    moduleId: "picking",
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

          // Do bit maths do get float components out of the int color
          return [
            ((color & 0xff0000) >> 16) / 255.0,
            ((color & 0x00ff00) >> 8) / 255.0,
            (color & 0x0000ff) / 255.0,
            1
          ];
        }
      }
    ],

    uniforms: layer => [
      {
        name: "pickingActive",
        shaderInjection: ShaderInjectionTarget.ALL,
        size: UniformSize.ONE,
        update: () => [
          layer.picking.currentPickMode === PickType.SINGLE ? 1.0 : 0.0
        ]
      }
    ]
  },
  {
    moduleId: "picking",
    content: require("./shader-fragments/picking.fs"),
    compatibility: ShaderInjectionTarget.FRAGMENT
  },
  {
    moduleId: "no-picking",
    content: require("./shader-fragments/no-picking.vs"),
    compatibility: ShaderInjectionTarget.VERTEX
  },
  {
    moduleId: "no-picking",
    content: require("./shader-fragments/no-picking.fs"),
    compatibility: ShaderInjectionTarget.FRAGMENT
  }
]);
