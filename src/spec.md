# Specification

## Summary
**Goal:** Show Samaveda mantra 47 text translated into the selected language (Telugu/English/Hindi) and display it above the existing meaning.

**Planned changes:**
- Extend the backend data model and queries to store and return mantra *text* (in addition to meaning) keyed by (veda, mantraNumber, language).
- Seed backend data for Samaveda mantra 47 with non-placeholder translated mantra text for Telugu, English, and Hindi.
- Update the frontend to fetch and render the translated mantra text above the meaning, updating live when the Language dropdown changes (no page reload).
- Add/extend a React Query hook for mantra text keyed by (veda, mantraNumber, language), integrating with existing loading/error patterns.

**User-visible outcome:** When viewing Samaveda mantra 47, switching the Language dropdown between Telugu/English/Hindi updates the displayed mantra text immediately, while the meaning continues to appear below as it does today (including via deep links like /samveda/47 or /samaveda/47).
