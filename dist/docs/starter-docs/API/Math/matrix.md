# Matrix

## 2x2 Matrix Methods

## 3x3 Matrix Methods

## 3x3 Matrix Methods

**apply2x2(
<br>&emsp;m: Mat2x2 | undefined,
<br>&emsp;m00: number,
<br>&emsp;m01: number,
<br>&emsp;m10: number,
<br>&emsp;m11: number
<br>)**

This method applies values to an existing matrix2x2.

Parameters:

* m: matrix2x2 to fill and return
* m00: sets value at (0, 0) of m
* m01: sets value at (0, 1) of m
* m10: sets value at (1, 0) of m
* m11: sets value at (1, 1) of m

Returns:

Mat2x2: m filled with new values will be returned

**apply3x3(
<br>&emsp;m: Mat3x3 | undefined,
<br>&emsp;m00: number,
<br>&emsp;m01: number,
<br>&emsp;m02: number,
<br>&emsp;m10: number,
<br>&emsp;m11: number,
<br>&emsp;m12: number,
<br>&emsp;m20: number,
<br>&emsp;m21: number,
<br>&emsp;m22: number
<br>)**

This method applies values to an existing matrix3x3.

Parameters:

* m: matrix3x3 to fill and return
* m00: sets value at (0, 0) of m
* m01: sets value at (0, 1) of m
* m02: sets value at (0, 2) of m
* m10: sets value at (1, 0) of m
* m11: sets value at (1, 1) of m
* m12: sets value at (1, 2) of m
* m20: sets value at (2, 0) of m
* m21: sets value at (2, 1) of m
* m22: sets value at (2, 2) of m

Returns:

Mat3x3: m filled with new values will be returned

** apply4x4(
<br>&emsp;m: Mat4x4 | undefined,
<br>&emsp;m00: number,
<br>&emsp;m01: number,
<br>&emsp;m02: number,
<br>&emsp;m03: number,
<br>&emsp;m10: number,
<br>&emsp;m11: number,
<br>&emsp;m12: number,
<br>&emsp;m13: number,
<br>&emsp;m20: number,
<br>&emsp;m21: number,
<br>&emsp;m22: number,
<br>&emsp;m23: number,
<br>&emsp;m30: number,
<br>&emsp;m31: number,
<br>&emsp;m32: number,
<br>&emsp;m33: number
<br>)**

This method applies values to an existing matrix4x4.

Parameters:

* m: matrix4x4 to fill and return
* m00: sets value at (0, 0) of m
* m01: sets value at (0, 1) of m
* m02: sets value at (0, 2) of m
* m03: sets value at (0, 3) of m
* m10: sets value at (1, 0) of m
* m11: sets value at (1, 1) of m
* m12: sets value at (1, 2) of m
* m13: sets value at (1, 3) of m
* m20: sets value at (2, 0) of m
* m21: sets value at (2, 1) of m
* m22: sets value at (2, 2) of m
* m23: sets value at (2, 3) of m
* m30: sets value at (3, 0) of m
* m31: sets value at (3, 1) of m
* m32: sets value at (3, 2) of m
* m33: sets value at (3, 3) of m

Returns:

Mat4x4: m filled with new values will be returned

**determinant2x2(mat: Mat2x2): number**

Parameters:

* mat: a 2x2 matrix

Returns:

number: determinant value of the matrix

**determinant3x3(mat: Mat3x3): number**

Parameters:

* mat: a 3x3 matrix

Returns:

number: determinant value of the matrix

**determinant4x4(mat: Mat4x4): number**

Parameters:

* mat: a 4x4 matrix

Returns:

number: determinant value of the matrix

**affineInverse2x2(mat: Mat2x2, out?: Mat2x2): Mat2x2 | null**

Calculates the inverse of ONLY purely affine transforms.

Parameters:

* mat: the 2x2 matrix which represents the transforms
* out: (optional) a matrix will be filled with the result if provided

Returns:

Mat2x2 | null: affine inverse matrix or null if determinant of mat is 0

**affineInverse3x3(mat: Mat3x3, out?: Mat3x3): Mat3x3 | null**

