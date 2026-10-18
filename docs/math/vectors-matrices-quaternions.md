---
title: Vectors, matrices and quaternions
summary: The functional tuple-based vector, matrix and quaternion libraries: naming scheme, out parameters, column-major layout, right-handed -Z-forward conventions.
covers:
  - ui/src/math/vector.ts
  - ui/src/math/matrix.ts
  - ui/src/math/quaternion.ts
related:
  - math/projection-and-geometry.md
  - 3d/scene-graph.md
status: complete
verified-at: b5262b21
---

## Purpose

DeltaV's math is a set of free functions over plain number tuples (no classes), so values can be
written straight into GPU buffers and reused without allocation. `vector.ts`, `matrix.ts` and
`quaternion.ts` supply everything the scene graph, cameras, projections and layers use. All three
are re-exported from `ui/src/math/index.ts`, which also exposes them as namespaces `VectorMath`,
`MatrixMath` and `QuaternionMath` for discovery.

## Key files

- `ui/src/math/vector.ts` — `Vec1`–`Vec4`, `*Compat`/`Readonly*` types, per-dimension function families, `V3R`/`V4R` registers, `VecMath`, `vec1Methods`…`vec4Methods`, `color4FromHex3/4`, `slerpQuat`.
- `ui/src/math/matrix.ts` — `Mat2x2`/`Mat3x3`/`Mat4x4`, index constants `M200`…`M433`, `M3R`/`M4R` registers, construction, multiplication, inverse, projection (`perspective4x4`, `orthographic4x4`, `projectToScreen`) and fast transform builders (`SRT4x4`, `TRS4x4`).
- `ui/src/math/quaternion.ts` — `Quaternion` (`[w, x, y, z]`), arithmetic, Euler/axis-angle/matrix conversion, `lookAtQuat`, `lookAtMatrix`, `decomposeRotation`, `rotateVectorByUnitQuat`, `slerpUnitQuat`.
- `ui/src/types.ts` — `EulerOrder` enum and `EulerRotation` (`Vec3`) used by the quaternion Euler functions.

## How it works

### Types

- Vectors are tuples: `Vec2 = [number, number]` etc. `Vec2Compat = Vec2 | Vec3 | Vec4` lets a longer
  vector be passed where a shorter one is read (only the leading components are used).
  `IVec1`…`IVec4` are explicit-length array interfaces used by `VecMath`.
- Matrices are flat tuples of 4, 9 or 16 numbers. `Mat3x3Compat`/`Mat2x2Compat` accept a larger
  buffer but read its *linear* leading elements, not its top-left sub-matrix.
- `Quaternion = Vec4` laid out **`[w, x, y, z]`** (scalar first). `QW = 0`, `QX = 1`, `QY = 2`,
  `QZ = 3` name the indices. `oneQuat()` is `[1, 0, 0, 0]` (identity rotation).

### Naming scheme

Function name = operation + dimension suffix: `add1/2/3/4`, `normalize3`, `multiply4x4`,
`transpose3x3`, `addQuat`. The same operation exists for every dimension where it makes sense.

| Family | Vectors (`1`–`4`) | Matrices (`2x2`, `3x3`, `4x4`) | Quaternions (`Quat`) |
|---|---|---|---|
| Write values | `applyN` | `apply2x2/3x3/4x4` | — |
| Construct | `vecN(values, ...args)` (pads with 0), `emptyN`, `forwardN` | `identityNxN`, `translation4x4(by3)`, `scale4x4(by3)`, `rotation2x2`, `rotation4x4(by3)`, `shearX/Y2x2`, `shearX/Y/Z4x4` | `zeroQuat`, `oneQuat`, `iQuat`/`jQuat`/`kQuat` |
| Element-wise | `add`, `subtract`, `multiply`, `divide`, `scale`, `inverse` (1/x), `min`, `max`, `floor`, `ceil` | `addNxN`, `subtractNxN`, `HadamardNxN`, `multiplyScalarNxN` | `addQuat`, `scaleQuat` |
| Products | `dotN`, `crossN`, `todN`, `tod_flip2` | `multiplyNxN`, `concat4x4` | `multiplyQuat`, `divideQuat`, `dotQuat` |
| Length | `lengthN`, `lengthNComponents`, `normalizeN` | `determinantNxN` | `lengthQuat`, `normalizeQuat` |
| Inverse | — | `affineInverseNxN`, `inverse4x4` | `conjugateQuat`, `inverseQuat`, `diffUnitQuat` |
| Interpolate | `linearN`, `slerpQuat` (Vec4) | — | `slerpUnitQuat`, `exponentQuat` |
| Compare / copy | `compareN` (exact), `fuzzyCompareN(a, b, eps)`, `copyN` | `compareNxN` (1e-7 tolerance for 4x4), `copyNxN` | — |
| Transform | `up3`, `down3`, `left3`, `right3`, `reverseN` | `transform2/3/4`, `transform3as4`, `projectToScreen`, `project3As4ToScreen` | `rotateVectorByUnitQuat` |
| Misc | `flattenN`, `toStringN`, `isVecN`, `color4FromHex3/4` | `toStringNxN`, `TRS4x4`, `SRT4x4`, `TRS4x4_2D`, `SRT4x4_2D` | Euler and matrix conversions (below) |

