export type V = string | number | boolean;

export type CSSStyle = Record<
  string,
  V | null | undefined | { readonly value: unknown }
>;

export const isFunction = (value: unknown): value is (...args: any[]) => any =>
  typeof value === "function";

export const isNumber = (value: unknown): value is number =>
  typeof value === "number" && !Number.isNaN(value);

export const oAss = Object.assign;

export const oItems = <T extends object>(value: T) =>
  Object.entries(value) as Array<[keyof T, T[keyof T]]>;

export const reCamel = (value: string) => {
  if (value.startsWith("webkit")) value = `-${value}`;
  return value.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
};

const booleanAttributes = new Set([
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "inert",
  "ismap",
  "itemscope",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected",
]);

export const isBooleanAttribute = (name: string) =>
  booleanAttributes.has(name.toLowerCase());

export const toAttributeValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== undefined).join(" ");
  }
  if (typeof value === "function") return toAttributeValue(value());
  if (value === undefined || value === null) return "";
  if (typeof value === "boolean") return value ? "" : "false";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value) ?? "";
    } catch {
      return String(value);
    }
  }
  return String(value);
};

export const isStateValue = (
  value: unknown,
): value is { readonly value: unknown } =>
  typeof value === "object" && value !== null && "value" in value;
