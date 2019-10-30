# Vector

## Types

**Vec1 = [number]**

**Vec2 = [number, number]**

**Vec3 = [number, number, number]**

**Vec = Vec1 | Vec2 | Vec3 | Vec4**

**Vec4 = [number, number, number, number]**

**Vec1Compat = Vec1 | Vec2 | Vec3 | Vec4**

**Vec2Compat = Vec2 | Vec3 | Vec4**

**Vec3Compat = Vec3 | Vec4**

**Vec4Compat = Vec4**

## Vector1 Methods

**apply1(v: Vec1Compat | undefined, v0: number): Vec1**

Applies value v0 to v[0] and return v as a Vec1

**add1(left: Vec1Compat, right: Vec1Compat, out?: Vec1Compat): Vec1**

Adds a Vec1 with a value left[0] + right[0]

**ceil1(vec: Vec1Compat, out?: Vec1Compat): Vec1**

Returns a Vec1 with the ceil value of vec[0]

**compare1(left: Vec1Compat, right: Vec1Compat): boolean**

Returns true when left is exactly same as right at position 0

**fuzzyCompare1(left: Vec1Compat, right: Vec1Compat, epsilon: number): boolean**

Compares left and right at position 0 in a fuzzy way.

Returns true when difference at position 0 is smaller or equal to epsilon.

**copy1(vec: Vec1Compat, out?: Vec1Compat): Vec1**

Returns a Vec1 with a vec[0]

Parameter out is optional which will be filled by result if provided

**cross1(\_left: Vec1Compat,\_right: Vec1Compat,out?: Vec1Compat): Vec1**

Cross product of 1 dimensional vectors could be easiest to visualize as two parallel or anti-parallel vectors that are in the 2D plane. This would result in a vector that is of zero magnitude going into the Z direction. Or essentially [0, 0, 0]. Thus for consistency of <vec method><vec component length>()

We will take the one dimension inference of this result and provide [0]

**divide1(top: Vec1Compat, bottom: Vec1Compat, out?: Vec1Compat): Vec1**

Parameter out is optional which will be filled by result if provided

Returns Vec1 with top[0] / bottom[0]

**empty1(out?: Vec1)**

Parameter out is optional which will be filled by result if provided

Returns a Vec1 with all elements set to 0

**flatten1(list: Vec1Compat[], out?: number[]): number[]**

Parameter out is optional which will be filled by result if provided

Returns a number array with elements at position 0 from members of list

**floor1(vec: Vec1Compat, out?: Vec1Compat): Vec1**

Parameter out is optional which will be filled by result if provided

Returns a Vec1 with floor value of vec[0]

**inverse1(vec: Vec1Compat, out?: Vec1Compat): Vec1**

Parameter out is optional which will be filled by result if provided

Returns a Vec1 with 1 / vec[0]

**scale1(vec: Vec1Compat, scale: number, out?: Vec1Compat): Vec1**

Parameter out is optional which will be filled by result if provided

Returns a Vec1 with vec[0] x scale

**subtract1(left: Vec1Compat, right: Vec1Compat, out?: Vec1Compat): Vec1**

Parameter out is optional which will be filled by result if provided

Returns a Vec1 with left[0] - right[0]

**max1(left: Vec1Compat, right: Vec1Compat, out?: Vec1Compat): Vec1**

Parameter out is optional which will be filled by result if provided

Returns a Vec1 with max(left[0], right[0])

**min1(left: Vec1Compat, right: Vec1Compat, out?: Vec1Compat): Vec1**

Returns a Vec1 with min(left[0], right[0])

Parameter out is optional which will be filled by result if provided

**multiply1(left: Vec1Compat, right: Vec1Compat, out?: Vec1Compat): Vec1**

Returns a Vec1 with left[0] x right[0]

Parameter out is optional which will be filled by result if provided

**normalize1(\_left: Vec1Compat, out?: Vec1Compat): Vec1**

Returns a Vec1 with normalized value. For Vec1, just returns [1]

Parameter out is optional which will be filled by result if provided

**dot1(left: Vec1Compat, right: Vec1Compat): number**

Returns a number with value left[0] x right[0]

**linear1(start: Vec1Compat, end: Vec1Compat, t: number, out?: Vec1Compat): Vec1**

Returns a Vec1 with interpolation value at time t from start to end

Parameter out is optional which will be filled by result if provided

**length1(start: Vec1Compat): number**

Returns length of a Vec1. For Vec1, abs(start[0]) will be returned.

**vec1(values: number[] | number, ...args: (number | number[])[]): Vec1**

Return a Vec1 from values or args when values contains nothing

## Vector2 Methods

**apply2(v: Vec2Compat | undefined, v0: number, v1: number): Vec2**

