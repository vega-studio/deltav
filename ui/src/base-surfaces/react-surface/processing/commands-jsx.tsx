import React from "react";
import { Camera2D, View2D } from "../../../2d";
import { CommandCallback, CommandLayer } from "../../../surface";
import { LayerJSX } from "../scene/layer-jsx";
import { SceneJSX } from "../scene/scene-jsx.jsx";
import { ViewJSX } from "../scene/view-jsx";

interface ICommandsJSX {
  /**
   * Command callback structure. Gives an instance of the surface at that
   * moment in time of drawing for this scene
   */
  callback: CommandCallback;
  /** Name for the scene to generate this command */
  name: string;
}

export const CommandsJSX = (props: ICommandsJSX) => {
  return (
    <SceneJSX name={props.name}>
      <ViewJSX type={View2D} config={{ camera: new Camera2D() }} />
      <LayerJSX type={CommandLayer} config={{ commands: props.callback }} />
    </SceneJSX>
  );
};
