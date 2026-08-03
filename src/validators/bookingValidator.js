// src/validators/bookingValidator.js
import { z } from 'zod';

const createBookingSchema = z.object({
  barberId: z.string().uuid('Invalid barber id'),
  serviceId: z.string().uuid('Invalid service id'),
  date: z.coerce.date().refine((d) => d > new Date(), {
    message: 'Booking date must be in the future',
  }),
  notes: z.string().max(500).optional(),
});

export { createBookingSchema };