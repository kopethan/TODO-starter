# Layout and route blueprint

## Public web (`apps/web`)
- sticky top header
- no permanent sidebar
- no bottom nav
- contextual rails only on deep reading pages

Routes:
- home
- entity detail with left anchors and right metadata rail
- reports list with lightweight filters

## Admin web (`apps/admin`)
- left sidebar on desktop
- top header inside the content area
- list/detail workflow patterns

Routes:
- entities list
- create entity
- edit entity with overview / sections / reports tabs
- reports list
- report moderation detail
