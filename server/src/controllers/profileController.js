import { z } from 'zod';
import * as profileService from '../services/profileService.js';

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
    ageGroup: z.string().optional().nullable(),
    dietaryPreference: z.enum(['VEGETARIAN', 'VEGAN', 'EGGETARIAN', 'NON_VEGETARIAN', 'OTHER']).optional(),
  }),
});

export const addAllergySchema = z.object({
  body: z.object({
    allergenName: z.string().min(2, 'Allergen name must be at least 2 characters'),
    severity: z.string().optional(),
    notes: z.string().optional().nullable(),
  }),
});

export const batchAllergiesSchema = z.object({
  body: z.object({
    allergies: z.array(
      z.union([
        z.string(),
        z.object({
          allergenName: z.string().min(2),
          severity: z.string().optional(),
          notes: z.string().optional().nullable(),
        }),
      ])
    ),
  }),
});

export const updatePreferencesSchema = z.object({
  body: z.object({
    preferences: z.record(z.any()), // Map of preference_key to boolean or string
  }),
});

export async function getProfile(req, res, next) {
  try {
    const data = await profileService.getUserProfile(req.user.id);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { fullName, ageGroup, dietaryPreference } = req.body;
    const updated = await profileService.updateUserProfile(req.user.id, {
      fullName,
      ageGroup,
      dietaryPreference,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function addAllergy(req, res, next) {
  try {
    const { allergenName, severity, notes } = req.body;
    const allergy = await profileService.addAllergy(req.user.id, {
      allergenName,
      severity,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Allergy added to profile.',
      data: allergy,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeAllergy(req, res, next) {
  try {
    const { id } = req.params;
    const result = await profileService.removeAllergy(req.user.id, id);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function setAllergiesBatch(req, res, next) {
  try {
    const { allergies } = req.body;
    const result = await profileService.setAllergiesBatch(req.user.id, allergies);

    res.status(200).json({
      success: true,
      message: 'Allergies updated successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePreferences(req, res, next) {
  try {
    const { preferences } = req.body;
    const result = await profileService.updatePreferences(req.user.id, preferences);

    res.status(200).json({
      success: true,
      message: 'Nutrition preferences updated successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
