import type { ExpenseCategory } from '../models/expense'
import { nanoid } from '../../../node_modules/nanoid/index.js'

function id() {
  // simple id without nanoid dependency at this stage
  return Math.random().toString(36).slice(2, 10)
}

function item(
  categoryId: ExpenseCategory['id'],
  name: string,
  amount: number,
  frequency: 'monthly' | 'yearly' | 'every_n_years' | 'one_time',
  essential: boolean,
  everyNYears?: number,
): ExpenseCategory['items'][number] {
  return {
    id: id(),
    categoryId,
    name,
    amount,
    frequency,
    everyNYears,
    essential,
    appliesTo: 'household',
    startYear: 1,
    type: frequency === 'one_time' ? 'one_time' : frequency === 'every_n_years' ? 'periodic' : 'recurring',
    notes: '',
    skipped: false,
  }
}

export const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  {
    id: 'housing',
    label: 'A. Housing & Property',
    description:
      'Rent, utilities (if not listed separately), property tax, insurance, and home maintenance. Do not double-count electricity or LPG if you list them under Utilities.',
    defaultInflationRate: 0.05,
    skipped: false,
    items: [
      item('housing', 'Electricity', 800, 'monthly', true),
      item('housing', 'Water', 0, 'monthly', true),
      item('housing', 'Cooking Gas / LPG', 1000, 'monthly', true),
      item('housing', 'Internet / Broadband', 700, 'monthly', true),
      item('housing', 'Rent', 0, 'monthly', true),
      item('housing', 'Property Tax', 0, 'yearly', true),
      item('housing', 'Home Insurance', 0, 'yearly', true),
      item('housing', 'Society / Association Fees', 0, 'monthly', true),
      item('housing', 'Repairs & Maintenance', 50000, 'yearly', true),
      item('housing', 'Painting & Waterproofing', 0, 'every_n_years', false, 5),
      item('housing', 'Appliance Replacement', 0, 'every_n_years', false, 7),
      item('housing', 'Domestic Help / Security', 0, 'monthly', false),
    ],
  },
  {
    id: 'food',
    label: 'B. Food & Household Consumables',
    description:
      'Groceries, staples, vegetables, eating out, and household supplies for the whole household per month.',
    defaultInflationRate: 0.05,
    skipped: false,
    items: [
      item('food', 'Groceries & Staples', 5000, 'monthly', true),
      item('food', 'Vegetables & Fruits', 0, 'monthly', true),
      item('food', 'Fish, Meat, Eggs & Dairy', 0, 'monthly', true),
      item('food', 'Eating Out / Takeaway', 0, 'monthly', false),
      item('food', 'Drinking Water', 0, 'monthly', true),
      item('food', 'Cleaning & Household Supplies', 0, 'monthly', true),
      item('food', 'Toiletries & Personal Care', 0, 'monthly', true),
    ],
  },
  {
    id: 'utilities',
    label: 'C. Utilities & Communication',
    description:
      'Mobile, DTH/streaming, and other utility bills not already counted under Housing.',
    defaultInflationRate: 0.05,
    skipped: false,
    items: [
      item('utilities', 'Mobile Recharge / Phone Bills', 500, 'monthly', true),
      item('utilities', 'Cable / DTH', 0, 'monthly', false),
      item('utilities', 'Streaming Subscriptions', 0, 'monthly', false),
      item('utilities', 'Other Digital Subscriptions', 0, 'monthly', false),
    ],
  },
  {
    id: 'transport',
    label: 'D. Transport & Vehicles',
    description:
      'Fuel, public transport, insurance, servicing, and vehicle replacement reserve. Maintenance does not replace the vehicle — add a replacement reserve.',
    defaultInflationRate: 0.05,
    skipped: false,
    items: [
      item('transport', 'Petrol / Diesel / CNG / EV Charging', 1000, 'monthly', true),
      item('transport', 'Public Transport', 0, 'monthly', true),
      item('transport', 'Taxi / Auto / Rideshare', 0, 'monthly', false),
      item('transport', 'Vehicle Servicing', 0, 'yearly', true),
      item('transport', 'Vehicle Insurance & Registration', 0, 'yearly', true),
      item('transport', 'Tyres & Batteries', 0, 'every_n_years', true, 4),
      item('transport', 'Parking & Tolls', 0, 'monthly', false),
      item('transport', 'Vehicle Replacement Reserve', 0, 'every_n_years', false, 10),
    ],
  },
  {
    id: 'healthcare',
    label: 'E. Healthcare & Insurance',
    description:
      'Doctor visits, medicines, insurance premiums, dental, eye care, and emergency medical buffer. This category defaults to 7% inflation — healthcare costs tend to grow faster.',
    defaultInflationRate: 0.07,
    skipped: false,
    items: [
      item('healthcare', 'General Medicines & Checkups', 10000, 'yearly', true),
      item('healthcare', 'Health Insurance Premium', 15000, 'yearly', true),
      item('healthcare', 'Dental Care', 0, 'yearly', true),
      item('healthcare', 'Eye Care & Spectacles', 0, 'yearly', true),
      item('healthcare', 'Specialist Consultations', 0, 'yearly', true),
      item('healthcare', 'Medical Tests & Diagnostics', 0, 'yearly', true),
      item('healthcare', 'Policy Co-payments & Deductibles', 0, 'yearly', true),
      item('healthcare', 'Medical Devices & Aids', 0, 'every_n_years', false, 5),
      item('healthcare', 'Emergency Medical Reserve (annual provision)', 0, 'yearly', true),
    ],
  },
  {
    id: 'personal',
    label: 'F. Personal & Lifestyle',
    description:
      'Clothing, grooming, hobbies, travel, festivals, and leisure. Mark items as discretionary if you would cut them in a bare-minimum scenario.',
    defaultInflationRate: 0.05,
    skipped: false,
    items: [
      item('personal', 'Clothing & Footwear', 0, 'yearly', false),
      item('personal', 'Haircuts & Grooming', 0, 'monthly', false),
      item('personal', 'Fitness / Sports', 0, 'monthly', false),
      item('personal', 'Hobbies & Books', 0, 'monthly', false),
      item('personal', 'Entertainment', 0, 'monthly', false),
      item('personal', 'Festivals & Celebrations', 0, 'yearly', false),
      item('personal', 'Gifts & Donations', 0, 'yearly', false),
      item('personal', 'Holidays & Travel', 0, 'yearly', false),
    ],
  },
  {
    id: 'technology',
    label: 'G. Technology & Devices',
    description:
      'Phone and laptop replacements, subscriptions, and electronics repairs. Technology tends to inflate more slowly (~3%).',
    defaultInflationRate: 0.03,
    skipped: false,
    items: [
      item('technology', 'Mobile Phone Replacement', 0, 'every_n_years', false, 3),
      item('technology', 'Laptop / Computer Replacement', 0, 'every_n_years', false, 4),
      item('technology', 'TV & Audio Equipment', 0, 'every_n_years', false, 7),
      item('technology', 'Refrigerator / Washing Machine', 0, 'every_n_years', false, 10),
      item('technology', 'Software & Cloud Subscriptions', 0, 'yearly', false),
      item('technology', 'Electronics Repairs', 0, 'yearly', false),
    ],
  },
  {
    id: 'family',
    label: 'H. Family & Dependents',
    description:
      'Support for parents, children\'s education, childcare, and other dependents. Add end years where applicable — education costs stop, childcare ends when a child grows up.',
    defaultInflationRate: 0.07,
    skipped: false,
    items: [
      item('family', 'Support for Parents', 0, 'monthly', true),
      item('family', 'Childcare', 0, 'monthly', true),
      item('family', 'School Fees', 0, 'yearly', true),
      item('family', 'Higher Education Support', 0, 'every_n_years', false, 1),
      item('family', 'Special Family Events', 0, 'yearly', false),
      item('family', 'Family Travel', 0, 'yearly', false),
      item('family', 'Caregiving / Eldercare', 0, 'monthly', true),
    ],
  },
  {
    id: 'financial',
    label: 'I. Financial & Administrative',
    description:
      'Taxes on non-investment income, bank charges, professional fees, and document renewals. Investment tax drag is better handled in the Assumptions step.',
    defaultInflationRate: 0.05,
    skipped: false,
    items: [
      item('financial', 'Income Tax (non-investment)', 0, 'yearly', true),
      item('financial', 'Bank & Account Charges', 0, 'yearly', true),
      item('financial', 'Professional / Legal / Accounting Fees', 0, 'yearly', false),
      item('financial', 'Document Renewals & Admin Costs', 0, 'yearly', true),
    ],
  },
  {
    id: 'emergency',
    label: 'J. Emergencies & Contingencies',
    description:
      'An annual provision for unexpected expenses. You can also model this as a safety margin in the Assumptions step — avoid counting it in both places.',
    defaultInflationRate: 0.05,
    skipped: false,
    items: [
      item('emergency', 'General Emergency Reserve (annual provision)', 0, 'yearly', true),
      item('emergency', 'Home Emergency Reserve', 0, 'yearly', true),
      item('emergency', 'Medical Emergency Reserve', 0, 'yearly', true),
      item('emergency', 'Vehicle Emergency Reserve', 0, 'yearly', true),
    ],
  },
  {
    id: 'custom',
    label: 'K. Custom Expenses',
    description:
      'Any other expenses not covered above. Add as many items as needed.',
    defaultInflationRate: 0.05,
    skipped: false,
    items: [],
  },
]
