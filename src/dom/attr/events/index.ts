import { Elements } from "../../$";
import { Stateful } from "../../../stateful";

export interface c_events<T extends Elements = HTMLElement> {
  state?: (
    this: T,
    e: T,
  ) => [(...args: any[]) => void, Stateful<any>[], boolean?];
  ready?: (this: T, e: T) => void;
  resize?: (this: T, e: UIEvent) => void;
  beforeunload?: (this: T, e: BeforeUnloadEvent) => void;
  popstate?: (this: T, e: PopStateEvent) => void;
  winscroll?: (this: T, e: Event) => void;
  winload?: (this: T, e: Event) => void;
  winfocus?: (this: T, e: Event) => void;
  winblur?: (this: T, e: Event) => void;
}
