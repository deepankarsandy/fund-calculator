# Task 06 — Responsive Wizard Flow UI

**Goal:** Create the multi-step wizard container that loops through the steps defined in `wizardConfig`, manages progress, and provides responsive navigation.

## Features

1. **Step Progression & Navigation**:
   - Header with step indicator and title.
   - Desktop: Step pill/circle indicator showing completed, active, and upcoming steps.
   - Mobile: Compact progress bar with "Step X of Y: [Name]".
   - Back button, Next button, and "Skip this step" shortcut for skippable steps.
   - Final input step has a prominent "Calculate Corpus" action button.

2. **Responsive Design**:
   - Clean, lightweight styling with Tailwind CSS.
   - Stacks vertically on mobile screens (minimum width 320px).
   - Sticky top progress bar and sticky bottom navigation for easy touch accessibility.

3. **Reset & State Persistence**:
   - "Reset" button to clear user changes and restore defaults.
   - Lightweight state storage in memory and `localStorage` so refreshing does not discard work.

## Acceptance Criteria
- [ ] Users can navigate forward and backward through all steps.
- [ ] Clicking "Skip" on a step proceeds to the next step using defaults.
- [ ] Mobile navigation is seamless with touch-friendly button targets.
