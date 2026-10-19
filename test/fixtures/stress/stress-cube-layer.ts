import {
  createAttribute,
  CubeInstance,
  CubeLayer,
  type ICubeLayerProps,
  type IInstanceAttribute,
  InstanceAttributeSize,
} from "../../../ui/src/index.js";

/**
 * The built-in CubeLayer with one change: its `transform` attribute reads
 * `instance.matrix` (the instance's observable world matrix, as the storybook
 * cube layer does) instead of `(o.transform || IdentityTransform).matrix`,
 * which touches no observable, so the built-in layer never uploads it and
 * draws nothing (DEFECT, report DELTAV-85, pinned by test/3d/layers.test.ts).
 * Geometry, shaders (red faces, black edges), material, View3D and the scene
 * graph are the code under stress.
 */
export class StressCubeLayer extends CubeLayer<
  CubeInstance,
  ICubeLayerProps<CubeInstance>
> {
  static defaultProps = CubeLayer.defaultProps;

  initShader() {
    const init = super.initShader();
    if (!init) return null;
    return {
      ...init,
      instanceAttributes: (init.instanceAttributes || []).map((a) =>
        a && a.name === "transform"
          ? createAttribute<CubeInstance>({
              name: "transform",
              size: InstanceAttributeSize.MAT4X4,
              update: (o) => o.matrix,
            })
          : a
      ) as IInstanceAttribute<CubeInstance>[],
    };
  }
}
