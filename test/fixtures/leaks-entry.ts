// Loaded by index.html in its own module script before host.tsx, so the leak
// instrument wraps WebGL and the listener methods before any fixture import
// loads deltav (Vite hoists host.tsx's fixture glob imports above its own).
import "../harness/leaks-page.js";
