import { log, obj, oItems, oLen, oVals, scrptLoader } from "../../@";
import { $ } from "../../dom";

export async function SCRPT(src?: obj<any>[], isR: boolean = false) {
  //

  let remLink = $(`script[rt]`)?.all.map((ss) => () => ss.remove()) || [];

  if (src && oLen(src)) {
    for (const vv of oVals(src)) {
      if (vv.x) continue;
      try {
        await scrptLoader(vv);
      } catch (e) {
        log.e = ["script error", { error: "Huntr @ script" }];
      }
    }
  }

  //

  return remLink;
}
