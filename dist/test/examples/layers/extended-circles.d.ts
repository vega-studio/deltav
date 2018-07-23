import { CircleInstance, CircleLayer, ICircleLayerProps, IShaderInitialization } from "../../../src";
export interface IExtendedCirclesProps extends ICircleLayerProps<CircleInstance> {
    dimming?: number;
}
export declare class ExtendedCircles extends CircleLayer<CircleInstance, IExtendedCirclesProps> {
    static defaultProps: IExtendedCirclesProps;
    initShader(): IShaderInitialization<CircleInstance>;
}
