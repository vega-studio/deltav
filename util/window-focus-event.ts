/**
 * Handles setting up a window focus and blur event that detects when the user's
 * browser window with this application is available or not.
 *
 * Returns a disposer method to deregister the event
 */
export function windowFocusEvents(
  onFocus: (...args: any[]) => void,
  onBlur: (...args: any[]) => void
): () => void {
  let hidden = "hidden";

  // Standards:
  if (hidden in document) {
    document.addEventListener("visibilitychange", onchange);
  } else if ((hidden = "mozHidden") in document) {
    document.addEventListener("mozvisibilitychange", onchange);
  } else if ((hidden = "webkitHidden") in document) {
    document.addEventListener("webkitvisibilitychange", onchange);
  } else if ((hidden = "msHidden") in document) {
    document.addEventListener("msvisibilitychange", onchange);
  }
  // IE 9 and lower:
  else if ("onfocusin" in document) {
    (document as any).onfocusin = (document as any).onfocusout = onchange;
  }
  // All others:
  else {
    window.onpageshow =
      window.onpagehide =
      window.onfocus =
      window.onblur =
        onchange;
  }

  function onchange(this: any, evt: Event) {
    const v = "visible";
    const h = "hidden";
    let result: "visible" | "hidden";

    const evtMap: Record<string, "visible" | "hidden"> = {
      focus: v,
      focusin: v,
      pageshow: v,
      blur: h,
      focusout: h,
      pagehide: h,
    };

    evt = evt || window.event;

    if (evt.type in evtMap) {
      result = evtMap[evt.type as keyof typeof evtMap];
    } else {
      result = this[hidden] ? "hidden" : "visible";
    }

    if (result === "visible") {
      onFocus();
    } else if (result === "hidden") {
      onBlur();
    }
  }

  return () => {
    document.removeEventListener("visibilitychange", onchange);
    document.removeEventListener("mozvisibilitychange", onchange);
    document.removeEventListener("webkitvisibilitychange", onchange);
    document.removeEventListener("msvisibilitychange", onchange);
    (document as any).onfocusin = (document as any).onfocusout = null;
    window.onpageshow = window.onpagehide;
  };
}
