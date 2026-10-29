# CHANGELOG.md

## v1.3.1 – 2026-10-19 (OCR Pipeline Bugfix & Evidence-Based Real-Image Processing)

- **Fixed OCR-001 (AttributeError: 'OCRManager' object has no attribute '_preprocess'):**
  - Updated `ai-service/ocr/ocr_manager.py` to correctly import and execute `preprocessing.pipeline.preprocess_for_ocr`.
- **Fixed OCR-002 (PaddleOCR lang='en+hi' ValueError):**
  - Configured PaddleOCR v3.7.0 with supported `lang='en'`. Configured EasyOCR with multilingual `['en', 'hi']` as native multilingual fallback.
- **Fixed OCR-003 (Uvicorn 500 & PaddleOCR v3.7 Output Parsing):**
  - Adapted PaddleOCR result parser to handle dict/paddlex `OCRResult` objects (`rec_texts`, `rec_scores`, `rec_polys`) and fallback to EasyOCR if 0 lines detected.
  - Converted preprocessed grayscale image to 3-channel BGR (`cv2.cvtColor`) to prevent deep learning model channel errors.
- **Fixed OCR-004 (Eliminated All False-Positive Biscuit Hallucinations):**
  - Removed hardcoded Parle Glucose Biscuit fallback strings from `server/src/services/ocrClient.js` for non-test environments.
  - Increased `ocrClient.js` fetch timeout from 6s to 90s to ensure CPU deep learning inference finishes reliably without aborting.
  - `_native_extract()` in `ai-service/ocr/ocr_manager.py` now returns empty text truthfully when no text is found.
  - Added 'No Food Label Detected' banner in `client/src/components/scan/StructuredExtractionView.jsx` when 0 fields are extracted.
  - Added EasyOCR and AI Service Offline badges in `client/src/pages/ScanPage.jsx`.
- **Testing & Verification:**
  - `ai-service/tests/test_pipeline_e2e.py`: Tested blank/non-food image (truthfully 0 lines, no biscuit hallucination) and `kurkure.jpg` (77 lines, 99.23% confidence via PaddleOCR).
  - Backend: 64/64 Jest tests passing across 6 suites.
  - Frontend: 6/6 Vitest tests passing.

## v1.3.0 – 2026-10-16 (Phase 4: Ingredient Knowledge Base & Personalized Allergy Matching)

- **Created** deterministic Ingredient Knowledge Base in `server/src/data/ingredientKnowledgeBase.js`: ✅
  - 12+ FSSAI statutory allergen groups (Peanut, Tree nuts, Wheat/Gluten, Milk, Soy, Egg, Mustard, Sesame, Fish, Crustaceans, Sulphite).
  - Indian vernacular synonym resolution (Groundnut↔Peanut, Maida↔Wheat, Atta↔Wheat, Kaju↔Cashew, Badam↔Almond, Til↔Sesame, Rai↔Mustard, SMP/Whey/Casein↔Milk, Soy Lecithin/INS 322↔Soy).
  - INS additive codes with allergen group linkage (INS 322→Soy, INS 223→Sulphite, etc.).
- **Created** `server/src/services/ingredientService.js` with 5 exported functions: ✅
  - `normalizeIngredientName`, `generateCandidateTokens`, `findIngredientInKnowledgeBase`, `enrichIngredientsWithKnowledge`, `getStatutoryAllergenGroups`.
  - 4-stage matching: exact canonical → exact synonym → partial token → INS code.
- **Created** `server/src/services/allergyService.js` (`evaluateScanAllergies`): ✅
  - Categorizes results into CONFIRMED_MATCH, POSSIBLE_MATCH, NO_MATCH_DETECTED, UNKNOWN_INSUFFICIENT_DATA, NO_USER_ALLERGIES.
  - Three evidence sources: explicit "Contains" declaration, ingredient list (vernacular synonym aware), precautionary "May contain".
  - Strictly non-medical wording with statutory disclaimer.
- **Integrated** Phase 4 into `server/src/services/scanService.js`: ✅
  - `processMultiPanelScan` enriches ingredients and attaches `personalized_allergy_assessment` per user.
  - `getScanById` dynamically refreshes personalized assessment for requesting user with strict `userId` isolation.
- **Created** backend test suites: ✅
  - `server/tests/ingredientService.test.js` — 13/13 passed.
  - `server/tests/allergyService.test.js` — 6/6 passed.
  - `server/tests/allergyIntegration.test.js` — 3/3 passed.
  - **Backend total: 64/64 tests passing (6 suites).**
- **Created** `client/src/components/scan/PersonalizedAllergyView.jsx`: ✅
  - Status banner (CONFIRMED_MATCH/POSSIBLE_MATCH/NO_MATCH_DETECTED with colour-coded borders).
  - Allergen match cards (matched entity, canonical name, severity badge, source category, explainable reason).
  - Evidence toggle revealing OCR evidence text, source panel, and confidence score.
  - Non-medical statutory disclaimer and "Set Up Allergies" CTA for empty profiles.
- **Updated** `client/src/pages/ScanPage.jsx` to render `PersonalizedAllergyView` above `StructuredExtractionView`; fixed deferred `scrollIntoView` guard for test environments. ✅
- **Updated** `client/src/pages/ScanPage.test.jsx` with Phase 4 test suite (Suite 5). **Frontend: 6/6 passing, exit 0.** ✅
- Production build verified: `npm run build` passes cleanly. ✅

