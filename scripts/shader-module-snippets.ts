/** HACKY HACK HACKS */
/**
 * Nothing in this header is a good idea! This is all a hot mess to make it easy
 * to run the ShaderModule.register methods in Node so we could analyze the
 * input and identify modules generated.
 *
 * The following gets all the browser junk to NOT cause node to crash. We also
 * have to override the default require behavior to circumvent some oddities
 * that webpack was handling for us (like requiring shaders as text).
 */
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(p: any) {
  if (p.indexOf('.fs') > -1) return "";
  if (p.indexOf('.vs') > -1) return "";
  return originalRequire.apply(this, arguments);
};

(global as any).requestAnimationFrame = () => 0;
(global as any).window = {};
(global as any).WebGL2RenderingContext = class N {};
(global as any).Image = class I {};
(global as any).document = {
  createElement() {
    return {
      getContext() {
        return {
          activeTexture() { /** NOOP */ },
          attachShader() { /** NOOP */ },
          bindAttribLocation() { /** NOOP */ },
          bindBuffer() { /** NOOP */ },
          bindFramebuffer() { /** NOOP */ },
          bindRenderbuffer() { /** NOOP */ },
          bindTexture() { /** NOOP */ },
          blendColor() { /** NOOP */ },
          blendEquation() { /** NOOP */ },
          blendEquationSeparate() { /** NOOP */ },
          blendFunc() { /** NOOP */ },
          blendFuncSeparate() { /** NOOP */ },
          bufferData() { /** NOOP */ },
          bufferSubData() { /** NOOP */ },
          checkFramebufferStatus() { /** NOOP */ },
          clear() { /** NOOP */ },
          clearColor() { /** NOOP */ },
          clearDepth() { /** NOOP */ },
          clearStencil() { /** NOOP */ },
          colorMask() { /** NOOP */ },
          commit() { /** NOOP */ },
          compileShader() { /** NOOP */ },
          compressedTexImage2D() { /** NOOP */ },
          compressedTexImage3D() { /** NOOP */ },
          compressedTexSubImage2D() { /** NOOP */ },
          copyTexImage2D() { /** NOOP */ },
          copyTexSubImage2D() { /** NOOP */ },
          createBuffer() { /** NOOP */ },
          createFramebuffer() { /** NOOP */ },
          createProgram() { /** NOOP */ },
          createRenderbuffer() { /** NOOP */ },
          createShader() { /** NOOP */ },
          createTexture() { /** NOOP */ },
          cullFace() { /** NOOP */ },
          deleteBuffer() { /** NOOP */ },
          deleteFramebuffer() { /** NOOP */ },
          deleteProgram() { /** NOOP */ },
          deleteRenderbuffer() { /** NOOP */ },
          deleteShader() { /** NOOP */ },
          deleteTexture() { /** NOOP */ },
          depthFunc() { /** NOOP */ },
          depthMask() { /** NOOP */ },
          depthRange() { /** NOOP */ },
          detachShader() { /** NOOP */ },
          disable() { /** NOOP */ },
          disableVertexAttribArray() { /** NOOP */ },
          drawArrays() { /** NOOP */ },
          drawElements() { /** NOOP */ },
          enable() { /** NOOP */ },
          enableVertexAttribArray() { /** NOOP */ },
          finish() { /** NOOP */ },
          flush() { /** NOOP */ },
          framebufferRenderbuffer() { /** NOOP */ },
          framebufferTexture2D() { /** NOOP */ },
          frontFace() { /** NOOP */ },
          generateMipmap() { /** NOOP */ },
          getActiveAttrib() { /** NOOP */ },
          getActiveUniform() { /** NOOP */ },
          getAttachedShaders() { /** NOOP */ },
          getAttribLocation() { /** NOOP */ },
          getBufferParameter() { /** NOOP */ },
          getContextAttributes() { /** NOOP */ },
          getError() { /** NOOP */ },
          getExtension() { /** NOOP */ },
          getFramebufferAttachmentParameter() { /** NOOP */ },
          getParameter() { /** NOOP */ },
          getProgramInfoLog() { /** NOOP */ },
          getProgramParameter() { /** NOOP */ },
          getRenderbufferParameter() { /** NOOP */ },
          getShaderInfoLog() { /** NOOP */ },
          getShaderParameter() { /** NOOP */ },
          getShaderPrecisionFormat() { /** NOOP */ },
          getShaderSource() { /** NOOP */ },
          getSupportedExtensions() { /** NOOP */ },
          getTexParameter() { /** NOOP */ },
          getUniform() { /** NOOP */ },
          getUniformLocation() { /** NOOP */ },
          getVertexAttrib() { /** NOOP */ },
          getVertexAttribOffset() { /** NOOP */ },
          hint() { /** NOOP */ },
          isBuffer() { /** NOOP */ },
          isContextLost() { /** NOOP */ },
          isEnabled() { /** NOOP */ },
          isFramebuffer() { /** NOOP */ },
          isProgram() { /** NOOP */ },
          isRenderbuffer() { /** NOOP */ },
          isShader() { /** NOOP */ },
          isTexture() { /** NOOP */ },
          lineWidth() { /** NOOP */ },
          linkProgram() { /** NOOP */ },
          pixelStorei() { /** NOOP */ },
          polygonOffset() { /** NOOP */ },
          readPixels() { /** NOOP */ },
          renderbufferStorage() { /** NOOP */ },
          sampleCoverage() { /** NOOP */ },
          scissor() { /** NOOP */ },
          shaderSource() { /** NOOP */ },
          stencilFunc() { /** NOOP */ },
          stencilFuncSeparate() { /** NOOP */ },
          stencilMask() { /** NOOP */ },
          stencilMaskSeparate() { /** NOOP */ },
          stencilOp() { /** NOOP */ },
          stencilOpSeparate() { /** NOOP */ },
          texImage2D() { /** NOOP */ },
          texParameterf() { /** NOOP */ },
          texParameteri() { /** NOOP */ },
          texSubImage2D() { /** NOOP */ },
          uniformf() { /** NOOP */ },
          uniformi() { /** NOOP */ },
          uniformfv() { /** NOOP */ },
          uniformiv() { /** NOOP */ },
          uniform2fv() { /** NOOP */ },
          uniform2iv() { /** NOOP */ },
          uniform3fv() { /** NOOP */ },
          uniform3iv() { /** NOOP */ },
          uniform4fv() { /** NOOP */ },
          uniform4iv() { /** NOOP */ },
          uniformMatrix2fv() { /** NOOP */ },
          uniformMatrix3fv() { /** NOOP */ },
          uniformMatrix4fv() { /** NOOP */ },
          useProgram() { /** NOOP */ },
          validateProgram() { /** NOOP */ },
          vertexAttribPointer() { /** NOOP */ },
          viewport() { /** NOOP */ },
        };
      }
    };
  }
};

