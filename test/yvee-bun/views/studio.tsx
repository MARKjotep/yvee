export const head = () => (
  <>
    <meta property="og:title" content="Field Studio — grow ideas in the open" />
    <meta property="og:image" content="/assets/greenhouse-hero.png" />
  </>
);

const projects = [
  { number: "01", title: "A slower kind of technology", type: "Field note · 8 min" },
  { number: "02", title: "Designing with the seasons", type: "Research · 12 min" },
  { number: "03", title: "A greenhouse for new ideas", type: "Studio visit · 5 min" },
];

export default function StudioView() {
  return (
    <article class="route-card studio-card">
      <header class="studio-intro">
        <p class="eyebrow">Field studio · Issue 04</p>
        <h1>Make room for better ideas.</h1>
        <p class="studio-lede">
          A small collection of field notes about patient technology, living
          systems, and the places where the two can meet.
        </p>
      </header>

      <div
        class="studio-hero"
        role="img"
        aria-label="A glass greenhouse glowing among coastal plants at golden hour"
      >
        <div class="studio-hero__caption">
          <span>North coast research house</span>
          <span>51° 30′ N · 00° 07′ W</span>
        </div>
      </div>

      <section class="studio-story" aria-labelledby="studio-story-title">
        <div>
          <p class="eyebrow">The practice</p>
          <h2 id="studio-story-title">Built to notice the small things.</h2>
        </div>
        <p>
          The studio is a working space for experiments that need time: a
          prototype on one table, seedlings on another, and a long list of
          questions still worth asking. The best work often starts with
          observation instead of a roadmap.
        </p>
      </section>

      <section class="field-notes" aria-labelledby="field-notes-title">
        <div class="section-heading">
          <div>
            <p class="eyebrow">From the notebook</p>
            <h2 id="field-notes-title">Recent field notes</h2>
          </div>
          <span class="section-count">03 stories</span>
        </div>
        <div class="field-note-list">
          {projects.map((project) => (
            <article class="field-note" key={project.number}>
              <span class="field-note__number">{project.number}</span>
              <h3>{project.title}</h3>
              <span class="field-note__type">{project.type}</span>
            </article>
          ))}
        </div>
      </section>

      <footer class="studio-footer">
        <span>Good work takes root.</span>
        <a href="/metadata">Inspect the SSR data route <span aria-hidden="true">↗</span></a>
      </footer>
    </article>
  );
}
