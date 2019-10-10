import {
  AutoEasingMethod,
  CommonMaterialOptions,
  createAttribute,
  GLSettings,
  IAutoEasingMethod,
  ILayerProps,
  InstanceAttributeSize,
  InstanceProvider,
  IShaderInitialization,
  Layer,
  Vec,
  Vec2,
  Vec3,
  VertexAttributeSize,
} from '../../../../src';
import { CubeInstance } from './cube-instance';

export interface ICubeLayerProps<TInstance extends CubeInstance>
  extends ILayerProps<TInstance> {
  animate?: {
    rotation?: IAutoEasingMethod<Vec>;
  };
}

/**
 * Layer for rendering simple cube primitives
 */
export class CubeLayer<
  TInstance extends CubeInstance,
  TProps extends ICubeLayerProps<TInstance>
> extends Layer<TInstance, TProps> {
  static defaultProps: ICubeLayerProps<CubeInstance> = {
    data: new InstanceProvider<CubeInstance>(),
    key: '',
    materialOptions: CommonMaterialOptions.transparentShapeBlending,
  };

  initShader(): IShaderInitialization<TInstance> | null {
    const animate = this.props.animate || {};

    const FRT: Vec3 = [1, 1, 1];
    const BRT: Vec3 = [1, 1, -1];
    const BRB: Vec3 = [1, -1, -1];
    const FRB: Vec3 = [1, -1, 1];

    const FLT: Vec3 = [-1, 1, 1];
    const BLT: Vec3 = [-1, 1, -1];
    const BLB: Vec3 = [-1, -1, -1];
    const FLB: Vec3 = [-1, -1, 1];

    const positions: Vec3[] = [
      // right
      FRT,
      BRT,
      BRB,
      FRT,
      BRB,
      FRB,
      // front
      FLT,
      FRT,
      FRB,
      FLT,
      FRB,
      FLB,
      // left
      FLT,
      BLB,
      BLT,
      FLT,
      FLB,
      BLB,
      // back
      BLT,
      BRB,
      BRT,
      BLT,
      BLB,
      BRB,
      // up
      FLT,
      BRT,
      FRT,
      FLT,
      BLT,
      BRT,
      // down
      FLB,
      FRB,
      BRB,
      FLB,
      BRB,
      BLB,
    ];

    const right: Vec3 = [1, 0, 0];
    const forward: Vec3 = [0, 0, 1];
    const left: Vec3 = [-1, 0, 0];
    const backward: Vec3 = [0, 0, -1];
    const up: Vec3 = [0, 1, 0];
    const down: Vec3 = [0, -1, 0];

    const normals = [
      right,
      right,
      right,
      right,
      right,
      right,
      forward,
      forward,
      forward,
      forward,
      forward,
      forward,
      left,
      left,
      left,
      left,
      left,
      left,
      backward,
      backward,
      backward,
      backward,
      backward,
      backward,
      up,
      up,
      up,
      up,
      up,
      up,
      down,
      down,
      down,
      down,
      down,
      down,
    ];

    const tex: Vec2[] = [
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
      [0, 1],
    ];

    return {
      drawMode: GLSettings.Model.DrawMode.TRIANGLES,
      fs: require('./cube-layer.fs'),
      instanceAttributes: [
        createAttribute({
          name: 's',
          size: InstanceAttributeSize.THREE,
          update: o => o.scale,
        }),
        createAttribute({
          easing: animate.rotation,
          name: 'r',
          size: InstanceAttributeSize.FOUR,
          update: o => o.rotation,
        }),
        createAttribute({
          easing: AutoEasingMethod.easeInOutCubic(500),
          name: 't',
          size: InstanceAttributeSize.THREE,
          update: o => o.position,
        }),
        createAttribute({
          name: 'size',
          size: InstanceAttributeSize.THREE,
          update: o => o.size,
        }),
        createAttribute({
          name: 'color',
          size: InstanceAttributeSize.FOUR,
          update: o => o.color,
        }),
        createAttribute({
          name: 'frontColor',
          size: InstanceAttributeSize.FOUR,
          update: o => o.frontColor,
        }),
      ],
      uniforms: [],
      vertexAttributes: [
        {
          name: 'position',
          size: VertexAttributeSize.THREE,
          update: (vertex: number) => positions[vertex],
        },
        {
          name: 'normal',
          size: VertexAttributeSize.THREE,
          update: (vertex: number) => normals[vertex],
        },
        {
          name: 'texCoord',
          size: VertexAttributeSize.TWO,
          update: (vertex: number) => tex[vertex],
        },
      ],
      vertexCount: 36,
      vs: require('./cube-layer.vs'),
    };
  }

  getMaterialOptions() {
    return Object.assign({}, CommonMaterialOptions.transparentShapeBlending, {
      cullSide: GLSettings.Material.CullSide.CCW,
    });
  }
}
