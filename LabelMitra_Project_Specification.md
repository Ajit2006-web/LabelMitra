# Build a Full-Stack AI Project: Explainable AI-Based Food Label Compliance, Allergy Analysis & Product Recommendation System

## 1. Project Overview

Build a production-quality full-stack web application for analyzing Indian packaged food products using AI, OCR, rule-based compliance checking, ingredient analysis, personalized allergy detection, explainable AI, and product recommendations.

### Application Name and Project Title

- **Application Name:** LabelMitra
- **Project Title:** LabelMitra - AI-Powered Food Label Analysis
- **Tagline:** Your Friendly Guide to Food Labels

Use `LabelMitra` as the consistent application name throughout the project. Use `LabelMitra - AI-Powered Food Label Analysis` as the short project title in the README, project report, presentation, and documentation.

The system should allow a user to upload or capture an image of a packaged food product. The application should extract information from the package using OCR, identify the product and its ingredients/nutrition information, check selected applicable FSSAI food-label requirements, analyze ingredients and allergens, consider the user's personalized profile, explain the findings with evidence, and recommend suitable alternative products.

If a potential labelling/compliance issue is detected, the system should also provide an option to prepare a complaint for the appropriate official authority through **FSSAI Food Safety Connect**.

---

# 2. Main System Workflow

User Registration/Login
↓
Personalized User Profile
↓
Upload / Capture Food Product Image
↓
Image Preprocessing
↓
OCR
↓
Information Extraction
↓
Food Product Identification
↓
FSSAI-Based Compliance Engine
↓
Ingredient & Nutrition Analysis
↓
Allergy Matching
↓
Knowledge Base / RAG
↓
Explainable AI Assessment
↓
Personalized Product Recommendation
↓
Potential Violation?
↓
Complaint Assistance
↓
FSSAI Food Safety Connect

---

# 3. IMPORTANT PROJECT SCOPE

The current implementation should focus primarily on:

**Indian packaged FOOD products.**

Do not attempt to fully implement other product categories in the first version.

---

# 4. Core Features

## A. User Authentication

Implement:

- User registration
- Login
- Logout
- Password hashing
- JWT-based authentication
- Protected routes
- Forgot/reset password if practical
- Secure API authentication

Users should have their own profile and scan history.

---

# 5. Personalized User Profile

Create a profile system where users can specify:

### Personal preferences

- Name
- Age group
- Dietary preference
  - Vegetarian
  - Vegan
  - Eggetarian
  - Other

### Allergies

Allow users to select/add allergies such as:

- Peanut
- Tree nuts
- Milk
- Soy
- Gluten
- Wheat
- Egg
- Sesame
- Fish
- Shellfish
- Other custom allergies

### Nutrition preferences

Allow users to specify preferences such as:

- Low sugar
- Low sodium
- Low saturated fat
- High protein
- Low calorie
- No artificial sweeteners
- No specific additives

The profile should influence product assessment and recommendations.

---

# 6. Product Image Upload / Camera

The user should be able to:

- Upload an image
- Take/capture an image using camera where supported
- Upload multiple images of the same product

Because food labels can have information on multiple sides, support:

- Front image
- Back image
- Side image
- Ingredient-label image
- Nutrition-label image

Allow the user to select/confirm that multiple images belong to the same product.

---

# 7. Image Processing

Before OCR, perform appropriate preprocessing:

- Resize
- Crop
- Grayscale conversion
- Noise removal
- Contrast enhancement
- Sharpening
- Perspective correction where possible

The system should attempt OCR even when:

- Text is small
- Image is slightly rotated
- Lighting is imperfect

Show the user an OCR confidence score.

---

# 8. OCR

Use an OCR system suitable for food labels.

Preferred options:

- PaddleOCR
- EasyOCR
- Tesseract as fallback

The architecture should allow switching OCR engines.

Extract:

- Product name
- Brand
- Ingredients
- Nutrition information
- Net quantity
- MRP
- Manufacturer
- Manufacturer address
- FSSAI licence/registration number
- Batch/lot number
- Date of manufacture/packaging where available
- Best before/use by/expiry information
- Vegetarian/non-vegetarian symbol where applicable
- Allergen information
- Other relevant label declarations

