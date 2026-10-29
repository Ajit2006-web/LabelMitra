/**
 * LabelMitra - Structured Product Information Extraction Service (Phase 3)
 *
 * Deterministically parses multi-panel OCR text into verified structured entities
 * conforming to FSSAI (Labelling and Display) Regulations.
 * Every extracted field retains source panel provenance, matched OCR evidence text,
 * and confidence scores. Never hallucinates missing information.
 */

// Known statutory INS additive master dictionary for enriched labelling metadata
const KNOWN_INS_ADDITIVES = {
  '150d': { name: 'Sulphite ammonia caramel', functionalClass: 'Colour' },
  '160a(ii)': { name: 'Beta-carotenes (vegetable)', functionalClass: 'Colour' },
  '223': { name: 'Sodium metabisulphite', functionalClass: 'Dough Conditioner / Preservative' },
  '300': { name: 'Ascorbic acid (Vitamin C)', functionalClass: 'Antioxidant' },
  '322': { name: 'Lecithins (Soy Lecithin)', functionalClass: 'Emulsifier' },
  '330': { name: 'Citric acid', functionalClass: 'Acidity Regulator' },
  '412': { name: 'Guar gum', functionalClass: 'Thickener / Stabilizer' },
  '451(i)': { name: 'Pentasodium triphosphate', functionalClass: 'Humectant / Stabilizer' },
  '500(i)': { name: 'Sodium carbonate', functionalClass: 'Acidity Regulator' },
  '500(ii)': { name: 'Sodium hydrogen carbonate (Baking Soda)', functionalClass: 'Leavening Agent' },
  '501(i)': { name: 'Potassium carbonate', functionalClass: 'Acidity Regulator' },
  '503(ii)': { name: 'Ammonium hydrogen carbonate', functionalClass: 'Leavening Agent' },
  '508': { name: 'Potassium chloride', functionalClass: 'Gelling Agent / Salt Substitute' },
  '635': { name: 'Disodium 5\'-ribonucleotides', functionalClass: 'Flavour Enhancer' },
};

// Recognized major food allergen categories under FSSAI regulations
const STATUTORY_ALLERGENS = [
  'Wheat', 'Gluten', 'Crustaceans', 'Fish', 'Egg', 'Peanut', 'Groundnut',
  'Soy', 'Soybean', 'Milk', 'Tree nuts', 'Nuts', 'Sesame', 'Mustard', 'Sulphite'
];

/**
 * Main entry point: Extracts structured product info from array of OCR panel results.
 * @param {Array<{ imageSide: string, rawText: string, confidenceScore?: number, lines?: Array }>} ocrResults
 * @returns {Object} Structured product information payload with evidence metadata
 */
