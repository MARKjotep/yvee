import type { RouteBook } from '../routing/routes';
import { DisposalScope } from '../../core/disposal.core';
import { State, type IStateful } from '@/core/core.core';

interface SocketRouteSource { routes: RouteBook }
export type MessageFailure = 'parse' | 'validation' | 'handler';
/** Lifecycle of a socket connection: waiting to connect or retry, open, or closed/disposed. */
export type SocketConnectionState = 'connecting' | 'open' | 'closed';
export interface JsonMessageOptions<T> {
  validate?: (value: unknown) => value is T;
  onError?: (error: unknown, phase: MessageFailure, event: MessageEvent) => void;
}
export interface SocketLoadOptions {
  signal?: AbortSignal;
  /** No retries by default. Attempts are a total budget per load, including after successful opens. */
  retry?: { attempts: number; delay?: number; maxDelay?: number };
}

export class SocketController {
  connection?: WebSocket;
  path = '/';
  params: Record<string, string> = {};
  /**
   * Reactive connection state, bindable from a view like `app.loading`.
   * Starts as `"connecting"`, becomes `"open"` once the native socket opens and
   * queued frames flush, and `"closed"` when the socket closes or the hub
   * disposes the controller. Retries cycle `"closed"` back to `"connecting"`.
   */
  readonly state: IStateful<SocketConnectionState> = State<SocketConnectionState>('connecting');
  private queue: unknown[] = [];
  private disposed = false;
  open(_event: Event) {}
  message(_event: MessageEvent): void | Promise<void> {}
  close(_event: CloseEvent) {}
  error(_event: Event) {}
  messageError(error: unknown, phase: MessageFailure, _event: MessageEvent) {
    console.error(`Yvee socket ${phase} failed`, error);
  }
  /**
   * Sends a JSON frame, queueing it in FIFO order while the socket is missing
   * or not open. Queued frames flush once when the connection opens, including
   * after a retry reconnect. Frames sent to a disposed controller are dropped.
   * The queue is unbounded while waiting, so senders should avoid producing
   * frames faster than the connection can open. Never throws: serialization
   * and native send failures are logged and the frame is skipped.
   *
   * Unlike `sendJson`, this does not drop frames sent before the socket opens.
   */
  send(value: unknown) {
    const socket = this.connection;
    if (socket && socket.readyState === WebSocket.OPEN) {
      this.transmit(socket, value);
      return;
    }
    if (!this.disposed) this.queue.push(value);
  }
  /** Fire-and-forget: silently drops the frame unless the socket is open now. */
  sendJson(value: unknown) {
    if (this.connection?.readyState === WebSocket.OPEN) this.connection.send(JSON.stringify(value));
  }

  /** @internal Binds the native socket and enters `"connecting"`. */
  attach(socket: WebSocket) {
    this.connection = socket;
    this.state.value = 'connecting';
  }
  /** @internal Enters `"open"`; the hub flushes queued frames after the `open` hook. */
  opened() {
    this.state.value = 'open';
  }
  /** @internal Sends queued frames in FIFO order if the socket is open. */
  flush() {
    const socket = this.connection;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    while (this.queue.length) this.transmit(socket, this.queue.shift());
  }
  /** @internal Enters `"closed"`; queued frames survive for a retry reconnect. */
  closed() {
    this.state.value = 'closed';
  }
  /** @internal Disposes the controller: clears queued frames and enters `"closed"`. */
  dispose() {
    this.disposed = true;
    this.queue.length = 0;
    this.state.value = 'closed';
  }
  private transmit(socket: WebSocket, value: unknown) {
    try {
      socket.send(JSON.stringify(value));
    } catch (error) {
      console.error('Yvee socket send failed', error);
    }
  }

