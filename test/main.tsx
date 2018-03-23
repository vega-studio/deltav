import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CircleInstance } from 'voidgl/base-layers/circles/circle-instance';
import { LabelLayer, RingInstance, SectionLayer } from '../src';
import { BasicCameraController } from '../src/voidgl/base-event-managers';
import { CircleLayer } from '../src/voidgl/base-layers/circles';
import { createLayer, LayerSurface } from '../src/voidgl/surface/layer-surface';
import { AtlasSize } from '../src/voidgl/surface/texture/atlas';
import { ClearFlags } from '../src/voidgl/surface/view';
import { ChartCamera } from '../src/voidgl/util/chart-camera';
import { DataProvider } from '../src/voidgl/util/data-provider';
import { ReferenceCamera } from '../src/voidgl/util/reference-camera';

/**
 * The state of the application
 */
export interface IMainState {
  size: { width: number, height: number };
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

  state: IMainState = {
    size: {
      height: 0,
      width: 0,
    },
  };

  componentWillUnmount() {
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

  setContainer = (element: HTMLDivElement) => {
    this.container = element;
    setTimeout(() => this.sizeContext(), 100);
  }

  setContext = (canvas: HTMLCanvasElement) => {
    let generate = false;
    this.context = canvas;

    if (this.surface && this.context !== this.surface.gl.canvas) {
      this.surface.destroy();
      generate = true;
    }

    else if (!this.surface) {
      generate = true;
    }

    const ringCamera = new ChartCamera();
    const circleCamera = new ChartCamera();

    if (generate) {
      this.surface = new LayerSurface({
        atlasResources: [
          {
            height: AtlasSize._2048,
            key: 'all-resources',
            width: AtlasSize._1024,
          },
        ],
        background: [0.1, 0.2, 0.3, 1.0],
        context: this.context,
        eventManagers: [
          new BasicCameraController({
            camera: ringCamera,
            ignoreCoverViews: true,
            startView: 'ring-view',
          }),
          new BasicCameraController({
            camera: circleCamera,
            ignoreCoverViews: true,
            startView: 'circle-view',
          }),
        ],
        handlesWheelEvents: true,
        scenes: [
          {
            key: 'rings',
            views: [
              {
                camera: ringCamera,
                key: 'ring-view',
              },
            ],
          },
          {
            key: 'circles',
            views: [
              {
                camera: circleCamera,
                clearFlags: [ClearFlags.DEPTH],
                key: 'circle-view',
              },
            ],
          },
        ],
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

      this.surface.render([
        createLayer(SectionLayer, {
          data: ringProvider,
          key: 'ring-layer-0',
          scene: 'rings',
        }),
        createLayer(CircleLayer, {
          data: circleProvider,
          key: 'circle-layer-0',
          scene: 'circles',
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
        ringProvider.instances.push(new RingInstance({
          color: [Math.random(), Math.random(), Math.random(), 1.0],
          id: `ring_${i}`,
          radius: Math.random() * 100 + 10,
          thickness: Math.random() * 20 + 1,
          x: Math.random() * 1600,
          y: Math.random() * 800,
        }));
      }
    }

    return (
      <div className="voidray-layer-surface" ref={this.setContainer}>
        <canvas ref={this.setContext} width={size.width} height={size.height} />
      </div>
    );
  }
}

ReactDOM.render(<Main/>, document.getElementById('main'));
