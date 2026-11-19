# Yvee with Bun

This example has Bun serve server-rendered Yvee routes and static assets. The
default export from `index.tsx` is `app.render({})`. The same entry is bundled
for the browser and imported by the server. Yvee checks the environment: in a
browser it reads the SSR payload and mounts the app; on a server it returns a
callable renderer. Pass it a request URL and data to receive the complete HTML string.
The renderer returns an HTML string when called directly. Its `withStatus()`
method returns `{ html, status }` when the server needs the route status.
Yvee also embeds the request data for client hydration. The Bun server supplies
request data and sends the returned document. Each
route lazily imports its view module from `views/`. Route classes and views can
contribute head elements using HTML-style TSX tags, and each route includes its stylesheet.
The app also loads `shared.css` and renders a shared SPA navigation bar.

Start the server from the repository root:

```sh
bun run demo
```

The server builds the browser entry and lazy chunks into `client/` at startup,
then imports that compiled entry for SSR. The browser loads the same entry.
Restart it after source changes. The entry document and
built JavaScript use `Cache-Control: no-store`; old files in `public/` do not
replace the current build. A separate browser build is no longer required.

Open the printed local URL and use the top navigation to visit the pages.
The **Studio** page uses a generated greenhouse image as its hero. The
**SSR data** page adds Open Graph and Twitter metadata, a canonical link, and
image preload. Inspect the document head as you navigate; Yvee should
replace route-owned metadata and CSS while retaining the shared stylesheet.
The **Async DOM** page contains an async custom DOM component and demonstrates
that Yvee awaits it during both SSR and client navigation.

The page head methods return normal TSX fragments, so tags such as
`<title>`, `<meta>`, and `<link>` use the same HTML-tag syntax as body content.
The Features button changes state used in its title and description; inspect
those tags in DevTools while clicking the button to see reactive head updates.

The SSR data route shows a request payload passed from Bun into the server
renderer. Yvee serializes that payload into an application/json script in the
document head. `app.render()` reads it before mounting. Loading the metadata route in the browser sends the SSR request
id and visitor data back to `POST /api/ssr-payload`; the page displays Bun's
response. Refresh `/metadata` to see a payload generated for that exact route.

The browser build compiles `index.tsx` into `/client/index.js` and separate
view chunks under `/client/`. Yvee adds `/client/index.js` to the document
automatically. Set `client` in `create-app.tsx` to a directory such as
`/client` to use its `index.js`, or to an explicit file such as
`client/custom.js` for a custom entry name. The server builder and Yvee use
the same setting. Route
`body()` methods return `import("../views/....tsx")`, so Bun downloads a view
chunk only when that route loads.

Refresh any route to test Bun SSR and client hydration. The client renders into
the server's body element and reuses its markup when the output matches. The
focused handoff tests live in `test/yvee-bun.test.ts` and run with `bun test`.

Click **404 demo** to visit an unregistered URL, then refresh it. Both paths
show the controller in `routes/not-found.tsx`. Register an `@error(404)`
controller with `app.register()`. When a page loads data with fetch, check
`response.ok` and throw the response to select the matching error page.
On Bun, `renderPage.withStatus({ url, error: 404 })` also handles a missing
resource at a registered URL and returns the HTML and HTTP status together.

Open the demo URL in two browsers on the same computer and expand **Room chat**
in both. Messages appear live under server-assigned guest names. The panel
stays in the layout during SPA navigation. Each browser keeps its latest 100
received messages until refresh.
