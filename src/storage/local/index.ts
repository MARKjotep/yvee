import { obj } from "../../@";
import { storageInterface } from "../util";

/**
 * Local Storage
 */
export const local = {
  get: (item: obj<() => any> | string) => new storageInterface(item),
};
