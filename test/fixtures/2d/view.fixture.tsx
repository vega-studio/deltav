import React from "react";

import { registerFixture } from "../fixture-registry.js";
import { rectangleKind, type RectSpec } from "./rectangle.fixture.js";
import { type IScene2DProps, Scene2D } from "./scene.js";

/**
 * View fixture: rectangles (ScaleMode.ALWAYS, anchored top-left) seen through
 * the `views` of the props, each with its own viewport and Camera2D offset
 * and scale, all rendering the same root layers.
 */
const ViewFixture: React.FC<IScene2DProps<RectSpec>> = (props) => (
  <Scene2D {...props} kind={rectangleKind} />
);

registerFixture("2d/view", ViewFixture);
