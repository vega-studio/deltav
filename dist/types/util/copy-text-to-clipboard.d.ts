/**
 * The intent of this function is to provide the most reliable means to copy
 * text to the clipboard. This provides some attempts ranging far back for older
 * browser support and even falls back to a window prompt if everything
 * automatic fails.
 */
export declare function copyTextToClipboard(text: string): Promise<void>;
