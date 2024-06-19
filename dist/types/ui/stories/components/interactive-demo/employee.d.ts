import { type Color, type InstanceProvider, RectangleInstance, type Vec2 } from "../../../src";
export interface IGrid {
    gridW: number;
    gridH: number;
    cellW: number;
    cellH: number;
    gap: number;
    complete: boolean[][];
    finished: boolean[][];
    TL: Vec2;
    provider: InstanceProvider<RectangleInstance>;
    completionBoxes: Map<number, Map<number, RectangleInstance>>;
    grid: RectangleInstance[][];
}
export declare class Employee {
    cellX: number;
    cellY: number;
    color: Color;
    taskColumn: number;
    taskDuration: number;
    speed: number;
    instance: RectangleInstance;
    constructor(color: Color, taskColumn: number, taskDuration: number);
    takeTask(grid: IGrid): Promise<void>;
    completeTask(grid: IGrid): Promise<void>;
    /** Makes the employee do tasks until there is nothing left to complete */
    work(grid: IGrid): Promise<() => void>;
}
