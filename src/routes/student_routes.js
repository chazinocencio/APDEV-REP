import { Router } from "express";
import * as model from "../model/model.js";

const router = Router()

// --------------------------- EXAMPLES ----------------------------------//
//Sample route 
router.get('/getStudents', async (req, res) => {
    try {
        const students = await model.studentModel.find();
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// API Key: /api/students/getStudents

router.get('/getRooms', async (req, res) => {
    try {
        const rooms = await model.roomModel.find({roomID: "G301"});
        res.json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// /api/students/getRooms

// -----------------------------------------------------------------------//

export default router;