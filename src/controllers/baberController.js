import { prisma } from '../config/db.js';

const getAllBarbers = async (req, res) => {
  const barbers = await prisma.barberProfile.findMany({
    where: { isAvailable: true },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });
  res.status(200).json({ status: 'success', data: { barbers } });
};

export { getAllBarbers };