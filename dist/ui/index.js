(function(){"use strict";try{if(typeof document<"u"){var e=document.createElement("style");e.appendChild(document.createTextNode(".SurfaceJSX{flex:1 1 auto;display:flex;flex-direction:column;width:100%;height:100%;overflow:hidden}")),document.head.appendChild(e)}}catch(t){console.error("vite-plugin-css-injected-by-js",t)}})();
import q, { useState as ma, useEffect as ba } from "react";
window.WebGL2RenderingContext = window.WebGL2RenderingContext || function() {
};
class Nc {
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
class hr extends Nc {
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
var Yu = /* @__PURE__ */ ((i) => (i[i.NONE = -1] = "NONE", i[i.LEFT = 0] = "LEFT", i[i.AUX = 1] = "AUX", i[i.RIGHT = 2] = "RIGHT", i[i.FOURTH = 3] = "FOURTH", i[i.FIFTH = 4] = "FIFTH", i))(Yu || {});
class ni {
  /**
   * The data provided is the array that holds all of the information that
   * should be pushed to the GPU. The size defines how large the vertex
   * attribute is defined in the shader.
   */
  constructor(e, t, s = !1, n = !1) {
    this._isInstanced = !1, this._fullUpdate = !1, this.normalize = !1, this._needsUpdate = !1, this._updateRange = {
      /** Number of vertices to update */
      count: -1,
      /** Offset to the first vertex to begin updating */
      offset: -1
    }, this.data = e, this.size = t, this._isDynamic = s, this._isInstanced = n;
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
    const s = new Float32Array(e * this.size);
    s.length >= t ? t === this.data.length ? s.set(this.data) : s.set(this.data.subarray(0, t)) : s.set(this.data.subarray(0, s.length)), this.destroy(), this.data = s, this._needsUpdate = !0, this._fullUpdate = !0;
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
  repeatInstances(e, t, s = 1) {
    if (e === 0)
      return;
    if (s < 1)
      throw new Error(
        "Can not use repeatInstance on attribute with a startInstance of less than 1"
      );
    const n = t * this.size;
    if (s * n + n > this.data.length)
      return;
    const r = Math.floor(this.data.length / n), o = Math.min(s + e, r), a = s * n;
    this.data.copyWithin(a, 0, n);
    let c = 1, l = o - s - 1, u = 36;
    for (; l > 0 && --u > 0; )
      this.data.copyWithin(
        a + c * n,
        a,
        // We recopy the copied instances to our new destination, but we limit
        // this to the number of instances we have left to copy in this batch.
        // This effectively causes us to double the number of instances we copy
        // each iteration, thus making this operation siginificantly faster.
        a + Math.min(l, c) * n
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
class zi {
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
    let s;
    t.name = e, Object.values(this._attributes).forEach((n) => {
      const r = n.isInstanced ? 1 : 0;
      s === void 0 && (s = r), (s ^ r) === 1 && (this.isInstanced = !0);
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
    const s = Object.values(this._attributes);
    for (const n of s)
      n.resize(e);
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
      t[t.RGBA4 = 0] = "RGBA4", t[t.RGB565 = 1] = "RGB565", t[t.RGB5_A1 = 2] = "RGB5_A1", t[t.R8 = 3] = "R8", t[t.R8UI = 4] = "R8UI", t[t.R8I = 5] = "R8I", t[t.R16UI = 6] = "R16UI", t[t.R16I = 7] = "R16I", t[t.R32UI = 8] = "R32UI", t[t.R32I = 9] = "R32I", t[t.RG8 = 10] = "RG8", t[t.RG8UI = 11] = "RG8UI", t[t.RG8I = 12] = "RG8I", t[t.RG16UI = 13] = "RG16UI", t[t.RG16I = 14] = "RG16I", t[t.RG32UI = 15] = "RG32UI", t[t.RG32I = 16] = "RG32I", t[t.RGB8 = 17] = "RGB8", t[t.RGBA8 = 18] = "RGBA8", t[t.SRGB8_ALPHA8 = 19] = "SRGB8_ALPHA8", t[t.RGB10_A2 = 20] = "RGB10_A2", t[t.RGBA8UI = 21] = "RGBA8UI", t[t.RGBA8I = 22] = "RGBA8I", t[t.RGB10_A2UI = 23] = "RGB10_A2UI", t[t.RGBA16UI = 24] = "RGBA16UI", t[t.RGBA16I = 25] = "RGBA16I", t[t.RGBA32I = 26] = "RGBA32I", t[t.RGBA32UI = 27] = "RGBA32UI", t[t.R16F = 28] = "R16F", t[t.R32F = 29] = "R32F", t[t.RG16F = 30] = "RG16F", t[t.RG32F = 31] = "RG32F", t[t.RGB16F = 32] = "RGB16F", t[t.RGB32F = 33] = "RGB32F", t[t.RGBA16F = 34] = "RGBA16F", t[t.RGBA32F = 35] = "RGBA32F", t[t.R11F_G11F_B10F = 36] = "R11F_G11F_B10F";
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
      t[t.Alpha = -1] = "Alpha", t[t.DepthComponent = 1] = "DepthComponent", t[t.DepthStencil = 2] = "DepthStencil", t[t.Luminance = 3] = "Luminance", t[t.LuminanceAlpha = 4] = "LuminanceAlpha", t[t.RGB = 5] = "RGB", t[t.RGBA = 6] = "RGBA", t[t.RGBE = 7] = "RGBE", t[t.R8 = 8] = "R8", t[t.R16F = 9] = "R16F", t[t.R32F = 10] = "R32F", t[t.R8UI = 11] = "R8UI", t[t.RG8 = 12] = "RG8", t[t.RG16F = 13] = "RG16F", t[t.RG32F = 14] = "RG32F", t[t.RG8UI = 15] = "RG8UI", t[t.RG16UI = 16] = "RG16UI", t[t.RG32UI = 17] = "RG32UI", t[t.RGB8 = 18] = "RGB8", t[t.SRGB8 = 19] = "SRGB8", t[t.RGB565 = 20] = "RGB565", t[t.R11F_G11F_B10F = 21] = "R11F_G11F_B10F", t[t.RGB9_E5 = 22] = "RGB9_E5", t[t.RGB16F = 23] = "RGB16F", t[t.RGB32F = 24] = "RGB32F", t[t.RGB8UI = 25] = "RGB8UI", t[t.RGBA8 = 26] = "RGBA8", t[t.SRGB8_ALPHA8 = 27] = "SRGB8_ALPHA8", t[t.RGB5_A1 = 28] = "RGB5_A1", t[t.RGB10_A2 = 29] = "RGB10_A2", t[t.RGBA4 = 30] = "RGBA4", t[t.RGBA16F = 31] = "RGBA16F", t[t.RGBA32F = 32] = "RGBA32F", t[t.RGBA8UI = 33] = "RGBA8UI", t[t.DEPTH_COMPONENT16 = 34] = "DEPTH_COMPONENT16", t[t.DEPTH_COMPONENT24 = 35] = "DEPTH_COMPONENT24", t[t.DEPTH_COMPONENT32F = 36] = "DEPTH_COMPONENT32F", t[t.RGBA32UI = 37] = "RGBA32UI", t[t.RGB32UI = 38] = "RGB32UI", t[t.RGBA16UI = 39] = "RGBA16UI", t[t.RGB16UI = 40] = "RGB16UI", t[t.RGBA32I = 41] = "RGBA32I", t[t.RGB32I = 42] = "RGB32I", t[t.RGBA16I = 43] = "RGBA16I", t[t.RGB16I = 44] = "RGB16I", t[t.RGBA8I = 45] = "RGBA8I", t[t.RGB8I = 46] = "RGB8I", t[t.RED_INTEGER = 47] = "RED_INTEGER", t[t.RG_INTEGER = 48] = "RG_INTEGER", t[t.RGB_INTEGER = 49] = "RGB_INTEGER", t[t.RGBA_INTEGER = 50] = "RGBA_INTEGER", t[t.RED = 51] = "RED", t[t.RG = 52] = "RG";
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
function Db(i, e) {
  const t = {
    attributeCount: 0,
    attributes: [],
    uniformCount: 0,
    uniforms: []
  }, s = i.getProgramParameter(e, i.ACTIVE_UNIFORMS), n = i.getProgramParameter(
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
  for (let a = 0; a < s; ++a) {
    const c = i.getActiveUniform(e, a);
    c.typeName = r[c.type], t.uniforms.push(c), t.uniformCount += c.size, c.size = c.size * o[c.type];
  }
  for (let a = 0; a < n; a++) {
    const c = i.getActiveAttrib(e, a);
    c.typeName = r[c.type], t.attributes.push(c), t.attributeCount += c.size;
  }
  return t;
}
const ce = class ce {
  static print() {
    return Object.assign({}, ce);
  }
};
ce.VAO = !1, ce.DEPTH_TEXTURE = !1, ce.MAX_VERTEX_UNIFORMS = 0, ce.MAX_FRAGMENT_UNIFORMS = 0, ce.MAX_VERTEX_ATTRIBUTES = 0, ce.WEBGL_SUPPORTED = !1, ce.MAX_TEXTURE_SIZE = 0, ce.HARDWARE_INSTANCING = !1, ce.MRT_EXTENSION = !1, ce.MRT = !1, ce.MAX_COLOR_ATTACHMENTS = 0, ce.SHADERS_3_0 = !1, ce.WEBGL_VERSION = "none", ce.FLOAT_TEXTURE_READ = {
  half: !1,
  full: !1,
  halfLinearFilter: !1,
  fullLinearFilter: !1
}, ce.FLOAT_TEXTURE_WRITE = {
  half: !1,
  full: !1
}, ce.MSAA_MAX_SAMPLES = 0, ce.MAX_UNIFORM_BUFFER_BINDINGS = 0, ce.MAX_UNIFORM_BLOCK_SIZE = 0, ce.MAX_VERTEX_UNIFORM_BLOCKS = 0, ce.MAX_FRAGMENT_UNIFORM_BLOCKS = 0, ce.MAX_COMBINED_UNIFORM_BLOCKS = 0;
let O = ce;
function qu() {
  function i() {
    try {
      const s = document.createElement("canvas");
      let n;
      return n = s.getContext("webgl2"), n ? (O.WEBGL_VERSION = "webgl2", n) : (n = s.getContext("webgl"), n ? (O.WEBGL_VERSION = "webgl", n) : (n = s.getContext("experimental-webgl"), n ? (O.WEBGL_VERSION = "experimental-webgl", n) : null));
    } catch {
      return null;
    }
  }
  function e(s) {
    O.FLOAT_TEXTURE_READ.fullLinearFilter = !!s.getExtension("OES_texture_float_linear"), O.FLOAT_TEXTURE_READ.halfLinearFilter = !!s.getExtension("OES_texture_half_float_linear");
    const n = s.createTexture();
    if (s.bindTexture(s.TEXTURE_2D, n), s.texParameteri(s.TEXTURE_2D, s.TEXTURE_MIN_FILTER, s.NEAREST), s.texParameteri(s.TEXTURE_2D, s.TEXTURE_MAG_FILTER, s.NEAREST), s.texParameteri(s.TEXTURE_2D, s.TEXTURE_WRAP_S, s.CLAMP_TO_EDGE), s.texParameteri(s.TEXTURE_2D, s.TEXTURE_WRAP_T, s.CLAMP_TO_EDGE), s.getError() !== s.NO_ERROR)
      throw new Error("WebGLStat could not create a texture");
    const r = s.getExtension("OES_texture_float") || s.getExtension("EXT_color_buffer_float");
    if (s.getExtension("WEBGL_color_buffer_float"), r) {
      s.texImage2D(
        s.TEXTURE_2D,
        0,
        s instanceof WebGL2RenderingContext ? s.RGBA32F : s.RGBA,
        2,
        2,
        0,
        s.RGBA,
        s.FLOAT,
        null
      ), s.getError() === s.NO_ERROR && (O.FLOAT_TEXTURE_READ.full = !0);
      const u = s.createFramebuffer();
      s.bindFramebuffer(s.FRAMEBUFFER, u), s.framebufferTexture2D(
        s.FRAMEBUFFER,
        s.COLOR_ATTACHMENT0,
        s.TEXTURE_2D,
        n,
        0
      ), s.bindTexture(s.TEXTURE_2D, null), s.checkFramebufferStatus(s.FRAMEBUFFER) === s.FRAMEBUFFER_COMPLETE && (O.FLOAT_TEXTURE_WRITE.full = !0), s.deleteFramebuffer(u), s.deleteTexture(n);
    }
    const o = s.createTexture();
    if (s.bindTexture(s.TEXTURE_2D, o), s.texParameteri(s.TEXTURE_2D, s.TEXTURE_MIN_FILTER, s.NEAREST), s.texParameteri(s.TEXTURE_2D, s.TEXTURE_MAG_FILTER, s.NEAREST), s.texParameteri(s.TEXTURE_2D, s.TEXTURE_WRAP_S, s.CLAMP_TO_EDGE), s.texParameteri(s.TEXTURE_2D, s.TEXTURE_WRAP_T, s.CLAMP_TO_EDGE), s.getError() !== s.NO_ERROR)
      throw new Error("WebGLStat could not create a texture");
    const a = s.getExtension("OES_texture_half_float") || s.getExtension("EXT_color_buffer_float");
    if (a) {
      s.texImage2D(
        s.TEXTURE_2D,
        0,
        s instanceof WebGL2RenderingContext ? s.RGBA16F : s.RGBA,
        2,
        2,
        0,
        s.RGBA,
        s instanceof WebGL2RenderingContext ? s.HALF_FLOAT : a.HALF_FLOAT_OES,
        null
      ), s.getError() === s.NO_ERROR && (O.FLOAT_TEXTURE_READ.full = !0);
      const u = s.createFramebuffer();
      s.bindFramebuffer(s.FRAMEBUFFER, u), s.framebufferTexture2D(
        s.FRAMEBUFFER,
        s.COLOR_ATTACHMENT0,
        s.TEXTURE_2D,
        o,
        0
      ), s.bindTexture(s.TEXTURE_2D, null), s.checkFramebufferStatus(s.FRAMEBUFFER) === s.FRAMEBUFFER_COMPLETE && (O.FLOAT_TEXTURE_WRITE.full = !0), s.deleteFramebuffer(u), s.deleteTexture(o);
    }
  }
  const t = i();
  if (t)
    if (O.WEBGL_SUPPORTED = !0, O.MAX_VERTEX_UNIFORMS = t.getParameter(
      t.MAX_VERTEX_UNIFORM_VECTORS
    ), O.MAX_FRAGMENT_UNIFORMS = t.getParameter(
      t.MAX_FRAGMENT_UNIFORM_VECTORS
    ), O.MAX_VERTEX_ATTRIBUTES = t.getParameter(t.MAX_VERTEX_ATTRIBS), O.MAX_TEXTURE_SIZE = t.getParameter(t.MAX_TEXTURE_SIZE), e(t), t instanceof WebGL2RenderingContext)
      O.VAO = !0, O.MRT = !0, O.HARDWARE_INSTANCING = !0, O.SHADERS_3_0 = !0, O.HARDWARE_INSTANCING = !0, O.DEPTH_TEXTURE = !0, O.MSAA_MAX_SAMPLES = t.getParameter(t.MAX_SAMPLES), O.MAX_COLOR_ATTACHMENTS = t.getParameter(
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
      const s = t.getExtension("WEBGL_draw_buffers");
      O.MRT_EXTENSION = !!s, O.MRT = !!s, O.DEPTH_TEXTURE = !!t.getExtension("WEBGL_depth_texture"), s && (O.MAX_COLOR_ATTACHMENTS = t.getParameter(
        s.MAX_COLOR_ATTACHMENTS_WEBGL
      ));
    }
  window.WebGLStat = O;
}
qu();
function xs(i, e) {
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
function vs(i, e) {
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
          case x.Texture.TexelDataType.RED:
            return i.RED;
          case x.Texture.TexelDataType.RG:
            return i.RG;
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
function xn(i, e) {
  switch (e) {
    case x.Texture.SourcePixelFormat.Byte:
      return i.BYTE;
    case x.Texture.SourcePixelFormat.Float:
      return i.FLOAT;
    case x.Texture.SourcePixelFormat.HalfFloat:
      return i.FLOAT;
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
function ws(i, e) {
  switch (e) {
    case x.Texture.TextureMagFilter.Linear:
      return i.LINEAR;
    case x.Texture.TextureMagFilter.Nearest:
      return i.NEAREST;
  }
}
function Ci(i, e, t) {
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
function xa(i, e) {
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
          case x.RenderTarget.ColorBufferFormat.R16F:
            return i.R16F;
          case x.RenderTarget.ColorBufferFormat.RG16F:
            return i.RG16F;
          case x.RenderTarget.ColorBufferFormat.RGBA16F:
            return i.RGBA16F;
          case x.RenderTarget.ColorBufferFormat.RGBA32F:
            return i.RGBA32F;
          case x.RenderTarget.ColorBufferFormat.R32F:
            return i.R32F;
          case x.RenderTarget.ColorBufferFormat.RG32F:
            return i.RG32F;
          case x.RenderTarget.ColorBufferFormat.RGB32F:
            return i.RGB32F;
          case x.RenderTarget.ColorBufferFormat.RGB16F:
            return i.RGB16F;
          case x.RenderTarget.ColorBufferFormat.R11F_G11F_B10F:
            return i.R11F_G11F_B10F;
        }
      return i.RGBA4;
  }
}
function va(i, e) {
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
function Ku(i, e) {
  switch (e) {
    case x.RenderTarget.StencilBufferFormat.STENCIL_INDEX8:
      return i.STENCIL_INDEX8;
    default:
      return i.STENCIL_INDEX8;
  }
}
function wa(i, e) {
  switch (e) {
    case x.Texture.Wrapping.CLAMP_TO_EDGE:
      return i.CLAMP_TO_EDGE;
    case x.Texture.Wrapping.MIRRORED_REPEAT:
      return i.MIRRORED_REPEAT;
    case x.Texture.Wrapping.REPEAT:
      return i.REPEAT;
  }
}
function vn(i, e, t, s, n) {
  if (s)
    return i.COLOR_ATTACHMENT0;
  const r = e.drawBuffers;
  if (n) {
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
function Zu(i, e) {
  return i.TEXTURE0 + e;
}
function Ta(i, e) {
  return e - i.TEXTURE0;
}
function Ju(i) {
  return i && i.__esModule && Object.prototype.hasOwnProperty.call(i, "default") ? i.default : i;
}
var wn = { exports: {} }, Tn = { exports: {} }, Sr, Ea;
function eh() {
  if (Ea) return Sr;
  Ea = 1;
  var i = 1e3, e = i * 60, t = e * 60, s = t * 24, n = s * 365.25;
  Sr = function(l, u) {
    u = u || {};
    var h = typeof l;
    if (h === "string" && l.length > 0)
      return r(l);
    if (h === "number" && isNaN(l) === !1)
      return u.long ? a(l) : o(l);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(l)
    );
  };
  function r(l) {
    if (l = String(l), !(l.length > 100)) {
      var u = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
        l
      );
      if (u) {
        var h = parseFloat(u[1]), d = (u[2] || "ms").toLowerCase();
        switch (d) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return h * n;
          case "days":
          case "day":
          case "d":
            return h * s;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return h * t;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return h * e;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return h * i;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return h;
          default:
            return;
        }
      }
    }
  }
  function o(l) {
    return l >= s ? Math.round(l / s) + "d" : l >= t ? Math.round(l / t) + "h" : l >= e ? Math.round(l / e) + "m" : l >= i ? Math.round(l / i) + "s" : l + "ms";
  }
  function a(l) {
    return c(l, s, "day") || c(l, t, "hour") || c(l, e, "minute") || c(l, i, "second") || l + " ms";
  }
  function c(l, u, h) {
    if (!(l < u))
      return l < u * 1.5 ? Math.floor(l / u) + " " + h : Math.ceil(l / u) + " " + h + "s";
  }
  return Sr;
}
var ya;
function th() {
  return ya || (ya = 1, function(i, e) {
    e = i.exports = s.debug = s.default = s, e.coerce = c, e.disable = o, e.enable = r, e.enabled = a, e.humanize = eh(), e.instances = [], e.names = [], e.skips = [], e.formatters = {};
    function t(l) {
      var u = 0, h;
      for (h in l)
        u = (u << 5) - u + l.charCodeAt(h), u |= 0;
      return e.colors[Math.abs(u) % e.colors.length];
    }
    function s(l) {
      var u;
      function h() {
        if (h.enabled) {
          var d = h, f = +/* @__PURE__ */ new Date(), p = f - (u || f);
          d.diff = p, d.prev = u, d.curr = f, u = f;
          for (var g = new Array(arguments.length), m = 0; m < g.length; m++)
            g[m] = arguments[m];
          g[0] = e.coerce(g[0]), typeof g[0] != "string" && g.unshift("%O");
          var b = 0;
          g[0] = g[0].replace(/%([a-zA-Z%])/g, function(w, E) {
            if (w === "%%") return w;
            b++;
            var y = e.formatters[E];
            if (typeof y == "function") {
              var C = g[b];
              w = y.call(d, C), g.splice(b, 1), b--;
            }
            return w;
          }), e.formatArgs.call(d, g);
          var v = h.log || e.log || console.log.bind(console);
          v.apply(d, g);
        }
      }
      return h.namespace = l, h.enabled = e.enabled(l), h.useColors = e.useColors(), h.color = t(l), h.destroy = n, typeof e.init == "function" && e.init(h), e.instances.push(h), h;
    }
    function n() {
      var l = e.instances.indexOf(this);
      return l !== -1 ? (e.instances.splice(l, 1), !0) : !1;
    }
    function r(l) {
      e.save(l), e.names = [], e.skips = [];
      var u, h = (typeof l == "string" ? l : "").split(/[\s,]+/), d = h.length;
      for (u = 0; u < d; u++)
        h[u] && (l = h[u].replace(/\*/g, ".*?"), l[0] === "-" ? e.skips.push(new RegExp("^" + l.substr(1) + "$")) : e.names.push(new RegExp("^" + l + "$")));
      for (u = 0; u < e.instances.length; u++) {
        var f = e.instances[u];
        f.enabled = e.enabled(f.namespace);
      }
    }
    function o() {
      e.enable("");
    }
    function a(l) {
      if (l[l.length - 1] === "*")
        return !0;
      var u, h;
      for (u = 0, h = e.skips.length; u < h; u++)
        if (e.skips[u].test(l))
          return !1;
      for (u = 0, h = e.names.length; u < h; u++)
        if (e.names[u].test(l))
          return !0;
      return !1;
    }
    function c(l) {
      return l instanceof Error ? l.stack || l.message : l;
    }
  }(Tn, Tn.exports)), Tn.exports;
}
var Ra;
function ih() {
  return Ra || (Ra = 1, function(i, e) {
    e = i.exports = th(), e.log = n, e.formatArgs = s, e.save = r, e.load = o, e.useColors = t, e.storage = typeof chrome < "u" && typeof chrome.storage < "u" ? chrome.storage.local : a(), e.colors = [
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
    function s(c) {
      var l = this.useColors;
      if (c[0] = (l ? "%c" : "") + this.namespace + (l ? " %c" : " ") + c[0] + (l ? "%c " : " ") + "+" + e.humanize(this.diff), !!l) {
        var u = "color: " + this.color;
        c.splice(1, 0, u, "color: inherit");
        var h = 0, d = 0;
        c[0].replace(/%[a-zA-Z%]/g, function(f) {
          f !== "%%" && (h++, f === "%c" && (d = h));
        }), c.splice(d, 0, u);
      }
    }
    function n() {
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
  }(wn, wn.exports)), wn.exports;
}
var sh = ih();
const ve = /* @__PURE__ */ Ju(sh);
var Bc = /* @__PURE__ */ ((i) => (i[i.INVALID = 0] = "INVALID", i[i.ONE = 1] = "ONE", i[i.TWO = 2] = "TWO", i[i.THREE = 3] = "THREE", i[i.FOUR = 4] = "FOUR", i))(Bc || {}), S = /* @__PURE__ */ ((i) => (i[i.ONE = 1] = "ONE", i[i.TWO = 2] = "TWO", i[i.THREE = 3] = "THREE", i[i.FOUR = 4] = "FOUR", i[i.MAT4X4 = 16] = "MAT4X4", i[i.ATLAS = 99] = "ATLAS", i))(S || {});
const nh = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  16: 16,
  99: 4
};
var A = /* @__PURE__ */ ((i) => (i[i.ONE = 1] = "ONE", i[i.TWO = 2] = "TWO", i[i.THREE = 3] = "THREE", i[i.FOUR = 4] = "FOUR", i[i.MATRIX3 = 9] = "MATRIX3", i[i.MATRIX4 = 16] = "MATRIX4", i[i.FLOAT_ARRAY = 97] = "FLOAT_ARRAY", i[i.VEC4_ARRAY = 98] = "VEC4_ARRAY", i[i.TEXTURE = 99] = "TEXTURE", i))(A || {}), ke = /* @__PURE__ */ ((i) => (i[i.ONE = 1] = "ONE", i[i.TWO = 2] = "TWO", i[i.THREE = 3] = "THREE", i[i.FOUR = 4] = "FOUR", i))(ke || {}), Pn = /* @__PURE__ */ ((i) => (i[i.UINT8 = 1] = "UINT8", i[i.UINT16 = 2] = "UINT16", i[i.UINT32 = 3] = "UINT32", i))(Pn || {}), gt = /* @__PURE__ */ ((i) => (i[i.SCREEN_256TH = -256] = "SCREEN_256TH", i[i.SCREEN_128TH = -128] = "SCREEN_128TH", i[i.SCREEN_64TH = -64] = "SCREEN_64TH", i[i.SCREEN_32ND = -32] = "SCREEN_32ND", i[i.SCREEN_16TH = -16] = "SCREEN_16TH", i[i.SCREEN_8TH = -8] = "SCREEN_8TH", i[i.SCREEN_QUARTER = -4] = "SCREEN_QUARTER", i[i.SCREEN_HALF = -2] = "SCREEN_HALF", i[i.SCREEN = -1] = "SCREEN", i[i._2 = 2] = "_2", i[i._4 = 4] = "_4", i[i._8 = 8] = "_8", i[i._16 = 16] = "_16", i[i._32 = 32] = "_32", i[i._64 = 64] = "_64", i[i._128 = 128] = "_128", i[i._256 = 256] = "_256", i[i._512 = 512] = "_512", i[i._1024 = 1024] = "_1024", i[i._2048 = 2048] = "_2048", i[i._4096 = 4096] = "_4096", i))(gt || {}), oe = /* @__PURE__ */ ((i) => (i[i.ATLAS = 0] = "ATLAS", i[i.FONT = 1] = "FONT", i[i.TEXTURE = 2] = "TEXTURE", i[i.COLOR_BUFFER = 3] = "COLOR_BUFFER", i))(oe || {}), ie = /* @__PURE__ */ ((i) => (i[i.zyx = 0] = "zyx", i[i.zyz = 1] = "zyz", i[i.zxy = 2] = "zxy", i[i.zxz = 3] = "zxz", i[i.yxz = 4] = "yxz", i[i.yxy = 5] = "yxy", i[i.yzx = 6] = "yzx", i[i.yzy = 7] = "yzy", i[i.xyz = 8] = "xyz", i[i.xyx = 9] = "xyx", i[i.xzy = 10] = "xzy", i[i.xzx = 11] = "xzx", i))(ie || {});
function kb(i) {
  return i.size !== void 0 && i.size <= 4;
}
function Ub(i) {
  return !!(i && i.resource);
}
var _ = /* @__PURE__ */ ((i) => (i[i.VERTEX = 1] = "VERTEX", i[i.FRAGMENT = 2] = "FRAGMENT", i[i.ALL = 3] = "ALL", i))(_ || {});
function Eo() {
}
const zb = /\s/g, Aa = /\s/, Ss = Aa.test.bind(Aa), rh = /\n\r|\n|\r/g, _a = /\n\r|\n|\r/, Gb = _a.test.bind(_a);
function Vb(i) {
  return i;
}
var X = /* @__PURE__ */ ((i) => (i[i.NONE = 0] = "NONE", i[i.SINGLE = 1] = "SINGLE", i))(X || {}), me = /* @__PURE__ */ ((i) => (i[i.CHANGE = 0] = "CHANGE", i[i.INSERT = 1] = "INSERT", i[i.REMOVE = 2] = "REMOVE", i))(me || {}), Pc = /* @__PURE__ */ ((i) => (i[i.NO_WEBGL_CONTEXT = 0] = "NO_WEBGL_CONTEXT", i))(Pc || {}), se = /* @__PURE__ */ ((i) => (i[i.UNIFORM = 1] = "UNIFORM", i[i.INSTANCE_ATTRIBUTE = 2] = "INSTANCE_ATTRIBUTE", i[i.INSTANCE_ATTRIBUTE_PACKING = 3] = "INSTANCE_ATTRIBUTE_PACKING", i[i.VERTEX_ATTRIBUTE = 4] = "VERTEX_ATTRIBUTE", i[i.VERTEX_ATTRIBUTE_PACKING = 5] = "VERTEX_ATTRIBUTE_PACKING", i))(se || {}), Wr = /* @__PURE__ */ ((i) => (i[i.LINEAR = 0] = "LINEAR", i))(Wr || {});
function kt(i) {
  return i !== void 0 && i.charCodeAt !== void 0;
}
function Fc(i) {
  return i !== void 0 && i.toExponential !== void 0;
}
function $b(i) {
  return i !== void 0 && i.call !== void 0 && i.apply !== void 0;
}
function Yi(i) {
  return i === !0 || i === !1;
}
var G = /* @__PURE__ */ ((i) => (i[i.NONE = 0] = "NONE", i[i.BLANK = 1] = "BLANK", i[i.COLOR = 2] = "COLOR", i[i.DEPTH = 3] = "DEPTH", i[i.NORMAL = 4] = "NORMAL", i[i.PICKING = 5] = "PICKING", i[i.POSITION = 6] = "POSITION", i[i.POSITION_X = 7] = "POSITION_X", i[i.POSITION_Y = 8] = "POSITION_Y", i[i.POSITION_Z = 9] = "POSITION_Z", i[i.LIGHTS = 10] = "LIGHTS", i[i.LIGHTS2 = 11] = "LIGHTS2", i[i.LIGHTS3 = 12] = "LIGHTS3", i[i.ALPHA = 13] = "ALPHA", i[i.OPAQUE = 14] = "OPAQUE", i[i.BETA = 15] = "BETA", i[i.GAMMA = 16] = "GAMMA", i[i.DELTA = 17] = "DELTA", i[i.ACCUMULATION1 = 18] = "ACCUMULATION1", i[i.ACCUMULATION2 = 19] = "ACCUMULATION2", i[i.ACCUMULATION3 = 20] = "ACCUMULATION3", i[i.ACCUMULATION4 = 21] = "ACCUMULATION4", i[i.COEFFICIENT1 = 22] = "COEFFICIENT1", i[i.COEFFICIENT2 = 23] = "COEFFICIENT2", i[i.COEFFICIENT3 = 24] = "COEFFICIENT3", i[i.COEFFICIENT4 = 25] = "COEFFICIENT4", i[i.ANGLE1 = 26] = "ANGLE1", i[i.ANGLE2 = 27] = "ANGLE2", i[i.ANGLE3 = 28] = "ANGLE3", i[i.ANGLE4 = 29] = "ANGLE4", i[i.COLOR2 = 30] = "COLOR2", i[i.COLOR3 = 31] = "COLOR3", i[i.COLOR4 = 32] = "COLOR4", i[i.GLOW = 33] = "GLOW", i[i.BLUR = 34] = "BLUR", i))(G || {});
function ne(i) {
  return i != null;
}
function oh(i) {
  return Array.isArray(i) ? (e) => i.indexOf(e.start.view.id) >= 0 : (e) => e.start.view.id === i;
}
function ah(i) {
  return Array.isArray(i) ? (e) => e.start.views.find((t) => i.indexOf(t.view.id) >= 0) : (e) => e.start.views.find((t) => t.view.id === i);
}
let ch = 1;
function P() {
  return ++ch;
}
let lh = 0;
function Wb() {
  return ++lh % 16777215;
}
class ft {
  /**
   * Default ctor
   */
  constructor(e) {
    this._uid = P(), this._destroyed = !1, this._internalFormat = x.RenderTarget.ColorBufferFormat.RGBA8, this.needsSettingsUpdate = !1, this._size = [0, 0], this._multiSample = 0, this.size = e.size || this.size, this.internalFormat = e.internalFormat ?? this.internalFormat, this.multiSample = e.multiSample ?? this.multiSample;
  }
  /**
   * A unique identifier of this object.
   */
  get uid() {
    return this._uid;
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
  get multiSample() {
    return this._multiSample;
  }
  set multiSample(e) {
    this.needsSettingsUpdate = !0, this._multiSample = Math.min(O.MSAA_MAX_SAMPLES, e);
  }
  /**
   * Destroys and frees the resources this buffer utilizes in the gl context.
   * This also invalidates this as a viable resource permanently.
   */
  destroy() {
    this.gl && this.gl.proxy.disposeColorBuffer(this), this._destroyed = !0;
  }
}
class W {
  constructor(e) {
    this._uid = P(), this._destroyed = !1, this._flipY = !1, this._format = x.Texture.TexelDataType.RGBA, this._generateMipmaps = !1, this._internalFormat = x.Texture.TexelDataType.RGBA, this._magFilter = x.Texture.TextureMagFilter.Linear, this._minFilter = x.Texture.TextureMinFilter.LinearMipMapLinear, this.needsDataUpload = !1, this.needsPartialDataUpload = !1, this.needsSettingsUpdate = !1, this._packAlignment = x.Texture.PackAlignment.FOUR, this._premultiplyAlpha = !1, this._type = x.Texture.SourcePixelFormat.UnsignedByte, this._unpackAlignment = x.Texture.UnpackAlignment.FOUR, this._updateRegions = [], this._wrapHorizontal = x.Texture.Wrapping.CLAMP_TO_EDGE, this._wrapVertical = x.Texture.Wrapping.CLAMP_TO_EDGE, this.anisotropy = e.anisotropy || this.anisotropy, this.data = e.data || this.data, this.flipY = e.flipY || this.flipY, this.format = e.format || this.format, this.internalFormat = e.internalFormat || this.format, this.generateMipMaps = e.generateMipMaps || this.generateMipMaps, this.magFilter = e.magFilter || this.magFilter, this.minFilter = e.minFilter || this.minFilter, this.packAlignment = e.packAlignment || this.packAlignment, this.premultiplyAlpha = e.premultiplyAlpha || this.premultiplyAlpha, this.type = e.type || this.type, this.unpackAlignment = e.unpackAlignment || this.unpackAlignment, this.wrapHorizontal = e.wrapHorizontal || this.wrapHorizontal, this.wrapVertical = e.wrapVertical || this.wrapVertical;
  }
  /**
   * Empty texture object to help resolve ambiguous texture values.
   */
  static get emptyTexture() {
    return uh;
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
   * Tells the input packing to premultiply the alpha values with the other
   * channels as the texture is generated. See:
   *
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
   * These are the regions that have been requested to be applied to the Texture
   * along with the data that should be buffered into that region.
   */
  get updateRegions() {
    return this._updateRegions;
  }
  /**
   * Specifies sample wrapping for when samples fall outside the 0 - 1 range
   * See:
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
   */
  get wrapHorizontal() {
    return this._wrapHorizontal;
  }
  set wrapHorizontal(e) {
    this.needsSettingsUpdate = !0, this._wrapHorizontal = e;
  }
  /**
   * Specifies sample wrapping for when samples fall outside the 0 - 1 range.
   * See:
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
   * Apply a new settings object to the texture which will trigger updates to
   * the texture.
   */
  applySettings(e) {
    e.anisotropy !== void 0 && e.anisotropy !== this.anisotropy && (this.anisotropy = e.anisotropy), e.data !== void 0 && e.data !== this.data && (this.data = e.data), e.flipY !== void 0 && e.flipY !== this.flipY && (this.flipY = e.flipY), e.format !== void 0 && e.format !== this.format && (this.format = e.format), e.internalFormat !== void 0 && e.internalFormat !== this.internalFormat && (this.internalFormat = e.internalFormat), e.generateMipMaps !== void 0 && e.generateMipMaps !== this.generateMipMaps && (this.generateMipMaps = e.generateMipMaps), e.magFilter !== void 0 && e.magFilter !== this.magFilter && (this.magFilter = e.magFilter), e.minFilter !== void 0 && e.minFilter !== this.minFilter && (this.minFilter = e.minFilter), e.packAlignment !== void 0 && e.packAlignment !== this.packAlignment && (this.packAlignment = e.packAlignment), e.premultiplyAlpha !== void 0 && e.premultiplyAlpha !== this.premultiplyAlpha && (this.premultiplyAlpha = e.premultiplyAlpha), e.type !== void 0 && e.type !== this.type && (this.type = e.type), e.unpackAlignment !== void 0 && e.unpackAlignment !== this.unpackAlignment && (this.unpackAlignment = e.unpackAlignment), e.wrapHorizontal !== void 0 && e.wrapHorizontal !== this.wrapHorizontal && (this.wrapHorizontal = e.wrapHorizontal), e.wrapVertical !== void 0 && e.wrapVertical !== this.wrapVertical && (this.wrapVertical = e.wrapVertical);
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
const uh = new W({
  data: {
    width: 2,
    height: 2,
    buffer: new Uint8Array(16)
  }
}), jt = ve("performance");
function Ia(i) {
  return i && i.buffer && i.buffer.byteOffset !== void 0 && i.buffer.byteLength || i.buffer === null;
}
function Ts(i) {
  return (i & i - 1) === 0;
}
function qi(i) {
  return !!(i.gl && i.gl.textureId && i.gl.textureUnit > -1);
}
class Xn {
  constructor(e, t, s) {
    this.debugContext = "", this.fragmentShaders = /* @__PURE__ */ new Map(), this.vertexShaders = /* @__PURE__ */ new Map(), this.programs = /* @__PURE__ */ new Map(), this.gl = e, this.state = t, this.extensions = s;
  }
  /**
   * This enables the desired and supported extensions this framework utilizes.
   */
  static addExtensions(e) {
    const t = e.getExtension("ANGLE_instanced_arrays"), s = e.getExtension("WEBGL_draw_buffers"), n = e.getExtension("OES_texture_float"), r = e.getExtension("OES_texture_float_linear"), o = e.getExtension("OES_texture_half_float"), a = e.getExtension(
      "OES_texture_half_float_linear"
    ), c = e.getExtension(
      "EXT_texture_filter_anisotropic"
    ), l = e.getExtension("EXT_color_buffer_float"), u = e.getExtension("OES_vertex_array_object"), h = e.getExtension("EXT_color_buffer_float"), d = e.getExtension(
      "EXT_color_buffer_half_float"
    ), f = {
      maxAnistropicFilter: 0
    };
    return !t && !(e instanceof WebGL2RenderingContext) && jt(
      "This device does not have hardware instancing. All buffering strategies will be utilizing compatibility modes."
    ), !s && !(e instanceof WebGL2RenderingContext) && jt(
      "This device does not have hardware multi-render target capabilities. The system will have to fallback to multiple render passes to multiple FBOs to achieve the same result."
    ), c ? f.maxAnistropicFilter = e.getParameter(
      c.MAX_TEXTURE_MAX_ANISOTROPY_EXT
    ) : jt(
      "This device does not have hardware anisotropic filtering for textures. This property will be ignored when setting texture settings."
    ), !u && !(e instanceof WebGL2RenderingContext) && jt(
      "This device does not support Vertex Array Objects. This could cause performance issues for high numbers of draw calls."
    ), {
      instancing: (e instanceof WebGL2RenderingContext ? e : t) ?? void 0,
      drawBuffers: (e instanceof WebGL2RenderingContext ? e : s) ?? void 0,
      anisotropicFiltering: c ? {
        ext: c,
        stat: f
      } : void 0,
      renderFloatTexture: l ?? void 0,
      floatTex: (e instanceof WebGL2RenderingContext ? e : n) ?? void 0,
      floatTexFilterLinear: (e instanceof WebGL2RenderingContext ? e : r) ?? void 0,
      halfFloatTex: (e instanceof WebGL2RenderingContext ? e : o) ?? void 0,
      halfFloatTexFilterLinear: (e instanceof WebGL2RenderingContext ? e : a) ?? void 0,
      vao: (e instanceof WebGL2RenderingContext ? e : u) ?? void 0,
      floatRenderTarget: h ?? void 0,
      halfFloatRenderTarget: d ?? void 0
    };
  }
  /**
   * Clears the specified buffers
   */
  clear(e, t, s) {
    let n = 0;
    e && (n = n | this.gl.COLOR_BUFFER_BIT), t && (n = n | this.gl.DEPTH_BUFFER_BIT), s && (n = n | this.gl.STENCIL_BUFFER_BIT), this.gl.clear(n);
  }
  /**
   * Takes an Attribute object and ensures it's buffer is created and
   * initialized.
   */
  compileAttribute(e) {
    if (e.gl) return !0;
    const t = this.gl, s = t.createBuffer();
    return s ? (this.state.bindVBO(s), t.bufferData(
      t.ARRAY_BUFFER,
      e.data,
      e.isDynamic ? t.DYNAMIC_DRAW : t.STATIC_DRAW
    ), e.gl = {
      bufferId: s,
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
    const t = this.gl, s = t.createBuffer();
    if (!s) {
      console.warn(
        this.debugContext,
        "Could not create WebGLBuffer. Printing any existing gl errors:"
      ), this.printError();
      return;
    }
    return this.state.bindElementArrayBuffer(s), t.bufferData(
      t.ELEMENT_ARRAY_BUFFER,
      e.data,
      e.isDynamic ? t.DYNAMIC_DRAW : t.STATIC_DRAW
    ), e.gl = {
      bufferId: s,
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
      let s;
      this.extensions.vao instanceof WebGL2RenderingContext ? s = this.extensions.vao.createVertexArray() : s = this.extensions.vao.createVertexArrayOES(), s ? (this.state.disableVertexAttributeArray(), this.state.bindVAO(s), e.attributes.forEach((n, r) => {
        this.updateAttribute(n) && this.useAttribute(r, n, e);
      }), e.indexBuffer && this.updateIndexBuffer(e.indexBuffer) && this.useIndexBuffer(e.indexBuffer), e.gl.vao = s, this.state.bindVAO(null)) : jt(
        "WARNING: Could not make VAO for Geometry. This is fine, but this could cause a hit on performance."
      );
    } else
      e.attributes.forEach((s) => {
        t = !!(this.compileAttribute(s) && t);
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
    let s = this.programs.get(t);
    s || (s = /* @__PURE__ */ new Map(), this.programs.set(t, s));
    const n = {
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
      if (!s || !t) return;
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
      let l = s.get(c) || null;
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
        s.set(c, l);
      }
      (d = n.fsId) == null || d.push({
        id: c,
        outputTypes: a.outputTypes
      }), (f = n.programId) == null || f.push({
        id: l.program,
        outputTypes: a.outputTypes
      }), n.outputsByProgram.set(
        l.program,
        a.outputTypes
      ), this.state.useProgram(l.program);
      const u = this.state.currentProgram;
      if (!u) return !1;
      const h = this.gl.getProgramParameter(
        u,
        this.gl.ACTIVE_UNIFORMS
      );
      for (let p = 0; p < h; p++) {
        const g = this.gl.getActiveUniform(u, p);
        g && r.add(g.name.replace("[0]", ""));
      }
    }), e.gl = n;
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
    var l;
    if (e.isInvalid) return !1;
    if (e.gl) return !0;
    const t = this.gl, s = t.createFramebuffer();
    if (!s)
      return console.warn(
        this.debugContext,
        "Could not generate a frame buffer object. Printing GL errors:"
      ), this.printError(), !1;
    this.state.bindFBO(s);
    const n = {
      fboId: s,
      proxy: this,
      fboByMaterial: /* @__PURE__ */ new WeakMap(),
      outputTypeToAttachment: /* @__PURE__ */ new Map()
    };
    if (Array.isArray(e.buffers.color)) {
      if (!this.extensions.drawBuffers)
        return console.warn(
          "Attempted to manage a render target with MRT but the hardware does not support MRT. Use multiple render targets instead."
        ), !1;
      const u = [];
      let h = !0;
      n.colorBufferId = u;
      const d = e.buffers.color.length <= 1;
      if (e.buffers.color.forEach((f, p) => {
        var g;
        if (h)
          if (f.buffer instanceof W) {
            const m = vn(
              t,
              this.extensions,
              p,
              d,
              !1
            );
            u.push({
              data: f.buffer,
              outputType: f.outputType,
              attachment: m
            }), n.outputTypeToAttachment.set(
              f.outputType,
              m
            ), qi(f.buffer) ? t.framebufferTexture2D(
              t.FRAMEBUFFER,
              m,
              t.TEXTURE_2D,
              f.buffer.gl.textureId,
              0
            ) : (console.warn(
              this.debugContext,
              "Attempted to compile render target whose target texture was not ready for use."
            ), h = !1);
          } else {
            const m = ((g = f.buffer.gl) == null ? void 0 : g.bufferId) ?? this.compileColorBuffer(
              f.buffer,
              e.width,
              e.height,
              f.buffer.multiSample
            );
            if (m) {
              const b = vn(
                t,
                this.extensions,
                p,
                d,
                !1
              );
              u.push({
                data: m,
                outputType: f.outputType,
                attachment: b
              }), n.outputTypeToAttachment.set(
                f.outputType,
                b
              ), t.framebufferRenderbuffer(
                t.FRAMEBUFFER,
                b,
                t.RENDERBUFFER,
                m
              );
            }
          }
      }), !h)
        return !1;
    } else if (e.buffers.color !== void 0) {
      const u = e.buffers.color;
      if (u.buffer instanceof W) {
        const h = vn(
          t,
          this.extensions,
          0,
          !0,
          !1
        );
        if (n.colorBufferId = {
          data: u.buffer,
          outputType: u.outputType,
          attachment: h
        }, n.outputTypeToAttachment.set(
          u.outputType,
          h
        ), qi(u.buffer))
          t.framebufferTexture2D(
            t.FRAMEBUFFER,
            h,
            t.TEXTURE_2D,
            u.buffer.gl.textureId,
            0
          );
        else
          return console.warn(
            this.debugContext,
            "Attempted to compile render target whose target texture was not ready for use."
          ), !1;
      } else {
        const h = ((l = u.buffer.gl) == null ? void 0 : l.bufferId) ?? this.compileColorBuffer(
          u.buffer,
          e.width,
          e.height,
          u.buffer.multiSample
        );
        if (h) {
          const d = vn(
            t,
            this.extensions,
            0,
            !0,
            !1
          );
          n.colorBufferId = {
            data: h,
            outputType: u.outputType,
            attachment: d
          }, n.outputTypeToAttachment.set(
            u.outputType,
            d
          ), t.framebufferRenderbuffer(
            t.FRAMEBUFFER,
            d,
            t.RENDERBUFFER,
            h
          );
        }
      }
    }
    if (e.buffers.depth !== void 0) {
      const u = e.buffers.depth;
      if (u instanceof W)
        n.depthBufferId = u, qi(u) && t.framebufferTexture2D(
          t.FRAMEBUFFER,
          t.DEPTH_ATTACHMENT,
          t.TEXTURE_2D,
          u.gl.textureId,
          0
        );
      else if (u instanceof ft) {
        const h = this.compileDepthBuffer(
          u,
          e.width,
          e.height,
          u.multiSample
        );
        h && (n.depthBufferId = h, t.framebufferRenderbuffer(
          t.FRAMEBUFFER,
          t.DEPTH_ATTACHMENT,
          t.RENDERBUFFER,
          h
        ));
      } else {
        const h = this.compileDepthBuffer(
          u,
          e.width,
          e.height,
          0
        );
        h && (n.depthBufferId = h, t.framebufferRenderbuffer(
          t.FRAMEBUFFER,
          t.DEPTH_ATTACHMENT,
          t.RENDERBUFFER,
          h
        ));
      }
    }
    if (e.buffers.stencil !== void 0) {
      const u = e.buffers.stencil;
      if (u instanceof W)
        n.stencilBufferId = u, qi(u) && t.framebufferTexture2D(
          t.FRAMEBUFFER,
          t.STENCIL_ATTACHMENT,
          t.TEXTURE_2D,
          u.gl.textureId,
          0
        );
      else {
        const h = this.compileStencilBuffer(
          u,
          e.width,
          e.height
        );
        h && (n.stencilBufferId = h, t.framebufferRenderbuffer(
          t.FRAMEBUFFER,
          t.STENCIL_ATTACHMENT,
          t.RENDERBUFFER,
          h
        ));
      }
    }
    e.gl = n;
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
    ), console.warn(c), this.printError(), console.warn("FAILED RENDER TARGET:", e), delete e.gl, e.isInvalid = !0, !1) : !!this.compileBlitTargets(e);
  }
  /**
   * After the render targets have been compiled, we need to check to see if any
   * of those targets are flagged for blitting. If so, we need to make sure the
   * blit targets are prepared for use by establishing their own framebuffers as
   * necessary.
   */
  compileBlitTargets(e) {
    var r, o, a, c, l;
    const t = this.gl;
    if (!e.buffers.blit || !e.gl || (r = e.gl) != null && r.blitFboId) return;
    const s = t.createFramebuffer(), n = e.gl.outputTypeToAttachment;
    if (!s) {
      console.warn(this.debugContext, "Could not create blit FBO");
      return;
    }
    if (this.state.bindFBO(s), (o = e.buffers.blit) != null && o.color)
      if (Array.isArray(e.buffers.blit.color))
        e.buffers.blit.color.forEach((u) => {
          const h = n.get(u.outputType);
          if (h === void 0) {
            console.warn(
              "A blit output could not be mapped to an attachment point."
            );
            return;
          }
          if (u.buffer instanceof W)
            if (qi(u.buffer))
              t.framebufferTexture2D(
                t.FRAMEBUFFER,
                h,
                t.TEXTURE_2D,
                u.buffer.gl.textureId,
                0
              );
            else
              return console.warn(
                this.debugContext,
                "Attempted to compile render target whose target blit texture was not ready for use."
              ), !1;
          else {
            const d = this.compileColorBuffer(
              u.buffer,
              e.width,
              e.height,
              0
            );
            d && t.framebufferRenderbuffer(
              t.FRAMEBUFFER,
              h,
              t.RENDERBUFFER,
              d
            );
          }
        });
      else {
        const u = e.buffers.blit.color, h = n.get(u.outputType);
        if (h === void 0) {
          console.warn(
            "A blit output could not be mapped to an attachment point."
          );
          return;
        }
        if (u.buffer instanceof W)
          if (qi(u.buffer))
            t.framebufferTexture2D(
              t.FRAMEBUFFER,
              h,
              t.TEXTURE_2D,
              u.buffer.gl.textureId,
              0
            );
          else
            return console.warn(
              this.debugContext,
              "Attempted to compile render target whose target blit texture was not ready for use."
            ), !1;
        else {
          const d = this.compileColorBuffer(
            u.buffer,
            e.width,
            e.height,
            0
          );
          d && t.framebufferRenderbuffer(
            t.FRAMEBUFFER,
            h,
            t.RENDERBUFFER,
            d
          );
        }
      }
    if ((a = e.buffers.blit) != null && a.depth)
      if (e.buffers.blit.depth instanceof W)
        if (qi(e.buffers.blit.depth))
          t.framebufferTexture2D(
            t.FRAMEBUFFER,
            t.DEPTH_ATTACHMENT,
            t.TEXTURE_2D,
            e.buffers.blit.depth.gl.textureId,
            0
          );
        else
          return console.warn(
            this.debugContext,
            "Attempted to compile render target whose target depth blit texture was not ready for use."
          ), !1;
      else {
        const u = this.compileDepthBuffer(
          e.buffers.blit.depth,
          e.width,
          e.height,
          0
        );
        u && t.framebufferRenderbuffer(
          t.FRAMEBUFFER,
          t.DEPTH_ATTACHMENT,
          t.RENDERBUFFER,
          u
        );
      }
    return (c = e.gl) != null && c.fboId && this.state.bindFBO((l = e.gl) == null ? void 0 : l.fboId), e.gl.blitFboId = s, !0;
  }
  /**
   * Produces a render buffer object intended for a render target for the depth buffer attachment
   */
  compileDepthBuffer(e, t, s, n) {
    var c;
    let r;
    if (e instanceof ft) {
      if ((c = e.gl) != null && c.bufferId)
        return e.gl.bufferId;
      r = e.internalFormat;
    } else
      r = e;
    const o = this.gl, a = o.createRenderbuffer();
    if (!a) {
      console.warn(
        this.debugContext,
        "Could not generate a WebGLRenderBuffer. Printing GL Errors:"
      ), this.printError();
      return;
    }
    return this.state.bindRBO(a), o instanceof WebGL2RenderingContext && n > 0 ? o.renderbufferStorageMultisample(
      o.RENDERBUFFER,
      n,
      va(o, r),
      t,
      s
    ) : o.renderbufferStorage(
      o.RENDERBUFFER,
      va(o, r),
      t,
      s
    ), e instanceof ft && (e.gl = {
      bufferId: a,
      proxy: this
    }), a;
  }
  /**
   * Produces a render buffer object intended for a render target for the stencil buffer attachment
   */
  compileStencilBuffer(e, t, s) {
    const n = this.gl, r = n.createRenderbuffer();
    if (!r) {
      console.warn(
        this.debugContext,
        "Could not generate a WebGLRenderBuffer. Printing GL Errors:"
      ), this.printError();
      return;
    }
    return this.state.bindRBO(r), n.renderbufferStorage(
      n.RENDERBUFFER,
      Ku(n, e),
      t,
      s
    ), r;
  }
  /**
   * Produces a render buffer object intended for a render target for the color
   * buffer attachment
   */
  compileColorBuffer(e, t, s, n) {
    const r = this.gl, o = r.createRenderbuffer();
    if (!o) {
      console.warn(
        this.debugContext,
        "Could not generate a WebGLRenderBuffer. Printing GL Errors:"
      ), this.printError();
      return;
    }
    return this.state.bindRBO(o), r instanceof WebGL2RenderingContext && n > 0 ? r.renderbufferStorageMultisample(
      r.RENDERBUFFER,
      e.multiSample,
      xa(r, e.internalFormat),
      t,
      s
    ) : r.renderbufferStorage(
      r.RENDERBUFFER,
      xa(r, e.internalFormat),
      t,
      s
    ), e.gl = {
      bufferId: o,
      proxy: this
    }, o;
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
    const s = this.gl.createTexture();
    if (!s) {
      console.warn(
        this.debugContext,
        "Could not generate a texture object on the GPU. Printing any gl errors:"
      ), this.printError();
      return;
    }
    return e.gl.textureId = s, e.needsDataUpload = !0, e.needsSettingsUpdate = !0, this.updateTextureData(e), this.updateTextureSettings(e), !0;
  }
  /**
   * Executes the draw operation for a given model
   */
  draw(e) {
    var n, r, o;
    let t, s = [0, 0];
    e.vertexDrawRange && e.vertexDrawRange[0] >= 0 && e.vertexDrawRange[1] >= 0 ? s = [
      e.vertexDrawRange[0],
      e.vertexDrawRange[1] - e.vertexDrawRange[0]
    ] : s = [0, e.vertexCount], e.drawInstances >= 0 && e.geometry.isInstanced && (t = this.extensions.instancing), !((O.MRT || O.MRT_EXTENSION) && this.state.renderTarget && !this.state.drawBuffers.find((a) => a !== this.gl.NONE)) && (t && t instanceof WebGL2RenderingContext ? e.geometry.indexBuffer ? t.drawElementsInstanced(
      xs(this.gl, e.drawMode),
      s[1],
      ((n = e.geometry.indexBuffer.gl) == null ? void 0 : n.indexType) ?? this.gl.UNSIGNED_INT,
      0,
      e.drawInstances
    ) : t.drawArraysInstanced(
      xs(this.gl, e.drawMode),
      s[0],
      s[1],
      e.drawInstances
    ) : t ? e.geometry.indexBuffer ? t.drawElementsInstancedANGLE(
      xs(this.gl, e.drawMode),
      s[1],
      ((r = e.geometry.indexBuffer.gl) == null ? void 0 : r.indexType) ?? this.gl.UNSIGNED_INT,
      0,
      e.drawInstances
    ) : t.drawArraysInstancedANGLE(
      xs(this.gl, e.drawMode),
      s[0],
      s[1],
      e.drawInstances
    ) : e.geometry.indexBuffer ? this.gl.drawElements(
      xs(this.gl, e.drawMode),
      s[1],
      ((o = e.geometry.indexBuffer.gl) == null ? void 0 : o.indexType) ?? this.gl.UNSIGNED_INT,
      0
    ) : this.gl.drawArrays(
      xs(this.gl, e.drawMode),
      s[0],
      s[1]
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
      const { vsId: t, fsId: s, programId: n } = e.gl;
      let r = this.programs.get(t);
      r || (r = /* @__PURE__ */ new Map(), this.gl.deleteShader(t));
      for (let o = 0, a = s.length; o < a; ++o) {
        const c = s[o];
        let l = r.get(c.id);
        l || (l = {
          useCount: 0,
          program: n[o].id
        }), l.useCount--, l.useCount < 1 && (this.gl.deleteProgram(l.program), r.delete(c.id), r.size <= 0 && this.gl.deleteShader(t));
        let u = !1;
        this.programs.forEach((h) => {
          h.has(c.id) && (u = !0);
        }), u || this.gl.deleteShader(c.id);
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
    if (e.gl) {
      if (Array.isArray(e.gl.colorBufferId) ? e.gl.colorBufferId.forEach((t) => {
        t.data instanceof W && !e.retainTextureTargets ? this.disposeTexture(t.data) : t.data instanceof WebGLRenderbuffer && this.disposeRenderBuffer(t.data);
      }) : e.gl.colorBufferId && e.gl.colorBufferId.data instanceof W && !e.retainTextureTargets ? this.disposeTexture(e.gl.colorBufferId.data) : e.gl.colorBufferId instanceof WebGLRenderbuffer && this.disposeRenderBuffer(e.gl.colorBufferId.data), e.gl.depthBufferId instanceof W && !e.retainTextureTargets ? this.disposeTexture(e.gl.depthBufferId) : e.gl.depthBufferId instanceof WebGLRenderbuffer && this.disposeRenderBuffer(e.gl.depthBufferId), e.gl.stencilBufferId instanceof W && !e.retainTextureTargets ? this.disposeTexture(e.gl.stencilBufferId) : e.gl.stencilBufferId instanceof WebGLRenderbuffer && this.disposeRenderBuffer(e.gl.stencilBufferId), e.buffers.blit && !e.retainTextureTargets) {
        if (e.buffers.blit.color)
          if (Array.isArray(e.buffers.blit.color))
            e.buffers.blit.color.forEach((t) => {
              t.buffer instanceof W ? this.disposeTexture(t.buffer) : t.buffer instanceof WebGLRenderbuffer && this.disposeRenderBuffer(t.buffer);
            });
          else {
            const t = e.buffers.blit.color;
            t.buffer instanceof W ? this.disposeTexture(t.buffer) : t.buffer instanceof WebGLRenderbuffer && this.disposeRenderBuffer(t.buffer);
          }
        e.buffers.blit.depth && e.buffers.blit.depth instanceof W && this.disposeTexture(e.buffers.blit.depth);
      }
      this.gl.deleteFramebuffer(e.gl.fboId), e.gl.blitFboId && this.gl.deleteFramebuffer(e.gl.blitFboId), delete e.gl;
    }
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
    const s = [
      O.WEBGL_VERSION,
      "webgl",
      "webgl2",
      "experimental-webgl"
    ];
    let n = null, r = {};
    for (let o = 0; o < s.length; ++o) {
      const a = s[o], c = e.getContext(a, t);
      if (c && (c instanceof WebGLRenderingContext || c instanceof WebGL2RenderingContext)) {
        jt(
          "Generated GL Context of version with attributes:",
          a,
          t
        ), n = c, r = Xn.addExtensions(n);
        break;
      }
    }
    return {
      context: n,
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
`), s = String(t.length).length + 1;
    return `
${t.map(
      (n, r) => `${Array(s - String(r + 1).length).join(" ")}${r + 1}: ${n}`
    ).join(`
`)}`;
  }
  /**
   * Prints a shader broken down by lines
   */
  lineFormatShader(e) {
    return e ? kt(e) ? this.lineFormat(e) : e.forEach(
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
      if (Ia(e.data)) {
        (!Ts(e.data.width) || !Ts(e.data.height)) && jt("Created a texture that is not using power of 2 dimensions.");
        const s = vs(t, e.internalFormat), n = vs(t, e.format);
        t instanceof WebGLRenderingContext && s !== n && console.warn(
          "WebGL 1 requires format and data format to be identical"
        ), t.texImage2D(
          t.TEXTURE_2D,
          0,
          s,
          e.data.width,
          e.data.height,
          0,
          n,
          xn(t, e.type),
          e.data.buffer
        );
      } else e.data && ((!Ts(e.data.width) || !Ts(e.data.height)) && jt(
        "Created a texture that is not using power of 2 dimensions. %o",
        e
      ), t.texImage2D(
        t.TEXTURE_2D,
        0,
        vs(t, e.internalFormat),
        vs(t, e.format),
        xn(t, e.type),
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
    ), e.updateRegions.forEach((s) => {
      const n = s[0], r = s[1];
      (t instanceof WebGLRenderingContext || t instanceof WebGL2RenderingContext) && (Ia(n) ? t.texSubImage2D(
        t.TEXTURE_2D,
        0,
        r.x,
        r.y,
        n.width,
        n.height,
        vs(t, e.format),
        xn(t, e.type),
        n.buffer
      ) : n && t.texSubImage2D(
        t.TEXTURE_2D,
        0,
        r.x,
        r.y,
        vs(t, e.format),
        xn(t, e.type),
        n
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
    const t = Ts(e.data.width) && Ts(e.data.height), s = this.gl;
    this.state.setActiveTextureUnit(e.gl.textureUnit), this.state.bindTexture(
      e,
      x.Texture.TextureBindingTarget.TEXTURE_2D
    );
    let n, r;
    if (e.isHalfFloatTexture)
      if (O.FLOAT_TEXTURE_READ.halfLinearFilter)
        switch (n = ws(s, e.magFilter), e.minFilter) {
          case x.Texture.TextureMinFilter.Nearest:
          case x.Texture.TextureMinFilter.NearestMipMapLinear:
          case x.Texture.TextureMinFilter.NearestMipMapNearest:
            r = Ci(
              s,
              x.Texture.TextureMinFilter.Nearest,
              e.generateMipMaps
            );
            break;
          case x.Texture.TextureMinFilter.Linear:
          case x.Texture.TextureMinFilter.LinearMipMapLinear:
          case x.Texture.TextureMinFilter.LinearMipMapNearest:
            r = Ci(
              s,
              x.Texture.TextureMinFilter.Nearest,
              e.generateMipMaps
            );
            break;
        }
      else
        n = ws(
          s,
          x.Texture.TextureMagFilter.Nearest
        ), r = Ci(
          s,
          x.Texture.TextureMinFilter.Nearest,
          e.generateMipMaps
        );
    else if (e.isFloatTexture)
      if (O.FLOAT_TEXTURE_READ.fullLinearFilter)
        switch (n = ws(s, e.magFilter), e.minFilter) {
          case x.Texture.TextureMinFilter.Nearest:
          case x.Texture.TextureMinFilter.NearestMipMapLinear:
          case x.Texture.TextureMinFilter.NearestMipMapNearest:
            r = Ci(
              s,
              x.Texture.TextureMinFilter.Nearest,
              e.generateMipMaps
            );
            break;
          case x.Texture.TextureMinFilter.Linear:
          case x.Texture.TextureMinFilter.LinearMipMapLinear:
          case x.Texture.TextureMinFilter.LinearMipMapNearest:
            r = Ci(
              s,
              x.Texture.TextureMinFilter.Nearest,
              e.generateMipMaps
            );
            break;
        }
      else
        n = ws(
          s,
          x.Texture.TextureMagFilter.Nearest
        ), r = Ci(
          s,
          x.Texture.TextureMinFilter.Nearest,
          e.generateMipMaps
        );
    else !t && s instanceof WebGLRenderingContext ? (n = ws(s, x.Texture.TextureMagFilter.Linear), r = Ci(
      s,
      x.Texture.TextureMinFilter.Linear,
      e.generateMipMaps
    )) : (n = ws(s, e.magFilter), r = Ci(s, e.minFilter, e.generateMipMaps));
    if (s.texParameteri(s.TEXTURE_2D, s.TEXTURE_MAG_FILTER, n), s.texParameteri(s.TEXTURE_2D, s.TEXTURE_MIN_FILTER, r), e.isFloatTexture || (s.texParameteri(
      s.TEXTURE_2D,
      s.TEXTURE_WRAP_S,
      wa(s, e.wrapHorizontal)
    ), s.texParameteri(
      s.TEXTURE_2D,
      s.TEXTURE_WRAP_T,
      wa(s, e.wrapVertical)
    )), e.isFloatTexture || (s.pixelStorei(
      s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,
      e.premultiplyAlpha
    ), s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL, e.flipY)), this.extensions.anisotropicFiltering) {
      const { ext: o, stat: a } = this.extensions.anisotropicFiltering, c = Math.min(
        a.maxAnistropicFilter,
        Math.floor(e.anisotropy || 0)
      );
      !isNaN(c) && !e.isFloatTexture && c >= 1 && s.texParameterf(
        s.TEXTURE_2D,
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
      const s = e.updateRange.offset;
      t.bufferSubData(
        t.ARRAY_BUFFER,
        // We start at the element index. We specify the offset in BYTES hence
        // the * 4 since attributes are always specified as Float32Arrays
        s * 4,
        e.data.subarray(s, s + e.updateRange.count)
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
      const s = e.updateRange.offset;
      t.bufferSubData(
        t.ELEMENT_ARRAY_BUFFER,
        s * e.data.constructor.BYTES_PER_ELEMENT,
        e.data.subarray(s, s + e.updateRange.count)
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
  useAttribute(e, t, s) {
    if (!this.state.currentProgram || !t.gl) return !1;
    t.gl.locations = t.gl.locations || /* @__PURE__ */ new Map();
    let n = t.gl.locations.get(this.state.currentProgram);
    if (n === void 0 && (n = this.gl.getAttribLocation(this.state.currentProgram, e), n === -1 && jt(
      "WARN: An attribute is not being used with the current material: %o",
      e,
      t
    ), t.gl.locations.set(this.state.currentProgram, n)), n !== -1) {
      switch (this.state.bindVBO(t.gl.bufferId), t.size) {
        // For sizes that fit within a single vertex block, this is the simplest
        // way to establish the pointer
        case 1:
        case 2:
        case 3:
        case 4:
          this.state.willUseVertexAttributeArray(n), this.gl.vertexAttribPointer(
            n,
            t.size,
            // How many floats used for the attribute
            this.gl.FLOAT,
            // We are only sending over float data right now
            t.normalize,
            0,
            0
          ), s.isInstanced && t.isInstanced && this.extensions.instancing ? this.state.setVertexAttributeArrayDivisor(n, 1) : this.state.setVertexAttributeArrayDivisor(n, 0);
          break;
        // For sizes that exceed a single 'block' for a vertex attribute, one must
        // break up the attribute pointers as the max allowed size is 4 at a time.
        default: {
          const r = Math.ceil(t.size / 4);
          for (let o = 0; o < r; ++o)
            this.state.willUseVertexAttributeArray(n + o), this.gl.vertexAttribPointer(
              n + o,
              4,
              this.gl.FLOAT,
              t.normalize,
              r * 4 * 4,
              o * 16
            ), s.isInstanced && t.isInstanced && this.extensions.instancing ? this.state.setVertexAttributeArrayDivisor(n + o, 1) : this.state.setVertexAttributeArrayDivisor(n + o, 0);
          break;
        }
      }
      return !0;
    }
  }
  /**
   * Uses the configuration in the specified render target to perform a blit
   * from the current framebuffer to the target texture which should be bound to
   * an FBO.
   */
  blitFramebuffer(e) {
    var t, s;
    if (this.gl instanceof WebGL2RenderingContext && e.gl) {
      const n = e.gl.outputTypeToAttachment, r = e.gl.fboId, o = e.gl.blitFboId;
      if (!r || !o) return;
      const a = (t = e.buffers.blit) == null ? void 0 : t.color;
      let c = [];
      if (!a) return;
      Array.isArray(a) ? c = a : c = [a], this.state.bindFBOTargets(r, o);
      const l = c.map((u) => n.get(u.outputType)).filter(ne);
      for (let u = 0; u < c.length; u++) {
        const h = c[u], d = n.get(h.outputType);
        if (d) {
          const f = l.slice(0).map((p) => p === d ? d : this.gl.NONE);
          this.gl.readBuffer(d), this.state.setDrawBuffers(f), this.gl.blitFramebuffer(
            0,
            0,
            e.width,
            e.height,
            0,
            0,
            e.width,
            e.height,
            this.gl.COLOR_BUFFER_BIT,
            this.gl.NEAREST
          );
        }
      }
      (s = e.buffers.blit) != null && s.depth && this.gl.blitFramebuffer(
        0,
        0,
        e.width,
        e.height,
        0,
        0,
        e.width,
        e.height,
        this.gl.DEPTH_BUFFER_BIT,
        this.gl.NEAREST
      );
    }
  }
}
const { sqrt: yo, max: Nt, min: Bt, floor: Pt, ceil: Ft, abs: Dt, acos: hh, sin: Cr } = Math, $e = new Array(20).fill(0).map((i) => [0, 0, 0]), dh = new Array(20).fill(0).map((i) => [0, 0, 0, 0]);
function fh(i) {
  return i && Array.isArray(i) && i.length === 1;
}
function Dc(i) {
  return i && Array.isArray(i) && i.length === 2;
}
function ph(i) {
  return i && Array.isArray(i) && i.length === 3;
}
function U(i) {
  return i && Array.isArray(i) && i.length === 4;
}
function ze(i, e) {
  return i = i || [], i[0] = e, i;
}
function Ro(i, e, t) {
  return ze(t, i[0] + e[0]);
}
function kc(i, e) {
  return ze(e, Ft(i[0]));
}
function Uc(i, e) {
  return i[0] === e[0];
}
function gh(i, e, t) {
  return Dt(i[0] - e[0]) <= t;
}
function zc(i, e) {
  return ze(e, i[0]);
}
function Gc() {
  return [0];
}
function Vc(i, e, t) {
  return ze(t, 0);
}
function $c(i, e, t) {
  return ze(t, i[0] / e[0]);
}
function Wc(i) {
  return ze(i, 0);
}
function jc(i, e) {
  e = e || [];
  for (let t = 0, s = i.length; t < s; ++t)
    e.push(i[t][0]);
  return e;
}
function Hc(i, e) {
  return ze(e, Pt(i[0]));
}
function Xc(i, e) {
  return ze(e, 1 / i[0]);
}
function Ao(i, e, t) {
  return ze(t, i[0] * e);
}
function _o(i, e, t) {
  return ze(t, i[0] - e[0]);
}
function Qc(i, e, t) {
  return ze(t, Nt(i[0], e[0]));
}
function Yc(i, e, t) {
  return ze(t, Bt(i[0], e[0]));
}
function qc(i, e, t) {
  return ze(t, i[0] * e[0]);
}
function Kc(i, e) {
  return ze(e, 1);
}
function Zc(i, e) {
  return i[0] * e[0];
}
function mh(i, e) {
  return i[0] * e[0];
}
function Jc(i, e, t, s) {
  return Ro(Ao(_o(e, i), t), i, s);
}
function el(i) {
  return i[0];
}
function bh(i) {
  return i;
}
function tl(i, ...e) {
  let t;
  if (e = e || [], Array.isArray(i) ? t = i.slice(0, 1) : t = [i], t.length < 1)
    for (let s = 0, n = e.length; s < n && t.length < 1; ++s) {
      const r = e[s];
      Array.isArray(r) ? t.push(...r.slice(0, 1 - t.length)) : t.push(r);
    }
  for (; t.length < 1; ) t.push(0);
  return t;
}
function le(i, e, t) {
  return i = i || new Array(2), i[0] = e, i[1] = t, i;
}
function Gi(i, e, t) {
  return le(t, i[0] + e[0], i[1] + e[1]);
}
function il(i, e) {
  return le(e, Ft(i[0]), Ft(i[1]));
}
function Io(i, e) {
  return le(e, i[0], i[1]);
}
function sl(i) {
  return le(i, 1, 0);
}
function nl(i, e, t) {
  return le(t, 0, 0);
}
function Mo(i, e) {
  return i[0] === e[0] && i[1] === e[1];
}
function xh(i, e, t) {
  return Dt(i[0] - e[0]) <= t && Dt(i[1] - e[1]) <= t;
}
function dr(i, e, t) {
  return le(t, i[0] / e[0], i[1] / e[1]);
}
function rl(i) {
  return le(i, 0, 0);
}
function ol(i, e) {
  e = e || new Array(i.length * 2);
  for (let t = 0, s = 0, n = i.length; t < n; ++t, s += 2) {
    const r = i[t];
    e[s] = r[0], e[s + 1] = r[1];
  }
  return e;
}
function al(i, e) {
  return le(e, Pt(i[0]), Pt(i[1]));
}
function So(i, e) {
  return le(e, 1 / i[0], 1 / i[1]);
}
function cl(i, e, t) {
  return le(t, Nt(i[0], e[0]), Nt(i[1], e[1]));
}
function ll(i, e, t) {
  return le(t, Bt(i[0], e[0]), Bt(i[1], e[1]));
}
function Ae(i, e, t) {
  return le(t, i[0] * e, i[1] * e);
}
function Te(i, e, t) {
  const s = t || new Array(2);
  return s[0] = i[0] - e[0], s[1] = i[1] - e[1], s;
}
function ul(i, e, t) {
  return le(t, i[0] * e[0], i[1] * e[1]);
}
function hl(i, e) {
  const t = ds(i);
  return le(e, i[0] / t, i[1] / t);
}
function ln(i, e) {
  return i[0] * e[0] + i[1] * e[1];
}
function vh(i, e) {
  return i[0] * e[0] - i[1] * e[1];
}
function wh(i, e) {
  return i[0] * e[1] - i[1] * e[0];
}
function Th(i, e) {
  return le(e, i[1], i[0]);
}
function dl(i, e, t, s) {
  return Gi(Ae(Te(e, i), t), i, s);
}
function ds(i) {
  return fl(i[0], i[1]);
}
function fl(i, e) {
  return yo(i * i + e * e);
}
function Co(i, ...e) {
  let t;
  if (e = e || [], Array.isArray(i) ? t = i.slice(0, 2) : t = [i], t.length < 2)
    for (let s = 0, n = e.length; s < n && t.length < 2; ++s) {
      const r = e[s];
      Array.isArray(r) ? t.push(...r.slice(0, 2 - t.length)) : t.push(r);
    }
  for (; t.length < 2; ) t.push(0);
  return t;
}
function fe(i, e, t, s) {
  return i = i || new Array(3), i[0] = e, i[1] = t, i[2] = s, i;
}
function ri(i, e, t) {
  return fe(
    t,
    i[0] + e[0],
    i[1] + e[1],
    i[2] + e[2]
  );
}
function pl(i, e) {
  return fe(e, Ft(i[0]), Ft(i[1]), Ft(i[2]));
}
function ct(i, e) {
  return fe(e, i[0], i[1], i[2]);
}
function Qn(i, e) {
  return i[0] === e[0] && i[1] === e[1] && i[2] === e[2];
}
function Eh(i, e, t) {
  return Dt(i[0] - e[0]) <= t && Dt(i[1] - e[1]) <= t && Dt(i[2] - e[2]) <= t;
}
function Ns(i) {
  return fe(i, 0, 0, -1);
}
function tt(i, e, t) {
  return t = t || new Array(3), t[0] = i[1] * e[2] - i[2] * e[1], t[1] = i[2] * e[0] - i[0] * e[2], t[2] = i[0] * e[1] - i[1] * e[0], t;
}
function fr(i, e, t) {
  return fe(
    t,
    i[0] / e[0],
    i[1] / e[1],
    i[2] / e[2]
  );
}
function gl(i) {
  return fe(i, 0, 0, 0);
}
function ml(i, e) {
  e = e || new Array(i.length * 3);
  for (let t = 0, s = 0, n = i.length; t < n; ++t, s += 3) {
    const r = i[t];
    e[s] = r[0], e[s + 1] = r[1], e[s + 2] = r[2];
  }
  return e;
}
function bl(i, e) {
  return fe(e, Pt(i[0]), Pt(i[1]), Pt(i[2]));
}
function tn(i, e) {
  return fe(e, 1 / i[0], 1 / i[1], 1 / i[2]);
}
function ht(i, e, t) {
  return fe(t, i[0] * e, i[1] * e, i[2] * e);
}
function ti(i, e, t) {
  return fe(
    t,
    i[0] - e[0],
    i[1] - e[1],
    i[2] - e[2]
  );
}
function xl(i, e, t) {
  return fe(
    t,
    i[0] * e[0],
    i[1] * e[1],
    i[2] * e[2]
  );
}
function vl(i, e, t, s) {
  return ri(ht(ti(e, i), t), i, s);
}
function Oo(i) {
  return wl(i[0], i[1], i[2]);
}
function wl(i, e, t) {
  return yo(i * i + e * e + t * t);
}
function Lo(i, e, t) {
  return fe(
    t,
    Nt(i[0], e[0]),
    Nt(i[1], e[1]),
    Nt(i[2], e[2])
  );
}
function No(i, e, t) {
  return fe(
    t,
    Bt(i[0], e[0]),
    Bt(i[1], e[1]),
    Bt(i[2], e[2])
  );
}
function mt(i, e) {
  e = e || new Array(3);
  const t = Oo(i);
  return e[0] = i[0] / t, e[1] = i[1] / t, e[2] = i[2] / t, e;
}
function Yn(i, e) {
  return i[0] * e[0] + i[1] * e[1] + i[2] * e[2];
}
function yh(i, e) {
  return i[0] * e[0] - i[1] * e[1] - i[2] * e[2];
}
function Rh(i, e) {
  return fe(e, i[2], i[1], i[0]);
}
function ls(i, ...e) {
  let t;
  if (e = e || [], Array.isArray(i) ? t = i.slice(0, 3) : t = [i], t.length < 3)
    for (let s = 0, n = e.length; s < n && t.length < 3; ++s) {
      const r = e[s];
      Array.isArray(r) ? t.push(...r.slice(0, 3 - t.length)) : t.push(r);
    }
  for (; t.length < 3; ) t.push(0);
  return t;
}
function Ah(i, e, t) {
  return t = t || [0, 0, 0], mt(tt(tt(i, e), i), t);
}
function _h(i, e, t) {
  return t = t || [0, 0, 0], mt(tt(i, e), t);
}
function Ih(i, e, t) {
  return t = t || [0, 0, 0], mt(tt(e, i), t);
}
function Mh(i, e, t) {
  return t = t || [0, 0, 0], mt(tt(i, tt(i, e)), t);
}
function ue(i, e, t, s, n) {
  return i = i || new Array(4), i[0] = e, i[1] = t, i[2] = s, i[3] = n, i;
}
function Bo(i, e, t) {
  return ue(
    t,
    i[0] + e[0],
    i[1] + e[1],
    i[2] + e[2],
    i[3] + e[3]
  );
}
function Sh(i, e, t) {
  return ue(
    t,
    i[0] + e[0],
    i[1] + e[1],
    i[2] + e[2],
    i[3]
  );
}
function Tl(i, e) {
  return ue(e, Ft(i[0]), Ft(i[1]), Ft(i[2]), Ft(i[3]));
}
function ii(i, e) {
  return ue(e, i[0], i[1], i[2], i[3]);
}
function Po(i, e) {
  return i[0] === e[0] && i[1] === e[1] && i[2] === e[2] && i[3] === e[3];
}
function Ch(i, e, t) {
  return Dt(i[0] - e[0]) <= t && Dt(i[1] - e[1]) <= t && Dt(i[2] - e[2]) <= t && Dt(i[3] - e[3]) <= t;
}
function El(i) {
  return ue(i, 0, 0, -1, 0);
}
function yl(i, e, t) {
  return ue(t, 0, 0, 0, 1);
}
function Rl(i, e, t) {
  return ue(
    t,
    i[0] / e[0],
    i[1] / e[1],
    i[2] / e[2],
    i[3] / e[3]
  );
}
function Al(i) {
  return ue(i, 0, 0, 0, 0);
}
function Fo(i, e) {
  e = e || new Array(4);
  for (let t = 0, s = 0, n = i.length; t < n; ++t, s += 4) {
    const r = i[t];
    e[s] = r[0], e[s + 1] = r[1], e[s + 2] = r[2], e[s + 3] = r[3];
  }
  return e;
}
function _l(i, e) {
  return ue(
    e,
    Pt(i[0]),
    Pt(i[1]),
    Pt(i[2]),
    Pt(i[3])
  );
}
function Il(i, e) {
  return ue(e, 1 / i[0], 1 / i[1], 1 / i[2], 1 / i[3]);
}
function Do(i, e, t) {
  return ue(
    t,
    i[0] * e,
    i[1] * e,
    i[2] * e,
    i[3] * e
  );
}
function ko(i, e, t) {
  return ue(
    t,
    i[0] - e[0],
    i[1] - e[1],
    i[2] - e[2],
    i[3] - e[3]
  );
}
function Ml(i, e, t) {
  return ue(
    t,
    i[0] * e[0],
    i[1] * e[1],
    i[2] * e[2],
    i[3] * e[3]
  );
}
function Uo(i, e) {
  return i[0] * e[0] + i[1] * e[1] + i[2] * e[2] + i[3] * e[3];
}
function Oh(i, e) {
  return i[0] * e[0] - i[1] * e[1] - i[2] * e[2] - i[3] * e[3];
}
function Lh(i, e) {
  return ue(e, i[3], i[2], i[1], i[0]);
}
function Sl(i, e, t, s) {
  return Bo(Do(ko(e, i), t), i, s);
}
function zo(i) {
  return Di(i[0], i[1], i[2], i[3]);
}
function Di(i, e, t, s) {
  return yo(i * i + e * e + t * t + s * s);
}
function Cl(i, e, t) {
  return ue(
    t,
    Nt(i[0], e[0]),
    Nt(i[1], e[1]),
    Nt(i[2], e[2]),
    Nt(i[3], e[3])
  );
}
function Ol(i, e, t) {
  return ue(
    t,
    Bt(i[0], e[0]),
    Bt(i[1], e[1]),
    Bt(i[2], e[2]),
    Bt(i[3], e[3])
  );
}
function Ll(i, e) {
  const t = zo(i);
  return ue(
    e,
    i[0] / t,
    i[1] / t,
    i[2] / t,
    i[3] / t
  );
}
function qn(i, ...e) {
  let t;
  if (e = e || [], Array.isArray(i) ? t = i.slice(0, 4) : t = [i], t.length < 4)
    for (let s = 0, n = e.length; s < n && t.length < 4; ++s) {
      const r = e[s];
      Array.isArray(r) ? t.push(...r.slice(0, 4 - t.length)) : t.push(r);
    }
  for (; t.length < 4; ) t.push(0);
  return t;
}
function Nh(i, e) {
  return e = e || [0, 0, 0, 0], ue(
    e,
    ((i & 16711680) >> 16) / 255,
    ((i & 65280) >> 8) / 255,
    (i & 255) / 255,
    1
  );
}
function Bh(i, e) {
  return e = e || [0, 0, 0, 0], ue(
    e,
    ((i & 4278190080) >> 24) / 255,
    ((i & 16711680) >> 16) / 255,
    ((i & 65280) >> 8) / 255,
    (i & 255) / 255
  );
}
function Nl(i, e, t, s) {
  s = s || [0, 0, 0, 0];
  const n = [0, 0, 0, 0];
  let r, o, a, c, l;
  return o = i[1] * e[1] + i[2] * e[2] + i[3] * e[3] + i[0] * e[0], o < 0 ? (o = -o, n[0] = -e[0], n[1] = -e[1], n[2] = -e[2], n[3] = -e[3]) : (n[0] = e[0], n[1] = e[1], n[2] = e[2], n[3] = e[3]), 1 - o > 1e-7 ? (r = hh(o), a = Cr(r), c = Cr((1 - t) * r) / a, l = Cr(t * r) / a) : (c = 1 - t, l = t), s[1] = c * i[1] + l * n[1], s[2] = c * i[2] + l * n[2], s[3] = c * i[3] + l * n[3], s[0] = c * i[0] + l * n[0], s;
}
const Bl = {
  add: Ro,
  ceil: kc,
  copy: zc,
  compare: Uc,
  cross: Vc,
  divide: $c,
  dot: Zc,
  empty: Wc,
  flatten: jc,
  floor: Hc,
  forward: Gc,
  inverse: Xc,
  length: el,
  linear: Jc,
  max: Qc,
  min: Yc,
  multiply: qc,
  normalize: Kc,
  scale: Ao,
  subtract: _o,
  vec: tl
}, Pl = {
  add: Gi,
  ceil: il,
  copy: Io,
  compare: Mo,
  cross: nl,
  divide: dr,
  dot: ln,
  empty: rl,
  flatten: ol,
  floor: al,
  forward: sl,
  inverse: So,
  length: ds,
  linear: dl,
  max: cl,
  min: ll,
  multiply: ul,
  normalize: hl,
  scale: Ae,
  subtract: Te,
  vec: Co
}, Fl = {
  add: ri,
  ceil: pl,
  copy: ct,
  compare: Qn,
  cross: tt,
  divide: fr,
  dot: Yn,
  empty: gl,
  flatten: ml,
  floor: bl,
  forward: Ns,
  inverse: tn,
  length: Oo,
  linear: vl,
  max: Lo,
  min: No,
  multiply: xl,
  normalize: mt,
  scale: ht,
  subtract: ti,
  vec: ls
}, Dl = {
  add: Bo,
  ceil: Tl,
  copy: ii,
  compare: Po,
  cross: yl,
  divide: Rl,
  dot: Uo,
  empty: Al,
  flatten: Fo,
  floor: _l,
  forward: El,
  inverse: Il,
  length: zo,
  linear: Sl,
  max: Cl,
  min: Ol,
  multiply: Ml,
  normalize: Ll,
  scale: Do,
  subtract: ko,
  vec: qn,
  slerpQuat: Nl
};
function F(i) {
  let e;
  return i.length === 1 ? (e = Bl, e) : i.length === 2 ? (e = Pl, e) : i.length === 3 ? (e = Fl, e) : (e = Dl, e);
}
function Ph(i) {
  return `[${i[0]}]`;
}
function Fh(i) {
  return `[${i[0]}, ${i[1]}]`;
}
function Dh(i) {
  return `[${i[0]}, ${i[1]}, ${i[2]}]`;
}
function kh(i) {
  return `[${i[0]}, ${i[1]}, ${i[2]}, ${i[3]}]`;
}
const Uh = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  V3R: $e,
  V4R: dh,
  VecMath: F,
  add1: Ro,
  add2: Gi,
  add3: ri,
  add4: Bo,
  add4by3: Sh,
  apply1: ze,
  apply2: le,
  apply3: fe,
  apply4: ue,
  ceil1: kc,
  ceil2: il,
  ceil3: pl,
  ceil4: Tl,
  color4FromHex3: Nh,
  color4FromHex4: Bh,
  compare1: Uc,
  compare2: Mo,
  compare3: Qn,
  compare4: Po,
  copy1: zc,
  copy2: Io,
  copy3: ct,
  copy4: ii,
  cross1: Vc,
  cross2: nl,
  cross3: tt,
  cross4: yl,
  divide1: $c,
  divide2: dr,
  divide3: fr,
  divide4: Rl,
  dot1: Zc,
  dot2: ln,
  dot3: Yn,
  dot4: Uo,
  down3: Mh,
  empty1: Wc,
  empty2: rl,
  empty3: gl,
  empty4: Al,
  flatten1: jc,
  flatten2: ol,
  flatten3: ml,
  flatten4: Fo,
  floor1: Hc,
  floor2: al,
  floor3: bl,
  floor4: _l,
  forward1: Gc,
  forward2: sl,
  forward3: Ns,
  forward4: El,
  fuzzyCompare1: gh,
  fuzzyCompare2: xh,
  fuzzyCompare3: Eh,
  fuzzyCompare4: Ch,
  inverse1: Xc,
  inverse2: So,
  inverse3: tn,
  inverse4: Il,
  isVec1: fh,
  isVec2: Dc,
  isVec3: ph,
  isVec4: U,
  left3: Ih,
  length1: el,
  length1Components: bh,
  length2: ds,
  length2Components: fl,
  length3: Oo,
  length3Components: wl,
  length4: zo,
  length4Components: Di,
  linear1: Jc,
  linear2: dl,
  linear3: vl,
  linear4: Sl,
  max1: Qc,
  max2: cl,
  max3: Lo,
  max4: Cl,
  min1: Yc,
  min2: ll,
  min3: No,
  min4: Ol,
  multiply1: qc,
  multiply2: ul,
  multiply3: xl,
  multiply4: Ml,
  normalize1: Kc,
  normalize2: hl,
  normalize3: mt,
  normalize4: Ll,
  reverse2: Th,
  reverse3: Rh,
  reverse4: Lh,
  right3: _h,
  scale1: Ao,
  scale2: Ae,
  scale3: ht,
  scale4: Do,
  slerpQuat: Nl,
  subtract1: _o,
  subtract2: Te,
  subtract3: ti,
  subtract4: ko,
  toString1: Ph,
  toString2: Fh,
  toString3: Dh,
  toString4: kh,
  tod1: mh,
  tod2: vh,
  tod3: yh,
  tod4: Oh,
  tod_flip2: wh,
  up3: Ah,
  vec1: tl,
  vec1Methods: Bl,
  vec2: Co,
  vec2Methods: Pl,
  vec3: ls,
  vec3Methods: Fl,
  vec4: qn,
  vec4Methods: Dl
}, Symbol.toStringTag, { value: "Module" }));
class is {
  constructor(e) {
    this.isInvalid = !1, this._uid = P(), this._validFramebuffer = !1, this._disabledTargets = /* @__PURE__ */ new Set(), this.retainTextureTargets = !0, this._buffers = {
      color: Array.isArray(e.buffers.color) ? e.buffers.color.slice(0) : e.buffers.color,
      depth: e.buffers.depth,
      stencil: e.buffers.stencil,
      blit: e.buffers.blit
    }, this._width = e.width || 0, this._height = e.height || 0, this.retainTextureTargets = e.retainTextureTargets ?? !0, this.calculateDimensions();
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
      stencil: this._buffers.stencil,
      blit: this._buffers.blit
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
    let t = 0;
    if (this._buffers.color instanceof W)
      e.push(this._buffers.color);
    else if (this._buffers.color instanceof ft)
      e.push(this._buffers.color), t = this._buffers.color.multiSample;
    else if (Array.isArray(this._buffers.color))
      for (let s = 0, n = this._buffers.color.length; s < n; ++s) {
        const r = this._buffers.color[s];
        r.buffer instanceof W ? e.push(r.buffer) : r.buffer instanceof ft && (e.push(r.buffer), t = r.buffer.multiSample);
      }
    else this._buffers.color && this._buffers.color.buffer instanceof W ? e.push(this._buffers.color.buffer) : this._buffers.color && this._buffers.color.buffer instanceof ft && (e.push(this._buffers.color.buffer), t = this._buffers.color.buffer.multiSample);
    if (this._buffers.depth instanceof W ? e.push(this._buffers.depth) : this._buffers.depth instanceof ft && (e.push(this._buffers.depth), t = this._buffers.depth.multiSample), this._buffers.stencil instanceof W && e.push(this._buffers.stencil), e.length > 0) {
      let s = 0, n = 0;
      const r = e[0];
      r instanceof W && r.data ? (s = r.data.width, n = r.data.height) : r instanceof ft && (s = r.size[0], n = r.size[1]);
      for (let o = 0, a = e.length; o < a; ++o) {
        const c = e[o];
        if (t > 0) {
          if (c instanceof W) {
            console.warn(
              "The output has a buffer that specifies multisampling, but a texture was also specified. Textures are not allowed in multisampled render targets.",
              c,
              e,
              "The texture will be removed as a target for the render target"
            ), this.removeBufferFromOutput(c);
            continue;
          } else if (c instanceof ft && c.multiSample !== t) {
            console.warn(
              "The output has a buffer that specifies multisampling, but an additional buffer specified did not have the same multisampling value as the other buffers.",
              c,
              e,
              "The buffer will be removed as a target for the render target"
            ), this.removeBufferFromOutput(c);
            continue;
          }
        }
        if (c instanceof W && !c.data) {
          console.warn(
            "A texture specified for thie RenderTarget did not have any data associated with it."
          ), this.removeBufferFromOutput(c);
          continue;
        } else if (c instanceof W && c.data) {
          const { width: l, height: u } = c.data;
          if (l !== s || u !== n) {
            console.warn(
              "Texture applied to the render target is invalid as it does not match dimensions of all textures/buffers applied:",
              c,
              e,
              "The texture will be removed as a target for the render target"
            ), this.removeBufferFromOutput(c);
            continue;
          }
        }
        if (c instanceof ft && (c.size[0] !== s || c.size[1] !== n)) {
          console.warn(
            "ColorBuffer applied to the render target is invalid as it does not match dimensions of all textures/buffers applied:",
            c,
            e,
            "The color buffer will be removed as a target for the render target"
          ), this.removeBufferFromOutput(c);
          continue;
        }
      }
      this._width = s, this._height = n;
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
    var t, s;
    const e = [];
    return Array.isArray(this.buffers.color) ? this.buffers.color.forEach((n) => {
      n.buffer instanceof W && e.push(n.buffer);
    }) : this.buffers.color && this.buffers.color.buffer instanceof W && e.push(this.buffers.color.buffer), this.buffers.depth instanceof W && e.push(this.buffers.depth), this.buffers.stencil instanceof W && e.push(this.buffers.stencil), (t = this.buffers.blit) != null && t.color && (Array.isArray(this.buffers.blit.color) ? this.buffers.blit.color.forEach((n) => {
      n.buffer instanceof W && e.push(n.buffer);
    }) : this.buffers.blit.color.buffer instanceof W && e.push(this.buffers.blit.color.buffer)), (s = this.buffers.blit) != null && s.depth && e.push(this.buffers.blit.depth), e;
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
        return this.buffers.color[0].outputType === G.COLOR;
    } else
      return ((e = this.buffers.color) == null ? void 0 : e.outputType) === G.COLOR;
    return !1;
  }
  /**
   * Cleanses a texture or color buffer from being used as an output buffer
   */
  removeBufferFromOutput(e) {
    var t;
    if (Array.isArray(this._buffers.color)) {
      const s = this._buffers.color.find((r) => r.buffer === e);
      if (!s) return;
      const n = this._buffers.color.indexOf(s);
      n > -1 && this._buffers.color.splice(n, 1);
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
    this.dispose(), this._width = e, this._height = t, this.getTextures().forEach((n) => {
      n.data = {
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
var Ee = /* @__PURE__ */ ((i) => (i[i.FLOAT = 0] = "FLOAT", i[i.VEC2 = 1] = "VEC2", i[i.VEC3 = 2] = "VEC3", i[i.VEC4 = 3] = "VEC4", i[i.VEC4_ARRAY = 4] = "VEC4_ARRAY", i[i.FLOAT_ARRAY = 5] = "FLOAT_ARRAY", i[i.MATRIX3x3 = 6] = "MATRIX3x3", i[i.MATRIX4x4 = 7] = "MATRIX4x4", i[i.TEXTURE = 8] = "TEXTURE", i))(Ee || {});
function jb(i) {
  return i.type === 1;
}
function Hb(i) {
  return i.type === 2;
}
function Xb(i) {
  return i.type === 3;
}
function zh(i) {
  return i.type === 4;
}
function Qb(i) {
  return i.type === 6;
}
function Yb(i) {
  return i.type === 7;
}
function qb(i) {
  return i.type === 8;
}
function Kb(i) {
  return i.type === 0;
}
const Gh = window.OffscreenCanvas || Eo;
function Cs(i) {
  return i instanceof Gh;
}
var Mt = /* @__PURE__ */ ((i) => (i[i.INVALID = 0] = "INVALID", i[i.VALID = 1] = "VALID", i[i.NO_RENDER_TARGET_MATCHES = 2] = "NO_RENDER_TARGET_MATCHES", i))(Mt || {});
const Ma = ve("performance");
class Vh {
  /**
   * Generate a new state manager and establish some initial state settings by
   * querying the context.
   */
  constructor(e, t) {
    this.debugContext = "", this._textureUnitToTexture = /* @__PURE__ */ new Map(), this._freeTextureUnits = [], this._freeUniformBufferBindings = [], this._blendingEnabled = !0, this._blendDstFactor = x.Material.BlendingDstFactor.One, this._blendSrcFactor = x.Material.BlendingDstFactor.One, this._blendEquation = x.Material.BlendingEquations.Add, this._cullFace = x.Material.CullSide.NONE, this._cullEnabled = !0, this._colorMask = [!0, !0, !0, !0], this._clearColor = [0, 0, 0, 1], this._depthFunc = x.Material.DepthFunctions.ALWAYS, this._depthTestEnabled = !0, this._depthMask = !0, this._ditheringEnabled = !0, this._boundFBO = { read: null, draw: null }, this._renderTarget = null, this._boundRBO = null, this._boundVAO = null, this._boundVBO = null, this._boundElementArrayBuffer = null, this._boundTexture = {
      id: null,
      unit: -1
    }, this._currentProgram = null, this._scissorTestEnabled = !1, this._scissorBounds = { x: 0, y: 0, width: 1, height: 1 }, this._currentUniforms = {}, this._activeTextureUnit = -1, this._drawBuffers = [], this._textureWillBeUsed = /* @__PURE__ */ new Map(), this._viewport = { x: 0, y: 0, width: 100, height: 100 }, this._enabledVertexAttributeArray = [], this._willUseVertexAttributeArray = [], this._vertexAttributeArrayDivisor = /* @__PURE__ */ new Map(), this.gl = e, this.extensions = t;
    const s = this.gl.getParameter(
      e.MAX_COMBINED_TEXTURE_IMAGE_UNITS
    );
    for (let r = 0; r < s; ++r)
      this._freeTextureUnits.push(Zu(e, r));
    const n = O.MAX_UNIFORM_BUFFER_BINDINGS;
    for (let r = 0; r < n; ++r)
      this._freeUniformBufferBindings.push(r);
    this._activeTextureUnit = e.TEXTURE0, this._cullEnabled = !0, e.enable(e.CULL_FACE), this._depthTestEnabled = !0, e.enable(e.DEPTH_TEST), this._blendingEnabled = !0, e.enable(e.BLEND);
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
  /** Indicates if culling is enabled */
  get cullEnabled() {
    return this._cullEnabled;
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
    (this._boundFBO.draw !== e || this._boundFBO.read !== e) && (this._boundFBO.draw = e, this._boundFBO.read = e, this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, e));
  }
  /**
   * Binds the read and draw framebuffers for READ and DRAW framebuffer targets.
   */
  bindFBOTargets(e, t) {
    this.gl instanceof WebGL2RenderingContext && (this._boundFBO.draw = t, this.gl.bindFramebuffer(this.gl.DRAW_FRAMEBUFFER, t), this._boundFBO.read = e, this.gl.bindFramebuffer(this.gl.READ_FRAMEBUFFER, e));
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
      const s = this._textureUnitToTexture.get(this._activeTextureUnit);
      s && s.gl && (s.gl.textureUnit = -1), this._textureUnitToTexture.set(this._activeTextureUnit, e), e.gl.textureUnit = this._activeTextureUnit;
    }
  }
  /**
   * Disables all vertex attribute array indices enabled
   */
  disableVertexAttributeArray() {
    for (let e = 0, t = this._enabledVertexAttributeArray.length; e < t; ++e) {
      const s = this._enabledVertexAttributeArray[e];
      this.gl.disableVertexAttribArray(s);
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
      const s = this._enabledVertexAttributeArray[e];
      if (s !== void 0) {
        if (this._willUseVertexAttributeArray[s] !== void 0) return;
        this.gl.disableVertexAttribArray(s), delete this._enabledVertexAttributeArray[s];
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
    Po(e, this._clearColor) || (this._clearColor = ii(e), this.applyClearColor());
  }
  /**
   * Change the drawBuffer state, if it's available
   *
   * 0 - n specifies COLOR_ATTACHMENT
   * -1 specifies NONE
   * -2 specifies BACK
   */
  setDrawBuffers(e, t) {
    let s = e.length !== this._drawBuffers.length;
    if (!s) {
      for (let n = 0, r = e.length; n < r; ++n)
        if (this._drawBuffers[n] !== e[n]) {
          s = !0;
          break;
        }
    }
    if (s) {
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
  setViewport(e, t, s, n) {
    (e !== this._viewport.x || t !== this._viewport.y || s !== this._viewport.width || n !== this._viewport.height) && (this._viewport = { x: e, y: t, width: s, height: n }, this.applyViewport());
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
      return Mt.INVALID;
    const t = this.findMaterialProgram(e);
    if (t === void 0)
      return console.warn(
        "Could NOT determine a program for the given material that would appropriately match with the current RenderTarget"
      ), Mt.NO_RENDER_TARGET_MATCHES;
    if (this._renderTarget && (e.gl.programByTarget.set(this._renderTarget, t), this.glProxy.extensions.drawBuffers)) {
      const s = e.gl.outputsByProgram.get(t), n = this._renderTarget.getGLBuffers();
      if (!s || !n)
        return console.warn(
          "Could not establish the buffers to utilize for the render target"
        ), Mt.NO_RENDER_TARGET_MATCHES;
      const r = [];
      for (let o = 0, a = n.length; o < a; ++o) {
        const c = n[o];
        s.find(
          (u) => (c == null ? void 0 : c.outputType) === u
        ) === void 0 ? r.push(this.gl.NONE) : this._renderTarget.disabledTargets.has(
          (c == null ? void 0 : c.outputType) || 0
        ) ? r.push(this.gl.NONE) : r.push((c == null ? void 0 : c.attachment) ?? this.gl.NONE);
      }
      this.setDrawBuffers(r);
    }
    return this.useProgram(t), this.syncMaterial(e), Mt.VALID;
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
      for (let l = 0, u = e.gl.programId.length; l < u; ++l) {
        const h = e.gl.programId[l];
        h.outputTypes.length < c && h.outputTypes.indexOf(G.COLOR) >= 0 && (a = h.id, c = h.outputTypes.length);
      }
      return a || (a = e.gl.programId[e.gl.programId.length - 1]), a;
    }
    let t = e.gl.programByTarget.get(
      this._renderTarget
    );
    if (t !== void 0) return t;
    const s = /* @__PURE__ */ new Set(), n = this._renderTarget.getBuffers();
    for (let a = 0, c = n.length; a < c; ++a) {
      const l = n[a];
      l && s.add(l.outputType);
    }
    let r = 0, o = [];
    for (let a = 0, c = e.gl.programId.length; a < c; ++a) {
      const l = e.gl.programId[a];
      let u = 0;
      for (let h = 0, d = l.outputTypes.length; h < d; ++h) {
        const f = l.outputTypes[h];
        s.has(f) && u++;
      }
      u > r ? (r = u, o = [l]) : u === r && o.push(l);
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
    for (let s = 0, n = t.length; s < n; ++s) {
      const r = t[s];
      r && this.freeTextureUnit(r);
    }
    return e.gl ? (this.bindFBO(e.gl.fboId), this._renderTarget = e, !0) : !1;
  }
  /**
   * This syncs the state of the GL context with the requested state of a
   * material
   */
  syncMaterial(e) {
    if (e.depthWrite !== void 0 && this.setDepthMask(e.depthWrite), e.depthTest !== void 0 && this.setDepthTest(e.depthTest), e.depthFunc !== void 0 && this.setDepthFunc(e.depthFunc), e.blending !== void 0 && this.setBlending(e.blending), e.culling !== void 0 && this.setCullFace(e.culling), e.colorWrite !== void 0 && this.setColorMask(e.colorWrite), e.dithering !== void 0 && this.setDithering(e.dithering), e.uniforms) {
      if (this._currentUniforms = e.uniforms, !this._currentProgram)
        return !1;
      Object.entries(e.uniforms).forEach((t) => {
        const { 0: s, 1: n } = t;
        if (!this._currentProgram) return;
        n.gl || (n.gl = /* @__PURE__ */ new Map());
        let r = n.gl.get(this._currentProgram);
        if (!r) {
          const o = this.gl.getUniformLocation(
            this._currentProgram,
            s
          );
          if (!o) {
            r = {
              location: void 0
            }, Ma(
              this.debugContext,
              `A Material specified a uniform ${s}, but none was found in the current program.`
            );
            return;
          }
          r = {
            location: o
          }, n.gl.set(this._currentProgram, r);
        }
        r.location && this.uploadUniform(r.location, n);
      });
    }
    return e.uniformBuffers && Object.entries(e.uniformBuffers).forEach((t) => {
      const { 0: s, 1: n } = t;
      this._currentProgram && this.useUniformBuffer(n);
    }), !(this._textureWillBeUsed.size > 0 && !this.applyUsedTextures());
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
    this._depthTestEnabled !== e && (this._depthTestEnabled = e, e ? this.gl.enable(this.gl.DEPTH_TEST) : this.gl.disable(this.gl.DEPTH_TEST));
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
    let s;
    switch (t.type) {
      case Ee.FLOAT:
        s = t.data, this.gl.uniform1f(e, s);
        break;
      case Ee.VEC2:
        s = t.data, this.gl.uniform2f(e, s[0], s[1]);
        break;
      case Ee.VEC3:
        s = t.data, this.gl.uniform3f(e, s[0], s[1], s[2]);
        break;
      case Ee.VEC4:
        s = t.data, this.gl.uniform4f(e, s[0], s[1], s[2], s[3]);
        break;
      case Ee.VEC4_ARRAY:
        s = t.data, this.gl.uniform4fv(e, Fo(s));
        break;
      case Ee.MATRIX3x3:
        s = t.data, this.gl.uniformMatrix3fv(e, !1, s);
        break;
      case Ee.MATRIX4x4:
        s = t.data, this.gl.uniformMatrix4fv(e, !1, s);
        break;
      case Ee.FLOAT_ARRAY:
        s = t.data, this.gl.uniform1fv(e, s);
        break;
      case Ee.TEXTURE:
        s = t.data, this.willUseTextureUnit(s, e);
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
    e.forEach((n) => {
      n.gl ? n.gl.textureUnit = this.gl.TEXTURE0 : n.gl = {
        textureId: null,
        textureUnit: this.gl.TEXTURE0,
        proxy: this.glProxy
      };
    });
    const t = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
    return this._textureWillBeUsed.forEach((n, r) => {
      n instanceof is ? s.add(n) : t.set(r, n);
    }), s.forEach((n) => {
      n.getTextures().some((a) => {
        if (e.indexOf(a) < 0)
          this.glProxy.updateTexture(a);
        else return !0;
        return !1;
      }) ? console.warn(
        this.debugContext,
        "A RenderTarget can not be used because all of it's textures could not be compiled."
      ) : this.glProxy.compileRenderTarget(n);
    }), t.forEach((n, r) => {
      e.length === 0 || e.indexOf(r) < 0 ? (this.glProxy.updateTexture(r), n.forEach((o) => {
        this.uploadTextureToUniform(o, r);
      })) : n.forEach((o) => {
        this.gl.uniform1i(o, Ta(this.gl, 0));
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
    const t = [], s = [];
    for (e.forEach((o) => {
      !o.gl || o.gl.textureUnit < 0 ? t.push(o) : s.push(o);
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
      }, s.push(o);
    }
    if (t.length <= 0)
      return t;
    Ma(
      "WARNING: Too many textures in use are causing texture units to be swapped. Doing this occasionally is fine, but handling this on a frame loop can have serious performance concerns."
    );
    const n = /* @__PURE__ */ new Map();
    this._textureUnitToTexture.forEach((o) => {
      o && n.set(o, !1);
    }), s.forEach((o) => {
      n.set(o, !0);
    });
    const r = [];
    if (n.forEach((o, a) => {
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
      }, s.push(o);
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
      Ta(this.gl, t.gl.textureUnit)
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
    const s = this._textureWillBeUsed.get(e);
    t instanceof is ? s ? s instanceof is && s !== t && console.warn(
      this.debugContext,
      "A Texture is attempting to be used by two different render targets in a single draw."
    ) : this._textureWillBeUsed.set(e, t) : s ? s instanceof is ? console.warn(
      this.debugContext,
      "A texture in a single draw is attempting to attach to a uniform AND a render target which is invalid."
    ) : s.add(t) : this._textureWillBeUsed.set(e, /* @__PURE__ */ new Set([t]));
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
    let t, s;
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
        s = e.BLEND_DST_ALPHA;
        break;
      case x.Material.BlendingDstFactor.DstColor:
        s = e.BLEND_DST_RGB;
        break;
      case x.Material.BlendingDstFactor.One:
        s = e.ONE;
        break;
      case x.Material.BlendingDstFactor.OneMinusDstAlpha:
        s = e.ONE_MINUS_DST_ALPHA;
        break;
      case x.Material.BlendingDstFactor.OneMinusDstColor:
        s = e.ONE_MINUS_DST_COLOR;
        break;
      case x.Material.BlendingDstFactor.OneMinusSrcAlpha:
        s = e.ONE_MINUS_SRC_ALPHA;
        break;
      case x.Material.BlendingDstFactor.OneMinusSrcColor:
        s = e.ONE_MINUS_SRC_COLOR;
        break;
      case x.Material.BlendingDstFactor.SrcAlpha:
        s = e.SRC_ALPHA;
        break;
      case x.Material.BlendingDstFactor.SrcColor:
        s = e.SRC_COLOR;
        break;
      case x.Material.BlendingDstFactor.Zero:
        s = e.ZERO;
        break;
      case x.Material.BlendingSrcFactor.SrcAlphaSaturate:
        s = e.SRC_ALPHA_SATURATE;
        break;
      default:
        s = e.ONE;
        break;
    }
    e.blendFunc(s, t);
  }
  /**
   * Applies the cull face property to the gl state
   */
  applyCullFace() {
    const e = this.gl;
    switch (this._cullFace === x.Material.CullSide.NONE ? (e.disable(e.CULL_FACE), this._cullEnabled = !1) : (e.enable(e.CULL_FACE), this._cullEnabled = !0), this._cullFace) {
      case x.Material.CullSide.CW:
        e.frontFace(e.CCW), e.cullFace(e.BACK);
        break;
      case x.Material.CullSide.CCW:
        e.frontFace(e.CW), e.cullFace(e.BACK);
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
class pr {
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
    const e = new pr(this);
    e.blending = Object.assign({}, this.blending), e.polygonOffset = Object.assign({}, this.polygonOffset), e.uniforms = Object.assign({}, this.uniforms);
    for (const t in e.uniforms) {
      const s = e.uniforms[t];
      if (s.gl) {
        const n = /* @__PURE__ */ new Map();
        s.gl.forEach((r, o) => {
          n.set(o, Object.assign({}, r));
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
class kl {
  constructor(e, t, s) {
    this.drawMode = x.Model.DrawMode.TRIANGLES, this.vertexDrawRange = [-1, -1], this.drawInstances = -1, this.vertexCount = 0, this.id = e, this.geometry = t, this.material = s;
  }
}
class jr {
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
const Sa = ve("performance");
class $h {
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
  clear(e, t, s) {
    const n = this.state.clearMask;
    this.state.clearMask = [
      n[0] || e || !1,
      n[1] || t || !1,
      n[2] || s || !1
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
    const e = Xn.getContext(this.options.canvas, {
      alpha: this.options.alpha || !1,
      antialias: this.options.antialias || !1,
      premultipliedAlpha: this.options.premultipliedAlpha || !1,
      preserveDrawingBuffer: this.options.preserveDrawingBuffer || !1
    });
    return e.context ? (this._gl = e.context, this.glState = new Vh(e.context, e.extensions), this.glProxy = new Xn(e.context, this.glState, e.extensions), this.glState.setProxy(this.glProxy), this.glState.syncState()) : this.options.onNoContext ? this.options.onNoContext() : console.warn(
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
  prepareAttribute(e, t, s) {
    if (this.glProxy.updateAttribute(t))
      (!e.gl || !e.gl.vao) && this.glProxy.useAttribute(s, t, e);
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
  render(e, t = null, s, n) {
    var a, c, l, u;
    if (!this.gl) return;
    this.setRenderTarget(t);
    const r = [];
    if (t && !Array.isArray(t) && (O.MRT || O.MRT_EXTENSION)) {
      const h = t.getGLBuffers();
      this.glState.setDrawBuffers(
        h.map((d) => (d == null ? void 0 : d.attachment) || 0)
      );
    }
    const o = this.state.clearMask;
    if ((o[0] || o[1] || o[2]) && (this.glProxy.clear(o[0], o[1], o[2]), this.state.clearMask = [!1, !1, !1]), Array.isArray(t))
      for (let h = 0, d = t.length; h < d; ++h) {
        const f = t[h];
        if (this.glState.useRenderTarget(f), f && !f.gl)
          return;
        e.models.forEach((p) => {
          this.renderModel(s, p, r, n);
        }), ((a = f.buffers.blit) != null && a.color || (c = f.buffers.blit) != null && c.depth) && this.glProxy.blitFramebuffer(f);
      }
    else {
      if (t && !t.gl)
        return;
      e.models.forEach((h) => {
        this.renderModel(s, h, r, n);
      }), ((l = t == null ? void 0 : t.buffers.blit) != null && l.color || (u = t == null ? void 0 : t.buffers.blit) != null && u.depth) && this.glProxy.blitFramebuffer(t);
    }
    r.forEach((h) => {
      e.remove(h);
    });
  }
  /**
   * Renders the specified model
   */
  renderModel(e, t, s, n) {
    var c;
    const r = t.geometry, o = t.material, a = this.glState.useMaterial(o);
    switch (e != null && e.props.materialSettings && this.glState.syncMaterial(e.props.materialSettings), a) {
      case Mt.VALID: {
        this.glProxy.compileGeometry(r);
        let l = !0;
        const u = (h, d) => {
          l = this.prepareAttribute(r, h, d) && l;
        };
        r.attributes.forEach(u), r.indexBuffer && (l = this.prepareIndexBuffer(r, r.indexBuffer) && l), (c = r.gl) != null && c.vao ? this.glState.bindVAO(r.gl.vao) : (this.glState.boundVAO && this.glState.bindVAO(null), this.glState.applyVertexAttributeArrays()), n == null || n(this.glState, t.id), l ? this.glProxy.draw(t) : (console.warn(
          "Geometry was unable to update correctly, thus we are skipping the drawing of",
          t
        ), s.push(t)), this.glState.bindVAO(null);
        break;
      }
      case Mt.INVALID: {
        console.warn(
          "Could not utilize material. Skipping draw call for:",
          o,
          r
        ), s.push(t);
        break;
      }
      case Mt.NO_RENDER_TARGET_MATCHES: {
        Sa(
          "Skipped draw for material due to no output matches for the current render target"
        );
        break;
      }
      default:
        Sa("Skipped draw for material due to unknown reasons");
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
  readPixels(e, t, s, n, r, o = 0) {
    if (!this.gl) return;
    const a = this.state.currentRenderTarget;
    let c = !0, l;
    if (Array.isArray(a))
      l = a.find((u) => {
        var h;
        return Array.isArray(u.buffers.color) ? u.buffers.color.find((d) => d.outputType === o) : ((h = u.buffers.color) == null ? void 0 : h.outputType) === o;
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
    if (e = Math.max(0, Math.min(e, ((l == null ? void 0 : l.width) || 0) - s)), t = Math.max(0, Math.min(t, ((l == null ? void 0 : l.height) || 0) - n)), l) {
      e + s > l.width && (s = l.width - e), t + n > l.height && (n = l.height - t);
      const u = l.height;
      this.gl.readPixels(
        e,
        u - t - n,
        s,
        n,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        r
      );
    } else {
      const u = this.getRenderSize(), h = u[1];
      e + s > u[0] && (s = u[0] - e), t + n > u[1] && (n = u[1] - t), this.gl.readPixels(
        e,
        h - t - n,
        s,
        n,
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
    const { canvas: t } = this.options, s = this.getDisplaySize();
    t.width = s[0] * e, t.height = s[1] * e, this.state.pixelRatio = e;
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
      const s = t[0].height;
      if (e) {
        const { x: n, y: r, width: o, height: a } = e;
        this.glState.setScissor({ x: n, y: s - r - a, width: o, height: a });
      } else
        this.glState.setScissor(null);
    } else if (t) {
      const s = t.height;
      if (e) {
        const { x: n, y: r, width: o, height: a } = e;
        this.glState.setScissor({ x: n, y: s - r - a, width: o, height: a });
      } else
        this.glState.setScissor(null);
    } else {
      const { renderSize: s } = this.state, n = s[1];
      if (e) {
        const { x: r, y: o, width: a, height: c } = e;
        this.glState.setScissor({
          x: r,
          y: n - o - c,
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
    const { canvas: s } = this.options, { pixelRatio: n } = this.state;
    s.width = Math.min(e * n, O.MAX_TEXTURE_SIZE), s.height = Math.min(t * n, O.MAX_TEXTURE_SIZE), s.style.width = `${e}px`, s.style.height = `${t}px`, this.state.renderSize = [s.width, s.height], this.state.displaySize = [e, t];
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
    const t = this.state.currentRenderTarget, { x: s, y: n, width: r, height: o } = e;
    if (Array.isArray(t)) {
      const a = t[0].height;
      this.glState.setViewport(s, a - n - o, r, o);
    } else if (t) {
      const a = t.height;
      this.glState.setViewport(s, a - n - o, r, o);
    } else {
      const { renderSize: a } = this.state, c = a[1];
      this.glState.setViewport(s, c - n - o, r, o);
    }
  }
}
const { min: En, max: yn } = Math;
class J {
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
    return new J({
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
    return e instanceof J ? (e.x < this.x && (this.width += Math.abs(e.x - this.x), this.x = e.x), e.y < this.y && (this.height += Math.abs(e.y - this.y), this.y = e.y), this.right < e.right && (this.width += e.right - this.right), this.bottom < e.bottom && (this.height += e.bottom - this.bottom), !0) : (e[0] < this.x && (this.width += this.x - e[0], this.x = e[0]), e[0] > this.right && (this.width += e[0] - this.x), e[1] < this.y && (this.height += this.y - e[1], this.y = e[1]), e[1] > this.bottom && (this.height += e[1] - this.y), !0);
  }
  /**
   * Grows the bounds (if needed) to encompass all bounds or points provided. This
   * performs much better than running encapsulate one by one.
   */
  encapsulateAll(e) {
    if (e.length <= 0) return;
    let t = Number.MAX_SAFE_INTEGER, s = Number.MIN_SAFE_INTEGER, n = Number.MAX_SAFE_INTEGER, r = Number.MIN_SAFE_INTEGER;
    if (e[0] instanceof J) {
      const o = e;
      for (let a = 0, c = o.length; a < c; ++a) {
        const l = o[a];
        t = En(t, l.left), s = yn(s, l.right), n = En(n, l.top), r = yn(r, l.bottom);
      }
    } else {
      const o = e;
      for (let a = 0, c = o.length; a < c; ++a) {
        const [l, u] = o[a];
        t = En(t, l), s = yn(s, l), n = En(n, u), r = yn(r, u);
      }
    }
    this.x = Math.min(this.x, t), this.y = Math.min(this.y, n), this.width = Math.max(this.width, s - t), this.height = Math.max(this.height, r - n);
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
function yt(i, e, t) {
  const s = `${i}`, n = parseFloat(s);
  return isNaN(n) ? 0 : s.indexOf("%") > -1 ? n / 100 * e : n * t;
}
const Es = /* @__PURE__ */ new WeakSet();
function Ca(i, e, t) {
  (e.width === 0 || e.height === 0) && (Es.has(i) || (console.warn(
    "An AbsolutePosition evaluated to invalid dimensions.",
    "Please ensure that the object provided and the reference has valid dimensions",
    "to produce dimensions with width and height that are non-zero.",
    "item:",
    i,
    "reference:",
    e.toString()
  ), Es.add(i)));
  const s = J.emptyBounds();
  let n, r;
  if (i.width)
    s.width = yt(i.width, e.width, t), i.left !== void 0 ? s.x = yt(i.left, e.width, t) : i.right !== void 0 && (s.x = e.width - yt(i.right, e.width, t) - s.width);
  else {
    const o = yt(i.left || 0, e.width, t);
    n = e.width - yt(i.right || 0, e.width, t) - o, n < 0 && (Es.has(i) || (console.warn(
      "An AbsolutePosition evaluated to invalid dimensions.",
      "Please ensure that the object provided and the reference has valid dimensions",
      "to produce dimensions with width and height that are greater than zero.",
      "item:",
      i,
      "reference:",
      e.toString()
    ), Es.add(i))), s.x = o, s.width = n;
  }
  if (i.height)
    s.height = yt(i.height, e.height, t), i.top !== void 0 ? s.y = yt(i.top, e.height, t) : i.bottom !== void 0 && (s.y = e.height - yt(i.bottom, e.height, t) - s.height);
  else {
    const o = yt(i.top || 0, e.height, t);
    r = e.height - yt(i.bottom || 0, e.height, t) - o, (r === void 0 || r < 0) && (Es.has(i) || (console.warn(
      "An AbsolutePosition evaluated to invalid dimensions.",
      "Please ensure that the object provided and the reference has valid dimensions",
      "to produce dimensions with width and height that are greater than zero.",
      "item:",
      i,
      "reference:",
      e.toString()
    ), Es.add(i))), s.y = o, s.height = r;
  }
  return (s.width === 0 || s.height === 0 || isNaN(s.x + s.y + s.width + s.height)) && (s.x = 0, s.y = 0, s.width = e.width, s.height = e.height), s;
}
const _t = class _t {
  /**
   * This activates all observables to gather their UIDs when they are retrieved
   * via their getter. All of the ID's gathered can be accessed via
   * getObservableMonitorIds. It is REQUIRED that this is disabled again to
   * prevent a MASSIVE memory leak.
   */
  static setObservableMonitor(e) {
    _t.gatherIds = e, _t.observableIds = [];
  }
  /**
   * This retrieves the observables monitored IDs that were gathered when
   * setObservableMonitor was enabled.
   */
  static getObservableMonitorIds(e) {
    const t = _t.observableIds.slice(0);
    return e && (_t.observableIds = []), t;
  }
};
_t.setCycle = !1, _t.gatherIds = !1, _t.observableIds = [], _t.observableNamesToUID = /* @__PURE__ */ new Map();
let Se = _t;
const At = Se, Fn = /* @__PURE__ */ new Map();
let Wh = 1;
const jh = {}.constructor;
function Hh(i, e) {
  const t = At.observableNamesToUID.get(e) || 0;
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
  function s() {
    return At.gatherIds && (At.setCycle || At.observableIds.push(t)), i.observableStorage[t];
  }
  function n(o) {
    At.gatherIds && (At.setCycle = !0), i.observableStorage[t] = o, i.changes[t] = t, i.observer && i.observer.instanceUpdated(i), At.gatherIds && (At.setCycle = !1);
  }
  const r = i[e];
  Object.defineProperty(i, e, {
    configurable: !0,
    enumerable: !0,
    get: s,
    set: n
  }), i[e] = r;
}
function I(i, e, t) {
  t || (t = {
    configurable: !0,
    enumerable: !0
  });
  let s = Fn.get(i.constructor), n = At.observableNamesToUID.get(e) || 0;
  n === 0 && (n = ++Wh, At.observableNamesToUID.set(e, n)), s || (s = /* @__PURE__ */ new Set(), Fn.set(i.constructor, s)), s.add(e);
  let r = Object.getPrototypeOf(i), o = 0;
  for (; r.constructor !== jh && ++o < 100; ) {
    const a = Fn.get(r.constructor);
    a && a.forEach((c) => s == null ? void 0 : s.add(c)), r = Object.getPrototypeOf(r);
  }
  o >= 100 && console.warn(
    "@observable decorator encountered a type that has 100+ levels of inheritance. This is most likely an error, and may be a result of a circular dependency and will not be supported by this decorator."
  ), t.enumerable = !0, t.writable = !0, Object.defineProperty(i, e, t);
}
function Xe(i, e) {
  if (i.constructor !== e) return;
  const t = Fn.get(e);
  t && t.forEach((s) => Hh(i, s));
}
class ae {
  constructor(e) {
    if (this._uid = P(), this.cleanObservation = /* @__PURE__ */ new Map(), this.instanceChanges = /* @__PURE__ */ new Map(), this.allowChanges = !0, this.resolveContext = "", e)
      for (let t = 0, s = e.length; t < s; ++t) {
        const n = e[t];
        this.add(n);
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
   * Adds an instance to the provider which will stream observable changes of
   * the instance to the framework.
   */
  add(e) {
    if (this.cleanObservation.get(e.uid))
      return e;
    if (this.allowChanges) {
      e.observer = this;
      const t = e.observableDisposer;
      this.cleanObservation.set(e.uid, [e, t]), this.instanceChanges.set(e.uid, [
        e,
        me.INSERT,
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
      me.CHANGE,
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
        me.REMOVE,
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
   * This performs an operation that forces all of the instances to be flagged
   * as an 'add' change. This allows a layer listening to this provider to
   * ensure it has added all currently existing instances monitored by the
   * provider.
   *
   * NOTE: This is a VERY poor performing method and should probably be used by
   * the framework and not manually.
   */
  sync() {
    const e = [];
    this.cleanObservation.forEach((t) => {
      const { 0: s } = t;
      this.instanceChanges.set(s.uid, [
        s,
        me.INSERT,
        e
      ]);
    });
  }
}
class Zb extends ae {
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
    const t = this._instances.findIndex((s) => s.uid === e.uid);
    return t !== -1 && this._instances.splice(t, 1), super.remove(e);
  }
  destroy() {
    this._instances.length = 0, super.destroy();
  }
}
class Ul {
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
var Xh = Object.defineProperty, zl = (i, e, t, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(e, t, n) || n);
  return n && Xh(e, t, n), n;
};
let Oa = 0;
const Go = class Hr {
  constructor(e) {
    this._active = !1, this.changes = {}, this._observer = null, this.observableStorage = [], this._uid = Hr.newUID, this.reactivate = !1, Xe(this, Hr), e && (this.active = e.active || this.active);
  }
  static get newUID() {
    return Oa = ++Oa % 16777215;
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
        const s = this.easing.get(t);
        if (s instanceof Ul)
          return s;
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
zl([
  I
], Go.prototype, "_active");
zl([
  I
], Go.prototype, "_uid");
let dt = Go;
class Vo {
  constructor() {
    this._uid = P(), this.id = "", this.pixelRatio = 1, this._screenScale = [1, 1];
  }
  /** Provides a numerical UID for this object */
  get uid() {
    return this._uid;
  }
  /** This is the rendering bounds within screen space */
  get screenBounds() {
    return this._scaledScreenBounds || (this._scaledScreenBounds = new J({
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
    Mo(e, this._screenScale) || (delete this._scaledScreenBounds, this._screenScale = e);
  }
  /**
   * This projects a point to be relative to the rendering dimensions of the
   * view.
   */
  screenToRenderSpace(e, t) {
    return t = this.screenToView(e, t), le(t, e[0] * this.pixelRatio, e[1] * this.pixelRatio);
  }
  /**
   * This projects a point relative to the render space of the view to the
   * screen coordinates
   */
  renderSpaceToScreen(e, t) {
    return t = t || [0, 0], le(
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
    return t = t || [0, 0], le(
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
    return t = t || [0, 0], le(
      t,
      e[0] + this.screenBounds.x,
      e[1] + this.screenBounds.y
    );
  }
}
class Qh extends Vo {
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
class fs {
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
function Yh(i) {
  return {
    key: "",
    type: oe.COLOR_BUFFER,
    ...i
  };
}
function sn(i) {
  return i !== void 0 && i.key !== void 0 && i.type === oe.COLOR_BUFFER;
}
class La extends fs {
  constructor(e, t) {
    super(e), this.type = oe.COLOR_BUFFER, this.height = e.height, this.width = e.width, this.colorBufferSettings = e.colorBufferSettings, this.createColorBuffer(t);
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
   * This generates the colorBuffer object needed for this resource.
   */
  createColorBuffer(e) {
    if (this.colorBuffer) return;
    this.colorBufferSettings = {
      ...this.colorBufferSettings
    };
    let t, s;
    const n = (e == null ? void 0 : e.getRenderSize()) || [1, 1];
    if (this.width <= gt.SCREEN) {
      if (!e)
        throw new Error(
          "Can not generate Render Texture with a dynamic width or height when the WebGLRenderer is not available"
        );
      t = n[0] / -this.width;
    } else t = this.width;
    if (this.height <= gt.SCREEN) {
      if (!e)
        throw new Error(
          "Can not generate Render Texture with a dynamic width or height when the WebGLRenderer is not available"
        );
      s = n[1] / -this.width;
    } else s = this.height;
    this.colorBuffer = new ft({
      internalFormat: x.RenderTarget.ColorBufferFormat.RGBA8,
      size: [t, s],
      ...this.colorBufferSettings
    });
  }
}
class un {
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
class qh extends un {
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
  request(e, t, s) {
    return [0, 0, 0, 0];
  }
  updateResource(e) {
  }
}
const Kh = new qh();
class Zh extends un {
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
    t = new La(e, this.webGLRenderer), this.resources.set(e.key, t);
  }
  /**
   * Handle requests that stream in from instances requesting metrics for a
   * specific resource.
   */
  request(e, t, s, n) {
    const r = this.resources.get(s.key);
    return r ? (s.colorBuffer = r.colorBuffer, [0, 0, 1, 1]) : [0, 0, 0, 0];
  }
  /**
   * Trigger that executes when the rendering context resizes. For this manager,
   * we will update all textures with dimensions that are tied to the screen.
   */
  resize() {
    const e = /* @__PURE__ */ new Map();
    this.resources.forEach((t, s) => {
      t.width > gt.SCREEN && t.height > gt.SCREEN || (t.colorBuffer.destroy(), t = new La(t, this.webGLRenderer), e.set(s, t));
    }), e.forEach((t, s) => this.resources.set(s, t));
  }
  /**
   * This targets the specified resource and attempts to update it's settings.
   */
  updateResource(e) {
    this.resources.get(e.key) && console.warn("UPDATING AN EXISTING COLOR BUFFER IS NOT SUPPORTED YET");
  }
}
function Xr(i) {
  return {
    type: oe.COLOR_BUFFER,
    ...i
  };
}
function Gl(i) {
  return {
    key: "",
    type: oe.TEXTURE,
    ...i
  };
}
function Pi(i) {
  return i && i.key !== void 0 && i.type === oe.TEXTURE;
}
class Or extends fs {
  constructor(e, t) {
    super(e), this.type = oe.TEXTURE, this.height = e.height, this.width = e.width, this.textureSettings = e.textureSettings, this.createTexture(t);
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
    let t, s;
    const n = (e == null ? void 0 : e.getRenderSize()) || [1, 1];
    if (this.width <= gt.SCREEN) {
      if (!e)
        throw new Error(
          "Can not generate Render Texture with a dynamic width or height when the WebGLRenderer is not available"
        );
      t = n[0] / -this.width;
    } else t = this.width;
    if (this.height <= gt.SCREEN) {
      if (!e)
        throw new Error(
          "Can not generate Render Texture with a dynamic width or height when the WebGLRenderer is not available"
        );
      s = n[1] / -this.width;
    } else s = this.height;
    this.texture = new W({
      data: ((r = this.textureSettings) == null ? void 0 : r.data) || {
        width: t,
        height: s,
        buffer: null
      },
      ...this.textureSettings
    });
  }
}
function nn(i) {
  return {
    type: oe.TEXTURE,
    ...i
  };
}
const { min: Jh, max: ed, pow: Na, round: td, sin: Hs, PI: Os } = Math, hn = td(Os * 1e3) / 1e3;
function Q(i, e, t) {
  return Jh(ed(i, e), t);
}
var Qt = /* @__PURE__ */ ((i) => (i[i.NONE = 1] = "NONE", i[i.CONTINUOUS = 4] = "CONTINUOUS", i[i.REPEAT = 2] = "REPEAT", i[i.REFLECT = 3] = "REFLECT", i))(Qt || {});
const id = `
\${easingMethod} {
  return end;
}
`, sd = `
\${easingMethod} {
  return (end - start) * t + start;
}
`, nd = `
\${easingMethod} {
  float time = t * t;
  return (end - start) * time + start;
}
`, rd = `
\${easingMethod} {
  float time = t * (2.0 - t);
  return (end - start) * time + start;
}
`, od = `
\${easingMethod} {
  float time = t < 0.5 ? 2.0 * t * t : -1.0 + (4.0 - 2.0 * t) * t;
  return (end - start) * time + start;
}
`, ad = `
\${easingMethod} {
  float time = t * t * t;
  return (end - start) * time + start;
}
`, cd = `
\${easingMethod} {
  float t1 = t - 1.0;
  float time = t1 * t1 * t1 + 1.0;
  return (end - start) * time + start;
}
`, ld = `
\${easingMethod} {
  float time = t < 0.5 ? 4.0 * t * t * t : (t - 1.0) * (2.0 * t - 2.0) * (2.0 * t - 2.0) + 1.0;
  return (end - start) * time + start;
}
`, ud = `
\${easingMethod} {
  float time = t * t * t * t;
  return (end - start) * time + start;
}
`, hd = `
\${easingMethod} {
  float t1 = t - 1.0;
  float time = 1.0 - t1 * t1 * t1 * t1;
  return (end - start) * time + start;
}
`, dd = `
\${easingMethod} {
  float t1 = t - 1.0;
  float time = t < 0.5 ? 8.0 * t * t * t * t : 1.0 - 8.0 * t1 * t1 * t1 * t1;
  return (end - start) * time + start;
}
`, fd = `
\${easingMethod} {
  float time = t * t * t * t * t;
  return (end - start) * time + start;
}
`, pd = `
\${easingMethod} {
  float t1 = t - 1.0;
  float time = 1.0 + t1 * t1 * t1 * t1 * t1;
  return (end - start) * time + start;
}
`, gd = `
\${easingMethod} {
  float t1 = t - 1.0;
  float time = t < 0.5 ? 16.0 * t * t * t * t * t : 1.0 + 16.0 * t1 * t1 * t1 * t1 * t1;
  return (end - start) * time + start;
}
`, md = `
\${easingMethod} {
  float p = 0.3;
  float time = pow(2.0, -10.0 * t) * sin((t - p / 4.0) * (2.0 * ${hn}) / p) + 1.0;
  return (end - start) * time + start;
}
`, bd = `
\${easingMethod} {
  float time = t * t * t - t * 1.05 * sin(t * ${hn});
  return (end - start) * time + start;
}
`, xd = `
\${easingMethod} {
  float t1 = t - 1.0;
  float a = 1.7;
  float time = (t1 * t1 * ((a + 1.0) * t1 + a) + 1.0);
  return (end - start) * time + start;
}
`, vd = `
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
`, wd = `
\${easingMethod} {
  \${T} direction = end - start;
  return start + direction * 0.5 + direction * sin(t * ${hn} * 2.0) * 0.5;
}
`, Td = `
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
`, Ed = `
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
`, yd = `
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
`, Rd = `
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
`, Ad = `
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
`, _d = `
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
`, Id = `
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
`, Md = `
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
`, Sd = `
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
`, Cd = `
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
`, Od = `
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
`, Ld = `
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
`, Nd = `
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
`, Bd = `
\${easingMethod} {
  float p = 0.3;
  float time = pow(2.0, -10.0 * t) * sin((t - p / 4.0) * (2.0 * ${hn}) / p) + 1.0;
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
`, Pd = `
\${easingMethod} {
  float time = t * t * t - t * 1.05 * sin(t * ${hn});
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
`, Fd = `
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
`, Dd = `
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
class $o {
  constructor(e, t, s, n) {
    this.uid = P(), this.delay = 0, this.duration = 500, this.loop = 1, this.cpu = e, this.gpu = t, this.duration = s || 500, this.methodName = n || "easingMethod";
  }
  /**
   * Autoeasing methods for linear easing
   */
  static immediate(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        const { copy: c } = F(n);
        return c(r, a);
      },
      delay: t,
      duration: e,
      gpu: id,
      loop: s,
      methodName: "immediate"
    };
  }
  /**
   * Autoeasing methods for linear easing
   */
  static linear(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        const { add: c, scale: l, subtract: u } = F(n);
        return o = Q(o, 0, 1), c(l(u(r, n), o), n, a);
      },
      delay: t,
      duration: e,
      gpu: sd,
      loop: s,
      methodName: "linear"
    };
  }
  /**
   * Auto easing for Accelerating to end
   */
  static easeInQuad(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        o = Q(o, 0, 1);
        const c = o * o, { add: l, scale: u, subtract: h } = F(n);
        return l(u(h(r, n), c), n, a);
      },
      delay: t,
      duration: e,
      gpu: nd,
      loop: s,
      methodName: "easeInQuad"
    };
  }
  /**
   * Auto easing for decelerating to end
   */
  static easeOutQuad(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        o = Q(o, 0, 1);
        const c = o * (2 - o), { add: l, scale: u, subtract: h } = F(n);
        return l(u(h(r, n), c), n, a);
      },
      delay: t,
      duration: e,
      gpu: rd,
      loop: s,
      methodName: "easeOutQuad"
    };
  }
  /**
   * Auto easing for Accelerate to mid, then decelerate to end
   */
  static easeInOutQuad(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        o = Q(o, 0, 1);
        const c = o < 0.5 ? 2 * o * o : -1 + (4 - 2 * o) * o, { add: l, scale: u, subtract: h } = F(n);
        return l(u(h(r, n), c), n, a);
      },
      delay: t,
      duration: e,
      gpu: od,
      loop: s,
      methodName: "easeInOutQuad"
    };
  }
  /**
   * Auto easing for Slower acceleration
   */
  static easeInCubic(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        o = Q(o, 0, 1);
        const c = o * o * o, { add: l, scale: u, subtract: h } = F(n);
        return l(u(h(r, n), c), n, a);
      },
      delay: t,
      duration: e,
      gpu: ad,
      loop: s,
      methodName: "easeInCubic"
    };
  }
  /**
   * Auto easing for Slower deceleration
   */
  static easeOutCubic(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        o = Q(o, 0, 1);
        const c = --o * o * o + 1, { add: l, scale: u, subtract: h } = F(n);
        return l(u(h(r, n), c), n, a);
      },
      delay: t,
      duration: e,
      gpu: cd,
      loop: s,
      methodName: "easeOutCubic"
    };
  }
  /**
   * Auto easing for Slower acceleration to mid, and slower deceleration to end
   */
  static easeInOutCubic(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        o = Q(o, 0, 1);
        const c = o < 0.5 ? 4 * o * o * o : (o - 1) * (2 * o - 2) * (2 * o - 2) + 1, { add: l, scale: u, subtract: h } = F(n);
        return l(u(h(r, n), c), n, a);
      },
      delay: t,
      duration: e,
      gpu: ld,
      loop: s,
      methodName: "easeInOutCubic"
    };
  }
  /**
   * Auto easing for even Slower acceleration to end
   */
  static easeInQuart(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        o = Q(o, 0, 1);
        const c = o * o * o * o, { add: l, scale: u, subtract: h } = F(n);
        return l(u(h(r, n), c), n, a);
      },
      delay: t,
      duration: e,
      gpu: ud,
      loop: s,
      methodName: "easeInQuart"
    };
  }
  /**
   * Auto easing for even Slower deceleration to end
   */
  static easeOutQuart(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        o = Q(o, 0, 1);
        const c = 1 - --o * o * o * o, { add: l, scale: u, subtract: h } = F(n);
        return l(u(h(r, n), c), n, a);
      },
      delay: t,
      duration: e,
      gpu: hd,
      loop: s,
      methodName: "easeOutQuart"
    };
  }
  /**
   * Auto easing for even Slower acceleration to mid, and even slower deceleration to end
   */
  static easeInOutQuart(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        o = Q(o, 0, 1);
        const c = o < 0.5 ? 8 * o * o * o * o : 1 - 8 * --o * o * o * o, { add: l, scale: u, subtract: h } = F(n);
        return l(u(h(r, n), c), n, a);
      },
      delay: t,
      duration: e,
      gpu: dd,
      loop: s,
      methodName: "easeInOutQuart"
    };
  }
  /**
   * Auto easing for super slow accelerating to the end
   */
  static easeInQuint(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        o = Q(o, 0, 1);
        const c = o * o * o * o * o, { add: l, scale: u, subtract: h } = F(n);
        return l(u(h(r, n), c), n, a);
      },
      delay: t,
      duration: e,
      gpu: fd,
      loop: s,
      methodName: "easeInQuint"
    };
  }
  /**
   * Auto easing for super slow decelerating to the end
   */
  static easeOutQuint(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        o = Q(o, 0, 1);
        const c = 1 + --o * o * o * o * o, { add: l, scale: u, subtract: h } = F(n);
        return l(u(h(r, n), c), n, a);
      },
      delay: t,
      duration: e,
      gpu: pd,
      loop: s,
      methodName: "easeOutQuint"
    };
  }
  /**
   * Auto easing for super slow accelerating to mid and super slow decelerating to the end
   */
  static easeInOutQuint(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        o = Q(o, 0, 1);
        const c = o < 0.5 ? 16 * o * o * o * o * o : 1 + 16 * --o * o * o * o * o, { add: l, scale: u, subtract: h } = F(n);
        return l(u(h(r, n), c), n, a);
      },
      delay: t,
      duration: e,
      gpu: gd,
      loop: s,
      methodName: "easeInOutQuint"
    };
  }
  /**
   * Auto easing for elastic effect
   */
  static easeOutElastic(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        o = Q(o, 0, 1);
        const c = 0.3, l = Na(2, -10 * o) * Hs((o - c / 4) * (2 * Os) / c) + 1, { add: u, scale: h, subtract: d } = F(n);
        return u(h(d(r, n), l), n, a);
      },
      delay: t,
      duration: e,
      gpu: md,
      loop: s,
      methodName: "easeOutElastic"
    };
  }
  /**
   * Auto easing for retracting first then shooting to the end
   */
  static easeBackIn(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        o = Q(o, 0, 1);
        const l = o * o * o - o * 1.05 * Hs(o * Os), { add: u, scale: h, subtract: d } = F(n);
        return u(h(d(r, n), l), n, a);
      },
      delay: t,
      duration: e,
      gpu: bd,
      loop: s,
      methodName: "easeBackIn"
    };
  }
  /**
   * Auto easing for overshooting at the end
   */
  static easeBackOut(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        o = Q(o, 0, 1);
        const c = 1.7, l = o - 1, u = l * l * ((c + 1) * l + c) + 1, { add: h, scale: d, subtract: f } = F(n);
        return h(d(f(r, n), u), n, a);
      },
      delay: t,
      duration: e,
      gpu: xd,
      loop: s,
      methodName: "easeBackOut"
    };
  }
  /**
   * Auto easing for overshooting at the end
   */
  static easeBackInOut(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        o = Q(o, 0, 1);
        const l = 1.7 * 1.525, u = o / 0.5, h = u - 2, d = u < 1 ? 0.5 * (u * u * (l + 1) * u - l) : 0.5 * (h * h * ((l + 1) * h + l) + 2), { add: f, scale: p, subtract: g } = F(n);
        return f(p(g(r, n), d), n, a);
      },
      delay: t,
      duration: e,
      gpu: vd,
      loop: s,
      methodName: "easeBackInOut"
    };
  }
  /**
   * This is an easing method that performs a sinusoidal wave where the amplitude is
   * (start - end) * 2 and the wave starts at the start value.
   *
   * This is intended to work best with the CONTINUOUS loop style.
   */
  static continuousSinusoidal(e, t = 0, s = 4) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        const { add: c, scale: l, subtract: u } = F(n);
        o = Q(o, 0, 1);
        const h = u(r, n), d = l(h, 0.5);
        return c(
          c(n, d),
          l(d, Hs(o * Os * 2) * 1),
          a
        );
      },
      delay: t,
      duration: e,
      gpu: wd,
      loop: s,
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
  static slerpQuatLinear(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        if (!U(n) || !U(r) || !U(a)) {
          const { vec: u } = F(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), u(1, 0, 0, 0);
        }
        o = Q(o, 0, 1);
        const { slerpQuat: c, vec: l } = F(n);
        return c ? c(n, r, o, a) : l(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Td,
      loop: s,
      methodName: "slerpQuatLinear"
    };
  }
  static slerpQuatInQuad(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        if (!U(n) || !U(r) || !U(a)) {
          const { vec: h } = F(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), h(1, 0, 0, 0);
        }
        o = Q(o, 0, 1);
        const c = o * o, { slerpQuat: l, vec: u } = F(n);
        return l ? l(n, r, c, a) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Ed,
      loop: s,
      methodName: "slerpQuatInQuad"
    };
  }
  static slerpQuatOutQuad(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        if (!U(n) || !U(r) || !U(a)) {
          const { vec: h } = F(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), h(1, 0, 0, 0);
        }
        o = Q(o, 0, 1);
        const c = o * (2 - o), { slerpQuat: l, vec: u } = F(n);
        return l ? l(n, r, c, a) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: yd,
      loop: s,
      methodName: "slerpQuatOutQuad"
    };
  }
  static slerpQuatInOutQuad(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        if (!U(n) || !U(r) || !U(a)) {
          const { vec: h } = F(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), h(1, 0, 0, 0);
        }
        o = Q(o, 0, 1);
        const c = o < 0.5 ? 2 * o * o : -1 + (4 - 2 * o) * o, { slerpQuat: l, vec: u } = F(n);
        return l ? l(n, r, c, a) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Rd,
      loop: s,
      methodName: "slerpQuatInOutQuad"
    };
  }
  static slerpQuatInCubic(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        if (!U(n) || !U(r) || !U(a)) {
          const { vec: h } = F(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), h(1, 0, 0, 0);
        }
        o = Q(o, 0, 1);
        const c = o * o * o, { slerpQuat: l, vec: u } = F(n);
        return l ? l(n, r, c, a) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Ad,
      loop: s,
      methodName: "slerpQuatInCubic"
    };
  }
  static slerpQuatOutCubic(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        if (!U(n) || !U(r) || !U(a)) {
          const { vec: h } = F(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), h(1, 0, 0, 0);
        }
        o = Q(o, 0, 1);
        const c = --o * o * o + 1, { slerpQuat: l, vec: u } = F(n);
        return l ? l(n, r, c, a) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: _d,
      loop: s,
      methodName: "slerpQuatOutCubic"
    };
  }
  static slerpQuatInOutCubic(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        if (!U(n) || !U(r) || !U(a)) {
          const { vec: h } = F(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), h(1, 0, 0, 0);
        }
        o = Q(o, 0, 1);
        const c = o < 0.5 ? 4 * o * o * o : (o - 1) * (2 * o - 2) * (2 * o - 2) + 1, { slerpQuat: l, vec: u } = F(n);
        return l ? l(n, r, c, a) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Id,
      loop: s,
      methodName: "slerpQuatInOutCubic"
    };
  }
  static slerpQuatInQuart(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        if (!U(n) || !U(r) || !U(a)) {
          const { vec: h } = F(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), h(1, 0, 0, 0);
        }
        o = Q(o, 0, 1);
        const c = o * o * o * o, { slerpQuat: l, vec: u } = F(n);
        return l ? l(n, r, c, a) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Md,
      loop: s,
      methodName: "slerpQuatInQuart"
    };
  }
  static slerpQuatOutQuart(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        if (!U(n) || !U(r) || !U(a)) {
          const { vec: h } = F(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), h(1, 0, 0, 0);
        }
        o = Q(o, 0, 1);
        const c = 1 - --o * o * o * o, { slerpQuat: l, vec: u } = F(n);
        return l ? l(n, r, c, a) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Sd,
      loop: s,
      methodName: "slerpQuatOutQuart"
    };
  }
  static slerpQuatInOutQuart(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        if (!U(n) || !U(r) || !U(a)) {
          const { vec: h } = F(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), h(1, 0, 0, 0);
        }
        o = Q(o, 0, 1);
        const c = o < 0.5 ? 8 * o * o * o * o : 1 - 8 * --o * o * o * o, { slerpQuat: l, vec: u } = F(n);
        return l ? l(n, r, c, a) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Cd,
      loop: s,
      methodName: "slerpQuatInOutQuart"
    };
  }
  static slerpQuatInQuint(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        if (!U(n) || !U(r) || !U(a)) {
          const { vec: h } = F(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), h(1, 0, 0, 0);
        }
        o = Q(o, 0, 1);
        const c = o * o * o * o * o, { slerpQuat: l, vec: u } = F(n);
        return l ? l(n, r, c, a) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Od,
      loop: s,
      methodName: "slerpQuatInQuint"
    };
  }
  static slerpQuatOutQuint(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        if (!U(n) || !U(r) || !U(a)) {
          const { vec: h } = F(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), h(1, 0, 0, 0);
        }
        o = Q(o, 0, 1);
        const c = 1 + --o * o * o * o * o, { slerpQuat: l, vec: u } = F(n);
        return l ? l(n, r, c, a) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Ld,
      loop: s,
      methodName: "slerpQuatOutQuint"
    };
  }
  static slerpQuatInOutQuint(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        if (!U(n) || !U(r) || !U(a)) {
          const { vec: h } = F(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), h(1, 0, 0, 0);
        }
        o = Q(o, 0, 1);
        const c = o < 0.5 ? 16 * o * o * o * o * o : 1 + 16 * --o * o * o * o * o, { slerpQuat: l, vec: u } = F(n);
        return l ? l(n, r, c, a) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Nd,
      loop: s,
      methodName: "slerpQuatInOutQuint"
    };
  }
  static slerpQuatOutElastic(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        if (!U(n) || !U(r) || !U(a)) {
          const { vec: d } = F(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), d(1, 0, 0, 0);
        }
        o = Q(o, 0, 1);
        const c = 0.3, l = Na(2, -10 * o) * Hs((o - c / 4) * (2 * Os) / c) + 1, { slerpQuat: u, vec: h } = F(n);
        return u ? u(n, r, l, a) : h(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Bd,
      loop: s,
      methodName: "slerpQuatOutElastic"
    };
  }
  static slerpQuatBackIn(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        if (!U(n) || !U(r) || !U(a)) {
          const { vec: d } = F(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), d(1, 0, 0, 0);
        }
        o = Q(o, 0, 1);
        const l = o * o * o - o * 1.05 * Hs(o * Os), { slerpQuat: u, vec: h } = F(n);
        return u ? u(n, r, l, a) : h(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Pd,
      loop: s,
      methodName: "slerpQuatBackIn"
    };
  }
  static slerpQuatBackOut(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        if (!U(n) || !U(r) || !U(a)) {
          const { vec: f } = F(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), f(1, 0, 0, 0);
        }
        o = Q(o, 0, 1);
        const c = 1.7, l = o - 1, u = l * l * ((c + 1) * l + c) + 1, { slerpQuat: h, vec: d } = F(n);
        return h ? h(n, r, u, a) : d(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Fd,
      loop: s,
      methodName: "slerpQuatBackOut"
    };
  }
  static slerpQuatBackInOut(e, t = 0, s = 1) {
    return {
      uid: P(),
      cpu: (n, r, o, a) => {
        if (!U(n) || !U(r) || !U(a)) {
          const { vec: g } = F(r);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), g(1, 0, 0, 0);
        }
        o = Q(o, 0, 1);
        const l = 1.7 * 1.525, u = o / 0.5, h = u - 2, d = u < 1 ? 0.5 * (u * u * (l + 1) * u - l) : 0.5 * (h * h * ((l + 1) * h + l) + 2), { slerpQuat: f, vec: p } = F(n);
        return f ? f(n, r, d, a) : p(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Dd,
      loop: s,
      methodName: "slerpQuatBackInOut"
    };
  }
}
const { cos: nt, sin: rt, tan: Ut } = Math, ut = Math.PI / 2, ss = 0, ns = 1, rs = 2, os = 3, gr = 0, mr = 1, br = 2, xr = 3, vr = 4, wr = 5, Tr = 6, Er = 7, yr = 8, ci = 0, li = 1, ui = 2, hi = 3, di = 4, fi = 5, pi = 6, gi = 7, mi = 8, bi = 9, xi = 10, vi = 11, wi = 12, Ti = 13, Ei = 14, yi = 15, Ls = new Array(20).fill(0).map((i) => Ri()), De = new Array(20).fill(0).map((i) => re());
function xt(i, e, t, s, n) {
  return i = i || new Array(4), i[0] = e, i[1] = t, i[2] = s, i[3] = n, i;
}
function Je(i, e, t, s, n, r, o, a, c, l) {
  return i = i || new Array(9), i[0] = e, i[1] = t, i[2] = s, i[3] = n, i[4] = r, i[5] = o, i[6] = a, i[7] = c, i[8] = l, i;
}
function ge(i, e, t, s, n, r, o, a, c, l, u, h, d, f, p, g, m) {
  return i = i || new Array(16), i[0] = e, i[1] = t, i[2] = s, i[3] = n, i[4] = r, i[5] = o, i[6] = a, i[7] = c, i[8] = l, i[9] = u, i[10] = h, i[11] = d, i[12] = f, i[13] = p, i[14] = g, i[15] = m, i;
}
const Ba = Ri(), Pa = Ri(), Lr = Ri(), kd = Ri();
function de(i) {
  return i[3] * i[0] - i[1] * i[2];
}
function Bs(i) {
  return i[0] * i[4] * i[8] - i[0] * i[5] * i[7] + i[1] * i[5] * i[6] - i[1] * i[3] * i[8] + i[2] * i[3] * i[7] - i[2] * i[4] * i[6];
}
function Vl(i) {
  return Je(
    Ba,
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
    Pa,
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
    Lr,
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
    Lr,
    i[4],
    i[5],
    i[6],
    i[8],
    i[9],
    i[10],
    i[12],
    i[13],
    i[14]
  ), i[0] * Bs(Ba) - i[1] * Bs(Pa) + i[2] * Bs(Lr) - i[3] * Bs(kd);
}
function Ud(i, e) {
  const t = de(i);
  return t === 0 ? null : xt(
    e,
    i[3] / t,
    -i[1] / t,
    -i[2] / t,
    i[0] / t
  );
}
function zd(i, e) {
  const t = Bs(i);
  if (t === 0) return null;
  const s = de([i[4], i[5], i[7], i[8]]), n = de([i[3], i[5], i[6], i[8]]), r = de([i[3], i[4], i[6], i[7]]), o = de([i[1], i[2], i[7], i[8]]), a = de([i[0], i[2], i[6], i[8]]), c = de([i[0], i[1], i[6], i[7]]), l = de([i[1], i[2], i[4], i[5]]), u = de([i[0], i[2], i[3], i[5]]), h = de([i[0], i[1], i[3], i[4]]);
  return Je(
    e,
    s / t,
    -o / t,
    l / t,
    -n / t,
    a / t,
    u / t,
    r / t,
    -c / t,
    h / t
  );
}
function Gd(i, e) {
  const t = Vl(i);
  if (t === 0) return null;
  const s = de([i[0], i[1], i[4], i[5]]), n = de([i[0], i[2], i[4], i[6]]), r = de([i[0], i[3], i[4], i[7]]), o = de([i[1], i[2], i[5], i[6]]), a = de([i[1], i[3], i[5], i[7]]), c = de([i[2], i[3], i[6], i[7]]), l = de([i[10], i[11], i[14], i[15]]), u = de([i[9], i[11], i[13], i[15]]), h = de([i[9], i[10], i[13], i[14]]), d = de([i[8], i[11], i[12], i[15]]), f = de([i[8], i[10], i[12], i[14]]), p = de([i[8], i[9], i[12], i[13]]);
  return ge(
    e,
    //                                                     |                                                        |                                                           |
    (i[5] * l - i[6] * u + i[7] * h) / t,
    (-i[1] * l + i[2] * u - i[3] * h) / t,
    (i[12] * c - i[13] * a + i[14] * o) / t,
    (-i[9] * c + i[10] * a - i[11] * o) / t,
    (-i[4] * l + i[6] * d - i[7] * f) / t,
    (i[0] * l - i[2] * d + i[3] * f) / t,
    (-i[12] * c + i[14] * r - i[15] * n) / t,
    (i[8] * c - i[10] * r + i[11] * n) / t,
    (i[4] * u - i[5] * d + i[7] * p) / t,
    (-i[0] * u + i[1] * d - i[3] * p) / t,
    (i[12] * a - i[13] * r + i[15] * s) / t,
    (-i[8] * a + i[9] * r - i[11] * s) / t,
    (-i[4] * h + i[5] * f - i[6] * p) / t,
    (i[0] * h - i[1] * f + i[2] * p) / t,
    (-i[12] * o + i[13] * n - i[14] * s) / t,
    (i[8] * o - i[9] * n + i[10] * s) / t
  );
}
function Vd(i, e, t) {
  return xt(
    t,
    i[0] * e,
    i[1] * e,
    i[2] * e,
    i[3] * e
  );
}
function $d(i, e, t) {
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
function Wd(i, e, t) {
  return ge(
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
function Rr(i) {
  return xt(
    i,
    1,
    0,
    0,
    1
  );
}
function Ri(i) {
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
function re(i) {
  return ge(
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
function jd(i, e, t) {
  return xt(
    t,
    e[ss] * i[ss] + e[ns] * i[rs],
    e[ss] * i[ns] + e[ns] * i[os],
    e[rs] * i[ss] + e[os] * i[rs],
    e[rs] * i[ns] + e[os] * i[os]
  );
}
function Hd(i, e, t) {
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
function Xd(i, ...e) {
  if (e.length <= 0) return re();
  if (i = i || re(), e.length === 1) return an(e[0], i);
  let t = e[0], s = De[De.length - 1], n = De[De.length - 2];
  i === s && (s = De[De.length - 3]), i === n && (n = De[De.length - 3]);
  let r = s;
  for (let o = 1, a = e.length - 1; o < a; ++o) {
    const c = e[o];
    t = lt(t, c, r), r = r === s ? n : s;
  }
  return lt(t, e[e.length - 1], i);
}
function Qd(i, e, t) {
  return xt(
    t,
    i[0] + e[0],
    i[1] + e[1],
    i[2] + e[2],
    i[3] + e[3]
  );
}
function Yd(i, e, t) {
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
function qd(i, e, t) {
  return ge(
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
function Kd(i, e, t) {
  return xt(
    t,
    i[0] - e[0],
    i[1] - e[1],
    i[2] - e[2],
    i[3] - e[3]
  );
}
function Zd(i, e, t) {
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
function Jd(i, e, t) {
  return ge(
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
function ef(i, e, t) {
  return xt(
    t,
    i[0] * e[0],
    i[1] * e[1],
    i[2] * e[2],
    i[3] * e[3]
  );
}
function tf(i, e, t) {
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
function sf(i, e, t) {
  return ge(
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
function nf(i, e) {
  return xt(
    e,
    i[0],
    i[2],
    i[1],
    i[3]
  );
}
function Dn(i, e) {
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
function rf(i, e) {
  return ge(
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
function of(i, e) {
  return (i >= Math.PI / 2 || i <= -Math.PI / 2) && console.warn("A shear matrix can not have radians >= PI / 2 or <= -PI / 2"), e = e || Rr(), xt(
    e,
    1,
    0,
    Ut(i),
    1
  );
}
function af(i, e) {
  return (i >= Math.PI / 2 || i <= -Math.PI / 2) && console.warn("A shear matrix can not have radians >= PI / 2 or <= -PI / 2"), e = e || Rr(), xt(
    e,
    1,
    Ut(i),
    0,
    1
  );
}
function cf(i, e, t) {
  (e >= ut || e <= -ut || i >= ut || i <= -ut) && console.warn("A shear matrix can not have radians >= PI / 2 or <= -PI / 2"), t = t || re();
  const s = Ut(e), n = Ut(i);
  return ge(
    t,
    1,
    0,
    0,
    0,
    n,
    1,
    0,
    0,
    s,
    0,
    1,
    0,
    0,
    0,
    0,
    1
  );
}
function lf(i, e, t) {
  (e >= ut || e <= -ut || i >= ut || i <= -ut) && console.warn("A shear matrix can not have radians >= PI / 2 or <= -PI / 2"), t = t || re();
  const s = Ut(e), n = Ut(i);
  return ge(
    t,
    1,
    n,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    s,
    1,
    0,
    0,
    0,
    0,
    1
  );
}
function uf(i, e, t) {
  (e >= ut || e <= -ut || i >= ut || i <= -ut) && console.warn("A shear matrix can not have radians >= PI / 2 or <= -PI / 2"), t = t || re();
  const s = Ut(e), n = Ut(i);
  return ge(
    t,
    1,
    0,
    n,
    0,
    0,
    1,
    s,
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
function hf(i, e, t) {
  return le(
    t,
    i[ss] * e[0] + i[rs] * e[1],
    i[ns] * e[0] + i[os] * e[1]
  );
}
function df(i, e, t) {
  return fe(
    t,
    i[gr] * e[0] + i[xr] * e[1] + i[Tr] * e[2],
    i[mr] * e[0] + i[vr] * e[1] + i[Er] * e[2],
    i[br] * e[0] + i[wr] * e[1] + i[yr] * e[2]
  );
}
function ff(i, e, t) {
  return ue(
    t,
    i[ci] * e[0] + i[di] * e[1] + i[mi] * e[2] + i[wi] * 1,
    i[li] * e[0] + i[fi] * e[1] + i[bi] * e[2] + i[Ti] * 1,
    i[ui] * e[0] + i[pi] * e[1] + i[xi] * e[2] + i[Ei] * 1,
    i[hi] * e[0] + i[gi] * e[1] + i[vi] * e[2] + i[yi] * 1
  );
}
function Kn(i, e, t) {
  return ue(
    t,
    i[ci] * e[0] + i[di] * e[1] + i[mi] * e[2] + i[wi] * e[3],
    i[li] * e[0] + i[fi] * e[1] + i[bi] * e[2] + i[Ti] * e[3],
    i[ui] * e[0] + i[pi] * e[1] + i[xi] * e[2] + i[Ei] * e[3],
    i[hi] * e[0] + i[gi] * e[1] + i[vi] * e[2] + i[yi] * e[3]
  );
}
function pf(i) {
  return `Matrix: [
  ${i[0]}, ${i[1]},
  ${i[2]}, ${i[3]},
]`;
}
function gf(i) {
  return `Matrix: [
  ${i[0]}, ${i[1]}, ${i[2]},
  ${i[3]}, ${i[4]}, ${i[5]},
  ${i[6]}, ${i[7]}, ${i[8]},
]`;
}
function mf(i) {
  return `Matrix: [
  ${i[0]}, ${i[1]}, ${i[2]}, ${i[3]},
  ${i[4]}, ${i[5]}, ${i[6]}, ${i[7]},
  ${i[8]}, ${i[9]}, ${i[10]}, ${i[11]},
  ${i[12]}, ${i[13]}, ${i[14]}, ${i[15]},
]`;
}
function $l(i, e) {
  e = e || new Array(4);
  const t = Math.cos(i), s = Math.sin(i);
  return e[ss] = t, e[ns] = -s, e[rs] = s, e[os] = t, e;
}
function Wl(i, e, t, s) {
  if (i)
    if (e)
      if (t) {
        const n = nt(i), r = nt(e), o = nt(t), a = rt(i), c = rt(e), l = rt(t);
        return ge(
          s,
          r * o,
          r * l,
          -c,
          0,
          a * c * o - n * l,
          a * c * l + n * o,
          a * r,
          0,
          n * c * o + a * l,
          n * c * l - a * o,
          n * r,
          0,
          0,
          0,
          0,
          1
        );
      } else {
        const n = nt(i), r = nt(e), o = rt(i), a = rt(e);
        return ge(
          s,
          r,
          0,
          -a,
          0,
          o * a,
          n,
          o * r,
          0,
          n * a,
          -o,
          n * r,
          0,
          0,
          0,
          0,
          1
        );
      }
    else if (t) {
      const n = nt(i), r = nt(t), o = rt(i), a = rt(t);
      return ge(
        s,
        r,
        a,
        0,
        0,
        -n * a,
        n * r,
        o,
        0,
        o * a,
        -o * r,
        n,
        0,
        0,
        0,
        0,
        1
      );
    } else {
      const n = nt(i), r = rt(i);
      return ge(
        s,
        1,
        0,
        0,
        0,
        0,
        n,
        r,
        0,
        0,
        -r,
        n,
        0,
        0,
        0,
        0,
        1
      );
    }
  else if (e)
    if (t) {
      const n = nt(e), r = nt(t), o = rt(e), a = rt(t);
      return ge(
        s,
        n * r,
        n * a,
        -o,
        0,
        -a,
        r,
        0,
        0,
        o * r,
        o * a,
        n,
        0,
        0,
        0,
        0,
        1
      );
    } else {
      const n = nt(e), r = rt(e);
      return ge(
        s,
        n,
        0,
        -r,
        0,
        0,
        1,
        0,
        0,
        r,
        0,
        n,
        0,
        0,
        0,
        0,
        1
      );
    }
  else if (t) {
    const n = nt(t), r = rt(t);
    return ge(
      s,
      n,
      r,
      0,
      0,
      -r,
      n,
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
    return re(s);
}
function bf(i, e) {
  return Wl(i[0], i[1], i[2], e);
}
function xf(i, e) {
  return jl(i[0], i[1], i[2], e);
}
function jl(i, e, t, s) {
  return ge(
    s,
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
function vf(i, e) {
  return Hl(i[0], i[1], i[2], e);
}
function Hl(i, e, t, s) {
  return ge(
    s,
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
function Wo(i, e, t, s, n, r, o) {
  return o = o || re(), ge(
    o,
    2 * i / (s - t),
    0,
    0,
    0,
    0,
    2 * i / (n - r),
    0,
    0,
    (s + t) / (s - t),
    (n + r) / (n - r),
    -(e + i) / (e - i),
    -1,
    0,
    0,
    -(2 * e * i) / (e - i),
    0
  );
}
function Xl(i, e, t, s, n, r) {
  const o = t / e, a = Ut(i / 2) * s, c = -a, l = o * a, u = -l;
  return Wo(s, n, c, a, l, u, r);
}
function wf(i, e, t, s, n, r) {
  const o = e / t, a = Ut(i / 2) * s, c = -a, l = o * a, u = -l;
  return Wo(s, n, u, l, a, c, r);
}
function Ql(i, e, t, s, n, r, o) {
  return ge(
    o,
    2 / (e - i),
    0,
    0,
    0,
    0,
    2 / (s - t),
    0,
    0,
    0,
    0,
    -1 / (r - n),
    0,
    (e + i) / (i - e),
    (s + t) / (t - s),
    -n / (n - r),
    1
  );
}
function Yl(i, e, t, s, n) {
  return n = n || [0, 0, 0, 0], Kn(i, e, n), ue(
    n,
    (n[0] / n[3] + 1) * 0.5 * t,
    (n[1] / n[3] + 1) * 0.5 * s,
    n[2] / n[3],
    1
  );
}
function Qr(i, e, t, s, n) {
  return Yl(
    i,
    [e[0], e[1], e[2], 1],
    t,
    s,
    n
  );
}
function Tf(i, e) {
  return Math.abs(i[0] - e[0]) <= 1e-7 && Math.abs(i[1] - e[1]) <= 1e-7 && Math.abs(i[2] - e[2]) <= 1e-7 && Math.abs(i[3] - e[3]) <= 1e-7;
}
function Ef(i, e) {
  return Math.abs(i[0] - e[0]) <= 1e-7 && Math.abs(i[1] - e[1]) <= 1e-7 && Math.abs(i[2] - e[2]) <= 1e-7 && Math.abs(i[3] - e[3]) <= 1e-7 && Math.abs(i[4] - e[4]) <= 1e-7 && Math.abs(i[5] - e[5]) <= 1e-7 && Math.abs(i[6] - e[6]) <= 1e-7 && Math.abs(i[7] - e[7]) <= 1e-7 && Math.abs(i[8] - e[8]) <= 1e-7;
}
function ql(i, e) {
  return Math.abs(i[0] - e[0]) <= 1e-7 && Math.abs(i[1] - e[1]) <= 1e-7 && Math.abs(i[2] - e[2]) <= 1e-7 && Math.abs(i[3] - e[3]) <= 1e-7 && Math.abs(i[4] - e[4]) <= 1e-7 && Math.abs(i[5] - e[5]) <= 1e-7 && Math.abs(i[6] - e[6]) <= 1e-7 && Math.abs(i[7] - e[7]) <= 1e-7 && Math.abs(i[8] - e[8]) <= 1e-7 && Math.abs(i[9] - e[9]) <= 1e-7 && Math.abs(i[10] - e[10]) <= 1e-7 && Math.abs(i[11] - e[11]) <= 1e-7 && Math.abs(i[12] - e[12]) <= 1e-7 && Math.abs(i[13] - e[13]) <= 1e-7 && Math.abs(i[14] - e[14]) <= 1e-7 && Math.abs(i[15] - e[15]) <= 1e-7;
}
function yf(i) {
  return [i[0], i[1], i[2], i[3]];
}
function Rf(i) {
  return [i[0], i[1], i[2], i[3], i[4], i[5], i[6], i[7], i[8]];
}
function an(i, e) {
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
function kn(i, e, t, s) {
  s = s || [];
  const [n, r, o] = i, [a, c, l] = t, [u, h, d, f, p, g, m, b, v] = e;
  s[ci] = u * n, s[li] = h * r, s[ui] = d * o, s[hi] = 0, s[di] = f * n, s[fi] = p * r, s[pi] = g * o, s[gi] = 0, s[mi] = m * n, s[bi] = b * r, s[xi] = v * o, s[vi] = 0, s[wi] = n * (u * a + f * c + m * l), s[Ti] = r * (h * a + p * c + b * l), s[Ei] = o * (d * a + g * c + v * l), s[yi] = 1;
}
function Yr(i, e, t, s) {
  s = s || [];
  const [n, r, o] = i, [a, c, l] = t, [u, h, d, f, p, g, m, b, v] = e;
  s[ci] = u * n, s[li] = h * n, s[ui] = d * n, s[hi] = 0, s[di] = f * r, s[fi] = p * r, s[pi] = g * r, s[gi] = 0, s[mi] = m * o, s[bi] = b * o, s[xi] = v * o, s[vi] = 0, s[wi] = a, s[Ti] = c, s[Ei] = l, s[yi] = 1;
}
function Af(i, e, t, s) {
  s = s || [];
  const [n, r] = i, [o, a] = t, [c, l, u, h] = e;
  s[ci] = c * n, s[li] = l * r, s[ui] = 0, s[hi] = 0, s[di] = u * n, s[fi] = h * r, s[pi] = 0, s[gi] = 0, s[mi] = 0, s[bi] = 0, s[xi] = 1, s[vi] = 0, s[wi] = n * (c * o + u * a), s[Ti] = r * (l * o + h * a), s[Ei] = 0, s[yi] = 1;
}
function Kl(i, e, t, s) {
  s = s || [];
  const [n, r] = i, [o, a] = t, [c, l, u, h] = e;
  s[ci] = c * n, s[li] = l * n, s[ui] = 0, s[hi] = 0, s[di] = u * r, s[fi] = h * r, s[pi] = 0, s[gi] = 0, s[mi] = 0, s[bi] = 0, s[xi] = 1, s[vi] = 0, s[wi] = o, s[Ti] = a, s[Ei] = 0, s[yi] = 1;
}
const _f = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Hadamard2x2: ef,
  Hadamard3x3: tf,
  Hadamard4x4: sf,
  M200: ss,
  M201: ns,
  M210: rs,
  M211: os,
  M300: gr,
  M301: mr,
  M302: br,
  M310: xr,
  M311: vr,
  M312: wr,
  M320: Tr,
  M321: Er,
  M322: yr,
  M3R: Ls,
  M400: ci,
  M401: li,
  M402: ui,
  M403: hi,
  M410: di,
  M411: fi,
  M412: pi,
  M413: gi,
  M420: mi,
  M421: bi,
  M422: xi,
  M423: vi,
  M430: wi,
  M431: Ti,
  M432: Ei,
  M433: yi,
  M4R: De,
  SRT4x4: Yr,
  SRT4x4_2D: Kl,
  TRS4x4: kn,
  TRS4x4_2D: Af,
  add2x2: Qd,
  add3x3: Yd,
  add4x4: qd,
  affineInverse2x2: Ud,
  affineInverse3x3: zd,
  affineInverse4x4: Gd,
  apply2x2: xt,
  apply3x3: Je,
  apply4x4: ge,
  compare2x2: Tf,
  compare3x3: Ef,
  compare4x4: ql,
  concat4x4: Xd,
  copy2x2: yf,
  copy3x3: Rf,
  copy4x4: an,
  determinant2x2: de,
  determinant3x3: Bs,
  determinant4x4: Vl,
  identity2: Rr,
  identity3: Ri,
  identity4: re,
  multiply2x2: jd,
  multiply3x3: Hd,
  multiply4x4: lt,
  multiplyScalar2x2: Vd,
  multiplyScalar3x3: $d,
  multiplyScalar4x4: Wd,
  orthographic4x4: Ql,
  perspective4x4: Xl,
  perspectiveFOVY4x4: wf,
  perspectiveFrustum4x4: Wo,
  project3As4ToScreen: Qr,
  projectToScreen: Yl,
  rotation2x2: $l,
  rotation4x4: Wl,
  rotation4x4by3: bf,
  scale4x4: jl,
  scale4x4by3: xf,
  shearX2x2: of,
  shearX4x4: cf,
  shearY2x2: af,
  shearY4x4: lf,
  shearZ4x4: uf,
  subtract2x2: Kd,
  subtract3x3: Zd,
  subtract4x4: Jd,
  toString2x2: pf,
  toString3x3: gf,
  toString4x4: mf,
  transform2: hf,
  transform3: df,
  transform3as4: ff,
  transform4: Kn,
  translation4x4: Hl,
  translation4x4by3: vf,
  transpose2x2: nf,
  transpose3x3: Dn,
  transpose4x4: rf
}, Symbol.toStringTag, { value: "Module" })), { cos: rn, sin: ki, sqrt: et, exp: Fa, acos: jo, atan2: Da, PI: ka } = Math;
let We, St, Ct, Ot, _e, Fe, Fs, Lt, je, ye, Ds, Zn, Jn, Fi, B, pt, Rn, ys;
const If = xe(), Mf = xe(), Sf = xe(), Cf = xe(), Of = 1, Lf = 2, Nf = 3, Bf = 0;
function Ze(i, e, t) {
  return i > t ? t : i < e ? e : i;
}
function xe(i) {
  return i ? (i[0] = 0, i[1] = 0, i[2] = 0, i[3] = 0, i) : [0, 0, 0, 0];
}
function Pf(i, e, t) {
  return t = t || xe(), t[0] = i[0] + e[0], t[1] = i[1] + e[1], t[2] = i[2] + e[2], t[3] = i[3] + e[3], t;
}
function er(i, e, t) {
  t = t || xe();
  const s = i[0], n = e[0], r = i[1], o = e[1], a = i[2], c = e[2], l = i[3], u = e[3];
  return t[0] = s * n - r * o - a * c - l * u, t[1] = s * o + r * n + a * u - l * c, t[2] = s * c - r * u + a * n + l * o, t[3] = s * u + r * c - a * o + l * n, t;
}
function Ff(i, e, t) {
  t = t || xe();
  const s = i[0], n = i[1], r = i[2], o = i[3], a = e[0], c = e[1], l = e[2], u = e[3], h = a * a + c * c + l * l + u * u;
  if (h === 0)
    t[0] = 0, t[1] = 0, t[2] = 0, t[3] = 0;
  else {
    const d = 1 / h;
    t[0] = (s * a + n * c + r * l + o * u) * d, t[1] = (n * a - s * c - r * u + o * l) * d, t[2] = (r * a - s * l - o * c + n * u) * d, t[3] = (o * a - s * u - n * l + r * c) * d;
  }
  return t;
}
function Df(i, e) {
  e = e || xe();
  const t = i[0], s = i[1], n = i[2], r = i[3], o = et(s * s + n * n + r * r), a = Fa(t), c = a / o * ki(o);
  return o === 0 ? (e[0] = Fa(t), e[1] = 0, e[2] = 0, e[3] = 0) : (e[0] = a * rn(o), e[1] = s * c, e[2] = n * c, e[3] = r * c), e;
}
function Zl(i, e, t) {
  return t = t || xe(), t[0] = i[0] * e, t[1] = i[1] * e, t[2] = i[2] * e, t[3] = i[3] * e, t;
}
function kf(i, e, t) {
  return t = t || xe(), er(e, Jl(i), t);
}
function Jl(i, e) {
  return e = e || xe(), e[0] = i[0], e[1] = -i[1], e[2] = -i[2], e[3] = -i[3], e;
}
function Uf(i, e) {
  e = e || xe();
  const t = i[0], s = i[1], n = i[2], r = i[3], o = t * t + s * s + n * n + r * r;
  if (o === 0)
    e[0] = 0, e[1] = 0, e[2] = 0, e[3] = 0;
  else {
    const a = 1 / o;
    e[0] = t * a, e[1] = -s * a, e[2] = -n * a, e[3] = -r * a;
  }
  return e;
}
function eu(i) {
  const e = i[0], t = i[1], s = i[2], n = i[3];
  return et(e * e + t * t + s * s + n * n);
}
function tu(i, e) {
  e = e || xe();
  const t = eu(i);
  if (t === 0) return [0, 0, 0, 0];
  const s = 1 / t;
  return Zl(i, s, e);
}
function zf(i) {
  return i[0];
}
function Gf(i) {
  return [i[1], i[2], i[3]];
}
function Vf(i, e) {
  return Uo(i, e);
}
function qr(i, e, t) {
  t = t || xe();
  const s = i[0], n = i[1], r = i[2], o = 1 / et(s * s + n * n + r * r), a = ki(e / 2);
  return t[0] = rn(e / 2), t[1] = a * s * o, t[2] = a * n * o, t[3] = a * r * o, t;
}
function iu(i, e, t) {
  t = t || xe();
  const s = i[0], n = i[1], r = i[2], o = Math.cos, a = Math.sin, c = o(s / 2), l = o(n / 2), u = o(r / 2), h = a(s / 2), d = a(n / 2), f = a(r / 2);
  switch (e) {
    case ie.xyz:
      t[1] = h * l * u + c * d * f, t[2] = c * d * u - h * l * f, t[3] = c * l * f + h * d * u, t[0] = c * l * u - h * d * f;
      break;
    case ie.yxz:
      t[0] = c * l * u + h * d * f, t[1] = h * l * u + c * d * f, t[2] = c * d * u - h * l * f, t[3] = c * l * f - h * d * u;
      break;
    case ie.zxy:
      t[0] = c * l * u - h * d * f, t[1] = h * l * u - c * d * f, t[2] = c * d * u + h * l * f, t[3] = c * l * f + h * d * u;
      break;
    case ie.zyx:
      t[0] = c * l * u + h * d * f, t[1] = h * l * u - c * d * f, t[2] = c * d * u + h * l * f, t[3] = c * l * f - h * d * u;
      break;
    case ie.yzx:
      t[0] = c * l * u - h * d * f, t[1] = h * l * u + c * d * f, t[2] = c * d * u + h * l * f, t[3] = c * l * f - h * d * u;
      break;
    case ie.xzy:
      t[0] = c * l * u + h * d * f, t[1] = h * l * u - c * d * f, t[2] = c * d * u - h * l * f, t[3] = c * l * f + h * d * u;
      break;
  }
  return t;
}
function $f(i, e, t) {
  t = t || [0, 0, 0];
  const s = iu(i, e);
  return Ho(s, ie.xyz, t), t;
}
function Rs(i, e, t, s, n, r) {
  r[0] = Da(i, e), r[1] = jo(t), r[2] = Da(s, n);
}
function Wf(i, e) {
  return Ho(i, ie.zyx, e);
}
function Ho(i, e, t) {
  t = t || [0, 0, 0];
  const s = i[0], n = i[1], r = i[2], o = i[3], a = Xo(i), c = a[0], l = a[4], u = a[8], h = a[1], d = a[5], f = a[9], p = a[2], g = a[6], m = a[10];
  switch (e) {
    case ie.zyx:
      t[1] = Math.asin(-Ze(p, -1, 1)), Math.abs(p) < 0.99999 ? (t[0] = Math.atan2(g, m), t[2] = Math.atan2(h, c)) : (t[0] = 0, t[2] = Math.atan2(-l, d));
      break;
    case ie.zyz:
      Rs(
        2 * r * o + 2 * s * n,
        2 * s * r - 2 * n * o,
        o * o - r * r - n * n + s * s,
        2 * r * o - 2 * s * n,
        2 * n * o + 2 * s * r,
        t
      );
      break;
    case ie.zxy:
      t[0] = Math.asin(Ze(g, -1, 1)), Math.abs(g) < 0.99999 ? (t[1] = Math.atan2(-p, m), t[2] = Math.atan2(-l, d)) : (t[1] = 0, t[2] = Math.atan2(h, c));
      break;
    case ie.zxz:
      Rs(
        2 * n * o - 2 * s * r,
        2 * r * o + 2 * s * n,
        o * o - r * r - n * n + s * s,
        2 * n * o + 2 * s * r,
        2 * s * n - 2 * r * o,
        t
      );
      break;
    case ie.yxz:
      t[0] = Math.asin(-Ze(f, -1, 1)), Math.abs(f) < 0.9999 ? (t[1] = Math.atan2(u, m), t[2] = Math.atan2(h, d)) : (t[1] = Math.atan2(-p, c), t[2] = 0);
      break;
    case ie.yxy:
      Rs(
        2 * n * r + 2 * s * o,
        2 * s * n - 2 * r * o,
        r * r - o * o + s * s - n * n,
        2 * n * r - 2 * s * o,
        2 * r * o + 2 * s * n,
        t
      );
      break;
    case ie.yzx:
      t[2] = Math.asin(Ze(h, -1, 1)), Math.abs(h) < 0.99999 ? (t[0] = Math.atan2(-f, d), t[1] = Math.atan2(-p, c)) : (t[0] = 0, t[1] = Math.atan2(u, m));
      break;
    case ie.yzy:
      Rs(
        2 * r * o - 2 * s * n,
        2 * n * r + 2 * s * o,
        r * r - o * o + s * s - n * n,
        2 * r * o + 2 * s * n,
        2 * s * o - 2 * n * r,
        t
      );
      break;
    case ie.xyz:
      t[1] = Math.asin(Ze(u, -1, 1)), Math.abs(u) < 0.99999 ? (t[0] = Math.atan2(-f, m), t[2] = Math.atan2(-l, c)) : (t[0] = Math.atan2(g, d), t[2] = 0);
      break;
    case ie.xyx:
      Rs(
        2 * n * r - 2 * s * o,
        2 * n * o + 2 * s * r,
        n * n + s * s - o * o - r * r,
        2 * n * r + 2 * s * o,
        2 * s * r - 2 * n * o,
        t
      );
      break;
    case ie.xzy:
      t[2] = Math.asin(-Ze(l, -1, 1)), Math.abs(l) < 0.99999 ? (t[0] = Math.atan2(g, d), t[1] = Math.atan2(u, c)) : (t[0] = Math.atan2(-f, m), t[1] = 0);
      break;
    case ie.xzx:
      Rs(
        2 * n * o + 2 * s * r,
        2 * s * o - 2 * n * r,
        n * n + s * s - o * o - r * r,
        2 * n * o - 2 * s * r,
        2 * n * r + 2 * s * o,
        t
      );
      break;
    default:
      console.warn("Invalid Euler rotation order.");
      break;
  }
  return t;
}
function jf(i, e, t) {
  t = t || [0, 0, 0];
  const s = Xo(i), n = s[0], r = s[4], o = s[8], a = s[1], c = s[5], l = s[9], u = s[2], h = s[6], d = s[10];
  switch (e) {
    case ie.xyz:
      t[1] = Math.asin(Ze(o, -1, 1)), Math.abs(o) < 0.99999 ? (t[0] = Math.atan2(-l, d), t[2] = Math.atan2(-r, n)) : (t[0] = Math.atan2(h, c), t[2] = 0);
      break;
    case ie.yxz:
      t[0] = Math.asin(-Ze(l, -1, 1)), Math.abs(l) < 0.9999 ? (t[1] = Math.atan2(o, d), t[2] = Math.atan2(a, c)) : (t[1] = Math.atan2(-u, n), t[2] = 0);
      break;
    case ie.zxy:
      t[0] = Math.asin(Ze(h, -1, 1)), Math.abs(h) < 0.99999 ? (t[1] = Math.atan2(-u, d), t[2] = Math.atan2(-r, c)) : (t[1] = 0, t[2] = Math.atan2(a, n));
      break;
    case ie.zyx:
      t[1] = Math.asin(-Ze(u, -1, 1)), Math.abs(u) < 0.99999 ? (t[0] = Math.atan2(h, d), t[2] = Math.atan2(a, n)) : (t[0] = 0, t[2] = Math.atan2(-r, c));
      break;
    case ie.yzx:
      t[2] = Math.asin(Ze(a, -1, 1)), Math.abs(a) < 0.99999 ? (t[0] = Math.atan2(-l, c), t[1] = Math.atan2(-u, n)) : (t[0] = 0, t[1] = Math.atan2(o, d));
      break;
    case ie.xzy:
      t[2] = Math.asin(-Ze(r, -1, 1)), Math.abs(r) < 0.99999 ? (t[0] = Math.atan2(h, c), t[1] = Math.atan2(o, n)) : (t[0] = Math.atan2(-l, d), t[1] = 0);
      break;
  }
}
function Hf(i) {
  const e = i[0];
  if (e < -1 || e > 1)
    return 0;
  const t = 2 * jo(e);
  return t > ka ? t - 2 * ka : t;
}
function Xf(i) {
  const e = i[1], t = i[2], s = i[3];
  if (et(e * e + t * t + s * s) === 0) return [0, 0, 0];
  const r = 1 / et(e * e + t * t + s * s);
  return [e * r, t * r, s * r];
}
function Kr(i, e) {
  e = e || Ri();
  const t = i[1] + i[1], s = i[2] + i[2], n = i[3] + i[3], r = i[1] * t, o = i[1] * s, a = i[1] * n, c = i[2] * s, l = i[2] * n, u = i[3] * n, h = i[0] * t, d = i[0] * s, f = i[0] * n;
  return e[gr] = 1 - (c + u), e[mr] = o - f, e[br] = a + d, e[xr] = o + f, e[vr] = 1 - (r + u), e[wr] = l - h, e[Tr] = a - d, e[Er] = l + h, e[yr] = 1 - (r + c), e;
}
function Qf(i, e) {
  e = e || re();
  const t = i[1] + i[1], s = i[2] + i[2], n = i[3] + i[3], r = i[1] * t, o = i[1] * s, a = i[1] * n, c = i[2] * s, l = i[2] * n, u = i[3] * n, h = i[0] * t, d = i[0] * s, f = i[0] * n;
  return e[ci] = 1 - (c + u), e[li] = o - f, e[ui] = a + d, e[hi] = 0, e[di] = o + f, e[fi] = 1 - (r + u), e[pi] = l - h, e[gi] = 0, e[mi] = a - d, e[bi] = l + h, e[xi] = 1 - (r + c), e[vi] = 0, e[wi] = 0, e[Ti] = 0, e[Ei] = 0, e[yi] = 1, e;
}
function Yf(i, e) {
  e = e || Ri();
  const t = i[1] + i[1], s = i[2] + i[2], n = i[3] + i[3], r = i[1] * t, o = i[1] * s, a = i[1] * n, c = i[2] * s, l = i[2] * n, u = i[3] * n, h = i[0] * t, d = i[0] * s, f = i[0] * n;
  return e[gr] = 1 - (c + u), e[xr] = o - f, e[Tr] = a + d, e[mr] = o + f, e[vr] = 1 - (r + u), e[Er] = l - h, e[br] = a - d, e[wr] = l + h, e[yr] = 1 - (r + c), e;
}
function Xo(i, e) {
  e = e || re();
  const t = i[1] + i[1], s = i[2] + i[2], n = i[3] + i[3], r = i[1] * t, o = i[1] * s, a = i[1] * n, c = i[2] * s, l = i[2] * n, u = i[3] * n, h = i[0] * t, d = i[0] * s, f = i[0] * n;
  return e[ci] = 1 - (c + u), e[di] = o - f, e[mi] = a + d, e[wi] = 0, e[li] = o + f, e[fi] = 1 - (r + u), e[bi] = l - h, e[Ti] = 0, e[ui] = a - d, e[pi] = l + h, e[xi] = 1 - (r + c), e[Ei] = 0, e[hi] = 0, e[gi] = 0, e[vi] = 0, e[yi] = 1, e;
}
function qf(i, e) {
  e = e || xe();
  const [t, s, n] = i, r = rn(t / 2), o = rn(s / 2), a = rn(n / 2), c = ki(t / 2), l = ki(s / 2), u = ki(n / 2), h = o * a, d = l * u, f = o * u, p = l * a;
  return e[0] = r * h + c * d, e[1] = c * h - r * d, e[2] = r * p + c * f, e[3] = r * f - c * p, e;
}
function su(i, e, t) {
  return t = t || xe(), ys = mt([-i[0], -i[1], -i[2]], $e[$e.length - 1]), pt = mt(tt(e, ys, $e[$e.length - 2])), Rn = tt(ys, pt, $e[$e.length - 3]), _e = pt[0], Fe = Rn[0], Fs = ys[0], je = pt[1], ye = Rn[1], Ds = ys[1], Zn = pt[2], Jn = Rn[2], Fi = ys[2], B = (1 + _e + ye + Fi) * 0.25, B > 0 ? (B = Math.sqrt(B), t[0] = B, B = 1 / (4 * B), t[1] = (Ds - Jn) * B, t[2] = (Zn - Fs) * B, t[3] = (Fe - je) * B) : (t[0] = 0, B = -0.5 * (ye + Fi), B > 0 ? (B = Math.sqrt(B), t[1] = B, B *= 2, t[2] = Fe / B, t[3] = Fs / B) : (t[1] = 0, B = 0.5 * (1 - Fi), B > 0 ? (B = Math.sqrt(B), t[2] = B, t[3] = Ds / (2 * B)) : (t[2] = 0, t[3] = 1))), t;
}
function Kf(i, e) {
  if (e = e || xe(), We = i[0], St = i[3], Ct = i[6], Ot = i[1], _e = i[4], Fe = i[7], Lt = i[2], je = i[5], ye = i[8], B = We + _e + ye, B > 0) {
    const s = et(B + 1) * 2;
    return e[0] = 0.25 * s, e[1] = (je - Fe) / s, e[2] = (Ct - Lt) / s, e[3] = (Ot - St) / s, e;
  }
  if (We > _e && We > ye) {
    const s = et(1 + We - _e - ye) * 2;
    return e[0] = (je - Fe) / s, e[1] = 0.25 * s, e[2] = (St + Ot) / s, e[3] = (Ct + Lt) / s, e;
  }
  if (_e > ye) {
    const s = et(1 + _e - We - ye) * 2;
    return e[0] = (Ct - Lt) / s, e[1] = (Ot + St) / s, e[2] = 0.25 * s, e[3] = (je + Fe) / s, e;
  }
  const t = et(1 + ye - We - _e) * 2;
  return e[0] = (Ot - St) / t, e[1] = (Lt + Ct) / t, e[2] = (je + Fe) / t, e[3] = 0.25 * t, e;
}
function Zf(i, e) {
  if (e = e || xe(), We = i[0], St = i[4], Ct = i[8], Ot = i[1], _e = i[5], Fe = i[9], Lt = i[2], je = i[6], ye = i[10], B = We + _e + ye, B > 0) {
    const s = et(B + 1) * 2;
    return e[0] = 0.25 * s, e[1] = (je - Fe) / s, e[2] = (Ct - Lt) / s, e[3] = (Ot - St) / s, e;
  }
  if (We > _e && We > ye) {
    const s = et(1 + We - _e - ye) * 2;
    return e[0] = (je - Fe) / s, e[1] = 0.25 * s, e[2] = (St + Ot) / s, e[3] = (Ct + Lt) / s, e;
  }
  if (_e > ye) {
    const s = et(1 + _e - We - ye) * 2;
    return e[0] = (Ct - Lt) / s, e[1] = (Ot + St) / s, e[2] = 0.25 * s, e[3] = (je + Fe) / s, e;
  }
  const t = et(1 + ye - We - _e) * 2;
  return e[0] = (Ot - St) / t, e[1] = (Lt + Ct) / t, e[2] = (je + Fe) / t, e[3] = 0.25 * t, e;
}
function Qo(i, e, t, s, n) {
  return n = n || xe(), _e = i[0] / e, Fe = i[4] / t, Fs = i[8] / s, je = i[1] / e, ye = i[5] / t, Ds = i[9] / s, Zn = i[2] / e, Jn = i[6] / t, Fi = i[10] / s, B = (1 + _e + ye + Fi) * 0.25, B > 0 ? (B = Math.sqrt(B), n[0] = B, B = 1 / (4 * B), n[1] = (Ds - Jn) * B, n[2] = (Zn - Fs) * B, n[3] = (Fe - je) * B) : (n[0] = 0, B = -0.5 * (ye + Fi), B > 0 ? (B = Math.sqrt(B), n[1] = B, B *= 2, n[2] = Fe / B, n[3] = Fs / B) : (n[1] = 0, B = 0.5 * (1 - Fi), B > 0 ? (B = Math.sqrt(B), n[2] = B, n[3] = Ds / (2 * B)) : (n[2] = 0, n[3] = 1))), n;
}
function Jf(i, e, t) {
  t = t || re();
  const s = mt([-i[0], -i[1], -i[2]]), n = mt(tt(e, s)), r = tt(s, n);
  return t[0] = n[0], t[1] = r[0], t[2] = s[0], t[3] = 0, t[4] = n[1], t[5] = r[1], t[6] = s[1], t[7] = 0, t[8] = n[2], t[9] = r[2], t[10] = s[2], t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, t;
}
function Zr(i, e, t) {
  return pt = ls(e[1], e[2], e[3]), B = e[0], ri(
    ri(ht(pt, 2 * Yn(pt, i)), ht(i, B * B - Yn(pt, pt))),
    ht(tt(pt, i), 2 * B),
    t
  );
}
function ep(i, e, t, s) {
  s = s || xe();
  const n = [0, 0, 0, 0];
  let r, o, a, c, l;
  return o = i[1] * e[1] + i[2] * e[2] + i[3] * e[3] + i[0] * e[0], o < 0 ? (o = -o, n[0] = -e[1], n[1] = -e[2], n[2] = -e[3], n[3] = -e[0]) : (n[0] = e[1], n[1] = e[2], n[2] = e[3], n[3] = e[0]), 1 - o > 1e-7 ? (r = jo(o), a = ki(r), c = ki((1 - t) * r) / a, l = ki(t * r) / a) : (c = 1 - t, l = t), s[1] = c * i[1] + l * n[0], s[2] = c * i[2] + l * n[1], s[3] = c * i[3] + l * n[2], s[0] = c * i[0] + l * n[3], s;
}
function tr() {
  return [1, 0, 0, 0];
}
function tp() {
  return [0, 1, 0, 0];
}
function ip() {
  return [0, 0, 1, 0];
}
function sp() {
  return [0, 0, 0, 1];
}
const np = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  QR1: If,
  QR2: Mf,
  QR3: Sf,
  QR4: Cf,
  QW: Bf,
  QX: Of,
  QY: Lf,
  QZ: Nf,
  addQuat: Pf,
  angleQuat: Hf,
  axisQuat: Xf,
  clamp: Ze,
  conjugateQuat: Jl,
  decomposeRotation: Qo,
  diffUnitQuat: kf,
  divideQuat: Ff,
  dotQuat: Vf,
  eulerToQuat: qf,
  exponentQuat: Df,
  fromEulerAxisAngleToQuat: qr,
  fromOrderedEulerToQuat: iu,
  iQuat: tp,
  imaginaryQuat: Gf,
  inverseQuat: Uf,
  jQuat: ip,
  kQuat: sp,
  lengthQuat: eu,
  lookAtMatrix: Jf,
  lookAtQuat: su,
  matrix3x3FromUnitQuatModel: Kr,
  matrix3x3FromUnitQuatView: Yf,
  matrix3x3ToQuaternion: Kf,
  matrix4x4FromUnitQuatModel: Qf,
  matrix4x4FromUnitQuatView: Xo,
  matrix4x4ToQuaternion: Zf,
  multiplyQuat: er,
  normalizeQuat: tu,
  oneQuat: tr,
  realQuat: zf,
  rotateVectorByUnitQuat: Zr,
  scaleQuat: Zl,
  slerpUnitQuat: ep,
  toEulerFromQuat: Wf,
  toEulerXYZfromOrderedEuler: $f,
  toOrderedEulerFromQuat: Ho,
  toOrderedEulerFromQuat2: jf,
  zeroQuat: xe
}, Symbol.toStringTag, { value: "Module" }));
function nu(i, e) {
  return [i, e];
}
function rp(i, e, t) {
  return t = t || [0, 0, 0], ri(i[0], ht(i[1], e), t);
}
function ru(i, e, t) {
  return t = t || [
    [0, 0, 0],
    [0, 0, 0]
  ], ct(i, t[0]), mt(ti(e, i), t[1]), t;
}
const op = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ray: nu,
  rayFromPoints: ru,
  rayToLocation: rp
}, Symbol.toStringTag, { value: "Module" })), Jb = _f, ex = np, tx = op, ix = Uh;
let Ue = class {
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
}, bt = -1, ir = 0, sr = [], on = [], Ks = [];
const Gs = /* @__PURE__ */ new Map(), Ws = (i) => {
  ir = i;
  let e = !1;
  const t = [];
  Gs.forEach((n, r) => {
    e = !0;
    let {
      0: o,
      1: a,
      2: c,
      3: l,
      4: u,
      5: h
    } = n;
    if (l !== -1) {
      if (u === -1 && (u = i, n[4] = i), i - u >= l) {
        t.push(r), o(
          i - (h ? u : 0),
          u + l - (h ? u : 0)
        );
        return;
      }
    } else u === -1 && (u = i, n[4] = i);
    const d = h ? u : 0;
    if (a !== -1) {
      if (c === -1 && (n[2] = i, c = i), i - c >= a)
        for (o(i - d); i - c >= a; )
          n[2] += a, c += a;
    } else
      o(i - d);
  });
  for (let n = 0, r = t.length; n < r; ++n) {
    const o = t[n];
    Gs.delete(o);
  }
  const s = on.slice();
  on = [];
  for (let n = 0, r = s.length; n < r; ++n) {
    const { 0: o, 1: a, 2: c } = s[n];
    a <= 0 ? o && o(i) : i - c > a ? o(i) : (e = !0, on.push(s[n]));
  }
  for (let n = 0, r = Ks.length; n < r; ++n) {
    const o = Ks[n];
    o && (e = !0, o(i));
  }
  Ks = sr.slice(0), sr = [], Ks.length > 0 && (e = !0), e ? bt = requestAnimationFrame(Ws) : bt = -1;
};
bt = requestAnimationFrame(Ws);
function ou(i) {
  const e = new Ue();
  return sr.push((t) => {
    i && i(t), e.resolve(t);
  }), bt === -1 && (bt = requestAnimationFrame(Ws)), e.promise;
}
function oi(i, e) {
  const t = new Ue(), s = (n) => {
    i && i(n), t.resolve(n);
  };
  return on.push([s, e || -1, ir]), bt === -1 && (bt = requestAnimationFrame(Ws)), t.promise;
}
function au(i, e, t, s = !1) {
  const n = new Ue(), r = (o, a) => {
    i(o), t !== void 0 && t > 0 ? a !== void 0 && n.resolve(a) : n.resolve(o);
  };
  return Gs.set(n.promise, [
    r,
    e || -1,
    -1,
    t || -1,
    -1,
    s
  ]), bt === -1 && (bt = requestAnimationFrame(Ws)), n.promise;
}
function Ua(i) {
  Gs.delete(i), bt === -1 && (bt = requestAnimationFrame(Ws));
}
function nx() {
  Gs.forEach((i) => i[0](ir, ir)), Gs.clear(), on = [], sr = [], Ks = [];
}
const us = /* @__PURE__ */ new Set(), cu = us.add.bind(us), lu = us.delete.bind(us), uu = async () => {
  await au(
    () => {
      us.size !== 0 && (us.forEach((i) => i.update()), us.clear());
    },
    void 0,
    Number.POSITIVE_INFINITY
  ), uu();
};
uu();
class hu {
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
      const s = this._children[e];
      this._childUpdate.add(s), s.invalidate();
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
    let s = this._parent;
    for (; s && (t.push(s), s._parent && s._parent.needsUpdate); )
      s = s._parent;
    for (let n = t.length - 1; n >= 0; --n) {
      const r = t[n];
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
class Yo extends hu {
  constructor(e) {
    super(), this.isQueuedForUpdate = !1, this.needsWorldOrientation = !1, this.needsWorldDecomposition = !1, this.hasViewMatrix = !1, this._instance = null, this._matrix = { value: re() }, this._localMatrix = { value: this._matrix.value }, this._rotation = { value: tr() }, this._localRotation = {
      value: this._rotation.value
    }, this.localRotationMatrix = Ri(), this._scale = { value: [1, 1, 1] }, this._localScale = { value: this._scale.value }, this._position = { value: [0, 0, 0] }, this._localPosition = {
      value: this._position.value
    }, this._forward = { value: Ns() }, this._localForward = { value: this._forward.value }, this.needsForwardUpdate = !1, e && (e.localPosition && (this.localPosition = e.localPosition), e.localRotation && (this.localRotation = e.localRotation), e.localScale && (this.localScale = e.localScale), e.parent && (this.parent = e.parent));
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
    return this.hasViewMatrix = !0, this._viewMatrix === void 0 && this.invalidate(), this.update(), this._viewMatrix === void 0 ? re() : this._viewMatrix.value;
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
    return this.hasViewMatrix = !0, this._localViewMatrix === void 0 && this.invalidate(), this.update(), this._localViewMatrix === void 0 ? re() : this._localViewMatrix.value;
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
    e ? (this._localTransform || (this._localTransform = { value: re() }), an(e, this._localTransform.value), this._localTransform.didUpdate = !0) : delete this._localTransform, this.invalidate();
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
    e ? (this._localViewTransform || (this._localViewTransform = { value: re() }), an(e, this._localViewTransform.value), this._localViewTransform.didUpdate = !0) : delete this._localViewTransform, this.invalidate();
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
    ue(this._localRotation.value, e[0], e[1], e[2], e[3]), this._localRotation.didUpdate = !0, this.invalidate(), this.needsForwardUpdate = !0;
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
    return (this.needsForwardUpdate || (e = this.parent) != null && e.childUpdate.has(this)) && (this.needsForwardUpdate = !1, Zr(
      Ns(),
      this._rotation.value,
      this._forward.value
    )), this._forward.value;
  }
  /**
   * The forward vector for this particular transform ignoring the parent
   * transform. When no parent is present, forward === localForward.
   */
  get localForward() {
    return this.needsForwardUpdate && (this.needsForwardUpdate = !1, Zr(
      Ns(),
      this._localRotation.value,
      this._localForward.value
    )), this._localForward.value;
  }
  /**
   * Set the local position. Supports chaining.
   */
  setLocalPosition(e) {
    return this.localPosition = e, this;
  }
  /**
   * Set the local rotation. Supports chaining.
   */
  setLocalRotation(e) {
    return this.localRotation = e, this;
  }
  /**
   * Set the local scale. Supports chaining.
   */
  setLocalScale(e) {
    return this.localScale = e, this;
  }
  /**
   * Adjusts the transform's properties all at once to shave off a little bit of
   * overhead.
   */
  applyLocalSRT(e, t, s) {
    this._localScale.value = e, this._localPosition.value = s, this._localRotation.value = t, this._localScale.didUpdate = !0, this._localPosition.didUpdate = !0, this._localRotation.didUpdate = !0, this.invalidate(), this._instance && (this._instance.transform = this);
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
    const e = this._matrix.value, t = this._position.value, s = this._scale.value;
    this._position.didUpdate = t[0] !== e[12] || t[1] !== e[13] || t[2] !== e[14], this._position.didUpdate && fe(t, e[12], e[13], e[14]);
    const n = Di(e[0], e[1], e[2], e[3]), r = Di(e[4], e[5], e[6], e[7]), o = Di(e[8], e[9], e[10], e[11]);
    this._scale.didUpdate = s[0] !== n || s[1] !== r || s[2] !== o, fe(s, n, r, o), this._scale.didUpdate = !0;
    const [a, c, l, u] = this._rotation.value;
    Qo(this._matrix.value, n, r, o, this._rotation.value);
    const h = this._rotation.value;
    this._rotation.didUpdate = h[0] !== a || h[1] !== c || h[2] !== l || h[3] !== u;
  }
  /**
   * Orients this transform to make the forward direction point toward a
   * position relative to this transform. When no parent is present, lookAt and
   * lookAtLocal behaves exactly the same.
   */
  lookAtLocal(e, t) {
    su(
      ti(e, this._localPosition.value, $e[0]),
      t || [0, 1, 0],
      this._localRotation.value
    ), this._localRotation.didUpdate = !0, this.invalidate(), this.needsForwardUpdate = !0;
  }
  /**
   * Makes world space and local space information have it's own memory
   * allotment as they should be different after calling this method.
   */
  divideMemory() {
    this._forward.value = Ns(), this._matrix.value = re(), this._rotation.value = tr(), this._scale.value = [1, 1, 1], this._position.value = [0, 0, 0], this.hasViewMatrix && this._viewMatrix && this._localViewMatrix && (this._viewMatrix.value = re());
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
    !this.isQueuedForUpdate && this._instance && this._instance.active && (this.isQueuedForUpdate = !0, cu(this));
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
    if (this.isQueuedForUpdate && (lu(this), this.isQueuedForUpdate = !1), this.needsUpdate) {
      const s = this.localRotationMatrix;
      this._localRotation.didUpdate && Kr(this._localRotation.value, s), this._localTransform ? (Yr(this._localScale.value, s, this._localPosition.value, De[0]), lt(
        this._localTransform.value,
        De[0],
        this._localMatrix.value
      )) : Yr(
        this._localScale.value,
        s,
        this._localPosition.value,
        this._localMatrix.value
      ), this._localMatrix.didUpdate = !0, t = !0, this.hasViewMatrix && (this._viewMatrix === void 0 && (this._viewMatrix = { value: re() }), this._localViewMatrix === void 0 && (this.parent ? this._localViewMatrix = { value: re() } : this._localViewMatrix = { value: this._viewMatrix.value }), this._localViewTransform ? (kn(
        tn(this._localScale.value, $e[0]),
        Dn(s, Ls[1]),
        ht(this._localPosition.value, -1, $e[1]),
        De[0]
      ), lt(
        this._localViewTransform.value,
        De[0],
        this._localViewMatrix.value
      )) : kn(
        tn(this._localScale.value, $e[0]),
        Dn(s, Ls[1]),
        ht(this._localPosition.value, -1, $e[1]),
        this._localViewMatrix.value
      ), this._localViewMatrix.didUpdate = !0);
    }
    this.parent && (this.parent.needsUpdate ? (e || this.processParentUpdates((s) => {
      s.update(!0);
    }), t = !0) : this.parent.childUpdate.has(this) && (t = !0), t && (lt(
      this.parent._matrix.value,
      this._localMatrix.value,
      this._matrix.value
    ), this._matrix.didUpdate = !0, this.needsWorldDecomposition = !0, this.hasViewMatrix && this._viewMatrix && this._localViewMatrix && (this.parent.hasViewMatrix && this.parent._viewMatrix && this.parent._localViewMatrix ? lt(
      this.parent._viewMatrix.value,
      this._localViewMatrix.value,
      this._viewMatrix.value
    ) : (Kr(this.parent.rotation, Ls[0]), kn(
      tn(this.parent._scale.value, $e[0]),
      Dn(Ls[0], Ls[1]),
      ht(this.parent._position.value, -1, $e[1]),
      De[0]
    ), lt(
      this._localViewMatrix.value,
      De[0],
      this._viewMatrix.value
    )), this._viewMatrix.didUpdate = !0))), this.decomposeWorldMatrix(), this._instance && this._instance.active && (this._localMatrix.didUpdate || this._matrix.didUpdate) && (this._instance.needsLocalUpdate && (this._localRotation.didUpdate && (this._instance._localRotation = this._localRotation.value), this._localPosition.didUpdate && (this._instance._localPosition = this._localPosition.value), this._localScale.didUpdate && (this._instance._localScale = this._localScale.value)), this._instance.needsWorldUpdate && (this.parent ? (this._rotation.didUpdate && (this._instance._rotation = this._rotation.value), this._scale.didUpdate && (this._instance._scale = this._scale.value), this._position.didUpdate && (this._instance._position = this._position.value)) : (this._localRotation.didUpdate && (this._instance._rotation = this._localRotation.value), this._localPosition.didUpdate && (this._instance._position = this._localPosition.value), this._localScale.didUpdate && (this._instance._scale = this._localScale.value))), this._matrix.didUpdate && (this._instance._matrix = this._matrix.value), this._localMatrix.didUpdate && (this._instance._localMatrix = this._localMatrix.value, this.parent || (this._instance._matrix = this._matrix.value))), this._localScale.didUpdate = !1, this._localRotation.didUpdate = !1, this._localPosition.didUpdate = !1, this._rotation.didUpdate = !1, this._scale.didUpdate = !1, this._position.didUpdate = !1, this._matrix.didUpdate = !1, this._localMatrix.didUpdate = !1, this.resolve();
  }
}
const ap = new Yo();
function du(i, e) {
  return !i || !e ? i === e : !Object.keys(Object.assign({}, i, e)).find(
    (t) => i[t] !== e[t]
  );
}
var Vi = /* @__PURE__ */ ((i) => (i[i.PERSPECTIVE = 0] = "PERSPECTIVE", i[i.ORTHOGRAPHIC = 1] = "ORTHOGRAPHIC", i))(Vi || {});
function cp(i) {
  return i.projectionOptions.type === 1 && "left" in i.projectionOptions;
}
function fu(i) {
  return i.projectionOptions.type === 0 && "fov" in i.projectionOptions;
}
class $i {
  constructor(e) {
    this._id = P(), this.animationEndTime = 0, this.needsViewDrawn = !0, this.needsBroadcast = !1, this.viewChangeViewId = "", this.transform = new Yo(), this._projection = re(), this._needsUpdate = !0, this._viewProjection = re(), this._projectionOptions = e, this._needsUpdate = !0, this.onChange = e.onViewChange, this.update();
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
    return new $i(
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
    return new $i(
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
    this._needsUpdate = this._needsUpdate || !Qn(e, this.transform.position), this.transform.position = e;
  }
  /**
   * The camera must always look at a position within the world. This in conjunction with 'roll' defines the orientation
   * of the camera viewing the world.
   */
  lookAt(e, t) {
    const s = an(this.transform.matrix);
    this.transform.lookAtLocal(e, t || [0, 1, 0]), this._needsUpdate = this._needsUpdate || !ql(s, this.transform.matrix);
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
    this._needsUpdate = this._needsUpdate || !Qn(e, this.transform.scale), this.transform.scale = e;
  }
  /**
   * Options used for making the projection of the camera. Set new options to update the projection.
   * Getting the options returns a copy of the object and is not the internal object itself.
   */
  get projectionOptions() {
    return this._projectionOptions;
  }
  set projectionOptions(e) {
    this._needsUpdate = this._needsUpdate || !du(e, this._projectionOptions), this._projectionOptions = e;
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
    cp(this) ? Ql(
      this.projectionOptions.left,
      this.projectionOptions.right,
      this.projectionOptions.bottom,
      this.projectionOptions.top,
      this.projectionOptions.near,
      this.projectionOptions.far,
      this._projection
    ) : fu(this) && Xl(
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
const { ceil: lp, max: pu, log2: up, pow: hp, sqrt: dp } = Math, Ke = [-1, -1];
function fp(i, e) {
  const { width: t, height: s } = i;
  let n;
  const r = [], o = [];
  for (let a = 0; a < t; ++a) {
    r[a] = [], o[a] = [];
    for (let c = 0; c < s; ++c) {
      const l = c * (t * 4) + a * 4;
      n = e[l + 3], n ? (r[a][c] = [a, c], o[a][c] = Ke) : (r[a][c] = Ke, o[a][c] = [a, c]);
    }
  }
  return {
    seed: r,
    inverse: o
  };
}
function pp(i) {
  const e = [];
  for (let t = 0, s = i.length; t < s; ++t)
    e[t] = [];
  return e;
}
function za(i, e, t = !1) {
  const s = t ? -1 : 1;
  let n, r, o, a;
  const c = [];
  let l = -1;
  for (let u = 0, h = i.length; u < h; ++u) {
    const d = i[u];
    c[u] = [];
    for (let f = 0, p = d.length; f < p; ++f)
      n = d[f], n === e ? a = 256 : (r = [u, f], o = Te(n, r), a = dp(ln(o, o))), c[u][f] = a, l = pu(a, l);
  }
  for (let u = 0, h = i.length; u < h; ++u) {
    const d = i[u];
    for (let f = 0, p = d.length; f < p; ++f)
      a = c[u][f], c[u][f] = a / l * 255 * s;
  }
  return c;
}
function gp(i, e, t, s) {
  let n;
  const r = za(i, t, !0), o = za(
    e,
    t,
    !1
  ), a = r.length, c = r;
  for (let l = 0, u = r.length; l < u; ++l) {
    const h = r[l], d = o[l];
    for (let f = 0, p = h.length; f < p; ++f) {
      const g = h[f], m = d[f];
      h[f] = g + m;
    }
  }
  for (let l = 0, u = c.length; l < u; ++l) {
    const h = c[l];
    for (let d = 0, f = h.length; d < f; ++d) {
      n = h[d];
      const p = d * (a * 4) + l * 4;
      s[p] = n, s[p + 1] = n, s[p + 2] = n, s[p + 3] = 255;
    }
  }
}
function Ga(i, e) {
  const t = i.length, s = i[0].length;
  let n = pp(i), r = i, o, a, c, l, u, h, d, f, p;
  for (let g = 0; g < e; ++g) {
    const m = n;
    n = r, r = m;
    const b = hp(2, e - g - 1);
    for (d = 0; d < t; ++d)
      for (f = 0; f < s; ++f) {
        for (o = [d, f], c = [
          (n[d - b] || [])[f - b] || Ke,
          (n[d] || [])[f - b] || Ke,
          (n[d + b] || [])[f - b] || Ke,
          (n[d - b] || [])[f] || Ke,
          (n[d] || [])[f] || Ke,
          (n[d + b] || [])[f] || Ke,
          (n[d - b] || [])[f + b] || Ke,
          (n[d] || [])[f + b] || Ke,
          (n[d + b] || [])[f + b] || Ke
        ], u = 0, l = Number.MAX_VALUE, p = 0; p < 9; ++p) {
          const v = c[p];
          v !== Ke && (a = Te(v, o), h = ln(a, a), h < l && (l = h, u = p));
        }
        r[d][f] = c[u];
      }
  }
  return r;
}
function rx(i, e = gp) {
  const { width: t, height: s } = i, n = i.getContext("2d");
  if (!n) return;
  const r = n.getImageData(0, 0, t, s).data, o = pu(t, s), a = lp(up(o)), c = fp(i, r), l = Ga(c.seed, a), u = Ga(c.inverse, a), h = new ImageData(t, s);
  e(l, u, Ke, h.data), n.putImageData(h, 0, 0);
}
function ox(i) {
}
class He {
  constructor(e, t, s, n) {
    this.child = [null, null], this.isLeaf = !0, this.data = null, this.bounds = new J({
      height: n,
      width: s,
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
    let t = this.child[0], s = this.child[1];
    if (!this.isLeaf && t && s) {
      const n = t.insert(e);
      return n !== null ? n : s.insert(e);
    } else {
      if (this.data) return null;
      const n = this.bounds.fits(e.bounds);
      if (n === 0) return null;
      if (n === 1)
        return this.data = e.data, this;
      this.isLeaf = !1;
      const r = e.bounds.width, o = e.bounds.height, a = this.bounds.width - r, c = this.bounds.height - e.bounds.height;
      a > c ? (t = this.child[0] = new He(
        this.bounds.x,
        this.bounds.y,
        r,
        this.bounds.height
      ), s = this.child[1] = new He(
        this.bounds.x + r,
        this.bounds.y,
        a,
        this.bounds.height
      )) : (t = this.child[0] = new He(
        this.bounds.x,
        this.bounds.y,
        this.bounds.width,
        o
      ), s = this.child[1] = new He(
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
    const t = this.child[0], s = this.child[1];
    if (s && t && !this.isLeaf) {
      let n = t.remove(e);
      return n ? !0 : (n = s.remove(e), t.hasChild() || s.hasChild() || (this.child[0] = null, this.child[1] = null), n);
    } else
      return this.data === e ? (this.data = null, !0) : !1;
  }
  /**
   * Applies a node's bounds to SubTexture.
   */
  static applyToSubTexture(e, t, s, n, r) {
    if (!s) return;
    n = n || {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0
    };
    const o = t instanceof He ? t.bounds : t, a = (o.x + n.left) / e.bounds.width, c = (o.y + n.top) / e.bounds.height, l = (o.width - n.left - n.right) / e.bounds.width, u = (o.height - n.top - n.bottom) / e.bounds.height;
    let h;
    r ? h = new J({
      bottom: 1 - c,
      left: a,
      right: a + l,
      top: 1 - (c + u)
    }) : h = new J({
      top: 1 - c,
      left: a,
      right: a + l,
      bottom: 1 - (c + u)
    });
    const d = h.bottom, f = h.y, p = h.x, g = h.x + h.width;
    s.atlasTL = [p, f], s.atlasBR = [g, d], s.atlasBL = [p, d], s.atlasTR = [g, f], s.widthOnAtlas = Math.abs(s.atlasTR[0] - s.atlasTL[0]), s.heightOnAtlas = Math.abs(s.atlasTR[1] - s.atlasBR[1]), s.pixelWidth = l * e.bounds.width, s.pixelHeight = u * e.bounds.height;
  }
}
function gu(i) {
  return i && i.call !== void 0 && i.apply !== void 0;
}
function hs(i, e, t) {
  let s = i.get(e);
  return s === void 0 && (gu(t) ? s = t() : s = t, i.set(e, s)), s;
}
function Jr(i, e, t) {
  let s = i.get(e);
  return s === void 0 && (gu(t) ? s = t() : s = t), s;
}
const cr = class cr {
};
cr.transparentShapeBlending = {
  blending: {
    blendDst: x.Material.BlendingDstFactor.OneMinusSrcAlpha,
    blendEquation: x.Material.BlendingEquations.Add,
    blendSrc: x.Material.BlendingSrcFactor.SrcAlpha
  },
  culling: x.Material.CullSide.NONE,
  modify(e) {
    return Object.assign({}, this, e);
  }
}, cr.transparentImageBlending = {
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
let it = cr;
class ax {
  /**
   * This retrieves all easing metrics for every instance for every specified eased attribute.
   */
  static async modify(e, t, s) {
    for (let n = 0, r = t.length; n < r; ++n) {
      const o = t[n];
      for (let a = 0, c = e.length; a < c; ++a) {
        const l = e[a], u = l.getEasing(o);
        u && s(u, l, a, n);
      }
    }
  }
  /**
   * This finds all easing controls requested for all instances.
   *
   * If wait is true, then this method's returned promise will resolve AFTER the time
   * of all discovered easing objects has passed.
   */
  static async all(e, t, s, n) {
    let r = Eo;
    const o = new Promise((l) => r = l);
    let a = 0;
    for (let l = 0, u = s.length; l < u; ++l) {
      const h = s[l];
      for (let d = 0, f = t.length; d < f; ++d) {
        const p = t[d], g = p.getEasing(h);
        g && (n && n(g, p, d, l), a = Math.max(
          (g.delay || 0) + g.duration,
          a
        ));
      }
    }
    const c = (l) => {
      l < a ? oi(c) : r();
    };
    return e ? oi((l) => {
      a += l, c(l);
    }) : r(), o;
  }
}
var mp = !!(typeof window < "u" && window.document && window.document.createElement), mu = {
  canUseDOM: mp
}, bu;
mu.canUseDOM && (bu = document.implementation && document.implementation.hasFeature && // always returns true in newer browsers as per the standard.
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
function bp(i, e) {
  if (!mu.canUseDOM || e)
    return !1;
  var t = "on" + i, s = t in document;
  if (!s) {
    var n = document.createElement("div");
    n.setAttribute(t, "return;"), s = typeof n[t] == "function";
  }
  return !s && bu && i === "wheel" && (s = document.implementation.hasFeature("Events.wheel", "3.0")), s;
}
var Va = !1, es, eo, to, Un, zn, xu, Gn, io, so, no, vu, ro, oo, wu, Tu;
function Ge() {
  if (!Va) {
    Va = !0;
    var i = navigator.userAgent, e = /(?:MSIE.(\d+\.\d+))|(?:(?:Firefox|GranParadiso|Iceweasel).(\d+\.\d+))|(?:Opera(?:.+Version.|.)(\d+\.\d+))|(?:AppleWebKit.(\d+(?:\.\d+)?))|(?:Trident\/\d+\.\d+.*rv:(\d+\.\d+))/.exec(
      i
    ), t = /(Mac OS X)|(Windows)|(Linux)/.exec(i);
    if (ro = /\b(iPhone|iP[ao]d)/.exec(i), oo = /\b(iP[ao]d)/.exec(i), no = /Android/i.exec(i), wu = /FBAN\/\w+;/i.exec(i), Tu = /Mobile/i.exec(i), vu = !!/Win64/.exec(i), e) {
      es = e[1] ? parseFloat(e[1]) : e[5] ? parseFloat(e[5]) : NaN, es && document && document.documentMode && (es = document.documentMode);
      var s = /(?:Trident\/(\d+.\d+))/.exec(i);
      xu = s ? parseFloat(s[1]) + 4 : es, eo = e[2] ? parseFloat(e[2]) : NaN, to = e[3] ? parseFloat(e[3]) : NaN, Un = e[4] ? parseFloat(e[4]) : NaN, Un ? (e = /(?:Chrome\/(\d+\.\d+))/.exec(i), zn = e && e[1] ? parseFloat(e[1]) : NaN) : zn = NaN;
    } else
      es = eo = to = zn = Un = NaN;
    if (t) {
      if (t[1]) {
        var n = /(?:Mac OS X (\d+(?:[._]\d+)?))/.exec(i);
        Gn = n ? parseFloat(n[1].replace("_", ".")) : !0;
      } else
        Gn = !1;
      io = !!t[2], so = !!t[3];
    } else
      Gn = io = so = !1;
  }
}
var ao = {
  /**
   *  Check if the UA is Internet Explorer.
   *
   *
   *  @return float|NaN Version number (if match) or NaN.
   */
  ie: function() {
    return Ge() || es;
  },
  /**
   * Check if we're in Internet Explorer compatibility mode.
   *
   * @return bool true if in compatibility mode, false if
   * not compatibility mode or not ie
   */
  ieCompatibilityMode: function() {
    return Ge() || xu > es;
  },
  /**
   * Whether the browser is 64-bit IE.  Really, this is kind of weak sauce;  we
   * only need this because Skype can't handle 64-bit IE yet.  We need to remove
   * this when we don't need it -- tracked by #601957.
   */
  ie64: function() {
    return ao.ie() && vu;
  },
  /**
   *  Check if the UA is Firefox.
   *
   *
   *  @return float|NaN Version number (if match) or NaN.
   */
  firefox: function() {
    return Ge() || eo;
  },
  /**
   *  Check if the UA is Opera.
   *
   *
   *  @return float|NaN Version number (if match) or NaN.
   */
  opera: function() {
    return Ge() || to;
  },
  /**
   *  Check if the UA is WebKit.
   *
   *
   *  @return float|NaN Version number (if match) or NaN.
   */
  webkit: function() {
    return Ge() || Un;
  },
  /**
   *  For Push
   *  WILL BE REMOVED VERY SOON. Use UserAgent_DEPRECATED.webkit
   */
  safari: function() {
    return ao.webkit();
  },
  /**
   *  Check if the UA is a Chrome browser.
   *
   *
   *  @return float|NaN Version number (if match) or NaN.
   */
  chrome: function() {
    return Ge() || zn;
  },
  /**
   *  Check if the user is running Windows.
   *
   *  @return bool `true' if the user's OS is Windows.
   */
  windows: function() {
    return Ge() || io;
  },
  /**
   *  Check if the user is running Mac OS X.
   *
   *  @return float|bool   Returns a float if a version number is detected,
   *                       otherwise true/false.
   */
  osx: function() {
    return Ge() || Gn;
  },
  /**
   * Check if the user is running Linux.
   *
   * @return bool `true' if the user's OS is some flavor of Linux.
   */
  linux: function() {
    return Ge() || so;
  },
  /**
   * Check if the user is running on an iPhone or iPod platform.
   *
   * @return bool `true' if the user is running some flavor of the
   *    iPhone OS.
   */
  iphone: function() {
    return Ge() || ro;
  },
  mobile: function() {
    return Ge() || ro || oo || no || Tu;
  },
  nativeApp: function() {
    return Ge() || wu;
  },
  android: function() {
    return Ge() || no;
  },
  ipad: function() {
    return Ge() || oo;
  }
};
const $a = 10, Wa = 40, ja = 800;
function Eu(i) {
  let e = 0, t = 0, s = 0, n = 0;
  return "detail" in i && (t = i.detail), "wheelDelta" in i && (t = -i.wheelDelta / 120), "wheelDeltaY" in i && (t = -i.wheelDeltaY / 120), "wheelDeltaX" in i && (e = -i.wheelDeltaX / 120), "axis" in i && i.axis === i.HORIZONTAL_AXIS && (e = t, t = 0), s = e * $a, n = t * $a, "deltaY" in i && (n = i.deltaY), "deltaX" in i && (s = i.deltaX), (s || n) && i.deltaMode && (i.deltaMode === 1 ? (s *= Wa, n *= Wa) : (s *= ja, n *= ja)), s && !e && (e = s < 1 ? -1 : 1), n && !t && (t = n < 1 ? -1 : 1), {
    spinX: e,
    spinY: -t,
    pixelX: s,
    pixelY: -n
  };
}
Eu.getEventType = function() {
  return ao.firefox() ? "DOMMouseScroll" : bp("wheel") ? "wheel" : "mousewheel";
};
function Ht(i, e) {
  let t = 0, s = 0, n = 0, r = 0, o = e || i.nativeEvent && i.nativeEvent.target || i.target;
  if (i || (i = window.event), i.pageX || i.pageY)
    t = i.pageX, s = i.pageY;
  else if (i.clientX || i.clientY) {
    let a = 0, c = 0;
    document.documentElement && (a = document.documentElement.scrollLeft, c = document.documentElement.scrollTop), t = i.clientX + document.body.scrollLeft + a, s = i.clientY + document.body.scrollTop + c;
  }
  if (o.offsetParent)
    do
      n += o.offsetLeft, r += o.offsetTop, o = o.offsetParent;
    while (o);
  return [t - n, s - r];
}
const xp = 5, vp = 10;
class wp {
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
    const s = e.mid;
    this.TL = new Zs(e.x, s[0], e.y, s[1], t), this.TR = new Zs(
      s[0],
      e.right,
      e.y,
      s[1],
      t
    ), this.BL = new Zs(
      e.x,
      s[0],
      s[1],
      e.bottom,
      t
    ), this.BR = new Zs(
      s[0],
      e.right,
      s[1],
      e.bottom,
      t
    );
  }
}
class Zs {
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
  constructor(e, t, s, n, r) {
    this.children = [], this.depth = 0, arguments.length >= 4 ? this.bounds = new J({ left: e, right: t, top: s, bottom: n }) : this.bounds = new J({ left: 0, right: 1, top: 0, bottom: 1 }), this.depth = r || 0;
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
    let t = Number.MAX_SAFE_INTEGER, s = Number.MAX_SAFE_INTEGER, n = Number.MIN_SAFE_INTEGER, r = Number.MIN_SAFE_INTEGER;
    const { min: o, max: a } = Math;
    for (let c = 0, l = e.length; c < l; ++c) {
      const u = e[c];
      t = o(t, u.x), n = a(u.right, n), s = o(s, u.y), r = a(r, u.bottom);
    }
    this.cover(
      new J({ left: t, right: n, top: s, bottom: r })
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
    this.nodes && (this.nodes.destroy(), delete this.nodes), t.forEach((s) => this.doAdd(s));
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
    return this.nodes ? e.isInside(this.nodes.TL.bounds) ? this.nodes.TL.doAdd(e) : e.isInside(this.nodes.TR.bounds) ? this.nodes.TR.doAdd(e) : e.isInside(this.nodes.BL.bounds) ? this.nodes.BL.doAdd(e) : e.isInside(this.nodes.BR.bounds) ? this.nodes.BR.doAdd(e) : (this.children.push(e), !0) : e.isInside(this.bounds) ? (this.children.push(e), this.children.length > xp && this.depth < vp && this.split(), !0) : (isNaN(e.width + e.height + e.x + e.y) ? console.error(
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
    for (let s = 0, n = this.children.length; s < n; ++s)
      e.push(this.children[s]);
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
    return e instanceof J ? e.hitBounds(this.bounds) ? this.queryBounds(e, [], t) : [] : Dc(e) && this.bounds.containsPoint(e) ? this.queryPoint(e, [], t) : [];
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
  queryBounds(e, t, s) {
    return this.bounds.isInside(e) ? (this.gatherChildren(t, s), t) : (this.children.forEach((n) => {
      n.hitBounds(e) && t.push(n);
    }), s && s(this), this.nodes && (e.hitBounds(this.nodes.TL.bounds) && this.nodes.TL.queryBounds(e, t, s), e.hitBounds(this.nodes.TR.bounds) && this.nodes.TR.queryBounds(e, t, s), e.hitBounds(this.nodes.BL.bounds) && this.nodes.BL.queryBounds(e, t, s), e.hitBounds(this.nodes.BR.bounds) && this.nodes.BR.queryBounds(e, t, s)), t);
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
  queryPoint(e, t, s) {
    return this.children.forEach((n) => {
      n.containsPoint(e) && t.push(n);
    }), s && s(this), this.nodes && (this.nodes.TL.bounds.containsPoint(e) && this.nodes.TL.queryPoint(e, t, s), this.nodes.TR.bounds.containsPoint(e) && this.nodes.TR.queryPoint(e, t, s), this.nodes.BL.bounds.containsPoint(e) && this.nodes.BL.queryPoint(e, t, s), this.nodes.BR.bounds.containsPoint(e) && this.nodes.BR.queryPoint(e, t, s)), t;
  }
  /**
   * Creates four sub quadrants for this node.
   */
  split() {
    const e = [];
    this.gatherChildren(e), this.nodes = new wp(this.bounds, this.depth + 1), this.children = [];
    for (let t = 0, s = e.length; t < s; ++t) {
      const n = e[t];
      n && this.doAdd(n);
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
class Tp extends Zs {
}
class nr {
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
        for (let s = 0, n = t.length; s < n; ++s) {
          const r = t[s];
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
    for (let t = 0, s = this.currentInitializers.length; t < s; ++t) {
      const n = this.currentInitializers[t], r = this.keyToItem.get(n.key);
      r && e.push(this.options.destroyItem(n, r));
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
    let s = 0;
    for (; s < t.length; ) {
      const r = t[s];
      if (this.currentInitalizerIndex = s, this.currentInitializer = r, this.willDispose.has(r.key)) {
        let o = this.keyToItem.get(r.key) || null;
        o ? (this.currentItem = o, await this.options.updateItem(r, o)) : (o = await this.options.buildItem(r), o && (this.currentItem = o)), this.currentItem && (this.keyToInitializer.set(r.key, r), this.willDispose.delete(r.key), this._items.push(this.currentItem));
      } else {
        this.inline = this.inlineDeferred;
        const o = await this.options.buildItem(r);
        this.inline = this.inlineImmediate, o && (this.currentItem = o, this.deferredInlining && (this.inline(this.deferredInlining), delete this.deferredInlining), this.keyToItem.set(r.key, this.currentItem), this.keyToInitializer.set(r.key, r), this._items.push(this.currentItem));
      }
      delete this.currentItem, s++;
    }
    const n = /* @__PURE__ */ new Set();
    if (this.willDispose.forEach(async (r) => {
      const o = this.keyToItem.get(r), a = this.keyToInitializer.get(r);
      if (!o || !a) return;
      await this.options.destroyItem(a, o) && (this.keyToItem.delete(r), this.keyToInitializer.delete(r), n.add(o));
    }), n.size > 0) {
      const r = this._items;
      this._items = new Array(r.length - n.size);
      let o = 0;
      for (let a = 0, c = r.length; a < c; ++a) {
        const l = r[a];
        n.has(l) || (this._items[o] = l, o++);
      }
    }
    this.willDispose.clear(), this.keyToInitializer.forEach((r) => {
      this.willDispose.add(r.key);
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
    e && (this.currentItem = e, this.keyToItem.set(this.currentItem.id, e), this.keyToInitializer.set(this.currentItem.id, this.currentInitializer));
  }
}
function as(i) {
  const {
    shader: e,
    options: t = {},
    required: s,
    onError: n,
    onToken: r,
    onMain: o
  } = i, a = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), h = e.replace(
    /\$\{([^\}]*)\}/g,
    (f, p) => {
      let g = "";
      return u.set(p, (u.get(p) || 0) + 1), p in t ? (a.set(p, (a.get(p) || 0) + 1), g = t[p]) : c.set(p, (c.get(p) || 0) + 1), r && (g = r(p, g)), g;
    }
  );
  Object.keys(t).forEach((f) => {
    a.get(f) || l.set(f, (l.get(f) || 0) + 1);
  });
  const d = {
    resolvedShaderOptions: a,
    shader: h,
    shaderProvidedOptions: u,
    unresolvedProvidedOptions: l,
    unresolvedShaderOptions: c
  };
  if (s && s.values.forEach((f) => {
    if (d.unresolvedProvidedOptions.get(f)) {
      const p = `${s.name}: Could not resolve all the required inputs. Input: ${f}`;
      n ? n(p) : console.error(p);
    } else if (d.unresolvedShaderOptions.get(f)) {
      const p = `${s.name}: A required option was not provided in the options parameter. Option: ${f}`;
      n ? n(p) : console.error(p);
    } else if (!d.resolvedShaderOptions.get(f)) {
      const p = `${s.name}: A required option was not provided in the options parameter. Option: ${f}`;
      n ? n(p) : console.error(p);
    }
  }), o) {
    const f = d.shader, p = f.match(
      /void((.+)|\s)(main(\s+)\(\)|main\(\))(((.+)(\s*)\{)|(\s*)\{)/gm
    );
    if (p && p.length > 0) {
      const g = f.indexOf(p[0]);
      if (g < 0) o(null);
      else {
        const m = f.substr(0, g), b = f.substr(g + p[0].length);
        let v = !1, w = !1, E = 1, y = 0, C = -1;
        for (let M = 0, R = b.length; M < R; ++M) {
          const V = b[M], z = b[M + 1];
          switch (V) {
            case "/":
              switch (z) {
                case "*":
                  !v && !w && (v = !0, M++);
                  break;
                case "/":
                  !v && !w && (w = !0, M++);
                  break;
              }
              break;
            case "*":
              z === "/" && (w || (v = !1, M++));
              break;
            case `
`:
            case "\r":
              v || (w = !1);
              break;
            case "{":
              !v && !w && E++;
              break;
            case "}":
              !v && !w && y++, E === y && (C = M);
              break;
          }
          if (C !== -1)
            break;
        }
        if (C !== -1) {
          const M = b.substr(0, C), R = b.substr(C + 1), V = o(M, `${m}
${R}`);
          typeof V == "string" ? d.shader = f.substr(0, g + p[0].length) + V + f.substr(g + p[0].length + C) : d.shader = f.substr(0, g) + V.header + f.substr(g, p[0].length) + V.main + f.substr(g + p[0].length + C);
        } else
          o(null);
      }
    }
  }
  return d;
}
function cx(i) {
  return new Promise((e) => setTimeout(e, i));
}
function Ep(i) {
  return i;
}
function ks(i, e) {
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
function Vs(i, e) {
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
function yp(i) {
  return i;
}
function Rp(i) {
  return i;
}
const lx = {
  layer: ks,
  view: Su,
  vertex: Rp,
  uniform: yp,
  attribute: Ep
};
class ux {
  constructor(e) {
    this.index = -1, this.marker = /* @__PURE__ */ new Map(), this.pool = new Array(e.firstAlloc);
    for (let t = 0, s = e.firstAlloc; t < s; ++t)
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
function Ap(i, e, t, s) {
  return e < 0 && (e = i.length + e, e < 0 && (e = 0)), i.slice(0, e) + "" + i.slice(e + t);
}
function rr(i) {
  let e = !1, t = !1;
  const s = [];
  let n = { start: -1, stop: -1 }, r = { start: -1, stop: -1 };
  for (let o = 0, a = i.length; o < a; ++o) {
    const c = i[o], l = i[o + 1];
    switch (c) {
      case "/":
        switch (l) {
          case "*":
            !t && !e && (n.start = o, e = !0, o++);
            break;
          case "/":
            !e && !t && (r.start = o, t = !0, o++);
            break;
        }
        break;
      case "*":
        l === "/" && e && (n.stop = o + 2, s.push(n), n = { start: -1, stop: -1 }, e = !1, o++);
        break;
      case `
`:
      case "\r":
        t && (r.stop = o, s.push(r), r = { start: -1, stop: -1 }, t = !1);
        break;
    }
  }
  return s.reverse(), s.forEach((o) => {
    i = Ap(i, o.start, o.stop - o.start);
  }), i;
}
function cs(i) {
  return i ? [
    i.atlasTL[0],
    i.atlasTL[1],
    i.atlasBR[0],
    i.atlasBR[1]
  ] : [0, 0, 0, 0];
}
class Ui {
  constructor(e) {
    this._uid = P(), this.aspectRatio = 1, this.atlasTL = [0, 0], this.atlasTR = [0, 0], this.atlasBL = [0, 0], this.atlasBR = [0, 0], this.heightOnAtlas = 0, this.isValid = !1, this.pixelWidth = 0, this.pixelHeight = 0, this.texture = null, this.widthOnAtlas = 0, Object.assign(this, e);
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
    const s = t.x / e.data.width, n = t.y / e.data.height, r = t.width / e.data.width, o = t.height / e.data.height, a = new J({
      bottom: n + o,
      left: s,
      right: s + r,
      top: n
    }), c = a.bottom, l = a.y, u = a.x, h = a.x + a.width, d = new Ui();
    return d.atlasTL = [u, l], d.atlasBR = [h, c], d.atlasBL = [u, c], d.atlasTR = [h, l], d;
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
const An = ve("performance");
var co = /* @__PURE__ */ ((i) => (i[i.BITMAP = 0] = "BITMAP", i[i.SDF = 1] = "SDF", i[i.MSDF = 2] = "MSDF", i))(co || {});
class _p extends fs {
  constructor(e) {
    super(e), this.dynamic = !1, this.glyphCount = 0, this.glyphMap = {}, this.kerning = {}, this.spaceWidth = 0, this.type = oe.FONT, this.dynamic = e.dynamic || !1, this.fontSource = e.fontSource, e.characters && e.characters.forEach((s) => {
      this.doRegisterGlyph(s[0], s[1]);
    });
    const t = e.fontMapSize ? e.fontMapSize : [gt._1024, gt._1024];
    this.makeGlyphTypeTextureSettings(e.glyphType), this.createTexture(t), this.packing = new He(0, 0, t[0], t[1]), this.addCachedKerning();
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
        An("Loading cached kerning items:", this.getKerningCacheName());
        try {
          const t = JSON.parse(e);
          let s = 0;
          for (const n in t) {
            let r = typeof n == "string" && n.length === 1;
            if (!r) continue;
            const o = t[n], a = this.kerning[n] || {};
            this.kerning[n] = a;
            for (const c in o)
              r = typeof n == "string" && n.length === 1, r && (a[c] = o[c], s++);
          }
          An(
            "Found kerning items in the cache!",
            "Count:",
            s
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
    for (const s in e) {
      const n = e[s], r = this.kerning[s] || {};
      this.kerning[s] || (t = !0), this.kerning[s] = r;
      for (const o in n)
        r[o] || (t = !0), r[o] = n[o];
    }
    if (t && this.fontSource.localKerningCache)
      try {
        An("Storing kerning info in cache...");
        const s = JSON.stringify(this.kerning);
        localStorage.setItem(this.getKerningCacheName(), s);
      } catch {
        An("Could not cache kerning info");
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
    }, this.texture = new W({
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
    const s = e[0];
    this.glyphMap[s] ? console.warn("A Glyph is already registered with a rendering") : this.glyphMap[s] = t;
  }
  /**
   * This returns which characters are not included in this font map.
   */
  findMissingCharacters(e) {
    const t = /* @__PURE__ */ new Set();
    let s = "";
    for (let n = 0, r = e.length; n < r; ++n) {
      const o = e[n];
      !this.glyphMap[o] && !t.has(o) && (t.add(o), s += o);
    }
    return s;
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
    const s = this.kerning[e];
    return s ? s[t] || [0, 0] : [0, 0];
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
  getGlyphWidth(e, t, s) {
    const n = e.positions[t], r = e.positions[s];
    if (!t || !s) return 0;
    const o = this.glyphMap[e.glyphs[s]];
    return o ? r[0] + o.pixelWidth - n[0] : 0;
  }
  /**
   * This looks at a string layout and provides a layout that reflects the
   * layout bounded by a max width.
   */
  async getTruncatedLayout(e, t, s, n, r, o) {
    if (e.size[0] > s) {
      let a = "", c = 0;
      for (let p = 0, g = t.length; p < g; ++p)
        c += this.glyphMap[t[p]].pixelWidth;
      if (c > s)
        return {
          fontScale: 1,
          glyphs: "",
          positions: [],
          size: [0, 0],
          text: ""
        };
      let l = 0, u = e.positions.length, h = 0, d = 0, f = "";
      for (; l !== u; ) {
        if (h = Math.floor((u - l) / 2) + l, f = e.glyphs[h], d = e.positions[h][0] + this.glyphMap[f].pixelWidth + c, d > s) u = h;
        else if (d < s) l = h;
        else break;
        if (Math.abs(l - u) <= 1) {
          if (d < s) break;
          for (; d > s && h >= 0; )
            h--, d = e.positions[h][0] + this.glyphMap[f].pixelWidth + c;
          break;
        }
      }
      if (d = e.positions[h][0] + this.glyphMap[f].pixelWidth + c, d < s) {
        let p = 0, g = 0;
        for (let v = 0, w = e.text.length; v < w && p <= h; ++v) {
          const E = e.text[v];
          g++, Ss(E) || p++;
        }
        const m = e.text[g - 1];
        let b;
        for (let v = 0, w = t.length; v < w; ++v)
          if (!Ss(t[v])) {
            b = t[v];
            break;
          }
        if (m && b && !this.kerning[m][b]) {
          const v = await o.estimateKerning(
            [m + b],
            this.fontString,
            this.fontSource.size,
            this.kerning,
            !1,
            this.fontSource.embed
          );
          this.addKerning(v.pairs);
        }
        a = `${e.text.substr(0, g)}${t}`;
      } else
        a = t;
      return this.getStringLayout(a, n, r);
    }
    return e;
  }
  /**
   * Calculates the width of a chunk of characters within a calculated
   * KernedLayout. To use this, first use the getStringLayout() method to get
   * the KernedLayout then insert the substring of text desired for calculating
   * the width.
   */
  getStringWidth(e, t, s) {
    const n = e.text;
    let r = 0, o = n.length;
    if (typeof t == "string") {
      const h = n.indexOf(t);
      if (h < 0) return 0;
      r = h, o = r + t.length;
    } else
      r = t;
    s !== void 0 && (o = s);
    let a = 0;
    const c = Math.min(n.length, r), l = Math.min(n.length, o);
    for (; a < c; ++a)
      Ss(n[a]) && (r--, o--);
    for (; a < l; ++a)
      Ss(n[a]) && o--;
    const u = this.glyphMap[e.text[o] || ""];
    return u ? (e.positions[o] || [0, 0])[0] - (e.positions[r] || [0, 0])[0] + u.pixelWidth : 0;
  }
  /**
   * This processes a string and lays it out by the kerning rules available to
   * this font map.
   *
   * NOTE: This ONLY processes a SINGLE LINE!! ALL whitespace characters will be
   * considered a single space.
   */
  getStringLayout(e, t, s) {
    const n = [];
    let r = "";
    const o = t / this.fontSource.size;
    let a = Number.MAX_SAFE_INTEGER, c = 0, l = 0, u = [0, 0];
    const h = this.spaceWidth;
    let d = 0, f = "", p, g;
    for (let v = 0, w = e.length; v < w; ++v) {
      const E = e[v];
      if (Ss(E)) {
        d++;
        continue;
      }
      p = [0, 0], f && (p = this.kerning[f][E] || [0, 0]), u = Gi(Gi(u, Ae(p, o)), [
        d * h * o + (v === 0 ? 0 : s),
        0
      ]), n.push([u[0], u[1]]), r += E, g = this.glyphMap[E], a = Math.min(u[1], a), c = Math.max(u[1] + g.pixelHeight * o, c), f = E, l = u[0] + g.pixelWidth * o, d = 0;
    }
    const m = c - a, b = [l, m];
    for (let v = 0, w = n.length; v < w; ++v)
      u = n[v], u[1] -= a;
    return {
      fontScale: o,
      glyphs: r,
      positions: n,
      size: b,
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
    for (let t = 1, s = e.length; t < s; ++t) {
      const n = e[t], r = e[t - 1];
      if (this.kerning[r]) {
        if (!this.kerning[r][n])
          return !1;
      } else return !1;
    }
    return !0;
  }
}
const { min: Ha, max: _n } = Math, Ki = document.createElement("canvas");
let Xt;
function Ip(i) {
  const { width: e, height: t } = i.canvas, s = i.getImageData(0, 0, e, t).data;
  let n, r = !1, o = Number.MAX_SAFE_INTEGER, a = Number.MAX_SAFE_INTEGER, c = Number.MIN_SAFE_INTEGER, l = Number.MIN_SAFE_INTEGER;
  for (let u = 0; u < e; ++u)
    for (let h = 0; h < t; ++h) {
      const d = h * (e * 4) + u * 4;
      n = s[d], n > 0 && (r = !0, o = Ha(o, h), a = Ha(a, u), c = _n(c, u), l = _n(l, h));
    }
  return r ? (o -= 1, l += 2, c += 2, a -= 1, o = _n(o, 0), a = _n(a, 0), { minX: a, minY: o, maxX: c, maxY: l }) : null;
}
function yu(i, e, t, s) {
  if (i = i[0], (Ki.width < e || Ki.height < t) && (Ki.width = e, Ki.height = t), !Xt) {
    const c = Ki.getContext("2d", { willReadFrequently: !0 });
    if (c) Xt = c;
    else return null;
  }
  Xt.clearRect(0, 0, Ki.width, Ki.height), Xt.font = s, Xt.fillStyle = "white", Xt.fillText(i, e / 2, t / 2);
  const n = Ip(Xt);
  if (!n)
    return {
      data: Xt.getImageData(0, 0, 1, 1),
      size: [0, 0]
    };
  const r = n.maxX - n.minX, o = n.maxY - n.minY;
  return {
    data: Xt.getImageData(
      n.minX,
      n.minY,
      r,
      o
    ),
    size: [r, o]
  };
}
const Rt = document.createElement("img"), Qe = document.createElement("canvas");
function Mp(i, e, t = 400, s = "normal", n = "woff2") {
  return `
    @font-face {
      font-family: '${i}';
      src: url('${e}') ${n ? `format('${n}')` : ""};
      font-weight: ${t};
      font-style: ${s};
    }
  `;
}
async function Xa(i, e, t) {
  const s = new Ue();
  if (!Rt || !Qe) return null;
  if (t && e) {
    const h = document.createElementNS(e, "style");
    h.textContent = t.map(
      (d) => Mp(d.familyName, d.source, d.weight, d.style, d.fontType)
    ).join(`
`), i.prepend(h);
  }
  const n = new XMLSerializer().serializeToString(i), a = "data:image/svg+xml;base64," + btoa(n);
  let c = !1;
  const l = async () => {
    if (c) return;
    c = !0, Qe.width = Rt.width * window.devicePixelRatio, Qe.height = Rt.height * window.devicePixelRatio;
    const h = Qe.getContext("2d", { willReadFrequently: !0 });
    if (!h) {
      s.resolve(null);
      return;
    }
    h.clearRect(0, 0, Qe.width, Qe.height), h.mozImageSmoothingEnabled = !1, h.webkitImageSmoothingEnabled = !1, h.msImageSmoothingEnabled = !1, h.imageSmoothingEnabled = !1, h.drawImage(
      Rt,
      0,
      0,
      Rt.width * window.devicePixelRatio,
      Rt.height * window.devicePixelRatio
    ), s.resolve(h.getImageData(0, 0, Qe.width, Qe.height)), Qe.style.position = "absolute", Qe.style.top = "100px", Qe.style.left = "0px", Qe.style.zIndex = "9999", Qe.id = "svg-to-data";
  };
  return Rt.onload = l, Rt.src = a, Rt.width > 0 && Rt.height > 0 && l(), await s.promise;
}
const Vn = ve("performance"), { floor: Nr } = Math;
async function Sp(i, e, t, s, n) {
  const r = "http://www.w3.org/2000/svg", o = O.MAX_TEXTURE_SIZE / window.devicePixelRatio, a = e * 2, c = e * 1.3, l = Nr(o / a), u = document.createElementNS(r, "svg");
  u.setAttribute("width", `${o}px`), u.style.font = i, u.style.fontFamily = "RedHatDisplay", u.style.position = "relative", u.style.left = "0px", u.style.top = "0px";
  const h = [], d = Math.floor(o / c);
  let f = 0, p = 0, g = 0, m, b, v = 0;
  for (; p < t.all.length; ) {
    const N = document.createElementNS(r, "g");
    m = N, f = Math.floor(h.length / d), N.setAttribute(
      "transform",
      `translate(0, ${(h.length - f * d) * c})`
    ), h.push(N);
    let D = o;
    for (g = 0; g < l && p < t.all.length; g++) {
      const H = document.createElementNS(r, "text");
      H.setAttribute("x", `${g * a}`), H.setAttribute("dy", "1em");
      const $ = t.all[p];
      p++;
      const ee = $[0], K = $[1], Z = document.createElementNS(r, "tspan"), Y = document.createElementNS(r, "tspan");
      Z.setAttribute("fill", "#ff0000"), Y.setAttribute("fill", "#0000ff"), Z.textContent = ee, Y.textContent = K, H.appendChild(Z), H.appendChild(Y), N.appendChild(H), D -= a;
    }
    if (D >= 0) {
      const H = document.createElementNS(r, "text");
      H.setAttribute("width", `${D}px`), N.appendChild(H), b = H;
    } else
      b = null;
    v = D;
  }
  const w = [];
  for (let N = 0; N < t.all.length; N++)
    w.push([
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER
    ]);
  let E = 0, y = !1;
  if (s) {
    const N = "M", D = document.createElementNS(r, "text");
    D.setAttribute("dy", "1em"), D.style.width = `${a}`, D.style.height = `${c}`, D.setAttribute("x", `${a * g}`), D.style.font = i;
    const H = await yu(N, 128, 128, i);
    if (H) {
      E = H.size[0];
      const $ = document.createElementNS(r, "tspan"), ee = document.createElementNS(r, "tspan"), K = document.createElementNS(r, "tspan");
      if ($.setAttribute("fill", "#ff0000"), K.setAttribute("fill", "#0000ff"), $.textContent = N, K.textContent = N, ee.textContent = " ", D.appendChild($), D.appendChild(ee), D.appendChild(K), g < l && m)
        m.appendChild(D), v -= a, b && (b.remove(), v > 0 && (m.style.width = `${v}px`, m.appendChild(b)));
      else {
        const Z = document.createElement("g");
        f = Math.floor(h.length / d), Z.setAttribute(
          "transform",
          `translate(0, ${(h.length - f * d) * c})`
        ), m = Z, m.appendChild(D), h.push(Z), b = document.createElementNS(r, "text"), Z.appendChild(b);
      }
      w.push([
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER
      ]), y = !0;
    }
  }
  const C = h.length * c, M = Math.ceil(C / o);
  let R = null;
  Vn(
    "Rendering table canvas batches for font kerning analysis",
    t,
    h
  );
  for (let N = 0; N < M; ++N) {
    const D = h.splice(0, d), H = D.length * c;
    for (u.setAttribute("height", `${H}px`); u.lastElementChild; ) u.lastElementChild.remove();
    for (let $ = 0, ee = D.length; $ < ee; ++$) {
      const K = D[$];
      u.appendChild(K);
    }
    if (!R)
      R = await Xa(u, r, n);
    else {
      const $ = await Xa(u, r, n);
      if (!$) {
        console.warn(
          "Font Renderer: Could not generate image data for analyzing font kerning"
        );
        continue;
      }
      const ee = new Uint8ClampedArray(
        R.data.length + $.data.length
      );
      ee.set(R.data), ee.set($.data, R.data.length), R = new ImageData(
        ee,
        o * window.devicePixelRatio,
        R.height + $.height
      );
    }
  }
  Vn("Analyzing rendered data", R);
  const V = a * window.devicePixelRatio, z = c * window.devicePixelRatio;
  if (R) {
    const N = R.data;
    let D, H, $, ee, K, Z;
    for (let Y = 0, Ce = R.height; Y < Ce; Y++)
      for (let T = 0, k = R.width; T < k; T++)
        D = (k * Y + T) * 4, H = N[D + 0], $ = N[D + 1], ee = N[D + 2], Z = Nr(Y / z) * l + Nr(T / V), Z < w.length && (K = w[Z], H > 0 && $ === 0 && ee === 0 && (T < K[0] && (K[0] = T), Y < K[1] && (K[1] = Y)), H === 0 && $ === 0 && ee > 0 && (T < K[2] && (K[2] = T), Y < K[3] && (K[3] = Y)));
    if (y) {
      const Y = w.pop();
      if (Y) {
        const Ce = [Y[2] - Y[0], 0], T = Ae(Ce, 1 / window.devicePixelRatio);
        t.spaceWidth = Math.ceil(T[0]) - E;
      }
    }
    for (let Y = 0, Ce = w.length; Y < Ce; Y++) {
      const T = t.all[Y], k = T[0], j = T[1], te = w[Y], Oe = [te[2] - te[0], te[3] - te[1]], we = t.pairs[k];
      if (we) {
        const Si = Ae(Oe, 1 / window.devicePixelRatio);
        we[j] = [Math.ceil(Si[0]), Si[1]];
      }
    }
  } else
    console.warn(
      "html2canvas did not produce a valid canvas context to analyze"
    );
  Vn("Kerning rendering analysis complete", t.pairs);
}
function Cp(i, e, t) {
  i = i.replace(/\s/g, "");
  const s = t && t.all || [], n = t && t.pairs || {};
  for (let r = 0; r < i.length - 1; r++) {
    const o = i[r], a = i[r + 1];
    let c = n[o];
    c || (c = n[o] = {}), (!e[o] || !e[o][a]) && !c[a] && (c[a] = [0, 0], s.push(`${o}${a}`));
  }
  return {
    all: s,
    pairs: n,
    spaceWidth: 0
  };
}
class Op {
  /**
   * This function takes a sentence and grid info Returns a canvas with a list
   * of glyphs where each glyph fits cnetered within each grid cell
   */
  makeBitmapGlyphs(e, t, s) {
    const n = {}, r = /* @__PURE__ */ new Set();
    for (let a = 0, c = e.length; a < c; ++a)
      r.add(e[a]);
    const o = Array.from(r.values());
    for (let a = 0, c = o.length; a < c; ++a) {
      const l = o[a], u = yu(l, s * 2, s * 2, t);
      u ? n[l] = {
        glyph: u.data,
        glyphIndex: a
      } : console.warn(
        "Unable to render character",
        l,
        "to font map for rendering."
      );
    }
    return n;
  }
  /**
   * This performs a special rendering to guess kerning of letters of embedded
   * fonts (fonts we don't have access to their raw font files). This will
   * provide kerning information of a letter by providing the distance from a
   * 'left' letter's top left  corner to the 'right' letter's topleft corner.
   */
  async estimateKerning(e, t, s, n, r, o) {
    const a = {
      all: [],
      pairs: {},
      spaceWidth: 0
    };
    Vn("Estimating Kerning for", e);
    for (let c = 0, l = e.length; c < l; ++c) {
      const u = e[c];
      Cp(u, n, a);
    }
    return (a.all.length > 0 || r) && await Sp(t, s, a, r, o), a;
  }
}
var Us = /* @__PURE__ */ ((i) => (i[i.TEXCOORDS = 0] = "TEXCOORDS", i[i.IMAGE_SIZE = 1] = "IMAGE_SIZE", i))(Us || {});
function $s(i) {
  return {
    type: oe.FONT,
    ...i
  };
}
function hx() {
  return ".101112131415161718191.202122232425262728292.303132333435363738393.404142434445464748494.505152535455565758595.606162636465666768696.707172737475767778797.808182838485868788898.909192939495969798999.000102030405060708090.$0$1$2$3$4$5$6$7$8$9$%0%1%2%3%4%5%6%7%8%9%-0-1-2-3-4-5-6-7-8-9-+0+1+2+3+4+5+6+7+8+9+)0)1)2)3)4)5)6)7)8)9)(0(1(2(3(4(5(6(7(8(9(";
}
async function Lp(i, e) {
  let t = 0, s, n;
  try {
    if (!e) return;
    for (const r of e)
      s = r, t = 0, !document.fonts.check(i) && (t++, n = new FontFace(r.familyName, `url(${r.source})`, {
        weight: `${r.weight}`,
        style: r.style
      }), t++, await n.load(), t++, document.fonts.add(n));
    await document.fonts.ready;
  } catch (r) {
    switch (console.error("Font embedding Error:"), t) {
      case 0:
        console.error("Font embedding failed check:", i);
        break;
      case 1:
        console.error(
          "Font embedding failed to create the font face:",
          s
        );
        break;
      case 2:
        console.error("Font embedding failed to load the font face:", {
          fontFace: n,
          embedding: s
        });
        break;
      case 3:
        console.error("Font embedding failed to add the font face", {
          fontFace: n,
          embedding: s
        });
        break;
    }
    r instanceof Error && console.error(r.stack || r.message);
  }
}
const Qa = ve("performance");
var Np = /* @__PURE__ */ ((i) => (i[i._16 = 16] = "_16", i[i._32 = 32] = "_32", i[i._64 = 64] = "_64", i[i._128 = 128] = "_128", i))(Np || {});
function Ya(i) {
  return i && i.type === oe.FONT;
}
function Bp(i) {
  return i && i.type === void 0;
}
function Ru(i) {
  return {
    key: "",
    type: oe.FONT,
    ...i
  };
}
class Pp {
  constructor() {
    this.fontMaps = /* @__PURE__ */ new Map(), this.fontRenderer = new Op();
  }
  /**
   * This takes all requests that want layout information included for a group
   * of text and populates the request with the appropriate information.
   */
  async calculateMetrics(e, t) {
    Qa("Calculating metrics for requests");
    const s = this.fontMaps.get(e);
    if (s)
      for (let n = 0, r = t.length; n < r; ++n) {
        const a = t[n].metrics;
        a && (a.layout = s.getStringLayout(
          a.text,
          a.fontSize,
          a.letterSpacing
        ), a.maxWidth && (Qa("Calculating truncation for", a.text, a.maxWidth), a.layout = await s.getTruncatedLayout(
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
    let s = "";
    for (let n = 0, r = e.length; n < r; ++n) {
      const o = e[n];
      t.has(o) || (t.add(o), s += o);
    }
    return s;
  }
  /**
   * This generates a new font map object to work with. It will either be
   * pre-rendered or dynamically populated as requests are made.
   */
  async createFontMap(e) {
    const t = this.characterFilterToCharacters(
      e.characterFilter || ""
    ), s = e.fontSource;
    let n = co.SDF;
    s && (Bp(s) ? n = co.BITMAP : n = s.type || n);
    const r = new _p({
      ...e,
      glyphType: n
    });
    return await this.updateFontMapCharacters(t, r), this.fontMaps.set(e.key, r), e.fontSource.preload && this.updateFontMap(e.key, [
      $s({
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
    const s = this.fontMaps.get(e);
    if (!s) return;
    let n = [];
    const r = /* @__PURE__ */ new Set();
    for (let a = 0, c = t.length; a < c; ++a) {
      const l = t[a];
      if (l.character && r.add(l.character), l.kerningPairs && (n = n.concat(l.kerningPairs)), l.metrics && l.metrics.truncation) {
        const u = l.metrics.truncation.replace(/\s/g, "");
        n.push(u);
        for (let h = 0, d = l.metrics.truncation.length; h < d; ++h)
          r.add(u);
      }
    }
    for (let a = 0, c = n.length; a < c; ++a)
      r.add(n[a]);
    let o = "";
    r.forEach((a) => o += a), await Lp(s.fontString, s.fontSource.embed), await this.updateFontMapCharacters(o, s), await this.updateKerningPairs(n, s);
    for (let a = 0, c = t.length; a < c; ++a)
      t[a].fontMap = s;
  }
  /**
   * This updates the calculated kerning pairs for a given font map.
   */
  async updateKerningPairs(e, t) {
    if (!t) return;
    const s = await this.fontRenderer.estimateKerning(
      e,
      t.fontString,
      t.fontSource.size,
      t.kerning,
      !t.spaceWidth,
      t.fontSource.embed
    );
    t.addKerning(s.pairs), t.spaceWidth = t.spaceWidth || s.spaceWidth;
  }
  /**
   * This updates a specified font map with a list of characters expected within
   * it.
   */
  async updateFontMapCharacters(e, t) {
    if (!t) return;
    const s = t.texture, n = t.findMissingCharacters(e);
    if (n.length <= 0) return;
    const r = this.fontRenderer.makeBitmapGlyphs(
      n,
      t.fontString,
      t.fontSource.size
    );
    for (const o in r) {
      const a = r[o];
      if (s != null && s.data) {
        const c = new J({
          x: 0,
          y: 0,
          width: a.glyph.width,
          height: a.glyph.height
        }), l = new Ui(), u = t.packing.insert({
          data: l,
          bounds: c
        });
        if (!u) {
          console.warn(
            "Font map is full and could not pack in any more glyphs"
          );
          return;
        }
        He.applyToSubTexture(
          t.packing,
          u,
          l,
          void 0,
          !0
        ), s.update(a.glyph, {
          ...u.bounds,
          y: t.packing.bounds.height - u.bounds.y - u.bounds.height
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
  async getPrerenderedImageData(e, t, s) {
    const n = [];
    return s.forEach((r) => {
      let o = e.glyphs[r];
      if (o || (o = e.errorGlyph), !e.errorGlyph)
        return console.warn(
          "The prerendered source provided did NOT provide a proper glyph for rendering when a glyph could not be located."
        ), [];
      const a = new Image();
      let c;
      const l = new Promise((u) => c = u);
      return a.onload = function() {
        const u = document.createElement("canvas"), h = u.getContext("2d");
        if (!h) return;
        u.width = t, u.height = t, h.drawImage(a, 0, 0, t, t);
        const d = h.getImageData(0, 0, t, t);
        c(d);
      }, a.onerror = function() {
        console.warn(
          "There was an issue with loading the glyph data for character:",
          r
        ), c(null);
      }, a.src = e.glyphs[r], n.push(l), [];
    }), await Promise.all(n);
  }
}
const Fp = ve("performance");
class Dp {
  /**
   * This is a helper to apply declarations to the input declaration object. This will automatically use the
   * performance debug output to provide useful information when overrides occur.
   */
  setDeclaration(e, t, s, n) {
    e.has(t) && Fp(
      `%s: Overriding declaration %s
Setting new value: %s`,
      n || "Expand IO Declarations",
      t,
      s
    ), e.set(t, s);
  }
}
class Ar extends Dp {
  /**
   * This is called with the Layer's currently declared Shader IO configuration.
   * The returned IO configuration will be added to the existing IO. Each
   * BaseIOExpansion object will receive the expanded IO configuration of other
   * expansion objects if the object is processed after another expansion
   * object.
   *
   * NOTE: The inputs should NOT be modified in any way
   */
  expand(e, t, s, n, r) {
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
  validate(e, t, s, n, r) {
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
  processHeaderInjection(e, t, s, n, r, o, a) {
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
  processAttributeDestructuring(e, t, s, n, r, o) {
    return "";
  }
}
const kp = "TextureIOExpansion";
function Up(i, e, t) {
  return i && i.resource && e.getResourceType(i.resource.key()) === t && i.resource.name !== void 0 && i.resource.key !== void 0;
}
class qo extends Ar {
  constructor(e, t) {
    super(), this.manager = t, this.resourceType = e;
  }
  /**
   * Provides expanded IO for attributes with resource properties.
   */
  expand(e, t, s, n) {
    const r = this.manager, o = [], a = /* @__PURE__ */ new Map();
    t.forEach((u) => {
      if (Up(u, this.manager.router, this.resourceType)) {
        u.size === void 0 && (u.size = S.FOUR);
        const h = u.resource.shaderInjection || _.FRAGMENT, d = a.get(
          u.resource.name
        );
        d ? a.set(u.resource.name, [
          d[0] || h === _.VERTEX || h === _.ALL,
          d[1] || h === _.FRAGMENT || h === _.ALL
        ]) : (o.push(u), a.set(u.resource.name, [
          h === _.VERTEX || h === _.ALL,
          h === _.FRAGMENT || h === _.ALL
        ]));
      }
    });
    const c = o.map(
      (u) => {
        let h = _.FRAGMENT;
        if (u.resource) {
          const d = a.get(
            u.resource.name
          );
          d && (h = d[0] && d[1] && _.ALL || d[0] && !d[1] && _.VERTEX || !d[0] && d[1] && _.FRAGMENT || h);
        }
        return [
          // This injects the sampler that the shader will use for sampling
          // texels
          {
            name: u.resource.name,
            shaderInjection: h,
            size: A.TEXTURE,
            update: () => {
              const d = r.getResource(
                u.resource.key()
              );
              return d && d.texture || W.emptyTexture;
            }
          },
          // This provides the size of the texture that is applied to the
          // sampler.
          {
            name: `${u.resource.name}_size`,
            shaderInjection: h,
            size: A.TWO,
            update: () => {
              const d = r.getResource(
                u.resource.key()
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
      (u) => u.forEach((h) => l.push(h))
    ), {
      instanceAttributes: [],
      vertexAttributes: [],
      uniforms: l
    };
  }
  /**
   * Validates the IO about to be expanded.
   */
  validate(e, t, s, n) {
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
  processHeaderInjection(e, t, s, n, r, o, a) {
    const c = {
      injection: ""
    };
    for (let l = 0, u = a.length; l < u; ++l) {
      const h = a[l], d = h.shaderInjection || _.VERTEX;
      h.size === A.TEXTURE && (d === e || d === _.ALL) && this.setDeclaration(
        t,
        h.name,
        `uniform sampler2D ${h.name};
`,
        kp
      );
    }
    return c;
  }
}
const Xs = ve("performance");
class zp extends un {
  constructor() {
    super(...arguments), this.requestLookup = /* @__PURE__ */ new Map(), this.requestQueue = /* @__PURE__ */ new Map(), this.resourceLookup = /* @__PURE__ */ new Map(), this.fontManager = new Pp();
  }
  /**
   * This is so the system can control when requests are made so this manager
   * has the opportunity to verify and generate the resources the request
   * requires.
   */
  async dequeueRequests() {
    let e = !1;
    const t = [];
    this.requestQueue.forEach((s, n) => {
      t.push([n, s]);
    }), this.requestQueue.clear();
    for (let s = 0, n = t.length; s < n; ++s) {
      const [r, o] = t[s];
      if (o.length > 0) {
        e = !0;
        const a = o.slice(0);
        o.length = 0, Xs("Processing requests for resource '%s'", r), await this.fontManager.updateFontMap(r, a), await this.fontManager.calculateMetrics(r, a);
        const c = this.requestLookup.get(r);
        c ? (a.forEach((l) => {
          const u = c.get(l);
          if (c.delete(l), u) {
            for (let h = 0, d = u.length; h < d; ++h) {
              const [f, p] = u[h];
              f.managesInstance(p) && (p.active = !0);
            }
            ou(() => {
              const h = /* @__PURE__ */ new Set();
              for (let d = 0, f = u.length; d < f; ++d) {
                const p = u[d][1];
                h.has(p) || (h.add(p), p.resourceTrigger());
              }
            });
          }
        }), Xs("All requests for resource '%s' are processed", r)) : Xs(
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
    return [new qo(oe.FONT, this)];
  }
  /**
   * This is a request to intiialize a resource by this manager.
   */
  async initResource(e) {
    if (Ya(e)) {
      const t = await this.fontManager.createFontMap(e);
      t && this.resourceLookup.set(e.key, t), Xs("Font map created->", t);
    }
  }
  /**
   * This is for attributes making a request for a resource of this type to
   * create shader compatible info regarding the requests properties.
   */
  request(e, t, s, n) {
    const r = s, o = r.fontMap;
    let a = null;
    if (o)
      return r.character && (a = o.getGlyphTexture(r.character)), a ? r.fetch === Us.IMAGE_SIZE ? [a.pixelWidth, a.pixelHeight] : cs(a) : r.fetch === Us.IMAGE_SIZE ? [0, 0] : cs(null);
    const c = s.key;
    let l = this.requestLookup.get(c);
    if (l) {
      const h = l.get(r);
      if (h)
        return h.push([e, t]), t.active = !1, r.fetch === Us.IMAGE_SIZE ? [0, 0] : cs(a);
    } else
      l = /* @__PURE__ */ new Map(), this.requestLookup.set(c, l);
    t.active = !1;
    let u = this.requestQueue.get(c);
    return u || (u = [], this.requestQueue.set(c, u)), u.push(r), l.set(r, [[e, t]]), r.fetch ? [0, 0] : cs(a);
  }
  /**
   * Responds to the system detecting properties for a resource need updating.
   */
  updateResource(e) {
    if (!Ya(e)) return;
    const t = this.resourceLookup.get(e.key);
    t && (du(e.fontSource, t.fontSource) || Xs(
      "Font resources currently do not update. To update their properties simply destroy and recreate for now."
    ));
  }
}
let Le;
class Ps {
  /**
   * This loops until our canvas context is available
   */
  static async awaitContext() {
    for (; !Le; )
      this.getContext(), await new Promise((e) => setTimeout(e, 10));
  }
  /**
   * Attempts to populate the 'canvas' context for rendering images offscreen.
   */
  static getContext() {
    Le || (Le = document.createElement("canvas").getContext("2d"));
  }
  /**
   * This ensures an image is renderable at the current moment. This draws the
   * image to a canvas partially to help the image 'warm up' within some browser
   * contexts to ensure the image can be used as a drawable item.
   */
  static async calculateImageSize(e) {
    if (await this.awaitContext(), !Le) {
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
    return Le.canvas.width = 100, Le.canvas.height = 100, Le.drawImage(e, 0, 0, 1, 1), [e.width, e.height];
  }
  /**
   * This resizes the input image by the provided scale.
   */
  static async resizeImage(e, t) {
    if (await this.awaitContext(), !Le)
      return console.warn(
        "The Image rasterizer was unable to establish a valid canvas context. Please ensure the system supports contexts and ensure the document is ready first."
      ), e;
    if (e.width === 0 || e.height === 0)
      return console.warn(
        "Images provided shoud have valid dimensions! Please ensure the image is loaded first."
      ), e;
    Le.canvas.width = Math.floor(e.width * t), Le.canvas.height = Math.floor(e.height * t), e instanceof ImageData ? Le.putImageData(
      e,
      0,
      0,
      0,
      0,
      Le.canvas.width,
      Le.canvas.height
    ) : Le.drawImage(e, 0, 0, Le.canvas.width, Le.canvas.height);
    const s = new Image();
    return s.src = Le.canvas.toDataURL("image/png"), await Ps.calculateImageSize(s), s;
  }
}
class Gp {
  constructor(e, t) {
    this.video = e, this.subTexture = t, this.isDestroyed = !1, this.renderedTime = -1, this.previousTime = -1, this.playedFrames = 0, this.caughtFrames = 0, this.timeFrame = 0, this.doUpdate = () => {
      Math.abs(this.video.currentTime - this.renderedTime) < 0.015 || (this.renderedTime = this.video.currentTime, this.subTexture.update());
    }, this.loop = (s) => {
      this.doUpdate(), this.isDestroyed || oi(this.loop);
    }, this.addEventListeners();
  }
  /**
   * Applies all of the necessary listeners to the video object
   */
  async addEventListeners() {
    this.isDestroyed || this.loop(await oi());
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
const Vp = ve("performance");
function Au(i) {
  return {
    key: "",
    type: oe.ATLAS,
    ...i
  };
}
function qa(i) {
  return i && i.type === oe.ATLAS;
}
class $p extends fs {
  constructor(e) {
    super(e), this.resourceReferences = /* @__PURE__ */ new Map(), this.type = oe.ATLAS;
    const t = document.createElement("canvas");
    if (this.width = t.width = e.width, this.height = t.height = e.height, this.textureSettings = e.textureSettings, e.width < 0 || e.height < 0)
      throw new Error(
        "TextureSize Error: An atlas does NOT support Screen Texture sizing."
      );
    this.packing = new He(0, 0, e.width, e.height), this.createTexture(t);
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
    }, this.texture = new W({
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
    this.resourceReferences.forEach((t, s) => {
      t.count <= 0 && t.subtexture && (Vp(
        "A subtexture on an atlas has been invalidated as it is deemed no longer used: %o",
        t.subtexture
      ), this.invalidateTexture(t.subtexture), e.push(s));
    });
    for (let t = 0, s = e.length; t < s; ++t)
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
      subtexture: e.texture || new Ui(),
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
const Ka = ve("performance"), Wp = new Ui({
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
function jp(i) {
  return !!(i && i.isValid && i.pixelWidth && i.pixelHeight);
}
class Hp {
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
    const t = new $p(e);
    return this.allAtlas.set(t.id, t), Ka("Atlas Created-> %o", t), t;
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
    return e = Object.assign(e, Wp, { atlasReferenceID: t }), e;
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
    const s = e.id;
    if (t.disposeResource)
      return !0;
    const n = e.resourceReferences.get(t.source);
    if (n)
      return t.texture = n.subtexture, !0;
    t.texture = new Ui(), t.texture.isValid = !0, e.resourceReferences.set(t.source, {
      subtexture: t.texture,
      count: 0
    });
    const r = await this.loadImage(t), o = t.texture;
    if (r && jp(o)) {
      const c = new J({
        bottom: o.pixelHeight,
        left: 0,
        right: o.pixelWidth,
        top: 0
      }), l = {
        data: o,
        bounds: c
      };
      l.bounds.width += 0, l.bounds.height += 0;
      let u = e.packing, h = u.insert(l);
      if (!h) {
        if (!this.repackResources(e))
          return console.error(
            "Repacking the atlas failed. Some resources may be in an undefined state. Consider making another atlas."
          ), !1;
        u = e.packing, h = u.insert(l);
      }
      return h ? (h.data = o, He.applyToSubTexture(u, h, o, {
        top: 0.5,
        left: 0.5,
        right: 0.5,
        bottom: 0.5
      }), o.texture = e.texture || null, o.source = r, o.atlasRegion = {
        ...h.bounds,
        y: e.height - h.bounds.y - h.bounds.height
      }, (a = e.texture) == null || a.update(r, o.atlasRegion), r instanceof HTMLVideoElement && (o.video = {
        monitor: new Gp(r, o)
      }), !0) : (console.error("Could not fit resource into atlas", t), t.texture = this.setDefaultImage(o, s), !1);
    } else
      return o && !o.isValid ? Ka("Resource was invalidated during load:", t) : console.error("Could not load resource:", t), t.texture && (t.texture = this.setDefaultImage(t.texture, s)), !1;
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
    const t = e.texture || new Ui(), s = e.source;
    if (e.texture = t, e.texture.isValid === !1) return null;
    if (s instanceof HTMLImageElement) {
      let n = await new Promise((r) => {
        if (!(s instanceof HTMLImageElement)) return;
        const o = s;
        if (o.width && o.height) {
          Ps.calculateImageSize(o), t.pixelWidth = o.width, t.pixelHeight = o.height, t.aspectRatio = o.width / o.height, r(o);
          return;
        }
        o ? (o.onload = function() {
          t.pixelWidth = o.width, t.pixelHeight = o.height, t.aspectRatio = o.width / o.height, o.onload = null, r(o);
        }, o.onerror = function() {
          console.error("Error generating Image element for source:", s), o.onload = null, r(null);
        }) : r(null);
      });
      return n && e.rasterizationScale !== void 0 && e.rasterizationScale !== 1 && (n = await Ps.resizeImage(
        n,
        e.rasterizationScale || 1
      )), n;
    } else {
      if (s instanceof HTMLVideoElement)
        return s.videoHeight === 0 || s.videoWidth === 0 ? (console.warn(
          "Video requests to the atlas manager MUST have the video completely loaded and ready for loading",
          "There are too many caveats to automate video loading at this low of a level to have it prepped properly for",
          "use in the texture for all browsers. Consider handling video resources at the layer level to have them",
          "prepped for use."
        ), null) : (t.pixelWidth = s.videoWidth, t.pixelHeight = s.videoHeight, t.aspectRatio = s.videoWidth / s.videoHeight, s);
      if (kt(s)) {
        const n = s;
        let r = await new Promise((o) => {
          const a = new Image();
          a.onload = function() {
            t.pixelWidth = a.width, t.pixelHeight = a.height, t.aspectRatio = a.width / a.height, a.onload = null, o(a);
          }, a.onerror = function() {
            console.error("Error generating Image element for source:", s), o(null);
          }, a.crossOrigin = "anonymous", a.src = n;
        });
        return r && e.rasterizationScale !== void 0 && e.rasterizationScale !== 1 && (r = await Ps.resizeImage(
          r,
          e.rasterizationScale || 1
        )), r;
      } else {
        let n = s;
        return n && e.rasterizationScale !== void 0 && e.rasterizationScale !== 1 && (n = await Ps.resizeImage(
          n,
          e.rasterizationScale || 1
        )), n;
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
    const t = [e.packing], s = [];
    let n = 0;
    const r = /* @__PURE__ */ new Map();
    for (; n < t.length; ) {
      const w = t[n];
      n++, w.data && w.data.texture && (s.push(w), r.set(w.bounds, new J(w.bounds))), w.child[0] && t.push(w.child[0]), w.child[1] && t.push(w.child[1]);
    }
    if (s.sort(
      (w, E) => Math.max(E.bounds.width, E.bounds.height) - Math.max(w.bounds.width, w.bounds.height)
    ), s.length <= 0)
      return e.packing = new He(0, 0, e.width, e.height), !0;
    if (!e.texture)
      return console.warn(
        "Attempted to repack resources for an atlas with no texture."
      ), !1;
    const o = new W(e.texture);
    o.data = {
      buffer: new Uint8Array(e.width * e.height * 4),
      width: e.width,
      height: e.height
    };
    const a = new He(0, 0, e.width, e.height);
    let c = !1;
    for (let w = 0, E = s.length; w < E; ++w) {
      const y = s[w];
      if (!y.data) {
        console.warn("Attempted to repack a node with no valid data.");
        continue;
      }
      y.bounds.x = 0, y.bounds.y = 0;
      const C = a.insert({
        bounds: y.bounds,
        data: y.data
      });
      if (!C) {
        console.warn(
          "When repacking the atlas, an existing node was unable to be repacked",
          y
        ), c = !0;
        continue;
      }
      He.applyToSubTexture(a, C, y.data);
    }
    if (c)
      return !1;
    const l = new Float32Array(s.length * 2 * 6), u = new Float32Array(s.length * 2 * 6), h = new Ui();
    for (let w = 0, E = s.length; w < E; ++w) {
      const y = s[w], C = r.get(y.bounds), M = y.data;
      if (!C || !M) {
        console.warn(
          "While repacking there was an issue finding the previous bounds and the next texture to use",
          C,
          M
        );
        continue;
      }
      He.applyToSubTexture(a, C, h);
      const R = w * 2 * 6;
      l[R] = M.atlasTL[0] * 2 - 1, l[R + 1] = M.atlasTL[1] * 2 - 1, l[R + 2] = M.atlasTR[0] * 2 - 1, l[R + 3] = M.atlasTR[1] * 2 - 1, l[R + 4] = M.atlasBL[0] * 2 - 1, l[R + 5] = M.atlasBL[1] * 2 - 1, l[R + 6] = M.atlasTR[0] * 2 - 1, l[R + 7] = M.atlasTR[1] * 2 - 1, l[R + 8] = M.atlasBR[0] * 2 - 1, l[R + 9] = M.atlasBR[1] * 2 - 1, l[R + 10] = M.atlasBL[0] * 2 - 1, l[R + 11] = M.atlasBL[1] * 2 - 1, u[R] = h.atlasTL[0], u[R + 1] = h.atlasTL[1], u[R + 2] = h.atlasTR[0], u[R + 3] = h.atlasTR[1], u[R + 4] = h.atlasBL[0], u[R + 5] = h.atlasBL[1], u[R + 6] = h.atlasTR[0], u[R + 7] = h.atlasTR[1], u[R + 8] = h.atlasBR[0], u[R + 9] = h.atlasBR[1], u[R + 10] = h.atlasBL[0], u[R + 11] = h.atlasBL[1], M.texture = o;
    }
    const d = new zi(), f = new ni(l, 2), p = new ni(u, 2);
    d.addAttribute("position", f), d.addAttribute("texCoord", p);
    const g = new is({
      buffers: {
        color: { buffer: o, outputType: 0 }
      },
      retainTextureTargets: !0
    }), m = new pr({
      culling: x.Material.CullSide.NONE,
      uniforms: {
        texture: { type: Ee.TEXTURE, data: e.texture }
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
    }), b = new kl("__atlas_manager__", d, m);
    b.vertexCount = s.length * 6, b.drawMode = x.Model.DrawMode.TRIANGLES;
    const v = new jr();
    return v.add(b), this.renderer.setRenderTarget(g), this.renderer.setViewport(this.renderer.getFullViewport()), this.renderer.setScissor(this.renderer.getFullViewport()), this.renderer.render(v, g), m.dispose(), d.destroy(), g.dispose(), e.texture.destroy(), e.texture = o, e.packing = a, !0;
  }
  /**
   * This targets an existing atlas and attempts to update it with the provided
   * atlas resources.
   */
  async updateAtlas(e, t) {
    const s = this.allAtlas.get(e);
    if (s) {
      for (const n of t)
        n.disposeResource || await this.draw(s, n);
      for (let n = 0, r = t.length; n < r; ++n) {
        const o = t[n];
        o.disposeResource ? s.stopUsingResource(o) : s.useResource(o);
      }
      s.resolveResources();
    } else
      console.warn(
        "Can not update non-existing atlas:",
        e,
        "These resources will not be loaded:",
        t
      );
    return s;
  }
}
class Xp extends un {
  constructor(e) {
    super(), this.resources = /* @__PURE__ */ new Map(), this.requestQueue = /* @__PURE__ */ new Map(), this.requestLookup = /* @__PURE__ */ new Map(), this.atlasManager = e && e.atlasManager || new Hp();
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
    this.requestQueue.forEach((s, n) => {
      t.push([n, s]);
    }), this.requestQueue.clear();
    for (const [s, n] of t)
      if (n.length > 0) {
        e = !0;
        const r = n.slice(0);
        n.length = 0, await this.atlasManager.updateAtlas(s, r);
        const o = this.requestLookup.get(s);
        if (o) {
          const a = /* @__PURE__ */ new Set();
          r.forEach((c) => {
            const l = o.get(c);
            if (o.delete(c), l && !c.disposeResource)
              for (let u = 0, h = l.length; u < h; ++u) {
                const [d, f] = l[u];
                d.managesInstance(f) && (f.active = !0), a.add(f);
              }
          }), ou(() => {
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
    return [new qo(oe.ATLAS, this)];
  }
  /**
   * Initialize the atlas resources requested for construction
   */
  async initResource(e) {
    if (qa(e)) {
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
  request(e, t, s, n) {
    const r = s.key || "", o = s.texture;
    if (o)
      return cs(o);
    let a = this.requestLookup.get(r);
    if (a) {
      const l = a.get(s);
      if (l)
        return l.push([e, t]), t.active = !1, cs(s.texture);
    } else
      a = /* @__PURE__ */ new Map(), this.requestLookup.set(r, a);
    s.disposeResource || (t.active = !1);
    let c = this.requestQueue.get(r);
    return c || (c = [], this.requestQueue.set(r, c)), c.push(s), a.set(s, [[e, t]]), cs(o);
  }
  /**
   * System is requesting properties for a resource to be updated.
   */
  updateResource(e) {
    qa(e);
  }
}
const Qp = new Image();
function Js(i) {
  return {
    type: oe.ATLAS,
    source: Qp,
    ...i
  };
}
class Yp extends un {
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
    return [new qo(oe.TEXTURE, this)];
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
    t = new Or(e, this.webGLRenderer), this.resources.set(e.key, t);
  }
  /**
   * Handle requests that stream in from instances requesting metrics for a
   * specific resource.
   */
  request(e, t, s, n) {
    const r = this.resources.get(s.key);
    return r ? (s.texture = r.texture, [0, 0, 1, 1]) : [0, 0, 0, 0];
  }
  /**
   * Trigger that executes when the rendering context resizes. For this manager,
   * we will update all textures with dimensions that are tied to the screen.
   */
  resize() {
    const e = /* @__PURE__ */ new Map();
    this.resources.forEach((t, s) => {
      t.width > gt.SCREEN && t.height > gt.SCREEN || (t.texture.destroy(), t = new Or(t, this.webGLRenderer), e.set(s, t));
    }), e.forEach((t, s) => this.resources.set(s, t));
  }
  /**
   * This targets the specified resource and attempts to update it's settings.
   */
  updateResource(e) {
    let t = this.resources.get(e.key);
    if (!t) {
      console.error(
        `A resource was requested to be updated with key: ${e.key}, but no resource was found`
      );
      return;
    }
    e.height !== t.height || e.width !== t.width ? (t.texture.destroy(), t = new Or(e, this.webGLRenderer), this.resources.set(e.key, t)) : e.textureSettings && t.texture.applySettings(e.textureSettings);
  }
}
const qp = ve("performance");
class _u {
  constructor() {
    this.managers = /* @__PURE__ */ new Map(), this.resourceKeyToType = /* @__PURE__ */ new Map();
  }
  /**
   * This is called by the system to cause the managers to dequeue their requests in an asynchronous fashion
   */
  async dequeueRequests() {
    let e = !1;
    const t = Array.from(this.managers.values());
    for (let s = 0, n = t.length; s < n; ++s) {
      const o = await t[s].dequeueRequests();
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
    ), Kh);
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
  request(e, t, s, n) {
    const r = this.managers.get(s.type);
    return r ? r.request(e, t, s, n) : (console.warn(
      `A Layer is requesting a resource for which there is no manager set. Please make sure a Resource Manager is set for resource of type: ${s.type}`
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
    this.managers.get(e) && qp(
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
const Kp = new _u(), dx = {
  createFont: Ru,
  createAtlas: Au,
  createTexture: Gl,
  createColorBuffer: Yh
}, fx = {
  textureRequest: nn,
  atlasRequest: Js,
  fontRequest: $s,
  colorBufferRequest: Xr
}, Zp = `// This contains the method required to be used on a fragment shader when a layer desires to use
// PickType.SINGLE (color picking).
varying highp vec4 _picking_color_pass_;

void main() {
  \${out: _picking_fragment_} = _picking_color_pass_;
  // _picking_fragment_ = vec4(1.0, 0.0, 0.0, 1.0);
}
`, Za = {
  attributes: "attributes",
  easingMethod: "easingMethod",
  extend: "extend",
  extendHeader: "extendHeader",
  T: "T"
};
class Ja {
  constructor(e) {
    this.index = 0, this.available = 4, this.index = e;
  }
  setAttribute(e) {
    return (e.size || 0) <= this.available ? (e.block = this.index, e.blockIndex = 4 - this.available, this.available -= e.size || 0, !0) : !1;
  }
}
function Jp(i) {
  i.forEach((e) => {
    if (e.resource && e.size === void 0 && (e.size = S.FOUR), !e.size)
      try {
        const t = e.update(new dt({}));
        t.length > 0 && t.length <= S.FOUR && (e.size = t.length);
      } catch {
        console.warn(
          "The system could not determine the size of the provided attribute. Please provide the size of the attribute:",
          e
        );
      }
  });
}
function eg(i) {
  Jp(i);
  const e = [];
  i.forEach((t) => {
    if (t.size && t.size === S.MAT4X4) {
      t.block = e.length, t.blockIndex = Bc.INVALID;
      for (let n = 0; n < 4; ++n) {
        const r = new Ja(e.length);
        r.available = 0, r.index = 0, e.push(r);
      }
      return;
    }
    if (!e.find((n) => n.setAttribute(t) ? !!n : !1)) {
      const n = new Ja(e.length);
      e.push(n), n.setAttribute(t) || console.warn(
        "There was a problem packing an attribute into a block. No block would accommodate it:",
        t
      );
    }
  });
}
function ec(i) {
  return !!i;
}
function tc(i) {
  return !!i;
}
function ic(i) {
  return !!i;
}
function tg(i) {
  return Object.assign({}, i, { materialAttribute: null });
}
function ig(i) {
  return Object.assign({}, i, { materialIndexBuffer: null });
}
function sg(i) {
  return Object.assign({}, i, { materialUniforms: [] });
}
function ng(i, e, t, s) {
  e.forEach((n) => {
    n.name === void 0 && console.warn(
      "All instance attributes MUST have a name on Layer:",
      i.id
    ), e.find(
      (r) => r !== n && r.name === n.name
    ) && console.warn(
      "An instance attribute can not have the same name used more than once:",
      n.name
    ), t.find((r) => r.name === n.name) && console.warn(
      "An instance attribute and a vertex attribute in a layer can not share the same name:",
      n.name
    ), n.resource || n.size === void 0 && (console.warn("An instance attribute requires the size to be defined."), console.warn(n));
  });
}
function rg(i, e, t) {
  if (!t) return;
  let s = e.instanceAttributes || [], n = e.uniforms || [], r = e.vertexAttributes || [];
  t.shaderModuleUnits.forEach((l) => {
    l.instanceAttributes && (s = s.concat(
      l.instanceAttributes(i)
    )), l.uniforms && (n = n.concat(l.uniforms(i))), l.vertexAttributes && (r = r.concat(
      l.vertexAttributes(i)
    ));
  });
  const o = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set();
  n.filter((l) => l ? o.has(l.name) ? (console.warn(
    "Included shader modules has introduced duplicate uniform names:",
    l.name,
    "One will be overridden thus causing a potential crash of the shader."
  ), !1) : (o.add(l.name), !0) : !1), s.filter((l) => l ? a.has(l.name) ? (console.warn(
    "Included shader modules has introduced duplicate Instance Attribute names:",
    l.name,
    "One will be overridden thus causing a potential crash of the shader."
  ), !1) : (a.add(l.name), !0) : !1), r.filter((l) => l ? c.has(l.name) ? (console.warn(
    "Included shader modules has introduced duplicate Vertex Attribute names:",
    l.name,
    "One will be overridden thus causing a potential crash of the shader."
  ), !1) : (c.add(l.name), !0) : !1), e.instanceAttributes = s, e.uniforms = n, e.vertexAttributes = r;
}
function og(i, e, t, s, n, r) {
  rg(e, t, r);
  const o = (t.instanceAttributes || []).filter(
    ec
  ), a = (t.vertexAttributes || []).filter(
    tc
  ), c = (t.uniforms || []).filter(ic);
  let l = ne(t.indexBuffer) ? t.indexBuffer : void 0;
  for (let p = 0, g = s.length; p < g; ++p) {
    const m = s[p];
    if (m.validate(
      e,
      o,
      a,
      c
    )) {
      const b = m.expand(
        e,
        o,
        a,
        c
      );
      b.instanceAttributes.filter(ec).forEach((v) => o.push(v)), b.vertexAttributes.filter(tc).forEach((v) => a.push(v)), b.uniforms.filter(ic).forEach((v) => c.push(v)), ne(b.indexBuffer) && (l = b.indexBuffer);
    }
  }
  ng(
    e,
    o,
    a
  );
  const u = o.slice(0), h = (a || []).map(
    tg
  ), d = c.map(sg), f = ne(l) ? ig(l) : void 0;
  return u.sort(n.sortInstanceAttributes), d.sort(n.sortUniforms), h.sort(n.sortVertexAttributes), eg(u), e.getLayerBufferType(
    i,
    t,
    a,
    u
  ), {
    instanceAttributes: u,
    uniforms: d,
    vertexAttributes: h,
    indexBuffer: f
  };
}
class Ko {
  /**
   * This calculates how many uniform blocks are utilized based on the input uniforms
   */
  static calculateUniformBlockUseage(e) {
    let t = 0;
    for (let s = 0, n = e.length; s < n; ++s)
      t += Math.ceil(e[s].size / 4);
    return t;
  }
  /**
   * Calculates all of the metrics that will be needed in this processor.
   */
  process(e, t) {
    this.instanceMaxBlock = 0, e.forEach((s) => {
      this.instanceMaxBlock = Math.max(
        this.instanceMaxBlock,
        s.block || 0
      );
    }), this.blocksPerInstance = this.instanceMaxBlock + 1, this.maxUniforms = O.MAX_VERTEX_UNIFORMS, this.maxUniformsForInstancing = this.maxUniforms - Ko.calculateUniformBlockUseage(t), this.maxInstancesPerUniformBuffer = Math.floor(
      this.maxUniformsForInstancing / this.blocksPerInstance
    ), this.totalInstanceUniformBlocks = this.maxInstancesPerUniformBuffer * this.blocksPerInstance;
  }
}
const Qs = "Once a ShaderModuleUnit has been registered, you CAN NOT modify it! Module ID:";
class Br {
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
      console.warn(Qs, this._moduleId);
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
      console.warn(Qs, this._moduleId);
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
      console.warn(Qs, this._moduleId);
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
      console.warn(Qs, this._moduleId);
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
      console.warn(Qs, this._moduleId);
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
const sc = ve("performance"), ag = ve("shader-module-vs"), cg = ve("shader-module-fs"), nc = "import", rc = ":";
function oc(i, e) {
  return !!i && (i.compatibility === e || i.compatibility === _.ALL);
}
const It = class It {
  /**
   * This registers a new ShaderModuleUnit. It makes the module available by
   * it's importId within shaders using this framework.
   *
   * If the module is registered with no returned output, the registration was a
   * success. Any returned output indicates issues encountered while registering
   * the module.
   */
  static register(e) {
    if (!(e instanceof Br)) {
      if (Array.isArray(e)) {
        let a = "";
        return e.forEach((c) => {
          const l = It.register(c);
          l && (a += `${l}
`);
        }), a || null;
      }
      return It.register(new Br(e));
    }
    let t = It.modules.get(e.moduleId);
    t || (t = {}, It.modules.set(e.moduleId, t));
    const s = t.fs, n = t.vs, r = oc(
      e,
      _.FRAGMENT
    ), o = oc(e, _.VERTEX);
    if (s && r) {
      if (s.isFinal)
        return `Module ID: ${e.moduleId} Can not override the module's existing Fragment registration as the exisitng module is marked as final`;
      sc(
        "A Shader Module Unit has overridden an existing module for the Fragment Shader Module ID: %o",
        e.moduleId
      );
    }
    if (n && o) {
      if (n.isFinal)
        return `Module ID: ${e.moduleId} Can not override the module's existing Vertex registration as the exisitng module is marked as final`;
      sc(
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
    const t = [], s = [], n = /* @__PURE__ */ new Set(), r = e.compatibility, o = e.moduleId, a = as({
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
        if (l.indexOf(nc) === 0) {
          const u = l.substr(nc.length).trim();
          if (u[0] === rc) {
            let h = !1;
            const d = u.substr(rc.length).trim().split(",");
            return d[d.length - 1].trim().length === 0 && d.pop(), d.forEach((f) => {
              f = f.trim();
              const p = It.modules.get(f);
              p ? ((r === _.FRAGMENT || r === _.ALL) && (p.fs ? (h = !0, n.has(f) || s.push(f)) : t.push(
                `Could not find requested target fragment module for Module ID: ${f} requested by module: ${o}`
              )), (r === _.VERTEX || r === _.ALL) && (p.vs ? (h = !0, n.has(f) || s.push(f)) : t.push(
                `Could not find requested target vertex module for Module ID: ${f} requested by module: ${o}`
              )), !p.vs && !p.fs && t.push(
                "Could not find a vertex or fragment shader within exisitng module"
              ), h || t.push(
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
    return e.applyAnalyzedContent(a.shader), e.dependents = s, t;
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
  static process(e, t, s, n) {
    const r = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set(), a = [], c = [], l = s === _.VERTEX ? ag : cg;
    l("Processing Shader for context %o:", e);
    function u(g) {
      const m = g.moduleId;
      l("%o: %o", m, a.slice(0).reverse().join(" -> "));
      const b = a.indexOf(m);
      if (a.unshift(m), b > -1) {
        const v = a.slice(0, b + 2).reverse();
        return c.push(
          `A Shader has detected a Circular dependency in import requests: ${v.join(
            " -> "
          )}`
        ), a.shift(), !1;
      }
      return !0;
    }
    function h(g) {
      const m = g.moduleId;
      if (!u(g))
        return null;
      if (m && o.has(m))
        return a.shift(), "";
      let b = "";
      It.analyzeDependents(g).forEach((E) => c.push(E));
      const w = g.dependents;
      if (l("Module dependencies detected %o", w), w && w.length > 0)
        for (let E = 0, y = w.length; E < y; ++E) {
          const C = w[E], M = It.modules.get(C);
          if (M) {
            let R;
            (s === _.FRAGMENT || s === _.ALL) && (M.fs ? (r.add(M.fs), R = h(M.fs)) : c.push(
              `Could not find requested target fragment module for Module ID: ${C} requested by module: ${m}`
            )), (s === _.VERTEX || s === _.ALL) && (M.vs ? (r.add(M.vs), R = h(M.vs)) : c.push(
              `Could not find requested target vertex module for Module ID: ${C} requested by module: ${m}`
            )), !M.vs && !M.fs && c.push(
              "Could not find a vertex or fragment shader within exisitng module"
            ), R === null && c.push(
              `Error Processing module Module ID: ${C} requested by module: ${m}`
            ), b += R || "";
          } else
            c.push(
              `Could not find requested module: ${C} requested by module: ${m}`
            );
        }
      return a.shift(), o.add(m || ""), `${b.trim()}

${g.content.trim()}`;
    }
    let d = t;
    if (n) {
      let g = "";
      n.forEach((m) => {
        g += `\${import: ${m}}
`;
      }), d = g + t;
    }
    const f = new Br({
      content: d,
      compatibility: s,
      moduleId: `Layer "${e}" ${s === _.ALL ? "fs vs" : s === _.VERTEX ? "vs" : "fs"}`
    });
    return {
      errors: c,
      shader: h(f),
      shaderModuleUnits: r
    };
  }
};
It.modules = /* @__PURE__ */ new Map();
let be = It;
const In = "out", Mn = ":";
class ac {
  constructor() {
    this.metricsProcessing = new Ko();
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
  static mergeFragmentOutputsForMRT(e, t, s, n, r, o) {
    let a = "", c = "", l = "";
    const u = /* @__PURE__ */ new Set(), h = [], d = /* @__PURE__ */ new Set();
    return O.MRT || (l = " = gl_FragColor"), s.forEach((f, p) => {
      let g = !0, m = !1;
      if (r && r.indexOf(f.outputType) < 0 && (g = !1), o && p < s.length - 1 && (g = !1), !o && n.indexOf(f.outputType) < 0 && (g = !1), d.has(f.outputType))
        throw new Error(
          "Can not use the same Output Fragment type multiple times"
        );
      d.add(f.outputType);
      const b = n.indexOf(f.outputType);
      as({
        shader: rr(f.source),
        /**
         * Analyze each token for "out" tokens indicating output
         */
        onToken(v) {
          const w = v.trim();
          if (w.indexOf(In) === 0) {
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
            const E = w.substr(In.length).trim();
            if (E[0] === Mn) {
              const y = E.substr(Mn.length).trim();
              if (!y)
                throw new Error(
                  "Output in a shader requires an identifier ${out: <name required>}"
                );
              if (u.has(y))
                throw new Error(
                  "You can not declare the same output name in subsequent fragment shader outputs"
                );
              if (y === "gl_FragColor")
                throw new Error(
                  "DO not use gl_FragColor as an identifier for an out. Choose something not used by the WebGL spec."
                );
              let C = "";
              if (g)
                if (u.add(y), h.push(f.outputType), O.MRT_EXTENSION)
                  l = ` = gl_FragData[${b}]`, C = "vec4 ";
                else if (O.MRT && O.SHADERS_3_0)
                  t.set(
                    y,
                    `layout(location = ${b}) out vec4 ${y};
`
                  );
                else
                  throw new Error(
                    `Could not generate a proper output declaration for the fragment shader output: ${y}`
                  );
              else
                C = "vec4 ";
              return `${C}${y}${l}`;
            } else
              throw new Error(
                "Output in a shader requires an identifier ${out: <name required>}"
              );
          }
          return `\${${v}}`;
        },
        /**
         * We use this to aggregate all of our main bodies and headers together
         */
        onMain(v, w) {
          return !m && v && (v.match("gl_FragColor") ? (h.push(f.outputType), O.MRT && (O.SHADERS_3_0 ? (t.set(
            "_FragColor",
            `layout(location = ${b}) out vec4 _FragColor;
`
          ), v = v.replace(/gl_FragColor/g, "_FragColor")) : (v = v.replace(
            /gl_FragColor\s+=/,
            `vec4 _FragColor = gl_FragData[${b}] =`
          ), v = v.replace(
            /gl_FragColor\s+=/g,
            `_FragColor = gl_FragData[${b}] =`
          ), v = v.replace(/gl_FragColor/g, "_FragColor"))), u.add("_FragColor")) : h.push(G.NONE)), a += `
${(w || "").trim()}`, c += `
  ${(v || "").trim()}`, (v || "").trim();
        }
      });
    }), {
      output: `${a}
void main() {
${c}
}`,
      outputNames: Array.from(u.values()),
      outputTypes: h
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
    if (t.length > 1 || t[0] !== G.COLOR)
      throw new Error(
        "Merging fragment shaders for only COLOR output is only valid when the view has a single COLOR output target."
      );
    kt(e) && (e = [
      {
        outputType: G.COLOR,
        source: e
      }
    ]);
    let s = "", n = "";
    const r = /* @__PURE__ */ new Set(), o = [];
    return e.some((a) => {
      const c = a.outputType === G.COLOR;
      let l = !1;
      return c && o.push(G.COLOR), as({
        shader: rr(a.source),
        /**
         * Analyze each token for "out" tokens indicating output
         */
        onToken(u) {
          const h = u.trim();
          if (h.indexOf(In) === 0) {
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
            const d = h.substr(In.length).trim();
            if (d[0] === Mn) {
              const f = d.substr(Mn.length).trim();
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
          return `\${${u}}`;
        },
        onMain(u, h) {
          return n += `
${(h || "").trim()}`, s += `
  ${(u || "").trim()}`, (u || "").trim();
        }
      }), !!c;
    }), {
      output: `${n}
void main() {
${s}
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
  static makeOutputFragmentShader(e, t, s, n) {
    if (!s || kt(s))
      if (kt(n)) {
        const r = this.mergeOutputFragmentShaderForColor(
          [
            {
              source: n,
              outputType: G.COLOR
            }
          ],
          [G.COLOR]
        );
        return {
          source: r.output,
          outputTypes: [G.COLOR],
          outputNames: r.outputNames
        };
      } else if (Array.isArray(n)) {
        const r = n.find(
          (c) => c.outputType === G.COLOR
        );
        let o = -1;
        r ? o = n.indexOf(r) : o = n.length - 1;
        const a = this.mergeOutputFragmentShaderForColor(
          n.slice(0, o + 1),
          [G.COLOR]
        );
        return {
          source: a.output,
          outputNames: a.outputNames,
          outputTypes: [G.COLOR]
        };
      } else
        return null;
    else if (Array.isArray(s)) {
      if (!O.MRT)
        throw new Error(
          "Multiple Render Targets were specified, but are not natively supported by user's hardware! MRT also does not have a fallback in deltav yet!"
        );
      const r = s.map((o) => o.outputType);
      if (Array.isArray(n)) {
        const o = /* @__PURE__ */ new Map();
        for (let a = 0, c = s.length; a < c; ++a) {
          const l = s[a];
          for (let u = 0, h = n.length; u < h; ++u)
            if (n[u].outputType === l.outputType) {
              o.set(l.outputType, u);
              break;
            }
        }
        if (O.MRT) {
          let a = -1;
          const c = [];
          if (o.forEach((u, h) => {
            c.push(h), a = Math.max(u, a);
          }), a === -1) return null;
          const l = this.mergeFragmentOutputsForMRT(
            e,
            t,
            n.slice(0, a + 1),
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
      } else if (s.find(
        (a) => a.outputType === G.COLOR
      ) && n) {
        const a = this.mergeFragmentOutputsForMRT(
          e,
          t,
          [
            {
              source: n,
              outputType: G.COLOR
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
  process(e, t, s, n, r, o, a) {
    try {
      if (!e.surface.gl)
        return console.warn("No WebGL context available for layer!"), null;
      const c = this.processImports(
        e,
        t,
        s
      );
      if (!c) return null;
      const { vertexAttributes: l, instanceAttributes: u, indexBuffer: h, uniforms: d } = og(
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
        u
      ), this.metricsProcessing.process(u, d);
      let f = "", p = "", g = "";
      const m = {
        uniforms: []
      }, b = n.vs || /* @__PURE__ */ new Map(), v = n.fs || /* @__PURE__ */ new Map(), w = n.destructure || /* @__PURE__ */ new Map();
      for (let D = 0, H = r.length; D < H; ++D) {
        const $ = r[D], ee = $.processHeaderInjection(
          _.VERTEX,
          b,
          e,
          this.metricsProcessing,
          l,
          u,
          d
        );
        f += ee.injection, ee.material && (m.uniforms = m.uniforms.concat(
          ee.material.uniforms || []
        )), g += $.processAttributeDestructuring(
          e,
          w,
          this.metricsProcessing,
          l,
          u,
          d
        );
      }
      let E = "";
      b.forEach((D) => {
        E += D;
      }), f = E + f, E = "", w.forEach((D) => {
        E += D;
      }), g = E + g;
      const y = this.processExtensions(), C = `precision highp float;

`, M = y + C + f + c.vs;
      let R = {
        [Za.attributes]: g
      }, V = !1;
      const z = as({
        options: R,
        required: void 0,
        shader: M,
        onToken(D, H) {
          return D === Za.attributes && (V = !0), H;
        },
        onMain(D) {
          return V ? D || "" : D === null ? (console.warn("The body of void main() could not be determined."), "") : `${g}
${D}`;
        }
      });
      return c.fs.forEach((D, H) => {
        R = {}, p = "", E = "";
        const $ = v.get(H) || /* @__PURE__ */ new Map();
        for (let Z = 0, Y = r.length; Z < Y; ++Z) {
          const T = r[Z].processHeaderInjection(
            _.FRAGMENT,
            $,
            e,
            this.metricsProcessing,
            l,
            u,
            d
          );
          if (p += T.injection, T.material) {
            const k = /* @__PURE__ */ new Set();
            m.uniforms.forEach(
              (j) => k.add(j.name)
            ), m.uniforms.forEach((j) => {
              k.has(j.name) || m.uniforms.push(j);
            });
          }
        }
        $.forEach((Z) => {
          E += Z;
        }), p = E + p;
        const ee = y + C + p + D.source, K = as({
          options: R,
          required: void 0,
          shader: ee
        });
        D.source = K.shader.trim();
        for (let Z = 0, Y = o.length; Z < Y; ++Z) {
          const Ce = o[Z];
          z.shader = Ce.vertex(z.shader), D.source = Ce.fragment(D.source);
        }
      }), {
        fs: c.fs,
        materialUniforms: m.uniforms,
        maxInstancesPerBuffer: this.metricsProcessing.maxInstancesPerUniformBuffer,
        modules: Array.from(c.shaderModuleUnits),
        vs: z.shader.trim(),
        vertexAttributes: l,
        instanceAttributes: u,
        uniforms: d,
        indexBuffer: h
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
  processImports(e, t, s) {
    const n = /* @__PURE__ */ new Set();
    let r = e.baseShaderModules(t);
    e.props.baseShaderModules && (r = e.props.baseShaderModules(t, r));
    const o = be.process(
      e.id,
      t.vs,
      _.VERTEX,
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
    return s.forEach((c, l) => {
      const u = be.process(
        e.id,
        c.source,
        _.FRAGMENT,
        r.fs
      );
      if (u.errors.length > 0) {
        console.warn(
          "Error processing imports for the fragment shader of layer:",
          e.id,
          "Errors",
          ...u.errors.reverse()
        );
        return;
      }
      u.shaderModuleUnits.forEach(
        (d) => n.add(d)
      );
      const h = {
        source: u.shader || "",
        outputTypes: c.outputTypes,
        outputNames: c.outputNames
      };
      a.set(l, h);
    }), o.shaderModuleUnits.forEach(
      (c) => n.add(c)
    ), {
      fs: a,
      vs: o.shader || "",
      shaderModuleUnits: n
    };
  }
}
const Oi = "EasingIOExpansion", { abs: lg, max: ug } = Math, hg = {
  duration: 0,
  start: [0],
  startTime: 0
}, cc = {
  1: "float",
  2: "vec2",
  3: "vec3",
  4: "vec4",
  9: "mat3",
  16: "mat4",
  /** This is the special case for instance attributes that want an atlas resource */
  99: "vec4"
}, Pr = {
  easingMethod: "easingMethod",
  T: "T"
};
function dg(i) {
  return !!i && i.easing && i.size !== void 0 && i.size <= 4;
}
function px(i) {
  return i;
}
class fg extends Ar {
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
  expand(e, t, s, n) {
    const r = /* @__PURE__ */ new Set(), o = [], a = [];
    for (const l of t)
      dg(l) && o.push(l);
    const c = {};
    e.easingId = c;
    for (let l = 0, u = o.length; l < u; ++l) {
      const h = o[l], { cpu: d, loop: f, uid: p } = h.easing, { name: g, size: m, update: b } = h, v = p;
      this.baseAttributeName.set(h, h.name), h.name = `_${h.name}_end`, c[h.name] = v, r.has(v) && console.error(
        "Undefined behavior occurs if you reuse an IAutoEasingMethod. Please ensure you are using uid() from the util to give the IAutoEasingMethod its uid, or just use the default provided methods"
      ), r.add(v);
      const w = {
        values: hg
      };
      let E, y, C, M, R, V, z, N, D, H, $, ee, K;
      h.update = (T) => {
        if (D = e.surface.frameMetrics, y = h.easing.delay, C = h.easing.duration, z = b(T), N = D.currentTime, T.easing = ee = T.easing || /* @__PURE__ */ new Map(), H = ee.get(v), !$ || !H ? ($ = F(z), H = new Ul({
          duration: C,
          end: $.copy(z),
          start: $.copy(z),
          startTime: N
        }), ee.set(v, H)) : T.reactivate && ($.copy(z, H.end), $.copy(z, H.end), H.startTime = N), R = H, M = C, E = y, R.isTimeSet && (M = R.duration || C, E = R.delay || 0), !R.isManualStart) {
          switch (V = 1, f) {
            // Continuous means we start at 0 and let the time go to infinity
            case Qt.CONTINUOUS:
              V = (N - R.startTime) / M, K = !0;
              break;
            // Repeat means going from 0 to 1 then 0 to 1 etc etc
            case Qt.REPEAT:
              V = (N - R.startTime) / M % 1, K = !0;
              break;
            // Reflect means going from 0 to 1 then 1 to 0 then 0 to 1 etc etc
            case Qt.REFLECT: {
              const k = (N - R.startTime) / M;
              V = lg(k / 2 % 1 - 0.5) * 2, K = !0;
              break;
            }
            // No loop means just linear time
            case Qt.NONE:
            default:
              V = (N - R.startTime) / M, K = !1;
              break;
          }
          R.start = d(
            R.start,
            R.end,
            V,
            R.start
          );
        }
        return R.startTime = N + E, $.copy(z, R.end), w.values = R, e.animationEndTime = ug(
          e.animationEndTime,
          R.startTime + M + D.frameDuration
        ), e.alwaysDraw = K, z;
      }, h.childAttributes = h.childAttributes || [];
      const Z = {
        name: `_${g}_start`,
        parentAttribute: h,
        size: m,
        update: (T) => w.values.start
      };
      h.childAttributes.push(Z), a.push(Z);
      const Y = {
        name: `_${g}_start_time`,
        parentAttribute: h,
        size: S.ONE,
        update: (T) => [w.values.startTime]
      };
      h.childAttributes.push(Y), a.push(Y);
      const Ce = {
        name: `_${g}_duration`,
        parentAttribute: h,
        size: S.ONE,
        update: (T) => [w.values.duration]
      };
      h.childAttributes.push(Ce), a.push(Ce);
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
  validate(e, t, s, n) {
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
  processAttributeDestructuring(e, t, s, n, r, o) {
    const a = "";
    for (let c = 0, l = r.length; c < l; ++c) {
      const u = r[c];
      if (!u.easing || !u.size) continue;
      const h = this.baseAttributeName.get(u);
      if (!h) {
        console.warn(
          "Could not determine a base name for an easing attribute."
        );
        continue;
      }
      this.baseAttributeName.delete(u);
      const d = `_${h}_time`, f = `_${h}_duration`, p = `_${h}_start_time`;
      switch (u.easing.loop) {
        // Continuous means letting the time go from 0 to infinity
        case Qt.CONTINUOUS: {
          this.setDeclaration(
            t,
            d,
            `  float ${d} = (currentTime - ${p}) / ${f};
`,
            Oi
          );
          break;
        }
        // Repeat means going from 0 to 1 then 0 to 1 etc etc
        case Qt.REPEAT: {
          this.setDeclaration(
            t,
            d,
            `  float ${d} = clamp(fract((currentTime - ${p}) / ${f}), 0.0, 1.0);
`,
            Oi
          );
          break;
        }
        // Reflect means going from 0 to 1 then 1 to 0 then 0 to 1 etc etc
        case Qt.REFLECT: {
          const g = `_${h}_timePassed`, m = `_${h}_pingPong`;
          this.setDeclaration(
            t,
            g,
            `  float ${g} = (currentTime - ${p}) / ${f};
`,
            Oi
          ), this.setDeclaration(
            t,
            m,
            `  float ${m} = abs((fract(${g} / 2.0)) - 0.5) * 2.0;
`,
            Oi
          ), this.setDeclaration(
            t,
            d,
            `  float ${d} = clamp(${m}, 0.0, 1.0);
`,
            Oi
          );
          break;
        }
        // No loop means just linear time
        case Qt.NONE:
        default: {
          this.setDeclaration(
            t,
            d,
            `  float ${d} = clamp((currentTime - ${p}) / ${f}, 0.0, 1.0);
`,
            Oi
          );
          break;
        }
      }
      this.setDeclaration(
        t,
        h,
        `  ${cc[u.size]} ${h} = ${u.easing.methodName}(_${h}_start, _${h}_end, _${h}_time);
`,
        Oi
      );
    }
    return a;
  }
  /**
   * For easing, the header must be populated with the easing method
   */
  processHeaderInjection(e, t, s, n, r, o, a) {
    const c = { injection: "" };
    if (e !== _.VERTEX) return c;
    const l = /* @__PURE__ */ new Map();
    if (c.injection = `// Auto Easing Methods specified by the layer
`, o.forEach((h) => {
      if (h.easing && h.size) {
        let d = l.get(h.easing.methodName);
        d || (d = /* @__PURE__ */ new Map(), l.set(h.easing.methodName, d)), d.set(h.size, h.easing.gpu);
      }
    }), l.size === 0)
      return c.injection = "", c;
    const u = {
      name: "Easing Method Generation",
      values: [Pr.easingMethod]
    };
    return l.forEach(
      (h, d) => {
        h.forEach((f, p) => {
          const g = cc[p], m = {
            [Pr.easingMethod]: `${g} ${d}(${g} start, ${g} end, float t)`,
            [Pr.T]: `${g}`
          }, b = as({
            options: m,
            required: u,
            shader: f
          });
          this.setDeclaration(
            t,
            `${g} ${d}`,
            `${b.shader}
`,
            Oi
          );
        });
      }
    ), c;
  }
}
const Zi = "BasicIOExpansion", pg = ["x", "y", "z", "w"], Ji = {
  [A.ONE]: "float",
  [A.TWO]: "vec2",
  [A.THREE]: "vec3",
  [A.FOUR]: "vec4",
  [A.MATRIX3]: "mat3",
  [A.MATRIX4]: "mat4",
  [A.FLOAT_ARRAY]: "float",
  [A.VEC4_ARRAY]: "vec4",
  /** This is the special case for instance attributes that want an atlas resource */
  [A.TEXTURE]: "vec4"
};
function Iu(i) {
  return i && i.length;
}
function gg(i) {
  const e = i.size;
  if (e === A.FLOAT_ARRAY || e === A.VEC4_ARRAY) {
    const t = i.update(i);
    if (Iu(t))
      return `#define ${i.name}_length ${t.length}
`;
  }
  return "";
}
function mg(i) {
  const e = i.size;
  if (e === A.FLOAT_ARRAY || e === A.VEC4_ARRAY) {
    const t = i.update(i);
    if (Iu(t))
      return `[${i.name}_length]`;
  }
  return "";
}
function bg(i, e) {
  return pg.slice(i, i + e).join("");
}
class xg extends Ar {
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
  processAttributeDestructuring(e, t, s, n, r, o) {
    let a = "";
    const c = r.slice(0);
    switch (e.bufferType) {
      case se.VERTEX_ATTRIBUTE:
      case se.INSTANCE_ATTRIBUTE:
        a = this.processDestructuringInstanceAttribute(
          t,
          c
        );
        break;
      case se.VERTEX_ATTRIBUTE_PACKING:
      case se.INSTANCE_ATTRIBUTE_PACKING:
        a = this.processDestructuringInstanceAttributePacking(
          t,
          c
        );
        break;
    }
    return e.picking.type === X.SINGLE && (a += `
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
    let s = "";
    return s += this.processDestructureBlocks(e, t), s;
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
    const s = "";
    return t.forEach((n) => {
      const r = n.block || 0;
      n.size === S.MAT4X4 ? this.setDeclaration(
        e,
        n.name,
        `  ${Ji[n.size]} ${n.name} = mat4(block${r}, block${r + 1}, block${r + 2}, block${r + 3});
`,
        Zi
      ) : n.size === S.FOUR ? this.setDeclaration(
        e,
        n.name,
        `  ${Ji[n.size]} ${n.name} = block${r};
`,
        Zi
      ) : this.setDeclaration(
        e,
        n.name,
        `  ${Ji[n.size || 1]} ${n.name} = block${r}.${bg(
          n.blockIndex || 0,
          n.size || 1
        )};
`,
        Zi
      );
    }), s;
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
  processHeaderInjection(e, t, s, n, r, o, a) {
    let c = {
      injection: ""
    };
    e === _.VERTEX && (c = this.processAttributeHeader(
      t,
      s,
      n,
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
  processAttributeHeader(e, t, s, n, r) {
    let a = `// Shader input
`;
    return a += this.processVertexAttributes(e, n), (t.bufferType === se.INSTANCE_ATTRIBUTE || t.bufferType === se.VERTEX_ATTRIBUTE) && r.length > 0 && (a += this.processInstanceAttributeBufferStrategy(
      e,
      r
    )), (t.bufferType === se.INSTANCE_ATTRIBUTE_PACKING || t.bufferType === se.VERTEX_ATTRIBUTE_PACKING) && r.length > 0 && (a += this.processInstanceAttributePackingBufferStrategy(
      e,
      s.instanceMaxBlock
    )), {
      injection: a,
      material: void 0
    };
  }
  /**
   * Processes all IO for uniform declarations needed in the header of the
   * shader.
   */
  processUniformHeader(e, t, s) {
    const n = "", r = s || _.VERTEX;
    return t.forEach((o) => {
      o.shaderInjection = o.shaderInjection || _.VERTEX, (o.shaderInjection === r || o.shaderInjection === _.ALL) && this.setDeclaration(
        e,
        o.name,
        `${gg(o)}uniform ${o.qualifier || ""}${o.qualifier ? " " : ""}${Ji[o.size]} ${o.name}${mg(
          o
        )};
`,
        Zi
      );
    }), n;
  }
  /**
   * Produces attributes that are explicitally named and set by the attribute
   * itself.
   */
  processInstanceAttributeBufferStrategy(e, t) {
    let s = "attribute";
    return O.SHADERS_3_0 && (s = "in"), t.forEach((n) => {
      this.setDeclaration(
        e,
        n.name,
        `${s} ${Ji[n.size || 1]} ${n.qualifier || ""}${n.qualifier && " " || ""} ${n.name};
`,
        Zi
      );
    }), "";
  }
  /**
   * Produces attributes that are blocks instead of individual attributes. The
   * system uses these blocks to pack attributes tightly together to maximize
   * capabilities.
   */
  processInstanceAttributePackingBufferStrategy(e, t) {
    let s = "attribute";
    O.SHADERS_3_0 && (s = "in");
    for (let n = 0, r = t + 1; n < r; ++n)
      this.setDeclaration(
        e,
        `block${n}`,
        `${s} ${Ji[S.FOUR]} block${n};
`,
        Zi
      );
    return "";
  }
  /**
   * Produces the vertex attributes without any bias or modification.
   */
  processVertexAttributes(e, t) {
    let s = "attribute";
    return O.SHADERS_3_0 && (s = "in"), t.forEach((n) => {
      this.setDeclaration(
        e,
        n.name,
        `${s} ${Ji[n.size]} ${n.qualifier || ""}${n.qualifier && " " || ""}${n.name};
`,
        Zi
      );
    }), "";
  }
}
const vg = "instanceData", wg = "_active", Tg = `
  // This is a special injected instance attribute. It lets the system
  // control specific instances ability to draw, which allows the backend
  // system greater control on how it optimizes draw calls and it's buffers.
  if (_active < 0.5) {
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);

    // Quick exit to prevent any geometry from arising from the instance
    return;
  }

`, Eg = "ActiveIOExpansion";
class yg extends Ar {
  processAttributeDestructuring(e, t, s, n, r, o) {
    const a = "";
    return r.find((c) => c.name === wg) && this.setDeclaration(
      t,
      "__active_attribute_handler__",
      Tg,
      Eg
    ), a;
  }
}
function Rg(i) {
  const e = i.canvas.height, t = i.canvas.width, s = {
    bottom: -e / 2,
    far: 1e7,
    left: -t / 2,
    near: -100,
    right: t / 2,
    top: e / 2
  }, n = new $i({
    type: Vi.ORTHOGRAPHIC,
    left: s.left,
    right: s.right,
    top: s.top,
    bottom: s.bottom,
    near: s.near,
    far: s.far
  });
  return n.scale = [1, -1, 1], n.position = [0, 0, -300], n.update(), {
    camera: n,
    viewport: {
      bottom: 0,
      left: 0,
      right: 0,
      top: 0
    }
  };
}
class Ag {
  /**
   * The data provided is the array that holds all of the information that
   * should be pushed to the GPU. The size defines how large the vertex
   * attribute is defined in the shader.
   */
  constructor(e, t = !1, s = !1) {
    this._isInstanced = !1, this._fullUpdate = !1, this.normalize = !1, this._needsUpdate = !1, this._updateRange = {
      /** Number of vertices to update */
      count: -1,
      /** Offset to the first vertex to begin updating */
      offset: -1
    }, this.data = e, this._isDynamic = t, this._isInstanced = s;
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
    let s;
    if (t > 65535 ? s = new Uint32Array(e) : t > 256 ? s = new Uint16Array(e) : s = new Uint8Array(e), s.constructor === this.data.constructor)
      s.length >= this.data.length ? s.set(this.data) : s.set(this.data.subarray(0, s.length));
    else
      for (let n = 0, r = Math.min(e, this.data.length); n < r; n++)
        s[n] = this.data[n];
    this.destroy(), this.data = s, this._needsUpdate = !0, this._fullUpdate = !0;
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
  repeatInstances(e, t, s, n = 1) {
    if (n < 1)
      throw new Error(
        "Can not use repeatInstance on indexBuffer with a startInstance of less than 1"
      );
    const r = t * e;
    if (r > 4294967296)
      throw new Error("Vertex count too high for index buffer");
    const o = this.data.constructor === Uint32Array ? 4294967296 : this.data.constructor === Uint16Array ? 65536 : 256;
    r > o && this.resize(this.data.length, r);
    for (let a = n, c = s * (n - 1), l = t * n, u = this.data.length; a < e && c < u; ++a, l += t)
      for (let h = 0; h < s && c < u; ++h, ++c)
        this.data[c] = this.data[h] + l;
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
function _g(i) {
  return Fc(i[0]);
}
function Ig(i, e, t, s, n) {
  const r = [];
  for (let d = 0, f = t.length; d < f; ++d) {
    const p = t[d];
    r.push(new Float32Array(p.size * s));
  }
  const o = t.length;
  let a, c, l, u = !1;
  for (let d = 0, f = s; d < f; ++d)
    for (let p = 0; p < o; ++p)
      if (c = t[p], a = r[p], l = c.update(d), _g(l))
        for (let g = d * c.size, m = g + c.size, b = 0; g < m; ++g, ++b)
          a[g] = l[b];
      else
        u = !0;
  u && console.warn(
    "A vertex buffer updating method should not use arrays of arrays of numbers."
  );
  const h = new zi();
  for (let d = 0, f = t.length; d < f; ++d) {
    const p = t[d], g = new ni(r[d], p.size);
    p.materialAttribute = g, h.addAttribute(p.name, g);
  }
  if (n) {
    const d = n.indexCount, f = n.update, p = n.size;
    let g;
    if (s > 4294967296)
      throw new Error(
        "The maximum number of indices supported by webgl2 is 4294967296. You may have a vertex count or index count that is too large."
      );
    switch (p) {
      case Pn.UINT8:
        s > 65536 ? g = new Uint32Array(d) : s > 256 ? g = new Uint16Array(d) : g = new Uint8Array(d);
        break;
      case Pn.UINT16:
        s > 65536 ? g = new Uint32Array(d) : g = new Uint16Array(d);
        break;
      case Pn.UINT32:
        g = new Uint32Array(d);
        break;
    }
    for (let b = 0, v = d; b < v; ++b)
      g[b] = f(b);
    const m = new Ag(g, !1, !1);
    n.materialIndexBuffer = m, h.setIndexBuffer(m);
  }
  return h;
}
const Mg = {
  [A.ONE]: Ee.FLOAT,
  [A.TWO]: Ee.VEC2,
  [A.THREE]: Ee.VEC3,
  [A.FOUR]: Ee.VEC4,
  [A.MATRIX3]: Ee.MATRIX3x3,
  [A.MATRIX4]: Ee.MATRIX4x4,
  [A.FLOAT_ARRAY]: Ee.FLOAT_ARRAY,
  [A.TEXTURE]: Ee.TEXTURE
}, Sg = {
  [A.ONE]: [0],
  [A.TWO]: [0, 0],
  [A.THREE]: [0, 0, 0],
  [A.FOUR]: [0, 0, 0, 0],
  [A.MATRIX3]: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [A.MATRIX4]: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
};
function Cg(i) {
  return {
    type: Mg[i.size],
    data: Sg[i.size]
  };
}
function Og(i, e, t, s, n) {
  const r = i.getMaterialOptions(), o = /* @__PURE__ */ new Map();
  t.forEach((c, l) => {
    o.set(l.renderTarget || null, c);
  }), Object.assign(r, i.props.materialOptions || {}), r.vertexShader = e, r.fragmentShader = o, r.name = i.id, r.uniforms = {};
  for (let c = 0, l = s.length; c < l; ++c) {
    const u = s[c], h = Cg(u);
    r.uniforms[u.name] = h;
  }
  for (let c = 0, l = n.length; c < l; ++c) {
    const u = n[c];
    r.uniforms[u.name] = {
      type: u.type,
      data: u.value
    };
  }
  return new pr(r);
}
function dn(i, e, t, s) {
  const n = new kl(i, e, t);
  return n.drawMode = s ?? x.Model.DrawMode.TRIANGLE_STRIP, n;
}
function gx(i) {
  return i && i.buffer && i.buffer.value;
}
function Mu(i) {
  return i && i.propertyToBufferLocation;
}
class fn {
  /**
   * Base constructor. A manager always needs to be associated with it's layer
   * and it's scene.
   */
  constructor(e, t) {
    this.add = () => {
    }, this.remove = (s) => s, this.layer = e, this.scene = t;
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
    return Og(
      this.layer,
      e.vs,
      e.fs,
      e.uniforms,
      e.materialUniforms
    );
  }
}
let zs = {};
function Me(i, e) {
  const t = zs[i] || [e, -1, 0];
  zs[i] = t, t[2]++, clearTimeout(t[1]), t[1] = window.setTimeout(() => {
    e(t[2], i), delete zs[i];
  }, 1);
}
function _r() {
  for (const i in zs) {
    const e = zs[i];
    clearTimeout(e[1]), e[0](e[2], i);
  }
  zs = {};
}
const As = ve("performance"), { max: Lg } = Math;
function mx(i) {
  return !!(i && i.buffer && i.buffer.data);
}
function Ng(i) {
  return Mu(i);
}
class Bg extends fn {
  constructor(e, t) {
    super(e, t), this._uid = P(), this.availableLocations = [], this.currentInstancedCount = 0, this.instanceToBufferLocation = {}, this.maxInstancedCount = 0, this.attributeToPropertyIds = /* @__PURE__ */ new Map(), this.updateAllPropertyIdList = [], this.activePropertyId = -1, this.currentAvailableLocation = -1, this.remove = (s) => {
      const n = this.instanceToBufferLocation[s.uid];
      return n && (delete this.instanceToBufferLocation[s.uid], this.availableLocations.push(n)), s;
    }, this.add = this.doAddWithRegistration;
  }
  /**
   * This is the unique identifier for this buffer manager, used for debugging
   */
  get uid() {
    return this._uid;
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
    Se.setObservableMonitor(!0), this.layer.shaderIOInfo.instanceAttributes.forEach((s) => {
      if (s.parentAttribute) return;
      s.update(e);
      const n = Se.getObservableMonitorIds(!0);
      this.attributeToPropertyIds.set(s, [
        n[n.length - 1]
      ]), n.length > 1 && As(
        "Property has multiple observables. Only the last trigger will be retained as the feature is not complete yet"
      ), s === this.layer.shaderIOInfo.activeAttribute && (this.activePropertyId = n[0]);
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
    var s;
    if (this.availableLocations.length <= 0 || this.currentAvailableLocation >= this.availableLocations.length - 1) {
      const n = this.resizeBuffer();
      this.gatherLocationsIntoGroups(
        n.newLocations,
        n.growth
      );
    }
    const t = this.availableLocations[++this.currentAvailableLocation];
    return t && this.geometry ? (this.instanceToBufferLocation[e.uid] = t, this.currentInstancedCount = this.geometry.maxInstancedCount = Lg(
      this.currentInstancedCount,
      // Instance index + 1 because the indices are zero indexed and the
      // maxInstancedCount is a count value
      t.instanceIndex + 1
    ), this.model && (this.model.vertexDrawRange = [
      0,
      ((s = this.layer.shaderIOInfo.indexBuffer) == null ? void 0 : s.indexCount) || this.layer.shaderIOInfo.instanceVertexCount
    ], this.model.drawInstances = this.currentInstancedCount, this.layer.shaderIOInfo.instanceVertexCount === 0 && (this.model.vertexDrawRange[1] = this.model.drawInstances))) : console.error(
      "Add Error: Instance Attribute Buffer Manager failed to pair an instance with a buffer location"
    ), _r(), t;
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
    As("Gathering resize growth amount...");
    const e = this.layer.shaderIOInfo;
    let t = 0;
    const s = /* @__PURE__ */ new Map(), n = this.maxInstancedCount;
    if (this.changeListContext) {
      t = this.layer.shaderIOInfo.baseBufferGrowthRate;
      for (let l = 0, u = this.changeListContext.length; l < u; ++l) {
        const h = this.changeListContext[l];
        switch (h[1]) {
          case me.CHANGE:
          case me.INSERT:
            this.instanceToBufferLocation[h[0].uid] || t++;
            break;
        }
      }
    }
    if (As("BEGIN: Resizing unpacked attribute buffer by %d instances", t), this.geometry) {
      this.geometry.rebuild(), this.maxInstancedCount += t, this.attributes = this.attributes || [];
      for (const l of this.attributes)
        l.bufferAttribute.count < this.maxInstancedCount && ((c = (a = this.layer.props.bufferManagement) == null ? void 0 : a.optimize) != null && c.bufferDoubling ? l.bufferAttribute.resize(
          this.maxInstancedCount * 2,
          n
        ) : l.bufferAttribute.resize(
          this.maxInstancedCount,
          n
        ));
    } else {
      t = Math.max(
        t,
        ((o = (r = this.layer.props.bufferManagement) == null ? void 0 : r.optimize) == null ? void 0 : o.expectedInstanceCount) ?? 0
      ), this.maxInstancedCount += t, this.geometry = new zi();
      for (const l of e.vertexAttributes)
        l.materialAttribute && this.geometry.addAttribute(
          l.name,
          l.materialAttribute
        );
      e.indexBuffer && e.indexBuffer.materialIndexBuffer && this.geometry.setIndexBuffer(
        e.indexBuffer.materialIndexBuffer
      ), this.attributes = [];
      for (const l of e.instanceAttributes) {
        const u = l.size || 0, h = new ni(
          new Float32Array(0),
          u,
          !0,
          !0
        );
        h.resize(this.maxInstancedCount), this.geometry.addAttribute(l.name, h);
        const d = Object.assign({}, l, {
          uid: P(),
          bufferAttribute: h
        });
        this.attributes.push(d);
      }
      this.geometry.maxInstancedCount = 0;
    }
    for (let l = 0, u = this.attributes.length; l < u; ++l) {
      const h = this.attributes[l], d = h.bufferAttribute, f = h.size || 0, p = this.maxInstancedCount - n;
      let g = s.get(
        h.name
      );
      g || (g = new Array(p), s.set(h.name, g));
      let m = 0;
      for (let b = n, v = this.maxInstancedCount; b < v; ++b, ++m)
        g[m] = {
          attribute: h,
          // We set this to the attribute, that way when the attribute creates a
          // new buffer object, the new reference will automatically be used
          // which prevents us from having to manually update the reference
          // across all generated locations.
          buffer: d,
          instanceIndex: b,
          start: b * f,
          end: b * f + f
        };
    }
    if (this.scene && this.model && this.scene.container && this.scene.container.remove(this.model), !this.material) {
      this.material = this.makeLayerMaterial();
      for (let l = 0, u = e.uniforms.length; l < u; ++l) {
        const h = e.uniforms[l];
        h.materialUniforms.push(this.material.uniforms[h.name]);
      }
    }
    return this.model = dn(
      this.layer.id,
      this.geometry,
      this.material,
      e.drawMode
    ), this.scene && this.scene.container && this.model && this.scene.container.add(this.model), As("COMPLETE: Resizing unpacked attribute buffer"), {
      growth: t,
      newLocations: s
    };
  }
  /**
   * This takes newly created buffer locations and groups them by the property
   * ids identified by the registration phase.
   */
  gatherLocationsIntoGroups(e, t) {
    if (this.attributeToPropertyIds.size === 0) return;
    As("BEGIN: Unpacked attribute manager grouping new buffer locations");
    const s = [];
    this.attributeToPropertyIds.forEach((u, h) => {
      s.push({
        attribute: h,
        bufferLocationsForAttribute: e.get(h.name) || [],
        childBufferLocations: (h.childAttributes || []).map((d) => ({
          location: e.get(d.name) || [],
          bufferIndex: -1
        })),
        ids: u,
        bufferIndex: -1
      });
    });
    let n, r, o, a, c, l;
    for (let u = 0; u < t; ++u) {
      const h = {
        instanceIndex: -1,
        propertyToBufferLocation: {}
      };
      for (let d = 0, f = s.length; d < f; ++d) {
        if (n = s[d], r = n.attribute, o = n.ids, a = n.bufferLocationsForAttribute, !a) {
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
        if (c = a[++n.bufferIndex], !c) {
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
        if (h.instanceIndex === -1)
          h.instanceIndex = c.instanceIndex;
        else if (c.instanceIndex !== h.instanceIndex) {
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
            const m = n.childBufferLocations[p];
            if (m) {
              const b = m.location[++m.bufferIndex];
              b ? c.childLocations.push(b) : (l = r.childAttributes[p], Me(
                "Instance Attribute Child Attribute Error",
                (v, w) => {
                  console.warn(
                    `${w}: A child attribute does not have a buffer location available. Error count: ${v}`
                  ), console.warn(
                    `Parent Attribute: ${r.name} Child Attribute: ${l.name}`
                  );
                }
              ));
            }
          }
        }
        for (let p = 0, g = o.length; p < g; ++p)
          h.propertyToBufferLocation[o[p]] = c;
      }
      this.availableLocations.push(h);
    }
    As(
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
const { max: Pg } = Math, _s = ve("performance");
class Fg extends fn {
  constructor(e, t) {
    super(e, t), this.allBufferLocations = {}, this.availableLocations = [], this.currentInstancedCount = 0, this.instanceToBufferLocation = {}, this.maxInstancedCount = 1e3, this.blockSubAttributesLookup = /* @__PURE__ */ new Map(), this.attributeToPropertyIds = /* @__PURE__ */ new Map(), this.updateAllPropertyIdList = [], this.activePropertyId = -1, this.currentAvailableLocation = -1, this.remove = (s) => {
      const n = this.instanceToBufferLocation[s.uid];
      return n && (delete this.instanceToBufferLocation[s.uid], this.availableLocations.push(n)), s;
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
    this.layer.shaderIOInfo.instanceAttributes.forEach((s) => {
      if (s.parentAttribute) return;
      Se.setObservableMonitor(!0), s.update(e);
      const n = Se.getObservableMonitorIds(!0);
      this.attributeToPropertyIds.set(s, [
        n[n.length - 1]
      ]), n.length > 1 && _s(
        "Property has multiple observables. Only the last trigger will be retained as the feature is not complete yet"
      ), s === this.layer.shaderIOInfo.activeAttribute && (this.activePropertyId = n[0]);
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
    var s;
    if (this.availableLocations.length <= 0 || this.currentAvailableLocation >= this.availableLocations.length - 1) {
      const n = this.resizeBuffer();
      this.gatherLocationsIntoGroups(
        n.newLocations,
        n.growth
      );
    }
    const t = this.availableLocations[++this.currentAvailableLocation];
    return t && this.geometry ? (this.instanceToBufferLocation[e.uid] = t, this.currentInstancedCount = this.geometry.maxInstancedCount = Pg(
      this.currentInstancedCount,
      // Instance index + 1 because the indices are zero indexed and the maxInstancedCount is a count value
      t.instanceIndex + 1
    ), this.model && (this.model.vertexDrawRange = [
      0,
      ((s = this.layer.shaderIOInfo.indexBuffer) == null ? void 0 : s.indexCount) || this.layer.shaderIOInfo.instanceVertexCount
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
    const s = /* @__PURE__ */ new Map(), n = this.maxInstancedCount;
    if (this.changeListContext) {
      t = this.layer.shaderIOInfo.baseBufferGrowthRate;
      for (let l = 0, u = this.changeListContext.length; l < u; ++l) {
        const h = this.changeListContext[l];
        switch (h[1]) {
          case me.CHANGE:
          case me.INSERT:
            this.instanceToBufferLocation[h[0].uid] || t++;
            break;
        }
      }
    }
    if (_s("BEGIN: Resizing packed attribute buffer by %d instances", t), this.geometry) {
      _s(
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
      for (let l = 0, u = this.blockAttributes.length; l < u; ++l) {
        const h = this.blockAttributes[l];
        h.bufferAttribute.count < this.maxInstancedCount && ((c = (a = this.layer.props.bufferManagement) == null ? void 0 : a.optimize) != null && c.bufferDoubling ? h.bufferAttribute.resize(
          this.maxInstancedCount * 2,
          n
        ) : h.bufferAttribute.resize(
          this.maxInstancedCount,
          n
        ));
      }
      for (let l = 0, u = this.blockAttributes.length; l < u; ++l) {
        const h = this.blockAttributes[l], d = h.bufferAttribute;
        if (d.data instanceof Float32Array) {
          const f = this.blockSubAttributesLookup.get(l), p = h.size || 0;
          if (f)
            for (let g = 0, m = f.length; g < m; ++g) {
              const b = f[g];
              let v = s.get(
                b.name
              );
              v || (v = [], s.set(
                b.name,
                v
              ));
              const w = this.allBufferLocations[b.name] || [];
              this.allBufferLocations[b.name] = w;
              const E = Object.assign({}, b, {
                uid: P(),
                packUID: h.packUID,
                bufferAttribute: d
              }), y = b.blockIndex || 0, C = b.size || 1;
              let M;
              for (let N = 0, D = w.length; N < D; ++N)
                M = w[N], M.attribute = E;
              let R, V = v.length;
              const z = this.maxInstancedCount - n;
              v.length += z, w.length += z;
              for (let N = n; N < this.maxInstancedCount; ++N, ++V)
                R = {
                  attribute: E,
                  block: l,
                  buffer: d,
                  instanceIndex: N,
                  start: N * p + y,
                  end: N * p + y + C
                }, v[V] = R, w[N] = R;
            }
        }
      }
    } else {
      t = Math.max(
        t,
        ((o = (r = this.layer.props.bufferManagement) == null ? void 0 : r.optimize) == null ? void 0 : o.expectedInstanceCount) ?? 0
      ), this.maxInstancedCount += t, this.geometry = new zi();
      for (const h of e.vertexAttributes)
        h.materialAttribute && this.geometry.addAttribute(
          h.name,
          h.materialAttribute
        );
      e.indexBuffer && e.indexBuffer.materialIndexBuffer && this.geometry.setIndexBuffer(
        e.indexBuffer.materialIndexBuffer
      ), this.attributes = [], this.blockAttributes = [];
      const l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map();
      this.blockSubAttributesLookup = u;
      for (let h = 0, d = e.instanceAttributes.length; h < d; ++h) {
        const f = e.instanceAttributes[h], p = f.block || 0;
        let g = l.get(p) || 0;
        g = Math.max(
          g,
          (f.blockIndex || 0) + (f.size || 0)
        ), l.set(p, g);
        let m = u.get(p);
        m || (m = [], u.set(p, m)), m.push(f);
      }
      u.forEach(
        (h) => h.sort((d, f) => (d.blockIndex || 0) - (f.blockIndex || 0))
      );
      for (let h = 0, d = l.size; h < d; ++h) {
        const f = l.get(h) || 0, p = P();
        f || console.warn(
          "Instance Attribute Packing Error: The system tried to build an attribute with a size of zero.",
          "These are the attributes used:",
          e.instanceAttributes,
          "These are the block sizes calculated",
          l,
          "This is the block to attribute lookup generated",
          u
        );
        const g = new Float32Array(f * this.maxInstancedCount), m = new ni(g, f, !0, !0);
        this.geometry.addAttribute(`block${h}`, m);
        const b = u.get(h);
        if (b) {
          for (let v = 0, w = b.length; v < w; ++v) {
            const E = b[v];
            let y = s.get(
              E.name
            );
            y || (y = [], s.set(
              E.name,
              y
            ));
            const C = this.allBufferLocations[E.name] || [];
            this.allBufferLocations[E.name] = C;
            const M = Object.assign({}, E, {
              uid: h,
              packUID: p,
              bufferAttribute: m,
              size: f
            }), R = E.blockIndex || 0, V = E.size || 1;
            for (let z = 0; z < this.maxInstancedCount; ++z) {
              const N = {
                attribute: M,
                block: h,
                buffer: m,
                instanceIndex: z,
                start: z * f + R,
                end: z * f + R + V
              };
              y.push(N), C.push(N);
            }
            this.attributes.push(M);
          }
          this.blockAttributes.push({
            uid: P(),
            packUID: p,
            bufferAttribute: m,
            name: `block${h}`,
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
            u
          );
      }
      this.geometry.maxInstancedCount = 0, this.material = this.makeLayerMaterial();
      for (let h = 0, d = e.uniforms.length; h < d; ++h) {
        const f = e.uniforms[h];
        f.materialUniforms.push(this.material.uniforms[f.name]);
      }
    }
    return this.scene && this.model && this.scene.container && this.scene.container.remove(this.model), this.material = this.material || this.makeLayerMaterial(), this.model = dn(
      this.layer.id,
      this.geometry,
      this.material,
      this.layer.shaderIOInfo.drawMode
    ), this.scene && this.scene.container && this.model && this.scene.container.add(this.model), _s("COMPLETE: Resizing unpacked attribute buffer"), {
      growth: t,
      newLocations: s
    };
  }
  /**
   * This takes newly created buffer locations and groups them by the property ids identified by the
   * registration phase.
   */
  gatherLocationsIntoGroups(e, t) {
    if (this.attributeToPropertyIds.size === 0) return;
    _s("BEGIN: Packed attribute manager grouping new buffer locations");
    const s = [];
    this.attributeToPropertyIds.forEach((n, r) => {
      s.push({
        attribute: r,
        bufferLocationsForAttribute: e.get(r.name) || [],
        childBufferLocations: (r.childAttributes || []).map((o) => ({
          location: e.get(o.name) || [],
          bufferIndex: -1
        })),
        ids: n,
        bufferIndex: -1
      });
    });
    for (let n = 0; n < t; ++n) {
      const r = {
        instanceIndex: -1,
        propertyToBufferLocation: {}
      };
      for (let o = 0, a = s.length; o < a; ++o) {
        const c = s[o], l = c.attribute, u = c.ids, h = c.bufferLocationsForAttribute;
        if (!h) {
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
        const d = h[++c.bufferIndex];
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
            const m = l.childAttributes[p], b = c.childBufferLocations[p];
            if (b) {
              const v = b.location[++b.bufferIndex];
              v ? f.push(v) : Me(
                "Instance Attribute Child Attribute Error",
                (w, E) => {
                  console.warn(
                    `${E}: A child attribute does not have a buffer location available. Error count: ${w}`
                  ), console.warn(
                    `Parent Attribute: ${l.name} Child Attribute: ${m.name}`
                  );
                }
              );
            }
          }
          d.childLocations = f;
        }
        for (let f = 0, p = u.length; f < p; ++f) {
          const g = u[f];
          r.propertyToBufferLocation[g] = d;
        }
      }
      this.availableLocations.push(r);
    }
    _s("COMPLETE: Packed attribute buffer manager buffer location grouping"), _r();
  }
  /**
   * Returns the total instances this buffer manages.
   */
  getInstanceCount() {
    return this.maxInstancedCount;
  }
}
function Dg(i) {
  return i && i.buffer && i.buffer.value && i.type === Ee.VEC4_ARRAY;
}
class kg extends fn {
  constructor(e, t) {
    super(e, t), this.buffers = [], this.availableClusters = [], this.instanceToCluster = {}, this.clusterToBuffer = /* @__PURE__ */ new Map(), this.add = (n) => {
      this.availableClusters.length <= 0 && this.makeNewBuffer();
      const r = this.availableClusters.pop();
      return r ? this.instanceToCluster[n.uid] = r : console.warn(
        "No valid cluster available for instance added to uniform manager."
      ), r;
    }, this.remove = (n) => {
      const r = this.instanceToCluster[n.uid];
      return r && (delete this.instanceToCluster[n.uid], this.availableClusters.push(r)), n;
    };
    let s = 0;
    e.shaderIOInfo.instanceAttributes.forEach(
      (n) => {
        s = Math.max(n.block || 0, s);
      }
    ), this.uniformBlocksPerInstance = s + 1;
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
      for (let t = 0, s = this.buffers.length; t < s; ++t) {
        const n = this.buffers[t];
        e.container.remove(n.model);
      }
      delete this.scene;
    }
  }
  /**
   * Applies the buffers to the provided scene for rendering.
   */
  setScene(e) {
    if (e.container) {
      for (let t = 0, s = this.buffers.length; t < s; ++t) {
        const n = this.buffers[t];
        e.container.add(n.model);
      }
      this.scene = e;
    } else
      console.warn("Can not set a scene that has an undefined container.");
  }
  /**
   * This generates a new buffer of uniforms to associate instances with.
   */
  makeNewBuffer() {
    const e = this.layer.shaderIOInfo, t = new zi();
    e.vertexAttributes.forEach((u) => {
      u.materialAttribute && t.addAttribute(u.name, u.materialAttribute);
    });
    const s = this.makeLayerMaterial(), n = dn(
      this.layer.id,
      t,
      s,
      e.drawMode
    );
    n.vertexDrawRange = [
      0,
      e.maxInstancesPerBuffer * e.instanceVertexCount
    ];
    const r = {
      activeInstances: [],
      clusters: [],
      firstInstance: 0,
      geometry: t,
      lastInstance: 0,
      material: s,
      model: n
    };
    this.buffers.push(r);
    let o = 0;
    const a = vg, c = s.uniforms[a];
    if (zh(c))
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
        bufferAttribute: new ni(new Float32Array(1), 1),
        uid: P()
      }
    );
    for (let u = 0, h = e.maxInstancesPerBuffer; u < h; ++u) {
      const d = {
        attribute: l,
        // TODO: This is not needed for the uniform method yet. When we break down
        // the uniform updates into attributes, this will be utilized.
        buffer: c,
        instanceIndex: u,
        start: o,
        end: 0
      };
      o += this.uniformBlocksPerInstance, d.end = o, r.clusters.push(d), this.availableClusters.push(d), this.clusterToBuffer.set(d, r);
    }
    for (let u = 0, h = e.uniforms.length; u < h; ++u) {
      const d = e.uniforms[u];
      d.materialUniforms.push(s.uniforms[d.name]);
    }
    this.scene && this.scene.container && this.scene.container.add(r.model);
  }
}
class Zo {
  constructor(e, t) {
    this.layer = e, this.bufferManager = t;
  }
}
const Sn = [], { min: Fr, max: Dr } = Math;
class Ug extends Zo {
  constructor() {
    super(...arguments), this.diffMode = 0, this.bufferAttributeUpdateRange = {}, this.bufferAttributeWillUpdate = {}, this.updateInstance = this.updateInstancePartial;
  }
  /**
   * This processes add operations from changes in the instancing data
   */
  addInstance(e, t, s, n) {
    if (n)
      e.changeInstance(e, t, Sn, n);
    else {
      const r = e.layer.bufferManager.add(t);
      Ng(r) && (t.active = !0, e.layer.onDiffAdd && e.layer.onDiffAdd(t), e.updateInstance(
        e.layer,
        t,
        Sn,
        r
      ));
    }
  }
  /**
   * This processes change operations from changes in the instancing data
   */
  changeInstance(e, t, s, n) {
    n ? e.updateInstance(e.layer, t, s, n) : e.addInstance(e, t, Sn, n);
  }
  /**
   * This processes remove operations from changes in the instancing data
   */
  removeInstance(e, t, s, n) {
    n && (t.active = !1, e.layer.onDiffRemove && e.layer.onDiffRemove(t), e.updateInstance(e.layer, t, Sn, n), e.layer.bufferManager.remove(t));
  }
  /**
   * This performs the actual updating of buffers the instance needs to update
   */
  updateInstancePartial(e, t, s, n) {
    const r = n.propertyToBufferLocation, o = this.bufferAttributeUpdateRange;
    let a, c, l, u, h, d, f, p, g, m, b, v, w;
    if (t.active) {
      for ((s.length === 0 || t.reactivate) && (s = this.bufferManager.getUpdateAllPropertyIdList()), f = 0, b = s.length; f < b; ++f)
        if (a = r[s[f]], !!a) {
          for (h = a.attribute, d = h.packUID || h.uid, c = h.update(t), g = a.start, v = a.end, p = 0; g < v; ++g, ++p)
            a.buffer.data[g] = c[p];
          if (l = o[d] || [
            null,
            Number.MAX_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER
          ], l[0] = h, l[1] = Fr(a.start, l[1]), l[2] = Dr(a.end, l[2]), o[d] = l, a.childLocations) {
            for (u = a.childLocations, g = 0, v = u.length; g < v; ++g)
              if (a = u[g], !!a) {
                for (d = a.attribute.packUID || a.attribute.uid, c = a.attribute.update(t), m = a.start, w = a.end, p = 0; m < w; ++m, ++p)
                  a.buffer.data[m] = c[p];
                l = o[d] || [
                  null,
                  Number.MAX_SAFE_INTEGER,
                  Number.MIN_SAFE_INTEGER
                ], l[0] = a.attribute, l[1] = Fr(a.start, l[1]), l[2] = Dr(a.end, l[2]), o[d] = l;
              }
          }
        }
    } else {
      for (a = r[this.bufferManager.getActiveAttributePropertyId()], h = a.attribute, d = h.packUID || h.uid, c = h.update(t), m = a.start, w = a.end, p = 0; m < w; ++m, ++p)
        a.buffer.data[m] = c[p];
      l = o[d] || [
        null,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER
      ], l[0] = h, l[1] = Fr(a.start, l[1]), l[2] = Dr(a.end, l[2]), o[d] = l;
    }
    t.reactivate = !1;
  }
  /**
   * This performs an update on the buffers with the intent the entire buffer is
   * going to update rather than a chunk of it.
   */
  updateInstanceFull(e, t, s, n) {
    const r = n.propertyToBufferLocation, o = this.bufferAttributeWillUpdate;
    let a, c, l, u, h, d, f, p, g, m, b;
    if (t.active) {
      for ((s.length === 0 || t.reactivate) && (s = this.bufferManager.getUpdateAllPropertyIdList()), h = 0, b = s.length; h < b; ++h)
        if (a = r[s[h]], !!a) {
          for (u = a.attribute, c = u.update(t), f = a.start, g = a.end, d = 0; f < g; ++f, ++d)
            a.buffer.data[f] = c[d];
          if (o[u.packUID || u.uid] = u, a.childLocations) {
            for (l = a.childLocations, f = 0, g = l.length; f < g; ++f)
              if (a = l[f], !!a) {
                for (u = a.attribute, c = u.update(t), p = a.start, m = a.end, d = 0; p < m; ++p, ++d)
                  a.buffer.data[p] = c[d];
                o[u.packUID || u.uid] = u;
              }
          }
        }
    } else {
      for (a = r[this.bufferManager.getActiveAttributePropertyId()], u = a.attribute, c = u.update(t), p = a.start, m = a.end, d = 0; p < m; ++p, ++d)
        a.buffer.data[p] = c[d];
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
      for (let t = 0, s = e.length; t < s; ++t) {
        const n = e[t], r = n[0].bufferAttribute;
        r.updateRange = {
          count: n[2] - n[1],
          offset: n[1]
        };
      }
    } else {
      const e = Object.values(this.bufferAttributeWillUpdate);
      for (let t = 0, s = e.length; t < s; ++t) {
        const n = e[t].bufferAttribute;
        n.updateRange = {
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
const lc = [];
class zg extends Zo {
  /**
   * This processes add operations from changes in the instancing data
   */
  addInstance(e, t, s, n) {
    if (n)
      e.changeInstance(e, t, lc, n);
    else {
      const r = e.layer.bufferManager.add(t);
      Dg(r) && (t.active = !0, e.layer.onDiffAdd && e.layer.onDiffAdd(t), e.updateInstance(e.layer, t, r));
    }
  }
  /**
   * This processes change operations from changes in the instancing data
   */
  changeInstance(e, t, s, n) {
    n ? e.updateInstance(e.layer, t, n) : e.addInstance(e, t, lc, n);
  }
  /**
   * This processes remove operations from changes in the instancing data
   */
  removeInstance(e, t, s, n) {
    n && (t.active = !1, e.layer.onDiffRemove && e.layer.onDiffRemove(t), e.updateInstance(e.layer, t, n), e.layer.bufferManager.remove(t));
  }
  /**
   * TODO: We should be updating based on prop ids instead of always updating all props for every change.
   *
   * This performs the actual updating of buffers the instance needs to update
   */
  updateInstance(e, t, s) {
    if (t.active) {
      const n = s.buffer, r = s.start, o = n.data;
      let a, c, l, u, h, d;
      for (let f = 0, p = e.shaderIOInfo.instanceAttributes.length; f < p; ++f)
        if (a = e.shaderIOInfo.instanceAttributes[f], c = a.update(t), l = o[r + (a.block || 0)], u = a.blockIndex, u !== void 0)
          for (h = u, d = c.length + u; h < d; ++h)
            l[h] = c[h - u];
      n.data = o;
    } else {
      const n = s.buffer, r = s.start, o = n.data, a = e.shaderIOInfo.activeAttribute, c = a.update(t), l = o[r + (a.block || 0)], u = a.blockIndex;
      if (u !== void 0)
        for (let h = u, d = c.length + u; h < d; ++h)
          l[h] = c[h - u];
      n.data = o;
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
const Is = ve("performance"), { max: Gg } = Math;
function Vg(i) {
  return Mu(i);
}
class $g extends fn {
  constructor(e, t) {
    super(e, t), this.allBufferLocations = {}, this.availableLocations = [], this.currentInstancedCount = 0, this.instanceToBufferLocation = {}, this.maxInstancedCount = 0, this.attributeToPropertyIds = /* @__PURE__ */ new Map(), this.updateAllPropertyIdList = [], this.activePropertyId = -1, this.currentAvailableLocation = -1, this.remove = (s) => {
      const n = this.instanceToBufferLocation[s.uid];
      return n && (delete this.instanceToBufferLocation[s.uid], this.availableLocations.push(n)), s;
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
    Se.setObservableMonitor(!0), this.layer.shaderIOInfo.instanceAttributes.forEach((s) => {
      if (s.parentAttribute) return;
      s.update(e);
      const n = Se.getObservableMonitorIds(!0);
      this.attributeToPropertyIds.set(s, [
        n[n.length - 1]
      ]), n.length > 1 && Is(
        "Property has multiple observables. Only the last trigger will be retained as the feature is not complete yet"
      ), s === this.layer.shaderIOInfo.activeAttribute && (this.activePropertyId = n[0]);
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
      const s = this.resizeBuffer();
      this.gatherLocationsIntoGroups(
        s.newLocations,
        s.growth
      );
    }
    const t = this.availableLocations[++this.currentAvailableLocation];
    return t && this.geometry ? (this.instanceToBufferLocation[e.uid] = t, this.currentInstancedCount = this.geometry.maxInstancedCount = Gg(
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
    Is("Gathering resize growth amount...");
    const e = this.layer.shaderIOInfo.instanceVertexCount, t = this.layer.shaderIOInfo;
    let s = 0;
    const n = /* @__PURE__ */ new Map();
    if (this.changeListContext) {
      s = this.layer.shaderIOInfo.baseBufferGrowthRate;
      for (let a = 0, c = this.changeListContext.length; a < c; ++a) {
        const l = this.changeListContext[a];
        switch (l[1]) {
          case me.CHANGE:
          case me.INSERT:
            this.instanceToBufferLocation[l[0].uid] || s++;
            break;
        }
      }
    }
    if (Is("BEGIN: Resizing unpacked attribute buffer by %d instances", s), this.geometry) {
      this.geometry.rebuild();
      const a = this.maxInstancedCount;
      this.maxInstancedCount += s;
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
        const l = c.bufferAttribute, u = c.size || 0;
        if (l.data instanceof Float32Array) {
          c.bufferAttribute.resize(
            this.maxInstancedCount * e
          );
          let h = n.get(
            c.name
          );
          const d = this.allBufferLocations[c.name] || [];
          this.allBufferLocations[c.name] = d;
          for (let m = 0, b = d.length; m < b; ++m)
            d[m].buffer.data = c.bufferAttribute.data;
          h || (h = [], n.set(
            c.name,
            h
          ));
          let f, p = h.length;
          const g = this.maxInstancedCount - a;
          h.length += g, d.length += g;
          for (let m = a, b = this.maxInstancedCount; m < b; ++m, ++p)
            f = {
              attribute: c,
              buffer: {
                data: c.bufferAttribute.data
              },
              instanceIndex: m,
              start: m * u,
              end: m * u + u
            }, h[p] = f, d[m] = f;
        }
      }
      (o = this.scene) != null && o.container && this.model && this.scene.container.remove(this.model);
    } else {
      this.maxInstancedCount += s, this.geometry = new zi();
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
        const c = a.size || 0, l = new ni(
          new Float32Array(0),
          c,
          !0,
          !1
        );
        l.resize(this.maxInstancedCount * e), this.geometry.addAttribute(a.name, l);
        let u = n.get(
          a.name
        );
        u || (u = [], n.set(a.name, u));
        const h = this.allBufferLocations[a.name] || [];
        this.allBufferLocations[a.name] = h;
        const d = Object.assign({}, a, {
          uid: P(),
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
          u.push(p), h.push(p);
        }
        this.attributes.push(d);
      }
      this.geometry.maxInstancedCount = 0, this.material = this.makeLayerMaterial();
      for (let a = 0, c = t.uniforms.length; a < c; ++a) {
        const l = t.uniforms[a];
        l.materialUniforms.push(this.material.uniforms[l.name]);
      }
    }
    return this.scene && this.model && this.scene.container && this.scene.container.remove(this.model), this.material = this.material || this.makeLayerMaterial(), this.model = dn(
      this.layer.id,
      this.geometry,
      this.material,
      t.drawMode
    ), this.scene && this.scene.container && this.model && this.scene.container.add(this.model), Is("COMPLETE: Resizing unpacked attribute buffer"), {
      growth: s,
      newLocations: n
    };
  }
  /**
   * This takes newly created buffer locations and groups them by the property
   * ids identified by the registration phase.
   */
  gatherLocationsIntoGroups(e, t) {
    if (this.attributeToPropertyIds.size === 0) return;
    Is("BEGIN: Unpacked attribute manager grouping new buffer locations");
    const s = [];
    this.attributeToPropertyIds.forEach((u, h) => {
      s.push({
        attribute: h,
        bufferLocationsForAttribute: e.get(h.name) || [],
        childBufferLocations: (h.childAttributes || []).map((d) => ({
          location: e.get(d.name) || [],
          bufferIndex: -1
        })),
        ids: u,
        bufferIndex: -1
      });
    });
    let n, r, o, a, c, l;
    for (let u = 0; u < t; ++u) {
      const h = {
        instanceIndex: -1,
        propertyToBufferLocation: {}
      };
      for (let d = 0, f = s.length; d < f; ++d) {
        if (n = s[d], r = n.attribute, o = n.ids, a = n.bufferLocationsForAttribute, !a) {
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
        if (c = a[++n.bufferIndex], !c) {
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
        if (h.instanceIndex === -1)
          h.instanceIndex = c.instanceIndex;
        else if (c.instanceIndex !== h.instanceIndex) {
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
            const m = n.childBufferLocations[p];
            if (m) {
              const b = m.location[++m.bufferIndex];
              b ? c.childLocations.push(b) : (l = r.childAttributes[p], Me(
                "Instance Attribute Child Attribute Error",
                (v, w) => {
                  console.warn(
                    `${w}: A child attribute does not have a buffer location available. Error count: ${v}`
                  ), console.warn(
                    `Parent Attribute: ${r.name} Child Attribute: ${l.name}`
                  );
                }
              ));
            }
          }
        }
        for (let p = 0, g = o.length; p < g; ++p)
          h.propertyToBufferLocation[o[p]] = c;
      }
      this.availableLocations.push(h);
    }
    Is(
      "COMPLETE: Unpacked attribute buffer manager buffer location grouping"
    ), _r();
  }
  /**
   * Returns the total instances this buffer manages.
   */
  getInstanceCount() {
    return this.maxInstancedCount;
  }
}
const Cn = [], { min: kr, max: Ur } = Math;
class Wg extends Zo {
  constructor() {
    super(...arguments), this.diffMode = 0, this.bufferAttributeUpdateRange = {}, this.bufferAttributeWillUpdate = {}, this.updateInstance = this.updateInstancePartial;
  }
  /**
   * This processes add operations from changes in the instancing data
   */
  addInstance(e, t, s, n) {
    if (n)
      e.changeInstance(e, t, Cn, n);
    else {
      const r = e.layer.bufferManager.add(t);
      Vg(r) && (t.active = !0, e.layer.onDiffAdd && e.layer.onDiffAdd(t), e.updateInstance(
        e.layer,
        t,
        Cn,
        r
      ));
    }
  }
  /**
   * This processes change operations from changes in the instancing data
   */
  changeInstance(e, t, s, n) {
    n ? e.updateInstance(e.layer, t, s, n) : e.addInstance(e, t, Cn, n);
  }
  /**
   * This processes remove operations from changes in the instancing data
   */
  removeInstance(e, t, s, n) {
    n && (t.active = !1, e.layer.onDiffRemove && e.layer.onDiffRemove(t), e.updateInstance(e.layer, t, Cn, n), e.layer.bufferManager.remove(t));
  }
  /**
   * This performs the actual updating of buffers the instance needs to update
   */
  updateInstancePartial(e, t, s, n) {
    const r = e.shaderIOInfo.instanceVertexCount, o = n.propertyToBufferLocation, a = this.bufferAttributeUpdateRange;
    let c, l, u, h, d, f, p = 0, g, m, b, v, w, E, y;
    if (t.active) {
      for ((s.length === 0 || t.reactivate) && (s = this.bufferManager.getUpdateAllPropertyIdList()), g = 0, E = s.length; g < E; ++g)
        if (c = o[s[g]], !!c) {
          for (d = c.attribute, f = d.packUID || d.uid, l = d.update(t), p = d.size || c.end - c.start, m = c.start * r, y = c.end * r; m < y; )
            for (b = 0; b < p; ++b, ++m)
              c.buffer.data[m] = l[b];
          if (u = a[f] || [
            null,
            Number.MAX_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER
          ], u[0] = d, u[1] = kr(c.start * r, u[1]), u[2] = Ur(c.end * r, u[2]), a[f] = u, c.childLocations) {
            for (h = c.childLocations, v = 0, w = h.length; v < w; ++v)
              if (c = h[v], !!c) {
                for (f = c.attribute.packUID || c.attribute.uid, l = c.attribute.update(t), p = d.size || c.end - c.start, m = c.start * r, y = c.end * r; m < y; )
                  for (b = 0; b < p; ++b, ++m)
                    c.buffer.data[m] = l[b];
                u = a[f] || [
                  null,
                  Number.MAX_SAFE_INTEGER,
                  Number.MIN_SAFE_INTEGER
                ], u[0] = c.attribute, u[1] = kr(c.start * r, u[1]), u[2] = Ur(c.end * r, u[2]), a[f] = u;
              }
          }
        }
    } else {
      for (c = o[this.bufferManager.getActiveAttributePropertyId()], d = c.attribute, f = d.packUID || d.uid, l = d.update(t), p = d.size || c.end - c.start, m = c.start * r, y = c.end * r; m < y; )
        for (b = 0; b < p; ++b, ++m)
          c.buffer.data[m] = l[b];
      u = a[f] || [
        null,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER
      ], u[0] = d, u[1] = kr(c.start * r, u[1]), u[2] = Ur(c.end * r, u[2]), a[f] = u;
    }
    t.reactivate = !1;
  }
  /**
   * This performs an update on the buffers with the intent the entire buffer is
   * going to update rather than a chunk of it.
   */
  updateInstanceFull(e, t, s, n) {
    const r = n.propertyToBufferLocation, o = this.bufferAttributeWillUpdate, a = this.layer.shaderIOInfo.instanceVertexCount;
    let c, l, u, h, d = 0, f, p, g, m, b, v, w;
    if (t.active) {
      for ((s.length === 0 || t.reactivate) && (s = this.bufferManager.getUpdateAllPropertyIdList()), f = 0, v = s.length; f < v; ++f)
        if (c = r[s[f]], !!c) {
          for (h = c.attribute, l = h.update(t), d = h.size || c.end - c.start, g = c.start * a, b = c.end * a; g < b; )
            for (m = 0; m < d; ++m, ++g)
              c.buffer.data[g] = l[m];
          if (o[h.packUID || h.uid] = h, c.childLocations) {
            for (u = c.childLocations, g = 0, b = u.length; g < b; ++g)
              if (c = u[g], !!c) {
                for (h = c.attribute, l = h.update(t), d = h.size || c.end - c.start, p = c.start * a, w = c.end * a; p < w; )
                  for (m = 0; m < d; ++m, ++p)
                    c.buffer.data[p] = l[m];
                o[h.packUID || h.uid] = h;
              }
          }
        }
    } else {
      for (c = r[this.bufferManager.getActiveAttributePropertyId()], h = c.attribute, d = h.size || c.end - c.start, l = h.update(t), p = c.start * a, w = c.end * a; p < w; )
        for (m = 0; m < d; ++m, ++p)
          c.buffer.data[p] = l[m];
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
      for (let t = 0, s = e.length; t < s; ++t) {
        const n = e[t], r = n[0].bufferAttribute;
        r.updateRange = {
          count: n[2] - n[1],
          offset: n[1]
        };
      }
    } else {
      const e = Object.values(this.bufferAttributeWillUpdate);
      for (let t = 0, s = e.length; t < s; ++t) {
        const n = e[t].bufferAttribute;
        n.updateRange = {
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
class jg {
  /**
   * This returns the proper diff processor for handling diffs
   */
  makeProcessor(e, t) {
    if (this.processing) return this.processing;
    if (e.bufferType === se.INSTANCE_ATTRIBUTE || e.bufferType === se.INSTANCE_ATTRIBUTE_PACKING ? this.processor = new Ug(e, t) : e.bufferType === se.VERTEX_ATTRIBUTE || e.bufferType === se.VERTEX_ATTRIBUTE_PACKING ? this.processor = new Wg(e, t) : this.processor = new zg(e, t), !this.processor)
      throw new Error("Failed to create a diff processor");
    return this.processing = [
      this.processor.changeInstance,
      this.processor.addInstance,
      this.processor.removeInstance
    ], this.processing;
  }
}
const { max: Hg } = Math, Ms = ve("performance");
class Xg extends fn {
  constructor(e, t) {
    super(e, t), this.allBufferLocations = {}, this.availableLocations = [], this.currentInstancedCount = 0, this.instanceToBufferLocation = {}, this.maxInstancedCount = 1e3, this.blockSubAttributesLookup = /* @__PURE__ */ new Map(), this.attributeToPropertyIds = /* @__PURE__ */ new Map(), this.updateAllPropertyIdList = [], this.activePropertyId = -1, this.currentAvailableLocation = -1, this.remove = (s) => {
      const n = this.instanceToBufferLocation[s.uid];
      return n && (delete this.instanceToBufferLocation[s.uid], this.availableLocations.push(n)), s;
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
    this.layer.shaderIOInfo.instanceAttributes.forEach((s) => {
      if (s.parentAttribute) return;
      Se.setObservableMonitor(!0), s.update(e);
      const n = Se.getObservableMonitorIds(!0);
      this.attributeToPropertyIds.set(s, [
        n[n.length - 1]
      ]), n.length > 1 && Ms(
        "Property has multiple observables. Only the last trigger will be retained as the feature is not complete yet"
      ), s === this.layer.shaderIOInfo.activeAttribute && (this.activePropertyId = n[0]);
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
      const s = this.resizeBuffer();
      this.gatherLocationsIntoGroups(
        s.newLocations,
        s.growth
      );
    }
    const t = this.availableLocations[++this.currentAvailableLocation];
    return t && this.geometry ? (this.instanceToBufferLocation[e.uid] = t, this.currentInstancedCount = this.geometry.maxInstancedCount = Hg(
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
    const s = /* @__PURE__ */ new Map();
    if (this.changeListContext) {
      t = this.layer.shaderIOInfo.baseBufferGrowthRate;
      for (let n = 0, r = this.changeListContext.length; n < r; ++n) {
        const o = this.changeListContext[n];
        switch (o[1]) {
          case me.CHANGE:
          case me.INSERT:
            this.instanceToBufferLocation[o[0].uid] || t++;
            break;
        }
      }
    }
    if (Ms("BEGIN: Resizing packed attribute buffer by %d instances", t), this.geometry) {
      Ms(
        `Info: Vertex packing buffer is being resized for layer ${this.layer.id}`
      ), this.geometry.destroy(), this.geometry = new zi();
      const n = this.maxInstancedCount;
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
          let u = c.data;
          u.length < this.maxInstancedCount * l && (u = new Float32Array(this.maxInstancedCount * l * 2), u.set(c.data, 0)), u.set(c.data, 0);
          const h = new ni(u, l, !0, !0);
          a.bufferAttribute = c = h, this.geometry.addAttribute(a.name, h);
          const d = this.blockSubAttributesLookup.get(r), f = a.size || 0;
          if (d)
            for (let p = 0, g = d.length; p < g; ++p) {
              const m = d[p];
              let b = s.get(
                m.name
              );
              b || (b = [], s.set(
                m.name,
                b
              ));
              const v = this.allBufferLocations[m.name] || [];
              this.allBufferLocations[m.name] = v;
              const w = Object.assign({}, m, {
                uid: P(),
                packUID: a.packUID,
                bufferAttribute: c
              }), E = m.blockIndex || 0, y = m.size || 1;
              let C;
              for (let z = 0, N = v.length; z < N; ++z)
                C = v[z], C.attribute = w, C.buffer.data = u;
              let M, R = b.length;
              const V = this.maxInstancedCount - n;
              b.length += V, v.length += V;
              for (let z = n; z < this.maxInstancedCount; ++z, ++R)
                M = {
                  attribute: w,
                  block: r,
                  buffer: {
                    data: u
                  },
                  instanceIndex: z,
                  start: z * f + E,
                  end: z * f + E + y
                }, b[R] = M, v[z] = M;
            }
        }
      }
    } else {
      this.maxInstancedCount += t, this.geometry = new zi();
      for (const o of e.vertexAttributes)
        o.materialAttribute && this.geometry.addAttribute(
          o.name,
          o.materialAttribute
        );
      this.attributes = [], this.blockAttributes = [];
      const n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
      this.blockSubAttributesLookup = r;
      for (let o = 0, a = e.instanceAttributes.length; o < a; ++o) {
        const c = e.instanceAttributes[o], l = c.block || 0;
        let u = n.get(l) || 0;
        u = Math.max(
          u,
          (c.blockIndex || 0) + (c.size || 0)
        ), n.set(l, u);
        let h = r.get(l);
        h || (h = [], r.set(l, h)), h.push(c);
      }
      r.forEach(
        (o) => o.sort((a, c) => (a.blockIndex || 0) - (c.blockIndex || 0))
      );
      for (let o = 0, a = n.size; o < a; ++o) {
        const c = n.get(o) || 0, l = P();
        c || console.warn(
          "Instance Attribute Packing Error: The system tried to build an attribute with a size of zero.",
          "These are the attributes used:",
          e.instanceAttributes,
          "These are the block sizes calculated",
          n,
          "This is the block to attribute lookup generated",
          r
        );
        const u = new Float32Array(c * this.maxInstancedCount), h = new ni(u, c, !0, !0);
        this.geometry.addAttribute(`block${o}`, h);
        const d = r.get(o);
        if (d) {
          for (let f = 0, p = d.length; f < p; ++f) {
            const g = d[f];
            let m = s.get(
              g.name
            );
            m || (m = [], s.set(
              g.name,
              m
            ));
            const b = this.allBufferLocations[g.name] || [];
            this.allBufferLocations[g.name] = b;
            const v = Object.assign({}, g, {
              uid: o,
              packUID: l,
              bufferAttribute: h,
              size: c
            }), w = g.blockIndex || 0, E = g.size || 1;
            for (let y = 0; y < this.maxInstancedCount; ++y) {
              const C = {
                attribute: v,
                block: o,
                buffer: {
                  data: u
                },
                instanceIndex: y,
                start: y * c + w,
                end: y * c + w + E
              };
              m.push(C), b.push(C);
            }
            this.attributes.push(v);
          }
          this.blockAttributes.push({
            uid: P(),
            packUID: l,
            bufferAttribute: h,
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
            n,
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
    return this.scene && this.model && this.scene.container && this.scene.container.remove(this.model), this.material = this.material || this.makeLayerMaterial(), this.model = dn(
      this.layer.id,
      this.geometry,
      this.material,
      this.layer.shaderIOInfo.drawMode
    ), this.scene && this.scene.container && this.model && this.scene.container.add(this.model), Ms("COMPLETE: Resizing unpacked attribute buffer"), {
      growth: t,
      newLocations: s
    };
  }
  /**
   * This takes newly created buffer locations and groups them by the property ids identified by the
   * registration phase.
   */
  gatherLocationsIntoGroups(e, t) {
    if (this.attributeToPropertyIds.size === 0) return;
    Ms("BEGIN: Packed attribute manager grouping new buffer locations");
    const s = [];
    this.attributeToPropertyIds.forEach((n, r) => {
      s.push({
        attribute: r,
        bufferLocationsForAttribute: e.get(r.name) || [],
        childBufferLocations: (r.childAttributes || []).map((o) => ({
          location: e.get(o.name) || [],
          bufferIndex: -1
        })),
        ids: n,
        bufferIndex: -1
      });
    });
    for (let n = 0; n < t; ++n) {
      const r = {
        instanceIndex: -1,
        propertyToBufferLocation: {}
      };
      for (let o = 0, a = s.length; o < a; ++o) {
        const c = s[o], l = c.attribute, u = c.ids, h = c.bufferLocationsForAttribute;
        if (!h) {
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
        const d = h[++c.bufferIndex];
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
            const m = l.childAttributes[p], b = c.childBufferLocations[p];
            if (b) {
              const v = b.location[++b.bufferIndex];
              v ? f.push(v) : Me(
                "Instance Attribute Child Attribute Error",
                (w, E) => {
                  console.warn(
                    `${E}: A child attribute does not have a buffer location available. Error count: ${w}`
                  ), console.warn(
                    `Parent Attribute: ${l.name} Child Attribute: ${m.name}`
                  );
                }
              );
            }
          }
          d.childLocations = f;
        }
        for (let f = 0, p = u.length; f < p; ++f) {
          const g = u[f];
          r.propertyToBufferLocation[g] = d;
        }
      }
      this.availableLocations.push(r);
    }
    Ms("COMPLETE: Packed attribute buffer manager buffer location grouping"), _r();
  }
  /**
   * Returns the total instances this buffer manages.
   */
  getInstanceCount() {
    return this.maxInstancedCount;
  }
}
class Qg {
  constructor(e) {
    this.isMouseOver = /* @__PURE__ */ new Set(), this.isMouseDown = /* @__PURE__ */ new Set(), this.isTouchOver = /* @__PURE__ */ new Map(), this.isTouchDown = /* @__PURE__ */ new Map(), this.layer = e;
  }
  /**
   * Retrieves the color picking instance determined for the procedure.
   */
  getColorPickInstance(e) {
    return this.colorPicking && this.layer.picking.type === X.SINGLE && this.colorPicking.view === e ? this.layer.uidToInstance.get(
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
  handleTouchOver(e, t, s) {
  }
  /**
   * Handles mouse down gestures for a layer within a view
   */
  handleMouseDown(e, t) {
    if (this.layer.picking && this.layer.picking.type !== X.NONE) {
      const { onMouseDown: s } = this.layer.props;
      if (s) {
        const n = e.projection.screenToWorld(
          t.screen.position
        ), r = [];
        if (this.layer.picking.type === X.SINGLE) {
          const a = this.getColorPickInstance(e);
          a && r.push(a);
        }
        const o = {
          interaction: t,
          instances: r,
          layer: this.layer.id,
          projection: e.projection,
          screen: t.screen.position,
          world: n
        };
        s(o), this.isMouseDown.clear(), r.forEach((a) => this.isMouseDown.add(a));
      }
    }
  }
  /**
   * Handles touch events for instances for layers
   */
  handleTouchDown(e, t, s) {
    const { onTouchDown: n, onTouchOver: r } = this.layer.props;
    if (!this.layer.picking || this.layer.picking.type === X.NONE || !n && !r)
      return;
    const o = e.projection.screenToWorld(s.screen.position), a = [];
    if (this.layer.picking.type === X.SINGLE) {
      const h = this.getColorPickInstance(e);
      h && a.push(h);
    }
    const c = {
      interaction: t,
      touch: s,
      instances: a,
      layer: this.layer.id,
      projection: e.projection,
      screen: s.screen.position,
      world: o
    }, l = hs(
      this.isTouchDown,
      s.touch.touch.identifier,
      () => /* @__PURE__ */ new Set()
    ), u = hs(
      this.isTouchOver,
      s.touch.touch.identifier,
      () => /* @__PURE__ */ new Set()
    );
    a.forEach((h) => {
      l.add(h), u.add(h);
    }), r && r(c), n && n(c);
  }
  /**
   * Handles mouse out events for a layer within the view
   */
  handleMouseOut(e, t) {
    if (this.layer.picking && this.layer.picking.type !== X.NONE) {
      const { onMouseOut: s } = this.layer.props;
      if (s) {
        const n = e.projection.screenToWorld(
          t.screen.position
        ), r = {
          interaction: t,
          instances: Array.from(this.isMouseOver.keys()),
          layer: this.layer.id,
          projection: e.projection,
          screen: t.screen.position,
          world: n
        };
        s(r);
      }
    }
    this.isMouseOver.clear();
  }
  /**
   * Handles touch events that have been dragged off of a view
   */
  handleTouchOut(e, t, s) {
    const { onTouchOut: n } = this.layer.props;
    if (!this.layer.picking || this.layer.picking.type === X.NONE || !n)
      return;
    const r = e.projection.screenToWorld(s.screen.position), o = {
      interaction: t,
      touch: s,
      instances: Array.from(this.isMouseOver.keys()),
      layer: this.layer.id,
      projection: e.projection,
      screen: s.screen.position,
      world: r
    };
    n(o), this.isTouchOver.delete(s.touch.touch.identifier);
  }
  /**
   * Handles mouse up gestures for the layer within the provided view
   */
  handleMouseUp(e, t) {
    const { onMouseUp: s, onMouseUpOutside: n } = this.layer.props;
    if (!this.layer.picking || this.layer.picking.type === X.NONE || !s)
      return;
    const r = e.projection.screenToWorld(t.screen.position), o = [];
    if (this.layer.picking.type === X.SINGLE) {
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
    s(a), o.forEach((c) => this.isMouseDown.delete(c)), !(this.isMouseDown.size <= 0 || !n) && (a = {
      interaction: t,
      instances: Array.from(this.isMouseDown.values()),
      layer: this.layer.id,
      projection: e.projection,
      screen: t.screen.position,
      world: r
    }, n(a));
  }
  /**
   * Handles touch up events that occur over a view
   */
  handleTouchUp(e, t, s) {
    const { onTouchUp: n, onTouchUpOutside: r, onTouchOut: o, onTouchAllEnd: a } = this.layer.props;
    if (!this.layer.picking || this.layer.picking.type === X.NONE || !n && !r && !o && !a)
      return;
    const c = e.projection.screenToWorld(s.screen.position), l = [];
    if (this.layer.picking.type === X.SINGLE) {
      const d = this.getColorPickInstance(e);
      d && l.push(d);
    }
    let u = {
      interaction: t,
      touch: s,
      instances: l,
      layer: this.layer.id,
      projection: e.projection,
      screen: s.screen.position,
      world: c
    };
    o && o(u), n && n(u);
    const h = Jr(
      this.isTouchDown,
      s.touch.touch.identifier,
      /* @__PURE__ */ new Set()
    );
    l.forEach((d) => h.delete(d)), h.size > 0 && r && (u = {
      interaction: t,
      touch: s,
      instances: Array.from(h.values()),
      layer: this.layer.id,
      projection: e.projection,
      screen: s.screen.position,
      world: c
    }, r(u)), this.isTouchDown.delete(s.touch.touch.identifier), this.isTouchDown.size <= 0 && a && (u = {
      interaction: t,
      touch: s,
      instances: [],
      layer: this.layer.id,
      projection: e.projection,
      screen: s.screen.position,
      world: c
    }, a(u));
  }
  /**
   * Mouse move events on the layer will detect when instances have their item
   * newly over or just moved on
   */
  handleMouseMove(e, t) {
    const { onMouseOver: s, onMouseMove: n, onMouseOut: r } = this.layer.props;
    if (this.layer.picking && this.layer.picking.type !== X.NONE && (s || n || r)) {
      let o;
      const a = e.projection.screenToWorld(
        t.screen.position
      ), c = [];
      if (this.layer.picking.type === X.SINGLE) {
        const u = this.getColorPickInstance(e);
        u && c.push(u);
      }
      const l = /* @__PURE__ */ new Set();
      if (c.forEach((u) => l.add(u)), r) {
        const u = [];
        this.isMouseOver.forEach((h) => {
          l.has(h) || u.push(h);
        }), o = {
          interaction: t,
          instances: u,
          layer: this.layer.id,
          projection: e.projection,
          screen: t.screen.position,
          world: a
        }, u.length > 0 && r(o);
      }
      if (s) {
        const u = c.filter(
          (h) => !this.isMouseOver.has(h)
        );
        o = {
          interaction: t,
          instances: u,
          layer: this.layer.id,
          projection: e.projection,
          screen: t.screen.position,
          world: a
        }, u.length > 0 && s(o);
      }
      n && (o = {
        interaction: t,
        instances: c,
        layer: this.layer.id,
        projection: e.projection,
        screen: t.screen.position,
        world: a
      }, n(o)), this.isMouseOver = l;
    }
  }
  /**
   * Handles touches that are moving along the screen
   */
  handleTouchMove(e, t, s) {
    const { onTouchOver: n, onTouchMove: r, onTouchOut: o } = this.layer.props;
    if (this.layer.picking && this.layer.picking.type !== X.NONE && (n || r || o)) {
      let a;
      const c = e.projection.screenToWorld(s.screen.position), l = [];
      if (this.layer.picking.type === X.SINGLE) {
        const d = this.getColorPickInstance(e);
        d && l.push(d);
      }
      const u = Jr(
        this.isTouchOver,
        s.touch.touch.identifier,
        /* @__PURE__ */ new Set()
      ), h = /* @__PURE__ */ new Set();
      if (l.forEach((d) => h.add(d)), o) {
        const d = [];
        u.forEach((f) => {
          h.has(f) || d.push(f);
        }), a = {
          interaction: t,
          touch: s,
          instances: d,
          layer: this.layer.id,
          projection: e.projection,
          screen: s.screen.position,
          world: c
        }, d.length > 0 && o(a);
      }
      if (n) {
        const d = l.filter((f) => !u.has(f));
        a = {
          interaction: t,
          touch: s,
          instances: d,
          layer: this.layer.id,
          projection: e.projection,
          screen: s.screen.position,
          world: c
        }, d.length > 0 && n(a);
      }
      r && (a = {
        interaction: t,
        touch: s,
        instances: l,
        layer: this.layer.id,
        projection: e.projection,
        screen: s.screen.position,
        world: c
      }, r(a)), this.isMouseOver = h;
    }
  }
  /**
   * Handles click gestures on the layer within a view
   */
  handleMouseClick(e, t) {
    if (this.layer.picking && this.layer.picking.type !== X.NONE) {
      const { onMouseClick: s } = this.layer.props;
      if (s) {
        const n = e.projection.screenToWorld(
          t.screen.position
        ), r = [];
        if (this.layer.picking.type === X.SINGLE) {
          const a = this.getColorPickInstance(e);
          a && r.push(a);
        }
        const o = {
          interaction: t,
          instances: r,
          layer: this.layer.id,
          projection: e.projection,
          screen: t.screen.position,
          world: n
        };
        s(o);
      }
    }
  }
  /**
   * Handles tap interactions with the view
   */
  handleTap(e, t, s) {
    if (this.layer.picking && this.layer.picking.type !== X.NONE) {
      const { onTap: n } = this.layer.props;
      if (n) {
        const r = e.projection.screenToWorld(s.screen.position), o = [];
        if (this.layer.picking.type === X.SINGLE) {
          const c = this.getColorPickInstance(e);
          c && o.push(c);
        }
        const a = {
          interaction: t,
          touch: s,
          instances: o,
          layer: this.layer.id,
          projection: e.projection,
          screen: s.screen.position,
          world: r
        };
        n(a);
      }
    }
  }
  /**
   * Handles drag gestures for the layer within the view
   */
  handleMouseDrag(e, t) {
  }
}
const zr = ve("performance"), lr = class lr extends fs {
  constructor(e, t, s) {
    super(s), this.animationEndTime = 0, this.alwaysDraw = !1, this.depth = 0, this._easingManager = {
      easingComplete: new Ue(),
      complete: () => this._easingManager.easingComplete.promise
    }, this.lastFrameTime = 0, this.needsViewDrawn = !1, this.picking = {
      currentPickMode: X.NONE,
      type: X.SINGLE,
      uidToInstance: /* @__PURE__ */ new Map()
    }, this.resource = Kp, this.shaderIOInfo = {}, this.streamChanges = {
      locked: !1,
      streamIndex: 0
    }, this._uid = P(), this.uidToInstance = /* @__PURE__ */ new Map(), this.willRebuildLayer = !1, this.surface = e, this.scene = t, this.props = Object.assign({}, lr.defaultProps || {}, s);
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
    return this._bufferType || se.INSTANCE_ATTRIBUTE;
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
      return this.picking && (this.picking.type = X.NONE), zr(
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
      ne
    ), e.vertexAttributes = (e.vertexAttributes || []).filter(
      ne
    ), e.uniforms = (e.uniforms || []).filter(ne);
  }
  /**
   * When the layer declares it's shader intiialization, it can specify multiple
   * fragment shader fragments each with their own output target type. We do NOT
   * allow two fragments to point to the same type. This performs a thorough
   * check to ensure that does not happen.
   */
  checkForDuplicateOutputTypes(e) {
    let { mapOutput: t } = this.props;
    kt(e.fs) && (e.fs = [
      {
        outputType: G.COLOR,
        source: e.fs
      }
    ]), t = t || {};
    const s = /* @__PURE__ */ new Set();
    let n = !1, r = Number.MIN_SAFE_INTEGER;
    for (let o = 0, a = e.fs.length; o < a; ++o) {
      const c = e.fs[o], l = t[c.outputType];
      if (l === void 0) {
        s.has(c.outputType) && (n = !0), s.add(c.outputType);
        continue;
      }
      l === G.NONE ? c.outputType = r++ : c.outputType = l, s.has(c.outputType) && (n = !0), s.add(c.outputType);
    }
    if (n)
      return console.warn("Layer has duplicate fragment shader output types"), !1;
  }
  /**
   * Processes the fragment outputs a layer provides against each view and
   * generates a merged fragment shader with those fragments optimized for each
   * view.
   */
  processFragmentShadersForEachView(e, t) {
    kt(e.fs) && (e.fs = [
      {
        outputType: G.COLOR,
        source: e.fs
      }
    ]);
    const s = this.props.fs;
    if (s)
      if (kt(s)) {
        const c = s;
        e.fs.map((l) => (l.outputType === G.COLOR && (l.source = c), l));
      } else
        for (let c = 0, l = s.length; c < l; ++c) {
          const { outputType: u, source: h } = s[c], d = e.fs.findIndex(
            (f) => f.outputType === u
          );
          d > -1 ? e.fs[d] = { outputType: u, source: h } : e.fs.push({ outputType: u, source: h });
        }
    const n = this.picking.type === X.SINGLE && !e.fs.find(
      (c) => c.outputType === G.PICKING
    );
    if (this.picking.type === X.SINGLE && !n)
      throw new Error(
        "Do NOT specify picking prop on a layer when you have your own Picking output declared."
      );
    const r = {
      outputType: G.PICKING,
      source: Zp
    }, o = /* @__PURE__ */ new Map(), a = {
      fs: /* @__PURE__ */ new Map(),
      vs: /* @__PURE__ */ new Map(),
      destructure: /* @__PURE__ */ new Map()
    };
    for (let c = 0, l = t.length; c < l; ++c) {
      const u = t[c];
      if (n) {
        const g = e.fs.findIndex(
          (m) => m.outputType === G.PICKING
        );
        g > -1 && e.fs.splice(g, 1);
      }
      const h = u.getOutputTargets();
      let d = 0;
      e.fs.forEach((g, m) => {
        h != null && h.find(
          (b) => b.outputType === g.outputType
        ) && (d = m);
      }), n && e.fs.splice(d + 1, 0, r);
      let f = hs(a.fs, u, /* @__PURE__ */ new Map());
      f || (f = /* @__PURE__ */ new Map(), a.fs.set(u, f));
      const p = ac.makeOutputFragmentShader(
        a.vs,
        f,
        h,
        e.fs
      );
      p && o.set(u, p);
    }
    return o.size === 0 ? (console.warn(
      "Could not generate output fragment shaders for the view specified."
    ), !1) : { outputFragmentShaders: o, declarations: a };
  }
  /**
   * This performs the actual generation of the vertex and fragment shaders this
   * layer will use. Each fragment shader is now associated with it's respective
   * view and will be generated accordingly.
   */
  processLayerShaders(e, t, s) {
    let n = null;
    if (n = new ac().process(
      this,
      e,
      t,
      s,
      this.surface.getIOExpanders(),
      this.surface.getShaderTransforms(),
      this.surface.getIOSorting()
    ), !n)
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
        instanceAttributes: n.instanceAttributes,
        instanceVertexCount: e.vertexCount,
        vs: n.vs,
        fs: n.fs,
        materialUniforms: n.materialUniforms,
        maxInstancesPerBuffer: n.maxInstancesPerBuffer,
        drawMode: e.drawMode || x.Model.DrawMode.TRIANGLE_STRIP,
        uniforms: n.uniforms,
        vertexAttributes: n.vertexAttributes,
        indexBuffer: n.indexBuffer
      },
      this.shaderIOInfo
    );
  }
  /**
   * Processes the static vertex information and applies GL Attributes for each
   * item.
   */
  processVertexAttributes(e) {
    Ig(
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
    const { picking: t = X.NONE } = this.props;
    t === X.SINGLE ? this.picking = {
      currentPickMode: X.NONE,
      type: X.SINGLE,
      uidToInstance: /* @__PURE__ */ new Map()
    } : this.picking = {
      currentPickMode: X.NONE,
      type: X.NONE
    }, this.resource = this.surface.resourceManager;
    const s = this.initShader();
    this.interactions = new Qg(this);
    const n = this.validateShaderIO(s);
    if (n !== void 0) return n;
    if (!s) return !1;
    let r;
    return this.surface.getShaderTransforms().forEach((a) => {
      s.vs = a.rawVertex(s.vs), s.fs = a.rawFragment(s.fs);
    }), r = this.cleanShaderIOElements(s), Yi(r) || (r = this.checkForDuplicateOutputTypes(s), Yi(r)) || (r = this.processFragmentShadersForEachView(s, e), Yi(r)) || (r = this.processLayerShaders(
      s,
      r.outputFragmentShaders,
      r.declarations
    ), Yi(r)) || (r = this.processVertexAttributes(s), Yi(r)) || (r = this.makeLayerBufferManager(this.surface.gl, this.scene, s), Yi(r)) || (r = this.updateDiffHandlers(), Yi(r)) ? r : (this.layerShaderDebugging(), this.props.ref && (this.props.ref.easing = this.easingManager), this.props.data.sync(), !0);
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
    const t = [], s = [];
    return t.push("instancing"), this.picking.type === X.SINGLE && t.push("picking"), (e.instanceAttributes || []).find(
      (r) => !!(r && r.easing)
    ) && t.push("frame"), {
      fs: s,
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
    let t, s, n;
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
      t = e[c], s = t[0], n = this.bufferManager.getBufferLocations(s), o == null || o[t[1]](
        a,
        s,
        Object.values(t[2]),
        n
      ), s.changes = {};
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
        this._easingManager.easingComplete = new Ue(), oi(() => {
          e.resolve();
        }, this.animationEndTime - this.surface.frameMetrics.currentTime);
      }
    } else {
      const e = this._easingManager.easingComplete;
      this._easingManager.easingComplete = new Ue(), oi(() => {
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
        strategy: Wr.LINEAR
      }
    } = this.props, { stream: s = [], streamIndex: n } = this.streamChanges;
    switch (t.count === void 0 && (t.count = 1e4), t.count <= 0 && (t.count = Number.MAX_SAFE_INTEGER), t.strategy) {
      // Linear just pulls out changes as they came in
      case Wr.LINEAR:
      default: {
        e = s.slice(n, n + t.count), this.streamChanges.streamIndex += t.count;
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
    const s = {};
    for (let n = 0, r = t.length; n < r; ++n) {
      Se.setObservableMonitor(!0), e[t[n]];
      const o = Se.getObservableMonitorIds(!0);
      o[0] !== void 0 && (s[t[n]] = o[0]);
    }
    return Se.setObservableMonitor(!1), s;
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
    return ne(this.bufferManager) && this.bufferManager.managesInstance(e);
  }
  /**
   * This method determines the buffering strategy that the layer should be
   * utilizing based on provided vertex and instance attributes.
   */
  getLayerBufferType(e, t, s, n) {
    let r = se.UNIFORM, o = 0;
    if (this._bufferType !== void 0)
      return this._bufferType;
    if (O.HARDWARE_INSTANCING) {
      for (let a = 0, c = s.length; a < c; ++a) {
        const l = s[a];
        o += Math.ceil(l.size / 4);
      }
      for (let a = 0, c = n.length; a < c; ++a) {
        const l = n[a];
        o += Math.ceil(
          nh[l.size || 1] / 4
        );
      }
      if (o > O.MAX_VERTEX_ATTRIBUTES) {
        o = 0;
        for (let a = 0, c = n.length; a < c; ++a) {
          const l = n[a];
          o = Math.max(o, l.block || 0);
        }
        for (let a = 0, c = s.length; a < c; ++a) {
          const l = s[a];
          o += Math.ceil(l.size / 4);
        }
        o < O.MAX_VERTEX_ATTRIBUTES && (r = t.instancing === !1 ? se.VERTEX_ATTRIBUTE_PACKING : se.INSTANCE_ATTRIBUTE_PACKING, zr(
          `Performance Issue (Moderate):
            Layer %o is utilizing too many vertex attributes and is now using vertex packing.
            Max Vertex units %o
            Used Vertex units %o
            Instance Attributes %o
            Vertex Attributes %o`,
          this.id,
          O.MAX_VERTEX_ATTRIBUTES,
          o,
          n,
          s
        ));
      } else
        r = t.instancing === !1 ? se.VERTEX_ATTRIBUTE : se.INSTANCE_ATTRIBUTE;
    }
    return r === se.UNIFORM && (zr(
      `Performance Issue (High):
        Layer %o is utilizing too many vertex attributes and is now using a uniform buffer.
        Max Vertex units %o
        Used Vertex units %o
        Instance Attributes %o
        Vertex Attributes %o`,
      this.id,
      O.MAX_VERTEX_ATTRIBUTES,
      o,
      n,
      s
    ), r = se.UNIFORM), this.setBufferType(r), r;
  }
  /**
   * This generates the buffer manager to be used to manage instances getting
   * applied to attribute locations.
   */
  makeLayerBufferManager(e, t, s) {
    switch (this.getLayerBufferType(
      e,
      s,
      this.shaderIOInfo.vertexAttributes,
      this.shaderIOInfo.instanceAttributes
    )) {
      case se.INSTANCE_ATTRIBUTE: {
        this.setBufferManager(new Bg(this, t));
        break;
      }
      case se.INSTANCE_ATTRIBUTE_PACKING: {
        this.setBufferManager(
          new Fg(this, t)
        );
        break;
      }
      case se.VERTEX_ATTRIBUTE: {
        this.setBufferManager(new $g(this, t));
        break;
      }
      case se.VERTEX_ATTRIBUTE_PACKING: {
        this.setBufferManager(
          new Xg(this, t)
        );
        break;
      }
      // Anything not utiliziing a specialized buffering strategy will use the
      // uniform compatibility mode
      default: {
        this.setBufferManager(new kg(this, t));
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
    ) ? this.picking.type === X.SINGLE ? (this.onDiffAdd = this.handleDiffAddWithPickingAndEasing, this.onDiffRemove = this.handleDiffRemoveWithPickingAndEasing) : (this.onDiffAdd = this.handleDiffAddWithEasing, this.onDiffRemove = this.handleDiffRemoveWithEasing) : this.picking.type === X.SINGLE && (this.onDiffAdd = this.handleDiffAddWithPicking, this.onDiffRemove = this.handleDiffRemoveWithPicking);
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
    for (let s = 0, n = t.length; s < n; ++s)
      t[s][0].changes = {};
    return t;
  }
  /**
   * Applies a buffer manager to the layer which handles instance changes and
   * applies those changes to an appropriate buffer at the appropriate location.
   */
  setBufferManager(e) {
    this._bufferManager ? console.warn(
      "You can not change a layer's buffer strategy once it has been instantiated."
    ) : (this._bufferManager = e, this.diffManager = new jg(), this.diffManager.makeProcessor(this, e));
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
    for (const s in t)
      if (t[s] !== e[s]) return !0;
    return !1;
  }
  /**
   * This triggers the layer to update the material uniforms that have been
   * created for the layer. This is primarily used internally.
   */
  updateUniforms() {
    let e, t;
    for (let s = 0, n = this.shaderIOInfo.uniforms.length; s < n; ++s)
      e = this.shaderIOInfo.uniforms[s], t = e.update(e), e.materialUniforms.forEach(
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
lr.defaultProps = {};
let zt = lr;
const Gr = ve("performance"), ra = class ra extends fs {
  constructor(e, t) {
    super(t), this.container = new jr(), this._renderViewCache = null, this.surface = e, this.init(t);
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
    var n;
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
    const t = [], s = ((n = this.surface) == null ? void 0 : n.frameMetrics.currentFrame) ?? 0;
    return e.forEach((r) => {
      t.push(r[s % r.length]);
    }), this._renderViewCache = t, t;
  }
  /**
   * Initialize all that needs to be initialized
   */
  init(e) {
    if (!this.surface || !this.surface.gl) return;
    this.container = new jr();
    const t = Rg(this.surface.gl);
    this.layerDiffs = new nr({
      buildItem: async (s) => {
        if (Gr("Building layer", s.key), !this.surface) return null;
        const n = s.init[0], r = s.init[1], o = new n(
          this.surface,
          this,
          Object.assign({}, n.defaultProps, r)
        );
        if (o.initializer = s, o.props.data.sync(), o.parent = r.parent, r.parent && (r.parent.children ? r.parent.children.push(o) : r.parent.children = [o]), !o.init(this.views))
          return console.warn(
            "Error initializing layer:",
            r.key,
            "A layer was unable to be added to the surface. See previous warnings (if any) to determine why they could not be instantiated"
          ), null;
        const a = o.childLayers();
        return this.layerDiffs.inline(a), o;
      },
      destroyItem: async (s, n) => (Gr("Destroying layer", s.key), n.destroy(), !0),
      updateItem: async (s, n) => {
        const r = s.init[1];
        if (n.willUpdateProps(r), r.data !== n.props.data && r.data.sync(), n.shouldDrawView(n.props, r) && (n.needsViewDrawn = !0), Object.assign(n.props, r), n.initializer.init[1] = n.props, n.didUpdateProps(), r.parent && n.parent && n.parent !== r.parent) {
          const o = n.parent.children || [], a = o.indexOf(n) || -1;
          a > -1 && o.splice(a, 1);
        }
        n.parent = r.parent, n.willRebuildLayer ? (this.layerDiffs.rebuild(), n.willRebuildLayer = !1) : this.layerDiffs.inline(n.childLayers());
      }
    }), this.viewDiffs = new nr({
      buildItem: async (s) => {
        if (this._renderViewCache = null, !this.surface) return null;
        const n = s.init[1], r = s.init[0];
        n.key = s.key;
        const o = new r(this, n);
        o.props = Object.assign({}, n), o.props.camera = o.props.camera || t.camera, o.pixelRatio = this.surface.pixelRatio, o.resource = this.surface.resourceManager, this.surface.userInputManager.waitingForRender = !0;
        const a = s.init[1].chain;
        if (a) {
          const c = a.map((l, u) => ({
            key: `${n.key}-chain-${u}`,
            init: [
              r,
              {
                ...n,
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
      // Make sure the view cleans up it's render targets and related resources.
      destroyItem: async (s, n) => (Gr("Destroying view", n.id), n.destroy(), !0),
      // Hand off the initializer to the update of the view
      updateItem: async (s, n) => {
        this._renderViewCache = null;
        const r = s.init[1], o = s.init[0];
        n.willUpdateProps(r), n.previousProps = n.props, n.props = Object.assign({}, n.props, r), n.didUpdateProps(), this.surface && (this.surface.userInputManager.waitingForRender = !0);
        const a = s.init[1].chain;
        if (a) {
          const c = a.map((l, u) => ({
            key: `${r.key}-chain-${u}`,
            init: [
              o,
              {
                ...r,
                ...l,
                parent: n,
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
ra.DEFAULT_SCENE_ID = "__default__";
let or = ra;
var $n = /* @__PURE__ */ ((i) => (i[i.COLOR = 1] = "COLOR", i[i.DEPTH = 2] = "DEPTH", i[i.STENCIL = 4] = "STENCIL", i))($n || {}), Wn = /* @__PURE__ */ ((i) => (i[i.FRAME_COUNT = 0] = "FRAME_COUNT", i[i.FRAME_SKIP = 1] = "FRAME_SKIP", i[i.UP_TO_TIMESTAMP_INCLUSIVE = 2] = "UP_TO_TIMESTAMP_INCLUSIVE", i[i.UP_TO_TIMESTAMP_EXCLUSIVE = 3] = "UP_TO_TIMESTAMP_EXCLUSIVE", i[i.ON_PROPS_CHANGE = 4] = "ON_PROPS_CHANGE", i[i.ON_TRIGGER = 5] = "ON_TRIGGER", i[i.ALWAYS = 6] = "ALWAYS", i[i.NEVER = 7] = "NEVER", i))(Wn || {});
function Su(i, e) {
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
const ur = class ur extends fs {
  constructor(e, t) {
    super(t), this.animationEndTime = 0, this.depth = 0, this.lastFrameTime = 0, this.needsDraw = !1, this.optimizeRendering = !1, this._pixelRatio = 1, this.drawModeInfo = {
      startFrame: 0,
      toFrame: 0,
      tillTimestamp: 0
    }, this.scene = e, this.props = Object.assign({}, ur.defaultProps || {}, t);
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
    return e ? (Pi(e.buffers) || sn(e.buffers) ? t = [
      {
        outputType: G.COLOR,
        resource: e.buffers
      }
    ] : Object.keys(e.buffers).forEach((s) => {
      const n = Number.parseFloat(s), r = e.buffers[n];
      r && t.push({
        outputType: n,
        resource: r
      });
    }), t) : null;
  }
  /**
   * Retrieves this view's targets for blitting the outputs of the view to blit
   * buffer targets.
   */
  getBlitOutputTargets() {
    const { output: e } = this.props;
    let t = [];
    if (!e) return null;
    const s = e.blit;
    if (!s) return null;
    const n = s.color;
    return n ? (Pi(n) || sn(n) ? t = [
      {
        outputType: G.COLOR,
        resource: n
      }
    ] : Object.keys(n).forEach((r) => {
      const o = Number.parseFloat(r), a = n[o];
      a && t.push({
        outputType: o,
        resource: a
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
  requestBufferResources(e, t, s, n, r, o) {
    const a = /* @__PURE__ */ new Map();
    for (let c = 0, l = e.length; c < l; ++c) {
      const u = e[c], h = u.resource;
      if (t.has(u.outputType))
        if (Pi(h)) {
          const d = nn({
            key: u.resource.key
          });
          if (this.resource.request(s, n, d), !d.texture)
            return r(u), a;
          a.set(u.outputType, d.texture);
        } else {
          const d = Xr({
            key: u.resource.key
          });
          if (this.resource.request(s, n, d), !d.colorBuffer)
            return o(u), a;
          a.set(u.outputType, d.colorBuffer);
        }
    }
    return a;
  }
  /**
   * This generates the render target needed to handle the output configuration
   * specified by the props and the layer configuration.
   *
   * This is called by the system and should never need to be called externally.
   */
  createRenderTarget() {
    var f, p;
    this.renderTarget && (Array.isArray(this.renderTarget) ? this.renderTarget.forEach((g) => g.dispose()) : this.renderTarget.dispose());
    const { output: e } = this.props, t = this.scene.surface;
    if (!e || !t) return;
    const s = /* @__PURE__ */ new Set();
    for (let g = 0, m = this.scene.layers.length; g < m; ++g) {
      const v = (f = this.scene.layers[g].shaderIOInfo.fs) == null ? void 0 : f.get(this);
      v && v.outputTypes.forEach(
        (w) => s.add(w)
      );
    }
    const n = new zt(t, this.scene, {
      key: "",
      data: new ae()
    }), r = new dt({}), o = this.getOutputTargets() || [], a = this.requestBufferResources(
      o,
      s,
      n,
      r,
      (g) => {
        throw console.warn(
          "A view has a RenderTexture output target with key:",
          g.resource.key,
          "however, no RenderTexture was found for the key.",
          "Please ensure you have a 'resource' specified for the Surface with the proper key",
          "Also ensure the resource is made via createTexture()"
        ), new Error(
          `Output target unable to be constructed for view ${this.id}`
        );
      },
      (g) => {
        throw console.warn(
          "A view has a ColorBuffer output target with key:",
          g.resource.key,
          "however, no ColorBuffer was found for the key.",
          "Please ensure you have a 'resource' specified for the Surface with the proper key"
        ), new Error(
          `Output target unable to be constructed for view ${this.id}`
        );
      }
    );
    let c, l;
    a == null || a.forEach((g) => {
      var m, b, v;
      if (g instanceof W) {
        if ((c === void 0 || l === void 0) && (c = ((m = g.data) == null ? void 0 : m.width) || 0, l = ((b = g.data) == null ? void 0 : b.height) || 0), c === 0 || l === 0)
          throw new Error(
            "RenderTexture for View can NOT have a width or height of zero."
          );
        if (((v = g.data) == null ? void 0 : v.width) !== c || g.data.height !== l)
          throw new Error(
            "When a view has multiple output targets: ALL RenderTextures and ColorBuffers that a view references MUST have the same dimensions"
          );
      } else {
        if ((c === void 0 || l === void 0) && (c = g.size[0] || 0, l = g.size[1] || 0), c === 0 || l === 0)
          throw new Error(
            "RenderTexture for View can NOT have a width or height of zero."
          );
        if (g.size[0] !== c || g.size[1] !== l)
          throw new Error(
            "When a view has multiple output targets: ALL RenderTextures and ColorBuffers that a view references MUST have the same dimensions"
          );
      }
    });
    let u;
    if (e.depth)
      if (Pi(e.depth)) {
        const g = nn({
          key: e.depth.key
        });
        if (this.resource.request(n, r, g), !g.texture)
          throw console.warn(
            "A view has a depth buffer output target with key:",
            e.depth,
            "however, no RenderTexture was found for the key.",
            "Please ensure you have a 'resource' specified for the Surface with the proper key",
            "Also ensure the resource is made via createTexture()"
          ), new Error(
            `Output target unable to be constructed for view ${this.id}`
          );
        u = g.texture;
      } else if (sn(e.depth)) {
        const g = Xr({
          key: e.depth.key
        });
        if (this.resource.request(n, r, g), !g.colorBuffer)
          throw console.warn(
            "A view has a depth buffer output target with key:",
            e.depth.key,
            "however, no ColorBuffer was found for the key.",
            "Please ensure you have a 'resource' specified for the Surface with the proper key",
            "Also ensure the resource is made via createColorBuffer()"
          ), new Error(
            `Output target unable to be constructed for view ${this.id}`
          );
        u = g.colorBuffer;
      } else
        u = x.RenderTarget.DepthBufferFormat.DEPTH_COMPONENT16;
    const h = {};
    let d = /* @__PURE__ */ new Map();
    if ((p = this.props.output) != null && p.blit) {
      const g = this.getBlitOutputTargets() || [];
      if (d = this.requestBufferResources(
        g,
        s,
        n,
        r,
        (m) => {
          throw console.warn(
            "A view has a RenderTexture output blit target with key:",
            m.resource.key,
            "however, no RenderTexture was found for the key.",
            "Please ensure you have a 'resource' specified for the Surface with the proper key"
          ), new Error(
            `Output target unable to be constructed for view ${this.id}`
          );
        },
        (m) => {
          throw console.warn(
            "A view has a ColorBuffer output blit target with key:",
            m.resource.key,
            "however, no ColorBuffer was found for the key.",
            "Please ensure you have a 'resource' specified for the Surface with the proper key"
          ), new Error(
            `Output target unable to be constructed for view ${this.id}`
          );
        }
      ), this.props.output.blit.depth) {
        const m = nn({
          key: this.props.output.blit.depth.key
        });
        if (this.resource.request(n, r, m), !m.texture)
          throw console.warn(
            "A view has a blit depth target with key:",
            this.props.output.blit.depth.key,
            "however, no RenderTexture was found for the key."
          ), new Error(
            `Output target unable to be constructed for view ${this.id}`
          );
        h.depth = m.texture;
      }
    }
    if (O.MRT) {
      const g = [];
      a.forEach(
        (b, v) => g.push({
          buffer: b,
          outputType: v
        })
      );
      const m = [];
      d.forEach(
        (b, v) => m.push({
          buffer: b,
          outputType: v
        })
      ), this.renderTarget = new is({
        buffers: {
          color: g,
          depth: u,
          blit: m.length > 0 || h.depth ? {
            color: m.length > 0 ? m : void 0,
            depth: h.depth ? h.depth : void 0
          } : void 0
        },
        // Render target texture retention is governed by the resource set up
        // on the surface
        retainTextureTargets: !0
      });
    } else
      throw new Error("MRT for non-MRT systems not supported yet.");
  }
  /**
   * Clean out the render targets we created
   */
  destroy() {
    this.renderTarget && (Array.isArray(this.renderTarget) ? this.renderTarget.forEach((e) => e.dispose()) : this.renderTarget.dispose());
  }
  /**
   * This let's the view do anything it needs to be ready for next render. Some
   * tasks this may include is checking if it's render target is still valid.
   * It's buffer outputs can get invalidated for any number of reasons.
   */
  willUseView() {
    const e = this.getRenderTargets();
    this.props.screenScale && (this.projection.screenScale = this.props.screenScale), e.some(
      (s) => s.getBuffers().some((n) => !!n.buffer.destroyed)
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
    var a, c, l, u, h, d, f, p, g, m, b, v;
    let t = !1;
    const s = this.props, n = this.previousProps ?? this.props, r = !this.previousProps || ((a = s.drawMode) == null ? void 0 : a.mode) !== ((c = n.drawMode) == null ? void 0 : c.mode) || ((l = s.drawMode) == null ? void 0 : l.value) !== ((u = n.drawMode) == null ? void 0 : u.value) || ((h = s.drawMode) == null ? void 0 : h.trigger) !== ((d = n.drawMode) == null ? void 0 : d.trigger), o = ((f = s.drawMode) == null ? void 0 : f.mode) ?? 6;
    if (r)
      switch (o) {
        case 0:
          this.drawModeInfo.toFrame = e.currentFrame + (((p = s.drawMode) == null ? void 0 : p.value) || 0);
          break;
        case 1:
          this.drawModeInfo.startFrame = e.currentFrame;
          break;
        case 2:
        case 3:
          this.drawModeInfo.tillTimestamp = ((g = s.drawMode) == null ? void 0 : g.value) || 0;
          break;
      }
    switch (o) {
      case 0:
        t = e.currentFrame <= this.drawModeInfo.toFrame;
        break;
      case 1:
        t = (e.currentFrame - this.drawModeInfo.startFrame) % (((m = s.drawMode) == null ? void 0 : m.value) || 1) === 0;
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
        t = ((v = (b = s.drawMode) == null ? void 0 : b.trigger) == null ? void 0 : v.call(b, e)) ?? !1;
        break;
      case 4:
        for (const w in s)
          if (s[w] !== n[w]) {
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
ur.defaultProps = {
  key: "",
  camera: $i.makeOrthographic(),
  viewport: { left: 0, right: 0, top: 0, bottom: 0 }
};
let cn = ur;
class Yg extends cn {
  constructor() {
    super(new or(void 0, { key: "error", layers: [], views: [] }), {
      key: "error",
      viewport: {},
      camera: $i.makeOrthographic()
    }), this.projection = new Qh(), this.screenBounds = new J({
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
const qg = 1e3, Kg = 200, Yt = new Yg();
Yt.fitViewtoViewport(
  new J({ x: 0, y: 0, width: 100, height: 100 }),
  new J({ x: 0, y: 0, width: 100, height: 100 })
);
function Zg(i, e) {
  return e.d && i.d ? e.d.depth - i.d.depth : 0;
}
function Vr(i, e) {
  return i.touch.identifier - e.touch.identifier;
}
class Jg {
  constructor(e, t, s, n) {
    this.eventManagers = [], this.eventCleanup = [], this._waitingForRender = !0, this.getViewsUnderPosition = (r) => {
      if (!this.quadTree) return [];
      const o = this.quadTree.query(r);
      return o.sort(Zg), o;
    }, this.resize = () => {
      this._waitingForRender = !0;
    }, this.context = e, this.surface = t, this.setControllers(s), this.addContextListeners(n);
  }
  get waitingForRender() {
    return this._waitingForRender;
  }
  set waitingForRender(e) {
    if (this._waitingForRender = e, !e) {
      this.quadTree = new Tp(0, 0, 0, 0);
      const t = this.scenes, s = [];
      for (let n = 0, r = t.length; n < r; ++n) {
        const o = t[n];
        for (let a = 0, c = o.views.length; a < c; ++a) {
          const l = o.views[a];
          s.push(l.screenBounds);
        }
      }
      this.quadTree.addAll(s);
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
    if (Cs(t)) return;
    let s, n = !1;
    if (e) {
      const r = (o) => {
        const a = Ht(o, t), c = this.getViewsUnderPosition(a);
        if (c.length <= 0) return;
        s = {
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
        const l = this.makeMouseInteraction(s);
        this.eventManagers.forEach((u) => {
          u.handleWheel(l);
        }), o.stopPropagation(), o.preventDefault();
      };
      "onwheel" in t && (t.onwheel = r), "addEventListener" in t && (t.addEventListener("DOMMouseScroll", r), this.eventCleanup.push(["DOMMouseScroll", r]));
    }
    t.onmouseleave = (r) => {
      if (this.waitingForRender || !s) return;
      const o = Ht(r, t);
      s.deltaPosition = Te(
        o,
        s.currentPosition
      ), s.previousPosition = s.currentPosition, s.currentPosition = o;
      const a = this.makeMouseInteraction(s);
      this.eventManagers.forEach((c) => {
        c.handleMouseOut(a);
      });
    }, t.onmousemove = (r) => {
      if (this.waitingForRender) return;
      const o = Ht(r, t);
      if (!s) {
        const c = this.getViewsUnderPosition(o);
        s = {
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
      s.deltaPosition = Te(
        o,
        s.currentPosition
      ), s.previousPosition = s.currentPosition, s.currentPosition = o, s.canClick = !1;
      const a = this.makeMouseInteraction(s);
      this.eventManagers.forEach((c) => {
        c.handleMouseMove(a);
      }), n = !0;
    }, t.onmousedown = (r) => {
      if (this.waitingForRender) return;
      const o = Ht(r, t), a = this.getViewsUnderPosition(o);
      if (a.length <= 0)
        return;
      s = {
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
      const c = this.makeMouseInteraction(s);
      this.eventManagers.forEach((u) => {
        u.handleMouseDown(c);
      }), r.stopPropagation(), document.onmousemove = (u) => {
        if (!s) return;
        if (!n) {
          const d = Ht(u, t);
          s.deltaPosition = Te(
            d,
            s.currentPosition
          ), s.previousPosition = s.currentPosition, s.currentPosition = d, s.canClick = !1;
        }
        const h = this.makeMouseInteraction(s);
        this.eventManagers.forEach((d) => {
          d.handleDrag(h);
        }), u.preventDefault(), u.stopPropagation(), n = !1;
      }, document.onmouseup = (u) => {
        document.onmousemove = null, document.onmouseup = null, document.onmouseover = null, s = void 0;
      }, document.onmouseover = (u) => {
        if (!s) return;
        const h = Ht(u, t);
        s.deltaPosition = Te(
          h,
          s.currentPosition
        ), s.previousPosition = s.currentPosition, s.currentPosition = h;
        const d = this.makeMouseInteraction(s);
        this.eventManagers.forEach((f) => {
          f.handleMouseOver(d);
        }), u.stopPropagation();
      }, t.onmouseup = (u) => {
        if (!s) return;
        const h = Ht(u, t);
        s.deltaPosition = Te(
          h,
          s.currentPosition
        ), s.previousPosition = s.currentPosition, s.currentPosition = h, s.button = u.button;
        const d = this.makeMouseInteraction(s);
        this.eventManagers.forEach((f) => {
          f.handleMouseUp(d);
        }), s.canClick && Date.now() - s.startTime < qg && this.eventManagers.forEach((f) => {
          f.handleClick(d);
        }), s = void 0;
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
    if (Cs(e)) return;
    const t = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map();
    function n(u) {
      return u.map((h) => h.touch);
    }
    function r(u) {
      return u.reduce(
        (h, d) => d.touch.startTime > h.touch.startTime ? d : h,
        u[0]
      );
    }
    const o = {
      center: (u) => u.length <= 0 ? [0, 0] : this.getTouchCenter(n(u)),
      centerDelta: (u) => {
        if (u.length <= 0) return [0, 0];
        const h = n(u), d = this.getTouchCenter(
          h,
          (p) => p.previousPosition
        ), f = this.getTouchCenter(h);
        return Te(f, d);
      },
      centerStart: (u) => {
        if (u.length <= 0) return [0, 0];
        const h = r(u).touch;
        return this.getTouchCenter(
          n(u),
          (d) => d === h ? d.start : d.startRelative.get(h) || [0, 0]
        );
      },
      id: (u) => n(u).sort(Vr).map((d) => d.touch.identifier).join("_"),
      rotation: (u) => {
        if (u.length <= 0) return 0;
        const h = n(u), d = this.getTouchCenter(h);
        return this.getAverageAngle(h, d);
      },
      rotationDelta: (u) => {
        if (u.length <= 0) return 0;
        const h = n(u), d = this.getTouchCenter(
          h,
          (m) => m.previousPosition
        ), f = this.getAverageAngle(
          h,
          d,
          (m) => m.previousPosition
        ), p = this.getTouchCenter(h);
        return this.getAverageAngle(h, p) - f;
      },
      rotationStart: (u) => {
        if (u.length <= 0) return 0;
        const h = r(u).touch, d = n(u), f = this.getTouchCenter(
          d,
          (p) => p === h ? p.start : p.startRelative.get(h) || [0, 0]
        );
        return this.getAverageAngle(
          d,
          f,
          (p) => p === h ? p.start : p.startRelative.get(h) || [0, 0]
        );
      },
      spread: (u) => {
        if (u.length <= 0) return 0;
        const h = n(u), d = this.getTouchCenter(h);
        return this.getAverageDistance(h, d);
      },
      spreadDelta: (u) => {
        if (u.length <= 0) return 0;
        const h = n(u), d = this.getTouchCenter(
          h,
          (m) => m.previousPosition
        ), f = this.getAverageDistance(
          h,
          d,
          (m) => m.previousPosition
        ), p = this.getTouchCenter(h);
        return this.getAverageDistance(h, p) - f;
      },
      spreadStart: (u) => {
        if (u.length <= 0) return 0;
        const h = r(u).touch, d = n(u), f = this.getTouchCenter(
          d,
          (p) => p === h ? p.start : p.startRelative.get(h) || [0, 0]
        );
        return this.getAverageDistance(
          d,
          f,
          (p) => p === h ? p.start : p.startRelative.get(h) || [0, 0]
        );
      }
    };
    e.ontouchstart = (u) => {
      u.preventDefault(), u.stopPropagation();
      const h = this.getTouches(u), d = [], f = [];
      for (let p = 0, g = h.length; p < g; ++p) {
        const m = h[p], b = t.get(m.identifier);
        if (b)
          d.push(b);
        else {
          const v = Ht(m), w = this.getViewsUnderPosition(v);
          if (w.length <= 0) continue;
          const E = w[0].d, y = {
            canTap: !0,
            currentPosition: v,
            deltaPosition: [0, 0],
            startTime: Date.now(),
            start: v,
            startView: E,
            previousPosition: v,
            startRelative: /* @__PURE__ */ new Map(),
            touch: m
          };
          t.set(m.identifier, y), f.push(y);
        }
      }
      if (f.length > 0) {
        const p = f.concat(d), g = [];
        for (let b = 0, v = f.length; b < v; ++b) {
          const w = f[b];
          for (let y = 0, C = p.length; y < C; ++y) {
            const M = p[y];
            w !== M && M.startRelative.set(w, M.currentPosition);
          }
          const E = this.makeSingleTouchInteraction(w);
          g.push(E), s.set(w.touch.identifier, E);
        }
        const m = {
          touches: g,
          allTouches: p.map((b) => s.get(b.touch.identifier)).filter(ne),
          multitouch: o
        };
        this.eventManagers.forEach((b) => {
          b.handleTouchDown(m);
        });
      }
      document.ontouchend = (p) => {
        a.call(document, p), document.ontouchend = null, document.ontouchcancel = null, document.ontouchmove = null;
      }, document.ontouchcancel = (p) => {
        l.call(document, p), document.ontouchend = null, document.ontouchcancel = null, document.ontouchmove = null;
      }, document.ontouchmove = c;
    };
    const a = e.ontouchend = (u) => {
      u.stopPropagation(), u.preventDefault();
      const h = this.getTouches(u, "changed"), d = Array.from(s.values()), f = [];
      for (let p = 0, g = h.length; p < g; ++p) {
        const m = h[p], b = t.get(m.identifier);
        if (b) {
          if (b.canTap && Date.now() - b.startTime < Kg) {
            const w = {
              touches: [this.makeSingleTouchInteraction(b)],
              allTouches: d,
              multitouch: o
            };
            this.eventManagers.forEach((E) => {
              E.handleTap(w);
            });
          }
          f.push(b), t.delete(m.identifier), s.delete(m.identifier);
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
    }, c = e.ontouchmove = (u) => {
      u.stopPropagation(), u.preventDefault();
      const h = this.getTouches(u), d = [], f = [];
      for (let p = 0, g = h.length; p < g; ++p) {
        const m = h[p], b = t.get(m.identifier);
        if (b) {
          const v = Ht(m), w = Te(
            v,
            b.currentPosition
          );
          if (ds(w) <= 0) {
            f.push(b), Object.assign(b, {
              currentPosition: v,
              deltaPosition: w,
              previousPosition: b.currentPosition,
              touch: m
            });
            continue;
          }
          d.push(b), Object.assign(b, {
            canTap: !1,
            currentPosition: v,
            deltaPosition: w,
            previousPosition: b.currentPosition,
            touch: m
          });
        }
      }
      if (d.length > 0) {
        const p = d.concat(f), m = {
          touches: d.map(
            (b) => this.makeSingleTouchInteraction(b)
          ),
          allTouches: p.map((b) => s.get(b.touch.identifier)).filter(ne),
          multitouch: o
        };
        this.eventManagers.forEach((b) => {
          b.handleTouchDrag(m);
        });
      }
    }, l = e.ontouchcancel = (u) => {
      u.stopPropagation(), u.preventDefault();
      const h = this.getTouches(u, "changed"), d = Array.from(s.values()), f = [];
      for (let p = 0, g = h.length; p < g; ++p) {
        const m = h[p], b = t.get(m.identifier);
        b && (f.push(b), t.delete(m.identifier), s.delete(m.identifier));
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
  getAverageDistance(e, t, s) {
    let n = 0;
    if (e.length <= 0) return n;
    s || (s = (r) => r.currentPosition);
    for (let r = 0, o = e.length; r < o; ++r) {
      const a = e[r];
      n += ds(Te(s(a), t));
    }
    return n / e.length;
  }
  /**
   * This takes all of the touches and averages their angle around the center point.
   */
  getAverageAngle(e, t, s) {
    let n = 0;
    if (e.length <= 0) return n;
    s || (s = (r) => r.currentPosition);
    for (let r = 0, o = e.length; r < o; ++r) {
      const a = e[r], c = Te(s(a), t);
      let l = Math.atan2(c[1], c[0]);
      l < 0 && (l += Math.PI * 2), n += l;
    }
    return n / e.length;
  }
  /**
   * This takes a list of touches and averages their position for a mid point between all of them.
   */
  getTouchCenter(e, t) {
    let s = [0, 0];
    if (e.length <= 0) return s;
    t || (t = (n) => n.currentPosition);
    for (let n = 0, r = e.length; n < r; ++n) {
      const o = e[n], a = t(o);
      s = Gi(s, a);
    }
    return Ae(s, 1 / e.length);
  }
  /**
   * Retrieves all touches from a touch event. This normalizes the touch information across: touches, changedTouches,
   * and targetTouches
   */
  getTouches(e, t) {
    const s = /* @__PURE__ */ new Map();
    if (e.touches && e.touches.length > 0 && (!t || t === "touches"))
      for (let n = 0, r = e.touches.length; n < r; ++n) {
        const o = e.touches.item(n);
        o && s.set(o.identifier, o);
      }
    if (e.changedTouches && e.changedTouches.length > 0 && (!t || t === "changed"))
      for (let n = 0, r = e.changedTouches.length; n < r; ++n) {
        const o = e.changedTouches.item(n);
        o && s.set(o.identifier, o);
      }
    if (e.targetTouches && e.targetTouches.length > 0 && (!t || t === "target"))
      for (let n = 0, r = e.targetTouches.length; n < r; ++n) {
        const o = e.targetTouches.item(n);
        o && s.set(o.identifier, o);
      }
    return Array.from(s.values());
  }
  /**
   * Retrieves the view for the provided id
   */
  getView(e) {
    const t = this.scenes;
    for (let s = 0, n = t.length; s < n; ++s) {
      const o = t[s].viewDiffs.getByKey(e);
      if (o) return o;
    }
    return null;
  }
  /**
   * This makes the metrics for interactions with the views.
   */
  makeMouseInteraction(e) {
    const t = this.getViewsUnderPosition(e.currentPosition);
    let s = t[0] && t[0].d;
    s || (s = Yt);
    const n = this.getViewsUnderPosition(e.start);
    let r = e.startView;
    r || (r = Yt);
    const o = {
      canvas: Cs(this.context) ? void 0 : this.context,
      mouse: e,
      screen: {
        position: e.currentPosition
      },
      start: {
        position: r.projection.screenToView(e.start),
        view: r,
        views: n.map((a) => (a.d || (a.d = Yt), {
          position: a.d.projection.screenToView(e.start),
          view: a.d
        }))
      },
      target: {
        position: s.projection.screenToView(
          e.currentPosition
        ),
        view: s,
        views: t.map((a) => (a.d || (a.d = Yt), {
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
    const t = e.currentPosition, s = this.getViewsUnderPosition(t);
    let n = s[0] && s[0].d;
    n || (n = Yt);
    let r = e.startView;
    r || (r = Yt);
    const o = {
      canvas: Cs(this.context) ? void 0 : this.context,
      touch: e,
      screen: {
        position: t
      },
      start: {
        position: r.projection.screenToView(e.start),
        view: r,
        views: this.getViewsUnderPosition(e.start).map((a) => (a.d || (a.d = Yt), {
          position: a.d.projection.screenToView(e.start),
          view: a.d
        }))
      },
      target: {
        position: n.projection.screenToView(t),
        view: n,
        views: s.map((a) => (a.d || (a.d = Yt), {
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
    e.sort(Vr);
    const s = this.allTouchCombinations(e);
    for (let n = 0, r = s.length; n < r; ++n) {
      const o = s[n], a = o.map((l) => l.touch.identifier).join("_");
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
    e.sort(Vr);
    const s = this.allTouchCombinations(e);
    for (let n = 0, r = s.length; n < r; ++n) {
      const o = s[n], a = o.map((l) => l.touch.identifier).join("_"), c = t.get(a);
      if (c) {
        const l = this.getTouchCenter(o), u = this.getAverageAngle(o, l);
        c.centerDelta = Te(l, c.currentCenter), c.currentCenter = l, c.rotationDelta = u - c.currentRotation, c.currentRotation = u;
      }
    }
  }
  /**
   * This makes all of the possible combinations of touches.
   */
  allTouchCombinations(e) {
    const t = [], s = e.length, n = 1 << s;
    for (let r = 1; r < n; r++) {
      const o = [];
      for (let a = 0; a < s; a++)
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
    const t = Eu(e);
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
    delete this.quadTree, Cs(this.context) || (this.context.onmousedown = null, this.context.onmousemove = null, this.context.onmouseleave = null);
    const e = this.context;
    e.onmousewheel && (e.onmousewheel = null), this.eventCleanup.forEach((t) => {
      this.context.removeEventListener(t[0], t[1]);
    });
  }
}
class Cu extends Nc {
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
    super(), this.preserveQueueMouse = [], this.singleQueueMouse = /* @__PURE__ */ new Map(), this.preserveQueueTouch = [], this.singleQueueTouch = /* @__PURE__ */ new Map(), this.preserveEvents = !1, this.handlers = new hr(e), this.preserveEvents = t;
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
class em {
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
const tm = $o.immediate(0);
class Wi {
  constructor(e, t) {
    this._id = P(), this.animation = $o.immediate(0), this.animationEndTime = 0, this.offsetBroadcastTime = 0, this.scaleBroadcastTime = 0, this._offset = [0, 0, 0], this.startOffset = [0, 0, 0], this.startOffsetTime = 0, this.offsetEndTime = 0, this._scale = [1, 1, 1], this.startScale = [1, 1, 1], this.startScaleTime = 0, this.scaleEndTime = 0, this.needsBroadcast = !1, this.camera = e, t && (this._offset = ct(t.offset || this._offset), this._scale = ct(t.scale || this._scale));
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
    const s = (a = this.surface) == null ? void 0 : a.getViewSize(e);
    if (!s) return;
    const n = [s.width / 2, s.height / 2, 0], r = ti(
      t,
      fr(n, this._scale)
    ), o = this.animation;
    this.setOffset(ct(this.offset)), this.animation = tm, this.setOffset(ht(r, -1)), this.animation = o;
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
class ai extends $i {
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
      type: Vi.ORTHOGRAPHIC
    }), this.control2D = new Wi(this, e);
  }
}
class im extends Cu {
  constructor() {
    super({
      handleClick: async (e) => {
        var t, s;
        this.enablePicking(), await ((t = this.willRenderResolver) == null ? void 0 : t.promise), this.enablePicking(), await ((s = this.didRenderResolver) == null ? void 0 : s.promise), this.handleInteraction(e, (n, r) => {
          var o;
          (o = n.interactions) == null || o.handleMouseClick(r, e);
        });
      },
      handleTap: async (e) => {
        var t, s;
        this.enablePicking(), await ((t = this.willRenderResolver) == null ? void 0 : t.promise), this.enablePicking(), await ((s = this.didRenderResolver) == null ? void 0 : s.promise), e.touches.forEach((n) => {
          this.handleInteraction(n, (r, o) => {
            var a;
            (a = r.interactions) == null || a.handleTap(o, e, n);
          });
        });
      },
      handleDrag: async (e) => {
        var t;
        await ((t = this.willRenderResolver) == null ? void 0 : t.promise), this.handleInteraction(e, (s, n) => {
          var r;
          (r = s.interactions) == null || r.handleMouseDrag(n, e);
        });
      },
      handleMouseDown: async (e) => {
        var t;
        this.enablePicking(), await ((t = this.willRenderResolver) == null ? void 0 : t.promise), this.handleInteraction(
          e,
          (s, n) => {
            var r;
            return (r = s.interactions) == null ? void 0 : r.handleMouseDown(n, e);
          }
        );
      },
      handleTouchDown: async (e) => {
        var t;
        this.enablePicking(), await ((t = this.willRenderResolver) == null ? void 0 : t.promise), e.touches.forEach((s) => {
          this.handleInteraction(
            s,
            (n, r) => {
              var o;
              return (o = n.interactions) == null ? void 0 : o.handleTouchDown(r, e, s);
            }
          );
        });
      },
      handleMouseUp: async (e) => {
        var t;
        await ((t = this.willRenderResolver) == null ? void 0 : t.promise), this.handleInteraction(
          e,
          (s, n) => {
            var r;
            return (r = s.interactions) == null ? void 0 : r.handleMouseUp(n, e);
          }
        );
      },
      handleTouchUp: async (e) => {
        var t;
        await ((t = this.willRenderResolver) == null ? void 0 : t.promise), e.touches.forEach((s) => {
          this.handleInteraction(
            s,
            (n, r) => {
              var o;
              return (o = n.interactions) == null ? void 0 : o.handleTouchUp(r, e, s);
            }
          );
        });
      },
      handleMouseOut: async (e) => {
        var t;
        await ((t = this.willRenderResolver) == null ? void 0 : t.promise), this.isOver.forEach((s) => {
          this.handleView(
            s,
            (n, r) => {
              var o;
              return (o = n.interactions) == null ? void 0 : o.handleMouseOut(r, e);
            }
          );
        }), this.isOver.clear();
      },
      handleTouchOut: async (e) => {
        var t;
        await ((t = this.willRenderResolver) == null ? void 0 : t.promise), e.touches.forEach((s) => {
          Jr(
            this.isTouchOver,
            s.touch.touch.identifier,
            /* @__PURE__ */ new Set()
          ).forEach((r) => {
            this.handleView(
              r,
              (o, a) => {
                var c;
                return (c = o.interactions) == null ? void 0 : c.handleTouchOut(a, e, s);
              }
            );
          }), this.isOver.clear();
        });
      },
      handleMouseMove: async (e) => {
        var n;
        this.enablePicking(), await ((n = this.willRenderResolver) == null ? void 0 : n.promise);
        const t = this.handleInteraction(
          e,
          (r, o) => {
            var a;
            return (a = r.interactions) == null ? void 0 : a.handleMouseMove(o, e);
          }
        ), s = /* @__PURE__ */ new Set();
        t.forEach((r) => s.add(r)), this.isOver.forEach((r) => {
          s.has(r) || this.handleView(
            r,
            (o, a) => {
              var c;
              return (c = o.interactions) == null ? void 0 : c.handleMouseOut(a, e);
            }
          );
        }), s.forEach((r) => {
          this.isOver.has(r) || this.handleView(
            r,
            (o, a) => {
              var c;
              return (c = o.interactions) == null ? void 0 : c.handleMouseOver(a, e);
            }
          );
        }), this.isOver = s;
      },
      /**
       * Touch dragging is essentially touch moving as it's the only way to make a touch glide across the screen
       */
      handleTouchDrag: async (e) => {
        var t;
        this.enablePicking(), await ((t = this.willRenderResolver) == null ? void 0 : t.promise), e.touches.forEach((s) => {
          const n = this.handleInteraction(
            s,
            (a, c) => {
              var l;
              return (l = a.interactions) == null ? void 0 : l.handleTouchMove(c, e, s);
            }
          ), r = /* @__PURE__ */ new Set();
          n.forEach((a) => r.add(a));
          const o = hs(
            this.isTouchOver,
            s.touch.touch.identifier,
            /* @__PURE__ */ new Set()
          );
          o.forEach((a) => {
            r.has(a) || this.handleView(
              a,
              (c, l) => {
                var u;
                return (u = c.interactions) == null ? void 0 : u.handleTouchOut(l, e, s);
              }
            );
          }), r.forEach((a) => {
            o.has(a) || this.handleView(
              a,
              (c, l) => {
                var u;
                return (u = c.interactions) == null ? void 0 : u.handleTouchOver(
                  l,
                  e,
                  s
                );
              }
            );
          }), this.isTouchOver.set(
            s.touch.touch.identifier,
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
    this.surface && this.surface.enableOptimizedOutput(G.PICKING);
  }
  /**
   * We want to dequeue the events after a render has taken place.
   */
  willRender() {
    var e;
    for (let t = 0, s = this.scenes.length; t < s; ++t) {
      const n = this.scenes[t];
      for (let r = 0, o = n.layers.length; r < o; ++r)
        (e = n.layers[r].interactions) == null || delete e.colorPicking;
    }
    this.willRenderResolver && this.willRenderResolver.resolve(), this.willRenderResolver = new Ue(), this.dequeue();
  }
  /**
   * After rendering has completed, we release all handlers waiting for
   * completion.
   */
  async didRender() {
    this.didRenderResolver && this.didRenderResolver.resolve(), this.didRenderResolver = new Ue();
  }
  getSceneViewsUnderMouse(e) {
    const t = /* @__PURE__ */ new Map();
    for (let s = 0, n = this.scenes.length; s < n; ++s) {
      const r = this.scenes[s];
      for (let o = 0, a = r.views.length; o < a; ++o) {
        const c = r.views[o];
        t.set(c.id, c);
      }
    }
    return e.target.views.map((s) => t.get(s.view.id)).filter(ne);
  }
  handleInteraction(e, t) {
    const s = this.getSceneViewsUnderMouse(e);
    for (let n = 0, r = s.length; n < r; ++n) {
      const o = s[n];
      this.handleView(o, t);
    }
    return s;
  }
  handleView(e, t) {
    for (let s = 0, n = e.scene.layers.length; s < n; ++s) {
      const r = e.scene.layers[s];
      r.picking && r.picking.type !== X.NONE && t(r, e);
    }
  }
}
class sm {
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
class nm extends sm {
  /**
   * For es 3.0 shaders:
   *   - we make sure all varying is converted to outs.
   *   - texture2D sampling is now texture
   * For es 2.0 shaders:
   *   - we make sure the version header is removed
   *   - Ensure out's are changed to varying
   */
  vertex(e) {
    let t = rr(e);
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
    let t = rr(e);
    if (O.SHADERS_3_0) {
      if (t = t.replace(/\s+varying\s+/g, `
in `), t = t.replace(/(texture2D(\s+)\(|texture2D\()/g, "texture("), t.match(/gl_FragColor/g) && (t = t.replace(/gl_FragColor/g, "_FragColor"), !t.match("out vec4 _FragColor"))) {
        const s = t.split(`
`);
        s.splice(3, 0, "layout(location = 0) out vec4 _FragColor;"), t = s.join(`
`);
      }
    } else
      t = t.replace(/^#version 300 es/g, ""), t = t.replace(/\s+in\s+/g, `
varying `);
    return t;
  }
}
function rm(i, e, t, s, n) {
  const r = {
    view: i,
    allColors: [],
    colorData: t,
    dataHeight: n,
    dataWidth: s,
    mouse: e,
    nearestColor: 0,
    nearestColorBytes: [0, 0, 0, 0]
  }, o = /* @__PURE__ */ new Map();
  let a = 0;
  const c = s / 2, l = n / 2;
  let u = 0, h = [0, 0, 0, 0], d = Number.MAX_SAFE_INTEGER;
  for (let f = 0; f < n; ++f) {
    const p = [];
    for (let g = 0; g < s; ++g) {
      const m = t[a], b = t[a + 1], v = t[a + 2];
      a += 4;
      const w = m << 16 | b << 8 | v;
      if (o.set(w, !0), p.push(w), w !== 0) {
        const E = g - c, y = f - l, C = E * E + y * y;
        C < d && (d = C, u = w, h = [m, b, v, 255]);
      }
    }
  }
  return r.allColors = Array.from(o.keys()), r.nearestColor = u, r.nearestColorBytes = h, r;
}
class om {
  constructor(e) {
    this.pickingRenderTargets = /* @__PURE__ */ new Map(), this.surface = e.surface;
  }
  analyzePickedPixels(e, t) {
    if (t.optimizeRendering)
      return;
    const s = dr(
      // Our location is relative to the screen, so we must scale it by the
      // surface's pixel ratio to match the actual pixel space of the original
      // screen dimensions
      Ae(e, this.surface.pixelRatio),
      // We then have to scale down the location based on the scaling of the
      // view relative to the view's scaling relative to the screen.
      t.projection.screenScale
    ), n = 5, r = 5, o = 4, a = new Uint8Array(n * r * o);
    this.surface.renderer.readPixels(
      Math.min(
        Math.max(0, Math.floor(s[0] - n / 2)),
        t.getRenderTargets()[0].width
      ),
      Math.min(
        Math.max(0, Math.floor(s[1] - r / 2)),
        t.getRenderTargets()[0].height
      ),
      n,
      r,
      a
    );
    const c = rm(
      t,
      [s[0] - t.screenBounds.x, s[1] - t.screenBounds.y],
      a,
      n,
      r
    );
    for (let l = 0, u = t.scene.layers.length; l < u; ++l) {
      const h = t.scene.layers[l];
      h.picking.type === X.SINGLE && (h.interactions.colorPicking = c);
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
    const t = e.screen.position, s = e.target.views.map((r) => r.view), n = /* @__PURE__ */ new Set();
    this.pickingRenderTargets.forEach((r, o) => {
      const a = r.getBuffers()[0].buffer;
      a instanceof W && (!a.gl || a.destroyed) && (r.dispose(), n.add(o));
    }), n.forEach((r) => this.pickingRenderTargets.delete(r)), s.forEach((r) => {
      let o = this.pickingRenderTargets.get(r);
      if (o || r.getRenderTargets().forEach((l) => {
        l.gl && l.getBuffers().forEach((u) => {
          if (u.outputType === G.PICKING) {
            if (u.buffer instanceof W && u.buffer.generateMipMaps && Me("decode-picking-error", () => {
              console.warn(
                "The Texture you provided as the target for color picking has generateMipMaps enabled. This can cause accuracy issues and may make your picking experience poor."
              );
            }), o = new is({
              buffers: {
                color: u
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
const am = () => [
  // Basic expansion to handle writing attributes and uniforms to the shader
  new xg(),
  // Expansion to write in the active attribute handler. Any expansion injected AFTER
  // this expander will have it's processes canceled out for the destructuring portion
  // of the expansion when an instance is not active (if the instance has an
  // active
  // attribute).
  new yg(),
  // Expansion to handle easing IO attributes and write AutoEasingMethods to the
  // shaders
  new fg()
], cm = () => [
  {
    type: oe.COLOR_BUFFER,
    manager: new Zh()
  },
  {
    type: oe.TEXTURE,
    manager: new Yp()
  },
  {
    type: oe.ATLAS,
    manager: new Xp({})
  },
  {
    type: oe.FONT,
    manager: new zp()
  }
], lm = () => [
  // Transform that handles odds and ends of 3.0 and 2.0 inconsistencies and
  // attempts tp unify them as best as possible depending on the current
  // system's operating mode.
  new nm()
], um = [0, 0, 0, 0];
function $r(i, e) {
  return (i.order || Number.MAX_SAFE_INTEGER) - (e.order || Number.MAX_SAFE_INTEGER);
}
class hm {
  constructor(e) {
    this.commands = new om({ surface: this }), this.frameMetrics = {
      currentFrame: 0,
      currentTime: Date.now() | 0,
      frameDuration: 1e3 / 60,
      previousTime: Date.now() | 0
    }, this.isBufferingResources = !1, this.ioExpanders = [], this.shaderTransforms = [], this.optimizedOutputs = /* @__PURE__ */ new Set(), this.ioSorting = new em(), this.pixelRatio = window.devicePixelRatio, this.enabledOptimizedOutputs = /* @__PURE__ */ new Set(), this.viewDrawDependencies = /* @__PURE__ */ new Map(), this.pipelineLoadContext = 0, this.resourceDiffs = new nr({
      buildItem: async (t) => (await this.resourceManager.initResource(t), {
        id: t.key
      }),
      destroyItem: async (t, s) => (await this.resourceManager.destroyResource(t), !0),
      updateItem: async (t, s) => {
        await this.resourceManager.updateResource(t);
      }
    }), this.sceneDiffs = new nr({
      buildItem: async (t) => new or(this, {
        key: t.key,
        views: t.views,
        layers: t.layers
      }),
      destroyItem: async (t, s) => (s.destroy(), !0),
      updateItem: async (t, s) => {
        await s.update(t);
      }
    }), this.readyResolver = new Ue(), this.ready = this.readyResolver.promise, e && this.init(e);
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
    for (let t = 0, s = this.userInputManager.eventManagers.length; t < s; ++t) {
      const n = this.userInputManager.eventManagers[t];
      switch (e) {
        case 1:
          n.didRender();
          break;
        case 0:
          n.willRender();
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
    const t = this.frameMetrics.currentTime, s = this.sceneDiffs.items;
    s.sort($r);
    const n = {};
    for (let o = 0, a = s.length; o < a; ++o) {
      const c = s[o], l = c.renderViews, u = c.layers;
      l.sort($r), u.sort($r);
      for (let h = 0, d = l.length; h < d; ++h) {
        const f = l[h], p = {};
        if (!f.shouldDrawView(this.frameMetrics))
          continue;
        u.length > 0 && f.willUseView();
        const g = this.renderer.getRenderSize();
        let m = new J({
          width: g[0],
          height: g[1],
          x: 0,
          y: 0
        });
        if (f.renderTarget) {
          const E = (Array.isArray(f.renderTarget) ? f.renderTarget[0] : f.renderTarget).getSize();
          m = new J({
            width: E[0],
            height: E[1],
            x: 0,
            y: 0
          });
        }
        const b = Ca(
          f.props.viewport,
          m,
          this.pixelRatio
        );
        f.fitViewtoViewport(m, b);
        for (let w = 0, E = u.length; w < E; ++w) {
          const y = u[w];
          y.view = f;
          try {
            y.draw(), p[y.id] = y, f.animationEndTime = Math.max(
              f.animationEndTime,
              y.animationEndTime,
              f.props.camera.animationEndTime
            ), y.lastFrameTime = t;
          } catch (C) {
            C instanceof Error && (n[y.id] || (n[y.id] = [y, C]));
          }
        }
        const v = Object.values(p);
        u.length !== v.length && c.layerDiffs.diff(v.map((w) => w.initializer)), c.container && (e && e(!0, c, f), f.previousProps = f.props);
      }
    }
    const r = Object.values(n);
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
      for (let t = 0, s = this.sceneDiffs.items.length; t < s; ++t) {
        const n = this.sceneDiffs.items[t];
        n.clearCaches();
        for (let r = 0, o = n.renderViews.length; r < o; ++r) {
          const a = n.renderViews[r];
          a.props.camera.broadcast(a.id);
        }
      }
      if (await this.commit((t, s, n) => {
        s.container && t && this.drawSceneView(s.container, n);
      }), this.userInputManager.waitingForRender && (this.userInputManager.waitingForRender = !1), !this.isBufferingResources) {
        this.isBufferingResources = !0;
        const t = await this.resourceManager.dequeueRequests();
        this.isBufferingResources = !1, t && this.draw(await oi());
      }
      for (let t = 0, s = this.sceneDiffs.items.length; t < s; ++t) {
        const n = this.sceneDiffs.items[t];
        for (let r = 0, o = n.renderViews.length; r < o; ++r) {
          const a = n.renderViews[r];
          a.needsDraw = !1, a.props.camera.resolve();
        }
        for (let r = 0, o = n.layers.length; r < o; ++r) {
          const a = n.layers[r];
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
  drawSceneView(e, t, s, n) {
    s = s || this.renderer;
    const r = { x: t.viewBounds.left, y: t.viewBounds.top }, o = t.viewBounds, a = t.props.background || um, c = t.clearFlags.indexOf($n.COLOR) > -1, l = n || t.renderTarget || null;
    t.renderTarget && (t.getRenderTargets().forEach(
      (h) => this.optimizedOutputs.forEach(
        (d) => h.disabledTargets.add(d)
      )
    ), this.enabledOptimizedOutputs.size > 0 && t.getRenderTargets().forEach(
      (d) => this.enabledOptimizedOutputs.forEach(
        (f) => d.disabledTargets.delete(f)
      )
    )), s.setRenderTarget(l), s.setScissor(
      {
        x: r.x,
        y: r.y,
        width: o.width,
        height: o.height
      },
      l
    ), c && s.clearColor([
      a[0],
      a[1],
      a[2],
      a[3]
    ]), s.setViewport({
      x: r.x,
      y: r.y,
      width: o.width,
      height: o.height
    }), t.clearFlags && t.clearFlags.length > 0 ? s.clear(
      c,
      t.clearFlags.indexOf($n.DEPTH) > -1,
      t.clearFlags.indexOf($n.STENCIL) > -1
    ) : s.clear(!1), s.render(e, l, t, t.props.glState), t.lastFrameTime = this.frameMetrics.currentTime;
  }
  /**
   * This must be executed when the canvas changes size so that we can
   * re-calculate the scenes and views dimensions for handling all of our
   * rendered elements.
   */
  fitContainer(e) {
    if (!this.context || Cs(this.context.canvas)) return;
    const t = this.context.canvas.parentElement;
    if (t) {
      const s = this.context.canvas;
      s.className = "", s.setAttribute("style", ""), t.style.position = "relative", s.style.position = "absolute", s.style.left = "0xp", s.style.top = "0xp", s.style.width = "100%", s.style.height = "100%", s.setAttribute("width", ""), s.setAttribute("height", "");
      const n = t.getBoundingClientRect(), r = s.getBoundingClientRect();
      this.resize(r.width || 100, n.height || 100);
    }
  }
  /**
   * This gathers all the overlap views of every view
   */
  updateViewDimensions() {
    if (!this.sceneDiffs) return;
    this.viewDrawDependencies.clear();
    const e = this.sceneDiffs.items, t = this.renderer.getRenderSize();
    for (let s = 0, n = e.length; s < n; s++) {
      const r = e[s];
      for (let o = 0, a = r.renderViews.length; o < a; ++o) {
        const c = r.renderViews[o];
        c.willUseView();
        let l = new J({
          width: t[0],
          height: t[1],
          x: 0,
          y: 0
        });
        if (c.renderTarget) {
          const d = (Array.isArray(c.renderTarget) ? c.renderTarget[0] : c.renderTarget).getSize();
          l = new J({
            width: d[0],
            height: d[1],
            x: 0,
            y: 0
          });
        }
        const u = Ca(
          c.props.viewport,
          l,
          this.pixelRatio
        );
        c.fitViewtoViewport(l, u), c.props.camera.update(!0);
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
    for (let t = 0, s = this.sceneDiffs.items.length; t < s; ++t) {
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
    for (let t = 0, s = this.sceneDiffs.items.length; t < s; ++t) {
      const r = this.sceneDiffs.items[t].viewDiffs.getByKey(e);
      if (r)
        if (r.screenBounds) {
          const o = r.projection.viewToWorld([0, 0]), a = r.projection.screenToWorld([
            r.screenBounds.right,
            r.screenBounds.bottom
          ]);
          return new J({
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
    for (let t = 0, s = this.sceneDiffs.items.length; t < s; ++t) {
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
    var s;
    if (this.context) return this;
    this.pixelRatio = e.pixelRatio || this.pixelRatio, this.pixelRatio < 1 && (this.pixelRatio = 1);
    const t = this.initGL(e);
    return t ? (this.context = t, this.gl ? ((s = e.optimizedOutputTargets) == null || s.forEach(
      (n) => this.optimizedOutputs.add(n)
    ), this.initUserInputManager(e), await this.initResources(e), await this.initIOExpanders(e), await this.initShaderTransforms(e)) : console.warn(
      "Could not establish a GL context. Layer Surface will be unable to render"
    ), this.readyResolver.resolve(this), this) : (this.readyResolver.reject({
      error: Pc.NO_WEBGL_CONTEXT,
      message: "Could not establish a webgl context. Surface is being destroyed to free resources."
    }), this.destroy(), this);
  }
  /**
   * This initializes the Canvas GL contexts needed for rendering.
   */
  initGL(e) {
    const t = e.context;
    if (!t) return null;
    const s = t.width, n = t.height;
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
    return this.renderer = new $h({
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
    }), !r || !this.renderer.gl ? null : (this.context = this.renderer.gl, this.resourceManager && this.resourceManager.setWebGLRenderer(this.renderer), this.setRendererSize(s, n), this.renderer.setPixelRatio(this.pixelRatio), this.renderer.gl);
  }
  /**
   * Initializes the expanders that should be applied to the surface for layer
   * processing.
   */
  initIOExpanders(e) {
    const t = am();
    Array.isArray(e.ioExpansion) || e.ioExpansion === void 0 ? this.ioExpanders = e.ioExpansion && e.ioExpansion.slice(0) || t.slice(0) || [] : e.ioExpansion instanceof Function && (this.ioExpanders = e.ioExpansion(t));
    const s = this.resourceManager.getIOExpansion();
    this.ioExpanders = this.ioExpanders.concat(s);
  }
  /**
   * Initializes the shader transforms that will be applied to every shader
   * rendered with this surface.
   */
  initShaderTransforms(e) {
    const t = lm();
    Array.isArray(e.shaderTransforms) || e.shaderTransforms === void 0 ? this.shaderTransforms = e.shaderTransforms && e.shaderTransforms.slice(0) || t.slice(0) || [] : e.shaderTransforms instanceof Function && (this.shaderTransforms = e.shaderTransforms(t));
  }
  /**
   * Initializes elements for handling mouse interactions with the canvas.
   */
  initUserInputManager(e) {
    if (!this.context) return;
    const t = [new im()].concat(e.eventManagers || []);
    this.userInputManager = new Jg(
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
    const t = cm();
    this.resourceManager = new _u(), this.resourceManager.setWebGLRenderer(this.renderer), (e.resourceManagers && e.resourceManagers.slice(0) || t.slice(0) || []).forEach((n) => {
      this.resourceManager.setManager(n.type, n.manager);
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
    const t = ++this.pipelineLoadContext;
    await oi(), this.pipelineLoadContext === t && (e.resources && await this.resourceDiffs.diff(e.resources), e.scenes && await this.sceneDiffs.diff(e.scenes), this.updateViewDimensions());
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
        const s = t[1].stack || t[1].message;
        if (console.error(s), s.indexOf("RangeError") > -1 || s.indexOf("Source is too large") > -1) {
          const n = t[0], r = n.bufferManager.changeListContext || [];
          let o, a = 0;
          for (let c = 0, l = r.length; c < l; ++c) {
            const [u] = r[c];
            n.shaderIOInfo.instanceAttributes.forEach((h) => {
              h.update(u).length !== h.size && (o || (o = [
                "Example instance returned the wrong sized value for an attribute:",
                u,
                h
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
  resize(e, t, s) {
    if (this.pixelRatio = s || this.pixelRatio, this.pixelRatio < 1 && (this.pixelRatio = 1), this.setRendererSize(e, t), this.renderer.setPixelRatio(this.pixelRatio), this.userInputManager.resize(), this.resourceManager.resize(), this.sceneDiffs) {
      const n = this.sceneDiffs.items;
      for (let r = 0, o = n.length; r < o; ++r) {
        const a = n[r];
        for (let c = 0, l = a.renderViews.length; c < l; ++c) {
          const u = a.renderViews[c];
          u.pixelRatio = this.pixelRatio, u.props.camera.update(!0);
        }
      }
    }
    this.updateViewDimensions();
  }
  /**
   * This flags all views to fully re-render
   */
  redraw() {
    for (let e = 0, t = this.sceneDiffs.items.length; e < t; ++e) {
      const s = this.sceneDiffs.items[e];
      for (let n = 0, r = s.renderViews.length; n < r; ++n) {
        const o = s.renderViews[n];
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
const oa = class oa extends zt {
  draw() {
    this.props.commands(this.surface);
  }
  /** The layer renders nothing, thus does not need a shader object */
  initShader() {
    return null;
  }
};
oa.defaultProps = {
  data: new ae(),
  key: "",
  commands: () => {
  }
};
let lo = oa;
class Be extends zt {
  constructor(e, t, s) {
    super(e, t, s);
  }
  /**
   * Force the world2D methods as the base methods
   */
  baseShaderModules(e) {
    const t = super.baseShaderModules(e);
    return t.vs.push("world2D"), t;
  }
}
const Ou = `// These are projection methods utilizing the simpler camera 2d approach.
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
`, dm = `
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
be.register([
  {
    moduleId: "world2D",
    description: dm,
    content: Ou,
    compatibility: _.ALL,
    uniforms: (i) => i instanceof Be ? [
      // This injects the projection matrix from the view camera
      {
        name: "projection",
        size: A.MATRIX4,
        update: () => i.view.props.camera.projection
      },
      // This injects the model view matrix from the view camera
      {
        name: "view",
        size: A.MATRIX4,
        update: () => i.view.props.camera.view
      },
      {
        name: "viewProjection",
        size: A.MATRIX4,
        update: () => i.view.props.camera.viewProjection
      },
      // This injects a 2D camera's offset
      {
        name: "cameraOffset",
        size: A.THREE,
        update: () => i.view.props.camera instanceof ai ? i.view.props.camera.control2D.offset : [0, 0, 0]
      },
      // This injects the camera's current position
      {
        name: "cameraPosition",
        size: A.THREE,
        update: () => i.view.props.camera.position
      },
      // This injects the camera's current scale
      {
        name: "cameraScale",
        size: A.THREE,
        update: () => i.view.props.camera.scale
      },
      // This injects the camera's 2D current scale
      {
        name: "cameraScale2D",
        size: A.THREE,
        update: () => i.view.props.camera instanceof ai ? i.view.props.camera.scale2D : [1, 1, 1]
      },
      // This injects the camera's Euler rotation
      {
        name: "cameraRotation",
        size: A.THREE,
        update: () => i.view.props.camera.scale
      },
      // This injects the pixel width and height of the view
      {
        name: "viewSize",
        size: A.TWO,
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
        size: A.ONE,
        update: () => [i.view.pixelRatio]
      }
    ] : (console.warn(
      "A shader requested the module world2D; however, the layer the shader comes from is NOT a Layer2D which is",
      "required for the module to work."
    ), [])
  }
]);
var L = /* @__PURE__ */ ((i) => (i[i.BottomLeft = 0] = "BottomLeft", i[i.BottomMiddle = 1] = "BottomMiddle", i[i.BottomRight = 2] = "BottomRight", i[i.Custom = 3] = "Custom", i[i.Middle = 4] = "Middle", i[i.MiddleLeft = 5] = "MiddleLeft", i[i.MiddleRight = 6] = "MiddleRight", i[i.TopLeft = 7] = "TopLeft", i[i.TopMiddle = 8] = "TopMiddle", i[i.TopRight = 9] = "TopRight", i))(L || {}), ei = /* @__PURE__ */ ((i) => (i[i.ALWAYS = 1] = "ALWAYS", i[i.BOUND_MAX = 2] = "BOUND_MAX", i[i.NEVER = 3] = "NEVER", i))(ei || {}), fm = /* @__PURE__ */ ((i) => (i[i.TOP_LEFT = 0] = "TOP_LEFT", i[i.TOP_MIDDLE = 1] = "TOP_MIDDLE", i[i.TOP_RIGHT = 2] = "TOP_RIGHT", i[i.MIDDLE_LEFT = 3] = "MIDDLE_LEFT", i[i.MIDDLE = 4] = "MIDDLE", i[i.MIDDLE_RIGHT = 5] = "MIDDLE_RIGHT", i[i.BOTTOM_LEFT = 6] = "BOTTOM_LEFT", i[i.BOTTOM_MIDDLE = 7] = "BOTTOM_MIDDLE", i[i.BOTTOM_RIGHT = 8] = "BOTTOM_RIGHT", i))(fm || {});
class pm extends hr {
  constructor(e) {
    super({}), this._uid = P(), this.isPanning = !1, this.isScaling = !1, this.panFilter = (t, s, n) => t, this.scaleFilter = (t, s, n) => t, this.startViews = [], this.optimizedViews = /* @__PURE__ */ new Set(), this.cameraImmediateAnimation = $o.immediate(0), this.targetTouches = /* @__PURE__ */ new Set(), this.onRangeChanged = (t, s) => {
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
        Lo(this.camera.control2D.getScale(), this.bounds.scaleMin)
      ), this.bounds.scaleMax && this.camera.control2D.setScale(
        No(this.camera.control2D.getScale(), this.bounds.scaleMax)
      ));
    }, this.handleCameraViewChange = (t, s) => {
      if (s !== this.startViews[0]) return;
      const n = this.surface.getProjections(s);
      n && this.onRangeChanged(t, n);
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
    const s = e.projection.worldToScreen([
      t.worldBounds.left,
      t.worldBounds.top
    ]), n = e.projection.worldToScreen([
      t.worldBounds.right,
      t.worldBounds.bottom
    ]);
    return n[0] - s[0] + t.screenPadding.left + t.screenPadding.right - e.screenBounds.width < 0 ? this.anchoredByBoundsHorizontal(e, t) : n[0] < e.screenBounds.right - t.screenPadding.right ? -t.worldBounds.right + (e.screenBounds.width - t.screenPadding.right) / this.camera.control2D.getScale()[0] : s[0] > e.screenBounds.left + t.screenPadding.left ? -t.worldBounds.left + t.screenPadding.left / this.camera.control2D.getScale()[0] : this.camera.control2D.getOffset()[0];
  }
  /**
   * Returns offset on y-axis due to current bounds and anchor.
   */
  boundsVerticalOffset(e, t) {
    const s = e.projection.worldToScreen([
      t.worldBounds.left,
      t.worldBounds.top
    ]), n = e.projection.worldToScreen([
      t.worldBounds.right,
      t.worldBounds.bottom
    ]);
    return n[1] - s[1] + t.screenPadding.top + t.screenPadding.bottom - e.screenBounds.height < 0 ? this.anchoredByBoundsVertical(e, t) : n[1] < e.screenBounds.bottom - t.screenPadding.bottom ? -t.worldBounds.bottom + (e.screenBounds.height - t.screenPadding.bottom) / this.camera.control2D.getScale()[1] : s[1] > e.screenBounds.top + t.screenPadding.top ? -t.worldBounds.top + t.screenPadding.top / this.camera.control2D.getScale()[0] : this.camera.control2D.getOffset()[1];
  }
  canStart(e) {
    return this.startViews.length === 0 || this.startViews && this.startViews.indexOf(e) > -1 || this.startViewDidStart && this.ignoreCoverViews;
  }
  /**
   * Centers the camera on a position. Must provide a reference view.
   */
  centerOn(e, t) {
    if (!this.camera.control2D.surface) return;
    const s = this.camera.control2D.surface.getViewSize(e);
    if (!s) return;
    const n = [s.width / 2, s.height / 2, 0], r = ti(
      t,
      fr(n, this.camera.control2D.getScale())
    ), o = ht(r, -1);
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
  doPan(e, t, s) {
    let n = ls(dr(s, this.camera.control2D.getScale()), 0);
    this.panFilter && (n = this.panFilter(n, t, e)), this.camera.control2D.getOffset()[0] += n[0], this.camera.control2D.getOffset()[1] += n[1], this.applyBounds(), this.onRangeChanged(this.camera, t.projection), this.applyBounds(), this.camera.control2D.update();
  }
  /**
   * Scales the camera relative to a point and a view.
   *
   * @param focalPoint The point the scaling happens around
   * @param targetView The relative view this operation happens in relation to
   * @param deltaScale The amount of scaling per axis that should happen
   */
  doScale(e, t, s, n) {
    const r = t.projection.screenToWorld(e), o = this.camera.control2D.getScale()[0] || 1, a = this.camera.control2D.getScale()[1] || 1;
    this.scaleFilter && (n = this.scaleFilter(n, t, s)), this.camera.control2D.getScale()[0] = o + n[0], this.camera.control2D.getScale()[1] = a + n[1], this.applyScaleBounds();
    const c = t.projection.screenToWorld(e), l = Te(r, c);
    this.camera.control2D.getOffset()[0] -= l[0], this.camera.control2D.getOffset()[1] -= l[1], this.applyBounds(), this.onRangeChanged(this.camera, t.projection), this.applyBounds(), this.camera.control2D.update(), this.camera.control2D.animation = this.cameraImmediateAnimation;
  }
  /**
   * This filters a set of touches to be touches that had a valid starting view interaction.
   */
  filterTouchesByValidStart(e) {
    return this.ignoreCoverViews ? e.filter(ah(this.startViews)) : e.filter(oh(this.startViews));
  }
  /**
   * Finds a view within the event that matches a start view even if the view is covered by other views at the event's
   * interaction point.
   */
  findCoveredStartView(e) {
    const t = e.target.views.find(
      (s) => this.startViews.indexOf(s.view.id) > -1
    );
    this.startViewDidStart = !!t, t && (this.coveredStartView = t.view);
  }
  /**
   * Evaluates the world bounds the specified view is observing
   *
   * @param viewId The id of the view when the view was generated when the surface was made
   */
  getRange(e) {
    const t = this.getProjection(e), s = this.getViewScreenBounds(e);
    if (t && s) {
      const n = t.screenToWorld([
        s.x,
        s.y
      ]), r = t.screenToWorld([
        s.right,
        s.bottom
      ]);
      return new J({
        height: r[1] - n[1],
        width: r[0] - n[0],
        x: n[0],
        y: n[1]
      });
    }
    return new J({ x: 0, y: 0, width: 1, height: 1 });
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
      for (let s = 0, n = t.length; s < n; ++s) {
        const r = t[s];
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
      this.targetTouches.delete(t.touch.touch.identifier), this.targetTouches.size <= 0 && (this.startViewDidStart = !1, this.isPanning = !1, this.optimizedViews.forEach((s) => s.optimizeRendering = !1), this.optimizedViews.clear());
    }), this.isPanning = !1, this.isScaling = !1, this.targetTouches.size > 0 && (this.isPanning = !0), this.targetTouches.size > 1 && (this.isScaling = !0);
  }
  /**
   * Used to stop panning and scaling effects when touches are forcibly ejected from existence.
   */
  handleTouchCancelled(e) {
    e.touches.forEach((t) => {
      this.targetTouches.delete(t.touch.touch.identifier), this.targetTouches.size <= 0 && (this.startViewDidStart = !1, this.isPanning = !1, this.optimizedViews.forEach((s) => s.optimizeRendering = !1), this.optimizedViews.clear());
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
      const s = /* @__PURE__ */ new Set(), r = t.reduce((o, a) => {
        for (let c = 0, l = a.target.views.length; c < l; ++c) {
          const u = a.target.views[c];
          s.add(u.view);
        }
        return a.touch.startTime < o.touch.startTime ? a : o;
      }, t[0]).start.view;
      if (this.isPanning && (this.doPan(
        Array.from(s.values()),
        r,
        e.multitouch.centerDelta(t)
      ), this.camera.control2D.animation = this.cameraImmediateAnimation), this.isScaling) {
        const o = e.multitouch.center(t), a = Te(
          t[0].touch.currentPosition,
          o
        ), c = Te(
          o,
          e.multitouch.centerDelta(t)
        ), l = Te(
          t[0].touch.previousPosition,
          c
        ), u = ds(a) / ds(l), h = [
          u * this.camera.scale2D[0] - this.camera.scale2D[0],
          u * this.camera.scale2D[1] - this.camera.scale2D[1],
          0
        ];
        u !== 1 && this.doScale(
          o,
          r,
          Array.from(s.values()),
          h
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
          e.target.views.map((s) => s.view),
          e.start.view,
          t
        );
      } else {
        const t = this.camera.control2D.getScale()[0] || 1, s = this.camera.control2D.getScale()[1] || 1, n = this.getTargetView(e), r = [
          e.mouse.wheel.delta[1] / this.scaleFactor * t,
          e.mouse.wheel.delta[1] / this.scaleFactor * s,
          1
        ];
        if (!n) {
          console.warn("Could not find target view for wheel event");
          return;
        }
        this.doScale(
          e.screen.position,
          n,
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
    const s = ct(this.camera.control2D.offset);
    if (this.camera.control2D.getOffset()[0] = t[0], this.camera.control2D.getOffset()[1] = t[1], this.camera.control2D.getOffset()[2] = t[2], this.applyBounds(), this.camera.control2D.surface) {
      const o = this.camera.control2D.surface.getProjections(e);
      o && this.onRangeChanged(this.camera, o);
    }
    this.applyBounds();
    const n = ct(this.camera.control2D.getOffset()), r = this.camera.control2D.animation;
    this.camera.control2D.setOffset(s), this.camera.control2D.animation = this.cameraImmediateAnimation, this.camera.control2D.setOffset(n), this.camera.control2D.animation = r;
  }
  /**
   * This lets you set the visible range of a view based on the view's camera. This will probably not work
   * as expected if the view indicated and this controller do not share the same camera.
   *
   * @param viewId The id of the view when the view was generated when the surface was made
   */
  setRange(e, t) {
    const s = this.getProjection(t), n = this.getViewScreenBounds(t), r = this.getView(t);
    if (s && n && r) {
      const o = ti(
        [
          n.width / e.width,
          n.height / e.height,
          1
        ],
        this.camera.control2D.getScale()
      );
      this.camera.control2D.setScale(
        ri(
          this.camera.control2D.getScale(),
          this.scaleFilter(o, r, [r])
        )
      );
      const a = ti(
        [-e.x, -e.y, 0],
        this.camera.control2D.offset
      );
      this.camera.control2D.setOffset(
        ri(
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
class gm extends Wi {
  constructor(e, t) {
    super(e), this.offsetFilter = (s) => s, this.scaleFilter = (s) => s, this.base = t.base, this.offsetFilter = t.offsetFilter || this.offsetFilter, this.scaleFilter = t.scaleFilter || this.scaleFilter;
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
class bx extends ai {
  set control2D(e) {
  }
  get control2D() {
    return this._control2D;
  }
  constructor(e) {
    super(), this.base = e.base, this._control2D = new gm(this.base, {
      base: this.base.control2D,
      offsetFilter: e.offsetFilter,
      scaleFilter: e.scaleFilter
    });
  }
}
const mm = new ai();
class bm extends Vo {
  constructor() {
    super(...arguments), this.camera = mm;
  }
  /**
   * Maps a coordinate relative to the screen to a coordinate found within the world space.
   */
  screenToWorld(e, t) {
    const s = this.screenToView(e), n = t || [0, 0];
    return n[0] = (s[0] - this.camera.control2D.offset[0] * this.camera.scale2D[0]) / this.camera.scale2D[0], n[1] = (s[1] - this.camera.control2D.offset[1] * this.camera.scale2D[1]) / this.camera.scale2D[1], n;
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
    const s = [0, 0];
    return s[0] = (e[0] * this.camera.scale2D[0] + this.camera.control2D.offset[0] * this.camera.scale2D[0]) * this.pixelRatio, s[1] = (e[1] * this.camera.scale2D[1] + this.camera.control2D.offset[1] * this.camera.scale2D[1]) * this.pixelRatio, this.viewToScreen(s, t);
  }
  /**
   * Maps a coordinate relative to the view's viewport to a coordinate found within the world.
   */
  viewToWorld(e, t) {
    const s = t || [0, 0], n = e;
    return s[0] = (n[0] - this.camera.control2D.offset[0] * this.camera.scale2D[0]) / this.camera.scale2D[0], s[1] = (n[1] - this.camera.control2D.offset[1] * this.camera.scale2D[1]) / this.camera.scale2D[1], s;
  }
  /**
   * Maps a coordinate found within the world to a relative coordinate within the view's viewport.
   */
  worldToView(e, t) {
    const s = t || [0, 0];
    return s[0] = e[0] * this.camera.scale2D[0] + this.camera.control2D.offset[0] * this.camera.scale2D[0], s[1] = e[1] * this.camera.scale2D[1] + this.camera.control2D.offset[1] * this.camera.scale2D[1], s;
  }
}
function uc(i) {
  return i.projectionType === Vi.ORTHOGRAPHIC;
}
const aa = class aa extends cn {
  constructor(e, t) {
    super(e, t), this.projection = new bm(), this.projection.camera = t.camera || new ai();
  }
  /**
   * This operation makes sure we have the view camera adjusted to the new
   * viewport's needs. For default behavior this ensures that the coordinate
   * system has no distortion or perspective, orthographic, top left as 0,0 with
   * +y axis pointing down.
   */
  fitViewtoViewport(e, t) {
    if (uc(this.props.camera)) {
      const s = t.width, n = t.height, r = {
        bottom: -n / 2,
        far: 1e7,
        left: -s / 2,
        near: -100,
        right: s / 2,
        top: n / 2
      }, o = 1 / this.pixelRatio, a = 1 / this.pixelRatio, c = this.props.camera;
      c.projectionOptions = Object.assign(
        c.projectionOptions,
        r
      ), c.position = [
        t.width / (2 * this.pixelRatio),
        t.height / (2 * this.pixelRatio),
        c.position[2]
      ], c.scale = [o, -a, 1], c.lookAt(ri(c.position, [0, 0, -1]), [0, 1, 0]), c.update(), this.projection.viewBounds = t, t.d = this, this.projection.screenBounds = new J({
        height: this.viewBounds.height / this.pixelRatio,
        width: this.viewBounds.width / this.pixelRatio,
        x: this.viewBounds.x / this.pixelRatio,
        y: this.viewBounds.y / this.pixelRatio
      }), this.screenBounds.d = this;
    } else uc(this.props.camera) || console.warn("View2D does not support non-orthographic cameras.");
  }
  willUpdateProps(e) {
    this.projection.camera = e.camera;
  }
};
aa.defaultProps = {
  key: "",
  camera: new ai(),
  viewport: {
    left: 0,
    right: 0,
    bottom: 0,
    top: 0
  }
};
let ar = aa;
const xm = `precision highp float;

varying vec4 vertexColor;

void main() {
  gl_FragColor = vertexColor;
}
`, vm = `\${import: arc}
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
`, wm = `precision highp float;

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
var Tm = /* @__PURE__ */ ((i) => (i[i.NONE = 0] = "NONE", i[i.SCREEN_CURVE = 1] = "SCREEN_CURVE", i))(Tm || {});
const ot = class ot extends Be {
  /**
   * Define our shader and it's inputs
   */
  initShader() {
    const { scaleType: e } = this.props, t = this.props.animate || {}, {
      angle: s,
      angleOffset: n,
      center: r,
      radius: o,
      thickness: a,
      colorStart: c,
      colorEnd: l
    } = t, u = 150, h = {
      0: 1,
      [u * 2 + 2]: -1
    }, d = {
      0: 0,
      [u * 2 + 2]: 1
    };
    let f = 1;
    for (let g = 0; g < u * 2; ++g)
      h[g + 1] = f, d[g + 1] = Math.floor(g / 2) / (u - 1), f *= -1;
    const p = e === 0 ? vm : wm;
    return {
      fs: xm,
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
          easing: s,
          name: ot.attributeNames.angle,
          size: S.TWO,
          update: (g) => g.angle
        },
        {
          easing: n,
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
          size: A.ONE,
          update: (g) => [1]
        }
      ],
      vertexAttributes: [
        {
          name: "vertex",
          size: ke.THREE,
          update: (g) => [
            // Normal
            h[g],
            // The side of the quad
            d[g],
            // The number of vertices
            u * 2
          ]
        }
      ],
      vertexCount: u * 2 + 2,
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
  data: new ae(),
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
let hc = ot;
var Em = Object.defineProperty, ji = (i, e, t, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(e, t, n) || n);
  return n && Em(e, t, n), n;
};
const Ai = class Lu extends dt {
  constructor(e) {
    super(e), this.angle = [0, Math.PI], this.colorEnd = [1, 1, 1, 1], this.colorStart = [1, 1, 1, 1], this.center = [0, 0], this.depth = 0, this.angleOffset = 0, this.radius = 1, this.thickness = [5, 5], Xe(this, Lu), this.angle = e.angle || this.angle, this.colorEnd = e.colorEnd || this.colorEnd, this.colorStart = e.colorStart || this.colorStart, this.center = e.center || this.center, this.depth = e.depth || this.depth, this.radius = e.radius || this.radius, this.thickness = e.thickness || this.thickness;
  }
};
ji([
  I
], Ai.prototype, "angle");
ji([
  I
], Ai.prototype, "colorEnd");
ji([
  I
], Ai.prototype, "colorStart");
ji([
  I
], Ai.prototype, "center");
ji([
  I
], Ai.prototype, "depth");
ji([
  I
], Ai.prototype, "angleOffset");
ji([
  I
], Ai.prototype, "radius");
ji([
  I
], Ai.prototype, "thickness");
let xx = Ai;
const ym = `precision highp float;

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
`, Rm = `// Shader for rendering simple circles on a quad, using the fragment shader to create the 'roundness' of the shape.
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
`, Am = `precision highp float;

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
`, _m = `// This shader renders our circles with POINTS mode. This can perform better for more intensive scenarios but comes at
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
`, Bi = class Bi extends Be {
  /**
   * Define our shader and it's inputs
   */
  initShader() {
    var h, d;
    const { animate: e = {}, usePoints: t = !1, opacity: s = () => 1 } = this.props, {
      center: n,
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
    ], u = a.length;
    return {
      // This layer will support changes to the buffering strategy
      instancing: (h = this.props.bufferManagement) == null ? void 0 : h.instancing,
      baseBufferGrowthRate: (d = this.props.bufferManagement) == null ? void 0 : d.baseBufferGrowthRate,
      // Supports a POINTS or TRIANGLES mode for rendering
      drawMode: t ? x.Model.DrawMode.POINTS : x.Model.DrawMode.TRIANGLES,
      vs: t ? _m : Rm,
      fs: t ? [
        {
          outputType: G.COLOR,
          source: Am
        },
        {
          outputType: G.GLOW,
          source: `
              void main() {
                \${out: glow} = color;
              }
              `
        }
      ] : [
        {
          outputType: G.COLOR,
          source: ym
        },
        {
          outputType: G.GLOW,
          source: `
              void main() {
                \${out: glow} = color;
              }
              `
        }
      ],
      instanceAttributes: [
        {
          easing: n,
          name: Bi.attributeNames.center,
          size: S.TWO,
          update: (f) => f.center
        },
        {
          easing: r,
          name: Bi.attributeNames.radius,
          size: S.ONE,
          update: (f) => [f.radius]
        },
        {
          name: Bi.attributeNames.depth,
          size: S.ONE,
          update: (f) => [f.depth]
        },
        {
          easing: o,
          name: Bi.attributeNames.color,
          size: S.FOUR,
          update: (f) => f.color
        }
      ],
      uniforms: [
        {
          name: "layerOpacity",
          size: A.ONE,
          shaderInjection: _.ALL,
          update: (f) => [s()]
        }
      ],
      vertexAttributes: l,
      vertexCount: t ? 1 : u
    };
  }
  getMaterialOptions() {
    return it.transparentShapeBlending;
  }
};
Bi.defaultProps = {
  data: new ae(),
  key: ""
}, Bi.attributeNames = {
  center: "center",
  color: "color",
  depth: "depth",
  radius: "radius"
};
let dc = Bi;
var Im = Object.defineProperty, Ir = (i, e, t, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(e, t, n) || n);
  return n && Im(e, t, n), n;
};
const pn = class Nu extends dt {
  constructor(e) {
    super(e), this.color = [1, 1, 1, 1], this.depth = 0, this.radius = 0, this.center = [0, 0], Xe(this, Nu), this.color = e.color || this.color, this.radius = e.radius || this.radius, this.center = e.center || this.center, this.depth = e.depth || this.depth;
  }
  get width() {
    return this.radius * 2;
  }
  get height() {
    return this.radius * 2;
  }
};
Ir([
  I
], pn.prototype, "color");
Ir([
  I
], pn.prototype, "depth");
Ir([
  I
], pn.prototype, "radius");
Ir([
  I
], pn.prototype, "center");
let vx = pn;
const Mm = `precision highp float;

varying vec4 vertexColor;

void main() {
  \${out: color} = vertexColor;
}
`, Sm = `

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
}
`, Cm = `/**
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
`, Om = `/**
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
`, Lm = `/**
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
`, Nm = `/**
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
var jn = /* @__PURE__ */ ((i) => (i[i.NONE = 0] = "NONE", i[i.SCREEN_CURVE = 1] = "SCREEN_CURVE", i))(jn || {}), Jt = /* @__PURE__ */ ((i) => (i[i.LINE = 0] = "LINE", i[i.BEZIER = 1] = "BEZIER", i[i.BEZIER2 = 2] = "BEZIER2", i))(Jt || {}), Bu = /* @__PURE__ */ ((i) => (i[i.ALL = 0] = "ALL", i[i.PASS_Y = 1] = "PASS_Y", i[i.PASS_X = 2] = "PASS_X", i))(Bu || {});
function Bm(i) {
  return [i[0][0], i[0][1], i[1][0], i[1][1]];
}
const Pm = {
  [Jt.LINE]: Lm,
  [Jt.BEZIER]: Cm,
  [Jt.BEZIER2]: Om
}, Ye = class Ye extends Be {
  /**
   * Define our shader and it's inputs
   */
  initShader() {
    const {
      animate: e = {},
      scaleFactor: t = () => 1,
      type: s,
      scaleType: n = jn.NONE,
      smoothness: r = 50
    } = this.props, {
      end: o,
      start: a,
      startColor: c,
      endColor: l,
      control: u,
      thickness: h
    } = e, d = s === Jt.LINE ? 2 : r, f = {
      0: 1,
      [d * 2 + 2]: -1
    }, p = {
      0: 0,
      [d * 2 + 2]: 1
    };
    let g = 1;
    for (let v = 0; v < d * 2; ++v)
      f[v + 1] = g, p[v + 1] = Math.floor(v / 2) / (d - 1), g *= -1;
    const m = {
      interpolation: Pm[s]
    }, b = as({
      options: m,
      required: {
        name: "Edge Layer",
        values: ["interpolation"]
      },
      shader: n === jn.NONE ? Sm : Nm,
      // We do not want to remove any other templating options present
      onToken: (v, w) => v in m ? w : `\${${v}}`
    });
    return {
      fs: [
        {
          outputType: G.COLOR,
          source: Mm
        }
      ],
      instanceAttributes: [
        {
          easing: c,
          name: Ye.attributeNames.startColor,
          size: S.FOUR,
          update: (v) => v.startColor
        },
        {
          easing: l,
          name: Ye.attributeNames.endColor,
          size: S.FOUR,
          update: (v) => v.endColor
        },
        {
          easing: a,
          name: Ye.attributeNames.start,
          size: S.TWO,
          update: (v) => v.start
        },
        {
          easing: o,
          name: Ye.attributeNames.end,
          size: S.TWO,
          update: (v) => v.end
        },
        {
          easing: h,
          name: Ye.attributeNames.thickness,
          size: S.TWO,
          update: (v) => v.thickness
        },
        {
          name: Ye.attributeNames.depth,
          size: S.ONE,
          update: (v) => [v.depth]
        },
        s === Jt.LINE ? {
          easing: u,
          name: Ye.attributeNames.control,
          size: S.FOUR,
          update: (v) => [0, 0, 0, 0]
        } : null,
        s === Jt.BEZIER ? {
          easing: u,
          name: Ye.attributeNames.control,
          size: S.FOUR,
          update: (v) => [v.control[0][0], v.control[0][1], 0, 0]
        } : null,
        s === Jt.BEZIER2 ? {
          easing: u,
          name: Ye.attributeNames.control,
          size: S.FOUR,
          update: (v) => Bm(v.control)
        } : null
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: A.ONE,
          update: (v) => [t()]
        },
        {
          name: "layerOpacity",
          size: A.ONE,
          update: (v) => [
            this.props.opacity === void 0 ? 1 : this.props.opacity
          ]
        }
      ],
      vertexAttributes: [
        {
          name: "vertex",
          size: ke.THREE,
          update: (v) => [
            // Normal
            f[v],
            // The side of the quad
            p[v],
            // The number of vertices
            d * 2
          ]
        }
      ],
      vertexCount: d * 2 + 2,
      vs: b.shader
    };
  }
  getMaterialOptions() {
    return it.transparentShapeBlending;
  }
};
Ye.defaultProps = {
  broadphase: Bu.ALL,
  data: new ae(),
  key: "none",
  scaleType: jn.NONE,
  type: Jt.LINE
}, Ye.attributeNames = {
  control: "control",
  depth: "depth",
  end: "end",
  endColor: "endColor",
  start: "start",
  startColor: "startColor",
  thickness: "thickness"
};
let fc = Ye;
var Fm = Object.defineProperty, ps = (i, e, t, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(e, t, n) || n);
  return n && Fm(e, t, n), n;
};
const Hi = class Pu extends dt {
  constructor(e) {
    super(e), this.control = [
      [0, 0],
      [0, 0]
    ], this.depth = 0, this.end = [0, 0], this.endColor = [1, 1, 1, 1], this.start = [0, 0], this.startColor = [1, 1, 1, 1], this.thickness = [1, 1], Xe(this, Pu), this.startColor = e.startColor || this.startColor, this.endColor = e.endColor || this.endColor, this.control = e.control || this.control, this.depth = e.depth || this.depth, this.end = e.end || this.end, this.thickness = e.thickness || this.thickness, this.start = e.start || this.start;
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
    this.startColor = ii(e), this.endColor = ii(e);
  }
};
ps([
  I
], Hi.prototype, "control");
ps([
  I
], Hi.prototype, "depth");
ps([
  I
], Hi.prototype, "end");
ps([
  I
], Hi.prototype, "endColor");
ps([
  I
], Hi.prototype, "start");
ps([
  I
], Hi.prototype, "startColor");
ps([
  I
], Hi.prototype, "thickness");
let wx = Hi;
const he = ve("video");
function Dm(i) {
  he.enabled && (i.addEventListener("abort", () => he("abort")), i.addEventListener("canplay", () => he("canplay")), i.addEventListener("canplaythrough", () => he("canplaythrough")), i.addEventListener("durationchange", () => he("durationchange")), i.addEventListener("emptied", () => he("emptied")), i.addEventListener("ended", () => he("ended")), i.addEventListener("error", () => he("error")), i.addEventListener("loadeddata", () => he("loadeddata")), i.addEventListener("loadedmetadata", () => he("loadedmetadata")), i.addEventListener("loadstart", () => he("loadstart")), i.addEventListener("pause", () => he("pause")), i.addEventListener("play", () => he("play")), i.addEventListener("playing", () => he("playing")), i.addEventListener("progress", () => he("progress")), i.addEventListener("ratechange", () => he("ratechange")), i.addEventListener("seeked", () => he("seeked")), i.addEventListener("seeking", () => he("seeking")), i.addEventListener("stalled", () => he("stalled")), i.addEventListener("suspend", () => he("suspend")), i.addEventListener("timeupdate", () => he("timeupdate")), i.addEventListener("volumechange", () => he("volumechange")), i.addEventListener("waiting", () => he("waiting")));
}
const km = `precision highp float;

varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  gl_FragColor = texture2D(imageAtlas, texCoord) * vertexColor;
  gl_FragColor = gl_FragColor * gl_FragColor.a;
}
`, Um = `precision highp float;



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
`, zm = `precision highp float;

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
`, at = class at extends Be {
  constructor(e, t, s) {
    super(e, t, s);
  }
  /**
   * Define our shader and it's inputs
   */
  initShader() {
    const e = this.props.animate || {}, {
      tint: t,
      location: s,
      size: n,
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
      fs: km,
      instanceAttributes: [
        this.props.enableRotation ? {
          easing: r,
          name: at.attributeNames.rotation,
          size: S.ONE,
          update: (c) => [c.rotation]
        } : null,
        {
          easing: s,
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
          easing: n,
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
          size: A.ONE,
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
      vs: this.props.enableRotation ? zm : Um
    };
  }
  getMaterialOptions() {
    return it.transparentImageBlending;
  }
};
at.defaultProps = {
  key: "",
  data: new ae()
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
let uo = at;
function On(i) {
  return i && i.videoSrc;
}
const Hn = new Image();
Hn.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const ca = class ca extends Be {
  constructor() {
    super(...arguments), this.childProvider = new ae(), this.imageToResource = /* @__PURE__ */ new Map(), this.sourceToRequest = /* @__PURE__ */ new Map(), this.sourceToVideo = /* @__PURE__ */ new Map(), this.usingVideo = /* @__PURE__ */ new Map(), this.waitingForVideo = /* @__PURE__ */ new Map(), this.waitForVideoSource = /* @__PURE__ */ new Map(), this.originalOnReadyCallbacks = /* @__PURE__ */ new Map();
  }
  /**
   * The image layer will manage the resources for the images, and the child
   * layer will concern itself with rendering.
   */
  childLayers() {
    return [Vs(uo, {
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
    for (let n = 0, r = e.length; n < r; ++n) {
      const [o, a, c] = e[n];
      switch (a) {
        case me.CHANGE:
          if (c[t] !== void 0) {
            const l = this.imageToResource.get(o);
            let u = this.getAtlasSource(o);
            if (u === l) break;
            if (l instanceof HTMLVideoElement) {
              const h = this.waitForVideoSource.get(o);
              if (h) {
                this.waitForVideoSource.delete(o);
                const f = this.waitingForVideo.get(h);
                f && f.delete(o);
              }
              let d = this.usingVideo.get(
                l.getAttribute("data-source") || ""
              );
              d || (d = /* @__PURE__ */ new Set()), d.delete(o), d.size <= 0 && this.sourceToVideo.delete(
                l.getAttribute("data-source") || ""
              ), o.onReady = this.originalOnReadyCallbacks.get(o);
            }
            if (On(o.source) && (this.prepareVideo(o, o.source), u = this.getAtlasSource(o), hs(
              this.usingVideo,
              o.source.videoSrc,
              /* @__PURE__ */ new Set()
            ).add(o)), this.imageToResource.set(o, u), this.resource.request(
              this,
              o,
              Js({
                key: this.props.atlas || "",
                disposeResource: !0,
                source: l
              })
            ), u) {
              let h = this.sourceToRequest.get(u);
              (!h || h.texture && !h.texture.isValid) && (h = Js({
                key: this.props.atlas || "",
                source: u,
                rasterizationScale: this.props.rasterizationScale
              }), this.sourceToRequest.set(u, h)), o.request = h, this.resource.request(this, o, h);
            }
          }
          break;
        case me.INSERT:
          if (o.source) {
            let l = this.getAtlasSource(o);
            On(o.source) && (this.prepareVideo(o, o.source), l = this.getAtlasSource(o), hs(
              this.usingVideo,
              o.source.videoSrc,
              /* @__PURE__ */ new Set()
            ).add(o));
            let u = this.sourceToRequest.get(l);
            (!u || u.texture && !u.texture.isValid) && (u = Js({
              key: this.props.atlas || "",
              source: l,
              rasterizationScale: this.props.rasterizationScale
            }), this.sourceToRequest.set(l, u)), o.request = u;
          }
          break;
        case me.REMOVE: {
          const l = this.getAtlasSource(o);
          if (this.imageToResource.delete(o), On(o.source)) {
            const u = this.waitForVideoSource.get(o);
            if (u) {
              this.waitForVideoSource.delete(o);
              const d = this.waitingForVideo.get(u);
              d && d.delete(o);
            }
            let h = this.usingVideo.get(o.source.videoSrc);
            h || (h = /* @__PURE__ */ new Set()), h.delete(o), h.size <= 0 && this.sourceToVideo.delete(o.source.videoSrc), this.originalOnReadyCallbacks.delete(o);
          }
          this.resource.request(
            this,
            o,
            Js({
              key: this.props.atlas || "",
              disposeResource: !0,
              source: l
            })
          );
          break;
        }
      }
    }
    const s = [];
    this.usingVideo.forEach((n, r) => {
      n.size <= 0 && s.push(r);
    });
    for (let n = 0, r = s.length; n < r; ++n) {
      const o = s[n];
      this.usingVideo.delete(o), this.sourceToVideo.delete(o);
    }
  }
  /**
   * Gets the source that is atlas reques compatible.
   */
  getAtlasSource(e) {
    return On(e.source) ? this.sourceToVideo.get(e.source.videoSrc) || Hn : e.source;
  }
  /**
   * This handles creating the video object from the source. It then queues up
   * the waiting needs and temporarily converts the video Image to a simple
   * white image that will take on the tint of the ImageInstance.
   */
  prepareVideo(e, t) {
    const s = this.sourceToVideo.get(t.videoSrc);
    if (this.originalOnReadyCallbacks.get(e) || this.originalOnReadyCallbacks.set(e, e.onReady), s) {
      const f = this.waitingForVideo.get(t.videoSrc);
      if (f)
        f.add(e), this.waitForVideoSource.set(e, t.videoSrc), e.onReady = void 0, e.source = Hn, e.videoLoad = () => {
          s.load(), t.autoPlay && s.play();
        };
      else {
        const p = this.originalOnReadyCallbacks.get(e) || e.onReady;
        if (!p) return;
        e.onReady = (g) => {
          p(g, s);
        };
      }
      return;
    }
    const r = document.createElement("video");
    this.sourceToVideo.set(t.videoSrc, r), r.setAttribute("data-source", t.videoSrc), Dm(r);
    const o = new Ue(), a = new Ue(), c = () => {
      r.removeEventListener("loadedmetadata", u), r.removeEventListener("loadeddata", l), r.removeEventListener("error", h), this.waitingForVideo.delete(t.videoSrc), this.waitForVideoSource.delete(e);
    }, l = () => {
      a.resolve();
    }, u = () => {
      o.resolve();
    }, h = (f) => {
      let p;
      f.path && f.path[0] && (p = f.path[0].error), f.originalTarget && (p = f.originalTarget.error), console.warn(
        "There was an error loading the video resource to the atlas texture context"
      ), console.warn(p), o.reject({}), a.reject({});
    };
    r.addEventListener("loadedmetadata", u), r.addEventListener("loadeddata", l), r.addEventListener("error", h), e.onReady = void 0, hs(
      this.waitingForVideo,
      t.videoSrc,
      /* @__PURE__ */ new Set()
    ).add(e), this.waitForVideoSource.set(e, t.videoSrc), e.source = Hn, e.videoLoad = () => {
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
ca.defaultProps = {
  atlas: "default",
  key: "",
  data: new ae()
};
let pc = ca;
var Gm = Object.defineProperty, _i = (i, e, t, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(e, t, n) || n);
  return n && Gm(e, t, n), n;
};
const { max: Vm } = Math, $m = {
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
}, Gt = class Fu extends dt {
  constructor(e) {
    super(e), this.tint = [0, 0, 0, 1], this.depth = 0, this.height = 1, this.origin = [0, 0], this.scaling = ei.BOUND_MAX, this.width = 1, this.rotation = 0, this.sourceWidth = 0, this.sourceHeight = 0, this._anchor = {
      padding: 0,
      type: L.TopLeft,
      x: 0,
      y: 0
    }, this.videoLoad = Eo, Xe(this, Fu), this.depth = e.depth || this.depth, this.tint = e.tint || this.tint, this.scaling = e.scaling || this.scaling, this.origin = e.origin || this.origin, this.width = e.width || 1, this.height = e.height || 1, this.source = e.source, this.rotation = e.rotation || 0, this.onReady = e.onReady, e.anchor && this.setAnchor(e.anchor);
  }
  /**
   * This property reflects the maximum size a single dimension of the image
   * will take up. This means if you set this value to 100 at least the width or
   * the height will be 100 depending on the aspect ratio of the image.
   */
  get maxSize() {
    return Vm(this.width, this.height);
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
    $m[t.type](t, this), this._anchor = t;
  }
};
_i([
  I
], Gt.prototype, "tint");
_i([
  I
], Gt.prototype, "depth");
_i([
  I
], Gt.prototype, "height");
_i([
  I
], Gt.prototype, "origin");
_i([
  I
], Gt.prototype, "scaling");
_i([
  I
], Gt.prototype, "source");
_i([
  I
], Gt.prototype, "width");
_i([
  I
], Gt.prototype, "rotation");
_i([
  I
], Gt.prototype, "_anchor");
let Tx = Gt;
var Wm = Object.defineProperty, Ii = (i, e, t, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(e, t, n) || n);
  return n && Wm(e, t, n), n;
};
const Vt = class ho extends dt {
  constructor(e) {
    super(e), this.anchor = [0, 0], this.character = "a", this.color = [1, 1, 1, 1], this.depth = 0, this.fontScale = 1, this.maxScale = 1, this.offset = [0, 0], this.origin = [0, 0], this.padding = [0, 0], Xe(this, ho), this.origin = e.origin || this.origin, this.offset = e.offset || this.offset, this.character = e.character || this.character, this.color = e.color || this.color, this.maxScale = e.maxScale || this.maxScale, this.padding = e.padding || this.padding, this.anchor = e.anchor || this.anchor, this.onReady = e.onReady;
  }
  /**
   * Make a duplicate of this glyph
   */
  clone() {
    const e = new ho(this);
    e.onReady = this.onReady, e.request = this.request;
  }
  /**
   * This will trigger when the resource nmanager is ready to render this glyph.
   */
  resourceTrigger() {
    this.offset = this.offset, this.origin = this.origin, this.character = this.character, this.color = this.color, this.onReady && this.onReady(this);
  }
};
Ii([
  I
], Vt.prototype, "anchor");
Ii([
  I
], Vt.prototype, "character");
Ii([
  I
], Vt.prototype, "color");
Ii([
  I
], Vt.prototype, "depth");
Ii([
  I
], Vt.prototype, "fontScale");
Ii([
  I
], Vt.prototype, "maxScale");
Ii([
  I
], Vt.prototype, "offset");
Ii([
  I
], Vt.prototype, "origin");
Ii([
  I
], Vt.prototype, "padding");
let jm = Vt;
const gc = `varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  vec4 texColor = texture2D(fontMap, texCoord);
  if (texColor.r <= 0.0) discard;
  texColor.a = texColor.r;
  gl_FragColor = texColor * vertexColor;
}
`, mc = `varying vec4 vertexColor;
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
`, Hm = `varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  vec4 texColor = texture2D(fontMap, texCoord);
  if (texColor.r <= 0.0) discard;
  texColor.a = texColor.r;
  gl_FragColor = texColor * vertexColor;
}
`, Xm = `varying vec4 vertexColor;
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
`, Qm = `varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  vec4 texColor = texture2D(fontMap, texCoord);
  if (texColor.r <= 0.0) discard;
  texColor.a = texColor.r;
  gl_FragColor = texColor * vertexColor;
}
`, Ym = `varying vec4 vertexColor;
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
`, qm = `varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  vec4 texColor = texture2D(fontMap, texCoord);
  if (texColor.r <= 0.0) discard;
  texColor.a = texColor.r;
  gl_FragColor = texColor * vertexColor;
}
`, Km = `varying vec4 vertexColor;
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
`, Zm = `varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  vec4 texColor = texture2D(fontMap, texCoord);
  if (texColor.r <= 0.0) discard;
  texColor.a = texColor.r;
  gl_FragColor = texColor * vertexColor;
}
`, Jm = `varying vec4 vertexColor;
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
`, e0 = `varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  vec4 texColor = texture2D(fontMap, texCoord);
  if (texColor.r <= 0.0) discard;
  texColor.a = texColor.r;
  gl_FragColor = texColor * vertexColor;
}
`, t0 = `varying vec4 vertexColor;
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
`, Kt = class Kt extends Be {
  constructor() {
    super(...arguments), this.glyphRequests = {};
  }
  /**
   * Create the Shader IO needed to tie our instances and the GPU together.
   */
  initShader() {
    const e = this.props.animate || {}, {
      anchor: t,
      color: s,
      offset: n,
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
        return (!d.request || d.character !== d.request.character) && (this.glyphRequests[d.character] ? d.request = this.glyphRequests[d.character] : (d.request = $s({
          key: this.props.resourceKey || "",
          character: f
        }), this.glyphRequests[d.character] = d.request), d.request.fontMap && d.onReady && d.onReady(d)), d.request.fetch = Us.TEXCOORDS, this.resource.request(this, d, d.request);
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
        return (!d.request || d.character !== d.request.character) && (this.glyphRequests[d.character] ? d.request = this.glyphRequests[d.character] : (d.request = $s({
          key: this.props.resourceKey || "",
          character: f
        }), this.glyphRequests[d.character] = d.request), d.request.fontMap && d.onReady && d.onReady(d)), d.request.fetch = Us.IMAGE_SIZE, this.resource.request(this, d, d.request);
      }
    };
    a.childAttributes = [c];
    let l, u;
    switch (this.props.scaleMode || ei.ALWAYS) {
      case ei.BOUND_MAX: {
        l = this.props.inTextArea ? Zm : Hm, u = this.props.inTextArea ? Jm : Xm;
        break;
      }
      case ei.NEVER: {
        l = this.props.inTextArea ? Qm : e0, u = this.props.inTextArea ? t0 : Ym;
        break;
      }
      case ei.ALWAYS: {
        l = this.props.inTextArea ? qm : gc, u = this.props.inTextArea ? Km : mc;
        break;
      }
      default: {
        l = gc, u = mc;
        break;
      }
    }
    return {
      fs: l,
      instanceAttributes: [
        {
          easing: s,
          name: Kt.attributeNames.color,
          size: S.FOUR,
          update: (d) => d.color
        },
        {
          name: Kt.attributeNames.depth,
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
          name: Kt.attributeNames.anchor,
          size: S.TWO,
          update: (d) => d.anchor
        },
        {
          easing: r,
          name: Kt.attributeNames.origin,
          size: S.TWO,
          update: (d) => d.origin
        },
        {
          easing: n,
          name: Kt.attributeNames.offset,
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
      vs: u
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
Kt.defaultProps = {
  key: "",
  data: new ae(),
  resourceKey: "No resource specified"
}, Kt.attributeNames = {
  color: "color",
  depth: "depth",
  anchor: "anchor",
  origin: "origin",
  offset: "offset"
};
let fo = Kt;
const i0 = "...", bc = {
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
}, Li = [
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
  const e = Math.sqrt(ln(i, i));
  return Ae(i, 1 / -e);
}), xc = {
  [L.TopLeft]: (i) => {
    i.paddingDirection = Ae(Li[0], i.padding);
  },
  [L.TopMiddle]: (i) => {
    i.paddingDirection = Ae(Li[1], i.padding);
  },
  [L.TopRight]: (i) => {
    i.paddingDirection = Ae(Li[2], i.padding);
  },
  [L.MiddleLeft]: (i) => {
    i.paddingDirection = Ae(Li[3], i.padding);
  },
  [L.Middle]: (i) => {
    i.paddingDirection = [0, 0];
  },
  [L.MiddleRight]: (i) => {
    i.paddingDirection = Ae(Li[5], i.padding);
  },
  [L.BottomLeft]: (i) => {
    i.paddingDirection = Ae(Li[6], i.padding);
  },
  [L.BottomMiddle]: (i) => {
    i.paddingDirection = Ae(Li[7], i.padding);
  },
  [L.BottomRight]: (i) => {
    i.paddingDirection = Ae(Li[8], i.padding);
  },
  [L.Custom]: (i) => {
    i.paddingDirection = i.paddingDirection;
  }
};
function Pe(i) {
  if (i)
    return (e) => {
      i({
        ...e,
        instances: e.instances.map((t) => t.parentLabel).filter(ne)
      });
    };
}
const la = class la extends Be {
  constructor() {
    super(...arguments), this.fullUpdate = !1, this.glyphProvider = new ae(), this.labelToGlyphs = /* @__PURE__ */ new Map(), this.labelToKerningRequest = /* @__PURE__ */ new Map(), this.labelWaitingOnGlyph = /* @__PURE__ */ new Map(), this.truncationWidth = -1, this.handleGlyphReady = (e) => {
      if (!e.parentLabel) {
        delete e.onReady;
        return;
      }
      const t = e.parentLabel, s = this.labelWaitingOnGlyph.get(e.parentLabel);
      if (s && s.has(e) && (s.delete(e), s.size <= 0)) {
        const n = t.onReady;
        n && n(t);
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
      Vs(this.props.customGlyphLayer || fo, {
        animate: this.props.animate,
        data: this.glyphProvider,
        key: `${this.id}.glyphs`,
        resourceKey: this.props.resourceKey,
        scaleMode: this.props.scaleMode || ei.BOUND_MAX,
        inTextArea: this.props.inTextArea,
        picking: this.props.picking,
        onMouseClick: Pe(this.props.onMouseClick),
        onMouseUp: Pe(this.props.onMouseUp),
        onMouseDown: Pe(this.props.onMouseDown),
        onMouseOut: Pe(this.props.onMouseOut),
        onMouseOver: Pe(this.props.onMouseOver),
        onMouseMove: Pe(this.props.onMouseMove),
        onMouseUpOutside: Pe(this.props.onMouseUpOutside),
        onTap: Pe(this.props.onTap),
        onTouchDown: Pe(this.props.onTouchDown),
        onTouchUp: Pe(this.props.onTouchUp),
        onTouchUpOutside: Pe(this.props.onTouchUpOutside),
        onTouchMove: Pe(this.props.onTouchMove),
        onTouchOut: Pe(this.props.onTouchOut),
        onTouchOver: Pe(this.props.onTouchOver),
        onTouchAllEnd: Pe(this.props.onTouchAllEnd),
        onTouchAllOut: Pe(this.props.onTouchAllOut)
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
      const h = e[0][0];
      this.propertyIds = this.getInstanceObservableIds(h, [
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
      active: s,
      anchor: n,
      color: r,
      origin: o,
      fontSize: a,
      maxWidth: c,
      maxScale: l,
      letterSpacing: u
    } = this.propertyIds;
    for (let h = 0, d = e.length; h < d; ++h) {
      const [f, p, g] = e[h];
      switch (p) {
        case me.CHANGE:
          if (!this.labelToGlyphs.get(f)) {
            this.insert(f);
            continue;
          }
          g[t] !== void 0 ? (this.invalidateRequest(f), this.layoutGlyphs(f)) : g[s] !== void 0 && (f.active ? (this.layoutGlyphs(f), this.showGlyphs(f)) : this.hideGlyphs(f)), g[n] && this.updateAnchor(f), g[r] !== void 0 && this.updateGlyphColors(f), g[o] !== void 0 && this.updateGlyphOrigins(f), g[l] !== void 0 && this.updateGlyphMaxScales(f), g[a] !== void 0 && (this.invalidateRequest(f), this.layoutGlyphs(f)), g[c] !== void 0 && (this.invalidateRequest(f), this.layoutGlyphs(f)), g[u] !== void 0 && (this.invalidateRequest(f), this.layoutGlyphs(f));
          break;
        case me.INSERT:
          this.insert(f);
          break;
        case me.REMOVE: {
          const m = this.labelToGlyphs.get(f);
          if (m) {
            for (let b = 0, v = m.length; b < v; ++b)
              this.glyphProvider.remove(m[b]);
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
      for (let s = 0, n = t.length; s < n; ++s)
        this.glyphProvider.remove(t[s]);
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
    const s = t.metrics;
    if (!s || !s.layout) return;
    const n = s.layout;
    this.updateGlyphs(e, n);
    const r = e.glyphs;
    e.size = n.size, bc[e.anchor.type](e.anchor, e), xc[e.anchor.type](e.anchor);
    const o = e.anchor, a = e.anchor.paddingDirection;
    for (let c = 0, l = Math.min(n.positions.length, r.length); c < l; ++c) {
      const u = n.positions[c], h = r[c];
      h.offset = u, h.fontScale = n.fontScale, h.anchor = [o.x || 0, o.y || 0], h.origin = Io(e.origin), h.padding = a || [0, 0], h.maxScale = e.maxScale;
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
      for (let s = 0, n = t.length; s < n; ++s)
        this.glyphProvider.add(t[s]);
  }
  /**
   * Updates the anchor position of the instance when set
   */
  updateAnchor(e) {
    const t = e.glyphs;
    if (!t) return;
    bc[e.anchor.type](e.anchor, e), xc[e.anchor.type](e.anchor);
    const s = e.anchor, n = e.anchor.paddingDirection;
    for (let r = 0, o = t.length; r < o; ++r)
      t[r].anchor = [s.x || 0, s.y || 0], t[r].padding = n || [0, 0];
  }
  /**
   * This ensures the correct number of glyphs is being provided for the label indicated.
   */
  updateGlyphs(e, t) {
    let s = this.labelToGlyphs.get(e);
    s || (s = [], this.labelToGlyphs.set(e, s));
    let n = this.labelWaitingOnGlyph.get(e);
    n || (n = /* @__PURE__ */ new Set(), this.labelWaitingOnGlyph.set(e, n));
    for (let r = 0, o = Math.min(s.length, t.glyphs.length); r < o; ++r) {
      const a = s[r];
      a.character !== t.glyphs[r] && (a.character = t.glyphs[r], (!a.request || !a.request.fontMap || !a.request.fontMap.glyphMap[a.character]) && n.add(a));
    }
    if (s.length < t.glyphs.length) {
      let r = 0;
      for (let o = s.length, a = t.glyphs.length; o < a; ++o, ++r) {
        const c = t.glyphs[o], l = new jm({
          character: c,
          color: e.color,
          origin: e.origin,
          maxScale: e.maxScale,
          onReady: this.handleGlyphReady
        });
        l.parentLabel = e, s.push(l), e.active && this.glyphProvider.add(l), n.add(l);
      }
    } else if (s.length > t.glyphs.length) {
      for (let r = t.glyphs.length, o = s.length; r < o; ++r) {
        const a = s[r];
        this.glyphProvider.remove(a);
      }
      for (; s.length > t.glyphs.length; ) s.pop();
    }
    e.glyphs = s;
  }
  /**
   * Updates the glyph colors to match the label's glyph colors
   */
  updateGlyphColors(e) {
    const t = e.glyphs;
    if (t)
      for (let s = 0, n = t.length; s < n; ++s)
        t[s].color = ii(e.color);
  }
  /**
   * This updates all of the glyphs for the label to have the same position
   * as the label.
   */
  updateGlyphOrigins(e) {
    const t = e.glyphs;
    if (!t) return;
    const s = e.origin;
    for (let n = 0, r = t.length; n < r; ++n)
      t[n].origin = [s[0], s[1]];
  }
  /**
   * This updates all of the glyphs for the label to have the same position
   * as the label.
   */
  updateGlyphMaxScales(e) {
    const t = e.glyphs;
    if (!t) return;
    const s = e.maxScale;
    for (let n = 0, r = t.length; n < r; ++n)
      t[n].maxScale = s;
  }
  /**
   * Checks the label to ensure calculated kerning supports the text specified.
   *
   * Returns true when the kerning information is already available
   */
  updateKerning(e) {
    let t = this.labelToKerningRequest.get(e);
    const s = e.text;
    if (t) {
      if (t.kerningPairs && t.kerningPairs.indexOf(s) > -1)
        return !!t.fontMap;
      if (t.fontMap && !t.fontMap.supportsKerning(
        s.replace(/\s/g, "")
      ))
        this.labelToKerningRequest.delete(e), t = void 0;
      else
        return !0;
    }
    if (!t) {
      const n = {
        // We want the request to return all of the metrics for the text as well
        fontSize: e.fontSize,
        text: e.text,
        letterSpacing: e.letterSpacing
      };
      return e.maxWidth > 0 && (n.maxWidth = e.maxWidth, n.truncation = this.props.truncation || i0), t = $s({
        key: this.props.resourceKey || "",
        character: "",
        kerningPairs: [s],
        metrics: n
      }), e.preload ? (e.resourceTrigger = () => {
        e.onReady && e.onReady(e);
      }, this.resource.request(this, e, t)) : (this.resource.request(this, e, t, {
        resource: {
          type: oe.FONT,
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
la.defaultProps = {
  key: "",
  data: new ae()
};
let po = la;
var s0 = Object.defineProperty, $t = (i, e, t, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(e, t, n) || n);
  return n && s0(e, t, n), n;
};
const vt = class Du extends dt {
  constructor(e) {
    super(e), this.color = [0, 0, 0, 1], this.depth = 0, this.fontSize = 12, this.maxScale = 1, this.maxWidth = 0, this.origin = [0, 0], this.scale = 1, this.text = "", this.letterSpacing = 0, this.preload = !1, this.glyphs = [], this.size = [0, 0], this.truncatedText = "", this.anchor = {
      padding: 0,
      paddingDirection: [0, 0],
      type: L.TopLeft,
      x: 0,
      y: 0
    }, Xe(this, Du), this.anchor = e.anchor || this.anchor, this.color = e.color || this.color, this.depth = e.depth || this.depth, this.fontSize = e.fontSize || this.fontSize, this.maxScale = e.maxScale || this.maxScale, this.maxWidth = e.maxWidth || 0, this.onReady = e.onReady, this.origin = e.origin, this.preload = e.preload || !1, this.scale = e.scale || this.scale, this.text = e.text || this.text, this.letterSpacing = e.letterSpacing || this.letterSpacing, e.anchor && this.setAnchor(e.anchor);
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
    const t = [], s = this.text.indexOf(e);
    if (s < 0) return t;
    let n = 0;
    for (let r = 0, o = Math.min(this.text.length, s + e.length); r < o; ++r)
      Ss(this.text[r]) || (n++, r >= s && t.push(this.glyphs[n]));
    return t;
  }
  /**
   * Trigger for when resources are prepped for this instance
   */
  resourceTrigger() {
  }
};
$t([
  I
], vt.prototype, "color");
$t([
  I
], vt.prototype, "depth");
$t([
  I
], vt.prototype, "fontSize");
$t([
  I
], vt.prototype, "maxScale");
$t([
  I
], vt.prototype, "maxWidth");
$t([
  I
], vt.prototype, "origin");
$t([
  I
], vt.prototype, "scale");
$t([
  I
], vt.prototype, "text");
$t([
  I
], vt.prototype, "letterSpacing");
$t([
  I
], vt.prototype, "anchor");
let Ne = vt;
var n0 = Object.defineProperty, gs = (i, e, t, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(e, t, n) || n);
  return n && n0(e, t, n), n;
}, go = /* @__PURE__ */ ((i) => (i[i.LEFT = 0] = "LEFT", i[i.RIGHT = 1] = "RIGHT", i[i.CENTERED = 2] = "CENTERED", i))(go || {}), qt = /* @__PURE__ */ ((i) => (i[i.NONE = 0] = "NONE", i[i.CHARACTER = 1] = "CHARACTER", i[i.WORD = 2] = "WORD", i))(qt || {}), en = /* @__PURE__ */ ((i) => (i[i.NEWLINE = 0] = "NEWLINE", i))(en || {});
const Xi = class ku extends Ne {
  constructor(e) {
    super(e), this.maxHeight = 0, this.lineHeight = 0, this.wordWrap = 0, this.alignment = 0, this.labels = [], this.newLabels = [], this.borders = [], this.padding = [0, 0, 0, 0], this.borderWidth = 6, this.hasBorder = !0, this.spaceWidth = 0, Xe(this, ku), this.color = e.color, this.origin = e.origin, this.oldOrigin = e.origin, this.text = e.text, this.fontSize = e.fontSize || this.fontSize, this.maxWidth = e.maxWidth || this.maxWidth, this.maxHeight = e.maxHeight || this.maxHeight, this.lineHeight = e.lineHeight || this.lineHeight, this.wordWrap = e.wordWrap || this.wordWrap, this.alignment = e.alignment || this.alignment, this.padding = e.padding || this.padding, this.borderWidth = e.borderWidth || this.borderWidth, this.hasBorder = e.hasBorder !== void 0 ? e.hasBorder : this.hasBorder, this.letterSpacing = e.letterSpacing || this.letterSpacing;
  }
};
gs([
  I
], Xi.prototype, "maxHeight");
gs([
  I
], Xi.prototype, "lineHeight");
gs([
  I
], Xi.prototype, "wordWrap");
gs([
  I
], Xi.prototype, "alignment");
gs([
  I
], Xi.prototype, "padding");
gs([
  I
], Xi.prototype, "borderWidth");
gs([
  I
], Xi.prototype, "hasBorder");
let Ex = Xi;
var r0 = Object.defineProperty, Wt = (i, e, t, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(e, t, n) || n);
  return n && r0(e, t, n), n;
};
const o0 = {
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
}, wt = class Uu extends dt {
  constructor(e) {
    super(e), this.color = [0, 0, 0, 1], this.depth = 0, this.maxScale = 1, this.scale = 1, this.scaling = ei.BOUND_MAX, this.size = [1, 1], this.position = [0, 0], this.outline = 0, this.outlineColor = [0, 0, 0, 1], this._anchor = {
      padding: 0,
      type: L.TopLeft,
      x: 0,
      y: 0
    }, Xe(this, Uu), this.depth = e.depth || this.depth, this.color = e.color || this.color, this.scaling = e.scaling || this.scaling, this.position = e.position || this.position, this.size = e.size || this.size, this.outline = e.outline || this.outline, this.outlineColor = e.outlineColor || this.outlineColor, e.anchor && this.setAnchor(e.anchor);
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
    o0[t.type](t, this), this._anchor = t;
  }
};
Wt([
  I
], wt.prototype, "color");
Wt([
  I
], wt.prototype, "depth");
Wt([
  I
], wt.prototype, "maxScale");
Wt([
  I
], wt.prototype, "scale");
Wt([
  I
], wt.prototype, "scaling");
Wt([
  I
], wt.prototype, "size");
Wt([
  I
], wt.prototype, "position");
Wt([
  I
], wt.prototype, "outline");
Wt([
  I
], wt.prototype, "outlineColor");
Wt([
  I
], wt.prototype, "_anchor");
let a0 = wt;
var c0 = Object.defineProperty, Jo = (i, e, t, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(e, t, n) || n);
  return n && c0(e, t, n), n;
};
const Mr = class zu extends a0 {
  constructor(e) {
    super(e), this.fontScale = 1, this.textAreaOrigin = [0, 0], this.textAreaAnchor = [0, 0], Xe(this, zu), this.fontScale = e.fontScale || this.fontScale, this.textAreaOrigin = e.textAreaOrigin || this.textAreaOrigin, this.textAreaAnchor = e.textAreaAnchor || this.textAreaAnchor;
  }
};
Jo([
  I
], Mr.prototype, "fontScale");
Jo([
  I
], Mr.prototype, "textAreaOrigin");
Jo([
  I
], Mr.prototype, "textAreaAnchor");
let Ln = Mr;
const l0 = `precision highp float;

varying vec4 vertexColor;

void main() {
  gl_FragColor = vertexColor;
}
`, u0 = `precision highp float;

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
`, qe = class qe extends Be {
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
    }, s = {
      0: 0,
      1: 0,
      2: 0,
      3: 1,
      4: 1,
      5: 1
    }, { scaleFactor: n = () => 1 } = this.props;
    return {
      fs: l0,
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
          size: A.ONE,
          update: (r) => [n()]
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
            s[r]
          ]
        }
      ],
      vertexCount: 6,
      vs: u0
    };
  }
  getMaterialOptions() {
    return it.transparentShapeBlending;
  }
};
qe.defaultProps = {
  key: "",
  data: new ae()
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
let mo = qe;
const Ni = {
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
function Nn(i, e) {
  let t = Number.MAX_SAFE_INTEGER;
  for (let s = 0, n = i.length; s < n; s++) {
    const r = i[s], o = e.get(r);
    o === 0 ? t = 0 : o && o < t && (t = o);
  }
  return t === Number.MAX_SAFE_INTEGER ? 0 : t;
}
function h0(i) {
  const e = [], t = i.split(rh);
  for (let r = 0, o = t.length - 1; r < o; r++)
    t[r].split(" ").forEach((l) => {
      l !== "" && e.push(l);
    }), e.push(`
`);
  return t[t.length - 1].split(" ").forEach((r) => {
    r !== "" && e.push(r);
  }), e;
}
function d0(i, e) {
  const t = /* @__PURE__ */ new Map();
  if (e.fontMap) {
    const s = e.fontMap.fontSource.size, n = i.fontSize / s, r = e.fontMap, o = i.text.replace(/\s/g, "");
    let a = Number.MAX_SAFE_INTEGER, c = 0, l, u = "";
    for (let h = 0, d = o.length; h < d; ++h) {
      const f = o[h];
      l = 0, u && (l = r.kerning[u][f][1] || 0), c = c + l * n, t.set(f, c), a = Math.min(c, a), u = f;
    }
    t.forEach((h, d) => {
      t.set(d, h - a);
    });
  }
  return t;
}
function f0(i, e, t) {
  const s = [], n = t.fontMap ? t.fontMap.fontSource.size : e.fontSize, r = e.fontSize / n;
  let o = "", a = 0, c = [0, 0];
  for (let l = 0, u = i.text.length; l < u; l++) {
    const h = i.text[l];
    if (t.fontMap) {
      let d = [0, 0];
      o && (d = t.fontMap.kerning[o][h] || [0, 0]), c = Gi(c, Ae(d, r)), l !== 0 && (c = Gi(c, [e.letterSpacing, 0]));
      const f = t.fontMap.glyphMap[h];
      a = c[0] + f.pixelWidth * r, s.push(a), o = h;
    }
  }
  return s;
}
const ua = class ua extends Be {
  constructor() {
    super(...arguments), this.providers = {
      /** Provider for the label layer this layer manages */
      labels: new ae(),
      /** Provider for the border layer that renders the border of text area */
      borders: new ae()
    }, this.fullUpdate = !1, this.areaToLabels = /* @__PURE__ */ new Map(), this.areaToLines = /* @__PURE__ */ new Map(), this.areaWaitingOnLabel = /* @__PURE__ */ new Map(), this.areaTokerningRequest = /* @__PURE__ */ new Map(), this.areaToWords = /* @__PURE__ */ new Map(), this.labelsInLine = [], this.handleLabelReady = (e) => {
      if (!e.parentTextArea) {
        delete e.onReady;
        return;
      }
      const t = e.parentTextArea, s = this.areaWaitingOnLabel.get(t);
      if (s && s.has(e) && (s.delete(e), s.size <= 0)) {
        t.active = !0;
        const n = t.onReady;
        n && n(t);
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
    const e = this.props.animateLabel || {}, t = this.props.animateBorder || {}, s = this.props.scaling;
    return [
      Vs(po, {
        animate: e,
        customGlyphLayer: this.props.customGlyphLayer,
        data: this.providers.labels,
        key: `${this.id}.labels`,
        resourceKey: this.props.resourceKey,
        scaleMode: s,
        inTextArea: !0
      }),
      Vs(mo, {
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
      alignment: s,
      borderWidth: n,
      color: r,
      fontSize: o,
      hasBorder: a,
      letterSpacing: c,
      lineHeight: l,
      maxHeight: u,
      maxWidth: h,
      origin: d,
      padding: f,
      text: p,
      wordWrap: g
    } = this.propertyIds;
    for (let m = 0, b = e.length; m < b; ++m) {
      const [v, w, E] = e[m];
      switch (w) {
        case me.CHANGE:
          if (!this.areaToLabels.get(v)) {
            this.insert(v);
            continue;
          }
          E[p] !== void 0 ? (this.clear(v), this.updateLabels(v), this.layout(v)) : E[t] !== void 0 && (v.active ? (this.layout(v), this.showLabels(v)) : this.hideLabels(v)), E[s] !== void 0 && (this.clear(v), this.updateLabels(v), this.layoutLabels(v)), E[r] !== void 0 && this.updateLabelColors(v), E[d] !== void 0 && this.updateLabelOrigins(v), E[o] !== void 0 && this.updateLabelFontSizes(v), E[g] !== void 0 && this.updateLabelLineWrap(v), E[l] !== void 0 && this.updateLabelLineHeight(v), E[h] !== void 0 && this.updateTextAreaSize(v), E[u] !== void 0 && this.updateTextAreaSize(v), E[f] !== void 0 && this.updateTextAreaSize(v), E[n] !== void 0 && this.updateBorderWidth(v), E[a] !== void 0 && this.updateBorder(v), E[c] !== void 0 && this.updateLetterSpacing(v);
          break;
        case me.INSERT:
          this.insert(v);
          break;
        case me.REMOVE: {
          const y = this.areaToLabels.get(v);
          if (y) {
            for (let C = 0, M = y.length; C < M; ++C) {
              const R = y[C];
              R instanceof Ne && this.providers.labels.remove(R);
            }
            this.areaToLabels.delete(v), this.areaWaitingOnLabel.delete(v);
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
      for (let s = 0, n = t.length; s < n; ++s) {
        const r = t[s];
        r instanceof Ne && this.providers.labels.remove(r);
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
    for (let n = 0, r = t.length; n < r; n++) {
      const o = t[n];
      o instanceof Ne && this.providers.labels.remove(o);
    }
    e.labels = [];
    const s = e.newLabels;
    for (let n = 0, r = s.length; n < r; n++) {
      const o = s[n];
      o instanceof Ne && this.providers.labels.remove(o);
    }
    e.newLabels = [], this.areaToLabels.delete(e), this.areaWaitingOnLabel.delete(e), this.areaToWords.delete(e);
  }
  /** When a label exceeds the maxWidth of a textArea, sperate it into several parts */
  seperateLabel(e, t, s, n, r, o, a, c, l) {
    const u = e.padding[0], h = e.padding[1] || 0, d = e.padding[2] || 0, f = e.padding[3] || 0, p = e.maxWidth - f - h, g = e.maxHeight - u - d, m = e.origin[0], b = e.origin[1];
    t.active = !1;
    const v = n.substring(0, r + 1), w = Nn(v, s), E = Ni[e.anchor.type](e), y = new Ne({
      anchor: {
        padding: 0,
        type: L.Custom,
        paddingDirection: [
          o + f,
          a + u + w
        ],
        x: E[0],
        y: E[1]
      },
      color: e.color,
      fontSize: e.fontSize,
      letterSpacing: e.letterSpacing,
      origin: [m, b],
      text: v
    });
    if (y.size = [l[r], t.size[1]], this.providers.labels.add(y), e.newLabels.push(y), this.labelsInLine.push(y), o += y.getWidth() + c, e.wordWrap === qt.CHARACTER || e.wordWrap === qt.WORD) {
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
          const R = n.substring(r + 1, M + 1), V = Nn(R, s), z = new Ne({
            anchor: {
              padding: 0,
              type: L.Custom,
              paddingDirection: [
                o + f,
                a + u + V
              ],
              x: E[0],
              y: E[1]
            },
            color: e.color,
            fontSize: e.fontSize,
            letterSpacing: e.letterSpacing,
            origin: [m, b],
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
          const M = n.substring(r + 1), R = Nn(M, s), V = new Ne({
            anchor: {
              padding: 0,
              type: L.Custom,
              paddingDirection: [
                o + f,
                a + u + R
              ],
              x: E[0],
              y: E[1]
            },
            color: e.color,
            fontSize: e.fontSize,
            letterSpacing: e.letterSpacing,
            origin: [m, b],
            text: M
          });
          V.size = [
            l[l.length - 1] - l[r],
            t.size[1]
          ], this.labelsInLine.push(V);
          const z = [];
          for (let N = r + 1; N < l.length; N++)
            z.push(l[N] - l[r]);
          this.providers.labels.add(V), e.newLabels.push(V), o += V.getWidth() + c;
        }
      }
    } else e.wordWrap === qt.NONE && (o += y.getWidth() + c);
    return [o, a];
  }
  /**
   * This updates textAreaInstance after lineWrap is changed
   */
  updateLabelLineWrap(e) {
    const t = this.areaToLabels.get(e);
    if (t) {
      for (let s = 0, n = t.length; s < n; ++s) {
        const r = t[s];
        r instanceof Ne && (r.active = !0);
      }
      for (let s = 0, n = e.newLabels.length; s < n; ++s) {
        const r = e.newLabels[s];
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
      for (let s = 0, n = t.length; s < n; ++s) {
        const r = t[s];
        r instanceof Ne && (r.active = !0);
      }
      for (let s = 0, n = e.newLabels.length; s < n; ++s) {
        const r = e.newLabels[s];
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
      for (let s = 0, n = t.length; s < n; ++s) {
        const r = t[s];
        r instanceof Ne && (r.active = !0);
      }
      for (let s = 0, n = e.newLabels.length; s < n; ++s) {
        const r = e.newLabels[s];
        this.providers.labels.remove(r);
      }
      e.newLabels = [];
      for (let s = 0, n = e.borders.length; s < n; ++s) {
        const r = e.borders[s];
        this.providers.borders.remove(r);
      }
      e.borders = [], this.layoutBorder(e), this.layoutLabels(e);
    }
  }
  /**
   * Update thickness of border
   */
  updateBorderWidth(e) {
    for (let t = 0, s = e.borders.length; t < s; ++t) {
      const n = e.borders[t];
      this.providers.borders.remove(n);
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
      for (let t = 0, s = e.borders.length; t < s; ++t) {
        const n = e.borders[t];
        this.providers.borders.remove(n);
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
  setTextAlignment(e, t, s, n, r) {
    if (e - s < n && r !== go.LEFT) {
      const o = n - e + s, a = r === go.RIGHT ? o : o / 2;
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
      const s = t.fontMap ? t.fontMap.fontSource.size : e.fontSize, n = e.fontSize / s, r = this.props.scaling, o = e.borderWidth, a = new Ln({
        color: e.color,
        fontScale: n,
        scaling: r,
        size: [e.maxWidth + 2 * o, o],
        textAreaOrigin: e.origin,
        textAreaAnchor: Ni[e.anchor.type](e),
        position: [-o, -o]
      }), c = new Ln({
        color: e.color,
        fontScale: n,
        scaling: r,
        size: [o, e.maxHeight + 2 * o],
        textAreaOrigin: e.origin,
        textAreaAnchor: Ni[e.anchor.type](e),
        position: [-o, -o]
      }), l = new Ln({
        color: e.color,
        fontScale: n,
        scaling: r,
        size: [o, e.maxHeight + 2 * o],
        textAreaOrigin: e.origin,
        textAreaAnchor: Ni[e.anchor.type](e),
        position: [e.maxWidth, -o]
      }), u = new Ln({
        color: e.color,
        fontScale: n,
        scaling: r,
        size: [e.maxWidth + 2 * o, o],
        textAreaOrigin: e.origin,
        textAreaAnchor: Ni[e.anchor.type](e),
        position: [-o, e.maxHeight]
      });
      this.providers.borders.add(a), this.providers.borders.add(c), this.providers.borders.add(l), this.providers.borders.add(u), e.borders.push(a), e.borders.push(c), e.borders.push(l), e.borders.push(u);
    }
  }
  /**
   * Calculate the positions of labels
   */
  layoutLabels(e) {
    const t = this.areaTokerningRequest.get(e);
    if (!t) return;
    const s = e.padding[0], n = e.padding[1] || 0, r = e.padding[2] || 0, o = e.padding[3] || 0, a = e.maxWidth - o - n, c = e.maxHeight - s - r, l = e.origin[0], u = e.origin[1];
    let h = 0;
    if (e.spaceWidth)
      h = e.spaceWidth;
    else {
      if (t.fontMap) {
        const g = t.fontMap.fontSource.size, m = e.fontSize / g;
        h = t.fontMap.spaceWidth * m;
      } else
        h = this.props.whiteSpaceKerning || e.fontSize / 2;
      e.spaceWidth = h;
    }
    const d = d0(e, t);
    let f = 0, p = 0;
    this.labelsInLine = [];
    for (let g = 0, m = e.labels.length; g < m; ++g) {
      const b = e.labels[g];
      if (b instanceof Ne) {
        const v = b.getWidth(), w = Nn(b.text, d), E = f0(b, e, t);
        if (p + e.lineHeight <= c && E[0] <= a)
          if (f + v <= a) {
            b.origin = [l, u];
            const y = Ni[e.anchor.type](e);
            b.anchor = {
              padding: 0,
              paddingDirection: [
                f + o,
                p + s + w
              ],
              type: L.Custom,
              x: y[0],
              y: y[1]
            }, f += v + h, this.labelsInLine.push(b), f >= a && e.wordWrap === qt.CHARACTER && g + 1 < m && e.labels[g + 1] !== en.NEWLINE && (this.setTextAlignment(
              f,
              p,
              h,
              a,
              e.alignment
            ), f = 0, p += e.lineHeight);
          } else if (e.wordWrap === qt.WORD && b.getWidth() <= e.maxWidth)
            if (this.setTextAlignment(
              f,
              p,
              h,
              a,
              e.alignment
            ), f = 0, p += e.lineHeight, p + e.lineHeight <= c) {
              b.origin = [l, u];
              const y = Ni[e.anchor.type](e);
              b.anchor = {
                padding: 0,
                paddingDirection: [
                  f + o,
                  p + s + w
                ],
                type: L.Custom,
                x: y[0],
                y: y[1]
              }, this.labelsInLine.push(b), f += b.getWidth() + h;
            } else
              b.active = !1;
          else {
            const y = a - f;
            let C = E.length - 1;
            const M = b.text;
            for (; E[C] > y; )
              C--;
            if (C >= 0) {
              const R = this.seperateLabel(
                e,
                b,
                d,
                M,
                C,
                f,
                p,
                h,
                E
              );
              f = R[0], p = R[1];
            } else if (e.wordWrap === qt.CHARACTER || e.wordWrap === qt.WORD)
              if (this.setTextAlignment(
                f,
                p,
                h,
                a,
                e.alignment
              ), p += e.lineHeight, f = 0, p + e.lineHeight < c)
                if (f + b.getWidth() <= a) {
                  b.origin = [l, u];
                  const R = Ni[e.anchor.type](e);
                  b.anchor = {
                    padding: 0,
                    paddingDirection: [
                      f + o,
                      p + s + w
                    ],
                    type: L.Custom,
                    x: R[0],
                    y: R[1]
                  }, this.labelsInLine.push(b), f += b.getWidth() + h, f >= a && g + 1 < m && e.labels[g + 1] !== en.NEWLINE && (this.setTextAlignment(
                    f,
                    p,
                    h,
                    a,
                    e.alignment
                  ), f = 0, p += e.lineHeight);
                } else {
                  const R = a - f;
                  let V = E.length - 1;
                  const z = b.text;
                  for (; E[V] > R; )
                    V--;
                  if (V >= 0) {
                    const N = this.seperateLabel(
                      e,
                      b,
                      d,
                      z,
                      V,
                      f,
                      p,
                      h,
                      E
                    );
                    f = N[0], p = N[1];
                  }
                }
              else
                b.active = !1;
            else e.wordWrap === qt.NONE && (b.active = !1);
          }
        else
          b.active = !1;
      } else b === en.NEWLINE && (this.setTextAlignment(
        f,
        p,
        h,
        a,
        e.alignment
      ), f = 0, p += e.lineHeight);
    }
    this.setTextAlignment(
      f,
      p,
      h,
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
    const s = this.areaWaitingOnLabel.get(e);
    if (s && s.size > 0 || !e.active) return;
    const n = this.areaToLabels.get(e);
    !n || n.length === 0 || (this.updateLabels(e), this.layoutBorder(e), this.layoutLabels(e));
  }
  /**
   * Update kerning of textArea Instance, retrieve kerning request from map or create a new one
   */
  updateKerning(e) {
    let t = this.areaTokerningRequest.get(e);
    const s = e.text;
    if (t) {
      if (t.kerningPairs && t.kerningPairs.indexOf(s) > -1)
        return !!t.fontMap;
      if (t.fontMap && !t.fontMap.supportsKerning(s))
        this.areaTokerningRequest.delete(e), t = void 0;
      else
        return !1;
    } else {
      const n = {
        fontSize: e.fontSize,
        text: e.text,
        letterSpacing: e.letterSpacing
      };
      return t = $s({
        character: "",
        key: this.props.resourceKey || "",
        kerningPairs: [s],
        metrics: n
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
      for (let s = 0, n = t.length; s < n; ++s) {
        const r = t[s];
        r instanceof Ne && this.providers.labels.add(r);
      }
  }
  /**
   * This ensures the correct number of glyphs is being provided for the label indicated.
   */
  updateLabels(e) {
    let t = this.areaToLabels.get(e);
    const s = e.padding[0], n = e.padding[3] || 0, r = e.origin[0] + n, o = e.origin[1] + s;
    t || (t = [], this.areaToLabels.set(e, t));
    let a = this.areaWaitingOnLabel.get(e);
    a || (a = /* @__PURE__ */ new Set(), this.areaWaitingOnLabel.set(e, a));
    let c = this.areaToWords.get(e);
    if (c || (c = h0(e.text)), t.length < c.length)
      for (let l = t.length, u = c.length; l < u; ++l) {
        const h = c[l];
        if (h === `
`)
          t.push(en.NEWLINE);
        else {
          const d = new Ne({
            active: !1,
            color: e.color,
            fontSize: e.fontSize,
            letterSpacing: e.letterSpacing,
            text: h,
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
      for (let s = 0, n = t.length; s < n; ++s) {
        const r = t[s];
        r instanceof Ne && (r.color = ii(e.color));
      }
      for (let s = 0, n = e.newLabels.length; s < n; ++s)
        e.newLabels[s].color = ii(e.color);
      for (let s = 0, n = e.borders.length; s < n; ++s)
        e.borders[s].color = ii(e.color);
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
    const s = e.origin, n = e.oldOrigin;
    for (let r = 0, o = t.length; r < o; ++r) {
      const a = t[r];
      if (a instanceof Ne) {
        const c = a.origin;
        a.origin = [
          c[0] + s[0] - n[0],
          c[1] + s[1] - n[1]
        ];
      }
    }
    for (let r = 0, o = e.newLabels.length; r < o; ++r) {
      const a = e.newLabels[r];
      if (a instanceof Ne) {
        const c = a.origin;
        a.origin = [
          c[0] + s[0] - n[0],
          c[1] + s[1] - n[1]
        ];
      }
    }
    for (let r = 0, o = e.borders.length; r < o; ++r) {
      const a = e.borders[r];
      a.position = [
        a.position[0] + s[0] - n[0],
        a.position[1] + s[1] - n[1]
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
ua.defaultProps = {
  key: "",
  data: new ae(),
  scaling: ei.ALWAYS
};
let vc = ua;
const p0 = `precision highp float;

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
`, g0 = `precision highp float;

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
`, Ve = class Ve extends Be {
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
    }, s = {
      0: 0,
      1: 0,
      2: 0,
      3: 1,
      4: 1,
      5: 1
    }, { scaleFactor: n = () => 1 } = this.props;
    return {
      fs: p0,
      instanceAttributes: [
        {
          easing: e.location,
          name: Ve.attributeNames.location,
          size: S.TWO,
          update: (r) => r.position
        },
        {
          name: Ve.attributeNames.anchor,
          size: S.TWO,
          update: (r) => [r.anchor.x || 0, r.anchor.y || 0]
        },
        {
          easing: e.size,
          name: Ve.attributeNames.size,
          size: S.TWO,
          update: (r) => r.size
        },
        {
          name: Ve.attributeNames.depth,
          size: S.ONE,
          update: (r) => [r.depth]
        },
        {
          name: Ve.attributeNames.scaling,
          size: S.ONE,
          update: (r) => [r.scaling]
        },
        {
          easing: e.color,
          name: Ve.attributeNames.color,
          size: S.FOUR,
          update: (r) => r.color
        },
        {
          name: Ve.attributeNames.scale,
          size: S.ONE,
          update: (r) => [r.scale]
        },
        {
          name: Ve.attributeNames.maxScale,
          size: S.ONE,
          update: (r) => [r.maxScale]
        },
        {
          easing: e.outline,
          name: Ve.attributeNames.outline,
          size: S.ONE,
          update: (r) => [r.outline]
        },
        {
          easing: e.outlineColor,
          name: Ve.attributeNames.outlineColor,
          size: S.FOUR,
          update: (r) => r.outlineColor
        }
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: A.ONE,
          update: (r) => [n()]
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
            s[r]
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
Ve.defaultProps = {
  key: "",
  data: new ae()
}, Ve.attributeNames = {
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
let wc = Ve;
var m0 = Object.defineProperty, gn = (i, e, t, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(e, t, n) || n);
  return n && m0(e, t, n), n;
};
const js = class Gu extends dt {
  constructor(e) {
    super(e), this.color = [1, 1, 1, 1], this.depth = 0, this.radius = 0, this.thickness = 1, this.center = [0, 0], Xe(this, Gu), this.color = e.color || this.color, this.depth = e.depth || this.depth, this.radius = e.radius || this.radius, this.thickness = e.thickness || this.thickness, this.center = e.center || this.center;
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
gn([
  I
], js.prototype, "color");
gn([
  I
], js.prototype, "depth");
gn([
  I
], js.prototype, "radius");
gn([
  I
], js.prototype, "thickness");
gn([
  I
], js.prototype, "center");
let yx = js;
const b0 = `precision highp float;

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
`, x0 = `precision highp float;

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
`, Zt = class Zt extends Be {
  /**
   * Define our shader and it's inputs
   */
  initShader() {
    const e = this.props.scaleFactor || (() => 1), t = this.props.animate || {}, {
      color: s,
      center: n,
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
      fs: b0,
      instanceAttributes: [
        {
          easing: n,
          name: Zt.attributeNames.center,
          size: S.TWO,
          update: (c) => c.center
        },
        {
          easing: r,
          name: Zt.attributeNames.radius,
          size: S.ONE,
          update: (c) => [c.radius]
        },
        {
          name: Zt.attributeNames.depth,
          size: S.ONE,
          update: (c) => [c.depth]
        },
        {
          easing: s,
          name: Zt.attributeNames.color,
          size: S.FOUR,
          update: (c) => c.color
        },
        {
          name: Zt.attributeNames.thickness,
          size: S.ONE,
          update: (c) => [c.thickness]
        }
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: A.ONE,
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
      vs: x0
    };
  }
  getMaterialOptions() {
    return it.transparentShapeBlending;
  }
};
Zt.defaultProps = {
  key: "",
  data: new ae()
}, Zt.attributeNames = {
  center: "center",
  radius: "radius",
  depth: "depth",
  color: "color",
  thickness: "thickness"
};
let Tc = Zt;
const v0 = `// These are projection methods for basic camera operations
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
`, w0 = `
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
be.register([
  {
    moduleId: "camera",
    description: w0,
    // No explicit functional content is required, we will only use the uniforms for injecting information for this
    // module.
    content: "",
    compatibility: _.ALL,
    uniforms: (i) => [
      // This injects the projection matrix from the view camera
      {
        name: "projection",
        size: A.MATRIX4,
        update: () => i.view.props.camera.projection
      },
      {
        name: "viewProjection",
        size: A.MATRIX4,
        update: () => i.view.props.camera.viewProjection
      },
      // This injects the model view matrix from the view camera
      {
        name: "view",
        size: A.MATRIX4,
        update: () => i.view.props.camera.view
      },
      // This injects the camera's current position
      {
        name: "cameraPosition",
        size: A.THREE,
        update: () => i.view.props.camera.position
      },
      // This injects the camera's current scale
      {
        name: "cameraScale",
        size: A.THREE,
        update: () => i.view.props.camera.scale
      },
      // This injects the camera's Euler rotation
      {
        name: "cameraRotation",
        size: A.THREE,
        update: () => i.view.props.camera.scale
      },
      // This injects the pixel width and height of the view
      {
        shaderInjection: _.ALL,
        name: "viewSize",
        size: A.TWO,
        update: () => [
          i.view.viewBounds.width,
          i.view.viewBounds.height
        ]
      },
      // This injects the current layer's pixel ratio so pixel ratio dependent items can react to it
      // Things like gl_PointSize will need this metric if not working in clip space
      {
        shaderInjection: _.ALL,
        name: "pixelRatio",
        size: A.ONE,
        update: () => [i.view.pixelRatio]
      }
    ]
  },
  {
    moduleId: "projection",
    content: v0,
    compatibility: _.ALL
  }
]);
const Vu = `
This provides frame timing information
or how many frames have been rendered.

Constants:
float currentTime;
float currentFrame;
`;
be.register({
  moduleId: "frame",
  description: Vu,
  content: "",
  compatibility: _.ALL,
  uniforms: (i) => [
    // This will be the current frame's current time which is updated in the layer's surface draw call
    {
      name: "currentTime",
      size: A.ONE,
      shaderInjection: _.ALL,
      update: () => [i.surface.frameMetrics.currentTime]
    },
    {
      name: "currentFrame",
      size: A.ONE,
      shaderInjection: _.ALL,
      update: () => [i.surface.frameMetrics.currentFrame]
    }
  ]
});
be.register({
  moduleId: "time",
  description: Vu,
  content: "",
  compatibility: _.ALL,
  uniforms: (i) => [
    // This will be the current frame's current time which is updated in the layer's surface draw call
    {
      name: "time",
      size: A.ONE,
      shaderInjection: _.ALL,
      update: () => [i.surface.frameMetrics.currentTime]
    }
  ]
});
const T0 = `vec3 rgb2hsv(vec3 c) {
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
`, E0 = `
Provides methods that converts colors to
HSV values and back. This makes it
easier to deal with hue saturation and
lightness levels.

Methods:
vec3 rgb2hsv(vec3 c);
vec3 hsv2rgb(vec3 c);
`;
be.register({
  moduleId: "hsv",
  description: E0,
  content: T0,
  compatibility: _.ALL
});
const y0 = `
This is an internal shader module that
helps establish the instancing system.
Not recommended for use unless you
really know how to utilize it properly.

Attributes:
float _active;
float instance;
`;
be.register({
  moduleId: "instancing",
  description: y0,
  content: "",
  compatibility: _.ALL,
  instanceAttributes: (i) => {
    const e = {
      name: "_active",
      size: S.ONE,
      update: (t) => [t.active ? 1 : 0]
    };
    return i.shaderIOInfo.activeAttribute = e, [e];
  },
  vertexAttributes: (i) => i.bufferType === se.UNIFORM ? [
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
const R0 = `\${import: PI, PI2, fsin, fcos, wrap}

/**
 * A circular arc interpolator
 */
vec2 arc(float t, vec2 center, float radius, float start, float end) {
  float angle = wrap((end - start) * t + start, 0.0, PI2);
  return center + vec2(fcos(angle), fsin(angle)) * radius;
}
`, A0 = `/**
 * Single control point bezier curve
 */
vec2 bezier1(float t, vec2 p1, vec2 p2, vec2 c1) {
  return (1.0 - t) * (1.0 - t) * p1 + 2.0 * t * (1.0 - t) * c1 + t * t * p2;
}
`, _0 = `/**
 * Two control point bezier curve
 */
vec2 bezier2(float t, vec2 p1, vec2 p2, vec2 c1, vec2 c2) {
  float t1 = 1.0 - t;
  return pow(t1, 3.0) * p1 + 3.0 * t * pow(t1, 2.0) * c1 + 3.0 * pow(t, 2.0) * t1 * c2 + pow(t, 3.0) * p2;
}`, I0 = `float PI = 3.14159265;
`, M0 = `float PI_2 = 1.5707963268;
`, S0 = `float PI_4 = 0.7853981634;
`, C0 = `// This is 1 / pi
float PI_INV = 0.3183098862;
`, O0 = `float PI2 = 6.2831853;
`, L0 = `// This is 1 / (pi * 2.0)
float PI2_INV = 0.1591549431;
`, N0 = `float toDegrees = 57.2957795131;
`, B0 = `float toRadians = 0.01745329252;
`, P0 = `\${import: PI, PI2, PI_2}

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
`, F0 = `float fmod(float x, float m, float m_inv) {
  return x - m * floor(x * m_inv);
}
`, D0 = `\${import: PI, PI2}

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
`, k0 = `float wrap(float value, float start, float end) {
  float width = end - start;
  float offsetValue = value - start;

  return (offsetValue - (floor(offsetValue / width) * width)) + start;
}
`, ea = [
  {
    moduleId: "PI_INV",
    description: "Provides: float PI_INV = 1.0 / pi",
    content: C0,
    compatibility: _.ALL
  },
  {
    moduleId: "PI2_INV",
    description: `Provides:
float PI2_INV = 1.0 / (pi * 2.0)`,
    content: L0,
    compatibility: _.ALL
  },
  {
    moduleId: "PI_2",
    description: "Provides: float PI_2 = pi / 2.0",
    content: M0,
    compatibility: _.ALL
  },
  {
    moduleId: "PI_4",
    description: "Provides: float PI_4 = pi / 4.0",
    content: S0,
    compatibility: _.ALL
  },
  {
    moduleId: "PI",
    description: "Provides: float PI = pi",
    content: I0,
    compatibility: _.ALL
  },
  {
    moduleId: "PI2",
    description: "Provides: float PI2 = pi * 2.0",
    content: O0,
    compatibility: _.ALL
  },
  {
    moduleId: "toDegrees",
    description: `Provides: float toDegrees;
Can be used to convert radians to degrees:
radians * toDegrees`,
    content: N0,
    compatibility: _.ALL
  },
  {
    moduleId: "toRadians",
    description: `Provides: float toRadians;
Can be used to convert degrees to radians:
degress * toRadians`,
    content: B0,
    compatibility: _.ALL
  }
], U0 = `
Provides all the math constants you may
need as convenience. It's probably
better to include them individually, but
convenience sometimes beats practicality

Constants:
${ea.map((i) => i.moduleId).join(`
`)}
`, z0 = {
  moduleId: "constants",
  description: U0,
  content: `\${import: ${ea.map((i) => i.moduleId).join(", ")}}`,
  compatibility: _.ALL
}, G0 = [
  {
    moduleId: "bezier1",
    description: `Provides the 2D single control
point bezier method:
vec2 bezier1(float t, vec2 p1, vec2 p2, vec2 c1)`,
    content: A0,
    compatibility: _.ALL
  },
  {
    moduleId: "bezier2",
    description: `Provides the 2D single control
point bezier method:
vec2 bezier2(float t, vec2 p1, vec2 p2, vec2 c1, vec2 c2)`,
    content: _0,
    compatibility: _.ALL
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
    content: R0,
    compatibility: _.ALL
  },
  {
    moduleId: "fmod",
    description: `Provides the floating point
modulus method:
float fmod(float x, float m, float m_inv)`,
    content: F0,
    compatibility: _.ALL
  },
  {
    moduleId: "wrap",
    description: `Provides a method that wraps
value overflows:
float wrap(float value, float start, float end)`,
    content: k0,
    compatibility: _.ALL
  },
  {
    moduleId: "fcos",
    description: `Provides a fcos method that also
has a higher precision than
some hardware cos implementations:
float fcos(float x)`,
    content: P0,
    compatibility: _.ALL
  },
  {
    moduleId: "fsin",
    description: `Provides a fsin method that also
has a higher precision than
some hardware sin implementations:
float fsin(float x)`,
    content: D0,
    compatibility: _.ALL
  }
];
be.register([...G0, ...ea, z0]);
const V0 = `mat4 rotationFromQuaternion(vec4 q) {
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
`, $0 = `mat4 scale(vec3 s) {
  return mat4(
    s.x, 0, 0, 0,
    0, s.y, 0, 0,
    0, 0, s.z, 0,
    0, 0, 0, 1
  );
}
`, W0 = `\${import: translation, rotation, scale}

mat4 transform(vec3 s, vec4 r, vec3 t) {
  return translation(t) * rotationFromQuaternion(r) * scale(s);
}
`, j0 = `mat4 translation(vec3 t) {
  return mat4(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    t.x, t.y, t.z, 1
  );
}
`;
be.register([
  {
    moduleId: "translation",
    description: `Generates a translation matrix
from a vec3:
mat4 transform(vec3 s, vec4 r, vec3 t)`,
    compatibility: _.ALL,
    content: j0
  },
  {
    moduleId: "rotation",
    description: `Generates a rotation matrix
from a quaternion:
mat4 rotationFromQuaternion(vec4 q)`,
    compatibility: _.ALL,
    content: V0
  },
  {
    moduleId: "scale",
    description: `Generates a scale matrix
from a vec3:
mat4 scale(vec3 s)`,
    compatibility: _.ALL,
    content: $0
  },
  {
    moduleId: "transform",
    description: `Generates a full transform matrix
from a scale, quaternion, translation:
mat4 transform(vec3 s, vec4 r, vec3 t)`,
    compatibility: _.ALL,
    content: W0
  }
]);
const H0 = `//
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
`, X0 = `//
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
be.register({
  moduleId: "simplexNoise3D",
  content: X0,
  compatibility: _.ALL,
  description: "Provides the simplex noise function for 3D coordinates."
});
be.register({
  moduleId: "simplexNoise2D",
  content: H0,
  compatibility: _.ALL,
  description: "Provides the simplex noise function for 2D coordinates."
});
const Q0 = `vec4 bitSh = vec4(16777216., 65536., 256., 1.);
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
`, Y0 = `
This provides the ability to pack
a float value into a color RGBA
value. This is used to bypass the
lack of support for float textures.

Constants:
float currentTime;
float currentFrame;
`;
be.register({
  moduleId: "packFloat",
  description: Y0,
  content: Q0,
  compatibility: _.ALL
});
const q0 = `// This is the varying auto generated for the fragment shader that is needed in the vertex shader to pass the
// color for the instance through to the fragment shader
varying highp vec4 _picking_color_pass_;
`;
be.register([
  {
    moduleId: "picking",
    description: `Internal use only. Provides methods
and constants to make the picking processes work.`,
    content: q0,
    compatibility: _.VERTEX,
    instanceAttributes: (i) => [
      {
        name: "_pickingColor",
        size: S.FOUR,
        shaderInjection: _.VERTEX,
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
const K0 = `void main() {
  gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
}
`, Z0 = `void main() {
  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
}
`, Ec = `
Makes a no-op shader where gl_Position
is [0, 0, 0, 0] and gl_FragColor is
[0, 0, 0, 0].

You can not import this if you specify
your own main() method.
`;
be.register([
  {
    moduleId: "no-op",
    description: Ec,
    content: Z0,
    compatibility: _.VERTEX
  },
  {
    moduleId: "no-op",
    description: Ec,
    content: K0,
    compatibility: _.FRAGMENT
  }
]);
const J0 = `
Provides a constant that is populated
with a random value 0 - 1.
This value is static for each draw call,
but changes every draw call.

float random;
`;
be.register([
  {
    moduleId: "random",
    description: J0,
    content: "",
    compatibility: _.ALL,
    uniforms: (i) => [
      {
        name: "random",
        size: A.ONE,
        shaderInjection: _.ALL,
        update: () => Math.random()
      }
    ]
  }
]);
const eb = `
This is a special helper module used by
the system to map View2D content into
a 3D world space. The system utilizes
this module automatically for you when
you utilize createLayer2Din3D.
`;
be.register([
  {
    moduleId: "world2DXY",
    description: eb,
    content: Ou,
    compatibility: _.ALL,
    uniforms: (i) => i instanceof Be ? i.props.control2D ? [
      // This injects the projection matrix from the view camera
      {
        name: "projection",
        size: A.MATRIX4,
        update: () => i.view.props.camera.projection
      },
      // This injects the model view matrix from the view camera
      {
        name: "view",
        size: A.MATRIX4,
        update: () => i.view.props.camera.view
      },
      // This injects a 2D camera's offset
      {
        name: "cameraOffset",
        size: A.THREE,
        update: () => i.props.control2D instanceof Wi ? i.props.control2D.offset : [0, 0, 0]
      },
      // This injects the camera's current position
      {
        name: "cameraPosition",
        size: A.THREE,
        update: () => i.view.props.camera.position
      },
      // This injects the camera's current scale
      {
        name: "cameraScale",
        size: A.THREE,
        update: () => i.view.props.camera.scale
      },
      // This injects the camera's 2D current scale
      {
        name: "cameraScale2D",
        size: A.THREE,
        update: () => i.props.control2D instanceof Wi ? i.props.control2D.scale : [1, 1, 1]
      },
      // This injects the camera's Euler rotation
      {
        name: "cameraRotation",
        size: A.FOUR,
        update: () => i.view.props.camera.transform.rotation
      },
      // This injects the pixel width and height of the view
      {
        name: "viewSize",
        size: A.TWO,
        update: () => [
          i.view.viewBounds.width,
          i.view.viewBounds.height
        ]
      },
      // This injects the current layer's pixel ratio so pixel ratio dependent items can react to it
      // Things like gl_PointSize will need this metric if not working in clip space
      {
        name: "pixelRatio",
        size: A.ONE,
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
const tb = `// These are projection methods utilizing the simpler camera 2d approach.
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
`, ib = `
This is a special helper module used by
the system to map View2D content into
a 3D world space. The system utilizes
this module automatically for you when
you utilize createLayer2Din3D.
`;
be.register([
  {
    moduleId: "world2DXZ",
    description: ib,
    content: tb,
    compatibility: _.ALL,
    uniforms: (i) => i instanceof Be ? i.props.control2D ? [
      // This injects the projection matrix from the view camera
      {
        name: "projection",
        size: A.MATRIX4,
        update: () => i.view.props.camera.projection
      },
      // This injects the model view matrix from the view camera
      {
        name: "view",
        size: A.MATRIX4,
        update: () => i.view.props.camera.view
      },
      // This injects a 2D camera's offset
      {
        name: "cameraOffset",
        size: A.THREE,
        update: () => i.props.control2D instanceof Wi ? i.props.control2D.offset : [0, 0, 0]
      },
      // This injects the camera's current position
      {
        name: "cameraPosition",
        size: A.THREE,
        update: () => i.view.props.camera.position
      },
      // This injects the camera's current scale
      {
        name: "cameraScale",
        size: A.THREE,
        update: () => i.view.props.camera.scale
      },
      // This injects the camera's 2D current scale
      {
        name: "cameraScale2D",
        size: A.THREE,
        update: () => i.props.control2D instanceof Wi ? i.props.control2D.scale : [1, 1, 1]
      },
      // This injects the camera's Euler rotation
      {
        name: "cameraRotation",
        size: A.THREE,
        update: () => i.view.props.camera.scale
      },
      // This injects the pixel width and height of the view
      {
        name: "viewSize",
        size: A.TWO,
        update: () => [
          i.view.viewBounds.width,
          i.view.viewBounds.height
        ]
      },
      // This injects the current layer's pixel ratio so pixel ratio dependent items can react to it
      // Things like gl_PointSize will need this metric if not working in clip space
      {
        name: "pixelRatio",
        size: A.ONE,
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
const sb = `// These are projection methods utilizing the simpler camera 2d approach.
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
`, nb = `
This is a special helper module used by
the system to map View2D content into
a 3D world space. The system utilizes
this module automatically for you when
you utilize createLayer2Din3D.
`;
be.register([
  {
    moduleId: "world2DYZ",
    description: nb,
    content: sb,
    compatibility: _.ALL,
    uniforms: (i) => i instanceof Be ? i.props.control2D ? [
      // This injects the projection matrix from the view camera
      {
        name: "projection",
        size: A.MATRIX4,
        update: () => i.view.props.camera.projection
      },
      // This injects the model view matrix from the view camera
      {
        name: "view",
        size: A.MATRIX4,
        update: () => i.view.props.camera.view
      },
      // This injects a 2D camera's offset
      {
        name: "cameraOffset",
        size: A.THREE,
        update: () => i.props.control2D instanceof Wi ? i.props.control2D.offset : [0, 0, 0]
      },
      // This injects the camera's current position
      {
        name: "cameraPosition",
        size: A.THREE,
        update: () => i.view.props.camera.position
      },
      // This injects the camera's current scale
      {
        name: "cameraScale",
        size: A.THREE,
        update: () => i.view.props.camera.scale
      },
      // This injects the camera's 2D current scale
      {
        name: "cameraScale2D",
        size: A.THREE,
        update: () => i.props.control2D instanceof Wi ? i.props.control2D.scale : [1, 1, 1]
      },
      // This injects the camera's Euler rotation
      {
        name: "cameraRotation",
        size: A.THREE,
        update: () => i.view.props.camera.scale
      },
      // This injects the pixel width and height of the view
      {
        name: "viewSize",
        size: A.TWO,
        update: () => [
          i.view.viewBounds.width,
          i.view.viewBounds.height
        ]
      },
      // This injects the current layer's pixel ratio so pixel ratio dependent items can react to it
      // Things like gl_PointSize will need this metric if not working in clip space
      {
        name: "pixelRatio",
        size: A.ONE,
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
var rb = /* @__PURE__ */ ((i) => (i[i.XY = 0] = "XY", i[i.XZ = 1] = "XZ", i[i.YZ = 2] = "YZ", i))(rb || {});
function Rx(i, e, t) {
  if (!(e === Be || e.prototype instanceof Be))
    return console.warn(
      "A Layer type was specified for createLayer2din3D that is NOT a Layer2D type, which is invalid.",
      "The layer will be used without being modified."
    ), ks(e, t);
  let n;
  switch (i) {
    case 0:
      n = "world2DXY";
      break;
    case 1:
      n = "world2DXZ";
      break;
    case 2:
      n = "world2DYZ";
      break;
    default:
      return ks(e, t);
  }
  const r = Object.assign({}, t, {
    baseShaderModules: (o, a) => {
      let c = a.vs.indexOf("world2D");
      return c >= 0 && a.vs.splice(c, 1, n), c = a.fs.indexOf("world2D"), c >= 0 && a.fs.splice(c, 1, n), a;
    }
  });
  return ks(e, r);
}
class ob extends Vo {
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
    if (this.camera.projectionType === Vi.ORTHOGRAPHIC) {
      const t = ls(this.screenToWorld(e));
      return nu(t, this.camera.transform.forward);
    } else {
      const t = ls(this.screenToWorld(e));
      return ru(ls(this.camera.transform.position), t);
    }
  }
  /**
   * Maps a coordinate found within the world to a relative coordinate within the screen space.
   */
  worldToScreen(e, t) {
    t = t || [0, 0];
    const s = lt(
      this.camera.projection,
      this.camera.view
    ), n = Qr(
      s,
      e,
      this.viewBounds.width,
      this.viewBounds.height
    );
    return le(
      t,
      n[0] / this.pixelRatio,
      n[1] / this.pixelRatio
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
    const { width: s, height: n } = this.viewBounds, { projectionOptions: r } = this.camera, o = Ae(e, this.pixelRatio), { tan: a } = Math;
    if (r.type === Vi.PERSPECTIVE) {
      const { fov: c, near: l } = r, u = n / s, h = a(c / 2) * l, d = (2 * ((o[0] + 0.5) / s) - 1) * h, f = (1 - 2 * ((o[1] + 0.5) / n)) * h * u, p = [d, f, -1], g = Kn(
        this.camera.transform.matrix,
        qn(p, 1)
      );
      fe(t, g[0], g[1], g[2]);
    } else {
      const c = Te(o, [s / 2, n / 2]), l = Kn(
        this.camera.transform.viewMatrix,
        qn(c, -r.near)
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
    const s = lt(
      this.camera.projection,
      this.camera.view
    ), n = Qr(
      s,
      e,
      this.viewBounds.width,
      this.viewBounds.height
    );
    return le(
      t,
      n[0] / this.pixelRatio,
      n[1] / this.pixelRatio
    );
  }
}
class ab extends hr {
  constructor(e) {
    super({}), this.isDragging = !1, this.lastMouse = null, this.ROTATE_SENSITIVITY = 0.01, this.ZOOM_SENSITIVITY = 0.1, this.MIN_SCALE = 0.1, this.MAX_SCALE = 10, this.target = e.target, this.camera = e.camera;
  }
  /**
   * Update the camera reference if needed.
   */
  setCamera(e) {
    this.camera = e;
  }
  handleMouseDown(e) {
    e.mouse.button === 0 && (this.isDragging = !0, this.lastMouse = [e.mouse.currentPosition[0], e.mouse.currentPosition[1]]);
  }
  handleMouseUp(e) {
    this.isDragging = !1, this.lastMouse = null;
  }
  handleDrag(e) {
    if (!this.isDragging || !this.lastMouse) return;
    const [t, s] = this.lastMouse, [n, r] = e.mouse.currentPosition, o = n - t, a = r - s;
    this.lastMouse = [n, r];
    const c = this.camera.transform.matrix, l = [c[0], c[1], c[2]], u = [c[4], c[5], c[6]], h = o * this.ROTATE_SENSITIVITY, d = a * this.ROTATE_SENSITIVITY, f = qr(u, h), p = qr(l, d), g = [0, 0, 0, 0];
    er(f, p, g), er(g, this.target.localRotation, g), tu(g, g), this.target.localRotation = g;
  }
  handleWheel(e) {
    let t = this.target.localScale[0];
    t *= 1 + e.mouse.wheel.delta[1] * this.ZOOM_SENSITIVITY * 0.01, t = Math.max(this.MIN_SCALE, Math.min(this.MAX_SCALE, t)), this.target.localScale = [t, t, t];
  }
}
function cb(i) {
  return i.projectionType === Vi.ORTHOGRAPHIC;
}
const ha = class ha extends cn {
  constructor(e, t) {
    super(e, t), this.projection = new ob(), this.projection.camera = t.camera, this.projection.pixelRatio = this.pixelRatio;
  }
  /**
   * This operation makes sure we have the view camera adjusted to the new
   * viewport's needs.
   */
  fitViewtoViewport(e, t) {
    if (fu(this.props.camera)) {
      const s = t.width, n = t.height, r = this.props.camera, o = {
        near: r.projectionOptions.near,
        far: r.projectionOptions.far,
        width: s,
        height: n
      };
      this.props.preventCameraAdjustment || (r.projectionOptions = Object.assign(
        r.projectionOptions,
        o
      ), r.update()), this.projection.pixelRatio = this.pixelRatio, this.projection.viewBounds = t, this.projection.viewBounds.d = this, this.projection.screenBounds = new J({
        height: this.projection.viewBounds.height / this.pixelRatio,
        width: this.projection.viewBounds.width / this.pixelRatio,
        x: this.projection.viewBounds.x / this.pixelRatio,
        y: this.projection.viewBounds.y / this.pixelRatio
      }), this.projection.screenBounds.d = this;
    } else if (cb(this.props.camera)) {
      const s = t.width, n = t.height, r = this.props.camera, o = {
        near: r.projectionOptions.near,
        far: r.projectionOptions.far,
        left: -s / 2,
        right: s / 2,
        top: n / 2,
        bottom: -n / 2
      };
      this.props.preventCameraAdjustment || (r.projectionOptions = Object.assign(
        r.projectionOptions,
        o
      ), r.update()), this.projection.pixelRatio = this.pixelRatio, this.projection.viewBounds = t, this.projection.viewBounds.d = this, this.projection.screenBounds = new J({
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
ha.defaultProps = {
  key: "",
  camera: new $i({
    type: Vi.PERSPECTIVE,
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
let yc = ha;
class lb extends zt {
  /**
   * Ensure the shaders utilizing this framework has easy access to the
   * parentTransform property.
   */
  baseShaderModules(e) {
    const t = super.baseShaderModules(e);
    return t.vs.push("parent-transform"), t;
  }
}
const ub = `
When working with SceneGraphLayers, the
layer can have a transform applied to
the layer. This makes that transform
available in the parentTransform
constant.

mat4 parentTransform;
`;
be.register({
  moduleId: "parent-transform",
  description: ub,
  compatibility: _.VERTEX,
  content: "",
  uniforms: (i) => {
    const e = i;
    if (!(e instanceof lb))
      return console.warn(
        "A shader requested the module parent-transform; however, the layer the",
        "shader is generated from is NOT a SceneGraphLayer which is",
        "required for the module to work."
      ), [];
    const t = re();
    return [
      {
        name: "parentTransform",
        size: A.MATRIX4,
        update: () => {
          var s;
          return ((s = e.props.parent) == null ? void 0 : s.matrix) || t;
        }
      }
    ];
  }
});
var hb = Object.defineProperty, Qi = (i, e, t, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(e, t, n) || n);
  return n && hb(e, t, n), n;
};
const Mi = class bo extends dt {
  constructor(e) {
    super(e), this.needsLocalUpdate = !1, this.needsWorldUpdate = !1, Xe(this, bo);
    const t = e.transform || new Yo();
    this.transform = t, e.parent && (e.parent instanceof bo ? this.parent = e.parent : this.transform.parent = e.parent);
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
Qi([
  I
], Mi.prototype, "_matrix");
Qi([
  I
], Mi.prototype, "_localMatrix");
Qi([
  I
], Mi.prototype, "_localPosition");
Qi([
  I
], Mi.prototype, "_localRotation");
Qi([
  I
], Mi.prototype, "_localScale");
Qi([
  I
], Mi.prototype, "_position");
Qi([
  I
], Mi.prototype, "_rotation");
Qi([
  I
], Mi.prototype, "_scale");
let db = Mi;
class Ax extends hu {
  constructor() {
    super(...arguments), this.isQueuedForUpdate = !1, this.needsWorldOrientation = !1, this.needsWorldDecomposition = !1, this._instance = null, this._matrix = { value: re() }, this._localMatrix = { value: this._matrix.value }, this._position = { value: [0, 0, 0] }, this._localPosition = {
      value: this._position.value
    }, this._rotation = { value: tr() }, this._localRotation = {
      value: 0
    }, this.localRotationMatrix = Rr(), this._scale = { value: [1, 1, 1] }, this._localScale = { value: this._scale.value };
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
    le(this._localScale.value, e[0], e[1]), this._localScale.didUpdate = !0, this.invalidate();
  }
  /**
   * This method contains the math involved in decomposing our world SRT matrix
   * so we can view the Transform's orientation relative to world space.
   */
  decomposeWorldMatrix() {
    if (!this.parent || !this.needsWorldDecomposition || !this.needsWorldOrientation)
      return;
    this.needsWorldDecomposition = !1;
    const e = this._matrix.value, t = this._position.value, s = this._scale.value;
    this._position.didUpdate = t[0] !== e[12] || t[1] !== e[13] || t[2] !== e[14], this._position.didUpdate && fe(t, e[12], e[13], e[14]);
    const n = Di(e[0], e[1], e[2], e[3]), r = Di(e[4], e[5], e[6], e[7]), o = Di(e[8], e[9], e[10], e[11]);
    this._scale.didUpdate = s[0] !== n || s[1] !== r || s[2] !== o, fe(s, n, r, o), this._scale.didUpdate = !0;
    const [a, c, l, u] = this._rotation.value;
    Qo(this._matrix.value, n, r, o, this._rotation.value);
    const h = this._rotation.value;
    this._rotation.didUpdate = h[0] !== a || h[1] !== c || h[2] !== l || h[3] !== u;
  }
  /**
   * Ensures this transform WILL receive an update if it fits requirements for
   * potentially missing an update that may be needed by passive elements.
   */
  queueForUpdate() {
    !this.isQueuedForUpdate && this._instance && this._instance.active && (this.isQueuedForUpdate = !0, cu(this));
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
    if (this.isQueuedForUpdate && (lu(this), this.isQueuedForUpdate = !1), this.needsUpdate) {
      const s = this.localRotationMatrix;
      this._localRotation.didUpdate && $l(this._localRotation.value, s), Kl(
        this._localScale.value,
        s,
        this._localPosition.value,
        this._localMatrix.value
      ), this._localMatrix.didUpdate = !0, t = !0;
    }
    this.parent && (this.parent.needsUpdate ? (e || this.processParentUpdates((s) => {
      s.update(!0);
    }), t = !0) : this.parent.childUpdate.has(this) && (t = !0), t && (lt(
      this.parent._matrix.value,
      this._localMatrix.value,
      this._matrix.value
    ), this._matrix.didUpdate = !0, this.needsWorldDecomposition = !0)), this.decomposeWorldMatrix(), this._instance && this._instance.active && (this._localRotation.didUpdate && (this._instance._localRotation = this._localRotation.value), this._localPosition.didUpdate && (this._instance._localPosition = this._localPosition.value), this._localScale.didUpdate && (this._instance._localScale = this._localScale.value), this.parent ? (this._rotation.didUpdate && (this._instance._rotation = this._rotation.value), this._scale.didUpdate && (this._instance._scale = this._scale.value), this._position.didUpdate && (this._instance._position = this._position.value)) : (this._localRotation.didUpdate && (this._instance._rotation = this._localRotation.value), this._localPosition.didUpdate && (this._instance._position = this._localPosition.value), this._localScale.didUpdate && (this._instance._scale = this._localScale.value)), (this._matrix.didUpdate || this._localMatrix.didUpdate) && (this._instance.transform = this)), this._localScale.didUpdate = !1, this._localRotation.didUpdate = !1, this._localPosition.didUpdate = !1, this._rotation.didUpdate = !1, this._scale.didUpdate = !1, this._position.didUpdate = !1, this._matrix.didUpdate = !1, this._localMatrix.didUpdate = !1, this.resolve();
  }
}
const fb = `varying vec2 _texCoord;

void main() {
  gl_FragColor = mix(
    vec4(1.0, 0.0, 0.0, 1.0),
    vec4(0.0, 0.0, 0.0, 1.0),
    float(_texCoord.x <= 0.01 || _texCoord.x > 0.99 || _texCoord.y < 0.01 || _texCoord.y > 0.99)
  );
}
`, pb = `\${import: projection}

varying vec2 _texCoord;

void main() {
  vec4 pos = vec4(position * size, 1.0);
  vec4 world = transform * pos;
  _texCoord = texCoord;

  gl_Position = clipSpace(world.xyz);
}
`, da = class da extends zt {
  initShader() {
    const e = [1, 1, 1], t = [1, 1, -1], s = [1, -1, -1], n = [1, -1, 1], r = [-1, 1, 1], o = [-1, 1, -1], a = [-1, -1, -1], c = [-1, -1, 1], l = [
      // right
      e,
      t,
      s,
      e,
      s,
      n,
      // front
      r,
      e,
      n,
      r,
      n,
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
      s,
      t,
      o,
      a,
      s,
      // up
      r,
      t,
      e,
      r,
      o,
      t,
      // down
      c,
      n,
      s,
      c,
      s,
      a
    ], u = [1, 0, 0], h = [0, 0, 1], d = [-1, 0, 0], f = [0, 0, -1], p = [0, 1, 0], g = [0, -1, 0], m = [
      u,
      u,
      u,
      u,
      u,
      u,
      h,
      h,
      h,
      h,
      h,
      h,
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
    ], b = [
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
          outputType: G.COLOR,
          source: fb
        }
      ],
      instanceAttributes: [
        {
          name: "transform",
          size: S.MAT4X4,
          update: (v) => (v.transform || ap).matrix
        },
        {
          name: "size",
          size: S.THREE,
          update: (v) => v.size
        }
      ],
      uniforms: [],
      vertexAttributes: [
        {
          name: "position",
          size: ke.THREE,
          update: (v) => l[v]
        },
        {
          name: "normal",
          size: ke.THREE,
          update: (v) => m[v]
        },
        {
          name: "texCoord",
          size: ke.TWO,
          update: (v) => b[v]
        }
      ],
      vertexCount: 36,
      vs: pb
    };
  }
  getMaterialOptions() {
    return Object.assign({}, it.transparentShapeBlending, {
      cullSide: x.Material.CullSide.CCW
    });
  }
};
da.defaultProps = {
  data: new ae(),
  key: "",
  materialOptions: it.transparentShapeBlending
};
let Rc = da;
var gb = Object.defineProperty, $u = (i, e, t, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(e, t, n) || n);
  return n && gb(e, t, n), n;
};
const ta = class Wu extends db {
  constructor(e) {
    super(e), this.size = [1, 1, 1], this.color = [1, 1, 1, 1], Xe(this, Wu), this.size = e.size || this.size, this.color = e.color || this.color;
  }
};
$u([
  I
], ta.prototype, "size");
$u([
  I
], ta.prototype, "color");
let _x = ta;
var Bn = { exports: {} }, Ys = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ac;
function mb() {
  if (Ac) return Ys;
  Ac = 1;
  var i = Symbol.for("react.transitional.element"), e = Symbol.for("react.fragment");
  function t(s, n, r) {
    var o = null;
    if (r !== void 0 && (o = "" + r), n.key !== void 0 && (o = "" + n.key), "key" in n) {
      r = {};
      for (var a in n)
        a !== "key" && (r[a] = n[a]);
    } else r = n;
    return n = r.ref, {
      $$typeof: i,
      type: s,
      key: o,
      ref: n !== void 0 ? n : null,
      props: r
    };
  }
  return Ys.Fragment = e, Ys.jsx = t, Ys.jsxs = t, Ys;
}
var qs = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var _c;
function bb() {
  return _c || (_c = 1, process.env.NODE_ENV !== "production" && function() {
    function i(T) {
      if (T == null) return null;
      if (typeof T == "function")
        return T.$$typeof === z ? null : T.displayName || T.name || null;
      if (typeof T == "string") return T;
      switch (T) {
        case g:
          return "Fragment";
        case b:
          return "Profiler";
        case m:
          return "StrictMode";
        case y:
          return "Suspense";
        case C:
          return "SuspenseList";
        case V:
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
          case v:
            return (T._context.displayName || "Context") + ".Consumer";
          case E:
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
        var j = k.error, te = typeof Symbol == "function" && Symbol.toStringTag && T[Symbol.toStringTag] || T.constructor.name || "Object";
        return j.call(
          k,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          te
        ), e(T);
      }
    }
    function s(T) {
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
    function n() {
      var T = N.A;
      return T === null ? null : T.getOwner();
    }
    function r() {
      return Error("react-stack-top-frame");
    }
    function o(T) {
      if (D.call(T, "key")) {
        var k = Object.getOwnPropertyDescriptor(T, "key").get;
        if (k && k.isReactWarning) return !1;
      }
      return T.key !== void 0;
    }
    function a(T, k) {
      function j() {
        ee || (ee = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          k
        ));
      }
      j.isReactWarning = !0, Object.defineProperty(T, "key", {
        get: j,
        configurable: !0
      });
    }
    function c() {
      var T = i(this.type);
      return K[T] || (K[T] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), T = this.props.ref, T !== void 0 ? T : null;
    }
    function l(T, k, j, te, Oe, we, Si, ms) {
      return j = we.ref, T = {
        $$typeof: f,
        type: T,
        key: k,
        props: we,
        _owner: Oe
      }, (j !== void 0 ? j : null) !== null ? Object.defineProperty(T, "ref", {
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
        value: Si
      }), Object.defineProperty(T, "_debugTask", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: ms
      }), Object.freeze && (Object.freeze(T.props), Object.freeze(T)), T;
    }
    function u(T, k, j, te, Oe, we, Si, ms) {
      var pe = k.children;
      if (pe !== void 0)
        if (te)
          if (H(pe)) {
            for (te = 0; te < pe.length; te++)
              h(pe[te]);
            Object.freeze && Object.freeze(pe);
          } else
            console.error(
              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
            );
        else h(pe);
      if (D.call(k, "key")) {
        pe = i(T);
        var st = Object.keys(k).filter(function(bn) {
          return bn !== "key";
        });
        te = 0 < st.length ? "{key: someKey, " + st.join(": ..., ") + ": ...}" : "{key: someKey}", Ce[pe + te] || (st = 0 < st.length ? "{" + st.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          te,
          pe,
          st,
          pe
        ), Ce[pe + te] = !0);
      }
      if (pe = null, j !== void 0 && (t(j), pe = "" + j), o(k) && (t(k.key), pe = "" + k.key), "key" in k) {
        j = {};
        for (var bs in k)
          bs !== "key" && (j[bs] = k[bs]);
      } else j = k;
      return pe && a(
        j,
        typeof T == "function" ? T.displayName || T.name || "Unknown" : T
      ), l(
        T,
        pe,
        we,
        Oe,
        n(),
        j,
        Si,
        ms
      );
    }
    function h(T) {
      typeof T == "object" && T !== null && T.$$typeof === f && T._store && (T._store.validated = 1);
    }
    var d = q, f = Symbol.for("react.transitional.element"), p = Symbol.for("react.portal"), g = Symbol.for("react.fragment"), m = Symbol.for("react.strict_mode"), b = Symbol.for("react.profiler"), v = Symbol.for("react.consumer"), w = Symbol.for("react.context"), E = Symbol.for("react.forward_ref"), y = Symbol.for("react.suspense"), C = Symbol.for("react.suspense_list"), M = Symbol.for("react.memo"), R = Symbol.for("react.lazy"), V = Symbol.for("react.activity"), z = Symbol.for("react.client.reference"), N = d.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, D = Object.prototype.hasOwnProperty, H = Array.isArray, $ = console.createTask ? console.createTask : function() {
      return null;
    };
    d = {
      "react-stack-bottom-frame": function(T) {
        return T();
      }
    };
    var ee, K = {}, Z = d["react-stack-bottom-frame"].bind(
      d,
      r
    )(), Y = $(s(r)), Ce = {};
    qs.Fragment = g, qs.jsx = function(T, k, j, te, Oe) {
      var we = 1e4 > N.recentlyCreatedOwnerStacks++;
      return u(
        T,
        k,
        j,
        !1,
        te,
        Oe,
        we ? Error("react-stack-top-frame") : Z,
        we ? $(s(T)) : Y
      );
    }, qs.jsxs = function(T, k, j, te, Oe) {
      var we = 1e4 > N.recentlyCreatedOwnerStacks++;
      return u(
        T,
        k,
        j,
        !0,
        te,
        Oe,
        we ? Error("react-stack-top-frame") : Z,
        we ? $(s(T)) : Y
      );
    };
  }()), qs;
}
var Ic;
function xb() {
  return Ic || (Ic = 1, process.env.NODE_ENV === "production" ? Bn.exports = mb() : Bn.exports = bb()), Bn.exports;
}
var Re = xb();
const Mc = () => {
};
class vb {
  constructor(e) {
    this.resolver = Mc, this.rejector = Mc, this.promise = new Promise(
      (t, s) => (this.resolver = t, this.rejector = s)
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
function Sc(i) {
  return i && i.charCodeAt !== void 0;
}
function wb(i) {
  return i != null;
}
function Tt(i, e) {
  var a, c;
  const [t, s] = ma(!0), [n, r] = ma(!1), o = {
    store: i,
    shouldMount: t
  };
  if (!n && wb(i.willMount) && (o.shouldMount = !!((a = i.willMount) != null && a.call(i))), n) {
    const l = (c = i.willUpdate) == null ? void 0 : c.call(i);
    l && (async () => await l())();
  }
  return ba(() => {
    const l = new vb();
    r(!0), s(o.shouldMount);
    let u;
    return (async () => {
      var h;
      u = await ((h = i.didMount) == null ? void 0 : h.call(i)), l.resolve(!0);
    })(), () => {
      (async () => (await l.promise, u == null || u()))();
    };
  }, []), ba(
    () => {
      var l;
      n && (o.shouldMount = !!((l = i.willMount) != null && l.call(i)));
    },
    [0]
  ), o;
}
function Tb(i) {
  const { children: e, tagName: t, ...s } = i, n = Object.keys(s).reduce(
    (r, o) => {
      try {
        kt(o) && (r[o.toLowerCase()] = JSON.stringify(s[o]));
      } catch {
      }
      return r;
    },
    {}
  );
  return { tagName: t, attributes: n, children: e };
}
const Et = (i) => {
  const {
    tagName: e = "",
    attributes: t,
    children: s
  } = Tb(i), { writeToDom: n } = q.useContext(mn) || {};
  return n ? q.createElement(e, t, s) : i.children;
};
var Ie = /* @__PURE__ */ ((i) => (i[i.EVENT_MANAGER = 1] = "EVENT_MANAGER", i[i.LAYER = 2] = "LAYER", i[i.CAMERA = 3] = "CAMERA", i[i.PROVIDER = 4] = "PROVIDER", i[i.RESOURCE = 5] = "RESOURCE", i[i.VIEW = 6] = "VIEW", i[i.SCENE = 7] = "SCENE", i))(Ie || {});
function ju(i, e, t) {
  var r, o, a;
  const s = /* @__PURE__ */ new Map(), n = [];
  for (q.Children.forEach(i, (c, l) => {
    n.push(c);
  }), n.reverse(); n.length > 0; ) {
    const c = n.pop();
    if (!q.isValidElement(c)) continue;
    const l = (r = c.type) == null ? void 0 : r.surfaceJSXType;
    if (c !== void 0 && ((c == null ? void 0 : c.type) === q.Fragment || l === void 0)) {
      if (!((o = c == null ? void 0 : c.props) != null && o.children)) {
        t && t.push(c);
        continue;
      }
      const u = [];
      q.Children.forEach(
        ((a = c == null ? void 0 : c.props) == null ? void 0 : a.children) || [],
        (h) => {
          u.push(h);
        }
      );
      for (let h = u.length - 1; h >= 0; --h)
        n.push(u[h]);
      continue;
    } else if (c !== void 0) {
      if (l === void 0) {
        t && t.push(c);
        continue;
      }
      {
        let u = s.get(l);
        u || (u = [], s.set(l, u)), u.push(c);
      }
    }
  }
  return s;
}
function ts(i, e, t, s = { current: 0 }, n = "") {
  const r = e.get(t), o = /* @__PURE__ */ new Set(), a = q.useRef([]), c = /* @__PURE__ */ new Set();
  a.current = [], n = n ? `${n}.` : "";
  let l = [];
  return r && (l = q.Children.map(r, (u) => {
    if (q.isValidElement(u)) {
      const h = u.key || s.current++, d = `${n}${u.props.name || `${h}`}`, f = i.get(d) || new Ue();
      i.set(d, f), a.current.push(f), u.props.share && (u.props.share.current = f);
      const p = {
        key: h,
        name: d,
        resolver: f
      };
      return o.has(p.name) ? c.add(p.name) : o.add(p.name), q.cloneElement(u, p);
    }
  })), [
    l,
    Promise.all(a.current.map((u) => u == null ? void 0 : u.promise)),
    { resolvers: a, nameConflict: c }
  ];
}
function Hu(...i) {
  return i.filter(ne).reduce((e, t) => e.concat(t), []);
}
const mn = q.createContext(void 0), Ix = (i) => {
  const e = q.useRef(null), t = q.useRef(null), s = q.useRef(0), n = q.useRef(null), r = q.useRef(null), o = q.useRef(-1), a = q.useRef([]), c = q.useRef([]), l = q.useRef(
    /* @__PURE__ */ new Map()
  ), u = q.useRef(
    /* @__PURE__ */ new Map()
  ), h = q.useRef(
    /* @__PURE__ */ new Map()
  ), d = q.useRef(
    /* @__PURE__ */ new Map()
  ), f = q.useRef(
    /* @__PURE__ */ new Map()
  ), p = q.useRef(new Ue()), g = { current: 0 }, m = [], b = ju(i.children, void 0, m);
  m.length && console.warn("Surface found unsupported children", m);
  const [v, w] = ts(
    l.current,
    b,
    Ie.EVENT_MANAGER,
    g
  ), [E, y] = ts(
    u.current,
    b,
    Ie.RESOURCE,
    g
  ), [C, M, { nameConflict: R }] = ts(
    f.current,
    b,
    Ie.SCENE,
    g
  ), [V, z, { nameConflict: N }] = ts(
    d.current,
    b,
    Ie.LAYER,
    g
  ), [D, H, { nameConflict: $ }] = ts(
    h.current,
    b,
    Ie.VIEW,
    g
  );
  if (R.size > 0) {
    console.warn("Root Scene name conflict:", R);
    return;
  }
  if (N.size > 0) {
    console.warn("Root Scene Layer name conflict:", N);
    return;
  }
  if ($.size > 0) {
    console.warn("Root Scene View name conflict:", $);
    return;
  }
  const ee = async (T) => {
    !n.current || i.stop || (s.current = T, n.current.draw(T), i.renderFrameCount && n.current.frameMetrics.currentFrame >= i.renderFrameCount && Ua(r.current));
  }, K = (T) => {
    var k, j, te, Oe, we;
    (k = t.current) == null || k.remove(), (Oe = n.current) == null || Oe.resize(
      ((j = e.current) == null ? void 0 : j.offsetWidth) || 0,
      ((te = e.current) == null ? void 0 : te.offsetHeight) || 0
    ), t.current && ((we = e.current) == null || we.appendChild(t.current));
  }, Z = () => {
    window.clearTimeout(o.current), o.current = window.setTimeout(() => {
      K();
    });
  };
  Tt({
    async didMount() {
      var bn;
      if (!t.current || !e.current) return;
      const [
        T,
        k,
        j,
        te,
        Oe
      ] = await Promise.all([
        w,
        y,
        M,
        z,
        H
      ]), we = j.filter(ne), Si = T.filter(ne), ms = k.filter(ne), pe = te.filter(ne), st = Oe.filter(ne);
      if (j.length <= 0 && (!(pe != null && pe.length) || !(st != null && st.length))) {
        console.error(
          "No scenes or root level Layers+Views provided to surface"
        );
        return;
      }
      st.length && pe.length && we.unshift({
        key: "root",
        layers: pe,
        views: st
      });
      const bs = await new hm({
        context: t.current,
        handlesWheelEvents: i.handlesWheelEvents !== void 0 ? i.handlesWheelEvents : !0,
        pixelRatio: i.pixelRatio || window.devicePixelRatio,
        eventManagers: Si,
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
      return r.current = au(
        ee,
        i.frameRate ? 1e3 / i.frameRate : void 0
      ), c.current = we, a.current = ms, await bs.pipeline({
        resources: ms,
        scenes: we
      }), await oi(), n.current = bs, K(), (bn = i.ready) == null || bn.resolve(n.current), window.addEventListener("resize", Z), () => {
        var ga;
        window.removeEventListener("resize", Z), Ua(r.current), (ga = n.current) == null || ga.destroy(), n.current = null;
      };
    }
  });
  const Y = async () => {
    n.current && n.current.pipeline({
      resources: a.current,
      scenes: c.current
    });
  }, Ce = (T) => {
    !n.current || !c.current || (c.current.forEach((j) => {
      const te = j.layers.findIndex((Oe) => Oe === T);
      te !== -1 && j.layers.splice(te, 1);
    }), Y());
  };
  return /* @__PURE__ */ Re.jsx(
    "div",
    {
      ref: e,
      "data-deltav-version": "5.0.2",
      className: `SurfaceJSX ${i.className || ""}`,
      ...i.containerProps,
      children: /* @__PURE__ */ Re.jsx("canvas", { ref: t, children: /* @__PURE__ */ Re.jsx(
        mn.Provider,
        {
          value: {
            writeToDom: i.writeToDom,
            eventResolvers: l.current,
            resourceResolvers: u.current,
            viewResolvers: h.current,
            layerResolvers: d.current,
            sceneResolvers: f.current,
            resolversReady: p.current,
            updatePipeline: Y,
            disposeLayer: Ce
          },
          children: /* @__PURE__ */ Re.jsx(Et, { tagName: "Surface", ...i, children: Hu(v, E, D, V, C) })
        }
      ) })
    }
  );
}, Eb = (i) => (Tt({
  didMount() {
    var e;
    (e = i.resolver) == null || e.resolve(
      new Cu(i.handlers, i.preserveEvents)
    );
  }
}), /* @__PURE__ */ Re.jsx(Et, { tagName: "QueuedEventHandler", ...i }));
Eb.surfaceJSXType = Ie.EVENT_MANAGER;
const yb = (i) => (Tt({
  didMount() {
    var e;
    (e = i.resolver) == null || e.resolve(new hr(i.handlers));
  }
}), /* @__PURE__ */ Re.jsx(Et, { tagName: "SimpleEventHandler", ...i }));
yb.surfaceJSXType = Ie.EVENT_MANAGER;
const Rb = (i) => (Tt({
  didMount() {
    var e;
    (e = i.resolver) == null || e.resolve(new pm(i.config));
  }
}), /* @__PURE__ */ Re.jsx(Et, { tagName: "BasicCamera2DController", ...i }));
Rb.surfaceJSXType = Ie.EVENT_MANAGER;
const Ab = (i) => (Tt({
  didMount() {
    var e;
    (e = i.resolver) == null || e.resolve(new ab(i.config));
  }
}), /* @__PURE__ */ Re.jsx(Et, { tagName: "BasicCamera2DController", ...i }));
Ab.surfaceJSXType = Ie.EVENT_MANAGER;
const _b = (i) => (Tt({
  didMount() {
    var e;
    (e = i.resolver) == null || e.resolve(
      Gl({
        key: i.name,
        height: i.height,
        width: i.width,
        textureSettings: i.textureSettings
      })
    );
  }
}), /* @__PURE__ */ Re.jsx(Et, { tagName: "Texture", ...i }));
_b.surfaceJSXType = Ie.RESOURCE;
const Ib = (i) => (Tt({
  didMount() {
    var e;
    (e = i.resolver) == null || e.resolve(
      Ru({
        key: i.name,
        fontSource: i.fontSource,
        characterFilter: i.characterFilter,
        dynamic: i.dynamic,
        fontMap: i.fontMap,
        fontMapSize: i.fontMapSize
      })
    );
  }
}), /* @__PURE__ */ Re.jsx(Et, { tagName: "Font", ...i }));
Ib.surfaceJSXType = Ie.RESOURCE;
const Mb = (i) => (Tt({
  didMount() {
    var e;
    (e = i.resolver) == null || e.resolve(
      Au({
        key: i.name,
        height: i.height,
        width: i.width,
        textureSettings: i.textureSettings
      })
    );
  }
}), /* @__PURE__ */ Re.jsx(Et, { tagName: "Texture", ...i }));
Mb.surfaceJSXType = Ie.RESOURCE;
const ia = (i) => {
  const e = q.useContext(mn), t = q.useRef(null);
  return Tt({
    async didMount() {
      var a, c;
      let s = i.config;
      const n = i.uses;
      if (n) {
        await (e == null ? void 0 : e.resolversReady);
        const l = {}, u = n.names.map(async (h) => {
          var p, g;
          const d = (p = e == null ? void 0 : e.resourceResolvers) == null ? void 0 : p.get(h);
          if (!d)
            return console.error(
              `A layer requested a resource: ${h} but the name identifier was not found in the available resources`
            ), console.warn(
              "Available resources:",
              Array.from(((g = e == null ? void 0 : e.resourceResolvers) == null ? void 0 : g.keys()) || [])
            ), null;
          const f = await d.promise;
          if (!f)
            return console.error(
              `The Layer requested a resource "${h}", but the resource did not resolve a value`
            ), null;
          if (!Pi(f))
            return console.error(
              `The Layer requested a resource "${h}", but the resource resolved to a value that is not a render texture resource`
            ), null;
          l[h] = f;
        }).filter(ne);
        await Promise.all(u), s = n.apply(l, { ...i.config });
      }
      const r = ks(i.type, {
        key: i.name,
        ...s
      });
      let o = ((a = i.providerRef) == null ? void 0 : a.current) || r.init[1].data;
      return o === r.init[0].defaultProps.data && (o = new ae()), r.init[1].data = o, i.providerRef && o instanceof ae && (i.providerRef.current = o), t.current = r, (c = i.resolver) == null || c.resolve(r), () => {
        var l;
        (l = e == null ? void 0 : e.disposeLayer) == null || l.call(e, r);
      };
    }
  }), q.useEffect(() => {
    var s, n;
    (s = t.current) != null && s.init[1] && (t.current.init[1] = Object.assign(
      {},
      t.current.init[1] || {},
      i.config
    ), (n = e == null ? void 0 : e.updatePipeline) == null || n.call(e));
  }, [...Object.values(i.config)]), /* @__PURE__ */ Re.jsx(Et, { tagName: "Layer", ...i });
};
ia.surfaceJSXType = Ie.LAYER;
function xo(i, e, t) {
  var n, r;
  const s = (n = e == null ? void 0 : e.resourceResolvers) == null ? void 0 : n.get(t);
  return s || (console.error(
    `A View "${i}" requested a resource: ${t} but the name identifier was not found in the available resources`
  ), console.warn(
    "Available resources:",
    Array.from(((r = e == null ? void 0 : e.resourceResolvers) == null ? void 0 : r.keys()) || [])
  ), null);
}
async function Cc(i, e, t) {
  const s = {}, n = Object.entries(i).map(
    ([r, o]) => {
      if (o === void 0) {
        const c = new Ue();
        return [Number.parseInt(r), c, void 0];
      }
      const a = xo(
        e.name,
        t,
        o || ""
      );
      return a ? [Number.parseInt(r), a, o] : (console.warn("View props", e), null);
    }
  ).filter(ne);
  return await Promise.all(
    n.map(async (r) => {
      const { 0: o, 1: a, 2: c } = r, l = await a.promise;
      c === void 0 ? s[o] = void 0 : Pi(l) ? s[o] = l : sn(l) ? s[r[0]] = l : (console.error(
        `A View "${e.name}" requested an output buffer for the resource with name: ${r[2]} but the resource indicated is not a valid output target type.`,
        "Ensure the resource is a RenderTextureResource or ColorBufferResource"
      ), console.warn("View props", e));
    })
  ), s;
}
async function Sb(i, e, t) {
  const s = i.buffers, n = await Cc(
    s,
    e,
    t
  );
  let r = !0;
  const o = i.depth;
  if (Sc(o)) {
    const l = xo(
      e.name,
      t,
      o
    );
    if (!l)
      console.warn("View props", e), r = !1;
    else {
      const u = await l.promise;
      Pi(u) || sn(u) ? r = u : (console.error(
        `A View "${e.name}" requested a depth buffer for the resource with name: ${o} but the resource indicated is not a valid output target type.`,
        "Ensure the resource is a RenderTextureResource or ColorBufferResource"
      ), console.warn("View props", e));
    }
  } else ne(o) && (r = o);
  const a = {}, c = i.blit;
  if (c != null && c.color) {
    const l = await Cc(
      c.color,
      e,
      t
    );
    a.color = l;
  }
  if (Sc(c == null ? void 0 : c.depth)) {
    const l = xo(
      e.name,
      t,
      c.depth
    );
    if (!l)
      console.warn("View props", e), a.depth = void 0;
    else {
      const u = await l.promise;
      Pi(u) ? a.depth = u : (console.error(
        `A View "${e.name}" requested a depth blit buffer for the resource with name: ${c.depth} but the resource indicated is not a valid output target type.`,
        "Ensure the resource is a RenderTextureResource"
      ), console.warn("View props", e));
    }
  }
  return {
    buffers: n,
    depth: r,
    blit: a != null && a.color || a != null && a.depth ? a : void 0
  };
}
const sa = (i) => {
  const e = q.useContext(mn);
  return Tt({
    async didMount() {
      var o;
      if (await (e == null ? void 0 : e.resolversReady), !e) {
        console.error("No surface context found");
        return;
      }
      let t = [];
      i.output && !Array.isArray(i.output) ? t = [i.output] : i.output && (t = i.output);
      const s = await Promise.all(
        t.map(
          (a) => Sb(a, i, e)
        )
      ), n = s.slice(1), r = Su(i.type, {
        key: i.name,
        ...i.config,
        // First buffer is the primary view we create
        output: i.output ? {
          buffers: s[0].buffers,
          depth: s[0].depth,
          blit: s[0].blit
        } : void 0,
        // Additional outputs will map to chaining in the view.
        chain: n.length > 0 ? n.map((a) => ({
          output: {
            buffers: a.buffers,
            depth: a.depth,
            blit: a.blit
          }
        })) : void 0
      });
      (o = i.resolver) == null || o.resolve(r);
    }
  }), /* @__PURE__ */ Re.jsx(Et, { tagName: "View", ...i });
};
sa.surfaceJSXType = Ie.VIEW;
const na = (i) => {
  var u, h, d, f;
  const e = q.useContext(mn), t = { current: 0 }, s = ju(i.children), [n, r, { nameConflict: o }] = ts(
    (e == null ? void 0 : e.layerResolvers) || /* @__PURE__ */ new Map(),
    s,
    Ie.LAYER,
    t,
    i.name
  ), [a, c, { nameConflict: l }] = ts(
    (e == null ? void 0 : e.viewResolvers) || /* @__PURE__ */ new Map(),
    s,
    Ie.VIEW,
    t,
    i.name
  );
  if (o.size > 0) {
    console.warn(`Scene ${i.name} Layer name conflict:`, o), (u = i.resolver) == null || u.resolve(null);
    return;
  }
  if (l.size > 0) {
    console.warn(`Scene ${i.name} View name conflict:`, l), (h = i.resolver) == null || h.resolve(null);
    return;
  }
  if (!n) {
    console.warn("A Scene had no Layers:", i.name), (d = i.resolver) == null || d.resolve(null);
    return;
  }
  if (!a) {
    console.warn("A Scene had no Views:", i.name), (f = i.resolver) == null || f.resolve(null);
    return;
  }
  return Tt({
    async didMount() {
      var m;
      const [p, g] = await Promise.all([
        r,
        c
      ]);
      (m = i.resolver) == null || m.resolve({
        key: i.name,
        layers: p.filter(ne),
        views: g.filter(ne)
      });
    }
  }), /* @__PURE__ */ Re.jsx(Et, { tagName: "Scene", ...i, children: Hu(a, n) });
};
na.surfaceJSXType = Ie.SCENE;
function Cb(i) {
  const e = [];
  for (let t = 0, s = i.length; t < s; ++t) {
    const n = i[t];
    for (let r = 0, o = n.length; r < o; ++r)
      e.push(n[r]);
  }
  return e;
}
var Ob = Object.defineProperty, Lb = (i, e, t, s) => {
  for (var n = void 0, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (n = o(e, t, n) || n);
  return n && Ob(e, t, n), n;
};
const Xu = class Qu extends dt {
  constructor() {
    super(), this.tint = [1, 1, 1, 1], Xe(this, Qu);
  }
};
Lb([
  I
], Xu.prototype, "tint");
let Nb = Xu;
const Oc = new W({
  data: {
    width: 2,
    height: 2,
    buffer: new Uint8Array(16)
  }
}), fa = class fa extends zt {
  initShader() {
    let { buffers: e, fs: t, data: s } = this.props;
    const n = new Nb();
    s instanceof ae && s.add(n), this.alwaysDraw = !0;
    const r = [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1]
    ], o = r.map((l) => [
      l[0] === 1 ? 1 : 0,
      l[1] === 1 ? 1 : 0
    ]), a = Cb(
      Object.keys(e).map((l) => {
        let u = e[l];
        if (!u) return;
        Array.isArray(u) || (u = [u]);
        const h = [];
        for (let d = 0; d < u.length; d++) {
          const p = u[d].key;
          h.push(
            nn({
              key: p
            })
          );
        }
        return [
          {
            name: l,
            shaderInjection: _.FRAGMENT,
            size: A.TEXTURE,
            update: () => {
              const d = h.length < 2 ? h[0] : h[this.surface.frameMetrics.currentFrame % h.length];
              return this.resource.request(this, n, d), d.texture || Oc;
            }
          },
          {
            name: `${l}_size`,
            shaderInjection: _.FRAGMENT,
            size: A.TWO,
            update: () => {
              this.props;
              const d = h.length < 2 ? h[0] : h[this.surface.frameMetrics.currentFrame % h.length];
              this.resource.request(this, n, d);
              const f = (d.texture || Oc).data;
              return [(f == null ? void 0 : f.width) || 1, (f == null ? void 0 : f.height) || 1];
            }
          }
        ];
      }).filter(ne)
    );
    let c = this.props.uniforms || [];
    return Array.isArray(c) || (c = c(this)), Array.isArray(t) ? (t = t.slice(0), t[0].source = `varying vec2 ${this.props.textureCoordinateName || "texCoord"};
      ${t[0].source}`) : t = [
      {
        source: `
            varying vec2 ${this.props.textureCoordinateName || "texCoord"};
            ${t}
          `,
        outputType: G.COLOR
      }
    ], {
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
fa.defaultProps = {
  key: "",
  data: new ae(),
  buffers: {},
  baseShaderModules: () => ({ fs: [], vs: [] }),
  fs: [
    {
      outputType: G.COLOR,
      source: "void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);"
    }
  ]
};
let vo = fa;
const si = (i) => {
  var e;
  return /* @__PURE__ */ Re.jsxs(na, { name: i.name, children: [
    /* @__PURE__ */ Re.jsx(
      sa,
      {
        name: "fullscreen",
        type: ar,
        ...i.view,
        output: i.output,
        config: {
          camera: new ai(),
          viewport: { left: 0, top: 0, width: "100%", height: "100%" },
          materialSettings: {
            depthTest: !1,
            culling: x.Material.CullSide.NONE,
            blending: null
          },
          ...(e = i.view) == null ? void 0 : e.config
        }
      }
    ),
    /* @__PURE__ */ Re.jsx(
      ia,
      {
        name: "postprocess",
        type: vo,
        uses: {
          names: Object.values(i.buffers).flat(),
          apply: (t, s) => {
            var n;
            return s.buffers = {}, Object.keys(i.buffers).map((r) => {
              Array.isArray(i.buffers[r]) ? s.buffers[r] = i.buffers[r].map((o) => t[o]) : s.buffers[r] = t[i.buffers[r]];
            }), (n = i.onResources) == null || n.call(i, t), s;
          }
        },
        config: {
          printShader: i.printShader,
          buffers: {},
          fs: kt(i.shader) ? [
            {
              outputType: G.COLOR,
              source: i.shader
            }
          ] : i.shader,
          uniforms: i.uniforms,
          materialOptions: i.material,
          preventDraw: i.preventDraw
        }
      }
    )
  ] }, i.name);
}, Mx = (i) => /* @__PURE__ */ Re.jsxs(na, { name: i.name, children: [
  /* @__PURE__ */ Re.jsx(sa, { type: ar, config: { camera: new ai() } }),
  /* @__PURE__ */ Re.jsx(ia, { type: lo, config: { commands: i.callback } })
] }), Bb = `\${import: camera}

void main() {
  vec2 texelSize = 1.0 / viewSize;
  vec4 o = texelSize.xyxy * vec2(-delta, delta).xxyy;

  vec4 s =
    texture2D(sourceTex, texCoord + o.xy) + texture2D(sourceTex, texCoord + o.zy) +
    texture2D(sourceTex, texCoord + o.xw) + texture2D(sourceTex, texCoord + o.zw);

  \${out: color} = s * 0.25;
}
`;
var wo = /* @__PURE__ */ ((i) => (i[i.DOWN = 0] = "DOWN", i[i.UP = 1] = "UP", i))(wo || {});
function Lc(i) {
  const { output: e, input: t } = i;
  return si({
    name: i.name,
    printShader: i.printShader,
    output: e ? {
      buffers: { [G.COLOR]: e },
      depth: !1
    } : void 0,
    view: i.view,
    buffers: { sourceTex: t },
    shader: Bb,
    material: i.material,
    uniforms: [
      {
        name: "delta",
        size: A.ONE,
        shaderInjection: _.FRAGMENT,
        update: () => i.direction === 0 ? 1 : 0.5
      }
    ]
  });
}
function Sx(i) {
  const { compose: e, output: t, resources: s, view: n } = i, r = {
    blending: {
      blendDst: x.Material.BlendingDstFactor.One,
      blendSrc: x.Material.BlendingSrcFactor.One,
      blendEquation: x.Material.BlendingEquations.Add
    }
  }, o = [];
  for (let a = 0, c = i.samples; a < c; ++a) {
    const l = Lc({
      name: `${i.name}.box-down${a}`,
      printShader: i.printShader,
      input: s[a],
      output: s[a + 1],
      direction: wo.DOWN,
      material: {
        blending: void 0
      }
    });
    o.push(l);
  }
  for (let a = i.samples - 1; a > 0; --a) {
    const c = Lc({
      name: `${i.name}.box-up${a}`,
      printShader: i.printShader,
      input: s[a + 1],
      output: s[a],
      direction: wo.UP,
      material: r
    });
    o.push(c);
  }
  return e && o.push(
    si({
      name: `${i.name}.compose`,
      printShader: i.printShader,
      // Set the buffers we want to composite
      buffers: {
        color: e,
        glow: s[1]
      },
      // Turn off blending
      material: r,
      // Render to the screen, or to a potentially specified target
      view: {
        ...t ? {
          output: {
            buffers: { [G.COLOR]: t },
            depth: !1
          }
        } : void 0,
        ...n
      },
      uniforms: [
        {
          name: "gamma",
          size: A.ONE,
          shaderInjection: _.ALL,
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
function Pb(i) {
  return Array.isArray(i[0]);
}
const Cx = (i) => {
  const e = i.scale || Co(1, 1), s = (Pb(e) ? e : [i.scale]).map((o) => So(o)), n = 1 / s.length, r = q.useRef(i.zOffset);
  if (ne(i.drift)) {
    const o = i.drift;
    return si({
      name: i.name,
      buffers: {},
      view: {
        config: {
          drawMode: { mode: Wn.ALWAYS }
        }
      },
      output: {
        buffers: {
          [G.COLOR]: i.output
        },
        depth: !1
      },
      uniforms: [
        {
          name: "drift",
          size: A.THREE,
          shaderInjection: _.FRAGMENT,
          update: () => o
        }
      ],
      shader: `
        \${import: time, simplexNoise3D}

        void main() {
          float value = 0.;
          ${s.map(
        (a) => `value += simplexNoise3D(vec3(gl_FragCoord.xy * vec2(${a[0]}f, ${a[1]}f), 0.) + (drift * time));`
      ).join(`
`)}
          value *= ${n.toFixed(1)}f;
          \${out: color} = vec4(value, value, value, 1.);
        }
      `
    });
  } else if (ne(i.zOffset)) {
    const o = i.zOffset;
    return si({
      name: i.name,
      buffers: {},
      view: {
        config: {
          drawMode: {
            mode: Wn.ON_TRIGGER,
            trigger: () => {
              const a = r.current !== o;
              return r.current = o, a;
            }
          }
        }
      },
      output: {
        buffers: {
          [G.COLOR]: i.output
        },
        depth: !1
      },
      uniforms: [
        {
          name: "zOffset",
          size: A.ONE,
          update: Fc(o) ? () => [o] : () => [o()]
        }
      ],
      shader: `
        \${import: simplexNoise3D}

        void main() {
          float value = 0.;
          ${s.map(
        (a) => `
            value += simplexNoise3D(vec3(gl_FragCoord.xy * vec2(${a[0]}f, ${a[1]}f), zOffset));
          `
      ).join(`
`)}
          value *= ${n.toFixed(1)}f;
          \${out: color} = vec4(value, value, value, 1.);
        }
      `
    });
  } else
    return si({
      name: i.name,
      buffers: {},
      view: {
        config: {
          drawMode: { mode: Wn.FRAME_COUNT, value: 1 }
        }
      },
      output: {
        buffers: {
          [G.COLOR]: i.output
        },
        depth: !1
      },
      shader: `
        \${import: simplexNoise2D}

        void main() {
          float value = 0.;
          ${s.map(
        (o) => `
            value += simplexNoise2D(gl_FragCoord.xy * vec2(${o[0]}f, ${o[1]}f));
          `
      ).join(`
`)}
          value *= ${n.toFixed(1)}f;
          \${out: color} = vec4(value, value, value, 1.);
        }
      `
    });
};
function Ox(i) {
  var r;
  const { output: e, input: t, channel: s, grayScale: n } = i;
  return si({
    name: i.name,
    printShader: i.printShader,
    output: e ? {
      buffers: {
        [G.COLOR]: e || ""
      },
      depth: !1
    } : void 0,
    view: {
      ...i.view,
      config: {
        camera: new ai(),
        ...(r = i.view) == null ? void 0 : r.config
      }
    },
    buffers: { color: t },
    shader: n && s ? `
      void main() {
        \${out: color} = vec4(texture2D(color, texCoord).${s}${s}${s}, 1.);
      }
    ` : s ? `
      void main() {
        \${out: color} = vec4(texture2D(color, texCoord).${s}, 0., 0., 1.);
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
function Lx(i) {
  const { output: e, input: t, view: s } = i, n = [];
  return n.push(
    si({
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
        buffers: { [G.COLOR]: e },
        depth: !1
      },
      view: {
        config: {
          // clearFlags: [ClearFlags.COLOR],
        },
        ...s
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
  ), i.drift ? i.drift && n.push(
    si({
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
      view: s,
      output: {
        buffers: { [G.COLOR]: t.trail },
        depth: !1
      },
      uniforms: [
        {
          name: "drift",
          size: A.TWO,
          shaderInjection: _.FRAGMENT,
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
  ) : n.push(
    si({
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
        buffers: { [G.COLOR]: t.trail },
        depth: !1
      },
      view: s,
      // Utilize our composition shader
      shader: `
          void main() {
            vec4 fade = texture2D(tex, texCoord);
            fade.rgba *= ${i.intensity || 0.7};
            \${out: color} = fade;
          }
        `
    })
  ), n;
}
const pa = class pa extends zt {
  constructor(e, t, s) {
    super(e, t, s), console.warn(
      "Please ensure all debugLayer calls are removed for production:",
      s.key
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
    ), t = e.childLayers(), s = {};
    for (; t.length > 0; ) {
      const n = t.pop();
      if (!n) continue;
      const r = new n.init[0](
        this.surface,
        this.scene,
        n.init[1]
      );
      s[r.id] = {
        shaderIO: r.initShader()
      }, r.childLayers().forEach((o) => t.push(o));
    }
    return console.warn(`Shader IO: ${this.id}
`, {
      shaderIO: e.initShader(),
      childLayers: s
    }), null;
  }
};
pa.defaultProps = {
  data: new ae(),
  key: "default",
  messageHeader: () => "",
  wrap: ks(zt, {
    data: new ae()
  })
};
let To = pa;
function Nx(i, e) {
  const t = Vs(To, {
    messageHeader: () => `CHANGES FOR: ${t.init[1].key}`,
    wrap: Vs(i, e),
    data: e.data
  });
  return t;
}
export {
  yg as ActiveIOExpansion,
  L as AnchorType,
  xx as ArcInstance,
  hc as ArcLayer,
  Tm as ArcScaleType,
  $p as Atlas,
  Mb as AtlasJSX,
  Hp as AtlasManager,
  Xp as AtlasResourceManager,
  ni as Attribute,
  Qt as AutoEasingLoopStyle,
  $o as AutoEasingMethod,
  rb as Axis2D,
  Ar as BaseIOExpansion,
  em as BaseIOSorting,
  Vo as BaseProjection,
  un as BaseResourceManager,
  Dp as BaseShaderIOInjection,
  pm as BasicCamera2DController,
  Rb as BasicCamera2DControllerJSX,
  xg as BasicIOExpansion,
  Sx as BloomJSX,
  J as Bounds,
  Lc as BoxSampleJSX,
  wo as BoxSampleJSXDirection,
  fn as BufferManagerBase,
  $i as Camera,
  ai as Camera2D,
  fm as CameraBoundsAnchor,
  Vi as CameraProjectionType,
  vx as CircleInstance,
  dc as CircleLayer,
  $n as ClearFlags,
  lo as CommandLayer,
  Mx as CommandsJSX,
  it as CommonMaterialOptions,
  Wi as Control2D,
  _x as CubeInstance,
  Rc as CubeLayer,
  Et as CustomTag,
  am as DEFAULT_IO_EXPANSION,
  cm as DEFAULT_RESOURCE_MANAGEMENT,
  Kp as DEFAULT_RESOURCE_ROUTER,
  lm as DEFAULT_SHADER_TRANSFORM,
  Ox as DrawJSX,
  fg as EasingIOExpansion,
  ax as EasingUtil,
  Bu as EdgeBroadphase,
  wx as EdgeInstance,
  fc as EdgeLayer,
  jn as EdgeScaleType,
  Jt as EdgeType,
  ie as EulerOrder,
  Nc as EventManager,
  Np as FontGlyphRenderSize,
  Ib as FontJSX,
  Pp as FontManager,
  _p as FontMap,
  co as FontMapGlyphType,
  Op as FontRenderer,
  zp as FontResourceManager,
  Us as FontResourceRequestFetch,
  G as FragmentOutputType,
  Xn as GLProxy,
  x as GLSettings,
  Vh as GLState,
  zi as Geometry,
  jm as GlyphInstance,
  fo as GlyphLayer,
  ef as Hadamard2x2,
  tf as Hadamard3x3,
  sf as Hadamard4x4,
  Kh as INVALID_RESOURCE_MANAGER,
  ap as IdentityTransform,
  Tx as ImageInstance,
  pc as ImageLayer,
  Ps as ImageRasterizer,
  Pn as IndexBufferSize,
  dt as Instance,
  db as Instance3D,
  Bg as InstanceAttributeBufferManager,
  Fg as InstanceAttributePackingBufferManager,
  S as InstanceAttributeSize,
  Bc as InstanceBlockIndex,
  me as InstanceDiffType,
  ae as InstanceProvider,
  Zb as InstanceProviderWithList,
  qh as InvalidResourceManager,
  Ne as LabelInstance,
  po as LabelLayer,
  zt as Layer,
  Be as Layer2D,
  se as LayerBufferType,
  Qg as LayerInteractionHandler,
  ia as LayerJSX,
  im as LayerMouseEvents,
  or as LayerScene,
  ss as M200,
  ns as M201,
  rs as M210,
  os as M211,
  gr as M300,
  mr as M301,
  br as M302,
  xr as M310,
  vr as M311,
  wr as M312,
  Tr as M320,
  Er as M321,
  yr as M322,
  Ls as M3R,
  ci as M400,
  li as M401,
  ui as M402,
  hi as M403,
  di as M410,
  fi as M411,
  pi as M412,
  gi as M413,
  mi as M420,
  bi as M421,
  xi as M422,
  vi as M423,
  wi as M430,
  Ti as M431,
  Ei as M432,
  yi as M433,
  De as M4R,
  pr as Material,
  Ee as MaterialUniformType,
  Jb as MatrixMath,
  kl as Model,
  Yu as MouseButton,
  Eo as NOOP,
  en as NewLineCharacterMode,
  Yg as NoView,
  Se as ObservableMonitoring,
  He as PackNode,
  X as PickType,
  Nb as PostProcessInstance,
  si as PostProcessJSX,
  vo as PostProcessLayer,
  ob as Projection3D,
  Ue as PromiseResolver,
  If as QR1,
  Mf as QR2,
  Sf as QR3,
  Cf as QR4,
  Bf as QW,
  Of as QX,
  Lf as QY,
  Nf as QZ,
  Tp as QuadTree,
  Zs as QuadTreeNode,
  wp as QuadTreeQuadrants,
  ex as QuaternionMath,
  Cu as QueuedEventHandler,
  Eb as QueuedEventHandlerJSX,
  fx as REQUEST,
  dx as RESOURCE,
  tx as RayMath,
  nr as ReactiveDiff,
  a0 as RectangleInstance,
  wc as RectangleLayer,
  bx as ReferenceCamera2D,
  is as RenderTarget,
  Or as RenderTexture,
  Yp as RenderTextureResourceManager,
  ux as ResourcePool,
  _u as ResourceRouter,
  oe as ResourceType,
  yx as RingInstance,
  Tc as RingLayer,
  Yr as SRT4x4,
  Kl as SRT4x4_2D,
  ei as ScaleMode,
  jr as Scene,
  lb as SceneGraphLayer,
  na as SceneJSX,
  _ as ShaderInjectionTarget,
  be as ShaderModule,
  Br as ShaderModuleUnit,
  ab as Simple3DTransformController,
  Ab as Simple3DTransformControllerJSX,
  hr as SimpleEventHandler,
  yb as SimpleEventHandlerJSX,
  Qh as SimpleProjection,
  Cx as SimplexNoiseJSX,
  Wr as StreamChangeStrategy,
  Ui as SubTexture,
  hm as Surface,
  mn as SurfaceContext,
  Pc as SurfaceErrorType,
  Ix as SurfaceJSX,
  kn as TRS4x4,
  Af as TRS4x4_2D,
  go as TextAlignment,
  Ex as TextAreaInstance,
  vc as TextAreaLayer,
  W as Texture,
  qo as TextureIOExpansion,
  _b as TextureJSX,
  gt as TextureSize,
  Lx as TrailJSX,
  Yo as Transform,
  Ax as Transform2D,
  hu as TreeNode,
  kg as UniformBufferManager,
  A as UniformSize,
  Mt as UseMaterialStatus,
  Jg as UserInputEventManager,
  $e as V3R,
  dh as V4R,
  F as VecMath,
  ix as VectorMath,
  ke as VertexAttributeSize,
  cn as View,
  ar as View2D,
  yc as View3D,
  Wn as ViewDrawMode,
  sa as ViewJSX,
  $h as WebGLRenderer,
  O as WebGLStat,
  qt as WordWrap,
  Ro as add1,
  Gi as add2,
  Qd as add2x2,
  ri as add3,
  Yd as add3x3,
  Bo as add4,
  Sh as add4by3,
  qd as add4x4,
  Pf as addQuat,
  Ud as affineInverse2x2,
  zd as affineInverse3x3,
  Gd as affineInverse4x4,
  Hf as angleQuat,
  ze as apply1,
  le as apply2,
  xt as apply2x2,
  fe as apply3,
  Je as apply3x3,
  ue as apply4,
  ge as apply4x4,
  Js as atlasRequest,
  Xf as axisQuat,
  kc as ceil1,
  il as ceil2,
  pl as ceil3,
  Tl as ceil4,
  Ze as clamp,
  Nh as color4FromHex3,
  Bh as color4FromHex4,
  xa as colorBufferFormat,
  Wb as colorUID,
  Uc as compare1,
  Mo as compare2,
  Tf as compare2x2,
  Qn as compare3,
  Ef as compare3x3,
  Po as compare4,
  ql as compare4x4,
  Xd as concat4x4,
  Hu as concatChildren,
  Jl as conjugateQuat,
  rx as convertToSDF,
  zc as copy1,
  Io as copy2,
  yf as copy2x2,
  ct as copy3,
  Rf as copy3x3,
  ii as copy4,
  an as copy4x4,
  lx as create,
  Au as createAtlas,
  Ep as createAttribute,
  Vs as createChildLayer,
  px as createEasingAttribute,
  Ru as createFont,
  ks as createLayer,
  Rx as createLayer2Din3D,
  Vb as createMaterialOptions,
  Gl as createTexture,
  yp as createUniform,
  Rp as createVertex,
  Su as createView,
  Vc as cross1,
  nl as cross2,
  tt as cross3,
  yl as cross4,
  Nx as debugLayer,
  Qo as decomposeRotation,
  va as depthBufferFormat,
  de as determinant2x2,
  Bs as determinant3x3,
  Vl as determinant4x4,
  kf as diffUnitQuat,
  $c as divide1,
  dr as divide2,
  fr as divide3,
  Rl as divide4,
  Ff as divideQuat,
  Zc as dot1,
  ln as dot2,
  Yn as dot3,
  Uo as dot4,
  Vf as dotQuat,
  Mh as down3,
  xs as drawMode,
  Wc as empty1,
  rl as empty2,
  gl as empty3,
  Al as empty4,
  qf as eulerToQuat,
  Ht as eventElementPosition,
  Df as exponentQuat,
  jc as flatten1,
  ol as flatten2,
  ml as flatten3,
  Fo as flatten4,
  Hc as floor1,
  al as floor2,
  bl as floor3,
  _l as floor4,
  $s as fontRequest,
  Gc as forward1,
  sl as forward2,
  Ns as forward3,
  El as forward4,
  qr as fromEulerAxisAngleToQuat,
  iu as fromOrderedEulerToQuat,
  gh as fuzzyCompare1,
  xh as fuzzyCompare2,
  Eh as fuzzyCompare3,
  Ch as fuzzyCompare4,
  Rg as generateDefaultScene,
  Ig as generateLayerGeometry,
  Og as generateLayerMaterial,
  dn as generateLayerModel,
  Ca as getAbsolutePositionBounds,
  Db as getProgramInfo,
  tp as iQuat,
  Rr as identity2,
  Ri as identity3,
  re as identity4,
  Gf as imaginaryQuat,
  vn as indexToColorAttachment,
  Zu as indexToTextureUnit,
  og as injectShaderIO,
  xn as inputImageFormat,
  nh as instanceAttributeSizeFloatCount,
  Xc as inverse1,
  So as inverse2,
  tn as inverse3,
  Il as inverse4,
  Uf as inverseQuat,
  qa as isAtlasResource,
  Yi as isBoolean,
  gx as isBufferLocation,
  Mu as isBufferLocationGroup,
  ne as isDefined,
  Ya as isFontResource,
  $b as isFunction,
  mx as isInstanceAttributeBufferLocation,
  Ng as isInstanceAttributeBufferLocationGroup,
  kb as isInstanceAttributeVector,
  Gb as isNewline,
  Fc as isNumber,
  Cs as isOffscreenCanvas,
  cp as isOrthographic,
  fu as isPerspective,
  Pi as isRenderTextureResource,
  Ub as isResourceAttribute,
  kt as isString,
  Dg as isUniformBufferLocation,
  Kb as isUniformFloat,
  Qb as isUniformMat3,
  Yb as isUniformMat4,
  qb as isUniformTexture,
  jb as isUniformVec2,
  Hb as isUniformVec3,
  Xb as isUniformVec4,
  zh as isUniformVec4Array,
  fh as isVec1,
  Dc as isVec2,
  ph as isVec3,
  U as isVec4,
  On as isVideoResource,
  Ss as isWhiteSpace,
  ip as jQuat,
  sp as kQuat,
  Ih as left3,
  el as length1,
  bh as length1Components,
  ds as length2,
  fl as length2Components,
  Oo as length3,
  wl as length3Components,
  zo as length4,
  Di as length4Components,
  eu as lengthQuat,
  Jc as linear1,
  dl as linear2,
  vl as linear3,
  Sl as linear4,
  Jf as lookAtMatrix,
  su as lookAtQuat,
  ws as magFilter,
  ox as makeFontSDF,
  Xe as makeObservable,
  Jr as mapGetWithDefault,
  hs as mapInjectDefault,
  Kr as matrix3x3FromUnitQuatModel,
  Yf as matrix3x3FromUnitQuatView,
  Kf as matrix3x3ToQuaternion,
  Qf as matrix4x4FromUnitQuatModel,
  Xo as matrix4x4FromUnitQuatView,
  Zf as matrix4x4ToQuaternion,
  Qc as max1,
  cl as max2,
  Lo as max3,
  Cl as max4,
  Yc as min1,
  ll as min2,
  No as min3,
  Ol as min4,
  Ci as minFilter,
  qc as multiply1,
  ul as multiply2,
  jd as multiply2x2,
  xl as multiply3,
  Hd as multiply3x3,
  Ml as multiply4,
  lt as multiply4x4,
  er as multiplyQuat,
  Vd as multiplyScalar2x2,
  $d as multiplyScalar3x3,
  Wd as multiplyScalar4x4,
  _a as newLineCharRegEx,
  rh as newLineRegEx,
  ou as nextFrame,
  Kc as normalize1,
  hl as normalize2,
  mt as normalize3,
  Ll as normalize4,
  tu as normalizeQuat,
  Eu as normalizeWheel,
  I as observable,
  au as onAnimationLoop,
  oi as onFrame,
  tr as oneQuat,
  Ql as orthographic4x4,
  eg as packAttributes,
  Xl as perspective4x4,
  wf as perspectiveFOVY4x4,
  Wo as perspectiveFrustum4x4,
  hx as preloadNumber,
  Qr as project3As4ToScreen,
  Yl as projectToScreen,
  nu as ray,
  ru as rayFromPoints,
  rp as rayToLocation,
  zf as realQuat,
  rr as removeComments,
  yu as renderGlyph,
  lu as resolveUpdate,
  Th as reverse2,
  Rh as reverse3,
  Lh as reverse4,
  _h as right3,
  Zr as rotateVectorByUnitQuat,
  $l as rotation2x2,
  Wl as rotation4x4,
  bf as rotation4x4by3,
  Ao as scale1,
  Ae as scale2,
  ht as scale3,
  Do as scale4,
  jl as scale4x4,
  xf as scale4x4by3,
  Zl as scaleQuat,
  cu as scheduleUpdate,
  as as shaderTemplate,
  du as shallowCompare,
  of as shearX2x2,
  cf as shearX4x4,
  af as shearY2x2,
  lf as shearY4x4,
  uf as shearZ4x4,
  Nl as slerpQuat,
  ep as slerpUnitQuat,
  Ku as stencilBufferFormat,
  nx as stopAllFrameCommands,
  Ua as stopAnimationLoop,
  cs as subTextureIOValue,
  _o as subtract1,
  Te as subtract2,
  Kd as subtract2x2,
  ti as subtract3,
  Zd as subtract3x3,
  ko as subtract4,
  Jd as subtract4x4,
  vs as texelFormat,
  nn as textureRequest,
  Ta as textureUnitToIndex,
  Wf as toEulerFromQuat,
  $f as toEulerXYZfromOrderedEuler,
  Ho as toOrderedEulerFromQuat,
  jf as toOrderedEulerFromQuat2,
  Ph as toString1,
  Fh as toString2,
  pf as toString2x2,
  Dh as toString3,
  gf as toString3x3,
  kh as toString4,
  mf as toString4x4,
  mh as tod1,
  vh as tod2,
  yh as tod3,
  Oh as tod4,
  wh as tod_flip2,
  ah as touchesContainsStartView,
  oh as touchesHasStartView,
  hf as transform2,
  df as transform3,
  ff as transform3as4,
  Kn as transform4,
  Hl as translation4x4,
  vf as translation4x4by3,
  nf as transpose2x2,
  Dn as transpose3x3,
  rf as transpose4x4,
  P as uid,
  Ah as up3,
  ts as useChildResolvers,
  tl as vec1,
  Bl as vec1Methods,
  Co as vec2,
  Pl as vec2Methods,
  ls as vec3,
  Fl as vec3Methods,
  qn as vec4,
  Dl as vec4Methods,
  cx as wait,
  Aa as whiteSpaceCharRegEx,
  zb as whiteSpaceRegEx,
  wa as wrapMode,
  xe as zeroQuat
};
//# sourceMappingURL=index.js.map
