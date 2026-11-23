import { useState, useEffect, useMemo } from 'react'
import {
  ArrowLeft,
  User,
  Calendar,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Building2,
  Wallet,
  Landmark,
  BadgePercent,
  ChevronDown,
  Download,
  Upload,
  AlertTriangle,
  Users,
} from 'lucide-react'
import {
  UserProfile,
  DEFAULT_SECTOR_INFLATION,
  calculateAgeFromDob,
  normalizeDobToDdMmYyyy,
  isValidDob,
  parseDobToIso,
  formatDobToMmDdYyyy,
  SectorInflationRates,
} from '@/domain/models/userProfile'
import { AreaType, LifestyleScenario } from '@/domain/models/profile'
import { useUserProfile, syncProfileToCalculators } from '@/lib/userProfileStorage'
import { useScenarioStore } from '@/store/useScenarioStore'
import { navigateToExportImport } from '@/lib/router'
import { cn } from '@/lib/cn'
import { ProfileSyncConfirmModal } from '@/components/profile/ProfileSyncConfirmModal'
import { ProfileDependentsTab } from '@/components/profile/ProfileDependentsTab'
import { NumberInput } from '@/components/ui/NumberInput'

interface ProfilePageProps {
  onBackToHome: () => void
}

type ProfileTab = 'personal' | 'dependents' | 'inflation' | 'income_tax' | 'returns'

const SECTOR_METADATA: {
  key: keyof SectorInflationRates
  label: string
  description: string
  suggested: number
}[] = [
  {
    key: 'healthcare',
    label: 'Healthcare & Insurance',
    description: 'Medical inflation historically trends high in India (~7-10%)',
    suggested: 7.0,
  },
  {
    key: 'family',
    label: 'Education & Dependents',
    description: 'Tuitions, schooling and higher education support',
    suggested: 7.0,
  },
  {
    key: 'food',
    label: 'Food & Groceries',
    description: 'Staples, dairy, vegetables, household consumables',
    suggested: 5.0,
  },
  {
    key: 'housing',
    label: 'Housing & Property',
    description: 'Maintenance, society charges, home upkeep',
    suggested: 5.0,
  },
  {
    key: 'transport',
    label: 'Transport & Commute',
    description: 'Fuel, vehicle maintenance, transit tickets',
    suggested: 5.0,
  },
  {
    key: 'utilities',
    label: 'Utilities & Digital',
    description: 'Electricity, water, mobile bills, broadband',
    suggested: 5.0,
  },
  {
    key: 'personal',
    label: 'Personal & Lifestyle',
    description: 'Apparel, vacations, festivals, dining out',
    suggested: 5.0,
  },
  {
    key: 'technology',
    label: 'Technology & Gadgets',
    description: 'Phones, laptops (tends to deflate or inflate lower)',
    suggested: 3.0,
  },
  {
    key: 'financial',
    label: 'Financial & Admin',
    description: 'Bank charges, tax filing, legal services',
    suggested: 5.0,
  },
  {
    key: 'emergency',
    label: 'Contingency & Reserves',
    description: 'Emergency buffers and unexpected provisions',
    suggested: 5.0,
  },
  {
    key: 'custom',
    label: 'Custom Commitments',
    description: 'Any other ongoing personal commitments',
    suggested: 5.0,
  },
]