Returns a Vec2 [v0, v1]

**add2(left: Vec2Compat, right: Vec2Compat, out?: Vec2Compat): Vec2**

Parameter out is optional which will be filled by result if provided

Returns a Vec2 with value left[i] + right[i] at position i

**ceil2(vec: Vec2Compat, out?: Vec2Compat): Vec2**

Parameter out is optional which will be filled by result if provided

Returns a Vec2 with value ceil(vec[i]) at position i

**copy2(vec: Vec2Compat, out?: Vec2Compat): Vec2**

Parameter out is optional which will be filled by result if provided

Returns a Vec2 with value vec[i] at position i

**cross2(\_left: Vec2Compat, \_right: Vec2Compat, out?: Vec2Compat): Vec2**

Cross product of a 2D vector would result in [0, 0, <magnitude>] within the 2D plane. In keeping with the format of vector methods in this document <method name><vector component length>() we return only the 2D result of the product [0, 0].

In order to get the results of the actual 2D vectors in a 3D world, you must use cross3() to retrieve the Z result.

Parameter out is optional which will be filled by result if provided

**compare2(left: Vec2Compat, right: Vec2Compat): boolean**

Returns true when left and right are exactly the same at position 0 and 1

**fuzzyCompare2(left: Vec2Compat, right: Vec2Compat, epsilon: number): boolean**

Compares left and right at position 0, 1 in a fuzzy way.

Returns true when difference at position 0, 1 is smaller or equal to epsilon.

**divide2(top: Vec2Compat, bottom: Vec2Compat, out?: Vec2Compat): Vec2**

Parameter out is optional which will be filled by result if provided

Returns a Vec2 with value top[i] / bottom[i] at position i

**empty2(out?: Vec2)**

Parameter out is optional which will be filled by result if provided

Returns a Vec2 with every element 0

**flatten2(list: Vec2Compat[], out?: number[]): number[]**

Parameter out is optional which will be filled by result if provided

Returns an array filled with value at 0, 1 from every memeber of list

**floor2(vec: Vec2Compat, out?: Vec2Compat): Vec2**

Parameter out is optional which will be filled by result if provided

Returns a Vec2 with value floor(vec[i]) at position i

**inverse2(vec: Vec2Compat, out?: Vec2Compat): Vec2**

Parameter out is optional which will be filled by result if provided

Returns a Vec2 with value 1 / vec[i] at position i

**max2(left: Vec2Compat, right: Vec2Compat, out?: Vec2Compat): Vec2**

Parameter out is optional which will be filled by result if provided

Returns a Vec2 with value max(left[i], right[i]) at position i

**min2(left: Vec2Compat, right: Vec2Compat, out?: Vec2Compat): Vec2**

Parameter out is optional which will be filled by result if provided

Returns a Vec2 with value min(left[i], right[i]) at position i

**scale2(left: Vec2Compat, scale: number, out?: Vec2Compat): Vec2**

Parameter out is optional which will be filled by result if provided

Returns a Vec2 with value left[i] x scale at position i

**subtract2(left: Vec2Compat, right: Vec2Compat, out?: Vec2Compat): Vec2**

Parameter out is optional which will be filled by result if provided

Returns a Vec2 with value left[i] - right[i] at position i

**multiply2(left: Vec2Compat, right: Vec2Compat, out?: Vec2Compat): Vec2**

Parameter out is optional which will be filled by result if provided

Returns a Vec2 with value left[i] x right[i] at position i

**normalize2(left: Vec2Compat, out?: Vec2Compat): Vec2**

Parameter out is optional which will be filled by result if provided

Returns a Vec2 with normalization value from [left[0], left[1]]

**dot2(left: Vec2Compat, right: Vec2Compat): number**

Returns a summation of all left[i] x right[i]

**linear2(start: Vec2Compat, end: Vec2Compat, t: number, out?: Vec2Compat): Vec2**

Parameter out is optional which will be filled by result if provided

Returns a Vec2 with interpolation value at time t from start to end

**length2(start: Vec2Compat): number**

Returns the length of a Vec2 with value from start[0], start[1]

**vec2(values: number[] | number, ...args: (number | number[])[]): Vec2**

Return a Vec2 from values or args when values contains nothing

## Vector3 Methods

**apply3(v: Vec3Compat | undefined, v0: number, v1: number, v2: number): Vec3**

Returns a Vec3 [v0, v1, v2]

**add3(left: Vec3Compat, right: Vec3Compat, out?: Vec3Compat): Vec3**

Parameter out is optional which will be filled by result if provided

Returns a Vec3 with value left[i] + right[i] at position i

**ceil3(vec: Vec3Compat, out?: Vec3Compat): Vec3**

