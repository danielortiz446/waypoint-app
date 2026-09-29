# Waypoint V10.5.2 — Validation and data-preserving travel types

## Changes
- Prevents silently reclassifying pre-existing `beach`, `city`, `adventure`, and `winter` journeys as Leisure/Vacation when the user saves unrelated edits. The dropdown no longer exposes those deprecated choices; an existing stored type remains unchanged until a new purpose is deliberately selected.
- Requires a valid purpose for new trips, and validates date order and nonnegative finite budget before any state mutation.
- Preserves legacy trip data, collaboration state, documents, and cached records; no database migration.
- Version and PWA cache advanced to 10.5.2. The iOS Capacitor web source mirrors the revised form.

- Unknown `/api/*` routes now return a JSON 404 instead of silently returning the PWA HTML, making integration failures diagnosable and preventing API consumers from parsing HTML as JSON.

## Scope
- No real-device/browser E2E testing or live provider account validation is included.
- Keep the same Railway service, existing environment variables, volume at `/data`, and browser data. Export your trips before deployment.