Do NOT blindly trust OCR.

Store:

- Raw OCR text
- Structured extracted data
- OCR confidence
- Source image
- Bounding boxes if supported

---

# 9. Information Extraction

Convert OCR text into structured JSON.

Example:

{
  "product_name": "...",
  "brand": "...",
  "ingredients": [],
  "nutrition": {
    "energy": null,
    "protein": null,
    "carbohydrate": null,
    "sugar": null,
    "fat": null,
    "saturated_fat": null,
    "trans_fat": null,
    "sodium": null
  },
  "mrp": null,
  "net_quantity": null,
  "manufacturer": null,
  "fssai_license": null,
  "batch_number": null,
  "manufacturing_date": null,
  "expiry_date": null,
  "allergen_statement": null
}

Allow missing values.

Never invent information that was not detected.

---

# 10. Ingredient Analysis

Build an ingredient knowledge base.

For each ingredient store information such as:

- Ingredient name
- Alternative names/synonyms
- Ingredient category
- Additive number/E-number/INS number where applicable
- Potential allergen association
- Potential concerns
- Function
- Regulatory information
- Evidence/reference
- Source
- Source URL
- Last verified date

Example:

Peanut
→ synonyms: groundnut, Arachis hypogaea
→ allergen: yes
→ allergen group: peanut

Use trusted sources, suitable public datasets and curated references to build the ingredient knowledge base. AI may assist in extracting and structuring ingredient information from these sources, but it must not invent ingredient facts, allergen associations or regulatory information.

Store the source and verification status of each important record. Provide an admin workflow for reviewing, correcting and updating ingredient information.

The system must understand synonyms.

---

# 11. Allergy Detection

Compare extracted ingredients with the user's allergy profile.

Example:

User allergy:

Peanut

Product ingredient:

Groundnut

System:

**Potential allergen detected**

Reason:

"Groundnut is another common name for peanut and matches the allergen in your profile."

Do not provide medical diagnosis.

Use wording such as:

- "Potential allergen detected"
- "This product may not be suitable for your stated allergy"
- "Please verify the package label and consult an appropriate professional if necessary."

Also check:

- Ingredient list
- Allergen declaration
- "May contain" statements where available

---

# 12. Nutrition Analysis

Analyze available nutrition information.

Display:

- Calories/energy
- Sugar
- Protein
- Carbohydrates
- Total fat
- Saturated fat
- Trans fat
- Sodium/salt
- Fiber where available

Compare values against configurable thresholds.

Do not present the result as medical advice.

Use simple categories such as:

- Low
- Moderate
- High

Clearly display the basis of the classification.

---

# 13. FSSAI-Based Compliance Engine

This is one of the most important parts of the project.

Do NOT use an LLM alone to decide regulatory compliance.

Build a **rule-based compliance engine**.

The system should contain a structured database of selected applicable Indian food-label requirements based on official FSSAI regulations and applicable amendments.

Each rule should contain:

- Rule ID
- Requirement
- Applicability
- Condition
- Expected declaration
- Validation logic
- Explanation
- Official source
- Source URL
- Regulation/reference
- Last updated date

Example:

RULE-001

Requirement:
Check whether the applicable mandatory declaration is present.

Input:
Extracted product information.

Output:

PASS
or
POTENTIAL ISSUE
or
CANNOT VERIFY

Important:

Do not claim that a product is legally "invalid" solely from OCR.

Use:

**"Potential compliance issue detected."**

The system should distinguish:

- Compliant
- Potentially non-compliant
- Cannot verify
- Not applicable

---

# 14. Compliance Evidence

Every compliance finding should show:

### Finding

Potential issue detected.

### Reason

Explain exactly what was missing or inconsistent.

### Evidence

Show the relevant OCR text/image section.

### Rule

Show the applicable rule.

### Source

Provide the official regulatory source.

This should make the system auditable and explainable.

---

# 15. Compliance vs Health Assessment

Keep these separate.

A product can be:

Label-compliant

but

High in sugar