export function extractStructuredProductInfo(ocrResults = []) {
  if (!Array.isArray(ocrResults) || ocrResults.length === 0) {
    return buildEmptyExtraction();
  }

  // Index text and lines by panel for panel-prioritized extraction
  const panelsMap = {};
  ocrResults.forEach((panel) => {
    const side = (panel.imageSide || 'FRONT').toUpperCase();
    panelsMap[side] = {
      rawText: panel.rawText || '',
      confidence: Number(panel.confidenceScore || 85.0),
      lines: panel.lines || [],
      side,
    };
  });

  // Also build combined corpus for cross-panel fallback search
  const combinedLines = [];
  ocrResults.forEach((panel) => {
    const side = (panel.imageSide || 'FRONT').toUpperCase();
    const conf = Number(panel.confidenceScore || 85.0);
    const lines = (panel.rawText || '').split('\n').map((l) => l.trim()).filter(Boolean);
    lines.forEach((line) => {
      combinedLines.push({ text: line, side, confidence: conf });
    });
  });

  // Run modular extractors
  const productIdentity = extractProductIdentity(panelsMap, combinedLines);
  const statutoryDeclarations = extractStatutoryDeclarations(panelsMap, combinedLines);
  const manufacturer = extractManufacturer(panelsMap, combinedLines);
  const ingredients = extractIngredients(panelsMap, combinedLines);
  const allergens = extractAllergens(panelsMap, combinedLines, ingredients);
  const nutrition = extractNutrition(panelsMap, combinedLines);

  // Compute extraction metrics
  let totalFields = 0;
  let extractedCount = 0;
  let totalConfidence = 0;

  const countField = (f) => {
    totalFields++;
    if (f && f.status === 'EXTRACTED') {
      extractedCount++;
      totalConfidence += Number(f.confidence || 0.85);
    }
  };

  countField(productIdentity.product_name);
  countField(productIdentity.brand);
  countField(productIdentity.veg_status);
  countField(statutoryDeclarations.fssai_license);
  countField(statutoryDeclarations.net_quantity);
  countField(statutoryDeclarations.mrp);
  countField(statutoryDeclarations.batch_number);
  countField(statutoryDeclarations.date_of_manufacture);
  countField(statutoryDeclarations.best_before);
  countField(manufacturer.name);
  countField(ingredients.raw_statement);
  countField(allergens.mandatory_declaration);

  Object.values(nutrition.nutrients).forEach((n) => countField(n));

  const averageConfidence = extractedCount > 0
    ? Math.round((totalConfidence / extractedCount) * 100) / 100
    : 0;

  const extractionStatus = extractedCount >= 8 && averageConfidence >= 80
    ? 'HIGH_CONFIDENCE'
    : extractedCount >= 4
      ? 'MODERATE_CONFIDENCE'
      : 'NEEDS_VERIFICATION';

  return {
    schema_version: '1.0',
    product_identity: productIdentity,
    statutory_declarations: statutoryDeclarations,
    manufacturer,
    ingredients,
    allergens,
    nutrition,
    extraction_summary: {
      fields_extracted: extractedCount,
      fields_missing: totalFields - extractedCount,
      average_confidence: Math.round(averageConfidence * 10) / 10,
      extraction_status: extractionStatus,
    },
  };
}

// -------------------------------------------------------------
// 1. PRODUCT IDENTITY EXTRACTOR
// -------------------------------------------------------------
function extractProductIdentity(panelsMap, combinedLines) {
  const frontPanel = panelsMap['FRONT'];
  const frontLines = frontPanel ? frontPanel.rawText.split('\n').map((l) => l.trim()).filter(Boolean) : [];

  let productName = null;
  let brand = null;
  let category = null;
  let vegStatus = null;

  // 1. Veg Status detection
  for (const item of combinedLines) {
    const text = item.text.toLowerCase();
    if (text.includes('100% vegetarian') || text.includes('green logo') || text.includes('pure veg') || text.includes('vegetarian food')) {
      vegStatus = createField('VEG', item.confidence, item.side, item.text);
      break;
    } else if (text.includes('non-vegetarian') || text.includes('brown logo') || text.includes('contains meat') || text.includes('contains egg')) {
      vegStatus = createField('NON_VEG', item.confidence, item.side, item.text);
      break;
    }
  }

  // Default to UNKNOWN if no explicit symbol or declaration found
  if (!vegStatus) {
    vegStatus = createMissingField();
  }

  // 2. Brand & Product Name from Front lines
  // Usually top lines of Front panel declare brand and product name
  if (frontLines.length > 0) {
    const candidateLines = frontLines.filter((l) => {
      const lower = l.toLowerCase();
      return !lower.startsWith('net qty') &&
             !lower.startsWith('net quantity') &&
             !lower.includes('100% veg') &&
             !lower.includes('mrp') &&
             !lower.includes('fssai') &&
             !lower.includes('b.no') &&
             l.length > 2;
    });

    if (candidateLines.length >= 2) {
      // Line 1 is typically Brand / Company moniker
      const brandText = cleanHeaderToken(candidateLines[0]);
      brand = createField(brandText, frontPanel.confidence, 'FRONT', candidateLines[0]);

      // Line 2 is typically Product Name
      const prodText = cleanHeaderToken(candidateLines[1]);
      productName = createField(prodText, frontPanel.confidence, 'FRONT', candidateLines[1]);
    } else if (candidateLines.length === 1) {
      productName = createField(cleanHeaderToken(candidateLines[0]), frontPanel.confidence, 'FRONT', candidateLines[0]);
      brand = createMissingField();
    }
  }

  // Cross-panel fallback if front panel lacked name
  if (!productName) {
    for (const item of combinedLines) {
      if (item.text.toLowerCase().includes('biscuits') || item.text.toLowerCase().includes('noodles') || item.text.toLowerCase().includes('juice')) {
        productName = createField(cleanHeaderToken(item.text), item.confidence, item.side, item.text);
        break;
      }
    }
  }

  // Category inference from name
  if (productName && productName.value) {
    const lower = productName.value.toLowerCase();
    if (lower.includes('biscuit') || lower.includes('cookie') || lower.includes('cracker')) {
      category = createInferredField('Biscuits', productName.confidence, productName.source_panel, productName.evidence_text);
    } else if (lower.includes('noodle') || lower.includes('pasta') || lower.includes('macaroni')) {
      category = createInferredField('Instant Noodles', productName.confidence, productName.source_panel, productName.evidence_text);
    } else if (lower.includes('juice') || lower.includes('beverage') || lower.includes('drink') || lower.includes('nectar')) {
      category = createInferredField('Beverages', productName.confidence, productName.source_panel, productName.evidence_text);
    } else if (lower.includes('snack') || lower.includes('chips') || lower.includes('namkeen')) {
      category = createInferredField('Snacks', productName.confidence, productName.source_panel, productName.evidence_text);
    }
  }

  return {
    product_name: productName || createMissingField(),
    brand: brand || createMissingField(),
    category: category || createMissingField(),
    veg_status: vegStatus,
  };
}

