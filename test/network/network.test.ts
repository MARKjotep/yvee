import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { SocketController, SocketHub, RouteBook, eventStreams, EventStream } from '../../src';

class FakeSocket extends EventTarget {
  static OPEN = 1; static CLOSING = 2; static all: FakeSocket[] = [];
  readyState = 0; closed = 0;
  constructor(readonly url: string | URL) { super(); FakeSocket.all.push(this); }
  close() { this.closed++; this.readyState = 3; this.dispatchEvent(new Event('close')); }
  send(_data: string) {}
}
class FakeSource extends EventTarget {
  static all: FakeSource[] = []; closed = 0; readonly withCredentials: boolean;
  constructor(readonly url: string, options: EventSourceInit = {}) { super(); this.withCredentials = options.withCredentials ?? false; FakeSource.all.push(this); }
  close() { this.closed++; }
}
const names = ['WebSocket', 'EventSource', 'location'] as const;
const originals = names.map(name => Object.getOwnPropertyDescriptor(globalThis, name));
beforeEach(() => { FakeSocket.all = []; FakeSource.all = []; Object.assign(globalThis, { WebSocket: FakeSocket, EventSource: FakeSource, location: new URL('https://example.com/base') }); });
afterEach(() => names.forEach((name, i) => { const descriptor = originals[i]; if (descriptor) Object.defineProperty(globalThis, name, descriptor); else Reflect.deleteProperty(globalThis, name); }));
function hub() { const routes = new RouteBook(); routes.add('/chat/:id', SocketController, 'socket'); return new SocketHub({ routes }); }

describe('network helper contracts', () => {
  it('preserves secure protocols, matches URL pathnames, and closes on abort', () => {
    const sockets = hub(); const abort = new AbortController();
    const one = sockets.load('wss://remote.test/chat/1?token=x', { signal: abort.signal });
    expect(String(one.connection!.url)).toBe('wss://remote.test/chat/1?token=x');
    sockets.load('/chat/2'); expect(String(FakeSocket.all[1]!.url)).toBe('wss://example.com/chat/2');
    sockets.load('http://remote.test/chat/3'); expect(String(FakeSocket.all[2]!.url)).toBe('ws://remote.test/chat/3');
    abort.abort(); expect(FakeSocket.all[0]!.closed).toBe(1);
    sockets.closeAll(); expect(FakeSocket.all.every(socket => socket.closed === 1)).toBe(true);
    expect(() => sockets.load('/chat/4', { signal: abort.signal })).toThrow();
  });
  it('distinguishes malformed JSON, invalid payloads and rejected handlers', async () => {
    const errors: string[] = []; const controller = new SocketController();
    controller.onMessage<{ text: string }>(async () => { throw new Error('application'); }, {
      validate: (value): value is { text: string } => typeof value === 'object' && value !== null && 'text' in value && typeof value.text === 'string',
      onError: (_error, phase) => errors.push(phase),
    });
    for (const data of ['not json', '{"text":42}', '{"text":"hello"}']) await controller.message(new MessageEvent('message', { data }));
    expect(errors).toEqual(['parse', 'validation', 'handler']);
  });
  it('retries only when requested with bounded attempts and cancels pending backoff', async () => {
    const sockets = hub(); sockets.load('/chat/1', { retry: { attempts: 1, delay: 0 } });
    FakeSocket.all[0]!.close(); await Bun.sleep(5); expect(FakeSocket.all).toHaveLength(2);
    FakeSocket.all[1]!.close(); await Bun.sleep(5); expect(FakeSocket.all).toHaveLength(2);
    const abort = new AbortController(); sockets.load('/chat/2', { signal: abort.signal, retry: { attempts: 3, delay: 50 } });
    FakeSocket.all[2]!.close(); abort.abort(); await Bun.sleep(60); expect(FakeSocket.all).toHaveLength(3);
    sockets.closeAll();
  });
  it('closes dedicated SSE on abort and releases shared SSE only after the last owner', () => {
    const abort = new AbortController(); let calls = 0;
    const stream = eventStreams('/events', { message: () => { calls++; } }, { signal: abort.signal });
    FakeSource.all[0]!.dispatchEvent(new Event('message')); abort.abort(); stream.close();
    FakeSource.all[0]!.dispatchEvent(new Event('message')); expect(calls).toBe(1); expect(FakeSource.all[0]!.closed).toBe(1);
    const a = new EventStream('/shared'), b = new EventStream('/shared');
    const listener = () => { calls++; }; a.on({ message: listener }); b.on({ message: listener });
    a.close(); FakeSource.all[1]!.dispatchEvent(new Event('message')); expect(calls).toBe(2);
    expect(FakeSource.all[1]!.closed).toBe(0); b.close(); expect(FakeSource.all[1]!.closed).toBe(1);
  });
});
