import { Camera2D, View2D } from "../2d";
import { CommandCallback, CommandLayer, createView } from "../surface";
import { createLayer } from "../util/create-layer";

/**
 * This sets up essentially a callback within the pipeline that lets you execute
 * arbitrary commands such as GL or built in Surface commands or simply run a
 * script in mid render pipeline.
 *
 * This is very open ended on what it is intended to do. You can really hose
 * performance if you use this without understanding how rendering pipelines
 * work or by not following documentation correctly.
 */
export function commands(commands: CommandCallback) {
  return {
    views: {
      screen: createView(View2D, {
        camera: new Camera2D(),
        viewport: { left: 0, top: 0, width: 1, height: 1 }
      })
    },
    layers: {
      screen: createLayer(CommandLayer, {
        commands
      })
    }
  };
}
