// The leak instrument, first: ES modules evaluate in import order, so it
// wraps WebGL and the listener methods before the fixture imports load deltav.
import "../harness/leaks-page.js";

import React from "react";
import { createRoot, type Root } from "react-dom/client";

import type {
  DeltavHostAPI,
  FixtureProps,
  PixelBlock,
} from "../harness/host-api.js";
// Every fixture file registers itself when imported (the list is generated,
// see test/harness/fixture-list.ts).
import "./fixtures.js";

import {
  fixtureNames,
  getFixture,
  HostContext,
  type HostContextValue,
} from "./fixture-registry.js";

const rootElement = document.getElementById("root")!;

let root: Root | null = null;
let current: { name: string; props: FixtureProps } | null = null;
let hostValue: HostContextValue | null = null;
let readyPromise: Promise<void> | null = null;

function nextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

async function waitFrames(n: number) {
  for (let i = 0; i < n; ++i) await nextFrame();
}

function newHostValue() {
  let resolve!: () => void;
  let reject!: (e: unknown) => void;
  readyPromise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  hostValue = { ready: resolve, fail: reject };
}

function render() {
  if (!root || !current || !hostValue) return;
  const Fixture = getFixture(current.name)!;
  root.render(
    <HostContext.Provider value={hostValue}>
      <Fixture {...current.props} />
    </HostContext.Provider>
  );
}

function canvas(): HTMLCanvasElement {
  const el = rootElement.querySelector("canvas");
  if (!el) throw new Error("The mounted fixture has no canvas");
  return el;
}

const api: DeltavHostAPI = {
  fixtures: fixtureNames,

  async mount(name, props = {}) {
    if (root) throw new Error(`mount("${name}"): a fixture is already mounted`);
    if (!getFixture(name)) {
      throw new Error(
        `Unknown fixture "${name}". Registered: ${fixtureNames().join(", ")}`
      );
    }
    current = { name, props };
    newHostValue();
    root = createRoot(rootElement);
    render();
    await readyPromise;
    await waitFrames(2);
  },

  async update(props) {
    if (!current) throw new Error("update(): no fixture is mounted");
    current = { ...current, props };
    render();
    await waitFrames(2);
  },

  async unmount() {
    root?.unmount();
    root = null;
    current = null;
    hostValue = null;
    readyPromise = null;
    await waitFrames(2);
  },

  waitFrames,

  readPixels(x, y, w, h): PixelBlock {
    const source = canvas();
    const copy = document.createElement("canvas");
    copy.width = source.width;
    copy.height = source.height;
    const ctx = copy.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(source, 0, 0);
    const data = ctx.getImageData(x, y, w, h).data;
    return { width: w, height: h, data: Array.from(data) };
  },

  canvasSize() {
    const c = canvas();
    return { width: c.width, height: c.height };
  },
};

window.__deltav = api;
