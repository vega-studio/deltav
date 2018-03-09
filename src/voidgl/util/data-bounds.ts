import { Bounds } from '../primitives/bounds';

export class DataBounds<T> extends Bounds {
  data: T;

  static emptyBounds<T>() {
    return new DataBounds<T>({
      height: 0,
      width: 0,
      x: 0,
      y: 0,
    });
  }
}
