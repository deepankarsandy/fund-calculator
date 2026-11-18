export interface YearProjection {
  year: number
  age: number
  expenses: number
  otherIncome: number
  netWithdrawal: number
  investmentGrowth: number
  openingCorpus: number
  closingCorpus: number
}

export interface ScenarioResult {
  label: string
  inflationRate: number
  returnRate: number
  currentAnnualExpense: number
  currentMonthlyEquivalent: number
  essentialAnnualExpense: number
  discretionaryAnnualExpense: number
  requiredCorpus: number
  existingCorpus: number
  fundingGap: number
  safetyMarginAmount: number
  corpusWithSafetyMargin: number
  yearProjections: YearProjection[]
}

export interface CalculationResults {
  scenarios: ScenarioResult[]
  warnings: string[]
  calculatedAt: string
}
