# Shader Modules

## module-id: camera

### Compatibility

Vertex shader and fragment shader

### Uniforms

**projection**

* Type: matrix4x4

* Usage: projection matrix from the view camera

**view**

* Type: matrix4x4

* Usage: model view matrix from the view camera

**viewProjection**

* Type: matrix4x4

* Usage: model view matrix projection matrix

**cameraPosition**

* Type: vector3

* Usage: camera's current position

**cameraScale**

* Type: vector3

* Usage: camera's current scale

**cameraRotation**

* Type: vector3

* Usage: camera's current Euler rotation

**viewSize**

* Type: vector2

* Usage: pixel width and height of the view

**pixelRation**

* Type: float

* Usage: current layer's pixel ration, pixel ration dependent items like gl_PointSize will need this metric if it is not working in clip space.

## Module-id: projection

### Compatibility

Vertex shader and fragment shader

### Methods

**cameraSpace(vec3 world)**

Parameters:

* world (vec3) - A 3d coordinate [x, y, z] in real world

Returns:

* vec3 - A 3d coordinate in camera space

Usage:

* Projects a world 3D coordinate to a camera space coordinate

**cameraSpaceSize(vec3 worldSize)**

Parameters:

* worldSize (vec3) - A 3d size [length, width, height] in real world

Returns:

* vec3 - A 3d size in camera space

Usage:

* Projects a world 3D size to a camera space size

**clipSpace(vec3 world)**

Parameters:

* world (vec3) - A 3d coordinate [x, y, z] in real world

Returns:

* vec3 - A 3d coordinate in clip space

Usage:

* Projects a world 3D coordinate to a clip space coordinate

**clipSpaceSize(vec3 worldSize)**

Parameters:

* world (vec3) - A 3d size [length, width, height] in real world

Returns:

* vec3 - A 3d size in clip space

Usage:

* Projects a world 3D size to a clip space size

## Module-id: random

### Compatibility

Vertex shader and fragment shader

### Uniforms:

**random**

* Type: float
* Usage: get a random float number between 0 and 1

## Module-id: PI

### Compatibility

Vertex shader and fragment shader

### Constants:

**PI**

* Type: float
* Usage: Pi (Greek letter “π”) is used in mathematics to represent a constant — the ratio of the circumference of a circle to its diameter.
* Value: 3.14159265

## Module-id: PI_2

### Compatibility

Vertex shader and fragment shader

### Constants:

**PI_2**

* Type: float
* Usage: PI / 2
* Value: 1.5707963268

## Module-id: PI_4

### Compatibility

Vertex shader and fragment shader

### Constants:

**PI_4**

* Type: float
* Usage: PI / 4
* Value: 0.7853981634

## Module-id: PI2

### Compatibility

Vertex shader and fragment shader

### Constants:

**PI2**

* Type: float
* Usage: 2 x PI
* Value: 6.2831853

## Module-id: PI_INV

### Compatibility

Vertex shader and fragment shader

### Constants:

**PI_INV**

* Type: float
* Usage: 1 / PI
* Value: 0.3183098862

## Module-id: PI2_INV

### Compatibility

Vertex shader and fragment shader

### Constants:

**PI2_INV**

* Type: float
* Usage: 1 / (2 x PI)
* Value: 0.1591549431

## Module-id: toDegrees

### Compatibility

Vertex shader and fragment shader

### Constants:

**toDegrees**

* Type: float
* Usage: coefficient to convert radians to degrees
* Value: 57.2957795131

## Module-id: toRadians

### Compatibility

Vertex shader and fragment shader

### Constants

**toRadians**

* Type: float
* Usage: coefficient to convert degrees to radians
* value: 0.01745329252

## Module-id: constants

### Compatibility

Vertex shader and fragment shader

### Usage

This module includes PI, PI_2, PI_4, PI2, PI_INV, PI2_INV, toDegrees, toRadians

## Module-id: bezier1

### Compatibility

Vertex shader and fragment shader

### Methods:

**bezier1(float t, vec2 p1, vec2 p2, vec2 c1)**

Parameters:

