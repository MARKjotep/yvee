import type { HeadConfig } from "./config";

type HeadAttributes = Record<string, string | boolean>;

/**
 * Resolve file-loader-style relative asset URLs in a head config against the
 * head's own base href.
 *
 * Values starting with `./` or `../` (such as Bun file imports used for
 * favicons, logos and stylesheets) become base-relative URLs, so head tags work
 * under any app `base` without depending on a runtime `<base>` tag. Absolute
 * paths, `data:`/`http(s):` URLs, protocol-relative URLs, anchors, empty values
 * and plain names pass through unchanged. The input config is never mutated.
 */
export function resolveHeadAssets(head: HeadConfig): HeadConfig {
  const baseHref = String(head.base?.at(-1)?.href ?? "/");
  const documentBase = new URL(baseHref, "http://yvee.local");
  const rootRelative = baseHref.startsWith("/");

  const resolve = (value: string) => {
    if (!value.startsWith("./") && !value.startsWith("../")) return value;
    const resolved = new URL(value, documentBase);
    return rootRelative
      ? `${resolved.pathname}${resolved.search}${resolved.hash}`
      : resolved.href;
  };

  const resolveField = <T extends HeadAttributes>(attributes: T, field: "href" | "src"): T => {
    const value = attributes[field];
    if (typeof value !== "string") return attributes;
    const resolved = resolve(value);
    return (resolved === value ? attributes : { ...attributes, [field]: resolved }) as T;
  };

  const resolveList = <T>(values: T[], rewrite: (value: T) => T): T[] => {
    let changed = false;
    const next = values.map((value) => {
      const rewritten = rewrite(value);
      if (rewritten !== value) changed = true;
      return rewritten;
    });
    return changed ? next : values;
  };

  const resolveStrings = (values: string | string[]): string | string[] => {
    if (!Array.isArray(values)) return resolve(values);
    return resolveList(values, resolve);
  };

  const resolved: HeadConfig = { ...head };
  if (head.link) resolved.link = resolveList(head.link, link => resolveField(link, "href"));
  if (head.script) resolved.script = resolveList(head.script, script => resolveField(script, "src"));
  if (head.css !== undefined) resolved.css = resolveStrings(head.css);
  if (head.js !== undefined) resolved.js = resolveStrings(head.js);
  return resolved;
}
