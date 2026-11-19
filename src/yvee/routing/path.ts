export interface YveeURL {
  path: string;
  search: string;
  hash: string;
  params: URLSearchParams;
}

export const normalizePath = (input: string): string => {
  const raw = input.split(/[?#]/, 1)[0] || "/";
  const absolute = raw.startsWith("/") ? raw : `/${raw}`;
  const compact = absolute.replace(/\/{2,}/g, "/");

  return compact.length > 1 ? compact.replace(/\/+$/, "") : "/";
};

export const toURL = (input: string | URL): YveeURL => {
  const base = typeof window === "undefined" ? "http://localhost" : window.location.href;
  const url = input instanceof URL ? input : new URL(input, base);

  return {
    path: normalizePath(url.pathname),
    search: url.search,
    hash: url.hash,
    params: url.searchParams,
  };
};

export const urlKey = (url: YveeURL): string =>
  `${url.path}${url.search}${url.hash}`;
