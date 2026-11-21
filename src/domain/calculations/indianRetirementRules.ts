import Decimal from 'decimal.js'
import type { Assets, OtherIncome, FutureLumpSum } from '@/domain/models/assets'
import { DEFAULT_ASSETS } from '@/domain/models/assets'
import type { UserProfile } from '@/domain/models/userProfile'

/**
 * Historical benchmark long-term CAGR for NPS Tier-1 across Scheme E, C, and G.
 * Blended equity (12%) and debt (7–8%) yields ~10.0% annualized long-term return in India.
 */
export const NPS_DEFAULT_ANNUAL_RETURN = 0.1

/**
 * Statutory minimum annuity requirement under PFRDA NPS regulations at normal exit (age 60).
 * At least 40% of the accumulated corpus must be converted to an annuity plan.
 */
export const NPS_MANDATORY_ANNUITY_RATIO = 0.4

/**
 * Prevailing immediate life annuity rate offered by Indian Annuity Service Providers (ASPs)
 * (such as LIC, HDFC Life, SBI Life, ICICI Prudential) for retirees around age 60.
 */
export const NPS_DEFAULT_ANNUITY_RATE = 0.06

/**
 * Official statutory EPF interest rate notified by the Central Board of Trustees (CBT) EPFO
 * in India (8.25% p.a. active across FY 2023-24, 2024-25, and 2025-26).
 */
export const EPF_DEFAULT_INTEREST_RATE = 0.0825

export interface NpsRetirementProjection {
  workingYears: number
  totalAccumulatedCorpus: number
  annuityCorpus: number
  lumpSumCorpus: number
  annualPension: number
  monthlyPension: number
  startYear: number
}

/**
 * Projects accumulated NPS corpus and resulting annuity pension based on Indian PFRDA rules.
 */
export function calculateNpsRetirementProjection(params: {
  monthlyNpsInvestment: number
  currentAge: number
  retirementAge: number
  annualReturnRate?: number
  annuityRatio?: number
  annuityRate?: number
}): NpsRetirementProjection {
  const {
    monthlyNpsInvestment,
    currentAge,
    retirementAge,
    annualReturnRate = NPS_DEFAULT_ANNUAL_RETURN,
    annuityRatio = NPS_MANDATORY_ANNUITY_RATIO,
    annuityRate = NPS_DEFAULT_ANNUITY_RATE,
  } = params

  const safeMonthly = Math.max(0, monthlyNpsInvestment || 0)
  const workingYears = Math.max(0, (retirementAge || 60) - (currentAge || 30))

  if (safeMonthly === 0 || workingYears === 0) {
    return {
      workingYears,
      totalAccumulatedCorpus: 0,
      annuityCorpus: 0,
      lumpSumCorpus: 0,
      annualPension: 0,
      monthlyPension: 0,
      startYear: Math.max(1, workingYears + 1),
    }
  }

  const months = workingYears * 12
  const monthlyRate = new Decimal(annualReturnRate).div(12)

  // FV of monthly recurring annuity due / ordinary annuity:
  // FV = P * [ (1 + r)^n - 1 ] / r * (1 + r)
  const onePlusR = new Decimal(1).plus(monthlyRate)
  const compoundFactor = onePlusR.pow(months).minus(1).div(monthlyRate).mul(onePlusR)
  const totalCorpus = new Decimal(safeMonthly).mul(compoundFactor).toDecimalPlaces(0).toNumber()

  const safeAnnuityRatio = Math.max(0.2, Math.min(1.0, annuityRatio))
  const annuityCorpus = new Decimal(totalCorpus).mul(safeAnnuityRatio).toDecimalPlaces(0).toNumber()
  const lumpSumCorpus = Math.max(0, totalCorpus - annuityCorpus)

  const annualPension = new Decimal(annuityCorpus).mul(annuityRate).toDecimalPlaces(0).toNumber()
  const monthlyPension = new Decimal(annualPension).div(12).toDecimalPlaces(0).toNumber()

  return {
    workingYears,
    totalAccumulatedCorpus: totalCorpus,
    annuityCorpus,
    lumpSumCorpus,
    annualPension,
    monthlyPension,
    startYear: Math.max(1, workingYears + 1),
  }
}

export interface PfMaturityProjection {
  workingYears: number
  maturityLumpSum: number
  maturityYear: number
  annualInterestRate: number
}

/**
 * Projects accumulated EPF / PF corpus maturity lump sum based on official EPFO rules.
 */
