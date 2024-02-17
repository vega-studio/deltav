import { nextFrame } from "./frame";
import { PromiseResolver } from "./promise-resolver";

/**
 * This produces a method that is a gate for methods that may be entered multiple times before a valid dimension occurs.
 * This allows you to reduce the number of times the method is allowed to actually execute (reduced to a single
 * execution) once the dimensions are valid.
 *
 * For example, if we have an init() method that keeps getting called until object is properly initialized, but the
 * object is waiting for valid dimensions from it's container then you can get this pattern to happen:
 *
 * obj.init(); // no valid dimensions
 * obj.init(); // no valid dimensions
 * // dimensions are now valid!
 * obj.init(); // Initializes properly!
 *
 * You will notice an inherent problem or challenge. obj.init() probably contains code that shouldn't execute unless
 * the dimensions are available. Additionally you may see this happen:
 *
 * obj.init(); // no valid dimensions
 * // Nothing else happens
 * // Dimensions are now valid!
 * // obj.init isn't ever going to get called again
 *
 * So you are stuck with needing a robust initializer that can handle being called multiple times, only execute once,
 * and can wait for the dimensions to occur. It's also assumed the most recent init() call should be the one true
 * method call.
 *
 * So we have this method which allows you to make such a robust method:
 *
 * class Obj {
 *   waitToInit = waitForValidDimensions(container);
 *
 *   async init() {
 *     const result = this.waitToInit();
 *     if (!result) return;
 *     // Do your init
 *   }
 * }
 *
 * Now init methods will stack up waiting for the valid dimensions, but upon valid dimensions being available, all the
 * methods will resolve but only the latest init will actually execute as it will be the only one provided a 'true'
 * result.
 */
export function waitForValidDimensions(container?: HTMLElement) {
  // This is the context flag for the operation. This let's us know which resolution is the most recent and is validly
  // waiting for the container to finish
  let waitForSizeContext = 0;
  // We queue up all the resolvers for this context, this way we can resolve all existing gates if the container
  // should change. If we're waiting for a new container with the same context, then we should assume the others that
  // are waiting are no longer valid as only the most recent will resolve as a valid result (which, again, will be
  // against a new container)
  let resolvers: PromiseResolver<boolean>[] = [];

  // This is the gate method that is used to await upon to receive a result from waiting for the dimensions.
  const gate: Function & { cancel: Function } = Object.assign(
    async (otherContainer?: HTMLElement): Promise<boolean> => {
      // Check the input container, if we're suddenly waiting for a new container, the previous contexts should be
      // invalid
      if (otherContainer !== void 0 && otherContainer !== container) {
        resolvers.forEach((r) => r.resolve(false));
        container = otherContainer;
      }

      // If a valid container is not specified, there is no way for this to ever resolve, so we immediately resolve to
      // false.
      if (!container) return false;

      const waitForSizeId = ++waitForSizeContext;
      const resolver = new PromiseResolver<boolean>();
      let box = container.getBoundingClientRect();
      let observer: MutationObserver | undefined;
      resolvers.push(resolver);

      // Check to ensure the box width and height is valid
      if (box.width === 0 || box.height === 0) {
        let observing = true;
        const toWatch = {
          attributes: true,
        };

        // Try to use a DOM concept for waiting for changes to the container
        observer = new MutationObserver((mutationsList) => {
          if (!observing) return;

          for (const mutation of mutationsList) {
            if (mutation.type === "attributes") {
              // Make sure our container context stayed valid
              if (!container) return;
              box = container.getBoundingClientRect();

              if (box.width !== 0 && box.height !== 0) {
                if (observer) {
                  observer.disconnect();
                  observer = void 0;
                }

                observing = false;
                resolver.resolve(waitForSizeId === waitForSizeContext);
              }
            }
          }
        });

        observer.observe(container, toWatch);

        // Give the system an additional way to check for a valid sizing if the observer fails
        await nextFrame();
        box = container.getBoundingClientRect();

        if (observing && box.width !== 0 && box.height !== 0) {
          observer.disconnect();
          observing = false;
          resolver.resolve(waitForSizeId === waitForSizeContext);
        }
      } else {
        // Both calls awaiting a size must be async in order for this method to work
        await nextFrame();
        resolver.resolve(waitForSizeId === waitForSizeContext);
      }

      const result = await resolver.promise;

      // Absolutely make sure the observer is disconnected as the promise can be resolved externally from other processes
      // completing.
      if (observer) {
        observer.disconnect();
        observer = void 0;
      }

      if (result) {
        resolvers.forEach((r) => r.resolve(false));
        resolvers = [];
      }

      return result;
    },

    // We apply a cancel method to allow for a manual forced cancellation of all contexts waiting for the valid
    // dimensions to occur. This allows for proper memory cleansing
    {
      cancel: () => {
        resolvers.forEach((r) => r.resolve(false));
        resolvers = [];
      },
    }
  );

  return gate;
}
