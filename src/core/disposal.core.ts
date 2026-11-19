export type Cleanup = () => void;
export type Disposable = { dispose(): void } | { close(): void };

/** Synchronous resource ownership. Disposal is idempotent and attempts every cleanup. */
export class DisposalScope {
  private readonly controller = new AbortController();
  private readonly cleanups = new Set<Cleanup>();
  get signal() { return this.controller.signal; }
  get disposed() { return this.signal.aborted; }

  defer(cleanup: Cleanup): Cleanup {
    let active = true;
    const release = () => {
      if (!active) return;
      active = false; this.cleanups.delete(release); cleanup();
    };
    if (this.disposed) release();
    else this.cleanups.add(release);
    return release;
  }

  own<T extends Disposable>(resource: T): T {
    this.defer(() => { if ('dispose' in resource) resource.dispose(); else resource.close(); });
    return resource;
  }

  listen(target: EventTarget, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): Cleanup {
    if (this.disposed) return () => {};
    target.addEventListener(type, listener, options);
    return this.defer(() => target.removeEventListener(type, listener, options));
  }

  timeout(callback: () => void, ms: number): Cleanup {
    if (this.disposed) return () => {};
    const timer = setTimeout(() => { release(); if (!this.disposed) callback(); }, ms);
    const release = this.defer(() => clearTimeout(timer));
    return release;
  }

  dispose(): void {
    if (this.disposed) return;
    this.controller.abort();
    const errors: unknown[] = [];
    for (const cleanup of [...this.cleanups].reverse()) {
      try { cleanup(); } catch (error) { errors.push(error); }
    }
    if (errors.length) throw new AggregateError(errors, 'Resource cleanup failed.');
  }
}
