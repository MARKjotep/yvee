import {
  State,
  dom,
  frag
} from "./client-zrdjerjz.js";
// test/yvee-bun/views/features.tsx
var title = State("Features · Yvee Bun example");
var description = State("A second route with reactive browser head state.");
var ctr = State(0);
var head = () => /* @__PURE__ */ dom(frag, null, /* @__PURE__ */ dom("title", null, title), /* @__PURE__ */ dom("meta", {
  name: "description",
  content: description
}), /* @__PURE__ */ dom("link", {
  rel: "stylesheet",
  href: "/styles/features.css"
}));
function FeaturesView() {
  return /* @__PURE__ */ dom("section", {
    class: "route-card features-card"
  }, /* @__PURE__ */ dom("p", {
    class: "eyebrow"
  }, "Route-specific stylesheet"), /* @__PURE__ */ dom("h1", null, "Features route"), /* @__PURE__ */ dom("p", null, "The page imported this view and its stylesheet URL. Yvee should remove the home link and attach this route's CSS link."), /* @__PURE__ */ dom("a", {
    class: "route-link",
    href: "/"
  }, "Return home"), /* @__PURE__ */ dom("button", {
    on: {
      click() {
        ctr.value++;
        title.value = `Features · ${ctr.value} interactions`;
        description.value = `The head description updated with ${ctr.value} interaction${ctr.value === 1 ? "" : "s"}.`;
      }
    }
  }, ctr, "k"));
}
export {
  FeaturesView as default,
  head
};
