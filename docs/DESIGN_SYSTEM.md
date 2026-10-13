# LabelMitra — Permanent Design System: Premium Food Intelligence

> **Mandatory Reference for All Current & Future Modules**  
> **Application Name:** LabelMitra  
> **Tagline:** Your Friendly Guide to Food Labels  
> **Visual Identity:** Premium Food Intelligence (Deep Forest Green, Warm Gold Accents, Ivory Contrast, Sophisticated Typography, Evidence-Based Clarity)

---

## 1. Core Visual Identity & Principles

The **Premium Food Intelligence** visual direction elevates LabelMitra from a generic dashboard into an authoritative, sophisticated food-tech intelligence platform. It synthesizes:
1. **Premium Nutrition & Wellness Authority:** Organic warmth through dark forest green and refined gold.
2. **Intelligent Food Analysis:** Precise, data-dense layouts with clear hierarchies and subtle surface elevations.
3. **Evidence-Based Scientific Rigor:** Clear differentiation between facts, OCR extracts, uncertainty indicators, and statutory references.
4. **Consumer Elegance:** Polished typography pairing a classic editorial serif for major headings with clean, modern sans-serif for functional UI.

### Permanent Styling Rules
- **NEVER** revert to generic white-and-dark-blue SaaS templates or excessive white cards.
- **NEVER** use purple gradients.
- **NEVER** use pill-shaped buttons; all interactive elements maintain restrained corner radii (`rounded-button` or `rounded-lg`).
- **NEVER** use emoji icons in UI; use consistent Lucide React icons.
- **NEVER** use em dashes in website copy.
- **ALWAYS** preserve accessible contrast ratios between surfaces and text.

---

## 2. Permanent Color Palette & Design Tokens

| Token Name | Hex Code | Purpose / Usage |
|---|---|---|
| `forest-950` / `bg-primary` | `#061F19` | Primary canvas background (deep forest green) |
| `forest-900` / `bg-secondary` | `#0B2B23` | Secondary background, sidebars, panel containers |
| `forest-850` / `surface-card` | `#0D2A22` | Standard card background |
| `forest-800` / `surface-elevated`| `#10362B` | Elevated cards, active pills, modal surfaces |
| `forest-700` / `border-primary` | `#29473A` | Structural borders, dividers, subtle outlines |
| `gold-500` / `accent-primary` | `#E9BD67` | Primary calls to action, important highlights, gold outlines |
| `gold-600` / `accent-muted` | `#B9944D` | Secondary gold accents, active navigation indicators |
| `ivory-100` / `text-primary` | `#F5F0E5` | Primary headline and readable text on dark surfaces |
| `ivory-200` / `panel-editorial` | `#F0E3CB` | Light editorial panels (high contrast summary cards) |
| `ivory-900` / `panel-text` | `#17251D` | Text on light editorial panels |
| `sage-400` / `text-secondary` | `#B8C3B7` | Secondary text, captions, metadata labels |
| `sage-500` / `text-muted` | `#7A8E7D` | Muted descriptions, placeholder text |
| `success` | `#2D9C68` | Pass, Verified, Compliant (accessible muted green) |
| `warning` | `#D99436` | Moderate concern, advisory note (warm amber) |
| `potential-issue` | `#C45A45` | Potential compliance issue, flagged additive (restrained terracotta) |
| `error` | `#B83E3E` | Severe allergen detected, system error (accessible muted red) |

---

## 3. Typography Hierarchy

### Font Families
- **Display & Section Headings:** `'Playfair Display', Georgia, serif`
  - High-impact editorial presence for heroes, section titles, and report headers.
- **Body & Functional UI:** `'Plus Jakarta Sans', Inter, system-ui, sans-serif`
  - High legibility for form controls, ingredient lists, and nutritional tables.
- **Data, Insignias & Codes:** `'JetBrains Mono', monospace`
  - FSSAI license numbers, INS additive numbers (`INS 322`), batch identifiers.

### Typography Scale
- **Display 1 (Hero Title):** `font-serif text-4xl sm:text-5xl lg:text-6xl text-ivory tracking-tight`
- **Section Heading (H2):** `font-serif text-2xl sm:text-3xl text-ivory tracking-tight`
- **Card Heading (H3):** `font-serif text-lg sm:text-xl text-ivory-100 font-bold`
- **Subheading / Label:** `font-sans text-xs uppercase font-semibold tracking-wider text-gold-400`
- **Body Text:** `font-sans text-sm text-sage-400 leading-relaxed`
- **Small / Metadata:** `font-sans text-xs text-sage-500`

---

## 4. Reusable Component Conventions

### 4.1 Buttons
- **Primary Action (Gold):**
  - Classes: `btn-gold` -> `bg-gold-500 hover:bg-gold-600 text-forest-950 font-semibold px-5 py-2.5 rounded-button shadow-sm transition-all duration-150`
- **Secondary Action (Dark Forest Outline):**
  - Classes: `btn-outline-forest` -> `bg-forest-900/60 hover:bg-forest-850 text-ivory border border-forest-700 font-medium px-4 py-2.5 rounded-button transition-all`
- **Muted Danger / Remove:**
  - Classes: `btn-danger-forest` -> `bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/60 text-xs px-3 py-1.5 rounded-button`

### 4.2 Cards & Surfaces
- **Standard Analysis Card:**
  - Container: `bg-forest-850 border border-forest-700/80 rounded-lg p-6 shadow-sm`
- **Featured / Highlighted Card:**
  - Container: `bg-forest-850 border border-gold-500/40 rounded-lg p-6 shadow-md`
- **Light Editorial Panel (for contrast):**
  - Container: `bg-ivory-200 text-ivory-900 border border-gold-600/30 rounded-lg p-6`

### 4.3 Form Controls & Inputs
- Inputs, selects, and textareas:
  - Base: `bg-forest-900 border border-forest-700 text-ivory placeholder-sage-500 rounded-button px-3.5 py-2.5 text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors`

### 4.4 Status Badges
- **Compliant / Pass:** `bg-emerald-950/60 border border-emerald-800 text-emerald-300 px-2.5 py-1 rounded text-xs font-medium`
- **Potential Issue:** `bg-terracotta-950/60 border border-terracotta-800 text-terracotta-300 px-2.5 py-1 rounded text-xs font-medium`
- **Cannot Verify / Notice:** `bg-amber-950/60 border border-amber-800 text-amber-300 px-2.5 py-1 rounded text-xs font-medium`
- **Allergen Alert:** `bg-rose-950/70 border border-rose-800 text-rose-300 px-2.5 py-1 rounded text-xs font-medium`

---

## 5. Guidelines for Future Modules

Whenever adding or modifying screens in subsequent phases (Image Upload, OCR, Extraction, Compliance Engine, RAG, Recommendations, Complaints, Admin):
1. **Always inherit from the forest-green tokens (`#061F19`, `#0B2B23`, `#0D2A22`, `#10362B`).**
2. **Use warm gold (`#E9BD67`) as the signature focal accent for key primary actions.**
3. **Use Playfair Display for major section headers and Plus Jakarta Sans for UI controls.**
4. **Maintain the editorial, trustworthy character of the platform without clutter or juvenile visuals.**
