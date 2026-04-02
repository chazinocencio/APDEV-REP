import { Router } from "express";
import * as model from "../model/model.js";
import { verifyToken } from "../middleware/auth.js";
import upload from '../middleware/upload.js';
import bcrypt from "bcrypt"

const router = Router()
var countSalt = 10; // salt value for password hashing

router.get('/getTechnicians', verifyToken, async (req, res) => {
    try {
        const technicians = await model.technicianModel.find();
        res.json(technicians);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// view technician profile
router.get('/view_profile/:username', verifyToken, async (req, res) => {
    try {
        const { username } = req.params;
        const techProfile = await model.technicianModel.findOne({ username: username });
        res.json(techProfile);
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
            success: true,
            message: `${seatID} blocked successfully`,
            reservation: savedRecord
        });
        console.log(`${seatID} blocked successfully`);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// update reservation
router.put('/update_reservation/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { seatID, startTime, endTime, description } = req.body;

        if (!seatID || !startTime || !endTime) {
            return res.status(400).json({ success: false, message: 'seatID, startTime and endTime are required' });
        }

        const reservation = await model.reservationModel.findById(id);
        if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });

        // check for conflicts on the target seat
        const newStart = new Date(startTime);
        const newEnd = new Date(endTime);

        const conflict = await model.reservationModel.findOne({
            seatID: seatID,
            _id: { $ne: id },
            $and: [
                { startTime: { $lt: newEnd } },
                { endTime: { $gt: newStart } }
            ]
        });

        if (conflict) {
            return res.status(409).json({ success: false, message: 'Time slot conflicts with existing reservation' });
        }

        reservation.seatID = seatID;
        reservation.startTime = newStart;
        reservation.endTime = newEnd;
        if (description !== undefined) reservation.description = description;

        const saved = await reservation.save();
        res.json({ success: true, reservation: saved });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// delete reservation (technician)
router.delete('/delete_reservation/:seatID', verifyToken, async (req, res) => {
    try {
        const { seatID } = req.params;
        const { startTime, endTime } = req.body;

        if (!startTime || !endTime) {
            return res.status(400).json({ message: 'startTime and endTime required in body' });
        }

        // find reservation
        const query = { seatID: seatID, startTime: new Date(startTime), endTime: new Date(endTime) };
        const reservation = await model.reservationModel.findOne(query);
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

        // fetch requester info from token
        const requester = req.user; // { id, role, email }

        if (requester.role === 'student') {
            const student = await model.studentModel.findOne({ email: requester.email });
            if (!student) return res.status(404).json({ message: 'Student not found' });
            if (student.idNumber !== reservation.idNumber) {
                return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
            }
        } else if (requester.role === 'technician') {
            // allowed
        } else {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const deleted = await model.reservationModel.findOneAndDelete({ _id: reservation._id });

        res.json({ 
            success: true, 
            message: 'reservation deleted successfully',
            data: { reservation: deleted }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// block room

/* insert code */

// view all reservations

router.get('/all_reservations', verifyToken, async(req, res) => {
    try {
        const reservations = await model.reservationModel.find();
        res.json(reservations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// block student

router.put('/block_student/:id', verifyToken, async(req, res) =>{
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

router.put('/unblock_student/:id', verifyToken, async(req, res) =>{
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

router.put('/edit_profile/:employeeID', verifyToken, upload.single('profilePicture'), async (req, res) =>{ 
    try {
        const { employeeID } = req.params; 
        const { bio, username } = req.body;

        const updateFields = {};
            if (bio !== undefined) updateFields.bio = bio;
            if (username !== undefined) updateFields.username = username;
            if (req.file) updateFields.profilePicture = `/uploads/profilepics/${req.file.filename}`;

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

        //check old password
        var match = await bcrypt.compare(oldPassword, technician.passwordHash)
        if (!match) return res.status(401).json({ message: 'Old password is incorrect' });

        // change to new password
        const saltRounds = countSalt;
        technician.passwordHash = await bcrypt.hash(newPassword, saltRounds);
        await technician.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/check_password/:employeeID', verifyToken, async (req, res) => {
    try {
        const { employeeID } = req.params;
        const { password } = req.body;

        const technician = await model.technicianModel.findOne({ employeeID: employeeID });
        if (!technician) return res.status(404).json({ message: 'Technician not found' });

        // check password
        var match = await bcrypt.compare(password, technician.passwordHash)
        if (!match) return res.status(401).json({ success: false, message: 'Password is incorrect' });

        res.json({ success: true, message: 'Password is correct' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// deactivate profile (set isActive to false) for logged-in technician
router.put('/deactivate', verifyToken, async (req, res) => {
    try {
        const { user, password } = req.body;

        const technician = await model.technicianModel.findOne({ email: user.email });
        if (!technician) return res.status(404).json({ message: 'Technician not found' });

        // check password
        var match = await bcrypt.compare(password, technician.passwordHash)
        if (!match) return res.status(401).json({ message: 'Password is incorrect' });

        technician.isActive = false;
        await technician.save();

        res.json({ success: true, message: 'Profile deactivated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

export default router;