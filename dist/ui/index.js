(function(){"use strict";try{if(typeof document<"u"){var e=document.createElement("style");e.appendChild(document.createTextNode(".SurfaceJSX{flex:1 1 auto;display:flex;flex-direction:column;width:100%;height:100%;overflow:hidden}")),document.head.appendChild(e)}}catch(t){console.error("vite-plugin-css-injected-by-js",t)}})();
import J, { useState as ca, useEffect as la } from "react";
window.WebGL2RenderingContext = window.WebGL2RenderingContext || function() {
};
class Rc {
  /** Allows an event manager to access it's governing surface */
  get surface() {
    return this.userInputManager.surface;
  }
  /**
   * This retrieves the projections for the view specified by the provided viewId.
   */
  getProjection(e) {
    const t = this.userInputManager.getView(e);
    return t ? t.projection : null;
  }
  /**
   * This retrieves the actual view for the view specified by the provided viewId.
   */
  getView(e) {
    return this.userInputManager && this.userInputManager.getView(e) || null;
  }
  /**
   * This retrieves the screen bounds for the view specified by the provided viewId.
   */
  getViewScreenBounds(e) {
    const t = this.userInputManager.getView(e);
    return t ? t.screenBounds : null;
  }
  /**
   * This is used internally which provides the parent MouseEventManager via the param mouseManager for this
   * EventManager.
   */
  setUserInputManager(e) {
    this.userInputManager = e;
  }
  /**
   * This is called by the surface so the manager can choose a moment in the
   * render cycle when to perform certain actions.
   */
  willRender() {
  }
  /**
   * This is called by the surface so the manager can choose a moment in the
   * render cycle when to perform certain actions.
   */
  didRender() {
  }
}
class po extends Rc {
  constructor(e) {
    super(), Object.assign(this, e);
  }
  handleMouseDown(e) {
  }
  handleMouseUp(e) {
  }
  handleMouseOver(e) {
  }
  handleMouseOut(e) {
  }
  handleMouseMove(e) {
  }
  handleClick(e) {
  }
  handleDrag(e) {
  }
  handleWheel(e) {
  }
  handleTouchCancelled(e) {
  }
  handleTouchDown(e) {
  }
  handleTouchUp(e) {
  }
  handleTouchOut(e) {
  }
  handleTouchDrag(e) {
  }
  handleTap(e) {
  }
  handleDoubleTap(e) {
  }
  handleLongTouch(e) {
  }
  handleLongTap(e) {
  }
  handlePinch(e) {
  }
  handleSpread(e) {
  }
  handleTouchRotate(e) {
  }
  handleSwipe(e) {
  }
}
var Vh = /* @__PURE__ */ ((i) => (i[i.NONE = -1] = "NONE", i[i.LEFT = 0] = "LEFT", i[i.AUX = 1] = "AUX", i[i.RIGHT = 2] = "RIGHT", i[i.FOURTH = 3] = "FOURTH", i[i.FIFTH = 4] = "FIFTH", i))(Vh || {});
class ii {
  /**
   * The data provided is the array that holds all of the information that
   * should be pushed to the GPU. The size defines how large the vertex
   * attribute is defined in the shader.
   */
  constructor(e, t, n = !1, s = !1) {
    this._isInstanced = !1, this._fullUpdate = !1, this.normalize = !1, this._needsUpdate = !1, this._updateRange = {
      /** Number of vertices to update */
      count: -1,
      /** Offset to the first vertex to begin updating */
      offset: -1
    }, this.data = e, this.size = t, this._isDynamic = n, this._isInstanced = s;
  }
  /**
   * The optimization state for frequently changing buffers. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
   */
  get isDynamic() {
    return this._isDynamic;
  }
  /**
   * Indicates the data in this attribute is structured per instance rather than
   * per vertex.
   */
  get isInstanced() {
    return this._isInstanced;
  }
  /**
   * Indicates a full update of the buffer will happen. This is managed
   * internally to determine when needed
   */
  get fullUpdate() {
    return this._fullUpdate;
  }
  /** This flags the attribute as needing to commit updates to it's buffer */
  get needsUpdate() {
    return this._needsUpdate;
  }
  /**
   * This is the number of "sized" elements in the buffer. Essentially the value
   * passed to the parameter of the "resize" method.
   */
  get count() {
    return this.data.length / this.size;
  }
  /**
   * Defines a range to update for the buffer object. Getting the range object
   * is a copy of the object. Setting the updateRange triggers an update.
   *
   * Although these properties represent vertex indicies it directly ties to all
   * implications of:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferSubData
   */
  get updateRange() {
    return this._updateRange;
  }
  set updateRange(e) {
    this._updateRange = e, this._needsUpdate = !0;
  }
  /**
   * Destroys this resource and frees resources it consumes on the GPU.
   */
  destroy() {
    this.data = new Float32Array(0), this.gl && this.gl.proxy.disposeAttribute(this);
  }
  /**
   * Triggers a rebuild of the gl context for this attribute without destroying
   * any of the buffer data.
   */
  rebuild() {
    this.gl && this.gl.proxy.disposeAttribute(this);
  }
  /**
   * Flags this attribute as completely resolved in it's needs for updates
   */
  resolve() {
    this._needsUpdate = !1, this._fullUpdate = !1;
  }
  /**
   * Resizes this attribute to a new number of elements. This will create a new
   * buffer and cause a full commit to the GPU.
   *
   * retainData specifies how much of the old buffer should be retained. 0
   * will completely destroy the buffer and replace it with the new one. Any
   * value above zero will retain that much "count" of the buffer. Excluding the
   * parameter causes a full copy of the buffer.
   */
  resize(e, t) {
    t === void 0 ? t = this.data.length : t = t * this.size;
    const n = new Float32Array(e * this.size);
    n.length >= t ? t === this.data.length ? n.set(this.data) : n.set(this.data.subarray(0, t)) : n.set(this.data.subarray(0, n.length)), this.destroy(), this.data = n, this._needsUpdate = !0, this._fullUpdate = !0;
  }
  /**
   * This repeats data in this buffer to simulate putting multiple instances of
   * the data in this same buffer. This uses the first instance of data (data
   * starting at index 0 : instanceVertexCount) as the template for what to copy
   * to the new instances.
   *
   * If this operation would exceed the length of the buffer, it will simply
   * copy as far as it can then quit. You should use the resize operation to
   * match the size of the buffer correctly to the expected size before calling
   * this operation.
   *
   * @param instanceCount Number of instances to repeat in the buffer
   * @param instanceVertexCount The number of vertices in each instance
   * @param startInstance The first instance index that should be copied in the
   *                      buffer. This must be a value >= 1 where 1 represents
   *                      the second instance in the buffer. We can not use 0 as
   *                      it would override the source template instance data.
   */
  repeatInstances(e, t, n = 1) {
    if (e === 0)
      return;
    if (n < 1)
      throw new Error(
        "Can not use repeatInstance on attribute with a startInstance of less than 1"
      );
    const s = t * this.size;
    if (n * s + s > this.data.length)
      return;
    const r = Math.floor(this.data.length / s), o = Math.min(n + e, r), a = n * s;
    this.data.copyWithin(a, 0, s);
    let c = 1, l = o - n - 1, h = 36;
    for (; l > 0 && --h > 0; )
      this.data.copyWithin(
        a + c * s,
        a,
        // We recopy the copied instances to our new destination, but we limit
        // this to the number of instances we have left to copy in this batch.
        // This effectively causes us to double the number of instances we copy
        // each iteration, thus making this operation siginificantly faster.
        a + Math.min(l, c) * s
      ), l -= c, c += c;
  }
  /**
   * Flags the buffer as dynamic. This is a performance optimization that some
   * GPUs can use for buffers that change their contents frequently. Toggling
   * this
   */
  setDynamic(e) {
    this._isDynamic = e, this._needsUpdate = !0, this._fullUpdate = !0;
  }
}
class Di {
  constructor() {
    this._attributes = {}, this.maxInstancedCount = 0, this.isInstanced = !1;
  }
  /** Get a Map representation of the attributes keyed by name */
  get attributes() {
    return this._attributeMap ? this._attributeMap : (this._attributeMap = new Map(Object.entries(this._attributes)), this._attributeMap);
  }
  get indexBuffer() {
    return this._indexBuffer;
  }
  /**
   * Adds an attribute to this geometry. This will associate the attribute's
   * buffer to an attribute with the same name used within the shader program.
   */
  addAttribute(e, t) {
    delete this._attributeMap, this._attributes[e] = t, this.isInstanced = !1;
    let n;
    t.name = e, Object.values(this._attributes).forEach((s) => {
      const r = s.isInstanced ? 1 : 0;
      n === void 0 && (n = r), (n ^ r) === 1 && (this.isInstanced = !0);
    });
  }
  /**
   * Applies an index buffer to this geometry which causes this geometry to
   * render with drawElements/drawElementsInstanced instead of
   * drawArrays/drawArraysInstanced.
   *
   * This allows for more efficient use of complex vertex data and reduces the
   * need for copies of the data in the buffers.
   */
  setIndexBuffer(e) {
    this._indexBuffer = e;
  }
  /**
   * Removes any attributes associated with the specified identifying name.
   */
  removeAttribute(e) {
    delete this._attributeMap, delete this._attributes[e];
  }
  /**
   * This loops through this geometry's attributes and index buffer and resizes
   * the buffers backing them to support the number of vertices specified.
   *
   * The index buffer is provided a different sizing option as it can represent
   * more vertices than the attributes represent.
   *
   * Resizing causes a full commit of all the buffers backing the geometry and
   * regenerates the VAO if available.
   */
  resizeVertexCount(e, t) {
    const n = Object.values(this._attributes);
    for (const s of n)
      s.resize(e);
    this.gl && this.gl.proxy.disposeGeometry(this), this._indexBuffer && t !== void 0 && this._indexBuffer.resize(t, e);
  }
  /**
   * Destroys this resource and frees resources it consumes on the GPU.
   */
  destroy() {
    var e;
    delete this._attributeMap, this.attributes.forEach((t) => t.destroy()), (e = this.indexBuffer) == null || e.destroy(), this.gl && this.gl.proxy.disposeGeometry(this), this._attributes = {};
  }
  /**
   * Triggers a rebuild of the this geometry's backing gl context. This does NOT
   * affect the attributes or index buffer.
   */
  rebuild() {
    var e;
    delete this._attributeMap, (e = this.gl) == null || e.proxy.disposeGeometry(this);
  }
}
var x;
((i) => {
  ((e) => {
    ((t) => {
      t[t.RGBA4 = 0] = "RGBA4", t[t.RGB565 = 1] = "RGB565", t[t.RGB5_A1 = 2] = "RGB5_A1", t[t.R8 = 3] = "R8", t[t.R8UI = 4] = "R8UI", t[t.R8I = 5] = "R8I", t[t.R16UI = 6] = "R16UI", t[t.R16I = 7] = "R16I", t[t.R32UI = 8] = "R32UI", t[t.R32I = 9] = "R32I", t[t.RG8 = 10] = "RG8", t[t.RG8UI = 11] = "RG8UI", t[t.RG8I = 12] = "RG8I", t[t.RG16UI = 13] = "RG16UI", t[t.RG16I = 14] = "RG16I", t[t.RG32UI = 15] = "RG32UI", t[t.RG32I = 16] = "RG32I", t[t.RGB8 = 17] = "RGB8", t[t.RGBA8 = 18] = "RGBA8", t[t.SRGB8_ALPHA8 = 19] = "SRGB8_ALPHA8", t[t.RGB10_A2 = 20] = "RGB10_A2", t[t.RGBA8UI = 21] = "RGBA8UI", t[t.RGBA8I = 22] = "RGBA8I", t[t.RGB10_A2UI = 23] = "RGB10_A2UI", t[t.RGBA16UI = 24] = "RGBA16UI", t[t.RGBA16I = 25] = "RGBA16I", t[t.RGBA32I = 26] = "RGBA32I", t[t.RGBA32UI = 27] = "RGBA32UI";
    })(e.ColorBufferFormat || (e.ColorBufferFormat = {})), ((t) => {
      t[t.DEPTH_COMPONENT16 = 0] = "DEPTH_COMPONENT16", t[t.DEPTH_STENCIL = 1] = "DEPTH_STENCIL", t[t.DEPTH_COMPONENT24 = 2] = "DEPTH_COMPONENT24", t[t.DEPTH_COMPONENT32F = 3] = "DEPTH_COMPONENT32F", t[t.DEPTH24_STENCIL8 = 4] = "DEPTH24_STENCIL8", t[t.DEPTH32F_STENCIL8 = 5] = "DEPTH32F_STENCIL8";
    })(e.DepthBufferFormat || (e.DepthBufferFormat = {})), ((t) => {
      t[t.STENCIL_INDEX8 = 0] = "STENCIL_INDEX8";
    })(e.StencilBufferFormat || (e.StencilBufferFormat = {}));
  })(i.RenderTarget || (i.RenderTarget = {})), ((e) => {
    ((t) => {
      t[t.NoBlending = -1] = "NoBlending", t[t.NormalBlending = 1] = "NormalBlending", t[t.AdditiveBlending = 2] = "AdditiveBlending", t[t.SubtractiveBlending = 3] = "SubtractiveBlending", t[t.MultiplyBlending = 4] = "MultiplyBlending";
    })(e.Blending || (e.Blending = {})), ((t) => {
      t[t.Zero = -1] = "Zero", t[t.One = 1] = "One", t[t.SrcColor = 2] = "SrcColor", t[t.OneMinusSrcColor = 3] = "OneMinusSrcColor", t[t.SrcAlpha = 4] = "SrcAlpha", t[t.OneMinusSrcAlpha = 5] = "OneMinusSrcAlpha", t[t.DstAlpha = 6] = "DstAlpha", t[t.OneMinusDstAlpha = 7] = "OneMinusDstAlpha", t[t.DstColor = 8] = "DstColor", t[t.OneMinusDstColor = 9] = "OneMinusDstColor";
    })(e.BlendingDstFactor || (e.BlendingDstFactor = {})), ((t) => {
      t[t.Zero = -1] = "Zero", t[t.One = 1] = "One", t[t.SrcColor = 2] = "SrcColor", t[t.OneMinusSrcColor = 3] = "OneMinusSrcColor", t[t.SrcAlpha = 4] = "SrcAlpha", t[t.OneMinusSrcAlpha = 5] = "OneMinusSrcAlpha", t[t.DstAlpha = 6] = "DstAlpha", t[t.OneMinusDstAlpha = 7] = "OneMinusDstAlpha", t[t.DstColor = 8] = "DstColor", t[t.OneMinusDstColor = 9] = "OneMinusDstColor", t[t.SrcAlphaSaturate = 10] = "SrcAlphaSaturate";
    })(e.BlendingSrcFactor || (e.BlendingSrcFactor = {})), ((t) => {
      t[t.Add = -1] = "Add", t[t.Subtract = 1] = "Subtract", t[t.ReverseSubtract = 2] = "ReverseSubtract";
    })(e.BlendingEquations || (e.BlendingEquations = {})), ((t) => {
      t[t.NEVER = -1] = "NEVER", t[t.LESS = 1] = "LESS", t[t.EQUAL = 2] = "EQUAL", t[t.LESS_OR_EQUAL = 3] = "LESS_OR_EQUAL", t[t.GREATER = 4] = "GREATER", t[t.NOTEQUAL = 5] = "NOTEQUAL", t[t.GREATER_OR_EQUAL = 6] = "GREATER_OR_EQUAL", t[t.ALWAYS = 7] = "ALWAYS";
    })(e.DepthFunctions || (e.DepthFunctions = {})), ((t) => {
      t[t.NONE = -1] = "NONE", t[t.CW = 1] = "CW", t[t.CCW = 2] = "CCW", t[t.BOTH = 3] = "BOTH";
    })(e.CullSide || (e.CullSide = {}));
  })(i.Material || (i.Material = {})), ((e) => {
    ((t) => {
      t[t.LINE_LOOP = 0] = "LINE_LOOP", t[t.LINE_STRIP = 1] = "LINE_STRIP", t[t.LINES = 2] = "LINES", t[t.POINTS = 3] = "POINTS", t[t.TRIANGLE_FAN = 4] = "TRIANGLE_FAN", t[t.TRIANGLE_STRIP = 5] = "TRIANGLE_STRIP", t[t.TRIANGLES = 6] = "TRIANGLES";
    })(e.DrawMode || (e.DrawMode = {}));
  })(i.Model || (i.Model = {})), ((e) => {
    ((t) => {
      t[t.TEXTURE_2D = 0] = "TEXTURE_2D", t[t.CUBE_MAP = 1] = "CUBE_MAP";
    })(e.TextureBindingTarget || (e.TextureBindingTarget = {})), ((t) => {
      t[t.REPEAT = -1] = "REPEAT", t[t.CLAMP_TO_EDGE = 1] = "CLAMP_TO_EDGE", t[t.MIRRORED_REPEAT = 2] = "MIRRORED_REPEAT";
    })(e.Wrapping || (e.Wrapping = {})), ((t) => {
      t[t.Nearest = -1] = "Nearest", t[t.NearestMipMapNearest = 1] = "NearestMipMapNearest", t[t.NearestMipMapLinear = 2] = "NearestMipMapLinear", t[t.Linear = 3] = "Linear", t[t.LinearMipMapNearest = 4] = "LinearMipMapNearest", t[t.LinearMipMapLinear = 5] = "LinearMipMapLinear";
    })(e.TextureMinFilter || (e.TextureMinFilter = {})), ((t) => {
      t[t.Nearest = -1] = "Nearest", t[t.Linear = 1] = "Linear";
    })(e.TextureMagFilter || (e.TextureMagFilter = {})), ((t) => {
      t[t.UnsignedByte = -1] = "UnsignedByte", t[t.UnsignedShort_5_6_5 = 1] = "UnsignedShort_5_6_5", t[t.UnsignedShort_4_4_4_4 = 2] = "UnsignedShort_4_4_4_4", t[t.UnsignedShort_5_5_5_1 = 3] = "UnsignedShort_5_5_5_1", t[t.UnsignedShort = 4] = "UnsignedShort", t[t.UnsignedInt = 5] = "UnsignedInt", t[t.UnsignedInt_24_8 = 6] = "UnsignedInt_24_8", t[t.Byte = 7] = "Byte", t[t.Short = 8] = "Short", t[t.Int = 9] = "Int", t[t.Float = 10] = "Float", t[t.HalfFloat = 11] = "HalfFloat", t[t.UnsignedInt_2_10_10_10_REV = 12] = "UnsignedInt_2_10_10_10_REV", t[t.UnsignedInt_10F_11F_11F_REV = 13] = "UnsignedInt_10F_11F_11F_REV", t[t.UnsignedInt_5_9_9_9_REV = 14] = "UnsignedInt_5_9_9_9_REV", t[t.Float32UnsignedInt_24_8_REV = 15] = "Float32UnsignedInt_24_8_REV";
    })(e.SourcePixelFormat || (e.SourcePixelFormat = {})), ((t) => {
      t[t.Alpha = -1] = "Alpha", t[t.DepthComponent = 1] = "DepthComponent", t[t.DepthStencil = 2] = "DepthStencil", t[t.Luminance = 3] = "Luminance", t[t.LuminanceAlpha = 4] = "LuminanceAlpha", t[t.RGB = 5] = "RGB", t[t.RGBA = 6] = "RGBA", t[t.RGBE = 7] = "RGBE", t[t.R8 = 8] = "R8", t[t.R16F = 9] = "R16F", t[t.R32F = 10] = "R32F", t[t.R8UI = 11] = "R8UI", t[t.RG8 = 12] = "RG8", t[t.RG16F = 13] = "RG16F", t[t.RG32F = 14] = "RG32F", t[t.RG8UI = 15] = "RG8UI", t[t.RG16UI = 16] = "RG16UI", t[t.RG32UI = 17] = "RG32UI", t[t.RGB8 = 18] = "RGB8", t[t.SRGB8 = 19] = "SRGB8", t[t.RGB565 = 20] = "RGB565", t[t.R11F_G11F_B10F = 21] = "R11F_G11F_B10F", t[t.RGB9_E5 = 22] = "RGB9_E5", t[t.RGB16F = 23] = "RGB16F", t[t.RGB32F = 24] = "RGB32F", t[t.RGB8UI = 25] = "RGB8UI", t[t.RGBA8 = 26] = "RGBA8", t[t.SRGB8_ALPHA8 = 27] = "SRGB8_ALPHA8", t[t.RGB5_A1 = 28] = "RGB5_A1", t[t.RGB10_A2 = 29] = "RGB10_A2", t[t.RGBA4 = 30] = "RGBA4", t[t.RGBA16F = 31] = "RGBA16F", t[t.RGBA32F = 32] = "RGBA32F", t[t.RGBA8UI = 33] = "RGBA8UI", t[t.DEPTH_COMPONENT16 = 34] = "DEPTH_COMPONENT16", t[t.DEPTH_COMPONENT24 = 35] = "DEPTH_COMPONENT24", t[t.DEPTH_COMPONENT32F = 36] = "DEPTH_COMPONENT32F", t[t.RGBA32UI = 37] = "RGBA32UI", t[t.RGB32UI = 38] = "RGB32UI", t[t.RGBA16UI = 39] = "RGBA16UI", t[t.RGB16UI = 40] = "RGB16UI", t[t.RGBA32I = 41] = "RGBA32I", t[t.RGB32I = 42] = "RGB32I", t[t.RGBA16I = 43] = "RGBA16I", t[t.RGB16I = 44] = "RGB16I", t[t.RGBA8I = 45] = "RGBA8I", t[t.RGB8I = 46] = "RGB8I", t[t.RED_INTEGER = 47] = "RED_INTEGER", t[t.RG_INTEGER = 48] = "RG_INTEGER", t[t.RGB_INTEGER = 49] = "RGB_INTEGER", t[t.RGBA_INTEGER = 50] = "RGBA_INTEGER";
    })(e.TexelDataType || (e.TexelDataType = {})), ((t) => {
      t[t.ONE = 1] = "ONE", t[t.TWO = 2] = "TWO", t[t.FOUR = 4] = "FOUR", t[t.EIGHT = 8] = "EIGHT";
    })(e.PackAlignment || (e.PackAlignment = {})), ((t) => {
      t[t.ONE = 1] = "ONE", t[t.TWO = 2] = "TWO", t[t.FOUR = 4] = "FOUR", t[t.EIGHT = 8] = "EIGHT";
    })(e.UnpackAlignment || (e.UnpackAlignment = {}));
  })(i.Texture || (i.Texture = {})), ((e) => {
    ((t) => {
      t[t.ALPHA = 0] = "ALPHA", t[t.RGB = 1] = "RGB", t[t.RGBA = 2] = "RGBA";
    })(e.ReadFilter || (e.ReadFilter = {})), ((t) => {
      t[t.UNSIGNED_BYTE = 0] = "UNSIGNED_BYTE", t[t.UNSIGNED_SHORT_5_6_5 = 1] = "UNSIGNED_SHORT_5_6_5", t[t.UNSIGNED_SHORT_4_4_4_4 = 2] = "UNSIGNED_SHORT_4_4_4_4", t[t.UNSIGNED_SHORT_5_5_5_1 = 3] = "UNSIGNED_SHORT_5_5_5_1", t[t.FLOAT = 4] = "FLOAT";
    })(e.ReadTargetArrayFormat || (e.ReadTargetArrayFormat = {}));
  })(i.Renderer || (i.Renderer = {}));
})(x || (x = {}));
function Nx(i, e) {
  const t = {
    attributeCount: 0,
    attributes: [],
    uniformCount: 0,
    uniforms: []
  }, n = i.getProgramParameter(e, i.ACTIVE_UNIFORMS), s = i.getProgramParameter(
    e,
    i.ACTIVE_ATTRIBUTES
  ), r = {
    35664: "FLOAT_VEC2",
    35665: "FLOAT_VEC3",
    35666: "FLOAT_VEC4",
    35667: "INT_VEC2",
    35668: "INT_VEC3",
    35669: "INT_VEC4",
    35670: "BOOL",
    35671: "BOOL_VEC2",
    35672: "BOOL_VEC3",
    35673: "BOOL_VEC4",
    35674: "FLOAT_MAT2",
    35675: "FLOAT_MAT3",
    35676: "FLOAT_MAT4",
    35678: "SAMPLER_2D",
    35680: "SAMPLER_CUBE",
    5120: "BYTE",
    5121: "UNSIGNED_BYTE",
    5122: "SHORT",
    5123: "UNSIGNED_SHORT",
    5124: "INT",
    5125: "UNSIGNED_INT",
    5126: "FLOAT"
  }, o = {
    35664: 1,
    35665: 1,
    35666: 1,
    35667: 1,
    35668: 1,
    35669: 1,
    35670: 1,
    35671: 1,
    35672: 1,
    35673: 1,
    35674: 1,
    35675: 3,
    35676: 4,
    35678: 1,
    35680: 1,
    5120: 1,
    5121: 1,
    5122: 1,
    5123: 1,
    5124: 1,
    5125: 1,
    5126: 1
  };
  for (let a = 0; a < n; ++a) {
    const c = i.getActiveUniform(e, a);
    c.typeName = r[c.type], t.uniforms.push(c), t.uniformCount += c.size, c.size = c.size * o[c.type];
  }
  for (let a = 0; a < s; a++) {
    const c = i.getActiveAttrib(e, a);
    c.typeName = r[c.type], t.attributes.push(c), t.attributeCount += c.size;
  }
  return t;
}
const ue = class ue {
  static print() {
    return Object.assign({}, ue);
  }
};
ue.VAO = !1, ue.DEPTH_TEXTURE = !1, ue.MAX_VERTEX_UNIFORMS = 0, ue.MAX_FRAGMENT_UNIFORMS = 0, ue.MAX_VERTEX_ATTRIBUTES = 0, ue.WEBGL_SUPPORTED = !1, ue.MAX_TEXTURE_SIZE = 0, ue.HARDWARE_INSTANCING = !1, ue.MRT_EXTENSION = !1, ue.MRT = !1, ue.MAX_COLOR_ATTACHMENTS = 0, ue.SHADERS_3_0 = !1, ue.WEBGL_VERSION = "none", ue.FLOAT_TEXTURE_READ = {
  half: !1,
  full: !1,
  halfLinearFilter: !1,
  fullLinearFilter: !1
}, ue.FLOAT_TEXTURE_WRITE = {
  half: !1,
  full: !1
}, ue.MAX_UNIFORM_BUFFER_BINDINGS = 0, ue.MAX_UNIFORM_BLOCK_SIZE = 0, ue.MAX_VERTEX_UNIFORM_BLOCKS = 0, ue.MAX_FRAGMENT_UNIFORM_BLOCKS = 0, ue.MAX_COMBINED_UNIFORM_BLOCKS = 0;
let O = ue;
function $h() {
  function i() {
    try {
      const n = document.createElement("canvas");
      let s;
      return s = n.getContext("webgl2"), s ? (O.WEBGL_VERSION = "webgl2", s) : (s = n.getContext("webgl"), s ? (O.WEBGL_VERSION = "webgl", s) : (s = n.getContext("experimental-webgl"), s ? (O.WEBGL_VERSION = "experimental-webgl", s) : null));
    } catch {
      return null;
    }
  }
  function e(n) {
    O.FLOAT_TEXTURE_READ.fullLinearFilter = !!n.getExtension("OES_texture_float_linear"), O.FLOAT_TEXTURE_READ.halfLinearFilter = !!n.getExtension("OES_texture_half_float_linear");
    const s = n.createTexture();
    if (n.bindTexture(n.TEXTURE_2D, s), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MIN_FILTER, n.NEAREST), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MAG_FILTER, n.NEAREST), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_S, n.CLAMP_TO_EDGE), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_T, n.CLAMP_TO_EDGE), n.getError() !== n.NO_ERROR)
      throw new Error("WebGLStat could not create a texture");
    const r = n.getExtension("OES_texture_float") || n.getExtension("EXT_color_buffer_float");
    if (n.getExtension("WEBGL_color_buffer_float"), r) {
      n.texImage2D(
        n.TEXTURE_2D,
        0,
        n instanceof WebGL2RenderingContext ? n.RGBA32F : n.RGBA,
        2,
        2,
        0,
        n.RGBA,
        n.FLOAT,
        null
      ), n.getError() === n.NO_ERROR && (O.FLOAT_TEXTURE_READ.full = !0);
      const h = n.createFramebuffer();
      n.bindFramebuffer(n.FRAMEBUFFER, h), n.framebufferTexture2D(
        n.FRAMEBUFFER,
        n.COLOR_ATTACHMENT0,
        n.TEXTURE_2D,
        s,
        0
      ), n.bindTexture(n.TEXTURE_2D, null), n.checkFramebufferStatus(n.FRAMEBUFFER) === n.FRAMEBUFFER_COMPLETE && (O.FLOAT_TEXTURE_WRITE.full = !0), n.deleteFramebuffer(h), n.deleteTexture(s);
    }
    const o = n.createTexture();
    if (n.bindTexture(n.TEXTURE_2D, o), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MIN_FILTER, n.NEAREST), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MAG_FILTER, n.NEAREST), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_S, n.CLAMP_TO_EDGE), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_T, n.CLAMP_TO_EDGE), n.getError() !== n.NO_ERROR)
      throw new Error("WebGLStat could not create a texture");
    const a = n.getExtension("OES_texture_half_float") || n.getExtension("EXT_color_buffer_float");
    if (a) {
      n.texImage2D(
        n.TEXTURE_2D,
        0,
        n instanceof WebGL2RenderingContext ? n.RGBA16F : n.RGBA,
        2,
        2,
        0,
        n.RGBA,
        n instanceof WebGL2RenderingContext ? n.HALF_FLOAT : a.HALF_FLOAT_OES,
        null
      ), n.getError() === n.NO_ERROR && (O.FLOAT_TEXTURE_READ.full = !0);
      const h = n.createFramebuffer();
      n.bindFramebuffer(n.FRAMEBUFFER, h), n.framebufferTexture2D(
        n.FRAMEBUFFER,
        n.COLOR_ATTACHMENT0,
        n.TEXTURE_2D,
        o,
        0
      ), n.bindTexture(n.TEXTURE_2D, null), n.checkFramebufferStatus(n.FRAMEBUFFER) === n.FRAMEBUFFER_COMPLETE && (O.FLOAT_TEXTURE_WRITE.full = !0), n.deleteFramebuffer(h), n.deleteTexture(o);
    }
  }
  const t = i();
  if (t)
    if (O.WEBGL_SUPPORTED = !0, O.MAX_VERTEX_UNIFORMS = t.getParameter(
      t.MAX_VERTEX_UNIFORM_VECTORS
    ), O.MAX_FRAGMENT_UNIFORMS = t.getParameter(
      t.MAX_FRAGMENT_UNIFORM_VECTORS
    ), O.MAX_VERTEX_ATTRIBUTES = t.getParameter(t.MAX_VERTEX_ATTRIBS), O.MAX_TEXTURE_SIZE = t.getParameter(t.MAX_TEXTURE_SIZE), e(t), t instanceof WebGL2RenderingContext)
      O.VAO = !0, O.MRT = !0, O.HARDWARE_INSTANCING = !0, O.SHADERS_3_0 = !0, O.HARDWARE_INSTANCING = !0, O.DEPTH_TEXTURE = !0, O.MAX_COLOR_ATTACHMENTS = t.getParameter(
        t.MAX_COLOR_ATTACHMENTS
      ), O.MAX_UNIFORM_BUFFER_BINDINGS = t.getParameter(
        t.MAX_UNIFORM_BUFFER_BINDINGS
      ), O.MAX_UNIFORM_BLOCK_SIZE = t.getParameter(
        t.MAX_UNIFORM_BLOCK_SIZE
      ), O.MAX_VERTEX_UNIFORM_BLOCKS = t.getParameter(
        t.MAX_VERTEX_UNIFORM_BLOCKS
      ), O.MAX_FRAGMENT_UNIFORM_BLOCKS = t.getParameter(
        t.MAX_FRAGMENT_UNIFORM_BLOCKS
      ), O.MAX_COMBINED_UNIFORM_BLOCKS = t.getParameter(
        t.MAX_COMBINED_UNIFORM_BLOCKS
      );
    else {
      O.VAO = !!t.getExtension("OES_vertex_array_object"), O.HARDWARE_INSTANCING = !!t.getExtension("ANGLE_instanced_arrays");
      const n = t.getExtension("WEBGL_draw_buffers");
      O.MRT_EXTENSION = !!n, O.MRT = !!n, O.DEPTH_TEXTURE = !!t.getExtension("WEBGL_depth_texture"), n && (O.MAX_COLOR_ATTACHMENTS = t.getParameter(
        n.MAX_COLOR_ATTACHMENTS_WEBGL
      ));
    }
  window.WebGLStat = O;
}
$h();
function gn(i, e) {
  switch (e) {
    case x.Model.DrawMode.LINES:
      return i.LINES;
    case x.Model.DrawMode.LINE_LOOP:
      return i.LINE_LOOP;
    case x.Model.DrawMode.LINE_STRIP:
      return i.LINE_STRIP;
    case x.Model.DrawMode.POINTS:
      return i.POINTS;
    case x.Model.DrawMode.TRIANGLES:
      return i.TRIANGLES;
    case x.Model.DrawMode.TRIANGLE_FAN:
      return i.TRIANGLE_FAN;
    case x.Model.DrawMode.TRIANGLE_STRIP:
      return i.TRIANGLE_STRIP;
    default:
      return i.TRIANGLES;
  }
}
function mn(i, e) {
  switch (e) {
    case x.Texture.TexelDataType.Alpha:
      return i.ALPHA;
    case x.Texture.TexelDataType.DepthComponent:
      return i.DEPTH_COMPONENT;
    case x.Texture.TexelDataType.DepthStencil:
      return i.DEPTH_STENCIL;
    case x.Texture.TexelDataType.Luminance:
      return i.LUMINANCE;
    case x.Texture.TexelDataType.LuminanceAlpha:
      return i.LUMINANCE_ALPHA;
    case x.Texture.TexelDataType.RGB:
      return i.RGB;
    case x.Texture.TexelDataType.RGBA:
      return i.RGBA;
    default:
      if (i instanceof WebGL2RenderingContext)
        switch (e) {
          case x.Texture.TexelDataType.R8:
            return i.R8;
          case x.Texture.TexelDataType.R16F:
            return i.R16F;
          case x.Texture.TexelDataType.R32F:
            return i.R32F;
          case x.Texture.TexelDataType.R8UI:
            return i.R8UI;
          case x.Texture.TexelDataType.RG8:
            return i.RG8;
          case x.Texture.TexelDataType.RG16F:
            return i.RG16F;
          case x.Texture.TexelDataType.RG32F:
            return i.RG32F;
          case x.Texture.TexelDataType.RG8UI:
            return i.RG8UI;
          case x.Texture.TexelDataType.RG16UI:
            return i.RG16UI;
          case x.Texture.TexelDataType.RG32UI:
            return i.RG32UI;
          case x.Texture.TexelDataType.RGB8:
            return i.RGB8;
          case x.Texture.TexelDataType.SRGB8:
            return i.SRGB8;
          case x.Texture.TexelDataType.RGB565:
            return i.RGB565;
          case x.Texture.TexelDataType.R11F_G11F_B10F:
            return i.R11F_G11F_B10F;
          case x.Texture.TexelDataType.RGB9_E5:
            return i.RGB9_E5;
          case x.Texture.TexelDataType.RGB16F:
            return i.RGB16F;
          case x.Texture.TexelDataType.RGB32F:
            return i.RGB32F;
          case x.Texture.TexelDataType.RGB8UI:
            return i.RGB8UI;
          case x.Texture.TexelDataType.RGBA8:
            return i.RGBA8;
          case x.Texture.TexelDataType.SRGB8_ALPHA8:
            return i.SRGB8_ALPHA8;
          case x.Texture.TexelDataType.RGB5_A1:
            return i.RGB5_A1;
          case x.Texture.TexelDataType.RGB10_A2:
            return i.RGB10_A2;
          case x.Texture.TexelDataType.RGBA4:
            return i.RGBA4;
          case x.Texture.TexelDataType.RGBA16F:
            return i.RGBA16F;
          case x.Texture.TexelDataType.RGBA32F:
            return O.FLOAT_TEXTURE_READ.full && O.FLOAT_TEXTURE_WRITE.full ? i.RGBA32F : i.RGBA16F;
          case x.Texture.TexelDataType.RGBA8UI:
            return i.RGBA8UI;
          case x.Texture.TexelDataType.DEPTH_COMPONENT16:
            return i.DEPTH_COMPONENT16;
          case x.Texture.TexelDataType.DEPTH_COMPONENT24:
            return i.DEPTH_COMPONENT24;
          case x.Texture.TexelDataType.DEPTH_COMPONENT32F:
            return i.DEPTH_COMPONENT32F;
          case x.Texture.TexelDataType.RGBA32UI:
            return i.RGBA32UI;
          case x.Texture.TexelDataType.RGB32UI:
            return i.RGB32UI;
          case x.Texture.TexelDataType.RGBA16UI:
            return i.RGBA16UI;
          case x.Texture.TexelDataType.RGB16UI:
            return i.RGB16UI;
          case x.Texture.TexelDataType.RGBA32I:
            return i.RGBA32I;
          case x.Texture.TexelDataType.RGB32I:
            return i.RGB32I;
          case x.Texture.TexelDataType.RGBA16I:
            return i.RGBA16I;
          case x.Texture.TexelDataType.RGB16I:
            return i.RGB16I;
          case x.Texture.TexelDataType.RGBA8I:
            return i.RGBA8I;
          case x.Texture.TexelDataType.RGB8I:
            return i.RGB8I;
          default:
            return console.warn(
              "An unsupported texel format was provided that is not supported in WebGL 1 or 2"
            ), i.RGBA;
        }
      return console.warn(
        "An Unsupported texel format was provided. Some formats are only available in WebGL 2",
        e
      ), i.RGBA;
  }
}
function ds(i, e) {
  switch (e) {
    case x.Texture.SourcePixelFormat.Byte:
      return i.BYTE;
    case x.Texture.SourcePixelFormat.Float:
      return i.FLOAT;
    case x.Texture.SourcePixelFormat.HalfFloat:
      return console.warn("Unsupported HALF_FLOAT"), i.BYTE;
    case x.Texture.SourcePixelFormat.Int:
      return i.INT;
    case x.Texture.SourcePixelFormat.Short:
      return i.SHORT;
    case x.Texture.SourcePixelFormat.UnsignedByte:
      return i.UNSIGNED_BYTE;
    case x.Texture.SourcePixelFormat.UnsignedInt:
      return i.UNSIGNED_INT;
    case x.Texture.SourcePixelFormat.UnsignedShort:
      return i.UNSIGNED_SHORT;
    case x.Texture.SourcePixelFormat.UnsignedShort_4_4_4_4:
      return i.UNSIGNED_SHORT_4_4_4_4;
    case x.Texture.SourcePixelFormat.UnsignedShort_5_5_5_1:
      return i.UNSIGNED_SHORT_5_5_5_1;
    case x.Texture.SourcePixelFormat.UnsignedShort_5_6_5:
      return i.UNSIGNED_SHORT_5_6_5;
    default:
      return console.warn("An Unsupported input image format was provided", e), i.BYTE;
  }
}
function xn(i, e) {
  switch (e) {
    case x.Texture.TextureMagFilter.Linear:
      return i.LINEAR;
    case x.Texture.TextureMagFilter.Nearest:
      return i.NEAREST;
  }
}
function Ai(i, e, t) {
  switch (e) {
    case x.Texture.TextureMinFilter.Linear:
      return i.LINEAR;
    case x.Texture.TextureMinFilter.Nearest:
      return i.NEAREST;
    case x.Texture.TextureMinFilter.LinearMipMapLinear:
      return t ? i.LINEAR_MIPMAP_LINEAR : i.LINEAR;
    case x.Texture.TextureMinFilter.LinearMipMapNearest:
      return t ? i.LINEAR_MIPMAP_NEAREST : i.LINEAR;
    case x.Texture.TextureMinFilter.NearestMipMapLinear:
      return t ? i.NEAREST_MIPMAP_LINEAR : i.NEAREST;
    case x.Texture.TextureMinFilter.NearestMipMapNearest:
      return t ? i.NEAREST_MIPMAP_NEAREST : i.NEAREST;
    default:
      return i.LINEAR;
  }
}
function Wh(i, e) {
  switch (e) {
    case x.RenderTarget.ColorBufferFormat.RGB565:
      return i.RGB565;
    case x.RenderTarget.ColorBufferFormat.RGB5_A1:
      return i.RGB5_A1;
    case x.RenderTarget.ColorBufferFormat.RGBA4:
      return i.RGBA4;
    default:
      if (i instanceof WebGL2RenderingContext)
        switch (e) {
          case x.RenderTarget.ColorBufferFormat.R8:
            return i.R8;
          case x.RenderTarget.ColorBufferFormat.R8UI:
            return i.R8UI;
          case x.RenderTarget.ColorBufferFormat.R8I:
            return i.R8I;
          case x.RenderTarget.ColorBufferFormat.R16UI:
            return i.R16UI;
          case x.RenderTarget.ColorBufferFormat.R16I:
            return i.R16I;
          case x.RenderTarget.ColorBufferFormat.R32UI:
            return i.R32UI;
          case x.RenderTarget.ColorBufferFormat.R32I:
            return i.R32I;
          case x.RenderTarget.ColorBufferFormat.RG8:
            return i.RG8;
          case x.RenderTarget.ColorBufferFormat.RG8UI:
            return i.RG8UI;
          case x.RenderTarget.ColorBufferFormat.RG8I:
            return i.RG8I;
          case x.RenderTarget.ColorBufferFormat.RG16UI:
            return i.RG16UI;
          case x.RenderTarget.ColorBufferFormat.RG16I:
            return i.RG16I;
          case x.RenderTarget.ColorBufferFormat.RG32UI:
            return i.RG32UI;
          case x.RenderTarget.ColorBufferFormat.RG32I:
            return i.RG32I;
          case x.RenderTarget.ColorBufferFormat.RGB8:
            return i.RGB8;
          case x.RenderTarget.ColorBufferFormat.RGBA8:
            return i.RGBA8;
          case x.RenderTarget.ColorBufferFormat.SRGB8_ALPHA8:
            return i.SRGB8_ALPHA8;
          case x.RenderTarget.ColorBufferFormat.RGB10_A2:
            return i.RGB10_A2;
          case x.RenderTarget.ColorBufferFormat.RGBA8UI:
            return i.RGBA8UI;
          case x.RenderTarget.ColorBufferFormat.RGBA8I:
            return i.RGBA8I;
          case x.RenderTarget.ColorBufferFormat.RGB10_A2UI:
            return i.RGB10_A2UI;
          case x.RenderTarget.ColorBufferFormat.RGBA16UI:
            return i.RGBA16UI;
          case x.RenderTarget.ColorBufferFormat.RGBA16I:
            return i.RGBA16I;
          case x.RenderTarget.ColorBufferFormat.RGBA32I:
            return i.RGBA32I;
          case x.RenderTarget.ColorBufferFormat.RGBA32UI:
            return i.RGBA32UI;
        }
      return i.RGBA4;
  }
}
function jh(i, e) {
  switch (e) {
    case x.RenderTarget.DepthBufferFormat.DEPTH_COMPONENT16:
      return i.DEPTH_COMPONENT16;
    case x.RenderTarget.DepthBufferFormat.DEPTH_STENCIL:
      return i.DEPTH_STENCIL;
    default:
      if (i instanceof WebGL2RenderingContext)
        switch (e) {
          case x.RenderTarget.DepthBufferFormat.DEPTH_COMPONENT24:
            return i.DEPTH_COMPONENT24;
          case x.RenderTarget.DepthBufferFormat.DEPTH_COMPONENT32F:
            return i.DEPTH_COMPONENT32F;
          case x.RenderTarget.DepthBufferFormat.DEPTH24_STENCIL8:
            return i.DEPTH24_STENCIL8;
          case x.RenderTarget.DepthBufferFormat.DEPTH32F_STENCIL8:
            return i.DEPTH32F_STENCIL8;
        }
      return i.DEPTH_COMPONENT16;
  }
}
function Hh(i, e) {
  switch (e) {
    case x.RenderTarget.StencilBufferFormat.STENCIL_INDEX8:
      return i.STENCIL_INDEX8;
    default:
      return i.STENCIL_INDEX8;
  }
}
function ha(i, e) {
  switch (e) {
    case x.Texture.Wrapping.CLAMP_TO_EDGE:
      return i.CLAMP_TO_EDGE;
    case x.Texture.Wrapping.MIRRORED_REPEAT:
      return i.MIRRORED_REPEAT;
    case x.Texture.Wrapping.REPEAT:
      return i.REPEAT;
  }
}
function fs(i, e, t, n, s) {
  if (n)
    return i.COLOR_ATTACHMENT0;
  const r = e.drawBuffers;
  if (s) {
    if (r instanceof WebGL2RenderingContext)
      switch (t) {
        case -2:
          return i.BACK;
        case -1:
          return i.NONE;
        case 0:
          return r.DRAW_BUFFER0;
        case 1:
          return r.DRAW_BUFFER1;
        case 2:
          return r.DRAW_BUFFER2;
        case 3:
          return r.DRAW_BUFFER3;
        case 4:
          return r.DRAW_BUFFER4;
        case 5:
          return r.DRAW_BUFFER5;
        case 6:
          return r.DRAW_BUFFER6;
        case 7:
          return r.DRAW_BUFFER7;
        case 8:
          return r.DRAW_BUFFER8;
        case 9:
          return r.DRAW_BUFFER9;
        case 10:
          return r.DRAW_BUFFER10;
        case 11:
          return r.DRAW_BUFFER11;
        case 12:
          return r.DRAW_BUFFER12;
        case 13:
          return r.DRAW_BUFFER13;
        case 14:
          return r.DRAW_BUFFER14;
        case 15:
          return r.DRAW_BUFFER15;
        default:
          console.warn("Attachments are only available for -2 - 15");
      }
    else if (r)
      switch (t) {
        case -2:
          return i.BACK;
        case -1:
          return i.NONE;
        case 0:
          return r.DRAW_BUFFER0_WEBGL;
        case 1:
          return r.DRAW_BUFFER1_WEBGL;
        case 2:
          return r.DRAW_BUFFER2_WEBGL;
        case 3:
          return r.DRAW_BUFFER3_WEBGL;
        case 4:
          return r.DRAW_BUFFER4_WEBGL;
        case 5:
          return r.DRAW_BUFFER5_WEBGL;
        case 6:
          return r.DRAW_BUFFER6_WEBGL;
        case 7:
          return r.DRAW_BUFFER7_WEBGL;
        case 8:
          return r.DRAW_BUFFER8_WEBGL;
        case 9:
          return r.DRAW_BUFFER9_WEBGL;
        case 10:
          return r.DRAW_BUFFER10_WEBGL;
        case 11:
          return r.DRAW_BUFFER11_WEBGL;
        case 12:
          return r.DRAW_BUFFER12_WEBGL;
        case 13:
          return r.DRAW_BUFFER13_WEBGL;
        case 14:
          return r.DRAW_BUFFER14_WEBGL;
        case 15:
          return r.DRAW_BUFFER15_WEBGL;
        default:
          console.warn("Attachments are only available for 0 - 15");
      }
  } else if (r instanceof WebGL2RenderingContext)
    switch (t) {
      case -2:
        return i.BACK;
      case -1:
        return i.NONE;
      case 0:
        return r.COLOR_ATTACHMENT0;
      case 1:
        return r.COLOR_ATTACHMENT1;
      case 2:
        return r.COLOR_ATTACHMENT2;
      case 3:
        return r.COLOR_ATTACHMENT3;
      case 4:
        return r.COLOR_ATTACHMENT4;
      case 5:
        return r.COLOR_ATTACHMENT5;
      case 6:
        return r.COLOR_ATTACHMENT6;
      case 7:
        return r.COLOR_ATTACHMENT7;
      case 8:
        return r.COLOR_ATTACHMENT8;
      case 9:
        return r.COLOR_ATTACHMENT9;
      case 10:
        return r.COLOR_ATTACHMENT10;
      case 11:
        return r.COLOR_ATTACHMENT11;
      case 12:
        return r.COLOR_ATTACHMENT12;
      case 13:
        return r.COLOR_ATTACHMENT13;
      case 14:
        return r.COLOR_ATTACHMENT14;
      case 15:
        return r.COLOR_ATTACHMENT15;
      default:
        console.warn("Attachments are only available for -2 - 15");
    }
  else if (r)
    switch (t) {
      case -2:
        return i.BACK;
      case -1:
        return i.NONE;
      case 0:
        return r.COLOR_ATTACHMENT0_WEBGL;
      case 1:
        return r.COLOR_ATTACHMENT1_WEBGL;
      case 2:
        return r.COLOR_ATTACHMENT2_WEBGL;
      case 3:
        return r.COLOR_ATTACHMENT3_WEBGL;
      case 4:
        return r.COLOR_ATTACHMENT4_WEBGL;
      case 5:
        return r.COLOR_ATTACHMENT5_WEBGL;
      case 6:
        return r.COLOR_ATTACHMENT6_WEBGL;
      case 7:
        return r.COLOR_ATTACHMENT7_WEBGL;
      case 8:
        return r.COLOR_ATTACHMENT8_WEBGL;
      case 9:
        return r.COLOR_ATTACHMENT9_WEBGL;
      case 10:
        return r.COLOR_ATTACHMENT10_WEBGL;
      case 11:
        return r.COLOR_ATTACHMENT11_WEBGL;
      case 12:
        return r.COLOR_ATTACHMENT12_WEBGL;
      case 13:
        return r.COLOR_ATTACHMENT13_WEBGL;
      case 14:
        return r.COLOR_ATTACHMENT14_WEBGL;
      case 15:
        return r.COLOR_ATTACHMENT15_WEBGL;
      default:
        console.warn("Attachments are only available for 0 - 15");
    }
  return i.COLOR_ATTACHMENT0;
}
function Xh(i, e) {
  return i.TEXTURE0 + e;
}
function ua(i, e) {
  return e - i.TEXTURE0;
}
function Qh(i) {
  return i && i.__esModule && Object.prototype.hasOwnProperty.call(i, "default") ? i.default : i;
}
var ps = { exports: {} }, gs = { exports: {} }, _r, da;
function Yh() {
  if (da) return _r;
  da = 1;
  var i = 1e3, e = i * 60, t = e * 60, n = t * 24, s = n * 365.25;
  _r = function(l, h) {
    h = h || {};
    var u = typeof l;
    if (u === "string" && l.length > 0)
      return r(l);
    if (u === "number" && isNaN(l) === !1)
      return h.long ? a(l) : o(l);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(l)
    );
  };
  function r(l) {
    if (l = String(l), !(l.length > 100)) {
      var h = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
        l
      );
      if (h) {
        var u = parseFloat(h[1]), d = (h[2] || "ms").toLowerCase();
        switch (d) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return u * s;
          case "days":
          case "day":
          case "d":
            return u * n;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return u * t;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return u * e;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return u * i;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return u;
          default:
            return;
        }
      }
    }
  }
  function o(l) {
    return l >= n ? Math.round(l / n) + "d" : l >= t ? Math.round(l / t) + "h" : l >= e ? Math.round(l / e) + "m" : l >= i ? Math.round(l / i) + "s" : l + "ms";
  }
  function a(l) {
    return c(l, n, "day") || c(l, t, "hour") || c(l, e, "minute") || c(l, i, "second") || l + " ms";
  }
  function c(l, h, u) {
    if (!(l < h))
      return l < h * 1.5 ? Math.floor(l / h) + " " + u : Math.ceil(l / h) + " " + u + "s";
  }
  return _r;
}
var fa;
function qh() {
  return fa || (fa = 1, function(i, e) {
    e = i.exports = n.debug = n.default = n, e.coerce = c, e.disable = o, e.enable = r, e.enabled = a, e.humanize = Yh(), e.instances = [], e.names = [], e.skips = [], e.formatters = {};
    function t(l) {
      var h = 0, u;
      for (u in l)
        h = (h << 5) - h + l.charCodeAt(u), h |= 0;
      return e.colors[Math.abs(h) % e.colors.length];
    }
    function n(l) {
      var h;
      function u() {
        if (u.enabled) {
          var d = u, f = +/* @__PURE__ */ new Date(), p = f - (h || f);
          d.diff = p, d.prev = h, d.curr = f, h = f;
          for (var g = new Array(arguments.length), m = 0; m < g.length; m++)
            g[m] = arguments[m];
          g[0] = e.coerce(g[0]), typeof g[0] != "string" && g.unshift("%O");
          var v = 0;
          g[0] = g[0].replace(/%([a-zA-Z%])/g, function(w, y) {
            if (w === "%%") return w;
            v++;
            var E = e.formatters[y];
            if (typeof E == "function") {
              var C = g[v];
              w = E.call(d, C), g.splice(v, 1), v--;
            }
            return w;
          }), e.formatArgs.call(d, g);
          var b = u.log || e.log || console.log.bind(console);
          b.apply(d, g);
        }
      }
      return u.namespace = l, u.enabled = e.enabled(l), u.useColors = e.useColors(), u.color = t(l), u.destroy = s, typeof e.init == "function" && e.init(u), e.instances.push(u), u;
    }
    function s() {
      var l = e.instances.indexOf(this);
      return l !== -1 ? (e.instances.splice(l, 1), !0) : !1;
    }
    function r(l) {
      e.save(l), e.names = [], e.skips = [];
      var h, u = (typeof l == "string" ? l : "").split(/[\s,]+/), d = u.length;
      for (h = 0; h < d; h++)
        u[h] && (l = u[h].replace(/\*/g, ".*?"), l[0] === "-" ? e.skips.push(new RegExp("^" + l.substr(1) + "$")) : e.names.push(new RegExp("^" + l + "$")));
      for (h = 0; h < e.instances.length; h++) {
        var f = e.instances[h];
        f.enabled = e.enabled(f.namespace);
      }
    }
    function o() {
      e.enable("");
    }
    function a(l) {
      if (l[l.length - 1] === "*")
        return !0;
      var h, u;
      for (h = 0, u = e.skips.length; h < u; h++)
        if (e.skips[h].test(l))
          return !1;
      for (h = 0, u = e.names.length; h < u; h++)
        if (e.names[h].test(l))
          return !0;
      return !1;
    }
    function c(l) {
      return l instanceof Error ? l.stack || l.message : l;
    }
  }(gs, gs.exports)), gs.exports;
}
var pa;
function Kh() {
  return pa || (pa = 1, function(i, e) {
    e = i.exports = qh(), e.log = s, e.formatArgs = n, e.save = r, e.load = o, e.useColors = t, e.storage = typeof chrome < "u" && typeof chrome.storage < "u" ? chrome.storage.local : a(), e.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function t() {
      return typeof window < "u" && window.process && window.process.type === "renderer" ? !0 : typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/) ? !1 : typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    e.formatters.j = function(c) {
      try {
        return JSON.stringify(c);
      } catch (l) {
        return "[UnexpectedJSONParseError]: " + l.message;
      }
    };
    function n(c) {
      var l = this.useColors;
      if (c[0] = (l ? "%c" : "") + this.namespace + (l ? " %c" : " ") + c[0] + (l ? "%c " : " ") + "+" + e.humanize(this.diff), !!l) {
        var h = "color: " + this.color;
        c.splice(1, 0, h, "color: inherit");
        var u = 0, d = 0;
        c[0].replace(/%[a-zA-Z%]/g, function(f) {
          f !== "%%" && (u++, f === "%c" && (d = u));
        }), c.splice(d, 0, h);
      }
    }
    function s() {
      return typeof console == "object" && console.log && Function.prototype.apply.call(console.log, console, arguments);
    }
    function r(c) {
      try {
        c == null ? e.storage.removeItem("debug") : e.storage.debug = c;
      } catch {
      }
    }
    function o() {
      var c;
      try {
        c = e.storage.debug;
      } catch {
      }
      return !c && typeof process < "u" && "env" in process && (c = process.env.DEBUG), c;
    }
    e.enable(o());
    function a() {
      try {
        return window.localStorage;
      } catch {
      }
    }
  }(ps, ps.exports)), ps.exports;
}
var Zh = Kh();
const ve = /* @__PURE__ */ Qh(Zh);
var _c = /* @__PURE__ */ ((i) => (i[i.INVALID = 0] = "INVALID", i[i.ONE = 1] = "ONE", i[i.TWO = 2] = "TWO", i[i.THREE = 3] = "THREE", i[i.FOUR = 4] = "FOUR", i))(_c || {}), S = /* @__PURE__ */ ((i) => (i[i.ONE = 1] = "ONE", i[i.TWO = 2] = "TWO", i[i.THREE = 3] = "THREE", i[i.FOUR = 4] = "FOUR", i[i.MAT4X4 = 16] = "MAT4X4", i[i.ATLAS = 99] = "ATLAS", i))(S || {});
const Jh = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  16: 16,
  99: 4
};
var _ = /* @__PURE__ */ ((i) => (i[i.ONE = 1] = "ONE", i[i.TWO = 2] = "TWO", i[i.THREE = 3] = "THREE", i[i.FOUR = 4] = "FOUR", i[i.MATRIX3 = 9] = "MATRIX3", i[i.MATRIX4 = 16] = "MATRIX4", i[i.FLOAT_ARRAY = 97] = "FLOAT_ARRAY", i[i.VEC4_ARRAY = 98] = "VEC4_ARRAY", i[i.TEXTURE = 99] = "TEXTURE", i))(_ || {}), ke = /* @__PURE__ */ ((i) => (i[i.ONE = 1] = "ONE", i[i.TWO = 2] = "TWO", i[i.THREE = 3] = "THREE", i[i.FOUR = 4] = "FOUR", i))(ke || {}), Cs = /* @__PURE__ */ ((i) => (i[i.UINT8 = 1] = "UINT8", i[i.UINT16 = 2] = "UINT16", i[i.UINT32 = 3] = "UINT32", i))(Cs || {}), ft = /* @__PURE__ */ ((i) => (i[i.SCREEN_256TH = -256] = "SCREEN_256TH", i[i.SCREEN_128TH = -128] = "SCREEN_128TH", i[i.SCREEN_64TH = -64] = "SCREEN_64TH", i[i.SCREEN_32ND = -32] = "SCREEN_32ND", i[i.SCREEN_16TH = -16] = "SCREEN_16TH", i[i.SCREEN_8TH = -8] = "SCREEN_8TH", i[i.SCREEN_QUARTER = -4] = "SCREEN_QUARTER", i[i.SCREEN_HALF = -2] = "SCREEN_HALF", i[i.SCREEN = -1] = "SCREEN", i[i._2 = 2] = "_2", i[i._4 = 4] = "_4", i[i._8 = 8] = "_8", i[i._16 = 16] = "_16", i[i._32 = 32] = "_32", i[i._64 = 64] = "_64", i[i._128 = 128] = "_128", i[i._256 = 256] = "_256", i[i._512 = 512] = "_512", i[i._1024 = 1024] = "_1024", i[i._2048 = 2048] = "_2048", i[i._4096 = 4096] = "_4096", i))(ft || {}), re = /* @__PURE__ */ ((i) => (i[i.ATLAS = 0] = "ATLAS", i[i.FONT = 1] = "FONT", i[i.TEXTURE = 2] = "TEXTURE", i[i.COLOR_BUFFER = 3] = "COLOR_BUFFER", i))(re || {}), te = /* @__PURE__ */ ((i) => (i[i.zyx = 0] = "zyx", i[i.zyz = 1] = "zyz", i[i.zxy = 2] = "zxy", i[i.zxz = 3] = "zxz", i[i.yxz = 4] = "yxz", i[i.yxy = 5] = "yxy", i[i.yzx = 6] = "yzx", i[i.yzy = 7] = "yzy", i[i.xyz = 8] = "xyz", i[i.xyx = 9] = "xyx", i[i.xzy = 10] = "xzy", i[i.xzx = 11] = "xzx", i))(te || {});
function Px(i) {
  return i.size !== void 0 && i.size <= 4;
}
function Bx(i) {
  return !!(i && i.resource);
}
var A = /* @__PURE__ */ ((i) => (i[i.VERTEX = 1] = "VERTEX", i[i.FRAGMENT = 2] = "FRAGMENT", i[i.ALL = 3] = "ALL", i))(A || {});
function go() {
}
const Dx = /\s/g, ga = /\s/, An = ga.test.bind(ga), eu = /\n\r|\n|\r/g, ma = /\n\r|\n|\r/, Ux = ma.test.bind(ma);
function kx(i) {
  return i;
}
var H = /* @__PURE__ */ ((i) => (i[i.NONE = 0] = "NONE", i[i.SINGLE = 1] = "SINGLE", i))(H || {}), ge = /* @__PURE__ */ ((i) => (i[i.CHANGE = 0] = "CHANGE", i[i.INSERT = 1] = "INSERT", i[i.REMOVE = 2] = "REMOVE", i))(ge || {}), Ac = /* @__PURE__ */ ((i) => (i[i.NO_WEBGL_CONTEXT = 0] = "NO_WEBGL_CONTEXT", i))(Ac || {}), ie = /* @__PURE__ */ ((i) => (i[i.UNIFORM = 1] = "UNIFORM", i[i.INSTANCE_ATTRIBUTE = 2] = "INSTANCE_ATTRIBUTE", i[i.INSTANCE_ATTRIBUTE_PACKING = 3] = "INSTANCE_ATTRIBUTE_PACKING", i[i.VERTEX_ATTRIBUTE = 4] = "VERTEX_ATTRIBUTE", i[i.VERTEX_ATTRIBUTE_PACKING = 5] = "VERTEX_ATTRIBUTE_PACKING", i))(ie || {}), kr = /* @__PURE__ */ ((i) => (i[i.LINEAR = 0] = "LINEAR", i))(kr || {});
function Li(i) {
  return i !== void 0 && i.charCodeAt !== void 0;
}
function Ic(i) {
  return i !== void 0 && i.toExponential !== void 0;
}
function Fx(i) {
  return i !== void 0 && i.call !== void 0 && i.apply !== void 0;
}
function Hi(i) {
  return i === !0 || i === !1;
}
var V = /* @__PURE__ */ ((i) => (i[i.NONE = 0] = "NONE", i[i.BLANK = 1] = "BLANK", i[i.COLOR = 2] = "COLOR", i[i.DEPTH = 3] = "DEPTH", i[i.NORMAL = 4] = "NORMAL", i[i.PICKING = 5] = "PICKING", i[i.POSITION = 6] = "POSITION", i[i.POSITION_X = 7] = "POSITION_X", i[i.POSITION_Y = 8] = "POSITION_Y", i[i.POSITION_Z = 9] = "POSITION_Z", i[i.LIGHTS = 10] = "LIGHTS", i[i.LIGHTS2 = 11] = "LIGHTS2", i[i.LIGHTS3 = 12] = "LIGHTS3", i[i.ALPHA = 13] = "ALPHA", i[i.BETA = 14] = "BETA", i[i.GAMMA = 15] = "GAMMA", i[i.DELTA = 16] = "DELTA", i[i.ACCUMULATION1 = 17] = "ACCUMULATION1", i[i.ACCUMULATION2 = 18] = "ACCUMULATION2", i[i.ACCUMULATION3 = 19] = "ACCUMULATION3", i[i.ACCUMULATION4 = 20] = "ACCUMULATION4", i[i.COEFFICIENT1 = 21] = "COEFFICIENT1", i[i.COEFFICIENT2 = 22] = "COEFFICIENT2", i[i.COEFFICIENT3 = 23] = "COEFFICIENT3", i[i.COEFFICIENT4 = 24] = "COEFFICIENT4", i[i.ANGLE1 = 25] = "ANGLE1", i[i.ANGLE2 = 26] = "ANGLE2", i[i.ANGLE3 = 27] = "ANGLE3", i[i.ANGLE4 = 28] = "ANGLE4", i[i.COLOR2 = 29] = "COLOR2", i[i.COLOR3 = 30] = "COLOR3", i[i.COLOR4 = 31] = "COLOR4", i[i.GLOW = 32] = "GLOW", i[i.BLUR = 33] = "BLUR", i))(V || {});
class Mc {
  /**
   * Default ctor
   */
  constructor(e) {
    this._destroyed = !1, this._internalFormat = x.RenderTarget.ColorBufferFormat.RGBA4, this.needsSettingsUpdate = !1, this._size = [0, 0], this.size = e.size || this.size, this.internalFormat = e.internalFormat ?? this.internalFormat;
  }
  /**
   * Indicates this ColorBuffer has been destroyed, meaning it is useless and
   * invalid to use within the application.
   */
  get destroyed() {
    return this._destroyed;
  }
  /**
   * Tells the input packing to premultiply the alpha values with the other
   * channels as the texture is generated. See:
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
   */
  get internalFormat() {
    return this._internalFormat;
  }
  set internalFormat(e) {
    this.needsSettingsUpdate = !0, this._internalFormat = e;
  }
  /**
   * The dimensions of this color buffer object.
   */
  get size() {
    return this._size;
  }
  set size(e) {
    this.needsSettingsUpdate = !0, this._size = e;
  }
  /**
   * Destroys and frees the resources this buffer utilizes in the gl context.
   * This also invalidates this as a viable resource permanently.
   */
  destroy() {
    this.gl && this.gl.proxy.disposeColorBuffer(this), this._destroyed = !0;
  }
}
let tu = 1;
function U() {
  return ++tu;
}
let iu = 0;
function zx() {
  return ++iu % 16777215;
}
class ee {
  constructor(e) {
    this._uid = U(), this._destroyed = !1, this._flipY = !1, this._format = x.Texture.TexelDataType.RGBA, this._generateMipmaps = !1, this._internalFormat = x.Texture.TexelDataType.RGBA, this._magFilter = x.Texture.TextureMagFilter.Linear, this._minFilter = x.Texture.TextureMinFilter.LinearMipMapLinear, this.needsDataUpload = !1, this.needsPartialDataUpload = !1, this.needsSettingsUpdate = !1, this._packAlignment = x.Texture.PackAlignment.FOUR, this._premultiplyAlpha = !1, this._type = x.Texture.SourcePixelFormat.UnsignedByte, this._unpackAlignment = x.Texture.UnpackAlignment.FOUR, this._updateRegions = [], this._wrapHorizontal = x.Texture.Wrapping.CLAMP_TO_EDGE, this._wrapVertical = x.Texture.Wrapping.CLAMP_TO_EDGE, this.anisotropy = e.anisotropy || this.anisotropy, this.data = e.data || this.data, this.flipY = e.flipY || this.flipY, this.format = e.format || this.format, this.internalFormat = e.internalFormat || this.format, this.generateMipMaps = e.generateMipMaps || this.generateMipMaps, this.magFilter = e.magFilter || this.magFilter, this.minFilter = e.minFilter || this.minFilter, this.packAlignment = e.packAlignment || this.packAlignment, this.premultiplyAlpha = e.premultiplyAlpha || this.premultiplyAlpha, this.type = e.type || this.type, this.unpackAlignment = e.unpackAlignment || this.unpackAlignment, this.wrapHorizontal = e.wrapHorizontal || this.wrapHorizontal, this.wrapVertical = e.wrapVertical || this.wrapVertical;
  }
  /**
   * Empty texture object to help resolve ambiguous texture values.
   */
  static get emptyTexture() {
    return nu;
  }
  /** Unique identifier of the texture to aid in debugging and referencing */
  get uid() {
    return this._uid;
  }
  /**
   * Indicates this Texture has been disposed, meaning it is useless and invalid
   * to use within the application.
   */
  get destroyed() {
    return this._destroyed;
  }
  /**
   * Anisotropic filtering level. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
   * https://blog.tojicode.com/2012/03/anisotropic-filtering-in-webgl.html
   */
  get anisotropy() {
    return this._anisotropy;
  }
  set anisotropy(e) {
    this.needsSettingsUpdate = !0, this._anisotropy = e;
  }
  /**
   * The data to apply to the GPU for the image. If no data is to be uploaded to
   * the texture, use width and height object. You would do this for render
   * target textures such as depth textures or color buffer textures where the
   * GPU writes the initial data into the texture. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
   */
  get data() {
    return this._data;
  }
  set data(e) {
    this.needsDataUpload = !0, this._data = e;
  }
  /**
   * Indicates the data gets flipped vertically when uploaded to the GPU.
   */
  get flipY() {
    return this._flipY;
  }
  set flipY(e) {
    this.needsDataUpload = !0, this._flipY = e;
  }
  /**
   * Source format of the input data. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
   */
  get format() {
    return this._format;
  }
  set format(e) {
    this.needsDataUpload = !0, this._format = e;
  }
  /**
   * Auto generates mipmaps. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/generateMipmap
   */
  get generateMipMaps() {
    return this._generateMipmaps;
  }
  set generateMipMaps(e) {
    this.needsSettingsUpdate = !0, this._generateMipmaps = e;
  }
  /**
   * Source format of the input data. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
   */
  get internalFormat() {
    return this._internalFormat;
  }
  set internalFormat(e) {
    this.needsDataUpload = !0, this._internalFormat = e;
  }
  /**
   * Filter used when sampling has to magnify the image see:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
   */
  get magFilter() {
    return this._magFilter;
  }
  set magFilter(e) {
    this.needsSettingsUpdate = !0, this._magFilter = e;
  }
  /**
   * Filter used when sampling has to shrink the image. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
   */
  get minFilter() {
    return this._minFilter;
  }
  set minFilter(e) {
    this.needsSettingsUpdate = !0, this._minFilter = e;
  }
  /**
   * Sets the readPixels data alignment. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
   * https://www.khronos.org/registry/OpenGL-Refpages/es2.0/xhtml/glPixelStorei.xml
   */
  get packAlignment() {
    return this._packAlignment;
  }
  set packAlignment(e) {
    this.needsSettingsUpdate = !0, this._packAlignment = e;
  }
  /**
   * Tells the input packing to premultiply the alpha values with the other channels as the texture is generated. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
   */
  get premultiplyAlpha() {
    return this._premultiplyAlpha;
  }
  set premultiplyAlpha(e) {
    this.needsSettingsUpdate = !0, this._premultiplyAlpha = e;
  }
  /**
   * The source pixel data type.
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
   */
  get type() {
    return this._type;
  }
  set type(e) {
    this.needsDataUpload = !0, this._type = e;
  }
  /**
   * Sets the data alignment for packing the pixels. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
   * https://www.khronos.org/registry/OpenGL-Refpages/es2.0/xhtml/glPixelStorei.xml
   */
  get unpackAlignment() {
    return this._unpackAlignment;
  }
  set unpackAlignment(e) {
    this.needsSettingsUpdate = !0, this._unpackAlignment = e;
  }
  /**
   * These are the regions that have been requested to be applied to the Texture along
   * with the data that should be buffered into that region.
   */
  get updateRegions() {
    return this._updateRegions;
  }
  /**
   * Specifies sample wrapping for when samples fall outside the 0 - 1 range See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
   */
  get wrapHorizontal() {
    return this._wrapHorizontal;
  }
  set wrapHorizontal(e) {
    this.needsSettingsUpdate = !0, this._wrapHorizontal = e;
  }
  /**
   * Specifies sample wrapping for when samples fall outside the 0 - 1 range. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
   */
  get wrapVertical() {
    return this._wrapVertical;
  }
  set wrapVertical(e) {
    this.needsSettingsUpdate = !0, this._wrapVertical = e;
  }
  /**
   * This checks if any formatting of this texture makes it a half float texture
   * or not.
   */
  get isHalfFloatTexture() {
    switch (this._internalFormat) {
      case x.Texture.TexelDataType.R16F:
      case x.Texture.TexelDataType.RG16F:
      case x.Texture.TexelDataType.RGB16F:
        return !0;
    }
    switch (this._type) {
      case x.Texture.SourcePixelFormat.HalfFloat:
        return !0;
    }
    return !1;
  }
  /**
   * This checks if any formatting of this texture makes it a float texture
   * or not.
   */
  get isFloatTexture() {
    switch (this._internalFormat) {
      case x.Texture.TexelDataType.R11F_G11F_B10F:
      case x.Texture.TexelDataType.R16F:
      case x.Texture.TexelDataType.RG16F:
      case x.Texture.TexelDataType.R32F:
      case x.Texture.TexelDataType.RG32F:
      case x.Texture.TexelDataType.RGB16F:
      case x.Texture.TexelDataType.RGB32F:
        return !0;
    }
    switch (this._type) {
      case x.Texture.SourcePixelFormat.Float:
      case x.Texture.SourcePixelFormat.HalfFloat:
        return !0;
    }
    return !1;
  }
  /**
   * Frees resources associated with this texture.
   */
  destroy() {
    this.gl && this.gl.proxy.disposeTexture(this), this._destroyed = !0, delete this._data;
  }
  /**
   * Clears all update flags and clears out requested updates to the texture object.
   *
   * NOTE: Calling this does not perform any actions, but instead prevents actions from
   * being taken again. The system uses this to clear up any changes requested for the texture
   * after the texture has been updated with the GPU.
   */
  resolve() {
    this.needsDataUpload = !1, this.needsPartialDataUpload = !1, this.needsSettingsUpdate = !1, this._updateRegions = [];
  }
  /**
   * This updates a portion of the texture object.
   */
  update(e, t) {
    this.needsPartialDataUpload = !0, this._updateRegions.push([e, t]);
  }
}
const nu = new ee({
  data: {
    width: 2,
    height: 2,
    buffer: new Uint8Array(16)
  }
}), $t = ve("performance");
function xa(i) {
  return i && i.buffer && i.buffer.byteOffset !== void 0 && i.buffer.byteLength || i.buffer === null;
}
function vn(i) {
  return (i & i - 1) === 0;
}
function ms(i) {
  return !!(i.gl && i.gl.textureId && i.gl.textureUnit > -1);
}
class Vs {
  constructor(e, t, n) {
    this.debugContext = "", this.fragmentShaders = /* @__PURE__ */ new Map(), this.vertexShaders = /* @__PURE__ */ new Map(), this.programs = /* @__PURE__ */ new Map(), this.gl = e, this.state = t, this.extensions = n;
  }
  /**
   * This enables the desired and supported extensions this framework utilizes.
   */
  static addExtensions(e) {
    const t = e.getExtension("ANGLE_instanced_arrays"), n = e.getExtension("WEBGL_draw_buffers"), s = e.getExtension("OES_texture_float"), r = e.getExtension("OES_texture_float_linear"), o = e.getExtension("OES_texture_half_float"), a = e.getExtension(
      "OES_texture_half_float_linear"
    ), c = e.getExtension(
      "EXT_texture_filter_anisotropic"
    ), l = e.getExtension("EXT_color_buffer_float"), h = e.getExtension("OES_vertex_array_object"), u = {
      maxAnistropicFilter: 0
    };
    return !t && !(e instanceof WebGL2RenderingContext) && $t(
      "This device does not have hardware instancing. All buffering strategies will be utilizing compatibility modes."
    ), !n && !(e instanceof WebGL2RenderingContext) && $t(
      "This device does not have hardware multi-render target capabilities. The system will have to fallback to multiple render passes to multiple FBOs to achieve the same result."
    ), c ? u.maxAnistropicFilter = e.getParameter(
      c.MAX_TEXTURE_MAX_ANISOTROPY_EXT
    ) : $t(
      "This device does not have hardware anisotropic filtering for textures. This property will be ignored when setting texture settings."
    ), !h && !(e instanceof WebGL2RenderingContext) && $t(
      "This device does not support Vertex Array Objects. This could cause performance issues for high numbers of draw calls."
    ), {
      instancing: (e instanceof WebGL2RenderingContext ? e : t) || void 0,
      drawBuffers: (e instanceof WebGL2RenderingContext ? e : n) || void 0,
      anisotropicFiltering: c ? {
        ext: c,
        stat: u
      } : void 0,
      renderFloatTexture: l || void 0,
      floatTex: (e instanceof WebGL2RenderingContext ? e : s) || void 0,
      floatTexFilterLinear: (e instanceof WebGL2RenderingContext ? e : r) || void 0,
      halfFloatTex: (e instanceof WebGL2RenderingContext ? e : o) || void 0,
      halfFloatTexFilterLinear: (e instanceof WebGL2RenderingContext ? e : a) || void 0,
      vao: (e instanceof WebGL2RenderingContext ? e : h) || void 0
    };
  }
  /**
   * Clears the specified buffers
   */
  clear(e, t, n) {
    let s = 0;
    e && (s = s | this.gl.COLOR_BUFFER_BIT), t && (s = s | this.gl.DEPTH_BUFFER_BIT), n && (s = s | this.gl.STENCIL_BUFFER_BIT), this.gl.clear(s);
  }
  /**
   * Takes an Attribute object and ensures it's buffer is created and
   * initialized.
   */
  compileAttribute(e) {
    if (e.gl) return !0;
    const t = this.gl, n = t.createBuffer();
    return n ? (this.state.bindVBO(n), t.bufferData(
      t.ARRAY_BUFFER,
      e.data,
      e.isDynamic ? t.DYNAMIC_DRAW : t.STATIC_DRAW
    ), e.gl = {
      bufferId: n,
      proxy: this
    }, e.resolve(), !0) : (console.warn(
      this.debugContext,
      "Could bot create WebGLBuffer. Printing any existing gl errors:"
    ), this.printError(), !1);
  }
  /**
   * Takes an IndexBuffer object and ensures it's buffer is created and
   * initialized.
   */
  compileIndexBuffer(e) {
    if (e.gl) return;
    const t = this.gl, n = t.createBuffer();
    if (!n) {
      console.warn(
        this.debugContext,
        "Could not create WebGLBuffer. Printing any existing gl errors:"
      ), this.printError();
      return;
    }
    return this.state.bindElementArrayBuffer(n), t.bufferData(
      t.ELEMENT_ARRAY_BUFFER,
      e.data,
      e.isDynamic ? t.DYNAMIC_DRAW : t.STATIC_DRAW
    ), e.gl = {
      bufferId: n,
      indexType: e.data instanceof Uint8Array ? t.UNSIGNED_BYTE : e.data instanceof Uint16Array ? t.UNSIGNED_SHORT : t.UNSIGNED_INT,
      proxy: this
    }, e.resolve(), !0;
  }
  /**
   * Takes a geometry object and ensures all of it's buffers are generated
   */
  compileGeometry(e) {
    if (e.gl) return;
    let t = !0;
    if (e.gl = {
      proxy: this
    }, this.extensions.vao) {
      let n;
      this.extensions.vao instanceof WebGL2RenderingContext ? n = this.extensions.vao.createVertexArray() : n = this.extensions.vao.createVertexArrayOES(), n ? (this.state.disableVertexAttributeArray(), this.state.bindVAO(n), e.attributes.forEach((s, r) => {
        this.updateAttribute(s) && this.useAttribute(r, s, e);
      }), e.indexBuffer && this.updateIndexBuffer(e.indexBuffer) && this.useIndexBuffer(e.indexBuffer), e.gl.vao = n, this.state.bindVAO(null)) : $t(
        "WARNING: Could not make VAO for Geometry. This is fine, but this could cause a hit on performance."
      );
    } else
      e.attributes.forEach((n) => {
        t = !!(this.compileAttribute(n) && t);
      });
    return t;
  }
  /**
   * This creates the shaders and programs needed to create a material.
   */
  compileMaterial(e) {
    if (e.gl) return;
    let t = this.vertexShaders.get(e.vertexShader) || null;
    if (!t) {
      if (t = this.gl.createShader(this.gl.VERTEX_SHADER), !t) {
        console.warn(
          this.debugContext,
          "Could not create a Vertex WebGLShader. Printing GL Errors:"
        ), this.printError();
        return;
      }
      if (this.gl.shaderSource(t, e.vertexShader), this.gl.compileShader(t), this.gl.isContextLost() && console.warn("Context was lost during compilation"), !this.gl.getShaderParameter(t, this.gl.COMPILE_STATUS)) {
        console.error(
          this.debugContext,
          "VERTEX SHADER COMPILER ERROR",
          e.name
        ), console.warn(
          "Could not compile provided shader. Printing logs and errors:"
        ), console.warn(this.lineFormatShader(e.vertexShader)), console.warn("LOGS:"), console.warn(this.gl.getShaderInfoLog(t)), this.printError(), this.gl.deleteShader(t);
        return;
      }
    }
    let n = this.programs.get(t);
    n || (n = /* @__PURE__ */ new Map(), this.programs.set(t, n));
    const s = {
      vsId: t,
      fsId: [],
      programId: [],
      proxy: this,
      programByTarget: /* @__PURE__ */ new WeakMap(),
      outputsByProgram: /* @__PURE__ */ new WeakMap()
    }, r = /* @__PURE__ */ new Set();
    if (!e.fragmentShader)
      return console.warn(
        "A material appears to not have it's fragment shader configuration set."
      ), !1;
    e.fragmentShader.forEach((a) => {
      var d, f;
      if (!n || !t) return;
      let c = this.fragmentShaders.get(a.source) || null;
      if (!c) {
        if (c = this.gl.createShader(this.gl.FRAGMENT_SHADER), !c) {
          console.warn(
            this.debugContext,
            "Could not create a Fragment WebGLShader. Printing GL Errors:"
          ), this.printError();
          return;
        }
        if (this.gl.shaderSource(c, a.source), this.gl.compileShader(c), this.gl.isContextLost() && console.warn("Context was lost during compilation"), !this.gl.getShaderParameter(c, this.gl.COMPILE_STATUS)) {
          console.error(
            this.debugContext,
            "FRAGMENT SHADER COMPILER ERROR:",
            e.name
          ), console.warn(
            "Could not compile provided shader. Printing logs and errors:"
          ), console.warn(this.lineFormatShader(a.source)), console.warn("LOGS:"), console.warn(this.gl.getShaderInfoLog(c)), this.printError(), this.gl.deleteShader(c);
          return;
        }
      }
      let l = n.get(c) || null;
      if (l)
        l.useCount++;
      else {
        const p = this.gl.createProgram();
        if (!p) {
          console.warn(
            this.debugContext,
            "Could not create a WebGLProgram. Printing GL Errors:"
          ), this.printError();
          return;
        }
        if (l = {
          useCount: 1,
          program: p
        }, this.gl.attachShader(p, t), this.gl.attachShader(p, c), this.gl.linkProgram(p), this.gl.validateProgram(p), !this.gl.getProgramParameter(p, this.gl.LINK_STATUS) || !this.gl.getProgramParameter(p, this.gl.VALIDATE_STATUS)) {
          const g = this.gl.getProgramInfoLog(p);
          console.warn(
            this.debugContext,
            `Could not compile WebGL program. 

`,
            g
          ), this.printError(), this.gl.deleteProgram(p);
          return;
        }
        n.set(c, l);
      }
      (d = s.fsId) == null || d.push({
        id: c,
        outputTypes: a.outputTypes
      }), (f = s.programId) == null || f.push({
        id: l.program,
        outputTypes: a.outputTypes
      }), s.outputsByProgram.set(
        l.program,
        a.outputTypes
      ), this.state.useProgram(l.program);
      const h = this.state.currentProgram;
      if (!h) return !1;
      const u = this.gl.getProgramParameter(
        h,
        this.gl.ACTIVE_UNIFORMS
      );
      for (let p = 0; p < u; p++) {
        const g = this.gl.getActiveUniform(h, p);
        g && r.add(g.name.replace("[0]", ""));
      }
    }), e.gl = s;
    const o = /* @__PURE__ */ new Set();
    return Object.keys(e.uniforms).forEach((a) => {
      r.has(a) || o.add(a);
    }), o.forEach((a) => {
      delete e.uniforms[a];
    }), Object.keys(e.uniforms).length !== r.size ? (console.warn(
      this.debugContext,
      "A program is requesting a set of uniforms:",
      Array.from(r.values()),
      "but our material only provides",
      Object.keys(e.uniforms),
      "thus the expected rendering will be considered invalid."
    ), !1) : !0;
  }
  /**
   * Generates and uploads a uniform buffer to the GPU
   */
  compileUniformBuffer(e) {
    if (e.gl) return !0;
  }
  /**
   * This does what is needed to generate a GPU FBO that we can utilize as a render target
   * for subsequent draw calls.
   */
  compileRenderTarget(e) {
    if (e.isInvalid) return !1;
    if (e.gl) return !0;
    const t = this.gl, n = t.createFramebuffer();
    if (!n)
      return console.warn(
        this.debugContext,
        "Could not generate a frame buffer object. Printing GL errors:"
      ), this.printError(), !1;
    this.state.bindFBO(n);
    const s = {
      fboId: n,
      proxy: this,
      fboByMaterial: /* @__PURE__ */ new WeakMap()
    };
    if (Array.isArray(e.buffers.color)) {
      if (!this.extensions.drawBuffers)
        return console.warn(
          "Attempted to manage a render target with MRT but the hardware does not support MRT. Use multiple render targets instead."
        ), !1;
      const l = [];
      let h = !0;
      s.colorBufferId = l;
      const u = e.buffers.color.length <= 1;
      if (e.buffers.color.forEach((d, f) => {
        if (h)
          if (d.buffer instanceof ee) {
            const p = fs(
              t,
              this.extensions,
              f,
              u,
              !1
            );
            l.push({
              data: d.buffer,
              outputType: d.outputType,
              attachment: p
            }), ms(d.buffer) ? t.framebufferTexture2D(
              t.FRAMEBUFFER,
              p,
              t.TEXTURE_2D,
              d.buffer.gl.textureId,
              0
            ) : (console.warn(
              this.debugContext,
              "Attempted to compile render target whose target texture was not ready for use."
            ), h = !1);
          } else {
            const p = this.compileColorBuffer(
              d.buffer,
              e.width,
              e.height
            );
            if (p) {
              const g = fs(
                t,
                this.extensions,
                f,
                u,
                !1
              );
              l.push({
                data: p,
                outputType: d.outputType,
                attachment: g
              }), t.framebufferRenderbuffer(
                t.FRAMEBUFFER,
                g,
                t.RENDERBUFFER,
                p
              );
            }
          }
      }), !h)
        return !1;
    } else if (e.buffers.color !== void 0) {
      const l = e.buffers.color;
      if (l.buffer instanceof ee) {
        const h = fs(
          t,
          this.extensions,
          0,
          !0,
          !1
        );
        if (s.colorBufferId = {
          data: l.buffer,
          outputType: l.outputType,
          attachment: h
        }, ms(l.buffer))
          t.framebufferTexture2D(
            t.FRAMEBUFFER,
            h,
            t.TEXTURE_2D,
            l.buffer.gl.textureId,
            0
          );
        else
          return console.warn(
            this.debugContext,
            "Attempted to compile render target whose target texture was not ready for use."
          ), !1;
      } else {
        const h = this.compileColorBuffer(
          l.buffer,
          e.width,
          e.height
        );
        if (h) {
          const u = fs(
            t,
            this.extensions,
            0,
            !0,
            !1
          );
          s.colorBufferId = {
            data: h,
            outputType: l.outputType,
            attachment: u
          }, t.framebufferRenderbuffer(
            t.FRAMEBUFFER,
            u,
            t.RENDERBUFFER,
            h
          );
        }
      }
    }
    if (e.buffers.depth !== void 0) {
      const l = e.buffers.depth;
      if (l instanceof ee)
        s.depthBufferId = l, ms(l) && t.framebufferTexture2D(
          t.FRAMEBUFFER,
          t.DEPTH_ATTACHMENT,
          t.TEXTURE_2D,
          l.gl.textureId,
          0
        );
      else if (l instanceof Mc) {
        const h = this.compileDepthBuffer(
          l.internalFormat,
          e.width,
          e.height
        );
        h && (s.depthBufferId = h, t.framebufferRenderbuffer(
          t.FRAMEBUFFER,
          t.DEPTH_ATTACHMENT,
          t.RENDERBUFFER,
          h
        ));
      } else {
        const h = this.compileDepthBuffer(
          l,
          e.width,
          e.height
        );
        h && (s.depthBufferId = h, t.framebufferRenderbuffer(
          t.FRAMEBUFFER,
          t.DEPTH_ATTACHMENT,
          t.RENDERBUFFER,
          h
        ));
      }
    }
    if (e.buffers.stencil !== void 0) {
      const l = e.buffers.stencil;
      if (l instanceof ee)
        s.stencilBufferId = l, ms(l) && t.framebufferTexture2D(
          t.FRAMEBUFFER,
          t.STENCIL_ATTACHMENT,
          t.TEXTURE_2D,
          l.gl.textureId,
          0
        );
      else {
        const h = this.compileStencilBuffer(
          l,
          e.width,
          e.height
        );
        h && (s.stencilBufferId = h, t.framebufferRenderbuffer(
          t.FRAMEBUFFER,
          t.STENCIL_ATTACHMENT,
          t.RENDERBUFFER,
          h
        ));
      }
    }
    e.gl = s;
    const r = t.checkFramebufferStatus(t.FRAMEBUFFER);
    let o = !1, a = !1, c = "";
    switch (r) {
      case t.FRAMEBUFFER_COMPLETE:
        e.setAsValid();
        break;
      case t.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
        c = "FRAMEBUFFER_INCOMPLETE_ATTACHMENT";
        break;
      case t.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
        c = "FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT";
        break;
      case t.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
        c = "FRAMEBUFFER_INCOMPLETE_DIMENSIONS";
        break;
      case t.FRAMEBUFFER_UNSUPPORTED:
        c = "FRAMEBUFFER_UNSUPPORTED";
        break;
      default:
        o = !0;
        break;
    }
    if (t instanceof WebGL2RenderingContext)
      switch (r) {
        case t.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE:
          c = "FRAMEBUFFER_INCOMPLETE_MULTISAMPLE";
          break;
        case t.RENDERBUFFER_SAMPLES:
          c = "RENDERBUFFER_SAMPLES";
          break;
        default:
          a = !0;
          break;
      }
    return o && a && (console.warn(
      this.debugContext,
      "A framebuffer check failed to return a known result. This FBO for render target will be assumed failed"
    ), console.warn("Result:", r, "Render Target:", e), c = "UNKNOWN"), c ? (console.warn(
      this.debugContext,
      "When creating a new FrameBuffer Object, the check on the framebuffer failed. Printing Errors:"
    ), console.warn(c), this.printError(), console.warn("FAILED RENDER TARGET:", e), delete e.gl, e.isInvalid = !0, !1) : !0;
  }
  /**
   * Produces a render buffer object intended for a render target for the depth buffer attachment
   */
  compileDepthBuffer(e, t, n) {
    const s = this.gl, r = s.createRenderbuffer();
    if (!r) {
      console.warn(
        this.debugContext,
        "Could not generate a WebGLRenderBuffer. Printing GL Errors:"
      ), this.printError();
      return;
    }
    return this.state.bindRBO(r), s.renderbufferStorage(
      s.RENDERBUFFER,
      jh(s, e),
      t,
      n
    ), r;
  }
  /**
   * Produces a render buffer object intended for a render target for the stencil buffer attachment
   */
  compileStencilBuffer(e, t, n) {
    const s = this.gl, r = s.createRenderbuffer();
    if (!r) {
      console.warn(
        this.debugContext,
        "Could not generate a WebGLRenderBuffer. Printing GL Errors:"
      ), this.printError();
      return;
    }
    return this.state.bindRBO(r), s.renderbufferStorage(
      s.RENDERBUFFER,
      Hh(s, e),
      t,
      n
    ), r;
  }
  /**
   * Produces a render buffer object intended for a render target for the color
   * buffer attachment
   */
  compileColorBuffer(e, t, n) {
    const s = this.gl, r = s.createRenderbuffer();
    if (!r) {
      console.warn(
        this.debugContext,
        "Could not generate a WebGLRenderBuffer. Printing GL Errors:"
      ), this.printError();
      return;
    }
    return this.state.bindRBO(r), s.renderbufferStorage(
      s.RENDERBUFFER,
      Wh(s, e.internalFormat),
      t,
      n
    ), e.gl = {
      bufferId: r,
      proxy: this
    }, r;
  }
  /**
   * This does what is needed to generate a GPU texture object and format it to
   * the Texture object specifications.
   */
  compileTexture(e) {
    if (!e.gl || e.gl.textureId) return;
    if (e.gl.textureUnit < 0) {
      console.warn(
        this.debugContext,
        "A Texture object attempted to be compiled without an established Texture Unit.",
        e
      );
      return;
    }
    this.state.setActiveTextureUnit(e.gl.textureUnit);
    const n = this.gl.createTexture();
    if (!n) {
      console.warn(
        this.debugContext,
        "Could not generate a texture object on the GPU. Printing any gl errors:"
      ), this.printError();
      return;
    }
    return e.gl.textureId = n, e.needsDataUpload = !0, e.needsSettingsUpdate = !0, this.updateTextureData(e), this.updateTextureSettings(e), !0;
  }
  /**
   * Executes the draw operation for a given model
   */
  draw(e) {
    var s, r, o;
    let t, n = [0, 0];
    e.vertexDrawRange && e.vertexDrawRange[0] >= 0 && e.vertexDrawRange[1] >= 0 ? n = [
      e.vertexDrawRange[0],
      e.vertexDrawRange[1] - e.vertexDrawRange[0]
    ] : n = [0, e.vertexCount], e.drawInstances >= 0 && e.geometry.isInstanced && (t = this.extensions.instancing), !((O.MRT || O.MRT_EXTENSION) && this.state.renderTarget && !this.state.drawBuffers.find((a) => a !== this.gl.NONE)) && (t && t instanceof WebGL2RenderingContext ? e.geometry.indexBuffer ? t.drawElementsInstanced(
      gn(this.gl, e.drawMode),
      n[1],
      ((s = e.geometry.indexBuffer.gl) == null ? void 0 : s.indexType) ?? this.gl.UNSIGNED_INT,
      0,
      e.drawInstances
    ) : t.drawArraysInstanced(
      gn(this.gl, e.drawMode),
      n[0],
      n[1],
      e.drawInstances
    ) : t ? e.geometry.indexBuffer ? t.drawElementsInstancedANGLE(
      gn(this.gl, e.drawMode),
      n[1],
      ((r = e.geometry.indexBuffer.gl) == null ? void 0 : r.indexType) ?? this.gl.UNSIGNED_INT,
      0,
      e.drawInstances
    ) : t.drawArraysInstancedANGLE(
      gn(this.gl, e.drawMode),
      n[0],
      n[1],
      e.drawInstances
    ) : e.geometry.indexBuffer ? this.gl.drawElements(
      gn(this.gl, e.drawMode),
      n[1],
      ((o = e.geometry.indexBuffer.gl) == null ? void 0 : o.indexType) ?? this.gl.UNSIGNED_INT,
      0
    ) : this.gl.drawArrays(
      gn(this.gl, e.drawMode),
      n[0],
      n[1]
    ), this.state.setDrawBuffers([], !0));
  }
  /**
   * Destroys an attribute's resources from the GL Context
   */
  disposeAttribute(e) {
    e.gl && (this.gl.deleteBuffer(e.gl.bufferId), delete e.gl);
  }
  /**
   * Destroys an index buffer's resources from the GL Context
   */
  disposeIndexBuffer(e) {
    var t;
    e.gl && (this.gl.deleteBuffer((t = e.gl) == null ? void 0 : t.bufferId), delete e.gl);
  }
  /**
   * Destroys a uniform buffer's resources from the GL Context.
   */
  disposeUniformBuffer(e) {
    e.gl && (this.gl.deleteBuffer(e.gl.bufferId), delete e.gl);
  }
  /**
   * Destroys a color buffer's resources from the GL Context
   */
  disposeColorBuffer(e) {
    e.gl && (e.gl.bufferId && this.disposeRenderBuffer(e.gl.bufferId), delete e.gl);
  }
  /**
   * Destroys a geometry's resources from the GL Context
   */
  disposeGeometry(e) {
    e.gl && (this.extensions.vao && e.gl.vao && (this.extensions.vao instanceof WebGL2RenderingContext ? this.extensions.vao.deleteVertexArray(e.gl.vao) : this.extensions.vao.deleteVertexArrayOES(e.gl.vao)), delete e.gl);
  }
  /**
   * Destroys a material's resources from the GL Context.
   */
  disposeMaterial(e) {
    if (e.gl) {
      const { vsId: t, fsId: n, programId: s } = e.gl;
      let r = this.programs.get(t);
      r || (r = /* @__PURE__ */ new Map(), this.gl.deleteShader(t));
      for (let o = 0, a = n.length; o < a; ++o) {
        const c = n[o];
        let l = r.get(c);
        l || (l = {
          useCount: 0,
          program: s
        }), l.useCount--, l.useCount < 1 && (this.gl.deleteProgram(l.program), r.delete(c), r.size <= 0 && this.gl.deleteShader(t));
        let h = !1;
        this.programs.forEach((u) => {
          u.has(c) && (h = !0);
        }), h || this.gl.deleteShader(c);
      }
    }
    delete e.gl;
  }
  /**
   * Destroy a render buffer (RBO)
   */
  disposeRenderBuffer(e) {
    this.gl.deleteRenderbuffer(e);
  }
  /**
   * Destroys a render target's resources from the GL context
   */
  disposeRenderTarget(e) {
    e.gl && (Array.isArray(e.gl.colorBufferId) ? e.gl.colorBufferId.forEach((t) => {
      t.data instanceof ee && !e.retainTextureTargets ? this.disposeTexture(t.data) : t.data instanceof WebGLRenderbuffer && this.disposeRenderBuffer(t.data);
    }) : e.gl.colorBufferId && e.gl.colorBufferId.data instanceof ee && !e.retainTextureTargets ? this.disposeTexture(e.gl.colorBufferId.data) : e.gl.colorBufferId instanceof WebGLRenderbuffer && this.disposeRenderBuffer(e.gl.colorBufferId.data), e.gl.depthBufferId instanceof ee && !e.retainTextureTargets ? this.disposeTexture(e.gl.depthBufferId) : e.gl.depthBufferId instanceof WebGLRenderbuffer && this.disposeRenderBuffer(e.gl.depthBufferId), e.gl.stencilBufferId instanceof ee && !e.retainTextureTargets ? this.disposeTexture(e.gl.stencilBufferId) : e.gl.stencilBufferId instanceof WebGLRenderbuffer && this.disposeRenderBuffer(e.gl.stencilBufferId), this.gl.deleteFramebuffer(e.gl.fboId), delete e.gl);
  }
  /**
   * Destroys a texture's resources from the GL context
   */
  disposeTexture(e) {
    e.gl && !e.destroyed && (this.gl.deleteTexture(e.gl.textureId), this.state.freeTextureUnit(e)), delete e.gl;
  }
  /**
   * Retrieves the gl context from the canvas
   */
  static getContext(e, t) {
    const n = [
      O.WEBGL_VERSION,
      "webgl",
      "webgl2",
      "experimental-webgl"
    ];
    let s = null, r = {};
    for (let o = 0; o < n.length; ++o) {
      const a = n[o], c = e.getContext(a, t);
      if (c && (c instanceof WebGLRenderingContext || c instanceof WebGL2RenderingContext)) {
        $t(
          "Generated GL Context of version with attributes:",
          a,
          t
        ), s = c, r = Vs.addExtensions(s);
        break;
      }
    }
    return {
      context: s,
      extensions: r
    };
  }
  /**
   * This decodes and prints any webgl context error in a  human readable manner.
   */
  printError() {
    const e = this.gl.getError();
    switch (e) {
      case this.gl.NO_ERROR:
        console.warn("GL Error: No Error");
        break;
      case this.gl.INVALID_ENUM:
        console.warn("GL Error: INVALID ENUM");
        break;
      case this.gl.INVALID_VALUE:
        console.warn("GL Error: INVALID_VALUE");
        break;
      case this.gl.INVALID_OPERATION:
        console.warn("GL Error: INVALID OPERATION");
        break;
      case this.gl.INVALID_FRAMEBUFFER_OPERATION:
        console.warn("GL Error: INVALID FRAMEBUFFER OPERATION");
        break;
      case this.gl.OUT_OF_MEMORY:
        console.warn("GL Error: OUT OF MEMORY");
        break;
      case this.gl.CONTEXT_LOST_WEBGL:
        console.warn("GL Error: CONTEXT LOST WEBGL");
        break;
      default:
        console.warn(
          "GL Error: GL Context output an unrecognized error value:",
          e
        );
        break;
    }
  }
  /**
   * Breaks down a string into a multiline structure. Helps pretty print some
   * items.
   */
  lineFormat(e) {
    const t = e.split(`
`), n = String(t.length).length + 1;
    return `
${t.map(
      (s, r) => `${Array(n - String(r + 1).length).join(" ")}${r + 1}: ${s}`
    ).join(`
`)}`;
  }
  /**
   * Prints a shader broken down by lines
   */
  lineFormatShader(e) {
    return e ? Li(e) ? this.lineFormat(e) : e.forEach(
      (t) => `
SHADER FOR OUTPUT TYPES: ${t.outputTypes} ${this.lineFormat(
        t.source
      )}`
    ) : "NO SHADER FOUND";
  }
  /**
   * Ensures a texture object is compiled and/or updated.
   */
  updateTexture(e) {
    if (!e.gl || e.gl.textureUnit < 0) {
      console.warn(
        this.debugContext,
        "Can not update or compile a texture that does not have an established texture unit.",
        e
      );
      return;
    }
    this.compileTexture(e), this.updateTextureData(e), this.updateTexturePartialData(e), this.updateTextureSettings(e), e.resolve();
  }
  /**
   * Ensures the texture object has it's data uploaded to the GPU
   */
  updateTextureData(e) {
    if (!e.needsDataUpload || !e.gl || !e.gl.textureId) return;
    if (e.gl.textureUnit < 0) {
      console.warn(
        this.debugContext,
        "A Texture object attempted to update it's data without an established Texture Unit.",
        e
      );
      return;
    }
    const t = this.gl;
    if (this.state.setActiveTextureUnit(e.gl.textureUnit), this.state.bindTexture(
      e,
      x.Texture.TextureBindingTarget.TEXTURE_2D
    ), e.needsSettingsUpdate = !0, this.updateTextureSettings(e), t instanceof WebGLRenderingContext || t instanceof WebGL2RenderingContext) {
      if (xa(e.data)) {
        (!vn(e.data.width) || !vn(e.data.height)) && $t("Created a texture that is not using power of 2 dimensions.");
        const n = mn(t, e.internalFormat), s = mn(t, e.format);
        t instanceof WebGLRenderingContext && n !== s && console.warn(
          "WebGL 1 requires format and data format to be identical"
        ), t.texImage2D(
          t.TEXTURE_2D,
          0,
          n,
          e.data.width,
          e.data.height,
          0,
          s,
          ds(t, e.type),
          e.data.buffer
        );
      } else e.data && ((!vn(e.data.width) || !vn(e.data.height)) && $t(
        "Created a texture that is not using power of 2 dimensions. %o",
        e
      ), t.texImage2D(
        t.TEXTURE_2D,
        0,
        mn(t, e.internalFormat),
        mn(t, e.format),
        ds(t, e.type),
        e.data
      ));
      e.generateMipMaps && t.generateMipmap(t.TEXTURE_2D);
    }
    e.data && (e.data = {
      width: e.data.width,
      height: e.data.height,
      buffer: null
    }), e.needsDataUpload = !1;
  }
  /**
   * This consumes all of the partial texture updates applied to the texture.
   */
  updateTexturePartialData(e) {
    if (!e.needsPartialDataUpload || !e.gl || !e.gl.textureId) return;
    if (e.gl.textureUnit < 0) {
      console.warn(
        this.debugContext,
        "A Texture object attempted to update it's data without an established Texture Unit.",
        e
      );
      return;
    }
    const t = this.gl;
    this.state.setActiveTextureUnit(e.gl.textureUnit), this.state.bindTexture(
      e,
      x.Texture.TextureBindingTarget.TEXTURE_2D
    ), e.updateRegions.forEach((n) => {
      const s = n[0], r = n[1];
      (t instanceof WebGLRenderingContext || t instanceof WebGL2RenderingContext) && (xa(s) ? t.texSubImage2D(
        t.TEXTURE_2D,
        0,
        r.x,
        r.y,
        s.width,
        s.height,
        mn(t, e.format),
        ds(t, e.type),
        s.buffer
      ) : s && t.texSubImage2D(
        t.TEXTURE_2D,
        0,
        r.x,
        r.y,
        mn(t, e.format),
        ds(t, e.type),
        s
      ), e.generateMipMaps && t.generateMipmap(t.TEXTURE_2D));
    }), e.needsPartialDataUpload = !1;
  }
  /**
   * Modifies all settings needing modified on the provided texture object.
   */
  updateTextureSettings(e) {
    if (!e.needsSettingsUpdate || !e.gl || !e.data || !e.gl.textureId) return;
    if (e.gl.textureUnit < 0) {
      console.warn(
        this.debugContext,
        "A Texture object attempted to update it's settings without an established Texture Unit.",
        e
      );
      return;
    }
    const t = vn(e.data.width) && vn(e.data.height), n = this.gl;
    this.state.setActiveTextureUnit(e.gl.textureUnit), this.state.bindTexture(
      e,
      x.Texture.TextureBindingTarget.TEXTURE_2D
    );
    let s, r;
    if (e.isHalfFloatTexture)
      if (O.FLOAT_TEXTURE_READ.halfLinearFilter)
        switch (s = xn(n, e.magFilter), e.minFilter) {
          case x.Texture.TextureMinFilter.Nearest:
          case x.Texture.TextureMinFilter.NearestMipMapLinear:
          case x.Texture.TextureMinFilter.NearestMipMapNearest:
            r = Ai(
              n,
              x.Texture.TextureMinFilter.Nearest,
              e.generateMipMaps
            );
            break;
          case x.Texture.TextureMinFilter.Linear:
          case x.Texture.TextureMinFilter.LinearMipMapLinear:
          case x.Texture.TextureMinFilter.LinearMipMapNearest:
            r = Ai(
              n,
              x.Texture.TextureMinFilter.Nearest,
              e.generateMipMaps
            );
            break;
        }
      else
        s = xn(
          n,
          x.Texture.TextureMagFilter.Nearest
        ), r = Ai(
          n,
          x.Texture.TextureMinFilter.Nearest,
          e.generateMipMaps
        );
    else if (e.isFloatTexture)
      if (O.FLOAT_TEXTURE_READ.fullLinearFilter)
        switch (s = xn(n, e.magFilter), e.minFilter) {
          case x.Texture.TextureMinFilter.Nearest:
          case x.Texture.TextureMinFilter.NearestMipMapLinear:
          case x.Texture.TextureMinFilter.NearestMipMapNearest:
            r = Ai(
              n,
              x.Texture.TextureMinFilter.Nearest,
              e.generateMipMaps
            );
            break;
          case x.Texture.TextureMinFilter.Linear:
          case x.Texture.TextureMinFilter.LinearMipMapLinear:
          case x.Texture.TextureMinFilter.LinearMipMapNearest:
            r = Ai(
              n,
              x.Texture.TextureMinFilter.Nearest,
              e.generateMipMaps
            );
            break;
        }
      else
        s = xn(
          n,
          x.Texture.TextureMagFilter.Nearest
        ), r = Ai(
          n,
          x.Texture.TextureMinFilter.Nearest,
          e.generateMipMaps
        );
    else !t && n instanceof WebGLRenderingContext ? (s = xn(n, x.Texture.TextureMagFilter.Linear), r = Ai(
      n,
      x.Texture.TextureMinFilter.Linear,
      e.generateMipMaps
    )) : (s = xn(n, e.magFilter), r = Ai(n, e.minFilter, e.generateMipMaps));
    if (n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MAG_FILTER, s), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MIN_FILTER, r), e.isFloatTexture || (n.texParameteri(
      n.TEXTURE_2D,
      n.TEXTURE_WRAP_S,
      ha(n, e.wrapHorizontal)
    ), n.texParameteri(
      n.TEXTURE_2D,
      n.TEXTURE_WRAP_T,
      ha(n, e.wrapVertical)
    )), e.isFloatTexture || (n.pixelStorei(
      n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,
      e.premultiplyAlpha
    ), n.pixelStorei(
      n.UNPACK_FLIP_Y_WEBGL,
      e.flipY
    )), this.extensions.anisotropicFiltering) {
      const { ext: o, stat: a } = this.extensions.anisotropicFiltering, c = Math.min(
        a.maxAnistropicFilter,
        Math.floor(e.anisotropy || 0)
      );
      !isNaN(c) && !e.isFloatTexture && c >= 1 && n.texParameterf(
        n.TEXTURE_2D,
        o.TEXTURE_MAX_ANISOTROPY_EXT,
        c
      );
    }
    e.needsSettingsUpdate = !1;
  }
  /**
   * This updates an attribute's buffer data
   */
  updateAttribute(e) {
    if (!e.gl) return this.compileAttribute(e);
    if (!e.fullUpdate && !e.needsUpdate)
      return !0;
    const t = this.gl;
    if (e.fullUpdate || e.updateRange.count < 0 || e.updateRange.offset < 0)
      this.state.bindVBO(e.gl.bufferId), t.bufferData(
        t.ARRAY_BUFFER,
        e.data,
        e.isDynamic ? t.DYNAMIC_DRAW : t.STATIC_DRAW
      );
    else if (e.updateRange.count > 0) {
      this.state.bindVBO(e.gl.bufferId);
      const n = e.updateRange.offset;
      t.bufferSubData(
        t.ARRAY_BUFFER,
        // We start at the element index. We specify the offset in BYTES hence
        // the * 4 since attributes are always specified as Float32Arrays
        n * 4,
        e.data.subarray(n, n + e.updateRange.count)
      );
    }
    return e.resolve(), !0;
  }
  /**
   * This updates an index buffer's buffer data
   */
  updateIndexBuffer(e) {
    if (!e.gl) return this.compileIndexBuffer(e);
    if (!e.fullUpdate && !e.needsUpdate)
      return !0;
    const t = this.gl;
    if (e.fullUpdate || e.updateRange.count < 0 || e.updateRange.offset < 0)
      this.state.bindVBO(e.gl.bufferId), t.bufferData(
        t.ELEMENT_ARRAY_BUFFER,
        e.data,
        e.isDynamic ? t.DYNAMIC_DRAW : t.STATIC_DRAW
      );
    else if (e.updateRange.count > 0) {
      this.state.bindVBO(e.gl.bufferId);
      const n = e.updateRange.offset;
      t.bufferSubData(
        t.ELEMENT_ARRAY_BUFFER,
        n * e.data.constructor.BYTES_PER_ELEMENT,
        e.data.subarray(n, n + e.updateRange.count)
      );
    }
    return e.resolve(), !0;
  }
  /**
   * This performs all necessary functions to use the index buffer utilizing
   * the current program in use. This is simpler than using an atribute as index
   * buffers don't have to align with attribute names or specifics of a program.
   */
  useIndexBuffer(e) {
    return e.gl ? (this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, e.gl.bufferId), !0) : !1;
  }
  /**
   * This performs all necessary functions to use the attribute utilizing
   * the current program in use.
   */
  useAttribute(e, t, n) {
    if (!this.state.currentProgram || !t.gl) return !1;
    t.gl.locations = t.gl.locations || /* @__PURE__ */ new Map();
    let s = t.gl.locations.get(this.state.currentProgram);
    if (s === void 0 && (s = this.gl.getAttribLocation(this.state.currentProgram, e), s === -1 && $t(
      "WARN: An attribute is not being used with the current material: %o",
      e,
      t
    ), t.gl.locations.set(this.state.currentProgram, s)), s !== -1) {
      switch (this.state.bindVBO(t.gl.bufferId), t.size) {
        // For sizes that fit within a single vertex block, this is the simplest
        // way to establish the pointer
        case 1:
        case 2:
        case 3:
        case 4:
          this.state.willUseVertexAttributeArray(s), this.gl.vertexAttribPointer(
            s,
            t.size,
            // How many floats used for the attribute
            this.gl.FLOAT,
            // We are only sending over float data right now
            t.normalize,
            0,
            0
          ), n.isInstanced && t.isInstanced && this.extensions.instancing ? this.state.setVertexAttributeArrayDivisor(s, 1) : this.state.setVertexAttributeArrayDivisor(s, 0);
          break;
        // For sizes that exceed a single 'block' for a vertex attribute, one must
        // break up the attribute pointers as the max allowed size is 4 at a time.
        default: {
          const r = Math.ceil(t.size / 4);
          for (let o = 0; o < r; ++o)
            this.state.willUseVertexAttributeArray(s + o), this.gl.vertexAttribPointer(
              s + o,
              4,
              this.gl.FLOAT,
              t.normalize,
              r * 4 * 4,
              o * 16
            ), n.isInstanced && t.isInstanced && this.extensions.instancing ? this.state.setVertexAttributeArrayDivisor(s + o, 1) : this.state.setVertexAttributeArrayDivisor(s + o, 0);
          break;
        }
      }
      return !0;
    }
  }
}
const { sqrt: mo, max: St, min: Ct, floor: Ot, ceil: Lt, abs: Nt, acos: su, sin: Ar } = Math, Ve = new Array(20).fill(0).map((i) => [0, 0, 0]), ru = new Array(20).fill(0).map((i) => [0, 0, 0, 0]);
function ou(i) {
  return i && Array.isArray(i) && i.length === 1;
}
function Sc(i) {
  return i && Array.isArray(i) && i.length === 2;
}
function au(i) {
  return i && Array.isArray(i) && i.length === 3;
}
function F(i) {
  return i && Array.isArray(i) && i.length === 4;
}
function Fe(i, e) {
  return i = i || [], i[0] = e, i;
}
function xo(i, e, t) {
  return Fe(t, i[0] + e[0]);
}
function Cc(i, e) {
  return Fe(e, Lt(i[0]));
}
function Oc(i, e) {
  return i[0] === e[0];
}
function cu(i, e, t) {
  return Nt(i[0] - e[0]) <= t;
}
function Lc(i, e) {
  return Fe(e, i[0]);
}
function Nc() {
  return [0];
}
function Pc(i, e, t) {
  return Fe(t, 0);
}
function Bc(i, e, t) {
  return Fe(t, i[0] / e[0]);
}
function Dc(i) {
  return Fe(i, 0);
}
function Uc(i, e) {
  e = e || [];
  for (let t = 0, n = i.length; t < n; ++t)
    e.push(i[t][0]);
  return e;
}
function kc(i, e) {
  return Fe(e, Ot(i[0]));
}
function Fc(i, e) {
  return Fe(e, 1 / i[0]);
}
function vo(i, e, t) {
  return Fe(t, i[0] * e);
}
function bo(i, e, t) {
  return Fe(t, i[0] - e[0]);
}
function zc(i, e, t) {
  return Fe(t, St(i[0], e[0]));
}
function Gc(i, e, t) {
  return Fe(t, Ct(i[0], e[0]));
}
function Vc(i, e, t) {
  return Fe(t, i[0] * e[0]);
}
function $c(i, e) {
  return Fe(e, 1);
}
function Wc(i, e) {
  return i[0] * e[0];
}
function lu(i, e) {
  return i[0] * e[0];
}
function jc(i, e, t, n) {
  return xo(vo(bo(e, i), t), i, n);
}
function Hc(i) {
  return i[0];
}
function hu(i) {
  return i;
}
function Xc(i, ...e) {
  let t;
  if (e = e || [], Array.isArray(i) ? t = i.slice(0, 1) : t = [i], t.length < 1)
    for (let n = 0, s = e.length; n < s && t.length < 1; ++n) {
      const r = e[n];
      Array.isArray(r) ? t.push(...r.slice(0, 1 - t.length)) : t.push(r);
    }
  for (; t.length < 1; ) t.push(0);
  return t;
}
function ae(i, e, t) {
  return i = i || new Array(2), i[0] = e, i[1] = t, i;
}
function Ui(i, e, t) {
  return ae(t, i[0] + e[0], i[1] + e[1]);
}
function Qc(i, e) {
  return ae(e, Lt(i[0]), Lt(i[1]));
}
function wo(i, e) {
  return ae(e, i[0], i[1]);
}
function Yc(i) {
  return ae(i, 1, 0);
}
function qc(i, e, t) {
  return ae(t, 0, 0);
}
function To(i, e) {
  return i[0] === e[0] && i[1] === e[1];
}
function uu(i, e, t) {
  return Nt(i[0] - e[0]) <= t && Nt(i[1] - e[1]) <= t;
}
function ar(i, e, t) {
  return ae(t, i[0] / e[0], i[1] / e[1]);
}
function Kc(i) {
  return ae(i, 0, 0);
}
function Zc(i, e) {
  e = e || new Array(i.length * 2);
  for (let t = 0, n = 0, s = i.length; t < s; ++t, n += 2) {
    const r = i[t];
    e[n] = r[0], e[n + 1] = r[1];
  }
  return e;
}
function Jc(i, e) {
  return ae(e, Ot(i[0]), Ot(i[1]));
}
function yo(i, e) {
  return ae(e, 1 / i[0], 1 / i[1]);
}
function el(i, e, t) {
  return ae(t, St(i[0], e[0]), St(i[1], e[1]));
}
function tl(i, e, t) {
  return ae(t, Ct(i[0], e[0]), Ct(i[1], e[1]));
}
function _e(i, e, t) {
  return ae(t, i[0] * e, i[1] * e);
}
function we(i, e, t) {
  const n = t || new Array(2);
  return n[0] = i[0] - e[0], n[1] = i[1] - e[1], n;
}
function il(i, e, t) {
  return ae(t, i[0] * e[0], i[1] * e[1]);
}
function nl(i, e) {
  const t = ln(i);
  return ae(e, i[0] / t, i[1] / t);
}
function ss(i, e) {
  return i[0] * e[0] + i[1] * e[1];
}
function du(i, e) {
  return i[0] * e[0] - i[1] * e[1];
}
function fu(i, e) {
  return i[0] * e[1] - i[1] * e[0];
}
function pu(i, e) {
  return ae(e, i[1], i[0]);
}
function sl(i, e, t, n) {
  return Ui(_e(we(e, i), t), i, n);
}
function ln(i) {
  return rl(i[0], i[1]);
}
function rl(i, e) {
  return mo(i * i + e * e);
}
function Eo(i, ...e) {
  let t;
  if (e = e || [], Array.isArray(i) ? t = i.slice(0, 2) : t = [i], t.length < 2)
    for (let n = 0, s = e.length; n < s && t.length < 2; ++n) {
      const r = e[n];
      Array.isArray(r) ? t.push(...r.slice(0, 2 - t.length)) : t.push(r);
    }
  for (; t.length < 2; ) t.push(0);
  return t;
}
function fe(i, e, t, n) {
  return i = i || new Array(3), i[0] = e, i[1] = t, i[2] = n, i;
}
function ni(i, e, t) {
  return fe(
    t,
    i[0] + e[0],
    i[1] + e[1],
    i[2] + e[2]
  );
}
function ol(i, e) {
  return fe(e, Lt(i[0]), Lt(i[1]), Lt(i[2]));
}
function ct(i, e) {
  return fe(e, i[0], i[1], i[2]);
}
function $s(i, e) {
  return i[0] === e[0] && i[1] === e[1] && i[2] === e[2];
}
function gu(i, e, t) {
  return Nt(i[0] - e[0]) <= t && Nt(i[1] - e[1]) <= t && Nt(i[2] - e[2]) <= t;
}
function Cn(i) {
  return fe(i, 0, 0, -1);
}
function tt(i, e, t) {
  return t = t || new Array(3), t[0] = i[1] * e[2] - i[2] * e[1], t[1] = i[2] * e[0] - i[0] * e[2], t[2] = i[0] * e[1] - i[1] * e[0], t;
}
function cr(i, e, t) {
  return fe(
    t,
    i[0] / e[0],
    i[1] / e[1],
    i[2] / e[2]
  );
}
function al(i) {
  return fe(i, 0, 0, 0);
}
function cl(i, e) {
  e = e || new Array(i.length * 3);
  for (let t = 0, n = 0, s = i.length; t < s; ++t, n += 3) {
    const r = i[t];
    e[n] = r[0], e[n + 1] = r[1], e[n + 2] = r[2];
  }
  return e;
}
function ll(i, e) {
  return fe(e, Ot(i[0]), Ot(i[1]), Ot(i[2]));
}
function Jn(i, e) {
  return fe(e, 1 / i[0], 1 / i[1], 1 / i[2]);
}
function ut(i, e, t) {
  return fe(t, i[0] * e, i[1] * e, i[2] * e);
}
function Jt(i, e, t) {
  return fe(
    t,
    i[0] - e[0],
    i[1] - e[1],
    i[2] - e[2]
  );
}
function hl(i, e, t) {
  return fe(
    t,
    i[0] * e[0],
    i[1] * e[1],
    i[2] * e[2]
  );
}
function ul(i, e, t, n) {
  return ni(ut(Jt(e, i), t), i, n);
}
function Ro(i) {
  return dl(i[0], i[1], i[2]);
}
function dl(i, e, t) {
  return mo(i * i + e * e + t * t);
}
function _o(i, e, t) {
  return fe(
    t,
    St(i[0], e[0]),
    St(i[1], e[1]),
    St(i[2], e[2])
  );
}
function Ao(i, e, t) {
  return fe(
    t,
    Ct(i[0], e[0]),
    Ct(i[1], e[1]),
    Ct(i[2], e[2])
  );
}
function pt(i, e) {
  e = e || new Array(3);
  const t = Ro(i);
  return e[0] = i[0] / t, e[1] = i[1] / t, e[2] = i[2] / t, e;
}
function Ws(i, e) {
  return i[0] * e[0] + i[1] * e[1] + i[2] * e[2];
}
function mu(i, e) {
  return i[0] * e[0] - i[1] * e[1] - i[2] * e[2];
}
function xu(i, e) {
  return fe(e, i[2], i[1], i[0]);
}
function on(i, ...e) {
  let t;
  if (e = e || [], Array.isArray(i) ? t = i.slice(0, 3) : t = [i], t.length < 3)
    for (let n = 0, s = e.length; n < s && t.length < 3; ++n) {
      const r = e[n];
      Array.isArray(r) ? t.push(...r.slice(0, 3 - t.length)) : t.push(r);
    }
  for (; t.length < 3; ) t.push(0);
  return t;
}
function vu(i, e, t) {
  return t = t || [0, 0, 0], pt(tt(tt(i, e), i), t);
}
function bu(i, e, t) {
  return t = t || [0, 0, 0], pt(tt(i, e), t);
}
function wu(i, e, t) {
  return t = t || [0, 0, 0], pt(tt(e, i), t);
}
function Tu(i, e, t) {
  return t = t || [0, 0, 0], pt(tt(i, tt(i, e)), t);
}
function ce(i, e, t, n, s) {
  return i = i || new Array(4), i[0] = e, i[1] = t, i[2] = n, i[3] = s, i;
}
function Io(i, e, t) {
  return ce(
    t,
    i[0] + e[0],
    i[1] + e[1],
    i[2] + e[2],
    i[3] + e[3]
  );
}
function yu(i, e, t) {
  return ce(
    t,
    i[0] + e[0],
    i[1] + e[1],
    i[2] + e[2],
    i[3]
  );
}
function fl(i, e) {
  return ce(e, Lt(i[0]), Lt(i[1]), Lt(i[2]), Lt(i[3]));
}
function ei(i, e) {
  return ce(e, i[0], i[1], i[2], i[3]);
}
function Mo(i, e) {
  return i[0] === e[0] && i[1] === e[1] && i[2] === e[2] && i[3] === e[3];
}
function Eu(i, e, t) {
  return Nt(i[0] - e[0]) <= t && Nt(i[1] - e[1]) <= t && Nt(i[2] - e[2]) <= t && Nt(i[3] - e[3]) <= t;
}
function pl(i) {
  return ce(i, 0, 0, -1, 0);
}
function gl(i, e, t) {
  return ce(t, 0, 0, 0, 1);
}
function ml(i, e, t) {
  return ce(
    t,
    i[0] / e[0],
    i[1] / e[1],
    i[2] / e[2],
    i[3] / e[3]
  );
}
function xl(i) {
  return ce(i, 0, 0, 0, 0);
}
function So(i, e) {
  e = e || new Array(4);
  for (let t = 0, n = 0, s = i.length; t < s; ++t, n += 4) {
    const r = i[t];
    e[n] = r[0], e[n + 1] = r[1], e[n + 2] = r[2], e[n + 3] = r[3];
  }
  return e;
}
function vl(i, e) {
  return ce(
    e,
    Ot(i[0]),
    Ot(i[1]),
    Ot(i[2]),
    Ot(i[3])
  );
}
function bl(i, e) {
  return ce(e, 1 / i[0], 1 / i[1], 1 / i[2], 1 / i[3]);
}
function Co(i, e, t) {
  return ce(
    t,
    i[0] * e,
    i[1] * e,
    i[2] * e,
    i[3] * e
  );
}
function Oo(i, e, t) {
  return ce(
    t,
    i[0] - e[0],
    i[1] - e[1],
    i[2] - e[2],
    i[3] - e[3]
  );
}
function wl(i, e, t) {
  return ce(
    t,
    i[0] * e[0],
    i[1] * e[1],
    i[2] * e[2],
    i[3] * e[3]
  );
}
function Lo(i, e) {
  return i[0] * e[0] + i[1] * e[1] + i[2] * e[2] + i[3] * e[3];
}
function Ru(i, e) {
  return i[0] * e[0] - i[1] * e[1] - i[2] * e[2] - i[3] * e[3];
}
function _u(i, e) {
  return ce(e, i[3], i[2], i[1], i[0]);
}
function Tl(i, e, t, n) {
  return Io(Co(Oo(e, i), t), i, n);
}
function No(i) {
  return Ni(i[0], i[1], i[2], i[3]);
}
function Ni(i, e, t, n) {
  return mo(i * i + e * e + t * t + n * n);
}
function yl(i, e, t) {
  return ce(
    t,
    St(i[0], e[0]),
    St(i[1], e[1]),
    St(i[2], e[2]),
    St(i[3], e[3])
  );
}
function El(i, e, t) {
  return ce(
    t,
    Ct(i[0], e[0]),
    Ct(i[1], e[1]),
    Ct(i[2], e[2]),
    Ct(i[3], e[3])
  );
}
function Rl(i, e) {
  const t = No(i);
  return ce(
    e,
    i[0] / t,
    i[1] / t,
    i[2] / t,
    i[3] / t
  );
}
function js(i, ...e) {
  let t;
  if (e = e || [], Array.isArray(i) ? t = i.slice(0, 4) : t = [i], t.length < 4)
    for (let n = 0, s = e.length; n < s && t.length < 4; ++n) {
      const r = e[n];
      Array.isArray(r) ? t.push(...r.slice(0, 4 - t.length)) : t.push(r);
    }
  for (; t.length < 4; ) t.push(0);
  return t;
}
function Au(i, e) {
  return e = e || [0, 0, 0, 0], ce(
    e,
    ((i & 16711680) >> 16) / 255,
    ((i & 65280) >> 8) / 255,
    (i & 255) / 255,
    1
  );
}
function Iu(i, e) {
  return e = e || [0, 0, 0, 0], ce(
    e,
    ((i & 4278190080) >> 24) / 255,
    ((i & 16711680) >> 16) / 255,
    ((i & 65280) >> 8) / 255,
    (i & 255) / 255
  );
}
function _l(i, e, t, n) {
  n = n || [0, 0, 0, 0];
  const s = [0, 0, 0, 0];
  let r, o, a, c, l;
  return o = i[1] * e[1] + i[2] * e[2] + i[3] * e[3] + i[0] * e[0], o < 0 ? (o = -o, s[0] = -e[0], s[1] = -e[1], s[2] = -e[2], s[3] = -e[3]) : (s[0] = e[0], s[1] = e[1], s[2] = e[2], s[3] = e[3]), 1 - o > 1e-7 ? (r = su(o), a = Ar(r), c = Ar((1 - t) * r) / a, l = Ar(t * r) / a) : (c = 1 - t, l = t), n[1] = c * i[1] + l * s[1], n[2] = c * i[2] + l * s[2], n[3] = c * i[3] + l * s[3], n[0] = c * i[0] + l * s[0], n;
}
const Al = {
  add: xo,
  ceil: Cc,
  copy: Lc,
  compare: Oc,
  cross: Pc,
  divide: Bc,
  dot: Wc,
  empty: Dc,
  flatten: Uc,
  floor: kc,
  forward: Nc,
  inverse: Fc,
  length: Hc,
  linear: jc,
  max: zc,
  min: Gc,
  multiply: Vc,
  normalize: $c,
  scale: vo,
  subtract: bo,
  vec: Xc
}, Il = {
  add: Ui,
  ceil: Qc,
  copy: wo,
  compare: To,
  cross: qc,
  divide: ar,
  dot: ss,
  empty: Kc,
  flatten: Zc,
  floor: Jc,
  forward: Yc,
  inverse: yo,
  length: ln,
  linear: sl,
  max: el,
  min: tl,
  multiply: il,
  normalize: nl,
  scale: _e,
  subtract: we,
  vec: Eo
}, Ml = {
  add: ni,
  ceil: ol,
  copy: ct,
  compare: $s,
  cross: tt,
  divide: cr,
  dot: Ws,
  empty: al,
  flatten: cl,
  floor: ll,
  forward: Cn,
  inverse: Jn,
  length: Ro,
  linear: ul,
  max: _o,
  min: Ao,
  multiply: hl,
  normalize: pt,
  scale: ut,
  subtract: Jt,
  vec: on
}, Sl = {
  add: Io,
  ceil: fl,
  copy: ei,
  compare: Mo,
  cross: gl,
  divide: ml,
  dot: Lo,
  empty: xl,
  flatten: So,
  floor: vl,
  forward: pl,
  inverse: bl,
  length: No,
  linear: Tl,
  max: yl,
  min: El,
  multiply: wl,
  normalize: Rl,
  scale: Co,
  subtract: Oo,
  vec: js,
  slerpQuat: _l
};
function D(i) {
  let e;
  return i.length === 1 ? (e = Al, e) : i.length === 2 ? (e = Il, e) : i.length === 3 ? (e = Ml, e) : (e = Sl, e);
}
function Mu(i) {
  return `[${i[0]}]`;
}
function Su(i) {
  return `[${i[0]}, ${i[1]}]`;
}
function Cu(i) {
  return `[${i[0]}, ${i[1]}, ${i[2]}]`;
}
function Ou(i) {
  return `[${i[0]}, ${i[1]}, ${i[2]}, ${i[3]}]`;
}
const Lu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  V3R: Ve,
  V4R: ru,
  VecMath: D,
  add1: xo,
  add2: Ui,
  add3: ni,
  add4: Io,
  add4by3: yu,
  apply1: Fe,
  apply2: ae,
  apply3: fe,
  apply4: ce,
  ceil1: Cc,
  ceil2: Qc,
  ceil3: ol,
  ceil4: fl,
  color4FromHex3: Au,
  color4FromHex4: Iu,
  compare1: Oc,
  compare2: To,
  compare3: $s,
  compare4: Mo,
  copy1: Lc,
  copy2: wo,
  copy3: ct,
  copy4: ei,
  cross1: Pc,
  cross2: qc,
  cross3: tt,
  cross4: gl,
  divide1: Bc,
  divide2: ar,
  divide3: cr,
  divide4: ml,
  dot1: Wc,
  dot2: ss,
  dot3: Ws,
  dot4: Lo,
  down3: Tu,
  empty1: Dc,
  empty2: Kc,
  empty3: al,
  empty4: xl,
  flatten1: Uc,
  flatten2: Zc,
  flatten3: cl,
  flatten4: So,
  floor1: kc,
  floor2: Jc,
  floor3: ll,
  floor4: vl,
  forward1: Nc,
  forward2: Yc,
  forward3: Cn,
  forward4: pl,
  fuzzyCompare1: cu,
  fuzzyCompare2: uu,
  fuzzyCompare3: gu,
  fuzzyCompare4: Eu,
  inverse1: Fc,
  inverse2: yo,
  inverse3: Jn,
  inverse4: bl,
  isVec1: ou,
  isVec2: Sc,
  isVec3: au,
  isVec4: F,
  left3: wu,
  length1: Hc,
  length1Components: hu,
  length2: ln,
  length2Components: rl,
  length3: Ro,
  length3Components: dl,
  length4: No,
  length4Components: Ni,
  linear1: jc,
  linear2: sl,
  linear3: ul,
  linear4: Tl,
  max1: zc,
  max2: el,
  max3: _o,
  max4: yl,
  min1: Gc,
  min2: tl,
  min3: Ao,
  min4: El,
  multiply1: Vc,
  multiply2: il,
  multiply3: hl,
  multiply4: wl,
  normalize1: $c,
  normalize2: nl,
  normalize3: pt,
  normalize4: Rl,
  reverse2: pu,
  reverse3: xu,
  reverse4: _u,
  right3: bu,
  scale1: vo,
  scale2: _e,
  scale3: ut,
  scale4: Co,
  slerpQuat: _l,
  subtract1: bo,
  subtract2: we,
  subtract3: Jt,
  subtract4: Oo,
  toString1: Mu,
  toString2: Su,
  toString3: Cu,
  toString4: Ou,
  tod1: lu,
  tod2: du,
  tod3: mu,
  tod4: Ru,
  tod_flip2: fu,
  up3: vu,
  vec1: Xc,
  vec1Methods: Al,
  vec2: Eo,
  vec2Methods: Il,
  vec3: on,
  vec3Methods: Ml,
  vec4: js,
  vec4Methods: Sl
}, Symbol.toStringTag, { value: "Module" }));
class Zi {
  constructor(e) {
    this.isInvalid = !1, this._uid = U(), this._validFramebuffer = !1, this._disabledTargets = /* @__PURE__ */ new Set(), this.retainTextureTargets = !1, this._buffers = {
      color: Array.isArray(e.buffers.color) ? e.buffers.color.slice(0) : e.buffers.color,
      depth: e.buffers.depth,
      stencil: e.buffers.stencil
    }, this._width = e.width || 0, this._height = e.height || 0, this.retainTextureTargets = e.retainTextureTargets || !1, this.calculateDimensions();
  }
  /** UID for the object */
  get uid() {
    return this._uid;
  }
  /** The buffer settings utilized in rendering this target */
  get buffers() {
    return {
      color: Array.isArray(this._buffers.color) ? this._buffers.color.slice(0) : this._buffers.color,
      depth: this._buffers.depth,
      stencil: this._buffers.stencil
    };
  }
  /**
   * The height of the render target. This is automatically set if any of the
   * buffers are a Texture object. Otherwise, this reflects the value provided
   * in the options.
   */
  get height() {
    return this._height;
  }
  /**
   * The width of the render target. This is automatically set if any of the
   * buffers are a Texture object. Otherwise, this reflects the value provided
   * in the options.
   */
  get width() {
    return this._width;
  }
  /**
   * This is a flag indicating if the render target passed it's frame buffer
   * status check
   */
  get validFramebuffer() {
    return this._validFramebuffer;
  }
  /**
   * This allows outputTargets to be specified as disabled so they will not
   * receive rendering output.
   */
  get disabledTargets() {
    return this._disabledTargets;
  }
  set disabledTargets(e) {
    this._disabledTargets = e;
  }
  /**
   * This analyzes the buffers for Textures to infer the width and height. This
   * also ensures all Texture objects are the same size to prevent errors.
   */
  calculateDimensions() {
    const e = [];
    if (this._buffers.color instanceof ee)
      e.push(this._buffers.color);
    else if (Array.isArray(this._buffers.color))
      for (let t = 0, n = this._buffers.color.length; t < n; ++t) {
        const s = this._buffers.color[t];
        s.buffer instanceof ee && e.push(s.buffer);
      }
    else this._buffers.color && this._buffers.color.buffer instanceof ee && e.push(this._buffers.color.buffer);
    if (this._buffers.depth instanceof ee && e.push(this._buffers.depth), this._buffers.stencil instanceof ee && e.push(this._buffers.stencil), e.length > 0 && e[0].data) {
      const { width: t, height: n } = e[0].data;
      for (let s = 0, r = e.length; s < r; ++s) {
        const o = e[s];
        if (!o.data) {
          console.warn(
            "A texture specified for thie RenderTarget did not have any data associated with it."
          );
          return;
        }
        const { width: a, height: c } = o.data;
        (a !== t || c !== n) && (console.warn(
          "Texture applied to the render target is invalid as it does not match dimensions of all textures applied:",
          o,
          e,
          "The texture will be removed as a target for the render target"
        ), this.removeTextureFromBuffer(o));
      }
      this._width = t, this._height = n;
    }
    (!this._width || !this._height) && console.warn(
      "A RenderTarget was not able to establish valid dimensions. This target had no texture buffers and did not specify valid width and height values.",
      this
    );
  }
  /**
   * Free all resources associated with this render target.
   */
  dispose() {
    this.gl && this.gl.proxy.disposeRenderTarget(this);
  }
  /**
   * Retrieves all color buffers associated with this target and returns them as
   * a guaranteed list.
   */
  getBuffers() {
    return Array.isArray(this.buffers.color) ? this.buffers.color : this.buffers.color ? [this.buffers.color] : [];
  }
  /**
   * Retrieves all generated GL buffers associated with this target and returns
   * them as a guaranteed list.
   *
   * NOTE: This is NOT intended to be used outside of the GL rendering portions
   * of the application. Messing with this or it's return values is EXTREMELY
   * unadvised unless you absolutely know what you are doing. COnsider being
   * safer with getBuffers instead.
   */
  getGLBuffers() {
    return this.gl ? Array.isArray(this.gl.colorBufferId) ? this.gl.colorBufferId : [this.gl.colorBufferId] : (this.isInvalid || console.warn(
      "Attempted to retrieve gl buffers before the render target was compiled."
    ), []);
  }
  /**
   * Gets an ordered list of all output types this render target handles.
   */
  getOutputTypes() {
    return this.getBuffers().map((e) => e.outputType);
  }
  /**
   * Retrieves the size of this render target (All buffers for this target will
   * match these dimensions).
   */
  getSize() {
    return [this._width, this._height];
  }
  /**
   * Retrieves all of the textures associated with this render target
   */
  getTextures() {
    const e = [];
    return Array.isArray(this.buffers.color) ? this.buffers.color.forEach((t) => {
      t.buffer instanceof ee && e.push(t.buffer);
    }) : this.buffers.color && this.buffers.color.buffer instanceof ee && e.push(this.buffers.color.buffer), this.buffers.depth instanceof ee && e.push(this.buffers.depth), this.buffers.stencil instanceof ee && e.push(this.buffers.stencil), e;
  }
  /**
   * This is a simple check to see if this render target is merely a color
   * buffer target type. This is a useful check for the renderer as being a
   * simple single color buffer target has implications to matching the render
   * target to materials.
   */
  isColorTarget() {
    var e;
    if (Array.isArray(this.buffers.color)) {
      if (this.buffers.color.length === 1)
        return this.buffers.color[0].outputType === V.COLOR;
    } else
      return ((e = this.buffers.color) == null ? void 0 : e.outputType) === V.COLOR;
    return !1;
  }
  /**
   * Cleanses a texture from being used as a buffer
   */
  removeTextureFromBuffer(e) {
    var t;
    if (Array.isArray(this._buffers.color)) {
      const n = this._buffers.color.find((r) => r.buffer === e);
      if (!n) return;
      const s = this._buffers.color.indexOf(n);
      s > -1 && this._buffers.color.splice(s, 1);
    } else ((t = this._buffers.color) == null ? void 0 : t.buffer) === e && delete this._buffers.color;
    this._buffers.depth === e && delete this._buffers.depth, this._buffers.stencil === e && delete this._buffers.stencil;
  }
  /**
   * Changes the size of this render target. This is a VERY costly operation. It
   * will delete all existing buffers associated with this target. Change the
   * intended size of each buffer / texture, then cause the buffer / texture to
   * get recreated with the new size settings.
   *
   * This operation clears any existing texture contents that may have existed.
   */
  setSize(e, t) {
    this.dispose(), this._width = e, this._height = t, this.getTextures().forEach((s) => {
      s.data = {
        buffer: null,
        height: t,
        width: e
      };
    });
  }
  /**
   * Flags this render target as having a valid framebuffer for rendering.
   */
  setAsValid() {
    this._validFramebuffer = !0;
  }
}
var Te = /* @__PURE__ */ ((i) => (i[i.FLOAT = 0] = "FLOAT", i[i.VEC2 = 1] = "VEC2", i[i.VEC3 = 2] = "VEC3", i[i.VEC4 = 3] = "VEC4", i[i.VEC4_ARRAY = 4] = "VEC4_ARRAY", i[i.FLOAT_ARRAY = 5] = "FLOAT_ARRAY", i[i.MATRIX3x3 = 6] = "MATRIX3x3", i[i.MATRIX4x4 = 7] = "MATRIX4x4", i[i.TEXTURE = 8] = "TEXTURE", i))(Te || {});
function Gx(i) {
  return i.type === 1;
}
function Vx(i) {
  return i.type === 2;
}
function $x(i) {
  return i.type === 3;
}
function Nu(i) {
  return i.type === 4;
}
function Wx(i) {
  return i.type === 6;
}
function jx(i) {
  return i.type === 7;
}
function Hx(i) {
  return i.type === 8;
}
function Xx(i) {
  return i.type === 0;
}
const Pu = window.OffscreenCanvas || go;
function In(i) {
  return i instanceof Pu;
}
var Rt = /* @__PURE__ */ ((i) => (i[i.INVALID = 0] = "INVALID", i[i.VALID = 1] = "VALID", i[i.NO_RENDER_TARGET_MATCHES = 2] = "NO_RENDER_TARGET_MATCHES", i))(Rt || {});
const va = ve("performance");
class Bu {
  /**
   * Generate a new state manager and establish some initial state settings by
   * querying the context.
   */
  constructor(e, t) {
    this.debugContext = "", this._textureUnitToTexture = /* @__PURE__ */ new Map(), this._freeTextureUnits = [], this._freeUniformBufferBindings = [], this._blendingEnabled = !0, this._blendDstFactor = x.Material.BlendingDstFactor.One, this._blendSrcFactor = x.Material.BlendingDstFactor.One, this._blendEquation = x.Material.BlendingEquations.Add, this._cullFace = x.Material.CullSide.NONE, this._colorMask = [!0, !0, !0, !0], this._clearColor = [0, 0, 0, 1], this._depthFunc = x.Material.DepthFunctions.ALWAYS, this._depthTestEnabled = !0, this._depthMask = !0, this._ditheringEnabled = !0, this._boundFBO = null, this._renderTarget = null, this._boundRBO = null, this._boundVAO = null, this._boundVBO = null, this._boundElementArrayBuffer = null, this._boundTexture = {
      id: null,
      unit: -1
    }, this._currentProgram = null, this._scissorTestEnabled = !1, this._scissorBounds = { x: 0, y: 0, width: 1, height: 1 }, this._currentUniforms = {}, this._activeTextureUnit = -1, this._drawBuffers = [], this._textureWillBeUsed = /* @__PURE__ */ new Map(), this._viewport = { x: 0, y: 0, width: 100, height: 100 }, this._enabledVertexAttributeArray = [], this._willUseVertexAttributeArray = [], this._vertexAttributeArrayDivisor = /* @__PURE__ */ new Map(), this.gl = e, this.extensions = t;
    const n = this.gl.getParameter(
      e.MAX_COMBINED_TEXTURE_IMAGE_UNITS
    );
    for (let r = 0; r < n; ++r)
      this._freeTextureUnits.push(Xh(e, r));
    const s = O.MAX_UNIFORM_BUFFER_BINDINGS;
    for (let r = 0; r < s; ++r)
      this._freeUniformBufferBindings.push(r);
    this._activeTextureUnit = e.TEXTURE0;
  }
  /** Indicates if blending is enabled */
  get blendingEnabled() {
    return this._blendingEnabled;
  }
  /** The current destination factor used in the blending equation */
  get blendDstFactor() {
    return this._blendDstFactor;
  }
  /** The current destination factor used in the blending equation */
  get blendSrcFactor() {
    return this._blendSrcFactor;
  }
  /** The current equation used in the blend mode */
  get blendEquation() {
    return this._blendEquation;
  }
  /** Indicates which faces will be culled */
  get cullFace() {
    return this._cullFace;
  }
  /** The channels in the color buffer a fragment is allowed to write to */
  get colorMask() {
    return this._colorMask;
  }
  /** The current color the context will clear when clear with the color buffer bit is called */
  get clearColor() {
    return this._clearColor;
  }
  /** Comparator used when testing a fragment against the depth buffer */
  get depthFunc() {
    return this._depthFunc;
  }
  /** Indicates if fragments are tested against the depth buffer or not */
  get depthTestEnabled() {
    return this._depthTestEnabled;
  }
  /** Indicates if the fragment will write to the depth buffer or not */
  get depthMask() {
    return this._depthMask;
  }
  /** Indicates if dithering is enabled */
  get ditheringEnabled() {
    return this._ditheringEnabled;
  }
  /** The currently bound frame buffer object. null if nothing bound. */
  get boundFBO() {
    return this._boundFBO;
  }
  /**
   * This is the current render target who's FBO is bound. A null render target
   * indicates the target is the screen.
   */
  get renderTarget() {
    return this._renderTarget;
  }
  /** The currently bound render buffer object. null if nothing bound. */
  get boundRBO() {
    return this._boundRBO;
  }
  /** The current id of the current bound vao. If null, nothing is bound */
  get boundVAO() {
    return this._boundVAO;
  }
  /** The current id of the current bound vbo. If null, nothing is bound */
  get boundVBO() {
    return this._boundVBO;
  }
  /**
   * The current id of the current bound element array buffer. If null, nothing
   * is bound
   */
  get boundElementArrayBuffer() {
    return this._boundElementArrayBuffer;
  }
  /**
   * The current texture object bound. If null, nothing is bound. This also tracks
   * the texture unit to which it was bound. The unit and the texture object must match for
   * a binding call to be skipped.
   */
  get boundTexture() {
    return this._boundTexture;
  }
  /** The current program in use */
  get currentProgram() {
    return this._currentProgram;
  }
  /** Indicates if the scissor test is enabled in the context */
  get scissorTestEnabled() {
    return this._scissorTestEnabled;
  }
  /** The current bounds of the scissor test */
  get scissorBounds() {
    return this._scissorBounds;
  }
  /** These are the current uniforms uploaded to the GPU */
  get currentUniforms() {
    return this._currentUniforms;
  }
  /** This is the texture unit currently active */
  get activeTextureUnit() {
    return this._activeTextureUnit;
  }
  /** This is the buffer state set and activated for the drawBuffers call */
  get drawBuffers() {
    return this._drawBuffers;
  }
  /**
   * This contains all of the textures that are are needing to be utilized for
   * next draw. Textures are used by either uniforms or by RenderTargets in a
   * single draw call. Thus we track the uniforms or the render targets awaiting
   * use of the texture.
   */
  get textureWillBeUsed() {
    return this._textureWillBeUsed;
  }
  /** The current viewport gl is using */
  get viewport() {
    return this._viewport;
  }
  /** This contains all of the currently enabled vertex attribute pointers */
  get enabledVertexAttributeArray() {
    return this._enabledVertexAttributeArray.slice(0).filter((e) => e !== void 0);
  }
  /**
   * Sets the provided vertex array as the current bound item.
   */
  bindVAO(e) {
    this._boundVAO !== e && (this._boundVAO = e, this.extensions.vao && (this.extensions.vao instanceof WebGL2RenderingContext ? this.extensions.vao.bindVertexArray(e) : this.extensions.vao.bindVertexArrayOES(e)));
  }
  /**
   * Sets the provided buffer identifier as the current bound item.
   */
  bindVBO(e) {
    this._boundVBO !== e && (this._boundVBO = e, this.gl.bindBuffer(this.gl.ARRAY_BUFFER, e));
  }
  /**
   * Sets the provided buffer identifier as the current bound
   * ELEMENT_ARRAY_BUFFER.
   */
  bindElementArrayBuffer(e) {
    this._boundElementArrayBuffer !== e && (this._boundElementArrayBuffer = e, this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, e));
  }
  /**
   * Sets the provided buffer identifier as the current bound item
   */
  bindRBO(e) {
    this._boundRBO !== e && (this._boundRBO = e, this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, e));
  }
  /**
   * Sets the provided buffer identifier as the current bound item
   */
  bindFBO(e) {
    this._boundFBO !== e && (this._boundFBO = e, this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, e));
  }
  /**
   * Sets the provided buffer identifier as the current bound item. This
   * automatically updates all stateful information to track that a texture is
   * now utilizing a texture unit.
   */
  bindTexture(e, t) {
    if (!(!e.gl || !e.gl.textureId) && (!e || this._boundTexture.id !== e.gl.textureId || this._boundTexture.unit !== this._activeTextureUnit)) {
      switch (this._boundTexture = {
        id: e.gl.textureId,
        unit: this._activeTextureUnit
      }, t) {
        case x.Texture.TextureBindingTarget.TEXTURE_2D:
          this.gl.bindTexture(this.gl.TEXTURE_2D, e.gl.textureId);
          break;
        case x.Texture.TextureBindingTarget.CUBE_MAP:
          this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, e.gl.textureId);
          break;
      }
      const n = this._textureUnitToTexture.get(this._activeTextureUnit);
      n && n.gl && (n.gl.textureUnit = -1), this._textureUnitToTexture.set(this._activeTextureUnit, e), e.gl.textureUnit = this._activeTextureUnit;
    }
  }
  /**
   * Disables all vertex attribute array indices enabled
   */
  disableVertexAttributeArray() {
    for (let e = 0, t = this._enabledVertexAttributeArray.length; e < t; ++e) {
      const n = this._enabledVertexAttributeArray[e];
      this.gl.disableVertexAttribArray(n);
    }
    this._enabledVertexAttributeArray = [], this._willUseVertexAttributeArray = [], this._vertexAttributeArrayDivisor.clear();
  }
  /**
   * Flags an attribute array as going to be used. Any attribute array location
   * no longer in use will be disabled when applyVertexAttributeArrays is
   * called.
   */
  willUseVertexAttributeArray(e) {
    this._willUseVertexAttributeArray[e] = e, this._enabledVertexAttributeArray[e] === void 0 && (this._enabledVertexAttributeArray[e] = e, this.gl.enableVertexAttribArray(e));
  }
  /**
   * This enables the necessary vertex attribute arrays.
   */
  applyVertexAttributeArrays() {
    for (let e = 0, t = this._enabledVertexAttributeArray.length; e < t; ++e) {
      const n = this._enabledVertexAttributeArray[e];
      if (n !== void 0) {
        if (this._willUseVertexAttributeArray[n] !== void 0) return;
        this.gl.disableVertexAttribArray(n), delete this._enabledVertexAttributeArray[n];
      }
    }
    this._willUseVertexAttributeArray = [];
  }
  /**
   * Applies (if necessary) the divisor for a given array. This only works if
   * the array location is enabled.
   */
  setVertexAttributeArrayDivisor(e, t) {
    this.extensions.instancing && this._enabledVertexAttributeArray[e] !== void 0 && this._vertexAttributeArrayDivisor.get(e) !== t && (this.extensions.instancing instanceof WebGL2RenderingContext ? this.extensions.instancing.vertexAttribDivisor(e, t) : this.extensions.instancing.vertexAttribDivisorANGLE(e, t), this._vertexAttributeArrayDivisor.set(e, t));
  }
  /**
   * This takes a texture and flags it's texture unit as freed if the texture
   * has a used unit
   */
  freeTextureUnit(e) {
    e.gl && e.gl.textureUnit > -1 && (this.setActiveTextureUnit(e.gl.textureUnit), this.gl.bindTexture(this.gl.TEXTURE_2D, null), this._boundTexture.id = null, this._boundTexture.unit = -1, this._textureUnitToTexture.set(e.gl.textureUnit, null), this._freeTextureUnits.unshift(e.gl.textureUnit), e.gl.textureUnit = -1);
  }
  /**
   * Changes the active texture unit to the provided unit.
   */
  setActiveTextureUnit(e) {
    this._activeTextureUnit !== e && (this._activeTextureUnit = e, this.gl.activeTexture(e));
  }
  /**
   * Changes the gl clear color state
   */
  setClearColor(e) {
    Mo(e, this._clearColor) || (this._clearColor = ei(e), this.applyClearColor());
  }
  /**
   * Change the drawBuffer state, if it's available
   *
   * 0 - n specifies COLOR_ATTACHMENT
   * -1 specifies NONE
   * -2 specifies BACK
   */
  setDrawBuffers(e, t) {
    let n = e.length !== this._drawBuffers.length;
    if (!n) {
      for (let s = 0, r = e.length; s < r; ++s)
        if (this._drawBuffers[s] !== e[s]) {
          n = !0;
          break;
        }
    }
    if (n) {
      if (this.glProxy.extensions.drawBuffers instanceof WebGL2RenderingContext)
        t || this.glProxy.extensions.drawBuffers.drawBuffers(e);
      else if (this.glProxy.extensions.drawBuffers)
        t || this.glProxy.extensions.drawBuffers.drawBuffersWEBGL(e);
      else {
        console.warn(
          "Attempted to use drawBuffers for MRT, but MRT is NOT supported by this hardware. Use multiple render targets instead"
        );
        return;
      }
      this._drawBuffers = e;
    }
  }
  /**
   * Sets the GPU proxy to be used to handle commands that call to the GPU but
   * don't alter global GL state.
   */
  setProxy(e) {
    this.glProxy = e;
  }
  /**
   * Enables or disables the scissor test
   */
  setScissor(e) {
    e ? (this._scissorTestEnabled || (this._scissorTestEnabled = !0, this.gl.enable(this.gl.SCISSOR_TEST)), (e.x !== this._scissorBounds.x || e.y !== this._scissorBounds.y || e.width !== this._scissorBounds.width || e.height !== this._scissorBounds.height) && (this._scissorBounds = e, this.applyScissorBounds())) : this._scissorTestEnabled && (this._scissorTestEnabled = !1, this.gl.disable(this.gl.SCISSOR_TEST));
  }
  /**
   * Applies a viewport to the given state
   */
  setViewport(e, t, n, s) {
    (e !== this._viewport.x || t !== this._viewport.y || n !== this._viewport.width || s !== this._viewport.height) && (this._viewport = { x: e, y: t, width: n, height: s }, this.applyViewport());
  }
  /**
   * Uses the program indicated
   */
  useProgram(e) {
    this._currentProgram !== e && (this._currentProgram = e, this.gl.useProgram(this._currentProgram));
  }
  /**
   * Sets all current gl state to match the materials settings.
   */
  useMaterial(e) {
    if (!e.gl && (!this.glProxy.compileMaterial(e) || !e.gl) || !e.gl.programId || e.gl.programId.length === 0)
      return Rt.INVALID;
    const t = this.findMaterialProgram(e);
    if (t === void 0)
      return console.warn(
        "Could NOT determine a program for the given material that would appropriately match with the current RenderTarget"
      ), Rt.NO_RENDER_TARGET_MATCHES;
    if (this._renderTarget && (e.gl.programByTarget.set(this._renderTarget, t), this.glProxy.extensions.drawBuffers)) {
      const n = e.gl.outputsByProgram.get(t), s = this._renderTarget.getGLBuffers();
      if (!n || !s)
        return console.warn(
          "Could not establish the buffers to utilize for the render target"
        ), Rt.NO_RENDER_TARGET_MATCHES;
      const r = [];
      for (let o = 0, a = s.length; o < a; ++o) {
        const c = s[o];
        n.find(
          (h) => (c == null ? void 0 : c.outputType) === h
        ) === void 0 ? r.push(this.gl.NONE) : this._renderTarget.disabledTargets.has(
          (c == null ? void 0 : c.outputType) || 0
        ) ? r.push(this.gl.NONE) : r.push((c == null ? void 0 : c.attachment) ?? this.gl.NONE);
      }
      this.setDrawBuffers(r);
    }
    return this.useProgram(t), this.syncMaterial(e), Rt.VALID;
  }
  /**
   * This examines a given material to find the most appropriate program to run
   * based on the current RenderTarget
   */
  findMaterialProgram(e) {
    if (!e.gl) return;
    if (!this._renderTarget || this._renderTarget.isColorTarget()) {
      let a;
      if (this._renderTarget && (a = e.gl.programByTarget.get(this._renderTarget), a !== void 0))
        return a;
      let c = Number.MAX_SAFE_INTEGER;
      for (let l = 0, h = e.gl.programId.length; l < h; ++l) {
        const u = e.gl.programId[l];
        u.outputTypes.length < c && u.outputTypes.indexOf(V.COLOR) >= 0 && (a = u.id, c = u.outputTypes.length);
      }
      return a || (a = e.gl.programId[e.gl.programId.length - 1]), a;
    }
    let t = e.gl.programByTarget.get(
      this._renderTarget
    );
    if (t !== void 0) return t;
    const n = /* @__PURE__ */ new Set(), s = this._renderTarget.getBuffers();
    for (let a = 0, c = s.length; a < c; ++a) {
      const l = s[a];
      l && n.add(l.outputType);
    }
    let r = 0, o = [];
    for (let a = 0, c = e.gl.programId.length; a < c; ++a) {
      const l = e.gl.programId[a];
      let h = 0;
      for (let u = 0, d = l.outputTypes.length; u < d; ++u) {
        const f = l.outputTypes[u];
        n.has(f) && h++;
      }
      h > r ? (r = h, o = [l]) : h === r && o.push(l);
    }
    if (o.length !== 0)
      return o.length === 1 ? t = o[0].id : o.length > 1 && (t = o.reduce(
        (a, c) => c.outputTypes.length < a.outputTypes.length ? c : a
      )), t;
  }
  /**
   * Sets all current gl state to match the render target specified
   */
  useRenderTarget(e) {
    if (!e)
      return this.bindFBO(null), this._renderTarget = null, !0;
    const t = e.getTextures();
    for (let n = 0, s = t.length; n < s; ++n) {
      const r = t[n];
      r && this.freeTextureUnit(r);
    }
    return e.gl ? (this.bindFBO(e.gl.fboId), this._renderTarget = e, !0) : !1;
  }
  /**
   * This syncs the state of the GL context with the requested state of a
   * material
   */
  syncMaterial(e) {
    return this.setDepthMask(e.depthWrite), this.setDepthTest(e.depthTest), this.setDepthFunc(e.depthFunc), this.setBlending(e.blending), this.setCullFace(e.culling), this.setColorMask(e.colorWrite), this.setDithering(e.dithering), this._currentUniforms = e.uniforms, !(!this._currentProgram || (Object.entries(e.uniforms).forEach((t) => {
      const { 0: n, 1: s } = t;
      if (!this._currentProgram) return;
      s.gl || (s.gl = /* @__PURE__ */ new Map());
      let r = s.gl.get(this._currentProgram);
      if (!r) {
        const o = this.gl.getUniformLocation(this._currentProgram, n);
        if (!o) {
          r = {
            location: void 0
          }, va(
            this.debugContext,
            `A Material specified a uniform ${n}, but none was found in the current program.`
          );
          return;
        }
        r = {
          location: o
        }, s.gl.set(this._currentProgram, r);
      }
      r.location && this.uploadUniform(r.location, s);
    }), Object.entries(e.uniformBuffers).forEach((t) => {
      const { 0: n, 1: s } = t;
      this._currentProgram && this.useUniformBuffer(s);
    }), this._textureWillBeUsed.size > 0 && !this.applyUsedTextures()));
  }
  /**
   * Ensures the uniform buffer is bound to a binding point and ensures the
   * program in use links it's declared uniform structures to the binding point
   * as well.
   */
  useUniformBuffer(e) {
    return !!e.gl;
  }
  /**
   * Set masking for the depth
   */
  setDepthMask(e) {
    this._depthMask !== e && (this._depthMask = e, this.gl.depthMask(this._depthMask));
  }
  /**
   * Set the depth test enablement
   */
  setDepthTest(e) {
    this._depthTestEnabled !== e && (this._depthTestEnabled = e, this._depthTestEnabled ? this.gl.enable(this.gl.DEPTH_TEST) : this.gl.disable(this.gl.DEPTH_TEST));
  }
  /**
   * Set the depth function
   */
  setDepthFunc(e) {
    this._depthFunc !== e && (this._depthFunc = e, this.applyDepthFunc());
  }
  /**
   * Set the blend mode and settings.
   */
  setBlending(e) {
    e ? (this._blendingEnabled || (this.gl.enable(this.gl.BLEND), this._blendingEnabled = !0), (this._blendDstFactor !== e.blendDst || this._blendSrcFactor !== e.blendSrc || this._blendEquation !== e.blendEquation) && (this._blendDstFactor = e.blendDst || this._blendDstFactor, this._blendSrcFactor = e.blendSrc || this._blendSrcFactor, this._blendEquation = e.blendEquation || this._blendEquation, this.applyBlendFactors())) : this._blendingEnabled && (this.gl.disable(this.gl.BLEND), this._blendingEnabled = !1);
  }
  /**
   * Set whether or not dithering is enabled.
   */
  setDithering(e) {
    this._ditheringEnabled !== e && (this._ditheringEnabled = e, this._ditheringEnabled ? this.gl.enable(this.gl.DITHER) : this.gl.disable(this.gl.DITHER));
  }
  /**
   * Change the bit mask for color channels allowed to be written into.
   */
  setColorMask(e) {
    (this._colorMask[0] !== e[0] || this._colorMask[1] !== e[1] || this._colorMask[2] !== e[2] || this._colorMask[3] !== e[3]) && (this._colorMask = e, this.applyColorMask());
  }
  /**
   * Change the cull face state
   */
  setCullFace(e) {
    this._cullFace !== e && (this._cullFace = e, this.applyCullFace());
  }
  /**
   * Performs the upload operation of a uniform to the GL context
   */
  uploadUniform(e, t) {
    let n;
    switch (t.type) {
      case Te.FLOAT:
        n = t.data, this.gl.uniform1f(e, n);
        break;
      case Te.VEC2:
        n = t.data, this.gl.uniform2f(e, n[0], n[1]);
        break;
      case Te.VEC3:
        n = t.data, this.gl.uniform3f(e, n[0], n[1], n[2]);
        break;
      case Te.VEC4:
        n = t.data, this.gl.uniform4f(e, n[0], n[1], n[2], n[3]);
        break;
      case Te.VEC4_ARRAY:
        n = t.data, this.gl.uniform4fv(e, So(n));
        break;
      case Te.MATRIX3x3:
        n = t.data, this.gl.uniformMatrix3fv(e, !1, n);
        break;
      case Te.MATRIX4x4:
        n = t.data, this.gl.uniformMatrix4fv(e, !1, n);
        break;
      case Te.FLOAT_ARRAY:
        n = t.data, this.gl.uniform1fv(e, n);
        break;
      case Te.TEXTURE:
        n = t.data, this.willUseTextureUnit(n, e);
        break;
      default:
        console.warn(
          this.debugContext,
          "A uniform specified an unrecognized type. It will not sync with the GPU:",
          t
        );
    }
  }
  /**
   * This will consume the values aggregated within willUseTextureUnit. All
   * Texture objects consumed will be assigned an active texture unit (if one
   * was not already applied), then the Texture will be compiled / updated as
   * necessary and applied to all uniforms requiring a Sampler unit.
   */
  applyUsedTextures() {
    const e = this.assignTextureUnits(
      Array.from(this._textureWillBeUsed.keys())
    );
    e.forEach((s) => {
      s.gl ? s.gl.textureUnit = this.gl.TEXTURE0 : s.gl = {
        textureId: null,
        textureUnit: this.gl.TEXTURE0,
        proxy: this.glProxy
      };
    });
    const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
    return this._textureWillBeUsed.forEach((s, r) => {
      s instanceof Zi ? n.add(s) : t.set(r, s);
    }), n.forEach((s) => {
      s.getTextures().some((a) => {
        if (e.indexOf(a) < 0)
          this.glProxy.updateTexture(a);
        else return !0;
        return !1;
      }) ? console.warn(
        this.debugContext,
        "A RenderTarget can not be used because all of it's textures could not be compiled."
      ) : this.glProxy.compileRenderTarget(s);
    }), t.forEach((s, r) => {
      e.length === 0 || e.indexOf(r) < 0 ? (this.glProxy.updateTexture(r), s.forEach((o) => {
        this.uploadTextureToUniform(o, r);
      })) : s.forEach((o) => {
        this.gl.uniform1i(o, ua(this.gl, 0));
      });
    }), this._textureWillBeUsed.clear(), !0;
  }
  /**
   * Attempts to assign free or freed texture units to the provided texture
   * objects. This will return a list of textures that could not be assigned an
   * available unit.
   *
   * NOTE: This DOES NOT CHANGE THE Active unit texture state NOR does it bind
   * the textures yet. This is merely for figuring out which texture units the
   * texture SHOULD be assigned to.
   */
  assignTextureUnits(e) {
    const t = [], n = [];
    for (e.forEach((o) => {
      !o.gl || o.gl.textureUnit < 0 ? t.push(o) : n.push(o);
    }); this._freeTextureUnits.length > 0 && t.length > 0; ) {
      const o = t.shift();
      if (!o) continue;
      const a = this._freeTextureUnits.shift();
      if (a === void 0) {
        t.unshift(o);
        continue;
      }
      o.gl ? o.gl.textureUnit = a : o.gl = {
        textureId: null,
        textureUnit: a,
        proxy: this.glProxy
      }, n.push(o);
    }
    if (t.length <= 0)
      return t;
    va(
      "WARNING: Too many textures in use are causing texture units to be swapped. Doing this occasionally is fine, but handling this on a frame loop can have serious performance concerns."
    );
    const s = /* @__PURE__ */ new Map();
    this._textureUnitToTexture.forEach((o) => {
      o && s.set(o, !1);
    }), n.forEach((o) => {
      s.set(o, !0);
    });
    const r = [];
    if (s.forEach((o, a) => {
      o || r.push(a);
    }), r.length === 0)
      return console.warn(
        this.debugContext,
        "There are too many textures being used for a single draw call. These textures will not be utilized on the GPU",
        t
      ), console.warn("Current GL State:", this), t;
    for (; r.length > 0 && t.length > 0; ) {
      const o = t.shift();
      if (!o) continue;
      const a = r.shift();
      if (a === void 0 || !a.gl || a.gl.textureUnit < 0) {
        t.unshift(o);
        continue;
      }
      o.gl ? o.gl.textureUnit = a.gl.textureUnit : o.gl = {
        textureId: null,
        textureUnit: a.gl.textureUnit,
        proxy: this.glProxy
      }, n.push(o);
    }
    return t.length > 0 && (console.error(
      this.debugContext,
      "There are too many textures being used for a single draw call. These textures will not be utilized on the GPU",
      t
    ), console.warn("Current GL State:", this)), t;
  }
  /**
   * Applies the necessary value for a texture to be applied to a sampler
   * uniform.
   */
  uploadTextureToUniform(e, t) {
    t.gl && t.gl.textureUnit >= -1 ? (this._textureUnitToTexture.get(t.gl.textureUnit) !== t && (this.setActiveTextureUnit(t.gl.textureUnit), this.bindTexture(
      t,
      x.Texture.TextureBindingTarget.TEXTURE_2D
    )), this.gl.uniform1i(
      e,
      ua(this.gl, t.gl.textureUnit)
    )) : console.warn(
      this.debugContext,
      "Attempted to set a Texture Object to a uniform, but the Texture object did not have a valid texture unit.",
      t
    );
  }
  /**
   * This flags a texture as going to be used within the next upcoming draw call
   */
  willUseTextureUnit(e, t) {
    const n = this._textureWillBeUsed.get(e);
    t instanceof Zi ? n ? n instanceof Zi && n !== t && console.warn(
      this.debugContext,
      "A Texture is attempting to be used by two different render targets in a single draw."
    ) : this._textureWillBeUsed.set(e, t) : n ? n instanceof Zi ? console.warn(
      this.debugContext,
      "A texture in a single draw is attempting to attach to a uniform AND a render target which is invalid."
    ) : n.add(t) : this._textureWillBeUsed.set(e, /* @__PURE__ */ new Set([t]));
  }
  /**
   * This method applies ALL of the state elements monitored and force sets them with WebGL calls
   * to make sure the GPU is in the same state as this state object.
   */
  syncState() {
    const e = this.gl;
    this._blendingEnabled ? e.enable(e.BLEND) : e.disable(e.BLEND), this._ditheringEnabled ? e.enable(e.DITHER) : e.disable(e.DITHER), this._depthTestEnabled ? e.enable(e.DEPTH_TEST) : e.disable(e.DEPTH_TEST), this._scissorTestEnabled ? e.enable(e.SCISSOR_TEST) : e.disable(e.SCISSOR_TEST), this.setActiveTextureUnit(this._activeTextureUnit), this.applyClearColor(), this.applyCullFace(), this.applyBlendFactors(), this.applyBlendEquation(), this.applyColorMask(), this.applyDepthFunc(), this.applyScissorBounds(), this.applyViewport(), e.depthMask(this._depthMask);
  }
  /**
   * Applies the current clearColor to the gl state
   */
  applyClearColor() {
    this.gl.clearColor(
      this._clearColor[0],
      this._clearColor[1],
      this._clearColor[2],
      this._clearColor[3]
    );
  }
  /**
   * Applies the current depth function to the gl state
   */
  applyDepthFunc() {
    const e = this.gl;
    switch (this._depthFunc) {
      case x.Material.DepthFunctions.ALWAYS:
        e.depthFunc(e.ALWAYS);
        break;
      case x.Material.DepthFunctions.EQUAL:
        e.depthFunc(e.EQUAL);
        break;
      case x.Material.DepthFunctions.GREATER:
        e.depthFunc(e.GREATER);
        break;
      case x.Material.DepthFunctions.GREATER_OR_EQUAL:
        e.depthFunc(e.GEQUAL);
        break;
      case x.Material.DepthFunctions.LESS:
        e.depthFunc(e.LESS);
        break;
      case x.Material.DepthFunctions.LESS_OR_EQUAL:
        e.depthFunc(e.LEQUAL);
        break;
      case x.Material.DepthFunctions.NEVER:
        e.depthFunc(e.NEVER);
        break;
      case x.Material.DepthFunctions.NOTEQUAL:
        e.depthFunc(e.NOTEQUAL);
        break;
      default:
        e.depthFunc(e.ALWAYS);
        break;
    }
  }
  /**
   * Applies the current scissor bounds to the gl state
   */
  applyScissorBounds() {
    this.gl.scissor(
      this._scissorBounds.x,
      this._scissorBounds.y,
      this._scissorBounds.width,
      this._scissorBounds.height
    );
  }
  /**
   * Applies the writing mask to the color buffer to the gl state.
   */
  applyColorMask() {
    this.gl.colorMask(
      this.colorMask[0] || !1,
      this.colorMask[1] || !1,
      this.colorMask[2] || !1,
      this.colorMask[3] || !1
    );
  }
  /**
   * Applies the blending equations to the gl state
   */
  applyBlendEquation() {
    const e = this.gl;
    switch (this._blendEquation) {
      case x.Material.BlendingEquations.Add:
        e.blendEquation(e.FUNC_ADD);
        break;
      case x.Material.BlendingEquations.Subtract:
        e.blendEquation(e.FUNC_SUBTRACT);
        break;
      case x.Material.BlendingEquations.ReverseSubtract:
        e.blendEquation(e.FUNC_REVERSE_SUBTRACT);
        break;
    }
  }
  /**
   * Applies the blending factors to the gl state
   */
  applyBlendFactors() {
    const e = this.gl;
    let t, n;
    switch (this._blendDstFactor) {
      case x.Material.BlendingDstFactor.DstAlpha:
        t = e.BLEND_DST_ALPHA;
        break;
      case x.Material.BlendingDstFactor.DstColor:
        t = e.BLEND_DST_RGB;
        break;
      case x.Material.BlendingDstFactor.One:
        t = e.ONE;
        break;
      case x.Material.BlendingDstFactor.OneMinusDstAlpha:
        t = e.ONE_MINUS_DST_ALPHA;
        break;
      case x.Material.BlendingDstFactor.OneMinusDstColor:
        t = e.ONE_MINUS_DST_COLOR;
        break;
      case x.Material.BlendingDstFactor.OneMinusSrcAlpha:
        t = e.ONE_MINUS_SRC_ALPHA;
        break;
      case x.Material.BlendingDstFactor.OneMinusSrcColor:
        t = e.ONE_MINUS_SRC_COLOR;
        break;
      case x.Material.BlendingDstFactor.SrcAlpha:
        t = e.SRC_ALPHA;
        break;
      case x.Material.BlendingDstFactor.SrcColor:
        t = e.SRC_COLOR;
        break;
      case x.Material.BlendingDstFactor.Zero:
        t = e.ZERO;
        break;
      default:
        t = e.ONE;
        break;
    }
    switch (this._blendSrcFactor) {
      case x.Material.BlendingDstFactor.DstAlpha:
        n = e.BLEND_DST_ALPHA;
        break;
      case x.Material.BlendingDstFactor.DstColor:
        n = e.BLEND_DST_RGB;
        break;
      case x.Material.BlendingDstFactor.One:
        n = e.ONE;
        break;
      case x.Material.BlendingDstFactor.OneMinusDstAlpha:
        n = e.ONE_MINUS_DST_ALPHA;
        break;
      case x.Material.BlendingDstFactor.OneMinusDstColor:
        n = e.ONE_MINUS_DST_COLOR;
        break;
      case x.Material.BlendingDstFactor.OneMinusSrcAlpha:
        n = e.ONE_MINUS_SRC_ALPHA;
        break;
      case x.Material.BlendingDstFactor.OneMinusSrcColor:
        n = e.ONE_MINUS_SRC_COLOR;
        break;
      case x.Material.BlendingDstFactor.SrcAlpha:
        n = e.SRC_ALPHA;
        break;
      case x.Material.BlendingDstFactor.SrcColor:
        n = e.SRC_COLOR;
        break;
      case x.Material.BlendingDstFactor.Zero:
        n = e.ZERO;
        break;
      case x.Material.BlendingSrcFactor.SrcAlphaSaturate:
        n = e.SRC_ALPHA_SATURATE;
        break;
      default:
        n = e.ONE;
        break;
    }
    e.blendFunc(n, t);
  }
  /**
   * Applies the cull face property to the gl state
   */
  applyCullFace() {
    const e = this.gl;
    switch (this._cullFace !== x.Material.CullSide.NONE && e.enable(e.CULL_FACE), this._cullFace) {
      case x.Material.CullSide.CW:
        e.frontFace(e.CW), e.cullFace(e.FRONT);
        break;
      case x.Material.CullSide.CCW:
        e.frontFace(e.CCW), e.cullFace(e.FRONT);
        break;
      case x.Material.CullSide.BOTH:
        e.frontFace(e.CW), e.cullFace(e.FRONT_AND_BACK);
        break;
      default:
        e.disable(e.CULL_FACE);
    }
  }
  /**
   * This applies the current viewport property to the gl context
   */
  applyViewport() {
    this.gl.viewport(
      this._viewport.x,
      this._viewport.y,
      this._viewport.width,
      this._viewport.height
    );
  }
}
class lr {
  constructor(e) {
    this.blending = {
      blendDst: x.Material.BlendingDstFactor.OneMinusSrcAlpha,
      blendEquation: x.Material.BlendingEquations.Add,
      blendSrc: x.Material.BlendingSrcFactor.SrcAlpha
    }, this.colorWrite = [!0, !0, !0, !0], this.culling = x.Material.CullSide.CCW, this.depthFunc = x.Material.DepthFunctions.LESS_OR_EQUAL, this.depthTest = !0, this.depthWrite = !0, this.dithering = !0, this.name = "", this.uniforms = {}, this.uniformBuffers = {}, this.vertexShader = "", Object.assign(this, e), delete this.gl;
  }
  /**
   * Makes a duplicate material with identical settings as this material. It
   * provides the benefit of being able to adjust uniform values for the new
   * material while sharing the same programs and shaders.
   */
  clone() {
    const e = new lr(this);
    e.blending = Object.assign({}, this.blending), e.polygonOffset = Object.assign({}, this.polygonOffset), e.uniforms = Object.assign({}, this.uniforms);
    for (const t in e.uniforms) {
      const n = e.uniforms[t];
      if (n.gl) {
        const s = /* @__PURE__ */ new Map();
        n.gl.forEach((r, o) => {
          s.set(o, Object.assign({}, r));
        });
      }
    }
    return e.uniformBuffers = Object.assign({}, this.uniformBuffers), e;
  }
  /**
   * This frees up all GL resources utilized by this material.
   */
  dispose() {
    this.gl && this.gl.proxy.disposeMaterial(this);
  }
}
class Cl {
  constructor(e, t, n) {
    this.drawMode = x.Model.DrawMode.TRIANGLES, this.vertexDrawRange = [-1, -1], this.drawInstances = -1, this.vertexCount = 0, this.id = e, this.geometry = t, this.material = n;
  }
}
class Fr {
  constructor() {
    this.models = /* @__PURE__ */ new Set();
  }
  /**
   * Add a model to be rendered within the scene
   */
  add(e) {
    this.models.add(e);
  }
  /**
   * Remove a model from the scene
   */
  remove(e) {
    this.models.delete(e);
  }
}
const ba = ve("performance");
class Du {
  constructor(e) {
    this.state = {
      clearMask: [!1, !1, !1],
      currentRenderTarget: null,
      displaySize: [1, 1],
      pixelRatio: 1,
      renderSize: [1, 1]
    }, this.options = Object.assign(
      {
        alpha: !1,
        antialias: !1,
        preserveDrawingBuffer: !1
      },
      e
    ), this.options.canvas || console.warn("WebGLRenderer ERROR: A canvas is REQUIRED as a parameter."), this.getContext();
  }
  /** When this is set this creates */
  set debugContext(e) {
    this.glProxy && (this.glProxy.debugContext = e), this.glState && (this.glState.debugContext = e);
  }
  /** The readonly gl context the renderer determined for use */
  get gl() {
    return this._gl;
  }
  /**
   * Clears the specified buffers.
   */
  clear(e, t, n) {
    const s = this.state.clearMask;
    this.state.clearMask = [
      s[0] || e || !1,
      s[1] || t || !1,
      s[2] || n || !1
    ];
  }
  /**
   * Clears the color either set with setClearColor, or clears the color
   * specified.
   */
  clearColor(e) {
    e && this.glState.setClearColor(e);
  }
  /**
   * Free all resources this renderer utilized. Make sure textures and
   * frame/render/geometry buffers are all deleted. We may even use aggressive
   * buffer removal that force resizes the buffers so their resources are
   * immediately reduced instead of waiting for the JS engine to free up
   * resources.
   */
  dispose() {
  }
  /**
   * Retrieve and establish the context from the canvas.
   */
  getContext() {
    if (this._gl) return this._gl;
    const e = Vs.getContext(this.options.canvas, {
      alpha: this.options.alpha || !1,
      antialias: this.options.antialias || !1,
      premultipliedAlpha: this.options.premultipliedAlpha || !1,
      preserveDrawingBuffer: this.options.preserveDrawingBuffer || !1
    });
    return e.context ? (this._gl = e.context, this.glState = new Bu(e.context, e.extensions), this.glProxy = new Vs(e.context, this.glState, e.extensions), this.glState.setProxy(this.glProxy), this.glState.syncState()) : this.options.onNoContext ? this.options.onNoContext() : console.warn(
      "No context was able to be produced, and the handler onNoContext was not implemented for such cases."
    ), this._gl;
  }
  /**
   * Retrieves the size of the canvas ignoring pixel ratio.
   */
  getDisplaySize() {
    return this.state.displaySize;
  }
  /**
   * Retrieves the current pixel ratio in use for the context.
   */
  getPixelRatio() {
    return this.state.pixelRatio;
  }
  /**
   * Retrieves the size of the rendering context. This is the pixel dimensions
   * of what is being rendered into.
   */
  getRenderSize() {
    return this.state.renderSize;
  }
  /**
   * Returns the full viewport for the current target.
   *
   * If a RenderTarget is not set, then this returns the viewport of the canvas
   * ignoring the current pixel ratio.
   */
  getFullViewport() {
    const e = this.state.currentRenderTarget;
    if (Array.isArray(e))
      return {
        x: 0,
        y: 0,
        width: e[0].width,
        height: e[0].height
      };
    if (e)
      return {
        x: 0,
        y: 0,
        width: e.width,
        height: e.height
      };
    {
      const t = this.getRenderSize();
      return {
        x: 0,
        y: 0,
        width: t[0],
        height: t[1]
      };
    }
  }
  /**
   * Prepares the specified attribute
   */
  prepareAttribute(e, t, n) {
    if (this.glProxy.updateAttribute(t))
      (!e.gl || !e.gl.vao) && this.glProxy.useAttribute(n, t, e);
    else
      return console.warn("Could not update attribute", t), !1;
    return !0;
  }
  /**
   * Prepared the specified index buffer
   */
  prepareIndexBuffer(e, t) {
    if (this.glProxy.updateIndexBuffer(t)) {
      if (!e.gl || !e.gl.vao)
        return this.glProxy.useIndexBuffer(t);
    } else
      return console.warn("Could not update index buffer", t), !1;
    return !0;
  }
  /**
   * Renders the Scene specified.
   */
  render(e, t = null, n) {
    if (!this.gl) return;
    this.setRenderTarget(t);
    const s = [];
    if (t && !Array.isArray(t) && (O.MRT || O.MRT_EXTENSION)) {
      const o = t.getGLBuffers();
      this.glState.setDrawBuffers(
        o.map((a) => (a == null ? void 0 : a.attachment) || 0)
      );
    }
    const r = this.state.clearMask;
    if ((r[0] || r[1] || r[2]) && (this.glProxy.clear(r[0], r[1], r[2]), this.state.clearMask = [!1, !1, !1]), Array.isArray(t))
      for (let o = 0, a = t.length; o < a; ++o) {
        const c = t[o];
        if (this.glState.useRenderTarget(c), c && !c.gl)
          return;
        e.models.forEach((l) => {
          this.renderModel(l, s, n);
        });
      }
    else {
      if (t && !t.gl)
        return;
      e.models.forEach((o) => {
        this.renderModel(o, s, n);
      });
    }
    s.forEach((o) => {
      e.remove(o);
    });
  }
  /**
   * Renders the specified model
   */
  renderModel(e, t, n) {
    var a;
    const s = e.geometry, r = e.material;
    switch (this.glState.useMaterial(r)) {
      case Rt.VALID: {
        this.glProxy.compileGeometry(s);
        let c = !0;
        const l = (h, u) => {
          c = this.prepareAttribute(s, h, u) && c;
        };
        s.attributes.forEach(l), s.indexBuffer && (c = this.prepareIndexBuffer(s, s.indexBuffer) && c), (a = s.gl) != null && a.vao ? this.glState.bindVAO(s.gl.vao) : (this.glState.boundVAO && this.glState.bindVAO(null), this.glState.applyVertexAttributeArrays()), n == null || n(this.glState, e.id), c ? this.glProxy.draw(e) : (console.warn(
          "Geometry was unable to update correctly, thus we are skipping the drawing of",
          e
        ), t.push(e)), this.glState.bindVAO(null);
        break;
      }
      case Rt.INVALID: {
        console.warn(
          "Could not utilize material. Skipping draw call for:",
          r,
          s
        ), t.push(e);
        break;
      }
      case Rt.NO_RENDER_TARGET_MATCHES: {
        ba(
          "Skipped draw for material due to no output matches for the current render target"
        );
        break;
      }
      default:
        ba("Skipped draw for material due to unknown reasons");
        break;
    }
  }
  /**
   * Reads the pixels from the current Render Target (or more specifically from
   * the current framebuffer)
   *
   * By default the viewport is set based on the canvas being rendered into.
   * Include a render target to make the viewport be applied with the target
   * considered rather than needing pixel density considerations.
   *
   * When the current render target has multiple buffers or IS multiple buffers,
   * then you have the ability to use bufferType to target a buffer based on
   * it's outputType to specify that buffer from which you wish to read.
   */
  readPixels(e, t, n, s, r, o = 0) {
    if (!this.gl) return;
    const a = this.state.currentRenderTarget;
    let c = !0, l;
    if (Array.isArray(a))
      l = a.find((h) => {
        var u;
        return Array.isArray(h.buffers.color) ? h.buffers.color.find((d) => d.outputType === o) : ((u = h.buffers.color) == null ? void 0 : u.outputType) === o;
      });
    else if (a && Array.isArray(a == null ? void 0 : a.buffers.color)) {
      if (a.buffers.color.length > 1) {
        console.warn(
          "It is not yet implemented to read the pixels from a RenderTarget with multiple color buffers"
        );
        return;
      }
      l = a;
    } else
      l = a;
    if (l && (c = l.validFramebuffer), !c) {
      console.warn(
        "Framebuffer is incomplete. Can not read pixels at this time."
      );
      return;
    }
    if (e = Math.max(0, Math.min(e, ((l == null ? void 0 : l.width) || 0) - n)), t = Math.max(0, Math.min(t, ((l == null ? void 0 : l.height) || 0) - s)), l) {
      e + n > l.width && (n = l.width - e), t + s > l.height && (s = l.height - t);
      const h = l.height;
      this.gl.readPixels(
        e,
        h - t - s,
        n,
        s,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        r
      );
    } else {
      const h = this.getRenderSize(), u = h[1];
      e + n > h[0] && (n = h[0] - e), t + s > h[1] && (s = h[1] - t), this.gl.readPixels(
        e,
        u - t - s,
        n,
        s,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        r
      );
    }
  }
  /**
   * Sets the clear color to be used when the clear operation executes.
   */
  setClearColor(e) {
    this.glState.setClearColor(e);
  }
  /**
   * Applies a given ratio for the provided canvas context.
   */
  setPixelRatio(e) {
    const { canvas: t } = this.options, n = this.getDisplaySize();
    t.width = n[0] * e, t.height = n[1] * e, this.state.pixelRatio = e;
  }
  /**
   * Sets the region the scissor test will accept as visible. Anything outside
   * the region will be clipped.
   *
   * By default the scissor region is set based on the canvas being rendered
   * into. Include a render target to make the scissor region be applied with
   * the target considered rather than needing pixel density considerations.
   */
  setScissor(e, t) {
    if (t = t || this.state.currentRenderTarget || null, Array.isArray(t)) {
      const n = t[0].height;
      if (e) {
        const { x: s, y: r, width: o, height: a } = e;
        this.glState.setScissor({ x: s, y: n - r - a, width: o, height: a });
      } else
        this.glState.setScissor(null);
    } else if (t) {
      const n = t.height;
      if (e) {
        const { x: s, y: r, width: o, height: a } = e;
        this.glState.setScissor({ x: s, y: n - r - a, width: o, height: a });
      } else
        this.glState.setScissor(null);
    } else {
      const { renderSize: n } = this.state, s = n[1];
      if (e) {
        const { x: r, y: o, width: a, height: c } = e;
        this.glState.setScissor({
          x: r,
          y: s - o - c,
          width: a,
          height: c
        });
      } else
        this.glState.setScissor(null);
    }
  }
  /**
   * Resizes the render area to the specified amount.
   */
  setSize(e, t) {
    const { canvas: n } = this.options, { pixelRatio: s } = this.state;
    n.width = Math.min(e * s, O.MAX_TEXTURE_SIZE), n.height = Math.min(t * s, O.MAX_TEXTURE_SIZE), n.style.width = `${e}px`, n.style.height = `${t}px`, this.state.renderSize = [n.width, n.height], this.state.displaySize = [e, t];
  }
  /**
   * This sets the context to render into the indicated target
   */
  setRenderTarget(e) {
    this.state.currentRenderTarget !== e && (Array.isArray(e) ? e.forEach((t) => {
      t.gl || this.glProxy.compileRenderTarget(t);
    }) : !this.glState.useRenderTarget(e) && e && (e.getTextures().forEach((t) => {
      this.glState.willUseTextureUnit(t, e);
    }), this.glState.applyUsedTextures(), this.glProxy.compileRenderTarget(e) && this.glState.useRenderTarget(e)), this.state.currentRenderTarget = e);
  }
  /**
   * Sets the viewport we render into.
   *
   * By default the viewport is set based on the canvas being rendered into.
   * Include a render target to make the viewport be applied with the target
   * considered rather than needing pixel density considerations.
   */
  setViewport(e) {
    const t = this.state.currentRenderTarget, { x: n, y: s, width: r, height: o } = e;
    if (Array.isArray(t)) {
      const a = t[0].height;
      this.glState.setViewport(n, a - s - o, r, o);
    } else if (t) {
      const a = t.height;
      this.glState.setViewport(n, a - s - o, r, o);
    } else {
      const { renderSize: a } = this.state, c = a[1];
      this.glState.setViewport(n, c - s - o, r, o);
    }
  }
}
const { min: xs, max: vs } = Math;
class Z {
  /**
   * Create a new instance
   *
   * @param left  The left side (x coordinate) of the instance
   * @param right The right side of the instance
   * @param top The top (y coordinate) of the instance
   * @param bottom The bottom of the instance
   */
  constructor(e) {
    this.x = 0, this.y = 0, this.width = 0, this.height = 0, this.x = e.x || e.left || 0, this.y = e.y || e.top || 0, this.height = e.height || (e.bottom || 0) - this.y || 0, this.width = e.width || (e.right || 0) - this.x || 0;
  }
  get area() {
    return this.width * this.height;
  }
  get bottom() {
    return this.y + this.height;
  }
  get left() {
    return this.x;
  }
  get mid() {
    return [this.x + this.width / 2, this.y + this.height / 2];
  }
  get right() {
    return this.x + this.width;
  }
  get top() {
    return this.y;
  }
  static emptyBounds() {
    return new Z({
      height: 0,
      width: 0,
      x: 0,
      y: 0
    });
  }
  /**
   * Checks to see if a point is within this bounds object.
   *
   * @param point
   */
  containsPoint(e) {
    return !(e[0] < this.x || e[1] < this.y || e[0] > this.right || e[1] > this.bottom);
  }
  /**
   * Grows this bounds object to cover the space of the provided bounds object
   *
   * @param item
   */
  encapsulate(e) {
    return e instanceof Z ? (e.x < this.x && (this.width += Math.abs(e.x - this.x), this.x = e.x), e.y < this.y && (this.height += Math.abs(e.y - this.y), this.y = e.y), this.right < e.right && (this.width += e.right - this.right), this.bottom < e.bottom && (this.height += e.bottom - this.bottom), !0) : (e[0] < this.x && (this.width += this.x - e[0], this.x = e[0]), e[0] > this.right && (this.width += e[0] - this.x), e[1] < this.y && (this.height += this.y - e[1], this.y = e[1]), e[1] > this.bottom && (this.height += e[1] - this.y), !0);
  }
  /**
   * Grows the bounds (if needed) to encompass all bounds or points provided. This
   * performs much better than running encapsulate one by one.
   */
  encapsulateAll(e) {
    if (e.length <= 0) return;
    let t = Number.MAX_SAFE_INTEGER, n = Number.MIN_SAFE_INTEGER, s = Number.MAX_SAFE_INTEGER, r = Number.MIN_SAFE_INTEGER;
    if (e[0] instanceof Z) {
      const o = e;
      for (let a = 0, c = o.length; a < c; ++a) {
        const l = o[a];
        t = xs(t, l.left), n = vs(n, l.right), s = xs(s, l.top), r = vs(r, l.bottom);
      }
    } else {
      const o = e;
      for (let a = 0, c = o.length; a < c; ++a) {
        const [l, h] = o[a];
        t = xs(t, l), n = vs(n, l), s = xs(s, h), r = vs(r, h);
      }
    }
    this.x = Math.min(this.x, t), this.y = Math.min(this.y, s), this.width = Math.max(this.width, n - t), this.height = Math.max(this.height, r - s);
  }
  /**
   * Checks to see if the provided bounds object could fit within the dimensions of this bounds object
   * This ignores position and just checks width and height.
   *
   * @param bounds
   *
   * @return {number} 0 if it doesn't fit. 1 if it fits perfectly. 2 if it just fits.
   */
  fits(e) {
    return this.width === e.width && this.height === e.height ? 1 : this.width >= e.width && this.height >= e.height ? 2 : 0;
  }
  /**
   * Checks if a bounds object intersects another bounds object.
   *
   * @param bounds
   */
  hitBounds(e) {
    return !(this.right < e.x || this.x > e.right || this.bottom < e.y || this.y > e.bottom);
  }
  /**
   * Sees if the provided bounds is completely within this bounds object. Unlike fits() this takes
   * position into account.
   *
   * @param bounds
   */
  isInside(e) {
    return this.x >= e.x && this.right <= e.right && this.y >= e.y && this.bottom <= e.bottom;
  }
  /**
   * Top left position of the bounds
   */
  get location() {
    return [this.x, this.y];
  }
  /**
   * Easy readout of this Bounds object.
   */
  toString() {
    return `{x: ${this.x} y:${this.y} w:${this.width} h:${this.height}}`;
  }
}
function bt(i, e, t) {
  const n = `${i}`, s = parseFloat(n);
  return isNaN(s) ? 0 : n.indexOf("%") > -1 ? s / 100 * e : s * t;
}
const bn = /* @__PURE__ */ new WeakSet();
function wa(i, e, t) {
  (e.width === 0 || e.height === 0) && (bn.has(i) || (console.warn(
    "An AbsolutePosition evaluated to invalid dimensions.",
    "Please ensure that the object provided and the reference has valid dimensions",
    "to produce dimensions with width and height that are non-zero.",
    "item:",
    i,
    "reference:",
    e.toString()
  ), bn.add(i)));
  const n = Z.emptyBounds();
  let s, r;
  if (i.width)
    n.width = bt(i.width, e.width, t), i.left !== void 0 ? n.x = bt(i.left, e.width, t) : i.right !== void 0 && (n.x = e.width - bt(i.right, e.width, t) - n.width);
  else {
    const o = bt(i.left || 0, e.width, t);
    s = e.width - bt(i.right || 0, e.width, t) - o, s < 0 && (bn.has(i) || (console.warn(
      "An AbsolutePosition evaluated to invalid dimensions.",
      "Please ensure that the object provided and the reference has valid dimensions",
      "to produce dimensions with width and height that are greater than zero.",
      "item:",
      i,
      "reference:",
      e.toString()
    ), bn.add(i))), n.x = o, n.width = s;
  }
  if (i.height)
    n.height = bt(i.height, e.height, t), i.top !== void 0 ? n.y = bt(i.top, e.height, t) : i.bottom !== void 0 && (n.y = e.height - bt(i.bottom, e.height, t) - n.height);
  else {
    const o = bt(i.top || 0, e.height, t);
    r = e.height - bt(i.bottom || 0, e.height, t) - o, (r === void 0 || r < 0) && (bn.has(i) || (console.warn(
      "An AbsolutePosition evaluated to invalid dimensions.",
      "Please ensure that the object provided and the reference has valid dimensions",
      "to produce dimensions with width and height that are greater than zero.",
      "item:",
      i,
      "reference:",
      e.toString()
    ), bn.add(i))), n.y = o, n.height = r;
  }
  return (n.width === 0 || n.height === 0 || isNaN(n.x + n.y + n.width + n.height)) && (n.x = 0, n.y = 0, n.width = e.width, n.height = e.height), n;
}
const yt = class yt {
  /**
   * This activates all observables to gather their UIDs when they are retrieved
   * via their getter. All of the ID's gathered can be accessed via
   * getObservableMonitorIds. It is REQUIRED that this is disabled again to
   * prevent a MASSIVE memory leak.
   */
  static setObservableMonitor(e) {
    yt.gatherIds = e, yt.observableIds = [];
  }
  /**
   * This retrieves the observables monitored IDs that were gathered when
   * setObservableMonitor was enabled.
   */
  static getObservableMonitorIds(e) {
    const t = yt.observableIds.slice(0);
    return e && (yt.observableIds = []), t;
  }
};
yt.setCycle = !1, yt.gatherIds = !1, yt.observableIds = [], yt.observableNamesToUID = /* @__PURE__ */ new Map();
let Se = yt;
const Tt = Se, Os = /* @__PURE__ */ new Map();
let Uu = 1;
const ku = {}.constructor;
function Fu(i, e) {
  const t = Tt.observableNamesToUID.get(e) || 0;
  if (t === 0) {
    console.warn(
      "A property with name",
      e,
      "for",
      i,
      "has not been assigned a UID which is an error in this step of the process."
    );
    return;
  }
  function n() {
    return Tt.gatherIds && (Tt.setCycle || Tt.observableIds.push(t)), i.observableStorage[t];
  }
  function s(o) {
    Tt.gatherIds && (Tt.setCycle = !0), i.observableStorage[t] = o, i.changes[t] = t, i.observer && i.observer.instanceUpdated(i), Tt.gatherIds && (Tt.setCycle = !1);
  }
  const r = i[e];
  Object.defineProperty(i, e, {
    configurable: !0,
    enumerable: !0,
    get: n,
    set: s
  }), i[e] = r;
}
function I(i, e, t) {
  t || (t = {
    configurable: !0,
    enumerable: !0
  });
  let n = Os.get(i.constructor), s = Tt.observableNamesToUID.get(e) || 0;
  s === 0 && (s = ++Uu, Tt.observableNamesToUID.set(e, s)), n || (n = /* @__PURE__ */ new Set(), Os.set(i.constructor, n)), n.add(e);
  let r = Object.getPrototypeOf(i), o = 0;
  for (; r.constructor !== ku && ++o < 100; ) {
    const a = Os.get(r.constructor);
    a && a.forEach((c) => n == null ? void 0 : n.add(c)), r = Object.getPrototypeOf(r);
  }
  o >= 100 && console.warn(
    "@observable decorator encountered a type that has 100+ levels of inheritance. This is most likely an error, and may be a result of a circular dependency and will not be supported by this decorator."
  ), t.enumerable = !0, t.writable = !0, Object.defineProperty(i, e, t);
}
function Xe(i, e) {
  if (i.constructor !== e) return;
  const t = Os.get(e);
  t && t.forEach((n) => Fu(i, n));
}
class oe {
  constructor(e) {
    if (this._uid = U(), this.cleanObservation = /* @__PURE__ */ new Map(), this.instanceChanges = /* @__PURE__ */ new Map(), this.allowChanges = !0, this.resolveContext = "", e)
      for (let t = 0, n = e.length; t < n; ++t) {
        const s = e[t];
        this.add(s);
      }
  }
  /** A uid provided to this object to give it some easy to identify uniqueness */
  get uid() {
    return this._uid;
  }
  /**
   * Retrieve all of the changes applied to instances
   */
  get changeList() {
    this.allowChanges = !1;
    const e = [];
    return this.instanceChanges.forEach((t) => e.push(t)), e;
  }
  /**
   * Adds an instance to the provider which will stream observable changes of the instance to
   * the framework.
   */
  add(e) {
    if (this.cleanObservation.get(e.uid))
      return e;
    if (this.allowChanges) {
      e.observer = this;
      const t = e.observableDisposer;
      this.cleanObservation.set(e.uid, [e, t]), this.instanceChanges.set(e.uid, [
        e,
        ge.INSERT,
        e.changes
      ]);
    }
    return e;
  }
  /**
   * Returns true if the instance is managed by this provider.
   */
  has(e) {
    return this.cleanObservation.has(e.uid);
  }
  /**
   * Removes all instances from this provider
   */
  clear() {
    this.cleanObservation.forEach((e) => {
      this.remove(e[0]);
    });
  }
  /**
   * Clear all resources held by this provider. It IS valid to lose reference to all instances
   * and to this object, which would effectively cause this object to get GC'ed. But if you
   * desire to hang onto the instance objects, then this should be called.
   */
  destroy() {
    this.cleanObservation.forEach((e) => {
      e[1]();
    }), this.cleanObservation.clear(), this.instanceChanges.clear();
  }
  /**
   * This is called from observables to indicate it's parent has been updated.
   * This is what an instance calls when it's observable property is modified.
   */
  instanceUpdated(e) {
    this.allowChanges && this.instanceChanges.set(e.uid, [
      e,
      ge.CHANGE,
      e.changes
    ]);
  }
  /**
   * Stops the instance's ability to register changes with this provider and flags
   * a final removal diff change.
   */
  remove(e) {
    if (this.allowChanges) {
      const t = this.cleanObservation.get(e.uid);
      t && (t[1](), this.cleanObservation.delete(e.uid), this.instanceChanges.set(e.uid, [
        t[0],
        ge.REMOVE,
        {}
      ]));
    }
    return !1;
  }
  /**
   * Flagged all changes as dealt with
   */
  resolve(e) {
    if (this.allowChanges = !0, this.instanceChanges.clear(), this.resolveContext && this.resolveContext !== e)
      throw new Error(
        "An instance provider has been issued to two layers. This is not a suppported feature yet and can cause issues."
      );
    this.resolveContext = e;
  }
  /**
   * This performs an operation that forces all of the instances to be flagged as an
   * 'add' change. This allows a layer listening to this provider to ensure it has added
   * all currently existing instances monitored by the provider.
   *
   * NOTE: This is a VERY poor performing method and should probably be used by the framework
   * and not manually.
   */
  sync() {
    const e = [];
    this.cleanObservation.forEach((t) => {
      const [n] = t;
      this.instanceChanges.set(n.uid, [
        n,
        ge.INSERT,
        e
      ]);
    });
  }
}
class Qx extends oe {
  constructor(e) {
    super(e), this._instances = [];
  }
  /**
   * List that tracks all instances. This list should not be manipulated
   * directly. But the instances within can be edited.
   */
  get instances() {
    return this._instances;
  }
  add(e) {
    return this._instances.push(e), super.add(e);
  }
  clear() {
    this._instances.length = 0, super.clear();
  }
  remove(e) {
    const t = this._instances.findIndex((n) => n.uid === e.uid);
    return t !== -1 && this._instances.splice(t, 1), super.remove(e);
  }
  destroy() {
    this._instances.length = 0, super.destroy();
  }
}
class Ol {
  constructor(e) {
    this.delay = 0, this.isManualStart = !1, this.isTimeSet = !1, this.startTime = -1, Object.assign(this, e);
  }
  /**
   * If you manually set values for the easing properties, then you use this to return
   * the easing object back to an automated state which is where the start value is
   * the calculated current position of the output and the delay and duration is determined
   * by the easing set to the layer's IAutomatedEasingMethod value set to the layer.
   */
  setAutomatic() {
    this.isManualStart = !1, this.isTimeSet = !1;
  }
  /**
   * This controls the start value of the easing. This should be used to force a starting
   * value of the animation.
   *
   * Use setAutomatic() to return to default easing behavior.
   */
  setStart(e) {
    e && (this.start.length !== e.length ? console.warn(
      "A manual easing adjustment provided an incompatible value for the easing type."
    ) : (this.start = e, this.isManualStart = !0));
  }
  /**
   * This controls of the timing of the easing equation. This should be used to adjust
   * when a value is to be adjusted
   *
   * Use setAutomatic() to return to default easing behavior.
   */
  setTiming(e, t) {
    this.delay = e === void 0 ? this.delay : e, this.duration = t === void 0 ? this.duration : t, this.isTimeSet = !0;
  }
}
var zu = Object.defineProperty, Ll = (i, e, t, n) => {
  for (var s = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = o(e, t, s) || s);
  return s && zu(e, t, s), s;
};
let Ta = 0;
const Po = class zr {
  constructor(e) {
    this._active = !1, this.changes = {}, this._observer = null, this.observableStorage = [], this._uid = zr.newUID, this.reactivate = !1, Xe(this, zr), e && (this.active = e.active || this.active);
  }
  static get newUID() {
    return Ta = ++Ta % 16777215;
  }
  /** This indicates when the instance is active / rendering */
  get active() {
    return this._active;
  }
  set active(e) {
    this._active = e, this.reactivate = !0;
  }
  /**
   * Retrieves a method for disposing the link between observables and observer.
   */
  get observableDisposer() {
    return () => this._observer = null;
  }
  /**
   * Retrieves the observer of the observables.
   */
  get observer() {
    return this._observer || null;
  }
  /**
   * Applies an observer for changes to the observables.
   */
  set observer(e) {
    const t = this._observer;
    t && t !== e && (this.easing && this.easing.clear(), t.remove(this)), this._observer = e;
  }
  /**
   * This attempts to get the easing object for this instance for a given
   * attribute that it MIGHT be associated with.
   *
   * When an instance is added to a layer and the layer has attributes with
   * easing applied to them, the instance gains easing values for the attributes
   * in the layer with applied easing.
   *
   * You can access the easing values by requesting the attribute's "name"
   * property value using this method.
   *
   * There is NO WAY TO GUARANTEE this value is set or available, so this method
   * WILL return undefined if you did not use the correct name, or no such value
   * exists, or the layer decided to not make the attribute animateable.
   *
   * Thus ALWAYS check the returned value to ensure it is defined before
   * attempting to use it's results.
   *
   * PERFORMANCE: You can probably get much better performance NOT using this to
   * manipulate the easing object directly. The system is designed to
   * automatically animate an item from it's current rendered location to the
   * next location seamlessly thus accounting for most situations. This method
   * is provided to commit much more complex start, duration, and delay
   * animations within a given frame to prevent the need for complicated
   * setTimeout patterns.
   *
   * This CAN be faster than the default behavior if it avoids causing
   * complicated easing computations to determine where the rendering should be
   * at the moment (complicated cpu methods within the IAutoEasingMethod used).
   */
  getEasing(e) {
    if (this.easingId) {
      const t = this.easingId[`_${e}_end`];
      if (t && this.easing) {
        const n = this.easing.get(t);
        if (n instanceof Ol)
          return n;
      }
    }
  }
  /**
   * Get the auto generated ID of this instance
   */
  get uid() {
    return this._uid;
  }
  /**
   * This method is utilized internally to indicate when requested resources are
   * ready. If you have a property that will be requesting a resource, you
   * should implement this method to cause a trigger for the property to
   * activate such that the property will update it's buffer.
   */
  resourceTrigger() {
    console.warn(
      "resourceTrigger called on an instance that did not override resourceTrigger. resourceTrigger MUST be overridden for instances",
      "that utilize a resource. The observable that is tied to committing the resource should be 'triggered' in this method."
    );
  }
};
Ll([
  I
], Po.prototype, "_active");
Ll([
  I
], Po.prototype, "_uid");
let nt = Po;
class Yx extends nt {
  resourceTrigger() {
  }
}
class Bo {
  constructor() {
    this._uid = U(), this.id = "", this.pixelRatio = 1, this._screenScale = [1, 1];
  }
  /** Provides a numerical UID for this object */
  get uid() {
    return this._uid;
  }
  /** This is the rendering bounds within screen space */
  get screenBounds() {
    return this._scaledScreenBounds || (this._scaledScreenBounds = new Z({
      x: this._screenBounds.x * this._screenScale[0],
      y: this._screenBounds.y * this._screenScale[1],
      width: this._screenBounds.width * this._screenScale[0],
      height: this._screenBounds.height * this._screenScale[1]
    })), this._scaledScreenBounds;
  }
  set screenBounds(e) {
    delete this._scaledScreenBounds, this._screenBounds = e;
  }
  /**
   * This helps resolve view's that don't correlate to the screen perfectly.
   * This would include times a view renders to a resource at a scaled valued
   * compared to the actual dimensions of the screen.
   */
  get screenScale() {
    return this._screenScale;
  }
  set screenScale(e) {
    To(e, this._screenScale) || (delete this._scaledScreenBounds, this._screenScale = e);
  }
  /**
   * This projects a point to be relative to the rendering dimensions of the
   * view.
   */
  screenToRenderSpace(e, t) {
    return t = this.screenToView(e, t), ae(t, e[0] * this.pixelRatio, e[1] * this.pixelRatio);
  }
  /**
   * This projects a point relative to the render space of the view to the
   * screen coordinates
   */
  renderSpaceToScreen(e, t) {
    return t = t || [0, 0], ae(
      t,
      e[0] / this.pixelRatio - this.screenBounds.x,
      e[1] / this.pixelRatio - this.screenBounds.y
    );
  }
  /**
   * Takes a coordinate in screen coordinates and maps it to a point that is
   * relative to a view's viewport on the screen.
   */
  screenToView(e, t) {
    return t = t || [0, 0], ae(
      t,
      e[0] - this.screenBounds.x,
      e[1] - this.screenBounds.y
    );
  }
  /**
   * Takes a coordinate that is relative to a view's viewport within the screen
   * and maps it to a coordinate relative to the screen.
   */
  viewToScreen(e, t) {
    return t = t || [0, 0], ae(
      t,
      e[0] + this.screenBounds.x,
      e[1] + this.screenBounds.y
    );
  }
}
class Gu extends Bo {
  screenToWorld(e, t) {
    return e;
  }
  screenRay(e) {
    return [
      [0, 0, -1],
      [0, 0, -2]
    ];
  }
  worldToScreen(e, t) {
    return e;
  }
  viewToWorld(e, t) {
    return e;
  }
  worldToView(e, t) {
    return e;
  }
}
class hn {
  /** READONLY id of the object. */
  get id() {
    return this._key;
  }
  /** READONLY key of the object */
  get key() {
    return this._key;
  }
  constructor(e) {
    this._key = e.key;
  }
}
function Vu(i) {
  return {
    key: "",
    type: re.COLOR_BUFFER,
    ...i
  };
}
function Hs(i) {
  return i !== void 0 && i.key !== void 0 && i.type === re.COLOR_BUFFER;
}
class ya extends hn {
  constructor(e, t) {
    super(e), this.type = re.COLOR_BUFFER, this.height = e.height, this.width = e.width, this.colorBufferSettings = e.colorBufferSettings, this.createColorBuffer(t);
  }
  /**
   * Frees up resources associated with this object. This object is no longer
   * valid after this is called and will produce undefined results if attempted
   * to use again.
   */
  destroy() {
    this.colorBuffer.destroy();
  }
  /**
   * This generates the colorBuffer object needed for this atlas.
   */
  createColorBuffer(e) {
    if (this.colorBuffer) return;
    this.colorBufferSettings = {
      ...this.colorBufferSettings
    };
    let t, n;
    const s = (e == null ? void 0 : e.getRenderSize()) || [1, 1];
    if (this.width <= ft.SCREEN) {
      if (!e)
        throw new Error(
          "Can not generate Render Texture with a dynamic width or height when the WebGLRenderer is not available"
        );
      t = s[0] / -this.width;
    } else t = this.width;
    if (this.height <= ft.SCREEN) {
      if (!e)
        throw new Error(
          "Can not generate Render Texture with a dynamic width or height when the WebGLRenderer is not available"
        );
      n = s[1] / -this.width;
    } else n = this.height;
    this.colorBuffer = new Mc({
      internalFormat: x.RenderTarget.ColorBufferFormat.RGBA4,
      size: [t, n],
      ...this.colorBufferSettings
    });
  }
}
class rs {
  /**
   * Every resource manager will receive the utilized renderer so the manager
   * can perform basic GL tasks if needed
   */
  get webGLRenderer() {
    return this._webGLRenderer;
  }
  set webGLRenderer(e) {
    this._webGLRenderer = e;
  }
  /**
   * Allows a resource manager to provide it's own IO Expansion to handle
   * special attributes the layer may have for handling.
   */
  getIOExpansion() {
    return [];
  }
  /**
   * This will be called when the system detects the renderer has been resized
   */
  resize() {
  }
  /**
   * This applies an attribute as the current context
   */
  setAttributeContext(e) {
  }
}
class $u extends rs {
  constructor() {
    super(...arguments), this.resources = /* @__PURE__ */ new Map();
  }
  async dequeueRequests() {
    return !1;
  }
  destroy() {
  }
  destroyResource(e) {
    this.resources.delete(e.key);
  }
  getResource(e) {
    return this.resources.get(e) || { key: "", type: -1 };
  }
  async initResource(e) {
    this.resources.set(e.key, e);
  }
  request(e, t, n) {
    return [0, 0, 0, 0];
  }
  updateResource(e) {
  }
}
const Wu = new $u();
class ju extends rs {
  constructor() {
    super(...arguments), this.resources = /* @__PURE__ */ new Map();
  }
  /**
   * This manager does not need to dequeue requests as all requests will be
   * immediately resolved with no asynchronous requirements.
   */
  async dequeueRequests() {
    return !1;
  }
  /**
   * This frees up resources when the system indictates this manager is no
   * longer needed.
   */
  destroy() {
    this.resources.forEach((e) => e.destroy()), this.resources.clear();
  }
  /**
   * This resource has no special IO expansion as it can not be used within a
   * shader's context. It can only be an output target.
   */
  getIOExpansion() {
    return [];
  }
  /**
   * This retrieves the generated resources this manager tracks.
   */
  getResource(e) {
    return this.resources.get(e) || null;
  }
  /**
   * The system will inform this manager when a resource is no longer needed and
   * should be disposed.
   */
  destroyResource(e) {
    const t = this.resources.get(e.key);
    t && (t.destroy(), this.resources.delete(e.key));
  }
  /**
   * The system will inform this manager when a resource should be built.
   */
  async initResource(e) {
    let t = this.resources.get(e.key);
    if (t) {
      console.warn(
        "Attempted to generate a RenderTexture that already exists for key",
        e.key
      );
      return;
    }
    t = new ya(e, this.webGLRenderer), this.resources.set(e.key, t);
  }
  /**
   * Handle requests that stream in from instances requesting metrics for a
   * specific resource.
   */
  request(e, t, n, s) {
    const r = this.resources.get(n.key);
    return r ? (n.colorBuffer = r.colorBuffer, [0, 0, 1, 1]) : [0, 0, 0, 0];
  }
  /**
   * Trigger that executes when the rendering context resizes. For this manager,
   * we will update all textures with dimensions that are tied to the screen.
   */
  resize() {
    const e = /* @__PURE__ */ new Map();
    this.resources.forEach((t, n) => {
      t.width > ft.SCREEN && t.height > ft.SCREEN || (t.colorBuffer.destroy(), t = new ya(t, this.webGLRenderer), e.set(n, t));
    }), e.forEach((t, n) => this.resources.set(n, t));
  }
  /**
   * This targets the specified resource and attempts to update it's settings.
   */
  updateResource(e) {
    this.resources.get(e.key) && console.warn("UPDATING AN EXISTING COLOR BUFFER IS NOT SUPPORTED YET");
  }
}
function Gr(i) {
  return {
    type: re.COLOR_BUFFER,
    ...i
  };
}
function Nl(i) {
  return {
    key: "",
    type: re.TEXTURE,
    ...i
  };
}
function Nn(i) {
  return i && i.key !== void 0 && i.type === re.TEXTURE;
}
class Ea extends hn {
  constructor(e, t) {
    super(e), this.type = re.TEXTURE, this.height = e.height, this.width = e.width, this.textureSettings = e.textureSettings, this.createTexture(t);
  }
  /**
   * Frees up resources associated with this object. This object is no longer
   * valid after this is called and will produce undefined results if attempted
   * to use again.
   */
  destroy() {
    this.texture.destroy();
  }
  /**
   * This generates the texture object needed for this atlas.
   */
  createTexture(e) {
    var r;
    if (this.texture) return;
    this.textureSettings = {
      generateMipMaps: !0,
      premultiplyAlpha: !1,
      ...this.textureSettings
    };
    let t, n;
    const s = (e == null ? void 0 : e.getRenderSize()) || [1, 1];
    if (this.width <= ft.SCREEN) {
      if (!e)
        throw new Error(
          "Can not generate Render Texture with a dynamic width or height when the WebGLRenderer is not available"
        );
      t = s[0] / -this.width;
    } else t = this.width;
    if (this.height <= ft.SCREEN) {
      if (!e)
        throw new Error(
          "Can not generate Render Texture with a dynamic width or height when the WebGLRenderer is not available"
        );
      n = s[1] / -this.width;
    } else n = this.height;
    this.texture = new ee({
      data: ((r = this.textureSettings) == null ? void 0 : r.data) || {
        width: t,
        height: n,
        buffer: null
      },
      ...this.textureSettings
    });
  }
}
function Xs(i) {
  return {
    type: re.TEXTURE,
    ...i
  };
}
const { min: Hu, max: Xu, pow: Ra, round: Qu, sin: Wn, PI: Mn } = Math, os = Qu(Mn * 1e3) / 1e3;
function X(i, e, t) {
  return Hu(Xu(i, e), t);
}
var Ht = /* @__PURE__ */ ((i) => (i[i.NONE = 1] = "NONE", i[i.CONTINUOUS = 4] = "CONTINUOUS", i[i.REPEAT = 2] = "REPEAT", i[i.REFLECT = 3] = "REFLECT", i))(Ht || {});
const Yu = `
\${easingMethod} {
  return end;
}
`, qu = `
\${easingMethod} {
  return (end - start) * t + start;
}
`, Ku = `
\${easingMethod} {
  float time = t * t;
  return (end - start) * time + start;
}
`, Zu = `
\${easingMethod} {
  float time = t * (2.0 - t);
  return (end - start) * time + start;
}
`, Ju = `
\${easingMethod} {
  float time = t < 0.5 ? 2.0 * t * t : -1.0 + (4.0 - 2.0 * t) * t;
  return (end - start) * time + start;
}
`, ed = `
\${easingMethod} {
  float time = t * t * t;
  return (end - start) * time + start;
}
`, td = `
\${easingMethod} {
  float t1 = t - 1.0;
  float time = t1 * t1 * t1 + 1.0;
  return (end - start) * time + start;
}
`, id = `
\${easingMethod} {
  float time = t < 0.5 ? 4.0 * t * t * t : (t - 1.0) * (2.0 * t - 2.0) * (2.0 * t - 2.0) + 1.0;
  return (end - start) * time + start;
}
`, nd = `
\${easingMethod} {
  float time = t * t * t * t;
  return (end - start) * time + start;
}
`, sd = `
\${easingMethod} {
  float t1 = t - 1.0;
  float time = 1.0 - t1 * t1 * t1 * t1;
  return (end - start) * time + start;
}
`, rd = `
\${easingMethod} {
  float t1 = t - 1.0;
  float time = t < 0.5 ? 8.0 * t * t * t * t : 1.0 - 8.0 * t1 * t1 * t1 * t1;
  return (end - start) * time + start;
}
`, od = `
\${easingMethod} {
  float time = t * t * t * t * t;
  return (end - start) * time + start;
}
`, ad = `
\${easingMethod} {
  float t1 = t - 1.0;
  float time = 1.0 + t1 * t1 * t1 * t1 * t1;
  return (end - start) * time + start;
}
`, cd = `
\${easingMethod} {
  float t1 = t - 1.0;
  float time = t < 0.5 ? 16.0 * t * t * t * t * t : 1.0 + 16.0 * t1 * t1 * t1 * t1 * t1;
  return (end - start) * time + start;
}
`, ld = `
\${easingMethod} {
  float p = 0.3;
  float time = pow(2.0, -10.0 * t) * sin((t - p / 4.0) * (2.0 * ${os}) / p) + 1.0;
  return (end - start) * time + start;
}
`, hd = `
\${easingMethod} {
  float time = t * t * t - t * 1.05 * sin(t * ${os});
  return (end - start) * time + start;
}
`, ud = `
\${easingMethod} {
  float t1 = t - 1.0;
  float a = 1.7;
  float time = (t1 * t1 * ((a + 1.0) * t1 + a) + 1.0);
  return (end - start) * time + start;
}
`, dd = `
\${easingMethod} {
  float a = 1.4;
  float a1 = a * 1.525;
  float t1 = t / 0.5;
  float t2 = t1 - 2.0;
  float time =
    (t1 < 1.0) ? 0.5 * (t1 * t1 * (a1 + 1.0) * t1 - a1) :
    0.5 * (t2 * t2 * ((a1 + 1.0) * t2 + a1) + 2.0)
  ;

  return (end - start) * time + start;
}
`, fd = `
\${easingMethod} {
  \${T} direction = end - start;
  return start + direction * 0.5 + direction * sin(t * ${os} * 2.0) * 0.5;
}
`, pd = `
\${easingMethod} {
  float cosom = dot(start, end);
  \${T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - t, t),
    vec2(sin((1.0 - t) * omega) / sinom, sin(t * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`, gd = `
\${easingMethod} {
  float time = t * t;
  float cosom = dot(start, end);
  \${T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`, md = `
\${easingMethod} {
  float time = t * (2.0 - t);
  float cosom = dot(start, end);
  \${T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`, xd = `
\${easingMethod} {
  float time = t < 0.5 ? 2.0 * t * t : -1.0 + (4.0 - 2.0 * t) * t;
  float cosom = dot(start, end);
  \${T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`, vd = `
\${easingMethod} {
  float time = t * t * t;
  float cosom = dot(start, end);
  \${T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`, bd = `
\${easingMethod} {
  float t1 = t - 1.0;
  float time = t1 * t1 * t1 + 1.0;
  float cosom = dot(start, end);
  \${T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`, wd = `
\${easingMethod} {
  float time = t < 0.5 ? 4.0 * t * t * t : (t - 1.0) * (2.0 * t - 2.0) * (2.0 * t - 2.0) + 1.0;
  float cosom = dot(start, end);
  \${T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`, Td = `
\${easingMethod} {
  float time = t * t * t * t;
  float cosom = dot(start, end);
  \${T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`, yd = `
\${easingMethod} {
  float t1 = t - 1.0;
  float time = 1.0 - t1 * t1 * t1 * t1;
  float cosom = dot(start, end);
  \${T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`, Ed = `
\${easingMethod} {
  float t1 = t - 1.0;
  float time = t < 0.5 ? 8.0 * t * t * t * t : 1.0 - 8.0 * t1 * t1 * t1 * t1;
  float cosom = dot(start, end);
  \${T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`, Rd = `
\${easingMethod} {
  float time = t * t * t * t * t;
  float cosom = dot(start, end);
  \${T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`, _d = `
\${easingMethod} {
  float t1 = t - 1.0;
  float time = 1.0 + t1 * t1 * t1 * t1 * t1;
  float cosom = dot(start, end);
  \${T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`, Ad = `
\${easingMethod} {
  float t1 = t - 1.0;
  float time = t < 0.5 ? 16.0 * t * t * t * t * t : 1.0 + 16.0 * t1 * t1 * t1 * t1 * t1;
  float cosom = dot(start, end);
  \${T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`, Id = `
\${easingMethod} {
  float p = 0.3;
  float time = pow(2.0, -10.0 * t) * sin((t - p / 4.0) * (2.0 * ${os}) / p) + 1.0;
  float cosom = dot(start, end);
  \${T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`, Md = `
\${easingMethod} {
  float time = t * t * t - t * 1.05 * sin(t * ${os});
  float cosom = dot(start, end);
  \${T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`, Sd = `
\${easingMethod} {
  float t1 = t - 1.0;
  float a = 1.7;
  float time = (t1 * t1 * ((a + 1.0) * t1 + a) + 1.0);
  float cosom = dot(start, end);
  \${T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`, Cd = `
\${easingMethod} {
  float a = 1.4;
  float a1 = a * 1.525;
  float t1 = t / 0.5;
  float t2 = t1 - 2.0;
  float time =
    (t1 < 1.0) ? 0.5 * (t1 * t1 * (a1 + 1.0) * t1 - a1) :
    0.5 * (t2 * t2 * ((a1 + 1.0) * t2 + a1) + 2.0)
  ;
  float cosom = dot(start, end);
  \${T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`;
class Do {
  constructor(e, t, n, s) {
    this.uid = U(), this.delay = 0, this.duration = 500, this.loop = 1, this.cpu = e, this.gpu = t, this.duration = n || 500, this.methodName = s || "easingMethod";
  }
  /**
   * Autoeasing methods for linear easing
   */
  static immediate(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        const { copy: c } = D(s);
        return c(r, a);
      },
      delay: t,
      duration: e,
      gpu: Yu,
      loop: n,
      methodName: "immediate"
    };
  }
  /**
   * Autoeasing methods for linear easing
   */
  static linear(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        const { add: c, scale: l, subtract: h } = D(s);
        return o = X(o, 0, 1), c(l(h(r, s), o), s, a);
      },
      delay: t,
      duration: e,
      gpu: qu,
      loop: n,
      methodName: "linear"
    };
  }
  /**
   * Auto easing for Accelerating to end
   */
  static easeInQuad(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        o = X(o, 0, 1);
        const c = o * o, { add: l, scale: h, subtract: u } = D(s);
        return l(h(u(r, s), c), s, a);
      },
      delay: t,
      duration: e,
      gpu: Ku,
      loop: n,
      methodName: "easeInQuad"
    };
  }
  /**
   * Auto easing for decelerating to end
   */
  static easeOutQuad(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        o = X(o, 0, 1);
        const c = o * (2 - o), { add: l, scale: h, subtract: u } = D(s);
        return l(h(u(r, s), c), s, a);
      },
      delay: t,
      duration: e,
      gpu: Zu,
      loop: n,
      methodName: "easeOutQuad"
    };
  }
  /**
   * Auto easing for Accelerate to mid, then decelerate to end
   */
  static easeInOutQuad(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        o = X(o, 0, 1);
        const c = o < 0.5 ? 2 * o * o : -1 + (4 - 2 * o) * o, { add: l, scale: h, subtract: u } = D(s);
        return l(h(u(r, s), c), s, a);
      },
      delay: t,
      duration: e,
      gpu: Ju,
      loop: n,
      methodName: "easeInOutQuad"
    };
  }
  /**
   * Auto easing for Slower acceleration
   */
  static easeInCubic(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        o = X(o, 0, 1);
        const c = o * o * o, { add: l, scale: h, subtract: u } = D(s);
        return l(h(u(r, s), c), s, a);
      },
      delay: t,
      duration: e,
      gpu: ed,
      loop: n,
      methodName: "easeInCubic"
    };
  }
  /**
   * Auto easing for Slower deceleration
   */
  static easeOutCubic(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        o = X(o, 0, 1);
        const c = --o * o * o + 1, { add: l, scale: h, subtract: u } = D(s);
        return l(h(u(r, s), c), s, a);
      },
      delay: t,
      duration: e,
      gpu: td,
      loop: n,
      methodName: "easeOutCubic"
    };
  }
  /**
   * Auto easing for Slower acceleration to mid, and slower deceleration to end
   */
  static easeInOutCubic(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        o = X(o, 0, 1);
        const c = o < 0.5 ? 4 * o * o * o : (o - 1) * (2 * o - 2) * (2 * o - 2) + 1, { add: l, scale: h, subtract: u } = D(s);
        return l(h(u(r, s), c), s, a);
      },
      delay: t,
      duration: e,
      gpu: id,
      loop: n,
      methodName: "easeInOutCubic"
    };
  }
  /**
   * Auto easing for even Slower acceleration to end
   */
  static easeInQuart(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        o = X(o, 0, 1);
        const c = o * o * o * o, { add: l, scale: h, subtract: u } = D(s);
        return l(h(u(r, s), c), s, a);
      },
      delay: t,
      duration: e,
      gpu: nd,
      loop: n,
      methodName: "easeInQuart"
    };
  }
  /**
   * Auto easing for even Slower deceleration to end
   */
  static easeOutQuart(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        o = X(o, 0, 1);
        const c = 1 - --o * o * o * o, { add: l, scale: h, subtract: u } = D(s);
        return l(h(u(r, s), c), s, a);
      },
      delay: t,
      duration: e,
      gpu: sd,
      loop: n,
      methodName: "easeOutQuart"
    };
  }
  /**
   * Auto easing for even Slower acceleration to mid, and even slower deceleration to end
   */
  static easeInOutQuart(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        o = X(o, 0, 1);
        const c = o < 0.5 ? 8 * o * o * o * o : 1 - 8 * --o * o * o * o, { add: l, scale: h, subtract: u } = D(s);
        return l(h(u(r, s), c), s, a);
      },
      delay: t,
      duration: e,
      gpu: rd,
      loop: n,
      methodName: "easeInOutQuart"
    };
  }
  /**
   * Auto easing for super slow accelerating to the end
   */
  static easeInQuint(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        o = X(o, 0, 1);
        const c = o * o * o * o * o, { add: l, scale: h, subtract: u } = D(s);
        return l(h(u(r, s), c), s, a);
      },
      delay: t,
      duration: e,
      gpu: od,
      loop: n,
      methodName: "easeInQuint"
    };
  }
  /**
   * Auto easing for super slow decelerating to the end
   */
  static easeOutQuint(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        o = X(o, 0, 1);
        const c = 1 + --o * o * o * o * o, { add: l, scale: h, subtract: u } = D(s);
        return l(h(u(r, s), c), s, a);
      },
      delay: t,
      duration: e,
      gpu: ad,
      loop: n,
      methodName: "easeOutQuint"
    };
  }
  /**
   * Auto easing for super slow accelerating to mid and super slow decelerating to the end
   */
  static easeInOutQuint(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        o = X(o, 0, 1);
        const c = o < 0.5 ? 16 * o * o * o * o * o : 1 + 16 * --o * o * o * o * o, { add: l, scale: h, subtract: u } = D(s);
        return l(h(u(r, s), c), s, a);
      },
      delay: t,
      duration: e,
      gpu: cd,
      loop: n,
      methodName: "easeInOutQuint"
    };
  }
  /**
   * Auto easing for elastic effect
   */
  static easeOutElastic(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        o = X(o, 0, 1);
        const c = 0.3, l = Ra(2, -10 * o) * Wn((o - c / 4) * (2 * Mn) / c) + 1, { add: h, scale: u, subtract: d } = D(s);
        return h(u(d(r, s), l), s, a);
      },
      delay: t,
      duration: e,
      gpu: ld,
      loop: n,
      methodName: "easeOutElastic"
    };
  }
  /**
   * Auto easing for retracting first then shooting to the end
   */
  static easeBackIn(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        o = X(o, 0, 1);
        const l = o * o * o - o * 1.05 * Wn(o * Mn), { add: h, scale: u, subtract: d } = D(s);
        return h(u(d(r, s), l), s, a);
      },
      delay: t,
      duration: e,
      gpu: hd,
      loop: n,
      methodName: "easeBackIn"
    };
  }
  /**
   * Auto easing for overshooting at the end
   */
  static easeBackOut(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        o = X(o, 0, 1);
        const c = 1.7, l = o - 1, h = l * l * ((c + 1) * l + c) + 1, { add: u, scale: d, subtract: f } = D(s);
        return u(d(f(r, s), h), s, a);
      },
      delay: t,
      duration: e,
      gpu: ud,
      loop: n,
      methodName: "easeBackOut"
    };
  }
  /**
   * Auto easing for overshooting at the end
   */
  static easeBackInOut(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        o = X(o, 0, 1);
        const l = 1.7 * 1.525, h = o / 0.5, u = h - 2, d = h < 1 ? 0.5 * (h * h * (l + 1) * h - l) : 0.5 * (u * u * ((l + 1) * u + l) + 2), { add: f, scale: p, subtract: g } = D(s);
        return f(p(g(r, s), d), s, a);
      },
      delay: t,
      duration: e,
      gpu: dd,
      loop: n,
      methodName: "easeBackInOut"
    };
  }
  /**
   * This is an easing method that performs a sinusoidal wave where the amplitude is
   * (start - end) * 2 and the wave starts at the start value.
   *
   * This is intended to work best with the CONTINUOUS loop style.
   */
  static continuousSinusoidal(e, t = 0, n = 4) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        const { add: c, scale: l, subtract: h } = D(s);
        o = X(o, 0, 1);
        const u = h(r, s), d = l(u, 0.5);
        return c(
          c(s, d),
          l(d, Wn(o * Mn * 2) * 1),
          a
        );
      },
      delay: t,
      duration: e,
      gpu: fd,
      loop: n,
      methodName: "repeatingSinusoidal",
      // Since this is sinusoidial and operates off of a continuous time structure
      validation: {
        // When time = 1 our value will = start and NOT end
        ignoreEndValueCheck: !0,
        // When the time is > 1 our value will not clamp to the value at 1.
        ignoreOverTimeCheck: !0
      }
    };
  }
  static slerpQuatLinear(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        if (!F(s) || !F(r) || !F(a)) {
          const { vec: h } = D(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), h(1, 0, 0, 0);
        }
        o = X(o, 0, 1);
        const { slerpQuat: c, vec: l } = D(s);
        return c ? c(s, r, o, a) : l(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: pd,
      loop: n,
      methodName: "slerpQuatLinear"
    };
  }
  static slerpQuatInQuad(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        if (!F(s) || !F(r) || !F(a)) {
          const { vec: u } = D(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), u(1, 0, 0, 0);
        }
        o = X(o, 0, 1);
        const c = o * o, { slerpQuat: l, vec: h } = D(s);
        return l ? l(s, r, c, a) : h(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: gd,
      loop: n,
      methodName: "slerpQuatInQuad"
    };
  }
  static slerpQuatOutQuad(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        if (!F(s) || !F(r) || !F(a)) {
          const { vec: u } = D(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), u(1, 0, 0, 0);
        }
        o = X(o, 0, 1);
        const c = o * (2 - o), { slerpQuat: l, vec: h } = D(s);
        return l ? l(s, r, c, a) : h(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: md,
      loop: n,
      methodName: "slerpQuatOutQuad"
    };
  }
  static slerpQuatInOutQuad(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        if (!F(s) || !F(r) || !F(a)) {
          const { vec: u } = D(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), u(1, 0, 0, 0);
        }
        o = X(o, 0, 1);
        const c = o < 0.5 ? 2 * o * o : -1 + (4 - 2 * o) * o, { slerpQuat: l, vec: h } = D(s);
        return l ? l(s, r, c, a) : h(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: xd,
      loop: n,
      methodName: "slerpQuatInOutQuad"
    };
  }
  static slerpQuatInCubic(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        if (!F(s) || !F(r) || !F(a)) {
          const { vec: u } = D(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), u(1, 0, 0, 0);
        }
        o = X(o, 0, 1);
        const c = o * o * o, { slerpQuat: l, vec: h } = D(s);
        return l ? l(s, r, c, a) : h(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: vd,
      loop: n,
      methodName: "slerpQuatInCubic"
    };
  }
  static slerpQuatOutCubic(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        if (!F(s) || !F(r) || !F(a)) {
          const { vec: u } = D(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), u(1, 0, 0, 0);
        }
        o = X(o, 0, 1);
        const c = --o * o * o + 1, { slerpQuat: l, vec: h } = D(s);
        return l ? l(s, r, c, a) : h(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: bd,
      loop: n,
      methodName: "slerpQuatOutCubic"
    };
  }
  static slerpQuatInOutCubic(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        if (!F(s) || !F(r) || !F(a)) {
          const { vec: u } = D(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), u(1, 0, 0, 0);
        }
        o = X(o, 0, 1);
        const c = o < 0.5 ? 4 * o * o * o : (o - 1) * (2 * o - 2) * (2 * o - 2) + 1, { slerpQuat: l, vec: h } = D(s);
        return l ? l(s, r, c, a) : h(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: wd,
      loop: n,
      methodName: "slerpQuatInOutCubic"
    };
  }
  static slerpQuatInQuart(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        if (!F(s) || !F(r) || !F(a)) {
          const { vec: u } = D(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), u(1, 0, 0, 0);
        }
        o = X(o, 0, 1);
        const c = o * o * o * o, { slerpQuat: l, vec: h } = D(s);
        return l ? l(s, r, c, a) : h(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Td,
      loop: n,
      methodName: "slerpQuatInQuart"
    };
  }
  static slerpQuatOutQuart(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        if (!F(s) || !F(r) || !F(a)) {
          const { vec: u } = D(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), u(1, 0, 0, 0);
        }
        o = X(o, 0, 1);
        const c = 1 - --o * o * o * o, { slerpQuat: l, vec: h } = D(s);
        return l ? l(s, r, c, a) : h(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: yd,
      loop: n,
      methodName: "slerpQuatOutQuart"
    };
  }
  static slerpQuatInOutQuart(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        if (!F(s) || !F(r) || !F(a)) {
          const { vec: u } = D(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), u(1, 0, 0, 0);
        }
        o = X(o, 0, 1);
        const c = o < 0.5 ? 8 * o * o * o * o : 1 - 8 * --o * o * o * o, { slerpQuat: l, vec: h } = D(s);
        return l ? l(s, r, c, a) : h(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Ed,
      loop: n,
      methodName: "slerpQuatInOutQuart"
    };
  }
  static slerpQuatInQuint(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        if (!F(s) || !F(r) || !F(a)) {
          const { vec: u } = D(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), u(1, 0, 0, 0);
        }
        o = X(o, 0, 1);
        const c = o * o * o * o * o, { slerpQuat: l, vec: h } = D(s);
        return l ? l(s, r, c, a) : h(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Rd,
      loop: n,
      methodName: "slerpQuatInQuint"
    };
  }
  static slerpQuatOutQuint(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        if (!F(s) || !F(r) || !F(a)) {
          const { vec: u } = D(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), u(1, 0, 0, 0);
        }
        o = X(o, 0, 1);
        const c = 1 + --o * o * o * o * o, { slerpQuat: l, vec: h } = D(s);
        return l ? l(s, r, c, a) : h(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: _d,
      loop: n,
      methodName: "slerpQuatOutQuint"
    };
  }
  static slerpQuatInOutQuint(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        if (!F(s) || !F(r) || !F(a)) {
          const { vec: u } = D(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), u(1, 0, 0, 0);
        }
        o = X(o, 0, 1);
        const c = o < 0.5 ? 16 * o * o * o * o * o : 1 + 16 * --o * o * o * o * o, { slerpQuat: l, vec: h } = D(s);
        return l ? l(s, r, c, a) : h(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Ad,
      loop: n,
      methodName: "slerpQuatInOutQuint"
    };
  }
  static slerpQuatOutElastic(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        if (!F(s) || !F(r) || !F(a)) {
          const { vec: d } = D(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), d(1, 0, 0, 0);
        }
        o = X(o, 0, 1);
        const c = 0.3, l = Ra(2, -10 * o) * Wn((o - c / 4) * (2 * Mn) / c) + 1, { slerpQuat: h, vec: u } = D(s);
        return h ? h(s, r, l, a) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Id,
      loop: n,
      methodName: "slerpQuatOutElastic"
    };
  }
  static slerpQuatBackIn(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        if (!F(s) || !F(r) || !F(a)) {
          const { vec: d } = D(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), d(1, 0, 0, 0);
        }
        o = X(o, 0, 1);
        const l = o * o * o - o * 1.05 * Wn(o * Mn), { slerpQuat: h, vec: u } = D(s);
        return h ? h(s, r, l, a) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Md,
      loop: n,
      methodName: "slerpQuatBackIn"
    };
  }
  static slerpQuatBackOut(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        if (!F(s) || !F(r) || !F(a)) {
          const { vec: f } = D(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), f(1, 0, 0, 0);
        }
        o = X(o, 0, 1);
        const c = 1.7, l = o - 1, h = l * l * ((c + 1) * l + c) + 1, { slerpQuat: u, vec: d } = D(s);
        return u ? u(s, r, h, a) : d(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Sd,
      loop: n,
      methodName: "slerpQuatBackOut"
    };
  }
  static slerpQuatBackInOut(e, t = 0, n = 1) {
    return {
      uid: U(),
      cpu: (s, r, o, a) => {
        if (!F(s) || !F(r) || !F(a)) {
          const { vec: g } = D(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), g(1, 0, 0, 0);
        }
        o = X(o, 0, 1);
        const l = 1.7 * 1.525, h = o / 0.5, u = h - 2, d = h < 1 ? 0.5 * (h * h * (l + 1) * h - l) : 0.5 * (u * u * ((l + 1) * u + l) + 2), { slerpQuat: f, vec: p } = D(s);
        return f ? f(s, r, d, a) : p(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Cd,
      loop: n,
      methodName: "slerpQuatBackInOut"
    };
  }
}
const { cos: st, sin: rt, tan: Pt } = Math, ht = Math.PI / 2, Ji = 0, en = 1, tn = 2, nn = 3, hr = 0, ur = 1, dr = 2, fr = 3, pr = 4, gr = 5, mr = 6, xr = 7, vr = 8, ri = 0, oi = 1, ai = 2, ci = 3, li = 4, hi = 5, ui = 6, di = 7, fi = 8, pi = 9, gi = 10, mi = 11, xi = 12, vi = 13, bi = 14, wi = 15, Sn = new Array(20).fill(0).map((i) => Ti()), Ue = new Array(20).fill(0).map((i) => ne());
function mt(i, e, t, n, s) {
  return i = i || new Array(4), i[0] = e, i[1] = t, i[2] = n, i[3] = s, i;
}
function Je(i, e, t, n, s, r, o, a, c, l) {
  return i = i || new Array(9), i[0] = e, i[1] = t, i[2] = n, i[3] = s, i[4] = r, i[5] = o, i[6] = a, i[7] = c, i[8] = l, i;
}
function pe(i, e, t, n, s, r, o, a, c, l, h, u, d, f, p, g, m) {
  return i = i || new Array(16), i[0] = e, i[1] = t, i[2] = n, i[3] = s, i[4] = r, i[5] = o, i[6] = a, i[7] = c, i[8] = l, i[9] = h, i[10] = u, i[11] = d, i[12] = f, i[13] = p, i[14] = g, i[15] = m, i;
}
const _a = Ti(), Aa = Ti(), Ir = Ti(), Od = Ti();
function de(i) {
  return i[3] * i[0] - i[1] * i[2];
}
function On(i) {
  return i[0] * i[4] * i[8] - i[0] * i[5] * i[7] + i[1] * i[5] * i[6] - i[1] * i[3] * i[8] + i[2] * i[3] * i[7] - i[2] * i[4] * i[6];
}
function Pl(i) {
  return Je(
    _a,
    i[5],
    i[6],
    i[7],
    i[9],
    i[10],
    i[11],
    i[13],
    i[14],
    i[15]
  ), Je(
    Aa,
    i[4],
    i[6],
    i[7],
    i[8],
    i[10],
    i[11],
    i[12],
    i[14],
    i[15]
  ), Je(
    Ir,
    i[4],
    i[5],
    i[7],
    i[8],
    i[9],
    i[11],
    i[12],
    i[13],
    i[15]
  ), Je(
    Ir,
    i[4],
    i[5],
    i[6],
    i[8],
    i[9],
    i[10],
    i[12],
    i[13],
    i[14]
  ), i[0] * On(_a) - i[1] * On(Aa) + i[2] * On(Ir) - i[3] * On(Od);
}
function Ld(i, e) {
  const t = de(i);
  return t === 0 ? null : mt(
    e,
    i[3] / t,
    -i[1] / t,
    -i[2] / t,
    i[0] / t
  );
}
function Nd(i, e) {
  const t = On(i);
  if (t === 0) return null;
  const n = de([i[4], i[5], i[7], i[8]]), s = de([i[3], i[5], i[6], i[8]]), r = de([i[3], i[4], i[6], i[7]]), o = de([i[1], i[2], i[7], i[8]]), a = de([i[0], i[2], i[6], i[8]]), c = de([i[0], i[1], i[6], i[7]]), l = de([i[1], i[2], i[4], i[5]]), h = de([i[0], i[2], i[3], i[5]]), u = de([i[0], i[1], i[3], i[4]]);
  return Je(
    e,
    n / t,
    -o / t,
    l / t,
    -s / t,
    a / t,
    h / t,
    r / t,
    -c / t,
    u / t
  );
}
function Pd(i, e) {
  const t = Pl(i);
  if (t === 0) return null;
  const n = de([i[0], i[1], i[4], i[5]]), s = de([i[0], i[2], i[4], i[6]]), r = de([i[0], i[3], i[4], i[7]]), o = de([i[1], i[2], i[5], i[6]]), a = de([i[1], i[3], i[5], i[7]]), c = de([i[2], i[3], i[6], i[7]]), l = de([i[10], i[11], i[14], i[15]]), h = de([i[9], i[11], i[13], i[15]]), u = de([i[9], i[10], i[13], i[14]]), d = de([i[8], i[11], i[12], i[15]]), f = de([i[8], i[10], i[12], i[14]]), p = de([i[8], i[9], i[12], i[13]]);
  return pe(
    e,
    //                                                     |                                                        |                                                           |
    (i[5] * l - i[6] * h + i[7] * u) / t,
    (-i[1] * l + i[2] * h - i[3] * u) / t,
    (i[12] * c - i[13] * a + i[14] * o) / t,
    (-i[9] * c + i[10] * a - i[11] * o) / t,
    (-i[4] * l + i[6] * d - i[7] * f) / t,
    (i[0] * l - i[2] * d + i[3] * f) / t,
    (-i[12] * c + i[14] * r - i[15] * s) / t,
    (i[8] * c - i[10] * r + i[11] * s) / t,
    (i[4] * h - i[5] * d + i[7] * p) / t,
    (-i[0] * h + i[1] * d - i[3] * p) / t,
    (i[12] * a - i[13] * r + i[15] * n) / t,
    (-i[8] * a + i[9] * r - i[11] * n) / t,
    (-i[4] * u + i[5] * f - i[6] * p) / t,
    (i[0] * u - i[1] * f + i[2] * p) / t,
    (-i[12] * o + i[13] * s - i[14] * n) / t,
    (i[8] * o - i[9] * s + i[10] * n) / t
  );
}
function Bd(i, e, t) {
  return mt(
    t,
    i[0] * e,
    i[1] * e,
    i[2] * e,
    i[3] * e
  );
}
function Dd(i, e, t) {
  return Je(
    t,
    i[0] * e,
    i[1] * e,
    i[2] * e,
    i[3] * e,
    i[4] * e,
    i[5] * e,
    i[6] * e,
    i[7] * e,
    i[8] * e
  );
}
function Ud(i, e, t) {
  return pe(
    t,
    i[0] * e,
    i[1] * e,
    i[2] * e,
    i[3] * e,
    i[4] * e,
    i[5] * e,
    i[6] * e,
    i[7] * e,
    i[8] * e,
    i[9] * e,
    i[10] * e,
    i[11] * e,
    i[12] * e,
    i[13] * e,
    i[14] * e,
    i[15] * e
  );
}
function br(i) {
  return mt(
    i,
    1,
    0,
    0,
    1
  );
}
function Ti(i) {
  return Je(
    i,
    1,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    1
  );
}
function ne(i) {
  return pe(
    i,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1
  );
}
function kd(i, e, t) {
  return mt(
    t,
    e[Ji] * i[Ji] + e[en] * i[tn],
    e[Ji] * i[en] + e[en] * i[nn],
    e[tn] * i[Ji] + e[nn] * i[tn],
    e[tn] * i[en] + e[nn] * i[nn]
  );
}
function Fd(i, e, t) {
  return Je(
    t,
    e[0] * i[0] + e[1] * i[3] + e[2] * i[6],
    e[0] * i[1] + e[1] * i[4] + e[2] * i[7],
    e[0] * i[2] + e[1] * i[5] + e[2] * i[8],
    e[3] * i[0] + e[4] * i[3] + e[5] * i[6],
    e[3] * i[1] + e[4] * i[4] + e[5] * i[7],
    e[3] * i[2] + e[4] * i[5] + e[5] * i[8],
    e[6] * i[0] + e[7] * i[3] + e[8] * i[6],
    e[6] * i[1] + e[7] * i[4] + e[8] * i[7],
    e[6] * i[2] + e[7] * i[5] + e[8] * i[8]
  );
}
function lt(i, e, t) {
  return t = t || [], t[0] = e[0] * i[0] + e[1] * i[4] + e[2] * i[8] + e[3] * i[12], t[1] = e[0] * i[1] + e[1] * i[5] + e[2] * i[9] + e[3] * i[13], t[2] = e[0] * i[2] + e[1] * i[6] + e[2] * i[10] + e[3] * i[14], t[3] = e[0] * i[3] + e[1] * i[7] + e[2] * i[11] + e[3] * i[15], t[4] = e[4] * i[0] + e[5] * i[4] + e[6] * i[8] + e[7] * i[12], t[5] = e[4] * i[1] + e[5] * i[5] + e[6] * i[9] + e[7] * i[13], t[6] = e[4] * i[2] + e[5] * i[6] + e[6] * i[10] + e[7] * i[14], t[7] = e[4] * i[3] + e[5] * i[7] + e[6] * i[11] + e[7] * i[15], t[8] = e[8] * i[0] + e[9] * i[4] + e[10] * i[8] + e[11] * i[12], t[9] = e[8] * i[1] + e[9] * i[5] + e[10] * i[9] + e[11] * i[13], t[10] = e[8] * i[2] + e[9] * i[6] + e[10] * i[10] + e[11] * i[14], t[11] = e[8] * i[3] + e[9] * i[7] + e[10] * i[11] + e[11] * i[15], t[12] = e[12] * i[0] + e[13] * i[4] + e[14] * i[8] + e[15] * i[12], t[13] = e[12] * i[1] + e[13] * i[5] + e[14] * i[9] + e[15] * i[13], t[14] = e[12] * i[2] + e[13] * i[6] + e[14] * i[10] + e[15] * i[14], t[15] = e[12] * i[3] + e[13] * i[7] + e[14] * i[11] + e[15] * i[15], t;
}
function zd(i, ...e) {
  if (e.length <= 0) return ne();
  if (i = i || ne(), e.length === 1) return is(e[0], i);
  let t = e[0], n = Ue[Ue.length - 1], s = Ue[Ue.length - 2];
  i === n && (n = Ue[Ue.length - 3]), i === s && (s = Ue[Ue.length - 3]);
  let r = n;
  for (let o = 1, a = e.length - 1; o < a; ++o) {
    const c = e[o];
    t = lt(t, c, r), r = r === n ? s : n;
  }
  return lt(t, e[e.length - 1], i);
}
function Gd(i, e, t) {
  return mt(
    t,
    i[0] + e[0],
    i[1] + e[1],
    i[2] + e[2],
    i[3] + e[3]
  );
}
function Vd(i, e, t) {
  return Je(
    t,
    i[0] + e[0],
    i[1] + e[1],
    i[2] + e[2],
    i[3] + e[3],
    i[4] + e[4],
    i[5] + e[5],
    i[6] + e[6],
    i[7] + e[7],
    i[8] + e[8]
  );
}
function $d(i, e, t) {
  return pe(
    t,
    i[0] + e[0],
    i[1] + e[1],
    i[2] + e[2],
    i[3] + e[3],
    i[4] + e[4],
    i[5] + e[5],
    i[6] + e[6],
    i[7] + e[7],
    i[8] + e[8],
    i[9] + e[9],
    i[10] + e[10],
    i[11] + e[11],
    i[12] + e[12],
    i[13] + e[13],
    i[14] + e[14],
    i[15] + e[15]
  );
}
function Wd(i, e, t) {
  return mt(
    t,
    i[0] - e[0],
    i[1] - e[1],
    i[2] - e[2],
    i[3] - e[3]
  );
}
function jd(i, e, t) {
  return Je(
    t,
    i[0] - e[0],
    i[1] - e[1],
    i[2] - e[2],
    i[3] - e[3],
    i[4] - e[4],
    i[5] - e[5],
    i[6] - e[6],
    i[7] - e[7],
    i[8] - e[8]
  );
}
function Hd(i, e, t) {
  return pe(
    t,
    i[0] - e[0],
    i[1] - e[1],
    i[2] - e[2],
    i[3] - e[3],
    i[4] - e[4],
    i[5] - e[5],
    i[6] - e[6],
    i[7] - e[7],
    i[8] - e[8],
    i[9] - e[9],
    i[10] - e[10],
    i[11] - e[11],
    i[12] - e[12],
    i[13] - e[13],
    i[14] - e[14],
    i[15] - e[15]
  );
}
function Xd(i, e, t) {
  return mt(
    t,
    i[0] * e[0],
    i[1] * e[1],
    i[2] * e[2],
    i[3] * e[3]
  );
}
function Qd(i, e, t) {
  return Je(
    t,
    i[0] * e[0],
    i[1] * e[1],
    i[2] * e[2],
    i[3] * e[3],
    i[4] * e[4],
    i[5] * e[5],
    i[6] * e[6],
    i[7] * e[7],
    i[8] * e[8]
  );
}
function Yd(i, e, t) {
  return pe(
    t,
    i[0] * e[0],
    i[1] * e[1],
    i[2] * e[2],
    i[3] * e[3],
    i[4] * e[4],
    i[5] * e[5],
    i[6] * e[6],
    i[7] * e[7],
    i[8] * e[8],
    i[9] * e[9],
    i[10] * e[10],
    i[11] * e[11],
    i[12] * e[12],
    i[13] * e[13],
    i[14] * e[14],
    i[15] * e[15]
  );
}
function qd(i, e) {
  return mt(
    e,
    i[0],
    i[2],
    i[1],
    i[3]
  );
}
function Ls(i, e) {
  return Je(
    e,
    i[0],
    i[3],
    i[6],
    i[1],
    i[4],
    i[7],
    i[2],
    i[5],
    i[8]
  );
}
function Kd(i, e) {
  return pe(
    e,
    i[0],
    i[4],
    i[8],
    i[12],
    i[1],
    i[5],
    i[9],
    i[13],
    i[2],
    i[6],
    i[10],
    i[14],
    i[3],
    i[7],
    i[11],
    i[15]
  );
}
function Zd(i, e) {
  return (i >= Math.PI / 2 || i <= -Math.PI / 2) && console.warn("A shear matrix can not have radians >= PI / 2 or <= -PI / 2"), e = e || br(), mt(
    e,
    1,
    0,
    Pt(i),
    1
  );
}
function Jd(i, e) {
  return (i >= Math.PI / 2 || i <= -Math.PI / 2) && console.warn("A shear matrix can not have radians >= PI / 2 or <= -PI / 2"), e = e || br(), mt(
    e,
    1,
    Pt(i),
    0,
    1
  );
}
function ef(i, e, t) {
  (e >= ht || e <= -ht || i >= ht || i <= -ht) && console.warn("A shear matrix can not have radians >= PI / 2 or <= -PI / 2"), t = t || ne();
  const n = Pt(e), s = Pt(i);
  return pe(
    t,
    1,
    0,
    0,
    0,
    s,
    1,
    0,
    0,
    n,
    0,
    1,
    0,
    0,
    0,
    0,
    1
  );
}
function tf(i, e, t) {
  (e >= ht || e <= -ht || i >= ht || i <= -ht) && console.warn("A shear matrix can not have radians >= PI / 2 or <= -PI / 2"), t = t || ne();
  const n = Pt(e), s = Pt(i);
  return pe(
    t,
    1,
    s,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    n,
    1,
    0,
    0,
    0,
    0,
    1
  );
}
function nf(i, e, t) {
  (e >= ht || e <= -ht || i >= ht || i <= -ht) && console.warn("A shear matrix can not have radians >= PI / 2 or <= -PI / 2"), t = t || ne();
  const n = Pt(e), s = Pt(i);
  return pe(
    t,
    1,
    0,
    s,
    0,
    0,
    1,
    n,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1
  );
}
function sf(i, e, t) {
  return ae(
    t,
    i[Ji] * e[0] + i[tn] * e[1],
    i[en] * e[0] + i[nn] * e[1]
  );
}
function rf(i, e, t) {
  return fe(
    t,
    i[hr] * e[0] + i[fr] * e[1] + i[mr] * e[2],
    i[ur] * e[0] + i[pr] * e[1] + i[xr] * e[2],
    i[dr] * e[0] + i[gr] * e[1] + i[vr] * e[2]
  );
}
function of(i, e, t) {
  return ce(
    t,
    i[ri] * e[0] + i[li] * e[1] + i[fi] * e[2] + i[xi] * 1,
    i[oi] * e[0] + i[hi] * e[1] + i[pi] * e[2] + i[vi] * 1,
    i[ai] * e[0] + i[ui] * e[1] + i[gi] * e[2] + i[bi] * 1,
    i[ci] * e[0] + i[di] * e[1] + i[mi] * e[2] + i[wi] * 1
  );
}
function Qs(i, e, t) {
  return ce(
    t,
    i[ri] * e[0] + i[li] * e[1] + i[fi] * e[2] + i[xi] * e[3],
    i[oi] * e[0] + i[hi] * e[1] + i[pi] * e[2] + i[vi] * e[3],
    i[ai] * e[0] + i[ui] * e[1] + i[gi] * e[2] + i[bi] * e[3],
    i[ci] * e[0] + i[di] * e[1] + i[mi] * e[2] + i[wi] * e[3]
  );
}
function af(i) {
  return `Matrix: [
  ${i[0]}, ${i[1]},
  ${i[2]}, ${i[3]},
]`;
}
function cf(i) {
  return `Matrix: [
  ${i[0]}, ${i[1]}, ${i[2]},
  ${i[3]}, ${i[4]}, ${i[5]},
  ${i[6]}, ${i[7]}, ${i[8]},
]`;
}
function lf(i) {
  return `Matrix: [
  ${i[0]}, ${i[1]}, ${i[2]}, ${i[3]},
  ${i[4]}, ${i[5]}, ${i[6]}, ${i[7]},
  ${i[8]}, ${i[9]}, ${i[10]}, ${i[11]},
  ${i[12]}, ${i[13]}, ${i[14]}, ${i[15]},
]`;
}
function Bl(i, e) {
  e = e || new Array(4);
  const t = Math.cos(i), n = Math.sin(i);
  return e[Ji] = t, e[en] = -n, e[tn] = n, e[nn] = t, e;
}
function Dl(i, e, t, n) {
  if (i)
    if (e)
      if (t) {
        const s = st(i), r = st(e), o = st(t), a = rt(i), c = rt(e), l = rt(t);
        return pe(
          n,
          r * o,
          r * l,
          -c,
          0,
          a * c * o - s * l,
          a * c * l + s * o,
          a * r,
          0,
          s * c * o + a * l,
          s * c * l - a * o,
          s * r,
          0,
          0,
          0,
          0,
          1
        );
      } else {
        const s = st(i), r = st(e), o = rt(i), a = rt(e);
        return pe(
          n,
          r,
          0,
          -a,
          0,
          o * a,
          s,
          o * r,
          0,
          s * a,
          -o,
          s * r,
          0,
          0,
          0,
          0,
          1
        );
      }
    else if (t) {
      const s = st(i), r = st(t), o = rt(i), a = rt(t);
      return pe(
        n,
        r,
        a,
        0,
        0,
        -s * a,
        s * r,
        o,
        0,
        o * a,
        -o * r,
        s,
        0,
        0,
        0,
        0,
        1
      );
    } else {
      const s = st(i), r = rt(i);
      return pe(
        n,
        1,
        0,
        0,
        0,
        0,
        s,
        r,
        0,
        0,
        -r,
        s,
        0,
        0,
        0,
        0,
        1
      );
    }
  else if (e)
    if (t) {
      const s = st(e), r = st(t), o = rt(e), a = rt(t);
      return pe(
        n,
        s * r,
        s * a,
        -o,
        0,
        -a,
        r,
        0,
        0,
        o * r,
        o * a,
        s,
        0,
        0,
        0,
        0,
        1
      );
    } else {
      const s = st(e), r = rt(e);
      return pe(
        n,
        s,
        0,
        -r,
        0,
        0,
        1,
        0,
        0,
        r,
        0,
        s,
        0,
        0,
        0,
        0,
        1
      );
    }
  else if (t) {
    const s = st(t), r = rt(t);
    return pe(
      n,
      s,
      r,
      0,
      0,
      -r,
      s,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    );
  } else
    return ne(n);
}
function hf(i, e) {
  return Dl(i[0], i[1], i[2], e);
}
function uf(i, e) {
  return Ul(i[0], i[1], i[2], e);
}
function Ul(i, e, t, n) {
  return pe(
    n,
    i,
    0,
    0,
    0,
    0,
    e,
    0,
    0,
    0,
    0,
    t,
    0,
    0,
    0,
    0,
    1
  );
}
function df(i, e) {
  return kl(i[0], i[1], i[2], e);
}
function kl(i, e, t, n) {
  return pe(
    n,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    i,
    e,
    t,
    1
  );
}
function Uo(i, e, t, n, s, r, o) {
  return o = o || ne(), pe(
    o,
    2 * i / (n - t),
    0,
    0,
    0,
    0,
    2 * i / (s - r),
    0,
    0,
    (n + t) / (n - t),
    (s + r) / (s - r),
    -(e + i) / (e - i),
    -1,
    0,
    0,
    -(2 * e * i) / (e - i),
    0
  );
}
function Fl(i, e, t, n, s, r) {
  const o = t / e, a = Pt(i / 2) * n, c = -a, l = o * a, h = -l;
  return Uo(n, s, c, a, l, h, r);
}
function ff(i, e, t, n, s, r) {
  const o = e / t, a = Pt(i / 2) * n, c = -a, l = o * a, h = -l;
  return Uo(n, s, h, l, a, c, r);
}
function zl(i, e, t, n, s, r, o) {
  return pe(
    o,
    2 / (e - i),
    0,
    0,
    0,
    0,
    2 / (n - t),
    0,
    0,
    0,
    0,
    -1 / (r - s),
    0,
    (e + i) / (i - e),
    (n + t) / (t - n),
    -s / (s - r),
    1
  );
}
function Gl(i, e, t, n, s) {
  return s = s || [0, 0, 0, 0], Qs(i, e, s), ce(
    s,
    (s[0] / s[3] + 1) * 0.5 * t,
    (s[1] / s[3] + 1) * 0.5 * n,
    s[2] / s[3],
    1
  );
}
function Vr(i, e, t, n, s) {
  return Gl(
    i,
    [e[0], e[1], e[2], 1],
    t,
    n,
    s
  );
}
function pf(i, e) {
  return Math.abs(i[0] - e[0]) <= 1e-7 && Math.abs(i[1] - e[1]) <= 1e-7 && Math.abs(i[2] - e[2]) <= 1e-7 && Math.abs(i[3] - e[3]) <= 1e-7;
}
function gf(i, e) {
  return Math.abs(i[0] - e[0]) <= 1e-7 && Math.abs(i[1] - e[1]) <= 1e-7 && Math.abs(i[2] - e[2]) <= 1e-7 && Math.abs(i[3] - e[3]) <= 1e-7 && Math.abs(i[4] - e[4]) <= 1e-7 && Math.abs(i[5] - e[5]) <= 1e-7 && Math.abs(i[6] - e[6]) <= 1e-7 && Math.abs(i[7] - e[7]) <= 1e-7 && Math.abs(i[8] - e[8]) <= 1e-7;
}
function Vl(i, e) {
  return Math.abs(i[0] - e[0]) <= 1e-7 && Math.abs(i[1] - e[1]) <= 1e-7 && Math.abs(i[2] - e[2]) <= 1e-7 && Math.abs(i[3] - e[3]) <= 1e-7 && Math.abs(i[4] - e[4]) <= 1e-7 && Math.abs(i[5] - e[5]) <= 1e-7 && Math.abs(i[6] - e[6]) <= 1e-7 && Math.abs(i[7] - e[7]) <= 1e-7 && Math.abs(i[8] - e[8]) <= 1e-7 && Math.abs(i[9] - e[9]) <= 1e-7 && Math.abs(i[10] - e[10]) <= 1e-7 && Math.abs(i[11] - e[11]) <= 1e-7 && Math.abs(i[12] - e[12]) <= 1e-7 && Math.abs(i[13] - e[13]) <= 1e-7 && Math.abs(i[14] - e[14]) <= 1e-7 && Math.abs(i[15] - e[15]) <= 1e-7;
}
function mf(i) {
  return [i[0], i[1], i[2], i[3]];
}
function xf(i) {
  return [i[0], i[1], i[2], i[3], i[4], i[5], i[6], i[7], i[8]];
}
function is(i, e) {
  return e ? (e[0] = i[0], e[1] = i[1], e[2] = i[2], e[3] = i[3], e[4] = i[4], e[5] = i[5], e[6] = i[6], e[7] = i[7], e[8] = i[8], e[9] = i[9], e[10] = i[10], e[11] = i[11], e[12] = i[12], e[13] = i[13], e[14] = i[14], e[15] = i[15], e) : [
    i[0],
    i[1],
    i[2],
    i[3],
    i[4],
    i[5],
    i[6],
    i[7],
    i[8],
    i[9],
    i[10],
    i[11],
    i[12],
    i[13],
    i[14],
    i[15]
  ];
}
function Ns(i, e, t, n) {
  n = n || [];
  const [s, r, o] = i, [a, c, l] = t, [h, u, d, f, p, g, m, v, b] = e;
  n[ri] = h * s, n[oi] = u * r, n[ai] = d * o, n[ci] = 0, n[li] = f * s, n[hi] = p * r, n[ui] = g * o, n[di] = 0, n[fi] = m * s, n[pi] = v * r, n[gi] = b * o, n[mi] = 0, n[xi] = s * (h * a + f * c + m * l), n[vi] = r * (u * a + p * c + v * l), n[bi] = o * (d * a + g * c + b * l), n[wi] = 1;
}
function $r(i, e, t, n) {
  n = n || [];
  const [s, r, o] = i, [a, c, l] = t, [h, u, d, f, p, g, m, v, b] = e;
  n[ri] = h * s, n[oi] = u * s, n[ai] = d * s, n[ci] = 0, n[li] = f * r, n[hi] = p * r, n[ui] = g * r, n[di] = 0, n[fi] = m * o, n[pi] = v * o, n[gi] = b * o, n[mi] = 0, n[xi] = a, n[vi] = c, n[bi] = l, n[wi] = 1;
}
function vf(i, e, t, n) {
  n = n || [];
  const [s, r] = i, [o, a] = t, [c, l, h, u] = e;
  n[ri] = c * s, n[oi] = l * r, n[ai] = 0, n[ci] = 0, n[li] = h * s, n[hi] = u * r, n[ui] = 0, n[di] = 0, n[fi] = 0, n[pi] = 0, n[gi] = 1, n[mi] = 0, n[xi] = s * (c * o + h * a), n[vi] = r * (l * o + u * a), n[bi] = 0, n[wi] = 1;
}
function $l(i, e, t, n) {
  n = n || [];
  const [s, r] = i, [o, a] = t, [c, l, h, u] = e;
  n[ri] = c * s, n[oi] = l * s, n[ai] = 0, n[ci] = 0, n[li] = h * r, n[hi] = u * r, n[ui] = 0, n[di] = 0, n[fi] = 0, n[pi] = 0, n[gi] = 1, n[mi] = 0, n[xi] = o, n[vi] = a, n[bi] = 0, n[wi] = 1;
}
const bf = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Hadamard2x2: Xd,
  Hadamard3x3: Qd,
  Hadamard4x4: Yd,
  M200: Ji,
  M201: en,
  M210: tn,
  M211: nn,
  M300: hr,
  M301: ur,
  M302: dr,
  M310: fr,
  M311: pr,
  M312: gr,
  M320: mr,
  M321: xr,
  M322: vr,
  M3R: Sn,
  M400: ri,
  M401: oi,
  M402: ai,
  M403: ci,
  M410: li,
  M411: hi,
  M412: ui,
  M413: di,
  M420: fi,
  M421: pi,
  M422: gi,
  M423: mi,
  M430: xi,
  M431: vi,
  M432: bi,
  M433: wi,
  M4R: Ue,
  SRT4x4: $r,
  SRT4x4_2D: $l,
  TRS4x4: Ns,
  TRS4x4_2D: vf,
  add2x2: Gd,
  add3x3: Vd,
  add4x4: $d,
  affineInverse2x2: Ld,
  affineInverse3x3: Nd,
  affineInverse4x4: Pd,
  apply2x2: mt,
  apply3x3: Je,
  apply4x4: pe,
  compare2x2: pf,
  compare3x3: gf,
  compare4x4: Vl,
  concat4x4: zd,
  copy2x2: mf,
  copy3x3: xf,
  copy4x4: is,
  determinant2x2: de,
  determinant3x3: On,
  determinant4x4: Pl,
  identity2: br,
  identity3: Ti,
  identity4: ne,
  multiply2x2: kd,
  multiply3x3: Fd,
  multiply4x4: lt,
  multiplyScalar2x2: Bd,
  multiplyScalar3x3: Dd,
  multiplyScalar4x4: Ud,
  orthographic4x4: zl,
  perspective4x4: Fl,
  perspectiveFOVY4x4: ff,
  perspectiveFrustum4x4: Uo,
  project3As4ToScreen: Vr,
  projectToScreen: Gl,
  rotation2x2: Bl,
  rotation4x4: Dl,
  rotation4x4by3: hf,
  scale4x4: Ul,
  scale4x4by3: uf,
  shearX2x2: Zd,
  shearX4x4: ef,
  shearY2x2: Jd,
  shearY4x4: tf,
  shearZ4x4: nf,
  subtract2x2: Wd,
  subtract3x3: jd,
  subtract4x4: Hd,
  toString2x2: af,
  toString3x3: cf,
  toString4x4: lf,
  transform2: sf,
  transform3: rf,
  transform3as4: of,
  transform4: Qs,
  translation4x4: kl,
  translation4x4by3: df,
  transpose2x2: qd,
  transpose3x3: Ls,
  transpose4x4: Kd
}, Symbol.toStringTag, { value: "Module" })), { cos: es, sin: Pi, sqrt: et, exp: Ia, acos: ko, atan2: Ma, PI: Sa } = Math;
let $e, _t, At, It, Ie, De, Pn, Mt, We, ye, Bn, Ys, qs, Oi, P, dt, bs, wn;
const wf = xe(), Tf = xe(), yf = xe(), Ef = xe(), Rf = 1, _f = 2, Af = 3, If = 0;
function Ze(i, e, t) {
  return i > t ? t : i < e ? e : i;
}
function xe(i) {
  return i ? (i[0] = 0, i[1] = 0, i[2] = 0, i[3] = 0, i) : [0, 0, 0, 0];
}
function Mf(i, e, t) {
  return t = t || xe(), t[0] = i[0] + e[0], t[1] = i[1] + e[1], t[2] = i[2] + e[2], t[3] = i[3] + e[3], t;
}
function Wl(i, e, t) {
  t = t || xe();
  const n = i[0], s = e[0], r = i[1], o = e[1], a = i[2], c = e[2], l = i[3], h = e[3];
  return t[0] = n * s - r * o - a * c - l * h, t[1] = n * o + r * s + a * h - l * c, t[2] = n * c - r * h + a * s + l * o, t[3] = n * h + r * c - a * o + l * s, t;
}
function Sf(i, e, t) {
  t = t || xe();
  const n = i[0], s = i[1], r = i[2], o = i[3], a = e[0], c = e[1], l = e[2], h = e[3], u = a * a + c * c + l * l + h * h;
  if (u === 0)
    t[0] = 0, t[1] = 0, t[2] = 0, t[3] = 0;
  else {
    const d = 1 / u;
    t[0] = (n * a + s * c + r * l + o * h) * d, t[1] = (s * a - n * c - r * h + o * l) * d, t[2] = (r * a - n * l - o * c + s * h) * d, t[3] = (o * a - n * h - s * l + r * c) * d;
  }
  return t;
}
function Cf(i, e) {
  e = e || xe();
  const t = i[0], n = i[1], s = i[2], r = i[3], o = et(n * n + s * s + r * r), a = Ia(t), c = a / o * Pi(o);
  return o === 0 ? (e[0] = Ia(t), e[1] = 0, e[2] = 0, e[3] = 0) : (e[0] = a * es(o), e[1] = n * c, e[2] = s * c, e[3] = r * c), e;
}
function jl(i, e, t) {
  return t = t || xe(), t[0] = i[0] * e, t[1] = i[1] * e, t[2] = i[2] * e, t[3] = i[3] * e, t;
}
function Of(i, e, t) {
  return t = t || xe(), Wl(e, Hl(i), t);
}
function Hl(i, e) {
  return e = e || xe(), e[0] = i[0], e[1] = -i[1], e[2] = -i[2], e[3] = -i[3], e;
}
function Lf(i, e) {
  e = e || xe();
  const t = i[0], n = i[1], s = i[2], r = i[3], o = t * t + n * n + s * s + r * r;
  if (o === 0)
    e[0] = 0, e[1] = 0, e[2] = 0, e[3] = 0;
  else {
    const a = 1 / o;
    e[0] = t * a, e[1] = -n * a, e[2] = -s * a, e[3] = -r * a;
  }
  return e;
}
function Xl(i) {
  const e = i[0], t = i[1], n = i[2], s = i[3];
  return et(e * e + t * t + n * n + s * s);
}
function Nf(i, e) {
  e = e || xe();
  const t = Xl(i);
  if (t === 0) return [0, 0, 0, 0];
  const n = 1 / t;
  return jl(i, n, e);
}
function Pf(i) {
  return i[0];
}
function Bf(i) {
  return [i[1], i[2], i[3]];
}
function Df(i, e) {
  return Lo(i, e);
}
function Uf(i, e, t) {
  t = t || xe();
  const n = i[0], s = i[1], r = i[2], o = 1 / et(n * n + s * s + r * r), a = Pi(e / 2);
  return t[0] = es(e / 2), t[1] = a * n * o, t[2] = a * s * o, t[3] = a * r * o, t;
}
function Ql(i, e, t) {
  t = t || xe();
  const n = i[0], s = i[1], r = i[2], o = Math.cos, a = Math.sin, c = o(n / 2), l = o(s / 2), h = o(r / 2), u = a(n / 2), d = a(s / 2), f = a(r / 2);
  switch (e) {
    case te.xyz:
      t[1] = u * l * h + c * d * f, t[2] = c * d * h - u * l * f, t[3] = c * l * f + u * d * h, t[0] = c * l * h - u * d * f;
      break;
    case te.yxz:
      t[0] = c * l * h + u * d * f, t[1] = u * l * h + c * d * f, t[2] = c * d * h - u * l * f, t[3] = c * l * f - u * d * h;
      break;
    case te.zxy:
      t[0] = c * l * h - u * d * f, t[1] = u * l * h - c * d * f, t[2] = c * d * h + u * l * f, t[3] = c * l * f + u * d * h;
      break;
    case te.zyx:
      t[0] = c * l * h + u * d * f, t[1] = u * l * h - c * d * f, t[2] = c * d * h + u * l * f, t[3] = c * l * f - u * d * h;
      break;
    case te.yzx:
      t[0] = c * l * h - u * d * f, t[1] = u * l * h + c * d * f, t[2] = c * d * h + u * l * f, t[3] = c * l * f - u * d * h;
      break;
    case te.xzy:
      t[0] = c * l * h + u * d * f, t[1] = u * l * h - c * d * f, t[2] = c * d * h - u * l * f, t[3] = c * l * f + u * d * h;
      break;
  }
  return t;
}
function kf(i, e, t) {
  t = t || [0, 0, 0];
  const n = Ql(i, e);
  return Fo(n, te.xyz, t), t;
}
function Tn(i, e, t, n, s, r) {
  r[0] = Ma(i, e), r[1] = ko(t), r[2] = Ma(n, s);
}
function Ff(i, e) {
  return Fo(i, te.zyx, e);
}
function Fo(i, e, t) {
  t = t || [0, 0, 0];
  const n = i[0], s = i[1], r = i[2], o = i[3], a = zo(i), c = a[0], l = a[4], h = a[8], u = a[1], d = a[5], f = a[9], p = a[2], g = a[6], m = a[10];
  switch (e) {
    case te.zyx:
      t[1] = Math.asin(-Ze(p, -1, 1)), Math.abs(p) < 0.99999 ? (t[0] = Math.atan2(g, m), t[2] = Math.atan2(u, c)) : (t[0] = 0, t[2] = Math.atan2(-l, d));
      break;
    case te.zyz:
      Tn(
        2 * r * o + 2 * n * s,
        2 * n * r - 2 * s * o,
        o * o - r * r - s * s + n * n,
        2 * r * o - 2 * n * s,
        2 * s * o + 2 * n * r,
        t
      );
      break;
    case te.zxy:
      t[0] = Math.asin(Ze(g, -1, 1)), Math.abs(g) < 0.99999 ? (t[1] = Math.atan2(-p, m), t[2] = Math.atan2(-l, d)) : (t[1] = 0, t[2] = Math.atan2(u, c));
      break;
    case te.zxz:
      Tn(
        2 * s * o - 2 * n * r,
        2 * r * o + 2 * n * s,
        o * o - r * r - s * s + n * n,
        2 * s * o + 2 * n * r,
        2 * n * s - 2 * r * o,
        t
      );
      break;
    case te.yxz:
      t[0] = Math.asin(-Ze(f, -1, 1)), Math.abs(f) < 0.9999 ? (t[1] = Math.atan2(h, m), t[2] = Math.atan2(u, d)) : (t[1] = Math.atan2(-p, c), t[2] = 0);
      break;
    case te.yxy:
      Tn(
        2 * s * r + 2 * n * o,
        2 * n * s - 2 * r * o,
        r * r - o * o + n * n - s * s,
        2 * s * r - 2 * n * o,
        2 * r * o + 2 * n * s,
        t
      );
      break;
    case te.yzx:
      t[2] = Math.asin(Ze(u, -1, 1)), Math.abs(u) < 0.99999 ? (t[0] = Math.atan2(-f, d), t[1] = Math.atan2(-p, c)) : (t[0] = 0, t[1] = Math.atan2(h, m));
      break;
    case te.yzy:
      Tn(
        2 * r * o - 2 * n * s,
        2 * s * r + 2 * n * o,
        r * r - o * o + n * n - s * s,
        2 * r * o + 2 * n * s,
        2 * n * o - 2 * s * r,
        t
      );
      break;
    case te.xyz:
      t[1] = Math.asin(Ze(h, -1, 1)), Math.abs(h) < 0.99999 ? (t[0] = Math.atan2(-f, m), t[2] = Math.atan2(-l, c)) : (t[0] = Math.atan2(g, d), t[2] = 0);
      break;
    case te.xyx:
      Tn(
        2 * s * r - 2 * n * o,
        2 * s * o + 2 * n * r,
        s * s + n * n - o * o - r * r,
        2 * s * r + 2 * n * o,
        2 * n * r - 2 * s * o,
        t
      );
      break;
    case te.xzy:
      t[2] = Math.asin(-Ze(l, -1, 1)), Math.abs(l) < 0.99999 ? (t[0] = Math.atan2(g, d), t[1] = Math.atan2(h, c)) : (t[0] = Math.atan2(-f, m), t[1] = 0);
      break;
    case te.xzx:
      Tn(
        2 * s * o + 2 * n * r,
        2 * n * o - 2 * s * r,
        s * s + n * n - o * o - r * r,
        2 * s * o - 2 * n * r,
        2 * s * r + 2 * n * o,
        t
      );
      break;
    default:
      console.warn("Invalid Euler rotation order.");
      break;
  }
  return t;
}
function zf(i, e, t) {
  t = t || [0, 0, 0];
  const n = zo(i), s = n[0], r = n[4], o = n[8], a = n[1], c = n[5], l = n[9], h = n[2], u = n[6], d = n[10];
  switch (e) {
    case te.xyz:
      t[1] = Math.asin(Ze(o, -1, 1)), Math.abs(o) < 0.99999 ? (t[0] = Math.atan2(-l, d), t[2] = Math.atan2(-r, s)) : (t[0] = Math.atan2(u, c), t[2] = 0);
      break;
    case te.yxz:
      t[0] = Math.asin(-Ze(l, -1, 1)), Math.abs(l) < 0.9999 ? (t[1] = Math.atan2(o, d), t[2] = Math.atan2(a, c)) : (t[1] = Math.atan2(-h, s), t[2] = 0);
      break;
    case te.zxy:
      t[0] = Math.asin(Ze(u, -1, 1)), Math.abs(u) < 0.99999 ? (t[1] = Math.atan2(-h, d), t[2] = Math.atan2(-r, c)) : (t[1] = 0, t[2] = Math.atan2(a, s));
      break;
    case te.zyx:
      t[1] = Math.asin(-Ze(h, -1, 1)), Math.abs(h) < 0.99999 ? (t[0] = Math.atan2(u, d), t[2] = Math.atan2(a, s)) : (t[0] = 0, t[2] = Math.atan2(-r, c));
      break;
    case te.yzx:
      t[2] = Math.asin(Ze(a, -1, 1)), Math.abs(a) < 0.99999 ? (t[0] = Math.atan2(-l, c), t[1] = Math.atan2(-h, s)) : (t[0] = 0, t[1] = Math.atan2(o, d));
      break;
    case te.xzy:
      t[2] = Math.asin(-Ze(r, -1, 1)), Math.abs(r) < 0.99999 ? (t[0] = Math.atan2(u, c), t[1] = Math.atan2(o, s)) : (t[0] = Math.atan2(-l, d), t[1] = 0);
      break;
  }
}
function Gf(i) {
  const e = i[0];
  if (e < -1 || e > 1)
    return 0;
  const t = 2 * ko(e);
  return t > Sa ? t - 2 * Sa : t;
}
function Vf(i) {
  const e = i[1], t = i[2], n = i[3];
  if (et(e * e + t * t + n * n) === 0) return [0, 0, 0];
  const r = 1 / et(e * e + t * t + n * n);
  return [e * r, t * r, n * r];
}
function Wr(i, e) {
  e = e || Ti();
  const t = i[1] + i[1], n = i[2] + i[2], s = i[3] + i[3], r = i[1] * t, o = i[1] * n, a = i[1] * s, c = i[2] * n, l = i[2] * s, h = i[3] * s, u = i[0] * t, d = i[0] * n, f = i[0] * s;
  return e[hr] = 1 - (c + h), e[ur] = o - f, e[dr] = a + d, e[fr] = o + f, e[pr] = 1 - (r + h), e[gr] = l - u, e[mr] = a - d, e[xr] = l + u, e[vr] = 1 - (r + c), e;
}
function $f(i, e) {
  e = e || ne();
  const t = i[1] + i[1], n = i[2] + i[2], s = i[3] + i[3], r = i[1] * t, o = i[1] * n, a = i[1] * s, c = i[2] * n, l = i[2] * s, h = i[3] * s, u = i[0] * t, d = i[0] * n, f = i[0] * s;
  return e[ri] = 1 - (c + h), e[oi] = o - f, e[ai] = a + d, e[ci] = 0, e[li] = o + f, e[hi] = 1 - (r + h), e[ui] = l - u, e[di] = 0, e[fi] = a - d, e[pi] = l + u, e[gi] = 1 - (r + c), e[mi] = 0, e[xi] = 0, e[vi] = 0, e[bi] = 0, e[wi] = 1, e;
}
function Wf(i, e) {
  e = e || Ti();
  const t = i[1] + i[1], n = i[2] + i[2], s = i[3] + i[3], r = i[1] * t, o = i[1] * n, a = i[1] * s, c = i[2] * n, l = i[2] * s, h = i[3] * s, u = i[0] * t, d = i[0] * n, f = i[0] * s;
  return e[hr] = 1 - (c + h), e[fr] = o - f, e[mr] = a + d, e[ur] = o + f, e[pr] = 1 - (r + h), e[xr] = l - u, e[dr] = a - d, e[gr] = l + u, e[vr] = 1 - (r + c), e;
}
function zo(i, e) {
  e = e || ne();
  const t = i[1] + i[1], n = i[2] + i[2], s = i[3] + i[3], r = i[1] * t, o = i[1] * n, a = i[1] * s, c = i[2] * n, l = i[2] * s, h = i[3] * s, u = i[0] * t, d = i[0] * n, f = i[0] * s;
  return e[ri] = 1 - (c + h), e[li] = o - f, e[fi] = a + d, e[xi] = 0, e[oi] = o + f, e[hi] = 1 - (r + h), e[pi] = l - u, e[vi] = 0, e[ai] = a - d, e[ui] = l + u, e[gi] = 1 - (r + c), e[bi] = 0, e[ci] = 0, e[di] = 0, e[mi] = 0, e[wi] = 1, e;
}
function jf(i, e) {
  e = e || xe();
  const [t, n, s] = i, r = es(t / 2), o = es(n / 2), a = es(s / 2), c = Pi(t / 2), l = Pi(n / 2), h = Pi(s / 2), u = o * a, d = l * h, f = o * h, p = l * a;
  return e[0] = r * u + c * d, e[1] = c * u - r * d, e[2] = r * p + c * f, e[3] = r * f - c * p, e;
}
function Yl(i, e, t) {
  return t = t || xe(), wn = pt([-i[0], -i[1], -i[2]], Ve[Ve.length - 1]), dt = pt(tt(e, wn, Ve[Ve.length - 2])), bs = tt(wn, dt, Ve[Ve.length - 3]), Ie = dt[0], De = bs[0], Pn = wn[0], We = dt[1], ye = bs[1], Bn = wn[1], Ys = dt[2], qs = bs[2], Oi = wn[2], P = (1 + Ie + ye + Oi) * 0.25, P > 0 ? (P = Math.sqrt(P), t[0] = P, P = 1 / (4 * P), t[1] = (Bn - qs) * P, t[2] = (Ys - Pn) * P, t[3] = (De - We) * P) : (t[0] = 0, P = -0.5 * (ye + Oi), P > 0 ? (P = Math.sqrt(P), t[1] = P, P *= 2, t[2] = De / P, t[3] = Pn / P) : (t[1] = 0, P = 0.5 * (1 - Oi), P > 0 ? (P = Math.sqrt(P), t[2] = P, t[3] = Bn / (2 * P)) : (t[2] = 0, t[3] = 1))), t;
}
function Hf(i, e) {
  if (e = e || xe(), $e = i[0], _t = i[3], At = i[6], It = i[1], Ie = i[4], De = i[7], Mt = i[2], We = i[5], ye = i[8], P = $e + Ie + ye, P > 0) {
    const n = et(P + 1) * 2;
    return e[0] = 0.25 * n, e[1] = (We - De) / n, e[2] = (At - Mt) / n, e[3] = (It - _t) / n, e;
  }
  if ($e > Ie && $e > ye) {
    const n = et(1 + $e - Ie - ye) * 2;
    return e[0] = (We - De) / n, e[1] = 0.25 * n, e[2] = (_t + It) / n, e[3] = (At + Mt) / n, e;
  }
  if (Ie > ye) {
    const n = et(1 + Ie - $e - ye) * 2;
    return e[0] = (At - Mt) / n, e[1] = (It + _t) / n, e[2] = 0.25 * n, e[3] = (We + De) / n, e;
  }
  const t = et(1 + ye - $e - Ie) * 2;
  return e[0] = (It - _t) / t, e[1] = (Mt + At) / t, e[2] = (We + De) / t, e[3] = 0.25 * t, e;
}
function Xf(i, e) {
  if (e = e || xe(), $e = i[0], _t = i[4], At = i[8], It = i[1], Ie = i[5], De = i[9], Mt = i[2], We = i[6], ye = i[10], P = $e + Ie + ye, P > 0) {
    const n = et(P + 1) * 2;
    return e[0] = 0.25 * n, e[1] = (We - De) / n, e[2] = (At - Mt) / n, e[3] = (It - _t) / n, e;
  }
  if ($e > Ie && $e > ye) {
    const n = et(1 + $e - Ie - ye) * 2;
    return e[0] = (We - De) / n, e[1] = 0.25 * n, e[2] = (_t + It) / n, e[3] = (At + Mt) / n, e;
  }
  if (Ie > ye) {
    const n = et(1 + Ie - $e - ye) * 2;
    return e[0] = (At - Mt) / n, e[1] = (It + _t) / n, e[2] = 0.25 * n, e[3] = (We + De) / n, e;
  }
  const t = et(1 + ye - $e - Ie) * 2;
  return e[0] = (It - _t) / t, e[1] = (Mt + At) / t, e[2] = (We + De) / t, e[3] = 0.25 * t, e;
}
function Go(i, e, t, n, s) {
  return s = s || xe(), Ie = i[0] / e, De = i[4] / t, Pn = i[8] / n, We = i[1] / e, ye = i[5] / t, Bn = i[9] / n, Ys = i[2] / e, qs = i[6] / t, Oi = i[10] / n, P = (1 + Ie + ye + Oi) * 0.25, P > 0 ? (P = Math.sqrt(P), s[0] = P, P = 1 / (4 * P), s[1] = (Bn - qs) * P, s[2] = (Ys - Pn) * P, s[3] = (De - We) * P) : (s[0] = 0, P = -0.5 * (ye + Oi), P > 0 ? (P = Math.sqrt(P), s[1] = P, P *= 2, s[2] = De / P, s[3] = Pn / P) : (s[1] = 0, P = 0.5 * (1 - Oi), P > 0 ? (P = Math.sqrt(P), s[2] = P, s[3] = Bn / (2 * P)) : (s[2] = 0, s[3] = 1))), s;
}
function Qf(i, e, t) {
  t = t || ne();
  const n = pt([-i[0], -i[1], -i[2]]), s = pt(tt(e, n)), r = tt(n, s);
  return t[0] = s[0], t[1] = r[0], t[2] = n[0], t[3] = 0, t[4] = s[1], t[5] = r[1], t[6] = n[1], t[7] = 0, t[8] = s[2], t[9] = r[2], t[10] = n[2], t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, t;
}
function jr(i, e, t) {
  return dt = on(e[1], e[2], e[3]), P = e[0], ni(
    ni(ut(dt, 2 * Ws(dt, i)), ut(i, P * P - Ws(dt, dt))),
    ut(tt(dt, i), 2 * P),
    t
  );
}
function Yf(i, e, t, n) {
  n = n || xe();
  const s = [0, 0, 0, 0];
  let r, o, a, c, l;
  return o = i[1] * e[1] + i[2] * e[2] + i[3] * e[3] + i[0] * e[0], o < 0 ? (o = -o, s[0] = -e[1], s[1] = -e[2], s[2] = -e[3], s[3] = -e[0]) : (s[0] = e[1], s[1] = e[2], s[2] = e[3], s[3] = e[0]), 1 - o > 1e-7 ? (r = ko(o), a = Pi(r), c = Pi((1 - t) * r) / a, l = Pi(t * r) / a) : (c = 1 - t, l = t), n[1] = c * i[1] + l * s[0], n[2] = c * i[2] + l * s[1], n[3] = c * i[3] + l * s[2], n[0] = c * i[0] + l * s[3], n;
}
function Ks() {
  return [1, 0, 0, 0];
}
function qf() {
  return [0, 1, 0, 0];
}
function Kf() {
  return [0, 0, 1, 0];
}
function Zf() {
  return [0, 0, 0, 1];
}
const Jf = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  QR1: wf,
  QR2: Tf,
  QR3: yf,
  QR4: Ef,
  QW: If,
  QX: Rf,
  QY: _f,
  QZ: Af,
  addQuat: Mf,
  angleQuat: Gf,
  axisQuat: Vf,
  clamp: Ze,
  conjugateQuat: Hl,
  decomposeRotation: Go,
  diffUnitQuat: Of,
  divideQuat: Sf,
  dotQuat: Df,
  eulerToQuat: jf,
  exponentQuat: Cf,
  fromEulerAxisAngleToQuat: Uf,
  fromOrderedEulerToQuat: Ql,
  iQuat: qf,
  imaginaryQuat: Bf,
  inverseQuat: Lf,
  jQuat: Kf,
  kQuat: Zf,
  lengthQuat: Xl,
  lookAtMatrix: Qf,
  lookAtQuat: Yl,
  matrix3x3FromUnitQuatModel: Wr,
  matrix3x3FromUnitQuatView: Wf,
  matrix3x3ToQuaternion: Hf,
  matrix4x4FromUnitQuatModel: $f,
  matrix4x4FromUnitQuatView: zo,
  matrix4x4ToQuaternion: Xf,
  multiplyQuat: Wl,
  normalizeQuat: Nf,
  oneQuat: Ks,
  realQuat: Pf,
  rotateVectorByUnitQuat: jr,
  scaleQuat: jl,
  slerpUnitQuat: Yf,
  toEulerFromQuat: Ff,
  toEulerXYZfromOrderedEuler: kf,
  toOrderedEulerFromQuat: Fo,
  toOrderedEulerFromQuat2: zf,
  zeroQuat: xe
}, Symbol.toStringTag, { value: "Module" }));
function ql(i, e) {
  return [i, e];
}
function ep(i, e, t) {
  return t = t || [0, 0, 0], ni(i[0], ut(i[1], e), t);
}
function Kl(i, e, t) {
  return t = t || [
    [0, 0, 0],
    [0, 0, 0]
  ], ct(i, t[0]), pt(Jt(e, i), t[1]), t;
}
const tp = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ray: ql,
  rayFromPoints: Kl,
  rayToLocation: ep
}, Symbol.toStringTag, { value: "Module" })), qx = bf, Kx = Jf, Zx = tp, Jx = Lu;
let He = class {
  constructor() {
    this.promise = new Promise(
      (e, t) => (this.resolver = e, this.rejector = t)
    );
  }
  resolve(e) {
    this.resolver(e);
  }
  reject(e) {
    this.rejector(e);
  }
}, gt = -1, Zs = 0, Js = [], ts = [], Yn = [];
const Fn = /* @__PURE__ */ new Map(), Vn = (i) => {
  Zs = i;
  let e = !1;
  const t = [];
  Fn.forEach((s, r) => {
    e = !0;
    let {
      0: o,
      1: a,
      2: c,
      3: l,
      4: h,
      5: u
    } = s;
    if (l !== -1) {
      if (h === -1 && (h = i, s[4] = i), i - h >= l) {
        t.push(r), o(
          i - (u ? h : 0),
          h + l - (u ? h : 0)
        );
        return;
      }
    } else h === -1 && (h = i, s[4] = i);
    const d = u ? h : 0;
    if (a !== -1) {
      if (c === -1 && (s[2] = i, c = i), i - c >= a)
        for (o(i - d); i - c >= a; )
          s[2] += a, c += a;
    } else
      o(i - d);
  });
  for (let s = 0, r = t.length; s < r; ++s) {
    const o = t[s];
    Fn.delete(o);
  }
  const n = ts.slice();
  ts = [];
  for (let s = 0, r = n.length; s < r; ++s) {
    const { 0: o, 1: a, 2: c } = n[s];
    a <= 0 ? o && o(i) : i - c > a ? o(i) : (e = !0, ts.push(n[s]));
  }
  for (let s = 0, r = Yn.length; s < r; ++s) {
    const o = Yn[s];
    o && (e = !0, o(i));
  }
  Yn = Js.slice(0), Js = [], Yn.length > 0 && (e = !0), e ? gt = requestAnimationFrame(Vn) : gt = -1;
};
gt = requestAnimationFrame(Vn);
function Zl(i) {
  const e = new He();
  return Js.push((t) => {
    i && i(t), e.resolve(t);
  }), gt === -1 && (gt = requestAnimationFrame(Vn)), e.promise;
}
function ki(i, e) {
  const t = new He(), n = (s) => {
    i && i(s), t.resolve(s);
  };
  return ts.push([n, e || -1, Zs]), gt === -1 && (gt = requestAnimationFrame(Vn)), t.promise;
}
function Jl(i, e, t, n = !1) {
  const s = new He(), r = (o, a) => {
    i(o), t !== void 0 && t > 0 ? a !== void 0 && s.resolve(a) : s.resolve(o);
  };
  return Fn.set(s.promise, [
    r,
    e || -1,
    -1,
    t || -1,
    -1,
    n
  ]), gt === -1 && (gt = requestAnimationFrame(Vn)), s.promise;
}
function Ca(i) {
  Fn.delete(i), gt === -1 && (gt = requestAnimationFrame(Vn));
}
function tv() {
  Fn.forEach((i) => i[0](Zs, Zs)), Fn.clear(), ts = [], Js = [], Yn = [];
}
const an = /* @__PURE__ */ new Set(), eh = an.add.bind(an), th = an.delete.bind(an), ih = async () => {
  await Jl(
    () => {
      an.size !== 0 && (an.forEach((i) => i.update()), an.clear());
    },
    void 0,
    Number.POSITIVE_INFINITY
  ), ih();
};
ih();
class nh {
  constructor() {
    this._children = [], this._needsUpdate = !1, this._childUpdate = /* @__PURE__ */ new Set();
  }
  /**
   * The parent node of this node.
   */
  get parent() {
    return this._parent;
  }
  set parent(e) {
    this.setParent(e);
  }
  get children() {
    return this._children;
  }
  /** This flag indicates this node itself needs to be updated */
  get needsUpdate() {
    return this._needsUpdate;
  }
  get childUpdate() {
    return this._childUpdate;
  }
  /**
   * This adds a child to this node. This allows for unsafe adding of the child
   * which will not update the other hierarchy properties.
   */
  addChild(e, t) {
    e.parent !== this && (t || e.setParent(this, !0), this._children.push(e), this._childUpdate.add(e), e.invalidate());
  }
  /**
   * This flags this node as invalid and sets all of it's children as needing to
   * be updated as a result. This effectively flags the entrie branch system
   * beneath this node as needing to be updated.
   */
  invalidate() {
    if (this._needsUpdate) return !1;
    this._needsUpdate = !0;
    for (let e = 0, t = this._children.length; e < t; ++e) {
      const n = this._children[e];
      this._childUpdate.add(n), n.invalidate();
    }
    return !0;
  }
  /**
   * This retrieves and analyzes all of the nodes that are needing an update up
   * the chain from the current node. This resolves each node as it's
   * discovered.
   */
  processParentUpdates(e) {
    if (!this._parent || !this._parent._needsUpdate) return;
    const t = [];
    let n = this._parent;
    for (; n && (t.push(n), n._parent && n._parent.needsUpdate); )
      n = n._parent;
    for (let s = t.length - 1; s >= 0; --s) {
      const r = t[s];
      e(r), r.resolve();
    }
  }
  /**
   * Removes the specified child from this node. Only works if the child
   * specifies this node as it's parent. This allows for unsafe removal of the
   * child which will not update the other hierarchy properties.
   */
  removeChild(e, t) {
    e._parent === this && (e._parent !== void 0 && !t && e.setParent(void 0, !0), this._children.splice(this._children.indexOf(e), 1), this._childUpdate.delete(e));
  }
  /**
   * Clears update flags that are set from invalidation. This clears the nodes
   * personal flag as well as the gate flag the parent contains for the node as
   * well.
   */
  resolve() {
    this._needsUpdate && (this._needsUpdate = !1, this._parent && this._parent._childUpdate.delete(this));
  }
  /**
   * Sets the parent of this node to the specified node. This is the same in
   * most cases to node.parent = aNode; but this method allows for unsafe
   * modification to the parent.
   */
  setParent(e, t) {
    this._parent !== e && (t || (e !== void 0 && e.addChild(this, !0), this._parent && this._parent.removeChild(this, !0)), this._parent = e, this.invalidate());
  }
}
class Vo extends nh {
  constructor(e) {
    super(), this.isQueuedForUpdate = !1, this.needsWorldOrientation = !1, this.needsWorldDecomposition = !1, this.hasViewMatrix = !1, this._instance = null, this._matrix = { value: ne() }, this._localMatrix = { value: this._matrix.value }, this._rotation = { value: Ks() }, this._localRotation = {
      value: this._rotation.value
    }, this.localRotationMatrix = Ti(), this._scale = { value: [1, 1, 1] }, this._localScale = { value: this._scale.value }, this._position = { value: [0, 0, 0] }, this._localPosition = {
      value: this._position.value
    }, this._forward = { value: Cn() }, this._localForward = { value: this._forward.value }, this.needsForwardUpdate = !1, e && (e.localPosition && (this.localPosition = e.localPosition), e.localRotation && (this.localRotation = e.localRotation), e.localScale && (this.localScale = e.localScale), e.parent && (this.parent = e.parent));
  }
  set instance(e) {
    this._instance !== e && this._instance && (this._instance.transform.instance = null, e && (e.transform = this)), this._instance = e;
  }
  /**
   * This is the inner matrix that represents the culmination of all the
   * properties into a single transform matrix. It is invalid and will cause
   * undefined behavior if the elements of this matrix are modified. You should
   * use the provided methods of this Transform class to manipulate this matrix.
   *
   * This matrix is what is used to transform coordinates into world space, thus
   * it is also the culmination of all the parent's to this particular
   * transform.
   */
  get matrix() {
    return this.update(), this._matrix.value;
  }
  /**
   * This is the local matrix which represents the transform this Transform
   * performs which does NOT include the parent transforms to this transform.
   */
  get localMatrix() {
    return this.update(), this._localMatrix.value;
  }
  /**
   * This is the transform matrix that contains the operations in reverse order.
   * This produces a 'view matrix' for the transform and shouldn't be considered
   * an inverse matrix. This is commonly used for Camera constructs whos
   * orientation is reverse to the world (the camera would exist in world space
   * using the normal world matrix, but the operations to transform everything
   * to the cameras perspective is in the exact opposite order.)
   */
  get viewMatrix() {
    return this.hasViewMatrix = !0, this._viewMatrix === void 0 && this.invalidate(), this.update(), this._viewMatrix === void 0 ? ne() : this._viewMatrix.value;
  }
  /**
   * This excludes any parent transform information and is the view matrix
   * specific to this transform.
   *
   * This is the transform matrix that contains the operations in reverse order.
   * This produces a 'view matrix' for the transform and shouldn't be considered
   * an inverse matrix. This is commonly used for Camera constructs whos
   * orientation is reverse to the world (the camera would exist in world space
   * using the normal world matrix, but the operations to transform everything
   * to the cameras perspective is in the exact opposite order.)
   */
  get localViewMatrix() {
    return this.hasViewMatrix = !0, this._localViewMatrix === void 0 && this.invalidate(), this.update(), this._localViewMatrix === void 0 ? ne() : this._localViewMatrix.value;
  }
  /**
   * Transforms can have an additional modification for non-affine or
   * specialized transforms that are generally considered too expensive to keep
   * track of at all times.
   *
   * This is NOT applied to the viewMatrix output. Use localViewTransform for
   * that.
   *
   * Applying this matrix to this Transform will make 'world space' values
   * invalid.
   *
   * Why do world calculations stop working? Since this transform is so generic
   * there is no good way to derive that information anymore.
   */
  get localTransform() {
    var e;
    return (e = this._localTransform) == null ? void 0 : e.value;
  }
  set localTransform(e) {
    e ? (this._localTransform || (this._localTransform = { value: ne() }), is(e, this._localTransform.value), this._localTransform.didUpdate = !0) : delete this._localTransform, this.invalidate();
  }
  /**
   * This is the same as localTransform except it is ONLY applied to the view.
   * We have a transform for the view and the node separated as there are more
   * cases to have specialized view calculations, but require having the node be
   * left unaffected. Such as having elements follow the Camera, but have the
   * camera distort the final output space.
   *
   * Transforms can have an additional modification for non-affine or
   * specialized transforms that are generally considered too expensive to keep
   * track of at all times.
   *
   * Applying this matrix to this Transform will make 'world space' values
   * invalid.
   *
   * Why do world calculations stop working? Since this transform is so generic
   * there is no good way to derive that information anymore.
   */
  get localViewTransform() {
    var e;
    return (e = this._localViewTransform) == null ? void 0 : e.value;
  }
  set localViewTransform(e) {
    e ? (this._localViewTransform || (this._localViewTransform = { value: ne() }), is(e, this._localViewTransform.value), this._localViewTransform.didUpdate = !0) : delete this._localViewTransform, this.invalidate();
  }
  /**
   * Orientation of this transform in world space. When no parent is present
   * rotation === localRotation.
   *
   * If localTransform is present, this value may be incorrect.
   */
  get rotation() {
    return this.needsWorldOrientation = !0, this.update(), this._rotation.value;
  }
  set rotation(e) {
    this.parent ? console.warn(
      "NOT IMPLEMENTED: Setting world rotation when a parent is present is not supported yet. Use localRotation for now."
    ) : this.localRotation = e;
  }
  /**
   * Orientation of this transform without it's parent's orientation. When no
   * parent is present rotation === localRotation.
   */
  get localRotation() {
    return this._localRotation.value;
  }
  set localRotation(e) {
    ce(this._localRotation.value, e[0], e[1], e[2], e[3]), this._localRotation.didUpdate = !0, this.invalidate(), this.needsForwardUpdate = !0;
  }
  /**
   * The scale of the Transform in world space. When there is no parent,
   * localScale === scale.
   *
   * If localTransform is present, this value may be incorrect.
   */
  get scale() {
    return this.needsWorldOrientation = !0, this.update(), this._scale.value;
  }
  set scale(e) {
    this.parent ? console.warn(
      "NOT IMPLEMENTED: Setting world scale is not supported yet. Use localScale for now."
    ) : this.localScale = e;
  }
  /**
   * The scale this Transform applies ignoring the parent Transform. When there
   * is no parent, localScale === scale.
   */
  get localScale() {
    return this._localScale.value;
  }
  set localScale(e) {
    fe(this._localScale.value, e[0], e[1], e[2]), this._localScale.didUpdate = !0, this.invalidate();
  }
  /**
   * Translation of this transform in world space. When there is no parent,
   * position === localPosition.
   *
   * If localTransform is present, this value may be incorrect.
   */
  get position() {
    return this.needsWorldOrientation = !0, this.update(), this._position.value;
  }
  set position(e) {
    this.parent ? console.warn(
      "NOT IMPLEMENTED: Setting world position is not supported yet. Use localPosition for now."
    ) : this.localPosition = e;
  }
  /**
   * The position this transform applies ignoring the parent Transform. When
   * there is no parent, position === localPosition.
   */
  get localPosition() {
    return this._localPosition.value;
  }
  set localPosition(e) {
    this._localPosition.value[0] = e[0], this._localPosition.value[1] = e[1], this._localPosition.value[2] = e[2], this._localPosition.didUpdate = !0, this.invalidate();
  }
  /**
   * The forward vector for this particular transform in world space. When no
   * parent is present, forward === localForward.
   */
  get forward() {
    var e;
    return (this.needsForwardUpdate || (e = this.parent) != null && e.childUpdate.has(this)) && (this.needsForwardUpdate = !1, jr(
      Cn(),
      this._rotation.value,
      this._forward.value
    )), this._forward.value;
  }
  /**
   * The forward vector for this particular transform ignoring the parent
   * transform. When no parent is present, forward === localForward.
   */
  get localForward() {
    return this.needsForwardUpdate && (this.needsForwardUpdate = !1, jr(
      Cn(),
      this._localRotation.value,
      this._localForward.value
    )), this._localForward.value;
  }
  /**
   * Adjusts the transform's properties all at once to shave off a little bit of
   * overhead.
   */
  applyLocalSRT(e, t, n) {
    this._localScale.value = e, this._localPosition.value = n, this._localRotation.value = t, this._localScale.didUpdate = !0, this._localPosition.didUpdate = !0, this._localRotation.didUpdate = !0, this.invalidate(), this._instance && (this._instance.transform = this);
  }
  /**
   * This method contains the math involved in decomposing our world SRT matrix
   * so we can view the Transform's orientation relative to world space.
   */
  decomposeWorldMatrix() {
    if (!this.needsWorldDecomposition || !this.parent || !this._matrix.didUpdate || this._matrix.value === this._localMatrix.value)
      return;
    if (this._instance) {
      if (!this._instance.needsWorldUpdate || !this.needsWorldOrientation)
        return;
    } else if (!this.needsWorldOrientation)
      return;
    this.needsWorldDecomposition = !1;
    const e = this._matrix.value, t = this._position.value, n = this._scale.value;
    this._position.didUpdate = t[0] !== e[12] || t[1] !== e[13] || t[2] !== e[14], this._position.didUpdate && fe(t, e[12], e[13], e[14]);
    const s = Ni(e[0], e[1], e[2], e[3]), r = Ni(e[4], e[5], e[6], e[7]), o = Ni(e[8], e[9], e[10], e[11]);
    this._scale.didUpdate = n[0] !== s || n[1] !== r || n[2] !== o, fe(n, s, r, o), this._scale.didUpdate = !0;
    const [a, c, l, h] = this._rotation.value;
    Go(this._matrix.value, s, r, o, this._rotation.value);
    const u = this._rotation.value;
    this._rotation.didUpdate = u[0] !== a || u[1] !== c || u[2] !== l || u[3] !== h;
  }
  /**
   * Orients this transform to make the forward direction point toward a
   * position relative to this transform. When no parent is present, lookAt and
   * lookAtLocal behaves exactly the same.
   */
  lookAtLocal(e, t) {
    Yl(
      Jt(e, this._localPosition.value, Ve[0]),
      t || [0, 1, 0],
      this._localRotation.value
    ), this._localRotation.didUpdate = !0, this.invalidate(), this.needsForwardUpdate = !0;
  }
  /**
   * Makes world space and local space information have it's own memory
   * allotment as they should be different after calling this method.
   */
  divideMemory() {
    this._forward.value = Cn(), this._matrix.value = ne(), this._rotation.value = Ks(), this._scale.value = [1, 1, 1], this._position.value = [0, 0, 0], this.hasViewMatrix && this._viewMatrix && this._localViewMatrix && (this._viewMatrix.value = ne());
  }
  /**
   * Merges local and world space information as they'll be identical.
   */
  mergeMemory() {
    this._forward.value = this._localForward.value, this._matrix.value = this._localMatrix.value, this._rotation.value = this._localRotation.value, this._scale.value = this._localScale.value, this._position.value = this._localPosition.value, this.hasViewMatrix && this._viewMatrix && this._localViewMatrix && (this._viewMatrix.value = this._localViewMatrix.value);
  }
  /**
   * Changes the parent transform of this Transform. This triggers required
   * updates for this Transform.
   */
  setParent(e, t) {
    e !== this.parent && (e ? this.parent || this.divideMemory() : this.mergeMemory(), this.invalidate(), this.needsForwardUpdate = !0, this._localScale.didUpdate = !0, this._localRotation.didUpdate = !0, this._localPosition.didUpdate = !0, super.setParent(e, t));
  }
  /**
   * We override the invalidation to aid in handling the issue with our
   * rendering system being "passive" and our node structure to be "passive" as
   * well.
   */
  invalidate() {
    return this.queueForUpdate(), super.invalidate();
  }
  /**
   * This is an ambiguous but simple method that attempts to re-optimize this
   * transform. If you have maybe a one time analysis of properties over the
   * course of a lengthy period of time, consider calling this.
   *
   * Instances and transforms take the approach of "shifting gears" toward world
   * decomposition after world orientations are queried. However, you may not
   * always need or rarely need a specific world orientation. Thus calling this
   * method will make the instance and transform assume it no longer needs world
   * orientations once again until something queries for it.
   */
  optimize() {
    this.needsWorldOrientation = !1;
  }
  /**
   * Ensures this transform WILL receive an update if it fits requirements for
   * potentially missing an update that may be needed by passive elements.
   */
  queueForUpdate() {
    !this.isQueuedForUpdate && this._instance && this._instance.active && (this.isQueuedForUpdate = !0, eh(this));
  }
  /**
   * If needed, this updates the matrix for this transform. This is called
   * automatically when the matrix is retrieved.
   *
   * The unsafe flag causes this node to update without ensuring it's parents
   * are out of date. Recommended to not use this flag ever. The system handles
   * all of that for you.
   */
  update(e) {
    let t = !1;
    if (this.isQueuedForUpdate && (th(this), this.isQueuedForUpdate = !1), this.needsUpdate) {
      const n = this.localRotationMatrix;
      this._localRotation.didUpdate && Wr(this._localRotation.value, n), this._localTransform ? ($r(this._localScale.value, n, this._localPosition.value, Ue[0]), lt(
        this._localTransform.value,
        Ue[0],
        this._localMatrix.value
      )) : $r(
        this._localScale.value,
        n,
        this._localPosition.value,
        this._localMatrix.value
      ), this._localMatrix.didUpdate = !0, t = !0, this.hasViewMatrix && (this._viewMatrix === void 0 && (this._viewMatrix = { value: ne() }), this._localViewMatrix === void 0 && (this.parent ? this._localViewMatrix = { value: ne() } : this._localViewMatrix = { value: this._viewMatrix.value }), this._localViewTransform ? (Ns(
        Jn(this._localScale.value, Ve[0]),
        Ls(n, Sn[1]),
        ut(this._localPosition.value, -1, Ve[1]),
        Ue[0]
      ), lt(
        this._localViewTransform.value,
        Ue[0],
        this._localViewMatrix.value
      )) : Ns(
        Jn(this._localScale.value, Ve[0]),
        Ls(n, Sn[1]),
        ut(this._localPosition.value, -1, Ve[1]),
        this._localViewMatrix.value
      ), this._localViewMatrix.didUpdate = !0);
    }
    this.parent && (this.parent.needsUpdate ? (e || this.processParentUpdates((n) => {
      n.update(!0);
    }), t = !0) : this.parent.childUpdate.has(this) && (t = !0), t && (lt(
      this.parent._matrix.value,
      this._localMatrix.value,
      this._matrix.value
    ), this._matrix.didUpdate = !0, this.needsWorldDecomposition = !0, this.hasViewMatrix && this._viewMatrix && this._localViewMatrix && (this.parent.hasViewMatrix && this.parent._viewMatrix && this.parent._localViewMatrix ? lt(
      this.parent._viewMatrix.value,
      this._localViewMatrix.value,
      this._viewMatrix.value
    ) : (Wr(this.parent.rotation, Sn[0]), Ns(
      Jn(this.parent._scale.value, Ve[0]),
      Ls(Sn[0], Sn[1]),
      ut(this.parent._position.value, -1, Ve[1]),
      Ue[0]
    ), lt(
      this._localViewMatrix.value,
      Ue[0],
      this._viewMatrix.value
    )), this._viewMatrix.didUpdate = !0))), this.decomposeWorldMatrix(), this._instance && this._instance.active && (this._localMatrix.didUpdate || this._matrix.didUpdate) && (this._instance.needsLocalUpdate && (this._localRotation.didUpdate && (this._instance._localRotation = this._localRotation.value), this._localPosition.didUpdate && (this._instance._localPosition = this._localPosition.value), this._localScale.didUpdate && (this._instance._localScale = this._localScale.value)), this._instance.needsWorldUpdate && (this.parent ? (this._rotation.didUpdate && (this._instance._rotation = this._rotation.value), this._scale.didUpdate && (this._instance._scale = this._scale.value), this._position.didUpdate && (this._instance._position = this._position.value)) : (this._localRotation.didUpdate && (this._instance._rotation = this._localRotation.value), this._localPosition.didUpdate && (this._instance._position = this._localPosition.value), this._localScale.didUpdate && (this._instance._scale = this._localScale.value))), this._matrix.didUpdate && (this._instance._matrix = this._matrix.value), this._localMatrix.didUpdate && (this._instance._localMatrix = this._localMatrix.value, this.parent || (this._instance._matrix = this._matrix.value))), this._localScale.didUpdate = !1, this._localRotation.didUpdate = !1, this._localPosition.didUpdate = !1, this._rotation.didUpdate = !1, this._scale.didUpdate = !1, this._position.didUpdate = !1, this._matrix.didUpdate = !1, this._localMatrix.didUpdate = !1, this.resolve();
  }
}
const ip = new Vo();
function sh(i, e) {
  return !i || !e ? i === e : !Object.keys(Object.assign({}, i, e)).find(
    (t) => i[t] !== e[t]
  );
}
var Fi = /* @__PURE__ */ ((i) => (i[i.PERSPECTIVE = 0] = "PERSPECTIVE", i[i.ORTHOGRAPHIC = 1] = "ORTHOGRAPHIC", i))(Fi || {});
function np(i) {
  return i.projectionOptions.type === 1 && "left" in i.projectionOptions;
}
function rh(i) {
  return i.projectionOptions.type === 0 && "fov" in i.projectionOptions;
}
class zi {
  constructor(e) {
    this._id = U(), this.animationEndTime = 0, this.needsViewDrawn = !0, this.needsBroadcast = !1, this.viewChangeViewId = "", this.transform = new Vo(), this._projection = ne(), this._needsUpdate = !0, this._viewProjection = ne(), this._projectionOptions = e, this._needsUpdate = !0, this.onChange = e.onViewChange, this.update();
  }
  /** Provide an identifier for the camera to follow the pattern of most everything in this framework. */
  get id() {
    return this._id;
  }
  /**
   * Performs the broadcast of changes for the camera if the camera needed a broadcast.
   */
  broadcast(e) {
    this.onChange && this.onChange(this, e);
  }
  /**
   * Quick generation of a camera with properties. None make any sense and should be set appropriately.
   * ie - View2D handles setting these values correctly for you.
   */
  static makeOrthographic(e) {
    return new zi(
      Object.assign(
        {
          left: -100,
          right: 100,
          top: -100,
          bottom: 100,
          near: -100,
          far: 1e5,
          type: 1
          /* ORTHOGRAPHIC */
        },
        e
      )
    );
  }
  /**
   * Quick generation of a camera with perspective properties.
   */
  static makePerspective(e) {
    return new zi(
      Object.assign(
        {
          type: 0,
          far: 1e4,
          near: 1,
          fov: 90 * Math.PI / 180,
          height: 1e3,
          width: 1e3
        },
        e
      )
    );
  }
  /** The expected projection style of the Camera. */
  get projectionType() {
    return this._projectionOptions.type;
  }
  /** The computed projection of the camera. */
  get projection() {
    return this.update(!0), this._projection;
  }
  /** The computed view transform of the camera. */
  get view() {
    return this.transform.viewMatrix;
  }
  /** Flag indicating the transforms for this camera need updating. */
  get needsUpdate() {
    return this._needsUpdate;
  }
  /** This is the position of the camera within the world. */
  get position() {
    return this.transform.position;
  }
  set position(e) {
    this._needsUpdate = this._needsUpdate || !$s(e, this.transform.position), this.transform.position = e;
  }
  /**
   * The camera must always look at a position within the world. This in conjunction with 'roll' defines the orientation
   * of the camera viewing the world.
   */
  lookAt(e, t) {
    const n = is(this.transform.matrix);
    this.transform.lookAtLocal(e, t || [0, 1, 0]), this._needsUpdate = this._needsUpdate || !Vl(n, this.transform.matrix);
  }
  /**
   * This is a scale distortion the camera views the world with. A scale of 2 along an axis, means the camera will view
   * 2x the amount of the world along that axis (thus having a visual compression if the screen dimensions do
   * not change).
   *
   * This also has the added benefit of quickly and easily swapping axis directions by simply making the scale -1 for
   * any of the axis.
   */
  get scale() {
    return this.transform.scale;
  }
  set scale(e) {
    this._needsUpdate = this._needsUpdate || !$s(e, this.transform.scale), this.transform.scale = e;
  }
  /**
   * Options used for making the projection of the camera. Set new options to update the projection.
   * Getting the options returns a copy of the object and is not the internal object itself.
   */
  get projectionOptions() {
    return this._projectionOptions;
  }
  set projectionOptions(e) {
    this._needsUpdate = this._needsUpdate || !sh(e, this._projectionOptions), this._projectionOptions = e;
  }
  /**
   * Provides the combined view projection matrices. Applies view first then the projection multiply(P, V).
   */
  get viewProjection() {
    return this.update(!0), this._viewProjection;
  }
  /**
   * Sets projection options with the camera as an orthographic projection.
   */
  setOrthographic(e) {
    this._projectionOptions = Object.assign(
      {
        left: -100,
        right: 100,
        top: -100,
        bottom: 100,
        near: -100,
        far: 1e5,
        type: 1
        /* ORTHOGRAPHIC */
      },
      e
    );
  }
  /**
   * Sets projection options with the camera as a perspective projection.
   */
  setPerspective(e) {
    this._projectionOptions = Object.assign(
      {
        type: 0,
        far: 1e4,
        near: 1,
        fov: 90 * Math.PI / 180,
        height: 1e3,
        width: 1e3
      },
      e
    );
  }
  /**
   * This marks the camera's changes as resolved and responded to.
   */
  resolve() {
    this._needsUpdate = !1, this.needsViewDrawn = !1, this.needsBroadcast = !1;
  }
  /**
   * Updates the transform matrices associated with this camera.
   */
  update(e) {
    (this._needsUpdate || e) && (this.updateProjection(), this._needsUpdate = !1, this.needsViewDrawn = !0);
  }
  /**
   * Takes the current projection options and produces the projection matrix needed to project elements to the screen.
   */
  updateProjection() {
    np(this) ? zl(
      this.projectionOptions.left,
      this.projectionOptions.right,
      this.projectionOptions.bottom,
      this.projectionOptions.top,
      this.projectionOptions.near,
      this.projectionOptions.far,
      this._projection
    ) : rh(this) && Fl(
      this.projectionOptions.fov,
      this.projectionOptions.width,
      this.projectionOptions.height,
      this.projectionOptions.near,
      this.projectionOptions.far,
      this._projection
    ), lt(
      this._projection,
      this.transform.viewMatrix,
      this._viewProjection
    );
  }
}
const { ceil: sp, max: oh, log2: rp, pow: op, sqrt: ap } = Math, Ke = [-1, -1];
function cp(i, e) {
  const { width: t, height: n } = i;
  let s;
  const r = [], o = [];
  for (let a = 0; a < t; ++a) {
    r[a] = [], o[a] = [];
    for (let c = 0; c < n; ++c) {
      const l = c * (t * 4) + a * 4;
      s = e[l + 3], s ? (r[a][c] = [a, c], o[a][c] = Ke) : (r[a][c] = Ke, o[a][c] = [a, c]);
    }
  }
  return {
    seed: r,
    inverse: o
  };
}
function lp(i) {
  const e = [];
  for (let t = 0, n = i.length; t < n; ++t)
    e[t] = [];
  return e;
}
function Oa(i, e, t = !1) {
  const n = t ? -1 : 1;
  let s, r, o, a;
  const c = [];
  let l = -1;
  for (let h = 0, u = i.length; h < u; ++h) {
    const d = i[h];
    c[h] = [];
    for (let f = 0, p = d.length; f < p; ++f)
      s = d[f], s === e ? a = 256 : (r = [h, f], o = we(s, r), a = ap(ss(o, o))), c[h][f] = a, l = oh(a, l);
  }
  for (let h = 0, u = i.length; h < u; ++h) {
    const d = i[h];
    for (let f = 0, p = d.length; f < p; ++f)
      a = c[h][f], c[h][f] = a / l * 255 * n;
  }
  return c;
}
function hp(i, e, t, n) {
  let s;
  const r = Oa(i, t, !0), o = Oa(
    e,
    t,
    !1
  ), a = r.length, c = r;
  for (let l = 0, h = r.length; l < h; ++l) {
    const u = r[l], d = o[l];
    for (let f = 0, p = u.length; f < p; ++f) {
      const g = u[f], m = d[f];
      u[f] = g + m;
    }
  }
  for (let l = 0, h = c.length; l < h; ++l) {
    const u = c[l];
    for (let d = 0, f = u.length; d < f; ++d) {
      s = u[d];
      const p = d * (a * 4) + l * 4;
      n[p] = s, n[p + 1] = s, n[p + 2] = s, n[p + 3] = 255;
    }
  }
}
function La(i, e) {
  const t = i.length, n = i[0].length;
  let s = lp(i), r = i, o, a, c, l, h, u, d, f, p;
  for (let g = 0; g < e; ++g) {
    const m = s;
    s = r, r = m;
    const v = op(2, e - g - 1);
    for (d = 0; d < t; ++d)
      for (f = 0; f < n; ++f) {
        for (o = [d, f], c = [
          (s[d - v] || [])[f - v] || Ke,
          (s[d] || [])[f - v] || Ke,
          (s[d + v] || [])[f - v] || Ke,
          (s[d - v] || [])[f] || Ke,
          (s[d] || [])[f] || Ke,
          (s[d + v] || [])[f] || Ke,
          (s[d - v] || [])[f + v] || Ke,
          (s[d] || [])[f + v] || Ke,
          (s[d + v] || [])[f + v] || Ke
        ], h = 0, l = Number.MAX_VALUE, p = 0; p < 9; ++p) {
          const b = c[p];
          b !== Ke && (a = we(b, o), u = ss(a, a), u < l && (l = u, h = p));
        }
        r[d][f] = c[h];
      }
  }
  return r;
}
function iv(i, e = hp) {
  const { width: t, height: n } = i, s = i.getContext("2d");
  if (!s) return;
  const r = s.getImageData(0, 0, t, n).data, o = oh(t, n), a = sp(rp(o)), c = cp(i, r), l = La(c.seed, a), h = La(c.inverse, a), u = new ImageData(t, n);
  e(l, h, Ke, u.data), s.putImageData(u, 0, 0);
}
function nv(i) {
}
class je {
  constructor(e, t, n, s) {
    this.child = [null, null], this.isLeaf = !0, this.data = null, this.bounds = new Z({
      height: s,
      width: n,
      x: e,
      y: t
    });
  }
  /**
   * Deletes all of the sub nodes in this Mapping, thus clearing up memory usage
   */
  destroy() {
    const e = this.child[0], t = this.child[1];
    this.data = null, e && e.destroy(), t && t.destroy(), this.child[0] = null, this.child[1] = null;
  }
  /**
   * Indicates if there is a child
   */
  hasChild() {
    const e = this.child[0], t = this.child[1];
    return e && !e.data ? !e.isLeaf : t && !t.data ? !t.isLeaf : !1;
  }
  /**
   * Inserts images into our mapping, fitting them appropriately
   */
  insert(e) {
    let t = this.child[0], n = this.child[1];
    if (!this.isLeaf && t && n) {
      const s = t.insert(e);
      return s !== null ? s : n.insert(e);
    } else {
      if (this.data) return null;
      const s = this.bounds.fits(e.bounds);
      if (s === 0) return null;
      if (s === 1)
        return this.data = e.data, this;
      this.isLeaf = !1;
      const r = e.bounds.width, o = e.bounds.height, a = this.bounds.width - r, c = this.bounds.height - e.bounds.height;
      a > c ? (t = this.child[0] = new je(
        this.bounds.x,
        this.bounds.y,
        r,
        this.bounds.height
      ), n = this.child[1] = new je(
        this.bounds.x + r,
        this.bounds.y,
        a,
        this.bounds.height
      )) : (t = this.child[0] = new je(
        this.bounds.x,
        this.bounds.y,
        this.bounds.width,
        o
      ), n = this.child[1] = new je(
        this.bounds.x,
        this.bounds.y + o,
        this.bounds.width,
        c
      ));
    }
    return t.insert(e);
  }
  /**
   * Removes the image from the mapping and tries to open up as much space as possible.
   *
   * @param {AtlasTexture} data The image to insert into the
   */
  remove(e) {
    const t = this.child[0], n = this.child[1];
    if (n && t && !this.isLeaf) {
      let s = t.remove(e);
      return s ? !0 : (s = n.remove(e), t.hasChild() || n.hasChild() || (this.child[0] = null, this.child[1] = null), s);
    } else
      return this.data === e ? (this.data = null, !0) : !1;
  }
  /**
   * Applies a node's bounds to SubTexture.
   */
  static applyToSubTexture(e, t, n, s, r) {
    if (!n) return;
    s = s || {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0
    };
    const o = t instanceof je ? t.bounds : t, a = (o.x + s.left) / e.bounds.width, c = (o.y + s.top) / e.bounds.height, l = (o.width - s.left - s.right) / e.bounds.width, h = (o.height - s.top - s.bottom) / e.bounds.height;
    let u;
    r ? u = new Z({
      bottom: 1 - c,
      left: a,
      right: a + l,
      top: 1 - (c + h)
    }) : u = new Z({
      top: 1 - c,
      left: a,
      right: a + l,
      bottom: 1 - (c + h)
    });
    const d = u.bottom, f = u.y, p = u.x, g = u.x + u.width;
    n.atlasTL = [p, f], n.atlasBR = [g, d], n.atlasBL = [p, d], n.atlasTR = [g, f], n.widthOnAtlas = Math.abs(n.atlasTR[0] - n.atlasTL[0]), n.heightOnAtlas = Math.abs(n.atlasTR[1] - n.atlasBR[1]), n.pixelWidth = l * e.bounds.width, n.pixelHeight = h * e.bounds.height;
  }
}
function se(i) {
  return i != null;
}
function up(i) {
  return Array.isArray(i) ? (e) => i.indexOf(e.start.view.id) >= 0 : (e) => e.start.view.id === i;
}
function dp(i) {
  return Array.isArray(i) ? (e) => e.start.views.find((t) => i.indexOf(t.view.id) >= 0) : (e) => e.start.views.find((t) => t.view.id === i);
}
function ah(i) {
  return i && i.call !== void 0 && i.apply !== void 0;
}
function cn(i, e, t) {
  let n = i.get(e);
  return n === void 0 && (ah(t) ? n = t() : n = t, i.set(e, n)), n;
}
function Hr(i, e, t) {
  let n = i.get(e);
  return n === void 0 && (ah(t) ? n = t() : n = t), n;
}
const sr = class sr {
};
sr.transparentShapeBlending = {
  blending: {
    blendDst: x.Material.BlendingDstFactor.OneMinusSrcAlpha,
    blendEquation: x.Material.BlendingEquations.Add,
    blendSrc: x.Material.BlendingSrcFactor.SrcAlpha
  },
  culling: x.Material.CullSide.NONE,
  modify(e) {
    return Object.assign({}, this, e);
  }
}, sr.transparentImageBlending = {
  blending: {
    blendSrc: x.Material.BlendingSrcFactor.One,
    blendDst: x.Material.BlendingDstFactor.OneMinusSrcAlpha,
    blendEquation: x.Material.BlendingEquations.Add
  },
  culling: x.Material.CullSide.NONE,
  modify(e) {
    return Object.assign({}, this, e);
  }
};
let it = sr;
class sv {
  /**
   * This retrieves all easing metrics for every instance for every specified eased attribute.
   */
  static async modify(e, t, n) {
    for (let s = 0, r = t.length; s < r; ++s) {
      const o = t[s];
      for (let a = 0, c = e.length; a < c; ++a) {
        const l = e[a], h = l.getEasing(o);
        h && n(h, l, a, s);
      }
    }
  }
  /**
   * This finds all easing controls requested for all instances.
   *
   * If wait is true, then this method's returned promise will resolve AFTER the time
   * of all discovered easing objects has passed.
   */
  static async all(e, t, n, s) {
    let r = go;
    const o = new Promise((l) => r = l);
    let a = 0;
    for (let l = 0, h = n.length; l < h; ++l) {
      const u = n[l];
      for (let d = 0, f = t.length; d < f; ++d) {
        const p = t[d], g = p.getEasing(u);
        g && (s && s(g, p, d, l), a = Math.max(
          (g.delay || 0) + g.duration,
          a
        ));
      }
    }
    const c = (l) => {
      l < a ? ki(c) : r();
    };
    return e ? ki((l) => {
      a += l, c(l);
    }) : r(), o;
  }
}
var fp = !!(typeof window < "u" && window.document && window.document.createElement), ch = {
  canUseDOM: fp
}, lh;
ch.canUseDOM && (lh = document.implementation && document.implementation.hasFeature && // always returns true in newer browsers as per the standard.
// @see http://dom.spec.whatwg.org/#dom-domimplementation-hasfeature
document.implementation.hasFeature("", "") !== !0);
/**
 * Checks if an event is supported in the current execution environment.
 *
 * NOTE: This will not work correctly for non-generic events such as `change`,
 * `reset`, `load`, `error`, and `select`.
 *
 * Borrows from Modernizr.
 *
 * @param {string} eventNameSuffix Event name, e.g. "click".
 * @param {?boolean} capture Check if the capture phase is supported.
 * @return {boolean} True if the event is supported.
 * @internal
 * @license Modernizr 3.0.0pre (Custom Build) | MIT
 */
function pp(i, e) {
  if (!ch.canUseDOM || e)
    return !1;
  var t = "on" + i, n = t in document;
  if (!n) {
    var s = document.createElement("div");
    s.setAttribute(t, "return;"), n = typeof s[t] == "function";
  }
  return !n && lh && i === "wheel" && (n = document.implementation.hasFeature("Events.wheel", "3.0")), n;
}
var Na = !1, qi, Xr, Qr, Ps, Bs, hh, Ds, Yr, qr, Kr, uh, Zr, Jr, dh, fh;
function ze() {
  if (!Na) {
    Na = !0;
    var i = navigator.userAgent, e = /(?:MSIE.(\d+\.\d+))|(?:(?:Firefox|GranParadiso|Iceweasel).(\d+\.\d+))|(?:Opera(?:.+Version.|.)(\d+\.\d+))|(?:AppleWebKit.(\d+(?:\.\d+)?))|(?:Trident\/\d+\.\d+.*rv:(\d+\.\d+))/.exec(
      i
    ), t = /(Mac OS X)|(Windows)|(Linux)/.exec(i);
    if (Zr = /\b(iPhone|iP[ao]d)/.exec(i), Jr = /\b(iP[ao]d)/.exec(i), Kr = /Android/i.exec(i), dh = /FBAN\/\w+;/i.exec(i), fh = /Mobile/i.exec(i), uh = !!/Win64/.exec(i), e) {
      qi = e[1] ? parseFloat(e[1]) : e[5] ? parseFloat(e[5]) : NaN, qi && document && document.documentMode && (qi = document.documentMode);
      var n = /(?:Trident\/(\d+.\d+))/.exec(i);
      hh = n ? parseFloat(n[1]) + 4 : qi, Xr = e[2] ? parseFloat(e[2]) : NaN, Qr = e[3] ? parseFloat(e[3]) : NaN, Ps = e[4] ? parseFloat(e[4]) : NaN, Ps ? (e = /(?:Chrome\/(\d+\.\d+))/.exec(i), Bs = e && e[1] ? parseFloat(e[1]) : NaN) : Bs = NaN;
    } else
      qi = Xr = Qr = Bs = Ps = NaN;
    if (t) {
      if (t[1]) {
        var s = /(?:Mac OS X (\d+(?:[._]\d+)?))/.exec(i);
        Ds = s ? parseFloat(s[1].replace("_", ".")) : !0;
      } else
        Ds = !1;
      Yr = !!t[2], qr = !!t[3];
    } else
      Ds = Yr = qr = !1;
  }
}
var eo = {
  /**
   *  Check if the UA is Internet Explorer.
   *
   *
   *  @return float|NaN Version number (if match) or NaN.
   */
  ie: function() {
    return ze() || qi;
  },
  /**
   * Check if we're in Internet Explorer compatibility mode.
   *
   * @return bool true if in compatibility mode, false if
   * not compatibility mode or not ie
   */
  ieCompatibilityMode: function() {
    return ze() || hh > qi;
  },
  /**
   * Whether the browser is 64-bit IE.  Really, this is kind of weak sauce;  we
   * only need this because Skype can't handle 64-bit IE yet.  We need to remove
   * this when we don't need it -- tracked by #601957.
   */
  ie64: function() {
    return eo.ie() && uh;
  },
  /**
   *  Check if the UA is Firefox.
   *
   *
   *  @return float|NaN Version number (if match) or NaN.
   */
  firefox: function() {
    return ze() || Xr;
  },
  /**
   *  Check if the UA is Opera.
   *
   *
   *  @return float|NaN Version number (if match) or NaN.
   */
  opera: function() {
    return ze() || Qr;
  },
  /**
   *  Check if the UA is WebKit.
   *
   *
   *  @return float|NaN Version number (if match) or NaN.
   */
  webkit: function() {
    return ze() || Ps;
  },
  /**
   *  For Push
   *  WILL BE REMOVED VERY SOON. Use UserAgent_DEPRECATED.webkit
   */
  safari: function() {
    return eo.webkit();
  },
  /**
   *  Check if the UA is a Chrome browser.
   *
   *
   *  @return float|NaN Version number (if match) or NaN.
   */
  chrome: function() {
    return ze() || Bs;
  },
  /**
   *  Check if the user is running Windows.
   *
   *  @return bool `true' if the user's OS is Windows.
   */
  windows: function() {
    return ze() || Yr;
  },
  /**
   *  Check if the user is running Mac OS X.
   *
   *  @return float|bool   Returns a float if a version number is detected,
   *                       otherwise true/false.
   */
  osx: function() {
    return ze() || Ds;
  },
  /**
   * Check if the user is running Linux.
   *
   * @return bool `true' if the user's OS is some flavor of Linux.
   */
  linux: function() {
    return ze() || qr;
  },
  /**
   * Check if the user is running on an iPhone or iPod platform.
   *
   * @return bool `true' if the user is running some flavor of the
   *    iPhone OS.
   */
  iphone: function() {
    return ze() || Zr;
  },
  mobile: function() {
    return ze() || Zr || Jr || Kr || fh;
  },
  nativeApp: function() {
    return ze() || dh;
  },
  android: function() {
    return ze() || Kr;
  },
  ipad: function() {
    return ze() || Jr;
  }
};
const Pa = 10, Ba = 40, Da = 800;
function ph(i) {
  let e = 0, t = 0, n = 0, s = 0;
  return "detail" in i && (t = i.detail), "wheelDelta" in i && (t = -i.wheelDelta / 120), "wheelDeltaY" in i && (t = -i.wheelDeltaY / 120), "wheelDeltaX" in i && (e = -i.wheelDeltaX / 120), "axis" in i && i.axis === i.HORIZONTAL_AXIS && (e = t, t = 0), n = e * Pa, s = t * Pa, "deltaY" in i && (s = i.deltaY), "deltaX" in i && (n = i.deltaX), (n || s) && i.deltaMode && (i.deltaMode === 1 ? (n *= Ba, s *= Ba) : (n *= Da, s *= Da)), n && !e && (e = n < 1 ? -1 : 1), s && !t && (t = s < 1 ? -1 : 1), {
    spinX: e,
    spinY: -t,
    pixelX: n,
    pixelY: -s
  };
}
ph.getEventType = function() {
  return eo.firefox() ? "DOMMouseScroll" : pp("wheel") ? "wheel" : "mousewheel";
};
function Wt(i, e) {
  let t = 0, n = 0, s = 0, r = 0, o = e || i.nativeEvent && i.nativeEvent.target || i.target;
  if (i || (i = window.event), i.pageX || i.pageY)
    t = i.pageX, n = i.pageY;
  else if (i.clientX || i.clientY) {
    let a = 0, c = 0;
    document.documentElement && (a = document.documentElement.scrollLeft, c = document.documentElement.scrollTop), t = i.clientX + document.body.scrollLeft + a, n = i.clientY + document.body.scrollTop + c;
  }
  if (o.offsetParent)
    do
      s += o.offsetLeft, r += o.offsetTop, o = o.offsetParent;
    while (o);
  return [t - s, n - r];
}
const gp = 5, mp = 10;
class xp {
  /**
   * Ensures all memory is released for all nodes and all references are removed
   * to potentially high memory consumption items
   *
   * @memberOf Quadrants
   */
  destroy() {
    this.TL.destroy(), this.TR.destroy(), this.BL.destroy(), this.BR.destroy();
  }
  /**
   * Creates an instance of Quadrants.
   *
   * @param bounds The bounds this will create quandrants for
   * @param depth  The child depth of this element
   *
   * @memberOf Quadrants
   */
  constructor(e, t) {
    const n = e.mid;
    this.TL = new qn(e.x, n[0], e.y, n[1], t), this.TR = new qn(
      n[0],
      e.right,
      e.y,
      n[1],
      t
    ), this.BL = new qn(
      e.x,
      n[0],
      n[1],
      e.bottom,
      t
    ), this.BR = new qn(
      n[0],
      e.right,
      n[1],
      e.bottom,
      t
    );
  }
}
class qn {
  /**
   * Creates an instance of Node.
   *
   * @param l     The bounding left wall of the space this node covers
   * @param r     The bounding right wall of the space this node covers
   * @param t     The bounding top wall of the space this node covers
   * @param b     The bounding bottom wall of the space this node covers
   * @param depth The depth within the quad tree this node resides
   *
   * @memberOf Node
   */
  constructor(e, t, n, s, r) {
    this.children = [], this.depth = 0, arguments.length >= 4 ? this.bounds = new Z({ left: e, right: t, top: n, bottom: s }) : this.bounds = new Z({ left: 0, right: 1, top: 0, bottom: 1 }), this.depth = r || 0;
  }
  /**
   * Destroys this node and ensures all child nodes are destroyed as well.
   *
   * @memberOf Node
   */
  destroy() {
    this.children = [], this.nodes && (this.nodes.destroy(), delete this.nodes);
  }
  /**
   * Adds an object that extends Bounds (or is Bounds) and properly injects it into this node
   * or into a sub quadrant if this node is split already. If the child is outside the boundaries
   * this quad tree spans (and this is the root node), the quad tree will expand to include
   * the new child.
   *
   * @param child The Bounds type object to inject
   * @param props Properties that can be retrieved with the child object if applicable
   *
   * @returns True if the insertion was successful
   *
   * @memberOf Node
   */
  add(e, t) {
    return e.isInside(this.bounds) ? this.doAdd(e) : (this.cover(e), this.add(e, t));
  }
  /**
   * Adds a list of new children to this quad tree. It performs the same operations as
   * addChild for each child in the list, however, it more efficiently recalculates the
   * bounds necessary to cover the area the children cover.
   *
   * @param children      List of Bounds objects to inject
   */
  addAll(e) {
    let t = Number.MAX_SAFE_INTEGER, n = Number.MAX_SAFE_INTEGER, s = Number.MIN_SAFE_INTEGER, r = Number.MIN_SAFE_INTEGER;
    const { min: o, max: a } = Math;
    for (let c = 0, l = e.length; c < l; ++c) {
      const h = e[c];
      t = o(t, h.x), s = a(h.right, s), n = o(n, h.y), r = a(r, h.bottom);
    }
    this.cover(
      new Z({ left: t, right: s, top: n, bottom: r })
    ), e.forEach((c) => this.doAdd(c));
  }
  /**
   * Ensures this quad tree includes the bounds specified in it's spatial coverage.
   * This will cause all children to be re-injected into the tree.
   *
   * @param bounds The bounds to include in the tree's coverage
   */
  cover(e) {
    if (e.isInside(this.bounds))
      return;
    this.bounds.encapsulate(e), this.bounds.x -= 1, this.bounds.y -= 1, this.bounds.width += 2, this.bounds.height += 2;
    const t = this.gatherChildren([]);
    this.nodes && (this.nodes.destroy(), delete this.nodes), t.forEach((n) => this.doAdd(n));
  }
  /**
   * When adding children, this performs the actual action of injecting the child into the tree
   * without the process of seeing if the tree needs a spatial adjustment to account for the child.
   *
   * @param child The Bounds item to inject into the tree
   *
   * @returns True if the injection was successful
   */
  doAdd(e) {
    return this.nodes ? e.isInside(this.nodes.TL.bounds) ? this.nodes.TL.doAdd(e) : e.isInside(this.nodes.TR.bounds) ? this.nodes.TR.doAdd(e) : e.isInside(this.nodes.BL.bounds) ? this.nodes.BL.doAdd(e) : e.isInside(this.nodes.BR.bounds) ? this.nodes.BR.doAdd(e) : (this.children.push(e), !0) : e.isInside(this.bounds) ? (this.children.push(e), this.children.length > gp && this.depth < mp && this.split(), !0) : (isNaN(e.width + e.height + e.x + e.y) ? console.error(
      "Child did not fit into bounds because a dimension is NaN",
      e
    ) : e.area === 0 && console.error(
      "Child did not fit into bounds because the area is zero",
      e
    ), !0);
  }
  /**
   * Collects all children of all the current and sub nodes into a single list.
   *
   * @param list The list we must aggregate children into
   *
   * @return The list specified as the list parameter
   */
  gatherChildren(e, t) {
    t && t(this);
    for (let n = 0, s = this.children.length; n < s; ++n)
      e.push(this.children[n]);
    return this.nodes && (this.nodes.TL.gatherChildren(e, t), this.nodes.TR.gatherChildren(e, t), this.nodes.BL.gatherChildren(e, t), this.nodes.BR.gatherChildren(e, t)), e;
  }
  /**
   * Entry query for determining query type based on input object
   *
   * @param bounds Can be a Bounds or a Point object
   * @param visit  A callback function that will receive the Node as it is analyzed. This gives
   *               information on a spatial scale, how a query reaches it's target intersections.
   *
   * @return An array of children that intersects with the query
   */
  query(e, t) {
    return e instanceof Z ? e.hitBounds(this.bounds) ? this.queryBounds(e, [], t) : [] : Sc(e) && this.bounds.containsPoint(e) ? this.queryPoint(e, [], t) : [];
  }
  /**
   * Queries children for intersection with a bounds object
   *
   * @param b     The Bounds to test children against
   * @param list  The list of children to aggregate into the query
   * @param visit A callback function that will receive the Node as it is analyzed. This gives
   *              information on a spatial scale, how a query reaches it's target intersections.
   *
   * @return     Returns the exact same list that was input as the list param
   */
  queryBounds(e, t, n) {
    return this.bounds.isInside(e) ? (this.gatherChildren(t, n), t) : (this.children.forEach((s) => {
      s.hitBounds(e) && t.push(s);
    }), n && n(this), this.nodes && (e.hitBounds(this.nodes.TL.bounds) && this.nodes.TL.queryBounds(e, t, n), e.hitBounds(this.nodes.TR.bounds) && this.nodes.TR.queryBounds(e, t, n), e.hitBounds(this.nodes.BL.bounds) && this.nodes.BL.queryBounds(e, t, n), e.hitBounds(this.nodes.BR.bounds) && this.nodes.BR.queryBounds(e, t, n)), t);
  }
  /**
   * Queries children for intersection with a point
   *
   * @param p     The Point to test children against
   * @param list  The list of children to aggregate into the query
   * @param visit A callback function that will receive the Node as it is analyzed. This gives
   *              information on a spatial scale, how a query reaches it's target intersections.
   *
   * @return      Returns the exact same list that was input as the list param
   */
  queryPoint(e, t, n) {
    return this.children.forEach((s) => {
      s.containsPoint(e) && t.push(s);
    }), n && n(this), this.nodes && (this.nodes.TL.bounds.containsPoint(e) && this.nodes.TL.queryPoint(e, t, n), this.nodes.TR.bounds.containsPoint(e) && this.nodes.TR.queryPoint(e, t, n), this.nodes.BL.bounds.containsPoint(e) && this.nodes.BL.queryPoint(e, t, n), this.nodes.BR.bounds.containsPoint(e) && this.nodes.BR.queryPoint(e, t, n)), t;
  }
  /**
   * Creates four sub quadrants for this node.
   */
  split() {
    const e = [];
    this.gatherChildren(e), this.nodes = new xp(this.bounds, this.depth + 1), this.children = [];
    for (let t = 0, n = e.length; t < n; ++t) {
      const s = e[t];
      s && this.doAdd(s);
    }
  }
  /**
   * Traverses the quad tree returning every quadrant encountered
   *
   * @param cb A callback that has the parameter (node) which is a quadrant in the tree
   */
  visit(e) {
    const t = !!e(this);
    this.nodes && !t && (this.nodes.TL.visit(e), this.nodes.TR.visit(e), this.nodes.BL.visit(e), this.nodes.BR.visit(e));
  }
}
class vp extends qn {
}
class er {
  constructor(e) {
    this.willDispose = /* @__PURE__ */ new Set(), this.keyToItem = /* @__PURE__ */ new Map(), this.keyToInitializer = /* @__PURE__ */ new Map(), this.currentInitalizerIndex = 0, this.currentInitializers = [], this._items = [], this.inlineDeferred = (t) => {
      this.deferredInlining = t;
    }, this.inlineImmediate = (t) => {
      if (t.length > 0 && this.currentInitializers && this.currentItem) {
        this.currentInitializers.splice(
          this.currentInitalizerIndex + 1,
          0,
          ...t
        );
        for (let n = 0, s = t.length; n < s; ++n) {
          const r = t[n];
          r.parent = this.currentItem;
        }
      }
    }, this.inline = this.inlineImmediate, this.options = e;
  }
  /** A list of all the items currently alive and managed by this diff */
  get items() {
    return this._items.slice(0);
  }
  /**
   * This triggers all resources currently managed by this diff manager to
   * process their destroy procedure
   */
  async destroy() {
    const e = [];
    for (let t = 0, n = this.currentInitializers.length; t < n; ++t) {
      const s = this.currentInitializers[t], r = this.keyToItem.get(s.key);
      r && e.push(this.options.destroyItem(s, r));
    }
    await Promise.all(e);
  }
  /**
   * This injects the objects into the diff to be processed for new and removed
   * items.
   */
  async diff(e) {
    const t = e.slice(0);
    this.currentInitializers = t, this._items = [];
    let n = 0;
    for (; n < t.length; ) {
      const s = t[n];
      if (this.currentInitalizerIndex = n, this.currentInitializer = s, this.willDispose.has(s.key)) {
        let r = this.keyToItem.get(s.key) || null;
        r ? (this.currentItem = r, await this.options.updateItem(s, r)) : r = await this.options.buildItem(s), r && (this.keyToInitializer.set(s.key, s), this.willDispose.delete(s.key), this._items.push(r));
      } else {
        this.inline = this.inlineDeferred;
        const r = await this.options.buildItem(s);
        this.inline = this.inlineImmediate, r && (this.currentItem = r, this.deferredInlining && (this.inline(this.deferredInlining), delete this.deferredInlining), this.keyToItem.set(s.key, r), this.keyToInitializer.set(s.key, s), this._items.push(r));
      }
      delete this.currentItem, n++;
    }
    this.willDispose.forEach(async (s) => {
      const r = this.keyToItem.get(s), o = this.keyToInitializer.get(s);
      if (!r || !o) return;
      await this.options.destroyItem(o, r) && (this.keyToItem.delete(s), this.keyToInitializer.delete(s));
    }), this.willDispose.clear(), this.keyToInitializer.forEach((s) => {
      this.willDispose.add(s.key);
    }), this.currentInitializers = [], delete this.currentItem, delete this.currentInitializer;
  }
  /**
   * Returns a specified item by key
   */
  getByKey(e) {
    return this.keyToItem.get(e);
  }
  /**
   * Returns a specified initializer by key. void if not found.
   */
  getInitializerByKey(e) {
    return this.keyToInitializer.get(e);
  }
  /**
   * Only during the updateItem phase of an item can this be called. This will
   * cause the item to be fully destroyed, then reconstructed instead of go
   * through an update.
   */
  async rebuild() {
    if (!this.currentItem || !this.currentInitializer) return;
    this.keyToItem.delete(this.currentItem.id), this.keyToInitializer.delete(this.currentItem.id), this.options.destroyItem(this.currentInitializer, this.currentItem);
    const e = await this.options.buildItem(this.currentInitializer);
    e && (this.keyToItem.set(this.currentItem.id, e), this.keyToInitializer.set(this.currentItem.id, this.currentInitializer));
  }
}
function sn(i) {
  const {
    shader: e,
    options: t = {},
    required: n,
    onError: s,
    onToken: r,
    onMain: o
  } = i, a = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map(), u = e.replace(
    /\$\{([^\}]*)\}/g,
    (f, p) => {
      let g = "";
      return h.set(p, (h.get(p) || 0) + 1), p in t ? (a.set(p, (a.get(p) || 0) + 1), g = t[p]) : c.set(p, (c.get(p) || 0) + 1), r && (g = r(p, g)), g;
    }
  );
  Object.keys(t).forEach((f) => {
    a.get(f) || l.set(f, (l.get(f) || 0) + 1);
  });
  const d = {
    resolvedShaderOptions: a,
    shader: u,
    shaderProvidedOptions: h,
    unresolvedProvidedOptions: l,
    unresolvedShaderOptions: c
  };
  if (n && n.values.forEach((f) => {
    if (d.unresolvedProvidedOptions.get(f)) {
      const p = `${n.name}: Could not resolve all the required inputs. Input: ${f}`;
      s ? s(p) : console.error(p);
    } else if (d.unresolvedShaderOptions.get(f)) {
      const p = `${n.name}: A required option was not provided in the options parameter. Option: ${f}`;
      s ? s(p) : console.error(p);
    } else if (!d.resolvedShaderOptions.get(f)) {
      const p = `${n.name}: A required option was not provided in the options parameter. Option: ${f}`;
      s ? s(p) : console.error(p);
    }
  }), o) {
    const f = d.shader, p = f.match(
      /void((.+)|\s)(main(\s+)\(\)|main\(\))(((.+)(\s*)\{)|(\s*)\{)/gm
    );
    if (p && p.length > 0) {
      const g = f.indexOf(p[0]);
      if (g < 0) o(null);
      else {
        const m = f.substr(0, g), v = f.substr(g + p[0].length);
        let b = !1, w = !1, y = 1, E = 0, C = -1;
        for (let M = 0, R = v.length; M < R; ++M) {
          const G = v[M], z = v[M + 1];
          switch (G) {
            case "/":
              switch (z) {
                case "*":
                  !b && !w && (b = !0, M++);
                  break;
                case "/":
                  !b && !w && (w = !0, M++);
                  break;
              }
              break;
            case "*":
              z === "/" && (w || (b = !1, M++));
              break;
            case `
`:
            case "\r":
              b || (w = !1);
              break;
            case "{":
              !b && !w && y++;
              break;
            case "}":
              !b && !w && E++, y === E && (C = M);
              break;
          }
          if (C !== -1)
            break;
        }
        if (C !== -1) {
          const M = v.substr(0, C), R = v.substr(C + 1), G = o(M, `${m}
${R}`);
          typeof G == "string" ? d.shader = f.substr(0, g + p[0].length) + G + f.substr(g + p[0].length + C) : d.shader = f.substr(0, g) + G.header + f.substr(g, p[0].length) + G.main + f.substr(g + p[0].length + C);
        } else
          o(null);
      }
    }
  }
  return d;
}
function rv(i) {
  return new Promise((e) => setTimeout(e, i));
}
function bp(i) {
  return i;
}
function Dn(i, e) {
  const t = Object.assign(e, {
    key: e.key || i.defaultProps.key,
    data: e.data || i.defaultProps.data
  });
  return {
    get key() {
      return e.key || "";
    },
    init: [i, t]
  };
}
function zn(i, e) {
  const t = Object.assign(e, {
    key: e.key || i.defaultProps.key,
    data: e.data || i.defaultProps.data
  });
  return {
    get key() {
      return e.key || "";
    },
    init: [
      i,
      t
    ]
  };
}
function wp(i) {
  return i;
}
function Tp(i) {
  return i;
}
const ov = {
  layer: Dn,
  view: Th,
  vertex: Tp,
  uniform: wp,
  attribute: bp
};
class av {
  constructor(e) {
    this.index = -1, this.marker = /* @__PURE__ */ new Map(), this.pool = new Array(e.firstAlloc);
    for (let t = 0, n = e.firstAlloc; t < n; ++t)
      this.pool[t] = e.create();
    this.options = e;
  }
  destroy() {
    for (let e = 0, t = this.pool.length; e < t; ++e)
      this.options.destroy(this.pool[e]);
    this.pool = [], this.marker.clear();
  }
  retrieve() {
    const e = this.pool[this.index + 1];
    return this.index++, this.marker.set(e, this.index), e;
  }
  replace(e) {
    const t = this.marker.get(e);
    t !== void 0 && (this.pool[t] = this.pool[this.index], this.pool[this.index] = e, this.marker.delete(e), this.index--);
  }
}
function yp(i, e, t, n) {
  return e < 0 && (e = i.length + e, e < 0 && (e = 0)), i.slice(0, e) + "" + i.slice(e + t);
}
function tr(i) {
  let e = !1, t = !1;
  const n = [];
  let s = { start: -1, stop: -1 }, r = { start: -1, stop: -1 };
  for (let o = 0, a = i.length; o < a; ++o) {
    const c = i[o], l = i[o + 1];
    switch (c) {
      case "/":
        switch (l) {
          case "*":
            !t && !e && (s.start = o, e = !0, o++);
            break;
          case "/":
            !e && !t && (r.start = o, t = !0, o++);
            break;
        }
        break;
      case "*":
        l === "/" && e && (s.stop = o + 2, n.push(s), s = { start: -1, stop: -1 }, e = !1, o++);
        break;
      case `
`:
      case "\r":
        t && (r.stop = o, n.push(r), r = { start: -1, stop: -1 }, t = !1);
        break;
    }
  }
  return n.reverse(), n.forEach((o) => {
    i = yp(i, o.start, o.stop - o.start);
  }), i;
}
function rn(i) {
  return i ? [
    i.atlasTL[0],
    i.atlasTL[1],
    i.atlasBR[0],
    i.atlasBR[1]
  ] : [0, 0, 0, 0];
}
class Bi {
  constructor(e) {
    this._uid = U(), this.aspectRatio = 1, this.atlasTL = [0, 0], this.atlasTR = [0, 0], this.atlasBL = [0, 0], this.atlasBR = [0, 0], this.heightOnAtlas = 0, this.isValid = !1, this.pixelWidth = 0, this.pixelHeight = 0, this.texture = null, this.widthOnAtlas = 0, Object.assign(this, e);
  }
  /** A unique identifier for the sub texture to aid in debugging issues */
  get uid() {
    return this._uid;
  }
  /**
   * Generates a SubTexture object based on the texture and region provided.
   */
  static fromRegion(e, t) {
    if (!e.data) return null;
    const n = t.x / e.data.width, s = t.y / e.data.height, r = t.width / e.data.width, o = t.height / e.data.height, a = new Z({
      bottom: s + o,
      left: n,
      right: n + r,
      top: s
    }), c = a.bottom, l = a.y, h = a.x, u = a.x + a.width, d = new Bi();
    return d.atlasTL = [h, l], d.atlasBR = [u, c], d.atlasBL = [h, c], d.atlasTR = [u, l], d;
  }
  /**
   * Forces an update of this sub texture on the texture it is located.
   *
   * NOTE: Use this WISELY. This does NOT smartly determine if the update would do nothing. This WILL cause the source
   * to be uploaded to the Atlas when this is called.
   */
  update() {
    !this.texture || !this.source || !this.atlasRegion || this.texture.update(this.source, this.atlasRegion);
  }
  toString() {
    return JSON.stringify(
      {
        atlas: {
          TL: this.atlasTL,
          TR: this.atlasTR,
          BL: this.atlasBL,
          BR: this.atlasBR
        },
        width: this.pixelWidth,
        height: this.pixelHeight
      },
      null,
      2
    );
  }
}
const ws = ve("performance");
var to = /* @__PURE__ */ ((i) => (i[i.BITMAP = 0] = "BITMAP", i[i.SDF = 1] = "SDF", i[i.MSDF = 2] = "MSDF", i))(to || {});
class Ep extends hn {
  constructor(e) {
    super(e), this.dynamic = !1, this.glyphCount = 0, this.glyphMap = {}, this.kerning = {}, this.spaceWidth = 0, this.type = re.FONT, this.dynamic = e.dynamic || !1, this.fontSource = e.fontSource, e.characters && e.characters.forEach((n) => {
      this.doRegisterGlyph(n[0], n[1]);
    });
    const t = e.fontMapSize ? e.fontMapSize : [ft._1024, ft._1024];
    this.makeGlyphTypeTextureSettings(e.glyphType), this.createTexture(t), this.packing = new je(0, 0, t[0], t[1]), this.addCachedKerning();
  }
  /** Makes a CSS font string from the font properties in the map */
  get fontString() {
    return `${this.fontSource.size}px ${this.fontSource.family}`;
  }
  getKerningCacheName() {
    return `__deltav_kerning_cache_${this.fontSource.family}__`;
  }
  /**
   * Loads the stored cached kerning if it's available.
   */
  addCachedKerning() {
    if (this.fontSource.localKerningCache) {
      const e = localStorage.getItem(this.getKerningCacheName());
      if (e) {
        ws("Loading cached kerning items:", this.getKerningCacheName());
        try {
          const t = JSON.parse(e);
          let n = 0;
          for (const s in t) {
            let r = typeof s == "string" && s.length === 1;
            if (!r) continue;
            const o = t[s], a = this.kerning[s] || {};
            this.kerning[s] = a;
            for (const c in o)
              r = typeof s == "string" && s.length === 1, r && (a[c] = o[c], n++);
          }
          ws(
            "Found kerning items in the cache!",
            "Count:",
            n
          );
        } catch {
        }
      }
    }
  }
  /**
   * Applies additional kerning pair information to the map.
   */
  addKerning(e) {
    let t = !1;
    for (const n in e) {
      const s = e[n], r = this.kerning[n] || {};
      this.kerning[n] || (t = !0), this.kerning[n] = r;
      for (const o in s)
        r[o] || (t = !0), r[o] = s[o];
    }
    if (t && this.fontSource.localKerningCache)
      try {
        ws("Storing kerning info in cache...");
        const n = JSON.stringify(this.kerning);
        localStorage.setItem(this.getKerningCacheName(), n);
      } catch {
        ws("Could not cache kerning info");
      }
  }
  /**
   * Generates the texture for the font map which makes it ready for utilization
   * and ready for updates.
   */
  createTexture(e) {
    if (this.texture) return;
    let t;
    this.textureSettings ? t = {
      generateMipMaps: !0,
      premultiplyAlpha: !0,
      ...this.textureSettings
    } : t = {
      generateMipMaps: !0,
      premultiplyAlpha: !0
    }, this.texture = new ee({
      data: {
        width: e[0],
        height: e[1],
        buffer: null
      },
      ...t
    });
  }
  /**
   * Free resources for this manager
   */
  destroy() {
    var e;
    (e = this.texture) == null || e.destroy();
  }
  /**
   * Performs the internal glyph registration.
   */
  doRegisterGlyph(e, t) {
    const n = e[0];
    this.glyphMap[n] ? console.warn("A Glyph is already registered with a rendering") : this.glyphMap[n] = t;
  }
  /**
   * This returns which characters are not included in this font map.
   */
  findMissingCharacters(e) {
    const t = /* @__PURE__ */ new Set();
    let n = "";
    for (let s = 0, r = e.length; s < r; ++s) {
      const o = e[s];
      !this.glyphMap[o] && !t.has(o) && (t.add(o), n += o);
    }
    return n;
  }
  /**
   * This retrieves the glyph texture information from the FontMap.
   */
  getGlyphTexture(e) {
    return this.glyphMap[e[0]] || null;
  }
  /**
   * This provides the expected vector from the top left corner of the left
   * vector to the top left corner of the right vector.
   */
  getGlyphKerning(e, t) {
    const n = this.kerning[e];
    return n ? n[t] || [0, 0] : [0, 0];
  }
  /**
   * This looks at the glyphs directly from a layout and provides the width of
   * the glyphs.
   *
   * This differs from getStringWidth as the indices reference GLYPHS (not white
   * space) while the parameters on the other reference the text.
   *
   * This method is a little less intuitive but can perform faster.
   */
  getGlyphWidth(e, t, n) {
    const s = e.positions[t], r = e.positions[n];
    if (!t || !n) return 0;
    const o = this.glyphMap[e.glyphs[n]];
    return o ? r[0] + o.pixelWidth - s[0] : 0;
  }
  /**
   * This looks at a string layout and provides a layout that reflects the
   * layout bounded by a max width.
   */
  async getTruncatedLayout(e, t, n, s, r, o) {
    if (e.size[0] > n) {
      let a = "", c = 0;
      for (let p = 0, g = t.length; p < g; ++p)
        c += this.glyphMap[t[p]].pixelWidth;
      if (c > n)
        return {
          fontScale: 1,
          glyphs: "",
          positions: [],
          size: [0, 0],
          text: ""
        };
      let l = 0, h = e.positions.length, u = 0, d = 0, f = "";
      for (; l !== h; ) {
        if (u = Math.floor((h - l) / 2) + l, f = e.glyphs[u], d = e.positions[u][0] + this.glyphMap[f].pixelWidth + c, d > n) h = u;
        else if (d < n) l = u;
        else break;
        if (Math.abs(l - h) <= 1) {
          if (d < n) break;
          for (; d > n && u >= 0; )
            u--, d = e.positions[u][0] + this.glyphMap[f].pixelWidth + c;
          break;
        }
      }
      if (d = e.positions[u][0] + this.glyphMap[f].pixelWidth + c, d < n) {
        let p = 0, g = 0;
        for (let b = 0, w = e.text.length; b < w && p <= u; ++b) {
          const y = e.text[b];
          g++, An(y) || p++;
        }
        const m = e.text[g - 1];
        let v;
        for (let b = 0, w = t.length; b < w; ++b)
          if (!An(t[b])) {
            v = t[b];
            break;
          }
        if (m && v && !this.kerning[m][v]) {
          const b = await o.estimateKerning(
            [m + v],
            this.fontString,
            this.fontSource.size,
            this.kerning,
            !1,
            this.fontSource.embed
          );
          this.addKerning(b.pairs);
        }
        a = `${e.text.substr(0, g)}${t}`;
      } else
        a = t;
      return this.getStringLayout(a, s, r);
    }
    return e;
  }
  /**
   * Calculates the width of a chunk of characters within a calculated
   * KernedLayout. To use this, first use the getStringLayout() method to get
   * the KernedLayout then insert the substring of text desired for calculating
   * the width.
   */
  getStringWidth(e, t, n) {
    const s = e.text;
    let r = 0, o = s.length;
    if (typeof t == "string") {
      const u = s.indexOf(t);
      if (u < 0) return 0;
      r = u, o = r + t.length;
    } else
      r = t;
    n !== void 0 && (o = n);
    let a = 0;
    const c = Math.min(s.length, r), l = Math.min(s.length, o);
    for (; a < c; ++a)
      An(s[a]) && (r--, o--);
    for (; a < l; ++a)
      An(s[a]) && o--;
    const h = this.glyphMap[e.text[o] || ""];
    return h ? (e.positions[o] || [0, 0])[0] - (e.positions[r] || [0, 0])[0] + h.pixelWidth : 0;
  }
  /**
   * This processes a string and lays it out by the kerning rules available to
   * this font map.
   *
   * NOTE: This ONLY processes a SINGLE LINE!! ALL whitespace characters will be
   * considered a single space.
   */
  getStringLayout(e, t, n) {
    const s = [];
    let r = "";
    const o = t / this.fontSource.size;
    let a = Number.MAX_SAFE_INTEGER, c = 0, l = 0, h = [0, 0];
    const u = this.spaceWidth;
    let d = 0, f = "", p, g;
    for (let b = 0, w = e.length; b < w; ++b) {
      const y = e[b];
      if (An(y)) {
        d++;
        continue;
      }
      p = [0, 0], f && (p = this.kerning[f][y] || [0, 0]), h = Ui(Ui(h, _e(p, o)), [
        d * u * o + (b === 0 ? 0 : n),
        0
      ]), s.push([h[0], h[1]]), r += y, g = this.glyphMap[y], a = Math.min(h[1], a), c = Math.max(h[1] + g.pixelHeight * o, c), f = y, l = h[0] + g.pixelWidth * o, d = 0;
    }
    const m = c - a, v = [l, m];
    for (let b = 0, w = s.length; b < w; ++b)
      h = s[b], h[1] -= a;
    return {
      fontScale: o,
      glyphs: r,
      positions: s,
      size: v,
      text: e
    };
  }
  /**
   * This generates the necessary texture settings for the font map based on
   * it's glyph type.
   */
  makeGlyphTypeTextureSettings(e) {
    switch (e) {
      // Simple bitmap glyphs. Just need luminance and alpha value for the glyph
      case 0:
        this.textureSettings = {
          magFilter: x.Texture.TextureMagFilter.Linear,
          minFilter: x.Texture.TextureMinFilter.LinearMipMapLinear,
          internalFormat: x.Texture.TexelDataType.LuminanceAlpha,
          format: x.Texture.TexelDataType.LuminanceAlpha
        };
        break;
      // Only a single channel is needed for SDF
      case 1:
        this.textureSettings = {
          magFilter: x.Texture.TextureMagFilter.Linear,
          minFilter: x.Texture.TextureMinFilter.Linear,
          internalFormat: x.Texture.TexelDataType.Luminance,
          format: x.Texture.TexelDataType.Luminance
        };
        break;
      // The MSDF strategy uses all RGB channels for the algorithm. Heavier data
      // use better quality results.
      case 2:
        this.textureSettings = {
          magFilter: x.Texture.TextureMagFilter.Linear,
          minFilter: x.Texture.TextureMinFilter.Linear,
          internalFormat: x.Texture.TexelDataType.RGB,
          format: x.Texture.TexelDataType.RGB
        };
        break;
    }
  }
  /**
   * Registers a glyph with it's location on the map.
   */
  registerGlyph(e, t) {
    this.dynamic ? this.doRegisterGlyph(e, t) : console.warn(
      "Attempted to register a new glyph with a non-dynamic FontMap"
    );
  }
  /**
   * Validates if all the kerning specified is ready for the text
   */
  supportsKerning(e) {
    for (let t = 1, n = e.length; t < n; ++t) {
      const s = e[t], r = e[t - 1];
      if (this.kerning[r]) {
        if (!this.kerning[r][s])
          return !1;
      } else return !1;
    }
    return !0;
  }
}
const { min: Ua, max: Ts } = Math, Xi = document.createElement("canvas");
let jt;
function Rp(i) {
  const { width: e, height: t } = i.canvas, n = i.getImageData(0, 0, e, t).data;
  let s, r = !1, o = Number.MAX_SAFE_INTEGER, a = Number.MAX_SAFE_INTEGER, c = Number.MIN_SAFE_INTEGER, l = Number.MIN_SAFE_INTEGER;
  for (let h = 0; h < e; ++h)
    for (let u = 0; u < t; ++u) {
      const d = u * (e * 4) + h * 4;
      s = n[d], s > 0 && (r = !0, o = Ua(o, u), a = Ua(a, h), c = Ts(c, h), l = Ts(l, u));
    }
  return r ? (o -= 1, l += 2, c += 2, a -= 1, o = Ts(o, 0), a = Ts(a, 0), { minX: a, minY: o, maxX: c, maxY: l }) : null;
}
function gh(i, e, t, n) {
  if (i = i[0], (Xi.width < e || Xi.height < t) && (Xi.width = e, Xi.height = t), !jt) {
    const c = Xi.getContext("2d", { willReadFrequently: !0 });
    if (c) jt = c;
    else return null;
  }
  jt.clearRect(0, 0, Xi.width, Xi.height), jt.font = n, jt.fillStyle = "white", jt.fillText(i, e / 2, t / 2);
  const s = Rp(jt);
  if (!s)
    return {
      data: jt.getImageData(0, 0, 1, 1),
      size: [0, 0]
    };
  const r = s.maxX - s.minX, o = s.maxY - s.minY;
  return {
    data: jt.getImageData(
      s.minX,
      s.minY,
      r,
      o
    ),
    size: [r, o]
  };
}
const wt = document.createElement("img"), Qe = document.createElement("canvas");
function _p(i, e, t = 400, n = "normal", s = "woff2") {
  return `
    @font-face {
      font-family: '${i}';
      src: url('${e}') ${s ? `format('${s}')` : ""};
      font-weight: ${t};
      font-style: ${n};
    }
  `;
}
async function ka(i, e, t) {
  const n = new He();
  if (!wt || !Qe) return null;
  if (t && e) {
    const u = document.createElementNS(e, "style");
    u.textContent = t.map(
      (d) => _p(d.familyName, d.source, d.weight, d.style, d.fontType)
    ).join(`
`), i.prepend(u);
  }
  const s = new XMLSerializer().serializeToString(i), a = "data:image/svg+xml;base64," + btoa(s);
  let c = !1;
  const l = async () => {
    if (c) return;
    c = !0, Qe.width = wt.width * window.devicePixelRatio, Qe.height = wt.height * window.devicePixelRatio;
    const u = Qe.getContext("2d", { willReadFrequently: !0 });
    if (!u) {
      n.resolve(null);
      return;
    }
    u.clearRect(0, 0, Qe.width, Qe.height), u.mozImageSmoothingEnabled = !1, u.webkitImageSmoothingEnabled = !1, u.msImageSmoothingEnabled = !1, u.imageSmoothingEnabled = !1, u.drawImage(
      wt,
      0,
      0,
      wt.width * window.devicePixelRatio,
      wt.height * window.devicePixelRatio
    ), n.resolve(u.getImageData(0, 0, Qe.width, Qe.height)), Qe.style.position = "absolute", Qe.style.top = "100px", Qe.style.left = "0px", Qe.style.zIndex = "9999", Qe.id = "svg-to-data";
  };
  return wt.onload = l, wt.src = a, wt.width > 0 && wt.height > 0 && l(), await n.promise;
}
const Us = ve("performance"), { floor: Mr } = Math;
async function Ap(i, e, t, n, s) {
  const r = "http://www.w3.org/2000/svg", o = O.MAX_TEXTURE_SIZE / window.devicePixelRatio, a = e * 2, c = e * 1.3, l = Mr(o / a), h = document.createElementNS(r, "svg");
  h.setAttribute("width", `${o}px`), h.style.font = i, h.style.fontFamily = "RedHatDisplay", h.style.position = "relative", h.style.left = "0px", h.style.top = "0px";
  const u = [], d = Math.floor(o / c);
  let f = 0, p = 0, g = 0, m, v, b = 0;
  for (; p < t.all.length; ) {
    const N = document.createElementNS(r, "g");
    m = N, f = Math.floor(u.length / d), N.setAttribute(
      "transform",
      `translate(0, ${(u.length - f * d) * c})`
    ), u.push(N);
    let B = o;
    for (g = 0; g < l && p < t.all.length; g++) {
      const W = document.createElementNS(r, "text");
      W.setAttribute("x", `${g * a}`), W.setAttribute("dy", "1em");
      const $ = t.all[p];
      p++;
      const K = $[0], Q = $[1], Y = document.createElementNS(r, "tspan"), j = document.createElementNS(r, "tspan");
      Y.setAttribute("fill", "#ff0000"), j.setAttribute("fill", "#0000ff"), Y.textContent = K, j.textContent = Q, W.appendChild(Y), W.appendChild(j), N.appendChild(W), B -= a;
    }
    if (B >= 0) {
      const W = document.createElementNS(r, "text");
      W.setAttribute("width", `${B}px`), N.appendChild(W), v = W;
    } else
      v = null;
    b = B;
  }
  const w = [];
  for (let N = 0; N < t.all.length; N++)
    w.push([
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER
    ]);
  let y = 0, E = !1;
  if (n) {
    const N = "M", B = document.createElementNS(r, "text");
    B.setAttribute("dy", "1em"), B.style.width = `${a}`, B.style.height = `${c}`, B.setAttribute("x", `${a * g}`), B.style.font = i;
    const W = await gh(N, 128, 128, i);
    if (W) {
      y = W.size[0];
      const $ = document.createElementNS(r, "tspan"), K = document.createElementNS(r, "tspan"), Q = document.createElementNS(r, "tspan");
      if ($.setAttribute("fill", "#ff0000"), Q.setAttribute("fill", "#0000ff"), $.textContent = N, Q.textContent = N, K.textContent = " ", B.appendChild($), B.appendChild(K), B.appendChild(Q), g < l && m)
        m.appendChild(B), b -= a, v && (v.remove(), b > 0 && (m.style.width = `${b}px`, m.appendChild(v)));
      else {
        const Y = document.createElement("g");
        f = Math.floor(u.length / d), Y.setAttribute(
          "transform",
          `translate(0, ${(u.length - f * d) * c})`
        ), m = Y, m.appendChild(B), u.push(Y), v = document.createElementNS(r, "text"), Y.appendChild(v);
      }
      w.push([
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER
      ]), E = !0;
    }
  }
  const C = u.length * c, M = Math.ceil(C / o);
  let R = null;
  Us(
    "Rendering table canvas batches for font kerning analysis",
    t,
    u
  );
  for (let N = 0; N < M; ++N) {
    const B = u.splice(0, d), W = B.length * c;
    for (h.setAttribute("height", `${W}px`); h.lastElementChild; ) h.lastElementChild.remove();
    for (let $ = 0, K = B.length; $ < K; ++$) {
      const Q = B[$];
      h.appendChild(Q);
    }
    if (!R)
      R = await ka(h, r, s);
    else {
      const $ = await ka(h, r, s);
      if (!$) {
        console.warn(
          "Font Renderer: Could not generate image data for analyzing font kerning"
        );
        continue;
      }
      const K = new Uint8ClampedArray(
        R.data.length + $.data.length
      );
      K.set(R.data), K.set($.data, R.data.length), R = new ImageData(
        K,
        o * window.devicePixelRatio,
        R.height + $.height
      );
    }
  }
  Us("Analyzing rendered data", R);
  const G = a * window.devicePixelRatio, z = c * window.devicePixelRatio;
  if (R) {
    const N = R.data;
    let B, W, $, K, Q, Y;
    for (let j = 0, be = R.height; j < be; j++)
      for (let T = 0, k = R.width; T < k; T++)
        B = (k * j + T) * 4, W = N[B + 0], $ = N[B + 1], K = N[B + 2], Y = Mr(j / z) * l + Mr(T / G), Y < w.length && (Q = w[Y], W > 0 && $ === 0 && K === 0 && (T < Q[0] && (Q[0] = T), j < Q[1] && (Q[1] = j)), W === 0 && $ === 0 && K > 0 && (T < Q[2] && (Q[2] = T), j < Q[3] && (Q[3] = j)));
    if (E) {
      const j = w.pop();
      if (j) {
        const be = [j[2] - j[0], 0], T = _e(be, 1 / window.devicePixelRatio);
        t.spaceWidth = Math.ceil(T[0]) - y;
      }
    }
    for (let j = 0, be = w.length; j < be; j++) {
      const T = t.all[j], k = T[0], q = T[1], le = w[j], Pe = [le[2] - le[0], le[3] - le[1]], Ee = t.pairs[k];
      if (Ee) {
        const Vt = _e(Pe, 1 / window.devicePixelRatio);
        Ee[q] = [Math.ceil(Vt[0]), Vt[1]];
      }
    }
  } else
    console.warn(
      "html2canvas did not produce a valid canvas context to analyze"
    );
  Us("Kerning rendering analysis complete", t.pairs);
}
function Ip(i, e, t) {
  i = i.replace(/\s/g, "");
  const n = t && t.all || [], s = t && t.pairs || {};
  for (let r = 0; r < i.length - 1; r++) {
    const o = i[r], a = i[r + 1];
    let c = s[o];
    c || (c = s[o] = {}), (!e[o] || !e[o][a]) && !c[a] && (c[a] = [0, 0], n.push(`${o}${a}`));
  }
  return {
    all: n,
    pairs: s,
    spaceWidth: 0
  };
}
class Mp {
  /**
   * This function takes a sentence and grid info Returns a canvas with a list
   * of glyphs where each glyph fits cnetered within each grid cell
   */
  makeBitmapGlyphs(e, t, n) {
    const s = {}, r = /* @__PURE__ */ new Set();
    for (let a = 0, c = e.length; a < c; ++a)
      r.add(e[a]);
    const o = Array.from(r.values());
    for (let a = 0, c = o.length; a < c; ++a) {
      const l = o[a], h = gh(l, n * 2, n * 2, t);
      h ? s[l] = {
        glyph: h.data,
        glyphIndex: a
      } : console.warn(
        "Unable to render character",
        l,
        "to font map for rendering."
      );
    }
    return s;
  }
  /**
   * This performs a special rendering to guess kerning of letters of embedded
   * fonts (fonts we don't have access to their raw font files). This will
   * provide kerning information of a letter by providing the distance from a
   * 'left' letter's top left  corner to the 'right' letter's topleft corner.
   */
  async estimateKerning(e, t, n, s, r, o) {
    const a = {
      all: [],
      pairs: {},
      spaceWidth: 0
    };
    Us("Estimating Kerning for", e);
    for (let c = 0, l = e.length; c < l; ++c) {
      const h = e[c];
      Ip(h, s, a);
    }
    return (a.all.length > 0 || r) && await Ap(t, n, a, r, o), a;
  }
}
var Un = /* @__PURE__ */ ((i) => (i[i.TEXCOORDS = 0] = "TEXCOORDS", i[i.IMAGE_SIZE = 1] = "IMAGE_SIZE", i))(Un || {});
function Gn(i) {
  return {
    type: re.FONT,
    ...i
  };
}
function cv() {
  return ".101112131415161718191.202122232425262728292.303132333435363738393.404142434445464748494.505152535455565758595.606162636465666768696.707172737475767778797.808182838485868788898.909192939495969798999.000102030405060708090.$0$1$2$3$4$5$6$7$8$9$%0%1%2%3%4%5%6%7%8%9%-0-1-2-3-4-5-6-7-8-9-+0+1+2+3+4+5+6+7+8+9+)0)1)2)3)4)5)6)7)8)9)(0(1(2(3(4(5(6(7(8(9(";
}
async function Sp(i, e) {
  let t = 0, n, s;
  try {
    if (!e) return;
    for (const r of e)
      n = r, t = 0, !document.fonts.check(i) && (t++, s = new FontFace(r.familyName, `url(${r.source})`, {
        weight: `${r.weight}`,
        style: r.style
      }), t++, await s.load(), t++, document.fonts.add(s));
    await document.fonts.ready;
  } catch (r) {
    switch (console.error("Font embedding Error:"), t) {
      case 0:
        console.error("Font embedding failed check:", i);
        break;
      case 1:
        console.error(
          "Font embedding failed to create the font face:",
          n
        );
        break;
      case 2:
        console.error("Font embedding failed to load the font face:", {
          fontFace: s,
          embedding: n
        });
        break;
      case 3:
        console.error("Font embedding failed to add the font face", {
          fontFace: s,
          embedding: n
        });
        break;
    }
    r instanceof Error && console.error(r.stack || r.message);
  }
}
const Fa = ve("performance");
var Cp = /* @__PURE__ */ ((i) => (i[i._16 = 16] = "_16", i[i._32 = 32] = "_32", i[i._64 = 64] = "_64", i[i._128 = 128] = "_128", i))(Cp || {});
function za(i) {
  return i && i.type === re.FONT;
}
function Op(i) {
  return i && i.type === void 0;
}
function mh(i) {
  return {
    key: "",
    type: re.FONT,
    ...i
  };
}
class Lp {
  constructor() {
    this.fontMaps = /* @__PURE__ */ new Map(), this.fontRenderer = new Mp();
  }
  /**
   * This takes all requests that want layout information included for a group
   * of text and populates the request with the appropriate information.
   */
  async calculateMetrics(e, t) {
    Fa("Calculating metrics for requests");
    const n = this.fontMaps.get(e);
    if (n)
      for (let s = 0, r = t.length; s < r; ++s) {
        const a = t[s].metrics;
        a && (a.layout = n.getStringLayout(
          a.text,
          a.fontSize,
          a.letterSpacing
        ), a.maxWidth && (Fa("Calculating truncation for", a.text, a.maxWidth), a.layout = await n.getTruncatedLayout(
          a.layout,
          a.truncation || "",
          a.maxWidth,
          a.fontSize,
          a.letterSpacing,
          this.fontRenderer
        ), a.truncatedText = a.layout.text));
      }
  }
  /**
   * Converts a character filter to a deduped list of single characters
   */
  characterFilterToCharacters(e) {
    const t = /* @__PURE__ */ new Set();
    let n = "";
    for (let s = 0, r = e.length; s < r; ++s) {
      const o = e[s];
      t.has(o) || (t.add(o), n += o);
    }
    return n;
  }
  /**
   * This generates a new font map object to work with. It will either be
   * pre-rendered or dynamically populated as requests are made.
   */
  async createFontMap(e) {
    const t = this.characterFilterToCharacters(
      e.characterFilter || ""
    ), n = e.fontSource;
    let s = to.SDF;
    n && (Op(n) ? s = to.BITMAP : s = n.type || s);
    const r = new Ep({
      ...e,
      glyphType: s
    });
    return await this.updateFontMapCharacters(t, r), this.fontMaps.set(e.key, r), e.fontSource.preload && this.updateFontMap(e.key, [
      Gn({
        key: e.key,
        character: "",
        kerningPairs: [e.fontSource.preload],
        metrics: {
          fontSize: 12,
          text: e.fontSource.preload,
          letterSpacing: 0
        }
      })
    ]), r;
  }
  /**
   * Free all generated resources here.
   */
  destroy() {
    this.fontMaps.forEach((e) => e.destroy());
  }
  /**
   * Destroy a single font map
   */
  destroyFontMap(e) {
    const t = this.fontMaps.get(e);
    t && t.destroy();
  }
  /**
   * This updates a font map with requests made. After the font map is updated,
   * the requests should be populated with the appropriate sub texture
   * information.
   */
  async updateFontMap(e, t) {
    const n = this.fontMaps.get(e);
    if (!n) return;
    let s = [];
    const r = /* @__PURE__ */ new Set();
    for (let a = 0, c = t.length; a < c; ++a) {
      const l = t[a];
      if (l.character && r.add(l.character), l.kerningPairs && (s = s.concat(l.kerningPairs)), l.metrics && l.metrics.truncation) {
        const h = l.metrics.truncation.replace(/\s/g, "");
        s.push(h);
        for (let u = 0, d = l.metrics.truncation.length; u < d; ++u)
          r.add(h);
      }
    }
    for (let a = 0, c = s.length; a < c; ++a)
      r.add(s[a]);
    let o = "";
    r.forEach((a) => o += a), await Sp(n.fontString, n.fontSource.embed), await this.updateFontMapCharacters(o, n), await this.updateKerningPairs(s, n);
    for (let a = 0, c = t.length; a < c; ++a)
      t[a].fontMap = n;
  }
  /**
   * This updates the calculated kerning pairs for a given font map.
   */
  async updateKerningPairs(e, t) {
    if (!t) return;
    const n = await this.fontRenderer.estimateKerning(
      e,
      t.fontString,
      t.fontSource.size,
      t.kerning,
      !t.spaceWidth,
      t.fontSource.embed
    );
    t.addKerning(n.pairs), t.spaceWidth = t.spaceWidth || n.spaceWidth;
  }
  /**
   * This updates a specified font map with a list of characters expected within
   * it.
   */
  async updateFontMapCharacters(e, t) {
    if (!t) return;
    const n = t.texture, s = t.findMissingCharacters(e);
    if (s.length <= 0) return;
    const r = this.fontRenderer.makeBitmapGlyphs(
      s,
      t.fontString,
      t.fontSource.size
    );
    for (const o in r) {
      const a = r[o];
      if (n != null && n.data) {
        const c = new Z({
          x: 0,
          y: 0,
          width: a.glyph.width,
          height: a.glyph.height
        }), l = new Bi(), h = t.packing.insert({
          data: l,
          bounds: c
        });
        if (!h) {
          console.warn(
            "Font map is full and could not pack in any more glyphs"
          );
          return;
        }
        je.applyToSubTexture(
          t.packing,
          h,
          l,
          void 0,
          !0
        ), n.update(a.glyph, {
          ...h.bounds,
          y: t.packing.bounds.height - h.bounds.y - h.bounds.height
        }), l ? t.registerGlyph(o, l) : console.warn(
          "Could not generate a subtexture for the font map registration."
        );
      } else
        console.warn(
          "Can not update font map as the maps texture data is not defined."
        );
    }
  }
  /**
   * TODO: We do not use this method yet as we do not have a format set for
   * prerendered fonts. Currently the system only uses the bitmap font dynamic
   * pattern.
   *
   * This renders the specified characters from a pre-rendered font source in
   * ImageData that can be used to composite a texture.
   */
  async getPrerenderedImageData(e, t, n) {
    const s = [];
    return n.forEach((r) => {
      let o = e.glyphs[r];
      if (o || (o = e.errorGlyph), !e.errorGlyph)
        return console.warn(
          "The prerendered source provided did NOT provide a proper glyph for rendering when a glyph could not be located."
        ), [];
      const a = new Image();
      let c;
      const l = new Promise((h) => c = h);
      return a.onload = function() {
        const h = document.createElement("canvas"), u = h.getContext("2d");
        if (!u) return;
        h.width = t, h.height = t, u.drawImage(a, 0, 0, t, t);
        const d = u.getImageData(0, 0, t, t);
        c(d);
      }, a.onerror = function() {
        console.warn(
          "There was an issue with loading the glyph data for character:",
          r
        ), c(null);
      }, a.src = e.glyphs[r], s.push(l), [];
    }), await Promise.all(s);
  }
}
const Np = ve("performance");
class Pp {
  /**
   * This is a helper to apply declarations to the input declaration object. This will automatically use the
   * performance debug output to provide useful information when overrides occur.
   */
  setDeclaration(e, t, n, s) {
    e.has(t) && Np(
      `%s: Overriding declaration %s
Setting new value: %s`,
      s || "Expand IO Declarations",
      t,
      n
    ), e.set(t, n);
  }
}
class wr extends Pp {
  /**
   * This is called with the Layer's currently declared Shader IO configuration.
   * The returned IO configuration will be added to the existing IO. Each
   * BaseIOExpansion object will receive the expanded IO configuration of other
   * expansion objects if the object is processed after another expansion
   * object.
   *
   * NOTE: The inputs should NOT be modified in any way
   */
  expand(e, t, n, s, r) {
    return {
      instanceAttributes: [],
      uniforms: [],
      vertexAttributes: [],
      indexBuffer: void 0
    };
  }
  /**
   * Every expansion object will be given the opportunity to validate the IO
   * presented to it here, thus allowing unique IO configuration types to be
   * confirmed before getting completely processed.
   *
   * It will be expected that a unique Expansion object will have special
   * requirements centered around the configuration object, thus it is expected
   * this be implemented in a meaningful way to make devlopment clearer by
   * making mistakes clearer to the developer.
   *
   * Messages should be logged within this method as warnings or errors when
   * validations fail and then this method should return false indicating the
   * validation failed.
   *
   * NOTE: The inputs should NOT be modified in any way
   */
  validate(e, t, n, s, r) {
    return !0;
  }
  /**
   * This allows for injection into the header of the shader.
   *
   * The order these controllers are injected into the system determines the
   * order the contents are written to the header. So dependent injections must
   * be sorted appropriately.
   *
   * @param target The targetted shader object to receive the header. This will
   *               be VERTEX or FRAGMENT but never ALL
   * @param layer The layer that is currently being processed
   * @param metrics Some metrics processed that are useful for making decisions
   *                about buffering strategies etc.
   */
  processHeaderInjection(e, t, n, s, r, o, a) {
    return {
      injection: ""
    };
  }
  /**
   * This allows for injection into the shader AFTER attribute destructuring has
   * taken place.
   *
   * The order these controllers are injected into the system determines the
   * order the contents are written to the header. So dependent injections must
   * be sorted appropriately.
   *
   * @param layer The layer that is currently being processed
   * @param metrics Some metrics processed that are useful for making decisions
   *                about buffering strategies etc.
   */
  processAttributeDestructuring(e, t, n, s, r, o) {
    return "";
  }
}
const Bp = "TextureIOExpansion";
function Dp(i, e, t) {
  return i && i.resource && e.getResourceType(i.resource.key()) === t && i.resource.name !== void 0 && i.resource.key !== void 0;
}
class $o extends wr {
  constructor(e, t) {
    super(), this.manager = t, this.resourceType = e;
  }
  /**
   * Provides expanded IO for attributes with resource properties.
   */
  expand(e, t, n, s) {
    const r = this.manager, o = [], a = /* @__PURE__ */ new Map();
    t.forEach((h) => {
      if (Dp(h, this.manager.router, this.resourceType)) {
        h.size === void 0 && (h.size = S.FOUR);
        const u = h.resource.shaderInjection || A.FRAGMENT, d = a.get(
          h.resource.name
        );
        d ? a.set(h.resource.name, [
          d[0] || u === A.VERTEX || u === A.ALL,
          d[1] || u === A.FRAGMENT || u === A.ALL
        ]) : (o.push(h), a.set(h.resource.name, [
          u === A.VERTEX || u === A.ALL,
          u === A.FRAGMENT || u === A.ALL
        ]));
      }
    });
    const c = o.map(
      (h) => {
        let u = A.FRAGMENT;
        if (h.resource) {
          const d = a.get(
            h.resource.name
          );
          d && (u = d[0] && d[1] && A.ALL || d[0] && !d[1] && A.VERTEX || !d[0] && d[1] && A.FRAGMENT || u);
        }
        return [
          // This injects the sampler that the shader will use for sampling
          // texels
          {
            name: h.resource.name,
            shaderInjection: u,
            size: _.TEXTURE,
            update: () => {
              const d = r.getResource(
                h.resource.key()
              );
              return d && d.texture || ee.emptyTexture;
            }
          },
          // This provides the size of the texture that is applied to the
          // sampler.
          {
            name: `${h.resource.name}_size`,
            shaderInjection: u,
            size: _.TWO,
            update: () => {
              const d = r.getResource(
                h.resource.key()
              );
              if (d) {
                const f = d.texture;
                if (f && f.data) {
                  const { width: p, height: g } = f.data;
                  return [p || 1, g || 1];
                }
              }
              return [1, 1];
            }
          }
        ];
      }
    ), l = [];
    return c.forEach(
      (h) => h.forEach((u) => l.push(u))
    ), {
      instanceAttributes: [],
      vertexAttributes: [],
      uniforms: l
    };
  }
  /**
   * Validates the IO about to be expanded.
   */
  validate(e, t, n, s) {
    let r = !1;
    return t.forEach((o) => {
      o.easing && o.resource && (console.warn(
        "An instance attribute can not have both easing and resource properties. Undefined behavior will occur."
      ), console.warn(o), r = !0);
    }), !r;
  }
  /**
   * For texture resources, we need the uniforms with a size of ATLAS to be
   * injected as a sampler2D instead of a vector sizing which the basic io
   * expansion can only provide.
   */
  processHeaderInjection(e, t, n, s, r, o, a) {
    const c = {
      injection: ""
    };
    for (let l = 0, h = a.length; l < h; ++l) {
      const u = a[l], d = u.shaderInjection || A.VERTEX;
      u.size === _.TEXTURE && (d === e || d === A.ALL) && this.setDeclaration(
        t,
        u.name,
        `uniform sampler2D ${u.name};
`,
        Bp
      );
    }
    return c;
  }
}
const jn = ve("performance");
class Up extends rs {
  constructor() {
    super(...arguments), this.requestLookup = /* @__PURE__ */ new Map(), this.requestQueue = /* @__PURE__ */ new Map(), this.resourceLookup = /* @__PURE__ */ new Map(), this.fontManager = new Lp();
  }
  /**
   * This is so the system can control when requests are made so this manager
   * has the opportunity to verify and generate the resources the request
   * requires.
   */
  async dequeueRequests() {
    let e = !1;
    const t = [];
    this.requestQueue.forEach((n, s) => {
      t.push([s, n]);
    }), this.requestQueue.clear();
    for (let n = 0, s = t.length; n < s; ++n) {
      const [r, o] = t[n];
      if (o.length > 0) {
        e = !0;
        const a = o.slice(0);
        o.length = 0, jn("Processing requests for resource '%s'", r), await this.fontManager.updateFontMap(r, a), await this.fontManager.calculateMetrics(r, a);
        const c = this.requestLookup.get(r);
        c ? (a.forEach((l) => {
          const h = c.get(l);
          if (c.delete(l), h) {
            for (let u = 0, d = h.length; u < d; ++u) {
              const [f, p] = h[u];
              f.managesInstance(p) && (p.active = !0);
            }
            Zl(() => {
              const u = /* @__PURE__ */ new Set();
              for (let d = 0, f = h.length; d < f; ++d) {
                const p = h[d][1];
                u.has(p) || (u.add(p), p.resourceTrigger());
              }
            });
          }
        }), jn("All requests for resource '%s' are processed", r)) : jn(
          "There were no Font requests waiting for completion for resource",
          r
        );
      }
    }
    return e;
  }
  /**
   * This will force this manager to free all of it's beloved resources that it
   * manages should it be holding onto resources that can not be freed by lack
   * of references.
   */
  destroy() {
    this.fontManager.destroy();
  }
  /**
   * Destroy a single resource if the system deems it's time for it to go
   */
  destroyResource(e) {
    const t = this.resourceLookup.get(e.key);
    t && (this.fontManager.destroyFontMap(t.id), this.resourceLookup.delete(e.key));
  }
  /**
   * This will provide the resource generated from the initResource operation.
   */
  getResource(e) {
    return this.resourceLookup.get(e) || null;
  }
  /**
   * Make the expander to handle making the attribute changes necessary to have
   * the texture applied to a uniform when the attribute places a resource
   * request with a key.
   */
  getIOExpansion() {
    return [new $o(re.FONT, this)];
  }
  /**
   * This is a request to intiialize a resource by this manager.
   */
  async initResource(e) {
    if (za(e)) {
      const t = await this.fontManager.createFontMap(e);
      t && this.resourceLookup.set(e.key, t), jn("Font map created->", t);
    }
  }
  /**
   * This is for attributes making a request for a resource of this type to
   * create shader compatible info regarding the requests properties.
   */
  request(e, t, n, s) {
    const r = n, o = r.fontMap;
    let a = null;
    if (o)
      return r.character && (a = o.getGlyphTexture(r.character)), a ? r.fetch === Un.IMAGE_SIZE ? [a.pixelWidth, a.pixelHeight] : rn(a) : r.fetch === Un.IMAGE_SIZE ? [0, 0] : rn(null);
    const c = n.key;
    let l = this.requestLookup.get(c);
    if (l) {
      const u = l.get(r);
      if (u)
        return u.push([e, t]), t.active = !1, r.fetch === Un.IMAGE_SIZE ? [0, 0] : rn(a);
    } else
      l = /* @__PURE__ */ new Map(), this.requestLookup.set(c, l);
    t.active = !1;
    let h = this.requestQueue.get(c);
    return h || (h = [], this.requestQueue.set(c, h)), h.push(r), l.set(r, [[e, t]]), r.fetch ? [0, 0] : rn(a);
  }
  /**
   * Responds to the system detecting properties for a resource need updating.
   */
  updateResource(e) {
    if (!za(e)) return;
    const t = this.resourceLookup.get(e.key);
    t && (sh(e.fontSource, t.fontSource) || jn(
      "Font resources currently do not update. To update their properties simply destroy and recreate for now."
    ));
  }
}
let Ce;
class Ln {
  /**
   * This loops until our canvas context is available
   */
  static async awaitContext() {
    for (; !Ce; )
      this.getContext(), await new Promise((e) => setTimeout(e, 10));
  }
  /**
   * Attempts to populate the 'canvas' context for rendering images offscreen.
   */
  static getContext() {
    Ce || (Ce = document.createElement("canvas").getContext("2d"));
  }
  /**
   * This ensures an image is renderable at the current moment. This draws the
   * image to a canvas partially to help the image 'warm up' within some browser
   * contexts to ensure the image can be used as a drawable item.
   */
  static async calculateImageSize(e) {
    if (await this.awaitContext(), !Ce) {
      console.warn(
        "The Image rasterizer was unable to establish a valid canvas context. Please ensure the system supports contexts and ensure the document is ready first."
      );
      return;
    }
    if (e.width === 0 || e.height === 0) {
      console.warn(
        "Images provided shoud have valid dimensions! Please ensure the image is loaded first."
      );
      return;
    }
    return Ce.canvas.width = 100, Ce.canvas.height = 100, Ce.drawImage(e, 0, 0, 1, 1), [e.width, e.height];
  }
  /**
   * This resizes the input image by the provided scale.
   */
  static async resizeImage(e, t) {
    if (await this.awaitContext(), !Ce)
      return console.warn(
        "The Image rasterizer was unable to establish a valid canvas context. Please ensure the system supports contexts and ensure the document is ready first."
      ), e;
    if (e.width === 0 || e.height === 0)
      return console.warn(
        "Images provided shoud have valid dimensions! Please ensure the image is loaded first."
      ), e;
    Ce.canvas.width = Math.floor(e.width * t), Ce.canvas.height = Math.floor(e.height * t), e instanceof ImageData ? Ce.putImageData(
      e,
      0,
      0,
      0,
      0,
      Ce.canvas.width,
      Ce.canvas.height
    ) : Ce.drawImage(e, 0, 0, Ce.canvas.width, Ce.canvas.height);
    const n = new Image();
    return n.src = Ce.canvas.toDataURL("image/png"), await Ln.calculateImageSize(n), n;
  }
}
class kp {
  constructor(e, t) {
    this.video = e, this.subTexture = t, this.isDestroyed = !1, this.renderedTime = -1, this.previousTime = -1, this.playedFrames = 0, this.caughtFrames = 0, this.timeFrame = 0, this.doUpdate = () => {
      Math.abs(this.video.currentTime - this.renderedTime) < 0.015 || (this.renderedTime = this.video.currentTime, this.subTexture.update());
    }, this.loop = (n) => {
      this.doUpdate(), this.isDestroyed || ki(this.loop);
    }, this.addEventListeners();
  }
  /**
   * Applies all of the necessary listeners to the video object
   */
  async addEventListeners() {
    this.isDestroyed || this.loop(await ki());
  }
  /**
   * Allows all resources to be freed.
   */
  destroy() {
    this.video.pause(), this.isDestroyed = !0, this.removeEventListeners();
  }
  /**
   * Cleans up any listeners this may have registered to ensure the video does not get retained
   */
  removeEventListeners() {
  }
}
const Fp = ve("performance");
function xh(i) {
  return {
    key: "",
    type: re.ATLAS,
    ...i
  };
}
function Ga(i) {
  return i && i.type === re.ATLAS;
}
class zp extends hn {
  constructor(e) {
    super(e), this.resourceReferences = /* @__PURE__ */ new Map(), this.type = re.ATLAS;
    const t = document.createElement("canvas");
    if (this.width = t.width = e.width, this.height = t.height = e.height, this.textureSettings = e.textureSettings, e.width < 0 || e.height < 0)
      throw new Error(
        "TextureSize Error: An atlas does NOT support Screen Texture sizing."
      );
    this.packing = new je(0, 0, e.width, e.height), this.createTexture(t);
  }
  /**
   * This generates the texture object needed for this atlas.
   */
  createTexture(e) {
    if (this.texture) return;
    let t;
    this.textureSettings ? t = {
      generateMipMaps: !0,
      premultiplyAlpha: !0,
      ...this.textureSettings
    } : t = {
      generateMipMaps: !0,
      premultiplyAlpha: !0
    }, this.texture = new ee({
      data: e,
      ...t
    });
  }
  /**
   * This frees up all the resources down to the GPU related to this atlas. It also
   * loops through every resource and invalidates the texturing information within
   * them so subsequent accidental renders will appear as a single color rather than
   * an artifacted element.
   */
  destroy() {
    var e;
    (e = this.texture) == null || e.destroy(), this.resourceReferences.forEach((t) => {
      this.invalidateTexture(t.subtexture);
    });
  }
  /**
   * This invalidates the SubTexture of an atlas resource.
   */
  invalidateTexture(e) {
    const t = [0, 0];
    e.aspectRatio = 1, e.atlasBL = t, e.atlasBR = t, e.atlasTL = t, e.atlasTR = t, e.isValid = !1, e.texture = null, e.pixelHeight = 0, e.pixelWidth = 0, delete e.source, e.video && (e.video.monitor.destroy(), delete e.video);
  }
  /**
   * This will look through all resources in this atlas and will determine if the resource
   * should be removed or not.
   */
  resolveResources() {
    const e = [];
    this.resourceReferences.forEach((t, n) => {
      t.count <= 0 && t.subtexture && (Fp(
        "A subtexture on an atlas has been invalidated as it is deemed no longer used: %o",
        t.subtexture
      ), this.invalidateTexture(t.subtexture), e.push(n));
    });
    for (let t = 0, n = e.length; t < n; ++t)
      this.resourceReferences.delete(e[t]);
  }
  /**
   * This flags a resource no longeer used and decrements it's reference count.
   * If the use of the resource drops low enough, this will clear out the resurce
   * completely.
   */
  stopUsingResource(e) {
    const t = this.resourceReferences.get(
      e.source
    ) || {
      subtexture: e.texture || new Bi(),
      count: 0
    };
    t.count--;
  }
  /**
   * This flags a resource for use and increments it's reference count.
   */
  useResource(e) {
    const t = this.resourceReferences.get(e.source) || {
      subtexture: e.texture,
      count: 0
    };
    t.count++;
  }
}
const Va = ve("performance"), Gp = new Bi({
  aspectRatio: 0,
  atlasBL: [0, 0],
  atlasBR: [0, 0],
  texture: null,
  atlasTL: [0, 0],
  atlasTR: [0, 0],
  heightOnAtlas: 0,
  isValid: !1,
  pixelHeight: 0,
  pixelWidth: 0,
  widthOnAtlas: 0
});
function Vp(i) {
  return !!(i && i.isValid && i.pixelWidth && i.pixelHeight);
}
class $p {
  constructor() {
    this.allAtlas = /* @__PURE__ */ new Map();
  }
  /**
   * Creates a new atlas that resources can be loaded into.
   *
   * @param resources The images with their image path set to be loaded into the
   *               atlas. Images that keep an atlas ID of null indicates the
   *               image did not load correctly
   *
   * @return {Texture} The texture that is created as our atlas. The images
   *                   injected into the texture will be populated with the
   *                   atlas'
   */
  async createAtlas(e) {
    const t = new zp(e);
    return this.allAtlas.set(t.id, t), Va("Atlas Created-> %o", t), t;
  }
  /**
   * Free ALL resources under this manager
   */
  destroy() {
    this.allAtlas.forEach((e) => e.destroy());
  }
  /**
   * Disposes of the resources the atlas held and makes the atlas invalid for
   * use
   *
   * @param atlasName
   */
  destroyAtlas(e) {
    const t = this.allAtlas.get(e);
    t && t.destroy();
  }
  setDefaultImage(e, t) {
    return e = Object.assign(e, Gp, { atlasReferenceID: t }), e;
  }
  /**
   * This loads, packs, and draws the indicated image into the specified canvas
   * using the metrics that exists for the specified atlas.
   *
   * @param request The image who should have it's image path loaded
   * @param atlasName The name of the atlas to make the packing work
   * @param canvas The canvas we will be drawing into to generate the complete
   * image
   *
   * @return {Promise<boolean>} Promise that resolves to if the image
   * successfully was drawn or not
   */
  async draw(e, t) {
    var a;
    const n = e.id;
    if (t.disposeResource)
      return !0;
    const s = e.resourceReferences.get(t.source);
    if (s)
      return t.texture = s.subtexture, !0;
    t.texture = new Bi(), t.texture.isValid = !0, e.resourceReferences.set(t.source, {
      subtexture: t.texture,
      count: 0
    });
    const r = await this.loadImage(t), o = t.texture;
    if (r && Vp(o)) {
      const c = new Z({
        bottom: o.pixelHeight,
        left: 0,
        right: o.pixelWidth,
        top: 0
      }), l = {
        data: o,
        bounds: c
      };
      l.bounds.width += 0, l.bounds.height += 0;
      let h = e.packing, u = h.insert(l);
      if (!u) {
        if (!this.repackResources(e))
          return console.error(
            "Repacking the atlas failed. Some resources may be in an undefined state. Consider making another atlas."
          ), !1;
        h = e.packing, u = h.insert(l);
      }
      return u ? (u.data = o, je.applyToSubTexture(h, u, o, {
        top: 0.5,
        left: 0.5,
        right: 0.5,
        bottom: 0.5
      }), o.texture = e.texture || null, o.source = r, o.atlasRegion = {
        ...u.bounds,
        y: e.height - u.bounds.y - u.bounds.height
      }, (a = e.texture) == null || a.update(r, o.atlasRegion), r instanceof HTMLVideoElement && (o.video = {
        monitor: new kp(r, o)
      }), !0) : (console.error("Could not fit resource into atlas", t), t.texture = this.setDefaultImage(o, n), !1);
    } else
      return o && !o.isValid ? Va("Resource was invalidated during load:", t) : console.error("Could not load resource:", t), t.texture && (t.texture = this.setDefaultImage(t.texture, n)), !1;
  }
  /**
   * Retrieves the actual Atlas object for a given resource id
   */
  getAtlasTexture(e) {
    return this.allAtlas.get(e);
  }
  /**
   * This takes in any atlas resource and ensures the image is available and
   * ready to render.
   */
  async loadImage(e) {
    const t = e.texture || new Bi(), n = e.source;
    if (e.texture = t, e.texture.isValid === !1) return null;
    if (n instanceof HTMLImageElement) {
      let s = await new Promise((r) => {
        if (!(n instanceof HTMLImageElement)) return;
        const o = n;
        if (o.width && o.height) {
          Ln.calculateImageSize(o), t.pixelWidth = o.width, t.pixelHeight = o.height, t.aspectRatio = o.width / o.height, r(o);
          return;
        }
        o ? (o.onload = function() {
          t.pixelWidth = o.width, t.pixelHeight = o.height, t.aspectRatio = o.width / o.height, o.onload = null, r(o);
        }, o.onerror = function() {
          console.error("Error generating Image element for source:", n), o.onload = null, r(null);
        }) : r(null);
      });
      return s && e.rasterizationScale !== void 0 && e.rasterizationScale !== 1 && (s = await Ln.resizeImage(
        s,
        e.rasterizationScale || 1
      )), s;
    } else {
      if (n instanceof HTMLVideoElement)
        return n.videoHeight === 0 || n.videoWidth === 0 ? (console.warn(
          "Video requests to the atlas manager MUST have the video completely loaded and ready for loading",
          "There are too many caveats to automate video loading at this low of a level to have it prepped properly for",
          "use in the texture for all browsers. Consider handling video resources at the layer level to have them",
          "prepped for use."
        ), null) : (t.pixelWidth = n.videoWidth, t.pixelHeight = n.videoHeight, t.aspectRatio = n.videoWidth / n.videoHeight, n);
      if (Li(n)) {
        const s = n;
        let r = await new Promise((o) => {
          const a = new Image();
          a.onload = function() {
            t.pixelWidth = a.width, t.pixelHeight = a.height, t.aspectRatio = a.width / a.height, a.onload = null, o(a);
          }, a.onerror = function() {
            console.error("Error generating Image element for source:", n), o(null);
          }, a.crossOrigin = "anonymous", a.src = s;
        });
        return r && e.rasterizationScale !== void 0 && e.rasterizationScale !== 1 && (r = await Ln.resizeImage(
          r,
          e.rasterizationScale || 1
        )), r;
      } else {
        let s = n;
        return s && e.rasterizationScale !== void 0 && e.rasterizationScale !== 1 && (s = await Ln.resizeImage(
          s,
          e.rasterizationScale || 1
        )), s;
      }
    }
  }
  /**
   * When this is triggered, the atlas will examine all of it's packing and
   * repack it's resources on the texture for the atlas thus eliminating any
   * dead space from resources that have been disposed.
   *
   * This process will cause the atlas to generate a new Texture to utilize and
   * dispose of the old texture to allow for the atlas to redraw it's texture
   * using GPU operations which is much faster than a CPU operation of
   * generating the texture.
   */
  repackResources(e) {
    if (!this.renderer)
      return console.warn(
        "Attempted to repack resources for an atlas, but no renderer has been specified for this manager yet."
      ), !1;
    const t = [e.packing], n = [];
    let s = 0;
    const r = /* @__PURE__ */ new Map();
    for (; s < t.length; ) {
      const w = t[s];
      s++, w.data && w.data.texture && (n.push(w), r.set(w.bounds, new Z(w.bounds))), w.child[0] && t.push(w.child[0]), w.child[1] && t.push(w.child[1]);
    }
    if (n.sort(
      (w, y) => Math.max(y.bounds.width, y.bounds.height) - Math.max(w.bounds.width, w.bounds.height)
    ), n.length <= 0)
      return e.packing = new je(0, 0, e.width, e.height), !0;
    if (!e.texture)
      return console.warn(
        "Attempted to repack resources for an atlas with no texture."
      ), !1;
    const o = new ee(e.texture);
    o.data = {
      buffer: new Uint8Array(e.width * e.height * 4),
      width: e.width,
      height: e.height
    };
    const a = new je(0, 0, e.width, e.height);
    let c = !1;
    for (let w = 0, y = n.length; w < y; ++w) {
      const E = n[w];
      if (!E.data) {
        console.warn("Attempted to repack a node with no valid data.");
        continue;
      }
      E.bounds.x = 0, E.bounds.y = 0;
      const C = a.insert({
        bounds: E.bounds,
        data: E.data
      });
      if (!C) {
        console.warn(
          "When repacking the atlas, an existing node was unable to be repacked",
          E
        ), c = !0;
        continue;
      }
      je.applyToSubTexture(a, C, E.data);
    }
    if (c)
      return !1;
    const l = new Float32Array(n.length * 2 * 6), h = new Float32Array(n.length * 2 * 6), u = new Bi();
    for (let w = 0, y = n.length; w < y; ++w) {
      const E = n[w], C = r.get(E.bounds), M = E.data;
      if (!C || !M) {
        console.warn(
          "While repacking there was an issue finding the previous bounds and the next texture to use",
          C,
          M
        );
        continue;
      }
      je.applyToSubTexture(a, C, u);
      const R = w * 2 * 6;
      l[R] = M.atlasTL[0] * 2 - 1, l[R + 1] = M.atlasTL[1] * 2 - 1, l[R + 2] = M.atlasTR[0] * 2 - 1, l[R + 3] = M.atlasTR[1] * 2 - 1, l[R + 4] = M.atlasBL[0] * 2 - 1, l[R + 5] = M.atlasBL[1] * 2 - 1, l[R + 6] = M.atlasTR[0] * 2 - 1, l[R + 7] = M.atlasTR[1] * 2 - 1, l[R + 8] = M.atlasBR[0] * 2 - 1, l[R + 9] = M.atlasBR[1] * 2 - 1, l[R + 10] = M.atlasBL[0] * 2 - 1, l[R + 11] = M.atlasBL[1] * 2 - 1, h[R] = u.atlasTL[0], h[R + 1] = u.atlasTL[1], h[R + 2] = u.atlasTR[0], h[R + 3] = u.atlasTR[1], h[R + 4] = u.atlasBL[0], h[R + 5] = u.atlasBL[1], h[R + 6] = u.atlasTR[0], h[R + 7] = u.atlasTR[1], h[R + 8] = u.atlasBR[0], h[R + 9] = u.atlasBR[1], h[R + 10] = u.atlasBL[0], h[R + 11] = u.atlasBL[1], M.texture = o;
    }
    const d = new Di(), f = new ii(l, 2), p = new ii(h, 2);
    d.addAttribute("position", f), d.addAttribute("texCoord", p);
    const g = new Zi({
      buffers: {
        color: { buffer: o, outputType: 0 }
      },
      retainTextureTargets: !0
    }), m = new lr({
      culling: x.Material.CullSide.NONE,
      uniforms: {
        texture: { type: Te.TEXTURE, data: e.texture }
      },
      fragmentShader: /* @__PURE__ */ new Map([
        [
          g,
          {
            outputNames: [],
            outputTypes: [0],
            source: `
          precision highp float;

          uniform sampler2D texture;
          varying vec2 _texCoord;

          void main() {
            gl_FragColor = texture2D(texture, _texCoord);
          }
        `
          }
        ]
      ]),
      vertexShader: `
        precision highp float;

        attribute vec2 position;
        attribute vec2 texCoord;
        varying vec2 _texCoord;

        void main() {
          _texCoord = texCoord;
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `
    }), v = new Cl("__atlas_manager__", d, m);
    v.vertexCount = n.length * 6, v.drawMode = x.Model.DrawMode.TRIANGLES;
    const b = new Fr();
    return b.add(v), this.renderer.setRenderTarget(g), this.renderer.setViewport(this.renderer.getFullViewport()), this.renderer.setScissor(this.renderer.getFullViewport()), this.renderer.render(b, g), m.dispose(), d.destroy(), g.dispose(), e.texture.destroy(), e.texture = o, e.packing = a, !0;
  }
  /**
   * This targets an existing atlas and attempts to update it with the provided
   * atlas resources.
   */
  async updateAtlas(e, t) {
    const n = this.allAtlas.get(e);
    if (n) {
      for (const s of t)
        s.disposeResource || await this.draw(n, s);
      for (let s = 0, r = t.length; s < r; ++s) {
        const o = t[s];
        o.disposeResource ? n.stopUsingResource(o) : n.useResource(o);
      }
      n.resolveResources();
    } else
      console.warn(
        "Can not update non-existing atlas:",
        e,
        "These resources will not be loaded:",
        t
      );
    return n;
  }
}
class Wp extends rs {
  constructor(e) {
    super(), this.resources = /* @__PURE__ */ new Map(), this.requestQueue = /* @__PURE__ */ new Map(), this.requestLookup = /* @__PURE__ */ new Map(), this.atlasManager = e && e.atlasManager || new $p();
  }
  /**
   * Override the get and set of the webgl renderer so we can also apply it to
   * the atlas manager object
   */
  get webGLRenderer() {
    return this._webGLRenderer;
  }
  set webGLRenderer(e) {
    this._webGLRenderer = e, this.atlasManager.renderer = e;
  }
  /**
   * This dequeues all instance requests for a resource and processes the
   * request which will inevitably make the instance active
   */
  async dequeueRequests() {
    let e = !1;
    const t = [];
    this.requestQueue.forEach((n, s) => {
      t.push([s, n]);
    }), this.requestQueue.clear();
    for (const [n, s] of t)
      if (s.length > 0) {
        e = !0;
        const r = s.slice(0);
        s.length = 0, await this.atlasManager.updateAtlas(n, r);
        const o = this.requestLookup.get(n);
        if (o) {
          const a = /* @__PURE__ */ new Set();
          r.forEach((c) => {
            const l = o.get(c);
            if (o.delete(c), l && !c.disposeResource)
              for (let h = 0, u = l.length; h < u; ++h) {
                const [d, f] = l[h];
                d.managesInstance(f) && (f.active = !0), a.add(f);
              }
          }), Zl(() => {
            a.forEach((c) => {
              c.active = !0, c.resourceTrigger();
            });
          });
        }
      }
    return e;
  }
  /**
   * Free ALL resources managed under this resource manager
   */
  destroy() {
    this.atlasManager.destroy();
  }
  /**
   * System requests a resource get's destroyed here
   */
  destroyResource(e) {
    this.resources.get(e.key) && (this.atlasManager.destroyAtlas(e.key), this.resources.delete(e.key));
  }
  /**
   * This retrieves the actual atlas texture that should be applied to a uniform's
   * value.
   */
  getAtlasTexture(e) {
    const t = this.atlasManager.getAtlasTexture(e);
    return t && t.texture || null;
  }
  /**
   * Get generated resources from this manager
   */
  getResource(e) {
    return this.resources.get(e) || null;
  }
  /**
   * Return the IO Expander necessary to handle the resurce type this manager is
   * attempting to provide for layers.
   */
  getIOExpansion() {
    return [new $o(re.ATLAS, this)];
  }
  /**
   * Initialize the atlas resources requested for construction
   */
  async initResource(e) {
    if (Ga(e)) {
      const t = await this.atlasManager.createAtlas(e);
      this.resources.set(e.key, t);
    }
  }
  /**
   * This is a request for atlas texture resources. It will produce either the
   * coordinates needed to make valid texture lookups, or it will trigger a
   * loading of resources to an atlas and cause an automated deactivation and
   * reactivation of the instance.
   */
  request(e, t, n, s) {
    const r = n.key || "", o = n.texture;
    if (o)
      return rn(o);
    let a = this.requestLookup.get(r);
    if (a) {
      const l = a.get(n);
      if (l)
        return l.push([e, t]), t.active = !1, rn(n.texture);
    } else
      a = /* @__PURE__ */ new Map(), this.requestLookup.set(r, a);
    n.disposeResource || (t.active = !1);
    let c = this.requestQueue.get(r);
    return c || (c = [], this.requestQueue.set(r, c)), c.push(n), a.set(n, [[e, t]]), rn(o);
  }
  /**
   * System is requesting properties for a resource to be updated.
   */
  updateResource(e) {
    Ga(e);
  }
}
const jp = new Image();
function Kn(i) {
  return {
    type: re.ATLAS,
    source: jp,
    ...i
  };
}
class Hp extends rs {
  constructor() {
    super(...arguments), this.resources = /* @__PURE__ */ new Map();
  }
  /**
   * This manager does not need to dequeue requests as all requests will be
   * immediately resolved with no asynchronous requirements.
   */
  async dequeueRequests() {
    return !1;
  }
  /**
   * This frees up resources when the system indictates this manager is no
   * longer needed.
   */
  destroy() {
    this.resources.forEach((e) => e.destroy()), this.resources.clear();
  }
  /**
   * We make an expander for when an attribute requests a TEXTURE resource. This
   * will ensure attributes that require a TEXTURE type resource will have the
   * resource added as a uniform.
   */
  getIOExpansion() {
    return [new $o(re.TEXTURE, this)];
  }
  /**
   * This retrieves the generated resources this manager tracks.
   */
  getResource(e) {
    return this.resources.get(e) || null;
  }
  /**
   * The system will inform this manager when a resource is no longer needed and
   * should be disposed.
   */
  destroyResource(e) {
    const t = this.resources.get(e.key);
    t && (t.destroy(), this.resources.delete(e.key));
  }
  /**
   * The system will inform this manager when a resource should be built.
   */
  async initResource(e) {
    let t = this.resources.get(e.key);
    if (t) {
      console.warn(
        "Attempted to generate a RenderTexture that already exists for key",
        e.key
      );
      return;
    }
    t = new Ea(e, this.webGLRenderer), this.resources.set(e.key, t);
  }
  /**
   * Handle requests that stream in from instances requesting metrics for a
   * specific resource.
   */
  request(e, t, n, s) {
    const r = this.resources.get(n.key);
    return r ? (n.texture = r.texture, [0, 0, 1, 1]) : [0, 0, 0, 0];
  }
  /**
   * Trigger that executes when the rendering context resizes. For this manager,
   * we will update all textures with dimensions that are tied to the screen.
   */
  resize() {
    const e = /* @__PURE__ */ new Map();
    this.resources.forEach((t, n) => {
      t.width > ft.SCREEN && t.height > ft.SCREEN || (t.texture.destroy(), t = new Ea(t, this.webGLRenderer), e.set(n, t));
    }), e.forEach((t, n) => this.resources.set(n, t));
  }
  /**
   * This targets the specified resource and attempts to update it's settings.
   */
  updateResource(e) {
    this.resources.get(e.key) && console.warn("UPDATING AN EXISTING RENDER TEXTURE IS NOT SUPPORTED YET");
  }
}
const Xp = ve("performance");
class vh {
  constructor() {
    this.managers = /* @__PURE__ */ new Map(), this.resourceKeyToType = /* @__PURE__ */ new Map();
  }
  /**
   * This is called by the system to cause the managers to dequeue their requests in an asynchronous fashion
   */
  async dequeueRequests() {
    let e = !1;
    const t = Array.from(this.managers.values());
    for (let n = 0, s = t.length; n < s; ++n) {
      const o = await t[n].dequeueRequests();
      e = e || o;
    }
    return e;
  }
  /**
   * Destroys all managers managed by this manager.
   */
  destroy() {
    this.managers.forEach((e) => e.destroy()), this.resourceKeyToType.clear(), this.managers.clear(), delete this.webGLRenderer;
  }
  /**
   * This hands the destruction of a resource to the correct Resource Manager.
   */
  async destroyResource(e) {
    const t = this.managers.get(e.type);
    if (!t) {
      console.warn(
        `A Resource is trying to be destroyed but has no manager to facilitate the operation: ${e.type}`
      );
      return;
    }
    return this.resourceKeyToType.delete(e.key), await t.destroyResource(e);
  }
  /**
   * Retrieves the Shader IO Expansion controllers that may be provided by resource managers.
   */
  getIOExpansion() {
    let e = [];
    return this.managers.forEach((t) => {
      e = e.concat(t.getIOExpansion());
    }), e;
  }
  /**
   * Gets the manager for the provided resource type
   */
  getManager(e) {
    const t = this.managers.get(e);
    return t || (console.warn(
      `A manager was requested that does not exist for type ${e}`
    ), Wu);
  }
  /**
   * Retrieves the resource type that a resource key is associated with. This is undefined if the key does
   * not exist.
   */
  getResourceType(e) {
    return this.resourceKeyToType.get(e);
  }
  /**
   * This hands the initialization of a resource to the correct Resource Manager.
   */
  async initResource(e) {
    const t = this.managers.get(e.type);
    if (!t) {
      console.warn(
        `A Resource is trying to be created but has no manager to facilitate the operation: ${e.type}`
      );
      return;
    }
    if (this.resourceKeyToType.has(e.key)) {
      console.warn(
        "Detected two resources with identical keys. The duplicate resource will not be generated:",
        e.key
      );
      return;
    }
    return this.resourceKeyToType.set(e.key, e.type), await t.initResource(e);
  }
  /**
   * This is called by layers to request resources being generated.
   */
  request(e, t, n, s) {
    const r = this.managers.get(n.type);
    return r ? r.request(e, t, n, s) : (console.warn(
      `A Layer is requesting a resource for which there is no manager set. Please make sure a Resource Manager is set for resource of type: ${n.type}`
    ), [-1, -1, -1, -1]);
  }
  /**
   * Triggers when the context we are rendering into has resized. This simply
   * passes the resize trigger down to the managers so they can adjust context
   * specific resources for the adjustment.
   */
  resize() {
    this.managers.forEach((e) => e.resize());
  }
  /**
   * Every resource type needs a manager associated with it so it can have requests processed. This
   * allows a manager to be set for a resource type.
   */
  setManager(e, t) {
    this.managers.get(e) && Xp(
      `A manager was assigned to a resource type: ${e} that overrides another manager already set to that type.`
    ), t.router = this, this.managers.set(e, t), t.webGLRenderer = this.webGLRenderer;
  }
  /**
   * This sets the current gl renderer used for handling GL operations.
   */
  setWebGLRenderer(e) {
    this.webGLRenderer = e, this.managers.forEach((t) => t.webGLRenderer = e);
  }
  /**
   * This hands the update of a resource to the correct Resource Manager.
   */
  async updateResource(e) {
    const t = this.managers.get(e.type);
    if (!t) {
      console.warn(
        `A Resource is trying to be updated but has no manager to facilitate the operation: ${e.type}`
      );
      return;
    }
    return await t.updateResource(e);
  }
}
const Qp = new vh(), lv = {
  createFont: mh,
  createAtlas: xh,
  createTexture: Nl,
  createColorBuffer: Vu
}, hv = {
  textureRequest: Xs,
  atlasRequest: Kn,
  fontRequest: Gn,
  colorBufferRequest: Gr
}, Yp = `// This contains the method required to be used on a fragment shader when a layer desires to use
// PickType.SINGLE (color picking).
varying highp vec4 _picking_color_pass_;

void main() {
  \${out: _picking_fragment_} = _picking_color_pass_;
  // _picking_fragment_ = vec4(1.0, 0.0, 0.0, 1.0);
}
`, $a = {
  attributes: "attributes",
  easingMethod: "easingMethod",
  extend: "extend",
  extendHeader: "extendHeader",
  T: "T"
};
class Wa {
  constructor(e) {
    this.index = 0, this.available = 4, this.index = e;
  }
  setAttribute(e) {
    return (e.size || 0) <= this.available ? (e.block = this.index, e.blockIndex = 4 - this.available, this.available -= e.size || 0, !0) : !1;
  }
}
function qp(i) {
  i.forEach((e) => {
    if (e.resource && e.size === void 0 && (e.size = S.FOUR), !e.size)
      try {
        const t = e.update(new nt({}));
        t.length > 0 && t.length <= S.FOUR && (e.size = t.length);
      } catch {
        console.warn(
          "The system could not determine the size of the provided attribute. Please provide the size of the attribute:",
          e
        );
      }
  });
}
function Kp(i) {
  qp(i);
  const e = [];
  i.forEach((t) => {
    if (t.size && t.size === S.MAT4X4) {
      t.block = e.length, t.blockIndex = _c.INVALID;
      for (let s = 0; s < 4; ++s) {
        const r = new Wa(e.length);
        r.available = 0, r.index = 0, e.push(r);
      }
      return;
    }
    if (!e.find((s) => s.setAttribute(t) ? !!s : !1)) {
      const s = new Wa(e.length);
      e.push(s), s.setAttribute(t) || console.warn(
        "There was a problem packing an attribute into a block. No block would accommodate it:",
        t
      );
    }
  });
}
function ja(i) {
  return !!i;
}
function Ha(i) {
  return !!i;
}
function Xa(i) {
  return !!i;
}
function Zp(i) {
  return Object.assign({}, i, { materialAttribute: null });
}
function Jp(i) {
  return Object.assign({}, i, { materialIndexBuffer: null });
}
function eg(i) {
  return Object.assign({}, i, { materialUniforms: [] });
}
function tg(i, e, t, n) {
  e.forEach((s) => {
    s.name === void 0 && console.warn(
      "All instance attributes MUST have a name on Layer:",
      i.id
    ), e.find(
      (r) => r !== s && r.name === s.name
    ) && console.warn(
      "An instance attribute can not have the same name used more than once:",
      s.name
    ), t.find((r) => r.name === s.name) && console.warn(
      "An instance attribute and a vertex attribute in a layer can not share the same name:",
      s.name
    ), s.resource || s.size === void 0 && (console.warn("An instance attribute requires the size to be defined."), console.warn(s));
  });
}
function ig(i, e, t) {
  if (!t) return;
  let n = e.instanceAttributes || [], s = e.uniforms || [], r = e.vertexAttributes || [];
  t.shaderModuleUnits.forEach((l) => {
    l.instanceAttributes && (n = n.concat(
      l.instanceAttributes(i)
    )), l.uniforms && (s = s.concat(l.uniforms(i))), l.vertexAttributes && (r = r.concat(
      l.vertexAttributes(i)
    ));
  });
  const o = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set();
  s.filter((l) => l ? o.has(l.name) ? (console.warn(
    "Included shader modules has introduced duplicate uniform names:",
    l.name,
    "One will be overridden thus causing a potential crash of the shader."
  ), !1) : (o.add(l.name), !0) : !1), n.filter((l) => l ? a.has(l.name) ? (console.warn(
    "Included shader modules has introduced duplicate Instance Attribute names:",
    l.name,
    "One will be overridden thus causing a potential crash of the shader."
  ), !1) : (a.add(l.name), !0) : !1), r.filter((l) => l ? c.has(l.name) ? (console.warn(
    "Included shader modules has introduced duplicate Vertex Attribute names:",
    l.name,
    "One will be overridden thus causing a potential crash of the shader."
  ), !1) : (c.add(l.name), !0) : !1), e.instanceAttributes = n, e.uniforms = s, e.vertexAttributes = r;
}
function ng(i, e, t, n, s, r) {
  ig(e, t, r);
  const o = (t.instanceAttributes || []).filter(
    ja
  ), a = (t.vertexAttributes || []).filter(
    Ha
  ), c = (t.uniforms || []).filter(Xa);
  let l = se(t.indexBuffer) ? t.indexBuffer : void 0;
  for (let p = 0, g = n.length; p < g; ++p) {
    const m = n[p];
    if (m.validate(
      e,
      o,
      a,
      c
    )) {
      const v = m.expand(
        e,
        o,
        a,
        c
      );
      v.instanceAttributes.filter(ja).forEach((b) => o.push(b)), v.vertexAttributes.filter(Ha).forEach((b) => a.push(b)), v.uniforms.filter(Xa).forEach((b) => c.push(b)), se(v.indexBuffer) && (l = v.indexBuffer);
    }
  }
  tg(
    e,
    o,
    a
  );
  const h = o.slice(0), u = (a || []).map(
    Zp
  ), d = c.map(eg), f = se(l) ? Jp(l) : void 0;
  return h.sort(s.sortInstanceAttributes), d.sort(s.sortUniforms), u.sort(s.sortVertexAttributes), Kp(h), e.getLayerBufferType(
    i,
    t,
    a,
    h
  ), {
    instanceAttributes: h,
    uniforms: d,
    vertexAttributes: u,
    indexBuffer: f
  };
}
class Wo {
  /**
   * This calculates how many uniform blocks are utilized based on the input uniforms
   */
  static calculateUniformBlockUseage(e) {
    let t = 0;
    for (let n = 0, s = e.length; n < s; ++n)
      t += Math.ceil(e[n].size / 4);
    return t;
  }
  /**
   * Calculates all of the metrics that will be needed in this processor.
   */
  process(e, t) {
    this.instanceMaxBlock = 0, e.forEach((n) => {
      this.instanceMaxBlock = Math.max(
        this.instanceMaxBlock,
        n.block || 0
      );
    }), this.blocksPerInstance = this.instanceMaxBlock + 1, this.maxUniforms = O.MAX_VERTEX_UNIFORMS, this.maxUniformsForInstancing = this.maxUniforms - Wo.calculateUniformBlockUseage(t), this.maxInstancesPerUniformBuffer = Math.floor(
      this.maxUniformsForInstancing / this.blocksPerInstance
    ), this.totalInstanceUniformBlocks = this.maxInstancesPerUniformBuffer * this.blocksPerInstance;
  }
}
const Hn = "Once a ShaderModuleUnit has been registered, you CAN NOT modify it! Module ID:";
class Sr {
  /**
   * Default ctor for creating a new Shader Module Unit to be registered with
   * the system.
   */
  constructor(e) {
    this._dependents = null, Object.assign(this, e);
  }
  /**
   * This is the content that replaces shader imports
   */
  get content() {
    return this._content;
  }
  set content(e) {
    if (this._isLocked) {
      console.warn(Hn, this._moduleId);
      return;
    }
    this._content = e;
  }
  /**
   * This defines which shader type the content is compatible with. You can only
   * have one content assigned per each ShaderInjectionTarget type. Thus you can
   * have a module such as 'picking' with two unique implementations one for
   * Fragment and one for Vertex shaders. Or you can assign it to both.
   */
  get compatibility() {
    return this._compatibility;
  }
  set compatibility(e) {
    if (this._isLocked) {
      console.warn(Hn, this._moduleId);
      return;
    }
    this._compatibility = e;
  }
  /**
   * This is the list of module id dependents this unit will need. We store this
   * here so the module can be analyzed once. Import statements will be stripped
   * and the sub module contents will be added to the top of the contents of the
   * shader. This only stores ids, as the ids will still need to be analyzed so
   * duplication can be prevented.
   */
  get dependents() {
    return this._dependents;
  }
  set dependents(e) {
    if (this._isLocked && this._dependents !== null) {
      console.warn(Hn, this._moduleId);
      return;
    }
    this._dependents = e;
  }
  /**
   * Indicates this unit cannot be modified anymore.
   */
  isLocked() {
    return this._isLocked;
  }
  /**
   * This is the string ID a shader must use to include the provided content.
   */
  get moduleId() {
    return this._moduleId;
  }
  set moduleId(e) {
    if (this._isLocked) {
      console.warn(Hn, this._moduleId);
      return;
    }
    this._moduleId = e;
  }
  /**
   * Applies the content after it's been processed for import statements. You
   * can not set the content this way again after processing has happened.
   */
  applyAnalyzedContent(e) {
    if (this._isLocked && this.dependents !== null) {
      console.warn(Hn, this._moduleId);
      return;
    }
    this._content = e;
  }
  /**
   * Makes this unit unable to be modified in anyway
   */
  lock() {
    this._isLocked = !0;
  }
}
const Qa = ve("performance"), sg = ve("shader-module-vs"), rg = ve("shader-module-fs"), Ya = "import", qa = ":";
function Ka(i, e) {
  return !!i && (i.compatibility === e || i.compatibility === A.ALL);
}
const Et = class Et {
  /**
   * This registers a new ShaderModuleUnit. It makes the module available by
   * it's importId within shaders using this framework.
   *
   * If the module is registered with no returned output, the registration was a
   * success. Any returned output indicates issues encountered while registering
   * the module.
   */
  static register(e) {
    if (!(e instanceof Sr)) {
      if (Array.isArray(e)) {
        let a = "";
        return e.forEach((c) => {
          const l = Et.register(c);
          l && (a += `${l}
`);
        }), a || null;
      }
      return Et.register(new Sr(e));
    }
    let t = Et.modules.get(e.moduleId);
    t || (t = {}, Et.modules.set(e.moduleId, t));
    const n = t.fs, s = t.vs, r = Ka(
      e,
      A.FRAGMENT
    ), o = Ka(e, A.VERTEX);
    if (n && r) {
      if (n.isFinal)
        return `Module ID: ${e.moduleId} Can not override the module's existing Fragment registration as the exisitng module is marked as final`;
      Qa(
        "A Shader Module Unit has overridden an existing module for the Fragment Shader Module ID: %o",
        e.moduleId
      );
    }
    if (s && o) {
      if (s.isFinal)
        return `Module ID: ${e.moduleId} Can not override the module's existing Vertex registration as the exisitng module is marked as final`;
      Qa(
        "A Shader Module Unit has overridden an existing module for the Vertex Shader Module ID: %o",
        e.moduleId
      );
    }
    return r && (t.fs = e), o && (t.vs = e), e.lock(), null;
  }
  /**
   * This gathers all of the dependents for the module as ids. This also causes
   * the contents of the module to be stripped of it's import statements.
   */
  static analyzeDependents(e) {
    if (e.dependents && e.isLocked())
      return [];
    const t = [], n = [], s = /* @__PURE__ */ new Set(), r = e.compatibility, o = e.moduleId, a = sn({
      // We do not want any direct replacement options, we will handle token
      // analyzing via our onToken callback so we can find our special "import:"
      // case
      options: {},
      // Provide the shader to our template processor
      shader: e.content,
      // We do not want to remove any template macros that do not deal with
      // extension
      onToken: (c) => {
        const l = c.trim();
        if (l.indexOf(Ya) === 0) {
          const h = l.substr(Ya.length).trim();
          if (h[0] === qa) {
            let u = !1;
            const d = h.substr(qa.length).trim().split(",");
            return d[d.length - 1].trim().length === 0 && d.pop(), d.forEach((f) => {
              f = f.trim();
              const p = Et.modules.get(f);
              p ? ((r === A.FRAGMENT || r === A.ALL) && (p.fs ? (u = !0, s.has(f) || n.push(f)) : t.push(
                `Could not find requested target fragment module for Module ID: ${f} requested by module: ${o}`
              )), (r === A.VERTEX || r === A.ALL) && (p.vs ? (u = !0, s.has(f) || n.push(f)) : t.push(
                `Could not find requested target vertex module for Module ID: ${f} requested by module: ${o}`
              )), !p.vs && !p.fs && t.push(
                "Could not find a vertex or fragment shader within exisitng module"
              ), u || t.push(
                `Error Processing module Module ID: ${f} requested by module: ${o}`
              )) : t.push(
                `Could not find requested module: ${f} requested by module: ${o}`
              );
            }), "";
          }
        }
        return `\${${c}}`;
      }
    });
    return e.applyAnalyzedContent(a.shader), e.dependents = n, t;
  }
  /**
   * This examines a shader string and replaces all import statements with any
   * existing registered modules. This will also output any issues such as
   * requested modules that don't exist and detect circular dependencies and
   * such ilk.
   *
   * @param shader The content of the shader to analyze for import statements
   * @param target The shader target type to consider
   * @param additionalModules Additional modules to include in the shader
   *                          regardless if the shader requested it or not
   */
  static process(e, t, n, s) {
    const r = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set(), a = [], c = [], l = n === A.VERTEX ? sg : rg;
    l("Processing Shader for context %o:", e);
    function h(g) {
      const m = g.moduleId;
      l("%o: %o", m, a.slice(0).reverse().join(" -> "));
      const v = a.indexOf(m);
      if (a.unshift(m), v > -1) {
        const b = a.slice(0, v + 2).reverse();
        return c.push(
          `A Shader has detected a Circular dependency in import requests: ${b.join(
            " -> "
          )}`
        ), a.shift(), !1;
      }
      return !0;
    }
    function u(g) {
      const m = g.moduleId;
      if (!h(g))
        return null;
      if (m && o.has(m))
        return a.shift(), "";
      let v = "";
      Et.analyzeDependents(g).forEach((y) => c.push(y));
      const w = g.dependents;
      if (l("Module dependencies detected %o", w), w && w.length > 0)
        for (let y = 0, E = w.length; y < E; ++y) {
          const C = w[y], M = Et.modules.get(C);
          if (M) {
            let R;
            (n === A.FRAGMENT || n === A.ALL) && (M.fs ? (r.add(M.fs), R = u(M.fs)) : c.push(
              `Could not find requested target fragment module for Module ID: ${C} requested by module: ${m}`
            )), (n === A.VERTEX || n === A.ALL) && (M.vs ? (r.add(M.vs), R = u(M.vs)) : c.push(
              `Could not find requested target vertex module for Module ID: ${C} requested by module: ${m}`
            )), !M.vs && !M.fs && c.push(
              "Could not find a vertex or fragment shader within exisitng module"
            ), R === null && c.push(
              `Error Processing module Module ID: ${C} requested by module: ${m}`
            ), v += R || "";
          } else
            c.push(
              `Could not find requested module: ${C} requested by module: ${m}`
            );
        }
      return a.shift(), o.add(m || ""), `${v.trim()}

${g.content.trim()}`;
    }
    let d = t;
    if (s) {
      let g = "";
      s.forEach((m) => {
        g += `\${import: ${m}}
`;
      }), d = g + t;
    }
    const f = new Sr({
      content: d,
      compatibility: n,
      moduleId: `Layer "${e}" ${n === A.ALL ? "fs vs" : n === A.VERTEX ? "vs" : "fs"}`
    });
    return {
      errors: c,
      shader: u(f),
      shaderModuleUnits: r
    };
  }
};
Et.modules = /* @__PURE__ */ new Map();
let me = Et;
const ys = "out", Es = ":";
class Za {
  constructor() {
    this.metricsProcessing = new Wo();
  }
  /**
   * This takes in multiple fragment shaders and merges them together based on
   * their main() methods. All elements outside of the main() method will be
   * merged as header information in the order they are discovered.
   *
   * All contents of the main's will be merged together as well in the order
   * they are discovered.
   *
   * Additionally, this discovers outputs declared in the shader in the form of
   * ${out: <name>} tokens. These will be used to aid in making a shader that
   * will be compatible with ES 3.0 AND 2.0 shaders.
   */
  static mergeFragmentOutputsForMRT(e, t, n, s, r, o) {
    let a = "", c = "", l = "";
    const h = /* @__PURE__ */ new Set(), u = [], d = /* @__PURE__ */ new Set();
    return O.MRT || (l = " = gl_FragColor"), n.forEach((f, p) => {
      let g = !0, m = !1;
      if (r && r.indexOf(f.outputType) < 0 && (g = !1), o && p < n.length - 1 && (g = !1), !o && s.indexOf(f.outputType) < 0 && (g = !1), d.has(f.outputType))
        throw new Error(
          "Can not use the same Output Fragment type multiple times"
        );
      d.add(f.outputType);
      const v = s.indexOf(f.outputType);
      sn({
        shader: tr(f.source),
        /**
         * Analyze each token for "out" tokens indicating output
         */
        onToken(b) {
          const w = b.trim();
          if (w.indexOf(ys) === 0) {
            if (m)
              throw console.error(
                "Found multiple ${out} tokens in a single fragment shader. This is not supported nor logical",
                "If you need to use the declared output multiple times, use the assigned name",
                "and don't wrap it repeatedly in the shader.",
                "eg-",
                "void main() {",
                "  ${out: myOutput} = value;",
                "  vec4 somethingElse = myOutput;",
                "}"
              ), new Error("Invalid Shader Format");
            m = !0;
            const y = w.substr(ys.length).trim();
            if (y[0] === Es) {
              const E = y.substr(Es.length).trim();
              if (!E)
                throw new Error(
                  "Output in a shader requires an identifier ${out: <name required>}"
                );
              if (h.has(E))
                throw new Error(
                  "You can not declare the same output name in subsequent fragment shader outputs"
                );
              if (E === "gl_FragColor")
                throw new Error(
                  "DO not use gl_FragColor as an identifier for an out. Choose something not used by the WebGL spec."
                );
              let C = "";
              if (g)
                if (h.add(E), u.push(f.outputType), O.MRT_EXTENSION)
                  l = ` = gl_FragData[${v}]`, C = "vec4 ";
                else if (O.MRT && O.SHADERS_3_0)
                  t.set(
                    E,
                    `layout(location = ${v}) out vec4 ${E};
`
                  );
                else
                  throw new Error(
                    `Could not generate a proper output declaration for the fragment shader output: ${E}`
                  );
              else
                C = "vec4 ";
              return `${C}${E}${l}`;
            } else
              throw new Error(
                "Output in a shader requires an identifier ${out: <name required>}"
              );
          }
          return `\${${b}}`;
        },
        /**
         * We use this to aggregate all of our main bodies and headers together
         */
        onMain(b, w) {
          return !m && b && (b.match("gl_FragColor") ? (u.push(f.outputType), O.MRT && (O.SHADERS_3_0 ? (t.set(
            "_FragColor",
            `layout(location = ${v}) out vec4 _FragColor;
`
          ), b = b.replace(/gl_FragColor/g, "_FragColor")) : (b = b.replace(
            /gl_FragColor\s+=/,
            `vec4 _FragColor = gl_FragData[${v}] =`
          ), b = b.replace(
            /gl_FragColor\s+=/g,
            `_FragColor = gl_FragData[${v}] =`
          ), b = b.replace(/gl_FragColor/g, "_FragColor"))), h.add("_FragColor")) : u.push(V.NONE)), a += `
${(w || "").trim()}`, c += `
  ${(b || "").trim()}`, (b || "").trim();
        }
      });
    }), {
      output: `${a}
void main() {
${c}
}`,
      outputNames: Array.from(h.values()),
      outputTypes: u
    };
  }
  /**
   * This merges output for the fragment shader when we are simply outputting to
   * a single COLOR target the view specifies. This means we look for an output
   * from the layer that is a COLOR output and merge all fragments up to that
   * output, we clear out any templating variables, and for WebGL1 we make it
   * output to gl_FragColor and for WebGL2 we output to _FragColor and make an
   * out declarartion for it.
   */
  static mergeOutputFragmentShaderForColor(e, t) {
    if (t.length > 1 || t[0] !== V.COLOR)
      throw new Error(
        "Merging fragment shaders for only COLOR output is only valid when the view has a single COLOR output target."
      );
    Li(e) && (e = [
      {
        outputType: V.COLOR,
        source: e
      }
    ]);
    let n = "", s = "";
    const r = /* @__PURE__ */ new Set(), o = [];
    return e.some((a) => {
      const c = a.outputType === V.COLOR;
      let l = !1;
      return c && o.push(V.COLOR), sn({
        shader: tr(a.source),
        /**
         * Analyze each token for "out" tokens indicating output
         */
        onToken(h) {
          const u = h.trim();
          if (u.indexOf(ys) === 0) {
            if (l)
              throw console.error(
                "Found multiple ${out} tokens in a single fragment shader. This is not supported nor logical",
                "If you need to use the declared output multiple times, use the assigned name",
                "and don't wrap it repeatedly in the shader.",
                "eg-",
                "void main() {",
                "  ${out: myOutput} = value;",
                "  vec4 somethingElse = myOutput;",
                "}"
              ), new Error("Invalid Shader Format");
            l = !0;
            const d = u.substr(ys.length).trim();
            if (d[0] === Es) {
              const f = d.substr(Es.length).trim();
              if (!f)
                throw new Error(
                  "Output in a shader requires an identifier ${out: <name required>}"
                );
              if (r.has(f))
                throw new Error(
                  "You can not declare the same output name in subsequent fragment shader outputs"
                );
              if (f === "gl_FragColor")
                throw new Error(
                  "DO not use gl_FragColor as an identifier for an out. Choose something not used by the WebGL spec."
                );
              return c ? (r.add("gl_FragColor"), f !== "gl_FragColor" ? `vec4 ${f} = gl_FragColor` : "gl_FragColor") : `vec4 ${f}`;
            }
          }
          return `\${${h}}`;
        },
        onMain(h, u) {
          return s += `
${(u || "").trim()}`, n += `
  ${(h || "").trim()}`, (h || "").trim();
        }
      }), !!c;
    }), {
      output: `${s}
void main() {
${n}
}`,
      outputNames: Array.from(r.values()),
      outputTypes: o
    };
  }
  /**
   * This analyzes desired target outputs and available outputs that output to
   * certain output types. This will match the targets with the available
   * outputs and produce shaders that reflect the capabilities
   * available of both target and provided outputs.
   *
   * This also takes into account the capabilities of the hardware. If MRT is
   * supported, the generated shaders will be combined as best as possible. If
   * MRT is NOT supported, this will generate MULTIPLE SHADERS, a shader for
   * each output capable of delivering the targetted output specified.
   */
  static makeOutputFragmentShader(e, t, n, s) {
    if (!n || Li(n))
      if (Li(s)) {
        const r = this.mergeOutputFragmentShaderForColor(
          [
            {
              source: s,
              outputType: V.COLOR
            }
          ],
          [V.COLOR]
        );
        return {
          source: r.output,
          outputTypes: [V.COLOR],
          outputNames: r.outputNames
        };
      } else if (Array.isArray(s)) {
        const r = s.find(
          (c) => c.outputType === V.COLOR
        );
        let o = -1;
        r ? o = s.indexOf(r) : o = s.length - 1;
        const a = this.mergeOutputFragmentShaderForColor(
          s.slice(0, o + 1),
          [V.COLOR]
        );
        return {
          source: a.output,
          outputNames: a.outputNames,
          outputTypes: [V.COLOR]
        };
      } else
        return null;
    else if (Array.isArray(n)) {
      if (!O.MRT)
        throw new Error(
          "Multiple Render Targets were specified, but are not natively supported by user's hardware! MRT also does not have a fallback in deltav yet!"
        );
      const r = n.map((o) => o.outputType);
      if (Array.isArray(s)) {
        const o = /* @__PURE__ */ new Map();
        for (let a = 0, c = n.length; a < c; ++a) {
          const l = n[a];
          for (let h = 0, u = s.length; h < u; ++h)
            if (s[h].outputType === l.outputType) {
              o.set(l.outputType, h);
              break;
            }
        }
        if (O.MRT) {
          let a = -1;
          const c = [];
          if (o.forEach((h, u) => {
            c.push(u), a = Math.max(h, a);
          }), a === -1) return null;
          const l = this.mergeFragmentOutputsForMRT(
            e,
            t,
            s.slice(0, a + 1),
            r,
            c
          );
          return {
            source: l.output,
            outputNames: l.outputNames,
            outputTypes: l.outputTypes
          };
        } else
          throw new Error(
            "Fragment shader generation not supported for MRT systems on non MRT hardware...yet"
          );
      } else if (n.find(
        (a) => a.outputType === V.COLOR
      ) && s) {
        const a = this.mergeFragmentOutputsForMRT(
          e,
          t,
          [
            {
              source: s,
              outputType: V.COLOR
            }
          ],
          r
        );
        return {
          source: a.output,
          outputNames: a.outputNames,
          outputTypes: a.outputTypes
        };
      }
    }
    return null;
  }
  /**
   * This processes a layer, it's Shader IO requirements, and it's shaders to
   * produce a fully functional shader that is compatible with the client's
   * system.
   */
  process(e, t, n, s, r, o, a) {
    try {
      if (!e.surface.gl)
        return console.warn("No WebGL context available for layer!"), null;
      const c = this.processImports(
        e,
        t,
        n
      );
      if (!c) return null;
      const { vertexAttributes: l, instanceAttributes: h, indexBuffer: u, uniforms: d } = ng(
        e.surface.gl,
        e,
        t,
        r,
        a,
        c
      );
      e.getLayerBufferType(
        e.surface.gl,
        t,
        l,
        h
      ), this.metricsProcessing.process(h, d);
      let f = "", p = "", g = "";
      const m = {
        uniforms: []
      }, v = s.vs || /* @__PURE__ */ new Map(), b = s.fs || /* @__PURE__ */ new Map(), w = s.destructure || /* @__PURE__ */ new Map();
      for (let B = 0, W = r.length; B < W; ++B) {
        const $ = r[B], K = $.processHeaderInjection(
          A.VERTEX,
          v,
          e,
          this.metricsProcessing,
          l,
          h,
          d
        );
        f += K.injection, K.material && (m.uniforms = m.uniforms.concat(
          K.material.uniforms || []
        )), g += $.processAttributeDestructuring(
          e,
          w,
          this.metricsProcessing,
          l,
          h,
          d
        );
      }
      let y = "";
      v.forEach((B) => {
        y += B;
      }), f = y + f, y = "", w.forEach((B) => {
        y += B;
      }), g = y + g;
      const E = this.processExtensions(), C = `precision highp float;

`, M = E + C + f + c.vs;
      let R = {
        [$a.attributes]: g
      }, G = !1;
      const z = sn({
        options: R,
        required: void 0,
        shader: M,
        onToken(B, W) {
          return B === $a.attributes && (G = !0), W;
        },
        onMain(B) {
          return G ? B || "" : B === null ? (console.warn("The body of void main() could not be determined."), "") : `${g}
${B}`;
        }
      });
      return c.fs.forEach((B, W) => {
        R = {}, p = "", y = "";
        const $ = b.get(W) || /* @__PURE__ */ new Map();
        for (let Y = 0, j = r.length; Y < j; ++Y) {
          const T = r[Y].processHeaderInjection(
            A.FRAGMENT,
            $,
            e,
            this.metricsProcessing,
            l,
            h,
            d
          );
          if (p += T.injection, T.material) {
            const k = /* @__PURE__ */ new Set();
            m.uniforms.forEach(
              (q) => k.add(q.name)
            ), m.uniforms.forEach((q) => {
              k.has(q.name) || m.uniforms.push(q);
            });
          }
        }
        $.forEach((Y) => {
          y += Y;
        }), p = y + p;
        const K = E + C + p + B.source, Q = sn({
          options: R,
          required: void 0,
          shader: K
        });
        B.source = Q.shader.trim();
        for (let Y = 0, j = o.length; Y < j; ++Y) {
          const be = o[Y];
          z.shader = be.vertex(z.shader), B.source = be.fragment(B.source);
        }
      }), {
        fs: c.fs,
        materialUniforms: m.uniforms,
        maxInstancesPerBuffer: this.metricsProcessing.maxInstancesPerUniformBuffer,
        modules: Array.from(c.shaderModuleUnits),
        vs: z.shader.trim(),
        vertexAttributes: l,
        instanceAttributes: h,
        uniforms: d,
        indexBuffer: u
      };
    } catch (c) {
      return c instanceof Error && (console.warn(
        "An unknown error occurred while processing the shaders for layer:",
        e.id
      ), console.warn("Error:"), console.warn(c && (c.stack || c.message))), null;
    }
  }
  /**
   * This processes all information available about the shader to determine
   * which extensions must be available for the shader to work.
   */
  processExtensions() {
    let e = "";
    return O.SHADERS_3_0 && (e += "#version 300 es"), O.MRT_EXTENSION && (e += "#extension GL_EXT_draw_buffers : require"), e && (e += `

`), e;
  }
  /**
   * This applies the imports for the specified layer and generates the
   * appropriate shaders from the output. Upon failure, this will just return
   * null.
   *
   * This also does some additional work to add in some modules based on the
   * layer's preferences
   */
  processImports(e, t, n) {
    const s = /* @__PURE__ */ new Set();
    let r = e.baseShaderModules(t);
    e.props.baseShaderModules && (r = e.props.baseShaderModules(t, r));
    const o = me.process(
      e.id,
      t.vs,
      A.VERTEX,
      r.vs
    );
    if (o.errors.length > 0)
      return console.warn(
        "Error processing imports for the vertex shader of layer:",
        e.id,
        "Errors",
        ...o.errors.reverse()
      ), null;
    const a = /* @__PURE__ */ new Map();
    return n.forEach((c, l) => {
      const h = me.process(
        e.id,
        c.source,
        A.FRAGMENT,
        r.fs
      );
      if (h.errors.length > 0) {
        console.warn(
          "Error processing imports for the fragment shader of layer:",
          e.id,
          "Errors",
          ...h.errors.reverse()
        );
        return;
      }
      h.shaderModuleUnits.forEach(
        (d) => s.add(d)
      );
      const u = {
        source: h.shader || "",
        outputTypes: c.outputTypes,
        outputNames: c.outputNames
      };
      a.set(l, u);
    }), o.shaderModuleUnits.forEach(
      (c) => s.add(c)
    ), {
      fs: a,
      vs: o.shader || "",
      shaderModuleUnits: s
    };
  }
}
const Ii = "EasingIOExpansion", { abs: og, max: ag } = Math, cg = {
  duration: 0,
  start: [0],
  startTime: 0
}, Ja = {
  1: "float",
  2: "vec2",
  3: "vec3",
  4: "vec4",
  9: "mat3",
  16: "mat4",
  /** This is the special case for instance attributes that want an atlas resource */
  99: "vec4"
}, Cr = {
  easingMethod: "easingMethod",
  T: "T"
};
function lg(i) {
  return !!i && i.easing && i.size !== void 0 && i.size <= 4;
}
function uv(i) {
  return i;
}
class hg extends wr {
  constructor() {
    super(...arguments), this.baseAttributeName = /* @__PURE__ */ new Map();
  }
  /**
   * Provides expanded IO for attributes with easing properties.
   *
   * Most of this process is hijacking the existing easing attribute to inject it's own
   * update method to handle calculating current position to animate to a new position
   * when a value is changed.
   *
   * This also provides new child attributes that must be changed when the original attributes
   * value is changed.
   */
  expand(e, t, n, s) {
    const r = /* @__PURE__ */ new Set(), o = [], a = [];
    for (const l of t)
      lg(l) && o.push(l);
    const c = {};
    e.easingId = c;
    for (let l = 0, h = o.length; l < h; ++l) {
      const u = o[l], { cpu: d, loop: f, uid: p } = u.easing, { name: g, size: m, update: v } = u, b = p;
      this.baseAttributeName.set(u, u.name), u.name = `_${u.name}_end`, c[u.name] = b, r.has(b) && console.error(
        "Undefined behavior occurs if you reuse an IAutoEasingMethod. Please ensure you are using uid() from the util to give the IAutoEasingMethod its uid, or just use the default provided methods"
      ), r.add(b);
      const w = {
        values: cg
      };
      let y, E, C, M, R, G, z, N, B, W, $, K, Q;
      u.update = (T) => {
        if (B = e.surface.frameMetrics, E = u.easing.delay, C = u.easing.duration, z = v(T), N = B.currentTime, T.easing = K = T.easing || /* @__PURE__ */ new Map(), W = K.get(b), !$ || !W ? ($ = D(z), W = new Ol({
          duration: C,
          end: $.copy(z),
          start: $.copy(z),
          startTime: N
        }), K.set(b, W)) : T.reactivate && ($.copy(z, W.end), $.copy(z, W.end), W.startTime = N), R = W, M = C, y = E, R.isTimeSet && (M = R.duration || C, y = R.delay || 0), !R.isManualStart) {
          switch (G = 1, f) {
            // Continuous means we start at 0 and let the time go to infinity
            case Ht.CONTINUOUS:
              G = (N - R.startTime) / M, Q = !0;
              break;
            // Repeat means going from 0 to 1 then 0 to 1 etc etc
            case Ht.REPEAT:
              G = (N - R.startTime) / M % 1, Q = !0;
              break;
            // Reflect means going from 0 to 1 then 1 to 0 then 0 to 1 etc etc
            case Ht.REFLECT: {
              const k = (N - R.startTime) / M;
              G = og(k / 2 % 1 - 0.5) * 2, Q = !0;
              break;
            }
            // No loop means just linear time
            case Ht.NONE:
            default:
              G = (N - R.startTime) / M, Q = !1;
              break;
          }
          R.start = d(
            R.start,
            R.end,
            G,
            R.start
          );
        }
        return R.startTime = N + y, $.copy(z, R.end), w.values = R, e.animationEndTime = ag(
          e.animationEndTime,
          R.startTime + M + B.frameDuration
        ), e.alwaysDraw = Q, z;
      }, u.childAttributes = u.childAttributes || [];
      const Y = {
        name: `_${g}_start`,
        parentAttribute: u,
        size: m,
        update: (T) => w.values.start
      };
      u.childAttributes.push(Y), a.push(Y);
      const j = {
        name: `_${g}_start_time`,
        parentAttribute: u,
        size: S.ONE,
        update: (T) => [w.values.startTime]
      };
      u.childAttributes.push(j), a.push(j);
      const be = {
        name: `_${g}_duration`,
        parentAttribute: u,
        size: S.ONE,
        update: (T) => [w.values.duration]
      };
      u.childAttributes.push(be), a.push(be);
    }
    return {
      instanceAttributes: a,
      vertexAttributes: [],
      uniforms: []
    };
  }
  /**
   * Validates the IO about to be expanded.
   */
  validate(e, t, n, s) {
    let r = !1;
    return t.forEach((o) => {
      o.easing && o.resource && (console.warn(
        "An instance attribute can not have both easing and resource properties. Undefined behavior will occur."
      ), console.warn(o), r = !0), o.easing && o.size === void 0 && console.warn(
        "An Instance Attribute with easing MUST have a size declared"
      );
    }), !r;
  }
  /**
   * Easing provides some unique destructuring for the packed in vertex
   * information.
   */
  processAttributeDestructuring(e, t, n, s, r, o) {
    const a = "";
    for (let c = 0, l = r.length; c < l; ++c) {
      const h = r[c];
      if (!h.easing || !h.size) continue;
      const u = this.baseAttributeName.get(h);
      if (!u) {
        console.warn(
          "Could not determine a base name for an easing attribute."
        );
        continue;
      }
      this.baseAttributeName.delete(h);
      const d = `_${u}_time`, f = `_${u}_duration`, p = `_${u}_start_time`;
      switch (h.easing.loop) {
        // Continuous means letting the time go from 0 to infinity
        case Ht.CONTINUOUS: {
          this.setDeclaration(
            t,
            d,
            `  float ${d} = (currentTime - ${p}) / ${f};
`,
            Ii
          );
          break;
        }
        // Repeat means going from 0 to 1 then 0 to 1 etc etc
        case Ht.REPEAT: {
          this.setDeclaration(
            t,
            d,
            `  float ${d} = clamp(fract((currentTime - ${p}) / ${f}), 0.0, 1.0);
`,
            Ii
          );
          break;
        }
        // Reflect means going from 0 to 1 then 1 to 0 then 0 to 1 etc etc
        case Ht.REFLECT: {
          const g = `_${u}_timePassed`, m = `_${u}_pingPong`;
          this.setDeclaration(
            t,
            g,
            `  float ${g} = (currentTime - ${p}) / ${f};
`,
            Ii
          ), this.setDeclaration(
            t,
            m,
            `  float ${m} = abs((fract(${g} / 2.0)) - 0.5) * 2.0;
`,
            Ii
          ), this.setDeclaration(
            t,
            d,
            `  float ${d} = clamp(${m}, 0.0, 1.0);
`,
            Ii
          );
          break;
        }
        // No loop means just linear time
        case Ht.NONE:
        default: {
          this.setDeclaration(
            t,
            d,
            `  float ${d} = clamp((currentTime - ${p}) / ${f}, 0.0, 1.0);
`,
            Ii
          );
          break;
        }
      }
      this.setDeclaration(
        t,
        u,
        `  ${Ja[h.size]} ${u} = ${h.easing.methodName}(_${u}_start, _${u}_end, _${u}_time);
`,
        Ii
      );
    }
    return a;
  }
  /**
   * For easing, the header must be populated with the easing method
   */
  processHeaderInjection(e, t, n, s, r, o, a) {
    const c = { injection: "" };
    if (e !== A.VERTEX) return c;
    const l = /* @__PURE__ */ new Map();
    if (c.injection = `// Auto Easing Methods specified by the layer
`, o.forEach((u) => {
      if (u.easing && u.size) {
        let d = l.get(u.easing.methodName);
        d || (d = /* @__PURE__ */ new Map(), l.set(u.easing.methodName, d)), d.set(u.size, u.easing.gpu);
      }
    }), l.size === 0)
      return c.injection = "", c;
    const h = {
      name: "Easing Method Generation",
      values: [Cr.easingMethod]
    };
    return l.forEach(
      (u, d) => {
        u.forEach((f, p) => {
          const g = Ja[p], m = {
            [Cr.easingMethod]: `${g} ${d}(${g} start, ${g} end, float t)`,
            [Cr.T]: `${g}`
          }, v = sn({
            options: m,
            required: h,
            shader: f
          });
          this.setDeclaration(
            t,
            `${g} ${d}`,
            `${v.shader}
`,
            Ii
          );
        });
      }
    ), c;
  }
}
const Qi = "BasicIOExpansion", ug = ["x", "y", "z", "w"], Yi = {
  [_.ONE]: "float",
  [_.TWO]: "vec2",
  [_.THREE]: "vec3",
  [_.FOUR]: "vec4",
  [_.MATRIX3]: "mat3",
  [_.MATRIX4]: "mat4",
  [_.FLOAT_ARRAY]: "float",
  [_.VEC4_ARRAY]: "vec4",
  /** This is the special case for instance attributes that want an atlas resource */
  [_.TEXTURE]: "vec4"
};
function bh(i) {
  return i && i.length;
}
function dg(i) {
  const e = i.size;
  if (e === _.FLOAT_ARRAY || e === _.VEC4_ARRAY) {
    const t = i.update(i);
    if (bh(t))
      return `#define ${i.name}_length ${t.length}
`;
  }
  return "";
}
function fg(i) {
  const e = i.size;
  if (e === _.FLOAT_ARRAY || e === _.VEC4_ARRAY) {
    const t = i.update(i);
    if (bh(t))
      return `[${i.name}_length]`;
  }
  return "";
}
function pg(i, e) {
  return ug.slice(i, i + e).join("");
}
class gg extends wr {
  /**
   * This is the special case where attributes are packed into a uniform buffer
   * instead of into attributes. This is to maximize compatibility with hardware
   * and maximize flexibility in creative approaches to utilizing shaders that
   * need a lot of input.
   */
  // TODO: Uniform buffer strategy out of service for now
  // private generateUniformAttributePacking(
  //   declarations: ShaderDeclarationStatements,
  //   metrics: MetricsProcessing
  // ): ShaderIOHeaderInjectionResult {
  //   // Add the uniform buffer to the shader
  //   this.setDeclaration(
  //     declarations,
  //     uniformBufferInstanceBufferName,
  //     `\n// Instance Attributes as a packed Uniform Buffer\nuniform vec4 ${uniformBufferInstanceBufferName}[${metrics.totalInstanceUniformBlocks}];\n`,
  //     debugCtx
  //   );
  //   // Add the number of blocks an instance utilizes
  //   this.setDeclaration(
  //     declarations,
  //     "instanceSize",
  //     `int instanceSize = ${metrics.totalInstanceUniformBlocks};`,
  //     debugCtx
  //   );
  //   // Add the block retrieval method to aid in the Destructuring process
  //   this.setDeclaration(
  //     declarations,
  //     "getBlock",
  //     `vec4 getBlock(int index, int instanceIndex) { return ${uniformBufferInstanceBufferName}[(instanceSize * instanceIndex) + index]; }`,
  //     debugCtx
  //   );
  //   return {
  //     injection: "",
  //     material: {
  //       uniforms: [
  //         {
  //           name: uniformBufferInstanceBufferName,
  //           type: MaterialUniformType.VEC4_ARRAY,
  //           value: new Array(metrics.totalInstanceUniformBlocks)
  //             .fill(0)
  //             .map<Vec4>(() => [0, 0, 0, 0]),
  //         },
  //       ],
  //     },
  //   };
  // }
  /**
   * This properly handles any special case destructuring for making the
   * decalred attribute names available after the ${attribute} declaration.
   */
  processAttributeDestructuring(e, t, n, s, r, o) {
    let a = "";
    const c = r.slice(0);
    switch (e.bufferType) {
      case ie.VERTEX_ATTRIBUTE:
      case ie.INSTANCE_ATTRIBUTE:
        a = this.processDestructuringInstanceAttribute(
          t,
          c
        );
        break;
      case ie.VERTEX_ATTRIBUTE_PACKING:
      case ie.INSTANCE_ATTRIBUTE_PACKING:
        a = this.processDestructuringInstanceAttributePacking(
          t,
          c
        );
        break;
    }
    return e.picking.type === H.SINGLE && (a += `
// This portion is where the shader assigns the picking color that gets passed to the fragment shader
_picking_color_pass_ = _pickingColor;
`), a;
  }
  /**
   * Destructuring for normal instancing via attributes with no packing
   */
  processDestructuringInstanceAttribute(e, t) {
    return "";
  }
  /**
   * This generates all Destructuring needs for the Instance Attribute Packing
   * strategy. For this scenario attributes are tighly packed into attribute
   * blocks rather than explicitly named attributes, thus the blocks must be
   * destructured into the proper names of the attributes.
   *
   * This will, as well, destructure the auto easing methods.
   */
  processDestructuringInstanceAttributePacking(e, t) {
    let n = "";
    return n += this.processDestructureBlocks(e, t), n;
  }
  /**
   * This generates all Destructuring needs for the Uniform Packing strategy.
   * For this scenario, attributes are tighly packed into uniform blocks rather
   * than attributes, thus the blocks must be destructured into the proper names
   * of the attributes.
   *
   * This will, as well, destructure the auto easing methods.
   */
  // TODO: Uniform Buffering is not supported for now
  // private processDestructuringUniformBuffer<T extends Instance>(
  //   declarations: ShaderDeclarationStatements,
  //   orderedAttributes: IInstanceAttribute<T>[],
  //   blocksPerInstance: number
  // ) {
  //   this.setDeclaration(
  //     declarations,
  //     "instanceIndex",
  //     "int instanceIndex = int(instance);",
  //     debugCtx
  //   );
  //   // Generate the blocks
  //   for (let i = 0; i < blocksPerInstance; ++i) {
  //     this.setDeclaration(
  //       declarations,
  //       `block${i}`,
  //       `  vec4 block${i} = getBlock(${i}, instanceIndex);\n`,
  //       debugCtx
  //     );
  //   }
  //   // Destructure the blocks
  //   return this.processDestructureBlocks(declarations, orderedAttributes);
  // }
  /**
   * This produces the destructuring elements needed to utilize the attribute
   * data stored in blocks with names like:
   *
   * vec4 block0; vec4 block1;
   *
   * etc
   */
  processDestructureBlocks(e, t) {
    const n = "";
    return t.forEach((s) => {
      const r = s.block || 0;
      s.size === S.MAT4X4 ? this.setDeclaration(
        e,
        s.name,
        `  ${Yi[s.size]} ${s.name} = mat4(block${r}, block${r + 1}, block${r + 2}, block${r + 3});
`,
        Qi
      ) : s.size === S.FOUR ? this.setDeclaration(
        e,
        s.name,
        `  ${Yi[s.size]} ${s.name} = block${r};
`,
        Qi
      ) : this.setDeclaration(
        e,
        s.name,
        `  ${Yi[s.size || 1]} ${s.name} = block${r}.${pg(
          s.blockIndex || 0,
          s.size || 1
        )};
`,
        Qi
      );
    }), n;
  }
  /**
   * This processes the declarations needed to set up the Input for the shader
   * from the layer.
   *
   * This handles the buffer strategies of:
   *
   * Vertex Attributes,
   * Vertex Attribute Packing,
   * Uniform Packing
   */
  processHeaderInjection(e, t, n, s, r, o, a) {
    let c = {
      injection: ""
    };
    e === A.VERTEX && (c = this.processAttributeHeader(
      t,
      n,
      s,
      r,
      o
    ));
    const l = this.processUniformHeader(
      t,
      a,
      e
    );
    return {
      ...c,
      injection: c.injection + l
    };
  }
  /**
   * Processes all IO for attribute declarations needed in the header of the
   * shader.
   */
  processAttributeHeader(e, t, n, s, r) {
    let a = `// Shader input
`;
    return a += this.processVertexAttributes(e, s), (t.bufferType === ie.INSTANCE_ATTRIBUTE || t.bufferType === ie.VERTEX_ATTRIBUTE) && r.length > 0 && (a += this.processInstanceAttributeBufferStrategy(
      e,
      r
    )), (t.bufferType === ie.INSTANCE_ATTRIBUTE_PACKING || t.bufferType === ie.VERTEX_ATTRIBUTE_PACKING) && r.length > 0 && (a += this.processInstanceAttributePackingBufferStrategy(
      e,
      n.instanceMaxBlock
    )), {
      injection: a,
      material: void 0
    };
  }
  /**
   * Processes all IO for uniform declarations needed in the header of the
   * shader.
   */
  processUniformHeader(e, t, n) {
    const s = "", r = n || A.VERTEX;
    return t.forEach((o) => {
      o.shaderInjection = o.shaderInjection || A.VERTEX, (o.shaderInjection === r || o.shaderInjection === A.ALL) && this.setDeclaration(
        e,
        o.name,
        `${dg(o)}uniform ${o.qualifier || ""}${o.qualifier ? " " : ""}${Yi[o.size]} ${o.name}${fg(
          o
        )};
`,
        Qi
      );
    }), s;
  }
  /**
   * Produces attributes that are explicitally named and set by the attribute
   * itself.
   */
  processInstanceAttributeBufferStrategy(e, t) {
    let n = "attribute";
    return O.SHADERS_3_0 && (n = "in"), t.forEach((s) => {
      this.setDeclaration(
        e,
        s.name,
        `${n} ${Yi[s.size || 1]} ${s.qualifier || ""}${s.qualifier && " " || ""} ${s.name};
`,
        Qi
      );
    }), "";
  }
  /**
   * Produces attributes that are blocks instead of individual attributes. The
   * system uses these blocks to pack attributes tightly together to maximize
   * capabilities.
   */
  processInstanceAttributePackingBufferStrategy(e, t) {
    let n = "attribute";
    O.SHADERS_3_0 && (n = "in");
    for (let s = 0, r = t + 1; s < r; ++s)
      this.setDeclaration(
        e,
        `block${s}`,
        `${n} ${Yi[S.FOUR]} block${s};
`,
        Qi
      );
    return "";
  }
  /**
   * Produces the vertex attributes without any bias or modification.
   */
  processVertexAttributes(e, t) {
    let n = "attribute";
    return O.SHADERS_3_0 && (n = "in"), t.forEach((s) => {
      this.setDeclaration(
        e,
        s.name,
        `${n} ${Yi[s.size]} ${s.qualifier || ""}${s.qualifier && " " || ""}${s.name};
`,
        Qi
      );
    }), "";
  }
}
const mg = "instanceData", xg = "_active", vg = `
  // This is a special injected instance attribute. It lets the system
  // control specific instances ability to draw, which allows the backend
  // system greater control on how it optimizes draw calls and it's buffers.
  if (_active < 0.5) {
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);

    // Quick exit to prevent any geometry from arising from the instance
    return;
  }

`, bg = "ActiveIOExpansion";
class wg extends wr {
  processAttributeDestructuring(e, t, n, s, r, o) {
    const a = "";
    return r.find((c) => c.name === xg) && this.setDeclaration(
      t,
      "__active_attribute_handler__",
      vg,
      bg
    ), a;
  }
}
function Tg(i) {
  const e = i.canvas.height, t = i.canvas.width, n = {
    bottom: -e / 2,
    far: 1e7,
    left: -t / 2,
    near: -100,
    right: t / 2,
    top: e / 2
  }, s = new zi({
    type: Fi.ORTHOGRAPHIC,
    left: n.left,
    right: n.right,
    top: n.top,
    bottom: n.bottom,
    near: n.near,
    far: n.far
  });
  return s.scale = [1, -1, 1], s.position = [0, 0, -300], s.update(), {
    camera: s,
    viewport: {
      bottom: 0,
      left: 0,
      right: 0,
      top: 0
    }
  };
}
class yg {
  /**
   * The data provided is the array that holds all of the information that
   * should be pushed to the GPU. The size defines how large the vertex
   * attribute is defined in the shader.
   */
  constructor(e, t = !1, n = !1) {
    this._isInstanced = !1, this._fullUpdate = !1, this.normalize = !1, this._needsUpdate = !1, this._updateRange = {
      /** Number of vertices to update */
      count: -1,
      /** Offset to the first vertex to begin updating */
      offset: -1
    }, this.data = e, this._isDynamic = t, this._isInstanced = n;
  }
  /**
   * The optimization state for frequently changing buffers. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
   */
  get isDynamic() {
    return this._isDynamic;
  }
  /**
   * Indicates the data in this attribute is structured per instance rather than
   * per vertex.
   */
  get isInstanced() {
    return this._isInstanced;
  }
  /**
   * Indicates a full update of the buffer will happen. This is managed
   * internally to determine when needed
   */
  get fullUpdate() {
    return this._fullUpdate;
  }
  /** This flags the attribute as needing to commit updates to it's buffer */
  get needsUpdate() {
    return this._needsUpdate;
  }
  /**
   * Defines a range to update for the buffer object. Getting the range object
   * is a copy of the object. Setting the updateRange triggers an update.
   *
   * Although these properties represent vertex indicies it directly ties to all
   * implications of:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferSubData
   */
  get updateRange() {
    return this._updateRange;
  }
  set updateRange(e) {
    this._updateRange = e, this._needsUpdate = !0;
  }
  /**
   * Destroys this resource and frees resources it consumes on the GPU.
   */
  destroy() {
    this.data = new Uint8Array(0), this.gl && this.gl.proxy.disposeIndexBuffer(this);
  }
  /**
   * Triggers a rebuild of the gl context for this index buffer without
   * destroying any of the buffer data.
   */
  rebuild() {
    this.gl && this.gl.proxy.disposeIndexBuffer(this);
  }
  /**
   * Resizes this buffer to accomodate a different number of indicies.
   *
   * This requires the number of vertices this buffer will be referencing to
   * best optimize the buffer type for optimal memeory usage.
   */
  resize(e, t) {
    if (t > 4294967295)
      throw new Error("Vertex count too high for index buffer");
    let n;
    if (t > 65535 ? n = new Uint32Array(e) : t > 256 ? n = new Uint16Array(e) : n = new Uint8Array(e), n.constructor === this.data.constructor)
      n.length >= this.data.length ? n.set(this.data) : n.set(this.data.subarray(0, n.length));
    else
      for (let s = 0, r = Math.min(e, this.data.length); s < r; s++)
        n[s] = this.data[s];
    this.destroy(), this.data = n, this._needsUpdate = !0, this._fullUpdate = !0;
  }
  /**
   * This is ONLY used when there are vertices that are copied in a vertex
   * buffer for the sake of creating a new identical instance in the vertex
   * buffer.
   *
   * This will repeat the indices in this buffer for a given number of indices
   * within the buffer and will apply an offset to each index to shift the
   * indices to the next instance of vertices possibly located within the vertex
   * buffer.
   *
   * If the index buffer is not big enough to support the number of instances,
   * it will just copy as far as it can then will stop copying. This operation
   * will NOT attempt to resize the buffer.
   *
   * @param instanceCount The number of instances to repeat the data for.
   * @param instanceVertexCount The number of vertices in each instance.
   * @param indexVertexCount The number of vertices in the index buffer that
   *                         creates a single instance.
   * @param startInstance The instance index to start the repeat operation. A
   *                      value of 1 will copy all instances that need to be
   *                      copied.
   */
  repeatInstances(e, t, n, s = 1) {
    if (s < 1)
      throw new Error(
        "Can not use repeatInstance on indexBuffer with a startInstance of less than 1"
      );
    const r = t * e;
    if (r > 4294967296)
      throw new Error("Vertex count too high for index buffer");
    const o = this.data.constructor === Uint32Array ? 4294967296 : this.data.constructor === Uint16Array ? 65536 : 256;
    r > o && this.resize(this.data.length, r);
    for (let a = s, c = n * (s - 1), l = t * s, h = this.data.length; a < e && c < h; ++a, l += t)
      for (let u = 0; u < n && c < h; ++u, ++c)
        this.data[c] = this.data[u] + l;
  }
  /**
   * Flags this attribute as completely resolved in it's needs for updates
   */
  resolve() {
    this._needsUpdate = !1, this._fullUpdate = !1;
  }
  /**
   * Flags the buffer as dynamic. This is a performance optimization that some
   * GPUs can use for buffers that change their contents frequently. Toggling
   * this triggers a full update of the Buffer with the GPU. So this is best set
   * in the constructor one time and never changed again.
   */
  setDynamic(e) {
    this._isDynamic = e, this._needsUpdate = !0, this._fullUpdate = !0;
  }
}
function Eg(i) {
  return Ic(i[0]);
}
function Rg(i, e, t, n, s) {
  const r = [];
  for (let d = 0, f = t.length; d < f; ++d) {
    const p = t[d];
    r.push(new Float32Array(p.size * n));
  }
  const o = t.length;
  let a, c, l, h = !1;
  for (let d = 0, f = n; d < f; ++d)
    for (let p = 0; p < o; ++p)
      if (c = t[p], a = r[p], l = c.update(d), Eg(l))
        for (let g = d * c.size, m = g + c.size, v = 0; g < m; ++g, ++v)
          a[g] = l[v];
      else
        h = !0;
  h && console.warn(
    "A vertex buffer updating method should not use arrays of arrays of numbers."
  );
  const u = new Di();
  for (let d = 0, f = t.length; d < f; ++d) {
    const p = t[d], g = new ii(r[d], p.size);
    p.materialAttribute = g, u.addAttribute(p.name, g);
  }
  if (s) {
    const d = s.indexCount, f = s.update, p = s.size;
    let g;
    if (n > 4294967296)
      throw new Error(
        "The maximum number of indices supported by webgl2 is 4294967296. You may have a vertex count or index count that is too large."
      );
    switch (p) {
      case Cs.UINT8:
        n > 65536 ? g = new Uint32Array(d) : n > 256 ? g = new Uint16Array(d) : g = new Uint8Array(d);
        break;
      case Cs.UINT16:
        n > 65536 ? g = new Uint32Array(d) : g = new Uint16Array(d);
        break;
      case Cs.UINT32:
        g = new Uint32Array(d);
        break;
    }
    for (let v = 0, b = d; v < b; ++v)
      g[v] = f(v);
    const m = new yg(g, !1, !1);
    s.materialIndexBuffer = m, u.setIndexBuffer(m);
  }
  return u;
}
const _g = {
  [_.ONE]: Te.FLOAT,
  [_.TWO]: Te.VEC2,
  [_.THREE]: Te.VEC3,
  [_.FOUR]: Te.VEC4,
  [_.MATRIX3]: Te.MATRIX3x3,
  [_.MATRIX4]: Te.MATRIX4x4,
  [_.FLOAT_ARRAY]: Te.FLOAT_ARRAY,
  [_.TEXTURE]: Te.TEXTURE
}, Ag = {
  [_.ONE]: [0],
  [_.TWO]: [0, 0],
  [_.THREE]: [0, 0, 0],
  [_.FOUR]: [0, 0, 0, 0],
  [_.MATRIX3]: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [_.MATRIX4]: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
};
function Ig(i) {
  return {
    type: _g[i.size],
    data: Ag[i.size]
  };
}
function Mg(i, e, t, n, s) {
  const r = i.getMaterialOptions(), o = /* @__PURE__ */ new Map();
  t.forEach((c, l) => {
    o.set(l.renderTarget || null, c);
  }), Object.assign(r, i.props.materialOptions || {}), r.vertexShader = e, r.fragmentShader = o, r.name = i.id, r.uniforms = {};
  for (let c = 0, l = n.length; c < l; ++c) {
    const h = n[c], u = Ig(h);
    r.uniforms[h.name] = u;
  }
  for (let c = 0, l = s.length; c < l; ++c) {
    const h = s[c];
    r.uniforms[h.name] = {
      type: h.type,
      data: h.value
    };
  }
  return new lr(r);
}
function as(i, e, t, n) {
  const s = new Cl(i, e, t);
  return s.drawMode = n ?? x.Model.DrawMode.TRIANGLE_STRIP, s;
}
function dv(i) {
  return i && i.buffer && i.buffer.value;
}
function wh(i) {
  return i && i.propertyToBufferLocation;
}
class cs {
  /**
   * Base constructor. A manager always needs to be associated with it's layer
   * and it's scene.
   */
  constructor(e, t) {
    this.add = () => {
    }, this.remove = (n) => n, this.layer = e, this.scene = t;
  }
  /**
   * This allows a manager to clean up any contextual information it may have
   * stored while processing changes.
   */
  changesProcessed() {
    delete this.changeListContext;
  }
  /**
   * This will be called with the changes that WILL be processed. This allows
   * this manager to make extra judgement calls on how it will process the
   * changes and let's it optimize itself before changes are actually processed.
   * An example optimization:
   *
   * The manager is receiving add requests. The manager receives an add request
   * that triggers a resize of the buffer. Ideally, the buffer should perform a
   * single resize operation to accommodate ALL add requests getting ready to
   * stream in plus the current size of of the buffer. With this method, the
   * changes will be available to the manager and let the manager make this
   * important decision instead of reflexively grow the buffer as requests
   * stream in, which can cause a large number of costly resize operations.
   */
  incomingChangeList(e) {
    this.changeListContext = e;
  }
  /**
   * Default way to create the layer's material. This properly generates the
   * material, mapping the fragment shaders over to the layer's view's render
   * targetting system.
   */
  makeLayerMaterial() {
    const e = this.layer.shaderIOInfo;
    return Mg(
      this.layer,
      e.vs,
      e.fs,
      e.uniforms,
      e.materialUniforms
    );
  }
}
let kn = {};
function Me(i, e) {
  const t = kn[i] || [e, -1, 0];
  kn[i] = t, t[2]++, clearTimeout(t[1]), t[1] = window.setTimeout(() => {
    e(t[2], i), delete kn[i];
  }, 1);
}
function Tr() {
  for (const i in kn) {
    const e = kn[i];
    clearTimeout(e[1]), e[0](e[2], i);
  }
  kn = {};
}
const yn = ve("performance"), { max: Sg } = Math;
function fv(i) {
  return !!(i && i.buffer && i.buffer.data);
}
function Cg(i) {
  return wh(i);
}
class Og extends cs {
  constructor(e, t) {
    super(e, t), this.availableLocations = [], this.currentInstancedCount = 0, this.instanceToBufferLocation = {}, this.maxInstancedCount = 0, this.attributeToPropertyIds = /* @__PURE__ */ new Map(), this.updateAllPropertyIdList = [], this.activePropertyId = -1, this.currentAvailableLocation = -1, this.remove = (n) => {
      const s = this.instanceToBufferLocation[n.uid];
      return s && (delete this.instanceToBufferLocation[n.uid], this.availableLocations.push(s)), n;
    }, this.add = this.doAddWithRegistration;
  }
  /**
   * This is the tail end of processing changes and lets us clean up anything
   * that might have been used to aid in the processing.
   */
  changesProcessed() {
    super.changesProcessed(), this.availableLocations.splice(0, this.currentAvailableLocation + 1), this.currentAvailableLocation = -1;
  }
  /**
   * First instance to be added to this manager will be heavily analyzed for
   * used observables per attribute.
   */
  doAddWithRegistration(e) {
    Se.setObservableMonitor(!0), this.layer.shaderIOInfo.instanceAttributes.forEach((n) => {
      if (n.parentAttribute) return;
      n.update(e);
      const s = Se.getObservableMonitorIds(!0);
      this.attributeToPropertyIds.set(n, [
        s[s.length - 1]
      ]), s.length > 1 && yn(
        "Property has multiple observables. Only the last trigger will be retained as the feature is not complete yet"
      ), n === this.layer.shaderIOInfo.activeAttribute && (this.activePropertyId = s[0]);
    }), Se.setObservableMonitor(!1), this.makeUpdateAllPropertyIdList();
    const t = this.resizeBuffer();
    return this.gatherLocationsIntoGroups(
      t.newLocations,
      t.growth
    ), this.add = this.doAdd, this.doAdd(e);
  }
  /**
   * After the registration add happens, we gear shift over to this add method
   * which will only pair instances with their appropriate buffer location.
   */
  doAdd(e) {
    var n;
    if (this.availableLocations.length <= 0 || this.currentAvailableLocation >= this.availableLocations.length - 1) {
      const s = this.resizeBuffer();
      this.gatherLocationsIntoGroups(
        s.newLocations,
        s.growth
      );
    }
    const t = this.availableLocations[++this.currentAvailableLocation];
    return t && this.geometry ? (this.instanceToBufferLocation[e.uid] = t, this.currentInstancedCount = this.geometry.maxInstancedCount = Sg(
      this.currentInstancedCount,
      // Instance index + 1 because the indices are zero indexed and the
      // maxInstancedCount is a count value
      t.instanceIndex + 1
    ), this.model && (this.model.vertexDrawRange = [
      0,
      ((n = this.layer.shaderIOInfo.indexBuffer) == null ? void 0 : n.indexCount) || this.layer.shaderIOInfo.instanceVertexCount
    ], this.model.drawInstances = this.currentInstancedCount, this.layer.shaderIOInfo.instanceVertexCount === 0 && (this.model.vertexDrawRange[1] = this.model.drawInstances))) : console.error(
      "Add Error: Instance Attribute Buffer Manager failed to pair an instance with a buffer location"
    ), Tr(), t;
  }
  /**
   * Free any buffer and material resources this is managing.
   */
  destroy() {
    this.geometry && this.geometry.destroy(), this.material && this.material.dispose(), this.scene && this.scene.container && this.model && this.scene.container.remove(this.model);
  }
  /**
   * This retireves the buffer locations associated with an instance, or returns
   * nothing if the instance has not been associated yet.
   */
  getBufferLocations(e) {
    return this.instanceToBufferLocation[e.uid];
  }
  /**
   * This is the property id of the active attribute.
   */
  getActiveAttributePropertyId() {
    return this.activePropertyId;
  }
  /**
   * This is the bare minimum property ids that, when triggered for update, will
   * update ALL of the attribute buffers for the managed layer.
   */
  getUpdateAllPropertyIdList() {
    return this.updateAllPropertyIdList;
  }
  /**
   * Checks to see if an instance is managed by this manager.
   */
  managesInstance(e) {
    return this.instanceToBufferLocation[e.uid] !== void 0;
  }
  /**
   * Analyzes the list of attributes to the property ids that affects them. This
   * populates the list of minimal property ids needed to trigger updates on all
   * of the attributes.
   */
  makeUpdateAllPropertyIdList() {
    const e = {};
    this.attributeToPropertyIds.forEach((t) => {
      e[t[0]] = t[0];
    }), this.updateAllPropertyIdList = Object.values(
      e
    ).filter(Boolean);
  }
  /**
   * Clears all elements of this manager from the current scene it was in.
   */
  removeFromScene() {
    this.scene && this.scene.container && this.model && this.scene.container.remove(this.model), delete this.scene;
  }
  /**
   * This resizes our buffers to accommodate more instances and also generates
   * attribute locations to associate with our instances.
   */
  resizeBuffer() {
    var r, o, a, c;
    yn("Gathering resize growth amount...");
    const e = this.layer.shaderIOInfo;
    let t = 0;
    const n = /* @__PURE__ */ new Map(), s = this.maxInstancedCount;
    if (this.changeListContext) {
      t = this.layer.shaderIOInfo.baseBufferGrowthRate;
      for (let l = 0, h = this.changeListContext.length; l < h; ++l) {
        const u = this.changeListContext[l];
        switch (u[1]) {
          case ge.CHANGE:
          case ge.INSERT:
            this.instanceToBufferLocation[u[0].uid] || t++;
            break;
        }
      }
    }
    if (yn("BEGIN: Resizing unpacked attribute buffer by %d instances", t), this.geometry) {
      this.geometry.rebuild(), this.maxInstancedCount += t, this.attributes = this.attributes || [];
      for (const l of this.attributes)
        l.bufferAttribute.count < this.maxInstancedCount && ((c = (a = this.layer.props.bufferManagement) == null ? void 0 : a.optimize) != null && c.bufferDoubling ? l.bufferAttribute.resize(
          this.maxInstancedCount * 2,
          s
        ) : l.bufferAttribute.resize(
          this.maxInstancedCount,
          s
        ));
    } else {
      t = Math.max(
        t,
        ((o = (r = this.layer.props.bufferManagement) == null ? void 0 : r.optimize) == null ? void 0 : o.expectedInstanceCount) ?? 0
      ), this.maxInstancedCount += t, this.geometry = new Di();
      for (const l of e.vertexAttributes)
        l.materialAttribute && this.geometry.addAttribute(
          l.name,
          l.materialAttribute
        );
      e.indexBuffer && e.indexBuffer.materialIndexBuffer && this.geometry.setIndexBuffer(
        e.indexBuffer.materialIndexBuffer
      ), this.attributes = [];
      for (const l of e.instanceAttributes) {
        const h = l.size || 0, u = new ii(
          new Float32Array(0),
          h,
          !0,
          !0
        );
        u.resize(this.maxInstancedCount), this.geometry.addAttribute(l.name, u);
        const d = Object.assign({}, l, {
          uid: U(),
          bufferAttribute: u
        });
        this.attributes.push(d);
      }
      this.geometry.maxInstancedCount = 0;
    }
    for (let l = 0, h = this.attributes.length; l < h; ++l) {
      const u = this.attributes[l], d = u.bufferAttribute, f = u.size || 0, p = this.maxInstancedCount - s;
      let g = n.get(
        u.name
      );
      g || (g = new Array(p), n.set(u.name, g));
      let m = 0;
      for (let v = s, b = this.maxInstancedCount; v < b; ++v, ++m)
        g[m] = {
          attribute: u,
          // We set this to the attribute, that way when the attribute creates a
          // new buffer object, the new reference will automatically be used
          // which prevents us from having to manually update the reference
          // across all generated locations.
          buffer: d,
          instanceIndex: v,
          start: v * f,
          end: v * f + f
        };
    }
    if (this.scene && this.model && this.scene.container && this.scene.container.remove(this.model), !this.material) {
      this.material = this.makeLayerMaterial();
      for (let l = 0, h = e.uniforms.length; l < h; ++l) {
        const u = e.uniforms[l];
        u.materialUniforms.push(this.material.uniforms[u.name]);
      }
    }
    return this.model = as(
      this.layer.id,
      this.geometry,
      this.material,
      e.drawMode
    ), this.scene && this.scene.container && this.model && this.scene.container.add(this.model), yn("COMPLETE: Resizing unpacked attribute buffer"), {
      growth: t,
      newLocations: n
    };
  }
  /**
   * This takes newly created buffer locations and groups them by the property
   * ids identified by the registration phase.
   */
  gatherLocationsIntoGroups(e, t) {
    if (this.attributeToPropertyIds.size === 0) return;
    yn("BEGIN: Unpacked attribute manager grouping new buffer locations");
    const n = [];
    this.attributeToPropertyIds.forEach((h, u) => {
      n.push({
        attribute: u,
        bufferLocationsForAttribute: e.get(u.name) || [],
        childBufferLocations: (u.childAttributes || []).map((d) => ({
          location: e.get(d.name) || [],
          bufferIndex: -1
        })),
        ids: h,
        bufferIndex: -1
      });
    });
    let s, r, o, a, c, l;
    for (let h = 0; h < t; ++h) {
      const u = {
        instanceIndex: -1,
        propertyToBufferLocation: {}
      };
      for (let d = 0, f = n.length; d < f; ++d) {
        if (s = n[d], r = s.attribute, o = s.ids, a = s.bufferLocationsForAttribute, !a) {
          Me(
            "Instance Attribute Buffer Error",
            (p, g) => {
              console.warn(
                `${g}: There is an error in forming buffer location groups in InstanceAttributeBufferManager. Error count: ${p}`
              );
            }
          );
          continue;
        }
        if (c = a[++s.bufferIndex], !c) {
          Me(
            "Instance Attribute Buffer Error",
            (p, g) => {
              console.warn(
                `${g}: There is an error in forming buffer location groups in InstanceAttributeBufferManager. Error count: ${p}`
              );
            }
          );
          continue;
        }
        if (u.instanceIndex === -1)
          u.instanceIndex = c.instanceIndex;
        else if (c.instanceIndex !== u.instanceIndex) {
          Me(
            "Instance Attribute Parallelism Error",
            (p, g) => {
              console.warn(
                `${g}: A buffer location does not have a matching instance index which means the buffer locations are not in parallel with each other somehow. Error count: ${p}`
              ), console.warn(r.name, c);
            }
          );
          continue;
        }
        if (r.childAttributes) {
          c.childLocations = [];
          for (let p = 0, g = r.childAttributes.length; p < g; ++p) {
            const m = s.childBufferLocations[p];
            if (m) {
              const v = m.location[++m.bufferIndex];
              v ? c.childLocations.push(v) : (l = r.childAttributes[p], Me(
                "Instance Attribute Child Attribute Error",
                (b, w) => {
                  console.warn(
                    `${w}: A child attribute does not have a buffer location available. Error count: ${b}`
                  ), console.warn(
                    `Parent Attribute: ${r.name} Child Attribute: ${l.name}`
                  );
                }
              ));
            }
          }
        }
        for (let p = 0, g = o.length; p < g; ++p)
          u.propertyToBufferLocation[o[p]] = c;
      }
      this.availableLocations.push(u);
    }
    yn(
      "COMPLETE: Unpacked attribute buffer manager buffer location grouping"
    );
  }
  /**
   * Returns the total instances this buffer manages.
   */
  getInstanceCount() {
    return this.maxInstancedCount;
  }
}
const { max: Lg } = Math, En = ve("performance");
class Ng extends cs {
  constructor(e, t) {
    super(e, t), this.allBufferLocations = {}, this.availableLocations = [], this.currentInstancedCount = 0, this.instanceToBufferLocation = {}, this.maxInstancedCount = 1e3, this.blockSubAttributesLookup = /* @__PURE__ */ new Map(), this.attributeToPropertyIds = /* @__PURE__ */ new Map(), this.updateAllPropertyIdList = [], this.activePropertyId = -1, this.currentAvailableLocation = -1, this.remove = (n) => {
      const s = this.instanceToBufferLocation[n.uid];
      return s && (delete this.instanceToBufferLocation[n.uid], this.availableLocations.push(s)), n;
    }, this.add = this.doAddWithRegistration;
  }
  /**
   * This is the tail end of processing changes and lets us clean up anything that might have been used to aid in the
   * processing.
   */
  changesProcessed() {
    super.changesProcessed(), this.availableLocations.splice(0, this.currentAvailableLocation + 1), this.currentAvailableLocation = -1;
  }
  /**
   * First instance to be added to this manager will be heavily analyzed for used observables per attribute.
   */
  doAddWithRegistration(e) {
    this.layer.shaderIOInfo.instanceAttributes.forEach((n) => {
      if (n.parentAttribute) return;
      Se.setObservableMonitor(!0), n.update(e);
      const s = Se.getObservableMonitorIds(!0);
      this.attributeToPropertyIds.set(n, [
        s[s.length - 1]
      ]), s.length > 1 && En(
        "Property has multiple observables. Only the last trigger will be retained as the feature is not complete yet"
      ), n === this.layer.shaderIOInfo.activeAttribute && (this.activePropertyId = s[0]);
    }), Se.setObservableMonitor(!1), this.makeUpdateAllPropertyIdList();
    const t = this.resizeBuffer();
    return this.gatherLocationsIntoGroups(
      t.newLocations,
      t.growth
    ), this.add = this.doAdd, this.doAdd(e);
  }
  /**
   * After the registration add happens, we gear shift over to this add method which will only pair instances
   * with their appropriate buffer location.
   */
  doAdd(e) {
    var n;
    if (this.availableLocations.length <= 0 || this.currentAvailableLocation >= this.availableLocations.length - 1) {
      const s = this.resizeBuffer();
      this.gatherLocationsIntoGroups(
        s.newLocations,
        s.growth
      );
    }
    const t = this.availableLocations[++this.currentAvailableLocation];
    return t && this.geometry ? (this.instanceToBufferLocation[e.uid] = t, this.currentInstancedCount = this.geometry.maxInstancedCount = Lg(
      this.currentInstancedCount,
      // Instance index + 1 because the indices are zero indexed and the maxInstancedCount is a count value
      t.instanceIndex + 1
    ), this.model && (this.model.vertexDrawRange = [
      0,
      ((n = this.layer.shaderIOInfo.indexBuffer) == null ? void 0 : n.indexCount) || this.layer.shaderIOInfo.instanceVertexCount
    ], this.model.drawInstances = this.currentInstancedCount, this.layer.shaderIOInfo.instanceVertexCount === 0 && (this.model.vertexDrawRange[1] = this.model.drawInstances))) : console.error(
      "Add Error: Instance Attribute Buffer Manager failed to pair an instance with a buffer location"
    ), t;
  }
  /**
   * Destroy this manager and clear out all elements utilized within the scene.
   */
  destroy() {
    this.geometry && this.geometry.destroy(), this.material && this.material.dispose(), this.scene && this.scene.container && this.model && this.scene.container.remove(this.model);
  }
  /**
   * This retireves the buffer locations associated with an instance, or returns nothing
   * if the instance has not been associated yet.
   */
  getBufferLocations(e) {
    return this.instanceToBufferLocation[e.uid];
  }
  /**
   * This is the property id of the active attribute.
   */
  getActiveAttributePropertyId() {
    return this.activePropertyId;
  }
  /**
   * This is the bare minimum property ids that, when triggered for update, will update ALL of the attribute buffers
   * for the managed layer.
   */
  getUpdateAllPropertyIdList() {
    return this.updateAllPropertyIdList;
  }
  /**
   * Checks to see if this buffer manager manages the indicated instance
   */
  managesInstance(e) {
    return this.instanceToBufferLocation[e.uid] !== void 0;
  }
  /**
   * Analyzes the list of attributes to the property ids that affects them. This populates the list
   * of minimal property ids needed to trigger updates on all of the attributes.
   */
  makeUpdateAllPropertyIdList() {
    const e = {};
    this.attributeToPropertyIds.forEach((t) => {
      e[t[0]] = t[0];
    }), this.updateAllPropertyIdList = Object.values(
      e
    ).filter(Boolean);
  }
  /**
   * Clears all elements of this manager from the current scene it was in.
   */
  removeFromScene() {
    this.scene && this.scene.container && this.model && this.scene.container.remove(this.model), delete this.scene;
  }
  /**
   * This generates a new buffer of attributes to associate instances with.
   *
   * This method for the attribute packing strategy creates a vertex attribute for each block required.
   * The individual properties are then packed into each of these blocks.
   */
  resizeBuffer() {
    var r, o, a, c;
    const e = this.layer.shaderIOInfo;
    let t = 0;
    const n = /* @__PURE__ */ new Map(), s = this.maxInstancedCount;
    if (this.changeListContext) {
      t = this.layer.shaderIOInfo.baseBufferGrowthRate;
      for (let l = 0, h = this.changeListContext.length; l < h; ++l) {
        const u = this.changeListContext[l];
        switch (u[1]) {
          case ge.CHANGE:
          case ge.INSERT:
            this.instanceToBufferLocation[u[0].uid] || t++;
            break;
        }
      }
    }
    if (En("BEGIN: Resizing packed attribute buffer by %d instances", t), this.geometry) {
      En(
        `Info: Vertex packing buffer is being resized for layer ${this.layer.id}`
      ), this.geometry.rebuild();
      for (const l of e.vertexAttributes)
        l.materialAttribute && this.geometry.addAttribute(
          l.name,
          l.materialAttribute
        );
      e.indexBuffer && e.indexBuffer.materialIndexBuffer && this.geometry.setIndexBuffer(
        e.indexBuffer.materialIndexBuffer
      ), this.maxInstancedCount += t, this.attributes = this.attributes || [], this.blockAttributes = this.blockAttributes || [];
      for (let l = 0, h = this.blockAttributes.length; l < h; ++l) {
        const u = this.blockAttributes[l];
        u.bufferAttribute.count < this.maxInstancedCount && ((c = (a = this.layer.props.bufferManagement) == null ? void 0 : a.optimize) != null && c.bufferDoubling ? u.bufferAttribute.resize(
          this.maxInstancedCount * 2,
          s
        ) : u.bufferAttribute.resize(
          this.maxInstancedCount,
          s
        ));
      }
      for (let l = 0, h = this.blockAttributes.length; l < h; ++l) {
        const u = this.blockAttributes[l], d = u.bufferAttribute;
        if (d.data instanceof Float32Array) {
          const f = this.blockSubAttributesLookup.get(l), p = u.size || 0;
          if (f)
            for (let g = 0, m = f.length; g < m; ++g) {
              const v = f[g];
              let b = n.get(
                v.name
              );
              b || (b = [], n.set(
                v.name,
                b
              ));
              const w = this.allBufferLocations[v.name] || [];
              this.allBufferLocations[v.name] = w;
              const y = Object.assign({}, v, {
                uid: U(),
                packUID: u.packUID,
                bufferAttribute: d
              }), E = v.blockIndex || 0, C = v.size || 1;
              let M;
              for (let N = 0, B = w.length; N < B; ++N)
                M = w[N], M.attribute = y;
              let R, G = b.length;
              const z = this.maxInstancedCount - s;
              b.length += z, w.length += z;
              for (let N = s; N < this.maxInstancedCount; ++N, ++G)
                R = {
                  attribute: y,
                  block: l,
                  buffer: d,
                  instanceIndex: N,
                  start: N * p + E,
                  end: N * p + E + C
                }, b[G] = R, w[N] = R;
            }
        }
      }
    } else {
      t = Math.max(
        t,
        ((o = (r = this.layer.props.bufferManagement) == null ? void 0 : r.optimize) == null ? void 0 : o.expectedInstanceCount) ?? 0
      ), this.maxInstancedCount += t, this.geometry = new Di();
      for (const u of e.vertexAttributes)
        u.materialAttribute && this.geometry.addAttribute(
          u.name,
          u.materialAttribute
        );
      e.indexBuffer && e.indexBuffer.materialIndexBuffer && this.geometry.setIndexBuffer(
        e.indexBuffer.materialIndexBuffer
      ), this.attributes = [], this.blockAttributes = [];
      const l = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map();
      this.blockSubAttributesLookup = h;
      for (let u = 0, d = e.instanceAttributes.length; u < d; ++u) {
        const f = e.instanceAttributes[u], p = f.block || 0;
        let g = l.get(p) || 0;
        g = Math.max(
          g,
          (f.blockIndex || 0) + (f.size || 0)
        ), l.set(p, g);
        let m = h.get(p);
        m || (m = [], h.set(p, m)), m.push(f);
      }
      h.forEach(
        (u) => u.sort((d, f) => (d.blockIndex || 0) - (f.blockIndex || 0))
      );
      for (let u = 0, d = l.size; u < d; ++u) {
        const f = l.get(u) || 0, p = U();
        f || console.warn(
          "Instance Attribute Packing Error: The system tried to build an attribute with a size of zero.",
          "These are the attributes used:",
          e.instanceAttributes,
          "These are the block sizes calculated",
          l,
          "This is the block to attribute lookup generated",
          h
        );
        const g = new Float32Array(f * this.maxInstancedCount), m = new ii(g, f, !0, !0);
        this.geometry.addAttribute(`block${u}`, m);
        const v = h.get(u);
        if (v) {
          for (let b = 0, w = v.length; b < w; ++b) {
            const y = v[b];
            let E = n.get(
              y.name
            );
            E || (E = [], n.set(
              y.name,
              E
            ));
            const C = this.allBufferLocations[y.name] || [];
            this.allBufferLocations[y.name] = C;
            const M = Object.assign({}, y, {
              uid: u,
              packUID: p,
              bufferAttribute: m,
              size: f
            }), R = y.blockIndex || 0, G = y.size || 1;
            for (let z = 0; z < this.maxInstancedCount; ++z) {
              const N = {
                attribute: M,
                block: u,
                buffer: m,
                instanceIndex: z,
                start: z * f + R,
                end: z * f + R + G
              };
              E.push(N), C.push(N);
            }
            this.attributes.push(M);
          }
          this.blockAttributes.push({
            uid: U(),
            packUID: p,
            bufferAttribute: m,
            name: `block${u}`,
            size: f,
            update: () => [0]
          });
        } else
          console.warn(
            "Instance Attribute Packing Buffer Error: Somehow there are no attributes associated with a block.",
            "These are the attributes used:",
            e.instanceAttributes,
            "These are the block sizes calculated",
            l,
            "This is the block to attribute lookup generated",
            h
          );
      }
      this.geometry.maxInstancedCount = 0, this.material = this.makeLayerMaterial();
      for (let u = 0, d = e.uniforms.length; u < d; ++u) {
        const f = e.uniforms[u];
        f.materialUniforms.push(this.material.uniforms[f.name]);
      }
    }
    return this.scene && this.model && this.scene.container && this.scene.container.remove(this.model), this.material = this.material || this.makeLayerMaterial(), this.model = as(
      this.layer.id,
      this.geometry,
      this.material,
      this.layer.shaderIOInfo.drawMode
    ), this.scene && this.scene.container && this.model && this.scene.container.add(this.model), En("COMPLETE: Resizing unpacked attribute buffer"), {
      growth: t,
      newLocations: n
    };
  }
  /**
   * This takes newly created buffer locations and groups them by the property ids identified by the
   * registration phase.
   */
  gatherLocationsIntoGroups(e, t) {
    if (this.attributeToPropertyIds.size === 0) return;
    En("BEGIN: Packed attribute manager grouping new buffer locations");
    const n = [];
    this.attributeToPropertyIds.forEach((s, r) => {
      n.push({
        attribute: r,
        bufferLocationsForAttribute: e.get(r.name) || [],
        childBufferLocations: (r.childAttributes || []).map((o) => ({
          location: e.get(o.name) || [],
          bufferIndex: -1
        })),
        ids: s,
        bufferIndex: -1
      });
    });
    for (let s = 0; s < t; ++s) {
      const r = {
        instanceIndex: -1,
        propertyToBufferLocation: {}
      };
      for (let o = 0, a = n.length; o < a; ++o) {
        const c = n[o], l = c.attribute, h = c.ids, u = c.bufferLocationsForAttribute;
        if (!u) {
          Me(
            "Instance Attribute Buffer Error",
            (f, p) => {
              console.warn(
                `${p}: There is an error in forming buffer location groups in InstanceAttributePackingBufferManager. Error count: ${f}`
              );
            }
          );
          continue;
        }
        const d = u[++c.bufferIndex];
        if (!d) {
          Me(
            "Instance Attribute Buffer Error",
            (f, p) => {
              console.warn(
                `${p}: There is an error in forming buffer location groups in InstanceAttributePackingBufferManager. Error count: ${f}`
              );
            }
          );
          continue;
        }
        if (r.instanceIndex === -1)
          r.instanceIndex = d.instanceIndex;
        else if (d.instanceIndex !== r.instanceIndex) {
          Me(
            "Instance Attribute Parallelism Error",
            (f, p) => {
              console.warn(
                `${p}: A buffer location does not have a matching instance index which means the buffer locations are not in parallel with each other somehow. Error count: ${f}`
              ), console.warn(l.name, d);
            }
          );
          continue;
        }
        if (l.childAttributes) {
          const f = [];
          for (let p = 0, g = l.childAttributes.length; p < g; ++p) {
            const m = l.childAttributes[p], v = c.childBufferLocations[p];
            if (v) {
              const b = v.location[++v.bufferIndex];
              b ? f.push(b) : Me(
                "Instance Attribute Child Attribute Error",
                (w, y) => {
                  console.warn(
                    `${y}: A child attribute does not have a buffer location available. Error count: ${w}`
                  ), console.warn(
                    `Parent Attribute: ${l.name} Child Attribute: ${m.name}`
                  );
                }
              );
            }
          }
          d.childLocations = f;
        }
        for (let f = 0, p = h.length; f < p; ++f) {
          const g = h[f];
          r.propertyToBufferLocation[g] = d;
        }
      }
      this.availableLocations.push(r);
    }
    En("COMPLETE: Packed attribute buffer manager buffer location grouping"), Tr();
  }
  /**
   * Returns the total instances this buffer manages.
   */
  getInstanceCount() {
    return this.maxInstancedCount;
  }
}
function Pg(i) {
  return i && i.buffer && i.buffer.value && i.type === Te.VEC4_ARRAY;
}
class Bg extends cs {
  constructor(e, t) {
    super(e, t), this.buffers = [], this.availableClusters = [], this.instanceToCluster = {}, this.clusterToBuffer = /* @__PURE__ */ new Map(), this.add = (s) => {
      this.availableClusters.length <= 0 && this.makeNewBuffer();
      const r = this.availableClusters.pop();
      return r ? this.instanceToCluster[s.uid] = r : console.warn(
        "No valid cluster available for instance added to uniform manager."
      ), r;
    }, this.remove = (s) => {
      const r = this.instanceToCluster[s.uid];
      return r && (delete this.instanceToCluster[s.uid], this.availableClusters.push(r)), s;
    };
    let n = 0;
    e.shaderIOInfo.instanceAttributes.forEach(
      (s) => {
        n = Math.max(s.block || 0, n);
      }
    ), this.uniformBlocksPerInstance = n + 1;
  }
  /**
   * Free all resources this manager may be holding onto
   */
  destroy() {
    this.buffers.forEach((e) => {
      e.geometry.destroy(), e.material.dispose();
    });
  }
  /**
   * This retireves the uniforms associated with an instance, or returns nothing
   * if the instance has not been associated yet.
   */
  getBufferLocations(e) {
    return this.instanceToCluster[e.uid];
  }
  /**
   * TODO: The uniform buffer does not need to utilize this yet. it will be more necessary
   * when this manager updates only changed properties.
   */
  getActiveAttributePropertyId() {
    return -1;
  }
  /**
   * TODO: This is irrelevant tot his manager for now.
   * Number of instances this buffer manages.
   */
  getInstanceCount() {
    return -1;
  }
  /**
   * TODO: The uniform buffer updates ALL attributes every change for any property so far.
   * This should be fixed for performance improvements on the compatibility mode.
   */
  getUpdateAllPropertyIdList() {
    return [];
  }
  /**
   * Checks to see if the instance is managed by this manager.
   */
  managesInstance(e) {
    return this.instanceToCluster[e.uid] === void 0;
  }
  /**
   * Clears all elements of this manager from the current scene it was in.
   */
  removeFromScene() {
    const e = this.scene;
    if (e != null && e.container) {
      for (let t = 0, n = this.buffers.length; t < n; ++t) {
        const s = this.buffers[t];
        e.container.remove(s.model);
      }
      delete this.scene;
    }
  }
  /**
   * Applies the buffers to the provided scene for rendering.
   */
  setScene(e) {
    if (e.container) {
      for (let t = 0, n = this.buffers.length; t < n; ++t) {
        const s = this.buffers[t];
        e.container.add(s.model);
      }
      this.scene = e;
    } else
      console.warn("Can not set a scene that has an undefined container.");
  }
  /**
   * This generates a new buffer of uniforms to associate instances with.
   */
  makeNewBuffer() {
    const e = this.layer.shaderIOInfo, t = new Di();
    e.vertexAttributes.forEach((h) => {
      h.materialAttribute && t.addAttribute(h.name, h.materialAttribute);
    });
    const n = this.makeLayerMaterial(), s = as(
      this.layer.id,
      t,
      n,
      e.drawMode
    );
    s.vertexDrawRange = [
      0,
      e.maxInstancesPerBuffer * e.instanceVertexCount
    ];
    const r = {
      activeInstances: [],
      clusters: [],
      firstInstance: 0,
      geometry: t,
      lastInstance: 0,
      material: n,
      model: s
    };
    this.buffers.push(r);
    let o = 0;
    const a = mg, c = n.uniforms[a];
    if (Nu(c))
      c.data = c.data.map(() => [
        0,
        0,
        0,
        0
      ]);
    else {
      console.warn(
        "Material is utilizing an invalid uniform type for Uniform Buffer Management. Buffering will not be possible."
      );
      return;
    }
    const l = Object.assign(
      {},
      e.instanceAttributes[0],
      {
        bufferAttribute: new ii(new Float32Array(1), 1),
        uid: U()
      }
    );
    for (let h = 0, u = e.maxInstancesPerBuffer; h < u; ++h) {
      const d = {
        attribute: l,
        // TODO: This is not needed for the uniform method yet. When we break down
        // the uniform updates into attributes, this will be utilized.
        buffer: c,
        instanceIndex: h,
        start: o,
        end: 0
      };
      o += this.uniformBlocksPerInstance, d.end = o, r.clusters.push(d), this.availableClusters.push(d), this.clusterToBuffer.set(d, r);
    }
    for (let h = 0, u = e.uniforms.length; h < u; ++h) {
      const d = e.uniforms[h];
      d.materialUniforms.push(n.uniforms[d.name]);
    }
    this.scene && this.scene.container && this.scene.container.add(r.model);
  }
}
class jo {
  constructor(e, t) {
    this.layer = e, this.bufferManager = t;
  }
}
const Rs = [], { min: Or, max: Lr } = Math;
class Dg extends jo {
  constructor() {
    super(...arguments), this.diffMode = 0, this.bufferAttributeUpdateRange = {}, this.bufferAttributeWillUpdate = {}, this.updateInstance = this.updateInstancePartial;
  }
  /**
   * This processes add operations from changes in the instancing data
   */
  addInstance(e, t, n, s) {
    if (s)
      e.changeInstance(e, t, Rs, s);
    else {
      const r = e.layer.bufferManager.add(t);
      Cg(r) && (t.active = !0, e.layer.onDiffAdd && e.layer.onDiffAdd(t), e.updateInstance(
        e.layer,
        t,
        Rs,
        r
      ));
    }
  }
  /**
   * This processes change operations from changes in the instancing data
   */
  changeInstance(e, t, n, s) {
    s ? e.updateInstance(e.layer, t, n, s) : e.addInstance(e, t, Rs, s);
  }
  /**
   * This processes remove operations from changes in the instancing data
   */
  removeInstance(e, t, n, s) {
    s && (t.active = !1, e.layer.onDiffRemove && e.layer.onDiffRemove(t), e.updateInstance(e.layer, t, Rs, s), e.layer.bufferManager.remove(t));
  }
  /**
   * This performs the actual updating of buffers the instance needs to update
   */
  updateInstancePartial(e, t, n, s) {
    const r = s.propertyToBufferLocation, o = this.bufferAttributeUpdateRange;
    let a, c, l, h, u, d, f, p, g, m, v, b, w;
    if (t.active) {
      for ((n.length === 0 || t.reactivate) && (n = this.bufferManager.getUpdateAllPropertyIdList()), f = 0, v = n.length; f < v; ++f)
        if (a = r[n[f]], !!a) {
          for (u = a.attribute, d = u.packUID || u.uid, c = u.update(t), g = a.start, b = a.end, p = 0; g < b; ++g, ++p)
            a.buffer.data[g] = c[p];
          if (l = o[d] || [
            null,
            Number.MAX_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER
          ], l[0] = u, l[1] = Or(a.start, l[1]), l[2] = Lr(a.end, l[2]), o[d] = l, a.childLocations) {
            for (h = a.childLocations, g = 0, b = h.length; g < b; ++g)
              if (a = h[g], !!a) {
                for (d = a.attribute.packUID || a.attribute.uid, c = a.attribute.update(t), m = a.start, w = a.end, p = 0; m < w; ++m, ++p)
                  a.buffer.data[m] = c[p];
                l = o[d] || [
                  null,
                  Number.MAX_SAFE_INTEGER,
                  Number.MIN_SAFE_INTEGER
                ], l[0] = a.attribute, l[1] = Or(a.start, l[1]), l[2] = Lr(a.end, l[2]), o[d] = l;
              }
          }
        }
    } else {
      for (a = r[this.bufferManager.getActiveAttributePropertyId()], u = a.attribute, d = u.packUID || u.uid, c = u.update(t), m = a.start, w = a.end, p = 0; m < w; ++m, ++p)
        a.buffer.data[m] = c[p];
      l = o[d] || [
        null,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER
      ], l[0] = u, l[1] = Or(a.start, l[1]), l[2] = Lr(a.end, l[2]), o[d] = l;
    }
    t.reactivate = !1;
  }
  /**
   * This performs an update on the buffers with the intent the entire buffer is
   * going to update rather than a chunk of it.
   */
  updateInstanceFull(e, t, n, s) {
    const r = s.propertyToBufferLocation, o = this.bufferAttributeWillUpdate;
    let a, c, l, h, u, d, f, p, g, m, v;
    if (t.active) {
      for ((n.length === 0 || t.reactivate) && (n = this.bufferManager.getUpdateAllPropertyIdList()), u = 0, v = n.length; u < v; ++u)
        if (a = r[n[u]], !!a) {
          for (h = a.attribute, c = h.update(t), f = a.start, g = a.end, d = 0; f < g; ++f, ++d)
            a.buffer.data[f] = c[d];
          if (o[h.packUID || h.uid] = h, a.childLocations) {
            for (l = a.childLocations, f = 0, g = l.length; f < g; ++f)
              if (a = l[f], !!a) {
                for (h = a.attribute, c = h.update(t), p = a.start, m = a.end, d = 0; p < m; ++p, ++d)
                  a.buffer.data[p] = c[d];
                o[h.packUID || h.uid] = h;
              }
          }
        }
    } else {
      for (a = r[this.bufferManager.getActiveAttributePropertyId()], h = a.attribute, c = h.update(t), p = a.start, m = a.end, d = 0; p < m; ++p, ++d)
        a.buffer.data[p] = c[d];
      o[h.packUID || h.uid] = h;
    }
    t.reactivate = !1;
  }
  /**
   * Finalize all of the buffer changes and apply the correct update ranges
   */
  commit() {
    if (this.diffMode === 0) {
      const e = Object.values(this.bufferAttributeUpdateRange);
      for (let t = 0, n = e.length; t < n; ++t) {
        const s = e[t], r = s[0].bufferAttribute;
        r.updateRange = {
          count: s[2] - s[1],
          offset: s[1]
        };
      }
    } else {
      const e = Object.values(this.bufferAttributeWillUpdate);
      for (let t = 0, n = e.length; t < n; ++t) {
        const s = e[t].bufferAttribute;
        s.updateRange = {
          count: -1,
          offset: 0
        };
      }
    }
    this.bufferAttributeUpdateRange = {};
  }
  /**
   * This will optimize the update method used. If there are enough instances
   * being updated, we will cause the entire attribute buffer to update. If
   * there are not enough, then we will update with additional steps to only
   * update the chunks of the buffer that are affected by the changelist.
   */
  incomingChangeList(e) {
    e.length === 0 ? this.diffMode = 0 : e.length > this.bufferManager.getInstanceCount() * 0.7 ? this.diffMode = 1 : this.diffMode = 0, this.diffMode === 0 ? this.updateInstance = this.updateInstancePartial : this.updateInstance = this.updateInstanceFull;
  }
}
const ec = [];
class Ug extends jo {
  /**
   * This processes add operations from changes in the instancing data
   */
  addInstance(e, t, n, s) {
    if (s)
      e.changeInstance(e, t, ec, s);
    else {
      const r = e.layer.bufferManager.add(t);
      Pg(r) && (t.active = !0, e.layer.onDiffAdd && e.layer.onDiffAdd(t), e.updateInstance(e.layer, t, r));
    }
  }
  /**
   * This processes change operations from changes in the instancing data
   */
  changeInstance(e, t, n, s) {
    s ? e.updateInstance(e.layer, t, s) : e.addInstance(e, t, ec, s);
  }
  /**
   * This processes remove operations from changes in the instancing data
   */
  removeInstance(e, t, n, s) {
    s && (t.active = !1, e.layer.onDiffRemove && e.layer.onDiffRemove(t), e.updateInstance(e.layer, t, s), e.layer.bufferManager.remove(t));
  }
  /**
   * TODO: We should be updating based on prop ids instead of always updating all props for every change.
   *
   * This performs the actual updating of buffers the instance needs to update
   */
  updateInstance(e, t, n) {
    if (t.active) {
      const s = n.buffer, r = n.start, o = s.data;
      let a, c, l, h, u, d;
      for (let f = 0, p = e.shaderIOInfo.instanceAttributes.length; f < p; ++f)
        if (a = e.shaderIOInfo.instanceAttributes[f], c = a.update(t), l = o[r + (a.block || 0)], h = a.blockIndex, h !== void 0)
          for (u = h, d = c.length + h; u < d; ++u)
            l[u] = c[u - h];
      s.data = o;
    } else {
      const s = n.buffer, r = n.start, o = s.data, a = e.shaderIOInfo.activeAttribute, c = a.update(t), l = o[r + (a.block || 0)], h = a.blockIndex;
      if (h !== void 0)
        for (let u = h, d = c.length + h; u < d; ++u)
          l[u] = c[u - h];
      s.data = o;
    }
  }
  /**
   * Right now there is no operations for committing for the uniform manager.
   */
  commit() {
  }
  /**
   * There are no optimizations available for this processor yet.
   */
  incomingChangeList(e) {
  }
}
const Rn = ve("performance"), { max: kg } = Math;
function Fg(i) {
  return wh(i);
}
class zg extends cs {
  constructor(e, t) {
    super(e, t), this.allBufferLocations = {}, this.availableLocations = [], this.currentInstancedCount = 0, this.instanceToBufferLocation = {}, this.maxInstancedCount = 0, this.attributeToPropertyIds = /* @__PURE__ */ new Map(), this.updateAllPropertyIdList = [], this.activePropertyId = -1, this.currentAvailableLocation = -1, this.remove = (n) => {
      const s = this.instanceToBufferLocation[n.uid];
      return s && (delete this.instanceToBufferLocation[n.uid], this.availableLocations.push(s)), n;
    }, this.add = this.doAddWithRegistration;
  }
  /**
   * This is the tail end of processing changes and lets us clean up anything
   * that might have been used to aid in the processing.
   */
  changesProcessed() {
    super.changesProcessed(), this.availableLocations.splice(0, this.currentAvailableLocation + 1), this.currentAvailableLocation = -1;
  }
  /**
   * First instance to be added to this manager will be heavily analyzed for
   * used observables per attribute.
   */
  doAddWithRegistration(e) {
    Se.setObservableMonitor(!0), this.layer.shaderIOInfo.instanceAttributes.forEach((n) => {
      if (n.parentAttribute) return;
      n.update(e);
      const s = Se.getObservableMonitorIds(!0);
      this.attributeToPropertyIds.set(n, [
        s[s.length - 1]
      ]), s.length > 1 && Rn(
        "Property has multiple observables. Only the last trigger will be retained as the feature is not complete yet"
      ), n === this.layer.shaderIOInfo.activeAttribute && (this.activePropertyId = s[0]);
    }), Se.setObservableMonitor(!1), this.makeUpdateAllPropertyIdList();
    const t = this.resizeBuffer();
    return this.gatherLocationsIntoGroups(
      t.newLocations,
      t.growth
    ), this.add = this.doAdd, this.doAdd(e);
  }
  /**
   * After the registration add happens, we gear shift over to this add method
   * which will only pair instances with their appropriate buffer location.
   */
  doAdd(e) {
    if (this.availableLocations.length <= 0 || this.currentAvailableLocation >= this.availableLocations.length - 1) {
      const n = this.resizeBuffer();
      this.gatherLocationsIntoGroups(
        n.newLocations,
        n.growth
      );
    }
    const t = this.availableLocations[++this.currentAvailableLocation];
    return t && this.geometry ? (this.instanceToBufferLocation[e.uid] = t, this.currentInstancedCount = this.geometry.maxInstancedCount = kg(
      this.currentInstancedCount,
      // Instance index + 1 because the indices are zero indexed and the
      // maxInstancedCount is a count value
      t.instanceIndex + 1
    ), this.model && (this.model.vertexDrawRange = [
      0,
      this.layer.shaderIOInfo.instanceVertexCount * this.currentInstancedCount
    ], this.model.drawInstances = this.currentInstancedCount, this.layer.shaderIOInfo.instanceVertexCount === 0 && (this.model.vertexDrawRange[1] = this.layer.shaderIOInfo.instanceVertexCount * this.currentInstancedCount))) : console.error(
      "Add Error: Instance Attribute Buffer Manager failed to pair an instance with a buffer location"
    ), t;
  }
  /**
   * Free any buffer and material resources this is managing.
   */
  destroy() {
    this.geometry && this.geometry.destroy(), this.material && this.material.dispose(), this.scene && this.scene.container && this.model && this.scene.container.remove(this.model);
  }
  /**
   * This retireves the buffer locations associated with an instance, or returns
   * nothing if the instance has not been associated yet.
   */
  getBufferLocations(e) {
    return this.instanceToBufferLocation[e.uid];
  }
  /**
   * This is the property id of the active attribute.
   */
  getActiveAttributePropertyId() {
    return this.activePropertyId;
  }
  /**
   * This is the bare minimum property ids that, when triggered for update, will
   * update ALL of the attribute buffers for the managed layer.
   */
  getUpdateAllPropertyIdList() {
    return this.updateAllPropertyIdList;
  }
  /**
   * Checks to see if an instance is managed by this manager.
   */
  managesInstance(e) {
    return this.instanceToBufferLocation[e.uid] !== void 0;
  }
  /**
   * Analyzes the list of attributes to the property ids that affects them. This
   * populates the list of minimal property ids needed to trigger updates on all
   * of the attributes.
   */
  makeUpdateAllPropertyIdList() {
    const e = {};
    this.attributeToPropertyIds.forEach((t) => {
      e[t[0]] = t[0];
    }), this.updateAllPropertyIdList = Object.values(
      e
    ).filter(Boolean);
  }
  /**
   * Clears all elements of this manager from the current scene it was in.
   */
  removeFromScene() {
    this.scene && this.scene.container && this.model && this.scene.container.remove(this.model), delete this.scene;
  }
  /**
   * This generates a new buffer of attribute locations to associate instances
   * with.
   */
  resizeBuffer() {
    var r, o;
    Rn("Gathering resize growth amount...");
    const e = this.layer.shaderIOInfo.instanceVertexCount, t = this.layer.shaderIOInfo;
    let n = 0;
    const s = /* @__PURE__ */ new Map();
    if (this.changeListContext) {
      n = this.layer.shaderIOInfo.baseBufferGrowthRate;
      for (let a = 0, c = this.changeListContext.length; a < c; ++a) {
        const l = this.changeListContext[a];
        switch (l[1]) {
          case ge.CHANGE:
          case ge.INSERT:
            this.instanceToBufferLocation[l[0].uid] || n++;
            break;
        }
      }
    }
    if (Rn("BEGIN: Resizing unpacked attribute buffer by %d instances", n), this.geometry) {
      this.geometry.rebuild();
      const a = this.maxInstancedCount;
      this.maxInstancedCount += n;
      for (const c of t.vertexAttributes)
        c.materialAttribute && (c.materialAttribute.resize(
          e * this.maxInstancedCount
        ), c.materialAttribute.repeatInstances(
          this.maxInstancedCount - a,
          e,
          a
        ));
      if (t.indexBuffer && this.geometry.indexBuffer) {
        const c = t.indexBuffer.indexCount;
        this.geometry.indexBuffer.resize(
          c * this.maxInstancedCount,
          e * this.maxInstancedCount
        ), this.geometry.indexBuffer.repeatInstances(
          this.maxInstancedCount - a,
          e,
          c,
          a
        );
      }
      this.attributes = this.attributes || [];
      for (const c of this.attributes) {
        const l = c.bufferAttribute, h = c.size || 0;
        if (l.data instanceof Float32Array) {
          c.bufferAttribute.resize(
            this.maxInstancedCount * e
          );
          let u = s.get(
            c.name
          );
          const d = this.allBufferLocations[c.name] || [];
          this.allBufferLocations[c.name] = d;
          for (let m = 0, v = d.length; m < v; ++m)
            d[m].buffer.data = c.bufferAttribute.data;
          u || (u = [], s.set(
            c.name,
            u
          ));
          let f, p = u.length;
          const g = this.maxInstancedCount - a;
          u.length += g, d.length += g;
          for (let m = a, v = this.maxInstancedCount; m < v; ++m, ++p)
            f = {
              attribute: c,
              buffer: {
                data: c.bufferAttribute.data
              },
              instanceIndex: m,
              start: m * h,
              end: m * h + h
            }, u[p] = f, d[m] = f;
        }
      }
      (o = this.scene) != null && o.container && this.model && this.scene.container.remove(this.model);
    } else {
      this.maxInstancedCount += n, this.geometry = new Di();
      for (const a of t.vertexAttributes)
        a.materialAttribute && (a.materialAttribute.resize(
          e * this.maxInstancedCount
        ), a.materialAttribute.repeatInstances(
          this.maxInstancedCount - 1,
          e
        ), a.materialAttribute.setDynamic(!0), this.geometry.addAttribute(
          a.name,
          a.materialAttribute
        ));
      (r = t.indexBuffer) != null && r.materialIndexBuffer && (this.geometry.setIndexBuffer(
        t.indexBuffer.materialIndexBuffer
      ), t.indexBuffer.materialIndexBuffer.resize(
        t.indexBuffer.indexCount * this.maxInstancedCount,
        // We will have vertices to reference for our original instance and
        // every new instance added to the buffer
        e * this.maxInstancedCount
      ), t.indexBuffer.materialIndexBuffer.repeatInstances(
        // Repeat instances more than the original instance in the buffer
        this.maxInstancedCount - 1,
        // We indicate how many reference vertices there are for each instance
        e,
        // We indicate how many index vertices there are in the buffer
        t.indexBuffer.indexCount,
        // Copy starting from the second instance in the buffer
        1
      )), this.attributes = [];
      for (const a of t.instanceAttributes) {
        const c = a.size || 0, l = new ii(
          new Float32Array(0),
          c,
          !0,
          !1
        );
        l.resize(this.maxInstancedCount * e), this.geometry.addAttribute(a.name, l);
        let h = s.get(
          a.name
        );
        h || (h = [], s.set(a.name, h));
        const u = this.allBufferLocations[a.name] || [];
        this.allBufferLocations[a.name] = u;
        const d = Object.assign({}, a, {
          uid: U(),
          bufferAttribute: l
        });
        for (let f = 0; f < this.maxInstancedCount; ++f) {
          const p = {
            attribute: d,
            buffer: {
              data: l.data
            },
            instanceIndex: f,
            start: f * c,
            end: f * c + c
          };
          h.push(p), u.push(p);
        }
        this.attributes.push(d);
      }
      this.geometry.maxInstancedCount = 0, this.material = this.makeLayerMaterial();
      for (let a = 0, c = t.uniforms.length; a < c; ++a) {
        const l = t.uniforms[a];
        l.materialUniforms.push(this.material.uniforms[l.name]);
      }
    }
    return this.scene && this.model && this.scene.container && this.scene.container.remove(this.model), this.material = this.material || this.makeLayerMaterial(), this.model = as(
      this.layer.id,
      this.geometry,
      this.material,
      t.drawMode
    ), this.scene && this.scene.container && this.model && this.scene.container.add(this.model), Rn("COMPLETE: Resizing unpacked attribute buffer"), {
      growth: n,
      newLocations: s
    };
  }
  /**
   * This takes newly created buffer locations and groups them by the property
   * ids identified by the registration phase.
   */
  gatherLocationsIntoGroups(e, t) {
    if (this.attributeToPropertyIds.size === 0) return;
    Rn("BEGIN: Unpacked attribute manager grouping new buffer locations");
    const n = [];
    this.attributeToPropertyIds.forEach((h, u) => {
      n.push({
        attribute: u,
        bufferLocationsForAttribute: e.get(u.name) || [],
        childBufferLocations: (u.childAttributes || []).map((d) => ({
          location: e.get(d.name) || [],
          bufferIndex: -1
        })),
        ids: h,
        bufferIndex: -1
      });
    });
    let s, r, o, a, c, l;
    for (let h = 0; h < t; ++h) {
      const u = {
        instanceIndex: -1,
        propertyToBufferLocation: {}
      };
      for (let d = 0, f = n.length; d < f; ++d) {
        if (s = n[d], r = s.attribute, o = s.ids, a = s.bufferLocationsForAttribute, !a) {
          Me(
            "Instance Attribute Buffer Error",
            (p, g) => {
              console.warn(
                `${g}: There is an error in forming buffer location groups in VertexAttributeBufferManager. Error count: ${p}`
              );
            }
          );
          continue;
        }
        if (c = a[++s.bufferIndex], !c) {
          Me(
            "Instance Attribute Buffer Error",
            (p, g) => {
              console.warn(
                `${g}: There is an error in forming buffer location groups in VertexAttributeBufferManager. Error count: ${p}`
              );
            }
          );
          continue;
        }
        if (u.instanceIndex === -1)
          u.instanceIndex = c.instanceIndex;
        else if (c.instanceIndex !== u.instanceIndex) {
          Me(
            "Instance Attribute Parallelism Error",
            (p, g) => {
              console.warn(
                `${g}: A buffer location does not have a matching instance index which means the buffer locations are not in parallel with each other somehow. Error count: ${p}`
              ), console.warn(r.name, c);
            }
          );
          continue;
        }
        if (r.childAttributes) {
          c.childLocations = [];
          for (let p = 0, g = r.childAttributes.length; p < g; ++p) {
            const m = s.childBufferLocations[p];
            if (m) {
              const v = m.location[++m.bufferIndex];
              v ? c.childLocations.push(v) : (l = r.childAttributes[p], Me(
                "Instance Attribute Child Attribute Error",
                (b, w) => {
                  console.warn(
                    `${w}: A child attribute does not have a buffer location available. Error count: ${b}`
                  ), console.warn(
                    `Parent Attribute: ${r.name} Child Attribute: ${l.name}`
                  );
                }
              ));
            }
          }
        }
        for (let p = 0, g = o.length; p < g; ++p)
          u.propertyToBufferLocation[o[p]] = c;
      }
      this.availableLocations.push(u);
    }
    Rn(
      "COMPLETE: Unpacked attribute buffer manager buffer location grouping"
    ), Tr();
  }
  /**
   * Returns the total instances this buffer manages.
   */
  getInstanceCount() {
    return this.maxInstancedCount;
  }
}
const _s = [], { min: Nr, max: Pr } = Math;
class Gg extends jo {
  constructor() {
    super(...arguments), this.diffMode = 0, this.bufferAttributeUpdateRange = {}, this.bufferAttributeWillUpdate = {}, this.updateInstance = this.updateInstancePartial;
  }
  /**
   * This processes add operations from changes in the instancing data
   */
  addInstance(e, t, n, s) {
    if (s)
      e.changeInstance(e, t, _s, s);
    else {
      const r = e.layer.bufferManager.add(t);
      Fg(r) && (t.active = !0, e.layer.onDiffAdd && e.layer.onDiffAdd(t), e.updateInstance(
        e.layer,
        t,
        _s,
        r
      ));
    }
  }
  /**
   * This processes change operations from changes in the instancing data
   */
  changeInstance(e, t, n, s) {
    s ? e.updateInstance(e.layer, t, n, s) : e.addInstance(e, t, _s, s);
  }
  /**
   * This processes remove operations from changes in the instancing data
   */
  removeInstance(e, t, n, s) {
    s && (t.active = !1, e.layer.onDiffRemove && e.layer.onDiffRemove(t), e.updateInstance(e.layer, t, _s, s), e.layer.bufferManager.remove(t));
  }
  /**
   * This performs the actual updating of buffers the instance needs to update
   */
  updateInstancePartial(e, t, n, s) {
    const r = e.shaderIOInfo.instanceVertexCount, o = s.propertyToBufferLocation, a = this.bufferAttributeUpdateRange;
    let c, l, h, u, d, f, p = 0, g, m, v, b, w, y, E;
    if (t.active) {
      for ((n.length === 0 || t.reactivate) && (n = this.bufferManager.getUpdateAllPropertyIdList()), g = 0, y = n.length; g < y; ++g)
        if (c = o[n[g]], !!c) {
          for (d = c.attribute, f = d.packUID || d.uid, l = d.update(t), p = d.size || c.end - c.start, m = c.start * r, E = c.end * r; m < E; )
            for (v = 0; v < p; ++v, ++m)
              c.buffer.data[m] = l[v];
          if (h = a[f] || [
            null,
            Number.MAX_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER
          ], h[0] = d, h[1] = Nr(c.start * r, h[1]), h[2] = Pr(c.end * r, h[2]), a[f] = h, c.childLocations) {
            for (u = c.childLocations, b = 0, w = u.length; b < w; ++b)
              if (c = u[b], !!c) {
                for (f = c.attribute.packUID || c.attribute.uid, l = c.attribute.update(t), p = d.size || c.end - c.start, m = c.start * r, E = c.end * r; m < E; )
                  for (v = 0; v < p; ++v, ++m)
                    c.buffer.data[m] = l[v];
                h = a[f] || [
                  null,
                  Number.MAX_SAFE_INTEGER,
                  Number.MIN_SAFE_INTEGER
                ], h[0] = c.attribute, h[1] = Nr(c.start * r, h[1]), h[2] = Pr(c.end * r, h[2]), a[f] = h;
              }
          }
        }
    } else {
      for (c = o[this.bufferManager.getActiveAttributePropertyId()], d = c.attribute, f = d.packUID || d.uid, l = d.update(t), p = d.size || c.end - c.start, m = c.start * r, E = c.end * r; m < E; )
        for (v = 0; v < p; ++v, ++m)
          c.buffer.data[m] = l[v];
      h = a[f] || [
        null,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER
      ], h[0] = d, h[1] = Nr(c.start * r, h[1]), h[2] = Pr(c.end * r, h[2]), a[f] = h;
    }
    t.reactivate = !1;
  }
  /**
   * This performs an update on the buffers with the intent the entire buffer is
   * going to update rather than a chunk of it.
   */
  updateInstanceFull(e, t, n, s) {
    const r = s.propertyToBufferLocation, o = this.bufferAttributeWillUpdate, a = this.layer.shaderIOInfo.instanceVertexCount;
    let c, l, h, u, d = 0, f, p, g, m, v, b, w;
    if (t.active) {
      for ((n.length === 0 || t.reactivate) && (n = this.bufferManager.getUpdateAllPropertyIdList()), f = 0, b = n.length; f < b; ++f)
        if (c = r[n[f]], !!c) {
          for (u = c.attribute, l = u.update(t), d = u.size || c.end - c.start, g = c.start * a, v = c.end * a; g < v; )
            for (m = 0; m < d; ++m, ++g)
              c.buffer.data[g] = l[m];
          if (o[u.packUID || u.uid] = u, c.childLocations) {
            for (h = c.childLocations, g = 0, v = h.length; g < v; ++g)
              if (c = h[g], !!c) {
                for (u = c.attribute, l = u.update(t), d = u.size || c.end - c.start, p = c.start * a, w = c.end * a; p < w; )
                  for (m = 0; m < d; ++m, ++p)
                    c.buffer.data[p] = l[m];
                o[u.packUID || u.uid] = u;
              }
          }
        }
    } else {
      for (c = r[this.bufferManager.getActiveAttributePropertyId()], u = c.attribute, d = u.size || c.end - c.start, l = u.update(t), p = c.start * a, w = c.end * a; p < w; )
        for (m = 0; m < d; ++m, ++p)
          c.buffer.data[p] = l[m];
      o[u.packUID || u.uid] = u;
    }
    t.reactivate = !1;
  }
  /**
   * Finalize all of the buffer changes and apply the correct update ranges
   */
  commit() {
    if (this.diffMode === 0) {
      const e = Object.values(this.bufferAttributeUpdateRange);
      for (let t = 0, n = e.length; t < n; ++t) {
        const s = e[t], r = s[0].bufferAttribute;
        r.updateRange = {
          count: s[2] - s[1],
          offset: s[1]
        };
      }
    } else {
      const e = Object.values(this.bufferAttributeWillUpdate);
      for (let t = 0, n = e.length; t < n; ++t) {
        const s = e[t].bufferAttribute;
        s.updateRange = {
          count: -1,
          offset: 0
        };
      }
    }
    this.bufferAttributeUpdateRange = {};
  }
  /**
   * This will optimize the update method used. If there are enough instances
   * being updated, we will cause the entire attribute buffer to update. If
   * there are not enough, then we will update with additional steps to only
   * update the chunks of the buffer that are affected by the changelist.
   */
  incomingChangeList(e) {
    e.length === 0 ? this.diffMode = 0 : e.length > this.bufferManager.getInstanceCount() * 0.7 ? this.diffMode = 1 : this.diffMode = 0, this.diffMode === 0 ? this.updateInstance = this.updateInstancePartial : this.updateInstance = this.updateInstanceFull;
  }
}
class Vg {
  /**
   * This returns the proper diff processor for handling diffs
   */
  makeProcessor(e, t) {
    if (this.processing) return this.processing;
    if (e.bufferType === ie.INSTANCE_ATTRIBUTE || e.bufferType === ie.INSTANCE_ATTRIBUTE_PACKING ? this.processor = new Dg(e, t) : e.bufferType === ie.VERTEX_ATTRIBUTE || e.bufferType === ie.VERTEX_ATTRIBUTE_PACKING ? this.processor = new Gg(e, t) : this.processor = new Ug(e, t), !this.processor)
      throw new Error("Failed to create a diff processor");
    return this.processing = [
      this.processor.changeInstance,
      this.processor.addInstance,
      this.processor.removeInstance
    ], this.processing;
  }
}
const { max: $g } = Math, _n = ve("performance");
class Wg extends cs {
  constructor(e, t) {
    super(e, t), this.allBufferLocations = {}, this.availableLocations = [], this.currentInstancedCount = 0, this.instanceToBufferLocation = {}, this.maxInstancedCount = 1e3, this.blockSubAttributesLookup = /* @__PURE__ */ new Map(), this.attributeToPropertyIds = /* @__PURE__ */ new Map(), this.updateAllPropertyIdList = [], this.activePropertyId = -1, this.currentAvailableLocation = -1, this.remove = (n) => {
      const s = this.instanceToBufferLocation[n.uid];
      return s && (delete this.instanceToBufferLocation[n.uid], this.availableLocations.push(s)), n;
    }, this.add = this.doAddWithRegistration;
  }
  /**
   * This is the tail end of processing changes and lets us clean up anything that might have been used to aid in the
   * processing.
   */
  changesProcessed() {
    super.changesProcessed(), this.availableLocations.splice(0, this.currentAvailableLocation + 1), this.currentAvailableLocation = -1;
  }
  /**
   * First instance to be added to this manager will be heavily analyzed for used observables per attribute.
   */
  doAddWithRegistration(e) {
    this.layer.shaderIOInfo.instanceAttributes.forEach((n) => {
      if (n.parentAttribute) return;
      Se.setObservableMonitor(!0), n.update(e);
      const s = Se.getObservableMonitorIds(!0);
      this.attributeToPropertyIds.set(n, [
        s[s.length - 1]
      ]), s.length > 1 && _n(
        "Property has multiple observables. Only the last trigger will be retained as the feature is not complete yet"
      ), n === this.layer.shaderIOInfo.activeAttribute && (this.activePropertyId = s[0]);
    }), Se.setObservableMonitor(!1), this.makeUpdateAllPropertyIdList();
    const t = this.resizeBuffer();
    return this.gatherLocationsIntoGroups(
      t.newLocations,
      t.growth
    ), this.add = this.doAdd, this.doAdd(e);
  }
  /**
   * After the registration add happens, we gear shift over to this add method which will only pair instances
   * with their appropriate buffer location.
   */
  doAdd(e) {
    if (this.availableLocations.length <= 0 || this.currentAvailableLocation >= this.availableLocations.length - 1) {
      const n = this.resizeBuffer();
      this.gatherLocationsIntoGroups(
        n.newLocations,
        n.growth
      );
    }
    const t = this.availableLocations[++this.currentAvailableLocation];
    return t && this.geometry ? (this.instanceToBufferLocation[e.uid] = t, this.currentInstancedCount = this.geometry.maxInstancedCount = $g(
      this.currentInstancedCount,
      // Instance index + 1 because the indices are zero indexed and the maxInstancedCount is a count value
      t.instanceIndex + 1
    ), this.model && (this.model.vertexDrawRange = [
      0,
      this.layer.shaderIOInfo.instanceVertexCount
    ], this.model.drawInstances = this.currentInstancedCount, this.layer.shaderIOInfo.instanceVertexCount === 0 && (this.model.vertexDrawRange[1] = this.model.drawInstances))) : console.error(
      "Add Error: Instance Attribute Buffer Manager failed to pair an instance with a buffer location"
    ), t;
  }
  /**
   * Destroy this manager and clear out all elements utilized within the scene.
   */
  destroy() {
    this.geometry && this.geometry.destroy(), this.material && this.material.dispose(), this.scene && this.scene.container && this.model && this.scene.container.remove(this.model);
  }
  /**
   * This retireves the buffer locations associated with an instance, or returns nothing
   * if the instance has not been associated yet.
   */
  getBufferLocations(e) {
    return this.instanceToBufferLocation[e.uid];
  }
  /**
   * This is the property id of the active attribute.
   */
  getActiveAttributePropertyId() {
    return this.activePropertyId;
  }
  /**
   * This is the bare minimum property ids that, when triggered for update, will
   * update ALL of the attribute buffers for the managed layer.
   */
  getUpdateAllPropertyIdList() {
    return this.updateAllPropertyIdList;
  }
  /**
   * Checks to see if this buffer manager manages the indicated instance
   */
  managesInstance(e) {
    return this.instanceToBufferLocation[e.uid] !== void 0;
  }
  /**
   * Analyzes the list of attributes to the property ids that affects them. This
   * populates the list of minimal property ids needed to trigger updates on all
   * of the attributes.
   */
  makeUpdateAllPropertyIdList() {
    const e = {};
    this.attributeToPropertyIds.forEach((t) => {
      e[t[0]] = t[0];
    }), this.updateAllPropertyIdList = Object.values(
      e
    ).filter(Boolean);
  }
  /**
   * Clears all elements of this manager from the current scene it was in.
   */
  removeFromScene() {
    this.scene && this.scene.container && this.model && this.scene.container.remove(this.model), delete this.scene;
  }
  /**
   * This generates a new buffer of attributes to associate instances with.
   *
   * This method for the attribute packing strategy creates a vertex attribute for each block required.
   * The individual properties are then packed into each of these blocks.
   */
  resizeBuffer() {
    const e = this.layer.shaderIOInfo;
    let t = 0;
    const n = /* @__PURE__ */ new Map();
    if (this.changeListContext) {
      t = this.layer.shaderIOInfo.baseBufferGrowthRate;
      for (let s = 0, r = this.changeListContext.length; s < r; ++s) {
        const o = this.changeListContext[s];
        switch (o[1]) {
          case ge.CHANGE:
          case ge.INSERT:
            this.instanceToBufferLocation[o[0].uid] || t++;
            break;
        }
      }
    }
    if (_n("BEGIN: Resizing packed attribute buffer by %d instances", t), this.geometry) {
      _n(
        `Info: Vertex packing buffer is being resized for layer ${this.layer.id}`
      ), this.geometry.destroy(), this.geometry = new Di();
      const s = this.maxInstancedCount;
      for (const r of e.vertexAttributes)
        r.materialAttribute && this.geometry.addAttribute(
          r.name,
          r.materialAttribute
        );
      this.maxInstancedCount += t, this.attributes = this.attributes || [], this.blockAttributes = this.blockAttributes || [];
      for (let r = 0, o = this.blockAttributes.length; r < o; ++r) {
        const a = this.blockAttributes[r];
        let c = a.bufferAttribute;
        const l = a.size || 0;
        if (c.data instanceof Float32Array) {
          let h = c.data;
          h.length < this.maxInstancedCount * l && (h = new Float32Array(this.maxInstancedCount * l * 2), h.set(c.data, 0)), h.set(c.data, 0);
          const u = new ii(h, l, !0, !0);
          a.bufferAttribute = c = u, this.geometry.addAttribute(a.name, u);
          const d = this.blockSubAttributesLookup.get(r), f = a.size || 0;
          if (d)
            for (let p = 0, g = d.length; p < g; ++p) {
              const m = d[p];
              let v = n.get(
                m.name
              );
              v || (v = [], n.set(
                m.name,
                v
              ));
              const b = this.allBufferLocations[m.name] || [];
              this.allBufferLocations[m.name] = b;
              const w = Object.assign({}, m, {
                uid: U(),
                packUID: a.packUID,
                bufferAttribute: c
              }), y = m.blockIndex || 0, E = m.size || 1;
              let C;
              for (let z = 0, N = b.length; z < N; ++z)
                C = b[z], C.attribute = w, C.buffer.data = h;
              let M, R = v.length;
              const G = this.maxInstancedCount - s;
              v.length += G, b.length += G;
              for (let z = s; z < this.maxInstancedCount; ++z, ++R)
                M = {
                  attribute: w,
                  block: r,
                  buffer: {
                    data: h
                  },
                  instanceIndex: z,
                  start: z * f + y,
                  end: z * f + y + E
                }, v[R] = M, b[z] = M;
            }
        }
      }
    } else {
      this.maxInstancedCount += t, this.geometry = new Di();
      for (const o of e.vertexAttributes)
        o.materialAttribute && this.geometry.addAttribute(
          o.name,
          o.materialAttribute
        );
      this.attributes = [], this.blockAttributes = [];
      const s = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
      this.blockSubAttributesLookup = r;
      for (let o = 0, a = e.instanceAttributes.length; o < a; ++o) {
        const c = e.instanceAttributes[o], l = c.block || 0;
        let h = s.get(l) || 0;
        h = Math.max(
          h,
          (c.blockIndex || 0) + (c.size || 0)
        ), s.set(l, h);
        let u = r.get(l);
        u || (u = [], r.set(l, u)), u.push(c);
      }
      r.forEach(
        (o) => o.sort((a, c) => (a.blockIndex || 0) - (c.blockIndex || 0))
      );
      for (let o = 0, a = s.size; o < a; ++o) {
        const c = s.get(o) || 0, l = U();
        c || console.warn(
          "Instance Attribute Packing Error: The system tried to build an attribute with a size of zero.",
          "These are the attributes used:",
          e.instanceAttributes,
          "These are the block sizes calculated",
          s,
          "This is the block to attribute lookup generated",
          r
        );
        const h = new Float32Array(c * this.maxInstancedCount), u = new ii(h, c, !0, !0);
        this.geometry.addAttribute(`block${o}`, u);
        const d = r.get(o);
        if (d) {
          for (let f = 0, p = d.length; f < p; ++f) {
            const g = d[f];
            let m = n.get(
              g.name
            );
            m || (m = [], n.set(
              g.name,
              m
            ));
            const v = this.allBufferLocations[g.name] || [];
            this.allBufferLocations[g.name] = v;
            const b = Object.assign({}, g, {
              uid: o,
              packUID: l,
              bufferAttribute: u,
              size: c
            }), w = g.blockIndex || 0, y = g.size || 1;
            for (let E = 0; E < this.maxInstancedCount; ++E) {
              const C = {
                attribute: b,
                block: o,
                buffer: {
                  data: h
                },
                instanceIndex: E,
                start: E * c + w,
                end: E * c + w + y
              };
              m.push(C), v.push(C);
            }
            this.attributes.push(b);
          }
          this.blockAttributes.push({
            uid: U(),
            packUID: l,
            bufferAttribute: u,
            name: `block${o}`,
            size: c,
            update: () => [0]
          });
        } else
          console.warn(
            "Instance Attribute Packing Buffer Error: Somehow there are no attributes associated with a block.",
            "These are the attributes used:",
            e.instanceAttributes,
            "These are the block sizes calculated",
            s,
            "This is the block to attribute lookup generated",
            r
          );
      }
      this.geometry.maxInstancedCount = 0, this.material = this.makeLayerMaterial();
      for (let o = 0, a = e.uniforms.length; o < a; ++o) {
        const c = e.uniforms[o];
        c.materialUniforms.push(this.material.uniforms[c.name]);
      }
    }
    return this.scene && this.model && this.scene.container && this.scene.container.remove(this.model), this.material = this.material || this.makeLayerMaterial(), this.model = as(
      this.layer.id,
      this.geometry,
      this.material,
      this.layer.shaderIOInfo.drawMode
    ), this.scene && this.scene.container && this.model && this.scene.container.add(this.model), _n("COMPLETE: Resizing unpacked attribute buffer"), {
      growth: t,
      newLocations: n
    };
  }
  /**
   * This takes newly created buffer locations and groups them by the property ids identified by the
   * registration phase.
   */
  gatherLocationsIntoGroups(e, t) {
    if (this.attributeToPropertyIds.size === 0) return;
    _n("BEGIN: Packed attribute manager grouping new buffer locations");
    const n = [];
    this.attributeToPropertyIds.forEach((s, r) => {
      n.push({
        attribute: r,
        bufferLocationsForAttribute: e.get(r.name) || [],
        childBufferLocations: (r.childAttributes || []).map((o) => ({
          location: e.get(o.name) || [],
          bufferIndex: -1
        })),
        ids: s,
        bufferIndex: -1
      });
    });
    for (let s = 0; s < t; ++s) {
      const r = {
        instanceIndex: -1,
        propertyToBufferLocation: {}
      };
      for (let o = 0, a = n.length; o < a; ++o) {
        const c = n[o], l = c.attribute, h = c.ids, u = c.bufferLocationsForAttribute;
        if (!u) {
          Me(
            "Instance Attribute Buffer Error",
            (f, p) => {
              console.warn(
                `${p}: There is an error in forming buffer location groups in VertexAttributePackingBufferManager. Error count: ${f}`
              );
            }
          );
          continue;
        }
        const d = u[++c.bufferIndex];
        if (!d) {
          Me(
            "Instance Attribute Buffer Error",
            (f, p) => {
              console.warn(
                `${p}: There is an error in forming buffer location groups in VertexAttributePackingBufferManager. Error count: ${f}`
              );
            }
          );
          continue;
        }
        if (r.instanceIndex === -1)
          r.instanceIndex = d.instanceIndex;
        else if (d.instanceIndex !== r.instanceIndex) {
          Me(
            "Instance Attribute Parallelism Error",
            (f, p) => {
              console.warn(
                `${p}: A buffer location does not have a matching instance index which means the buffer locations are not in parallel with each other somehow. Error count: ${f}`
              ), console.warn(l.name, d);
            }
          );
          continue;
        }
        if (l.childAttributes) {
          const f = [];
          for (let p = 0, g = l.childAttributes.length; p < g; ++p) {
            const m = l.childAttributes[p], v = c.childBufferLocations[p];
            if (v) {
              const b = v.location[++v.bufferIndex];
              b ? f.push(b) : Me(
                "Instance Attribute Child Attribute Error",
                (w, y) => {
                  console.warn(
                    `${y}: A child attribute does not have a buffer location available. Error count: ${w}`
                  ), console.warn(
                    `Parent Attribute: ${l.name} Child Attribute: ${m.name}`
                  );
                }
              );
            }
          }
          d.childLocations = f;
        }
        for (let f = 0, p = h.length; f < p; ++f) {
          const g = h[f];
          r.propertyToBufferLocation[g] = d;
        }
      }
      this.availableLocations.push(r);
    }
    _n("COMPLETE: Packed attribute buffer manager buffer location grouping"), Tr();
  }
  /**
   * Returns the total instances this buffer manages.
   */
  getInstanceCount() {
    return this.maxInstancedCount;
  }
}
class jg {
  constructor(e) {
    this.isMouseOver = /* @__PURE__ */ new Set(), this.isMouseDown = /* @__PURE__ */ new Set(), this.isTouchOver = /* @__PURE__ */ new Map(), this.isTouchDown = /* @__PURE__ */ new Map(), this.layer = e;
  }
  /**
   * Retrieves the color picking instance determined for the procedure.
   */
  getColorPickInstance(e) {
    return this.colorPicking && this.layer.picking.type === H.SINGLE && this.colorPicking.view === e ? this.layer.uidToInstance.get(
      16777215 - this.colorPicking.nearestColor
    ) : null;
  }
  /**
   * Handles mouse down gestures for a layer within a view
   */
  handleMouseOver(e, t) {
  }
  /**
   * Handles touch down gestures for a layer within a view
   */
  handleTouchOver(e, t, n) {
  }
  /**
   * Handles mouse down gestures for a layer within a view
   */
  handleMouseDown(e, t) {
    if (this.layer.picking && this.layer.picking.type !== H.NONE) {
      const { onMouseDown: n } = this.layer.props;
      if (n) {
        const s = e.projection.screenToWorld(
          t.screen.position
        ), r = [];
        if (this.layer.picking.type === H.SINGLE) {
          const a = this.getColorPickInstance(e);
          a && r.push(a);
        }
        const o = {
          interaction: t,
          instances: r,
          layer: this.layer.id,
          projection: e.projection,
          screen: t.screen.position,
          world: s
        };
        n(o), this.isMouseDown.clear(), r.forEach((a) => this.isMouseDown.add(a));
      }
    }
  }
  /**
   * Handles touch events for instances for layers
   */
  handleTouchDown(e, t, n) {
    const { onTouchDown: s, onTouchOver: r } = this.layer.props;
    if (!this.layer.picking || this.layer.picking.type === H.NONE || !s && !r)
      return;
    const o = e.projection.screenToWorld(n.screen.position), a = [];
    if (this.layer.picking.type === H.SINGLE) {
      const u = this.getColorPickInstance(e);
      u && a.push(u);
    }
    const c = {
      interaction: t,
      touch: n,
      instances: a,
      layer: this.layer.id,
      projection: e.projection,
      screen: n.screen.position,
      world: o
    }, l = cn(
      this.isTouchDown,
      n.touch.touch.identifier,
      () => /* @__PURE__ */ new Set()
    ), h = cn(
      this.isTouchOver,
      n.touch.touch.identifier,
      () => /* @__PURE__ */ new Set()
    );
    a.forEach((u) => {
      l.add(u), h.add(u);
    }), r && r(c), s && s(c);
  }
  /**
   * Handles mouse out events for a layer within the view
   */
  handleMouseOut(e, t) {
    if (this.layer.picking && this.layer.picking.type !== H.NONE) {
      const { onMouseOut: n } = this.layer.props;
      if (n) {
        const s = e.projection.screenToWorld(
          t.screen.position
        ), r = {
          interaction: t,
          instances: Array.from(this.isMouseOver.keys()),
          layer: this.layer.id,
          projection: e.projection,
          screen: t.screen.position,
          world: s
        };
        n(r);
      }
    }
    this.isMouseOver.clear();
  }
  /**
   * Handles touch events that have been dragged off of a view
   */
  handleTouchOut(e, t, n) {
    const { onTouchOut: s } = this.layer.props;
    if (!this.layer.picking || this.layer.picking.type === H.NONE || !s)
      return;
    const r = e.projection.screenToWorld(n.screen.position), o = {
      interaction: t,
      touch: n,
      instances: Array.from(this.isMouseOver.keys()),
      layer: this.layer.id,
      projection: e.projection,
      screen: n.screen.position,
      world: r
    };
    s(o), this.isTouchOver.delete(n.touch.touch.identifier);
  }
  /**
   * Handles mouse up gestures for the layer within the provided view
   */
  handleMouseUp(e, t) {
    const { onMouseUp: n, onMouseUpOutside: s } = this.layer.props;
    if (!this.layer.picking || this.layer.picking.type === H.NONE || !n)
      return;
    const r = e.projection.screenToWorld(t.screen.position), o = [];
    if (this.layer.picking.type === H.SINGLE) {
      const c = this.getColorPickInstance(e);
      c && o.push(c);
    }
    let a = {
      interaction: t,
      instances: o,
      layer: this.layer.id,
      projection: e.projection,
      screen: t.screen.position,
      world: r
    };
    n(a), o.forEach((c) => this.isMouseDown.delete(c)), !(this.isMouseDown.size <= 0 || !s) && (a = {
      interaction: t,
      instances: Array.from(this.isMouseDown.values()),
      layer: this.layer.id,
      projection: e.projection,
      screen: t.screen.position,
      world: r
    }, s(a));
  }
  /**
   * Handles touch up events that occur over a view
   */
  handleTouchUp(e, t, n) {
    const { onTouchUp: s, onTouchUpOutside: r, onTouchOut: o, onTouchAllEnd: a } = this.layer.props;
    if (!this.layer.picking || this.layer.picking.type === H.NONE || !s && !r && !o && !a)
      return;
    const c = e.projection.screenToWorld(n.screen.position), l = [];
    if (this.layer.picking.type === H.SINGLE) {
      const d = this.getColorPickInstance(e);
      d && l.push(d);
    }
    let h = {
      interaction: t,
      touch: n,
      instances: l,
      layer: this.layer.id,
      projection: e.projection,
      screen: n.screen.position,
      world: c
    };
    o && o(h), s && s(h);
    const u = Hr(
      this.isTouchDown,
      n.touch.touch.identifier,
      /* @__PURE__ */ new Set()
    );
    l.forEach((d) => u.delete(d)), u.size > 0 && r && (h = {
      interaction: t,
      touch: n,
      instances: Array.from(u.values()),
      layer: this.layer.id,
      projection: e.projection,
      screen: n.screen.position,
      world: c
    }, r(h)), this.isTouchDown.delete(n.touch.touch.identifier), this.isTouchDown.size <= 0 && a && (h = {
      interaction: t,
      touch: n,
      instances: [],
      layer: this.layer.id,
      projection: e.projection,
      screen: n.screen.position,
      world: c
    }, a(h));
  }
  /**
   * Mouse move events on the layer will detect when instances have their item
   * newly over or just moved on
   */
  handleMouseMove(e, t) {
    const { onMouseOver: n, onMouseMove: s, onMouseOut: r } = this.layer.props;
    if (this.layer.picking && this.layer.picking.type !== H.NONE && (n || s || r)) {
      let o;
      const a = e.projection.screenToWorld(
        t.screen.position
      ), c = [];
      if (this.layer.picking.type === H.SINGLE) {
        const h = this.getColorPickInstance(e);
        h && c.push(h);
      }
      const l = /* @__PURE__ */ new Set();
      if (c.forEach((h) => l.add(h)), r) {
        const h = [];
        this.isMouseOver.forEach((u) => {
          l.has(u) || h.push(u);
        }), o = {
          interaction: t,
          instances: h,
          layer: this.layer.id,
          projection: e.projection,
          screen: t.screen.position,
          world: a
        }, h.length > 0 && r(o);
      }
      if (n) {
        const h = c.filter(
          (u) => !this.isMouseOver.has(u)
        );
        o = {
          interaction: t,
          instances: h,
          layer: this.layer.id,
          projection: e.projection,
          screen: t.screen.position,
          world: a
        }, h.length > 0 && n(o);
      }
      s && (o = {
        interaction: t,
        instances: c,
        layer: this.layer.id,
        projection: e.projection,
        screen: t.screen.position,
        world: a
      }, s(o)), this.isMouseOver = l;
    }
  }
  /**
   * Handles touches that are moving along the screen
   */
  handleTouchMove(e, t, n) {
    const { onTouchOver: s, onTouchMove: r, onTouchOut: o } = this.layer.props;
    if (this.layer.picking && this.layer.picking.type !== H.NONE && (s || r || o)) {
      let a;
      const c = e.projection.screenToWorld(n.screen.position), l = [];
      if (this.layer.picking.type === H.SINGLE) {
        const d = this.getColorPickInstance(e);
        d && l.push(d);
      }
      const h = Hr(
        this.isTouchOver,
        n.touch.touch.identifier,
        /* @__PURE__ */ new Set()
      ), u = /* @__PURE__ */ new Set();
      if (l.forEach((d) => u.add(d)), o) {
        const d = [];
        h.forEach((f) => {
          u.has(f) || d.push(f);
        }), a = {
          interaction: t,
          touch: n,
          instances: d,
          layer: this.layer.id,
          projection: e.projection,
          screen: n.screen.position,
          world: c
        }, d.length > 0 && o(a);
      }
      if (s) {
        const d = l.filter((f) => !h.has(f));
        a = {
          interaction: t,
          touch: n,
          instances: d,
          layer: this.layer.id,
          projection: e.projection,
          screen: n.screen.position,
          world: c
        }, d.length > 0 && s(a);
      }
      r && (a = {
        interaction: t,
        touch: n,
        instances: l,
        layer: this.layer.id,
        projection: e.projection,
        screen: n.screen.position,
        world: c
      }, r(a)), this.isMouseOver = u;
    }
  }
  /**
   * Handles click gestures on the layer within a view
   */
  handleMouseClick(e, t) {
    if (this.layer.picking && this.layer.picking.type !== H.NONE) {
      const { onMouseClick: n } = this.layer.props;
      if (n) {
        const s = e.projection.screenToWorld(
          t.screen.position
        ), r = [];
        if (this.layer.picking.type === H.SINGLE) {
          const a = this.getColorPickInstance(e);
          a && r.push(a);
        }
        const o = {
          interaction: t,
          instances: r,
          layer: this.layer.id,
          projection: e.projection,
          screen: t.screen.position,
          world: s
        };
        n(o);
      }
    }
  }
  /**
   * Handles tap interactions with the view
   */
  handleTap(e, t, n) {
    if (this.layer.picking && this.layer.picking.type !== H.NONE) {
      const { onTap: s } = this.layer.props;
      if (s) {
        const r = e.projection.screenToWorld(n.screen.position), o = [];
        if (this.layer.picking.type === H.SINGLE) {
          const c = this.getColorPickInstance(e);
          c && o.push(c);
        }
        const a = {
          interaction: t,
          touch: n,
          instances: o,
          layer: this.layer.id,
          projection: e.projection,
          screen: n.screen.position,
          world: r
        };
        s(a);
      }
    }
  }
  /**
   * Handles drag gestures for the layer within the view
   */
  handleMouseDrag(e, t) {
  }
}
const Br = ve("performance"), rr = class rr extends hn {
  constructor(e, t, n) {
    super(n), this.animationEndTime = 0, this.alwaysDraw = !1, this.depth = 0, this._easingManager = {
      easingComplete: new He(),
      complete: () => this._easingManager.easingComplete.promise
    }, this.lastFrameTime = 0, this.needsViewDrawn = !1, this.picking = {
      currentPickMode: H.NONE,
      type: H.SINGLE,
      uidToInstance: /* @__PURE__ */ new Map()
    }, this.resource = Qp, this.shaderIOInfo = {}, this.streamChanges = {
      locked: !1,
      streamIndex: 0
    }, this._uid = U(), this.uidToInstance = /* @__PURE__ */ new Map(), this.willRebuildLayer = !1, this.surface = e, this.scene = t, this.props = Object.assign({}, rr.defaultProps || {}, n);
  }
  /**
   * This matches an instance to the data buffers and positions to stream to the
   * GPU for direct updates. Use setBufferManager to change this element.
   */
  get bufferManager() {
    return this._bufferManager;
  }
  /** This is the determined buffering strategy of the layer */
  get bufferType() {
    return this._bufferType || ie.INSTANCE_ATTRIBUTE;
  }
  get easingManager() {
    return this._easingManager;
  }
  /** A uid provided to the layer to give it some uniqueness as an object */
  get uid() {
    return this._uid;
  }
  /**
   * Generates a reference object that can be used to retrieve layer specific
   * metrics associated with the layer.
   */
  static createRef() {
    return {
      easing: null
    };
  }
  /**
   * Validates the shader initialization object from the layer.
   */
  validateShaderIO(e) {
    if (!e)
      return this.picking && (this.picking.type = H.NONE), Br(
        "Shell layer initialized. Nothing will be rendered for this layer",
        this.id
      ), !0;
    if (!e.fs || !e.vs)
      return console.warn(
        "Layer needs to specify the fragment and vertex shaders:",
        this.id
      ), !1;
  }
  /**
   * Performs clean ups on the data provided by the layer for the Shader
   * Initialization to make it easier and more reliable to work with when
   * processing.
   */
  cleanShaderIOElements(e) {
    e.instanceAttributes = (e.instanceAttributes || []).filter(
      se
    ), e.vertexAttributes = (e.vertexAttributes || []).filter(
      se
    ), e.uniforms = (e.uniforms || []).filter(se);
  }
  /**
   * When the layer declares it's shader intiialization, it can specify multiple
   * fragment shader fragments each with their own output target type. We do NOT
   * allow two fragments to point to the same type. This performs a thorough
   * check to ensure that does not happen.
   */
  checkForDuplicateOutputTypes(e) {
    let { mapOutput: t } = this.props;
    Li(e.fs) && (e.fs = [
      {
        outputType: V.COLOR,
        source: e.fs
      }
    ]), t = t || {};
    const n = /* @__PURE__ */ new Set();
    let s = !1, r = Number.MIN_SAFE_INTEGER;
    for (let o = 0, a = e.fs.length; o < a; ++o) {
      const c = e.fs[o], l = t[c.outputType];
      if (l === void 0) {
        n.has(c.outputType) && (s = !0), n.add(c.outputType);
        continue;
      }
      l === V.NONE ? c.outputType = r++ : c.outputType = l, n.has(c.outputType) && (s = !0), n.add(c.outputType);
    }
    if (s)
      return console.warn("Layer has duplicate fragment shader output types"), !1;
  }
  /**
   * Processes the fragment outputs a layer provides against each view and
   * generates a merged fragment shader with those fragments optimized for each
   * view.
   */
  processFragmentShadersForEachView(e, t) {
    Li(e.fs) && (e.fs = [
      {
        outputType: V.COLOR,
        source: e.fs
      }
    ]);
    const n = this.picking.type === H.SINGLE && !e.fs.find(
      (a) => a.outputType === V.PICKING
    );
    if (this.picking.type === H.SINGLE && !n)
      throw new Error(
        "Do NOT specify picking prop on a layer when you have your own Picking output declared."
      );
    const s = {
      outputType: V.PICKING,
      source: Yp
    }, r = /* @__PURE__ */ new Map(), o = {
      fs: /* @__PURE__ */ new Map(),
      vs: /* @__PURE__ */ new Map(),
      destructure: /* @__PURE__ */ new Map()
    };
    for (let a = 0, c = t.length; a < c; ++a) {
      const l = t[a];
      if (n) {
        const p = e.fs.findIndex(
          (g) => g.outputType === V.PICKING
        );
        p > -1 && e.fs.splice(p, 1);
      }
      const h = l.getOutputTargets();
      let u = 0;
      e.fs.forEach((p, g) => {
        h != null && h.find(
          (m) => m.outputType === p.outputType
        ) && (u = g);
      }), n && e.fs.splice(u + 1, 0, s);
      let d = cn(o.fs, l, /* @__PURE__ */ new Map());
      d || (d = /* @__PURE__ */ new Map(), o.fs.set(l, d));
      const f = Za.makeOutputFragmentShader(
        o.vs,
        d,
        h,
        e.fs
      );
      f && r.set(l, f);
    }
    return r.size === 0 ? (console.warn(
      "Could not generate output fragment shaders for the view specified."
    ), !1) : { outputFragmentShaders: r, declarations: o };
  }
  /**
   * This performs the actual generation of the vertex and fragment shaders this
   * layer will use. Each fragment shader is now associated with it's respective
   * view and will be generated accordingly.
   */
  processLayerShaders(e, t, n) {
    let s = null;
    if (s = new Za().process(
      this,
      e,
      t,
      n,
      this.surface.getIOExpanders(),
      this.surface.getShaderTransforms(),
      this.surface.getIOSorting()
    ), !s)
      return console.warn(
        "The shader processor did not produce metrics for the layer."
      ), !1;
    this.shaderIOInfo = Object.assign(
      {
        // This is a filler active attribute. It gets replaced.
        activeAttribute: {
          name: "active",
          size: S.ONE,
          update: (r) => [r.active ? 1 : 0]
        },
        baseBufferGrowthRate: e.baseBufferGrowthRate === void 0 ? 1e3 : e.baseBufferGrowthRate,
        instancing: e.instancing === void 0 ? !0 : e.instancing,
        instanceAttributes: s.instanceAttributes,
        instanceVertexCount: e.vertexCount,
        vs: s.vs,
        fs: s.fs,
        materialUniforms: s.materialUniforms,
        maxInstancesPerBuffer: s.maxInstancesPerBuffer,
        drawMode: e.drawMode || x.Model.DrawMode.TRIANGLE_STRIP,
        uniforms: s.uniforms,
        vertexAttributes: s.vertexAttributes,
        indexBuffer: s.indexBuffer
      },
      this.shaderIOInfo
    );
  }
  /**
   * Processes the static vertex information and applies GL Attributes for each
   * item.
   */
  processVertexAttributes(e) {
    Rg(
      this,
      this.shaderIOInfo.maxInstancesPerBuffer,
      this.shaderIOInfo.vertexAttributes,
      e.vertexCount,
      this.shaderIOInfo.indexBuffer
    );
  }
  /**
   * This does special initialization by gathering the layers shader IO,
   * generates a material and injects special automated uniforms and attributes
   * to make instancing work for the shader.
   */
  init(e) {
    if (!this.surface.gl)
      return console.warn("The layer's surface does not have a valid WebGL context."), !1;
    const { picking: t = H.NONE } = this.props;
    t === H.SINGLE ? this.picking = {
      currentPickMode: H.NONE,
      type: H.SINGLE,
      uidToInstance: /* @__PURE__ */ new Map()
    } : this.picking = {
      currentPickMode: H.NONE,
      type: H.NONE
    }, this.resource = this.surface.resourceManager;
    const n = this.initShader();
    this.interactions = new jg(this);
    const s = this.validateShaderIO(n);
    if (s !== void 0) return s;
    if (!n) return !1;
    let r;
    return this.surface.getShaderTransforms().forEach((a) => {
      n.vs = a.rawVertex(n.vs), n.fs = a.rawFragment(n.fs);
    }), r = this.cleanShaderIOElements(n), Hi(r) || (r = this.checkForDuplicateOutputTypes(n), Hi(r)) || (r = this.processFragmentShadersForEachView(n, e), Hi(r)) || (r = this.processLayerShaders(
      n,
      r.outputFragmentShaders,
      r.declarations
    ), Hi(r)) || (r = this.processVertexAttributes(n), Hi(r)) || (r = this.makeLayerBufferManager(this.surface.gl, this.scene, n), Hi(r)) || (r = this.updateDiffHandlers(), Hi(r)) ? r : (this.layerShaderDebugging(), this.props.ref && (this.props.ref.easing = this.easingManager), !0);
  }
  layerShaderDebugging() {
    this.props.printShader && (console.warn(
      `Layer: ${this.props.key}`,
      `
Shader Configuration:`,
      this.shaderIOInfo
    ), console.warn(`VERTEX SHADER
`), console.warn(`
${this.shaderIOInfo.vs}`), this.shaderIOInfo.fs.forEach((e, t) => {
      console.warn(
        `FRAGMENT SHADER:
`,
        `view: ${t.id}):
Output Targets${JSON.stringify(
          e.outputNames
        )}
${JSON.stringify(e.outputTypes)}
`
      ), console.warn(`
${e.source}`);
    }));
  }
  /**
   * This establishes basic modules required by the layer for the shaders. At
   * it's core functionality, it will support the basic properties a layer has
   * to provide, such as Picking modes
   */
  baseShaderModules(e) {
    const t = [], n = [];
    return t.push("instancing"), this.picking.type === H.SINGLE && t.push("picking"), (e.instanceAttributes || []).find(
      (r) => !!(r && r.easing)
    ) && t.push("frame"), {
      fs: n,
      vs: t
    };
  }
  /**
   * This provides a means for a layer to have child layers that are injected
   * immediately after this layer.
   *
   * This essentially lets composite layer management occur allowing the
   * compositer to behave as a layer does but have layers managed by it. This
   * has the advantage of allowing a composition layer able to handle a data
   * provider but split it's processing across it's own internal data providers
   * which is thus picked up by it's child layers and output by the layers.
   */
  childLayers() {
    return [];
  }
  /**
   * Invalidate and free all resources assocated with this layer.
   */
  destroy() {
    this.bufferManager && (this.bufferManager.scene && this.bufferManager.scene.removeLayer(this), this.bufferManager.removeFromScene(), this.bufferManager.destroy());
  }
  /**
   * Lifecycle method for layers to inherit that executes after the props for
   * the layer have been updated
   */
  didUpdateProps() {
  }
  /**
   * This is where global uniforms should update their values. Executes every
   * frame.
   */
  draw() {
    this.updateStreamLock();
    const e = this.getChangeList();
    e.length > 0 && (this.needsViewDrawn = !0);
    let t, n, s;
    const r = this.diffManager;
    if (!r || !this.bufferManager) return;
    const o = r.processing, a = r.processor;
    if (!a) {
      console.warn(
        "A layer is atttempting to draw without a diff processor for analyzing changes."
      );
      return;
    }
    a.incomingChangeList(e), this.bufferManager.incomingChangeList(e);
    for (let c = 0, l = e.length; c < l; ++c)
      t = e[c], n = t[0], s = this.bufferManager.getBufferLocations(n), o == null || o[t[1]](
        a,
        n,
        Object.values(t[2]),
        s
      ), n.changes = {};
    a.commit(), this.bufferManager.changesProcessed(), this.updateEasingManager(), this.updateUniforms();
  }
  /**
   * This handles updating our easingManager so references can properly react to
   * easing completion times.
   */
  updateEasingManager() {
    if (this.props.streamChanges) {
      if (!this.streamChanges.stream || this.streamChanges.stream.length <= 0) {
        const e = this._easingManager.easingComplete;
        this._easingManager.easingComplete = new He(), ki(() => {
          e.resolve();
        }, this.animationEndTime - this.surface.frameMetrics.currentTime);
      }
    } else {
      const e = this._easingManager.easingComplete;
      this._easingManager.easingComplete = new He(), ki(() => {
        e.resolve();
      }, this.animationEndTime - this.surface.frameMetrics.currentTime);
    }
  }
  /**
   * This gets the next changes that should be retrieved from a change stream. A
   * stream is when changes are streamed in batches instead of committing all
   * changes in a single update.
   */
  getNextStreamChanges() {
    let e;
    const {
      streamChanges: t = {
        count: 1e4,
        strategy: kr.LINEAR
      }
    } = this.props, { stream: n = [], streamIndex: s } = this.streamChanges;
    switch (t.count === void 0 && (t.count = 1e4), t.count <= 0 && (t.count = Number.MAX_SAFE_INTEGER), t.strategy) {
      // Linear just pulls out changes as they came in
      case kr.LINEAR:
      default: {
        e = n.slice(s, s + t.count), this.streamChanges.streamIndex += t.count;
        break;
      }
    }
    return this.streamChanges.stream && this.streamChanges.streamIndex >= this.streamChanges.stream.length && delete this.streamChanges.stream, e;
  }
  /**
   * This checks the status of the stream and determines if this layer is locked
   * into a stream or is done processing the stream.
   */
  updateStreamLock() {
    this.streamChanges.locked = !!(this.streamChanges.stream && this.streamChanges.streamIndex < this.streamChanges.stream.length);
  }
  /**
   * This gets the next instance changes to push to the GPU.
   */
  getChangeList() {
    let e;
    return this.streamChanges.locked ? e = this.getNextStreamChanges() : this.props.streamChanges ? (this.streamChanges.streamIndex = 0, this.streamChanges.locked = !0, this.streamChanges.stream = this.props.data.changeList, e = [], this.props.data.resolve(this.id)) : (e = this.props.data.changeList, this.props.data.resolve(this.id)), this.updateStreamLock(), e;
  }
  /**
   * This retrieves the observable IDs for instance observable properties. This
   * triggers a getter of the indicated property.
   *
   * Do NOT use this in intensive loops, try to cache these results where
   * possible.
   */
  getInstanceObservableIds(e, t) {
    const n = {};
    for (let s = 0, r = t.length; s < r; ++s) {
      Se.setObservableMonitor(!0), e[t[s]];
      const o = Se.getObservableMonitorIds(!0);
      o[0] !== void 0 && (n[t[s]] = o[0]);
    }
    return Se.setObservableMonitor(!1), n;
  }
  /**
   * The options for a GL Material without uniforms.
   */
  getMaterialOptions() {
    return {};
  }
  /**
   * This sets up all of the data bindings that will transport data from the CPU
   * to the Shader on the GPU.
   *
   * Instance Attributes: These are very frequently changing attributes
   * Vertex Attributes: These are attributes that should be static on a vertex.
   *                    Conisder it very costly to update. The only time making
   *                    these modifieable is in the event of GL_POINTS.
   * Uniforms: These set up the uniforms for the layer, thus having all normal
   *           implications of a uniform. Global across the fragment and vertex
   *           shaders and can be modified with little consequence.
   *
   * NOTE: Return null to indicate this layer is not going to render anything.
   * This is typical for parent layers that manage child layers who themselves
   * do not cause rendering of any sort.
   */
  initShader() {
    return {
      instancing: !0,
      baseBufferGrowthRate: 1e3,
      fs: "${import: no-op}",
      instanceAttributes: [],
      uniforms: [],
      vertexAttributes: [],
      vertexCount: 0,
      vs: "${import: no-op}"
    };
  }
  /**
   * Indicates if this layer is managing an instance or not. This is normally
   * done by determining if this layer's buffer manager has assigned buffer
   * space to the instance. In special layer cases this may be overridden here
   * to make the assertion in some other way.
   */
  managesInstance(e) {
    return se(this.bufferManager) && this.bufferManager.managesInstance(e);
  }
  /**
   * This method determines the buffering strategy that the layer should be
   * utilizing based on provided vertex and instance attributes.
   */
  getLayerBufferType(e, t, n, s) {
    let r = ie.UNIFORM, o = 0;
    if (this._bufferType !== void 0)
      return this._bufferType;
    if (O.HARDWARE_INSTANCING) {
      for (let a = 0, c = n.length; a < c; ++a) {
        const l = n[a];
        o += Math.ceil(l.size / 4);
      }
      for (let a = 0, c = s.length; a < c; ++a) {
        const l = s[a];
        o += Math.ceil(
          Jh[l.size || 1] / 4
        );
      }
      if (o > O.MAX_VERTEX_ATTRIBUTES) {
        o = 0;
        for (let a = 0, c = s.length; a < c; ++a) {
          const l = s[a];
          o = Math.max(o, l.block || 0);
        }
        for (let a = 0, c = n.length; a < c; ++a) {
          const l = n[a];
          o += Math.ceil(l.size / 4);
        }
        o < O.MAX_VERTEX_ATTRIBUTES && (r = t.instancing === !1 ? ie.VERTEX_ATTRIBUTE_PACKING : ie.INSTANCE_ATTRIBUTE_PACKING, Br(
          `Performance Issue (Moderate):
            Layer %o is utilizing too many vertex attributes and is now using vertex packing.
            Max Vertex units %o
            Used Vertex units %o
            Instance Attributes %o
            Vertex Attributes %o`,
          this.id,
          O.MAX_VERTEX_ATTRIBUTES,
          o,
          s,
          n
        ));
      } else
        r = t.instancing === !1 ? ie.VERTEX_ATTRIBUTE : ie.INSTANCE_ATTRIBUTE;
    }
    return r === ie.UNIFORM && (Br(
      `Performance Issue (High):
        Layer %o is utilizing too many vertex attributes and is now using a uniform buffer.
        Max Vertex units %o
        Used Vertex units %o
        Instance Attributes %o
        Vertex Attributes %o`,
      this.id,
      O.MAX_VERTEX_ATTRIBUTES,
      o,
      s,
      n
    ), r = ie.UNIFORM), this.setBufferType(r), r;
  }
  /**
   * This generates the buffer manager to be used to manage instances getting
   * applied to attribute locations.
   */
  makeLayerBufferManager(e, t, n) {
    switch (this.getLayerBufferType(
      e,
      n,
      this.shaderIOInfo.vertexAttributes,
      this.shaderIOInfo.instanceAttributes
    )) {
      case ie.INSTANCE_ATTRIBUTE: {
        this.setBufferManager(new Og(this, t));
        break;
      }
      case ie.INSTANCE_ATTRIBUTE_PACKING: {
        this.setBufferManager(
          new Ng(this, t)
        );
        break;
      }
      case ie.VERTEX_ATTRIBUTE: {
        this.setBufferManager(new zg(this, t));
        break;
      }
      case ie.VERTEX_ATTRIBUTE_PACKING: {
        this.setBufferManager(
          new Wg(this, t)
        );
        break;
      }
      // Anything not utiliziing a specialized buffering strategy will use the
      // uniform compatibility mode
      default: {
        this.setBufferManager(new Bg(this, t));
        break;
      }
    }
  }
  /**
   * This checks the state of the layer and determines how it should handle it's
   * diff event handlers
   */
  updateDiffHandlers() {
    (this.shaderIOInfo.instanceAttributes || []).find(
      (t) => !!(t && t.easing)
    ) ? this.picking.type === H.SINGLE ? (this.onDiffAdd = this.handleDiffAddWithPickingAndEasing, this.onDiffRemove = this.handleDiffRemoveWithPickingAndEasing) : (this.onDiffAdd = this.handleDiffAddWithEasing, this.onDiffRemove = this.handleDiffRemoveWithEasing) : this.picking.type === H.SINGLE && (this.onDiffAdd = this.handleDiffAddWithPicking, this.onDiffRemove = this.handleDiffRemoveWithPicking);
  }
  /**
   * This is the default implementation for onDiffManagerAdd that gets applied
   * if easing is present in the layer's IO.
   */
  handleDiffAddWithEasing(e) {
    e.easingId = this.easingId;
  }
  /**
   * Handles diff manager add operations when the layer has picking enabled
   */
  handleDiffAddWithPicking(e) {
    this.uidToInstance.set(e.uid, e);
  }
  /**
   * Handles diff manager add operations when the layer has picking AND easing
   * enabled
   */
  handleDiffAddWithPickingAndEasing(e) {
    this.uidToInstance.set(e.uid, e), e.easingId = this.easingId;
  }
  /**
   * This is the default implementation for onDiffManagerRemove that gets
   * applied if easing is present in the layer's IO
   */
  handleDiffRemoveWithEasing(e) {
    e.easing && delete e.easing, delete e.easingId;
  }
  /**
   * Handles diff manager remove operations when the layer has picking enabled
   */
  handleDiffRemoveWithPicking(e) {
    this.uidToInstance.delete(e.uid);
  }
  /**
   * Handles diff manager remove operations when the layer has picking AND
   * easing enabled
   */
  handleDiffRemoveWithPickingAndEasing(e) {
    this.uidToInstance.delete(e.uid), e.easing && delete e.easing, delete e.easingId;
  }
  /**
   * This tells the framework to rebuild the layer from scratch, thus
   * reconstructing the shaders and geometries of the layer.
   */
  rebuildLayer() {
    if (this.willRebuildLayer = !0, this.children)
      for (let e = 0, t = this.children.length; e < t; ++e)
        this.children[e].rebuildLayer();
  }
  /**
   * Retrieves the changes from the data provider and resolves the provider.
   * This should be used by sub Layer classes that wish to create their own
   * custom draw handlers.
   *
   * Set preserverProvider to true to let the system know the provider's changes
   * are still required.
   */
  resolveChanges(e) {
    const t = this.props.data.changeList;
    t.length > 0 && (this.needsViewDrawn = !0), e || this.props.data.resolve(this.id);
    for (let n = 0, s = t.length; n < s; ++n)
      t[n][0].changes = {};
    return t;
  }
  /**
   * Applies a buffer manager to the layer which handles instance changes and
   * applies those changes to an appropriate buffer at the appropriate location.
   */
  setBufferManager(e) {
    this._bufferManager ? console.warn(
      "You can not change a layer's buffer strategy once it has been instantiated."
    ) : (this._bufferManager = e, this.diffManager = new Vg(), this.diffManager.makeProcessor(this, e));
  }
  /**
   * Only allows the buffer type to be set once
   */
  setBufferType(e) {
    this._bufferType === void 0 ? this._bufferType = e : console.warn(
      "You can not change a layers buffer strategy once it has been instantiated."
    );
  }
  /**
   * This method returns a flag indicating whether or not the layer should
   * trigger it's view to redraw. By default, a redraw is triggered (this
   * returns true) when a shallow comparison of the current props and the
   * incoming props are different. This method can be overridden to place custom
   * logic at this point to indicate when redraws should happen.
   *
   * NOTE: This should be considered for redraw logic centered around changes in
   * the layer itself. There ARE additional triggers in the system that causes
   * redraws. This method just aids in ensuring necessary redraws take place for
   * layer level logic and props.
   */
  shouldDrawView(e, t) {
    for (const n in t)
      if (t[n] !== e[n]) return !0;
    return !1;
  }
  /**
   * This triggers the layer to update the material uniforms that have been
   * created for the layer. This is primarily used internally.
   */
  updateUniforms() {
    let e, t;
    for (let n = 0, s = this.shaderIOInfo.uniforms.length; n < s; ++n)
      e = this.shaderIOInfo.uniforms[n], t = e.update(e), e.materialUniforms.forEach(
        (r) => r.data = t
      );
  }
  /**
   * Lifecycle: Fires before the props object is updated with the newProps.
   * Allows layer to respond to diff changes.
   */
  willUpdateProps(e) {
    e.picking !== this.props.picking && this.rebuildLayer(), e.ref !== this.props.ref && this.props.ref && (this.props.ref.easing = this.easingManager);
  }
};
rr.defaultProps = {};
let Bt = rr;
const tc = ve("performance"), Zo = class Zo extends hn {
  constructor(e, t) {
    super(t), this.container = new Fr(), this._renderViewCache = null, this.surface = e, this.init(t);
  }
  /** This is all of the layers attached to the scene */
  get layers() {
    return this.layerDiffs.items;
  }
  /**
   * This is all of the views attached to the scene
   */
  get views() {
    return this.viewDiffs.items;
  }
  /**
   * This returns all of the views that are actually going to be rendered in the
   * current frame. This will properly strip any views that are in a chain but
   * not the current item viewed in the chain.
   */
  get renderViews() {
    var s;
    if (this._renderViewCache) return this._renderViewCache;
    const e = /* @__PURE__ */ new Map();
    this.viewDiffs.items.forEach((r) => {
      var a;
      const o = (a = this.viewDiffs.getInitializerByKey(r.id)) == null ? void 0 : a.init[1];
      if (o != null && o.parent) {
        const c = e.get(o.parent) || [];
        c ? c.push(r) : e.set(o.parent, [o.parent, r]);
      } else
        e.get(r) || e.set(r, [r]);
    });
    const t = [], n = ((s = this.surface) == null ? void 0 : s.frameMetrics.currentFrame) ?? 0;
    return e.forEach((r) => {
      t.push(r[n % r.length]);
    }), this._renderViewCache = t, t;
  }
  /**
   * Initialize all that needs to be initialized
   */
  init(e) {
    if (!this.surface || !this.surface.gl) return;
    this.container = new Fr();
    const t = Tg(this.surface.gl);
    this.layerDiffs = new er({
      buildItem: async (n) => {
        if (tc("Building layer", n.key), !this.surface) return null;
        const s = n.init[0], r = n.init[1], o = new s(
          this.surface,
          this,
          Object.assign({}, s.defaultProps, r)
        );
        if (o.initializer = n, o.props.data.sync(), o.parent = r.parent, r.parent && (r.parent.children ? r.parent.children.push(o) : r.parent.children = [o]), !o.init(this.views))
          return console.warn(
            "Error initializing layer:",
            r.key,
            "A layer was unable to be added to the surface. See previous warnings (if any) to determine why they could not be instantiated"
          ), null;
        const a = o.childLayers();
        return this.layerDiffs.inline(a), o;
      },
      destroyItem: async (n, s) => (tc("Destroying layer", n.key), s.destroy(), !0),
      updateItem: async (n, s) => {
        const r = n.init[1];
        if (s.willUpdateProps(r), r.data !== s.props.data && r.data.sync(), s.shouldDrawView(s.props, r) && (s.needsViewDrawn = !0), Object.assign(s.props, r), s.initializer.init[1] = s.props, s.didUpdateProps(), r.parent && s.parent && s.parent !== r.parent) {
          const o = s.parent.children || [], a = o.indexOf(s) || -1;
          a > -1 && o.splice(a, 1);
        }
        s.parent = r.parent, s.willRebuildLayer ? (this.layerDiffs.rebuild(), s.willRebuildLayer = !1) : this.layerDiffs.inline(s.childLayers());
      }
    }), this.viewDiffs = new er({
      buildItem: async (n) => {
        if (this._renderViewCache = null, !this.surface) return null;
        const s = n.init[1], r = n.init[0];
        s.key = n.key;
        const o = new r(this, s);
        o.props = Object.assign({}, s), o.props.camera = o.props.camera || t.camera, o.pixelRatio = this.surface.pixelRatio, o.resource = this.surface.resourceManager, this.surface.userInputManager.waitingForRender = !0;
        const a = n.init[1].chain;
        if (a) {
          const c = a.map((l, h) => ({
            key: `${s.key}-chain-${h}`,
            init: [
              r,
              {
                ...s,
                ...l,
                parent: o,
                // Prevent chain recursion
                chain: void 0,
                key: ""
              }
            ]
          }));
          this.viewDiffs.inline(c);
        }
        return o;
      },
      // No special needs for destroying/removing a view
      destroyItem: async (n, s) => !0,
      // Hand off the initializer to the update of the view
      updateItem: async (n, s) => {
        this._renderViewCache = null;
        const r = n.init[1], o = n.init[0];
        s.willUpdateProps(r), s.previousProps = s.props, s.props = Object.assign({}, s.props, r), s.didUpdateProps(), this.surface && (this.surface.userInputManager.waitingForRender = !0);
        const a = n.init[1].chain;
        if (a) {
          const c = a.map((l, h) => ({
            key: `${r.key}-chain-${h}`,
            init: [
              o,
              {
                ...r,
                ...l,
                parent: s,
                // Prevent chain recursion
                chain: void 0,
                key: ""
              }
            ]
          }));
          this.viewDiffs.inline(c);
        }
      }
    }), this.update(e);
  }
  /**
   * Release any resources this may be hanging onto
   */
  destroy() {
    delete this.container, this.layerDiffs.destroy(), this.viewDiffs.destroy();
  }
  /**
   * Ensures a layer is removed from the scene
   */
  removeLayer(e) {
    if (this.layers) {
      const t = this.layers.indexOf(e);
      if (t >= 0) {
        this.layers.splice(t, 1);
        return;
      }
    }
  }
  /**
   * Hand off the diff objects to our view and layer diffs
   */
  async update(e) {
    this.order = e.order, await this.viewDiffs.diff(e.views), await this.layerDiffs.diff(e.layers), this.viewDiffs.items.forEach((t) => t.createRenderTarget());
  }
  /**
   * Clear caches to ensure the view is up to date.
   */
  clearCaches() {
    this._renderViewCache = null;
  }
};
Zo.DEFAULT_SCENE_ID = "__default__";
let ir = Zo;
var ks = /* @__PURE__ */ ((i) => (i[i.COLOR = 1] = "COLOR", i[i.DEPTH = 2] = "DEPTH", i[i.STENCIL = 4] = "STENCIL", i))(ks || {}), Fs = /* @__PURE__ */ ((i) => (i[i.FRAME_COUNT = 0] = "FRAME_COUNT", i[i.FRAME_SKIP = 1] = "FRAME_SKIP", i[i.UP_TO_TIMESTAMP_INCLUSIVE = 2] = "UP_TO_TIMESTAMP_INCLUSIVE", i[i.UP_TO_TIMESTAMP_EXCLUSIVE = 3] = "UP_TO_TIMESTAMP_EXCLUSIVE", i[i.ON_PROPS_CHANGE = 4] = "ON_PROPS_CHANGE", i[i.ON_TRIGGER = 5] = "ON_TRIGGER", i[i.ALWAYS = 6] = "ALWAYS", i[i.NEVER = 7] = "NEVER", i))(Fs || {});
function Th(i, e) {
  const t = Object.assign(e, {
    key: e.key || "",
    viewport: e.viewport || {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }
  });
  return {
    get key() {
      return e.key || "";
    },
    init: [i, t]
  };
}
const or = class or extends hn {
  constructor(e, t) {
    super(t), this.animationEndTime = 0, this.depth = 0, this.lastFrameTime = 0, this.needsDraw = !1, this.optimizeRendering = !1, this._pixelRatio = 1, this.drawModeInfo = {
      startFrame: 0,
      toFrame: 0,
      tillTimestamp: 0
    }, this.scene = e, this.props = Object.assign({}, or.defaultProps || {}, t);
  }
  /**
   * This is set to ensure the projections that happen properly translates the
   * pixel ratio to normal Web coordinates
   */
  get pixelRatio() {
    return this.props.pixelRatio ?? this._pixelRatio;
  }
  set pixelRatio(e) {
    this._pixelRatio = e;
  }
  get screenBounds() {
    return this.projection.screenBounds;
  }
  set screenBounds(e) {
    this.projection.screenBounds = e;
  }
  get viewBounds() {
    return this.projection.viewBounds;
  }
  set viewBounds(e) {
    this.projection.viewBounds = e;
  }
  /** Retrieves the clearflag prop assigned to the view and provides a default */
  get clearFlags() {
    return this.props.clearFlags || [];
  }
  /** Retrieves the order prop assigned to the view and provides a default */
  get order() {
    return this.props.order || 0;
  }
  /**
   * Retrieves this view's targets for outputting fragment information. This
   * provides a simple list of the target's keys with their output type.
   */
  getOutputTargets() {
    const { output: e } = this.props;
    let t = [];
    return e ? (Nn(e.buffers) || Hs(e.buffers) ? t = [
      {
        outputType: V.COLOR,
        resource: e.buffers
      }
    ] : Object.keys(e.buffers).forEach((n) => {
      const s = Number.parseFloat(n), r = e.buffers[s];
      r && t.push({
        outputType: s,
        resource: r
      });
    }), t) : null;
  }
  /**
   * The view can have one or multiple render targets. This helps by always
   * returning a list containing all of the render targets. Returns an empty
   * list if there is no render target associated with the view.
   */
  getRenderTargets() {
    return this.renderTarget ? [this.renderTarget] : [];
  }
  /**
   * This generates the render target needed to handle the output configuration
   * specified by the props and the layer configuration.
   *
   * This is called by the system and should never need to be called externally.
   */
  createRenderTarget() {
    var u;
    this.renderTarget && (Array.isArray(this.renderTarget) ? this.renderTarget.forEach((d) => d.dispose()) : this.renderTarget.dispose());
    const { output: e } = this.props, t = this.scene.surface;
    if (!e || !t) return;
    const n = /* @__PURE__ */ new Set();
    for (let d = 0, f = this.scene.layers.length; d < f; ++d) {
      const g = (u = this.scene.layers[d].shaderIOInfo.fs) == null ? void 0 : u.get(this);
      g && g.outputTypes.forEach(
        (m) => n.add(m)
      );
    }
    const s = /* @__PURE__ */ new Map(), r = new Bt(t, this.scene, {
      key: "",
      data: new oe()
    }), o = new nt({}), a = this.getOutputTargets() || [];
    for (let d = 0, f = a.length; d < f; ++d) {
      const p = a[d], g = p.resource;
      if (n.has(p.outputType))
        if (Nn(g)) {
          const m = Xs({
            key: p.resource.key
          });
          if (this.resource.request(r, o, m), !m.texture)
            throw console.warn(
              "A view has a RenderTexture output target with key:",
              p.resource.key,
              "however, no RenderTexture was found for the key.",
              "Please ensure you have a 'resource' specified for the Surface with the proper key",
              "Also ensure the resource is made via createTexture()"
            ), new Error(
              `Output target unable to be constructed for view ${this.id}`
            );
          s.set(p.outputType, m.texture);
        } else {
          const m = Gr({
            key: p.resource.key
          });
          if (this.resource.request(r, o, m), !m.colorBuffer)
            throw console.warn(
              "A view has a ColorBuffer output target with key:",
              p.resource.key,
              "however, no ColorBuffer was found for the key.",
              "Please ensure you have a 'resource' specified for the Surface with the proper key",
              "Also ensure the resource is made via createColorBuffer()"
            ), new Error(
              `Output target unable to be constructed for view ${this.id}`
            );
          s.set(p.outputType, m.colorBuffer);
        }
    }
    let c, l;
    s.forEach((d) => {
      var f, p, g;
      if (d instanceof ee) {
        if ((c === void 0 || l === void 0) && (c = ((f = d.data) == null ? void 0 : f.width) || 0, l = ((p = d.data) == null ? void 0 : p.height) || 0), c === 0 || l === 0)
          throw new Error(
            "RenderTexture for View can NOT have a width or height of zero."
          );
        if (((g = d.data) == null ? void 0 : g.width) !== c || d.data.height !== l)
          throw new Error(
            "When a view has multiple output targets: ALL RenderTextures and ColorBuffers that a view references MUST have the same dimensions"
          );
      } else {
        if ((c === void 0 || l === void 0) && (c = d.size[0] || 0, l = d.size[1] || 0), c === 0 || l === 0)
          throw new Error(
            "RenderTexture for View can NOT have a width or height of zero."
          );
        if (d.size[0] !== c || d.size[1] !== l)
          throw new Error(
            "When a view has multiple output targets: ALL RenderTextures and ColorBuffers that a view references MUST have the same dimensions"
          );
      }
    });
    let h;
    if (e.depth)
      if (Nn(e.depth)) {
        const d = Xs({
          key: e.depth.key
        });
        if (this.resource.request(r, o, d), !d.texture)
          throw console.warn(
            "A view has a depth buffer output target with key:",
            e.depth,
            "however, no RenderTexture was found for the key.",
            "Please ensure you have a 'resource' specified for the Surface with the proper key",
            "Also ensure the resource is made via createTexture()"
          ), new Error(
            `Output target unable to be constructed for view ${this.id}`
          );
        h = d.texture;
      } else if (Hs(e.depth)) {
        const d = Gr({
          key: e.depth.key
        });
        if (this.resource.request(r, o, d), !d.colorBuffer)
          throw console.warn(
            "A view has a depth buffer output target with key:",
            e.depth.key,
            "however, no ColorBuffer was found for the key.",
            "Please ensure you have a 'resource' specified for the Surface with the proper key",
            "Also ensure the resource is made via createColorBuffer()"
          ), new Error(
            `Output target unable to be constructed for view ${this.id}`
          );
        h = d.colorBuffer;
      } else
        h = x.RenderTarget.DepthBufferFormat.DEPTH_COMPONENT16;
    if (O.MRT) {
      const d = [];
      s.forEach(
        (f, p) => d.push({
          buffer: f,
          outputType: p
        })
      ), this.renderTarget = new Zi({
        buffers: {
          color: d,
          depth: h
        },
        // Render target texture retention is governed by the resource set up
        // on the surface
        retainTextureTargets: !0
      });
    } else
      throw new Error("MRT for non-MRT systems not supported yet.");
  }
  /**
   * This let's the view do anything it needs to be ready for next render. Some
   * tasks this may include is checking if it's render target is still valid.
   * It's buffer outputs can get invalidated for any number of reasons.
   */
  willUseView() {
    const e = this.getRenderTargets();
    this.props.screenScale && (this.projection.screenScale = this.props.screenScale), e.some(
      (n) => n.getBuffers().some((s) => !!s.buffer.destroyed)
    ) && this.createRenderTarget();
  }
  /*
   * This method returns a flag indicating whether or not the view should
   * trigger a redraw. By default, a redraw is triggered (this returns true)
   * when a shallow comparison of the current props and the incoming props are
   * different. This method can be overridden to place custom logic at this
   * point to indicate when redraws should happen.
   *
   * This is also where the view's drawMode is evaluated to determine if it is
   * time to redraw.
   */
  shouldDrawView(e) {
    var a, c, l, h, u, d, f, p, g, m, v, b;
    let t = !1;
    const n = this.props, s = this.previousProps ?? this.props, r = !this.previousProps || ((a = n.drawMode) == null ? void 0 : a.mode) !== ((c = s.drawMode) == null ? void 0 : c.mode) || ((l = n.drawMode) == null ? void 0 : l.value) !== ((h = s.drawMode) == null ? void 0 : h.value) || ((u = n.drawMode) == null ? void 0 : u.trigger) !== ((d = s.drawMode) == null ? void 0 : d.trigger), o = ((f = n.drawMode) == null ? void 0 : f.mode) ?? 6;
    if (r)
      switch (o) {
        case 0:
          this.drawModeInfo.toFrame = e.currentFrame + (((p = n.drawMode) == null ? void 0 : p.value) || 0);
          break;
        case 1:
          this.drawModeInfo.startFrame = e.currentFrame;
          break;
        case 2:
        case 3:
          this.drawModeInfo.tillTimestamp = ((g = n.drawMode) == null ? void 0 : g.value) || 0;
          break;
      }
    switch (o) {
      case 0:
        t = e.currentFrame <= this.drawModeInfo.toFrame;
        break;
      case 1:
        t = (e.currentFrame - this.drawModeInfo.startFrame) % (((m = n.drawMode) == null ? void 0 : m.value) || 1) === 0;
        break;
      case 2:
        t = this.lastFrameTime <= this.drawModeInfo.tillTimestamp;
        break;
      case 3:
        t = e.currentTime < this.drawModeInfo.tillTimestamp;
        break;
      case 6:
        t = !0;
        break;
      case 7:
        t = !1;
        break;
      case 5:
        t = ((b = (v = n.drawMode) == null ? void 0 : v.trigger) == null ? void 0 : b.call(v, e)) ?? !1;
        break;
      case 4:
        for (const w in n)
          if (n[w] !== s[w]) {
            t = !0;
            break;
          }
        break;
    }
    return t;
  }
  /**
   * Lifecycle: Fires before the props object is updated with the newProps.
   * Allows view to respond to diff changes.
   */
  willUpdateProps(e) {
    this.previousProps = this.props;
  }
  /**
   * Lifecycle: Executes after props have been updated with new contents
   */
  didUpdateProps() {
  }
};
or.defaultProps = {
  key: "",
  camera: zi.makeOrthographic(),
  viewport: { left: 0, right: 0, top: 0, bottom: 0 }
};
let ns = or;
class Hg extends ns {
  constructor() {
    super(new ir(void 0, { key: "error", layers: [], views: [] }), {
      key: "error",
      viewport: {},
      camera: zi.makeOrthographic()
    }), this.projection = new Gu(), this.screenBounds = new Z({
      x: 0,
      y: 0,
      width: 100,
      height: 100
    });
  }
  screenToWorld(e, t) {
    return [0, 0];
  }
  worldToScreen(e, t) {
    return [0, 0];
  }
  viewToWorld(e, t) {
    return [0, 0];
  }
  worldToView(e, t) {
    return [0, 0];
  }
  fitViewtoViewport(e, t) {
    this.screenBounds = e;
  }
}
const Xg = 1e3, Qg = 200, Xt = new Hg();
Xt.fitViewtoViewport(
  new Z({ x: 0, y: 0, width: 100, height: 100 }),
  new Z({ x: 0, y: 0, width: 100, height: 100 })
);
function Yg(i, e) {
  return e.d && i.d ? e.d.depth - i.d.depth : 0;
}
function Dr(i, e) {
  return i.touch.identifier - e.touch.identifier;
}
class qg {
  constructor(e, t, n, s) {
    this.eventManagers = [], this.eventCleanup = [], this._waitingForRender = !0, this.getViewsUnderPosition = (r) => {
      if (!this.quadTree) return [];
      const o = this.quadTree.query(r);
      return o.sort(Yg), o;
    }, this.resize = () => {
      this._waitingForRender = !0;
    }, this.context = e, this.surface = t, this.setControllers(n), this.addContextListeners(s);
  }
  get waitingForRender() {
    return this._waitingForRender;
  }
  set waitingForRender(e) {
    if (this._waitingForRender = e, !e) {
      this.quadTree = new vp(0, 0, 0, 0);
      const t = this.scenes, n = [];
      for (let s = 0, r = t.length; s < r; ++s) {
        const o = t[s];
        for (let a = 0, c = o.views.length; a < c; ++a) {
          const l = o.views[a];
          n.push(l.screenBounds);
        }
      }
      this.quadTree.addAll(n);
    }
  }
  get scenes() {
    return !this.surface || !this.surface.sceneDiffs ? [] : this.surface.sceneDiffs.items;
  }
  /**
   * This sets up the DOM events to listen to the events that are broadcasted by the canvas.
   * These events are set up in such a way as to continue some events when the user
   * drags the mouse off of the browser or off the canvas without releasing.
   */
  addContextListeners(e) {
    this.addMouseContextListeners(e), this.addTouchContextListeners();
  }
  /**
   * Adds all listeners needed to make the mouse interact with the context.
   */
  addMouseContextListeners(e) {
    const t = this.context;
    if (In(t)) return;
    let n, s = !1;
    if (e) {
      const r = (o) => {
        const a = Wt(o, t), c = this.getViewsUnderPosition(a);
        if (c.length <= 0) return;
        n = {
          canClick: !1,
          currentPosition: a,
          deltaPosition: [0, 0],
          previousPosition: a,
          start: a,
          startTime: Date.now(),
          startView: c[0].d,
          event: o,
          wheel: this.makeWheel(o),
          button: -1
        };
        const l = this.makeMouseInteraction(n);
        this.eventManagers.forEach((h) => {
          h.handleWheel(l);
        }), o.stopPropagation(), o.preventDefault();
      };
      "onwheel" in t && (t.onwheel = r), "addEventListener" in t && (t.addEventListener("DOMMouseScroll", r), this.eventCleanup.push(["DOMMouseScroll", r]));
    }
    t.onmouseleave = (r) => {
      if (this.waitingForRender || !n) return;
      const o = Wt(r, t);
      n.deltaPosition = we(
        o,
        n.currentPosition
      ), n.previousPosition = n.currentPosition, n.currentPosition = o;
      const a = this.makeMouseInteraction(n);
      this.eventManagers.forEach((c) => {
        c.handleMouseOut(a);
      });
    }, t.onmousemove = (r) => {
      if (this.waitingForRender) return;
      const o = Wt(r, t);
      if (!n) {
        const c = this.getViewsUnderPosition(o);
        n = {
          canClick: !1,
          currentPosition: o,
          deltaPosition: [0, 0],
          previousPosition: o,
          start: o,
          startTime: Date.now(),
          startView: c[0].d,
          event: r,
          wheel: this.makeWheel(),
          button: -1
        };
      }
      n.deltaPosition = we(
        o,
        n.currentPosition
      ), n.previousPosition = n.currentPosition, n.currentPosition = o, n.canClick = !1;
      const a = this.makeMouseInteraction(n);
      this.eventManagers.forEach((c) => {
        c.handleMouseMove(a);
      }), s = !0;
    }, t.onmousedown = (r) => {
      if (this.waitingForRender) return;
      const o = Wt(r, t), a = this.getViewsUnderPosition(o);
      if (a.length <= 0)
        return;
      n = {
        canClick: !0,
        currentPosition: o,
        deltaPosition: [0, 0],
        previousPosition: o,
        start: o,
        startTime: Date.now(),
        startView: a[0].d,
        event: r,
        wheel: this.makeWheel(),
        button: r.button
      };
      const c = this.makeMouseInteraction(n);
      this.eventManagers.forEach((h) => {
        h.handleMouseDown(c);
      }), r.stopPropagation(), document.onmousemove = (h) => {
        if (!n) return;
        if (!s) {
          const d = Wt(h, t);
          n.deltaPosition = we(
            d,
            n.currentPosition
          ), n.previousPosition = n.currentPosition, n.currentPosition = d, n.canClick = !1;
        }
        const u = this.makeMouseInteraction(n);
        this.eventManagers.forEach((d) => {
          d.handleDrag(u);
        }), h.preventDefault(), h.stopPropagation(), s = !1;
      }, document.onmouseup = (h) => {
        document.onmousemove = null, document.onmouseup = null, document.onmouseover = null, n = void 0;
      }, document.onmouseover = (h) => {
        if (!n) return;
        const u = Wt(h, t);
        n.deltaPosition = we(
          u,
          n.currentPosition
        ), n.previousPosition = n.currentPosition, n.currentPosition = u;
        const d = this.makeMouseInteraction(n);
        this.eventManagers.forEach((f) => {
          f.handleMouseOver(d);
        }), h.stopPropagation();
      }, t.onmouseup = (h) => {
        if (!n) return;
        const u = Wt(h, t);
        n.deltaPosition = we(
          u,
          n.currentPosition
        ), n.previousPosition = n.currentPosition, n.currentPosition = u, n.button = h.button;
        const d = this.makeMouseInteraction(n);
        this.eventManagers.forEach((f) => {
          f.handleMouseUp(d);
        }), n.canClick && Date.now() - n.startTime < Xg && this.eventManagers.forEach((f) => {
          f.handleClick(d);
        }), n = void 0;
      };
      const l = t;
      l.onselectstart !== void 0 ? l.onselectstart = function() {
        return !1;
      } : t.addEventListener("selectstart", function() {
        r.preventDefault();
      });
    };
  }
  /**
   * Adds all the listeners necessary to make the context interactive with multitouch support.
   */
  addTouchContextListeners() {
    const e = this.context;
    if (In(e)) return;
    const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
    function s(h) {
      return h.map((u) => u.touch);
    }
    function r(h) {
      return h.reduce(
        (u, d) => d.touch.startTime > u.touch.startTime ? d : u,
        h[0]
      );
    }
    const o = {
      center: (h) => h.length <= 0 ? [0, 0] : this.getTouchCenter(s(h)),
      centerDelta: (h) => {
        if (h.length <= 0) return [0, 0];
        const u = s(h), d = this.getTouchCenter(
          u,
          (p) => p.previousPosition
        ), f = this.getTouchCenter(u);
        return we(f, d);
      },
      centerStart: (h) => {
        if (h.length <= 0) return [0, 0];
        const u = r(h).touch;
        return this.getTouchCenter(
          s(h),
          (d) => d === u ? d.start : d.startRelative.get(u) || [0, 0]
        );
      },
      id: (h) => s(h).sort(Dr).map((d) => d.touch.identifier).join("_"),
      rotation: (h) => {
        if (h.length <= 0) return 0;
        const u = s(h), d = this.getTouchCenter(u);
        return this.getAverageAngle(u, d);
      },
      rotationDelta: (h) => {
        if (h.length <= 0) return 0;
        const u = s(h), d = this.getTouchCenter(
          u,
          (m) => m.previousPosition
        ), f = this.getAverageAngle(
          u,
          d,
          (m) => m.previousPosition
        ), p = this.getTouchCenter(u);
        return this.getAverageAngle(u, p) - f;
      },
      rotationStart: (h) => {
        if (h.length <= 0) return 0;
        const u = r(h).touch, d = s(h), f = this.getTouchCenter(
          d,
          (p) => p === u ? p.start : p.startRelative.get(u) || [0, 0]
        );
        return this.getAverageAngle(
          d,
          f,
          (p) => p === u ? p.start : p.startRelative.get(u) || [0, 0]
        );
      },
      spread: (h) => {
        if (h.length <= 0) return 0;
        const u = s(h), d = this.getTouchCenter(u);
        return this.getAverageDistance(u, d);
      },
      spreadDelta: (h) => {
        if (h.length <= 0) return 0;
        const u = s(h), d = this.getTouchCenter(
          u,
          (m) => m.previousPosition
        ), f = this.getAverageDistance(
          u,
          d,
          (m) => m.previousPosition
        ), p = this.getTouchCenter(u);
        return this.getAverageDistance(u, p) - f;
      },
      spreadStart: (h) => {
        if (h.length <= 0) return 0;
        const u = r(h).touch, d = s(h), f = this.getTouchCenter(
          d,
          (p) => p === u ? p.start : p.startRelative.get(u) || [0, 0]
        );
        return this.getAverageDistance(
          d,
          f,
          (p) => p === u ? p.start : p.startRelative.get(u) || [0, 0]
        );
      }
    };
    e.ontouchstart = (h) => {
      h.preventDefault(), h.stopPropagation();
      const u = this.getTouches(h), d = [], f = [];
      for (let p = 0, g = u.length; p < g; ++p) {
        const m = u[p], v = t.get(m.identifier);
        if (v)
          d.push(v);
        else {
          const b = Wt(m), w = this.getViewsUnderPosition(b);
          if (w.length <= 0) continue;
          const y = w[0].d, E = {
            canTap: !0,
            currentPosition: b,
            deltaPosition: [0, 0],
            startTime: Date.now(),
            start: b,
            startView: y,
            previousPosition: b,
            startRelative: /* @__PURE__ */ new Map(),
            touch: m
          };
          t.set(m.identifier, E), f.push(E);
        }
      }
      if (f.length > 0) {
        const p = f.concat(d), g = [];
        for (let v = 0, b = f.length; v < b; ++v) {
          const w = f[v];
          for (let E = 0, C = p.length; E < C; ++E) {
            const M = p[E];
            w !== M && M.startRelative.set(w, M.currentPosition);
          }
          const y = this.makeSingleTouchInteraction(w);
          g.push(y), n.set(w.touch.identifier, y);
        }
        const m = {
          touches: g,
          allTouches: p.map((v) => n.get(v.touch.identifier)).filter(se),
          multitouch: o
        };
        this.eventManagers.forEach((v) => {
          v.handleTouchDown(m);
        });
      }
      document.ontouchend = (p) => {
        a.call(document, p), document.ontouchend = null, document.ontouchcancel = null, document.ontouchmove = null;
      }, document.ontouchcancel = (p) => {
        l.call(document, p), document.ontouchend = null, document.ontouchcancel = null, document.ontouchmove = null;
      }, document.ontouchmove = c;
    };
    const a = e.ontouchend = (h) => {
      h.stopPropagation(), h.preventDefault();
      const u = this.getTouches(h, "changed"), d = Array.from(n.values()), f = [];
      for (let p = 0, g = u.length; p < g; ++p) {
        const m = u[p], v = t.get(m.identifier);
        if (v) {
          if (v.canTap && Date.now() - v.startTime < Qg) {
            const w = {
              touches: [this.makeSingleTouchInteraction(v)],
              allTouches: d,
              multitouch: o
            };
            this.eventManagers.forEach((y) => {
              y.handleTap(w);
            });
          }
          f.push(v), t.delete(m.identifier), n.delete(m.identifier);
        }
      }
      if (f.length > 0) {
        const g = {
          touches: f.map(
            (m) => this.makeSingleTouchInteraction(m)
          ),
          allTouches: d,
          multitouch: o
        };
        this.eventManagers.forEach((m) => {
          m.handleTouchUp(g);
        });
      }
    }, c = e.ontouchmove = (h) => {
      h.stopPropagation(), h.preventDefault();
      const u = this.getTouches(h), d = [], f = [];
      for (let p = 0, g = u.length; p < g; ++p) {
        const m = u[p], v = t.get(m.identifier);
        if (v) {
          const b = Wt(m), w = we(
            b,
            v.currentPosition
          );
          if (ln(w) <= 0) {
            f.push(v), Object.assign(v, {
              currentPosition: b,
              deltaPosition: w,
              previousPosition: v.currentPosition,
              touch: m
            });
            continue;
          }
          d.push(v), Object.assign(v, {
            canTap: !1,
            currentPosition: b,
            deltaPosition: w,
            previousPosition: v.currentPosition,
            touch: m
          });
        }
      }
      if (d.length > 0) {
        const p = d.concat(f), m = {
          touches: d.map(
            (v) => this.makeSingleTouchInteraction(v)
          ),
          allTouches: p.map((v) => n.get(v.touch.identifier)).filter(se),
          multitouch: o
        };
        this.eventManagers.forEach((v) => {
          v.handleTouchDrag(m);
        });
      }
    }, l = e.ontouchcancel = (h) => {
      h.stopPropagation(), h.preventDefault();
      const u = this.getTouches(h, "changed"), d = Array.from(n.values()), f = [];
      for (let p = 0, g = u.length; p < g; ++p) {
        const m = u[p], v = t.get(m.identifier);
        v && (f.push(v), t.delete(m.identifier), n.delete(m.identifier));
      }
      if (f.length > 0) {
        const g = {
          touches: f.map(
            (m) => this.makeSingleTouchInteraction(m)
          ),
          allTouches: d,
          multitouch: o
        };
        this.eventManagers.forEach((m) => {
          m.handleTouchCancelled(g);
        });
      }
    };
  }
  /**
   * This takes all of the touches and averages their distance from the center point.
   */
  getAverageDistance(e, t, n) {
    let s = 0;
    if (e.length <= 0) return s;
    n || (n = (r) => r.currentPosition);
    for (let r = 0, o = e.length; r < o; ++r) {
      const a = e[r];
      s += ln(we(n(a), t));
    }
    return s / e.length;
  }
  /**
   * This takes all of the touches and averages their angle around the center point.
   */
  getAverageAngle(e, t, n) {
    let s = 0;
    if (e.length <= 0) return s;
    n || (n = (r) => r.currentPosition);
    for (let r = 0, o = e.length; r < o; ++r) {
      const a = e[r], c = we(n(a), t);
      let l = Math.atan2(c[1], c[0]);
      l < 0 && (l += Math.PI * 2), s += l;
    }
    return s / e.length;
  }
  /**
   * This takes a list of touches and averages their position for a mid point between all of them.
   */
  getTouchCenter(e, t) {
    let n = [0, 0];
    if (e.length <= 0) return n;
    t || (t = (s) => s.currentPosition);
    for (let s = 0, r = e.length; s < r; ++s) {
      const o = e[s], a = t(o);
      n = Ui(n, a);
    }
    return _e(n, 1 / e.length);
  }
  /**
   * Retrieves all touches from a touch event. This normalizes the touch information across: touches, changedTouches,
   * and targetTouches
   */
  getTouches(e, t) {
    const n = /* @__PURE__ */ new Map();
    if (e.touches && e.touches.length > 0 && (!t || t === "touches"))
      for (let s = 0, r = e.touches.length; s < r; ++s) {
        const o = e.touches.item(s);
        o && n.set(o.identifier, o);
      }
    if (e.changedTouches && e.changedTouches.length > 0 && (!t || t === "changed"))
      for (let s = 0, r = e.changedTouches.length; s < r; ++s) {
        const o = e.changedTouches.item(s);
        o && n.set(o.identifier, o);
      }
    if (e.targetTouches && e.targetTouches.length > 0 && (!t || t === "target"))
      for (let s = 0, r = e.targetTouches.length; s < r; ++s) {
        const o = e.targetTouches.item(s);
        o && n.set(o.identifier, o);
      }
    return Array.from(n.values());
  }
  /**
   * Retrieves the view for the provided id
   */
  getView(e) {
    const t = this.scenes;
    for (let n = 0, s = t.length; n < s; ++n) {
      const o = t[n].viewDiffs.getByKey(e);
      if (o) return o;
    }
    return null;
  }
  /**
   * This makes the metrics for interactions with the views.
   */
  makeMouseInteraction(e) {
    const t = this.getViewsUnderPosition(e.currentPosition);
    let n = t[0] && t[0].d;
    n || (n = Xt);
    const s = this.getViewsUnderPosition(e.start);
    let r = e.startView;
    r || (r = Xt);
    const o = {
      canvas: In(this.context) ? void 0 : this.context,
      mouse: e,
      screen: {
        position: e.currentPosition
      },
      start: {
        position: r.projection.screenToView(e.start),
        view: r,
        views: s.map((a) => (a.d || (a.d = Xt), {
          position: a.d.projection.screenToView(e.start),
          view: a.d
        }))
      },
      target: {
        position: n.projection.screenToView(
          e.currentPosition
        ),
        view: n,
        views: t.map((a) => (a.d || (a.d = Xt), {
          position: a.d.projection.screenToView(e.currentPosition),
          view: a.d
        }))
      }
    };
    return this.currentInteraction = o, o;
  }
  /**
   * Make an interaction depicting the interactions with the touch
   */
  makeSingleTouchInteraction(e) {
    const t = e.currentPosition, n = this.getViewsUnderPosition(t);
    let s = n[0] && n[0].d;
    s || (s = Xt);
    let r = e.startView;
    r || (r = Xt);
    const o = {
      canvas: In(this.context) ? void 0 : this.context,
      touch: e,
      screen: {
        position: t
      },
      start: {
        position: r.projection.screenToView(e.start),
        view: r,
        views: this.getViewsUnderPosition(e.start).map((a) => (a.d || (a.d = Xt), {
          position: a.d.projection.screenToView(e.start),
          view: a.d
        }))
      },
      target: {
        position: s.projection.screenToView(t),
        view: s,
        views: n.map((a) => (a.d || (a.d = Xt), {
          position: a.d.projection.screenToView(t),
          view: a.d
        }))
      }
    };
    return this.currentInteraction = o, o;
  }
  /**
   * This produces an object for handling several touches at once. It will store all of the combinations of touches
   * and their associative metrics into the lookup mapping provideds.
   */
  makeMultiTouchInteractions(e, t) {
    e.sort(Dr);
    const n = this.allTouchCombinations(e);
    for (let s = 0, r = n.length; s < r; ++s) {
      const o = n[s], a = o.map((l) => l.touch.identifier).join("_");
      let c = t.get(a);
      if (!c) {
        const l = this.getTouchCenter(o);
        c = {
          touches: o,
          averageSpreadDelta: 0,
          startCenter: l,
          currentCenter: l,
          currentRotation: this.getAverageAngle(o, l),
          centerDelta: [0, 0],
          rotationDelta: 0
        }, t.set(a, c);
      }
    }
  }
  /**
   * This updates all existing multitouch metrics with their new frame of data
   */
  updateMultiTouchInteractions(e, t) {
    e.sort(Dr);
    const n = this.allTouchCombinations(e);
    for (let s = 0, r = n.length; s < r; ++s) {
      const o = n[s], a = o.map((l) => l.touch.identifier).join("_"), c = t.get(a);
      if (c) {
        const l = this.getTouchCenter(o), h = this.getAverageAngle(o, l);
        c.centerDelta = we(l, c.currentCenter), c.currentCenter = l, c.rotationDelta = h - c.currentRotation, c.currentRotation = h;
      }
    }
  }
  /**
   * This makes all of the possible combinations of touches.
   */
  allTouchCombinations(e) {
    const t = [], n = e.length, s = 1 << n;
    for (let r = 1; r < s; r++) {
      const o = [];
      for (let a = 0; a < n; a++)
        r & 1 << a && o.push(e[a]);
      t.push(o);
    }
    return t;
  }
  makeWheel(e) {
    if (!e)
      return {
        delta: [0, 0]
      };
    const t = ph(e);
    return {
      delta: [t.pixelX, t.pixelY]
    };
  }
  /**
   * Sets the controllers to receive events from this manager.
   */
  setControllers(e) {
    this.eventManagers = e;
    for (const t of this.eventManagers)
      t.setUserInputManager(this);
  }
  destroy() {
    delete this.quadTree, In(this.context) || (this.context.onmousedown = null, this.context.onmousemove = null, this.context.onmouseleave = null);
    const e = this.context;
    e.onmousewheel && (e.onmousewheel = null), this.eventCleanup.forEach((t) => {
      this.context.removeEventListener(t[0], t[1]);
    });
  }
}
class yh extends Rc {
  /**
   * Default ctor for Queued event handling.
   *
   * @param handlers Custom handlers for all of the normal Event manager events
   * @param preserveEvents When set to true, ALL events will be stored and
   *                       broadcasted upon dequeuing of the events. Conversely,
   *                       when false, only the last event of a given event type
   *                       will be preserved for broadcast.
   */
  constructor(e, t = !1) {
    super(), this.preserveQueueMouse = [], this.singleQueueMouse = /* @__PURE__ */ new Map(), this.preserveQueueTouch = [], this.singleQueueTouch = /* @__PURE__ */ new Map(), this.preserveEvents = !1, this.handlers = new po(e), this.preserveEvents = t;
  }
  /**
   * Broadcast all of the events this manager is hanging onto in the order the
   * events were received.
   */
  dequeue() {
    try {
      this.preserveEvents ? (this.preserveQueueMouse.forEach((e) => {
        e[0](e[1]);
      }), this.preserveQueueTouch.forEach((e) => {
        e[0](e[1]);
      })) : (this.singleQueueMouse.forEach((e, t) => {
        t(e);
      }), this.singleQueueTouch.forEach((e, t) => {
        t(e);
      }));
    } catch (e) {
      console.error("Queued events had errors. Further events aborted"), e instanceof Error && console.error(e.stack || e.message);
    }
    this.preserveQueueMouse = [], this.singleQueueMouse.clear(), this.preserveQueueTouch = [], this.singleQueueTouch.clear();
  }
  handleMouseDown(e) {
    this.preserveEvents ? this.preserveQueueMouse.push([this.handlers.handleMouseDown, e]) : this.singleQueueMouse.set(this.handlers.handleMouseDown, e);
  }
  handleMouseUp(e) {
    this.preserveEvents ? this.preserveQueueMouse.push([this.handlers.handleMouseUp, e]) : this.singleQueueMouse.set(this.handlers.handleMouseUp, e);
  }
  handleMouseOver(e) {
    this.preserveEvents ? this.preserveQueueMouse.push([this.handlers.handleMouseOver, e]) : this.singleQueueMouse.set(this.handlers.handleMouseOver, e);
  }
  handleMouseOut(e) {
    this.preserveEvents ? this.preserveQueueMouse.push([this.handlers.handleMouseOut, e]) : this.singleQueueMouse.set(this.handlers.handleMouseOut, e);
  }
  handleMouseMove(e) {
    this.preserveEvents ? this.preserveQueueMouse.push([this.handlers.handleMouseMove, e]) : this.singleQueueMouse.set(this.handlers.handleMouseMove, e);
  }
  handleClick(e) {
    this.preserveEvents ? this.preserveQueueMouse.push([this.handlers.handleClick, e]) : this.singleQueueMouse.set(this.handlers.handleClick, e);
  }
  handleDrag(e) {
    this.preserveEvents ? this.preserveQueueMouse.push([this.handlers.handleDrag, e]) : this.singleQueueMouse.set(this.handlers.handleDrag, e);
  }
  handleWheel(e) {
    this.preserveEvents ? this.preserveQueueMouse.push([this.handlers.handleWheel, e]) : this.singleQueueMouse.set(this.handlers.handleWheel, e);
  }
  handleTouchCancelled(e) {
    this.preserveEvents ? this.preserveQueueTouch.push([this.handlers.handleTouchCancelled, e]) : this.singleQueueTouch.set(this.handlers.handleTouchCancelled, e);
  }
  handleTouchDown(e) {
    this.preserveEvents ? this.preserveQueueTouch.push([this.handlers.handleTouchDown, e]) : this.singleQueueTouch.set(this.handlers.handleTouchDown, e);
  }
  handleTouchUp(e) {
    this.preserveEvents ? this.preserveQueueTouch.push([this.handlers.handleTouchUp, e]) : this.singleQueueTouch.set(this.handlers.handleTouchUp, e);
  }
  handleTouchOut(e) {
    this.preserveEvents ? this.preserveQueueTouch.push([this.handlers.handleTouchOut, e]) : this.singleQueueTouch.set(this.handlers.handleTouchOut, e);
  }
  handleTouchDrag(e) {
    this.preserveEvents ? this.preserveQueueTouch.push([this.handlers.handleTouchDrag, e]) : this.singleQueueTouch.set(this.handlers.handleTouchDrag, e);
  }
  handleTap(e) {
    this.preserveEvents ? this.preserveQueueTouch.push([this.handlers.handleTap, e]) : this.singleQueueTouch.set(this.handlers.handleTap, e);
  }
  handleDoubleTap(e) {
    this.preserveEvents ? this.preserveQueueTouch.push([this.handlers.handleDoubleTap, e]) : this.singleQueueTouch.set(this.handlers.handleDoubleTap, e);
  }
  handleLongTouch(e) {
    this.preserveEvents ? this.preserveQueueTouch.push([this.handlers.handleLongTouch, e]) : this.singleQueueTouch.set(this.handlers.handleLongTouch, e);
  }
  handleLongTap(e) {
    this.preserveEvents ? this.preserveQueueTouch.push([this.handlers.handleLongTap, e]) : this.singleQueueTouch.set(this.handlers.handleLongTap, e);
  }
  handlePinch(e) {
    this.preserveEvents ? this.preserveQueueTouch.push([this.handlers.handlePinch, e]) : this.singleQueueTouch.set(this.handlers.handlePinch, e);
  }
  handleSpread(e) {
    this.preserveEvents ? this.preserveQueueTouch.push([this.handlers.handleSpread, e]) : this.singleQueueTouch.set(this.handlers.handleSpread, e);
  }
  handleTouchRotate(e) {
    this.preserveEvents ? this.preserveQueueTouch.push([this.handlers.handleTouchRotate, e]) : this.singleQueueTouch.set(this.handlers.handleTouchRotate, e);
  }
  handleSwipe(e) {
    this.preserveEvents ? this.preserveQueueTouch.push([this.handlers.handleSwipe, e]) : this.singleQueueTouch.set(this.handlers.handleSwipe, e);
  }
}
class Kg {
  /**
   * This sorts the attributes such that the attributes that MUST be updated first are put to the top.
   * This is necessary for complex attributes like atlas and easing attributes who have other attributes
   * that have dependent behaviors based on their source attribute.
   */
  sortInstanceAttributes(e, t) {
    return e.resource && !t.resource || e.easing && !t.easing ? -1 : 1;
  }
  /**
   * This sorts the vertex attributes in the expected order of updating.
   */
  sortVertexAttributes(e, t) {
    return 1;
  }
  /**
   * This sorts the uniforms in the expected order of updating.
   */
  sortUniforms(e, t) {
    return 1;
  }
}
const Zg = Do.immediate(0);
class Gi {
  constructor(e, t) {
    this._id = U(), this.animation = Do.immediate(0), this.animationEndTime = 0, this.offsetBroadcastTime = 0, this.scaleBroadcastTime = 0, this._offset = [0, 0, 0], this.startOffset = [0, 0, 0], this.startOffsetTime = 0, this.offsetEndTime = 0, this._scale = [1, 1, 1], this.startScale = [1, 1, 1], this.startScaleTime = 0, this.scaleEndTime = 0, this.needsBroadcast = !1, this.camera = e, t && (this._offset = ct(t.offset || this._offset), this._scale = ct(t.scale || this._scale));
  }
  get id() {
    return this._id;
  }
  /**
   * Performs the broadcast of changes for the camera if the camera needed a broadcast.
   */
  broadcast(e) {
    this.offset, this.scale, this.needsBroadcast && (this.needsBroadcast = !1, this.onViewChange && this.onViewChange(this.camera, e));
  }
  /**
   * Adjusts offset to set the middle at the provided location relative to a provided view.
   */
  centerOn(e, t) {
    var a;
    const n = (a = this.surface) == null ? void 0 : a.getViewSize(e);
    if (!n) return;
    const s = [n.width / 2, n.height / 2, 0], r = Jt(
      t,
      cr(s, this._scale)
    ), o = this.animation;
    this.setOffset(ct(this.offset)), this.animation = Zg, this.setOffset(ut(r, -1)), this.animation = o;
  }
  /**
   * Retrieves the current frame's time from the surface this camera is managed under.
   */
  getCurrentTime() {
    return this.surface ? this.surface.frameMetrics.currentTime : 0;
  }
  /**
   * Gets the source offset value
   */
  getOffset() {
    return this._offset;
  }
  /**
   * Gets the source scale value
   */
  getScale() {
    return this._scale;
  }
  /**
   * Retrieves the animated value of the offset of the camera.
   * To get a non-animated version of the offset use getOffset()
   */
  get offset() {
    const e = this.getCurrentTime();
    return this.onViewChange && this.offsetBroadcastTime < this.offsetEndTime && (this.offsetBroadcastTime = e, this.needsBroadcast = !0), this.animation.cpu(
      this.startOffset,
      this._offset,
      (e - this.startOffsetTime) / this.animation.duration
    );
  }
  /**
   * Sets the id of this camera
   */
  setId(e) {
    this._id = e, this.camera.needsViewDrawn = !0;
  }
  /**
   * Sets the location of the camera by adjusting the offsets to match.
   * Whatever is set for the "animation" property determines the animation.
   */
  setOffset(e) {
    this.startOffset = ct(this.offset), this._offset = ct(e), this.startOffsetTime = this.getCurrentTime(), this.offsetEndTime = this.startOffsetTime + this.animation.duration, this.updateEndTime(), this.camera.needsViewDrawn = !0, this.onViewChange && (this.offsetBroadcastTime = this.startOffsetTime, this.needsBroadcast = !0);
  }
  /**
   * Retrieves the animated scale. If you want straight end scale value, use getScale()
   */
  get scale() {
    const e = this.getCurrentTime();
    return this.onViewChange && this.scaleBroadcastTime < this.scaleEndTime && (this.scaleBroadcastTime = e, this.needsBroadcast = !0), this.animation.cpu(
      this.startScale,
      this._scale,
      (e - this.startScaleTime) / this.animation.duration
    );
  }
  /**
   * Applies the handler for broadcasting view changes from the camera.
   */
  setViewChangeHandler(e) {
    this.onViewChange = e;
  }
  /**
   * Sets and animates the scale of the camera.
   * Whatever is set for the "animation" property determines the animation.
   */
  setScale(e) {
    this.startScale = ct(this.scale), this._scale = ct(e), this.startScaleTime = this.getCurrentTime(), this.scaleEndTime = this.startScaleTime + this.animation.duration, this.updateEndTime(), this.camera.needsViewDrawn = !0, this.onViewChange && (this.scaleBroadcastTime = this.startScaleTime, this.needsBroadcast = !0);
  }
  /**
   * Resolves all flags indicating updates needed.
   */
  resolve() {
    this.camera.needsViewDrawn = !1, this.needsBroadcast = !1;
  }
  update() {
    this.camera.needsViewDrawn = !0;
  }
  updateEndTime() {
    this.animationEndTime = Math.max(this.scaleEndTime, this.offsetEndTime);
  }
}
class si extends zi {
  get control2D() {
    return this._control2D;
  }
  set control2D(e) {
    this._control2D = e;
  }
  get scale2D() {
    return this.control2D.scale;
  }
  get offset() {
    return this.control2D.offset;
  }
  constructor(e) {
    super({
      left: -100,
      right: 100,
      top: -100,
      bottom: 100,
      near: -100,
      far: 1e5,
      type: Fi.ORTHOGRAPHIC
    }), this.control2D = new Gi(this, e);
  }
}
class Jg extends yh {
  constructor() {
    super({
      handleClick: async (e) => {
        var t, n;
        this.enablePicking(), await ((t = this.willRenderResolver) == null ? void 0 : t.promise), this.enablePicking(), await ((n = this.didRenderResolver) == null ? void 0 : n.promise), this.handleInteraction(e, (s, r) => {
          var o;
          (o = s.interactions) == null || o.handleMouseClick(r, e);
        });
      },
      handleTap: async (e) => {
        var t, n;
        this.enablePicking(), await ((t = this.willRenderResolver) == null ? void 0 : t.promise), this.enablePicking(), await ((n = this.didRenderResolver) == null ? void 0 : n.promise), e.touches.forEach((s) => {
          this.handleInteraction(s, (r, o) => {
            var a;
            (a = r.interactions) == null || a.handleTap(o, e, s);
          });
        });
      },
      handleDrag: async (e) => {
        var t;
        await ((t = this.willRenderResolver) == null ? void 0 : t.promise), this.handleInteraction(e, (n, s) => {
          var r;
          (r = n.interactions) == null || r.handleMouseDrag(s, e);
        });
      },
      handleMouseDown: async (e) => {
        var t;
        this.enablePicking(), await ((t = this.willRenderResolver) == null ? void 0 : t.promise), this.handleInteraction(
          e,
          (n, s) => {
            var r;
            return (r = n.interactions) == null ? void 0 : r.handleMouseDown(s, e);
          }
        );
      },
      handleTouchDown: async (e) => {
        var t;
        this.enablePicking(), await ((t = this.willRenderResolver) == null ? void 0 : t.promise), e.touches.forEach((n) => {
          this.handleInteraction(
            n,
            (s, r) => {
              var o;
              return (o = s.interactions) == null ? void 0 : o.handleTouchDown(r, e, n);
            }
          );
        });
      },
      handleMouseUp: async (e) => {
        var t;
        await ((t = this.willRenderResolver) == null ? void 0 : t.promise), this.handleInteraction(
          e,
          (n, s) => {
            var r;
            return (r = n.interactions) == null ? void 0 : r.handleMouseUp(s, e);
          }
        );
      },
      handleTouchUp: async (e) => {
        var t;
        await ((t = this.willRenderResolver) == null ? void 0 : t.promise), e.touches.forEach((n) => {
          this.handleInteraction(
            n,
            (s, r) => {
              var o;
              return (o = s.interactions) == null ? void 0 : o.handleTouchUp(r, e, n);
            }
          );
        });
      },
      handleMouseOut: async (e) => {
        var t;
        await ((t = this.willRenderResolver) == null ? void 0 : t.promise), this.isOver.forEach((n) => {
          this.handleView(
            n,
            (s, r) => {
              var o;
              return (o = s.interactions) == null ? void 0 : o.handleMouseOut(r, e);
            }
          );
        }), this.isOver.clear();
      },
      handleTouchOut: async (e) => {
        var t;
        await ((t = this.willRenderResolver) == null ? void 0 : t.promise), e.touches.forEach((n) => {
          Hr(
            this.isTouchOver,
            n.touch.touch.identifier,
            /* @__PURE__ */ new Set()
          ).forEach((r) => {
            this.handleView(
              r,
              (o, a) => {
                var c;
                return (c = o.interactions) == null ? void 0 : c.handleTouchOut(a, e, n);
              }
            );
          }), this.isOver.clear();
        });
      },
      handleMouseMove: async (e) => {
        var s;
        this.enablePicking(), await ((s = this.willRenderResolver) == null ? void 0 : s.promise);
        const t = this.handleInteraction(
          e,
          (r, o) => {
            var a;
            return (a = r.interactions) == null ? void 0 : a.handleMouseMove(o, e);
          }
        ), n = /* @__PURE__ */ new Set();
        t.forEach((r) => n.add(r)), this.isOver.forEach((r) => {
          n.has(r) || this.handleView(
            r,
            (o, a) => {
              var c;
              return (c = o.interactions) == null ? void 0 : c.handleMouseOut(a, e);
            }
          );
        }), n.forEach((r) => {
          this.isOver.has(r) || this.handleView(
            r,
            (o, a) => {
              var c;
              return (c = o.interactions) == null ? void 0 : c.handleMouseOver(a, e);
            }
          );
        }), this.isOver = n;
      },
      /**
       * Touch dragging is essentially touch moving as it's the only way to make a touch glide across the screen
       */
      handleTouchDrag: async (e) => {
        var t;
        this.enablePicking(), await ((t = this.willRenderResolver) == null ? void 0 : t.promise), e.touches.forEach((n) => {
          const s = this.handleInteraction(
            n,
            (a, c) => {
              var l;
              return (l = a.interactions) == null ? void 0 : l.handleTouchMove(c, e, n);
            }
          ), r = /* @__PURE__ */ new Set();
          s.forEach((a) => r.add(a));
          const o = cn(
            this.isTouchOver,
            n.touch.touch.identifier,
            /* @__PURE__ */ new Set()
          );
          o.forEach((a) => {
            r.has(a) || this.handleView(
              a,
              (c, l) => {
                var h;
                return (h = c.interactions) == null ? void 0 : h.handleTouchOut(l, e, n);
              }
            );
          }), r.forEach((a) => {
            o.has(a) || this.handleView(
              a,
              (c, l) => {
                var h;
                return (h = c.interactions) == null ? void 0 : h.handleTouchOver(
                  l,
                  e,
                  n
                );
              }
            );
          }), this.isTouchOver.set(
            n.touch.touch.identifier,
            r
          );
        });
      }
    }), this.isOver = /* @__PURE__ */ new Set(), this.isTouchOver = /* @__PURE__ */ new Map();
  }
  /** This is the surface this manager is aiding with broadcasting events to layers */
  get scenes() {
    return !this.surface || !this.surface.sceneDiffs ? [] : this.surface.sceneDiffs.items;
  }
  /**
   * This enables picking for the surface.
   */
  enablePicking() {
    this.surface && this.surface.enableOptimizedOutput(V.PICKING);
  }
  /**
   * We want to dequeue the events after a render has taken place.
   */
  willRender() {
    var e;
    for (let t = 0, n = this.scenes.length; t < n; ++t) {
      const s = this.scenes[t];
      for (let r = 0, o = s.layers.length; r < o; ++r)
        (e = s.layers[r].interactions) == null || delete e.colorPicking;
    }
    this.willRenderResolver && this.willRenderResolver.resolve(), this.willRenderResolver = new He(), this.dequeue();
  }
  /**
   * After rendering has completed, we release all handlers waiting for
   * completion.
   */
  async didRender() {
    this.didRenderResolver && this.didRenderResolver.resolve(), this.didRenderResolver = new He();
  }
  getSceneViewsUnderMouse(e) {
    const t = /* @__PURE__ */ new Map();
    for (let n = 0, s = this.scenes.length; n < s; ++n) {
      const r = this.scenes[n];
      for (let o = 0, a = r.views.length; o < a; ++o) {
        const c = r.views[o];
        t.set(c.id, c);
      }
    }
    return e.target.views.map((n) => t.get(n.view.id)).filter(se);
  }
  handleInteraction(e, t) {
    const n = this.getSceneViewsUnderMouse(e);
    for (let s = 0, r = n.length; s < r; ++s) {
      const o = n[s];
      this.handleView(o, t);
    }
    return n;
  }
  handleView(e, t) {
    for (let n = 0, s = e.scene.layers.length; n < s; ++n) {
      const r = e.scene.layers[n];
      r.picking && r.picking.type !== H.NONE && t(r, e);
    }
  }
}
class em {
  /**
   * Implement to transform the vertex shader BEFORE any changes are applied to
   * it. This includes pre module imports and output analysis.
   */
  rawVertex(e) {
    return e;
  }
  /**
   * Implement to transform the vertex shader BEFORE any changes are applied to
   * it. This includes pre module imports and output analysis.
   */
  rawFragment(e) {
    return e;
  }
}
class tm extends em {
  /**
   * For es 3.0 shaders:
   *   - we make sure all varying is converted to outs.
   *   - texture2D sampling is now texture
   * For es 2.0 shaders:
   *   - we make sure the version header is removed
   *   - Ensure out's are changed to varying
   */
  vertex(e) {
    let t = tr(e);
    return O.SHADERS_3_0 ? (t = t.replace(/\s+varying\s+/g, `
out `), t = t.replace(/(texture2D(\s+)\(|texture2D\()/g, "texture(")) : (t = t.replace(/^#version 300 es/g, ""), t = t.replace(/\s+out\s+/g, `
varying `)), t;
  }
  /**
   * For es 3.0 shaders:
   *   - we make sure all varying is converted to in's.
   *   - if gl_FragColor is present, we need to generate an out for it
   * For es 2.0 shaders:
   *   - we make sure the version header is removed
   *   - Ensure in's are changed to varying
   */
  fragment(e) {
    let t = tr(e);
    if (O.SHADERS_3_0) {
      if (t = t.replace(/\s+varying\s+/g, `
in `), t = t.replace(/(texture2D(\s+)\(|texture2D\()/g, "texture("), t.match(/gl_FragColor/g) && (t = t.replace(/gl_FragColor/g, "_FragColor"), !t.match("out vec4 _FragColor"))) {
        const n = t.split(`
`);
        n.splice(3, 0, "layout(location = 0) out vec4 _FragColor;"), t = n.join(`
`);
      }
    } else
      t = t.replace(/^#version 300 es/g, ""), t = t.replace(/\s+in\s+/g, `
varying `);
    return t;
  }
}
function im(i, e, t, n, s) {
  const r = {
    view: i,
    allColors: [],
    colorData: t,
    dataHeight: s,
    dataWidth: n,
    mouse: e,
    nearestColor: 0,
    nearestColorBytes: [0, 0, 0, 0]
  }, o = /* @__PURE__ */ new Map();
  let a = 0;
  const c = n / 2, l = s / 2;
  let h = 0, u = [0, 0, 0, 0], d = Number.MAX_SAFE_INTEGER;
  for (let f = 0; f < s; ++f) {
    const p = [];
    for (let g = 0; g < n; ++g) {
      const m = t[a], v = t[a + 1], b = t[a + 2];
      a += 4;
      const w = m << 16 | v << 8 | b;
      if (o.set(w, !0), p.push(w), w !== 0) {
        const y = g - c, E = f - l, C = y * y + E * E;
        C < d && (d = C, h = w, u = [m, v, b, 255]);
      }
    }
  }
  return r.allColors = Array.from(o.keys()), r.nearestColor = h, r.nearestColorBytes = u, r;
}
class nm {
  constructor(e) {
    this.pickingRenderTargets = /* @__PURE__ */ new Map(), this.surface = e.surface;
  }
  analyzePickedPixels(e, t) {
    if (t.optimizeRendering)
      return;
    const n = ar(
      // Our location is relative to the screen, so we must scale it by the
      // surface's pixel ratio to match the actual pixel space of the original
      // screen dimensions
      _e(e, this.surface.pixelRatio),
      // We then have to scale down the location based on the scaling of the
      // view relative to the view's scaling relative to the screen.
      t.projection.screenScale
    ), s = 5, r = 5, o = 4, a = new Uint8Array(s * r * o);
    this.surface.renderer.readPixels(
      Math.min(
        Math.max(0, Math.floor(n[0] - s / 2)),
        t.getRenderTargets()[0].width
      ),
      Math.min(
        Math.max(0, Math.floor(n[1] - r / 2)),
        t.getRenderTargets()[0].height
      ),
      s,
      r,
      a
    );
    const c = im(
      t,
      [n[0] - t.screenBounds.x, n[1] - t.screenBounds.y],
      a,
      s,
      r
    );
    for (let l = 0, h = t.scene.layers.length; l < h; ++l) {
      const u = t.scene.layers[l];
      u.picking.type === H.SINGLE && (u.interactions.colorPicking = c);
    }
  }
  /**
   * This causes picking operations to get dequeued and have the textures
   * associated with the picking have their pixels read for interpretation for
   * instance interaction.
   *
   * This is a BLOCKING operation and it will block until ALL GPU operations
   * have been completed by the GPU. Thus, it is recommended to perform this
   * command at the beginning of the pipeline to allow for the operations of the
   * previous frame to complete.
   */
  decodePicking() {
    const e = this.surface.getCurrentInteraction();
    if (!e) return;
    const t = e.screen.position, n = e.target.views.map((r) => r.view), s = /* @__PURE__ */ new Set();
    this.pickingRenderTargets.forEach((r, o) => {
      const a = r.getBuffers()[0].buffer;
      a instanceof ee && (!a.gl || a.destroyed) && (r.dispose(), s.add(o));
    }), s.forEach((r) => this.pickingRenderTargets.delete(r)), n.forEach((r) => {
      let o = this.pickingRenderTargets.get(r);
      if (o || r.getRenderTargets().forEach((l) => {
        l.gl && l.getBuffers().forEach((h) => {
          if (h.outputType === V.PICKING) {
            if (h.buffer instanceof ee && h.buffer.generateMipMaps && Me("decode-picking-error", () => {
              console.warn(
                "The Texture you provided as the target for color picking has generateMipMaps enabled. This can cause accuracy issues and may make your picking experience poor."
              );
            }), o = new Zi({
              buffers: {
                color: h
              }
            }), o.width === 0 || o.height === 0) {
              o = void 0;
              return;
            }
            this.pickingRenderTargets.set(r, o);
          }
        });
      }), !o) return;
      const a = this.surface.renderer.state.currentRenderTarget;
      let c = !1;
      a ? (Array.isArray(a) || a.getBuffers()[0].buffer !== o.getBuffers()[0].buffer) && (c = !0) : c = !0, c && this.surface.renderer.setRenderTarget(o), this.analyzePickedPixels(t, r);
    });
  }
}
const sm = () => [
  // Basic expansion to handle writing attributes and uniforms to the shader
  new gg(),
  // Expansion to write in the active attribute handler. Any expansion injected AFTER
  // this expander will have it's processes canceled out for the destructuring portion
  // of the expansion when an instance is not active (if the instance has an
  // active
  // attribute).
  new wg(),
  // Expansion to handle easing IO attributes and write AutoEasingMethods to the
  // shaders
  new hg()
], rm = () => [
  {
    type: re.COLOR_BUFFER,
    manager: new ju()
  },
  {
    type: re.TEXTURE,
    manager: new Hp()
  },
  {
    type: re.ATLAS,
    manager: new Wp({})
  },
  {
    type: re.FONT,
    manager: new Up()
  }
], om = () => [
  // Transform that handles odds and ends of 3.0 and 2.0 inconsistencies and
  // attempts tp unify them as best as possible depending on the current
  // system's operating mode.
  new tm()
], am = [0, 0, 0, 0];
function Ur(i, e) {
  return (i.order || Number.MAX_SAFE_INTEGER) - (e.order || Number.MAX_SAFE_INTEGER);
}
class cm {
  constructor(e) {
    this.commands = new nm({ surface: this }), this.frameMetrics = {
      currentFrame: 0,
      currentTime: Date.now() | 0,
      frameDuration: 1e3 / 60,
      previousTime: Date.now() | 0
    }, this.isBufferingResources = !1, this.ioExpanders = [], this.shaderTransforms = [], this.optimizedOutputs = /* @__PURE__ */ new Set(), this.ioSorting = new Kg(), this.pixelRatio = window.devicePixelRatio, this.enabledOptimizedOutputs = /* @__PURE__ */ new Set(), this.viewDrawDependencies = /* @__PURE__ */ new Map(), this.resourceDiffs = new er({
      buildItem: async (t) => (await this.resourceManager.initResource(t), {
        id: t.key
      }),
      destroyItem: async (t, n) => (await this.resourceManager.destroyResource(t), !0),
      updateItem: async (t, n) => {
        await this.resourceManager.updateResource(t);
      }
    }), this.sceneDiffs = new er({
      buildItem: async (t) => new ir(this, {
        key: t.key,
        views: t.views,
        layers: t.layers
      }),
      destroyItem: async (t, n) => (n.destroy(), !0),
      updateItem: async (t, n) => {
        await n.update(t);
      }
    }), this.readyResolver = new He(), this.ready = this.readyResolver.promise, e && this.init(e);
  }
  /** Read only getter for the gl context */
  get gl() {
    return this.context;
  }
  /** Get all of the scenes for this surface */
  get scenes() {
    return this.sceneDiffs.items;
  }
  /**
   * Broadcasts a cycle event to all event managers.
   */
  broadcastEventManagerCycle(e) {
    for (let t = 0, n = this.userInputManager.eventManagers.length; t < n; ++t) {
      const s = this.userInputManager.eventManagers[t];
      switch (e) {
        case 1:
          s.didRender();
          break;
        case 0:
          s.willRender();
          break;
      }
    }
  }
  /**
   * The performs all of the needed updates that layers need to commit to the scene and buffers
   * to be ready for a draw pass. This is callable outside of the draw loop to allow for specialized
   * procedures or optimizations to take place, where incremental updates to the buffers would make
   * the most sense.
   *
   * @param time The start time of the given frame
   * @param frameIncrement When true, the frame count for the frame metrics will increment
   * @param onViewReady Callback for when all of the layers of a scene view have been committed
   *                    and are thus potentially ready to be rendered.
   */
  async commit(e) {
    if (!this.gl) return;
    const t = this.frameMetrics.currentTime, n = this.sceneDiffs.items;
    n.sort(Ur);
    const s = {};
    for (let o = 0, a = n.length; o < a; ++o) {
      const c = n[o], l = c.renderViews, h = c.layers;
      l.sort(Ur), h.sort(Ur);
      for (let u = 0, d = l.length; u < d; ++u) {
        const f = l[u], p = {};
        if (!f.shouldDrawView(this.frameMetrics))
          continue;
        h.length > 0 && f.willUseView();
        const g = this.renderer.getRenderSize();
        let m = new Z({
          width: g[0],
          height: g[1],
          x: 0,
          y: 0
        });
        if (f.renderTarget) {
          const y = (Array.isArray(f.renderTarget) ? f.renderTarget[0] : f.renderTarget).getSize();
          m = new Z({
            width: y[0],
            height: y[1],
            x: 0,
            y: 0
          });
        }
        const v = wa(
          f.props.viewport,
          m,
          this.pixelRatio
        );
        f.fitViewtoViewport(m, v);
        for (let w = 0, y = h.length; w < y; ++w) {
          const E = h[w];
          E.view = f;
          try {
            E.draw(), p[E.id] = E, f.animationEndTime = Math.max(
              f.animationEndTime,
              E.animationEndTime,
              f.props.camera.animationEndTime
            ), E.lastFrameTime = t;
          } catch (C) {
            C instanceof Error && (s[E.id] || (s[E.id] = [E, C]));
          }
        }
        const b = Object.values(p);
        h.length !== b.length && c.layerDiffs.diff(b.map((w) => w.initializer)), c.container && (e && e(!0, c, f), f.previousProps = f.props);
      }
    }
    const r = Object.values(s);
    this.printLayerErrors(r);
  }
  /**
   * Free all resources consumed by this surface that gets applied to the GPU.
   */
  destroy() {
    this.resourceManager.destroy(), this.userInputManager.destroy(), this.sceneDiffs.destroy(), this.renderer.dispose(), delete this.context;
  }
  /**
   * This is the draw loop that must be called per frame for updates to take
   * effect and display.
   *
   * @param time This is an optional time flag so one can manually control the
   *             time flag for the frame. This will affect animations and other
   *             automated gpu processes.
   */
  async draw(e) {
    if (this.gl) {
      e === void 0 ? this.frameMetrics.currentTime = Date.now() | 0 : (this.frameMetrics.previousTime === this.frameMetrics.currentTime && (this.frameMetrics.previousTime = e), this.frameMetrics.currentTime = e), this.frameMetrics.currentFrame++, this.frameMetrics.frameDuration = this.frameMetrics.currentTime - this.frameMetrics.previousTime, this.frameMetrics.previousTime = this.frameMetrics.currentTime, this.broadcastEventManagerCycle(
        0
        /* WILL_RENDER */
      );
      for (let t = 0, n = this.sceneDiffs.items.length; t < n; ++t) {
        const s = this.sceneDiffs.items[t];
        s.clearCaches();
        for (let r = 0, o = s.renderViews.length; r < o; ++r) {
          const a = s.renderViews[r];
          a.props.camera.broadcast(a.id);
        }
      }
      if (await this.commit((t, n, s) => {
        n.container && t && this.drawSceneView(n.container, s);
      }), this.userInputManager.waitingForRender && (this.userInputManager.waitingForRender = !1), !this.isBufferingResources) {
        this.isBufferingResources = !0;
        const t = await this.resourceManager.dequeueRequests();
        this.isBufferingResources = !1, t && this.draw(await ki());
      }
      for (let t = 0, n = this.sceneDiffs.items.length; t < n; ++t) {
        const s = this.sceneDiffs.items[t];
        for (let r = 0, o = s.renderViews.length; r < o; ++r) {
          const a = s.renderViews[r];
          a.needsDraw = !1, a.props.camera.resolve();
        }
        for (let r = 0, o = s.layers.length; r < o; ++r) {
          const a = s.layers[r];
          a.needsViewDrawn = !1;
        }
      }
      this.broadcastEventManagerCycle(
        1
        /* DID_RENDER */
      ), this.enabledOptimizedOutputs.clear();
    }
  }
  /**
   * This finalizes everything and sets up viewports and clears colors and
   * performs the actual render step
   */
  drawSceneView(e, t, n, s) {
    n = n || this.renderer;
    const r = { x: t.viewBounds.left, y: t.viewBounds.top }, o = t.viewBounds, a = t.props.background || am, c = t.clearFlags.indexOf(ks.COLOR) > -1, l = s || t.renderTarget || null;
    t.renderTarget && (t.getRenderTargets().forEach(
      (u) => this.optimizedOutputs.forEach(
        (d) => u.disabledTargets.add(d)
      )
    ), this.enabledOptimizedOutputs.size > 0 && t.getRenderTargets().forEach(
      (d) => this.enabledOptimizedOutputs.forEach(
        (f) => d.disabledTargets.delete(f)
      )
    )), n.setRenderTarget(l), n.setScissor(
      {
        x: r.x,
        y: r.y,
        width: o.width,
        height: o.height
      },
      l
    ), c && n.clearColor([
      a[0],
      a[1],
      a[2],
      a[3]
    ]), n.setViewport({
      x: r.x,
      y: r.y,
      width: o.width,
      height: o.height
    }), t.clearFlags && t.clearFlags.length > 0 ? n.clear(
      c,
      t.clearFlags.indexOf(ks.DEPTH) > -1,
      t.clearFlags.indexOf(ks.STENCIL) > -1
    ) : n.clear(!1), n.render(e, l, t.props.glState), t.lastFrameTime = this.frameMetrics.currentTime;
  }
  /**
   * This must be executed when the canvas changes size so that we can
   * re-calculate the scenes and views dimensions for handling all of our
   * rendered elements.
   */
  fitContainer(e) {
    if (!this.context || In(this.context.canvas)) return;
    const t = this.context.canvas.parentElement;
    if (t) {
      const n = this.context.canvas;
      n.className = "", n.setAttribute("style", ""), t.style.position = "relative", n.style.position = "absolute", n.style.left = "0xp", n.style.top = "0xp", n.style.width = "100%", n.style.height = "100%", n.setAttribute("width", ""), n.setAttribute("height", "");
      const s = t.getBoundingClientRect(), r = n.getBoundingClientRect();
      this.resize(r.width || 100, s.height || 100);
    }
  }
  /**
   * This gathers all the overlap views of every view
   */
  gatherViewDrawDependencies() {
    if (!this.sceneDiffs) return;
    this.viewDrawDependencies.clear();
    const e = this.sceneDiffs.items, t = this.renderer.getRenderSize();
    for (let n = 0, s = e.length; n < s; n++) {
      const r = e[n];
      for (let o = 0, a = r.renderViews.length; o < a; ++o) {
        const c = r.renderViews[o];
        c.willUseView();
        let l = new Z({
          width: t[0],
          height: t[1],
          x: 0,
          y: 0
        });
        if (c.renderTarget) {
          const d = (Array.isArray(c.renderTarget) ? c.renderTarget[0] : c.renderTarget).getSize();
          l = new Z({
            width: d[0],
            height: d[1],
            x: 0,
            y: 0
          });
        }
        const h = wa(
          c.props.viewport,
          l,
          this.pixelRatio
        );
        c.fitViewtoViewport(l, h), c.props.camera.update(!0);
      }
    }
    for (let n = 0, s = e.length; n < s; n++) {
      const r = e[n];
      for (let o = 0, a = r.renderViews.length; o < a; ++o) {
        const c = r.renderViews[o], l = [];
        for (let h = 0, u = e.length; h < u; h++)
          if (h !== n) {
            const d = e[h];
            for (let f = 0, p = d.renderViews.length; f < p; ++f) {
              const g = d.renderViews[f];
              c.viewBounds.hitBounds(g.viewBounds) && l.push(g);
            }
          }
        this.viewDrawDependencies.set(c, l);
      }
    }
  }
  /**
   * As users interact with the surface, this provides a quick way to view the
   * latest interaction that occurred from User events.
   */
  getCurrentInteraction() {
    return this.userInputManager.currentInteraction;
  }
  /**
   * Retrieves all IO Expanders applied to this surface
   */
  getIOExpanders() {
    return this.ioExpanders;
  }
  /**
   * Retrieves the controller for sorting the IO for the layers.
   */
  getIOSorting() {
    return this.ioSorting;
  }
  /**
   * Retrieves all shader transforms applied to this surface.
   */
  getShaderTransforms() {
    return this.shaderTransforms;
  }
  /**
   * Retrieves all outputs the surface
   */
  getOptimizedOutputs() {
    return this.enabledOptimizedOutputs;
  }
  /**
   * This allws for querying a view's screen bounds. Null i;s returned if the
   * view id specified does not exist.
   */
  getViewSize(e) {
    for (let t = 0, n = this.sceneDiffs.items.length; t < n; ++t) {
      const r = this.sceneDiffs.items[t].viewDiffs.getByKey(e);
      if (r)
        return r.renderTarget ? r.viewBounds : r.screenBounds;
    }
    return null;
  }
  /**
   * This queries a view's window into a world's space.
   */
  getViewWorldBounds(e) {
    for (let t = 0, n = this.sceneDiffs.items.length; t < n; ++t) {
      const r = this.sceneDiffs.items[t].viewDiffs.getByKey(e);
      if (r)
        if (r.screenBounds) {
          const o = r.projection.viewToWorld([0, 0]), a = r.projection.screenToWorld([
            r.screenBounds.right,
            r.screenBounds.bottom
          ]);
          return new Z({
            bottom: a[1],
            left: o[0],
            right: a[0],
            top: o[1]
          });
        } else
          return null;
    }
    return null;
  }
  /**
   * Retrieves the projection methods for a given view, null if the view id does
   * not exist in the surface
   */
  getProjections(e) {
    for (let t = 0, n = this.sceneDiffs.items.length; t < n; ++t) {
      const r = this.sceneDiffs.items[t].viewDiffs.getByKey(e);
      if (r) return r.projection;
    }
    return null;
  }
  /**
   * This is the beginning of the system. This should be called immediately
   * after the surface is constructed. We make this mandatory outside of the
   * constructor so we can make it follow an async pattern.
   */
  async init(e) {
    var n;
    if (this.context) return this;
    this.pixelRatio = e.pixelRatio || this.pixelRatio, this.pixelRatio < 1 && (this.pixelRatio = 1);
    const t = this.initGL(e);
    return t ? (this.context = t, this.gl ? ((n = e.optimizedOutputTargets) == null || n.forEach(
      (s) => this.optimizedOutputs.add(s)
    ), this.initUserInputManager(e), await this.initResources(e), await this.initIOExpanders(e), await this.initShaderTransforms(e)) : console.warn(
      "Could not establish a GL context. Layer Surface will be unable to render"
    ), this.readyResolver.resolve(this), this) : (this.readyResolver.reject({
      error: Ac.NO_WEBGL_CONTEXT,
      message: "Could not establish a webgl context. Surface is being destroyed to free resources."
    }), this.destroy(), this);
  }
  /**
   * This initializes the Canvas GL contexts needed for rendering.
   */
  initGL(e) {
    const t = e.context;
    if (!t) return null;
    const n = t.width, s = t.height;
    let r = !0;
    const o = Object.assign(
      {
        alpha: !1,
        antialias: !1,
        preserveDrawingBuffer: !1,
        premultiplyAlpha: !1
      },
      e.rendererOptions
    );
    return this.renderer = new Du({
      // Context supports rendering to an alpha canvas only if the background
      // color has a transparent Alpha value.
      alpha: o.alpha,
      // Yes to antialias! Make it preeeeetty!
      antialias: o.antialias,
      // Make the GL use an existing canvas rather than generate another
      canvas: t,
      // If it's true it allows us to snapshot the rendering in the canvas
      // But we dont' always want it as it makes performance drop a bit.
      preserveDrawingBuffer: o.preserveDrawingBuffer,
      // This indicates if the information written to the canvas is going to be
      // written as premultiplied values or if they will be standard rgba
      // values. Helps with compositing with the DOM.
      premultipliedAlpha: o.premultipliedAlpha,
      // Let's us know if there is no valid webgl context to work with or not
      onNoContext: () => {
        r = !1;
      }
    }), !r || !this.renderer.gl ? null : (this.context = this.renderer.gl, this.resourceManager && this.resourceManager.setWebGLRenderer(this.renderer), this.setRendererSize(n, s), this.renderer.setPixelRatio(this.pixelRatio), this.renderer.gl);
  }
  /**
   * Initializes the expanders that should be applied to the surface for layer
   * processing.
   */
  initIOExpanders(e) {
    const t = sm();
    Array.isArray(e.ioExpansion) || e.ioExpansion === void 0 ? this.ioExpanders = e.ioExpansion && e.ioExpansion.slice(0) || t.slice(0) || [] : e.ioExpansion instanceof Function && (this.ioExpanders = e.ioExpansion(t));
    const n = this.resourceManager.getIOExpansion();
    this.ioExpanders = this.ioExpanders.concat(n);
  }
  /**
   * Initializes the shader transforms that will be applied to every shader
   * rendered with this surface.
   */
  initShaderTransforms(e) {
    const t = om();
    Array.isArray(e.shaderTransforms) || e.shaderTransforms === void 0 ? this.shaderTransforms = e.shaderTransforms && e.shaderTransforms.slice(0) || t.slice(0) || [] : e.shaderTransforms instanceof Function && (this.shaderTransforms = e.shaderTransforms(t));
  }
  /**
   * Initializes elements for handling mouse interactions with the canvas.
   */
  initUserInputManager(e) {
    if (!this.context) return;
    const t = [new Jg()].concat(e.eventManagers || []);
    this.userInputManager = new qg(
      this.context.canvas,
      this,
      t,
      e.handlesWheelEvents
    );
  }
  /**
   * This initializes resources needed or requested such as textures or render
   * surfaces.
   */
  async initResources(e) {
    const t = rm();
    this.resourceManager = new vh(), this.resourceManager.setWebGLRenderer(this.renderer), (e.resourceManagers && e.resourceManagers.slice(0) || t.slice(0) || []).forEach((s) => {
      this.resourceManager.setManager(s.type, s.manager);
    });
  }
  /**
   * Use this to establish the rendering pipeline the application should be
   * using at the current time.
   *
   * NOTE: If you update the pipeline on a loop of any sort, you will want to
   * await the pipeline to complete it's diff before you issue a draw command.
   * Failure to do so invites undefined behavior which often causes elements
   * tobe comepltely not rendered at all in many cases.
   */
  async pipeline(e) {
    e.resources && await this.resourceDiffs.diff(e.resources), e.scenes && await this.sceneDiffs.diff(e.scenes), this.gatherViewDrawDependencies();
  }
  /**
   * Handles printing discovered issues with layers to the console to help with
   * transparency for developing and debugging.
   */
  printLayerErrors(e) {
    e.length > 0 && (console.warn(
      "Some layers errored during their draw update. These layers will be removed. They can be re-added if render() is called again:",
      e.map((t) => t[0].id)
    ), e.forEach((t) => {
      if (console.warn(`Layer ${t[0].id} removed for the following error:`), t[1]) {
        const n = t[1].stack || t[1].message;
        if (console.error(n), n.indexOf("RangeError") > -1 || n.indexOf("Source is too large") > -1) {
          const s = t[0], r = s.bufferManager.changeListContext || [];
          let o, a = 0;
          for (let c = 0, l = r.length; c < l; ++c) {
            const [h] = r[c];
            s.shaderIOInfo.instanceAttributes.forEach((u) => {
              u.update(h).length !== u.size && (o || (o = [
                "Example instance returned the wrong sized value for an attribute:",
                h,
                u
              ]), a++);
            });
          }
          o && (console.error(
            "The following output shows discovered issues related to the specified error"
          ), console.error(
            `Instances are returning too large IO for an attribute
`,
            o[0],
            o[1],
            o[2],
            "Total errors for too large IO values",
            a
          ));
        }
      }
    }));
  }
  /**
   * This resizes the canvas and retains pixel ratios amongst all of the
   * resources involved.
   */
  resize(e, t, n) {
    if (this.pixelRatio = n || this.pixelRatio, this.pixelRatio < 1 && (this.pixelRatio = 1), this.setRendererSize(e, t), this.renderer.setPixelRatio(this.pixelRatio), this.userInputManager.resize(), this.resourceManager.resize(), this.sceneDiffs) {
      const s = this.sceneDiffs.items;
      for (let r = 0, o = s.length; r < o; ++r) {
        const a = s[r];
        for (let c = 0, l = a.renderViews.length; c < l; ++c) {
          const h = a.renderViews[c];
          h.pixelRatio = this.pixelRatio, h.props.camera.update(!0);
        }
      }
    }
    this.gatherViewDrawDependencies();
  }
  /**
   * This flags all views to fully re-render
   */
  redraw() {
    for (let e = 0, t = this.sceneDiffs.items.length; e < t; ++e) {
      const n = this.sceneDiffs.items[e];
      for (let s = 0, r = n.renderViews.length; s < r; ++s) {
        const o = n.renderViews[s];
        o.needsDraw = !0;
      }
    }
  }
  /**
   * This applies a new size to the renderer and resizes any additional
   * resources that requires being sized along with the renderer.
   */
  setRendererSize(e, t) {
    e = e || 100, t = t || 100, this.renderer.setSize(e, t);
  }
  /**
   * This allows a specified optimized output target to render next draw.
   */
  enableOptimizedOutput(e) {
    this.enabledOptimizedOutputs.add(e);
  }
}
const Jo = class Jo extends Bt {
  draw() {
    this.props.commands(this.surface);
  }
  /** The layer renders nothing, thus does not need a shader object */
  initShader() {
    return null;
  }
};
Jo.defaultProps = {
  data: new oe(),
  key: "",
  commands: () => {
  }
};
let io = Jo;
class Ne extends Bt {
  constructor(e, t, n) {
    super(e, t, n);
  }
  /**
   * Force the world2D methods as the base methods
   */
  baseShaderModules(e) {
    const t = super.baseShaderModules(e);
    return t.vs.push("world2D"), t;
  }
}
const Eh = `// These are projection methods utilizing the simpler camera 2d approach.
// This assumes we have a 3D camera projection which should be preferably orthographic layered with simpler 2D camera
// controls for manipulating the 2D world.
vec3 cameraSpace(vec3 world) {
  return (world + cameraOffset) * cameraScale2D;
}

vec3 cameraSpaceSize(vec3 worldSize) {
  return worldSize * cameraScale2D;
}

vec4 clipSpace(vec3 world) {
  return (viewProjection) * vec4(cameraSpace(world), 1.0);
}

vec4 clipSpaceSize(vec3 worldSize) {
  return (viewProjection) * vec4(cameraSpaceSize(worldSize), 0.0);
}
`, lm = `
These are projection methods and camera
related constants associated with a
View2D.

Methods:
vec3 cameraSpace(vec3 world);
vec3 cameraSpaceSize(vec3 worldSize);
vec4 clipSpace(vec3 world);
vec4 clipSpaceSize(vec3 worldSize);

Constants:
mat4 projection;
mat4 view;
mat4 viewProjection;
vec3 cameraOffset;
vec3 cameraPosition;
vec3 cameraScale;
vec3 cameraScale2D;
vec3 cameraRotation;
vec2 viewSize;
float pixelRatio;
`;
me.register([
  {
    moduleId: "world2D",
    description: lm,
    content: Eh,
    compatibility: A.ALL,
    uniforms: (i) => i instanceof Ne ? [
      // This injects the projection matrix from the view camera
      {
        name: "projection",
        size: _.MATRIX4,
        update: () => i.view.props.camera.projection
      },
      // This injects the model view matrix from the view camera
      {
        name: "view",
        size: _.MATRIX4,
        update: () => i.view.props.camera.view
      },
      {
        name: "viewProjection",
        size: _.MATRIX4,
        update: () => i.view.props.camera.viewProjection
      },
      // This injects a 2D camera's offset
      {
        name: "cameraOffset",
        size: _.THREE,
        update: () => i.view.props.camera instanceof si ? i.view.props.camera.control2D.offset : [0, 0, 0]
      },
      // This injects the camera's current position
      {
        name: "cameraPosition",
        size: _.THREE,
        update: () => i.view.props.camera.position
      },
      // This injects the camera's current scale
      {
        name: "cameraScale",
        size: _.THREE,
        update: () => i.view.props.camera.scale
      },
      // This injects the camera's 2D current scale
      {
        name: "cameraScale2D",
        size: _.THREE,
        update: () => i.view.props.camera instanceof si ? i.view.props.camera.scale2D : [1, 1, 1]
      },
      // This injects the camera's Euler rotation
      {
        name: "cameraRotation",
        size: _.THREE,
        update: () => i.view.props.camera.scale
      },
      // This injects the pixel width and height of the view
      {
        name: "viewSize",
        size: _.TWO,
        update: () => [
          i.view.viewBounds.width,
          i.view.viewBounds.height
        ]
      },
      // This injects the current layer's pixel ratio so pixel ratio dependent
      // items can react to it Things like gl_PointSize will need this metric
      // if not working in clip space
      {
        name: "pixelRatio",
        size: _.ONE,
        update: () => [i.view.pixelRatio]
      }
    ] : (console.warn(
      "A shader requested the module world2D; however, the layer the shader comes from is NOT a Layer2D which is",
      "required for the module to work."
    ), [])
  }
]);
var L = /* @__PURE__ */ ((i) => (i[i.BottomLeft = 0] = "BottomLeft", i[i.BottomMiddle = 1] = "BottomMiddle", i[i.BottomRight = 2] = "BottomRight", i[i.Custom = 3] = "Custom", i[i.Middle = 4] = "Middle", i[i.MiddleLeft = 5] = "MiddleLeft", i[i.MiddleRight = 6] = "MiddleRight", i[i.TopLeft = 7] = "TopLeft", i[i.TopMiddle = 8] = "TopMiddle", i[i.TopRight = 9] = "TopRight", i))(L || {}), Zt = /* @__PURE__ */ ((i) => (i[i.ALWAYS = 1] = "ALWAYS", i[i.BOUND_MAX = 2] = "BOUND_MAX", i[i.NEVER = 3] = "NEVER", i))(Zt || {}), hm = /* @__PURE__ */ ((i) => (i[i.TOP_LEFT = 0] = "TOP_LEFT", i[i.TOP_MIDDLE = 1] = "TOP_MIDDLE", i[i.TOP_RIGHT = 2] = "TOP_RIGHT", i[i.MIDDLE_LEFT = 3] = "MIDDLE_LEFT", i[i.MIDDLE = 4] = "MIDDLE", i[i.MIDDLE_RIGHT = 5] = "MIDDLE_RIGHT", i[i.BOTTOM_LEFT = 6] = "BOTTOM_LEFT", i[i.BOTTOM_MIDDLE = 7] = "BOTTOM_MIDDLE", i[i.BOTTOM_RIGHT = 8] = "BOTTOM_RIGHT", i))(hm || {});
class um extends po {
  constructor(e) {
    super({}), this._uid = U(), this.isPanning = !1, this.isScaling = !1, this.panFilter = (t, n, s) => t, this.scaleFilter = (t, n, s) => t, this.startViews = [], this.optimizedViews = /* @__PURE__ */ new Set(), this.cameraImmediateAnimation = Do.immediate(0), this.targetTouches = /* @__PURE__ */ new Set(), this.onRangeChanged = (t, n) => {
    }, this.startViewDidStart = !1, this.applyBounds = () => {
      if (this.bounds && this.camera) {
        const t = this.getView(this.bounds.view);
        this.applyScaleBounds(), t && (this.camera.control2D.getOffset()[0] = this.boundsHorizontalOffset(
          t,
          this.bounds
        ), this.camera.control2D.getOffset()[1] = this.boundsVerticalOffset(
          t,
          this.bounds
        ));
      }
    }, this.applyScaleBounds = () => {
      this.camera && this.bounds && (this.bounds.scaleMin && this.camera.control2D.setScale(
        _o(this.camera.control2D.getScale(), this.bounds.scaleMin)
      ), this.bounds.scaleMax && this.camera.control2D.setScale(
        Ao(this.camera.control2D.getScale(), this.bounds.scaleMax)
      ));
    }, this.handleCameraViewChange = (t, n) => {
      if (n !== this.startViews[0]) return;
      const s = this.surface.getProjections(n);
      s && this.onRangeChanged(t, s);
    }, e.bounds && this.setBounds(e.bounds), this._camera = e.camera, this.scaleFactor = e.scaleFactor || 1e3, this.ignoreCoverViews = e.ignoreCoverViews || !1, this.twoFingerPan = e.twoFingerPan || !1, e.startView && (Array.isArray(e.startView) ? (this.startViews = e.startView, this._camera.control2D.setViewChangeHandler(
      this.handleCameraViewChange
    )) : (this.startViews = [e.startView], this._camera.control2D.setViewChangeHandler(
      this.handleCameraViewChange
    ))), this.panFilter = e.panFilter || this.panFilter, this.scaleFilter = e.scaleFilter || this.scaleFilter, this.onRangeChanged = e.onRangeChanged || this.onRangeChanged, e.wheelShouldScroll && (this.wheelShouldScroll = e.wheelShouldScroll);
  }
  /** Unique identifier of this controller */
  get uid() {
    return this._uid;
  }
  /** This is the camera that this controller will manipulate */
  get camera() {
    return this._camera;
  }
  /**
   * Calculation for adhering to an anchor - x-axis offset only.
   */
  anchoredByBoundsHorizontal(e, t) {
    switch (t.anchor) {
      case 0:
      case 3:
      case 6:
        return -(t.worldBounds.left - t.screenPadding.left / this.camera.control2D.getScale()[0]);
      case 1:
      case 4:
      case 7:
        return -(t.worldBounds.right - t.worldBounds.width / 2 - 0.5 * ((e.screenBounds.width + t.screenPadding.right) / this.camera.control2D.getScale()[0]));
      case 2:
      case 5:
      case 8:
        return -(t.worldBounds.right - (e.screenBounds.width - t.screenPadding.right) / this.camera.control2D.getScale()[0]);
    }
  }
  /**
   * Calculation for adhering to an anchor - y-axis offset only.
   */
  anchoredByBoundsVertical(e, t) {
    switch (t.anchor) {
      case 0:
      case 1:
      case 2:
        return -(t.worldBounds.top - t.screenPadding.top / this.camera.control2D.getScale()[1]);
      case 3:
      case 4:
      case 5:
        return -(t.worldBounds.bottom - t.worldBounds.height / 2 - 0.5 * ((e.screenBounds.height + t.screenPadding.bottom) / this.camera.control2D.getScale()[1]));
      case 6:
      case 7:
      case 8:
        return -(t.worldBounds.bottom - (e.screenBounds.height - t.screenPadding.bottom) / this.camera.control2D.getScale()[1]);
    }
  }
  /**
   * Returns offset on x-axis due to current bounds and anchor.
   */
  boundsHorizontalOffset(e, t) {
    const n = e.projection.worldToScreen([
      t.worldBounds.left,
      t.worldBounds.top
    ]), s = e.projection.worldToScreen([
      t.worldBounds.right,
      t.worldBounds.bottom
    ]);
    return s[0] - n[0] + t.screenPadding.left + t.screenPadding.right - e.screenBounds.width < 0 ? this.anchoredByBoundsHorizontal(e, t) : s[0] < e.screenBounds.right - t.screenPadding.right ? -t.worldBounds.right + (e.screenBounds.width - t.screenPadding.right) / this.camera.control2D.getScale()[0] : n[0] > e.screenBounds.left + t.screenPadding.left ? -t.worldBounds.left + t.screenPadding.left / this.camera.control2D.getScale()[0] : this.camera.control2D.getOffset()[0];
  }
  /**
   * Returns offset on y-axis due to current bounds and anchor.
   */
  boundsVerticalOffset(e, t) {
    const n = e.projection.worldToScreen([
      t.worldBounds.left,
      t.worldBounds.top
    ]), s = e.projection.worldToScreen([
      t.worldBounds.right,
      t.worldBounds.bottom
    ]);
    return s[1] - n[1] + t.screenPadding.top + t.screenPadding.bottom - e.screenBounds.height < 0 ? this.anchoredByBoundsVertical(e, t) : s[1] < e.screenBounds.bottom - t.screenPadding.bottom ? -t.worldBounds.bottom + (e.screenBounds.height - t.screenPadding.bottom) / this.camera.control2D.getScale()[1] : n[1] > e.screenBounds.top + t.screenPadding.top ? -t.worldBounds.top + t.screenPadding.top / this.camera.control2D.getScale()[0] : this.camera.control2D.getOffset()[1];
  }
  canStart(e) {
    return this.startViews.length === 0 || this.startViews && this.startViews.indexOf(e) > -1 || this.startViewDidStart && this.ignoreCoverViews;
  }
  /**
   * Centers the camera on a position. Must provide a reference view.
   */
  centerOn(e, t) {
    if (!this.camera.control2D.surface) return;
    const n = this.camera.control2D.surface.getViewSize(e);
    if (!n) return;
    const s = [n.width / 2, n.height / 2, 0], r = Jt(
      t,
      cr(s, this.camera.control2D.getScale())
    ), o = ut(r, -1);
    this.setOffset(e, o);
  }
  /**
   * Performs the panning operation for the camera
   *
   * @param allViews This is all of the related views under the event interactions
   * @param relativeView This is the view that performs the projections related to the operation
   * @param allViews All the views associated with the operation or event interaction
   * @param delta This is the amount of panning being requested to happen
   */
  doPan(e, t, n) {
    let s = on(ar(n, this.camera.control2D.getScale()), 0);
    this.panFilter && (s = this.panFilter(s, t, e)), this.camera.control2D.getOffset()[0] += s[0], this.camera.control2D.getOffset()[1] += s[1], this.applyBounds(), this.onRangeChanged(this.camera, t.projection), this.applyBounds(), this.camera.control2D.update();
  }
  /**
   * Scales the camera relative to a point and a view.
   *
   * @param focalPoint The point the scaling happens around
   * @param targetView The relative view this operation happens in relation to
   * @param deltaScale The amount of scaling per axis that should happen
   */
  doScale(e, t, n, s) {
    const r = t.projection.screenToWorld(e), o = this.camera.control2D.getScale()[0] || 1, a = this.camera.control2D.getScale()[1] || 1;
    this.scaleFilter && (s = this.scaleFilter(s, t, n)), this.camera.control2D.getScale()[0] = o + s[0], this.camera.control2D.getScale()[1] = a + s[1], this.applyScaleBounds();
    const c = t.projection.screenToWorld(e), l = we(r, c);
    this.camera.control2D.getOffset()[0] -= l[0], this.camera.control2D.getOffset()[1] -= l[1], this.applyBounds(), this.onRangeChanged(this.camera, t.projection), this.applyBounds(), this.camera.control2D.update(), this.camera.control2D.animation = this.cameraImmediateAnimation;
  }
  /**
   * This filters a set of touches to be touches that had a valid starting view interaction.
   */
  filterTouchesByValidStart(e) {
    return this.ignoreCoverViews ? e.filter(dp(this.startViews)) : e.filter(up(this.startViews));
  }
  /**
   * Finds a view within the event that matches a start view even if the view is covered by other views at the event's
   * interaction point.
   */
  findCoveredStartView(e) {
    const t = e.target.views.find(
      (n) => this.startViews.indexOf(n.view.id) > -1
    );
    this.startViewDidStart = !!t, t && (this.coveredStartView = t.view);
  }
  /**
   * Evaluates the world bounds the specified view is observing
   *
   * @param viewId The id of the view when the view was generated when the surface was made
   */
  getRange(e) {
    const t = this.getProjection(e), n = this.getViewScreenBounds(e);
    if (t && n) {
      const s = t.screenToWorld([
        n.x,
        n.y
      ]), r = t.screenToWorld([
        n.right,
        n.bottom
      ]);
      return new Z({
        height: r[1] - s[1],
        width: r[0] - s[0],
        x: s[0],
        y: s[1]
      });
    }
    return new Z({ x: 0, y: 0, width: 1, height: 1 });
  }
  getTargetView(e) {
    return this.startViews && !this.ignoreCoverViews ? e.target.view : this.coveredStartView;
  }
  /**
   * Used to aid in handling the pan effect and determine the contextual view targetted.
   */
  handleMouseDown(e) {
    this.startViews && (this.findCoveredStartView(e), e.start && (this.isPanning = this.canStart(e.start.view.id) || this.isPanning));
  }
  /**
   * Aids in understanding how the user is interacting with the views. If a single touch is present, we're panning.
   * If multiple touches are present, we're panning and we're zooming
   */
  handleTouchDown(e) {
    if (this.startViews) {
      const t = this.filterTouchesByValidStart(e.allTouches);
      this.twoFingerPan ? t.length > 1 && (this.isPanning = !0) : t.length > 0 && (this.isPanning = !0), t.length > 1 && (this.isScaling = !0);
      for (let n = 0, s = t.length; n < s; ++n) {
        const r = t[n];
        this.targetTouches.add(r.touch.touch.identifier);
      }
    }
  }
  /**
   * Used to aid in handling the pan effect. Stops panning operations when mouse is up.
   */
  handleMouseUp(e) {
    this.startViewDidStart = !1, this.isPanning = !1, this.optimizedViews.forEach((t) => t.optimizeRendering = !1), this.optimizedViews.clear();
  }
  /**
   * Used to stop panning and scaling effects
   */
  handleTouchUp(e) {
    e.touches.forEach((t) => {
      this.targetTouches.delete(t.touch.touch.identifier), this.targetTouches.size <= 0 && (this.startViewDidStart = !1, this.isPanning = !1, this.optimizedViews.forEach((n) => n.optimizeRendering = !1), this.optimizedViews.clear());
    }), this.isPanning = !1, this.isScaling = !1, this.targetTouches.size > 0 && (this.isPanning = !0), this.targetTouches.size > 1 && (this.isScaling = !0);
  }
  /**
   * Used to stop panning and scaling effects when touches are forcibly ejected from existence.
   */
  handleTouchCancelled(e) {
    e.touches.forEach((t) => {
      this.targetTouches.delete(t.touch.touch.identifier), this.targetTouches.size <= 0 && (this.startViewDidStart = !1, this.isPanning = !1, this.optimizedViews.forEach((n) => n.optimizeRendering = !1), this.optimizedViews.clear());
    }), this.isPanning = !1, this.isScaling = !1, this.targetTouches.size > 0 && (this.isPanning = !0), this.targetTouches.size > 1 && (this.isScaling = !0);
  }
  /**
   * Applies a panning effect by adjusting the camera's offset.
   */
  handleDrag(e) {
    e.start && this.canStart(e.start.view.id) && (e.target.views.forEach((t) => {
      t.view.optimizeRendering = !0, this.optimizedViews.add(t.view);
    }), this.doPan(
      e.target.views.map((t) => t.view),
      e.start.view,
      e.mouse.deltaPosition
    ), this.camera.control2D.animation = this.cameraImmediateAnimation);
  }
  /**
   * Applies panning effect from single or multitouch interaction.
   */
  handleTouchDrag(e) {
    const t = this.filterTouchesByValidStart(e.allTouches);
    if (t.length > 0 && this.isPanning) {
      for (let o = 0, a = t.length; o < a; ++o)
        t[o].target.views.forEach((l) => {
          l.view.optimizeRendering = !0, this.optimizedViews.add(l.view);
        });
      const n = /* @__PURE__ */ new Set(), r = t.reduce((o, a) => {
        for (let c = 0, l = a.target.views.length; c < l; ++c) {
          const h = a.target.views[c];
          n.add(h.view);
        }
        return a.touch.startTime < o.touch.startTime ? a : o;
      }, t[0]).start.view;
      if (this.isPanning && (this.doPan(
        Array.from(n.values()),
        r,
        e.multitouch.centerDelta(t)
      ), this.camera.control2D.animation = this.cameraImmediateAnimation), this.isScaling) {
        const o = e.multitouch.center(t), a = we(
          t[0].touch.currentPosition,
          o
        ), c = we(
          o,
          e.multitouch.centerDelta(t)
        ), l = we(
          t[0].touch.previousPosition,
          c
        ), h = ln(a) / ln(l), u = [
          h * this.camera.scale2D[0] - this.camera.scale2D[0],
          h * this.camera.scale2D[1] - this.camera.scale2D[1],
          0
        ];
        h !== 1 && this.doScale(
          o,
          r,
          Array.from(n.values()),
          u
        );
      }
    }
  }
  /**
   * Applies a scaling effect to the camera for mouse wheel events
   */
  handleWheel(e) {
    if (this.findCoveredStartView(e), this.canStart(e.target.view.id))
      if (this.wheelShouldScroll) {
        const t = [
          -e.mouse.wheel.delta[0],
          e.mouse.wheel.delta[1]
        ];
        e.start && this.doPan(
          e.target.views.map((n) => n.view),
          e.start.view,
          t
        );
      } else {
        const t = this.camera.control2D.getScale()[0] || 1, n = this.camera.control2D.getScale()[1] || 1, s = this.getTargetView(e), r = [
          e.mouse.wheel.delta[1] / this.scaleFactor * t,
          e.mouse.wheel.delta[1] / this.scaleFactor * n,
          1
        ];
        if (!s) {
          console.warn("Could not find target view for wheel event");
          return;
        }
        this.doScale(
          e.screen.position,
          s,
          e.target.views.map((o) => o.view),
          r
        );
      }
  }
  /**
   * Retrieves the current pan of the controlled camera
   */
  get pan() {
    return this.camera.control2D.offset;
  }
  /**
   * Retrieves the current scale of the camera
   */
  get scale() {
    return this.camera.control2D.getScale();
  }
  /**
   * Sets bounds applicable to the supplied view.
   * If no view is supplied, it uses the first in the startViews array
   */
  setBounds(e) {
    this.bounds = e, this.applyBounds();
  }
  /**
   * Tells the controller to set an explicit offset for the camera.
   * Must provide a reference view.
   */
  setOffset(e, t) {
    const n = ct(this.camera.control2D.offset);
    if (this.camera.control2D.getOffset()[0] = t[0], this.camera.control2D.getOffset()[1] = t[1], this.camera.control2D.getOffset()[2] = t[2], this.applyBounds(), this.camera.control2D.surface) {
      const o = this.camera.control2D.surface.getProjections(e);
      o && this.onRangeChanged(this.camera, o);
    }
    this.applyBounds();
    const s = ct(this.camera.control2D.getOffset()), r = this.camera.control2D.animation;
    this.camera.control2D.setOffset(n), this.camera.control2D.animation = this.cameraImmediateAnimation, this.camera.control2D.setOffset(s), this.camera.control2D.animation = r;
  }
  /**
   * This lets you set the visible range of a view based on the view's camera. This will probably not work
   * as expected if the view indicated and this controller do not share the same camera.
   *
   * @param viewId The id of the view when the view was generated when the surface was made
   */
  setRange(e, t) {
    const n = this.getProjection(t), s = this.getViewScreenBounds(t), r = this.getView(t);
    if (n && s && r) {
      const o = Jt(
        [
          s.width / e.width,
          s.height / e.height,
          1
        ],
        this.camera.control2D.getScale()
      );
      this.camera.control2D.setScale(
        ni(
          this.camera.control2D.getScale(),
          this.scaleFilter(o, r, [r])
        )
      );
      const a = Jt(
        [-e.x, -e.y, 0],
        this.camera.control2D.offset
      );
      this.camera.control2D.setOffset(
        ni(
          this.camera.control2D.offset,
          this.scaleFilter(a, r, [r])
        )
      ), this.applyBounds(), this.onRangeChanged(this.camera, r.projection), this.applyBounds();
    }
  }
  /**
   * Applies a handler for the range changing.
   */
  setRangeChangeHandler(e) {
    this.onRangeChanged = e;
  }
}
class dm extends Gi {
  constructor(e, t) {
    super(e), this.offsetFilter = (n) => n, this.scaleFilter = (n) => n, this.base = t.base, this.offsetFilter = t.offsetFilter || this.offsetFilter, this.scaleFilter = t.scaleFilter || this.scaleFilter;
  }
  set offset(e) {
  }
  get offset() {
    return this.offsetFilter(this.base.offset);
  }
  set scale(e) {
  }
  get scale() {
    return this.scaleFilter(this.base.scale);
  }
}
class pv extends si {
  set control2D(e) {
  }
  get control2D() {
    return this._control2D;
  }
  constructor(e) {
    super(), this.base = e.base, this._control2D = new dm(this.base, {
      base: this.base.control2D,
      offsetFilter: e.offsetFilter,
      scaleFilter: e.scaleFilter
    });
  }
}
const fm = new si();
class pm extends Bo {
  constructor() {
    super(...arguments), this.camera = fm;
  }
  /**
   * Maps a coordinate relative to the screen to a coordinate found within the world space.
   */
  screenToWorld(e, t) {
    const n = this.screenToView(e), s = t || [0, 0];
    return s[0] = (n[0] - this.camera.control2D.offset[0] * this.camera.scale2D[0]) / this.camera.scale2D[0], s[1] = (n[1] - this.camera.control2D.offset[1] * this.camera.scale2D[1]) / this.camera.scale2D[1], s;
  }
  /**
   * Makes a ray from the provided point that emanates into 3D space straight
   * into the screen. Since our spaces have 3D tendencies, this can have some
   * useful applications for interacting with the 2D elements in interesting and
   * new ways.
   */
  screenRay(e) {
    const t = this.screenToWorld(e);
    return [
      [t[0], t[1], 0],
      [t[0], t[1], -1]
    ];
  }
  /**
   * Maps a coordinate found within the world to a relative coordinate within the screen space.
   */
  worldToScreen(e, t) {
    const n = [0, 0];
    return n[0] = (e[0] * this.camera.scale2D[0] + this.camera.control2D.offset[0] * this.camera.scale2D[0]) * this.pixelRatio, n[1] = (e[1] * this.camera.scale2D[1] + this.camera.control2D.offset[1] * this.camera.scale2D[1]) * this.pixelRatio, this.viewToScreen(n, t);
  }
  /**
   * Maps a coordinate relative to the view's viewport to a coordinate found within the world.
   */
  viewToWorld(e, t) {
    const n = t || [0, 0], s = e;
    return n[0] = (s[0] - this.camera.control2D.offset[0] * this.camera.scale2D[0]) / this.camera.scale2D[0], n[1] = (s[1] - this.camera.control2D.offset[1] * this.camera.scale2D[1]) / this.camera.scale2D[1], n;
  }
  /**
   * Maps a coordinate found within the world to a relative coordinate within the view's viewport.
   */
  worldToView(e, t) {
    const n = t || [0, 0];
    return n[0] = e[0] * this.camera.scale2D[0] + this.camera.control2D.offset[0] * this.camera.scale2D[0], n[1] = e[1] * this.camera.scale2D[1] + this.camera.control2D.offset[1] * this.camera.scale2D[1], n;
  }
}
function ic(i) {
  return i.projectionType === Fi.ORTHOGRAPHIC;
}
const ea = class ea extends ns {
  constructor(e, t) {
    super(e, t), this.projection = new pm(), this.projection.camera = t.camera || new si();
  }
  /**
   * This operation makes sure we have the view camera adjusted to the new
   * viewport's needs. For default behavior this ensures that the coordinate
   * system has no distortion or perspective, orthographic, top left as 0,0 with
   * +y axis pointing down.
   */
  fitViewtoViewport(e, t) {
    if (ic(this.props.camera)) {
      const n = t.width, s = t.height, r = {
        bottom: -s / 2,
        far: 1e7,
        left: -n / 2,
        near: -100,
        right: n / 2,
        top: s / 2
      }, o = 1 / this.pixelRatio, a = 1 / this.pixelRatio, c = this.props.camera;
      c.projectionOptions = Object.assign(
        c.projectionOptions,
        r
      ), c.position = [
        t.width / (2 * this.pixelRatio),
        t.height / (2 * this.pixelRatio),
        c.position[2]
      ], c.scale = [o, -a, 1], c.lookAt(ni(c.position, [0, 0, -1]), [0, 1, 0]), c.update(), this.projection.viewBounds = t, t.d = this, this.projection.screenBounds = new Z({
        height: this.viewBounds.height / this.pixelRatio,
        width: this.viewBounds.width / this.pixelRatio,
        x: this.viewBounds.x / this.pixelRatio,
        y: this.viewBounds.y / this.pixelRatio
      }), this.screenBounds.d = this;
    } else ic(this.props.camera) || console.warn("View2D does not support non-orthographic cameras.");
  }
  willUpdateProps(e) {
    this.projection.camera = e.camera;
  }
};
ea.defaultProps = {
  key: "",
  camera: new si(),
  viewport: {
    left: 0,
    right: 0,
    bottom: 0,
    top: 0
  }
};
let nr = ea;
const gm = `precision highp float;

varying vec4 vertexColor;

void main() {
  gl_FragColor = vertexColor;
}
`, mm = `\${import: arc}
precision highp float;

/**
  This vertex shader calculates edges whose curve and width is in screen space where the curve is
  bezier curves with 0, 1, and 2 control points.
**/
varying vec4 vertexColor;

void main() {
  // Destructure some of the vec injections
  float startAngle = angle.x + angleOffset;
  float endAngle = angle.y + angleOffset;
  float widthStart = thickness.x;
  float widthEnd = thickness.y;
  // Destructure vertex attribute
  float normal = vertex.x;
  float interpolationTime = vertex.y;
  float interpolationIncrement = 1.0 / vertex.z;
  // Get the position of the current vertex
  vec2 currentPosition = arc(interpolationTime, center, radius, startAngle, endAngle);
  // Get normal with currentPosition and center
  vec2 currentNormal = normalize(currentPosition - center);
  // Get the thickness based on the side we're on
  float lineThickness = mix(widthStart, widthEnd, interpolationTime) / 2.0;
  // Start on the calculated line and push out by the normal's value
  vec2 vertex = currentPosition + currentNormal * (normal * lineThickness);
  // Get the color based on where we are on the line
  vertexColor = mix(colorStart, colorEnd, interpolationTime);

  gl_Position = clipSpace(vec3(vertex, depth));
}
`, xm = `precision highp float;

/**
  This vertex shader calculates edges whose curve and width is in screen space where the curve is
  bezier curves with 0, 1, and 2 control points.
**/
varying vec4 vertexColor;

vec2 interpolation(float t, vec2 center, float radius, float start, float end) {
  float angle = (end - start) * t + start;
  return center + vec2(cos(angle) * radius, sin(angle) * radius);
}

void main() {
  // Destructure some of the vec injections
  float startAngle = angle.x;
  float endAngle = angle.y;
  float widthStart = thickness.x;
  float widthEnd = thickness.y;

  // Convert world points to screen space
  vec4 centerClip = clipSpace(vec3(center, depth));
  vec2 centerScreen = (centerClip.xy + vec2(1.0, 1.0)) * vec2(0.5, 0.5) * viewSize;
  // Destructure position attribute
  float normal = position.x;
  float interpolationTime = position.y;
  float interpolationIncrement = 1.0 / position.z;
  // Get the position of the current vertex
  vec2 currentPosition = interpolation(interpolationTime, centerScreen, radius, startAngle, endAngle);
  // Get normal with currentPosition and center
  vec2 currentNormal = normalize(currentPosition - centerScreen);
  // Get the thickness based on the side we're on
  float lineThickness = mix(widthStart, widthEnd, interpolationTime) / 2.0;
  // Start on the calculated line and push out by the normal's value
  vec2 vertex = currentPosition + currentNormal * (normal * lineThickness);
  // Get the color based on where we are on the line
  vertexColor = mix(colorStart, colorEnd, interpolationTime);
  vertexColor *= vertexColor.a;

  gl_Position = vec4((vertex / viewSize) * vec2(2.0, 2.0) - vec2(1.0, 1.0), centerClip.zw);
  gl_PointSize = 5.0;
}
`;
var vm = /* @__PURE__ */ ((i) => (i[i.NONE = 0] = "NONE", i[i.SCREEN_CURVE = 1] = "SCREEN_CURVE", i))(vm || {});
const ot = class ot extends Ne {
  /**
   * Define our shader and it's inputs
   */
  initShader() {
    const { scaleType: e } = this.props, t = this.props.animate || {}, {
      angle: n,
      angleOffset: s,
      center: r,
      radius: o,
      thickness: a,
      colorStart: c,
      colorEnd: l
    } = t, h = 150, u = {
      0: 1,
      [h * 2 + 2]: -1
    }, d = {
      0: 0,
      [h * 2 + 2]: 1
    };
    let f = 1;
    for (let g = 0; g < h * 2; ++g)
      u[g + 1] = f, d[g + 1] = Math.floor(g / 2) / (h - 1), f *= -1;
    const p = e === 0 ? mm : xm;
    return {
      fs: gm,
      instanceAttributes: [
        {
          easing: r,
          name: ot.attributeNames.center,
          size: S.TWO,
          update: (g) => g.center
        },
        {
          easing: o,
          name: ot.attributeNames.radius,
          size: S.ONE,
          update: (g) => [g.radius]
        },
        {
          name: ot.attributeNames.depth,
          size: S.ONE,
          update: (g) => [g.depth]
        },
        {
          easing: a,
          name: ot.attributeNames.thickness,
          size: S.TWO,
          update: (g) => g.thickness
        },
        {
          easing: n,
          name: ot.attributeNames.angle,
          size: S.TWO,
          update: (g) => g.angle
        },
        {
          easing: s,
          name: ot.attributeNames.angleOffset,
          size: S.ONE,
          update: (g) => [g.angleOffset]
        },
        {
          easing: c,
          name: ot.attributeNames.colorStart,
          size: S.FOUR,
          update: (g) => g.colorStart
        },
        {
          easing: l,
          name: ot.attributeNames.colorEnd,
          size: S.FOUR,
          update: (g) => g.colorEnd
        }
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: _.ONE,
          update: (g) => [1]
        }
      ],
      vertexAttributes: [
        {
          name: "vertex",
          size: ke.THREE,
          update: (g) => [
            // Normal
            u[g],
            // The side of the quad
            d[g],
            // The number of vertices
            h * 2
          ]
        }
      ],
      vertexCount: h * 2 + 2,
      vs: p
    };
  }
  getMaterialOptions() {
    return Object.assign({}, it.transparentShapeBlending, {
      culling: x.Material.CullSide.NONE
    });
  }
};
ot.defaultProps = {
  data: new oe(),
  key: "",
  scaleType: 0
  /* NONE */
}, ot.attributeNames = {
  angle: "angle",
  angleOffset: "angleOffset",
  center: "center",
  colorEnd: "colorEnd",
  colorStart: "colorStart",
  depth: "depth",
  radius: "radius",
  thickness: "thickness"
};
let nc = ot;
var bm = Object.defineProperty, Vi = (i, e, t, n) => {
  for (var s = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = o(e, t, s) || s);
  return s && bm(e, t, s), s;
};
const yi = class Rh extends nt {
  constructor(e) {
    super(e), this.angle = [0, Math.PI], this.colorEnd = [1, 1, 1, 1], this.colorStart = [1, 1, 1, 1], this.center = [0, 0], this.depth = 0, this.angleOffset = 0, this.radius = 1, this.thickness = [5, 5], Xe(this, Rh), this.angle = e.angle || this.angle, this.colorEnd = e.colorEnd || this.colorEnd, this.colorStart = e.colorStart || this.colorStart, this.center = e.center || this.center, this.depth = e.depth || this.depth, this.radius = e.radius || this.radius, this.thickness = e.thickness || this.thickness;
  }
};
Vi([
  I
], yi.prototype, "angle");
Vi([
  I
], yi.prototype, "colorEnd");
Vi([
  I
], yi.prototype, "colorStart");
Vi([
  I
], yi.prototype, "center");
Vi([
  I
], yi.prototype, "depth");
Vi([
  I
], yi.prototype, "angleOffset");
Vi([
  I
], yi.prototype, "radius");
Vi([
  I
], yi.prototype, "thickness");
let gv = yi;
const wm = `precision highp float;

varying vec4 vertexColor;
varying float edgeSharpness;
varying float edgeSharpnessBase;
varying vec2 pointCoord;

float circle(vec2 coord, float radius){
  vec2 dist = coord - vec2(0.5);

  return 1.0 - smoothstep(
    radius - (radius * edgeSharpness),
    radius + (radius * edgeSharpnessBase),
    dot(dist, dist) * 4.0
  );
}

void main() {
  float step_factor = circle(pointCoord, 1.0);

  // \${out: color} = hey
  \${out: color} = mix(
    vec4(0.0, 0.0, 0.0, 0.0),
    vertexColor,
    step_factor
  );
  // \${out: color} = vec4(1., 0., 0., 1.);

  if (color.a == 0.0) discard;
}
`, Tm = `// Shader for rendering simple circles on a quad, using the fragment shader to create the 'roundness' of the shape.
precision highp float;

varying vec4 vertexColor;
varying float edgeSharpness;
varying float edgeSharpnessBase;
varying vec2 pointCoord;

void main() {
  vertexColor = color;
  vertexColor.a *= layerOpacity;
  float size = radius * cameraScale2D.x * pixelRatio;
  edgeSharpness = mix(0.8, 0.0, min((size * 6.0 * pixelRatio) / (45.0 * pixelRatio), 1.0));
  edgeSharpnessBase = mix(0.1, 0.0, min((size * 6.0 * pixelRatio) / (45.0 * pixelRatio), 1.0));
  pointCoord = (normals.xy + vec2(1.0, 1.0)) / 2.0;

  // Center within clip space
  vec4 clipCenter = clipSpace(vec3(center, depth));
  // Center in screen space
  vec2 screenCenter = (clipCenter.xy + vec2(1.0, 1.0)) * vec2(0.5, 0.5) * viewSize;
  // Position in screen space
  vec2 vertex = (normals.xy * size) + screenCenter;
  // Position back to clip space
  gl_Position = vec4((vertex / viewSize) * vec2(2.0, 2.0) - vec2(1.0, 1.0), clipCenter.zw);
}
`, ym = `precision highp float;

varying vec4 vertexColor;
varying float edgeSharpness;
varying float edgeSharpnessBase;

float circle(vec2 coord, float radius){
  vec2 dist = coord - vec2(0.5);

  return 1.0 - smoothstep(
    radius - (radius * edgeSharpness),
    radius + (radius * edgeSharpnessBase),
    dot(dist, dist) * 4.0
  );
}

void main() {
  float step_factor = circle(gl_PointCoord, 1.0);

  // \${out: color} = hey
  \${out: color} = mix(
    vec4(0.0, 0.0, 0.0, 0.0),
    vertexColor,
    step_factor
  );

  if (color.a == 0.0) discard;
}
`, Em = `// This shader renders our circles with POINTS mode. This can perform better for more intensive scenarios but comes at
// the cost of hardware limitations such as max POINT size and potential involuntary hardware culling decisions for the
// viewport.
precision highp float;

varying vec4 vertexColor;
varying float edgeSharpness;
varying float edgeSharpnessBase;

void main() {
  vertexColor = color;
  vertexColor.a *= layerOpacity;
  float size = radius * cameraScale2D.x;
  edgeSharpness = mix(0.8, 0.0, min((size * 6.0 * pixelRatio) / (45.0 * pixelRatio), 1.0));
  edgeSharpnessBase = mix(0.1, 0.0, min((size * 6.0 * pixelRatio) / (45.0 * pixelRatio), 1.0));

  // NOTE: for now we keep depth * vertex where vertex is always one since our gl layer does not
  // support drawing non-instanced data yet.
  gl_Position = clipSpace(vec3(center, depth));
  gl_PointSize = size * 2.0 * pixelRatio;
}
`, Ci = class Ci extends Ne {
  /**
   * Define our shader and it's inputs
   */
  initShader() {
    var u, d;
    const { animate: e = {}, usePoints: t = !1, opacity: n = () => 1 } = this.props, {
      center: s,
      radius: r,
      color: o
    } = e, a = [1, 1, -1, -1, 1, -1], c = [-1, 1, -1, 1, 1, -1], l = [
      {
        name: "normals",
        size: ke.TWO,
        update: (f) => [
          // Normal
          a[f],
          // The side of the quad
          c[f]
        ]
      }
    ], h = a.length;
    return {
      // This layer will support changes to the buffering strategy
      instancing: (u = this.props.bufferManagement) == null ? void 0 : u.instancing,
      baseBufferGrowthRate: (d = this.props.bufferManagement) == null ? void 0 : d.baseBufferGrowthRate,
      // Supports a POINTS or TRIANGLES mode for rendering
      drawMode: t ? x.Model.DrawMode.POINTS : x.Model.DrawMode.TRIANGLES,
      vs: t ? Em : Tm,
      fs: t ? [
        {
          outputType: V.COLOR,
          source: ym
        },
        {
          outputType: V.GLOW,
          source: `
              void main() {
                \${out: glow} = color;
              }
              `
        }
      ] : [
        {
          outputType: V.COLOR,
          source: wm
        },
        {
          outputType: V.GLOW,
          source: `
              void main() {
                \${out: glow} = color;
              }
              `
        }
      ],
      instanceAttributes: [
        {
          easing: s,
          name: Ci.attributeNames.center,
          size: S.TWO,
          update: (f) => f.center
        },
        {
          easing: r,
          name: Ci.attributeNames.radius,
          size: S.ONE,
          update: (f) => [f.radius]
        },
        {
          name: Ci.attributeNames.depth,
          size: S.ONE,
          update: (f) => [f.depth]
        },
        {
          easing: o,
          name: Ci.attributeNames.color,
          size: S.FOUR,
          update: (f) => f.color
        }
      ],
      uniforms: [
        {
          name: "layerOpacity",
          size: _.ONE,
          shaderInjection: A.ALL,
          update: (f) => [n()]
        }
      ],
      vertexAttributes: l,
      vertexCount: t ? 1 : h
    };
  }
  getMaterialOptions() {
    return it.transparentShapeBlending;
  }
};
Ci.defaultProps = {
  data: new oe(),
  key: ""
}, Ci.attributeNames = {
  center: "center",
  color: "color",
  depth: "depth",
  radius: "radius"
};
let sc = Ci;
var Rm = Object.defineProperty, yr = (i, e, t, n) => {
  for (var s = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = o(e, t, s) || s);
  return s && Rm(e, t, s), s;
};
const ls = class _h extends nt {
  constructor(e) {
    super(e), this.color = [1, 1, 1, 1], this.depth = 0, this.radius = 0, this.center = [0, 0], Xe(this, _h), this.color = e.color || this.color, this.radius = e.radius || this.radius, this.center = e.center || this.center, this.depth = e.depth || this.depth;
  }
  get width() {
    return this.radius * 2;
  }
  get height() {
    return this.radius * 2;
  }
};
yr([
  I
], ls.prototype, "color");
yr([
  I
], ls.prototype, "depth");
yr([
  I
], ls.prototype, "radius");
yr([
  I
], ls.prototype, "center");
let mv = ls;
const _m = `precision highp float;

varying vec4 vertexColor;

void main() {
  \${out: color} = vertexColor;
}
`, Am = `

precision highp float;

/**
  This vertex shader calculates edges whose curve and width is in screen space where the curve is
  bezier curves with 0, 1, and 2 control points.
**/
varying vec4 vertexColor;

// Interpolation type injection
\${interpolation}

void main() {
  // Destructure vertex attribute
  float normal = vertex.x;
  float interpolationTime = vertex.y;
  float interpolationIncrement = 1.0 / vertex.z;
  // Get the position of the current vertex
  vec2 currentPosition = interpolation(interpolationTime, start, end, control.xy, control.zw);
  // Calculate the next and previous segment's location on the line
  vec2 prePosition = interpolation(interpolationTime - interpolationIncrement, start, end, control.xy, control.zw);
  vec2 nextPosition = interpolation(interpolationTime + interpolationIncrement, start, end, control.xy, control.zw);

  vec2 preLine = prePosition - currentPosition;
  vec2 nextLine = nextPosition - currentPosition;

  // Get a spliced nromal at the joining of two segments to make a crisper curve
  vec2 currentNormal = mix(
    // Pick this value if we're at the beginning of the line
    normalize(vec2(preLine.y, -preLine.x)),
    mix(
      // Pick this value when we're between the ends
      normalize(vec2(preLine.y, -preLine.x) + vec2(-nextLine.y, nextLine.x)),
      // Pick this value if we're at the end of the line
      normalize(vec2(-nextLine.y, nextLine.x)),
      float(vertex.x >= 1.0)
    ),
    float(vertex.x > 0.0)
  );

  // Get the thickness based on the side we're on
  float lineThickness = mix(thickness.x, thickness.y, interpolationTime) / 2.0;
  // Start on the calculated line and push out by the normal's value
  vec2 vertexPos = currentPosition + currentNormal * (normal * lineThickness);
  // Get the color based on where we are on the line
  vertexColor = mix(startColor, endColor, interpolationTime);

  gl_Position = clipSpace(vec3(vertexPos, depth));
  gl_PointSize = 5.0;

  // gl_Position = clipSpace(vec3(0., 0., 0.));
}
`, Im = `/**
 * Makes a linear interpolation between two points
 *
 * @param {vec2} s The start point
 * @param {vec2} e The end point
 * @param {vec2} c The bezier control point
 * @param {float} t The interpolation value [0, 1]
 *
 * @returns {vec2} A point interpolated between the two provided points
 */
vec2 interpolation(float t, vec2 p1, vec2 p2, vec2 c1, vec2 c2) {
  return (1.0 - t) * (1.0 - t) * p1 + 2.0 * t * (1.0 - t) * c1 + t * t * p2;
}
`, Mm = `/**
 * Makes a linear interpolation between two points
 *
 * @param {vec2} s The start point
 * @param {vec2} e The end point
 * @param {vec2} c The bezier control point
 * @param {float} t The interpolation value [0, 1]
 *
 * @returns {vec2} A point interpolated between the two provided points
 */
vec2 interpolation(float t, vec2 p1, vec2 p2, vec2 c1, vec2 c2) {
  float t1 = 1.0 - t;
  return pow(t1, 3.0) * p1 + 3.0 * t * pow(t1, 2.0) * c1 + 3.0 * pow(t, 2.0) * t1 * c2 + pow(t, 3.0) * p2;
}
`, Sm = `/**
 * Makes a linear interpolation between two points
 *
 * @param {vec2} s The start point
 * @param {vec2} e The end point
 * @param {vec2} c The bezier control point
 * @param {float} t The interpolation value [0, 1]
 *
 * @returns {vec2} A point interpolated between the two provided points
 */
vec2 interpolation(float t, vec2 p1, vec2 p2, vec2 c1, vec2 c2) {
  return p1 + (p2 - p1) * t;
}
`, Cm = `/**
  This vertex shader calculates edges based in world space to make an edge based on
  bezier curves with 0, 1, and 2 control points.
**/
precision highp float;



varying vec4 vertexColor;

// Interpolation type injection
\${interpolation}

void main() {
  // Destructure vertex attribute
  float normal = vertex.x;
  float interpolationTime = vertex.y;
  float interpolationIncrement = 1.0 / vertex.z;

  // Convert our world points to screen space
  vec4 startClip = clipSpace(vec3(start, depth));
  vec4 endClip = clipSpace(vec3(end, depth));
  vec2 startScreen = (startClip.xy + vec2(1.0, 1.0)) * vec2(0.5, 0.5) * viewSize;
  vec2 endScreen = (endClip.xy + vec2(1.0, 1.0)) * vec2(0.5, 0.5) * viewSize;
  // Controls for this mode are screen space deltas from the end points
  vec2 control1 = startScreen + vec2(control.x, -control.y) * scaleFactor;
  vec2 control2 = endScreen + vec2(control.z, -control.w) * scaleFactor;

  // Get the position of the current vertex
  vec2 currentPosition = interpolation(interpolationTime, startScreen, endScreen, control1, control2);
  // Calculate the next and previous segment's location on the line
  vec2 prePosition = interpolation(interpolationTime - interpolationIncrement, startScreen, endScreen, control1, control2);
  vec2 nextPosition = interpolation(interpolationTime + interpolationIncrement, startScreen, endScreen, control1, control2);

  vec2 preLine = prePosition - currentPosition;
  vec2 nextLine = nextPosition - currentPosition;

  // Get a spliced nromal at the joining of two segments to make a crisper curve
  vec2 currentNormal = mix(
    // Pick this value if we're at the beginning of the line
    normalize(vec2(preLine.y, -preLine.x)),
    mix(
      // Pick this value when we're between the ends
      normalize(vec2(preLine.y, -preLine.x) + vec2(-nextLine.y, nextLine.x)),
      // Pick this value if we're at the end of the line
      normalize(vec2(-nextLine.y, nextLine.x)),
      float(vertex.x >= 1.0)
    ),
    float(vertex.x > 0.0)
  );

  // Get the thickness based on the side we're on
  float lineThickness = mix(thickness.x, thickness.y, interpolationTime) / 2.0;
  // Start on the calculated line and push out by the normal's value
  vec2 vertexPos = currentPosition + currentNormal * (-normal * lineThickness * scaleFactor);
  // Get the color based on where we are on the line
  vertexColor = mix(startColor, endColor, interpolationTime);

  gl_Position = vec4((vertexPos / viewSize) * vec2(2.0, 2.0) - vec2(1.0, 1.0), startClip.zw);
  gl_PointSize = 5.0;
}
`;
var zs = /* @__PURE__ */ ((i) => (i[i.NONE = 0] = "NONE", i[i.SCREEN_CURVE = 1] = "SCREEN_CURVE", i))(zs || {}), Kt = /* @__PURE__ */ ((i) => (i[i.LINE = 0] = "LINE", i[i.BEZIER = 1] = "BEZIER", i[i.BEZIER2 = 2] = "BEZIER2", i))(Kt || {}), Ah = /* @__PURE__ */ ((i) => (i[i.ALL = 0] = "ALL", i[i.PASS_Y = 1] = "PASS_Y", i[i.PASS_X = 2] = "PASS_X", i))(Ah || {});
function Om(i) {
  return [i[0][0], i[0][1], i[1][0], i[1][1]];
}
const Lm = {
  [Kt.LINE]: Sm,
  [Kt.BEZIER]: Im,
  [Kt.BEZIER2]: Mm
}, Ye = class Ye extends Ne {
  /**
   * Define our shader and it's inputs
   */
  initShader() {
    const {
      animate: e = {},
      scaleFactor: t = () => 1,
      type: n,
      scaleType: s = zs.NONE,
      smoothness: r = 50
    } = this.props, {
      end: o,
      start: a,
      startColor: c,
      endColor: l,
      control: h,
      thickness: u
    } = e, d = n === Kt.LINE ? 2 : r, f = {
      0: 1,
      [d * 2 + 2]: -1
    }, p = {
      0: 0,
      [d * 2 + 2]: 1
    };
    let g = 1;
    for (let b = 0; b < d * 2; ++b)
      f[b + 1] = g, p[b + 1] = Math.floor(b / 2) / (d - 1), g *= -1;
    const m = {
      interpolation: Lm[n]
    }, v = sn({
      options: m,
      required: {
        name: "Edge Layer",
        values: ["interpolation"]
      },
      shader: s === zs.NONE ? Am : Cm,
      // We do not want to remove any other templating options present
      onToken: (b, w) => b in m ? w : `\${${b}}`
    });
    return {
      fs: [
        {
          outputType: V.COLOR,
          source: _m
        }
      ],
      instanceAttributes: [
        {
          easing: c,
          name: Ye.attributeNames.startColor,
          size: S.FOUR,
          update: (b) => b.startColor
        },
        {
          easing: l,
          name: Ye.attributeNames.endColor,
          size: S.FOUR,
          update: (b) => b.endColor
        },
        {
          easing: a,
          name: Ye.attributeNames.start,
          size: S.TWO,
          update: (b) => b.start
        },
        {
          easing: o,
          name: Ye.attributeNames.end,
          size: S.TWO,
          update: (b) => b.end
        },
        {
          easing: u,
          name: Ye.attributeNames.thickness,
          size: S.TWO,
          update: (b) => b.thickness
        },
        {
          name: Ye.attributeNames.depth,
          size: S.ONE,
          update: (b) => [b.depth]
        },
        n === Kt.LINE ? {
          easing: h,
          name: Ye.attributeNames.control,
          size: S.FOUR,
          update: (b) => [0, 0, 0, 0]
        } : null,
        n === Kt.BEZIER ? {
          easing: h,
          name: Ye.attributeNames.control,
          size: S.FOUR,
          update: (b) => [b.control[0][0], b.control[0][1], 0, 0]
        } : null,
        n === Kt.BEZIER2 ? {
          easing: h,
          name: Ye.attributeNames.control,
          size: S.FOUR,
          update: (b) => Om(b.control)
        } : null
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: _.ONE,
          update: (b) => [t()]
        },
        {
          name: "layerOpacity",
          size: _.ONE,
          update: (b) => [
            this.props.opacity === void 0 ? 1 : this.props.opacity
          ]
        }
      ],
      vertexAttributes: [
        {
          name: "vertex",
          size: ke.THREE,
          update: (b) => [
            // Normal
            f[b],
            // The side of the quad
            p[b],
            // The number of vertices
            d * 2
          ]
        }
      ],
      vertexCount: d * 2 + 2,
      vs: v.shader
    };
  }
  getMaterialOptions() {
    return it.transparentShapeBlending;
  }
};
Ye.defaultProps = {
  broadphase: Ah.ALL,
  data: new oe(),
  key: "none",
  scaleType: zs.NONE,
  type: Kt.LINE
}, Ye.attributeNames = {
  control: "control",
  depth: "depth",
  end: "end",
  endColor: "endColor",
  start: "start",
  startColor: "startColor",
  thickness: "thickness"
};
let rc = Ye;
var Nm = Object.defineProperty, un = (i, e, t, n) => {
  for (var s = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = o(e, t, s) || s);
  return s && Nm(e, t, s), s;
};
const $i = class Ih extends nt {
  constructor(e) {
    super(e), this.control = [
      [0, 0],
      [0, 0]
    ], this.depth = 0, this.end = [0, 0], this.endColor = [1, 1, 1, 1], this.start = [0, 0], this.startColor = [1, 1, 1, 1], this.thickness = [1, 1], Xe(this, Ih), this.startColor = e.startColor || this.startColor, this.endColor = e.endColor || this.endColor, this.control = e.control || this.control, this.depth = e.depth || this.depth, this.end = e.end || this.end, this.thickness = e.thickness || this.thickness, this.start = e.start || this.start;
  }
  /**
   * Calculates length from beginning point to end point
   */
  get length() {
    const e = [this.end[0] - this.start[0], this.end[1] - this.start[1]];
    return Math.sqrt(e[0] * e[0] + e[1] * e[1]);
  }
  /**
   * Calculates the midpoint of the edge
   */
  get midpoint() {
    return 0;
  }
  /**
   * Calculates a perpendicular direction vector to the edge
   */
  get perpendicular() {
    const e = this.length;
    return [
      (this.end[1] - this.start[1]) / e,
      -(this.end[0] - this.start[0]) / e
    ];
  }
  /**
   * Applies the edge width to the start and end
   */
  setEdgeThickness(e) {
    this.thickness = [e, e];
  }
  /**
   * Applies the color to the start and end
   */
  setColor(e) {
    this.startColor = ei(e), this.endColor = ei(e);
  }
};
un([
  I
], $i.prototype, "control");
un([
  I
], $i.prototype, "depth");
un([
  I
], $i.prototype, "end");
un([
  I
], $i.prototype, "endColor");
un([
  I
], $i.prototype, "start");
un([
  I
], $i.prototype, "startColor");
un([
  I
], $i.prototype, "thickness");
let xv = $i;
const he = ve("video");
function Pm(i) {
  he.enabled && (i.addEventListener("abort", () => he("abort")), i.addEventListener("canplay", () => he("canplay")), i.addEventListener("canplaythrough", () => he("canplaythrough")), i.addEventListener("durationchange", () => he("durationchange")), i.addEventListener("emptied", () => he("emptied")), i.addEventListener("ended", () => he("ended")), i.addEventListener("error", () => he("error")), i.addEventListener("loadeddata", () => he("loadeddata")), i.addEventListener("loadedmetadata", () => he("loadedmetadata")), i.addEventListener("loadstart", () => he("loadstart")), i.addEventListener("pause", () => he("pause")), i.addEventListener("play", () => he("play")), i.addEventListener("playing", () => he("playing")), i.addEventListener("progress", () => he("progress")), i.addEventListener("ratechange", () => he("ratechange")), i.addEventListener("seeked", () => he("seeked")), i.addEventListener("seeking", () => he("seeking")), i.addEventListener("stalled", () => he("stalled")), i.addEventListener("suspend", () => he("suspend")), i.addEventListener("timeupdate", () => he("timeupdate")), i.addEventListener("volumechange", () => he("volumechange")), i.addEventListener("waiting", () => he("waiting")));
}
const Bm = `precision highp float;

varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  gl_FragColor = texture2D(imageAtlas, texCoord) * vertexColor;
  gl_FragColor = gl_FragColor * gl_FragColor.a;
}
`, Dm = `precision highp float;



varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  // Figure out the size of the image as it'd show on the screen
  vec3 screenSize = cameraSpaceSize(vec3(size, 1.0));
  // Do the test for when the image is larger on the screen than the font size
  bool largerOnScreen = screenSize.y > size.y;

  // Determines if a scale mode should be used or not for the vertex
  float useScaleMode = float(
    (
      scaling == 3.0 ||                  // NEVER mode - keep the image the same size always
      (largerOnScreen && scaling == 2.0) // BOUND_MAX mode - only if we're larger than the font size do we scale down
    ) &&
    scaling != 1.0                       // ALWAYS mode - the image stays completely in world space allowing it to scale freely
  );
  // If zooms are unequal, assume one is filtered to be 1.0
  float unequalZooms = float(cameraScale2D.x != cameraScale2D.y);

  // Destructure the normal information
  float normal = normals.x;
  float side = normals.y;

  // Get the location of the anchor in world space
  vec2 worldAnchor = location + anchor;

  // Get the tex coord from our inject texture info
  texCoord = texture.xy + ((texture.zw - texture.xy) * vec2(side, float(normal == -1.0)));
  // Apply the image's tint as a tint to the image
  vertexColor = tint;

  // Correct aspect ratio.
  vec2 adjustedSize = mix(
    size,
    (size * cameraScale2D.yx),
    unequalZooms
  );

  vec2 adjustedAnchor = mix(
    anchor,
    (anchor * cameraScale2D.yx),
    unequalZooms
  );

  vec2 vertex = vec2(side, float(normal == 1.0)) * adjustedSize + location - adjustedAnchor;

  // See how scaled the size on screen will be from the actual height of the image
  float imageScreenScale = mix(
    screenSize.y / adjustedSize.y,
    screenSize.x / adjustedSize.x,
    float((cameraScale2D.x < 1.0) || (cameraScale2D.x > 1.0))
  );

  // If our screen rendering is larger than the size the image is supposed to be, then we automagically
  // scale down our image to stay the correct size, centered on the anchor point
  vec2 anchorToVertex = vertex - location;

  // We now choose between keeping the same image size or keeping it in world space
  vertex = mix(
    // This option keeps the image size in world space
    vertex,
    // This option counters the scaling of the image on the screen keeping it a static size
    (anchorToVertex / imageScreenScale) + location,
    // This is the flag determining if a scale mode should be applied to the vertex
    useScaleMode
  );

  gl_Position = clipSpace(vec3(vertex, depth));
}
`, Um = `precision highp float;

varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  // Destructure the normal information
  float normal = normals.x;
  float side = normals.y;
  // Calculate the vertex before moving it to it's position
  vec2 vertex = vec2(side, float(normal == 1.0f)) * size - anchor;
  // Rotate the vertex by the rotation
  float crotation = cos(rotation);
  float srotation = sin(rotation);
  vertex = vec2(crotation * vertex.x - srotation * vertex.y, srotation * vertex.x + crotation * vertex.y);
  // Now move the vertex to the correct location (this should place the anchor
  // point of the image ON the location specified)
  vertex += location;

  // Finalize the projection of the vertex
  gl_Position = clipSpace(vec3(vertex, depth));
  // Outputs: Make sure our information for the fragment shader is ready
  // Get the tex coord from our inject texture info
  texCoord = texture.xy + ((texture.zw - texture.xy) * vec2(side, float(normal == -1.0f)));
  // Apply the image's tint as a tint to the image
  vertexColor = tint;
}
`, at = class at extends Ne {
  constructor(e, t, n) {
    super(e, t, n);
  }
  /**
   * Define our shader and it's inputs
   */
  initShader() {
    const e = this.props.animate || {}, {
      tint: t,
      location: n,
      size: s,
      rotation: r
    } = e, o = {
      0: 1,
      1: 1,
      2: -1,
      3: 1,
      4: -1,
      5: -1
    }, a = {
      0: 0,
      1: 0,
      2: 0,
      3: 1,
      4: 1,
      5: 1
    };
    return {
      fs: Bm,
      instanceAttributes: [
        this.props.enableRotation ? {
          easing: r,
          name: at.attributeNames.rotation,
          size: S.ONE,
          update: (c) => [c.rotation]
        } : null,
        {
          easing: n,
          name: at.attributeNames.location,
          size: S.TWO,
          update: (c) => c.origin
        },
        {
          name: at.attributeNames.anchor,
          size: S.TWO,
          update: (c) => [c.anchor.x || 0, c.anchor.y || 0]
        },
        {
          easing: s,
          name: at.attributeNames.size,
          size: S.TWO,
          update: (c) => [c.width, c.height]
        },
        {
          name: at.attributeNames.depth,
          size: S.ONE,
          update: (c) => [c.depth]
        },
        {
          name: at.attributeNames.scaling,
          size: S.ONE,
          update: (c) => [c.scaling]
        },
        {
          name: at.attributeNames.texture,
          resource: {
            key: () => this.props.atlas || "",
            name: "imageAtlas"
          },
          update: (c) => (c.source, c.request ? this.resource.request(this, c, c.request) : (console.warn(
            "An image utilizing the image-render-layer does not have its request specified yet.",
            "The image-render-layer does NOT manage requests and should be handled before this layer deals with the instance"
          ), [0, 0, 0, 0]))
        },
        {
          easing: t,
          name: at.attributeNames.tint,
          size: S.FOUR,
          update: (c) => c.tint
        }
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: _.ONE,
          update: (c) => [1]
        }
      ],
      vertexAttributes: [
        {
          name: "normals",
          size: ke.TWO,
          update: (c) => [
            // Normal
            o[c],
            // The side of the quad
            a[c]
          ]
        }
      ],
      vertexCount: 6,
      vs: this.props.enableRotation ? Um : Dm
    };
  }
  getMaterialOptions() {
    return it.transparentImageBlending;
  }
};
at.defaultProps = {
  key: "",
  data: new oe()
}, at.attributeNames = {
  location: "location",
  anchor: "anchor",
  size: "size",
  depth: "depth",
  scaling: "scaling",
  texture: "texture",
  tint: "tint",
  rotation: "rotation"
};
let no = at;
function As(i) {
  return i && i.videoSrc;
}
const Gs = new Image();
Gs.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const ta = class ta extends Ne {
  constructor() {
    super(...arguments), this.childProvider = new oe(), this.imageToResource = /* @__PURE__ */ new Map(), this.sourceToRequest = /* @__PURE__ */ new Map(), this.sourceToVideo = /* @__PURE__ */ new Map(), this.usingVideo = /* @__PURE__ */ new Map(), this.waitingForVideo = /* @__PURE__ */ new Map(), this.waitForVideoSource = /* @__PURE__ */ new Map(), this.originalOnReadyCallbacks = /* @__PURE__ */ new Map();
  }
  /**
   * The image layer will manage the resources for the images, and the child
   * layer will concern itself with rendering.
   */
  childLayers() {
    return [zn(no, {
      ...this.props,
      key: `${this.props.key}.image-render-layer`
    })];
  }
  destroy() {
    super.destroy(), this.sourceToVideo.forEach((e) => {
      e.pause(), this.sourceToVideo.clear(), this.waitingForVideo.clear(), this.waitForVideoSource.clear();
    });
  }
  /**
   * Hijack the draw method to control changes to the source so we can send the
   * manager dispose requests of a given image.
   */
  draw() {
    const e = this.resolveChanges(!0);
    if (this.updateAnimationState(), e.length <= 0) return;
    this.propertyIds || (this.propertyIds = this.getInstanceObservableIds(e[0][0], [
      "source"
    ]));
    const { source: t } = this.propertyIds;
    for (let s = 0, r = e.length; s < r; ++s) {
      const [o, a, c] = e[s];
      switch (a) {
        case ge.CHANGE:
          if (c[t] !== void 0) {
            const l = this.imageToResource.get(o);
            let h = this.getAtlasSource(o);
            if (h === l) break;
            if (l instanceof HTMLVideoElement) {
              const u = this.waitForVideoSource.get(o);
              if (u) {
                this.waitForVideoSource.delete(o);
                const f = this.waitingForVideo.get(u);
                f && f.delete(o);
              }
              let d = this.usingVideo.get(
                l.getAttribute("data-source") || ""
              );
              d || (d = /* @__PURE__ */ new Set()), d.delete(o), d.size <= 0 && this.sourceToVideo.delete(
                l.getAttribute("data-source") || ""
              ), o.onReady = this.originalOnReadyCallbacks.get(o);
            }
            if (As(o.source) && (this.prepareVideo(o, o.source), h = this.getAtlasSource(o), cn(
              this.usingVideo,
              o.source.videoSrc,
              /* @__PURE__ */ new Set()
            ).add(o)), this.imageToResource.set(o, h), this.resource.request(
              this,
              o,
              Kn({
                key: this.props.atlas || "",
                disposeResource: !0,
                source: l
              })
            ), h) {
              let u = this.sourceToRequest.get(h);
              (!u || u.texture && !u.texture.isValid) && (u = Kn({
                key: this.props.atlas || "",
                source: h,
                rasterizationScale: this.props.rasterizationScale
              }), this.sourceToRequest.set(h, u)), o.request = u, this.resource.request(this, o, u);
            }
          }
          break;
        case ge.INSERT:
          if (o.source) {
            let l = this.getAtlasSource(o);
            As(o.source) && (this.prepareVideo(o, o.source), l = this.getAtlasSource(o), cn(
              this.usingVideo,
              o.source.videoSrc,
              /* @__PURE__ */ new Set()
            ).add(o));
            let h = this.sourceToRequest.get(l);
            (!h || h.texture && !h.texture.isValid) && (h = Kn({
              key: this.props.atlas || "",
              source: l,
              rasterizationScale: this.props.rasterizationScale
            }), this.sourceToRequest.set(l, h)), o.request = h;
          }
          break;
        case ge.REMOVE: {
          const l = this.getAtlasSource(o);
          if (this.imageToResource.delete(o), As(o.source)) {
            const h = this.waitForVideoSource.get(o);
            if (h) {
              this.waitForVideoSource.delete(o);
              const d = this.waitingForVideo.get(h);
              d && d.delete(o);
            }
            let u = this.usingVideo.get(o.source.videoSrc);
            u || (u = /* @__PURE__ */ new Set()), u.delete(o), u.size <= 0 && this.sourceToVideo.delete(o.source.videoSrc), this.originalOnReadyCallbacks.delete(o);
          }
          this.resource.request(
            this,
            o,
            Kn({
              key: this.props.atlas || "",
              disposeResource: !0,
              source: l
            })
          );
          break;
        }
      }
    }
    const n = [];
    this.usingVideo.forEach((s, r) => {
      s.size <= 0 && n.push(r);
    });
    for (let s = 0, r = n.length; s < r; ++s) {
      const o = n[s];
      this.usingVideo.delete(o), this.sourceToVideo.delete(o);
    }
  }
  /**
   * Gets the source that is atlas reques compatible.
   */
  getAtlasSource(e) {
    return As(e.source) ? this.sourceToVideo.get(e.source.videoSrc) || Gs : e.source;
  }
  /**
   * This handles creating the video object from the source. It then queues up
   * the waiting needs and temporarily converts the video Image to a simple
   * white image that will take on the tint of the ImageInstance.
   */
  prepareVideo(e, t) {
    const n = this.sourceToVideo.get(t.videoSrc);
    if (this.originalOnReadyCallbacks.get(e) || this.originalOnReadyCallbacks.set(e, e.onReady), n) {
      const f = this.waitingForVideo.get(t.videoSrc);
      if (f)
        f.add(e), this.waitForVideoSource.set(e, t.videoSrc), e.onReady = void 0, e.source = Gs, e.videoLoad = () => {
          n.load(), t.autoPlay && n.play();
        };
      else {
        const p = this.originalOnReadyCallbacks.get(e) || e.onReady;
        if (!p) return;
        e.onReady = (g) => {
          p(g, n);
        };
      }
      return;
    }
    const r = document.createElement("video");
    this.sourceToVideo.set(t.videoSrc, r), r.setAttribute("data-source", t.videoSrc), Pm(r);
    const o = new He(), a = new He(), c = () => {
      r.removeEventListener("loadedmetadata", h), r.removeEventListener("loadeddata", l), r.removeEventListener("error", u), this.waitingForVideo.delete(t.videoSrc), this.waitForVideoSource.delete(e);
    }, l = () => {
      a.resolve();
    }, h = () => {
      o.resolve();
    }, u = (f) => {
      let p;
      f.path && f.path[0] && (p = f.path[0].error), f.originalTarget && (p = f.originalTarget.error), console.warn(
        "There was an error loading the video resource to the atlas texture context"
      ), console.warn(p), o.reject({}), a.reject({});
    };
    r.addEventListener("loadedmetadata", h), r.addEventListener("loadeddata", l), r.addEventListener("error", u), e.onReady = void 0, cn(
      this.waitingForVideo,
      t.videoSrc,
      /* @__PURE__ */ new Set()
    ).add(e), this.waitForVideoSource.set(e, t.videoSrc), e.source = Gs, e.videoLoad = () => {
      r.load(), t.autoPlay && r.play();
    }, r.muted = !0, r.src = t.videoSrc, Promise.all([o.promise, a.promise]).then(() => {
      r.currentTime = 0, t.autoPlay && r.play();
      const f = this.waitingForVideo.get(t.videoSrc);
      f && f.forEach((p) => {
        p.source = t, p.onReady = this.originalOnReadyCallbacks.get(p);
      }), c();
    }).catch(() => {
      c();
    });
  }
  /**
   * This asserts whether or not the layer should be triggering redraws or not.
   */
  updateAnimationState() {
    let e = !1;
    this.sourceToVideo.forEach((t) => {
      t.paused || (e = !0);
    }), this.alwaysDraw = this.usingVideo.size > 0 && e;
  }
  /**
   * Parent layer has no rendering needs
   */
  initShader() {
    return null;
  }
};
ta.defaultProps = {
  atlas: "default",
  key: "",
  data: new oe()
};
let oc = ta;
var km = Object.defineProperty, Ei = (i, e, t, n) => {
  for (var s = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = o(e, t, s) || s);
  return s && km(e, t, s), s;
};
const { max: Fm } = Math, zm = {
  [L.TopLeft]: (i, e) => {
    i.x = -i.padding, i.y = -i.padding;
  },
  [L.TopMiddle]: (i, e) => {
    i.x = e.width / 2, i.y = -i.padding;
  },
  [L.TopRight]: (i, e) => {
    i.x = e.width + i.padding, i.y = -i.padding;
  },
  [L.MiddleLeft]: (i, e) => {
    i.x = -i.padding, i.y = e.height / 2;
  },
  [L.Middle]: (i, e) => {
    i.x = e.width / 2, i.y = e.height / 2;
  },
  [L.MiddleRight]: (i, e) => {
    i.x = e.width + i.padding, i.y = e.height / 2;
  },
  [L.BottomLeft]: (i, e) => {
    i.x = -i.padding, i.y = e.height + i.padding;
  },
  [L.BottomMiddle]: (i, e) => {
    i.x = e.width / 2, i.y = e.height + i.padding;
  },
  [L.BottomRight]: (i, e) => {
    i.x = e.width + i.padding, i.y = e.height + i.padding;
  },
  [L.Custom]: (i, e) => {
    i.x = i.x || 0, i.y = i.y || 0;
  }
}, Dt = class Mh extends nt {
  constructor(e) {
    super(e), this.tint = [0, 0, 0, 1], this.depth = 0, this.height = 1, this.origin = [0, 0], this.scaling = Zt.BOUND_MAX, this.width = 1, this.rotation = 0, this.sourceWidth = 0, this.sourceHeight = 0, this._anchor = {
      padding: 0,
      type: L.TopLeft,
      x: 0,
      y: 0
    }, this.videoLoad = go, Xe(this, Mh), this.depth = e.depth || this.depth, this.tint = e.tint || this.tint, this.scaling = e.scaling || this.scaling, this.origin = e.origin || this.origin, this.width = e.width || 1, this.height = e.height || 1, this.source = e.source, this.rotation = e.rotation || 0, this.onReady = e.onReady, e.anchor && this.setAnchor(e.anchor);
  }
  /**
   * This property reflects the maximum size a single dimension of the image
   * will take up. This means if you set this value to 100 at least the width or
   * the height will be 100 depending on the aspect ratio of the image.
   */
  get maxSize() {
    return Fm(this.width, this.height);
  }
  set maxSize(e) {
    const t = this.width / this.height;
    this.width = e * t, this.height = e;
  }
  get anchor() {
    return this._anchor;
  }
  /** This is triggered after the request has been completed */
  resourceTrigger() {
    this.source = this.source, this.request && this.request.texture && (this.sourceWidth = this.request.texture.pixelWidth, this.sourceHeight = this.request.texture.pixelHeight), this.onReady && this.onReady(this);
  }
  /**
   * This applies a new anchor to this image and properly determines it's anchor
   * position on the image
   */
  setAnchor(e) {
    const t = {
      padding: e.padding || 0,
      type: e.type,
      x: e.x || 0,
      y: e.y || 0
    };
    zm[t.type](t, this), this._anchor = t;
  }
};
Ei([
  I
], Dt.prototype, "tint");
Ei([
  I
], Dt.prototype, "depth");
Ei([
  I
], Dt.prototype, "height");
Ei([
  I
], Dt.prototype, "origin");
Ei([
  I
], Dt.prototype, "scaling");
Ei([
  I
], Dt.prototype, "source");
Ei([
  I
], Dt.prototype, "width");
Ei([
  I
], Dt.prototype, "rotation");
Ei([
  I
], Dt.prototype, "_anchor");
let vv = Dt;
var Gm = Object.defineProperty, Ri = (i, e, t, n) => {
  for (var s = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = o(e, t, s) || s);
  return s && Gm(e, t, s), s;
};
const Ut = class so extends nt {
  constructor(e) {
    super(e), this.anchor = [0, 0], this.character = "a", this.color = [1, 1, 1, 1], this.depth = 0, this.fontScale = 1, this.maxScale = 1, this.offset = [0, 0], this.origin = [0, 0], this.padding = [0, 0], Xe(this, so), this.origin = e.origin || this.origin, this.offset = e.offset || this.offset, this.character = e.character || this.character, this.color = e.color || this.color, this.maxScale = e.maxScale || this.maxScale, this.padding = e.padding || this.padding, this.anchor = e.anchor || this.anchor, this.onReady = e.onReady;
  }
  /**
   * Make a duplicate of this glyph
   */
  clone() {
    const e = new so(this);
    e.onReady = this.onReady, e.request = this.request;
  }
  /**
   * This will trigger when the resource nmanager is ready to render this glyph.
   */
  resourceTrigger() {
    this.offset = this.offset, this.origin = this.origin, this.character = this.character, this.color = this.color, this.onReady && this.onReady(this);
  }
};
Ri([
  I
], Ut.prototype, "anchor");
Ri([
  I
], Ut.prototype, "character");
Ri([
  I
], Ut.prototype, "color");
Ri([
  I
], Ut.prototype, "depth");
Ri([
  I
], Ut.prototype, "fontScale");
Ri([
  I
], Ut.prototype, "maxScale");
Ri([
  I
], Ut.prototype, "offset");
Ri([
  I
], Ut.prototype, "origin");
Ri([
  I
], Ut.prototype, "padding");
let Vm = Ut;
const ac = `varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  vec4 texColor = texture2D(fontMap, texCoord);
  if (texColor.r <= 0.0) discard;
  texColor.a = texColor.r;
  gl_FragColor = texColor * vertexColor;
}
`, cc = `varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  // Calculate in the anchor, the origin, glyph offset, and the quad pushout to make our quad geometry
  vec2 pushOut = normals * glyphSize * fontScale;
  vec3 position = vec3(origin + padding - anchor + offset + pushOut, depth);
  gl_Position = clipSpace(position);

  // Get the atlas position of the texture information
  texCoord = texture.xy + (texture.zw - texture.xy) * normals;
  // Apply the color of the glyph
  vertexColor = color * color.a;
}
`, $m = `varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  vec4 texColor = texture2D(fontMap, texCoord);
  if (texColor.r <= 0.0) discard;
  texColor.a = texColor.r;
  gl_FragColor = texColor * vertexColor;
}
`, Wm = `varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  vec2 scale = fontScale * cameraScale2D.xy;
  float scaleBy = max(scale.x, scale.y) / maxScale;
  vec2 pushOut = normals * glyphSize * fontScale;

  float vx = mix(
    (-anchor.x + offset.x + pushOut.x),
    (-anchor.x + offset.x + pushOut.x) / scaleBy,
    float(scale.x >= maxScale)
  );

  float vy = mix(
    (-anchor.y + offset.y + pushOut.y),
    (-anchor.y + offset.y + pushOut.y) / scaleBy,
    float(scale.y >= maxScale)
  );

  // Calculate in the anchor, the origin, glyph offset, and the quad pushout to make our quad geometry
  vec3 position = vec3(origin + padding + vec2(vx, vy), depth);
  gl_Position = clipSpace(position);

  // Get the atlas position of the texture information
  texCoord = texture.xy + (texture.zw - texture.xy) * normals;
  // Apply the color of the glyph
  vertexColor = color * color.a;
}
`, jm = `varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  vec4 texColor = texture2D(fontMap, texCoord);
  if (texColor.r <= 0.0) discard;
  texColor.a = texColor.r;
  gl_FragColor = texColor * vertexColor;
}
`, Hm = `varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  // Calculate in the anchor, the origin, glyph offset, and the quad pushout to make our quad geometry
  vec2 pushOut = normals * glyphSize * fontScale;
  vec3 position = vec3(origin + padding + (-anchor + offset + pushOut) / cameraScale2D.xy, depth);
  gl_Position = clipSpace(position);

  // Get the atlas position of the texture information
  texCoord = texture.xy + (texture.zw - texture.xy) * normals;
  // Apply the color of the glyph
  vertexColor = color * color.a;
}
`, Xm = `varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  vec4 texColor = texture2D(fontMap, texCoord);
  if (texColor.r <= 0.0) discard;
  texColor.a = texColor.r;
  gl_FragColor = texColor * vertexColor;
}
`, Qm = `varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  // Calculate in the anchor, the origin, glyph offset, and the quad pushout to make our quad geometry
  vec2 pushOut = normals * glyphSize * fontScale;
  vec3 position = vec3(origin + padding + offset + pushOut, depth);
  gl_Position = clipSpace(position);

  // Get the atlas position of the texture information
  texCoord = texture.xy + (texture.zw - texture.xy) * normals;
  // Apply the color of the glyph
  vertexColor = color * color.a;
}
`, Ym = `varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  vec4 texColor = texture2D(fontMap, texCoord);
  if (texColor.r <= 0.0) discard;
  texColor.a = texColor.r;
  gl_FragColor = texColor * vertexColor;
}
`, qm = `varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  vec2 scale = fontScale * cameraScale2D.xy;
  float scaleBy = max(scale.x, scale.y) / maxScale;
  vec2 pushOut = normals * glyphSize * fontScale;

  float vx = mix(
    (origin.x + padding.x + offset.x + pushOut.x),
    origin.x + anchor.x + (padding.x - anchor.x + offset.x + pushOut.x) / scaleBy,
    float(scale.x >= maxScale)
  );

  float vy = mix(
    (origin.y + padding.y + offset.y + pushOut.y),
    origin.y + anchor.y + (padding.y - anchor.y + offset.y + pushOut.y) / scaleBy,
    float(scale.y >= maxScale)
  );

  // Calculate in the anchor, the origin, glyph offset, and the quad pushout to make our quad geometry
  vec3 position = vec3(vec2(vx, vy), depth);
  gl_Position = clipSpace(position);

  // Get the atlas position of the texture information
  texCoord = texture.xy + (texture.zw - texture.xy) * normals;
  // Apply the color of the glyph
  vertexColor = color * color.a;
}
`, Km = `varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  vec4 texColor = texture2D(fontMap, texCoord);
  if (texColor.r <= 0.0) discard;
  texColor.a = texColor.r;
  gl_FragColor = texColor * vertexColor;
}
`, Zm = `varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  // Calculate in the anchor, the origin, glyph offset, and the quad pushout to make our quad geometry
  vec2 pushOut = normals * glyphSize * fontScale;
  vec3 position = vec3(origin + anchor + (padding - anchor + offset + pushOut) / cameraScale2D.xy , depth);
  gl_Position = clipSpace(position);

  // Get the atlas position of the texture information
  texCoord = texture.xy + (texture.zw - texture.xy) * normals;
  // Apply the color of the glyph
  vertexColor = color * color.a;
}
`, Yt = class Yt extends Ne {
  constructor() {
    super(...arguments), this.glyphRequests = {};
  }
  /**
   * Create the Shader IO needed to tie our instances and the GPU together.
   */
  initShader() {
    const e = this.props.animate || {}, {
      anchor: t,
      color: n,
      offset: s,
      origin: r
    } = e, o = {
      0: [0, 0],
      1: [0, 0],
      2: [1, 0],
      3: [0, 1],
      4: [1, 1],
      5: [1, 1]
    }, a = {
      name: "texture",
      resource: {
        key: () => this.props.resourceKey || "",
        name: "fontMap"
      },
      update: (d) => {
        const f = d.character;
        return (!d.request || d.character !== d.request.character) && (this.glyphRequests[d.character] ? d.request = this.glyphRequests[d.character] : (d.request = Gn({
          key: this.props.resourceKey || "",
          character: f
        }), this.glyphRequests[d.character] = d.request), d.request.fontMap && d.onReady && d.onReady(d)), d.request.fetch = Un.TEXCOORDS, this.resource.request(this, d, d.request);
      }
    }, c = {
      name: "glyphSize",
      parentAttribute: a,
      resource: {
        key: () => this.props.resourceKey || "",
        name: "fontMap"
      },
      size: S.TWO,
      update: (d) => {
        const f = d.character;
        return (!d.request || d.character !== d.request.character) && (this.glyphRequests[d.character] ? d.request = this.glyphRequests[d.character] : (d.request = Gn({
          key: this.props.resourceKey || "",
          character: f
        }), this.glyphRequests[d.character] = d.request), d.request.fontMap && d.onReady && d.onReady(d)), d.request.fetch = Un.IMAGE_SIZE, this.resource.request(this, d, d.request);
      }
    };
    a.childAttributes = [c];
    let l, h;
    switch (this.props.scaleMode || Zt.ALWAYS) {
      case Zt.BOUND_MAX: {
        l = this.props.inTextArea ? Ym : $m, h = this.props.inTextArea ? qm : Wm;
        break;
      }
      case Zt.NEVER: {
        l = this.props.inTextArea ? jm : Km, h = this.props.inTextArea ? Zm : Hm;
        break;
      }
      case Zt.ALWAYS: {
        l = this.props.inTextArea ? Xm : ac, h = this.props.inTextArea ? Qm : cc;
        break;
      }
      default: {
        l = ac, h = cc;
        break;
      }
    }
    return {
      fs: l,
      instanceAttributes: [
        {
          easing: n,
          name: Yt.attributeNames.color,
          size: S.FOUR,
          update: (d) => d.color
        },
        {
          name: Yt.attributeNames.depth,
          size: S.ONE,
          update: (d) => [d.depth]
        },
        {
          name: "fontScale",
          size: S.ONE,
          update: (d) => [d.fontScale]
        },
        {
          easing: t,
          name: Yt.attributeNames.anchor,
          size: S.TWO,
          update: (d) => d.anchor
        },
        {
          easing: r,
          name: Yt.attributeNames.origin,
          size: S.TWO,
          update: (d) => d.origin
        },
        {
          easing: s,
          name: Yt.attributeNames.offset,
          size: S.TWO,
          update: (d) => d.offset
        },
        {
          name: "padding",
          size: S.TWO,
          update: (d) => d.padding
        },
        {
          name: "maxScale",
          size: S.ONE,
          update: (d) => [d.maxScale]
        },
        c,
        a
      ],
      uniforms: [],
      vertexAttributes: [
        {
          name: "normals",
          size: ke.TWO,
          update: (d) => (
            // Quad vertex side information
            o[d]
          )
        }
      ],
      vertexCount: 6,
      vs: h
    };
  }
  draw() {
    super.draw();
  }
  /**
   * Set up material options for the layer
   */
  getMaterialOptions() {
    return Object.assign(
      {},
      it.transparentImageBlending,
      {
        depthTest: !1
      }
    );
  }
  /**
   * Handle changes that need special handling
   */
  willUpdateProps(e) {
    e.resourceKey !== this.props.resourceKey && (Object.values(this.glyphRequests).forEach((t) => {
      delete t.fontMap, t.key = e.resourceKey || "";
    }), this.rebuildLayer());
  }
};
Yt.defaultProps = {
  key: "",
  data: new oe(),
  resourceKey: "No resource specified"
}, Yt.attributeNames = {
  color: "color",
  depth: "depth",
  anchor: "anchor",
  origin: "origin",
  offset: "offset"
};
let ro = Yt;
const Jm = "...", lc = {
  [L.TopLeft]: (i, e) => {
    i.x = 0, i.y = 0;
  },
  [L.TopMiddle]: (i, e) => {
    i.x = e.size[0] / 2, i.y = 0;
  },
  [L.TopRight]: (i, e) => {
    i.x = e.size[0], i.y = 0;
  },
  [L.MiddleLeft]: (i, e) => {
    i.x = 0, i.y = e.size[1] / 2;
  },
  [L.Middle]: (i, e) => {
    i.x = e.size[0] / 2, i.y = e.size[1] / 2;
  },
  [L.MiddleRight]: (i, e) => {
    i.x = e.size[0], i.y = e.size[1] / 2;
  },
  [L.BottomLeft]: (i, e) => {
    i.x = 0, i.y = e.size[1];
  },
  [L.BottomMiddle]: (i, e) => {
    i.x = e.size[0] / 2, i.y = e.size[1];
  },
  [L.BottomRight]: (i, e) => {
    i.x = e.size[0], i.y = e.size[1];
  },
  [L.Custom]: (i, e) => {
    i.x = i.x || 0, i.y = i.y || 0;
  }
}, Mi = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [0, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1]
].map((i) => {
  const e = Math.sqrt(ss(i, i));
  return _e(i, 1 / -e);
}), hc = {
  [L.TopLeft]: (i) => {
    i.paddingDirection = _e(Mi[0], i.padding);
  },
  [L.TopMiddle]: (i) => {
    i.paddingDirection = _e(Mi[1], i.padding);
  },
  [L.TopRight]: (i) => {
    i.paddingDirection = _e(Mi[2], i.padding);
  },
  [L.MiddleLeft]: (i) => {
    i.paddingDirection = _e(Mi[3], i.padding);
  },
  [L.Middle]: (i) => {
    i.paddingDirection = [0, 0];
  },
  [L.MiddleRight]: (i) => {
    i.paddingDirection = _e(Mi[5], i.padding);
  },
  [L.BottomLeft]: (i) => {
    i.paddingDirection = _e(Mi[6], i.padding);
  },
  [L.BottomMiddle]: (i) => {
    i.paddingDirection = _e(Mi[7], i.padding);
  },
  [L.BottomRight]: (i) => {
    i.paddingDirection = _e(Mi[8], i.padding);
  },
  [L.Custom]: (i) => {
    i.paddingDirection = i.paddingDirection;
  }
};
function Be(i) {
  if (i)
    return (e) => {
      i({
        ...e,
        instances: e.instances.map((t) => t.parentLabel).filter(se)
      });
    };
}
const ia = class ia extends Ne {
  constructor() {
    super(...arguments), this.fullUpdate = !1, this.glyphProvider = new oe(), this.labelToGlyphs = /* @__PURE__ */ new Map(), this.labelToKerningRequest = /* @__PURE__ */ new Map(), this.labelWaitingOnGlyph = /* @__PURE__ */ new Map(), this.truncationWidth = -1, this.handleGlyphReady = (e) => {
      if (!e.parentLabel) {
        delete e.onReady;
        return;
      }
      const t = e.parentLabel, n = this.labelWaitingOnGlyph.get(e.parentLabel);
      if (n && n.has(e) && (n.delete(e), n.size <= 0)) {
        const s = t.onReady;
        s && s(t);
      }
    };
  }
  /**
   * This provides the child layers that will render on behalf of this layer.
   *
   * For Labels, a label is simply a group of well placed glyphs. So we defer all of
   * the labels changes by converting the label into glyphs and applying the changes to
   * it's set of glyphs.
   */
  childLayers() {
    return [
      zn(this.props.customGlyphLayer || ro, {
        animate: this.props.animate,
        data: this.glyphProvider,
        key: `${this.id}.glyphs`,
        resourceKey: this.props.resourceKey,
        scaleMode: this.props.scaleMode || Zt.BOUND_MAX,
        inTextArea: this.props.inTextArea,
        picking: this.props.picking,
        onMouseClick: Be(this.props.onMouseClick),
        onMouseUp: Be(this.props.onMouseUp),
        onMouseDown: Be(this.props.onMouseDown),
        onMouseOut: Be(this.props.onMouseOut),
        onMouseOver: Be(this.props.onMouseOver),
        onMouseMove: Be(this.props.onMouseMove),
        onMouseUpOutside: Be(this.props.onMouseUpOutside),
        onTap: Be(this.props.onTap),
        onTouchDown: Be(this.props.onTouchDown),
        onTouchUp: Be(this.props.onTouchUp),
        onTouchUpOutside: Be(this.props.onTouchUpOutside),
        onTouchMove: Be(this.props.onTouchMove),
        onTouchOut: Be(this.props.onTouchOut),
        onTouchOver: Be(this.props.onTouchOver),
        onTouchAllEnd: Be(this.props.onTouchAllEnd),
        onTouchAllOut: Be(this.props.onTouchAllOut)
      })
    ];
  }
  /**
   * We override the draw method of the layer to handle the diffs of the provider in a
   * custom fashion by delegating the changes of the provider to the child layers.
   */
  draw() {
    const e = this.resolveChanges();
    if (e.length <= 0) return;
    if (!this.propertyIds) {
      const u = e[0][0];
      this.propertyIds = this.getInstanceObservableIds(u, [
        "text",
        "active",
        "anchor",
        "color",
        "origin",
        "fontSize",
        "maxWidth",
        "maxScale",
        "letterSpacing"
      ]);
    }
    const {
      text: t,
      active: n,
      anchor: s,
      color: r,
      origin: o,
      fontSize: a,
      maxWidth: c,
      maxScale: l,
      letterSpacing: h
    } = this.propertyIds;
    for (let u = 0, d = e.length; u < d; ++u) {
      const [f, p, g] = e[u];
      switch (p) {
        case ge.CHANGE:
          if (!this.labelToGlyphs.get(f)) {
            this.insert(f);
            continue;
          }
          g[t] !== void 0 ? (this.invalidateRequest(f), this.layoutGlyphs(f)) : g[n] !== void 0 && (f.active ? (this.layoutGlyphs(f), this.showGlyphs(f)) : this.hideGlyphs(f)), g[s] && this.updateAnchor(f), g[r] !== void 0 && this.updateGlyphColors(f), g[o] !== void 0 && this.updateGlyphOrigins(f), g[l] !== void 0 && this.updateGlyphMaxScales(f), g[a] !== void 0 && (this.invalidateRequest(f), this.layoutGlyphs(f)), g[c] !== void 0 && (this.invalidateRequest(f), this.layoutGlyphs(f)), g[h] !== void 0 && (this.invalidateRequest(f), this.layoutGlyphs(f));
          break;
        case ge.INSERT:
          this.insert(f);
          break;
        case ge.REMOVE: {
          const m = this.labelToGlyphs.get(f);
          if (m) {
            for (let v = 0, b = m.length; v < b; ++v)
              this.glyphProvider.remove(m[v]);
            this.labelToGlyphs.delete(f), this.labelToKerningRequest.delete(f), this.labelWaitingOnGlyph.delete(f);
          }
          break;
        }
      }
    }
  }
  /**
   * Handles first insertion operation for the label
   */
  insert(e) {
    e.preload ? this.props.data.remove(e) : this.labelToGlyphs.get(e) || this.labelToGlyphs.set(e, []), this.layoutGlyphs(e);
  }
  /**
   * Unmounts all of the glyphs that make the lable
   */
  hideGlyphs(e) {
    const t = this.labelToGlyphs.get(e);
    if (t)
      for (let n = 0, s = t.length; n < s; ++n)
        this.glyphProvider.remove(t[n]);
  }
  /**
   * Tell the system this layer is not providing any rendering IO information for the GPU to render.
   */
  initShader() {
    return null;
  }
  /**
   * This invalidates the request for the instance thus requiring a new request to be made
   * to trigger the layout of the label.
   */
  invalidateRequest(e) {
    this.labelToKerningRequest.delete(e);
  }
  /**
   * This uses calculated kerning information to place the glyph relative to it's left character neighbor.
   * The first glyph will use metrics of the glyphs drop down amount to determine where the glyph
   * will be placed.
   */
  layoutGlyphs(e) {
    if (!this.updateKerning(e) || !e.active) return;
    const t = this.labelToKerningRequest.get(e);
    if (!t || !t.fontMap) return;
    const n = t.metrics;
    if (!n || !n.layout) return;
    const s = n.layout;
    this.updateGlyphs(e, s);
    const r = e.glyphs;
    e.size = s.size, lc[e.anchor.type](e.anchor, e), hc[e.anchor.type](e.anchor);
    const o = e.anchor, a = e.anchor.paddingDirection;
    for (let c = 0, l = Math.min(s.positions.length, r.length); c < l; ++c) {
      const h = s.positions[c], u = r[c];
      u.offset = h, u.fontScale = s.fontScale, u.anchor = [o.x || 0, o.y || 0], u.origin = wo(e.origin), u.padding = a || [0, 0], u.maxScale = e.maxScale;
    }
  }
  /**
   * This layer does not have or use a buffer manager thus it must track management of an instance
   * in it's own way.
   */
  managesInstance(e) {
    return !!this.labelToGlyphs.get(e);
  }
  /**
   * This makes a label's glyphs visible by adding them to the glyph layer rendering the glyphs.
   */
  showGlyphs(e) {
    const t = this.labelToGlyphs.get(e);
    if (t)
      for (let n = 0, s = t.length; n < s; ++n)
        this.glyphProvider.add(t[n]);
  }
  /**
   * Updates the anchor position of the instance when set
   */
  updateAnchor(e) {
    const t = e.glyphs;
    if (!t) return;
    lc[e.anchor.type](e.anchor, e), hc[e.anchor.type](e.anchor);
    const n = e.anchor, s = e.anchor.paddingDirection;
    for (let r = 0, o = t.length; r < o; ++r)
      t[r].anchor = [n.x || 0, n.y || 0], t[r].padding = s || [0, 0];
  }
  /**
   * This ensures the correct number of glyphs is being provided for the label indicated.
   */
  updateGlyphs(e, t) {
    let n = this.labelToGlyphs.get(e);
    n || (n = [], this.labelToGlyphs.set(e, n));
    let s = this.labelWaitingOnGlyph.get(e);
    s || (s = /* @__PURE__ */ new Set(), this.labelWaitingOnGlyph.set(e, s));
    for (let r = 0, o = Math.min(n.length, t.glyphs.length); r < o; ++r) {
      const a = n[r];
      a.character !== t.glyphs[r] && (a.character = t.glyphs[r], (!a.request || !a.request.fontMap || !a.request.fontMap.glyphMap[a.character]) && s.add(a));
    }
    if (n.length < t.glyphs.length) {
      let r = 0;
      for (let o = n.length, a = t.glyphs.length; o < a; ++o, ++r) {
        const c = t.glyphs[o], l = new Vm({
          character: c,
          color: e.color,
          origin: e.origin,
          maxScale: e.maxScale,
          onReady: this.handleGlyphReady
        });
        l.parentLabel = e, n.push(l), e.active && this.glyphProvider.add(l), s.add(l);
      }
    } else if (n.length > t.glyphs.length) {
      for (let r = t.glyphs.length, o = n.length; r < o; ++r) {
        const a = n[r];
        this.glyphProvider.remove(a);
      }
      for (; n.length > t.glyphs.length; ) n.pop();
    }
    e.glyphs = n;
  }
  /**
   * Updates the glyph colors to match the label's glyph colors
   */
  updateGlyphColors(e) {
    const t = e.glyphs;
    if (t)
      for (let n = 0, s = t.length; n < s; ++n)
        t[n].color = ei(e.color);
  }
  /**
   * This updates all of the glyphs for the label to have the same position
   * as the label.
   */
  updateGlyphOrigins(e) {
    const t = e.glyphs;
    if (!t) return;
    const n = e.origin;
    for (let s = 0, r = t.length; s < r; ++s)
      t[s].origin = [n[0], n[1]];
  }
  /**
   * This updates all of the glyphs for the label to have the same position
   * as the label.
   */
  updateGlyphMaxScales(e) {
    const t = e.glyphs;
    if (!t) return;
    const n = e.maxScale;
    for (let s = 0, r = t.length; s < r; ++s)
      t[s].maxScale = n;
  }
  /**
   * Checks the label to ensure calculated kerning supports the text specified.
   *
   * Returns true when the kerning information is already available
   */
  updateKerning(e) {
    let t = this.labelToKerningRequest.get(e);
    const n = e.text;
    if (t) {
      if (t.kerningPairs && t.kerningPairs.indexOf(n) > -1)
        return !!t.fontMap;
      if (t.fontMap && !t.fontMap.supportsKerning(
        n.replace(/\s/g, "")
      ))
        this.labelToKerningRequest.delete(e), t = void 0;
      else
        return !0;
    }
    if (!t) {
      const s = {
        // We want the request to return all of the metrics for the text as well
        fontSize: e.fontSize,
        text: e.text,
        letterSpacing: e.letterSpacing
      };
      return e.maxWidth > 0 && (s.maxWidth = e.maxWidth, s.truncation = this.props.truncation || Jm), t = Gn({
        key: this.props.resourceKey || "",
        character: "",
        kerningPairs: [n],
        metrics: s
      }), e.preload ? (e.resourceTrigger = () => {
        e.onReady && e.onReady(e);
      }, this.resource.request(this, e, t)) : (this.resource.request(this, e, t, {
        resource: {
          type: re.FONT,
          key: this.props.resourceKey || ""
        }
      }), this.labelToKerningRequest.set(e, t)), !1;
    }
    return !0;
  }
  /**
   * If our resource changes, we need a full update of all instances.
   * If our provider changes, we probably want to ensure our property identifiers are correct.
   */
  willUpdateProps(e) {
    e.data !== this.props.data && delete this.propertyIds, e.scaleMode !== this.props.scaleMode && this.rebuildLayer(), e.resourceKey !== this.props.resourceKey && (this.fullUpdate = !0);
  }
};
ia.defaultProps = {
  key: "",
  data: new oe()
};
let oo = ia;
var e0 = Object.defineProperty, kt = (i, e, t, n) => {
  for (var s = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = o(e, t, s) || s);
  return s && e0(e, t, s), s;
};
const xt = class Sh extends nt {
  constructor(e) {
    super(e), this.color = [0, 0, 0, 1], this.depth = 0, this.fontSize = 12, this.maxScale = 1, this.maxWidth = 0, this.origin = [0, 0], this.scale = 1, this.text = "", this.letterSpacing = 0, this.preload = !1, this.glyphs = [], this.size = [0, 0], this.truncatedText = "", this.anchor = {
      padding: 0,
      paddingDirection: [0, 0],
      type: L.TopLeft,
      x: 0,
      y: 0
    }, Xe(this, Sh), this.anchor = e.anchor || this.anchor, this.color = e.color || this.color, this.depth = e.depth || this.depth, this.fontSize = e.fontSize || this.fontSize, this.maxScale = e.maxScale || this.maxScale, this.maxWidth = e.maxWidth || 0, this.onReady = e.onReady, this.origin = e.origin, this.preload = e.preload || !1, this.scale = e.scale || this.scale, this.text = e.text || this.text, this.letterSpacing = e.letterSpacing || this.letterSpacing, e.anchor && this.setAnchor(e.anchor);
  }
  getWidth() {
    return this.size[0];
  }
  /**
   * This applies a new anchor to this label and properly determines it's anchor position on the label
   */
  setAnchor(e) {
    const t = {
      padding: e.padding || 0,
      paddingDirection: e.paddingDirection,
      type: e.type,
      x: e.x || 0,
      y: e.y || 0
    };
    this.anchor = t;
  }
  /**
   * Looks for the subtext provided, then provides the glyphs for that subtext if any.
   */
  subTextGlyphs(e) {
    const t = [], n = this.text.indexOf(e);
    if (n < 0) return t;
    let s = 0;
    for (let r = 0, o = Math.min(this.text.length, n + e.length); r < o; ++r)
      An(this.text[r]) || (s++, r >= n && t.push(this.glyphs[s]));
    return t;
  }
  /**
   * Trigger for when resources are prepped for this instance
   */
  resourceTrigger() {
  }
};
kt([
  I
], xt.prototype, "color");
kt([
  I
], xt.prototype, "depth");
kt([
  I
], xt.prototype, "fontSize");
kt([
  I
], xt.prototype, "maxScale");
kt([
  I
], xt.prototype, "maxWidth");
kt([
  I
], xt.prototype, "origin");
kt([
  I
], xt.prototype, "scale");
kt([
  I
], xt.prototype, "text");
kt([
  I
], xt.prototype, "letterSpacing");
kt([
  I
], xt.prototype, "anchor");
let Oe = xt;
var t0 = Object.defineProperty, dn = (i, e, t, n) => {
  for (var s = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = o(e, t, s) || s);
  return s && t0(e, t, s), s;
}, ao = /* @__PURE__ */ ((i) => (i[i.LEFT = 0] = "LEFT", i[i.RIGHT = 1] = "RIGHT", i[i.CENTERED = 2] = "CENTERED", i))(ao || {}), Qt = /* @__PURE__ */ ((i) => (i[i.NONE = 0] = "NONE", i[i.CHARACTER = 1] = "CHARACTER", i[i.WORD = 2] = "WORD", i))(Qt || {}), Zn = /* @__PURE__ */ ((i) => (i[i.NEWLINE = 0] = "NEWLINE", i))(Zn || {});
const Wi = class Ch extends Oe {
  constructor(e) {
    super(e), this.maxHeight = 0, this.lineHeight = 0, this.wordWrap = 0, this.alignment = 0, this.labels = [], this.newLabels = [], this.borders = [], this.padding = [0, 0, 0, 0], this.borderWidth = 6, this.hasBorder = !0, this.spaceWidth = 0, Xe(this, Ch), this.color = e.color, this.origin = e.origin, this.oldOrigin = e.origin, this.text = e.text, this.fontSize = e.fontSize || this.fontSize, this.maxWidth = e.maxWidth || this.maxWidth, this.maxHeight = e.maxHeight || this.maxHeight, this.lineHeight = e.lineHeight || this.lineHeight, this.wordWrap = e.wordWrap || this.wordWrap, this.alignment = e.alignment || this.alignment, this.padding = e.padding || this.padding, this.borderWidth = e.borderWidth || this.borderWidth, this.hasBorder = e.hasBorder !== void 0 ? e.hasBorder : this.hasBorder, this.letterSpacing = e.letterSpacing || this.letterSpacing;
  }
};
dn([
  I
], Wi.prototype, "maxHeight");
dn([
  I
], Wi.prototype, "lineHeight");
dn([
  I
], Wi.prototype, "wordWrap");
dn([
  I
], Wi.prototype, "alignment");
dn([
  I
], Wi.prototype, "padding");
dn([
  I
], Wi.prototype, "borderWidth");
dn([
  I
], Wi.prototype, "hasBorder");
let bv = Wi;
var i0 = Object.defineProperty, Ft = (i, e, t, n) => {
  for (var s = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = o(e, t, s) || s);
  return s && i0(e, t, s), s;
};
const n0 = {
  [L.TopLeft]: (i, e) => {
    i.x = -i.padding, i.y = -i.padding;
  },
  [L.TopMiddle]: (i, e) => {
    i.x = e.size[0] / 2, i.y = -i.padding;
  },
  [L.TopRight]: (i, e) => {
    i.x = e.size[0] + i.padding, i.y = -i.padding;
  },
  [L.MiddleLeft]: (i, e) => {
    i.x = -i.padding, i.y = e.size[1] / 2;
  },
  [L.Middle]: (i, e) => {
    i.x = e.size[0] / 2, i.y = e.size[1] / 2;
  },
  [L.MiddleRight]: (i, e) => {
    i.x = e.size[0] + i.padding, i.y = e.size[1] / 2;
  },
  [L.BottomLeft]: (i, e) => {
    i.x = -i.padding, i.y = e.size[1] + i.padding;
  },
  [L.BottomMiddle]: (i, e) => {
    i.x = e.size[0] / 2, i.y = e.size[1] + i.padding;
  },
  [L.BottomRight]: (i, e) => {
    i.x = e.size[0] + i.padding, i.y = e.size[1] + i.padding;
  },
  [L.Custom]: (i, e) => {
    i.x = i.x || 0, i.y = i.y || 0;
  }
}, vt = class Oh extends nt {
  constructor(e) {
    super(e), this.color = [0, 0, 0, 1], this.depth = 0, this.maxScale = 1, this.scale = 1, this.scaling = Zt.BOUND_MAX, this.size = [1, 1], this.position = [0, 0], this.outline = 0, this.outlineColor = [0, 0, 0, 1], this._anchor = {
      padding: 0,
      type: L.TopLeft,
      x: 0,
      y: 0
    }, Xe(this, Oh), this.depth = e.depth || this.depth, this.color = e.color || this.color, this.scaling = e.scaling || this.scaling, this.position = e.position || this.position, this.size = e.size || this.size, this.outline = e.outline || this.outline, this.outlineColor = e.outlineColor || this.outlineColor, e.anchor && this.setAnchor(e.anchor);
  }
  get anchor() {
    return this._anchor;
  }
  /**
   * This applies a new anchor to this rectangle and properly determines it's anchor position on the rectangle
   */
  setAnchor(e) {
    const t = {
      padding: e.padding || 0,
      type: e.type,
      x: e.x || 0,
      y: e.y || 0
    };
    n0[t.type](t, this), this._anchor = t;
  }
};
Ft([
  I
], vt.prototype, "color");
Ft([
  I
], vt.prototype, "depth");
Ft([
  I
], vt.prototype, "maxScale");
Ft([
  I
], vt.prototype, "scale");
Ft([
  I
], vt.prototype, "scaling");
Ft([
  I
], vt.prototype, "size");
Ft([
  I
], vt.prototype, "position");
Ft([
  I
], vt.prototype, "outline");
Ft([
  I
], vt.prototype, "outlineColor");
Ft([
  I
], vt.prototype, "_anchor");
let s0 = vt;
var r0 = Object.defineProperty, Ho = (i, e, t, n) => {
  for (var s = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = o(e, t, s) || s);
  return s && r0(e, t, s), s;
};
const Er = class Lh extends s0 {
  constructor(e) {
    super(e), this.fontScale = 1, this.textAreaOrigin = [0, 0], this.textAreaAnchor = [0, 0], Xe(this, Lh), this.fontScale = e.fontScale || this.fontScale, this.textAreaOrigin = e.textAreaOrigin || this.textAreaOrigin, this.textAreaAnchor = e.textAreaAnchor || this.textAreaAnchor;
  }
};
Ho([
  I
], Er.prototype, "fontScale");
Ho([
  I
], Er.prototype, "textAreaOrigin");
Ho([
  I
], Er.prototype, "textAreaAnchor");
let Is = Er;
const o0 = `precision highp float;

varying vec4 vertexColor;

void main() {
  gl_FragColor = vertexColor;
}
`, a0 = `precision highp float;

varying vec4 vertexColor;

void main() {
  float borderScale = mix(fontScale, 1.0, float(scaling == 3.0));

  // Determine final screen size of label
  vec3 screenSize = cameraSpaceSize(vec3(size * scale * borderScale / scaleFactor / maxScale, 1.0));

  // Test whether the label is larger on the screen than the font size
  bool largerOnScreen = screenSize.y > size.y || screenSize.x > size.x;

  // Determines if a scale mode should be used or not for the vertex
  float useScaleMode = float(
    (
      scaling == 3.0 ||                  // NEVER mode - keep the image the same size always
      (largerOnScreen && scaling == 2.0) // BOUND_MAX mode - only if we're larger than the font size do we scale down
    ) &&
    scaling != 1.0                       // ALWAYS mode - the image stays completely in world space allowing it to scale freely
  );

  // Correct aspect ratio. Sufficient fix for most applications.
  // Will need another solution in the case of:
  // (cameraScale2D y != cameraScale2D.x) && (cameraScale2D.x != 1 && cameraScale2D.y != 1)

  // If zooms are unequal, assume one is filtered to be 1.0
  float unequalZooms = float(cameraScale2D.x != cameraScale2D.y);

  vec2 adjustedSize = mix(
    size,
    (size * cameraScale2D.yx),
    unequalZooms
  );

  // Destructure the normals attribute
  float normal = normals.x;
  float side = normals.y;

  vec2 scaledAnchor = anchor * scale;

  // Get the location of the anchor in world space
  vec2 worldAnchor = location + scaledAnchor;

  vec2 adjustedAnchor = mix(
    scaledAnchor,
    (scaledAnchor * cameraScale2D.yx),
    unequalZooms
  );

  // Get the position of the current vertex
  vec2 vertex = vec2(side, float(normal == 1.0)) * scale * adjustedSize + location - adjustedAnchor;

  // See how scaled the size on screen will be from the actual height of the label
  float labelScreenScale = mix(
    screenSize.y / adjustedSize.y,
    screenSize.x / adjustedSize.x,
    float((cameraScale2D.x != 1.0))
  );

  float currentScale = labelScreenScale * scale;

  // If our screen rendering is larger than the size the label is supposed to be, then we automagically
  // scale down our label to stay the correct size, centered on the anchor point
  vec2 anchorToVertex = vertex - location;

  // We now choose between keeping the same image size or keeping it in world space
  vertex = mix(
    // This option keeps the image size in world space
    vertex + textAreaOrigin,
    // This option counters the scaling of the image on the screen keeping it a static size
    (anchorToVertex + location - textAreaAnchor) / labelScreenScale + textAreaOrigin + textAreaAnchor,
    // This is the flag determining if a scale mode should be applied to the vertex
    useScaleMode
  );

  // --Texture and Color
  // Apply the label's color as a tint to the label (all labels are rendered white to the base texture)
  vertexColor = color;

  gl_Position = clipSpace(vec3(vertex, depth));
}
`, qe = class qe extends Ne {
  /**
   * Define our shader and it's inputs
   */
  initShader() {
    const e = this.props.animate || {}, t = {
      0: 1,
      1: 1,
      2: -1,
      3: 1,
      4: -1,
      5: -1
    }, n = {
      0: 0,
      1: 0,
      2: 0,
      3: 1,
      4: 1,
      5: 1
    }, { scaleFactor: s = () => 1 } = this.props;
    return {
      fs: o0,
      instanceAttributes: [
        {
          easing: e.location,
          name: qe.attributeNames.location,
          size: S.TWO,
          update: (r) => r.position
        },
        {
          name: qe.attributeNames.anchor,
          size: S.TWO,
          update: (r) => [r.anchor.x || 0, r.anchor.y || 0]
        },
        {
          name: qe.attributeNames.size,
          size: S.TWO,
          update: (r) => r.size
        },
        {
          name: qe.attributeNames.depth,
          size: S.ONE,
          update: (r) => [r.depth]
        },
        {
          name: qe.attributeNames.scaling,
          size: S.ONE,
          update: (r) => [r.scaling]
        },
        {
          easing: e.color,
          name: qe.attributeNames.color,
          size: S.FOUR,
          update: (r) => r.color
        },
        {
          name: qe.attributeNames.scale,
          size: S.ONE,
          update: (r) => [r.scale]
        },
        {
          name: qe.attributeNames.maxScale,
          size: S.ONE,
          update: (r) => [r.maxScale]
        },
        {
          name: qe.attributeNames.fontScale,
          size: S.ONE,
          update: (r) => [r.fontScale]
        },
        {
          name: "textAreaOrigin",
          size: S.TWO,
          update: (r) => r.textAreaOrigin
        },
        {
          name: "textAreaAnchor",
          size: S.TWO,
          update: (r) => r.textAreaAnchor
        }
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: _.ONE,
          update: (r) => [s()]
        }
      ],
      vertexAttributes: [
        {
          name: "normals",
          size: ke.TWO,
          update: (r) => [
            // Normal
            t[r],
            // The side of the quad
            n[r]
          ]
        }
      ],
      vertexCount: 6,
      vs: a0
    };
  }
  getMaterialOptions() {
    return it.transparentShapeBlending;
  }
};
qe.defaultProps = {
  key: "",
  data: new oe()
}, qe.attributeNames = {
  anchor: "anchor",
  color: "color",
  depth: "depth",
  fontScale: "fontScale",
  location: "location",
  maxScale: "maxScale",
  scale: "scale",
  scaling: "scaling",
  size: "size"
};
let co = qe;
const Si = {
  [L.TopLeft]: (i) => [0, 0],
  [L.TopMiddle]: (i) => [
    i.maxWidth / 2,
    0
  ],
  [L.TopRight]: (i) => [
    i.maxWidth,
    0
  ],
  [L.MiddleLeft]: (i) => [
    0,
    i.maxHeight / 2
  ],
  [L.Middle]: (i) => [
    i.maxWidth / 2,
    i.maxHeight / 2
  ],
  [L.MiddleRight]: (i) => [
    i.maxWidth,
    i.maxHeight / 2
  ],
  [L.BottomLeft]: (i) => [
    0,
    i.maxHeight
  ],
  [L.BottomMiddle]: (i) => [
    i.maxWidth / 2,
    i.maxHeight
  ],
  [L.BottomRight]: (i) => [
    i.maxWidth,
    i.maxHeight
  ],
  [L.Custom]: (i) => [
    i.anchor.x || 0,
    i.anchor.y || 0
  ]
};
function Ms(i, e) {
  let t = Number.MAX_SAFE_INTEGER;
  for (let n = 0, s = i.length; n < s; n++) {
    const r = i[n], o = e.get(r);
    o === 0 ? t = 0 : o && o < t && (t = o);
  }
  return t === Number.MAX_SAFE_INTEGER ? 0 : t;
}
function c0(i) {
  const e = [], t = i.split(eu);
  for (let r = 0, o = t.length - 1; r < o; r++)
    t[r].split(" ").forEach((l) => {
      l !== "" && e.push(l);
    }), e.push(`
`);
  return t[t.length - 1].split(" ").forEach((r) => {
    r !== "" && e.push(r);
  }), e;
}
function l0(i, e) {
  const t = /* @__PURE__ */ new Map();
  if (e.fontMap) {
    const n = e.fontMap.fontSource.size, s = i.fontSize / n, r = e.fontMap, o = i.text.replace(/\s/g, "");
    let a = Number.MAX_SAFE_INTEGER, c = 0, l, h = "";
    for (let u = 0, d = o.length; u < d; ++u) {
      const f = o[u];
      l = 0, h && (l = r.kerning[h][f][1] || 0), c = c + l * s, t.set(f, c), a = Math.min(c, a), h = f;
    }
    t.forEach((u, d) => {
      t.set(d, u - a);
    });
  }
  return t;
}
function h0(i, e, t) {
  const n = [], s = t.fontMap ? t.fontMap.fontSource.size : e.fontSize, r = e.fontSize / s;
  let o = "", a = 0, c = [0, 0];
  for (let l = 0, h = i.text.length; l < h; l++) {
    const u = i.text[l];
    if (t.fontMap) {
      let d = [0, 0];
      o && (d = t.fontMap.kerning[o][u] || [0, 0]), c = Ui(c, _e(d, r)), l !== 0 && (c = Ui(c, [e.letterSpacing, 0]));
      const f = t.fontMap.glyphMap[u];
      a = c[0] + f.pixelWidth * r, n.push(a), o = u;
    }
  }
  return n;
}
const na = class na extends Ne {
  constructor() {
    super(...arguments), this.providers = {
      /** Provider for the label layer this layer manages */
      labels: new oe(),
      /** Provider for the border layer that renders the border of text area */
      borders: new oe()
    }, this.fullUpdate = !1, this.areaToLabels = /* @__PURE__ */ new Map(), this.areaToLines = /* @__PURE__ */ new Map(), this.areaWaitingOnLabel = /* @__PURE__ */ new Map(), this.areaTokerningRequest = /* @__PURE__ */ new Map(), this.areaToWords = /* @__PURE__ */ new Map(), this.labelsInLine = [], this.handleLabelReady = (e) => {
      if (!e.parentTextArea) {
        delete e.onReady;
        return;
      }
      const t = e.parentTextArea, n = this.areaWaitingOnLabel.get(t);
      if (n && n.has(e) && (n.delete(e), n.size <= 0)) {
        t.active = !0;
        const s = t.onReady;
        s && s(t);
      }
    };
  }
  /**
   * This provides the child layers that will render on behalf of this layer.
   *
   * For Labels, a label is simply a group of well placed glyphs. So we defer all of
   * the labels changes by converting the label into glyphs and applying the changes to
   * it's set of glyphs.
   */
  childLayers() {
    const e = this.props.animateLabel || {}, t = this.props.animateBorder || {}, n = this.props.scaling;
    return [
      zn(oo, {
        animate: e,
        customGlyphLayer: this.props.customGlyphLayer,
        data: this.providers.labels,
        key: `${this.id}.labels`,
        resourceKey: this.props.resourceKey,
        scaleMode: n,
        inTextArea: !0
      }),
      zn(co, {
        animate: {
          color: t.color,
          location: t.location
        },
        data: this.providers.borders,
        key: `${this.id}.border`
      })
    ];
  }
  /**
   * We override the draw method of the layer to handle the diffs of the provider in a
   * custom fashion by delegating the changes of the provider to the child layers.
   */
  draw() {
    const e = this.resolveChanges();
    if (e.length <= 0) return;
    if (!this.propertyIds) {
      const m = e[0][0];
      this.propertyIds = this.getInstanceObservableIds(m, [
        "active",
        "alignment",
        "borderWidth",
        "color",
        "fontSize",
        "hasBorder",
        "letterSpacing",
        "lineHeight",
        "maxHeight",
        "maxWidth",
        "origin",
        "padding",
        "text",
        "wordWrap"
      ]);
    }
    const {
      active: t,
      alignment: n,
      borderWidth: s,
      color: r,
      fontSize: o,
      hasBorder: a,
      letterSpacing: c,
      lineHeight: l,
      maxHeight: h,
      maxWidth: u,
      origin: d,
      padding: f,
      text: p,
      wordWrap: g
    } = this.propertyIds;
    for (let m = 0, v = e.length; m < v; ++m) {
      const [b, w, y] = e[m];
      switch (w) {
        case ge.CHANGE:
          if (!this.areaToLabels.get(b)) {
            this.insert(b);
            continue;
          }
          y[p] !== void 0 ? (this.clear(b), this.updateLabels(b), this.layout(b)) : y[t] !== void 0 && (b.active ? (this.layout(b), this.showLabels(b)) : this.hideLabels(b)), y[n] !== void 0 && (this.clear(b), this.updateLabels(b), this.layoutLabels(b)), y[r] !== void 0 && this.updateLabelColors(b), y[d] !== void 0 && this.updateLabelOrigins(b), y[o] !== void 0 && this.updateLabelFontSizes(b), y[g] !== void 0 && this.updateLabelLineWrap(b), y[l] !== void 0 && this.updateLabelLineHeight(b), y[u] !== void 0 && this.updateTextAreaSize(b), y[h] !== void 0 && this.updateTextAreaSize(b), y[f] !== void 0 && this.updateTextAreaSize(b), y[s] !== void 0 && this.updateBorderWidth(b), y[a] !== void 0 && this.updateBorder(b), y[c] !== void 0 && this.updateLetterSpacing(b);
          break;
        case ge.INSERT:
          this.insert(b);
          break;
        case ge.REMOVE: {
          const E = this.areaToLabels.get(b);
          if (E) {
            for (let C = 0, M = E.length; C < M; ++C) {
              const R = E[C];
              R instanceof Oe && this.providers.labels.remove(R);
            }
            this.areaToLabels.delete(b), this.areaWaitingOnLabel.delete(b);
          }
          break;
        }
      }
    }
  }
  /**
   * Handles insertion operation for the textArea
   */
  insert(e) {
    this.layout(e), this.updateLabels(e);
  }
  /**
   * Unmount all of the glyphs that make the label
   */
  hideLabels(e) {
    const t = this.areaToLabels.get(e);
    if (t)
      for (let n = 0, s = t.length; n < s; ++n) {
        const r = t[n];
        r instanceof Oe && this.providers.labels.remove(r);
      }
  }
  /**
   * Tell the system this layer is not providing any rendering IO information for the GPU to render.
   */
  initShader() {
    return null;
  }
  /** When text is changed, labels should be clear in order to generate new labels */
  clear(e) {
    const t = e.labels;
    for (let s = 0, r = t.length; s < r; s++) {
      const o = t[s];
      o instanceof Oe && this.providers.labels.remove(o);
    }
    e.labels = [];
    const n = e.newLabels;
    for (let s = 0, r = n.length; s < r; s++) {
      const o = n[s];
      o instanceof Oe && this.providers.labels.remove(o);
    }
    e.newLabels = [], this.areaToLabels.delete(e), this.areaWaitingOnLabel.delete(e), this.areaToWords.delete(e);
  }
  /** When a label exceeds the maxWidth of a textArea, sperate it into several parts */
  seperateLabel(e, t, n, s, r, o, a, c, l) {
    const h = e.padding[0], u = e.padding[1] || 0, d = e.padding[2] || 0, f = e.padding[3] || 0, p = e.maxWidth - f - u, g = e.maxHeight - h - d, m = e.origin[0], v = e.origin[1];
    t.active = !1;
    const b = s.substring(0, r + 1), w = Ms(b, n), y = Si[e.anchor.type](e), E = new Oe({
      anchor: {
        padding: 0,
        type: L.Custom,
        paddingDirection: [
          o + f,
          a + h + w
        ],
        x: y[0],
        y: y[1]
      },
      color: e.color,
      fontSize: e.fontSize,
      letterSpacing: e.letterSpacing,
      origin: [m, v],
      text: b
    });
    if (E.size = [l[r], t.size[1]], this.providers.labels.add(E), e.newLabels.push(E), this.labelsInLine.push(E), o += E.getWidth() + c, e.wordWrap === Qt.CHARACTER || e.wordWrap === Qt.WORD) {
      if (this.setTextAlignment(
        o,
        a,
        c,
        p,
        e.alignment
      ), o = 0, a += e.lineHeight, a + e.lineHeight <= g) {
        let C = l[l.length - 1] - l[r];
        for (; C > p && a + e.lineHeight <= g; ) {
          let M = l.length - 1;
          for (; l[M] - l[r] > p; )
            M--;
          const R = s.substring(r + 1, M + 1), G = Ms(R, n), z = new Oe({
            anchor: {
              padding: 0,
              type: L.Custom,
              paddingDirection: [
                o + f,
                a + h + G
              ],
              x: y[0],
              y: y[1]
            },
            color: e.color,
            fontSize: e.fontSize,
            letterSpacing: e.letterSpacing,
            origin: [m, v],
            text: R
          });
          z.size = [
            l[M] - l[r],
            t.size[1]
          ], o += z.getWidth() + c, this.labelsInLine.push(z), this.providers.labels.add(z), e.newLabels.push(z), this.setTextAlignment(
            o,
            a,
            c,
            p,
            e.alignment
          ), o = 0, a += e.lineHeight, r = M, C = l[l.length - 1] - l[r];
        }
        if (a + e.lineHeight <= g) {
          const M = s.substring(r + 1), R = Ms(M, n), G = new Oe({
            anchor: {
              padding: 0,
              type: L.Custom,
              paddingDirection: [
                o + f,
                a + h + R
              ],
              x: y[0],
              y: y[1]
            },
            color: e.color,
            fontSize: e.fontSize,
            letterSpacing: e.letterSpacing,
            origin: [m, v],
            text: M
          });
          G.size = [
            l[l.length - 1] - l[r],
            t.size[1]
          ], this.labelsInLine.push(G);
          const z = [];
          for (let N = r + 1; N < l.length; N++)
            z.push(l[N] - l[r]);
          this.providers.labels.add(G), e.newLabels.push(G), o += G.getWidth() + c;
        }
      }
    } else e.wordWrap === Qt.NONE && (o += E.getWidth() + c);
    return [o, a];
  }
  /**
   * This updates textAreaInstance after lineWrap is changed
   */
  updateLabelLineWrap(e) {
    const t = this.areaToLabels.get(e);
    if (t) {
      for (let n = 0, s = t.length; n < s; ++n) {
        const r = t[n];
        r instanceof Oe && (r.active = !0);
      }
      for (let n = 0, s = e.newLabels.length; n < s; ++n) {
        const r = e.newLabels[n];
        this.providers.labels.remove(r);
      }
      e.newLabels = [], this.layoutLabels(e);
    }
  }
  /**
   * This updates textAreaInstance after lineHeight is changed
   */
  updateLabelLineHeight(e) {
    const t = this.areaToLabels.get(e);
    if (t) {
      for (let n = 0, s = t.length; n < s; ++n) {
        const r = t[n];
        r instanceof Oe && (r.active = !0);
      }
      for (let n = 0, s = e.newLabels.length; n < s; ++n) {
        const r = e.newLabels[n];
        this.providers.labels.remove(r);
      }
      e.newLabels = [], this.layoutLabels(e);
    }
  }
  /**
   * This updates textAreaInstance after textArea width or height is changed
   */
  updateTextAreaSize(e) {
    const t = this.areaToLabels.get(e);
    if (t) {
      for (let n = 0, s = t.length; n < s; ++n) {
        const r = t[n];
        r instanceof Oe && (r.active = !0);
      }
      for (let n = 0, s = e.newLabels.length; n < s; ++n) {
        const r = e.newLabels[n];
        this.providers.labels.remove(r);
      }
      e.newLabels = [];
      for (let n = 0, s = e.borders.length; n < s; ++n) {
        const r = e.borders[n];
        this.providers.borders.remove(r);
      }
      e.borders = [], this.layoutBorder(e), this.layoutLabels(e);
    }
  }
  /**
   * Update thickness of border
   */
  updateBorderWidth(e) {
    for (let t = 0, n = e.borders.length; t < n; ++t) {
      const s = e.borders[t];
      this.providers.borders.remove(s);
    }
    e.borders = [], this.layoutBorder(e);
  }
  /**
   * Update the border of textArea to remove border or add border
   */
  updateBorder(e) {
    if (e.hasBorder)
      this.layoutBorder(e);
    else {
      for (let t = 0, n = e.borders.length; t < n; ++t) {
        const s = e.borders[t];
        this.providers.borders.remove(s);
      }
      e.borders = [];
    }
  }
  /**
   * Update letterSpacing of all labels in textArea
   */
  updateLetterSpacing(e) {
    this.clear(e), this.updateLabels(e), this.layout(e);
  }
  /**
   * Sets the alignment of TextArea by adjusting all the labels' origin
   */
  setTextAlignment(e, t, n, s, r) {
    if (e - n < s && r !== ao.LEFT) {
      const o = s - e + n, a = r === ao.RIGHT ? o : o / 2;
      this.labelsInLine.forEach((c) => {
        const l = c.anchor;
        c.anchor = {
          padding: l.padding,
          type: L.Custom,
          paddingDirection: [
            (l.paddingDirection ? l.paddingDirection[0] : 0) + a,
            l.paddingDirection ? l.paddingDirection[1] : t
          ],
          x: l.x,
          y: l.y
        };
      });
    }
    this.labelsInLine = [];
  }
  /**
   * Layout the border of textAreaInstance
   */
  layoutBorder(e) {
    if (e.hasBorder) {
      const t = this.areaTokerningRequest.get(e);
      if (!t) return;
      const n = t.fontMap ? t.fontMap.fontSource.size : e.fontSize, s = e.fontSize / n, r = this.props.scaling, o = e.borderWidth, a = new Is({
        color: e.color,
        fontScale: s,
        scaling: r,
        size: [e.maxWidth + 2 * o, o],
        textAreaOrigin: e.origin,
        textAreaAnchor: Si[e.anchor.type](e),
        position: [-o, -o]
      }), c = new Is({
        color: e.color,
        fontScale: s,
        scaling: r,
        size: [o, e.maxHeight + 2 * o],
        textAreaOrigin: e.origin,
        textAreaAnchor: Si[e.anchor.type](e),
        position: [-o, -o]
      }), l = new Is({
        color: e.color,
        fontScale: s,
        scaling: r,
        size: [o, e.maxHeight + 2 * o],
        textAreaOrigin: e.origin,
        textAreaAnchor: Si[e.anchor.type](e),
        position: [e.maxWidth, -o]
      }), h = new Is({
        color: e.color,
        fontScale: s,
        scaling: r,
        size: [e.maxWidth + 2 * o, o],
        textAreaOrigin: e.origin,
        textAreaAnchor: Si[e.anchor.type](e),
        position: [-o, e.maxHeight]
      });
      this.providers.borders.add(a), this.providers.borders.add(c), this.providers.borders.add(l), this.providers.borders.add(h), e.borders.push(a), e.borders.push(c), e.borders.push(l), e.borders.push(h);
    }
  }
  /**
   * Calculate the positions of labels
   */
  layoutLabels(e) {
    const t = this.areaTokerningRequest.get(e);
    if (!t) return;
    const n = e.padding[0], s = e.padding[1] || 0, r = e.padding[2] || 0, o = e.padding[3] || 0, a = e.maxWidth - o - s, c = e.maxHeight - n - r, l = e.origin[0], h = e.origin[1];
    let u = 0;
    if (e.spaceWidth)
      u = e.spaceWidth;
    else {
      if (t.fontMap) {
        const g = t.fontMap.fontSource.size, m = e.fontSize / g;
        u = t.fontMap.spaceWidth * m;
      } else
        u = this.props.whiteSpaceKerning || e.fontSize / 2;
      e.spaceWidth = u;
    }
    const d = l0(e, t);
    let f = 0, p = 0;
    this.labelsInLine = [];
    for (let g = 0, m = e.labels.length; g < m; ++g) {
      const v = e.labels[g];
      if (v instanceof Oe) {
        const b = v.getWidth(), w = Ms(v.text, d), y = h0(v, e, t);
        if (p + e.lineHeight <= c && y[0] <= a)
          if (f + b <= a) {
            v.origin = [l, h];
            const E = Si[e.anchor.type](e);
            v.anchor = {
              padding: 0,
              paddingDirection: [
                f + o,
                p + n + w
              ],
              type: L.Custom,
              x: E[0],
              y: E[1]
            }, f += b + u, this.labelsInLine.push(v), f >= a && e.wordWrap === Qt.CHARACTER && g + 1 < m && e.labels[g + 1] !== Zn.NEWLINE && (this.setTextAlignment(
              f,
              p,
              u,
              a,
              e.alignment
            ), f = 0, p += e.lineHeight);
          } else if (e.wordWrap === Qt.WORD && v.getWidth() <= e.maxWidth)
            if (this.setTextAlignment(
              f,
              p,
              u,
              a,
              e.alignment
            ), f = 0, p += e.lineHeight, p + e.lineHeight <= c) {
              v.origin = [l, h];
              const E = Si[e.anchor.type](e);
              v.anchor = {
                padding: 0,
                paddingDirection: [
                  f + o,
                  p + n + w
                ],
                type: L.Custom,
                x: E[0],
                y: E[1]
              }, this.labelsInLine.push(v), f += v.getWidth() + u;
            } else
              v.active = !1;
          else {
            const E = a - f;
            let C = y.length - 1;
            const M = v.text;
            for (; y[C] > E; )
              C--;
            if (C >= 0) {
              const R = this.seperateLabel(
                e,
                v,
                d,
                M,
                C,
                f,
                p,
                u,
                y
              );
              f = R[0], p = R[1];
            } else if (e.wordWrap === Qt.CHARACTER || e.wordWrap === Qt.WORD)
              if (this.setTextAlignment(
                f,
                p,
                u,
                a,
                e.alignment
              ), p += e.lineHeight, f = 0, p + e.lineHeight < c)
                if (f + v.getWidth() <= a) {
                  v.origin = [l, h];
                  const R = Si[e.anchor.type](e);
                  v.anchor = {
                    padding: 0,
                    paddingDirection: [
                      f + o,
                      p + n + w
                    ],
                    type: L.Custom,
                    x: R[0],
                    y: R[1]
                  }, this.labelsInLine.push(v), f += v.getWidth() + u, f >= a && g + 1 < m && e.labels[g + 1] !== Zn.NEWLINE && (this.setTextAlignment(
                    f,
                    p,
                    u,
                    a,
                    e.alignment
                  ), f = 0, p += e.lineHeight);
                } else {
                  const R = a - f;
                  let G = y.length - 1;
                  const z = v.text;
                  for (; y[G] > R; )
                    G--;
                  if (G >= 0) {
                    const N = this.seperateLabel(
                      e,
                      v,
                      d,
                      z,
                      G,
                      f,
                      p,
                      u,
                      y
                    );
                    f = N[0], p = N[1];
                  }
                }
              else
                v.active = !1;
            else e.wordWrap === Qt.NONE && (v.active = !1);
          }
        else
          v.active = !1;
      } else v === Zn.NEWLINE && (this.setTextAlignment(
        f,
        p,
        u,
        a,
        e.alignment
      ), f = 0, p += e.lineHeight);
    }
    this.setTextAlignment(
      f,
      p,
      u,
      a,
      e.alignment
    );
  }
  /**
   * This uses calculated kerning information to place the glyph relative to it's left character neighbor.
   * The first glyph will use metrics of the glyphs drop down amount to determine where the glyph
   * will be placed.
   */
  layout(e) {
    this.updateKerning(e);
    const t = this.areaTokerningRequest.get(e);
    if (!t || !t.fontMap) return;
    const n = this.areaWaitingOnLabel.get(e);
    if (n && n.size > 0 || !e.active) return;
    const s = this.areaToLabels.get(e);
    !s || s.length === 0 || (this.updateLabels(e), this.layoutBorder(e), this.layoutLabels(e));
  }
  /**
   * Update kerning of textArea Instance, retrieve kerning request from map or create a new one
   */
  updateKerning(e) {
    let t = this.areaTokerningRequest.get(e);
    const n = e.text;
    if (t) {
      if (t.kerningPairs && t.kerningPairs.indexOf(n) > -1)
        return !!t.fontMap;
      if (t.fontMap && !t.fontMap.supportsKerning(n))
        this.areaTokerningRequest.delete(e), t = void 0;
      else
        return !1;
    } else {
      const s = {
        fontSize: e.fontSize,
        text: e.text,
        letterSpacing: e.letterSpacing
      };
      return t = Gn({
        character: "",
        key: this.props.resourceKey || "",
        kerningPairs: [n],
        metrics: s
      }), e.preload ? (e.resourceTrigger = () => {
        e.onReady && e.onReady(e);
      }, this.resource.request(this, e, t)) : (this.resource.request(this, e, t), this.areaTokerningRequest.set(e, t)), !1;
    }
    return !0;
  }
  /**
   * This layer does not have or use a buffer manager thus it must track management of an instance
   * in it's own way.
   */
  managesInstance(e) {
    return !!this.areaToLabels.get(e);
  }
  /**
   * This makes a label's glyphs visible by adding them to the glyph layer rendering the glyphs.
   */
  showLabels(e) {
    const t = this.areaToLabels.get(e);
    if (t)
      for (let n = 0, s = t.length; n < s; ++n) {
        const r = t[n];
        r instanceof Oe && this.providers.labels.add(r);
      }
  }
  /**
   * This ensures the correct number of glyphs is being provided for the label indicated.
   */
  updateLabels(e) {
    let t = this.areaToLabels.get(e);
    const n = e.padding[0], s = e.padding[3] || 0, r = e.origin[0] + s, o = e.origin[1] + n;
    t || (t = [], this.areaToLabels.set(e, t));
    let a = this.areaWaitingOnLabel.get(e);
    a || (a = /* @__PURE__ */ new Set(), this.areaWaitingOnLabel.set(e, a));
    let c = this.areaToWords.get(e);
    if (c || (c = c0(e.text)), t.length < c.length)
      for (let l = t.length, h = c.length; l < h; ++l) {
        const u = c[l];
        if (u === `
`)
          t.push(Zn.NEWLINE);
        else {
          const d = new Oe({
            active: !1,
            color: e.color,
            fontSize: e.fontSize,
            letterSpacing: e.letterSpacing,
            text: u,
            origin: [r, o],
            onReady: this.handleLabelReady
          });
          d.parentTextArea = e, t.push(d), this.providers.labels.add(d), a.add(d);
        }
      }
    e.labels = t;
  }
  /**
   * Updates the label colors to match the label's label colors
   */
  updateLabelColors(e) {
    const t = this.areaToLabels.get(e);
    if (t) {
      for (let n = 0, s = t.length; n < s; ++n) {
        const r = t[n];
        r instanceof Oe && (r.color = ei(e.color));
      }
      for (let n = 0, s = e.newLabels.length; n < s; ++n)
        e.newLabels[n].color = ei(e.color);
      for (let n = 0, s = e.borders.length; n < s; ++n)
        e.borders[n].color = ei(e.color);
    }
  }
  /**
   * Updates fontsize of all labels
   */
  updateLabelFontSizes(e) {
    this.clear(e), this.updateLabels(e), this.areaTokerningRequest.delete(e), this.layout(e);
  }
  /**
   * This updates all of the labels for the label to have the same position
   * as the label.
   */
  updateLabelOrigins(e) {
    const t = this.areaToLabels.get(e);
    if (!t) return;
    const n = e.origin, s = e.oldOrigin;
    for (let r = 0, o = t.length; r < o; ++r) {
      const a = t[r];
      if (a instanceof Oe) {
        const c = a.origin;
        a.origin = [
          c[0] + n[0] - s[0],
          c[1] + n[1] - s[1]
        ];
      }
    }
    for (let r = 0, o = e.newLabels.length; r < o; ++r) {
      const a = e.newLabels[r];
      if (a instanceof Oe) {
        const c = a.origin;
        a.origin = [
          c[0] + n[0] - s[0],
          c[1] + n[1] - s[1]
        ];
      }
    }
    for (let r = 0, o = e.borders.length; r < o; ++r) {
      const a = e.borders[r];
      a.position = [
        a.position[0] + n[0] - s[0],
        a.position[1] + n[1] - s[1]
      ];
    }
    e.oldOrigin = e.origin;
  }
  /**
   * If our resource changes, we need a full update of all instances.
   * If our provider changes, we probably want to ensure our property identifiers are correct.
   */
  willUpdateProps(e) {
    e.data !== this.props.data && delete this.propertyIds, e.resourceKey !== this.props.resourceKey && (this.fullUpdate = !0);
  }
};
na.defaultProps = {
  key: "",
  data: new oe(),
  scaling: Zt.ALWAYS
};
let uc = na;
const u0 = `precision highp float;

varying vec4 vertexColor;
varying vec4 _outlineColor;
varying vec2 _texCoord;
varying vec2 _boxSize;
varying float _outline;

void main() {
  // Get rid of tiny float errors
  if (_outline < 0.0000001) \${out: color} = vertexColor;
  else {
    _FragColor = mix(vertexColor, _outlineColor, float(_texCoord.x < _outline ||
      _texCoord.x > (_boxSize.x - _outline) ||
      _texCoord.y < _outline ||
      _texCoord.y > (_boxSize.y - _outline)));
  }
}
`, d0 = `precision highp float;

varying vec4 vertexColor;
varying vec4 _outlineColor;
varying float _outline;
varying vec2 _texCoord;
// How large the rectangle is in normalized window space (0 - 1 space not -1 - 1)
varying vec2 _boxSize;

void main() {
  // Determine final screen size of label
  vec3 screenSize = cameraSpaceSize(vec3(size * scale / scaleFactor / maxScale, 1.0f));

  // Test whether the label is larger on the screen than the font size
  bool largerOnScreen = screenSize.y > size.y || screenSize.x > size.x;

  // Determines if a scale mode should be used or not for the vertex
  float useScaleMode = float((scaling == 3.0f ||                  // NEVER mode - keep the image the same size always
    (largerOnScreen && scaling == 2.0f) // BOUND_MAX mode - only if we're larger than the font size do we scale down
  ) &&
    scaling != 1.0f                       // ALWAYS mode - the image stays completely in world space allowing it to scale freely
  );

  // TODO: Correct aspect ratio. Sufficient fix for most applications.
  // Will need another solution in the case of:
  // (cameraScale2D.y != cameraScale2D.x) && (cameraScale2D.x != 1 && cameraScale2D.y != 1)

  // If zooms are unequal, assume one is filtered to be 1.0
  float unequalZooms = float(cameraScale2D.x != cameraScale2D.y);

  vec2 adjustedSize = mix(size, (size * cameraScale2D.yx), unequalZooms);

  // Destructure normals attribute
  float normal = normals.x;
  float side = normals.y;

  vec2 scaledAnchor = anchor * scale;

  // Get the location of the anchor in world space
  vec2 worldAnchor = location + scaledAnchor;

  vec2 adjustedAnchor = mix(scaledAnchor, (scaledAnchor * cameraScale2D.yx), unequalZooms);

  // Get the position of the current vertex
  vec2 vertex = vec2(side, float(normal == 1.0f)) * scale * adjustedSize + location - adjustedAnchor;

  // See how scaled the size on screen will be from the actual height of the label
  float labelScreenScale = mix(screenSize.y / adjustedSize.y, screenSize.x / adjustedSize.x, float((cameraScale2D.x != 1.0f)));

  float currentScale = labelScreenScale * scale;

  // If our screen rendering is larger than the size the label is supposed to be, then we automagically
  // scale down our label to stay the correct size, centered on the anchor point
  vec2 anchorToVertex = vertex - location;

  float usedScaling = mix(
    1.,
    1. / labelScreenScale,
    useScaleMode
  );

  // We now choose between keeping the same image size or keeping it in world space
  vertex = mix(
    // This option keeps the image size in world space
  vertex,
    // This option counters the scaling of the image on the screen keeping it a static size
  (anchorToVertex * usedScaling) + location,
    // This is the flag determining if a scale mode should be applied to the vertex
  useScaleMode);

  // --Texture and Color
  // Apply the label's color as a tint to the label (all labels are rendered white to the base texture)
  vertexColor = color;

  gl_Position = clipSpace(vec3(vertex, depth));

  vec2 clipSize = (cameraScale2D.xy * scale * adjustedSize * usedScaling);
  _outlineColor = outlineColor;
  _outline = outline;
  _boxSize = clipSize;
  // Send the tex coords in screen space which is 0 - width in normalized clip space
  _texCoord = vec2(side, (normal + 1.) * 0.5) * clipSize;
}
`, Ge = class Ge extends Ne {
  /**
   * Define our shader and it's inputs
   */
  initShader() {
    const e = this.props.animate || {}, t = {
      0: 1,
      1: 1,
      2: -1,
      3: 1,
      4: -1,
      5: -1
    }, n = {
      0: 0,
      1: 0,
      2: 0,
      3: 1,
      4: 1,
      5: 1
    }, { scaleFactor: s = () => 1 } = this.props;
    return {
      fs: u0,
      instanceAttributes: [
        {
          easing: e.location,
          name: Ge.attributeNames.location,
          size: S.TWO,
          update: (r) => r.position
        },
        {
          name: Ge.attributeNames.anchor,
          size: S.TWO,
          update: (r) => [r.anchor.x || 0, r.anchor.y || 0]
        },
        {
          easing: e.size,
          name: Ge.attributeNames.size,
          size: S.TWO,
          update: (r) => r.size
        },
        {
          name: Ge.attributeNames.depth,
          size: S.ONE,
          update: (r) => [r.depth]
        },
        {
          name: Ge.attributeNames.scaling,
          size: S.ONE,
          update: (r) => [r.scaling]
        },
        {
          easing: e.color,
          name: Ge.attributeNames.color,
          size: S.FOUR,
          update: (r) => r.color
        },
        {
          name: Ge.attributeNames.scale,
          size: S.ONE,
          update: (r) => [r.scale]
        },
        {
          name: Ge.attributeNames.maxScale,
          size: S.ONE,
          update: (r) => [r.maxScale]
        },
        {
          easing: e.outline,
          name: Ge.attributeNames.outline,
          size: S.ONE,
          update: (r) => [r.outline]
        },
        {
          easing: e.outlineColor,
          name: Ge.attributeNames.outlineColor,
          size: S.FOUR,
          update: (r) => r.outlineColor
        }
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: _.ONE,
          update: (r) => [s()]
        }
      ],
      vertexAttributes: [
        {
          name: "normals",
          size: ke.TWO,
          update: (r) => [
            // Normal
            t[r],
            // The side of the quad
            n[r]
          ]
        }
      ],
      vertexCount: 6,
      vs: d0
    };
  }
  getMaterialOptions() {
    return it.transparentShapeBlending;
  }
};
Ge.defaultProps = {
  key: "",
  data: new oe()
}, Ge.attributeNames = {
  anchor: "anchor",
  color: "color",
  depth: "depth",
  location: "location",
  maxScale: "maxScale",
  scale: "scale",
  scaling: "scaling",
  size: "size",
  outline: "outline",
  outlineColor: "outlineColor"
};
let dc = Ge;
var f0 = Object.defineProperty, hs = (i, e, t, n) => {
  for (var s = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = o(e, t, s) || s);
  return s && f0(e, t, s), s;
};
const $n = class Nh extends nt {
  constructor(e) {
    super(e), this.color = [1, 1, 1, 1], this.depth = 0, this.radius = 0, this.thickness = 1, this.center = [0, 0], Xe(this, Nh), this.color = e.color || this.color, this.depth = e.depth || this.depth, this.radius = e.radius || this.radius, this.thickness = e.thickness || this.thickness, this.center = e.center || this.center;
  }
  get width() {
    return this.radius * 2;
  }
  get height() {
    return this.radius * 2;
  }
  get innerRadius() {
    return this.radius - this.thickness;
  }
};
hs([
  I
], $n.prototype, "color");
hs([
  I
], $n.prototype, "depth");
hs([
  I
], $n.prototype, "radius");
hs([
  I
], $n.prototype, "thickness");
hs([
  I
], $n.prototype, "center");
let wv = $n;
const p0 = `precision highp float;

/** This is the color of the ring */
varying vec4 vertexColor;
/**
 * This is how sharp the ring renders. For tiny rings, it's best to have
 * less sharpness to better convey the shape of a circle. A good starter setting:
 * edgeSharpness = mix(0.8, 0.01, min(gl_PointSize / 45.0, 1.0));
 */
varying float edgeSharpness;
/**
 * This should be a value that sets the thickness of the ring in normal space
 * relative to the PointSize
 */
varying float borderSize;
/**
 * Since this is now a quad instead of a point sprite, this provides what
 *gl_PointCoord used to provide.
 */
varying vec2 pointCoord;

varying float scale;

float circle(vec2 coord, float radius) {
  vec2 dist = coord - vec2(0.5f);

  return 1.0f - smoothstep(radius - (radius * edgeSharpness), radius, dot(dist, dist) * 4.0f);
}

void main() {
  float outer_step_factor = circle(pointCoord, 1.0f);
  float inner_step_factor = circle(pointCoord, 1.0f - borderSize * scale);

  gl_FragColor = mix(mix(                        // Select the outer color outside of the inner radius
  vec4(0.0f, 0.0f, 0.0f, 0.0f),    // Select invisible outside of inner and outer radius
  vertexColor,                  // Select outer color outside of inner, but inside outer
  outer_step_factor), vec4(0.0f, 0.0f, 0.0f, 0.0f),                 // Select inner color inside inner
  inner_step_factor);
}
`, g0 = `precision highp float;

varying vec4 vertexColor;
varying float edgeSharpness;
varying float borderSize;
varying vec2 pointCoord;

varying float scale;

void main() {
  scale = scaleFactor;

  vertexColor = color;
  float size = radius * scaleFactor * pixelRatio;

  float ringWidth = mix(2.0 , thickness, float(thickness > 2.0));

  borderSize = mix(
    (ringWidth) / size,
    ((ringWidth * pixelRatio) / size),
    float(pixelRatio > 1.0)
  );

  edgeSharpness = min(0.2 / (ringWidth * scale),  0.1);

  pointCoord = (normals.xy + vec2(1.0, 1.0)) / 2.0;

  // Center within clip space
  vec4 clipCenter = clipSpace(vec3(center, depth));
  // Center in screen space
  vec2 screenCenter = (clipCenter.xy + vec2(1.0, 1.0)) * vec2(0.5, 0.5) * viewSize;
  // Position in screen space
  vec2 vertex = (normals.xy * size) + screenCenter;
  // Position back to clip space
  gl_Position = vec4((vertex / viewSize) * vec2(2.0, 2.0) - vec2(1.0, 1.0), clipCenter.zw);
}
`, qt = class qt extends Ne {
  /**
   * Define our shader and it's inputs
   */
  initShader() {
    const e = this.props.scaleFactor || (() => 1), t = this.props.animate || {}, {
      color: n,
      center: s,
      radius: r
    } = t, o = {
      0: 1,
      1: 1,
      2: -1,
      3: 1,
      4: -1,
      5: -1
    }, a = {
      0: -1,
      1: -1,
      2: -1,
      3: 1,
      4: 1,
      5: 1
    };
    return {
      fs: p0,
      instanceAttributes: [
        {
          easing: s,
          name: qt.attributeNames.center,
          size: S.TWO,
          update: (c) => c.center
        },
        {
          easing: r,
          name: qt.attributeNames.radius,
          size: S.ONE,
          update: (c) => [c.radius]
        },
        {
          name: qt.attributeNames.depth,
          size: S.ONE,
          update: (c) => [c.depth]
        },
        {
          easing: n,
          name: qt.attributeNames.color,
          size: S.FOUR,
          update: (c) => c.color
        },
        {
          name: qt.attributeNames.thickness,
          size: S.ONE,
          update: (c) => [c.thickness]
        }
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: _.ONE,
          update: (c) => [e()]
        }
      ],
      vertexAttributes: [
        {
          name: "normals",
          size: ke.TWO,
          update: (c) => [
            // Normal
            o[c],
            // The side of the quad
            a[c]
          ]
        }
      ],
      vertexCount: 6,
      vs: g0
    };
  }
  getMaterialOptions() {
    return it.transparentShapeBlending;
  }
};
qt.defaultProps = {
  key: "",
  data: new oe()
}, qt.attributeNames = {
  center: "center",
  radius: "radius",
  depth: "depth",
  color: "color",
  thickness: "thickness"
};
let fc = qt;
const m0 = `// These are projection methods for basic camera operations
\${import: camera}

vec3 cameraSpace(vec3 world) {
  return (view * vec4(world, 1.0)).xyz;
}

vec3 cameraSpace(vec4 world) {
  return (view * world).xyz;
}

vec3 cameraSpaceDirection(vec3 world) {
  return (view * vec4(world, 0.0)).xyz;
}

vec3 cameraSpaceDirection(vec4 world) {
  return (view * world).xyz;
}

vec3 cameraSpaceSize(vec3 worldSize) {
  return (view * vec4(worldSize, 0.0)).xyz;
}

vec4 clipSpace(vec3 world) {
  return (viewProjection) * vec4(world, 1.0);
}

vec4 clipSpace(vec4 world) {
  return (viewProjection) * world;
}

vec4 clipSpaceDirection(vec3 worldSize) {
  return (viewProjection) * vec4(worldSize, 0.0);
}

vec4 clipSpaceDirection(vec4 worldSize) {
  return (viewProjection) * worldSize;
}

vec4 clipSpaceSize(vec3 worldSize) {
  return (viewProjection) * vec4(worldSize, 0.0);
}
`, x0 = `
These are properties injected from the
current camera applied to the view.

Constants:
mat4 projection;
mat4 view;
mat4 viewProjection;
vec3 cameraOffset;
vec3 cameraPosition;
vec3 cameraScale;
vec3 cameraRotation;
vec2 viewSize;
float pixelRatio;
`;
me.register([
  {
    moduleId: "camera",
    description: x0,
    // No explicit functional content is required, we will only use the uniforms for injecting information for this
    // module.
    content: "",
    compatibility: A.ALL,
    uniforms: (i) => [
      // This injects the projection matrix from the view camera
      {
        name: "projection",
        size: _.MATRIX4,
        update: () => i.view.props.camera.projection
      },
      {
        name: "viewProjection",
        size: _.MATRIX4,
        update: () => i.view.props.camera.viewProjection
      },
      // This injects the model view matrix from the view camera
      {
        name: "view",
        size: _.MATRIX4,
        update: () => i.view.props.camera.view
      },
      // This injects the camera's current position
      {
        name: "cameraPosition",
        size: _.THREE,
        update: () => i.view.props.camera.position
      },
      // This injects the camera's current scale
      {
        name: "cameraScale",
        size: _.THREE,
        update: () => i.view.props.camera.scale
      },
      // This injects the camera's Euler rotation
      {
        name: "cameraRotation",
        size: _.THREE,
        update: () => i.view.props.camera.scale
      },
      // This injects the pixel width and height of the view
      {
        shaderInjection: A.ALL,
        name: "viewSize",
        size: _.TWO,
        update: () => [
          i.view.viewBounds.width,
          i.view.viewBounds.height
        ]
      },
      // This injects the current layer's pixel ratio so pixel ratio dependent items can react to it
      // Things like gl_PointSize will need this metric if not working in clip space
      {
        shaderInjection: A.ALL,
        name: "pixelRatio",
        size: _.ONE,
        update: () => [i.view.pixelRatio]
      }
    ]
  },
  {
    moduleId: "projection",
    content: m0,
    compatibility: A.ALL
  }
]);
const Ph = `
This provides frame timing information
or how many frames have been rendered.

Constants:
float currentTime;
float currentFrame;
`;
me.register({
  moduleId: "frame",
  description: Ph,
  content: "",
  compatibility: A.ALL,
  uniforms: (i) => [
    // This will be the current frame's current time which is updated in the layer's surface draw call
    {
      name: "currentTime",
      size: _.ONE,
      shaderInjection: A.ALL,
      update: () => [i.surface.frameMetrics.currentTime]
    },
    {
      name: "currentFrame",
      size: _.ONE,
      shaderInjection: A.ALL,
      update: () => [i.surface.frameMetrics.currentFrame]
    }
  ]
});
me.register({
  moduleId: "time",
  description: Ph,
  content: "",
  compatibility: A.ALL,
  uniforms: (i) => [
    // This will be the current frame's current time which is updated in the layer's surface draw call
    {
      name: "time",
      size: _.ONE,
      shaderInjection: A.ALL,
      update: () => [i.surface.frameMetrics.currentTime]
    }
  ]
});
const v0 = `vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
`, b0 = `
Provides methods that converts colors to
HSV values and back. This makes it
easier to deal with hue saturation and
lightness levels.

Methods:
vec3 rgb2hsv(vec3 c);
vec3 hsv2rgb(vec3 c);
`;
me.register({
  moduleId: "hsv",
  description: b0,
  content: v0,
  compatibility: A.ALL
});
const w0 = `
This is an internal shader module that
helps establish the instancing system.
Not recommended for use unless you
really know how to utilize it properly.

Attributes:
float _active;
float instance;
`;
me.register({
  moduleId: "instancing",
  description: w0,
  content: "",
  compatibility: A.ALL,
  instanceAttributes: (i) => {
    const e = {
      name: "_active",
      size: S.ONE,
      update: (t) => [t.active ? 1 : 0]
    };
    return i.shaderIOInfo.activeAttribute = e, [e];
  },
  vertexAttributes: (i) => i.bufferType === ie.UNIFORM ? [
    // We add an inherent instance attribute to our vertices so they can determine the instancing
    // Data to retrieve.
    {
      name: "instance",
      size: ke.ONE,
      // We no op this as our geometry generating routine will establish the values needed here
      update: () => [0]
    }
  ] : []
});
const T0 = `\${import: PI, PI2, fsin, fcos, wrap}

/**
 * A circular arc interpolator
 */
vec2 arc(float t, vec2 center, float radius, float start, float end) {
  float angle = wrap((end - start) * t + start, 0.0, PI2);
  return center + vec2(fcos(angle), fsin(angle)) * radius;
}
`, y0 = `/**
 * Single control point bezier curve
 */
vec2 bezier1(float t, vec2 p1, vec2 p2, vec2 c1) {
  return (1.0 - t) * (1.0 - t) * p1 + 2.0 * t * (1.0 - t) * c1 + t * t * p2;
}
`, E0 = `/**
 * Two control point bezier curve
 */
vec2 bezier2(float t, vec2 p1, vec2 p2, vec2 c1, vec2 c2) {
  float t1 = 1.0 - t;
  return pow(t1, 3.0) * p1 + 3.0 * t * pow(t1, 2.0) * c1 + 3.0 * pow(t, 2.0) * t1 * c2 + pow(t, 3.0) * p2;
}`, R0 = `float PI = 3.14159265;
`, _0 = `float PI_2 = 1.5707963268;
`, A0 = `float PI_4 = 0.7853981634;
`, I0 = `// This is 1 / pi
float PI_INV = 0.3183098862;
`, M0 = `float PI2 = 6.2831853;
`, S0 = `// This is 1 / (pi * 2.0)
float PI2_INV = 0.1591549431;
`, C0 = `float toDegrees = 57.2957795131;
`, O0 = `float toRadians = 0.01745329252;
`, L0 = `\${import: PI, PI2, PI_2}

/**
 * This is an approximation of cos that allows us to bypass hardware precision
 * limitations for cos.
 *
 * http://lab.polygonal.de/2007/07/18/fast-and-accurate-sinecosine-approximation/
 * This is a GPU adaptation of this method to provide optimal GPU performance for the operation
 */
float fcos(float x) {
  float sine;
  // Cos is the same as sine but
  x += PI_2;

  // Always wrap input angle to -PI..PI
  x += mix(
    mix(
      0.0,
      -PI2, float(x > PI)
    ),
    PI2, float(x < -PI)
  );

  // Compute sine
  sine = 1.27323954 * x;
  sine += mix(-1.0, 1.0, float(x < 0.0)) * 0.405284735 * x * x;
  sine = 0.225 * (sine * (mix(1.0, -1.0, float(sine < 0.0)) * sine) - sine) + sine;

  return sine;
}
`, N0 = `float fmod(float x, float m, float m_inv) {
  return x - m * floor(x * m_inv);
}
`, P0 = `\${import: PI, PI2}

/**
 * This is an approximation of sin that allows us to bypass hardware precision
 * limitations for sin.
 *
 * http://lab.polygonal.de/2007/07/18/fast-and-accurate-sinecosine-approximation/
 * This is a GPU adaptation of this method to provide optimal GPU performance for the operation
 */
float fsin(float x) {
  float sine;

  // Always wrap input angle to -PI..PI
  x += mix(
    mix(
      0.0,
      -PI2, float(x > PI)
    ),
    PI2, float(x < -PI)
  );

  // Compute sine
  sine = 1.27323954 * x;
  sine += mix(-1.0, 1.0, float(x < 0.0)) * 0.405284735 * x * x;
  sine = 0.225 * (sine * (mix(1.0, -1.0, float(sine < 0.0)) * sine) - sine) + sine;

  return sine;
}
`, B0 = `float wrap(float value, float start, float end) {
  float width = end - start;
  float offsetValue = value - start;

  return (offsetValue - (floor(offsetValue / width) * width)) + start;
}
`, Xo = [
  {
    moduleId: "PI_INV",
    description: "Provides: float PI_INV = 1.0 / pi",
    content: I0,
    compatibility: A.ALL
  },
  {
    moduleId: "PI2_INV",
    description: `Provides:
float PI2_INV = 1.0 / (pi * 2.0)`,
    content: S0,
    compatibility: A.ALL
  },
  {
    moduleId: "PI_2",
    description: "Provides: float PI_2 = pi / 2.0",
    content: _0,
    compatibility: A.ALL
  },
  {
    moduleId: "PI_4",
    description: "Provides: float PI_4 = pi / 4.0",
    content: A0,
    compatibility: A.ALL
  },
  {
    moduleId: "PI",
    description: "Provides: float PI = pi",
    content: R0,
    compatibility: A.ALL
  },
  {
    moduleId: "PI2",
    description: "Provides: float PI2 = pi * 2.0",
    content: M0,
    compatibility: A.ALL
  },
  {
    moduleId: "toDegrees",
    description: `Provides: float toDegrees;
Can be used to convert radians to degrees:
radians * toDegrees`,
    content: C0,
    compatibility: A.ALL
  },
  {
    moduleId: "toRadians",
    description: `Provides: float toRadians;
Can be used to convert degrees to radians:
degress * toRadians`,
    content: O0,
    compatibility: A.ALL
  }
], D0 = `
Provides all the math constants you may
need as convenience. It's probably
better to include them individually, but
convenience sometimes beats practicality

Constants:
${Xo.map((i) => i.moduleId).join(`
`)}
`, U0 = {
  moduleId: "constants",
  description: D0,
  content: `\${import: ${Xo.map((i) => i.moduleId).join(", ")}}`,
  compatibility: A.ALL
}, k0 = [
  {
    moduleId: "bezier1",
    description: `Provides the 2D single control
point bezier method:
vec2 bezier1(float t, vec2 p1, vec2 p2, vec2 c1)`,
    content: y0,
    compatibility: A.ALL
  },
  {
    moduleId: "bezier2",
    description: `Provides the 2D single control
point bezier method:
vec2 bezier2(float t, vec2 p1, vec2 p2, vec2 c1, vec2 c2)`,
    content: E0,
    compatibility: A.ALL
  },
  {
    moduleId: "arc",
    description: `Provides the 2D
arc interpolation method:
vec2 arc(float t,
	vec2 center,
	float radius,
	float start,
	float end
)`,
    content: T0,
    compatibility: A.ALL
  },
  {
    moduleId: "fmod",
    description: `Provides the floating point
modulus method:
float fmod(float x, float m, float m_inv)`,
    content: N0,
    compatibility: A.ALL
  },
  {
    moduleId: "wrap",
    description: `Provides a method that wraps
value overflows:
float wrap(float value, float start, float end)`,
    content: B0,
    compatibility: A.ALL
  },
  {
    moduleId: "fcos",
    description: `Provides a fcos method that also
has a higher precision than
some hardware cos implementations:
float fcos(float x)`,
    content: L0,
    compatibility: A.ALL
  },
  {
    moduleId: "fsin",
    description: `Provides a fsin method that also
has a higher precision than
some hardware sin implementations:
float fsin(float x)`,
    content: P0,
    compatibility: A.ALL
  }
];
me.register([...k0, ...Xo, U0]);
const F0 = `mat4 rotationFromQuaternion(vec4 q) {
  float x2 = q.y + q.y;
  float y2 = q.z + q.z;
  float z2 = q.w + q.w;
  float xx = q.y * x2;
  float xy = q.y * y2;
  float xz = q.y * z2;
  float yy = q.z * y2;
  float yz = q.z * z2;
  float zz = q.w * z2;
  float wx = q.x * x2;
  float wy = q.x * y2;
  float wz = q.x * z2;

  return mat4(
    1.0 - (yy + zz), xy - wz, xz + wy, 0.0,
    xy + wz, 1.0 - (xx + zz), yz - wx, 0.0,
    xz - wy, yz + wx, 1.0 - (xx + yy), 0.0,
    0, 0, 0, 1
  );
}
`, z0 = `mat4 scale(vec3 s) {
  return mat4(
    s.x, 0, 0, 0,
    0, s.y, 0, 0,
    0, 0, s.z, 0,
    0, 0, 0, 1
  );
}
`, G0 = `\${import: translation, rotation, scale}

mat4 transform(vec3 s, vec4 r, vec3 t) {
  return translation(t) * rotationFromQuaternion(r) * scale(s);
}
`, V0 = `mat4 translation(vec3 t) {
  return mat4(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    t.x, t.y, t.z, 1
  );
}
`;
me.register([
  {
    moduleId: "translation",
    description: `Generates a translation matrix
from a vec3:
mat4 transform(vec3 s, vec4 r, vec3 t)`,
    compatibility: A.ALL,
    content: V0
  },
  {
    moduleId: "rotation",
    description: `Generates a rotation matrix
from a quaternion:
mat4 rotationFromQuaternion(vec4 q)`,
    compatibility: A.ALL,
    content: F0
  },
  {
    moduleId: "scale",
    description: `Generates a scale matrix
from a vec3:
mat4 scale(vec3 s)`,
    compatibility: A.ALL,
    content: z0
  },
  {
    moduleId: "transform",
    description: `Generates a full transform matrix
from a scale, quaternion, translation:
mat4 transform(vec3 s, vec4 r, vec3 t)`,
    compatibility: A.ALL,
    content: G0
  }
]);
const $0 = `//
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
//

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0f / 289.0f)) * 289.0f;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0f / 289.0f)) * 289.0f;
}

vec3 permute(vec3 x) {
  return mod289(((x * 34.0f) + 10.0f) * x);
}

float simplexNoise2D(vec2 v) {
  // (3.0-sqrt(3.0))/6.0
  const vec4 C = vec4(0.211324865405187f,
  // 0.5*(sqrt(3.0)-1.0)
  0.366025403784439f,
  // -1.0 + 2.0 * C.x
  -0.577350269189626f,
  // 1.0 / 41.0
  0.024390243902439f);
  // First corner
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);

  // Other corners
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0f, 0.0f) : vec2(0.0f, 1.0f);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

  // Permutations
  // Avoid truncation effects in permutation
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0f, i1.y, 1.0f)) + i.x + vec3(0.0f, i1.x, 1.0f));

  vec3 m = max(0.5f - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0f);
  // m ^ 4
  m = m * m;
  m = m * m;

  // Gradients: 41 points uniformly over a line, mapped onto a diamond.
  // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)
  vec3 x = 2.0f * fract(p * C.www) - 1.0f;
  vec3 h = abs(x) - 0.5f;
  vec3 ox = floor(x + 0.5f);
  vec3 a0 = x - ox;

  // Normalise gradients implicitly by scaling m
  // Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159f - 0.85373472095314f * (a0 * a0 + h * h);

  // Compute final noise value at P
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;

  return 130.0f * dot(m, g);
}
`, W0 = `//
// Description : Array and textureless GLSL 2D/3D/4D simplex
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20201014 (stegu)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
//
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0f / 289.0f)) * 289.0f;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0f / 289.0f)) * 289.0f;
}

vec4 permute(vec4 x) {
  return mod289(((x * 34.0f) + 10.0f) * x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159f - 0.85373472095314f * r;
}

float simplexNoise3D(vec3 v) {
  const vec2 C = vec2(1.0f / 6.0f, 1.0f / 3.0f);
  const vec4 D = vec4(0.0f, 0.5f, 1.0f, 2.0f);

  // First corner
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0f - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  // x0 = x0 - 0.0 + 0.0 * C.xxx;
  // x1 = x0 - i1  + 1.0 * C.xxx;
  // x2 = x0 - i2  + 2.0 * C.xxx;
  // x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  // 2.0*C.x = 1/3 = C.y
  vec3 x2 = x0 - i2 + C.yyy;
  // -1.0+3.0*C.x = -0.5 = -D.y
  vec3 x3 = x0 - D.yyy;

  // Permutations
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0f, i1.z, i2.z, 1.0f)) + i.y + vec4(0.0f, i1.y, i2.y, 1.0f)) + i.x + vec4(0.0f, i1.x, i2.x, 1.0f));

  // Gradients: 7x7 points over a square, mapped onto an octahedron.
  // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857f; // 1.0/7.0
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0f * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0f * x_);    // mod(j,N)

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0f - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0f + 1.0f;
  vec4 s1 = floor(b1) * 2.0f + 1.0f;
  vec4 sh = -step(h, vec4(0.0f));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  // Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m = max(0.5f - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0f);
  m = m * m;
  return 105.0f * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;
me.register({
  moduleId: "simplexNoise3D",
  content: W0,
  compatibility: A.ALL,
  description: "Provides the simplex noise function for 3D coordinates."
});
me.register({
  moduleId: "simplexNoise2D",
  content: $0,
  compatibility: A.ALL,
  description: "Provides the simplex noise function for 2D coordinates."
});
const j0 = `vec4 bitSh = vec4(16777216., 65536., 256., 1.);
vec4 bitMsk = vec4(0., vec3(1. / 256.0));
vec4 bitShifts = vec4(1.) / vec4(16777216., 65536., 256., 1.);

vec4 packFloat(float value, float range) {
  value = (value + range) / (range * 2.);
  vec4 comp = fract(value * bitSh);
  comp -= comp.xxyz * bitMsk;
  return comp;
}

float unpackFloat(vec4 color, float range) {
  return dot(color , bitShifts) * (range * 2.) - range;
}
`, H0 = `
This provides the ability to pack
a float value into a color RGBA
value. This is used to bypass the
lack of support for float textures.

Constants:
float currentTime;
float currentFrame;
`;
me.register({
  moduleId: "packFloat",
  description: H0,
  content: j0,
  compatibility: A.ALL
});
const X0 = `// This is the varying auto generated for the fragment shader that is needed in the vertex shader to pass the
// color for the instance through to the fragment shader
varying highp vec4 _picking_color_pass_;
`;
me.register([
  {
    moduleId: "picking",
    description: `Internal use only. Provides methods
and constants to make the picking processes work.`,
    content: X0,
    compatibility: A.VERTEX,
    instanceAttributes: (i) => [
      {
        name: "_pickingColor",
        size: S.FOUR,
        shaderInjection: A.VERTEX,
        update: (e) => {
          const t = 16777215 - e.uid;
          return [
            ((t & 16711680) >> 16) / 255,
            ((t & 65280) >> 8) / 255,
            (t & 255) / 255,
            1
          ];
        }
      }
    ]
  }
]);
const Q0 = `void main() {
  gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
}
`, Y0 = `void main() {
  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
}
`, pc = `
Makes a no-op shader where gl_Position
is [0, 0, 0, 0] and gl_FragColor is
[0, 0, 0, 0].

You can not import this if you specify
your own main() method.
`;
me.register([
  {
    moduleId: "no-op",
    description: pc,
    content: Y0,
    compatibility: A.VERTEX
  },
  {
    moduleId: "no-op",
    description: pc,
    content: Q0,
    compatibility: A.FRAGMENT
  }
]);
const q0 = `
Provides a constant that is populated
with a random value 0 - 1.
This value is static for each draw call,
but changes every draw call.

float random;
`;
me.register([
  {
    moduleId: "random",
    description: q0,
    content: "",
    compatibility: A.ALL,
    uniforms: (i) => [
      {
        name: "random",
        size: _.ONE,
        shaderInjection: A.ALL,
        update: () => Math.random()
      }
    ]
  }
]);
const K0 = `
This is a special helper module used by
the system to map View2D content into
a 3D world space. The system utilizes
this module automatically for you when
you utilize createLayer2Din3D.
`;
me.register([
  {
    moduleId: "world2DXY",
    description: K0,
    content: Eh,
    compatibility: A.ALL,
    uniforms: (i) => i instanceof Ne ? i.props.control2D ? [
      // This injects the projection matrix from the view camera
      {
        name: "projection",
        size: _.MATRIX4,
        update: () => i.view.props.camera.projection
      },
      // This injects the model view matrix from the view camera
      {
        name: "view",
        size: _.MATRIX4,
        update: () => i.view.props.camera.view
      },
      // This injects a 2D camera's offset
      {
        name: "cameraOffset",
        size: _.THREE,
        update: () => i.props.control2D instanceof Gi ? i.props.control2D.offset : [0, 0, 0]
      },
      // This injects the camera's current position
      {
        name: "cameraPosition",
        size: _.THREE,
        update: () => i.view.props.camera.position
      },
      // This injects the camera's current scale
      {
        name: "cameraScale",
        size: _.THREE,
        update: () => i.view.props.camera.scale
      },
      // This injects the camera's 2D current scale
      {
        name: "cameraScale2D",
        size: _.THREE,
        update: () => i.props.control2D instanceof Gi ? i.props.control2D.scale : [1, 1, 1]
      },
      // This injects the camera's Euler rotation
      {
        name: "cameraRotation",
        size: _.FOUR,
        update: () => i.view.props.camera.transform.rotation
      },
      // This injects the pixel width and height of the view
      {
        name: "viewSize",
        size: _.TWO,
        update: () => [
          i.view.viewBounds.width,
          i.view.viewBounds.height
        ]
      },
      // This injects the current layer's pixel ratio so pixel ratio dependent items can react to it
      // Things like gl_PointSize will need this metric if not working in clip space
      {
        name: "pixelRatio",
        size: _.ONE,
        update: () => [i.view.pixelRatio]
      }
    ] : (console.warn(
      "For a layer 2D to be compatible with a 3D View, the layer requires an additional prop of control2D"
    ), []) : (console.warn(
      "A shader requested the module world2DXZ; however, the layer the shader comes from is NOT a Layer2D which is",
      "required for the module to work."
    ), [])
  }
]);
const Z0 = `// These are projection methods utilizing the simpler camera 2d approach.
// This assumes we have a 3D camera projection which should be preferably orthographic layered with simpler 2D camera
// controls for manipulating the 2D world.
vec3 cameraSpace(vec3 world) {
  return (world + cameraOffset) * cameraScale2D;
}

vec3 cameraSpaceSize(vec3 worldSize) {
  return worldSize * cameraScale2D;
}

vec4 clipSpace(vec3 world) {
  return ((projection * view) * vec4(cameraSpace(world.xzy), 1.0));
}

vec4 clipSpaceSize(vec3 worldSize) {
  return ((projection * view) * vec4(cameraSpaceSize(worldSize.xzy), 0.0));
}
`, J0 = `
This is a special helper module used by
the system to map View2D content into
a 3D world space. The system utilizes
this module automatically for you when
you utilize createLayer2Din3D.
`;
me.register([
  {
    moduleId: "world2DXZ",
    description: J0,
    content: Z0,
    compatibility: A.ALL,
    uniforms: (i) => i instanceof Ne ? i.props.control2D ? [
      // This injects the projection matrix from the view camera
      {
        name: "projection",
        size: _.MATRIX4,
        update: () => i.view.props.camera.projection
      },
      // This injects the model view matrix from the view camera
      {
        name: "view",
        size: _.MATRIX4,
        update: () => i.view.props.camera.view
      },
      // This injects a 2D camera's offset
      {
        name: "cameraOffset",
        size: _.THREE,
        update: () => i.props.control2D instanceof Gi ? i.props.control2D.offset : [0, 0, 0]
      },
      // This injects the camera's current position
      {
        name: "cameraPosition",
        size: _.THREE,
        update: () => i.view.props.camera.position
      },
      // This injects the camera's current scale
      {
        name: "cameraScale",
        size: _.THREE,
        update: () => i.view.props.camera.scale
      },
      // This injects the camera's 2D current scale
      {
        name: "cameraScale2D",
        size: _.THREE,
        update: () => i.props.control2D instanceof Gi ? i.props.control2D.scale : [1, 1, 1]
      },
      // This injects the camera's Euler rotation
      {
        name: "cameraRotation",
        size: _.THREE,
        update: () => i.view.props.camera.scale
      },
      // This injects the pixel width and height of the view
      {
        name: "viewSize",
        size: _.TWO,
        update: () => [
          i.view.viewBounds.width,
          i.view.viewBounds.height
        ]
      },
      // This injects the current layer's pixel ratio so pixel ratio dependent items can react to it
      // Things like gl_PointSize will need this metric if not working in clip space
      {
        name: "pixelRatio",
        size: _.ONE,
        update: () => [i.view.pixelRatio]
      }
    ] : (console.warn(
      "For a layer 2D to be compatible with a 3D View, the layer requires an additional prop of control2D"
    ), []) : (console.warn(
      "A shader requesed the module world2DXZ; however, the layer the shader comes from is NOT a Layer2D which is",
      "required for the module to work."
    ), [])
  }
]);
const ex = `// These are projection methods utilizing the simpler camera 2d approach.
// This assumes we have a 3D camera projection which should be preferably orthographic layered with simpler 2D camera
// controls for manipulating the 2D world.
vec3 cameraSpace(vec3 world) {
  return (world + cameraOffset) * cameraScale2D;
}

vec3 cameraSpaceSize(vec3 worldSize) {
  return worldSize * cameraScale2D;
}

vec4 clipSpace(vec3 world) {
  return ((projection * view) * vec4(cameraSpace(world.zyx), 1.0));
}

vec4 clipSpaceSize(vec3 worldSize) {
  return ((projection * view) * vec4(cameraSpaceSize(worldSize.zyx), 0.0));
}
`, tx = `
This is a special helper module used by
the system to map View2D content into
a 3D world space. The system utilizes
this module automatically for you when
you utilize createLayer2Din3D.
`;
me.register([
  {
    moduleId: "world2DYZ",
    description: tx,
    content: ex,
    compatibility: A.ALL,
    uniforms: (i) => i instanceof Ne ? i.props.control2D ? [
      // This injects the projection matrix from the view camera
      {
        name: "projection",
        size: _.MATRIX4,
        update: () => i.view.props.camera.projection
      },
      // This injects the model view matrix from the view camera
      {
        name: "view",
        size: _.MATRIX4,
        update: () => i.view.props.camera.view
      },
      // This injects a 2D camera's offset
      {
        name: "cameraOffset",
        size: _.THREE,
        update: () => i.props.control2D instanceof Gi ? i.props.control2D.offset : [0, 0, 0]
      },
      // This injects the camera's current position
      {
        name: "cameraPosition",
        size: _.THREE,
        update: () => i.view.props.camera.position
      },
      // This injects the camera's current scale
      {
        name: "cameraScale",
        size: _.THREE,
        update: () => i.view.props.camera.scale
      },
      // This injects the camera's 2D current scale
      {
        name: "cameraScale2D",
        size: _.THREE,
        update: () => i.props.control2D instanceof Gi ? i.props.control2D.scale : [1, 1, 1]
      },
      // This injects the camera's Euler rotation
      {
        name: "cameraRotation",
        size: _.THREE,
        update: () => i.view.props.camera.scale
      },
      // This injects the pixel width and height of the view
      {
        name: "viewSize",
        size: _.TWO,
        update: () => [
          i.view.viewBounds.width,
          i.view.viewBounds.height
        ]
      },
      // This injects the current layer's pixel ratio so pixel ratio dependent items can react to it
      // Things like gl_PointSize will need this metric if not working in clip space
      {
        name: "pixelRatio",
        size: _.ONE,
        update: () => [i.view.pixelRatio]
      }
    ] : (console.warn(
      "For a layer 2D to be compatible with a 3D View, the layer requires an additional prop of control2D"
    ), []) : (console.warn(
      "A shader requesed the module world2DYZ; however, the layer the shader comes from is NOT a Layer2D which is",
      "required for the module to work."
    ), [])
  }
]);
class ix extends Bo {
  /**
   * Maps a coordinate relative to the screen to the pixel's location within the 3D world. Remember that a camera with
   * a view creates a frustum to work within the 3D world. This frustum has a near clipping plane and a far clipping
   * plane.
   *
   * This method provides a point located in front of the camera that would be located on a ray eminating from the
   * camera to the world. See screenRay
   *
   * For a perspective camera:
   * - To make a ray from this point simply:
   *
   * `const ray = rayFromPoints(camera.position, screenToWorld([x, y]))`
   *
   * For an orthographic camera:
   * - To make a ray from this point:
   *
   * `const ray = ray(screenToWorld([x, y]), camera.forward)`
   */
  screenToWorld(e, t) {
    return t = t || [0, 0, 0], this.viewToWorld(this.screenToView(e), t), t;
  }
  /**
   * Generates a ray from screen coordinates that emanates out into the 3D world
   * space.
   */
  screenRay(e) {
    if (this.camera.projectionType === Fi.ORTHOGRAPHIC) {
      const t = on(this.screenToWorld(e));
      return ql(t, this.camera.transform.forward);
    } else {
      const t = on(this.screenToWorld(e));
      return Kl(on(this.camera.transform.position), t);
    }
  }
  /**
   * Maps a coordinate found within the world to a relative coordinate within the screen space.
   */
  worldToScreen(e, t) {
    t = t || [0, 0];
    const n = lt(
      this.camera.projection,
      this.camera.view
    ), s = Vr(
      n,
      e,
      this.viewBounds.width,
      this.viewBounds.height
    );
    return ae(
      t,
      s[0] / this.pixelRatio,
      s[1] / this.pixelRatio
    );
  }
  /**
   * Maps a coordinate relative to the view to the pixel's location within the
   * 3D world. Remember that a camera with a view creates a frustum to work
   * within the 3D world. This frustum has a near clipping plane and a far
   * clipping plane.
   *
   * This method provides a point located in front of the camera that would be
   * located on a ray eminating from the camera to the world in such a way, that
   * the ray traveling to infinity would appear, from the screen's perspective,
   * to stay on the same pixel.
   *
   * See screenRay
   *
   * For a perspective camera:
   * - To make a ray from this point simply:
   *
   * `const ray = rayFromPoints(camera.position, screenToWorld([x, y]))`
   *
   * For an orthographic camera:
   * - To make a ray from this point:
   *
   * `const ray = ray(screenToWorld([x, y]), camera.forward)`
   */
  viewToWorld(e, t) {
    t = t || [0, 0, 0];
    const { width: n, height: s } = this.viewBounds, { projectionOptions: r } = this.camera, o = _e(e, this.pixelRatio), { tan: a } = Math;
    if (r.type === Fi.PERSPECTIVE) {
      const { fov: c, near: l } = r, h = s / n, u = a(c / 2) * l, d = (2 * ((o[0] + 0.5) / n) - 1) * u, f = (1 - 2 * ((o[1] + 0.5) / s)) * u * h, p = [d, f, -1], g = Qs(
        this.camera.transform.matrix,
        js(p, 1)
      );
      fe(t, g[0], g[1], g[2]);
    } else {
      const c = we(o, [n / 2, s / 2]), l = Qs(
        this.camera.transform.viewMatrix,
        js(c, -r.near)
      );
      fe(t, l[0], -l[1], l[2]);
    }
    return t;
  }
  /**
   * Maps a coordinate found within the world to a relative coordinate within
   * the view's viewport.
   */
  worldToView(e, t) {
    t = t || [0, 0];
    const n = lt(
      this.camera.projection,
      this.camera.view
    ), s = Vr(
      n,
      e,
      this.viewBounds.width,
      this.viewBounds.height
    );
    return ae(
      t,
      s[0] / this.pixelRatio,
      s[1] / this.pixelRatio
    );
  }
}
function nx(i) {
  return i.projectionType === Fi.ORTHOGRAPHIC;
}
const sa = class sa extends ns {
  constructor(e, t) {
    super(e, t), this.projection = new ix(), this.projection.camera = t.camera, this.projection.pixelRatio = this.pixelRatio;
  }
  /**
   * This operation makes sure we have the view camera adjusted to the new
   * viewport's needs.
   */
  fitViewtoViewport(e, t) {
    if (rh(this.props.camera)) {
      const n = t.width, s = t.height, r = this.props.camera, o = {
        near: r.projectionOptions.near,
        far: r.projectionOptions.far,
        width: n,
        height: s
      };
      this.props.preventCameraAdjustment || (r.projectionOptions = Object.assign(
        r.projectionOptions,
        o
      ), r.update()), this.projection.pixelRatio = this.pixelRatio, this.projection.viewBounds = t, this.projection.viewBounds.d = this, this.projection.screenBounds = new Z({
        height: this.projection.viewBounds.height / this.pixelRatio,
        width: this.projection.viewBounds.width / this.pixelRatio,
        x: this.projection.viewBounds.x / this.pixelRatio,
        y: this.projection.viewBounds.y / this.pixelRatio
      }), this.projection.screenBounds.d = this;
    } else if (nx(this.props.camera)) {
      const n = t.width, s = t.height, r = this.props.camera, o = {
        near: r.projectionOptions.near,
        far: r.projectionOptions.far,
        left: -n / 2,
        right: n / 2,
        top: s / 2,
        bottom: -s / 2
      };
      this.props.preventCameraAdjustment || (r.projectionOptions = Object.assign(
        r.projectionOptions,
        o
      ), r.update()), this.projection.pixelRatio = this.pixelRatio, this.projection.viewBounds = t, this.projection.viewBounds.d = this, this.projection.screenBounds = new Z({
        height: this.projection.viewBounds.height / this.pixelRatio,
        width: this.projection.viewBounds.width / this.pixelRatio,
        x: this.projection.viewBounds.x / this.pixelRatio,
        y: this.projection.viewBounds.y / this.pixelRatio
      }), this.projection.screenBounds.d = this;
    }
  }
  willUpdateProps(e) {
    this.projection.camera = e.camera;
  }
};
sa.defaultProps = {
  key: "",
  camera: new zi({
    type: Fi.PERSPECTIVE,
    width: 100,
    height: 100,
    fov: Math.PI / 2,
    far: 1e5,
    near: 1
  }),
  viewport: {
    left: 0,
    right: 0,
    bottom: 0,
    top: 0
  }
};
let gc = sa;
var sx = /* @__PURE__ */ ((i) => (i[i.XY = 0] = "XY", i[i.XZ = 1] = "XZ", i[i.YZ = 2] = "YZ", i))(sx || {});
function Tv(i, e, t) {
  if (!(e === Ne || e.prototype instanceof Ne))
    return console.warn(
      "A Layer type was specified for createLayer2din3D that is NOT a Layer2D type, which is invalid.",
      "The layer will be used without being modified."
    ), Dn(e, t);
  let s;
  switch (i) {
    case 0:
      s = "world2DXY";
      break;
    case 1:
      s = "world2DXZ";
      break;
    case 2:
      s = "world2DYZ";
      break;
    default:
      return Dn(e, t);
  }
  const r = Object.assign({}, t, {
    baseShaderModules: (o, a) => {
      let c = a.vs.indexOf("world2D");
      return c >= 0 && a.vs.splice(c, 1, s), c = a.fs.indexOf("world2D"), c >= 0 && a.fs.splice(c, 1, s), a;
    }
  });
  return Dn(e, r);
}
class rx extends Bt {
  /**
   * Ensure the shaders utilizing this framework has easy access to the
   * parentTransform property.
   */
  baseShaderModules(e) {
    const t = super.baseShaderModules(e);
    return t.vs.push("parent-transform"), t;
  }
}
const ox = `
When working with SceneGraphLayers, the
layer can have a transform applied to
the layer. This makes that transform
available in the parentTransform
constant.

mat4 parentTransform;
`;
me.register({
  moduleId: "parent-transform",
  description: ox,
  compatibility: A.VERTEX,
  content: "",
  uniforms: (i) => {
    const e = i;
    if (!(e instanceof rx))
      return console.warn(
        "A shader requested the module parent-transform; however, the layer the",
        "shader is generated from is NOT a SceneGraphLayer which is",
        "required for the module to work."
      ), [];
    const t = ne();
    return [
      {
        name: "parentTransform",
        size: _.MATRIX4,
        update: () => {
          var n;
          return ((n = e.props.parent) == null ? void 0 : n.matrix) || t;
        }
      }
    ];
  }
});
var ax = Object.defineProperty, ji = (i, e, t, n) => {
  for (var s = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = o(e, t, s) || s);
  return s && ax(e, t, s), s;
};
const _i = class lo extends nt {
  constructor(e) {
    super(e), this.needsLocalUpdate = !1, this.needsWorldUpdate = !1, Xe(this, lo);
    const t = e.transform || new Vo();
    this.transform = t, e.parent && (e.parent instanceof lo ? this.parent = e.parent : this.transform.parent = e.parent);
  }
  /**
   * This is the 3D transform that will place this object within the 3D world.
   */
  get transform() {
    return this._transform;
  }
  set transform(e) {
    this._transform || (this._position = e.position, this._rotation = e.rotation, this._scale = e.scale, this._localPosition = e.localPosition, this._localRotation = e.localRotation, this._localScale = e.localScale, this._matrix = e.matrix, this._localMatrix = e.localMatrix), e.instance = this, this._transform = e;
  }
  /**
   * Matrix representing the transform needed to put this instance into world
   * space. Should never edit this directly. Use the transform property or the
   * orientation properties to mutate this transform.
   */
  get matrix() {
    return this._transform.update(), this._matrix;
  }
  /**
   * Matrix used to represent the transform this object places on itself.
   * Anything using this matrix as it's basis
   */
  get localMatrix() {
    return this._transform.update(), this._localMatrix;
  }
  /** Local position of the Instance */
  get localPosition() {
    return this.needsLocalUpdate = !0, this._localPosition;
  }
  set localPosition(e) {
    this.transform.localPosition = e;
  }
  /** Local space rotation of the Instance */
  get localRotation() {
    return this.needsLocalUpdate = !0, this._localRotation;
  }
  set localRotation(e) {
    this.transform.localRotation = e;
  }
  /** Local axis scale of the instance */
  get localScale() {
    return this.needsLocalUpdate = !0, this._localScale;
  }
  set localScale(e) {
    this.transform.localScale = e;
  }
  /** World position of the Instance */
  get position() {
    return this.needsWorldUpdate = !0, this.transform.update(), this._position;
  }
  set position(e) {
    this.transform.position = e;
  }
  /** World space rotation of the Instance */
  get rotation() {
    return this.needsWorldUpdate = !0, this.transform.update(), this._rotation;
  }
  set rotation(e) {
    this.transform.rotation = e;
  }
  /** Axis scale of the instance */
  get scale() {
    return this.needsWorldUpdate = !0, this.transform.update(), this._scale;
  }
  set scale(e) {
    this.transform.scale = e;
  }
  /**
   * Quick way to work with parent transforms. This is just syntactic sugar so
   * you don't have to instance.transform.parent all the time.
   */
  set parent(e) {
    this.transform.parent = e.transform;
  }
  /**
   * This is an ambiguous but simple method that attempts to re-optimize this
   * instance. If you have maybe a one time analysis of an instance over the
   * course of a lengthy period of time, consider calling this.
   *
   * Instances and transforms take the approach of "shifting gears" toward world
   * decomposition after world orientations are queried. However, you may not
   * always need or rarely need a specific world orientation. Thus calling this
   * method will make the instance and transform assume it no longer needs world
   * orientations once again until something queries for it.
   */
  optimize() {
    this.needsWorldUpdate = !1, this.needsLocalUpdate = !1, this.transform.optimize();
  }
};
ji([
  I
], _i.prototype, "_matrix");
ji([
  I
], _i.prototype, "_localMatrix");
ji([
  I
], _i.prototype, "_localPosition");
ji([
  I
], _i.prototype, "_localRotation");
ji([
  I
], _i.prototype, "_localScale");
ji([
  I
], _i.prototype, "_position");
ji([
  I
], _i.prototype, "_rotation");
ji([
  I
], _i.prototype, "_scale");
let cx = _i;
class yv extends nh {
  constructor() {
    super(...arguments), this.isQueuedForUpdate = !1, this.needsWorldOrientation = !1, this.needsWorldDecomposition = !1, this._instance = null, this._matrix = { value: ne() }, this._localMatrix = { value: this._matrix.value }, this._position = { value: [0, 0, 0] }, this._localPosition = {
      value: this._position.value
    }, this._rotation = { value: Ks() }, this._localRotation = {
      value: 0
    }, this.localRotationMatrix = br(), this._scale = { value: [1, 1, 1] }, this._localScale = { value: this._scale.value };
  }
  set instance(e) {
    this._instance !== e && this._instance && (this._instance.transform.instance = null, e && (e.transform = this)), this._instance = e;
  }
  /**
   * This is the inner matrix that represents the culmination of all the
   * properties into a single transform matrix. It is invalid and will cause
   * undefined behavior if the elements of this matrix are modified. You should
   * use the provided methods of this Transform class to manipulate this matrix.
   *
   * This matrix is what is used to transform coordinates into world space, thus
   * it is also the culmination of all the parent's to this particular
   * transform.
   */
  get matrix() {
    return this.update(), this._matrix.value;
  }
  /**
   * Translation of this transform in world space.
   */
  get position() {
    return this.needsWorldOrientation = !0, this.update(), this._position.value;
  }
  set position(e) {
    this.parent ? console.warn(
      "NOT IMPLEMENTED: Setting world position is not supported yet. Use localPosition for now."
    ) : this.localPosition = e;
  }
  /**
   * The position on the x y axis
   */
  get localPosition() {
    return this._localPosition.value;
  }
  set localPosition(e) {
    this._localPosition.value[0] = e[0], this._localPosition.value[1] = e[1], this._localPosition.didUpdate = !0, this.invalidate();
  }
  /**
   * Orientation of this transform in world space. When no parent is present
   * rotation === localRotation.
   */
  get rotation() {
    return this.needsWorldOrientation = !0, this.update(), this._rotation.value;
  }
  set rotation(e) {
    console.warn(
      "NOT IMPLEMENTED: Setting world rotation for a 2D transform is not supported yet."
    );
  }
  /**
   * Orientation of this transform without it's parent's orientation. When no
   * parent is present rotation === localRotation.
   */
  get localRotation() {
    return this._localRotation.value;
  }
  set localRotation(e) {
    this._localRotation.value = e, this._localRotation.didUpdate = !0, this.invalidate();
  }
  /**
   * The scale of the Transform in world space. When there is no parent,
   * localScale === scale.
   */
  get scale() {
    return this.needsWorldOrientation = !0, this.update(), this._scale.value;
  }
  set scale(e) {
    this.parent ? console.warn(
      "NOT IMPLEMENTED: Setting world scale is not supported yet. Use localScale for now."
    ) : this.localScale = e;
  }
  /**
   * The scale this Transform applies ignoring the parent Transform. When there
   * is no parent, localScale === scale.
   */
  get localScale() {
    return this._localScale.value;
  }
  set localScale(e) {
    ae(this._localScale.value, e[0], e[1]), this._localScale.didUpdate = !0, this.invalidate();
  }
  /**
   * This method contains the math involved in decomposing our world SRT matrix
   * so we can view the Transform's orientation relative to world space.
   */
  decomposeWorldMatrix() {
    if (!this.parent || !this.needsWorldDecomposition || !this.needsWorldOrientation)
      return;
    this.needsWorldDecomposition = !1;
    const e = this._matrix.value, t = this._position.value, n = this._scale.value;
    this._position.didUpdate = t[0] !== e[12] || t[1] !== e[13] || t[2] !== e[14], this._position.didUpdate && fe(t, e[12], e[13], e[14]);
    const s = Ni(e[0], e[1], e[2], e[3]), r = Ni(e[4], e[5], e[6], e[7]), o = Ni(e[8], e[9], e[10], e[11]);
    this._scale.didUpdate = n[0] !== s || n[1] !== r || n[2] !== o, fe(n, s, r, o), this._scale.didUpdate = !0;
    const [a, c, l, h] = this._rotation.value;
    Go(this._matrix.value, s, r, o, this._rotation.value);
    const u = this._rotation.value;
    this._rotation.didUpdate = u[0] !== a || u[1] !== c || u[2] !== l || u[3] !== h;
  }
  /**
   * Ensures this transform WILL receive an update if it fits requirements for
   * potentially missing an update that may be needed by passive elements.
   */
  queueForUpdate() {
    !this.isQueuedForUpdate && this._instance && this._instance.active && (this.isQueuedForUpdate = !0, eh(this));
  }
  /**
   * If needed, this updates the matrix for this transform. This is called
   * automatically when the matrix is retrieved.
   *
   * The unsafe flag causes this node to update without ensuring it's parents
   * are out of date. Recommended to not use this flag ever. The system handles
   * all of that for you.
   */
  update(e) {
    let t = !1;
    if (this.isQueuedForUpdate && (th(this), this.isQueuedForUpdate = !1), this.needsUpdate) {
      const n = this.localRotationMatrix;
      this._localRotation.didUpdate && Bl(this._localRotation.value, n), $l(
        this._localScale.value,
        n,
        this._localPosition.value,
        this._localMatrix.value
      ), this._localMatrix.didUpdate = !0, t = !0;
    }
    this.parent && (this.parent.needsUpdate ? (e || this.processParentUpdates((n) => {
      n.update(!0);
    }), t = !0) : this.parent.childUpdate.has(this) && (t = !0), t && (lt(
      this.parent._matrix.value,
      this._localMatrix.value,
      this._matrix.value
    ), this._matrix.didUpdate = !0, this.needsWorldDecomposition = !0)), this.decomposeWorldMatrix(), this._instance && this._instance.active && (this._localRotation.didUpdate && (this._instance._localRotation = this._localRotation.value), this._localPosition.didUpdate && (this._instance._localPosition = this._localPosition.value), this._localScale.didUpdate && (this._instance._localScale = this._localScale.value), this.parent ? (this._rotation.didUpdate && (this._instance._rotation = this._rotation.value), this._scale.didUpdate && (this._instance._scale = this._scale.value), this._position.didUpdate && (this._instance._position = this._position.value)) : (this._localRotation.didUpdate && (this._instance._rotation = this._localRotation.value), this._localPosition.didUpdate && (this._instance._position = this._localPosition.value), this._localScale.didUpdate && (this._instance._scale = this._localScale.value)), (this._matrix.didUpdate || this._localMatrix.didUpdate) && (this._instance.transform = this)), this._localScale.didUpdate = !1, this._localRotation.didUpdate = !1, this._localPosition.didUpdate = !1, this._rotation.didUpdate = !1, this._scale.didUpdate = !1, this._position.didUpdate = !1, this._matrix.didUpdate = !1, this._localMatrix.didUpdate = !1, this.resolve();
  }
}
const lx = `varying vec2 _texCoord;

void main() {
  gl_FragColor = mix(
    vec4(1.0, 0.0, 0.0, 1.0),
    vec4(0.0, 0.0, 0.0, 1.0),
    float(_texCoord.x <= 0.01 || _texCoord.x > 0.99 || _texCoord.y < 0.01 || _texCoord.y > 0.99)
  );
}
`, hx = `\${import: projection}

varying vec2 _texCoord;

void main() {
  vec4 pos = vec4(position * size, 1.0);
  vec4 world = transform * pos;
  _texCoord = texCoord;

  gl_Position = clipSpace(world.xyz);
}
`, ra = class ra extends Bt {
  initShader() {
    const e = [1, 1, 1], t = [1, 1, -1], n = [1, -1, -1], s = [1, -1, 1], r = [-1, 1, 1], o = [-1, 1, -1], a = [-1, -1, -1], c = [-1, -1, 1], l = [
      // right
      e,
      t,
      n,
      e,
      n,
      s,
      // front
      r,
      e,
      s,
      r,
      s,
      c,
      // left
      r,
      a,
      o,
      r,
      c,
      a,
      // back
      o,
      n,
      t,
      o,
      a,
      n,
      // up
      r,
      t,
      e,
      r,
      o,
      t,
      // down
      c,
      s,
      n,
      c,
      n,
      a
    ], h = [1, 0, 0], u = [0, 0, 1], d = [-1, 0, 0], f = [0, 0, -1], p = [0, 1, 0], g = [0, -1, 0], m = [
      h,
      h,
      h,
      h,
      h,
      h,
      u,
      u,
      u,
      u,
      u,
      u,
      d,
      d,
      d,
      d,
      d,
      d,
      f,
      f,
      f,
      f,
      f,
      f,
      p,
      p,
      p,
      p,
      p,
      p,
      g,
      g,
      g,
      g,
      g,
      g
    ], v = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 0],
      [1, 1],
      [0, 1],
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 0],
      [1, 1],
      [0, 1],
      [0, 0],
      [1, 1],
      [1, 0],
      [0, 0],
      [0, 1],
      [1, 1],
      [0, 0],
      [1, 1],
      [1, 0],
      [0, 0],
      [0, 1],
      [1, 1],
      [0, 0],
      [1, 1],
      [1, 0],
      [0, 0],
      [0, 1],
      [1, 1],
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 0],
      [1, 1],
      [0, 1]
    ];
    return {
      drawMode: x.Model.DrawMode.TRIANGLES,
      fs: [
        {
          outputType: V.COLOR,
          source: lx
        }
      ],
      instanceAttributes: [
        {
          name: "transform",
          size: S.MAT4X4,
          update: (b) => (b.transform || ip).matrix
        },
        {
          name: "size",
          size: S.THREE,
          update: (b) => b.size
        }
      ],
      uniforms: [],
      vertexAttributes: [
        {
          name: "position",
          size: ke.THREE,
          update: (b) => l[b]
        },
        {
          name: "normal",
          size: ke.THREE,
          update: (b) => m[b]
        },
        {
          name: "texCoord",
          size: ke.TWO,
          update: (b) => v[b]
        }
      ],
      vertexCount: 36,
      vs: hx
    };
  }
  getMaterialOptions() {
    return Object.assign({}, it.transparentShapeBlending, {
      cullSide: x.Material.CullSide.CCW
    });
  }
};
ra.defaultProps = {
  data: new oe(),
  key: "",
  materialOptions: it.transparentShapeBlending
};
let mc = ra;
var ux = Object.defineProperty, Bh = (i, e, t, n) => {
  for (var s = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = o(e, t, s) || s);
  return s && ux(e, t, s), s;
};
const Qo = class Dh extends cx {
  constructor(e) {
    super(e), this.size = [1, 1, 1], this.color = [1, 1, 1, 1], Xe(this, Dh), this.size = e.size || this.size, this.color = e.color || this.color;
  }
};
Bh([
  I
], Qo.prototype, "size");
Bh([
  I
], Qo.prototype, "color");
let Ev = Qo;
var Ss = { exports: {} }, Xn = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var xc;
function dx() {
  if (xc) return Xn;
  xc = 1;
  var i = Symbol.for("react.transitional.element"), e = Symbol.for("react.fragment");
  function t(n, s, r) {
    var o = null;
    if (r !== void 0 && (o = "" + r), s.key !== void 0 && (o = "" + s.key), "key" in s) {
      r = {};
      for (var a in s)
        a !== "key" && (r[a] = s[a]);
    } else r = s;
    return s = r.ref, {
      $$typeof: i,
      type: n,
      key: o,
      ref: s !== void 0 ? s : null,
      props: r
    };
  }
  return Xn.Fragment = e, Xn.jsx = t, Xn.jsxs = t, Xn;
}
var Qn = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var vc;
function fx() {
  return vc || (vc = 1, process.env.NODE_ENV !== "production" && function() {
    function i(T) {
      if (T == null) return null;
      if (typeof T == "function")
        return T.$$typeof === z ? null : T.displayName || T.name || null;
      if (typeof T == "string") return T;
      switch (T) {
        case g:
          return "Fragment";
        case v:
          return "Profiler";
        case m:
          return "StrictMode";
        case E:
          return "Suspense";
        case C:
          return "SuspenseList";
        case G:
          return "Activity";
      }
      if (typeof T == "object")
        switch (typeof T.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), T.$$typeof) {
          case p:
            return "Portal";
          case w:
            return (T.displayName || "Context") + ".Provider";
          case b:
            return (T._context.displayName || "Context") + ".Consumer";
          case y:
            var k = T.render;
            return T = T.displayName, T || (T = k.displayName || k.name || "", T = T !== "" ? "ForwardRef(" + T + ")" : "ForwardRef"), T;
          case M:
            return k = T.displayName || null, k !== null ? k : i(T.type) || "Memo";
          case R:
            k = T._payload, T = T._init;
            try {
              return i(T(k));
            } catch {
            }
        }
      return null;
    }
    function e(T) {
      return "" + T;
    }
    function t(T) {
      try {
        e(T);
        var k = !1;
      } catch {
        k = !0;
      }
      if (k) {
        k = console;
        var q = k.error, le = typeof Symbol == "function" && Symbol.toStringTag && T[Symbol.toStringTag] || T.constructor.name || "Object";
        return q.call(
          k,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          le
        ), e(T);
      }
    }
    function n(T) {
      if (T === g) return "<>";
      if (typeof T == "object" && T !== null && T.$$typeof === R)
        return "<...>";
      try {
        var k = i(T);
        return k ? "<" + k + ">" : "<...>";
      } catch {
        return "<...>";
      }
    }
    function s() {
      var T = N.A;
      return T === null ? null : T.getOwner();
    }
    function r() {
      return Error("react-stack-top-frame");
    }
    function o(T) {
      if (B.call(T, "key")) {
        var k = Object.getOwnPropertyDescriptor(T, "key").get;
        if (k && k.isReactWarning) return !1;
      }
      return T.key !== void 0;
    }
    function a(T, k) {
      function q() {
        K || (K = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          k
        ));
      }
      q.isReactWarning = !0, Object.defineProperty(T, "key", {
        get: q,
        configurable: !0
      });
    }
    function c() {
      var T = i(this.type);
      return Q[T] || (Q[T] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), T = this.props.ref, T !== void 0 ? T : null;
    }
    function l(T, k, q, le, Pe, Ee, Vt, fn) {
      return q = Ee.ref, T = {
        $$typeof: f,
        type: T,
        key: k,
        props: Ee,
        _owner: Pe
      }, (q !== void 0 ? q : null) !== null ? Object.defineProperty(T, "ref", {
        enumerable: !1,
        get: c
      }) : Object.defineProperty(T, "ref", { enumerable: !1, value: null }), T._store = {}, Object.defineProperty(T._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: 0
      }), Object.defineProperty(T, "_debugInfo", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: null
      }), Object.defineProperty(T, "_debugStack", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: Vt
      }), Object.defineProperty(T, "_debugTask", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: fn
      }), Object.freeze && (Object.freeze(T.props), Object.freeze(T)), T;
    }
    function h(T, k, q, le, Pe, Ee, Vt, fn) {
      var Re = k.children;
      if (Re !== void 0)
        if (le)
          if (W(Re)) {
            for (le = 0; le < Re.length; le++)
              u(Re[le]);
            Object.freeze && Object.freeze(Re);
          } else
            console.error(
              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
            );
        else u(Re);
      if (B.call(k, "key")) {
        Re = i(T);
        var pn = Object.keys(k).filter(function(Gh) {
          return Gh !== "key";
        });
        le = 0 < pn.length ? "{key: someKey, " + pn.join(": ..., ") + ": ...}" : "{key: someKey}", be[Re + le] || (pn = 0 < pn.length ? "{" + pn.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          le,
          Re,
          pn,
          Re
        ), be[Re + le] = !0);
      }
      if (Re = null, q !== void 0 && (t(q), Re = "" + q), o(k) && (t(k.key), Re = "" + k.key), "key" in k) {
        q = {};
        for (var Rr in k)
          Rr !== "key" && (q[Rr] = k[Rr]);
      } else q = k;
      return Re && a(
        q,
        typeof T == "function" ? T.displayName || T.name || "Unknown" : T
      ), l(
        T,
        Re,
        Ee,
        Pe,
        s(),
        q,
        Vt,
        fn
      );
    }
    function u(T) {
      typeof T == "object" && T !== null && T.$$typeof === f && T._store && (T._store.validated = 1);
    }
    var d = J, f = Symbol.for("react.transitional.element"), p = Symbol.for("react.portal"), g = Symbol.for("react.fragment"), m = Symbol.for("react.strict_mode"), v = Symbol.for("react.profiler"), b = Symbol.for("react.consumer"), w = Symbol.for("react.context"), y = Symbol.for("react.forward_ref"), E = Symbol.for("react.suspense"), C = Symbol.for("react.suspense_list"), M = Symbol.for("react.memo"), R = Symbol.for("react.lazy"), G = Symbol.for("react.activity"), z = Symbol.for("react.client.reference"), N = d.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, B = Object.prototype.hasOwnProperty, W = Array.isArray, $ = console.createTask ? console.createTask : function() {
      return null;
    };
    d = {
      "react-stack-bottom-frame": function(T) {
        return T();
      }
    };
    var K, Q = {}, Y = d["react-stack-bottom-frame"].bind(
      d,
      r
    )(), j = $(n(r)), be = {};
    Qn.Fragment = g, Qn.jsx = function(T, k, q, le, Pe) {
      var Ee = 1e4 > N.recentlyCreatedOwnerStacks++;
      return h(
        T,
        k,
        q,
        !1,
        le,
        Pe,
        Ee ? Error("react-stack-top-frame") : Y,
        Ee ? $(n(T)) : j
      );
    }, Qn.jsxs = function(T, k, q, le, Pe) {
      var Ee = 1e4 > N.recentlyCreatedOwnerStacks++;
      return h(
        T,
        k,
        q,
        !0,
        le,
        Pe,
        Ee ? Error("react-stack-top-frame") : Y,
        Ee ? $(n(T)) : j
      );
    };
  }()), Qn;
}
var bc;
function px() {
  return bc || (bc = 1, process.env.NODE_ENV === "production" ? Ss.exports = dx() : Ss.exports = fx()), Ss.exports;
}
var Ae = px();
const wc = () => {
};
class gx {
  constructor(e) {
    this.resolver = wc, this.rejector = wc, this.promise = new Promise(
      (t, n) => (this.resolver = t, this.rejector = n)
    );
  }
  resolve(e) {
    this.resolver(e);
  }
  reject(e) {
    this.rejector(e);
  }
  /**
   * This causes this resolver to steal the child resolver's resolve method and
   * force the child to wait for this resolver to complete. This is similar to a
   * cancellation pattern EXCEPT it instead continues execution for all
   * processes waiting for a common task resolution.
   */
  hijack(e) {
    this.children = this.children || [], this.children.push(e), this.childResolvers = this.childResolvers || /* @__PURE__ */ new Map(), this.childResolvers.set(e, e.resolver), e.resolver = async (t) => {
      this.childResolutions = this.childResolutions || /* @__PURE__ */ new Map(), this.childResolutions.set(e, t);
    };
  }
}
function mx(i) {
  return i && i.charCodeAt !== void 0;
}
function xx(i) {
  return i != null;
}
function zt(i, e) {
  var a, c;
  const [t, n] = ca(!0), [s, r] = ca(!1), o = {
    store: i,
    shouldMount: t
  };
  if (!s && xx(i.willMount) && (o.shouldMount = !!((a = i.willMount) != null && a.call(i))), s) {
    const l = (c = i.willUpdate) == null ? void 0 : c.call(i);
    l && (async () => await l())();
  }
  return la(() => {
    const l = new gx();
    r(!0), n(o.shouldMount);
    let h;
    return (async () => {
      var u;
      h = await ((u = i.didMount) == null ? void 0 : u.call(i)), l.resolve(!0);
    })(), () => {
      (async () => (await l.promise, h == null || h()))();
    };
  }, []), la(
    () => {
      var l;
      s && (o.shouldMount = !!((l = i.willMount) != null && l.call(i)));
    },
    [0]
  ), o;
}
function vx(i) {
  const { children: e, tagName: t, ...n } = i, s = Object.keys(n).reduce(
    (r, o) => {
      try {
        Li(o) && (r[o.toLowerCase()] = JSON.stringify(n[o]));
      } catch {
      }
      return r;
    },
    {}
  );
  return { tagName: t, attributes: s, children: e };
}
const Gt = (i) => {
  const {
    tagName: e = "",
    attributes: t,
    children: n
  } = vx(i), { writeToDom: s } = J.useContext(us) || {};
  return s ? J.createElement(e, t, n) : i.children;
};
var Le = /* @__PURE__ */ ((i) => (i[i.EVENT_MANAGER = 1] = "EVENT_MANAGER", i[i.LAYER = 2] = "LAYER", i[i.CAMERA = 3] = "CAMERA", i[i.PROVIDER = 4] = "PROVIDER", i[i.RESOURCE = 5] = "RESOURCE", i[i.VIEW = 6] = "VIEW", i[i.SCENE = 7] = "SCENE", i))(Le || {});
function Uh(i, e, t) {
  var r, o, a;
  const n = /* @__PURE__ */ new Map(), s = [];
  for (J.Children.forEach(i, (c, l) => {
    s.push(c);
  }), s.reverse(); s.length > 0; ) {
    const c = s.pop();
    if (!J.isValidElement(c)) continue;
    const l = (r = c.type) == null ? void 0 : r.surfaceJSXType;
    if (c !== void 0 && ((c == null ? void 0 : c.type) === J.Fragment || l === void 0)) {
      if (!((o = c == null ? void 0 : c.props) != null && o.children)) {
        t && t.push(c);
        continue;
      }
      const h = [];
      J.Children.forEach(
        ((a = c == null ? void 0 : c.props) == null ? void 0 : a.children) || [],
        (u) => {
          h.push(u);
        }
      );
      for (let u = h.length - 1; u >= 0; --u)
        s.push(h[u]);
      continue;
    } else if (c !== void 0) {
      if (l === void 0) {
        t && t.push(c);
        continue;
      }
      {
        let h = n.get(l);
        h || (h = [], n.set(l, h)), h.push(c);
      }
    }
  }
  return n;
}
function Ki(i, e, t, n = { current: 0 }, s = "") {
  const r = e.get(t), o = /* @__PURE__ */ new Set(), a = J.useRef([]), c = /* @__PURE__ */ new Set();
  a.current = [], s = s ? `${s}.` : "";
  let l = [];
  return r && (l = J.Children.map(r, (h) => {
    if (J.isValidElement(h)) {
      const u = h.key || n.current++, d = `${s}${h.props.name || `${u}`}`, f = i.get(d) || new He();
      i.set(d, f), a.current.push(f), h.props.share && (h.props.share.current = f);
      const p = {
        key: u,
        name: d,
        resolver: f
      };
      return o.has(p.name) ? c.add(p.name) : o.add(p.name), J.cloneElement(h, p);
    }
  })), [
    l,
    Promise.all(a.current.map((h) => h == null ? void 0 : h.promise)),
    { resolvers: a, nameConflict: c }
  ];
}
function kh(...i) {
  return i.filter(se).reduce((e, t) => e.concat(t), []);
}
const us = J.createContext(void 0), Rv = (i) => {
  const e = J.useRef(null), t = J.useRef(null), n = J.useRef(0), s = J.useRef(null), r = J.useRef(null), o = J.useRef(-1), a = J.useRef(
    /* @__PURE__ */ new Map()
  ), c = J.useRef(
    /* @__PURE__ */ new Map()
  ), l = J.useRef(
    /* @__PURE__ */ new Map()
  ), h = J.useRef(
    /* @__PURE__ */ new Map()
  ), u = J.useRef(
    /* @__PURE__ */ new Map()
  ), d = J.useRef(new He()), f = { current: 0 }, p = [], g = Uh(i.children, void 0, p);
  p.length && console.warn("Surface found unsupported children", p);
  const [m, v] = Ki(
    a.current,
    g,
    Le.EVENT_MANAGER,
    f
  ), [b, w] = Ki(
    c.current,
    g,
    Le.RESOURCE,
    f
  ), [y, E, { nameConflict: C }] = Ki(
    u.current,
    g,
    Le.SCENE,
    f
  ), [M, R, { nameConflict: G }] = Ki(
    h.current,
    g,
    Le.LAYER,
    f
  ), [z, N, { nameConflict: B }] = Ki(
    l.current,
    g,
    Le.VIEW,
    f
  );
  if (C.size > 0) {
    console.warn("Root Scene name conflict:", C);
    return;
  }
  if (G.size > 0) {
    console.warn("Root Scene Layer name conflict:", G);
    return;
  }
  if (B.size > 0) {
    console.warn("Root Scene View name conflict:", B);
    return;
  }
  const W = async (Q) => {
    s.current && (n.current = Q, s.current.draw(Q), i.renderFrameCount && s.current.frameMetrics.currentFrame >= i.renderFrameCount && Ca(r.current));
  }, $ = (Q) => {
    var Y, j, be, T, k;
    (Y = t.current) == null || Y.remove(), (T = s.current) == null || T.resize(
      ((j = e.current) == null ? void 0 : j.offsetWidth) || 0,
      ((be = e.current) == null ? void 0 : be.offsetHeight) || 0
    ), t.current && ((k = e.current) == null || k.appendChild(t.current));
  }, K = () => {
    window.clearTimeout(o.current), o.current = window.setTimeout(() => {
      $();
    });
  };
  return zt({
    async didMount() {
      var fn;
      if (!t.current || !e.current) return;
      const [
        Q,
        Y,
        j,
        be,
        T
      ] = await Promise.all([
        v,
        w,
        E,
        R,
        N
      ]), k = j.filter(se), q = Q.filter(se), le = Y.filter(se), Pe = be.filter(se), Ee = T.filter(se);
      if (j.length <= 0 && (!(Pe != null && Pe.length) || !(Ee != null && Ee.length))) {
        console.error(
          "No scenes or root level Layers+Views provided to surface"
        );
        return;
      }
      Ee.length && Pe.length && k.unshift({
        key: "root",
        layers: Pe,
        views: Ee
      });
      const Vt = await new cm({
        context: t.current,
        handlesWheelEvents: i.handlesWheelEvents !== void 0 ? i.handlesWheelEvents : !0,
        pixelRatio: i.pixelRatio || window.devicePixelRatio,
        eventManagers: q,
        ioExpansion: i.ioExpansion,
        shaderTransforms: i.shaderTransforms,
        resourceManagers: i.resourceManagers,
        optimizedOutputTargets: i.optimizedOutputTargets,
        rendererOptions: Object.assign(
          // Default render options
          {
            alpha: !0,
            antialias: !1
          },
          // Implementation specified render options
          i.options
        )
      }).ready;
      return r.current = Jl(W), Vt.pipeline({
        resources: le,
        scenes: k
      }), s.current = Vt, await ki(), $(), (fn = i.ready) == null || fn.resolve(s.current), window.addEventListener("resize", K), () => {
        var Re;
        window.removeEventListener("resize", K), Ca(r.current), (Re = s.current) == null || Re.destroy();
      };
    }
  }), /* @__PURE__ */ Ae.jsx(
    "div",
    {
      ref: e,
      "data-deltav-version": "4.4.6",
      className: `SurfaceJSX ${i.className || ""}`,
      ...i.containerProps,
      children: /* @__PURE__ */ Ae.jsx("canvas", { ref: t, children: /* @__PURE__ */ Ae.jsx(
        us.Provider,
        {
          value: {
            writeToDom: i.writeToDom,
            eventResolvers: a.current,
            resourceResolvers: c.current,
            viewResolvers: l.current,
            layerResolvers: h.current,
            sceneResolvers: u.current,
            resolversReady: d.current
          },
          children: /* @__PURE__ */ Ae.jsx(Gt, { tagName: "Surface", ...i, children: kh(m, b, z, M, y) })
        }
      ) })
    }
  );
}, bx = (i) => (zt({
  didMount() {
    var e;
    (e = i.resolver) == null || e.resolve(
      new yh(i.handlers, i.preserveEvents)
    );
  }
}), /* @__PURE__ */ Ae.jsx(Gt, { tagName: "QueuedEventHandler", ...i }));
bx.surfaceJSXType = Le.EVENT_MANAGER;
const wx = (i) => (zt({
  didMount() {
    var e;
    (e = i.resolver) == null || e.resolve(new po(i.handlers));
  }
}), /* @__PURE__ */ Ae.jsx(Gt, { tagName: "SimpleEventHandler", ...i }));
wx.surfaceJSXType = Le.EVENT_MANAGER;
const Tx = (i) => (zt({
  didMount() {
    var e;
    (e = i.resolver) == null || e.resolve(new um(i.config));
  }
}), /* @__PURE__ */ Ae.jsx(Gt, { tagName: "BasicCamera2DController", ...i }));
Tx.surfaceJSXType = Le.EVENT_MANAGER;
const yx = (i) => (zt({
  didMount() {
    var e;
    (e = i.resolver) == null || e.resolve(
      Nl({
        key: i.name,
        height: i.height,
        width: i.width,
        textureSettings: i.textureSettings
      })
    );
  }
}), /* @__PURE__ */ Ae.jsx(Gt, { tagName: "Texture", ...i }));
yx.surfaceJSXType = Le.RESOURCE;
const Ex = (i) => (zt({
  didMount() {
    var e;
    (e = i.resolver) == null || e.resolve(
      mh({
        key: i.name,
        fontSource: i.fontSource,
        characterFilter: i.characterFilter,
        dynamic: i.dynamic,
        fontMap: i.fontMap,
        fontMapSize: i.fontMapSize
      })
    );
  }
}), /* @__PURE__ */ Ae.jsx(Gt, { tagName: "Font", ...i }));
Ex.surfaceJSXType = Le.RESOURCE;
const Rx = (i) => (zt({
  didMount() {
    var e;
    (e = i.resolver) == null || e.resolve(
      xh({
        key: i.name,
        height: i.height,
        width: i.width,
        textureSettings: i.textureSettings
      })
    );
  }
}), /* @__PURE__ */ Ae.jsx(Gt, { tagName: "Texture", ...i }));
Rx.surfaceJSXType = Le.RESOURCE;
const Yo = (i) => {
  const e = J.useContext(us);
  return zt({
    async didMount() {
      var o, a;
      let t = i.config;
      const n = i.uses;
      if (n) {
        await (e == null ? void 0 : e.resolversReady);
        const c = {}, l = n.names.map(async (h) => {
          var f, p;
          const u = (f = e == null ? void 0 : e.resourceResolvers) == null ? void 0 : f.get(h);
          if (!u)
            return console.error(
              `A layer requested a resource: ${h} but the name identifier was not found in the available resources`
            ), console.warn(
              "Available resources:",
              Array.from(((p = e == null ? void 0 : e.resourceResolvers) == null ? void 0 : p.keys()) || [])
            ), null;
          const d = await u.promise;
          if (!d)
            return console.error(
              `The Layer requested a resource "${h}", but the resource did not resolve a value`
            ), null;
          if (!Nn(d))
            return console.error(
              `The Layer requested a resource "${h}", but the resource resolved to a value that is not a render texture resource`
            ), null;
          c[h] = d;
        }).filter(se);
        await Promise.all(l), t = n.apply(c, { ...i.config });
      }
      const s = Dn(i.type, {
        key: i.name,
        ...t
      });
      let r = ((o = i.providerRef) == null ? void 0 : o.current) || s.init[1].data;
      r === s.init[0].defaultProps.data && (r = new oe()), s.init[1].data = r, i.providerRef && r instanceof oe && (i.providerRef.current = r), (a = i.resolver) == null || a.resolve(s);
    }
  }), /* @__PURE__ */ Ae.jsx(Gt, { tagName: "Layer", ...i });
};
Yo.surfaceJSXType = Le.LAYER;
function Tc(i, e, t) {
  var s, r;
  const n = (s = e == null ? void 0 : e.resourceResolvers) == null ? void 0 : s.get(t);
  return n || (console.error(
    `A View "${i}" requested a resource: ${t} but the name identifier was not found in the available resources`
  ), console.warn(
    "Available resources:",
    Array.from(((r = e == null ? void 0 : e.resourceResolvers) == null ? void 0 : r.keys()) || [])
  ), null);
}
async function _x(i, e, t) {
  const n = i.buffers, s = Object.entries(n).map(([c, l]) => {
    const h = Tc(
      e.name,
      t,
      l || ""
    );
    return h ? [Number.parseInt(c), h, l] : (console.warn("View props", e), null);
  }).filter(se), r = {};
  await Promise.all(
    s.map(async (c) => {
      const l = await c[1].promise;
      Nn(l) || Hs(l) ? r[c[0]] = l : (console.error(
        `A View "${e.name}" requested an output buffer for the resource with name: ${c[2]} but the resource indicated is not a valid output target type.`,
        "Ensure the resource is a RenderTextureResource or ColorBufferResource"
      ), console.warn("View props", e));
    })
  );
  let o = !0;
  const a = i.depth;
  if (mx(a)) {
    const c = Tc(
      e.name,
      t,
      a
    );
    if (!c)
      console.warn("View props", e), o = !1;
    else {
      const l = await c.promise;
      Nn(l) || Hs(l) ? o = l : (console.error(
        `A View "${e.name}" requested a depth buffer for the resource with name: ${a} but the resource indicated is not a valid output target type.`,
        "Ensure the resource is a RenderTextureResource or ColorBufferResource"
      ), console.warn("View props", e));
    }
  } else se(a) && (o = a);
  return {
    buffers: r,
    depth: o
  };
}
const qo = (i) => {
  const e = J.useContext(us);
  return zt({
    async didMount() {
      var o;
      if (await (e == null ? void 0 : e.resolversReady), !e) {
        console.error("No surface context found");
        return;
      }
      let t = [];
      i.output && !Array.isArray(i.output) ? t = [i.output] : i.output && (t = i.output);
      const n = await Promise.all(
        t.map(
          (a) => _x(a, i, e)
        )
      ), s = n.slice(1), r = Th(i.type, {
        key: i.name,
        ...i.config,
        // First buffer is the primary view we create
        output: i.output ? {
          buffers: n[0].buffers,
          depth: n[0].depth
        } : void 0,
        // Additional outputs will map to chaining in the view.
        chain: s.length > 0 ? s.map((a) => ({
          output: {
            buffers: a.buffers,
            depth: a.depth
          }
        })) : void 0
      });
      (o = i.resolver) == null || o.resolve(r);
    }
  }), /* @__PURE__ */ Ae.jsx(Gt, { tagName: "View", ...i });
};
qo.surfaceJSXType = Le.VIEW;
const Ko = (i) => {
  var h, u, d, f;
  const e = J.useContext(us), t = { current: 0 }, n = Uh(i.children), [s, r, { nameConflict: o }] = Ki(
    (e == null ? void 0 : e.layerResolvers) || /* @__PURE__ */ new Map(),
    n,
    Le.LAYER,
    t,
    i.name
  ), [a, c, { nameConflict: l }] = Ki(
    (e == null ? void 0 : e.viewResolvers) || /* @__PURE__ */ new Map(),
    n,
    Le.VIEW,
    t,
    i.name
  );
  if (o.size > 0) {
    console.warn(`Scene ${i.name} Layer name conflict:`, o), (h = i.resolver) == null || h.resolve(null);
    return;
  }
  if (l.size > 0) {
    console.warn(`Scene ${i.name} View name conflict:`, l), (u = i.resolver) == null || u.resolve(null);
    return;
  }
  if (!s) {
    console.warn("A Scene had no Layers:", i.name), (d = i.resolver) == null || d.resolve(null);
    return;
  }
  if (!a) {
    console.warn("A Scene had no Views:", i.name), (f = i.resolver) == null || f.resolve(null);
    return;
  }
  return zt({
    async didMount() {
      var m;
      const [p, g] = await Promise.all([
        r,
        c
      ]);
      (m = i.resolver) == null || m.resolve({
        key: i.name,
        layers: p.filter(se),
        views: g.filter(se)
      });
    }
  }), /* @__PURE__ */ Ae.jsx(Gt, { tagName: "Scene", ...i, children: kh(a, s) });
};
Ko.surfaceJSXType = Le.SCENE;
function Ax(i) {
  const e = [];
  for (let t = 0, n = i.length; t < n; ++t) {
    const s = i[t];
    for (let r = 0, o = s.length; r < o; ++r)
      e.push(s[r]);
  }
  return e;
}
var Ix = Object.defineProperty, Mx = (i, e, t, n) => {
  for (var s = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = o(e, t, s) || s);
  return s && Ix(e, t, s), s;
};
const Fh = class zh extends nt {
  constructor() {
    super(), this.tint = [1, 1, 1, 1], Xe(this, zh);
  }
};
Mx([
  I
], Fh.prototype, "tint");
let Sx = Fh;
const yc = new ee({
  data: {
    width: 2,
    height: 2,
    buffer: new Uint8Array(16)
  }
}), oa = class oa extends Bt {
  initShader() {
    let { buffers: e, fs: t, data: n } = this.props;
    const s = new Sx();
    n instanceof oe && n.add(s), this.alwaysDraw = !0;
    const r = [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1]
    ], o = r.map((l) => [
      l[0] === 1 ? 1 : 0,
      l[1] === 1 ? 1 : 0
    ]), a = Ax(
      Object.keys(e).map((l) => {
        let h = e[l];
        if (!h) return;
        Array.isArray(h) || (h = [h]);
        const u = [];
        for (let d = 0; d < h.length; d++) {
          const p = h[d].key;
          u.push(
            Xs({
              key: p
            })
          );
        }
        return [
          {
            name: l,
            shaderInjection: A.FRAGMENT,
            size: _.TEXTURE,
            update: () => {
              const d = u.length < 2 ? u[0] : u[this.surface.frameMetrics.currentFrame % u.length];
              return this.resource.request(this, s, d), d.texture || yc;
            }
          },
          {
            name: `${l}_size`,
            shaderInjection: A.FRAGMENT,
            size: _.TWO,
            update: () => {
              this.props;
              const d = u.length < 2 ? u[0] : u[this.surface.frameMetrics.currentFrame % u.length];
              this.resource.request(this, s, d);
              const f = (d.texture || yc).data;
              return [(f == null ? void 0 : f.width) || 1, (f == null ? void 0 : f.height) || 1];
            }
          }
        ];
      }).filter(se)
    );
    let c = this.props.uniforms || [];
    return Array.isArray(c) || (c = c(this)), Array.isArray(t) ? (t = t.slice(0), t[0].source = `varying vec2 ${this.props.textureCoordinateName || "texCoord"};
      ${t[0].source}`) : t = `varying vec2 ${this.props.textureCoordinateName || "texCoord"};
      ${t}`, {
      drawMode: x.Model.DrawMode.TRIANGLE_STRIP,
      vs: `
        varying vec2 ${this.props.textureCoordinateName || "texCoord"};

        void main() {
          gl_Position = vec4(vertex, 0.0, 1.0);
          ${this.props.textureCoordinateName || "texCoord"} = tex;
        }
      `,
      fs: t,
      instanceAttributes: [
        {
          name: "dummy",
          size: S.ONE,
          update: (l) => [0]
        }
      ],
      uniforms: a.concat(c),
      vertexAttributes: [
        {
          name: "vertex",
          size: ke.TWO,
          update: (l) => r[l]
        },
        {
          name: "tex",
          size: ke.TWO,
          update: (l) => o[l]
        }
      ],
      vertexCount: 4
    };
  }
  shouldDrawView() {
    return !this.props.preventDraw;
  }
  getMaterialOptions() {
    return it.transparentImageBlending.modify({
      depthTest: !1
    });
  }
};
oa.defaultProps = {
  key: "",
  data: new oe(),
  buffers: {},
  baseShaderModules: () => ({ fs: [], vs: [] }),
  fs: "void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);"
};
let ho = oa;
const ti = (i) => {
  var e;
  return /* @__PURE__ */ Ae.jsxs(Ko, { name: i.name, children: [
    /* @__PURE__ */ Ae.jsx(
      qo,
      {
        name: "fullscreen",
        type: nr,
        ...i.view,
        output: i.output,
        config: {
          camera: new si(),
          viewport: { left: 0, top: 0, width: "100%", height: "100%" },
          ...(e = i.view) == null ? void 0 : e.config
        }
      }
    ),
    /* @__PURE__ */ Ae.jsx(
      Yo,
      {
        name: "postprocess",
        type: ho,
        uses: {
          names: Object.values(i.buffers).flat(),
          apply: (t, n) => {
            var s;
            return n.buffers = {}, Object.keys(i.buffers).map((r) => {
              Array.isArray(i.buffers[r]) ? n.buffers[r] = i.buffers[r].map((o) => t[o]) : n.buffers[r] = t[i.buffers[r]];
            }), (s = i.onResources) == null || s.call(i, t), n;
          }
        },
        config: {
          printShader: i.printShader,
          buffers: {},
          fs: i.shader,
          uniforms: i.uniforms,
          materialOptions: i.material,
          preventDraw: i.preventDraw
        }
      }
    )
  ] }, i.name);
}, _v = (i) => /* @__PURE__ */ Ae.jsxs(Ko, { name: i.name, children: [
  /* @__PURE__ */ Ae.jsx(qo, { type: nr, config: { camera: new si() } }),
  /* @__PURE__ */ Ae.jsx(Yo, { type: io, config: { commands: i.callback } })
] }), Cx = `\${import: camera}

void main() {
  vec2 texelSize = 1.0 / viewSize;
  vec4 o = texelSize.xyxy * vec2(-delta, delta).xxyy;

  vec4 s =
    texture2D(sourceTex, texCoord + o.xy) + texture2D(sourceTex, texCoord + o.zy) +
    texture2D(sourceTex, texCoord + o.xw) + texture2D(sourceTex, texCoord + o.zw);

  \${out: color} = s * 0.25;
}
`;
var uo = /* @__PURE__ */ ((i) => (i[i.DOWN = 0] = "DOWN", i[i.UP = 1] = "UP", i))(uo || {});
function Ec(i) {
  const { output: e, input: t } = i;
  return ti({
    name: i.name,
    printShader: i.printShader,
    output: e ? {
      buffers: { [V.COLOR]: e },
      depth: !1
    } : void 0,
    view: i.view,
    buffers: { sourceTex: t },
    shader: Cx,
    material: i.material,
    uniforms: [
      {
        name: "delta",
        size: _.ONE,
        shaderInjection: A.FRAGMENT,
        update: () => i.direction === 0 ? 1 : 0.5
      }
    ]
  });
}
function Av(i) {
  const { compose: e, output: t, resources: n, view: s } = i, r = {
    blending: {
      blendDst: x.Material.BlendingDstFactor.One,
      blendSrc: x.Material.BlendingSrcFactor.One,
      blendEquation: x.Material.BlendingEquations.Add
    }
  }, o = [];
  for (let a = 0, c = i.samples; a < c; ++a) {
    const l = Ec({
      name: `${i.name}.box-down${a}`,
      printShader: i.printShader,
      input: n[a],
      output: n[a + 1],
      direction: uo.DOWN,
      material: {
        blending: void 0
      }
    });
    o.push(l);
  }
  for (let a = i.samples - 1; a > 0; --a) {
    const c = Ec({
      name: `${i.name}.box-up${a}`,
      printShader: i.printShader,
      input: n[a + 1],
      output: n[a],
      direction: uo.UP,
      material: r
    });
    o.push(c);
  }
  return e && o.push(
    ti({
      name: `${i.name}.compose`,
      printShader: i.printShader,
      // Set the buffers we want to composite
      buffers: {
        color: e,
        glow: n[1]
      },
      // Turn off blending
      material: r,
      // Render to the screen, or to a potentially specified target
      view: {
        ...t ? {
          output: {
            buffers: { [V.COLOR]: t },
            depth: !1
          }
        } : void 0,
        ...s
      },
      uniforms: [
        {
          name: "gamma",
          size: _.ONE,
          shaderInjection: A.ALL,
          update: () => [i.gammaCorrection || 1]
        }
      ],
      // Utilize our composition shader
      shader: `
          void main() {
            vec3 base = texture2D(color, texCoord).rgb;
            vec3 glow = texture2D(glow, texCoord).rgb;

            ${i.gammaCorrection !== void 0 ? `
              vec3 result = mix(
                base,
                glow + base,
                ((glow.r + glow.g + glow.b) * gamma)
              );
            ` : `
              vec3 result = base + glow;
            `}

            \${out: color} = vec4(result, 1.0);
          }
        `
    })
  ), o;
}
function Ox(i) {
  return Array.isArray(i[0]);
}
const Iv = (i) => {
  const e = i.scale || Eo(1, 1), n = (Ox(e) ? e : [i.scale]).map((o) => yo(o)), s = 1 / n.length, r = J.useRef(i.zOffset);
  if (se(i.drift)) {
    const o = i.drift;
    return ti({
      name: i.name,
      buffers: {},
      view: {
        config: {
          drawMode: { mode: Fs.ALWAYS }
        }
      },
      output: {
        buffers: {
          [V.COLOR]: i.output
        },
        depth: !1
      },
      uniforms: [
        {
          name: "drift",
          size: _.THREE,
          shaderInjection: A.FRAGMENT,
          update: () => o
        }
      ],
      shader: `
        \${import: time, simplexNoise3D}

        void main() {
          float value = 0.;
          ${n.map(
        (a) => `value += simplexNoise3D(vec3(gl_FragCoord.xy * vec2(${a[0]}f, ${a[1]}f), 0.) + (drift * time));`
      ).join(`
`)}
          value *= ${s.toFixed(1)}f;
          \${out: color} = vec4(value, value, value, 1.);
        }
      `
    });
  } else if (se(i.zOffset)) {
    const o = i.zOffset;
    return ti({
      name: i.name,
      buffers: {},
      view: {
        config: {
          drawMode: {
            mode: Fs.ON_TRIGGER,
            trigger: () => {
              const a = r.current !== o;
              return r.current = o, a;
            }
          }
        }
      },
      output: {
        buffers: {
          [V.COLOR]: i.output
        },
        depth: !1
      },
      uniforms: [
        {
          name: "zOffset",
          size: _.ONE,
          update: Ic(o) ? () => [o] : () => [o()]
        }
      ],
      shader: `
        \${import: simplexNoise3D}

        void main() {
          float value = 0.;
          ${n.map(
        (a) => `
            value += simplexNoise3D(vec3(gl_FragCoord.xy * vec2(${a[0]}f, ${a[1]}f), zOffset));
          `
      ).join(`
`)}
          value *= ${s.toFixed(1)}f;
          \${out: color} = vec4(value, value, value, 1.);
        }
      `
    });
  } else
    return ti({
      name: i.name,
      buffers: {},
      view: {
        config: {
          drawMode: { mode: Fs.FRAME_COUNT, value: 1 }
        }
      },
      output: {
        buffers: {
          [V.COLOR]: i.output
        },
        depth: !1
      },
      shader: `
        \${import: simplexNoise2D}

        void main() {
          float value = 0.;
          ${n.map(
        (o) => `
            value += simplexNoise2D(gl_FragCoord.xy * vec2(${o[0]}f, ${o[1]}f));
          `
      ).join(`
`)}
          value *= ${s.toFixed(1)}f;
          \${out: color} = vec4(value, value, value, 1.);
        }
      `
    });
};
function Mv(i) {
  var r;
  const { output: e, input: t, channel: n, grayScale: s } = i;
  return ti({
    name: i.name,
    printShader: i.printShader,
    output: e ? {
      buffers: {
        [V.COLOR]: e || ""
      },
      depth: !1
    } : void 0,
    view: {
      ...i.view,
      config: {
        camera: new si(),
        ...(r = i.view) == null ? void 0 : r.config
      }
    },
    buffers: { color: t },
    shader: s && n ? `
      void main() {
        \${out: color} = vec4(texture2D(color, texCoord).${n}${n}${n}, 1.);
      }
    ` : n ? `
      void main() {
        \${out: color} = vec4(texture2D(color, texCoord).${n}, 0., 0., 1.);
      }
    ` : `
      void main() {
        \${out: color} = texture2D(color, texCoord);
      }
    `,
    material: i.material,
    /** Inspect the resources for feedback on their configuration */
    onResources: (o) => {
      Object.values(o).forEach((a) => {
        (!a.textureSettings || a.textureSettings.generateMipMaps === void 0 || a.textureSettings.generateMipMaps === !0) && Me("drawjsx-resource-error", () => {
          console.warn(
            "POSSIBLE ERROR: for the draw post effect,",
            "it is a common mistake to leave mipmaps enabled on the input texture.",
            "Often the mipmaps are not available in the target resource and thus",
            "you will get a blank output when rendering in certain scenarios."
          );
        });
      });
    }
  });
}
function Sv(i) {
  const { output: e, input: t, view: n } = i, s = [];
  return s.push(
    ti({
      name: `${i.name}_base`,
      printShader: i.printShader,
      // Set the buffers we want to composite
      buffers: {
        trailTex: t.trail,
        addTex: t.add
      },
      // Turn off blending
      material: {
        blending: null
      },
      // Render to the screen, or to a potentially specified target
      output: {
        buffers: { [V.COLOR]: e },
        depth: !1
      },
      view: {
        config: {
          // clearFlags: [ClearFlags.COLOR],
        },
        ...n
      },
      // Utilize our composition shader
      shader: `
        void main() {
          // Add the trailTex and addTex but fade out the trailTex slightly
          vec4 addT = texture2D(addTex, texCoord);
          vec4 trailT = texture2D(trailTex, texCoord);

          // Blend the textures
          float alpha = addT.a + trailT.a * (1.0 - addT.a); // Compute final alpha
          vec3 color;
          if (alpha > 0.0) { // Avoid division by zero
            color = (addT.rgb * addT.a + trailT.rgb * trailT.a * (1.0 - addT.a)) / alpha;
          } else {
            color = vec3(0.0); // Fallback to black (or any other fallback color)
          }

          gl_FragColor = vec4(color, alpha);
        }
      `
    })
  ), i.drift ? i.drift && s.push(
    ti({
      name: i.name,
      printShader: i.printShader,
      // Set the buffers we want to composite
      buffers: {
        tex: e
      },
      // Turn off blending
      material: {
        blending: null
      },
      // Render the composited textures back to the trail input but faded back a
      // little.
      view: n,
      output: {
        buffers: { [V.COLOR]: t.trail },
        depth: !1
      },
      uniforms: [
        {
          name: "drift",
          size: _.TWO,
          shaderInjection: A.FRAGMENT,
          update: () => {
            var r;
            return ((r = i.drift) == null ? void 0 : r.direction) || [0, 0];
          }
        }
      ],
      // Utilize our composition shader
      shader: `
          void main() {
            vec4 fade = texture2D(tex, texCoord + (drift / tex_size));
            fade.rgba *= ${i.intensity || 0.7};
            \${out: color} = fade;
          }
        `
    })
  ) : s.push(
    ti({
      name: i.name,
      printShader: i.printShader,
      // Set the buffers we want to composite
      buffers: {
        tex: e
      },
      // Turn off blending
      material: {
        blending: null
      },
      // Render the composited textures back to the trail input but faded back a
      // little.
      output: {
        buffers: { [V.COLOR]: t.trail },
        depth: !1
      },
      view: n,
      // Utilize our composition shader
      shader: `
          void main() {
            vec4 fade = texture2D(tex, texCoord);
            fade.rgba *= ${i.intensity || 0.7};
            \${out: color} = fade;
          }
        `
    })
  ), s;
}
const aa = class aa extends Bt {
  constructor(e, t, n) {
    super(e, t, n), console.warn(
      "Please ensure all debugLayer calls are removed for production:",
      n.key
    );
  }
  /**
   * Hand the wrapped layer as a child layer to this layer
   */
  childLayers() {
    return this.props.wrap ? (this.props.wrap.init[1].key = `debug-wrapper.${this.props.key}`, [this.props.wrap]) : [];
  }
  /**
   * Our draw loop. We use this to hijack the changes flowing to our wrapped
   * layer so we can output significant information about the changes.
   */
  draw() {
    if (!this.props.wrap) return;
    const e = this.resolveChanges(!0);
    if (e.length === 0) return;
    const { messageHeader: t = () => "" } = this.props;
    console.warn(`${t()}
`, {
      totalChanges: e.length,
      changes: e
    });
  }
  /**
   * Log the shader information of the layer
   */
  initShader() {
    if (!this.props.wrap) return null;
    const e = new this.props.wrap.init[0](
      this.surface,
      this.scene,
      this.props.wrap.init[1]
    ), t = e.childLayers(), n = {};
    for (; t.length > 0; ) {
      const s = t.pop();
      if (!s) continue;
      const r = new s.init[0](
        this.surface,
        this.scene,
        s.init[1]
      );
      n[r.id] = {
        shaderIO: r.initShader()
      }, r.childLayers().forEach((o) => t.push(o));
    }
    return console.warn(`Shader IO: ${this.id}
`, {
      shaderIO: e.initShader(),
      childLayers: n
    }), null;
  }
};
aa.defaultProps = {
  data: new oe(),
  key: "default",
  messageHeader: () => "",
  wrap: Dn(Bt, {
    data: new oe()
  })
};
let fo = aa;
function Cv(i, e) {
  const t = zn(fo, {
    messageHeader: () => `CHANGES FOR: ${t.init[1].key}`,
    wrap: zn(i, e),
    data: e.data
  });
  return t;
}
export {
  wg as ActiveIOExpansion,
  L as AnchorType,
  gv as ArcInstance,
  nc as ArcLayer,
  vm as ArcScaleType,
  zp as Atlas,
  Rx as AtlasJSX,
  $p as AtlasManager,
  Wp as AtlasResourceManager,
  ii as Attribute,
  Ht as AutoEasingLoopStyle,
  Do as AutoEasingMethod,
  sx as Axis2D,
  wr as BaseIOExpansion,
  Kg as BaseIOSorting,
  Bo as BaseProjection,
  rs as BaseResourceManager,
  Pp as BaseShaderIOInjection,
  um as BasicCamera2DController,
  Tx as BasicCamera2DControllerJSX,
  gg as BasicIOExpansion,
  Yx as BasicInstance,
  Av as BloomJSX,
  Z as Bounds,
  Ec as BoxSampleJSX,
  uo as BoxSampleJSXDirection,
  cs as BufferManagerBase,
  zi as Camera,
  si as Camera2D,
  hm as CameraBoundsAnchor,
  Fi as CameraProjectionType,
  mv as CircleInstance,
  sc as CircleLayer,
  ks as ClearFlags,
  io as CommandLayer,
  _v as CommandsJSX,
  it as CommonMaterialOptions,
  Gi as Control2D,
  Ev as CubeInstance,
  mc as CubeLayer,
  Gt as CustomTag,
  sm as DEFAULT_IO_EXPANSION,
  rm as DEFAULT_RESOURCE_MANAGEMENT,
  Qp as DEFAULT_RESOURCE_ROUTER,
  om as DEFAULT_SHADER_TRANSFORM,
  Mv as DrawJSX,
  hg as EasingIOExpansion,
  sv as EasingUtil,
  Ah as EdgeBroadphase,
  xv as EdgeInstance,
  rc as EdgeLayer,
  zs as EdgeScaleType,
  Kt as EdgeType,
  te as EulerOrder,
  Rc as EventManager,
  Cp as FontGlyphRenderSize,
  Ex as FontJSX,
  Lp as FontManager,
  Ep as FontMap,
  to as FontMapGlyphType,
  Mp as FontRenderer,
  Up as FontResourceManager,
  Un as FontResourceRequestFetch,
  V as FragmentOutputType,
  Vs as GLProxy,
  x as GLSettings,
  Bu as GLState,
  Di as Geometry,
  Vm as GlyphInstance,
  ro as GlyphLayer,
  Xd as Hadamard2x2,
  Qd as Hadamard3x3,
  Yd as Hadamard4x4,
  Wu as INVALID_RESOURCE_MANAGER,
  ip as IdentityTransform,
  vv as ImageInstance,
  oc as ImageLayer,
  Ln as ImageRasterizer,
  Cs as IndexBufferSize,
  nt as Instance,
  cx as Instance3D,
  Og as InstanceAttributeBufferManager,
  Ng as InstanceAttributePackingBufferManager,
  S as InstanceAttributeSize,
  _c as InstanceBlockIndex,
  ge as InstanceDiffType,
  oe as InstanceProvider,
  Qx as InstanceProviderWithList,
  $u as InvalidResourceManager,
  Oe as LabelInstance,
  oo as LabelLayer,
  Bt as Layer,
  Ne as Layer2D,
  ie as LayerBufferType,
  jg as LayerInteractionHandler,
  Yo as LayerJSX,
  Jg as LayerMouseEvents,
  ir as LayerScene,
  Ji as M200,
  en as M201,
  tn as M210,
  nn as M211,
  hr as M300,
  ur as M301,
  dr as M302,
  fr as M310,
  pr as M311,
  gr as M312,
  mr as M320,
  xr as M321,
  vr as M322,
  Sn as M3R,
  ri as M400,
  oi as M401,
  ai as M402,
  ci as M403,
  li as M410,
  hi as M411,
  ui as M412,
  di as M413,
  fi as M420,
  pi as M421,
  gi as M422,
  mi as M423,
  xi as M430,
  vi as M431,
  bi as M432,
  wi as M433,
  Ue as M4R,
  lr as Material,
  Te as MaterialUniformType,
  qx as MatrixMath,
  Cl as Model,
  Vh as MouseButton,
  go as NOOP,
  Zn as NewLineCharacterMode,
  Hg as NoView,
  Se as ObservableMonitoring,
  je as PackNode,
  H as PickType,
  Sx as PostProcessInstance,
  ti as PostProcessJSX,
  ho as PostProcessLayer,
  ix as Projection3D,
  He as PromiseResolver,
  wf as QR1,
  Tf as QR2,
  yf as QR3,
  Ef as QR4,
  If as QW,
  Rf as QX,
  _f as QY,
  Af as QZ,
  vp as QuadTree,
  qn as QuadTreeNode,
  xp as QuadTreeQuadrants,
  Kx as QuaternionMath,
  yh as QueuedEventHandler,
  bx as QueuedEventHandlerJSX,
  hv as REQUEST,
  lv as RESOURCE,
  Zx as RayMath,
  er as ReactiveDiff,
  s0 as RectangleInstance,
  dc as RectangleLayer,
  pv as ReferenceCamera2D,
  Zi as RenderTarget,
  Ea as RenderTexture,
  Hp as RenderTextureResourceManager,
  av as ResourcePool,
  vh as ResourceRouter,
  re as ResourceType,
  wv as RingInstance,
  fc as RingLayer,
  $r as SRT4x4,
  $l as SRT4x4_2D,
  Zt as ScaleMode,
  Fr as Scene,
  rx as SceneGraphLayer,
  Ko as SceneJSX,
  A as ShaderInjectionTarget,
  me as ShaderModule,
  Sr as ShaderModuleUnit,
  po as SimpleEventHandler,
  wx as SimpleEventHandlerJSX,
  Gu as SimpleProjection,
  Iv as SimplexNoiseJSX,
  kr as StreamChangeStrategy,
  Bi as SubTexture,
  cm as Surface,
  us as SurfaceContext,
  Ac as SurfaceErrorType,
  Rv as SurfaceJSX,
  Ns as TRS4x4,
  vf as TRS4x4_2D,
  ao as TextAlignment,
  bv as TextAreaInstance,
  uc as TextAreaLayer,
  ee as Texture,
  $o as TextureIOExpansion,
  yx as TextureJSX,
  ft as TextureSize,
  Sv as TrailJSX,
  Vo as Transform,
  yv as Transform2D,
  nh as TreeNode,
  Bg as UniformBufferManager,
  _ as UniformSize,
  Rt as UseMaterialStatus,
  qg as UserInputEventManager,
  Ve as V3R,
  ru as V4R,
  D as VecMath,
  Jx as VectorMath,
  ke as VertexAttributeSize,
  ns as View,
  nr as View2D,
  gc as View3D,
  Fs as ViewDrawMode,
  qo as ViewJSX,
  Du as WebGLRenderer,
  O as WebGLStat,
  Qt as WordWrap,
  xo as add1,
  Ui as add2,
  Gd as add2x2,
  ni as add3,
  Vd as add3x3,
  Io as add4,
  yu as add4by3,
  $d as add4x4,
  Mf as addQuat,
  Ld as affineInverse2x2,
  Nd as affineInverse3x3,
  Pd as affineInverse4x4,
  Gf as angleQuat,
  Fe as apply1,
  ae as apply2,
  mt as apply2x2,
  fe as apply3,
  Je as apply3x3,
  ce as apply4,
  pe as apply4x4,
  Kn as atlasRequest,
  Vf as axisQuat,
  Cc as ceil1,
  Qc as ceil2,
  ol as ceil3,
  fl as ceil4,
  Ze as clamp,
  Au as color4FromHex3,
  Iu as color4FromHex4,
  Wh as colorBufferFormat,
  zx as colorUID,
  Oc as compare1,
  To as compare2,
  pf as compare2x2,
  $s as compare3,
  gf as compare3x3,
  Mo as compare4,
  Vl as compare4x4,
  zd as concat4x4,
  kh as concatChildren,
  Hl as conjugateQuat,
  iv as convertToSDF,
  Lc as copy1,
  wo as copy2,
  mf as copy2x2,
  ct as copy3,
  xf as copy3x3,
  ei as copy4,
  is as copy4x4,
  ov as create,
  xh as createAtlas,
  bp as createAttribute,
  zn as createChildLayer,
  uv as createEasingAttribute,
  mh as createFont,
  Dn as createLayer,
  Tv as createLayer2Din3D,
  kx as createMaterialOptions,
  Nl as createTexture,
  wp as createUniform,
  Tp as createVertex,
  Th as createView,
  Pc as cross1,
  qc as cross2,
  tt as cross3,
  gl as cross4,
  Cv as debugLayer,
  Go as decomposeRotation,
  jh as depthBufferFormat,
  de as determinant2x2,
  On as determinant3x3,
  Pl as determinant4x4,
  Of as diffUnitQuat,
  Bc as divide1,
  ar as divide2,
  cr as divide3,
  ml as divide4,
  Sf as divideQuat,
  Wc as dot1,
  ss as dot2,
  Ws as dot3,
  Lo as dot4,
  Df as dotQuat,
  Tu as down3,
  gn as drawMode,
  Dc as empty1,
  Kc as empty2,
  al as empty3,
  xl as empty4,
  jf as eulerToQuat,
  Wt as eventElementPosition,
  Cf as exponentQuat,
  Uc as flatten1,
  Zc as flatten2,
  cl as flatten3,
  So as flatten4,
  kc as floor1,
  Jc as floor2,
  ll as floor3,
  vl as floor4,
  Gn as fontRequest,
  Nc as forward1,
  Yc as forward2,
  Cn as forward3,
  pl as forward4,
  Uf as fromEulerAxisAngleToQuat,
  Ql as fromOrderedEulerToQuat,
  cu as fuzzyCompare1,
  uu as fuzzyCompare2,
  gu as fuzzyCompare3,
  Eu as fuzzyCompare4,
  Tg as generateDefaultScene,
  Rg as generateLayerGeometry,
  Mg as generateLayerMaterial,
  as as generateLayerModel,
  wa as getAbsolutePositionBounds,
  Nx as getProgramInfo,
  qf as iQuat,
  br as identity2,
  Ti as identity3,
  ne as identity4,
  Bf as imaginaryQuat,
  fs as indexToColorAttachment,
  Xh as indexToTextureUnit,
  ng as injectShaderIO,
  ds as inputImageFormat,
  Jh as instanceAttributeSizeFloatCount,
  Fc as inverse1,
  yo as inverse2,
  Jn as inverse3,
  bl as inverse4,
  Lf as inverseQuat,
  Ga as isAtlasResource,
  Hi as isBoolean,
  dv as isBufferLocation,
  wh as isBufferLocationGroup,
  se as isDefined,
  za as isFontResource,
  Fx as isFunction,
  fv as isInstanceAttributeBufferLocation,
  Cg as isInstanceAttributeBufferLocationGroup,
  Px as isInstanceAttributeVector,
  Ux as isNewline,
  Ic as isNumber,
  In as isOffscreenCanvas,
  np as isOrthographic,
  rh as isPerspective,
  Nn as isRenderTextureResource,
  Bx as isResourceAttribute,
  Li as isString,
  Pg as isUniformBufferLocation,
  Xx as isUniformFloat,
  Wx as isUniformMat3,
  jx as isUniformMat4,
  Hx as isUniformTexture,
  Gx as isUniformVec2,
  Vx as isUniformVec3,
  $x as isUniformVec4,
  Nu as isUniformVec4Array,
  ou as isVec1,
  Sc as isVec2,
  au as isVec3,
  F as isVec4,
  As as isVideoResource,
  An as isWhiteSpace,
  Kf as jQuat,
  Zf as kQuat,
  wu as left3,
  Hc as length1,
  hu as length1Components,
  ln as length2,
  rl as length2Components,
  Ro as length3,
  dl as length3Components,
  No as length4,
  Ni as length4Components,
  Xl as lengthQuat,
  jc as linear1,
  sl as linear2,
  ul as linear3,
  Tl as linear4,
  Qf as lookAtMatrix,
  Yl as lookAtQuat,
  xn as magFilter,
  nv as makeFontSDF,
  Xe as makeObservable,
  Hr as mapGetWithDefault,
  cn as mapInjectDefault,
  Wr as matrix3x3FromUnitQuatModel,
  Wf as matrix3x3FromUnitQuatView,
  Hf as matrix3x3ToQuaternion,
  $f as matrix4x4FromUnitQuatModel,
  zo as matrix4x4FromUnitQuatView,
  Xf as matrix4x4ToQuaternion,
  zc as max1,
  el as max2,
  _o as max3,
  yl as max4,
  Gc as min1,
  tl as min2,
  Ao as min3,
  El as min4,
  Ai as minFilter,
  Vc as multiply1,
  il as multiply2,
  kd as multiply2x2,
  hl as multiply3,
  Fd as multiply3x3,
  wl as multiply4,
  lt as multiply4x4,
  Wl as multiplyQuat,
  Bd as multiplyScalar2x2,
  Dd as multiplyScalar3x3,
  Ud as multiplyScalar4x4,
  ma as newLineCharRegEx,
  eu as newLineRegEx,
  Zl as nextFrame,
  $c as normalize1,
  nl as normalize2,
  pt as normalize3,
  Rl as normalize4,
  Nf as normalizeQuat,
  ph as normalizeWheel,
  I as observable,
  Jl as onAnimationLoop,
  ki as onFrame,
  Ks as oneQuat,
  zl as orthographic4x4,
  Kp as packAttributes,
  Fl as perspective4x4,
  ff as perspectiveFOVY4x4,
  Uo as perspectiveFrustum4x4,
  cv as preloadNumber,
  Vr as project3As4ToScreen,
  Gl as projectToScreen,
  ql as ray,
  Kl as rayFromPoints,
  ep as rayToLocation,
  Pf as realQuat,
  tr as removeComments,
  gh as renderGlyph,
  th as resolveUpdate,
  pu as reverse2,
  xu as reverse3,
  _u as reverse4,
  bu as right3,
  jr as rotateVectorByUnitQuat,
  Bl as rotation2x2,
  Dl as rotation4x4,
  hf as rotation4x4by3,
  vo as scale1,
  _e as scale2,
  ut as scale3,
  Co as scale4,
  Ul as scale4x4,
  uf as scale4x4by3,
  jl as scaleQuat,
  eh as scheduleUpdate,
  sn as shaderTemplate,
  sh as shallowCompare,
  Zd as shearX2x2,
  ef as shearX4x4,
  Jd as shearY2x2,
  tf as shearY4x4,
  nf as shearZ4x4,
  _l as slerpQuat,
  Yf as slerpUnitQuat,
  Hh as stencilBufferFormat,
  tv as stopAllFrameCommands,
  Ca as stopAnimationLoop,
  rn as subTextureIOValue,
  bo as subtract1,
  we as subtract2,
  Wd as subtract2x2,
  Jt as subtract3,
  jd as subtract3x3,
  Oo as subtract4,
  Hd as subtract4x4,
  mn as texelFormat,
  Xs as textureRequest,
  ua as textureUnitToIndex,
  Ff as toEulerFromQuat,
  kf as toEulerXYZfromOrderedEuler,
  Fo as toOrderedEulerFromQuat,
  zf as toOrderedEulerFromQuat2,
  Mu as toString1,
  Su as toString2,
  af as toString2x2,
  Cu as toString3,
  cf as toString3x3,
  Ou as toString4,
  lf as toString4x4,
  lu as tod1,
  du as tod2,
  mu as tod3,
  Ru as tod4,
  fu as tod_flip2,
  dp as touchesContainsStartView,
  up as touchesHasStartView,
  sf as transform2,
  rf as transform3,
  of as transform3as4,
  Qs as transform4,
  kl as translation4x4,
  df as translation4x4by3,
  qd as transpose2x2,
  Ls as transpose3x3,
  Kd as transpose4x4,
  U as uid,
  vu as up3,
  Ki as useChildResolvers,
  Xc as vec1,
  Al as vec1Methods,
  Eo as vec2,
  Il as vec2Methods,
  on as vec3,
  Ml as vec3Methods,
  js as vec4,
  Sl as vec4Methods,
  rv as wait,
  ga as whiteSpaceCharRegEx,
  Dx as whiteSpaceRegEx,
  ha as wrapMode,
  xe as zeroQuat
};
//# sourceMappingURL=index.js.map
