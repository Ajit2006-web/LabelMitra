import prisma from '../config/database.js';

export async function getUserProfile(userId) {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  const allergies = await prisma.userAllergy.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });

  const preferences = await prisma.userPreference.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });

  return {
    profile,
    allergies,
    preferences,
  };
}

export async function updateUserProfile(userId, { fullName, ageGroup, dietaryPreference }) {
  const updatedProfile = await prisma.userProfile.upsert({
    where: { userId },
    update: {
      ...(fullName !== undefined && { fullName }),
      ...(ageGroup !== undefined && { ageGroup }),
      ...(dietaryPreference !== undefined && { dietaryPreference }),
    },
    create: {
      userId,
      fullName: fullName || 'User',
      ageGroup,
      dietaryPreference: dietaryPreference || 'VEGETARIAN',
    },
  });

  return updatedProfile;
}

export async function addAllergy(userId, { allergenName, severity, notes }) {
  const normalizedName = allergenName.trim();

  const allergy = await prisma.userAllergy.upsert({
    where: {
      userId_allergenName: {
        userId,
        allergenName: normalizedName,
      },
    },
    update: {
      severity: severity || 'Moderate',
      notes,
    },
    create: {
      userId,
      allergenName: normalizedName,
      severity: severity || 'Moderate',
      notes,
    },
  });

  return allergy;
}

export async function removeAllergy(userId, allergyId) {
  const allergy = await prisma.userAllergy.findFirst({
    where: {
      id: allergyId,
      userId,
    },
  });

  if (!allergy) {
    const error = new Error('Allergy record not found or does not belong to user.');
    error.statusCode = 404;
    throw error;
  }

  await prisma.userAllergy.delete({
    where: { id: allergyId },
  });

  return { success: true, message: 'Allergy removed successfully.' };
}

export async function setAllergiesBatch(userId, allergyList) {
  // Replace complete allergies list for user
  return await prisma.$transaction(async (tx) => {
    await tx.userAllergy.deleteMany({
      where: { userId },
    });

    if (allergyList && allergyList.length > 0) {
      const records = allergyList.map((item) => ({
        userId,
        allergenName: typeof item === 'string' ? item.trim() : item.allergenName.trim(),
        severity: typeof item === 'string' ? 'Moderate' : item.severity || 'Moderate',
        notes: typeof item === 'string' ? null : item.notes || null,
      }));

      await tx.userAllergy.createMany({
        data: records,
        skipDuplicates: true,
      });
    }

    return tx.userAllergy.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  });
}

export async function updatePreferences(userId, preferencesMap) {
  // preferencesMap: { LOW_SUGAR: true, LOW_SODIUM: false, ... }
  const entries = Object.entries(preferencesMap);

  await prisma.$transaction(async (tx) => {
    for (const [key, value] of entries) {
      await tx.userPreference.upsert({
        where: {
          userId_preferenceKey: {
            userId,
            preferenceKey: key,
          },
        },
        update: {
          preferenceValue: String(value),
        },
        create: {
          userId,
          preferenceKey: key,
          preferenceValue: String(value),
        },
      });
    }
  });

  return prisma.userPreference.findMany({
    where: { userId },
  });
}
