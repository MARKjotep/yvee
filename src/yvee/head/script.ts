import { $ } from "../../$";
import { $$, Mapper, obj, oItems, oLen, oVals, scrptLoader } from "../../@";
import { YveePath } from "..";

const YMAP = new Mapper<string, Set<string>>();

export async function SCRPT(
  id: string,
  src?: obj<any>[],
  unload: boolean = false,
) {
  const ypath = YveePath.value;
  const ss: obj<() => void> = {};

  $("script[yid]")?.all.forEach((sc) => {
    const SX = $(sc);
    const yd = SX.attr.get("yid");
    if (yd) {
      const isRT = SX.attr.get("rt");
      if (unload) {
        const YP = YMAP.get(ypath);
        if (YP) {
          if (!YP.has(yd)) {
            ss[yd] = SX.unload;
          }
        } else {
          // -
          ss[yd] = SX.unload;
        }
      } else if (isRT) {
        if (isRT === id) {
          ss[yd] = SX.unload;
        }
      }
    }
  });
  //

  if (src) {
    for (const vv of src) {
      if ("yid" in vv) {
        if (vv.yid in ss) {
          delete ss[vv.yid];
        } else {
          try {
            if (!unload) {
              vv.rt = id;
              const vid = vv.yid;
              const YNIT = YMAP.init(ypath, new Set());
              if (!YNIT.has(vid)) {
                YNIT.add(vid);
              }
            }
            await scrptLoader(vv);
          } catch (e) {
            $$.p = e;
          }
        }
      }
    }
  }

  return oVals(ss);
}
