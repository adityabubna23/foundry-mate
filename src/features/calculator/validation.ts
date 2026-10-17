import type {
  ShapeType,
  SolidDimensions,
  HollowDimensions,
  ValidationError,
} from './types';

/** Check whether a value is a finite positive number. */
export function isPositiveFinite(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v > 0;
}

/**
 * Validate dimensions for the given shape.
 * Returns an empty array when everything is valid.
 */
export function validateDimensions(
  shape: ShapeType,
  dims: Partial<SolidDimensions & HollowDimensions>,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (shape === 'solid') {
    if (!isPositiveFinite(dims.diameter)) {
      errors.push({ field: 'diameter', message: 'Enter a diameter greater than zero.' });
    }
    if (!isPositiveFinite(dims.length)) {
      errors.push({ field: 'length', message: 'Enter the cylinder length.' });
    }
  } else {
    if (!isPositiveFinite(dims.outerDiameter)) {
      errors.push({ field: 'outerDiameter', message: 'Enter an outer diameter greater than zero.' });
    }
    if (!isPositiveFinite(dims.innerDiameter)) {
      errors.push({ field: 'innerDiameter', message: 'Enter an inner diameter greater than zero.' });
    }
    if (!isPositiveFinite(dims.length)) {
      errors.push({ field: 'length', message: 'Enter the cylinder length.' });
    }
    // Both diameters valid → check relationship
    if (
      isPositiveFinite(dims.outerDiameter) &&
      isPositiveFinite(dims.innerDiameter) &&
      dims.innerDiameter! >= dims.outerDiameter!
    ) {
      errors.push({
        field: 'innerDiameter',
        message: 'Inner diameter must be smaller than outer diameter.',
      });
    }
  }

  return errors;
}

/** Validate a density value. */
export function validateDensity(density: unknown): ValidationError | null {
  if (!isPositiveFinite(density)) {
    return { field: 'density', message: 'Enter a valid density greater than zero.' };
  }
  return null;
}
