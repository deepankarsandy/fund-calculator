# Lifetime Cost of Living & Retirement Corpus Calculator

## Product and application development guide

**Document purpose:** Product requirements, calculation methodology,
input model, user experience, validation rules, and test cases for an
application that estimates the investment corpus required to fund a
person's living expenses over a selected period.

**Initial market/context:** India, with INR as the default currency and
support for local household costs. The design should remain configurable
for other countries and currencies.

------------------------------------------------------------------------

# 1. Product objective

Build an application that answers:

1.  What does the user's household cost today, annually and monthly?
2.  How much will those expenses grow over the selected time horizon?
3.  What starting investment corpus is mathematically required to fund
    those expenses?
4.  How sensitive is the result to inflation, investment returns,
    lifespan, taxes, and unexpected costs?
5.  What additional reserve or safety margin should the user consider?

The application is an estimation and planning tool, not a guarantee of
investment performance or a substitute for regulated financial advice.

## 1.1 Core principles

-   Make all assumptions visible and editable.
-   Separate today's spending from future inflated spending.
-   Support both essential/bare-minimum and comfortable lifestyle
    scenarios.
-   Allow any number of household members, dependents, expense
    categories, and custom expense items.
-   Distinguish recurring expenses from irregular, periodic, and
    one-time expenses.
-   Avoid silently assuming that a government hospital, insurance
    policy, or investment return will cover every future cost.
-   Show the calculation methodology and cash-flow timeline, not just
    one corpus number.
-   Present results in both nominal future rupees and today's
    purchasing-power terms.
-   Allow users to save, edit, duplicate, and compare scenarios.

------------------------------------------------------------------------

# 2. User journey

1.  **Profile:** Enter current age, target age, location, currency,
    household size, and dependents.
2.  **Household:** Add people whose expenses are included. Record each
    person's age and relationship, if relevant.
3.  **Expenses:** Review suggested categories, enter amounts, and add
    custom categories.
4.  **Expense behaviour:** Mark each item as essential or discretionary,
    and choose its inflation rate and frequency.
5.  **Assets and income:** Optionally enter existing corpus, pensions,
    rental income, other income, and future lump sums.
6.  **Assumptions:** Set inflation, investment return, tax/fee
    assumptions, withdrawal timing, and safety margin.
7.  **Results:** View annual budget, future expenses, required corpus,
    shortfall/surplus, and scenario comparisons.
8.  **Review:** Inspect missing categories, warnings, assumptions, and a
    year-by-year projection.
9.  **Export:** Download or print the report and save the scenario.

A user should be able to get a preliminary result without completing
every optional field. Clearly label incomplete assumptions.

------------------------------------------------------------------------

# 3. Profile and household inputs

## 3.1 Main profile

  ---------------------------------------------------------------------------
  Field               Type                          Required Notes
  ------------------- ---------------- --------------------- ----------------
  Country             Select                             Yes Default India

  State/region        Select or text                      No Example: Odisha

  City/town/village   Text                                No Used for
                                                             context, not
                                                             automatic
                                                             expense
                                                             assumptions

  Currency            Select                             Yes Default INR

  Current age         Number                             Yes Years; allow
                                                             decimal age only
                                                             if needed

  Target age          Number                             Yes Must be greater
                                                             than current age

  Planning duration   Calculated                         Yes Target age minus
                                                             current age

  Household size      Number                             Yes Number of people
                                                             covered by the
                                                             budget

  Lifestyle scenario  Select                             Yes Bare minimum,
                                                             comfortable,
                                                             custom
  ---------------------------------------------------------------------------

The user may choose a planning horizon longer than a conventional
retirement horizon. Encourage testing to age 90, 95, or 100 rather than
assuming the plan ends at age 70.

## 3.2 Household members and dependents

Allow an editable list of people:

-   Name or label (optional; e.g. Self, Spouse, Parent 1, Child 1)
-   Relationship
-   Current age
-   Whether financially dependent
-   Whether fully or partially supported
-   Age until support is expected, if known
-   Expenses that apply specifically to this person
-   Health-insurance coverage status

Do not assume every dependent's costs stop at the same age. A child,
spouse, or parent may have a different support period. The first version
may use a household-level horizon, but the data model should allow
person-specific periods in a later version.

Avoid collecting sensitive medical details unless genuinely necessary.
For an expense calculator, estimated annual medical spending and
insurance premiums are generally sufficient.

