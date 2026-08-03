// src/controllers/userController.js
import { prisma } from '../config/db.js';
import bcrypt from 'bcryptjs';

// --- Get my own profile ---
const getMe = async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
      },
    },
  });
};

// --- Update my own profile (name/avatar only — not role/email) ---
const updateMe = async (req, res) => {
  const { name, avatar } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { ...(name && { name }), ...(avatar && { avatar }) },
  });

  res.status(200).json({
    status: 'success',
    data: { user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } },
  });
};

// --- ADMIN: list all users (optionally filter by role) ---
const getAllUsers = async (req, res) => {
  const { role } = req.query;

  const users = await prisma.user.findMany({
    where: role ? { role } : undefined,
    select: { id: true, name: true, email: true, role: true, isVerified: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({ status: 'success', results: users.length, data: { users } });
};

// --- ADMIN: create a barber account directly (user + barber profile together) ---
const createBarber = async (req, res) => {
  const { name, email, password, bio, specialties } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ error: 'A user with this email already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user + barber profile together — if either fails, both roll back
  const barber = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'BARBER',
      isVerified: true,
      barberProfile: {
        create: {
          bio: bio || '',
          specialties: specialties || [],
        },
      },
    },
    include: { barberProfile: true },
  });

  res.status(201).json({
    status: 'success',
    message: 'Barber account created',
    data: {
      barber: {
        id: barber.id,
        name: barber.name,
        email: barber.email,
        role: barber.role,
        barberProfile: barber.barberProfile,
      },
    },
  });
};

// --- ADMIN: change any user's role ---
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body; // 'CLIENT' | 'BARBER' | 'ADMIN'

  const targetUser = await prisma.user.findUnique({ where: { id }, include: { barberProfile: true } });
  if (!targetUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  // If promoting to BARBER and they don't have a profile yet, create an empty one
  const updateData = { role };
  if (role === 'BARBER' && !targetUser.barberProfile) {
    updateData.barberProfile = { create: { bio: '', specialties: [] } };
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    include: { barberProfile: true },
  });

  res.status(200).json({
    status: 'success',
    message: `User role updated to ${role}`,
    data: { user: { id: user.id, name: user.name, email: user.email, role: user.role } },
  });
};

export { getMe, updateMe, getAllUsers, createBarber, updateUserRole };