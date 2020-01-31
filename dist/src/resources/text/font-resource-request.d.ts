import { Texture } from "../../gl/texture";
import { ResourceType } from "../../types";
import { BaseResourceRequest } from "../base-resource-manager";
import { FontMap, KernedLayout } from "./font-map";
export declare enum FontResourceRequestFetch {
    /** Retrieves the tex coordinates on the font map of the specified character glyph. Defaults to [0, 0, 0, 0] */
    TEXCOORDS = 0,
    /** Retrieves the pixel size of the character glyph on the font map */
    IMAGE_SIZE = 1
}
/**
 * Properties needed to make a font resource request
 */
export interface IFontResourceRequest extends BaseResourceRequest {
    /** The character being requested from the fontmap */
    character?: string;
    /** This changes the information retrieved as a result of the request method. */
    fetch?: FontResourceRequestFetch;
    /**
     * When the request has been processed and results become available, this is populated with the FontMap object that has everything
     * needed for the requester to get the information needed.
     */
    fontMap?: FontMap;
    /**
     * The characters for which we want to have the kerning information retrieved. This will be applied as a list of words
     * for which we want the kerning information. We do this to prevent concating the words into a single string which can
     * make it really difficult to preload all possible label combinations.
     */
    kerningPairs?: string[];
    /** When provided, the request will fill in the metrics for the input parameters */
    metrics?: {
        /** The desired font size for the layout */
        fontSize: number;
        /**
         * The system will populate this for you with the layout (top left is at 0,0) of the text.
         * If maxWidth is provided, this will be the layout of the truncated text.
         */
        layout?: KernedLayout;
        /** Spacing between letters in a label */
        letterSpacing: number;
        /** When provided, this will cause the system to see if the text should be truncated or not */
        maxWidth?: number;
        /** This is the source text that we wish to receive the metrics for. */
        text: string;
        /** These are the characters to use to indicate truncation in the event truncation takes place */
        truncation?: string;
        /**
         * If maxWidth is provided, this will provide the calculated truncated text. This will be the full
         * text if no truncation is provided.
         */
        truncatedText?: string;
    };
    /** This is to satisfy the use of the TextureIOExpansion. This is the texture within the fontmap */
    texture?: Texture;
    /** Establish the only type that this request shall be is a FONT type */
    type: ResourceType.FONT;
}
