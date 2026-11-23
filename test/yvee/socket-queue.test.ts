import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { SocketController, SocketHub } from "../../src/yvee/platform/websocket";
import { RouteBook } from "../../src/yvee/routing/routes";

class FakeSocket extends EventTarget {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  static all: FakeSocket[] = [];
  readyState = FakeSocket.CONNECTING;
  sent: string[] = [];
  closed = 0;
  constructor(readonly url: string | URL) { super(); FakeSocket.all.push(this); }
  close() {
    this.closed++;
    this.readyState = FakeSocket.CLOSED;
    this.dispatchEvent(new Event("close"));
  }
  send(data: string) { this.sent.push(data); }
  open() {
    this.readyState = FakeSocket.OPEN;
    this.dispatchEvent(new Event("open"));
  }
}

const names = ["WebSocket", "location"] as const;
const originals = names.map((name) => Object.getOwnPropertyDescriptor(globalThis, name));

beforeEach(() => {
  FakeSocket.all = [];
  Object.assign(globalThis, { WebSocket: FakeSocket, location: new URL("https://example.com/base") });
});

afterEach(() => {
  for (const [index, name] of names.entries()) {
    const descriptor = originals[index];
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else Reflect.deleteProperty(globalThis, name);
  }
});

function hub() {
  const routes = new RouteBook();
  routes.add("/chat/:id", SocketController, "socket");
  return new SocketHub({ routes });
}

function frames(socket: FakeSocket | undefined) {
  return socket?.sent.map((frame) => JSON.parse(frame)) ?? [];
}

describe("SocketController.send queueing", () => {
  it("queues frames before the socket opens and flushes them in order", () => {
    const sockets = hub();
    const controller = sockets.load("/chat/1");

    expect(controller.state.value).toBe("connecting");
    controller.send({ n: 1 });
    controller.send({ n: 2 });
    expect(FakeSocket.all[0]!.sent).toEqual([]);

    FakeSocket.all[0]!.open();

    expect(controller.state.value).toBe("open");
    expect(frames(FakeSocket.all[0])).toEqual([{ n: 1 }, { n: 2 }]);
    sockets.closeAll();
  });

  it("sends immediately while open and keeps sendJson fire-and-forget", () => {
    const sockets = hub();
    const controller = sockets.load("/chat/1");
    controller.sendJson({ dropped: true });
    expect(FakeSocket.all[0]!.sent).toEqual([]);

    FakeSocket.all[0]!.open();
    controller.send({ n: 1 });
    controller.sendJson({ n: 2 });

    expect(frames(FakeSocket.all[0])).toEqual([{ n: 1 }, { n: 2 }]);
    sockets.closeAll();
  });

  it("flushes queued frames exactly once after a retry reconnect", async () => {
    const sockets = hub();
    const controller = sockets.load("/chat/1", { retry: { attempts: 1, delay: 0 } });

    controller.send({ n: 1 });
    controller.send({ n: 2 });
    FakeSocket.all[0]!.close();
    expect(controller.state.value).toBe("closed");

    await Bun.sleep(5);
    expect(FakeSocket.all).toHaveLength(2);
    expect(controller.state.value).toBe("connecting");
    controller.send({ n: 3 });

    FakeSocket.all[1]!.open();
    expect(frames(FakeSocket.all[1])).toEqual([{ n: 1 }, { n: 2 }, { n: 3 }]);
    expect(FakeSocket.all[0]!.sent).toEqual([]);

    controller.send({ n: 4 });
    expect(frames(FakeSocket.all[1])).toEqual([{ n: 1 }, { n: 2 }, { n: 3 }, { n: 4 }]);

    FakeSocket.all[1]!.close();
    expect(controller.state.value).toBe("closed");
    expect(() => controller.send({ after: "dispose" })).not.toThrow();
    expect(frames(FakeSocket.all[1])).toEqual([{ n: 1 }, { n: 2 }, { n: 3 }, { n: 4 }]);
    sockets.closeAll();
  });

  it("delivers frames sent from the open hook before previously queued frames", () => {
    const routes = new RouteBook();
    class JoinSocket extends SocketController {
      override open() { this.sendJson({ join: true }); }
    }
    routes.add("/chat/:id", JoinSocket, "socket");
    const sockets = new SocketHub({ routes });
    const controller = sockets.load("/chat/1");

    controller.send({ n: 1 });
    FakeSocket.all[0]!.open();

    expect(frames(FakeSocket.all[0])).toEqual([{ join: true }, { n: 1 }]);
    sockets.closeAll();
  });

  it("transitions connecting, open, closed, connecting, open, closed", async () => {
    const sockets = hub();
    const controller = sockets.load("/chat/1", { retry: { attempts: 1, delay: 0 } });
    const states: string[] = [];
    (controller.state as unknown as EventTarget).addEventListener("updated", (event) => {
      states.push((event as CustomEvent<string>).detail);
    });

    FakeSocket.all[0]!.open();
    FakeSocket.all[0]!.close();
    await Bun.sleep(5);
    FakeSocket.all[1]!.open();
    FakeSocket.all[1]!.close();
    await Bun.sleep(5);

    expect(states).toEqual(["open", "closed", "connecting", "open", "closed"]);
    expect(controller.state.value).toBe("closed");
    sockets.closeAll();
  });

  it("clears queued frames on dispose without delivering or throwing", () => {
    const sockets = hub();
    const controller = sockets.load("/chat/1");
    controller.send({ stale: 1 });
    controller.send({ stale: 2 });

    expect(() => sockets.unload("/chat/1")).not.toThrow();
    expect(controller.state.value).toBe("closed");
    expect(() => controller.send({ stale: 3 })).not.toThrow();

    const reloaded = sockets.load("/chat/1");
    expect(reloaded).not.toBe(controller);
    FakeSocket.all[1]!.open();
    expect(FakeSocket.all[1]!.sent).toEqual([]);
    expect(controller.connection).toBe(FakeSocket.all[0] as unknown as WebSocket);
    sockets.closeAll();
  });
});
