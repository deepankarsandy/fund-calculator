import { describe, it, expect } from 'vitest'
import { buildCategoriesForProfile, AREA_MULTIPLIERS } from '../areaDefaults'

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
  })

  it('provides sensible multipliers across area types', () => {
    expect(AREA_MULTIPLIERS.village.baseMultiplier).toBeLessThan(AREA_MULTIPLIERS.small_town.baseMultiplier)
    expect(AREA_MULTIPLIERS.small_town.baseMultiplier).toBeLessThan(AREA_MULTIPLIERS.city.baseMultiplier)
    expect(AREA_MULTIPLIERS.city.baseMultiplier).toBeLessThan(AREA_MULTIPLIERS.tier1_metro.baseMultiplier)
  })
})