------------------------------------------------------------------------

# 4. Expense input model

Every expense item should have these properties:

  -----------------------------------------------------------------------
  Property                            Meaning
  ----------------------------------- -----------------------------------
  Category                            Broad grouping, such as Housing or
                                      Food

  Item name                           Specific expense, such as
                                      Electricity

  Amount                              User-entered cost

  Frequency                           Weekly, monthly, quarterly,
                                      half-yearly, yearly, every N years,
                                      or one-time

  Essential/discretionary             Used to build minimum and
                                      comfortable scenarios

  Applies to                          Whole household or selected
                                      household members

  Inflation rate                      Default category rate or custom
                                      rate

  Start year                          When the expense begins

  End year                            Optional; when the expense stops

  Replacement/renewal cycle           Optional; for items replaced every
                                      few years

  Notes                               Optional explanation
  -----------------------------------------------------------------------

Store the original amount and frequency. Convert to an annual baseline
for calculations:

-   Weekly: amount × 52
-   Monthly: amount × 12
-   Quarterly: amount × 4
-   Half-yearly: amount × 2
-   Yearly: amount
-   Every N years: amount / N for a simple annualised budget, or model
    as an actual periodic cash flow
-   One-time: model in the year it occurs; do not treat it as a
    recurring annual expense

For items with irregular timing, the cash-flow engine should preserve
the actual timing where possible rather than relying only on annual
averages.

## 4.1 Suggested expense categories

Pre-populate the following categories. Users must be able to rename,
disable, delete, or add categories and line items.

### A. Housing and property

-   Rent (default zero; user owns home in the example)
-   Home loan / mortgage payments (if applicable; model separately from
    ordinary living costs)
-   Property tax
-   Home insurance
-   Society / association / community fees
-   Electricity
-   Water
-   Cooking gas / LPG
-   Internet / broadband
-   Home phone
-   Repairs and maintenance
-   Painting and waterproofing
-   Plumbing and electrical repairs
-   Roof, structural, and major repairs
-   Furniture and household equipment replacement
-   Appliance replacement
-   Security, cleaning, and domestic help
-   Waste collection or other local charges

**Important:** A home-maintenance budget should clarify whether it
includes only routine repairs or also major renovation and structural
work. Avoid double-counting a separate major-repair reserve.

### B. Food and household consumables

-   Rice, wheat, and other staples
-   Groceries and packaged food
-   Vegetables and fruits
-   Fish, meat, eggs, and dairy
-   Drinking water
-   Cooking ingredients
-   Eating out / takeaway
-   Household cleaning supplies
-   Toiletries and personal-care consumables

### C. Utilities and communication

-   Electricity
-   Water
-   LPG / cooking fuel
-   Internet
-   Mobile recharge / phone bills
-   Cable / DTH / streaming subscriptions
-   Other recurring digital subscriptions

Do not count LPG or electricity twice if already included under Housing.

### D. Transport and vehicles

-   Petrol / diesel / CNG / EV charging
-   Public transport
-   Taxi / auto / rideshare
-   Vehicle servicing
-   Repairs and spare parts
-   Tyres and batteries
-   Insurance
-   PUC / registration / permits / road tax
-   Parking and tolls
-   Driving licence renewals
-   Vehicle replacement reserve
-   Bicycle or other transport maintenance

**Vehicle replacement:** Maintenance does not replace the vehicle.
Capture the expected replacement cost, replacement interval, and whether
the user expects to stop owning a vehicle at a certain age.

### E. Healthcare and insurance

-   Routine doctor consultations
-   General medicines
-   Tests and checkups
-   Dental care
-   Eye care and spectacles
-   Physiotherapy / rehabilitation
-   Medical devices and aids
-   Health insurance premiums
-   Policy co-payments and deductibles
-   Out-of-pocket treatment
-   Emergency medical reserve
-   Long-term care / assisted living reserve, if relevant

A nearby government hospital may reduce routine treatment costs, but do
not assume all medicines, diagnostics, specialist care, travel, or
future treatment will always be free or available. Model insurance and
out-of-pocket expenses separately. Avoid counting the same medical event
both in annual medical spending and in an emergency reserve.

### F. Personal and lifestyle

