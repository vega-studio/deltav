const times = new Map<string, { t: number; total: number }>();

/**
 * This begins recording how much time it will take.
 */
export function startProfile(id: string) {
  let timer = times.get(id);

  if (!timer) {
    timer = { t: 0, total: 0 };
    times.set(id, timer);
  }

  timer.t = Date.now();
}

/**
 * This stops the timer and adds the discovered time to the current id.
 */
export function endProfile(id: string) {
  const timer = times.get(id);
  if (!timer) return;
  timer.total += Date.now() - timer.t;
}

/**
 * This flushes and prints the profile to the console and resets the total
 * recorded time for the id.
 */
export function flushProfile(id?: string) {
  if (!id) {
    let total = 0;
    times.forEach((timer) => {
      total += timer.total;
    });
    console.error(`Total time: ${total}`);
    times.forEach((timer, id) => {
      console.warn(
        `"${id}" ran for: ${timer.total} impact: ${Math.round(
          (timer.total / total) * 100
        )}%`
      );
    });
    times.clear();
    return;
  }

  const timer = times.get(id);
  if (!timer) return;
  console.warn(`${id} ran for: ${timer.total}`);
  times.delete(id);
}
