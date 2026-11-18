import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useScenarioStore } from '@/store/useScenarioStore'
import { StepHeader, FieldGroup } from '@/components/wizard/StepHeader'
import type { HouseholdMember, Relationship } from '@/domain/models/household'

const RELATIONSHIPS: { value: Relationship; label: string }[] = [
  { value: 'self', label: 'Self' },
  { value: 'spouse', label: 'Spouse / Partner' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'other', label: 'Other' },
]

function genId() {
  return Math.random().toString(36).slice(2, 10)
}

export function StepHousehold() {
  const { members, addMember, updateMember, removeMember, nextStep } = useScenarioStore()
  const [adding, setAdding] = useState(false)
  const [newMember, setNewMember] = useState<Partial<HouseholdMember>>({
    label: '',
    relationship: 'spouse',
    age: 30,
    financiallyDependent: false,
    hasHealthInsurance: false,
  })

  function handleAdd() {
    if (!newMember.label?.trim()) return
    addMember({
      id: genId(),
      label: newMember.label!,
      relationship: newMember.relationship ?? 'other',
      age: newMember.age ?? 30,
      financiallyDependent: newMember.financiallyDependent ?? false,
      supportUntilAge: newMember.supportUntilAge,
      hasHealthInsurance: newMember.hasHealthInsurance ?? false,
    })
    setNewMember({ label: '', relationship: 'spouse', age: 30, financiallyDependent: false, hasHealthInsurance: false })
    setAdding(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <StepHeader
        title="Household Members"
        subtitle="Add everyone whose expenses are included in this plan. The first entry (Self) is added automatically."
        onSkip={() => nextStep()}
        skipLabel="Just me — skip"
      />

      <div className="space-y-3">
        {members.map(member => (
          <div
            key={member.id}
            className="border rounded-lg p-4 bg-card space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">{member.label}</p>
                <p className="text-xs text-muted-foreground capitalize">{member.relationship} · Age {member.age}</p>
              </div>
              {member.id !== 'self' && (
                <button
                  type="button"
                  onClick={() => removeMember(member.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  aria-label={`Remove ${member.label}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Name/Label</label>
                <input
                  type="text"
                  value={member.label}
                  disabled={member.id === 'self'}
                  onChange={e => updateMember(member.id, { label: e.target.value })}
                  className="w-full border rounded px-2 py-1 text-sm mt-1 disabled:bg-muted"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Relationship</label>
                <select
                  value={member.relationship}
                  disabled={member.id === 'self'}
                  onChange={e => updateMember(member.id, { relationship: e.target.value as Relationship })}
                  className="w-full border rounded px-2 py-1 text-sm mt-1 disabled:bg-muted"
                >
                  {RELATIONSHIPS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Age</label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={member.age}
                  onChange={e => updateMember(member.id, { age: Number(e.target.value) })}
                  className="w-full border rounded px-2 py-1 text-sm mt-1"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-muted-foreground">Dependent?</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={member.financiallyDependent}
                    disabled={member.id === 'self'}
                    onChange={e => updateMember(member.id, { financiallyDependent: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-xs">Financially dependent</span>
                </label>
                {member.financiallyDependent && (
                  <div>
                    <label className="text-xs text-muted-foreground">Support until age</label>
                    <input
                      type="number"
                      min={member.age}
                      max={120}
                      value={member.supportUntilAge ?? ''}
                      placeholder="e.g. 25"
                      onChange={e => updateMember(member.id, { supportUntilAge: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full border rounded px-2 py-1 text-sm mt-1"
                    />
                  </div>
                )}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={member.hasHealthInsurance}
                onChange={e => updateMember(member.id, { hasHealthInsurance: e.target.checked })}
                className="w-4 h-4"
              />
              Has health insurance coverage
            </label>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="border-2 border-dashed border-primary/40 rounded-lg p-4 space-y-3 bg-primary/5">
          <p className="text-sm font-medium">New Member</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <FieldGroup label="Name / Label" htmlFor="new-label">
              <input
                id="new-label"
                type="text"
                value={newMember.label}
                onChange={e => setNewMember(p => ({ ...p, label: e.target.value }))}
                placeholder="e.g. Spouse"
                className="w-full border rounded px-2 py-1.5 text-sm"
                autoFocus
              />
            </FieldGroup>
            <FieldGroup label="Relationship" htmlFor="new-rel">
              <select
                id="new-rel"
                value={newMember.relationship}
                onChange={e => setNewMember(p => ({ ...p, relationship: e.target.value as Relationship }))}
                className="w-full border rounded px-2 py-1.5 text-sm"
              >
                {RELATIONSHIPS.filter(r => r.value !== 'self').map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </FieldGroup>
            <FieldGroup label="Age" htmlFor="new-age">
              <input
                id="new-age"
                type="number"
                min={0}
                max={120}
                value={newMember.age}
                onChange={e => setNewMember(p => ({ ...p, age: Number(e.target.value) }))}
                className="w-full border rounded px-2 py-1.5 text-sm"
              />
            </FieldGroup>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={newMember.financiallyDependent}
              onChange={e => setNewMember(p => ({ ...p, financiallyDependent: e.target.checked }))}
              className="w-4 h-4"
            />
            Financially dependent on this plan
          </label>
          {newMember.financiallyDependent && (
            <FieldGroup label="Support until age" htmlFor="new-support-age" help="Leave blank if lifelong.">
              <input
                id="new-support-age"
                type="number"
                min={0}
                max={120}
                value={newMember.supportUntilAge ?? ''}
                placeholder="e.g. 25"
                onChange={e => setNewMember(p => ({ ...p, supportUntilAge: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full border rounded px-2 py-1.5 text-sm max-w-[150px]"
              />
            </FieldGroup>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newMember.label?.trim()}
              className="px-4 py-1.5 bg-primary text-primary-foreground rounded text-sm font-medium disabled:opacity-40"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="px-4 py-1.5 border rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium py-2"
        >
          <Plus className="w-4 h-4" />
          Add household member
        </button>
      )}
    </div>
  )
}
