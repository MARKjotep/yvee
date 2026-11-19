export interface RenderedContent {
    html: string;
    commit?: () => void | Promise<void>;
}
export type ContentRenderer = (value: unknown, parentId?: string) => RenderedContent | Promise<RenderedContent>;
export declare const setContentRenderer: (next: ContentRenderer) => () => void;
export declare const renderContent: (value: unknown, parentId?: string) => Promise<RenderedContent>;
