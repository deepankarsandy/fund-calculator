import {
  Users,
  Plus,
  Trash2,
  Heart,
  Baby,
  Shield,
  GraduationCap,
  Info,
  ChevronDown,
} from 'lucide-react'
import type { HouseholdMember, Relationship } from '@/domain/models/household'
import { cn } from '@/lib/cn'

interface ProfileDependentsTabProps {
  dependents: HouseholdMember[]
  onChange: (dependents: HouseholdMember[]) => void
  userCurrentAge?: number
}

const RELATIONSHIP_OPTIONS: { label: string; value: Relationship }[] = [
  { label: 'Spouse', value: 'spouse' },
  { label: 'Child', value: 'child' },
  { label: 'Parent', value: 'parent' },
  { label: 'Sibling', value: 'sibling' },
  { label: 'Other Dependent', value: 'other' },
]

export function ProfileDependentsTab({
  dependents = [],
  onChange,
  userCurrentAge = 30,
}: ProfileDependentsTabProps) {
  const handleAddSpouse = () => {
    const newSpouse: HouseholdMember = {
      id: `dep-spouse-${Date.now()}`,
      label: 'Spouse',
      relationship: 'spouse',
      age: Math.max(18, userCurrentAge - 2),
      financiallyDependent: true,
      hasHealthInsurance: true,
    }
    onChange([...dependents, newSpouse])
  }

  const handleAddChild = () => {
    const existingChildren = dependents.filter((d) => d.relationship === 'child').length
    const newChild: HouseholdMember = {
      id: `dep-child-${Date.now()}`,
      label: existingChildren > 0 ? `Child ${existingChildren + 1}` : 'Child',
      relationship: 'child',
      age: 5,
      financiallyDependent: true,
      supportUntilAge: 25,
      hasHealthInsurance: false,
    }
    onChange([...dependents, newChild])
  }

  const handleAddParent = () => {
    const existingParents = dependents.filter((d) => d.relationship === 'parent').length
    const newParent: HouseholdMember = {
      id: `dep-parent-${Date.now()}`,
      label: existingParents > 0 ? `Parent ${existingParents + 1}` : 'Parent',
      relationship: 'parent',
      age: Math.min(100, Math.max(45, userCurrentAge + 28)),
      financiallyDependent: true,
      supportUntilAge: 85,
      hasHealthInsurance: false,
    }
    onChange([...dependents, newParent])
  }

  const handleAddGeneric = () => {
    const newDependent: HouseholdMember = {
      id: `dep-other-${Date.now()}`,
      label: 'Family Member',
      relationship: 'other',
      age: 30,
      financiallyDependent: true,
      hasHealthInsurance: false,
    }
    onChange([...dependents, newDependent])
  }

  const handleUpdate = (index: number, patch: Partial<HouseholdMember>) => {
    const updated = [...dependents]
    updated[index] = { ...updated[index], ...patch }
    onChange(updated)
  }

  const handleRemove = (index: number) => {
    onChange(dependents.filter((_, i) => i !== index))
  }

  const handleClearAll = () => {
    if (window.confirm('Remove all default dependents from your profile?')) {
      onChange([])
    }
  }

  const childCount = dependents.filter((d) => d.relationship === 'child').length
  const parentCount = dependents.filter((d) => d.relationship === 'parent').length
  const spouseCount = dependents.filter((d) => d.relationship === 'spouse').length

  return (
    <div className="space-y-6">
      {/* Informational Guidance Banner */}
      <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/25 space-y-2">
        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold text-xs">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>Default Household Dependents for Retirement Planning</span>
        </div>
        <p className="text-xs text-blue-900/80 dark:text-blue-200/90 leading-relaxed">
          Configure family members who rely on your income and retirement corpus (spouse, children,
          elderly parents). When profile defaults are applied or auto-synced, these dependents are
          pre-filled directly into <strong>Step 3 (Household Members)</strong> of your Retirement
          Calculator, automatically configuring child schooling, college horizons, and parental
          support windows.
        </p>
      </div>

      {/* Quick-Add Preset Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-muted/40">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-foreground">Add Default Dependent:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAddSpouse}
            disabled={spouseCount >= 2}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-background hover:bg-muted text-foreground border border-border transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            title="Add Spouse to default profile"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>+ Spouse</span>
          </button>

          <button
            type="button"
            onClick={handleAddChild}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-background hover:bg-muted text-foreground border border-border transition-colors cursor-pointer shadow-2xs"
            title="Add Child with schooling and college education support horizons"
          >
            <Baby className="w-3.5 h-3.5 text-sky-500" />
            <span>+ Child</span>
          </button>

          <button
            type="button"
            onClick={handleAddParent}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-background hover:bg-muted text-foreground border border-border transition-colors cursor-pointer shadow-2xs"
            title="Add elderly parent or in-law"
          >
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            <span>+ Parent</span>
          </button>

          <button
            type="button"
            onClick={handleAddGeneric}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-background hover:bg-muted text-foreground border border-border transition-colors cursor-pointer shadow-2xs"
            title="Add other dependent family member"
          >
            <Plus className="w-3.5 h-3.5 text-blue-500" />
            <span>+ Other</span>
          </button>
        </div>
      </div>

      {/* Dependents Summary Bar */}
      {dependents.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-foreground">
              {dependents.length} Default Dependent{dependents.length > 1 ? 's' : ''} Configured
            </span>
            {childCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                <GraduationCap className="w-3 h-3" />
                {childCount} Child{childCount > 1 ? 'ren' : ''} (Education Horizon)
              </span>
            )}
            {parentCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Heart className="w-3 h-3" />
                {parentCount} Parent{parentCount > 1 ? 's' : ''} (Care Horizon)
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleClearAll}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Empty State */}
      {dependents.length === 0 && (
        <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card/60 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h4 className="text-sm font-black text-foreground">No Default Dependents Added</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If you support family members (spouse, children, or parents), add them here so they
              are automatically included whenever you calculate retirement corpus needs.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleAddSpouse}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-xs"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Add Spouse</span>
            </button>
            <button
              type="button"
              onClick={handleAddChild}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-xs"
            >
              <Baby className="w-3.5 h-3.5" />
              <span>Add Child</span>
            </button>
            <button
              type="button"
              onClick={handleAddParent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-xs"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Add Parent</span>
            </button>
          </div>
        </div>
      )}

      {/* Dependents Cards List */}
      {dependents.length > 0 && (
        <div className="space-y-4">
          {dependents.map((dep, idx) => {
            const isChild = dep.relationship === 'child'
            const isParent = dep.relationship === 'parent'
            const isSpouse = dep.relationship === 'spouse'

            return (
              <div
                key={dep.id || idx}
                className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4 transition-all hover:border-blue-300 dark:hover:border-blue-800"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/80">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shadow-2xs',
                        isChild
                          ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                          : isParent
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : isSpouse
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {isChild ? (
                        <Baby className="w-4 h-4" />
                      ) : isParent ? (
                        <Shield className="w-4 h-4" />
                      ) : isSpouse ? (
                        <Heart className="w-4 h-4" />
                      ) : (
                        <Users className="w-4 h-4" />
                      )}
                    </span>

                    <div>
                      <h4 className="text-sm font-black text-foreground">
                        {dep.label || `Dependent #${idx + 1}`}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="capitalize">{dep.relationship}</span>
                        <span>·</span>
                        <span>Age {dep.age}</span>
                        {dep.supportUntilAge && (
                          <>
                            <span>·</span>
                            <span>Support until {dep.supportUntilAge}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer"
                    title={`Remove ${dep.label || 'dependent'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Input Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name / Label */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Name / Label</label>
                    <input
                      type="text"
                      value={dep.label}
                      onChange={(e) => handleUpdate(idx, { label: e.target.value })}
                      placeholder={
                        isSpouse ? 'Spouse Name' : isChild ? 'Child Name' : 'Parent Name'
                      }
                      className="w-full h-10 border border-border rounded-xl px-3 text-sm bg-background text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition-all"
                    />
                  </div>

                  {/* Relationship */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Relationship</label>
                    <div className="relative">
                      <select
                        value={dep.relationship}
                        onChange={(e) =>
                          handleUpdate(idx, {
                            relationship: e.target.value as Relationship,
                          })
                        }
                        className="w-full h-10 appearance-none border border-border rounded-xl pl-3 pr-9 text-sm font-medium bg-background text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition-all cursor-pointer"
                      >
                        {RELATIONSHIP_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Current Age */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Current Age (Years)</label>
                    <input
                      type="number"
                      min={0}
                      max={120}
                      value={dep.age}
                      onChange={(e) =>
                        handleUpdate(idx, {
                          age: Math.max(0, Math.min(120, parseInt(e.target.value, 10) || 0)),
                        })
                      }
                      className="w-full h-10 border border-border rounded-xl px-3 text-sm bg-background text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition-all"
                    />
                  </div>

                  {/* Support Until Age */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground">
                        Support Until Age (Optional)
                      </label>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {isChild ? 'Default: 25 yrs' : 'Leave empty for lifelong'}
                      </span>
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={dep.supportUntilAge ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? undefined : parseInt(e.target.value, 10)
                        handleUpdate(idx, {
                          supportUntilAge:
                            val !== undefined ? Math.max(1, Math.min(120, val)) : undefined,
                        })
                      }}
                      placeholder={isChild ? 'e.g. 25 (independence)' : 'Lifelong if empty'}
                      className="w-full h-10 border border-border rounded-xl px-3 text-sm bg-background text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                {/* Checkboxes Row */}
                <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={dep.financiallyDependent}
                      onChange={(e) =>
                        handleUpdate(idx, { financiallyDependent: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-blue-600 border-border focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-foreground">
                      Financially Dependent (relies on your corpus for living costs)
                    </span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={dep.hasHealthInsurance}
                      onChange={(e) => handleUpdate(idx, { hasHealthInsurance: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 border-border focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-foreground">
                      Covered by Health Insurance
                    </span>
                  </label>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
