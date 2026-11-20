# Task 04 — Dynamic Form Renderer

**Goal:** Create generic, responsive field renderers that read field configurations from `formFields.ts` and render the appropriate input controls, default values, and explanation tooltips/text.

## Components to Implement

1. **`DynamicField.tsx`**:
   - Takes `field: FieldConfig`, `value: any`, and `onChange: (val: any) => void`.
   - Renders label, explanation help text / tooltip, input element, prefix/suffix, and error states.
   - Handles field types:
     - `'text'`: Standard text input.
     - `'number'`: Number input with optional prefix (e.g. ₹) and formatting.
     - `'select'`: Dropdown selection.
     - `'radio'`: Segmented button toggle or radio group with descriptions.
     - `'slider'`: Range slider linked synchronously with a number box.
     - `'checkbox'`: Toggle / checkbox control.
     - `'array'`: Dynamic list where users can add and remove items based on `subFields`.

2. **`FieldExplanation.tsx`**:
   - Clean, friendly explanation box or tooltip below or alongside the label explaining what the field represents in practical financial terms.

## Acceptance Criteria

- [ ] Changing a field in `formFields.ts` (e.g. modifying min, max, label, options, or help text) instantly updates the rendered UI without changing component code.
- [ ] Default values from the config are automatically respected.
- [ ] Responsive layout adapts on mobile (single-column) and tablet/desktop (grid).
