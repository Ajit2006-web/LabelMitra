# LabelMitra Central Resource Register

This register documents all authoritative external references, official regulations, scientific classifications, datasets, and technical documentation utilized in **LabelMitra - AI-Powered Food Label Analysis**.

---

## 1. Summary Table of Resources

| Resource ID | Resource Title | Category | Publisher / Author | Publication / Version | Date Verified | Supported Feature | Verification Status |
|---|---|---|---|---|---|---|---|
| `TECH-001` | Node.js & Express.js Documentation | Technical Documentation | OpenJS Foundation | Node v20+, Express v4.19 | 2026-10-13 | Backend REST API & Authentication Architecture | Verified |
| `TECH-002` | PostgreSQL & Prisma ORM Documentation | Technical Documentation | Prisma / PostgreSQL Global Dev Group | PostgreSQL 18, Prisma 5.x | 2026-10-13 | Relational Database Schema & Data Modeling | Verified |
| `TECH-003` | JSON Web Token (RFC 7519) | Technical Documentation | IETF | RFC 7519 | 2026-10-13 | Stateless Authentication & API Security | Verified |
| `REG-001` | FSSAI Food Safety and Standards (Labelling and Display) Regulations, 2020 | Regulations | Food Safety and Standards Authority of India (FSSAI) | Gazette Notification F. No. 1-94/FSSAI/SP(L&C)/2009 | 2026-10-13 | Mandatory allergen declarations, veg/non-veg declarations, nutrition labels | Verified |
| `ING-001` | FSSAI List of Major Food Allergens Requiring Mandatory Declaration | Ingredient & Allergen References | Food Safety and Standards Authority of India | Regulation 5(3)(b), FSSAI 2020 | 2026-10-13 | User allergy profile taxonomy and cross-matching | Verified |
| `TECH-004` | PaddleOCR: A Practical Ultra Lightweight OCR System | Technical Documentation | Baidu PaddlePaddle / GitHub | PaddleOCR v2.7+ (PP-OCRv4) | 2026-10-13 | Dual-script text detection, angle classification, text recognition | Verified |
| `TECH-005` | OpenCV Image Preprocessing & Morphological Operations | Technical Documentation | OpenCV Foundation | OpenCV 4.x | 2026-10-13 | Laplacian blur score, CLAHE contrast enhancement, deskewing | Verified |
| `DATA-001` | Indian Packaged Food Benchmark Test Dataset | Datasets | LabelMitra Ground Truth Project | Curated Benchmark v1.0 | 2026-10-13 | OCR ground-truth validation for biscuits, noodles, and beverages | Verified |

---

## 2. Detailed Resource Entries

### Resource `TECH-001`
- **Resource ID:** `TECH-001`
- **Resource Title:** Node.js & Express.js REST Framework Documentation
- **Category:** Technical Documentation
- **Publisher:** OpenJS Foundation
- **Official URL:** https://expressjs.com/
- **Publication / Version:** Express v4.19+ / Node.js ES Modules
- **Date Verified:** 2026-10-13
- **Description:** Official architecture documentation for asynchronous web services and middleware patterns.
- **Specific Feature Supported:** Modular backend routing, JWT authentication middleware, and input validation for Phase 1.
- **Verification Status:** Verified

---

### Resource `TECH-002`
- **Resource ID:** `TECH-002`
- **Resource Title:** PostgreSQL & Prisma ORM Schema Reference
- **Category:** Technical Documentation
- **Publisher:** Prisma / PostgreSQL Global Development Group
- **Official URL:** https://www.prisma.io/docs
- **Publication / Version:** PostgreSQL 18 / Prisma 5.x
- **Date Verified:** 2026-10-13
- **Description:** Complete relational ORM schema syntax, migrations, and PostgreSQL driver specifications.
- **Specific Feature Supported:** Data layer persistence for User, UserProfile, UserAllergy, and UserPreference entities.
- **Verification Status:** Verified

---

### Resource `TECH-003`
- **Resource ID:** `TECH-003`
- **Resource Title:** JSON Web Token (JWT) Standard Specification
- **Category:** Technical Documentation
- **Publisher:** Internet Engineering Task Force (IETF)
- **Official URL:** https://datatracker.ietf.org/doc/html/rfc7519
- **Publication / Version:** RFC 7519
- **Date Verified:** 2026-10-13
- **Description:** Open standard defining a compact, self-contained way for securely transmitting information between parties as a JSON object.
- **Specific Feature Supported:** Secure user authentication and stateless session management in Phase 1.
- **Verification Status:** Verified

