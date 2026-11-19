import { isFunction } from "@/utils";
import type { DOMAttr, DOMContext, DOMComponent } from "./contracts.dom";
import type { maybePromise } from "@/utils";

export class DOM {
  constructor(
    public tag: string,
    public attr: DOMAttr,
    public ctx: DOMContext[],
  ) {
    if (tag && !/^[A-Za-z][A-Za-z0-9._:-]*$/.test(tag)) {
      throw new TypeError(`Invalid DOM tag name: ${tag}`);
    }
  }
}

export async function dom(
  tag: string | DOMComponent,
  attr: DOMAttr | null = {},
  ...ctx: DOMContext[]
): Promise<DOM> {
  if (isFunction(tag)) {
    return await tag(attr ?? {}, ...ctx);
  }
  return new DOM(tag, attr ?? {}, ctx);
}

export const frag = async (_attr: DOMAttr, ...ctx: DOMContext[]): Promise<DOM> =>
  new DOM("", {}, ctx);
