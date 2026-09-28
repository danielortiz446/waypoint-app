# Waypoint 10.3.5 — AI suggestions → itinerary

- Gemini answers may contain structured suggestions (title, location, date, time) separated from the explanatory text on the server.
- The user can choose a date and optional time and add each suggestion to an existing or new itinerary day with one button.
- Viewer permissions are enforced, duplicate activities for the same day/location are blocked, and no suggestion is saved automatically.
- Existing local/cloud sync handles the activity after explicit save. The original AI prompt/answer is not synced.
- Dates are validated within the trip, and AI suggestions must be verified by the traveler.
- Preserves existing Gemini-only integration and retry logic. Google API access is required for new suggestions.

## Verification
Run `node scripts/ai-suggestions-test.js`, `npm test`, and inspect the iOS and deployed Railway experience separately. Model output may sometimes lack structured suggestions; in that case the text answer still appears, without add buttons. This is a model/provider limitation, not an automatic trip modification.
