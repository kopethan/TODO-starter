# Architecture notes

## Product direction
TODO is not a generic wiki.

It is a **trust-aware decision platform** where users can:
- understand a thing or service
- learn the normal process
- spot dangers, red flags, and scam patterns
- read structured user experiences
- later see repeated patterns and history over time

## Core layers
### 1. Entity layer
Every important page on the platform is an entity.

Examples:
- Used iPhone
- Fake bank adviser call
- Fiber subscription
- Power bank
- Rental deposit

### 2. Structured knowledge layer
Each entity is split into reusable sections.

Examples:
- definition
- purpose
- normal process
- safe usage
- dangers
- red flags
- common scams
- what to do if affected

### 3. Community experience layer
Users can submit structured reports instead of random comments.

Important fields include:
- what happened
- when it happened
- where it happened
- channel
- outcome
- severity

### 4. Pattern layer
Repeated reports can become pattern cards.

A pattern card is not a single accusation.
It is a recurring signal found across multiple reports.

### 5. Governance layer
This is required early.

The project already includes:
- moderation cases
- contribution queue
- trust status models
- source linking

## First backend principle
Keep **facts**, **claims**, and **patterns** separate.

- Facts live in `Entity` and `EntitySection`
- Claims live in `ExperienceReport`
- Patterns live in `PatternCard`
