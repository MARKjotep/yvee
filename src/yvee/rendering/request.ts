/** Copy/freeze data containers without freezing the caller's graph or cloning services. */
export function snapshotData<T>(value: T, seen = new WeakMap<object, object>()): T {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'function' || typeof value === 'symbol') throw new TypeError('SSR data must be plain data; use dataFactory for request-owned services.');
    return value;
  }
  const previous = seen.get(value);
  if (previous) return previous as T;
  const proto = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && proto !== Object.prototype && proto !== null) {
    throw new TypeError('SSR data must be plain data; use dataFactory for request-owned services.');
  }
  const copy = (Array.isArray(value) ? [] : Object.create(proto)) as Record<PropertyKey, unknown>;
  seen.set(value, copy);
  for (const key of Reflect.ownKeys(value)) {
    if (Array.isArray(value) && key === 'length') continue;
    const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
    if (!('value' in descriptor)) throw new TypeError('SSR data must not contain accessors.');
    Object.defineProperty(copy, key, { value: snapshotData(descriptor.value, seen), enumerable: descriptor.enumerable ?? false, configurable: true, writable: true });
  }
  if (Array.isArray(value)) (copy as unknown as unknown[]).length = value.length;
  return Object.freeze(copy) as T;
}
