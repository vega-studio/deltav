import { BaseDemo } from "./common/base-demo";
import { BasicDemo } from "./demos/basic-demo";
import { KitchenSink } from "./demos/kitchen-sink";
import { NodesEdges } from "./demos/nodes-edges";
import { PhysicsDemo } from "./demos/physics-demo";
import { TextAreaDemo } from "./demos/text-area-demo";
import { TextDemo } from "./demos/text-demo";
import { WordSandDemo } from "./demos/word-sand";

export const demos = new Map<string, BaseDemo>();
export const startDemoKey = localStorage.getItem("deltaV_currentDemo") || "";

demos.set("basic-demo", new BasicDemo());
demos.set("text-area", new TextAreaDemo());
demos.set("text-demo", new TextDemo());
demos.set("nodes-edges", new NodesEdges());
demos.set("word-sand", new WordSandDemo());
demos.set("physics-demo", new PhysicsDemo());
demos.set("kitchen-sink", new KitchenSink());

export const demoKeys = Array.from(demos.keys());
