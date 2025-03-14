import { Router, yveeCfg } from "..";
import { $$, headType, isNotWindow } from "../../@";
import { BASE } from "./base";
import { LINK } from "./link";
import { META } from "./meta";
import { SCRPT } from "./script";

let lastHistory = "";

export async function processHead(
  this: Router,
  GH: headType,
  lang: string,
  unload: boolean = false,
) {
  const toUnload: (() => void)[] = [];
  if (isNotWindow) return [];

  const ttle = GH.get("title") ?? "";

  const { pushState } = this.config as yveeCfg;

  if (pushState) {
    const npath = this.path.value;

    if (lastHistory !== npath) {
      if (!lastHistory.startsWith(npath)) {
        pushHistory(npath, ttle);
        lastHistory = npath;
      } else if (npath === this.base) {
        pushHistory(npath, ttle);
        lastHistory = npath;
      } else {
        // $$.p = [npath, lastHistory, lastHistory.replace(this.base, "")];
      }
    }
  }

  if (!this.isYRA) {
    if (ttle) {
      document.title = ttle;
    }
  } else {
    document.title = ttle;
  }

  // base
  if (unload) {
    document.documentElement.lang = lang;
    // Title

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
