import { Roll, Oven } from "@coff-r/oven";

const Ov = new Oven({});

const RP = new Roll({
  dir: "./types",
  input: "./index.d.ts",
}).paths({
  "@shared": "shared",
  "@features": "features",
});

await Ov.clear();

Ov.onsuccess = async () => {
  await RP.tsc({
    path: "./tsconfig.build.json",
  });
  await RP.output({ file: "./dist/index.d.ts", format: "es" });
};

await Ov.build();
