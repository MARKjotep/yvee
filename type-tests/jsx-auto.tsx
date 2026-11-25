/**
 * Automatic JSX without any Yvee import.
 *
 * `tsconfig.consumer.json` maps `yvee/jsx-runtime` to the source shim; this
 * file proves consumer-style `.tsx` code type-checks purely from
 * `jsxImportSource: "yvee"`.
 */

function AutoCard(props: { title: string }, ...children: unknown[]) {
  return (
    <section data-card={props.title}>
      <h2>{props.title}</h2>
      {children}
    </section>
  );
}

export const autoJsx = (
  <>
    <AutoCard title="Automatic">
      <p>child</p>
    </AutoCard>
    <ul>
      {["one", "two"].map((item) => (
        <li key={item} data-item={item}>
          {item}
        </li>
      ))}
    </ul>
  </>
);
