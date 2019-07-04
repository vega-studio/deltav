import assert from 'assert';
import { describe, it } from 'mocha';
import { compare1, compare2, compare3, compare4, toString1, toString2, toString3, toString4, Vec1, Vec2, Vec3, Vec4 } from '../src/util/vector';

function fail1(actual: Vec1, expected: Vec1): string {
  return `\n\nACTUAL: ${toString1(actual)}\nEXPECTED: ${toString1(expected)}`;
}

function fail2(actual: Vec2, expected: Vec2): string {
  return `\n\nACTUAL: ${toString2(actual)}\nEXPECTED: ${toString2(expected)}`;
}

function fail3(actual: Vec3, expected: Vec3): string {
  return `\n\nACTUAL: ${toString3(actual)}\nEXPECTED: ${toString3(expected)}`;
}

function fail4(actual: Vec4, expected: Vec4): string {
  return `\n\nACTUAL: ${toString4(actual)}\nEXPECTED: ${toString4(expected)}`;
}

export function assert1(actual: Vec1, expected: Vec1, shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(compare1(actual, expected), true, fail1(actual, expected));
  }

  else {
    assert.equal(!compare1(actual, expected), true, fail1(actual, expected));
  }
}

export function assert2(actual: Vec2, expected: Vec2, shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(compare2(actual, expected), true, fail2(actual, expected));
  }

  else {
    assert.equal(!compare2(actual, expected), true, fail2(actual, expected));
  }
}

export function assert3(actual: Vec3, expected: Vec3, shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(compare3(actual, expected), true, fail3(actual, expected));
  }

  else {
    assert.equal(!compare3(actual, expected), true, fail3(actual, expected));
  }
}

export function assert4(actual: Vec4, expected: Vec4, shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(compare4(actual, expected), true, fail4(actual, expected));
  }

  else {
    assert.equal(!compare4(actual, expected), true, fail4(actual, expected));
  }
}

describe('Vector Library', () => {

});
