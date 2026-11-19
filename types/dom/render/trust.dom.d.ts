/** Attribute definitions and CSS/code are application-authored; values may be untrusted. */
export declare function validateAttribute(name: string, value: unknown): void;
/** Inline code/CSS is trusted, but must never terminate its HTML container. */
export declare function inlineContent(tag: 'script' | 'style', value: unknown): string;
/** JSON data only: rejects undefined roots, cycles and unsupported JSON values. */
export declare function serializePayload(value: unknown): string;
export declare function renderJSONScript(value: unknown, options: {
    id: string;
    nonce?: string;
}): string;
