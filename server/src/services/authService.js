import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { config } from '../config/env.js';

const SALT_ROUNDS = 10;

export async function registerUser({ email, password, fullName, dietaryPreference }) {
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (existingUser) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Transaction to create User and initial UserProfile together
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'USER',
      },
    });

    await tx.userProfile.create({
      data: {
        userId: newUser.id,
        fullName: fullName || email.split('@')[0],
        dietaryPreference: dietaryPreference || 'VEGETARIAN',
      },
    });

    return newUser;
  });

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: {
      profile: true,
      allergies: true,
      preferences: true,
    },
  });

  if (!user || !user.isActive) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      allergies: user.allergies,
      preferences: user.preferences,
    },
    token,
  };
}

export async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      profile: true,
      allergies: true,
      preferences: true,
    },
  });

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return user;
}
