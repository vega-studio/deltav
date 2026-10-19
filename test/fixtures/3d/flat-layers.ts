import {
  type Color,
  createAttribute,
  CubeInstance,
  CubeLayer,
  FragmentOutputType,
  type ICubeLayerProps,
  type IInstanceAttribute,
  type Instance3D,
  InstanceAttributeSize,
  type IShaderInitialization,
} from "../../../ui/src/index.js";
import { TriangleInstance } from "../../../ui/src/3d/layers/triangle/triangle-instance.js";
import {
  type ITriangleLayerProps,
  TriangleLayer,
} from "../../../ui/src/3d/layers/triangle/triangle-layer.js";

/**
 * Test-only subclasses of the built-in CubeLayer and TriangleLayer that paint
 * each shape flat in its instance `color` and read the transform through
 * `instance.matrix`.
 *
 * Why they exist:
 *
 * - The built-in layers ignore `color` (docs/3d/layers.md, Gotchas): every
 *   shape is red, so two shapes cannot be told apart.
 * - DEFECT (report DELTAV-85, test/3d/layers.test.ts): the built-in layers' `transform`
 *   attribute reads `(o.transform || IdentityTransform).matrix`, which touches
 *   no observable of the instance, so the buffer manager never registers a
 *   property for it and never uploads it; the mat4 stays all zeros and nothing
 *   is drawn. Reading `o.matrix` (the instance's observable `_matrix`, as the
 *   storybook cube layer does) is the documented extension pattern.
 *
 * Everything else — geometry, size attribute, material and culling defaults,
 * the `projection` shader module, View3D and the scene graph — is the code
 * under test. Unlit: no lighting enters the expected colours.
 */
const VS = `
\${import: projection}

varying vec4 _color;

void main() {
  vec4 world = transform * vec4(position * size, 1.0);
  _color = color;
  gl_Position = clipSpace(world.xyz);
}
`;

const FS = `
varying vec4 _color;

void main() {
  gl_FragColor = _color;
}
`;

function flatten<T extends Instance3D & { color: Color }>(
  init: IShaderInitialization<T> | null
): IShaderInitialization<T> | null {
  if (!init) return null;
  const attributes = (init.instanceAttributes || []).map((a) =>
    a && a.name === "transform"
      ? createAttribute<T>({
          name: "transform",
          size: InstanceAttributeSize.MAT4X4,
          update: (o) => o.matrix,
        })
      : a
  ) as IInstanceAttribute<T>[];

  return {
    ...init,
    instanceAttributes: [
      ...attributes,
      createAttribute<T>({
        name: "color",
        size: InstanceAttributeSize.FOUR,
        update: (o) => o.color,
      }),
    ],
    vs: VS,
    fs: [{ outputType: FragmentOutputType.COLOR, source: FS }],
  };
}

export class FlatCubeLayer extends CubeLayer<
  CubeInstance,
  ICubeLayerProps<CubeInstance>
> {
  static defaultProps = CubeLayer.defaultProps;

  initShader() {
    return flatten(super.initShader());
  }
}

export class FlatTriangleLayer extends TriangleLayer<
  TriangleInstance,
  ITriangleLayerProps<TriangleInstance>
> {
  static defaultProps = TriangleLayer.defaultProps;

  initShader() {
    return flatten(super.initShader());
  }
}
