import { Frequency } from '@/domain/models/expense'

export type FieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'radio'
  | 'slider'
  | 'checkbox'
  | 'array'
  | 'expense-categories'

export interface FieldOption {
  label: string
  value: string | number
  description?: string
}

export interface FieldConfig {
  id: string
  label: string
  type: FieldType
  defaultValue: any
  help: string
  options?: FieldOption[]
  min?: number
  max?: number
  step?: number
  prefix?: string
  suffix?: string
  skippable?: boolean
  subFields?: FieldConfig[]
  addButtonText?: string
  placeholder?: string
}

export interface ExpenseSubItemConfig {
  id: string
  name: string
  defaultAmount: number
  frequency: Frequency
  essential: boolean
  everyNYears?: number
  help?: string
  linkedMemberRelationship?: 'child' | 'parent' | 'sibling'
}

export interface ExpenseCategoryConfig {
  id: string
  label: string
  description: string
  defaultInflationRate: number
  parentInput: {
    label: string
    defaultFrequency: Frequency
    help: string
  }
  subItems: ExpenseSubItemConfig[]
}

export interface WizardStepConfig {
  id: number
  key: string
  title: string
  subtitle: string
  skippable: boolean
  skipLabel?: string
  fields: FieldConfig[]
}

export const WIZARD_STEPS_CONFIG: WizardStepConfig[] = [
  {
    id: 1,
    key: 'profile',
    title: 'Profile & Horizon',
    subtitle: 'Basic details to define your time horizon, location, and lifestyle baseline.',
    skippable: false,
    fields: [
      {
        id: 'country',
        label: 'Country',
        type: 'select',
        defaultValue: 'India',
        help: 'The country where you plan to live in retirement. Sets the local currency context.',
        options: [
          { label: 'India', value: 'India' },
          { label: 'United States', value: 'United States' },
          { label: 'United Kingdom', value: 'United Kingdom' },
          { label: 'Other', value: 'Other' },
        ],
      },
      {
        id: 'currency',
        label: 'Currency',
        type: 'select',
        defaultValue: 'INR',
        help: 'Currency used for all cost estimations and output graphs.',
        options: [
          { label: 'INR (₹)', value: 'INR' },
          { label: 'USD ($)', value: 'USD' },
          { label: 'EUR (€)', value: 'EUR' },
          { label: 'GBP (£)', value: 'GBP' },
        ],
      },
      {
        id: 'areaType',
        label: 'Area / Location Type',
        type: 'radio',
        defaultValue: 'small_town',
        help: 'Living expenses vary dramatically across India. Selecting your area automatically calibrates baseline expense defaults.',
        options: [
          {
            label: 'Village / Rural',
            value: 'village',
            description: 'Lowest cost of living (~40-60% of metro costs).',
          },
          {
            label: 'Small Town (Tier 3)',
            value: 'small_town',
            description: 'Moderate costs (e.g. baseline sample from planning guide).',
          },
          {
            label: 'City (Tier 2)',
            value: 'city',
            description: 'State capitals & growing urban centers (~1.6x of small town).',
          },
          {
            label: 'Metro (Tier 1)',
            value: 'tier1_metro',
            description: 'Major metros: Mumbai, Bengaluru, Delhi NCR, Hyderabad (~2.5x).',
          },
        ],
      },
      {
        id: 'region',
        label: 'State / Region (Optional)',
        type: 'text',
        defaultValue: 'Odisha',
        placeholder: 'e.g. Odisha, Karnataka, Maharashtra',
        help: 'Optional geographic context for your reference.',
        skippable: true,
      },
      {
        id: 'city',
        label: 'City / Town (Optional)',
        type: 'text',
        defaultValue: '',
        placeholder: 'e.g. Bhubaneswar, Bengaluru, Pune',
        help: 'Optional city or town name to help distinguish different saved scenarios.',
        skippable: true,
      },
      {
        id: 'currentAge',
        label: 'Current Age',
        type: 'number',
        defaultValue: 30,
        min: 1,
        max: 110,
        suffix: 'years',
        help: 'Your age today. Used as starting baseline (Year 0) for lifetime cashflows.',
      },
      {
        id: 'targetAge',
        label: 'Target Planning Age',
        type: 'number',
        defaultValue: 85,
        min: 2,
        max: 120,
        suffix: 'years',
        help: 'The age up to which you want your corpus to last safely. Planning to age 85–100 protects against longevity risk.',
      },
      {
        id: 'householdSize',
        label: 'Household Size',
        type: 'number',
        defaultValue: 1,
        min: 1,
        max: 20,
        suffix: 'people',
        help: 'Total number of individuals whose living costs are financed by this plan.',
      },
      {
        id: 'lifestyleScenario',
        label: 'Lifestyle Baseline',
        type: 'radio',
        defaultValue: 'comfortable',
        help: 'Bare Minimum covers only survival essentials. Comfortable includes discretionary leisure, travel, and personal hobbies.',
        options: [
          {
            label: 'Bare Minimum',
            value: 'bare_minimum',
            description: 'Essential living only: food, shelter, routine healthcare.',
          },
          {
            label: 'Comfortable',
            value: 'comfortable',
            description: 'Includes leisure, hobbies, outings, travel, and buffer.',
          },
          {
            label: 'Custom',
            value: 'custom',
            description: 'Manually specify essential vs discretionary items.',
          },
        ],
      },
    ],
  },
  {
    id: 2,
    key: 'assets',
    title: 'Income, Savings & Assets',
    subtitle: 'Active salary/business income, retirement age, savings, and other investments.',
    skippable: true,
    skipLabel: 'Skip & treat as retirement from today',
    fields: [
      {
        id: 'monthlyIncome',
        label: 'Current Monthly Take-Home Income',
        type: 'number',
        defaultValue: 0,
        min: 0,
        prefix: '₹',
        placeholder: 'e.g. 75000 (0 if already retired)',
        help: 'Your current net monthly salary or business income. Living expenses are subtracted from this, and the surplus is automatically invested into your corpus.',
        skippable: true,
      },
      {
        id: 'incomeEndAge',
        label: 'Income Continues Until Age (Retirement Age)',
        type: 'number',
        defaultValue: 60,
        min: 18,
        max: 100,
        suffix: 'years',
        help: 'The age up to which you expect to earn active income before retiring. When income stops or falls below expenses, withdrawals begin.',
        skippable: true,
      },
      {
        id: 'incomeGrowthRate',
        label: 'Expected Annual Income Increment (%)',
        type: 'slider',
        defaultValue: 0.07,
        min: 0,
        max: 0.25,
        step: 0.005,
        suffix: '%',
        help: 'Estimated yearly percentage increase/hike in your earned income (e.g. 7–10% typical career appraisal rate in India).',
        skippable: true,
      },
      {
        id: 'existingInvestableCorpus',
        label: 'Existing Investable Corpus Today',
        type: 'number',
        defaultValue: 0,
        min: 0,
        prefix: '₹',
        help: 'Mutual funds, FDs, EPF, PPF, NPS, and liquid investments you already hold today. Do not count your primary residence.',
      },
      {
        id: 'otherIncome',
        label: 'Regular Post-Retirement Income',
        type: 'array',
        addButtonText: '+ Add Income Source',
        defaultValue: [],
        help: 'Guaranteed or reliable income like employer pension, annuity, or rental property income.',
        subFields: [
          {
            id: 'label',
            label: 'Description',
            type: 'text',
            defaultValue: 'Pension',
            help: 'e.g. Government pension, Commercial rental, Annuity.',
          },
          {
            id: 'annualAmount',
            label: 'Annual Amount',
            type: 'number',
            defaultValue: 120000,
            prefix: '₹',
            min: 0,
            help: 'Total yearly income received from this source.',
          },
          {
            id: 'startYear',
            label: 'Starting in Year',
            type: 'number',
            defaultValue: 1,
            min: 1,
            help: 'Planning year when payments start (1 = immediately upon retirement).',
          },
          {
            id: 'endYear',
            label: 'Ending in Year (Optional)',
            type: 'number',
            defaultValue: undefined,
            min: 1,
            help: 'Leave blank if this income continues for life.',
            skippable: true,
          },
          {
            id: 'inflationLinked',
            label: 'Inflation-linked (Increases yearly)?',
            type: 'checkbox',
            defaultValue: false,
            help: 'Check if this pension or rent increases annually with inflation (e.g. DA-linked pension).',
          },
        ],
      },
      {
        id: 'futureContributions',
        label: 'Future Lump Sums Expected',
        type: 'array',
        addButtonText: '+ Add Lump Sum',
        defaultValue: [],
        help: 'One-off future cash inflows such as EPF maturity, property sale, or inheritance.',
        subFields: [
          {
            id: 'label',
            label: 'Description',
            type: 'text',
            defaultValue: 'EPF Maturity',
            help: 'Description of the lump sum.',
          },
          {
            id: 'amount',
            label: 'Amount Expected',
            type: 'number',
            defaultValue: 500000,
            prefix: '₹',
            min: 0,
            help: 'Estimated cash amount to be received in today\'s or future terms.',
          },
          {
            id: 'year',
            label: 'In Planning Year',
            type: 'number',
            defaultValue: 5,
            min: 1,
            help: 'Which year of the plan this cash inflow arrives.',
          },
        ],
      },
    ],
  },
  {
    id: 3,
    key: 'household',
    title: 'Household Members',
    subtitle: 'Add dependents or family members covered by your financial plan.',
    skippable: true,
    skipLabel: 'Skip (Plan for myself only)',
    fields: [
      {
        id: 'members',
        label: 'Household Members',
        type: 'array',
        addButtonText: '+ Add Member',
        defaultValue: [
          {
            id: 'self',
            label: 'Self',
            relationship: 'self',
            age: 30,
            financiallyDependent: false,
            hasHealthInsurance: false,
          },
        ],
        help: 'Track dependents whose expenses are funded together. You can set support end ages for children or parents.',
        subFields: [
          {
            id: 'label',
            label: 'Name / Label',
            type: 'text',
            defaultValue: 'Member',
            help: 'Nickname or description (e.g. Spouse, Child 1, Parent).',
          },
          {
            id: 'relationship',
            label: 'Relationship',
            type: 'select',
            defaultValue: 'spouse',
            help: 'Relation to primary person.',
            options: [
              { label: 'Self', value: 'self' },
              { label: 'Spouse', value: 'spouse' },
              { label: 'Child', value: 'child' },
              { label: 'Parent', value: 'parent' },
              { label: 'Sibling', value: 'sibling' },
              { label: 'Other', value: 'other' },
            ],
          },
          {
            id: 'age',
            label: 'Current Age',
            type: 'number',
            defaultValue: 30,
            min: 0,
            max: 120,
            help: 'Current age of this household member.',
          },
          {
            id: 'financiallyDependent',
            label: 'Financially Dependent?',
            type: 'checkbox',
            defaultValue: true,
            help: 'Check if this person relies on your corpus for their living costs.',
          },
          {
            id: 'supportUntilAge',
            label: 'Support Until Age (Optional)',
            type: 'number',
            defaultValue: 25,
            min: 1,
            max: 120,
            help: 'Age at which financial support ends (e.g. when a child becomes independent at 25). Leave blank if lifelong.',
            skippable: true,
          },
          {
            id: 'hasHealthInsurance',
            label: 'Covered by Health Insurance?',
            type: 'checkbox',
            defaultValue: false,
            help: 'Whether this person has an active medical insurance cover.',
          },
        ],
      },
    ],
  },
  {
    id: 4,
    key: 'expenses',
    title: 'Living Expenses',
    subtitle: 'Fill whole category amounts or itemise line items. Skip any that do not apply.',
    skippable: true,
    skipLabel: 'Skip & use sample estimates',
    fields: [
      {
        id: 'categories',
        label: 'Expense Categories',
        type: 'expense-categories',
        defaultValue: [],
        help: 'Categories A through K. You can either enter a lump-sum amount for the whole category or enter individual line items.',
      },
    ],
  },
  {
    id: 5,
    key: 'assumptions',
    title: 'Financial Assumptions',
    subtitle: 'Inflation and investment return assumptions driving your required corpus.',
    skippable: true,
    skipLabel: 'Use standard defaults (5% infl, 7% return)',
    fields: [
      {
        id: 'globalInflationRate',
        label: 'Annual Inflation Rate',
        type: 'slider',
        defaultValue: 0.05,
        min: 0,
        max: 0.15,
        step: 0.005,
        suffix: '%',
        help: 'Expected yearly increase in general living expenses. India historically ranges around 5–6%.',
      },
      {
        id: 'annualInvestmentReturn',
        label: 'Annual Investment Return',
        type: 'slider',
        defaultValue: 0.07,
        min: 0,
        max: 0.20,
        step: 0.005,
        suffix: '%',
        help: 'Expected yearly return from your diversified portfolio. 7–9% is common for balanced equity-debt in India.',
      },
      {
        id: 'returnBasis',
        label: 'Return Type',
        type: 'radio',
        defaultValue: 'net',
        help: 'Net return assumes taxes and fees are already factored in. Gross return allows entering fees & taxes below.',
        options: [
          { label: 'Net (After Taxes & Fees)', value: 'net', description: 'Recommended: simpler & avoids complex tax guesswork.' },
          { label: 'Gross (Before Taxes & Fees)', value: 'gross', description: 'Deducts investment fees and tax drag separately.' },
        ],
      },
      {
        id: 'investmentFeeRate',
        label: 'Investment Fees Rate',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 0.05,
        step: 0.001,
        suffix: '%',
        help: 'Annual fund management or advisory charges (e.g. 0.5% for index funds, 1.5% for active mutual funds).',
      },
      {
        id: 'taxDragRate',
        label: 'Tax Drag Rate',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 0.05,
        step: 0.001,
        suffix: '%',
        help: 'Estimated annual drag from capital gains tax upon withdrawals (e.g. ~1% LTCG impact).',
      },
      {
        id: 'withdrawalTiming',
        label: 'Withdrawal Timing',
        type: 'radio',
        defaultValue: 'end_of_year',
        help: 'End of year is standard for growing annuity estimates. Beginning of year is slightly more conservative.',
        options: [
          { label: 'End of Year', value: 'end_of_year', description: 'Withdrawals occur at period end; standard convention.' },
          { label: 'Beginning of Year', value: 'beginning_of_year', description: 'Withdrawals taken upfront; requires ~1+r higher corpus.' },
        ],
      },
      {
        id: 'safetyMarginPercent',
        label: 'Safety Reserve Margin',
        type: 'slider',
        defaultValue: 0.15,
        min: 0,
        max: 0.50,
        step: 0.05,
        suffix: '%',
        help: 'Extra buffer on top of the calculated corpus to guard against sequence-of-returns or surprise events.',
      },
    ],
  },
  {
    id: 6,
    key: 'results',
    title: 'Corpus Calculation & Projections',
    subtitle: 'Detailed breakdown of your required corpus, cashflows, and sensitivity scenarios.',
    skippable: false,
    fields: [],
  },
]

