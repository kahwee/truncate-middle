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

test("workflow remains release-only with unchanged permissions and queued publishing", () => {
  const workflow = readFileSync(
    new URL("../.github/workflows/publish.yml", import.meta.url),
    "utf8"
  );
  assert.match(workflow, /on:\s*\n {2}release:\s*\n {4}types: \[published\]/);
  assert.doesNotMatch(workflow, /\n {2}(push|workflow_dispatch):/);
  assert.match(
    workflow,
    /group: npm-release-truncate-middle\s*\n {2}queue: max\s*\n {2}cancel-in-progress: false/
  );
  assert.match(workflow, /permissions:\s*\n {2}contents: read/);
  assert.match(
    workflow,
    /permissions:\s*\n {6}contents: read\s*\n {6}actions: read\s*\n {6}id-token: write/
  );
  assert.equal((workflow.match(/id-token: write/g) || []).length, 1);
  assert.match(workflow, /if: steps.metadata.outputs.should_publish == 'true'/);
  assert.match(workflow, /--verify "\$RUNNER_TEMP\/release\/package.tgz"/);
});
