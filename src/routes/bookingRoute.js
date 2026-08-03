
import express from 'express';
import { createBooking, confirmBooking, getMyBookings, getBarberBookings, cancelBooking, completeBooking } from '../controllers/bookingController.js';
import { authMiddleware } from '../middleware/authmiddleware.js';
import { authorize } from '../middleware/authorize.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createBookingSchema } from '../validators/bookingValidator.js';

const router = express.Router();

router.post('/', authMiddleware, authorize('CLIENT'), validateRequest(createBookingSchema), createBooking);
router.get('/confirm/:token', confirmBooking); // public — barber clicks from email, no login needed
router.get('/my-bookings', authMiddleware, authorize('CLIENT'), getMyBookings);
router.get('/barber-bookings', authMiddleware, authorize('BARBER'), getBarberBookings);
router.patch('/:id/cancel', authMiddleware, authorize('CLIENT', 'ADMIN'), cancelBooking);
router.patch('/:id/complete', authMiddleware, authorize('BARBER', 'ADMIN'), completeBooking);


export default router;




//npx prisma studio: Fastest way to get a barber + service into the DB for testing
/* 
This opens a GUI at localhost:5555. There:

Register a normal user via Postman (/auth/register), then in Prisma Studio open that user's row and change role to BARBER.
Create a BarberProfile row, set userId to that same user's id, bio, specialties (array), isAvailable: true.
Create a Service row — name, description, price, durationMin.

Copy the BarberProfile.id and Service.id — you'll need them for the booking request.
*/
