/**
 * LabelMitra - Personalized Allergy Matching Service Unit Tests (Phase 4 Step 3)
 */

import {
  evaluateScanAllergies,
  ALLERGY_ASSESSMENT_STATUS,
} from '../src/services/allergyService.js';

describe('Phase 4: Personalized Allergy Matching Service', () => {
  const sampleBiscuitExtractedData = {
    ingredients: {
      raw_statement: {
        value: 'Refined Wheat Flour (Maida) (66%), Sugar, Edible Vegetable Oil (Palm), Milk Solids, Roasted Groundnuts (5%)',
        status: 'EXTRACTED',
        source_panel: 'INGREDIENTS',
        evidence_text: 'INGREDIENTS: Refined Wheat Flour (Maida) (66%), Sugar, Edible Vegetable Oil (Palm), Milk Solids, Roasted Groundnuts (5%)',
        confidence: 0.95,
      },
      items: [
        { name: 'Refined Wheat Flour (Maida)', percentage: 66, additives: [] },
        { name: 'Sugar', percentage: null, additives: [] },
        { name: 'Edible Vegetable Oil (Palm)', percentage: null, additives: [] },
        { name: 'Milk Solids', percentage: null, additives: [] },
        { name: 'Roasted Groundnuts', percentage: 5, additives: [] },
      ],
    },
    allergens: {
      mandatory_declaration: {
        value: 'CONTAINS WHEAT, MILK, PEANUT. MAY CONTAIN TREE NUTS.',
        status: 'EXTRACTED',
        source_panel: 'INGREDIENTS',
        evidence_text: 'ALLERGEN DECLARATION: CONTAINS WHEAT, MILK, PEANUT. MAY CONTAIN TREE NUTS.',
        confidence: 0.95,
      },
      contains: ['Wheat', 'Milk', 'Peanut'],
      may_contain: ['Tree nuts'],
    },
  };

  describe('1. Vernacular Synonym Matching (Groundnut -> Peanut)', () => {
    it('detects Groundnut in ingredients when user has a Peanut allergy', () => {
      const userAllergies = [{ allergenName: 'Peanut', severity: 'Severe' }];
      const result = evaluateScanAllergies(userAllergies, sampleBiscuitExtractedData);

      expect(result.status).toBe(ALLERGY_ASSESSMENT_STATUS.CONFIRMED_MATCH);
      expect(result.matches.length).toBeGreaterThanOrEqual(1);

      const match = result.matches[0];
      expect(match.matchType).toBe('CONFIRMED_MATCH');
      expect(match.userAllergy.name).toBe('Peanut');
      expect(match.userAllergy.severity).toBe('Severe');
      expect(match.allergenGroup).toBe('Peanut');
      expect(match.reason).toContain('Potential allergen detected');
      expect(result.disclaimer).toBeTruthy();
    });
  });

  describe('2. Explicit Allergen Declaration Matching', () => {
    it('detects explicit declaration of Wheat and Milk matching user profile', () => {
      const userAllergies = [
        { allergenName: 'Milk', severity: 'Moderate' },
        { allergenName: 'Wheat', severity: 'Mild' },
      ];
      const result = evaluateScanAllergies(userAllergies, sampleBiscuitExtractedData);

      expect(result.status).toBe(ALLERGY_ASSESSMENT_STATUS.CONFIRMED_MATCH);
      expect(result.matches).toHaveLength(2);

      const milkMatch = result.matches.find((m) => m.userAllergy.name === 'Milk');
      expect(milkMatch).toBeDefined();
      expect(milkMatch.matchType).toBe('CONFIRMED_MATCH');
    });
  });

  describe('3. Precautionary Advisory ("May Contain") Handling', () => {
    it('flags Tree nuts as POSSIBLE_MATCH when declared under May Contain', () => {
      const extractedWithoutPeanut = {
        ingredients: {
          raw_statement: {
            value: 'Wheat Flour, Sugar, Palm Oil',
            status: 'EXTRACTED',
            source_panel: 'INGREDIENTS',
            confidence: 0.90,
          },
          items: [{ name: 'Wheat Flour' }, { name: 'Sugar' }],
        },
        allergens: {
          mandatory_declaration: {
            value: 'May contain Tree nuts',
            status: 'EXTRACTED',
            source_panel: 'INGREDIENTS',
            confidence: 0.90,
          },
          contains: [],
          may_contain: ['Tree nuts'],
        },
      };

      const userAllergies = [{ allergenName: 'Tree nuts', severity: 'Moderate' }];
      const result = evaluateScanAllergies(userAllergies, extractedWithoutPeanut);

      expect(result.status).toBe(ALLERGY_ASSESSMENT_STATUS.POSSIBLE_MATCH);
      expect(result.hasPrecautionaryAlert).toBe(true);
      expect(result.matches[0].matchType).toBe('POSSIBLE_MATCH');
      expect(result.matches[0].source).toBe('PRECAUTIONARY_ADVISORY');
      expect(result.matches[0].reason).toContain('Precautionary allergen advisory');
    });
  });

  describe('4. No Match Detected', () => {
    it('returns NO_MATCH_DETECTED with non-medical disclaimer when no user allergies match', () => {
      const userAllergies = [{ allergenName: 'Mustard', severity: 'Severe' }];
      const result = evaluateScanAllergies(userAllergies, sampleBiscuitExtractedData);

      expect(result.status).toBe(ALLERGY_ASSESSMENT_STATUS.NO_MATCH_DETECTED);
      expect(result.matches).toHaveLength(0);
      expect(result.headline).toBe('No Profile Allergens Detected');
      expect(result.disclaimer).toContain('does not constitute medical advice');
    });
  });

  describe('5. Empty User Allergies Profile', () => {
    it('returns NO_USER_ALLERGIES when profile list is empty', () => {
      const result = evaluateScanAllergies([], sampleBiscuitExtractedData);

      expect(result.status).toBe(ALLERGY_ASSESSMENT_STATUS.NO_USER_ALLERGIES);
      expect(result.matches).toHaveLength(0);
      expect(result.headline).toContain('No Active Allergies');
    });
  });

  describe('6. Insufficient or Missing Label Data', () => {
    it('returns UNKNOWN_INSUFFICIENT_DATA when label has no ingredients or allergens', () => {
      const emptyExtraction = {
        ingredients: {
          raw_statement: { status: 'MISSING' },
          items: [],
        },
        allergens: {
          mandatory_declaration: { status: 'MISSING' },
          contains: [],
          may_contain: [],
        },
      };

      const userAllergies = [{ allergenName: 'Peanut', severity: 'Moderate' }];
      const result = evaluateScanAllergies(userAllergies, emptyExtraction);

      expect(result.status).toBe(ALLERGY_ASSESSMENT_STATUS.UNKNOWN_INSUFFICIENT_DATA);
      expect(result.headline).toContain('Insufficient Label Data');
      expect(result.matches).toHaveLength(0);
    });
  });
});
