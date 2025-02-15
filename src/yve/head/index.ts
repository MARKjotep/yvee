import { Yve } from "..";
import { $$, headType, isNotWindow } from "../../@";
import { BASE } from "./base";
import { LINK } from "./link";
import { META } from "./meta";
import { SCRPT } from "./script";

export async function processHead(this: Yve, GH: headType, lang: string) {
  const toUnload: (() => void)[] = [];
  if (isNotWindow) return [];

  const ttle = GH.get("title") ?? "";
  const { pushState: PS } = this.config;
  const npath = this.path.value;

  if (PS) pushHistory(npath, ttle);

  // unload head props

  document.documentElement.lang = lang;
  // Title
  document.title = ttle;
  // base
  toUnload.push(...BASE(GH.get("base")));
  //  meta
  toUnload.push(...META(GH.get("meta")));
  // link
  toUnload.push(...(await LINK(GH.get("link"))));

  // Scripts
  toUnload.push(...(await SCRPT(GH.get("script"))));

  return toUnload;
}

export function pushHistory(path?: string, title?: string) {
  const cURL = window.location.pathname;
  if (path && cURL !== path) {
    history.pushState({}, title ?? "", path);
  }
}
