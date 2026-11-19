import type { IStateful } from "@/core/state/stateful.core";
import type { V } from "@/utils";

export type DVal<T = V | V[]> = T | IStateful<T> | undefined;