or

Contains an allergen relevant to the user.

Do not combine everything into one unexplained score.

Display separate sections:

### Regulatory Compliance

### Ingredient Analysis

### Nutrition Analysis

### Personalized Allergy Assessment

### Overall Product Assessment

---

# 16. Knowledge Base / RAG

Implement a Retrieval-Augmented Generation system.

Use RAG for retrieving supporting information from trusted sources.

Possible knowledge sources:

- Official FSSAI regulations
- Official FSSAI guidance
- Government sources
- Official regulatory documents
- Curated ingredient information
- Trusted nutrition/food safety references

Store documents in a vector database.

Possible technologies:

- FAISS
- ChromaDB
- PostgreSQL + pgvector

For every AI explanation, retrieve relevant evidence first.

The LLM should NOT be allowed to freely invent regulatory information.

---

# 17. LLM / Explainable AI

Use an LLM only where it adds value.

The LLM should:

- Explain OCR findings
- Explain ingredient concerns
- Explain compliance findings
- Summarize nutrition
- Explain allergy matches
- Explain why a recommendation was made

The LLM should receive structured findings and retrieved evidence rather than raw uncontrolled assumptions.

Example:

Instead of:

"AI says this ingredient is dangerous."

Show:

"Potential concern detected because X was identified in the ingredient list. According to the retrieved source, X is classified as \_\_\_\_. Source: \_\_\_\_."

Always show evidence/source when possible.

---

# 18. Product Recommendation System

Build a recommendation engine that recommends alternative products based on:

- User allergies
- Dietary preference
- Nutrition preferences
- Product category
- Similarity to current product
- Detected issues
- User preferences

Example:

Current product:

High sugar + contains peanut

User:

Peanut allergy + low sugar preference

Recommendation:

Product B

Reason:

- Same product category
- No detected peanut ingredient
- Lower sugar
- Matches the user's dietary and nutrition preferences

The recommendation must be **traceable**.

Show:

### "Why are we recommending this?"

For example:

"Recommended because it belongs to the same category, matches your dietary preferences, has lower sugar, and does not contain a detected ingredient matching your stated peanut allergy."

---

# 19. Product Database

Create a database of packaged food products.

For the initial prototype, use a manageable dataset.

Target:

**100–300 products initially**, if sufficient data is available.

Store:

- Product name
- Brand
- Category
- Ingredients
- Nutrition
- Price/MRP
- Images
- Allergen information
- FSSAI licence number if available
- Source
- Verification date

Use trusted/public datasets where legally and technically appropriate, and clearly distinguish supplementary product data from official regulatory sources.

Do not fabricate product information.

---

# 20. Complaint Assistance Feature

Implement a feature:

## "Report Potential Violation"

If the compliance engine detects a potential issue, show:

**Report Potential Violation**

Before reporting, show:

- Detected issue
- Applicable rule
- Evidence
- Product information
- OCR confidence
- Image evidence

Require user confirmation.

The system should NOT automatically accuse a company or automatically submit a complaint based only on OCR.

---

# 21. Complaint Preparation

Generate a structured complaint draft containing:

- Product name
- Brand
- Manufacturer
- FSSAI licence/registration number
- Product category
- Complaint category
- Detected issue
- Explanation
- Evidence
- Product images
- Purchase bill if available
- User-provided description
- Location where appropriate

Allow the user to edit the complaint before submission.

---

# 22. Complaint Authorities

Support the following official channel:

### FSSAI Food Safety Connect

For food-safety grievances through the national FSSAI complaint channel.

The system should guide the user to the appropriate official portal.

Do NOT create a fake government API.

If an official API is not publicly available, implement:

**Generate Complaint → Review → Open Official Portal → User Submits**

Do not automatically submit credentials or sensitive personal information.

---

# 23. Complaint Tracking

If technically possible through an official API, allow tracking.

Otherwise provide:

- Complaint/ticket number input
- Official portal link
- Manual tracking instructions

Do not scrape government websites aggressively or violate their terms.

---

# 24. Dashboard

Create a modern dashboard containing:

