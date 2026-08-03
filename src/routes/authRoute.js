import express from 'express';

// import { register, login, logout,  } from '../controllers/authController.js';
import { register, login, logout, googleAuth, forgotPassword, resetPassword } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { registerSchema, loginSchema, googleAuthSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/authValidator.js';

const router = express.Router();

//Auth routes
// {{baseUrl}}/auth/register
router.post("/register", validateRequest(registerSchema), register );
router.post("/login", validateRequest(loginSchema), login );
router.post("/logout", logout );
router.post("/google", validateRequest(googleAuthSchema), googleAuth );
router.post("/forgot-password", validateRequest(forgotPasswordSchema), forgotPassword );
router.patch("/reset-password/:token", validateRequest(resetPasswordSchema),  resetPassword );

export default router;