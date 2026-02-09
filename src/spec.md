# Specification

## Summary
**Goal:** Ensure the Mantra Number dropdown reliably populates on first load (including Samaveda 47/48) and add clear UI + backend diagnostics to verify data freshness and canister connectivity.

**Planned changes:**
- Frontend: Default the Veda selection to **Samaveda** on first load when there is no deep link, and enable/populate the Mantra Number dropdown as soon as mantra numbers finish loading (without requiring the user to manually re-select Veda).
- Frontend: Keep current behavior where changing Veda resets the selected mantra, but prevent the mantra dropdown from remaining permanently disabled after a Veda change.
- Frontend: Add explicit inline states in the Mantra Number area for **loading**, **error** (with user-facing English + suggestion to refresh/reload), and **empty results** (clear “no mantras available” message).
- Backend: Add a lightweight **query** method returning basic diagnostics (counts and booleans indicating whether Samaveda 47 and 48 exist) to confirm the frontend is talking to the expected deployed canister/data.
- Frontend: Display the diagnostics response in a small, non-intrusive Diagnostics section on the main page (no authentication required), with a simple English error line if the diagnostics query fails.

**User-visible outcome:** On a fresh visit the app immediately shows Samaveda mantras (including 47 and 48 when present), the mantra selector clearly indicates loading/error/empty states instead of appearing blank, and a Diagnostics panel helps confirm backend connectivity and whether key mantras exist.
