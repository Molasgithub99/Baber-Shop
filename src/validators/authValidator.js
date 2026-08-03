import { z } from "zod";

 // Validation schema for user registration
 // Validates name, email format, and password strength
const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please provide a valid email")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

// Validation schema for user login
// Validates email format and ensures password is provided
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please provide a valid email")
    .toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

// Validation schema for Google authentication
const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'Google ID token is required'),
});

// Validation schema for forgot password
const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Please provide a valid email').toLowerCase(),
});

// Validation schema for reset password
const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export { registerSchema, loginSchema, googleAuthSchema, forgotPasswordSchema, resetPasswordSchema };



