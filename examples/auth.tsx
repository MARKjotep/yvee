import { Yvee, Page, requireGuard, use, type GuardContext } from "../src";
import { dom } from "../src/dom/render/node.dom";

export type AuthData = { user: { id: string; name: string } | null };

/** Supply identity resolved by the application's server session or authenticated API. */
export function createAuthApp() {
  const signedIn = requireGuard<GuardContext<Yvee<AuthData>, Page<AuthData>, AuthData>>(
    ({ data }) => data.user != null,
    ({ url }) => ({ kind: "redirect", to: `/login?${new URLSearchParams({ returnTo: url.path + url.search })}`, replace: true }),
  );

  @use(signedIn)
  class AccountPage extends Page<AuthData> {
    override body() { return <main><h1>Account</h1><p>{this.data.user?.name}</p></main>; }
  }
  class LoginPage extends Page<AuthData> {
    override body() { return <main><h1>Sign in</h1><p>Connect your application's sign-in form here.</p></main>; }
  }

  const app = new Yvee<AuthData>();
  app.route("/account")(AccountPage);
  app.route("/login")(LoginPage);
  return app;
}
