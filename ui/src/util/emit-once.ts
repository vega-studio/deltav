let toEmit: { [key: string]: [(...args: any[]) => void, number, number] } = {};

export function emitOnce(
  id: string,
  callback: (calledCountBeforeEmit: number, id: string) => void
) {
  const emit = toEmit[id] || [callback, -1, 0];
  toEmit[id] = emit;
  emit[2]++;

  clearTimeout(emit[1]);
  emit[1] = window.setTimeout(() => {
    callback(emit[2], id);
    delete toEmit[id];
  }, 1);
}

export function flushEmitOnce() {
  for (const id in toEmit) {
    const emit = toEmit[id];
    clearTimeout(emit[1]);
    emit[0](emit[2], id);
  }

  toEmit = {};
}