-   Clothing and footwear
-   Haircuts and grooming
-   Toiletries not counted elsewhere
-   Fitness / sports
-   Hobbies
-   Books and learning
-   Entertainment
-   Festivals and celebrations
-   Gifts and donations
-   Religious / community events, if the user chooses to include them
-   Eating out and leisure
-   Holidays and travel
-   Family visits

### G. Household, technology, and devices

-   Mobile phone replacement
-   Computer / laptop replacement
-   TV and audio equipment
-   Refrigerator / washing machine / other appliance replacement
-   Furniture replacement
-   Small tools and equipment
-   Repairs for electronics
-   Software and cloud subscriptions

### H. Family and dependents

-   Financial support for parents
-   Spouse's personal expenses
-   Childcare
-   School fees
-   Higher education support
-   Special family events
-   Family travel
-   Support for other relatives
-   Caregiving and eldercare

Use person-specific start/end ages where possible. Education and
childcare should not be treated as lifelong recurring expenses.

### I. Financial and administrative costs

-   Income tax on non-investment income
-   Investment tax provision
-   Investment management fees
-   Bank and account charges
-   Professional / legal / accounting fees
-   Document renewals and administrative costs
-   Loan payments (if any)

Taxes and investment fees should ideally be handled in the return
assumptions or cash-flow engine to avoid double-counting.

### J. Emergencies and contingencies

-   General emergency reserve
-   Home emergency reserve
-   Vehicle emergency reserve
-   Medical reserve
-   Family emergency support
-   Other unforeseen expenses

A reserve is not automatically an annual expense. It can be modelled as
a separate starting reserve, a target reserve balance, or a
probability/stress-test scenario. Explain which method is used.

### K. Custom expenses

Users can add unlimited custom categories and items. Each custom item
must support the same frequency, inflation, essential/discretionary,
timing, and household-member properties.

------------------------------------------------------------------------

# 5. Inflation assumptions

A single inflation rate is easy to understand but may not represent
every expense. Support both a global rate and category-specific rates.

## 5.1 Suggested default category rates

These are editable planning assumptions, not forecasts or guarantees.

  Category                               Example default assumption
  ------------------------------------ ----------------------------
  General household / mixed expenses                             5%
  Food and groceries                                             5%
  Housing repairs and services                                   5%
  Electricity and utilities                                      5%
  Transport and fuel                                             5%
  Healthcare                                                     7%
  Education                                                      7%
  Insurance premiums                     User-defined / quote-based
  Technology and electronics                                     3%
  Travel and leisure                                             5%

The application should not imply that every category will follow these
rates. Allow the user to override any default.

## 5.2 Inflation modes

Offer:

1.  **Simple mode:** One inflation rate for all expenses.
2.  **Category mode:** A separate rate for each category.
3.  **Item mode:** A custom rate for each line item.

If the user enters both a global rate and category-specific rates, show
which rate takes precedence.

## 5.3 Inflation display

For each expense, show the projected nominal amount:

`Future expense = Current expense × (1 + inflation rate)^years`

For example, ₹1,00,000 today at 5% annual inflation becomes
approximately ₹1,62,889 after 10 years.

Do not describe a future nominal amount as today's purchasing power.

------------------------------------------------------------------------

# 6. Investment and withdrawal assumptions

## 6.1 Required inputs

  -----------------------------------------------------------------------
  Input                               Meaning
  ----------------------------------- -----------------------------------
  Expected annual investment return   Expected nominal return before or
                                      after tax, as explicitly selected

  Return basis                        Gross or net of fees/taxes

  Investment fees                     Annual fee assumption, if return is
                                      gross

  Tax assumption                      Effective tax drag or a simplified
                                      net-return input

  Compounding frequency               Annual or monthly

  Withdrawal timing                   Beginning or end of each period

  Existing investable corpus          Money already available for this
                                      purpose

  Future lump sums                    Expected one-time additions, with
                                      dates

  Other income                        Pension, rent, annuity, or other
                                      income, with start/end dates

  Safety margin                       Additional percentage or fixed
                                      reserve
  -----------------------------------------------------------------------

Do not call an assumed 7% return guaranteed. Actual market returns vary,
and the order of returns matters when withdrawals are occurring.

## 6.2 Nominal versus real return

The approximate real return is:

`Real return = (1 + nominal return) / (1 + inflation) - 1`

For example, 7% nominal return and 5% inflation gives approximately
1.90% real return.

Use the exact ratio formula rather than simply subtracting rates when
precision matters.

## 6.3 Net return

