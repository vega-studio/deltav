import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CircleInstance } from 'voidgl/base-layers/circles/circle-instance';
import { BasicCameraController, LogController } from '../src/voidgl/base-event-managers';
import { CircleLayer } from '../src/voidgl/base-layers/circles';
import { createLayer, LayerSurface } from '../src/voidgl/layer-surface';
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

    const mainCamera = new ChartCamera();

    if (generate) {
      this.surface = new LayerSurface({
        background: [0.1, 0.2, 0.3, 1.0],
        context: this.context,
        eventManagers: [
          new BasicCameraController({
            camera: mainCamera,
            startView: 'test-view2',
          }),
        ],
        scenes: [
          {
            key: 'small-panel',
            views: [
              {
                background: [1.0, 1.0, 1.0, 1.0],
                camera: mainCamera,
                clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
                key: 'test-view',
                viewport: {
                  bottom: 0,
                  right: 0,
                  top: 0,
                  width: 200,
                },
              },
            ],
          },
          {
            key: 'small-panel-2',
            views: [
              {
                background: [1.0, 1.0, 1.0, 1.0],
                camera: new ReferenceCamera({
                  base: mainCamera,
                  offsetFilter: (offset: [number, number, number]) => [offset[0], 0, 0],
                }),
                clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
                key: 'test-view2',
                viewport: {
                  bottom: 0,
                  left: 0,
                  top: '50%',
                  width: '50%',
                },
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
      const data = new DataProvider<CircleInstance>([]);
      const data2 = new DataProvider<CircleInstance>([]);

      this.surface.render([
        createLayer(CircleLayer, {
          data,
          depth: 0,
          key: 'circle-layer',
          scene: 'small-panel',
        }),
        createLayer(CircleLayer, {
          data: data2,
          depth: 1,
          key: 'circle-layer-2',
          scene: 'small-panel-2',
        }),
      ]);

      setTimeout(() => {
        for (let i = 0; i < 100; ++i) {
          for (let k = 0; k < 100; ++k) {
            let circle = new CircleInstance({
              color: [1.0, 0.0, 0.0, 1.0],
              depth: 0,
              id: `circle${i * 20 + k}`,
              radius: 5,
              x: i * 10,
              y: k * 10,
            });

            data.instances.push(circle);

            circle = new CircleInstance({
              color: [1.0, 0.0, 0.0, 1.0],
              depth: 0,
              id: `circle${i * 20 + k}`,
              radius: 5,
              x: i * 10,
              y: k * 10,
            });

            data2.instances.push(circle);
          }
        }
      });
    }

    return (
      <div className="voidray-layer-surface" ref={this.setContainer}>
        <canvas ref={this.setContext} width={size.width} height={size.height} />
      </div>
    );
  }
}

ReactDOM.render(<Main/>, document.getElementById('main'));
