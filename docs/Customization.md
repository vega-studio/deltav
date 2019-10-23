# Customization

## Custom Instances

Customers can create a new instance by simply extending [instance](Instances/Instance.md). When creating the new instance, customer can add decorator @observable which intends for single properties on Instances only. It will facilitate automatic updates and stream the updates through an InstanceProvider to properly update the Instances values in the appropriate and corresponding buffers that will get committed to the GPU

## Custom Layers

Customers can create a new layer by extending [Layer2D] or [Layer]. Customers should choose their own ways to initShaders, write their own shaders and set materialOptions.

When initing shaders, an [IShaderInitialization<Instance>] interface should be returned from initShader() method and then the required properties will be injected into custom shaders. This requires customers to do the following steps:

* Specify the shader source
* Specify [drawMode], it includes six modes: LINE_LOOP, LINE_STRIP, LINES, POINTS, TRIANGLE_FAN,TRIANGLE_STRIP, TRIANGLES
* Specify vertexCount
* Inject [instanceAttributes]
* Inject [vertexAttributes]
* Set the [uniforms]
* Set special attribute expansion

Setting materialOptions uses the method getMaterialOptions of layer, and ILayerMaterialOptions interface should be returned.

## Shaders

Customized shaders should be binded in initShader method when creating customized layers. Two types of shaders are supported: vertex shader and fragment shader.
When creating customized shaders, there are several in-built shader modules can be applied. These modules include constants and methods. Modules can be easily imported using id:

```
${import: module1, module2, module3}
```

After a module is imported, methods and constants in the module can be used directly in customized shaders.
Here are a list of available modules:

<<<<<<< HEAD
### Camera related modules

* module-id: camera
* compatibility: vertex shader and fragment shader
* Uniforms:

  1.  projection:
      * type: matrix4x4
      * description: projection matrix from the view camera
  2.  view:
      * type: matrix4x4
      * description: model view matrix from the view camera
  3.  viewProjection:
      * type: matrix4x4
      * description: model view matrix projection matrix
  4.  cameraPosition:
      * type: vector3
      * description: camera's current position
  5.  cameraScale:
      * type: vector3
      * description: camera's current scale
  6.  cameraRotation:
      * type: vector3
      * description: camera's current Euler rotation
  7.  viewSize
      * type: vector2
      * description: pixel width and height of the view
  8.  pixelRation
      * type: float
      * description: current layer's pixel ration, pixel ration dependent items like gl_PointSize will need this metric if it is not working in clip space.

* module-id: projection
* compatibility: vertex shader and fragment shader
* Methods:
  1.  cameraSpace(vec3 world)
      * return type: vec3
      * description: project a world 3D coordinate to a camera space coordinate
  2.  cameraSpaceSize(vec3 worldSize)
      * return type: vec3
      * description: project a world 3D size to a camera space size
  3.  clipSpace(vec3 world)
      * return type: vec3
      * description: project a world 3D coordinate to a clip space coordinate
  4.  clipSpaceSize(vec3 worldSize)
      * return type: vec3
      * description: project a world 3D size to a clip space size

### Math related modules

* module-id: random
* compatibility: vertex shader and fragment shader
* uniforms:

  1.  random
      * type: float
      * description: get a random float number between 0 and 1

* module-id: PI
* compatibility: vertex shader and fragment shader
* constants:

  1.  PI
      * type: float
      * description: Pi (Greek letter “π”) is used in mathematics to represent a constant — the ratio of the circumference of a circle to its diameter.
      * value: 3.14159265

* module-id: PI_2
* compatibility: vertex shader and fragment shader
* constants:

  1.  PI_2
      * type: float
      * description: PI / 2
      * value: 1.5707963268

* module-id: PI_4
* compatibility: vertex shader and fragment shader
* constants:

  1.  PI_4
      * type: float
      * description: PI / 4
      * value: 0.7853981634

* module-id: PI2
* compatibility: vertex shader and fragment shader
* constants:

  1.  PI2
      * type: float
      * description: 2 x PI
      * value: 6.2831853

