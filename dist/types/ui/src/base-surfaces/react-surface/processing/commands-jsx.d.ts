import React from "react";
import { CommandCallback } from "../../../surface";
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
export declare const CommandsJSX: (props: ICommandsJSX) => React.JSX.Element;
export {};