- Total scans
- Products analyzed
- Potential compliance issues
- Allergy warnings
- Saved products
- Recommended products
- Complaint history
- Recent scans

Add charts where useful.

---

# 25. Scan Result Page

Design a clean result page:

### Product Information

Product name
Brand
Category
MRP
Net quantity

### Compliance

Compliant
Cannot verify
Potential issue

### Allergy

Potential allergen detected

### Nutrition

Sugar
Protein
Fat
Sodium
Calories

### Ingredient Analysis

Detected ingredients
Potential concerns
Additives

### AI Explanation

Simple explanation with evidence.

### Recommendations

Alternative products.

### Report

"Report Potential Violation"

---

# 26. Technology Stack

Use the following architecture.

## Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts or similar chart library

Use a modern responsive UI.

Support:

- Desktop
- Tablet
- Mobile

---

## Backend

Use:

**JavaScript + Node.js + Express.js**

Create REST APIs using Express.js and Node.js ES modules. Use JWT-based authentication, bcrypt for password hashing, and PostgreSQL through a suitable ORM such as Prisma.

Suggested modules:
```
auth
users
products
ocr
extraction
ingredients
compliance
nutrition
allergy
recommendation
rag
complaints
```

Keep the backend modular, with separate routes, controllers, services, middleware, validation, database access, and configuration. Keep Node.js + Express.js as the main application backend. Python may be used only for specialized AI components where required, exposed through a documented service interface.

---

# 27. AI/ML Technologies

Use:

### OCR

PaddleOCR

### Image Processing

OpenCV

### NLP / Information Extraction

Python NLP libraries + LLM where appropriate.

### RAG

FAISS / ChromaDB / pgvector

### Embeddings

Use a suitable sentence-transformer embedding model.

### LLM

Design the system so the LLM provider can be changed through environment variables.

Do not hard-code API keys.

### Recommendation

Use a hybrid/content-based recommendation approach initially.

Possible methods:

- Cosine similarity
- Weighted scoring
- Content-based filtering
- Rule-based filtering

Do not build an unnecessarily complex recommendation model if a transparent scoring system works better.

---

# 28. Database

Use:

**PostgreSQL**

Suggested tables:
```
users
user_profiles
user_allergies
user_preferences
products
product_images
ingredients
product_ingredients
nutrition
ocr_results
compliance_rules
compliance_results
knowledge_documents
knowledge_chunks
recommendations
scans
complaints
```

Use proper foreign keys and indexes.

Use PostgreSQL as the primary database. Prefer PostgreSQL with pgvector for vector storage and retrieval if it meets the project's needs. Do not introduce MongoDB, MySQL or a separate database without a clear technical requirement.

Store uploaded images in local file storage during development and save their paths and metadata in PostgreSQL. Keep the storage layer modular so it can be changed later if required.

---

# 29. API Design

Create APIs such as:

POST /api/auth/register
POST /api/auth/login

GET /api/profile
PUT /api/profile

POST /api/products/scan
POST /api/ocr/extract

GET /api/products/

POST /api/analyze

POST /api/compliance/check

POST /api/allergy/check

POST /api/recommendations

GET /api/history

POST /api/complaints/draft

GET /api/complaints

Use appropriate HTTP status codes and validation.

---

# 30. Security

Implement:

- Password hashing
- JWT authentication
- Environment variables
- Input validation
- File type validation
- File size limits
- Secure API endpoints
- CORS configuration
- SQL injection protection through ORM/parameterized queries
- Do not expose API keys
- Do not store unnecessary personal information
- Basic rate limiting where practical

---

# 31. Error Handling

The system must gracefully handle:

- Blurry images
- No readable text
- OCR failure
- Missing ingredients
- Missing nutrition values
- Unknown ingredients
- Unknown product
- LLM/API failure
- RAG retrieval failure
- Database failure
- Invalid image format
- Government portal unavailable

Never fabricate missing information.

For example:

**"We could not reliably extract the nutrition table from this image. Please upload a clearer image."**

---

# 32. OCR Confidence & Human Verification

If OCR confidence is low:

Show:

**Low confidence extraction**

