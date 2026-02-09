# Specification

## Summary
**Goal:** Ensure Samaveda mantra number 47 is returned by the backend, appears in the Mantra Number dropdown, and the app selects sensible defaults so the UI isn’t empty on first load.

**Planned changes:**
- Backend: Fix `getMantraNumbers(#samaVeda)` to include mantra `47`, and ensure results are consistently sorted ascending and de-duplicated.
- Frontend: Update Mantra Number dropdown rendering so option `47` is visible/selectable when Samaveda is selected.
- Frontend: Add an English, user-visible warning when Samaveda is selected and the loaded mantra numbers are missing `47`, including the received options for diagnostics.
- Frontend: Add initial default selection behavior so that on a fresh session (no deep link), if only one Veda has available mantras it is auto-selected, and then the first available mantra number is auto-selected and shown in the dropdown trigger.

**User-visible outcome:** When selecting Samaveda, users can see and select mantra number 47, the selection trigger correctly displays it and loads its content, and the app auto-selects a Veda/mantra on first load when only a small set is available (with a clear warning if 47 is unexpectedly missing).
