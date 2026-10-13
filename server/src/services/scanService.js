import prisma from '../config/database.js';
import { processImageWithOCR } from './ocrClient.js';

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

  const updatedScan = await prisma.scan.update({
    where: { id: scan.id },
    data: {
      status: finalStatus,
      ocrConfidence: compositeConfidence,
      extractedData: {
        composite_raw_text: aggregatedRawText,
        panels_count: uploadedFiles.length,
      },
      overallSummary: {
        panels_processed: ocrResults.map((r) => ({
          side: r.imageSide,
          engine: r.engineUsed,
          confidence: r.confidenceScore,
          quality: r.qualityMetrics?.quality_status || 'OPTIMAL',
        })),
        composite_confidence: compositeConfidence,
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
