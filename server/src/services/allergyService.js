/**
 * LabelMitra - Personalized Allergy Matching Service (Phase 4)
 *
 * Evaluates extracted food label ingredients and allergen declarations against
 * an authenticated user's allergy profile using deterministic synonym taxonomy.
 * Generates explainable, non-medical assessments with audit provenance.
 */

import {
  findIngredientInKnowledgeBase,
  enrichIngredientsWithKnowledge,
  normalizeIngredientName,
} from './ingredientService.js';

export const ALLERGY_ASSESSMENT_STATUS = {
  CONFIRMED_MATCH: 'CONFIRMED_MATCH',
  POSSIBLE_MATCH: 'POSSIBLE_MATCH',
  NO_MATCH_DETECTED: 'NO_MATCH_DETECTED',
  NO_USER_ALLERGIES: 'NO_USER_ALLERGIES',
  UNKNOWN_INSUFFICIENT_DATA: 'UNKNOWN_INSUFFICIENT_DATA',
};

const NON_MEDICAL_DISCLAIMER =
  'Automated label evaluation is provided for informational purposes only and does not constitute medical advice. Packaging formulations may change; always inspect physical product labels and consult a qualified healthcare professional.';

/**
 * Evaluates a scan's extracted product data against the authenticated user's allergies.
 *
 * @param {Array<Object>} userAllergies List of UserAllergy objects { allergenName, severity, notes }
 * @param {Object} extractedData Structured extraction payload from Phase 3
 * @returns {Object} Personalized allergy matching assessment
 */
