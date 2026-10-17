import type {
  CalculationInput,
  CalculationResult,
  CalculationStep,
  SolidDimensions,
  HollowDimensions,
} from './types';
import { toCm, UNIT_SUFFIX } from './units';

/**
 * Calculate the volume (cm³) of a solid cylinder.
 * V = π × (D/2)² × L   (all in cm)
 */
export function solidCylinderVolume(diameterCm: number, lengthCm: number): number {
  const radius = diameterCm / 2;
  return Math.PI * radius * radius * lengthCm;
}

/**
 * Calculate the volume (cm³) of a hollow cylinder.
 * V = π × L × [(Do/2)² − (Di/2)²]   (all in cm)
 */
export function hollowCylinderVolume(
  outerDiameterCm: number,
  innerDiameterCm: number,
  lengthCm: number,
): number {
  const outerR = outerDiameterCm / 2;
  const innerR = innerDiameterCm / 2;
  return Math.PI * lengthCm * (outerR * outerR - innerR * innerR);
}

/** Mass in grams from volume (cm³) and density (g/cm³). */
export function massGrams(volumeCm3: number, densityGcm3: number): number {
  return volumeCm3 * densityGcm3;
}

/**
 * Run a full calculation and return the result with step-by-step breakdown.
 */
export function calculate(input: CalculationInput): CalculationResult {
  const { shape, unit, dimensions, density } = input;
  const steps: CalculationStep[] = [];
  const u = UNIT_SUFFIX[unit];

  let volumeCm3: number;

  if (shape === 'solid') {
    const d = (dimensions as SolidDimensions).diameter;
    const l = (dimensions as SolidDimensions).length;
    const dCm = toCm(d, unit);
    const lCm = toCm(l, unit);

    steps.push({
      label: 'Convert dimensions to centimetres',
      detail: `Diameter: ${d} ${u} → ${fmtNum(dCm)} cm\nLength: ${l} ${u} → ${fmtNum(lCm)} cm`,
    });

    volumeCm3 = solidCylinderVolume(dCm, lCm);

    steps.push({
      label: 'Calculate volume',
      detail: `V = π × (${fmtNum(dCm)} / 2)² × ${fmtNum(lCm)}\nV = ${fmtNum(volumeCm3)} cm³`,
    });
  } else {
    const od = (dimensions as HollowDimensions).outerDiameter;
    const id = (dimensions as HollowDimensions).innerDiameter;
    const l = (dimensions as HollowDimensions).length;
    const odCm = toCm(od, unit);
    const idCm = toCm(id, unit);
    const lCm = toCm(l, unit);

    steps.push({
      label: 'Convert dimensions to centimetres',
      detail: `Outer Ø: ${od} ${u} → ${fmtNum(odCm)} cm\nInner Ø: ${id} ${u} → ${fmtNum(idCm)} cm\nLength: ${l} ${u} → ${fmtNum(lCm)} cm`,
    });

    volumeCm3 = hollowCylinderVolume(odCm, idCm, lCm);

    steps.push({
      label: 'Calculate volume',
      detail: `V = π × ${fmtNum(lCm)} × [(${fmtNum(odCm)}/2)² − (${fmtNum(idCm)}/2)²]\nV = ${fmtNum(volumeCm3)} cm³`,
    });
  }

  const grams = massGrams(volumeCm3, density);
  const kg = grams / 1000;
  const tonnes = kg / 1000;
  const litres = volumeCm3 / 1000;

  steps.push({
    label: 'Calculate mass',
    detail: `Mass = ${fmtNum(volumeCm3)} cm³ × ${density} g/cm³ = ${fmtNum(grams)} g`,
  });

  steps.push({
    label: 'Convert to kilograms',
    detail: `${fmtNum(grams)} g ÷ 1000 = ${fmtNum(kg)} kg`,
  });

  return {
    volumeCm3,
    volumeLitres: litres,
    massGrams: grams,
    massKg: kg,
    massTonnes: tonnes,
    input,
    steps,
  };
}

/** Format a number for display (up to 4 significant decimals). */
function fmtNum(n: number): string {
  // Use up to 4 decimal places, strip trailing zeros
  return parseFloat(n.toFixed(4)).toString();
}