* module-id: PI_INV
* compatibility: vertex shader and fragment shader
* constants:

  1.  PI_INV
      * type: float
      * description: 1 / PI
      * value: 0.3183098862

* module-id: PI2_INV
* compatibility: vertex shader and fragment shader
* constants:

  1.  PI2_INV
      * type: float
      * description: 1 / (2 x PI)
      * value: 0.1591549431

* module-id: toDegrees
* compatibility: vertex shader and fragment shader
* constants:

  1.  toDegrees
      * type: float
      * description: coefficient to convert radians to degrees
      * value: 57.2957795131

* module-id: toRadians
* compatibility: vertex shader and fragment shader
* description: This module includes

  1.  toRadians
      * type: float
      * description: coefficient to convert degrees to radians
      * value: 0.01745329252

* module-id: constants
* compatibility: vertex shader and fragment shader
* description: This module includes PI, PI_2, PI_4, PI2, PI_INV, PI2_INV, toDegrees, toRadians

* module-id: bezier1
* compatibility: vertex shader and fragment shader
* methods:

  1.  bezier1(float t, vec2 p1, vec2 p2, vec2 c1)
      * return type: vec2
      * description: return point at time t from single control point bezier curve

* module-id: bezier2
* compatibility: vertex shader and fragment shader
* methods:

  1.  bezier2(float t, vec2 p1, vec2 p2, vec2 c1, vec2 c2)
      * return type: vec2
      * description: return point at time t from two control points bezier curve

* module-id: arc
* compatibility: vertex shader and fragment shader
* methods:

  1.  arc(float t, vec2 center, float radius, float start, float end)
      * return type: vec2
      * description: return point at time t on an arc from angle start to angle end

* module-id: fsin
* compatibility: vertex shader and fragment shader
* methods:

  1.  fsin(float x)
      * return type: float
      * description: an approximation of sin that allows us to bypass hardware precision limitations for sin

* module-id: fcos
* compatibility: vertex shader and fragment shader
* methods:
  1.  fcos(float x)
      * return type: float
      * description: an approximation of cos that allows us to bypass hardware precision limitations for cos

### Matrix related modules

* module-id: translation
* compatibility: vertex shader and fragment shader
* methods:

  1.  translation(vec3 t)
      * return type: mat4
      * description: return matrix 4x4 which represents the translation t

* module-id: rotation
* compatibility: vertex shader and fragment shader
* methods:

  1.  rotationFromQuaternion(vec4 q)
      * return type: mat4
      * description: return matrix 4x4 which represents the rotation from quaternion q

* module-id: scale
* compatibility: vertex shader and fragment shader
* methods:

  1.  scale(vec3 s)
      * return type: mat4
      * description: return matrix 4x4 which represents the scale s

* module-id: transform
* compatibility: vertex shader and fragment shader
* methods:
  1.  transform(vec3 s, vec4 r, vec3 t)
      * return type: mat4
      * description: return matrix 4x4 which represents the result of scale s, rotation r and translation t

### Frame related modules

* module-id: frame
* compatibility: vertex shader and fragment shader
* uniforms:
  1.  currentTime
      * type: float
      * description: current frame's current time
  2.  currentFrame
      * type: float
      * description: current frame's index

### Color related modules

* module-id: hsv
* compatibility: vertex shader and fragment shader
* methods:
  1.  rbg2hsv(vec3 c)
      * return type: vec3
      * description: This method takes a rgb color and converts it to a hsv color
  2.  hsv2rgb(vec3 c)
      * return type: vec3
      * description: This method takes a hsv color and converts it to a rgb color

=======
>>>>>>> a1a2b954ff5e679be0533f64f7ce7d4d2c9fc701
### shaderTemplate

A shader can also be created by method [shaderTemplate], it could help to combine different actions with base shader together to be a new shader.

### base modules

BaseShaderModules will help to form the basic shader that can be modified later. Base shader will be determined by PickType and easing method.
