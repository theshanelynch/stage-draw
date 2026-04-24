# Setup Dogz Stage Plot

**Branch:** main
**Status:** Awaiting approval

## Exec Summary
Update `StagePlot.drawio` to reflect the final stage arrangement for "The Dogz". This involves repositioning band members and replacing all legacy embedded icons with the 11 new high-quality icons from the `StageEquipment` library.

## Task Description
Rearrange the stage plot for the band "DOGZ" according to the following layout:
- **Noel (Drums):** Back center position with a vocal mic.
- **Noel (Bass Rig):** Stage Right Back (Audience Left).
- **Heimar (Uke):** Stage Left Back (Audience Right) with a vocal mic.
- **Front Line (Left to Right):** Gerry (Uke), Eugene (Uke), Shane (Uke), Sarah (Keys).
- **Vocal Mics:** 4x across the front line + 2x for backline (Noel/Heimar).
- **Instruments:** Use `acoustic-guitar.svg` for all Ukes, `amplifier.svg`/`bass-guitar.svg` for Bass, `drum-kit.svg` for Drums, and `keyboard.svg` for Keys.

## Agreed Approach
**Option B — Considered Evolution**: We will restructure the `StagePlot.drawio` XML. Instead of just swapping base64 strings, we will organize the elements into logical "Member Groups" (e.g., Gerry = Label + Mic Icon + Uke Icon) to ensure consistent spacing and easier future adjustments.

## Spec

### In scope
- Update `StagePlot.drawio` XML structure.
- Implementation of the 6-mic vocal setup.
- Repositioning Noel (Bass) to Stage Right and Heimar to Stage Left.
- Standardizing all icon sizes to match the library (40-80px depending on the item).

### Out of scope
- Modifying the standalone SVG renderer (`index.html`).
- Adding new gear icons not currently in the `icons/` folder.

### Acceptance Criteria
- [ ] Noel (Drums) is centered in the back with a `mic.svg` icon.
- [ ] Noel (Bass) is Stage Right Back with an `amplifier.svg` and `bass-guitar.svg`.
- [ ] Heimar is Stage Left Back with `acoustic-guitar.svg` and `mic.svg`.
- [ ] Front line consists of Gerry, Eugene, Shane, and Sarah in that order.
- [ ] Every front line member has a `mic.svg` icon.
- [ ] All icons render correctly in draw.io (using the verified `data:image/svg+xml;base64` format).

## Technical Plan

### Implementation
- [ ] Task 1 — Extract new base64 data for all 11 library icons to use as constants.
- [ ] Task 2 — Update the "Backline" section of `StagePlot.drawio` (Drums, Bass Rig, Heimar).
- [ ] Task 3 — Update the "Front Line" section (Gerry, Eugene, Shane, Sarah).
- [ ] Task 4 — Update the "Input List" legend to match the new setup (6 mics, 5 DIs).

### Tests
- [ ] Test for Task 1-3 — Run `node test-library.mjs StagePlot.drawio` (updated to check this file) to verify no rendering errors.
- [ ] Visual Check — Inspect the generated XML to ensure icon data matches the verified library format.

### Risks / Dependencies
- **None**: We have already verified the icon format that draw.io likes.

## Verification Strategy
We will use the existing Playwright infrastructure to load `StagePlot.drawio` directly into draw.io and take a screenshot. We will verify that the browser console is free of `ERR_INVALID_URL` errors.
