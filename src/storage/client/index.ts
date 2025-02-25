import { Storage, htmlHead, MinStorage, makeID, $$ } from "../../@";
import { dom } from "../..";
import { doc, websocket, yveeCfg } from "../../yvee";

export class ClientPath extends MinStorage {
  constructor(
    path: string,
    public id: string,
    public cls: typeof doc<{}>,
  ) {
    super(path);
  }
}

export class SocketPath extends MinStorage {
  constructor(
    path: string,
    public id: string,
    public cls: typeof websocket<{}>,
  ) {
    super(path);
  }
}

export class minClient extends htmlHead {
  protected storage: Storage<ClientPath> = new Storage();
  protected errorStorage: Storage<ClientPath> = new Storage();
  protected wssStorage: Storage<SocketPath> = new Storage();

  /** --------------------
   * string | int | float | file | uuid
   * - /url/\<string:hell>
   */
  route: (path: string) => <Q extends typeof doc<{}>>(f: Q) => Q;
  error: (...codes: number[]) => <Q extends typeof doc<{}>>(f: Q) => Q;
  wss: (path: string) => <Q extends typeof websocket<{}>>(f: Q) => Q;

  // error: () => <Q extends typeof doc<{}>>(f: Q) => Q;
  constructor(
    protected ImportMeta: ImportMeta,
    protected config: yveeCfg,
  ) {
    super();
    this.route = (path: string) => {
      return <Q extends typeof doc<{}>>(f: Q): Q => {
        this.storage.set(new ClientPath(path, makeID(5), f));
        return f;
      };
    };

    this.wss = (path: string) => {
      return <Q extends typeof websocket<{}>>(f: Q): Q => {
        this.wssStorage.set(new SocketPath(path, makeID(5), f));
        return f;
      };
    };

    this.error = (...codes: number[]) => {
      return <Q extends typeof doc<{}>>(f: Q): Q => {
        if (codes.length) {
          codes.forEach((cd) => {
            this.errorStorage.set(new ClientPath(cd.toString(), makeID(5), f));
          });
        } else {
          this.errorStorage.set(new ClientPath("404", makeID(5), f));
        }
        return f;
      };
    };

    // this.error()(defaultError);
  }

  protected async getPath(path: string) {
    return this.storage.get(path);
  }
  protected async loadError(code: number) {
    return this.errorStorage.get(code.toString());
  }
  protected async loadWSS(path: string) {
    return this.wssStorage.get(path);
  }
}
