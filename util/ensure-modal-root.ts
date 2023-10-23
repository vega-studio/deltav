/** This is the id to be used to specify the modal root. */
const modalRootId = "__modal_root__";

/**
 * This guarantees the modal root to exist at the body root level
 */
export function ensureModalRoot(customId?: string) {
  let modalRoot: HTMLDivElement | null = null;
  const root = document.getElementById(customId || modalRootId);

  if (root instanceof HTMLDivElement) {
    modalRoot = root;
  } else {
    const body = document.getElementsByTagName("body")[0];
    modalRoot = document.createElement("div");

    if (body && modalRoot) {
      body.appendChild(modalRoot);
    }
  }

  if (modalRoot) {
    modalRoot.setAttribute(
      "style",
      `
      position: fixed;
      top: 0px;
      left: 0px;
      width: 100%;
      z-index: 999999;
    `
    );

    // Allows make sure the ensured modal is on top. THis helps with layering
    // modal roots for things like tooltips/dropdowns on top of modals etc.
    if (document.body.lastChild !== modalRoot) {
      document.body.appendChild(modalRoot);
    }

    modalRoot.id = customId || modalRootId;
  }

  return modalRoot;
}
