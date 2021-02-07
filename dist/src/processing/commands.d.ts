import { CommandCallback } from "../surface";
/**
 * This sets up essentially a callback within the pipeline that lets you execute
 * arbitrary commands such as GL or built in Surface commands or simply run a
 * script in mid render pipeline.
 *
 * This is very open ended on what it is intended to do. You can really hose
 * performance if you use this without understanding how rendering pipelines
 * work or by not following documentation correctly.
 */
export declare function commands(commands: CommandCallback): {
    views: {
        screen: import("../surface").ViewInitializer<import("../2d").IView2DProps>;
    };
    layers: {
        screen: import("../surface").LayerInitializer;
    };
};
