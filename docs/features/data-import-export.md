# Data Backup, Export & Import Management

The Data Export & Import module provides comprehensive, client-side backup and restore capabilities across all calculators, wizard scenarios, user profiles, and application settings.

---

## 1. Overview & Privacy Philosophy

The lifetime cost and corpus calculator operates 100% locally within the browser. While this guarantees absolute privacy with zero server-side transmission, browser storage (such as clearing cookies, cache, or using private browsing) can inadvertently wipe user inputs.

The **Export & Import** hub (`/export-import`) solves this by giving users total data portability:

- **Zero Cloud Dependence**: Data stays strictly client-side. Backups are downloaded directly as `.json` files to the user's local disk.
- **Unified Snapshot**: A single backup captures every calculator state, user profile setting, custom scenario, and UI preference.
- **Granular Control**: Users can export or restore the entire application state or individual modular sections selectively.
- **Automatic Safety Net**: Before applying an import, the system automatically creates a local recovery snapshot to prevent accidental overwrites.

---

## 2. Supported Storage Sections

The export and import engine organizes state into 8 isolated modular sections:

| Section ID   | Name                           | Storage Keys                                                                                                                                    | Included Data                                                                                                           |
| :----------- | :----------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| `profile`    | **User Profile & Defaults**    | `fundcalc_user_profile_v1`                                                                                                                      | Personal details, DOB, retirement ages, expected increments, benchmark returns, and sector inflation rates.             |
| `retirement` | **Retirement Fund Calculator** | `corpus-calc-v2`, `corpus-calc-v1`                                                                                                              | Wizard input parameters, household dependents, customized expense categories, career accumulation, and saved scenarios. |
| `sip`        | **SIP & SWP Calculator**       | `fundcalc_sip_inputs_v1`, `fundcalc_sip_results_v1`                                                                                             | Monthly SIP contributions, step-up percentages, SWP withdrawal plans, tax parameters, and cached results.               |
| `investment` | **Investment Plans**           | `fundcalc_inv_inputs_v1`, `fundcalc_inv_results_v1`, `fundcalc_inv_tab_v1`, `fundcalc_custom_plan_inputs_v1`, `fundcalc_custom_plan_results_v1` | Multi-asset allocations, custom year-by-year cashflow plans, and investment performance records.                        |
| `fd`         | **Fixed Deposit (FD)**         | `fundcalc_fd_inputs_v1`, `fundcalc_fd_results_v1`                                                                                               | Deposit amounts, senior citizen flags, compounding frequencies, TDS settings, and maturity projections.                 |
| `loanEmi`    | **Loan EMI Calculator**        | `fundcalc_loan_inputs_v1`, `fundcalc_loan_results_v1`                                                                                           | Loan principal, interest rates, tenure, prepayment schedules, tax deductions, and amortisation tables.                  |
| `settings`   | **Application Settings**       | `corpus_settings`                                                                                                                               | Active wizard step, expanded expense category states, and last active input markers.                                    |
| `theme`      | **Theme Preference**           | `corpus_theme`                                                                                                                                  | Light, Dark, or System appearance mode preference.                                                                      |

---

## 3. Data Format & Schema Specification

Exported JSON files adhere to standard versioned schema `AppExportData`:

```json
{
  "version": 1,
  "appName": "lifetime-cost-corpus-calculator",
  "exportedAt": "2026-11-20T16:00:00.000Z",
  "sections": {
    "profile": { ... },
    "retirement": { ... },
    "sip": { ... },
    "investment": { ... },
    "fd": { ... },
    "loanEmi": { ... },
    "settings": { ... },
    "theme": { ... }
  },
  "rawStorage": {
    "fundcalc_user_profile_v1": "...",
    "corpus-calc-v2": "..."
  }
}
```

### Schema Features:

1. **`sections` Dictionary**: Human-readable, structured representation of each module's configuration for inspection and partial imports.
2. **`rawStorage` Map**: Exact raw localStorage key-value string mappings to ensure byte-perfect parity and backward compatibility during restoration.
3. **`version` & `appName` Metadata**: Enforces validation so incompatible JSON files or exports from other apps are rejected before touching localStorage.

---

## 4. Key Workflows

### 1. Full Backup Download

- Clicking **“Download Complete Backup (.json)”** compiles all active sections into a timestamped file:
  `lifetime-cost-backup-YYYY-MM-DD.json`.
- Users can safely archive this file or transfer it to another browser, device, or computer.

### 2. Selective Section Export

- Users can expand any individual section in the UI and click **“Export this Section”** to generate a targeted JSON file containing only that calculator or profile's data.

### 3. File Upload & Drag-and-Drop Parsing

- Accepts `.json` files via file picker or drag-and-drop into the upload dropzone.
- Validates JSON structure, confirms schema version, and inspects all recognized sections.
- Displays a **Compatibility Summary**:
  - Highlights valid sections with summary previews (e.g. _"Age 30, Retires at 60 · 11 sector rates"_, _"Mode: SIP · ₹15,000/mo"_).
  - Flags missing, malformed, or unrecognized sections.

### 4. Automatic Safety Snapshot & Rollback

- Whenever an import action is initiated (either full or partial), the system automatically takes an in-memory & localStorage snapshot under key `fundcalc_backup_v1`.
- If an accidental restore occurs, the **“Restore Pre-Import Backup”** card instantly reverts the browser back to the state prior to the import.

### 5. Granular Section Import

- Alongside **“Import All Compatible Sections”**, each recognized section features an independent **“Import Section”** button, allowing users to selectively restore only their SIP calculations or only their User Profile without altering other modules.

### 6. Reset & Purge Management

- Users can clear individual calculator caches or purge all application data from the browser with safety confirmation dialogues.
