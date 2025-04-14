import { isNotWindow, Mapper } from "../@";
export { eventStream } from "./estream";
export { local } from "./local";
export { session } from "./session";

export type Elements =
  | HTMLElementTagNameMap[keyof HTMLElementTagNameMap]
  | SVGElementTagNameMap[keyof SVGElementTagNameMap];

const ElementIds: Mapper<string, Elements> = new Mapper();

export const getElementById = (key: string): Elements | undefined => {
  if (isNotWindow) return;

  const cached = ElementIds.get(key);

  if (cached?.isConnected) return cached;

  ElementIds.delete(key);

  const element = document.getElementById(key);

  if (!element) return;

  ElementIds.set(key, element);

  return element;
};

export function IDNotConnected(): string[] {
  const ids: string[] = [];
  ElementIds.forEach((e, id) => {
    if (!e.isConnected) {
      ids.push(id);
      ElementIds.delete(id);
    }
  });
  return ids;
}

/*
-------------------------

-------------------------
*/

export * from "./client";
