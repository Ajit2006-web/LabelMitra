import * as scanService from '../services/scanService.js';

export async function uploadAndScan(req, res, next) {
  try {
    const files = [];

    // Extract files from multi-field upload (front, nutrition, ingredients, side)
    if (req.files) {
      if (req.files.front) files.push(...req.files.front);
      if (req.files.nutrition) files.push(...req.files.nutrition);
      if (req.files.ingredients) files.push(...req.files.ingredients);
      if (req.files.side) files.push(...req.files.side);
    }

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No packaging panel images were provided. Please upload at least one panel (Front, Nutrition, Ingredients, or Side).',
      });
    }

    const result = await scanService.processMultiPanelScan(req.user.id, files);

    res.status(201).json({
      success: true,
      message: 'Packaging images preprocessed and OCR extraction completed successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getScan(req, res, next) {
  try {
    const { id } = req.params;
    const scan = await scanService.getScanById(req.user.id, id);

    res.status(200).json({
      success: true,
      data: scan,
    });
  } catch (error) {
    next(error);
  }
}

export async function listUserScans(req, res, next) {
  try {
    const scans = await scanService.getUserScans(req.user.id);

    res.status(200).json({
      success: true,
      data: scans,
    });
  } catch (error) {
    next(error);
  }
}
