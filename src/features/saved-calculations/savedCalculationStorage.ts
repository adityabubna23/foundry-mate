import type { SavedCalculation, CalculationResult } from '../calculator/types';

const SAVED_KEY = 'foundrymate_saved_calculations';

/** Generate a simple unique ID. */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Load all saved calculations from localStorage. */
export function loadSavedCalculations(): SavedCalculation[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

/** Save a calculation with an optional name. */
export function saveCalculation(result: CalculationResult, name?: string): SavedCalculation {
  const saved: SavedCalculation = {
    id: generateId(),
    name: name || `Calculation ${new Date().toLocaleString()}`,
    createdAt: new Date().toISOString(),
    result,
  };
  const all = loadSavedCalculations();
  all.unshift(saved);
  localStorage.setItem(SAVED_KEY, JSON.stringify(all));
  return saved;
}

/** Delete a saved calculation by ID. */
export function deleteSavedCalculation(id: string): void {
  const all = loadSavedCalculations().filter((s) => s.id !== id);
  localStorage.setItem(SAVED_KEY, JSON.stringify(all));
}
