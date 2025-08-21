import { Yvee } from "..";
import { isNotWindow, isWindow, Mapper, oAss, obj } from "../../@";
import { State } from "../../stateful";

//
export class websocket<T = Record<string, any>> {
  route: string = "/";
  declare public ws: WebSocket;
  public isConnected = State(false);
  public data: T = {} as T;
  constructor(
    public path: string,
    protected args: T = {} as T,
  ) {
    this.data = args;
  }
  protected open(event: Event): Promise<void> | void {}
  protected message(event: MessageEvent): Promise<void> | void {}
  protected close(event: CloseEvent): Promise<void> | void {}
  protected error(event: Event): Promise<void> | void {}

  get connect() {
    //
    if (this.ws && this.ws.readyState <= 1) return this;
    this.ws = new WebSocket(this.path);
    this.ws.onopen = async (event) => {
      //
      this.isConnected.value = true;
      await this.open.call(this, event);
    };
    this.ws.onmessage = async (event) => {
      //
      await this.message.call(this, event);
    };
    this.ws.onclose = async (event) => {
      this.isConnected.value = false;
      await this.close.call(this, event);
    };
    this.ws.onerror = async (event) => {
      this.isConnected.value = this.ws.readyState <= 1;
      await this.error.call(this, event);
    };

    return this;
  }
  get reconnect() {
    if (this.state >= 2) {
      this.connect;
    }

    return this;
  }
  get disconnect() {
    if (this.state <= 1) {
      this.ws.close();
    }

    return this;
  }
  /**
   * code:
   * * 0 - CONNECTING: The connection is being established.
   * * 1 - OPEN: The connection is open and ready to communicate.
   * * 2 - CLOSING: The connection is in the process of closing.
   * * 3 - CLOSED: The connection has been closed or could not be opened.
   */
  get state() {
    return this.ws?.readyState ?? 3;
  }
  set send(message: string | ArrayBufferLike | Blob | ArrayBufferView) {
    if (this.isConnected.value) {
      this.ws.send(message);
    } else throw new Error(`websocket path ${this.path} not connected`);
  }
}

const websockets: Mapper<string, websocket> = new Mapper();

export class socket {
  constructor(protected yvee: Yvee) {}
  //
  async load(_path: string) {
    if (isNotWindow) return;
    if (!websockets.has(_path)) {
      const [clientP, args] = this.yvee.storage.getWss(_path);
      if (!clientP) return;
      const { cls, path } = clientP;
      const client = new cls(path, args).connect;
      websockets.set(_path, client);
      return client;
    }
    const socket = websockets.get(_path)!;
    socket.reconnect;
    return socket;
  }
  unload(_path: string) {
    if (isNotWindow) return;
    if (websockets.has(_path)) {
      const socket = websockets.get(_path);
      if (!socket) return;
      //
      socket.disconnect;
      websockets.delete(_path);
    }
  }
}
