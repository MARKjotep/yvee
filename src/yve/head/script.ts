import { $ } from "../../$";
import { $$, obj, oItems, oLen, oVals } from "../../@";

export async function SCRPT(src?: obj<string>[]) {
  const ss: obj<() => void> = {};

  $("script[yid]")?.all.forEach((sc) => {
    const SX = $(sc);
    const yd = SX.attr.get("yid");
    if (yd) {
      ss[yd] = SX.unload;
    }
  });
  //

  if (src) {
    for (const vv of src) {
      if ("yid" in vv) {
        if (vv.yid in ss) {
          delete ss[vv.yid];
        } else {
          await scrptLoader(vv);
        }
      }
    }
  }

  return oVals(ss);
}

const scrptLoader = (attrs: obj<string>) => {
  return new Promise((resolve, reject) => {
    const scrpt = $(document.createElement("script"));
    let content = "";
    if ("importmap" in attrs) {
      attrs.type = "importmap";
      content = JSON.stringify(attrs.importmap);
      delete attrs.importmap;
    } else if ("body" in attrs) {
      content = attrs.body;
      delete attrs.body;
    }
    if (content) {
      scrpt.inner = content;
    }
    scrpt.attr.set(attrs);

    scrpt.e.onload = () => resolve(() => {}); // Resolve when loaded
    scrpt.e.onerror = () => reject(new Error("Failed to load CSS")); // Reject on error
    document.head.appendChild(scrpt.e);
  });
};
