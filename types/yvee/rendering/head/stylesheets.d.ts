export declare function waitForStylesheets(links: HTMLLinkElement[]): {
    ready: Promise<undefined>;
    cancel(): void;
};
