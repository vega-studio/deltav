import React from "react";
import { CommandCallback } from "../../../surface";
interface ICommandsJSX {
    /**
     * Command callback structure. Gives an instance of the surface at that
     * moment in time of drawing for this scene
     */
    callback: CommandCallback;
    /** Name for the scene to generate this command */
    name?: string;
}
export declare const CommandsJSX: (props: ICommandsJSX) => React.JSX.Element;
export {};
