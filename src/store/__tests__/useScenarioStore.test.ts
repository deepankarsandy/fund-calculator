import { describe, it, expect, beforeEach } from 'vitest'

const memoryStore = new Map<string, string>()

const mockLocalStorage = {
  getItem: (key: string) => memoryStore.get(key) ?? null,
  setItem: (key: string, value: string) => memoryStore.set(key, value),
  removeItem: (key: string) => memoryStore.delete(key),
  clear: () => memoryStore.clear(),
}

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true,
})

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
    configurable: true,
  })
}

// Dynamically import useScenarioStore after mockLocalStorage is attached
const { useScenarioStore } = await import('@/store/useScenarioStore')
const { DEFAULT_USER_PROFILE } = await import('@/domain/models/userProfile')
type UserProfile = import('@/domain/models/userProfile').UserProfile
type HouseholdMember = import('@/domain/models/household').HouseholdMember

describe('useScenarioStore - applyProfileDefaults', () => {
  beforeEach(() => {
    memoryStore.clear()
    useScenarioStore.getState().reset()
  })

  it('updates specific profile values (retirement age, calc type, inflation, income)', () => {
    const customProfile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      name: 'Rohan Sharma',
      currentAge: 35,
      retirementAge: 55,
      targetAge: 90,
      monthlyIncome: 180000,
      annualIncomeGrowthRate: 8.5,
      existingInvestableCorpus: 2500000,
      inflationMode: 'sector',
      overallInflationRate: 7.5,
      expectedDebtReturn: 8.0,
      sectorInflationRates: {
        ...DEFAULT_USER_PROFILE.sectorInflationRates,
        housing: 6.5,
        technology: 4.0,
      },
      isConfigured: true,
    }

    useScenarioStore.getState().applyProfileDefaults(customProfile)
    const state = useScenarioStore.getState()

    // Profile fields
    expect(state.profile.currentAge).toBe(35)
    expect(state.profile.targetAge).toBe(90)

    // Assets fields
    expect(state.assets.incomeEndAge).toBe(55) // retirement age
    expect(state.assets.monthlyIncome).toBe(180000)
    expect(state.assets.incomeGrowthRate).toBe(0.085)
    expect(state.assets.existingInvestableCorpus).toBe(2500000)

    // Assumptions fields
    expect(state.assumptions.globalInflationRate).toBe(0.075)
    expect(state.assumptions.inflationMode).toBe('category') // 'sector' maps to 'category'
    expect(state.assumptions.annualInvestmentReturn).toBe(0.08)

    // Sector inflation rate applied to categories
    const housingCat = state.categories.find((c) => c.id === 'housing')
    expect(housingCat?.defaultInflationRate).toBe(0.065)

    const techCat = state.categories.find((c) => c.id === 'technology')
    expect(techCat?.defaultInflationRate).toBe(0.04)
  })

  it('preserves user entered dependents in household members', () => {
    // Setup household with self, spouse, and child
    const initialMembers: HouseholdMember[] = [
      {
        id: 'self',
        label: 'Self (Old)',
        relationship: 'self',
        age: 30,
        financiallyDependent: true,
        hasHealthInsurance: true,
      },
      {
        id: 'spouse-1',
        label: 'Spouse Name',
        relationship: 'spouse',
        age: 28,
        financiallyDependent: true,
        hasHealthInsurance: true,
      },
      {
        id: 'child-1',
        label: 'First Child',
        relationship: 'child',
        age: 4,
        financiallyDependent: true,
        supportUntilAge: 25,
        hasHealthInsurance: false,
      },
    ]

    useScenarioStore.setState({ members: initialMembers })

    const customProfile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      name: 'Priya',
      currentAge: 32,
      retirementAge: 58,
      isConfigured: true,
    }

    useScenarioStore.getState().applyProfileDefaults(customProfile)
    const updatedMembers = useScenarioStore.getState().members

    // Dependents must not be removed!
    expect(updatedMembers).toHaveLength(3)

    const selfMember = updatedMembers.find((m) => m.id === 'self')
    expect(selfMember?.age).toBe(32)
    expect(selfMember?.label).toBe('Priya (Self)')
    expect(selfMember?.hasHealthInsurance).toBe(true) // Preserved

    const spouseMember = updatedMembers.find((m) => m.id === 'spouse-1')
    expect(spouseMember).toBeDefined()
    expect(spouseMember?.label).toBe('Spouse Name')
    expect(spouseMember?.age).toBe(28)

    const childMember = updatedMembers.find((m) => m.id === 'child-1')
    expect(childMember).toBeDefined()
    expect(childMember?.label).toBe('First Child')
    expect(childMember?.age).toBe(4)
    expect(childMember?.supportUntilAge).toBe(25)
  })

  it('preserves user entered expense amounts such as mobile recharge and custom items', () => {
    const currentCategories = useScenarioStore.getState().categories

    // Customize utility / technology expense items, e.g. mobile recharge
    const modifiedCategories = currentCategories.map((cat) => {
      if (cat.id === 'technology') {
        return {
          ...cat,
          items: cat.items.map((item) => {
            if (item.name.toLowerCase().includes('mobile') || item.id.includes('mobile')) {
              return { ...item, amount: 1499 }
            }
            return item
          }),
        }
      }
      if (cat.id === 'food') {
        return {
          ...cat,
          items: [
            ...cat.items,
            {
              id: 'custom-organic-food',
              categoryId: 'food' as const,
              name: 'Organic Farm Basket',
              amount: 8000,
              frequency: 'monthly' as const,
              essential: false,
              appliesTo: 'household' as const,
              startYear: 1,
              type: 'recurring' as const,
              notes: 'Special dietary basket',
              skipped: false,
            },
          ],
        }
      }
      return cat
    })

    useScenarioStore.setState({ categories: modifiedCategories })

    const customProfile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      retirementAge: 62,
      currentAge: 33,
      overallInflationRate: 6.8,
      isConfigured: true,
    }

    useScenarioStore.getState().applyProfileDefaults(customProfile)
    const resultCategories = useScenarioStore.getState().categories

    // Check technology / mobile recharge amount
    const techCategory = resultCategories.find((c) => c.id === 'technology')
    const mobileItem = techCategory?.items.find(
      (item) => item.name.toLowerCase().includes('mobile') || item.id.includes('mobile')
    )
    expect(mobileItem?.amount).toBe(1499) // NOT reset to default!

    // Check custom food item
    const foodCategory = resultCategories.find((c) => c.id === 'food')
    const customFoodItem = foodCategory?.items.find((item) => item.id === 'custom-organic-food')
    expect(customFoodItem).toBeDefined()
    expect(customFoodItem?.amount).toBe(8000)
    expect(customFoodItem?.notes).toBe('Special dietary basket')
  })

  it('preserves other assets data like lump sums and other income streams while auto-filling NPS & PF', () => {
    useScenarioStore.setState({
      assets: {
        ...useScenarioStore.getState().assets,
        monthlyIncome: 80000,
        otherIncome: [
          {
            id: 'rental-income',
            label: 'Commercial Property Rent',
            annualAmount: 360000,
            startYear: 1,
            inflationLinked: true,
          },
        ],
        futureContributions: [
          {
            id: 'inheritance',
            label: 'Ancestral Property Sale',
            amount: 5000000,
            year: 10,
          },
        ],
      },
    })

    const customProfile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      monthlyIncome: 120000,
      retirementAge: 58,
      monthlyNpsInvestment: 5000,
      monthlyPfInvestment: 10000,
      isConfigured: true,
    }

    useScenarioStore.getState().applyProfileDefaults(customProfile)
    const updatedAssets = useScenarioStore.getState().assets

    expect(updatedAssets.monthlyIncome).toBe(120000)
    expect(updatedAssets.incomeEndAge).toBe(58)

    // Preserved custom income stream
    const rentItem = updatedAssets.otherIncome.find((i) => i.id === 'rental-income')
    expect(rentItem).toBeDefined()
    expect(rentItem?.label).toBe('Commercial Property Rent')

    // Auto-filled NPS pension based on Indian PFRDA rules (40% annuity)
    const npsItem = updatedAssets.otherIncome.find(
      (i) => i.id === 'nps_pension' || i.incomeType === 'nps_annuity'
    )
    expect(npsItem).toBeDefined()
    expect(npsItem?.annualAmount).toBeGreaterThan(0)
    expect(npsItem?.startYear).toBe(29) // 58 - 30 + 1 = 29

    // Preserved custom lump sum
    const inheritanceItem = updatedAssets.futureContributions.find((l) => l.id === 'inheritance')
    expect(inheritanceItem).toBeDefined()
    expect(inheritanceItem?.amount).toBe(5000000)

    // Auto-filled EPF maturity based on Indian EPFO 8.25% rule
    const pfItem = updatedAssets.futureContributions.find((l) => l.id === 'pf_maturity')
    expect(pfItem).toBeDefined()
    expect(pfItem?.amount).toBeGreaterThan(10000000)
    expect(pfItem?.year).toBe(28) // working years = 58 - 30 = 28
  })

  it('preserves existing custom income streams strictly when NPS and PF investments are 0', () => {
    useScenarioStore.setState({
      assets: {
        ...useScenarioStore.getState().assets,
        otherIncome: [
          {
            id: 'rental-income',
            label: 'Commercial Property Rent',
            annualAmount: 360000,
            startYear: 1,
            inflationLinked: true,
          },
        ],
        futureContributions: [
          {
            id: 'inheritance',
            label: 'Ancestral Property Sale',
            amount: 5000000,
            year: 10,
          },
        ],
      },
    })

    const customProfile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      monthlyPfInvestment: 0,
      monthlyNpsInvestment: 0,
      isConfigured: true,
    }

    useScenarioStore.getState().applyProfileDefaults(customProfile)
    const updatedAssets = useScenarioStore.getState().assets

    expect(updatedAssets.otherIncome).toHaveLength(1)
    expect(updatedAssets.otherIncome[0].label).toBe('Commercial Property Rent')
    expect(updatedAssets.futureContributions).toHaveLength(1)
    expect(updatedAssets.futureContributions[0].amount).toBe(5000000)
  })
})
