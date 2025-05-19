import { normalizeWheel } from "../../../util/normalize-wheel/index.js";
import { Vec2 } from "../math/vector.js";

/**
 * Analyzes a MouseEvent and calculates the mouse coordinates (relative to the element).
 */
function eventElementPosition(e: any, relative?: HTMLElement): Vec2 {
  let mouseX = 0,
    mouseY = 0,
    eventX = 0,
    eventY = 0,
    object: any =
      relative || (e.nativeEvent && e.nativeEvent.target) || e.target;

  // Get mouse position on document crossbrowser
  if (!e) {
    e = window.event;
  }

  if (e.pageX || e.pageY) {
    mouseX = e.pageX;
    mouseY = e.pageY;
  } else if (e.clientX || e.clientY) {
    let scrollLeft = 0;
    let scrollTop = 0;

    if (document.documentElement) {
      scrollLeft = document.documentElement.scrollLeft;
      scrollTop = document.documentElement.scrollTop;
    }

    mouseX = e.clientX + document.body.scrollLeft + scrollLeft;
    mouseY = e.clientY + document.body.scrollTop + scrollTop;
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
  return [mouseX - eventX, mouseY - eventY];
}

export { eventElementPosition, normalizeWheel };
