/**
 * This method ensures the fonts required for this SPA are embedded into the
 * page.
 *
 * @param context Provide a context id to identify the fonts embedded for the
 *                sake of destroying them later.
 * @param fontName The name of the font as is expected to be used from the font
 *                 resource (such as "sans serif")
 * @param fontResource Use require(<file path>) to provide for the param.
 * @param fontType Set the type of font the file is providing
 * @param weight The weight value associated with this font:
 *                 - 100: thin
 *                 - 200: extra-light
 *                 - 300: light
 *                 - 400: normal
 *                 - 500: medium
 *                 - 600: semi-bold
 *                 - 700: bold
 *                 - 800: extra-bold
 *                 - 900: black
 */
export declare function addFont(context: string, fontName: string, fontResource: string, fontType: string, weight?: number | `${number} ${number}`, style?: string): void;
/**
 * Destroys the embedded fonts for this SPA. This ensures your component does
 * not cause leaks
 *
 * @param context Provide the context id for the fonts that should be destroyed.
 */
export declare function destroyAllFonts(context: string): void;
