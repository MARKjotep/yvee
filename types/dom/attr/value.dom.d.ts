export declare const isBooleanAttribute: (name: string) => boolean;
/** Converts an attribute value for inclusion in generated HTML. */
export declare const attr_value: (value: unknown) => string;
/** Converts a value for Element.setAttribute; DOM APIs do not need HTML escaping. */
export declare const dom_attr_value: (value: unknown) => string;
