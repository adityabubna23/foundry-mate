import type { Material } from '../calculator/types';
import { DEFAULT_MATERIALS } from './defaults';

const CUSTOM_MATERIALS_KEY = 'foundrymate_custom_materials';

/** Load custom materials from localStorage. */
export function loadCustomMaterials(): Material[] {
  try {
    const raw = localStorage.getItem(CUSTOM_MATERIALS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m: unknown) =>
        typeof m === 'object' &&
        m !== null &&
        typeof (m as Material).name === 'string' &&
        typeof (m as Material).density === 'number' &&
        (m as Material).density > 0,
    ).map((m: Material) => ({ ...m, isCustom: true }));
  } catch {
    return [];
  }
}

/** Save custom materials to localStorage. */
export function saveCustomMaterials(materials: Material[]): void {
  localStorage.setItem(
    CUSTOM_MATERIALS_KEY,
    JSON.stringify(materials.map(({ name, density }) => ({ name, density }))),
  );
}

/** Get all materials: defaults + custom. */
export function getAllMaterials(): Material[] {
  return [...DEFAULT_MATERIALS, ...loadCustomMaterials()];
}

/** Add a custom material. */
export function addCustomMaterial(material: Material): void {
  const customs = loadCustomMaterials();
  customs.push({ name: material.name, density: material.density, isCustom: true });
  saveCustomMaterials(customs);
}

/** Delete a custom material by name. */
export function deleteCustomMaterial(name: string): void {
  const customs = loadCustomMaterials().filter((m) => m.name !== name);
  saveCustomMaterials(customs);
}

/** Restore to defaults only (clear all custom materials). */
export function restoreDefaults(): void {
  localStorage.removeItem(CUSTOM_MATERIALS_KEY);
}
