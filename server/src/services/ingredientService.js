/**
 * LabelMitra - Ingredient Normalization and Knowledge-Base Matching Service (Phase 4)
 *
 * Deterministically normalizes ingredient names, handles vernacular synonyms
 * (e.g., Maida -> Wheat, Groundnut -> Peanut, Badam -> Almond), matches statutory
 * INS additives, and resolves allergen groups based on FSSAI guidelines.
 */

import { INGREDIENT_KNOWLEDGE_BASE, STATUTORY_ALLERGEN_GROUPS } from '../data/ingredientKnowledgeBase.js';

/**
 * Normalizes raw ingredient strings by trimming, lowercasing, stripping
 * bracketed percentages, unwanted punctuation, and excess whitespace.
 *
 * @param {string} rawText
 * @returns {string} Clean normalized string
 */
export function normalizeIngredientName(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  return rawText
    .toLowerCase()
    .replace(/\([0-9]+(?:\.[0-9]+)?\s*%\)/g, '') // remove percentage e.g. (66%)
    .replace(/\[[0-9]+(?:\.[0-9]+)?\s*%\]/g, '')
    .replace(/[\*\#\^\~]/g, '') // remove asterisks/footnotes
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Strips outer brackets and parentheses for deeper token search.
 * e.g., "Refined Wheat Flour (Maida)" -> ["refined wheat flour (maida)", "refined wheat flour", "maida"]
 *
 * @param {string} text
 * @returns {string[]} Candidate search queries
 */
export function generateCandidateTokens(text) {
  const normalized = normalizeIngredientName(text);
  if (!normalized) return [];

  const candidates = new Set([normalized]);

  // Extract text inside parentheses e.g. "Maida" from "Refined Wheat Flour (Maida)"
  const bracketMatches = [...normalized.matchAll(/\(([^)]+)\)/g)];
  bracketMatches.forEach((m) => {
    const inside = m[1].trim();
    if (inside.length >= 2) candidates.add(inside);
  });

  // Also candidate without brackets e.g. "refined wheat flour"
  const withoutBrackets = normalized.replace(/\([^)]*\)/g, '').trim();
  if (withoutBrackets.length >= 2) {
    candidates.add(withoutBrackets);
  }

  return Array.from(candidates);
}

/**
 * Matches a single ingredient query against the deterministic knowledge base.
 *
 * @param {string} query Raw or normalized ingredient text
 * @returns {Object|null} Matched knowledge base entry with matching metadata
 */
export function findIngredientInKnowledgeBase(query) {
  if (!query || typeof query !== 'string') return null;

  const candidates = generateCandidateTokens(query);

  // 1. Direct and Synonym Matching across all candidates
  for (const candidate of candidates) {
    // Check exact canonical match
    const canonicalMatch = INGREDIENT_KNOWLEDGE_BASE.find(
      (entry) => entry.canonicalName.toLowerCase() === candidate
    );
    if (canonicalMatch) {
      return {
        ...canonicalMatch,
        matchedBy: 'canonical',
        matchedTerm: candidate,
        matchConfidence: 1.0,
      };
    }

    // Check exact synonym match
    const synonymMatch = INGREDIENT_KNOWLEDGE_BASE.find((entry) =>
      entry.synonyms.some((syn) => syn.toLowerCase() === candidate)
    );
    if (synonymMatch) {
      return {
        ...synonymMatch,
        matchedBy: 'synonym',
        matchedTerm: candidate,
        matchConfidence: 0.95,
      };
    }
  }

  // 2. Substring & Token-based containment matching
  // (e.g. "roasted groundnut bits" contains "groundnut", "skimmed milk powder" contains "milk powder")
  for (const candidate of candidates) {
    // Prioritize longest synonym matches to avoid partial prefix mistakes
    let bestMatch = null;
    let longestSynonymLen = 0;

    for (const entry of INGREDIENT_KNOWLEDGE_BASE) {
      for (const syn of entry.synonyms) {
        const synLower = syn.toLowerCase();
        // Use word boundary regex for safe token matching
        const escaped = synLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'i');

        if (regex.test(candidate) && synLower.length > longestSynonymLen) {
          bestMatch = entry;
          longestSynonymLen = synLower.length;
        }
      }
    }

    if (bestMatch) {
      return {
        ...bestMatch,
        matchedBy: 'partial_token',
        matchedTerm: candidate,
        matchConfidence: 0.88,
      };
    }
  }

  // 3. INS Code matching if present in query (e.g. "INS 322" or "322(i)")
  const insMatches = [...query.matchAll(/(?:INS|E)?\s*([0-9]{3,4}[a-z]?(?:\([a-z0-9]+\))?)/gi)];
  for (const match of insMatches) {
    const rawIns = match[1].toLowerCase();
    const entry = INGREDIENT_KNOWLEDGE_BASE.find((k) => {
      if (!k.insNumber && (!k.synonyms || k.synonyms.length === 0)) return false;
      const targetIns = (k.insNumber || '').toLowerCase();
      return (
        targetIns.includes(rawIns) ||
        k.synonyms.some((s) => s.toLowerCase() === `ins ${rawIns}` || s.toLowerCase() === rawIns)
      );
    });

    if (entry) {
      return {
        ...entry,
        matchedBy: 'ins_code',
        matchedTerm: match[0],
        matchConfidence: 0.95,
      };
    }
  }

  return null;
}

/**
 * Enriches an array of ingredient items from extraction output with knowledge base metadata.
 *
 * @param {Array<Object|string>} items List of parsed ingredients or ingredient names
 * @returns {Array<Object>} Normalized and enriched ingredients
 */
export function enrichIngredientsWithKnowledge(items = []) {
  if (!Array.isArray(items)) return [];

  return items.map((item, index) => {
    const rawName = typeof item === 'string' ? item : item.name || '';
    const percentage = typeof item === 'object' ? item.percentage || null : null;
    const additives = typeof item === 'object' && Array.isArray(item.additives) ? item.additives : [];

    const matched = findIngredientInKnowledgeBase(rawName);

    // If item had explicit additives detected (e.g. ['INS 322']), check if any additive is an allergen
    let allergenAdditive = null;
    if (additives.length > 0) {
      for (const add of additives) {
        const addMatch = findIngredientInKnowledgeBase(add);
        if (addMatch && addMatch.allergenGroup) {
          allergenAdditive = addMatch;
          break;
        }
      }
    }

    const effectiveAllergenGroup = matched?.allergenGroup || allergenAdditive?.allergenGroup || null;

    return {
      positionOrder: index + 1,
      rawName,
      normalizedName: normalizeIngredientName(rawName),
      canonicalName: matched?.canonicalName || rawName.trim(),
      category: matched?.category || 'General Ingredient',
      isAllergen: !!effectiveAllergenGroup,
      allergenGroup: effectiveAllergenGroup,
      insNumber: matched?.insNumber || allergenAdditive?.insNumber || null,
      function: matched?.function || null,
      concerns: matched?.concerns || null,
      regulatoryStatus: matched?.regulatoryStatus || null,
      percentage,
      additives,
      confidence: matched?.matchConfidence || (rawName ? 0.70 : 0.0),
      matchProvenance: matched
        ? {
            matchedBy: matched.matchedBy,
            matchedTerm: matched.matchedTerm,
            source: matched.source,
          }
        : null,
    };
  });
}

/**
 * Returns all statutory allergen groups recognized under FSSAI.
 */
export function getStatutoryAllergenGroups() {
  return [...STATUTORY_ALLERGEN_GROUPS];
}
