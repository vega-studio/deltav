export function getCallableValue<T>(n: T | (() => T)) {
  return typeof n === "function" ? (n as Function)() : n;
}
