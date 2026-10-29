/**
 * LabelMitra - Ingredient Knowledge Base & Normalization Unit Tests (Phase 4 Step 2)
 */

import {
  normalizeIngredientName,
  generateCandidateTokens,
  findIngredientInKnowledgeBase,
  enrichIngredientsWithKnowledge,
  getStatutoryAllergenGroups,
} from '../src/services/ingredientService.js';

describe('Phase 4: Ingredient Normalization & Knowledge Base Service', () => {
  describe('1. normalizeIngredientName', () => {
    it('normalizes casing and trims whitespace', () => {
      expect(normalizeIngredientName('  REFINED WHEAT FLOUR   ')).toBe('refined wheat flour');
    });

    it('strips percentage declarations', () => {
      expect(normalizeIngredientName('Refined Wheat Flour (Maida) (66%)')).toBe('refined wheat flour (maida)');
      expect(normalizeIngredientName('Cashew Nuts [12.5%]')).toBe('cashew nuts');
    });

    it('handles asterisks and punctuation footnotes', () => {
      expect(normalizeIngredientName('*Edible Vegetable Oil~')).toBe('edible vegetable oil');
    });
  });

  describe('2. generateCandidateTokens', () => {
    it('generates outer and inner bracket candidates', () => {
      const candidates = generateCandidateTokens('Refined Wheat Flour (Maida)');
      expect(candidates).toContain('refined wheat flour (maida)');
      expect(candidates).toContain('maida');
      expect(candidates).toContain('refined wheat flour');
    });
  });

  describe('3. findIngredientInKnowledgeBase - Vernacular Indian Synonyms', () => {
    it('resolves Groundnut and Mungfali to Peanut allergen group', () => {
      const match1 = findIngredientInKnowledgeBase('Groundnut Oil');
      expect(match1).not.toBeNull();
      expect(match1.allergenGroup).toBe('Peanut');

      const match2 = findIngredientInKnowledgeBase('Roasted Groundnuts');
      expect(match2).not.toBeNull();
      expect(match2.allergenGroup).toBe('Peanut');
    });

    it('resolves Maida, Atta, and Suji to Wheat allergen group', () => {
      const maidaMatch = findIngredientInKnowledgeBase('Maida');
      expect(maidaMatch).not.toBeNull();
      expect(maidaMatch.canonicalName).toBe('Wheat');
      expect(maidaMatch.allergenGroup).toBe('Wheat');

      const attaMatch = findIngredientInKnowledgeBase('Whole Wheat Atta');
      expect(attaMatch).not.toBeNull();
      expect(attaMatch.allergenGroup).toBe('Wheat');
    });

    it('resolves Badam, Kaju, and Pista to Tree nuts allergen group', () => {
      const kaju = findIngredientInKnowledgeBase('Kaju (Cashew)');
      expect(kaju).not.toBeNull();
      expect(kaju.allergenGroup).toBe('Tree nuts');

      const badam = findIngredientInKnowledgeBase('Almond (Badam)');
      expect(badam).not.toBeNull();
      expect(badam.allergenGroup).toBe('Tree nuts');
    });

    it('resolves Til to Sesame and Rai to Mustard', () => {
      const til = findIngredientInKnowledgeBase('Til (Sesame Seeds)');
      expect(til).not.toBeNull();
      expect(til.allergenGroup).toBe('Sesame');

      const rai = findIngredientInKnowledgeBase('Rai Seeds');
      expect(rai).not.toBeNull();
      expect(rai.allergenGroup).toBe('Mustard');
    });

    it('resolves Milk solids, Whey, and SMP to Milk allergen group', () => {
      const milkSolids = findIngredientInKnowledgeBase('Milk Solids (Skimmed Milk Powder)');
      expect(milkSolids).not.toBeNull();
      expect(milkSolids.allergenGroup).toBe('Milk');

      const whey = findIngredientInKnowledgeBase('Demineralised Whey Powder');
      expect(whey).not.toBeNull();
      expect(whey.allergenGroup).toBe('Milk');
    });

    it('resolves INS 322 and Soya Lecithin to Soy allergen group', () => {
      const ins322 = findIngredientInKnowledgeBase('Emulsifier (INS 322)');
      expect(ins322).not.toBeNull();
      expect(ins322.allergenGroup).toBe('Soy');

      const soya = findIngredientInKnowledgeBase('Defatted Soya Flour');
      expect(soya).not.toBeNull();
      expect(soya.allergenGroup).toBe('Soy');
    });

    it('identifies non-allergen ingredients correctly', () => {
      const sugar = findIngredientInKnowledgeBase('Invert Sugar Syrup');
      expect(sugar).not.toBeNull();
      expect(sugar.canonicalName).toBe('Sugar');
      expect(sugar.allergenGroup).toBeNull();

      const oil = findIngredientInKnowledgeBase('Refined Palm Oil');
      expect(oil).not.toBeNull();
      expect(oil.canonicalName).toBe('Edible Vegetable Oil');
      expect(oil.allergenGroup).toBeNull();
    });
  });

  describe('4. enrichIngredientsWithKnowledge', () => {
    it('enriches extraction items with canonical names, allergen flags, and provenance', () => {
      const rawExtractedItems = [
        { name: 'Refined Wheat Flour (Maida)', percentage: 66, additives: [] },
        { name: 'Sugar', percentage: 22, additives: [] },
        { name: 'Refined Palm Oil', percentage: null, additives: [] },
        { name: 'Milk Solids', percentage: 2, additives: [] },
        { name: 'Emulsifiers (INS 322, INS 471)', percentage: null, additives: ['INS 322', 'INS 471'] },
      ];

      const enriched = enrichIngredientsWithKnowledge(rawExtractedItems);
      expect(enriched).toHaveLength(5);

      // Wheat check
      expect(enriched[0].canonicalName).toBe('Wheat');
      expect(enriched[0].isAllergen).toBe(true);
      expect(enriched[0].allergenGroup).toBe('Wheat');
      expect(enriched[0].percentage).toBe(66);
      expect(enriched[0].positionOrder).toBe(1);

      // Sugar check
      expect(enriched[1].canonicalName).toBe('Sugar');
      expect(enriched[1].isAllergen).toBe(false);
      expect(enriched[1].allergenGroup).toBeNull();

      // Milk solids check
      expect(enriched[3].canonicalName).toBe('Milk');
      expect(enriched[3].isAllergen).toBe(true);
      expect(enriched[3].allergenGroup).toBe('Milk');

      // Emulsifier with INS 322 check
      expect(enriched[4].isAllergen).toBe(true);
      expect(enriched[4].allergenGroup).toBe('Soy');
    });
  });

  describe('5. getStatutoryAllergenGroups', () => {
    it('returns the 12 FSSAI statutory allergen categories', () => {
      const groups = getStatutoryAllergenGroups();
      expect(groups).toContain('Peanut');
      expect(groups).toContain('Wheat');
      expect(groups).toContain('Milk');
      expect(groups).toContain('Soy');
      expect(groups).toContain('Tree nuts');
      expect(groups).toContain('Mustard');
    });
  });
});
