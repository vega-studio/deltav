import { afterAll } from "bun:test";

import { syncFixtureList } from "./fixture-list.js";
import { stopFixtureServer } from "./fixture-server.js";

/**
 * `bun test` preload (bunfig.toml `[test] preload`), the replacement of jest's
 * globalSetup/globalTeardown: it brings the fixture import list up to date
 * before any test file loads and stops the fixture server, which
 * `useFixturePage()` starts on first use, once every file has run.
 */
syncFixtureList();

afterAll(async () => {
  await stopFixtureServer();
});
