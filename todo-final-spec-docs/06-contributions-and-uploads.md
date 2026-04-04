# Contributions and Uploads

## Recommendation

Allow public information sharing, but avoid making the feature feel like generic social posting.

Use structured actions instead.

Recommended public umbrella label:
- **Share information**

This label is better than:
- **Post**, which sounds casual and social
- **Contribute**, which can sound formal and passive

## Better contribution verbs

Inside the Share information flow, prefer:
- Share a report
- Share a signal
- Upload evidence
- Add a source
- Suggest an update

## Search-first rule

Before creating anything new:
1. users should search for the entity first
2. if the entity already exists, route the user into that entity's information-sharing flow
3. only offer **Suggest a new entity** when no meaningful match exists

## Contribution types

### Report submission
Use when someone had a full experience.

Typical structure:
- what happened
- when
- how
- severity
- outcome
- category
- attachments/evidence
- optional privacy controls

### Signal submission
Use when someone notices:
- a warning sign
- a pattern
- an anomaly
- a smaller clue not yet suited to a full report

### Source submission
Use when someone wants to add:
- a link
- a document
- a screenshot
- a public reference
- an official statement

### Evidence upload
Use when someone wants to attach:
- screenshots
- receipts
- emails
- messages
- product photos
- delivery proof

## AI guidance in information sharing

Recommended flow:
1. User starts with plain language.
2. AI determines whether the input is closer to a report, signal, source, or evidence.
3. AI asks for missing but important fields.
4. AI drafts a structured submission for user review.
5. User approves and submits.

## Why this matters

Benefits:
- better data quality
- less confusion about content type
- lower friction
- more consistent moderation
- better structured downstream AI summaries

## Safety / trust notes

Important:
- AI should help structure the submission, not override the user's meaning
- users should confirm before submission
- moderation/review rules should still apply
- shared information should default to review states such as unverified / needs review until moderation is complete
