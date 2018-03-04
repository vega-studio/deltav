import * as browser from 'bowser';
import { Vector2 } from 'three';
const debug = require('debug')('CommunicationsView:Mouse');

/** Used to adjust the base whee delta for IE browsers */
const IE_ADJUSTMENT = 1 / 30;
/** Used to adjust the rates for IE 11 */
const OLD_IE_ADJUSTMENT = -0.25;
// This determines how large the delta can grow to in firefox
const MAX_FIREFOX_WHEELDELTA = 100;
/**
 * Create a low pass filter memory bank so we can slow down rapid accelerations and let normal slower accelerations pass
 * Common use case for this is the discrepancy in firefox from mousewheels to trackpad scroll speeds
 */
const lowPassY: number[] = [0, 0, 0, 0];
// These coefficients represent the coefficients of a FIR filter.
// This FIR filter uses the lowPassY as the memory for the filter and is created for
// The reasons specified for the lowPassY memory. To edit the coefficients, you simply
// Ensure the coefficients added together === 1.0. If they do not, you may get an unstable
// Result that goes to infinity rather quickly. Changing the distribution of these coefficients
// Alters the rate at which the delta can approach MAX_FIREFOX_WHEELDELTA. Explaining exactly
// How it affects the rate requires an understanding of FIR filters, so unless this is already
// Known knowledge, it would be faster to just tweak the coefficients until a desired effect is
// Attained.
const LOW_PASS_U0 = 0.1;
const LOW_PASS_U1 = 0.2;
const LOW_PASS_U2 = 0.2;
const LOW_PASS_U3 = 0.5;

function normalizeFirefoxWheel(e: React.WheelEvent<HTMLDivElement>) {
  const wheel: WheelEvent = e.nativeEvent as WheelEvent;
  let deltaX = 0;
  let deltaY = 0;

  // Reset the filter if the direction changes to prevent lag in directional change
  if (Math.sign(lowPassY[0]) !== Math.sign(deltaY)) {
    lowPassY.splice(0, lowPassY.length, 0, 0, 0, 0);
  }

  deltaX = wheel.deltaX * MAX_FIREFOX_WHEELDELTA;

  // Calculate the next value output from the FIR filter
  deltaY = (wheel.deltaY * MAX_FIREFOX_WHEELDELTA) * LOW_PASS_U0 + lowPassY[0] * LOW_PASS_U1 + lowPassY[1] * LOW_PASS_U2 + lowPassY[2] * LOW_PASS_U3;
  // Store the value of the filter in the FIR memory bank
  lowPassY.unshift(deltaY);
  // Keep our FIR memory clean and only the size of the number of coefficients
  lowPassY.pop();

  return new Vector2(-deltaX, -deltaY);
}

function normalizeChromeWheel(e: React.WheelEvent<HTMLDivElement>) {
  const wheel: WheelEvent = e.nativeEvent as WheelEvent;

  return new Vector2(wheel.deltaX, -wheel.deltaY);
}

function normalizeIE11Wheel(e: React.WheelEvent<HTMLDivElement>) {
  const wheel: WheelEvent = e.nativeEvent as WheelEvent;
  let deltaX = wheel.deltaX;

  if (deltaX === undefined) {
    deltaX = wheel.wheelDeltaX !== undefined ? wheel.wheelDeltaX * IE_ADJUSTMENT : 0;
  }

  let deltaY = wheel.deltaY;

  if (deltaY === undefined) {
    if (wheel.wheelDeltaY !== undefined) {
      deltaY = wheel.wheelDeltaY * IE_ADJUSTMENT;
    }

    else {
      deltaY = (wheel.wheelDelta || -wheel.detail) * OLD_IE_ADJUSTMENT;
    }
  }

  return new Vector2(-deltaX, -deltaY);
}

function normalizeIE12Wheel(e: React.WheelEvent<HTMLDivElement>) {
  const wheel: WheelEvent = e.nativeEvent as WheelEvent;
  let {deltaX, deltaY} = wheel;

  if (deltaX === undefined) {
    deltaX = wheel.wheelDeltaX !== undefined ? wheel.wheelDeltaX * IE_ADJUSTMENT : 0;
  }

  if (deltaY === undefined) {
    if (wheel.wheelDeltaY !== undefined) {
      deltaY = wheel.wheelDeltaY * IE_ADJUSTMENT;
    }

    else {
      deltaY = wheel.wheelDelta || -wheel.detail;
    }
  }

  const v = new Vector2(deltaX, -deltaY);
  v.multiplyScalar(0.25);

  return v;
}

// Determine this browsers version of wheel normalization and apply it
let normalizeWheel: (e: React.WheelEvent<HTMLDivElement>) => Vector2;

if (browser.firefox) {
  debug('Using mouse wheel for firefox');
  normalizeWheel = normalizeFirefoxWheel;
}

else if (browser.msie && +browser.version >= 11) {
  debug('Using mouse wheel for IE 11');
  normalizeWheel = normalizeIE11Wheel;
}

else if (browser.msedge) {
  debug('Using mouse wheel for MS EDGE');
  normalizeWheel = normalizeIE12Wheel;
}

else {
  debug('Using mouse wheel for Chrome');
  normalizeWheel = normalizeChromeWheel;
}

/**
 * Analyzes a MouseEvent and calculates the mouse coordinates (relative to the element).
 */
function eventElementPosition(e: any, relative?: HTMLElement): {x: number, y: number} {
  let mouseX: number = 0,
      mouseY: number = 0,
      eventX: number = 0,
      eventY: number = 0,
      object: any = relative || e.nativeEvent.target;

  // Get mouse position on document crossbrowser
  if (!e) {
    e = window.event;
  }

  if (e.pageX || e.pageY) {
    mouseX = e.pageX;
    mouseY = e.pageY;
  }

  else if (e.clientX || e.clientY) {
    mouseX = e.clientX + document.body.scrollLeft
             + document.documentElement.scrollLeft;
    mouseY = e.clientY + document.body.scrollTop
             + document.documentElement.scrollTop;
  }

  // Get parent element position in document
  if (object.offsetParent) {
    do {
      eventX += object.offsetLeft;
      eventY += object.offsetTop;
      object = object.offsetParent;
    } while (object);
  }

  // Mouse position minus elm position is mouseposition relative to element:
  return {x: mouseX - eventX, y: mouseY - eventY};
}

export {
  eventElementPosition,
  normalizeWheel,
};
