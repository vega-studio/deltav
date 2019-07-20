import { IInstanceOptions, Instance } from "../../../instance-provider";
import { Transform } from "../../scene-graph";
export interface IInstance3DOptions extends IInstanceOptions {
    transform: Transform;
}
export declare class Instance3D extends Instance {
    transform: Transform;
    constructor(options: IInstance3DOptions);
}
