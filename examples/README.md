# Authentication guard

`auth.tsx` uses `requireGuard` on the account route. Run it through your app's
server adapter, passing identity from your verified session:

```ts
const app = createAuthApp();
const render = app.server();
// Inside the request handler, after your own session verification:
const html = await render({ url: request.url, data: { user: verifiedUser ?? null } });
```

Each request supplies its own identity. Anonymous visitors render the login page;
signed-in visitors render their account. Yvee's SSR renderer follows guard
redirects internally; use your server adapter when an HTTP redirect is required.
Initialize client data with the same public user snapshot and refresh it through
your authenticated API before protected navigation when the session changes.
Enforce authorization on the server/API too. Route guards only control rendering.

The example stores no credentials and defines no token or cookie format. Keep
private session material on the server. If your sign-in flow uses `returnTo`,
allow only local paths beginning with one `/` and reject `//` or backslashes
before navigating to user-provided input.
