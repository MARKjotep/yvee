export type CSSStyle = {
  [P in keyof CSSStyleDeclaration]?: DVal;
} & {
  [key: string]: DVal;
};
