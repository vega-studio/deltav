import { afterAll, beforeAll } from "bun:test";
import fs from "fs";
import os from "os";
import path from "path";
import { type Browser, chromium, type Page } from "playwright-core";

import { startFixtureServer } from "./fixture-server.js";
import type {} from "./host-api.js";

/**
 * Chromium flags that make WebGL2 deterministic: ANGLE on SwiftShader, the
 * CPU rasteriser, regardless of the machine's GPU.
 */
export const DETERMINISTIC_GL_ARGS = [
  "--use-gl=angle",
  "--use-angle=swiftshader",
  "--enable-unsafe-swiftshader",
  "--ignore-gpu-blocklist",
];

/** Fixed page geometry every fixture renders into. */
export const VIEWPORT = { width: 800, height: 600 };

const INSTALL_HINT =
  "Run `bunx playwright-core install chromium-headless-shell`, or point DELTAV_TEST_CHROMIUM at a Chromium/headless_shell binary.";

/** The newest headless shell in the Playwright browser cache, if any. */
function newestCachedHeadlessShell(): string | undefined {
  const cache =
    process.env.PLAYWRIGHT_BROWSERS_PATH ||
    path.join(os.homedir(), ".cache", "ms-playwright");
  if (!fs.existsSync(cache)) return void 0;

  const dirs = fs
    .readdirSync(cache)
    .filter((d) => d.startsWith("chromium_headless_shell-"))
    .sort(
      (a, b) =>
        Number(b.split("-").pop()) - Number(a.split("-").pop())
    );

  for (const dir of dirs) {
    const root = path.join(cache, dir);
    for (const sub of fs.readdirSync(root)) {
      if (!sub.startsWith("chrome-")) continue;
      for (const exe of ["headless_shell", "chrome-headless-shell"]) {
        const candidate = path.join(root, sub, exe);
        if (fs.existsSync(candidate)) return candidate;
      }
    }
  }

  return void 0;
}

/**
 * Resolves the Chromium binary: DELTAV_TEST_CHROMIUM, then the build
 * playwright-core expects, then the newest cached headless shell.
 */
export function resolveChromium(): string {
  const fromEnv = process.env.DELTAV_TEST_CHROMIUM;
  if (fromEnv) {
    if (fs.existsSync(fromEnv)) return fromEnv;
    throw new Error(`DELTAV_TEST_CHROMIUM=${fromEnv} does not exist. ${INSTALL_HINT}`);
  }

  try {
    const expected = chromium.executablePath();
    if (expected && fs.existsSync(expected)) return expected;
  } catch {
    // playwright-core has no registry entry for this platform; fall through
  }

  const cached = newestCachedHeadlessShell();
  if (cached) return cached;

  throw new Error(`No Chromium found for the test harness. ${INSTALL_HINT}`);
}

/** Launches headless Chromium with deterministic software WebGL2. */
export async function launchBrowser(): Promise<Browser> {
  return chromium.launch({
    executablePath: resolveChromium(),
    headless: true,
    args: DETERMINISTIC_GL_ARGS,
  });
}

/** URL of the fixture server (test/harness/fixture-server.ts), started on first use. */
export function testServerUrl(): Promise<string> {
  return startFixtureServer();
}

/** A page on the fixture host, with the errors it has logged. */
export type FixturePage = Page & {
  /** Every console.error and uncaught page error, in order. */
  errors: string[];
};

/**
 * Opens the fixture host page at a fixed 800×600 viewport with
 * deviceScaleFactor 1 and waits for `window.__deltav`.
 */
export async function openFixturePage(browser: Browser): Promise<FixturePage> {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
  });
  const page = (await context.newPage()) as FixturePage;
  page.errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") page.errors.push(`console.error: ${msg.text()}`);
  });
  page.on("pageerror", (err) => {
    page.errors.push(`pageerror: ${err.stack || err.message}`);
  });

  await page.goto(await testServerUrl());
  await page.waitForFunction(() => Boolean(window.__deltav), void 0, {
    timeout: 30000,
  });

  return page;
}

/** Handle returned by useFixturePage; `page` is valid inside tests only. */
export interface FixturePageHandle {
  page: FixturePage;
  browser: Browser;
}

/**
 * Registers beforeAll/afterAll hooks so every test of the calling file shares
 * one browser and one fixture page. Read `handle.page` inside tests.
 */
export function useFixturePage(): FixturePageHandle {
  const handle = {} as FixturePageHandle;

  beforeAll(async () => {
    handle.browser = await launchBrowser();
    handle.page = await openFixturePage(handle.browser);
  });

  afterAll(async () => {
    await handle.browser?.close();
  });

  return handle;
}
