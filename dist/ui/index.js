(function(){"use strict";try{if(typeof document<"u"){var e=document.createElement("style");e.appendChild(document.createTextNode(".SurfaceJSX{flex:1 1 auto;display:flex;flex-direction:column;width:100%;height:100%;overflow:hidden}")),document.head.appendChild(e)}}catch(t){console.error("vite-plugin-css-injected-by-js",t)}})();
import Z, { useState as Co, useEffect as No } from "react";
window.WebGL2RenderingContext = window.WebGL2RenderingContext || function() {
};
class Zc {
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
class gs extends Zc {
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
var fh = /* @__PURE__ */ ((r) => (r[r.NONE = -1] = "NONE", r[r.LEFT = 0] = "LEFT", r[r.AUX = 1] = "AUX", r[r.RIGHT = 2] = "RIGHT", r[r.FOURTH = 3] = "FOURTH", r[r.FIFTH = 4] = "FIFTH", r))(fh || {});
class cr {
  /**
   * The data provided is the array that holds all of the information that
   * should be pushed to the GPU. The size defines how large the vertex
   * attribute is defined in the shader.
   */
  constructor(e, t, i = !1, n = !1) {
    this._isInstanced = !1, this._fullUpdate = !1, this.normalize = !1, this._needsUpdate = !1, this._updateRange = {
      /** Number of vertices to update */
      count: -1,
      /** Offset to the first vertex to begin updating */
      offset: -1
    }, this.data = e, this.size = t, this._isDynamic = i, this._isInstanced = n;
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
    const i = new Float32Array(e * this.size);
    i.length >= t ? t === this.data.length ? i.set(this.data) : i.set(this.data.subarray(0, t)) : i.set(this.data.subarray(0, i.length)), this.destroy(), this.data = i, this._needsUpdate = !0, this._fullUpdate = !0;
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
  repeatInstances(e, t, i = 1) {
    if (e === 0)
      return;
    if (i < 1)
      throw new Error(
        "Can not use repeatInstance on attribute with a startInstance of less than 1"
      );
    const n = t * this.size;
    if (i * n + n > this.data.length)
      return;
    const s = Math.floor(this.data.length / n), a = Math.min(i + e, s), o = i * n;
    this.data.copyWithin(o, 0, n);
    let c = 1, l = a - i - 1, u = 36;
    for (; l > 0 && --u > 0; )
      this.data.copyWithin(
        o + c * n,
        o,
        // We recopy the copied instances to our new destination, but we limit
        // this to the number of instances we have left to copy in this batch.
        // This effectively causes us to double the number of instances we copy
        // each iteration, thus making this operation siginificantly faster.
        o + Math.min(l, c) * n
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
class $r {
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
    let i;
    t.name = e, Object.values(this._attributes).forEach((n) => {
      const s = n.isInstanced ? 1 : 0;
      i === void 0 && (i = s), (i ^ s) === 1 && (this.isInstanced = !0);
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
    const i = Object.values(this._attributes);
    for (const n of i)
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
var f;
((r) => {
  ((e) => {
    ((t) => {
      t[t.RGBA4 = 0] = "RGBA4", t[t.RGB565 = 1] = "RGB565", t[t.RGB5_A1 = 2] = "RGB5_A1", t[t.R8 = 3] = "R8", t[t.R8UI = 4] = "R8UI", t[t.R8I = 5] = "R8I", t[t.R16UI = 6] = "R16UI", t[t.R16I = 7] = "R16I", t[t.R32UI = 8] = "R32UI", t[t.R32I = 9] = "R32I", t[t.RG8 = 10] = "RG8", t[t.RG8UI = 11] = "RG8UI", t[t.RG8I = 12] = "RG8I", t[t.RG16UI = 13] = "RG16UI", t[t.RG16I = 14] = "RG16I", t[t.RG32UI = 15] = "RG32UI", t[t.RG32I = 16] = "RG32I", t[t.RGB8 = 17] = "RGB8", t[t.RGBA8 = 18] = "RGBA8", t[t.SRGB8_ALPHA8 = 19] = "SRGB8_ALPHA8", t[t.RGB10_A2 = 20] = "RGB10_A2", t[t.RGBA8UI = 21] = "RGBA8UI", t[t.RGBA8I = 22] = "RGBA8I", t[t.RGB10_A2UI = 23] = "RGB10_A2UI", t[t.RGBA16UI = 24] = "RGBA16UI", t[t.RGBA16I = 25] = "RGBA16I", t[t.RGBA32I = 26] = "RGBA32I", t[t.RGBA32UI = 27] = "RGBA32UI", t[t.R16F = 28] = "R16F", t[t.R32F = 29] = "R32F", t[t.RG16F = 30] = "RG16F", t[t.RG32F = 31] = "RG32F", t[t.RGB16F = 32] = "RGB16F", t[t.RGB32F = 33] = "RGB32F", t[t.RGBA16F = 34] = "RGBA16F", t[t.RGBA32F = 35] = "RGBA32F", t[t.R11F_G11F_B10F = 36] = "R11F_G11F_B10F";
    })(e.ColorBufferFormat || (e.ColorBufferFormat = {})), ((t) => {
      t[t.DEPTH_COMPONENT16 = 0] = "DEPTH_COMPONENT16", t[t.DEPTH_STENCIL = 1] = "DEPTH_STENCIL", t[t.DEPTH_COMPONENT24 = 2] = "DEPTH_COMPONENT24", t[t.DEPTH_COMPONENT32F = 3] = "DEPTH_COMPONENT32F", t[t.DEPTH24_STENCIL8 = 4] = "DEPTH24_STENCIL8", t[t.DEPTH32F_STENCIL8 = 5] = "DEPTH32F_STENCIL8";
    })(e.DepthBufferFormat || (e.DepthBufferFormat = {})), ((t) => {
      t[t.STENCIL_INDEX8 = 0] = "STENCIL_INDEX8";
    })(e.StencilBufferFormat || (e.StencilBufferFormat = {}));
  })(r.RenderTarget || (r.RenderTarget = {})), ((e) => {
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
  })(r.Material || (r.Material = {})), ((e) => {
    ((t) => {
      t[t.LINE_LOOP = 0] = "LINE_LOOP", t[t.LINE_STRIP = 1] = "LINE_STRIP", t[t.LINES = 2] = "LINES", t[t.POINTS = 3] = "POINTS", t[t.TRIANGLE_FAN = 4] = "TRIANGLE_FAN", t[t.TRIANGLE_STRIP = 5] = "TRIANGLE_STRIP", t[t.TRIANGLES = 6] = "TRIANGLES";
    })(e.DrawMode || (e.DrawMode = {}));
  })(r.Model || (r.Model = {})), ((e) => {
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
      t[t.Alpha = -1] = "Alpha", t[t.DepthComponent = 1] = "DepthComponent", t[t.DepthStencil = 2] = "DepthStencil", t[t.Luminance = 3] = "Luminance", t[t.LuminanceAlpha = 4] = "LuminanceAlpha", t[t.RGB = 5] = "RGB", t[t.RGBA = 6] = "RGBA", t[t.RGBE = 7] = "RGBE", t[t.R8 = 8] = "R8", t[t.R16F = 9] = "R16F", t[t.R32F = 10] = "R32F", t[t.R8UI = 11] = "R8UI", t[t.RG8 = 12] = "RG8", t[t.RG16F = 13] = "RG16F", t[t.RG32F = 14] = "RG32F", t[t.RG8UI = 15] = "RG8UI", t[t.RG16UI = 16] = "RG16UI", t[t.RG32UI = 17] = "RG32UI", t[t.RGB8 = 18] = "RGB8", t[t.SRGB8 = 19] = "SRGB8", t[t.RGB565 = 20] = "RGB565", t[t.R11F_G11F_B10F = 21] = "R11F_G11F_B10F", t[t.RGB9_E5 = 22] = "RGB9_E5", t[t.RGB16F = 23] = "RGB16F", t[t.RGB32F = 24] = "RGB32F", t[t.RGB8UI = 25] = "RGB8UI", t[t.RGBA8 = 26] = "RGBA8", t[t.SRGB8_ALPHA8 = 27] = "SRGB8_ALPHA8", t[t.RGB5_A1 = 28] = "RGB5_A1", t[t.RGB10_A2 = 29] = "RGB10_A2", t[t.RGBA4 = 30] = "RGBA4", t[t.RGBA16F = 31] = "RGBA16F", t[t.RGBA32F = 32] = "RGBA32F", t[t.RGBA8UI = 33] = "RGBA8UI", t[t.DEPTH_COMPONENT16 = 34] = "DEPTH_COMPONENT16", t[t.DEPTH_COMPONENT24 = 35] = "DEPTH_COMPONENT24", t[t.DEPTH_COMPONENT32F = 36] = "DEPTH_COMPONENT32F", t[t.RGBA32UI = 37] = "RGBA32UI", t[t.RGB32UI = 38] = "RGB32UI", t[t.RGBA16UI = 39] = "RGBA16UI", t[t.RGB16UI = 40] = "RGB16UI", t[t.RGBA32I = 41] = "RGBA32I", t[t.RGB32I = 42] = "RGB32I", t[t.RGBA16I = 43] = "RGBA16I", t[t.RGB16I = 44] = "RGB16I", t[t.RGBA8I = 45] = "RGBA8I", t[t.RGB8I = 46] = "RGB8I", t[t.RED_INTEGER = 47] = "RED_INTEGER", t[t.RG_INTEGER = 48] = "RG_INTEGER", t[t.RGB_INTEGER = 49] = "RGB_INTEGER", t[t.RGBA_INTEGER = 50] = "RGBA_INTEGER", t[t.RED = 51] = "RED", t[t.RG = 52] = "RG", t[t.R8_SNORM = 53] = "R8_SNORM", t[t.R16_SNORM = 54] = "R16_SNORM", t[t.R32_SNORM = 55] = "R32_SNORM", t[t.R8I = 56] = "R8I", t[t.R16I = 57] = "R16I", t[t.R32I = 58] = "R32I", t[t.R16UI = 59] = "R16UI", t[t.R32UI = 60] = "R32UI", t[t.RG8_SNORM = 61] = "RG8_SNORM", t[t.RG8I = 62] = "RG8I", t[t.RG16I = 64] = "RG16I", t[t.RG32I = 65] = "RG32I", t[t.RGB8_SNORM = 66] = "RGB8_SNORM", t[t.RGBA8_SNORM = 69] = "RGBA8_SNORM", t[t.RGB10_A2UI = 72] = "RGB10_A2UI", t[t.DEPTH24_STENCIL8 = 73] = "DEPTH24_STENCIL8", t[t.DEPTH32F_STENCIL8 = 74] = "DEPTH32F_STENCIL8";
    })(e.TexelDataType || (e.TexelDataType = {})), ((t) => {
      t[t.ONE = 1] = "ONE", t[t.TWO = 2] = "TWO", t[t.FOUR = 4] = "FOUR", t[t.EIGHT = 8] = "EIGHT";
    })(e.PackAlignment || (e.PackAlignment = {})), ((t) => {
      t[t.ONE = 1] = "ONE", t[t.TWO = 2] = "TWO", t[t.FOUR = 4] = "FOUR", t[t.EIGHT = 8] = "EIGHT";
    })(e.UnpackAlignment || (e.UnpackAlignment = {}));
  })(r.Texture || (r.Texture = {})), ((e) => {
    ((t) => {
      t[t.ALPHA = 0] = "ALPHA", t[t.RGB = 1] = "RGB", t[t.RGBA = 2] = "RGBA";
    })(e.ReadFilter || (e.ReadFilter = {})), ((t) => {
      t[t.UNSIGNED_BYTE = 0] = "UNSIGNED_BYTE", t[t.UNSIGNED_SHORT_5_6_5 = 1] = "UNSIGNED_SHORT_5_6_5", t[t.UNSIGNED_SHORT_4_4_4_4 = 2] = "UNSIGNED_SHORT_4_4_4_4", t[t.UNSIGNED_SHORT_5_5_5_1 = 3] = "UNSIGNED_SHORT_5_5_5_1", t[t.FLOAT = 4] = "FLOAT";
    })(e.ReadTargetArrayFormat || (e.ReadTargetArrayFormat = {}));
  })(r.Renderer || (r.Renderer = {}));
})(f || (f = {}));
function mT(r, e) {
  const t = {
    attributeCount: 0,
    attributes: [],
    uniformCount: 0,
    uniforms: []
  }, i = r.getProgramParameter(e, r.ACTIVE_UNIFORMS), n = r.getProgramParameter(
    e,
    r.ACTIVE_ATTRIBUTES
  ), s = {
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
  }, a = {
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
  for (let o = 0; o < i; ++o) {
    const c = r.getActiveUniform(e, o);
    c.typeName = s[c.type], t.uniforms.push(c), t.uniformCount += c.size, c.size = c.size * a[c.type];
  }
  for (let o = 0; o < n; o++) {
    const c = r.getActiveAttrib(e, o);
    c.typeName = s[c.type], t.attributes.push(c), t.attributeCount += c.size;
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
}, ue.MSAA_MAX_SAMPLES = 0, ue.MAX_UNIFORM_BUFFER_BINDINGS = 0, ue.MAX_UNIFORM_BLOCK_SIZE = 0, ue.MAX_VERTEX_UNIFORM_BLOCKS = 0, ue.MAX_FRAGMENT_UNIFORM_BLOCKS = 0, ue.MAX_COMBINED_UNIFORM_BLOCKS = 0;
let N = ue;
function ph() {
  function r() {
    try {
      const i = document.createElement("canvas");
      let n;
      return n = i.getContext("webgl2"), n ? (N.WEBGL_VERSION = "webgl2", n) : (n = i.getContext("webgl"), n ? (N.WEBGL_VERSION = "webgl", n) : (n = i.getContext("experimental-webgl"), n ? (N.WEBGL_VERSION = "experimental-webgl", n) : null));
    } catch {
      return null;
    }
  }
  function e(i) {
    N.FLOAT_TEXTURE_READ.fullLinearFilter = !!i.getExtension("OES_texture_float_linear"), N.FLOAT_TEXTURE_READ.halfLinearFilter = !!i.getExtension("OES_texture_half_float_linear");
    const n = i.createTexture();
    if (i.bindTexture(i.TEXTURE_2D, n), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MIN_FILTER, i.NEAREST), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MAG_FILTER, i.NEAREST), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_S, i.CLAMP_TO_EDGE), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_T, i.CLAMP_TO_EDGE), i.getError() !== i.NO_ERROR)
      throw new Error("WebGLStat could not create a texture");
    const s = i.getExtension("OES_texture_float") || i.getExtension("EXT_color_buffer_float");
    if (i.getExtension("WEBGL_color_buffer_float"), s) {
      i.texImage2D(
        i.TEXTURE_2D,
        0,
        i instanceof WebGL2RenderingContext ? i.RGBA32F : i.RGBA,
        2,
        2,
        0,
        i.RGBA,
        i.FLOAT,
        null
      ), i.getError() === i.NO_ERROR && (N.FLOAT_TEXTURE_READ.full = !0);
      const u = i.createFramebuffer();
      i.bindFramebuffer(i.FRAMEBUFFER, u), i.framebufferTexture2D(
        i.FRAMEBUFFER,
        i.COLOR_ATTACHMENT0,
        i.TEXTURE_2D,
        n,
        0
      ), i.bindTexture(i.TEXTURE_2D, null), i.checkFramebufferStatus(i.FRAMEBUFFER) === i.FRAMEBUFFER_COMPLETE && (N.FLOAT_TEXTURE_WRITE.full = !0), i.deleteFramebuffer(u), i.deleteTexture(n);
    }
    const a = i.createTexture();
    if (i.bindTexture(i.TEXTURE_2D, a), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MIN_FILTER, i.NEAREST), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MAG_FILTER, i.NEAREST), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_S, i.CLAMP_TO_EDGE), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_T, i.CLAMP_TO_EDGE), i.getError() !== i.NO_ERROR)
      throw new Error("WebGLStat could not create a texture");
    const o = i.getExtension("OES_texture_half_float") || i.getExtension("EXT_color_buffer_float");
    if (o) {
      i.texImage2D(
        i.TEXTURE_2D,
        0,
        i instanceof WebGL2RenderingContext ? i.RGBA16F : i.RGBA,
        2,
        2,
        0,
        i.RGBA,
        i instanceof WebGL2RenderingContext ? i.HALF_FLOAT : o.HALF_FLOAT_OES,
        null
      ), i.getError() === i.NO_ERROR && (N.FLOAT_TEXTURE_READ.full = !0);
      const u = i.createFramebuffer();
      i.bindFramebuffer(i.FRAMEBUFFER, u), i.framebufferTexture2D(
        i.FRAMEBUFFER,
        i.COLOR_ATTACHMENT0,
        i.TEXTURE_2D,
        a,
        0
      ), i.bindTexture(i.TEXTURE_2D, null), i.checkFramebufferStatus(i.FRAMEBUFFER) === i.FRAMEBUFFER_COMPLETE && (N.FLOAT_TEXTURE_WRITE.full = !0), i.deleteFramebuffer(u), i.deleteTexture(a);
    }
  }
  const t = r();
  if (t)
    if (N.WEBGL_SUPPORTED = !0, N.MAX_VERTEX_UNIFORMS = t.getParameter(
      t.MAX_VERTEX_UNIFORM_VECTORS
    ), N.MAX_FRAGMENT_UNIFORMS = t.getParameter(
      t.MAX_FRAGMENT_UNIFORM_VECTORS
    ), N.MAX_VERTEX_ATTRIBUTES = t.getParameter(t.MAX_VERTEX_ATTRIBS), N.MAX_TEXTURE_SIZE = t.getParameter(t.MAX_TEXTURE_SIZE), e(t), t instanceof WebGL2RenderingContext)
      N.VAO = !0, N.MRT = !0, N.HARDWARE_INSTANCING = !0, N.SHADERS_3_0 = !0, N.HARDWARE_INSTANCING = !0, N.DEPTH_TEXTURE = !0, N.MSAA_MAX_SAMPLES = t.getParameter(t.MAX_SAMPLES), N.MAX_COLOR_ATTACHMENTS = t.getParameter(
        t.MAX_COLOR_ATTACHMENTS
      ), N.MAX_UNIFORM_BUFFER_BINDINGS = t.getParameter(
        t.MAX_UNIFORM_BUFFER_BINDINGS
      ), N.MAX_UNIFORM_BLOCK_SIZE = t.getParameter(
        t.MAX_UNIFORM_BLOCK_SIZE
      ), N.MAX_VERTEX_UNIFORM_BLOCKS = t.getParameter(
        t.MAX_VERTEX_UNIFORM_BLOCKS
      ), N.MAX_FRAGMENT_UNIFORM_BLOCKS = t.getParameter(
        t.MAX_FRAGMENT_UNIFORM_BLOCKS
      ), N.MAX_COMBINED_UNIFORM_BLOCKS = t.getParameter(
        t.MAX_COMBINED_UNIFORM_BLOCKS
      );
    else {
      N.VAO = !!t.getExtension("OES_vertex_array_object"), N.HARDWARE_INSTANCING = !!t.getExtension("ANGLE_instanced_arrays");
      const i = t.getExtension("WEBGL_draw_buffers");
      N.MRT_EXTENSION = !!i, N.MRT = !!i, N.DEPTH_TEXTURE = !!t.getExtension("WEBGL_depth_texture"), i && (N.MAX_COLOR_ATTACHMENTS = t.getParameter(
        i.MAX_COLOR_ATTACHMENTS_WEBGL
      ));
    }
  window.WebGLStat = N;
}
ph();
function wi(r, e) {
  switch (e) {
    case f.Model.DrawMode.LINES:
      return r.LINES;
    case f.Model.DrawMode.LINE_LOOP:
      return r.LINE_LOOP;
    case f.Model.DrawMode.LINE_STRIP:
      return r.LINE_STRIP;
    case f.Model.DrawMode.POINTS:
      return r.POINTS;
    case f.Model.DrawMode.TRIANGLES:
      return r.TRIANGLES;
    case f.Model.DrawMode.TRIANGLE_FAN:
      return r.TRIANGLE_FAN;
    case f.Model.DrawMode.TRIANGLE_STRIP:
      return r.TRIANGLE_STRIP;
    default:
      return r.TRIANGLES;
  }
}
function Ei(r, e) {
  switch (e) {
    case f.Texture.TexelDataType.Alpha:
      return r.ALPHA;
    case f.Texture.TexelDataType.DepthComponent:
      return r.DEPTH_COMPONENT;
    case f.Texture.TexelDataType.DepthStencil:
      return r.DEPTH_STENCIL;
    case f.Texture.TexelDataType.Luminance:
      return r.LUMINANCE;
    case f.Texture.TexelDataType.LuminanceAlpha:
      return r.LUMINANCE_ALPHA;
    case f.Texture.TexelDataType.RGB:
      return r.RGB;
    case f.Texture.TexelDataType.RGBA:
      return r.RGBA;
    default:
      if (r instanceof WebGL2RenderingContext)
        switch (e) {
          case f.Texture.TexelDataType.R8:
            return r.R8;
          case f.Texture.TexelDataType.R16F:
            return r.R16F;
          case f.Texture.TexelDataType.R32F:
            return r.R32F;
          case f.Texture.TexelDataType.R8UI:
            return r.R8UI;
          case f.Texture.TexelDataType.RG8:
            return r.RG8;
          case f.Texture.TexelDataType.RG16F:
            return r.RG16F;
          case f.Texture.TexelDataType.RG32F:
            return r.RG32F;
          case f.Texture.TexelDataType.RG8UI:
            return r.RG8UI;
          case f.Texture.TexelDataType.RG16UI:
            return r.RG16UI;
          case f.Texture.TexelDataType.RG32UI:
            return r.RG32UI;
          case f.Texture.TexelDataType.RGB8:
            return r.RGB8;
          case f.Texture.TexelDataType.SRGB8:
            return r.SRGB8;
          case f.Texture.TexelDataType.RGB565:
            return r.RGB565;
          case f.Texture.TexelDataType.R11F_G11F_B10F:
            return r.R11F_G11F_B10F;
          case f.Texture.TexelDataType.RGB9_E5:
            return r.RGB9_E5;
          case f.Texture.TexelDataType.RGB16F:
            return r.RGB16F;
          case f.Texture.TexelDataType.RGB32F:
            return r.RGB32F;
          case f.Texture.TexelDataType.RGB8UI:
            return r.RGB8UI;
          case f.Texture.TexelDataType.RGBA8:
            return r.RGBA8;
          case f.Texture.TexelDataType.SRGB8_ALPHA8:
            return r.SRGB8_ALPHA8;
          case f.Texture.TexelDataType.RGB5_A1:
            return r.RGB5_A1;
          case f.Texture.TexelDataType.RGB10_A2:
            return r.RGB10_A2;
          case f.Texture.TexelDataType.RGBA4:
            return r.RGBA4;
          case f.Texture.TexelDataType.RGBA16F:
            return r.RGBA16F;
          case f.Texture.TexelDataType.RGBA32F:
            return N.FLOAT_TEXTURE_READ.full && N.FLOAT_TEXTURE_WRITE.full ? r.RGBA32F : r.RGBA16F;
          case f.Texture.TexelDataType.RGBA8UI:
            return r.RGBA8UI;
          case f.Texture.TexelDataType.DEPTH_COMPONENT16:
            return r.DEPTH_COMPONENT16;
          case f.Texture.TexelDataType.DEPTH_COMPONENT24:
            return r.DEPTH_COMPONENT24;
          case f.Texture.TexelDataType.DEPTH_COMPONENT32F:
            return r.DEPTH_COMPONENT32F;
          case f.Texture.TexelDataType.DEPTH24_STENCIL8:
            return r.DEPTH24_STENCIL8;
          case f.Texture.TexelDataType.DEPTH32F_STENCIL8:
            return r.DEPTH32F_STENCIL8;
          case f.Texture.TexelDataType.RGBA32UI:
            return r.RGBA32UI;
          case f.Texture.TexelDataType.RGB32UI:
            return r.RGB32UI;
          case f.Texture.TexelDataType.RGBA16UI:
            return r.RGBA16UI;
          case f.Texture.TexelDataType.RGB16UI:
            return r.RGB16UI;
          case f.Texture.TexelDataType.RGBA32I:
            return r.RGBA32I;
          case f.Texture.TexelDataType.RGB32I:
            return r.RGB32I;
          case f.Texture.TexelDataType.RGBA16I:
            return r.RGBA16I;
          case f.Texture.TexelDataType.RGB16I:
            return r.RGB16I;
          case f.Texture.TexelDataType.RGBA8I:
            return r.RGBA8I;
          case f.Texture.TexelDataType.RGB8I:
            return r.RGB8I;
          case f.Texture.TexelDataType.RED:
            return r.RED;
          case f.Texture.TexelDataType.RG:
            return r.RG;
          case f.Texture.TexelDataType.RED_INTEGER:
            return r.RED_INTEGER;
          case f.Texture.TexelDataType.RG_INTEGER:
            return r.RG_INTEGER;
          case f.Texture.TexelDataType.RGB_INTEGER:
            return r.RGB_INTEGER;
          case f.Texture.TexelDataType.RGBA_INTEGER:
            return r.RGBA_INTEGER;
          case f.Texture.TexelDataType.R8_SNORM:
            return r.R8_SNORM;
          // case GLSettings.Texture.TexelDataType.R16_SNORM:
          //   return gl.R16_SNORM;
          // case GLSettings.Texture.TexelDataType.R32_SNORM:
          //   return gl.R32_SNORM;
          case f.Texture.TexelDataType.R8I:
            return r.R8I;
          case f.Texture.TexelDataType.R16I:
            return r.R16I;
          case f.Texture.TexelDataType.R32I:
            return r.R32I;
          case f.Texture.TexelDataType.R16UI:
            return r.R16UI;
          case f.Texture.TexelDataType.R32UI:
            return r.R32UI;
          case f.Texture.TexelDataType.RG8_SNORM:
            return r.RG8_SNORM;
          case f.Texture.TexelDataType.RG8I:
            return r.RG8I;
          case f.Texture.TexelDataType.RG16I:
            return r.RG16I;
          case f.Texture.TexelDataType.RG32I:
            return r.RG32I;
          case f.Texture.TexelDataType.RGB8_SNORM:
            return r.RGB8_SNORM;
          // case GLSettings.Texture.TexelDataType.RGB16_SNORM:
          //   return gl.RGB16_SNORM;
          // case GLSettings.Texture.TexelDataType.RGB32_SNORM:
          //   return gl.RGB32_SNORM;
          case f.Texture.TexelDataType.RGBA8_SNORM:
            return r.RGBA8_SNORM;
          // case GLSettings.Texture.TexelDataType.RGBA16_SNORM:
          //   return gl.RGBA16_SNORM;
          // case GLSettings.Texture.TexelDataType.RGBA32_SNORM:
          //   return gl.RGBA32_SNORM;
          case f.Texture.TexelDataType.RGB10_A2UI:
            return r.RGB10_A2UI;
          default:
            return console.warn(
              "An unsupported texel format was provided that is not supported in WebGL 1 or 2"
            ), r.RGBA;
        }
      return console.warn(
        "An Unsupported texel format was provided. Some formats are only available in WebGL 2",
        e
      ), r.RGBA;
  }
}
function _n(r, e) {
  switch (e) {
    case f.Texture.SourcePixelFormat.Byte:
      return r.BYTE;
    case f.Texture.SourcePixelFormat.Float:
      return r.FLOAT;
    case f.Texture.SourcePixelFormat.HalfFloat:
      return r.FLOAT;
    case f.Texture.SourcePixelFormat.Int:
      return r.INT;
    case f.Texture.SourcePixelFormat.Short:
      return r.SHORT;
    case f.Texture.SourcePixelFormat.UnsignedByte:
      return r.UNSIGNED_BYTE;
    case f.Texture.SourcePixelFormat.UnsignedInt:
      return r.UNSIGNED_INT;
    case f.Texture.SourcePixelFormat.UnsignedShort:
      return r.UNSIGNED_SHORT;
    case f.Texture.SourcePixelFormat.UnsignedShort_4_4_4_4:
      return r.UNSIGNED_SHORT_4_4_4_4;
    case f.Texture.SourcePixelFormat.UnsignedShort_5_5_5_1:
      return r.UNSIGNED_SHORT_5_5_5_1;
    case f.Texture.SourcePixelFormat.UnsignedShort_5_6_5:
      return r.UNSIGNED_SHORT_5_6_5;
    default:
      return console.warn("An Unsupported input image format was provided", e), r.BYTE;
  }
}
function yi(r, e) {
  switch (e) {
    case f.Texture.TextureMagFilter.Linear:
      return r.LINEAR;
    case f.Texture.TextureMagFilter.Nearest:
      return r.NEAREST;
  }
}
function Lr(r, e, t) {
  switch (e) {
    case f.Texture.TextureMinFilter.Linear:
      return r.LINEAR;
    case f.Texture.TextureMinFilter.Nearest:
      return r.NEAREST;
    case f.Texture.TextureMinFilter.LinearMipMapLinear:
      return t ? r.LINEAR_MIPMAP_LINEAR : r.LINEAR;
    case f.Texture.TextureMinFilter.LinearMipMapNearest:
      return t ? r.LINEAR_MIPMAP_NEAREST : r.LINEAR;
    case f.Texture.TextureMinFilter.NearestMipMapLinear:
      return t ? r.NEAREST_MIPMAP_LINEAR : r.NEAREST;
    case f.Texture.TextureMinFilter.NearestMipMapNearest:
      return t ? r.NEAREST_MIPMAP_NEAREST : r.NEAREST;
    default:
      return r.LINEAR;
  }
}
function Oo(r, e) {
  switch (e) {
    case f.RenderTarget.ColorBufferFormat.RGB565:
      return r.RGB565;
    case f.RenderTarget.ColorBufferFormat.RGB5_A1:
      return r.RGB5_A1;
    case f.RenderTarget.ColorBufferFormat.RGBA4:
      return r.RGBA4;
    default:
      if (r instanceof WebGL2RenderingContext)
        switch (e) {
          case f.RenderTarget.ColorBufferFormat.R8:
            return r.R8;
          case f.RenderTarget.ColorBufferFormat.R8UI:
            return r.R8UI;
          case f.RenderTarget.ColorBufferFormat.R8I:
            return r.R8I;
          case f.RenderTarget.ColorBufferFormat.R16UI:
            return r.R16UI;
          case f.RenderTarget.ColorBufferFormat.R16I:
            return r.R16I;
          case f.RenderTarget.ColorBufferFormat.R32UI:
            return r.R32UI;
          case f.RenderTarget.ColorBufferFormat.R32I:
            return r.R32I;
          case f.RenderTarget.ColorBufferFormat.RG8:
            return r.RG8;
          case f.RenderTarget.ColorBufferFormat.RG8UI:
            return r.RG8UI;
          case f.RenderTarget.ColorBufferFormat.RG8I:
            return r.RG8I;
          case f.RenderTarget.ColorBufferFormat.RG16UI:
            return r.RG16UI;
          case f.RenderTarget.ColorBufferFormat.RG16I:
            return r.RG16I;
          case f.RenderTarget.ColorBufferFormat.RG32UI:
            return r.RG32UI;
          case f.RenderTarget.ColorBufferFormat.RG32I:
            return r.RG32I;
          case f.RenderTarget.ColorBufferFormat.RGB8:
            return r.RGB8;
          case f.RenderTarget.ColorBufferFormat.RGBA8:
            return r.RGBA8;
          case f.RenderTarget.ColorBufferFormat.SRGB8_ALPHA8:
            return r.SRGB8_ALPHA8;
          case f.RenderTarget.ColorBufferFormat.RGB10_A2:
            return r.RGB10_A2;
          case f.RenderTarget.ColorBufferFormat.RGBA8UI:
            return r.RGBA8UI;
          case f.RenderTarget.ColorBufferFormat.RGBA8I:
            return r.RGBA8I;
          case f.RenderTarget.ColorBufferFormat.RGB10_A2UI:
            return r.RGB10_A2UI;
          case f.RenderTarget.ColorBufferFormat.RGBA16UI:
            return r.RGBA16UI;
          case f.RenderTarget.ColorBufferFormat.RGBA16I:
            return r.RGBA16I;
          case f.RenderTarget.ColorBufferFormat.RGBA32I:
            return r.RGBA32I;
          case f.RenderTarget.ColorBufferFormat.RGBA32UI:
            return r.RGBA32UI;
          case f.RenderTarget.ColorBufferFormat.R16F:
            return r.R16F;
          case f.RenderTarget.ColorBufferFormat.RG16F:
            return r.RG16F;
          case f.RenderTarget.ColorBufferFormat.RGBA16F:
            return r.RGBA16F;
          case f.RenderTarget.ColorBufferFormat.RGBA32F:
            return r.RGBA32F;
          case f.RenderTarget.ColorBufferFormat.R32F:
            return r.R32F;
          case f.RenderTarget.ColorBufferFormat.RG32F:
            return r.RG32F;
          case f.RenderTarget.ColorBufferFormat.RGB32F:
            return r.RGB32F;
          case f.RenderTarget.ColorBufferFormat.RGB16F:
            return r.RGB16F;
          case f.RenderTarget.ColorBufferFormat.R11F_G11F_B10F:
            return r.R11F_G11F_B10F;
        }
      return r.RGBA4;
  }
}
function Lo(r, e) {
  switch (e) {
    case f.RenderTarget.DepthBufferFormat.DEPTH_COMPONENT16:
      return r.DEPTH_COMPONENT16;
    case f.RenderTarget.DepthBufferFormat.DEPTH_STENCIL:
      return r.DEPTH_STENCIL;
    default:
      if (r instanceof WebGL2RenderingContext)
        switch (e) {
          case f.RenderTarget.DepthBufferFormat.DEPTH_COMPONENT24:
            return r.DEPTH_COMPONENT24;
          case f.RenderTarget.DepthBufferFormat.DEPTH_COMPONENT32F:
            return r.DEPTH_COMPONENT32F;
          case f.RenderTarget.DepthBufferFormat.DEPTH24_STENCIL8:
            return r.DEPTH24_STENCIL8;
          case f.RenderTarget.DepthBufferFormat.DEPTH32F_STENCIL8:
            return r.DEPTH32F_STENCIL8;
        }
      return r.DEPTH_COMPONENT16;
  }
}
function gh(r, e) {
  switch (e) {
    case f.RenderTarget.StencilBufferFormat.STENCIL_INDEX8:
      return r.STENCIL_INDEX8;
    default:
      return r.STENCIL_INDEX8;
  }
}
function Fo(r, e) {
  switch (e) {
    case f.Texture.Wrapping.CLAMP_TO_EDGE:
      return r.CLAMP_TO_EDGE;
    case f.Texture.Wrapping.MIRRORED_REPEAT:
      return r.MIRRORED_REPEAT;
    case f.Texture.Wrapping.REPEAT:
      return r.REPEAT;
  }
}
function An(r, e, t, i, n) {
  if (i)
    return r.COLOR_ATTACHMENT0;
  const s = e.drawBuffers;
  if (n) {
    if (s instanceof WebGL2RenderingContext)
      switch (t) {
        case -2:
          return r.BACK;
        case -1:
          return r.NONE;
        case 0:
          return s.DRAW_BUFFER0;
        case 1:
          return s.DRAW_BUFFER1;
        case 2:
          return s.DRAW_BUFFER2;
        case 3:
          return s.DRAW_BUFFER3;
        case 4:
          return s.DRAW_BUFFER4;
        case 5:
          return s.DRAW_BUFFER5;
        case 6:
          return s.DRAW_BUFFER6;
        case 7:
          return s.DRAW_BUFFER7;
        case 8:
          return s.DRAW_BUFFER8;
        case 9:
          return s.DRAW_BUFFER9;
        case 10:
          return s.DRAW_BUFFER10;
        case 11:
          return s.DRAW_BUFFER11;
        case 12:
          return s.DRAW_BUFFER12;
        case 13:
          return s.DRAW_BUFFER13;
        case 14:
          return s.DRAW_BUFFER14;
        case 15:
          return s.DRAW_BUFFER15;
        default:
          console.warn("Attachments are only available for -2 - 15");
      }
    else if (s)
      switch (t) {
        case -2:
          return r.BACK;
        case -1:
          return r.NONE;
        case 0:
          return s.DRAW_BUFFER0_WEBGL;
        case 1:
          return s.DRAW_BUFFER1_WEBGL;
        case 2:
          return s.DRAW_BUFFER2_WEBGL;
        case 3:
          return s.DRAW_BUFFER3_WEBGL;
        case 4:
          return s.DRAW_BUFFER4_WEBGL;
        case 5:
          return s.DRAW_BUFFER5_WEBGL;
        case 6:
          return s.DRAW_BUFFER6_WEBGL;
        case 7:
          return s.DRAW_BUFFER7_WEBGL;
        case 8:
          return s.DRAW_BUFFER8_WEBGL;
        case 9:
          return s.DRAW_BUFFER9_WEBGL;
        case 10:
          return s.DRAW_BUFFER10_WEBGL;
        case 11:
          return s.DRAW_BUFFER11_WEBGL;
        case 12:
          return s.DRAW_BUFFER12_WEBGL;
        case 13:
          return s.DRAW_BUFFER13_WEBGL;
        case 14:
          return s.DRAW_BUFFER14_WEBGL;
        case 15:
          return s.DRAW_BUFFER15_WEBGL;
        default:
          console.warn("Attachments are only available for 0 - 15");
      }
  } else if (s instanceof WebGL2RenderingContext)
    switch (t) {
      case -2:
        return r.BACK;
      case -1:
        return r.NONE;
      case 0:
        return s.COLOR_ATTACHMENT0;
      case 1:
        return s.COLOR_ATTACHMENT1;
      case 2:
        return s.COLOR_ATTACHMENT2;
      case 3:
        return s.COLOR_ATTACHMENT3;
      case 4:
        return s.COLOR_ATTACHMENT4;
      case 5:
        return s.COLOR_ATTACHMENT5;
      case 6:
        return s.COLOR_ATTACHMENT6;
      case 7:
        return s.COLOR_ATTACHMENT7;
      case 8:
        return s.COLOR_ATTACHMENT8;
      case 9:
        return s.COLOR_ATTACHMENT9;
      case 10:
        return s.COLOR_ATTACHMENT10;
      case 11:
        return s.COLOR_ATTACHMENT11;
      case 12:
        return s.COLOR_ATTACHMENT12;
      case 13:
        return s.COLOR_ATTACHMENT13;
      case 14:
        return s.COLOR_ATTACHMENT14;
      case 15:
        return s.COLOR_ATTACHMENT15;
      default:
        console.warn("Attachments are only available for -2 - 15");
    }
  else if (s)
    switch (t) {
      case -2:
        return r.BACK;
      case -1:
        return r.NONE;
      case 0:
        return s.COLOR_ATTACHMENT0_WEBGL;
      case 1:
        return s.COLOR_ATTACHMENT1_WEBGL;
      case 2:
        return s.COLOR_ATTACHMENT2_WEBGL;
      case 3:
        return s.COLOR_ATTACHMENT3_WEBGL;
      case 4:
        return s.COLOR_ATTACHMENT4_WEBGL;
      case 5:
        return s.COLOR_ATTACHMENT5_WEBGL;
      case 6:
        return s.COLOR_ATTACHMENT6_WEBGL;
      case 7:
        return s.COLOR_ATTACHMENT7_WEBGL;
      case 8:
        return s.COLOR_ATTACHMENT8_WEBGL;
      case 9:
        return s.COLOR_ATTACHMENT9_WEBGL;
      case 10:
        return s.COLOR_ATTACHMENT10_WEBGL;
      case 11:
        return s.COLOR_ATTACHMENT11_WEBGL;
      case 12:
        return s.COLOR_ATTACHMENT12_WEBGL;
      case 13:
        return s.COLOR_ATTACHMENT13_WEBGL;
      case 14:
        return s.COLOR_ATTACHMENT14_WEBGL;
      case 15:
        return s.COLOR_ATTACHMENT15_WEBGL;
      default:
        console.warn("Attachments are only available for 0 - 15");
    }
  return r.COLOR_ATTACHMENT0;
}
function mh(r, e) {
  return r.TEXTURE0 + e;
}
function Bo(r, e) {
  return e - r.TEXTURE0;
}
function xh(r) {
  return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default") ? r.default : r;
}
var Mn = { exports: {} }, In = { exports: {} }, Fs, Po;
function Th() {
  if (Po) return Fs;
  Po = 1;
  var r = 1e3, e = r * 60, t = e * 60, i = t * 24, n = i * 365.25;
  Fs = function(l, u) {
    u = u || {};
    var h = typeof l;
    if (h === "string" && l.length > 0)
      return s(l);
    if (h === "number" && isNaN(l) === !1)
      return u.long ? o(l) : a(l);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(l)
    );
  };
  function s(l) {
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
            return h * i;
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
            return h * r;
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
  function a(l) {
    return l >= i ? Math.round(l / i) + "d" : l >= t ? Math.round(l / t) + "h" : l >= e ? Math.round(l / e) + "m" : l >= r ? Math.round(l / r) + "s" : l + "ms";
  }
  function o(l) {
    return c(l, i, "day") || c(l, t, "hour") || c(l, e, "minute") || c(l, r, "second") || l + " ms";
  }
  function c(l, u, h) {
    if (!(l < u))
      return l < u * 1.5 ? Math.floor(l / u) + " " + h : Math.ceil(l / u) + " " + h + "s";
  }
  return Fs;
}
var Do;
function bh() {
  return Do || (Do = 1, function(r, e) {
    e = r.exports = i.debug = i.default = i, e.coerce = c, e.disable = a, e.enable = s, e.enabled = o, e.humanize = Th(), e.instances = [], e.names = [], e.skips = [], e.formatters = {};
    function t(l) {
      var u = 0, h;
      for (h in l)
        u = (u << 5) - u + l.charCodeAt(h), u |= 0;
      return e.colors[Math.abs(u) % e.colors.length];
    }
    function i(l) {
      var u;
      function h() {
        if (h.enabled) {
          var d = h, p = +/* @__PURE__ */ new Date(), g = p - (u || p);
          d.diff = g, d.prev = u, d.curr = p, u = p;
          for (var m = new Array(arguments.length), T = 0; T < m.length; T++)
            m[T] = arguments[T];
          m[0] = e.coerce(m[0]), typeof m[0] != "string" && m.unshift("%O");
          var x = 0;
          m[0] = m[0].replace(/%([a-zA-Z%])/g, function(v, E) {
            if (v === "%%") return v;
            x++;
            var y = e.formatters[E];
            if (typeof y == "function") {
              var C = m[x];
              v = y.call(d, C), m.splice(x, 1), x--;
            }
            return v;
          }), e.formatArgs.call(d, m);
          var b = h.log || e.log || console.log.bind(console);
          b.apply(d, m);
        }
      }
      return h.namespace = l, h.enabled = e.enabled(l), h.useColors = e.useColors(), h.color = t(l), h.destroy = n, typeof e.init == "function" && e.init(h), e.instances.push(h), h;
    }
    function n() {
      var l = e.instances.indexOf(this);
      return l !== -1 ? (e.instances.splice(l, 1), !0) : !1;
    }
    function s(l) {
      e.save(l), e.names = [], e.skips = [];
      var u, h = (typeof l == "string" ? l : "").split(/[\s,]+/), d = h.length;
      for (u = 0; u < d; u++)
        h[u] && (l = h[u].replace(/\*/g, ".*?"), l[0] === "-" ? e.skips.push(new RegExp("^" + l.substr(1) + "$")) : e.names.push(new RegExp("^" + l + "$")));
      for (u = 0; u < e.instances.length; u++) {
        var p = e.instances[u];
        p.enabled = e.enabled(p.namespace);
      }
    }
    function a() {
      e.enable("");
    }
    function o(l) {
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
  }(In, In.exports)), In.exports;
}
var Uo;
function vh() {
  return Uo || (Uo = 1, function(r, e) {
    e = r.exports = bh(), e.log = n, e.formatArgs = i, e.save = s, e.load = a, e.useColors = t, e.storage = typeof chrome < "u" && typeof chrome.storage < "u" ? chrome.storage.local : o(), e.colors = [
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
    function i(c) {
      var l = this.useColors;
      if (c[0] = (l ? "%c" : "") + this.namespace + (l ? " %c" : " ") + c[0] + (l ? "%c " : " ") + "+" + e.humanize(this.diff), !!l) {
        var u = "color: " + this.color;
        c.splice(1, 0, u, "color: inherit");
        var h = 0, d = 0;
        c[0].replace(/%[a-zA-Z%]/g, function(p) {
          p !== "%%" && (h++, p === "%c" && (d = h));
        }), c.splice(d, 0, u);
      }
    }
    function n() {
      return typeof console == "object" && console.log && Function.prototype.apply.call(console.log, console, arguments);
    }
    function s(c) {
      try {
        c == null ? e.storage.removeItem("debug") : e.storage.debug = c;
      } catch {
      }
    }
    function a() {
      var c;
      try {
        c = e.storage.debug;
      } catch {
      }
      return !c && typeof process < "u" && "env" in process && (c = process.env.DEBUG), c;
    }
    e.enable(a());
    function o() {
      try {
        return window.localStorage;
      } catch {
      }
    }
  }(Mn, Mn.exports)), Mn.exports;
}
var wh = vh();
const Ee = /* @__PURE__ */ xh(wh);
var Jc = /* @__PURE__ */ ((r) => (r[r.INVALID = 0] = "INVALID", r[r.ONE = 1] = "ONE", r[r.TWO = 2] = "TWO", r[r.THREE = 3] = "THREE", r[r.FOUR = 4] = "FOUR", r))(Jc || {}), S = /* @__PURE__ */ ((r) => (r[r.ONE = 1] = "ONE", r[r.TWO = 2] = "TWO", r[r.THREE = 3] = "THREE", r[r.FOUR = 4] = "FOUR", r[r.MAT4X4 = 16] = "MAT4X4", r[r.ATLAS = 99] = "ATLAS", r))(S || {});
const Eh = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  16: 16,
  99: 4
};
var _ = /* @__PURE__ */ ((r) => (r[r.ONE = 1] = "ONE", r[r.TWO = 2] = "TWO", r[r.THREE = 3] = "THREE", r[r.FOUR = 4] = "FOUR", r[r.MATRIX3 = 9] = "MATRIX3", r[r.MATRIX4 = 16] = "MATRIX4", r[r.FLOAT_ARRAY = 97] = "FLOAT_ARRAY", r[r.VEC4_ARRAY = 98] = "VEC4_ARRAY", r[r.TEXTURE = 99] = "TEXTURE", r))(_ || {}), ze = /* @__PURE__ */ ((r) => (r[r.ONE = 1] = "ONE", r[r.TWO = 2] = "TWO", r[r.THREE = 3] = "THREE", r[r.FOUR = 4] = "FOUR", r))(ze || {}), Vn = /* @__PURE__ */ ((r) => (r[r.UINT8 = 1] = "UINT8", r[r.UINT16 = 2] = "UINT16", r[r.UINT32 = 3] = "UINT32", r))(Vn || {}), _t = /* @__PURE__ */ ((r) => (r[r.SCREEN_256TH = -256] = "SCREEN_256TH", r[r.SCREEN_128TH = -128] = "SCREEN_128TH", r[r.SCREEN_64TH = -64] = "SCREEN_64TH", r[r.SCREEN_32ND = -32] = "SCREEN_32ND", r[r.SCREEN_16TH = -16] = "SCREEN_16TH", r[r.SCREEN_8TH = -8] = "SCREEN_8TH", r[r.SCREEN_QUARTER = -4] = "SCREEN_QUARTER", r[r.SCREEN_HALF = -2] = "SCREEN_HALF", r[r.SCREEN = -1] = "SCREEN", r[r._2 = 2] = "_2", r[r._4 = 4] = "_4", r[r._8 = 8] = "_8", r[r._16 = 16] = "_16", r[r._32 = 32] = "_32", r[r._64 = 64] = "_64", r[r._128 = 128] = "_128", r[r._256 = 256] = "_256", r[r._512 = 512] = "_512", r[r._1024 = 1024] = "_1024", r[r._2048 = 2048] = "_2048", r[r._4096 = 4096] = "_4096", r))(_t || {}), ce = /* @__PURE__ */ ((r) => (r[r.ATLAS = 0] = "ATLAS", r[r.FONT = 1] = "FONT", r[r.TEXTURE = 2] = "TEXTURE", r[r.COLOR_BUFFER = 3] = "COLOR_BUFFER", r))(ce || {}), ne = /* @__PURE__ */ ((r) => (r[r.zyx = 0] = "zyx", r[r.zyz = 1] = "zyz", r[r.zxy = 2] = "zxy", r[r.zxz = 3] = "zxz", r[r.yxz = 4] = "yxz", r[r.yxy = 5] = "yxy", r[r.yzx = 6] = "yzx", r[r.yzy = 7] = "yzy", r[r.xyz = 8] = "xyz", r[r.xyx = 9] = "xyx", r[r.xzy = 10] = "xzy", r[r.xzx = 11] = "xzx", r))(ne || {});
function xT(r) {
  return r.size !== void 0 && r.size <= 4;
}
function TT(r) {
  return !!(r && r.resource);
}
var A = /* @__PURE__ */ ((r) => (r[r.VERTEX = 1] = "VERTEX", r[r.FRAGMENT = 2] = "FRAGMENT", r[r.ALL = 3] = "ALL", r))(A || {});
function Oa() {
}
const bT = /\s/g, ko = /\s/, Oi = ko.test.bind(ko), yh = /\n\r|\n|\r/g, Go = /\n\r|\n|\r/, vT = Go.test.bind(Go);
function Rh(r, e) {
  return Object.assign({}, r, e);
}
var Y = /* @__PURE__ */ ((r) => (r[r.NONE = 0] = "NONE", r[r.SINGLE = 1] = "SINGLE", r))(Y || {}), be = /* @__PURE__ */ ((r) => (r[r.CHANGE = 0] = "CHANGE", r[r.INSERT = 1] = "INSERT", r[r.REMOVE = 2] = "REMOVE", r))(be || {}), el = /* @__PURE__ */ ((r) => (r[r.NO_WEBGL_CONTEXT = 0] = "NO_WEBGL_CONTEXT", r))(el || {}), ae = /* @__PURE__ */ ((r) => (r[r.UNIFORM = 1] = "UNIFORM", r[r.INSTANCE_ATTRIBUTE = 2] = "INSTANCE_ATTRIBUTE", r[r.INSTANCE_ATTRIBUTE_PACKING = 3] = "INSTANCE_ATTRIBUTE_PACKING", r[r.VERTEX_ATTRIBUTE = 4] = "VERTEX_ATTRIBUTE", r[r.VERTEX_ATTRIBUTE_PACKING = 5] = "VERTEX_ATTRIBUTE_PACKING", r))(ae || {}), ea = /* @__PURE__ */ ((r) => (r[r.LINEAR = 0] = "LINEAR", r))(ea || {});
function Rt(r) {
  return r !== void 0 && r.charCodeAt !== void 0;
}
function tl(r) {
  return r !== void 0 && r.toExponential !== void 0;
}
function wT(r) {
  return r !== void 0 && r.call !== void 0 && r.apply !== void 0;
}
function Zr(r) {
  return r === !0 || r === !1;
}
var V = /* @__PURE__ */ ((r) => (r[r.NONE = 0] = "NONE", r[r.BLANK = 1] = "BLANK", r[r.COLOR = 2] = "COLOR", r[r.DEPTH = 3] = "DEPTH", r[r.NORMAL = 4] = "NORMAL", r[r.PICKING = 5] = "PICKING", r[r.POSITION = 6] = "POSITION", r[r.POSITION_X = 7] = "POSITION_X", r[r.POSITION_Y = 8] = "POSITION_Y", r[r.POSITION_Z = 9] = "POSITION_Z", r[r.LIGHTS = 10] = "LIGHTS", r[r.LIGHTS2 = 11] = "LIGHTS2", r[r.LIGHTS3 = 12] = "LIGHTS3", r[r.ALPHA = 13] = "ALPHA", r[r.OPAQUE = 14] = "OPAQUE", r[r.BETA = 15] = "BETA", r[r.GAMMA = 16] = "GAMMA", r[r.DELTA = 17] = "DELTA", r[r.ACCUMULATION1 = 18] = "ACCUMULATION1", r[r.ACCUMULATION2 = 19] = "ACCUMULATION2", r[r.ACCUMULATION3 = 20] = "ACCUMULATION3", r[r.ACCUMULATION4 = 21] = "ACCUMULATION4", r[r.COEFFICIENT1 = 22] = "COEFFICIENT1", r[r.COEFFICIENT2 = 23] = "COEFFICIENT2", r[r.COEFFICIENT3 = 24] = "COEFFICIENT3", r[r.COEFFICIENT4 = 25] = "COEFFICIENT4", r[r.ANGLE1 = 26] = "ANGLE1", r[r.ANGLE2 = 27] = "ANGLE2", r[r.ANGLE3 = 28] = "ANGLE3", r[r.ANGLE4 = 29] = "ANGLE4", r[r.COLOR2 = 30] = "COLOR2", r[r.COLOR3 = 31] = "COLOR3", r[r.COLOR4 = 32] = "COLOR4", r[r.GLOW = 33] = "GLOW", r[r.BLUR = 34] = "BLUR", r[r.MOMENTS = 35] = "MOMENTS", r))(V || {});
function oe(r) {
  return r != null;
}
function _h(r) {
  return Array.isArray(r) ? (e) => r.indexOf(e.start.view.id) >= 0 : (e) => e.start.view.id === r;
}
function Ah(r) {
  return Array.isArray(r) ? (e) => e.start.views.find((t) => r.indexOf(t.view.id) >= 0) : (e) => e.start.views.find((t) => t.view.id === r);
}
let Mh = 1;
function P() {
  return ++Mh;
}
let Ih = 0;
function ET() {
  return ++Ih % 16777215;
}
class Et {
  /**
   * Default ctor
   */
  constructor(e) {
    this._uid = P(), this._destroyed = !1, this._internalFormat = f.RenderTarget.ColorBufferFormat.RGBA8, this.needsSettingsUpdate = !1, this._size = [0, 0], this._multiSample = 0, this.size = e.size || this.size, this.internalFormat = e.internalFormat ?? this.internalFormat, this.multiSample = e.multiSample ?? this.multiSample;
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
    this.needsSettingsUpdate = !0, this._multiSample = Math.min(N.MSAA_MAX_SAMPLES, e);
  }
  /**
   * Destroys and frees the resources this buffer utilizes in the gl context.
   * This also invalidates this as a viable resource permanently.
   */
  destroy() {
    this.gl && this.gl.proxy.disposeColorBuffer(this), this._destroyed = !0;
  }
}
class j {
  constructor(e) {
    this._uid = P(), this._destroyed = !1, this._flipY = !1, this._format = f.Texture.TexelDataType.RGBA, this._generateMipmaps = !1, this._internalFormat = f.Texture.TexelDataType.RGBA, this._magFilter = f.Texture.TextureMagFilter.Linear, this._minFilter = f.Texture.TextureMinFilter.LinearMipMapLinear, this.needsDataUpload = !1, this.needsPartialDataUpload = !1, this.needsSettingsUpdate = !1, this._packAlignment = f.Texture.PackAlignment.FOUR, this._premultiplyAlpha = !1, this._type = f.Texture.SourcePixelFormat.UnsignedByte, this._unpackAlignment = f.Texture.UnpackAlignment.FOUR, this._updateRegions = [], this._wrapHorizontal = f.Texture.Wrapping.CLAMP_TO_EDGE, this._wrapVertical = f.Texture.Wrapping.CLAMP_TO_EDGE, this.anisotropy = e.anisotropy || this.anisotropy, this.data = e.data || this.data, this.flipY = e.flipY || this.flipY, this.format = e.format || this.format, this.internalFormat = e.internalFormat || this.format, this.generateMipMaps = e.generateMipMaps || this.generateMipMaps, this.magFilter = e.magFilter || this.magFilter, this.minFilter = e.minFilter || this.minFilter, this.packAlignment = e.packAlignment || this.packAlignment, this.premultiplyAlpha = e.premultiplyAlpha || this.premultiplyAlpha, this.type = e.type || this.type, this.unpackAlignment = e.unpackAlignment || this.unpackAlignment, this.wrapHorizontal = e.wrapHorizontal || this.wrapHorizontal, this.wrapVertical = e.wrapVertical || this.wrapVertical;
  }
  /**
   * Empty texture object to help resolve ambiguous texture values.
   */
  static get emptyTexture() {
    return Sh;
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
      case f.Texture.TexelDataType.R16F:
      case f.Texture.TexelDataType.RG16F:
      case f.Texture.TexelDataType.RGB16F:
        return !0;
    }
    switch (this._type) {
      case f.Texture.SourcePixelFormat.HalfFloat:
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
      case f.Texture.TexelDataType.R11F_G11F_B10F:
      case f.Texture.TexelDataType.R16F:
      case f.Texture.TexelDataType.RG16F:
      case f.Texture.TexelDataType.R32F:
      case f.Texture.TexelDataType.RG32F:
      case f.Texture.TexelDataType.RGB16F:
      case f.Texture.TexelDataType.RGB32F:
        return !0;
    }
    switch (this._type) {
      case f.Texture.SourcePixelFormat.Float:
      case f.Texture.SourcePixelFormat.HalfFloat:
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
const Sh = new j({
  data: {
    width: 2,
    height: 2,
    buffer: new Uint8Array(16)
  }
}), Zt = Ee("performance");
function zo(r) {
  return r && r.buffer && r.buffer.byteOffset !== void 0 && r.buffer.byteLength || r.buffer === null;
}
function Ri(r) {
  return (r & r - 1) === 0;
}
function Jr(r) {
  return !!(r.gl && r.gl.textureId && r.gl.textureUnit > -1);
}
class Jn {
  constructor(e, t, i) {
    this.debugContext = "", this.fragmentShaders = /* @__PURE__ */ new Map(), this.vertexShaders = /* @__PURE__ */ new Map(), this.programs = /* @__PURE__ */ new Map(), this.gl = e, this.state = t, this.extensions = i;
  }
  /**
   * This enables the desired and supported extensions this framework utilizes.
   */
  static addExtensions(e) {
    const t = e.getExtension("ANGLE_instanced_arrays"), i = e.getExtension("WEBGL_draw_buffers"), n = e.getExtension("OES_texture_float"), s = e.getExtension("OES_texture_float_linear"), a = e.getExtension("OES_texture_half_float"), o = e.getExtension(
      "OES_texture_half_float_linear"
    ), c = e.getExtension(
      "EXT_texture_filter_anisotropic"
    ), l = e.getExtension("EXT_color_buffer_float"), u = e.getExtension("OES_vertex_array_object"), h = e.getExtension("EXT_color_buffer_float"), d = e.getExtension(
      "EXT_color_buffer_half_float"
    ), p = {
      maxAnistropicFilter: 0
    };
    return !t && !(e instanceof WebGL2RenderingContext) && Zt(
      "This device does not have hardware instancing. All buffering strategies will be utilizing compatibility modes."
    ), !i && !(e instanceof WebGL2RenderingContext) && Zt(
      "This device does not have hardware multi-render target capabilities. The system will have to fallback to multiple render passes to multiple FBOs to achieve the same result."
    ), c ? p.maxAnistropicFilter = e.getParameter(
      c.MAX_TEXTURE_MAX_ANISOTROPY_EXT
    ) : Zt(
      "This device does not have hardware anisotropic filtering for textures. This property will be ignored when setting texture settings."
    ), !u && !(e instanceof WebGL2RenderingContext) && Zt(
      "This device does not support Vertex Array Objects. This could cause performance issues for high numbers of draw calls."
    ), {
      instancing: (e instanceof WebGL2RenderingContext ? e : t) ?? void 0,
      drawBuffers: (e instanceof WebGL2RenderingContext ? e : i) ?? void 0,
      anisotropicFiltering: c ? {
        ext: c,
        stat: p
      } : void 0,
      renderFloatTexture: l ?? void 0,
      floatTex: (e instanceof WebGL2RenderingContext ? e : n) ?? void 0,
      floatTexFilterLinear: (e instanceof WebGL2RenderingContext ? e : s) ?? void 0,
      halfFloatTex: (e instanceof WebGL2RenderingContext ? e : a) ?? void 0,
      halfFloatTexFilterLinear: (e instanceof WebGL2RenderingContext ? e : o) ?? void 0,
      vao: (e instanceof WebGL2RenderingContext ? e : u) ?? void 0,
      floatRenderTarget: h ?? void 0,
      halfFloatRenderTarget: d ?? void 0
    };
  }
  /**
   * Clears the specified buffers
   */
  clear(e, t, i) {
    let n = 0;
    e && (n = n | this.gl.COLOR_BUFFER_BIT), t && (n = n | this.gl.DEPTH_BUFFER_BIT), i && (n = n | this.gl.STENCIL_BUFFER_BIT), this.gl.clear(n);
  }
  /**
   * Takes an Attribute object and ensures it's buffer is created and
   * initialized.
   */
  compileAttribute(e) {
    if (e.gl) return !0;
    const t = this.gl, i = t.createBuffer();
    return i ? (this.state.bindVBO(i), t.bufferData(
      t.ARRAY_BUFFER,
      e.data,
      e.isDynamic ? t.DYNAMIC_DRAW : t.STATIC_DRAW
    ), e.gl = {
      bufferId: i,
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
    const t = this.gl, i = t.createBuffer();
    if (!i) {
      console.warn(
        this.debugContext,
        "Could not create WebGLBuffer. Printing any existing gl errors:"
      ), this.printError();
      return;
    }
    return this.state.bindElementArrayBuffer(i), t.bufferData(
      t.ELEMENT_ARRAY_BUFFER,
      e.data,
      e.isDynamic ? t.DYNAMIC_DRAW : t.STATIC_DRAW
    ), e.gl = {
      bufferId: i,
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
      let i;
      this.extensions.vao instanceof WebGL2RenderingContext ? i = this.extensions.vao.createVertexArray() : i = this.extensions.vao.createVertexArrayOES(), i ? (this.state.disableVertexAttributeArray(), this.state.bindVAO(i), e.attributes.forEach((n, s) => {
        this.updateAttribute(n) && this.useAttribute(s, n, e);
      }), e.indexBuffer && this.updateIndexBuffer(e.indexBuffer) && this.useIndexBuffer(e.indexBuffer), e.gl.vao = i, this.state.bindVAO(null)) : Zt(
        "WARNING: Could not make VAO for Geometry. This is fine, but this could cause a hit on performance."
      );
    } else
      e.attributes.forEach((i) => {
        t = !!(this.compileAttribute(i) && t);
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
    let i = this.programs.get(t);
    i || (i = /* @__PURE__ */ new Map(), this.programs.set(t, i));
    const n = {
      vsId: t,
      fsId: [],
      programId: [],
      proxy: this,
      programByTarget: /* @__PURE__ */ new WeakMap(),
      outputsByProgram: /* @__PURE__ */ new WeakMap()
    }, s = /* @__PURE__ */ new Set();
    if (!e.fragmentShader)
      return console.warn(
        "A material appears to not have it's fragment shader configuration set."
      ), !1;
    e.fragmentShader.forEach((o) => {
      var d, p;
      if (!i || !t) return;
      let c = this.fragmentShaders.get(o.source) || null;
      if (!c) {
        if (c = this.gl.createShader(this.gl.FRAGMENT_SHADER), !c) {
          console.warn(
            this.debugContext,
            "Could not create a Fragment WebGLShader. Printing GL Errors:"
          ), this.printError();
          return;
        }
        if (this.gl.shaderSource(c, o.source), this.gl.compileShader(c), this.gl.isContextLost() && console.warn("Context was lost during compilation"), !this.gl.getShaderParameter(c, this.gl.COMPILE_STATUS)) {
          console.error(
            this.debugContext,
            "FRAGMENT SHADER COMPILER ERROR:",
            e.name
          ), console.warn(
            "Could not compile provided shader. Printing logs and errors:"
          ), console.warn(this.lineFormatShader(o.source)), console.warn("LOGS:"), console.warn(this.gl.getShaderInfoLog(c)), this.printError(), this.gl.deleteShader(c);
          return;
        }
      }
      let l = i.get(c) || null;
      if (l)
        l.useCount++;
      else {
        const g = this.gl.createProgram();
        if (!g) {
          console.warn(
            this.debugContext,
            "Could not create a WebGLProgram. Printing GL Errors:"
          ), this.printError();
          return;
        }
        if (l = {
          useCount: 1,
          program: g
        }, this.gl.attachShader(g, t), this.gl.attachShader(g, c), this.gl.linkProgram(g), this.gl.validateProgram(g), !this.gl.getProgramParameter(g, this.gl.LINK_STATUS) || !this.gl.getProgramParameter(g, this.gl.VALIDATE_STATUS)) {
          const m = this.gl.getProgramInfoLog(g);
          console.warn(
            this.debugContext,
            `Could not compile WebGL program. 

`,
            m
          ), this.printError(), this.gl.deleteProgram(g);
          return;
        }
        i.set(c, l);
      }
      (d = n.fsId) == null || d.push({
        id: c,
        outputTypes: o.outputTypes
      }), (p = n.programId) == null || p.push({
        id: l.program,
        outputTypes: o.outputTypes
      }), n.outputsByProgram.set(
        l.program,
        o.outputTypes
      ), this.state.useProgram(l.program);
      const u = this.state.currentProgram;
      if (!u) return !1;
      const h = this.gl.getProgramParameter(
        u,
        this.gl.ACTIVE_UNIFORMS
      );
      for (let g = 0; g < h; g++) {
        const m = this.gl.getActiveUniform(u, g);
        m && s.add(m.name.replace("[0]", ""));
      }
    }), e.gl = n;
    const a = /* @__PURE__ */ new Set();
    return Object.keys(e.uniforms).forEach((o) => {
      s.has(o) || a.add(o);
    }), a.forEach((o) => {
      delete e.uniforms[o];
    }), Object.keys(e.uniforms).length !== s.size ? (console.warn(
      this.debugContext,
      "A program is requesting a set of uniforms:",
      Array.from(s.values()),
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
    const t = this.gl, i = t.createFramebuffer();
    if (!i)
      return console.warn(
        this.debugContext,
        "Could not generate a frame buffer object. Printing GL errors:"
      ), this.printError(), !1;
    this.state.bindFBO(i);
    const n = {
      fboId: i,
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
      if (e.buffers.color.forEach((p, g) => {
        var m;
        if (h)
          if (p.buffer instanceof j) {
            const T = An(
              t,
              this.extensions,
              g,
              d,
              !1
            );
            u.push({
              data: p.buffer,
              outputType: p.outputType,
              attachment: T
            }), n.outputTypeToAttachment.set(
              p.outputType,
              T
            ), Jr(p.buffer) ? t.framebufferTexture2D(
              t.FRAMEBUFFER,
              T,
              t.TEXTURE_2D,
              p.buffer.gl.textureId,
              0
            ) : (console.warn(
              this.debugContext,
              "Attempted to compile render target whose target texture was not ready for use."
            ), h = !1);
          } else {
            const T = ((m = p.buffer.gl) == null ? void 0 : m.bufferId) ?? this.compileColorBuffer(
              p.buffer,
              e.width,
              e.height,
              p.buffer.multiSample
            );
            if (T) {
              const x = An(
                t,
                this.extensions,
                g,
                d,
                !1
              );
              u.push({
                data: T,
                outputType: p.outputType,
                attachment: x
              }), n.outputTypeToAttachment.set(
                p.outputType,
                x
              ), t.framebufferRenderbuffer(
                t.FRAMEBUFFER,
                x,
                t.RENDERBUFFER,
                T
              );
            }
          }
      }), !h)
        return !1;
    } else if (e.buffers.color !== void 0) {
      const u = e.buffers.color;
      if (u.buffer instanceof j) {
        const h = An(
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
        ), Jr(u.buffer))
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
          const d = An(
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
      if (u instanceof j)
        n.depthBufferId = u, Jr(u) && t.framebufferTexture2D(
          t.FRAMEBUFFER,
          t.DEPTH_ATTACHMENT,
          t.TEXTURE_2D,
          u.gl.textureId,
          0
        );
      else if (u instanceof Et) {
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
      if (u instanceof j)
        n.stencilBufferId = u, Jr(u) && t.framebufferTexture2D(
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
    const s = t.checkFramebufferStatus(t.FRAMEBUFFER);
    let a = !1, o = !1, c = "";
    switch (s) {
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
        a = !0;
        break;
    }
    if (t instanceof WebGL2RenderingContext)
      switch (s) {
        case t.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE:
          c = "FRAMEBUFFER_INCOMPLETE_MULTISAMPLE";
          break;
        case t.RENDERBUFFER_SAMPLES:
          c = "RENDERBUFFER_SAMPLES";
          break;
        default:
          o = !0;
          break;
      }
    return a && o && (console.warn(
      this.debugContext,
      "A framebuffer check failed to return a known result. This FBO for render target will be assumed failed"
    ), console.warn("Result:", s, "Render Target:", e), c = "UNKNOWN"), c ? (console.warn(
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
    var s, a, o, c, l;
    const t = this.gl;
    if (!e.buffers.blit || !e.gl || (s = e.gl) != null && s.blitFboId) return;
    const i = t.createFramebuffer(), n = e.gl.outputTypeToAttachment;
    if (!i) {
      console.warn(this.debugContext, "Could not create blit FBO");
      return;
    }
    if (this.state.bindFBO(i), (a = e.buffers.blit) != null && a.color)
      if (Array.isArray(e.buffers.blit.color))
        e.buffers.blit.color.forEach((u) => {
          const h = n.get(u.outputType);
          if (h === void 0) {
            console.warn(
              "A blit output could not be mapped to an attachment point."
            );
            return;
          }
          if (u.buffer instanceof j)
            if (Jr(u.buffer))
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
        if (u.buffer instanceof j)
          if (Jr(u.buffer))
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
    if ((o = e.buffers.blit) != null && o.depth)
      if (e.buffers.blit.depth instanceof j)
        if (Jr(e.buffers.blit.depth))
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
    return (c = e.gl) != null && c.fboId && this.state.bindFBO((l = e.gl) == null ? void 0 : l.fboId), e.gl.blitFboId = i, !0;
  }
  /**
   * Produces a render buffer object intended for a render target for the depth buffer attachment
   */
  compileDepthBuffer(e, t, i, n) {
    var c;
    let s;
    if (e instanceof Et) {
      if ((c = e.gl) != null && c.bufferId)
        return e.gl.bufferId;
      s = e.internalFormat;
    } else
      s = e;
    const a = this.gl, o = a.createRenderbuffer();
    if (!o) {
      console.warn(
        this.debugContext,
        "Could not generate a WebGLRenderBuffer. Printing GL Errors:"
      ), this.printError();
      return;
    }
    return this.state.bindRBO(o), a instanceof WebGL2RenderingContext && n > 0 ? a.renderbufferStorageMultisample(
      a.RENDERBUFFER,
      n,
      Lo(a, s),
      t,
      i
    ) : a.renderbufferStorage(
      a.RENDERBUFFER,
      Lo(a, s),
      t,
      i
    ), e instanceof Et && (e.gl = {
      bufferId: o,
      proxy: this
    }), o;
  }
  /**
   * Produces a render buffer object intended for a render target for the stencil buffer attachment
   */
  compileStencilBuffer(e, t, i) {
    const n = this.gl, s = n.createRenderbuffer();
    if (!s) {
      console.warn(
        this.debugContext,
        "Could not generate a WebGLRenderBuffer. Printing GL Errors:"
      ), this.printError();
      return;
    }
    return this.state.bindRBO(s), n.renderbufferStorage(
      n.RENDERBUFFER,
      gh(n, e),
      t,
      i
    ), s;
  }
  /**
   * Produces a render buffer object intended for a render target for the color
   * buffer attachment
   */
  compileColorBuffer(e, t, i, n) {
    const s = this.gl, a = s.createRenderbuffer();
    if (!a) {
      console.warn(
        this.debugContext,
        "Could not generate a WebGLRenderBuffer. Printing GL Errors:"
      ), this.printError();
      return;
    }
    return this.state.bindRBO(a), s instanceof WebGL2RenderingContext && n > 0 ? s.renderbufferStorageMultisample(
      s.RENDERBUFFER,
      e.multiSample,
      Oo(s, e.internalFormat),
      t,
      i
    ) : s.renderbufferStorage(
      s.RENDERBUFFER,
      Oo(s, e.internalFormat),
      t,
      i
    ), e.gl = {
      bufferId: a,
      proxy: this
    }, a;
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
    const i = this.gl.createTexture();
    if (!i) {
      console.warn(
        this.debugContext,
        "Could not generate a texture object on the GPU. Printing any gl errors:"
      ), this.printError();
      return;
    }
    return e.gl.textureId = i, e.needsDataUpload = !0, e.needsSettingsUpdate = !0, this.updateTextureData(e), this.updateTextureSettings(e), !0;
  }
  /**
   * Executes the draw operation for a given model
   */
  draw(e) {
    var n, s, a;
    let t, i = [0, 0];
    e.vertexDrawRange && e.vertexDrawRange[0] >= 0 && e.vertexDrawRange[1] >= 0 ? i = [
      e.vertexDrawRange[0],
      e.vertexDrawRange[1] - e.vertexDrawRange[0]
    ] : i = [0, e.vertexCount], e.drawInstances >= 0 && e.geometry.isInstanced && (t = this.extensions.instancing), !((N.MRT || N.MRT_EXTENSION) && this.state.renderTarget && !this.state.renderTarget.buffers.depth && !this.state.drawBuffers.find((o) => o !== this.gl.NONE)) && (t && t instanceof WebGL2RenderingContext ? e.geometry.indexBuffer ? t.drawElementsInstanced(
      wi(this.gl, e.drawMode),
      i[1],
      ((n = e.geometry.indexBuffer.gl) == null ? void 0 : n.indexType) ?? this.gl.UNSIGNED_INT,
      0,
      e.drawInstances
    ) : t.drawArraysInstanced(
      wi(this.gl, e.drawMode),
      i[0],
      i[1],
      e.drawInstances
    ) : t ? e.geometry.indexBuffer ? t.drawElementsInstancedANGLE(
      wi(this.gl, e.drawMode),
      i[1],
      ((s = e.geometry.indexBuffer.gl) == null ? void 0 : s.indexType) ?? this.gl.UNSIGNED_INT,
      0,
      e.drawInstances
    ) : t.drawArraysInstancedANGLE(
      wi(this.gl, e.drawMode),
      i[0],
      i[1],
      e.drawInstances
    ) : e.geometry.indexBuffer ? this.gl.drawElements(
      wi(this.gl, e.drawMode),
      i[1],
      ((a = e.geometry.indexBuffer.gl) == null ? void 0 : a.indexType) ?? this.gl.UNSIGNED_INT,
      0
    ) : this.gl.drawArrays(
      wi(this.gl, e.drawMode),
      i[0],
      i[1]
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
      const { vsId: t, fsId: i, programId: n } = e.gl;
      let s = this.programs.get(t);
      s || (s = /* @__PURE__ */ new Map(), this.gl.deleteShader(t));
      for (let a = 0, o = i.length; a < o; ++a) {
        const c = i[a];
        let l = s.get(c.id);
        l || (l = {
          useCount: 0,
          program: n[a].id
        }), l.useCount--, l.useCount < 1 && (this.gl.deleteProgram(l.program), s.delete(c.id), s.size <= 0 && this.gl.deleteShader(t));
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
        t.data instanceof j && !e.retainTextureTargets ? this.disposeTexture(t.data) : t.data instanceof WebGLRenderbuffer && this.disposeRenderBuffer(t.data);
      }) : e.gl.colorBufferId && e.gl.colorBufferId.data instanceof j && !e.retainTextureTargets ? this.disposeTexture(e.gl.colorBufferId.data) : e.gl.colorBufferId instanceof WebGLRenderbuffer && this.disposeRenderBuffer(e.gl.colorBufferId.data), e.gl.depthBufferId instanceof j && !e.retainTextureTargets ? this.disposeTexture(e.gl.depthBufferId) : e.gl.depthBufferId instanceof WebGLRenderbuffer && this.disposeRenderBuffer(e.gl.depthBufferId), e.gl.stencilBufferId instanceof j && !e.retainTextureTargets ? this.disposeTexture(e.gl.stencilBufferId) : e.gl.stencilBufferId instanceof WebGLRenderbuffer && this.disposeRenderBuffer(e.gl.stencilBufferId), e.buffers.blit && !e.retainTextureTargets) {
        if (e.buffers.blit.color)
          if (Array.isArray(e.buffers.blit.color))
            e.buffers.blit.color.forEach((t) => {
              t.buffer instanceof j ? this.disposeTexture(t.buffer) : t.buffer instanceof WebGLRenderbuffer && this.disposeRenderBuffer(t.buffer);
            });
          else {
            const t = e.buffers.blit.color;
            t.buffer instanceof j ? this.disposeTexture(t.buffer) : t.buffer instanceof WebGLRenderbuffer && this.disposeRenderBuffer(t.buffer);
          }
        e.buffers.blit.depth && e.buffers.blit.depth instanceof j && this.disposeTexture(e.buffers.blit.depth);
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
    const i = [
      N.WEBGL_VERSION,
      "webgl",
      "webgl2",
      "experimental-webgl"
    ];
    let n = null, s = {};
    for (let a = 0; a < i.length; ++a) {
      const o = i[a], c = e.getContext(o, t);
      if (c && (c instanceof WebGLRenderingContext || c instanceof WebGL2RenderingContext)) {
        Zt(
          "Generated GL Context of version with attributes:",
          o,
          t
        ), n = c, s = Jn.addExtensions(n);
        break;
      }
    }
    return {
      context: n,
      extensions: s
    };
  }
  /**
   * This decodes and prints any webgl context error in a  human readable manner.
   */
  printError(e = !1) {
    const t = this.gl.getError();
    switch (t) {
      case this.gl.NO_ERROR:
        return e || console.warn("GL Error: No Error"), !1;
      case this.gl.INVALID_ENUM:
        return console.warn("GL Error: INVALID ENUM"), !0;
      case this.gl.INVALID_VALUE:
        return console.warn("GL Error: INVALID_VALUE"), !0;
      case this.gl.INVALID_OPERATION:
        return console.warn("GL Error: INVALID OPERATION"), !0;
      case this.gl.INVALID_FRAMEBUFFER_OPERATION:
        return console.warn("GL Error: INVALID FRAMEBUFFER OPERATION"), !0;
      case this.gl.OUT_OF_MEMORY:
        return console.warn("GL Error: OUT OF MEMORY"), !0;
      case this.gl.CONTEXT_LOST_WEBGL:
        return console.warn("GL Error: CONTEXT LOST WEBGL"), !0;
      default:
        return console.warn(
          "GL Error: GL Context output an unrecognized error value:",
          t
        ), !0;
    }
  }
  /**
   * Breaks down a string into a multiline structure. Helps pretty print some
   * items.
   */
  lineFormat(e) {
    const t = e.split(`
`), i = String(t.length).length + 1;
    return `
${t.map(
      (n, s) => `${Array(i - String(s + 1).length).join(" ")}${s + 1}: ${n}`
    ).join(`
`)}`;
  }
  /**
   * Prints a shader broken down by lines
   */
  lineFormatShader(e) {
    return e ? Rt(e) ? this.lineFormat(e) : e.forEach(
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
      f.Texture.TextureBindingTarget.TEXTURE_2D
    ), e.needsSettingsUpdate = !0, this.updateTextureSettings(e), t instanceof WebGLRenderingContext || t instanceof WebGL2RenderingContext) {
      if (zo(e.data)) {
        (!Ri(e.data.width) || !Ri(e.data.height)) && Zt("Created a texture that is not using power of 2 dimensions.");
        const i = Ei(t, e.internalFormat), n = Ei(t, e.format);
        t instanceof WebGLRenderingContext && i !== n && console.warn(
          "WebGL 1 requires format and data format to be identical"
        ), t.texImage2D(
          t.TEXTURE_2D,
          0,
          i,
          e.data.width,
          e.data.height,
          0,
          n,
          _n(t, e.type),
          e.data.buffer
        ), this.printError(!0) && console.error("Failed texImage2D", {
          internalFormat: f.Texture.TexelDataType[e.internalFormat],
          format: f.Texture.TexelDataType[e.format],
          type: f.Texture.SourcePixelFormat[e.type],
          generateMipMaps: e.generateMipMaps,
          minFilter: f.Texture.TextureMinFilter[e.minFilter],
          magFilter: f.Texture.TextureMagFilter[e.magFilter],
          wrapHorizontal: f.Texture.Wrapping[e.wrapHorizontal],
          wrapVertical: f.Texture.Wrapping[e.wrapVertical]
        });
      } else e.data && ((!Ri(e.data.width) || !Ri(e.data.height)) && Zt(
        "Created a texture that is not using power of 2 dimensions. %o",
        e
      ), t.texImage2D(
        t.TEXTURE_2D,
        0,
        Ei(t, e.internalFormat),
        Ei(t, e.format),
        _n(t, e.type),
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
      f.Texture.TextureBindingTarget.TEXTURE_2D
    ), e.updateRegions.forEach((i) => {
      const n = i[0], s = i[1];
      (t instanceof WebGLRenderingContext || t instanceof WebGL2RenderingContext) && (zo(n) ? t.texSubImage2D(
        t.TEXTURE_2D,
        0,
        s.x,
        s.y,
        n.width,
        n.height,
        Ei(t, e.format),
        _n(t, e.type),
        n.buffer
      ) : n && t.texSubImage2D(
        t.TEXTURE_2D,
        0,
        s.x,
        s.y,
        Ei(t, e.format),
        _n(t, e.type),
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
    const t = Ri(e.data.width) && Ri(e.data.height), i = this.gl;
    this.state.setActiveTextureUnit(e.gl.textureUnit), this.state.bindTexture(
      e,
      f.Texture.TextureBindingTarget.TEXTURE_2D
    );
    let n, s;
    if (e.isHalfFloatTexture)
      if (N.FLOAT_TEXTURE_READ.halfLinearFilter)
        switch (n = yi(i, e.magFilter), e.minFilter) {
          case f.Texture.TextureMinFilter.Nearest:
          case f.Texture.TextureMinFilter.NearestMipMapLinear:
          case f.Texture.TextureMinFilter.NearestMipMapNearest:
            s = Lr(
              i,
              f.Texture.TextureMinFilter.Nearest,
              e.generateMipMaps
            );
            break;
          case f.Texture.TextureMinFilter.Linear:
          case f.Texture.TextureMinFilter.LinearMipMapLinear:
          case f.Texture.TextureMinFilter.LinearMipMapNearest:
            s = Lr(
              i,
              f.Texture.TextureMinFilter.Nearest,
              e.generateMipMaps
            );
            break;
        }
      else
        n = yi(
          i,
          f.Texture.TextureMagFilter.Nearest
        ), s = Lr(
          i,
          f.Texture.TextureMinFilter.Nearest,
          e.generateMipMaps
        );
    else if (e.isFloatTexture)
      if (N.FLOAT_TEXTURE_READ.fullLinearFilter)
        switch (n = yi(i, e.magFilter), e.minFilter) {
          case f.Texture.TextureMinFilter.Nearest:
          case f.Texture.TextureMinFilter.NearestMipMapLinear:
          case f.Texture.TextureMinFilter.NearestMipMapNearest:
            s = Lr(
              i,
              f.Texture.TextureMinFilter.Nearest,
              e.generateMipMaps
            );
            break;
          case f.Texture.TextureMinFilter.Linear:
          case f.Texture.TextureMinFilter.LinearMipMapLinear:
          case f.Texture.TextureMinFilter.LinearMipMapNearest:
            s = Lr(
              i,
              f.Texture.TextureMinFilter.Nearest,
              e.generateMipMaps
            );
            break;
        }
      else
        n = yi(
          i,
          f.Texture.TextureMagFilter.Nearest
        ), s = Lr(
          i,
          f.Texture.TextureMinFilter.Nearest,
          e.generateMipMaps
        );
    else !t && i instanceof WebGLRenderingContext ? (n = yi(i, f.Texture.TextureMagFilter.Linear), s = Lr(
      i,
      f.Texture.TextureMinFilter.Linear,
      e.generateMipMaps
    )) : (n = yi(i, e.magFilter), s = Lr(i, e.minFilter, e.generateMipMaps));
    if (i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MAG_FILTER, n), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MIN_FILTER, s), e.isFloatTexture || (i.texParameteri(
      i.TEXTURE_2D,
      i.TEXTURE_WRAP_S,
      Fo(i, e.wrapHorizontal)
    ), i.texParameteri(
      i.TEXTURE_2D,
      i.TEXTURE_WRAP_T,
      Fo(i, e.wrapVertical)
    )), e.isFloatTexture || (i.pixelStorei(
      i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,
      e.premultiplyAlpha
    ), i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, e.flipY)), this.extensions.anisotropicFiltering) {
      const { ext: a, stat: o } = this.extensions.anisotropicFiltering, c = Math.min(
        o.maxAnistropicFilter,
        Math.floor(e.anisotropy || 0)
      );
      !isNaN(c) && !e.isFloatTexture && c >= 1 && i.texParameterf(
        i.TEXTURE_2D,
        a.TEXTURE_MAX_ANISOTROPY_EXT,
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
      const i = e.updateRange.offset;
      t.bufferSubData(
        t.ARRAY_BUFFER,
        // We start at the element index. We specify the offset in BYTES hence
        // the * 4 since attributes are always specified as Float32Arrays
        i * 4,
        e.data.subarray(i, i + e.updateRange.count)
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
      const i = e.updateRange.offset;
      t.bufferSubData(
        t.ELEMENT_ARRAY_BUFFER,
        i * e.data.constructor.BYTES_PER_ELEMENT,
        e.data.subarray(i, i + e.updateRange.count)
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
  useAttribute(e, t, i) {
    if (!this.state.currentProgram || !t.gl) return !1;
    t.gl.locations = t.gl.locations || /* @__PURE__ */ new Map();
    let n = t.gl.locations.get(this.state.currentProgram);
    if (n === void 0 && (n = this.gl.getAttribLocation(this.state.currentProgram, e), n === -1 && Zt(
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
          ), i.isInstanced && t.isInstanced && this.extensions.instancing ? this.state.setVertexAttributeArrayDivisor(n, 1) : this.state.setVertexAttributeArrayDivisor(n, 0);
          break;
        // For sizes that exceed a single 'block' for a vertex attribute, one must
        // break up the attribute pointers as the max allowed size is 4 at a time.
        default: {
          const s = Math.ceil(t.size / 4);
          for (let a = 0; a < s; ++a)
            this.state.willUseVertexAttributeArray(n + a), this.gl.vertexAttribPointer(
              n + a,
              4,
              this.gl.FLOAT,
              t.normalize,
              s * 4 * 4,
              a * 16
            ), i.isInstanced && t.isInstanced && this.extensions.instancing ? this.state.setVertexAttributeArrayDivisor(n + a, 1) : this.state.setVertexAttributeArrayDivisor(n + a, 0);
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
    var t, i;
    if (this.gl instanceof WebGL2RenderingContext && e.gl) {
      const n = e.gl.outputTypeToAttachment, s = e.gl.fboId, a = e.gl.blitFboId;
      if (!s || !a) return;
      const o = (t = e.buffers.blit) == null ? void 0 : t.color;
      let c = [];
      if (!o) return;
      Array.isArray(o) ? c = o : c = [o], this.state.bindFBOTargets(s, a);
      const l = c.map((u) => n.get(u.outputType)).filter(oe);
      for (let u = 0; u < c.length; u++) {
        const h = c[u], d = n.get(h.outputType);
        if (d) {
          const p = l.slice(0).map((g) => g === d ? d : this.gl.NONE);
          this.gl.readBuffer(d), this.state.setDrawBuffers(p), this.gl.blitFramebuffer(
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
      (i = e.buffers.blit) != null && i.depth && this.gl.blitFramebuffer(
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
const { sqrt: La, max: Gt, min: zt, floor: Vt, ceil: $t, abs: Wt, acos: Ch, sin: Bs } = Math, He = new Array(20).fill(0).map((r) => [0, 0, 0]), Nh = new Array(20).fill(0).map((r) => [0, 0, 0, 0]);
function Oh(r) {
  return r && Array.isArray(r) && r.length === 1;
}
function rl(r) {
  return r && Array.isArray(r) && r.length === 2;
}
function Lh(r) {
  return r && Array.isArray(r) && r.length === 3;
}
function G(r) {
  return r && Array.isArray(r) && r.length === 4;
}
function $e(r, e) {
  return r = r || [], r[0] = e, r;
}
function Fa(r, e, t) {
  return $e(t, r[0] + e[0]);
}
function il(r, e) {
  return $e(e, $t(r[0]));
}
function nl(r, e) {
  return r[0] === e[0];
}
function Fh(r, e, t) {
  return Wt(r[0] - e[0]) <= t;
}
function sl(r, e) {
  return $e(e, r[0]);
}
function al() {
  return [0];
}
function ol(r, e, t) {
  return $e(t, 0);
}
function cl(r, e, t) {
  return $e(t, r[0] / e[0]);
}
function ll(r) {
  return $e(r, 0);
}
function ul(r, e) {
  e = e || [];
  for (let t = 0, i = r.length; t < i; ++t)
    e.push(r[t][0]);
  return e;
}
function hl(r, e) {
  return $e(e, Vt(r[0]));
}
function dl(r, e) {
  return $e(e, 1 / r[0]);
}
function Ba(r, e, t) {
  return $e(t, r[0] * e);
}
function Pa(r, e, t) {
  return $e(t, r[0] - e[0]);
}
function fl(r, e, t) {
  return $e(t, Gt(r[0], e[0]));
}
function pl(r, e, t) {
  return $e(t, zt(r[0], e[0]));
}
function gl(r, e, t) {
  return $e(t, r[0] * e[0]);
}
function ml(r, e) {
  return $e(e, 1);
}
function xl(r, e) {
  return r[0] * e[0];
}
function Bh(r, e) {
  return r[0] * e[0];
}
function Tl(r, e, t, i) {
  return Fa(Ba(Pa(e, r), t), r, i);
}
function bl(r) {
  return r[0];
}
function Ph(r) {
  return r;
}
function vl(r, ...e) {
  let t;
  if (e = e || [], Array.isArray(r) ? t = r.slice(0, 1) : t = [r], t.length < 1)
    for (let i = 0, n = e.length; i < n && t.length < 1; ++i) {
      const s = e[i];
      Array.isArray(s) ? t.push(...s.slice(0, 1 - t.length)) : t.push(s);
    }
  for (; t.length < 1; ) t.push(0);
  return t;
}
function he(r, e, t) {
  return r = r || new Array(2), r[0] = e, r[1] = t, r;
}
function Wr(r, e, t) {
  return he(t, r[0] + e[0], r[1] + e[1]);
}
function wl(r, e) {
  return he(e, $t(r[0]), $t(r[1]));
}
function Da(r, e) {
  return he(e, r[0], r[1]);
}
function El(r) {
  return he(r, 1, 0);
}
function yl(r, e, t) {
  return he(t, 0, 0);
}
function Ua(r, e) {
  return r[0] === e[0] && r[1] === e[1];
}
function Dh(r, e, t) {
  return Wt(r[0] - e[0]) <= t && Wt(r[1] - e[1]) <= t;
}
function ms(r, e, t) {
  return he(t, r[0] / e[0], r[1] / e[1]);
}
function Rl(r) {
  return he(r, 0, 0);
}
function _l(r, e) {
  e = e || new Array(r.length * 2);
  for (let t = 0, i = 0, n = r.length; t < n; ++t, i += 2) {
    const s = r[t];
    e[i] = s[0], e[i + 1] = s[1];
  }
  return e;
}
function Al(r, e) {
  return he(e, Vt(r[0]), Vt(r[1]));
}
function ka(r, e) {
  return he(e, 1 / r[0], 1 / r[1]);
}
function Ml(r, e, t) {
  return he(t, Gt(r[0], e[0]), Gt(r[1], e[1]));
}
function Il(r, e, t) {
  return he(t, zt(r[0], e[0]), zt(r[1], e[1]));
}
function Ie(r, e, t) {
  return he(t, r[0] * e, r[1] * e);
}
function Re(r, e, t) {
  const i = t || new Array(2);
  return i[0] = r[0] - e[0], i[1] = r[1] - e[1], i;
}
function Sl(r, e, t) {
  return he(t, r[0] * e[0], r[1] * e[1]);
}
function Cl(r, e) {
  const t = gi(r);
  return he(e, r[0] / t, r[1] / t);
}
function gn(r, e) {
  return r[0] * e[0] + r[1] * e[1];
}
function Uh(r, e) {
  return r[0] * e[0] - r[1] * e[1];
}
function kh(r, e) {
  return r[0] * e[1] - r[1] * e[0];
}
function Gh(r, e) {
  return he(e, r[1], r[0]);
}
function Nl(r, e, t, i) {
  return Wr(Ie(Re(e, r), t), r, i);
}
function gi(r) {
  return Ol(r[0], r[1]);
}
function Ol(r, e) {
  return La(r * r + e * e);
}
function Ga(r, ...e) {
  let t;
  if (e = e || [], Array.isArray(r) ? t = r.slice(0, 2) : t = [r], t.length < 2)
    for (let i = 0, n = e.length; i < n && t.length < 2; ++i) {
      const s = e[i];
      Array.isArray(s) ? t.push(...s.slice(0, 2 - t.length)) : t.push(s);
    }
  for (; t.length < 2; ) t.push(0);
  return t;
}
function me(r, e, t, i) {
  return r = r || new Array(3), r[0] = e, r[1] = t, r[2] = i, r;
}
function Ke(r, e, t) {
  return me(
    t,
    r[0] + e[0],
    r[1] + e[1],
    r[2] + e[2]
  );
}
function Ll(r, e) {
  return me(e, $t(r[0]), $t(r[1]), $t(r[2]));
}
function Tt(r, e) {
  return me(e, r[0], r[1], r[2]);
}
function es(r, e) {
  return r[0] === e[0] && r[1] === e[1] && r[2] === e[2];
}
function zh(r, e, t) {
  return Wt(r[0] - e[0]) <= t && Wt(r[1] - e[1]) <= t && Wt(r[2] - e[2]) <= t;
}
function Pi(r) {
  return me(r, 0, 0, -1);
}
function Ze(r, e, t) {
  return t = t || new Array(3), t[0] = r[1] * e[2] - r[2] * e[1], t[1] = r[2] * e[0] - r[0] * e[2], t[2] = r[0] * e[1] - r[1] * e[0], t;
}
function xs(r, e, t) {
  return me(
    t,
    r[0] / e[0],
    r[1] / e[1],
    r[2] / e[2]
  );
}
function Fl(r) {
  return me(r, 0, 0, 0);
}
function Bl(r, e) {
  e = e || new Array(r.length * 3);
  for (let t = 0, i = 0, n = r.length; t < n; ++t, i += 3) {
    const s = r[t];
    e[i] = s[0], e[i + 1] = s[1], e[i + 2] = s[2];
  }
  return e;
}
function Pl(r, e) {
  return me(e, Vt(r[0]), Vt(r[1]), Vt(r[2]));
}
function an(r, e) {
  return me(e, 1 / r[0], 1 / r[1], 1 / r[2]);
}
function Pe(r, e, t) {
  return me(t, r[0] * e, r[1] * e, r[2] * e);
}
function qe(r, e, t) {
  return me(
    t,
    r[0] - e[0],
    r[1] - e[1],
    r[2] - e[2]
  );
}
function Dl(r, e, t) {
  return me(
    t,
    r[0] * e[0],
    r[1] * e[1],
    r[2] * e[2]
  );
}
function Ul(r, e, t, i) {
  return Ke(Pe(qe(e, r), t), r, i);
}
function za(r) {
  return kl(r[0], r[1], r[2]);
}
function kl(r, e, t) {
  return La(r * r + e * e + t * t);
}
function Va(r, e, t) {
  return me(
    t,
    Gt(r[0], e[0]),
    Gt(r[1], e[1]),
    Gt(r[2], e[2])
  );
}
function $a(r, e, t) {
  return me(
    t,
    zt(r[0], e[0]),
    zt(r[1], e[1]),
    zt(r[2], e[2])
  );
}
function ot(r, e) {
  e = e || new Array(3);
  const t = za(r);
  return e[0] = r[0] / t, e[1] = r[1] / t, e[2] = r[2] / t, e;
}
function ct(r, e) {
  return r[0] * e[0] + r[1] * e[1] + r[2] * e[2];
}
function Vh(r, e) {
  return r[0] * e[0] - r[1] * e[1] - r[2] * e[2];
}
function $h(r, e) {
  return me(e, r[2], r[1], r[0]);
}
function di(r, ...e) {
  let t;
  if (e = e || [], Array.isArray(r) ? t = r.slice(0, 3) : t = [r], t.length < 3)
    for (let i = 0, n = e.length; i < n && t.length < 3; ++i) {
      const s = e[i];
      Array.isArray(s) ? t.push(...s.slice(0, 3 - t.length)) : t.push(s);
    }
  for (; t.length < 3; ) t.push(0);
  return t;
}
function Wh(r, e, t) {
  return t = t || [0, 0, 0], ot(Ze(Ze(r, e), r), t);
}
function jh(r, e, t) {
  return t = t || [0, 0, 0], ot(Ze(r, e), t);
}
function Hh(r, e, t) {
  return t = t || [0, 0, 0], ot(Ze(e, r), t);
}
function Xh(r, e, t) {
  return t = t || [0, 0, 0], ot(Ze(r, Ze(r, e)), t);
}
function fe(r, e, t, i, n) {
  return r = r || new Array(4), r[0] = e, r[1] = t, r[2] = i, r[3] = n, r;
}
function Wa(r, e, t) {
  return fe(
    t,
    r[0] + e[0],
    r[1] + e[1],
    r[2] + e[2],
    r[3] + e[3]
  );
}
function Qh(r, e, t) {
  return fe(
    t,
    r[0] + e[0],
    r[1] + e[1],
    r[2] + e[2],
    r[3]
  );
}
function Gl(r, e) {
  return fe(e, $t(r[0]), $t(r[1]), $t(r[2]), $t(r[3]));
}
function or(r, e) {
  return fe(e, r[0], r[1], r[2], r[3]);
}
function ja(r, e) {
  return r[0] === e[0] && r[1] === e[1] && r[2] === e[2] && r[3] === e[3];
}
function Yh(r, e, t) {
  return Wt(r[0] - e[0]) <= t && Wt(r[1] - e[1]) <= t && Wt(r[2] - e[2]) <= t && Wt(r[3] - e[3]) <= t;
}
function zl(r) {
  return fe(r, 0, 0, -1, 0);
}
function Vl(r, e, t) {
  return fe(t, 0, 0, 0, 1);
}
function $l(r, e, t) {
  return fe(
    t,
    r[0] / e[0],
    r[1] / e[1],
    r[2] / e[2],
    r[3] / e[3]
  );
}
function Wl(r) {
  return fe(r, 0, 0, 0, 0);
}
function Ha(r, e) {
  e = e || new Array(4);
  for (let t = 0, i = 0, n = r.length; t < n; ++t, i += 4) {
    const s = r[t];
    e[i] = s[0], e[i + 1] = s[1], e[i + 2] = s[2], e[i + 3] = s[3];
  }
  return e;
}
function jl(r, e) {
  return fe(
    e,
    Vt(r[0]),
    Vt(r[1]),
    Vt(r[2]),
    Vt(r[3])
  );
}
function Hl(r, e) {
  return fe(e, 1 / r[0], 1 / r[1], 1 / r[2], 1 / r[3]);
}
function Xa(r, e, t) {
  return fe(
    t,
    r[0] * e,
    r[1] * e,
    r[2] * e,
    r[3] * e
  );
}
function Qa(r, e, t) {
  return fe(
    t,
    r[0] - e[0],
    r[1] - e[1],
    r[2] - e[2],
    r[3] - e[3]
  );
}
function Xl(r, e, t) {
  return fe(
    t,
    r[0] * e[0],
    r[1] * e[1],
    r[2] * e[2],
    r[3] * e[3]
  );
}
function Ya(r, e) {
  return r[0] * e[0] + r[1] * e[1] + r[2] * e[2] + r[3] * e[3];
}
function qh(r, e) {
  return r[0] * e[0] - r[1] * e[1] - r[2] * e[2] - r[3] * e[3];
}
function Kh(r, e) {
  return fe(e, r[3], r[2], r[1], r[0]);
}
function Ql(r, e, t, i) {
  return Wa(Xa(Qa(e, r), t), r, i);
}
function qa(r) {
  return Gr(r[0], r[1], r[2], r[3]);
}
function Gr(r, e, t, i) {
  return La(r * r + e * e + t * t + i * i);
}
function Yl(r, e, t) {
  return fe(
    t,
    Gt(r[0], e[0]),
    Gt(r[1], e[1]),
    Gt(r[2], e[2]),
    Gt(r[3], e[3])
  );
}
function ql(r, e, t) {
  return fe(
    t,
    zt(r[0], e[0]),
    zt(r[1], e[1]),
    zt(r[2], e[2]),
    zt(r[3], e[3])
  );
}
function Kl(r, e) {
  const t = qa(r);
  return fe(
    e,
    r[0] / t,
    r[1] / t,
    r[2] / t,
    r[3] / t
  );
}
function ts(r, ...e) {
  let t;
  if (e = e || [], Array.isArray(r) ? t = r.slice(0, 4) : t = [r], t.length < 4)
    for (let i = 0, n = e.length; i < n && t.length < 4; ++i) {
      const s = e[i];
      Array.isArray(s) ? t.push(...s.slice(0, 4 - t.length)) : t.push(s);
    }
  for (; t.length < 4; ) t.push(0);
  return t;
}
function Zh(r, e) {
  return e = e || [0, 0, 0, 0], fe(
    e,
    ((r & 16711680) >> 16) / 255,
    ((r & 65280) >> 8) / 255,
    (r & 255) / 255,
    1
  );
}
function Jh(r, e) {
  return e = e || [0, 0, 0, 0], fe(
    e,
    ((r & 4278190080) >> 24) / 255,
    ((r & 16711680) >> 16) / 255,
    ((r & 65280) >> 8) / 255,
    (r & 255) / 255
  );
}
function Zl(r, e, t, i) {
  i = i || [0, 0, 0, 0];
  const n = [0, 0, 0, 0];
  let s, a, o, c, l;
  return a = r[1] * e[1] + r[2] * e[2] + r[3] * e[3] + r[0] * e[0], a < 0 ? (a = -a, n[0] = -e[0], n[1] = -e[1], n[2] = -e[2], n[3] = -e[3]) : (n[0] = e[0], n[1] = e[1], n[2] = e[2], n[3] = e[3]), 1 - a > 1e-7 ? (s = Ch(a), o = Bs(s), c = Bs((1 - t) * s) / o, l = Bs(t * s) / o) : (c = 1 - t, l = t), i[1] = c * r[1] + l * n[1], i[2] = c * r[2] + l * n[2], i[3] = c * r[3] + l * n[3], i[0] = c * r[0] + l * n[0], i;
}
const Jl = {
  add: Fa,
  ceil: il,
  copy: sl,
  compare: nl,
  cross: ol,
  divide: cl,
  dot: xl,
  empty: ll,
  flatten: ul,
  floor: hl,
  forward: al,
  inverse: dl,
  length: bl,
  linear: Tl,
  max: fl,
  min: pl,
  multiply: gl,
  normalize: ml,
  scale: Ba,
  subtract: Pa,
  vec: vl
}, eu = {
  add: Wr,
  ceil: wl,
  copy: Da,
  compare: Ua,
  cross: yl,
  divide: ms,
  dot: gn,
  empty: Rl,
  flatten: _l,
  floor: Al,
  forward: El,
  inverse: ka,
  length: gi,
  linear: Nl,
  max: Ml,
  min: Il,
  multiply: Sl,
  normalize: Cl,
  scale: Ie,
  subtract: Re,
  vec: Ga
}, tu = {
  add: Ke,
  ceil: Ll,
  copy: Tt,
  compare: es,
  cross: Ze,
  divide: xs,
  dot: ct,
  empty: Fl,
  flatten: Bl,
  floor: Pl,
  forward: Pi,
  inverse: an,
  length: za,
  linear: Ul,
  max: Va,
  min: $a,
  multiply: Dl,
  normalize: ot,
  scale: Pe,
  subtract: qe,
  vec: di
}, ru = {
  add: Wa,
  ceil: Gl,
  copy: or,
  compare: ja,
  cross: Vl,
  divide: $l,
  dot: Ya,
  empty: Wl,
  flatten: Ha,
  floor: jl,
  forward: zl,
  inverse: Hl,
  length: qa,
  linear: Ql,
  max: Yl,
  min: ql,
  multiply: Xl,
  normalize: Kl,
  scale: Xa,
  subtract: Qa,
  vec: ts,
  slerpQuat: Zl
};
function D(r) {
  let e;
  return r.length === 1 ? (e = Jl, e) : r.length === 2 ? (e = eu, e) : r.length === 3 ? (e = tu, e) : (e = ru, e);
}
function ed(r) {
  return `[${r[0]}]`;
}
function td(r) {
  return `[${r[0]}, ${r[1]}]`;
}
function rd(r) {
  return `[${r[0]}, ${r[1]}, ${r[2]}]`;
}
function id(r) {
  return `[${r[0]}, ${r[1]}, ${r[2]}, ${r[3]}]`;
}
const nd = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  V3R: He,
  V4R: Nh,
  VecMath: D,
  add1: Fa,
  add2: Wr,
  add3: Ke,
  add4: Wa,
  add4by3: Qh,
  apply1: $e,
  apply2: he,
  apply3: me,
  apply4: fe,
  ceil1: il,
  ceil2: wl,
  ceil3: Ll,
  ceil4: Gl,
  color4FromHex3: Zh,
  color4FromHex4: Jh,
  compare1: nl,
  compare2: Ua,
  compare3: es,
  compare4: ja,
  copy1: sl,
  copy2: Da,
  copy3: Tt,
  copy4: or,
  cross1: ol,
  cross2: yl,
  cross3: Ze,
  cross4: Vl,
  divide1: cl,
  divide2: ms,
  divide3: xs,
  divide4: $l,
  dot1: xl,
  dot2: gn,
  dot3: ct,
  dot4: Ya,
  down3: Xh,
  empty1: ll,
  empty2: Rl,
  empty3: Fl,
  empty4: Wl,
  flatten1: ul,
  flatten2: _l,
  flatten3: Bl,
  flatten4: Ha,
  floor1: hl,
  floor2: Al,
  floor3: Pl,
  floor4: jl,
  forward1: al,
  forward2: El,
  forward3: Pi,
  forward4: zl,
  fuzzyCompare1: Fh,
  fuzzyCompare2: Dh,
  fuzzyCompare3: zh,
  fuzzyCompare4: Yh,
  inverse1: dl,
  inverse2: ka,
  inverse3: an,
  inverse4: Hl,
  isVec1: Oh,
  isVec2: rl,
  isVec3: Lh,
  isVec4: G,
  left3: Hh,
  length1: bl,
  length1Components: Ph,
  length2: gi,
  length2Components: Ol,
  length3: za,
  length3Components: kl,
  length4: qa,
  length4Components: Gr,
  linear1: Tl,
  linear2: Nl,
  linear3: Ul,
  linear4: Ql,
  max1: fl,
  max2: Ml,
  max3: Va,
  max4: Yl,
  min1: pl,
  min2: Il,
  min3: $a,
  min4: ql,
  multiply1: gl,
  multiply2: Sl,
  multiply3: Dl,
  multiply4: Xl,
  normalize1: ml,
  normalize2: Cl,
  normalize3: ot,
  normalize4: Kl,
  reverse2: Gh,
  reverse3: $h,
  reverse4: Kh,
  right3: jh,
  scale1: Ba,
  scale2: Ie,
  scale3: Pe,
  scale4: Xa,
  slerpQuat: Zl,
  subtract1: Pa,
  subtract2: Re,
  subtract3: qe,
  subtract4: Qa,
  toString1: ed,
  toString2: td,
  toString3: rd,
  toString4: id,
  tod1: Bh,
  tod2: Uh,
  tod3: Vh,
  tod4: qh,
  tod_flip2: kh,
  up3: Wh,
  vec1: vl,
  vec1Methods: Jl,
  vec2: Ga,
  vec2Methods: eu,
  vec3: di,
  vec3Methods: tu,
  vec4: ts,
  vec4Methods: ru
}, Symbol.toStringTag, { value: "Module" }));
class si {
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
    if (this._buffers.color instanceof j)
      e.push(this._buffers.color);
    else if (this._buffers.color instanceof Et)
      e.push(this._buffers.color), t = this._buffers.color.multiSample;
    else if (Array.isArray(this._buffers.color))
      for (let i = 0, n = this._buffers.color.length; i < n; ++i) {
        const s = this._buffers.color[i];
        s.buffer instanceof j ? e.push(s.buffer) : s.buffer instanceof Et && (e.push(s.buffer), t = s.buffer.multiSample);
      }
    else this._buffers.color && this._buffers.color.buffer instanceof j ? e.push(this._buffers.color.buffer) : this._buffers.color && this._buffers.color.buffer instanceof Et && (e.push(this._buffers.color.buffer), t = this._buffers.color.buffer.multiSample);
    if (this._buffers.depth instanceof j ? e.push(this._buffers.depth) : this._buffers.depth instanceof Et && (e.push(this._buffers.depth), t = this._buffers.depth.multiSample), this._buffers.stencil instanceof j && e.push(this._buffers.stencil), e.length > 0) {
      let i = 0, n = 0;
      const s = e[0];
      s instanceof j && s.data ? (i = s.data.width, n = s.data.height) : s instanceof Et && (i = s.size[0], n = s.size[1]);
      for (let a = 0, o = e.length; a < o; ++a) {
        const c = e[a];
        if (t > 0) {
          if (c instanceof j) {
            console.warn(
              "The output has a buffer that specifies multisampling, but a texture was also specified. Textures are not allowed in multisampled render targets.",
              c,
              e,
              "The texture will be removed as a target for the render target"
            ), this.removeBufferFromOutput(c);
            continue;
          } else if (c instanceof Et && c.multiSample !== t) {
            console.warn(
              "The output has a buffer that specifies multisampling, but an additional buffer specified did not have the same multisampling value as the other buffers.",
              c,
              e,
              "The buffer will be removed as a target for the render target"
            ), this.removeBufferFromOutput(c);
            continue;
          }
        }
        if (c instanceof j && !c.data) {
          console.warn(
            "A texture specified for thie RenderTarget did not have any data associated with it."
          ), this.removeBufferFromOutput(c);
          continue;
        } else if (c instanceof j && c.data) {
          const { width: l, height: u } = c.data;
          if (l !== i || u !== n) {
            console.warn(
              "Texture applied to the render target is invalid as it does not match dimensions of all textures/buffers applied:",
              c,
              e,
              "The texture will be removed as a target for the render target"
            ), this.removeBufferFromOutput(c);
            continue;
          }
        }
        if (c instanceof Et && (c.size[0] !== i || c.size[1] !== n)) {
          console.warn(
            "ColorBuffer applied to the render target is invalid as it does not match dimensions of all textures/buffers applied:",
            c,
            e,
            "The color buffer will be removed as a target for the render target"
          ), this.removeBufferFromOutput(c);
          continue;
        }
      }
      this._width = i, this._height = n;
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
    var t, i;
    const e = [];
    return Array.isArray(this.buffers.color) ? this.buffers.color.forEach((n) => {
      n.buffer instanceof j && e.push(n.buffer);
    }) : this.buffers.color && this.buffers.color.buffer instanceof j && e.push(this.buffers.color.buffer), this.buffers.depth instanceof j && e.push(this.buffers.depth), this.buffers.stencil instanceof j && e.push(this.buffers.stencil), (t = this.buffers.blit) != null && t.color && (Array.isArray(this.buffers.blit.color) ? this.buffers.blit.color.forEach((n) => {
      n.buffer instanceof j && e.push(n.buffer);
    }) : this.buffers.blit.color.buffer instanceof j && e.push(this.buffers.blit.color.buffer)), (i = this.buffers.blit) != null && i.depth && e.push(this.buffers.blit.depth), e;
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
   * Cleanses a texture or color buffer from being used as an output buffer
   */
  removeBufferFromOutput(e) {
    var t;
    if (Array.isArray(this._buffers.color)) {
      const i = this._buffers.color.find((s) => s.buffer === e);
      if (!i) return;
      const n = this._buffers.color.indexOf(i);
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
var _e = /* @__PURE__ */ ((r) => (r[r.FLOAT = 0] = "FLOAT", r[r.VEC2 = 1] = "VEC2", r[r.VEC3 = 2] = "VEC3", r[r.VEC4 = 3] = "VEC4", r[r.VEC4_ARRAY = 4] = "VEC4_ARRAY", r[r.FLOAT_ARRAY = 5] = "FLOAT_ARRAY", r[r.MATRIX3x3 = 6] = "MATRIX3x3", r[r.MATRIX4x4 = 7] = "MATRIX4x4", r[r.TEXTURE = 8] = "TEXTURE", r))(_e || {});
function yT(r) {
  return r.type === 1;
}
function RT(r) {
  return r.type === 2;
}
function _T(r) {
  return r.type === 3;
}
function sd(r) {
  return r.type === 4;
}
function AT(r) {
  return r.type === 6;
}
function MT(r) {
  return r.type === 7;
}
function IT(r) {
  return r.type === 8;
}
function ST(r) {
  return r.type === 0;
}
const ad = window.OffscreenCanvas || Oa;
function Li(r) {
  return r instanceof ad;
}
var Bt = /* @__PURE__ */ ((r) => (r[r.INVALID = 0] = "INVALID", r[r.VALID = 1] = "VALID", r[r.NO_RENDER_TARGET_MATCHES = 2] = "NO_RENDER_TARGET_MATCHES", r))(Bt || {});
const Vo = Ee("performance");
class od {
  /**
   * Generate a new state manager and establish some initial state settings by
   * querying the context.
   */
  constructor(e, t) {
    this.debugContext = "", this._textureUnitToTexture = /* @__PURE__ */ new Map(), this._freeTextureUnits = [], this._freeUniformBufferBindings = [], this._blendingEnabled = !0, this._blendDstFactor = f.Material.BlendingDstFactor.One, this._blendSrcFactor = f.Material.BlendingDstFactor.One, this._blendEquation = f.Material.BlendingEquations.Add, this._cullFace = f.Material.CullSide.NONE, this._cullEnabled = !0, this._colorMask = [!0, !0, !0, !0], this._clearColor = [0, 0, 0, 1], this._depthFunc = f.Material.DepthFunctions.ALWAYS, this._depthTestEnabled = !0, this._depthMask = !0, this._ditheringEnabled = !0, this._boundFBO = { read: null, draw: null }, this._renderTarget = null, this._boundRBO = null, this._boundVAO = null, this._boundVBO = null, this._boundElementArrayBuffer = null, this._boundTexture = {
      id: null,
      unit: -1
    }, this._currentProgram = null, this._scissorTestEnabled = !1, this._scissorBounds = { x: 0, y: 0, width: 1, height: 1 }, this._currentUniforms = {}, this._activeTextureUnit = -1, this._drawBuffers = [], this._textureWillBeUsed = /* @__PURE__ */ new Map(), this._viewport = { x: 0, y: 0, width: 100, height: 100 }, this._enabledVertexAttributeArray = [], this._willUseVertexAttributeArray = [], this._vertexAttributeArrayDivisor = /* @__PURE__ */ new Map(), this.gl = e, this.extensions = t;
    const i = this.gl.getParameter(
      e.MAX_COMBINED_TEXTURE_IMAGE_UNITS
    );
    for (let s = 0; s < i; ++s)
      this._freeTextureUnits.push(mh(e, s));
    const n = N.MAX_UNIFORM_BUFFER_BINDINGS;
    for (let s = 0; s < n; ++s)
      this._freeUniformBufferBindings.push(s);
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
        case f.Texture.TextureBindingTarget.TEXTURE_2D:
          this.gl.bindTexture(this.gl.TEXTURE_2D, e.gl.textureId);
          break;
        case f.Texture.TextureBindingTarget.CUBE_MAP:
          this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, e.gl.textureId);
          break;
      }
      const i = this._textureUnitToTexture.get(this._activeTextureUnit);
      i && i.gl && (i.gl.textureUnit = -1), this._textureUnitToTexture.set(this._activeTextureUnit, e), e.gl.textureUnit = this._activeTextureUnit;
    }
  }
  /**
   * Disables all vertex attribute array indices enabled
   */
  disableVertexAttributeArray() {
    for (let e = 0, t = this._enabledVertexAttributeArray.length; e < t; ++e) {
      const i = this._enabledVertexAttributeArray[e];
      this.gl.disableVertexAttribArray(i);
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
      const i = this._enabledVertexAttributeArray[e];
      if (i !== void 0) {
        if (this._willUseVertexAttributeArray[i] !== void 0) return;
        this.gl.disableVertexAttribArray(i), delete this._enabledVertexAttributeArray[i];
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
    ja(e, this._clearColor) || (this._clearColor = or(e), this.applyClearColor());
  }
  /**
   * Change the drawBuffer state, if it's available
   *
   * 0 - n specifies COLOR_ATTACHMENT
   * -1 specifies NONE
   * -2 specifies BACK
   */
  setDrawBuffers(e, t) {
    let i = e.length !== this._drawBuffers.length;
    if (!i) {
      for (let n = 0, s = e.length; n < s; ++n)
        if (this._drawBuffers[n] !== e[n]) {
          i = !0;
          break;
        }
    }
    if (i) {
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
  setViewport(e, t, i, n) {
    (e !== this._viewport.x || t !== this._viewport.y || i !== this._viewport.width || n !== this._viewport.height) && (this._viewport = { x: e, y: t, width: i, height: n }, this.applyViewport());
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
      return Bt.INVALID;
    const t = this.findMaterialProgram(e);
    if (t === void 0)
      return console.warn(
        "Could NOT determine a program for the given material that would appropriately match with the current RenderTarget"
      ), Bt.NO_RENDER_TARGET_MATCHES;
    if (this._renderTarget && (e.gl.programByTarget.set(this._renderTarget, t), this.glProxy.extensions.drawBuffers)) {
      const i = e.gl.outputsByProgram.get(t), n = this._renderTarget.getGLBuffers();
      if (!i || !n)
        return console.warn(
          "Could not establish the buffers to utilize for the render target"
        ), Bt.NO_RENDER_TARGET_MATCHES;
      const s = [];
      for (let a = 0, o = n.length; a < o; ++a) {
        const c = n[a];
        i.find(
          (u) => (c == null ? void 0 : c.outputType) === u
        ) === void 0 ? s.push(this.gl.NONE) : this._renderTarget.disabledTargets.has(
          (c == null ? void 0 : c.outputType) || 0
        ) ? s.push(this.gl.NONE) : s.push((c == null ? void 0 : c.attachment) ?? this.gl.NONE);
      }
      this.setDrawBuffers(s);
    }
    return this.useProgram(t), this.syncMaterial(e), Bt.VALID;
  }
  /**
   * This examines a given material to find the most appropriate program to run
   * based on the current RenderTarget
   */
  findMaterialProgram(e) {
    if (!e.gl) return;
    if (!this._renderTarget || this._renderTarget.isColorTarget()) {
      let o;
      if (this._renderTarget && (o = e.gl.programByTarget.get(this._renderTarget), o !== void 0))
        return o;
      let c = Number.MAX_SAFE_INTEGER;
      for (let l = 0, u = e.gl.programId.length; l < u; ++l) {
        const h = e.gl.programId[l];
        h.outputTypes.length < c && h.outputTypes.indexOf(V.COLOR) >= 0 && (o = h.id, c = h.outputTypes.length);
      }
      return o || (o = e.gl.programId[e.gl.programId.length - 1]), o;
    }
    let t = e.gl.programByTarget.get(
      this._renderTarget
    );
    if (t !== void 0) return t;
    const i = /* @__PURE__ */ new Set(), n = this._renderTarget.getBuffers();
    for (let o = 0, c = n.length; o < c; ++o) {
      const l = n[o];
      l && i.add(l.outputType);
    }
    let s = 0, a = [];
    for (let o = 0, c = e.gl.programId.length; o < c; ++o) {
      const l = e.gl.programId[o];
      let u = 0;
      for (let h = 0, d = l.outputTypes.length; h < d; ++h) {
        const p = l.outputTypes[h];
        i.has(p) && u++;
      }
      u > s ? (s = u, a = [l]) : u === s && a.push(l);
    }
    if (a.length !== 0)
      return a.length === 1 ? t = a[0].id : a.length > 1 && (t = a.reduce(
        (o, c) => c.outputTypes.length < o.outputTypes.length ? c : o
      )), t;
  }
  /**
   * Sets all current gl state to match the render target specified
   */
  useRenderTarget(e) {
    if (!e)
      return this.bindFBO(null), this._renderTarget = null, !0;
    const t = e.getTextures();
    for (let i = 0, n = t.length; i < n; ++i) {
      const s = t[i];
      s && this.freeTextureUnit(s);
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
        const { 0: i, 1: n } = t;
        if (!this._currentProgram) return;
        n.gl || (n.gl = /* @__PURE__ */ new Map());
        let s = n.gl.get(this._currentProgram);
        if (!s) {
          const a = this.gl.getUniformLocation(
            this._currentProgram,
            i
          );
          if (!a) {
            s = {
              location: void 0
            }, Vo(
              this.debugContext,
              `A Material specified a uniform ${i}, but none was found in the current program.`
            );
            return;
          }
          s = {
            location: a
          }, n.gl.set(this._currentProgram, s);
        }
        s.location && this.uploadUniform(s.location, n);
      });
    }
    return e.uniformBuffers && Object.entries(e.uniformBuffers).forEach((t) => {
      const { 0: i, 1: n } = t;
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
    let i;
    switch (t.type) {
      case _e.FLOAT:
        i = t.data, this.gl.uniform1f(e, i);
        break;
      case _e.VEC2:
        i = t.data, this.gl.uniform2f(e, i[0], i[1]);
        break;
      case _e.VEC3:
        i = t.data, this.gl.uniform3f(e, i[0], i[1], i[2]);
        break;
      case _e.VEC4:
        i = t.data, this.gl.uniform4f(e, i[0], i[1], i[2], i[3]);
        break;
      case _e.VEC4_ARRAY:
        i = t.data, this.gl.uniform4fv(e, Ha(i));
        break;
      case _e.MATRIX3x3:
        i = t.data, this.gl.uniformMatrix3fv(e, !1, i);
        break;
      case _e.MATRIX4x4:
        i = t.data, this.gl.uniformMatrix4fv(e, !1, i);
        break;
      case _e.FLOAT_ARRAY:
        i = t.data, this.gl.uniform1fv(e, i);
        break;
      case _e.TEXTURE:
        i = t.data, this.willUseTextureUnit(i, e);
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
    const t = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Set();
    return this._textureWillBeUsed.forEach((n, s) => {
      n instanceof si ? i.add(n) : t.set(s, n);
    }), i.forEach((n) => {
      n.getTextures().some((o) => {
        if (e.indexOf(o) < 0)
          this.glProxy.updateTexture(o);
        else return !0;
        return !1;
      }) ? console.warn(
        this.debugContext,
        "A RenderTarget can not be used because all of it's textures could not be compiled."
      ) : this.glProxy.compileRenderTarget(n);
    }), t.forEach((n, s) => {
      e.length === 0 || e.indexOf(s) < 0 ? (this.glProxy.updateTexture(s), n.forEach((a) => {
        this.uploadTextureToUniform(a, s);
      })) : n.forEach((a) => {
        this.gl.uniform1i(a, Bo(this.gl, 0));
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
    const t = [], i = [];
    for (e.forEach((a) => {
      !a.gl || a.gl.textureUnit < 0 ? t.push(a) : i.push(a);
    }); this._freeTextureUnits.length > 0 && t.length > 0; ) {
      const a = t.shift();
      if (!a) continue;
      const o = this._freeTextureUnits.shift();
      if (o === void 0) {
        t.unshift(a);
        continue;
      }
      a.gl ? a.gl.textureUnit = o : a.gl = {
        textureId: null,
        textureUnit: o,
        proxy: this.glProxy
      }, i.push(a);
    }
    if (t.length <= 0)
      return t;
    Vo(
      "WARNING: Too many textures in use are causing texture units to be swapped. Doing this occasionally is fine, but handling this on a frame loop can have serious performance concerns."
    );
    const n = /* @__PURE__ */ new Map();
    this._textureUnitToTexture.forEach((a) => {
      a && n.set(a, !1);
    }), i.forEach((a) => {
      n.set(a, !0);
    });
    const s = [];
    if (n.forEach((a, o) => {
      a || s.push(o);
    }), s.length === 0)
      return console.warn(
        this.debugContext,
        "There are too many textures being used for a single draw call. These textures will not be utilized on the GPU",
        t
      ), console.warn("Current GL State:", this), t;
    for (; s.length > 0 && t.length > 0; ) {
      const a = t.shift();
      if (!a) continue;
      const o = s.shift();
      if (o === void 0 || !o.gl || o.gl.textureUnit < 0) {
        t.unshift(a);
        continue;
      }
      a.gl ? a.gl.textureUnit = o.gl.textureUnit : a.gl = {
        textureId: null,
        textureUnit: o.gl.textureUnit,
        proxy: this.glProxy
      }, i.push(a);
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
      f.Texture.TextureBindingTarget.TEXTURE_2D
    )), this.gl.uniform1i(
      e,
      Bo(this.gl, t.gl.textureUnit)
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
    const i = this._textureWillBeUsed.get(e);
    t instanceof si ? i ? i instanceof si && i !== t && console.warn(
      this.debugContext,
      "A Texture is attempting to be used by two different render targets in a single draw."
    ) : this._textureWillBeUsed.set(e, t) : i ? i instanceof si ? console.warn(
      this.debugContext,
      "A texture in a single draw is attempting to attach to a uniform AND a render target which is invalid."
    ) : i.add(t) : this._textureWillBeUsed.set(e, /* @__PURE__ */ new Set([t]));
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
      case f.Material.DepthFunctions.ALWAYS:
        e.depthFunc(e.ALWAYS);
        break;
      case f.Material.DepthFunctions.EQUAL:
        e.depthFunc(e.EQUAL);
        break;
      case f.Material.DepthFunctions.GREATER:
        e.depthFunc(e.GREATER);
        break;
      case f.Material.DepthFunctions.GREATER_OR_EQUAL:
        e.depthFunc(e.GEQUAL);
        break;
      case f.Material.DepthFunctions.LESS:
        e.depthFunc(e.LESS);
        break;
      case f.Material.DepthFunctions.LESS_OR_EQUAL:
        e.depthFunc(e.LEQUAL);
        break;
      case f.Material.DepthFunctions.NEVER:
        e.depthFunc(e.NEVER);
        break;
      case f.Material.DepthFunctions.NOTEQUAL:
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
      case f.Material.BlendingEquations.Add:
        e.blendEquation(e.FUNC_ADD);
        break;
      case f.Material.BlendingEquations.Subtract:
        e.blendEquation(e.FUNC_SUBTRACT);
        break;
      case f.Material.BlendingEquations.ReverseSubtract:
        e.blendEquation(e.FUNC_REVERSE_SUBTRACT);
        break;
    }
  }
  /**
   * Applies the blending factors to the gl state
   */
  applyBlendFactors() {
    const e = this.gl;
    let t, i;
    switch (this._blendDstFactor) {
      case f.Material.BlendingDstFactor.DstAlpha:
        t = e.BLEND_DST_ALPHA;
        break;
      case f.Material.BlendingDstFactor.DstColor:
        t = e.BLEND_DST_RGB;
        break;
      case f.Material.BlendingDstFactor.One:
        t = e.ONE;
        break;
      case f.Material.BlendingDstFactor.OneMinusDstAlpha:
        t = e.ONE_MINUS_DST_ALPHA;
        break;
      case f.Material.BlendingDstFactor.OneMinusDstColor:
        t = e.ONE_MINUS_DST_COLOR;
        break;
      case f.Material.BlendingDstFactor.OneMinusSrcAlpha:
        t = e.ONE_MINUS_SRC_ALPHA;
        break;
      case f.Material.BlendingDstFactor.OneMinusSrcColor:
        t = e.ONE_MINUS_SRC_COLOR;
        break;
      case f.Material.BlendingDstFactor.SrcAlpha:
        t = e.SRC_ALPHA;
        break;
      case f.Material.BlendingDstFactor.SrcColor:
        t = e.SRC_COLOR;
        break;
      case f.Material.BlendingDstFactor.Zero:
        t = e.ZERO;
        break;
      default:
        t = e.ONE;
        break;
    }
    switch (this._blendSrcFactor) {
      case f.Material.BlendingDstFactor.DstAlpha:
        i = e.BLEND_DST_ALPHA;
        break;
      case f.Material.BlendingDstFactor.DstColor:
        i = e.BLEND_DST_RGB;
        break;
      case f.Material.BlendingDstFactor.One:
        i = e.ONE;
        break;
      case f.Material.BlendingDstFactor.OneMinusDstAlpha:
        i = e.ONE_MINUS_DST_ALPHA;
        break;
      case f.Material.BlendingDstFactor.OneMinusDstColor:
        i = e.ONE_MINUS_DST_COLOR;
        break;
      case f.Material.BlendingDstFactor.OneMinusSrcAlpha:
        i = e.ONE_MINUS_SRC_ALPHA;
        break;
      case f.Material.BlendingDstFactor.OneMinusSrcColor:
        i = e.ONE_MINUS_SRC_COLOR;
        break;
      case f.Material.BlendingDstFactor.SrcAlpha:
        i = e.SRC_ALPHA;
        break;
      case f.Material.BlendingDstFactor.SrcColor:
        i = e.SRC_COLOR;
        break;
      case f.Material.BlendingDstFactor.Zero:
        i = e.ZERO;
        break;
      case f.Material.BlendingSrcFactor.SrcAlphaSaturate:
        i = e.SRC_ALPHA_SATURATE;
        break;
      default:
        i = e.ONE;
        break;
    }
    e.blendFunc(i, t);
  }
  /**
   * Applies the cull face property to the gl state
   */
  applyCullFace() {
    const e = this.gl;
    switch (this._cullFace === f.Material.CullSide.NONE ? (e.disable(e.CULL_FACE), this._cullEnabled = !1) : (e.enable(e.CULL_FACE), this._cullEnabled = !0), this._cullFace) {
      case f.Material.CullSide.CW:
        e.frontFace(e.CCW), e.cullFace(e.BACK);
        break;
      case f.Material.CullSide.CCW:
        e.frontFace(e.CW), e.cullFace(e.BACK);
        break;
      case f.Material.CullSide.BOTH:
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
class Ts {
  constructor(e) {
    this.blending = {
      blendDst: f.Material.BlendingDstFactor.OneMinusSrcAlpha,
      blendEquation: f.Material.BlendingEquations.Add,
      blendSrc: f.Material.BlendingSrcFactor.SrcAlpha
    }, this.colorWrite = [!0, !0, !0, !0], this.culling = f.Material.CullSide.CCW, this.depthFunc = f.Material.DepthFunctions.LESS_OR_EQUAL, this.depthTest = !0, this.depthWrite = !0, this.dithering = !0, this.name = "", this.uniforms = {}, this.uniformBuffers = {}, this.vertexShader = "", Object.assign(this, e), delete this.gl;
  }
  /**
   * Makes a duplicate material with identical settings as this material. It
   * provides the benefit of being able to adjust uniform values for the new
   * material while sharing the same programs and shaders.
   */
  clone() {
    const e = new Ts(this);
    e.blending = Object.assign({}, this.blending), e.polygonOffset = Object.assign({}, this.polygonOffset), e.uniforms = Object.assign({}, this.uniforms);
    for (const t in e.uniforms) {
      const i = e.uniforms[t];
      if (i.gl) {
        const n = /* @__PURE__ */ new Map();
        i.gl.forEach((s, a) => {
          n.set(a, Object.assign({}, s));
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
class iu {
  constructor(e, t, i) {
    this.drawMode = f.Model.DrawMode.TRIANGLES, this.vertexDrawRange = [-1, -1], this.drawInstances = -1, this.vertexCount = 0, this.id = e, this.geometry = t, this.material = i;
  }
}
class ta {
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
const $o = Ee("performance");
class cd {
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
  clear(e, t, i) {
    const n = this.state.clearMask;
    this.state.clearMask = [
      n[0] || e || !1,
      n[1] || t || !1,
      n[2] || i || !1
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
    const e = Jn.getContext(this.options.canvas, {
      alpha: this.options.alpha || !1,
      antialias: this.options.antialias || !1,
      premultipliedAlpha: this.options.premultipliedAlpha || !1,
      preserveDrawingBuffer: this.options.preserveDrawingBuffer || !1
    });
    return e.context ? (this._gl = e.context, this.glState = new od(e.context, e.extensions), this.glProxy = new Jn(e.context, this.glState, e.extensions), this.glState.setProxy(this.glProxy), this.glState.syncState()) : this.options.onNoContext ? this.options.onNoContext() : console.warn(
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
  prepareAttribute(e, t, i) {
    if (this.glProxy.updateAttribute(t))
      (!e.gl || !e.gl.vao) && this.glProxy.useAttribute(i, t, e);
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
  render(e, t = null, i, n) {
    var o, c, l, u;
    if (!this.gl) return;
    this.setRenderTarget(t);
    const s = [];
    if (t && !Array.isArray(t) && (N.MRT || N.MRT_EXTENSION)) {
      const h = t.getGLBuffers();
      this.glState.setDrawBuffers(
        h.map((d) => (d == null ? void 0 : d.attachment) || 0)
      );
    }
    const a = this.state.clearMask;
    if ((a[0] || a[1] || a[2]) && (this.glProxy.clear(a[0], a[1], a[2]), this.state.clearMask = [!1, !1, !1]), Array.isArray(t))
      for (let h = 0, d = t.length; h < d; ++h) {
        const p = t[h];
        if (this.glState.useRenderTarget(p), p && !p.gl)
          return;
        e.models.forEach((g) => {
          this.renderModel(i, g, s, n);
        }), ((o = p.buffers.blit) != null && o.color || (c = p.buffers.blit) != null && c.depth) && this.glProxy.blitFramebuffer(p);
      }
    else {
      if (t && !t.gl)
        return;
      e.models.forEach((h) => {
        this.renderModel(i, h, s, n);
      }), ((l = t == null ? void 0 : t.buffers.blit) != null && l.color || (u = t == null ? void 0 : t.buffers.blit) != null && u.depth) && this.glProxy.blitFramebuffer(t);
    }
    s.forEach((h) => {
      e.remove(h);
    });
  }
  /**
   * Renders the specified model
   */
  renderModel(e, t, i, n) {
    var c;
    const s = t.geometry, a = t.material, o = this.glState.useMaterial(a);
    switch (e != null && e.props.materialSettings && this.glState.syncMaterial(e.props.materialSettings), o) {
      case Bt.VALID: {
        this.glProxy.compileGeometry(s);
        let l = !0;
        const u = (h, d) => {
          l = this.prepareAttribute(s, h, d) && l;
        };
        s.attributes.forEach(u), s.indexBuffer && (l = this.prepareIndexBuffer(s, s.indexBuffer) && l), (c = s.gl) != null && c.vao ? this.glState.bindVAO(s.gl.vao) : (this.glState.boundVAO && this.glState.bindVAO(null), this.glState.applyVertexAttributeArrays()), n == null || n(this.glState, t.id), l ? this.glProxy.draw(t) : (console.warn(
          "Geometry was unable to update correctly, thus we are skipping the drawing of",
          t
        ), i.push(t)), this.glState.bindVAO(null);
        break;
      }
      case Bt.INVALID: {
        console.warn(
          "Could not utilize material. Skipping draw call for:",
          a,
          s
        ), i.push(t);
        break;
      }
      case Bt.NO_RENDER_TARGET_MATCHES: {
        $o(
          "Skipped draw for material due to no output matches for the current render target"
        );
        break;
      }
      default:
        $o("Skipped draw for material due to unknown reasons");
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
  readPixels(e, t, i, n, s, a = 0) {
    if (!this.gl) return;
    const o = this.state.currentRenderTarget;
    let c = !0, l;
    if (Array.isArray(o))
      l = o.find((u) => {
        var h;
        return Array.isArray(u.buffers.color) ? u.buffers.color.find((d) => d.outputType === a) : ((h = u.buffers.color) == null ? void 0 : h.outputType) === a;
      });
    else if (o && Array.isArray(o == null ? void 0 : o.buffers.color)) {
      if (o.buffers.color.length > 1) {
        console.warn(
          "It is not yet implemented to read the pixels from a RenderTarget with multiple color buffers"
        );
        return;
      }
      l = o;
    } else
      l = o;
    if (l && (c = l.validFramebuffer), !c) {
      console.warn(
        "Framebuffer is incomplete. Can not read pixels at this time."
      );
      return;
    }
    if (e = Math.max(0, Math.min(e, ((l == null ? void 0 : l.width) || 0) - i)), t = Math.max(0, Math.min(t, ((l == null ? void 0 : l.height) || 0) - n)), l) {
      e + i > l.width && (i = l.width - e), t + n > l.height && (n = l.height - t);
      const u = l.height;
      this.gl.readPixels(
        e,
        u - t - n,
        i,
        n,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        s
      );
    } else {
      const u = this.getRenderSize(), h = u[1];
      e + i > u[0] && (i = u[0] - e), t + n > u[1] && (n = u[1] - t), this.gl.readPixels(
        e,
        h - t - n,
        i,
        n,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        s
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
    const { canvas: t } = this.options, i = this.getDisplaySize();
    t.width = i[0] * e, t.height = i[1] * e, this.state.pixelRatio = e;
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
      const i = t[0].height;
      if (e) {
        const { x: n, y: s, width: a, height: o } = e;
        this.glState.setScissor({ x: n, y: i - s - o, width: a, height: o });
      } else
        this.glState.setScissor(null);
    } else if (t) {
      const i = t.height;
      if (e) {
        const { x: n, y: s, width: a, height: o } = e;
        this.glState.setScissor({ x: n, y: i - s - o, width: a, height: o });
      } else
        this.glState.setScissor(null);
    } else {
      const { renderSize: i } = this.state, n = i[1];
      if (e) {
        const { x: s, y: a, width: o, height: c } = e;
        this.glState.setScissor({
          x: s,
          y: n - a - c,
          width: o,
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
    const { canvas: i } = this.options, { pixelRatio: n } = this.state;
    i.width = Math.min(e * n, N.MAX_TEXTURE_SIZE), i.height = Math.min(t * n, N.MAX_TEXTURE_SIZE), i.style.width = `${e}px`, i.style.height = `${t}px`, this.state.renderSize = [i.width, i.height], this.state.displaySize = [e, t];
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
    const t = this.state.currentRenderTarget, { x: i, y: n, width: s, height: a } = e;
    if (Array.isArray(t)) {
      const o = t[0].height;
      this.glState.setViewport(i, o - n - a, s, a);
    } else if (t) {
      const o = t.height;
      this.glState.setViewport(i, o - n - a, s, a);
    } else {
      const { renderSize: o } = this.state, c = o[1];
      this.glState.setViewport(i, c - n - a, s, a);
    }
  }
}
const { min: Sn, max: Cn } = Math;
class te {
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
    return new te({
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
    return e instanceof te ? (e.x < this.x && (this.width += Math.abs(e.x - this.x), this.x = e.x), e.y < this.y && (this.height += Math.abs(e.y - this.y), this.y = e.y), this.right < e.right && (this.width += e.right - this.right), this.bottom < e.bottom && (this.height += e.bottom - this.bottom), !0) : (e[0] < this.x && (this.width += this.x - e[0], this.x = e[0]), e[0] > this.right && (this.width += e[0] - this.x), e[1] < this.y && (this.height += this.y - e[1], this.y = e[1]), e[1] > this.bottom && (this.height += e[1] - this.y), !0);
  }
  /**
   * Grows the bounds (if needed) to encompass all bounds or points provided. This
   * performs much better than running encapsulate one by one.
   */
  encapsulateAll(e) {
    if (e.length <= 0) return;
    let t = Number.MAX_SAFE_INTEGER, i = Number.MIN_SAFE_INTEGER, n = Number.MAX_SAFE_INTEGER, s = Number.MIN_SAFE_INTEGER;
    if (e[0] instanceof te) {
      const a = e;
      for (let o = 0, c = a.length; o < c; ++o) {
        const l = a[o];
        t = Sn(t, l.left), i = Cn(i, l.right), n = Sn(n, l.top), s = Cn(s, l.bottom);
      }
    } else {
      const a = e;
      for (let o = 0, c = a.length; o < c; ++o) {
        const [l, u] = a[o];
        t = Sn(t, l), i = Cn(i, l), n = Sn(n, u), s = Cn(s, u);
      }
    }
    this.x = Math.min(this.x, t), this.y = Math.min(this.y, n), this.width = Math.max(this.width, i - t), this.height = Math.max(this.height, s - n);
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
function Ct(r, e, t) {
  const i = `${r}`, n = parseFloat(i);
  return isNaN(n) ? 0 : i.indexOf("%") > -1 ? n / 100 * e : n * t;
}
const _i = /* @__PURE__ */ new WeakSet();
function Wo(r, e, t) {
  (e.width === 0 || e.height === 0) && (_i.has(r) || (console.warn(
    "An AbsolutePosition evaluated to invalid dimensions.",
    "Please ensure that the object provided and the reference has valid dimensions",
    "to produce dimensions with width and height that are non-zero.",
    "item:",
    r,
    "reference:",
    e.toString()
  ), _i.add(r)));
  const i = te.emptyBounds();
  let n, s;
  if (r.width)
    i.width = Ct(r.width, e.width, t), r.left !== void 0 ? i.x = Ct(r.left, e.width, t) : r.right !== void 0 && (i.x = e.width - Ct(r.right, e.width, t) - i.width);
  else {
    const a = Ct(r.left || 0, e.width, t);
    n = e.width - Ct(r.right || 0, e.width, t) - a, n < 0 && (_i.has(r) || (console.warn(
      "An AbsolutePosition evaluated to invalid dimensions.",
      "Please ensure that the object provided and the reference has valid dimensions",
      "to produce dimensions with width and height that are greater than zero.",
      "item:",
      r,
      "reference:",
      e.toString()
    ), _i.add(r))), i.x = a, i.width = n;
  }
  if (r.height)
    i.height = Ct(r.height, e.height, t), r.top !== void 0 ? i.y = Ct(r.top, e.height, t) : r.bottom !== void 0 && (i.y = e.height - Ct(r.bottom, e.height, t) - i.height);
  else {
    const a = Ct(r.top || 0, e.height, t);
    s = e.height - Ct(r.bottom || 0, e.height, t) - a, (s === void 0 || s < 0) && (_i.has(r) || (console.warn(
      "An AbsolutePosition evaluated to invalid dimensions.",
      "Please ensure that the object provided and the reference has valid dimensions",
      "to produce dimensions with width and height that are greater than zero.",
      "item:",
      r,
      "reference:",
      e.toString()
    ), _i.add(r))), i.y = a, i.height = s;
  }
  return (i.width === 0 || i.height === 0 || isNaN(i.x + i.y + i.width + i.height)) && (i.x = 0, i.y = 0, i.width = e.width, i.height = e.height), i;
}
const Lt = class Lt {
  /**
   * This activates all observables to gather their UIDs when they are retrieved
   * via their getter. All of the ID's gathered can be accessed via
   * getObservableMonitorIds. It is REQUIRED that this is disabled again to
   * prevent a MASSIVE memory leak.
   */
  static setObservableMonitor(e) {
    Lt.gatherIds = e, Lt.observableIds = [];
  }
  /**
   * This retrieves the observables monitored IDs that were gathered when
   * setObservableMonitor was enabled.
   */
  static getObservableMonitorIds(e) {
    const t = Lt.observableIds.slice(0);
    return e && (Lt.observableIds = []), t;
  }
};
Lt.setCycle = !1, Lt.gatherIds = !1, Lt.observableIds = [], Lt.observableNamesToUID = /* @__PURE__ */ new Map();
let Ne = Lt;
const Ot = Ne, $n = /* @__PURE__ */ new Map();
let ld = 1;
const ud = {}.constructor;
function hd(r, e) {
  const t = Ot.observableNamesToUID.get(e) || 0;
  if (t === 0) {
    console.warn(
      "A property with name",
      e,
      "for",
      r,
      "has not been assigned a UID which is an error in this step of the process."
    );
    return;
  }
  function i() {
    return Ot.gatherIds && (Ot.setCycle || Ot.observableIds.push(t)), r.observableStorage[t];
  }
  function n(a) {
    Ot.gatherIds && (Ot.setCycle = !0), r.observableStorage[t] = a, r.changes[t] = t, r.observer && r.observer.instanceUpdated(r), Ot.gatherIds && (Ot.setCycle = !1);
  }
  const s = r[e];
  Object.defineProperty(r, e, {
    configurable: !0,
    enumerable: !0,
    get: i,
    set: n
  }), r[e] = s;
}
function M(r, e, t) {
  t || (t = {
    configurable: !0,
    enumerable: !0
  });
  let i = $n.get(r.constructor), n = Ot.observableNamesToUID.get(e) || 0;
  n === 0 && (n = ++ld, Ot.observableNamesToUID.set(e, n)), i || (i = /* @__PURE__ */ new Set(), $n.set(r.constructor, i)), i.add(e);
  let s = Object.getPrototypeOf(r), a = 0;
  for (; s.constructor !== ud && ++a < 100; ) {
    const o = $n.get(s.constructor);
    o && o.forEach((c) => i == null ? void 0 : i.add(c)), s = Object.getPrototypeOf(s);
  }
  a >= 100 && console.warn(
    "@observable decorator encountered a type that has 100+ levels of inheritance. This is most likely an error, and may be a result of a circular dependency and will not be supported by this decorator."
  ), t.enumerable = !0, t.writable = !0, Object.defineProperty(r, e, t);
}
function Je(r, e) {
  if (r.constructor !== e) return;
  const t = $n.get(e);
  t && t.forEach((i) => hd(r, i));
}
class le {
  constructor(e) {
    if (this._uid = P(), this.cleanObservation = /* @__PURE__ */ new Map(), this.instanceChanges = /* @__PURE__ */ new Map(), this.allowChanges = !0, this.resolveContext = "", e)
      for (let t = 0, i = e.length; t < i; ++t) {
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
        be.INSERT,
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
      be.CHANGE,
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
        be.REMOVE,
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
      const { 0: i } = t;
      this.instanceChanges.set(i.uid, [
        i,
        be.INSERT,
        e
      ]);
    });
  }
}
class CT extends le {
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
    const t = this._instances.findIndex((i) => i.uid === e.uid);
    return t !== -1 && this._instances.splice(t, 1), super.remove(e);
  }
  destroy() {
    this._instances.length = 0, super.destroy();
  }
}
class nu {
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
var dd = Object.defineProperty, su = (r, e, t, i) => {
  for (var n = void 0, s = r.length - 1, a; s >= 0; s--)
    (a = r[s]) && (n = a(e, t, n) || n);
  return n && dd(e, t, n), n;
};
let jo = 0;
const Ka = class ra {
  constructor(e) {
    this._active = !1, this.changes = {}, this._observer = null, this.observableStorage = [], this._uid = ra.newUID, this.reactivate = !1, Je(this, ra), e && (this.active = e.active || this.active);
  }
  static get newUID() {
    return jo = ++jo % 16777215;
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
        const i = this.easing.get(t);
        if (i instanceof nu)
          return i;
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
su([
  M
], Ka.prototype, "_active");
su([
  M
], Ka.prototype, "_uid");
let wt = Ka;
class Za {
  constructor() {
    this._uid = P(), this.id = "", this.pixelRatio = 1, this._screenScale = [1, 1];
  }
  /** Provides a numerical UID for this object */
  get uid() {
    return this._uid;
  }
  /** This is the rendering bounds within screen space */
  get screenBounds() {
    return this._scaledScreenBounds || (this._scaledScreenBounds = new te({
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
    Ua(e, this._screenScale) || (delete this._scaledScreenBounds, this._screenScale = e);
  }
  /**
   * This projects a point to be relative to the rendering dimensions of the
   * view.
   */
  screenToRenderSpace(e, t) {
    return t = this.screenToView(e, t), he(t, e[0] * this.pixelRatio, e[1] * this.pixelRatio);
  }
  /**
   * This projects a point relative to the render space of the view to the
   * screen coordinates
   */
  renderSpaceToScreen(e, t) {
    return t = t || [0, 0], he(
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
    return t = t || [0, 0], he(
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
    return t = t || [0, 0], he(
      t,
      e[0] + this.screenBounds.x,
      e[1] + this.screenBounds.y
    );
  }
}
class fd extends Za {
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
class mi {
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
function Ja(r) {
  return {
    key: "",
    type: ce.COLOR_BUFFER,
    ...r
  };
}
function on(r) {
  return r !== void 0 && r.key !== void 0 && r.type === ce.COLOR_BUFFER;
}
class Ho extends mi {
  constructor(e, t) {
    super(e), this.type = ce.COLOR_BUFFER, this.height = e.height, this.width = e.width, this.colorBufferSettings = e.colorBufferSettings, this.createColorBuffer(t);
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
    let t, i;
    const n = (e == null ? void 0 : e.getRenderSize()) || [1, 1];
    if (this.width <= _t.SCREEN) {
      if (!e)
        throw new Error(
          "Can not generate Render Texture with a dynamic width or height when the WebGLRenderer is not available"
        );
      t = n[0] / -this.width;
    } else t = this.width;
    if (this.height <= _t.SCREEN) {
      if (!e)
        throw new Error(
          "Can not generate Render Texture with a dynamic width or height when the WebGLRenderer is not available"
        );
      i = n[1] / -this.width;
    } else i = this.height;
    this.colorBuffer = new Et({
      internalFormat: f.RenderTarget.ColorBufferFormat.RGBA8,
      size: [t, i],
      ...this.colorBufferSettings
    });
  }
}
class mn {
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
class pd extends mn {
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
  request(e, t, i) {
    return [0, 0, 0, 0];
  }
  updateResource(e) {
  }
}
const gd = new pd();
class md extends mn {
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
    t = new Ho(e, this.webGLRenderer), this.resources.set(e.key, t);
  }
  /**
   * Handle requests that stream in from instances requesting metrics for a
   * specific resource.
   */
  request(e, t, i, n) {
    const s = this.resources.get(i.key);
    return s ? (i.colorBuffer = s.colorBuffer, [0, 0, 1, 1]) : [0, 0, 0, 0];
  }
  /**
   * Trigger that executes when the rendering context resizes. For this manager,
   * we will update all textures with dimensions that are tied to the screen.
   */
  resize() {
    const e = /* @__PURE__ */ new Map();
    this.resources.forEach((t, i) => {
      t.width > _t.SCREEN && t.height > _t.SCREEN || (t.colorBuffer.destroy(), t = new Ho(t, this.webGLRenderer), e.set(i, t));
    }), e.forEach((t, i) => this.resources.set(i, t));
  }
  /**
   * This targets the specified resource and attempts to update it's settings.
   */
  updateResource(e) {
    this.resources.get(e.key) && console.warn("UPDATING AN EXISTING COLOR BUFFER IS NOT SUPPORTED YET");
  }
}
function ia(r) {
  return {
    type: ce.COLOR_BUFFER,
    ...r
  };
}
function au(r) {
  return {
    key: "",
    type: ce.TEXTURE,
    ...r
  };
}
function Ur(r) {
  return r && r.key !== void 0 && r.type === ce.TEXTURE;
}
class Ps extends mi {
  constructor(e, t) {
    super(e), this.type = ce.TEXTURE, this.height = e.height, this.width = e.width, this.textureSettings = e.textureSettings, this.createTexture(t);
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
    var s;
    if (this.texture) return;
    this.textureSettings = {
      generateMipMaps: !0,
      premultiplyAlpha: !1,
      ...this.textureSettings
    };
    let t, i;
    const n = (e == null ? void 0 : e.getRenderSize()) || [1, 1];
    if (this.width <= _t.SCREEN) {
      if (!e)
        throw new Error(
          "Can not generate Render Texture with a dynamic width or height when the WebGLRenderer is not available"
        );
      t = n[0] / -this.width;
    } else t = this.width;
    if (this.height <= _t.SCREEN) {
      if (!e)
        throw new Error(
          "Can not generate Render Texture with a dynamic width or height when the WebGLRenderer is not available"
        );
      i = n[1] / -this.width;
    } else i = this.height;
    this.texture = new j({
      data: ((s = this.textureSettings) == null ? void 0 : s.data) || {
        width: t,
        height: i,
        buffer: null
      },
      ...this.textureSettings
    });
  }
}
function cn(r) {
  return {
    type: ce.TEXTURE,
    ...r
  };
}
const { min: xd, max: Td, pow: Xo, round: bd, sin: qi, PI: Fi } = Math, xn = bd(Fi * 1e3) / 1e3;
function q(r, e, t) {
  return xd(Td(r, e), t);
}
var tr = /* @__PURE__ */ ((r) => (r[r.NONE = 1] = "NONE", r[r.CONTINUOUS = 4] = "CONTINUOUS", r[r.REPEAT = 2] = "REPEAT", r[r.REFLECT = 3] = "REFLECT", r))(tr || {});
const vd = `
\${easingMethod} {
  return end;
}
`, wd = `
\${easingMethod} {
  return (end - start) * t + start;
}
`, Ed = `
\${easingMethod} {
  float time = t * t;
  return (end - start) * time + start;
}
`, yd = `
\${easingMethod} {
  float time = t * (2.0 - t);
  return (end - start) * time + start;
}
`, Rd = `
\${easingMethod} {
  float time = t < 0.5 ? 2.0 * t * t : -1.0 + (4.0 - 2.0 * t) * t;
  return (end - start) * time + start;
}
`, _d = `
\${easingMethod} {
  float time = t * t * t;
  return (end - start) * time + start;
}
`, Ad = `
\${easingMethod} {
  float t1 = t - 1.0;
  float time = t1 * t1 * t1 + 1.0;
  return (end - start) * time + start;
}
`, Md = `
\${easingMethod} {
  float time = t < 0.5 ? 4.0 * t * t * t : (t - 1.0) * (2.0 * t - 2.0) * (2.0 * t - 2.0) + 1.0;
  return (end - start) * time + start;
}
`, Id = `
\${easingMethod} {
  float time = t * t * t * t;
  return (end - start) * time + start;
}
`, Sd = `
\${easingMethod} {
  float t1 = t - 1.0;
  float time = 1.0 - t1 * t1 * t1 * t1;
  return (end - start) * time + start;
}
`, Cd = `
\${easingMethod} {
  float t1 = t - 1.0;
  float time = t < 0.5 ? 8.0 * t * t * t * t : 1.0 - 8.0 * t1 * t1 * t1 * t1;
  return (end - start) * time + start;
}
`, Nd = `
\${easingMethod} {
  float time = t * t * t * t * t;
  return (end - start) * time + start;
}
`, Od = `
\${easingMethod} {
  float t1 = t - 1.0;
  float time = 1.0 + t1 * t1 * t1 * t1 * t1;
  return (end - start) * time + start;
}
`, Ld = `
\${easingMethod} {
  float t1 = t - 1.0;
  float time = t < 0.5 ? 16.0 * t * t * t * t * t : 1.0 + 16.0 * t1 * t1 * t1 * t1 * t1;
  return (end - start) * time + start;
}
`, Fd = `
\${easingMethod} {
  float p = 0.3;
  float time = pow(2.0, -10.0 * t) * sin((t - p / 4.0) * (2.0 * ${xn}) / p) + 1.0;
  return (end - start) * time + start;
}
`, Bd = `
\${easingMethod} {
  float time = t * t * t - t * 1.05 * sin(t * ${xn});
  return (end - start) * time + start;
}
`, Pd = `
\${easingMethod} {
  float t1 = t - 1.0;
  float a = 1.7;
  float time = (t1 * t1 * ((a + 1.0) * t1 + a) + 1.0);
  return (end - start) * time + start;
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

  return (end - start) * time + start;
}
`, Ud = `
\${easingMethod} {
  \${T} direction = end - start;
  return start + direction * 0.5 + direction * sin(t * ${xn} * 2.0) * 0.5;
}
`, kd = `
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
`, Gd = `
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
`, zd = `
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
`, Vd = `
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
`, $d = `
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
`, Wd = `
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
`, jd = `
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
`, Hd = `
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
`, Xd = `
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
`, Qd = `
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
`, Yd = `
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
`, qd = `
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
`, Kd = `
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
`, Zd = `
\${easingMethod} {
  float p = 0.3;
  float time = pow(2.0, -10.0 * t) * sin((t - p / 4.0) * (2.0 * ${xn}) / p) + 1.0;
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
`, Jd = `
\${easingMethod} {
  float time = t * t * t - t * 1.05 * sin(t * ${xn});
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
`, ef = `
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
`, tf = `
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
class eo {
  constructor(e, t, i, n) {
    this.uid = P(), this.delay = 0, this.duration = 500, this.loop = 1, this.cpu = e, this.gpu = t, this.duration = i || 500, this.methodName = n || "easingMethod";
  }
  /**
   * Autoeasing methods for linear easing
   */
  static immediate(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        const { copy: c } = D(n);
        return c(s, o);
      },
      delay: t,
      duration: e,
      gpu: vd,
      loop: i,
      methodName: "immediate"
    };
  }
  /**
   * Autoeasing methods for linear easing
   */
  static linear(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        const { add: c, scale: l, subtract: u } = D(n);
        return a = q(a, 0, 1), c(l(u(s, n), a), n, o);
      },
      delay: t,
      duration: e,
      gpu: wd,
      loop: i,
      methodName: "linear"
    };
  }
  /**
   * Auto easing for Accelerating to end
   */
  static easeInQuad(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        a = q(a, 0, 1);
        const c = a * a, { add: l, scale: u, subtract: h } = D(n);
        return l(u(h(s, n), c), n, o);
      },
      delay: t,
      duration: e,
      gpu: Ed,
      loop: i,
      methodName: "easeInQuad"
    };
  }
  /**
   * Auto easing for decelerating to end
   */
  static easeOutQuad(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        a = q(a, 0, 1);
        const c = a * (2 - a), { add: l, scale: u, subtract: h } = D(n);
        return l(u(h(s, n), c), n, o);
      },
      delay: t,
      duration: e,
      gpu: yd,
      loop: i,
      methodName: "easeOutQuad"
    };
  }
  /**
   * Auto easing for Accelerate to mid, then decelerate to end
   */
  static easeInOutQuad(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        a = q(a, 0, 1);
        const c = a < 0.5 ? 2 * a * a : -1 + (4 - 2 * a) * a, { add: l, scale: u, subtract: h } = D(n);
        return l(u(h(s, n), c), n, o);
      },
      delay: t,
      duration: e,
      gpu: Rd,
      loop: i,
      methodName: "easeInOutQuad"
    };
  }
  /**
   * Auto easing for Slower acceleration
   */
  static easeInCubic(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        a = q(a, 0, 1);
        const c = a * a * a, { add: l, scale: u, subtract: h } = D(n);
        return l(u(h(s, n), c), n, o);
      },
      delay: t,
      duration: e,
      gpu: _d,
      loop: i,
      methodName: "easeInCubic"
    };
  }
  /**
   * Auto easing for Slower deceleration
   */
  static easeOutCubic(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        a = q(a, 0, 1);
        const c = --a * a * a + 1, { add: l, scale: u, subtract: h } = D(n);
        return l(u(h(s, n), c), n, o);
      },
      delay: t,
      duration: e,
      gpu: Ad,
      loop: i,
      methodName: "easeOutCubic"
    };
  }
  /**
   * Auto easing for Slower acceleration to mid, and slower deceleration to end
   */
  static easeInOutCubic(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        a = q(a, 0, 1);
        const c = a < 0.5 ? 4 * a * a * a : (a - 1) * (2 * a - 2) * (2 * a - 2) + 1, { add: l, scale: u, subtract: h } = D(n);
        return l(u(h(s, n), c), n, o);
      },
      delay: t,
      duration: e,
      gpu: Md,
      loop: i,
      methodName: "easeInOutCubic"
    };
  }
  /**
   * Auto easing for even Slower acceleration to end
   */
  static easeInQuart(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        a = q(a, 0, 1);
        const c = a * a * a * a, { add: l, scale: u, subtract: h } = D(n);
        return l(u(h(s, n), c), n, o);
      },
      delay: t,
      duration: e,
      gpu: Id,
      loop: i,
      methodName: "easeInQuart"
    };
  }
  /**
   * Auto easing for even Slower deceleration to end
   */
  static easeOutQuart(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        a = q(a, 0, 1);
        const c = 1 - --a * a * a * a, { add: l, scale: u, subtract: h } = D(n);
        return l(u(h(s, n), c), n, o);
      },
      delay: t,
      duration: e,
      gpu: Sd,
      loop: i,
      methodName: "easeOutQuart"
    };
  }
  /**
   * Auto easing for even Slower acceleration to mid, and even slower deceleration to end
   */
  static easeInOutQuart(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        a = q(a, 0, 1);
        const c = a < 0.5 ? 8 * a * a * a * a : 1 - 8 * --a * a * a * a, { add: l, scale: u, subtract: h } = D(n);
        return l(u(h(s, n), c), n, o);
      },
      delay: t,
      duration: e,
      gpu: Cd,
      loop: i,
      methodName: "easeInOutQuart"
    };
  }
  /**
   * Auto easing for super slow accelerating to the end
   */
  static easeInQuint(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        a = q(a, 0, 1);
        const c = a * a * a * a * a, { add: l, scale: u, subtract: h } = D(n);
        return l(u(h(s, n), c), n, o);
      },
      delay: t,
      duration: e,
      gpu: Nd,
      loop: i,
      methodName: "easeInQuint"
    };
  }
  /**
   * Auto easing for super slow decelerating to the end
   */
  static easeOutQuint(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        a = q(a, 0, 1);
        const c = 1 + --a * a * a * a * a, { add: l, scale: u, subtract: h } = D(n);
        return l(u(h(s, n), c), n, o);
      },
      delay: t,
      duration: e,
      gpu: Od,
      loop: i,
      methodName: "easeOutQuint"
    };
  }
  /**
   * Auto easing for super slow accelerating to mid and super slow decelerating to the end
   */
  static easeInOutQuint(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        a = q(a, 0, 1);
        const c = a < 0.5 ? 16 * a * a * a * a * a : 1 + 16 * --a * a * a * a * a, { add: l, scale: u, subtract: h } = D(n);
        return l(u(h(s, n), c), n, o);
      },
      delay: t,
      duration: e,
      gpu: Ld,
      loop: i,
      methodName: "easeInOutQuint"
    };
  }
  /**
   * Auto easing for elastic effect
   */
  static easeOutElastic(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        a = q(a, 0, 1);
        const c = 0.3, l = Xo(2, -10 * a) * qi((a - c / 4) * (2 * Fi) / c) + 1, { add: u, scale: h, subtract: d } = D(n);
        return u(h(d(s, n), l), n, o);
      },
      delay: t,
      duration: e,
      gpu: Fd,
      loop: i,
      methodName: "easeOutElastic"
    };
  }
  /**
   * Auto easing for retracting first then shooting to the end
   */
  static easeBackIn(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        a = q(a, 0, 1);
        const l = a * a * a - a * 1.05 * qi(a * Fi), { add: u, scale: h, subtract: d } = D(n);
        return u(h(d(s, n), l), n, o);
      },
      delay: t,
      duration: e,
      gpu: Bd,
      loop: i,
      methodName: "easeBackIn"
    };
  }
  /**
   * Auto easing for overshooting at the end
   */
  static easeBackOut(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        a = q(a, 0, 1);
        const c = 1.7, l = a - 1, u = l * l * ((c + 1) * l + c) + 1, { add: h, scale: d, subtract: p } = D(n);
        return h(d(p(s, n), u), n, o);
      },
      delay: t,
      duration: e,
      gpu: Pd,
      loop: i,
      methodName: "easeBackOut"
    };
  }
  /**
   * Auto easing for overshooting at the end
   */
  static easeBackInOut(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        a = q(a, 0, 1);
        const l = 1.7 * 1.525, u = a / 0.5, h = u - 2, d = u < 1 ? 0.5 * (u * u * (l + 1) * u - l) : 0.5 * (h * h * ((l + 1) * h + l) + 2), { add: p, scale: g, subtract: m } = D(n);
        return p(g(m(s, n), d), n, o);
      },
      delay: t,
      duration: e,
      gpu: Dd,
      loop: i,
      methodName: "easeBackInOut"
    };
  }
  /**
   * This is an easing method that performs a sinusoidal wave where the amplitude is
   * (start - end) * 2 and the wave starts at the start value.
   *
   * This is intended to work best with the CONTINUOUS loop style.
   */
  static continuousSinusoidal(e, t = 0, i = 4) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        const { add: c, scale: l, subtract: u } = D(n);
        a = q(a, 0, 1);
        const h = u(s, n), d = l(h, 0.5);
        return c(
          c(n, d),
          l(d, qi(a * Fi * 2) * 1),
          o
        );
      },
      delay: t,
      duration: e,
      gpu: Ud,
      loop: i,
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
  static slerpQuatLinear(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        if (!G(n) || !G(s) || !G(o)) {
          const { vec: u } = D(s);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), u(1, 0, 0, 0);
        }
        a = q(a, 0, 1);
        const { slerpQuat: c, vec: l } = D(n);
        return c ? c(n, s, a, o) : l(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: kd,
      loop: i,
      methodName: "slerpQuatLinear"
    };
  }
  static slerpQuatInQuad(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        if (!G(n) || !G(s) || !G(o)) {
          const { vec: h } = D(s);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), h(1, 0, 0, 0);
        }
        a = q(a, 0, 1);
        const c = a * a, { slerpQuat: l, vec: u } = D(n);
        return l ? l(n, s, c, o) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Gd,
      loop: i,
      methodName: "slerpQuatInQuad"
    };
  }
  static slerpQuatOutQuad(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        if (!G(n) || !G(s) || !G(o)) {
          const { vec: h } = D(s);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), h(1, 0, 0, 0);
        }
        a = q(a, 0, 1);
        const c = a * (2 - a), { slerpQuat: l, vec: u } = D(n);
        return l ? l(n, s, c, o) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: zd,
      loop: i,
      methodName: "slerpQuatOutQuad"
    };
  }
  static slerpQuatInOutQuad(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        if (!G(n) || !G(s) || !G(o)) {
          const { vec: h } = D(s);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), h(1, 0, 0, 0);
        }
        a = q(a, 0, 1);
        const c = a < 0.5 ? 2 * a * a : -1 + (4 - 2 * a) * a, { slerpQuat: l, vec: u } = D(n);
        return l ? l(n, s, c, o) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Vd,
      loop: i,
      methodName: "slerpQuatInOutQuad"
    };
  }
  static slerpQuatInCubic(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        if (!G(n) || !G(s) || !G(o)) {
          const { vec: h } = D(s);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), h(1, 0, 0, 0);
        }
        a = q(a, 0, 1);
        const c = a * a * a, { slerpQuat: l, vec: u } = D(n);
        return l ? l(n, s, c, o) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: $d,
      loop: i,
      methodName: "slerpQuatInCubic"
    };
  }
  static slerpQuatOutCubic(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        if (!G(n) || !G(s) || !G(o)) {
          const { vec: h } = D(s);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), h(1, 0, 0, 0);
        }
        a = q(a, 0, 1);
        const c = --a * a * a + 1, { slerpQuat: l, vec: u } = D(n);
        return l ? l(n, s, c, o) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Wd,
      loop: i,
      methodName: "slerpQuatOutCubic"
    };
  }
  static slerpQuatInOutCubic(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        if (!G(n) || !G(s) || !G(o)) {
          const { vec: h } = D(s);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), h(1, 0, 0, 0);
        }
        a = q(a, 0, 1);
        const c = a < 0.5 ? 4 * a * a * a : (a - 1) * (2 * a - 2) * (2 * a - 2) + 1, { slerpQuat: l, vec: u } = D(n);
        return l ? l(n, s, c, o) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: jd,
      loop: i,
      methodName: "slerpQuatInOutCubic"
    };
  }
  static slerpQuatInQuart(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        if (!G(n) || !G(s) || !G(o)) {
          const { vec: h } = D(s);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), h(1, 0, 0, 0);
        }
        a = q(a, 0, 1);
        const c = a * a * a * a, { slerpQuat: l, vec: u } = D(n);
        return l ? l(n, s, c, o) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Hd,
      loop: i,
      methodName: "slerpQuatInQuart"
    };
  }
  static slerpQuatOutQuart(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        if (!G(n) || !G(s) || !G(o)) {
          const { vec: h } = D(s);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), h(1, 0, 0, 0);
        }
        a = q(a, 0, 1);
        const c = 1 - --a * a * a * a, { slerpQuat: l, vec: u } = D(n);
        return l ? l(n, s, c, o) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Xd,
      loop: i,
      methodName: "slerpQuatOutQuart"
    };
  }
  static slerpQuatInOutQuart(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        if (!G(n) || !G(s) || !G(o)) {
          const { vec: h } = D(s);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), h(1, 0, 0, 0);
        }
        a = q(a, 0, 1);
        const c = a < 0.5 ? 8 * a * a * a * a : 1 - 8 * --a * a * a * a, { slerpQuat: l, vec: u } = D(n);
        return l ? l(n, s, c, o) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Qd,
      loop: i,
      methodName: "slerpQuatInOutQuart"
    };
  }
  static slerpQuatInQuint(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        if (!G(n) || !G(s) || !G(o)) {
          const { vec: h } = D(s);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), h(1, 0, 0, 0);
        }
        a = q(a, 0, 1);
        const c = a * a * a * a * a, { slerpQuat: l, vec: u } = D(n);
        return l ? l(n, s, c, o) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Yd,
      loop: i,
      methodName: "slerpQuatInQuint"
    };
  }
  static slerpQuatOutQuint(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        if (!G(n) || !G(s) || !G(o)) {
          const { vec: h } = D(s);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), h(1, 0, 0, 0);
        }
        a = q(a, 0, 1);
        const c = 1 + --a * a * a * a * a, { slerpQuat: l, vec: u } = D(n);
        return l ? l(n, s, c, o) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: qd,
      loop: i,
      methodName: "slerpQuatOutQuint"
    };
  }
  static slerpQuatInOutQuint(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        if (!G(n) || !G(s) || !G(o)) {
          const { vec: h } = D(s);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), h(1, 0, 0, 0);
        }
        a = q(a, 0, 1);
        const c = a < 0.5 ? 16 * a * a * a * a * a : 1 + 16 * --a * a * a * a * a, { slerpQuat: l, vec: u } = D(n);
        return l ? l(n, s, c, o) : u(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Kd,
      loop: i,
      methodName: "slerpQuatInOutQuint"
    };
  }
  static slerpQuatOutElastic(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        if (!G(n) || !G(s) || !G(o)) {
          const { vec: d } = D(s);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), d(1, 0, 0, 0);
        }
        a = q(a, 0, 1);
        const c = 0.3, l = Xo(2, -10 * a) * qi((a - c / 4) * (2 * Fi) / c) + 1, { slerpQuat: u, vec: h } = D(n);
        return u ? u(n, s, l, o) : h(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Zd,
      loop: i,
      methodName: "slerpQuatOutElastic"
    };
  }
  static slerpQuatBackIn(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        if (!G(n) || !G(s) || !G(o)) {
          const { vec: d } = D(s);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), d(1, 0, 0, 0);
        }
        a = q(a, 0, 1);
        const l = a * a * a - a * 1.05 * qi(a * Fi), { slerpQuat: u, vec: h } = D(n);
        return u ? u(n, s, l, o) : h(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: Jd,
      loop: i,
      methodName: "slerpQuatBackIn"
    };
  }
  static slerpQuatBackOut(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        if (!G(n) || !G(s) || !G(o)) {
          const { vec: p } = D(s);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), p(1, 0, 0, 0);
        }
        a = q(a, 0, 1);
        const c = 1.7, l = a - 1, u = l * l * ((c + 1) * l + c) + 1, { slerpQuat: h, vec: d } = D(n);
        return h ? h(n, s, u, o) : d(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: ef,
      loop: i,
      methodName: "slerpQuatBackOut"
    };
  }
  static slerpQuatBackInOut(e, t = 0, i = 1) {
    return {
      uid: P(),
      cpu: (n, s, a, o) => {
        if (!G(n) || !G(s) || !G(o)) {
          const { vec: m } = D(s);
          return console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          ), m(1, 0, 0, 0);
        }
        a = q(a, 0, 1);
        const l = 1.7 * 1.525, u = a / 0.5, h = u - 2, d = u < 1 ? 0.5 * (u * u * (l + 1) * u - l) : 0.5 * (h * h * ((l + 1) * h + l) + 2), { slerpQuat: p, vec: g } = D(n);
        return p ? p(n, s, d, o) : g(1, 0, 0, 0);
      },
      delay: t,
      duration: e,
      gpu: tf,
      loop: i,
      methodName: "slerpQuatBackInOut"
    };
  }
}
const { cos: ft, sin: pt, tan: Ht } = Math, vt = Math.PI / 2, ai = 0, oi = 1, ci = 2, li = 3, bs = 0, vs = 1, ws = 2, Es = 3, ys = 4, Rs = 5, _s = 6, As = 7, Ms = 8, hr = 0, dr = 1, fr = 2, pr = 3, gr = 4, mr = 5, xr = 6, Tr = 7, br = 8, vr = 9, wr = 10, Er = 11, yr = 12, Rr = 13, _r = 14, Ar = 15, Bi = new Array(20).fill(0).map((r) => Mr()), Ge = new Array(20).fill(0).map((r) => se());
function Mt(r, e, t, i, n) {
  return r = r || new Array(4), r[0] = e, r[1] = t, r[2] = i, r[3] = n, r;
}
function st(r, e, t, i, n, s, a, o, c, l) {
  return r = r || new Array(9), r[0] = e, r[1] = t, r[2] = i, r[3] = n, r[4] = s, r[5] = a, r[6] = o, r[7] = c, r[8] = l, r;
}
function Te(r, e, t, i, n, s, a, o, c, l, u, h, d, p, g, m, T) {
  return r = r || new Array(16), r[0] = e, r[1] = t, r[2] = i, r[3] = n, r[4] = s, r[5] = a, r[6] = o, r[7] = c, r[8] = l, r[9] = u, r[10] = h, r[11] = d, r[12] = p, r[13] = g, r[14] = m, r[15] = T, r;
}
const Qo = Mr(), Yo = Mr(), Ds = Mr(), rf = Mr();
function ge(r) {
  return r[3] * r[0] - r[1] * r[2];
}
function Di(r) {
  return r[0] * r[4] * r[8] - r[0] * r[5] * r[7] + r[1] * r[5] * r[6] - r[1] * r[3] * r[8] + r[2] * r[3] * r[7] - r[2] * r[4] * r[6];
}
function ou(r) {
  return st(
    Qo,
    r[5],
    r[6],
    r[7],
    r[9],
    r[10],
    r[11],
    r[13],
    r[14],
    r[15]
  ), st(
    Yo,
    r[4],
    r[6],
    r[7],
    r[8],
    r[10],
    r[11],
    r[12],
    r[14],
    r[15]
  ), st(
    Ds,
    r[4],
    r[5],
    r[7],
    r[8],
    r[9],
    r[11],
    r[12],
    r[13],
    r[15]
  ), st(
    Ds,
    r[4],
    r[5],
    r[6],
    r[8],
    r[9],
    r[10],
    r[12],
    r[13],
    r[14]
  ), r[0] * Di(Qo) - r[1] * Di(Yo) + r[2] * Di(Ds) - r[3] * Di(rf);
}
function nf(r, e) {
  const t = ge(r);
  return t === 0 ? null : Mt(
    e,
    r[3] / t,
    -r[1] / t,
    -r[2] / t,
    r[0] / t
  );
}
function sf(r, e) {
  const t = Di(r);
  if (t === 0) return null;
  const i = ge([r[4], r[5], r[7], r[8]]), n = ge([r[3], r[5], r[6], r[8]]), s = ge([r[3], r[4], r[6], r[7]]), a = ge([r[1], r[2], r[7], r[8]]), o = ge([r[0], r[2], r[6], r[8]]), c = ge([r[0], r[1], r[6], r[7]]), l = ge([r[1], r[2], r[4], r[5]]), u = ge([r[0], r[2], r[3], r[5]]), h = ge([r[0], r[1], r[3], r[4]]);
  return st(
    e,
    i / t,
    -a / t,
    l / t,
    -n / t,
    o / t,
    u / t,
    s / t,
    -c / t,
    h / t
  );
}
function af(r, e) {
  const t = ou(r);
  if (t === 0) return null;
  const i = ge([r[0], r[1], r[4], r[5]]), n = ge([r[0], r[2], r[4], r[6]]), s = ge([r[0], r[3], r[4], r[7]]), a = ge([r[1], r[2], r[5], r[6]]), o = ge([r[1], r[3], r[5], r[7]]), c = ge([r[2], r[3], r[6], r[7]]), l = ge([r[10], r[11], r[14], r[15]]), u = ge([r[9], r[11], r[13], r[15]]), h = ge([r[9], r[10], r[13], r[14]]), d = ge([r[8], r[11], r[12], r[15]]), p = ge([r[8], r[10], r[12], r[14]]), g = ge([r[8], r[9], r[12], r[13]]);
  return Te(
    e,
    //                                                     |                                                        |                                                           |
    (r[5] * l - r[6] * u + r[7] * h) / t,
    (-r[1] * l + r[2] * u - r[3] * h) / t,
    (r[12] * c - r[13] * o + r[14] * a) / t,
    (-r[9] * c + r[10] * o - r[11] * a) / t,
    (-r[4] * l + r[6] * d - r[7] * p) / t,
    (r[0] * l - r[2] * d + r[3] * p) / t,
    (-r[12] * c + r[14] * s - r[15] * n) / t,
    (r[8] * c - r[10] * s + r[11] * n) / t,
    (r[4] * u - r[5] * d + r[7] * g) / t,
    (-r[0] * u + r[1] * d - r[3] * g) / t,
    (r[12] * o - r[13] * s + r[15] * i) / t,
    (-r[8] * o + r[9] * s - r[11] * i) / t,
    (-r[4] * h + r[5] * p - r[6] * g) / t,
    (r[0] * h - r[1] * p + r[2] * g) / t,
    (-r[12] * a + r[13] * n - r[14] * i) / t,
    (r[8] * a - r[9] * n + r[10] * i) / t
  );
}
function to(r, e) {
  const t = e ?? new Array(16);
  t[0] = r[5] * r[10] * r[15] - r[5] * r[11] * r[14] - r[9] * r[6] * r[15] + r[9] * r[7] * r[14] + r[13] * r[6] * r[11] - r[13] * r[7] * r[10], t[4] = -r[4] * r[10] * r[15] + r[4] * r[11] * r[14] + r[8] * r[6] * r[15] - r[8] * r[7] * r[14] - r[12] * r[6] * r[11] + r[12] * r[7] * r[10], t[8] = r[4] * r[9] * r[15] - r[4] * r[11] * r[13] - r[8] * r[5] * r[15] + r[8] * r[7] * r[13] + r[12] * r[5] * r[11] - r[12] * r[7] * r[9], t[12] = -r[4] * r[9] * r[14] + r[4] * r[10] * r[13] + r[8] * r[5] * r[14] - r[8] * r[6] * r[13] - r[12] * r[5] * r[10] + r[12] * r[6] * r[9], t[1] = -r[1] * r[10] * r[15] + r[1] * r[11] * r[14] + r[9] * r[2] * r[15] - r[9] * r[3] * r[14] - r[13] * r[2] * r[11] + r[13] * r[3] * r[10], t[5] = r[0] * r[10] * r[15] - r[0] * r[11] * r[14] - r[8] * r[2] * r[15] + r[8] * r[3] * r[14] + r[12] * r[2] * r[11] - r[12] * r[3] * r[10], t[9] = -r[0] * r[9] * r[15] + r[0] * r[11] * r[13] + r[8] * r[1] * r[15] - r[8] * r[3] * r[13] - r[12] * r[1] * r[11] + r[12] * r[3] * r[9], t[13] = r[0] * r[9] * r[14] - r[0] * r[10] * r[13] - r[8] * r[1] * r[14] + r[8] * r[2] * r[13] + r[12] * r[1] * r[10] - r[12] * r[2] * r[9], t[2] = r[1] * r[6] * r[15] - r[1] * r[7] * r[14] - r[5] * r[2] * r[15] + r[5] * r[3] * r[14] + r[13] * r[2] * r[7] - r[13] * r[3] * r[6], t[6] = -r[0] * r[6] * r[15] + r[0] * r[7] * r[14] + r[4] * r[2] * r[15] - r[4] * r[3] * r[14] - r[12] * r[2] * r[7] + r[12] * r[3] * r[6], t[10] = r[0] * r[5] * r[15] - r[0] * r[7] * r[13] - r[4] * r[1] * r[15] + r[4] * r[3] * r[13] + r[12] * r[1] * r[7] - r[12] * r[3] * r[5], t[14] = -r[0] * r[5] * r[14] + r[0] * r[6] * r[13] + r[4] * r[1] * r[14] - r[4] * r[2] * r[13] - r[12] * r[1] * r[6] + r[12] * r[2] * r[5], t[3] = -r[1] * r[6] * r[11] + r[1] * r[7] * r[10] + r[5] * r[2] * r[11] - r[5] * r[3] * r[10] - r[9] * r[2] * r[7] + r[9] * r[3] * r[6], t[7] = r[0] * r[6] * r[11] - r[0] * r[7] * r[10] - r[4] * r[2] * r[11] + r[4] * r[3] * r[10] + r[8] * r[2] * r[7] - r[8] * r[3] * r[6], t[11] = -r[0] * r[5] * r[11] + r[0] * r[7] * r[9] + r[4] * r[1] * r[11] - r[4] * r[3] * r[9] - r[8] * r[1] * r[7] + r[8] * r[3] * r[5], t[15] = r[0] * r[5] * r[10] - r[0] * r[6] * r[9] - r[4] * r[1] * r[10] + r[4] * r[2] * r[9] + r[8] * r[1] * r[6] - r[8] * r[2] * r[5];
  let i = r[0] * t[0] + r[1] * t[4] + r[2] * t[8] + r[3] * t[12];
  if (i === 0)
    return console.warn("Matrix is singular and cannot be inverted"), null;
  i = 1 / i;
  for (let n = 0; n < 16; n++) t[n] *= i;
  if (e) {
    for (let n = 0; n < 16; n++) e[n] = t[n];
    return e;
  }
  return t;
}
function of(r, e, t) {
  return Mt(
    t,
    r[0] * e,
    r[1] * e,
    r[2] * e,
    r[3] * e
  );
}
function cf(r, e, t) {
  return st(
    t,
    r[0] * e,
    r[1] * e,
    r[2] * e,
    r[3] * e,
    r[4] * e,
    r[5] * e,
    r[6] * e,
    r[7] * e,
    r[8] * e
  );
}
function lf(r, e, t) {
  return Te(
    t,
    r[0] * e,
    r[1] * e,
    r[2] * e,
    r[3] * e,
    r[4] * e,
    r[5] * e,
    r[6] * e,
    r[7] * e,
    r[8] * e,
    r[9] * e,
    r[10] * e,
    r[11] * e,
    r[12] * e,
    r[13] * e,
    r[14] * e,
    r[15] * e
  );
}
function Is(r) {
  return Mt(
    r,
    1,
    0,
    0,
    1
  );
}
function Mr(r) {
  return st(
    r,
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
function se(r) {
  return Te(
    r,
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
function uf(r, e, t) {
  return Mt(
    t,
    e[ai] * r[ai] + e[oi] * r[ci],
    e[ai] * r[oi] + e[oi] * r[li],
    e[ci] * r[ai] + e[li] * r[ci],
    e[ci] * r[oi] + e[li] * r[li]
  );
}
function hf(r, e, t) {
  return st(
    t,
    e[0] * r[0] + e[1] * r[3] + e[2] * r[6],
    e[0] * r[1] + e[1] * r[4] + e[2] * r[7],
    e[0] * r[2] + e[1] * r[5] + e[2] * r[8],
    e[3] * r[0] + e[4] * r[3] + e[5] * r[6],
    e[3] * r[1] + e[4] * r[4] + e[5] * r[7],
    e[3] * r[2] + e[4] * r[5] + e[5] * r[8],
    e[6] * r[0] + e[7] * r[3] + e[8] * r[6],
    e[6] * r[1] + e[7] * r[4] + e[8] * r[7],
    e[6] * r[2] + e[7] * r[5] + e[8] * r[8]
  );
}
function bt(r, e, t) {
  return t = t || [], t[0] = e[0] * r[0] + e[1] * r[4] + e[2] * r[8] + e[3] * r[12], t[1] = e[0] * r[1] + e[1] * r[5] + e[2] * r[9] + e[3] * r[13], t[2] = e[0] * r[2] + e[1] * r[6] + e[2] * r[10] + e[3] * r[14], t[3] = e[0] * r[3] + e[1] * r[7] + e[2] * r[11] + e[3] * r[15], t[4] = e[4] * r[0] + e[5] * r[4] + e[6] * r[8] + e[7] * r[12], t[5] = e[4] * r[1] + e[5] * r[5] + e[6] * r[9] + e[7] * r[13], t[6] = e[4] * r[2] + e[5] * r[6] + e[6] * r[10] + e[7] * r[14], t[7] = e[4] * r[3] + e[5] * r[7] + e[6] * r[11] + e[7] * r[15], t[8] = e[8] * r[0] + e[9] * r[4] + e[10] * r[8] + e[11] * r[12], t[9] = e[8] * r[1] + e[9] * r[5] + e[10] * r[9] + e[11] * r[13], t[10] = e[8] * r[2] + e[9] * r[6] + e[10] * r[10] + e[11] * r[14], t[11] = e[8] * r[3] + e[9] * r[7] + e[10] * r[11] + e[11] * r[15], t[12] = e[12] * r[0] + e[13] * r[4] + e[14] * r[8] + e[15] * r[12], t[13] = e[12] * r[1] + e[13] * r[5] + e[14] * r[9] + e[15] * r[13], t[14] = e[12] * r[2] + e[13] * r[6] + e[14] * r[10] + e[15] * r[14], t[15] = e[12] * r[3] + e[13] * r[7] + e[14] * r[11] + e[15] * r[15], t;
}
function df(r, ...e) {
  if (e.length <= 0) return se();
  if (r = r || se(), e.length === 1) return dn(e[0], r);
  let t = e[0], i = Ge[Ge.length - 1], n = Ge[Ge.length - 2];
  r === i && (i = Ge[Ge.length - 3]), r === n && (n = Ge[Ge.length - 3]);
  let s = i;
  for (let a = 1, o = e.length - 1; a < o; ++a) {
    const c = e[a];
    t = bt(t, c, s), s = s === i ? n : i;
  }
  return bt(t, e[e.length - 1], r);
}
function ff(r, e, t) {
  return Mt(
    t,
    r[0] + e[0],
    r[1] + e[1],
    r[2] + e[2],
    r[3] + e[3]
  );
}
function pf(r, e, t) {
  return st(
    t,
    r[0] + e[0],
    r[1] + e[1],
    r[2] + e[2],
    r[3] + e[3],
    r[4] + e[4],
    r[5] + e[5],
    r[6] + e[6],
    r[7] + e[7],
    r[8] + e[8]
  );
}
function gf(r, e, t) {
  return Te(
    t,
    r[0] + e[0],
    r[1] + e[1],
    r[2] + e[2],
    r[3] + e[3],
    r[4] + e[4],
    r[5] + e[5],
    r[6] + e[6],
    r[7] + e[7],
    r[8] + e[8],
    r[9] + e[9],
    r[10] + e[10],
    r[11] + e[11],
    r[12] + e[12],
    r[13] + e[13],
    r[14] + e[14],
    r[15] + e[15]
  );
}
function mf(r, e, t) {
  return Mt(
    t,
    r[0] - e[0],
    r[1] - e[1],
    r[2] - e[2],
    r[3] - e[3]
  );
}
function xf(r, e, t) {
  return st(
    t,
    r[0] - e[0],
    r[1] - e[1],
    r[2] - e[2],
    r[3] - e[3],
    r[4] - e[4],
    r[5] - e[5],
    r[6] - e[6],
    r[7] - e[7],
    r[8] - e[8]
  );
}
function Tf(r, e, t) {
  return Te(
    t,
    r[0] - e[0],
    r[1] - e[1],
    r[2] - e[2],
    r[3] - e[3],
    r[4] - e[4],
    r[5] - e[5],
    r[6] - e[6],
    r[7] - e[7],
    r[8] - e[8],
    r[9] - e[9],
    r[10] - e[10],
    r[11] - e[11],
    r[12] - e[12],
    r[13] - e[13],
    r[14] - e[14],
    r[15] - e[15]
  );
}
function bf(r, e, t) {
  return Mt(
    t,
    r[0] * e[0],
    r[1] * e[1],
    r[2] * e[2],
    r[3] * e[3]
  );
}
function vf(r, e, t) {
  return st(
    t,
    r[0] * e[0],
    r[1] * e[1],
    r[2] * e[2],
    r[3] * e[3],
    r[4] * e[4],
    r[5] * e[5],
    r[6] * e[6],
    r[7] * e[7],
    r[8] * e[8]
  );
}
function wf(r, e, t) {
  return Te(
    t,
    r[0] * e[0],
    r[1] * e[1],
    r[2] * e[2],
    r[3] * e[3],
    r[4] * e[4],
    r[5] * e[5],
    r[6] * e[6],
    r[7] * e[7],
    r[8] * e[8],
    r[9] * e[9],
    r[10] * e[10],
    r[11] * e[11],
    r[12] * e[12],
    r[13] * e[13],
    r[14] * e[14],
    r[15] * e[15]
  );
}
function Ef(r, e) {
  return Mt(
    e,
    r[0],
    r[2],
    r[1],
    r[3]
  );
}
function Wn(r, e) {
  return st(
    e,
    r[0],
    r[3],
    r[6],
    r[1],
    r[4],
    r[7],
    r[2],
    r[5],
    r[8]
  );
}
function yf(r, e) {
  return Te(
    e,
    r[0],
    r[4],
    r[8],
    r[12],
    r[1],
    r[5],
    r[9],
    r[13],
    r[2],
    r[6],
    r[10],
    r[14],
    r[3],
    r[7],
    r[11],
    r[15]
  );
}
function Rf(r, e) {
  return (r >= Math.PI / 2 || r <= -Math.PI / 2) && console.warn("A shear matrix can not have radians >= PI / 2 or <= -PI / 2"), e = e || Is(), Mt(
    e,
    1,
    0,
    Ht(r),
    1
  );
}
function _f(r, e) {
  return (r >= Math.PI / 2 || r <= -Math.PI / 2) && console.warn("A shear matrix can not have radians >= PI / 2 or <= -PI / 2"), e = e || Is(), Mt(
    e,
    1,
    Ht(r),
    0,
    1
  );
}
function Af(r, e, t) {
  (e >= vt || e <= -vt || r >= vt || r <= -vt) && console.warn("A shear matrix can not have radians >= PI / 2 or <= -PI / 2"), t = t || se();
  const i = Ht(e), n = Ht(r);
  return Te(
    t,
    1,
    0,
    0,
    0,
    n,
    1,
    0,
    0,
    i,
    0,
    1,
    0,
    0,
    0,
    0,
    1
  );
}
function Mf(r, e, t) {
  (e >= vt || e <= -vt || r >= vt || r <= -vt) && console.warn("A shear matrix can not have radians >= PI / 2 or <= -PI / 2"), t = t || se();
  const i = Ht(e), n = Ht(r);
  return Te(
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
    i,
    1,
    0,
    0,
    0,
    0,
    1
  );
}
function If(r, e, t) {
  (e >= vt || e <= -vt || r >= vt || r <= -vt) && console.warn("A shear matrix can not have radians >= PI / 2 or <= -PI / 2"), t = t || se();
  const i = Ht(e), n = Ht(r);
  return Te(
    t,
    1,
    0,
    n,
    0,
    0,
    1,
    i,
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
function Sf(r, e, t) {
  return he(
    t,
    r[ai] * e[0] + r[ci] * e[1],
    r[oi] * e[0] + r[li] * e[1]
  );
}
function Cf(r, e, t) {
  return me(
    t,
    r[bs] * e[0] + r[Es] * e[1] + r[_s] * e[2],
    r[vs] * e[0] + r[ys] * e[1] + r[As] * e[2],
    r[ws] * e[0] + r[Rs] * e[1] + r[Ms] * e[2]
  );
}
function Nf(r, e, t) {
  return fe(
    t,
    r[hr] * e[0] + r[gr] * e[1] + r[br] * e[2] + r[yr] * 1,
    r[dr] * e[0] + r[mr] * e[1] + r[vr] * e[2] + r[Rr] * 1,
    r[fr] * e[0] + r[xr] * e[1] + r[wr] * e[2] + r[_r] * 1,
    r[pr] * e[0] + r[Tr] * e[1] + r[Er] * e[2] + r[Ar] * 1
  );
}
function hn(r, e, t) {
  return fe(
    t,
    r[hr] * e[0] + r[gr] * e[1] + r[br] * e[2] + r[yr] * e[3],
    r[dr] * e[0] + r[mr] * e[1] + r[vr] * e[2] + r[Rr] * e[3],
    r[fr] * e[0] + r[xr] * e[1] + r[wr] * e[2] + r[_r] * e[3],
    r[pr] * e[0] + r[Tr] * e[1] + r[Er] * e[2] + r[Ar] * e[3]
  );
}
function Of(r) {
  return `Matrix: [
  ${r[0]}, ${r[1]},
  ${r[2]}, ${r[3]},
]`;
}
function Lf(r) {
  return `Matrix: [
  ${r[0]}, ${r[1]}, ${r[2]},
  ${r[3]}, ${r[4]}, ${r[5]},
  ${r[6]}, ${r[7]}, ${r[8]},
]`;
}
function Ff(r) {
  return `Matrix: [
  ${r[0]}, ${r[1]}, ${r[2]}, ${r[3]},
  ${r[4]}, ${r[5]}, ${r[6]}, ${r[7]},
  ${r[8]}, ${r[9]}, ${r[10]}, ${r[11]},
  ${r[12]}, ${r[13]}, ${r[14]}, ${r[15]},
]`;
}
function cu(r, e) {
  e = e || new Array(4);
  const t = Math.cos(r), i = Math.sin(r);
  return e[ai] = t, e[oi] = -i, e[ci] = i, e[li] = t, e;
}
function lu(r, e, t, i) {
  if (r)
    if (e)
      if (t) {
        const n = ft(r), s = ft(e), a = ft(t), o = pt(r), c = pt(e), l = pt(t);
        return Te(
          i,
          s * a,
          s * l,
          -c,
          0,
          o * c * a - n * l,
          o * c * l + n * a,
          o * s,
          0,
          n * c * a + o * l,
          n * c * l - o * a,
          n * s,
          0,
          0,
          0,
          0,
          1
        );
      } else {
        const n = ft(r), s = ft(e), a = pt(r), o = pt(e);
        return Te(
          i,
          s,
          0,
          -o,
          0,
          a * o,
          n,
          a * s,
          0,
          n * o,
          -a,
          n * s,
          0,
          0,
          0,
          0,
          1
        );
      }
    else if (t) {
      const n = ft(r), s = ft(t), a = pt(r), o = pt(t);
      return Te(
        i,
        s,
        o,
        0,
        0,
        -n * o,
        n * s,
        a,
        0,
        a * o,
        -a * s,
        n,
        0,
        0,
        0,
        0,
        1
      );
    } else {
      const n = ft(r), s = pt(r);
      return Te(
        i,
        1,
        0,
        0,
        0,
        0,
        n,
        s,
        0,
        0,
        -s,
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
      const n = ft(e), s = ft(t), a = pt(e), o = pt(t);
      return Te(
        i,
        n * s,
        n * o,
        -a,
        0,
        -o,
        s,
        0,
        0,
        a * s,
        a * o,
        n,
        0,
        0,
        0,
        0,
        1
      );
    } else {
      const n = ft(e), s = pt(e);
      return Te(
        i,
        n,
        0,
        -s,
        0,
        0,
        1,
        0,
        0,
        s,
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
    const n = ft(t), s = pt(t);
    return Te(
      i,
      n,
      s,
      0,
      0,
      -s,
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
    return se(i);
}
function Bf(r, e) {
  return lu(r[0], r[1], r[2], e);
}
function Pf(r, e) {
  return uu(r[0], r[1], r[2], e);
}
function uu(r, e, t, i) {
  return Te(
    i,
    r,
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
function Df(r, e) {
  return hu(r[0], r[1], r[2], e);
}
function hu(r, e, t, i) {
  return Te(
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
    r,
    e,
    t,
    1
  );
}
function ro(r, e, t, i, n, s, a) {
  return a = a || se(), Te(
    a,
    2 * r / (i - t),
    0,
    0,
    0,
    0,
    2 * r / (n - s),
    0,
    0,
    (i + t) / (i - t),
    (n + s) / (n - s),
    -(e + r) / (e - r),
    -1,
    0,
    0,
    -(2 * e * r) / (e - r),
    0
  );
}
function du(r, e, t, i, n, s) {
  const a = t / e, o = Ht(r / 2) * i, c = -o, l = a * o, u = -l;
  return ro(i, n, c, o, l, u, s);
}
function Uf(r, e, t, i, n, s) {
  const a = e / t, o = Ht(r / 2) * i, c = -o, l = a * o, u = -l;
  return ro(i, n, u, l, o, c, s);
}
function fu(r, e, t, i, n, s, a) {
  return Te(
    a,
    2 / (e - r),
    0,
    0,
    0,
    0,
    2 / (i - t),
    0,
    0,
    0,
    0,
    -1 / (s - n),
    0,
    (e + r) / (r - e),
    (i + t) / (t - i),
    -n / (n - s),
    1
  );
}
function pu(r, e, t, i, n) {
  return n = n || [0, 0, 0, 0], hn(r, e, n), fe(
    n,
    (n[0] / n[3] + 1) * 0.5 * t,
    (n[1] / n[3] + 1) * 0.5 * i,
    n[2] / n[3],
    1
  );
}
function na(r, e, t, i, n) {
  return pu(
    r,
    [e[0], e[1], e[2], 1],
    t,
    i,
    n
  );
}
function kf(r, e) {
  return Math.abs(r[0] - e[0]) <= 1e-7 && Math.abs(r[1] - e[1]) <= 1e-7 && Math.abs(r[2] - e[2]) <= 1e-7 && Math.abs(r[3] - e[3]) <= 1e-7;
}
function Gf(r, e) {
  return Math.abs(r[0] - e[0]) <= 1e-7 && Math.abs(r[1] - e[1]) <= 1e-7 && Math.abs(r[2] - e[2]) <= 1e-7 && Math.abs(r[3] - e[3]) <= 1e-7 && Math.abs(r[4] - e[4]) <= 1e-7 && Math.abs(r[5] - e[5]) <= 1e-7 && Math.abs(r[6] - e[6]) <= 1e-7 && Math.abs(r[7] - e[7]) <= 1e-7 && Math.abs(r[8] - e[8]) <= 1e-7;
}
function gu(r, e) {
  return Math.abs(r[0] - e[0]) <= 1e-7 && Math.abs(r[1] - e[1]) <= 1e-7 && Math.abs(r[2] - e[2]) <= 1e-7 && Math.abs(r[3] - e[3]) <= 1e-7 && Math.abs(r[4] - e[4]) <= 1e-7 && Math.abs(r[5] - e[5]) <= 1e-7 && Math.abs(r[6] - e[6]) <= 1e-7 && Math.abs(r[7] - e[7]) <= 1e-7 && Math.abs(r[8] - e[8]) <= 1e-7 && Math.abs(r[9] - e[9]) <= 1e-7 && Math.abs(r[10] - e[10]) <= 1e-7 && Math.abs(r[11] - e[11]) <= 1e-7 && Math.abs(r[12] - e[12]) <= 1e-7 && Math.abs(r[13] - e[13]) <= 1e-7 && Math.abs(r[14] - e[14]) <= 1e-7 && Math.abs(r[15] - e[15]) <= 1e-7;
}
function zf(r) {
  return [r[0], r[1], r[2], r[3]];
}
function Vf(r) {
  return [r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8]];
}
function dn(r, e) {
  return e ? (e[0] = r[0], e[1] = r[1], e[2] = r[2], e[3] = r[3], e[4] = r[4], e[5] = r[5], e[6] = r[6], e[7] = r[7], e[8] = r[8], e[9] = r[9], e[10] = r[10], e[11] = r[11], e[12] = r[12], e[13] = r[13], e[14] = r[14], e[15] = r[15], e) : [
    r[0],
    r[1],
    r[2],
    r[3],
    r[4],
    r[5],
    r[6],
    r[7],
    r[8],
    r[9],
    r[10],
    r[11],
    r[12],
    r[13],
    r[14],
    r[15]
  ];
}
function jn(r, e, t, i) {
  i = i || [];
  const [n, s, a] = r, [o, c, l] = t, [u, h, d, p, g, m, T, x, b] = e;
  i[hr] = u * n, i[dr] = h * s, i[fr] = d * a, i[pr] = 0, i[gr] = p * n, i[mr] = g * s, i[xr] = m * a, i[Tr] = 0, i[br] = T * n, i[vr] = x * s, i[wr] = b * a, i[Er] = 0, i[yr] = n * (u * o + p * c + T * l), i[Rr] = s * (h * o + g * c + x * l), i[_r] = a * (d * o + m * c + b * l), i[Ar] = 1;
}
function sa(r, e, t, i) {
  i = i || [];
  const [n, s, a] = r, [o, c, l] = t, [u, h, d, p, g, m, T, x, b] = e;
  i[hr] = u * n, i[dr] = h * n, i[fr] = d * n, i[pr] = 0, i[gr] = p * s, i[mr] = g * s, i[xr] = m * s, i[Tr] = 0, i[br] = T * a, i[vr] = x * a, i[wr] = b * a, i[Er] = 0, i[yr] = o, i[Rr] = c, i[_r] = l, i[Ar] = 1;
}
function $f(r, e, t, i) {
  i = i || [];
  const [n, s] = r, [a, o] = t, [c, l, u, h] = e;
  i[hr] = c * n, i[dr] = l * s, i[fr] = 0, i[pr] = 0, i[gr] = u * n, i[mr] = h * s, i[xr] = 0, i[Tr] = 0, i[br] = 0, i[vr] = 0, i[wr] = 1, i[Er] = 0, i[yr] = n * (c * a + u * o), i[Rr] = s * (l * a + h * o), i[_r] = 0, i[Ar] = 1;
}
function mu(r, e, t, i) {
  i = i || [];
  const [n, s] = r, [a, o] = t, [c, l, u, h] = e;
  i[hr] = c * n, i[dr] = l * n, i[fr] = 0, i[pr] = 0, i[gr] = u * s, i[mr] = h * s, i[xr] = 0, i[Tr] = 0, i[br] = 0, i[vr] = 0, i[wr] = 1, i[Er] = 0, i[yr] = a, i[Rr] = o, i[_r] = 0, i[Ar] = 1;
}
const Wf = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Hadamard2x2: bf,
  Hadamard3x3: vf,
  Hadamard4x4: wf,
  M200: ai,
  M201: oi,
  M210: ci,
  M211: li,
  M300: bs,
  M301: vs,
  M302: ws,
  M310: Es,
  M311: ys,
  M312: Rs,
  M320: _s,
  M321: As,
  M322: Ms,
  M3R: Bi,
  M400: hr,
  M401: dr,
  M402: fr,
  M403: pr,
  M410: gr,
  M411: mr,
  M412: xr,
  M413: Tr,
  M420: br,
  M421: vr,
  M422: wr,
  M423: Er,
  M430: yr,
  M431: Rr,
  M432: _r,
  M433: Ar,
  M4R: Ge,
  SRT4x4: sa,
  SRT4x4_2D: mu,
  TRS4x4: jn,
  TRS4x4_2D: $f,
  add2x2: ff,
  add3x3: pf,
  add4x4: gf,
  affineInverse2x2: nf,
  affineInverse3x3: sf,
  affineInverse4x4: af,
  apply2x2: Mt,
  apply3x3: st,
  apply4x4: Te,
  compare2x2: kf,
  compare3x3: Gf,
  compare4x4: gu,
  concat4x4: df,
  copy2x2: zf,
  copy3x3: Vf,
  copy4x4: dn,
  determinant2x2: ge,
  determinant3x3: Di,
  determinant4x4: ou,
  identity2x2: Is,
  identity3x3: Mr,
  identity4x4: se,
  inverse4x4: to,
  multiply2x2: uf,
  multiply3x3: hf,
  multiply4x4: bt,
  multiplyScalar2x2: of,
  multiplyScalar3x3: cf,
  multiplyScalar4x4: lf,
  orthographic4x4: fu,
  perspective4x4: du,
  perspectiveFOVY4x4: Uf,
  perspectiveFrustum4x4: ro,
  project3As4ToScreen: na,
  projectToScreen: pu,
  rotation2x2: cu,
  rotation4x4: lu,
  rotation4x4by3: Bf,
  scale4x4: uu,
  scale4x4by3: Pf,
  shearX2x2: Rf,
  shearX4x4: Af,
  shearY2x2: _f,
  shearY4x4: Mf,
  shearZ4x4: If,
  subtract2x2: mf,
  subtract3x3: xf,
  subtract4x4: Tf,
  toString2x2: Of,
  toString3x3: Lf,
  toString4x4: Ff,
  transform2: Sf,
  transform3: Cf,
  transform3as4: Nf,
  transform4: hn,
  translation4x4: hu,
  translation4x4by3: Df,
  transpose2x2: Ef,
  transpose3x3: Wn,
  transpose4x4: yf
}, Symbol.toStringTag, { value: "Module" })), { cos: ln, sin: zr, sqrt: at, exp: qo, acos: io, atan2: Ko, PI: Zo } = Math;
let Xe, Pt, Dt, Ut, Se, ke, ki, kt, Qe, Ae, Gi, rs, is, kr, B, yt, Nn, Ai;
const jf = we(), Hf = we(), Xf = we(), Qf = we(), Yf = 1, qf = 2, Kf = 3, Zf = 0;
function nt(r, e, t) {
  return r > t ? t : r < e ? e : r;
}
function we(r) {
  return r ? (r[0] = 0, r[1] = 0, r[2] = 0, r[3] = 0, r) : [0, 0, 0, 0];
}
function Jf(r, e, t) {
  return t = t || we(), t[0] = r[0] + e[0], t[1] = r[1] + e[1], t[2] = r[2] + e[2], t[3] = r[3] + e[3], t;
}
function ns(r, e, t) {
  t = t || we();
  const i = r[0], n = e[0], s = r[1], a = e[1], o = r[2], c = e[2], l = r[3], u = e[3];
  return t[0] = i * n - s * a - o * c - l * u, t[1] = i * a + s * n + o * u - l * c, t[2] = i * c - s * u + o * n + l * a, t[3] = i * u + s * c - o * a + l * n, t;
}
function ep(r, e, t) {
  t = t || we();
  const i = r[0], n = r[1], s = r[2], a = r[3], o = e[0], c = e[1], l = e[2], u = e[3], h = o * o + c * c + l * l + u * u;
  if (h === 0)
    t[0] = 0, t[1] = 0, t[2] = 0, t[3] = 0;
  else {
    const d = 1 / h;
    t[0] = (i * o + n * c + s * l + a * u) * d, t[1] = (n * o - i * c - s * u + a * l) * d, t[2] = (s * o - i * l - a * c + n * u) * d, t[3] = (a * o - i * u - n * l + s * c) * d;
  }
  return t;
}
function tp(r, e) {
  e = e || we();
  const t = r[0], i = r[1], n = r[2], s = r[3], a = at(i * i + n * n + s * s), o = qo(t), c = o / a * zr(a);
  return a === 0 ? (e[0] = qo(t), e[1] = 0, e[2] = 0, e[3] = 0) : (e[0] = o * ln(a), e[1] = i * c, e[2] = n * c, e[3] = s * c), e;
}
function xu(r, e, t) {
  return t = t || we(), t[0] = r[0] * e, t[1] = r[1] * e, t[2] = r[2] * e, t[3] = r[3] * e, t;
}
function rp(r, e, t) {
  return t = t || we(), ns(e, Tu(r), t);
}
function Tu(r, e) {
  return e = e || we(), e[0] = r[0], e[1] = -r[1], e[2] = -r[2], e[3] = -r[3], e;
}
function ip(r, e) {
  e = e || we();
  const t = r[0], i = r[1], n = r[2], s = r[3], a = t * t + i * i + n * n + s * s;
  if (a === 0)
    e[0] = 0, e[1] = 0, e[2] = 0, e[3] = 0;
  else {
    const o = 1 / a;
    e[0] = t * o, e[1] = -i * o, e[2] = -n * o, e[3] = -s * o;
  }
  return e;
}
function bu(r) {
  const e = r[0], t = r[1], i = r[2], n = r[3];
  return at(e * e + t * t + i * i + n * n);
}
function vu(r, e) {
  e = e || we();
  const t = bu(r);
  if (t === 0) return [0, 0, 0, 0];
  const i = 1 / t;
  return xu(r, i, e);
}
function np(r) {
  return r[0];
}
function sp(r) {
  return [r[1], r[2], r[3]];
}
function ap(r, e) {
  return Ya(r, e);
}
function aa(r, e, t) {
  t = t || we();
  const i = r[0], n = r[1], s = r[2], a = 1 / at(i * i + n * n + s * s), o = zr(e / 2);
  return t[0] = ln(e / 2), t[1] = o * i * a, t[2] = o * n * a, t[3] = o * s * a, t;
}
function wu(r, e, t) {
  t = t || we();
  const i = r[0], n = r[1], s = r[2], a = Math.cos, o = Math.sin, c = a(i / 2), l = a(n / 2), u = a(s / 2), h = o(i / 2), d = o(n / 2), p = o(s / 2);
  switch (e) {
    case ne.xyz:
      t[1] = h * l * u + c * d * p, t[2] = c * d * u - h * l * p, t[3] = c * l * p + h * d * u, t[0] = c * l * u - h * d * p;
      break;
    case ne.yxz:
      t[0] = c * l * u + h * d * p, t[1] = h * l * u + c * d * p, t[2] = c * d * u - h * l * p, t[3] = c * l * p - h * d * u;
      break;
    case ne.zxy:
      t[0] = c * l * u - h * d * p, t[1] = h * l * u - c * d * p, t[2] = c * d * u + h * l * p, t[3] = c * l * p + h * d * u;
      break;
    case ne.zyx:
      t[0] = c * l * u + h * d * p, t[1] = h * l * u - c * d * p, t[2] = c * d * u + h * l * p, t[3] = c * l * p - h * d * u;
      break;
    case ne.yzx:
      t[0] = c * l * u - h * d * p, t[1] = h * l * u + c * d * p, t[2] = c * d * u + h * l * p, t[3] = c * l * p - h * d * u;
      break;
    case ne.xzy:
      t[0] = c * l * u + h * d * p, t[1] = h * l * u - c * d * p, t[2] = c * d * u - h * l * p, t[3] = c * l * p + h * d * u;
      break;
  }
  return t;
}
function op(r, e, t) {
  t = t || [0, 0, 0];
  const i = wu(r, e);
  return no(i, ne.xyz, t), t;
}
function Mi(r, e, t, i, n, s) {
  s[0] = Ko(r, e), s[1] = io(t), s[2] = Ko(i, n);
}
function cp(r, e) {
  return no(r, ne.zyx, e);
}
function no(r, e, t) {
  t = t || [0, 0, 0];
  const i = r[0], n = r[1], s = r[2], a = r[3], o = so(r), c = o[0], l = o[4], u = o[8], h = o[1], d = o[5], p = o[9], g = o[2], m = o[6], T = o[10];
  switch (e) {
    case ne.zyx:
      t[1] = Math.asin(-nt(g, -1, 1)), Math.abs(g) < 0.99999 ? (t[0] = Math.atan2(m, T), t[2] = Math.atan2(h, c)) : (t[0] = 0, t[2] = Math.atan2(-l, d));
      break;
    case ne.zyz:
      Mi(
        2 * s * a + 2 * i * n,
        2 * i * s - 2 * n * a,
        a * a - s * s - n * n + i * i,
        2 * s * a - 2 * i * n,
        2 * n * a + 2 * i * s,
        t
      );
      break;
    case ne.zxy:
      t[0] = Math.asin(nt(m, -1, 1)), Math.abs(m) < 0.99999 ? (t[1] = Math.atan2(-g, T), t[2] = Math.atan2(-l, d)) : (t[1] = 0, t[2] = Math.atan2(h, c));
      break;
    case ne.zxz:
      Mi(
        2 * n * a - 2 * i * s,
        2 * s * a + 2 * i * n,
        a * a - s * s - n * n + i * i,
        2 * n * a + 2 * i * s,
        2 * i * n - 2 * s * a,
        t
      );
      break;
    case ne.yxz:
      t[0] = Math.asin(-nt(p, -1, 1)), Math.abs(p) < 0.9999 ? (t[1] = Math.atan2(u, T), t[2] = Math.atan2(h, d)) : (t[1] = Math.atan2(-g, c), t[2] = 0);
      break;
    case ne.yxy:
      Mi(
        2 * n * s + 2 * i * a,
        2 * i * n - 2 * s * a,
        s * s - a * a + i * i - n * n,
        2 * n * s - 2 * i * a,
        2 * s * a + 2 * i * n,
        t
      );
      break;
    case ne.yzx:
      t[2] = Math.asin(nt(h, -1, 1)), Math.abs(h) < 0.99999 ? (t[0] = Math.atan2(-p, d), t[1] = Math.atan2(-g, c)) : (t[0] = 0, t[1] = Math.atan2(u, T));
      break;
    case ne.yzy:
      Mi(
        2 * s * a - 2 * i * n,
        2 * n * s + 2 * i * a,
        s * s - a * a + i * i - n * n,
        2 * s * a + 2 * i * n,
        2 * i * a - 2 * n * s,
        t
      );
      break;
    case ne.xyz:
      t[1] = Math.asin(nt(u, -1, 1)), Math.abs(u) < 0.99999 ? (t[0] = Math.atan2(-p, T), t[2] = Math.atan2(-l, c)) : (t[0] = Math.atan2(m, d), t[2] = 0);
      break;
    case ne.xyx:
      Mi(
        2 * n * s - 2 * i * a,
        2 * n * a + 2 * i * s,
        n * n + i * i - a * a - s * s,
        2 * n * s + 2 * i * a,
        2 * i * s - 2 * n * a,
        t
      );
      break;
    case ne.xzy:
      t[2] = Math.asin(-nt(l, -1, 1)), Math.abs(l) < 0.99999 ? (t[0] = Math.atan2(m, d), t[1] = Math.atan2(u, c)) : (t[0] = Math.atan2(-p, T), t[1] = 0);
      break;
    case ne.xzx:
      Mi(
        2 * n * a + 2 * i * s,
        2 * i * a - 2 * n * s,
        n * n + i * i - a * a - s * s,
        2 * n * a - 2 * i * s,
        2 * n * s + 2 * i * a,
        t
      );
      break;
    default:
      console.warn("Invalid Euler rotation order.");
      break;
  }
  return t;
}
function lp(r, e, t) {
  t = t || [0, 0, 0];
  const i = so(r), n = i[0], s = i[4], a = i[8], o = i[1], c = i[5], l = i[9], u = i[2], h = i[6], d = i[10];
  switch (e) {
    case ne.xyz:
      t[1] = Math.asin(nt(a, -1, 1)), Math.abs(a) < 0.99999 ? (t[0] = Math.atan2(-l, d), t[2] = Math.atan2(-s, n)) : (t[0] = Math.atan2(h, c), t[2] = 0);
      break;
    case ne.yxz:
      t[0] = Math.asin(-nt(l, -1, 1)), Math.abs(l) < 0.9999 ? (t[1] = Math.atan2(a, d), t[2] = Math.atan2(o, c)) : (t[1] = Math.atan2(-u, n), t[2] = 0);
      break;
    case ne.zxy:
      t[0] = Math.asin(nt(h, -1, 1)), Math.abs(h) < 0.99999 ? (t[1] = Math.atan2(-u, d), t[2] = Math.atan2(-s, c)) : (t[1] = 0, t[2] = Math.atan2(o, n));
      break;
    case ne.zyx:
      t[1] = Math.asin(-nt(u, -1, 1)), Math.abs(u) < 0.99999 ? (t[0] = Math.atan2(h, d), t[2] = Math.atan2(o, n)) : (t[0] = 0, t[2] = Math.atan2(-s, c));
      break;
    case ne.yzx:
      t[2] = Math.asin(nt(o, -1, 1)), Math.abs(o) < 0.99999 ? (t[0] = Math.atan2(-l, c), t[1] = Math.atan2(-u, n)) : (t[0] = 0, t[1] = Math.atan2(a, d));
      break;
    case ne.xzy:
      t[2] = Math.asin(-nt(s, -1, 1)), Math.abs(s) < 0.99999 ? (t[0] = Math.atan2(h, c), t[1] = Math.atan2(a, n)) : (t[0] = Math.atan2(-l, d), t[1] = 0);
      break;
  }
}
function up(r) {
  const e = r[0];
  if (e < -1 || e > 1)
    return 0;
  const t = 2 * io(e);
  return t > Zo ? t - 2 * Zo : t;
}
function hp(r) {
  const e = r[1], t = r[2], i = r[3];
  if (at(e * e + t * t + i * i) === 0) return [0, 0, 0];
  const s = 1 / at(e * e + t * t + i * i);
  return [e * s, t * s, i * s];
}
function oa(r, e) {
  e = e || Mr();
  const t = r[1] + r[1], i = r[2] + r[2], n = r[3] + r[3], s = r[1] * t, a = r[1] * i, o = r[1] * n, c = r[2] * i, l = r[2] * n, u = r[3] * n, h = r[0] * t, d = r[0] * i, p = r[0] * n;
  return e[bs] = 1 - (c + u), e[vs] = a - p, e[ws] = o + d, e[Es] = a + p, e[ys] = 1 - (s + u), e[Rs] = l - h, e[_s] = o - d, e[As] = l + h, e[Ms] = 1 - (s + c), e;
}
function dp(r, e) {
  e = e || se();
  const t = r[1] + r[1], i = r[2] + r[2], n = r[3] + r[3], s = r[1] * t, a = r[1] * i, o = r[1] * n, c = r[2] * i, l = r[2] * n, u = r[3] * n, h = r[0] * t, d = r[0] * i, p = r[0] * n;
  return e[hr] = 1 - (c + u), e[dr] = a - p, e[fr] = o + d, e[pr] = 0, e[gr] = a + p, e[mr] = 1 - (s + u), e[xr] = l - h, e[Tr] = 0, e[br] = o - d, e[vr] = l + h, e[wr] = 1 - (s + c), e[Er] = 0, e[yr] = 0, e[Rr] = 0, e[_r] = 0, e[Ar] = 1, e;
}
function fp(r, e) {
  e = e || Mr();
  const t = r[1] + r[1], i = r[2] + r[2], n = r[3] + r[3], s = r[1] * t, a = r[1] * i, o = r[1] * n, c = r[2] * i, l = r[2] * n, u = r[3] * n, h = r[0] * t, d = r[0] * i, p = r[0] * n;
  return e[bs] = 1 - (c + u), e[Es] = a - p, e[_s] = o + d, e[vs] = a + p, e[ys] = 1 - (s + u), e[As] = l - h, e[ws] = o - d, e[Rs] = l + h, e[Ms] = 1 - (s + c), e;
}
function so(r, e) {
  e = e || se();
  const t = r[1] + r[1], i = r[2] + r[2], n = r[3] + r[3], s = r[1] * t, a = r[1] * i, o = r[1] * n, c = r[2] * i, l = r[2] * n, u = r[3] * n, h = r[0] * t, d = r[0] * i, p = r[0] * n;
  return e[hr] = 1 - (c + u), e[gr] = a - p, e[br] = o + d, e[yr] = 0, e[dr] = a + p, e[mr] = 1 - (s + u), e[vr] = l - h, e[Rr] = 0, e[fr] = o - d, e[xr] = l + h, e[wr] = 1 - (s + c), e[_r] = 0, e[pr] = 0, e[Tr] = 0, e[Er] = 0, e[Ar] = 1, e;
}
function pp(r, e) {
  e = e || we();
  const [t, i, n] = r, s = ln(t / 2), a = ln(i / 2), o = ln(n / 2), c = zr(t / 2), l = zr(i / 2), u = zr(n / 2), h = a * o, d = l * u, p = a * u, g = l * o;
  return e[0] = s * h + c * d, e[1] = c * h - s * d, e[2] = s * g + c * p, e[3] = s * p - c * g, e;
}
function Eu(r, e, t) {
  return t = t || we(), Ai = ot([-r[0], -r[1], -r[2]], He[He.length - 1]), yt = ot(Ze(e, Ai, He[He.length - 2])), Nn = Ze(Ai, yt, He[He.length - 3]), Se = yt[0], ke = Nn[0], ki = Ai[0], Qe = yt[1], Ae = Nn[1], Gi = Ai[1], rs = yt[2], is = Nn[2], kr = Ai[2], B = (1 + Se + Ae + kr) * 0.25, B > 0 ? (B = Math.sqrt(B), t[0] = B, B = 1 / (4 * B), t[1] = (Gi - is) * B, t[2] = (rs - ki) * B, t[3] = (ke - Qe) * B) : (t[0] = 0, B = -0.5 * (Ae + kr), B > 0 ? (B = Math.sqrt(B), t[1] = B, B *= 2, t[2] = ke / B, t[3] = ki / B) : (t[1] = 0, B = 0.5 * (1 - kr), B > 0 ? (B = Math.sqrt(B), t[2] = B, t[3] = Gi / (2 * B)) : (t[2] = 0, t[3] = 1))), t;
}
function gp(r, e) {
  if (e = e || we(), Xe = r[0], Pt = r[3], Dt = r[6], Ut = r[1], Se = r[4], ke = r[7], kt = r[2], Qe = r[5], Ae = r[8], B = Xe + Se + Ae, B > 0) {
    const i = at(B + 1) * 2;
    return e[0] = 0.25 * i, e[1] = (Qe - ke) / i, e[2] = (Dt - kt) / i, e[3] = (Ut - Pt) / i, e;
  }
  if (Xe > Se && Xe > Ae) {
    const i = at(1 + Xe - Se - Ae) * 2;
    return e[0] = (Qe - ke) / i, e[1] = 0.25 * i, e[2] = (Pt + Ut) / i, e[3] = (Dt + kt) / i, e;
  }
  if (Se > Ae) {
    const i = at(1 + Se - Xe - Ae) * 2;
    return e[0] = (Dt - kt) / i, e[1] = (Ut + Pt) / i, e[2] = 0.25 * i, e[3] = (Qe + ke) / i, e;
  }
  const t = at(1 + Ae - Xe - Se) * 2;
  return e[0] = (Ut - Pt) / t, e[1] = (kt + Dt) / t, e[2] = (Qe + ke) / t, e[3] = 0.25 * t, e;
}
function mp(r, e) {
  if (e = e || we(), Xe = r[0], Pt = r[4], Dt = r[8], Ut = r[1], Se = r[5], ke = r[9], kt = r[2], Qe = r[6], Ae = r[10], B = Xe + Se + Ae, B > 0) {
    const i = at(B + 1) * 2;
    return e[0] = 0.25 * i, e[1] = (Qe - ke) / i, e[2] = (Dt - kt) / i, e[3] = (Ut - Pt) / i, e;
  }
  if (Xe > Se && Xe > Ae) {
    const i = at(1 + Xe - Se - Ae) * 2;
    return e[0] = (Qe - ke) / i, e[1] = 0.25 * i, e[2] = (Pt + Ut) / i, e[3] = (Dt + kt) / i, e;
  }
  if (Se > Ae) {
    const i = at(1 + Se - Xe - Ae) * 2;
    return e[0] = (Dt - kt) / i, e[1] = (Ut + Pt) / i, e[2] = 0.25 * i, e[3] = (Qe + ke) / i, e;
  }
  const t = at(1 + Ae - Xe - Se) * 2;
  return e[0] = (Ut - Pt) / t, e[1] = (kt + Dt) / t, e[2] = (Qe + ke) / t, e[3] = 0.25 * t, e;
}
function ao(r, e, t, i, n) {
  return n = n || we(), Se = r[0] / e, ke = r[4] / t, ki = r[8] / i, Qe = r[1] / e, Ae = r[5] / t, Gi = r[9] / i, rs = r[2] / e, is = r[6] / t, kr = r[10] / i, B = (1 + Se + Ae + kr) * 0.25, B > 0 ? (B = Math.sqrt(B), n[0] = B, B = 1 / (4 * B), n[1] = (Gi - is) * B, n[2] = (rs - ki) * B, n[3] = (ke - Qe) * B) : (n[0] = 0, B = -0.5 * (Ae + kr), B > 0 ? (B = Math.sqrt(B), n[1] = B, B *= 2, n[2] = ke / B, n[3] = ki / B) : (n[1] = 0, B = 0.5 * (1 - kr), B > 0 ? (B = Math.sqrt(B), n[2] = B, n[3] = Gi / (2 * B)) : (n[2] = 0, n[3] = 1))), n;
}
function xp(r, e, t) {
  t = t || se();
  const i = ot([-r[0], -r[1], -r[2]]), n = ot(Ze(e, i)), s = Ze(i, n);
  return t[0] = n[0], t[1] = s[0], t[2] = i[0], t[3] = 0, t[4] = n[1], t[5] = s[1], t[6] = i[1], t[7] = 0, t[8] = n[2], t[9] = s[2], t[10] = i[2], t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, t;
}
function ca(r, e, t) {
  return yt = di(e[1], e[2], e[3]), B = e[0], Ke(
    Ke(Pe(yt, 2 * ct(yt, r)), Pe(r, B * B - ct(yt, yt))),
    Pe(Ze(yt, r), 2 * B),
    t
  );
}
function Tp(r, e, t, i) {
  i = i || we();
  const n = [0, 0, 0, 0];
  let s, a, o, c, l;
  return a = r[1] * e[1] + r[2] * e[2] + r[3] * e[3] + r[0] * e[0], a < 0 ? (a = -a, n[0] = -e[1], n[1] = -e[2], n[2] = -e[3], n[3] = -e[0]) : (n[0] = e[1], n[1] = e[2], n[2] = e[3], n[3] = e[0]), 1 - a > 1e-7 ? (s = io(a), o = zr(s), c = zr((1 - t) * s) / o, l = zr(t * s) / o) : (c = 1 - t, l = t), i[1] = c * r[1] + l * n[0], i[2] = c * r[2] + l * n[1], i[3] = c * r[3] + l * n[2], i[0] = c * r[0] + l * n[3], i;
}
function ss() {
  return [1, 0, 0, 0];
}
function bp() {
  return [0, 1, 0, 0];
}
function vp() {
  return [0, 0, 1, 0];
}
function wp() {
  return [0, 0, 0, 1];
}
const Ep = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  QR1: jf,
  QR2: Hf,
  QR3: Xf,
  QR4: Qf,
  QW: Zf,
  QX: Yf,
  QY: qf,
  QZ: Kf,
  addQuat: Jf,
  angleQuat: up,
  axisQuat: hp,
  clamp: nt,
  conjugateQuat: Tu,
  decomposeRotation: ao,
  diffUnitQuat: rp,
  divideQuat: ep,
  dotQuat: ap,
  eulerToQuat: pp,
  exponentQuat: tp,
  fromEulerAxisAngleToQuat: aa,
  fromOrderedEulerToQuat: wu,
  iQuat: bp,
  imaginaryQuat: sp,
  inverseQuat: ip,
  jQuat: vp,
  kQuat: wp,
  lengthQuat: bu,
  lookAtMatrix: xp,
  lookAtQuat: Eu,
  matrix3x3FromUnitQuatModel: oa,
  matrix3x3FromUnitQuatView: fp,
  matrix3x3ToQuaternion: gp,
  matrix4x4FromUnitQuatModel: dp,
  matrix4x4FromUnitQuatView: so,
  matrix4x4ToQuaternion: mp,
  multiplyQuat: ns,
  normalizeQuat: vu,
  oneQuat: ss,
  realQuat: np,
  rotateVectorByUnitQuat: ca,
  scaleQuat: xu,
  slerpUnitQuat: Tp,
  toEulerFromQuat: cp,
  toEulerXYZfromOrderedEuler: op,
  toOrderedEulerFromQuat: no,
  toOrderedEulerFromQuat2: lp,
  zeroQuat: we
}, Symbol.toStringTag, { value: "Module" }));
function yu(r, e) {
  return [r, e];
}
function yp(r, e, t) {
  return t = t || [0, 0, 0], Ke(r[0], Pe(r[1], e), t);
}
function Ru(r, e, t) {
  return t = t || [
    [0, 0, 0],
    [0, 0, 0]
  ], Tt(r, t[0]), ot(qe(e, r), t[1]), t;
}
const Rp = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ray: yu,
  rayFromPoints: Ru,
  rayToLocation: yp
}, Symbol.toStringTag, { value: "Module" })), oo = [0, 0, 0], fn = [0, 0, 0], Ss = [0, 0, 0], _p = [0, 0, 0];
function Xi(r, e, t) {
  return t ? (t[0] = r, t[1] = e, t) : [r, e];
}
function Ap(r, e) {
  return Xi(r[0], r[1], e);
}
function Mp(r, e, t) {
  return Xi(ot(r, oo), e, t);
}
function Ip(r, e, t, i) {
  const n = ot(
    Ze(
      qe(e, r, fn),
      qe(t, r, Ss),
      _p
    ),
    fn
  ), s = ct(n, r);
  return Xi(n, s, i);
}
function Sp(r, e, t) {
  const i = ct(e, r);
  return Xi(e, i, t);
}
function Tn(r, e) {
  return ct(r[0], e) - r[1];
}
function Cp(r, e, t) {
  const i = Tn(r, e);
  return Ke(e, Pe(r[0], -i, oo), t);
}
function Np(r, e, t) {
  const i = Tn(r, e);
  return Ke(e, Pe(r[0], i, oo), t);
}
function Op(r, e, t) {
  const { 0: i, 1: n } = e, s = qe(n, i, fn), a = ct(r[0], s);
  if (Math.abs(a) < 1e-6)
    return null;
  const o = -(ct(r[0], i) + r[1]) / a;
  return Ke(i, Pe(s, o, Ss), t);
}
function Lp(r, e, t) {
  const { 0: i, 1: n } = e, s = qe(n, i, fn), a = ct(r[0], s);
  if (Math.abs(a) < 1e-6)
    return null;
  const o = -(ct(r[0], i) + r[1]) / a;
  return o < 0 || o > 1 ? null : Ke(i, Pe(s, o, Ss), t);
}
function Fp(r, e, t) {
  const { 0: i, 1: n } = e, s = qe(n, i, fn), a = ct(r[0], s);
  if (Math.abs(a) < 1e-6)
    return null;
  const o = -(ct(r[0], i) + r[1]) / a;
  return Ke(i, Pe(s, o, Ss), t);
}
function Bp(r, e) {
  return Tn(r, e) > 0;
}
function Pp(r, e) {
  return Tn(r, e) < 0;
}
function Dp(r, e) {
  return Xi(r[0], -r[1], e);
}
function Up(r) {
  return r[0];
}
function kp(r) {
  return r[1];
}
const Gp = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  plane: Xi,
  planeCopy: Ap,
  planeDistance: Tn,
  planeFromPointAndDistance: Mp,
  planeFromPointAndNormal: Sp,
  planeFromPoints: Ip,
  planeInvert: Dp,
  planeLineIntersection: Op,
  planeLineSegmentIntersection: Lp,
  planeNormal: Up,
  planeOriginDistance: kp,
  planePointIsBehind: Pp,
  planePointIsInFront: Bp,
  planeProjectPoint: Cp,
  planeRayIntersection: Fp,
  planeReflectPoint: Np
}, Symbol.toStringTag, { value: "Module" })), NT = Wf, OT = Ep, LT = Rp, FT = nd, BT = Gp;
let Ve = class {
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
}, At = -1, as = 0, os = [], un = [], tn = [];
const Wi = /* @__PURE__ */ new Map(), Qi = (r) => {
  as = r;
  let e = !1;
  const t = [];
  Wi.forEach((n, s) => {
    e = !0;
    let {
      0: a,
      1: o,
      2: c,
      3: l,
      4: u,
      5: h
    } = n;
    if (l !== -1) {
      if (u === -1 && (u = r, n[4] = r), r - u >= l) {
        t.push(s), a(
          r - (h ? u : 0),
          u + l - (h ? u : 0)
        );
        return;
      }
    } else u === -1 && (u = r, n[4] = r);
    const d = h ? u : 0;
    if (o !== -1) {
      if (c === -1 && (n[2] = r, c = r), r - c >= o)
        for (a(r - d); r - c >= o; )
          n[2] += o, c += o;
    } else
      a(r - d);
  });
  for (let n = 0, s = t.length; n < s; ++n) {
    const a = t[n];
    Wi.delete(a);
  }
  const i = un.slice();
  un = [];
  for (let n = 0, s = i.length; n < s; ++n) {
    const { 0: a, 1: o, 2: c } = i[n];
    o <= 0 ? a && a(r) : r - c > o ? a(r) : (e = !0, un.push(i[n]));
  }
  for (let n = 0, s = tn.length; n < s; ++n) {
    const a = tn[n];
    a && (e = !0, a(r));
  }
  tn = os.slice(0), os = [], tn.length > 0 && (e = !0), e ? At = requestAnimationFrame(Qi) : At = -1;
};
At = requestAnimationFrame(Qi);
function _u(r) {
  const e = new Ve();
  return os.push((t) => {
    r && r(t), e.resolve(t);
  }), At === -1 && (At = requestAnimationFrame(Qi)), e.promise;
}
function lr(r, e) {
  const t = new Ve(), i = (n) => {
    r && r(n), t.resolve(n);
  };
  return un.push([i, e || -1, as]), At === -1 && (At = requestAnimationFrame(Qi)), t.promise;
}
function Au(r, e, t, i = !1) {
  const n = new Ve(), s = (a, o) => {
    r(a), t !== void 0 && t > 0 ? o !== void 0 && n.resolve(o) : n.resolve(a);
  };
  return Wi.set(n.promise, [
    s,
    e || -1,
    -1,
    t || -1,
    -1,
    i
  ]), At === -1 && (At = requestAnimationFrame(Qi)), n.promise;
}
function Jo(r) {
  Wi.delete(r), At === -1 && (At = requestAnimationFrame(Qi));
}
function DT() {
  Wi.forEach((r) => r[0](as, as)), Wi.clear(), un = [], os = [], tn = [];
}
const fi = /* @__PURE__ */ new Set(), Mu = fi.add.bind(fi), Iu = fi.delete.bind(fi), Su = async () => {
  await Au(
    () => {
      fi.size !== 0 && (fi.forEach((r) => r.update()), fi.clear());
    },
    void 0,
    Number.POSITIVE_INFINITY
  ), Su();
};
Su();
class Cu {
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
      const i = this._children[e];
      this._childUpdate.add(i), i.invalidate();
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
    let i = this._parent;
    for (; i && (t.push(i), i._parent && i._parent.needsUpdate); )
      i = i._parent;
    for (let n = t.length - 1; n >= 0; --n) {
      const s = t[n];
      e(s), s.resolve();
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
class co extends Cu {
  constructor(e) {
    super(), this.isQueuedForUpdate = !1, this.needsWorldOrientation = !1, this.needsWorldDecomposition = !1, this.hasViewMatrix = !1, this._instance = null, this._matrix = { value: se() }, this._localMatrix = { value: this._matrix.value }, this._rotation = { value: ss() }, this._localRotation = {
      value: this._rotation.value
    }, this.localRotationMatrix = Mr(), this._scale = { value: [1, 1, 1] }, this._localScale = { value: this._scale.value }, this._position = { value: [0, 0, 0] }, this._localPosition = {
      value: this._position.value
    }, this._forward = { value: Pi() }, this._localForward = { value: this._forward.value }, this.needsForwardUpdate = !1, e && (e.localPosition && (this.localPosition = e.localPosition), e.localRotation && (this.localRotation = e.localRotation), e.localScale && (this.localScale = e.localScale), e.parent && (this.parent = e.parent));
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
    return this.hasViewMatrix = !0, this._viewMatrix === void 0 && this.invalidate(), this.update(), this._viewMatrix === void 0 ? se() : this._viewMatrix.value;
  }
  /**
   * Returns the computed inverse of the view matrix.
   * WARN: If the view matrix is incapable of being inverted, the identity matrix
   * will be returned.
   */
  get inverseViewMatrix() {
    const e = this.viewMatrix;
    return this._invserseViewMatrix || (this._invserseViewMatrix = to(e) ?? se()), this._invserseViewMatrix;
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
    return this.hasViewMatrix = !0, this._localViewMatrix === void 0 && this.invalidate(), this.update(), this._localViewMatrix === void 0 ? se() : this._localViewMatrix.value;
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
    e ? (this._localTransform || (this._localTransform = { value: se() }), dn(e, this._localTransform.value), this._localTransform.didUpdate = !0) : delete this._localTransform, this.invalidate();
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
    e ? (this._localViewTransform || (this._localViewTransform = { value: se() }), dn(e, this._localViewTransform.value), this._localViewTransform.didUpdate = !0) : delete this._localViewTransform, this.invalidate();
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
    fe(this._localRotation.value, e[0], e[1], e[2], e[3]), this._localRotation.didUpdate = !0, this.invalidate(), this.needsForwardUpdate = !0;
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
    me(this._localScale.value, e[0], e[1], e[2]), this._localScale.didUpdate = !0, this.invalidate();
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
    return (this.needsForwardUpdate || (e = this.parent) != null && e.childUpdate.has(this)) && (this.needsForwardUpdate = !1, ca(
      Pi(),
      this._rotation.value,
      this._forward.value
    )), this._forward.value;
  }
  /**
   * The forward vector for this particular transform ignoring the parent
   * transform. When no parent is present, forward === localForward.
   */
  get localForward() {
    return this.needsForwardUpdate && (this.needsForwardUpdate = !1, ca(
      Pi(),
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
  applyLocalSRT(e, t, i) {
    this._localScale.value = e, this._localPosition.value = i, this._localRotation.value = t, this._localScale.didUpdate = !0, this._localPosition.didUpdate = !0, this._localRotation.didUpdate = !0, this.invalidate(), this._instance && (this._instance.transform = this);
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
    const e = this._matrix.value, t = this._position.value, i = this._scale.value;
    this._position.didUpdate = t[0] !== e[12] || t[1] !== e[13] || t[2] !== e[14], this._position.didUpdate && me(t, e[12], e[13], e[14]);
    const n = Gr(e[0], e[1], e[2], e[3]), s = Gr(e[4], e[5], e[6], e[7]), a = Gr(e[8], e[9], e[10], e[11]);
    this._scale.didUpdate = i[0] !== n || i[1] !== s || i[2] !== a, me(i, n, s, a), this._scale.didUpdate = !0;
    const [o, c, l, u] = this._rotation.value;
    ao(this._matrix.value, n, s, a, this._rotation.value);
    const h = this._rotation.value;
    this._rotation.didUpdate = h[0] !== o || h[1] !== c || h[2] !== l || h[3] !== u;
  }
  /**
   * Orients this transform to make the forward direction point toward a
   * position relative to this transform. When no parent is present, lookAt and
   * lookAtLocal behaves exactly the same.
   */
  lookAtLocal(e, t) {
    Eu(
      qe(e, this._localPosition.value, He[0]),
      t || [0, 1, 0],
      this._localRotation.value
    ), this._localRotation.didUpdate = !0, this.invalidate(), this.needsForwardUpdate = !0;
  }
  /**
   * Makes world space and local space information have it's own memory
   * allotment as they should be different after calling this method.
   */
  divideMemory() {
    this._forward.value = Pi(), this._matrix.value = se(), this._rotation.value = ss(), this._scale.value = [1, 1, 1], this._position.value = [0, 0, 0], this.hasViewMatrix && this._viewMatrix && this._localViewMatrix && (this._viewMatrix.value = se());
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
    !this.isQueuedForUpdate && this._instance && this._instance.active && (this.isQueuedForUpdate = !0, Mu(this));
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
    if (this.isQueuedForUpdate && (Iu(this), this.isQueuedForUpdate = !1), this.needsUpdate) {
      const i = this.localRotationMatrix;
      this._localRotation.didUpdate && oa(this._localRotation.value, i), this._localTransform ? (sa(this._localScale.value, i, this._localPosition.value, Ge[0]), bt(
        this._localTransform.value,
        Ge[0],
        this._localMatrix.value
      )) : sa(
        this._localScale.value,
        i,
        this._localPosition.value,
        this._localMatrix.value
      ), this._localMatrix.didUpdate = !0, t = !0, this.hasViewMatrix && (this._invserseViewMatrix = void 0, this._viewMatrix === void 0 && (this._viewMatrix = { value: se() }), this._localViewMatrix === void 0 && (this.parent ? this._localViewMatrix = { value: se() } : this._localViewMatrix = { value: this._viewMatrix.value }), this._localViewTransform ? (jn(
        an(this._localScale.value, He[0]),
        Wn(i, Bi[1]),
        Pe(this._localPosition.value, -1, He[1]),
        Ge[0]
      ), bt(
        this._localViewTransform.value,
        Ge[0],
        this._localViewMatrix.value
      )) : jn(
        an(this._localScale.value, He[0]),
        Wn(i, Bi[1]),
        Pe(this._localPosition.value, -1, He[1]),
        this._localViewMatrix.value
      ), this._localViewMatrix.didUpdate = !0);
    }
    this.parent && (this.parent.needsUpdate ? (e || this.processParentUpdates((i) => {
      i.update(!0);
    }), t = !0) : this.parent.childUpdate.has(this) && (t = !0), t && (bt(
      this.parent._matrix.value,
      this._localMatrix.value,
      this._matrix.value
    ), this._matrix.didUpdate = !0, this.needsWorldDecomposition = !0, this.hasViewMatrix && this._viewMatrix && this._localViewMatrix && (this.parent.hasViewMatrix && this.parent._viewMatrix && this.parent._localViewMatrix ? bt(
      this.parent._viewMatrix.value,
      this._localViewMatrix.value,
      this._viewMatrix.value
    ) : (oa(this.parent.rotation, Bi[0]), jn(
      an(this.parent._scale.value, He[0]),
      Wn(Bi[0], Bi[1]),
      Pe(this.parent._position.value, -1, He[1]),
      Ge[0]
    ), bt(
      this._localViewMatrix.value,
      Ge[0],
      this._viewMatrix.value
    )), this._viewMatrix.didUpdate = !0))), this.decomposeWorldMatrix(), this._instance && this._instance.active && (this._localMatrix.didUpdate || this._matrix.didUpdate) && (this._instance.needsLocalUpdate && (this._localRotation.didUpdate && (this._instance._localRotation = this._localRotation.value), this._localPosition.didUpdate && (this._instance._localPosition = this._localPosition.value), this._localScale.didUpdate && (this._instance._localScale = this._localScale.value)), this._instance.needsWorldUpdate && (this.parent ? (this._rotation.didUpdate && (this._instance._rotation = this._rotation.value), this._scale.didUpdate && (this._instance._scale = this._scale.value), this._position.didUpdate && (this._instance._position = this._position.value)) : (this._localRotation.didUpdate && (this._instance._rotation = this._localRotation.value), this._localPosition.didUpdate && (this._instance._position = this._localPosition.value), this._localScale.didUpdate && (this._instance._scale = this._localScale.value))), this._matrix.didUpdate && (this._instance._matrix = this._matrix.value), this._localMatrix.didUpdate && (this._instance._localMatrix = this._localMatrix.value, this.parent || (this._instance._matrix = this._matrix.value))), this._localScale.didUpdate = !1, this._localRotation.didUpdate = !1, this._localPosition.didUpdate = !1, this._rotation.didUpdate = !1, this._scale.didUpdate = !1, this._position.didUpdate = !1, this._matrix.didUpdate = !1, this._localMatrix.didUpdate = !1, this.resolve();
  }
}
const zp = new co();
function Nu(r, e) {
  return !r || !e ? r === e : !Object.keys(Object.assign({}, r, e)).find(
    (t) => r[t] !== e[t]
  );
}
var jr = /* @__PURE__ */ ((r) => (r[r.PERSPECTIVE = 0] = "PERSPECTIVE", r[r.ORTHOGRAPHIC = 1] = "ORTHOGRAPHIC", r))(jr || {});
function ec(r) {
  return r.projectionOptions.type === 1 && "left" in r.projectionOptions;
}
function la(r) {
  return r.projectionOptions.type === 0 && "fov" in r.projectionOptions;
}
class Hr {
  constructor(e) {
    this._id = P(), this.animationEndTime = 0, this.viewChangeViewId = "", this.transform = new co(), this._projection = se(), this._needsUpdate = !0, this._viewProjection = se(), this._inverseViewProjection = void 0, this._projectionOptions = e, this._needsUpdate = !0, this.onChange = e.onViewChange, this.update();
  }
  /**
   * Provide an identifier for the camera to follow the pattern of most
   * everything in this framework.
   */
  get id() {
    return this._id;
  }
  /**
   * Performs the broadcast of changes for the camera if the camera needed a
   * broadcast.
   */
  broadcast(e) {
    this.onChange && this.onChange(this, e);
  }
  /**
   * Quick generation of a camera with properties. None make any sense and
   * should be set appropriately. ie - View2D handles setting these values
   * correctly for you.
   */
  static makeOrthographic(e) {
    return new Hr(
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
    return new Hr(
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
  /**
   * Gets the computed inverse of the view matrix.
   */
  get inverseView() {
    return this.transform.inverseViewMatrix;
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
    this._needsUpdate = this._needsUpdate || !es(e, this.transform.position), this.transform.position = e;
  }
  /**
   * The camera must always look at a position within the world. This in
   * conjunction with 'roll' defines the orientation of the camera viewing the
   * world.
   */
  lookAt(e, t) {
    const i = dn(this.transform.matrix);
    this.transform.lookAtLocal(e, t || [0, 1, 0]), this._needsUpdate = this._needsUpdate || !gu(i, this.transform.matrix);
  }
  /**
   * This is a scale distortion the camera views the world with. A scale of 2
   * along an axis, means the camera will view 2x the amount of the world along
   * that axis (thus having a visual compression if the screen dimensions do not
   * change).
   *
   * This also has the added benefit of quickly and easily swapping axis
   * directions by simply making the scale -1 for any of the axis.
   */
  get scale() {
    return this.transform.scale;
  }
  set scale(e) {
    this._needsUpdate = this._needsUpdate || !es(e, this.transform.scale), this.transform.scale = e;
  }
  /**
   * Options used for making the projection of the camera. Set new options to
   * update the projection. Getting the options returns a copy of the object and
   * is not the internal object itself.
   */
  get projectionOptions() {
    return this._projectionOptions;
  }
  set projectionOptions(e) {
    this._needsUpdate = this._needsUpdate || !Nu(e, this._projectionOptions), this._projectionOptions = e;
  }
  /**
   * Provides the combined view projection matrices. Applies view first then the
   * projection multiply(P, V).
   */
  get viewProjection() {
    return this.update(!0), this._viewProjection;
  }
  /**
   * Gets the computed inverse of the view projection matrix. If the view or
   * projection is modified, the inverse will be invalidated and recomputed.
   */
  get inverseViewProjection() {
    const e = this.viewProjection;
    return this._inverseViewProjection || (this._inverseViewProjection = to(e) ?? se()), this._inverseViewProjection;
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
    ), this._needsUpdate = !0;
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
    ), this._needsUpdate = !0;
  }
  /**
   * This marks the camera's changes as resolved and responded to.
   */
  resolve() {
    this._needsUpdate = !1;
  }
  /**
   * Updates the transform matrices associated with this camera.
   */
  update(e) {
    (this._needsUpdate || e) && (this._inverseViewProjection = void 0, this.updateProjection());
  }
  /**
   * This makes the projection tightly fit it's frustum to include the points
   * provided. The points provided are expected to be in WORLD SPACE unelss
   * otherwise noted.
   */
  fitProjectionToPoints(e, t = !1) {
    const i = this.view, n = t ? e : e.map((h) => {
      const [d, p, g] = h, m = hn(i, [d, p, g, 1]);
      return [m[0], m[1], m[2]];
    });
    let s = 1 / 0, a = 1 / 0, o = 1 / 0, c = -1 / 0, l = -1 / 0, u = -1 / 0;
    for (const [h, d, p] of n)
      s = Math.min(s, h), c = Math.max(c, h), a = Math.min(a, d), l = Math.max(l, d), o = Math.min(o, p), u = Math.max(u, p);
    if (ec(this))
      this.projectionOptions = {
        ...this.projectionOptions,
        left: s,
        right: c,
        bottom: a,
        top: l,
        near: o,
        far: u
      };
    else if (la(this)) {
      const h = this.projectionOptions.width, d = this.projectionOptions.height, p = h / d;
      let g = 0, m = 0;
      for (const [y, C, I] of n)
        I <= 0.01 || (g = Math.max(g, Math.abs(C / I)), m = Math.max(m, Math.abs(y / I)));
      const T = 2 * Math.atan(g), x = 2 * Math.atan(m / p), b = Math.max(T, x), v = Math.max(0.01, o), E = u;
      this.projectionOptions = {
        ...this.projectionOptions,
        near: v,
        far: E,
        fov: b
      };
    }
    this._needsUpdate = !0, this.update(!0);
  }
  /**
   * Takes the current projection options and produces the projection matrix
   * needed to project elements to the screen.
   */
  updateProjection() {
    ec(this) ? fu(
      this.projectionOptions.left,
      this.projectionOptions.right,
      this.projectionOptions.bottom,
      this.projectionOptions.top,
      this.projectionOptions.near,
      this.projectionOptions.far,
      this._projection
    ) : la(this) && du(
      this.projectionOptions.fov,
      this.projectionOptions.width,
      this.projectionOptions.height,
      this.projectionOptions.near,
      this.projectionOptions.far,
      this._projection
    ), bt(
      this._projection,
      this.transform.viewMatrix,
      this._viewProjection
    ), this._needsUpdate = !1;
  }
}
const { ceil: Vp, max: Ou, log2: $p, pow: Wp, sqrt: jp } = Math, it = [-1, -1];
function Hp(r, e) {
  const { width: t, height: i } = r;
  let n;
  const s = [], a = [];
  for (let o = 0; o < t; ++o) {
    s[o] = [], a[o] = [];
    for (let c = 0; c < i; ++c) {
      const l = c * (t * 4) + o * 4;
      n = e[l + 3], n ? (s[o][c] = [o, c], a[o][c] = it) : (s[o][c] = it, a[o][c] = [o, c]);
    }
  }
  return {
    seed: s,
    inverse: a
  };
}
function Xp(r) {
  const e = [];
  for (let t = 0, i = r.length; t < i; ++t)
    e[t] = [];
  return e;
}
function tc(r, e, t = !1) {
  const i = t ? -1 : 1;
  let n, s, a, o;
  const c = [];
  let l = -1;
  for (let u = 0, h = r.length; u < h; ++u) {
    const d = r[u];
    c[u] = [];
    for (let p = 0, g = d.length; p < g; ++p)
      n = d[p], n === e ? o = 256 : (s = [u, p], a = Re(n, s), o = jp(gn(a, a))), c[u][p] = o, l = Ou(o, l);
  }
  for (let u = 0, h = r.length; u < h; ++u) {
    const d = r[u];
    for (let p = 0, g = d.length; p < g; ++p)
      o = c[u][p], c[u][p] = o / l * 255 * i;
  }
  return c;
}
function Qp(r, e, t, i) {
  let n;
  const s = tc(r, t, !0), a = tc(
    e,
    t,
    !1
  ), o = s.length, c = s;
  for (let l = 0, u = s.length; l < u; ++l) {
    const h = s[l], d = a[l];
    for (let p = 0, g = h.length; p < g; ++p) {
      const m = h[p], T = d[p];
      h[p] = m + T;
    }
  }
  for (let l = 0, u = c.length; l < u; ++l) {
    const h = c[l];
    for (let d = 0, p = h.length; d < p; ++d) {
      n = h[d];
      const g = d * (o * 4) + l * 4;
      i[g] = n, i[g + 1] = n, i[g + 2] = n, i[g + 3] = 255;
    }
  }
}
function rc(r, e) {
  const t = r.length, i = r[0].length;
  let n = Xp(r), s = r, a, o, c, l, u, h, d, p, g;
  for (let m = 0; m < e; ++m) {
    const T = n;
    n = s, s = T;
    const x = Wp(2, e - m - 1);
    for (d = 0; d < t; ++d)
      for (p = 0; p < i; ++p) {
        for (a = [d, p], c = [
          (n[d - x] || [])[p - x] || it,
          (n[d] || [])[p - x] || it,
          (n[d + x] || [])[p - x] || it,
          (n[d - x] || [])[p] || it,
          (n[d] || [])[p] || it,
          (n[d + x] || [])[p] || it,
          (n[d - x] || [])[p + x] || it,
          (n[d] || [])[p + x] || it,
          (n[d + x] || [])[p + x] || it
        ], u = 0, l = Number.MAX_VALUE, g = 0; g < 9; ++g) {
          const b = c[g];
          b !== it && (o = Re(b, a), h = gn(o, o), h < l && (l = h, u = g));
        }
        s[d][p] = c[u];
      }
  }
  return s;
}
function UT(r, e = Qp) {
  const { width: t, height: i } = r, n = r.getContext("2d");
  if (!n) return;
  const s = n.getImageData(0, 0, t, i).data, a = Ou(t, i), o = Vp($p(a)), c = Hp(r, s), l = rc(c.seed, o), u = rc(c.inverse, o), h = new ImageData(t, i);
  e(l, u, it, h.data), n.putImageData(h, 0, 0);
}
function kT(r) {
}
class Ye {
  constructor(e, t, i, n) {
    this.child = [null, null], this.isLeaf = !0, this.data = null, this.bounds = new te({
      height: n,
      width: i,
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
    let t = this.child[0], i = this.child[1];
    if (!this.isLeaf && t && i) {
      const n = t.insert(e);
      return n !== null ? n : i.insert(e);
    } else {
      if (this.data) return null;
      const n = this.bounds.fits(e.bounds);
      if (n === 0) return null;
      if (n === 1)
        return this.data = e.data, this;
      this.isLeaf = !1;
      const s = e.bounds.width, a = e.bounds.height, o = this.bounds.width - s, c = this.bounds.height - e.bounds.height;
      o > c ? (t = this.child[0] = new Ye(
        this.bounds.x,
        this.bounds.y,
        s,
        this.bounds.height
      ), i = this.child[1] = new Ye(
        this.bounds.x + s,
        this.bounds.y,
        o,
        this.bounds.height
      )) : (t = this.child[0] = new Ye(
        this.bounds.x,
        this.bounds.y,
        this.bounds.width,
        a
      ), i = this.child[1] = new Ye(
        this.bounds.x,
        this.bounds.y + a,
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
    const t = this.child[0], i = this.child[1];
    if (i && t && !this.isLeaf) {
      let n = t.remove(e);
      return n ? !0 : (n = i.remove(e), t.hasChild() || i.hasChild() || (this.child[0] = null, this.child[1] = null), n);
    } else
      return this.data === e ? (this.data = null, !0) : !1;
  }
  /**
   * Applies a node's bounds to SubTexture.
   */
  static applyToSubTexture(e, t, i, n, s) {
    if (!i) return;
    n = n || {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0
    };
    const a = t instanceof Ye ? t.bounds : t, o = (a.x + n.left) / e.bounds.width, c = (a.y + n.top) / e.bounds.height, l = (a.width - n.left - n.right) / e.bounds.width, u = (a.height - n.top - n.bottom) / e.bounds.height;
    let h;
    s ? h = new te({
      bottom: 1 - c,
      left: o,
      right: o + l,
      top: 1 - (c + u)
    }) : h = new te({
      top: 1 - c,
      left: o,
      right: o + l,
      bottom: 1 - (c + u)
    });
    const d = h.bottom, p = h.y, g = h.x, m = h.x + h.width;
    i.atlasTL = [g, p], i.atlasBR = [m, d], i.atlasBL = [g, d], i.atlasTR = [m, p], i.widthOnAtlas = Math.abs(i.atlasTR[0] - i.atlasTL[0]), i.heightOnAtlas = Math.abs(i.atlasTR[1] - i.atlasBR[1]), i.pixelWidth = l * e.bounds.width, i.pixelHeight = u * e.bounds.height;
  }
}
function Lu(r) {
  return r && r.call !== void 0 && r.apply !== void 0;
}
function pi(r, e, t) {
  let i = r.get(e);
  return i === void 0 && (Lu(t) ? i = t() : i = t, r.set(e, i)), i;
}
function ua(r, e, t) {
  let i = r.get(e);
  return i === void 0 && (Lu(t) ? i = t() : i = t), i;
}
const ds = class ds {
};
ds.transparentShapeBlending = {
  blending: {
    blendDst: f.Material.BlendingDstFactor.OneMinusSrcAlpha,
    blendEquation: f.Material.BlendingEquations.Add,
    blendSrc: f.Material.BlendingSrcFactor.SrcAlpha
  },
  culling: f.Material.CullSide.NONE,
  modify(e) {
    return Object.assign({}, this, e);
  }
}, ds.transparentImageBlending = {
  blending: {
    blendSrc: f.Material.BlendingSrcFactor.One,
    blendDst: f.Material.BlendingDstFactor.OneMinusSrcAlpha,
    blendEquation: f.Material.BlendingEquations.Add
  },
  culling: f.Material.CullSide.NONE,
  modify(e) {
    return Object.assign({}, this, e);
  }
};
let lt = ds;
const O = class O {
};
O.RGB = (e = !1, t = f.Texture.SourcePixelFormat.UnsignedByte) => ({
  format: f.Texture.TexelDataType.RGB,
  internalFormat: f.Texture.TexelDataType.RGB,
  type: t,
  generateMipMaps: e
}), O.RGBA = (e = !1, t = f.Texture.SourcePixelFormat.UnsignedByte) => ({
  format: f.Texture.TexelDataType.RGBA,
  internalFormat: f.Texture.TexelDataType.RGBA,
  type: t,
  generateMipMaps: e
}), O.LUMINANCE_ALPHA = (e = !1, t = f.Texture.SourcePixelFormat.UnsignedByte) => ({
  format: f.Texture.TexelDataType.LuminanceAlpha,
  internalFormat: f.Texture.TexelDataType.LuminanceAlpha,
  type: t,
  generateMipMaps: e
}), O.LUMINANCE = (e = !1, t = f.Texture.SourcePixelFormat.UnsignedByte) => ({
  format: f.Texture.TexelDataType.Luminance,
  internalFormat: f.Texture.TexelDataType.Luminance,
  type: t,
  generateMipMaps: e
}), O.ALPHA = (e = !1, t = f.Texture.SourcePixelFormat.UnsignedByte) => ({
  format: f.Texture.TexelDataType.Alpha,
  internalFormat: f.Texture.TexelDataType.Alpha,
  type: t,
  generateMipMaps: e
}), O.R8 = (e = !1, t = f.Texture.SourcePixelFormat.UnsignedByte, i = f.Texture.TextureMinFilter.Nearest, n = f.Texture.TextureMagFilter.Nearest) => ({
  format: f.Texture.TexelDataType.RED,
  internalFormat: f.Texture.TexelDataType.R8,
  type: t,
  minFilter: i,
  magFilter: n,
  generateMipMaps: e
}), O.R8_SNORM = (e = !1, t = f.Texture.SourcePixelFormat.Byte, i = f.Texture.TextureMinFilter.Nearest, n = f.Texture.TextureMagFilter.Nearest) => ({
  format: f.Texture.TexelDataType.RED,
  internalFormat: f.Texture.TexelDataType.R8_SNORM,
  type: t,
  minFilter: i,
  magFilter: n,
  generateMipMaps: e
}), O.R16F = (e = !1, t = f.Texture.SourcePixelFormat.HalfFloat, i = f.Texture.TextureMinFilter.Nearest, n = f.Texture.TextureMagFilter.Nearest) => ({
  format: f.Texture.TexelDataType.RED,
  internalFormat: f.Texture.TexelDataType.R16F,
  type: t,
  minFilter: i,
  magFilter: n,
  generateMipMaps: e
}), O.R32F = (e = f.Texture.SourcePixelFormat.Float) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RED,
  internalFormat: f.Texture.TexelDataType.R32F,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.R8UI = (e = f.Texture.SourcePixelFormat.UnsignedByte) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RED_INTEGER,
  internalFormat: f.Texture.TexelDataType.R8UI,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.R8I = (e = f.Texture.SourcePixelFormat.Byte) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RED_INTEGER,
  internalFormat: f.Texture.TexelDataType.R8I,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.R16UI = (e = f.Texture.SourcePixelFormat.UnsignedShort) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RED_INTEGER,
  internalFormat: f.Texture.TexelDataType.R16UI,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.R16I = (e = f.Texture.SourcePixelFormat.Short) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RED_INTEGER,
  internalFormat: f.Texture.TexelDataType.R16I,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.R32UI = (e = f.Texture.SourcePixelFormat.UnsignedInt) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RED_INTEGER,
  internalFormat: f.Texture.TexelDataType.R32UI,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.R32I = (e = f.Texture.SourcePixelFormat.Int) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RED_INTEGER,
  internalFormat: f.Texture.TexelDataType.R32I,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.RG8 = (e = !1, t = f.Texture.SourcePixelFormat.UnsignedByte, i = f.Texture.TextureMinFilter.Nearest, n = f.Texture.TextureMagFilter.Nearest) => ({
  format: f.Texture.TexelDataType.RG,
  internalFormat: f.Texture.TexelDataType.RG8,
  type: t,
  minFilter: i,
  magFilter: n,
  generateMipMaps: e
}), O.RG8_SNORM = (e = !1, t = f.Texture.SourcePixelFormat.Byte, i = f.Texture.TextureMinFilter.Nearest, n = f.Texture.TextureMagFilter.Nearest) => ({
  format: f.Texture.TexelDataType.RG,
  internalFormat: f.Texture.TexelDataType.RG8_SNORM,
  type: t,
  minFilter: i,
  magFilter: n,
  generateMipMaps: e
}), O.RG16F = (e = !1, t = f.Texture.SourcePixelFormat.HalfFloat, i = f.Texture.TextureMinFilter.Nearest, n = f.Texture.TextureMagFilter.Nearest) => ({
  format: f.Texture.TexelDataType.RG,
  internalFormat: f.Texture.TexelDataType.RG16F,
  type: t,
  minFilter: i,
  magFilter: n,
  generateMipMaps: e
}), O.RG32F = (e = f.Texture.SourcePixelFormat.Float) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RG,
  internalFormat: f.Texture.TexelDataType.RG32F,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest,
  wrapHorizontal: f.Texture.Wrapping.CLAMP_TO_EDGE,
  wrapVertical: f.Texture.Wrapping.CLAMP_TO_EDGE
}), O.RG8UI = (e = f.Texture.SourcePixelFormat.UnsignedByte) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RG_INTEGER,
  internalFormat: f.Texture.TexelDataType.RG8UI,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest,
  wrapHorizontal: f.Texture.Wrapping.CLAMP_TO_EDGE,
  wrapVertical: f.Texture.Wrapping.CLAMP_TO_EDGE
}), O.RG8I = (e = f.Texture.SourcePixelFormat.Byte) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RG_INTEGER,
  internalFormat: f.Texture.TexelDataType.RG8I,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.RG16UI = (e = f.Texture.SourcePixelFormat.UnsignedShort) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RG_INTEGER,
  internalFormat: f.Texture.TexelDataType.RG16UI,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.RG16I = (e = f.Texture.SourcePixelFormat.Short) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RG_INTEGER,
  internalFormat: f.Texture.TexelDataType.RG16I,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.RG32UI = (e = f.Texture.SourcePixelFormat.UnsignedInt) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RG_INTEGER,
  internalFormat: f.Texture.TexelDataType.RG32UI,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.RG32I = (e = f.Texture.SourcePixelFormat.Int) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RG_INTEGER,
  internalFormat: f.Texture.TexelDataType.RG32I,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.RGB8 = (e = !1, t = f.Texture.SourcePixelFormat.UnsignedByte, i = f.Texture.TextureMinFilter.Nearest, n = f.Texture.TextureMagFilter.Nearest) => ({
  format: f.Texture.TexelDataType.RGB,
  internalFormat: f.Texture.TexelDataType.RGB8,
  type: t,
  minFilter: i,
  magFilter: n,
  generateMipMaps: e
}), O.SRGB8 = (e = !1, t = f.Texture.SourcePixelFormat.UnsignedByte, i = f.Texture.TextureMinFilter.Nearest, n = f.Texture.TextureMagFilter.Nearest) => ({
  format: f.Texture.TexelDataType.RGB,
  internalFormat: f.Texture.TexelDataType.SRGB8,
  type: t,
  minFilter: i,
  magFilter: n,
  generateMipMaps: e
}), O.RGB565 = (e = !1, t = f.Texture.SourcePixelFormat.HalfFloat, i = f.Texture.TextureMinFilter.Nearest, n = f.Texture.TextureMagFilter.Nearest) => ({
  format: f.Texture.TexelDataType.RGB,
  internalFormat: f.Texture.TexelDataType.RGB565,
  type: t,
  minFilter: i,
  magFilter: n,
  generateMipMaps: e
}), O.RGB8_SNORM = (e = !1, t = f.Texture.SourcePixelFormat.Byte, i = f.Texture.TextureMinFilter.Nearest, n = f.Texture.TextureMagFilter.Nearest) => ({
  format: f.Texture.TexelDataType.RGB,
  internalFormat: f.Texture.TexelDataType.RGB8_SNORM,
  type: t,
  minFilter: i,
  magFilter: n,
  generateMipMaps: e
}), O.R11F_G11F_B10F = (e = !1, t = f.Texture.SourcePixelFormat.HalfFloat, i = f.Texture.TextureMinFilter.Nearest, n = f.Texture.TextureMagFilter.Nearest) => ({
  format: f.Texture.TexelDataType.RGB,
  internalFormat: f.Texture.TexelDataType.R11F_G11F_B10F,
  type: t,
  minFilter: i,
  magFilter: n,
  generateMipMaps: e
}), O.RGB9_E5 = (e = !1, t = f.Texture.SourcePixelFormat.HalfFloat, i = f.Texture.TextureMinFilter.Nearest, n = f.Texture.TextureMagFilter.Nearest) => ({
  format: f.Texture.TexelDataType.RGB,
  internalFormat: f.Texture.TexelDataType.RGB9_E5,
  type: t,
  minFilter: i,
  magFilter: n,
  generateMipMaps: e
}), O.RGB16F = (e = !1, t = f.Texture.SourcePixelFormat.HalfFloat | f.Texture.SourcePixelFormat.Float, i = f.Texture.TextureMinFilter.Nearest, n = f.Texture.TextureMagFilter.Nearest) => ({
  format: f.Texture.TexelDataType.RGB,
  internalFormat: f.Texture.TexelDataType.RGB16F,
  type: t,
  minFilter: i,
  magFilter: n,
  generateMipMaps: e
}), O.RGB32F = (e = f.Texture.SourcePixelFormat.Float) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RGB,
  internalFormat: f.Texture.TexelDataType.RGB32F,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.RGB8UI = (e = f.Texture.SourcePixelFormat.UnsignedByte) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RGB_INTEGER,
  internalFormat: f.Texture.TexelDataType.RGB8UI,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.RGB8I = (e = f.Texture.SourcePixelFormat.Byte) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RGB_INTEGER,
  internalFormat: f.Texture.TexelDataType.RGB8I,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.RGB16UI = (e = f.Texture.SourcePixelFormat.UnsignedShort) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RGB_INTEGER,
  internalFormat: f.Texture.TexelDataType.RGB16UI,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.RGB16I = (e = f.Texture.SourcePixelFormat.Short) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RGB_INTEGER,
  internalFormat: f.Texture.TexelDataType.RGB16I,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.RGB32UI = (e = f.Texture.SourcePixelFormat.UnsignedInt) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RGB_INTEGER,
  internalFormat: f.Texture.TexelDataType.RGB32UI,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.RGB32I = (e = f.Texture.SourcePixelFormat.Int) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RGB_INTEGER,
  internalFormat: f.Texture.TexelDataType.RGB32I,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.RGBA8 = (e = !1, t = f.Texture.SourcePixelFormat.UnsignedByte, i = f.Texture.TextureMinFilter.Nearest, n = f.Texture.TextureMagFilter.Nearest) => ({
  format: f.Texture.TexelDataType.RGBA,
  internalFormat: f.Texture.TexelDataType.RGBA8,
  type: t,
  minFilter: i,
  magFilter: n,
  generateMipMaps: e
}), O.SRGB8_ALPHA8 = (e = !1, t = f.Texture.SourcePixelFormat.UnsignedByte, i = f.Texture.TextureMinFilter.Nearest, n = f.Texture.TextureMagFilter.Nearest) => ({
  format: f.Texture.TexelDataType.RGBA,
  internalFormat: f.Texture.TexelDataType.SRGB8_ALPHA8,
  type: t,
  minFilter: i,
  magFilter: n,
  generateMipMaps: e
}), O.RGBA8_SNORM = (e = !1, t = f.Texture.SourcePixelFormat.Byte, i = f.Texture.TextureMinFilter.Nearest, n = f.Texture.TextureMagFilter.Nearest) => ({
  format: f.Texture.TexelDataType.RGBA,
  internalFormat: f.Texture.TexelDataType.RGBA8_SNORM,
  type: t,
  minFilter: i,
  magFilter: n,
  generateMipMaps: e
}), O.RGB5_A1 = (e = !1, t = f.Texture.SourcePixelFormat.HalfFloat, i = f.Texture.TextureMinFilter.Nearest, n = f.Texture.TextureMagFilter.Nearest) => ({
  format: f.Texture.TexelDataType.RGBA,
  internalFormat: f.Texture.TexelDataType.RGB5_A1,
  type: t,
  minFilter: i,
  magFilter: n,
  generateMipMaps: e
}), O.RGBA4 = (e = !1, t = f.Texture.SourcePixelFormat.HalfFloat, i = f.Texture.TextureMinFilter.Nearest, n = f.Texture.TextureMagFilter.Nearest) => ({
  format: f.Texture.TexelDataType.RGBA,
  internalFormat: f.Texture.TexelDataType.RGBA4,
  type: t,
  minFilter: i,
  magFilter: n,
  generateMipMaps: e
}), O.RGB10_A2 = (e = !1, t = f.Texture.SourcePixelFormat.UnsignedInt, i = f.Texture.TextureMinFilter.Nearest, n = f.Texture.TextureMagFilter.Nearest) => ({
  format: f.Texture.TexelDataType.RGBA,
  internalFormat: f.Texture.TexelDataType.RGB10_A2,
  type: t,
  minFilter: i,
  magFilter: n,
  generateMipMaps: e
}), O.RGBA16F = (e = !1, t = f.Texture.SourcePixelFormat.HalfFloat, i = f.Texture.TextureMinFilter.Nearest, n = f.Texture.TextureMagFilter.Nearest) => ({
  format: f.Texture.TexelDataType.RGBA,
  internalFormat: f.Texture.TexelDataType.RGBA16F,
  type: t,
  minFilter: i,
  magFilter: n,
  generateMipMaps: e
}), O.RGBA32F = (e = f.Texture.SourcePixelFormat.Float) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RGBA,
  internalFormat: f.Texture.TexelDataType.RGBA32F,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.RGBA8UI = (e = f.Texture.SourcePixelFormat.UnsignedByte) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RGBA_INTEGER,
  internalFormat: f.Texture.TexelDataType.RGBA8UI,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.RGBA8I = (e = f.Texture.SourcePixelFormat.Byte) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RGBA_INTEGER,
  internalFormat: f.Texture.TexelDataType.RGBA8I,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.RGB10_A2UI = (e = f.Texture.SourcePixelFormat.UnsignedInt) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RGBA_INTEGER,
  internalFormat: f.Texture.TexelDataType.RGB10_A2UI,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.RGBA16UI = (e = f.Texture.SourcePixelFormat.UnsignedShort) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RGBA_INTEGER,
  internalFormat: f.Texture.TexelDataType.RGBA16UI,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.RGBA16I = (e = f.Texture.SourcePixelFormat.Short) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RGBA_INTEGER,
  internalFormat: f.Texture.TexelDataType.RGBA16I,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.RGBA32UI = (e = f.Texture.SourcePixelFormat.UnsignedInt) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RGBA_INTEGER,
  internalFormat: f.Texture.TexelDataType.RGBA32UI,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.RGBA32I = (e = f.Texture.SourcePixelFormat.Int) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.RGBA_INTEGER,
  internalFormat: f.Texture.TexelDataType.RGBA32I,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest
}), O.DEPTH_COMPONENT16 = (e = f.Texture.SourcePixelFormat.UnsignedShort) => ({
  format: f.Texture.TexelDataType.DepthComponent,
  internalFormat: f.Texture.TexelDataType.DEPTH_COMPONENT16,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest,
  wrapHorizontal: f.Texture.Wrapping.CLAMP_TO_EDGE,
  wrapVertical: f.Texture.Wrapping.CLAMP_TO_EDGE
}), O.DEPTH_COMPONENT24 = (e = f.Texture.SourcePixelFormat.UnsignedInt) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.DepthComponent,
  internalFormat: f.Texture.TexelDataType.DEPTH_COMPONENT24,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest,
  wrapHorizontal: f.Texture.Wrapping.CLAMP_TO_EDGE,
  wrapVertical: f.Texture.Wrapping.CLAMP_TO_EDGE
}), O.DEPTH_COMPONENT32F = (e = f.Texture.SourcePixelFormat.Float) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.DepthComponent,
  internalFormat: f.Texture.TexelDataType.DEPTH_COMPONENT32F,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest,
  wrapHorizontal: f.Texture.Wrapping.CLAMP_TO_EDGE,
  wrapVertical: f.Texture.Wrapping.CLAMP_TO_EDGE
}), O.DEPTH24_STENCIL8 = (e = f.Texture.SourcePixelFormat.UnsignedInt_24_8) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.DepthStencil,
  internalFormat: f.Texture.TexelDataType.DEPTH24_STENCIL8,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest,
  wrapHorizontal: f.Texture.Wrapping.CLAMP_TO_EDGE,
  wrapVertical: f.Texture.Wrapping.CLAMP_TO_EDGE
}), O.DEPTH32F_STENCIL8 = (e = f.Texture.SourcePixelFormat.Float32UnsignedInt_24_8_REV) => ({
  generateMipMaps: !1,
  format: f.Texture.TexelDataType.DepthStencil,
  internalFormat: f.Texture.TexelDataType.DEPTH32F_STENCIL8,
  type: e,
  minFilter: f.Texture.TextureMinFilter.Nearest,
  magFilter: f.Texture.TextureMagFilter.Nearest,
  wrapHorizontal: f.Texture.Wrapping.CLAMP_TO_EDGE,
  wrapVertical: f.Texture.Wrapping.CLAMP_TO_EDGE
});
let ic = O;
class GT {
  /**
   * This retrieves all easing metrics for every instance for every specified eased attribute.
   */
  static async modify(e, t, i) {
    for (let n = 0, s = t.length; n < s; ++n) {
      const a = t[n];
      for (let o = 0, c = e.length; o < c; ++o) {
        const l = e[o], u = l.getEasing(a);
        u && i(u, l, o, n);
      }
    }
  }
  /**
   * This finds all easing controls requested for all instances.
   *
   * If wait is true, then this method's returned promise will resolve AFTER the time
   * of all discovered easing objects has passed.
   */
  static async all(e, t, i, n) {
    let s = Oa;
    const a = new Promise((l) => s = l);
    let o = 0;
    for (let l = 0, u = i.length; l < u; ++l) {
      const h = i[l];
      for (let d = 0, p = t.length; d < p; ++d) {
        const g = t[d], m = g.getEasing(h);
        m && (n && n(m, g, d, l), o = Math.max(
          (m.delay || 0) + m.duration,
          o
        ));
      }
    }
    const c = (l) => {
      l < o ? lr(c) : s();
    };
    return e ? lr((l) => {
      o += l, c(l);
    }) : s(), a;
  }
}
var Yp = !!(typeof window < "u" && window.document && window.document.createElement), Fu = {
  canUseDOM: Yp
}, Bu;
Fu.canUseDOM && (Bu = document.implementation && document.implementation.hasFeature && // always returns true in newer browsers as per the standard.
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
function qp(r, e) {
  if (!Fu.canUseDOM || e)
    return !1;
  var t = "on" + r, i = t in document;
  if (!i) {
    var n = document.createElement("div");
    n.setAttribute(t, "return;"), i = typeof n[t] == "function";
  }
  return !i && Bu && r === "wheel" && (i = document.implementation.hasFeature("Events.wheel", "3.0")), i;
}
var nc = !1, ii, ha, da, Hn, Xn, Pu, Qn, fa, pa, ga, Du, ma, xa, Uu, ku;
function We() {
  if (!nc) {
    nc = !0;
    var r = navigator.userAgent, e = /(?:MSIE.(\d+\.\d+))|(?:(?:Firefox|GranParadiso|Iceweasel).(\d+\.\d+))|(?:Opera(?:.+Version.|.)(\d+\.\d+))|(?:AppleWebKit.(\d+(?:\.\d+)?))|(?:Trident\/\d+\.\d+.*rv:(\d+\.\d+))/.exec(
      r
    ), t = /(Mac OS X)|(Windows)|(Linux)/.exec(r);
    if (ma = /\b(iPhone|iP[ao]d)/.exec(r), xa = /\b(iP[ao]d)/.exec(r), ga = /Android/i.exec(r), Uu = /FBAN\/\w+;/i.exec(r), ku = /Mobile/i.exec(r), Du = !!/Win64/.exec(r), e) {
      ii = e[1] ? parseFloat(e[1]) : e[5] ? parseFloat(e[5]) : NaN, ii && document && document.documentMode && (ii = document.documentMode);
      var i = /(?:Trident\/(\d+.\d+))/.exec(r);
      Pu = i ? parseFloat(i[1]) + 4 : ii, ha = e[2] ? parseFloat(e[2]) : NaN, da = e[3] ? parseFloat(e[3]) : NaN, Hn = e[4] ? parseFloat(e[4]) : NaN, Hn ? (e = /(?:Chrome\/(\d+\.\d+))/.exec(r), Xn = e && e[1] ? parseFloat(e[1]) : NaN) : Xn = NaN;
    } else
      ii = ha = da = Xn = Hn = NaN;
    if (t) {
      if (t[1]) {
        var n = /(?:Mac OS X (\d+(?:[._]\d+)?))/.exec(r);
        Qn = n ? parseFloat(n[1].replace("_", ".")) : !0;
      } else
        Qn = !1;
      fa = !!t[2], pa = !!t[3];
    } else
      Qn = fa = pa = !1;
  }
}
var Ta = {
  /**
   *  Check if the UA is Internet Explorer.
   *
   *
   *  @return float|NaN Version number (if match) or NaN.
   */
  ie: function() {
    return We() || ii;
  },
  /**
   * Check if we're in Internet Explorer compatibility mode.
   *
   * @return bool true if in compatibility mode, false if
   * not compatibility mode or not ie
   */
  ieCompatibilityMode: function() {
    return We() || Pu > ii;
  },
  /**
   * Whether the browser is 64-bit IE.  Really, this is kind of weak sauce;  we
   * only need this because Skype can't handle 64-bit IE yet.  We need to remove
   * this when we don't need it -- tracked by #601957.
   */
  ie64: function() {
    return Ta.ie() && Du;
  },
  /**
   *  Check if the UA is Firefox.
   *
   *
   *  @return float|NaN Version number (if match) or NaN.
   */
  firefox: function() {
    return We() || ha;
  },
  /**
   *  Check if the UA is Opera.
   *
   *
   *  @return float|NaN Version number (if match) or NaN.
   */
  opera: function() {
    return We() || da;
  },
  /**
   *  Check if the UA is WebKit.
   *
   *
   *  @return float|NaN Version number (if match) or NaN.
   */
  webkit: function() {
    return We() || Hn;
  },
  /**
   *  For Push
   *  WILL BE REMOVED VERY SOON. Use UserAgent_DEPRECATED.webkit
   */
  safari: function() {
    return Ta.webkit();
  },
  /**
   *  Check if the UA is a Chrome browser.
   *
   *
   *  @return float|NaN Version number (if match) or NaN.
   */
  chrome: function() {
    return We() || Xn;
  },
  /**
   *  Check if the user is running Windows.
   *
   *  @return bool `true' if the user's OS is Windows.
   */
  windows: function() {
    return We() || fa;
  },
  /**
   *  Check if the user is running Mac OS X.
   *
   *  @return float|bool   Returns a float if a version number is detected,
   *                       otherwise true/false.
   */
  osx: function() {
    return We() || Qn;
  },
  /**
   * Check if the user is running Linux.
   *
   * @return bool `true' if the user's OS is some flavor of Linux.
   */
  linux: function() {
    return We() || pa;
  },
  /**
   * Check if the user is running on an iPhone or iPod platform.
   *
   * @return bool `true' if the user is running some flavor of the
   *    iPhone OS.
   */
  iphone: function() {
    return We() || ma;
  },
  mobile: function() {
    return We() || ma || xa || ga || ku;
  },
  nativeApp: function() {
    return We() || Uu;
  },
  android: function() {
    return We() || ga;
  },
  ipad: function() {
    return We() || xa;
  }
};
const sc = 10, ac = 40, oc = 800;
function Gu(r) {
  let e = 0, t = 0, i = 0, n = 0;
  return "detail" in r && (t = r.detail), "wheelDelta" in r && (t = -r.wheelDelta / 120), "wheelDeltaY" in r && (t = -r.wheelDeltaY / 120), "wheelDeltaX" in r && (e = -r.wheelDeltaX / 120), "axis" in r && r.axis === r.HORIZONTAL_AXIS && (e = t, t = 0), i = e * sc, n = t * sc, "deltaY" in r && (n = r.deltaY), "deltaX" in r && (i = r.deltaX), (i || n) && r.deltaMode && (r.deltaMode === 1 ? (i *= ac, n *= ac) : (i *= oc, n *= oc)), i && !e && (e = i < 1 ? -1 : 1), n && !t && (t = n < 1 ? -1 : 1), {
    spinX: e,
    spinY: -t,
    pixelX: i,
    pixelY: -n
  };
}
Gu.getEventType = function() {
  return Ta.firefox() ? "DOMMouseScroll" : qp("wheel") ? "wheel" : "mousewheel";
};
function Jt(r, e) {
  let t = 0, i = 0, n = 0, s = 0, a = e || r.nativeEvent && r.nativeEvent.target || r.target;
  if (r || (r = window.event), r.pageX || r.pageY)
    t = r.pageX, i = r.pageY;
  else if (r.clientX || r.clientY) {
    let o = 0, c = 0;
    document.documentElement && (o = document.documentElement.scrollLeft, c = document.documentElement.scrollTop), t = r.clientX + document.body.scrollLeft + o, i = r.clientY + document.body.scrollTop + c;
  }
  if (a.offsetParent)
    do
      n += a.offsetLeft, s += a.offsetTop, a = a.offsetParent;
    while (a);
  return [t - n, i - s];
}
const Kp = 5, Zp = 10;
class Jp {
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
    const i = e.mid;
    this.TL = new rn(e.x, i[0], e.y, i[1], t), this.TR = new rn(
      i[0],
      e.right,
      e.y,
      i[1],
      t
    ), this.BL = new rn(
      e.x,
      i[0],
      i[1],
      e.bottom,
      t
    ), this.BR = new rn(
      i[0],
      e.right,
      i[1],
      e.bottom,
      t
    );
  }
}
class rn {
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
  constructor(e, t, i, n, s) {
    this.children = [], this.depth = 0, arguments.length >= 4 ? this.bounds = new te({ left: e, right: t, top: i, bottom: n }) : this.bounds = new te({ left: 0, right: 1, top: 0, bottom: 1 }), this.depth = s || 0;
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
    let t = Number.MAX_SAFE_INTEGER, i = Number.MAX_SAFE_INTEGER, n = Number.MIN_SAFE_INTEGER, s = Number.MIN_SAFE_INTEGER;
    const { min: a, max: o } = Math;
    for (let c = 0, l = e.length; c < l; ++c) {
      const u = e[c];
      t = a(t, u.x), n = o(u.right, n), i = a(i, u.y), s = o(s, u.bottom);
    }
    this.cover(
      new te({ left: t, right: n, top: i, bottom: s })
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
    this.nodes && (this.nodes.destroy(), delete this.nodes), t.forEach((i) => this.doAdd(i));
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
    return this.nodes ? e.isInside(this.nodes.TL.bounds) ? this.nodes.TL.doAdd(e) : e.isInside(this.nodes.TR.bounds) ? this.nodes.TR.doAdd(e) : e.isInside(this.nodes.BL.bounds) ? this.nodes.BL.doAdd(e) : e.isInside(this.nodes.BR.bounds) ? this.nodes.BR.doAdd(e) : (this.children.push(e), !0) : e.isInside(this.bounds) ? (this.children.push(e), this.children.length > Kp && this.depth < Zp && this.split(), !0) : (isNaN(e.width + e.height + e.x + e.y) ? console.error(
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
    for (let i = 0, n = this.children.length; i < n; ++i)
      e.push(this.children[i]);
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
    return e instanceof te ? e.hitBounds(this.bounds) ? this.queryBounds(e, [], t) : [] : rl(e) && this.bounds.containsPoint(e) ? this.queryPoint(e, [], t) : [];
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
  queryBounds(e, t, i) {
    return this.bounds.isInside(e) ? (this.gatherChildren(t, i), t) : (this.children.forEach((n) => {
      n.hitBounds(e) && t.push(n);
    }), i && i(this), this.nodes && (e.hitBounds(this.nodes.TL.bounds) && this.nodes.TL.queryBounds(e, t, i), e.hitBounds(this.nodes.TR.bounds) && this.nodes.TR.queryBounds(e, t, i), e.hitBounds(this.nodes.BL.bounds) && this.nodes.BL.queryBounds(e, t, i), e.hitBounds(this.nodes.BR.bounds) && this.nodes.BR.queryBounds(e, t, i)), t);
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
  queryPoint(e, t, i) {
    return this.children.forEach((n) => {
      n.containsPoint(e) && t.push(n);
    }), i && i(this), this.nodes && (this.nodes.TL.bounds.containsPoint(e) && this.nodes.TL.queryPoint(e, t, i), this.nodes.TR.bounds.containsPoint(e) && this.nodes.TR.queryPoint(e, t, i), this.nodes.BL.bounds.containsPoint(e) && this.nodes.BL.queryPoint(e, t, i), this.nodes.BR.bounds.containsPoint(e) && this.nodes.BR.queryPoint(e, t, i)), t;
  }
  /**
   * Creates four sub quadrants for this node.
   */
  split() {
    const e = [];
    this.gatherChildren(e), this.nodes = new Jp(this.bounds, this.depth + 1), this.children = [];
    for (let t = 0, i = e.length; t < i; ++t) {
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
class eg extends rn {
}
class cs {
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
        for (let i = 0, n = t.length; i < n; ++i) {
          const s = t[i];
          s.parent = this.currentItem;
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
    for (let t = 0, i = this.currentInitializers.length; t < i; ++t) {
      const n = this.currentInitializers[t], s = this.keyToItem.get(n.key);
      s && e.push(this.options.destroyItem(n, s));
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
    let i = 0;
    for (; i < t.length; ) {
      const s = t[i];
      if (this.currentInitalizerIndex = i, this.currentInitializer = s, this.willDispose.has(s.key)) {
        let a = this.keyToItem.get(s.key) || null;
        a ? (this.currentItem = a, await this.options.updateItem(s, a)) : (a = await this.options.buildItem(s), a && (this.currentItem = a)), this.currentItem && (this.keyToInitializer.set(s.key, s), this.willDispose.delete(s.key), this._items.push(this.currentItem));
      } else {
        this.inline = this.inlineDeferred;
        const a = await this.options.buildItem(s);
        this.inline = this.inlineImmediate, a && (this.currentItem = a, this.deferredInlining && (this.inline(this.deferredInlining), delete this.deferredInlining), this.keyToItem.set(s.key, this.currentItem), this.keyToInitializer.set(s.key, s), this._items.push(this.currentItem));
      }
      delete this.currentItem, i++;
    }
    const n = /* @__PURE__ */ new Set();
    if (this.willDispose.forEach(async (s) => {
      const a = this.keyToItem.get(s), o = this.keyToInitializer.get(s);
      if (!a || !o) return;
      await this.options.destroyItem(o, a) && (this.keyToItem.delete(s), this.keyToInitializer.delete(s), n.add(a));
    }), n.size > 0) {
      const s = this._items;
      this._items = new Array(s.length - n.size);
      let a = 0;
      for (let o = 0, c = s.length; o < c; ++o) {
        const l = s[o];
        n.has(l) || (this._items[a] = l, a++);
      }
    }
    this.willDispose.clear(), this.keyToInitializer.forEach((s) => {
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
    e && (this.currentItem = e, this.keyToItem.set(this.currentItem.id, e), this.keyToInitializer.set(this.currentItem.id, this.currentInitializer));
  }
}
function ui(r) {
  const {
    shader: e,
    options: t = {},
    required: i,
    onError: n,
    onToken: s,
    onMain: a
  } = r, o = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), h = e.replace(
    /\$\{([^\}]*)\}/g,
    (p, g) => {
      let m = "";
      return u.set(g, (u.get(g) || 0) + 1), g in t ? (o.set(g, (o.get(g) || 0) + 1), m = t[g]) : c.set(g, (c.get(g) || 0) + 1), s && (m = s(g, m)), m;
    }
  );
  Object.keys(t).forEach((p) => {
    o.get(p) || l.set(p, (l.get(p) || 0) + 1);
  });
  const d = {
    resolvedShaderOptions: o,
    shader: h,
    shaderProvidedOptions: u,
    unresolvedProvidedOptions: l,
    unresolvedShaderOptions: c
  };
  if (i && i.values.forEach((p) => {
    if (d.unresolvedProvidedOptions.get(p)) {
      const g = `${i.name}: Could not resolve all the required inputs. Input: ${p}`;
      n ? n(g) : console.error(g);
    } else if (d.unresolvedShaderOptions.get(p)) {
      const g = `${i.name}: A required option was not provided in the options parameter. Option: ${p}`;
      n ? n(g) : console.error(g);
    } else if (!d.resolvedShaderOptions.get(p)) {
      const g = `${i.name}: A required option was not provided in the options parameter. Option: ${p}`;
      n ? n(g) : console.error(g);
    }
  }), a) {
    const p = d.shader, g = p.match(
      /void((.+)|\s)(main(\s+)\(\)|main\(\))(((.+)(\s*)\{)|(\s*)\{)/gm
    );
    if (g && g.length > 0) {
      const m = p.indexOf(g[0]);
      if (m < 0) a(null);
      else {
        const T = p.substr(0, m), x = p.substr(m + g[0].length);
        let b = !1, v = !1, E = 1, y = 0, C = -1;
        for (let I = 0, R = x.length; I < R; ++I) {
          const $ = x[I], z = x[I + 1];
          switch ($) {
            case "/":
              switch (z) {
                case "*":
                  !b && !v && (b = !0, I++);
                  break;
                case "/":
                  !b && !v && (v = !0, I++);
                  break;
              }
              break;
            case "*":
              z === "/" && (v || (b = !1, I++));
              break;
            case `
`:
            case "\r":
              b || (v = !1);
              break;
            case "{":
              !b && !v && E++;
              break;
            case "}":
              !b && !v && y++, E === y && (C = I);
              break;
          }
          if (C !== -1)
            break;
        }
        if (C !== -1) {
          const I = x.substr(0, C), R = x.substr(C + 1), $ = a(I, `${T}
${R}`);
          typeof $ == "string" ? d.shader = p.substr(0, m + g[0].length) + $ + p.substr(m + g[0].length + C) : d.shader = p.substr(0, m) + $.header + p.substr(m, g[0].length) + $.main + p.substr(m + g[0].length + C);
        } else
          a(null);
      }
    }
  }
  return d;
}
function zT(r) {
  return new Promise((e) => setTimeout(e, r));
}
function tg(r) {
  return r;
}
function zi(r, e) {
  const t = Object.assign(e, {
    key: e.key || r.defaultProps.key,
    data: e.data || r.defaultProps.data
  });
  return {
    get key() {
      return e.key || "";
    },
    init: [r, t]
  };
}
function ji(r, e) {
  const t = Object.assign(e, {
    key: e.key || r.defaultProps.key,
    data: e.data || r.defaultProps.data
  });
  return {
    get key() {
      return e.key || "";
    },
    init: [
      r,
      t
    ]
  };
}
function rg(r) {
  return r;
}
function ig(r) {
  return r;
}
const VT = {
  layer: zi,
  view: Xu,
  vertex: ig,
  uniform: rg,
  attribute: tg
};
class $T {
  constructor(e) {
    this.index = -1, this.marker = /* @__PURE__ */ new Map(), this.pool = new Array(e.firstAlloc);
    for (let t = 0, i = e.firstAlloc; t < i; ++t)
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
function ng(r, e, t, i) {
  return e < 0 && (e = r.length + e, e < 0 && (e = 0)), r.slice(0, e) + "" + r.slice(e + t);
}
function ls(r) {
  let e = !1, t = !1;
  const i = [];
  let n = { start: -1, stop: -1 }, s = { start: -1, stop: -1 };
  for (let a = 0, o = r.length; a < o; ++a) {
    const c = r[a], l = r[a + 1];
    switch (c) {
      case "/":
        switch (l) {
          case "*":
            !t && !e && (n.start = a, e = !0, a++);
            break;
          case "/":
            !e && !t && (s.start = a, t = !0, a++);
            break;
        }
        break;
      case "*":
        l === "/" && e && (n.stop = a + 2, i.push(n), n = { start: -1, stop: -1 }, e = !1, a++);
        break;
      case `
`:
      case "\r":
        t && (s.stop = a, i.push(s), s = { start: -1, stop: -1 }, t = !1);
        break;
    }
  }
  return i.reverse(), i.forEach((a) => {
    r = ng(r, a.start, a.stop - a.start);
  }), r;
}
function hi(r) {
  return r ? [
    r.atlasTL[0],
    r.atlasTL[1],
    r.atlasBR[0],
    r.atlasBR[1]
  ] : [0, 0, 0, 0];
}
class Vr {
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
    const i = t.x / e.data.width, n = t.y / e.data.height, s = t.width / e.data.width, a = t.height / e.data.height, o = new te({
      bottom: n + a,
      left: i,
      right: i + s,
      top: n
    }), c = o.bottom, l = o.y, u = o.x, h = o.x + o.width, d = new Vr();
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
const On = Ee("performance");
var ba = /* @__PURE__ */ ((r) => (r[r.BITMAP = 0] = "BITMAP", r[r.SDF = 1] = "SDF", r[r.MSDF = 2] = "MSDF", r))(ba || {});
class sg extends mi {
  constructor(e) {
    super(e), this.dynamic = !1, this.glyphCount = 0, this.glyphMap = {}, this.kerning = {}, this.spaceWidth = 0, this.type = ce.FONT, this.dynamic = e.dynamic || !1, this.fontSource = e.fontSource, e.characters && e.characters.forEach((i) => {
      this.doRegisterGlyph(i[0], i[1]);
    });
    const t = e.fontMapSize ? e.fontMapSize : [_t._1024, _t._1024];
    this.makeGlyphTypeTextureSettings(e.glyphType), this.createTexture(t), this.packing = new Ye(0, 0, t[0], t[1]), this.addCachedKerning();
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
        On("Loading cached kerning items:", this.getKerningCacheName());
        try {
          const t = JSON.parse(e);
          let i = 0;
          for (const n in t) {
            let s = typeof n == "string" && n.length === 1;
            if (!s) continue;
            const a = t[n], o = this.kerning[n] || {};
            this.kerning[n] = o;
            for (const c in a)
              s = typeof n == "string" && n.length === 1, s && (o[c] = a[c], i++);
          }
          On(
            "Found kerning items in the cache!",
            "Count:",
            i
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
    for (const i in e) {
      const n = e[i], s = this.kerning[i] || {};
      this.kerning[i] || (t = !0), this.kerning[i] = s;
      for (const a in n)
        s[a] || (t = !0), s[a] = n[a];
    }
    if (t && this.fontSource.localKerningCache)
      try {
        On("Storing kerning info in cache...");
        const i = JSON.stringify(this.kerning);
        localStorage.setItem(this.getKerningCacheName(), i);
      } catch {
        On("Could not cache kerning info");
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
    }, this.texture = new j({
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
    const i = e[0];
    this.glyphMap[i] ? console.warn("A Glyph is already registered with a rendering") : this.glyphMap[i] = t;
  }
  /**
   * This returns which characters are not included in this font map.
   */
  findMissingCharacters(e) {
    const t = /* @__PURE__ */ new Set();
    let i = "";
    for (let n = 0, s = e.length; n < s; ++n) {
      const a = e[n];
      !this.glyphMap[a] && !t.has(a) && (t.add(a), i += a);
    }
    return i;
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
    const i = this.kerning[e];
    return i ? i[t] || [0, 0] : [0, 0];
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
  getGlyphWidth(e, t, i) {
    const n = e.positions[t], s = e.positions[i];
    if (!t || !i) return 0;
    const a = this.glyphMap[e.glyphs[i]];
    return a ? s[0] + a.pixelWidth - n[0] : 0;
  }
  /**
   * This looks at a string layout and provides a layout that reflects the
   * layout bounded by a max width.
   */
  async getTruncatedLayout(e, t, i, n, s, a) {
    if (e.size[0] > i) {
      let o = "", c = 0;
      for (let g = 0, m = t.length; g < m; ++g)
        c += this.glyphMap[t[g]].pixelWidth;
      if (c > i)
        return {
          fontScale: 1,
          glyphs: "",
          positions: [],
          size: [0, 0],
          text: ""
        };
      let l = 0, u = e.positions.length, h = 0, d = 0, p = "";
      for (; l !== u; ) {
        if (h = Math.floor((u - l) / 2) + l, p = e.glyphs[h], d = e.positions[h][0] + this.glyphMap[p].pixelWidth + c, d > i) u = h;
        else if (d < i) l = h;
        else break;
        if (Math.abs(l - u) <= 1) {
          if (d < i) break;
          for (; d > i && h >= 0; )
            h--, d = e.positions[h][0] + this.glyphMap[p].pixelWidth + c;
          break;
        }
      }
      if (d = e.positions[h][0] + this.glyphMap[p].pixelWidth + c, d < i) {
        let g = 0, m = 0;
        for (let b = 0, v = e.text.length; b < v && g <= h; ++b) {
          const E = e.text[b];
          m++, Oi(E) || g++;
        }
        const T = e.text[m - 1];
        let x;
        for (let b = 0, v = t.length; b < v; ++b)
          if (!Oi(t[b])) {
            x = t[b];
            break;
          }
        if (T && x && !this.kerning[T][x]) {
          const b = await a.estimateKerning(
            [T + x],
            this.fontString,
            this.fontSource.size,
            this.kerning,
            !1,
            this.fontSource.embed
          );
          this.addKerning(b.pairs);
        }
        o = `${e.text.substr(0, m)}${t}`;
      } else
        o = t;
      return this.getStringLayout(o, n, s);
    }
    return e;
  }
  /**
   * Calculates the width of a chunk of characters within a calculated
   * KernedLayout. To use this, first use the getStringLayout() method to get
   * the KernedLayout then insert the substring of text desired for calculating
   * the width.
   */
  getStringWidth(e, t, i) {
    const n = e.text;
    let s = 0, a = n.length;
    if (typeof t == "string") {
      const h = n.indexOf(t);
      if (h < 0) return 0;
      s = h, a = s + t.length;
    } else
      s = t;
    i !== void 0 && (a = i);
    let o = 0;
    const c = Math.min(n.length, s), l = Math.min(n.length, a);
    for (; o < c; ++o)
      Oi(n[o]) && (s--, a--);
    for (; o < l; ++o)
      Oi(n[o]) && a--;
    const u = this.glyphMap[e.text[a] || ""];
    return u ? (e.positions[a] || [0, 0])[0] - (e.positions[s] || [0, 0])[0] + u.pixelWidth : 0;
  }
  /**
   * This processes a string and lays it out by the kerning rules available to
   * this font map.
   *
   * NOTE: This ONLY processes a SINGLE LINE!! ALL whitespace characters will be
   * considered a single space.
   */
  getStringLayout(e, t, i) {
    const n = [];
    let s = "";
    const a = t / this.fontSource.size;
    let o = Number.MAX_SAFE_INTEGER, c = 0, l = 0, u = [0, 0];
    const h = this.spaceWidth;
    let d = 0, p = "", g, m;
    for (let b = 0, v = e.length; b < v; ++b) {
      const E = e[b];
      if (Oi(E)) {
        d++;
        continue;
      }
      g = [0, 0], p && (g = this.kerning[p][E] || [0, 0]), u = Wr(Wr(u, Ie(g, a)), [
        d * h * a + (b === 0 ? 0 : i),
        0
      ]), n.push([u[0], u[1]]), s += E, m = this.glyphMap[E], o = Math.min(u[1], o), c = Math.max(u[1] + m.pixelHeight * a, c), p = E, l = u[0] + m.pixelWidth * a, d = 0;
    }
    const T = c - o, x = [l, T];
    for (let b = 0, v = n.length; b < v; ++b)
      u = n[b], u[1] -= o;
    return {
      fontScale: a,
      glyphs: s,
      positions: n,
      size: x,
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
          magFilter: f.Texture.TextureMagFilter.Linear,
          minFilter: f.Texture.TextureMinFilter.LinearMipMapLinear,
          internalFormat: f.Texture.TexelDataType.LuminanceAlpha,
          format: f.Texture.TexelDataType.LuminanceAlpha
        };
        break;
      // Only a single channel is needed for SDF
      case 1:
        this.textureSettings = {
          magFilter: f.Texture.TextureMagFilter.Linear,
          minFilter: f.Texture.TextureMinFilter.Linear,
          internalFormat: f.Texture.TexelDataType.Luminance,
          format: f.Texture.TexelDataType.Luminance
        };
        break;
      // The MSDF strategy uses all RGB channels for the algorithm. Heavier data
      // use better quality results.
      case 2:
        this.textureSettings = {
          magFilter: f.Texture.TextureMagFilter.Linear,
          minFilter: f.Texture.TextureMinFilter.Linear,
          internalFormat: f.Texture.TexelDataType.RGB,
          format: f.Texture.TexelDataType.RGB
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
    for (let t = 1, i = e.length; t < i; ++t) {
      const n = e[t], s = e[t - 1];
      if (this.kerning[s]) {
        if (!this.kerning[s][n])
          return !1;
      } else return !1;
    }
    return !0;
  }
}
const { min: cc, max: Ln } = Math, ei = document.createElement("canvas");
let er;
function ag(r) {
  const { width: e, height: t } = r.canvas, i = r.getImageData(0, 0, e, t).data;
  let n, s = !1, a = Number.MAX_SAFE_INTEGER, o = Number.MAX_SAFE_INTEGER, c = Number.MIN_SAFE_INTEGER, l = Number.MIN_SAFE_INTEGER;
  for (let u = 0; u < e; ++u)
    for (let h = 0; h < t; ++h) {
      const d = h * (e * 4) + u * 4;
      n = i[d], n > 0 && (s = !0, a = cc(a, h), o = cc(o, u), c = Ln(c, u), l = Ln(l, h));
    }
  return s ? (a -= 1, l += 2, c += 2, o -= 1, a = Ln(a, 0), o = Ln(o, 0), { minX: o, minY: a, maxX: c, maxY: l }) : null;
}
function zu(r, e, t, i) {
  if (r = r[0], (ei.width < e || ei.height < t) && (ei.width = e, ei.height = t), !er) {
    const c = ei.getContext("2d", { willReadFrequently: !0 });
    if (c) er = c;
    else return null;
  }
  er.clearRect(0, 0, ei.width, ei.height), er.font = i, er.fillStyle = "white", er.fillText(r, e / 2, t / 2);
  const n = ag(er);
  if (!n)
    return {
      data: er.getImageData(0, 0, 1, 1),
      size: [0, 0]
    };
  const s = n.maxX - n.minX, a = n.maxY - n.minY;
  return {
    data: er.getImageData(
      n.minX,
      n.minY,
      s,
      a
    ),
    size: [s, a]
  };
}
const Nt = document.createElement("img"), et = document.createElement("canvas");
function og(r, e, t = 400, i = "normal", n = "woff2") {
  return `
    @font-face {
      font-family: '${r}';
      src: url('${e}') ${n ? `format('${n}')` : ""};
      font-weight: ${t};
      font-style: ${i};
    }
  `;
}
async function lc(r, e, t) {
  const i = new Ve();
  if (!Nt || !et) return null;
  if (t && e) {
    const h = document.createElementNS(e, "style");
    h.textContent = t.map(
      (d) => og(d.familyName, d.source, d.weight, d.style, d.fontType)
    ).join(`
`), r.prepend(h);
  }
  const n = new XMLSerializer().serializeToString(r), o = "data:image/svg+xml;base64," + btoa(n);
  let c = !1;
  const l = async () => {
    if (c) return;
    c = !0, et.width = Nt.width * window.devicePixelRatio, et.height = Nt.height * window.devicePixelRatio;
    const h = et.getContext("2d", { willReadFrequently: !0 });
    if (!h) {
      i.resolve(null);
      return;
    }
    h.clearRect(0, 0, et.width, et.height), h.mozImageSmoothingEnabled = !1, h.webkitImageSmoothingEnabled = !1, h.msImageSmoothingEnabled = !1, h.imageSmoothingEnabled = !1, h.drawImage(
      Nt,
      0,
      0,
      Nt.width * window.devicePixelRatio,
      Nt.height * window.devicePixelRatio
    ), i.resolve(h.getImageData(0, 0, et.width, et.height)), et.style.position = "absolute", et.style.top = "100px", et.style.left = "0px", et.style.zIndex = "9999", et.id = "svg-to-data";
  };
  return Nt.onload = l, Nt.src = o, Nt.width > 0 && Nt.height > 0 && l(), await i.promise;
}
const Yn = Ee("performance"), { floor: Us } = Math;
async function cg(r, e, t, i, n) {
  const s = "http://www.w3.org/2000/svg", a = N.MAX_TEXTURE_SIZE / window.devicePixelRatio, o = e * 2, c = e * 1.3, l = Us(a / o), u = document.createElementNS(s, "svg");
  u.setAttribute("width", `${a}px`), u.style.font = r, u.style.fontFamily = "RedHatDisplay", u.style.position = "relative", u.style.left = "0px", u.style.top = "0px";
  const h = [], d = Math.floor(a / c);
  let p = 0, g = 0, m = 0, T, x, b = 0;
  for (; g < t.all.length; ) {
    const F = document.createElementNS(s, "g");
    T = F, p = Math.floor(h.length / d), F.setAttribute(
      "transform",
      `translate(0, ${(h.length - p * d) * c})`
    ), h.push(F);
    let U = a;
    for (m = 0; m < l && g < t.all.length; m++) {
      const Q = document.createElementNS(s, "text");
      Q.setAttribute("x", `${m * o}`), Q.setAttribute("dy", "1em");
      const W = t.all[g];
      g++;
      const re = W[0], J = W[1], ee = document.createElementNS(s, "tspan"), K = document.createElementNS(s, "tspan");
      ee.setAttribute("fill", "#ff0000"), K.setAttribute("fill", "#0000ff"), ee.textContent = re, K.textContent = J, Q.appendChild(ee), Q.appendChild(K), F.appendChild(Q), U -= o;
    }
    if (U >= 0) {
      const Q = document.createElementNS(s, "text");
      Q.setAttribute("width", `${U}px`), F.appendChild(Q), x = Q;
    } else
      x = null;
    b = U;
  }
  const v = [];
  for (let F = 0; F < t.all.length; F++)
    v.push([
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER
    ]);
  let E = 0, y = !1;
  if (i) {
    const F = "M", U = document.createElementNS(s, "text");
    U.setAttribute("dy", "1em"), U.style.width = `${o}`, U.style.height = `${c}`, U.setAttribute("x", `${o * m}`), U.style.font = r;
    const Q = await zu(F, 128, 128, r);
    if (Q) {
      E = Q.size[0];
      const W = document.createElementNS(s, "tspan"), re = document.createElementNS(s, "tspan"), J = document.createElementNS(s, "tspan");
      if (W.setAttribute("fill", "#ff0000"), J.setAttribute("fill", "#0000ff"), W.textContent = F, J.textContent = F, re.textContent = " ", U.appendChild(W), U.appendChild(re), U.appendChild(J), m < l && T)
        T.appendChild(U), b -= o, x && (x.remove(), b > 0 && (T.style.width = `${b}px`, T.appendChild(x)));
      else {
        const ee = document.createElement("g");
        p = Math.floor(h.length / d), ee.setAttribute(
          "transform",
          `translate(0, ${(h.length - p * d) * c})`
        ), T = ee, T.appendChild(U), h.push(ee), x = document.createElementNS(s, "text"), ee.appendChild(x);
      }
      v.push([
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER
      ]), y = !0;
    }
  }
  const C = h.length * c, I = Math.ceil(C / a);
  let R = null;
  Yn(
    "Rendering table canvas batches for font kerning analysis",
    t,
    h
  );
  for (let F = 0; F < I; ++F) {
    const U = h.splice(0, d), Q = U.length * c;
    for (u.setAttribute("height", `${Q}px`); u.lastElementChild; ) u.lastElementChild.remove();
    for (let W = 0, re = U.length; W < re; ++W) {
      const J = U[W];
      u.appendChild(J);
    }
    if (!R)
      R = await lc(u, s, n);
    else {
      const W = await lc(u, s, n);
      if (!W) {
        console.warn(
          "Font Renderer: Could not generate image data for analyzing font kerning"
        );
        continue;
      }
      const re = new Uint8ClampedArray(
        R.data.length + W.data.length
      );
      re.set(R.data), re.set(W.data, R.data.length), R = new ImageData(
        re,
        a * window.devicePixelRatio,
        R.height + W.height
      );
    }
  }
  Yn("Analyzing rendered data", R);
  const $ = o * window.devicePixelRatio, z = c * window.devicePixelRatio;
  if (R) {
    const F = R.data;
    let U, Q, W, re, J, ee;
    for (let K = 0, Oe = R.height; K < Oe; K++)
      for (let w = 0, k = R.width; w < k; w++)
        U = (k * K + w) * 4, Q = F[U + 0], W = F[U + 1], re = F[U + 2], ee = Us(K / z) * l + Us(w / $), ee < v.length && (J = v[ee], Q > 0 && W === 0 && re === 0 && (w < J[0] && (J[0] = w), K < J[1] && (J[1] = K)), Q === 0 && W === 0 && re > 0 && (w < J[2] && (J[2] = w), K < J[3] && (J[3] = K)));
    if (y) {
      const K = v.pop();
      if (K) {
        const Oe = [K[2] - K[0], 0], w = Ie(Oe, 1 / window.devicePixelRatio);
        t.spaceWidth = Math.ceil(w[0]) - E;
      }
    }
    for (let K = 0, Oe = v.length; K < Oe; K++) {
      const w = t.all[K], k = w[0], H = w[1], ie = v[K], Le = [ie[2] - ie[0], ie[3] - ie[1]], ye = t.pairs[k];
      if (ye) {
        const Or = Ie(Le, 1 / window.devicePixelRatio);
        ye[H] = [Math.ceil(Or[0]), Or[1]];
      }
    }
  } else
    console.warn(
      "html2canvas did not produce a valid canvas context to analyze"
    );
  Yn("Kerning rendering analysis complete", t.pairs);
}
function lg(r, e, t) {
  r = r.replace(/\s/g, "");
  const i = t && t.all || [], n = t && t.pairs || {};
  for (let s = 0; s < r.length - 1; s++) {
    const a = r[s], o = r[s + 1];
    let c = n[a];
    c || (c = n[a] = {}), (!e[a] || !e[a][o]) && !c[o] && (c[o] = [0, 0], i.push(`${a}${o}`));
  }
  return {
    all: i,
    pairs: n,
    spaceWidth: 0
  };
}
class ug {
  /**
   * This function takes a sentence and grid info Returns a canvas with a list
   * of glyphs where each glyph fits cnetered within each grid cell
   */
  makeBitmapGlyphs(e, t, i) {
    const n = {}, s = /* @__PURE__ */ new Set();
    for (let o = 0, c = e.length; o < c; ++o)
      s.add(e[o]);
    const a = Array.from(s.values());
    for (let o = 0, c = a.length; o < c; ++o) {
      const l = a[o], u = zu(l, i * 2, i * 2, t);
      u ? n[l] = {
        glyph: u.data,
        glyphIndex: o
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
  async estimateKerning(e, t, i, n, s, a) {
    const o = {
      all: [],
      pairs: {},
      spaceWidth: 0
    };
    Yn("Estimating Kerning for", e);
    for (let c = 0, l = e.length; c < l; ++c) {
      const u = e[c];
      lg(u, n, o);
    }
    return (o.all.length > 0 || s) && await cg(t, i, o, s, a), o;
  }
}
var Vi = /* @__PURE__ */ ((r) => (r[r.TEXCOORDS = 0] = "TEXCOORDS", r[r.IMAGE_SIZE = 1] = "IMAGE_SIZE", r))(Vi || {});
function Hi(r) {
  return {
    type: ce.FONT,
    ...r
  };
}
function WT() {
  return ".101112131415161718191.202122232425262728292.303132333435363738393.404142434445464748494.505152535455565758595.606162636465666768696.707172737475767778797.808182838485868788898.909192939495969798999.000102030405060708090.$0$1$2$3$4$5$6$7$8$9$%0%1%2%3%4%5%6%7%8%9%-0-1-2-3-4-5-6-7-8-9-+0+1+2+3+4+5+6+7+8+9+)0)1)2)3)4)5)6)7)8)9)(0(1(2(3(4(5(6(7(8(9(";
}
async function hg(r, e) {
  let t = 0, i, n;
  try {
    if (!e) return;
    for (const s of e)
      i = s, t = 0, !document.fonts.check(r) && (t++, n = new FontFace(s.familyName, `url(${s.source})`, {
        weight: `${s.weight}`,
        style: s.style
      }), t++, await n.load(), t++, document.fonts.add(n));
    await document.fonts.ready;
  } catch (s) {
    switch (console.error("Font embedding Error:"), t) {
      case 0:
        console.error("Font embedding failed check:", r);
        break;
      case 1:
        console.error(
          "Font embedding failed to create the font face:",
          i
        );
        break;
      case 2:
        console.error("Font embedding failed to load the font face:", {
          fontFace: n,
          embedding: i
        });
        break;
      case 3:
        console.error("Font embedding failed to add the font face", {
          fontFace: n,
          embedding: i
        });
        break;
    }
    s instanceof Error && console.error(s.stack || s.message);
  }
}
const uc = Ee("performance");
var dg = /* @__PURE__ */ ((r) => (r[r._16 = 16] = "_16", r[r._32 = 32] = "_32", r[r._64 = 64] = "_64", r[r._128 = 128] = "_128", r))(dg || {});
function hc(r) {
  return r && r.type === ce.FONT;
}
function fg(r) {
  return r && r.type === void 0;
}
function Vu(r) {
  return {
    key: "",
    type: ce.FONT,
    ...r
  };
}
class pg {
  constructor() {
    this.fontMaps = /* @__PURE__ */ new Map(), this.fontRenderer = new ug();
  }
  /**
   * This takes all requests that want layout information included for a group
   * of text and populates the request with the appropriate information.
   */
  async calculateMetrics(e, t) {
    uc("Calculating metrics for requests");
    const i = this.fontMaps.get(e);
    if (i)
      for (let n = 0, s = t.length; n < s; ++n) {
        const o = t[n].metrics;
        o && (o.layout = i.getStringLayout(
          o.text,
          o.fontSize,
          o.letterSpacing
        ), o.maxWidth && (uc("Calculating truncation for", o.text, o.maxWidth), o.layout = await i.getTruncatedLayout(
          o.layout,
          o.truncation || "",
          o.maxWidth,
          o.fontSize,
          o.letterSpacing,
          this.fontRenderer
        ), o.truncatedText = o.layout.text));
      }
  }
  /**
   * Converts a character filter to a deduped list of single characters
   */
  characterFilterToCharacters(e) {
    const t = /* @__PURE__ */ new Set();
    let i = "";
    for (let n = 0, s = e.length; n < s; ++n) {
      const a = e[n];
      t.has(a) || (t.add(a), i += a);
    }
    return i;
  }
  /**
   * This generates a new font map object to work with. It will either be
   * pre-rendered or dynamically populated as requests are made.
   */
  async createFontMap(e) {
    const t = this.characterFilterToCharacters(
      e.characterFilter || ""
    ), i = e.fontSource;
    let n = ba.SDF;
    i && (fg(i) ? n = ba.BITMAP : n = i.type || n);
    const s = new sg({
      ...e,
      glyphType: n
    });
    return await this.updateFontMapCharacters(t, s), this.fontMaps.set(e.key, s), e.fontSource.preload && this.updateFontMap(e.key, [
      Hi({
        key: e.key,
        character: "",
        kerningPairs: [e.fontSource.preload],
        metrics: {
          fontSize: 12,
          text: e.fontSource.preload,
          letterSpacing: 0
        }
      })
    ]), s;
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
    const i = this.fontMaps.get(e);
    if (!i) return;
    let n = [];
    const s = /* @__PURE__ */ new Set();
    for (let o = 0, c = t.length; o < c; ++o) {
      const l = t[o];
      if (l.character && s.add(l.character), l.kerningPairs && (n = n.concat(l.kerningPairs)), l.metrics && l.metrics.truncation) {
        const u = l.metrics.truncation.replace(/\s/g, "");
        n.push(u);
        for (let h = 0, d = l.metrics.truncation.length; h < d; ++h)
          s.add(u);
      }
    }
    for (let o = 0, c = n.length; o < c; ++o)
      s.add(n[o]);
    let a = "";
    s.forEach((o) => a += o), await hg(i.fontString, i.fontSource.embed), await this.updateFontMapCharacters(a, i), await this.updateKerningPairs(n, i);
    for (let o = 0, c = t.length; o < c; ++o)
      t[o].fontMap = i;
  }
  /**
   * This updates the calculated kerning pairs for a given font map.
   */
  async updateKerningPairs(e, t) {
    if (!t) return;
    const i = await this.fontRenderer.estimateKerning(
      e,
      t.fontString,
      t.fontSource.size,
      t.kerning,
      !t.spaceWidth,
      t.fontSource.embed
    );
    t.addKerning(i.pairs), t.spaceWidth = t.spaceWidth || i.spaceWidth;
  }
  /**
   * This updates a specified font map with a list of characters expected within
   * it.
   */
  async updateFontMapCharacters(e, t) {
    if (!t) return;
    const i = t.texture, n = t.findMissingCharacters(e);
    if (n.length <= 0) return;
    const s = this.fontRenderer.makeBitmapGlyphs(
      n,
      t.fontString,
      t.fontSource.size
    );
    for (const a in s) {
      const o = s[a];
      if (i != null && i.data) {
        const c = new te({
          x: 0,
          y: 0,
          width: o.glyph.width,
          height: o.glyph.height
        }), l = new Vr(), u = t.packing.insert({
          data: l,
          bounds: c
        });
        if (!u) {
          console.warn(
            "Font map is full and could not pack in any more glyphs"
          );
          return;
        }
        Ye.applyToSubTexture(
          t.packing,
          u,
          l,
          void 0,
          !0
        ), i.update(o.glyph, {
          ...u.bounds,
          y: t.packing.bounds.height - u.bounds.y - u.bounds.height
        }), l ? t.registerGlyph(a, l) : console.warn(
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
  async getPrerenderedImageData(e, t, i) {
    const n = [];
    return i.forEach((s) => {
      let a = e.glyphs[s];
      if (a || (a = e.errorGlyph), !e.errorGlyph)
        return console.warn(
          "The prerendered source provided did NOT provide a proper glyph for rendering when a glyph could not be located."
        ), [];
      const o = new Image();
      let c;
      const l = new Promise((u) => c = u);
      return o.onload = function() {
        const u = document.createElement("canvas"), h = u.getContext("2d");
        if (!h) return;
        u.width = t, u.height = t, h.drawImage(o, 0, 0, t, t);
        const d = h.getImageData(0, 0, t, t);
        c(d);
      }, o.onerror = function() {
        console.warn(
          "There was an issue with loading the glyph data for character:",
          s
        ), c(null);
      }, o.src = e.glyphs[s], n.push(l), [];
    }), await Promise.all(n);
  }
}
const gg = Ee("performance");
class mg {
  /**
   * This is a helper to apply declarations to the input declaration object. This will automatically use the
   * performance debug output to provide useful information when overrides occur.
   */
  setDeclaration(e, t, i, n) {
    e.has(t) && gg(
      `%s: Overriding declaration %s
Setting new value: %s`,
      n || "Expand IO Declarations",
      t,
      i
    ), e.set(t, i);
  }
}
class Cs extends mg {
  /**
   * This is called with the Layer's currently declared Shader IO configuration.
   * The returned IO configuration will be added to the existing IO. Each
   * BaseIOExpansion object will receive the expanded IO configuration of other
   * expansion objects if the object is processed after another expansion
   * object.
   *
   * NOTE: The inputs should NOT be modified in any way
   */
  expand(e, t, i, n, s) {
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
  validate(e, t, i, n, s) {
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
  processHeaderInjection(e, t, i, n, s, a, o) {
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
  processAttributeDestructuring(e, t, i, n, s, a) {
    return "";
  }
}
const xg = "TextureIOExpansion";
function Tg(r, e, t) {
  return r && r.resource && e.getResourceType(r.resource.key()) === t && r.resource.name !== void 0 && r.resource.key !== void 0;
}
class lo extends Cs {
  constructor(e, t) {
    super(), this.manager = t, this.resourceType = e;
  }
  /**
   * Provides expanded IO for attributes with resource properties.
   */
  expand(e, t, i, n) {
    const s = this.manager, a = [], o = /* @__PURE__ */ new Map();
    t.forEach((u) => {
      if (Tg(u, this.manager.router, this.resourceType)) {
        u.size === void 0 && (u.size = S.FOUR);
        const h = u.resource.shaderInjection || A.FRAGMENT, d = o.get(
          u.resource.name
        );
        d ? o.set(u.resource.name, [
          d[0] || h === A.VERTEX || h === A.ALL,
          d[1] || h === A.FRAGMENT || h === A.ALL
        ]) : (a.push(u), o.set(u.resource.name, [
          h === A.VERTEX || h === A.ALL,
          h === A.FRAGMENT || h === A.ALL
        ]));
      }
    });
    const c = a.map(
      (u) => {
        let h = A.FRAGMENT;
        if (u.resource) {
          const d = o.get(
            u.resource.name
          );
          d && (h = d[0] && d[1] && A.ALL || d[0] && !d[1] && A.VERTEX || !d[0] && d[1] && A.FRAGMENT || h);
        }
        return [
          // This injects the sampler that the shader will use for sampling
          // texels
          {
            name: u.resource.name,
            shaderInjection: h,
            size: _.TEXTURE,
            update: () => {
              const d = s.getResource(
                u.resource.key()
              );
              return d && d.texture || j.emptyTexture;
            }
          },
          // This provides the size of the texture that is applied to the
          // sampler.
          {
            name: `${u.resource.name}_size`,
            shaderInjection: h,
            size: _.TWO,
            update: () => {
              const d = s.getResource(
                u.resource.key()
              );
              if (d) {
                const p = d.texture;
                if (p && p.data) {
                  const { width: g, height: m } = p.data;
                  return [g || 1, m || 1];
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
  validate(e, t, i, n) {
    let s = !1;
    return t.forEach((a) => {
      a.easing && a.resource && (console.warn(
        "An instance attribute can not have both easing and resource properties. Undefined behavior will occur."
      ), console.warn(a), s = !0);
    }), !s;
  }
  /**
   * For texture resources, we need the uniforms with a size of ATLAS to be
   * injected as a sampler2D instead of a vector sizing which the basic io
   * expansion can only provide.
   */
  processHeaderInjection(e, t, i, n, s, a, o) {
    const c = {
      injection: ""
    };
    for (let l = 0, u = o.length; l < u; ++l) {
      const h = o[l], d = h.shaderInjection || A.VERTEX;
      h.size === _.TEXTURE && (d === e || d === A.ALL) && this.setDeclaration(
        t,
        h.name,
        `uniform sampler2D ${h.name};
`,
        xg
      );
    }
    return c;
  }
}
const Ki = Ee("performance");
class bg extends mn {
  constructor() {
    super(...arguments), this.requestLookup = /* @__PURE__ */ new Map(), this.requestQueue = /* @__PURE__ */ new Map(), this.resourceLookup = /* @__PURE__ */ new Map(), this.fontManager = new pg();
  }
  /**
   * This is so the system can control when requests are made so this manager
   * has the opportunity to verify and generate the resources the request
   * requires.
   */
  async dequeueRequests() {
    let e = !1;
    const t = [];
    this.requestQueue.forEach((i, n) => {
      t.push([n, i]);
    }), this.requestQueue.clear();
    for (let i = 0, n = t.length; i < n; ++i) {
      const [s, a] = t[i];
      if (a.length > 0) {
        e = !0;
        const o = a.slice(0);
        a.length = 0, Ki("Processing requests for resource '%s'", s), await this.fontManager.updateFontMap(s, o), await this.fontManager.calculateMetrics(s, o);
        const c = this.requestLookup.get(s);
        c ? (o.forEach((l) => {
          const u = c.get(l);
          if (c.delete(l), u) {
            for (let h = 0, d = u.length; h < d; ++h) {
              const [p, g] = u[h];
              p.managesInstance(g) && (g.active = !0);
            }
            _u(() => {
              const h = /* @__PURE__ */ new Set();
              for (let d = 0, p = u.length; d < p; ++d) {
                const g = u[d][1];
                h.has(g) || (h.add(g), g.resourceTrigger());
              }
            });
          }
        }), Ki("All requests for resource '%s' are processed", s)) : Ki(
          "There were no Font requests waiting for completion for resource",
          s
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
    return [new lo(ce.FONT, this)];
  }
  /**
   * This is a request to intiialize a resource by this manager.
   */
  async initResource(e) {
    if (hc(e)) {
      const t = await this.fontManager.createFontMap(e);
      t && this.resourceLookup.set(e.key, t), Ki("Font map created->", t);
    }
  }
  /**
   * This is for attributes making a request for a resource of this type to
   * create shader compatible info regarding the requests properties.
   */
  request(e, t, i, n) {
    const s = i, a = s.fontMap;
    let o = null;
    if (a)
      return s.character && (o = a.getGlyphTexture(s.character)), o ? s.fetch === Vi.IMAGE_SIZE ? [o.pixelWidth, o.pixelHeight] : hi(o) : s.fetch === Vi.IMAGE_SIZE ? [0, 0] : hi(null);
    const c = i.key;
    let l = this.requestLookup.get(c);
    if (l) {
      const h = l.get(s);
      if (h)
        return h.push([e, t]), t.active = !1, s.fetch === Vi.IMAGE_SIZE ? [0, 0] : hi(o);
    } else
      l = /* @__PURE__ */ new Map(), this.requestLookup.set(c, l);
    t.active = !1;
    let u = this.requestQueue.get(c);
    return u || (u = [], this.requestQueue.set(c, u)), u.push(s), l.set(s, [[e, t]]), s.fetch ? [0, 0] : hi(o);
  }
  /**
   * Responds to the system detecting properties for a resource need updating.
   */
  updateResource(e) {
    if (!hc(e)) return;
    const t = this.resourceLookup.get(e.key);
    t && (Nu(e.fontSource, t.fontSource) || Ki(
      "Font resources currently do not update. To update their properties simply destroy and recreate for now."
    ));
  }
}
let Fe;
class Ui {
  /**
   * This loops until our canvas context is available
   */
  static async awaitContext() {
    for (; !Fe; )
      this.getContext(), await new Promise((e) => setTimeout(e, 10));
  }
  /**
   * Attempts to populate the 'canvas' context for rendering images offscreen.
   */
  static getContext() {
    Fe || (Fe = document.createElement("canvas").getContext("2d"));
  }
  /**
   * This ensures an image is renderable at the current moment. This draws the
   * image to a canvas partially to help the image 'warm up' within some browser
   * contexts to ensure the image can be used as a drawable item.
   */
  static async calculateImageSize(e) {
    if (await this.awaitContext(), !Fe) {
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
    return Fe.canvas.width = 100, Fe.canvas.height = 100, Fe.drawImage(e, 0, 0, 1, 1), [e.width, e.height];
  }
  /**
   * This resizes the input image by the provided scale.
   */
  static async resizeImage(e, t) {
    if (await this.awaitContext(), !Fe)
      return console.warn(
        "The Image rasterizer was unable to establish a valid canvas context. Please ensure the system supports contexts and ensure the document is ready first."
      ), e;
    if (e.width === 0 || e.height === 0)
      return console.warn(
        "Images provided shoud have valid dimensions! Please ensure the image is loaded first."
      ), e;
    Fe.canvas.width = Math.floor(e.width * t), Fe.canvas.height = Math.floor(e.height * t), e instanceof ImageData ? Fe.putImageData(
      e,
      0,
      0,
      0,
      0,
      Fe.canvas.width,
      Fe.canvas.height
    ) : Fe.drawImage(e, 0, 0, Fe.canvas.width, Fe.canvas.height);
    const i = new Image();
    return i.src = Fe.canvas.toDataURL("image/png"), await Ui.calculateImageSize(i), i;
  }
}
class vg {
  constructor(e, t) {
    this.video = e, this.subTexture = t, this.isDestroyed = !1, this.renderedTime = -1, this.previousTime = -1, this.playedFrames = 0, this.caughtFrames = 0, this.timeFrame = 0, this.doUpdate = () => {
      Math.abs(this.video.currentTime - this.renderedTime) < 0.015 || (this.renderedTime = this.video.currentTime, this.subTexture.update());
    }, this.loop = (i) => {
      this.doUpdate(), this.isDestroyed || lr(this.loop);
    }, this.addEventListeners();
  }
  /**
   * Applies all of the necessary listeners to the video object
   */
  async addEventListeners() {
    this.isDestroyed || this.loop(await lr());
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
const wg = Ee("performance");
function $u(r) {
  return {
    key: "",
    type: ce.ATLAS,
    ...r
  };
}
function dc(r) {
  return r && r.type === ce.ATLAS;
}
class Eg extends mi {
  constructor(e) {
    super(e), this.resourceReferences = /* @__PURE__ */ new Map(), this.type = ce.ATLAS;
    const t = document.createElement("canvas");
    if (this.width = t.width = e.width, this.height = t.height = e.height, this.textureSettings = e.textureSettings, e.width < 0 || e.height < 0)
      throw new Error(
        "TextureSize Error: An atlas does NOT support Screen Texture sizing."
      );
    this.packing = new Ye(0, 0, e.width, e.height), this.createTexture(t);
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
    }, this.texture = new j({
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
    this.resourceReferences.forEach((t, i) => {
      t.count <= 0 && t.subtexture && (wg(
        "A subtexture on an atlas has been invalidated as it is deemed no longer used: %o",
        t.subtexture
      ), this.invalidateTexture(t.subtexture), e.push(i));
    });
    for (let t = 0, i = e.length; t < i; ++t)
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
      subtexture: e.texture || new Vr(),
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
const fc = Ee("performance"), yg = new Vr({
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
function Rg(r) {
  return !!(r && r.isValid && r.pixelWidth && r.pixelHeight);
}
class _g {
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
    const t = new Eg(e);
    return this.allAtlas.set(t.id, t), fc("Atlas Created-> %o", t), t;
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
    return e = Object.assign(e, yg, { atlasReferenceID: t }), e;
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
    var o;
    const i = e.id;
    if (t.disposeResource)
      return !0;
    const n = e.resourceReferences.get(t.source);
    if (n)
      return t.texture = n.subtexture, !0;
    t.texture = new Vr(), t.texture.isValid = !0, e.resourceReferences.set(t.source, {
      subtexture: t.texture,
      count: 0
    });
    const s = await this.loadImage(t), a = t.texture;
    if (s && Rg(a)) {
      const c = new te({
        bottom: a.pixelHeight,
        left: 0,
        right: a.pixelWidth,
        top: 0
      }), l = {
        data: a,
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
      return h ? (h.data = a, Ye.applyToSubTexture(u, h, a, {
        top: 0.5,
        left: 0.5,
        right: 0.5,
        bottom: 0.5
      }), a.texture = e.texture || null, a.source = s, a.atlasRegion = {
        ...h.bounds,
        y: e.height - h.bounds.y - h.bounds.height
      }, (o = e.texture) == null || o.update(s, a.atlasRegion), s instanceof HTMLVideoElement && (a.video = {
        monitor: new vg(s, a)
      }), !0) : (console.error("Could not fit resource into atlas", t), t.texture = this.setDefaultImage(a, i), !1);
    } else
      return a && !a.isValid ? fc("Resource was invalidated during load:", t) : console.error("Could not load resource:", t), t.texture && (t.texture = this.setDefaultImage(t.texture, i)), !1;
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
    const t = e.texture || new Vr(), i = e.source;
    if (e.texture = t, e.texture.isValid === !1) return null;
    if (i instanceof HTMLImageElement) {
      let n = await new Promise((s) => {
        if (!(i instanceof HTMLImageElement)) return;
        const a = i;
        if (a.width && a.height) {
          Ui.calculateImageSize(a), t.pixelWidth = a.width, t.pixelHeight = a.height, t.aspectRatio = a.width / a.height, s(a);
          return;
        }
        a ? (a.onload = function() {
          t.pixelWidth = a.width, t.pixelHeight = a.height, t.aspectRatio = a.width / a.height, a.onload = null, s(a);
        }, a.onerror = function() {
          console.error("Error generating Image element for source:", i), a.onload = null, s(null);
        }) : s(null);
      });
      return n && e.rasterizationScale !== void 0 && e.rasterizationScale !== 1 && (n = await Ui.resizeImage(
        n,
        e.rasterizationScale || 1
      )), n;
    } else {
      if (i instanceof HTMLVideoElement)
        return i.videoHeight === 0 || i.videoWidth === 0 ? (console.warn(
          "Video requests to the atlas manager MUST have the video completely loaded and ready for loading",
          "There are too many caveats to automate video loading at this low of a level to have it prepped properly for",
          "use in the texture for all browsers. Consider handling video resources at the layer level to have them",
          "prepped for use."
        ), null) : (t.pixelWidth = i.videoWidth, t.pixelHeight = i.videoHeight, t.aspectRatio = i.videoWidth / i.videoHeight, i);
      if (Rt(i)) {
        const n = i;
        let s = await new Promise((a) => {
          const o = new Image();
          o.onload = function() {
            t.pixelWidth = o.width, t.pixelHeight = o.height, t.aspectRatio = o.width / o.height, o.onload = null, a(o);
          }, o.onerror = function() {
            console.error("Error generating Image element for source:", i), a(null);
          }, o.crossOrigin = "anonymous", o.src = n;
        });
        return s && e.rasterizationScale !== void 0 && e.rasterizationScale !== 1 && (s = await Ui.resizeImage(
          s,
          e.rasterizationScale || 1
        )), s;
      } else {
        let n = i;
        return n && e.rasterizationScale !== void 0 && e.rasterizationScale !== 1 && (n = await Ui.resizeImage(
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
    const t = [e.packing], i = [];
    let n = 0;
    const s = /* @__PURE__ */ new Map();
    for (; n < t.length; ) {
      const v = t[n];
      n++, v.data && v.data.texture && (i.push(v), s.set(v.bounds, new te(v.bounds))), v.child[0] && t.push(v.child[0]), v.child[1] && t.push(v.child[1]);
    }
    if (i.sort(
      (v, E) => Math.max(E.bounds.width, E.bounds.height) - Math.max(v.bounds.width, v.bounds.height)
    ), i.length <= 0)
      return e.packing = new Ye(0, 0, e.width, e.height), !0;
    if (!e.texture)
      return console.warn(
        "Attempted to repack resources for an atlas with no texture."
      ), !1;
    const a = new j(e.texture);
    a.data = {
      buffer: new Uint8Array(e.width * e.height * 4),
      width: e.width,
      height: e.height
    };
    const o = new Ye(0, 0, e.width, e.height);
    let c = !1;
    for (let v = 0, E = i.length; v < E; ++v) {
      const y = i[v];
      if (!y.data) {
        console.warn("Attempted to repack a node with no valid data.");
        continue;
      }
      y.bounds.x = 0, y.bounds.y = 0;
      const C = o.insert({
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
      Ye.applyToSubTexture(o, C, y.data);
    }
    if (c)
      return !1;
    const l = new Float32Array(i.length * 2 * 6), u = new Float32Array(i.length * 2 * 6), h = new Vr();
    for (let v = 0, E = i.length; v < E; ++v) {
      const y = i[v], C = s.get(y.bounds), I = y.data;
      if (!C || !I) {
        console.warn(
          "While repacking there was an issue finding the previous bounds and the next texture to use",
          C,
          I
        );
        continue;
      }
      Ye.applyToSubTexture(o, C, h);
      const R = v * 2 * 6;
      l[R] = I.atlasTL[0] * 2 - 1, l[R + 1] = I.atlasTL[1] * 2 - 1, l[R + 2] = I.atlasTR[0] * 2 - 1, l[R + 3] = I.atlasTR[1] * 2 - 1, l[R + 4] = I.atlasBL[0] * 2 - 1, l[R + 5] = I.atlasBL[1] * 2 - 1, l[R + 6] = I.atlasTR[0] * 2 - 1, l[R + 7] = I.atlasTR[1] * 2 - 1, l[R + 8] = I.atlasBR[0] * 2 - 1, l[R + 9] = I.atlasBR[1] * 2 - 1, l[R + 10] = I.atlasBL[0] * 2 - 1, l[R + 11] = I.atlasBL[1] * 2 - 1, u[R] = h.atlasTL[0], u[R + 1] = h.atlasTL[1], u[R + 2] = h.atlasTR[0], u[R + 3] = h.atlasTR[1], u[R + 4] = h.atlasBL[0], u[R + 5] = h.atlasBL[1], u[R + 6] = h.atlasTR[0], u[R + 7] = h.atlasTR[1], u[R + 8] = h.atlasBR[0], u[R + 9] = h.atlasBR[1], u[R + 10] = h.atlasBL[0], u[R + 11] = h.atlasBL[1], I.texture = a;
    }
    const d = new $r(), p = new cr(l, 2), g = new cr(u, 2);
    d.addAttribute("position", p), d.addAttribute("texCoord", g);
    const m = new si({
      buffers: {
        color: { buffer: a, outputType: 0 }
      },
      retainTextureTargets: !0
    }), T = new Ts({
      culling: f.Material.CullSide.NONE,
      uniforms: {
        texture: { type: _e.TEXTURE, data: e.texture }
      },
      fragmentShader: /* @__PURE__ */ new Map([
        [
          m,
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
    }), x = new iu("__atlas_manager__", d, T);
    x.vertexCount = i.length * 6, x.drawMode = f.Model.DrawMode.TRIANGLES;
    const b = new ta();
    return b.add(x), this.renderer.setRenderTarget(m), this.renderer.setViewport(this.renderer.getFullViewport()), this.renderer.setScissor(this.renderer.getFullViewport()), this.renderer.render(b, m), T.dispose(), d.destroy(), m.dispose(), e.texture.destroy(), e.texture = a, e.packing = o, !0;
  }
  /**
   * This targets an existing atlas and attempts to update it with the provided
   * atlas resources.
   */
  async updateAtlas(e, t) {
    const i = this.allAtlas.get(e);
    if (i) {
      for (const n of t)
        n.disposeResource || await this.draw(i, n);
      for (let n = 0, s = t.length; n < s; ++n) {
        const a = t[n];
        a.disposeResource ? i.stopUsingResource(a) : i.useResource(a);
      }
      i.resolveResources();
    } else
      console.warn(
        "Can not update non-existing atlas:",
        e,
        "These resources will not be loaded:",
        t
      );
    return i;
  }
}
class Ag extends mn {
  constructor(e) {
    super(), this.resources = /* @__PURE__ */ new Map(), this.requestQueue = /* @__PURE__ */ new Map(), this.requestLookup = /* @__PURE__ */ new Map(), this.atlasManager = e && e.atlasManager || new _g();
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
    this.requestQueue.forEach((i, n) => {
      t.push([n, i]);
    }), this.requestQueue.clear();
    for (const [i, n] of t)
      if (n.length > 0) {
        e = !0;
        const s = n.slice(0);
        n.length = 0, await this.atlasManager.updateAtlas(i, s);
        const a = this.requestLookup.get(i);
        if (a) {
          const o = /* @__PURE__ */ new Set();
          s.forEach((c) => {
            const l = a.get(c);
            if (a.delete(c), l && !c.disposeResource)
              for (let u = 0, h = l.length; u < h; ++u) {
                const [d, p] = l[u];
                d.managesInstance(p) && (p.active = !0), o.add(p);
              }
          }), _u(() => {
            o.forEach((c) => {
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
    return [new lo(ce.ATLAS, this)];
  }
  /**
   * Initialize the atlas resources requested for construction
   */
  async initResource(e) {
    if (dc(e)) {
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
  request(e, t, i, n) {
    const s = i.key || "", a = i.texture;
    if (a)
      return hi(a);
    let o = this.requestLookup.get(s);
    if (o) {
      const l = o.get(i);
      if (l)
        return l.push([e, t]), t.active = !1, hi(i.texture);
    } else
      o = /* @__PURE__ */ new Map(), this.requestLookup.set(s, o);
    i.disposeResource || (t.active = !1);
    let c = this.requestQueue.get(s);
    return c || (c = [], this.requestQueue.set(s, c)), c.push(i), o.set(i, [[e, t]]), hi(a);
  }
  /**
   * System is requesting properties for a resource to be updated.
   */
  updateResource(e) {
    dc(e);
  }
}
const Mg = new Image();
function nn(r) {
  return {
    type: ce.ATLAS,
    source: Mg,
    ...r
  };
}
class Ig extends mn {
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
    return [new lo(ce.TEXTURE, this)];
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
    t = new Ps(e, this.webGLRenderer), this.resources.set(e.key, t);
  }
  /**
   * Handle requests that stream in from instances requesting metrics for a
   * specific resource.
   */
  request(e, t, i, n) {
    const s = this.resources.get(i.key);
    return s ? (i.texture = s.texture, [0, 0, 1, 1]) : [0, 0, 0, 0];
  }
  /**
   * Trigger that executes when the rendering context resizes. For this manager,
   * we will update all textures with dimensions that are tied to the screen.
   */
  resize() {
    const e = /* @__PURE__ */ new Map();
    this.resources.forEach((t, i) => {
      t.width > _t.SCREEN && t.height > _t.SCREEN || (t.texture.destroy(), t = new Ps(t, this.webGLRenderer), e.set(i, t));
    }), e.forEach((t, i) => this.resources.set(i, t));
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
    e.height !== t.height || e.width !== t.width ? (t.texture.destroy(), t = new Ps(e, this.webGLRenderer), this.resources.set(e.key, t)) : e.textureSettings && t.texture.applySettings(e.textureSettings);
  }
}
const Sg = Ee("performance");
class Wu {
  constructor() {
    this.managers = /* @__PURE__ */ new Map(), this.resourceKeyToType = /* @__PURE__ */ new Map();
  }
  /**
   * This is called by the system to cause the managers to dequeue their requests in an asynchronous fashion
   */
  async dequeueRequests() {
    let e = !1;
    const t = Array.from(this.managers.values());
    for (let i = 0, n = t.length; i < n; ++i) {
      const a = await t[i].dequeueRequests();
      e = e || a;
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
    ), gd);
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
  request(e, t, i, n) {
    const s = this.managers.get(i.type);
    return s ? s.request(e, t, i, n) : (console.warn(
      `A Layer is requesting a resource for which there is no manager set. Please make sure a Resource Manager is set for resource of type: ${i.type}`
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
    this.managers.get(e) && Sg(
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
const Cg = new Wu(), jT = {
  createFont: Vu,
  createAtlas: $u,
  createTexture: au,
  createColorBuffer: Ja
}, HT = {
  textureRequest: cn,
  atlasRequest: nn,
  fontRequest: Hi,
  colorBufferRequest: ia
}, Ng = `// This contains the method required to be used on a fragment shader when a layer desires to use
// PickType.SINGLE (color picking).
varying highp vec4 _picking_color_pass_;

void main() {
  \${out: _picking_fragment_} = _picking_color_pass_;
  // _picking_fragment_ = vec4(1.0, 0.0, 0.0, 1.0);
}
`, pc = {
  attributes: "attributes",
  easingMethod: "easingMethod",
  extend: "extend",
  extendHeader: "extendHeader",
  T: "T"
};
class gc {
  constructor(e) {
    this.index = 0, this.available = 4, this.index = e;
  }
  setAttribute(e) {
    return (e.size || 0) <= this.available ? (e.block = this.index, e.blockIndex = 4 - this.available, this.available -= e.size || 0, !0) : !1;
  }
}
function Og(r) {
  r.forEach((e) => {
    if (e.resource && e.size === void 0 && (e.size = S.FOUR), !e.size)
      try {
        const t = e.update(new wt({}));
        t.length > 0 && t.length <= S.FOUR && (e.size = t.length);
      } catch {
        console.warn(
          "The system could not determine the size of the provided attribute. Please provide the size of the attribute:",
          e
        );
      }
  });
}
function Lg(r) {
  Og(r);
  const e = [];
  r.forEach((t) => {
    if (t.size && t.size === S.MAT4X4) {
      t.block = e.length, t.blockIndex = Jc.INVALID;
      for (let n = 0; n < 4; ++n) {
        const s = new gc(e.length);
        s.available = 0, s.index = 0, e.push(s);
      }
      return;
    }
    if (!e.find((n) => n.setAttribute(t) ? !!n : !1)) {
      const n = new gc(e.length);
      e.push(n), n.setAttribute(t) || console.warn(
        "There was a problem packing an attribute into a block. No block would accommodate it:",
        t
      );
    }
  });
}
function mc(r) {
  return !!r;
}
function xc(r) {
  return !!r;
}
function Tc(r) {
  return !!r;
}
function Fg(r) {
  return Object.assign({}, r, { materialAttribute: null });
}
function Bg(r) {
  return Object.assign({}, r, { materialIndexBuffer: null });
}
function Pg(r) {
  return Object.assign({}, r, { materialUniforms: [] });
}
function Dg(r, e, t, i) {
  e.forEach((n) => {
    n.name === void 0 && console.warn(
      "All instance attributes MUST have a name on Layer:",
      r.id
    ), e.find(
      (s) => s !== n && s.name === n.name
    ) && console.warn(
      "An instance attribute can not have the same name used more than once:",
      n.name
    ), t.find((s) => s.name === n.name) && console.warn(
      "An instance attribute and a vertex attribute in a layer can not share the same name:",
      n.name
    ), n.resource || n.size === void 0 && (console.warn("An instance attribute requires the size to be defined."), console.warn(n));
  });
}
function Ug(r, e, t) {
  if (!t) return;
  let i = e.instanceAttributes || [], n = e.uniforms || [], s = e.vertexAttributes || [];
  t.shaderModuleUnits.forEach((l) => {
    l.instanceAttributes && (i = i.concat(
      l.instanceAttributes(r)
    )), l.uniforms && (n = n.concat(l.uniforms(r))), l.vertexAttributes && (s = s.concat(
      l.vertexAttributes(r)
    ));
  });
  const a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set();
  n.filter((l) => l ? a.has(l.name) ? (console.warn(
    "Included shader modules has introduced duplicate uniform names:",
    l.name,
    "One will be overridden thus causing a potential crash of the shader."
  ), !1) : (a.add(l.name), !0) : !1), i.filter((l) => l ? o.has(l.name) ? (console.warn(
    "Included shader modules has introduced duplicate Instance Attribute names:",
    l.name,
    "One will be overridden thus causing a potential crash of the shader."
  ), !1) : (o.add(l.name), !0) : !1), s.filter((l) => l ? c.has(l.name) ? (console.warn(
    "Included shader modules has introduced duplicate Vertex Attribute names:",
    l.name,
    "One will be overridden thus causing a potential crash of the shader."
  ), !1) : (c.add(l.name), !0) : !1), e.instanceAttributes = i, e.uniforms = n, e.vertexAttributes = s;
}
function kg(r, e, t, i, n, s) {
  Ug(e, t, s);
  const a = (t.instanceAttributes || []).filter(
    mc
  ), o = (t.vertexAttributes || []).filter(
    xc
  ), c = (t.uniforms || []).filter(Tc);
  let l = oe(t.indexBuffer) ? t.indexBuffer : void 0;
  for (let g = 0, m = i.length; g < m; ++g) {
    const T = i[g];
    if (T.validate(
      e,
      a,
      o,
      c
    )) {
      const x = T.expand(
        e,
        a,
        o,
        c
      );
      x.instanceAttributes.filter(mc).forEach((b) => a.push(b)), x.vertexAttributes.filter(xc).forEach((b) => o.push(b)), x.uniforms.filter(Tc).forEach((b) => c.push(b)), oe(x.indexBuffer) && (l = x.indexBuffer);
    }
  }
  Dg(
    e,
    a,
    o
  );
  const u = a.slice(0), h = (o || []).map(
    Fg
  ), d = c.map(Pg), p = oe(l) ? Bg(l) : void 0;
  return u.sort(n.sortInstanceAttributes), d.sort(n.sortUniforms), h.sort(n.sortVertexAttributes), Lg(u), e.getLayerBufferType(
    r,
    t,
    o,
    u
  ), {
    instanceAttributes: u,
    uniforms: d,
    vertexAttributes: h,
    indexBuffer: p
  };
}
class uo {
  /**
   * This calculates how many uniform blocks are utilized based on the input uniforms
   */
  static calculateUniformBlockUseage(e) {
    let t = 0;
    for (let i = 0, n = e.length; i < n; ++i)
      t += Math.ceil(e[i].size / 4);
    return t;
  }
  /**
   * Calculates all of the metrics that will be needed in this processor.
   */
  process(e, t) {
    this.instanceMaxBlock = 0, e.forEach((i) => {
      this.instanceMaxBlock = Math.max(
        this.instanceMaxBlock,
        i.block || 0
      );
    }), this.blocksPerInstance = this.instanceMaxBlock + 1, this.maxUniforms = N.MAX_VERTEX_UNIFORMS, this.maxUniformsForInstancing = this.maxUniforms - uo.calculateUniformBlockUseage(t), this.maxInstancesPerUniformBuffer = Math.floor(
      this.maxUniformsForInstancing / this.blocksPerInstance
    ), this.totalInstanceUniformBlocks = this.maxInstancesPerUniformBuffer * this.blocksPerInstance;
  }
}
const Zi = "Once a ShaderModuleUnit has been registered, you CAN NOT modify it! Module ID:";
class ks {
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
      console.warn(Zi, this._moduleId);
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
      console.warn(Zi, this._moduleId);
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
      console.warn(Zi, this._moduleId);
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
      console.warn(Zi, this._moduleId);
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
      console.warn(Zi, this._moduleId);
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
const bc = Ee("performance"), Gg = Ee("shader-module-vs"), zg = Ee("shader-module-fs"), vc = "import", wc = ":";
function Ec(r, e) {
  return !!r && (r.compatibility === e || r.compatibility === A.ALL);
}
const Ft = class Ft {
  /**
   * This registers a new ShaderModuleUnit. It makes the module available by
   * it's importId within shaders using this framework.
   *
   * If the module is registered with no returned output, the registration was a
   * success. Any returned output indicates issues encountered while registering
   * the module.
   */
  static register(e) {
    if (!(e instanceof ks)) {
      if (Array.isArray(e)) {
        let o = "";
        return e.forEach((c) => {
          const l = Ft.register(c);
          l && (o += `${l}
`);
        }), o || null;
      }
      return Ft.register(new ks(e));
    }
    let t = Ft.modules.get(e.moduleId);
    t || (t = {}, Ft.modules.set(e.moduleId, t));
    const i = t.fs, n = t.vs, s = Ec(
      e,
      A.FRAGMENT
    ), a = Ec(e, A.VERTEX);
    if (i && s) {
      if (i.isFinal)
        return `Module ID: ${e.moduleId} Can not override the module's existing Fragment registration as the exisitng module is marked as final`;
      bc(
        "A Shader Module Unit has overridden an existing module for the Fragment Shader Module ID: %o",
        e.moduleId
      );
    }
    if (n && a) {
      if (n.isFinal)
        return `Module ID: ${e.moduleId} Can not override the module's existing Vertex registration as the exisitng module is marked as final`;
      bc(
        "A Shader Module Unit has overridden an existing module for the Vertex Shader Module ID: %o",
        e.moduleId
      );
    }
    return s && (t.fs = e), a && (t.vs = e), e.lock(), null;
  }
  /**
   * This gathers all of the dependents for the module as ids. This also causes
   * the contents of the module to be stripped of it's import statements.
   */
  static analyzeDependents(e) {
    if (e.dependents && e.isLocked())
      return [];
    const t = [], i = [], n = /* @__PURE__ */ new Set(), s = e.compatibility, a = e.moduleId, o = ui({
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
        if (l.indexOf(vc) === 0) {
          const u = l.substr(vc.length).trim();
          if (u[0] === wc) {
            let h = !1;
            const d = u.substr(wc.length).trim().split(",");
            return d[d.length - 1].trim().length === 0 && d.pop(), d.forEach((p) => {
              p = p.trim();
              const g = Ft.modules.get(p);
              g ? ((s === A.FRAGMENT || s === A.ALL) && (g.fs ? (h = !0, n.has(p) || i.push(p)) : t.push(
                `Could not find requested target fragment module for Module ID: ${p} requested by module: ${a}`
              )), (s === A.VERTEX || s === A.ALL) && (g.vs ? (h = !0, n.has(p) || i.push(p)) : t.push(
                `Could not find requested target vertex module for Module ID: ${p} requested by module: ${a}`
              )), !g.vs && !g.fs && t.push(
                "Could not find a vertex or fragment shader within exisitng module"
              ), h || t.push(
                `Error Processing module Module ID: ${p} requested by module: ${a}`
              )) : t.push(
                `Could not find requested module: ${p} requested by module: ${a}`
              );
            }), "";
          }
        }
        return `\${${c}}`;
      }
    });
    return e.applyAnalyzedContent(o.shader), e.dependents = i, t;
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
  static process(e, t, i, n) {
    const s = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Set(), o = [], c = [], l = i === A.VERTEX ? Gg : zg;
    l("Processing Shader for context %o:", e);
    function u(m) {
      const T = m.moduleId;
      l("%o: %o", T, o.slice(0).reverse().join(" -> "));
      const x = o.indexOf(T);
      if (o.unshift(T), x > -1) {
        const b = o.slice(0, x + 2).reverse();
        return c.push(
          `A Shader has detected a Circular dependency in import requests: ${b.join(
            " -> "
          )}`
        ), o.shift(), !1;
      }
      return !0;
    }
    function h(m) {
      const T = m.moduleId;
      if (!u(m))
        return null;
      if (T && a.has(T))
        return o.shift(), "";
      let x = "";
      Ft.analyzeDependents(m).forEach((E) => c.push(E));
      const v = m.dependents;
      if (l("Module dependencies detected %o", v), v && v.length > 0)
        for (let E = 0, y = v.length; E < y; ++E) {
          const C = v[E], I = Ft.modules.get(C);
          if (I) {
            let R;
            (i === A.FRAGMENT || i === A.ALL) && (I.fs ? (s.add(I.fs), R = h(I.fs)) : c.push(
              `Could not find requested target fragment module for Module ID: ${C} requested by module: ${T}`
            )), (i === A.VERTEX || i === A.ALL) && (I.vs ? (s.add(I.vs), R = h(I.vs)) : c.push(
              `Could not find requested target vertex module for Module ID: ${C} requested by module: ${T}`
            )), !I.vs && !I.fs && c.push(
              "Could not find a vertex or fragment shader within exisitng module"
            ), R === null && c.push(
              `Error Processing module Module ID: ${C} requested by module: ${T}`
            ), x += R || "";
          } else
            c.push(
              `Could not find requested module: ${C} requested by module: ${T}`
            );
        }
      return o.shift(), a.add(T || ""), `${x.trim()}

${m.content.trim()}`;
    }
    let d = t;
    if (n) {
      let m = "";
      n.forEach((T) => {
        m += `\${import: ${T}}
`;
      }), d = m + t;
    }
    const p = new ks({
      content: d,
      compatibility: i,
      moduleId: `Layer "${e}" ${i === A.ALL ? "fs vs" : i === A.VERTEX ? "vs" : "fs"}`
    });
    return {
      errors: c,
      shader: h(p),
      shaderModuleUnits: s
    };
  }
};
Ft.modules = /* @__PURE__ */ new Map();
let ve = Ft;
const Fn = "out", Bn = ":";
class yc {
  constructor() {
    this.metricsProcessing = new uo();
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
  static mergeFragmentOutputsForMRT(e, t, i, n, s, a) {
    let o = "", c = "", l = "";
    const u = /* @__PURE__ */ new Set(), h = [], d = /* @__PURE__ */ new Set();
    return N.MRT || (l = " = gl_FragColor"), i.forEach((p, g) => {
      let m = !0, T = !1;
      if (s && s.indexOf(p.outputType) < 0 && (m = !1), a && g < i.length - 1 && (m = !1), !a && n.indexOf(p.outputType) < 0 && (m = !1), d.has(p.outputType))
        throw new Error(
          "Can not use the same Output Fragment type multiple times"
        );
      d.add(p.outputType);
      const x = n.indexOf(p.outputType);
      ui({
        shader: ls(p.source),
        /**
         * Analyze each token for "out" tokens indicating output
         */
        onToken(b) {
          const v = b.trim();
          if (v.indexOf(Fn) === 0) {
            if (T)
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
            T = !0;
            const E = v.substr(Fn.length).trim();
            if (E[0] === Bn) {
              const y = E.substr(Bn.length).trim();
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
              if (m)
                if (u.add(y), h.push(p.outputType), N.MRT_EXTENSION)
                  l = ` = gl_FragData[${x}]`, C = "vec4 ";
                else if (N.MRT && N.SHADERS_3_0)
                  t.set(
                    y,
                    `layout(location = ${x}) out vec4 ${y};
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
          return `\${${b}}`;
        },
        /**
         * We use this to aggregate all of our main bodies and headers together
         */
        onMain(b, v) {
          return !T && b && (b.match("gl_FragColor") ? (h.push(p.outputType), N.MRT && (N.SHADERS_3_0 ? (t.set(
            "_FragColor",
            `layout(location = ${x}) out vec4 _FragColor;
`
          ), b = b.replace(/gl_FragColor/g, "_FragColor")) : (b = b.replace(
            /gl_FragColor\s+=/,
            `vec4 _FragColor = gl_FragData[${x}] =`
          ), b = b.replace(
            /gl_FragColor\s+=/g,
            `_FragColor = gl_FragData[${x}] =`
          ), b = b.replace(/gl_FragColor/g, "_FragColor"))), u.add("_FragColor")) : h.push(V.NONE)), o += `
${(v || "").trim()}`, c += `
  ${(b || "").trim()}`, (b || "").trim();
        }
      });
    }), {
      output: `${o}
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
    if (t.length > 1 || t[0] !== V.COLOR)
      throw new Error(
        "Merging fragment shaders for only COLOR output is only valid when the view has a single COLOR output target."
      );
    Rt(e) && (e = [
      {
        outputType: V.COLOR,
        source: e
      }
    ]);
    let i = "", n = "";
    const s = /* @__PURE__ */ new Set(), a = [];
    return e.some((o) => {
      const c = o.outputType === V.COLOR;
      let l = !1;
      return c && a.push(V.COLOR), ui({
        shader: ls(o.source),
        /**
         * Analyze each token for "out" tokens indicating output
         */
        onToken(u) {
          const h = u.trim();
          if (h.indexOf(Fn) === 0) {
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
            const d = h.substr(Fn.length).trim();
            if (d[0] === Bn) {
              const p = d.substr(Bn.length).trim();
              if (!p)
                throw new Error(
                  "Output in a shader requires an identifier ${out: <name required>}"
                );
              if (s.has(p))
                throw new Error(
                  "You can not declare the same output name in subsequent fragment shader outputs"
                );
              if (p === "gl_FragColor")
                throw new Error(
                  "DO not use gl_FragColor as an identifier for an out. Choose something not used by the WebGL spec."
                );
              return c ? (s.add("gl_FragColor"), p !== "gl_FragColor" ? `vec4 ${p} = gl_FragColor` : "gl_FragColor") : `vec4 ${p}`;
            }
          }
          return `\${${u}}`;
        },
        onMain(u, h) {
          return n += `
${(h || "").trim()}`, i += `
  ${(u || "").trim()}`, (u || "").trim();
        }
      }), !!c;
    }), {
      output: `${n}
void main() {
${i}
}`,
      outputNames: Array.from(s.values()),
      outputTypes: a
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
  static makeOutputFragmentShader(e, t, i, n) {
    if (!i || Rt(i))
      if (Rt(n)) {
        const s = this.mergeOutputFragmentShaderForColor(
          [
            {
              source: n,
              outputType: V.COLOR
            }
          ],
          [V.COLOR]
        );
        return {
          source: s.output,
          outputTypes: [V.COLOR],
          outputNames: s.outputNames
        };
      } else if (Array.isArray(n)) {
        const s = n.find(
          (c) => c.outputType === V.COLOR
        );
        let a = -1;
        s ? a = n.indexOf(s) : a = n.length - 1;
        const o = this.mergeOutputFragmentShaderForColor(
          n.slice(0, a + 1),
          [V.COLOR]
        );
        return {
          source: o.output,
          outputNames: o.outputNames,
          outputTypes: [V.COLOR]
        };
      } else
        return null;
    else if (Array.isArray(i)) {
      if (!N.MRT)
        throw new Error(
          "Multiple Render Targets were specified, but are not natively supported by user's hardware! MRT also does not have a fallback in deltav yet!"
        );
      const s = i.map((a) => a.outputType);
      if (Array.isArray(n)) {
        const a = /* @__PURE__ */ new Map();
        for (let o = 0, c = i.length; o < c; ++o) {
          const l = i[o];
          for (let u = 0, h = n.length; u < h; ++u)
            if (n[u].outputType === l.outputType) {
              a.set(l.outputType, u);
              break;
            }
        }
        if (N.MRT) {
          let o = -1;
          const c = [];
          if (a.forEach((u, h) => {
            c.push(h), o = Math.max(u, o);
          }), o === -1) return null;
          const l = this.mergeFragmentOutputsForMRT(
            e,
            t,
            n.slice(0, o + 1),
            s,
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
      } else if (i.find(
        (o) => o.outputType === V.COLOR
      ) && n) {
        const o = this.mergeFragmentOutputsForMRT(
          e,
          t,
          [
            {
              source: n,
              outputType: V.COLOR
            }
          ],
          s
        );
        return {
          source: o.output,
          outputNames: o.outputNames,
          outputTypes: o.outputTypes
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
  process(e, t, i, n, s, a, o) {
    try {
      if (!e.surface.gl)
        return console.warn("No WebGL context available for layer!"), null;
      const c = this.processImports(
        e,
        t,
        i
      );
      if (!c) return null;
      const { vertexAttributes: l, instanceAttributes: u, indexBuffer: h, uniforms: d } = kg(
        e.surface.gl,
        e,
        t,
        s,
        o,
        c
      );
      e.getLayerBufferType(
        e.surface.gl,
        t,
        l,
        u
      ), this.metricsProcessing.process(u, d);
      let p = "", g = "", m = "";
      const T = {
        uniforms: []
      }, x = n.vs || /* @__PURE__ */ new Map(), b = n.fs || /* @__PURE__ */ new Map(), v = n.destructure || /* @__PURE__ */ new Map();
      for (let U = 0, Q = s.length; U < Q; ++U) {
        const W = s[U], re = W.processHeaderInjection(
          A.VERTEX,
          x,
          e,
          this.metricsProcessing,
          l,
          u,
          d
        );
        p += re.injection, re.material && (T.uniforms = T.uniforms.concat(
          re.material.uniforms || []
        )), m += W.processAttributeDestructuring(
          e,
          v,
          this.metricsProcessing,
          l,
          u,
          d
        );
      }
      let E = "";
      x.forEach((U) => {
        E += U;
      }), p = E + p, E = "", v.forEach((U) => {
        E += U;
      }), m = E + m;
      const y = this.processExtensions(), C = `precision highp float;

`, I = y + C + p + c.vs;
      let R = {
        [pc.attributes]: m
      }, $ = !1;
      const z = ui({
        options: R,
        required: void 0,
        shader: I,
        onToken(U, Q) {
          return U === pc.attributes && ($ = !0), Q;
        },
        onMain(U) {
          return $ ? U || "" : U === null ? (console.warn("The body of void main() could not be determined."), "") : `${m}
${U}`;
        }
      });
      return c.fs.forEach((U, Q) => {
        R = {}, g = "", E = "";
        const W = b.get(Q) || /* @__PURE__ */ new Map();
        for (let ee = 0, K = s.length; ee < K; ++ee) {
          const w = s[ee].processHeaderInjection(
            A.FRAGMENT,
            W,
            e,
            this.metricsProcessing,
            l,
            u,
            d
          );
          if (g += w.injection, w.material) {
            const k = /* @__PURE__ */ new Set();
            T.uniforms.forEach(
              (H) => k.add(H.name)
            ), T.uniforms.forEach((H) => {
              k.has(H.name) || T.uniforms.push(H);
            });
          }
        }
        W.forEach((ee) => {
          E += ee;
        }), g = E + g;
        const re = y + C + g + U.source, J = ui({
          options: R,
          required: void 0,
          shader: re
        });
        U.source = J.shader.trim();
        for (let ee = 0, K = a.length; ee < K; ++ee) {
          const Oe = a[ee];
          z.shader = Oe.vertex(z.shader), U.source = Oe.fragment(U.source);
        }
      }), {
        fs: c.fs,
        materialUniforms: T.uniforms,
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
    return N.SHADERS_3_0 && (e += "#version 300 es"), N.MRT_EXTENSION && (e += "#extension GL_EXT_draw_buffers : require"), e && (e += `

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
  processImports(e, t, i) {
    const n = /* @__PURE__ */ new Set();
    let s = e.baseShaderModules(t);
    e.props.baseShaderModules && (s = e.props.baseShaderModules(t, s));
    const a = ve.process(
      e.id,
      t.vs,
      A.VERTEX,
      s.vs
    );
    if (a.errors.length > 0)
      return console.warn(
        "Error processing imports for the vertex shader of layer:",
        e.id,
        "Errors",
        ...a.errors.reverse()
      ), null;
    const o = /* @__PURE__ */ new Map();
    return i.forEach((c, l) => {
      const u = ve.process(
        e.id,
        c.source,
        A.FRAGMENT,
        s.fs
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
      o.set(l, h);
    }), a.shaderModuleUnits.forEach(
      (c) => n.add(c)
    ), {
      fs: o,
      vs: a.shader || "",
      shaderModuleUnits: n
    };
  }
}
const Fr = "EasingIOExpansion", { abs: Vg, max: $g } = Math, Wg = {
  duration: 0,
  start: [0],
  startTime: 0
}, Rc = {
  1: "float",
  2: "vec2",
  3: "vec3",
  4: "vec4",
  9: "mat3",
  16: "mat4",
  /** This is the special case for instance attributes that want an atlas resource */
  99: "vec4"
}, Gs = {
  easingMethod: "easingMethod",
  T: "T"
};
function jg(r) {
  return !!r && r.easing && r.size !== void 0 && r.size <= 4;
}
function XT(r) {
  return r;
}
class Hg extends Cs {
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
  expand(e, t, i, n) {
    const s = /* @__PURE__ */ new Set(), a = [], o = [];
    for (const l of t)
      jg(l) && a.push(l);
    const c = {};
    e.easingId = c;
    for (let l = 0, u = a.length; l < u; ++l) {
      const h = a[l], { cpu: d, loop: p, uid: g } = h.easing, { name: m, size: T, update: x } = h, b = g;
      this.baseAttributeName.set(h, h.name), h.name = `_${h.name}_end`, c[h.name] = b, s.has(b) && console.error(
        "Undefined behavior occurs if you reuse an IAutoEasingMethod. Please ensure you are using uid() from the util to give the IAutoEasingMethod its uid, or just use the default provided methods"
      ), s.add(b);
      const v = {
        values: Wg
      };
      let E, y, C, I, R, $, z, F, U, Q, W, re, J;
      h.update = (w) => {
        if (U = e.surface.frameMetrics, y = h.easing.delay, C = h.easing.duration, z = x(w), F = U.currentTime, w.easing = re = w.easing || /* @__PURE__ */ new Map(), Q = re.get(b), !W || !Q ? (W = D(z), Q = new nu({
          duration: C,
          end: W.copy(z),
          start: W.copy(z),
          startTime: F
        }), re.set(b, Q)) : w.reactivate && (W.copy(z, Q.end), W.copy(z, Q.end), Q.startTime = F), R = Q, I = C, E = y, R.isTimeSet && (I = R.duration || C, E = R.delay || 0), !R.isManualStart) {
          switch ($ = 1, p) {
            // Continuous means we start at 0 and let the time go to infinity
            case tr.CONTINUOUS:
              $ = (F - R.startTime) / I, J = !0;
              break;
            // Repeat means going from 0 to 1 then 0 to 1 etc etc
            case tr.REPEAT:
              $ = (F - R.startTime) / I % 1, J = !0;
              break;
            // Reflect means going from 0 to 1 then 1 to 0 then 0 to 1 etc etc
            case tr.REFLECT: {
              const k = (F - R.startTime) / I;
              $ = Vg(k / 2 % 1 - 0.5) * 2, J = !0;
              break;
            }
            // No loop means just linear time
            case tr.NONE:
            default:
              $ = (F - R.startTime) / I, J = !1;
              break;
          }
          R.start = d(
            R.start,
            R.end,
            $,
            R.start
          );
        }
        return R.startTime = F + E, W.copy(z, R.end), v.values = R, e.animationEndTime = $g(
          e.animationEndTime,
          R.startTime + I + U.frameDuration
        ), e.alwaysDraw = J, z;
      }, h.childAttributes = h.childAttributes || [];
      const ee = {
        name: `_${m}_start`,
        parentAttribute: h,
        size: T,
        update: (w) => v.values.start
      };
      h.childAttributes.push(ee), o.push(ee);
      const K = {
        name: `_${m}_start_time`,
        parentAttribute: h,
        size: S.ONE,
        update: (w) => [v.values.startTime]
      };
      h.childAttributes.push(K), o.push(K);
      const Oe = {
        name: `_${m}_duration`,
        parentAttribute: h,
        size: S.ONE,
        update: (w) => [v.values.duration]
      };
      h.childAttributes.push(Oe), o.push(Oe);
    }
    return {
      instanceAttributes: o,
      vertexAttributes: [],
      uniforms: []
    };
  }
  /**
   * Validates the IO about to be expanded.
   */
  validate(e, t, i, n) {
    let s = !1;
    return t.forEach((a) => {
      a.easing && a.resource && (console.warn(
        "An instance attribute can not have both easing and resource properties. Undefined behavior will occur."
      ), console.warn(a), s = !0), a.easing && a.size === void 0 && console.warn(
        "An Instance Attribute with easing MUST have a size declared"
      );
    }), !s;
  }
  /**
   * Easing provides some unique destructuring for the packed in vertex
   * information.
   */
  processAttributeDestructuring(e, t, i, n, s, a) {
    const o = "";
    for (let c = 0, l = s.length; c < l; ++c) {
      const u = s[c];
      if (!u.easing || !u.size) continue;
      const h = this.baseAttributeName.get(u);
      if (!h) {
        console.warn(
          "Could not determine a base name for an easing attribute."
        );
        continue;
      }
      this.baseAttributeName.delete(u);
      const d = `_${h}_time`, p = `_${h}_duration`, g = `_${h}_start_time`;
      switch (u.easing.loop) {
        // Continuous means letting the time go from 0 to infinity
        case tr.CONTINUOUS: {
          this.setDeclaration(
            t,
            d,
            `  float ${d} = (currentTime - ${g}) / ${p};
`,
            Fr
          );
          break;
        }
        // Repeat means going from 0 to 1 then 0 to 1 etc etc
        case tr.REPEAT: {
          this.setDeclaration(
            t,
            d,
            `  float ${d} = clamp(fract((currentTime - ${g}) / ${p}), 0.0, 1.0);
`,
            Fr
          );
          break;
        }
        // Reflect means going from 0 to 1 then 1 to 0 then 0 to 1 etc etc
        case tr.REFLECT: {
          const m = `_${h}_timePassed`, T = `_${h}_pingPong`;
          this.setDeclaration(
            t,
            m,
            `  float ${m} = (currentTime - ${g}) / ${p};
`,
            Fr
          ), this.setDeclaration(
            t,
            T,
            `  float ${T} = abs((fract(${m} / 2.0)) - 0.5) * 2.0;
`,
            Fr
          ), this.setDeclaration(
            t,
            d,
            `  float ${d} = clamp(${T}, 0.0, 1.0);
`,
            Fr
          );
          break;
        }
        // No loop means just linear time
        case tr.NONE:
        default: {
          this.setDeclaration(
            t,
            d,
            `  float ${d} = clamp((currentTime - ${g}) / ${p}, 0.0, 1.0);
`,
            Fr
          );
          break;
        }
      }
      this.setDeclaration(
        t,
        h,
        `  ${Rc[u.size]} ${h} = ${u.easing.methodName}(_${h}_start, _${h}_end, _${h}_time);
`,
        Fr
      );
    }
    return o;
  }
  /**
   * For easing, the header must be populated with the easing method
   */
  processHeaderInjection(e, t, i, n, s, a, o) {
    const c = { injection: "" };
    if (e !== A.VERTEX) return c;
    const l = /* @__PURE__ */ new Map();
    if (c.injection = `// Auto Easing Methods specified by the layer
`, a.forEach((h) => {
      if (h.easing && h.size) {
        let d = l.get(h.easing.methodName);
        d || (d = /* @__PURE__ */ new Map(), l.set(h.easing.methodName, d)), d.set(h.size, h.easing.gpu);
      }
    }), l.size === 0)
      return c.injection = "", c;
    const u = {
      name: "Easing Method Generation",
      values: [Gs.easingMethod]
    };
    return l.forEach(
      (h, d) => {
        h.forEach((p, g) => {
          const m = Rc[g], T = {
            [Gs.easingMethod]: `${m} ${d}(${m} start, ${m} end, float t)`,
            [Gs.T]: `${m}`
          }, x = ui({
            options: T,
            required: u,
            shader: p
          });
          this.setDeclaration(
            t,
            `${m} ${d}`,
            `${x.shader}
`,
            Fr
          );
        });
      }
    ), c;
  }
}
const ti = "BasicIOExpansion", Xg = ["x", "y", "z", "w"], ri = {
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
function ju(r) {
  return r && r.length;
}
function Qg(r) {
  const e = r.size;
  if (e === _.FLOAT_ARRAY || e === _.VEC4_ARRAY) {
    const t = r.update(r);
    if (ju(t))
      return `#define ${r.name}_length ${t.length}
`;
  }
  return "";
}
function Yg(r) {
  const e = r.size;
  if (e === _.FLOAT_ARRAY || e === _.VEC4_ARRAY) {
    const t = r.update(r);
    if (ju(t))
      return `[${r.name}_length]`;
  }
  return "";
}
function qg(r, e) {
  return Xg.slice(r, r + e).join("");
}
class Kg extends Cs {
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
  processAttributeDestructuring(e, t, i, n, s, a) {
    let o = "";
    const c = s.slice(0);
    switch (e.bufferType) {
      case ae.VERTEX_ATTRIBUTE:
      case ae.INSTANCE_ATTRIBUTE:
        o = this.processDestructuringInstanceAttribute(
          t,
          c
        );
        break;
      case ae.VERTEX_ATTRIBUTE_PACKING:
      case ae.INSTANCE_ATTRIBUTE_PACKING:
        o = this.processDestructuringInstanceAttributePacking(
          t,
          c
        );
        break;
    }
    return e.picking.type === Y.SINGLE && (o += `
// This portion is where the shader assigns the picking color that gets passed to the fragment shader
_picking_color_pass_ = _pickingColor;
`), o;
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
    let i = "";
    return i += this.processDestructureBlocks(e, t), i;
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
    const i = "";
    return t.forEach((n) => {
      const s = n.block || 0;
      n.size === S.MAT4X4 ? this.setDeclaration(
        e,
        n.name,
        `  ${ri[n.size]} ${n.name} = mat4(block${s}, block${s + 1}, block${s + 2}, block${s + 3});
`,
        ti
      ) : n.size === S.FOUR ? this.setDeclaration(
        e,
        n.name,
        `  ${ri[n.size]} ${n.name} = block${s};
`,
        ti
      ) : this.setDeclaration(
        e,
        n.name,
        `  ${ri[n.size || 1]} ${n.name} = block${s}.${qg(
          n.blockIndex || 0,
          n.size || 1
        )};
`,
        ti
      );
    }), i;
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
  processHeaderInjection(e, t, i, n, s, a, o) {
    let c = {
      injection: ""
    };
    e === A.VERTEX && (c = this.processAttributeHeader(
      t,
      i,
      n,
      s,
      a
    ));
    const l = this.processUniformHeader(
      t,
      o,
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
  processAttributeHeader(e, t, i, n, s) {
    let o = `// Shader input
`;
    return o += this.processVertexAttributes(e, n), (t.bufferType === ae.INSTANCE_ATTRIBUTE || t.bufferType === ae.VERTEX_ATTRIBUTE) && s.length > 0 && (o += this.processInstanceAttributeBufferStrategy(
      e,
      s
    )), (t.bufferType === ae.INSTANCE_ATTRIBUTE_PACKING || t.bufferType === ae.VERTEX_ATTRIBUTE_PACKING) && s.length > 0 && (o += this.processInstanceAttributePackingBufferStrategy(
      e,
      i.instanceMaxBlock
    )), {
      injection: o,
      material: void 0
    };
  }
  /**
   * Processes all IO for uniform declarations needed in the header of the
   * shader.
   */
  processUniformHeader(e, t, i) {
    const n = "", s = i || A.VERTEX;
    return t.forEach((a) => {
      a.shaderInjection = a.shaderInjection || A.VERTEX, (a.shaderInjection === s || a.shaderInjection === A.ALL) && this.setDeclaration(
        e,
        a.name,
        `${Qg(a)}uniform ${a.qualifier || ""}${a.qualifier ? " " : ""}${ri[a.size]} ${a.name}${Yg(
          a
        )};
`,
        ti
      );
    }), n;
  }
  /**
   * Produces attributes that are explicitally named and set by the attribute
   * itself.
   */
  processInstanceAttributeBufferStrategy(e, t) {
    let i = "attribute";
    return N.SHADERS_3_0 && (i = "in"), t.forEach((n) => {
      this.setDeclaration(
        e,
        n.name,
        `${i} ${ri[n.size || 1]} ${n.qualifier || ""}${n.qualifier && " " || ""} ${n.name};
`,
        ti
      );
    }), "";
  }
  /**
   * Produces attributes that are blocks instead of individual attributes. The
   * system uses these blocks to pack attributes tightly together to maximize
   * capabilities.
   */
  processInstanceAttributePackingBufferStrategy(e, t) {
    let i = "attribute";
    N.SHADERS_3_0 && (i = "in");
    for (let n = 0, s = t + 1; n < s; ++n)
      this.setDeclaration(
        e,
        `block${n}`,
        `${i} ${ri[S.FOUR]} block${n};
`,
        ti
      );
    return "";
  }
  /**
   * Produces the vertex attributes without any bias or modification.
   */
  processVertexAttributes(e, t) {
    let i = "attribute";
    return N.SHADERS_3_0 && (i = "in"), t.forEach((n) => {
      this.setDeclaration(
        e,
        n.name,
        `${i} ${ri[n.size]} ${n.qualifier || ""}${n.qualifier && " " || ""}${n.name};
`,
        ti
      );
    }), "";
  }
}
const Zg = "instanceData", Jg = "_active", em = `
  // This is a special injected instance attribute. It lets the system
  // control specific instances ability to draw, which allows the backend
  // system greater control on how it optimizes draw calls and it's buffers.
  if (_active < 0.5) {
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);

    // Quick exit to prevent any geometry from arising from the instance
    return;
  }

`, tm = "ActiveIOExpansion";
class rm extends Cs {
  processAttributeDestructuring(e, t, i, n, s, a) {
    const o = "";
    return s.find((c) => c.name === Jg) && this.setDeclaration(
      t,
      "__active_attribute_handler__",
      em,
      tm
    ), o;
  }
}
function im(r) {
  const e = r.canvas.height, t = r.canvas.width, i = {
    bottom: -e / 2,
    far: 1e7,
    left: -t / 2,
    near: -100,
    right: t / 2,
    top: e / 2
  }, n = new Hr({
    type: jr.ORTHOGRAPHIC,
    left: i.left,
    right: i.right,
    top: i.top,
    bottom: i.bottom,
    near: i.near,
    far: i.far
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
class nm {
  /**
   * The data provided is the array that holds all of the information that
   * should be pushed to the GPU. The size defines how large the vertex
   * attribute is defined in the shader.
   */
  constructor(e, t = !1, i = !1) {
    this._isInstanced = !1, this._fullUpdate = !1, this.normalize = !1, this._needsUpdate = !1, this._updateRange = {
      /** Number of vertices to update */
      count: -1,
      /** Offset to the first vertex to begin updating */
      offset: -1
    }, this.data = e, this._isDynamic = t, this._isInstanced = i;
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
    let i;
    if (t > 65535 ? i = new Uint32Array(e) : t > 256 ? i = new Uint16Array(e) : i = new Uint8Array(e), i.constructor === this.data.constructor)
      i.length >= this.data.length ? i.set(this.data) : i.set(this.data.subarray(0, i.length));
    else
      for (let n = 0, s = Math.min(e, this.data.length); n < s; n++)
        i[n] = this.data[n];
    this.destroy(), this.data = i, this._needsUpdate = !0, this._fullUpdate = !0;
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
  repeatInstances(e, t, i, n = 1) {
    if (n < 1)
      throw new Error(
        "Can not use repeatInstance on indexBuffer with a startInstance of less than 1"
      );
    const s = t * e;
    if (s > 4294967296)
      throw new Error("Vertex count too high for index buffer");
    const a = this.data.constructor === Uint32Array ? 4294967296 : this.data.constructor === Uint16Array ? 65536 : 256;
    s > a && this.resize(this.data.length, s);
    for (let o = n, c = i * (n - 1), l = t * n, u = this.data.length; o < e && c < u; ++o, l += t)
      for (let h = 0; h < i && c < u; ++h, ++c)
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
function sm(r) {
  return tl(r[0]);
}
function am(r, e, t, i, n) {
  const s = [];
  for (let d = 0, p = t.length; d < p; ++d) {
    const g = t[d];
    s.push(new Float32Array(g.size * i));
  }
  const a = t.length;
  let o, c, l, u = !1;
  for (let d = 0, p = i; d < p; ++d)
    for (let g = 0; g < a; ++g)
      if (c = t[g], o = s[g], l = c.update(d), sm(l))
        for (let m = d * c.size, T = m + c.size, x = 0; m < T; ++m, ++x)
          o[m] = l[x];
      else
        u = !0;
  u && console.warn(
    "A vertex buffer updating method should not use arrays of arrays of numbers."
  );
  const h = new $r();
  for (let d = 0, p = t.length; d < p; ++d) {
    const g = t[d], m = new cr(s[d], g.size);
    g.materialAttribute = m, h.addAttribute(g.name, m);
  }
  if (n) {
    const d = n.indexCount, p = n.update, g = n.size;
    let m;
    if (i > 4294967296)
      throw new Error(
        "The maximum number of indices supported by webgl2 is 4294967296. You may have a vertex count or index count that is too large."
      );
    switch (g) {
      case Vn.UINT8:
        i > 65536 ? m = new Uint32Array(d) : i > 256 ? m = new Uint16Array(d) : m = new Uint8Array(d);
        break;
      case Vn.UINT16:
        i > 65536 ? m = new Uint32Array(d) : m = new Uint16Array(d);
        break;
      case Vn.UINT32:
        m = new Uint32Array(d);
        break;
    }
    for (let x = 0, b = d; x < b; ++x)
      m[x] = p(x);
    const T = new nm(m, !1, !1);
    n.materialIndexBuffer = T, h.setIndexBuffer(T);
  }
  return h;
}
const om = {
  [_.ONE]: _e.FLOAT,
  [_.TWO]: _e.VEC2,
  [_.THREE]: _e.VEC3,
  [_.FOUR]: _e.VEC4,
  [_.MATRIX3]: _e.MATRIX3x3,
  [_.MATRIX4]: _e.MATRIX4x4,
  [_.FLOAT_ARRAY]: _e.FLOAT_ARRAY,
  [_.TEXTURE]: _e.TEXTURE
}, cm = {
  [_.ONE]: [0],
  [_.TWO]: [0, 0],
  [_.THREE]: [0, 0, 0],
  [_.FOUR]: [0, 0, 0, 0],
  [_.MATRIX3]: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [_.MATRIX4]: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
};
function lm(r) {
  return {
    type: om[r.size],
    data: cm[r.size]
  };
}
function um(r, e, t, i, n) {
  const s = r.getMaterialOptions(), a = /* @__PURE__ */ new Map();
  t.forEach((c, l) => {
    a.set(l.renderTarget || null, c);
  }), Object.assign(s, r.props.materialOptions || {}), s.vertexShader = e, s.fragmentShader = a, s.name = r.id, s.uniforms = {};
  for (let c = 0, l = i.length; c < l; ++c) {
    const u = i[c], h = lm(u);
    s.uniforms[u.name] = h;
  }
  for (let c = 0, l = n.length; c < l; ++c) {
    const u = n[c];
    s.uniforms[u.name] = {
      type: u.type,
      data: u.value
    };
  }
  return new Ts(s);
}
function bn(r, e, t, i) {
  const n = new iu(r, e, t);
  return n.drawMode = i ?? f.Model.DrawMode.TRIANGLE_STRIP, n;
}
function QT(r) {
  return r && r.buffer && r.buffer.value;
}
function Hu(r) {
  return r && r.propertyToBufferLocation;
}
class vn {
  /**
   * Base constructor. A manager always needs to be associated with it's layer
   * and it's scene.
   */
  constructor(e, t) {
    this.add = () => {
    }, this.remove = (i) => i, this.layer = e, this.scene = t;
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
    return um(
      this.layer,
      e.vs,
      e.fs,
      e.uniforms,
      e.materialUniforms
    );
  }
}
let $i = {};
function Ce(r, e) {
  const t = $i[r] || [e, -1, 0];
  $i[r] = t, t[2]++, clearTimeout(t[1]), t[1] = window.setTimeout(() => {
    e(t[2], r), delete $i[r];
  }, 1);
}
function Ns() {
  for (const r in $i) {
    const e = $i[r];
    clearTimeout(e[1]), e[0](e[2], r);
  }
  $i = {};
}
const Ii = Ee("performance"), { max: hm } = Math;
function YT(r) {
  return !!(r && r.buffer && r.buffer.data);
}
function dm(r) {
  return Hu(r);
}
class fm extends vn {
  constructor(e, t) {
    super(e, t), this._uid = P(), this.availableLocations = [], this.currentInstancedCount = 0, this.instanceToBufferLocation = {}, this.maxInstancedCount = 0, this.attributeToPropertyIds = /* @__PURE__ */ new Map(), this.updateAllPropertyIdList = [], this.activePropertyId = -1, this.currentAvailableLocation = -1, this.remove = (i) => {
      const n = this.instanceToBufferLocation[i.uid];
      return n && (delete this.instanceToBufferLocation[i.uid], this.availableLocations.push(n)), i;
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
    Ne.setObservableMonitor(!0), this.layer.shaderIOInfo.instanceAttributes.forEach((i) => {
      if (i.parentAttribute) return;
      i.update(e);
      const n = Ne.getObservableMonitorIds(!0);
      this.attributeToPropertyIds.set(i, [
        n[n.length - 1]
      ]), n.length > 1 && Ii(
        "Property has multiple observables. Only the last trigger will be retained as the feature is not complete yet"
      ), i === this.layer.shaderIOInfo.activeAttribute && (this.activePropertyId = n[0]);
    }), Ne.setObservableMonitor(!1), this.makeUpdateAllPropertyIdList();
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
    var i;
    if (this.availableLocations.length <= 0 || this.currentAvailableLocation >= this.availableLocations.length - 1) {
      const n = this.resizeBuffer();
      this.gatherLocationsIntoGroups(
        n.newLocations,
        n.growth
      );
    }
    const t = this.availableLocations[++this.currentAvailableLocation];
    return t && this.geometry ? (this.instanceToBufferLocation[e.uid] = t, this.currentInstancedCount = this.geometry.maxInstancedCount = hm(
      this.currentInstancedCount,
      // Instance index + 1 because the indices are zero indexed and the
      // maxInstancedCount is a count value
      t.instanceIndex + 1
    ), this.model && (this.model.vertexDrawRange = [
      0,
      ((i = this.layer.shaderIOInfo.indexBuffer) == null ? void 0 : i.indexCount) || this.layer.shaderIOInfo.instanceVertexCount
    ], this.model.drawInstances = this.currentInstancedCount, this.layer.shaderIOInfo.instanceVertexCount === 0 && (this.model.vertexDrawRange[1] = this.model.drawInstances))) : console.error(
      "Add Error: Instance Attribute Buffer Manager failed to pair an instance with a buffer location"
    ), Ns(), t;
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
    var s, a, o, c;
    Ii("Gathering resize growth amount...");
    const e = this.layer.shaderIOInfo;
    let t = 0;
    const i = /* @__PURE__ */ new Map(), n = this.maxInstancedCount;
    if (this.changeListContext) {
      t = this.layer.shaderIOInfo.baseBufferGrowthRate;
      for (let l = 0, u = this.changeListContext.length; l < u; ++l) {
        const h = this.changeListContext[l];
        switch (h[1]) {
          case be.CHANGE:
          case be.INSERT:
            this.instanceToBufferLocation[h[0].uid] || t++;
            break;
        }
      }
    }
    if (Ii("BEGIN: Resizing unpacked attribute buffer by %d instances", t), this.geometry) {
      this.geometry.rebuild(), this.maxInstancedCount += t, this.attributes = this.attributes || [];
      for (const l of this.attributes)
        l.bufferAttribute.count < this.maxInstancedCount && ((c = (o = this.layer.props.bufferManagement) == null ? void 0 : o.optimize) != null && c.bufferDoubling ? l.bufferAttribute.resize(
          this.maxInstancedCount * 2,
          n
        ) : l.bufferAttribute.resize(
          this.maxInstancedCount,
          n
        ));
    } else {
      t = Math.max(
        t,
        ((a = (s = this.layer.props.bufferManagement) == null ? void 0 : s.optimize) == null ? void 0 : a.expectedInstanceCount) ?? 0
      ), this.maxInstancedCount += t, this.geometry = new $r();
      for (const l of e.vertexAttributes)
        l.materialAttribute && this.geometry.addAttribute(
          l.name,
          l.materialAttribute
        );
      e.indexBuffer && e.indexBuffer.materialIndexBuffer && this.geometry.setIndexBuffer(
        e.indexBuffer.materialIndexBuffer
      ), this.attributes = [];
      for (const l of e.instanceAttributes) {
        const u = l.size || 0, h = new cr(
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
      const h = this.attributes[l], d = h.bufferAttribute, p = h.size || 0, g = this.maxInstancedCount - n;
      let m = i.get(
        h.name
      );
      m || (m = new Array(g), i.set(h.name, m));
      let T = 0;
      for (let x = n, b = this.maxInstancedCount; x < b; ++x, ++T)
        m[T] = {
          attribute: h,
          // We set this to the attribute, that way when the attribute creates a
          // new buffer object, the new reference will automatically be used
          // which prevents us from having to manually update the reference
          // across all generated locations.
          buffer: d,
          instanceIndex: x,
          start: x * p,
          end: x * p + p
        };
    }
    if (this.scene && this.model && this.scene.container && this.scene.container.remove(this.model), !this.material) {
      this.material = this.makeLayerMaterial();
      for (let l = 0, u = e.uniforms.length; l < u; ++l) {
        const h = e.uniforms[l];
        h.materialUniforms.push(this.material.uniforms[h.name]);
      }
    }
    return this.model = bn(
      this.layer.id,
      this.geometry,
      this.material,
      e.drawMode
    ), this.scene && this.scene.container && this.model && this.scene.container.add(this.model), Ii("COMPLETE: Resizing unpacked attribute buffer"), {
      growth: t,
      newLocations: i
    };
  }
  /**
   * This takes newly created buffer locations and groups them by the property
   * ids identified by the registration phase.
   */
  gatherLocationsIntoGroups(e, t) {
    if (this.attributeToPropertyIds.size === 0) return;
    Ii("BEGIN: Unpacked attribute manager grouping new buffer locations");
    const i = [];
    this.attributeToPropertyIds.forEach((u, h) => {
      i.push({
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
    let n, s, a, o, c, l;
    for (let u = 0; u < t; ++u) {
      const h = {
        instanceIndex: -1,
        propertyToBufferLocation: {}
      };
      for (let d = 0, p = i.length; d < p; ++d) {
        if (n = i[d], s = n.attribute, a = n.ids, o = n.bufferLocationsForAttribute, !o) {
          Ce(
            "Instance Attribute Buffer Error",
            (g, m) => {
              console.warn(
                `${m}: There is an error in forming buffer location groups in InstanceAttributeBufferManager. Error count: ${g}`
              );
            }
          );
          continue;
        }
        if (c = o[++n.bufferIndex], !c) {
          Ce(
            "Instance Attribute Buffer Error",
            (g, m) => {
              console.warn(
                `${m}: There is an error in forming buffer location groups in InstanceAttributeBufferManager. Error count: ${g}`
              );
            }
          );
          continue;
        }
        if (h.instanceIndex === -1)
          h.instanceIndex = c.instanceIndex;
        else if (c.instanceIndex !== h.instanceIndex) {
          Ce(
            "Instance Attribute Parallelism Error",
            (g, m) => {
              console.warn(
                `${m}: A buffer location does not have a matching instance index which means the buffer locations are not in parallel with each other somehow. Error count: ${g}`
              ), console.warn(s.name, c);
            }
          );
          continue;
        }
        if (s.childAttributes) {
          c.childLocations = [];
          for (let g = 0, m = s.childAttributes.length; g < m; ++g) {
            const T = n.childBufferLocations[g];
            if (T) {
              const x = T.location[++T.bufferIndex];
              x ? c.childLocations.push(x) : (l = s.childAttributes[g], Ce(
                "Instance Attribute Child Attribute Error",
                (b, v) => {
                  console.warn(
                    `${v}: A child attribute does not have a buffer location available. Error count: ${b}`
                  ), console.warn(
                    `Parent Attribute: ${s.name} Child Attribute: ${l.name}`
                  );
                }
              ));
            }
          }
        }
        for (let g = 0, m = a.length; g < m; ++g)
          h.propertyToBufferLocation[a[g]] = c;
      }
      this.availableLocations.push(h);
    }
    Ii(
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
const { max: pm } = Math, Si = Ee("performance");
class gm extends vn {
  constructor(e, t) {
    super(e, t), this.allBufferLocations = {}, this.availableLocations = [], this.currentInstancedCount = 0, this.instanceToBufferLocation = {}, this.maxInstancedCount = 1e3, this.blockSubAttributesLookup = /* @__PURE__ */ new Map(), this.attributeToPropertyIds = /* @__PURE__ */ new Map(), this.updateAllPropertyIdList = [], this.activePropertyId = -1, this.currentAvailableLocation = -1, this.remove = (i) => {
      const n = this.instanceToBufferLocation[i.uid];
      return n && (delete this.instanceToBufferLocation[i.uid], this.availableLocations.push(n)), i;
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
    this.layer.shaderIOInfo.instanceAttributes.forEach((i) => {
      if (i.parentAttribute) return;
      Ne.setObservableMonitor(!0), i.update(e);
      const n = Ne.getObservableMonitorIds(!0);
      this.attributeToPropertyIds.set(i, [
        n[n.length - 1]
      ]), n.length > 1 && Si(
        "Property has multiple observables. Only the last trigger will be retained as the feature is not complete yet"
      ), i === this.layer.shaderIOInfo.activeAttribute && (this.activePropertyId = n[0]);
    }), Ne.setObservableMonitor(!1), this.makeUpdateAllPropertyIdList();
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
    var i;
    if (this.availableLocations.length <= 0 || this.currentAvailableLocation >= this.availableLocations.length - 1) {
      const n = this.resizeBuffer();
      this.gatherLocationsIntoGroups(
        n.newLocations,
        n.growth
      );
    }
    const t = this.availableLocations[++this.currentAvailableLocation];
    return t && this.geometry ? (this.instanceToBufferLocation[e.uid] = t, this.currentInstancedCount = this.geometry.maxInstancedCount = pm(
      this.currentInstancedCount,
      // Instance index + 1 because the indices are zero indexed and the maxInstancedCount is a count value
      t.instanceIndex + 1
    ), this.model && (this.model.vertexDrawRange = [
      0,
      ((i = this.layer.shaderIOInfo.indexBuffer) == null ? void 0 : i.indexCount) || this.layer.shaderIOInfo.instanceVertexCount
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
    var s, a, o, c;
    const e = this.layer.shaderIOInfo;
    let t = 0;
    const i = /* @__PURE__ */ new Map(), n = this.maxInstancedCount;
    if (this.changeListContext) {
      t = this.layer.shaderIOInfo.baseBufferGrowthRate;
      for (let l = 0, u = this.changeListContext.length; l < u; ++l) {
        const h = this.changeListContext[l];
        switch (h[1]) {
          case be.CHANGE:
          case be.INSERT:
            this.instanceToBufferLocation[h[0].uid] || t++;
            break;
        }
      }
    }
    if (Si("BEGIN: Resizing packed attribute buffer by %d instances", t), this.geometry) {
      Si(
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
        h.bufferAttribute.count < this.maxInstancedCount && ((c = (o = this.layer.props.bufferManagement) == null ? void 0 : o.optimize) != null && c.bufferDoubling ? h.bufferAttribute.resize(
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
          const p = this.blockSubAttributesLookup.get(l), g = h.size || 0;
          if (p)
            for (let m = 0, T = p.length; m < T; ++m) {
              const x = p[m];
              let b = i.get(
                x.name
              );
              b || (b = [], i.set(
                x.name,
                b
              ));
              const v = this.allBufferLocations[x.name] || [];
              this.allBufferLocations[x.name] = v;
              const E = Object.assign({}, x, {
                uid: P(),
                packUID: h.packUID,
                bufferAttribute: d
              }), y = x.blockIndex || 0, C = x.size || 1;
              let I;
              for (let F = 0, U = v.length; F < U; ++F)
                I = v[F], I.attribute = E;
              let R, $ = b.length;
              const z = this.maxInstancedCount - n;
              b.length += z, v.length += z;
              for (let F = n; F < this.maxInstancedCount; ++F, ++$)
                R = {
                  attribute: E,
                  block: l,
                  buffer: d,
                  instanceIndex: F,
                  start: F * g + y,
                  end: F * g + y + C
                }, b[$] = R, v[F] = R;
            }
        }
      }
    } else {
      t = Math.max(
        t,
        ((a = (s = this.layer.props.bufferManagement) == null ? void 0 : s.optimize) == null ? void 0 : a.expectedInstanceCount) ?? 0
      ), this.maxInstancedCount += t, this.geometry = new $r();
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
        const p = e.instanceAttributes[h], g = p.block || 0;
        let m = l.get(g) || 0;
        m = Math.max(
          m,
          (p.blockIndex || 0) + (p.size || 0)
        ), l.set(g, m);
        let T = u.get(g);
        T || (T = [], u.set(g, T)), T.push(p);
      }
      u.forEach(
        (h) => h.sort((d, p) => (d.blockIndex || 0) - (p.blockIndex || 0))
      );
      for (let h = 0, d = l.size; h < d; ++h) {
        const p = l.get(h) || 0, g = P();
        p || console.warn(
          "Instance Attribute Packing Error: The system tried to build an attribute with a size of zero.",
          "These are the attributes used:",
          e.instanceAttributes,
          "These are the block sizes calculated",
          l,
          "This is the block to attribute lookup generated",
          u
        );
        const m = new Float32Array(p * this.maxInstancedCount), T = new cr(m, p, !0, !0);
        this.geometry.addAttribute(`block${h}`, T);
        const x = u.get(h);
        if (x) {
          for (let b = 0, v = x.length; b < v; ++b) {
            const E = x[b];
            let y = i.get(
              E.name
            );
            y || (y = [], i.set(
              E.name,
              y
            ));
            const C = this.allBufferLocations[E.name] || [];
            this.allBufferLocations[E.name] = C;
            const I = Object.assign({}, E, {
              uid: h,
              packUID: g,
              bufferAttribute: T,
              size: p
            }), R = E.blockIndex || 0, $ = E.size || 1;
            for (let z = 0; z < this.maxInstancedCount; ++z) {
              const F = {
                attribute: I,
                block: h,
                buffer: T,
                instanceIndex: z,
                start: z * p + R,
                end: z * p + R + $
              };
              y.push(F), C.push(F);
            }
            this.attributes.push(I);
          }
          this.blockAttributes.push({
            uid: P(),
            packUID: g,
            bufferAttribute: T,
            name: `block${h}`,
            size: p,
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
        const p = e.uniforms[h];
        p.materialUniforms.push(this.material.uniforms[p.name]);
      }
    }
    return this.scene && this.model && this.scene.container && this.scene.container.remove(this.model), this.material = this.material || this.makeLayerMaterial(), this.model = bn(
      this.layer.id,
      this.geometry,
      this.material,
      this.layer.shaderIOInfo.drawMode
    ), this.scene && this.scene.container && this.model && this.scene.container.add(this.model), Si("COMPLETE: Resizing unpacked attribute buffer"), {
      growth: t,
      newLocations: i
    };
  }
  /**
   * This takes newly created buffer locations and groups them by the property ids identified by the
   * registration phase.
   */
  gatherLocationsIntoGroups(e, t) {
    if (this.attributeToPropertyIds.size === 0) return;
    Si("BEGIN: Packed attribute manager grouping new buffer locations");
    const i = [];
    this.attributeToPropertyIds.forEach((n, s) => {
      i.push({
        attribute: s,
        bufferLocationsForAttribute: e.get(s.name) || [],
        childBufferLocations: (s.childAttributes || []).map((a) => ({
          location: e.get(a.name) || [],
          bufferIndex: -1
        })),
        ids: n,
        bufferIndex: -1
      });
    });
    for (let n = 0; n < t; ++n) {
      const s = {
        instanceIndex: -1,
        propertyToBufferLocation: {}
      };
      for (let a = 0, o = i.length; a < o; ++a) {
        const c = i[a], l = c.attribute, u = c.ids, h = c.bufferLocationsForAttribute;
        if (!h) {
          Ce(
            "Instance Attribute Buffer Error",
            (p, g) => {
              console.warn(
                `${g}: There is an error in forming buffer location groups in InstanceAttributePackingBufferManager. Error count: ${p}`
              );
            }
          );
          continue;
        }
        const d = h[++c.bufferIndex];
        if (!d) {
          Ce(
            "Instance Attribute Buffer Error",
            (p, g) => {
              console.warn(
                `${g}: There is an error in forming buffer location groups in InstanceAttributePackingBufferManager. Error count: ${p}`
              );
            }
          );
          continue;
        }
        if (s.instanceIndex === -1)
          s.instanceIndex = d.instanceIndex;
        else if (d.instanceIndex !== s.instanceIndex) {
          Ce(
            "Instance Attribute Parallelism Error",
            (p, g) => {
              console.warn(
                `${g}: A buffer location does not have a matching instance index which means the buffer locations are not in parallel with each other somehow. Error count: ${p}`
              ), console.warn(l.name, d);
            }
          );
          continue;
        }
        if (l.childAttributes) {
          const p = [];
          for (let g = 0, m = l.childAttributes.length; g < m; ++g) {
            const T = l.childAttributes[g], x = c.childBufferLocations[g];
            if (x) {
              const b = x.location[++x.bufferIndex];
              b ? p.push(b) : Ce(
                "Instance Attribute Child Attribute Error",
                (v, E) => {
                  console.warn(
                    `${E}: A child attribute does not have a buffer location available. Error count: ${v}`
                  ), console.warn(
                    `Parent Attribute: ${l.name} Child Attribute: ${T.name}`
                  );
                }
              );
            }
          }
          d.childLocations = p;
        }
        for (let p = 0, g = u.length; p < g; ++p) {
          const m = u[p];
          s.propertyToBufferLocation[m] = d;
        }
      }
      this.availableLocations.push(s);
    }
    Si("COMPLETE: Packed attribute buffer manager buffer location grouping"), Ns();
  }
  /**
   * Returns the total instances this buffer manages.
   */
  getInstanceCount() {
    return this.maxInstancedCount;
  }
}
function mm(r) {
  return r && r.buffer && r.buffer.value && r.type === _e.VEC4_ARRAY;
}
class xm extends vn {
  constructor(e, t) {
    super(e, t), this.buffers = [], this.availableClusters = [], this.instanceToCluster = {}, this.clusterToBuffer = /* @__PURE__ */ new Map(), this.add = (n) => {
      this.availableClusters.length <= 0 && this.makeNewBuffer();
      const s = this.availableClusters.pop();
      return s ? this.instanceToCluster[n.uid] = s : console.warn(
        "No valid cluster available for instance added to uniform manager."
      ), s;
    }, this.remove = (n) => {
      const s = this.instanceToCluster[n.uid];
      return s && (delete this.instanceToCluster[n.uid], this.availableClusters.push(s)), n;
    };
    let i = 0;
    e.shaderIOInfo.instanceAttributes.forEach(
      (n) => {
        i = Math.max(n.block || 0, i);
      }
    ), this.uniformBlocksPerInstance = i + 1;
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
      for (let t = 0, i = this.buffers.length; t < i; ++t) {
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
      for (let t = 0, i = this.buffers.length; t < i; ++t) {
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
    const e = this.layer.shaderIOInfo, t = new $r();
    e.vertexAttributes.forEach((u) => {
      u.materialAttribute && t.addAttribute(u.name, u.materialAttribute);
    });
    const i = this.makeLayerMaterial(), n = bn(
      this.layer.id,
      t,
      i,
      e.drawMode
    );
    n.vertexDrawRange = [
      0,
      e.maxInstancesPerBuffer * e.instanceVertexCount
    ];
    const s = {
      activeInstances: [],
      clusters: [],
      firstInstance: 0,
      geometry: t,
      lastInstance: 0,
      material: i,
      model: n
    };
    this.buffers.push(s);
    let a = 0;
    const o = Zg, c = i.uniforms[o];
    if (sd(c))
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
        bufferAttribute: new cr(new Float32Array(1), 1),
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
        start: a,
        end: 0
      };
      a += this.uniformBlocksPerInstance, d.end = a, s.clusters.push(d), this.availableClusters.push(d), this.clusterToBuffer.set(d, s);
    }
    for (let u = 0, h = e.uniforms.length; u < h; ++u) {
      const d = e.uniforms[u];
      d.materialUniforms.push(i.uniforms[d.name]);
    }
    this.scene && this.scene.container && this.scene.container.add(s.model);
  }
}
class ho {
  constructor(e, t) {
    this.layer = e, this.bufferManager = t;
  }
}
const Pn = [], { min: zs, max: Vs } = Math;
class Tm extends ho {
  constructor() {
    super(...arguments), this.diffMode = 0, this.bufferAttributeUpdateRange = {}, this.bufferAttributeWillUpdate = {}, this.updateInstance = this.updateInstancePartial;
  }
  /**
   * This processes add operations from changes in the instancing data
   */
  addInstance(e, t, i, n) {
    if (n)
      e.changeInstance(e, t, Pn, n);
    else {
      const s = e.layer.bufferManager.add(t);
      dm(s) && (t.active = !0, e.layer.onDiffAdd && e.layer.onDiffAdd(t), e.updateInstance(
        e.layer,
        t,
        Pn,
        s
      ));
    }
  }
  /**
   * This processes change operations from changes in the instancing data
   */
  changeInstance(e, t, i, n) {
    n ? e.updateInstance(e.layer, t, i, n) : e.addInstance(e, t, Pn, n);
  }
  /**
   * This processes remove operations from changes in the instancing data
   */
  removeInstance(e, t, i, n) {
    n && (t.active = !1, e.layer.onDiffRemove && e.layer.onDiffRemove(t), e.updateInstance(e.layer, t, Pn, n), e.layer.bufferManager.remove(t));
  }
  /**
   * This performs the actual updating of buffers the instance needs to update
   */
  updateInstancePartial(e, t, i, n) {
    const s = n.propertyToBufferLocation, a = this.bufferAttributeUpdateRange;
    let o, c, l, u, h, d, p, g, m, T, x, b, v;
    if (t.active) {
      for ((i.length === 0 || t.reactivate) && (i = this.bufferManager.getUpdateAllPropertyIdList()), p = 0, x = i.length; p < x; ++p)
        if (o = s[i[p]], !!o) {
          for (h = o.attribute, d = h.packUID || h.uid, c = h.update(t), m = o.start, b = o.end, g = 0; m < b; ++m, ++g)
            o.buffer.data[m] = c[g];
          if (l = a[d] || [
            null,
            Number.MAX_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER
          ], l[0] = h, l[1] = zs(o.start, l[1]), l[2] = Vs(o.end, l[2]), a[d] = l, o.childLocations) {
            for (u = o.childLocations, m = 0, b = u.length; m < b; ++m)
              if (o = u[m], !!o) {
                for (d = o.attribute.packUID || o.attribute.uid, c = o.attribute.update(t), T = o.start, v = o.end, g = 0; T < v; ++T, ++g)
                  o.buffer.data[T] = c[g];
                l = a[d] || [
                  null,
                  Number.MAX_SAFE_INTEGER,
                  Number.MIN_SAFE_INTEGER
                ], l[0] = o.attribute, l[1] = zs(o.start, l[1]), l[2] = Vs(o.end, l[2]), a[d] = l;
              }
          }
        }
    } else {
      for (o = s[this.bufferManager.getActiveAttributePropertyId()], h = o.attribute, d = h.packUID || h.uid, c = h.update(t), T = o.start, v = o.end, g = 0; T < v; ++T, ++g)
        o.buffer.data[T] = c[g];
      l = a[d] || [
        null,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER
      ], l[0] = h, l[1] = zs(o.start, l[1]), l[2] = Vs(o.end, l[2]), a[d] = l;
    }
    t.reactivate = !1;
  }
  /**
   * This performs an update on the buffers with the intent the entire buffer is
   * going to update rather than a chunk of it.
   */
  updateInstanceFull(e, t, i, n) {
    const s = n.propertyToBufferLocation, a = this.bufferAttributeWillUpdate;
    let o, c, l, u, h, d, p, g, m, T, x;
    if (t.active) {
      for ((i.length === 0 || t.reactivate) && (i = this.bufferManager.getUpdateAllPropertyIdList()), h = 0, x = i.length; h < x; ++h)
        if (o = s[i[h]], !!o) {
          for (u = o.attribute, c = u.update(t), p = o.start, m = o.end, d = 0; p < m; ++p, ++d)
            o.buffer.data[p] = c[d];
          if (a[u.packUID || u.uid] = u, o.childLocations) {
            for (l = o.childLocations, p = 0, m = l.length; p < m; ++p)
              if (o = l[p], !!o) {
                for (u = o.attribute, c = u.update(t), g = o.start, T = o.end, d = 0; g < T; ++g, ++d)
                  o.buffer.data[g] = c[d];
                a[u.packUID || u.uid] = u;
              }
          }
        }
    } else {
      for (o = s[this.bufferManager.getActiveAttributePropertyId()], u = o.attribute, c = u.update(t), g = o.start, T = o.end, d = 0; g < T; ++g, ++d)
        o.buffer.data[g] = c[d];
      a[u.packUID || u.uid] = u;
    }
    t.reactivate = !1;
  }
  /**
   * Finalize all of the buffer changes and apply the correct update ranges
   */
  commit() {
    if (this.diffMode === 0) {
      const e = Object.values(this.bufferAttributeUpdateRange);
      for (let t = 0, i = e.length; t < i; ++t) {
        const n = e[t], s = n[0].bufferAttribute;
        s.updateRange = {
          count: n[2] - n[1],
          offset: n[1]
        };
      }
    } else {
      const e = Object.values(this.bufferAttributeWillUpdate);
      for (let t = 0, i = e.length; t < i; ++t) {
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
const _c = [];
class bm extends ho {
  /**
   * This processes add operations from changes in the instancing data
   */
  addInstance(e, t, i, n) {
    if (n)
      e.changeInstance(e, t, _c, n);
    else {
      const s = e.layer.bufferManager.add(t);
      mm(s) && (t.active = !0, e.layer.onDiffAdd && e.layer.onDiffAdd(t), e.updateInstance(e.layer, t, s));
    }
  }
  /**
   * This processes change operations from changes in the instancing data
   */
  changeInstance(e, t, i, n) {
    n ? e.updateInstance(e.layer, t, n) : e.addInstance(e, t, _c, n);
  }
  /**
   * This processes remove operations from changes in the instancing data
   */
  removeInstance(e, t, i, n) {
    n && (t.active = !1, e.layer.onDiffRemove && e.layer.onDiffRemove(t), e.updateInstance(e.layer, t, n), e.layer.bufferManager.remove(t));
  }
  /**
   * TODO: We should be updating based on prop ids instead of always updating all props for every change.
   *
   * This performs the actual updating of buffers the instance needs to update
   */
  updateInstance(e, t, i) {
    if (t.active) {
      const n = i.buffer, s = i.start, a = n.data;
      let o, c, l, u, h, d;
      for (let p = 0, g = e.shaderIOInfo.instanceAttributes.length; p < g; ++p)
        if (o = e.shaderIOInfo.instanceAttributes[p], c = o.update(t), l = a[s + (o.block || 0)], u = o.blockIndex, u !== void 0)
          for (h = u, d = c.length + u; h < d; ++h)
            l[h] = c[h - u];
      n.data = a;
    } else {
      const n = i.buffer, s = i.start, a = n.data, o = e.shaderIOInfo.activeAttribute, c = o.update(t), l = a[s + (o.block || 0)], u = o.blockIndex;
      if (u !== void 0)
        for (let h = u, d = c.length + u; h < d; ++h)
          l[h] = c[h - u];
      n.data = a;
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
const Ci = Ee("performance"), { max: vm } = Math;
function wm(r) {
  return Hu(r);
}
class Em extends vn {
  constructor(e, t) {
    super(e, t), this.allBufferLocations = {}, this.availableLocations = [], this.currentInstancedCount = 0, this.instanceToBufferLocation = {}, this.maxInstancedCount = 0, this.attributeToPropertyIds = /* @__PURE__ */ new Map(), this.updateAllPropertyIdList = [], this.activePropertyId = -1, this.currentAvailableLocation = -1, this.remove = (i) => {
      const n = this.instanceToBufferLocation[i.uid];
      return n && (delete this.instanceToBufferLocation[i.uid], this.availableLocations.push(n)), i;
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
    Ne.setObservableMonitor(!0), this.layer.shaderIOInfo.instanceAttributes.forEach((i) => {
      if (i.parentAttribute) return;
      i.update(e);
      const n = Ne.getObservableMonitorIds(!0);
      this.attributeToPropertyIds.set(i, [
        n[n.length - 1]
      ]), n.length > 1 && Ci(
        "Property has multiple observables. Only the last trigger will be retained as the feature is not complete yet"
      ), i === this.layer.shaderIOInfo.activeAttribute && (this.activePropertyId = n[0]);
    }), Ne.setObservableMonitor(!1), this.makeUpdateAllPropertyIdList();
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
      const i = this.resizeBuffer();
      this.gatherLocationsIntoGroups(
        i.newLocations,
        i.growth
      );
    }
    const t = this.availableLocations[++this.currentAvailableLocation];
    return t && this.geometry ? (this.instanceToBufferLocation[e.uid] = t, this.currentInstancedCount = this.geometry.maxInstancedCount = vm(
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
    var s, a;
    Ci("Gathering resize growth amount...");
    const e = this.layer.shaderIOInfo.instanceVertexCount, t = this.layer.shaderIOInfo;
    let i = 0;
    const n = /* @__PURE__ */ new Map();
    if (this.changeListContext) {
      i = this.layer.shaderIOInfo.baseBufferGrowthRate;
      for (let o = 0, c = this.changeListContext.length; o < c; ++o) {
        const l = this.changeListContext[o];
        switch (l[1]) {
          case be.CHANGE:
          case be.INSERT:
            this.instanceToBufferLocation[l[0].uid] || i++;
            break;
        }
      }
    }
    if (Ci("BEGIN: Resizing unpacked attribute buffer by %d instances", i), this.geometry) {
      this.geometry.rebuild();
      const o = this.maxInstancedCount;
      this.maxInstancedCount += i;
      for (const c of t.vertexAttributes)
        c.materialAttribute && (c.materialAttribute.resize(
          e * this.maxInstancedCount
        ), c.materialAttribute.repeatInstances(
          this.maxInstancedCount - o,
          e,
          o
        ));
      if (t.indexBuffer && this.geometry.indexBuffer) {
        const c = t.indexBuffer.indexCount;
        this.geometry.indexBuffer.resize(
          c * this.maxInstancedCount,
          e * this.maxInstancedCount
        ), this.geometry.indexBuffer.repeatInstances(
          this.maxInstancedCount - o,
          e,
          c,
          o
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
          for (let T = 0, x = d.length; T < x; ++T)
            d[T].buffer.data = c.bufferAttribute.data;
          h || (h = [], n.set(
            c.name,
            h
          ));
          let p, g = h.length;
          const m = this.maxInstancedCount - o;
          h.length += m, d.length += m;
          for (let T = o, x = this.maxInstancedCount; T < x; ++T, ++g)
            p = {
              attribute: c,
              buffer: {
                data: c.bufferAttribute.data
              },
              instanceIndex: T,
              start: T * u,
              end: T * u + u
            }, h[g] = p, d[T] = p;
        }
      }
      (a = this.scene) != null && a.container && this.model && this.scene.container.remove(this.model);
    } else {
      this.maxInstancedCount += i, this.geometry = new $r();
      for (const o of t.vertexAttributes)
        o.materialAttribute && (o.materialAttribute.resize(
          e * this.maxInstancedCount
        ), o.materialAttribute.repeatInstances(
          this.maxInstancedCount - 1,
          e
        ), o.materialAttribute.setDynamic(!0), this.geometry.addAttribute(
          o.name,
          o.materialAttribute
        ));
      (s = t.indexBuffer) != null && s.materialIndexBuffer && (this.geometry.setIndexBuffer(
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
      for (const o of t.instanceAttributes) {
        const c = o.size || 0, l = new cr(
          new Float32Array(0),
          c,
          !0,
          !1
        );
        l.resize(this.maxInstancedCount * e), this.geometry.addAttribute(o.name, l);
        let u = n.get(
          o.name
        );
        u || (u = [], n.set(o.name, u));
        const h = this.allBufferLocations[o.name] || [];
        this.allBufferLocations[o.name] = h;
        const d = Object.assign({}, o, {
          uid: P(),
          bufferAttribute: l
        });
        for (let p = 0; p < this.maxInstancedCount; ++p) {
          const g = {
            attribute: d,
            buffer: {
              data: l.data
            },
            instanceIndex: p,
            start: p * c,
            end: p * c + c
          };
          u.push(g), h.push(g);
        }
        this.attributes.push(d);
      }
      this.geometry.maxInstancedCount = 0, this.material = this.makeLayerMaterial();
      for (let o = 0, c = t.uniforms.length; o < c; ++o) {
        const l = t.uniforms[o];
        l.materialUniforms.push(this.material.uniforms[l.name]);
      }
    }
    return this.scene && this.model && this.scene.container && this.scene.container.remove(this.model), this.material = this.material || this.makeLayerMaterial(), this.model = bn(
      this.layer.id,
      this.geometry,
      this.material,
      t.drawMode
    ), this.scene && this.scene.container && this.model && this.scene.container.add(this.model), Ci("COMPLETE: Resizing unpacked attribute buffer"), {
      growth: i,
      newLocations: n
    };
  }
  /**
   * This takes newly created buffer locations and groups them by the property
   * ids identified by the registration phase.
   */
  gatherLocationsIntoGroups(e, t) {
    if (this.attributeToPropertyIds.size === 0) return;
    Ci("BEGIN: Unpacked attribute manager grouping new buffer locations");
    const i = [];
    this.attributeToPropertyIds.forEach((u, h) => {
      i.push({
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
    let n, s, a, o, c, l;
    for (let u = 0; u < t; ++u) {
      const h = {
        instanceIndex: -1,
        propertyToBufferLocation: {}
      };
      for (let d = 0, p = i.length; d < p; ++d) {
        if (n = i[d], s = n.attribute, a = n.ids, o = n.bufferLocationsForAttribute, !o) {
          Ce(
            "Instance Attribute Buffer Error",
            (g, m) => {
              console.warn(
                `${m}: There is an error in forming buffer location groups in VertexAttributeBufferManager. Error count: ${g}`
              );
            }
          );
          continue;
        }
        if (c = o[++n.bufferIndex], !c) {
          Ce(
            "Instance Attribute Buffer Error",
            (g, m) => {
              console.warn(
                `${m}: There is an error in forming buffer location groups in VertexAttributeBufferManager. Error count: ${g}`
              );
            }
          );
          continue;
        }
        if (h.instanceIndex === -1)
          h.instanceIndex = c.instanceIndex;
        else if (c.instanceIndex !== h.instanceIndex) {
          Ce(
            "Instance Attribute Parallelism Error",
            (g, m) => {
              console.warn(
                `${m}: A buffer location does not have a matching instance index which means the buffer locations are not in parallel with each other somehow. Error count: ${g}`
              ), console.warn(s.name, c);
            }
          );
          continue;
        }
        if (s.childAttributes) {
          c.childLocations = [];
          for (let g = 0, m = s.childAttributes.length; g < m; ++g) {
            const T = n.childBufferLocations[g];
            if (T) {
              const x = T.location[++T.bufferIndex];
              x ? c.childLocations.push(x) : (l = s.childAttributes[g], Ce(
                "Instance Attribute Child Attribute Error",
                (b, v) => {
                  console.warn(
                    `${v}: A child attribute does not have a buffer location available. Error count: ${b}`
                  ), console.warn(
                    `Parent Attribute: ${s.name} Child Attribute: ${l.name}`
                  );
                }
              ));
            }
          }
        }
        for (let g = 0, m = a.length; g < m; ++g)
          h.propertyToBufferLocation[a[g]] = c;
      }
      this.availableLocations.push(h);
    }
    Ci(
      "COMPLETE: Unpacked attribute buffer manager buffer location grouping"
    ), Ns();
  }
  /**
   * Returns the total instances this buffer manages.
   */
  getInstanceCount() {
    return this.maxInstancedCount;
  }
}
const Dn = [], { min: $s, max: Ws } = Math;
class ym extends ho {
  constructor() {
    super(...arguments), this.diffMode = 0, this.bufferAttributeUpdateRange = {}, this.bufferAttributeWillUpdate = {}, this.updateInstance = this.updateInstancePartial;
  }
  /**
   * This processes add operations from changes in the instancing data
   */
  addInstance(e, t, i, n) {
    if (n)
      e.changeInstance(e, t, Dn, n);
    else {
      const s = e.layer.bufferManager.add(t);
      wm(s) && (t.active = !0, e.layer.onDiffAdd && e.layer.onDiffAdd(t), e.updateInstance(
        e.layer,
        t,
        Dn,
        s
      ));
    }
  }
  /**
   * This processes change operations from changes in the instancing data
   */
  changeInstance(e, t, i, n) {
    n ? e.updateInstance(e.layer, t, i, n) : e.addInstance(e, t, Dn, n);
  }
  /**
   * This processes remove operations from changes in the instancing data
   */
  removeInstance(e, t, i, n) {
    n && (t.active = !1, e.layer.onDiffRemove && e.layer.onDiffRemove(t), e.updateInstance(e.layer, t, Dn, n), e.layer.bufferManager.remove(t));
  }
  /**
   * This performs the actual updating of buffers the instance needs to update
   */
  updateInstancePartial(e, t, i, n) {
    const s = e.shaderIOInfo.instanceVertexCount, a = n.propertyToBufferLocation, o = this.bufferAttributeUpdateRange;
    let c, l, u, h, d, p, g = 0, m, T, x, b, v, E, y;
    if (t.active) {
      for ((i.length === 0 || t.reactivate) && (i = this.bufferManager.getUpdateAllPropertyIdList()), m = 0, E = i.length; m < E; ++m)
        if (c = a[i[m]], !!c) {
          for (d = c.attribute, p = d.packUID || d.uid, l = d.update(t), g = d.size || c.end - c.start, T = c.start * s, y = c.end * s; T < y; )
            for (x = 0; x < g; ++x, ++T)
              c.buffer.data[T] = l[x];
          if (u = o[p] || [
            null,
            Number.MAX_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER
          ], u[0] = d, u[1] = $s(c.start * s, u[1]), u[2] = Ws(c.end * s, u[2]), o[p] = u, c.childLocations) {
            for (h = c.childLocations, b = 0, v = h.length; b < v; ++b)
              if (c = h[b], !!c) {
                for (p = c.attribute.packUID || c.attribute.uid, l = c.attribute.update(t), g = d.size || c.end - c.start, T = c.start * s, y = c.end * s; T < y; )
                  for (x = 0; x < g; ++x, ++T)
                    c.buffer.data[T] = l[x];
                u = o[p] || [
                  null,
                  Number.MAX_SAFE_INTEGER,
                  Number.MIN_SAFE_INTEGER
                ], u[0] = c.attribute, u[1] = $s(c.start * s, u[1]), u[2] = Ws(c.end * s, u[2]), o[p] = u;
              }
          }
        }
    } else {
      for (c = a[this.bufferManager.getActiveAttributePropertyId()], d = c.attribute, p = d.packUID || d.uid, l = d.update(t), g = d.size || c.end - c.start, T = c.start * s, y = c.end * s; T < y; )
        for (x = 0; x < g; ++x, ++T)
          c.buffer.data[T] = l[x];
      u = o[p] || [
        null,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER
      ], u[0] = d, u[1] = $s(c.start * s, u[1]), u[2] = Ws(c.end * s, u[2]), o[p] = u;
    }
    t.reactivate = !1;
  }
  /**
   * This performs an update on the buffers with the intent the entire buffer is
   * going to update rather than a chunk of it.
   */
  updateInstanceFull(e, t, i, n) {
    const s = n.propertyToBufferLocation, a = this.bufferAttributeWillUpdate, o = this.layer.shaderIOInfo.instanceVertexCount;
    let c, l, u, h, d = 0, p, g, m, T, x, b, v;
    if (t.active) {
      for ((i.length === 0 || t.reactivate) && (i = this.bufferManager.getUpdateAllPropertyIdList()), p = 0, b = i.length; p < b; ++p)
        if (c = s[i[p]], !!c) {
          for (h = c.attribute, l = h.update(t), d = h.size || c.end - c.start, m = c.start * o, x = c.end * o; m < x; )
            for (T = 0; T < d; ++T, ++m)
              c.buffer.data[m] = l[T];
          if (a[h.packUID || h.uid] = h, c.childLocations) {
            for (u = c.childLocations, m = 0, x = u.length; m < x; ++m)
              if (c = u[m], !!c) {
                for (h = c.attribute, l = h.update(t), d = h.size || c.end - c.start, g = c.start * o, v = c.end * o; g < v; )
                  for (T = 0; T < d; ++T, ++g)
                    c.buffer.data[g] = l[T];
                a[h.packUID || h.uid] = h;
              }
          }
        }
    } else {
      for (c = s[this.bufferManager.getActiveAttributePropertyId()], h = c.attribute, d = h.size || c.end - c.start, l = h.update(t), g = c.start * o, v = c.end * o; g < v; )
        for (T = 0; T < d; ++T, ++g)
          c.buffer.data[g] = l[T];
      a[h.packUID || h.uid] = h;
    }
    t.reactivate = !1;
  }
  /**
   * Finalize all of the buffer changes and apply the correct update ranges
   */
  commit() {
    if (this.diffMode === 0) {
      const e = Object.values(this.bufferAttributeUpdateRange);
      for (let t = 0, i = e.length; t < i; ++t) {
        const n = e[t], s = n[0].bufferAttribute;
        s.updateRange = {
          count: n[2] - n[1],
          offset: n[1]
        };
      }
    } else {
      const e = Object.values(this.bufferAttributeWillUpdate);
      for (let t = 0, i = e.length; t < i; ++t) {
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
class Rm {
  /**
   * This returns the proper diff processor for handling diffs
   */
  makeProcessor(e, t) {
    if (this.processing) return this.processing;
    if (e.bufferType === ae.INSTANCE_ATTRIBUTE || e.bufferType === ae.INSTANCE_ATTRIBUTE_PACKING ? this.processor = new Tm(e, t) : e.bufferType === ae.VERTEX_ATTRIBUTE || e.bufferType === ae.VERTEX_ATTRIBUTE_PACKING ? this.processor = new ym(e, t) : this.processor = new bm(e, t), !this.processor)
      throw new Error("Failed to create a diff processor");
    return this.processing = [
      this.processor.changeInstance,
      this.processor.addInstance,
      this.processor.removeInstance
    ], this.processing;
  }
}
const { max: _m } = Math, Ni = Ee("performance");
class Am extends vn {
  constructor(e, t) {
    super(e, t), this.allBufferLocations = {}, this.availableLocations = [], this.currentInstancedCount = 0, this.instanceToBufferLocation = {}, this.maxInstancedCount = 1e3, this.blockSubAttributesLookup = /* @__PURE__ */ new Map(), this.attributeToPropertyIds = /* @__PURE__ */ new Map(), this.updateAllPropertyIdList = [], this.activePropertyId = -1, this.currentAvailableLocation = -1, this.remove = (i) => {
      const n = this.instanceToBufferLocation[i.uid];
      return n && (delete this.instanceToBufferLocation[i.uid], this.availableLocations.push(n)), i;
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
    this.layer.shaderIOInfo.instanceAttributes.forEach((i) => {
      if (i.parentAttribute) return;
      Ne.setObservableMonitor(!0), i.update(e);
      const n = Ne.getObservableMonitorIds(!0);
      this.attributeToPropertyIds.set(i, [
        n[n.length - 1]
      ]), n.length > 1 && Ni(
        "Property has multiple observables. Only the last trigger will be retained as the feature is not complete yet"
      ), i === this.layer.shaderIOInfo.activeAttribute && (this.activePropertyId = n[0]);
    }), Ne.setObservableMonitor(!1), this.makeUpdateAllPropertyIdList();
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
      const i = this.resizeBuffer();
      this.gatherLocationsIntoGroups(
        i.newLocations,
        i.growth
      );
    }
    const t = this.availableLocations[++this.currentAvailableLocation];
    return t && this.geometry ? (this.instanceToBufferLocation[e.uid] = t, this.currentInstancedCount = this.geometry.maxInstancedCount = _m(
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
    const i = /* @__PURE__ */ new Map();
    if (this.changeListContext) {
      t = this.layer.shaderIOInfo.baseBufferGrowthRate;
      for (let n = 0, s = this.changeListContext.length; n < s; ++n) {
        const a = this.changeListContext[n];
        switch (a[1]) {
          case be.CHANGE:
          case be.INSERT:
            this.instanceToBufferLocation[a[0].uid] || t++;
            break;
        }
      }
    }
    if (Ni("BEGIN: Resizing packed attribute buffer by %d instances", t), this.geometry) {
      Ni(
        `Info: Vertex packing buffer is being resized for layer ${this.layer.id}`
      ), this.geometry.destroy(), this.geometry = new $r();
      const n = this.maxInstancedCount;
      for (const s of e.vertexAttributes)
        s.materialAttribute && this.geometry.addAttribute(
          s.name,
          s.materialAttribute
        );
      this.maxInstancedCount += t, this.attributes = this.attributes || [], this.blockAttributes = this.blockAttributes || [];
      for (let s = 0, a = this.blockAttributes.length; s < a; ++s) {
        const o = this.blockAttributes[s];
        let c = o.bufferAttribute;
        const l = o.size || 0;
        if (c.data instanceof Float32Array) {
          let u = c.data;
          u.length < this.maxInstancedCount * l && (u = new Float32Array(this.maxInstancedCount * l * 2), u.set(c.data, 0)), u.set(c.data, 0);
          const h = new cr(u, l, !0, !0);
          o.bufferAttribute = c = h, this.geometry.addAttribute(o.name, h);
          const d = this.blockSubAttributesLookup.get(s), p = o.size || 0;
          if (d)
            for (let g = 0, m = d.length; g < m; ++g) {
              const T = d[g];
              let x = i.get(
                T.name
              );
              x || (x = [], i.set(
                T.name,
                x
              ));
              const b = this.allBufferLocations[T.name] || [];
              this.allBufferLocations[T.name] = b;
              const v = Object.assign({}, T, {
                uid: P(),
                packUID: o.packUID,
                bufferAttribute: c
              }), E = T.blockIndex || 0, y = T.size || 1;
              let C;
              for (let z = 0, F = b.length; z < F; ++z)
                C = b[z], C.attribute = v, C.buffer.data = u;
              let I, R = x.length;
              const $ = this.maxInstancedCount - n;
              x.length += $, b.length += $;
              for (let z = n; z < this.maxInstancedCount; ++z, ++R)
                I = {
                  attribute: v,
                  block: s,
                  buffer: {
                    data: u
                  },
                  instanceIndex: z,
                  start: z * p + E,
                  end: z * p + E + y
                }, x[R] = I, b[z] = I;
            }
        }
      }
    } else {
      this.maxInstancedCount += t, this.geometry = new $r();
      for (const a of e.vertexAttributes)
        a.materialAttribute && this.geometry.addAttribute(
          a.name,
          a.materialAttribute
        );
      this.attributes = [], this.blockAttributes = [];
      const n = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map();
      this.blockSubAttributesLookup = s;
      for (let a = 0, o = e.instanceAttributes.length; a < o; ++a) {
        const c = e.instanceAttributes[a], l = c.block || 0;
        let u = n.get(l) || 0;
        u = Math.max(
          u,
          (c.blockIndex || 0) + (c.size || 0)
        ), n.set(l, u);
        let h = s.get(l);
        h || (h = [], s.set(l, h)), h.push(c);
      }
      s.forEach(
        (a) => a.sort((o, c) => (o.blockIndex || 0) - (c.blockIndex || 0))
      );
      for (let a = 0, o = n.size; a < o; ++a) {
        const c = n.get(a) || 0, l = P();
        c || console.warn(
          "Instance Attribute Packing Error: The system tried to build an attribute with a size of zero.",
          "These are the attributes used:",
          e.instanceAttributes,
          "These are the block sizes calculated",
          n,
          "This is the block to attribute lookup generated",
          s
        );
        const u = new Float32Array(c * this.maxInstancedCount), h = new cr(u, c, !0, !0);
        this.geometry.addAttribute(`block${a}`, h);
        const d = s.get(a);
        if (d) {
          for (let p = 0, g = d.length; p < g; ++p) {
            const m = d[p];
            let T = i.get(
              m.name
            );
            T || (T = [], i.set(
              m.name,
              T
            ));
            const x = this.allBufferLocations[m.name] || [];
            this.allBufferLocations[m.name] = x;
            const b = Object.assign({}, m, {
              uid: a,
              packUID: l,
              bufferAttribute: h,
              size: c
            }), v = m.blockIndex || 0, E = m.size || 1;
            for (let y = 0; y < this.maxInstancedCount; ++y) {
              const C = {
                attribute: b,
                block: a,
                buffer: {
                  data: u
                },
                instanceIndex: y,
                start: y * c + v,
                end: y * c + v + E
              };
              T.push(C), x.push(C);
            }
            this.attributes.push(b);
          }
          this.blockAttributes.push({
            uid: P(),
            packUID: l,
            bufferAttribute: h,
            name: `block${a}`,
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
            s
          );
      }
      this.geometry.maxInstancedCount = 0, this.material = this.makeLayerMaterial();
      for (let a = 0, o = e.uniforms.length; a < o; ++a) {
        const c = e.uniforms[a];
        c.materialUniforms.push(this.material.uniforms[c.name]);
      }
    }
    return this.scene && this.model && this.scene.container && this.scene.container.remove(this.model), this.material = this.material || this.makeLayerMaterial(), this.model = bn(
      this.layer.id,
      this.geometry,
      this.material,
      this.layer.shaderIOInfo.drawMode
    ), this.scene && this.scene.container && this.model && this.scene.container.add(this.model), Ni("COMPLETE: Resizing unpacked attribute buffer"), {
      growth: t,
      newLocations: i
    };
  }
  /**
   * This takes newly created buffer locations and groups them by the property ids identified by the
   * registration phase.
   */
  gatherLocationsIntoGroups(e, t) {
    if (this.attributeToPropertyIds.size === 0) return;
    Ni("BEGIN: Packed attribute manager grouping new buffer locations");
    const i = [];
    this.attributeToPropertyIds.forEach((n, s) => {
      i.push({
        attribute: s,
        bufferLocationsForAttribute: e.get(s.name) || [],
        childBufferLocations: (s.childAttributes || []).map((a) => ({
          location: e.get(a.name) || [],
          bufferIndex: -1
        })),
        ids: n,
        bufferIndex: -1
      });
    });
    for (let n = 0; n < t; ++n) {
      const s = {
        instanceIndex: -1,
        propertyToBufferLocation: {}
      };
      for (let a = 0, o = i.length; a < o; ++a) {
        const c = i[a], l = c.attribute, u = c.ids, h = c.bufferLocationsForAttribute;
        if (!h) {
          Ce(
            "Instance Attribute Buffer Error",
            (p, g) => {
              console.warn(
                `${g}: There is an error in forming buffer location groups in VertexAttributePackingBufferManager. Error count: ${p}`
              );
            }
          );
          continue;
        }
        const d = h[++c.bufferIndex];
        if (!d) {
          Ce(
            "Instance Attribute Buffer Error",
            (p, g) => {
              console.warn(
                `${g}: There is an error in forming buffer location groups in VertexAttributePackingBufferManager. Error count: ${p}`
              );
            }
          );
          continue;
        }
        if (s.instanceIndex === -1)
          s.instanceIndex = d.instanceIndex;
        else if (d.instanceIndex !== s.instanceIndex) {
          Ce(
            "Instance Attribute Parallelism Error",
            (p, g) => {
              console.warn(
                `${g}: A buffer location does not have a matching instance index which means the buffer locations are not in parallel with each other somehow. Error count: ${p}`
              ), console.warn(l.name, d);
            }
          );
          continue;
        }
        if (l.childAttributes) {
          const p = [];
          for (let g = 0, m = l.childAttributes.length; g < m; ++g) {
            const T = l.childAttributes[g], x = c.childBufferLocations[g];
            if (x) {
              const b = x.location[++x.bufferIndex];
              b ? p.push(b) : Ce(
                "Instance Attribute Child Attribute Error",
                (v, E) => {
                  console.warn(
                    `${E}: A child attribute does not have a buffer location available. Error count: ${v}`
                  ), console.warn(
                    `Parent Attribute: ${l.name} Child Attribute: ${T.name}`
                  );
                }
              );
            }
          }
          d.childLocations = p;
        }
        for (let p = 0, g = u.length; p < g; ++p) {
          const m = u[p];
          s.propertyToBufferLocation[m] = d;
        }
      }
      this.availableLocations.push(s);
    }
    Ni("COMPLETE: Packed attribute buffer manager buffer location grouping"), Ns();
  }
  /**
   * Returns the total instances this buffer manages.
   */
  getInstanceCount() {
    return this.maxInstancedCount;
  }
}
class Mm {
  constructor(e) {
    this.isMouseOver = /* @__PURE__ */ new Set(), this.isMouseDown = /* @__PURE__ */ new Set(), this.isTouchOver = /* @__PURE__ */ new Map(), this.isTouchDown = /* @__PURE__ */ new Map(), this.layer = e;
  }
  /**
   * Retrieves the color picking instance determined for the procedure.
   */
  getColorPickInstance(e) {
    return this.colorPicking && this.layer.picking.type === Y.SINGLE && this.colorPicking.view === e ? this.layer.uidToInstance.get(
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
  handleTouchOver(e, t, i) {
  }
  /**
   * Handles mouse down gestures for a layer within a view
   */
  handleMouseDown(e, t) {
    if (this.layer.picking && this.layer.picking.type !== Y.NONE) {
      const { onMouseDown: i } = this.layer.props;
      if (i) {
        const n = e.projection.screenToWorld(
          t.screen.position
        ), s = [];
        if (this.layer.picking.type === Y.SINGLE) {
          const o = this.getColorPickInstance(e);
          o && s.push(o);
        }
        const a = {
          interaction: t,
          instances: s,
          layer: this.layer.id,
          projection: e.projection,
          screen: t.screen.position,
          world: n
        };
        i(a), this.isMouseDown.clear(), s.forEach((o) => this.isMouseDown.add(o));
      }
    }
  }
  /**
   * Handles touch events for instances for layers
   */
  handleTouchDown(e, t, i) {
    const { onTouchDown: n, onTouchOver: s } = this.layer.props;
    if (!this.layer.picking || this.layer.picking.type === Y.NONE || !n && !s)
      return;
    const a = e.projection.screenToWorld(i.screen.position), o = [];
    if (this.layer.picking.type === Y.SINGLE) {
      const h = this.getColorPickInstance(e);
      h && o.push(h);
    }
    const c = {
      interaction: t,
      touch: i,
      instances: o,
      layer: this.layer.id,
      projection: e.projection,
      screen: i.screen.position,
      world: a
    }, l = pi(
      this.isTouchDown,
      i.touch.touch.identifier,
      () => /* @__PURE__ */ new Set()
    ), u = pi(
      this.isTouchOver,
      i.touch.touch.identifier,
      () => /* @__PURE__ */ new Set()
    );
    o.forEach((h) => {
      l.add(h), u.add(h);
    }), s && s(c), n && n(c);
  }
  /**
   * Handles mouse out events for a layer within the view
   */
  handleMouseOut(e, t) {
    if (this.layer.picking && this.layer.picking.type !== Y.NONE) {
      const { onMouseOut: i } = this.layer.props;
      if (i) {
        const n = e.projection.screenToWorld(
          t.screen.position
        ), s = {
          interaction: t,
          instances: Array.from(this.isMouseOver.keys()),
          layer: this.layer.id,
          projection: e.projection,
          screen: t.screen.position,
          world: n
        };
        i(s);
      }
    }
    this.isMouseOver.clear();
  }
  /**
   * Handles touch events that have been dragged off of a view
   */
  handleTouchOut(e, t, i) {
    const { onTouchOut: n } = this.layer.props;
    if (!this.layer.picking || this.layer.picking.type === Y.NONE || !n)
      return;
    const s = e.projection.screenToWorld(i.screen.position), a = {
      interaction: t,
      touch: i,
      instances: Array.from(this.isMouseOver.keys()),
      layer: this.layer.id,
      projection: e.projection,
      screen: i.screen.position,
      world: s
    };
    n(a), this.isTouchOver.delete(i.touch.touch.identifier);
  }
  /**
   * Handles mouse up gestures for the layer within the provided view
   */
  handleMouseUp(e, t) {
    const { onMouseUp: i, onMouseUpOutside: n } = this.layer.props;
    if (!this.layer.picking || this.layer.picking.type === Y.NONE || !i)
      return;
    const s = e.projection.screenToWorld(t.screen.position), a = [];
    if (this.layer.picking.type === Y.SINGLE) {
      const c = this.getColorPickInstance(e);
      c && a.push(c);
    }
    let o = {
      interaction: t,
      instances: a,
      layer: this.layer.id,
      projection: e.projection,
      screen: t.screen.position,
      world: s
    };
    i(o), a.forEach((c) => this.isMouseDown.delete(c)), !(this.isMouseDown.size <= 0 || !n) && (o = {
      interaction: t,
      instances: Array.from(this.isMouseDown.values()),
      layer: this.layer.id,
      projection: e.projection,
      screen: t.screen.position,
      world: s
    }, n(o));
  }
  /**
   * Handles touch up events that occur over a view
   */
  handleTouchUp(e, t, i) {
    const { onTouchUp: n, onTouchUpOutside: s, onTouchOut: a, onTouchAllEnd: o } = this.layer.props;
    if (!this.layer.picking || this.layer.picking.type === Y.NONE || !n && !s && !a && !o)
      return;
    const c = e.projection.screenToWorld(i.screen.position), l = [];
    if (this.layer.picking.type === Y.SINGLE) {
      const d = this.getColorPickInstance(e);
      d && l.push(d);
    }
    let u = {
      interaction: t,
      touch: i,
      instances: l,
      layer: this.layer.id,
      projection: e.projection,
      screen: i.screen.position,
      world: c
    };
    a && a(u), n && n(u);
    const h = ua(
      this.isTouchDown,
      i.touch.touch.identifier,
      /* @__PURE__ */ new Set()
    );
    l.forEach((d) => h.delete(d)), h.size > 0 && s && (u = {
      interaction: t,
      touch: i,
      instances: Array.from(h.values()),
      layer: this.layer.id,
      projection: e.projection,
      screen: i.screen.position,
      world: c
    }, s(u)), this.isTouchDown.delete(i.touch.touch.identifier), this.isTouchDown.size <= 0 && o && (u = {
      interaction: t,
      touch: i,
      instances: [],
      layer: this.layer.id,
      projection: e.projection,
      screen: i.screen.position,
      world: c
    }, o(u));
  }
  /**
   * Mouse move events on the layer will detect when instances have their item
   * newly over or just moved on
   */
  handleMouseMove(e, t) {
    const { onMouseOver: i, onMouseMove: n, onMouseOut: s } = this.layer.props;
    if (this.layer.picking && this.layer.picking.type !== Y.NONE && (i || n || s)) {
      let a;
      const o = e.projection.screenToWorld(
        t.screen.position
      ), c = [];
      if (this.layer.picking.type === Y.SINGLE) {
        const u = this.getColorPickInstance(e);
        u && c.push(u);
      }
      const l = /* @__PURE__ */ new Set();
      if (c.forEach((u) => l.add(u)), s) {
        const u = [];
        this.isMouseOver.forEach((h) => {
          l.has(h) || u.push(h);
        }), a = {
          interaction: t,
          instances: u,
          layer: this.layer.id,
          projection: e.projection,
          screen: t.screen.position,
          world: o
        }, u.length > 0 && s(a);
      }
      if (i) {
        const u = c.filter(
          (h) => !this.isMouseOver.has(h)
        );
        a = {
          interaction: t,
          instances: u,
          layer: this.layer.id,
          projection: e.projection,
          screen: t.screen.position,
          world: o
        }, u.length > 0 && i(a);
      }
      n && (a = {
        interaction: t,
        instances: c,
        layer: this.layer.id,
        projection: e.projection,
        screen: t.screen.position,
        world: o
      }, n(a)), this.isMouseOver = l;
    }
  }
  /**
   * Handles touches that are moving along the screen
   */
  handleTouchMove(e, t, i) {
    const { onTouchOver: n, onTouchMove: s, onTouchOut: a } = this.layer.props;
    if (this.layer.picking && this.layer.picking.type !== Y.NONE && (n || s || a)) {
      let o;
      const c = e.projection.screenToWorld(i.screen.position), l = [];
      if (this.layer.picking.type === Y.SINGLE) {
        const d = this.getColorPickInstance(e);
        d && l.push(d);
      }
      const u = ua(
        this.isTouchOver,
        i.touch.touch.identifier,
        /* @__PURE__ */ new Set()
      ), h = /* @__PURE__ */ new Set();
      if (l.forEach((d) => h.add(d)), a) {
        const d = [];
        u.forEach((p) => {
          h.has(p) || d.push(p);
        }), o = {
          interaction: t,
          touch: i,
          instances: d,
          layer: this.layer.id,
          projection: e.projection,
          screen: i.screen.position,
          world: c
        }, d.length > 0 && a(o);
      }
      if (n) {
        const d = l.filter((p) => !u.has(p));
        o = {
          interaction: t,
          touch: i,
          instances: d,
          layer: this.layer.id,
          projection: e.projection,
          screen: i.screen.position,
          world: c
        }, d.length > 0 && n(o);
      }
      s && (o = {
        interaction: t,
        touch: i,
        instances: l,
        layer: this.layer.id,
        projection: e.projection,
        screen: i.screen.position,
        world: c
      }, s(o)), this.isMouseOver = h;
    }
  }
  /**
   * Handles click gestures on the layer within a view
   */
  handleMouseClick(e, t) {
    if (this.layer.picking && this.layer.picking.type !== Y.NONE) {
      const { onMouseClick: i } = this.layer.props;
      if (i) {
        const n = e.projection.screenToWorld(
          t.screen.position
        ), s = [];
        if (this.layer.picking.type === Y.SINGLE) {
          const o = this.getColorPickInstance(e);
          o && s.push(o);
        }
        const a = {
          interaction: t,
          instances: s,
          layer: this.layer.id,
          projection: e.projection,
          screen: t.screen.position,
          world: n
        };
        i(a);
      }
    }
  }
  /**
   * Handles tap interactions with the view
   */
  handleTap(e, t, i) {
    if (this.layer.picking && this.layer.picking.type !== Y.NONE) {
      const { onTap: n } = this.layer.props;
      if (n) {
        const s = e.projection.screenToWorld(i.screen.position), a = [];
        if (this.layer.picking.type === Y.SINGLE) {
          const c = this.getColorPickInstance(e);
          c && a.push(c);
        }
        const o = {
          interaction: t,
          touch: i,
          instances: a,
          layer: this.layer.id,
          projection: e.projection,
          screen: i.screen.position,
          world: s
        };
        n(o);
      }
    }
  }
  /**
   * Handles drag gestures for the layer within the view
   */
  handleMouseDrag(e, t) {
  }
}
const js = Ee("performance"), fs = class fs extends mi {
  constructor(e, t, i) {
    super(i), this.animationEndTime = 0, this.alwaysDraw = !1, this.depth = 0, this._easingManager = {
      easingComplete: new Ve(),
      complete: () => this._easingManager.easingComplete.promise
    }, this.lastFrameTime = 0, this.needsViewDrawn = !1, this.picking = {
      currentPickMode: Y.NONE,
      type: Y.SINGLE,
      uidToInstance: /* @__PURE__ */ new Map()
    }, this.resource = Cg, this.shaderIOInfo = {}, this.streamChanges = {
      locked: !1,
      streamIndex: 0
    }, this._uid = P(), this.uidToInstance = /* @__PURE__ */ new Map(), this.willRebuildLayer = !1, this.surface = e, this.scene = t, this.props = Object.assign({}, fs.defaultProps || {}, i);
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
    return this._bufferType || ae.INSTANCE_ATTRIBUTE;
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
      return this.picking && (this.picking.type = Y.NONE), js(
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
      oe
    ), e.vertexAttributes = (e.vertexAttributes || []).filter(
      oe
    ), e.uniforms = (e.uniforms || []).filter(oe);
  }
  /**
   * When the layer declares it's shader intiialization, it can specify multiple
   * fragment shader fragments each with their own output target type. We do NOT
   * allow two fragments to point to the same type. This performs a thorough
   * check to ensure that does not happen.
   */
  checkForDuplicateOutputTypes(e) {
    let { mapOutput: t } = this.props;
    Rt(e.fs) && (e.fs = [
      {
        outputType: V.COLOR,
        source: e.fs
      }
    ]), t = t || {};
    const i = /* @__PURE__ */ new Set();
    let n = !1, s = Number.MIN_SAFE_INTEGER;
    for (let a = 0, o = e.fs.length; a < o; ++a) {
      const c = e.fs[a], l = t[c.outputType];
      if (l === void 0) {
        i.has(c.outputType) && (n = !0), i.add(c.outputType);
        continue;
      }
      l === V.NONE ? c.outputType = s++ : c.outputType = l, i.has(c.outputType) && (n = !0), i.add(c.outputType);
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
    Rt(e.fs) && (e.fs = [
      {
        outputType: V.COLOR,
        source: e.fs
      }
    ]);
    const i = this.props.fs;
    if (i)
      if (Rt(i)) {
        const c = i;
        e.fs.map((l) => (l.outputType === V.COLOR && (l.source = c), l));
      } else
        for (let c = 0, l = i.length; c < l; ++c) {
          const { outputType: u, source: h } = i[c], d = e.fs.findIndex(
            (p) => p.outputType === u
          );
          d > -1 ? e.fs[d] = { outputType: u, source: h } : e.fs.push({ outputType: u, source: h });
        }
    const n = this.picking.type === Y.SINGLE && !e.fs.find(
      (c) => c.outputType === V.PICKING
    );
    if (this.picking.type === Y.SINGLE && !n)
      throw new Error(
        "Do NOT specify picking prop on a layer when you have your own Picking output declared."
      );
    const s = {
      outputType: V.PICKING,
      source: Ng
    }, a = /* @__PURE__ */ new Map(), o = {
      fs: /* @__PURE__ */ new Map(),
      vs: /* @__PURE__ */ new Map(),
      destructure: /* @__PURE__ */ new Map()
    };
    for (let c = 0, l = t.length; c < l; ++c) {
      const u = t[c];
      if (n) {
        const m = e.fs.findIndex(
          (T) => T.outputType === V.PICKING
        );
        m > -1 && e.fs.splice(m, 1);
      }
      const h = u.getOutputTargets();
      let d = 0;
      e.fs.forEach((m, T) => {
        h != null && h.find(
          (x) => x.outputType === m.outputType
        ) && (d = T);
      }), n && e.fs.splice(d + 1, 0, s);
      let p = pi(o.fs, u, /* @__PURE__ */ new Map());
      p || (p = /* @__PURE__ */ new Map(), o.fs.set(u, p));
      const g = yc.makeOutputFragmentShader(
        o.vs,
        p,
        h,
        e.fs
      );
      g && a.set(u, g);
    }
    return a.size === 0 ? (console.warn(
      "Could not generate output fragment shaders for the view specified."
    ), !1) : { outputFragmentShaders: a, declarations: o };
  }
  /**
   * This performs the actual generation of the vertex and fragment shaders this
   * layer will use. Each fragment shader is now associated with it's respective
   * view and will be generated accordingly.
   */
  processLayerShaders(e, t, i) {
    let n = null;
    if (n = new yc().process(
      this,
      e,
      t,
      i,
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
          update: (s) => [s.active ? 1 : 0]
        },
        baseBufferGrowthRate: e.baseBufferGrowthRate === void 0 ? 1e3 : e.baseBufferGrowthRate,
        instancing: e.instancing === void 0 ? !0 : e.instancing,
        instanceAttributes: n.instanceAttributes,
        instanceVertexCount: e.vertexCount,
        vs: n.vs,
        fs: n.fs,
        materialUniforms: n.materialUniforms,
        maxInstancesPerBuffer: n.maxInstancesPerBuffer,
        drawMode: e.drawMode || f.Model.DrawMode.TRIANGLE_STRIP,
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
    am(
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
    const { picking: t = Y.NONE } = this.props;
    t === Y.SINGLE ? this.picking = {
      currentPickMode: Y.NONE,
      type: Y.SINGLE,
      uidToInstance: /* @__PURE__ */ new Map()
    } : this.picking = {
      currentPickMode: Y.NONE,
      type: Y.NONE
    }, this.resource = this.surface.resourceManager;
    const i = this.initShader();
    this.interactions = new Mm(this);
    const n = this.validateShaderIO(i);
    if (n !== void 0) return n;
    if (!i) return !1;
    let s;
    return this.surface.getShaderTransforms().forEach((o) => {
      i.vs = o.rawVertex(i.vs), i.fs = o.rawFragment(i.fs);
    }), s = this.cleanShaderIOElements(i), Zr(s) || (s = this.checkForDuplicateOutputTypes(i), Zr(s)) || (s = this.processFragmentShadersForEachView(i, e), Zr(s)) || (s = this.processLayerShaders(
      i,
      s.outputFragmentShaders,
      s.declarations
    ), Zr(s)) || (s = this.processVertexAttributes(i), Zr(s)) || (s = this.makeLayerBufferManager(this.surface.gl, this.scene, i), Zr(s)) || (s = this.updateDiffHandlers(), Zr(s)) ? s : (this.layerShaderDebugging(), this.props.ref && (this.props.ref.easing = this.easingManager), this.props.data.sync(), !0);
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
    const t = [], i = [];
    return t.push("instancing"), this.picking.type === Y.SINGLE && t.push("picking"), (e.instanceAttributes || []).find(
      (s) => !!(s && s.easing)
    ) && t.push("frame"), {
      fs: i,
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
    let t, i, n;
    const s = this.diffManager;
    if (!s || !this.bufferManager) return;
    const a = s.processing, o = s.processor;
    if (!o) {
      console.warn(
        "A layer is atttempting to draw without a diff processor for analyzing changes."
      );
      return;
    }
    o.incomingChangeList(e), this.bufferManager.incomingChangeList(e);
    for (let c = 0, l = e.length; c < l; ++c)
      t = e[c], i = t[0], n = this.bufferManager.getBufferLocations(i), a == null || a[t[1]](
        o,
        i,
        Object.values(t[2]),
        n
      ), i.changes = {};
    o.commit(), this.bufferManager.changesProcessed(), this.updateEasingManager(), this.updateUniforms();
  }
  /**
   * This handles updating our easingManager so references can properly react to
   * easing completion times.
   */
  updateEasingManager() {
    if (this.props.streamChanges) {
      if (!this.streamChanges.stream || this.streamChanges.stream.length <= 0) {
        const e = this._easingManager.easingComplete;
        this._easingManager.easingComplete = new Ve(), lr(() => {
          e.resolve();
        }, this.animationEndTime - this.surface.frameMetrics.currentTime);
      }
    } else {
      const e = this._easingManager.easingComplete;
      this._easingManager.easingComplete = new Ve(), lr(() => {
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
        strategy: ea.LINEAR
      }
    } = this.props, { stream: i = [], streamIndex: n } = this.streamChanges;
    switch (t.count === void 0 && (t.count = 1e4), t.count <= 0 && (t.count = Number.MAX_SAFE_INTEGER), t.strategy) {
      // Linear just pulls out changes as they came in
      case ea.LINEAR:
      default: {
        e = i.slice(n, n + t.count), this.streamChanges.streamIndex += t.count;
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
    const i = {};
    for (let n = 0, s = t.length; n < s; ++n) {
      Ne.setObservableMonitor(!0), e[t[n]];
      const a = Ne.getObservableMonitorIds(!0);
      a[0] !== void 0 && (i[t[n]] = a[0]);
    }
    return Ne.setObservableMonitor(!1), i;
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
    return oe(this.bufferManager) && this.bufferManager.managesInstance(e);
  }
  /**
   * This method determines the buffering strategy that the layer should be
   * utilizing based on provided vertex and instance attributes.
   */
  getLayerBufferType(e, t, i, n) {
    let s = ae.UNIFORM, a = 0;
    if (this._bufferType !== void 0)
      return this._bufferType;
    if (N.HARDWARE_INSTANCING) {
      for (let o = 0, c = i.length; o < c; ++o) {
        const l = i[o];
        a += Math.ceil(l.size / 4);
      }
      for (let o = 0, c = n.length; o < c; ++o) {
        const l = n[o];
        a += Math.ceil(
          Eh[l.size || 1] / 4
        );
      }
      if (a > N.MAX_VERTEX_ATTRIBUTES) {
        a = 0;
        for (let o = 0, c = n.length; o < c; ++o) {
          const l = n[o];
          a = Math.max(a, l.block || 0);
        }
        for (let o = 0, c = i.length; o < c; ++o) {
          const l = i[o];
          a += Math.ceil(l.size / 4);
        }
        a < N.MAX_VERTEX_ATTRIBUTES && (s = t.instancing === !1 ? ae.VERTEX_ATTRIBUTE_PACKING : ae.INSTANCE_ATTRIBUTE_PACKING, js(
          `Performance Issue (Moderate):
            Layer %o is utilizing too many vertex attributes and is now using vertex packing.
            Max Vertex units %o
            Used Vertex units %o
            Instance Attributes %o
            Vertex Attributes %o`,
          this.id,
          N.MAX_VERTEX_ATTRIBUTES,
          a,
          n,
          i
        ));
      } else
        s = t.instancing === !1 ? ae.VERTEX_ATTRIBUTE : ae.INSTANCE_ATTRIBUTE;
    }
    return s === ae.UNIFORM && (js(
      `Performance Issue (High):
        Layer %o is utilizing too many vertex attributes and is now using a uniform buffer.
        Max Vertex units %o
        Used Vertex units %o
        Instance Attributes %o
        Vertex Attributes %o`,
      this.id,
      N.MAX_VERTEX_ATTRIBUTES,
      a,
      n,
      i
    ), s = ae.UNIFORM), this.setBufferType(s), s;
  }
  /**
   * This generates the buffer manager to be used to manage instances getting
   * applied to attribute locations.
   */
  makeLayerBufferManager(e, t, i) {
    switch (this.getLayerBufferType(
      e,
      i,
      this.shaderIOInfo.vertexAttributes,
      this.shaderIOInfo.instanceAttributes
    )) {
      case ae.INSTANCE_ATTRIBUTE: {
        this.setBufferManager(new fm(this, t));
        break;
      }
      case ae.INSTANCE_ATTRIBUTE_PACKING: {
        this.setBufferManager(
          new gm(this, t)
        );
        break;
      }
      case ae.VERTEX_ATTRIBUTE: {
        this.setBufferManager(new Em(this, t));
        break;
      }
      case ae.VERTEX_ATTRIBUTE_PACKING: {
        this.setBufferManager(
          new Am(this, t)
        );
        break;
      }
      // Anything not utiliziing a specialized buffering strategy will use the
      // uniform compatibility mode
      default: {
        this.setBufferManager(new xm(this, t));
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
    ) ? this.picking.type === Y.SINGLE ? (this.onDiffAdd = this.handleDiffAddWithPickingAndEasing, this.onDiffRemove = this.handleDiffRemoveWithPickingAndEasing) : (this.onDiffAdd = this.handleDiffAddWithEasing, this.onDiffRemove = this.handleDiffRemoveWithEasing) : this.picking.type === Y.SINGLE && (this.onDiffAdd = this.handleDiffAddWithPicking, this.onDiffRemove = this.handleDiffRemoveWithPicking);
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
    for (let i = 0, n = t.length; i < n; ++i)
      t[i][0].changes = {};
    return t;
  }
  /**
   * Applies a buffer manager to the layer which handles instance changes and
   * applies those changes to an appropriate buffer at the appropriate location.
   */
  setBufferManager(e) {
    this._bufferManager ? console.warn(
      "You can not change a layer's buffer strategy once it has been instantiated."
    ) : (this._bufferManager = e, this.diffManager = new Rm(), this.diffManager.makeProcessor(this, e));
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
    for (const i in t)
      if (t[i] !== e[i]) return !0;
    return !1;
  }
  /**
   * This triggers the layer to update the material uniforms that have been
   * created for the layer. This is primarily used internally.
   */
  updateUniforms() {
    let e, t;
    for (let i = 0, n = this.shaderIOInfo.uniforms.length; i < n; ++i)
      e = this.shaderIOInfo.uniforms[i], t = e.update(e), e.materialUniforms.forEach(
        (s) => s.data = t
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
fs.defaultProps = {};
let Xt = fs;
const Hs = Ee("performance"), bo = class bo extends mi {
  constructor(e, t) {
    super(t), this.container = new ta(), this._renderViewCache = null, this.surface = e, this.init(t);
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
    this.viewDiffs.items.forEach((s) => {
      var o;
      const a = (o = this.viewDiffs.getInitializerByKey(s.id)) == null ? void 0 : o.init[1];
      if (a != null && a.parent) {
        const c = e.get(a.parent) || [];
        c ? c.push(s) : e.set(a.parent, [a.parent, s]);
      } else
        e.get(s) || e.set(s, [s]);
    });
    const t = [], i = ((n = this.surface) == null ? void 0 : n.frameMetrics.currentFrame) ?? 0;
    return e.forEach((s) => {
      t.push(s[i % s.length]);
    }), this._renderViewCache = t, t;
  }
  /**
   * Initialize all that needs to be initialized
   */
  init(e) {
    if (!this.surface || !this.surface.gl) return;
    this.container = new ta();
    const t = im(this.surface.gl);
    this.layerDiffs = new cs({
      buildItem: async (i) => {
        if (Hs("Building layer", i.key), !this.surface) return null;
        const n = i.init[0], s = i.init[1], a = new n(
          this.surface,
          this,
          Object.assign({}, n.defaultProps, s)
        );
        if (a.initializer = i, a.props.data.sync(), a.parent = s.parent, s.parent && (s.parent.children ? s.parent.children.push(a) : s.parent.children = [a]), !a.init(this.views))
          return console.warn(
            "Error initializing layer:",
            s.key,
            "A layer was unable to be added to the surface. See previous warnings (if any) to determine why they could not be instantiated"
          ), null;
        const o = a.childLayers();
        return this.layerDiffs.inline(o), a;
      },
      destroyItem: async (i, n) => (Hs("Destroying layer", i.key), n.destroy(), !0),
      updateItem: async (i, n) => {
        const s = i.init[1];
        if (n.willUpdateProps(s), s.data !== n.props.data && s.data.sync(), n.shouldDrawView(n.props, s) && (n.needsViewDrawn = !0), Object.assign(n.props, s), n.initializer.init[1] = n.props, n.didUpdateProps(), s.parent && n.parent && n.parent !== s.parent) {
          const a = n.parent.children || [], o = a.indexOf(n) || -1;
          o > -1 && a.splice(o, 1);
        }
        n.parent = s.parent, n.willRebuildLayer ? (this.layerDiffs.rebuild(), n.willRebuildLayer = !1) : this.layerDiffs.inline(n.childLayers());
      }
    }), this.viewDiffs = new cs({
      buildItem: async (i) => {
        if (this._renderViewCache = null, !this.surface) return null;
        const n = i.init[1], s = i.init[0];
        n.key = i.key;
        const a = new s(this, n);
        a.props = Object.assign({}, n), a.props.camera = a.props.camera || t.camera, a.pixelRatio = this.surface.pixelRatio, a.resource = this.surface.resourceManager, this.surface.userInputManager.waitingForRender = !0;
        const o = i.init[1].chain;
        if (o) {
          const c = o.map((l, u) => ({
            key: `${n.key}-chain-${u}`,
            init: [
              s,
              {
                ...n,
                ...l,
                parent: a,
                // Prevent chain recursion
                chain: void 0,
                key: ""
              }
            ]
          }));
          this.viewDiffs.inline(c);
        }
        return a;
      },
      // Make sure the view cleans up it's render targets and related resources.
      destroyItem: async (i, n) => (Hs("Destroying view", n.id), n.destroy(), !0),
      // Hand off the initializer to the update of the view
      updateItem: async (i, n) => {
        this._renderViewCache = null;
        const s = i.init[1], a = i.init[0];
        n.willUpdateProps(s), n.previousProps = n.props, n.props = Object.assign({}, n.props, s), n.didUpdateProps(), this.surface && (this.surface.userInputManager.waitingForRender = !0);
        const o = i.init[1].chain;
        if (o) {
          const c = o.map((l, u) => ({
            key: `${s.key}-chain-${u}`,
            init: [
              a,
              {
                ...s,
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
bo.DEFAULT_SCENE_ID = "__default__";
let us = bo;
var xt = /* @__PURE__ */ ((r) => (r[r.COLOR = 1] = "COLOR", r[r.DEPTH = 2] = "DEPTH", r[r.STENCIL = 4] = "STENCIL", r))(xt || {}), qn = /* @__PURE__ */ ((r) => (r[r.FRAME_COUNT = 0] = "FRAME_COUNT", r[r.FRAME_SKIP = 1] = "FRAME_SKIP", r[r.UP_TO_TIMESTAMP_INCLUSIVE = 2] = "UP_TO_TIMESTAMP_INCLUSIVE", r[r.UP_TO_TIMESTAMP_EXCLUSIVE = 3] = "UP_TO_TIMESTAMP_EXCLUSIVE", r[r.ON_PROPS_CHANGE = 4] = "ON_PROPS_CHANGE", r[r.ON_TRIGGER = 5] = "ON_TRIGGER", r[r.ALWAYS = 6] = "ALWAYS", r[r.NEVER = 7] = "NEVER", r))(qn || {});
function Xu(r, e) {
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
    init: [r, t]
  };
}
const ps = class ps extends mi {
  constructor(e, t) {
    super(t), this.animationEndTime = 0, this.depth = 0, this.lastFrameTime = 0, this.needsDraw = !1, this.optimizeRendering = !1, this._pixelRatio = 1, this.drawModeInfo = {
      startFrame: 0,
      toFrame: 0,
      tillTimestamp: 0
    }, this.scene = e, this.props = Object.assign({}, ps.defaultProps || {}, t);
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
    return e ? (Ur(e.buffers) || on(e.buffers) ? t = [
      {
        outputType: V.COLOR,
        resource: e.buffers
      }
    ] : Object.keys(e.buffers).forEach((i) => {
      const n = Number.parseFloat(i), s = e.buffers[n];
      s && t.push({
        outputType: n,
        resource: s
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
    const i = e.blit;
    if (!i) return null;
    const n = i.color;
    return n ? (Ur(n) || on(n) ? t = [
      {
        outputType: V.COLOR,
        resource: n
      }
    ] : Object.keys(n).forEach((s) => {
      const a = Number.parseFloat(s), o = n[a];
      o && t.push({
        outputType: a,
        resource: o
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
  requestBufferResources(e, t, i, n, s, a) {
    const o = /* @__PURE__ */ new Map();
    for (let c = 0, l = e.length; c < l; ++c) {
      const u = e[c], h = u.resource;
      if (t.has(u.outputType))
        if (Ur(h)) {
          const d = cn({
            key: u.resource.key
          });
          if (this.resource.request(i, n, d), !d.texture)
            return s(u), o;
          o.set(u.outputType, d.texture);
        } else {
          const d = ia({
            key: u.resource.key
          });
          if (this.resource.request(i, n, d), !d.colorBuffer)
            return a(u), o;
          o.set(u.outputType, d.colorBuffer);
        }
    }
    return o;
  }
  /**
   * This generates the render target needed to handle the output configuration
   * specified by the props and the layer configuration.
   *
   * This is called by the system and should never need to be called externally.
   */
  createRenderTarget() {
    var p, g;
    this.renderTarget && (Array.isArray(this.renderTarget) ? this.renderTarget.forEach((m) => m.dispose()) : this.renderTarget.dispose());
    const { output: e } = this.props, t = this.scene.surface;
    if (!e || !t) return;
    const i = /* @__PURE__ */ new Set();
    for (let m = 0, T = this.scene.layers.length; m < T; ++m) {
      const b = (p = this.scene.layers[m].shaderIOInfo.fs) == null ? void 0 : p.get(this);
      b && b.outputTypes.forEach(
        (v) => i.add(v)
      );
    }
    const n = new Xt(t, this.scene, {
      key: "",
      data: new le()
    }), s = new wt({}), a = this.getOutputTargets() || [], o = this.requestBufferResources(
      a,
      i,
      n,
      s,
      (m) => {
        throw console.warn(
          "A view has a RenderTexture output target with key:",
          m.resource.key,
          "however, no RenderTexture was found for the key.",
          "Please ensure you have a 'resource' specified for the Surface with the proper key",
          "Also ensure the resource is made via createTexture()"
        ), new Error(
          `Output target unable to be constructed for view ${this.id}`
        );
      },
      (m) => {
        throw console.warn(
          "A view has a ColorBuffer output target with key:",
          m.resource.key,
          "however, no ColorBuffer was found for the key.",
          "Please ensure you have a 'resource' specified for the Surface with the proper key"
        ), new Error(
          `Output target unable to be constructed for view ${this.id}`
        );
      }
    );
    let c, l;
    o == null || o.forEach((m) => {
      var T, x, b;
      if (m instanceof j) {
        if ((c === void 0 || l === void 0) && (c = ((T = m.data) == null ? void 0 : T.width) || 0, l = ((x = m.data) == null ? void 0 : x.height) || 0), c === 0 || l === 0)
          throw new Error(
            "RenderTexture for View can NOT have a width or height of zero."
          );
        if (((b = m.data) == null ? void 0 : b.width) !== c || m.data.height !== l)
          throw new Error(
            "When a view has multiple output targets: ALL RenderTextures and ColorBuffers that a view references MUST have the same dimensions"
          );
      } else {
        if ((c === void 0 || l === void 0) && (c = m.size[0] || 0, l = m.size[1] || 0), c === 0 || l === 0)
          throw new Error(
            "RenderTexture for View can NOT have a width or height of zero."
          );
        if (m.size[0] !== c || m.size[1] !== l)
          throw new Error(
            "When a view has multiple output targets: ALL RenderTextures and ColorBuffers that a view references MUST have the same dimensions"
          );
      }
    });
    let u;
    if (e.depth)
      if (Ur(e.depth)) {
        const m = cn({
          key: e.depth.key
        });
        if (this.resource.request(n, s, m), !m.texture)
          throw console.warn(
            "A view has a depth buffer output target with key:",
            e.depth,
            "however, no RenderTexture was found for the key.",
            "Please ensure you have a 'resource' specified for the Surface with the proper key",
            "Also ensure the resource is made via createTexture()"
          ), new Error(
            `Output target unable to be constructed for view ${this.id}`
          );
        u = m.texture;
      } else if (on(e.depth)) {
        const m = ia({
          key: e.depth.key
        });
        if (this.resource.request(n, s, m), !m.colorBuffer)
          throw console.warn(
            "A view has a depth buffer output target with key:",
            e.depth.key,
            "however, no ColorBuffer was found for the key.",
            "Please ensure you have a 'resource' specified for the Surface with the proper key",
            "Also ensure the resource is made via createColorBuffer()"
          ), new Error(
            `Output target unable to be constructed for view ${this.id}`
          );
        u = m.colorBuffer;
      } else
        u = f.RenderTarget.DepthBufferFormat.DEPTH_COMPONENT16;
    const h = {};
    let d = /* @__PURE__ */ new Map();
    if ((g = this.props.output) != null && g.blit) {
      const m = this.getBlitOutputTargets() || [];
      if (d = this.requestBufferResources(
        m,
        i,
        n,
        s,
        (T) => {
          throw console.warn(
            "A view has a RenderTexture output blit target with key:",
            T.resource.key,
            "however, no RenderTexture was found for the key.",
            "Please ensure you have a 'resource' specified for the Surface with the proper key"
          ), new Error(
            `Output target unable to be constructed for view ${this.id}`
          );
        },
        (T) => {
          throw console.warn(
            "A view has a ColorBuffer output blit target with key:",
            T.resource.key,
            "however, no ColorBuffer was found for the key.",
            "Please ensure you have a 'resource' specified for the Surface with the proper key"
          ), new Error(
            `Output target unable to be constructed for view ${this.id}`
          );
        }
      ), this.props.output.blit.depth) {
        const T = cn({
          key: this.props.output.blit.depth.key
        });
        if (this.resource.request(n, s, T), !T.texture)
          throw console.warn(
            "A view has a blit depth target with key:",
            this.props.output.blit.depth.key,
            "however, no RenderTexture was found for the key."
          ), new Error(
            `Output target unable to be constructed for view ${this.id}`
          );
        h.depth = T.texture;
      }
    }
    if (N.MRT) {
      const m = [];
      o.forEach(
        (x, b) => m.push({
          buffer: x,
          outputType: b
        })
      );
      const T = [];
      d.forEach(
        (x, b) => T.push({
          buffer: x,
          outputType: b
        })
      ), this.renderTarget = new si({
        buffers: {
          color: m,
          depth: u,
          blit: T.length > 0 || h.depth ? {
            color: T.length > 0 ? T : void 0,
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
      (i) => i.getBuffers().some((n) => !!n.buffer.destroyed)
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
    var o, c, l, u, h, d, p, g, m, T, x, b;
    let t = !1;
    const i = this.props, n = this.previousProps ?? this.props, s = !this.previousProps || ((o = i.drawMode) == null ? void 0 : o.mode) !== ((c = n.drawMode) == null ? void 0 : c.mode) || ((l = i.drawMode) == null ? void 0 : l.value) !== ((u = n.drawMode) == null ? void 0 : u.value) || ((h = i.drawMode) == null ? void 0 : h.trigger) !== ((d = n.drawMode) == null ? void 0 : d.trigger), a = ((p = i.drawMode) == null ? void 0 : p.mode) ?? 6;
    if (s)
      switch (a) {
        case 0:
          this.drawModeInfo.toFrame = e.currentFrame + (((g = i.drawMode) == null ? void 0 : g.value) || 0);
          break;
        case 1:
          this.drawModeInfo.startFrame = e.currentFrame;
          break;
        case 2:
        case 3:
          this.drawModeInfo.tillTimestamp = ((m = i.drawMode) == null ? void 0 : m.value) || 0;
          break;
      }
    switch (a) {
      case 0:
        t = e.currentFrame <= this.drawModeInfo.toFrame;
        break;
      case 1:
        t = (e.currentFrame - this.drawModeInfo.startFrame) % (((T = i.drawMode) == null ? void 0 : T.value) || 1) === 0;
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
        t = ((b = (x = i.drawMode) == null ? void 0 : x.trigger) == null ? void 0 : b.call(x, e)) ?? !1;
        break;
      case 4:
        for (const v in i)
          if (i[v] !== n[v]) {
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
ps.defaultProps = {
  key: "",
  camera: Hr.makeOrthographic(),
  viewport: { left: 0, right: 0, top: 0, bottom: 0 }
};
let pn = ps;
class Im extends pn {
  constructor() {
    super(new us(void 0, { key: "error", layers: [], views: [] }), {
      key: "error",
      viewport: {},
      camera: Hr.makeOrthographic()
    }), this.projection = new fd(), this.screenBounds = new te({
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
const Sm = 1e3, Cm = 200, rr = new Im();
rr.fitViewtoViewport(
  new te({ x: 0, y: 0, width: 100, height: 100 }),
  new te({ x: 0, y: 0, width: 100, height: 100 })
);
function Nm(r, e) {
  return e.d && r.d ? e.d.depth - r.d.depth : 0;
}
function Xs(r, e) {
  return r.touch.identifier - e.touch.identifier;
}
class Om {
  constructor(e, t, i, n) {
    this.eventManagers = [], this.eventCleanup = [], this._waitingForRender = !0, this.getViewsUnderPosition = (s) => {
      if (!this.quadTree) return [];
      const a = this.quadTree.query(s);
      return a.sort(Nm), a;
    }, this.resize = () => {
      this._waitingForRender = !0;
    }, this.context = e, this.surface = t, this.setControllers(i), this.addContextListeners(n);
  }
  get waitingForRender() {
    return this._waitingForRender;
  }
  set waitingForRender(e) {
    if (this._waitingForRender = e, !e) {
      this.quadTree = new eg(0, 0, 0, 0);
      const t = this.scenes, i = [];
      for (let n = 0, s = t.length; n < s; ++n) {
        const a = t[n];
        for (let o = 0, c = a.views.length; o < c; ++o) {
          const l = a.views[o];
          i.push(l.screenBounds);
        }
      }
      this.quadTree.addAll(i);
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
    if (Li(t)) return;
    let i, n = !1;
    if (e) {
      const s = (a) => {
        const o = Jt(a, t), c = this.getViewsUnderPosition(o);
        if (c.length <= 0) return;
        i = {
          canClick: !1,
          currentPosition: o,
          deltaPosition: [0, 0],
          previousPosition: o,
          start: o,
          startTime: Date.now(),
          startView: c[0].d,
          event: a,
          wheel: this.makeWheel(a),
          button: -1
        };
        const l = this.makeMouseInteraction(i);
        this.eventManagers.forEach((u) => {
          u.handleWheel(l);
        }), a.stopPropagation(), a.preventDefault();
      };
      "onwheel" in t && (t.onwheel = s), "addEventListener" in t && (t.addEventListener("DOMMouseScroll", s), this.eventCleanup.push(["DOMMouseScroll", s]));
    }
    t.onmouseleave = (s) => {
      if (this.waitingForRender || !i) return;
      const a = Jt(s, t);
      i.deltaPosition = Re(
        a,
        i.currentPosition
      ), i.previousPosition = i.currentPosition, i.currentPosition = a;
      const o = this.makeMouseInteraction(i);
      this.eventManagers.forEach((c) => {
        c.handleMouseOut(o);
      });
    }, t.onmousemove = (s) => {
      if (this.waitingForRender) return;
      const a = Jt(s, t);
      if (!i) {
        const c = this.getViewsUnderPosition(a);
        i = {
          canClick: !1,
          currentPosition: a,
          deltaPosition: [0, 0],
          previousPosition: a,
          start: a,
          startTime: Date.now(),
          startView: c[0].d,
          event: s,
          wheel: this.makeWheel(),
          button: -1
        };
      }
      i.deltaPosition = Re(
        a,
        i.currentPosition
      ), i.previousPosition = i.currentPosition, i.currentPosition = a, i.canClick = !1;
      const o = this.makeMouseInteraction(i);
      this.eventManagers.forEach((c) => {
        c.handleMouseMove(o);
      }), n = !0;
    }, t.onmousedown = (s) => {
      if (this.waitingForRender) return;
      const a = Jt(s, t), o = this.getViewsUnderPosition(a);
      if (o.length <= 0)
        return;
      i = {
        canClick: !0,
        currentPosition: a,
        deltaPosition: [0, 0],
        previousPosition: a,
        start: a,
        startTime: Date.now(),
        startView: o[0].d,
        event: s,
        wheel: this.makeWheel(),
        button: s.button
      };
      const c = this.makeMouseInteraction(i);
      this.eventManagers.forEach((u) => {
        u.handleMouseDown(c);
      }), s.stopPropagation(), document.onmousemove = (u) => {
        if (!i) return;
        if (!n) {
          const d = Jt(u, t);
          i.deltaPosition = Re(
            d,
            i.currentPosition
          ), i.previousPosition = i.currentPosition, i.currentPosition = d, i.canClick = !1;
        }
        const h = this.makeMouseInteraction(i);
        this.eventManagers.forEach((d) => {
          d.handleDrag(h);
        }), u.preventDefault(), u.stopPropagation(), n = !1;
      }, document.onmouseup = (u) => {
        document.onmousemove = null, document.onmouseup = null, document.onmouseover = null, i = void 0;
      }, document.onmouseover = (u) => {
        if (!i) return;
        const h = Jt(u, t);
        i.deltaPosition = Re(
          h,
          i.currentPosition
        ), i.previousPosition = i.currentPosition, i.currentPosition = h;
        const d = this.makeMouseInteraction(i);
        this.eventManagers.forEach((p) => {
          p.handleMouseOver(d);
        }), u.stopPropagation();
      }, t.onmouseup = (u) => {
        if (!i) return;
        const h = Jt(u, t);
        i.deltaPosition = Re(
          h,
          i.currentPosition
        ), i.previousPosition = i.currentPosition, i.currentPosition = h, i.button = u.button;
        const d = this.makeMouseInteraction(i);
        this.eventManagers.forEach((p) => {
          p.handleMouseUp(d);
        }), i.canClick && Date.now() - i.startTime < Sm && this.eventManagers.forEach((p) => {
          p.handleClick(d);
        }), i = void 0;
      };
      const l = t;
      l.onselectstart !== void 0 ? l.onselectstart = function() {
        return !1;
      } : t.addEventListener("selectstart", function() {
        s.preventDefault();
      });
    };
  }
  /**
   * Adds all the listeners necessary to make the context interactive with multitouch support.
   */
  addTouchContextListeners() {
    const e = this.context;
    if (Li(e)) return;
    const t = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
    function n(u) {
      return u.map((h) => h.touch);
    }
    function s(u) {
      return u.reduce(
        (h, d) => d.touch.startTime > h.touch.startTime ? d : h,
        u[0]
      );
    }
    const a = {
      center: (u) => u.length <= 0 ? [0, 0] : this.getTouchCenter(n(u)),
      centerDelta: (u) => {
        if (u.length <= 0) return [0, 0];
        const h = n(u), d = this.getTouchCenter(
          h,
          (g) => g.previousPosition
        ), p = this.getTouchCenter(h);
        return Re(p, d);
      },
      centerStart: (u) => {
        if (u.length <= 0) return [0, 0];
        const h = s(u).touch;
        return this.getTouchCenter(
          n(u),
          (d) => d === h ? d.start : d.startRelative.get(h) || [0, 0]
        );
      },
      id: (u) => n(u).sort(Xs).map((d) => d.touch.identifier).join("_"),
      rotation: (u) => {
        if (u.length <= 0) return 0;
        const h = n(u), d = this.getTouchCenter(h);
        return this.getAverageAngle(h, d);
      },
      rotationDelta: (u) => {
        if (u.length <= 0) return 0;
        const h = n(u), d = this.getTouchCenter(
          h,
          (T) => T.previousPosition
        ), p = this.getAverageAngle(
          h,
          d,
          (T) => T.previousPosition
        ), g = this.getTouchCenter(h);
        return this.getAverageAngle(h, g) - p;
      },
      rotationStart: (u) => {
        if (u.length <= 0) return 0;
        const h = s(u).touch, d = n(u), p = this.getTouchCenter(
          d,
          (g) => g === h ? g.start : g.startRelative.get(h) || [0, 0]
        );
        return this.getAverageAngle(
          d,
          p,
          (g) => g === h ? g.start : g.startRelative.get(h) || [0, 0]
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
          (T) => T.previousPosition
        ), p = this.getAverageDistance(
          h,
          d,
          (T) => T.previousPosition
        ), g = this.getTouchCenter(h);
        return this.getAverageDistance(h, g) - p;
      },
      spreadStart: (u) => {
        if (u.length <= 0) return 0;
        const h = s(u).touch, d = n(u), p = this.getTouchCenter(
          d,
          (g) => g === h ? g.start : g.startRelative.get(h) || [0, 0]
        );
        return this.getAverageDistance(
          d,
          p,
          (g) => g === h ? g.start : g.startRelative.get(h) || [0, 0]
        );
      }
    };
    e.ontouchstart = (u) => {
      u.preventDefault(), u.stopPropagation();
      const h = this.getTouches(u), d = [], p = [];
      for (let g = 0, m = h.length; g < m; ++g) {
        const T = h[g], x = t.get(T.identifier);
        if (x)
          d.push(x);
        else {
          const b = Jt(T), v = this.getViewsUnderPosition(b);
          if (v.length <= 0) continue;
          const E = v[0].d, y = {
            canTap: !0,
            currentPosition: b,
            deltaPosition: [0, 0],
            startTime: Date.now(),
            start: b,
            startView: E,
            previousPosition: b,
            startRelative: /* @__PURE__ */ new Map(),
            touch: T
          };
          t.set(T.identifier, y), p.push(y);
        }
      }
      if (p.length > 0) {
        const g = p.concat(d), m = [];
        for (let x = 0, b = p.length; x < b; ++x) {
          const v = p[x];
          for (let y = 0, C = g.length; y < C; ++y) {
            const I = g[y];
            v !== I && I.startRelative.set(v, I.currentPosition);
          }
          const E = this.makeSingleTouchInteraction(v);
          m.push(E), i.set(v.touch.identifier, E);
        }
        const T = {
          touches: m,
          allTouches: g.map((x) => i.get(x.touch.identifier)).filter(oe),
          multitouch: a
        };
        this.eventManagers.forEach((x) => {
          x.handleTouchDown(T);
        });
      }
      document.ontouchend = (g) => {
        o.call(document, g), document.ontouchend = null, document.ontouchcancel = null, document.ontouchmove = null;
      }, document.ontouchcancel = (g) => {
        l.call(document, g), document.ontouchend = null, document.ontouchcancel = null, document.ontouchmove = null;
      }, document.ontouchmove = c;
    };
    const o = e.ontouchend = (u) => {
      u.stopPropagation(), u.preventDefault();
      const h = this.getTouches(u, "changed"), d = Array.from(i.values()), p = [];
      for (let g = 0, m = h.length; g < m; ++g) {
        const T = h[g], x = t.get(T.identifier);
        if (x) {
          if (x.canTap && Date.now() - x.startTime < Cm) {
            const v = {
              touches: [this.makeSingleTouchInteraction(x)],
              allTouches: d,
              multitouch: a
            };
            this.eventManagers.forEach((E) => {
              E.handleTap(v);
            });
          }
          p.push(x), t.delete(T.identifier), i.delete(T.identifier);
        }
      }
      if (p.length > 0) {
        const m = {
          touches: p.map(
            (T) => this.makeSingleTouchInteraction(T)
          ),
          allTouches: d,
          multitouch: a
        };
        this.eventManagers.forEach((T) => {
          T.handleTouchUp(m);
        });
      }
    }, c = e.ontouchmove = (u) => {
      u.stopPropagation(), u.preventDefault();
      const h = this.getTouches(u), d = [], p = [];
      for (let g = 0, m = h.length; g < m; ++g) {
        const T = h[g], x = t.get(T.identifier);
        if (x) {
          const b = Jt(T), v = Re(
            b,
            x.currentPosition
          );
          if (gi(v) <= 0) {
            p.push(x), Object.assign(x, {
              currentPosition: b,
              deltaPosition: v,
              previousPosition: x.currentPosition,
              touch: T
            });
            continue;
          }
          d.push(x), Object.assign(x, {
            canTap: !1,
            currentPosition: b,
            deltaPosition: v,
            previousPosition: x.currentPosition,
            touch: T
          });
        }
      }
      if (d.length > 0) {
        const g = d.concat(p), T = {
          touches: d.map(
            (x) => this.makeSingleTouchInteraction(x)
          ),
          allTouches: g.map((x) => i.get(x.touch.identifier)).filter(oe),
          multitouch: a
        };
        this.eventManagers.forEach((x) => {
          x.handleTouchDrag(T);
        });
      }
    }, l = e.ontouchcancel = (u) => {
      u.stopPropagation(), u.preventDefault();
      const h = this.getTouches(u, "changed"), d = Array.from(i.values()), p = [];
      for (let g = 0, m = h.length; g < m; ++g) {
        const T = h[g], x = t.get(T.identifier);
        x && (p.push(x), t.delete(T.identifier), i.delete(T.identifier));
      }
      if (p.length > 0) {
        const m = {
          touches: p.map(
            (T) => this.makeSingleTouchInteraction(T)
          ),
          allTouches: d,
          multitouch: a
        };
        this.eventManagers.forEach((T) => {
          T.handleTouchCancelled(m);
        });
      }
    };
  }
  /**
   * This takes all of the touches and averages their distance from the center point.
   */
  getAverageDistance(e, t, i) {
    let n = 0;
    if (e.length <= 0) return n;
    i || (i = (s) => s.currentPosition);
    for (let s = 0, a = e.length; s < a; ++s) {
      const o = e[s];
      n += gi(Re(i(o), t));
    }
    return n / e.length;
  }
  /**
   * This takes all of the touches and averages their angle around the center point.
   */
  getAverageAngle(e, t, i) {
    let n = 0;
    if (e.length <= 0) return n;
    i || (i = (s) => s.currentPosition);
    for (let s = 0, a = e.length; s < a; ++s) {
      const o = e[s], c = Re(i(o), t);
      let l = Math.atan2(c[1], c[0]);
      l < 0 && (l += Math.PI * 2), n += l;
    }
    return n / e.length;
  }
  /**
   * This takes a list of touches and averages their position for a mid point between all of them.
   */
  getTouchCenter(e, t) {
    let i = [0, 0];
    if (e.length <= 0) return i;
    t || (t = (n) => n.currentPosition);
    for (let n = 0, s = e.length; n < s; ++n) {
      const a = e[n], o = t(a);
      i = Wr(i, o);
    }
    return Ie(i, 1 / e.length);
  }
  /**
   * Retrieves all touches from a touch event. This normalizes the touch information across: touches, changedTouches,
   * and targetTouches
   */
  getTouches(e, t) {
    const i = /* @__PURE__ */ new Map();
    if (e.touches && e.touches.length > 0 && (!t || t === "touches"))
      for (let n = 0, s = e.touches.length; n < s; ++n) {
        const a = e.touches.item(n);
        a && i.set(a.identifier, a);
      }
    if (e.changedTouches && e.changedTouches.length > 0 && (!t || t === "changed"))
      for (let n = 0, s = e.changedTouches.length; n < s; ++n) {
        const a = e.changedTouches.item(n);
        a && i.set(a.identifier, a);
      }
    if (e.targetTouches && e.targetTouches.length > 0 && (!t || t === "target"))
      for (let n = 0, s = e.targetTouches.length; n < s; ++n) {
        const a = e.targetTouches.item(n);
        a && i.set(a.identifier, a);
      }
    return Array.from(i.values());
  }
  /**
   * Retrieves the view for the provided id
   */
  getView(e) {
    const t = this.scenes;
    for (let i = 0, n = t.length; i < n; ++i) {
      const a = t[i].viewDiffs.getByKey(e);
      if (a) return a;
    }
    return null;
  }
  /**
   * This makes the metrics for interactions with the views.
   */
  makeMouseInteraction(e) {
    const t = this.getViewsUnderPosition(e.currentPosition);
    let i = t[0] && t[0].d;
    i || (i = rr);
    const n = this.getViewsUnderPosition(e.start);
    let s = e.startView;
    s || (s = rr);
    const a = {
      canvas: Li(this.context) ? void 0 : this.context,
      mouse: e,
      screen: {
        position: e.currentPosition
      },
      start: {
        position: s.projection.screenToView(e.start),
        view: s,
        views: n.map((o) => (o.d || (o.d = rr), {
          position: o.d.projection.screenToView(e.start),
          view: o.d
        }))
      },
      target: {
        position: i.projection.screenToView(
          e.currentPosition
        ),
        view: i,
        views: t.map((o) => (o.d || (o.d = rr), {
          position: o.d.projection.screenToView(e.currentPosition),
          view: o.d
        }))
      }
    };
    return this.currentInteraction = a, a;
  }
  /**
   * Make an interaction depicting the interactions with the touch
   */
  makeSingleTouchInteraction(e) {
    const t = e.currentPosition, i = this.getViewsUnderPosition(t);
    let n = i[0] && i[0].d;
    n || (n = rr);
    let s = e.startView;
    s || (s = rr);
    const a = {
      canvas: Li(this.context) ? void 0 : this.context,
      touch: e,
      screen: {
        position: t
      },
      start: {
        position: s.projection.screenToView(e.start),
        view: s,
        views: this.getViewsUnderPosition(e.start).map((o) => (o.d || (o.d = rr), {
          position: o.d.projection.screenToView(e.start),
          view: o.d
        }))
      },
      target: {
        position: n.projection.screenToView(t),
        view: n,
        views: i.map((o) => (o.d || (o.d = rr), {
          position: o.d.projection.screenToView(t),
          view: o.d
        }))
      }
    };
    return this.currentInteraction = a, a;
  }
  /**
   * This produces an object for handling several touches at once. It will store all of the combinations of touches
   * and their associative metrics into the lookup mapping provideds.
   */
  makeMultiTouchInteractions(e, t) {
    e.sort(Xs);
    const i = this.allTouchCombinations(e);
    for (let n = 0, s = i.length; n < s; ++n) {
      const a = i[n], o = a.map((l) => l.touch.identifier).join("_");
      let c = t.get(o);
      if (!c) {
        const l = this.getTouchCenter(a);
        c = {
          touches: a,
          averageSpreadDelta: 0,
          startCenter: l,
          currentCenter: l,
          currentRotation: this.getAverageAngle(a, l),
          centerDelta: [0, 0],
          rotationDelta: 0
        }, t.set(o, c);
      }
    }
  }
  /**
   * This updates all existing multitouch metrics with their new frame of data
   */
  updateMultiTouchInteractions(e, t) {
    e.sort(Xs);
    const i = this.allTouchCombinations(e);
    for (let n = 0, s = i.length; n < s; ++n) {
      const a = i[n], o = a.map((l) => l.touch.identifier).join("_"), c = t.get(o);
      if (c) {
        const l = this.getTouchCenter(a), u = this.getAverageAngle(a, l);
        c.centerDelta = Re(l, c.currentCenter), c.currentCenter = l, c.rotationDelta = u - c.currentRotation, c.currentRotation = u;
      }
    }
  }
  /**
   * This makes all of the possible combinations of touches.
   */
  allTouchCombinations(e) {
    const t = [], i = e.length, n = 1 << i;
    for (let s = 1; s < n; s++) {
      const a = [];
      for (let o = 0; o < i; o++)
        s & 1 << o && a.push(e[o]);
      t.push(a);
    }
    return t;
  }
  makeWheel(e) {
    if (!e)
      return {
        delta: [0, 0]
      };
    const t = Gu(e);
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
    delete this.quadTree, Li(this.context) || (this.context.onmousedown = null, this.context.onmousemove = null, this.context.onmouseleave = null);
    const e = this.context;
    e.onmousewheel && (e.onmousewheel = null), this.eventCleanup.forEach((t) => {
      this.context.removeEventListener(t[0], t[1]);
    });
  }
}
class Qu extends Zc {
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
    super(), this.preserveQueueMouse = [], this.singleQueueMouse = /* @__PURE__ */ new Map(), this.preserveQueueTouch = [], this.singleQueueTouch = /* @__PURE__ */ new Map(), this.preserveEvents = !1, this.handlers = new gs(e), this.preserveEvents = t;
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
class Lm {
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
const Fm = eo.immediate(0);
class Xr {
  constructor(e, t) {
    this._id = P(), this.animation = eo.immediate(0), this.animationEndTime = 0, this.offsetBroadcastTime = 0, this.scaleBroadcastTime = 0, this._offset = [0, 0, 0], this.startOffset = [0, 0, 0], this.startOffsetTime = 0, this.offsetEndTime = 0, this._scale = [1, 1, 1], this.startScale = [1, 1, 1], this.startScaleTime = 0, this.scaleEndTime = 0, this.needsBroadcast = !1, this.camera = e, t && (this._offset = Tt(t.offset || this._offset), this._scale = Tt(t.scale || this._scale));
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
    var o;
    const i = (o = this.surface) == null ? void 0 : o.getViewSize(e);
    if (!i) return;
    const n = [i.width / 2, i.height / 2, 0], s = qe(
      t,
      xs(n, this._scale)
    ), a = this.animation;
    this.setOffset(Tt(this.offset)), this.animation = Fm, this.setOffset(Pe(s, -1)), this.animation = a;
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
    this._id = e;
  }
  /**
   * Sets the location of the camera by adjusting the offsets to match.
   * Whatever is set for the "animation" property determines the animation.
   */
  setOffset(e) {
    this.startOffset = Tt(this.offset), this._offset = Tt(e), this.startOffsetTime = this.getCurrentTime(), this.offsetEndTime = this.startOffsetTime + this.animation.duration, this.updateEndTime(), this.onViewChange && (this.offsetBroadcastTime = this.startOffsetTime, this.needsBroadcast = !0);
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
    this.startScale = Tt(this.scale), this._scale = Tt(e), this.startScaleTime = this.getCurrentTime(), this.scaleEndTime = this.startScaleTime + this.animation.duration, this.updateEndTime(), this.onViewChange && (this.scaleBroadcastTime = this.startScaleTime, this.needsBroadcast = !0);
  }
  /**
   * Resolves all flags indicating updates needed.
   */
  resolve() {
    this.needsBroadcast = !1;
  }
  updateEndTime() {
    this.animationEndTime = Math.max(this.scaleEndTime, this.offsetEndTime);
  }
}
class ur extends Hr {
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
      type: jr.ORTHOGRAPHIC
    }), this.control2D = new Xr(this, e);
  }
}
class Bm extends Qu {
  constructor() {
    super({
      handleClick: async (e) => {
        var t, i;
        this.enablePicking(), await ((t = this.willRenderResolver) == null ? void 0 : t.promise), this.enablePicking(), await ((i = this.didRenderResolver) == null ? void 0 : i.promise), this.handleInteraction(e, (n, s) => {
          var a;
          (a = n.interactions) == null || a.handleMouseClick(s, e);
        });
      },
      handleTap: async (e) => {
        var t, i;
        this.enablePicking(), await ((t = this.willRenderResolver) == null ? void 0 : t.promise), this.enablePicking(), await ((i = this.didRenderResolver) == null ? void 0 : i.promise), e.touches.forEach((n) => {
          this.handleInteraction(n, (s, a) => {
            var o;
            (o = s.interactions) == null || o.handleTap(a, e, n);
          });
        });
      },
      handleDrag: async (e) => {
        var t;
        await ((t = this.willRenderResolver) == null ? void 0 : t.promise), this.handleInteraction(e, (i, n) => {
          var s;
          (s = i.interactions) == null || s.handleMouseDrag(n, e);
        });
      },
      handleMouseDown: async (e) => {
        var t;
        this.enablePicking(), await ((t = this.willRenderResolver) == null ? void 0 : t.promise), this.handleInteraction(
          e,
          (i, n) => {
            var s;
            return (s = i.interactions) == null ? void 0 : s.handleMouseDown(n, e);
          }
        );
      },
      handleTouchDown: async (e) => {
        var t;
        this.enablePicking(), await ((t = this.willRenderResolver) == null ? void 0 : t.promise), e.touches.forEach((i) => {
          this.handleInteraction(
            i,
            (n, s) => {
              var a;
              return (a = n.interactions) == null ? void 0 : a.handleTouchDown(s, e, i);
            }
          );
        });
      },
      handleMouseUp: async (e) => {
        var t;
        await ((t = this.willRenderResolver) == null ? void 0 : t.promise), this.handleInteraction(
          e,
          (i, n) => {
            var s;
            return (s = i.interactions) == null ? void 0 : s.handleMouseUp(n, e);
          }
        );
      },
      handleTouchUp: async (e) => {
        var t;
        await ((t = this.willRenderResolver) == null ? void 0 : t.promise), e.touches.forEach((i) => {
          this.handleInteraction(
            i,
            (n, s) => {
              var a;
              return (a = n.interactions) == null ? void 0 : a.handleTouchUp(s, e, i);
            }
          );
        });
      },
      handleMouseOut: async (e) => {
        var t;
        await ((t = this.willRenderResolver) == null ? void 0 : t.promise), this.isOver.forEach((i) => {
          this.handleView(
            i,
            (n, s) => {
              var a;
              return (a = n.interactions) == null ? void 0 : a.handleMouseOut(s, e);
            }
          );
        }), this.isOver.clear();
      },
      handleTouchOut: async (e) => {
        var t;
        await ((t = this.willRenderResolver) == null ? void 0 : t.promise), e.touches.forEach((i) => {
          ua(
            this.isTouchOver,
            i.touch.touch.identifier,
            /* @__PURE__ */ new Set()
          ).forEach((s) => {
            this.handleView(
              s,
              (a, o) => {
                var c;
                return (c = a.interactions) == null ? void 0 : c.handleTouchOut(o, e, i);
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
          (s, a) => {
            var o;
            return (o = s.interactions) == null ? void 0 : o.handleMouseMove(a, e);
          }
        ), i = /* @__PURE__ */ new Set();
        t.forEach((s) => i.add(s)), this.isOver.forEach((s) => {
          i.has(s) || this.handleView(
            s,
            (a, o) => {
              var c;
              return (c = a.interactions) == null ? void 0 : c.handleMouseOut(o, e);
            }
          );
        }), i.forEach((s) => {
          this.isOver.has(s) || this.handleView(
            s,
            (a, o) => {
              var c;
              return (c = a.interactions) == null ? void 0 : c.handleMouseOver(o, e);
            }
          );
        }), this.isOver = i;
      },
      /**
       * Touch dragging is essentially touch moving as it's the only way to make a touch glide across the screen
       */
      handleTouchDrag: async (e) => {
        var t;
        this.enablePicking(), await ((t = this.willRenderResolver) == null ? void 0 : t.promise), e.touches.forEach((i) => {
          const n = this.handleInteraction(
            i,
            (o, c) => {
              var l;
              return (l = o.interactions) == null ? void 0 : l.handleTouchMove(c, e, i);
            }
          ), s = /* @__PURE__ */ new Set();
          n.forEach((o) => s.add(o));
          const a = pi(
            this.isTouchOver,
            i.touch.touch.identifier,
            /* @__PURE__ */ new Set()
          );
          a.forEach((o) => {
            s.has(o) || this.handleView(
              o,
              (c, l) => {
                var u;
                return (u = c.interactions) == null ? void 0 : u.handleTouchOut(l, e, i);
              }
            );
          }), s.forEach((o) => {
            a.has(o) || this.handleView(
              o,
              (c, l) => {
                var u;
                return (u = c.interactions) == null ? void 0 : u.handleTouchOver(
                  l,
                  e,
                  i
                );
              }
            );
          }), this.isTouchOver.set(
            i.touch.touch.identifier,
            s
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
    for (let t = 0, i = this.scenes.length; t < i; ++t) {
      const n = this.scenes[t];
      for (let s = 0, a = n.layers.length; s < a; ++s)
        (e = n.layers[s].interactions) == null || delete e.colorPicking;
    }
    this.willRenderResolver && this.willRenderResolver.resolve(), this.willRenderResolver = new Ve(), this.dequeue();
  }
  /**
   * After rendering has completed, we release all handlers waiting for
   * completion.
   */
  async didRender() {
    this.didRenderResolver && this.didRenderResolver.resolve(), this.didRenderResolver = new Ve();
  }
  getSceneViewsUnderMouse(e) {
    const t = /* @__PURE__ */ new Map();
    for (let i = 0, n = this.scenes.length; i < n; ++i) {
      const s = this.scenes[i];
      for (let a = 0, o = s.views.length; a < o; ++a) {
        const c = s.views[a];
        t.set(c.id, c);
      }
    }
    return e.target.views.map((i) => t.get(i.view.id)).filter(oe);
  }
  handleInteraction(e, t) {
    const i = this.getSceneViewsUnderMouse(e);
    for (let n = 0, s = i.length; n < s; ++n) {
      const a = i[n];
      this.handleView(a, t);
    }
    return i;
  }
  handleView(e, t) {
    for (let i = 0, n = e.scene.layers.length; i < n; ++i) {
      const s = e.scene.layers[i];
      s.picking && s.picking.type !== Y.NONE && t(s, e);
    }
  }
}
class Pm {
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
class Dm extends Pm {
  /**
   * For es 3.0 shaders:
   *   - we make sure all varying is converted to outs.
   *   - texture2D sampling is now texture
   * For es 2.0 shaders:
   *   - we make sure the version header is removed
   *   - Ensure out's are changed to varying
   */
  vertex(e) {
    let t = ls(e);
    return N.SHADERS_3_0 ? (t = t.replace(/\s+varying\s+/g, `
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
    let t = ls(e);
    if (N.SHADERS_3_0) {
      if (t = t.replace(/\s+varying\s+/g, `
in `), t = t.replace(/(texture2D(\s+)\(|texture2D\()/g, "texture("), t.match(/gl_FragColor/g) && (t = t.replace(/gl_FragColor/g, "_FragColor"), !t.match("out vec4 _FragColor"))) {
        const i = t.split(`
`);
        i.splice(3, 0, "layout(location = 0) out vec4 _FragColor;"), t = i.join(`
`);
      }
    } else
      t = t.replace(/^#version 300 es/g, ""), t = t.replace(/\s+in\s+/g, `
varying `);
    return t;
  }
}
function Um(r, e, t, i, n) {
  const s = {
    view: r,
    allColors: [],
    colorData: t,
    dataHeight: n,
    dataWidth: i,
    mouse: e,
    nearestColor: 0,
    nearestColorBytes: [0, 0, 0, 0]
  }, a = /* @__PURE__ */ new Map();
  let o = 0;
  const c = i / 2, l = n / 2;
  let u = 0, h = [0, 0, 0, 0], d = Number.MAX_SAFE_INTEGER;
  for (let p = 0; p < n; ++p) {
    const g = [];
    for (let m = 0; m < i; ++m) {
      const T = t[o], x = t[o + 1], b = t[o + 2];
      o += 4;
      const v = T << 16 | x << 8 | b;
      if (a.set(v, !0), g.push(v), v !== 0) {
        const E = m - c, y = p - l, C = E * E + y * y;
        C < d && (d = C, u = v, h = [T, x, b, 255]);
      }
    }
  }
  return s.allColors = Array.from(a.keys()), s.nearestColor = u, s.nearestColorBytes = h, s;
}
class km {
  constructor(e) {
    this.pickingRenderTargets = /* @__PURE__ */ new Map(), this.surface = e.surface;
  }
  analyzePickedPixels(e, t) {
    if (t.optimizeRendering)
      return;
    const i = ms(
      // Our location is relative to the screen, so we must scale it by the
      // surface's pixel ratio to match the actual pixel space of the original
      // screen dimensions
      Ie(e, this.surface.pixelRatio),
      // We then have to scale down the location based on the scaling of the
      // view relative to the view's scaling relative to the screen.
      t.projection.screenScale
    ), n = 5, s = 5, a = 4, o = new Uint8Array(n * s * a);
    this.surface.renderer.readPixels(
      Math.min(
        Math.max(0, Math.floor(i[0] - n / 2)),
        t.getRenderTargets()[0].width
      ),
      Math.min(
        Math.max(0, Math.floor(i[1] - s / 2)),
        t.getRenderTargets()[0].height
      ),
      n,
      s,
      o
    );
    const c = Um(
      t,
      [i[0] - t.screenBounds.x, i[1] - t.screenBounds.y],
      o,
      n,
      s
    );
    for (let l = 0, u = t.scene.layers.length; l < u; ++l) {
      const h = t.scene.layers[l];
      h.picking.type === Y.SINGLE && (h.interactions.colorPicking = c);
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
    const t = e.screen.position, i = e.target.views.map((s) => s.view), n = /* @__PURE__ */ new Set();
    this.pickingRenderTargets.forEach((s, a) => {
      const o = s.getBuffers()[0].buffer;
      o instanceof j && (!o.gl || o.destroyed) && (s.dispose(), n.add(a));
    }), n.forEach((s) => this.pickingRenderTargets.delete(s)), i.forEach((s) => {
      let a = this.pickingRenderTargets.get(s);
      if (a || s.getRenderTargets().forEach((l) => {
        l.gl && l.getBuffers().forEach((u) => {
          if (u.outputType === V.PICKING) {
            if (u.buffer instanceof j && u.buffer.generateMipMaps && Ce("decode-picking-error", () => {
              console.warn(
                "The Texture you provided as the target for color picking has generateMipMaps enabled. This can cause accuracy issues and may make your picking experience poor."
              );
            }), a = new si({
              buffers: {
                color: u
              }
            }), a.width === 0 || a.height === 0) {
              a = void 0;
              return;
            }
            this.pickingRenderTargets.set(s, a);
          }
        });
      }), !a) return;
      const o = this.surface.renderer.state.currentRenderTarget;
      let c = !1;
      o ? (Array.isArray(o) || o.getBuffers()[0].buffer !== a.getBuffers()[0].buffer) && (c = !0) : c = !0, c && this.surface.renderer.setRenderTarget(a), this.analyzePickedPixels(t, s);
    });
  }
}
const Gm = () => [
  // Basic expansion to handle writing attributes and uniforms to the shader
  new Kg(),
  // Expansion to write in the active attribute handler. Any expansion injected AFTER
  // this expander will have it's processes canceled out for the destructuring portion
  // of the expansion when an instance is not active (if the instance has an
  // active
  // attribute).
  new rm(),
  // Expansion to handle easing IO attributes and write AutoEasingMethods to the
  // shaders
  new Hg()
], zm = () => [
  {
    type: ce.COLOR_BUFFER,
    manager: new md()
  },
  {
    type: ce.TEXTURE,
    manager: new Ig()
  },
  {
    type: ce.ATLAS,
    manager: new Ag({})
  },
  {
    type: ce.FONT,
    manager: new bg()
  }
], Vm = () => [
  // Transform that handles odds and ends of 3.0 and 2.0 inconsistencies and
  // attempts tp unify them as best as possible depending on the current
  // system's operating mode.
  new Dm()
], $m = [0, 0, 0, 0];
function Qs(r, e) {
  return (r.order || Number.MAX_SAFE_INTEGER) - (e.order || Number.MAX_SAFE_INTEGER);
}
class Wm {
  constructor(e) {
    this.commands = new km({ surface: this }), this.frameMetrics = {
      currentFrame: 0,
      currentTime: Date.now() | 0,
      frameDuration: 1e3 / 60,
      previousTime: Date.now() | 0
    }, this.isBufferingResources = !1, this.ioExpanders = [], this.shaderTransforms = [], this.optimizedOutputs = /* @__PURE__ */ new Set(), this.ioSorting = new Lm(), this.pixelRatio = window.devicePixelRatio, this.enabledOptimizedOutputs = /* @__PURE__ */ new Set(), this.viewDrawDependencies = /* @__PURE__ */ new Map(), this.pipelineLoadContext = 0, this.resourceDiffs = new cs({
      buildItem: async (t) => (await this.resourceManager.initResource(t), {
        id: t.key
      }),
      destroyItem: async (t, i) => (await this.resourceManager.destroyResource(t), !0),
      updateItem: async (t, i) => {
        await this.resourceManager.updateResource(t);
      }
    }), this.sceneDiffs = new cs({
      buildItem: async (t) => new us(this, {
        key: t.key,
        views: t.views,
        layers: t.layers
      }),
      destroyItem: async (t, i) => (i.destroy(), !0),
      updateItem: async (t, i) => {
        await i.update(t);
      }
    }), this.readyResolver = new Ve(), this.ready = this.readyResolver.promise, e && this.init(e);
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
    for (let t = 0, i = this.userInputManager.eventManagers.length; t < i; ++t) {
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
    const t = this.frameMetrics.currentTime, i = this.sceneDiffs.items;
    i.sort(Qs);
    const n = {};
    for (let a = 0, o = i.length; a < o; ++a) {
      const c = i[a], l = c.renderViews, u = c.layers;
      l.sort(Qs), u.sort(Qs);
      for (let h = 0, d = l.length; h < d; ++h) {
        const p = l[h], g = {};
        if (!p.shouldDrawView(this.frameMetrics))
          continue;
        u.length > 0 && p.willUseView();
        const m = this.renderer.getRenderSize();
        let T = new te({
          width: m[0],
          height: m[1],
          x: 0,
          y: 0
        });
        if (p.renderTarget) {
          const E = (Array.isArray(p.renderTarget) ? p.renderTarget[0] : p.renderTarget).getSize();
          T = new te({
            width: E[0],
            height: E[1],
            x: 0,
            y: 0
          });
        }
        const x = Wo(
          p.props.viewport,
          T,
          this.pixelRatio
        );
        p.fitViewtoViewport(T, x);
        for (let v = 0, E = u.length; v < E; ++v) {
          const y = u[v];
          y.view = p;
          try {
            y.draw(), g[y.id] = y, p.animationEndTime = Math.max(
              p.animationEndTime,
              y.animationEndTime,
              p.props.camera.animationEndTime
            ), y.lastFrameTime = t;
          } catch (C) {
            C instanceof Error && (n[y.id] || (n[y.id] = [y, C]));
          }
        }
        const b = Object.values(g);
        u.length !== b.length && c.layerDiffs.diff(b.map((v) => v.initializer)), c.container && (e && e(!0, c, p), p.previousProps = p.props);
      }
    }
    const s = Object.values(n);
    this.printLayerErrors(s);
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
      for (let t = 0, i = this.sceneDiffs.items.length; t < i; ++t) {
        const n = this.sceneDiffs.items[t];
        n.clearCaches();
        for (let s = 0, a = n.renderViews.length; s < a; ++s) {
          const o = n.renderViews[s];
          o.props.camera.broadcast(o.id);
        }
      }
      if (await this.commit((t, i, n) => {
        i.container && t && this.drawSceneView(i.container, n);
      }), this.userInputManager.waitingForRender && (this.userInputManager.waitingForRender = !1), !this.isBufferingResources) {
        this.isBufferingResources = !0;
        const t = await this.resourceManager.dequeueRequests();
        this.isBufferingResources = !1, t && this.draw(await lr());
      }
      for (let t = 0, i = this.sceneDiffs.items.length; t < i; ++t) {
        const n = this.sceneDiffs.items[t];
        for (let s = 0, a = n.renderViews.length; s < a; ++s) {
          const o = n.renderViews[s];
          o.needsDraw = !1, o.props.camera.resolve();
        }
        for (let s = 0, a = n.layers.length; s < a; ++s) {
          const o = n.layers[s];
          o.needsViewDrawn = !1;
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
  drawSceneView(e, t, i, n) {
    i = i || this.renderer;
    const s = { x: t.viewBounds.left, y: t.viewBounds.top }, a = t.viewBounds, o = t.props.background || $m, c = t.clearFlags.indexOf(xt.COLOR) > -1, l = n || t.renderTarget || null;
    t.renderTarget && (t.getRenderTargets().forEach(
      (h) => this.optimizedOutputs.forEach(
        (d) => h.disabledTargets.add(d)
      )
    ), this.enabledOptimizedOutputs.size > 0 && t.getRenderTargets().forEach(
      (d) => this.enabledOptimizedOutputs.forEach(
        (p) => d.disabledTargets.delete(p)
      )
    )), i.setRenderTarget(l), i.setScissor(
      {
        x: s.x,
        y: s.y,
        width: a.width,
        height: a.height
      },
      l
    ), c && i.clearColor([
      o[0],
      o[1],
      o[2],
      o[3]
    ]), i.setViewport({
      x: s.x,
      y: s.y,
      width: a.width,
      height: a.height
    }), t.clearFlags && t.clearFlags.length > 0 ? i.clear(
      c,
      t.clearFlags.indexOf(xt.DEPTH) > -1,
      t.clearFlags.indexOf(xt.STENCIL) > -1
    ) : i.clear(!1), i.render(e, l, t, t.props.glState), t.lastFrameTime = this.frameMetrics.currentTime;
  }
  /**
   * This must be executed when the canvas changes size so that we can
   * re-calculate the scenes and views dimensions for handling all of our
   * rendered elements.
   */
  fitContainer(e) {
    if (!this.context || Li(this.context.canvas)) return;
    const t = this.context.canvas.parentElement;
    if (t) {
      const i = this.context.canvas;
      i.className = "", i.setAttribute("style", ""), t.style.position = "relative", i.style.position = "absolute", i.style.left = "0xp", i.style.top = "0xp", i.style.width = "100%", i.style.height = "100%", i.setAttribute("width", ""), i.setAttribute("height", "");
      const n = t.getBoundingClientRect(), s = i.getBoundingClientRect();
      this.resize(s.width || 100, n.height || 100);
    }
  }
  /**
   * This gathers all the overlap views of every view
   */
  updateViewDimensions() {
    if (!this.sceneDiffs) return;
    this.viewDrawDependencies.clear();
    const e = this.sceneDiffs.items, t = this.renderer.getRenderSize();
    for (let i = 0, n = e.length; i < n; i++) {
      const s = e[i];
      for (let a = 0, o = s.renderViews.length; a < o; ++a) {
        const c = s.renderViews[a];
        c.willUseView();
        let l = new te({
          width: t[0],
          height: t[1],
          x: 0,
          y: 0
        });
        if (c.renderTarget) {
          const d = (Array.isArray(c.renderTarget) ? c.renderTarget[0] : c.renderTarget).getSize();
          l = new te({
            width: d[0],
            height: d[1],
            x: 0,
            y: 0
          });
        }
        const u = Wo(
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
    for (let t = 0, i = this.sceneDiffs.items.length; t < i; ++t) {
      const s = this.sceneDiffs.items[t].viewDiffs.getByKey(e);
      if (s)
        return s.renderTarget ? s.viewBounds : s.screenBounds;
    }
    return null;
  }
  /**
   * This queries a view's window into a world's space.
   */
  getViewWorldBounds(e) {
    for (let t = 0, i = this.sceneDiffs.items.length; t < i; ++t) {
      const s = this.sceneDiffs.items[t].viewDiffs.getByKey(e);
      if (s)
        if (s.screenBounds) {
          const a = s.projection.viewToWorld([0, 0]), o = s.projection.screenToWorld([
            s.screenBounds.right,
            s.screenBounds.bottom
          ]);
          return new te({
            bottom: o[1],
            left: a[0],
            right: o[0],
            top: a[1]
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
    for (let t = 0, i = this.sceneDiffs.items.length; t < i; ++t) {
      const s = this.sceneDiffs.items[t].viewDiffs.getByKey(e);
      if (s) return s.projection;
    }
    return null;
  }
  /**
   * This is the beginning of the system. This should be called immediately
   * after the surface is constructed. We make this mandatory outside of the
   * constructor so we can make it follow an async pattern.
   */
  async init(e) {
    var i;
    if (this.context) return this;
    this.pixelRatio = e.pixelRatio || this.pixelRatio, this.pixelRatio < 1 && (this.pixelRatio = 1);
    const t = this.initGL(e);
    return t ? (this.context = t, this.gl ? ((i = e.optimizedOutputTargets) == null || i.forEach(
      (n) => this.optimizedOutputs.add(n)
    ), this.initUserInputManager(e), await this.initResources(e), await this.initIOExpanders(e), await this.initShaderTransforms(e)) : console.warn(
      "Could not establish a GL context. Layer Surface will be unable to render"
    ), this.readyResolver.resolve(this), this) : (this.readyResolver.reject({
      error: el.NO_WEBGL_CONTEXT,
      message: "Could not establish a webgl context. Surface is being destroyed to free resources."
    }), this.destroy(), this);
  }
  /**
   * This initializes the Canvas GL contexts needed for rendering.
   */
  initGL(e) {
    const t = e.context;
    if (!t) return null;
    const i = t.width, n = t.height;
    let s = !0;
    const a = Object.assign(
      {
        alpha: !1,
        antialias: !1,
        preserveDrawingBuffer: !1,
        premultiplyAlpha: !1
      },
      e.rendererOptions
    );
    return this.renderer = new cd({
      // Context supports rendering to an alpha canvas only if the background
      // color has a transparent Alpha value.
      alpha: a.alpha,
      // Yes to antialias! Make it preeeeetty!
      antialias: a.antialias,
      // Make the GL use an existing canvas rather than generate another
      canvas: t,
      // If it's true it allows us to snapshot the rendering in the canvas
      // But we dont' always want it as it makes performance drop a bit.
      preserveDrawingBuffer: a.preserveDrawingBuffer,
      // This indicates if the information written to the canvas is going to be
      // written as premultiplied values or if they will be standard rgba
      // values. Helps with compositing with the DOM.
      premultipliedAlpha: a.premultipliedAlpha,
      // Let's us know if there is no valid webgl context to work with or not
      onNoContext: () => {
        s = !1;
      }
    }), !s || !this.renderer.gl ? null : (this.context = this.renderer.gl, this.resourceManager && this.resourceManager.setWebGLRenderer(this.renderer), this.setRendererSize(i, n), this.renderer.setPixelRatio(this.pixelRatio), this.renderer.gl);
  }
  /**
   * Initializes the expanders that should be applied to the surface for layer
   * processing.
   */
  initIOExpanders(e) {
    const t = Gm();
    Array.isArray(e.ioExpansion) || e.ioExpansion === void 0 ? this.ioExpanders = e.ioExpansion && e.ioExpansion.slice(0) || t.slice(0) || [] : e.ioExpansion instanceof Function && (this.ioExpanders = e.ioExpansion(t));
    const i = this.resourceManager.getIOExpansion();
    this.ioExpanders = this.ioExpanders.concat(i);
  }
  /**
   * Initializes the shader transforms that will be applied to every shader
   * rendered with this surface.
   */
  initShaderTransforms(e) {
    const t = Vm();
    Array.isArray(e.shaderTransforms) || e.shaderTransforms === void 0 ? this.shaderTransforms = e.shaderTransforms && e.shaderTransforms.slice(0) || t.slice(0) || [] : e.shaderTransforms instanceof Function && (this.shaderTransforms = e.shaderTransforms(t));
  }
  /**
   * Initializes elements for handling mouse interactions with the canvas.
   */
  initUserInputManager(e) {
    if (!this.context) return;
    const t = [new Bm()].concat(e.eventManagers || []);
    this.userInputManager = new Om(
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
    const t = zm();
    this.resourceManager = new Wu(), this.resourceManager.setWebGLRenderer(this.renderer), (e.resourceManagers && e.resourceManagers.slice(0) || t.slice(0) || []).forEach((n) => {
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
    await lr(), this.pipelineLoadContext === t && (e.resources && await this.resourceDiffs.diff(e.resources), e.scenes && await this.sceneDiffs.diff(e.scenes), this.updateViewDimensions());
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
        const i = t[1].stack || t[1].message;
        if (console.error(i), i.indexOf("RangeError") > -1 || i.indexOf("Source is too large") > -1) {
          const n = t[0], s = n.bufferManager.changeListContext || [];
          let a, o = 0;
          for (let c = 0, l = s.length; c < l; ++c) {
            const [u] = s[c];
            n.shaderIOInfo.instanceAttributes.forEach((h) => {
              h.update(u).length !== h.size && (a || (a = [
                "Example instance returned the wrong sized value for an attribute:",
                u,
                h
              ]), o++);
            });
          }
          a && (console.error(
            "The following output shows discovered issues related to the specified error"
          ), console.error(
            `Instances are returning too large IO for an attribute
`,
            a[0],
            a[1],
            a[2],
            "Total errors for too large IO values",
            o
          ));
        }
      }
    }));
  }
  /**
   * This resizes the canvas and retains pixel ratios amongst all of the
   * resources involved.
   */
  resize(e, t, i) {
    if (this.pixelRatio = i || this.pixelRatio, this.pixelRatio < 1 && (this.pixelRatio = 1), this.setRendererSize(e, t), this.renderer.setPixelRatio(this.pixelRatio), this.userInputManager.resize(), this.resourceManager.resize(), this.sceneDiffs) {
      const n = this.sceneDiffs.items;
      for (let s = 0, a = n.length; s < a; ++s) {
        const o = n[s];
        for (let c = 0, l = o.renderViews.length; c < l; ++c) {
          const u = o.renderViews[c];
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
      const i = this.sceneDiffs.items[e];
      for (let n = 0, s = i.renderViews.length; n < s; ++n) {
        const a = i.renderViews[n];
        a.needsDraw = !0;
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
const vo = class vo extends Xt {
  draw() {
    this.props.commands(this.surface);
  }
  /** The layer renders nothing, thus does not need a shader object */
  initShader() {
    return null;
  }
};
vo.defaultProps = {
  data: new le(),
  key: "",
  commands: () => {
  }
};
let va = vo;
class De extends Xt {
  constructor(e, t, i) {
    super(e, t, i);
  }
  /**
   * Force the world2D methods as the base methods
   */
  baseShaderModules(e) {
    const t = super.baseShaderModules(e);
    return t.vs.push("world2D"), t;
  }
}
const Yu = `// These are projection methods utilizing the simpler camera 2d approach.
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
`, jm = `
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
ve.register([
  {
    moduleId: "world2D",
    description: jm,
    content: Yu,
    compatibility: A.ALL,
    uniforms: (r) => r instanceof De ? [
      // This injects the projection matrix from the view camera
      {
        name: "projection",
        size: _.MATRIX4,
        update: () => r.view.props.camera.projection
      },
      // This injects the model view matrix from the view camera
      {
        name: "view",
        size: _.MATRIX4,
        update: () => r.view.props.camera.view
      },
      {
        name: "viewProjection",
        size: _.MATRIX4,
        update: () => r.view.props.camera.viewProjection
      },
      // This injects a 2D camera's offset
      {
        name: "cameraOffset",
        size: _.THREE,
        update: () => r.view.props.camera instanceof ur ? r.view.props.camera.control2D.offset : [0, 0, 0]
      },
      // This injects the camera's current position
      {
        name: "cameraPosition",
        size: _.THREE,
        update: () => r.view.props.camera.position
      },
      // This injects the camera's current scale
      {
        name: "cameraScale",
        size: _.THREE,
        update: () => r.view.props.camera.scale
      },
      // This injects the camera's 2D current scale
      {
        name: "cameraScale2D",
        size: _.THREE,
        update: () => r.view.props.camera instanceof ur ? r.view.props.camera.scale2D : [1, 1, 1]
      },
      // This injects the camera's Euler rotation
      {
        name: "cameraRotation",
        size: _.THREE,
        update: () => r.view.props.camera.scale
      },
      // This injects the pixel width and height of the view
      {
        name: "viewSize",
        size: _.TWO,
        update: () => [
          r.view.viewBounds.width,
          r.view.viewBounds.height
        ]
      },
      // This injects the current layer's pixel ratio so pixel ratio dependent
      // items can react to it Things like gl_PointSize will need this metric
      // if not working in clip space
      {
        name: "pixelRatio",
        size: _.ONE,
        update: () => [r.view.pixelRatio]
      }
    ] : (console.warn(
      "A shader requested the module world2D; however, the layer the shader comes from is NOT a Layer2D which is",
      "required for the module to work."
    ), [])
  }
]);
var L = /* @__PURE__ */ ((r) => (r[r.BottomLeft = 0] = "BottomLeft", r[r.BottomMiddle = 1] = "BottomMiddle", r[r.BottomRight = 2] = "BottomRight", r[r.Custom = 3] = "Custom", r[r.Middle = 4] = "Middle", r[r.MiddleLeft = 5] = "MiddleLeft", r[r.MiddleRight = 6] = "MiddleRight", r[r.TopLeft = 7] = "TopLeft", r[r.TopMiddle = 8] = "TopMiddle", r[r.TopRight = 9] = "TopRight", r))(L || {}), ar = /* @__PURE__ */ ((r) => (r[r.ALWAYS = 1] = "ALWAYS", r[r.BOUND_MAX = 2] = "BOUND_MAX", r[r.NEVER = 3] = "NEVER", r))(ar || {}), Hm = /* @__PURE__ */ ((r) => (r[r.TOP_LEFT = 0] = "TOP_LEFT", r[r.TOP_MIDDLE = 1] = "TOP_MIDDLE", r[r.TOP_RIGHT = 2] = "TOP_RIGHT", r[r.MIDDLE_LEFT = 3] = "MIDDLE_LEFT", r[r.MIDDLE = 4] = "MIDDLE", r[r.MIDDLE_RIGHT = 5] = "MIDDLE_RIGHT", r[r.BOTTOM_LEFT = 6] = "BOTTOM_LEFT", r[r.BOTTOM_MIDDLE = 7] = "BOTTOM_MIDDLE", r[r.BOTTOM_RIGHT = 8] = "BOTTOM_RIGHT", r))(Hm || {});
class Xm extends gs {
  constructor(e) {
    super({}), this._uid = P(), this.isPanning = !1, this.isScaling = !1, this.panFilter = (t, i, n) => t, this.scaleFactor = 1e3, this.pinchScaleFactor = 100, this.scaleFilter = (t, i, n, s) => t, this.startViews = [], this.optimizedViews = /* @__PURE__ */ new Set(), this.cameraImmediateAnimation = eo.immediate(0), this.targetTouches = /* @__PURE__ */ new Set(), this.onRangeChanged = (t, i) => {
    }, this.startViewDidStart = !1, this.disabled = !1, this.disableDragPanning = !1, this.applyBounds = () => {
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
        Va(this.camera.control2D.getScale(), this.bounds.scaleMin)
      ), this.bounds.scaleMax && this.camera.control2D.setScale(
        $a(this.camera.control2D.getScale(), this.bounds.scaleMax)
      ));
    }, this.handleCameraViewChange = (t, i) => {
      if (i !== this.startViews[0]) return;
      const n = this.surface.getProjections(i);
      n && this.onRangeChanged(t, n);
    }, e.bounds && this.setBounds(e.bounds), this._camera = e.camera, this.scaleFactor = e.scaleFactor || this.scaleFactor, this.pinchScaleFactor = e.pinchScaleFactor || this.pinchScaleFactor, this.ignoreCoverViews = e.ignoreCoverViews || !1, this.twoFingerPan = e.twoFingerPan || !1, e.startView && (Array.isArray(e.startView) ? (this.startViews = e.startView, this._camera.control2D.setViewChangeHandler(
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
    const i = e.projection.worldToScreen([
      t.worldBounds.left,
      t.worldBounds.top
    ]), n = e.projection.worldToScreen([
      t.worldBounds.right,
      t.worldBounds.bottom
    ]);
    return n[0] - i[0] + t.screenPadding.left + t.screenPadding.right - e.screenBounds.width < 0 ? this.anchoredByBoundsHorizontal(e, t) : n[0] < e.screenBounds.right - t.screenPadding.right ? -t.worldBounds.right + (e.screenBounds.width - t.screenPadding.right) / this.camera.control2D.getScale()[0] : i[0] > e.screenBounds.left + t.screenPadding.left ? -t.worldBounds.left + t.screenPadding.left / this.camera.control2D.getScale()[0] : this.camera.control2D.getOffset()[0];
  }
  /**
   * Returns offset on y-axis due to current bounds and anchor.
   */
  boundsVerticalOffset(e, t) {
    const i = e.projection.worldToScreen([
      t.worldBounds.left,
      t.worldBounds.top
    ]), n = e.projection.worldToScreen([
      t.worldBounds.right,
      t.worldBounds.bottom
    ]);
    return n[1] - i[1] + t.screenPadding.top + t.screenPadding.bottom - e.screenBounds.height < 0 ? this.anchoredByBoundsVertical(e, t) : n[1] < e.screenBounds.bottom - t.screenPadding.bottom ? -t.worldBounds.bottom + (e.screenBounds.height - t.screenPadding.bottom) / this.camera.control2D.getScale()[1] : i[1] > e.screenBounds.top + t.screenPadding.top ? -t.worldBounds.top + t.screenPadding.top / this.camera.control2D.getScale()[0] : this.camera.control2D.getOffset()[1];
  }
  /**
   * Computes if all conditions are met for this controller to begin modifying
   * the current camera state.
   */
  canStart(e) {
    return this.disabled ? !1 : this.startViews.length === 0 || this.startViews && this.startViews.indexOf(e) > -1 || this.startViewDidStart && this.ignoreCoverViews;
  }
  /**
   * Centers the camera on a position. Must provide a reference view.
   */
  centerOn(e, t) {
    if (!this.camera.control2D.surface) return;
    const i = this.camera.control2D.surface.getViewSize(e);
    if (!i) return;
    const n = [i.width / 2, i.height / 2, 0], s = qe(
      t,
      xs(n, this.camera.control2D.getScale())
    ), a = Pe(s, -1);
    this.setOffset(e, a);
  }
  /**
   * Performs the panning operation for the camera
   *
   * @param allViews This is all of the related views under the event interactions
   * @param relativeView This is the view that performs the projections related to the operation
   * @param allViews All the views associated with the operation or event interaction
   * @param delta This is the amount of panning being requested to happen
   */
  doPan(e, t, i) {
    let n = di(ms(i, this.camera.control2D.getScale()), 0);
    this.panFilter && (n = this.panFilter(n, t, e)), this.camera.control2D.getOffset()[0] += n[0], this.camera.control2D.getOffset()[1] += n[1], this.applyBounds(), this.onRangeChanged(this.camera, t.projection), this.applyBounds();
  }
  /**
   * Scales the camera relative to a point and a view.
   *
   * @param focalPoint The point the scaling happens around
   * @param targetView The relative view this operation happens in relation to
   * @param deltaScale The amount of scaling per axis that should happen
   */
  doScale(e, t, i, n, s) {
    const a = t.projection.screenToWorld(e), o = this.camera.control2D.getScale()[0] || 1, c = this.camera.control2D.getScale()[1] || 1;
    this.scaleFilter && (n = this.scaleFilter(n, t, i, s)), this.camera.control2D.getScale()[0] = o + n[0], this.camera.control2D.getScale()[1] = c + n[1], this.applyScaleBounds();
    const l = t.projection.screenToWorld(e), u = Re(a, l);
    this.camera.control2D.getOffset()[0] -= u[0], this.camera.control2D.getOffset()[1] -= u[1], this.applyBounds(), this.onRangeChanged(this.camera, t.projection), this.applyBounds(), this.camera.control2D.animation = this.cameraImmediateAnimation;
  }
  /**
   * This filters a set of touches to be touches that had a valid starting view interaction.
   */
  filterTouchesByValidStart(e) {
    return this.ignoreCoverViews ? e.filter(Ah(this.startViews)) : e.filter(_h(this.startViews));
  }
  /**
   * Finds a view within the event that matches a start view even if the view is covered by other views at the event's
   * interaction point.
   */
  findCoveredStartView(e) {
    const t = e.target.views.find(
      (i) => this.startViews.indexOf(i.view.id) > -1
    );
    this.startViewDidStart = !!t, t && (this.coveredStartView = t.view);
  }
  /**
   * Evaluates the world bounds the specified view is observing
   *
   * @param viewId The id of the view when the view was generated when the surface was made
   */
  getRange(e) {
    const t = this.getProjection(e), i = this.getViewScreenBounds(e);
    if (t && i) {
      const n = t.screenToWorld([
        i.x,
        i.y
      ]), s = t.screenToWorld([
        i.right,
        i.bottom
      ]);
      return new te({
        height: s[1] - n[1],
        width: s[0] - n[0],
        x: n[0],
        y: n[1]
      });
    }
    return new te({ x: 0, y: 0, width: 1, height: 1 });
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
      for (let i = 0, n = t.length; i < n; ++i) {
        const s = t[i];
        this.targetTouches.add(s.touch.touch.identifier);
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
      this.targetTouches.delete(t.touch.touch.identifier), this.targetTouches.size <= 0 && (this.startViewDidStart = !1, this.isPanning = !1, this.optimizedViews.forEach((i) => i.optimizeRendering = !1), this.optimizedViews.clear());
    }), this.isPanning = !1, this.isScaling = !1, this.targetTouches.size > 0 && (this.isPanning = !0), this.targetTouches.size > 1 && (this.isScaling = !0);
  }
  /**
   * Used to stop panning and scaling effects when touches are forcibly ejected from existence.
   */
  handleTouchCancelled(e) {
    e.touches.forEach((t) => {
      this.targetTouches.delete(t.touch.touch.identifier), this.targetTouches.size <= 0 && (this.startViewDidStart = !1, this.isPanning = !1, this.optimizedViews.forEach((i) => i.optimizeRendering = !1), this.optimizedViews.clear());
    }), this.isPanning = !1, this.isScaling = !1, this.targetTouches.size > 0 && (this.isPanning = !0), this.targetTouches.size > 1 && (this.isScaling = !0);
  }
  /**
   * Applies a panning effect by adjusting the camera's offset.
   */
  handleDrag(e) {
    if (e.start && this.canStart(e.start.view.id)) {
      if (this.disableDragPanning)
        return;
      e.target.views.forEach((t) => {
        t.view.optimizeRendering = !0, this.optimizedViews.add(t.view);
      }), this.doPan(
        e.target.views.map((t) => t.view),
        e.start.view,
        e.mouse.deltaPosition
      ), this.camera.control2D.animation = this.cameraImmediateAnimation;
    }
  }
  /**
   * Applies panning effect from single or multitouch interaction.
   */
  handleTouchDrag(e) {
    const t = this.filterTouchesByValidStart(e.allTouches);
    if (t.length > 0 && this.isPanning) {
      for (let a = 0, o = t.length; a < o; ++a)
        t[a].target.views.forEach((l) => {
          l.view.optimizeRendering = !0, this.optimizedViews.add(l.view);
        });
      const i = /* @__PURE__ */ new Set(), s = t.reduce((a, o) => {
        for (let c = 0, l = o.target.views.length; c < l; ++c) {
          const u = o.target.views[c];
          i.add(u.view);
        }
        return o.touch.startTime < a.touch.startTime ? o : a;
      }, t[0]).start.view;
      if (this.isPanning) {
        if (this.disableDragPanning)
          return;
        this.doPan(
          Array.from(i.values()),
          s,
          e.multitouch.centerDelta(t)
        ), this.camera.control2D.animation = this.cameraImmediateAnimation;
      }
      if (this.isScaling) {
        const a = e.multitouch.center(t), o = Re(
          t[0].touch.currentPosition,
          a
        ), c = Re(
          a,
          e.multitouch.centerDelta(t)
        ), l = Re(
          t[0].touch.previousPosition,
          c
        ), u = gi(o) / gi(l), h = [
          u * this.camera.scale2D[0] - this.camera.scale2D[0],
          u * this.camera.scale2D[1] - this.camera.scale2D[1],
          0
        ];
        u !== 1 && this.doScale(
          a,
          s,
          Array.from(i.values()),
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
      if (this.wheelShouldScroll && !e.mouse.event.ctrlKey) {
        const t = [
          -e.mouse.wheel.delta[0],
          e.mouse.wheel.delta[1]
        ];
        e.start && this.doPan(
          e.target.views.map((i) => i.view),
          e.start.view,
          t
        );
      } else {
        const t = this.camera.control2D.getScale()[0] || 1, i = this.camera.control2D.getScale()[1] || 1, n = this.getTargetView(e), s = this.wheelShouldScroll ? this.pinchScaleFactor : this.scaleFactor, a = [
          e.mouse.wheel.delta[1] / s * t,
          e.mouse.wheel.delta[1] / s * i,
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
          a,
          this.wheelShouldScroll
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
    const i = Tt(this.camera.control2D.offset);
    if (this.camera.control2D.getOffset()[0] = t[0], this.camera.control2D.getOffset()[1] = t[1], this.camera.control2D.getOffset()[2] = t[2], this.applyBounds(), this.camera.control2D.surface) {
      const a = this.camera.control2D.surface.getProjections(e);
      a && this.onRangeChanged(this.camera, a);
    }
    this.applyBounds();
    const n = Tt(this.camera.control2D.getOffset()), s = this.camera.control2D.animation;
    this.camera.control2D.setOffset(i), this.camera.control2D.animation = this.cameraImmediateAnimation, this.camera.control2D.setOffset(n), this.camera.control2D.animation = s;
  }
  /**
   * This lets you set the visible range of a view based on the view's camera. This will probably not work
   * as expected if the view indicated and this controller do not share the same camera.
   *
   * @param viewId The id of the view when the view was generated when the surface was made
   */
  setRange(e, t) {
    const i = this.getProjection(t), n = this.getViewScreenBounds(t), s = this.getView(t);
    if (i && n && s) {
      const a = qe(
        [
          n.width / e.width,
          n.height / e.height,
          1
        ],
        this.camera.control2D.getScale()
      );
      this.camera.control2D.setScale(
        Ke(
          this.camera.control2D.getScale(),
          this.scaleFilter(a, s, [s])
        )
      );
      const o = qe(
        [-e.x, -e.y, 0],
        this.camera.control2D.offset
      );
      this.camera.control2D.setOffset(
        Ke(
          this.camera.control2D.offset,
          this.scaleFilter(o, s, [s])
        )
      ), this.applyBounds(), this.onRangeChanged(this.camera, s.projection), this.applyBounds();
    }
  }
  /**
   * Applies a handler for the range changing.
   */
  setRangeChangeHandler(e) {
    this.onRangeChanged = e;
  }
}
class Qm extends Xr {
  constructor(e, t) {
    super(e), this.offsetFilter = (i) => i, this.scaleFilter = (i) => i, this.base = t.base, this.offsetFilter = t.offsetFilter || this.offsetFilter, this.scaleFilter = t.scaleFilter || this.scaleFilter;
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
class qT extends ur {
  set control2D(e) {
  }
  get control2D() {
    return this._control2D;
  }
  constructor(e) {
    super(), this.base = e.base, this._control2D = new Qm(this.base, {
      base: this.base.control2D,
      offsetFilter: e.offsetFilter,
      scaleFilter: e.scaleFilter
    });
  }
}
const Ym = new ur();
class qm extends Za {
  constructor() {
    super(...arguments), this.camera = Ym;
  }
  /**
   * Maps a coordinate relative to the screen to a coordinate found within the world space.
   */
  screenToWorld(e, t) {
    const i = this.screenToView(e), n = t || [0, 0];
    return n[0] = (i[0] - this.camera.control2D.offset[0] * this.camera.scale2D[0]) / this.camera.scale2D[0], n[1] = (i[1] - this.camera.control2D.offset[1] * this.camera.scale2D[1]) / this.camera.scale2D[1], n;
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
    const i = [0, 0];
    return i[0] = (e[0] * this.camera.scale2D[0] + this.camera.control2D.offset[0] * this.camera.scale2D[0]) * this.pixelRatio, i[1] = (e[1] * this.camera.scale2D[1] + this.camera.control2D.offset[1] * this.camera.scale2D[1]) * this.pixelRatio, this.viewToScreen(i, t);
  }
  /**
   * Maps a coordinate relative to the view's viewport to a coordinate found within the world.
   */
  viewToWorld(e, t) {
    const i = t || [0, 0], n = e;
    return i[0] = (n[0] - this.camera.control2D.offset[0] * this.camera.scale2D[0]) / this.camera.scale2D[0], i[1] = (n[1] - this.camera.control2D.offset[1] * this.camera.scale2D[1]) / this.camera.scale2D[1], i;
  }
  /**
   * Maps a coordinate found within the world to a relative coordinate within the view's viewport.
   */
  worldToView(e, t) {
    const i = t || [0, 0];
    return i[0] = e[0] * this.camera.scale2D[0] + this.camera.control2D.offset[0] * this.camera.scale2D[0], i[1] = e[1] * this.camera.scale2D[1] + this.camera.control2D.offset[1] * this.camera.scale2D[1], i;
  }
}
function Ac(r) {
  return r.projectionType === jr.ORTHOGRAPHIC;
}
const wo = class wo extends pn {
  constructor(e, t) {
    super(e, t), this.projection = new qm(), this.projection.camera = t.camera || new ur();
  }
  /**
   * This operation makes sure we have the view camera adjusted to the new
   * viewport's needs. For default behavior this ensures that the coordinate
   * system has no distortion or perspective, orthographic, top left as 0,0 with
   * +y axis pointing down.
   */
  fitViewtoViewport(e, t) {
    if (Ac(this.props.camera)) {
      const i = t.width, n = t.height, s = {
        bottom: -n / 2,
        far: 1e7,
        left: -i / 2,
        near: -100,
        right: i / 2,
        top: n / 2
      }, a = 1 / this.pixelRatio, o = 1 / this.pixelRatio, c = this.props.camera;
      c.projectionOptions = Object.assign(
        c.projectionOptions,
        s
      ), c.position = [
        t.width / (2 * this.pixelRatio),
        t.height / (2 * this.pixelRatio),
        c.position[2]
      ], c.scale = [a, -o, 1], c.lookAt(Ke(c.position, [0, 0, -1]), [0, 1, 0]), c.update(), this.projection.viewBounds = t, t.d = this, this.projection.screenBounds = new te({
        height: this.viewBounds.height / this.pixelRatio,
        width: this.viewBounds.width / this.pixelRatio,
        x: this.viewBounds.x / this.pixelRatio,
        y: this.viewBounds.y / this.pixelRatio
      }), this.screenBounds.d = this;
    } else Ac(this.props.camera) || console.warn("View2D does not support non-orthographic cameras.");
  }
  willUpdateProps(e) {
    this.projection.camera = e.camera;
  }
};
wo.defaultProps = {
  key: "",
  camera: new ur(),
  viewport: {
    left: 0,
    right: 0,
    bottom: 0,
    top: 0
  }
};
let hs = wo;
const Km = `precision highp float;

varying vec4 vertexColor;

void main() {
  gl_FragColor = vertexColor;
}
`, Zm = `\${import: arc}
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
`, Jm = `precision highp float;

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
var e0 = /* @__PURE__ */ ((r) => (r[r.NONE = 0] = "NONE", r[r.SCREEN_CURVE = 1] = "SCREEN_CURVE", r))(e0 || {});
const gt = class gt extends De {
  /**
   * Define our shader and it's inputs
   */
  initShader() {
    const { scaleType: e } = this.props, t = this.props.animate || {}, {
      angle: i,
      angleOffset: n,
      center: s,
      radius: a,
      thickness: o,
      colorStart: c,
      colorEnd: l
    } = t, u = 150, h = {
      0: 1,
      [u * 2 + 2]: -1
    }, d = {
      0: 0,
      [u * 2 + 2]: 1
    };
    let p = 1;
    for (let m = 0; m < u * 2; ++m)
      h[m + 1] = p, d[m + 1] = Math.floor(m / 2) / (u - 1), p *= -1;
    const g = e === 0 ? Zm : Jm;
    return {
      fs: Km,
      instanceAttributes: [
        {
          easing: s,
          name: gt.attributeNames.center,
          size: S.TWO,
          update: (m) => m.center
        },
        {
          easing: a,
          name: gt.attributeNames.radius,
          size: S.ONE,
          update: (m) => [m.radius]
        },
        {
          name: gt.attributeNames.depth,
          size: S.ONE,
          update: (m) => [m.depth]
        },
        {
          easing: o,
          name: gt.attributeNames.thickness,
          size: S.TWO,
          update: (m) => m.thickness
        },
        {
          easing: i,
          name: gt.attributeNames.angle,
          size: S.TWO,
          update: (m) => m.angle
        },
        {
          easing: n,
          name: gt.attributeNames.angleOffset,
          size: S.ONE,
          update: (m) => [m.angleOffset]
        },
        {
          easing: c,
          name: gt.attributeNames.colorStart,
          size: S.FOUR,
          update: (m) => m.colorStart
        },
        {
          easing: l,
          name: gt.attributeNames.colorEnd,
          size: S.FOUR,
          update: (m) => m.colorEnd
        }
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: _.ONE,
          update: (m) => [1]
        }
      ],
      vertexAttributes: [
        {
          name: "vertex",
          size: ze.THREE,
          update: (m) => [
            // Normal
            h[m],
            // The side of the quad
            d[m],
            // The number of vertices
            u * 2
          ]
        }
      ],
      vertexCount: u * 2 + 2,
      vs: g
    };
  }
  getMaterialOptions() {
    return Object.assign({}, lt.transparentShapeBlending, {
      culling: f.Material.CullSide.NONE
    });
  }
};
gt.defaultProps = {
  data: new le(),
  key: "",
  scaleType: 0
  /* NONE */
}, gt.attributeNames = {
  angle: "angle",
  angleOffset: "angleOffset",
  center: "center",
  colorEnd: "colorEnd",
  colorStart: "colorStart",
  depth: "depth",
  radius: "radius",
  thickness: "thickness"
};
let Mc = gt;
var t0 = Object.defineProperty, Qr = (r, e, t, i) => {
  for (var n = void 0, s = r.length - 1, a; s >= 0; s--)
    (a = r[s]) && (n = a(e, t, n) || n);
  return n && t0(e, t, n), n;
};
const Ir = class qu extends wt {
  constructor(e) {
    super(e), this.angle = [0, Math.PI], this.colorEnd = [1, 1, 1, 1], this.colorStart = [1, 1, 1, 1], this.center = [0, 0], this.depth = 0, this.angleOffset = 0, this.radius = 1, this.thickness = [5, 5], Je(this, qu), this.angle = e.angle || this.angle, this.colorEnd = e.colorEnd || this.colorEnd, this.colorStart = e.colorStart || this.colorStart, this.center = e.center || this.center, this.depth = e.depth || this.depth, this.radius = e.radius || this.radius, this.thickness = e.thickness || this.thickness;
  }
};
Qr([
  M
], Ir.prototype, "angle");
Qr([
  M
], Ir.prototype, "colorEnd");
Qr([
  M
], Ir.prototype, "colorStart");
Qr([
  M
], Ir.prototype, "center");
Qr([
  M
], Ir.prototype, "depth");
Qr([
  M
], Ir.prototype, "angleOffset");
Qr([
  M
], Ir.prototype, "radius");
Qr([
  M
], Ir.prototype, "thickness");
let KT = Ir;
const r0 = `precision highp float;

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
`, i0 = `// Shader for rendering simple circles on a quad, using the fragment shader to create the 'roundness' of the shape.
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
`, n0 = `precision highp float;

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
`, s0 = `// This shader renders our circles with POINTS mode. This can perform better for more intensive scenarios but comes at
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
`, Dr = class Dr extends De {
  /**
   * Define our shader and it's inputs
   */
  initShader() {
    var h, d;
    const { animate: e = {}, usePoints: t = !1, opacity: i = () => 1 } = this.props, {
      center: n,
      radius: s,
      color: a
    } = e, o = [1, 1, -1, -1, 1, -1], c = [-1, 1, -1, 1, 1, -1], l = [
      {
        name: "normals",
        size: ze.TWO,
        update: (p) => [
          // Normal
          o[p],
          // The side of the quad
          c[p]
        ]
      }
    ], u = o.length;
    return {
      // This layer will support changes to the buffering strategy
      instancing: (h = this.props.bufferManagement) == null ? void 0 : h.instancing,
      baseBufferGrowthRate: (d = this.props.bufferManagement) == null ? void 0 : d.baseBufferGrowthRate,
      // Supports a POINTS or TRIANGLES mode for rendering
      drawMode: t ? f.Model.DrawMode.POINTS : f.Model.DrawMode.TRIANGLES,
      vs: t ? s0 : i0,
      fs: t ? [
        {
          outputType: V.COLOR,
          source: n0
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
          source: r0
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
          easing: n,
          name: Dr.attributeNames.center,
          size: S.TWO,
          update: (p) => p.center
        },
        {
          easing: s,
          name: Dr.attributeNames.radius,
          size: S.ONE,
          update: (p) => [p.radius]
        },
        {
          name: Dr.attributeNames.depth,
          size: S.ONE,
          update: (p) => [p.depth]
        },
        {
          easing: a,
          name: Dr.attributeNames.color,
          size: S.FOUR,
          update: (p) => p.color
        }
      ],
      uniforms: [
        {
          name: "layerOpacity",
          size: _.ONE,
          shaderInjection: A.ALL,
          update: (p) => [i()]
        }
      ],
      vertexAttributes: l,
      vertexCount: t ? 1 : u
    };
  }
  getMaterialOptions() {
    return lt.transparentShapeBlending;
  }
};
Dr.defaultProps = {
  data: new le(),
  key: ""
}, Dr.attributeNames = {
  center: "center",
  color: "color",
  depth: "depth",
  radius: "radius"
};
let Ic = Dr;
var a0 = Object.defineProperty, Os = (r, e, t, i) => {
  for (var n = void 0, s = r.length - 1, a; s >= 0; s--)
    (a = r[s]) && (n = a(e, t, n) || n);
  return n && a0(e, t, n), n;
};
const wn = class Ku extends wt {
  constructor(e) {
    super(e), this.color = [1, 1, 1, 1], this.depth = 0, this.radius = 0, this.center = [0, 0], Je(this, Ku), this.color = e.color || this.color, this.radius = e.radius || this.radius, this.center = e.center || this.center, this.depth = e.depth || this.depth;
  }
  get width() {
    return this.radius * 2;
  }
  get height() {
    return this.radius * 2;
  }
};
Os([
  M
], wn.prototype, "color");
Os([
  M
], wn.prototype, "depth");
Os([
  M
], wn.prototype, "radius");
Os([
  M
], wn.prototype, "center");
let ZT = wn;
const o0 = `precision highp float;

varying vec4 vertexColor;

void main() {
  \${out: color} = vertexColor;
}
`, Ys = `
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
`, Sc = `/**
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
`, Cc = `/**
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
`, Nc = `/**
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
`, qs = `/**
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
`, Ks = `/**
 * This vertex shader calculates edges based in world space to make an edge
 * based on bezier curves with 0, 1, and 2 control points.
 * This implementation simply uses GL line to draw the edge with no
 * consideration for a start and end thickness. Saves on performance.
 */
precision highp float;

varying vec4 vertexColor;

// Interpolation type injection
{
  interpolation } void main() {
  // Destructure vertex attribute
  float interpolationTime = vertex.y;

  // Convert our world points to screen space
  vec4 startClip = clipSpace(vec3(start, depth));
  vec4 endClip = clipSpace(vec3(end, depth));
  vec2 startScreen = (startClip.xy + vec2(1.0f, 1.0f)) * vec2(0.5f, 0.5f) * viewSize;
  vec2 endScreen = (endClip.xy + vec2(1.0f, 1.0f)) * vec2(0.5f, 0.5f) * viewSize;
  // Controls for this mode are screen space deltas from the end points
  vec2 control1 = startScreen + vec2(control.x, -control.y) * scaleFactor;
  vec2 control2 = endScreen + vec2(control.z, -control.w) * scaleFactor;

  // Get the position of the current vertex
  vec2 currentPosition = interpolation(interpolationTime, startScreen, endScreen, control1, control2);

  // Get the color based on where we are on the line
  vertexColor = mix(startColor, endColor, interpolationTime);

  gl_Position = vec4((currentPosition / viewSize) * vec2(2.0f, 2.0f) - vec2(1.0f, 1.0f), startClip.zw);
  gl_PointSize = 5.0f;
}
`, Zs = `
precision highp float;

/**
  This vertex shader calculates edges whose curve and width is in screen space
  where the curve is bezier curves with 0, 1, and 2 control points.

  This version uses a GL line to draw the edge with no consideration for a start
  and end thickness. Saves on performance.
**/
varying vec4 vertexColor;

// Interpolation type injection
\${interpolation}

void main() {
  // Destructure vertex attribute
  float interpolationTime = vertex.y;
  // Get the position of the current vertex
  vec2 currentPosition = interpolation(interpolationTime, start, end, control.xy, control.zw);

  // Get the color based on where we are on the line
  vertexColor = mix(startColor, endColor, interpolationTime);

  gl_Position = clipSpace(vec3(currentPosition, depth));
  gl_PointSize = 5.0;
}
`;
var Kn = /* @__PURE__ */ ((r) => (r[r.NONE = 0] = "NONE", r[r.SCREEN_CURVE = 1] = "SCREEN_CURVE", r))(Kn || {}), X = /* @__PURE__ */ ((r) => (r[r.LINE = 0] = "LINE", r[r.BEZIER = 1] = "BEZIER", r[r.BEZIER2 = 2] = "BEZIER2", r[r.LINE_THIN = 3] = "LINE_THIN", r[r.BEZIER_THIN = 4] = "BEZIER_THIN", r[r.BEZIER2_THIN = 5] = "BEZIER2_THIN", r))(X || {}), Zu = /* @__PURE__ */ ((r) => (r[r.ALL = 0] = "ALL", r[r.PASS_Y = 1] = "PASS_Y", r[r.PASS_X = 2] = "PASS_X", r))(Zu || {});
function c0(r) {
  return [r[0][0], r[0][1], r[1][0], r[1][1]];
}
const l0 = {
  [X.LINE]: Nc,
  [X.BEZIER]: Sc,
  [X.BEZIER2]: Cc,
  [X.LINE_THIN]: Nc,
  [X.BEZIER_THIN]: Sc,
  [X.BEZIER2_THIN]: Cc
}, u0 = {
  [X.LINE]: qs,
  [X.BEZIER]: qs,
  [X.BEZIER2]: qs,
  [X.LINE_THIN]: Ks,
  [X.BEZIER_THIN]: Ks,
  [X.BEZIER2_THIN]: Ks
}, h0 = {
  [X.LINE]: Ys,
  [X.BEZIER]: Ys,
  [X.BEZIER2]: Ys,
  [X.LINE_THIN]: Zs,
  [X.BEZIER_THIN]: Zs,
  [X.BEZIER2_THIN]: Zs
}, d0 = {
  [X.LINE]: f.Model.DrawMode.TRIANGLE_STRIP,
  [X.BEZIER]: f.Model.DrawMode.TRIANGLE_STRIP,
  [X.BEZIER2]: f.Model.DrawMode.TRIANGLE_STRIP,
  [X.LINE_THIN]: f.Model.DrawMode.LINE_STRIP,
  [X.BEZIER_THIN]: f.Model.DrawMode.LINE_STRIP,
  [X.BEZIER2_THIN]: f.Model.DrawMode.LINE_STRIP
}, tt = class tt extends De {
  /**
   * Define our shader and it's inputs
   */
  initShader() {
    const {
      animate: e = {},
      scaleFactor: t = () => 1,
      type: i,
      scaleType: n = Kn.NONE,
      smoothness: s = 50
    } = this.props, {
      end: a,
      start: o,
      startColor: c,
      endColor: l,
      control: u,
      thickness: h
    } = e, d = i === X.LINE ? 2 : s, p = new Array(d * 2 + 2);
    p[0] = 1, p[d * 2 + 2] = -1;
    const g = new Array(d * 2 + 2);
    switch (g[0] = 0, g[d * 2 + 2] = 1, i) {
      case X.LINE:
      case X.BEZIER:
      case X.BEZIER2: {
        let x = 1;
        for (let b = 0; b < d * 2; ++b)
          p[b + 1] = x, g[b + 1] = Math.floor(b / 2) / (d - 1), x *= -1;
        break;
      }
      case X.LINE_THIN:
      case X.BEZIER_THIN:
      case X.BEZIER2_THIN:
        for (let x = 0; x < p.length; ++x)
          p[x] = 1, g[x] = x / (p.length - 1);
        break;
    }
    const m = {
      interpolation: l0[i]
    }, T = ui({
      options: m,
      required: {
        name: "Edge Layer",
        values: ["interpolation"]
      },
      shader: n === Kn.NONE ? h0[i] : u0[i],
      // We do not want to remove any other templating options present
      onToken: (x, b) => x in m ? b : `\${${x}}`
    });
    return {
      drawMode: d0[i],
      fs: [
        {
          outputType: V.COLOR,
          source: o0
        }
      ],
      instanceAttributes: [
        {
          easing: c,
          name: tt.attributeNames.startColor,
          size: S.FOUR,
          update: (x) => x.startColor
        },
        {
          easing: l,
          name: tt.attributeNames.endColor,
          size: S.FOUR,
          update: (x) => x.endColor
        },
        {
          easing: o,
          name: tt.attributeNames.start,
          size: S.TWO,
          update: (x) => x.start
        },
        {
          easing: a,
          name: tt.attributeNames.end,
          size: S.TWO,
          update: (x) => x.end
        },
        {
          easing: h,
          name: tt.attributeNames.thickness,
          size: S.TWO,
          update: (x) => x.thickness
        },
        {
          name: tt.attributeNames.depth,
          size: S.ONE,
          update: (x) => [x.depth]
        },
        i === X.LINE || i === X.LINE_THIN ? {
          easing: u,
          name: tt.attributeNames.control,
          size: S.FOUR,
          update: (x) => [0, 0, 0, 0]
        } : null,
        i === X.BEZIER || i === X.BEZIER_THIN ? {
          easing: u,
          name: tt.attributeNames.control,
          size: S.FOUR,
          update: (x) => [x.control[0][0], x.control[0][1], 0, 0]
        } : null,
        i === X.BEZIER2 || i === X.BEZIER2_THIN ? {
          easing: u,
          name: tt.attributeNames.control,
          size: S.FOUR,
          update: (x) => c0(x.control)
        } : null
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: _.ONE,
          update: (x) => [t()]
        },
        {
          name: "layerOpacity",
          size: _.ONE,
          update: (x) => [
            this.props.opacity === void 0 ? 1 : this.props.opacity
          ]
        }
      ],
      vertexAttributes: [
        {
          name: "vertex",
          size: ze.THREE,
          update: (x) => [
            // Normal
            p[x],
            // The side of the quad
            g[x],
            // The number of vertices
            p.length
          ]
        }
      ],
      vertexCount: p.length,
      vs: T.shader
    };
  }
  getMaterialOptions() {
    return lt.transparentShapeBlending;
  }
};
tt.defaultProps = {
  broadphase: Zu.ALL,
  data: new le(),
  key: "none",
  scaleType: Kn.NONE,
  type: X.LINE
}, tt.attributeNames = {
  control: "control",
  depth: "depth",
  end: "end",
  endColor: "endColor",
  start: "start",
  startColor: "startColor",
  thickness: "thickness"
};
let Oc = tt;
var f0 = Object.defineProperty, xi = (r, e, t, i) => {
  for (var n = void 0, s = r.length - 1, a; s >= 0; s--)
    (a = r[s]) && (n = a(e, t, n) || n);
  return n && f0(e, t, n), n;
};
const Yr = class Ju extends wt {
  constructor(e) {
    super(e), this.control = [
      [0, 0],
      [0, 0]
    ], this.depth = 0, this.end = [0, 0], this.endColor = [1, 1, 1, 1], this.start = [0, 0], this.startColor = [1, 1, 1, 1], this.thickness = [1, 1], Je(this, Ju), this.startColor = e.startColor || this.startColor, this.endColor = e.endColor || this.endColor, this.control = e.control || this.control, this.depth = e.depth || this.depth, this.end = e.end || this.end, this.thickness = e.thickness || this.thickness, this.start = e.start || this.start;
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
    this.startColor = or(e), this.endColor = or(e);
  }
};
xi([
  M
], Yr.prototype, "control");
xi([
  M
], Yr.prototype, "depth");
xi([
  M
], Yr.prototype, "end");
xi([
  M
], Yr.prototype, "endColor");
xi([
  M
], Yr.prototype, "start");
xi([
  M
], Yr.prototype, "startColor");
xi([
  M
], Yr.prototype, "thickness");
let JT = Yr;
const pe = Ee("video");
function p0(r) {
  pe.enabled && (r.addEventListener("abort", () => pe("abort")), r.addEventListener("canplay", () => pe("canplay")), r.addEventListener("canplaythrough", () => pe("canplaythrough")), r.addEventListener("durationchange", () => pe("durationchange")), r.addEventListener("emptied", () => pe("emptied")), r.addEventListener("ended", () => pe("ended")), r.addEventListener("error", () => pe("error")), r.addEventListener("loadeddata", () => pe("loadeddata")), r.addEventListener("loadedmetadata", () => pe("loadedmetadata")), r.addEventListener("loadstart", () => pe("loadstart")), r.addEventListener("pause", () => pe("pause")), r.addEventListener("play", () => pe("play")), r.addEventListener("playing", () => pe("playing")), r.addEventListener("progress", () => pe("progress")), r.addEventListener("ratechange", () => pe("ratechange")), r.addEventListener("seeked", () => pe("seeked")), r.addEventListener("seeking", () => pe("seeking")), r.addEventListener("stalled", () => pe("stalled")), r.addEventListener("suspend", () => pe("suspend")), r.addEventListener("timeupdate", () => pe("timeupdate")), r.addEventListener("volumechange", () => pe("volumechange")), r.addEventListener("waiting", () => pe("waiting")));
}
const g0 = `precision highp float;

varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  gl_FragColor = texture2D(imageAtlas, texCoord) * vertexColor;
  gl_FragColor = gl_FragColor * gl_FragColor.a;
}
`, m0 = `precision highp float;



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
`, x0 = `precision highp float;

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
`, mt = class mt extends De {
  constructor(e, t, i) {
    super(e, t, i);
  }
  /**
   * Define our shader and it's inputs
   */
  initShader() {
    const e = this.props.animate || {}, {
      tint: t,
      location: i,
      size: n,
      rotation: s
    } = e, a = {
      0: 1,
      1: 1,
      2: -1,
      3: 1,
      4: -1,
      5: -1
    }, o = {
      0: 0,
      1: 0,
      2: 0,
      3: 1,
      4: 1,
      5: 1
    };
    return {
      fs: g0,
      instanceAttributes: [
        this.props.enableRotation ? {
          easing: s,
          name: mt.attributeNames.rotation,
          size: S.ONE,
          update: (c) => [c.rotation]
        } : null,
        {
          easing: i,
          name: mt.attributeNames.location,
          size: S.TWO,
          update: (c) => c.origin
        },
        {
          name: mt.attributeNames.anchor,
          size: S.TWO,
          update: (c) => [c.anchor.x || 0, c.anchor.y || 0]
        },
        {
          easing: n,
          name: mt.attributeNames.size,
          size: S.TWO,
          update: (c) => [c.width, c.height]
        },
        {
          name: mt.attributeNames.depth,
          size: S.ONE,
          update: (c) => [c.depth]
        },
        {
          name: mt.attributeNames.scaling,
          size: S.ONE,
          update: (c) => [c.scaling]
        },
        {
          name: mt.attributeNames.texture,
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
          name: mt.attributeNames.tint,
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
          size: ze.TWO,
          update: (c) => [
            // Normal
            a[c],
            // The side of the quad
            o[c]
          ]
        }
      ],
      vertexCount: 6,
      vs: this.props.enableRotation ? x0 : m0
    };
  }
  getMaterialOptions() {
    return lt.transparentImageBlending;
  }
};
mt.defaultProps = {
  key: "",
  data: new le()
}, mt.attributeNames = {
  location: "location",
  anchor: "anchor",
  size: "size",
  depth: "depth",
  scaling: "scaling",
  texture: "texture",
  tint: "tint",
  rotation: "rotation"
};
let wa = mt;
function Un(r) {
  return r && r.videoSrc;
}
const Zn = new Image();
Zn.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const Eo = class Eo extends De {
  constructor() {
    super(...arguments), this.childProvider = new le(), this.imageToResource = /* @__PURE__ */ new Map(), this.sourceToRequest = /* @__PURE__ */ new Map(), this.sourceToVideo = /* @__PURE__ */ new Map(), this.usingVideo = /* @__PURE__ */ new Map(), this.waitingForVideo = /* @__PURE__ */ new Map(), this.waitForVideoSource = /* @__PURE__ */ new Map(), this.originalOnReadyCallbacks = /* @__PURE__ */ new Map();
  }
  /**
   * The image layer will manage the resources for the images, and the child
   * layer will concern itself with rendering.
   */
  childLayers() {
    return [ji(wa, {
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
    for (let n = 0, s = e.length; n < s; ++n) {
      const [a, o, c] = e[n];
      switch (o) {
        case be.CHANGE:
          if (c[t] !== void 0) {
            const l = this.imageToResource.get(a);
            let u = this.getAtlasSource(a);
            if (u === l) break;
            if (l instanceof HTMLVideoElement) {
              const h = this.waitForVideoSource.get(a);
              if (h) {
                this.waitForVideoSource.delete(a);
                const p = this.waitingForVideo.get(h);
                p && p.delete(a);
              }
              let d = this.usingVideo.get(
                l.getAttribute("data-source") || ""
              );
              d || (d = /* @__PURE__ */ new Set()), d.delete(a), d.size <= 0 && this.sourceToVideo.delete(
                l.getAttribute("data-source") || ""
              ), a.onReady = this.originalOnReadyCallbacks.get(a);
            }
            if (Un(a.source) && (this.prepareVideo(a, a.source), u = this.getAtlasSource(a), pi(
              this.usingVideo,
              a.source.videoSrc,
              /* @__PURE__ */ new Set()
            ).add(a)), this.imageToResource.set(a, u), this.resource.request(
              this,
              a,
              nn({
                key: this.props.atlas || "",
                disposeResource: !0,
                source: l
              })
            ), u) {
              let h = this.sourceToRequest.get(u);
              (!h || h.texture && !h.texture.isValid) && (h = nn({
                key: this.props.atlas || "",
                source: u,
                rasterizationScale: this.props.rasterizationScale
              }), this.sourceToRequest.set(u, h)), a.request = h, this.resource.request(this, a, h);
            }
          }
          break;
        case be.INSERT:
          if (a.source) {
            let l = this.getAtlasSource(a);
            Un(a.source) && (this.prepareVideo(a, a.source), l = this.getAtlasSource(a), pi(
              this.usingVideo,
              a.source.videoSrc,
              /* @__PURE__ */ new Set()
            ).add(a));
            let u = this.sourceToRequest.get(l);
            (!u || u.texture && !u.texture.isValid) && (u = nn({
              key: this.props.atlas || "",
              source: l,
              rasterizationScale: this.props.rasterizationScale
            }), this.sourceToRequest.set(l, u)), a.request = u;
          }
          break;
        case be.REMOVE: {
          const l = this.getAtlasSource(a);
          if (this.imageToResource.delete(a), Un(a.source)) {
            const u = this.waitForVideoSource.get(a);
            if (u) {
              this.waitForVideoSource.delete(a);
              const d = this.waitingForVideo.get(u);
              d && d.delete(a);
            }
            let h = this.usingVideo.get(a.source.videoSrc);
            h || (h = /* @__PURE__ */ new Set()), h.delete(a), h.size <= 0 && this.sourceToVideo.delete(a.source.videoSrc), this.originalOnReadyCallbacks.delete(a);
          }
          this.resource.request(
            this,
            a,
            nn({
              key: this.props.atlas || "",
              disposeResource: !0,
              source: l
            })
          );
          break;
        }
      }
    }
    const i = [];
    this.usingVideo.forEach((n, s) => {
      n.size <= 0 && i.push(s);
    });
    for (let n = 0, s = i.length; n < s; ++n) {
      const a = i[n];
      this.usingVideo.delete(a), this.sourceToVideo.delete(a);
    }
  }
  /**
   * Gets the source that is atlas reques compatible.
   */
  getAtlasSource(e) {
    return Un(e.source) ? this.sourceToVideo.get(e.source.videoSrc) || Zn : e.source;
  }
  /**
   * This handles creating the video object from the source. It then queues up
   * the waiting needs and temporarily converts the video Image to a simple
   * white image that will take on the tint of the ImageInstance.
   */
  prepareVideo(e, t) {
    const i = this.sourceToVideo.get(t.videoSrc);
    if (this.originalOnReadyCallbacks.get(e) || this.originalOnReadyCallbacks.set(e, e.onReady), i) {
      const p = this.waitingForVideo.get(t.videoSrc);
      if (p)
        p.add(e), this.waitForVideoSource.set(e, t.videoSrc), e.onReady = void 0, e.source = Zn, e.videoLoad = () => {
          i.load(), t.autoPlay && i.play();
        };
      else {
        const g = this.originalOnReadyCallbacks.get(e) || e.onReady;
        if (!g) return;
        e.onReady = (m) => {
          g(m, i);
        };
      }
      return;
    }
    const s = document.createElement("video");
    this.sourceToVideo.set(t.videoSrc, s), s.setAttribute("data-source", t.videoSrc), p0(s);
    const a = new Ve(), o = new Ve(), c = () => {
      s.removeEventListener("loadedmetadata", u), s.removeEventListener("loadeddata", l), s.removeEventListener("error", h), this.waitingForVideo.delete(t.videoSrc), this.waitForVideoSource.delete(e);
    }, l = () => {
      o.resolve();
    }, u = () => {
      a.resolve();
    }, h = (p) => {
      let g;
      p.path && p.path[0] && (g = p.path[0].error), p.originalTarget && (g = p.originalTarget.error), console.warn(
        "There was an error loading the video resource to the atlas texture context"
      ), console.warn(g), a.reject({}), o.reject({});
    };
    s.addEventListener("loadedmetadata", u), s.addEventListener("loadeddata", l), s.addEventListener("error", h), e.onReady = void 0, pi(
      this.waitingForVideo,
      t.videoSrc,
      /* @__PURE__ */ new Set()
    ).add(e), this.waitForVideoSource.set(e, t.videoSrc), e.source = Zn, e.videoLoad = () => {
      s.load(), t.autoPlay && s.play();
    }, s.muted = !0, s.src = t.videoSrc, Promise.all([a.promise, o.promise]).then(() => {
      s.currentTime = 0, t.autoPlay && s.play();
      const p = this.waitingForVideo.get(t.videoSrc);
      p && p.forEach((g) => {
        g.source = t, g.onReady = this.originalOnReadyCallbacks.get(g);
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
Eo.defaultProps = {
  atlas: "default",
  key: "",
  data: new le()
};
let Lc = Eo;
var T0 = Object.defineProperty, Sr = (r, e, t, i) => {
  for (var n = void 0, s = r.length - 1, a; s >= 0; s--)
    (a = r[s]) && (n = a(e, t, n) || n);
  return n && T0(e, t, n), n;
};
const { max: b0 } = Math, v0 = {
  [L.TopLeft]: (r, e) => {
    r.x = -r.padding, r.y = -r.padding;
  },
  [L.TopMiddle]: (r, e) => {
    r.x = e.width / 2, r.y = -r.padding;
  },
  [L.TopRight]: (r, e) => {
    r.x = e.width + r.padding, r.y = -r.padding;
  },
  [L.MiddleLeft]: (r, e) => {
    r.x = -r.padding, r.y = e.height / 2;
  },
  [L.Middle]: (r, e) => {
    r.x = e.width / 2, r.y = e.height / 2;
  },
  [L.MiddleRight]: (r, e) => {
    r.x = e.width + r.padding, r.y = e.height / 2;
  },
  [L.BottomLeft]: (r, e) => {
    r.x = -r.padding, r.y = e.height + r.padding;
  },
  [L.BottomMiddle]: (r, e) => {
    r.x = e.width / 2, r.y = e.height + r.padding;
  },
  [L.BottomRight]: (r, e) => {
    r.x = e.width + r.padding, r.y = e.height + r.padding;
  },
  [L.Custom]: (r, e) => {
    r.x = r.x || 0, r.y = r.y || 0;
  }
}, Qt = class eh extends wt {
  constructor(e) {
    super(e), this.tint = [0, 0, 0, 1], this.depth = 0, this.height = 1, this.origin = [0, 0], this.scaling = ar.BOUND_MAX, this.width = 1, this.rotation = 0, this.sourceWidth = 0, this.sourceHeight = 0, this._anchor = {
      padding: 0,
      type: L.TopLeft,
      x: 0,
      y: 0
    }, this.videoLoad = Oa, Je(this, eh), this.depth = e.depth || this.depth, this.tint = e.tint || this.tint, this.scaling = e.scaling || this.scaling, this.origin = e.origin || this.origin, this.width = e.width || 1, this.height = e.height || 1, this.source = e.source, this.rotation = e.rotation || 0, this.onReady = e.onReady, e.anchor && this.setAnchor(e.anchor);
  }
  /**
   * This property reflects the maximum size a single dimension of the image
   * will take up. This means if you set this value to 100 at least the width or
   * the height will be 100 depending on the aspect ratio of the image.
   */
  get maxSize() {
    return b0(this.width, this.height);
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
    v0[t.type](t, this), this._anchor = t;
  }
};
Sr([
  M
], Qt.prototype, "tint");
Sr([
  M
], Qt.prototype, "depth");
Sr([
  M
], Qt.prototype, "height");
Sr([
  M
], Qt.prototype, "origin");
Sr([
  M
], Qt.prototype, "scaling");
Sr([
  M
], Qt.prototype, "source");
Sr([
  M
], Qt.prototype, "width");
Sr([
  M
], Qt.prototype, "rotation");
Sr([
  M
], Qt.prototype, "_anchor");
let eb = Qt;
var w0 = Object.defineProperty, Cr = (r, e, t, i) => {
  for (var n = void 0, s = r.length - 1, a; s >= 0; s--)
    (a = r[s]) && (n = a(e, t, n) || n);
  return n && w0(e, t, n), n;
};
const Yt = class Ea extends wt {
  constructor(e) {
    super(e), this.anchor = [0, 0], this.character = "a", this.color = [1, 1, 1, 1], this.depth = 0, this.fontScale = 1, this.maxScale = 1, this.offset = [0, 0], this.origin = [0, 0], this.padding = [0, 0], Je(this, Ea), this.origin = e.origin || this.origin, this.offset = e.offset || this.offset, this.character = e.character || this.character, this.color = e.color || this.color, this.maxScale = e.maxScale || this.maxScale, this.padding = e.padding || this.padding, this.anchor = e.anchor || this.anchor, this.onReady = e.onReady;
  }
  /**
   * Make a duplicate of this glyph
   */
  clone() {
    const e = new Ea(this);
    e.onReady = this.onReady, e.request = this.request;
  }
  /**
   * This will trigger when the resource nmanager is ready to render this glyph.
   */
  resourceTrigger() {
    this.offset = this.offset, this.origin = this.origin, this.character = this.character, this.color = this.color, this.onReady && this.onReady(this);
  }
};
Cr([
  M
], Yt.prototype, "anchor");
Cr([
  M
], Yt.prototype, "character");
Cr([
  M
], Yt.prototype, "color");
Cr([
  M
], Yt.prototype, "depth");
Cr([
  M
], Yt.prototype, "fontScale");
Cr([
  M
], Yt.prototype, "maxScale");
Cr([
  M
], Yt.prototype, "offset");
Cr([
  M
], Yt.prototype, "origin");
Cr([
  M
], Yt.prototype, "padding");
let E0 = Yt;
const Fc = `varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  vec4 texColor = texture2D(fontMap, texCoord);
  if (texColor.r <= 0.0) discard;
  texColor.a = texColor.r;
  gl_FragColor = texColor * vertexColor;
}
`, Bc = `varying vec4 vertexColor;
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
`, y0 = `varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  vec4 texColor = texture2D(fontMap, texCoord);
  if (texColor.r <= 0.0) discard;
  texColor.a = texColor.r;
  gl_FragColor = texColor * vertexColor;
}
`, R0 = `varying vec4 vertexColor;
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
`, _0 = `varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  vec4 texColor = texture2D(fontMap, texCoord);
  if (texColor.r <= 0.0) discard;
  texColor.a = texColor.r;
  gl_FragColor = texColor * vertexColor;
}
`, A0 = `varying vec4 vertexColor;
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
`, M0 = `varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  vec4 texColor = texture2D(fontMap, texCoord);
  if (texColor.r <= 0.0) discard;
  texColor.a = texColor.r;
  gl_FragColor = texColor * vertexColor;
}
`, I0 = `varying vec4 vertexColor;
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
`, S0 = `varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  vec4 texColor = texture2D(fontMap, texCoord);
  if (texColor.r <= 0.0) discard;
  texColor.a = texColor.r;
  gl_FragColor = texColor * vertexColor;
}
`, C0 = `varying vec4 vertexColor;
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
`, N0 = `varying vec4 vertexColor;
varying vec2 texCoord;

void main() {
  vec4 texColor = texture2D(fontMap, texCoord);
  if (texColor.r <= 0.0) discard;
  texColor.a = texColor.r;
  gl_FragColor = texColor * vertexColor;
}
`, O0 = `varying vec4 vertexColor;
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
`, nr = class nr extends De {
  constructor() {
    super(...arguments), this.glyphRequests = {};
  }
  /**
   * Create the Shader IO needed to tie our instances and the GPU together.
   */
  initShader() {
    const e = this.props.animate || {}, {
      anchor: t,
      color: i,
      offset: n,
      origin: s
    } = e, a = {
      0: [0, 0],
      1: [0, 0],
      2: [1, 0],
      3: [0, 1],
      4: [1, 1],
      5: [1, 1]
    }, o = {
      name: "texture",
      resource: {
        key: () => this.props.resourceKey || "",
        name: "fontMap"
      },
      update: (d) => {
        const p = d.character;
        return (!d.request || d.character !== d.request.character) && (this.glyphRequests[d.character] ? d.request = this.glyphRequests[d.character] : (d.request = Hi({
          key: this.props.resourceKey || "",
          character: p
        }), this.glyphRequests[d.character] = d.request), d.request.fontMap && d.onReady && d.onReady(d)), d.request.fetch = Vi.TEXCOORDS, this.resource.request(this, d, d.request);
      }
    }, c = {
      name: "glyphSize",
      parentAttribute: o,
      resource: {
        key: () => this.props.resourceKey || "",
        name: "fontMap"
      },
      size: S.TWO,
      update: (d) => {
        const p = d.character;
        return (!d.request || d.character !== d.request.character) && (this.glyphRequests[d.character] ? d.request = this.glyphRequests[d.character] : (d.request = Hi({
          key: this.props.resourceKey || "",
          character: p
        }), this.glyphRequests[d.character] = d.request), d.request.fontMap && d.onReady && d.onReady(d)), d.request.fetch = Vi.IMAGE_SIZE, this.resource.request(this, d, d.request);
      }
    };
    o.childAttributes = [c];
    let l, u;
    switch (this.props.scaleMode || ar.ALWAYS) {
      case ar.BOUND_MAX: {
        l = this.props.inTextArea ? S0 : y0, u = this.props.inTextArea ? C0 : R0;
        break;
      }
      case ar.NEVER: {
        l = this.props.inTextArea ? _0 : N0, u = this.props.inTextArea ? O0 : A0;
        break;
      }
      case ar.ALWAYS: {
        l = this.props.inTextArea ? M0 : Fc, u = this.props.inTextArea ? I0 : Bc;
        break;
      }
      default: {
        l = Fc, u = Bc;
        break;
      }
    }
    return {
      fs: l,
      instanceAttributes: [
        {
          easing: i,
          name: nr.attributeNames.color,
          size: S.FOUR,
          update: (d) => d.color
        },
        {
          name: nr.attributeNames.depth,
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
          name: nr.attributeNames.anchor,
          size: S.TWO,
          update: (d) => d.anchor
        },
        {
          easing: s,
          name: nr.attributeNames.origin,
          size: S.TWO,
          update: (d) => d.origin
        },
        {
          easing: n,
          name: nr.attributeNames.offset,
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
        o
      ],
      uniforms: [],
      vertexAttributes: [
        {
          name: "normals",
          size: ze.TWO,
          update: (d) => (
            // Quad vertex side information
            a[d]
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
      lt.transparentImageBlending,
      Rh({
        depthTest: !1
      })
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
nr.defaultProps = {
  key: "",
  data: new le(),
  resourceKey: "No resource specified"
}, nr.attributeNames = {
  color: "color",
  depth: "depth",
  anchor: "anchor",
  origin: "origin",
  offset: "offset"
};
let ya = nr;
const L0 = "...", Pc = {
  [L.TopLeft]: (r, e) => {
    r.x = 0, r.y = 0;
  },
  [L.TopMiddle]: (r, e) => {
    r.x = e.size[0] / 2, r.y = 0;
  },
  [L.TopRight]: (r, e) => {
    r.x = e.size[0], r.y = 0;
  },
  [L.MiddleLeft]: (r, e) => {
    r.x = 0, r.y = e.size[1] / 2;
  },
  [L.Middle]: (r, e) => {
    r.x = e.size[0] / 2, r.y = e.size[1] / 2;
  },
  [L.MiddleRight]: (r, e) => {
    r.x = e.size[0], r.y = e.size[1] / 2;
  },
  [L.BottomLeft]: (r, e) => {
    r.x = 0, r.y = e.size[1];
  },
  [L.BottomMiddle]: (r, e) => {
    r.x = e.size[0] / 2, r.y = e.size[1];
  },
  [L.BottomRight]: (r, e) => {
    r.x = e.size[0], r.y = e.size[1];
  },
  [L.Custom]: (r, e) => {
    r.x = r.x || 0, r.y = r.y || 0;
  }
}, Br = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [0, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1]
].map((r) => {
  const e = Math.sqrt(gn(r, r));
  return Ie(r, 1 / -e);
}), Dc = {
  [L.TopLeft]: (r) => {
    r.paddingDirection = Ie(Br[0], r.padding);
  },
  [L.TopMiddle]: (r) => {
    r.paddingDirection = Ie(Br[1], r.padding);
  },
  [L.TopRight]: (r) => {
    r.paddingDirection = Ie(Br[2], r.padding);
  },
  [L.MiddleLeft]: (r) => {
    r.paddingDirection = Ie(Br[3], r.padding);
  },
  [L.Middle]: (r) => {
    r.paddingDirection = [0, 0];
  },
  [L.MiddleRight]: (r) => {
    r.paddingDirection = Ie(Br[5], r.padding);
  },
  [L.BottomLeft]: (r) => {
    r.paddingDirection = Ie(Br[6], r.padding);
  },
  [L.BottomMiddle]: (r) => {
    r.paddingDirection = Ie(Br[7], r.padding);
  },
  [L.BottomRight]: (r) => {
    r.paddingDirection = Ie(Br[8], r.padding);
  },
  [L.Custom]: (r) => {
    r.paddingDirection = r.paddingDirection;
  }
};
function Ue(r) {
  if (r)
    return (e) => {
      r({
        ...e,
        instances: e.instances.map((t) => t.parentLabel).filter(oe)
      });
    };
}
const yo = class yo extends De {
  constructor() {
    super(...arguments), this.fullUpdate = !1, this.glyphProvider = new le(), this.labelToGlyphs = /* @__PURE__ */ new Map(), this.labelToKerningRequest = /* @__PURE__ */ new Map(), this.labelWaitingOnGlyph = /* @__PURE__ */ new Map(), this.truncationWidth = -1, this.handleGlyphReady = (e) => {
      if (!e.parentLabel) {
        delete e.onReady;
        return;
      }
      const t = e.parentLabel, i = this.labelWaitingOnGlyph.get(e.parentLabel);
      if (i && i.has(e) && (i.delete(e), i.size <= 0)) {
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
      ji(this.props.customGlyphLayer || ya, {
        animate: this.props.animate,
        data: this.glyphProvider,
        key: `${this.id}.glyphs`,
        resourceKey: this.props.resourceKey,
        scaleMode: this.props.scaleMode || ar.BOUND_MAX,
        inTextArea: this.props.inTextArea,
        picking: this.props.picking,
        onMouseClick: Ue(this.props.onMouseClick),
        onMouseUp: Ue(this.props.onMouseUp),
        onMouseDown: Ue(this.props.onMouseDown),
        onMouseOut: Ue(this.props.onMouseOut),
        onMouseOver: Ue(this.props.onMouseOver),
        onMouseMove: Ue(this.props.onMouseMove),
        onMouseUpOutside: Ue(this.props.onMouseUpOutside),
        onTap: Ue(this.props.onTap),
        onTouchDown: Ue(this.props.onTouchDown),
        onTouchUp: Ue(this.props.onTouchUp),
        onTouchUpOutside: Ue(this.props.onTouchUpOutside),
        onTouchMove: Ue(this.props.onTouchMove),
        onTouchOut: Ue(this.props.onTouchOut),
        onTouchOver: Ue(this.props.onTouchOver),
        onTouchAllEnd: Ue(this.props.onTouchAllEnd),
        onTouchAllOut: Ue(this.props.onTouchAllOut)
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
      active: i,
      anchor: n,
      color: s,
      origin: a,
      fontSize: o,
      maxWidth: c,
      maxScale: l,
      letterSpacing: u
    } = this.propertyIds;
    for (let h = 0, d = e.length; h < d; ++h) {
      const [p, g, m] = e[h];
      switch (g) {
        case be.CHANGE:
          if (!this.labelToGlyphs.get(p)) {
            this.insert(p);
            continue;
          }
          m[t] !== void 0 ? (this.invalidateRequest(p), this.layoutGlyphs(p)) : m[i] !== void 0 && (p.active ? (this.layoutGlyphs(p), this.showGlyphs(p)) : this.hideGlyphs(p)), m[n] && this.updateAnchor(p), m[s] !== void 0 && this.updateGlyphColors(p), m[a] !== void 0 && this.updateGlyphOrigins(p), m[l] !== void 0 && this.updateGlyphMaxScales(p), m[o] !== void 0 && (this.invalidateRequest(p), this.layoutGlyphs(p)), m[c] !== void 0 && (this.invalidateRequest(p), this.layoutGlyphs(p)), m[u] !== void 0 && (this.invalidateRequest(p), this.layoutGlyphs(p));
          break;
        case be.INSERT:
          this.insert(p);
          break;
        case be.REMOVE: {
          const T = this.labelToGlyphs.get(p);
          if (T) {
            for (let x = 0, b = T.length; x < b; ++x)
              this.glyphProvider.remove(T[x]);
            this.labelToGlyphs.delete(p), this.labelToKerningRequest.delete(p), this.labelWaitingOnGlyph.delete(p);
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
      for (let i = 0, n = t.length; i < n; ++i)
        this.glyphProvider.remove(t[i]);
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
    const i = t.metrics;
    if (!i || !i.layout) return;
    const n = i.layout;
    this.updateGlyphs(e, n);
    const s = e.glyphs;
    e.size = n.size, Pc[e.anchor.type](e.anchor, e), Dc[e.anchor.type](e.anchor);
    const a = e.anchor, o = e.anchor.paddingDirection;
    for (let c = 0, l = Math.min(n.positions.length, s.length); c < l; ++c) {
      const u = n.positions[c], h = s[c];
      h.offset = u, h.fontScale = n.fontScale, h.anchor = [a.x || 0, a.y || 0], h.origin = Da(e.origin), h.padding = o || [0, 0], h.maxScale = e.maxScale;
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
      for (let i = 0, n = t.length; i < n; ++i)
        this.glyphProvider.add(t[i]);
  }
  /**
   * Updates the anchor position of the instance when set
   */
  updateAnchor(e) {
    const t = e.glyphs;
    if (!t) return;
    Pc[e.anchor.type](e.anchor, e), Dc[e.anchor.type](e.anchor);
    const i = e.anchor, n = e.anchor.paddingDirection;
    for (let s = 0, a = t.length; s < a; ++s)
      t[s].anchor = [i.x || 0, i.y || 0], t[s].padding = n || [0, 0];
  }
  /**
   * This ensures the correct number of glyphs is being provided for the label indicated.
   */
  updateGlyphs(e, t) {
    let i = this.labelToGlyphs.get(e);
    i || (i = [], this.labelToGlyphs.set(e, i));
    let n = this.labelWaitingOnGlyph.get(e);
    n || (n = /* @__PURE__ */ new Set(), this.labelWaitingOnGlyph.set(e, n));
    for (let s = 0, a = Math.min(i.length, t.glyphs.length); s < a; ++s) {
      const o = i[s];
      o.character !== t.glyphs[s] && (o.character = t.glyphs[s], (!o.request || !o.request.fontMap || !o.request.fontMap.glyphMap[o.character]) && n.add(o));
    }
    if (i.length < t.glyphs.length) {
      let s = 0;
      for (let a = i.length, o = t.glyphs.length; a < o; ++a, ++s) {
        const c = t.glyphs[a], l = new E0({
          character: c,
          color: e.color,
          origin: e.origin,
          maxScale: e.maxScale,
          onReady: this.handleGlyphReady
        });
        l.parentLabel = e, i.push(l), e.active && this.glyphProvider.add(l), n.add(l);
      }
    } else if (i.length > t.glyphs.length) {
      for (let s = t.glyphs.length, a = i.length; s < a; ++s) {
        const o = i[s];
        this.glyphProvider.remove(o);
      }
      for (; i.length > t.glyphs.length; ) i.pop();
    }
    e.glyphs = i;
  }
  /**
   * Updates the glyph colors to match the label's glyph colors
   */
  updateGlyphColors(e) {
    const t = e.glyphs;
    if (t)
      for (let i = 0, n = t.length; i < n; ++i)
        t[i].color = or(e.color);
  }
  /**
   * This updates all of the glyphs for the label to have the same position
   * as the label.
   */
  updateGlyphOrigins(e) {
    const t = e.glyphs;
    if (!t) return;
    const i = e.origin;
    for (let n = 0, s = t.length; n < s; ++n)
      t[n].origin = [i[0], i[1]];
  }
  /**
   * This updates all of the glyphs for the label to have the same position
   * as the label.
   */
  updateGlyphMaxScales(e) {
    const t = e.glyphs;
    if (!t) return;
    const i = e.maxScale;
    for (let n = 0, s = t.length; n < s; ++n)
      t[n].maxScale = i;
  }
  /**
   * Checks the label to ensure calculated kerning supports the text specified.
   *
   * Returns true when the kerning information is already available
   */
  updateKerning(e) {
    let t = this.labelToKerningRequest.get(e);
    const i = e.text;
    if (t) {
      if (t.kerningPairs && t.kerningPairs.indexOf(i) > -1)
        return !!t.fontMap;
      if (t.fontMap && !t.fontMap.supportsKerning(
        i.replace(/\s/g, "")
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
      return e.maxWidth > 0 && (n.maxWidth = e.maxWidth, n.truncation = this.props.truncation || L0), t = Hi({
        key: this.props.resourceKey || "",
        character: "",
        kerningPairs: [i],
        metrics: n
      }), e.preload ? (e.resourceTrigger = () => {
        e.onReady && e.onReady(e);
      }, this.resource.request(this, e, t)) : (this.resource.request(this, e, t, {
        resource: {
          type: ce.FONT,
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
yo.defaultProps = {
  key: "",
  data: new le()
};
let Ra = yo;
var F0 = Object.defineProperty, qt = (r, e, t, i) => {
  for (var n = void 0, s = r.length - 1, a; s >= 0; s--)
    (a = r[s]) && (n = a(e, t, n) || n);
  return n && F0(e, t, n), n;
};
const It = class th extends wt {
  constructor(e) {
    super(e), this.color = [0, 0, 0, 1], this.depth = 0, this.fontSize = 12, this.maxScale = 1, this.maxWidth = 0, this.origin = [0, 0], this.scale = 1, this.text = "", this.letterSpacing = 0, this.preload = !1, this.glyphs = [], this.size = [0, 0], this.truncatedText = "", this.anchor = {
      padding: 0,
      paddingDirection: [0, 0],
      type: L.TopLeft,
      x: 0,
      y: 0
    }, Je(this, th), this.anchor = e.anchor || this.anchor, this.color = e.color || this.color, this.depth = e.depth || this.depth, this.fontSize = e.fontSize || this.fontSize, this.maxScale = e.maxScale || this.maxScale, this.maxWidth = e.maxWidth || 0, this.onReady = e.onReady, this.origin = e.origin, this.preload = e.preload || !1, this.scale = e.scale || this.scale, this.text = e.text || this.text, this.letterSpacing = e.letterSpacing || this.letterSpacing, e.anchor && this.setAnchor(e.anchor);
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
    const t = [], i = this.text.indexOf(e);
    if (i < 0) return t;
    let n = 0;
    for (let s = 0, a = Math.min(this.text.length, i + e.length); s < a; ++s)
      Oi(this.text[s]) || (n++, s >= i && t.push(this.glyphs[n]));
    return t;
  }
  /**
   * Trigger for when resources are prepped for this instance
   */
  resourceTrigger() {
  }
};
qt([
  M
], It.prototype, "color");
qt([
  M
], It.prototype, "depth");
qt([
  M
], It.prototype, "fontSize");
qt([
  M
], It.prototype, "maxScale");
qt([
  M
], It.prototype, "maxWidth");
qt([
  M
], It.prototype, "origin");
qt([
  M
], It.prototype, "scale");
qt([
  M
], It.prototype, "text");
qt([
  M
], It.prototype, "letterSpacing");
qt([
  M
], It.prototype, "anchor");
let Be = It;
var B0 = Object.defineProperty, Ti = (r, e, t, i) => {
  for (var n = void 0, s = r.length - 1, a; s >= 0; s--)
    (a = r[s]) && (n = a(e, t, n) || n);
  return n && B0(e, t, n), n;
}, _a = /* @__PURE__ */ ((r) => (r[r.LEFT = 0] = "LEFT", r[r.RIGHT = 1] = "RIGHT", r[r.CENTERED = 2] = "CENTERED", r))(_a || {}), ir = /* @__PURE__ */ ((r) => (r[r.NONE = 0] = "NONE", r[r.CHARACTER = 1] = "CHARACTER", r[r.WORD = 2] = "WORD", r))(ir || {}), sn = /* @__PURE__ */ ((r) => (r[r.NEWLINE = 0] = "NEWLINE", r))(sn || {});
const qr = class rh extends Be {
  constructor(e) {
    super(e), this.maxHeight = 0, this.lineHeight = 0, this.wordWrap = 0, this.alignment = 0, this.labels = [], this.newLabels = [], this.borders = [], this.padding = [0, 0, 0, 0], this.borderWidth = 6, this.hasBorder = !0, this.spaceWidth = 0, Je(this, rh), this.color = e.color, this.origin = e.origin, this.oldOrigin = e.origin, this.text = e.text, this.fontSize = e.fontSize || this.fontSize, this.maxWidth = e.maxWidth || this.maxWidth, this.maxHeight = e.maxHeight || this.maxHeight, this.lineHeight = e.lineHeight || this.lineHeight, this.wordWrap = e.wordWrap || this.wordWrap, this.alignment = e.alignment || this.alignment, this.padding = e.padding || this.padding, this.borderWidth = e.borderWidth || this.borderWidth, this.hasBorder = e.hasBorder !== void 0 ? e.hasBorder : this.hasBorder, this.letterSpacing = e.letterSpacing || this.letterSpacing;
  }
};
Ti([
  M
], qr.prototype, "maxHeight");
Ti([
  M
], qr.prototype, "lineHeight");
Ti([
  M
], qr.prototype, "wordWrap");
Ti([
  M
], qr.prototype, "alignment");
Ti([
  M
], qr.prototype, "padding");
Ti([
  M
], qr.prototype, "borderWidth");
Ti([
  M
], qr.prototype, "hasBorder");
let tb = qr;
var P0 = Object.defineProperty, Kt = (r, e, t, i) => {
  for (var n = void 0, s = r.length - 1, a; s >= 0; s--)
    (a = r[s]) && (n = a(e, t, n) || n);
  return n && P0(e, t, n), n;
};
const D0 = {
  [L.TopLeft]: (r, e) => {
    r.x = -r.padding, r.y = -r.padding;
  },
  [L.TopMiddle]: (r, e) => {
    r.x = e.size[0] / 2, r.y = -r.padding;
  },
  [L.TopRight]: (r, e) => {
    r.x = e.size[0] + r.padding, r.y = -r.padding;
  },
  [L.MiddleLeft]: (r, e) => {
    r.x = -r.padding, r.y = e.size[1] / 2;
  },
  [L.Middle]: (r, e) => {
    r.x = e.size[0] / 2, r.y = e.size[1] / 2;
  },
  [L.MiddleRight]: (r, e) => {
    r.x = e.size[0] + r.padding, r.y = e.size[1] / 2;
  },
  [L.BottomLeft]: (r, e) => {
    r.x = -r.padding, r.y = e.size[1] + r.padding;
  },
  [L.BottomMiddle]: (r, e) => {
    r.x = e.size[0] / 2, r.y = e.size[1] + r.padding;
  },
  [L.BottomRight]: (r, e) => {
    r.x = e.size[0] + r.padding, r.y = e.size[1] + r.padding;
  },
  [L.Custom]: (r, e) => {
    r.x = r.x || 0, r.y = r.y || 0;
  }
}, St = class ih extends wt {
  constructor(e) {
    super(e), this.color = [0, 0, 0, 1], this.depth = 0, this.maxScale = 1, this.scale = 1, this.scaling = ar.BOUND_MAX, this.size = [1, 1], this.position = [0, 0], this.outline = 0, this.outlineColor = [0, 0, 0, 1], this._anchor = {
      padding: 0,
      type: L.TopLeft,
      x: 0,
      y: 0
    }, Je(this, ih), this.depth = e.depth || this.depth, this.color = e.color || this.color, this.scaling = e.scaling || this.scaling, this.position = e.position || this.position, this.size = e.size || this.size, this.outline = e.outline || this.outline, this.outlineColor = e.outlineColor || this.outlineColor, e.anchor && this.setAnchor(e.anchor);
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
    D0[t.type](t, this), this._anchor = t;
  }
};
Kt([
  M
], St.prototype, "color");
Kt([
  M
], St.prototype, "depth");
Kt([
  M
], St.prototype, "maxScale");
Kt([
  M
], St.prototype, "scale");
Kt([
  M
], St.prototype, "scaling");
Kt([
  M
], St.prototype, "size");
Kt([
  M
], St.prototype, "position");
Kt([
  M
], St.prototype, "outline");
Kt([
  M
], St.prototype, "outlineColor");
Kt([
  M
], St.prototype, "_anchor");
let U0 = St;
var k0 = Object.defineProperty, fo = (r, e, t, i) => {
  for (var n = void 0, s = r.length - 1, a; s >= 0; s--)
    (a = r[s]) && (n = a(e, t, n) || n);
  return n && k0(e, t, n), n;
};
const Ls = class nh extends U0 {
  constructor(e) {
    super(e), this.fontScale = 1, this.textAreaOrigin = [0, 0], this.textAreaAnchor = [0, 0], Je(this, nh), this.fontScale = e.fontScale || this.fontScale, this.textAreaOrigin = e.textAreaOrigin || this.textAreaOrigin, this.textAreaAnchor = e.textAreaAnchor || this.textAreaAnchor;
  }
};
fo([
  M
], Ls.prototype, "fontScale");
fo([
  M
], Ls.prototype, "textAreaOrigin");
fo([
  M
], Ls.prototype, "textAreaAnchor");
let kn = Ls;
const G0 = `precision highp float;

varying vec4 vertexColor;

void main() {
  gl_FragColor = vertexColor;
}
`, z0 = `precision highp float;

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
`, rt = class rt extends De {
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
    }, i = {
      0: 0,
      1: 0,
      2: 0,
      3: 1,
      4: 1,
      5: 1
    }, { scaleFactor: n = () => 1 } = this.props;
    return {
      fs: G0,
      instanceAttributes: [
        {
          easing: e.location,
          name: rt.attributeNames.location,
          size: S.TWO,
          update: (s) => s.position
        },
        {
          name: rt.attributeNames.anchor,
          size: S.TWO,
          update: (s) => [s.anchor.x || 0, s.anchor.y || 0]
        },
        {
          name: rt.attributeNames.size,
          size: S.TWO,
          update: (s) => s.size
        },
        {
          name: rt.attributeNames.depth,
          size: S.ONE,
          update: (s) => [s.depth]
        },
        {
          name: rt.attributeNames.scaling,
          size: S.ONE,
          update: (s) => [s.scaling]
        },
        {
          easing: e.color,
          name: rt.attributeNames.color,
          size: S.FOUR,
          update: (s) => s.color
        },
        {
          name: rt.attributeNames.scale,
          size: S.ONE,
          update: (s) => [s.scale]
        },
        {
          name: rt.attributeNames.maxScale,
          size: S.ONE,
          update: (s) => [s.maxScale]
        },
        {
          name: rt.attributeNames.fontScale,
          size: S.ONE,
          update: (s) => [s.fontScale]
        },
        {
          name: "textAreaOrigin",
          size: S.TWO,
          update: (s) => s.textAreaOrigin
        },
        {
          name: "textAreaAnchor",
          size: S.TWO,
          update: (s) => s.textAreaAnchor
        }
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: _.ONE,
          update: (s) => [n()]
        }
      ],
      vertexAttributes: [
        {
          name: "normals",
          size: ze.TWO,
          update: (s) => [
            // Normal
            t[s],
            // The side of the quad
            i[s]
          ]
        }
      ],
      vertexCount: 6,
      vs: z0
    };
  }
  getMaterialOptions() {
    return lt.transparentShapeBlending;
  }
};
rt.defaultProps = {
  key: "",
  data: new le()
}, rt.attributeNames = {
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
let Aa = rt;
const Pr = {
  [L.TopLeft]: (r) => [0, 0],
  [L.TopMiddle]: (r) => [
    r.maxWidth / 2,
    0
  ],
  [L.TopRight]: (r) => [
    r.maxWidth,
    0
  ],
  [L.MiddleLeft]: (r) => [
    0,
    r.maxHeight / 2
  ],
  [L.Middle]: (r) => [
    r.maxWidth / 2,
    r.maxHeight / 2
  ],
  [L.MiddleRight]: (r) => [
    r.maxWidth,
    r.maxHeight / 2
  ],
  [L.BottomLeft]: (r) => [
    0,
    r.maxHeight
  ],
  [L.BottomMiddle]: (r) => [
    r.maxWidth / 2,
    r.maxHeight
  ],
  [L.BottomRight]: (r) => [
    r.maxWidth,
    r.maxHeight
  ],
  [L.Custom]: (r) => [
    r.anchor.x || 0,
    r.anchor.y || 0
  ]
};
function Gn(r, e) {
  let t = Number.MAX_SAFE_INTEGER;
  for (let i = 0, n = r.length; i < n; i++) {
    const s = r[i], a = e.get(s);
    a === 0 ? t = 0 : a && a < t && (t = a);
  }
  return t === Number.MAX_SAFE_INTEGER ? 0 : t;
}
function V0(r) {
  const e = [], t = r.split(yh);
  for (let s = 0, a = t.length - 1; s < a; s++)
    t[s].split(" ").forEach((l) => {
      l !== "" && e.push(l);
    }), e.push(`
`);
  return t[t.length - 1].split(" ").forEach((s) => {
    s !== "" && e.push(s);
  }), e;
}
function $0(r, e) {
  const t = /* @__PURE__ */ new Map();
  if (e.fontMap) {
    const i = e.fontMap.fontSource.size, n = r.fontSize / i, s = e.fontMap, a = r.text.replace(/\s/g, "");
    let o = Number.MAX_SAFE_INTEGER, c = 0, l, u = "";
    for (let h = 0, d = a.length; h < d; ++h) {
      const p = a[h];
      l = 0, u && (l = s.kerning[u][p][1] || 0), c = c + l * n, t.set(p, c), o = Math.min(c, o), u = p;
    }
    t.forEach((h, d) => {
      t.set(d, h - o);
    });
  }
  return t;
}
function W0(r, e, t) {
  const i = [], n = t.fontMap ? t.fontMap.fontSource.size : e.fontSize, s = e.fontSize / n;
  let a = "", o = 0, c = [0, 0];
  for (let l = 0, u = r.text.length; l < u; l++) {
    const h = r.text[l];
    if (t.fontMap) {
      let d = [0, 0];
      a && (d = t.fontMap.kerning[a][h] || [0, 0]), c = Wr(c, Ie(d, s)), l !== 0 && (c = Wr(c, [e.letterSpacing, 0]));
      const p = t.fontMap.glyphMap[h];
      o = c[0] + p.pixelWidth * s, i.push(o), a = h;
    }
  }
  return i;
}
const Ro = class Ro extends De {
  constructor() {
    super(...arguments), this.providers = {
      /** Provider for the label layer this layer manages */
      labels: new le(),
      /** Provider for the border layer that renders the border of text area */
      borders: new le()
    }, this.fullUpdate = !1, this.areaToLabels = /* @__PURE__ */ new Map(), this.areaToLines = /* @__PURE__ */ new Map(), this.areaWaitingOnLabel = /* @__PURE__ */ new Map(), this.areaTokerningRequest = /* @__PURE__ */ new Map(), this.areaToWords = /* @__PURE__ */ new Map(), this.labelsInLine = [], this.handleLabelReady = (e) => {
      if (!e.parentTextArea) {
        delete e.onReady;
        return;
      }
      const t = e.parentTextArea, i = this.areaWaitingOnLabel.get(t);
      if (i && i.has(e) && (i.delete(e), i.size <= 0)) {
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
    const e = this.props.animateLabel || {}, t = this.props.animateBorder || {}, i = this.props.scaling;
    return [
      ji(Ra, {
        animate: e,
        customGlyphLayer: this.props.customGlyphLayer,
        data: this.providers.labels,
        key: `${this.id}.labels`,
        resourceKey: this.props.resourceKey,
        scaleMode: i,
        inTextArea: !0
      }),
      ji(Aa, {
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
      const T = e[0][0];
      this.propertyIds = this.getInstanceObservableIds(T, [
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
      alignment: i,
      borderWidth: n,
      color: s,
      fontSize: a,
      hasBorder: o,
      letterSpacing: c,
      lineHeight: l,
      maxHeight: u,
      maxWidth: h,
      origin: d,
      padding: p,
      text: g,
      wordWrap: m
    } = this.propertyIds;
    for (let T = 0, x = e.length; T < x; ++T) {
      const [b, v, E] = e[T];
      switch (v) {
        case be.CHANGE:
          if (!this.areaToLabels.get(b)) {
            this.insert(b);
            continue;
          }
          E[g] !== void 0 ? (this.clear(b), this.updateLabels(b), this.layout(b)) : E[t] !== void 0 && (b.active ? (this.layout(b), this.showLabels(b)) : this.hideLabels(b)), E[i] !== void 0 && (this.clear(b), this.updateLabels(b), this.layoutLabels(b)), E[s] !== void 0 && this.updateLabelColors(b), E[d] !== void 0 && this.updateLabelOrigins(b), E[a] !== void 0 && this.updateLabelFontSizes(b), E[m] !== void 0 && this.updateLabelLineWrap(b), E[l] !== void 0 && this.updateLabelLineHeight(b), E[h] !== void 0 && this.updateTextAreaSize(b), E[u] !== void 0 && this.updateTextAreaSize(b), E[p] !== void 0 && this.updateTextAreaSize(b), E[n] !== void 0 && this.updateBorderWidth(b), E[o] !== void 0 && this.updateBorder(b), E[c] !== void 0 && this.updateLetterSpacing(b);
          break;
        case be.INSERT:
          this.insert(b);
          break;
        case be.REMOVE: {
          const y = this.areaToLabels.get(b);
          if (y) {
            for (let C = 0, I = y.length; C < I; ++C) {
              const R = y[C];
              R instanceof Be && this.providers.labels.remove(R);
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
      for (let i = 0, n = t.length; i < n; ++i) {
        const s = t[i];
        s instanceof Be && this.providers.labels.remove(s);
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
    for (let n = 0, s = t.length; n < s; n++) {
      const a = t[n];
      a instanceof Be && this.providers.labels.remove(a);
    }
    e.labels = [];
    const i = e.newLabels;
    for (let n = 0, s = i.length; n < s; n++) {
      const a = i[n];
      a instanceof Be && this.providers.labels.remove(a);
    }
    e.newLabels = [], this.areaToLabels.delete(e), this.areaWaitingOnLabel.delete(e), this.areaToWords.delete(e);
  }
  /** When a label exceeds the maxWidth of a textArea, sperate it into several parts */
  seperateLabel(e, t, i, n, s, a, o, c, l) {
    const u = e.padding[0], h = e.padding[1] || 0, d = e.padding[2] || 0, p = e.padding[3] || 0, g = e.maxWidth - p - h, m = e.maxHeight - u - d, T = e.origin[0], x = e.origin[1];
    t.active = !1;
    const b = n.substring(0, s + 1), v = Gn(b, i), E = Pr[e.anchor.type](e), y = new Be({
      anchor: {
        padding: 0,
        type: L.Custom,
        paddingDirection: [
          a + p,
          o + u + v
        ],
        x: E[0],
        y: E[1]
      },
      color: e.color,
      fontSize: e.fontSize,
      letterSpacing: e.letterSpacing,
      origin: [T, x],
      text: b
    });
    if (y.size = [l[s], t.size[1]], this.providers.labels.add(y), e.newLabels.push(y), this.labelsInLine.push(y), a += y.getWidth() + c, e.wordWrap === ir.CHARACTER || e.wordWrap === ir.WORD) {
      if (this.setTextAlignment(
        a,
        o,
        c,
        g,
        e.alignment
      ), a = 0, o += e.lineHeight, o + e.lineHeight <= m) {
        let C = l[l.length - 1] - l[s];
        for (; C > g && o + e.lineHeight <= m; ) {
          let I = l.length - 1;
          for (; l[I] - l[s] > g; )
            I--;
          const R = n.substring(s + 1, I + 1), $ = Gn(R, i), z = new Be({
            anchor: {
              padding: 0,
              type: L.Custom,
              paddingDirection: [
                a + p,
                o + u + $
              ],
              x: E[0],
              y: E[1]
            },
            color: e.color,
            fontSize: e.fontSize,
            letterSpacing: e.letterSpacing,
            origin: [T, x],
            text: R
          });
          z.size = [
            l[I] - l[s],
            t.size[1]
          ], a += z.getWidth() + c, this.labelsInLine.push(z), this.providers.labels.add(z), e.newLabels.push(z), this.setTextAlignment(
            a,
            o,
            c,
            g,
            e.alignment
          ), a = 0, o += e.lineHeight, s = I, C = l[l.length - 1] - l[s];
        }
        if (o + e.lineHeight <= m) {
          const I = n.substring(s + 1), R = Gn(I, i), $ = new Be({
            anchor: {
              padding: 0,
              type: L.Custom,
              paddingDirection: [
                a + p,
                o + u + R
              ],
              x: E[0],
              y: E[1]
            },
            color: e.color,
            fontSize: e.fontSize,
            letterSpacing: e.letterSpacing,
            origin: [T, x],
            text: I
          });
          $.size = [
            l[l.length - 1] - l[s],
            t.size[1]
          ], this.labelsInLine.push($);
          const z = [];
          for (let F = s + 1; F < l.length; F++)
            z.push(l[F] - l[s]);
          this.providers.labels.add($), e.newLabels.push($), a += $.getWidth() + c;
        }
      }
    } else e.wordWrap === ir.NONE && (a += y.getWidth() + c);
    return [a, o];
  }
  /**
   * This updates textAreaInstance after lineWrap is changed
   */
  updateLabelLineWrap(e) {
    const t = this.areaToLabels.get(e);
    if (t) {
      for (let i = 0, n = t.length; i < n; ++i) {
        const s = t[i];
        s instanceof Be && (s.active = !0);
      }
      for (let i = 0, n = e.newLabels.length; i < n; ++i) {
        const s = e.newLabels[i];
        this.providers.labels.remove(s);
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
      for (let i = 0, n = t.length; i < n; ++i) {
        const s = t[i];
        s instanceof Be && (s.active = !0);
      }
      for (let i = 0, n = e.newLabels.length; i < n; ++i) {
        const s = e.newLabels[i];
        this.providers.labels.remove(s);
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
      for (let i = 0, n = t.length; i < n; ++i) {
        const s = t[i];
        s instanceof Be && (s.active = !0);
      }
      for (let i = 0, n = e.newLabels.length; i < n; ++i) {
        const s = e.newLabels[i];
        this.providers.labels.remove(s);
      }
      e.newLabels = [];
      for (let i = 0, n = e.borders.length; i < n; ++i) {
        const s = e.borders[i];
        this.providers.borders.remove(s);
      }
      e.borders = [], this.layoutBorder(e), this.layoutLabels(e);
    }
  }
  /**
   * Update thickness of border
   */
  updateBorderWidth(e) {
    for (let t = 0, i = e.borders.length; t < i; ++t) {
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
      for (let t = 0, i = e.borders.length; t < i; ++t) {
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
  setTextAlignment(e, t, i, n, s) {
    if (e - i < n && s !== _a.LEFT) {
      const a = n - e + i, o = s === _a.RIGHT ? a : a / 2;
      this.labelsInLine.forEach((c) => {
        const l = c.anchor;
        c.anchor = {
          padding: l.padding,
          type: L.Custom,
          paddingDirection: [
            (l.paddingDirection ? l.paddingDirection[0] : 0) + o,
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
      const i = t.fontMap ? t.fontMap.fontSource.size : e.fontSize, n = e.fontSize / i, s = this.props.scaling, a = e.borderWidth, o = new kn({
        color: e.color,
        fontScale: n,
        scaling: s,
        size: [e.maxWidth + 2 * a, a],
        textAreaOrigin: e.origin,
        textAreaAnchor: Pr[e.anchor.type](e),
        position: [-a, -a]
      }), c = new kn({
        color: e.color,
        fontScale: n,
        scaling: s,
        size: [a, e.maxHeight + 2 * a],
        textAreaOrigin: e.origin,
        textAreaAnchor: Pr[e.anchor.type](e),
        position: [-a, -a]
      }), l = new kn({
        color: e.color,
        fontScale: n,
        scaling: s,
        size: [a, e.maxHeight + 2 * a],
        textAreaOrigin: e.origin,
        textAreaAnchor: Pr[e.anchor.type](e),
        position: [e.maxWidth, -a]
      }), u = new kn({
        color: e.color,
        fontScale: n,
        scaling: s,
        size: [e.maxWidth + 2 * a, a],
        textAreaOrigin: e.origin,
        textAreaAnchor: Pr[e.anchor.type](e),
        position: [-a, e.maxHeight]
      });
      this.providers.borders.add(o), this.providers.borders.add(c), this.providers.borders.add(l), this.providers.borders.add(u), e.borders.push(o), e.borders.push(c), e.borders.push(l), e.borders.push(u);
    }
  }
  /**
   * Calculate the positions of labels
   */
  layoutLabels(e) {
    const t = this.areaTokerningRequest.get(e);
    if (!t) return;
    const i = e.padding[0], n = e.padding[1] || 0, s = e.padding[2] || 0, a = e.padding[3] || 0, o = e.maxWidth - a - n, c = e.maxHeight - i - s, l = e.origin[0], u = e.origin[1];
    let h = 0;
    if (e.spaceWidth)
      h = e.spaceWidth;
    else {
      if (t.fontMap) {
        const m = t.fontMap.fontSource.size, T = e.fontSize / m;
        h = t.fontMap.spaceWidth * T;
      } else
        h = this.props.whiteSpaceKerning || e.fontSize / 2;
      e.spaceWidth = h;
    }
    const d = $0(e, t);
    let p = 0, g = 0;
    this.labelsInLine = [];
    for (let m = 0, T = e.labels.length; m < T; ++m) {
      const x = e.labels[m];
      if (x instanceof Be) {
        const b = x.getWidth(), v = Gn(x.text, d), E = W0(x, e, t);
        if (g + e.lineHeight <= c && E[0] <= o)
          if (p + b <= o) {
            x.origin = [l, u];
            const y = Pr[e.anchor.type](e);
            x.anchor = {
              padding: 0,
              paddingDirection: [
                p + a,
                g + i + v
              ],
              type: L.Custom,
              x: y[0],
              y: y[1]
            }, p += b + h, this.labelsInLine.push(x), p >= o && e.wordWrap === ir.CHARACTER && m + 1 < T && e.labels[m + 1] !== sn.NEWLINE && (this.setTextAlignment(
              p,
              g,
              h,
              o,
              e.alignment
            ), p = 0, g += e.lineHeight);
          } else if (e.wordWrap === ir.WORD && x.getWidth() <= e.maxWidth)
            if (this.setTextAlignment(
              p,
              g,
              h,
              o,
              e.alignment
            ), p = 0, g += e.lineHeight, g + e.lineHeight <= c) {
              x.origin = [l, u];
              const y = Pr[e.anchor.type](e);
              x.anchor = {
                padding: 0,
                paddingDirection: [
                  p + a,
                  g + i + v
                ],
                type: L.Custom,
                x: y[0],
                y: y[1]
              }, this.labelsInLine.push(x), p += x.getWidth() + h;
            } else
              x.active = !1;
          else {
            const y = o - p;
            let C = E.length - 1;
            const I = x.text;
            for (; E[C] > y; )
              C--;
            if (C >= 0) {
              const R = this.seperateLabel(
                e,
                x,
                d,
                I,
                C,
                p,
                g,
                h,
                E
              );
              p = R[0], g = R[1];
            } else if (e.wordWrap === ir.CHARACTER || e.wordWrap === ir.WORD)
              if (this.setTextAlignment(
                p,
                g,
                h,
                o,
                e.alignment
              ), g += e.lineHeight, p = 0, g + e.lineHeight < c)
                if (p + x.getWidth() <= o) {
                  x.origin = [l, u];
                  const R = Pr[e.anchor.type](e);
                  x.anchor = {
                    padding: 0,
                    paddingDirection: [
                      p + a,
                      g + i + v
                    ],
                    type: L.Custom,
                    x: R[0],
                    y: R[1]
                  }, this.labelsInLine.push(x), p += x.getWidth() + h, p >= o && m + 1 < T && e.labels[m + 1] !== sn.NEWLINE && (this.setTextAlignment(
                    p,
                    g,
                    h,
                    o,
                    e.alignment
                  ), p = 0, g += e.lineHeight);
                } else {
                  const R = o - p;
                  let $ = E.length - 1;
                  const z = x.text;
                  for (; E[$] > R; )
                    $--;
                  if ($ >= 0) {
                    const F = this.seperateLabel(
                      e,
                      x,
                      d,
                      z,
                      $,
                      p,
                      g,
                      h,
                      E
                    );
                    p = F[0], g = F[1];
                  }
                }
              else
                x.active = !1;
            else e.wordWrap === ir.NONE && (x.active = !1);
          }
        else
          x.active = !1;
      } else x === sn.NEWLINE && (this.setTextAlignment(
        p,
        g,
        h,
        o,
        e.alignment
      ), p = 0, g += e.lineHeight);
    }
    this.setTextAlignment(
      p,
      g,
      h,
      o,
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
    const i = this.areaWaitingOnLabel.get(e);
    if (i && i.size > 0 || !e.active) return;
    const n = this.areaToLabels.get(e);
    !n || n.length === 0 || (this.updateLabels(e), this.layoutBorder(e), this.layoutLabels(e));
  }
  /**
   * Update kerning of textArea Instance, retrieve kerning request from map or create a new one
   */
  updateKerning(e) {
    let t = this.areaTokerningRequest.get(e);
    const i = e.text;
    if (t) {
      if (t.kerningPairs && t.kerningPairs.indexOf(i) > -1)
        return !!t.fontMap;
      if (t.fontMap && !t.fontMap.supportsKerning(i))
        this.areaTokerningRequest.delete(e), t = void 0;
      else
        return !1;
    } else {
      const n = {
        fontSize: e.fontSize,
        text: e.text,
        letterSpacing: e.letterSpacing
      };
      return t = Hi({
        character: "",
        key: this.props.resourceKey || "",
        kerningPairs: [i],
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
      for (let i = 0, n = t.length; i < n; ++i) {
        const s = t[i];
        s instanceof Be && this.providers.labels.add(s);
      }
  }
  /**
   * This ensures the correct number of glyphs is being provided for the label indicated.
   */
  updateLabels(e) {
    let t = this.areaToLabels.get(e);
    const i = e.padding[0], n = e.padding[3] || 0, s = e.origin[0] + n, a = e.origin[1] + i;
    t || (t = [], this.areaToLabels.set(e, t));
    let o = this.areaWaitingOnLabel.get(e);
    o || (o = /* @__PURE__ */ new Set(), this.areaWaitingOnLabel.set(e, o));
    let c = this.areaToWords.get(e);
    if (c || (c = V0(e.text)), t.length < c.length)
      for (let l = t.length, u = c.length; l < u; ++l) {
        const h = c[l];
        if (h === `
`)
          t.push(sn.NEWLINE);
        else {
          const d = new Be({
            active: !1,
            color: e.color,
            fontSize: e.fontSize,
            letterSpacing: e.letterSpacing,
            text: h,
            origin: [s, a],
            onReady: this.handleLabelReady
          });
          d.parentTextArea = e, t.push(d), this.providers.labels.add(d), o.add(d);
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
      for (let i = 0, n = t.length; i < n; ++i) {
        const s = t[i];
        s instanceof Be && (s.color = or(e.color));
      }
      for (let i = 0, n = e.newLabels.length; i < n; ++i)
        e.newLabels[i].color = or(e.color);
      for (let i = 0, n = e.borders.length; i < n; ++i)
        e.borders[i].color = or(e.color);
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
    const i = e.origin, n = e.oldOrigin;
    for (let s = 0, a = t.length; s < a; ++s) {
      const o = t[s];
      if (o instanceof Be) {
        const c = o.origin;
        o.origin = [
          c[0] + i[0] - n[0],
          c[1] + i[1] - n[1]
        ];
      }
    }
    for (let s = 0, a = e.newLabels.length; s < a; ++s) {
      const o = e.newLabels[s];
      if (o instanceof Be) {
        const c = o.origin;
        o.origin = [
          c[0] + i[0] - n[0],
          c[1] + i[1] - n[1]
        ];
      }
    }
    for (let s = 0, a = e.borders.length; s < a; ++s) {
      const o = e.borders[s];
      o.position = [
        o.position[0] + i[0] - n[0],
        o.position[1] + i[1] - n[1]
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
Ro.defaultProps = {
  key: "",
  data: new le(),
  scaling: ar.ALWAYS
};
let Uc = Ro;
const j0 = `precision highp float;

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
`, H0 = `precision highp float;

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
`, je = class je extends De {
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
    }, i = {
      0: 0,
      1: 0,
      2: 0,
      3: 1,
      4: 1,
      5: 1
    }, { scaleFactor: n = () => 1 } = this.props;
    return {
      fs: j0,
      instanceAttributes: [
        {
          easing: e.location,
          name: je.attributeNames.location,
          size: S.TWO,
          update: (s) => s.position
        },
        {
          name: je.attributeNames.anchor,
          size: S.TWO,
          update: (s) => [s.anchor.x || 0, s.anchor.y || 0]
        },
        {
          easing: e.size,
          name: je.attributeNames.size,
          size: S.TWO,
          update: (s) => s.size
        },
        {
          name: je.attributeNames.depth,
          size: S.ONE,
          update: (s) => [s.depth]
        },
        {
          name: je.attributeNames.scaling,
          size: S.ONE,
          update: (s) => [s.scaling]
        },
        {
          easing: e.color,
          name: je.attributeNames.color,
          size: S.FOUR,
          update: (s) => s.color
        },
        {
          name: je.attributeNames.scale,
          size: S.ONE,
          update: (s) => [s.scale]
        },
        {
          name: je.attributeNames.maxScale,
          size: S.ONE,
          update: (s) => [s.maxScale]
        },
        {
          easing: e.outline,
          name: je.attributeNames.outline,
          size: S.ONE,
          update: (s) => [s.outline]
        },
        {
          easing: e.outlineColor,
          name: je.attributeNames.outlineColor,
          size: S.FOUR,
          update: (s) => s.outlineColor
        }
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: _.ONE,
          update: (s) => [n()]
        }
      ],
      vertexAttributes: [
        {
          name: "normals",
          size: ze.TWO,
          update: (s) => [
            // Normal
            t[s],
            // The side of the quad
            i[s]
          ]
        }
      ],
      vertexCount: 6,
      vs: H0
    };
  }
  getMaterialOptions() {
    return lt.transparentShapeBlending;
  }
};
je.defaultProps = {
  key: "",
  data: new le()
}, je.attributeNames = {
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
let kc = je;
var X0 = Object.defineProperty, En = (r, e, t, i) => {
  for (var n = void 0, s = r.length - 1, a; s >= 0; s--)
    (a = r[s]) && (n = a(e, t, n) || n);
  return n && X0(e, t, n), n;
};
const Yi = class sh extends wt {
  constructor(e) {
    super(e), this.color = [1, 1, 1, 1], this.depth = 0, this.radius = 0, this.thickness = 1, this.center = [0, 0], Je(this, sh), this.color = e.color || this.color, this.depth = e.depth || this.depth, this.radius = e.radius || this.radius, this.thickness = e.thickness || this.thickness, this.center = e.center || this.center;
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
En([
  M
], Yi.prototype, "color");
En([
  M
], Yi.prototype, "depth");
En([
  M
], Yi.prototype, "radius");
En([
  M
], Yi.prototype, "thickness");
En([
  M
], Yi.prototype, "center");
let rb = Yi;
const Q0 = `precision highp float;

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
`, Y0 = `precision highp float;

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
`, sr = class sr extends De {
  /**
   * Define our shader and it's inputs
   */
  initShader() {
    const e = this.props.scaleFactor || (() => 1), t = this.props.animate || {}, {
      color: i,
      center: n,
      radius: s
    } = t, a = {
      0: 1,
      1: 1,
      2: -1,
      3: 1,
      4: -1,
      5: -1
    }, o = {
      0: -1,
      1: -1,
      2: -1,
      3: 1,
      4: 1,
      5: 1
    };
    return {
      fs: Q0,
      instanceAttributes: [
        {
          easing: n,
          name: sr.attributeNames.center,
          size: S.TWO,
          update: (c) => c.center
        },
        {
          easing: s,
          name: sr.attributeNames.radius,
          size: S.ONE,
          update: (c) => [c.radius]
        },
        {
          name: sr.attributeNames.depth,
          size: S.ONE,
          update: (c) => [c.depth]
        },
        {
          easing: i,
          name: sr.attributeNames.color,
          size: S.FOUR,
          update: (c) => c.color
        },
        {
          name: sr.attributeNames.thickness,
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
          size: ze.TWO,
          update: (c) => [
            // Normal
            a[c],
            // The side of the quad
            o[c]
          ]
        }
      ],
      vertexCount: 6,
      vs: Y0
    };
  }
  getMaterialOptions() {
    return lt.transparentShapeBlending;
  }
};
sr.defaultProps = {
  key: "",
  data: new le()
}, sr.attributeNames = {
  center: "center",
  radius: "radius",
  depth: "depth",
  color: "color",
  thickness: "thickness"
};
let Gc = sr;
const q0 = `// These are projection methods for basic camera operations
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
`, K0 = `
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
ve.register([
  {
    moduleId: "camera",
    description: K0,
    // No explicit functional content is required, we will only use the uniforms for injecting information for this
    // module.
    content: "",
    compatibility: A.ALL,
    uniforms: (r) => [
      // This injects the projection matrix from the view camera
      {
        name: "projection",
        size: _.MATRIX4,
        update: () => r.view.props.camera.projection
      },
      {
        name: "viewProjection",
        size: _.MATRIX4,
        update: () => r.view.props.camera.viewProjection
      },
      {
        name: "cameraNear",
        size: _.ONE,
        update: () => r.view.props.camera.projectionOptions.near
      },
      {
        name: "cameraFar",
        size: _.ONE,
        update: () => r.view.props.camera.projectionOptions.far
      },
      // This injects the model view matrix from the view camera
      {
        name: "view",
        size: _.MATRIX4,
        update: () => r.view.props.camera.view
      },
      // This injects the camera's current position
      {
        name: "cameraPosition",
        size: _.THREE,
        update: () => r.view.props.camera.position
      },
      // This injects the camera's current scale
      {
        name: "cameraScale",
        size: _.THREE,
        update: () => r.view.props.camera.scale
      },
      // This injects the camera's Euler rotation
      {
        name: "cameraRotation",
        size: _.THREE,
        update: () => r.view.props.camera.scale
      },
      // This injects the pixel width and height of the view
      {
        shaderInjection: A.ALL,
        name: "viewSize",
        size: _.TWO,
        update: () => [
          r.view.viewBounds.width,
          r.view.viewBounds.height
        ]
      },
      // This injects the current layer's pixel ratio so pixel ratio dependent items can react to it
      // Things like gl_PointSize will need this metric if not working in clip space
      {
        shaderInjection: A.ALL,
        name: "pixelRatio",
        size: _.ONE,
        update: () => [r.view.pixelRatio]
      }
    ]
  },
  {
    moduleId: "projection",
    content: q0,
    compatibility: A.ALL
  }
]);
const ah = `
This provides frame timing information
or how many frames have been rendered.

Constants:
float currentTime;
float currentFrame;
`;
ve.register({
  moduleId: "frame",
  description: ah,
  content: "",
  compatibility: A.ALL,
  uniforms: (r) => [
    // This will be the current frame's current time which is updated in the layer's surface draw call
    {
      name: "currentTime",
      size: _.ONE,
      shaderInjection: A.ALL,
      update: () => [r.surface.frameMetrics.currentTime]
    },
    {
      name: "currentFrame",
      size: _.ONE,
      shaderInjection: A.ALL,
      update: () => [r.surface.frameMetrics.currentFrame]
    }
  ]
});
ve.register({
  moduleId: "time",
  description: ah,
  content: "",
  compatibility: A.ALL,
  uniforms: (r) => [
    // This will be the current frame's current time which is updated in the layer's surface draw call
    {
      name: "time",
      size: _.ONE,
      shaderInjection: A.ALL,
      update: () => [r.surface.frameMetrics.currentTime]
    }
  ]
});
const Z0 = `vec3 rgb2hsv(vec3 c) {
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
`, J0 = `
Provides methods that converts colors to
HSV values and back. This makes it
easier to deal with hue saturation and
lightness levels.

Methods:
vec3 rgb2hsv(vec3 c);
vec3 hsv2rgb(vec3 c);
`;
ve.register({
  moduleId: "hsv",
  description: J0,
  content: Z0,
  compatibility: A.ALL
});
const ex = `
This is an internal shader module that
helps establish the instancing system.
Not recommended for use unless you
really know how to utilize it properly.

Attributes:
float _active;
float instance;
`;
ve.register({
  moduleId: "instancing",
  description: ex,
  content: "",
  compatibility: A.ALL,
  instanceAttributes: (r) => {
    const e = {
      name: "_active",
      size: S.ONE,
      update: (t) => [t.active ? 1 : 0]
    };
    return r.shaderIOInfo.activeAttribute = e, [e];
  },
  vertexAttributes: (r) => r.bufferType === ae.UNIFORM ? [
    // We add an inherent instance attribute to our vertices so they can determine the instancing
    // Data to retrieve.
    {
      name: "instance",
      size: ze.ONE,
      // We no op this as our geometry generating routine will establish the values needed here
      update: () => [0]
    }
  ] : []
});
const tx = `\${import: PI, PI2, fsin, fcos, wrap}

/**
 * A circular arc interpolator
 */
vec2 arc(float t, vec2 center, float radius, float start, float end) {
  float angle = wrap((end - start) * t + start, 0.0, PI2);
  return center + vec2(fcos(angle), fsin(angle)) * radius;
}
`, rx = `/**
 * Single control point bezier curve
 */
vec2 bezier1(float t, vec2 p1, vec2 p2, vec2 c1) {
  return (1.0 - t) * (1.0 - t) * p1 + 2.0 * t * (1.0 - t) * c1 + t * t * p2;
}
`, ix = `/**
 * Two control point bezier curve
 */
vec2 bezier2(float t, vec2 p1, vec2 p2, vec2 c1, vec2 c2) {
  float t1 = 1.0 - t;
  return pow(t1, 3.0) * p1 + 3.0 * t * pow(t1, 2.0) * c1 + 3.0 * pow(t, 2.0) * t1 * c2 + pow(t, 3.0) * p2;
}`, nx = `float PI = 3.14159265;
`, sx = `float PI_2 = 1.5707963268;
`, ax = `float PI_4 = 0.7853981634;
`, ox = `// This is 1 / pi
float PI_INV = 0.3183098862;
`, cx = `float PI2 = 6.2831853;
`, lx = `// This is 1 / (pi * 2.0)
float PI2_INV = 0.1591549431;
`, ux = `float toDegrees = 57.2957795131;
`, hx = `float toRadians = 0.01745329252;
`, dx = `\${import: PI, PI2, PI_2}

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
`, fx = `float fmod(float x, float m, float m_inv) {
  return x - m * floor(x * m_inv);
}
`, px = `\${import: PI, PI2}

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
`, gx = `float wrap(float value, float start, float end) {
  float width = end - start;
  float offsetValue = value - start;

  return (offsetValue - (floor(offsetValue / width) * width)) + start;
}
`, po = [
  {
    moduleId: "PI_INV",
    description: "Provides: float PI_INV = 1.0 / pi",
    content: ox,
    compatibility: A.ALL
  },
  {
    moduleId: "PI2_INV",
    description: `Provides:
float PI2_INV = 1.0 / (pi * 2.0)`,
    content: lx,
    compatibility: A.ALL
  },
  {
    moduleId: "PI_2",
    description: "Provides: float PI_2 = pi / 2.0",
    content: sx,
    compatibility: A.ALL
  },
  {
    moduleId: "PI_4",
    description: "Provides: float PI_4 = pi / 4.0",
    content: ax,
    compatibility: A.ALL
  },
  {
    moduleId: "PI",
    description: "Provides: float PI = pi",
    content: nx,
    compatibility: A.ALL
  },
  {
    moduleId: "PI2",
    description: "Provides: float PI2 = pi * 2.0",
    content: cx,
    compatibility: A.ALL
  },
  {
    moduleId: "toDegrees",
    description: `Provides: float toDegrees;
Can be used to convert radians to degrees:
radians * toDegrees`,
    content: ux,
    compatibility: A.ALL
  },
  {
    moduleId: "toRadians",
    description: `Provides: float toRadians;
Can be used to convert degrees to radians:
degress * toRadians`,
    content: hx,
    compatibility: A.ALL
  }
], mx = `
Provides all the math constants you may
need as convenience. It's probably
better to include them individually, but
convenience sometimes beats practicality

Constants:
${po.map((r) => r.moduleId).join(`
`)}
`, xx = {
  moduleId: "constants",
  description: mx,
  content: `\${import: ${po.map((r) => r.moduleId).join(", ")}}`,
  compatibility: A.ALL
}, Tx = [
  {
    moduleId: "bezier1",
    description: `Provides the 2D single control
point bezier method:
vec2 bezier1(float t, vec2 p1, vec2 p2, vec2 c1)`,
    content: rx,
    compatibility: A.ALL
  },
  {
    moduleId: "bezier2",
    description: `Provides the 2D single control
point bezier method:
vec2 bezier2(float t, vec2 p1, vec2 p2, vec2 c1, vec2 c2)`,
    content: ix,
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
    content: tx,
    compatibility: A.ALL
  },
  {
    moduleId: "fmod",
    description: `Provides the floating point
modulus method:
float fmod(float x, float m, float m_inv)`,
    content: fx,
    compatibility: A.ALL
  },
  {
    moduleId: "wrap",
    description: `Provides a method that wraps
value overflows:
float wrap(float value, float start, float end)`,
    content: gx,
    compatibility: A.ALL
  },
  {
    moduleId: "fcos",
    description: `Provides a fcos method that also
has a higher precision than
some hardware cos implementations:
float fcos(float x)`,
    content: dx,
    compatibility: A.ALL
  },
  {
    moduleId: "fsin",
    description: `Provides a fsin method that also
has a higher precision than
some hardware sin implementations:
float fsin(float x)`,
    content: px,
    compatibility: A.ALL
  }
];
ve.register([...Tx, ...po, xx]);
const bx = `mat4 rotationFromQuaternion(vec4 q) {
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
`, vx = `mat4 scale(vec3 s) {
  return mat4(
    s.x, 0, 0, 0,
    0, s.y, 0, 0,
    0, 0, s.z, 0,
    0, 0, 0, 1
  );
}
`, wx = `\${import: translation, rotation, scale}

mat4 transform(vec3 s, vec4 r, vec3 t) {
  return translation(t) * rotationFromQuaternion(r) * scale(s);
}
`, Ex = `mat4 translation(vec3 t) {
  return mat4(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    t.x, t.y, t.z, 1
  );
}
`;
ve.register([
  {
    moduleId: "translation",
    description: `Generates a translation matrix
from a vec3:
mat4 transform(vec3 s, vec4 r, vec3 t)`,
    compatibility: A.ALL,
    content: Ex
  },
  {
    moduleId: "rotation",
    description: `Generates a rotation matrix
from a quaternion:
mat4 rotationFromQuaternion(vec4 q)`,
    compatibility: A.ALL,
    content: bx
  },
  {
    moduleId: "scale",
    description: `Generates a scale matrix
from a vec3:
mat4 scale(vec3 s)`,
    compatibility: A.ALL,
    content: vx
  },
  {
    moduleId: "transform",
    description: `Generates a full transform matrix
from a scale, quaternion, translation:
mat4 transform(vec3 s, vec4 r, vec3 t)`,
    compatibility: A.ALL,
    content: wx
  }
]);
const yx = `//
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
`, Rx = `//
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
ve.register({
  moduleId: "simplexNoise3D",
  content: Rx,
  compatibility: A.ALL,
  description: "Provides the simplex noise function for 3D coordinates."
});
ve.register({
  moduleId: "simplexNoise2D",
  content: yx,
  compatibility: A.ALL,
  description: "Provides the simplex noise function for 2D coordinates."
});
const _x = `vec4 bitSh = vec4(16777216., 65536., 256., 1.);
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
`, Ax = `
This provides the ability to pack
a float value into a color RGBA
value. This is used to bypass the
lack of support for float textures.

Constants:
float currentTime;
float currentFrame;
`;
ve.register({
  moduleId: "packFloat",
  description: Ax,
  content: _x,
  compatibility: A.ALL
});
const Mx = `// This is the varying auto generated for the fragment shader that is needed in the vertex shader to pass the
// color for the instance through to the fragment shader
varying highp vec4 _picking_color_pass_;
`;
ve.register([
  {
    moduleId: "picking",
    description: `Internal use only. Provides methods
and constants to make the picking processes work.`,
    content: Mx,
    compatibility: A.VERTEX,
    instanceAttributes: (r) => [
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
const Ix = `void main() {
  gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
}
`, Sx = `void main() {
  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
}
`, zc = `
Makes a no-op shader where gl_Position
is [0, 0, 0, 0] and gl_FragColor is
[0, 0, 0, 0].

You can not import this if you specify
your own main() method.
`;
ve.register([
  {
    moduleId: "no-op",
    description: zc,
    content: Sx,
    compatibility: A.VERTEX
  },
  {
    moduleId: "no-op",
    description: zc,
    content: Ix,
    compatibility: A.FRAGMENT
  }
]);
const Cx = `
Provides a constant that is populated
with a random value 0 - 1.
This value is static for each draw call,
but changes every draw call.

float random;
`;
ve.register([
  {
    moduleId: "random",
    description: Cx,
    content: "",
    compatibility: A.ALL,
    uniforms: (r) => [
      {
        name: "random",
        size: _.ONE,
        shaderInjection: A.ALL,
        update: () => Math.random()
      }
    ]
  }
]);
const Nx = `
This is a special helper module used by
the system to map View2D content into
a 3D world space. The system utilizes
this module automatically for you when
you utilize createLayer2Din3D.
`;
ve.register([
  {
    moduleId: "world2DXY",
    description: Nx,
    content: Yu,
    compatibility: A.ALL,
    uniforms: (r) => r instanceof De ? r.props.control2D ? [
      // This injects the projection matrix from the view camera
      {
        name: "projection",
        size: _.MATRIX4,
        update: () => r.view.props.camera.projection
      },
      // This injects the model view matrix from the view camera
      {
        name: "view",
        size: _.MATRIX4,
        update: () => r.view.props.camera.view
      },
      // This injects a 2D camera's offset
      {
        name: "cameraOffset",
        size: _.THREE,
        update: () => r.props.control2D instanceof Xr ? r.props.control2D.offset : [0, 0, 0]
      },
      // This injects the camera's current position
      {
        name: "cameraPosition",
        size: _.THREE,
        update: () => r.view.props.camera.position
      },
      // This injects the camera's current scale
      {
        name: "cameraScale",
        size: _.THREE,
        update: () => r.view.props.camera.scale
      },
      // This injects the camera's 2D current scale
      {
        name: "cameraScale2D",
        size: _.THREE,
        update: () => r.props.control2D instanceof Xr ? r.props.control2D.scale : [1, 1, 1]
      },
      // This injects the camera's Euler rotation
      {
        name: "cameraRotation",
        size: _.FOUR,
        update: () => r.view.props.camera.transform.rotation
      },
      // This injects the pixel width and height of the view
      {
        name: "viewSize",
        size: _.TWO,
        update: () => [
          r.view.viewBounds.width,
          r.view.viewBounds.height
        ]
      },
      // This injects the current layer's pixel ratio so pixel ratio dependent items can react to it
      // Things like gl_PointSize will need this metric if not working in clip space
      {
        name: "pixelRatio",
        size: _.ONE,
        update: () => [r.view.pixelRatio]
      }
    ] : (console.warn(
      "For a layer 2D to be compatible with a 3D View, the layer requires an additional prop of control2D"
    ), []) : (console.warn(
      "A shader requested the module world2DXZ; however, the layer the shader comes from is NOT a Layer2D which is",
      "required for the module to work."
    ), [])
  }
]);
const Ox = `// These are projection methods utilizing the simpler camera 2d approach.
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
`, Lx = `
This is a special helper module used by
the system to map View2D content into
a 3D world space. The system utilizes
this module automatically for you when
you utilize createLayer2Din3D.
`;
ve.register([
  {
    moduleId: "world2DXZ",
    description: Lx,
    content: Ox,
    compatibility: A.ALL,
    uniforms: (r) => r instanceof De ? r.props.control2D ? [
      // This injects the projection matrix from the view camera
      {
        name: "projection",
        size: _.MATRIX4,
        update: () => r.view.props.camera.projection
      },
      // This injects the model view matrix from the view camera
      {
        name: "view",
        size: _.MATRIX4,
        update: () => r.view.props.camera.view
      },
      // This injects a 2D camera's offset
      {
        name: "cameraOffset",
        size: _.THREE,
        update: () => r.props.control2D instanceof Xr ? r.props.control2D.offset : [0, 0, 0]
      },
      // This injects the camera's current position
      {
        name: "cameraPosition",
        size: _.THREE,
        update: () => r.view.props.camera.position
      },
      // This injects the camera's current scale
      {
        name: "cameraScale",
        size: _.THREE,
        update: () => r.view.props.camera.scale
      },
      // This injects the camera's 2D current scale
      {
        name: "cameraScale2D",
        size: _.THREE,
        update: () => r.props.control2D instanceof Xr ? r.props.control2D.scale : [1, 1, 1]
      },
      // This injects the camera's Euler rotation
      {
        name: "cameraRotation",
        size: _.THREE,
        update: () => r.view.props.camera.scale
      },
      // This injects the pixel width and height of the view
      {
        name: "viewSize",
        size: _.TWO,
        update: () => [
          r.view.viewBounds.width,
          r.view.viewBounds.height
        ]
      },
      // This injects the current layer's pixel ratio so pixel ratio dependent items can react to it
      // Things like gl_PointSize will need this metric if not working in clip space
      {
        name: "pixelRatio",
        size: _.ONE,
        update: () => [r.view.pixelRatio]
      }
    ] : (console.warn(
      "For a layer 2D to be compatible with a 3D View, the layer requires an additional prop of control2D"
    ), []) : (console.warn(
      "A shader requesed the module world2DXZ; however, the layer the shader comes from is NOT a Layer2D which is",
      "required for the module to work."
    ), [])
  }
]);
const Fx = `// These are projection methods utilizing the simpler camera 2d approach.
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
`, Bx = `
This is a special helper module used by
the system to map View2D content into
a 3D world space. The system utilizes
this module automatically for you when
you utilize createLayer2Din3D.
`;
ve.register([
  {
    moduleId: "world2DYZ",
    description: Bx,
    content: Fx,
    compatibility: A.ALL,
    uniforms: (r) => r instanceof De ? r.props.control2D ? [
      // This injects the projection matrix from the view camera
      {
        name: "projection",
        size: _.MATRIX4,
        update: () => r.view.props.camera.projection
      },
      // This injects the model view matrix from the view camera
      {
        name: "view",
        size: _.MATRIX4,
        update: () => r.view.props.camera.view
      },
      // This injects a 2D camera's offset
      {
        name: "cameraOffset",
        size: _.THREE,
        update: () => r.props.control2D instanceof Xr ? r.props.control2D.offset : [0, 0, 0]
      },
      // This injects the camera's current position
      {
        name: "cameraPosition",
        size: _.THREE,
        update: () => r.view.props.camera.position
      },
      // This injects the camera's current scale
      {
        name: "cameraScale",
        size: _.THREE,
        update: () => r.view.props.camera.scale
      },
      // This injects the camera's 2D current scale
      {
        name: "cameraScale2D",
        size: _.THREE,
        update: () => r.props.control2D instanceof Xr ? r.props.control2D.scale : [1, 1, 1]
      },
      // This injects the camera's Euler rotation
      {
        name: "cameraRotation",
        size: _.THREE,
        update: () => r.view.props.camera.scale
      },
      // This injects the pixel width and height of the view
      {
        name: "viewSize",
        size: _.TWO,
        update: () => [
          r.view.viewBounds.width,
          r.view.viewBounds.height
        ]
      },
      // This injects the current layer's pixel ratio so pixel ratio dependent items can react to it
      // Things like gl_PointSize will need this metric if not working in clip space
      {
        name: "pixelRatio",
        size: _.ONE,
        update: () => [r.view.pixelRatio]
      }
    ] : (console.warn(
      "For a layer 2D to be compatible with a 3D View, the layer requires an additional prop of control2D"
    ), []) : (console.warn(
      "A shader requesed the module world2DYZ; however, the layer the shader comes from is NOT a Layer2D which is",
      "required for the module to work."
    ), [])
  }
]);
var Px = /* @__PURE__ */ ((r) => (r[r.XY = 0] = "XY", r[r.XZ = 1] = "XZ", r[r.YZ = 2] = "YZ", r))(Px || {});
function ib(r, e, t) {
  if (!(e === De || e.prototype instanceof De))
    return console.warn(
      "A Layer type was specified for createLayer2din3D that is NOT a Layer2D type, which is invalid.",
      "The layer will be used without being modified."
    ), zi(e, t);
  let n;
  switch (r) {
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
      return zi(e, t);
  }
  const s = Object.assign({}, t, {
    baseShaderModules: (a, o) => {
      let c = o.vs.indexOf("world2D");
      return c >= 0 && o.vs.splice(c, 1, n), c = o.fs.indexOf("world2D"), c >= 0 && o.fs.splice(c, 1, n), o;
    }
  });
  return zi(e, s);
}
class Dx extends Za {
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
    if (this.camera.projectionType === jr.ORTHOGRAPHIC) {
      const t = di(this.screenToWorld(e));
      return yu(t, this.camera.transform.forward);
    } else {
      const t = di(this.screenToWorld(e));
      return Ru(di(this.camera.transform.position), t);
    }
  }
  /**
   * Maps a coordinate found within the world to a relative coordinate within the screen space.
   */
  worldToScreen(e, t) {
    t = t || [0, 0];
    const i = bt(
      this.camera.projection,
      this.camera.view
    ), n = na(
      i,
      e,
      this.viewBounds.width,
      this.viewBounds.height
    );
    return he(
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
    const { width: i, height: n } = this.viewBounds, { projectionOptions: s } = this.camera, a = Ie(e, this.pixelRatio), { tan: o } = Math;
    if (s.type === jr.PERSPECTIVE) {
      const { fov: c, near: l } = s, u = n / i, h = o(c / 2) * l, d = (2 * ((a[0] + 0.5) / i) - 1) * h, p = (1 - 2 * ((a[1] + 0.5) / n)) * h * u, g = [d, p, -1], m = hn(
        this.camera.transform.matrix,
        ts(g, 1)
      );
      me(t, m[0], m[1], m[2]);
    } else {
      const c = Re(a, [i / 2, n / 2]), l = hn(
        this.camera.transform.viewMatrix,
        ts(c, -s.near)
      );
      me(t, l[0], -l[1], l[2]);
    }
    return t;
  }
  /**
   * Maps a coordinate found within the world to a relative coordinate within
   * the view's viewport.
   */
  worldToView(e, t) {
    t = t || [0, 0];
    const i = bt(
      this.camera.projection,
      this.camera.view
    ), n = na(
      i,
      e,
      this.viewBounds.width,
      this.viewBounds.height
    );
    return he(
      t,
      n[0] / this.pixelRatio,
      n[1] / this.pixelRatio
    );
  }
}
class Ux extends gs {
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
    const [t, i] = this.lastMouse, [n, s] = e.mouse.currentPosition, a = n - t, o = s - i;
    this.lastMouse = [n, s];
    const c = this.camera.transform.matrix, l = [c[0], c[1], c[2]], u = [c[4], c[5], c[6]], h = a * this.ROTATE_SENSITIVITY, d = o * this.ROTATE_SENSITIVITY, p = aa(u, h), g = aa(l, d), m = [0, 0, 0, 0];
    ns(p, g, m), ns(m, this.target.localRotation, m), vu(m, m), this.target.localRotation = m;
  }
  handleWheel(e) {
    let t = this.target.localScale[0];
    t *= 1 + e.mouse.wheel.delta[1] * this.ZOOM_SENSITIVITY * 0.01, t = Math.max(this.MIN_SCALE, Math.min(this.MAX_SCALE, t)), this.target.localScale = [t, t, t];
  }
}
function kx(r) {
  return r.projectionType === jr.ORTHOGRAPHIC;
}
const _o = class _o extends pn {
  constructor(e, t) {
    super(e, t), this.projection = new Dx(), this.projection.camera = t.camera, this.projection.pixelRatio = this.pixelRatio;
  }
  /**
   * This operation makes sure we have the view camera adjusted to the new
   * viewport's needs.
   */
  fitViewtoViewport(e, t) {
    if (la(this.props.camera)) {
      const i = t.width, n = t.height, s = this.props.camera, a = {
        near: s.projectionOptions.near,
        far: s.projectionOptions.far,
        width: i,
        height: n
      };
      this.props.preventCameraAdjustment || (s.projectionOptions = Object.assign(
        s.projectionOptions,
        a
      ), s.update()), this.projection.pixelRatio = this.pixelRatio, this.projection.viewBounds = t, this.projection.viewBounds.d = this, this.projection.screenBounds = new te({
        height: this.projection.viewBounds.height / this.pixelRatio,
        width: this.projection.viewBounds.width / this.pixelRatio,
        x: this.projection.viewBounds.x / this.pixelRatio,
        y: this.projection.viewBounds.y / this.pixelRatio
      }), this.projection.screenBounds.d = this;
    } else if (kx(this.props.camera)) {
      const i = t.width, n = t.height, s = this.props.camera, a = {
        near: s.projectionOptions.near,
        far: s.projectionOptions.far,
        left: -i / 2,
        right: i / 2,
        top: n / 2,
        bottom: -n / 2
      };
      this.props.preventCameraAdjustment || (s.projectionOptions = Object.assign(
        s.projectionOptions,
        a
      ), s.update()), this.projection.pixelRatio = this.pixelRatio, this.projection.viewBounds = t, this.projection.viewBounds.d = this, this.projection.screenBounds = new te({
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
_o.defaultProps = {
  key: "",
  camera: new Hr({
    type: jr.PERSPECTIVE,
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
let Vc = _o;
class Gx extends Xt {
  /**
   * Ensure the shaders utilizing this framework has easy access to the
   * parentTransform property.
   */
  baseShaderModules(e) {
    const t = super.baseShaderModules(e);
    return t.vs.push("parent-transform"), t;
  }
}
const zx = `
When working with SceneGraphLayers, the
layer can have a transform applied to
the layer. This makes that transform
available in the parentTransform
constant.

mat4 parentTransform;
`;
ve.register({
  moduleId: "parent-transform",
  description: zx,
  compatibility: A.VERTEX,
  content: "",
  uniforms: (r) => {
    const e = r;
    if (!(e instanceof Gx))
      return console.warn(
        "A shader requested the module parent-transform; however, the layer the",
        "shader is generated from is NOT a SceneGraphLayer which is",
        "required for the module to work."
      ), [];
    const t = se();
    return [
      {
        name: "parentTransform",
        size: _.MATRIX4,
        update: () => {
          var i;
          return ((i = e.props.parent) == null ? void 0 : i.matrix) || t;
        }
      }
    ];
  }
});
var Vx = Object.defineProperty, Kr = (r, e, t, i) => {
  for (var n = void 0, s = r.length - 1, a; s >= 0; s--)
    (a = r[s]) && (n = a(e, t, n) || n);
  return n && Vx(e, t, n), n;
};
const Nr = class Ma extends wt {
  constructor(e) {
    super(e), this.needsLocalUpdate = !1, this.needsWorldUpdate = !1, Je(this, Ma);
    const t = e.transform || new co();
    this.transform = t, e.parent && (e.parent instanceof Ma ? this.parent = e.parent : this.transform.parent = e.parent);
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
Kr([
  M
], Nr.prototype, "_matrix");
Kr([
  M
], Nr.prototype, "_localMatrix");
Kr([
  M
], Nr.prototype, "_localPosition");
Kr([
  M
], Nr.prototype, "_localRotation");
Kr([
  M
], Nr.prototype, "_localScale");
Kr([
  M
], Nr.prototype, "_position");
Kr([
  M
], Nr.prototype, "_rotation");
Kr([
  M
], Nr.prototype, "_scale");
let $x = Nr;
class nb extends Cu {
  constructor() {
    super(...arguments), this.isQueuedForUpdate = !1, this.needsWorldOrientation = !1, this.needsWorldDecomposition = !1, this._instance = null, this._matrix = { value: se() }, this._localMatrix = { value: this._matrix.value }, this._position = { value: [0, 0, 0] }, this._localPosition = {
      value: this._position.value
    }, this._rotation = { value: ss() }, this._localRotation = {
      value: 0
    }, this.localRotationMatrix = Is(), this._scale = { value: [1, 1, 1] }, this._localScale = { value: this._scale.value };
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
    he(this._localScale.value, e[0], e[1]), this._localScale.didUpdate = !0, this.invalidate();
  }
  /**
   * This method contains the math involved in decomposing our world SRT matrix
   * so we can view the Transform's orientation relative to world space.
   */
  decomposeWorldMatrix() {
    if (!this.parent || !this.needsWorldDecomposition || !this.needsWorldOrientation)
      return;
    this.needsWorldDecomposition = !1;
    const e = this._matrix.value, t = this._position.value, i = this._scale.value;
    this._position.didUpdate = t[0] !== e[12] || t[1] !== e[13] || t[2] !== e[14], this._position.didUpdate && me(t, e[12], e[13], e[14]);
    const n = Gr(e[0], e[1], e[2], e[3]), s = Gr(e[4], e[5], e[6], e[7]), a = Gr(e[8], e[9], e[10], e[11]);
    this._scale.didUpdate = i[0] !== n || i[1] !== s || i[2] !== a, me(i, n, s, a), this._scale.didUpdate = !0;
    const [o, c, l, u] = this._rotation.value;
    ao(this._matrix.value, n, s, a, this._rotation.value);
    const h = this._rotation.value;
    this._rotation.didUpdate = h[0] !== o || h[1] !== c || h[2] !== l || h[3] !== u;
  }
  /**
   * Ensures this transform WILL receive an update if it fits requirements for
   * potentially missing an update that may be needed by passive elements.
   */
  queueForUpdate() {
    !this.isQueuedForUpdate && this._instance && this._instance.active && (this.isQueuedForUpdate = !0, Mu(this));
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
    if (this.isQueuedForUpdate && (Iu(this), this.isQueuedForUpdate = !1), this.needsUpdate) {
      const i = this.localRotationMatrix;
      this._localRotation.didUpdate && cu(this._localRotation.value, i), mu(
        this._localScale.value,
        i,
        this._localPosition.value,
        this._localMatrix.value
      ), this._localMatrix.didUpdate = !0, t = !0;
    }
    this.parent && (this.parent.needsUpdate ? (e || this.processParentUpdates((i) => {
      i.update(!0);
    }), t = !0) : this.parent.childUpdate.has(this) && (t = !0), t && (bt(
      this.parent._matrix.value,
      this._localMatrix.value,
      this._matrix.value
    ), this._matrix.didUpdate = !0, this.needsWorldDecomposition = !0)), this.decomposeWorldMatrix(), this._instance && this._instance.active && (this._localRotation.didUpdate && (this._instance._localRotation = this._localRotation.value), this._localPosition.didUpdate && (this._instance._localPosition = this._localPosition.value), this._localScale.didUpdate && (this._instance._localScale = this._localScale.value), this.parent ? (this._rotation.didUpdate && (this._instance._rotation = this._rotation.value), this._scale.didUpdate && (this._instance._scale = this._scale.value), this._position.didUpdate && (this._instance._position = this._position.value)) : (this._localRotation.didUpdate && (this._instance._rotation = this._localRotation.value), this._localPosition.didUpdate && (this._instance._position = this._localPosition.value), this._localScale.didUpdate && (this._instance._scale = this._localScale.value)), (this._matrix.didUpdate || this._localMatrix.didUpdate) && (this._instance.transform = this)), this._localScale.didUpdate = !1, this._localRotation.didUpdate = !1, this._localPosition.didUpdate = !1, this._rotation.didUpdate = !1, this._scale.didUpdate = !1, this._position.didUpdate = !1, this._matrix.didUpdate = !1, this._localMatrix.didUpdate = !1, this.resolve();
  }
}
const Wx = `varying vec2 _texCoord;

void main() {
  gl_FragColor = mix(
    vec4(1.0, 0.0, 0.0, 1.0),
    vec4(0.0, 0.0, 0.0, 1.0),
    float(_texCoord.x <= 0.01 || _texCoord.x > 0.99 || _texCoord.y < 0.01 || _texCoord.y > 0.99)
  );
}
`, jx = `\${import: projection}

varying vec2 _texCoord;

void main() {
  vec4 pos = vec4(position * size, 1.0);
  vec4 world = transform * pos;
  _texCoord = texCoord;

  gl_Position = clipSpace(world.xyz);
}
`, Ao = class Ao extends Xt {
  initShader() {
    const e = [1, 1, 1], t = [1, 1, -1], i = [1, -1, -1], n = [1, -1, 1], s = [-1, 1, 1], a = [-1, 1, -1], o = [-1, -1, -1], c = [-1, -1, 1], l = [
      // right
      e,
      t,
      i,
      e,
      i,
      n,
      // front
      s,
      e,
      n,
      s,
      n,
      c,
      // left
      s,
      o,
      a,
      s,
      c,
      o,
      // back
      a,
      i,
      t,
      a,
      o,
      i,
      // up
      s,
      t,
      e,
      s,
      a,
      t,
      // down
      c,
      n,
      i,
      c,
      i,
      o
    ], u = [1, 0, 0], h = [0, 0, 1], d = [-1, 0, 0], p = [0, 0, -1], g = [0, 1, 0], m = [0, -1, 0], T = [
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
      g,
      m,
      m,
      m,
      m,
      m,
      m
    ], x = [
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
      drawMode: f.Model.DrawMode.TRIANGLES,
      fs: [
        {
          outputType: V.COLOR,
          source: Wx
        }
      ],
      instanceAttributes: [
        {
          name: "transform",
          size: S.MAT4X4,
          update: (b) => (b.transform || zp).matrix
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
          size: ze.THREE,
          update: (b) => l[b]
        },
        {
          name: "normal",
          size: ze.THREE,
          update: (b) => T[b]
        },
        {
          name: "texCoord",
          size: ze.TWO,
          update: (b) => x[b]
        }
      ],
      vertexCount: 36,
      vs: jx
    };
  }
  getMaterialOptions() {
    return Object.assign({}, lt.transparentShapeBlending, {
      cullSide: f.Material.CullSide.CCW
    });
  }
};
Ao.defaultProps = {
  data: new le(),
  key: "",
  materialOptions: lt.transparentShapeBlending
};
let $c = Ao;
var Hx = Object.defineProperty, oh = (r, e, t, i) => {
  for (var n = void 0, s = r.length - 1, a; s >= 0; s--)
    (a = r[s]) && (n = a(e, t, n) || n);
  return n && Hx(e, t, n), n;
};
const go = class ch extends $x {
  constructor(e) {
    super(e), this.size = [1, 1, 1], this.color = [1, 1, 1, 1], Je(this, ch), this.size = e.size || this.size, this.color = e.color || this.color;
  }
};
oh([
  M
], go.prototype, "size");
oh([
  M
], go.prototype, "color");
let sb = go;
var zn = { exports: {} }, Ji = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Wc;
function Xx() {
  if (Wc) return Ji;
  Wc = 1;
  var r = Symbol.for("react.transitional.element"), e = Symbol.for("react.fragment");
  function t(i, n, s) {
    var a = null;
    if (s !== void 0 && (a = "" + s), n.key !== void 0 && (a = "" + n.key), "key" in n) {
      s = {};
      for (var o in n)
        o !== "key" && (s[o] = n[o]);
    } else s = n;
    return n = s.ref, {
      $$typeof: r,
      type: i,
      key: a,
      ref: n !== void 0 ? n : null,
      props: s
    };
  }
  return Ji.Fragment = e, Ji.jsx = t, Ji.jsxs = t, Ji;
}
var en = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var jc;
function Qx() {
  return jc || (jc = 1, process.env.NODE_ENV !== "production" && function() {
    function r(w) {
      if (w == null) return null;
      if (typeof w == "function")
        return w.$$typeof === z ? null : w.displayName || w.name || null;
      if (typeof w == "string") return w;
      switch (w) {
        case m:
          return "Fragment";
        case x:
          return "Profiler";
        case T:
          return "StrictMode";
        case y:
          return "Suspense";
        case C:
          return "SuspenseList";
        case $:
          return "Activity";
      }
      if (typeof w == "object")
        switch (typeof w.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), w.$$typeof) {
          case g:
            return "Portal";
          case v:
            return (w.displayName || "Context") + ".Provider";
          case b:
            return (w._context.displayName || "Context") + ".Consumer";
          case E:
            var k = w.render;
            return w = w.displayName, w || (w = k.displayName || k.name || "", w = w !== "" ? "ForwardRef(" + w + ")" : "ForwardRef"), w;
          case I:
            return k = w.displayName || null, k !== null ? k : r(w.type) || "Memo";
          case R:
            k = w._payload, w = w._init;
            try {
              return r(w(k));
            } catch {
            }
        }
      return null;
    }
    function e(w) {
      return "" + w;
    }
    function t(w) {
      try {
        e(w);
        var k = !1;
      } catch {
        k = !0;
      }
      if (k) {
        k = console;
        var H = k.error, ie = typeof Symbol == "function" && Symbol.toStringTag && w[Symbol.toStringTag] || w.constructor.name || "Object";
        return H.call(
          k,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          ie
        ), e(w);
      }
    }
    function i(w) {
      if (w === m) return "<>";
      if (typeof w == "object" && w !== null && w.$$typeof === R)
        return "<...>";
      try {
        var k = r(w);
        return k ? "<" + k + ">" : "<...>";
      } catch {
        return "<...>";
      }
    }
    function n() {
      var w = F.A;
      return w === null ? null : w.getOwner();
    }
    function s() {
      return Error("react-stack-top-frame");
    }
    function a(w) {
      if (U.call(w, "key")) {
        var k = Object.getOwnPropertyDescriptor(w, "key").get;
        if (k && k.isReactWarning) return !1;
      }
      return w.key !== void 0;
    }
    function o(w, k) {
      function H() {
        re || (re = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          k
        ));
      }
      H.isReactWarning = !0, Object.defineProperty(w, "key", {
        get: H,
        configurable: !0
      });
    }
    function c() {
      var w = r(this.type);
      return J[w] || (J[w] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), w = this.props.ref, w !== void 0 ? w : null;
    }
    function l(w, k, H, ie, Le, ye, Or, bi) {
      return H = ye.ref, w = {
        $$typeof: p,
        type: w,
        key: k,
        props: ye,
        _owner: Le
      }, (H !== void 0 ? H : null) !== null ? Object.defineProperty(w, "ref", {
        enumerable: !1,
        get: c
      }) : Object.defineProperty(w, "ref", { enumerable: !1, value: null }), w._store = {}, Object.defineProperty(w._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: 0
      }), Object.defineProperty(w, "_debugInfo", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: null
      }), Object.defineProperty(w, "_debugStack", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: Or
      }), Object.defineProperty(w, "_debugTask", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: bi
      }), Object.freeze && (Object.freeze(w.props), Object.freeze(w)), w;
    }
    function u(w, k, H, ie, Le, ye, Or, bi) {
      var xe = k.children;
      if (xe !== void 0)
        if (ie)
          if (Q(xe)) {
            for (ie = 0; ie < xe.length; ie++)
              h(xe[ie]);
            Object.freeze && Object.freeze(xe);
          } else
            console.error(
              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
            );
        else h(xe);
      if (U.call(k, "key")) {
        xe = r(w);
        var dt = Object.keys(k).filter(function(Rn) {
          return Rn !== "key";
        });
        ie = 0 < dt.length ? "{key: someKey, " + dt.join(": ..., ") + ": ...}" : "{key: someKey}", Oe[xe + ie] || (dt = 0 < dt.length ? "{" + dt.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          ie,
          xe,
          dt,
          xe
        ), Oe[xe + ie] = !0);
      }
      if (xe = null, H !== void 0 && (t(H), xe = "" + H), a(k) && (t(k.key), xe = "" + k.key), "key" in k) {
        H = {};
        for (var vi in k)
          vi !== "key" && (H[vi] = k[vi]);
      } else H = k;
      return xe && o(
        H,
        typeof w == "function" ? w.displayName || w.name || "Unknown" : w
      ), l(
        w,
        xe,
        ye,
        Le,
        n(),
        H,
        Or,
        bi
      );
    }
    function h(w) {
      typeof w == "object" && w !== null && w.$$typeof === p && w._store && (w._store.validated = 1);
    }
    var d = Z, p = Symbol.for("react.transitional.element"), g = Symbol.for("react.portal"), m = Symbol.for("react.fragment"), T = Symbol.for("react.strict_mode"), x = Symbol.for("react.profiler"), b = Symbol.for("react.consumer"), v = Symbol.for("react.context"), E = Symbol.for("react.forward_ref"), y = Symbol.for("react.suspense"), C = Symbol.for("react.suspense_list"), I = Symbol.for("react.memo"), R = Symbol.for("react.lazy"), $ = Symbol.for("react.activity"), z = Symbol.for("react.client.reference"), F = d.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, U = Object.prototype.hasOwnProperty, Q = Array.isArray, W = console.createTask ? console.createTask : function() {
      return null;
    };
    d = {
      "react-stack-bottom-frame": function(w) {
        return w();
      }
    };
    var re, J = {}, ee = d["react-stack-bottom-frame"].bind(
      d,
      s
    )(), K = W(i(s)), Oe = {};
    en.Fragment = m, en.jsx = function(w, k, H, ie, Le) {
      var ye = 1e4 > F.recentlyCreatedOwnerStacks++;
      return u(
        w,
        k,
        H,
        !1,
        ie,
        Le,
        ye ? Error("react-stack-top-frame") : ee,
        ye ? W(i(w)) : K
      );
    }, en.jsxs = function(w, k, H, ie, Le) {
      var ye = 1e4 > F.recentlyCreatedOwnerStacks++;
      return u(
        w,
        k,
        H,
        !0,
        ie,
        Le,
        ye ? Error("react-stack-top-frame") : ee,
        ye ? W(i(w)) : K
      );
    };
  }()), en;
}
var Hc;
function Yx() {
  return Hc || (Hc = 1, process.env.NODE_ENV === "production" ? zn.exports = Xx() : zn.exports = Qx()), zn.exports;
}
var de = Yx();
const Xc = () => {
};
class qx {
  constructor(e) {
    this.resolver = Xc, this.rejector = Xc, this.promise = new Promise(
      (t, i) => (this.resolver = t, this.rejector = i)
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
function Qc(r) {
  return r && r.charCodeAt !== void 0;
}
function Kx(r) {
  return r != null;
}
function ut(r, e) {
  var o, c;
  const [t, i] = Co(!0), [n, s] = Co(!1), a = {
    store: r,
    shouldMount: t
  };
  if (!n && Kx(r.willMount) && (a.shouldMount = !!((o = r.willMount) != null && o.call(r))), n) {
    const l = (c = r.willUpdate) == null ? void 0 : c.call(r);
    l && (async () => await l())();
  }
  return No(() => {
    const l = new qx();
    s(!0), i(a.shouldMount);
    let u;
    return (async () => {
      var h;
      u = await ((h = r.didMount) == null ? void 0 : h.call(r)), l.resolve(!0);
    })(), () => {
      (async () => (await l.promise, u == null || u()))();
    };
  }, []), No(
    () => {
      var l;
      n && (a.shouldMount = !!((l = r.willMount) != null && l.call(r)));
    },
    [0]
  ), a;
}
function Zx(r) {
  const { children: e, tagName: t, ...i } = r, n = Object.keys(i).reduce(
    (s, a) => {
      try {
        Rt(a) && (s[a.toLowerCase()] = JSON.stringify(i[a]));
      } catch {
      }
      return s;
    },
    {}
  );
  return { tagName: t, attributes: n, children: e };
}
const ht = (r) => {
  const {
    tagName: e = "",
    attributes: t,
    children: i
  } = Zx(r), { writeToDom: n } = Z.useContext(yn) || {};
  return n ? Z.createElement(e, t, i) : r.children;
};
var Me = /* @__PURE__ */ ((r) => (r[r.EVENT_MANAGER = 1] = "EVENT_MANAGER", r[r.LAYER = 2] = "LAYER", r[r.CAMERA = 3] = "CAMERA", r[r.PROVIDER = 4] = "PROVIDER", r[r.RESOURCE = 5] = "RESOURCE", r[r.VIEW = 6] = "VIEW", r[r.SCENE = 7] = "SCENE", r))(Me || {});
function lh(r, e, t) {
  var s, a, o;
  const i = /* @__PURE__ */ new Map(), n = [];
  for (Z.Children.forEach(r, (c, l) => {
    n.push(c);
  }), n.reverse(); n.length > 0; ) {
    const c = n.pop();
    if (!Z.isValidElement(c)) continue;
    const l = (s = c.type) == null ? void 0 : s.surfaceJSXType;
    if (c !== void 0 && ((c == null ? void 0 : c.type) === Z.Fragment || l === void 0)) {
      if (!((a = c == null ? void 0 : c.props) != null && a.children)) {
        t && t.push(c);
        continue;
      }
      const u = [];
      Z.Children.forEach(
        ((o = c == null ? void 0 : c.props) == null ? void 0 : o.children) || [],
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
        let u = i.get(l);
        u || (u = [], i.set(l, u)), u.push(c);
      }
    }
  }
  return i;
}
function ni(r, e, t, i = { current: 0 }, n = "") {
  const s = e.get(t), a = /* @__PURE__ */ new Set(), o = Z.useRef([]), c = /* @__PURE__ */ new Set();
  o.current = [], n = n ? `${n}.` : "";
  let l = [];
  return s && (l = Z.Children.map(s, (u) => {
    if (Z.isValidElement(u)) {
      const h = u.key || i.current++, d = `${n}${u.props.name || `${h}`}`, p = r.get(d) || new Ve();
      r.set(d, p), o.current.push(p), u.props.share && (u.props.share.current = p);
      const g = {
        key: h,
        name: d,
        resolver: p
      };
      return a.has(g.name) ? c.add(g.name) : a.add(g.name), Z.cloneElement(u, g);
    }
  })), [
    l,
    Promise.all(o.current.map((u) => u == null ? void 0 : u.promise)),
    { resolvers: o, nameConflict: c }
  ];
}
function uh(...r) {
  return r.filter(oe).reduce((e, t) => e.concat(t), []);
}
const yn = Z.createContext(void 0), ab = (r) => {
  const e = Z.useRef(null), t = Z.useRef(null), i = Z.useRef(0), n = Z.useRef(null), s = Z.useRef(null), a = Z.useRef(-1), o = Z.useRef([]), c = Z.useRef([]), l = Z.useRef(
    /* @__PURE__ */ new Map()
  ), u = Z.useRef(
    /* @__PURE__ */ new Map()
  ), h = Z.useRef(
    /* @__PURE__ */ new Map()
  ), d = Z.useRef(
    /* @__PURE__ */ new Map()
  ), p = Z.useRef(
    /* @__PURE__ */ new Map()
  ), g = Z.useRef(new Ve()), m = { current: 0 }, T = [], x = lh(r.children, void 0, T);
  T.length && console.warn("Surface found unsupported children", T);
  const [b, v] = ni(
    l.current,
    x,
    Me.EVENT_MANAGER,
    m
  ), [E, y] = ni(
    u.current,
    x,
    Me.RESOURCE,
    m
  ), [C, I, { nameConflict: R }] = ni(
    p.current,
    x,
    Me.SCENE,
    m
  ), [$, z, { nameConflict: F }] = ni(
    d.current,
    x,
    Me.LAYER,
    m
  ), [U, Q, { nameConflict: W }] = ni(
    h.current,
    x,
    Me.VIEW,
    m
  );
  if (R.size > 0) {
    console.warn("Root Scene name conflict:", R);
    return;
  }
  if (F.size > 0) {
    console.warn("Root Scene Layer name conflict:", F);
    return;
  }
  if (W.size > 0) {
    console.warn("Root Scene View name conflict:", W);
    return;
  }
  const re = async (w) => {
    !n.current || r.stop || (i.current = w, n.current.draw(w), r.renderFrameCount && n.current.frameMetrics.currentFrame >= r.renderFrameCount && Jo(s.current));
  }, J = (w) => {
    var k, H, ie, Le, ye;
    (k = t.current) == null || k.remove(), (Le = n.current) == null || Le.resize(
      ((H = e.current) == null ? void 0 : H.offsetWidth) || 0,
      ((ie = e.current) == null ? void 0 : ie.offsetHeight) || 0
    ), t.current && ((ye = e.current) == null || ye.appendChild(t.current));
  }, ee = () => {
    window.clearTimeout(a.current), a.current = window.setTimeout(() => {
      J();
    });
  };
  ut({
    async didMount() {
      var Rn;
      if (!t.current || !e.current) return;
      const [
        w,
        k,
        H,
        ie,
        Le
      ] = await Promise.all([
        v,
        y,
        I,
        z,
        Q
      ]), ye = H.filter(oe), Or = w.filter(oe), bi = k.filter(oe), xe = ie.filter(oe), dt = Le.filter(oe);
      if (H.length <= 0 && (!(xe != null && xe.length) || !(dt != null && dt.length))) {
        console.error(
          "No scenes or root level Layers+Views provided to surface"
        );
        return;
      }
      dt.length && xe.length && ye.unshift({
        key: "root",
        layers: xe,
        views: dt
      });
      const vi = await new Wm({
        context: t.current,
        handlesWheelEvents: r.handlesWheelEvents !== void 0 ? r.handlesWheelEvents : !0,
        pixelRatio: r.pixelRatio || window.devicePixelRatio,
        eventManagers: Or,
        ioExpansion: r.ioExpansion,
        shaderTransforms: r.shaderTransforms,
        resourceManagers: r.resourceManagers,
        optimizedOutputTargets: r.optimizedOutputTargets,
        rendererOptions: Object.assign(
          // Default render options
          {
            alpha: !0,
            antialias: !1
          },
          // Implementation specified render options
          r.options
        )
      }).ready;
      return s.current = Au(
        re,
        r.frameRate ? 1e3 / r.frameRate : void 0
      ), c.current = ye, o.current = bi, await vi.pipeline({
        resources: bi,
        scenes: ye
      }), await lr(), n.current = vi, J(), (Rn = r.ready) == null || Rn.resolve(n.current), window.addEventListener("resize", ee), () => {
        var So;
        window.removeEventListener("resize", ee), Jo(s.current), (So = n.current) == null || So.destroy(), n.current = null;
      };
    }
  });
  const K = async () => {
    n.current && n.current.pipeline({
      resources: o.current,
      scenes: c.current
    });
  }, Oe = (w) => {
    !n.current || !c.current || (c.current.forEach((H) => {
      const ie = H.layers.findIndex((Le) => Le === w);
      ie !== -1 && H.layers.splice(ie, 1);
    }), K());
  };
  return /* @__PURE__ */ de.jsx(
    "div",
    {
      ref: e,
      "data-deltav-version": "5.3.0",
      className: `SurfaceJSX ${r.className || ""}`,
      ...r.containerProps,
      children: /* @__PURE__ */ de.jsx("canvas", { ref: t, children: /* @__PURE__ */ de.jsx(
        yn.Provider,
        {
          value: {
            writeToDom: r.writeToDom,
            eventResolvers: l.current,
            resourceResolvers: u.current,
            viewResolvers: h.current,
            layerResolvers: d.current,
            sceneResolvers: p.current,
            resolversReady: g.current,
            updatePipeline: K,
            disposeLayer: Oe
          },
          children: /* @__PURE__ */ de.jsx(ht, { tagName: "Surface", ...r, children: uh(b, E, U, $, C) })
        }
      ) })
    }
  );
}, Jx = (r) => (ut({
  didMount() {
    var e;
    (e = r.resolver) == null || e.resolve(
      new Qu(r.handlers, r.preserveEvents)
    );
  }
}), /* @__PURE__ */ de.jsx(ht, { tagName: "QueuedEventHandler", ...r }));
Jx.surfaceJSXType = Me.EVENT_MANAGER;
const eT = (r) => (ut({
  didMount() {
    var e;
    (e = r.resolver) == null || e.resolve(new gs(r.handlers));
  }
}), /* @__PURE__ */ de.jsx(ht, { tagName: "SimpleEventHandler", ...r }));
eT.surfaceJSXType = Me.EVENT_MANAGER;
const tT = (r) => {
  const e = Z.useRef(null);
  return ut({
    didMount() {
      var t;
      e.current = new Xm(r.config), (t = r.resolver) == null || t.resolve(e.current);
    }
  }), Z.useEffect(() => {
    e.current && (e.current.disabled = r.disabled ?? !1, e.current.disableDragPanning = r.disableDragPanning ?? !1);
  }, [r.disabled, r.disableDragPanning]), /* @__PURE__ */ de.jsx(ht, { tagName: "BasicCamera2DController", ...r });
};
tT.surfaceJSXType = Me.EVENT_MANAGER;
const rT = (r) => (ut({
  didMount() {
    var e;
    (e = r.resolver) == null || e.resolve(new Ux(r.config));
  }
}), /* @__PURE__ */ de.jsx(ht, { tagName: "BasicCamera2DController", ...r }));
rT.surfaceJSXType = Me.EVENT_MANAGER;
const iT = (r) => (ut({
  didMount() {
    var e;
    (e = r.resolver) == null || e.resolve(
      au({
        key: r.name,
        height: r.height,
        width: r.width,
        textureSettings: r.textureSettings
      })
    );
  }
}), /* @__PURE__ */ de.jsx(ht, { tagName: "Texture", ...r }));
iT.surfaceJSXType = Me.RESOURCE;
const nT = (r) => (ut({
  didMount() {
    var e;
    (e = r.resolver) == null || e.resolve(
      Vu({
        key: r.name,
        fontSource: r.fontSource,
        characterFilter: r.characterFilter,
        dynamic: r.dynamic,
        fontMap: r.fontMap,
        fontMapSize: r.fontMapSize
      })
    );
  }
}), /* @__PURE__ */ de.jsx(ht, { tagName: "Font", ...r }));
nT.surfaceJSXType = Me.RESOURCE;
const sT = (r) => (ut({
  didMount() {
    var e;
    (e = r.resolver) == null || e.resolve(
      $u({
        key: r.name,
        height: r.height,
        width: r.width,
        textureSettings: r.textureSettings
      })
    );
  }
}), /* @__PURE__ */ de.jsx(ht, { tagName: "Texture", ...r }));
sT.surfaceJSXType = Me.RESOURCE;
const aT = (r) => (ut({
  didMount() {
    var e;
    (e = r.resolver) == null || e.resolve(
      Ja({
        key: r.name,
        height: r.height,
        width: r.width,
        colorBufferSettings: r.config
      })
    );
  }
}), /* @__PURE__ */ de.jsx(ht, { tagName: "ColorBuffer", ...r }));
aT.surfaceJSXType = Me.RESOURCE;
const oT = (r) => (ut({
  didMount() {
    var e;
    (e = r.resolver) == null || e.resolve(
      Ja({
        key: r.name,
        height: r.height,
        width: r.width,
        colorBufferSettings: r.config
      })
    );
  }
}), /* @__PURE__ */ de.jsx(ht, { tagName: "ColorBuffer", ...r }));
oT.surfaceJSXType = Me.RESOURCE;
const mo = (r) => {
  const e = Z.useContext(yn), t = Z.useRef(null);
  return ut({
    async didMount() {
      var o, c;
      let i = r.config;
      const n = r.uses;
      if (n) {
        await (e == null ? void 0 : e.resolversReady);
        const l = {}, u = n.names.map(async (h) => {
          var g, m;
          const d = (g = e == null ? void 0 : e.resourceResolvers) == null ? void 0 : g.get(h);
          if (!d)
            return console.error(
              `A layer requested a resource: ${h} but the name identifier was not found in the available resources`
            ), console.warn(
              "Available resources:",
              Array.from(((m = e == null ? void 0 : e.resourceResolvers) == null ? void 0 : m.keys()) || [])
            ), null;
          const p = await d.promise;
          if (!p)
            return console.error(
              `The Layer requested a resource "${h}", but the resource did not resolve a value`
            ), null;
          if (!Ur(p))
            return console.error(
              `The Layer requested a resource "${h}", but the resource resolved to a value that is not a render texture resource`
            ), null;
          l[h] = p;
        }).filter(oe);
        await Promise.all(u), i = n.apply(l, { ...r.config });
      }
      const s = zi(r.type, {
        key: r.name,
        ...i
      });
      let a = ((o = r.providerRef) == null ? void 0 : o.current) || s.init[1].data;
      return a === s.init[0].defaultProps.data && (a = new le()), s.init[1].data = a, r.providerRef && a instanceof le && (r.providerRef.current = a), t.current = s, (c = r.resolver) == null || c.resolve(s), () => {
        var l;
        (l = e == null ? void 0 : e.disposeLayer) == null || l.call(e, s);
      };
    }
  }), Z.useEffect(() => {
    var i, n;
    (i = t.current) != null && i.init[1] && (t.current.init[1] = Object.assign(
      {},
      t.current.init[1] || {},
      r.config
    ), (n = e == null ? void 0 : e.updatePipeline) == null || n.call(e));
  }, [...Object.values(r.config)]), /* @__PURE__ */ de.jsx(ht, { tagName: "Layer", ...r });
};
mo.surfaceJSXType = Me.LAYER;
function Ia(r, e, t) {
  var n, s;
  const i = (n = e == null ? void 0 : e.resourceResolvers) == null ? void 0 : n.get(t);
  return i || (console.error(
    `A View "${r}" requested a resource: ${t} but the name identifier was not found in the available resources`
  ), console.warn(
    "Available resources:",
    Array.from(((s = e == null ? void 0 : e.resourceResolvers) == null ? void 0 : s.keys()) || [])
  ), null);
}
async function Yc(r, e, t) {
  const i = {}, n = Object.entries(r).map(
    ([s, a]) => {
      if (a === void 0) {
        const c = new Ve();
        return [Number.parseInt(s), c, void 0];
      }
      const o = Ia(
        e.name,
        t,
        a || ""
      );
      return o ? [Number.parseInt(s), o, a] : (console.warn("View props", e), null);
    }
  ).filter(oe);
  return await Promise.all(
    n.map(async (s) => {
      const { 0: a, 1: o, 2: c } = s, l = await o.promise;
      c === void 0 ? i[a] = void 0 : Ur(l) ? i[a] = l : on(l) ? i[s[0]] = l : (console.error(
        `A View "${e.name}" requested an output buffer for the resource with name: ${s[2]} but the resource indicated is not a valid output target type.`,
        "Ensure the resource is a RenderTextureResource or ColorBufferResource"
      ), console.warn("View props", e));
    })
  ), i;
}
async function cT(r, e, t) {
  const i = r.buffers, n = await Yc(
    i,
    e,
    t
  );
  let s = !0;
  const a = r.depth;
  if (Qc(a)) {
    const l = Ia(
      e.name,
      t,
      a
    );
    if (!l)
      console.warn("View props", e), s = !1;
    else {
      const u = await l.promise;
      Ur(u) || on(u) ? s = u : (console.error(
        `A View "${e.name}" requested a depth buffer for the resource with name: ${a} but the resource indicated is not a valid output target type.`,
        "Ensure the resource is a RenderTextureResource or ColorBufferResource"
      ), console.warn("View props", e));
    }
  } else oe(a) && (s = a);
  const o = {}, c = r.blit;
  if (c != null && c.color) {
    const l = await Yc(
      c.color,
      e,
      t
    );
    o.color = l;
  }
  if (Qc(c == null ? void 0 : c.depth)) {
    const l = Ia(
      e.name,
      t,
      c.depth
    );
    if (!l)
      console.warn("View props", e), o.depth = void 0;
    else {
      const u = await l.promise;
      Ur(u) ? o.depth = u : (console.error(
        `A View "${e.name}" requested a depth blit buffer for the resource with name: ${c.depth} but the resource indicated is not a valid output target type.`,
        "Ensure the resource is a RenderTextureResource"
      ), console.warn("View props", e));
    }
  }
  return {
    buffers: n,
    depth: s,
    blit: o != null && o.color || o != null && o.depth ? o : void 0
  };
}
const xo = (r) => {
  const e = Z.useContext(yn);
  return ut({
    async didMount() {
      var a;
      if (await (e == null ? void 0 : e.resolversReady), !e) {
        console.error("No surface context found");
        return;
      }
      let t = [];
      r.output && !Array.isArray(r.output) ? t = [r.output] : r.output && (t = r.output);
      const i = await Promise.all(
        t.map(
          (o) => cT(o, r, e)
        )
      ), n = i.slice(1), s = Xu(r.type, {
        key: r.name,
        ...r.config,
        // First buffer is the primary view we create
        output: r.output ? {
          buffers: i[0].buffers,
          depth: i[0].depth,
          blit: i[0].blit
        } : void 0,
        // Additional outputs will map to chaining in the view.
        chain: n.length > 0 ? n.map((o) => ({
          output: {
            buffers: o.buffers,
            depth: o.depth,
            blit: o.blit
          }
        })) : void 0
      });
      (a = r.resolver) == null || a.resolve(s);
    }
  }), /* @__PURE__ */ de.jsx(ht, { tagName: "View", ...r });
};
xo.surfaceJSXType = Me.VIEW;
const To = (r) => {
  var u, h, d, p;
  const e = Z.useContext(yn), t = { current: 0 }, i = lh(r.children), [n, s, { nameConflict: a }] = ni(
    (e == null ? void 0 : e.layerResolvers) || /* @__PURE__ */ new Map(),
    i,
    Me.LAYER,
    t,
    r.name
  ), [o, c, { nameConflict: l }] = ni(
    (e == null ? void 0 : e.viewResolvers) || /* @__PURE__ */ new Map(),
    i,
    Me.VIEW,
    t,
    r.name
  );
  if (a.size > 0) {
    console.warn(`Scene ${r.name} Layer name conflict:`, a), (u = r.resolver) == null || u.resolve(null);
    return;
  }
  if (l.size > 0) {
    console.warn(`Scene ${r.name} View name conflict:`, l), (h = r.resolver) == null || h.resolve(null);
    return;
  }
  if (!n) {
    console.warn("A Scene had no Layers:", r.name), (d = r.resolver) == null || d.resolve(null);
    return;
  }
  if (!o) {
    console.warn("A Scene had no Views:", r.name), (p = r.resolver) == null || p.resolve(null);
    return;
  }
  return ut({
    async didMount() {
      var T;
      const [g, m] = await Promise.all([
        s,
        c
      ]);
      (T = r.resolver) == null || T.resolve({
        key: r.name,
        layers: g.filter(oe),
        views: m.filter(oe)
      });
    }
  }), /* @__PURE__ */ de.jsx(ht, { tagName: "Scene", ...r, children: uh(o, n) });
};
To.surfaceJSXType = Me.SCENE;
function lT(r) {
  const e = [];
  for (let t = 0, i = r.length; t < i; ++t) {
    const n = r[t];
    for (let s = 0, a = n.length; s < a; ++s)
      e.push(n[s]);
  }
  return e;
}
var uT = Object.defineProperty, hT = (r, e, t, i) => {
  for (var n = void 0, s = r.length - 1, a; s >= 0; s--)
    (a = r[s]) && (n = a(e, t, n) || n);
  return n && uT(e, t, n), n;
};
const hh = class dh extends wt {
  constructor() {
    super(), this.tint = [1, 1, 1, 1], Je(this, dh);
  }
};
hT([
  M
], hh.prototype, "tint");
let dT = hh;
const qc = new j({
  data: {
    width: 2,
    height: 2,
    buffer: new Uint8Array(16)
  }
}), Mo = class Mo extends Xt {
  initShader() {
    let { buffers: e, fs: t, data: i } = this.props;
    const n = new dT();
    i instanceof le && i.add(n), this.alwaysDraw = !0;
    const s = [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1]
    ], a = s.map((l) => [
      l[0] === 1 ? 1 : 0,
      l[1] === 1 ? 1 : 0
    ]), o = lT(
      Object.keys(e).map((l) => {
        let u = e[l];
        if (!u) return;
        Array.isArray(u) || (u = [u]);
        const h = [];
        for (let d = 0; d < u.length; d++) {
          const g = u[d].key;
          h.push(
            cn({
              key: g
            })
          );
        }
        return [
          {
            name: l,
            shaderInjection: A.FRAGMENT,
            size: _.TEXTURE,
            update: () => {
              const d = h.length < 2 ? h[0] : h[this.surface.frameMetrics.currentFrame % h.length];
              return this.resource.request(this, n, d), d.texture || qc;
            }
          },
          {
            name: `${l}_size`,
            shaderInjection: A.FRAGMENT,
            size: _.TWO,
            update: () => {
              this.props;
              const d = h.length < 2 ? h[0] : h[this.surface.frameMetrics.currentFrame % h.length];
              this.resource.request(this, n, d);
              const p = (d.texture || qc).data;
              return [(p == null ? void 0 : p.width) || 1, (p == null ? void 0 : p.height) || 1];
            }
          }
        ];
      }).filter(oe)
    );
    let c = this.props.uniforms || [];
    return Array.isArray(c) || (c = c(this)), Array.isArray(t) ? (t = t.slice(0), t[0].source = `varying vec2 ${this.props.textureCoordinateName || "texCoord"};
      ${t[0].source}`) : t = [
      {
        source: `
            varying vec2 ${this.props.textureCoordinateName || "texCoord"};
            ${t}
          `,
        outputType: V.COLOR
      }
    ], {
      drawMode: f.Model.DrawMode.TRIANGLE_STRIP,
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
      uniforms: o.concat(c),
      vertexAttributes: [
        {
          name: "vertex",
          size: ze.TWO,
          update: (l) => s[l]
        },
        {
          name: "tex",
          size: ze.TWO,
          update: (l) => a[l]
        }
      ],
      vertexCount: 4
    };
  }
  shouldDrawView() {
    return !this.props.preventDraw;
  }
  getMaterialOptions() {
    return lt.transparentImageBlending.modify({
      depthTest: !1
    });
  }
};
Mo.defaultProps = {
  key: "",
  data: new le(),
  buffers: {},
  baseShaderModules: () => ({ fs: [], vs: [] }),
  fs: [
    {
      outputType: V.COLOR,
      source: "void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);"
    }
  ]
};
let Sa = Mo;
const jt = (r) => {
  var e;
  return /* @__PURE__ */ de.jsxs(To, { name: r.name, children: [
    /* @__PURE__ */ de.jsx(
      xo,
      {
        name: "fullscreen",
        type: hs,
        ...r.view,
        output: r.output,
        config: {
          camera: new ur(),
          viewport: { left: 0, top: 0, width: "100%", height: "100%" },
          materialSettings: {
            depthTest: !1,
            culling: f.Material.CullSide.NONE
          },
          ...(e = r.view) == null ? void 0 : e.config
        }
      }
    ),
    /* @__PURE__ */ de.jsx(
      mo,
      {
        name: "postprocess",
        type: Sa,
        uses: {
          names: Object.values(r.buffers).flat(),
          apply: (t, i) => {
            var n;
            return i.buffers = {}, Object.keys(r.buffers).map((s) => {
              Array.isArray(r.buffers[s]) ? i.buffers[s] = r.buffers[s].map((a) => t[a]) : i.buffers[s] = t[r.buffers[s]];
            }), (n = r.onResources) == null || n.call(r, t), i;
          }
        },
        config: {
          printShader: r.printShader,
          buffers: {},
          fs: Rt(r.shader) ? [
            {
              outputType: V.COLOR,
              source: r.shader
            }
          ] : r.shader,
          uniforms: r.uniforms,
          materialOptions: r.material,
          preventDraw: r.preventDraw
        }
      }
    )
  ] }, r.name);
}, ob = (r) => /* @__PURE__ */ de.jsxs(To, { name: r.name, children: [
  /* @__PURE__ */ de.jsx(xo, { type: hs, config: { camera: new ur() } }),
  /* @__PURE__ */ de.jsx(mo, { type: va, config: { commands: r.callback } })
] }), fT = `\${import: camera}

void main() {
  vec2 texelSize = 1.0 / viewSize;
  vec4 o = texelSize.xyxy * vec2(-delta, delta).xxyy;

  vec4 s =
    texture2D(sourceTex, texCoord + o.xy) + texture2D(sourceTex, texCoord + o.zy) +
    texture2D(sourceTex, texCoord + o.xw) + texture2D(sourceTex, texCoord + o.zw);

  \${out: color} = s * 0.25;
}
`;
var Ca = /* @__PURE__ */ ((r) => (r[r.DOWN = 0] = "DOWN", r[r.UP = 1] = "UP", r))(Ca || {});
function Kc(r) {
  const { output: e, input: t } = r;
  return jt({
    name: r.name,
    printShader: r.printShader,
    output: e ? {
      buffers: { [V.COLOR]: e },
      depth: !1
    } : void 0,
    view: r.view,
    buffers: { sourceTex: t },
    shader: fT,
    material: r.material,
    uniforms: [
      {
        name: "delta",
        size: _.ONE,
        shaderInjection: A.FRAGMENT,
        update: () => r.direction === 0 ? 1 : 0.5
      }
    ]
  });
}
function cb(r) {
  const { compose: e, output: t, resources: i, view: n } = r, s = {
    blending: {
      blendDst: f.Material.BlendingDstFactor.One,
      blendSrc: f.Material.BlendingSrcFactor.One,
      blendEquation: f.Material.BlendingEquations.Add
    }
  }, a = [];
  for (let o = 0, c = r.samples; o < c; ++o) {
    const l = Kc({
      name: `${r.name}.box-down${o}`,
      printShader: r.printShader,
      input: i[o],
      output: i[o + 1],
      direction: Ca.DOWN,
      material: {
        blending: void 0
      }
    });
    a.push(l);
  }
  for (let o = r.samples - 1; o > 0; --o) {
    const c = Kc({
      name: `${r.name}.box-up${o}`,
      printShader: r.printShader,
      input: i[o + 1],
      output: i[o],
      direction: Ca.UP,
      material: s
    });
    a.push(c);
  }
  return e && a.push(
    jt({
      name: `${r.name}.compose`,
      printShader: r.printShader,
      // Set the buffers we want to composite
      buffers: {
        color: e,
        glow: i[1]
      },
      // Turn off blending
      material: s,
      // Render to the screen, or to a potentially specified target
      view: {
        ...t ? {
          output: {
            buffers: { [V.COLOR]: t },
            depth: !1
          }
        } : void 0,
        ...n
      },
      uniforms: [
        {
          name: "gamma",
          size: _.ONE,
          shaderInjection: A.ALL,
          update: () => [r.gammaCorrection || 1]
        }
      ],
      // Utilize our composition shader
      shader: `
          void main() {
            vec3 base = texture2D(color, texCoord).rgb;
            vec3 glow = texture2D(glow, texCoord).rgb;

            ${r.gammaCorrection !== void 0 ? `
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
  ), a;
}
function pT(r) {
  return Array.isArray(r[0]);
}
const lb = (r) => {
  const e = r.scale || Ga(1, 1), i = (pT(e) ? e : [r.scale]).map((a) => ka(a)), n = 1 / i.length, s = Z.useRef(r.zOffset);
  if (oe(r.drift)) {
    const a = r.drift;
    return jt({
      name: r.name,
      buffers: {},
      view: {
        config: {
          drawMode: { mode: qn.ALWAYS }
        }
      },
      output: {
        buffers: {
          [V.COLOR]: r.output
        },
        depth: !1
      },
      uniforms: [
        {
          name: "drift",
          size: _.THREE,
          shaderInjection: A.FRAGMENT,
          update: () => a
        }
      ],
      shader: `
        \${import: time, simplexNoise3D}

        void main() {
          float value = 0.;
          ${i.map(
        (o) => `value += simplexNoise3D(vec3(gl_FragCoord.xy * vec2(${o[0]}f, ${o[1]}f), 0.) + (drift * time));`
      ).join(`
`)}
          value *= ${n.toFixed(1)}f;
          \${out: color} = vec4(value, value, value, 1.);
        }
      `
    });
  } else if (oe(r.zOffset)) {
    const a = r.zOffset;
    return jt({
      name: r.name,
      buffers: {},
      view: {
        config: {
          drawMode: {
            mode: qn.ON_TRIGGER,
            trigger: () => {
              const o = s.current !== a;
              return s.current = a, o;
            }
          }
        }
      },
      output: {
        buffers: {
          [V.COLOR]: r.output
        },
        depth: !1
      },
      uniforms: [
        {
          name: "zOffset",
          size: _.ONE,
          update: tl(a) ? () => [a] : () => [a()]
        }
      ],
      shader: `
        \${import: simplexNoise3D}

        void main() {
          float value = 0.;
          ${i.map(
        (o) => `
            value += simplexNoise3D(vec3(gl_FragCoord.xy * vec2(${o[0]}f, ${o[1]}f), zOffset));
          `
      ).join(`
`)}
          value *= ${n.toFixed(1)}f;
          \${out: color} = vec4(value, value, value, 1.);
        }
      `
    });
  } else
    return jt({
      name: r.name,
      buffers: {},
      view: {
        config: {
          drawMode: { mode: qn.FRAME_COUNT, value: 1 }
        }
      },
      output: {
        buffers: {
          [V.COLOR]: r.output
        },
        depth: !1
      },
      shader: `
        \${import: simplexNoise2D}

        void main() {
          float value = 0.;
          ${i.map(
        (a) => `
            value += simplexNoise2D(gl_FragCoord.xy * vec2(${a[0]}f, ${a[1]}f));
          `
      ).join(`
`)}
          value *= ${n.toFixed(1)}f;
          \${out: color} = vec4(value, value, value, 1.);
        }
      `
    });
};
function Js(r) {
  var s;
  const { output: e, input: t, channel: i, grayScale: n } = r;
  return jt({
    name: r.name,
    printShader: r.printShader,
    output: e ? {
      buffers: {
        [V.COLOR]: e || ""
      },
      depth: !1
    } : void 0,
    view: {
      ...r.view,
      config: {
        camera: new ur(),
        ...(s = r.view) == null ? void 0 : s.config
      }
    },
    buffers: { color: t },
    shader: n && i ? `
      void main() {
        \${out: color} = vec4(texture2D(color, texCoord).${i}${i}${i}, 1.);
      }
    ` : i ? `
      void main() {
        \${out: color} = vec4(texture2D(color, texCoord).${i}, 0., 0., 1.);
      }
    ` : `
      void main() {
        \${out: color} = texture2D(color, texCoord);
      }
    `,
    material: r.material,
    /** Inspect the resources for feedback on their configuration */
    onResources: (a) => {
      Object.values(a).forEach((o) => {
        (!o.textureSettings || o.textureSettings.generateMipMaps === void 0 || o.textureSettings.generateMipMaps === !0) && Ce("drawjsx-resource-error", () => {
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
function ub(r) {
  let e = 0;
  const t = () => {
    const i = Math.floor(e / 4), n = e % 4, s = {
      left: `${i * 23 + 5}%`,
      top: `${n * 23 + 5}%`,
      width: "20%",
      height: "20%"
    };
    return e++, s;
  };
  return /* @__PURE__ */ de.jsx(de.Fragment, { children: r.inputs.flatMap((i) => Rt(i) ? Js({
    name: `draw-debug-${e}`,
    input: i,
    view: {
      config: {
        background: r.background,
        clearFlags: [xt.COLOR, xt.DEPTH],
        viewport: t()
      }
    }
  }) : i.depth ? jt({
    name: `draw-debug-${e}`,
    buffers: {
      tex: i.key
    },
    view: {
      config: {
        background: [0.1, 0.1, 0.1, 1],
        clearFlags: [xt.COLOR, xt.DEPTH],
        viewport: t()
      }
    },
    shader: `
                void main() {
                  // 1) Sample raw depth
                  float z = texture2D(tex, texCoord).r;

                  // 2) Optional: linearize if you want (optional)
                  // z = (2.0 * near) / (far + near - z * (far - near));

                  // 3) Nonlinear boost for near contrast
                  float d = pow(z, 30.0);

                  // 4) Fake fancy color: purple -> pink -> orange -> yellow
                  vec3 color = vec3(0.0);
                  if (d < 0.5) {
                    color = mix(vec3(0.2, 0.0, 0.5), vec3(1.0, 0.0, 0.5), d * 2.0);
                  } else {
                    color = mix(vec3(1.0, 0.0, 0.5), vec3(1.0, 1.0, 0.0), (d - 0.5) * 2.0);
                  }

                  \${out: fragColor} = vec4(color, 1.0);
                }
          `
  }) : i.channels ? i.channels.map(
    (s) => Js({
      name: `draw-debug-${e}`,
      input: i.key,
      channel: s,
      grayScale: !0,
      view: {
        config: {
          background: r.background,
          clearFlags: [xt.COLOR, xt.DEPTH],
          viewport: t()
        }
      }
    })
  ) : Js({
    name: `draw-debug-${e}`,
    input: i.key,
    view: {
      config: {
        background: r.background,
        clearFlags: [xt.COLOR, xt.DEPTH],
        viewport: t()
      }
    }
  })) });
}
function hb(r) {
  const { output: e, input: t, view: i } = r, n = [];
  return n.push(
    jt({
      name: `${r.name}_base`,
      printShader: r.printShader,
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
        ...i
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
  ), r.drift ? r.drift && n.push(
    jt({
      name: r.name,
      printShader: r.printShader,
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
      view: i,
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
            var s;
            return ((s = r.drift) == null ? void 0 : s.direction) || [0, 0];
          }
        }
      ],
      // Utilize our composition shader
      shader: `
          void main() {
            vec4 fade = texture2D(tex, texCoord + (drift / tex_size));
            fade.rgba *= ${r.intensity || 0.7};
            \${out: color} = fade;
          }
        `
    })
  ) : n.push(
    jt({
      name: r.name,
      printShader: r.printShader,
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
      view: i,
      // Utilize our composition shader
      shader: `
          void main() {
            vec4 fade = texture2D(tex, texCoord);
            fade.rgba *= ${r.intensity || 0.7};
            \${out: color} = fade;
          }
        `
    })
  ), n;
}
const Io = class Io extends Xt {
  constructor(e, t, i) {
    super(e, t, i), console.warn(
      "Please ensure all debugLayer calls are removed for production:",
      i.key
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
    ), t = e.childLayers(), i = {};
    for (; t.length > 0; ) {
      const n = t.pop();
      if (!n) continue;
      const s = new n.init[0](
        this.surface,
        this.scene,
        n.init[1]
      );
      i[s.id] = {
        shaderIO: s.initShader()
      }, s.childLayers().forEach((a) => t.push(a));
    }
    return console.warn(`Shader IO: ${this.id}
`, {
      shaderIO: e.initShader(),
      childLayers: i
    }), null;
  }
};
Io.defaultProps = {
  data: new le(),
  key: "default",
  messageHeader: () => "",
  wrap: zi(Xt, {
    data: new le()
  })
};
let Na = Io;
function db(r, e) {
  const t = ji(Na, {
    messageHeader: () => `CHANGES FOR: ${t.init[1].key}`,
    wrap: ji(r, e),
    data: e.data
  });
  return t;
}
export {
  rm as ActiveIOExpansion,
  L as AnchorType,
  KT as ArcInstance,
  Mc as ArcLayer,
  e0 as ArcScaleType,
  Eg as Atlas,
  sT as AtlasJSX,
  _g as AtlasManager,
  Ag as AtlasResourceManager,
  cr as Attribute,
  tr as AutoEasingLoopStyle,
  eo as AutoEasingMethod,
  Px as Axis2D,
  Cs as BaseIOExpansion,
  Lm as BaseIOSorting,
  Za as BaseProjection,
  mn as BaseResourceManager,
  mg as BaseShaderIOInjection,
  Xm as BasicCamera2DController,
  tT as BasicCamera2DControllerJSX,
  Kg as BasicIOExpansion,
  cb as BloomJSX,
  te as Bounds,
  Kc as BoxSampleJSX,
  Ca as BoxSampleJSXDirection,
  vn as BufferManagerBase,
  Hr as Camera,
  ur as Camera2D,
  Hm as CameraBoundsAnchor,
  jr as CameraProjectionType,
  ZT as CircleInstance,
  Ic as CircleLayer,
  xt as ClearFlags,
  aT as ColorBufferJSX,
  va as CommandLayer,
  ob as CommandsJSX,
  lt as CommonMaterialOptions,
  ic as CommonTextureOptions,
  Xr as Control2D,
  sb as CubeInstance,
  $c as CubeLayer,
  ht as CustomTag,
  Gm as DEFAULT_IO_EXPANSION,
  zm as DEFAULT_RESOURCE_MANAGEMENT,
  Cg as DEFAULT_RESOURCE_ROUTER,
  Vm as DEFAULT_SHADER_TRANSFORM,
  oT as DepthBufferJSX,
  ub as DrawDebugJSX,
  Js as DrawJSX,
  Hg as EasingIOExpansion,
  GT as EasingUtil,
  Zu as EdgeBroadphase,
  JT as EdgeInstance,
  Oc as EdgeLayer,
  Kn as EdgeScaleType,
  X as EdgeType,
  ne as EulerOrder,
  Zc as EventManager,
  dg as FontGlyphRenderSize,
  nT as FontJSX,
  pg as FontManager,
  sg as FontMap,
  ba as FontMapGlyphType,
  ug as FontRenderer,
  bg as FontResourceManager,
  Vi as FontResourceRequestFetch,
  V as FragmentOutputType,
  Jn as GLProxy,
  f as GLSettings,
  od as GLState,
  $r as Geometry,
  E0 as GlyphInstance,
  ya as GlyphLayer,
  bf as Hadamard2x2,
  vf as Hadamard3x3,
  wf as Hadamard4x4,
  gd as INVALID_RESOURCE_MANAGER,
  zp as IdentityTransform,
  eb as ImageInstance,
  Lc as ImageLayer,
  Ui as ImageRasterizer,
  Vn as IndexBufferSize,
  wt as Instance,
  $x as Instance3D,
  fm as InstanceAttributeBufferManager,
  gm as InstanceAttributePackingBufferManager,
  S as InstanceAttributeSize,
  Jc as InstanceBlockIndex,
  be as InstanceDiffType,
  le as InstanceProvider,
  CT as InstanceProviderWithList,
  pd as InvalidResourceManager,
  Be as LabelInstance,
  Ra as LabelLayer,
  Xt as Layer,
  De as Layer2D,
  ae as LayerBufferType,
  Mm as LayerInteractionHandler,
  mo as LayerJSX,
  Bm as LayerMouseEvents,
  us as LayerScene,
  ai as M200,
  oi as M201,
  ci as M210,
  li as M211,
  bs as M300,
  vs as M301,
  ws as M302,
  Es as M310,
  ys as M311,
  Rs as M312,
  _s as M320,
  As as M321,
  Ms as M322,
  Bi as M3R,
  hr as M400,
  dr as M401,
  fr as M402,
  pr as M403,
  gr as M410,
  mr as M411,
  xr as M412,
  Tr as M413,
  br as M420,
  vr as M421,
  wr as M422,
  Er as M423,
  yr as M430,
  Rr as M431,
  _r as M432,
  Ar as M433,
  Ge as M4R,
  Ts as Material,
  _e as MaterialUniformType,
  NT as MatrixMath,
  iu as Model,
  fh as MouseButton,
  Oa as NOOP,
  sn as NewLineCharacterMode,
  Im as NoView,
  Ne as ObservableMonitoring,
  Ye as PackNode,
  Y as PickType,
  BT as PlaneMath,
  dT as PostProcessInstance,
  jt as PostProcessJSX,
  Sa as PostProcessLayer,
  Dx as Projection3D,
  Ve as PromiseResolver,
  jf as QR1,
  Hf as QR2,
  Xf as QR3,
  Qf as QR4,
  Zf as QW,
  Yf as QX,
  qf as QY,
  Kf as QZ,
  eg as QuadTree,
  rn as QuadTreeNode,
  Jp as QuadTreeQuadrants,
  OT as QuaternionMath,
  Qu as QueuedEventHandler,
  Jx as QueuedEventHandlerJSX,
  HT as REQUEST,
  jT as RESOURCE,
  LT as RayMath,
  cs as ReactiveDiff,
  U0 as RectangleInstance,
  kc as RectangleLayer,
  qT as ReferenceCamera2D,
  si as RenderTarget,
  Ps as RenderTexture,
  Ig as RenderTextureResourceManager,
  $T as ResourcePool,
  Wu as ResourceRouter,
  ce as ResourceType,
  rb as RingInstance,
  Gc as RingLayer,
  sa as SRT4x4,
  mu as SRT4x4_2D,
  ar as ScaleMode,
  ta as Scene,
  Gx as SceneGraphLayer,
  To as SceneJSX,
  A as ShaderInjectionTarget,
  ve as ShaderModule,
  ks as ShaderModuleUnit,
  Ux as Simple3DTransformController,
  rT as Simple3DTransformControllerJSX,
  gs as SimpleEventHandler,
  eT as SimpleEventHandlerJSX,
  fd as SimpleProjection,
  lb as SimplexNoiseJSX,
  ea as StreamChangeStrategy,
  Vr as SubTexture,
  Wm as Surface,
  yn as SurfaceContext,
  el as SurfaceErrorType,
  ab as SurfaceJSX,
  jn as TRS4x4,
  $f as TRS4x4_2D,
  _a as TextAlignment,
  tb as TextAreaInstance,
  Uc as TextAreaLayer,
  j as Texture,
  lo as TextureIOExpansion,
  iT as TextureJSX,
  _t as TextureSize,
  hb as TrailJSX,
  co as Transform,
  nb as Transform2D,
  Cu as TreeNode,
  xm as UniformBufferManager,
  _ as UniformSize,
  Bt as UseMaterialStatus,
  Om as UserInputEventManager,
  He as V3R,
  Nh as V4R,
  D as VecMath,
  FT as VectorMath,
  ze as VertexAttributeSize,
  pn as View,
  hs as View2D,
  Vc as View3D,
  qn as ViewDrawMode,
  xo as ViewJSX,
  cd as WebGLRenderer,
  N as WebGLStat,
  ir as WordWrap,
  Fa as add1,
  Wr as add2,
  ff as add2x2,
  Ke as add3,
  pf as add3x3,
  Wa as add4,
  Qh as add4by3,
  gf as add4x4,
  Jf as addQuat,
  nf as affineInverse2x2,
  sf as affineInverse3x3,
  af as affineInverse4x4,
  up as angleQuat,
  $e as apply1,
  he as apply2,
  Mt as apply2x2,
  me as apply3,
  st as apply3x3,
  fe as apply4,
  Te as apply4x4,
  nn as atlasRequest,
  hp as axisQuat,
  il as ceil1,
  wl as ceil2,
  Ll as ceil3,
  Gl as ceil4,
  nt as clamp,
  Zh as color4FromHex3,
  Jh as color4FromHex4,
  Oo as colorBufferFormat,
  ET as colorUID,
  nl as compare1,
  Ua as compare2,
  kf as compare2x2,
  es as compare3,
  Gf as compare3x3,
  ja as compare4,
  gu as compare4x4,
  df as concat4x4,
  uh as concatChildren,
  Tu as conjugateQuat,
  UT as convertToSDF,
  sl as copy1,
  Da as copy2,
  zf as copy2x2,
  Tt as copy3,
  Vf as copy3x3,
  or as copy4,
  dn as copy4x4,
  VT as create,
  $u as createAtlas,
  tg as createAttribute,
  ji as createChildLayer,
  XT as createEasingAttribute,
  Vu as createFont,
  zi as createLayer,
  ib as createLayer2Din3D,
  Rh as createMaterialOptions,
  au as createTexture,
  rg as createUniform,
  ig as createVertex,
  Xu as createView,
  ol as cross1,
  yl as cross2,
  Ze as cross3,
  Vl as cross4,
  db as debugLayer,
  ao as decomposeRotation,
  Lo as depthBufferFormat,
  ge as determinant2x2,
  Di as determinant3x3,
  ou as determinant4x4,
  rp as diffUnitQuat,
  cl as divide1,
  ms as divide2,
  xs as divide3,
  $l as divide4,
  ep as divideQuat,
  xl as dot1,
  gn as dot2,
  ct as dot3,
  Ya as dot4,
  ap as dotQuat,
  Xh as down3,
  wi as drawMode,
  ll as empty1,
  Rl as empty2,
  Fl as empty3,
  Wl as empty4,
  pp as eulerToQuat,
  Jt as eventElementPosition,
  tp as exponentQuat,
  ul as flatten1,
  _l as flatten2,
  Bl as flatten3,
  Ha as flatten4,
  hl as floor1,
  Al as floor2,
  Pl as floor3,
  jl as floor4,
  Hi as fontRequest,
  al as forward1,
  El as forward2,
  Pi as forward3,
  zl as forward4,
  aa as fromEulerAxisAngleToQuat,
  wu as fromOrderedEulerToQuat,
  Fh as fuzzyCompare1,
  Dh as fuzzyCompare2,
  zh as fuzzyCompare3,
  Yh as fuzzyCompare4,
  im as generateDefaultScene,
  am as generateLayerGeometry,
  um as generateLayerMaterial,
  bn as generateLayerModel,
  Wo as getAbsolutePositionBounds,
  mT as getProgramInfo,
  bp as iQuat,
  Is as identity2x2,
  Mr as identity3x3,
  se as identity4x4,
  sp as imaginaryQuat,
  An as indexToColorAttachment,
  mh as indexToTextureUnit,
  kg as injectShaderIO,
  _n as inputImageFormat,
  Eh as instanceAttributeSizeFloatCount,
  dl as inverse1,
  ka as inverse2,
  an as inverse3,
  Hl as inverse4,
  to as inverse4x4,
  ip as inverseQuat,
  dc as isAtlasResource,
  Zr as isBoolean,
  QT as isBufferLocation,
  Hu as isBufferLocationGroup,
  oe as isDefined,
  hc as isFontResource,
  wT as isFunction,
  YT as isInstanceAttributeBufferLocation,
  dm as isInstanceAttributeBufferLocationGroup,
  xT as isInstanceAttributeVector,
  vT as isNewline,
  tl as isNumber,
  Li as isOffscreenCanvas,
  ec as isOrthographic,
  la as isPerspective,
  Ur as isRenderTextureResource,
  TT as isResourceAttribute,
  Rt as isString,
  mm as isUniformBufferLocation,
  ST as isUniformFloat,
  AT as isUniformMat3,
  MT as isUniformMat4,
  IT as isUniformTexture,
  yT as isUniformVec2,
  RT as isUniformVec3,
  _T as isUniformVec4,
  sd as isUniformVec4Array,
  Oh as isVec1,
  rl as isVec2,
  Lh as isVec3,
  G as isVec4,
  Un as isVideoResource,
  Oi as isWhiteSpace,
  vp as jQuat,
  wp as kQuat,
  Hh as left3,
  bl as length1,
  Ph as length1Components,
  gi as length2,
  Ol as length2Components,
  za as length3,
  kl as length3Components,
  qa as length4,
  Gr as length4Components,
  bu as lengthQuat,
  Tl as linear1,
  Nl as linear2,
  Ul as linear3,
  Ql as linear4,
  xp as lookAtMatrix,
  Eu as lookAtQuat,
  yi as magFilter,
  kT as makeFontSDF,
  Je as makeObservable,
  ua as mapGetWithDefault,
  pi as mapInjectDefault,
  oa as matrix3x3FromUnitQuatModel,
  fp as matrix3x3FromUnitQuatView,
  gp as matrix3x3ToQuaternion,
  dp as matrix4x4FromUnitQuatModel,
  so as matrix4x4FromUnitQuatView,
  mp as matrix4x4ToQuaternion,
  fl as max1,
  Ml as max2,
  Va as max3,
  Yl as max4,
  pl as min1,
  Il as min2,
  $a as min3,
  ql as min4,
  Lr as minFilter,
  gl as multiply1,
  Sl as multiply2,
  uf as multiply2x2,
  Dl as multiply3,
  hf as multiply3x3,
  Xl as multiply4,
  bt as multiply4x4,
  ns as multiplyQuat,
  of as multiplyScalar2x2,
  cf as multiplyScalar3x3,
  lf as multiplyScalar4x4,
  Go as newLineCharRegEx,
  yh as newLineRegEx,
  _u as nextFrame,
  ml as normalize1,
  Cl as normalize2,
  ot as normalize3,
  Kl as normalize4,
  vu as normalizeQuat,
  Gu as normalizeWheel,
  M as observable,
  Au as onAnimationLoop,
  lr as onFrame,
  ss as oneQuat,
  fu as orthographic4x4,
  Lg as packAttributes,
  du as perspective4x4,
  Uf as perspectiveFOVY4x4,
  ro as perspectiveFrustum4x4,
  Xi as plane,
  Ap as planeCopy,
  Tn as planeDistance,
  Mp as planeFromPointAndDistance,
  Sp as planeFromPointAndNormal,
  Ip as planeFromPoints,
  Dp as planeInvert,
  Op as planeLineIntersection,
  Lp as planeLineSegmentIntersection,
  Up as planeNormal,
  kp as planeOriginDistance,
  Pp as planePointIsBehind,
  Bp as planePointIsInFront,
  Cp as planeProjectPoint,
  Fp as planeRayIntersection,
  Np as planeReflectPoint,
  WT as preloadNumber,
  na as project3As4ToScreen,
  pu as projectToScreen,
  yu as ray,
  Ru as rayFromPoints,
  yp as rayToLocation,
  np as realQuat,
  ls as removeComments,
  zu as renderGlyph,
  Iu as resolveUpdate,
  Gh as reverse2,
  $h as reverse3,
  Kh as reverse4,
  jh as right3,
  ca as rotateVectorByUnitQuat,
  cu as rotation2x2,
  lu as rotation4x4,
  Bf as rotation4x4by3,
  Ba as scale1,
  Ie as scale2,
  Pe as scale3,
  Xa as scale4,
  uu as scale4x4,
  Pf as scale4x4by3,
  xu as scaleQuat,
  Mu as scheduleUpdate,
  ui as shaderTemplate,
  Nu as shallowCompare,
  Rf as shearX2x2,
  Af as shearX4x4,
  _f as shearY2x2,
  Mf as shearY4x4,
  If as shearZ4x4,
  Zl as slerpQuat,
  Tp as slerpUnitQuat,
  gh as stencilBufferFormat,
  DT as stopAllFrameCommands,
  Jo as stopAnimationLoop,
  hi as subTextureIOValue,
  Pa as subtract1,
  Re as subtract2,
  mf as subtract2x2,
  qe as subtract3,
  xf as subtract3x3,
  Qa as subtract4,
  Tf as subtract4x4,
  Ei as texelFormat,
  cn as textureRequest,
  Bo as textureUnitToIndex,
  cp as toEulerFromQuat,
  op as toEulerXYZfromOrderedEuler,
  no as toOrderedEulerFromQuat,
  lp as toOrderedEulerFromQuat2,
  ed as toString1,
  td as toString2,
  Of as toString2x2,
  rd as toString3,
  Lf as toString3x3,
  id as toString4,
  Ff as toString4x4,
  Bh as tod1,
  Uh as tod2,
  Vh as tod3,
  qh as tod4,
  kh as tod_flip2,
  Ah as touchesContainsStartView,
  _h as touchesHasStartView,
  Sf as transform2,
  Cf as transform3,
  Nf as transform3as4,
  hn as transform4,
  hu as translation4x4,
  Df as translation4x4by3,
  Ef as transpose2x2,
  Wn as transpose3x3,
  yf as transpose4x4,
  P as uid,
  Wh as up3,
  ni as useChildResolvers,
  vl as vec1,
  Jl as vec1Methods,
  Ga as vec2,
  eu as vec2Methods,
  di as vec3,
  tu as vec3Methods,
  ts as vec4,
  ru as vec4Methods,
  zT as wait,
  ko as whiteSpaceCharRegEx,
  bT as whiteSpaceRegEx,
  Fo as wrapMode,
  we as zeroQuat
};
//# sourceMappingURL=index.js.map
