import { Router } from "express";
import * as model from "../model/model.js";
import jwt from 'jsonwebtoken';
import upload from '../middleware/upload.js';
import { verifyToken } from "../middleware/auth.js";
import { getJWTSecret } from "../controllers/authController.js";
import bcrypt from 'bcrypt';

const router = Router()
var countSalt = 10; // salt value for password hashing

//view all reservations of student
// /api/student/reservations/:id

router.get('/reservations/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id)

        if (isNaN(idNumber)) {
            return res.status(400).json({ 
                message: "Invalid ID format. Please provide a valid number." 
            });
        }
        const reservation = await model.reservationModel.find({idNumber: idNumber});
        res.json(reservation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

//all reservations

router.get('/all_reservations', verifyToken, async (req, res) => {
    try {
        const reservations = await model.reservationModel.find();
        res.json(reservations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

//get student who reserved through reservation key

router.get('/reservations/key/:seat_id', verifyToken, async (req, res) => {
    try {
        const { seat_id } = req.params;
        const { start, end } = req.query;

        const startTime = new Date(start);
        const endTime = new Date(end);

        const reservation = await model.reservationModel.findOne({ 
            seatID: seat_id , 
            startTime: { $lte: startTime },
            endTime: { $gte: endTime }
        });

        if (!reservation) return res.status(404).json({ message: "No reservation found" });
        
        res.json(reservation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

//view specific reservation

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

//get student
router.get('/get_profile/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const studentProfile = await model.studentModel.findOne({idNumber: id});
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

//search profile by email 
router.get('/search_email/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const studentProfile = await model.studentModel.findOne({email: email});
        res.json(studentProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

//search profile by idNumber 
router.get('/search_idNumber/:idNumber', async (req, res) => {
    try {
        const { idNumber } = req.params;
        const studentProfile = await model.studentModel.findOne({idNumber: parseInt(idNumber)});
        res.json(studentProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

//edit profile

router.put('/edit_profile/:idNumber', verifyToken, upload.single('profilePicture'), async (req, res) =>{ 
    try {
        const { idNumber } = req.params; 
        const { username, bio } = req.body;

        const studentId = parseInt(idNumber);

        const updateFields = {};
            if (username !== undefined) updateFields.username = username;
            if (bio !== undefined) updateFields.bio = bio;
            if (req.file) updateFields.profilePicture = `/uploads/profilepics/${req.file.filename}`;

        const user = await model.studentModel.findOneAndUpdate( { idNumber: studentId }, updateFields, { returnDocument: 'after', runValidators: true });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
                
        const payload = { 
            id: user._id, 
            role: req.user.role, 
            email: user.email,
            username: user.username, 
            idNumber: idNumber,
            rememberMe: req.user.rememberMe 
        };
        
        const duration = req.user.rememberMe ? '21d' : '1h';
        const newToken = jwt.sign(payload, getJWTSecret(), { expiresIn: duration });

        res.cookie("token", newToken, {
            httpOnly: true,
            secure: true, // set to false if not using HTTPS locally
            sameSite: "strict",
            maxAge: req.user.rememberMe 
                ? 1000 * 60 * 60 * 24 * 21 // 3 weeks
                : undefined // session cookie
        });

        res.json({ success: true, data: payload });
    } 
    catch (error) {  
        res.status(400).json({ success: false, message: error.message });
    }
});

//search seat
router.get('/search_seat/:seatID', async (req, res) => {
    try {
        const{seatID} = req.params;
        const seats = await model.seatModel.findOne({seatID: seatID});
        res.json(seats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

//create new reservation

router.post('/create_reservation/:username', verifyToken, async (req, res) => {
     try {
        const {username} = req.params;
        const { reservationID, seatID, dateRequested, startTime, endTime, isAnonymous, description } = req.body;

        const student = await model.studentModel.findOne({ username: username });
         
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        if (!student.canReserve) {
            return res.status(403).json({ message: "Student is not allowed to make reservations" });
        }

        const seat = await model.seatModel.findOne({ seatID: { $regex: seatID, $options: 'i' } });
        if (!seat) {
            return res.status(404).json({ message: "Seat not found" });
        }

        const conflict = await model.reservationModel.find({
            seatID: { $regex: seatID, $options: 'i' },
            $or: [
                { startTime: { $gte: startTime, $lt: endTime } },
                { endTime: { $gt: startTime, $lte: endTime } },
                { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
            ]
        });
        
        if (conflict.length > 0) {
            return res.status(200).json({ 
                reservation: conflict, 
                message: 'Your request is conflicting with another reservation.' 
            });
        }

        const selfConflict = await model.reservationModel.find({
            idNumber: student.idNumber,
            $or: [
                { startTime: { $gte: startTime, $lt: endTime } },
                { endTime: { $gt: startTime, $lte: endTime } },
                { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
            ]
        });

        if (selfConflict.length > 0) {
            return res.status(200).json({ 
                reservation: selfConflict, 
                message: 'You have another reservation conflicting with this time.' 
            });
        }

        let newID = null;
        let existing = null
        if(!reservationID){
            const dateRequested = (new Date()).toLocaleDateString('en-CA').slice(2, 10).replace(/-/g, '');
            const type = 'RES';
            do {
                const random4Digit = Math.floor(Math.random() * 9000) + 1000;
                newID = `${type}${dateRequested}-${seatID.toUpperCase()}${random4Digit}`
                existing = await model.reservationModel.findOne({ reservationID: newID });
            } while (existing)
        }
        
        let newDateReq = dateRequested ? new Date(dateRequested) : new Date();
        

        const newReservation = new model.reservationModel({
            reservationID: reservationID || newID,
            seatID: seatID.toUpperCase(),
            idNumber: student.idNumber,
            dateRequested: newDateReq,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            isAnonymous: isAnonymous || false,
            reservationType: 'Student',
            description: description || '',
            status: 'Pending'
        });

        const savedReservation = await newReservation.save();
        res.status(201).json({
            success: true,
            message: "Reservation created successfully",
            reservation: savedReservation
        });
        console.log("new reservation created successfully");

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

//cancel reservation

// cancel reservation - require authentication and ownership (students) or technician role
router.delete('/delete_reservation/:seatID', verifyToken, async (req, res) => {
    try{
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
          const requester = req.user; // { id, role, email } <-- extracted from JWT dun sa auth.js middleware

          if (requester.role === 'student') {
              // verify ownership by matching student's idNumber
              const student = await model.studentModel.findOne({ email: requester.email });
              if (!student) return res.status(404).json({ message: 'Student not found' });
              if (student.idNumber !== reservation.idNumber) { 
                  return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
              }
          } else if (requester.role === 'technician') {
              // technicians are allowed to cancel, do nothing
          } else {
              return res.status(403).json({ message: 'Not authorized' });
          }

          const deleted = await model.reservationModel.findOneAndDelete({ _id: reservation._id });

        res.json({ 
            success: true, 
            message: 'reservation deleted successfully',
            data: {
                reservation: deleted
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// change password for logged-in student
router.put('/change_password', verifyToken, async (req, res) => {
    try {
        const requester = req.user; // { id, role, email }
        if (requester.role !== 'student') return res.status(403).json({ message: 'Only students can change student password' });

        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) return res.status(400).json({ message: 'oldPassword and newPassword are required' });

        const student = await model.studentModel.findOne({ email: requester.email });
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // check old password
        var match = await bcrypt.compare(oldPassword, student.passwordHash)
        if (!match) return res.status(401).json({ message: 'Old password is incorrect' });

        // change to new password
        const saltRounds = countSalt;
        student.passwordHash = await bcrypt.hash(newPassword, saltRounds);
        await student.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/check_password/:idNumber', verifyToken, async (req, res) => {
    try {
        const { idNumber } = req.params;
        const { password } = req.body;

        const student = await model.studentModel.findOne({ idNumber: idNumber });
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // check password
        var match = await bcrypt.compare(password, student.passwordHash)
        if (!match) return res.status(401).json({ success: false, message: 'Password is incorrect' });

        res.json({ success: true, message: 'Password is correct' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// deactivate profile (set isActive to false) for logged-in student
router.put('/deactivate', verifyToken, async (req, res) => {
    try {
        const { user, password } = req.body;

        const student = await model.studentModel.findOne({ email: user.email });
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // check password
        var match = await bcrypt.compare(password, student.passwordHash)
        if (!match) return res.status(401).json({ message: 'Password is incorrect' });

        student.isActive = false;
        await student.save();

        const reservations = await model.reservationModel.deleteMany({startTime: { $gte: new Date() }, idNumber: student.idNumber});
    

        res.json({ success: true, message: 'Profile deactivated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});


//check conflict reservation

router.get('/reservations/conflict/:seatID', verifyToken, async (req, res) => {
    try {
        const { seatID } = req.params;
        const { reservationID, startTime, endTime } = req.query;

        const start = new Date(startTime);
        const end = new Date(endTime);

        const conflict = await model.reservationModel.find({
            reservationID: {$ne: reservationID},
            seatID: { $regex: seatID, $options: 'i' },
            $or: [
                { startTime: { $gte: start, $lt: end } },
                { endTime: { $gt: start, $lte: end } },
                { startTime: { $lte: start }, endTime: { $gte: end } }
            ]
        });

        if (conflict.length > 0) {
            return res.status(200).json({ hasConflict: true, reservation: conflict });
        }
        return res.status(200).json({ hasConflict: false });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/reservations/self_conflict/:idNumber', verifyToken, async (req, res) => {
    try {
        const { idNumber } = req.params;
        const { startTime, endTime } = req.query;

        const selfConflict = await model.reservationModel.find({
            idNumber: idNumber,
            $or: [
                { startTime: { $gte: startTime, $lt: endTime } },
                { endTime: { $gt: startTime, $lte: endTime } },
                { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
            ]
        });

        if (selfConflict.length > 0) {
            return res.status(200).json({ 
                hasConflict: true,
                reservation: selfConflict, 
                message: 'You have another reservation conflicting with this time.' 
            });
        }

        return res.status(200).json({ hasConflict: false });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
})

export default router;