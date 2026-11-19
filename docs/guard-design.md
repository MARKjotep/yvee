# Guard design and client guard ideas

This is a proposal, not an API announcement. Only `requireGuard`, `allGuards`,
`whenGuard`, `paramsGuard`, `createGuard`, `use` and the existing guard runner
are implemented. Names below describe possible helpers or application recipes.

## What the current API actually does

`loadPage` creates the destination page, attaches its resource scope and runs
global guards followed by decorated page guards. Guards run before page fetch,
body and head work. The context contains the destination URL, route params,
page, app, data and navigation signal. A guard can allow, stop or redirect.
The runner checks abort before and after awaiting each guard.

That provides entry checks. It does not provide departure checks, source-page
context, a navigation reason, an awaitable navigation outcome, or automatic
rechecking when identity or permissions change on the displayed page. The
runner also cannot finish an aborted transition while a guard promise that
ignores its signal remains pending. Global guards run for error pages too.

Keep framework mechanisms generic. Applications should supply identity
resolvers, permission predicates, flags and destinations; Yvee should not choose
a token format, role hierarchy or sign-in endpoint.

## Candidate guards

| Candidate | Useful behavior | Inputs and fallback | Fit with current API |
| --- | --- | --- | --- |
| Session readiness / signed-in | Wait until identity is resolved, then allow or redirect to sign-in. Avoid treating loading as logged out. | Inject a signal-aware resolver; distinguish anonymous, signed-in and failed resolution. Preserve only a validated local return path. | Application recipe now; shared resolver/cancellation contract needs design. |
| Guest-only | Keep an authenticated user out of sign-in/sign-up pages. | Same identity resolver as the signed-in guard; redirect to the account route. | `requireGuard` recipe now. Exclude the destination from the inverse guard to avoid loops. |
| Permission / capability | Require an action such as `project:edit`, optionally scoped to a tenant/resource. | Application predicate over resolved identity and resource metadata; show a forbidden route rather than sending every denial to sign-in. | Recipe now. An optional reusable `any`/`all` permission helper should accept predicates, not prescribe role names. |
| Feature flag | Gate a route on a resolved feature flag and provide an unavailable route. | Per-user/request flag snapshot; explicit behavior while flags are loading or unavailable. | `requireGuard`/`whenGuard` recipe now. Keep SSR and initial client snapshots consistent. |
| Query validation | Reject or canonicalize invalid sort/page/filter values before fetching. | Validate repeated keys, allowed values, length/range limits and unknown-key policy. Define where parsed values live. | New useful primitive alongside `paramsGuard`; a canonicalization redirect must settle after one rewrite. |
| Resource availability | Check that an item exists and is accessible before showing its editor. | Signal-aware resource resolver; separate missing, forbidden and unavailable outcomes. | Recipe now, but share the resolved result with page fetch to avoid duplicate requests. Prefer the normal loader/error-page path when it already expresses the result. |
| Onboarding / workflow step | Send a user to the first incomplete setup step. | Server-backed progress, allowed revisit policy and an explicit destination for completion. | Recipe now. Test direct deep links, Back, session changes and redirect cycles. |
| Unsaved changes / leave | Keep a dirty editor open until the user confirms or saves. | Current page's dirty state and an accessible app-supplied dialog; cancel pending dialog on superseding navigation. | **Requires a new leave lifecycle.** A destination entry guard cannot reliably own the departing editor. |
| Cached data / offline availability | Allow a cached read-only route while offline, or show an offline fallback when required data is absent. | Inspect actual cache availability and freshness; treat `navigator.onLine` only as a hint. | Recipe now for entry checks. Queueing writes, syncing and conflict resolution belong to a data layer. |
| Browser capability | Provide an alternative when a route requires IndexedDB, media access or another optional capability. | Inject feature detection; handle access failures as well as API presence. Define an SSR policy. | Recipe now. Do not trigger permission prompts from automatic navigation; request access through a deliberate user action. |
| Locale / canonical URL | Validate a supported locale and normalize its route/query representation. | App locale list and a deterministic canonicalizer; preserve valid search/hash content. | Recipe now. Document SSR parity and update document language; repeated redirects must be impossible. |
| Consent / eligibility | Gate an optional feature until application-specific consent or eligibility is resolved. | Application-owned status and UI; explicit unavailable/declined behavior. | Recipe now for route UX. Resource loading must also respect the decision: scripts should not execute during staging before approval. |

