import { describe, expect, it } from "bun:test";
import { RouteBook, route, routeMetadata, socketRoute } from "../../src/yvee/routing/routes";
import { Page } from "../../src/yvee/pages/page";
import { SocketController } from "../../src/yvee/platform/websocket";
import { Yvee } from "../../src/yvee";

@route("/users/:id")
class UserPage extends Page {}

@socketRoute("/users/:id")
class ChatSocket extends SocketController {}

describe("Yvee routing", () => {
  it("lists unique page paths with base paths and sample parameter values", () => {
    const app = new Yvee({ base: "/app" });
    app.route("/")(Page);
    app.route("/users/:id")(UserPage);
    app.route("/users/id")(Page);
    app.route("/teams/:team/users/:user_id")(Page);
    app.register(ChatSocket);
    app.routes.add("/chat", ChatSocket, "socket");

    expect(app.listPaths()).toEqual([
      "/app", "/app/users/id", "/app/teams/team/users/user_id",
    ]);
    expect(app.listRoutes("page")[1]?.path).toBe("/app/users/:id");
    expect(new Yvee().listPaths()).toEqual([]);
    expect(new Yvee().register(UserPage).listPaths()).toEqual(["/users/id"]);
  });

  it("normalizes paths and captures decoded named parameters", () => {
    const routes = new RouteBook("/app");
    routes.add("/users/:id/", UserPage);

    const match = routes.find("/app//users/42%20a/?tab=details");

    expect(match?.entry.path).toBe("/app/users/:id");
    expect(match?.params).toEqual({ id: "42 a" });
  });

  it("allows a page and socket route to share a path", () => {
    const routes = new RouteBook();
    routes.add("/users/:id", UserPage);
    routes.add("/users/:id", ChatSocket, "socket");

    expect(routes.find("/users/17")?.entry.controller).toBe(UserPage);
    expect(routes.find("/users/17", "socket")?.entry.controller).toBe(ChatSocket);
  });

  it("registers decorated page and socket routes", () => {
    const routes = new RouteBook("/app");
    for (const metadata of routeMetadata(UserPage)) {
      routes.add(metadata.path, UserPage, metadata.transport);
    }
    for (const metadata of routeMetadata(ChatSocket)) {
      routes.add(metadata.path, ChatSocket, metadata.transport);
    }

    expect(routes.find("/app/users/17")?.params).toEqual({ id: "17" });
    expect(routes.find("/app/users/17", "socket")?.params).toEqual({ id: "17" });
  });
});