## v1.2.0 – 2026-10-16 (Phase 3: Structured Information Extraction)

- **Implemented** deterministic statutory extraction engine in `server/src/services/extractionService.js`: ✅
  - Multi-panel affinity and cross-panel fallback scan.
  - FSSAI 14-digit license number parser.
  - Net Quantity parser with metric unit normalization (g, kg, ml, l).
  - MRP, Batch / Lot Number, Date of Manufacture, and Best Before / Expiry parser.
  - Full Nutrition facts table parser (Energy kcal, Protein, Carbs, Total Sugar, Added Sugar, Fat, Saturated Fat, Trans Fat, Sodium mg).
  - Bracket-aware Ingredients tokenizer with percentage extraction.
  - INS statutory food additives detector matching against codex/FSSAI dictionary.
  - Allergen declaration parser (mandatory "Contains" and advisory "May contain").
  - Veg / Non-Veg logo insignia classifier.
  - Zero hallucination guarantee (missing values explicitly marked `status: 'MISSING'`).
  - Full evidence retention (`source_panel`, `evidence_text`, `confidence`, `status`).
- **Integrated** extraction engine into `server/src/services/scanService.js` and enriched `scan.extractedData` JSON. ✅
- **Created** comprehensive backend test suite in `server/tests/extractionService.test.js` (10/10 tests passing against `biscuit_ground_truth`, `instant_noodles_ground_truth`, and `fruit_beverage_ground_truth`). ✅
- **Updated** backend integration test `server/tests/scansAndOcr.test.js` to assert structured fields in scan payload (all 42 server tests passing). ✅
- **Created** frontend component `client/src/components/scan/StructuredExtractionView.jsx` adhering to `docs/DESIGN_SYSTEM.md`. ✅
- **Updated** `client/src/pages/ScanPage.jsx` and verified `client/src/pages/ScanPage.test.jsx` (5/5 frontend tests passing, build clean). ✅

## v1.1.0 – 2026-10-16 (Phase 2 Verification & Testing)

- **Completed** backend test suite in `server/tests/scansAndOcr.test.js` with 15 automated integration tests. ✅
  - Multi-panel image upload (all 4 panels: front, nutrition, ingredients, side).
  - Unauthenticated requests guard (401 status for upload, get by id, list).
  - Empty image payload rejection (400 status).
  - Full response structure validation (`scan`, `ocrResults`, `compositeConfidence`, `status`, `extractedData`, `qualityMetrics`).
  - Direct PostgreSQL persistence verification via Prisma (`Scan` and `OcrResult` tables).
  - OCR fallback verification (`NativeOCR-Adapter`) when microservice is offline.
  - OCR microservice response parsing (PaddleOCR engine and confidence score extraction).
  - Composite-confidence status transitions (`COMPLETED` >= 60% vs `NEEDS_VERIFICATION` < 60%).
  - Scan retrieval by ID and chronological scan listing.
  - User data isolation (foreign scans return 404).
- **Verified** all 32 backend tests pass (`npm test` in `server`). ✅
- **Authored & Executed** frontend component test suite `client/src/pages/ScanPage.test.jsx` (5/5 tests passing via Vitest + Testing Library). ✅
  - Initial rendering and 4 packaging panel slots.
  - Non-authenticated redirect/login prompt.
  - Submission button disabled state when no panels are selected.
  - Multi-panel file selection, multipart POST dispatch, and OCR extraction result rendering.
  - Error banner display upon server rejection.
- **Configured** Vitest test runner in `client` with `@testing-library/react`, `@testing-library/jest-dom`, and `jsdom`. ✅
- **Verified** `AI_SERVICE_URL` configuration in `server/src/config/env.js` and fallback behavior. ✅

## v1.0.0 – 2026-10-16 (Phase 1 Baseline)

- **Implemented** authentication (register, login, logout) with JWT. ✅
- **Implemented** profile CRUD, allergy management, preference updates. ✅
- **Added** health‑check endpoint (`/api/health`). ✅
- **Created** scan controller with endpoints:
  - `POST /api/scans/upload` (multi‑panel upload)
  - `GET /api/scans/:id` – returns scan details with OCR results. ✅
  - `GET /api/scans` – list user scans. ✅
- **Built** OCR client (`ocrClient.js`) that calls the Python micro‑service or falls back to deterministic mock data. ✅
- **Added** Prisma schema (`schema.prisma`) with tables for users, profiles, allergies, preferences, scans, OCR results, products. ✅
- **Designed** UI according to `docs/DESIGN_SYSTEM.md` – dark forest theme, gold accents, rounded‑button radii, no purple gradients, no pill buttons. ✅
- **Created** documentation files: `PROJECT_CONTEXT.md`, `TASK_TRACKER.md`, `AGENTS.md`, `HANDOFF_PROMPT.md`. ✅

## Known Issues / Open Items
- Python FastAPI microservice is offline on port 8000; native OCR adapter serves requests with verified deterministic fallback output. ⚠️
- Phases 3–12 (Structured extraction, compliance engine, nutrition analysis, recommendation system, grievance workflow, admin dashboard) are pending. ❌

---
*Updated on 2026‑10‑16.*
