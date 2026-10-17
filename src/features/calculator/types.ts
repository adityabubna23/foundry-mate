/** Shape type for cylinder calculations */
export type ShapeType = 'solid' | 'hollow';

/** Supported measurement units */
export type MeasurementUnit = 'mm' | 'cm' | 'm' | 'in';

/** Density mode: choose a material or enter density manually */
export type DensityMode = 'material' | 'manual';

/** A material with a name and density */
export interface Material {
  name: string;
  density: number; // g/cm³
  isCustom?: boolean;
}

/** Dimensions for a solid cylinder */
export interface SolidDimensions {
  diameter: number;
  length: number;
}

/** Dimensions for a hollow cylinder */
export interface HollowDimensions {
  outerDiameter: number;
  innerDiameter: number;
  length: number;
}

/** Input for a calculation */
export interface CalculationInput {
  shape: ShapeType;
  unit: MeasurementUnit;
  dimensions: SolidDimensions | HollowDimensions;
  densityMode: DensityMode;
  materialName?: string;
  density: number; // g/cm³
}

/** Result of a calculation */
export interface CalculationResult {
  volumeCm3: number;
  volumeLitres: number;
  massGrams: number;
  massKg: number;
  massTonnes: number;
  input: CalculationInput;
  steps: CalculationStep[];
}

/** A step in the calculation breakdown */
export interface CalculationStep {
  label: string;
  detail: string;
}

/** A saved calculation */
export interface SavedCalculation {
  id: string;
  name: string;
  createdAt: string;
  result: CalculationResult;
}

/** Validation error for a field */
export interface ValidationError {
  field: string;
  message: string;
}
