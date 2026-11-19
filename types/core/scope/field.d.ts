import { type ScopeConfig } from "./registry";
export type ScopeDecorator<V> = <This>(value: undefined, context: ClassFieldDecoratorContext<This, V>) => (this: This, initialValue: V) => V;
export type ScopeProxy<T extends object> = {
    readonly [K in keyof T]: ScopeDecorator<T[K]>;
};
export interface FieldScopeSet<C extends ScopeConfig> {
    use<Name extends keyof C & string>(name: Name): ScopeProxy<C[Name]>;
}
/** Standard class-field decorators backed by the same registry as Scope. */
export declare class _FieldScope {
    static register<C extends ScopeConfig>(config: C): FieldScopeSet<C>;
    static use<T extends object>(name: string): ScopeProxy<T>;
}
/**
 * Describes the static interface of the Field class
 */
interface FieldScopeStatic {
    register<Config extends Record<string, Record<string, any>>>(data: Config): FieldScopeSet<Config>;
    use<T extends Record<string, any>>(name: string): ScopeProxy<T>;
}
export type Field = _FieldScope;
export declare const Field: FieldScopeStatic;
export {};
