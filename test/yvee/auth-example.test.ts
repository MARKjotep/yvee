import { expect, it } from "bun:test";
import { createAuthApp } from "../../examples/auth";

it("guards account rendering with independent request identities", async () => {
  const render = createAuthApp().server();
  const [anonymous, alice, bob] = await Promise.all([
    render({ url: "/account", data: { user: null } }),
    render({ url: "/account", data: { user: { id: "1", name: "Alice" } } }),
    render({ url: "/account", data: { user: { id: "2", name: "Bob" } } }),
  ]);
  expect(anonymous).toContain("<h1>Sign in</h1>");
  expect(alice).toContain("<p>Alice</p>"); expect(alice).not.toContain("Bob");
  expect(bob).toContain("<p>Bob</p>"); expect(bob).not.toContain("Alice");
});
