import { prisma } from '../config/db.js';
import crypto from 'crypto';
import { sendBookingConfirmationRequestToBarber,  sendBookingConfirmedToClient } from '../services/email.service.js';

// --- Client creates a booking ---
const createBooking = async (req, res) => {
  const { barberId, serviceId, date, notes } = req.body;
  const clientId = req.user.id;

  const barberProfile = await prisma.barberProfile.findUnique({
    where: { id: barberId },
    include: { user: true },
  });

  if (!barberProfile) {
    return res.status(404).json({ error: 'Barber not found' });
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const booking = await prisma.booking.create({
    data: {
      clientId,
      barberId,
      serviceId,
      date: new Date(date),
      notes,
      confirmationToken: hashedToken,
      confirmationTokenExpiry: tokenExpiry,
    },
  });

  try {
    await sendBookingConfirmationRequestToBarber(barberProfile.user, booking, rawToken);
  } catch (err) {
    console.error('Failed to send barber confirmation email:', err.message);
    // booking still exists as PENDING — barber won't get notified, but nothing breaks
  }

  res.status(201).json({
    status: 'success',
    message: 'Booking created. Waiting for barber confirmation.',
    data: { booking },
  });
};

// --- Barber clicks the confirm link from email ---
const confirmBooking = async (req, res) => {
  const { token } = req.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const booking = await prisma.booking.findFirst({
    where: {
      confirmationToken: hashedToken,
      confirmationTokenExpiry: { gt: new Date() },
    },
    include: { client: true, service: true },
  });

  if (!booking) {
    return res.status(400).send(`
      <html><body style="font-family: sans-serif; text-align: center; margin-top: 60px;">
        <h2>Link invalid or expired</h2>
        <p>This booking confirmation link is no longer valid.</p>
      </body></html>
    `);
  }

  if (booking.status !== 'PENDING') {
    return res.status(200).send(`
      <html><body style="font-family: sans-serif; text-align: center; margin-top: 60px;">
        <h2>Already handled</h2>
        <p>This booking has already been ${booking.status.toLowerCase()}.</p>
      </body></html>
    `);
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: 'CONFIRMED',
      confirmationToken: null,
      confirmationTokenExpiry: null,
    },
  });

  try {
    await sendBookingConfirmedToClient(booking.client, updatedBooking);
  } catch (err) {
    console.error('Failed to notify client:', err.message);
  }

  res.status(200).send(`
    <html><body style="font-family: sans-serif; text-align: center; margin-top: 60px;">
      <h2>✅ Booking confirmed</h2>
      <p>You've confirmed the trim booking for ${booking.client.name} on ${new Date(booking.date).toLocaleString()}.</p>
      <p>The client has been notified.</p>
    </body></html>
  `);
};

// --- Client views their own bookings ---
const getMyBookings = async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: { clientId: req.user.id },
    include: { service: true, barber: { include: { user: true } } },
    orderBy: { date: 'desc' },
  });

  res.status(200).json({ status: 'success', data: { bookings } });
};

// --- Barber views bookings assigned to them ---
const getBarberBookings = async (req, res) => {
  const barberProfile = await prisma.barberProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!barberProfile) {
    return res.status(404).json({ error: 'No barber profile linked to this account' });
  }

  const bookings = await prisma.booking.findMany({
    where: { barberId: barberProfile.id },
    include: { service: true, client: true },
    orderBy: { date: 'desc' },
  });

  res.status(200).json({ status: 'success', data: { bookings } });
};

// --- Client cancels their own booking (or admin cancels any) ---
const cancelBooking = async (req, res) => {
  const { id } = req.params;

  const booking = await prisma.booking.findUnique({ where: { id }, include: { barber: { include: { user: true } } } });
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const isOwner = booking.clientId === req.user.id;
  const isAdmin = req.user.role === 'ADMIN';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'You cannot cancel this booking' });
  }

  if (['CANCELLED', 'COMPLETED'].includes(booking.status)) {
    return res.status(400).json({ error: `Booking is already ${booking.status.toLowerCase()}` });
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  res.status(200).json({ status: 'success', message: 'Booking cancelled', data: { booking: updated } });
}

// --- Barber marks a confirmed booking as completed (or admin) ---
const completeBooking = async (req, res) => {
  const { id } = req.params;

  const booking = await prisma.booking.findUnique({ where: { id }, include: { barber: true } });
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const isAdmin = req.user.role === 'ADMIN';
  let isOwningBarber = false;
  if (req.user.role === 'BARBER') {
    const barberProfile = await prisma.barberProfile.findUnique({ where: { userId: req.user.id } });
    isOwningBarber = barberProfile && barberProfile.id === booking.barberId;
  }

  if (!isOwningBarber && !isAdmin) {
    return res.status(403).json({ error: 'You cannot complete this booking' });
  }

  if (booking.status !== 'CONFIRMED') {
    return res.status(400).json({ error: 'Only confirmed bookings can be marked complete' });
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: 'COMPLETED' },
  });

  res.status(200).json({ status: 'success', message: 'Booking marked as completed', data: { booking: updated } });
};

export { createBooking, confirmBooking, getMyBookings, getBarberBookings, cancelBooking, completeBooking };