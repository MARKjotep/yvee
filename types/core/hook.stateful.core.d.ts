import type { Mapper, maybePromise } from "@/utils";
import { type IStateful, type statefulValue } from "./stateful.core";
export type hookFN<T extends any[]> = (...args: statefulValue<T>) => maybePromise<void>;
export type hookM<T extends any[]> = Mapper<string, hookFN<T>>;
interface stateCFG {
    id?: string;
    init?: boolean;
}
export declare function StateHook<T extends any[]>(callback: hookFN<T>, statefuls: [...{
    [K in keyof T]: IStateful<T[K]>;
}], { id, init }?: stateCFG): Promise<() => void>;
export declare function StateLoaded<T extends any[]>(callback: hookFN<T>, statefuls: [...{
    [K in keyof T]: IStateful<T[K]>;
}], { id, init }?: stateCFG): Promise<() => void>;
export declare function hook<T extends any[]>(callback: hookFN<T>, statefuls: [...{
    [K in keyof T]: IStateful<T[K]>;
}], init?: boolean): [hookFN<T>, [...{
    [K in keyof T]: IStateful<T[K]>;
}], boolean, boolean];
export declare function loaded<T extends any[]>(callback: hookFN<T>, statefuls: [...{
    [K in keyof T]: IStateful<T[K]>;
}], init?: boolean): [hookFN<T>, [...{
    [K in keyof T]: IStateful<T[K]>;
}], boolean, boolean];
export declare const handleHooks: (hooks: hookM<any>) => Promise<boolean>;
export declare const handleLoads: (hooks: hookM<any>) => Promise<boolean>;
export {};