If the user enters a gross return, account for fees and taxes
explicitly. A simplified model may use:

`Net return = user-entered effective annual return after fees and taxes`

This is often safer than attempting to infer a complex Indian tax
treatment without knowing the asset mix, account type, holding period,
and tax circumstances.

Show a warning if the user enters a gross return but leaves taxes and
fees at zero.

------------------------------------------------------------------------

# 7. Core calculation methodology

The application should have two calculation modes:

1.  **Quick estimate:** Annualised expenses and a growing-annuity
    present-value formula.
2.  **Detailed projection:** Year-by-year or month-by-month cash flows,
    including irregular expenses, changing income, dependents, and lump
    sums.

The detailed projection should be the authoritative result when the user
has entered non-uniform cash flows.

## 7.1 Basic annual expense

For each recurring item:

`Annual baseline = amount × frequency conversion factor`

`Total current annual expense = sum of all annualised expense items`

`Current monthly equivalent = total current annual expense / 12`

Keep one-time and periodic future expenses separate from the recurring
annual baseline.

## 7.2 Growing annual expense: quick estimate

Let:

-   `E0` = current annual expense in today's money
-   `g` = annual expense inflation rate
-   `r` = effective annual investment return, net of fees and taxes
-   `n` = number of years
-   `C` = required starting corpus

### Convention A: first withdrawal at the end of year 1 equals today's annual expense

If the first year-one withdrawal is `E0`, and later withdrawals inflate
annually:

For `r ≠ g`:

`C = E0 × [1 - ((1 + g) / (1 + r))^n] / (r - g)`

If `r = g`:

`C = E0 × n / (1 + r)`

This convention is useful for reproducing a common simple estimate, but
it assumes the first year's expense is not increased by a full year of
inflation.

### Convention B: first withdrawal at the end of year 1 is inflated once

If the year-one withdrawal is `E0 × (1 + g)`:

For `r ≠ g`:

`C = E0 × (1 + g) × [1 - ((1 + g) / (1 + r))^n] / (r - g)`

If `r = g`:

`C = E0 × n × (1 + g) / (1 + r)`

The application must state which convention it uses. Do not switch
conventions silently.

### Beginning-of-year withdrawals

If expenses are withdrawn at the beginning of each year rather than the
end, the present value is higher. In the simple annual model, multiply
the corresponding end-of-year present value by `(1 + r)` when all
withdrawals are shifted one period earlier.

## 7.3 Detailed year-by-year cash-flow model

For each year `t`, where `t = 1 ... n`:

1.  Project each expense item using its own inflation rate and timing.
2.  Add one-time or periodic expenses scheduled in that year.
3.  Subtract reliable income available in that year.
4.  Calculate the net withdrawal.
5.  Discount the net withdrawal to the valuation date.

For an end-of-year cash flow:

`Present value of year t net withdrawal = Net withdrawal at year t / (1 + r)^t`

`Required corpus = sum of present values of all projected net withdrawals`

If the result for a year is negative because income exceeds expenses,
the model must handle the surplus consistently. A detailed
portfolio-balance simulation is preferable to simply allowing a negative
required corpus.

## 7.4 Portfolio-balance simulation

To show the year-by-year corpus balance:

For end-of-year withdrawals:

`Opening balance(t) = Closing balance(t-1)`

`Investment growth(t) = Opening balance(t) × r`

`Closing balance(t) = Opening balance(t) + Investment growth(t) - Net withdrawal(t)`

For beginning-of-year withdrawals:

`Closing balance(t) = (Opening balance(t) - Net withdrawal(t)) × (1 + r)`

Use the same timing convention consistently in the corpus formula and
the simulation.

A monthly model can use an effective monthly return:

`Monthly return = (1 + annual effective return)^(1/12) - 1`

Do not use annual return divided by 12 if the input is an effective
annual rate.

## 7.5 Existing corpus and future income

Calculate the required corpus for the projected expenses first. Then
compare it with:

-   Existing investable assets
-   Future contributions
-   Expected pension or other reliable income
-   Future lump-sum receipts

Show:

`Funding gap = Required corpus - Available assets and appropriately discounted future contributions/income`

Do not subtract the full nominal value of a future income stream or
future lump sum from today's required corpus. Discount it to the same
valuation date or include it directly in the cash-flow projection.

Do not include the user's primary residence as an investable asset
unless the user explicitly plans to sell, rent, or monetise it.

