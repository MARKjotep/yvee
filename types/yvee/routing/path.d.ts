export interface YveeURL {
    path: string;
    search: string;
    hash: string;
    params: URLSearchParams;
}
export declare const normalizePath: (input: string) => string;
export declare const toURL: (input: string | URL) => YveeURL;
export declare const urlKey: (url: YveeURL) => string;
