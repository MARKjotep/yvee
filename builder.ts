import { Roll, Oven } from "@ohmyqt/oven";

const Ov = new Oven({
  external: [],
});

const RP = new Roll({
  input: "./index.d.ts",
}).paths({
  "@": "",
});

await Ov.clear();

Ov.onsuccess = async () => {
  await RP.tsc({
    path: "./tsconfig.build.json",
  });

  // Keep wildcard asset declarations in a separate ambient declaration file.
  await Bun.write("./dist/assets.d.ts", Bun.file("./src/assets.d.ts"));
  await RP.output({
    file: "./index.d.ts",
    format: "esm",
    banner: '/// <reference path="./assets.d.ts" />',
  });
};

await Ov.build();
// await Ov.watch();
