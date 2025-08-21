import { bind, htmlHead, log } from "../../@";
import { doc } from "../doc";
import { Stormy } from "../storage";

//
export class Router extends htmlHead {
  storage = new Stormy();
  protected base: string;
  constructor(base: string = "/", index: string = "") {
    super({ mark: true });

    this.base = base ? (base.startsWith("/") ? base : `/${base}`) : "";

    const _base = this.base;

    this.head({
      script: [
        {
          type: "module",
          src: "./index.js",
        },
      ],
      ...{
        base: [
          {
            href: _base === "/" ? _base : `${_base}/`,
            target: "_blank",
          },
        ],
      },
      meta: [
        { charset: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1.0",
        },
      ],
    });
  }
  @bind route<Q extends typeof doc<{}>>(path: string) {
    return (f: Q) => {
      this.storage.setRoute(path, f);
      return f;
    };
  }
}
