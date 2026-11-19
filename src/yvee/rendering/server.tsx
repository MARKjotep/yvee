import { snapshotData } from "./request";
import { escapeHTML } from "@/dom/render/escape.dom";
import { validateAttribute, inlineContent } from "@/dom/render/trust.dom";
import { Idm } from "@/dom/render/idm.dom";
import { State } from "@/core/core.core";
import type { DOMContext } from "@/dom/render/contracts.dom";
import { DOM, dom } from "@/dom/render/node.dom";
import { renderDom } from "@/dom/dom.dom";
import type { Layout } from "../client/mount";
import { combineHead, renderHeadElements, type HeadConfig } from "./head";
import type { Guard } from "../guards";
import { loadPage, type PageLoad } from "../client/load-page";
import type { Page } from "../pages/page";
import type { YveeURL } from "../routing/path";
import { toURL } from "../routing/path";
import type { Constructor, RouteBook } from "../routing/routes";
import type { maybePromise } from "@/utils";
import { renderJSONScript } from "@/dom/render/trust.dom";

export interface ServerRequest<TData> {
  /** URL used to select the page for this render. */
  url: string | URL | YveeURL;
  /** Request data exposed to the page and its fetch method. */
  data?: TData;
  /** Error status to render through the registered error page. */
  error?: number;
  /** Unique per response; pass the same value to the client mount. */
  nonce?: string;
  /** Abort signal for request-bound page loading and data creation. */
  signal?: AbortSignal;
}

/** HTML and the HTTP status produced by a server render. */
export interface ServerStatusResult {
  html: string;
  status: number;
}

export interface ServerDataContext<TData> extends ServerRequest<TData> {
  signal: AbortSignal;
  /** Register resources acquired by dataFactory; runs on success, failure or abort. */
  onDispose(cleanup: () => void | Promise<void>): void;
}

export interface ServerOptions<TData extends Record<string, unknown>> {
  id?: string;
  class?: string | string[];
  data?: TData;
  /** Return fresh request-owned mutable data/services. Plain data inputs are frozen snapshots. */
  dataFactory?: (context: ServerDataContext<TData>) => TData | Promise<TData>;
}

export interface ServerRenderer<TData extends Record<string, unknown>> {
  /** Render a request and return its HTML document. */
  (request: ServerRequest<TData>): Promise<string>;
  withStatus(request: ServerRequest<TData>): Promise<ServerStatusResult>;
}

export interface ServerRenderContext<TData extends Record<string, unknown>> {
  id: string;
  defaults: HeadConfig;
  routes: RouteBook;
  errors: Map<number, Constructor<Page>>;
  guards: Guard<any, any, any>[];
  data: TData;
  layout?: Layout;
  app: unknown;
}

export function createServerRenderer<TData extends Record<string, unknown>>(
  context: ServerRenderContext<TData>,
  options: ServerOptions<TData> = {},
): ServerRenderer<TData> {
  const id = options.id ?? context.id;

  const withStatus = async (request: ServerRequest<TData>) => {
    const { url: input, data, error, nonce } = request;
    const url = toYveeURL(input);
    const signal = request.signal ?? new AbortController().signal;
    const cleanups: (() => void | Promise<void>)[] = [];
    let failure: unknown;
    let failed = false;
    try {
      signal.throwIfAborted();
      const payload = options.dataFactory
        ? await options.dataFactory({ ...request, signal, onDispose: cleanup => { cleanups.push(cleanup); } })
        : snapshotData(data ?? options.data ?? context.data);
      signal.throwIfAborted();
      const loaded = await resolvePage(context, url, payload, error, signal);
      if (loaded.kind === "stop") {
        throw new Error(`Yvee server rendering was stopped by a guard for ${url.path}`);
      }
      if (loaded.dispose) cleanups.push(loaded.dispose);
      const head = combineHead(context.defaults, loaded.head);
      const body = await renderBody(loaded.body, context.layout, options.class, id, nonce);
      const status = loaded.status;
      const html = await renderDocument(body, head, id, status, nonce, payload);
      signal.throwIfAborted();
      return { html, status };
    } catch (error) {
      failure = error;
      failed = true;
      throw error;
    } finally {
      const errors: unknown[] = [];
      for (const cleanup of cleanups.reverse()) {
        try { await cleanup(); } catch (error) { errors.push(error); }
      }
      if (errors.length) throw new AggregateError(failed ? [failure, ...errors] : errors, "SSR request cleanup failed.");
    }
  };
  return Object.assign(
    async (request: ServerRequest<TData>) => (await withStatus(request)).html,
    { withStatus },
  );
}

