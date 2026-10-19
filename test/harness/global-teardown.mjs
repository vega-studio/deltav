// Jest globalTeardown: closes the Vite server global-setup.mjs started.
import fs from "fs";

export default async function globalTeardown() {
  await globalThis.__DELTAV_VITE__?.close();
  globalThis.__DELTAV_VITE__ = undefined;
  const file = process.env.DELTAV_TEST_URL_FILE;
  if (file && fs.existsSync(file)) fs.unlinkSync(file);
}
