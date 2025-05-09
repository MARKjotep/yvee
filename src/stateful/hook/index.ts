import { Stateful, statefulValue } from "..";
import { isNotWindow, Mapper } from "../../@";

export type hookFN<T extends any[]> = (...args: statefulValue<T>) => void;
export type hookM<T extends any[]> = Mapper<string, hookFN<T>>;
/*
  -------------------------
  dom, ctx, style, etc
  -------------------------
  */
interface stateCFG {
  id?: string;
  init?: boolean;
}

export function StateHook<T extends any[]>(
  callback: hookFN<T>,
  statefuls: [...{ [K in keyof T]: Stateful<T[K]> }],
  { id = "stateHook", init }: stateCFG = {},
) {
  if (isNotWindow) return () => {};
  const hooks: (() => void)[] = [];

  const smap = () => statefuls.map((st) => st.value);
  const handler = () => {
    callback(...(smap() as statefulValue<T>));
  };

  //
  statefuls.forEach((hook) => {
    hooks.push(hook.hook(handler)(id));
  });

  if (init) handler();
  //
  return () => {
    hooks.forEach((unhook) => unhook());
  };
}

export const handleHooks = (hooks: hookM<any>) => {
  hooks.forEach((hook) => hook());
};
