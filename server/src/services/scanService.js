import prisma from '../config/database.js';
import { processImageWithOCR } from './ocrClient.js';
import { extractStructuredProductInfo } from './extractionService.js';
import { enrichIngredientsWithKnowledge } from './ingredientService.js';
import { evaluateScanAllergies } from './allergyService.js';

export async function processMultiPanelScan(userId, uploadedFiles) {
  // uploadedFiles: array of { fieldname, path, filename, originalname, size, mimetype }
  if (!uploadedFiles || uploadedFiles.length === 0) {
    const error = new Error('At least one package image panel is required to initiate a scan.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Create Initial Scan Entry
  const scan = await prisma.scan.create({
    data: {
      userId,
      status: 'PROCESSING',
      extractedData: {},
    },
  });

  const ocrResults = [];
  let totalConfidence = 0;

  // 2. Process each uploaded panel through OpenCV & OCR
  for (const file of uploadedFiles) {
    // Map fieldname to valid ImageSideType enum: FRONT, NUTRITION, INGREDIENTS, SIDE, BACK, OTHER
    let sideType = 'FRONT';
    const field = (file.fieldname || '').toLowerCase();
    if (field === 'nutrition') sideType = 'NUTRITION';
    else if (field === 'ingredients') sideType = 'INGREDIENTS';
    else if (field === 'side') sideType = 'SIDE';
    else if (field === 'back') sideType = 'BACK';

    const ocrOutput = await processImageWithOCR(file.path, file.originalname, sideType);

    // Save OCR Result record
    const ocrRecord = await prisma.ocrResult.create({
      data: {
        scanId: scan.id,
        imageSide: sideType,
        imagePath: file.path.replace(/\\/g, '/'),
        engineUsed: ocrOutput.engineUsed,
        rawText: ocrOutput.rawText,
        boundingBoxes: ocrOutput.boundingBoxes,
        confidenceScore: ocrOutput.confidenceScore,
      },
    });

    totalConfidence += ocrOutput.confidenceScore;
    ocrResults.push({
      ...ocrRecord,
      qualityMetrics: ocrOutput.qualityMetrics,
    });
  }

  // 3. Compute Composite Score & Final Status
  const compositeConfidence = Math.round((totalConfidence / uploadedFiles.length) * 100) / 100;
  const finalStatus = compositeConfidence < 60.0 ? 'NEEDS_VERIFICATION' : 'COMPLETED';

  // Aggregate all raw text across panels
  const aggregatedRawText = ocrResults
    .map((r) => `--- [PANEL: ${r.imageSide}] ---\n${r.rawText}`)
    .join('\n\n');

  // 4. Phase 3: Structured Information Extraction Pipeline
  const structuredProductData = extractStructuredProductInfo(ocrResults);

  // 5. Phase 4: Ingredient Knowledge Enrichment & Personalized Allergy Evaluation
  const userAllergies = await prisma.userAllergy.findMany({
    where: { userId },
  });

  if (structuredProductData?.ingredients?.items) {
    structuredProductData.ingredients.enriched_items = enrichIngredientsWithKnowledge(
      structuredProductData.ingredients.items
    );
  }

  const personalizedAllergyAssessment = evaluateScanAllergies(userAllergies, structuredProductData);

  const updatedScan = await prisma.scan.update({
    where: { id: scan.id },
    data: {
      status: finalStatus,
      ocrConfidence: compositeConfidence,
      extractedData: {
        composite_raw_text: aggregatedRawText,
        panels_count: uploadedFiles.length,
        ...structuredProductData,
        personalized_allergy_assessment: personalizedAllergyAssessment,
      },
      overallSummary: {
        panels_processed: ocrResults.map((r) => ({
          side: r.imageSide,
          engine: r.engineUsed,
          confidence: r.confidenceScore,
          quality: r.qualityMetrics?.quality_status || 'OPTIMAL',
        })),
        composite_confidence: compositeConfidence,
        extraction_summary: structuredProductData.extraction_summary,
        allergy_assessment_summary: {
          status: personalizedAllergyAssessment.status,
          headline: personalizedAllergyAssessment.headline,
          matches_count: personalizedAllergyAssessment.matches.length,
        },
      },
    },
    include: {
      ocrResults: true,
    },
  });

  return {
    scan: updatedScan,
    ocrResults,
    compositeConfidence,
    status: finalStatus,
  };
}

export async function getScanById(userId, scanId) {
  const scan = await prisma.scan.findFirst({
    where: {
      id: scanId,
      userId,
    },
    include: {
      ocrResults: true,
      product: true,
    },
  });

  if (!scan) {
    const error = new Error('Scan record not found or does not belong to you.');
    error.statusCode = 404;
    throw error;
  }

  // Refresh personalized allergy assessment if extractedData is present
  if (scan.extractedData && typeof scan.extractedData === 'object') {
    const userAllergies = await prisma.userAllergy.findMany({
      where: { userId },
    });
    scan.extractedData.personalized_allergy_assessment = evaluateScanAllergies(
      userAllergies,
      scan.extractedData
    );
  }

  return scan;
}

export async function getUserScans(userId) {
  return prisma.scan.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      ocrResults: {
        select: {
          id: true,
          imageSide: true,
          confidenceScore: true,
          engineUsed: true,
        },
      },
    },
  });
}