Calculates the inverse of ONLY purely affine transforms.

Parameters:

* mat: the 3x3 matrix which represents the transforms
* out: (optional) a matrix will be filled with the result if provided

Returns:

Mat3x3 | null: affine inverse matrix or null if determinant of mat is 0

**affineInverse4x4(mat: Mat4x4, out?: Mat4x4): Mat4x4 | null**

Calculates the inverse of ONLY purely affine transforms.

Parameters:

* mat: the 4x4 matrix which represents the transforms
* out: (optional) a matrix will be filled with the result if provided

Returns:

Mat4x4 | null: affine inverse matrix or null if determinant of mat is 0

**multiplyScalar2x2(mat: Mat2x2, scale: number, out?: Mat2x2): Mat2x2**

Calculates the scalar value of a 2x2 matrix by multiplying a value with all elements of the matrix.

Parameters:

* mat: a 2x2 matrix
* scale: the scale value
* out: (optional) a matrix that will be filled with the result if provided

Returns:

Mat2x2: scalar result of mat

**multiplyScalar3x3(mat: Mat3x3, scale: number, out?: Mat3x3): Mat3x3**

Calculates the scalar value of a 3x3 matrix by multiplying a value with all elements of the matrix.

Parameters:

* mat: a 3x3 matrix
* scale: the scale value
* out: (optional) a matrix that will be filled with the result if provided

Returns:

Mat3x3: scalar result of mat

**multiplyScalar4x4(mat: Mat4x4, scale: number, out?: Mat4x4): Mat4x4**

Calculates the scalar value of a 4x4 matrix by multiplying a value with all elements of the matrix.

Parameters:

* mat: a 4x4 matrix
* scale: the scale value
* out: (optional) a matrix that will be filled with the result if provided

Returns:

Mat4x4: scalar result of mat

**identity2(out?: Mat2x2): Mat2x2**

Convert or produce a 2x2 identity matrix

Parameters:

* out: (optional) a matrix that will be filled with the result if provided

Returns:

Mat2x2: a 2x2 identity matrix

**identity3(out?: Mat3x3): Mat3x3**

Convert or produce a 3x3 identity matrix

Parameters:

* out: (optional) a matrix that will be filled with the result if provided

Returns:

Mat3x3: a 3x3 identity matrix

**identity4(out?: Mat4x4): Mat4x4**

Convert or produce a 4x4 identity matrix

Parameters:

* out: (optional) a matrix that will be filled with the result if provided

Returns:

Mat4x4: a 4x4 identity matrix

**multiply2x2(left: Mat2x2, right: Mat2x2, out?: Mat2x2): Mat2x2**

Concatenate two 2x2 matrices. result = left x right

Parameters:

* left: the matrix at the left position
* right: the matrix at the right position
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat2x2: result of left x right

**multiply3x3(left: Mat3x3, right: Mat3x3, out?: Mat3x3): Mat3x3**

Concatenate two 3x3 matrices. result = left x right

Parameters:

* left: the matrix at the left position
* right: the matrix at the right position
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat3x3: result of left x right

**multiply4x4(left: Mat4x4, right: Mat4x4, out?: Mat4x4): Mat4x4**

Concatenate two 4x4 matrices. result = left x right

Parameters:

* left: the matrix at the left position
* right: the matrix at the right position
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat4x4: result of left x right

**add2x2(left: Mat2x2, right: Mat2x2, out?: Mat2x2): Mat2x2**

Add each element by each element in two 2x2 matrices

Parameters:

* left: the matrix at the left position
* right: the matrix at the right position
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat2x2: result of left + right

**add3x3(left: Mat3x3, right: Mat3x3, out?: Mat3x3)**

Add each element by each element in two 3x3 matrices

Parameters:

* left: the matrix at the left position
* right: the matrix at the right position
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat3x3: result of left + right

**add4x4(left: Mat4x4, right: Mat4x4, out?: Mat4x4): Mat4x4**

Add each element by each element in two 4x4 matrices

Parameters:

* left: the matrix at the left position
* right: the matrix at the right position
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat4x4: result of left + right

