/**
 * This file simply registers all of our shader modules used in testing the import system for
 * shaders.
 */

import { ShaderInjectionTarget } from "../../../src";
import {
  ShaderModule,
  ShaderModuleUnit
} from "../../../src/voidgl/shaders/processing";

// Bulk register our test modules
const out = ShaderModule.register([
  {
    content: require("./alternate-template-options.vs"),
    moduleId: "alternate-template-options",
    compatibility: ShaderInjectionTarget.VERTEX
  },
  {
    content: require("./circular-0.vs"),
    moduleId: "circular-0",
    compatibility: ShaderInjectionTarget.VERTEX
  },
  {
    content: require("./circular-1.vs"),
    moduleId: "circular-1",
    compatibility: ShaderInjectionTarget.VERTEX
  },
  {
    content: require("./circular-2.vs"),
    moduleId: "circular-2",
    compatibility: ShaderInjectionTarget.VERTEX
  },
  {
    content: require("./duplicate-import-0.vs"),
    moduleId: "duplicate-import-0",
    compatibility: ShaderInjectionTarget.VERTEX
  },
  {
    content: require("./duplicate-import-1.vs"),
    moduleId: "duplicate-import-1",
    compatibility: ShaderInjectionTarget.VERTEX
  },
  {
    content: require("./duplicate-import-2.vs"),
    moduleId: "duplicate-import-2",
    compatibility: ShaderInjectionTarget.VERTEX
  },
  {
    content: require("./fragment-1.vs"),
    moduleId: "fragment-1",
    compatibility: ShaderInjectionTarget.VERTEX
  },
  {
    content: require("./fragment-1.fs"),
    moduleId: "fragment-1",
    compatibility: ShaderInjectionTarget.FRAGMENT
  },
  {
    content: require("./fragment-2.vs"),
    moduleId: "fragment-2",
    compatibility: ShaderInjectionTarget.VERTEX
  },
  {
    content: require("./fragment-2.fs"),
    moduleId: "fragment-2",
    compatibility: ShaderInjectionTarget.FRAGMENT
  },
  {
    content: require("./no-fragment-0.fs"),
    moduleId: "no-fragment-0",
    compatibility: ShaderInjectionTarget.FRAGMENT
  },
  {
    content: require("./no-fragment-1.vs"),
    moduleId: "no-fragment-0",
    compatibility: ShaderInjectionTarget.VERTEX
  },
  {
    content: require("./override-module-0.vs"),
    moduleId: "override-module",
    compatibility: ShaderInjectionTarget.VERTEX
  },
  {
    content: require("./override-module-1.vs"),
    moduleId: "override-module",
    compatibility: ShaderInjectionTarget.VERTEX
  }
]);

if (out) {
  console.warn(
    "Shader Module Test Failure:",
    "An error was produced while registering a group of modules ->",
    out
  );
}

// This is a test specific to registration

ShaderModule.register(
  new ShaderModuleUnit({
    content: require("./is-final-0.vs"),
    moduleId: "is-final-0",
    compatibility: ShaderInjectionTarget.VERTEX,
    isFinal: true
  })
);

const check = ShaderModule.register(
  new ShaderModuleUnit({
    content: require("./is-final-1.vs"),
    moduleId: "is-final-0",
    compatibility: ShaderInjectionTarget.VERTEX,
    isFinal: true
  })
);

if (!check) {
  console.warn(
    "Shader Module Test Failure:",
    "Registering an overriding module to a Module marked as final did not produce an error output",
    "Trying to override a module after one has been registered with isFinal: true MUST produce an error"
  );
}
