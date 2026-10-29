import { extractStructuredProductInfo } from '../src/services/extractionService.js';

describe('Phase 3: Structured Product Information Extraction Test Suite', () => {
  describe('1. Parle Glucose Biscuit Label Extraction (biscuit_ground_truth)', () => {
    const biscuitPanels = [
      {
        imageSide: 'FRONT',
        confidenceScore: 94.5,
        rawText: `LabelMitra Packaged Food Product\nRich Glucose Energy Biscuits\nNet Quantity: 250 g\n100% Vegetarian (Green Logo Declared)`,
      },
      {
        imageSide: 'NUTRITION',
        confidenceScore: 93.0,
        rawText: `NUTRITIONAL INFORMATION Per 100g\nEnergy: 454 kcal\nProtein: 6.5 g\nCarbohydrate: 78.0 g\nTotal Sugars: 26.5 g (Added Sugar: 25.0 g)\nTotal Fat: 13.0 g | Saturated Fat: 6.5 g\nTrans Fat: 0.0 g | Sodium: 320 mg`,
      },
      {
        imageSide: 'INGREDIENTS',
        confidenceScore: 92.5,
        rawText: `INGREDIENTS: Wheat Flour (66%), Sugar, Edible Vegetable Oil (Palm Oil), Invert Sugar Syrup, Leavening Agents [INS 503(ii), INS 500(ii)], Salt, Milk Solids (1.1%), Emulsifiers [INS 322 (Soy Lecithin)], Dough Conditioner [INS 223].\nALLERGEN DECLARATION: Contains Wheat, Milk and Soy. May contain traces of Nuts.`,
      },
      {
        imageSide: 'SIDE',
        confidenceScore: 93.5,
        rawText: `FSSAI LIC. NO. 10014047000120\nBatch No: B724A1 | Mfg Date: 15/09/2026\nBest Before: 6 Months from packaging date\nMRP Rs. 25.00 (Incl. of all taxes)\nManufactured by Parle Products Pvt. Ltd., Mumbai, Maharashtra`,
      },
    ];

    it('extracts product identity and vegetarian status with evidence', () => {
      const result = extractStructuredProductInfo(biscuitPanels);

      expect(result.product_identity.product_name.value).toContain('Glucose Energy Biscuits');
      expect(result.product_identity.product_name.source_panel).toBe('FRONT');
      expect(result.product_identity.product_name.status).toBe('EXTRACTED');

      expect(result.product_identity.veg_status.value).toBe('VEG');
      expect(result.product_identity.veg_status.evidence_text).toContain('100% Vegetarian');

      expect(result.product_identity.category.value).toBe('Biscuits');
      expect(result.product_identity.category.status).toBe('INFERRED');
    });

    it('extracts statutory declarations (FSSAI license, Net Qty, MRP, Batch, Dates)', () => {
      const result = extractStructuredProductInfo(biscuitPanels);
      const stat = result.statutory_declarations;

      // 14-digit FSSAI license
      expect(stat.fssai_license.value).toBe('10014047000120');
      expect(stat.fssai_license.source_panel).toBe('SIDE');
      expect(stat.fssai_license.evidence_text).toContain('10014047000120');

      // Net Quantity
      expect(stat.net_quantity.value).toBe(250);
      expect(stat.net_quantity.unit).toBe('g');

      // MRP
      expect(stat.mrp.value).toBe(25.0);
      expect(stat.mrp.currency).toBe('INR');

      // Batch & Dates
      expect(stat.batch_number.value).toBe('B724A1');
      expect(stat.date_of_manufacture.raw_text).toBe('15/09/2026');
      expect(stat.best_before.value).toContain('6 Months');
      expect(stat.best_before.period_months).toBe(6);
    });

    it('extracts manufacturer name and location', () => {
      const result = extractStructuredProductInfo(biscuitPanels);

      expect(result.manufacturer.name.value).toContain('Parle Products');
      expect(result.manufacturer.address.value).toContain('Mumbai');
    });

    it('tokenizes ingredients and identifies INS food additives', () => {
      const result = extractStructuredProductInfo(biscuitPanels);
      const ing = result.ingredients;

      expect(ing.raw_statement.value).toContain('Wheat Flour');
      expect(ing.items.length).toBeGreaterThanOrEqual(5);

      // Percentage check e.g. Wheat Flour (66%)
      const wheat = ing.items.find((i) => i.name.includes('Wheat Flour'));
      expect(wheat).toBeDefined();
      expect(wheat.percentage).toBe(66);

      // INS Additives detection
      const insCodes = ing.detected_ins_additives.map((a) => a.ins_code);
      expect(insCodes).toContain('INS 503(ii)');
      expect(insCodes).toContain('INS 500(ii)');
      expect(insCodes).toContain('INS 322');
      expect(insCodes).toContain('INS 223');
    });

    it('extracts mandatory and advisory allergen statements', () => {
      const result = extractStructuredProductInfo(biscuitPanels);
      const allergens = result.allergens;

      expect(allergens.mandatory_declaration.value).toContain('Contains Wheat, Milk and Soy');
      expect(allergens.contains).toEqual(expect.arrayContaining(['Wheat', 'Milk', 'Soy']));
      expect(allergens.may_contain).toEqual(expect.arrayContaining(['Nuts']));
    });

    it('extracts full nutrition facts table with normalized units', () => {
      const result = extractStructuredProductInfo(biscuitPanels);
      const nutrients = result.nutrition.nutrients;

      expect(result.nutrition.reference_unit).toBe('100g');
      expect(nutrients.energy.value).toBe(454);
      expect(nutrients.energy.unit).toBe('kcal');
      expect(nutrients.protein.value).toBe(6.5);
      expect(nutrients.carbohydrate.value).toBe(78.0);
      expect(nutrients.total_sugar.value).toBe(26.5);
      expect(nutrients.added_sugar.value).toBe(25.0);
      expect(nutrients.fat.value).toBe(13.0);
      expect(nutrients.saturated_fat.value).toBe(6.5);
      expect(nutrients.trans_fat.value).toBe(0.0);
      expect(nutrients.sodium.value).toBe(320);
      expect(nutrients.sodium.unit).toBe('mg');
    });
  });

  describe('2. Maggi Instant Noodles Label Extraction (instant_noodles_ground_truth)', () => {
    const noodlePanels = [
      {
        imageSide: 'FRONT',
        confidenceScore: 95.0,
        rawText: `Nestle Maggi\n2-Minute Masala Noodles\nNet Qty: 70g | MRP Rs. 14.00\n100% Vegetarian Food`,
      },
      {
        imageSide: 'NUTRITION',
        confidenceScore: 94.0,
        rawText: `NUTRITIONAL VALUES Per 100g\nEnergy: 427 kcal\nProtein: 8.0 g\nCarbohydrate: 63.5 g\nTotal Sugars: 2.2 g\nAdded Sugars: 1.1 g\nTotal Fat: 15.7 g\nSaturated Fat: 6.8 g\nTrans Fat: 0.12 g\nSodium: 1020 mg`,
      },
      {
        imageSide: 'INGREDIENTS',
        confidenceScore: 92.0,
        rawText: `INGREDIENTS: Refined Wheat Flour (Maida), Palm Oil, Iodised Salt, Wheat Gluten, Thickeners (INS 508, INS 412), Acidity Regulators [INS 501(i), INS 500(i)], Humectant [INS 451(i)], Mixed Spices (23.6%) [Dehydrated Onion, Turmeric], Flavour Enhancer (INS 635), Colour (INS 150d).\nALLERGEN ADVISORY: Contains Wheat and Peanut. May contain Milk, Mustard and Soy.`,
      },
      {
        imageSide: 'SIDE',
        confidenceScore: 93.0,
        rawText: `FSSAI LIC. NO. 10012011000168\nBatch No: M609B2\nMfg Date: 01/10/2026\nBest Before: 9 Months from packaging\nManufactured by Nestle India Limited, Barakhamba Lane, New Delhi`,
      },
    ];

    it('extracts noodle brand, category, high-sodium nutrition values, and additives', () => {
      const result = extractStructuredProductInfo(noodlePanels);

      // Identity & Category
      expect(result.product_identity.category.value).toBe('Instant Noodles');
      expect(result.statutory_declarations.fssai_license.value).toBe('10012011000168');
      expect(result.statutory_declarations.net_quantity.value).toBe(70);

      // High Sodium nutrition
      expect(result.nutrition.nutrients.sodium.value).toBe(1020);
      expect(result.nutrition.nutrients.trans_fat.value).toBe(0.12);

      // INS codes
      const insList = result.ingredients.detected_ins_additives.map((a) => a.ins_code);
      expect(insList).toContain('INS 508');
      expect(insList).toContain('INS 412');
      expect(insList).toContain('INS 150d');

      // Allergens
      expect(result.allergens.contains).toEqual(expect.arrayContaining(['Wheat', 'Peanut']));
      expect(result.allergens.may_contain).toEqual(expect.arrayContaining(['Milk', 'Mustard', 'Soy']));
    });
  });

  describe('3. Real Fruit Beverage Label Extraction (fruit_beverage_ground_truth)', () => {
    const beveragePanels = [
      {
        imageSide: 'FRONT',
        confidenceScore: 95.0,
        rawText: `Real Fruit Power\nMixed Fruit Beverage\nNet Qty: 1000 ml\nPure Veg Green Insignia`,
      },
      {
        imageSide: 'NUTRITION',
        confidenceScore: 94.0,
        rawText: `NUTRITION FACTS Per 100ml\nEnergy: 56.0 kcal\nProtein: 0.4 g\nCarbohydrate: 13.6 g\nTotal Sugars: 13.0 g\nAdded Sugar: 11.5 g\nTotal Fat: 0.0 g\nSaturated Fat: 0.0 g\nTrans Fat: 0.0 g\nSodium: 14.0 mg`,
      },
      {
        imageSide: 'SIDE',
        confidenceScore: 93.0,
        rawText: `FSSAI LIC. NO. 10012011000618\nMRP Rs. 130.00\nBatch No: RF880C\nManufactured by Dabur India Limited, New Delhi`,
      },
    ];

    it('extracts beverage volume in ml, liquid reference unit (100ml), and low fat values', () => {
      const result = extractStructuredProductInfo(beveragePanels);

      expect(result.product_identity.category.value).toBe('Beverages');
      expect(result.statutory_declarations.net_quantity.value).toBe(1000);
      expect(result.statutory_declarations.net_quantity.unit).toBe('ml');

      expect(result.nutrition.reference_unit).toBe('100ml');
      expect(result.nutrition.nutrients.energy.value).toBe(56.0);
      expect(result.nutrition.nutrients.fat.value).toBe(0.0);
      expect(result.nutrition.nutrients.total_sugar.value).toBe(13.0);
      expect(result.statutory_declarations.fssai_license.value).toBe('10012011000618');
    });
  });

  describe('4. Graceful Handling of Missing Information & Zero Hallucination', () => {
    it('returns null and status: MISSING when fields are absent from label', () => {
      const minimalPanel = [
        {
          imageSide: 'FRONT',
          confidenceScore: 90.0,
          rawText: 'Generic Product Name\nNet Quantity: 100 g',
        },
      ];

      const result = extractStructuredProductInfo(minimalPanel);

      expect(result.statutory_declarations.fssai_license.value).toBeNull();
      expect(result.statutory_declarations.fssai_license.status).toBe('MISSING');

      expect(result.statutory_declarations.mrp.value).toBeNull();
      expect(result.statutory_declarations.mrp.status).toBe('MISSING');

      expect(result.nutrition.nutrients.energy.value).toBeNull();
      expect(result.nutrition.nutrients.energy.status).toBe('MISSING');

      expect(result.allergens.mandatory_declaration.value).toBeNull();
      expect(result.allergens.mandatory_declaration.status).toBe('MISSING');
    });

    it('returns empty schema when input is empty array', () => {
      const result = extractStructuredProductInfo([]);

      expect(result.schema_version).toBe('1.0');
      expect(result.product_identity.product_name.value).toBeNull();
      expect(result.extraction_summary.extraction_status).toBe('NOT_EXTRACTED');
    });
  });
});
