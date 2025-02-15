import { obj, oItems } from "../../@";

const eventSources: obj<EventSource> = {};
const eventListener: obj<obj<((a: MessageEvent) => void)[]>> = {};

//
class eStream {
  stream: EventSource;
  url: string;
  constructor(eurl: string, withCredentials: boolean) {
    this.url = eurl;
    if (eurl in eventSources) {
      this.stream = eventSources[eurl];
    } else {
      this.stream = new EventSource(eurl, {
        withCredentials: withCredentials,
      });
      eventSources[eurl] = this.stream;
      eventListener[this.url] = {};
    }
  }
  on(event: obj<(a: MessageEvent) => void>) {
    const strm = this.stream;
    oItems(event).forEach(([kk, vv]) => {
      if (kk in eventListener[this.url]) {
        eventListener[this.url][kk].forEach((lt) => {
          this.stream.removeEventListener(kk, lt);
        });
        eventListener[this.url][kk] = [];
      }
      // Then
      strm.addEventListener(kk, vv);
      if (!(kk in eventListener[this.url])) {
        eventListener[this.url][kk] = [];
      }
      eventListener[this.url][kk].push(vv);
    });
    return this;
  }
}

export function eventStream(url: string, withCredentials = true) {
  return new eStream(url, withCredentials);
}
