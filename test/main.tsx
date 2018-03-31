import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CircleInstance } from 'voidgl/base-layers/circles/circle-instance';
import { Anchor, AnchorType, ISceneOptions, LabelInstance, LabelLayer, RingInstance, ScaleType, SectionLayer } from '../src';
import { BasicCameraController } from '../src/voidgl/base-event-managers';
import { CircleLayer } from '../src/voidgl/base-layers/circles';
import { createLayer, LayerSurface } from '../src/voidgl/surface/layer-surface';
import { AtlasSize } from '../src/voidgl/surface/texture/atlas';
import { ClearFlags } from '../src/voidgl/surface/view';
import { ChartCamera } from '../src/voidgl/util/chart-camera';
import { DataProvider } from '../src/voidgl/util/data-provider';

/**
 * The state of the application
 */
export interface IMainState {
  size: { width: number, height: number };
}

export type SceneInitializer = {
  name: string,
  camera: ChartCamera,
  control: BasicCameraController,
  scene: ISceneOptions;
};

function makeSceneBlock(sceneBlockSize: number) {
  const scenes: SceneInitializer[] = [];
  const viewSize = 100 / sceneBlockSize;

  const backgrounds: [number, number, number, number][] = [
    [0.1, 0.0, 0.0, 1.0],
    [0.0, 0.1, 0.0, 1.0],
    [0.0, 0.0, 0.1, 1.0],
    [0.1, 0.1, 0.0, 1.0],
    [0.1, 0.0, 0.1, 1.0],
    [0.1, 0.1, 0.1, 1.0],
    [0.0, 0.1, 0.1, 1.0],
  ];

  for (let i = 0; i < sceneBlockSize; ++i) {
    for (let k = 0; k < sceneBlockSize; ++k) {
      const camera = new ChartCamera();
      const name = `${i}_${k}`;
      const init: SceneInitializer = {
        camera,
        control: new BasicCameraController({
          camera,
          startView: name,
        }),
        name,
        scene: {
          key: name,
          views: [
            {
              background: backgrounds[Math.floor(Math.random() * backgrounds.length)],
              camera,
              clearFlags: [ClearFlags.COLOR],
              key: name,
              viewport: {
                height: `${viewSize}%`,
                left: `${viewSize * k}%`,
                top: `${viewSize * i}%`,
                width: `${viewSize}%`,
              },
            },
          ],
        },
      };

      scenes.push(init);
    }
  }

  return scenes;
}

/**
 * Entry class for the Application
 */
export class Main extends React.Component<any, IMainState> {
  /** The containing element of this component */
  container: HTMLElement;
  /** The rendering context we will draw into */
  context: HTMLCanvasElement;
  /** While true, the animation loop will run */
  willAnimate: number = 10;
  /** The layer manager that draws our GL elements */
  surface: LayerSurface;
  /** This is all of the scenes that were initialized */
  allScenes: SceneInitializer[] = [];

  state: IMainState = {
    size: {
      height: 0,
      width: 0,
    },
  };

  componentWillMount() {
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    this.surface && this.surface.destroy();
    this.willAnimate = 0;
  }

  draw() {
    if (this.willAnimate) {
      requestAnimationFrame(() => this.draw());
    }

    if (this.surface) {
      this.surface.draw();
    }
  }

  handleResize = () => {
    if (this.surface) {
      this.surface.fitContainer();
    }
  }

  setContainer = (element: HTMLDivElement) => {
    this.container = element;
    setTimeout(() => this.sizeContext(), 100);
  }

  setContext = async(canvas: HTMLCanvasElement) => {
    let generate = false;
    this.context = canvas;

    if (this.surface && this.context !== this.surface.gl.canvas) {
      this.surface.destroy();
      generate = true;
    }

    else if (!this.surface) {
      generate = true;
    }

    if (generate) {
      const scenes = makeSceneBlock(3);
      this.allScenes = scenes;

      this.surface = await new LayerSurface().init({
        atlasResources: [
          {
            height: AtlasSize._2048,
            key: 'all-resources',
            width: AtlasSize._2048,
          },
        ],
        background: [0.1, 0.2, 0.3, 1.0],
        context: this.context,
        eventManagers: scenes.map(init => init.control),
        handlesWheelEvents: true,
        pixelRatio: 2,
        scenes: scenes.map(init => init.scene),
      });

      this.willAnimate = 10;
      requestAnimationFrame(() => this.draw());

      this.forceUpdate();
    }
  }

