import { describe, expect, it } from "bun:test";
import { State, Stateful, RecState, SetState, shallowEqual } from "../../src/core/core.core";

function updates<T>(state: unknown) {
  let count = 0;
  (state as Stateful<T>).addEventListener("updated", () => count++);
  return () => count;
}

describe("state assignment equality", () => {
  it("uses Object.is for identity, NaN, and signed zero", () => {
    const state = State<unknown>(NaN);
    const count = updates(state);
    state.value = NaN;
    expect(count()).toBe(0);
    state.value = 0;
    state.value = -0;
    expect(count()).toBe(2);
    const value = { key: "value" };
    state.value = value;
    state.value = value;
    expect(count()).toBe(3);
    state.value = { key: "value" };
    expect(count()).toBe(4);
  });

  it("accepts cyclic values without serializing them", () => {
    const first: Record<string, unknown> = {};
    first.self = first;
    const state = State(first);
    const next: Record<string, unknown> = {};
    next.self = next;
    state.value = next;
    expect(state.value).toBe(next);
  });

  it("supports shallow, custom, and always-notify policies", () => {
    const state = State({ name: "Ada" }, { equals: shallowEqual });
    const count = updates(state);
    state.value = { name: "Ada" };
    expect(count()).toBe(0);
    state.value = { name: "Grace" };
    expect(count()).toBe(1);
    const custom = State({ id: 1, label: "old" }, { equals: (a, b) => a.id === b.id });
    custom.value = { id: 1, label: "new" };
    expect(custom.value.label).toBe("old");
    const pulse = State(1, { equals: false });
    const pulses = updates(pulse);
    pulse.value = 1;
    expect(pulses()).toBe(1);
  });

  it("compares symbol keys and distinguishes sparse arrays from explicit values", () => {
    const key = Symbol();
    expect(shallowEqual({ [key]: 1 }, { [key]: 2 })).toBe(false);
    expect(shallowEqual(Array(1), [undefined])).toBe(false);
    expect(shallowEqual(new Date(0), new Date(0))).toBe(false);
  });

  it("notifies for added undefined record keys but skips NaN and empty-set clears", () => {
    const record = RecState<{ amount: number; optional?: string }>({ amount: NaN });
    const count = updates(record);
    record.set("amount", NaN);
    expect(count()).toBe(0);
    record.set("optional", undefined);
    expect(count()).toBe(1);
    expect(Object.hasOwn(record.value, "optional")).toBe(true);
    const set = SetState<number>([]);
    const sets = updates(set);
    set.clear();
    expect(sets()).toBe(0);
  });
});
