import { Router } from "express";
import * as model from "../model/model.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router()

router.get('/getTechnicians', async (req, res) => {
    try {
        const technicians = await model.technicianModel.find();
        res.json(technicians);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// API Key: /api/technician/getTechnicians



export default router;