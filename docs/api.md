# API notes

## Base URL
```text
/api
```

## Health
### `GET /health`
Simple readiness endpoint.

## Entities
### `GET /entities`
Optional query params:
- `type`
- `status`
- `visibility`
- `q`

### `GET /entities/:slug`
Returns one entity with:
- sections
- categories
- trust status
- report count

### `POST /entities`
Creates a new entity.

### `POST /entities/:entityId/sections`
Creates a structured content section for an entity.

## Reports
### `GET /reports`
Optional query params:
- `entityId`
- `reportType`
- `moderationState`
- `verificationState`

### `POST /reports`
Creates a new experience report.

## Validation
All incoming payloads are validated with Zod.

## Error handling
- `400` for invalid payloads
- `404` for missing routes or entities
- `500` for unexpected server errors
