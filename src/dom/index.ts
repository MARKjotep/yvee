import { idm, isFN, readOnly, V } from "../@";
import { ATTR } from "./attr";
import { CATT } from "../oz";
import { CTX } from "./context";
import { Stateful } from "../stateful";
import { Elements } from "../storage";
import { hookFN } from "../stateful/hook";
import { _useElement } from "../$";

export { attr_value } from "./attr";
/*
-------------------------
TYPES
-------------------------
*/
type X2 = V | V[];

export type X3 = X2 | Stateful<X2> | null | undefined;

export type CSSinT = {
  [P in keyof CSSStyleDeclaration]?: X3;
} & {
  [key: string]: X3;
};

export interface c_events<T extends Elements = Elements> {
  state?: (
    this: T,
    e: T,
  ) => [(...args: any[]) => void, Stateful<any>[], boolean?];
  ready?: (this: T, e: T) => void;
  resize?: (this: T, e: UIEvent) => void;
  beforeunload?: (this: T, e: BeforeUnloadEvent) => void;
  popstate?: (this: T, e: PopStateEvent) => void;
  winscroll?: (this: T, e: Event) => void;
  winload?: (this: T, e: Event) => void;
  winfocus?: (this: T, e: Event) => void;
  winblur?: (this: T, e: Event) => void;
}

type XU4 = V | undefined | XU4[];

export interface baseAttr {
  style?: CSSinT | string;
  on?: events<any>;
  id?: string;
  class?: XU4 | Stateful<X2>;
  ref?: _useElement;
}

export class Dom {
  declare private attr: ATTR;
  declare private ctx: CTX;
  constructor(
    public tag: string,
    attr: attr = {},
    ...ctx: ctx[]
  ) {
    readOnly(this, {
      attr: new ATTR(attr),
      ctx: new CTX(tag, ctx),
    });
  }
  __(pid = new idm()) {
    const id = pid.mid;
    const catt = new CATT(id, pid);
    this.attr.get(catt);

    return {
      ctx: this.ctx.get(catt),
      oz: catt.OZ.set(catt),
      id: catt.id,
    };
  }
}

export function dom(
  tag: string | ((attr: attr, ...ctx: ctx[]) => Dom),
  attr: attr | null = {},
  ...ctx: ctx[]
) {
  // Process the ctx here to lessen the time -- convert them all to flat array?
  //
  if (isFN(tag)) {
    return tag(attr ?? {}, ...ctx);
  }
  // if ctx is array, flatten or use rest operator
  return new Dom(tag, attr ?? {}, ctx);
}

export const frag = (attr: attr, ...dom: Dom[]): Dom[] => dom;

/*
  -------------------------
  
  -------------------------
  */
//
