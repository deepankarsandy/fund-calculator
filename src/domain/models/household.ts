export type Relationship = 'self' | 'spouse' | 'parent' | 'child' | 'sibling' | 'other'

export interface HouseholdMember {
  id: string
  label: string
  relationship: Relationship
  age: number
  financiallyDependent: boolean
  supportUntilAge?: number
  hasHealthInsurance: boolean
}
