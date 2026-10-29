# LabelMitra - AI-Powered Food Label Analysis
> **Tagline:** Your Friendly Guide to Food Labels  
> **Domain:** Indian Packaged Food Products  
> **Standard:** FSSAI Food Safety and Standards (Labelling and Display) Regulations

---

## 1. Project Overview

LabelMitra is a production-grade full-stack web application designed to analyze Indian packaged food products using Optical Character Recognition (OCR), deterministic rule-based FSSAI compliance verification, personalized allergen detection, nutrition analysis, explainable AI (XAI), and traceable alternative product recommendations.

---

## 2. System Architecture

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, React Router, Axios. Accessible, high-contrast, clean rectangular styling (no purple gradients, no pill buttons, no em dashes).
- **Backend:** Node.js + Express.js (ES modules), Prisma ORM, PostgreSQL 18.
- **AI Microservice:** Python FastAPI (PaddleOCR, OpenCV preprocessing, sentence-transformer embeddings).
- **Compliance Engine:** Deterministic rule-based engine implementing official FSSAI statutory regulations.

---

## 3. Implementation Progress & Roadmap

| Phase | Module | Status | Verification |
|---|---|---|---|
| **Phase 1** | **Authentication & Personalized User Profile** | **COMPLETED** | **17/17 Automated Tests Passing** |
| **Phase 2** | **Image Upload & Preprocessing + OCR Pipeline** | **COMPLETED** | **15/15 Backend + 5/5 Frontend Tests Passing** |
| **Phase 3** | **Structured Product Information Extraction** | **COMPLETED** | **10/10 Unit Tests Passing (42/42 Backend Total)** |
| Phase 4 | Ingredient Knowledge Base & Allergy Matching | Queued | Scheduled |
| Phase 5 | Nutrition Analysis Engine | Queued | Scheduled |
| Phase 6 | FSSAI Rule-Based Compliance Engine | Queued | Scheduled |
| Phase 7 | Knowledge Base & RAG Pipeline (pgvector) | Queued | Scheduled |
| Phase 8 | Explainable AI & LLM Explanation Layer | Queued | Scheduled |
| Phase 9 | Traceable Product Recommendation Engine | Queued | Scheduled |
| Phase 10 | Complaint Assistance & FSSAI Portal Workflow | Queued | Scheduled |
| Phase 11 | Dashboard, History & Admin Panel | Queued | Scheduled |
| Phase 12 | System Benchmarks, AI Metrics & Documentation | Queued | Scheduled |

---

## 4. Phase 1 Features Implemented

1. **User Authentication:**
   - User registration with email format and password strength validation.
   - Irreversible password hashing with `bcryptjs`.
   - Stateless session management with signed JSON Web Tokens (JWT).
   - Protected routes and authorization middleware.
2. **Personalized User Profile:**
   - Personal details (Full Name, Age Group).
   - Dietary Preference selector: Vegetarian, Vegan, Eggetarian, Non-Vegetarian, Other.
   - Comprehensive food allergy manager:
     - Quick-add for recognized statutory FSSAI allergens (Peanut, Tree nuts, Milk, Soy, Gluten, Wheat, Egg, Sesame, Fish, Shellfish).
     - Custom allergen input with severity grading (Mild, Moderate, Severe).
     - Real-time allergy removal.
   - Nutritional priorities configuration:
     - Low Sugar, Low Sodium, Low Saturated Fat, High Protein, Low Calorie, No Artificial Sweeteners, No Specific Additives.
3. **Database Architecture:**
   - 17 relational tables modeled and synchronized to PostgreSQL with Prisma ORM.
4. **Mandatory Launch Compliance:**
   - Custom SVG favicon.
   - Privacy Policy page (`/privacy-policy`).
   - Terms and Conditions page (`/terms`).
   - Clean, professional UI conforming strictly to Section 35 design standards.

---

## 5. Getting Started & Running Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v15+)
- npm (v9+)

### 1. Database Setup
Ensure PostgreSQL is running locally and create the database:
```sql
CREATE DATABASE labelmitra;
```

### 2. Backend Setup
```bash
cd server
cp .env.example .env # Ensure DATABASE_URL is configured
npm install
npx prisma db push
npm test             # Run automated verification tests
npm run dev          # Starts server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev          # Starts client on http://localhost:5173
```

---

## 6. Authoritative Resource Documentation

All external regulations, scientific taxonomies, and technical frameworks are systematically logged in [resources/resource_register.md](file:///d:/LabelMitra/resources/resource_register.md).
