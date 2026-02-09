# Specification

## Summary
**Goal:** Fix the Veda/Language and Mantra Number dropdowns so options load reliably and the selected values always display correctly.

**Planned changes:**
- Update the Veda and Language Select controls to use string `value`s for controlled state and `SelectItem value`, and map those strings back to backend `Veda`/`Language` enums before invoking query hooks (so `useMantraNumbers` receives a valid backend enum value).
- Fix the Mantra Number Select controlled value handling so the trigger always shows the selected mantra number after auto-select, manual selection, and deep-linked routes.
- Add lightweight English diagnostic UI in the mantra selection area that appears only when mantra numbers are empty/unavailable or when the selected mantra value does not match any loaded option (showing current Veda, loading state, count, and/or mismatch details).

**User-visible outcome:** Changing Veda reliably refreshes the mantra numbers list, the dropdown triggers always display the current selections (including deep links), and clear English diagnostic messages appear only when the numbers fail to load or a selection mismatch occurs.
