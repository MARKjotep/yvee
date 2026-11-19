import { describe, expect, it } from "bun:test";
import { Scope, Field, State, type IStateful } from "../../src/index";

interface Services {
  counter: IStateful<number>;
  label: string;
  optional: undefined;
}

const field = Field.use<Services>("scope-test-services");
class Consumer {
  @field.counter counter!: IStateful<number>;
  @field.label label!: string;
  @field.optional optional!: undefined;
}

describe("scopes", () => {
  it("resolves fields at construction time and shares service references", () => {
    expect(() => new Consumer()).toThrow("Scope is not registered");
    const counter = State(0);
    const registered = Scope.register({
      "scope-test-services": { counter, label: "first", optional: undefined },
    });
    const services = registered.use("scope-test-services");
    expect(Scope.use<Services>("scope-test-services")).toBe(services);
    const consumer = new Consumer();
    expect(consumer.counter).toBe(counter);
    expect(consumer.optional).toBeUndefined();
    consumer.counter.value++;
    expect(services.counter.value).toBe(1);
    services.label = "second";
    expect(consumer.label).toBe("first");
    expect(new Consumer().label).toBe("second");
  });

  it("supports registering through Field with the same registry", () => {
    const fields = Field.register({
      "scope-test-field": { enabled: false, count: 0 },
    });
    const linked = fields.use("scope-test-field");
    class Example {
      @linked.enabled enabled!: boolean;
      @linked.count count!: number;
    }
    const instance = new Example();
    expect(instance.enabled).toBe(false);
    expect(instance.count).toBe(0);
    expect(Scope.use<{ enabled: boolean }>("scope-test-field").enabled).toBe(
      false,
    );
  });

  it("seals a copy and rejects duplicates without partially registering a batch", () => {
    const original = { value: 1 };
    Scope.register({ "scope-test-copy": original });
    const value = Scope.use<typeof original>("scope-test-copy");
    expect(Object.isSealed(value)).toBe(true);
    expect(value).not.toBe(original);
    value.value = 2;
    expect(original.value).toBe(1);
    expect(() =>
      Scope.register({ "scope-test-uncommitted": {}, "scope-test-copy": {} }),
    ).toThrow("Scope already registered");
    expect(() => Scope.use("scope-test-uncommitted")).toThrow(
      "Scope is not registered",
    );
  });

  it("reports missing fields rather than silently injecting undefined", () => {
    const bad = Field.use<{ missing: number }>("scope-test-copy");
    class Missing {
      @bad.missing value!: number;
    }
    expect(() => new Missing()).toThrow("Scope field is not registered");
  });

});
