import { afterAll, describe, expect, test } from "bun:test";
import fs from "fs";
import os from "os";
import path from "path";

import { deltavBunPlugin } from "../../build/plugins/bun.js";
import {
  cssInjectModule,
  INLINE_ASSET_MIME,
  inlineAssetModule,
  isProjectFile,
  shaderModule,
} from "../../build/plugins/loaders.js";

/** Evaluates `export default <expr>;` module text and returns the value. */
async function importModule(code: string): Promise<any> {
  const url = `data:text/javascript;base64,${btoa(
    unescape(encodeURIComponent(code))
  )}`;
  return (await import(url)).default;
}

describe("shaderModule", () => {
  test("round-trips backticks, ${, backslashes and newlines", async () => {
    const source =
      "precision highp float;\n// `tick` ${notTemplate} \\ back\\slash\r\n" +
      'void main() { gl_FragColor = vec4("é", 1.0); }\n';
    expect(await importModule(shaderModule(source))).toBe(source);
  });
});

describe("inlineAssetModule", () => {
  const bytes = new Uint8Array([0, 1, 2, 250, 255]);
  const b64 = btoa(String.fromCharCode(...bytes));

  test("gives the MIME type of every asset extension", async () => {
    const expected: Record<string, string> = {
      ".woff": "font/woff",
      ".woff2": "font/woff2",
      ".ttf": "font/ttf",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
    };
    expect(INLINE_ASSET_MIME).toEqual(expected);
    for (const [ext, mime] of Object.entries(expected)) {
      const code = inlineAssetModule(`/a/b/file${ext}`, bytes);
      expect(code).toBeDefined();
      expect(await importModule(code!)).toBe(`data:${mime};base64,${b64}`);
    }
  });

  test("strips a ?inline query", async () => {
    const code = inlineAssetModule("/fonts/x.woff2?inline", bytes);
    expect(await importModule(code!)).toBe(`data:font/woff2;base64,${b64}`);
  });

  test("returns undefined for other extensions", () => {
    expect(inlineAssetModule("/src/file.ts", bytes)).toBeUndefined();
  });
});

describe("isProjectFile", () => {
  test("rejects node_modules and virtual ids", () => {
    expect(isProjectFile("/repo/ui/src/a.vs")).toBe(true);
    expect(isProjectFile("/repo/node_modules/x/a.vs")).toBe(false);
    expect(isProjectFile("\0virtual.vs")).toBe(false);
  });
});

describe("cssInjectModule", () => {
  test("appends exactly one style when evaluated twice", () => {
    const appended: any[] = [];
    const fakeDocument = {
      head: {
        appendChild(node: any) {
          appended.push(node);
        },
        querySelectorAll(_selector: string) {
          return appended;
        },
      },
      createElement(_tag: string) {
        const attributes: Record<string, string> = {};
        return {
          textContent: "",
          setAttribute(name: string, value: string) {
            attributes[name] = value;
          },
          getAttribute(name: string) {
            return attributes[name] ?? null;
          },
        };
      },
    };
    const code = cssInjectModule(".A { color: red; }", "a.css").replace(
      "export {};",
      ""
    );
    const run = new Function("document", code);
    run(fakeDocument);
    run(fakeDocument);
    expect(appended.length).toBe(1);
    expect(appended[0].textContent).toBe(".A { color: red; }");
    expect(appended[0].getAttribute("data-deltav")).toBe("a.css");
  });
});

describe("deltavBunPlugin", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "deltav-plugins-"));
  afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

  test("bundles shader, svg and injected css imports", async () => {
    const shader = "void main() { gl_Position = vec4(`x`); }";
    fs.writeFileSync(path.join(dir, "a.vs"), shader);
    fs.writeFileSync(path.join(dir, "b.svg"), "<svg></svg>");
    fs.writeFileSync(path.join(dir, "c.css"), ".SurfaceJSX { display: flex; }");
    fs.writeFileSync(
      path.join(dir, "entry.ts"),
      [
        'import "./c.css";',
        'import vs from "./a.vs";',
        'import svg from "./b.svg";',
        "console.log(vs, svg);",
      ].join("\n")
    );

    const result = await Bun.build({
      entrypoints: [path.join(dir, "entry.ts")],
      target: "browser",
      plugins: [deltavBunPlugin({ css: "inject" })],
    });
    expect(result.success).toBe(true);
    const js = await result.outputs
      .find((output) => output.path.endsWith(".js"))!
      .text();
    expect(js).toContain(JSON.stringify(shader).slice(1, -1));
    expect(js).toContain("data:image/svg+xml;base64");
    expect(js).toContain(".SurfaceJSX { display: flex; }");
    expect(js).toContain("data-deltav");
  });
});