Parameter out is optional which will be filled by result if provided

Returns a Vec3 with value ceil(vec[i]) at position i

**copy3(vec: Vec3Compat, out?: Vec3Compat): Vec3**

Parameter out is optional which will be filled by result if provided

Returns a Vec3 with value vec[i] at position i

**compare3(left: Vec3Compat, right: Vec3Compat): boolean**

Returns true when left and right are exactly the same at position 0, 1, 2

**fuzzyCompare3(left: Vec3Compat, right: Vec3Compat, epsilon: number): boolean**

Compares left and right at position 0, 1, 2 in a fuzzy way.

Returns true when difference at position 0, 1, 2 is smaller or equal to epsilon.

**cross3(left: Vec3Compat, right: Vec3Compat, out?: Vec3Compat): Vec3**

Parameter out is optional which will be filled by result if provided

Returns the result of the cross multiply of left and right

**divide3(top: Vec3Compat, bottom: Vec3Compat, out?: Vec3Compat): Vec3**

Parameter out is optional which will be filled by result if provided

Returns a Vec3 with value top[i] / bottom[i] at position i

**empty3(out?: Vec3)**

Parameter out is optional which will be filled by result if provided

Returns a Vec3 with every element 0

**flatten3(list: Vec3Compat[], out?: number[]): number[]**

Parameter out is optional which will be filled by result if provided

Returns an array filled with value at 0, 1, 2 from every memeber of list

**floor3(vec: Vec3Compat, out?: Vec3Compat): Vec3**

Parameter out is optional which will be filled by result if provided

Returns a Vec3 with value floor(vec[i]) at position i

**inverse3(vec: Vec3Compat, out?: Vec3Compat): Vec3**

Parameter out is optional which will be filled by result if provided

Returns a Vec3 with value 1 / vec[i] at position i

**scale3(left: Vec3Compat, scale: number, out?: Vec3Compat): Vec3**

Parameter out is optional which will be filled by result if provided

Returns a Vec3 with value left[i] x scale at position i

**subtract3(left: Vec3Compat, right: Vec3Compat, out?: Vec3Compat): Vec3**

Parameter out is optional which will be filled by result if provided

Returns a Vec3 with value left[i] - right[i] at position i

**multiply3(left: Vec3Compat, right: Vec3Compat, out?: Vec3Compat): Vec3**

Parameter out is optional which will be filled by result if provided

Returns a Vec3 with value left[i] x right[i] at position i

**linear3(start: Vec3Compat, end: Vec3Compat, t: number, out?: Vec3Compat): Vec3**

Parameter out is optional which will be filled by result if provided

Returns a Vec3 with interpolation value at time t from start to end

**length3(start: Vec3Compat): number**

Returns the length of a Vec3 [start[0], start[1], start[2]]

**max3(left: Vec3Compat, right: Vec3Compat, out?: Vec3Compat): Vec3**

Parameter out is optional which will be filled by result if provided

Returns a Vec3 with value max(left[i], right[i]) at position i

**min3(left: Vec3Compat, right: Vec3Compat, out?: Vec3Compat): Vec3**

Parameter out is optional which will be filled by result if provided

Returns a Vec3 with value min(left[i], right[i]) at position i

**normalize3(left: Vec3Compat, out?: Vec3Compat): Vec3**

Parameter out is optional which will be filled by result if provided

Returns a Vec3 with normalization value from [left[0], left[1], left[2]]

**dot3(left: Vec3Compat, right: Vec3Compat): number**

Returns a summation of all left[i] x right[i]

**vec3(values: number[] | number, ...args: (number | number[])[]): Vec3**

Return a Vec3 from values or args when values contains nothing

**up3(forward: Vec3Compat, up: Vec3Compat, out?: Vec3Compat)**

Parameter out is optional which will be filled by result if provided

Produces a directional vector that is straight up from the provided reference vectors (90 degress elevated from the forward vector)

**right3(forward: Vec3Compat, up: Vec3Compat, out?: Vec3Compat)**

Parameter out is optional which will be filled by result if provided

Produces a directional vector that is directly to the right of the reference vectors (90 degress rotated from the forrward vector)

**left3(forward: Vec3Compat, up: Vec3Compat, out?: Vec3Compat)**

Parameter out is optional which will be filled by result if provided

Produces a directional vector that is directly to the left of the reference vectors (90 degress rotated from the forrward vector)

**down3(forward: Vec3Compat, up: Vec3Compat, out?: Vec3Compat)**

Parameter out is optional which will be filled by result if provided

Produces a directional vector that is straight down from the provided reference vectors (90 degress declined from the forward vector)

## Vector4 Methods

**apply4(v: Vec4Compat | undefined, v0: number, v1: number, v2: number, v3: number): Vec4**

