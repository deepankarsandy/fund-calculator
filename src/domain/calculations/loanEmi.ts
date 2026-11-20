export type LoanTypePreset = 'home' | 'car' | 'personal' | 'custom'
export type LoanInterestMethod = 'reducing' | 'flat'

export interface LoanEmiCalculationInputs {
  loanAmount: number
  annualInterestRate: number
  tenureYears: number
  tenureMonths: number
  loanType: LoanTypePreset
  interestMethod: LoanInterestMethod
  monthlyExtraPrepayment: number
  annualLumpSumPrepayment: number
  enableTaxDeduction: boolean
  taxRegime: 'old' | 'new'
  taxSlabPercent: number
  inflationRatePercent: number
}

export interface LoanYearlyAmortization {
  year: number
  startingBalance: number
  principalPaid: number
  interestPaid: number
  extraPrepaymentPaid: number
  totalPaymentYear: number
  endingBalance: number
  taxSavingsSec24b: number
  taxSavingsSec80c: number
}

export interface LoanEmiCalculationResult {
  monthlyEmi: number
  totalTenureMonths: number
  interestMethod: LoanInterestMethod
  equivalentReducingApr: number
  totalOriginalPayment: number
  totalOriginalInterest: number
  actualPayoffMonths: number
  actualTotalInterest: number
  actualTotalPayment: number
  interestSaved: number
  tenureMonthsSaved: number
  totalTaxSavings: number
  netEffectiveCost: number
  realPurchasingPowerCost: number
  yearlyAmortization: LoanYearlyAmortization[]
}

export const DEFAULT_LOAN_EMI_INPUTS: LoanEmiCalculationInputs = {
  loanAmount: 4000000,
  annualInterestRate: 8.5,
  tenureYears: 20,
  tenureMonths: 0,
  loanType: 'home',
  interestMethod: 'reducing',
  monthlyExtraPrepayment: 0,
  annualLumpSumPrepayment: 0,
  enableTaxDeduction: true,
  taxRegime: 'old',
  taxSlabPercent: 30.0,
  inflationRatePercent: 6.0,
}

