import { z } from 'zod';
import * as authService from '../services/authService.js';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
    dietaryPreference: z.enum(['VEGETARIAN', 'VEGAN', 'EGGETARIAN', 'NON_VEGETARIAN', 'OTHER']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export async function register(req, res, next) {
  try {
    const { email, password, fullName, dietaryPreference } = req.body;
    const result = await authService.registerUser({
      email,
      password,
      fullName,
      dietaryPreference,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res) {
  // Stateless JWT: logout acknowledges invalidation
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
}
