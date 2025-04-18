import {
  isArr,
  isBool,
  isFN,
  isObj,
  isPlainObject,
  ngify,
  oItems,
  V,
} from "../../@";
import { Elements } from "../../storage";
import { CATT } from "../../oz";
import { Stateful } from "../../stateful";
import { Ref } from "../../$";

/*
-------------------------

-------------------------
*/
export const attr_value = (v: any): string => {
  if (isArr(v)) {
    return v.filter((f) => f !== undefined).join(" ");
  } else if (isObj(v)) {
    if (isPlainObject(v)) {
      return ngify(v);
    }
  } else if (isFN(v)) {
    return attr_value((v as any)());
  } else if (v !== undefined && v !== null) {
    return isBool(v) ? (v ? "" : "false") : String(v);
  }
  return "";
};

function Callback(attr: string, pre?: string) {
  switch (pre ?? attr) {
    case "style":
      return function (this: Elements, e: string) {
        this.style.setProperty(attr, e);
      };
    default:
      return function (this: HTMLElement, e: any) {
        this.setAttribute(attr, e);
      };
  }
}

export class ATTR {
  constructor(public attr: attr = {}) {}
  get(catt: CATT, attr: attr = this.attr, pre?: string) {
    //
    const processValue = (k: string, v: any) => {
      //
      if (isArr(v)) {
        catt.attr_push(k, attr_value(v));
      } else if (v instanceof Stateful) {
        const entry = pre ? `${pre}_${k}` : k;
        //
        catt.states.push(
          v.call(Callback(k, pre) as (this: Elements, arg: any) => void, entry),
        );

        processValue(k, v.value);
        //
      } else if (isObj(v)) {
        if (isPlainObject(v) && !pre) {
          this.get(catt, v, k);
        }
      } else {
        catt.attr_push(k, attr_value(v), pre);
      }
    };
    oItems(attr).forEach(([k, v]) => {
      if (k === "ref") {
        if (v instanceof Ref) {
          catt.events.obj({
            element() {
              v.element = this;
            },
          });
        }
      } else if (["on"].includes(k)) {
        isObj(attr.on) && catt.events.obj(attr.on);
      } else {
        processValue(k, v);
      }
    });
  }
}