**subtract2x2(left: Mat2x2, right: Mat2x2, out?: Mat2x2): Mat2x2**

Subtract each element by each element in two 2x2 matrices

Parameters:

* left: the matrix at the left position
* right: the matrix at the right position
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat2x2: result of left - right

**subtract3x3(left: Mat3x3, right: Mat3x3, out?: Mat3x3): Mat3x3**

Subtract each element by each element in two 3x3 matrices

Parameters:

* left: the matrix at the left position
* right: the matrix at the right position
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat3x3: result of left - right

**subtract4x4(left: Mat4x4, right: Mat4x4, out?: Mat4x4): Mat4x4**

Subtract each element by each element in two 4x4 matrices

Parameters:

* left: the matrix at the left position
* right: the matrix at the right position
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat4x4: result of left - right

**Hadamard2x2(left: Mat2x2, right: Mat2x2, out?: Mat2x2): Mat2x2**

Hadamard product of two 2x2 matrices. This is essentially multiplying each element by each element between the two.

Parameters:

* left: the matrix at the left position
* right: the matrix at the right position
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat2x2: result of Hadamard product

**Hadamard3x3(left: Mat3x3, right: Mat3x3, out?: Mat3x3): Mat3x3**

Hadamard product of two 3x3 matrices. This is essentially multiplying each element by each element between the two.

Parameters:

* left: the matrix at the left position
* right: the matrix at the right position
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat3x3: result of Hadamard product

**Hadamard4x4(left: Mat4x4, right: Mat4x4, out?: Mat4x4): Mat4x4**

Hadamard product of two 4x4 matrices. This is essentially multiplying each element by each element between the two.

Parameters:

* left: the matrix at the left position
* right: the matrix at the right position
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat4x4: result of Hadamard product

**transpose2x2(mat: Mat2x2, out?: Mat2x2): Mat2x2**

Transposes a 2x2 matrix:

[a, b]&emsp;->&emsp;[a, c]

[c, d]&emsp;&emsp;&emsp;[b, d]

Parameters:

* mat: matrix to transpose
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat2x2: transpose matrix of mat

**transpose3x3(mat: Mat3x3, out?: Mat3x3): Mat3x3**

Transposes a 3x3 matrix:

[a, b, c]&emsp;->&emsp;[a, d, g]

[d, e, f]&emsp;&emsp; &emsp;[b, e, h]

[g, h, i]&emsp;&emsp; &emsp;[c, f, i]

Parameters:

* mat: matrix to transpose
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat3x3: transpose matrix of mat

**transpose4x4(mat: Mat4x4, out?: Mat4x4): Mat4x4**

Transposes a 4x4 matrix:

[a, b, c, d]&emsp;-> &emsp;[a, e, i, m]

[e, f, g, h]&emsp; &emsp; &emsp;[b, f, j, n]

[i, j, k, l] &emsp;&emsp;&emsp;&emsp;[c, g, k, o]

[m, n, o, p]&emsp;&emsp;&emsp;[d, h, l, p]

Parameters:

* mat: matrix to transpose
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat4x4: transpose matrix of mat

**shearX2x2(radians: number, out?: Mat2x2): Mat2x2**

This makes a shear 2d matrix that shears parallel to the x-axis. The radians should be input as a value between, non inclusive (-90 degrees, 90 degrees). A shear >= 90 degrees is nonsensical as it would shear to infinity and beyond.

Parameters:

* radians: shear angle, value should be between - PI / 2 to PI / 2
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat2x2: result of shear operation

**shearY2x2(radians: number, out?: Mat2x2): Mat2x2**

This makes a shear 2d matrix that shears parallel to the y-axis. The radians should be input as a value between, non inclusive (-90 degrees, 90 degrees). A shear >= 90 degrees is nonsensical as it would shear to infinity and beyond.

Parameters:

* radians: shear angle, value should be between - PI / 2 to PI / 2
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat2x2: result of shear operation

**shearX4x4(radians: number, out?: Mat4x4): Mat4x4**

