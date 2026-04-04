# Roadmap and Key Decisions

## Decisions currently favored

1. The product should be **entity-first**.
2. The feed should default to **Entities**.
3. Reports and signals should mainly live inside the **Entity detail page**.
4. Reports/signals can appear as counts and lightweight previews on feed cards.
5. Content type selection should live inside **Filter**, not as a permanent top tab.
6. Public discovery controls should use a **bottom-center tool dock** with Search / Filter / Ask AI.
7. AI should be grounded in actual platform data and never auto-publish updates.
8. Public information sharing should be structured, not generic "posts".
9. The public-facing umbrella label should move toward **Share information** rather than a generic **Contribute** label.
10. The entity page should use tabs such as **Overview / Reports / Signals / Sources**.
11. `/reports` and `/signals` may still exist, but they should not dominate primary public navigation.
12. The visual system should move toward **black/white + one strong blue accent**.
13. Divider-based layout rhythm is part of the product identity.

## Sensible implementation order

### Phase 1
- stabilize entity-first feed
- entity cards with counts/previews
- entity detail sections
- bottom tool dock shell
- feed search/filter/AI panel behavior

### Phase 2
- entity-level AI summary/actions
- structured information sharing
- image/evidence handling
- richer filtering inside entity tabs

### Phase 3
- AI trend suggestions into admin validation queue
- alternate reports/signals routes, if still useful
- stronger summarization and comparison tools

## Open questions for future planning

- How rich should report filtering become inside the entity Reports tab?
- How much evidence should be visible publicly by default?
- How should confidence/strength be represented for signals?
- What moderation states should be visible to end users, if any?
- Should AI answers show direct references to entity sections and reports inline?
- What are the exact privacy and abuse controls for uploads?
