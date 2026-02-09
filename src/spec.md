# Specification

## Summary
**Goal:** Ensure Samaveda Mantra 48 reliably displays available content, and falls back to a saved template preview when the mantra has no stored content.

**Planned changes:**
- Fix the mantra selection/rendering flow so that selecting Samaveda Mantra 48 renders the mantra content section (metadata, text, meaning) when the backend returns non-null values.
- Prevent stale UI states when switching to Mantra 48 (clear previous mantra content after loading completes and avoid showing “No content available” once data is available).
- When metadata/text/meaning are all null but a saved template exists for the selected Veda + mantra number, display the template in a read-only preview within the mantra content section (without opening the template editor), and update it when the selection changes.
- Prefer resolved content (metadata/text/meaning) over the template preview when both exist.

**User-visible outcome:** When users select Samaveda Mantra 48, they see the correct mantra content if available; otherwise they see a read-only template preview instead of an empty/no-content state.
