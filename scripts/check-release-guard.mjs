import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  archiveIntegrity,
  compareVersions,
  registryState,
  validateRelease,
  verifyPublished,
} from "./release-check.mjs";

const pkg = { name: "example-package", version: "2.10.0" };
const integrity = archiveIntegrity(Buffer.from("checked tarball"));
const entry = (version, hash = integrity) => ({
  name: pkg.name,
  version,
  dist: { integrity: hash },
});
const data = (latest, versions = { [latest]: entry(latest) }) => ({
  name: pkg.name,
  "dist-tags": { latest },
  versions,
});
const response =
  (body, status = 200) =>
  async () => ({ status, json: async () => body });

test("validates stable release identity and compares unbounded numeric components", () => {
  assert.equal(validateRelease(pkg, "v2.10.0"), pkg.version);
  for (const bad of ["2.01.0", "2.10.0-rc.1", "main"])
    assert.throws(() => validateRelease({ ...pkg, version: bad }, `v${bad}`));
  assert.throws(() => validateRelease({ ...pkg, private: true }, "v2.10.0"));
  assert.throws(() => validateRelease(pkg, "v2.9.0"));
  assert.throws(() => validateRelease(pkg, "v2.10.0", { version: "2.9.0" }));
  assert.equal(compareVersions("2.10.0", "2.9.99"), 1);
  assert.equal(compareVersions("999999999999999999999.0.0", "1000000000000000000000.0.0"), -1);
  assert.equal(compareVersions("2.10.0", "2.10.0"), 0);
});

test("existing archives are immutable and newer latest is preserved", async () => {
  await assert.rejects(registryState(pkg, integrity, response(null, 404)), /not found/);
  assert.equal(await registryState(pkg, integrity, response(data("2.9.0"))), "new");
  const versions = { "2.10.0": entry("2.10.0"), "3.0.0": entry("3.0.0") };
  assert.equal(await registryState(pkg, integrity, response(data("3.0.0", versions))), "published");
  await verifyPublished(pkg, integrity, { request: response(data("3.0.0", versions)) });
  await assert.rejects(registryState(pkg, integrity, response(data("3.0.0"))), /Refusing/);
  versions["2.10.0"] = entry("2.10.0", "sha512-different");
  await assert.rejects(
    registryState(pkg, integrity, response(data("3.0.0", versions))),
    /integrity/
  );
  await assert.rejects(
    verifyPublished(pkg, integrity, { request: response(data("3.0.0", versions)) }),
    /integrity/
  );
});

test("readback retries propagation only and exhausts a finite budget", async () => {
  let calls = 0;
  let sleeps = 0;
  const request = async () =>
    ++calls === 1 ? { status: 404 } : { status: 200, json: async () => data(pkg.version) };
  await verifyPublished(pkg, integrity, {
    request,
    sleep: async () => {
      sleeps++;
    },
  });
  assert.equal(calls, 2);
  assert.equal(sleeps, 1);
  await assert.rejects(
    verifyPublished(pkg, integrity, {
      request: response(null, 404),
      attempts: 3,
      sleep: async () => {},
    }),
    /exhausted 3/
  );
  calls = 0;
  await assert.rejects(
    verifyPublished(pkg, integrity, {
      request: async () => {
        calls++;
        return { status: 403 };
      },
      sleep: async () => {},
    }),
    /HTTP 403/
  );
  assert.equal(calls, 1);
});

test("registry errors and malformed or inconsistent metadata fail closed", async () => {
  for (const status of [401, 403, 429, 500])
    await assert.rejects(registryState(pkg, integrity, response(null, status)));
  for (const body of [
    {},
    { ...data("2.9.0"), name: "wrong" },
    data("bad"),
    { ...data("2.9.0"), versions: {} },
    data("2.9.0", { "2.9.0": entry("wrong") }),
  ]) {
    await assert.rejects(registryState(pkg, integrity, response(body)));
  }
  await assert.rejects(
    registryState(pkg, integrity, async () => ({
      status: 200,
      json: async () => {
        throw new Error("bad JSON");
      },
    }))
  );
  await assert.rejects(
    registryState(
      pkg,
      integrity,
      response(data(pkg.version, { [pkg.version]: { ...entry(pkg.version), name: "wrong" } }))
    )
  );
});

