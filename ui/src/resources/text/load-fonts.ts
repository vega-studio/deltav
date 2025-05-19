import type { IFontMapEmbed, IFontMapMetrics } from "./font-manager.js";

/**
 * This ensures the fonts being embedded have been loaded completely before
 * continuing operation.
 */
export async function loadFonts(
  fontString: string,
  embed?: IFontMapMetrics["embed"]
) {
  let step = 0;
  let currentEmbed: IFontMapEmbed | undefined;
  let currentFontFace: FontFace | undefined;

  try {
    if (!embed) return;
    for (const e of embed) {
      currentEmbed = e;
      step = 0;
      if (document.fonts.check(fontString)) continue;
      step++;
      currentFontFace = new FontFace(e.familyName, `url(${e.source})`, {
        weight: `${e.weight}`,
        style: e.style,
      });
      step++;
      await currentFontFace.load();
      step++;
      document.fonts.add(currentFontFace);
    }

    await document.fonts.ready;
  } catch (err) {
    console.error("Font embedding Error:");

    switch (step) {
      case 0:
        console.error("Font embedding failed check:", fontString);
        break;
      case 1:
        console.error(
          "Font embedding failed to create the font face:",
          currentEmbed
        );
        break;
      case 2:
        console.error("Font embedding failed to load the font face:", {
          fontFace: currentFontFace,
          embedding: currentEmbed,
        });
        break;
      case 3:
        console.error("Font embedding failed to add the font face", {
          fontFace: currentFontFace,
          embedding: currentEmbed,
        });
        break;
    }

    if (err instanceof Error) {
      console.error(err.stack || err.message);
    }
  }
}
