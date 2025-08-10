import { Pager, yveeCfg } from "..";
import { headType, isNotWindow, log } from "../../@";
import { BASE } from "./base";
import { LINK } from "./link";
import { META } from "./meta";
import { SCRPT } from "./script";

export async function processHead(this: Pager, GH: headType, lang: string) {
  const toUnload: (() => void)[] = [];

  if (isNotWindow) return [];

  const ttle = GH.get("title") ?? "";

  const { pushState } = this.config as yveeCfg;

  if (pushState) {
    const npath = this.path.value;
    const lst = this.lastPath.value;

    if (lst !== npath) {
      if (!lst.startsWith(npath)) {
        pushHistory(npath, ttle);
      } else if (npath === this.base) {
        pushHistory(npath, ttle);
      } else {
        pushHistory(npath, ttle);
      }
    }
  }

  ttle && (document.title = ttle);
  // base
  if (this.isYvee) {
    document.documentElement.lang = lang;

    // Title
    toUnload.push(...BASE(GH.get("base")));
    //  meta
    toUnload.push(...META(GH.get("meta")));
  }
  // link

  toUnload.push(...(await LINK(this.id, GH.get("link"), this.isYvee)));

  toUnload.push(...(await SCRPT(this.id, GH.get("script"), this.isYvee)));

  return toUnload;
}

export function pushHistory(path?: string, title?: string) {
  if (isNotWindow) return;
  const { pathname, hash } = window.location;
  const cURL = pathname + hash;

  if (path && cURL !== path) {
    history.pushState({}, title ?? "", path);
  }
}
