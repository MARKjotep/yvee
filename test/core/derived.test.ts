import { expect, it } from "bun:test";
import { Derived, State, StateHook, batch, DisposalScope } from "../../src";

it("derives explicit dependencies, batches final values and supports chains", async () => {
  const a = State(1); const b = State(2);
  const sum = await Derived([a, b], (a, b) => a + b);
  const label = await Derived([sum], value => `Total ${value}`);
  const seen: number[] = [];
  const stop = await StateHook<[number]>(value => { seen.push(value); }, [sum]);
  batch(() => { a.value = 3; b.value = 4; });
  await label.flush();
  expect(sum.value).toBe(7); expect(label.value).toBe("Total 7"); expect(seen).toEqual([7]);
  stop(); label.dispose(); sum.dispose();
});

it("reports calculation failures through source flush and retains the last valid result", async () => {
  const errors: unknown[] = [];
  const source = State(1, { onError: error => errors.push(error) });
  const derived = await Derived([source], value => { if (value === 2) throw new Error("calculation"); return value * 2; });
  source.value = 2;
  await expect(derived.flush()).rejects.toThrow("calculation");
  expect(errors).toHaveLength(1); expect(derived.value).toBe(2);
  source.value = 3; await derived.flush(); expect(derived.value).toBe(6);
  derived.dispose();
});

it("releases dependencies on scope disposal and rejects aborted initialization", async () => {
  const scope = new DisposalScope(); const source = State(2);
  const derived = await Derived([source], value => value * 2, { scope });
  scope.dispose(); source.value = 5; await derived.flush();
  expect(derived.value).toBe(4); derived.dispose();
  await expect(Derived([source], value => value, { scope })).rejects.toBeInstanceOf(DOMException);
});
