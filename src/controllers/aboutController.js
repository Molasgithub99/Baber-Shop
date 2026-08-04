// src/controllers/aboutController.js
const getAboutInfo = async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      about: {
        name: 'Swing-A-Ling Barbershop',
        description: 'A modern barbershop offering precision cuts, fades, and grooming services in a relaxed atmosphere.',
        established: 2024,
        address: 'Bakau Newtown, Kombo North, The Gambia',
        phone: '+220 3732261',
        email: 'hello@swingalings.com',
        hours: {
          Mon_Fri: '9:00 AM - 7:00 PM',
          Sat: '9:00 AM - 5:00 PM',
          Sun: 'Closed',
        },
        socials: {
          instagram: 'https://instagram.com/swingalings',
          facebook: 'https://facebook.com/swingalings',
        },
      },
    },
  });
};

export { getAboutInfo };