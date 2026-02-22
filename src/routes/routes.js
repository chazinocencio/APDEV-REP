import { Router } from "express";
import { userModel } from "../model/model.js";

const router = Router()

//Sample route 
router.get('/getUsers', async (req, res) => {
    try {
        const users = await userModel.find();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

export default router;