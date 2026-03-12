# Frontend web/admin starter notes

## App split
TODO now uses two separate Next.js apps:
- **public web** in `apps/web` for reading and understanding
- **admin web** in `apps/admin` for managing facts and moderating claims

They share the same design language through `packages/ui`, but they no longer live inside the same app tree.

## V1 routes
### Public web (`apps/web`)
- `/`
- `/entities/[slug]`
- `/reports`

### Admin web (`apps/admin`)
- `/entities`
- `/entities/new`
- `/entities/[id]`
- `/reports`
- `/reports/[id]`

## V1 scope
Only ship the flows that keep TODO operational:
- entity list / create / edit
- section add / edit / delete
- reports list
- report moderation detail
- public home, entity detail, and reports list

## Do not build yet
- patterns UI
- sources UI
- contribution queue UI
- moderation dashboards
- mobile-specific navigation patterns
