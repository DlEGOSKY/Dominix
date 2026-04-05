# PROJECT_RULES.md — Dominix

## Core directive
Build Dominix as a score-driven domino roguelike with strong replayability and a clear tactical loop.

## Source of truth
Always follow:
- AGENTS.md
- README.md
- docs/GAME_DESIGN.md
- docs/PATTERN_SYSTEM.md
- docs/RELIC_SYSTEM.md
- docs/DEVELOPMENT_PHASES.md
- docs/UI_SYSTEM.md
- docs/BALANCING.md

## Non-negotiables
- Do not turn the project into traditional domino only
- Do not copy card-game terminology if domino-native wording works better
- Do not add complex meta-systems before validating the base loop
- Do not add dependencies without approval
- Do not refactor unrelated modules
- Do not make the UI look like a generic casino clone
- Do not add emojis anywhere

## Product goal
Dominix must feel:
- domino-rooted
- score-driven
- build-oriented
- elegant
- readable
- satisfying
- replayable

## Work mode
1. identify one system
2. describe strategy
3. touch only relevant files
4. keep changes small and safe
5. preserve the validated loop

## Fixed architecture principles
- scoring logic stays isolated
- pattern detection stays testable
- relic effects stay modular
- hand state and chain state stay explicit
- UI should never be the source of game rules
