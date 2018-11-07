import { ShaderInjectionTarget } from "../../src";
import {
  IShaderCompileResults,
  ShaderModule
} from "../../src/voidgl/shaders/processing/shader-module";
import "./test-modules";

let testTitle: string = "";

function test(title: string, run: Function) {
  testTitle = title;
  run();
}

function error(...args: any[]) {
  console.warn("Test:", testTitle);
  console.warn("Shader Module Test Failure:", ...args);
  console.warn("\n\n");
}

function expectNoErrors(out: IShaderCompileResults, id: string) {
  if (out.errors.length > 0) {
    error(
      `Failed to compile ${id} with no errors`,
      "Errors:",
      ...out.errors.reverse(),
      "Output:",
      out
    );

    return true;
  }

  return false;
}

function expectShader(out: IShaderCompileResults, id: string, result: string) {
  if (out.shader !== result) {
    error(
      "For",
      id,
      "Expected shader to be:",
      { shader: result },
      "But received output:",
      out
    );

    return true;
  }

  return false;
}

test("Test circular dependency detection", () => {
  const out = ShaderModule.process(
    testTitle,
    "${import: circular-0}",
    ShaderInjectionTarget.VERTEX
  );

  if (out.errors.length <= 0) {
    error(
      "Circular dependency test failed->",
      "Including circular-0 should have produced a circular dependency error",
      "Output:",
      out
    );
  }
});

test("Test general import for vertex elements", () => {
  const out = ShaderModule.process(
    testTitle,
    "${import : fragment-1}",
    ShaderInjectionTarget.VERTEX
  );

  expectNoErrors(out, "fragment-1 VS");
});

test("Test general import for fragment elements", () => {
  const out = ShaderModule.process(
    testTitle,
    "${import : fragment-1}",
    ShaderInjectionTarget.FRAGMENT
  );

  expectNoErrors(out, "fragment-1 FS");
});

test("Test import from a fragment where only a vertex with the requested id was registered", () => {
  const out = ShaderModule.process(
    testTitle,
    "${import : no-fragment-0}",
    ShaderInjectionTarget.FRAGMENT
  );

  if (out.errors.length <= 0) {
    error(
      "Failed to produce errors for compiling no-fragment-0.fs.",
      "The shader is a fragment requesting an import to a module id that ONLY has a vertex id and not a fragment, thus should error.",
      "Output:",
      out
    );
  }
});

test(`Test importing modules that requests the same module several times across multiple modules
  It should only import each requested module once.`, () => {
  const out = ShaderModule.process(
    testTitle,
    "${import: duplicate-import-0}",
    ShaderInjectionTarget.VERTEX
  );

  expectNoErrors(out, "duplicate-import-0");
  expectShader(
    out,
    "duplicate-import-0",
    "// Duplicate-import-2 VS\n\n// Duplicate-import-1 VS\n\n// Duplicate-import-0 VS\n\n"
  );
});

test("Test importing modules that have other template options in place that should remain untouched", () => {
  const out = ShaderModule.process(
    testTitle,
    "${import: alternate-template-options}",
    ShaderInjectionTarget.VERTEX
  );

  expectNoErrors(out, "alternate-template-options");
  expectShader(
    out,
    "alternate-template-options",
    "// Fragment-2 VS\n\n// Fragment-1 VS\n\n// Alternate-template-options VS\n${this should remain untouched}\n${option}\n${import}\n${importer}\n${import good things}\n${foo:test}\n\n"
  );
});
