import { $ } from "../$";
import { $$, Singleton } from "../@";
import { State, Stateful, stateHook } from "../stateful";
import { local } from "../storage";

@Singleton
export class ColorScheme {
  state: Stateful<boolean>;
  body?: HTMLElement;
  click: () => void;
  constructor({
    toggle = [],
    initialState = false,
  }: {
    toggle?: string[];
    initialState?: boolean;
  } = {}) {
    this.state = State<boolean>(initialState);
    const ST = this.state;
    this.click = function () {
      ST.value = !ST.value;
    };
    this.loader(toggle);
  }
  private loader(toggles: string[]) {
    if (typeof window === "undefined") return;
    //
    const LOCAL_SCHEME = local.get("LOCAL_SCHEME");
    const SYSTEM_COLOR_SCHEME = this.isDark;
    const SCHEME_BOOL = LOCAL_SCHEME.as.bool;
    const LOCAL_DARK = local.get({ IS_DARK: () => this.state.value });

    if (SCHEME_BOOL != null && SCHEME_BOOL !== SYSTEM_COLOR_SCHEME) {
      this.state.value = !SCHEME_BOOL;
      LOCAL_DARK.save;
      LOCAL_SCHEME.set = SYSTEM_COLOR_SCHEME;
    }

    if (LOCAL_DARK.as.bool !== null) this.state.value = LOCAL_DARK.as.bool;

    const TG = this.toggle;
    const clist = document.documentElement.classList;

    TG(clist, this.state.value, toggles);

    stateHook(
      async (isDark) => {
        //
        // isDark ? RT.add(...toggles) : RT.remove(...toggles);
        TG(clist, isDark, toggles);
        LOCAL_DARK.save;
      },
      [this.state],
      { id: "colorScheme" },
    );

    if (this.isMatchMediaSupported) {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (event) => {
          const newColorScheme = event.matches ? "dark" : "light";
          const isDark = newColorScheme === "dark";
          this.state.value = isDark;
          LOCAL_SCHEME.set = isDark;
        });
    }
  }
  get isMatchMediaSupported() {
    return window.matchMedia && typeof window.matchMedia === "function";
  }
  get isDark() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  toggle(clist: DOMTokenList, isDark: boolean, toggles: string[]) {
    if (isDark) {
      clist.add(...toggles);
    } else {
      clist.remove(...toggles);
    }
  }
}
