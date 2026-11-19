import { normalizePath } from "./path";

export type Constructor<T = object> = new (...args: any[]) => T;
export type Transport = "page" | "socket";

export interface RouteEntry<T = unknown> {
  path: string;
  transport: Transport;
  expression: RegExp;
  names: string[];
  controller: Constructor<T>;
}

export interface RouteMatch<T> {
  entry: RouteEntry<T>;
  params: Record<string, string>;
}

const errorCodes = new WeakMap<Constructor, number>();

export function error(status: number) {
  if (!Number.isInteger(status) || status < 400 || status > 599) {
    throw new RangeError("Expected an HTTP error status between 400 and 599.");
  }
  return <T extends Constructor<import("../pages/page").Page>>(controller: T): T => {
    errorCodes.set(controller, status);
    return controller;
  };
}

export const errorStatus = (controller: Constructor) => errorCodes.get(controller);

interface RouteMetadata {
  path: string;
  transport: Transport;
}

const metadataByController = new WeakMap<Function, RouteMetadata[]>();

const annotate = (path: string, transport: Transport) =>
  <T extends Constructor>(controller: T): T => {
    const metadata = metadataByController.get(controller) ?? [];
    metadataByController.set(controller, [...metadata, { path, transport }]);
    return controller;
  };

export const page = (path = "/") => annotate(path, "page");
export const route = page;
export const socketRoute = (path = "/") => annotate(path, "socket");

export const routeMetadata = (controller: Function) =>
  metadataByController.get(controller) ?? [];

function compilePath(path: string, base: string) {
  const normalizedBase = normalizePath(base);
  const normalizedRoute = normalizePath(path);
  const prefix = normalizedBase === "/" ? "" : normalizedBase;
  const suffix = normalizedRoute === "/" ? "" : normalizedRoute;
  const normalized = normalizePath(`${prefix}/${suffix}`);
  const names: string[] = [];

  if (normalized === "/") {
    return { path: normalized, expression: /^\/?$/, names };
  }

  const segments = normalized.slice(1).split("/");
  const pattern = segments.map((segment) => {
    if (!segment.startsWith(":")) {
      return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    const name = segment.slice(1);
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name) || names.includes(name)) {
      throw new TypeError(`Invalid route parameter: ${segment}`);
    }

    names.push(name);
    return "([^/]+)";
  }).join("/");

  return {
    path: normalized,
    expression: new RegExp(`^/${pattern}/?$`),
    names,
  };
}

export class RouteBook<T = unknown> {
  private readonly entries: RouteEntry<T>[] = [];

  constructor(private readonly base = "/") {}

  add(path: string, controller: Constructor<T>, transport: Transport = "page") {
    const compiled = compilePath(path, this.base);
    const duplicate = this.entries.some((entry) =>
      entry.path === compiled.path && entry.transport === transport,
    );

    if (duplicate) throw new Error(`Route already registered: ${compiled.path}`);

    const entry = { ...compiled, controller, transport };
    this.entries.push(entry);
    return entry;
  }

  find(path: string, transport: Transport = "page"): RouteMatch<T> | undefined {
    const candidate = normalizePath(path);

    for (const entry of this.entries) {
      if (entry.transport !== transport) continue;

      const match = entry.expression.exec(candidate);
      if (!match) continue;

      const params: Record<string, string> = {};
      entry.names.forEach((name, index) => {
        params[name] = decodeURIComponent(match[index + 1] ?? "");
      });

      return { entry, params };
    }

    return undefined;
  }

  all(transport?: Transport) {
    return this.entries.filter((entry) => !transport || entry.transport === transport);
  }
}

export const interpolate = (
  pattern: string,
  values: Record<string, unknown> | unknown[],
) => {
  let index = 0;

  return pattern.replace(/:([A-Za-z_][A-Za-z0-9_]*)/g, (_whole, key: string) => {
    const value = Array.isArray(values) ? values[index++] : values[key];
    return encodeURIComponent(String(value ?? ""));
  });
};
