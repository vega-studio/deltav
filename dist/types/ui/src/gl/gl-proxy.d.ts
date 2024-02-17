import { Attribute } from "./attribute";
import { ColorBuffer } from "./color-buffer";
import { Geometry } from "./geometry";
import { GLContext, IExtensions } from "./types";
import { GLState } from "./gl-state";
import { Material } from "./material";
import { Model } from "./model";
import { RenderTarget } from "./render-target";
import { Texture } from "./texture";
/**
 * This is where all objects go to be processed and updated with webgl calls. Such as textures, geometries, etc
 */
export declare class GLProxy {
    /** Message to include with debugging statements, warnings and errors */
    debugContext: string;
    /** This is the gl context we're manipulating. */
    gl: GLContext;
    /** This is the state tracker of the GL context */
    state: GLState;
    /** These are the extensions established for the context */
    extensions: IExtensions;
    /**
     * Store all of the compiled shaders based on the string text of the
     * shader so we never duplicate a shader program.
     */
    private fragmentShaders;
    /**
     * Store all of the compiled shaders based on the string text of the
     * shader so we never duplicate a shader program.
     */
    private vertexShaders;
    /**
     * Make a look up for existing programs based on shader objects.
     */
    private programs;
    constructor(gl: GLContext, state: GLState, extensions: IExtensions);
    /**
     * This enables the desired and supported extensions this framework utilizes.
     */
    static addExtensions(gl: GLContext): IExtensions;
    /**
     * Clears the specified buffers
     */
    clear(color?: boolean, depth?: boolean, stencil?: boolean): void;
    /**
     * Takes an Attribute object and ensures it's buffer is created and initialized.
     */
    compileAttribute(attribute: Attribute): true | undefined;
    /**
     * Takes a geometry object and ensures all of it's buffers are generated
     */
    compileGeometry(geometry: Geometry): true | undefined;
    /**
     * This creates the shaders and programs needed to create a material.
     */
    compileMaterial(material: Material): boolean | undefined;
    /**
     * This does what is needed to generate a GPU FBO that we can utilize as a render target
     * for subsequent draw calls.
     */
    compileRenderTarget(target: RenderTarget): boolean;
    /**
     * Produces a render buffer object intended for a render target for the depth buffer attachment
     */
    private compileDepthBuffer;
    /**
     * Produces a render buffer object intended for a render target for the stencil buffer attachment
     */
    private compileStencilBuffer;
    /**
     * Produces a render buffer object intended for a render target for the color
     * buffer attachment
     */
    private compileColorBuffer;
    /**
     * This does what is needed to generate a GPU texture object and format it to
     * the Texture object specifications.
     */
    compileTexture(texture: Texture): true | undefined;
    /**
     * Executes the draw operation for a given model
     */
    draw(model: Model): void;
    /**
     * Destroys an attribute's resources from the GL Context
     */
    disposeAttribute(attribute: Attribute): void;
    /**
     * Destroys a color buffer's resources from the GL Context
     */
    disposeColorBuffer(colorBuffer: ColorBuffer): void;
    /**
     * Destroys a geometry's resources from the GL Context
     */
    disposeGeometry(geometry: Geometry): void;
    /**
     * Destroys a material's resources from the GL Context.
     */
    disposeMaterial(material: Material): void;
    /**
     * Destroy a render buffer (RBO)
     */
    disposeRenderBuffer(buffer: WebGLRenderbuffer): void;
    /**
     * Destroys a render target's resources from the GL context
     */
    disposeRenderTarget(target: RenderTarget): void;
    /**
     * Destroys a texture's resources from the GL context
     */
    disposeTexture(texture: Texture): void;
    /**
     * Retrieves the gl context from the canvas
     */
    static getContext(canvas: HTMLCanvasElement, options: object): {
        context: GLContext | null;
        extensions: IExtensions;
    };
    /**
     * This decodes and prints any webgl context error in a  human readable manner.
     */
    printError(): void;
    /**
     * Breaks down a string into a multiline structure. Helps pretty print some
     * items.
     */
    lineFormat(str: string): string;
    /**
     * Prints a shader broken down by lines
     */
    lineFormatShader(shader: Material["fragmentShader"] | Material["vertexShader"]): string | void;
    /**
     * Ensures a texture object is compiled and/or updated.
     */
    updateTexture(texture: Texture): void;
    /**
     * Ensures the texture object has it's data uploaded to the GPU
     */
    private updateTextureData;
    /**
     * This consumes all of the partial texture updates applied to the texture.
     */
    private updateTexturePartialData;
    /**
     * Modifies all settings needing modified on the provided texture object.
     */
    private updateTextureSettings;
    /**
     * This updates an attribute's buffer data
     */
    updateAttribute(attribute: Attribute): true | undefined;
    /**
     * This performs all necessary functions to use the attribute utilizing
     * the current program in use.
     */
    useAttribute(name: string, attribute: Attribute, geometry: Geometry): boolean | undefined;
}
