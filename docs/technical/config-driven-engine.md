# Config-Driven Form Engine

The UI layer is rendered dynamically from declarative configuration objects, avoiding hardcoded form components and enabling rapid schema evolution.

---

## Single Source of Truth (`src/config/formFields.ts`)

Every step, group, field, validation boundary, option, and tooltip in the application is defined in `src/config/formFields.ts`. Adding or tweaking a field does not require touching React JSX.

### Step Definition Schema (`StepConfig`)

```ts
export interface StepConfig {
  id: number
  key: string // 'profile' | 'assets' | 'household' | 'expenses' | 'assumptions' | 'results'
  title: string
  subtitle: string
  skippable?: boolean
  skipLabel?: string
  fields: FieldConfig[]
}
```

### Field Definition Schema (`FieldConfig`)

```ts
export interface FieldConfig {
  id: string
  label: string
  type: 'number' | 'text' | 'select' | 'radio' | 'slider' | 'checkbox' | 'array' | 'category-group'
  defaultValue: any
  help?: string
  placeholder?: string
  options?: { label: string; value: any; description?: string }[]
  min?: number
  max?: number
  step?: number
  prefix?: string // e.g. '₹'
  suffix?: string // e.g. '%' or 'years'
  skippable?: boolean
  subFields?: FieldConfig[] // For repeating arrays (e.g. household members, lump sums)
}
```

---

## Dynamic Renderers

### 1. `DynamicStepRenderer`

- Located in `src/components/wizard/DynamicStepRenderer.tsx`.
- Reads the active `StepConfig` by ID.
- Iterates over `fields` and delegates to `DynamicField` or specialized sub-renderers.
- Handles step navigation actions (`handleNext`, `handlePrev`, `handleSkip`).

### 2. `DynamicField`

- Located in `src/components/form/DynamicField.tsx`.
- A polymorphic form control that inspects `field.type` and renders:
  - `number`: Formatted input with removed browser arrows and prefix/suffix chips.
  - `select`: Touch-friendly 44px dropdown with customized chevron.
  - `radio`: Card-based radio group with bold labels and subtitle descriptions.
  - `slider`: Synchronized range slider and numeric input box.
  - `array`: Repeatable list manager (used for household members and lump sum cashflows).

### 3. `DynamicExpensesRenderer`

- Located in `src/components/expenses/DynamicExpensesRenderer.tsx`.
- Special renderer for Step 4 (Categories A to K).
- Manages dual entry modes (Category lump-sum total vs itemized line items).
- Renders category skip toggles, frequency selectors, and essential tags.
- Provides real-time annual spend summaries.