  sizeContext() {
    const box = this.container.getBoundingClientRect();

    this.setState({
      size: {
        height: box.height,
        width: box.width,
      },
    });
  }

  /**
   * @override
   * The React defined render method
   */
  render() {
    const { size } = this.state;

    if (size.width === 0 || size.height === 0) {
      return (
        <div style={{width: '100%', height: '100%'}} ref={this.setContainer}></div>
      );
    }

    if (this.surface) {
      const circleProvider = new DataProvider<CircleInstance>([]);
      const ringProvider = new DataProvider<RingInstance>([]);
      const labelProvider = new DataProvider<LabelInstance>([]);

      this.surface.render([
        createLayer(SectionLayer, {
          data: ringProvider,
          key: 'ring-layer-0',
          scene: this.allScenes[0].name,
        }),
        createLayer(CircleLayer, {
          data: circleProvider,
          key: 'circle-layer-0',
          scene: this.allScenes[1].name,
        }),
        createLayer(LabelLayer, {
          atlas: 'all-resources',
          data: labelProvider,
          key: 'label-layer-0',
          scene: this.allScenes[2].name,
        }),
      ]);

      for (let i = 0; i < 100; ++i) {
        for (let k = 0; k < 100; ++k) {
          const circle = new CircleInstance({
            color: [1.0, 0.0, 0.0, 1.0],
            id: `circle${i * 100 + k}`,
            radius: 5,
            x: i * 10,
            y: k * 10,
          });

          circleProvider.instances.push(circle);
        }
      }

      for (let i = 0; i < 250; ++i) {
        for (let k = 0; k < 250; ++k) {
          ringProvider.instances.push(new RingInstance({
            color: [Math.random(), Math.random(), Math.random(), 1.0],
            id: `ring_${i}_${k}`,
            radius: 10,
            thickness: 3,
            x: i * 20,
            y: k * 20,
          }));
        }
      }

      for (let i = 0; i < 5000; ++i) {
        labelProvider.instances.push(new LabelInstance({
          anchor: {
            padding: 0,
            type: AnchorType.Middle,
          },
          color: [Math.random(), Math.random(), Math.random(), 1.0],
          fontFamily: 'Arial',
          fontSize: 20,
          fontStyle: 'normal',
          fontWeight: 'normal',
          id: `label-test-${i}`,
          rasterization: {
            scale: 1.0,
          },
          scaling: [ScaleType.NEVER, ScaleType.ALWAYS, ScaleType.BOUND_MAX][Math.floor(Math.random() * 3.0)],
          text: 'Hello World!',
          x: Math.random() * 1500,
          y: Math.random() * 1500,
        }));
      }

      labelProvider.instances.push(new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.Middle,
        },
        color: [0.0, 1.0, 0.0, 1.0],
        fontFamily: 'Arial',
        fontSize: 28,
        fontStyle: 'normal',
        fontWeight: 'normal',
        id: 'label-test-2',
        rasterization: {
          scale: 1.0,
        },
        scaling: ScaleType.BOUND_MAX,
        text: 'Hello!',
        x: 350,
        y: 250,
      }));

      setInterval(() => {
        for (let i = 0; i < 1000; ++i) {
          const label = labelProvider.instances[Math.floor(Math.random() * labelProvider.instances.length)];
          const anchor: Anchor = {
            padding: 0,
            type: [
              AnchorType.TopLeft,
              AnchorType.TopMiddle,
              AnchorType.TopRight,
              AnchorType.MiddleLeft,
              AnchorType.Middle,
              AnchorType.MiddleRight,
              AnchorType.BottomLeft,
              AnchorType.BottomMiddle,
              AnchorType.BottomRight,
            ][Math.floor(Math.random() * 9)],
          };
          label.setAnchor(anchor);
        }
      }, 100);
    }

    return (
      <div className="voidray-layer-surface" ref={this.setContainer}>
        <canvas ref={this.setContext} width={size.width} height={size.height} />
      </div>
    );
  }
}

ReactDOM.render(<Main/>, document.getElementById('main'));
