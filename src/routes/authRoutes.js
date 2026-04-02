import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// Student endpoints
router.post('/student/register', authController.register);
router.post('/student/login', authController.login);

// Technician endpoints (reuse controller)
router.post('/technician/register', authController.register);
router.post('/technician/login', authController.login);

router.get("/me", verifyToken, (req,res) =>{
    res.json({user: req.user});
})

// Protected verify endpoint
router.get('/verify', verifyToken, authController.verifyTokenEndpoint);

export default router;
