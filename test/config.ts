import { BaseDemo } from './common/base-demo';
import { BasicDemo } from './demos/basic-demo';
import { BasicDemo3D } from './demos/basic-demo-3d';
import { CubeDemo3D } from './demos/cube-demo-3d';
import { EaseDemo } from './demos/ease-demo';
import { KitchenSink } from './demos/kitchen-sink';
import { NodesEdges } from './demos/nodes-edges';
import { PhysicsDemo } from './demos/physics-demo';
import { QuatEaseDemo } from './demos/quat-ease-demo';
import { TextAreaDemo } from './demos/text-area-demo';
import { TextDemo } from './demos/text-demo';
import { TouchDemo } from './demos/touch-demo';
import { VideoDemo } from './demos/video-demo';
import { WordSandDemo } from './demos/word-sand';

interface IDemoCtor {
  new (): BaseDemo;
}

export const demos = new Map<string, IDemoCtor>();
export const startDemoKey = localStorage.getItem('deltaV_currentDemo') || '';

demos.set('basic-demo', BasicDemo);
demos.set('basic-demo-3d', BasicDemo3D);
demos.set('cube-demo-3d', CubeDemo3D);
demos.set('text-area', TextAreaDemo);
demos.set('text-demo', TextDemo);
demos.set('nodes-edges', NodesEdges);
demos.set('word-sand', WordSandDemo);
demos.set('physics-demo', PhysicsDemo);
demos.set('kitchen-sink', KitchenSink);
demos.set('touch-demo', TouchDemo);
demos.set('video-demo', VideoDemo);
demos.set('ease-demo', EaseDemo);
demos.set('quat-ease-demo', QuatEaseDemo);

export const demoKeys = Array.from(demos.keys());
