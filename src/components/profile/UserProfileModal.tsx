import { useState, useEffect } from 'react'
import {
  X,
  User,
  Calendar,
  TrendingUp,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Building2,
  Wallet,
  Landmark,
  BadgePercent,
  ChevronDown,
} from 'lucide-react'
import {
  UserProfile,
  DEFAULT_SECTOR_INFLATION,
  calculateAgeFromDob,
  calculateDobFromAge,
  SectorInflationRates,
} from '@/domain/models/userProfile'
import { AreaType, LifestyleScenario } from '@/domain/models/profile'
import { useUserProfile, syncProfileToCalculators } from '@/lib/userProfileStorage'
import { useScenarioStore } from '@/store/useScenarioStore'
import { cn } from '@/lib/cn'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

type ProfileTab = 'personal' | 'inflation' | 'income_tax' | 'returns'

const SECTOR_METADATA: {
  key: keyof SectorInflationRates
  label: string
  description: string
  suggested: number
}[] = [
  { key: 'healthcare', label: 'Healthcare & Insurance', description: 'Medical inflation historically trends high in India', suggested: 7.0 },
  { key: 'family', label: 'Education & Dependents', description: 'Tuitions, schooling and higher education support', suggested: 7.0 },
  { key: 'food', label: 'Food & Groceries', description: 'Staples, dairy, vegetables, household consumables', suggested: 5.0 },
  { key: 'housing', label: 'Housing & Property', description: 'Maintenance, society charges, home upkeep', suggested: 5.0 },
  { key: 'transport', label: 'Transport & Commute', description: 'Fuel, vehicle maintenance, transit tickets', suggested: 5.0 },
  { key: 'utilities', label: 'Utilities & Digital', description: 'Electricity, water, mobile bills, broadband', suggested: 5.0 },
  { key: 'personal', label: 'Personal & Lifestyle', description: 'Apparel, vacations, festivals, dining out', suggested: 5.0 },
  { key: 'technology', label: 'Technology & Gadgets', description: 'Phones, laptops (tends to deflate or inflate lower)', suggested: 3.0 },
  { key: 'financial', label: 'Financial & Admin', description: 'Bank charges, tax filing, legal services', suggested: 5.0 },
  { key: 'emergency', label: 'Contingency & Reserves', description: 'Emergency buffers and unexpected provisions', suggested: 5.0 },
  { key: 'custom', label: 'Custom Commitments', description: 'Any other ongoing personal commitments', suggested: 5.0 },
]

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { profile: storedProfile, updateProfile, resetProfile } = useUserProfile()
  const applyProfileDefaultsToWizard = useScenarioStore((s) => s.applyProfileDefaults)

  const [formData, setFormData] = useState<UserProfile>(storedProfile)
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal')
  const [autoSyncCalculators, setAutoSyncCalculators] = useState(true)
  const [showSavedToast, setShowSavedToast] = useState(false)

  // Sync internal state when storedProfile changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(storedProfile)
      setShowSavedToast(false)
    }
  }, [isOpen, storedProfile])

  if (!isOpen) return null

  // Date of Birth and Age synchronization
  const handleDobChange = (dob: string) => {
    const age = calculateAgeFromDob(dob)
    setFormData((prev) => ({
      ...prev,
      dob,
      currentAge: age,
    }))
  }

  const handleAgeChange = (ageVal: number) => {
    const safeAge = Math.max(1, Math.min(120, ageVal || 1))
    const approxDob = calculateDobFromAge(safeAge)
    setFormData((prev) => ({
      ...prev,
      currentAge: safeAge,
      dob: approxDob,
    }))
  }

  const handleSectorInflationChange = (key: keyof SectorInflationRates, val: number) => {
    setFormData((prev) => ({
      ...prev,
      sectorInflationRates: {
        ...prev.sectorInflationRates,
        [key]: Math.max(0, Math.min(30, val)),
      },
    }))
  }

  const handleSave = () => {
    // 1. Update Profile in local storage
    const updated = updateProfile(formData, autoSyncCalculators)

    // 2. Also sync to Scenario Wizard store if autoSync is enabled
    if (autoSyncCalculators) {
      applyProfileDefaultsToWizard(updated)
    }

    setShowSavedToast(true)
    setTimeout(() => {
      setShowSavedToast(false)
      onClose()
    }, 600)
  }

  const handleReset = () => {
    if (window.confirm('Reset your profile defaults back to system recommended values?')) {
      const defaults = resetProfile()
      setFormData(defaults)
      if (autoSyncCalculators) {
        syncProfileToCalculators(defaults)
        applyProfileDefaultsToWizard(defaults)
      }
    }
  }

  const workingYearsRemaining = Math.max(0, formData.retirementAge - formData.currentAge)
  const retirementYears = Math.max(0, formData.targetAge - formData.retirementAge)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-foreground font-sans my-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-profile-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="user-profile-title" className="text-base sm:text-lg font-black text-foreground tracking-tight">
                  User Profile & Calculator Defaults
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hidden sm:inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Local & Private
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Set your personal financial baseline once. All calculators auto-fill these values.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all cursor-pointer"
            title="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-card overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={cn(
              'px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer',
              activeTab === 'personal'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <User className="w-3.5 h-3.5" />
            <span>Personal & Horizon</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inflation')}
            className={cn(
              'px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer',
              activeTab === 'inflation'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Inflation Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('income_tax')}
            className={cn(
              'px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer',
              activeTab === 'income_tax'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Income, Savings & Tax</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('returns')}
            className={cn(
              'px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer',
              activeTab === 'returns'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <BadgePercent className="w-3.5 h-3.5" />
            <span>Returns & Interest</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: PERSONAL & HORIZON */}
          {activeTab === 'personal' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Used to personalize headers and reports.
                  </p>
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Country</label>
                  <div className="relative">
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))}
                      className="w-full h-11 appearance-none border border-border rounded-xl pl-3.5 pr-10 text-sm font-medium bg-background text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition-all cursor-pointer"
                    >
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Singapore">Singapore</option>
                      <option value="UAE">United Arab Emirates</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-muted-foreground pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* DOB and Age Row */}
              <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-xs">
                  <Calendar className="w-4 h-4" />
                  <span>Date of Birth & Age Calculation</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Date of Birth (DOB)
                    </label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => handleDobChange(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Setting your DOB automatically computes your current age.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Current Age (Years)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={110}
                        value={formData.currentAge}
                        onChange={(e) => handleAgeChange(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-xs font-semibold text-muted-foreground px-2 py-1 bg-muted rounded-lg">
                        Years Old
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Baseline for retirement planning and seniority benefits.
                    </p>
                  </div>
                </div>
              </div>

              {/* Retirement & Target Life Expectancy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">
                      Target Retirement Age
                    </label>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                      {workingYearsRemaining} working yrs left
                    </span>
                  </div>
                  <input
                    type="number"
                    min={Math.max(18, formData.currentAge)}
                    max={100}
                    value={formData.retirementAge}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        retirementAge: Math.max(18, parseInt(e.target.value, 10) || 60),
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Age when active salary stops and withdrawals begin.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">
                      Planning Horizon / Life Expectancy
                    </label>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      {retirementYears} yrs in retirement
                    </span>
                  </div>
                  <input
                    type="number"
                    min={Math.max(formData.retirementAge + 1, 65)}
                    max={120}
                    value={formData.targetAge}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        targetAge: Math.max(formData.retirementAge + 1, parseInt(e.target.value, 10) || 85),
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Corpus lasts up to this age (e.g. 85-90 protects against longevity).
                  </p>
                </div>
              </div>

              {/* Currency & Location Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Currency</label>
                  <div className="relative">
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData((p) => ({ ...p, currency: e.target.value }))}
                      className="w-full h-11 appearance-none border border-border rounded-xl pl-3.5 pr-10 text-sm font-medium bg-background text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition-all cursor-pointer"
                    >
                      <option value="INR">INR (₹) - Indian Rupee</option>
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-muted-foreground pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Location / Area Type
                  </label>
                  <div className="relative">
                    <select
                      value={formData.locationType}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, locationType: e.target.value as AreaType }))
                      }
                      className="w-full h-11 appearance-none border border-border rounded-xl pl-3.5 pr-10 text-sm font-medium bg-background text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition-all cursor-pointer"
                    >
                      <option value="village">Village / Rural (~50% of metro cost)</option>
                      <option value="small_town">Small Town Tier 3 (Baseline benchmark)</option>
                      <option value="city">City Tier 2 (~1.6x of small town)</option>
                      <option value="tier1_metro">Metro Tier 1 (~2.5x of small town)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-muted-foreground pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Lifestyle Baseline */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Lifestyle Baseline
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'bare_minimum', label: 'Bare Minimum', desc: 'Survival essentials only' },
                    { id: 'comfortable', label: 'Comfortable', desc: 'Leisure, outings & buffer' },
                    { id: 'luxury', label: 'Luxury', desc: 'Premium lifestyle & higher buffer' },
                    { id: 'custom', label: 'Custom', desc: 'Manually itemized' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({
                          ...p,
                          lifestyleBaseline: lvl.id as LifestyleScenario,
                        }))
                      }
                      className={cn(
                        'p-2.5 rounded-xl border text-left transition-all cursor-pointer',
                        formData.lifestyleBaseline === lvl.id
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/50 text-blue-900 dark:text-blue-100 font-bold shadow-xs'
                          : 'border-border hover:bg-muted text-foreground',
                      )}
                    >
                      <div className="text-xs font-bold">{lvl.label}</div>
                      <div className="text-[10px] text-muted-foreground">{lvl.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INFLATION DEFAULTS */}
          {activeTab === 'inflation' && (
            <div className="space-y-5">
              {/* Mode Toggle with Sector-Wise as default active */}
              <div className="p-4 rounded-xl border border-border bg-muted/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    Inflation Mode Preference
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Sector-Wise is recommended for realistic financial modeling. Single rate applies a uniform blanket inflation.
                  </p>
                </div>
                <div className="inline-flex rounded-xl border border-border bg-background p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, inflationMode: 'sector' }))}
                    className={cn(
                      'px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer',
                      formData.inflationMode === 'sector'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    Sector-Wise (Recommended)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, inflationMode: 'overall' }))}
                    className={cn(
                      'px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer',
                      formData.inflationMode === 'overall'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    Single Overall Rate
                  </button>
                </div>
              </div>

              {/* When Single Rate is selected: show only single blanket rate, hide sector-wise fields */}
              {formData.inflationMode === 'overall' && (
                <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-foreground">
                        Overall Blanket Inflation Rate (%)
                      </label>
                      <p className="text-[11px] text-muted-foreground">
                        Used by SIP, FD, and Loan EMI calculators, and as default for overall projections.
                      </p>
                    </div>
                    <span className="text-base font-black text-blue-600 dark:text-blue-400">
                      {formData.overallInflationRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={2}
                      max={15}
                      step={0.5}
                      value={formData.overallInflationRate}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          overallInflationRate: parseFloat(e.target.value),
                        }))
                      }
                      className="flex-1 accent-blue-600 cursor-pointer"
                    />
                    <input
                      type="number"
                      min={1}
                      max={20}
                      step={0.1}
                      value={formData.overallInflationRate}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          overallInflationRate: Math.max(0, parseFloat(e.target.value) || 0),
                        }))
                      }
                      className="w-20 px-2 py-1 text-sm bg-background border border-input rounded-lg font-bold text-center"
                    />
                  </div>
                </div>
              )}

              {/* When Sector-Wise is selected: show sector-specific breakdown */}
              {formData.inflationMode === 'sector' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>Sector-Specific Inflation Rates</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({
                          ...p,
                          sectorInflationRates: { ...DEFAULT_SECTOR_INFLATION },
                        }))
                      }
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Reset Sectors to Indian Benchmarks
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SECTOR_METADATA.map((sector) => {
                      const currentRate = formData.sectorInflationRates[sector.key] ?? sector.suggested
                      return (
                        <div
                          key={sector.key}
                          className="p-3 rounded-xl border border-border bg-card/60 flex items-center justify-between gap-3 hover:border-blue-400 transition-colors"
                        >
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-foreground truncate">
                                {sector.label}
                              </span>
                              {sector.key === 'healthcare' || sector.key === 'family' ? (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold">
                                  High
                                </span>
                              ) : null}
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {sector.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <input
                              type="number"
                              min={0}
                              max={25}
                              step={0.5}
                              value={currentRate}
                              onChange={(e) =>
                                handleSectorInflationChange(
                                  sector.key,
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="w-16 px-2 py-1 text-xs bg-background border border-input rounded-lg font-bold text-right"
                            />
                            <span className="text-xs font-bold text-muted-foreground">%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INCOME, SAVINGS & TAX */}
          {activeTab === 'income_tax' && (
            <div className="space-y-5">
              {/* Active Income Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Current Monthly Take-Home Income
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={5000}
                      value={formData.monthlyIncome}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          monthlyIncome: Math.max(0, parseInt(e.target.value, 10) || 0),
                        }))
                      }
                      className="w-full pl-7 pr-3 py-2 text-sm bg-background border border-input rounded-xl font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Net monthly earnings after employer deductions.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Expected Annual Salary Increment (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={30}
                      step={0.5}
                      value={formData.annualIncomeGrowthRate}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          annualIncomeGrowthRate: Math.max(0, parseFloat(e.target.value) || 0),
                        }))
                      }
                      className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-muted-foreground px-2 py-1 bg-muted rounded-lg">
                      % / Year
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Standard annual career appraisal in India (~7-10%).
                  </p>
                </div>
              </div>

              {/* Savings & Existing Corpus */}
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-4">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Existing Corpus & Monthly Investment Channels</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Existing Investable Corpus Today
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={50000}
                        value={formData.existingInvestableCorpus}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            existingInvestableCorpus: Math.max(0, parseInt(e.target.value, 10) || 0),
                          }))
                        }
                        className="w-full pl-7 pr-3 py-2 text-sm bg-background border border-input rounded-xl font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Liquid mutual funds, FDs, stocks, savings (excluding primary home).
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Default Monthly SIP Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={formData.monthlySipInvestment}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            monthlySipInvestment: Math.max(0, parseInt(e.target.value, 10) || 0),
                          }))
                        }
                        className="w-full pl-7 pr-3 py-2 text-sm bg-background border border-input rounded-xl font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Baseline for systematic investment calculator.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* PF Investment */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Monthly EPF / PF Contribution
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={formData.monthlyPfInvestment}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            monthlyPfInvestment: Math.max(0, parseInt(e.target.value, 10) || 0),
                          }))
                        }
                        className="w-full pl-7 pr-3 py-2 text-sm bg-background border border-input rounded-xl font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Provident Fund deductions (Employee + Employer share).
                    </p>
                  </div>

                  {/* NPS Investment */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Monthly NPS Contribution
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={formData.monthlyNpsInvestment}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            monthlyNpsInvestment: Math.max(0, parseInt(e.target.value, 10) || 0),
                          }))
                        }
                        className="w-full pl-7 pr-3 py-2 text-sm bg-background border border-input rounded-xl font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      National Pension System Tier 1 monthly contribution.
                    </p>
                  </div>
                </div>
              </div>

              {/* Taxes & LTCG */}
              <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 space-y-4">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <BadgePercent className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Tax Slabs & Capital Gains (Budget 2024 Defaults)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Income Tax Bracket
                    </label>
                    <div className="relative">
                      <select
                        value={formData.incomeTaxBracket}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            incomeTaxBracket: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full h-11 appearance-none border border-border rounded-xl pl-3.5 pr-10 text-sm font-medium bg-background text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition-all cursor-pointer"
                      >
                        <option value={0}>0% (Exempt)</option>
                        <option value={5}>5%</option>
                        <option value={10}>10%</option>
                        <option value={15}>15%</option>
                        <option value={20}>20%</option>
                        <option value={30}>30% (Highest Slab)</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-muted-foreground pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      For FD and Loan EMI deductions.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Tax Regime</label>
                    <div className="relative">
                      <select
                        value={formData.taxRegime}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            taxRegime: e.target.value as 'new' | 'old',
                          }))
                        }
                        className="w-full h-11 appearance-none border border-border rounded-xl pl-3.5 pr-10 text-sm font-medium bg-background text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition-all cursor-pointer"
                      >
                        <option value="new">New Tax Regime</option>
                        <option value="old">Old Tax Regime (Sec 80C & 24b)</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-muted-foreground pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Determines home loan deductions.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Equity LTCG Tax Rate
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        max={30}
                        step={0.5}
                        value={formData.ltcgTaxRate}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            ltcgTaxRate: Math.max(0, parseFloat(e.target.value) || 0),
                          }))
                        }
                        className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl font-bold"
                      />
                      <span className="text-xs font-bold text-muted-foreground">%</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      12.5% per Indian Budget 2024.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RETURNS & INTEREST */}
          {activeTab === 'returns' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl border border-border bg-card space-y-4">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Default Expected Return Rates & Interest Benchmarks</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Equity Return */}
                  <div className="space-y-1.5 p-3 rounded-xl border border-border bg-muted/20">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground">
                        Expected Equity / Mutual Fund Return
                      </label>
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                        {formData.expectedEquityReturn}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={6}
                      max={20}
                      step={0.5}
                      value={formData.expectedEquityReturn}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          expectedEquityReturn: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Used as baseline in SIP and multi-asset equity projections (Nifty 50 long-term avg ~12%).
                    </p>
                  </div>

                  {/* Debt / Balanced Return */}
                  <div className="space-y-1.5 p-3 rounded-xl border border-border bg-muted/20">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground">
                        Expected Debt / Balanced Portfolio Return
                      </label>
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                        {formData.expectedDebtReturn}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={12}
                      step={0.5}
                      value={formData.expectedDebtReturn}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          expectedDebtReturn: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Used for post-retirement conservative drawdown (SWP) and debt allocations.
                    </p>
                  </div>

                  {/* FD Interest Rate */}
                  <div className="space-y-1.5 p-3 rounded-xl border border-border bg-muted/20">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground">
                        Fixed Deposit (FD) Annual Rate
                      </label>
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                        {formData.fdInterestRate}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={11}
                      step={0.25}
                      value={formData.fdInterestRate}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          fdInterestRate: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Pre-filled baseline in Bank FD calculator (typical SBI/HDFC/post-office range).
                    </p>
                  </div>

                  {/* Loan Interest Rate */}
                  <div className="space-y-1.5 p-3 rounded-xl border border-border bg-muted/20">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground">
                        Benchmark Loan Interest Rate
                      </label>
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                        {formData.loanInterestRate}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={6}
                      max={18}
                      step={0.25}
                      value={formData.loanInterestRate}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          loanInterestRate: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Pre-filled in Loan EMI calculator (typical Indian home loan rate ~8.5%).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoSyncCalculators}
                onChange={(e) => setAutoSyncCalculators(e.target.checked)}
                className="rounded-sm text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>Auto-apply to all 5 calculators</span>
            </label>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-foreground bg-card hover:bg-muted border border-border rounded-xl cursor-pointer transition-all"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs hover:shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
            >
              {showSavedToast ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save Profile Defaults</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
