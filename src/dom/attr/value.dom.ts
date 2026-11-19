import { escapeHTML } from "@/dom/render/escape.dom";
import { isArray, isBoolean, isFunction, isPlainObject, ngify } from "@/utils";

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

/** Converts an attribute value for inclusion in generated HTML. */
export const attr_value = (value: unknown): string => {
  if (isArray(value)) {
    return escapeHTML(value.filter((item) => item !== undefined).join(" "));
  }
  if (isPlainObject(value)) return escapeHTML(ngify(value));
  if (isFunction(value)) return attr_value(value());
  if (value === undefined || value === null) return "";
  return isBoolean(value)
    ? value
      ? ""
      : "false"
    : escapeHTML(String(value));
};

/** Converts a value for Element.setAttribute; DOM APIs do not need HTML escaping. */
export const dom_attr_value = (value: unknown): string => {
  if (isArray(value)) {
    return value.filter((item) => item !== undefined).join(" ");
  }
  if (isPlainObject(value)) return ngify(value);
  if (isFunction(value)) return dom_attr_value(value());
  if (value === undefined || value === null) return "";
  return isBoolean(value) ? (value ? "" : "false") : String(value);
};
