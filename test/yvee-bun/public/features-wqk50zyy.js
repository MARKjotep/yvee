import {
  dom
} from "./client-zw79xwpr.js";

// test/yvee-bun/views/features.tsx
function FeaturesView({ page }) {
  const { ctr } = page;
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
      }
    }
  }, ctr, "k"));
}
export {
  FeaturesView as default
};
