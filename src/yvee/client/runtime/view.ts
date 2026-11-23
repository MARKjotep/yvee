import type { IStateful } from "@/core/core.core";
import { applyHead, type HeadCleanup, type HeadConfig } from "../../rendering/head";

/** Owns staged head resources and the last committed body/head for rollback. */
export class RouteView {
  active: HeadCleanup | undefined;
  nonce: string | undefined;
  /**
   * Head of the last committed route without any region contribution. Region
   * changes recombine their own head on top of this snapshot.
   */
  base: HeadConfig | undefined;
  /** Region head currently combined into the active head, if any. */
  regionHead: HeadConfig | undefined;
  private readonly pending = new Set<HeadCleanup>();
  private committedHead: HeadConfig | undefined;
  private committedBody: unknown[] | undefined;
  constructor(private readonly options: {
    id: string;
    root: IStateful<unknown[]>;
    isCurrent(revision: number): boolean;
  }) {}

  remember(body: unknown[], head: HeadConfig) {
    this.committedBody = body;
    this.committedHead = head;
  }

  reset() {
    this.committedHead = undefined;
    this.committedBody = undefined;
    this.base = undefined;
    this.regionHead = undefined;
  }

  async setBody(body: unknown[], revision: number) {
    this.options.root.value = body;
    try {
      await this.options.root.flush();
    } catch (error) {
      if (this.options.isCurrent(revision) && this.committedBody) {
        this.options.root.value = this.committedBody;
        try { await this.options.root.flush(); }
        catch (rollback) { throw new AggregateError([error, rollback], "Route commit and rollback failed."); }
      }
      throw error;
    }
  }

  async activate(nextHead: HeadCleanup, revision: number) {
    // The active cleanup owns all nodes for its route revision, including title
    // nodes. Removing by app ID here cannot match revision-scoped owners.
    this.active?.();
    try { await nextHead.activate(); }
    catch (error) {
      if (this.options.isCurrent(revision)) {
        nextHead();
        try {
          if (this.committedBody) {
            this.options.root.value = this.committedBody;
            await this.options.root.flush();
          }
          if (this.committedHead) {
            const restored = this.stage(this.committedHead, revision);
            await restored.ready;
            await restored.activate();
            this.active = restored;
            this.releasePending(restored);
          }
        } catch (rollback) { throw new AggregateError([error, rollback], "Head commit and rollback failed."); }
      }
      throw error;
    }
  }

  releasePending(head: HeadCleanup) { this.pending.delete(head); }
  releaseActive() { const active = this.active; this.active = undefined; active?.(); }

  discardPending() {
    const cleanups = [...this.pending]; this.pending.clear();
    const errors: unknown[] = [];
    for (const cleanup of cleanups) { try { cleanup(); } catch (error) { errors.push(error); } }
    if (errors.length) throw new AggregateError(errors, "Pending head cleanup failed.");
  }

  stage(config: HeadConfig, revision: number) {
    const cleanup = applyHead(
      config,
      `${this.options.id}-r${revision}`,
      {
        keepExisting: true,
        deferTitle: true,
        idSeed: `${this.options.id}:h`,
        ...(this.nonce === undefined ? {} : { nonce: this.nonce }),
      },
    );
    this.pending.add(cleanup);
    return cleanup;
  }
}
