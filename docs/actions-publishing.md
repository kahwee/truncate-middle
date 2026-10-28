# Actions publishing

The active [publish workflow](../.github/workflows/publish.yml) runs only when a
GitHub release is published, excludes prereleases, and requires a stable
`v<package.json version>` tag. It checks that the tagged source is on main and
has passed CI, installs the frozen lockfile, checks and builds the package, and
publishes the checked tarball to `latest`. It does not create versions, tags or
GitHub releases. A push to main does not trigger publication.

The workflow uses GitHub-hosted runners, npm >=11.5.1, pinned actions, and
job-scoped `contents: read`, `actions: read`, and `id-token: write` permissions.
The intended [npm trusted-publisher](https://docs.npmjs.com/trusted-publishers/)
identity is package `truncate-middle`, owner `kahwee`, repository
`truncate-middle`, workflow `publish.yml`, and a blank environment. The intended
grant permits direct `npm publish` without an additional dist-tag management grant. The external
npm trust configuration has not been verified in this work. Approval for the exact
six-package setup and publication is pending with the parent; this work created no
tags or releases and published no package. A dry run does not validate the OIDC
exchange or authorize a release.

Before any authorized configuration, read back the existing npm settings and
preserve owner changes. A local login or secret presence does not prove CI publish
access. Do not revoke credentials or change security settings as part of this work;
never send passwords, OTPs or token values in chat.

The release guard rejects private packages, mismatched lock metadata, registry
errors and new versions that are not newer than `latest`. A rerun skips upload
only when the existing version's SHA-512 integrity matches the checked tarball.
If `latest` is already newer, it remains untouched; no dist-tag command is run.
Run `node --test scripts/check-release-guard.mjs` and
`node scripts/release-check.mjs v<version>` without publishing. The optional
`--registry <tarball>` adds a read-only registry and archive integrity check.

Publication runs share one package concurrency group with `queue: max` and do not
cancel a running publisher. GitHub retains up to 100 pending runs; additional runs
are canceled when the queue is full. Runs wait in order of arrival at the group,
which is not guaranteed to match release-version order.

After upload or an exact-archive rerun, readback checks the registry identity,
SHA-512 integrity, and that `latest` is at least the release version. It makes at
most six reads, five seconds apart, with a 15-second timeout per read. A missing
package/version or a still-older `latest` can propagate during that window; HTTP
errors other than 404, malformed metadata, identity or integrity mismatches fail
immediately. Exhaustion fails the job and requires investigation or a safe rerun.
