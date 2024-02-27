import planck from "planck-js";
import React from "react";
import {
  AnchorType,
  BasicCamera2DControllerJSX,
  Camera2D,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  EdgeInstance,
  EdgeLayer,
  ImageInstance,
  ImageLayer,
  InstanceProvider,
  LayerJSX,
  onAnimationLoop,
  onFrame,
  PromiseResolver,
  RectangleInstance,
  RectangleLayer,
  SceneJSX,
  stopAnimationLoop,
  Surface,
  SurfaceJSX,
  Vec2,
  Vec4,
  View2D,
  ViewJSX,
} from "../../../src";
import { StoryFn } from "@storybook/react";
import { useLifecycle } from "../../../../util/hooks/use-life-cycle";

// Establish the world
const world = planck.World();

import shipImage from "../../../assets/ship.png";
import { AtlasJSX } from "../../../src/base-surfaces/react-surface/resource/atlas-jsx";

// Storybook export
export default {
  title: "Deltav/2D/Balls",
  args: {},
  argTypes: {},
};

// The ball object
class BallObject {
  graphic: CircleInstance;
  body: planck.Body;
  speed = 10;

  constructor(center: Vec2, radius: number, color: Vec4) {
    this.graphic = new CircleInstance({
      center,
      radius,
      color,
    });

    // Create a physical body in Planck.js world
    this.body = world.createBody({
      type: planck.Body.DYNAMIC,
      bullet: true,
    });
    this.body.createFixture(planck.Circle(radius), {
      density: 1,
      restitution: 0.9,
    });
    this.body.setPosition(planck.Vec2(center[0], center[1]));

    // Set initial velocity
    const initialVelocity = planck.Vec2(
      Math.random() * this.speed - this.speed / 2,
      Math.random() * this.speed - this.speed / 2
    );
    this.body.setLinearVelocity(initialVelocity);
  }

  // Function to set the speed of the ball
  setSpeed(newSpeed: number) {
    const velocity = this.body.getLinearVelocity();
    const normalizedVelocity = velocity.clone();
    const newVelocity = normalizedVelocity.mul(newSpeed);
    // this.body.applyForceToCenter(newVelocity, true);
    this.body.setLinearVelocity(newVelocity);
  }

  updatePosition() {
    const position = this.body.getPosition();
    this.graphic.center = [position.x, position.y];
    this.setSpeed(this.speed);
  }
}

class PaddleObject {
  graphic: RectangleInstance;
  body: planck.Body;

  constructor(position: Vec2, size: Vec2, color: Vec4) {
    this.graphic = new RectangleInstance({
      position,
      size,
      color,
    });

    // Create a physical body in Planck.js world
    this.body = world.createBody({
      type: planck.Body.KINEMATIC,
      position: planck.Vec2(position[0], position[1]),
    });
    this.body.createFixture(planck.Box(size[0] / 2, size[1] / 2), 1);
    this.updatePosition();
  }

  updatePosition() {
    const position = this.body.getPosition();
    const size = this.graphic.size;
    this.graphic.position = [
      position.x - size[0] / 2,
      position.y - size[1] / 2,
    ];
  }
}

class EdgeObject {
  graphic: EdgeInstance;
  body: planck.Body;

  constructor(start: Vec2, end: Vec2, thickness: Vec2, color: Vec4) {
    this.graphic = new EdgeInstance({
      start,
      end,
      startColor: color,
      endColor: color,
      thickness,
    });

    const planckStart = planck.Vec2(start[0], start[1]);
    const planckEnd = planck.Vec2(end[0], end[1]);

    // Create a physical body in Planck.js world
    this.body = world.createBody();
    this.body.createFixture(planck.Edge(planckStart, planckEnd), 0);
  }
}

class ShipObject {
  graphic: ImageInstance;
  body: planck.Body;

  constructor() {
    const position: Vec2 = [500, 500];
    const size: Vec2 = [140, 140];
    this.graphic = new ImageInstance({
      depth: 0,
      source: shipImage,
      width: size[0],
      height: size[1],
      anchor: {
        type: AnchorType.Middle,
        padding: 0,
      },
      origin: position,
      tint: [1, 1, 1, 1],
      rotation: 0,
    });

    // Create a physical body in Planck.js world
    this.body = world.createBody({
      type: planck.Body.STATIC,
      position: planck.Vec2(position[0], position[1]),
    });
    this.body.createFixture(planck.Box(size[0] / 2, size[1] / 2), 1);
    this.updatePosition();
  }

  updatePosition() {
    const position = this.body.getPosition();
    this.graphic.origin = [position.x, position.y];
  }
}

// Define boundaries based on screen size
const createBoundaries = (viewSize: { width: number; height: number }) => {
  const wallThickness = 4;
  const walls = [
    // Top
    {
      position: planck.Vec2(viewSize.width / 2, -wallThickness),
      width: viewSize.width,
      height: wallThickness,
    },
    // Bottom
    {
      position: planck.Vec2(
        viewSize.width / 2,
        viewSize.height + wallThickness
      ),
      width: viewSize.width,
      height: wallThickness,
    },
    // Left
    {
      position: planck.Vec2(-wallThickness, viewSize.height / 2),
      width: wallThickness,
      height: viewSize.height,
    },
    // Right
    {
      position: planck.Vec2(
        viewSize.width + wallThickness,
        viewSize.height / 2
      ),
      width: wallThickness,
      height: viewSize.height,
    },
  ];

  walls.forEach((wall) => {
    const body = world.createBody();
    body.createFixture(planck.Box(wall.width / 2, wall.height / 2), {
      density: 0,
      restitution: 1,
    });
    body.setPosition(wall.position);
  });
};

