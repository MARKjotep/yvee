export { Yvee } from "./app";
/**
 * Automatic JSX runtime (`yvee/jsx-runtime`). Re-exported here so its value
 * and type declarations ship in `dist/index.d.ts`; the dedicated
 * `yvee/jsx-runtime` subpath points its `types` at that file.
 */
export * from "./jsx-runtime";
export { MissingPage } from "./pages/page";
export { FailurePage } from "./pages/page";
export type { YveeOptions, MountOptions, RenderResult, Layout } from "./app";
export { Page } from "./pages/page";
export type {
  PageFetchContext,
  RegionLoader,
  RegionModule,
  RegionCache,
  RegionLeaveContext,
  RegionEnterContext,
} from "./pages/page";
export { page, route, error, socketRoute, RouteBook, interpolate } from "./routing/routes";
export type { Constructor, RouteEntry, Transport } from "./routing/routes";
/** Flatten a nested region declaration into `Page.regions`; `regionLevel` marks a chrome+views level. Level metadata is readable with `regionLevelIds` and `defaultViewFor`. */
export { regionTree, regionLevel, regionLevelIds, defaultViewFor } from "./routing/region-tree";
export type {
  RegionChromeContext,
  RegionChromeModule,
  RegionChromeLoader,
  RegionLevel,
  RegionLevelMetadata,
  RegionLevelOptions,
} from "./routing/region-tree";
/** Create and compose route guards; `buildReturnTo`/`readReturnTo` handle the rejected-URL round-trip. */
export { createGuard, use, buildReturnTo, readReturnTo } from "./guards";
/**
 * Guard types. `GuardContextInput` is the shape accepted by the guard runner, and
 * `GuardRedirect.returnTo` preserves the rejected URL as a `?returnTo=` parameter.
 * `RegionGuard`/`RegionGuardContext` add the region transition to the same contract.
 */
export type {
  Guard, GuardApp, GuardContext, GuardContextInput, GuardRedirect, GuardResult, GuardFactory,
  RegionGuard, RegionGuardContext,
} from "./guards";
/** `true` in a browser (a `window` exists); `false` during SSR and in other server-like runtimes. */
export { isClient } from "./platform/env";
export { HeadDefaults, applyHead } from "./rendering/head";
export type { HeadConfig, HeadResult } from "./rendering/head";
export { toURL, normalizePath } from "./routing/path";
export type { YveeURL } from "./routing/path";
export type { ServerOptions, ServerRequest, ServerRenderer, ServerStatusResult, ServerDataContext } from "./rendering/server";
export { BrowserStore, StoredValue, local, session } from "./platform/storage";
export { VersionedValue } from "./platform/storage";
export type { StorageSchema, StorageChange, StorageWatchOptions } from "./platform/storage";
export { requestJSON, HTTPError } from "./platform/request";
/** Read a named cookie value; `undefined` without a `document` or when the cookie is absent. */
export { readCookie } from "./platform/cookie";
/** Submit JSON or `FormData`; resolves `{ ok, status, data?, error? }` instead of throwing. */
export { requestForm } from "./platform/request";
export type { JSONRequestOptions, RequestRetry } from "./platform/request";
/** Options and result types for `requestJSON` CSRF handling and `requestForm` submissions. */
export type { CsrfOptions, FormRequestOptions, FormResult } from "./platform/request";
/** `SocketConnectionState` is the connected/connecting/closed state exposed by `SocketController.state`. */
export type { MessageFailure, JsonMessageOptions, SocketLoadOptions, SocketConnectionState } from "./platform/websocket";
export { SocketController, SocketHub } from "./platform/websocket";
export type { StreamHandlers, StreamOptions } from "./platform/streams";
export { eventStreams } from "./platform/streams";
export { requireGuard, allGuards, whenGuard, paramsGuard } from "./guards";
export type { ContextGuard, GuardPredicate, GuardFallback, GuardRejection } from "./guards";

export { serializePayload, renderJSONScript } from "../dom/render/trust.dom";
