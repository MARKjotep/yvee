# Browser runtime ownership

`../runtime.ts` remains the compatibility entry point. Public application code
continues to use `Yvee`; the services here are internal implementation details.

| Module | Responsibility |
| --- | --- |
| `client.ts` | Coordinates mount/unmount, URL subscriptions, loads, redirects and transition commits. Owns revisions, load cancellation and page lifetimes. |
| `view.ts` | Stages head resources, tracks the active head and committed body/head snapshots, and rolls back failed body/head activation. |
| `history.ts` | Writes browser history, tracks the identity of the displayed entry and retains a bounded cache of scroll positions. |
| `scroll.ts` | Waits for rendering frames, restores positions or hash targets and respects reduced motion. |
| `accessibility.ts` | Owns the route live region and applies focus/title announcements after a successful transition. |
| `types.ts` | Defines runtime options and shared position types. |

The coordinator supplies revision checks to services that wait for asynchronous
work. Helpers do not increment revisions or start their own navigations. Keep
the commit ordering explicit: load, stage head, await styles, flush body, activate
head, transfer page ownership, restore scroll, then focus/announce. An old
transition must never commit resources into a newer mount.

On popstate, the browser has already switched entries while the old page is
still displayed. `RouteHistory.pop` captures the old page's position under its
displayed entry identity before looking up the new entry's position. Preserve
this distinction when changing Back/Forward or cancellation handling.

The head configuration and browser/SSR rendering primitives are in
`../../rendering/head/`; `view.ts` only owns their route lifecycle.
