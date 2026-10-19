import { describe, it } from "@jest/globals";
import assert from "assert";

import { Attribute } from "../../ui/src/gl/attribute.js";

describe("Attribute.repeatInstances", () => {
  it("should repeat a single instance correctly", () => {
    // 2 vertices per instance, 3 floats per vertex (like a vec3 position)
    const size = 3;
    const instanceVertexCount = 2;
    // Template: two vertices (vec3), so 6 floats
    const data = new Float32Array([
      1,
      2,
      3, // vertex 1
      4,
      5,
      6, // vertex 2
      0,
      0,
      0, // space for instance 2, vertex 1
      0,
      0,
      0, // space for instance 2, vertex 2
    ]);
    const attr = new Attribute(data, size);
    attr.repeatInstances(1, instanceVertexCount, 1);
    // After repeat, the second instance should be a copy of the first
    assert.deepStrictEqual(
      Array.from(attr.data),
      [1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6]
    );
  });

  it("should repeat multiple instances correctly (doubling)", () => {
    // 1 vertex per instance, 2 floats per vertex
    const size = 2;
    const instanceVertexCount = 1;
    const instanceCount = 3;
    // Template: one vertex (vec2), so 2 floats
    const data = new Float32Array([
      7,
      8, // instance 0
      0,
      0, // instance 1
      0,
      0, // instance 2
      0,
      0, // instance 3
    ]);
    const attr = new Attribute(data, size);
    attr.repeatInstances(instanceCount, instanceVertexCount, 1);
    // All instances should be a copy of the first
    assert.deepStrictEqual(Array.from(attr.data), [7, 8, 7, 8, 7, 8, 7, 8]);
  });

  it("should not overwrite the template instance (startInstance = 0 should throw)", () => {
    const attr = new Attribute(new Float32Array([1, 2, 3, 0, 0, 0]), 3);
    assert.throws(() => {
      attr.repeatInstances(1, 1, 0);
    }, /startInstance of less than 1/);
  });

  it("should not copy if buffer is too small for the repeat", () => {
    // Only space for 1 instance
    const attr = new Attribute(new Float32Array([1, 2, 3]), 3);
    // Should not throw, but should not change data
    attr.repeatInstances(1, 1, 1);
    assert.deepStrictEqual(Array.from(attr.data), [1, 2, 3]);
  });

  it("should handle partial buffer fill (not enough space for all repeats)", () => {
    // 2 vertices per instance, 2 floats per vertex
    const size = 2;
    const instanceVertexCount = 2;
    // Only space for 2 instances
    const data = new Float32Array([
      1,
      2,
      3,
      4, // instance 0
      0,
      0,
      0,
      0, // instance 1
    ]);
    const attr = new Attribute(data, size);
    // Try to repeat 2 instances, but only space for 1
    attr.repeatInstances(2, instanceVertexCount, 1);
    // Only the first repeat should be copied
    assert.deepStrictEqual(Array.from(attr.data), [1, 2, 3, 4, 1, 2, 3, 4]);
  });

  it("should do nothing if toCopy is zero (no repeats requested)", () => {
    const attr = new Attribute(new Float32Array([1, 2, 3, 0, 0, 0]), 3);
    attr.repeatInstances(0, 1, 1);
    assert.deepStrictEqual(Array.from(attr.data), [1, 2, 3, 0, 0, 0]);
  });
});