`VecMath(vec)` returns the `VecMethods<T>` table (`vec1Methods`…`vec4Methods`) for a vector's
length, so generic code (e.g. easing) can call `VecMath(v).linear(...)` without knowing the size.

### `out` parameters and allocation

Nearly every function takes an optional trailing `out`. If given, the result is written into it and
`out` is returned; if omitted, a new tuple is allocated. Hot paths (scene graph, easing, projection)
always pass `out`. For deeper nesting, module-level registers exist: `V3R`/`V4R` (20 vectors each),
`M3R`/`M4R` (20 matrices each) and `QR1`–`QR4`. Library functions use these registers themselves
(`concat4x4` uses the last `M4R` entries, `lookAtQuat` the last three `V3R` entries,
`Transform` in `ui/src/3d/scene-graph/transform.ts` uses the first entries of `M3R`, `M4R` and `V3R`), so a
register is only valid until the next library call.

### Matrix layout: column-major, column vectors

- Storage is **column-major**, as WebGL uniforms expect: the mathematical element at row `r`,
  column `c` of a 4x4 lives at index `c * 4 + r`. `translation4x4(x, y, z)` puts `x, y, z` at
  indices 12, 13, 14 (`unit-test/matrix.test.ts`, "Is Column Major").
- The constants `M4ab = a * 4 + b` (e.g. `M430 = 12`) index that buffer; read `a` as the column of
  the mathematical matrix and `b` as its row (the source comments call `a` the "row" because they
  describe the buffer as printed, i.e. transposed). `M3ab = a * 3 + b`, `M2ab = a * 2 + b`.
- Vectors are column vectors multiplied on the right: `transform4(m, v)` = `m · v`.
- `multiply4x4(left, right)` = `left · right`, so the **right** operand is applied to a vector
  first: `transform4(multiply4x4(t, s), v)` scales then translates
  (`unit-test/matrix.test.ts`, "Transforms: Order of operations"). `concat4x4(out, A, B, C)` =
  `A · B · C`.
- `SRT4x4(scale, rot3x3, translation, out)` builds `T · R · S` (scale first — a model matrix);
  `TRS4x4` builds `S · R · T` (translate first — used with inverted inputs to build view matrices
  in `Transform`). The `_2D` variants do the same for 2x2 rotations.
- `inverse4x4` is a full cofactor inverse (returns `null` and warns when the determinant is 0);
  `affineInverse2x2/3x3/4x4` are cheaper and only valid for affine transforms.

### Handedness and orientation

- Right-handed, camera looks down **-Z**: `forward3()` is `[0, 0, -1]`, `forward4()` is
  `[0, 0, -1, 0]`; `forward2()` is `[1, 0]`.
- `cross3` is the standard right-handed cross product (`x × y = z`, pinned in
  `unit-test/vector.test.ts`).
- `rotation4x4(x, y, z)` follows the right-hand rule and applies X, then Y, then Z
  (`Rz · Ry · Rx`); single-axis cases have dedicated branches. Other orders: multiply single-axis
  matrices yourself (`unit-test/matrix.test.ts`, "Rotation (Right hand rule)").
- `perspectiveFrustum4x4`, `perspective4x4` (horizontal FOV) and `perspectiveFOVY4x4` (vertical FOV)
  are OpenGL-style (`-1` in `M423`, depth to `[-1, 1]`). `orthographic4x4` uses `-1 / (far - near)`
  for depth, not the OpenGL `-2 / (far - near)`.
