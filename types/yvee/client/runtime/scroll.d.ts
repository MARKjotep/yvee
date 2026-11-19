import { type YveeURL } from "../../routing/path";
import type { RouteHistory } from "./history";
import type { ScrollPosition } from "./types";
export declare class RouteScroll {
    private readonly options;
    constructor(options: {
        history: RouteHistory;
        isCurrent(revision: number): boolean;
    });
    restoreScroll(position: ScrollPosition | undefined, revision: number, url: YveeURL): Promise<void>;
    scrollToRoute(url: YveeURL, revision: number): Promise<void>;
}