// -------------------------------------------------------------
// 2. STATUTORY DECLARATIONS EXTRACTOR (FSSAI, Net Qty, MRP, Batch, Dates)
// -------------------------------------------------------------
function extractStatutoryDeclarations(panelsMap, combinedLines) {
  let fssaiLicense = null;
  let netQuantity = null;
  let mrp = null;
  let batchNumber = null;
  let dateOfManufacture = null;
  let bestBefore = null;
  let expiryDate = null;

  for (const item of combinedLines) {
    const text = item.text;

    // FSSAI 14-digit license number
    if (!fssaiLicense) {
      const fssaiMatch = text.match(/(?:fssai(?:\s*lic\.?\s*no\.?)?|lic(?:ence)?\s*(?:no\.?)?|reg\.?\s*no\.?)[\s:]*([12]\d{13})\b/i) ||
                         text.match(/\b([12]\d{13})\b/);
      if (fssaiMatch) {
        fssaiLicense = createField(fssaiMatch[1], item.confidence, item.side, text);
      }
    }

    // Net Quantity (e.g. "Net Quantity: 250 g", "Net Qty: 70g", "1000 ml")
    if (!netQuantity) {
      const netMatch = text.match(/(?:net\s*(?:quantity|qty|wt|weight))[\s:]*([0-9]+(?:\.[0-9]+)?)\s*(kg|g|gm|gms|ml|l|ltr|litres?)\b/i) ||
                        text.match(/\b([0-9]+(?:\.[0-9]+)?)\s*(kg|g|gm|gms|ml|l|ltr)\b/i);
      if (netMatch) {
        const val = parseFloat(netMatch[1]);
        const unit = normalizeUnit(netMatch[2]);
        netQuantity = {
          value: val,
          unit,
          raw_text: `${netMatch[1]} ${netMatch[2]}`,
          confidence: item.confidence,
          source_panel: item.side,
          evidence_text: text,
          status: 'EXTRACTED',
        };
      }
    }

    // Maximum Retail Price (MRP)
    if (!mrp) {
      const mrpMatch = text.match(/(?:mrp|m\.r\.p\.?|max(?:imum)?\s*retail\s*price)[\s:]*(?:rs\.?|₹|inr)?\s*([0-9]+(?:\.[0-9]{1,2})?)/i) ||
                       text.match(/(?:rs\.?|₹)\s*([0-9]+(?:\.[0-9]{1,2})?)/i);
      if (mrpMatch) {
        const price = parseFloat(mrpMatch[1]);
        mrp = {
          value: price,
          currency: 'INR',
          raw_text: `Rs. ${price.toFixed(2)}`,
          confidence: item.confidence,
          source_panel: item.side,
          evidence_text: text,
          status: 'EXTRACTED',
        };
      }
    }

    // Batch / Lot number
    if (!batchNumber) {
      const batchMatch = text.match(/(?:batch\s*(?:no\.?|number)|lot\s*(?:no\.?|number)|b\.?\s*no\.?)[\s:]*([A-Za-z0-9\-_]+)/i);
      if (batchMatch) {
        batchNumber = createField(batchMatch[1].trim(), item.confidence, item.side, text);
      }
    }

    // Date of Manufacture / Packaging
    if (!dateOfManufacture) {
      const mfgMatch = text.match(/(?:mfg(?:\.?\s*date)?|date\s*of\s*mfg|manufactur(?:ed|ing)\s*date|pkd\.?|packed)[\s:]*([0-9]{1,2}[\/\.\-][0-9]{1,2}[\/\.\-][0-9]{2,4}|[0-9]{1,2}[\/\.\-][0-9]{4})/i);
      if (mfgMatch) {
        dateOfManufacture = {
          value: normalizeDate(mfgMatch[1]),
          raw_text: mfgMatch[1],
          confidence: item.confidence,
          source_panel: item.side,
          evidence_text: text,
          status: 'EXTRACTED',
        };
      }
    }

    // Best before duration (e.g. "6 Months from packaging date")
    if (!bestBefore) {
      const bbMatch = text.match(/(?:best\s*before|use\s*by)[\s:]*([0-9]+\s*(?:months?|days?|years?)(?:\s*from\s*(?:packaging|mfg|date))?)/i);
      if (bbMatch) {
        const monthsMatch = bbMatch[1].match(/([0-9]+)\s*month/i);
        bestBefore = {
          value: bbMatch[1].trim(),
          period_months: monthsMatch ? parseInt(monthsMatch[1], 10) : null,
          confidence: item.confidence,
          source_panel: item.side,
          evidence_text: text,
          status: 'EXTRACTED',
        };
      }
    }

    // Expiry Date (exact date)
    if (!expiryDate) {
      const expMatch = text.match(/(?:exp(?:iry)?\.?\s*date|expires\s*on|use\s*by\s*date)[\s:]*([0-9]{1,2}[\/\.\-][0-9]{1,2}[\/\.\-][0-9]{2,4})/i);
      if (expMatch) {
        expiryDate = {
          value: normalizeDate(expMatch[1]),
          raw_text: expMatch[1],
          confidence: item.confidence,
          source_panel: item.side,
          evidence_text: text,
          status: 'EXTRACTED',
        };
      }
    }
  }

  return {
    fssai_license: fssaiLicense || createMissingField(),
    net_quantity: netQuantity || createMissingField(),
    mrp: mrp || createMissingField(),
    batch_number: batchNumber || createMissingField(),
    date_of_manufacture: dateOfManufacture || createMissingField(),
    best_before: bestBefore || createMissingField(),
    expiry_date: expiryDate || createMissingField(),
  };
}

