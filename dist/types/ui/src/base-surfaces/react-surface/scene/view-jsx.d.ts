import React from "react";
import { IViewConstructable, IViewProps } from "../../../surface/index.js";
import { IViewBaseJSX } from "./as-view.js";
import { SurfaceJSXType } from "../group-surface-children.js";
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
    config: Omit<TProps, "key" | "viewport"> & Partial<Pick<TProps, "key" | "viewport">>;
    /**
     * An output configuration that handles the JSX pattern where we use refs
     * to pass the values around to each other.
     */
    output?: {
        /**
         * Specify output targets for the color buffers this view wants to write to.
         * Use the name of the Resource to use it.
         */
        buffers: Record<number, string>;
        /**
         * Set to true to include a depth buffer the system will generate for you.
         * Use the name of the Resource to use it if you wish to target an output
         * target texture.
         */
        depth: string | boolean;
    };
}
export type IPartialViewJSX<TProps extends IViewProps> = Partial<Omit<IViewJSX<TProps>, "config">> & {
    config?: Partial<IViewJSX<TProps>["config"]>;
};
/**
 * Provides a View to be used by a scene
 */
export declare const ViewJSX: {
    <TProps extends IViewProps = IViewProps>(props: IViewJSX<TProps>): React.JSX.Element;
    defaultProps: {
        surfaceJSXType: SurfaceJSXType;
    };
};
