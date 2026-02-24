# Image Migration Gates

This document defines minimum rollout gates for migrating site-owned image URLs from third-party hosts to `https://images.alicealexandra.com`.

## Scope

- Applies to content-managed images in `teenylilcontent` (studio, postcards, poems, blog covers).
- Canonical destination host: `https://images.alicealexandra.com`.

## Required gates

1. Dependency gate: `images.alicealexandra.com/<key>` resolves public R2 objects with correct `Content-Type`.
2. Upload gate: every migrated URL has a mapped target key and uploaded object.
3. Rewrite gate: all in-scope `ik.imagekit.io` URLs are rewritten in `content/`.
4. Verification gate: no remaining in-scope `ik.imagekit.io` URLs in `content/`.
5. Build gate: `pnpm build` succeeds after rewrite.
6. Smoke gate: key routes render with no broken images (studio, postcards, poems, blog).

## Rollback

- Do not remove old hosts until all gates pass.
- If broken images are found post-rewrite, revert content URL changes and redeploy.

## Product guidance reference

- Issue #91 owner guidance: all ImageKit and Builder-hosted images should be migrated to R2 for consistency.
