import { NOOP } from "./no-op";
import { wait } from "./wait";

/**
 * A dubious method to help with dubious times. Used to call for updates during
 * specialized render callbacks like <Route render>.
 */
export async function afterRender(fn: Function = NOOP) {
  await wait(1);
  fn();
}