import fs from "fs-extra";
import glob from "glob";
import path from "path";
import { ShaderModule } from "../src/shaders/processing/shader-module";
import { ShaderInjectionTarget } from "../src/types";

const vsModuleIds: any[] = [];
const fsModuleIds: any[] = [];

// Modify the ShaderModule register method to instead just read the modules
(ShaderModule as any).register = (modules: any) => {
  if (!Array.isArray(modules)) modules = [modules];

  modules.forEach((module: any) => {
    switch (module.compatibility) {
      case ShaderInjectionTarget.ALL:
      case ShaderInjectionTarget.VERTEX:
      case ShaderInjectionTarget.FRAGMENT:
        vsModuleIds.push(module);
        fsModuleIds.push(module);
        break;
    }
  });
};

glob(path.resolve(__dirname, "../src/**/*.shader.ts"), (err, matches) => {
  if (err) {
    console.warn(err);
    return;
  }

  // Require in each module discovered
  matches.forEach(module => {
    require(module);
  });

  // VS Code doesn't have any way to differentiate between language types, so
  // for now we have all the modules listed in a single snippet file
  const out = vsModuleIds.map(module => ({
    [module.moduleId]: {
      "prefix": `$\{import: ${module.moduleId}}`,
      "body": [`$\{import: ${module.moduleId}}`],
      "description": module.description
    }
  }));

  const snippets = {};
  out.forEach(i => Object.assign(snippets, i));

  if (__dirname.indexOf('node_modules') > -1) {
    fs.writeJsonSync(path.resolve(__dirname, "../../../.vscode/glsl.json"), snippets);
  }

  else {
    fs.writeJsonSync(path.resolve(__dirname, "../.vscode/glsl.code-snippets"), snippets);
  }
});