Returns a Vec4 [v0, v1, v2, v3]

**add4(left: Vec4, right: Vec4, out?: Vec4Compat): Vec4**

Parameter out is optional which will be filled by result if provided

Returns a Vec4 with value left[i] + right[i] at position i

**add4by3(left: Vec4, right: Vec3Compat, out?: Vec4Compat): Vec4**

Parameter out is optional which will be filled by result if provided

Returns a Vec4 with value left[i] + right[i] at position 0, 1, 2, left[3] at position 3

**ceil4(vec: Vec4Compat, out?: Vec4Compat): Vec4**

Parameter out is optional which will be filled by result if provided

Returns a Vec3 with value ceil(vec[i]) at position i

**copy4(vec: Vec4, out?: Vec4Compat): Vec4**

Parameter out is optional which will be filled by result if provided

Returns a Vec4 with value vec[i] at position i

**compare4(left: Vec4Compat, right: Vec4Compat): boolean**

Returns true when left and right are exactly the same at position 0, 1, 2, 3

**fuzzyCompare4(left: Vec4Compat, right: Vec4Compat, epsilon: number): boolean**

Compares left and right at position 0, 1, 2, 3 in a fuzzy way.

Returns true when difference at position 0, 1, 2, 3 is smaller or equal to epsilon.

**cross4(\_left: Vec4, \_right: Vec4, out?: Vec4Compat): Vec4**

Parameter out is optional which will be filled by result if provided

This will just return a Vec4 [0, 0, 0, 1]. If you need a proper cross product, please use cross3.

**divide4(top: Vec4Compat, bottom: Vec4Compat, out?: Vec4Compat): Vec4**

Parameter out is optional which will be filled by result if provided

Returns a Vec3 with value top[i] / bottom[i] at position i

**empty4(out?: Vec4)**

Parameter out is optional which will be filled by result if provided

Returns a Vec3 with every element 0

**flatten4(list: Vec4Compat[], out?: number[]): number[]**

Parameter out is optional which will be filled by result if provided

Returns an array filled with value at 0, 1, 2, 3 from every memeber of list

**floor4(vec: Vec4Compat, out?: Vec4Compat): Vec4**

Parameter out is optional which will be filled by result if provided

Returns a Vec4 with value floor(vec[i]) at position i

**inverse4(vec: Vec4, out?: Vec4Compat): Vec4**

Parameter out is optional which will be filled by result if provided

Returns a Vec4 with value 1 / vec[i] at position i

**scale4(left: Vec4, scale: number, out?: Vec4Compat): Vec4**

Parameter out is optional which will be filled by result if provided

Returns a Vec4 with value left[i] x scale at position i

**subtract4(left: Vec4, right: Vec4, out?: Vec4Compat): Vec4**

Parameter out is optional which will be filled by result if provided

Returns a Vec4 with value left[i] - right[i] at position i

**multiply4(left: Vec4, right: Vec4, out?: Vec4Compat): Vec4**

Parameter out is optional which will be filled by result if provided

Returns a Vec4 with value left[i] x right[i] at position i

**dot4(left: Vec4, right: Vec4): number**

Returns a summation of all left[i] x right[i]

**linear4(start: Vec4, end: Vec4, t: number, out?: Vec4Compat): Vec4**

Parameter out is optional which will be filled by result if provided

Returns a Vec3 with interpolation value at time t from start to end

**length4(start: Vec4): number**

Returns the length of start

**max4(left: Vec4Compat, right: Vec4Compat, out?: Vec4Compat): Vec4**

Parameter out is optional which will be filled by result if provided

Returns a Vec4 with value max(left[i], right[i]) at position i

**min4(left: Vec4Compat, right: Vec4Compat, out?: Vec4Compat): Vec4**

Parameter out is optional which will be filled by result if provided

Returns a Vec4 with value min(left[i], right[i]) at position i

**normalize4(left: Vec4Compat, out?: Vec4Compat): Vec4**

Parameter out is optional which will be filled by result if provided

Returns a Vec4 with normalization value from [left[0], left[1], left[2], left[4]]

**vec4(values: number[] | number, ...args: (number | number[])[]): Vec4**

Return a Vec4 from values or args when values contains nothing

**color4FromHex3(hex: number, out?: Vec4)**

Converts a hex3 color to color4

Parameter out is optional which will be filled by result if provided

**color4FromHex4(hex: number, out?: Vec4)**

Converts a hex4 number to color4

Parameter out is optional which will be filled by result if provided

**slerpQuat(from: Vec4, to: Vec4, t: number, out?: Vec4): Vec4**

Parameter out is optional which will be filled by result if provided

Returns a slerp interpolation from two Vec4 at time t
