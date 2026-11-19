/** Generates a sequence of hierarchical DOM IDs for rendered nodes. */
export declare class Idm {
    private counter;
    private readonly baseId;
    constructor(rawId?: string);
    get id(): string;
    get nextId(): string;
    get childId(): Idm;
    append(prefix?: string): Idm;
}
