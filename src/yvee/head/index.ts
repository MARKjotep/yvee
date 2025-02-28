import { Router } from "..";
import { $$, headType, isNotWindow } from "../../@";
import { BASE } from "./base";
import { LINK } from "./link";
import { META } from "./meta";
import { SCRPT } from "./script";

export async function processHead(
  this: Router,
  GH: headType,
  lang: string,
  unload: boolean = false,
) {
  const toUnload: (() => void)[] = [];
  if (isNotWindow) return [];

  const ttle = GH.get("title") ?? "";
  if (unload) {
    const { pushState: PS } = this.config;
    const npath = this.path.value;
    if (PS) pushHistory(npath, ttle);

    document.documentElement.lang = lang;
    // Title
    document.title = ttle;
  }

  // base
  if (unload) {
    toUnload.push(...BASE(GH.get("base")));
    //  meta
    toUnload.push(...META(GH.get("meta")));
  }
  // link

  toUnload.push(...(await LINK(this.id, GH.get("link"), unload)));

  toUnload.push(...(await SCRPT(this.id, GH.get("script"), unload)));

  return toUnload;
}

export function pushHistory(path?: string, title?: string) {
  const cURL = window.location.pathname;
  if (path && cURL !== path) {
    history.pushState({}, title ?? "", path);
  }
}
