import { Router } from "express";
import * as model from "../model/model.js";
import { verifyToken } from '../middleware/auth.js';

const router = Router()

// viewing reservations on the table graphic

router.get('/reservations_per_day/:roomID/:date', verifyToken, async(req, res) => {
    try {
        const { roomID, date } = req.params;

        // start of the day
        const startDate = new Date(date);
        startDate.setHours(0,0,0,0);

        // start of next day
        const endDate = new Date(date);
        endDate.setHours(24,0,0,0);

        const reservations = await model.reservationModel.find({
            seatID: { $regex: `^${roomID.toUpperCase()}` }, // seat starts with roomID
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

// view who reserved
router.get('/specific_reservation/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id)
        const reservationID = await model.reservationModel.find({idNumber: idNumber});
        res.json(reservationID);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

//search profile
router.get('/search_profile/:value', verifyToken, async (req, res) => {
    try {
        const { value } = req.params;
        const studentProfiles = await model.studentModel.find({
            isActive: true, // dont show deactivated accounts
            $or: [
                { username: {$regex: value, $options: "i"}},
                { lastName: {$regex: value, $options: "i"}},
                { firstName: {$regex: value, $options: "i"}},
            ] // search value matches either username, last name, or first name
        });
        res.json({
            success: true,
            data: studentProfiles
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

//search time slot *NOT COMPLETE
router.post('/search_timeslot', verifyToken, async (req, res) => {
    try {
        const { startTime, endTime } = req.body;
        const requestedStart = new Date(startTime);
        const requestedEnd = new Date(endTime);
        const reservations = await model.reservationModel.find({
            $or: [
                { startTime: { $lt: requestedEnd, $gte: requestedStart } },
                { endTime: { $gt: requestedStart, $lte: requestedEnd } },
                { startTime: { $lte: requestedStart }, endTime: { $gte: requestedEnd } }
            ]
        });

        const reservedSeatIDs = reservations.map(reservation => reservation.seatID);
        const availableSeats = await model.seatModel.find({ seatID: { $nin: reservedSeatIDs } });
        res.json({
            success: true,
            availableSeats: availableSeats
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

export default router;