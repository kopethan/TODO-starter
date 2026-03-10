# Data model summary

## Main models
### Entity
The central page model.

Holds:
- title
- slug
- type
- descriptions
- status
- visibility

### EntitySection
Structured content blocks inside an entity page.

### Category
High-level grouping for navigation and filtering.

### ExperienceReport
A user-submitted account of what happened.

### PatternCard
A repeated signal detected from many reports.

### TimelineEvent
A time-based event that helps build product memory.

### Source
A supporting source linked to structured sections.

### Contribution
A suggested change or flag sent into a review queue.

### ModerationCase
A governance object for legal, quality, and trust review.

## Trust principle
The database keeps room for three confidence dimensions:
- factual confidence
- community signal strength
- moderation confidence

That makes it easier later to separate:
- verified content
- emerging reports
- under-review warnings