/**
 * Generate a color of the rainbow based on a value between min and max
 *
 * @param value
 * @param min
 * @param max
 * @returns
 */
function rainbowColor(value: number, min = 0, max = 100): Vec4 {
  const normalizedValue = (value - min) / (max - min);
  const segment = normalizedValue * 6;
  const segmentIndex = Math.floor(segment);
  const gradient = segment - segmentIndex;
  let r = 0,
    g = 0,
    b = 0;

  switch (segmentIndex) {
    case 0:
      r = 1;
      g = gradient;
      break;
    case 1:
      r = 1 - gradient;
      g = 1;
      break;
    case 2:
      g = 1;
      b = gradient;
      break;
    case 3:
      g = 1 - gradient;
      b = 1;
      break;
    case 4:
      r = gradient;
      b = 1;
      break;
    case 5:
      r = 1;
      b = 1 - gradient;
      break;
    default:
      break;
  }

  return [r, g, b, 1];
}

export const Balls: StoryFn = (() => {
  const circleProvider = React.useRef<InstanceProvider<CircleInstance>>(null);
  const rectProvider = React.useRef<InstanceProvider<RectangleInstance>>(null);
  const edgeProvider = React.useRef<InstanceProvider<EdgeInstance>>(null);
  const imageProvider = React.useRef<InstanceProvider<ImageInstance>>(null);
  const ready = React.useRef(new PromiseResolver<Surface>());
  const interval = 100;

  useLifecycle({
    async didMount() {
      // Wait for the surface to establish the full pipeline
      if (!circleProvider.current) return;
      if (!rectProvider.current) return;
      const surface = await ready.current.promise;
      const viewSize = surface.getViewSize("balls.main");
      const balls: BallObject[] = [];
      const paddle: PaddleObject[] = [];
      const edges: EdgeObject[] = [];
      const ships: ShipObject[] = [];

      // Make sure the view exists
      if (!viewSize) {
        console.warn("Invalid View Size", surface);
        return;
      }

      // Create boundaries around the view
      createBoundaries(viewSize);

      // Ball properties
      const radius = 50;
      const maxBalls = 50;

      // Get a random starting position in the view
      const getRandomCenter = (r: number): Vec2 => {
        return [
          Math.random() * (viewSize.width - r * 2) + r,
          Math.random() * (viewSize.height - r * 2) + r,
        ];
      };

      const createPaddle = () => {
        if (!rectProvider.current) return;
        const position: Vec2 = [800, 800];
        const p = new PaddleObject(position, [400, 40], [1, 1, 1, 1]);
        rectProvider.current.add(p.graphic);
        paddle.push(p);
      };

      // Make some balls
      const createBalls = () => {
        if (!circleProvider.current) return;
        for (let c = 0; c < maxBalls; ++c) {
          const center = getRandomCenter(radius);
          const color = rainbowColor(center[0], 0, viewSize.width);
          const r = Math.random() * radius + 10;
          const ballObject = new BallObject(center, r, color);
          circleProvider.current.add(ballObject.graphic);
          balls.push(ballObject);
        }
      };

      // Create some edges
      const createEdges = () => {
        if (!edgeProvider.current) return;
        const thickness: Vec2 = [10, 10];
        const color: Vec4 = [1, 1, 1, 1];
        const edge1 = new EdgeObject([300, 200], [500, 500], thickness, color);
        const edge2 = new EdgeObject([1200, 200], [900, 500], thickness, color);
        edgeProvider.current.add(edge1.graphic);
        edgeProvider.current.add(edge2.graphic);
        edges.push(edge1);
      };

      const createShip = () => {
        if (!imageProvider.current) return;
        const ship = new ShipObject();
        imageProvider.current.add(ship.graphic);
        ships.push(ship);
      };

      // Create balls
      createBalls();

      // Add the paddle
      createPaddle();

      // Create edges
      createEdges();

      // Create ship
      createShip();

      const loopId = onAnimationLoop((_t: number) => {
        world.step(1 / 60);
        // const currentTime = _t % animationDuration;
        // const timePercent = currentTime / animationDuration;
        // Move the particles to locations and fade them out
        onFrame(() => {
          balls.forEach((ball) => {
            const graphic = ball.graphic;
            ball.updatePosition();
            graphic.color = rainbowColor(graphic.center[0], 0, viewSize.width);
          });
        }, interval);
      }, 10);

      return () => {
        stopAnimationLoop(loopId);
      };
    },
  });

  return (
    <SurfaceJSX
      ready={ready.current}
      options={{
        alpha: true,
        antialias: true,
      }}
    >
      <AtlasJSX name="ship" width={4096} height={4096} />
      <SceneJSX name="balls">
        <LayerJSX
          type={ImageLayer}
          providerRef={imageProvider}
          config={{
            atlas: "ship",
            enableRotation: true,
          }}
        />
        <ViewJSX
          name="main"
          type={View2D}
          config={{
            camera: new Camera2D(),
            background: [0, 0, 0, 1],
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          }}
        />
        <LayerJSX type={RectangleLayer} providerRef={rectProvider} />
        <LayerJSX type={EdgeLayer} providerRef={edgeProvider} />
        <LayerJSX type={CircleLayer} providerRef={circleProvider} />
      </SceneJSX>
    </SurfaceJSX>
  );
}).bind({});
