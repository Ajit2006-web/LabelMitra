# LabelMitra Academic Project Report Progress & Specification Log

## 1. Reference Template & File Locations

- **Original Archive File:** `D:\LabelMitra\Multi_Channel_Inventory_Reconciliation_Engine_BE_Report_2026_27 (2).zip` (Preserved unmodified).
- **Working Report Directory:** `D:\LabelMitra\reference_report_extracted\`
- **Active Master LaTeX File:** `D:\LabelMitra\reference_report_extracted\BE_PROJECT_REPORT_FORMAT_TERM_II_LATEX_FILE_DY.tex`
- **Safety Backup of Original LaTeX File:** `D:\LabelMitra\reference_report_extracted\BE_PROJECT_REPORT_FORMAT_TERM_II_LATEX_FILE_DY.tex.original_backup`
- **Original Reference PDF:** `D:\LabelMitra\reference_report_extracted\BE_PROJECT_REPORT_FORMAT_TERM_II_LATEX_FILE_DY.pdf`
- **Institute & Format:** Dr. D. Y. Patil Institute of Technology, Pimpri, Pune (Affiliated to Savitribai Phule Pune University - SPPU), Department of Computer Engineering.
- **Academic Year Pattern:** 2026-2027 (Term-II B.E. Project Report Format).

---

## 2. Formatting & Layout Specification

### Document Class & Geometry
- **Document Class:** `\documentclass[oneside,a4paper,12pt]{report}`
- **Paper Size & Margins:** A4 paper (`\usepackage[a4paper,margin=25mm]{geometry}`) — 25mm uniform margins on all sides.
- **Line & Paragraph Spacing:**
  - Base font size: 12pt (`\selectfont`, `\baselineskip` proportional scaling).
  - Paragraph indentation: `\setlength{\parindent}{11mm}` for body text; `0mm` for title, cert, and lists.
  - Paragraph spacing: `\setlength{\parskip}{6pt plus 2pt minus 1pt}` in `\mainmatter`.
  - Microtype & Emergency Stretch: `\emergencystretch=3em`, `\usepackage{microtype}`.

### Header & Footer Styles
- **Package:** `\usepackage{fancyhdr}` with `\pagestyle{fancy}`.
- **Rule Widths:** `\renewcommand{\headrulewidth}{0pt}` (no header rule).
- **Footer Skip:** `\footskip = 0.625in`.
- **Center Footer (`\cfoot`):** `\footnotesize Dr. D.Y. Patil Institute of Technology, Department of Computer Engineering 2026-27`.
- **Right Footer (`\rfoot`):** `\footnotesize \thepage`.
- **Plain Style (`\fancypagestyle{plain}`):** Configured identically for chapter opening pages so headers remain uniform.

### Page Numbering Conventions
- **Title Page & Approvals:** No page numbers (`\thispagestyle{empty}`).
- **Front Matter (Abstract, Acknowledgments, TOC, LOF, LOT):** `\frontmatter` (Roman numerals, `\pagenumbering{Roman}`, starts with Abstract as page I/i).
- **Main Matter & Annexures:** `\mainmatter` (`\clearpage\pagenumbering{arabic}`).

### Typography & Chapter Headings
- **Font Package:** Latin Modern (`\usepackage{lmodern}`).
- **Chapter Formatting:** Via `titlesec` package with dedicated full-page centered chapter title cards.
- **Section Numbering Depth:** `\setcounter{secnumdepth}{5}`, `\setcounter{tocdepth}{3}`.

---

## 3. Approved Project Identity & Metadata

- **Project Title:** Explainable AI-Based Food Label Compliance and Personalized Product Recommendation System for Indian Packaged Foods
- **Short Name / Tagline:** LabelMitra — Your Friendly Guide to Food Labels
- **Institution:** Dr. D. Y. Patil Institute of Technology, Pimpri, Pune
- **Department:** Department of Computer Engineering
- **Degree:** Bachelor of Engineering (B.E.) in Computer Engineering
- **University:** Savitribai Phule Pune University (SPPU)
- **Academic Year / Term:** 2026–2027 / Term II
- **Internal Guide:** Mrs. Jayashree Kandekar
- **Head of Department (HOD):** Dr. Omkaresh Kulkarni
- **Principal:** Dr. Nitin Sherje
- **Student Group (Option A — Neutral Labels):**
  1. Ajit Chavan (BCOB05)
  2. Atharva Khose (BCOB61)
  3. Prasad Musmade (BCOB71)
  4. Prathmesh Gholap (BCOB04)

---

## 4. Page-by-Page Progress Log

| Page # | Section / Content | Status | Verification & Review Notes |
|---|---|---|---|
| **Page 1** | **Title Page** | **APPROVED BY USER** | Verified and approved by user. Neutral Option A format (`Ajit Chavan (BCOB05)` etc.). PDF compilation & visual layout verification pending Overleaf compilation. |
| **Page 2** | **Certificate Page** | **APPROVED BY USER** | Verified and approved by user at content and LaTeX-source level. PDF compilation & visual layout verification pending Overleaf compilation. |
| **Page 3** | **Project Approval Sheet** | **DRAFTED & READY FOR USER REVIEW** | Modified directly in `reference_report_extracted\BE_PROJECT_REPORT_FORMAT_TERM_II_LATEX_FILE_DY.tex`. Matches reference layout, title, mixed title, Option A student identifiers, guide (`Mrs. Jayashree Kandekar`), HOD (`Dr. Omkaresh Kulkarni`). No fabricated dates or examiner outcomes. Verified in LaTeX source; PDF compilation pending. |
| Page 4 | Abstract | Pending | Waiting for Page 3 approval. |
| Page 5 | Acknowledgments | Pending | Waiting for Page 1 approval. |
| Page 6 | Table of Contents | Pending | Waiting for Page 1 approval. |
| Page 7 | List of Figures | Pending | Waiting for Page 1 approval. |
| Page 8 | List of Tables | Pending | Waiting for Page 1 approval. |
| Chapters 1–12 | Main Matter | Pending | Waiting for Page 1 approval. |
| Annexures | Annexures A–H | Pending | Mandatory status under confirmation by user with college guide. |

---

## 5. Current Action & Next Steps
- **Current State:** Page 1 (Title Page) updated directly in `D:\LabelMitra\reference_report_extracted\BE_PROJECT_REPORT_FORMAT_TERM_II_LATEX_FILE_DY.tex`.
- **Immediate Next Step:** Awaiting user review and approval of Page 1 before proceeding to Page 2 (Certificate Page).