// -------------------------------------------------------------
// 3. MANUFACTURER EXTRACTOR
// -------------------------------------------------------------
function extractManufacturer(panelsMap, combinedLines) {
  let mfgName = null;
  let mfgAddress = null;

  for (const item of combinedLines) {
    const text = item.text;
    const mfgMatch = text.match(/(?:manufactured\s*by|mfd\.?\s*by|packed\s*by|marketed\s*by)[\s:]*([^\n\r]+)/i);
    if (mfgMatch && !mfgName) {
      const fullText = mfgMatch[1].trim();
      const parts = fullText.split(/,|\./).map((p) => p.trim()).filter(Boolean);
      mfgName = createField(parts[0] || fullText, item.confidence, item.side, text);
      if (parts.length > 1) {
        mfgAddress = createField(parts.slice(1).join(', '), item.confidence, item.side, text);
      }
      break;
    }
  }

  return {
    name: mfgName || createMissingField(),
    address: mfgAddress || createMissingField(),
    consumer_care: createMissingField(),
  };
}

// -------------------------------------------------------------
// 4. INGREDIENTS & INS ADDITIVES EXTRACTOR
// -------------------------------------------------------------
function extractIngredients(panelsMap, combinedLines) {
  let rawStatement = '';
  let sourcePanel = 'INGREDIENTS';
  let confidence = 0.85;

  // Prioritize dedicated ingredients panel if available
  const ingPanel = panelsMap['INGREDIENTS'];
  if (ingPanel && ingPanel.rawText) {
    rawStatement = ingPanel.rawText;
    confidence = ingPanel.confidence;
    sourcePanel = 'INGREDIENTS';
  } else {
    // Cross-panel scan for "INGREDIENTS:" keyword
    const match = combinedLines.find((l) => /ingredients\s*[:\-]/i.test(l.text));
    if (match) {
      rawStatement = match.text;
      sourcePanel = match.side;
      confidence = match.confidence;
    }
  }

  if (!rawStatement) {
    return {
      raw_statement: createMissingField(),
      items: [],
      detected_ins_additives: [],
    };
  }

  // Isolate ingredients portion before any allergen statement or statutory block
  const cleaned = rawStatement
    .replace(/ALLERGEN\s*(?:DECLARATION|ADVISORY|STATEMENT)?[\s\S]*/i, '')
    .replace(/NUTRITION(?:AL)?\s*INFORMATION[\s\S]*/i, '')
    .replace(/^.*?ingredients\s*[:\-]/i, '')
    .trim();

  // Split ingredients by top-level commas (honoring parentheses/brackets)
  const tokens = splitIngredientsRespectingBrackets(cleaned);
  const items = [];
  const detectedInsSet = new Map();

  tokens.forEach((token) => {
    if (!token || token.length < 2) return;

    // Check for percentage e.g. "Wheat Flour (66%)"
    const pctMatch = token.match(/\(([0-9]+(?:\.[0-9]+)?)\s*%\)/);
    const percentage = pctMatch ? parseFloat(pctMatch[1]) : null;

    // Check for INS additives e.g. "INS 503(ii)", "INS 322", "INS 150d", "160a(ii)"
    const insMatches = [...token.matchAll(/(?:INS|E)?\s*([0-9]{3,4}[a-z]?(?:\([a-z0-9]+\))?)/gi)];
    const additives = [];

    insMatches.forEach((m) => {
      const rawCode = m[1].toLowerCase();
      const codeKey = `INS ${m[1]}`;
      additives.push(codeKey);

      // Match against known statutory additive dictionary
      const known = KNOWN_INS_ADDITIVES[rawCode] || KNOWN_INS_ADDITIVES[m[1]];
      if (known && !detectedInsSet.has(codeKey)) {
        detectedInsSet.set(codeKey, {
          ins_code: codeKey,
          name: known.name,
          functional_class: known.functionalClass,
        });
      }
    });

    const cleanName = token
      .replace(/\([0-9]+(?:\.[0-9]+)?\s*%\)/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?\)/g, '')
      .trim();

    items.push({
      name: cleanName || token,
      percentage,
      is_primary: items.length === 0,
      additives,
    });
  });

  return {
    raw_statement: {
      value: cleaned,
      confidence,
      source_panel: sourcePanel,
      evidence_text: rawStatement.substring(0, 160),
      status: 'EXTRACTED',
    },
    items,
    detected_ins_additives: Array.from(detectedInsSet.values()),
  };
}

