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
        const {seatID, startTime, endTime, isAnonymous, description, idNumber} = req.body;

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
            isAnonymous: isAnonymous || false,
            reservationType: 'Student',
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
            isAnonymous: null,
            reservationType: 'Blocked',
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


//change password for logged-in technician
router.put('/change_password', verifyToken, async (req, res) => {
    try {
        const requester = req.user; // { id, role, email }
        if (requester.role !== 'technician') return res.status(403).json({ message: 'Only technician can change technician password' });

        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) return res.status(400).json({ message: 'oldPassword and newPassword are required' });

        const technician = await model.technicianModel.findOne({ email: requester.email });
        if (!technician) return res.status(404).json({ message: 'Technician not found' });

        if (technician.passwordHash !== oldPassword) return res.status(401).json({ message: 'Old password is incorrect' });

        technician.passwordHash = newPassword;
        await technician.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// deactivate profile (set isActive to false) for logged-in technician
router.put('/deactivate', verifyToken, async (req, res) => {
    try {
        const requester = req.user;
        if (requester.role !== 'technician') return res.status(403).json({ message: 'Only technicians can deactivate their profile' });

        const technician = await model.technicianModel.findOne({ email: requester.email });
        if (!technician) return res.status(404).json({ message: 'technician not found' });

        technician.isActive = false;
        await technician.save();

        res.json({ success: true, message: 'Profile deactivated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

export default router;