import { Instance } from "../../instance-provider/instance";
import { Mat4x4, Vec3, Vec4 } from "../../util";

export class MeshInstance extends Instance {
  position: Vec3 = [0, 0, 0];
  scale: Vec3 = [1, 1, 1];
  quaternion: Vec4 = [0, 0, 0, 1];
  transform: Mat4x4 =
    [1, 0, 0, 0,
     0, 1, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1];
}