// -------------------------------------------------------------
// 5. ALLERGENS EXTRACTOR
// -------------------------------------------------------------
function extractAllergens(panelsMap, combinedLines, parsedIngredients) {
  let allergenText = null;
  let sourcePanel = 'INGREDIENTS';
  let confidence = 0.85;

  for (const item of combinedLines) {
    const text = item.text;
    const match = text.match(/(?:allergen\s*(?:declaration|statement|info|advisory)?|contains|may\s*contain)[\s:]*([^\n\r]+)/i);
    if (match) {
      allergenText = text;
      sourcePanel = item.side;
      confidence = item.confidence;
      break;
    }
  }

  if (!allergenText) {
    return {
      mandatory_declaration: createMissingField(),
      contains: [],
      may_contain: [],
    };
  }

  // Identify allergens explicitly declared
  const containsList = [];
  const mayContainList = [];

  const lower = allergenText.toLowerCase();
  const containsClause = lower.includes('may contain')
    ? lower.substring(0, lower.indexOf('may contain'))
    : lower;
  const mayContainClause = lower.includes('may contain')
    ? lower.substring(lower.indexOf('may contain'))
    : '';

  STATUTORY_ALLERGENS.forEach((allergen) => {
    const allergenLower = allergen.toLowerCase();
    if (containsClause.includes(allergenLower)) {
      containsList.push(allergen);
    } else if (mayContainClause.includes(allergenLower)) {
      mayContainList.push(allergen);
    }
  });

  return {
    mandatory_declaration: {
      value: allergenText,
      confidence,
      source_panel: sourcePanel,
      evidence_text: allergenText,
      status: 'EXTRACTED',
    },
    contains: Array.from(new Set(containsList)),
    may_contain: Array.from(new Set(mayContainList)),
  };
}

