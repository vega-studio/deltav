/**
 * Page side of the leak detector. The fixture host imports this module before
 * anything else, so it instruments every WebGL context deltav (or a fixture)
 * creates and every window/document listener added after the page loaded.
 *
 * Contexts are never wrapped in a Proxy: deltav checks
 * `ctx instanceof WebGL2RenderingContext`, and native WebGL methods throw
 * "Illegal invocation" on a Proxy `this`. Instead the create/delete methods of
 * the real context object are replaced with own-property wrappers.
 *
 * Installs `window.__deltavLeaks` (see `DeltavLeaksAPI` in host-api.ts).
 */
// eslint-disable-next-line node/file-extension-in-import -- package subpath export, no .js file
import { createRoot } from "react-dom/client";

import { frameCommandStats } from "../../ui/src/util/frame.js";
import {
  type DeltavLeaksAPI,
  type LeakDetails,
  type LeakEntry,
  RESOURCE_KINDS,
  type ResourceKind,
  type ResourceSnapshot,
} from "./host-api.js";

type GLContext = WebGLRenderingContext | WebGL2RenderingContext;

/** GL object kinds: [kind, create method, delete method, label]. */
const GL_PAIRS: [ResourceKind, string, string, string][] = [
  ["buffers", "createBuffer", "deleteBuffer", "buffer"],
  ["textures", "createTexture", "deleteTexture", "texture"],
  ["framebuffers", "createFramebuffer", "deleteFramebuffer", "framebuffer"],
  ["renderbuffers", "createRenderbuffer", "deleteRenderbuffer", "renderbuffer"],
  ["programs", "createProgram", "deleteProgram", "program"],
  ["shaders", "createShader", "deleteShader", "shader"],
  ["vertexArrays", "createVertexArray", "deleteVertexArray", "vertexArray"],
  ["queries", "createQuery", "deleteQuery", "query"],
  ["samplers", "createSampler", "deleteSampler", "sampler"],
  [
    "transformFeedbacks",
    "createTransformFeedback",
    "deleteTransformFeedback",
    "transformFeedback",
  ],
];

let seq = 0;

/**
 * Stack of the caller, minus the Error line and this module's frames. In the
 * bundled page the frames name the chunk, not this module; expectNoLeaks then
 * drops this module's frames once it has mapped them (bundle-frames.ts), so
 * enough frames are kept for that.
 */
function creationStack(): string {
  const lines = (new Error().stack || "").split("\n").slice(1);
  return lines
    .filter((line) => !line.includes("leaks-page"))
    .slice(0, 16)
    .map((line) => line.trim())
    .join("\n");
}

function entry(label: string): LeakEntry {
  return { seq: ++seq, label, stack: creationStack() };
}

/** Per instrumented context: its id, live state and live objects per kind. */
interface ContextRecord {
  id: number;
  live: boolean;
  entry: LeakEntry;
  objects: Map<ResourceKind, Map<object, LeakEntry>>;
}

const instrumented = new WeakSet<object>();
const contexts: ContextRecord[] = [];

function releaseContext(record: ContextRecord) {
  record.live = false;
}

function instrumentLoseContext(ext: any, record: ContextRecord) {
  if (!ext || instrumented.has(ext)) return;
  instrumented.add(ext);
  const lose = ext.loseContext;
  if (typeof lose !== "function") return;
  ext.loseContext = function (...args: unknown[]) {
    releaseContext(record);
    return lose.apply(ext, args);
  };
}

function instrumentContext(gl: GLContext, kind: string) {
  if (instrumented.has(gl)) return;
  instrumented.add(gl);

  const record: ContextRecord = {
    id: contexts.length + 1,
    live: true,
    entry: entry(`${kind} context #${contexts.length + 1}`),
    objects: new Map(),
  };
  contexts.push(record);

  const target = gl as any;

  for (const [resource, create, del, label] of GL_PAIRS) {
    const origCreate = target[create];
    const origDelete = target[del];
    if (typeof origCreate !== "function" || typeof origDelete !== "function") {
      continue;
    }
    const live = new Map<object, LeakEntry>();
    record.objects.set(resource, live);

    target[create] = function (...args: unknown[]) {
      const obj = origCreate.apply(gl, args);
      if (obj) live.set(obj, entry(`${label} (context #${record.id})`));
      return obj;
    };
    target[del] = function (obj: unknown, ...rest: unknown[]) {
      // A null or already deleted object is simply not in the set.
      if (obj) live.delete(obj as object);
      return origDelete.call(gl, obj, ...rest);
    };
  }

  const origGetExtension = target.getExtension;
  target.getExtension = function (...args: unknown[]) {
    const ext = origGetExtension.apply(gl, args);
    if (String(args[0]).toUpperCase() === "WEBGL_LOSE_CONTEXT") {
      instrumentLoseContext(ext, record);
    }
    return ext;
  };

  const canvas = gl.canvas as HTMLCanvasElement | OffscreenCanvas;
  canvas.addEventListener("webglcontextlost", () => releaseContext(record));
}

