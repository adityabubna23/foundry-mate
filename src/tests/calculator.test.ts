import { describe, it, expect } from 'vitest';
import {
  solidCylinderVolume,
  hollowCylinderVolume,
  massGrams,
  calculate,
} from '../features/calculator/formulas';
import { toCm } from '../features/calculator/units';
import {
  validateDimensions,
  validateDensity,
  isPositiveFinite,
} from '../features/calculator/validation';

// ──────────────────────────────────────────
// 1. Unit conversions
// ──────────────────────────────────────────
describe('toCm', () => {
  it('converts mm to cm', () => {
    expect(toCm(100, 'mm')).toBeCloseTo(10, 10);
  });
  it('cm stays unchanged', () => {
    expect(toCm(25, 'cm')).toBe(25);
  });
  it('converts m to cm', () => {
    expect(toCm(1, 'm')).toBe(100);
  });
  it('converts inches to cm', () => {
    expect(toCm(1, 'in')).toBeCloseTo(2.54, 10);
  });
});

// ──────────────────────────────────────────
// 2. Solid cylinder volume
// ──────────────────────────────────────────
describe('solidCylinderVolume', () => {
  it('diameter 2 cm, length 10 cm → ~31.4159265 cm³', () => {
    const v = solidCylinderVolume(2, 10);
    expect(v).toBeCloseTo(31.4159265, 5);
  });
});

// ──────────────────────────────────────────
// 3. Solid cylinder with mm inputs and density
// ──────────────────────────────────────────
describe('calculate: solid cylinder 100mm × 200mm, density 7.2', () => {
  it('volume ~1570.7963 cm³, mass ~11.3097 kg', () => {
    const result = calculate({
      shape: 'solid',
      unit: 'mm',
      dimensions: { diameter: 100, length: 200 },
      densityMode: 'manual',
      density: 7.2,
    });
    expect(result.volumeCm3).toBeCloseTo(1570.7963, 3);
    expect(result.massKg).toBeCloseTo(11.3097, 2);
  });
});

// ──────────────────────────────────────────
// 4. Hollow cylinder volume
// ──────────────────────────────────────────
describe('hollowCylinderVolume', () => {
  it('outer 4 cm, inner 2 cm, length 10 cm → ~94.24778 cm³', () => {
    const v = hollowCylinderVolume(4, 2, 10);
    expect(v).toBeCloseTo(94.24778, 3);
  });
});

// ──────────────────────────────────────────
// 5. Hollow cylinder: reject inner >= outer
// ──────────────────────────────────────────
describe('validateDimensions: hollow cylinder', () => {
  it('rejects inner diameter equal to outer diameter', () => {
    const errors = validateDimensions('hollow', {
      outerDiameter: 4,
      innerDiameter: 4,
      length: 10,
    });
    expect(errors.some((e) => e.field === 'innerDiameter')).toBe(true);
  });

  it('rejects inner diameter greater than outer diameter', () => {
    const errors = validateDimensions('hollow', {
      outerDiameter: 4,
      innerDiameter: 5,
      length: 10,
    });
    expect(errors.some((e) => e.field === 'innerDiameter')).toBe(true);
  });

  it('accepts valid hollow dimensions', () => {
    const errors = validateDimensions('hollow', {
      outerDiameter: 4,
      innerDiameter: 2,
      length: 10,
    });
    expect(errors).toHaveLength(0);
  });
});

// ──────────────────────────────────────────
// 6. Mass calculation
// ──────────────────────────────────────────
describe('massGrams', () => {
  it('computes volume × density', () => {
    expect(massGrams(100, 7.85)).toBeCloseTo(785, 5);
  });
});

// ──────────────────────────────────────────
// 7. Input validation: reject invalid values
// ──────────────────────────────────────────
describe('isPositiveFinite', () => {
  it.each([0, -1, NaN, Infinity, -Infinity, null, undefined, '', 'abc'])(
    'rejects %p',
    (val) => {
      expect(isPositiveFinite(val)).toBe(false);
    },
  );

  it.each([0.001, 1, 100, 25.5])('accepts %p', (val) => {
    expect(isPositiveFinite(val)).toBe(true);
  });
});

describe('validateDimensions: solid cylinder', () => {
  it('rejects blank / zero / negative values', () => {
    const errors = validateDimensions('solid', { diameter: 0, length: -5 });
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});

describe('validateDensity', () => {
  it('rejects zero density', () => {
    expect(validateDensity(0)).not.toBeNull();
  });
  it('rejects NaN density', () => {
    expect(validateDensity(NaN)).not.toBeNull();
  });
  it('accepts valid density', () => {
    expect(validateDensity(7.85)).toBeNull();
  });
});

// ──────────────────────────────────────────
// 8. Manual density mode uses exact density
// ──────────────────────────────────────────
describe('calculate: manual density', () => {
  it('uses exactly the entered density', () => {
    const result = calculate({
      shape: 'solid',
      unit: 'cm',
      dimensions: { diameter: 2, length: 10 },
      densityMode: 'manual',
      density: 3.14159,
    });
    expect(result.input.density).toBe(3.14159);
    expect(result.massGrams).toBeCloseTo(31.4159265 * 3.14159, 2);
  });
});

// ──────────────────────────────────────────
// 9. Material mode uses selected density
// ──────────────────────────────────────────
describe('calculate: material mode', () => {
  it('uses the provided material density', () => {
    const result = calculate({
      shape: 'solid',
      unit: 'cm',
      dimensions: { diameter: 2, length: 10 },
      densityMode: 'material',
      materialName: 'Cast iron',
      density: 7.2,
    });
    expect(result.input.density).toBe(7.2);
    expect(result.input.materialName).toBe('Cast iron');
  });
});

// ──────────────────────────────────────────
// 10. Rounding only affects display
// ──────────────────────────────────────────
describe('calculation precision', () => {
  it('internal values are not pre-rounded', () => {
    const result = calculate({
      shape: 'solid',
      unit: 'cm',
      dimensions: { diameter: 2, length: 10 },
      densityMode: 'manual',
      density: 7.2,
    });
    // Volume should be π × 1² × 10 = 31.41592653589793...
    expect(result.volumeCm3).toBeCloseTo(Math.PI * 1 * 1 * 10, 10);
    // Mass = volume × 7.2
    expect(result.massGrams).toBeCloseTo(Math.PI * 10 * 7.2, 10);
  });
});
