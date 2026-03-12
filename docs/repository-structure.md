# Repository structure

## Summary

The old `admin-ui/` starter mixed public and admin routes inside one Next.js app. The repository now moves toward a cleaner long-term structure:

- `apps/api`
- `apps/web`
- `apps/admin`
- `apps/mobile`
- `packages/ui`
- `packages/types`
- `packages/api-client`
- `packages/config`

## Why it matters

This creates a clearer deployment boundary so the public site and the admin workspace do not share the same app tree.

## Production recommendation

Keep the public site and the admin app on separate domains or subdomains, and add proper authentication/authorization to the admin app before production.