------------------------------------------------------------------------

# 8. Scenario analysis and stress testing

Always show more than one scenario. Suggested initial presets:

  Scenario               Expense inflation   Net investment return
  -------------------- ------------------- -----------------------
  Optimistic                            4%                      7%
  Base planning case                    5%                      7%
  Conservative                          6%                      7%

These are illustrative assumptions, not recommended guaranteed returns.
Users must be able to edit them.

Also provide sensitivity analysis for:

-   Lower investment return
-   Higher inflation
-   Higher healthcare inflation
-   Longer lifespan
-   Early poor investment returns
-   One or more large medical expenses
-   Major home repair
-   Vehicle replacement
-   Loss or reduction of pension/other income

A useful stress test is to model a poor return in the first few years,
rather than only reducing the average return. This demonstrates
sequence-of-returns risk.

For market-linked investments, a deterministic 7% every year is not a
realistic representation of volatility. Label the quick estimate as
deterministic and offer a variable-return simulation in a later version.

------------------------------------------------------------------------

# 9. Results and reporting

## 9.1 Summary cards

Show:

-   Current monthly household budget
-   Current annual household budget
-   Essential annual expenses
-   Discretionary annual expenses
-   Planning duration
-   Assumed inflation
-   Assumed net investment return
-   Estimated starting corpus
-   Existing corpus
-   Funding gap or surplus
-   Safety reserve
-   Corpus after applying safety margin

## 9.2 Expense breakdown

Show an editable table and a chart by category:

-   Current annual cost
-   Share of total
-   Inflation assumption
-   Projected cost in 5, 10, 20, and 30 years
-   Essential or discretionary status

## 9.3 Projection table

For every year, show:

  Column              Description
  ------------------- -------------------------------------------
  Age                 User's age during the year
  Opening corpus      Starting portfolio balance
  Expenses            Projected expenses
  Other income        Pension, rent, etc.
  Net withdrawal      Expenses minus income
  Investment growth   Growth based on the selected return model
  Closing corpus      Balance after cash flows

Allow the user to inspect a particular year and see which expense items
contribute to the total.

## 9.4 Charts

Recommended charts:

1.  Annual expenses over time (nominal amount).
2.  Annual expenses in today's purchasing power.
3.  Portfolio balance over time.
4.  Expense category composition.
5.  Scenario comparison.
6.  Funding gap against existing assets.

Use clear labels and distinguish nominal rupees from today's rupees.

## 9.5 Explanation

Every result should include a plain-language explanation of:

-   The assumptions used
-   The withdrawal timing convention
-   Whether return is net or gross
-   Whether taxes and fees are included
-   Which expense items are missing or estimated
-   Whether the calculation includes an emergency reserve
-   Why the result is not guaranteed

------------------------------------------------------------------------

# 10. Validation and warnings

Implement these checks:

-   Current age must be greater than zero.
-   Target age must exceed current age.
-   Expense amounts cannot be negative.
-   Frequency must be valid.
-   Inflation must be greater than -100%.
-   Investment return must be greater than -100%.
-   Warn when investment return is equal to inflation; the formula has a
    special case.
-   Warn when investment return is below inflation; the corpus
    requirement may be very high.
-   Warn when the user has not entered healthcare, insurance, housing
    maintenance, or replacement costs.
-   Warn when household size is greater than one but all expenses appear
    to be individual-only.
-   Warn when a vehicle exists but replacement is not considered.
-   Warn when a house is owned but property tax, major repairs, or
    appliance replacement have not been reviewed.
-   Warn when the user has dependents but no dependent-specific expenses
    or end dates.
-   Warn when a gross investment return is used without fees/tax
    assumptions.
-   Warn when the user plans only to age 70.
-   Warn when a large one-time expense is accidentally entered as a
    recurring annual expense.
-   Warn about possible double-counting between category totals and
    custom expenses.

Warnings should guide the user, not prevent them from generating a
result.

------------------------------------------------------------------------

# 11. Data model suggestion

A simple conceptual model:

