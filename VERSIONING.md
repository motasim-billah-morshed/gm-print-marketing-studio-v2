# Version preservation and comparison

## v1 — preserved baseline

Original repository: https://github.com/motasim-billah-morshed/gm-print-marketing-studio

Release/tag: https://github.com/motasim-billah-morshed/gm-print-marketing-studio/releases/tag/v1

Commit: `07efc766a13660bee8dfde5359b5f7411dc66c7f`

The original repository and live demo remain the v1 reference. The v1 tag points to the pre-v2 application. Do not move or delete it. Repository administrators retain their normal ability to alter tags; this is a preserved reference, not a claim of immutable storage.

## v2 — development only here

Repository: https://github.com/motasim-billah-morshed/gm-print-marketing-studio-v2

Copied using GitHub Import with original commit history and the v1 tag. The initial application is the same baseline; subsequent commits document changes. The local origin points only to the v2 repository.

Comparison: https://github.com/motasim-billah-morshed/gm-print-marketing-studio-v2/compare/v1...main

Each development unit should have its own commit/PR, requirement IDs, validation evidence and changelog entry. Use `codex/` feature branches. Do not overwrite v1 to demonstrate v2 progress.

## Local comparison and recovery

```sh
git diff v1..main
git log --oneline v1..main
git archive --format=zip --output=../gm-print-studio-v1-backup.zip v1
```

To inspect the old version without modifying the development branch, use a separate checkout/worktree through the available workspace tooling, or extract the v1 release ZIP into a new folder. Do not reset v2 destructively.

## Architecture gate

The owner authorized creating this separate development project. This does not resolve the ERP contract, hosting, scale, access, consent or provider decisions in the architecture review. Keep those decisions open until explicitly approved. No production R1 feature is complete merely because the prototype renders.
