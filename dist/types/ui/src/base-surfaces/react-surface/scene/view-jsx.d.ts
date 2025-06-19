import React from "react";
import { IViewConstructable, IViewProps } from "../../../surface/index.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { IViewBaseJSX } from "./as-view.js";
type ViewJSXOutput = {
    /**
     * Specify output targets for the render/color buffers this view wants to write to.
     * Use the name of the Resource that will be used to be written to.
     */
    buffers: Record<number, string | undefined>;
    /**
     * Set to true to include a depth buffer the system will generate for you.
     * Use the name of the Resource to use it if you wish to target an output
     * target texture.
     */
    depth: string | boolean;
    /**
     * Specify a render target to blit the current framebuffer to.
     */
    blit?: {
        color?: Record<number, string | undefined>;
        depth?: string;
    };
};
export interface IViewJSX<TProps extends IViewProps> extends Partial<IViewBaseJSX<TProps>> {
    /**
     * Resource name for debugging mostly. Maps to resource "key" in the deltav
     * resource.
     */
    name?: string;
    /** The View constructor type we wish to initialize */
    type: IViewConstructable<TProps> & {
        defaultProps: TProps;
    };
    /** Configure the constructed layer via the layer's props */
    config: Omit<TProps, "key" | "viewport" | "output" | "chain"> & Partial<Pick<TProps, "key" | "viewport">> & {
        output?: undefined;
        chain?: undefined;
    };
    /**
     * An output configuration that handles the JSX pattern where we use refs
     * to pass the values around to each other. Specify an array to create a view
     * chain for rendering to different targets.
     */
    output?: ViewJSXOutput | ViewJSXOutput[];
}
export type IPartialViewJSX<TProps extends IViewProps> = Partial<Omit<IViewJSX<TProps>, "config">> & {
    config?: Partial<IViewJSX<TProps>["config"]>;
};
/**
 * Provides a View to be used by a scene
 */
export declare const ViewJSX: {
    <TProps extends IViewProps = IViewProps>(props: IViewJSX<TProps>): React.JSX.Element;
    surfaceJSXType: SurfaceJSXType;
};
export {};
