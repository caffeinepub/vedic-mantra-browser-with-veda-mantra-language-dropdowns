# Specification

## Summary
**Goal:** Make Samaveda Mantra 48 selectable when present, and add an “Add” button to open a mantra submission template that refreshes the dropdown after successful submission.

**Planned changes:**
- Fix mantra number retrieval/mapping so Samaveda’s Mantra Number dropdown includes “Mantra 48” when it exists in backend data, and selecting it routes to `/samaveda/48` and loads its content.
- Add a production-visible “Add” button near the mantra selection UI that opens the mantra content submission template/form only when clicked, with a close action that returns to the main view without changing the current selection.
- After a successful submission (especially for a new mantra number not previously listed), refresh the mantra numbers for the currently selected Veda so the new number appears immediately in the dropdown; ensure validation/error messages during submission are in English.

**User-visible outcome:** Users can select “Mantra 48” for Samaveda when available, open a submission template via an “Add” button to submit the next mantra content, and see newly added mantra numbers appear in the dropdown right after submission without a hard refresh.
