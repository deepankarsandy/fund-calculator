# Storage, Persistence & Theme Switcher

The application provides real-time local storage persistence and a theme switcher supporting Light, Dark, and System modes.

---

## Overview

Users should never lose their work due to an accidental browser refresh or tab close. The calculator stores all inputs locally on the client device without requiring an account, login, or cloud backend.

---

## Key Features

### 1. Zero-Friction Client-Side Persistence
- Powered by Zustand with `localStorage` synchronization (`corpus-calc-v1`).
- Every field change (income, expenses, members, profile) is persisted in real-time.
- Active step index and last-focused input are preserved across browser sessions.

### 2. Privacy-First Architecture
- 100% of the calculation and data storage executes strictly within the user's browser.
- No personal financial figures, salary data, or budgets are transmitted to external servers or analytics trackers.

### 3. One-Click Reset
- A **“Reset”** button in the header allows users to wipe all stored data with confirmation and restore default small-town profile baselines.

### 4. Light, Dark & System Theme Switcher
- Supports **Light Mode**, **Dark Mode**, and **System Preference**.
- Uses Tailwind CSS CSS variables and semantic color tokens (`background`, `foreground`, `border`, `card`).
- Persists user theme preference in `localStorage` under `theme-preference`.
- Prevents flash of unstyled theme on page load via inline initialization in `index.html`.