function wrapGetContext(proto: any) {
  if (!proto || typeof proto.getContext !== "function") return;
  const orig = proto.getContext;
  proto.getContext = function (this: unknown, ...args: unknown[]) {
    const ctx = orig.apply(this, args);
    const kind = String(args[0]);
    if (
      ctx &&
      (kind === "webgl2" || kind === "webgl" || kind === "experimental-webgl")
    ) {
      instrumentContext(ctx, kind);
    }
    return ctx;
  };
}

wrapGetContext(globalThis.HTMLCanvasElement?.prototype);
wrapGetContext((globalThis as any).OffscreenCanvas?.prototype);

// Window and document listeners, keyed by target, type, listener and capture.
const listeners = new Map<string, Map<unknown, LeakEntry>>();

function captureOf(options: unknown) {
  return typeof options === "boolean"
    ? options
    : Boolean((options as AddEventListenerOptions | undefined)?.capture);
}

function wrapListeners(target: Window | Document, name: string) {
  const add: Function = target.addEventListener;
  const remove: Function = target.removeEventListener;

  const forget = (type: string, listener: unknown, capture: boolean) => {
    const key = `${name}:${type}:${capture}`;
    const map = listeners.get(key);
    map?.delete(listener);
    if (map && map.size === 0) listeners.delete(key);
  };

  target.addEventListener = function (
    this: unknown,
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions
  ) {
    add.call(target, type, listener, options);
    if (!listener) return;
    const capture = captureOf(options);
    const key = `${name}:${type}:${capture}`;
    let map = listeners.get(key);
    if (!map) listeners.set(key, (map = new Map()));
    if (map.has(listener)) return; // the DOM ignores duplicates too
    map.set(listener, entry(`${name}:${type}`));

    const opts = typeof options === "object" ? options : void 0;
    if (opts?.once) {
      add.call(target, type, () => forget(type, listener, capture), {
        once: true,
        capture,
      });
    }
    opts?.signal?.addEventListener("abort", () =>
      forget(type, listener, capture)
    );
  } as typeof target.addEventListener;

  target.removeEventListener = function (
    this: unknown,
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions
  ) {
    remove.call(target, type, listener, options);
    if (listener) forget(type, listener, captureOf(options));
  } as typeof target.removeEventListener;
}

wrapListeners(window, "window");
wrapListeners(document, "document");

/** Canvases the harness itself owns carry this attribute and are not counted. */
export const HOST_CANVAS_ATTRIBUTE = "data-deltav-host";

function liveEntries(): LeakDetails {
  const details: LeakDetails = {};
  const push = (kind: ResourceKind, e: LeakEntry) => {
    (details[kind] ||= []).push(e);
  };

  for (const record of contexts) {
    if (record.live) push("contexts", record.entry);
    record.objects.forEach((live, kind) => live.forEach((e) => push(kind, e)));
  }
  listeners.forEach((map) => map.forEach((e) => push("listeners", e)));

  return details;
}

const api: DeltavLeaksAPI = {
  snapshot(): ResourceSnapshot {
    const counts = {} as ResourceSnapshot;
    for (const kind of RESOURCE_KINDS) counts[kind] = 0;

    const details = liveEntries();
    for (const kind of RESOURCE_KINDS) {
      counts[kind] = details[kind]?.length || 0;
    }

    counts.canvases = document.querySelectorAll(
      `canvas:not([${HOST_CANVAS_ATTRIBUTE}])`
    ).length;

    const frame = frameCommandStats();
    counts.frameAnimationLoops = frame.animationLoops;
    counts.frameNextFrame = frame.nextFrame;
    counts.frameQueued = frame.queued;
    counts.seq = seq;

    return counts;
  },

  details(since = 0): LeakDetails {
    const all = liveEntries();
    const result: LeakDetails = {};
    for (const kind of Object.keys(all) as ResourceKind[]) {
      result[kind] = all[kind]!.filter((e) => e.seq > since);
    }
    return result;
  },
};

// React adds one `selectionchange` listener to the document the first time a
// root is created and never removes it. Create and drop a throwaway root now,
// so that one-time setup is part of every baseline and not a fixture's leak.
createRoot(document.createElement("div")).unmount();

window.__deltavLeaks = api;
