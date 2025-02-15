import { $ } from "../../$";
import { obj } from "../../@";

export function BASE(BS?: obj<string>[]) {
  const unl: (() => void)[] = [];
  if (BS?.length) {
    const { href, target } = BS[0];
    const _B = $("base");
    if (_B) {
      _B.attr.set({ href, target });
    } else {
      const base = $(document.createElement("base"));
      base.attr.set({ href, target });
      document.head.append(base.e);
    }
  } else {
    const un = $("base")?.unload;
    un && unl.push(un);
  }

  return unl;
}
