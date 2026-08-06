
import { prisma } from '../config/db.js';
import bcrypt from 'bcryptjs';
import { generateToken } from "../utils/generateToken.js"
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { sendResetPasswordEmail } from '../services/email.service.js';
import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register function
const register = async (req, res) => {
  // Handle user registration logic here
  const { name, email, password } = req.body
 
  //Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email : email },
  });

  if(existingUser){
    return res.status(400).json({ error: "User already exists with this email" });
  }

  //Hash the password before saving to the database
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  //Create a new user in the database
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  //Generate a JWT token for the newly registered user
  const token = generateToken(user.id, res);

  res.status(201).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          name: name,
          email: email,
          role: user.role,
        },
        token,
      },
    }); 
}  

// --- Google login/signup ---
const googleAuth = async (req, res) => {
  const { idToken } = req.body;

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid Google token' });
  }

  const { sub: googleId, email, name, picture } = payload;

  // Find by googleId first, then by email (in case they registered locally before)
  let user = await prisma.user.findUnique({ where: { googleId } });

  if (!user) {
    user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Link existing local account to Google
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, avatar: user.avatar || picture },
      });
    } else {
      // Create a brand new account — no password since it's Google-only
      user = await prisma.user.create({
        data: {
          name,
          email,
          googleId,
          avatar: picture,
          isVerified: true,
        },
      });
    }
  }

  const token = generateToken(user.id, res);

  res.status(200).json({
    status: 'success',
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    },
  });
};

// Login function 
const login = async (req, res) => {
  const { email, password } = req.body;

  // Check if user email exists in the table
  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  
  // // Generate JWT Token
  const token = generateToken(user.id, res);

  res.status(201).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
};

//Logout function
const logout = async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

// --- Forgot password ---
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond the same way whether or not the user exists — prevents email enumeration
  if (!user) {
    return res.status(200).json({
      status: 'success',
      message: 'If that email exists, a reset link has been sent.',
    });
  }

  // Generate a raw token to email, store only its hash in the DB
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: hashedToken, resetTokenExpiry: expiry },
  });

  try {
    await sendResetPasswordEmail(user, rawToken);
  } catch (err) {
    // Roll back the token if email fails so a stale one isn't left hanging
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: null, resetTokenExpiry: null },
    });
    return res.status(500).json({ error: 'Could not send reset email, try again later' });
  }

  res.status(200).json({
    status: 'success',
    message: 'If that email exists, a reset link has been sent.',
  });
};

// --- Reset password ---
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    return res.status(400).json({ error: 'Token is invalid or has expired' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  // Log them straight in after reset
  const jwtToken = generateToken(user.id, res);

  res.status(200).json({
    status: 'success',
    message: 'Password reset successful',
    data: { token: jwtToken },
  });
};

export { register, googleAuth, login, logout, forgotPassword, resetPassword };