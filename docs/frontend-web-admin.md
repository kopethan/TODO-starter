# Frontend web/admin starter notes

## App split
TODO uses two shells:
- **public web** for reading and understanding
- **admin web** for managing facts and moderating claims

They share the same design language but should not feel like the same type of product surface.

## V1 routes
### Public
- `/`
- `/entities/[slug]`
- `/reports`

### Admin
- `/admin/entities`
- `/admin/entities/new`
- `/admin/entities/[id]`
- `/admin/reports`
- `/admin/reports/[id]`

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
