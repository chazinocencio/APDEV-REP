import { Router } from "express";
import * as model from "../model/model.js";

const router = Router()

// viewing reservations on the table graphic

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

// view who reserved
router.get('/specific_reservation/:id', async (req, res) => {
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

//view profile
router.get('/view_profile/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const studentProfile = await model.studentModel.findOne({username: username});
        res.json(studentProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

//search profile
router.get('/search_profile/:value', async (req, res) => {
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
router.get('/search_seats', async (req, res) => {
    try {
        const seats = await model.seatModel.find();
        res.json(seats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

export default router;