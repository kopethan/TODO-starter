# Continuation Brief for Future Chats

Use this brief when resuming in a new chat.

## Context

We have aligned on a public-product direction for TODO that is distinct from the existing admin work.

## Core decisions already made

- TODO should be **entity-first**
- The feed should default to **Entities**
- Reports and Signals should mainly be explored in the **Entity detail page**
- The entity page should act as the main public depth surface
- Entity detail now leans toward tabs:
  - Overview
  - Reports
  - Signals
  - Sources
- Entity cards may show:
  - report count
  - signal count
  - last updated
  - one highlighted signal
  - one short latest-report preview
- Search / Filter / Ask AI should live in a **bottom-center floating tool dock**
- Content type chips (Entities / Reports / Signals) should live **inside Filter**
- The visual language should move toward:
  - black / white / grayscale
  - one intentional blue accent
  - divider-based layout rhythm
  - flat design only
- AI should support:
  - feed discovery
  - entity summarization
  - information-sharing guidance
  - admin-reviewed trend suggestions
- Public user information sharing should be structured:
  - share report
  - share signal
  - upload evidence
  - add source
  - suggest update
- `/reports` and `/signals` may remain available, but they should not dominate primary public navigation
- New entity creation should be a fallback-only path when search finds no meaningful match

## What to do first in the next chat

1. Inspect the latest repo zip I provide.
2. Separate current implemented state from planned public-product state.
3. Decide whether to:
   - deepen the entity page,
   - improve information sharing,
   - implement real uploads/evidence,
   - or add grounded AI answers.
4. Keep the design minimal, serious, flat, and trust-oriented.
5. Avoid social-feed styling and avoid dashboard noise.

## Suggested next implementation candidates

- entity-page report filtering and signal grouping
- information-sharing flow polish
- real evidence upload
- grounded entity AI answers
- admin AI seeding and suggestion validation
