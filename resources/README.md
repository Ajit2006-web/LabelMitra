# LabelMitra External Resource Documentation & Register

This directory maintains the documentation for all external regulations, references, scientific literature, datasets, and technical documentation used across the **LabelMitra - AI-Powered Food Label Analysis** project.

## Purpose

The resource register ensures that every regulatory assertion, compliance rule, ingredient taxonomy, allergen classification, and technical choice can be independently traced to its authoritative origin.

## Directory Structure

```
resources/
├── README.md                  # This verification guide
├── resource_register.md       # Central tabular and detailed register of all external sources
├── regulations/               # Official FSSAI gazette notifications and guidelines
├── ingredient_references/     # INS additive lists and allergen classifications
├── datasets/                  # Verified product datasets and schemas
├── technical_documentation/   # Framework, OCR, embedding and database documentation
├── research_papers/           # Scholarly papers on food label XAI, OCR, and NLP
└── evaluation_references/     # Ground-truth evaluation benchmarks and metric standards
```

## Maintenance Rules

1. Every external source used in the implementation must be assigned a unique `Resource ID` (e.g., `REG-001`, `ING-001`, `TECH-001`).
2. Never invent source titles, URLs, gazette references, or publication dates.
3. Every entry in `resource_register.md` must record its exact verification status, source URL, publisher, date accessed, and the project feature supported.
4. When a regulation or reference is updated, record the effective date and reason for revision.
