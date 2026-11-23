import {
  dom,
  type DOMAttr,
  type DOMComponent,
  type DOMContext,
} from "yvee";

/* --------------------------------------------------------------------------
 * Optional JSX attributes accept an explicit `undefined`.
 * -------------------------------------------------------------------------- */

type FieldProps = {
  disabled?: boolean;
  ariaLabel?: string;
  title?: string;
  phase?: string;
  on?: DOMAttr["on"];
  ref?: DOMAttr["ref"];
  style?: DOMAttr["style"];
};

function Field(props: FieldProps) {
  // Forwarding an optional value must type-check under `exactOptionalPropertyTypes`.
  return (
    <input
      disabled={props.disabled}
      aria-label={props.ariaLabel}
      title={props.title}
      data-phase={props.phase}
      on={props.on}
      ref={props.ref}
      style={props.style}
    />
  );
}

// Explicit `undefined` in an attribute spread is also accepted.
const attrs: DOMAttr = {
  disabled: undefined,
  class: undefined,
  id: undefined,
  on: undefined,
  ref: undefined,
  style: undefined,
  title: undefined,
  "data-phase": undefined,
};

function Spread(props: FieldProps) {
  return <button {...attrs} disabled={props.disabled} />;
}

// Event maps accept explicitly-undefined handlers.
const events: NonNullable<DOMAttr["on"]> = {
  click: undefined,
  ready: undefined,
  state: undefined,
};

function Events() {
  return <button on={events} />;
}

/* --------------------------------------------------------------------------
 * Required attributes/props stay strict.
 * -------------------------------------------------------------------------- */

type RequiredProps = { label: string };

function Label(props: RequiredProps) {
  return <span>{props.label}</span>;
}

// @ts-expect-error A required component prop may not be omitted.
const missingProp = <Label />;

/* --------------------------------------------------------------------------
 * Children are rest arguments, never on props.
 * -------------------------------------------------------------------------- */

// Documented idiom: own props type + rest-args children.
function Card(props: { title: string }, ...children: DOMContext[]) {
  return (
    <section>
      <h2>{props.title}</h2>
      {children}
    </section>
  );
}

const typedCard: DOMComponent<{ title: string }> = Card;

// Children render through the rest-args idiom.
const card = (
  <Card title="Hello">
    <p>Body</p>
  </Card>
);

// Children are passed as rest args; `props.children` does not exist.
function BrokenCard(props: { title: string }) {
  // @ts-expect-error `props.children` is always undefined — read the rest args instead.
  return <p>{props.children}</p>;
}

/* --------------------------------------------------------------------------
 * Keep the values referenced so the file type-checks as a module.
 * -------------------------------------------------------------------------- */

void Field;
void Spread;
void Events;
void typedCard;
void card;
void BrokenCard;
void missingProp;
