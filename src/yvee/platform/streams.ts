import { DisposalScope } from '../../core/disposal.core';

export interface StreamHandlers {
  open?: (event: Event) => void;
  error?: (event: Event) => void;
  message?: (event: MessageEvent) => void;
  [name: string]: ((event: MessageEvent) => void) | ((event: Event) => void) | undefined;
}
export interface StreamOptions extends EventSourceInit { signal?: AbortSignal }

/** Dedicated EventSource; native SSE reconnection continues until close/abort. */
export function eventStreams(url: string, handlers: StreamHandlers = {}, options: StreamOptions = {}) {
  options.signal?.throwIfAborted();
  if (typeof EventSource === 'undefined') throw new Error('EventSource is not available in this environment.');
  const stream = new EventSource(url, { withCredentials: options.withCredentials ?? false });
  const scope = new DisposalScope();
  const close = stream.close.bind(stream);
  scope.defer(close);
  stream.close = () => scope.dispose();
  for (const [name, handler] of Object.entries(handlers)) {
    if (handler) scope.listen(stream, name, handler as EventListener);
  }
  if (options.signal) scope.listen(options.signal, 'abort', () => stream.close(), { once: true });
  return stream;
}
