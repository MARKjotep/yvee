import { obj } from "../../@";
import { Stateful } from "../../stateful";
import { storageInterface, storeValTypes } from "../util";

/**
 * Local Storage
 */
export const local = {
  get: <T>(item: obj<Stateful<T>> | string) =>
    new storageInterface<T>(item, "local"),
  init: <T>(item: obj<Stateful<T>>, as: storeValTypes) =>
    new storageInterface<T>(item, "local", as),
};