export const EXPENSE_CATEGORIES_CONFIG: ExpenseCategoryConfig[] = [
  {
    id: 'housing',
    label: 'A. Housing & Property',
    description: 'Rent, property tax, society fees, electricity, home maintenance, and structural repairs.',
    defaultInflationRate: 0.05,
    parentInput: {
      label: 'Total Housing Cost',
      defaultFrequency: 'monthly',
      help: 'If you prefer not to itemize, enter your overall monthly or yearly housing spending here.',
    },
    subItems: [
      { id: 'electricity', name: 'Electricity', defaultAmount: 800, frequency: 'monthly', essential: true, help: 'Average monthly electricity bill.' },
      { id: 'water', name: 'Water Supply / Tanker', defaultAmount: 0, frequency: 'monthly', essential: true, help: 'Municipal water or private tanker charges.' },
      { id: 'cooking_gas', name: 'Cooking Gas / LPG Cylinder', defaultAmount: 1000, frequency: 'monthly', essential: true, help: 'Monthly LPG refill or piped natural gas bill.' },
      { id: 'internet', name: 'Internet / Fiber Broadband', defaultAmount: 700, frequency: 'monthly', essential: true, help: 'Home Wi-Fi broadband connection.' },
      { id: 'rent', name: 'House Rent', defaultAmount: 0, frequency: 'monthly', essential: true, help: 'Monthly rent if living in rented property (₹0 if self-owned).' },
      { id: 'property_tax', name: 'Property Tax', defaultAmount: 0, frequency: 'yearly', essential: true, help: 'Annual municipal property taxes.' },
      { id: 'home_insurance', name: 'Home Insurance', defaultAmount: 0, frequency: 'yearly', essential: true, help: 'Fire, burglary, or structural insurance premiums.' },
      { id: 'society_fees', name: 'Society / Maintenance Charges', defaultAmount: 0, frequency: 'monthly', essential: true, help: 'Gated community or apartment society fees.' },
      { id: 'repairs_maintenance', name: 'Repairs & Upkeep', defaultAmount: 50000, frequency: 'yearly', essential: true, help: 'Plumbing, electrical, periodic painting, and general maintenance.' },
      { id: 'appliance_replacement', name: 'Appliance Replacement Reserve', defaultAmount: 35000, frequency: 'every_n_years', everyNYears: 7, essential: false, help: 'Fridge, washing machine, AC replacement every 5–7 years.' },
      { id: 'domestic_help', name: 'Domestic Help / Maid / Cook', defaultAmount: 0, frequency: 'monthly', essential: false, help: 'Housekeeping, cook, or security staff salaries.' },
    ],
  },
  {
    id: 'food',
    label: 'B. Food & Household Consumables',
    description: 'Groceries, staples, vegetables, dairy, eating out, and cleaning items for the household.',
    defaultInflationRate: 0.05,
    parentInput: {
      label: 'Total Food & Grocery Budget',
      defaultFrequency: 'monthly',
      help: 'Average monthly total spending on all household groceries and food.',
    },
    subItems: [
      { id: 'groceries', name: 'Groceries, Staples & Rice/Wheat', defaultAmount: 5000, frequency: 'monthly', essential: true, help: 'Rice, wheat flour, oil, spices, pulses.' },
      { id: 'vegetables_fruits', name: 'Fresh Vegetables & Fruits', defaultAmount: 0, frequency: 'monthly', essential: true, help: 'Weekly market greens, seasonal vegetables and fruits.' },
      { id: 'fish_meat_dairy', name: 'Milk, Eggs, Fish & Meat', defaultAmount: 0, frequency: 'monthly', essential: true, help: 'Daily milk packets, curd, poultry, fish.' },
      { id: 'eating_out', name: 'Dining Out & Food Delivery', defaultAmount: 0, frequency: 'monthly', essential: false, help: 'Restaurants, Swiggy/Zomato, cafes.' },
      { id: 'cleaning_supplies', name: 'Cleaning & Household Consumables', defaultAmount: 0, frequency: 'monthly', essential: true, help: 'Soaps, detergents, dishwash, garbage bags.' },
      { id: 'toiletries', name: 'Toiletries & Personal Hygiene', defaultAmount: 0, frequency: 'monthly', essential: true, help: 'Toothpaste, shampoo, personal grooming products.' },
    ],
  },
  {
    id: 'utilities',
    label: 'C. Utilities & Digital Services',
    description: 'Mobile phone plans, TV subscriptions, and streaming accounts not listed in Housing.',
    defaultInflationRate: 0.05,
    parentInput: {
      label: 'Total Utilities Bill',
      defaultFrequency: 'monthly',
      help: 'Combined monthly bill for phones and digital subscriptions.',
    },
    subItems: [
      { id: 'mobile_recharge', name: 'Mobile Phone Plans / Recharges', defaultAmount: 500, frequency: 'monthly', essential: true, help: 'Prepaid or postpaid plans for all family phones.' },
      { id: 'cable_dth', name: 'DTH / Cable TV', defaultAmount: 0, frequency: 'monthly', essential: false, help: 'Tata Play, Airtel DTH, local cable TV.' },
      { id: 'ott_subscriptions', name: 'OTT & Streaming Subscriptions', defaultAmount: 0, frequency: 'yearly', essential: false, help: 'Netflix, Amazon Prime, Hotstar, YouTube Premium.' },
    ],
  },
  {
    id: 'transport',
    label: 'D. Transport & Vehicles',
    description: 'Fuel, vehicle maintenance, insurance, public transit, and vehicle replacement reserve.',
    defaultInflationRate: 0.05,
    parentInput: {
      label: 'Total Transport Expense',
      defaultFrequency: 'monthly',
      help: 'Overall monthly transport and commuting expenses.',
    },
    subItems: [
      { id: 'fuel', name: 'Fuel (Petrol, Diesel, CNG, EV)', defaultAmount: 1000, frequency: 'monthly', essential: true, help: 'Daily scooter/car fuel or charging.' },
      { id: 'public_transport', name: 'Public Transit (Bus, Metro, Train)', defaultAmount: 0, frequency: 'monthly', essential: true, help: 'Bus passes, metro cards, local train fares.' },
      { id: 'taxi_rideshare', name: 'Auto, Taxi & Rideshare (Ola/Uber)', defaultAmount: 0, frequency: 'monthly', essential: false, help: 'Occasional cab and auto rides.' },
      { id: 'vehicle_servicing', name: 'Vehicle Servicing & Repairs', defaultAmount: 0, frequency: 'yearly', essential: true, help: 'Periodic oil change, brake pads, mechanical service.' },
      { id: 'vehicle_insurance', name: 'Vehicle Insurance & Road Tax', defaultAmount: 0, frequency: 'yearly', essential: true, help: 'Annual comprehensive motor insurance policy.' },
      { id: 'vehicle_replacement', name: 'Vehicle Replacement Fund', defaultAmount: 100000, frequency: 'every_n_years', everyNYears: 10, essential: false, help: 'Fund to replace a two-wheeler or car every 8–10 years.' },
    ],
  },
  {
    id: 'healthcare',
    label: 'E. Healthcare & Medical Insurance',
    description: 'Medicines, routine doctor consultations, diagnostics, health insurance premiums, and reserves. Note: healthcare inflates at ~7%.',
    defaultInflationRate: 0.07,
    parentInput: {
      label: 'Total Healthcare Budget',
      defaultFrequency: 'yearly',
      help: 'Annual health spending including insurance premiums and routine medicines.',
    },
    subItems: [
      { id: 'general_medicines', name: 'Medicines & Routine Consultations', defaultAmount: 10000, frequency: 'yearly', essential: true, help: 'BP, diabetes, routine prescription medicines and clinic visits.' },
      { id: 'health_insurance', name: 'Health Insurance Premiums', defaultAmount: 15000, frequency: 'yearly', essential: true, help: 'Family floater or individual health cover premium.' },
      { id: 'dental_eye_care', name: 'Dental Care & Spectacles', defaultAmount: 0, frequency: 'yearly', essential: true, help: 'Annual dentist visit, eye exams, spectacles replacement.' },
      { id: 'diagnostic_tests', name: 'Diagnostic Tests & Annual Checkups', defaultAmount: 0, frequency: 'yearly', essential: true, help: 'Blood tests, ECG, preventive master health checkups.' },
      { id: 'emergency_medical', name: 'Out-of-Pocket Emergency Reserve', defaultAmount: 0, frequency: 'yearly', essential: true, help: 'Annual allocation for unexpected treatments not covered by insurance.' },
    ],
  },
  {
    id: 'personal',
    label: 'F. Personal, Lifestyle & Travel',
    description: 'Apparel, personal grooming, vacations, family festivals, and hobbies.',
    defaultInflationRate: 0.05,
    parentInput: {
      label: 'Total Personal & Lifestyle Spending',
      defaultFrequency: 'yearly',
      help: 'Annual allowance for clothing, travel, festivals, and leisure.',
    },
    subItems: [
      { id: 'clothing', name: 'Clothing & Footwear', defaultAmount: 0, frequency: 'yearly', essential: false, help: 'Annual wardrobe, shoes, seasonal clothing.' },
      { id: 'grooming', name: 'Haircuts & Personal Grooming', defaultAmount: 0, frequency: 'monthly', essential: false, help: 'Salon visits, basic personal care services.' },
      { id: 'festivals_gifts', name: 'Festivals, Celebrations & Gifts', defaultAmount: 0, frequency: 'yearly', essential: false, help: 'Diwali, Eid, Christmas, family weddings and social gifts.' },
      { id: 'vacations_travel', name: 'Holidays, Vacations & Travel', defaultAmount: 0, frequency: 'yearly', essential: false, help: 'Annual domestic or international leisure trips.' },
      { id: 'hobbies_fitness', name: 'Fitness, Gym, Sports & Hobbies', defaultAmount: 0, frequency: 'monthly', essential: false, help: 'Yoga classes, gym memberships, books, sports.' },
    ],
  },
  {
    id: 'technology',
    label: 'G. Technology & Gadgets',
    description: 'Smartphone replacement, laptops, and consumer electronics. Inflates at a lower rate (~3%).',
    defaultInflationRate: 0.03,
    parentInput: {
      label: 'Annual Gadget Budget',
      defaultFrequency: 'yearly',
      help: 'Average yearly fund set aside for gadget replacements.',
    },
    subItems: [
      { id: 'mobile_phone', name: 'Phone Replacement', defaultAmount: 25000, frequency: 'every_n_years', everyNYears: 4, essential: false, help: 'Smartphone upgrade every 3 to 4 years.' },
      { id: 'laptop_computer', name: 'Computer / Laptop Replacement', defaultAmount: 60000, frequency: 'every_n_years', everyNYears: 5, essential: false, help: 'Laptop replacement every 5 years.' },
      { id: 'electronics_repairs', name: 'Electronics Repairs & Accessories', defaultAmount: 0, frequency: 'yearly', essential: false, help: 'Chargers, battery changes, screen guards, repairs.' },
    ],
  },
  {
    id: 'family',
    label: 'H. Family & Dependents Support',
    description: 'Support for elderly parents, school or college tuition fees, childcare.',
    defaultInflationRate: 0.07,
    parentInput: {
      label: 'Total Family Support Budget',
      defaultFrequency: 'monthly',
      help: 'Total monthly allowance sent to dependents.',
    },
    subItems: [
      { id: 'parental_support', name: 'Support for Elderly Parents', defaultAmount: 0, frequency: 'monthly', essential: true, help: 'Monthly financial assistance to parents.', linkedMemberRelationship: 'parent' },
      { id: 'school_fees', name: 'School Fees & Tuitions', defaultAmount: 0, frequency: 'yearly', essential: true, help: 'Annual school fees, uniform, books.', linkedMemberRelationship: 'child' },
      { id: 'higher_education', name: 'College / Higher Education Provision', defaultAmount: 0, frequency: 'yearly', essential: false, help: 'Degree or university funding support.', linkedMemberRelationship: 'child' },
    ],
  },
  {
    id: 'financial',
    label: 'I. Financial & Administrative',
    description: 'Bank locker charges, accounting/legal fees, passport renewals, government paperwork.',
    defaultInflationRate: 0.05,
    parentInput: {
      label: 'Total Financial / Admin Costs',
      defaultFrequency: 'yearly',
      help: 'Annual admin charges and administrative renewals.',
    },
    subItems: [
      { id: 'bank_charges', name: 'Bank Locker & Account Fees', defaultAmount: 0, frequency: 'yearly', essential: true, help: 'Locker rental, demat AMC, card charges.' },
      { id: 'legal_accounting', name: 'CA, Tax Filing & Legal Services', defaultAmount: 0, frequency: 'yearly', essential: false, help: 'Income tax return filing and advisory fees.' },
      { id: 'document_renewals', name: 'Document Renewals (Passport, DL)', defaultAmount: 0, frequency: 'every_n_years', everyNYears: 10, essential: true, help: 'Passport and driving licence renewal fees.' },
    ],
  },
  {
    id: 'emergency',
    label: 'J. Unforeseen Contingencies',
    description: 'Disaster recovery, family emergency aid, or unforeseen legal/medical buffers.',
    defaultInflationRate: 0.05,
    parentInput: {
      label: 'Annual Contingency Provision',
      defaultFrequency: 'yearly',
      help: 'Annual contingency allowance set aside.',
    },
    subItems: [
      { id: 'general_contingency', name: 'General Contingency Buffer', defaultAmount: 0, frequency: 'yearly', essential: true, help: 'Provision for unexpected family or property emergencies.' },
    ],
  },
  {
    id: 'custom',
    label: 'K. Custom Expenses',
    description: 'Any personal, community, or religious commitments not captured above.',
    defaultInflationRate: 0.05,
    parentInput: {
      label: 'Total Custom Expenses',
      defaultFrequency: 'yearly',
      help: 'Any custom ongoing commitments.',
    },
    subItems: [],
  },
]
