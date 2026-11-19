import { renderDom, type RenderedDOM } from "@/dom/dom.dom";
import { Idm } from "@/dom/render/idm.dom";
import { OZ } from "@/dom/render/oz.dom";
import { DOM } from "@/dom/render/node.dom";
import type { DOMContext } from "@/dom/render/contracts.dom";

export async function renderHeadElements(
  elements: readonly DOM[],
  owner: string,
  idSeed: string,
  nonce?: string,
): Promise<RenderedDOM> {
  const idm = new Idm(idSeed, 0, nonce);
  const rendered = new OZ();
  const markup: string[] = [];
  let id: string | undefined;

  for (const element of elements) {
    const owned = await addHeadOwner(element, owner);
    const node = await renderDom(owned as DOM, idm);
    markup.push(node.ctx);
    rendered.push(node.oz);
    id = node.id ?? id;
  }

  return { ctx: markup.join(""), oz: rendered, id };
}

async function addHeadOwner(value: DOMContext, owner: string): Promise<DOMContext> {
  const resolved = await Promise.resolve(value);
  if (Array.isArray(resolved)) {
    const children: DOMContext[] = [];
    for (const child of resolved) children.push(await addHeadOwner(child, owner));
    return children;
  }
  if (!(resolved instanceof DOM)) return resolved as DOMContext;

  const children: DOMContext[] = [];
  for (const child of resolved.ctx) children.push(await addHeadOwner(child, owner));
  const attr = resolved.tag
    ? { ...resolved.attr, "data-yv": owner }
    : resolved.attr;
  return new DOM(resolved.tag, attr, children);
}

