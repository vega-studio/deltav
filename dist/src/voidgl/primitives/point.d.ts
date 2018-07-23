export interface IPoint {
    x: number;
    y: number;
}
export declare class Point {
    static add(p1: IPoint, p2: IPoint, out?: IPoint): IPoint;
    static getClosest(testPoint: IPoint, points: IPoint[]): IPoint;
    static getClosestIndex(testPoint: IPoint, points: IPoint[]): number;
    static subtract(amount: IPoint, from: IPoint, normalize?: boolean): IPoint;
    static getDistance(p1: IPoint, p2: IPoint, squared?: boolean): number;
    static getMidpoint(p1: IPoint, p2: IPoint): {
        x: number;
        y: number;
    };
    static make(x: number, y: number): {
        x: number;
        y: number;
    };
    static scale(p1: IPoint, s: number, out?: IPoint): IPoint;
    static zero(): IPoint;
}
