/**
 * Pure, dependency-free module generators shared by the Vite adapter
 * (`build/plugins/vite.ts`) and the Bun adapter (`build/plugins/bun.ts`).
 * They turn a file's contents into the source of an ES module; reading the
 * file is the adapter's job.
 */

/** File extensions loaded as shader source strings. */
export const SHADER_EXTENSIONS = [".vs", ".fs"];

/** MIME type of every asset extension inlined as a base64 data URL. */
export const INLINE_ASSET_MIME: Record<string, string> = {
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

/** Removes a `?query` suffix (such as `?inline`) from a module id. */
export function stripQuery(path: string): string {
  const index = path.indexOf("?");
  return index < 0 ? path : path.slice(0, index);
}

/** Lower-cased extension of a path including the dot, or "" when it has none. */
export function extensionOf(path: string): string {
  const file = stripQuery(path);
  const slash = Math.max(file.lastIndexOf("/"), file.lastIndexOf("\\"));
  const dot = file.lastIndexOf(".");
  if (dot <= slash + 1) return "";
  return file.slice(dot).toLowerCase();
}

/** True when the id names a shader source (`.vs` / `.fs`). */
export function isShaderFile(path: string): boolean {
  return SHADER_EXTENSIONS.includes(extensionOf(path));
}

/** True when the id names an asset that is inlined as a data URL. */
export function isInlineAsset(path: string): boolean {
  return extensionOf(path) in INLINE_ASSET_MIME;
}

/**
 * True for files of this project: false for anything under `node_modules`
 * and for virtual (`\0`-prefixed) module ids.
 */
export function isProjectFile(path: string): boolean {
  if (path.startsWith("\0")) return false;
  return !/[\\/]node_modules[\\/]/.test(path);
}

/** Module whose default export is the shader source, unchanged. */
export function shaderModule(source: string): string {
  return `export default ${JSON.stringify(source)};`;
}

/** Base64 of raw bytes, without relying on Node's Buffer. */
function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/**
 * Module whose default export is the asset as a `data:<mime>;base64,…` URL,
 * or undefined when the extension is not an inlined asset type.
 */
export function inlineAssetModule(
  path: string,
  bytes: Uint8Array
): string | undefined {
  const mime = INLINE_ASSET_MIME[extensionOf(path)];
  if (!mime) return undefined;
  return `export default ${JSON.stringify(
    `data:${mime};base64,${toBase64(bytes)}`
  )};`;
}

/**
 * Module that, in a browser, appends the CSS to `document.head` as one
 * `<style data-deltav="<id>">`, skipping it when a style with that id is
 * already present. Exports nothing.
 */
export function cssInjectModule(css: string, id: string): string {
  return [
    `if (typeof document !== "undefined") {`,
    `  const id = ${JSON.stringify(id)};`,
    `  const existing = Array.from(document.head.querySelectorAll("style[data-deltav]"))`,
    `    .some((style) => style.getAttribute("data-deltav") === id);`,
    `  if (!existing) {`,
    `    const style = document.createElement("style");`,
    `    style.setAttribute("data-deltav", id);`,
    `    style.textContent = ${JSON.stringify(css)};`,
    `    document.head.appendChild(style);`,
    `  }`,
    `}`,
    `export {};`,
  ].join("\n");
}