Allow the user to manually correct extracted fields before analysis.

This is important because incorrect OCR can otherwise produce incorrect compliance and allergy results.

---

# 33. Explainability

Every important AI result should answer:

### What did we find?

### Why did we find it?

### What evidence supports it?

### Which rule/source supports it?

### How did this affect the recommendation?

This should be a major design principle.

---

# 34. Important Safety/Accuracy Rules

The system is a decision-support application, not a medical or legal authority.

Never:

- Diagnose diseases
- Guarantee that food is medically safe
- Claim a company is legally guilty
- Automatically accuse a manufacturer
- Invent regulations
- Invent ingredient information
- Invent product information
- Treat OCR output as guaranteed truth

Use phrases such as:

- "Potential issue"
- "Detected based on available information"
- "Could not verify"
- "Please verify the package"
- "Source/reference"

---

# 35. UI/UX Requirements

Create a professional modern UI suitable for a final-year engineering project.

Use:

- Clean dashboard
- Cards
- Tables
- Clear status indicators
- Progress indicators
- Charts
- Search
- Filters
- Responsive design
- Accessible color contrast
- Clear error messages
- Loading states
- Empty states

Use different visual states for:

- Passed
- Cannot verify
- Potential issue
- Allergy warning

## Design Quality and Brand Identity

The website must look like a professionally designed software product, not a generic AI-generated or "vibe-coded" product.

Follow these requirements strictly:

- Never use purple gradients.
- Never use pill-shaped buttons. Use clean, professional button shapes with consistent corner radii.
- Never include fake reviews, fabricated testimonials, fake customer counters or invented usage statistics.
- Never use vague hero texts or generic marketing copy. All text must be specific, meaningful and relevant to the actual functionality.
- Never use emoji icons in the website interface. Use consistent, appropriate icons from a professional icon library.
- Never use em dashes in website copy.
- Never use over-the-top scroll animations, unnecessary motion effects or cursor animations.
- Never use AI-generated, low-quality, misleading or generic stock-style photos that do not serve a genuine purpose.
- Never use AI-generated filler text or repetitive, generic copy.
- Use authentic product imagery where available and appropriate. Do not fabricate real product packaging or official logos.
- Maintain consistent typography, spacing, colors, layouts, icon styles and component behavior.
- Use meaningful headings, clear labels, practical navigation and concise explanations.
- Prioritize accessibility, readability, usability and responsive behavior over decorative effects.
- Use realistic sample data only when clearly identified as sample or test data.
- Do not invent claims about the accuracy, reliability or performance of the system.
- Make every screen functional. Do not create decorative buttons, fake controls or interactions that do nothing.

## Launch Requirements

The application must not be considered ready for launch until all the following requirements are satisfied:

- A proper favicon has been added.
- Any "Made with AI" tag or badge has been removed from the final product interface, where applicable.
- A Privacy Policy page has been implemented.
- A Terms and Conditions page has been implemented.
- The main workflows have been tested.
- All visible navigation links and interactive controls work correctly.
- No placeholder text, broken images, fake reviews, fake statistics or unfinished UI elements remain in the production interface.
- Error messages, loading states and empty states are implemented appropriately.
- Security and environment configuration have been reviewed.
- No API keys, secrets or sensitive configuration values are exposed.
- The application has been tested at desktop, tablet and mobile screen sizes.

Most importantly, **make no avoidable mistakes**. Verify the implementation, test functionality, validate data and fix errors before considering the project complete. Do not claim that something works unless it has been implemented and tested.

### Branding Consistency

- Use `LabelMitra` consistently in the navbar, login and registration pages, dashboard, footer, browser tab title, favicon, and application metadata.
- Use the tagline `Your Friendly Guide to Food Labels` where appropriate.
- Remove any old or alternative application names from the UI and documentation.
- Keep the branding consistent across all pages without changing the existing project functionality, API routes, database schema, or technology stack.

---

# 36. Admin Panel

Create a basic admin panel for managing:

- Products
- Ingredients
- Compliance rules
- Knowledge documents
- Sources
- Users
- Complaint records
- System statistics

Admins should be able to update compliance rules when regulations change.

