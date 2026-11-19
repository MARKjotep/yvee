import { isPlainObject } from "@/utils";

export type Equality<T> = (previous: T, next: T) => boolean;

/** Compares own enumerable keys of records/arrays, using Object.is for values. */
export function shallowEqual<T>(previous: T, next: T): boolean {
  if (Object.is(previous, next)) return true;
  const arrays = Array.isArray(previous) && Array.isArray(next);
  if (!arrays && !(isPlainObject(previous) && isPlainObject(next))) return false;
  if (Object.getPrototypeOf(previous) !== Object.getPrototypeOf(next)) return false;
  if (arrays && (previous as unknown[]).length !== (next as unknown[]).length) return false;
  const keys = (value: object) => Reflect.ownKeys(value).filter(
    (key) => Object.prototype.propertyIsEnumerable.call(value, key),
  );
  const left = previous as object;
  const right = next as object;
  const leftKeys = keys(left);
  return leftKeys.length === keys(right).length && leftKeys.every((key) =>
    Object.prototype.propertyIsEnumerable.call(right, key) &&
    Object.is(Reflect.get(left, key), Reflect.get(right, key)),
  );
}
