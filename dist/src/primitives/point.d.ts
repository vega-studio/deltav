import { Vec2 } from "../util";
export declare class Point {
    static add(p1: Vec2, p2: Vec2, out?: Vec2): Vec2;
    static getClosest(testPoint: Vec2, points: Vec2[]): Vec2;
    static getClosestIndex(testPoint: Vec2, points: Vec2[]): number;
    static subtract(amount: Vec2, from: Vec2, normalize?: boolean): Vec2;
    static getDistance(p1: Vec2, p2: Vec2, squared?: boolean): number;
    static getMidpoint(p1: Vec2, p2: Vec2): [number, number];
    static make(x: number, y: number): {
        x: number;
        y: number;
    };
    static scale(p1: Vec2, s: number, out?: Vec2): Vec2;
    static zero(): Vec2;
}