This makes a shear 3d matrix that shears parallel to the x-axis. The radians should be input as a value between, non inclusive (-90 degrees, 90 degrees). A shear >= 90 degrees is nonsensical as it would shear to infinity and beyond.

Parameters:

* radians: shear angle, value should be between - PI / 2 to PI / 2
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat4x4: result of shear operation

**shearY4x4(radians: number, out?: Mat4x4): Mat4x4**

This makes a shear 3d matrix that shears parallel to the y-axis. The radians should be input as a value between, non inclusive (-90 degrees, 90 degrees). A shear >= 90 degrees is nonsensical as it would shear to infinity and beyond.

Parameters:

* radians: shear angle, value should be between - PI / 2 to PI / 2
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat4x4: result of shear operation

**shearZ4x4(radians: number, out?: Mat4x4): Mat4x4**

This makes a shear 3d matrix that shears parallel to the z-axis. The radians should be input as a value between, non inclusive (-90 degrees, 90 degrees). A shear >= 90 degrees is nonsensical as it would shear to infinity and beyond.

Parameters:

* radians: shear angle, value should be between - PI / 2 to PI / 2
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat4x4: result of shear operation

**transform2(m: Mat2x2, v: Vec2, out?: Vec2): Vec2**

Transforms a Vec2 by a matrix

Parameters:

* m: transform matrix
* v: vector to transform
* out: (optional) matrix that will be filled with result if provided

Returns:

Vec2: vector after transformation

**transform3(m: Mat3x3, v: Vec3, out?: Vec3): Vec3**

Transforms a Vec3 by a matrix

Parameters:

* m: transform matrix
* v: vector to transform
* out: (optional) matrix that will be filled with result if provided

Returns:

Vec3: vector after transformation

**transform3as4(m: Mat4x4, v: Vec3, out?: Vec4): Vec4**

Transforms a Vec3 by the provided matrix but treats the Vec3 as a [x, y, z, 1] Vec4

Parameters:

* m: transform matrix
* v: vector to transform
* out: (optional) matrix that will be filled with result if provided

Returns:

Vec4: vector after transformation

**transform4(m: Mat4x4, v: Vec4, out?: Vec4): Vec4**

Transforms a vector4 by the provided matrix

Parameters:

* m: transform matrix
* v: vector to transform
* out: (optional) matrix that will be filled with result if provided

Returns:

Vec4: vector after transformation

**toString2x2(mat: Mat2x2): string**

Converts a 2x2 matrix to a pretty print string

Parameters:

mat: matrix to print

Returns:

string: print string of mat

**toString3x3(mat: Mat3x3): string**

Converts a 3x3 matrix to a pretty print string

Parameters:

mat: matrix to print

Returns:

string: print string of mat

**toString4x4(mat: Mat4x4): string**

Converts a 4x4 matrix to a pretty print string

Parameters:

mat: matrix to print

Returns:

string: print string of mat

**rotation4x4(x: number, y: number, z: number, out?: Mat4x4)**

Only Euler X then Y then Z rotations are supported. Specify the rotation values for each axis to receive a matrix that will perform rotations by that amount in that order.

Parameters:

* x: Euler rotations radians around X axis
* y: Euler rotations radians around Y axis
* z: Euler rotations radians around Z axis
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat4x4: matrix which represents the rotation

**rotation4x4by3(v: Vec3, out?: Mat4x4)**

Only Euler X then Y then Z rotations are supported. Specify the rotation values for each axis to
receive a matrix that will perform rotations by that amount in that order.

Parameters:

* v: a vector3 which contains Euler rotations radian as the XYZ order
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat4x4: matrix which represents the rotation

**function scale4x4(x: number, y: number, z: number, out?: Mat4x4): Mat4x4**

Creates a 4x4 scaling matrix

Parameters:

* x: scale on x axis
* y: scale on y axis
* z: scale on z axis
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat4x4: scaling matrix

**scale4x4by3(p: Vec3Compat, out?: Mat4x4)**

Creates a scaling matrix from a vector

Parameters:

* p: a vector which contains scale as [scaleX, scaleY, scaleZ] order
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat4x4: scaling matrix