async function resolvePage<TData extends Record<string, unknown>>(
  context: ServerRenderContext<TData>,
  initialURL: YveeURL,
  data: TData,
  error: number | undefined,
  signal: AbortSignal,
): Promise<Extract<PageLoad, { kind: "ready" | "stop" }>> {
  let url = initialURL;

  for (let redirects = 0; redirects <= 10; redirects++) {
    const result = await loadPage({
      app: context.app,
      routes: context.routes,
      globalGuards: context.guards,
      errors: context.errors,
      ...(error === undefined ? {} : { error }),
      url,
      data,
      signal,
    });

    if (result.kind !== "redirect") return result;
    if (redirects === 10) throw new Error("Yvee redirect limit exceeded during server rendering.");
    error = undefined;
    url = toURL(result.to);
  }

  throw new Error("Yvee redirect limit exceeded during server rendering.");
}

async function renderBody(
  body: unknown[],
  layout: Layout | undefined,
  className: string | string[] | undefined,
  id: string,
  nonce?: string,
) {
  const root = State<unknown[]>(body);
  const content: maybePromise<DOMContext> = layout ? await layout(root) : root;
  const tree = content instanceof DOM
    ? content
    : <main class={className}>{content}</main>;

  return (await renderDom(tree, new Idm(id, 0, nonce))).ctx;
}

async function renderDocument(
  body: string,
  head: HeadConfig,
  id: string,
  status: number,
  nonce: string | undefined,
  data: Record<string, unknown>,
) {
  // SSR head nodes use a stable owner because the browser app may generate a
  // different runtime ID when it hydrates this document.
  const headHTML = await renderHead(head, "root", nonce);
  return [
    "<!doctype html>",
    '<html lang="en">',
    `<head>${headHTML}${renderJSONScript(data, { id: "ssr", ...(nonce === undefined ? {} : { nonce }) })}</head>`,
    `<body id="${escapeAttribute(id)}"${status >= 400 ? ` data-error="${Number(status)}"` : ""}>${body}</body>`,
    "</html>",
  ].join("");
}

async function renderHead(head: HeadConfig, owner: string, nonce?: string) {
  const parts: string[] = [];

  const base = head.base?.at(-1);
  if (base) parts.push(`<base${renderAttributes(base, owner)}>`);
  if (head.description) {
    parts.push(`<meta${renderAttributes({
      name: "description",
      content: head.description,
    }, owner)}>`);
  }
  for (const meta of head.meta ?? []) {
    parts.push(`<meta${renderAttributes(meta, owner)}>`);
  }
  for (const script of head.script ?? []) {
    const { body, ...attrs } = script;
    parts.push(`<script${renderAttributes({ ...attrs, ...(nonce === undefined ? {} : { nonce }) }, owner)}>${inlineContent("script", body)}</script>`);
  }
  for (const src of asArray(head.js)) {
    parts.push(`<script${renderAttributes({ src, ...(nonce === undefined ? {} : { nonce }) }, owner)}></script>`);
  }
  if (head.title) parts.push(`<title${renderAttributes({}, owner)}>${escapeText(head.title)}</title>`);
  if (head.style) {
    parts.push(`<style${renderAttributes({ ...(nonce === undefined ? {} : { nonce }) }, owner)}>${inlineContent("style", head.style)}</style>`);
  }
  for (const link of head.link ?? []) {
    parts.push(`<link${renderAttributes(link, owner)}>`);
  }
  for (const href of asArray(head.css)) {
    parts.push(`<link${renderAttributes({ rel: "stylesheet", href }, owner)}>`);
  }

  if (head.elements?.length) {
    parts.push(
      (await renderHeadElements(head.elements, owner, `${owner}:h`, nonce)).ctx,
    );
  }

  return parts.join("");
}

function renderAttributes(attributes: Record<string, string | boolean>, owner: string) {
  const marked: Record<string, string | boolean> = {
    ...attributes,
    "data-yv": owner,
  };

  return Object.entries(marked)
    .map(([name, value]) => {
      validateAttribute(name, value);
      if (value === false) return "";
      if (value === true) return ` ${name}`;
      return ` ${name}="${escapeAttribute(value)}"`;
    })
    .join("");
}

const escapeAttribute = escapeHTML;
const escapeText = escapeHTML;

function asArray(value: string | string[] | undefined) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function toYveeURL(value: string | URL | YveeURL): YveeURL {
  if (typeof value === "string" || value instanceof URL) return toURL(value);
  return toURL(`${value.path}${value.search}${value.hash}`);
}
