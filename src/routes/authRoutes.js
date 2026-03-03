import express from "express";
import { register, login, verifyToken as verifyController } from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/student/register", register);
router.post("/student/login", login);
router.get("/verify", verifyToken, verifyController);

export default router;
