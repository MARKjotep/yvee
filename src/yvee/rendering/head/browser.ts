import { validateAttribute, inlineContent } from "@/dom/render/trust.dom";
import { Wizard } from "@/dom/render/oz.dom";
import type { RenderedDOM } from "@/dom/dom.dom";
import { resolveHeadAssets } from "./asset";
import { asArray, type HeadConfig } from "./config";
import { renderHeadElements } from "./elements";
import { waitForStylesheets } from "./stylesheets";

export type HeadCleanup = (() => void) & {
  ready: Promise<void>;
  activate(): Promise<void>;
  cancel(): void;
};

export function applyHead(
  config: HeadConfig,
  owner: string,
  options: {
    keepExisting?: boolean;
    deferTitle?: boolean;
    idSeed?: string;
    nonce?: string;
  } = {},
): HeadCleanup {
  if (typeof document === "undefined") {
    return Object.assign(() => {}, {
      ready: Promise.resolve(),
      async activate() {},
      cancel() {},
    });
  }

  config = resolveHeadAssets(config);

  let previousTitle = document.title;
  const title = config.title ?? "";
  const nodes: HTMLElement[] = [];
  let dynamicTitle: HTMLTitleElement | undefined;
  let renderedHead: RenderedDOM | undefined;
  const stylesheetLinks: HTMLLinkElement[] = [];
  let activated = !options.deferTitle;
  let titleManaged = false;
  let cancelled = false;
  let stylesheetWait = waitForStylesheets([]);
  if (activated && config.title !== undefined) {
    document.title = title;
    titleManaged = true;
  }

  const append = (tag: string, attrs: Record<string, unknown>) => {
    // External scripts execute when inserted. Keep an existing script instead
    // of replacing it during hydration or a route transition.
    if (tag === "script" && typeof attrs.src === "string") {
      const src = new URL(attrs.src, document.baseURI).href;
      const type = String(attrs.type ?? "").toLowerCase();
      const existing = Array.from(document.head.querySelectorAll<HTMLScriptElement>("script[src]"))
        .find(script => script.src === src && script.type.toLowerCase() === type);
      if (existing) return;
    }

    const node = document.createElement(tag);

    for (const [key, value] of Object.entries(attrs)) {
      if (key === "body" || value === undefined) continue;
      validateAttribute(key, value);
      if (typeof value === "boolean") node.toggleAttribute(key, value);
      else node.setAttribute(key, String(value));
    }

    if ((tag === "script" || tag === "style") && options.nonce !== undefined) node.setAttribute("nonce", options.nonce);
    node.dataset.yv = owner;
    if (tag === "script" && attrs.body) node.textContent = inlineContent("script", attrs.body);
    document.head.append(node);
    nodes.push(node);
    if (
      tag === "link" &&
      String(attrs.rel ?? "").toLowerCase() === "stylesheet"
    ) {
      stylesheetLinks.push(node as HTMLLinkElement);
    }
  };

  const ownerIdSeed = options.idSeed ?? `${owner}:h`;
  const ready = (async () => {
    if (!options.keepExisting) removeHeadElements(owner);

    const base = config.base?.at(-1);
    if (base) {
      document.head.querySelectorAll("base").forEach(node => node.remove());
      append("base", base);
    }
    if (config.description) {
      append("meta", { name: "description", content: config.description });
    }
    for (const meta of config.meta ?? []) append("meta", meta);
    for (const link of config.link ?? []) append("link", link);

    const cssHrefs = asArray(config.css);
    for (const href of cssHrefs) {
      append("link", { rel: "stylesheet", href });
    }

    for (const script of config.script ?? []) append("script", script);

    const scripts = asArray(config.js);
    for (const src of scripts) append("script", { src });

    if (config.style) {
      const style = document.createElement("style");
      style.textContent = inlineContent("style", config.style);
      if (options.nonce !== undefined) style.setAttribute("nonce", options.nonce);
      style.dataset.yv = owner;
      document.head.append(style);
      nodes.push(style);
    }

    if (config.elements?.length) {
      renderedHead = await renderHeadElements(config.elements, owner, ownerIdSeed, options.nonce);
      if (cancelled) return;

      const template = document.createElement("template");
      template.innerHTML = renderedHead.ctx;
      const children = Array.from(template.content.children) as HTMLElement[];
      for (const child of children) {
        if (child instanceof HTMLTitleElement) {
          dynamicTitle = child;
          if (options.deferTitle) continue;
          titleManaged = true;
        }
        document.head.append(child);
        nodes.push(child);
      }
      stylesheetLinks.push(
        ...children.filter(
          (child): child is HTMLLinkElement =>
            child instanceof HTMLLinkElement &&
            child.rel.toLowerCase() === "stylesheet",
        ),
      );
    }

    stylesheetWait = waitForStylesheets(stylesheetLinks);
    await stylesheetWait.ready;
    if (activated && renderedHead) await Wizard.RPS(renderedHead.oz, () => !cancelled && activated);
  })();

  const cleanup = (() => {
    if (cancelled) return;
    cancelled = true;
    try {
      stylesheetWait.cancel();
      if (activated && renderedHead) Wizard.resetScope(ownerIdSeed);
    } finally {
      const managedTitle = dynamicTitle?.textContent ?? title;
      const shouldRestoreTitle = titleManaged && document.title === managedTitle;
      nodes.forEach((node) => node.remove());
      dynamicTitle?.remove();
      if (shouldRestoreTitle) document.title = previousTitle;
    }
  }) as HeadCleanup;
  cleanup.ready = ready.catch(error => { cleanup(); throw error; });
  cleanup.activate = async () => {
    if (cancelled || activated) return;
    previousTitle = document.title;
    activated = true;
    if (dynamicTitle) {
      // A rendered title element is the single title source for this head.
      document.head.querySelectorAll("title").forEach(node => {
        if (node !== dynamicTitle) node.remove();
      });
      document.head.append(dynamicTitle);
      nodes.push(dynamicTitle);
      titleManaged = true;
    } else if (config.title !== undefined) {
      document.title = title;
      titleManaged = true;
    }
    if (renderedHead) await Wizard.RPS(renderedHead.oz, () => !cancelled && activated);
  };
  cleanup.cancel = () => stylesheetWait.cancel();
  return cleanup;
}

export function removeHeadElements(owner: string) {
  if (typeof document === "undefined") return;
  document.head.querySelectorAll("[data-yv]").forEach((node) => {
    if (node.getAttribute("data-yv") !== owner) return;
    // Removing an external script does not undo its effects, and reinserting it
    // would execute it again. Leave loaded scripts in place across routes.
    if (node instanceof HTMLScriptElement && node.hasAttribute("src")) return;
    node.remove();
  });
}

