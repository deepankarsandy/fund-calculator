import { useScenarioStore } from '@/store/useScenarioStore'
import { StepHeader, FieldGroup } from '@/components/wizard/StepHeader'
import { formatPercent } from '@/lib/format'

const COUNTRIES = ['India', 'Other']
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP']

export function StepProfile() {
  const { profile, setProfile } = useScenarioStore()
  const planningYears = profile.targetAge - profile.currentAge
  const ageError = profile.targetAge <= profile.currentAge ? 'Target age must be greater than current age' : ''

  return (
    <div className="space-y-6 max-w-2xl">
      <StepHeader
        title="Your Profile"
        subtitle="Tell us the basics — your age, planning horizon, and lifestyle preference. These drive everything else."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FieldGroup
          label="Country"
          htmlFor="country"
          help="The country where you plan to spend your retirement."
        >
          <select
            id="country"
            value={profile.country}
            onChange={e => setProfile({ country: e.target.value })}
            className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {COUNTRIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </FieldGroup>

        <FieldGroup
          label="Currency"
          htmlFor="currency"
          help="All amounts will be shown in this currency."
        >
          <select
            id="currency"
            value={profile.currency}
            onChange={e => setProfile({ currency: e.target.value })}
            className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </FieldGroup>

        <FieldGroup
          label="State / Region"
          htmlFor="region"
          help="Optional. Used for context — no automatic cost adjustments."
        >
          <input
            id="region"
            type="text"
            value={profile.region}
            onChange={e => setProfile({ region: e.target.value })}
            placeholder="e.g. Odisha"
            className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </FieldGroup>

        <FieldGroup
          label="City"
          htmlFor="city"
          help="Optional. Helps you remember which scenario this is."
        >
          <input
            id="city"
            type="text"
            value={profile.city}
            onChange={e => setProfile({ city: e.target.value })}
            placeholder="e.g. Bhubaneswar"
            className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </FieldGroup>

        <FieldGroup
          label="Your Current Age"
          htmlFor="currentAge"
          help="Your age today. Used to calculate the planning horizon."
        >
          <input
            id="currentAge"
            type="number"
            min={1}
            max={119}
            value={profile.currentAge}
            onChange={e => setProfile({ currentAge: Number(e.target.value) })}
            className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </FieldGroup>

        <FieldGroup
          label="Target Age"
          htmlFor="targetAge"
          help="The age you want your corpus to last until. We suggest testing 90–100."
          error={ageError}
        >
          <input
            id="targetAge"
            type="number"
            min={profile.currentAge + 1}
            max={120}
            value={profile.targetAge}
            onChange={e => setProfile({ targetAge: Number(e.target.value) })}
            className={`w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary ${ageError ? 'border-destructive' : ''}`}
          />
        </FieldGroup>

        <FieldGroup
          label="Household Size"
          htmlFor="householdSize"
          help="Total number of people whose expenses are covered by this plan."
        >
          <input
            id="householdSize"
            type="number"
            min={1}
            max={20}
            value={profile.householdSize}
            onChange={e => setProfile({ householdSize: Number(e.target.value) })}
            className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </FieldGroup>

        {planningYears > 0 && (
          <div className="sm:col-span-1 flex items-end">
            <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 w-full">
              <p className="text-xs text-muted-foreground">Planning duration</p>
              <p className="text-lg font-semibold text-primary">
                {planningYears} years
              </p>
              <p className="text-xs text-muted-foreground">
                Age {profile.currentAge} → {profile.targetAge}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Lifestyle scenario */}
      <div>
        <FieldGroup
          label="Lifestyle Scenario"
          help="Choose which expense items will count in your plan. You can change individual items in the Expenses step."
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
            {[
              {
                value: 'bare_minimum' as const,
                title: 'Bare Minimum',
                desc: 'Only essential expenses — food, housing, basic healthcare.',
              },
              {
                value: 'comfortable' as const,
                title: 'Comfortable',
                desc: 'Includes travel, hobbies, leisure, and better healthcare.',
              },
              {
                value: 'custom' as const,
                title: 'Custom',
                desc: 'You control which expenses are essential vs discretionary.',
              },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setProfile({ lifestyleScenario: opt.value })}
                className={`text-left p-3 rounded-lg border-2 transition-all ${
                  profile.lifestyleScenario === opt.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <p className="text-sm font-semibold">{opt.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
              </button>
            ))}
          </div>
        </FieldGroup>
      </div>

      {profile.targetAge < 85 && profile.targetAge > profile.currentAge && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          💡 Consider testing to age 90–100. Life expectancy is rising and a longer horizon gives a more conservative, safer estimate.
        </div>
      )}
    </div>
  )
}
