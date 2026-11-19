/** Selects one of two values using a boolean condition. */
export function Toggled<T>(bool: boolean, value: T): T | undefined;
export function Toggled<T, U>(bool: boolean, value: T, otherwise: U): T | U;
export function Toggled<T, U>(bool: boolean, value: T, otherwise?: U) {
  return bool ? value : otherwise;
}