---

### Resource `REG-001`
- **Resource ID:** `REG-001`
- **Resource Title:** Food Safety and Standards (Labelling and Display) Regulations, 2020
- **Category:** Regulations
- **Publisher:** Food Safety and Standards Authority of India (FSSAI), Ministry of Health and Family Welfare
- **Official URL:** https://www.fssai.gov.in/upload/uploadfiles/files/Gazette_Notification_Labelling_Display_18_11_2020.pdf
- **Publication / Version:** Gazette Notification F. No. 1-94/FSSAI/SP(L&C)/2009, dated 17th November 2020
- **Date Verified:** 2026-10-13
- **Description:** Official statutory regulation mandating labelling requirements, mandatory declarations, nutritional information, allergen declarations, and symbol specifications for Indian packaged food.
- **Specific Feature Supported:** Defines the 8 major recognized allergen groups (Cereals containing gluten, Crustaceans, Eggs, Fish, Peanuts/Tree nuts, Soybeans, Milk, Sulphite) and dietary declaration categories (Vegetarian / Non-Vegetarian) established in the User Profile system in Phase 1.
- **Exact Section Used:** Regulation 5(3)(b) (Allergens) and Regulation 5(4) (Vegetarian/Non-Vegetarian logo).
- **Verification Status:** Verified

---

### Resource `ING-001`
- **Resource ID:** `ING-001`
- **Resource Title:** FSSAI Statutory Allergen Declaration Guidelines
- **Category:** Ingredient & Allergen References
- **Publisher:** Food Safety and Standards Authority of India
- **Official URL:** https://www.fssai.gov.in/
- **Publication / Version:** Regulations 2020, Clause 5(3)(b)
- **Date Verified:** 2026-10-13
- **Description:** Statutory taxonomy specifying ingredients known to cause hypersensitivity that must be declared explicitly on packaged food labels in India.
- **Specific Feature Supported:** Curates the baseline selectable allergens in the User Profile (Peanut, Tree Nuts, Milk, Soy, Gluten, Wheat, Egg, Sesame, Fish, Shellfish) for Phase 1.
- **Verification Status:** Verified

---

### Resource `TECH-004`
- **Resource ID:** `TECH-004`
- **Resource Title:** PaddleOCR: A Practical Ultra Lightweight OCR System
- **Category:** Technical Documentation
- **Publisher:** Baidu PaddlePaddle / GitHub
- **Official URL:** https://github.com/PaddlePaddle/PaddleOCR
- **Publication / Version:** PP-OCRv4 / PaddleOCR v2.7+
- **Date Verified:** 2026-10-13
- **Description:** Open-source multilingual OCR system with text detection (DBNet), angle classification, and recognition (SVTR) models optimized for low-latency packaging inference.
- **Specific Feature Supported:** Text bounding box detection and text line recognition across English and Devanagari packaging labels in Phase 2.
- **Verification Status:** Verified

---

### Resource `TECH-005`
- **Resource ID:** `TECH-005`
- **Resource Title:** OpenCV Image Preprocessing & Morphological Operations
- **Category:** Technical Documentation
- **Publisher:** OpenCV Foundation
- **Official URL:** https://docs.opencv.org/
- **Publication / Version:** OpenCV 4.x
- **Date Verified:** 2026-10-13
- **Description:** Open source computer vision library used for image sharpening, contrast limited adaptive histogram equalization (CLAHE), bilateral denoising, and variance of Laplacian blur estimation.
- **Specific Feature Supported:** Preprocessing pipeline before OCR and image quality/clarity estimation in Phase 2.
- **Verification Status:** Verified

---

### Resource `DATA-001`
- **Resource ID:** `DATA-001`
- **Resource Title:** Indian Packaged Food Benchmark Test Dataset
- **Category:** Datasets
- **Publisher:** LabelMitra Ground Truth Project
- **Official URL:** file:///d:/LabelMitra/resources/datasets/test_labels/
- **Publication / Version:** Benchmark Dataset v1.0
- **Date Verified:** 2026-10-13
- **Description:** Curated and manually verified packaging label ground-truth records representing Indian biscuits, instant noodles, and fruit juices.
- **Specific Feature Supported:** Benchmarking OCR precision, recall, and character error rates during automated pipeline verification in Phase 2.
- **Verification Status:** Verified

