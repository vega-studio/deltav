export function getProgramInfo(gl: WebGLRenderingContext, program: any) {
  const result = {
      attributeCount: 0,
      attributes: new Array(),
      uniformCount: 0,
      uniforms: new Array()
    },
    activeUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS),
    activeAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

  // Taken from the WebGl spec:
  // Http://www.khronos.org/registry/webgl/specs/latest/1.0/#5.14
  const enums: { [key: number]: string } = {
    0x8b50: "FLOAT_VEC2",
    0x8b51: "FLOAT_VEC3",
    0x8b52: "FLOAT_VEC4",
    0x8b53: "INT_VEC2",
    0x8b54: "INT_VEC3",
    0x8b55: "INT_VEC4",
    0x8b56: "BOOL",
    0x8b57: "BOOL_VEC2",
    0x8b58: "BOOL_VEC3",
    0x8b59: "BOOL_VEC4",
    0x8b5a: "FLOAT_MAT2",
    0x8b5b: "FLOAT_MAT3",
    0x8b5c: "FLOAT_MAT4",
    0x8b5e: "SAMPLER_2D",
    0x8b60: "SAMPLER_CUBE",
    0x1400: "BYTE",
    0x1401: "UNSIGNED_BYTE",
    0x1402: "SHORT",
    0x1403: "UNSIGNED_SHORT",
    0x1404: "INT",
    0x1405: "UNSIGNED_INT",
    0x1406: "FLOAT"
  };

  const blocks: { [key: number]: number } = {
    0x8b50: 1,
    0x8b51: 1,
    0x8b52: 1,
    0x8b53: 1,
    0x8b54: 1,
    0x8b55: 1,
    0x8b56: 1,
    0x8b57: 1,
    0x8b58: 1,
    0x8b59: 1,
    0x8b5a: 1,
    0x8b5b: 3,
    0x8b5c: 4,
    0x8b5e: 1,
    0x8b60: 1,
    0x1400: 1,
    0x1401: 1,
    0x1402: 1,
    0x1403: 1,
    0x1404: 1,
    0x1405: 1,
    0x1406: 1
  };

  // Loop through active uniforms
  for (let i = 0; i < activeUniforms; ++i) {
    const uniform: any = gl.getActiveUniform(program, i);
    uniform.typeName = enums[uniform.type];
    result.uniforms.push(uniform);
    result.uniformCount += uniform.size;
    uniform.size = uniform.size * blocks[uniform.type];
  }

  // Loop through active attributes
  for (let i = 0; i < activeAttributes; i++) {
    const attribute: any = gl.getActiveAttrib(program, i);
    attribute.typeName = enums[attribute.type];
    result.attributes.push(attribute);
    result.attributeCount += attribute.size;
  }

  return result;
}

export class WebGLStat {
  static VAO = false;
  static MAX_VERTEX_UNIFORMS = 0;
  static MAX_FRAGMENT_UNIFORMS = 0;
  static MAX_VERTEX_ATTRIBUTES = 0;
  static WEBGL_SUPPORTED: boolean = false;
  static MAX_TEXTURE_SIZE = 0;
  static HARDWARE_INSTANCING = false;
  static MRT_EXTENSION = false;
  static MRT = false;
  static MAX_COLOR_ATTACHMENTS = 0;
  static SHADERS_3_0 = false;
  static WEBGL_VERSION = "none";
  static FLOAT_TEXTURE_READ = {
    half: false,
    full: false,
    halfLinearFilter: false,
    fullLinearFilter: false
  };
  static FLOAT_TEXTURE_WRITE = {
    half: false,
    full: false
  };

  static print() {
    return Object.assign({}, WebGLStat);
  }
}

