/**
 * Method for current and older browsers to detect current selected text.
 */
export function getSelectedText() {
  let text = "";

  if (typeof window.getSelection !== "undefined") {
    text = window.getSelection()?.toString() || "";
  } else if (
    typeof (document as any).selection !== "undefined" &&
    (document as any).selection.type === "Text"
  ) {
    text = (document as any).selection.createRange().text;
  }

  return text;
}