``` json
{
  "profile": {
    "country": "India",
    "region": "Odisha",
    "currency": "INR",
    "currentAge": 30,
    "targetAge": 90,
    "householdSize": 1
  },
  "members": [
    {
      "id": "self",
      "label": "Self",
      "relationship": "self",
      "age": 30,
      "financiallyDependent": false
    }
  ],
  "expenses": [
    {
      "id": "electricity",
      "category": "housing_utilities",
      "name": "Electricity",
      "amount": 800,
      "frequency": "monthly",
      "inflationRate": 0.05,
      "essential": true,
      "startYear": 1,
      "endYear": null,
      "type": "recurring"
    }
  ],
  "assumptions": {
    "globalInflationRate": 0.05,
    "annualInvestmentReturn": 0.07,
    "returnBasis": "net",
    "withdrawalTiming": "end_of_year",
    "safetyMarginPercent": 0.15
  },
  "assets": {
    "existingInvestableCorpus": 0,
    "futureContributions": [],
    "otherIncome": []
  }
}
```

This is an illustrative structure, not a final API contract. In
production, use stable IDs, schema validation, currency-safe decimal
handling, and explicit units. Store rates consistently as decimals (5% =
0.05).

------------------------------------------------------------------------

# 12. Example baseline data for initial testing

Use this sample as a seeded example, not as a default for every user.

**Profile**

-   Current age: 30
-   Target age: 70
-   Location: Small town in Odisha, India
-   Own house; no rent
-   Household size: To be confirmed

**Recurring monthly expenses**

  Item                                        Monthly amount
  ----------------------------------------- ----------------
  Electricity                                           ₹800
  Water                                                   ₹0
  Internet                                              ₹700
  Mobile recharge                                       ₹500
  Fuel                                                ₹1,000
  Cooking gas                                         ₹1,000
  Groceries, vegetables, fish, meat, rice             ₹2,000
  **Total**                                       **₹9,000**

**Additional annual expenses**

  Item                               Annual amount
  -------------------------------- ---------------
  General medicines and checkups           ₹10,000
  Health insurance                         ₹15,000
  House maintenance                        ₹50,000
  Vehicle and device maintenance           ₹10,000
  **Total**                            **₹85,000**

**Baseline totals**

-   Monthly recurring subtotal: ₹9,000
-   Annual recurring subtotal: ₹1,08,000
-   Additional annual expenses: ₹85,000
-   Total annual baseline: ₹1,93,000
-   Monthly equivalent including annual costs: approximately ₹16,083

Potential additional items to review before treating this as complete:

-   Clothing and footwear
-   Toiletries and personal care
-   Property tax and home insurance
-   Appliance and furniture replacement
-   Vehicle replacement
-   Vehicle insurance and registration
-   Dental and eye care
-   Travel, festivals, gifts, and social expenses
-   Family/dependent support
-   Emergency and major medical costs
-   Taxes, investment fees, and investment tax drag

Do not automatically add these to the user's budget. Ask the user to
confirm or enter them.

------------------------------------------------------------------------

# 13. Test cases and expected behaviour

The calculation engine should have automated unit tests. Use a fixed
rounding policy for display only; retain full precision internally.

## Test 1: Annualisation

Input: - ₹800 monthly electricity - ₹10,000 annual medicine cost

Expected: - Electricity annualised = ₹9,600 - Medicine annualised =
₹10,000 - Combined annual cost = ₹19,600

## Test 2: Inflation projection

Input: - Current annual expense = ₹1,00,000 - Inflation = 5% - Years =
10

Expected: - Future annual expense after 10 years = ₹1,00,000 ×
1.05\^10 - Approximately ₹1,62,889

## Test 3: Growing annuity

Input: - Current annual expense = ₹1,00,000 - Inflation = 5% - Net
annual return = 7% - Duration = 10 years - Convention A: first year-end
withdrawal equals ₹1,00,000

Expected: - Corpus equals the Convention A growing-annuity formula in
Section 7.2. - The portfolio simulation must produce approximately zero
after the final withdrawal, subject to floating-point precision.

## Test 4: Equal return and inflation

Input: - Inflation = 5% - Return = 5%

Expected: - No division-by-zero error. - Special-case formula is used. -
The projection and corpus formula agree.

## Test 5: No inflation

Input: - Inflation = 0% - Return = 7%

Expected: - The growing-annuity formula reduces to the present value of
a level annuity.

## Test 6: Different category inflation

Input: - Food ₹60,000/year at 5% - Healthcare ₹10,000/year at 7%

Expected: - Each line item grows at its own rate. - Total future expense
is the sum of both projected items.

## Test 7: One-time expense

Input: - One-time house repair of ₹2,00,000 in year 8