function initStats() {
  // Let's perform some immediate operations to do some gl querying for useful information
  function getAContext():
    | WebGLRenderingContext
    | WebGL2RenderingContext
    | null {
    try {
      const canvas = document.createElement("canvas");
      let out: any;
      out = canvas.getContext("webgl2");

      if (out) {
        WebGLStat.WEBGL_VERSION = "webgl2";
        return out;
      }

      out = canvas.getContext("webgl");

      if (out) {
        WebGLStat.WEBGL_VERSION = "webgl";
        return out;
      }

      out = canvas.getContext("experimental-webgl");

      if (out) {
        WebGLStat.WEBGL_VERSION = "experimental-webgl";
        return out;
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * There are several checks to perform to check for float texture support.
   * There may be read support but not write support and there are full and half
   * floats available.
   */
  function floatTextureSupport(
    gl: WebGLRenderingContext | WebGL2RenderingContext
  ) {
    // Check for linear filtering on reads
    WebGLStat.FLOAT_TEXTURE_READ.fullLinearFilter = Boolean(
      gl.getExtension("OES_texture_float_linear")
    );
    WebGLStat.FLOAT_TEXTURE_READ.halfLinearFilter = Boolean(
      gl.getExtension("OES_texture_half_float_linear")
    );
    // Generate a texture. Filtering for WebGL1 is basically disallowed, so we
    // set the filters to nearest to disable it and prevent gl errors.
    const textureFull = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureFull);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    if (gl.getError() !== gl.NO_ERROR) {
      throw new Error("WebGLStat could not create a texture");
    }

    // Having the extension enabled guarantees creating and reading float
    // textures
    const extensionEnabled =
      gl.getExtension("OES_texture_float") ||
      gl.getExtension("EXT_color_buffer_float");

    if (extensionEnabled) {
      const width = 2;
      const height = 2;

      // If we get an error for allocating float texture style data then no gen
      // or read from float textures
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl instanceof WebGL2RenderingContext ? gl.RGBA32F : gl.RGBA,
        width,
        height,
        0,
        gl.RGBA,
        gl.FLOAT,
        null
      );

      if (gl.getError() === gl.NO_ERROR) {
        WebGLStat.FLOAT_TEXTURE_READ.full = true;
      }

      // Use this texture as a render target.
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        textureFull,
        0
      );
      gl.bindTexture(gl.TEXTURE_2D, null);
      // Frame buffer complete signal means writing to the float texture is more
      // than likely supported
      if (
        gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE
      ) {
        WebGLStat.FLOAT_TEXTURE_WRITE.full = true;
      }

      // Clean up
      gl.deleteFramebuffer(fbo);
      gl.deleteTexture(textureFull);
    }

    // Repeat all the steps for a half float texture
    const textureHalf = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureHalf);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    if (gl.getError() !== gl.NO_ERROR) {
      throw new Error("WebGLStat could not create a texture");
    }

    // Having the extension enabled guarantees creating and reading float
    // textures
    const halfExtension =
      gl.getExtension("OES_texture_half_float") ||
      gl.getExtension("EXT_color_buffer_float");

    if (halfExtension) {
      const width = 2;
      const height = 2;

      // If we get an error for allocating float texture style data then no gen
      // or read from float textures
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl instanceof WebGL2RenderingContext ? gl.RGBA16F : gl.RGBA,
        width,
        height,
        0,
        gl.RGBA,
        gl instanceof WebGL2RenderingContext
          ? gl.HALF_FLOAT
          : halfExtension.HALF_FLOAT_OES,
        null
      );

      if (gl.getError() === gl.NO_ERROR) {
        WebGLStat.FLOAT_TEXTURE_READ.full = true;
      }

      // Use this texture as a render target.
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        textureHalf,
        0
      );
      gl.bindTexture(gl.TEXTURE_2D, null);
      // Frame buffer complete signal means writing to the float texture is more
      // than likely supported
      if (
        gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE
      ) {
        WebGLStat.FLOAT_TEXTURE_WRITE.full = true;
      }

      // Clean up
      gl.deleteFramebuffer(fbo);
      gl.deleteTexture(textureHalf);
    }
  }

  // Attempt to retrieve a context for webgl
  const gl = getAContext();

  // If the context exists, then we know gl is supported and we can fill in some metrics
  if (gl) {
    // Perform universal checks
    WebGLStat.WEBGL_SUPPORTED = true;
    WebGLStat.MAX_VERTEX_UNIFORMS = gl.getParameter(
      gl.MAX_VERTEX_UNIFORM_VECTORS
    );
    WebGLStat.MAX_FRAGMENT_UNIFORMS = gl.getParameter(
      gl.MAX_FRAGMENT_UNIFORM_VECTORS
    );
    WebGLStat.MAX_VERTEX_ATTRIBUTES = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    WebGLStat.MAX_TEXTURE_SIZE = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    // Run texture float support checks
    floatTextureSupport(gl);

    // Make WebGL 2 assumptions and checks
    if (gl instanceof WebGL2RenderingContext) {
      WebGLStat.VAO = true;
      WebGLStat.MRT = true;
      WebGLStat.HARDWARE_INSTANCING = true;
      WebGLStat.SHADERS_3_0 = true;
      WebGLStat.HARDWARE_INSTANCING = true;

      WebGLStat.MAX_COLOR_ATTACHMENTS = gl.getParameter(
        gl.MAX_COLOR_ATTACHMENTS
      );
    }

    // Do WebGL1 specific checks
    else {
      WebGLStat.VAO = Boolean(gl.getExtension("OES_vertex_array_object"));
      WebGLStat.HARDWARE_INSTANCING = Boolean(
        gl.getExtension("ANGLE_instanced_arrays")
      );
      const MRT_EXT = gl.getExtension("WEBGL_draw_buffers");
      WebGLStat.MRT_EXTENSION = Boolean(MRT_EXT);
      WebGLStat.MRT = Boolean(MRT_EXT);

      if (MRT_EXT) {
        WebGLStat.MAX_COLOR_ATTACHMENTS = gl.getParameter(
          MRT_EXT.MAX_COLOR_ATTACHMENTS_WEBGL
        );
      }
    }
  }

  // Make this globally available because it's super useful
  (window as any).WebGLStat = WebGLStat;
}

initStats();
