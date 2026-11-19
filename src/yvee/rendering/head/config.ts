import { DOM } from "@/dom/render/node.dom";

export type HeadConfig = {
  base?: Record<string, string | boolean>[];
  title?: string;
  style?: string;
  description?: string;
  meta?: Record<string, string | boolean>[];
  link?: Record<string, string | boolean>[];
  script?: (Record<string, string | boolean> & { body?: string })[];
  css?: string | string[];
  js?: string | string[];
  /** DOM-rendered head elements, useful for reactive text and attributes. */
  elements?: DOM[];
};

export type HeadResult = HeadConfig | DOM | string | void;

export function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export function combineHead(defaults: HeadConfig, page: HeadConfig): HeadConfig {
  return {
    ...defaults,
    ...page,
    base: [...asArray(defaults.base), ...asArray(page.base)],
    meta: [...asArray(defaults.meta), ...asArray(page.meta)],
    link: [...asArray(defaults.link), ...asArray(page.link)],
    script: [...asArray(defaults.script), ...asArray(page.script)],
    css: [...asArray(defaults.css), ...asArray(page.css)],
    js: [...asArray(defaults.js), ...asArray(page.js)],
    elements: [...asArray(defaults.elements), ...asArray(page.elements)],
  };
}

export function normalizeHeadValue(value: HeadResult): HeadConfig {
  if (value instanceof DOM) return { elements: [value] };
  if (typeof value === "string") return { style: value };
  return value ?? {};
}

export class HeadDefaults {
  readonly values: HeadConfig = {};

  head(value: HeadResult) {
    const config = normalizeHeadValue(value);
    if (config.title !== undefined) this.values.title = config.title;

    const style = [this.values.style, config.style].filter(Boolean).join("\n");
    if (style) this.values.style = style;
    if (config.description !== undefined) {
      this.values.description = config.description;
    }

    for (const field of ["base", "meta", "link", "script", "css", "js", "elements"] as const) {
      const incoming = config[field];
      if (incoming === undefined) continue;

      const previous = this.values[field];
      const existing = previous === undefined
        ? []
        : Array.isArray(previous)
          ? previous
          : [previous];
      const additions = Array.isArray(incoming) ? incoming : [incoming];

      (this.values as Record<string, unknown>)[field] = [...existing, ...additions];
    }
  }
}

