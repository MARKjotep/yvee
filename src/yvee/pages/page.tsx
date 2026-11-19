import { DisposalScope } from "@/core/disposal.core";
import type { YveeURL } from "../routing/path";
import type { HeadResult } from "../rendering/head";
import { dom } from "@/dom/render/node.dom";

export class Page<TData extends Record<string, unknown> = Record<string, unknown>> {
  readonly resources = new DisposalScope();
  url: YveeURL = { path: "/", search: "", hash: "", params: new URLSearchParams() };
  path = "/";
  params: Record<string, string> = {};
  data = {} as TData;
  error?: unknown;
  status = 200;
  fetch?(context: PageFetchContext<TData>): Partial<TData> | Promise<Partial<TData>>;
  head?(): HeadResult | Promise<HeadResult>;
  body?(): unknown | Promise<unknown>;
}

export interface PageFetchContext<TData extends Record<string, unknown>> {
  url: YveeURL;
  params: Readonly<Record<string, string>>;
  data: TData;
  signal: AbortSignal;
  resources: DisposalScope;
}

export class MissingPage extends Page {
  body() {
    return <main role="status">Page not found: {this.path}</main>;
  }
}

export class FailurePage extends Page {
  override status = 500;

  body() {
    return <main role="alert">This page could not be loaded.</main>;
  }
}