  onMessage<T = unknown>(handler: (value: T, event: MessageEvent) => void | Promise<void>, options: JsonMessageOptions<T> = {}) {
    const previous = this.message.bind(this);
    this.message = async event => {
      const report = (error: unknown, phase: MessageFailure) => {
        if (options.onError) options.onError(error, phase, event);
        else this.messageError(error, phase, event);
      };
      try { await previous(event); } catch (error) { report(error, 'handler'); }
      let value: unknown;
      try {
        if (typeof event.data !== 'string') throw new TypeError('Expected a JSON text frame.');
        value = JSON.parse(event.data);
      } catch (error) { report(error, 'parse'); return; }
      try {
        if (options.validate && !options.validate(value)) throw new TypeError('Socket payload validation failed.');
      } catch (error) { report(error, 'validation'); return; }
      try { await handler(value as T, event); } catch (error) { report(error, 'handler'); }
    };
    return this;
  }
}

interface Connection { controller: SocketController; scope: DisposalScope }
export class SocketHub {
  private readonly connections = new Map<string, Connection>();
  constructor(private readonly app: SocketRouteSource) {}

  load(path: string, options: SocketLoadOptions = {}) {
    options.signal?.throwIfAborted();
    if (typeof WebSocket === 'undefined') throw new Error('WebSocket is not available in this environment.');
    const base = typeof location === 'undefined' ? 'http://localhost' : location.href;
    const address = new URL(path, base);
    if (address.protocol === 'https:') address.protocol = 'wss:';
    else if (address.protocol === 'http:') address.protocol = 'ws:';
    else if (!['ws:', 'wss:'].includes(address.protocol)) throw new TypeError('Unsupported WebSocket protocol.');
    const match = this.app.routes.find(address.pathname, 'socket');
    if (!match) throw new Error(`No WebSocket route matches ${path}`);
    const existing = this.connections.get(path);
    if (existing) return existing.controller;
    const attempts = options.retry?.attempts ?? 0;
    const delay = options.retry?.delay ?? 250;
    const maxDelay = options.retry?.maxDelay ?? 30_000;
    if (!Number.isSafeInteger(attempts) || attempts < 0 || !Number.isFinite(delay) || delay < 0 || !Number.isFinite(maxDelay) || maxDelay < delay) {
      throw new RangeError('Invalid WebSocket retry policy.');
    }
    const Controller = match.entry.controller as new () => SocketController;
    const controller = new Controller();
    controller.path = path; controller.params = match.params;
    const scope = new DisposalScope();
    this.connections.set(path, { controller, scope });
    scope.defer(() => { if (this.connections.get(path)?.controller === controller) this.connections.delete(path); });
    scope.defer(() => controller.dispose());
    if (options.signal) scope.listen(options.signal, 'abort', () => this.unload(path), { once: true });
    let retries = 0;
    const report = (error: unknown) => console.error('Yvee socket callback failed', error);
    const connect = () => {
      if (scope.disposed) return;
      const socket = new WebSocket(address);
      controller.attach(socket);
      const connection = new DisposalScope();
      const release = scope.defer(() => connection.dispose());
      connection.defer(() => { if (socket.readyState < WebSocket.CLOSING) socket.close(); });
      connection.listen(socket, 'open', event => {
        controller.opened();
        try { Promise.resolve(controller.open(event)).catch(report); } catch (error) { report(error); }
        controller.flush();
      });
      connection.listen(socket, 'message', event => {
        try { Promise.resolve(controller.message(event as MessageEvent)).catch(report); } catch (error) { report(error); }
      });
      connection.listen(socket, 'error', event => { try { Promise.resolve(controller.error(event)).catch(report); } catch (error) { report(error); } });
      connection.listen(socket, 'close', event => {
        release();
        controller.closed();
        try { Promise.resolve(controller.close(event as CloseEvent)).catch(report); } catch (error) { report(error); }
        if (scope.disposed) return;
        if (retries < attempts) scope.timeout(() => { try { connect(); } catch (error) { report(error); scope.dispose(); } }, Math.min(maxDelay, delay * 2 ** retries++));
        else scope.dispose();
      });
    };
    try { connect(); } catch (error) { scope.dispose(); throw error; }
    return controller;
  }
  unload(path: string) { this.connections.get(path)?.scope.dispose(); }
  closeAll() {
    const errors: unknown[] = [];
    for (const { scope } of [...this.connections.values()]) { try { scope.dispose(); } catch (error) { errors.push(error); } }
    if (errors.length) throw new AggregateError(errors, 'Socket cleanup failed.');
  }
}