Do not add a helper for every row immediately. Start with recipes for policies
already expressible through `requireGuard`; promote repeated mechanics into
small, typed primitives. The most valuable new mechanisms are leave guards,
query validation, identity readiness, active-route revalidation and cancellation.

For example, a permission recipe using today's API is enough for simple cases:

```ts
import { requireGuard, type GuardContext } from "yvee";

const canEdit = requireGuard<GuardContext<unknown, unknown, {
  permissions: readonly string[];
}>>(
  ({ data }) => data.permissions.includes("project:edit"),
  { kind: "redirect", to: "/forbidden", replace: true },
);
```

Use the same server-authoritative permission decision in the API. A client guard
controls the interface and can be bypassed; storing a claim in browser storage
does not make it trusted. The existing [authentication example](../examples/README.md)
shows request-owned identity without a framework-wide session format.

## Lifecycle decisions to settle before adding APIs

1. **Departure and entry are separate phases.** Supply the departing page,
   committed `from` URL, proposed `to` URL and navigation cause to leave checks.
   For programmatic/link navigation, run them before history writes and target
   page acquisition. For Back/Forward, account for the browser already moving
   the history pointer; track entry positions so cancellation restores the
   original entry without adding duplicate entries or rerunning prompts.
2. **Define interruption.** A newer navigation or disposal aborts the old guard
   context and dismisses its dialog. Race awaiting against abort so a guard that
   never settles cannot keep loading forever. Cooperative cancellation is still
   required to stop its work, and late results must never commit.
3. **Bound waiting explicitly.** An optional timeout should produce a distinct
   error/outcome with a configurable fallback, dispose acquired guard resources
   and clear timers. It must never silently grant access. Share identity refresh
   work per app/session while isolating SSR requests and individual cancellation.
4. **Expose navigation results.** Callers should be able to await committed,
   stopped, redirected, superseded or failed outcomes. Preserve the existing
   convenience navigation surface while adding a typed awaitable path.
5. **Revalidate the displayed route.** Define what happens on logout, permission
   revocation, tenant switch or a flag change without a URL change. Cancel old
   work, clear identity-scoped caches and choose one new destination; do not
   install permanent global subscriptions per guard execution.
6. **Define denial and errors.** Keep a deliberate stop separate from resolver
   failure, cancellation, timeout and a 401/403 response. Error pages and sign-in
   routes need explicit guard scopes so global guards cannot create recovery
   loops. Validate redirects against same-origin/base policy and track visited
   destinations; a numeric redirect limit alone gives poor diagnostics.
7. **Keep SSR deterministic.** Client-only checks need an explicit server
   policy. Browser reads cannot run during SSR. Resolve permissions and flags
   from request-owned data, and keep the initial public client snapshot aligned.
   Document the difference between SSR following a redirect internally and a
   server adapter returning an HTTP redirect.
8. **Own effects and resources.** Give guard work a transition lifetime and a
   clear transfer policy for data reused by the page. Keep predicates free from
   analytics, script injection and repeated mutation where possible. Commit
   effects only after the route has been approved and still owns the transition.

Closing a tab, refreshing, following an external link and SPA navigation are
different departure paths. A proposed leave API should document native
`beforeunload` limits, install its listener only while dirty and avoid promising
an async custom confirmation dialog during browser shutdown.

## Suggested implementation order and acceptance tests

1. Specify navigation outcomes and guard phases; add cancellation/timeout and
   redirect-loop regression cases before changing the navigation pipeline.
2. Implement leave handling for link/programmatic navigation, then Back/Forward
   and replace. Verify cancellation preserves page resources, URL, scroll,
   focus and the actual history index. Test rapid clicks and a second departure
   while a confirmation dialog is open.
3. Add `queryGuard` and permission/feature recipes with consumer type checks.
   Cover repeated query parameters, invalid encoding and canonicalization loops.
4. Add session readiness and active-route revalidation recipes. Verify one
   refresh for concurrent consumers, independent SSR users, stale refresh after
   logout, denied permissions and explicit resolver failures.
5. Add cache/capability recipes with unavailable storage, expired cached data
   and offline startup. Audit confirmation dialogs with keyboard and screen
   reader testing as well as Axe.

Every primitive should cover allow/stop/redirect, rejection, already-aborted and
mid-flight-aborted signals, superseded results, cleanup errors and error-page
recovery. Test lifecycle behavior in real browsers and inference/invalid calls
in the consumer type suite. Pure wrappers should reuse the existing runner's
contract rather than creating another execution engine.
