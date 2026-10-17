# `AGENT.md` --- Foundry Mate: Cylinder Metal Weight Estimator

## Mission

Build a simple, reliable, mobile-first app for a small metal-casting
business. Its main purpose is to estimate the weight of **solid
cylinders and hollow cylinders (pipes/tubes/rings)** from dimensions.

The person using the app may not be comfortable with calculations or
complicated technology. They should be able to enter a few measurements,
choose a material or enter its density, and see an estimated weight
clearly.

**Implement the working app, not just a plan or scaffold.** Inspect the
existing repository first. Preserve useful existing code and
conventions. If the directory is empty, use the stack described below.

## 1. Product requirements

App name: **Foundry Mate**

Primary workflow: 1. Choose **Solid cylinder** or **Hollow cylinder**.
2. Choose the measurement unit. 3. Enter the required dimensions. 4.
Choose a material from a list **or** select "Enter density manually". 5.
Tap Calculate (or show a live result only after all inputs are valid).
6. See the estimated weight in kg and grams, the calculated volume, and
a simple breakdown of the formula. 7. Optionally save the calculation on
the device for reuse.

The app must be usable by a non-technical user. Keep it focused; do not
add unrelated shape calculators, login, cloud accounts, payments, or a
backend.

## 2. Platform and stack

-   Build a mobile-first **Progressive Web App (PWA)** that can be added
    to a phone's home screen.
-   If an existing stack is present, use it unless there is a strong
    reason not to.
-   If starting from scratch, use **React + TypeScript + Vite**.
-   Use simple CSS or the existing styling system; avoid unnecessary
    dependencies.
-   Core calculations must work offline after the app is
    installed/cached.
-   Persist saved calculations and custom density settings locally
    (e.g. `localStorage`).
-   No login, server, analytics, or paid services.
-   Keep formulas and unit conversions in pure functions, separate from
    UI components.
-   Add automated tests for calculation logic.

## 3. User interface

### Home / calculator screen

Show a clear title: **Metal Weight Calculator**.

At the top, offer two large selection cards or segmented buttons: -
**Solid Cylinder** - **Hollow Cylinder**

Show a simple labelled illustration or schematic of the selected shape,
if practical. It must not obstruct the form.

Use large controls, readable text, clear contrast, and touch-friendly
spacing. Avoid technical jargon where possible. Use labels and helper
text instead of relying on placeholders.

### Dimensions and units

Provide one unit selector that applies to all entered dimensions in the
current calculation: - millimetres (`mm`) - centimetres (`cm`) - metres
(`m`) - inches (`in`) --- useful as an optional addition if it can be
implemented and tested consistently

Default unit: **mm**.

For a **solid cylinder**, ask for: - Diameter - Length

For a **hollow cylinder**, ask for: - Outer diameter - Inner diameter -
Length

Display the selected unit next to each input. Do not ask for radius;
derive it from diameter to make entry easier.

Use decimal-capable numeric inputs. Support values such as `25`, `25.5`,
or `100.25`.

### Material selection and manual density

The user must be able to choose **one of two modes**:

**Mode A --- Choose a material** Provide a dropdown or searchable list
with these approximate default densities in `g/cm³`:

  Material                         Default density (g/cm³)
  --------------------- ----------------------------------
  Cast iron                                           7.20
  Mild / carbon steel                                 7.85
  Stainless steel                                     8.00
  Aluminium                                           2.70
  Copper                                              8.96
  Brass                                               8.50
  Bronze                                              8.80
  Zinc                                                7.14
  Lead                                               11.34
  Custom material         User supplies a name and density

These are approximate reference values only. Alloy composition and
material grade affect density. Let the user add, edit, and delete custom
materials, and restore the built-in defaults.

**Mode B --- Enter density manually** - Show a clearly labelled field:
**Density (g/cm³)**. - Require the user to enter a positive numeric
density. - Do not guess or automatically fill an unknown density. -
Explain briefly: "Use the density supplied by your material vendor or
technical specification." - Keep the manually entered density visible in
the result summary.

Switching between material selection and manual density must be obvious.
Never mix up density units. Store and calculate density consistently in
`g/cm³`.

## 4. Correct formulas and units

Use `Math.PI`. Do not round intermediate values.

Let: - (D) = diameter - (D_o) = outer diameter - (D_i) = inner
diameter - (L) = cylinder length - (V) = volume - (`\rho`{=tex}) =
density

Solid cylinder:

\[ V = `\pi `{=tex}`\left`{=tex}(`\frac{D}{2}`{=tex}`\right`{=tex})\^2 L
\]

Hollow cylinder:

\[ V = `\pi `{=tex}L
`\left[\left(\frac{D_o}{2}\right)^2-\left(\frac{D_i}{2}\right)^2\right]`{=tex}\]

Mass:

\[ m = V `\times `{=tex}`\rho`{=tex} \]

Important unit handling: - Convert dimensions into a single canonical
unit before calculating. - A reliable approach is to convert every
dimension to centimetres, calculate volume in `cm³`, then calculate mass
in grams using density in `g/cm³`. - Conversions to centimetres: - mm →
cm: divide by 10 - cm → cm: unchanged - m → cm: multiply by 100 - in →
cm: multiply by 2.54 - Convert mass to kilograms by dividing grams by
1,000. - Show both grams and kilograms. For large results, optionally
show metric tonnes. - Display volume in `cm³` and optionally litres
(`1,000 cm³ = 1 L`). - Do not treat diameter as radius. Divide diameter
by two in the formula. - For hollow cylinders, subtract the
inner-cylinder volume from the outer-cylinder volume. - Use full
precision internally and round only displayed values.

