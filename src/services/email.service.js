// src/services/email.service.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

export const sendResetPasswordEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Reset your password',
    html: `
      <p>Hi ${user.name},</p>
      <p>You requested a password reset. Click below (valid for 15 minutes):</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>If you didn't request this, ignore this email.</p>
    `,
  });
};

export const sendBookingConfirmationRequestToBarber = async (barberUser, booking, rawToken) => {
  // const confirmUrl = `${process.env.CLIENT_URL}/barber/bookings/${booking.id}/confirm`;
    const confirmUrl = `${process.env.API_URL}/bookings/confirm/${rawToken}`;

  await sendEmail({
    to: barberUser.email,
    subject: 'New booking request',
     html: `
      <p>Hi ${barberUser.name},</p>
      <p>You have a new booking request for ${new Date(booking.date).toLocaleString()}.</p>
      <a href="${confirmUrl}">Click here to confirm this booking</a>
      <p>This link expires in 24 hours.</p>
    `,
  });
};

export const sendBookingConfirmedToClient = async (clientUser, booking) => {
  await sendEmail({
    to: clientUser.email,
    subject: 'Your booking is confirmed!',
    html: `
      <p>Hi ${clientUser.name},</p>
      <p>Your trim booking on ${new Date(booking.date).toLocaleString()} has been confirmed by your barber.</p>
    `,
  });
};

export const sendContactNotificationToAdmin = async (contactMessage) => {
  // For now, sends to whoever EMAIL_FROM/your own inbox is — swap for a real admin email once you have one
  await sendEmail({
    to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
    subject: `New contact message from ${contactMessage.name}`,
    html: `
      <p><strong>From:</strong> ${contactMessage.name} (${contactMessage.email})</p>
      <p><strong>Message:</strong></p>
      <p>${contactMessage.message}</p>
    `,
  });
};