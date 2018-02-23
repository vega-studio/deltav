import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CircleInstance } from 'voidgl/base-layers/circles/circle-instance';
import { CircleLayer } from '../src/voidgl/base-layers/circles';
import { createLayer, LayerSurface } from '../src/voidgl/layer-surface';
import { DataProvider } from '../src/voidgl/util/data-provider';

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

    if (this.surface && this.context !== this.surface.context.canvas) {
      this.surface.destroy();
      generate = true;
    }

    else if (!this.surface) {
      generate = true;
    }

    if (generate) {
      this.surface = new LayerSurface({
        background: [0.1, 0.2, 0.3, 1.0],
        context: this.context,
        scenes: [],
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
      createLayer(this.surface, CircleLayer, {
        data,
        depth: 0,
        key: 'circle-layer',
      });

      this.surface.render();

      setTimeout(() => {
        for (let i = 0; i < 500; ++i) {
          for (let k = 0; k < 200; ++k) {
            const circle = new CircleInstance({
              color: [1.0, 0.0, 0.0, 1.0],
              depth: 0,
              id: `circle${i * 20 + k}`,
              radius: 5,
              x: i * 5,
              y: k * 5,
            });

            data.instances.push(circle);
          }
        }

        setInterval(() => {
          for (let i = 0; i < 50000; ++i) {
            data.instances[Math.floor(data.instances.length * Math.random())].x += 2;
          }
        }, 1000 / 60);
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