## 5. Input validation and error handling

Do not calculate until all required fields contain valid, finite,
positive numbers.

Solid cylinder: - Diameter \> 0 - Length \> 0

Hollow cylinder: - Outer diameter \> 0 - Inner diameter \> 0 - Length \>
0 - Inner diameter must be **strictly less than** outer diameter

Density: - Must be a finite positive number - Never allow zero,
negative, `NaN`, or infinity

Show plain-language inline errors, for example: - "Enter a diameter
greater than zero." - "Enter the cylinder length." - "Inner diameter
must be smaller than outer diameter." - "Enter a valid density greater
than zero."

Do not crash while the user is typing a partial value. Do not silently
substitute zero or a default density. Prevent stale results from
appearing to match newly edited inputs: mark results as needing
recalculation or update only when the current inputs are valid.

## 6. Results panel

After a valid calculation, show a prominent result card:

-   **Estimated weight:** e.g. `12.45 kg`
-   Weight in grams
-   Calculated metal volume in `cm³` and optionally litres
-   Shape type
-   Entered dimensions and unit
-   Material name or "Manual density"
-   Density value in `g/cm³`
-   Formula used

Add a **Show calculation steps** disclosure with a human-readable
breakdown: 1. Convert dimensions to centimetres. 2. Calculate the
volume. 3. Multiply volume by density. 4. Convert grams to kilograms.

Use clear rounding (typically 2--3 decimal places for weight, and
sensible precision for volume). Never round values used in later
calculations.

Always label the result **estimated weight**, not guaranteed actual
weight. Explain that the result assumes a geometrically perfect cylinder
and solid material, except for the explicitly modelled hollow centre.
Actual casting weight may differ because of alloy composition, cavities,
porosity, surface features, or manufacturing details.

## 7. Save and reuse calculations

Provide a small optional **Save calculation** action. Save locally: -
Optional user-provided name - Date and time - Shape type - Dimensions
and selected unit - Material name or manual density - Density used -
Volume and estimated mass

Provide a **Saved calculations** view that lets the user reopen and
delete a saved calculation. Confirm before deleting. Handle malformed or
outdated local data safely. Explain that data is stored on this device
and may be lost if browser data is cleared.

## 8. Accessibility and ease of use

-   Use plain English and short labels.
-   Make primary controls easy to tap on a phone.
-   Ensure labels are programmatically associated with inputs.
-   Use semantic buttons and accessible focus indicators.
-   Support keyboard navigation.
-   Make errors visible and specific.
-   Avoid excessive animations and clutter.
-   Make the layout responsive on narrow mobile screens and desktop.
-   Keep the main calculation workflow on one screen when possible.

## 9. Tests

Use the existing test runner; if creating a new project, use Vitest.

Include tests for at least:

1.  Solid cylinder: diameter `2 cm`, length `10 cm` → volume
    approximately `31.4159265 cm³`.
2.  Solid cylinder: diameter `100 mm`, length `200 mm`, density
    `7.2 g/cm³` → volume approximately `1570.7963 cm³`, mass
    approximately `11.3097 kg`.
3.  Hollow cylinder: outer diameter `4 cm`, inner diameter `2 cm`,
    length `10 cm` → volume approximately `94.24778 cm³`.
4.  Hollow cylinder: reject inner diameter equal to outer diameter.
5.  Hollow cylinder: reject inner diameter greater than outer diameter.
6.  Convert dimensions correctly from mm, cm, m, and inches (if inches
    are included).
7.  Density conversion and weight in grams/kg.
8.  Reject blank, zero, negative, non-finite, and invalid inputs.
9.  Manual density mode uses exactly the density entered by the user.
10. Material mode uses the selected material's density.
11. Saved calculations persist and can be loaded and deleted.
12. Rounding changes display only, not calculation precision.

## 10. Suggested structure

Adapt this to the existing repository if it already has a good
structure.

``` text
src/
  components/
    ShapeToggle.tsx
    DimensionField.tsx
    MaterialSelector.tsx
    DensityInput.tsx
    WeightResult.tsx
    FormulaSteps.tsx
  features/
    calculator/
      formulas.ts
      units.ts
      validation.ts
      types.ts
    materials/
      defaults.ts
      materialStorage.ts
    saved-calculations/
      savedCalculationStorage.ts
  App.tsx
  main.tsx
  styles/
  tests/
public/
```

Keep the app straightforward. Do not create abstractions that add
complexity without practical benefit.

## 11. Definition of done

The app is complete when: - Both solid and hollow cylinders calculate
correctly. - The user can choose a material or manually enter density. -
All supported units convert correctly. - Invalid measurements are
rejected with understandable messages. - Results show estimated weight,
volume, density, dimensions, and calculation steps. - Custom materials
and saved calculations work. - The app is responsive and installable as
a PWA. - The core calculator works offline after initial
installation/cache setup. - Tests, type checks, and production build
pass. - No visible button is a placeholder. - README instructions
explain setup, testing, building, installation, offline limitations,
formulas, and assumptions.

## 12. Implementation sequence

1.  Inspect the repository and identify the current stack.
2.  Implement typed formulas, unit conversions, validation, and tests.
3.  Build the solid/hollow cylinder input flow.
4.  Implement material selection and manual density entry.
5.  Build the results card and calculation breakdown.
6.  Add local saved calculations and custom materials.
7.  Add PWA/offline support.
8.  Run tests, type checking, and production build; fix errors.
9.  Check narrow-screen mobile usability.
10. Update README with accurate commands and assumptions.

Do not stop after scaffolding. Build and test the complete MVP, then
report what was implemented, the commands used, the test/build results,
and any remaining limitations.
