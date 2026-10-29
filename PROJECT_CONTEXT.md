# PROJECT_CONTEXT.md

## Project Name & Purpose
LabelMitra – AI‑Powered Food Label Analysis platform. The app lets users upload packaging panel images, extracts text via OCR, validates statutory FSSAI rules, matches ingredients against a personal allergy profile and presents explainable compliance results.

## Objectives & Requirements
- **Core flow**: Auth → Profile → Scan upload → OCR → Rule engine → Results.
- **Authentication**: Email + password (JWT, stateless).
- **Profile**: Full name, age group, dietary preference, allergy list, nutrition preferences.
- **Scan pipeline** (Phase 2): Multi‑panel upload (`front`, `nutrition`, `ingredients`, `side`). OCR performed by a Python FastAPI service (`config.aiServiceUrl`). Fallback native OCR adapter if service unavailable.
- **Compliance engine** (Phase 6): Deterministic FSSAI rule checks, no hallucination.
- **UI**: React 18 + Vite, Tailwind‑CSS, Lucide icons, dark‑forest theme, gold accents (see `docs/DESIGN_SYSTEM.md`). No pill buttons, no purple gradients.
- **Database**: PostgreSQL via Prisma. Tables include `User`, `UserProfile`, `Allergy`, `Preference`, `Scan`, `OcrResult`, `Product`.
- **APIs**: See `server/src/routes/*` for endpoints.
- **Testing**: Jest + Supertest for backend (42 tests passing); Vitest + React Testing Library for frontend (5 tests passing).
- **Configuration**: `.env.example` provides `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `AI_SERVICE_URL`. Real values are stored in `.env` (not committed).
- **Design constraints**: Follow the permanent design system (dark forest green palette, gold primary actions, rounded‑button radii, accessible contrast). All components must use the tokens defined in `docs/DESIGN_SYSTEM.md`.

## Technology Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide‑React, React‑Router, Axios, Vitest, Testing Library.
- **Backend**: Node 18, Express 4, Prisma 5, PostgreSQL 15, Zod, JWT, Multer, Jest, Supertest.
- **AI Micro‑service**: Python FastAPI, PaddleOCR, OpenCV.
- **Testing**: Jest, Supertest, cross‑env, Vitest.

## Folder Structure (root)
```
LabelMitra/
├─ client/            # React front‑end
│   ├─ src/
│   │   ├─ pages/            # Home, Login, Register, Profile, ScanPage, …
│   │   ├─ components/       # UI components, common, scan‑specific
│   │   ├─ context/          # AuthContext provider
│   │   └─ services/         # API wrappers (axios instances)
├─ server/            # Express API
│   ├─ src/
│   │   ├─ controllers/      # authController, profileController, scanController
│   │   ├─ services/         # authService, profileService, scanService, ocrClient, extractionService
│   │   ├─ routes/           # authRoutes, profileRoutes, scanRoutes
│   │   ├─ middleware/       # auth, validate, upload, errorHandler
│   │   └─ config/           # database.js, env.js
│   └─ prisma/                # schema.prisma, migration files
├─ docs/               # Design system, specs, resource register
├─ resources/          # External data, datasets, docs
├─ .gitignore
├─ README.md
├─ package.json (frontend & backend)
└─ ...
```

## Important Decisions & Constraints
- **Stateless JWT** – logout is a client‑side acknowledgement; tokens are not revoked server‑side.
- **OCR fallback** – if `config.aiServiceUrl` is unreachable, `ocrClient.js` uses a deterministic native generator.
- **Security** – no secrets are stored in repo; `.env` excluded via `.gitignore`.
- **Design enforcement** – the `DESIGN_SYSTEM.md` file is the single source of truth for colors, typography, button classes.
- **Feature progress** – Phase 1 (Auth & Profile), Phase 2 (Scan Upload & OCR), and Phase 3 (Structured Information Extraction) are fully implemented and verified with automated test suites.


---
*Generated on 2026‑10‑16.*
