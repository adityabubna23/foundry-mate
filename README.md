# 🔩 Foundry Mate — Metal Weight Calculator

A mobile-first Progressive Web App (PWA) for estimating the weight of **solid and hollow metal cylinders** from dimensions and material density. Built for small metal-casting businesses.

## ✨ Features

- **Solid & Hollow Cylinder** weight calculations
- **9 built-in materials** (Cast iron, Steel, Aluminium, Copper, Brass, etc.)
- **Manual density entry** mode
- **4 measurement units** — mm, cm, m, inches
- **Step-by-step calculation breakdown**
- **Save & reload** calculations locally
- **Custom materials** — add, edit, delete
- **Works offline** after first visit (PWA with service worker)
- **Installable** on Android/iOS home screen

## 🚀 Getting Started

```bash
npm install
npm run dev       # Start dev server at http://localhost:3000
```

## 🧪 Testing

```bash
npm test          # Run all 31 tests
npm run test:watch # Watch mode
```

## 🏗️ Build & Deploy

```bash
npm run build     # TypeScript check + production build
npm run preview   # Preview the production build locally
```

## 📐 Formulas

**Solid cylinder:**
```
V = π × (D/2)² × L
```

**Hollow cylinder:**
```
V = π × L × [(D_outer/2)² − (D_inner/2)²]
```

**Mass:**
```
m = V × ρ (density)
```

All dimensions are converted to centimetres internally. Density is in g/cm³. Full precision is maintained internally; only displayed values are rounded.

## ⚠️ Disclaimer

Results are **estimated weights** assuming geometrically perfect cylinders and solid material. Actual casting weight may differ due to alloy composition, cavities, porosity, surface features, or manufacturing details.

## 🛠️ Tech Stack

- React 19 + TypeScript
- Vite 8
- Vitest (31 tests)
- PWA with Workbox (offline support)
- Vanilla CSS (dark theme)

## 📱 Installation

Open the deployed URL in Chrome on Android, then tap **⋮ → Install app** or the install banner to add it to your home screen.