export function evaluateScanAllergies(userAllergies = [], extractedData = {}) {
  // 1. Guard against empty user allergies
  if (!Array.isArray(userAllergies) || userAllergies.length === 0) {
    return {
      status: ALLERGY_ASSESSMENT_STATUS.NO_USER_ALLERGIES,
      headline: 'No Active Allergies in Profile',
      summary: 'You have not configured any allergies in your profile. You can add them in Profile Settings.',
      matches: [],
      hasPrecautionaryAlert: false,
      disclaimer: NON_MEDICAL_DISCLAIMER,
    };
  }

  // 2. Guard against missing or unreadable extraction data
  const ingredients = extractedData?.ingredients || {};
  const allergens = extractedData?.allergens || {};
  const rawIngredientsStatement = ingredients?.raw_statement?.value || '';
  const ingredientsMissing = !ingredients?.raw_statement || ingredients.raw_statement.status === 'MISSING';
  const allergensMissing = !allergens?.mandatory_declaration || allergens.mandatory_declaration.status === 'MISSING';

  if (ingredientsMissing && allergensMissing && (!ingredients?.items || ingredients.items.length === 0)) {
    return {
      status: ALLERGY_ASSESSMENT_STATUS.UNKNOWN_INSUFFICIENT_DATA,
      headline: 'Insufficient Label Data for Allergy Assessment',
      summary:
        'Could not reliably extract ingredient or allergen declarations from the uploaded label image. Please retake a clearer photo of the ingredients panel.',
      matches: [],
      hasPrecautionaryAlert: false,
      disclaimer: NON_MEDICAL_DISCLAIMER,
    };
  }

  // 3. Pre-process product ingredients with knowledge base
  const enrichedIngredients = enrichIngredientsWithKnowledge(ingredients.items || []);
  const containsDeclarations = Array.isArray(allergens.contains) ? allergens.contains : [];
  const mayContainDeclarations = Array.isArray(allergens.may_contain) ? allergens.may_contain : [];
  const rawAllergenText = allergens.mandatory_declaration?.value || '';

  const matchedResults = [];

  // 4. Evaluate each user allergy against the product
  for (const userAllergy of userAllergies) {
    const rawAllergenName = userAllergy.allergenName || '';
    const userSeverity = userAllergy.severity || 'Moderate';
    const normalizedUserAllergen = normalizeIngredientName(rawAllergenName);

    // Resolve user's allergy in knowledge base
    const kbEntry = findIngredientInKnowledgeBase(rawAllergenName);
    const targetAllergenGroup = kbEntry?.allergenGroup || kbEntry?.canonicalName || rawAllergenName;
    const targetSynonyms = kbEntry ? [kbEntry.canonicalName.toLowerCase(), ...kbEntry.synonyms.map((s) => s.toLowerCase())] : [normalizedUserAllergen];

    let matchFound = false;

    // --- CHECK SOURCE A: Explicit "Contains" statutory declaration ---
    for (const declared of containsDeclarations) {
      const declaredNorm = declared.toLowerCase();
      const isMatch =
        declaredNorm === normalizedUserAllergen ||
        declaredNorm === targetAllergenGroup.toLowerCase() ||
        targetSynonyms.some((syn) => declaredNorm.includes(syn) || syn.includes(declaredNorm));

      if (isMatch) {
        matchedResults.push({
          matchType: 'CONFIRMED_MATCH',
          source: 'EXPLICIT_ALLERGEN_DECLARATION',
          userAllergy: {
            name: rawAllergenName,
            severity: userSeverity,
          },
          matchedEntity: declared,
          allergenGroup: targetAllergenGroup,
          evidenceText: allergens.mandatory_declaration?.evidence_text || rawAllergenText,
          sourcePanel: allergens.mandatory_declaration?.source_panel || 'INGREDIENTS',
          reason: `Potential allergen detected: Package explicitly declares "${declared}" under allergen statement, matching your ${rawAllergenName} allergy.`,
          confidence: allergens.mandatory_declaration?.confidence || 0.95,
        });
        matchFound = true;
        break;
      }
    }

    if (matchFound) continue;

    // --- CHECK SOURCE B: Ingredient List matching with vernacular synonyms ---
    for (const ing of enrichedIngredients) {
      const ingCanonical = ing.canonicalName.toLowerCase();
      const ingRaw = ing.rawName.toLowerCase();
      const ingGroup = (ing.allergenGroup || '').toLowerCase();

      const isGroupMatch = ingGroup && ingGroup === targetAllergenGroup.toLowerCase();
      const isSynonymMatch = targetSynonyms.some((syn) => ingRaw.includes(syn) || ingCanonical.includes(syn));

      if (isGroupMatch || isSynonymMatch) {
        const isVernacularAlias = ing.rawName.toLowerCase() !== rawAllergenName.toLowerCase();
        const reason = isVernacularAlias
          ? `Potential allergen detected: "${ing.rawName}" is a known form or synonym of ${targetAllergenGroup}, which matches your ${rawAllergenName} profile.`
          : `Potential allergen detected: "${ing.rawName}" is listed in the ingredients, matching your ${rawAllergenName} profile.`;

        matchedResults.push({
          matchType: 'CONFIRMED_MATCH',
          source: 'INGREDIENT_LIST',
          userAllergy: {
            name: rawAllergenName,
            severity: userSeverity,
          },
          matchedEntity: ing.rawName,
          canonicalName: ing.canonicalName,
          allergenGroup: targetAllergenGroup,
          percentage: ing.percentage,
          positionOrder: ing.positionOrder,
          evidenceText: ingredients.raw_statement?.evidence_text || rawIngredientsStatement,
          sourcePanel: ingredients.raw_statement?.source_panel || 'INGREDIENTS',
          reason,
          confidence: ing.confidence || 0.90,
        });
        matchFound = true;
        break;
      }
    }

    if (matchFound) continue;

    // --- CHECK SOURCE C: Precautionary "May Contain" statement ---
    for (const declared of mayContainDeclarations) {
      const declaredNorm = declared.toLowerCase();
      const isMatch =
        declaredNorm === normalizedUserAllergen ||
        declaredNorm === targetAllergenGroup.toLowerCase() ||
        targetSynonyms.some((syn) => declaredNorm.includes(syn) || syn.includes(declaredNorm));

      if (isMatch) {
        matchedResults.push({
          matchType: 'POSSIBLE_MATCH',
          source: 'PRECAUTIONARY_ADVISORY',
          userAllergy: {
            name: rawAllergenName,
            severity: userSeverity,
          },
          matchedEntity: declared,
          allergenGroup: targetAllergenGroup,
          evidenceText: allergens.mandatory_declaration?.evidence_text || rawAllergenText,
          sourcePanel: allergens.mandatory_declaration?.source_panel || 'INGREDIENTS',
          reason: `Precautionary allergen advisory: Package notes that it "May contain ${declared}", which matches your stated ${rawAllergenName} allergy. Cross-contact risk possible.`,
          confidence: allergens.mandatory_declaration?.confidence || 0.85,
        });
        matchFound = true;
        break;
      }
    }
  }

  // 5. Determine Overall Assessment Status
  const hasConfirmed = matchedResults.some((m) => m.matchType === 'CONFIRMED_MATCH');
  const hasPossible = matchedResults.some((m) => m.matchType === 'POSSIBLE_MATCH');

  let overallStatus = ALLERGY_ASSESSMENT_STATUS.NO_MATCH_DETECTED;
  let headline = 'No Profile Allergens Detected';
  let summary =
    'None of the declared ingredients or statutory allergen warnings on this label match your configured allergies.';

  if (hasConfirmed) {
    overallStatus = ALLERGY_ASSESSMENT_STATUS.CONFIRMED_MATCH;
    headline = 'Potential Allergen Warning';
    summary = `Detected ${matchedResults.filter((m) => m.matchType === 'CONFIRMED_MATCH').length} allergen(s) on the label that match your personal allergy profile. This product may not be suitable for you.`;
  } else if (hasPossible) {
    overallStatus = ALLERGY_ASSESSMENT_STATUS.POSSIBLE_MATCH;
    headline = 'Precautionary Allergen Notice';
    summary =
      'This product carries a precautionary "May contain" advisory matching one or more of your stated allergies.';
  }

  return {
    status: overallStatus,
    headline,
    summary,
    matches: matchedResults,
    hasPrecautionaryAlert: hasPossible,
    enrichedIngredientsCount: enrichedIngredients.length,
    disclaimer: NON_MEDICAL_DISCLAIMER,
  };
}
