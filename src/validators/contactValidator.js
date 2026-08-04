// src/validators/contactValidator.js
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().min(1).email('Please provide a valid email').toLowerCase(),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000),
});

export { contactSchema };