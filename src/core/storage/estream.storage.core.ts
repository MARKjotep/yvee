type EventHandler = (event: MessageEvent) => void;
export type EventMap = Record<string, EventHandler>;

const eventSources = new Map<string, EventSource>();
const eventListeners = new Map<string, Map<string, Set<EventHandler>>>();
const eventOwners = new Map<string, Set<EventStream>>();

export class EventStream {
  readonly stream: EventSource;
  private readonly handlers = new Map<string, Set<EventHandler>>();
  private closed = false;

  constructor(
    readonly url: string,
    withCredentials = false,
  ) {
    let source = eventSources.get(url);
    if (source && source.withCredentials !== withCredentials) {
      throw new TypeError(
        `Event stream ${url} is already open with different credentials settings.`,
      );
    }
    if (!source) {
      if (typeof EventSource === "undefined") throw new Error("EventSource is not available in this environment.");
      source = new EventSource(url, { withCredentials });
      eventSources.set(url, source);
      eventListeners.set(url, new Map());
    }
    this.stream = source;
    let owners = eventOwners.get(url);
    if (!owners) {
      owners = new Set();
      eventOwners.set(url, owners);
    }
    owners.add(this);
  }

  on(events: EventMap) {
    const listeners = eventListeners.get(this.url)!;
    for (const [eventName, handler] of Object.entries(events)) {
      if (this.closed) break;
      let ownHandlers = this.handlers.get(eventName);
      if (!ownHandlers) {
        ownHandlers = new Set();
        this.handlers.set(eventName, ownHandlers);
      }
      if (ownHandlers.has(handler)) continue;
      ownHandlers.add(handler);

      let handlers = listeners.get(eventName);
      if (!handlers) {
        handlers = new Set();
        listeners.set(eventName, handlers);
      }
      if (!handlers.has(handler)) {
        handlers.add(handler);
        this.stream.addEventListener(eventName, handler as EventListener);
      }
    }
    return this;
  }

  off(eventName?: string, handler?: EventHandler) {
    const listeners = eventListeners.get(this.url);
    if (!listeners) return this;

    const names = eventName
      ? [eventName]
      : [...this.handlers.keys()];
    for (const name of names) {
      const owned = this.handlers.get(name);
      if (!owned) continue;
      const toRemove = handler
        ? owned.has(handler)
          ? [handler]
          : []
        : [...owned];
      const shared = listeners.get(name);
      for (const current of toRemove) {
        owned.delete(current);
        const usedElsewhere = [...(eventOwners.get(this.url) ?? [])].some(
          (owner) => owner !== this && owner.handlers.get(name)?.has(current),
        );
        if (!usedElsewhere) {
          this.stream.removeEventListener(name, current as EventListener);
          shared?.delete(current);
        }
      }
      if (!owned.size) this.handlers.delete(name);
      if (shared && !shared.size) listeners.delete(name);
    }
    return this;
  }

  close() {
    if (this.closed) return;
    this.off();
    this.closed = true;
    const owners = eventOwners.get(this.url);
    owners?.delete(this);
    if (!owners?.size) {
      this.stream.close();
      eventOwners.delete(this.url);
      eventListeners.delete(this.url);
      eventSources.delete(this.url);
    }
  }
}

/** @deprecated Prefer dedicated eventStreams(); retain EventStream when sharing a connection intentionally. */
export function eventStream(url: string, withCredentials = true) {
  return new EventStream(url, withCredentials);
}