**translation4x4(x: number, y: number, z: number, out?: Mat4x4): Mat4x4**

Creates a translation Matrix

Parameters:

* x: translation in x direction
* y: translation in y direction
* z: translation in z direction
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat4x4: translation matrix

**translation4x4by3(t: Vec3Compat, out?: Mat4x4): Mat4x4**

Creates a translation Matrix from a vector

Parameters:

* p: a vector which contains translation as [x, y, z] order
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat4x4: translation matrix

**perspectiveFrustum4x4(n: number, f: number, l: number, r: number, t: number, b: number, out?: Mat4x4)**

Produces a perspective matrix for a given frustum

Parameters:

* n: near side value of perspective
* f: far side value of perspective
* l: left side value of perspective
* r: right side value of perspective
* b: bottom side value of perspective
* t: top side value of perspective
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat4x4: perspective matrix

**perspective4x4(fovRadians: number, width: number, height: number, near: number, far: number, out?: Mat4x4): Mat4x4**

Generate a projection matrix with perspective

Parameters:

* fovRadians: Horizon field of view represented as radian angles
* width: width of view
* height: height of view
* near: near side value of view
* far: far side value of view
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat4x4: perspective matrix

**perspectiveFOVY4x4(fovRadians: number, width: number, height: number, near: number, far: number,out?: Mat4x4): Mat4x4**

Generates a projection matrix with perspective

Parameters:

* fovRadians: Vertical field of view represented as radian angles
* width: width of view
* height: height of view
* near: near side value of view
* far: far side value of view
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat4x4: perspective matrix

**orthographic4x4(left: number, right: number, bottom: number, top: number, near: number, far: number, out?: Mat4x4): Mat4x4**

Generate a projection matrix with no perspective. Useful for flat 2D or isometric rendering or other similar special case renderings.

Parameters:

* left: left side value of view
* right: right side value of view
* bottom: bottom side value of view
* top: top side value of view
* near: near side value of view
* far: far side value of view
* out: (optional) matrix that will be filled with result if provided

Returns:

Mat4x4: orthographic matrix

**projectToScreen(proj: Mat4x4, point: Vec4, width: number, height: number, out?: Vec4): Vec4**

Performs the operations to project a Vec4 to screen coordinates using a projection matrix. The x and y of the out Vec4 will be the final projection, w should be resolved to 1, and the z coordinate will be in homogeneous coordinates where -1 <= z <= 1 iff z lies within frustum near and far planes.

Parameters:

* proj: projection matrix
* point: a 3d point in view
* width: width of view
* height: height of view
* out: (optional) matrix that will be filled with result if provided

Returns:

* Vec4: screen coordinates, x and y will be the final projection

**project3As4ToScreen(proj: Mat4x4, point: Vec3Compat, width: number, height: number, out?: Vec4): Vec4**

Performs the operations to project a Vec3 to screen coordinates as a Vec4 with a w of value 1 using a projection matrix. The x and y of the out Vec4 will be the final projection, w should be resolved to 1, and the z coordinate will be in homogeneous coordinates where -1 <= z <= 1 iff z lies within frustum near and far planes.

Parameters:

* proj: projection matrix
* point: a 3d point in view
* width: width of view
* height: height of view
* out: (optional) matrix that will be filled with result if provided

Returns:

* Vec4: screen coordinates, x and y will be the final projection

**compare2x2(m1: Mat2x2, m2: Mat2x2): boolean**

Determines equality of two 2x2 matrices

Parameters:
m1: a 2x2 matrix
m2: a 2x2 matrix

Returns:
boolean: true means two matrices are equal

**compare3x3(m1: Mat3x3, m2: Mat3x3): boolean**

Determines equality of two 3x3 matrices

Parameters:
m1: a 3x3 matrix
m2: a 3x3 matrix

Returns:
boolean: true means two matrices are equal

**compare4x4(m1: Mat4x4, m2: Mat4x4): boolean**

Determines equality of two 4x4 matrices

Parameters:
m1: a 4x4 matrix
m2: a 4x4 matrix

Returns:
boolean: true means two matrices are equal
