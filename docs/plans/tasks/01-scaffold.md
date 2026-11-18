# Task 01 — Project Scaffold & Tooling

**Phase:** 0 — Foundation  
**Depends on:** nothing  
**Blocks:** all subsequent tasks

---

## Goal
Bootstrap a Vite + React + TypeScript project with Tailwind, shadcn/ui, Zustand, Recharts, and Vitest. Create the full folder skeleton.

---

## Steps

### 1. Create Vite app
```bash
npm create vite@latest . -- --template react-ts
```

### 2. Install runtime dependencies
```bash
npm install tailwindcss @tailwindcss/vite
npm install zustand
npm install react-hook-form zod @hookform/resolvers
npm install decimal.js
npm install recharts
npm install lucide-react
npm install clsx tailwind-merge
npm install jspdf papaparse
npm install @types/papaparse -D
```

### 3. Install and init shadcn/ui
```bash
npx shadcn@latest init
```
Choose: TypeScript, Tailwind, `src/components/ui`, `@/` alias.

Then add components:
```bash
npx shadcn@latest add button card input label select slider tooltip accordion badge progress separator sheet dialog tabs
```

### 4. Configure Vitest
In `vite.config.ts` add:
```ts
test: {
  environment: 'jsdom',
  globals: true,
}
```
Add `"types": ["vitest/globals"]` to `tsconfig.app.json`.

### 5. Create folder structure
```
src/
  domain/
    models/
    calculations/
      __tests__/
    validation/
  store/
  components/
    wizard/
    steps/
    expenses/
    results/
    ui/
  lib/
  pages/
```

### 6. Create utility helpers

**`src/lib/cn.ts`**
```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**`src/lib/currency.ts`**
```ts
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount)
}
export function formatCrore(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2)} Cr`
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(2)} L`
  return formatINR(amount)
}
```

**`src/lib/format.ts`**
```ts
export function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`
}
export function pluralise(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`
}
```

### 7. Set up path alias
In `vite.config.ts`:
```ts
resolve: { alias: { '@': path.resolve(__dirname, './src') } }
```

---

## Acceptance Criteria
- [ ] `npm run dev` starts and renders default page without errors
- [ ] Tailwind utility classes apply correctly in browser
- [ ] A shadcn `<Button>` can be imported and renders
- [ ] `npm run test` exits 0 (zero test files = zero failures)
- [ ] All folders in `src/domain/`, `src/store/`, `src/components/` exist
- [ ] `formatINR(100000)` returns `₹1,00,000`