Every compliance rule should have:

- Version
- Effective date
- Source
- Last updated date

---

# 37. Testing

Implement tests for:

### Backend

- Authentication
- OCR processing
- Information extraction
- Compliance rules
- Allergy matching
- Recommendation engine
- API endpoints

### Frontend

- Login
- Profile
- Scan
- Result display
- Recommendations
- Complaint workflow

### AI evaluation

Measure:

- OCR accuracy
- Information extraction accuracy
- Ingredient identification accuracy
- Compliance precision
- Compliance recall
- F1 score
- RAG retrieval relevance
- Recommendation Precision@K
- Recommendation Recall@K
- NDCG@K

---

# 38. Dataset / Testing Dataset

Create a small verified test dataset of packaged Indian food products.

Include different categories such as:

- Biscuits
- Chips
- Instant noodles
- Breakfast cereals
- Beverages
- Chocolates
- Packaged snacks
- Sauces
- Ready-to-eat foods

Include examples with:

- Complete labels
- Missing/unclear information
- Allergens
- Different nutrition profiles
- Different package layouts

Clearly mark manually verified ground truth.

---

# 39. Project Documentation

Generate complete documentation.

- Application branding and project title: LabelMitra - AI-Powered Food Label Analysis

### README

Include:

- Project overview
- Features
- Architecture
- Technologies
- Installation
- Environment variables
- Database setup
- OCR setup
- LLM setup
- RAG setup
- Running frontend
- Running backend
- Testing

### Technical documentation

Include:

- System architecture
- Database ER diagram
- API documentation
- Data flow diagram
- Sequence diagram
- Use-case diagram
- Component diagram

### Project report material

Include:

- Abstract
- Introduction
- Literature survey
- Existing system
- Limitations of existing systems
- Research gap
- Problem statement
- Objectives
- Proposed system
- Methodology
- System architecture
- Algorithms
- Dataset
- Implementation
- Results
- Evaluation
- Limitations
- Future scope
- Conclusion
- References

### Resource Documentation and Verification

Maintain a dedicated `resources/` folder in the project root to document the external information, references, datasets, regulations, research papers and technical documentation used to develop the application.

The purpose is to ensure that I can independently verify the information, understand where it originated and justify the technical and research decisions made in the project report, presentation and viva.

#### 1. Resource folder structure

Use the following structure as a starting point:
```
resources/
├── README.md
├── resource_register.md
├── regulations/
├── ingredient_references/
├── datasets/
├── technical_documentation/
├── research_papers/
└── evaluation_references/
```

Create subfolders only when useful. Keep the structure organized and avoid unnecessary duplication of documents.

Store original documents locally only when legally permitted and practically useful. Otherwise, record their official URLs and relevant bibliographic information.

#### 2. Central resource register

Maintain `resources/resource_register.md` as the central register of the important external resources used during development.

For each resource, record:

- Resource ID
- Resource title or name
- Resource category
- Publisher, organization or author
- Official source URL or download link
- Publication date or document version, if available
- Date accessed or verified
- Short description of the resource
- Specific information or project feature supported by the resource
- Exact regulation, section, page, dataset field or documentation section used, wherever applicable
- Verification status
- Local file path, if a copy is stored in the project

Use a simple, readable table where appropriate. For resources requiring additional details, use individual entries with clear headings.

#### 3. Resource categories

**Regulations**

Document the official FSSAI regulations, amendments, applicable notifications and guidance used by the compliance engine. Record the relevant regulation name, version, effective date and specific provisions wherever applicable.

**Ingredient references**

Document trusted sources used to establish ingredient names, synonyms, allergen associations, additive identifiers, ingredient functions and potential concerns.

**Datasets**

Record the dataset name, publisher, source URL, licence or usage conditions, collection date where applicable, fields used, limitations and preprocessing performed.

Clearly distinguish publicly available datasets, manually verified test data and supplementary product information.

**Technical documentation**

Record the official documentation for the frameworks, libraries, OCR engines, embedding models, databases, APIs and other technologies used in the project.

**Research papers**

