# Area Multipliers & Demographic Calibration Algorithms

This document describes the calibration algorithms implemented in `src/domain/calculations/areaDefaults.ts`.

---

## 1. Geographic Cost Multipliers

Living costs scale relative to geographic location across India:

```ts
export const AREA_MULTIPLIERS: Record<
  AreaType,
  { label: string; baseMultiplier: number; description: string }
> = {
  village: { label: 'Village / Rural', baseMultiplier: 0.6 },
  small_town: { label: 'Small Town (Tier 3)', baseMultiplier: 1.0 },
  city: { label: 'City (Tier 2)', baseMultiplier: 1.6 },
  tier1_metro: { label: 'Tier 1 Metro', baseMultiplier: 2.5 },
}
```

### Category-Specific Tuning Factors (`CATEGORY_AREA_FACTORS`)

Certain expense categories exhibit much steeper urban-rural price disparities than others (e.g. real estate rent varies by 8× between a village and Mumbai, whereas groceries vary by ~2×):

| Category             | Village Factor | Small Town Factor | City Factor | Metro Factor |
| :------------------- | :------------- | :---------------- | :---------- | :----------- |
| **Housing**          | `0.4`          | `1.0`             | `1.8`       | `3.2`        |
| **Food & Groceries** | `0.7`          | `1.0`             | `1.4`       | `1.9`        |
| **Transportation**   | `0.6`          | `1.0`             | `1.5`       | `2.2`        |
| **Utilities**        | `0.8`          | `1.0`             | `1.3`       | `1.6`        |
| **Healthcare**       | `0.8`          | `1.0`             | `1.4`       | `2.0`        |
| **Personal**         | `0.5`          | `1.0`             | `1.6`       | `2.5`        |
| **Technology**       | `0.9`          | `1.0`             | `1.1`       | `1.2`        |
| **Family**           | `0.6`          | `1.0`             | `1.5`       | `2.2`        |

---

## 2. Non-Linear Household Member Scaling

Household living costs do not scale linearly per person. The marginal cost of an additional dependent is modeled using category-specific scaling factors:

$$\text{Member Multiplier} = 1 + (N_{\text{members}} - 1) \times S_{\text{category}}$$

| Category                               | Scaling Factor ($S$) | Behavioral Justification                                 |
| :------------------------------------- | :------------------- | :------------------------------------------------------- |
| `financial`, `emergency`, `technology` | `0.10`               | Mostly fixed overheads per household                     |
| `housing`                              | `0.25`               | Shared living space; marginal bedroom cost is sub-linear |
| `transport`, `utilities`               | `0.35`               | Shared vehicles, common electricity, shared water        |
| `healthcare`                           | `0.50`               | Individual health risk per person                        |
| `food`, `personal`                     | `0.65`               | Individual caloric and personal consumption              |
| `family`                               | `0.80`               | High per-child tuition and dependent overhead            |

---

## 3. Dynamic Child & Parent Lifecycle Windows

### Child Schooling & Higher Education

When child dependents are present:

- **School Fees**:
  - Starts in planning year: $\max(1, 5 - \text{child.age})$
  - Duration: 12 schooling years
  - Default amount: $\text{Base} \times \text{Factor} \times N_{\text{children}}$
- **College / Higher Education**:
  - Starts in planning year: $\max(1, 17 - \text{child.age})$
  - Duration: 4 university years

### Elderly Parental Support

When parent dependents are present:

- Starts in planning year 1
- Ends at $\text{parent.supportUntilAge} - \text{parent.age}$ (or age 80 default)
