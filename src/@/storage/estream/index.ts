import { oItems } from "@coff-r/x";

type EventHandler = (e: MessageEvent) => void;
type EventMap = Record<string, EventHandler>;

const eventSources: Record<string, EventSource> = {};
const eventListener: Record<string, Record<string, EventHandler[]>> = {};

class eStream {
  stream: EventSource;
  url: string;

  constructor(eurl: string, withCredentials = false) {
    this.url = eurl;

    if (eventSources[eurl]) {
      this.stream = eventSources[eurl];
    } else {
      this.stream = new EventSource(eurl, { withCredentials });
      eventSources[eurl] = this.stream;
      eventListener[eurl] = {};
    }
  }

  on(events: EventMap) {
    const listeners = eventListener[this.url];

    if (!listeners) return this;

    Object.entries(events).forEach(([eventName, handler]) => {
      // Remove existing listeners for this event
      if (listeners[eventName]) {
        listeners[eventName].forEach((oldHandler) => {
          this.stream.removeEventListener(eventName, oldHandler);
        });
      }

      // Add new listener
      this.stream.addEventListener(eventName, handler);

      // Store reference
      listeners[eventName] = [handler];
    });

    return this;
  }
}

export function eventStream(url: string, withCredentials = true) {
  return new eStream(url, withCredentials);
}
