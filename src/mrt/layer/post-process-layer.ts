import { Instance } from "../../instance-provider";
import { ILayerProps, Layer } from "../../surface";
import { IShaderInitialization } from "../../types";

class PostProcessInstance extends Instance {

}

export interface IPostProcessLayer extends ILayerProps<PostProcessInstance> {
  /** List of textures to take in to read from */
  textures: string[];
}

export class PostProcessLayer extends Layer<PostProcessInstance, IPostProcessLayer> {
  initShader(): IShaderInitialization<PostProcessInstance> {

  }
}
