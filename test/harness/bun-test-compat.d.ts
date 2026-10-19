/**
 * Declares `test.failing`, which the suite uses and bun 1.4 has at runtime but
 * bun-types 1.0.29 (pulled in today through devops' `@types/bun` 1.0.8) does
 * not (`jest.setTimeout` is cast in test/stress/scenario.ts instead).
 *
 * DELETE this file when package.json pins a current `@types/bun` (step-04 of
 * DELTAV-62): newer bun-types declare it with a generic `Test<T>`, and this
 * augmentation then fails to merge (TS2428).
 */
import "bun:test";

declare module "bun:test" {
  interface Test {
    /** Inverted test: passes when the body throws or an expectation fails. */
    failing: Test;
  }
}
