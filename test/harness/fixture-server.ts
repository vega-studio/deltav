// Fixture server: Bun.serve with an HTML import of test/fixtures/index.html (not Vite): Bun's bundler serves
// the fixtures correctly with deltavBunPlugin, loaded through bunfig.toml [serve.static] plugins.
import path from "path";

/** The fixture host page every browser test opens. */
const INDEX_HTML = path.resolve(import.meta.dir, "../fixtures/index.html");

type ServeOptions = Parameters<typeof Bun.serve>[0];

let server: ReturnType<typeof Bun.serve> | undefined;

/**
 * Starts the fixture server on a free port the first time it is called and
 * returns its URL (also published as DELTAV_TEST_URL); later calls return the
 * same URL. Browser-free test files
 * never call it, so they do not pay for the bundle.
 */
export async function startFixtureServer(): Promise<string> {
  if (!server) {
    // A runtime HTML import (Bun's HTMLBundle); dynamic so the typecheck does
    // not depend on a bun-types version that declares `*.html` modules.
    const indexPage = (await import(INDEX_HTML)).default;
    const options = {
      hostname: "127.0.0.1",
      port: 0,
      // Development bundling (React's development build, readable stacks)
      // without hot reloading: the HMR module runtime breaks deltav's circular
      // imports (`create.view` is read while ui/src/surface/view.ts loads).
      development: { hmr: false },
      routes: { "/": indexPage },
      fetch: () => new Response("Not found", { status: 404 }),
    };
    server = Bun.serve(options as unknown as ServeOptions);
    process.env.DELTAV_TEST_URL = server.url.href;
  }

  return server.url.href;
}

/** Stops the fixture server if it was started. */
export async function stopFixtureServer(): Promise<void> {
  const running = server;
  server = void 0;
  delete process.env.DELTAV_TEST_URL;
  await running?.stop(true);
}
