let depth = 0;
const pending = new Set<() => void>();

export function scheduleState(dispatch: () => void) {
  if (depth) pending.add(dispatch);
  else dispatch();
}

/** Synchronous, nestable batching. Values change immediately; subscribers see the final values. */
export function batch<T>(callback: () => T): T {
  depth++;
  try {
    const result = callback();
    if (result && typeof (result as unknown as PromiseLike<unknown>).then === 'function') {
      void Promise.resolve(result).catch(() => {});
      throw new TypeError('batch callbacks must be synchronous.');
    }
    return result;
  } finally {
    if (--depth === 0) {
      const jobs = [...pending]; pending.clear();
      for (const dispatch of jobs) dispatch();
    }
  }
}
