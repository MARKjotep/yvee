import { obj } from "../../@";
import { storageInterface } from "../util";

/**
 * Session Storage
 */
export const session = {
  get: (item: obj<() => any> | string) => new storageInterface(item, "session"),
};
