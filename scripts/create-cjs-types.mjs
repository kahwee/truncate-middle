import { readdir, readFile, writeFile } from "node:fs/promises";

const directory = new URL("../dist/", import.meta.url);
for (const file of await readdir(directory)) {
  if (!file.endsWith(".d.ts")) continue;
  const declarations = await readFile(new URL(file, directory), "utf8");
  const commonjs = declarations.replace(/(from "\.\/[^"\n]+)\.js"/g, '$1.cjs"');
  await writeFile(new URL(file.replace(/\.d\.ts$/, ".d.cts"), directory), commonjs);
}
