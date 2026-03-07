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

//reserve for student

router.post('/reserve_for_student', verifyToken, async (req, res) => {
     try {
        const {seatID, startTime, endTime, is_anonymous, description, idNumber} = req.body;

        const student = await model.studentModel.findOne({ idNumber: idNumber });
         
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        if (!student.canReserve) {
            return res.status(403).json({ message: "Student is not allowed to make reservations" });
        }

        const seat = await model.seatModel.findOne({ seatID: seatID });
        if (!seat) {
            return res.status(404).json({ message: "Seat not found" });
        }

        const newReservation = new model.reservationModel({
            seatID: seatID,
            idNumber: student.idNumber,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            is_anonymous: is_anonymous || false,
            reservation_type: 'Student',
            description: description || '',
            status: 'Pending'
        });

        const savedReservation = await newReservation.save();
        res.status(201).json({
            message: "Reservation created successfully",
            reservation: savedReservation
        });
        console.log("new reservation created successfully");

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/block_seat', verifyToken, async(req, res) =>{
    try {
        const {seatID, startTime, endTime, description} = req.body;

        const seat = await model.seatModel.findOne({ seatID: seatID });
        if (!seat) {
            return res.status(404).json({ message: "Seat not found" });
        }

        const newRecord = new model.reservationModel({
            seatID: seatID,
            idNumber: null,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            is_anonymous: null,
            reservation_type: 'Blocked',
            description: description || '',
            status: 'Pending'
        });

        const savedRecord = await newRecord.save();
        res.status(201).json({
            message: `${seatID} blocked successfully`,
            reservation: savedRecord
        });
        console.log(`${seatID} blocked successfully`);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// block room

/* insert code */

// block student

router.put('/block_student/:id', async(req, res) =>{
    try{
        const { id } = req.params;
        const idNumber = parseInt(id);

        const student = await model.studentModel.findOneAndUpdate({idNumber: idNumber}, {canReserve: false}, {new: true, runValidators: true});
        if(!student)
            return res.status(404).json({success: false, message: 'Student not found'});
        
        res.json({ success: true, data: student });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// unblock student

router.put('/unblock_student/:id', async(req, res) =>{
    try{
        const { id } = req.params;
        const idNumber = parseInt(id);

        const student = await model.studentModel.findOneAndUpdate({idNumber: idNumber}, {canReserve: true}, {new: true, runValidators: true});
        if(!student)
            return res.status(404).json({success: false, message: 'Student not found'});
        
        res.json({ success: true, data: student });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// edit profile

router.put('/edit_profile/:employeeID', async (req, res) =>{ 
    try {
        const { employeeID } = req.params; 
        const { bio, username, profilePicture } = req.body;

        const studentId = parseInt(idNumber);

        const updateFields = {};
            if (bio !== undefined) updateFields.bio = bio;
            if (username !== undefined) updateFields.username = username;
            if (profilePicture !== undefined) updateFields.profilePicture = profilePicture;

        const user = await model.technicianModel.findOneAndUpdate( { employeeID: employeeID }, updateFields, { new: true, runValidators: true });
        if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } 
    catch (error) {  
        res.status(400).json({ success: false, message: error.message });
    }
});

export default router;