test("publication is main-only with credentials isolated from build code", () => {
  const workflow = readFileSync(
    new URL("../.github/workflows/publish.yml", import.meta.url),
    "utf8"
  );
  assert.match(workflow, /on:\s*\n {2}workflow_dispatch:/);
  assert.doesNotMatch(workflow, /\n {2}(push|release):/);
  const [prepare, publish] = workflow.split("\n  publish:");
  assert.doesNotMatch(prepare, /id-token: write/);
  assert.match(publish, /needs: prepare/);
  const gate = prepare.indexOf("Require successful CI on this exact source");
  assert.ok(gate > 0 && gate < prepare.indexOf("uses: pnpm/action-setup"));
  assert.ok(gate < prepare.indexOf("node scripts/release-check.mjs"));
  assert.match(prepare, /refs\/tags\/\$RELEASE_TAG\^\{commit\}/);

  assert.match(prepare, /github.ref == 'refs\/heads\/main'/);
  assert.match(publish, /github.ref == 'refs\/heads\/main'/);
  assert.match(publish, /id-token: write/);
  assert.doesNotMatch(publish, /uses: actions\/checkout|pnpm|node scripts\//);
  assert.match(publish, /'--ignore-scripts'/);
  assert.match(publish, /pkg.publishConfig/);
  assert.match(workflow, /queue: max\s*\n {2}cancel-in-progress: false/);
});

test("npm publication uses an explicit local tarball, never GitHub shorthand", () => {
  const workflow = readFileSync(
    new URL("../.github/workflows/publish.yml", import.meta.url),
    "utf8"
  );
  assert.match(workflow, /execFileSync\('npm', \['publish', '\.\/release\/package\.tgz'/);
  assert.doesNotMatch(workflow, /\['publish', 'release\/package\.tgz'/);
});

test("publisher readback allows processing delays but fails closed within five minutes", async () => {
  const { runInNewContext } = await import("node:vm");
  const workflow = readFileSync(
    new URL("../.github/workflows/publish.yml", import.meta.url),
    "utf8"
  );
  const loop = workflow.match(/ {10}const deadline = Date.now\(\)[\s\S]*?(?=\n {10}JS)/)?.[0];
  assert.ok(loop, "bounded publisher readback loop must exist");
  assert.doesNotMatch(loop, /execFileSync|npm.*publish/);

  const simulate = async (visibleAfter, corrupt = false) => {
    let now = 0;
    let reads = 0;
    const verified = new Error("verified");
    const context = {
      Date: { now: () => now },
      version: "3.0.2",
      readRegistry: async () => ({
        "dist-tags": { latest: ++reads >= visibleAfter ? "3.0.2" : "2.0.1" },
        versions: reads >= visibleAfter ? { "3.0.2": {} } : {},
      }),
      verify: () => {
        if (corrupt) throw new Error("integrity mismatch");
      },
      compare: () => 0,
      process: {
        exit: () => {
          throw verified;
        },
      },
      console: { log: () => {} },
      setTimeout: (resolve, delay) => {
        now += delay;
        resolve();
      },
    };
    try {
      await runInNewContext(`(async () => { ${loop} })()`, context);
      assert.fail("verification must return success or a diagnostic");
    } catch (error) {
      return { error, verified, now, reads };
    }
  };
  const delayed = await simulate(20);
  assert.equal(delayed.error, delayed.verified);
  assert.equal(delayed.reads, 20);
  const unavailable = await simulate(Infinity);
  assert.match(unavailable.error.message, /timed out.*Publication may have succeeded/);
  assert.equal(unavailable.now, 300000);
  const corrupt = await simulate(1, true);
  assert.match(corrupt.error.message, /integrity mismatch/);
  assert.equal(corrupt.reads, 1);
});

test("CI inspects archives without testing immutable-version publication", () => {
  const workflow = readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");
  assert.match(workflow, /npm pack .*--dry-run --ignore-scripts --json/);
  assert.doesNotMatch(workflow, /npm publish/);
  assert.match(workflow, /pnpm run test:package/);
});
