import { Stateful, type IStateful, type StateOptions } from "./stateful.core";
import { StateHook } from "./hook.stateful.core";
import type { DisposalScope } from "../disposal.core";

export type DerivedValue<T> = Readonly<IStateful<T>> & { dispose(): void };
export interface DerivedOptions<T> extends StateOptions<T> { scope?: DisposalScope; }

/** Explicit dependencies; await installation before changing inputs. Calculations are synchronous. */
export async function Derived<T extends unknown[], R>(
  states: [...{ [K in keyof T]: IStateful<T[K]> }],
  compute: (...values: T) => R extends PromiseLike<unknown> ? never : R,
  options: DerivedOptions<R> = {},
): Promise<DerivedValue<R>> {
  options.signal?.throwIfAborted();
  options.scope?.signal.throwIfAborted();
  const calculate = () => {
    const value = compute(...states.map(state => state.value) as T);
    if (value != null && typeof (value as unknown as PromiseLike<unknown>).then === "function") {
      void Promise.resolve(value).catch(() => {});
      throw new TypeError("Derived calculations must be synchronous; use StateEffect for async work.");
    }
    return value as R;
  };
  const state = new Stateful<R>(calculate(), options);
  const flushOwn = state.flush.bind(state);
  let disposed = false;
  const stop = await StateHook(async () => {
    if (!disposed) state.value = calculate();
    await flushOwn();
  }, states, options);
  state.flush = async () => {
    await Promise.all(states.map(source => source.flush()));
    await flushOwn();
  };
  const dispose = () => { disposed = true; stop(); };
  options.scope?.defer(dispose);
  Object.defineProperty(state, "dispose", { value: dispose });
  return state as unknown as DerivedValue<R>;
}