Expected: - Expense appears only in year 8. - It is not added to every
year's recurring expense.

## Test 8: Income offset

Input: - Annual expenses and pension income beginning in year 10

Expected: - Pension is included only from year 10 onward. - Future
pension payments are discounted or simulated at their actual dates.

## Test 9: Beginning versus end withdrawals

Expected: - Beginning-of-year withdrawals require a larger initial
corpus than otherwise identical end-of-year withdrawals.

## Test 10: Horizon extension

Expected: - Extending the target age while keeping assumptions and
expenses unchanged must not reduce the required corpus when all annual
net withdrawals are non-negative.

------------------------------------------------------------------------

# 14. Technical architecture recommendation

Keep the calculation engine independent from the user interface.

Suggested modules:

``` text
src/
  domain/
    models/
      profile
      household-member
      expense
      income
      assumptions
      scenario
    calculations/
      annualise-expense
      project-inflation
      calculate-growing-annuity
      project-cashflows
      simulate-portfolio
      calculate-funding-gap
      run-scenarios
    validation/
      validate-profile
      validate-expenses
      validate-assumptions
  application/
    use-cases/
      create-scenario
      update-scenario
      calculate-results
      compare-scenarios
      export-report
  infrastructure/
    persistence/
    export/
  ui/
    pages/
      profile
      household
      expenses
      assumptions
      results
```

Implementation guidance:

-   Use TypeScript or another strongly typed language for calculation
    models.
-   Keep all calculations in pure functions where possible.
-   Use decimal-safe arithmetic or a well-tested decimal library for
    financial calculations.
-   Keep internal rates as decimals and document all units.
-   Do not mix display formatting with calculation logic.
-   Unit-test formula edge cases and reconcile the formula with the
    portfolio simulation.
-   Version the calculation methodology so saved scenarios remain
    interpretable if formulas change.
-   Store user data securely; provide export and delete controls.
-   If data is stored locally, explain backup limitations. If cloud
    storage is used, implement authentication, access controls,
    encryption, and a clear retention policy.

------------------------------------------------------------------------

# 15. MVP implementation scope

A sensible first release should include:

1.  Profile and age/horizon inputs.
2.  Household members and dependents.
3.  Predefined expense categories and custom expense items.
4.  Monthly, annual, and one-time frequencies.
5.  Essential versus discretionary classification.
6.  Global and category-level inflation.
7.  Investment return and withdrawal timing.
8.  Quick growing-annuity estimate.
9.  Detailed annual cash-flow projection.
10. Existing corpus and other income.
11. Three editable scenarios.
12. Results summary, category breakdown, and projection table.
13. Export to Markdown/PDF/CSV.
14. Input validation and missing-expense warnings.

Later versions can add monthly cash flows, variable-return simulations,
probability-based longevity, tax-aware asset modelling, multiple
currencies, and shared household planning.

------------------------------------------------------------------------

# 16. Important financial limitations and disclosures

The application must clearly state:

-   Inflation and investment returns are uncertain.
-   A constant annual return is a simplifying assumption.
-   Market volatility and the sequence of returns can materially change
    the outcome.
-   Tax treatment depends on the user's investments and circumstances.
-   Health insurance premiums, exclusions, co-payments, and coverage can
    change.
-   Government healthcare availability and out-of-pocket costs can
    change.
-   The estimate depends on the completeness and accuracy of entered
    expenses.
-   The primary home is not a liquid investment unless monetisation is
    planned.
-   A 40-year estimate does not guarantee funds will last 40 years.
-   The result is not a guaranteed safe withdrawal amount or
    personalised investment recommendation.

**Recommended output wording:** "Estimated corpus under the assumptions
you entered" rather than "You need exactly this amount."

------------------------------------------------------------------------

# 17. Final product success criteria

The application is successful if a user can:

-   Enter a realistic household budget without needing financial
    expertise.
-   See which costs are included and which are missing.
-   Add dependents and custom expenses.
-   Understand how inflation changes each category.
-   Change the expected return and planning age.
-   Compare bare-minimum and comfortable lifestyles.
-   See the required corpus and funding gap.
-   Understand the assumptions and limitations behind the result.
-   Export a report that another person can review and reproduce.

The most important design decision is transparency: every corpus figure
should be traceable to the expense inputs, inflation assumptions,
investment return, cash-flow timing, and planning horizon that produced
it.