// -------------------------------------------------------------
// 6. NUTRITION TABLE EXTRACTOR
// -------------------------------------------------------------
function extractNutrition(panelsMap, combinedLines) {
  const nutritionPanel = panelsMap['NUTRITION'];
  const targetLines = nutritionPanel
    ? nutritionPanel.rawText.split('\n').map((l) => ({ text: l.trim(), side: 'NUTRITION', confidence: nutritionPanel.confidence }))
    : combinedLines;

  let referenceUnit = '100g';
  let servingSize = null;

  // Detect reference basis
  for (const lineObj of targetLines) {
    const t = lineObj.text.toLowerCase();
    if (t.includes('per 100g') || t.includes('per 100 g')) referenceUnit = '100g';
    else if (t.includes('per 100ml') || t.includes('per 100 ml')) referenceUnit = '100ml';
    else if (t.includes('serving size')) {
      const match = lineObj.text.match(/serving\s*size[\s:]*([^\n\r]+)/i);
      if (match) servingSize = match[1].trim();
    }
  }

  const nutrients = {
    energy: extractNutrientValue(targetLines, /(?:energy|calories|caloric\s*value)[\s:]*([0-9]+(?:\.[0-9]+)?)\s*(kcal|kj)?/i, 'kcal'),
    protein: extractNutrientValue(targetLines, /(?:protein)[\s:]*([0-9]+(?:\.[0-9]+)?)\s*(g|gm|mg)?/i, 'g'),
    carbohydrate: extractNutrientValue(targetLines, /(?:carbohydrate|carbs?)[\s:]*([0-9]+(?:\.[0-9]+)?)\s*(g|gm|mg)?/i, 'g'),
    total_sugar: extractNutrientValue(targetLines, /(?:total\s*sugars?|sugars?)[\s:]*([0-9]+(?:\.[0-9]+)?)\s*(g|gm|mg)?/i, 'g'),
    added_sugar: extractNutrientValue(targetLines, /(?:added\s*sugars?)[\s:]*([0-9]+(?:\.[0-9]+)?)\s*(g|gm|mg)?/i, 'g'),
    fat: extractNutrientValue(targetLines, /(?:total\s*fat|fat)[\s:]*([0-9]+(?:\.[0-9]+)?)\s*(g|gm|mg)?/i, 'g'),
    saturated_fat: extractNutrientValue(targetLines, /(?:saturated\s*(?:fat(?:ty\s*acids?)?|fat))[\s:]*([0-9]+(?:\.[0-9]+)?)\s*(g|gm|mg)?/i, 'g'),
    trans_fat: extractNutrientValue(targetLines, /(?:trans\s*(?:fat(?:ty\s*acids?)?|fat))[\s:]*([0-9]+(?:\.[0-9]+)?)\s*(g|gm|mg)?/i, 'g'),
    sodium: extractNutrientValue(targetLines, /(?:sodium)[\s:]*([0-9]+(?:\.[0-9]+)?)\s*(mg|g)?/i, 'mg'),
    dietary_fiber: extractNutrientValue(targetLines, /(?:dietary\s*fiber|fiber)[\s:]*([0-9]+(?:\.[0-9]+)?)\s*(g|gm|mg)?/i, 'g'),
  };

  return {
    reference_unit: referenceUnit,
    serving_size: servingSize,
    nutrients,
  };
}

