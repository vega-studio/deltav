import { BaseDemo } from "./common/base-demo";
import { KitchenSink } from "./kitchen-sink";
import { NodesEdges } from "./nodes-edges";
import { PhysicsDemo } from "./physics-demo";
import { TextDemo } from "./text-demo";
import { WordSandDemo } from "./word-sand";

export const demos = new Map<string, BaseDemo>();
export const startDemoKey = localStorage.getItem("deltaV_currentDemo") || "";

demos.set("text-demo", new TextDemo());
demos.set("nodes-edges", new NodesEdges());
demos.set("word-sand", new WordSandDemo());
demos.set("physics-demo", new PhysicsDemo());
demos.set("kitchen-sink", new KitchenSink());

export const demoKeys = Array.from(demos.keys());
