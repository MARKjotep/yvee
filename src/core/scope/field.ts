import { registerScopes, resolveScope, type ScopeConfig } from "./registry";

export type ScopeDecorator<V> = <This>(
  value: undefined,
  context: ClassFieldDecoratorContext<This, V>,
) => (this: This, initialValue: V) => V;

export type ScopeProxy<T extends object> = {
  readonly [K in keyof T]: ScopeDecorator<T[K]>;
};

export interface FieldScopeSet<C extends ScopeConfig> {
  use<Name extends keyof C & string>(name: Name): ScopeProxy<C[Name]>;
}

/** Standard class-field decorators backed by the same registry as Scope. */
export class _FieldScope {
  static register<C extends ScopeConfig>(config: C): FieldScopeSet<C> {
    registerScopes(config);
    return {
      use: <Name extends keyof C & string>(name: Name) =>
        Field.use<C[Name]>(name),
    };
  }

  static use<T extends object>(name: string): ScopeProxy<T> {
    return new Proxy({} as ScopeProxy<T>, {
      get(_target, key: string | symbol) {
        return (_value: undefined, context: ClassFieldDecoratorContext) => {
          if (context.kind !== "field")
            throw new TypeError("Field scope can only decorate class fields.");
          return function () {
            const scope = resolveScope<T>(name);
            if (!Object.hasOwn(scope, key)) {
              throw new Error(
                `Scope field is not registered: ${name}.${String(key)}`,
              );
            }
            return Reflect.get(scope, key);
          };
        };
      },
    });
  }
}

/**
 * Describes the static interface of the Field class
 */
interface FieldScopeStatic {
  register<Config extends Record<string, Record<string, any>>>(
    data: Config,
  ): FieldScopeSet<Config>;
  use<T extends Record<string, any>>(name: string): ScopeProxy<T>;
}

export type Field = _FieldScope;
export const Field: FieldScopeStatic = _FieldScope;
