import {
  Yvee, Page, State, StateHook, StateEffect, batch, Scope, DisposalScope,
  SocketController, eventStreams, local, session, dom, Derived, requestJSON, IndexedDatabase, Schema, t,
  type PageFetchContext, type ServerOptions, type Guard, type JsonMessageOptions,
} from 'yvee';

type Data = { user: { name: string }; count: number };
class UserPage extends Page<Data> {
  override fetch(context: PageFetchContext<Data>) {
    context.resources.defer(() => {});
    return { count: context.data.count + 1 };
  }
  override body() { return <p>{this.data.user.name}</p>; }
}
const app = new Yvee<Data>();
app.route('/users/:id')(UserPage);
app.use(context => {
  const name: string = context.page.data.user.name;
  const count: number = context.data.count;
  context.app.resources.defer(() => {});
  // @ts-expect-error Typed page context must reject unknown data fields.
  context.page.data.missing;
  return name && count ? { kind: 'allow' } : { kind: 'stop' };
});
const guard: Guard<Yvee<Data>, Page<Data>, Data> = ({ data }) => data.count ? { kind: 'allow' } : { kind: 'stop' };
app.use(guard);
const options: ServerOptions<Data> = { dataFactory: ({ data, signal, onDispose }) => {
  signal.throwIfAborted(); onDispose(() => {});
  return data ?? { user: { name: 'anonymous' }, count: 0 };
} };
app.server(options);
// @ts-expect-error Request data must satisfy the app's data contract.
app.server()({ url: '/', data: { count: 0 } });
const state = State(1, { onError(error: unknown) { console.error(error); } });
state.value = 2;
state.flush();
// @ts-expect-error State values remain typed.
state.value = 'wrong';
StateHook<[number]>(value => { value.toFixed(); }, [state], { scope: app.resources });
StateEffect<[number]>(async ({ signal }, value) => { signal.throwIfAborted(); value.toFixed(); }, [state]);
batch(() => { state.value = 3; });
const scope = Scope.create({ request: { user: 'alice' } });
const user: string = scope.use('request').user;
// @ts-expect-error Scope names must be registered in this local container.
scope.use('missing');
const ownership = new DisposalScope();
ownership.own(eventStreams('/events', {}, { signal: ownership.signal }));
const rules: JsonMessageOptions<{ name: string }> = { validate: (value): value is { name: string } => typeof value === 'object' && value !== null && 'name' in value && typeof value.name === 'string' };
new SocketController().onMessage(value => { value.name.toUpperCase(); }, rules);
local.set('user', user);
local.get<number>('count', 0).set(2).save();
// @ts-expect-error StoredValue.set preserves the declared value type.
local.get<number>('count', 0).set('wrong');

const doubled = await Derived([state], value => value * 2);
const number: number = doubled.value;
// @ts-expect-error Derived values are read-only.
doubled.value = 4;
// @ts-expect-error Async calculations belong in StateEffect.
await Derived([state], async value => value * 2);
const request = await requestJSON('/api/count', { validate: (value): value is number => typeof value === 'number' });
request.toFixed();
const counter = session.versioned('count', { version: 1, validate: (value): value is number => typeof value === 'number', fallback: () => 0 });
counter.set(1);
// @ts-expect-error Versioned values retain the schema type.
counter.set('wrong');
const schema = new Schema<{ id: number; title: string }>('drafts', { id: t.serial().primary, title: t.text() });
const db = await IndexedDatabase.open('drafts', 1, [schema]);
const draft = await db.repository(schema).find(1);
draft?.title.toUpperCase();
db.close(); doubled.dispose();
