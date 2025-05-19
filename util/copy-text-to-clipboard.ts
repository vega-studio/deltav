function fallbackWindowPrompt(text: string) {
  window.prompt(
    "Use your copy hotkey to copy the text, then press enter to dismiss this message",
    text
  );
}

function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand("copy");
    if (!successful) fallbackWindowPrompt(text);
  } catch (_err) {
    fallbackWindowPrompt(text);
  }

  document.body.removeChild(textArea);
}

/**
 * The intent of this function is to provide the most reliable means to copy
 * text to the clipboard. This provides some attempts ranging far back for older
 * browser support and even falls back to a window prompt if everything
 * automatic fails.
 */
export async function copyTextToClipboard(text: string) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }

  await navigator.clipboard.writeText(text).then(
    function () {
      // SUCCESS!
    },
    function () {
      fallbackWindowPrompt(text);
    }
  );
}
