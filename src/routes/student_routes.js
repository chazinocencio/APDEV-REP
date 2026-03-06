import { Router } from "express";
import * as model from "../model/model.js";
import { verifyToken } from "../middleware/auth.js";

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

// EXAMPLE:

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

router.get('/reservations/specific/:id', async (req, res) => {
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
router.get('/viewprofile/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const studentProfile = await model.studentModel.find({username: username});
        res.json(studentProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

//search profile
router.get('/searchprofile/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const studentProfile = await model.studentModel.find({first_name: name});
        res.json(studentProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

//edit profile

router.put('/editprofile/:idNumber', async (req, res) =>{ 
  try {
    const { idNumber } = req.params; 
    const { bio, username } = req.body;

     const studentId = parseInt(idNumber);

       const updateFields = {};
        if (bio !== undefined) updateFields.bio = bio;
        if (username !== undefined) updateFields.username = username;

    const user = await model.studentModel.findOneAndUpdate( { idNumber: studentId }, updateFields, { new: true, runValidators: true });
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

//view available seats *NOT COMPLETE
router.get('/seats/:roomID', async (req, res) => {
    try {
        const { roomID } = req.params;
        const seats = await model.seatModel.find({roomID: roomID});
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
        const {seatID, startTime, endTime, is_anonymous, description } = req.body;

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

//cancel reservation

router.delete('/delete_reservation/:seatID', async (req, res) => {
    try{
          const { seatID } = req.params;
          const { startTime, endTime } = req.body;
        
          const query = { seatID: seatID };
          
          query.startTime = startTime;
          query.endTime = endTime;

        const reservation = await model.reservationModel.findOneAndDelete(query);

        res.json({ 
            success: true, 
            message: 'reservation deleted successfully',
            data: {
                reservation: reservation
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});


//update reservation

//Viewing reservations of a room per day (table graphic)






export default router;