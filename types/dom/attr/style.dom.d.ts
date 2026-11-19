import type { DVal } from "./value-types.attr.dom";
type CSSStyleProperty = {
    [P in keyof CSSStyleDeclaration]: CSSStyleDeclaration[P] extends (...args: any[]) => any ? never : P;
}[keyof CSSStyleDeclaration];
export type CSSStyle = {
    [P in CSSStyleProperty]?: DVal;
} & {
    [key: `--${string}`]: DVal;
};
export {};
