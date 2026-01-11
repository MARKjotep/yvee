import { Roll, Oven } from "@coff-r/oven";

const Ov = new Oven({});

const RP = new Roll({
  input: "./index.d.ts",
}).paths({
  "@dom": "dom",
  "@yvee": "yvee",
  "@$": "$",
  "@@": "@",
});

await Ov.clear();

Ov.onsuccess = async () => {
  await RP.tsc({
    path: "./tsconfig.build.json",
  });

  await RP.output({ file: "./index.d.ts", format: "esm" });
};

await Ov.build();
