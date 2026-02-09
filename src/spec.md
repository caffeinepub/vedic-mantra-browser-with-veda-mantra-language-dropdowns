# Specification

## Summary
**Goal:** Ensure English and Telugu mantra text displays correctly when switching the Language dropdown, and fix backend data so the correct text is returned for Samaveda Mantra 47.

**Planned changes:**
- Update the frontend Mantra Text Display to refetch and render mantra text whenever the Language dropdown changes for the current (Veda, Mantra Number) selection, without requiring a page refresh.
- Ensure the Mantra Text Display uses consistent loading/error states during fetches and does not show stale text from the previously selected language.
- Fix backend state/data so `getMantraText(#samaVeda, 47, #english)` and `getMantraText(#samaVeda, 47, #telugu)` return non-empty mantra text (not meaning), without changing the public query APIs.
- If needed, add a conditional migration on upgrade so already-deployed canister state is corrected automatically.

**User-visible outcome:** When viewing Samaveda Mantra 47 (and other valid selections), switching Language between English and Telugu immediately shows the correct non-empty mantra text, with appropriate loading/error behavior and no stale/empty display when valid text exists.
