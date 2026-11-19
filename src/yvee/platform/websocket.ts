import type { RouteBook } from '../routing/routes';
import { DisposalScope } from '../../core/disposal.core';

interface SocketRouteSource { routes: RouteBook }
export type MessageFailure = 'parse' | 'validation' | 'handler';
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
  open(_event: Event) {}
  message(_event: MessageEvent): void | Promise<void> {}
  close(_event: CloseEvent) {}
  error(_event: Event) {}
  messageError(error: unknown, phase: MessageFailure, _event: MessageEvent) {
    console.error(`Yvee socket ${phase} failed`, error);
  }
  sendJson(value: unknown) {
    if (this.connection?.readyState === WebSocket.OPEN) this.connection.send(JSON.stringify(value));
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
    if (options.signal) scope.listen(options.signal, 'abort', () => this.unload(path), { once: true });
    let retries = 0;
    const report = (error: unknown) => console.error('Yvee socket callback failed', error);
    const connect = () => {
      if (scope.disposed) return;
      const socket = new WebSocket(address);
      controller.connection = socket;
      const connection = new DisposalScope();
      const release = scope.defer(() => connection.dispose());
      connection.defer(() => { if (socket.readyState < WebSocket.CLOSING) socket.close(); });
      connection.listen(socket, 'open', event => { try { Promise.resolve(controller.open(event)).catch(report); } catch (error) { report(error); } });
      connection.listen(socket, 'message', event => {
        try { Promise.resolve(controller.message(event as MessageEvent)).catch(report); } catch (error) { report(error); }
      });
      connection.listen(socket, 'error', event => { try { Promise.resolve(controller.error(event)).catch(report); } catch (error) { report(error); } });
      connection.listen(socket, 'close', event => {
        release();
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
