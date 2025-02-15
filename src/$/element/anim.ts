import { Elem } from "./";
import { oAss, obj, V } from "../../@";
import { CSSinT } from "../../dom";

export type kf = KeyframeAnimationOptions;
export type KFType = (CSSinT | obj<V>)[] | CSSinT | obj<V>;

export class anim {
  opt: kf;
  constructor(private e: Elem) {
    this.opt = { duration: 500, easing: "ease-in-out", fill: "forwards" };
  }
  animate(keyframes: CSSinT[] | CSSinT, options: kf = {}) {
    return this.e.animate(keyframes, options);
  }
  //
  get slide() {
    const slider = (
      { x = 0, y = 0 }: { x?: any; y?: any },
      options: kf = {},
    ): anim => {
      oAss(this.opt, options);
      const ac = [
        [x, y],
        [0, 0],
      ].map(([k, v]) => ({
        transform: `translateX(${k}rem) translateY(${v}rem)`,
      }));
      this.e.animate(ac, this.opt);
      return this;
    };

    return {
      left: (options: kf = {}) => {
        return slider({ x: -2 }, options);
      },
      right: (options: kf = {}) => {
        return slider({ x: 2 }, options);
      },
      up: (options: kf = {}) => {
        return slider({ y: 2 }, options);
      },
      down: (options: kf = {}) => {
        return slider({ y: -2 }, options);
      },
    };
  }
  fade(options: kf = {}) {
    oAss(this.opt, options);
    const ac = [0, 1].map((k) => ({
      opacity: k,
    }));
    this.e.animate(ac, this.opt);
    return this;
  }
  shake(XorY = "Y", opt: kf = {}) {
    oAss(this.opt, opt);
    const ac = [0, 5, -5, 5, 0].map((k) => ({
      transform: `translate${XorY}(${k}px)`,
    }));
    this.e.animate(ac, this.opt);
    return this;
  }
  color(c: string[] = [], opt: kf = {}) {
    oAss(this.opt, opt);
    let ac = Array.isArray(c) ? c.map((cc) => ({ color: cc })) : { color: c };
    this.e.animate(ac, this.opt);
    return this;
  }
  bg(c: string | string[] = [], opt: kf = {}) {
    oAss(this.opt, opt);
    let ac = Array.isArray(c)
      ? c.map((cc) => ({ backgroundColor: cc }))
      : { backgroundColor: c };
    this.e.animate(ac, this.opt);
    return this;
  }
  bounce(sVal = 1, opt: kf = {}) {
    oAss(this.opt, opt);
    const ad = [0.5, sVal, 1].map((mp) => ({ transform: `scale(${mp})` }));
    this.e.animate(ad);
    return this;
  }
}
