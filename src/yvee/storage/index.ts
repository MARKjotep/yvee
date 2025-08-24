import { Storage, MinStorage, oAss } from "../../@";
import { dom } from "../../dom";
import { content } from "../content";
import { doc } from "../doc";
import { websocket } from "../wss";

class BasePath<T> extends MinStorage {
  constructor(
    path: string,
    public cls: T,
  ) {
    super(path);
  }
}

export class ClientPath extends BasePath<typeof doc<{}>> {}

export class SocketPath extends BasePath<typeof websocket> {}

class MainStorage<T extends InstanceType<typeof BasePath>> {
  storage: Storage<T> = new Storage();
  error: Storage<T> = new Storage();
}

export class Stormy extends MainStorage<ClientPath> {
  wss: Storage<SocketPath> = new Storage();
  setRoute(path: string, _doc: typeof doc<{}>) {
    this.storage.set(new ClientPath(path, _doc));
  }
  getRoute(path: string, error?: number): doc<{}> {
    const [routeStored, args] = this.storage.get(path);
    if (!routeStored) {
      const [errr = new ClientPath(path, defaultError)] = this.getError(error);

      const CLS = new errr.cls();
      CLS.args = args;
      return oAss(CLS, { args });
    }
    const CLS = new routeStored.cls();
    return oAss(CLS, { args });
  }
  setWss(path: string, _wss: typeof websocket) {
    this.wss.set(new SocketPath(path, _wss));
  }
  getWss(path: string) {
    return this.wss.get(path);
  }
  setError(code: number, _doc: typeof doc<{}>) {
    this.error.set(new ClientPath(code.toString(), _doc));
  }
  getError(code: number = 404) {
    return this.error.get(code.toString());
  }
}

export class TabPath extends BasePath<typeof content<{}>> {}

export class miniStormy extends MainStorage<TabPath> {
  setRoute(path: string, _doc: typeof content<{}>) {
    this.storage.set(new TabPath(path, _doc));
  }
  getRoute(path: string, error?: number): content<{}> {
    const [routeStored, args] = this.storage.get(path);
    if (!routeStored) {
      const [errr = new TabPath(path, tabError)] = this.getError(error);

      const CLS = new errr.cls();
      CLS.args = args;
      return oAss(CLS, { args });
    }
    const CLS = new routeStored.cls();
    return oAss(CLS, { args });
  }
  setWss(path: string) {}
  getWss(path: string) {
    // return this.wssStorage.get(path);
  }
  setError(code: number, _doc: typeof content<{}>) {
    this.error.set(new TabPath(code.toString(), _doc));
  }
  getError(code: number = 404) {
    return this.error.get(code.toString());
  }
}

export class defaultError extends doc {
  body() {
    return dom("div", {}, this.path + " not found...");
  }
}

class tabError extends content {
  body() {
    return dom("div", {}, `${this.path} not found...`);
  }
}