export function calculateLoanEmi(
  inputs: Partial<LoanEmiCalculationInputs> = {}
): LoanEmiCalculationResult {
  const merged: LoanEmiCalculationInputs = {
    ...DEFAULT_LOAN_EMI_INPUTS,
    ...inputs,
  }

  const P = Math.max(0, merged.loanAmount || 0)
  const annualRate = Math.max(0, merged.annualInterestRate || 0)
  const years = Math.max(0, merged.tenureYears || 0)
  const months = Math.max(0, merged.tenureMonths || 0)
  const totalMonths = Math.max(1, years * 12 + months)

  const interestMethod = merged.interestMethod || 'reducing'
  const isFlatRate = interestMethod === 'flat'

  const monthlyRate = annualRate > 0 ? annualRate / 100 / 12 : 0
  const monthlyExtra = Math.max(0, merged.monthlyExtraPrepayment || 0)
  const annualLumpSum = Math.max(0, merged.annualLumpSumPrepayment || 0)

  const isHomeLoan = merged.loanType === 'home'
  const isOldRegime = merged.taxRegime === 'old'
  const enableTax = merged.enableTaxDeduction && isHomeLoan && isOldRegime
  const taxSlabRate = Math.max(0, merged.taxSlabPercent || 0) / 100
  const inflationRate = Math.max(0, merged.inflationRatePercent ?? 6.0)

  if (P === 0) {
    return {
      monthlyEmi: 0,
      totalTenureMonths: totalMonths,
      interestMethod,
      equivalentReducingApr: 0,
      totalOriginalPayment: 0,
      totalOriginalInterest: 0,
      actualPayoffMonths: 0,
      actualTotalInterest: 0,
      actualTotalPayment: 0,
      interestSaved: 0,
      tenureMonthsSaved: 0,
      totalTaxSavings: 0,
      netEffectiveCost: 0,
      realPurchasingPowerCost: 0,
      yearlyAmortization: [],
    }
  }

  let monthlyEmi = 0
  let totalOriginalPayment = 0
  let totalOriginalInterest = 0
  let equivalentReducingApr = annualRate

  if (isFlatRate) {
    // Flat Rate Loan Formula: Total Interest = P * R * T
    const tenureInYears = totalMonths / 12
    totalOriginalInterest = Math.round(P * (annualRate / 100) * tenureInYears)
    totalOriginalPayment = P + totalOriginalInterest
    monthlyEmi = Math.round(totalOriginalPayment / totalMonths)

    // Equivalent Reducing APR calculation
    // Rule of thumb: approx 1.85 to 1.95x of flat rate
    const approxAprFactor = (2 * totalMonths) / (totalMonths + 1)
    equivalentReducingApr = Number((annualRate * approxAprFactor).toFixed(2))
  } else {
    // Reducing Balance Loan Formula
    if (monthlyRate === 0) {
      monthlyEmi = Math.round(P / totalMonths)
    } else {
      const factor = Math.pow(1 + monthlyRate, totalMonths)
      monthlyEmi = Math.round((P * monthlyRate * factor) / (factor - 1))
    }
    totalOriginalPayment = monthlyEmi * totalMonths
    totalOriginalInterest = Math.max(0, totalOriginalPayment - P)
    equivalentReducingApr = annualRate
  }

  // Month-by-month amortization simulation
  let balance = P
  let actualTotalInterest = 0
  let actualTotalPayment = 0
  let actualPayoffMonths = totalMonths
  let totalTaxSavings = 0
  let discountedTotalOutflow = 0

  const yearlyAmortization: LoanYearlyAmortization[] = []

  let currentYear = 1
  let yearStartBalance = P
  let yearPrincipal = 0
  let yearInterest = 0
  let yearExtra = 0
  let yearTotalPay = 0

  const flatMonthlyPrincipal = Math.round(P / totalMonths)
  const flatMonthlyInterest = Math.round(totalOriginalInterest / totalMonths)

  for (let m = 1; m <= totalMonths; m++) {
    if (balance <= 0) break

    let interestMonth = 0
    let regularPrincipal = 0

    if (isFlatRate) {
      interestMonth = Math.min(balance > 0 ? flatMonthlyInterest : 0)
      regularPrincipal = Math.min(balance, flatMonthlyPrincipal)
    } else {
      interestMonth = balance * monthlyRate
      regularPrincipal = Math.min(balance, Math.max(0, monthlyEmi - interestMonth))
    }

    let extraThisMonth = monthlyExtra
    if (m % 12 === 0) {
      extraThisMonth += annualLumpSum
    }

    const actualExtra = Math.min(Math.max(0, balance - regularPrincipal), extraThisMonth)
    const totalPrincipalMonth = regularPrincipal + actualExtra
    const paymentThisMonth = interestMonth + totalPrincipalMonth

    balance = Math.max(0, balance - totalPrincipalMonth)
    actualTotalInterest += interestMonth
    actualTotalPayment += paymentThisMonth
    actualPayoffMonths = m

    // Inflation discounting for real cost
    const discount = Math.pow(1 + inflationRate / 100, m / 12)
    discountedTotalOutflow += paymentThisMonth / discount

    // Aggregate into current year
    yearPrincipal += regularPrincipal
    yearInterest += interestMonth
    yearExtra += actualExtra
    yearTotalPay += paymentThisMonth

    // End of year or final payoff month
    if (m % 12 === 0 || balance <= 0 || m === totalMonths) {
      let tax24b = 0
      let tax80c = 0
      if (enableTax) {
        const eligibleInterest = Math.min(200000, yearInterest)
        tax24b = Math.round(eligibleInterest * taxSlabRate)
        const eligiblePrincipal = Math.min(150000, yearPrincipal + yearExtra)
        tax80c = Math.round(eligiblePrincipal * taxSlabRate)
      }
      totalTaxSavings += tax24b + tax80c

      yearlyAmortization.push({
        year: currentYear,
        startingBalance: Math.round(yearStartBalance),
        principalPaid: Math.round(yearPrincipal),
        interestPaid: Math.round(yearInterest),
        extraPrepaymentPaid: Math.round(yearExtra),
        totalPaymentYear: Math.round(yearTotalPay),
        endingBalance: Math.round(balance),
        taxSavingsSec24b: tax24b,
        taxSavingsSec80c: tax80c,
      })

      currentYear++
      yearStartBalance = balance
      yearPrincipal = 0
      yearInterest = 0
      yearExtra = 0
      yearTotalPay = 0
    }
  }

  const roundedActualInterest = Math.round(actualTotalInterest)
  const roundedActualPayment = Math.round(actualTotalPayment)
  const interestSaved = Math.max(0, totalOriginalInterest - roundedActualInterest)
  const tenureMonthsSaved = Math.max(0, totalMonths - actualPayoffMonths)
  const netEffectiveCost = Math.max(0, roundedActualPayment - totalTaxSavings)

  return {
    monthlyEmi,
    totalTenureMonths: totalMonths,
    interestMethod,
    equivalentReducingApr,
    totalOriginalPayment,
    totalOriginalInterest,
    actualPayoffMonths,
    actualTotalInterest: roundedActualInterest,
    actualTotalPayment: roundedActualPayment,
    interestSaved,
    tenureMonthsSaved,
    totalTaxSavings: Math.round(totalTaxSavings),
    netEffectiveCost,
    realPurchasingPowerCost: Math.round(discountedTotalOutflow),
    yearlyAmortization,
  }
}
