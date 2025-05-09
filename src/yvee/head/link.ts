import { $, _$ } from "../../$";
import { obj, oLen, oVals, cssLoader, Mapper, log } from "../../@";
import { YveePath } from "..";

const YMAP = new Mapper<string, Set<string>>();

export async function LINK(
  id: string,
  link: obj<obj<any>> = {},
  unload: boolean = false,
) {
  //
  const ypath = YveePath.value;
  const lnks: obj<() => void> = {};

  $("link")?.all.forEach((ml) => {
    const _ml = $(ml);
    const hrf = _ml.attr.get("href");
    if (hrf) {
      const isRT = _ml.attr.get("rt");
      if (unload) {
        const YP = YMAP.get(ypath);
        if (YP) {
          if (!YP.has(hrf)) {
            lnks[hrf] = _ml.unload;
          }
        } else {
          // -
          lnks[hrf] = _ml.unload;
        }
      } else if (isRT) {
        if (isRT === id) {
          lnks[hrf] = _ml.unload;
        }
      }
    }
  });

  if (link && oLen(link)) {
    for (const vv of oVals(link)) {
      const vref = vv.href;
      if (!(vref in lnks)) {
        try {
          let LV: _$ = undefined;
          if (!unload) {
            LV = $(`link[href='${vref}']`);
            if (LV) {
              LV.attr.set({ rt: id });
            }
            vv.rt = id;
            const YNIT = YMAP.init(ypath, new Set());
            if (!YNIT.has(vref)) {
              YNIT.add(vref);
            }
          }
          if (!LV) {
            await cssLoader(vv);
          }
        } catch (e) {
          log.e = ["link error", { error: "yvee @ link" }];
        }
      } else {
        delete lnks[vref];
      }
    }
  }

  return oVals(lnks);
}
