# Quaternion

Quaternion is a vec4 expressed as [scalar, i, j, k].

**zeroQuat(out?: Quaternion): Quaternion**

Parameters:

* out: (optional) a quaternion that will be filled by the result if provided

Returns:

Quternion: a new zero quaternion

**addQuat(q1: Quaternion, q2: Quaternion, out?: Quaternion): Quaternion**

Adds two quaternions

Parameters:

* q1: quaternion
* q2: quaternion
* out: (optional) a quaternion that will be filled by the result if provided

Returns:

Quaternion: result of q1 + q2

**multiplyQuat(q1: Quaternion, q2: Quaternion, out?: Quaternion): Quaternion**

Multiplies two quaternions.

Quaternion multiplication is noncommutative.

Parameters:

* q1: quaternion
* q2: quaternion
* out: (optional) a quaternion that will be filled by the result if provided

Returns:

Quaternion: result of q1 x q2

**function divideQuat(q1: Quaternion, q2: Quaternion, out?: Quaternion): Quaternion**

Performs quaternion division: q1 / q2 = q1 \* q2^-1

Parameters:

* q1: quaternion
* q2: quaternion
* out: (optional) a quaternion that will be filled by the result if provided

Returns:

Quaternion: result of q1 / q2

**function exponentQuat(q: Quaternion, out?: Quaternion): Quaternion**

Calculates the exponentiation of a quaternion

Parameters:

* q: quaternion to calculate
* out: (optional) a quaternion that will be filled by the result if provided

Returns:

Quaternion: result of exponentiation

**scaleQuat(q: Quaternion, scale: number, out?: Quaternion): Quaternion**

Multiplies every element of a quaternion by a scalar

Parameters:

* q: quaternion to calculate
* scale: scalar to multiply
* out: (optional) a quaternion that will be filled by the result if provided

Returns:

Quaternion: result of q x scale

**conjugateQuat(q: Quaternion, out?: Quaternion): Quaternion**

Computes the conjugate of a quaternion (a + bi + cj + dk => a - bi - cj - dk)

Parameters:

* q: quaternion to calculate
* out: (optional) a quaternion that will be filled by the result if provided

Returns:

Quaternion: result of conjugation

**inverseQuat(q: Quaternion, out?: Quaternion): Quaternion**

Computes the inverse, or reciprocal, of a quaternion

Parameters:

* q: quaternion to calculate
* out: (optional) a quaternion that will be filled by the result if provided

Returns:

Quaternion: result of inverse

**lengthQuat(q: Quaternion): number**

Computes the length of a quaternion: that is, the square root of the product of the quaternion with its conjugate. Also known as the "norm"

**normalizeQuat(q: Quaternion, out?: Quaternion): Quaternion**

Normalizes a quaternion so its length is equal to 1. The result of normalizing a zero quaternion is undefined.

Parameters:

* q: quaternion to calculate
* out: (optional) a quaternion that will be filled by the result if provided

Returns:

Quaternion: result of normalization

**realQuat(q: Quaternion): number**

Provides the real part of the quaternion

**imaginaryQuat(q: Quaternion): Vec3**

Provides the vector part of the quaternion

**dotQuat(q1: Quaternion, q2: Quaternion): number**

Returns dot product of two quaternions

**fromEulerAxisAngleToQuat(axis: Vec3, angle: number, out?: Quaternion): Quaternion**

Constructs a rotation quaternion from an axis (a normalized Vec3) and an angle (in radians)

Parameters:

* axis: a normalized Vec3 which represents an axis
* angle: a radian angle to perform a rotation around axis
* out: (optional) a quaternion that will be filled by the result if provided

Returns:

Quaternion: a quaternion which represents a rotation around an axis

**fromOrderedEulerToQuat(angles: Vec3, order: EulerOrder, out?: Quaternion): Quaternion**

This converts a general euler angle of any rotation order into a quaternion

Parameters:

* angles: euler angles (in radians) followed the eulerOrder specified
* order: an EulerOrder to perform rotation on an order of axis by angles

  EulerOrder has 12 options: zyx, zyz, zxy, zxz, yxz, yxy, yzx, yzy, xyz, xyx, xzy, xzx

* out: (optional) a quaternion that will be filled by the result if provided

Returns:

Quaternion: represents the rotation

**toEulerXYZfromOrderedEuler(euler: Vec3, order: EulerOrder, out?: EulerRotation): EulerRotation**

This converts a euler angle of any ordering and turns it into an euler of XYZ orientation which is the expected rotation of most elements in this framework

Parameters:

* euler: angles to perform rotation
* order: order to perform rotation by specifed euler anlges
* out: (optional) an EulerOrder that will be filled by the result if provided

Returns:

