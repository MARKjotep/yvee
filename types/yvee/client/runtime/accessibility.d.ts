import type { YveeURL } from "../../routing/path";
/** Owns the live region; the coordinator supplies transition ownership checks. */
export declare class RouteAccessibility {
    private readonly id;
    private readonly element;
    private status;
    constructor(id: string, element: () => HTMLElement | undefined);
    dispose(): void;
    mount(): void;
    commit(url: YveeURL, isCurrent: () => boolean): void;
}
