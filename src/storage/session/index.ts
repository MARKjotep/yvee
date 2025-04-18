import { obj } from "../../@";
import { Stateful } from "../../stateful";
import { storageInterface } from "../util";

/**
 * Session Storage
 */
export const session = {
  get: <T>(item: obj<Stateful<T>> | string) =>
    new storageInterface<T>(item, "session"),
};
