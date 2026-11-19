import { Idm } from "@/dom/render/idm.dom";
import { renderDom } from "@/dom/dom.dom";
import type { DOMContext } from "@/dom/render/contracts.dom";
import { DOM, dom } from "@/dom/render/node.dom";
import { Wizard } from "@/dom/render/oz.dom";
import type { IStateful } from "@/core/core.core";
import type { maybePromise } from "@/utils";

export type Layout = (content: IStateful<unknown[]>) => maybePromise<DOMContext>;

interface MountOptions {
  element: HTMLElement;
  id: string;
  className?: string | string[];
  root: IStateful<unknown[]>;
  layout?: Layout;
  hydrate?: boolean;
  nonce?: string;
  isCurrent?: () => boolean;
}

export async function mountRoot({ element, id, className, root, layout, hydrate = true, nonce, isCurrent }: MountOptions) {
  const content = layout ? await layout(root) : root;
  const tree = content instanceof DOM
    ? content
    : <main class={className}>{content}</main>;

  const rendered = await renderDom(tree, new Idm(element.id || id, 0, nonce));
  if (isCurrent && !isCurrent()) return;
  const template = document.createElement("template");
  template.innerHTML = rendered.ctx;
  if (!hydrate || element.innerHTML !== template.innerHTML) {
    element.innerHTML = rendered.ctx;
  }
  await Wizard.RPS(rendered.oz, isCurrent);
}