export function calculatePfMaturityProjection(params: {
  monthlyPfInvestment: number
  currentAge: number
  retirementAge: number
  annualInterestRate?: number
}): PfMaturityProjection {
  const {
    monthlyPfInvestment,
    currentAge,
    retirementAge,
    annualInterestRate = EPF_DEFAULT_INTEREST_RATE,
  } = params

  const safeMonthly = Math.max(0, monthlyPfInvestment || 0)
  const workingYears = Math.max(0, (retirementAge || 60) - (currentAge || 30))

  if (safeMonthly === 0 || workingYears === 0) {
    return {
      workingYears,
      maturityLumpSum: 0,
      maturityYear: Math.max(1, workingYears),
      annualInterestRate,
    }
  }

  const months = workingYears * 12
  const monthlyRate = new Decimal(annualInterestRate).div(12)

  const onePlusR = new Decimal(1).plus(monthlyRate)
  const compoundFactor = onePlusR.pow(months).minus(1).div(monthlyRate).mul(onePlusR)
  const maturityLumpSum = new Decimal(safeMonthly).mul(compoundFactor).toDecimalPlaces(0).toNumber()

  return {
    workingYears,
    maturityLumpSum,
    maturityYear: Math.max(1, workingYears),
    annualInterestRate,
  }
}

/**
 * Builds or synchronizes assets from User Profile defaults:
 * - Calculates NPS pension in otherIncome (starts after set retirement age).
 * - Calculates EPF lump sum in futureContributions (matures at retirement age).
 * - Preserves any user-customized income sources (such as insurance plans starting in current year, rentals)
 *   and custom lump sums.
 */
export function buildDefaultAssetsFromProfile(
  profile: UserProfile,
  existingAssets?: Assets
): Assets {
  const base: Assets = existingAssets ? { ...existingAssets } : { ...DEFAULT_ASSETS }

  const workingYears = Math.max(0, profile.retirementAge - profile.currentAge)

  // 1. Calculate NPS projection
  const npsProjection = calculateNpsRetirementProjection({
    monthlyNpsInvestment: profile.monthlyNpsInvestment,
    currentAge: profile.currentAge,
    retirementAge: profile.retirementAge,
  })

  // 2. Calculate PF projection
  const pfProjection = calculatePfMaturityProjection({
    monthlyPfInvestment: profile.monthlyPfInvestment,
    currentAge: profile.currentAge,
    retirementAge: profile.retirementAge,
  })

  // Synchronize NPS Pension in otherIncome
  let otherIncome = [...(base.otherIncome || [])]
  if (npsProjection.annualPension > 0) {
    const existingNpsIndex = otherIncome.findIndex(
      (i) =>
        i.id === 'nps_pension' ||
        i.incomeType === 'nps_annuity' ||
        i.label.toLowerCase().includes('nps')
    )
    const npsItem: OtherIncome = {
      id: existingNpsIndex >= 0 ? otherIncome[existingNpsIndex].id : 'nps_pension',
      incomeType: 'nps_annuity',
      label: 'NPS Tier-1 Pension (40% Annuity)',
      annualAmount: npsProjection.annualPension,
      startYear: npsProjection.startYear,
      endYear: undefined,
      inflationLinked: false,
    }
    if (existingNpsIndex >= 0) {
      otherIncome[existingNpsIndex] = npsItem
    } else {
      otherIncome.push(npsItem)
    }
  }

  // Synchronize EPF Maturity in futureContributions
  let futureContributions = [...(base.futureContributions || [])]
  if (pfProjection.maturityLumpSum > 0) {
    const existingPfIndex = futureContributions.findIndex(
      (l) =>
        l.id === 'pf_maturity' ||
        l.label.toLowerCase().includes('epf') ||
        l.label.toLowerCase().includes('pf maturity')
    )
    const pfItem: FutureLumpSum = {
      id: existingPfIndex >= 0 ? futureContributions[existingPfIndex].id : 'pf_maturity',
      label: 'EPF / PF Maturity (8.25% EPFO)',
      amount: pfProjection.maturityLumpSum,
      year: pfProjection.maturityYear,
    }
    if (existingPfIndex >= 0) {
      futureContributions[existingPfIndex] = pfItem
    } else {
      futureContributions.push(pfItem)
    }
  }

  // Synchronize NPS 60% Tax-Free Lump Sum in futureContributions
  if (npsProjection.lumpSumCorpus > 0) {
    const existingNpsLsIndex = futureContributions.findIndex(
      (l) =>
        l.id === 'nps_lump_sum' ||
        l.label.toLowerCase().includes('nps 60%') ||
        l.label.toLowerCase().includes('nps lump')
    )
    const npsLsItem: FutureLumpSum = {
      id: existingNpsLsIndex >= 0 ? futureContributions[existingNpsLsIndex].id : 'nps_lump_sum',
      label: 'NPS 60% Tax-Free Lump Sum',
      amount: npsProjection.lumpSumCorpus,
      year: Math.max(1, workingYears),
    }
    if (existingNpsLsIndex >= 0) {
      futureContributions[existingNpsLsIndex] = npsLsItem
    } else {
      futureContributions.push(npsLsItem)
    }
  }

  return {
    ...base,
    monthlyIncome: profile.monthlyIncome,
    incomeEndAge: profile.retirementAge,
    incomeGrowthRate: profile.annualIncomeGrowthRate / 100,
    existingInvestableCorpus: profile.existingInvestableCorpus,
    otherIncome,
    futureContributions,
  }
}
