# Actions publishing

The release guard validates stable `v<package.json version>` tags, refuses private
packages and mismatched npm lock metadata, and stops on registry errors. A 200
response means the version is immutable; it never forces another upload.

Run `node --test scripts/check-release-guard.mjs` and
`node scripts/release-check.mjs v<version>` without publishing.
`--registry <tarball>` adds a read-only check of the public npm metadata and archive integrity.

## Approval proposal

The complete workflow is in [publish.yml](../.github/workflows/publish.yml).
The owner approved activation of this exact workflow and npm binding. The workflow
has moved to `.github/workflows/publish.yml`; private npm trust state must still be
read back through normal authenticated npm settings before configuring it.
It uses published GitHub releases, checks the exact tagged source against successful
CI, installs the frozen lockfile, checks/builds, packs and publishes the checked
tarball. It does not create versions, tags or GitHub releases. Stable releases use
`latest`; prereleases are excluded.

Approval must cover the workflow job's `contents: read`, `actions: read`, and
`id-token: write`, plus this npm trusted-publisher binding:

- npm package: `truncate-middle`
- GitHub owner: `kahwee`
- repository: `truncate-middle`
- workflow filename: `publish.yml`
- environment: blank
- allowed action: direct `npm publish` only; no extra dist-tag management grant

Use GitHub-hosted runners and npm >=11.5.1; no npm secret is needed. Configure and
read back the binding in the package owner's npm settings after approval. Existing
secret presence and a local login do not prove CI publish access. Do not revoke
existing credentials or change package security settings as part of this proposal.
See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).

Workflow activation is approved; registry trust configuration and actual publication
are tracked separately. No package version was published to test setup. Run the full
existing CI after review. Authentication remains untested until a separately
authorized real release; a package dry run does not validate OIDC exchange.

## First package activation checkpoint

The proposal's checkout, Node and pnpm actions are pinned to full commit SHAs.
Existing read-only CI packs the checked output and runs `npm publish --dry-run`
from the runner temporary directory with lifecycle scripts disabled. This uploads
nothing and does not validate OIDC authentication or change dist-tags.

Public npm metadata currently lists `kahwee` as maintainer. Private trusted-publisher
settings have not been verified: no authorized local browser connection was
available during this checkpoint. Before configuring anything, read back existing
npm settings and preserve any owner changes. If needed, the owner completes normal
npm login/2FA through the browser; never send passwords, OTPs or token values in chat.

After explicit approval, merge reviewed code, move the proposal to
`.github/workflows/publish.yml`, verify default-branch CI, and bind only the identity
listed above. No actual release is authorized by an authentication dry run: do not
create a tag, release or registry version to test setup. Existing registry-version skips require matching tarball integrity.

Publication runs share one package concurrency group with `queue: max` and do not
cancel a running publisher. GitHub retains up to 100 pending runs; additional runs
are canceled when the queue is full. Runs wait in order of arrival at the group,
which is not guaranteed to match release-version order. The registry guard therefore
rejects a new version that is not newer than `latest`. A rerun skips upload only if
the existing version's SHA-512 integrity matches the checked tarball. If `latest`
is already newer, it remains untouched; no dist-tag command is run.

After upload or an exact-archive rerun, readback checks the registry identity,
SHA-512 integrity, and that `latest` is at least the release version. It makes at
most six reads, five seconds apart, with a 15-second timeout per read. A missing
package/version or a still-older `latest` can propagate during that window; HTTP
errors other than 404, malformed metadata, identity or integrity mismatches fail
immediately. Exhaustion fails the job and requires investigation or a safe rerun.
