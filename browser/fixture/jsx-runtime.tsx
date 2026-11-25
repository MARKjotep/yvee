/**
 * Browser fixture for the automatic JSX runtime.
 *
 * This file intentionally has zero imports: JSX compiles through
 * `jsxImportSource: "yvee"` to `yvee/jsx-runtime`, proving components work
 * without `import { dom, frag } from "yvee"`.
 */

export function JsxProbe(props: { label: string }, ...children: unknown[]) {
  return (
    <article data-jsx-probe={props.label}>
      <h2>{props.label}</h2>
      {children}
    </article>
  );
}

export function KeyedList(props: { items: string[] }) {
  return (
    <ul>
      {props.items.map((item) => (
        <li key={item} data-item={item}>
          {item}
        </li>
      ))}
    </ul>
  );
}
