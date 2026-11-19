import { validateAttribute } from "@/dom/render/trust.dom";
import type { Elements } from "@/$/query.$";
import { Ref } from "@/core/ref.core";
import { Stateful } from "@/core/state/stateful.core";
import { CATT } from "@/dom/render/cat.dom";
import { isArray, isObject, isPlainObject, oItems } from "@/utils";
import type { EAttr } from "./types.dom";
import { attr_value, dom_attr_value, isBooleanAttribute } from "./value.dom";

export * from "./types.dom";
export * from "./events.dom";
export * from "./style.dom";
export { attr_value } from "./value.dom";

const isValidAttributeName = (name: string) =>
  /^[A-Za-z_:][A-Za-z0-9:._-]*$/.test(name);
const isValidStyleName = (name: string) =>
  /^(?:--[A-Za-z0-9_-]+|-?[A-Za-z][A-Za-z0-9-]*)$/.test(name);

function Callback(attr: string, pre?: string) {
  switch (pre ?? attr) {
    case "style":
      return function (this: Elements, value: unknown) {
        this.style.setProperty(attr, dom_attr_value(value));
      };
    default:
      return function (this: Elements, value: unknown) {
        if (
          isBooleanAttribute(attr) &&
          (typeof value === "boolean" || value == null)
        ) {
          this.toggleAttribute(attr, value === true);
          return;
        }
        const text = dom_attr_value(value);
        validateAttribute(attr, text);
        this.setAttribute(attr, text);
      };
  }
}

export class ATTR {
  constructor(public attr: EAttr = {}) {}
  get(catt: CATT, attr: EAttr = this.attr, pre?: string) {
    const processValue = (k: string, v: any) => {
      if (
        pre !== "style" &&
        isBooleanAttribute(k) &&
        (v === false || v === null)
      ) {
        return;
      }
      if (pre !== "style" && !(v instanceof Stateful) && !isObject(v)) validateAttribute(k, dom_attr_value(v));
      //
      if (isArray(v)) {
        if (!pre) validateAttribute(k, dom_attr_value(v));
        catt.attr_push(k, attr_value(v), pre);
      } else if (v instanceof Stateful) {
        const entry = pre ? `${pre}_${k}` : k;
        catt.states.push(
          v.call(Callback(k, pre) as (this: Elements, arg: any) => void, entry),
        );

        processValue(k, v.value);
      } else if (isObject(v)) {
        if (isPlainObject(v) && !pre) {
          this.get(catt, v as any, k);
        }
      } else {
        catt.attr_push(k, attr_value(v), pre);
      }
    };

    oItems(attr).forEach(([k, v]) => {
      const ok = String(k);
      if (!(pre === "style" ? isValidStyleName(ok) : isValidAttributeName(ok))) {
        return;
      }
      if (ok === "id" && v !== undefined) {
        catt.setId(dom_attr_value(v instanceof Stateful ? v.value : v));
      }
      if (ok === "ref") {
        if (v instanceof Ref) {
          catt.events.obj({
            element() {
              v.element = this;
            },
          });
        }
      } else if (["on"].includes(ok)) {
        isObject(attr.on) && catt.events.obj(attr.on);
      } else {
        if (v === undefined) return;
        processValue(ok, v);
      }
    });
  }
  unload<T>(x: string): T | undefined {
    let value: unknown;
    if (x in this.attr) {
      value = this.attr[x as keyof EAttr];
      delete this.attr[x as keyof EAttr];
    }
    return value as T | undefined;
  }
}


