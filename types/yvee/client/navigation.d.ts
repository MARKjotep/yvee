import { type YveeURL } from "../routing/path";
interface NavigationOptions {
    base: string;
    history?: boolean;
    root?: () => HTMLElement | undefined;
    onPop(url: YveeURL, state: unknown): void;
    navigate(path: string): void;
}
export declare class NavigationEvents {
    private readonly options;
    private previousScrollRestoration;
    private readonly handlePop;
    private readonly handleClick;
    constructor(options: NavigationOptions);
    start(): void;
    stop(): void;
    private isEligibleClick;
    private isWithinBase;
}
export {};
