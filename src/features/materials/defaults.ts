import type { Material } from '../calculator/types';

/** Built-in default materials with approximate densities (g/cm³). */
export const DEFAULT_MATERIALS: Material[] = [
  { name: 'Cast iron', density: 7.20 },
  { name: 'Mild / carbon steel', density: 7.85 },
  { name: 'Stainless steel', density: 8.00 },
  { name: 'Aluminium', density: 2.70 },
  { name: 'Copper', density: 8.96 },
  { name: 'Brass', density: 8.50 },
  { name: 'Bronze', density: 8.80 },
  { name: 'Zinc', density: 7.14 },
  { name: 'Lead', density: 11.34 },
];
