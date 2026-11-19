import {
  dom,
  frag
} from "./index-zw79xwpr.js";

// test/yvee-bun/views/studio.tsx
var head = () => /* @__PURE__ */ dom(frag, null, /* @__PURE__ */ dom("meta", {
  property: "og:title",
  content: "Field Studio — grow ideas in the open"
}), /* @__PURE__ */ dom("meta", {
  property: "og:image",
  content: "/assets/greenhouse-hero.png"
}));
var projects = [
  { number: "01", title: "A slower kind of technology", type: "Field note · 8 min" },
  { number: "02", title: "Designing with the seasons", type: "Research · 12 min" },
  { number: "03", title: "A greenhouse for new ideas", type: "Studio visit · 5 min" }
];
function StudioView() {
  return /* @__PURE__ */ dom("article", {
    class: "route-card studio-card"
  }, /* @__PURE__ */ dom("header", {
    class: "studio-intro"
  }, /* @__PURE__ */ dom("p", {
    class: "eyebrow"
  }, "Field studio · Issue 04"), /* @__PURE__ */ dom("h1", null, "Make room for better ideas."), /* @__PURE__ */ dom("p", {
    class: "studio-lede"
  }, "A small collection of field notes about patient technology, living systems, and the places where the two can meet.")), /* @__PURE__ */ dom("div", {
    class: "studio-hero",
    role: "img",
    "aria-label": "A glass greenhouse glowing among coastal plants at golden hour"
  }, /* @__PURE__ */ dom("div", {
    class: "studio-hero__caption"
  }, /* @__PURE__ */ dom("span", null, "North coast research house"), /* @__PURE__ */ dom("span", null, "51° 30′ N · 00° 07′ W"))), /* @__PURE__ */ dom("section", {
    class: "studio-story",
    "aria-labelledby": "studio-story-title"
  }, /* @__PURE__ */ dom("div", null, /* @__PURE__ */ dom("p", {
    class: "eyebrow"
  }, "The practice"), /* @__PURE__ */ dom("h2", {
    id: "studio-story-title"
  }, "Built to notice the small things.")), /* @__PURE__ */ dom("p", null, "The studio is a working space for experiments that need time: a prototype on one table, seedlings on another, and a long list of questions still worth asking. The best work often starts with observation instead of a roadmap.")), /* @__PURE__ */ dom("section", {
    class: "field-notes",
    "aria-labelledby": "field-notes-title"
  }, /* @__PURE__ */ dom("div", {
    class: "section-heading"
  }, /* @__PURE__ */ dom("div", null, /* @__PURE__ */ dom("p", {
    class: "eyebrow"
  }, "From the notebook"), /* @__PURE__ */ dom("h2", {
    id: "field-notes-title"
  }, "Recent field notes")), /* @__PURE__ */ dom("span", {
    class: "section-count"
  }, "03 stories")), /* @__PURE__ */ dom("div", {
    class: "field-note-list"
  }, projects.map((project) => /* @__PURE__ */ dom("article", {
    class: "field-note",
    key: project.number
  }, /* @__PURE__ */ dom("span", {
    class: "field-note__number"
  }, project.number), /* @__PURE__ */ dom("h3", null, project.title), /* @__PURE__ */ dom("span", {
    class: "field-note__type"
  }, project.type))))), /* @__PURE__ */ dom("footer", {
    class: "studio-footer"
  }, /* @__PURE__ */ dom("span", null, "Good work takes root."), /* @__PURE__ */ dom("a", {
    href: "/metadata"
  }, "Inspect the SSR data route ", /* @__PURE__ */ dom("span", {
    "aria-hidden": "true"
  }, "↗"))));
}
export {
  StudioView as default,
  head
};
