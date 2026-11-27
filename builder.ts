import { Roll, Oven } from "@xyrah/oven";

/**
 * Automatic JSX transform shared by the package entries: Bun resolves
 * `yvee/jsx-runtime` through the root tsconfig paths, so the emitted bundles
 * are self-contained and only consumers compiling their own `.tsx` resolve the
 * published subpath.
 */
const jsx = {
  runtime: "automatic",
  importSource: "yvee",
  development: false,
} as const;

/**
 * `index.ts` and the top-level `jsx-runtime.ts` facade are built together with
 * splitting on: Bun emits `dist/index.js` + `dist/jsx-runtime.js` plus shared
 * chunks, so both entry modules use the same bundled renderer instance.
 */
const Ov = new Oven({
  files: ["./index.ts", "./jsx-runtime.ts"],
  external: [],
  jsx,
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
