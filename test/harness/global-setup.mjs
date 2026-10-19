// Jest globalSetup. Plain ESM (.mjs) because ts-jest compiles TypeScript
// global setup files to CommonJS, where Vite's ESM API and the config's
// import.meta are unavailable.
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "vite";

const HARNESS_DIR = path.dirname(fileURLToPath(import.meta.url));

/**
 * Starts the test-only Vite dev server (test/harness/vite.config.ts, root
 * test/fixtures) on a free port and publishes its URL as DELTAV_TEST_URL. The
 * URL is also written to a temp file named by DELTAV_TEST_URL_FILE, for
 * workers that do not inherit the env var.
 */
export default async function globalSetup() {
  const server = await createServer({
    configFile: path.join(HARNESS_DIR, "vite.config.ts"),
  });
  await server.listen();
  const url = server.resolvedUrls?.local[0];
  if (!url) throw new Error("Vite test server did not report a URL");

  const urlFile = path.join(os.tmpdir(), `deltav-test-url-${process.pid}`);
  fs.writeFileSync(urlFile, url);

  globalThis.__DELTAV_VITE__ = server;
  process.env.DELTAV_TEST_URL = url;
  process.env.DELTAV_TEST_URL_FILE = urlFile;
}
