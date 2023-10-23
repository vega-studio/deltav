export function wait(t: number): Promise<void> {
  return new Promise((r) => setTimeout(r, t));
}