function extractNutrientValue(lines, regex, defaultUnit) {
  for (const lineObj of lines) {
    const match = lineObj.text.match(regex);
    if (match) {
      const val = parseFloat(match[1]);
      const unit = match[2] ? normalizeUnit(match[2]) : defaultUnit;
      return {
        value: val,
        unit,
        confidence: lineObj.confidence,
        source_panel: lineObj.side,
        evidence_text: lineObj.text,
        status: 'EXTRACTED',
      };
    }
  }

  return {
    value: null,
    unit: defaultUnit,
    status: 'MISSING',
  };
}

// -------------------------------------------------------------
// HELPER ROUTINES (Normalization & Tokenizers)
// -------------------------------------------------------------
function createField(value, confidence, panel, evidenceText) {
  return {
    value,
    confidence: confidence !== undefined ? Number(confidence) : 0.85,
    source_panel: panel || 'FRONT',
    evidence_text: evidenceText || '',
    status: 'EXTRACTED',
  };
}

function createInferredField(value, confidence, panel, evidenceText) {
  return {
    value,
    confidence: confidence !== undefined ? Number(confidence) : 0.85,
    source_panel: panel || 'FRONT',
    evidence_text: evidenceText || '',
    status: 'INFERRED',
  };
}

function createMissingField() {
  return {
    value: null,
    status: 'MISSING',
  };
}

function buildEmptyExtraction() {
  return {
    schema_version: '1.0',
    product_identity: {
      product_name: createMissingField(),
      brand: createMissingField(),
      category: createMissingField(),
      veg_status: createMissingField(),
    },
    statutory_declarations: {
      fssai_license: createMissingField(),
      net_quantity: createMissingField(),
      mrp: createMissingField(),
      batch_number: createMissingField(),
      date_of_manufacture: createMissingField(),
      best_before: createMissingField(),
      expiry_date: createMissingField(),
    },
    manufacturer: {
      name: createMissingField(),
      address: createMissingField(),
      consumer_care: createMissingField(),
    },
    ingredients: {
      raw_statement: createMissingField(),
      items: [],
      detected_ins_additives: [],
    },
    allergens: {
      mandatory_declaration: createMissingField(),
      contains: [],
      may_contain: [],
    },
    nutrition: {
      reference_unit: '100g',
      serving_size: null,
      nutrients: {},
    },
    extraction_summary: {
      fields_extracted: 0,
      fields_missing: 0,
      average_confidence: 0,
      extraction_status: 'NOT_EXTRACTED',
    },
  };
}

function cleanHeaderToken(text) {
  return (text || '')
    .replace(/^[^a-zA-Z0-9]+/, '')
    .replace(/[^a-zA-Z0-9\s\-\.\'\&]+$/, '')
    .trim();
}

function normalizeUnit(unitStr) {
  const u = (unitStr || '').toLowerCase();
  if (['g', 'gm', 'gms', 'gram', 'grams'].includes(u)) return 'g';
  if (['kg', 'kgs', 'kilogram'].includes(u)) return 'kg';
  if (['ml', 'mls', 'millilitre', 'milliliter'].includes(u)) return 'ml';
  if (['l', 'ltr', 'litre', 'liter'].includes(u)) return 'l';
  if (['mg', 'milligram'].includes(u)) return 'mg';
  if (['kcal', 'calories', 'cal'].includes(u)) return 'kcal';
  return u;
}

function normalizeDate(dateStr) {
  if (!dateStr) return null;
  // Handle DD/MM/YYYY or DD-MM-YYYY
  const parts = dateStr.split(/[\/\.\-]/);
  if (parts.length === 3) {
    let [d, m, y] = parts;
    if (y.length === 2) y = `20${y}`;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return dateStr;
}

/**
 * Splits comma-separated ingredients while keeping bracketed sub-ingredients intact.
 * e.g., "Wheat Flour (66%), Mixed Spices (23.6%) [Onion, Coriander], Salt"
 */
function splitIngredientsRespectingBrackets(text) {
  const results = [];
  let current = '';
  let parenDepth = 0;
  let bracketDepth = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '(') parenDepth++;
    else if (char === ')') parenDepth = Math.max(0, parenDepth - 1);
    else if (char === '[') bracketDepth++;
    else if (char === ']') bracketDepth = Math.max(0, bracketDepth - 1);

    if (char === ',' && parenDepth === 0 && bracketDepth === 0) {
      if (current.trim()) results.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) results.push(current.trim());
  return results;
}
