/** @jsx h */
import { Component, h, render } from 'preact';
import { ISceneOptions, LayerInitializer } from '../src';
import { BasicCameraController } from '../src/voidgl/base-event-managers';
import { LayerSurface } from '../src/voidgl/surface/layer-surface';
import { AtlasSize } from '../src/voidgl/surface/texture/atlas';
import { ClearFlags } from '../src/voidgl/surface/view';
import { ChartCamera } from '../src/voidgl/util/chart-camera';
import { BaseExample } from './examples/base-example';
import { BendyEdge } from './examples/bendy-edge';
import { BoxOfCircles } from './examples/box-of-circles';
import { BoxOfRings } from './examples/box-of-rings';
import { ChangingAnchorLabels } from './examples/changing-anchor-labels';
import { Images } from './examples/images';
import { LabelAnchorsAndScales } from './examples/label-anchors-and-scales';
import { Lines } from './examples/lines';

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

/** These are all of the tests to be rendered */
const tests: BaseExample[] = [
  new BoxOfRings(),
  new BoxOfCircles(),
  new ChangingAnchorLabels(),
  new LabelAnchorsAndScales(),
  new Images(),
  new BendyEdge(),
  new Lines(),
];

/** These are the layers for the tests that are generated */
const layers: LayerInitializer[] = [];

/**
 * Entry class for the Application
 */
export class Main extends Component<any, IMainState> {
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

  componentDidUpdate() {
    this.createSurface();
  }

  async createSurface() {
    if (this.surface) return;

    let generate = false;
    this.context.removeAttribute('style');

    if (this.surface && this.context !== this.surface.gl.canvas) {
      this.surface.destroy();
      generate = true;
    }

    else if (!this.surface) {
      generate = true;
    }

    if (generate) {
      const scenes = this.makeSceneBlock(3);
      this.allScenes = scenes;

      // Establish the surface and scenes needed
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
        scenes: scenes.map(init => init.scene),
      });

      // Generate the Layers for the tests now that the scenes are established
      tests.forEach((test, i) => {
        const provider = test.makeProvider();
        const layer = test.makeLayer(this.allScenes[i].name, 'all-resources', provider);
        layers.push(layer);
      });

      // Begin the draw loop
      this.willAnimate = 10;
      requestAnimationFrame(() => this.draw());

      this.forceUpdate();
    }
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

  handleToggleMonitorDensity = () => {
    if (this.surface.pixelRatio !== 1.0) {
      this.surface.resize(this.context.width / window.devicePixelRatio, this.context.height / window.devicePixelRatio, 1.0);
    }

    else {
      this.surface.resize(this.context.width * window.devicePixelRatio, this.context.height * window.devicePixelRatio, window.devicePixelRatio);
    }

    this.forceUpdate();
  }

  makeSceneBlock(sceneBlockSize: number) {
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

  setContainer = (element: HTMLDivElement) => {
    this.container = element;
    setTimeout(() => this.sizeContext(), 100);
  }

  setContext = async(canvas: HTMLCanvasElement) => {
    this.context = canvas;
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
  render(): JSX.Element {
    const { size } = this.state;

    if (size.width === 0 || size.height === 0) {
      return (
        <div style={{width: '100%', height: '100%'}} ref={this.setContainer}></div>
      );
    }

    if (this.surface) {
      this.surface.render(layers);
    }

    return (
      <div className="voidray-layer-surface" ref={this.setContainer}>
        <canvas ref={this.setContext} width={size.width} height={size.height}/>
          {window.devicePixelRatio === 1.0 ? null :
            <div className={'test-button'} onClick={this.handleToggleMonitorDensity}>{
              (this.surface && this.surface.pixelRatio === window.devicePixelRatio) ?
              'Disable Monitor Density' :
              'Enable Monitor Density'
            }</div>
          }
      </div >
    );
  }
}

render(<Main />, document.getElementById('main'));
