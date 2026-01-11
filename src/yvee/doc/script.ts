import { $ } from "@$";
import { log, oLen, oVals } from "@coff-r/x";
import { scriptLoader } from "@coff-r/x/html";

export async function SCRPT(src?: obj<any>[], isR: boolean = false) {
  //

  let remLink = $(`script[rt]`)?.all.map((ss) => () => ss.remove()) || [];

  if (src && oLen(src)) {
    for (const vv of oVals<any>(src)) {
      if (vv.x) continue;
      try {
        await scriptLoader(vv);
      } catch (e) {
        log.e = ["script error", { error: "Huntr @ script" }];
      }
    }
  }

  //

  return remLink;
}
