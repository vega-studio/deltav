import { describe, it } from "@jest/globals";
import assert from "assert";

import { getAbsolutePositionBounds } from "../ui/src/math/primitives/absolute-position.js";
import { Bounds } from "../ui/src/math/primitives/bounds.js";

describe("Absolute Position", () => {
  it("Should occupy the whole screen by setting size in percent", () => {
    const t = {
      left: 0,
      top: 0,
      height: "100%",
      width: "100%",
    };

    const b = getAbsolutePositionBounds(
      t,
      new Bounds({ x: 0, y: 0, width: 1024, height: 512 }),
      1
    );

    assert(b.width === 1024 && b.height === 512 && b.x === 0 && b.y === 0);
  });

  it("Should occupy the whole screen by setting size", () => {
    const t = {
      left: 0,
      top: 0,
      height: "512",
      width: "1024",
    };

    const b = getAbsolutePositionBounds(
      t,
      new Bounds({ x: 0, y: 0, width: 1024, height: 512 }),
      1
    );

    assert(b.width === 1024 && b.height === 512 && b.x === 0 && b.y === 0);
  });

  it("Should occupy the whole screen by setting bounds", () => {
    const t = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    };

    const b = getAbsolutePositionBounds(
      t,
      new Bounds({ x: 0, y: 0, width: 1024, height: 512 }),
      1
    );

    assert(b.width === 1024 && b.height === 512 && b.x === 0 && b.y === 0);
  });

  it("Should occupy the whole screen by setting bounds", () => {
    const t = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    };

    const b = getAbsolutePositionBounds(
      t,
      new Bounds({ x: 0, y: 0, width: 1024, height: 512 }),
      1
    );

    assert(b.width === 1024 && b.height === 512 && b.x === 0 && b.y === 0);
  });

  it("Should partial occupy screen by bounds", () => {
    const t = {
      left: 0,
      top: 0,
      right: 100,
      bottom: 0,
    };

    const b = getAbsolutePositionBounds(
      t,
      new Bounds({ x: 0, y: 0, width: 1024, height: 512 }),
      1
    );

    assert(
      b.width === 1024 - 100 && b.height === 512 && b.x === 0 && b.y === 0
    );
  });

  it("Should partial occupy screen by bounds", () => {
    const t = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 100,
    };

    const b = getAbsolutePositionBounds(
      t,
      new Bounds({ x: 0, y: 0, width: 1024, height: 512 }),
      1
    );

    assert(
      b.width === 1024 && b.height === 512 - 100 && b.x === 0 && b.y === 0
    );
  });

  it("Should partial occupy screen by bounds", () => {
    const t = {
      left: 100,
      top: 0,
      right: 0,
      bottom: 0,
    };

    const b = getAbsolutePositionBounds(
      t,
      new Bounds({ x: 0, y: 0, width: 1024, height: 512 }),
      1
    );

    assert(
      b.width === 1024 - 100 && b.height === 512 && b.x === 100 && b.y === 0
    );
  });

  it("Should partial occupy screen by bounds", () => {
    const t = {
      left: 0,
      top: 100,
      right: 0,
      bottom: 0,
    };

    const b = getAbsolutePositionBounds(
      t,
      new Bounds({ x: 0, y: 0, width: 1024, height: 512 }),
      1
    );

    assert(
      b.width === 1024 && b.height === 512 - 100 && b.x === 0 && b.y === 100
    );
  });

  it("Should partial occupy screen by bounds", () => {
    const t = {
      left: 100,
      top: 0,
      right: 100,
      bottom: 0,
    };

    const b = getAbsolutePositionBounds(
      t,
      new Bounds({ x: 0, y: 0, width: 1024, height: 512 }),
      1
    );

    assert(
      b.width === 1024 - 200 && b.height === 512 && b.x === 100 && b.y === 0
    );
  });

  it("Should partial occupy screen by bounds", () => {
    const t = {
      left: 0,
      top: 100,
      right: 0,
      bottom: 100,
    };

    const b = getAbsolutePositionBounds(
      t,
      new Bounds({ x: 0, y: 0, width: 1024, height: 512 }),
      1
    );

    assert(
      b.width === 1024 && b.height === 512 - 200 && b.x === 0 && b.y === 100
    );
  });

  it("Should partial occupy screen by bounds", () => {
    const t = {
      left: 100,
      top: 100,
      right: 100,
      bottom: 100,
    };

    const b = getAbsolutePositionBounds(
      t,
      new Bounds({ x: 0, y: 0, width: 1024, height: 512 }),
      1
    );

    assert(
      b.width === 1024 - 200 &&
        b.height === 512 - 200 &&
        b.x === 100 &&
        b.y === 100
    );
  });

  it("Should partial occupy screen by bounds", () => {
    const t = {
      left: 100,
      top: 100,
      width: "100%",
      height: "100%",
    };

    const b = getAbsolutePositionBounds(
      t,
      new Bounds({ x: 0, y: 0, width: 1024, height: 512 }),
      1
    );

    assert(b.width === 1024 && b.height === 512 && b.x === 100 && b.y === 100);
  });

  it("Should prioritize width", () => {
    const t = {
      left: 0,
      top: 0,
      width: "100%",
      height: "100%",
      right: 10,
    };

    const b = getAbsolutePositionBounds(
      t,
      new Bounds({ x: 0, y: 0, width: 1024, height: 512 }),
      1
    );

    assert(b.width === 1024 && b.height === 512 && b.x === 0 && b.y === 0);
  });

  it("Should prioritize height", () => {
    const t = {
      left: 0,
      top: 0,
      width: "100%",
      height: "100%",
      right: 10,
      bottom: 100,
    };

    const b = getAbsolutePositionBounds(
      t,
      new Bounds({ x: 0, y: 0, width: 1024, height: 512 }),
      1
    );

    assert(b.width === 1024 && b.height === 512 && b.x === 0 && b.y === 0);
  });

  it("Should prioritize height", () => {
    const t = {
      left: 0,
      top: 0,
      width: "100%",
      height: "100%",
      right: 10,
      bottom: 100,
    };

    const b = getAbsolutePositionBounds(
      t,
      new Bounds({ x: 0, y: 0, width: 1024, height: 512 }),
      1
    );

    assert(b.width === 1024 && b.height === 512 && b.x === 0 && b.y === 0);
  });

  it("Should cover quarter top left", () => {
    const t = {
      left: 0,
      top: 0,
      width: "50%",
      height: "50%",
    };

    const b = getAbsolutePositionBounds(
      t,
      new Bounds({ x: 0, y: 0, width: 1024, height: 512 }),
      1
    );
    assert(b.width === 512 && b.height === 256 && b.x === 0 && b.y === 0);
  });

  it("Should cover quarter bottom right", () => {
    const t = {
      left: "50%",
      top: "50%",
      width: "50%",
      height: "50%",
    };

    const b = getAbsolutePositionBounds(
      t,
      new Bounds({ x: 0, y: 0, width: 1024, height: 512 }),
      1
    );

    assert(b.width === 512 && b.height === 256 && b.x === 512 && b.y === 256);
  });
});
