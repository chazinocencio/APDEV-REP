import { Router } from "express";
import * as model from "../model/model.js";
import upload from '../middleware/upload.js';
import { verifyToken } from "../middleware/auth.js";

const router = Router()


//view all reservations of student
// /api/student/reservations/:id

router.get('/reservations/:id', async (req, res) => {
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

//view specific reservation

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

router.put('/edit_profile/:idNumber', upload.single('profilePicture'), async (req, res) =>{ 
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
        res.json({ success: true, data: user });
    } 
    catch (error) {  
        res.status(400).json({ success: false, message: error.message });
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

//create new reservation

router.post('/create_reservation/:username', verifyToken, async (req, res) => {
     try {
        const {username} = req.params;
        const {seatID, startTime, endTime, isAnonymous, description } = req.body;

         const student = await model.studentModel.findOne({ username: username });
         
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
              if (student.idNumber !== reservation.idNumber) { //<-- lowkirkenuinely not sure if this will ever even happen (i forgor front end)
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

        if (student.passwordHash !== oldPassword) return res.status(401).json({ message: 'Old password is incorrect' });

        student.passwordHash = newPassword;
        await student.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// deactivate profile (set isActive to false) for logged-in student
router.put('/deactivate', verifyToken, async (req, res) => {
    try {
        const requester = req.user;
        if (requester.role !== 'student') return res.status(403).json({ message: 'Only students can deactivate their profile' });

        const student = await model.studentModel.findOne({ email: requester.email });
        if (!student) return res.status(404).json({ message: 'Student not found' });

        student.isActive = false;
        student.canReserve = false;
        await student.save();

        res.json({ success: true, message: 'Profile deactivated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});


//update reservation

//Viewing reservations of a room per day (table graphic)






export default router;