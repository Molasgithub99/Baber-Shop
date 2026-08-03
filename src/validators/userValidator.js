// src/validators/userValidator.js
import { z } from 'zod';

const createBarberSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().min(1).email('Please provide a valid email').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  bio: z.string().max(500).optional(),
  specialties: z.array(z.string()).optional(),
});

const updateUserRoleSchema = z.object({
  role: z.enum(['CLIENT', 'BARBER', 'ADMIN']),
});

const updateMeSchema = z.object({
  name: z.string().trim().min(2).optional(),
  avatar: z.string().url().optional(),
});

export { createBarberSchema, updateUserRoleSchema, updateMeSchema };