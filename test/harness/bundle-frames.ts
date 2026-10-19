/**
 * Names the source module of each stack frame of the fixture page. Bun.serve
 * bundles the page into one chunk (test/harness/fixture-server.ts), so a page
 * stack points at `/chunk-….js:<line>:<col>` instead of the source file; the
 * development bundle starts every module with a `// <path>` comment line,
 * which maps a chunk line back to its module.
 */

/** A bundle frame: `http://host/chunk.js:line:col`. */
const BUNDLE_FRAME = /(https?:\/\/[^\s()]+?\.js):(\d+):\d+/;
/** A module header line of a Bun development bundle. */
const MODULE_HEADER = /^\/\/ (\S+\.[cm]?[jt]sx?)$/;

/** Per bundle URL: the module of every line (0-based). */
const modulesByUrl = new Map<string, Promise<(string | undefined)[]>>();

function lineModules(url: string): Promise<(string | undefined)[]> {
  let modules = modulesByUrl.get(url);
  if (!modules) {
    modules = fetch(url)
      .then((res) => (res.ok ? res.text() : ""))
      .catch(() => "")
      .then((source) => {
        let current: string | undefined;
        return source.split("\n").map((line) => {
          const header = MODULE_HEADER.exec(line);
          if (header) current = header[1];
          return current;
        });
      });
    modulesByUrl.set(url, modules);
  }
  return modules;
}

/**
 * Appends `[<module path>]` to every bundle frame of `stack` whose module is
 * known. Frames of other URLs (or of a server that is gone) stay as they are.
 */
export async function annotateFrames(stack: string): Promise<string[]> {
  const frames: string[] = [];
  for (const frame of stack.split("\n")) {
    if (!frame) continue;
    const match = BUNDLE_FRAME.exec(frame);
    const module = match
      ? (await lineModules(match[1]))[Number(match[2]) - 1]
      : void 0;
    frames.push(module ? `${frame} [${module}]` : frame);
  }
  return frames;
}
