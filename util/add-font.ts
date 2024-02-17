const LINK_ID_PREFIX = "__lyra__font__";
const linkIds: Map<string, string[]> = new Map();

/**
 * Retrieve the link ids for the given context
 */
function getLinkIds(context: string) {
  let ids = linkIds.get(context);

  if (!ids) {
    ids = [];
    linkIds.set(context, ids);
  }

  return ids;
}

/**
 * This is a helper method to generate a font face string to embed the base64 encoded fonts that get bundled into
 * the application.
 */
function fontString(
  fontName: string,
  source: string,
  weight: number | `${number} ${number}` = 400,
  style = "normal",
  fontType = "woff2"
) {
  return `
    @font-face {
      font-family: '${fontName}';
      src: url(${source})${fontType ? `format('${fontType}')` : ""};
      font-weight: ${weight};
      font-style: ${style};
    }
  `;
}

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
export function addFont(
  context: string,
  fontName: string,
  fontResource: string,
  fontType: string,
  weight: number | `${number} ${number}` = 400,
  style = "normal"
) {
  const linkId = `${LINK_ID_PREFIX}${context}__${fontName}${weight}${style}`;

  if (document.getElementById(linkId)) return;
  const linkElement = document.createElement("style");
  // List fonts here to embed
  const font = `
    ${fontString(fontName, fontResource, weight, style, fontType)}
  `;
  linkElement.setAttribute("rel", "stylesheet");
  linkElement.setAttribute("type", "text/css");
  linkElement.innerHTML = font;
  linkElement.setAttribute("id", linkId);
  const head = document.getElementsByTagName("head")[0];
  if (head) head.appendChild(linkElement);

  getLinkIds(context).push(linkId);
}

/**
 * Destroys the embedded fonts for this SPA. This ensures your component does
 * not cause leaks
 *
 * @param context Provide the context id for the fonts that should be destroyed.
 */
export function destroyAllFonts(context: string) {
  for (const linkId of getLinkIds(context)) {
    const linkElement = document.getElementById(linkId);
    if (linkElement) linkElement.remove();
  }

  linkIds.delete(context);
}
