import { Router } from "express";
import * as model from "../model/model.js";

const router = Router()

router.get('/reservations_per_day/:roomID/:date', async(req, res) => {
    try {
        const { roomID, date } = req.params;

        // start of the day
        const startDate = new Date(date);
        startDate.setHours(0,0,0,0);

        // start of next day
        const endDate = new Date(date);
        endDate.setHours(24,0,0,0);

        const reservations = await model.reservationModel.find({
            seatID: { $regex: `^${roomID}` }, // seat starts with roomID
            startTime: {
                $gte: startDate,
                $lt: endDate
            }
        });

        res.json({
            success: true,
            reservations: reservations
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
})

export default router;