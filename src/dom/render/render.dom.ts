import { CATT } from "./cat.dom";
import { CTX, processCTXStateful, setNestedDOMRenderer } from "./ctx.dom";
import { OZ, Wizard } from "./oz.dom";
import { Idm } from "./idm.dom";
import type { maybePromise } from "@/utils";
import { setContentRenderer } from "../../$/renderer.$";
import { ATTR } from "../attr/attr.dom";
import { DOM } from "./node.dom";

export * from "../attr/attr.dom";

export interface RenderedDOM {
  ctx: string;
  oz: OZ;
  id: string | undefined;
}

export type renderedDom = RenderedDOM;

export async function renderDom(
  node: maybePromise<DOM>,
  pid: Idm | string = new Idm(),
): Promise<RenderedDOM> {
  const { tag, attr, ctx } = await Promise.resolve(node);

  const idm = pid instanceof Idm ? pid : Idm.fromId(pid);
  const id = idm.nextId;
  const catt = new CATT(id, idm);
  const nonceAttr = ["script", "style"].includes(tag.toLowerCase()) && idm.nonce !== undefined ? { ...attr, nonce: idm.nonce } : attr;
  const attributes = new ATTR(nonceAttr);
  const context = new CTX(tag, ctx);

  attributes.get(catt);
  const html = await context.get(catt);

  return {
    ctx: html,
    oz: catt.OZ.set(catt),
    id: catt.id,
  };
}

setNestedDOMRenderer(renderDom);

setContentRenderer(async (value, parentId) => {
  const { ctx, catt } = await processCTXStateful(value, parentId);
  return {
    html: ctx,
    commit: () => Wizard.RPS(catt.OZ).then(() => undefined),
  };
});

