import { useState, useCallback, useEffect } from 'react';
import type {
  ShapeType,
  MeasurementUnit,
  DensityMode,
  CalculationResult,
  SolidDimensions,
  HollowDimensions,
  ValidationError,
  SavedCalculation,
  Material,
} from './features/calculator/types';
import { calculate } from './features/calculator/formulas';
import { validateDimensions, validateDensity } from './features/calculator/validation';
import { ALL_UNITS, UNIT_SUFFIX } from './features/calculator/units';
import { getAllMaterials, addCustomMaterial, deleteCustomMaterial, restoreDefaults } from './features/materials/materialStorage';
import {
  loadSavedCalculations,
  saveCalculation,
  deleteSavedCalculation,
} from './features/saved-calculations/savedCalculationStorage';

type Tab = 'calculator' | 'saved';

export default function App() {
  // ─── Navigation ───
  const [tab, setTab] = useState<Tab>('calculator');

  // ─── Shape ───
  const [shape, setShape] = useState<ShapeType>('solid');
  const [unit, setUnit] = useState<MeasurementUnit>('mm');

  // ─── Dimensions (as strings for controlled inputs) ───
  const [diameter, setDiameter] = useState('');
  const [length, setLength] = useState('');
  const [outerDiameter, setOuterDiameter] = useState('');
  const [innerDiameter, setInnerDiameter] = useState('');

  // ─── Density ───
  const [densityMode, setDensityMode] = useState<DensityMode>('material');
  const [materials, setMaterials] = useState<Material[]>(() => getAllMaterials());
  const [selectedMaterial, setSelectedMaterial] = useState<string>('Mild / carbon steel');
  const [manualDensity, setManualDensity] = useState('');

  // ─── Result ───
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [stepsOpen, setStepsOpen] = useState(false);

  // ─── Save ───
  const [saveName, setSaveName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedCalcs, setSavedCalcs] = useState<SavedCalculation[]>([]);

  // ─── Custom material modal ───
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [newMatName, setNewMatName] = useState('');
  const [newMatDensity, setNewMatDensity] = useState('');

  // ─── Confirm delete ───
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ─── Load saved calcs when switching to tab ───
  useEffect(() => {
    if (tab === 'saved') {
      setSavedCalcs(loadSavedCalculations());
    }
  }, [tab]);

  // ─── Refresh materials ───
  const refreshMaterials = useCallback(() => {
    setMaterials(getAllMaterials());
  }, []);

  // ─── Clear stale result when inputs change ───
  useEffect(() => {
    setResult(null);
    setErrors([]);
    setSaveSuccess(false);
  }, [shape, unit, diameter, length, outerDiameter, innerDiameter, densityMode, selectedMaterial, manualDensity]);

  // ─── Get error for a field ───
  const fieldError = (field: string) => errors.find((e) => e.field === field)?.message;

  // ─── Calculate ───
  const handleCalculate = () => {
    // Build dimensions
    const dims =
      shape === 'solid'
        ? { diameter: parseFloat(diameter), length: parseFloat(length) }
        : {
            outerDiameter: parseFloat(outerDiameter),
            innerDiameter: parseFloat(innerDiameter),
            length: parseFloat(length),
          };

    const dimErrors = validateDimensions(shape, dims);

    // Determine density
    let density: number;
    let materialName: string | undefined;
    if (densityMode === 'material') {
      const mat = materials.find((m) => m.name === selectedMaterial);
      density = mat?.density ?? NaN;
      materialName = mat?.name;
    } else {
      density = parseFloat(manualDensity);
    }

    const densityError = validateDensity(density);
    const allErrors = [...dimErrors, ...(densityError ? [densityError] : [])];

    if (allErrors.length > 0) {
      setErrors(allErrors);
      setResult(null);
      return;
    }

    setErrors([]);
    const calcResult = calculate({
      shape,
      unit,
      dimensions: dims as SolidDimensions | HollowDimensions,
      densityMode,
      materialName,
      density,
    });
    setResult(calcResult);
    setStepsOpen(false);
    setSaveSuccess(false);
  };

  // ─── Save ───
  const handleSave = () => {
    if (!result) return;
    saveCalculation(result, saveName || undefined);
    setSaveSuccess(true);
    setSaveName('');
    setSavedCalcs(loadSavedCalculations());
  };

  // ─── Delete saved calc ───
  const handleDelete = (id: string) => {
    deleteSavedCalculation(id);
    setSavedCalcs(loadSavedCalculations());
    setDeleteConfirm(null);
  };

  // ─── Load saved calc ───
  const handleLoad = (saved: SavedCalculation) => {
    const { input } = saved.result;
    setShape(input.shape);
    setUnit(input.unit);
    setDensityMode(input.densityMode);

    if (input.shape === 'solid') {
      const d = input.dimensions as SolidDimensions;
      setDiameter(d.diameter.toString());
      setLength(d.length.toString());
    } else {
      const d = input.dimensions as HollowDimensions;
      setOuterDiameter(d.outerDiameter.toString());
      setInnerDiameter(d.innerDiameter.toString());
      setLength(d.length.toString());
    }

    if (input.densityMode === 'material' && input.materialName) {
      setSelectedMaterial(input.materialName);
    } else {
      setManualDensity(input.density.toString());
    }

    setTab('calculator');
    // Result will be cleared by effect; user can recalculate
  };

  // ─── Add custom material ───
  const handleAddMaterial = () => {
    const d = parseFloat(newMatDensity);
    if (!newMatName.trim() || !Number.isFinite(d) || d <= 0) return;
    addCustomMaterial({ name: newMatName.trim(), density: d });
    refreshMaterials();
    setSelectedMaterial(newMatName.trim());
    setNewMatName('');
    setNewMatDensity('');
    setShowAddMaterial(false);
  };

  // ─── Delete custom material ───
  const handleDeleteMaterial = (name: string) => {
    deleteCustomMaterial(name);
    refreshMaterials();
    if (selectedMaterial === name) {
      setSelectedMaterial('Mild / carbon steel');
    }
  };

  // ─── Restore default materials ───
  const handleRestoreDefaults = () => {
    restoreDefaults();
    refreshMaterials();
    setSelectedMaterial('Mild / carbon steel');
  };

  const customMaterials = materials.filter((m) => m.isCustom);
  const u = UNIT_SUFFIX[unit];

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <span className="header__icon">🔩</span>
        <h1 className="header__title">Foundry Mate</h1>
        <p className="header__subtitle">Metal Weight Calculator</p>
      </header>

      {/* Navigation */}
      <nav className="nav-tabs" role="tablist">
        <button
          className={`nav-tab ${tab === 'calculator' ? 'nav-tab--active' : ''}`}
          onClick={() => setTab('calculator')}
          role="tab"
          aria-selected={tab === 'calculator'}
          id="tab-calculator"
        >
          ⚙️ Calculator
        </button>
        <button
          className={`nav-tab ${tab === 'saved' ? 'nav-tab--active' : ''}`}
          onClick={() => setTab('saved')}
          role="tab"
          aria-selected={tab === 'saved'}
          id="tab-saved"
        >
          📋 Saved
        </button>
      </nav>

      {/* ═══════════ CALCULATOR TAB ═══════════ */}
      {tab === 'calculator' && (
        <>
          {/* Shape Toggle */}
          <div className="shape-toggle" role="radiogroup" aria-label="Cylinder type">
            <button
              className={`shape-card ${shape === 'solid' ? 'shape-card--active' : ''}`}
              onClick={() => setShape('solid')}
              role="radio"
              aria-checked={shape === 'solid'}
              id="shape-solid"
            >
              <span className="shape-card__icon">⬤</span>
              <span className="shape-card__label">Solid Cylinder</span>
            </button>
            <button
              className={`shape-card ${shape === 'hollow' ? 'shape-card--active' : ''}`}
              onClick={() => setShape('hollow')}
              role="radio"
              aria-checked={shape === 'hollow'}
              id="shape-hollow"
            >
              <span className="shape-card__icon">◯</span>
              <span className="shape-card__label">Hollow Cylinder</span>
            </button>
          </div>

          {/* Unit Picker */}
          <div className="card">
            <div className="card__heading">📏 Measurement Unit</div>
            <div className="unit-picker" role="radiogroup" aria-label="Measurement unit">
              {ALL_UNITS.map((u) => (
                <button
                  key={u}
                  className={`unit-btn ${unit === u ? 'unit-btn--active' : ''}`}
                  onClick={() => setUnit(u)}
                  role="radio"
                  aria-checked={unit === u}
                  id={`unit-${u}`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div className="card">
            <div className="card__heading">📐 Dimensions</div>

            {shape === 'solid' ? (
              <>
                <div className="field">
                  <label className="field__label" htmlFor="input-diameter">
                    Diameter
                  </label>
                  <div className="field__input-wrap">
                    <input
                      id="input-diameter"
                      className={`field__input ${fieldError('diameter') ? 'field__input--error' : ''}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      value={diameter}
                      onChange={(e) => setDiameter(e.target.value)}
                      placeholder="e.g. 100"
                    />
                    <span className="field__unit">{u}</span>
                  </div>
                  {fieldError('diameter') && <p className="field__error">{fieldError('diameter')}</p>}
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="input-length">
                    Length
                  </label>
                  <div className="field__input-wrap">
                    <input
                      id="input-length"
                      className={`field__input ${fieldError('length') ? 'field__input--error' : ''}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      placeholder="e.g. 200"
                    />
                    <span className="field__unit">{u}</span>
                  </div>
                  {fieldError('length') && <p className="field__error">{fieldError('length')}</p>}
                </div>
              </>
            ) : (
              <>
                <div className="field">
                  <label className="field__label" htmlFor="input-outer-diameter">
                    Outer Diameter
                  </label>
                  <div className="field__input-wrap">
                    <input
                      id="input-outer-diameter"
                      className={`field__input ${fieldError('outerDiameter') ? 'field__input--error' : ''}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      value={outerDiameter}
                      onChange={(e) => setOuterDiameter(e.target.value)}
                      placeholder="e.g. 150"
                    />
                    <span className="field__unit">{u}</span>
                  </div>
                  {fieldError('outerDiameter') && (
                    <p className="field__error">{fieldError('outerDiameter')}</p>
                  )}
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="input-inner-diameter">
                    Inner Diameter
                  </label>
                  <div className="field__input-wrap">
                    <input
                      id="input-inner-diameter"
                      className={`field__input ${fieldError('innerDiameter') ? 'field__input--error' : ''}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      value={innerDiameter}
                      onChange={(e) => setInnerDiameter(e.target.value)}
                      placeholder="e.g. 100"
                    />
                    <span className="field__unit">{u}</span>
                  </div>
                  {fieldError('innerDiameter') && (
                    <p className="field__error">{fieldError('innerDiameter')}</p>
                  )}
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="input-hollow-length">
                    Length
                  </label>
                  <div className="field__input-wrap">
                    <input
                      id="input-hollow-length"
                      className={`field__input ${fieldError('length') ? 'field__input--error' : ''}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      placeholder="e.g. 200"
                    />
                    <span className="field__unit">{u}</span>
                  </div>
                  {fieldError('length') && <p className="field__error">{fieldError('length')}</p>}
                </div>
              </>
            )}
          </div>

          {/* Material / Density */}
          <div className="card">
            <div className="card__heading">🧪 Material &amp; Density</div>

            <div className="density-toggle">
              <button
                className={`density-toggle__btn ${densityMode === 'material' ? 'density-toggle__btn--active' : ''}`}
                onClick={() => setDensityMode('material')}
                id="density-mode-material"
              >
                Choose Material
              </button>
              <button
                className={`density-toggle__btn ${densityMode === 'manual' ? 'density-toggle__btn--active' : ''}`}
                onClick={() => setDensityMode('manual')}
                id="density-mode-manual"
              >
                Enter Density
              </button>
            </div>

            {densityMode === 'material' ? (
              <>
                <div className="field">
                  <label className="field__label" htmlFor="select-material">
                    Material
                  </label>
                  <select
                    id="select-material"
                    className="select"
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                  >
                    {materials.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name} — {m.density} g/cm³{m.isCustom ? ' ★' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="btn-sm"
                  onClick={() => setShowAddMaterial(true)}
                  style={{ marginTop: '8px' }}
                  id="btn-add-material"
                >
                  + Add Custom Material
                </button>

                {customMaterials.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div className="card__heading" style={{ marginBottom: '8px' }}>Custom Materials</div>
                    {customMaterials.map((m) => (
                      <div key={m.name} className="material-chip">
                        <span className="material-chip__info">
                          <span className="material-chip__name">{m.name}</span>
                          <span className="material-chip__density">{m.density} g/cm³</span>
                        </span>
                        <button
                          className="material-chip__delete"
                          onClick={() => handleDeleteMaterial(m.name)}
                          aria-label={`Delete ${m.name}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button className="btn-restore" onClick={handleRestoreDefaults} id="btn-restore-defaults">
                      Restore Defaults Only
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="field">
                <label className="field__label" htmlFor="input-density">
                  Density (g/cm³)
                </label>
                <div className="field__input-wrap">
                  <input
                    id="input-density"
                    className={`field__input ${fieldError('density') ? 'field__input--error' : ''}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    value={manualDensity}
                    onChange={(e) => setManualDensity(e.target.value)}
                    placeholder="e.g. 7.85"
                  />
                  <span className="field__unit">g/cm³</span>
                </div>
                {fieldError('density') && <p className="field__error">{fieldError('density')}</p>}
                <p className="density-hint">
                  Use the density supplied by your material vendor or technical specification.
                </p>
              </div>
            )}
          </div>

          {/* Calculate Button */}
          <button className="calc-btn" onClick={handleCalculate} id="btn-calculate">
            ⚡ Calculate Weight
          </button>

          {/* Result */}
          {result && (
            <div className="result-card" id="result-card">
              <p className="result-card__label">Estimated Weight</p>
              <p className="result-card__value">{result.massKg.toFixed(3)} kg</p>
              <p className="result-card__secondary">
                {result.massGrams.toFixed(2)} grams
                {result.massTonnes >= 0.001 && ` · ${result.massTonnes.toFixed(4)} tonnes`}
              </p>

              <div className="result-details">
                <div className="result-detail">
                  <p className="result-detail__label">Volume</p>
                  <p className="result-detail__value">
                    {result.volumeCm3.toFixed(3)} cm³
                    {result.volumeLitres >= 0.01 && <><br />{result.volumeLitres.toFixed(3)} L</>}
                  </p>
                </div>
                <div className="result-detail">
                  <p className="result-detail__label">Shape</p>
                  <p className="result-detail__value">
                    {result.input.shape === 'solid' ? 'Solid Cylinder' : 'Hollow Cylinder'}
                  </p>
                </div>
                <div className="result-detail">
                  <p className="result-detail__label">Dimensions</p>
                  <p className="result-detail__value">
                    {result.input.shape === 'solid'
                      ? `Ø${(result.input.dimensions as SolidDimensions).diameter} × ${(result.input.dimensions as SolidDimensions).length} ${UNIT_SUFFIX[result.input.unit]}`
                      : `Ø${(result.input.dimensions as HollowDimensions).outerDiameter}/${(result.input.dimensions as HollowDimensions).innerDiameter} × ${(result.input.dimensions as HollowDimensions).length} ${UNIT_SUFFIX[result.input.unit]}`}
                  </p>
                </div>
                <div className="result-detail">
                  <p className="result-detail__label">
                    {result.input.densityMode === 'material' ? 'Material' : 'Manual Density'}
                  </p>
                  <p className="result-detail__value">
                    {result.input.materialName || 'Manual'}
                    <br />
                    {result.input.density} g/cm³
                  </p>
                </div>
              </div>

              {/* Steps */}
              <button className="steps-toggle" onClick={() => setStepsOpen(!stepsOpen)} id="btn-toggle-steps">
                {stepsOpen ? '▾' : '▸'} {stepsOpen ? 'Hide' : 'Show'} calculation steps
              </button>
              {stepsOpen && (
                <ol className="steps-list">
                  {result.steps.map((step, i) => (
                    <li key={i} className="step-item">
                      <p className="step-item__num">Step {i + 1}</p>
                      <p className="step-item__label">{step.label}</p>
                      <p className="step-item__detail">{step.detail}</p>
                    </li>
                  ))}
                </ol>
              )}

              {/* Disclaimer */}
              <div className="disclaimer">
                ⚠️ This is an <strong>estimated weight</strong> assuming a geometrically perfect cylinder
                and solid material (except the modelled hollow centre). Actual casting weight may differ
                due to alloy composition, cavities, porosity, surface features, or manufacturing details.
              </div>

              {/* Save */}
              <div className="save-row">
                <input
                  className="save-input"
                  type="text"
                  placeholder="Name (optional)"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  id="input-save-name"
                />
                <button className="btn-save" onClick={handleSave} id="btn-save">
                  💾 Save
                </button>
              </div>
              {saveSuccess && <p className="save-success">✓ Calculation saved!</p>}
            </div>
          )}
        </>
      )}

      {/* ═══════════ SAVED TAB ═══════════ */}
      {tab === 'saved' && (
        <>
          {savedCalcs.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state__icon">📋</p>
              <p className="empty-state__text">No saved calculations yet</p>
              <p className="empty-state__hint">
                Calculate a weight and tap Save to keep it here.
                <br />
                Data is stored on this device and may be lost if browser data is cleared.
              </p>
            </div>
          ) : (
            <ul className="saved-list">
              {savedCalcs.map((sc) => (
                <li key={sc.id} className="saved-item">
                  <div className="saved-item__header">
                    <span className="saved-item__name">{sc.name}</span>
                    <span className="saved-item__date">
                      {new Date(sc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="saved-item__info">
                    {sc.result.input.shape === 'solid' ? 'Solid' : 'Hollow'} ·{' '}
                    {sc.result.input.materialName || 'Manual density'} ·{' '}
                    {sc.result.input.density} g/cm³
                  </p>
                  <p className="saved-item__weight">{sc.result.massKg.toFixed(3)} kg</p>
                  <div className="saved-item__actions">
                    <button className="btn-sm" onClick={() => handleLoad(sc)}>
                      🔄 Load
                    </button>
                    <button
                      className="btn-sm btn-sm--danger"
                      onClick={() => setDeleteConfirm(sc.id)}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* ═══════════ ADD MATERIAL MODAL ═══════════ */}
      {showAddMaterial && (
        <div className="modal-overlay" onClick={() => setShowAddMaterial(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__title">Add Custom Material</h2>
            <div className="field">
              <label className="field__label" htmlFor="input-new-mat-name">
                Material Name
              </label>
              <input
                id="input-new-mat-name"
                className="field__input"
                type="text"
                value={newMatName}
                onChange={(e) => setNewMatName(e.target.value)}
                placeholder="e.g. Inconel 718"
              />
            </div>
            <div className="field" style={{ marginTop: '12px' }}>
              <label className="field__label" htmlFor="input-new-mat-density">
                Density (g/cm³)
              </label>
              <input
                id="input-new-mat-density"
                className="field__input"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={newMatDensity}
                onChange={(e) => setNewMatDensity(e.target.value)}
                placeholder="e.g. 8.19"
              />
            </div>
            <div className="modal__actions">
              <button className="btn-outline" onClick={() => setShowAddMaterial(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleAddMaterial} id="btn-confirm-add-material">
                Add Material
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ DELETE CONFIRM MODAL ═══════════ */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__title">Delete Calculation?</h2>
            <p className="confirm-text">
              This will permanently remove this saved calculation from your device. This action cannot be undone.
            </p>
            <div className="modal__actions">
              <button className="btn-outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)} id="btn-confirm-delete">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
