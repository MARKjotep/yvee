import { obj, oLen, oVals, cssLoader, Mapper, log } from "../../@";
import { $ } from "../../dom";

export async function LINK(link: obj<obj<any>> = {}, id: string) {
  //

  const remLink = $(`link[rt]`)?.all.map((ss) => () => ss.remove()) || [];

  if (link && oLen(link)) {
    for (const vv of oVals(link)) {
      if (vv.x) continue;
      try {
        await cssLoader(vv);
      } catch (e) {
        log.e = ["link error", { error: "Huntr @ link" }];
      }
    }
  }
  return remLink;
}
