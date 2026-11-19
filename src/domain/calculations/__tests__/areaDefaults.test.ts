import { describe, it, expect } from 'vitest'
import { buildCategoriesForProfile, AREA_MULTIPLIERS } from '../areaDefaults'
import type { HouseholdMember } from '@/domain/models/household'

describe('Area & Lifestyle Defaults', () => {
  it('calibrates higher baseline costs for metro than village', () => {
    const villageCategories = buildCategoriesForProfile('village', 'comfortable')
    const metroCategories = buildCategoriesForProfile('tier1_metro', 'comfortable')

    const villageHousing = villageCategories.find(c => c.id === 'housing')
    const metroHousing = metroCategories.find(c => c.id === 'housing')

    const villageElectricity = villageHousing?.items.find(i => i.name === 'Electricity')?.amount ?? 0
    const metroElectricity = metroHousing?.items.find(i => i.name === 'Electricity')?.amount ?? 0

    expect(metroElectricity).toBeGreaterThan(villageElectricity)
  })

  it('sets discretionary expenses to 0 under bare_minimum lifestyle', () => {
    const bareCategories = buildCategoriesForProfile('small_town', 'bare_minimum')
    const personalCat = bareCategories.find(c => c.id === 'personal')

    // Discretionary items like clothing or travel should be 0
    const travel = personalCat?.items.find(i => i.name.includes('Travel'))
    expect(travel?.amount).toBe(0)
    // Essential items like groceries or electricity should remain positive
    const foodCat = bareCategories.find(c => c.id === 'food')
    const groceries = foodCat?.items.find(i => i.name.includes('Groceries'))
    expect(groceries?.amount).toBeGreaterThan(0)
  })

  it('scales expenses higher under luxury lifestyle than comfortable', () => {
    const comfortableCategories = buildCategoriesForProfile('small_town', 'comfortable')
    const luxuryCategories = buildCategoriesForProfile('small_town', 'luxury')

    const comfPersonal = comfortableCategories.find(c => c.id === 'personal')?.items.find(i => i.name.includes('Travel'))?.amount ?? 0
    const luxPersonal = luxuryCategories.find(c => c.id === 'personal')?.items.find(i => i.name.includes('Travel'))?.amount ?? 0

    expect(luxPersonal).toBeGreaterThan(comfPersonal)
  })

  it('preserves all category and item fields regardless of lifestyle scenario', () => {
    const bareCategories = buildCategoriesForProfile('small_town', 'bare_minimum')
    const comfortableCategories = buildCategoriesForProfile('small_town', 'comfortable')
    const luxuryCategories = buildCategoriesForProfile('small_town', 'luxury')

    expect(bareCategories.length).toBe(comfortableCategories.length)
    expect(luxuryCategories.length).toBe(comfortableCategories.length)

    // Verify item counts match across all categories
    for (let i = 0; i < comfortableCategories.length; i++) {
      expect(bareCategories[i].items.length).toBe(comfortableCategories[i].items.length)
      expect(luxuryCategories[i].items.length).toBe(comfortableCategories[i].items.length)
    }
  })

  it('provides sensible multipliers across area types', () => {
    expect(AREA_MULTIPLIERS.village.baseMultiplier).toBeLessThan(AREA_MULTIPLIERS.small_town.baseMultiplier)
    expect(AREA_MULTIPLIERS.small_town.baseMultiplier).toBeLessThan(AREA_MULTIPLIERS.city.baseMultiplier)
    expect(AREA_MULTIPLIERS.city.baseMultiplier).toBeLessThan(AREA_MULTIPLIERS.tier1_metro.baseMultiplier)
  })

  it('scales household expenses realistically (non-linear) with additional dependents', () => {
    const single = buildCategoriesForProfile('small_town', 'comfortable', 1)
    const threePeople = buildCategoriesForProfile('small_town', 'comfortable', 3)

    const singleFood = single.find(c => c.id === 'food')?.items.find(i => i.name.includes('Groceries'))?.amount ?? 0
    const threeFood = threePeople.find(c => c.id === 'food')?.items.find(i => i.name.includes('Groceries'))?.amount ?? 0

    expect(threeFood).toBeGreaterThan(singleFood)
    // Non-linear: 3 people should be less than 3x single person cost
    expect(threeFood).toBeLessThan(singleFood * 3)
  })

  it('activates child education defaults with start and end years when child dependent is added', () => {
    const membersWithChild: HouseholdMember[] = [
      { id: 'self', label: 'Self', relationship: 'self', age: 30, financiallyDependent: true, hasHealthInsurance: true },
      { id: 'c1', label: 'Child 1', relationship: 'child', age: 2, financiallyDependent: true, hasHealthInsurance: false },
    ]

    const categories = buildCategoriesForProfile('small_town', 'comfortable', membersWithChild)
    const familyCat = categories.find(c => c.id === 'family')
    const schoolFees = familyCat?.items.find(i => i.name.includes('School'))
    const collegeFees = familyCat?.items.find(i => i.name.includes('College') || i.name.includes('Higher'))

    expect(schoolFees?.amount).toBeGreaterThan(0)
    // Child is 2 years old -> school starts in 5 - 2 = 3 years
    expect(schoolFees?.startYear).toBe(3)
    expect(schoolFees?.endYear).toBe(14)

    expect(collegeFees?.amount).toBeGreaterThan(0)
    // College starts in 17 - 2 = 15 years
    expect(collegeFees?.startYear).toBe(15)
  })

  it('activates parental support defaults when parent dependent is added', () => {
    const membersWithParent: HouseholdMember[] = [
      { id: 'self', label: 'Self', relationship: 'self', age: 30, financiallyDependent: true, hasHealthInsurance: true },
      { id: 'p1', label: 'Mother', relationship: 'parent', age: 60, financiallyDependent: true, supportUntilAge: 85, hasHealthInsurance: false },
    ]

    const categories = buildCategoriesForProfile('small_town', 'comfortable', membersWithParent)
    const familyCat = categories.find(c => c.id === 'family')
    const parentalSupport = familyCat?.items.find(i => i.name.includes('Elderly Parents'))

    expect(parentalSupport?.amount).toBeGreaterThan(0)
    expect(parentalSupport?.startYear).toBe(1)
    // 85 - 60 = 25 years
    expect(parentalSupport?.endYear).toBe(25)
  })

  it('keeps child/parent specific expenses at 0 when no such dependents exist', () => {
    const singleSelf: HouseholdMember[] = [
      { id: 'self', label: 'Self', relationship: 'self', age: 30, financiallyDependent: true, hasHealthInsurance: true },
    ]

    const categories = buildCategoriesForProfile('small_town', 'comfortable', singleSelf)
    const familyCat = categories.find(c => c.id === 'family')
    const schoolFees = familyCat?.items.find(i => i.name.includes('School'))
    const parentalSupport = familyCat?.items.find(i => i.name.includes('Elderly Parents'))

    expect(schoolFees?.amount).toBe(0)
    expect(parentalSupport?.amount).toBe(0)
  })
})
