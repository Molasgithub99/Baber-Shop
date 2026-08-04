import { prisma } from '../config/db.js';

// Get all services
const getAllServices = async (req, res) => {
  const services = await prisma.service.findMany({ orderBy: { name: 'asc' } });
  res.status(200).json({ status: 'success', data: { services } });
};

// Get a service by ID
const getServiceById = async (req, res) => {
  const { id } = req.params;
  const service = await prisma.service.findUnique({ where: { id } });

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  res.status(200).json({ status: 'success', data: { service } });
};

// Create a new service (Admin only)
const createService = async (req, res) => {
  const { name, description, price, durationMin } = req.body;
  const service = await prisma.service.create({ data: { name, description, price, durationMin } });
  res.status(201).json({ status: 'success', data: { service } });
};

export { getAllServices, getServiceById, createService };
