import { bind, htmlHead, isArr, log } from "../../@";
import { doc } from "../doc";
import { Stormy } from "../storage";
import { websocket } from "../wss";
import { minElements } from "../elements";
import type { aAttr } from "../../dom";

//
export class Router extends minElements {
  storage = new Stormy();
  protected base: string;
  constructor(
    base: string = "/",
    index: string = "",
    protected pushHistory: boolean = false,
  ) {
    super();
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
  /** --------------------
   * string | int | float | file | uuid
   * - /url/\<string:hell>
   */
  @bind route<Q extends typeof doc<{}>>(path: string) {
    return (f: Q) => {
      f.A = (a: aAttr, ...ctx: ctx[]) => {
        if (a.href && isArr(a.href)) {
          a.href = fillRoute(path, a.href);
        } else if (!a.href) {
          a.href = path;
        }
        return this.A(a, ...ctx);
      };
      this.storage.setRoute(path, f);
      return f;
    };
  }
  @bind error<Q extends typeof doc<{}>>(...codes: number[]) {
    return (f: Q) => {
      if (codes.length) {
        codes.forEach((cd) => {
          this.storage.setError(cd, f);
        });
      }
      return f;
    };
  }

  /** --------------------
   * string | int | float | file | uuid
   * - /url/\<string:hell>
   */
  @bind wss<Q extends typeof websocket>(path: string) {
    return (f: Q) => {
      this.storage.setWss(path, f);
      return f;
    };
  }
}

export function fillRoute(temp: string, replacements: any[]) {
  let i = 0;
  return temp.replace(/<[^>]+>/g, () => replacements[i++]);
}
