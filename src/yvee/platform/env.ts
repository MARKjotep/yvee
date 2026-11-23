/**
 * `true` when the module is evaluated in a browser (a global `window` exists).
 *
 * Evaluated once at module scope with `typeof window`, so importing this module
 * during server rendering or in Bun never throws. Use it in guards, pages and
 * auth helpers instead of repeating `typeof window === "undefined"` checks.
 */
export const isClient: boolean = typeof window !== "undefined";
