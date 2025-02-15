import { $ } from "../../$";
import { $$, obj, oLen, oVals, cssLoader } from "../../@";

export async function LINK(link?: obj<obj<string>>) {
  //
  const lnks: obj<() => void> = {};

  $("link")?.all.forEach((ml) => {
    const _ml = $(ml);
    const hrf = _ml.attr.get("href");
    if (hrf) {
      lnks[hrf] = _ml.unload;
    }
  });

  if (link && oLen(link)) {
    for (const vv of oVals(link)) {
      const vref = vv.href;
      if (!(vref in lnks)) {
        await cssLoader(vv);
      } else {
        delete lnks[vref];
      }
    }
  }

  return oVals(lnks);
}
