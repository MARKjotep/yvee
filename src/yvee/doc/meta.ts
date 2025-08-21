import { log, metaLoader, obj, oItems, oLen, oVals } from "../../@";
import { $ } from "../../dom";

const GID = ["charset", "name", "property", "http-equiv"];
export async function META(meta?: obj<obj<string>>) {
  //
  const mg: obj<HTMLElement> = {};

  $("meta")?.all.forEach((ml) => {
    const mattr = (ml as HTMLElement).attributes;
    for (const g of GID) {
      if (g in mattr) {
        const mmg = mattr[g as any].value;
        mg[`${g}_${g === "charset" ? "" : mmg}`] = ml as HTMLElement;
      }
    }
  });
  if (meta) {
    oItems(meta).forEach(([k, v]) => {
      if (k in mg) {
        $(mg[k]).attr.set(v);
        delete mg[k];
      } else {
        const _mm = $(document.createElement("meta"));
        _mm.attr.set(v);
        document.head.append(_mm.e);
      }
    });
  }

  return oVals(mg).map((mm) => $(mm).unload);
}