export default function ProfilePage({ onBackToHome }: ProfilePageProps) {
  const { profile: storedProfile, updateProfile, resetProfile } = useUserProfile()
  const applyProfileDefaultsToWizard = useScenarioStore((s) => s.applyProfileDefaults)

  const [formData, setFormData] = useState<UserProfile>(() => ({
    ...storedProfile,
    dob: normalizeDobToDdMmYyyy(storedProfile.dob),
  }))
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal')
  const [autoSyncCalculators, setAutoSyncCalculators] = useState(true)
  const [showSavedToast, setShowSavedToast] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Local input string states so users can clear, backspace, and type numbers freely without premature clamping
  const [retirementAgeInput, setRetirementAgeInput] = useState<string>(
    String(storedProfile.retirementAge || 60)
  )
  const [targetAgeInput, setTargetAgeInput] = useState<string>(
    String(storedProfile.targetAge || 85)
  )

  // Calendar bounds: +/- 100 years from current date
  const { minDate, maxDate } = useMemo(() => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const m = String(today.getMonth() + 1).padStart(2, '0')
    const d = String(today.getDate()).padStart(2, '0')
    return {
      minDate: `${currentYear - 100}-${m}-${d}`,
      maxDate: `${currentYear + 100}-${m}-${d}`,
    }
  }, [])

  const dobIso = useMemo(() => parseDobToIso(formData.dob), [formData.dob])

  useEffect(() => {
    const normalizedDob = normalizeDobToDdMmYyyy(storedProfile.dob)
    setFormData({
      ...storedProfile,
      dob: normalizedDob,
    })
    setRetirementAgeInput(String(storedProfile.retirementAge || 60))
    setTargetAgeInput(String(storedProfile.targetAge || 85))
  }, [storedProfile])

  // DOB & Age synchronization
  const handleDobChange = (dob: string) => {
    setFormData((prev) => {
      let currentAge = prev.currentAge
      if (isValidDob(dob)) {
        currentAge = calculateAgeFromDob(dob)
      }
      return {
        ...prev,
        dob,
        currentAge,
      }
    })
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
    if (autoSyncCalculators) {
      setShowConfirmModal(true)
      return
    }
    executeSave()
  }

  const executeSave = () => {
    setShowConfirmModal(false)

    // Ensure final validated numbers from inputs
    const numRetire = parseInt(retirementAgeInput, 10)
    const minAge = Math.max(18, formData.currentAge)
    const finalRetire = isNaN(numRetire) ? 60 : Math.max(minAge, Math.min(100, numRetire))

    const numTarget = parseInt(targetAgeInput, 10)
    const minTarget = Math.max(finalRetire + 1, 65)
    const finalTarget = isNaN(numTarget) ? 85 : Math.max(minTarget, Math.min(120, numTarget))

    const payload: UserProfile = {
      ...formData,
      retirementAge: finalRetire,
      targetAge: finalTarget,
    }

    const updated = updateProfile(payload, autoSyncCalculators)
    if (autoSyncCalculators) {
      applyProfileDefaultsToWizard(updated)
    }

    setShowSavedToast(true)
    setTimeout(() => {
      setShowSavedToast(false)
    }, 2500)
  }

  const handleReset = () => {
    if (window.confirm('Reset your profile defaults back to system recommended values?')) {
      const defaults = resetProfile()
      const normalizedDob = normalizeDobToDdMmYyyy(defaults.dob)
      setFormData({
        ...defaults,
        dob: normalizedDob,
      })
      setRetirementAgeInput(String(defaults.retirementAge))
      setTargetAgeInput(String(defaults.targetAge))
      if (autoSyncCalculators) {
        syncProfileToCalculators(defaults)
        applyProfileDefaultsToWizard(defaults)
      }
    }
  }

  const workingYearsRemaining = Math.max(0, formData.retirementAge - formData.currentAge)
  const retirementYears = Math.max(0, formData.targetAge - formData.retirementAge)

  return (
    <div className="flex-1 flex flex-col">
      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-4 space-y-6 w-full">
        {/* Navigation & Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer"
              title="Reset all profile settings to defaults"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
                <User className="w-3.5 h-3.5" />
                <span>Global Baseline Settings</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight mt-1">
                Your Financial Profile & Defaults
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Set your personal baseline once. All 5 calculators auto-fill without asking each
                time, while still letting you tweak values individually.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigateToExportImport()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/80 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-xl transition-all cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Export & Import Data</span>
            </button>
          </div>
        </div>

        {/* Data Portability CTA Card */}
        <div className="p-3.5 sm:p-4 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-gradient-to-r from-blue-50/70 via-card to-card dark:from-blue-950/30 dark:via-card dark:to-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Download className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black text-foreground">
                  Backup or Transfer Your Profile & Calculators
                </h4>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  JSON Data
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Export your personal baseline and all 5 calculators as a single JSON file, or
                restore from automatic backups.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigateToExportImport()}
            className="w-full sm:w-auto px-4 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Export & Import JSON</span>
          </button>
        </div>

        {/* Tabbed Card Container */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex items-center gap-1 px-4 py-2.5 border-b border-border bg-muted/30 overflow-x-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('personal')}
              className={cn(
                'px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer',
                activeTab === 'personal'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <User className="w-4 h-4" />
              <span>Personal & Horizon</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dependents')}
              className={cn(
                'px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer',
                activeTab === 'dependents'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Users className="w-4 h-4" />
              <span>Dependents</span>
              {formData.dependents && formData.dependents.length > 0 && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                    activeTab === 'dependents'
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                  )}
                >
                  {formData.dependents.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('inflation')}
              className={cn(
                'px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer',
                activeTab === 'inflation'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Inflation Defaults</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('income_tax')}
              className={cn(
                'px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer',
                activeTab === 'income_tax'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Wallet className="w-4 h-4" />
              <span>Income, Savings & Tax</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('returns')}
              className={cn(
                'px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer',
                activeTab === 'returns'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <BadgePercent className="w-4 h-4" />
              <span>Returns & Interest</span>
            </button>
          </div>

          {/* Form Content */}
          <div className="p-5 sm:p-7 space-y-6">
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
                      className="w-full h-11 border border-border rounded-xl px-3.5 text-sm bg-background text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition-all"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Displays in headers and personalized summary reports.
                    </p>
                  </div>

                  {/* Location / Area Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Location / Area Type
                    </label>
                    <div className="relative">
                      <select
                        value={formData.locationType}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            locationType: e.target.value as AreaType,
                          }))
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
                    <p className="text-[11px] text-muted-foreground">
                      Calibrates baseline living expenses for Indian geography.
                    </p>
                  </div>
                </div>

                {/* DOB and Lifestyle Baseline Row */}
                <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-xs">
                    <Calendar className="w-4 h-4" />
                    <span>Date of Birth & Lifestyle Baseline</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* DOB Calendar Picker (MM-DD-YYYY) */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="user-profile-dob"
                        className="text-xs font-bold text-foreground"
                      >
                        Date of Birth (DOB) (MM-DD-YYYY)
                      </label>
                      <input
                        id="user-profile-dob"
                        type="date"
                        lang="en-US"
                        min={minDate}
                        max={maxDate}
                        value={dobIso}
                        onChange={(e) => handleDobChange(e.target.value)}
                        onClick={(e) => {
                          try {
                            e.currentTarget.showPicker?.()
                          } catch {
                            // ignore fallback
                          }
                        }}
                        className="w-full h-11 border border-border rounded-xl px-3.5 text-sm font-medium bg-background text-foreground [color-scheme:light] dark:[color-scheme:dark] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition-all cursor-pointer"
                      />
                      <div className="text-[11px] text-muted-foreground min-h-[1.25rem] flex items-center">
                        {formData.dob && isValidDob(formData.dob) ? (
                          <span className="inline-flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>
                              Age: {formData.currentAge}{' '}
                              {formData.currentAge === 1 ? 'year' : 'years'} old
                            </span>
                            {formatDobToMmDdYyyy(formData.dob) && (
                              <span className="text-muted-foreground font-normal">
                                ({formatDobToMmDdYyyy(formData.dob)})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span>
                            Select your date of birth (MM-DD-YYYY) to auto-compute your age.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Lifestyle Baseline Dropdown (in place of age field) */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="user-profile-lifestyle"
                        className="text-xs font-bold text-foreground"
                      >
                        Lifestyle Baseline
                      </label>
                      <div className="relative">
                        <select
                          id="user-profile-lifestyle"
                          value={formData.lifestyleBaseline}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              lifestyleBaseline: e.target.value as LifestyleScenario,
                            }))
                          }
                          className="w-full h-11 appearance-none border border-border rounded-xl pl-3.5 pr-10 text-sm font-medium bg-background text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition-all cursor-pointer"
                        >
                          <option value="bare_minimum">
                            Bare Minimum (Survival essentials only)
                          </option>
                          <option value="comfortable">
                            Comfortable (Leisure, outings & buffer)
                          </option>
                          <option value="luxury">Luxury (Premium lifestyle & higher buffer)</option>
                          <option value="custom">Custom (Manually itemized)</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-muted-foreground pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Baseline lifestyle spending tier for living expense benchmarks.
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
                    <NumberInput
                      min={Math.max(18, formData.currentAge)}
                      max={100}
                      integerOnly={true}
                      fallbackValue={60}
                      value={formData.retirementAge}
                      onChange={(val) => {
                        if (val !== undefined) {
                          setRetirementAgeInput(String(val))
                          setFormData((p) => ({ ...p, retirementAge: val }))
                        }
                      }}
                      className="w-full h-11 border border-border rounded-xl px-3.5 text-sm bg-background text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition-all font-bold"
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
                    <NumberInput
                      min={Math.max(formData.retirementAge + 1, 65)}
                      max={120}
                      integerOnly={true}
                      fallbackValue={85}
                      value={formData.targetAge}
                      onChange={(val) => {
                        if (val !== undefined) {
                          setTargetAgeInput(String(val))
                          setFormData((p) => ({ ...p, targetAge: val }))
                        }
                      }}
                      className="w-full h-11 border border-border rounded-xl px-3.5 text-sm bg-background text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition-all font-bold"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Corpus lasts up to this age (85–90 safeguards against longevity risk).
                    </p>
                  </div>
                </div>

                {/* Clean / Simplified Calculator Mode Switch */}
                <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <h4 className="text-xs font-bold text-foreground">
                        Clean & Simplified UI Mode
                      </h4>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        Quick Calculations
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      Minimizes helper texts, explanatory info boxes, suggestive preset chips (like
                      8%, 10%), and full schedule tables across all calculators for a quick,
                      distraction-free calculation experience. Warning and error notices remain
                      fully visible.
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={Boolean(formData.cleanView)}
                    onClick={() => setFormData((p) => ({ ...p, cleanView: !p.cleanView }))}
                    className={cn(
                      'w-12 h-6.5 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 border border-transparent shadow-xs',
                      formData.cleanView
                        ? 'bg-blue-600 justify-end'
                        : 'bg-zinc-200 dark:bg-zinc-700 justify-start'
                    )}
                    title={
                      formData.cleanView
                        ? 'Clean View enabled: click to disable'
                        : 'Clean View disabled: click to enable'
                    }
                  >
                    <span className="bg-white w-4.5 h-4.5 rounded-full shadow-md transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB: DEPENDENTS */}
            {activeTab === 'dependents' && (
              <ProfileDependentsTab
                dependents={formData.dependents || []}
                onChange={(deps) => setFormData((prev) => ({ ...prev, dependents: deps }))}
                userCurrentAge={formData.currentAge}
              />
            )}

            {/* TAB 2: INFLATION DEFAULTS */}
            {activeTab === 'inflation' && (
              <div className="space-y-5">
                {/* Mode Toggle with Sector-Wise as default active */}
                <div className="p-4 rounded-xl border border-border bg-muted/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Inflation Mode Preference</h4>
                    <p className="text-[11px] text-muted-foreground">
                      Sector-Wise is recommended for realistic financial modeling. Single rate
                      applies a uniform blanket inflation.
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
                          : 'text-muted-foreground hover:text-foreground'
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
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      Single Overall Rate
                    </button>
                  </div>
                </div>

                {/* When Single Rate is selected: show only single blanket rate */}
                {formData.inflationMode === 'overall' && (
                  <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs font-bold text-foreground">
                          Single Overall Inflation Rate (%)
                        </label>
                        <p className="text-[11px] text-muted-foreground">
                          Blanket inflation rate applied uniformly across all calculators and living
                          expense categories.
                        </p>
                      </div>
                      <span className="text-lg font-black text-blue-600 dark:text-blue-400">
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
                      <NumberInput
                        min={1}
                        max={20}
                        step={0.1}
                        fallbackValue={6.0}
                        value={formData.overallInflationRate}
                        onChange={(val) => {
                          if (val !== undefined) {
                            setFormData((p) => ({
                              ...p,
                              overallInflationRate: val,
                            }))
                          }
                        }}
                        className="w-24 h-11 px-3 text-sm bg-background border border-border rounded-xl font-bold text-center"
                      />
                    </div>
                  </div>
                )}

                {/* When Sector-Wise is selected: show sector-specific breakdown */}
                {formData.inflationMode === 'sector' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span>Sector-Specific Inflation Rates</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          In India, Healthcare & Education typically inflate at 7–10%, whereas
                          technology deflates (~3%).
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((p) => ({
                            ...p,
                            sectorInflationRates: {
                              ...DEFAULT_SECTOR_INFLATION,
                            },
                          }))
                        }
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer shrink-0"
                      >
                        Reset Sectors to Indian Benchmarks
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {SECTOR_METADATA.map((sector) => {
                        const currentRate =
                          formData.sectorInflationRates[sector.key] ?? sector.suggested
                        return (
                          <div
                            key={sector.key}
                            className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between gap-3 hover:border-blue-400 transition-colors shadow-2xs"
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
                              <NumberInput
                                min={0}
                                max={25}
                                step={0.5}
                                fallbackValue={sector.suggested}
                                value={currentRate}
                                onChange={(val) => {
                                  if (val !== undefined) {
                                    handleSectorInflationChange(sector.key, val)
                                  }
                                }}
                                className="w-18 h-9 px-2 text-xs bg-background border border-border rounded-lg font-bold text-right"
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
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-sm font-bold text-muted-foreground pointer-events-none">
                        ₹
                      </span>
                      <NumberInput
                        min={0}
                        step={5000}
                        fallbackValue={0}
                        value={formData.monthlyIncome}
                        onChange={(val) => {
                          if (val !== undefined) {
                            setFormData((p) => ({
                              ...p,
                              monthlyIncome: val,
                            }))
                          }
                        }}
                        className="w-full h-11 pl-8 pr-3.5 border border-border rounded-xl text-sm font-bold bg-background text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Net monthly earnings after employer deductions.
                    </p>
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Important:</strong> Set your amount{' '}
                        <strong>after deducting PF, Insurance, SIP, etc.</strong>, as they are
                        calculated and projected separately.
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Expected Annual Salary Increment (%)
                    </label>
                    <div className="flex items-center gap-2">
                      <NumberInput
                        min={0}
                        max={30}
                        step={0.5}
                        fallbackValue={8.0}
                        value={formData.annualIncomeGrowthRate}
                        onChange={(val) => {
                          if (val !== undefined) {
                            setFormData((p) => ({
                              ...p,
                              annualIncomeGrowthRate: val,
                            }))
                          }
                        }}
                        className="w-full h-11 px-3.5 border border-border rounded-xl text-sm font-bold bg-background text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition-all"
                      />
                      <span className="text-xs font-bold text-muted-foreground px-3 py-2.5 bg-muted rounded-xl h-11 flex items-center shrink-0">
                        % / Yr
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Standard annual appraisal in India (~7–10%).
                    </p>
                  </div>
                </div>

                {/* Savings & Investments */}
                <div className="p-4 sm:p-5 rounded-2xl border border-border bg-muted/20 space-y-4">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Existing Corpus & Monthly Investment Channels</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">
                        Existing Investable Corpus Today
                      </label>
                      <NumberInput
                        min={0}
                        step={50000}
                        value={formData.existingInvestableCorpus}
                        onChange={(val) =>
                          setFormData((p) => ({
                            ...p,
                            existingInvestableCorpus: val ?? 0,
                          }))
                        }
                        fallbackValue={0}
                        prefix="₹"
                        className="w-full h-11 border border-border rounded-xl text-sm font-bold bg-background text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition-all"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Liquid mutual funds, FDs, savings (excluding primary home).
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">
                        Default Monthly SIP Amount
                      </label>
                      <NumberInput
                        min={0}
                        step={1000}
                        value={formData.monthlySipInvestment}
                        onChange={(val) =>
                          setFormData((p) => ({
                            ...p,
                            monthlySipInvestment: val ?? 0,
                          }))
                        }
                        fallbackValue={0}
                        prefix="₹"
                        className="w-full h-11 border border-border rounded-xl text-sm font-bold bg-background text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition-all"
                      />
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
                      <NumberInput
                        min={0}
                        step={1000}
                        value={formData.monthlyPfInvestment}
                        onChange={(val) =>
                          setFormData((p) => ({
                            ...p,
                            monthlyPfInvestment: val ?? 0,
                          }))
                        }
                        fallbackValue={0}
                        prefix="₹"
                        className="w-full h-11 border border-border rounded-xl text-sm font-bold bg-background text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition-all"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Provident Fund deductions (Employee + Employer).
                      </p>
                    </div>

                    {/* NPS Investment */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">
                        Monthly NPS Contribution
                      </label>
                      <NumberInput
                        min={0}
                        step={1000}
                        value={formData.monthlyNpsInvestment}
                        onChange={(val) =>
                          setFormData((p) => ({
                            ...p,
                            monthlyNpsInvestment: val ?? 0,
                          }))
                        }
                        fallbackValue={0}
                        prefix="₹"
                        className="w-full h-11 border border-border rounded-xl text-sm font-bold bg-background text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition-all"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        National Pension System Tier 1 monthly contribution.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Taxes & LTCG with modernized dropdowns */}
                <div className="p-4 sm:p-5 rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 space-y-4">
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
                        For FD & Loan EMI tax calculations.
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
                        Determines loan interest tax deductions.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">
                        Equity LTCG Tax Rate
                      </label>
                      <NumberInput
                        min={0}
                        max={30}
                        step={0.5}
                        value={formData.ltcgTaxRate}
                        onChange={(val) =>
                          setFormData((p) => ({
                            ...p,
                            ltcgTaxRate: val ?? 0,
                          }))
                        }
                        fallbackValue={12.5}
                        suffix="%"
                        className="w-full h-11 border border-border rounded-xl text-sm font-bold bg-background text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition-all"
                      />
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
                <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card space-y-4">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Default Expected Return Rates & Interest Benchmarks</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Equity Return */}
                    <div className="space-y-2 p-3.5 rounded-xl border border-border bg-muted/20">
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
                        Used as baseline in SIP and multi-asset equity projections (Nifty 50
                        long-term ~12%).
                      </p>
                    </div>

                    {/* Debt / Balanced Return */}
                    <div className="space-y-2 p-3.5 rounded-xl border border-border bg-muted/20">
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
                    <div className="space-y-2 p-3.5 rounded-xl border border-border bg-muted/20">
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
                        Pre-filled baseline in Bank FD calculator (typical SBI/HDFC/post-office
                        range).
                      </p>
                    </div>

                    {/* Loan Interest Rate */}
                    <div className="space-y-2 p-3.5 rounded-xl border border-border bg-muted/20">
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

          {/* Action Footer */}
          <div className="px-5 sm:px-7 py-4 border-t border-border bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoSyncCalculators}
                onChange={(e) => setAutoSyncCalculators(e.target.checked)}
                className="w-4 h-4 rounded-sm text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>Auto-apply these defaults to all 5 calculators immediately</span>
            </label>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleSave}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {showSavedToast ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Saved to Profile & Calculators!</span>
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
      </main>

      <ProfileSyncConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={executeSave}
      />
    </div>
  )
}