Record relevant research papers used to justify the methodology, architecture, algorithms or evaluation approach. Include the title, authors, publication details, DOI or URL where available, and a short explanation of their relevance.

**Evaluation references**

Document the sources and methodology used to define test cases, ground-truth labels, evaluation metrics and thresholds.

#### 4. Evidence and accuracy requirements

- Prefer official government sources for regulatory claims, particularly FSSAI requirements.
- Prefer original publications and official documentation over secondary summaries whenever practical.
- Never invent source titles, URLs, authors, publication dates, citations or regulatory references.
- Verify that each source actually supports the claim attributed to it.
- Clearly distinguish official regulatory requirements from internal project rules, research findings and general informational guidance.
- Record the relevant regulation version, effective date or amendment where applicable.
- If a source cannot be accessed or verified, explicitly mark it as unverified.
- Do not describe a dataset as verified unless its relevant contents have actually been checked.
- Record the sources used to build or update the ingredient knowledge base, compliance rules, RAG knowledge base and product dataset.
- For AI-assisted information extraction, retain the original source so that important extracted facts can be traced back to it.
- Do not rely on an LLM-generated answer as the sole source of a regulatory or safety-related claim.

#### 5. Resource maintenance

Whenever a new external resource is used, add it to the register during the relevant development phase rather than waiting until the project is complete.

Whenever an existing source is replaced or updated, record the new version, URL, verification date and reason for the change where relevant.

Keep `resources/README.md` as a short guide explaining the purpose of the folder, how the register is organized and how to verify the sources.

Update the resource register whenever changes are made to the ingredient knowledge base, compliance engine, RAG pipeline, product dataset or technical architecture.

#### 6. Final documentation and viva preparation

At project completion, ensure that:

- Every important external source used in the implementation is documented.
- Every regulatory rule can be traced to an appropriate reference.
- Ingredient and allergen knowledge has traceable supporting sources.
- Dataset origins and usage permissions are documented.
- Important architecture and algorithm decisions have appropriate references where available.
- Resource links and local paths are checked.
- The resource register is consistent with the final implementation.

The resource register must help me answer questions such as:

- Where did this regulatory requirement come from?
- Which source supports this ingredient or allergen association?
- Where did this dataset originate?
- Why was this algorithm or technology selected?
- How can I independently verify this information?

Do not fabricate sources to make the documentation appear complete. Document genuine sources used during development and clearly identify any remaining gaps.

---

# 41. Important Architecture Principle

DO NOT build the entire application around an LLM.

Use the right technology for each task:

OCR → read label
OpenCV → process image
Information extraction → structure data
Rule engine → compliance
Database → store structured information
Knowledge base/RAG → retrieve evidence
LLM → explain findings
Recommendation engine → rank alternatives
User profile → personalize results

This separation is extremely important for reliability and explainability.

---

# 42. MVP Priority

Build in this order:

### Phase 1

Authentication + user profile

### Phase 2

Image upload + OCR

### Phase 3

Structured product information extraction

### Phase 4

Ingredient database + allergy matching

### Phase 5

Nutrition analysis

### Phase 6

FSSAI rule-based compliance engine

### Phase 7

RAG + evidence retrieval

### Phase 8

LLM explanation

### Phase 9

Product recommendation

### Phase 10

Complaint preparation and official portal integration

### Phase 11

Dashboard + history

### Phase 12

Testing + documentation

Do not attempt all features simultaneously.

---

# 43. Development Requirements

Before implementing each major module:

1. Design the architecture.
2. Create the database schema.
3. Create APIs.
4. Implement backend logic.
5. Implement frontend.
6. Test the module.
7. Integrate it with the rest of the system.

Keep the code modular and maintainable.

Do not put the entire application into a few huge files.

Use clear folder structure and meaningful names.

Follow the design quality and launch requirements in Section 35 throughout development, not just at the end.

Do not skip validation or testing to make the project appear complete faster.

Maintain LabelMitra branding consistently in every phase, including frontend components, browser metadata, favicon, README, and technical documentation.

---

## Phase-by-Phase Implementation Instructions

Implement this project strictly phase by phase according to the MVP Priority defined in Section 42.