- `projectToScreen(proj, v, width, height)` divides by `w` and maps NDC to `[0, width] × [0, height]`
  with **y growing upward** (top of the view is `y = height`, `unit-test/projection-3d.test.ts`);
  `z` stays in NDC.

### Quaternion conversions

- Construction: `fromEulerAxisAngleToQuat(axis, angle)`, `eulerToQuat([roll, pitch, yaw])`,
  `fromOrderedEulerToQuat(angles, EulerOrder.xyz)`, `lookAtQuat(forward, up)`,
  `matrix3x3ToQuaternion`, `matrix4x4ToQuaternion`, `decomposeRotation(mat4, sx, sy, sz)` (rotation of
  a TRS matrix with known scales).
- To matrices: `matrix3x3FromUnitQuatModel` / `matrix4x4FromUnitQuatModel` (the object takes the
  orientation) and `...View` (the world is rotated opposite to it, the transpose).
- To Euler: `toOrderedEulerFromQuat(q, order)`, `toEulerFromQuat`, `toEulerXYZfromOrderedEuler`;
  `angleQuat` / `axisQuat` extract axis-angle.
- `lookAtQuat([0, 0, -1], [0, 1, 0])` is the identity; looking at `+X` equals a 90° Y rotation in
  view form (`unit-test/quaternion.test.ts`, "Lookat Quaternion"). `lookAtMatrix` builds the same
  basis as a 4x4. `unit-test/transform.test.ts` pins that `Transform.lookAtLocal([0, 0, -1], up)`
  leaves an identity matrix.

## Extension points

- Add an operation by following the scheme: one function per dimension, readonly inputs
  (`ReadonlyVec3Compat`, `ReadonlyMat4x4`, `ReadonlyQuaternion`), optional `out` last, return `out`.
  Use `applyN`/`applyNxN` to write results.
- An operation that must work generically over vector sizes belongs in `VecMethods<T>` and all four
  `vecNMethods` tables (only `vec4Methods` has the optional `slerpQuat`).
- New code is exported automatically through `ui/src/math/index.ts` (`export *`).

## Gotchas

- **Aliasing.** Functions that compute every component before writing (`applyN`/`applyNxN`-based
  ones such as `addN`, `transformN`, `multiply2x2`, `multiply3x3`) are safe with `out` equal to an
  input. Functions that write `out` element by element while still reading inputs are not:
  `cross3`, `multiply4x4`, `inverse4x4`. Never pass an input as their `out` (`concat4x4`
  alternates two registers for exactly this reason).
- `TRS4x4`, `SRT4x4` and their `_2D` variants return nothing; they only fill `out`, so always pass
  one.
- Quaternions are `[w, x, y, z]`; code ported from glMatrix/three.js (`[x, y, z, w]`) will be wrong.
- `slerpQuat` (in `vector.ts`) and `slerpUnitQuat` (in `quaternion.ts`) both exist; both expect unit
  quaternions and take the shortest path.
- Registers (`V3R`, `V4R`, `M3R`, `M4R`, `QR*`) are clobbered by library calls; never hold a value
  in one across calls.
- `vecN()` allocates and pads/truncates; `vec3(v4)` drops `w`. `flatten1/2` append to `out`,
  `flatten3/4` overwrite from index 0.
- Degenerate 1D/2D/4D ops are stubs: `cross1`/`cross2` return zeros, `cross4` returns
  `[0, 0, 0, 1]`, `normalize1` returns `[1]`, `length1` returns the signed component, `tod1` is a
  plain product.
- `color4FromHex4` uses a signed `>> 24`, so a red byte ≥ `0x80` yields a negative red;
  `color4FromHex3` (RGB, alpha 1) has no such issue.
- `compareN` is exact `===`; use `fuzzyCompareN` for computed values. `compare4x4` already has a
  `1e-7` tolerance.
- `toEulerFromQuat` is documented as XYZ but calls `toOrderedEulerFromQuat(q, EulerOrder.zyx)`;
  pass an explicit order when the convention matters.

## Related

- [Projection and geometry](projection-and-geometry.md) — `BaseProjection`, rays, planes, frustum, `Bounds`.
- [Scene graph](../3d/scene-graph.md) — `Transform`, the main consumer of `SRT4x4`/`TRS4x4` and quaternions.
- [3D view and projection](../3d/view-and-projection.md) — cameras built from `perspective4x4`/`orthographic4x4`.
- [Easing and animation](../instances/easing-and-animation.md) — uses `VecMath` and `auto-easing-method.ts`.
