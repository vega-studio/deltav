import React from "react";

import { Camera2D, View2D } from "../../../2d";
import { CommandCallback, CommandLayer } from "../../../surface";
import { LayerJSX } from "../scene/layer-jsx.js";
import { SceneJSX } from "../scene/scene-jsx.jsx";
import { ViewJSX } from "../scene/view-jsx.js";

interface ICommandsJSX {
  /**
   * Command callback structure. Gives an instance of the surface at that
   * moment in time of drawing for this scene
   */
  callback: CommandCallback;
  /** Name for the scene to generate this command */
  name: string;
}

/**
 * This is a helper Scene that lets you inject commands into the pipeline. Most
 * commands are from the Surface.commands property that you will need, but this
 * opens up the opportunity to make any GL related commands as well.
 *
 * Custom GL is VERY ADVANCED useage. You should stick to using Surface.commands
 * AND read the documentation on those commands.
 */
export const CommandsJSX = (props: ICommandsJSX) => {
  return (
    <SceneJSX name={props.name}>
      <ViewJSX type={View2D} config={{ camera: new Camera2D() }} />
      <LayerJSX type={CommandLayer} config={{ commands: props.callback }} />
    </SceneJSX>
  );
};