Do NOT attempt to generate or implement the entire application in a single response.

### 1. Development workflow

For each phase:

1. Explain the objective and scope of the phase in simple terms.
2. Identify the required architecture, database changes, API endpoints, frontend components and dependencies.
3. Inspect the existing project structure and code before making changes.
4. Implement the phase with complete, modular and maintainable code.
5. Integrate the implementation with previously completed phases.
6. Write and run appropriate tests.
7. Fix errors and verify functionality before considering the phase complete.
8. Update the README and technical documentation wherever necessary.
9. Update the project resource documentation described in Section 39.
10. Provide the commands required to install dependencies, configure the environment, run the application and test the completed phase.

### 2. Phase completion requirements

After completing each phase, provide:

- Features implemented.
- Files and folders created or modified.
- APIs and database changes.
- Tests performed and their actual results.
- Known limitations or unresolved issues.
- Exact commands to run and verify the implementation.
- Any configuration or manual steps required from me.
- Resources added or updated in `resources/resource_register.md`.

Do not claim that a feature or test works unless it has actually been implemented and verified.

Clearly distinguish between tests that passed, tests that failed and tests that have not been run.

### 3. Approval before proceeding

After completing a phase, stop and present a concise completion summary.

Wait for my confirmation before starting the next phase.

If the current phase has unresolved critical errors, prioritize fixing them before requesting approval to proceed.

Maintain the existing project structure, working functionality, database schema and configuration unless a change is necessary. Explain significant changes before making them.

Do not replace working code unnecessarily, duplicate existing functionality or introduce additional technologies without a clear reason.

### 4. Resource verification during development

Use the `resources/` folder and `resources/resource_register.md` defined in Section 39 throughout development.

Whenever external information is used to implement or justify a feature, document the relevant source and explain briefly how it supports that feature.

Pay particular attention to:

- FSSAI regulations and compliance rules.
- Ingredient and allergen information.
- Nutrition references.
- Product datasets.
- OCR and information extraction methods.
- RAG and embedding technologies.
- Recommendation algorithms.
- Testing methodologies and evaluation metrics.

Ensure that important regulatory and safety-related information can be traced back to its supporting source.

Do not fabricate references or claim that information has been verified when it has not.

### 5. Initial implementation instruction

Start with **Phase 1: Authentication and User Profile**, as defined in Section 42.

First present the proposed architecture, folder structure, database schema, required APIs and implementation plan.

Then implement Phase 1 and verify it before proceeding.

The final goal is a fully integrated application built incrementally, with each phase tested and documented.

---

# 44. Environment Variables

Use `.env`.

Example:

```makefile
DATABASE_URL=
JWT_SECRET=
LLM_API_KEY=
LLM_PROVIDER=
EMBEDDING_MODEL=
VECTOR_DB_URL=
```

Never commit `.env` or API keys to GitHub.

Create `.env.example`.

---

# 45. Final Expected Output

At the end, provide:

1. Complete working source code
2. Frontend
3. Backend
4. PostgreSQL database schema
5. OCR pipeline
6. Ingredient knowledge base
7. FSSAI compliance rule engine
8. Allergy/personalization system
9. RAG pipeline
10. LLM explanation system
11. Recommendation engine
12. Complaint-assistance workflow
13. Admin panel
14. Authentication
15. Scan history
16. Tests
17. README
18. API documentation
19. Architecture diagrams
20. Sample dataset
21. `.env.example`
22. Deployment instructions

The final application should be runnable locally with clear commands.

---

# 46. Most Important Project Goal

The final system should demonstrate this complete chain:

**SCAN → OCR → EXTRACT → CLASSIFY → CHECK COMPLIANCE → ANALYZE INGREDIENTS → CHECK ALLERGIES → RETRIEVE EVIDENCE → EXPLAIN → RECOMMEND → REPORT POTENTIAL VIOLATION**

The system should be **explainable, evidence-based, personalized, modular, and realistic to implement as a final-year engineering project.**

Do not falsely claim that the system provides official legal certification or medical advice.

Focus the implementation on **Indian packaged food products**.