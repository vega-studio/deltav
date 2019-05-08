/**
 * This is a convenience object for creating a promise and retrieving it's resolve method for
 * later use in resolving a situation. Very handy for making a method asynchronous.
 */
export class PromiseResolver<T> {
  resolver: (val: T | undefined) => void;
  rejector: Function;
  promise: Promise<T>;

  constructor() {
    this.promise = new Promise(
      (resolve, reject) => ((this.resolver = resolve), (this.rejector = reject))
    );
  }

  resolve(val?: T) {
    this.resolver(val);
  }

  reject() {
    this.rejector;
  }
}
