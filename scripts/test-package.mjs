import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFile, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const directory = await mkdtemp(join(tmpdir(), "truncate-middle-package-"));
const root = new URL("../", import.meta.url);
try {
  const archive = join(directory, "package.tgz");
  execFileSync("pnpm", ["pack", "--out", archive], { cwd: root, stdio: "pipe" });
  execFileSync("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", archive], {
    cwd: directory,
    stdio: "pipe",
  });
  const packageRoot = join(directory, "node_modules", "truncate-middle");
  const metadata = JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"));
  const source = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
  assert.equal(metadata.version, source.version);
  assert.deepEqual(metadata.dependencies ?? {}, {}, "retain zero runtime dependencies");
  assert.match(await readFile(join(packageRoot, "docs", "api.md"), "utf8"), /Intl\.Segmenter/);
  assert.ok(
    (await readFile(join(packageRoot, "CHANGELOG.md"), "utf8")).includes(`## ${metadata.version}`),
    "packed changelog must contain the candidate version"
  );

  await copyFile(new URL("test-runtime.mjs", import.meta.url), join(directory, "runtime.mjs"));
  execFileSync(process.execPath, ["runtime.mjs"], { cwd: directory, stdio: "inherit" });
  await writeFile(
    join(directory, "types.mts"),
    `import original, { truncateMiddle, truncateMiddleGraphemes } from "truncate-middle";
const a: string = original(null);
const b: string = truncateMiddle(undefined);
const c: string = truncateMiddleGraphemes("👩‍💻abcdef🇸🇬", 1, 1, "…");
// @ts-expect-error Lengths must be numbers.
truncateMiddleGraphemes("abc", "1", 1);
void [a, b, c];
`
  );
  await writeFile(
    join(directory, "types.cts"),
    `import api = require("truncate-middle");
const a: string = api.default(null);
const b: string = api.truncateMiddle(undefined);
const c: string = api.truncateMiddleGraphemes("🇸🇬abcdef🇺🇸", 1, 1, "…");
void [a, b, c];
`
  );
  await writeFile(
    join(directory, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        noEmit: true,
        module: "Node16",
        moduleResolution: "Node16",
        target: "ES2020",
        lib: ["ES2020"],
      },
      files: ["types.mts", "types.cts"],
    })
  );
  execFileSync(
    process.execPath,
    [fileURLToPath(new URL("node_modules/typescript/bin/tsc", root)), "-p", directory],
    { cwd: directory, stdio: "inherit" }
  );
} finally {
  await rm(directory, { recursive: true, force: true });
}
