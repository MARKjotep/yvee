import { type CSSStyle, type V } from "../support.$";
import { Elem } from "./element.$";
export type kf = KeyframeAnimationOptions;
export type KFType = (CSSStyle | Record<string, V>)[] | CSSStyle | Record<string, V>;
export declare class anim {
    private e;
    opt: kf;
    constructor(e: Elem);
    animate(keyframes: CSSStyle[] | CSSStyle, options?: kf): Animation;
    get slide(): {
        left: (options?: kf) => anim;
        right: (options?: kf) => anim;
        up: (options?: kf) => anim;
        down: (options?: kf) => anim;
    };
    fade(options?: kf): this;
    shake(XorY?: "X" | "Y", opt?: kf): this;
    color(c?: string | string[], opt?: kf): this;
    bg(c?: string | string[], opt?: kf): this;
    bounce(sVal?: number, opt?: kf): this;
}
