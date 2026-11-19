import {
  dom
} from "./index-zw79xwpr.js";

// test/yvee-bun/views/home.tsx
function HomeView() {
  return /* @__PURE__ */ dom("section", {
    class: "route-card home-card"
  }, /* @__PURE__ */ dom("p", {
    class: "eyebrow"
  }, "Bun server · Yvee client"), /* @__PURE__ */ dom("h1", null, "Home route"), /* @__PURE__ */ dom("p", null, "This page view lives in its own TSX module. Its route imports this view and its stylesheet URL."), /* @__PURE__ */ dom("a", {
    class: "route-link",
    href: "/features"
  }, "Open the features route"));
}
export {
  HomeView as default
};
