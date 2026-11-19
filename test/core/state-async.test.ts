import { describe, expect, it } from 'bun:test';
import { batch, State, Stateful, StateHook, StateLoaded, StateEffect, DisposalScope } from '../../src';

function gate() { let release!: () => void; const promise = new Promise<void>(resolve => { release = resolve; }); return { promise, release }; }

describe('state async contracts', () => {
  it('flush waits for hooks and loaded callbacks and batching publishes final values', async () => {
    const state = State(0); const seen: number[] = []; const loaded: number[] = [];
    const waiting = gate();
    const stop = await StateHook<[number]>(async value => { await waiting.promise; seen.push(value); }, [state]);
    const done = await StateLoaded<[number]>(value => { loaded.push(value); }, [state]);
    batch(() => { state.value = 1; batch(() => { state.value = 2; }); state.value = 3; });
    expect(state.value).toBe(3); expect(seen).toEqual([]);
    let finished = false; const flush = state.flush().then(() => { finished = true; });
    await Promise.resolve(); expect(finished).toBe(false);
    waiting.release(); await flush;
    expect(seen).toEqual([3]); expect(loaded).toEqual([3]);
    stop(); done();
  });
  it('reports rejected hooks, preserves other subscribers, and rejects flush once', async () => {
    const errors: unknown[] = []; const state = State(0, { onError: error => errors.push(error) });
    const stop = await StateHook<[number]>(async () => { throw new Error('hook failed'); }, [state]);
    let other = 0; const stopOther = await StateHook<[number]>(() => { other++; }, [state]);
    state.value = 1;
    await expect(state.flush()).rejects.toThrow('hook failed');
    expect(errors).toHaveLength(1); expect(other).toBe(1);
    await state.flush(); stop(); stopOther();
  });
  it('supersedes blocked work and aborts effects on scope disposal', async () => {
    const state = State(0); const scope = new DisposalScope(); const waiting = gate(); const committed: number[] = [];
    const contexts: AbortSignal[] = [];
    await StateEffect<[number]>(async (update, value) => {
      contexts.push(update.signal);
      if (value === 1) await waiting.promise;
      if (update.isCurrent()) committed.push(value);
    }, [state], { scope });
    state.value = 1; state.value = 2; await state.flush();
    expect(contexts[0]?.aborted).toBe(true); expect(committed).toEqual([2]);
    waiting.release(); await Promise.resolve(); expect(committed).toEqual([2]);
    scope.dispose(); expect(contexts[1]?.aborted).toBe(true);
    state.value = 3; await state.flush(); expect(committed).toEqual([2]);
  });
  it('removes partially installed hooks when initialization fails or signal aborts', async () => {
    const state = new Stateful(0); const abort = new AbortController();
    await expect(StateHook<[number]>(() => { throw new Error('init'); }, [state], { init: true })).rejects.toThrow('init');
    await StateHook<[number]>(() => {}, [state], { signal: abort.signal }); abort.abort();
    expect((state as unknown as { hooks: Map<string, unknown> }).hooks.size).toBe(0);
  });
});
