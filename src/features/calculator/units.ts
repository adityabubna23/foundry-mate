import type { MeasurementUnit } from './types';

/**
 * Conversion factors to centimetres.
 * All dimension inputs are converted to cm before volume calculation.
 */
const TO_CM: Record<MeasurementUnit, number> = {
  mm: 0.1,       // divide by 10
  cm: 1,         // unchanged
  m: 100,        // multiply by 100
  in: 2.54,      // multiply by 2.54
};

/** Convert a value in the given unit to centimetres. */
export function toCm(value: number, unit: MeasurementUnit): number {
  return value * TO_CM[unit];
}

/** Human-readable label for each unit */
export const UNIT_LABELS: Record<MeasurementUnit, string> = {
  mm: 'Millimetres (mm)',
  cm: 'Centimetres (cm)',
  m: 'Metres (m)',
  in: 'Inches (in)',
};

/** Short suffix for inputs */
export const UNIT_SUFFIX: Record<MeasurementUnit, string> = {
  mm: 'mm',
  cm: 'cm',
  m: 'm',
  in: 'in',
};

/** All supported units in display order */
export const ALL_UNITS: MeasurementUnit[] = ['mm', 'cm', 'm', 'in'];
