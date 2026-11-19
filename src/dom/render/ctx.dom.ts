import { inlineContent } from "./trust.dom";
import { Wizard } from "./oz.dom";
import { Stateful, type StateUpdate } from "@/core/state/stateful.core";
import { dom, DOM } from "./node.dom";
import { CATT } from "./cat.dom";
import { isArray, isFunction, isObject, ngify } from "@/utils";
import { Idm } from "./idm.dom";
import type { Elements } from "@/$/query.$";
import type { DOMContext } from "./contracts.dom";
import { escapeHTML } from "./escape.dom";

type NestedDOMRenderer = (
  node: DOM,
  parentId: Idm,
) => Promise<{ ctx: string; oz: CATT["OZ"] }>;

let renderNestedDOM: NestedDOMRenderer | undefined;

export const setNestedDOMRenderer = (renderer: NestedDOMRenderer) => {
  renderNestedDOM = renderer;
};

const TAGS = [
  "area",
  "base",
  "br",
  "col",
  "command",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
];
const hasTag = (tag: string) => TAGS.includes(tag.toLowerCase());

const ctx_value = async (value: unknown, catt: CATT): Promise<string> => {
  const cc = await Promise.resolve(value);

  if (isArray(cc)) {
    const results: string[] = [];
    for (const c of cc) {
      results.push(await ctx_value(c, catt));
    }
    return results.join("");
  } else if (cc instanceof DOM) {
    if (!renderNestedDOM) {
      throw new Error("The DOM renderer has not been initialized.");
    }
    const { ctx, oz } = await renderNestedDOM(cc, catt.IDM);

    catt.OZ.push(oz);
    return ctx;
  } else if (isObject(cc)) {
    if (cc instanceof Set) {
      return escapeHTML([...cc].join(" "));
    }
    return escapeHTML(ngify(cc));
  } else if (isFunction(cc)) {
    return await ctx_value((cc as any)(), catt);
  } else if (cc !== undefined && cc !== null) {
    return escapeHTML(cc);
  }
  return "";
};

export const processCTXStateful = async (value: unknown, xid?: string, nonce?: string) => {
  const ndm = xid ? Idm.fromId(xid, nonce) : new Idm(undefined, 0, nonce);
  const catt = new CATT(ndm.id, ndm);
  const ctx = await ctx_value(value, catt);
  return { ctx, catt };
};

async function Callback(this: Elements, arg: DOMContext, nonce?: string, update?: StateUpdate) {
  const elementId = this.id;
  if (elementId) {
    const { ctx, catt } = await processCTXStateful(arg, elementId, nonce);
    if (update && !update.isCurrent()) return false;
    if (this.innerHTML !== ctx) {
      this.innerHTML = ctx;
      await Wizard.RPS(catt.OZ, update?.isCurrent);

      return true;
    }
  }

  return false;
}

export const processCTX = async (
  v: DOMContext,
  len: number,
  catt: CATT,
  inner: string[] = [],
) => {
  if (isArray<DOMContext>(v)) {
    for (const vv of v) {
      await processCTX(vv, v.length, catt, inner);
    }
  } else if (v instanceof Stateful) {
    if (len > 1) {
      await processCTX(
        await dom("div", {}, v),
        len,
        catt,
        inner,
      );
    } else {
      const VL = v.value;
      const entry = VL instanceof DOM ? "dom" : "ctx";
      const { ctx, catt: _ct } = await processCTXStateful(VL, catt.xid + "-0", catt.IDM.nonce);
      catt.xid = _ct.xid;

      inner.push(ctx);
      catt.OZ.push(_ct.OZ);
      catt.states.push(v.call(function (this: Elements, arg: DOMContext, update: StateUpdate) { return Callback.call(this, arg, catt.IDM.nonce, update); }, entry));
    }
  } else {
    inner.push(await ctx_value(v, catt));
  }
};

export class CTX {
  closing: string;
  constructor(
    public tag: string = "",
    public ctx: DOMContext[],
  ) {
    const selfClosing = hasTag(tag);
    this.closing = selfClosing ? "" : `</${tag}>`;
  }
  private async process(
    catt: CATT,
    ctx: DOMContext[] = this.ctx,
    inner: string[] = [],
  ) {
    for (const ct of ctx) {
      await processCTX(await Promise.resolve(ct), ctx.length, catt, inner);
    }
    return inner.join("");
  }
  async get(catt: CATT) {
    const elementId = catt.xid;
    let ctx: string;
    const rawTag = this.tag.toLowerCase();
    if (rawTag === "script" || rawTag === "style") {
      const flatten = async (value: unknown): Promise<string> => {
        const resolved = await value;
        if (Array.isArray(resolved)) return (await Promise.all(resolved.map(flatten))).join("");
        if (typeof resolved === "function") return flatten(resolved());
        if (resolved == null) return "";
        if (typeof resolved !== "string" && typeof resolved !== "number") throw new TypeError("Inline script/style children must be static text.");
        return String(resolved);
      };
      ctx = inlineContent(rawTag, await flatten(this.ctx));
    } else ctx = await this.process(catt);

    if (!this.tag) return ctx;
    if (catt.events.size || catt.states.length) catt.id = elementId;
    if (hasTag(this.tag)) {
      if (ctx) throw new TypeError(`<${this.tag}> cannot contain child content.`);
      return `<${this.tag}${catt.attr}>`;
    }

    //
    return `<${this.tag}${catt.attr}>${ctx}${this.closing}`;
  }
}
