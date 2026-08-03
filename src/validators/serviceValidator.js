// src/validators/serviceValidator.js
import { z } from 'zod';

const createServiceSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  durationMin: z.coerce.number().int().positive(),
});

export { createServiceSchema };