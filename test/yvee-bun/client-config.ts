/** Client asset directory or explicit entry file URL; directories use index.js. */
export const client = "/client";

const normalizedClient = client.startsWith("/") ? client : `/${client}`;

/** Browser URL for the entry module selected by `client`. */
export const clientEntry = /\.js(?:[?#]|$)/i.test(normalizedClient)
  ? normalizedClient
  : `${normalizedClient.replace(/\/+$/, "")}/index.js`;

/** URL directory that receives the entry module and its split chunks. */
export const clientDirectory = clientEntry.slice(
  1,
  clientEntry.lastIndexOf("/"),
);

/** Entry filename without its `.js` extension, used by the Bun builder. */
export const clientName = clientEntry
  .slice(clientEntry.lastIndexOf("/") + 1)
  .replace(/\.js(?:[?#].*)?$/i, "");
