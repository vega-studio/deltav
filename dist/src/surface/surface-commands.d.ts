import { RenderTarget } from "../gl/render-target";
import { Surface } from "./surface";
import { View } from "./view";
export interface ISurfaceCommandsOptions {
    surface: Surface;
}
/**
 * These are deeply integrated commands that are available but made convenient
 * through surface features. These commands are designed to be ran either pre or
 * post render and may involve blocking CPU to GPU commands such as
 * computational feedback or pixel reading from a texture.
 */
export declare class SurfaceCommands {
    surface: Surface;
    pickingRenderTargets: Map<View<any>, RenderTarget>;
    constructor(options: ISurfaceCommandsOptions);
    private analyzePickedPixels;
    /**
     * This causes picking operations to get dequeued and have the textures
     * associated with the picking have their pixels read for interpretation for
     * instance interaction.
     *
     * This is a BLOCKING operation and it will block until ALL GPU operations
     * have been completed by the GPU. Thus, it is recommended to perform this
     * command at the beginning of the pipeline to allow for the previous frame to
     * completely
     */
    decodePicking(): void;
}
