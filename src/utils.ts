export type V = string | number | boolean;
export type maybePromise<T> = T | Promise<T>;

export const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";
export const isArray = <T = unknown>(value: unknown): value is T[] =>
  Array.isArray(value);
export const isFunction = (value: unknown): value is (...args: any[]) => any =>
  typeof value === "function";
export const isObject = (value: unknown): value is object =>
  value !== null && typeof value === "object";
export const isPlainObject = (
  value: unknown,
): value is Record<PropertyKey, unknown> =>
  isObject(value) &&
  (Object.getPrototypeOf(value) === Object.prototype ||
    Object.getPrototypeOf(value) === null);

export class Mapper<K, V> extends Map<K, V> {
  obj(value?: object | null) {
    if (value) {
      Object.entries(value).forEach(([key, item]) => this.set(key as K, item as V));
    }
    return this;
  }

  init(key: K, value: V): V {
    if (!this.has(key)) this.set(key, value);
    return this.get(key)!;
  }
}

export const keyInMap = <T>(key: string, map: Mapper<string, any>): T => {
  if (!map.has(key)) map.set(key, new Mapper());
  return map.get(key) as T;
};

export const keyInMapArray = <T>(key: string, map: Mapper<string, any>): T => {
  if (!map.has(key)) map.set(key, []);
  return map.get(key) as T;
};

export const oItems = <T extends object>(value: T) =>
  Object.entries(value) as Array<[keyof T, T[keyof T]]>;
export const ngify = (value: object) => JSON.stringify(value);

export const reCamel = (value: string) => {
  if (value.startsWith("webkit")) value = `-${value}`;
  return value.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
};

export const makeID = (length: number) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  return Array.from({ length }, (_, index) => {
    const chars = letters + (index ? digits : "");
    return chars.charAt(Math.floor(Math.random() * chars.length));
  }).join("");
};