* t (float) - bezier time
* p1 (vec2) - bezier end point 1
* p2 (vec2) - bezier end point 2
* c1 (vec2) - control point

Returns:

* vec2 - point at time t from bezier curve

Usage:

* This method returns a point at time t from single control point bezier curve

## Module-id: bezier2

### Compatibility

Vertex shader and fragment shader

### Methods:

**bezier2(float t, vec2 p1, vec2 p2, vec2 c1, vec2 c2)**
Parameters:

* t (float) - bezier time (normally t is from 0 to 1)
* p1 (vec2) - bezier end point 1
* p2 (vec2) - bezier end point 2
* c1 (vec2) - control point 1
* c2 (vec2) - control point 2

Returns:

* vec2 - point at time t from bezier curve

Usage:

* This method returns point at time t from two control points bezier curve

## Module-id: arc

### Compatibility

Vertex shader and fragment shader

### methods:

**arc(float t, vec2 center, float radius, float start, float end)**

Parameters:

* t (float) - arc time (normally t is from 0 to 1)
* center (vec2) - center of the circle where the arc belongs
* radius (vec2) - radius of the circle where the arc belongs
* start (float) - start angle of the arc
* end (float) - end angle of the arc

Returns:

* vec2 - point at time t from the arc

Usage:

* This methods returns point at time t on an arc from angle start to angle end

## Module-id: fsin

### Compatibility

Vertex shader and fragment shader

### Methods:

**fsin(float x)**

Parameters:

* x (float) - input angle, measured in radians

Returns:

* float - approximation of sin

Usage:

* This method is an approximation of sin that allows us to bypass hardware precision limitations for sin

## Module-id: fcos

### Compatibility

Vertex shader and fragment shader

### Methods:

**fcos(float x)**

Parameters:

* x (float) - input angle, measured in radians

Returns:

* float - approximation of cos

Usage:

* This method is an approximation of cos that allows us to bypass hardware precision limitations for cos

## Module-id: translation

### Compatibility

Vertex shader and fragment shader

### Methods:

**translation(vec3 t)**

Parameters:

* t (vec3) - an translation vector [deltaX, deltaY, deltaZ]

Returns:

* mat4 - translation matrix

Usage:

* This mehod returns matrix 4x4 which represents the translation t

## Module-id: rotation

### Compatibility

Vertex shader and fragment shader

### methods:

**rotationFromQuaternion(vec4 q)**

Parameters:

* q (vec4) - a quaternion which represents rotation

Returns:

* mat4 - rotation matrix

Usage:

* Returns matrix 4x4 which reprsents the rotation from quaternion q

## Module-id: scale

### Compatibility

Vertex shader and fragment shader

### Methods:

**scale(vec3 s)**

Parameters:

* s (vec3) - a 3d scale [scaleX, scaleY, scaleZ]

Returns:

* mat4 - scale matrix

Usage:

* Returns matrix 4x4 which reprsents the scale s

## Module-id: transform

### Compatibility

Vertex shader and fragment shader

### Methods:

**transform(vec3 s, vec4 r, vec3 t)**

Parameters:

* s (vec3) - a 3d scale [scaleX, scaleY, scaleZ]
* r (vec4) - a quaternion which represents rotation
* t (vec3) - an translation vector [deltaX, deltaY, deltaZ]

Returns:

* mat4 - transform matrix

Usage:

* Returns matrix 4x4 which represents the result of scale s, rotation r and translation t

## Module-id: frame

### Compatibility

Vertex shader and fragment shader

### Uniforms:

**currentTime**

* Type: float
* Usage: current frame's current time

**currentFrame**

* Type: float
* Usage: current frame's index

## Module-id: hsv

### Compatibility

Vertex shader and fragment shader

### Methods:

**rbg2hsv(vec3 c)**

Parameters:

* c (vec3) - a rgb color [r, g, b]

Returns:

* vec3 - a hsv color

Usage:

* Takes a rgb color and converts it to a hsv color

**hsv2rgb(vec3 c)**

Parameters:

* c (vec3) - a hsv color [h, s, v]

Returns:

* vec3 - a rgb color

Usage:

* Takes a hsv color and converts it to a rgb color