EulerRotation: a Vec3 which represents the rotation angles by order XYZ

**toEulerFromQuat(q: Quaternion, out?: EulerRotation)**

Parameters:

* q: quaternion to calculate
* out: (optional) a quaternion that will be filled by the result if provided

Produces a XYZ Euler angle from the provided Quaternion

Returns:

EulerRotation: a Vec3 which represents the rotation angles by order XYZ

**toOrderedEulerFromQuat(q: Quaternion, order: EulerOrder, out?: Vec3): Vec3**

Converts a quaternion to an ordered Euler angle.

NOTE: It is best to convert to XYZ ordering if using with this framework's 3D system, or simply use toEulerFromQuat if this is desired. Only use this if you specifically need an Euler angle for a known purpose.

Parameters:

* q: quaternion to convert
* order: specifies the order to convert
* out: (optional) a vector3 which represents Euler angles based on order. The vector will be filled by the result if provided

Returns:

EulerRotation: a Vec3 which represents the rotation angles by order XYZ

**angleQuat(quat: Quaternion): number**

Extracts the angle part, in radians, of a rotation quaternion

**axisQuat(quat: Quaternion): Vec3**

Extracts the axis part, as a Vec3, of a rotation quaternion

**matrix4x4FromUnitQuatModel(q: Quaternion, m?: Mat4x4): Mat4x4**

Produces a transform matrix from a returned unit quaternion. This is a matrix that is from a 'models' perspective where the model orients itself to match the orientation.

Parameters:

* q: quaternion to convert
* m: (optional) a matrix4x4 that will be filled by the result if provided

Returns:

Mat4x4: matrix which is converted from quaternion

**matrix4x4FromUnitQuatView(q: Quaternion, m?: Mat4x4): Mat4x4**

Produces a transform matrix from a returned unit quaternion. This is a matrix that is from a 'views' perspective where the world orients to match the view.

Parameters:

* q: quaternion to convert
* m: (optional) a matrix4x4 that will be filled by the result if provided

Returns:

Mat4x4: matrix which is converted from quaternion

**eulerToQuat(angles: EulerRotation,out?: Quaternion): Quaternion**

Converts Euler angles to quaternion

Parameters:

* angles: Euler angles [roll(X), pitch(Y), yaw(Z)]
* out: (optional) a quaternion that will be filled by the result if provided

Returns:

Quaternion: converted from euler angles

**lookAtQuat(forward: Vec3Compat, up: Vec3Compat, q?: Quaternion): Quaternion**

This produces a quaternion that creates an orientation that will look in the direction specified.

Parameters:

* forward: direction to look at
* up: up dirction for the "look at" action
* q: (optional) a quaternion that will be filled by the result if provided

Returns:

Quaternion: represents the "look at" action

**matrix3x3ToQuaternion(mat: Mat3x3, q?: Quaternion): Quaternion**

Converts a quaternion which represents a matrix 3x3

Parameters:

* mat: matrix to convert
* q: (optional) a quaternion that will be filled by the result if provided

Returns:

Quaternion: a quaternion which represents the matrix

**matrix4x4ToQuaternion(mat: Mat4x4, q?: Quaternion): Quaternion**

Converts a quaternion which represents a matrix 4x4

Parameters:

* mat: matrix to convert
* q: (optional) a quaternion that will be filled by the result if provided

Returns:

Quaternion: a quaternion which represents the matrix

**lookAtMatrix(forward: Vec3Compat, up: Vec3Compat, m?: Mat4x4): Mat4x4**

Parameters:

* forward: direction to look at
* up: up dirction for the "look at" action
* m: (optional) a matrix4x4 that will be filled by the result if provided

Returns:

Mat4x4: a 4x4 matrix which represents the "look at" action

**slerpUnitQuat(from: Quaternion, to: Quaternion, t: number, out?: Quaternion): Quaternion**

SLERP interpolation between two quaternion orientations. The Quaternions MUST be unit quats for this to be valid.

If the quat has gotten out of normalization from precision errors, consider renormalizing the quaternion.

Parameters:

* from: the Quaternion to begin from for the slerp operation
* to: the Quaternion to reach for the slerp operation
* t: interpolation value for slerp, normally from 0 to 1
* out: (optional) a quaternion that will be filled by the result if provided

Returns:

Quaternion: the slerp interpolation result

**oneQuat(): Quaternion**

Returns one basis quaternion [1, 0, 0, 0]

**iQuat(): Quaternion**

Returns i basis quaternion [0, 1, 0, 0]

**jQuat(): Quaternion**

Returns j basis quaternion [0, 0, 1, 0]

**kQuat(): Quaternion**

Returns k basis quaternion [0, 0, 0, 1]
