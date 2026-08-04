import { prisma } from '../config/db.js';
import { sendContactNotificationToAdmin } from '../services/email.service.js';

// --- Public: submit a contact message ---
const sendContactMessage = async (req, res) => {
  const { name, email, message } = req.body;

  const contactMessage = await prisma.contactMessage.create({
    data: { name, email, message },
  });

  try {
    await sendContactNotificationToAdmin(contactMessage);
  } catch (err) {
    console.error('Failed to send contact notification email:', err.message);
    // message is still saved even if the email fails — don't block the user's response
  }

  res.status(201).json({
    status: 'success',
    message: 'Your message has been received. We will get back to you soon.',
  });
};

// --- ADMIN: view all contact messages ---
const getAllContactMessages = async (req, res) => {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({ status: 'success', results: messages.length, data: { messages } });
};

export { sendContactMessage, getAllContactMessages };