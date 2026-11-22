import { createDemoApp } from "./create-app";

const app = createDemoApp();

// In a browser this starts hydration; on a server it returns a callable SSR renderer.
export default app.render({});
// Expose listPaths()/listRoutes() from the built entry for static export and tooling.
export { app };
