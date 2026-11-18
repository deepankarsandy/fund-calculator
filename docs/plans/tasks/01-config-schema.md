# Task 01 — Central Form Fields Configuration

**Goal:** Create `src/config/formFields.ts` as the single source of truth for all wizard steps, sections, fields, sub-fields, arrays, categories, sub-items, defaults, and explanations.

## Schema Specification

Each step in the wizard has an array of fields or sections. Adding or removing a field from the app should be as simple as adding or removing an entry in this file.

```ts
export type FieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'radio'
  | 'slider'
  | 'checkbox'
  | 'array'
  | 'expense-categories'

export interface FieldOption {
  label: string
  value: string | number
  description?: string
}

export interface FieldConfig {
  id: string
  label: string
  type: FieldType
  defaultValue: any
  help: string                         // Clear explanation of what this field means
  options?: FieldOption[]              // For select / radio
  min?: number                         // For number / slider
  max?: number
  step?: number
  prefix?: string                      // e.g. '₹'
  suffix?: string                      // e.g. '%', 'years'
  skippable?: boolean                  // Allows skipping this field or step
  subFields?: FieldConfig[]            // For composite objects or items in an array
  addButtonText?: string               // For array types (e.g. '+ Add member')
}

export interface WizardStepConfig {
  id: number
  key: string                          // 'profile' | 'household' | 'expenses' | 'assumptions' | 'assets' | 'results'
  title: string
  subtitle: string
  skippable: boolean
  skipLabel?: string
  fields: FieldConfig[]
}
```

## Content Included in Config
1. **Profile**: Country (select), State/Region (text), City (text), Currency (select), Current Age (number), Target Age (number), Household Size (number), Lifestyle Scenario (radio: bare minimum, comfortable, custom).
2. **Household**: Array field for members (label, relationship select, age, dependent checkbox, supportUntilAge, insurance checkbox). Default: Self.
3. **Expenses**: Special category-group configuration with categories A to K (Housing, Food, Utilities, Transport, Healthcare, Personal, Technology, Family, Financial, Emergency, Custom).
   - Each category has: `id`, `label`, `description`, `defaultInflationRate`, `parentMode` toggle, parent input (`amount`, `frequency`), and an array of `subItems` (`name`, `defaultAmount`, `frequency`, `essential`, `notes`, `everyNYears`).
4. **Assumptions**: Inflation mode (radio), Global inflation rate (slider), Annual investment return (slider), Return basis (radio: net, gross), Investment fees & tax drag (numbers), Withdrawal timing (radio: end of year, beginning of year), Safety margin (slider).
5. **Assets & Income**: Existing corpus (number with L/Cr preview), Regular retirement income array (label, amount, start year, end year, inflation-linked), Future lump sums array (label, amount, year).

## Acceptance Criteria
- [ ] Single file `src/config/formFields.ts` contains all definitions.
- [ ] Every field has explanatory `help` text.
- [ ] Sensible defaults populated for every field.
- [ ] Expenses categories support parent total input as well as sub-item lists.
