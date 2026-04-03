/**
 * Where all models(objects) will be placed
 */

import mongoose from "mongoose";

export const StudentSchema = new mongoose.Schema({
    username: String,
    idNumber: Number,
    email: String,
    passwordHash: String,
    lastName: String,
    firstName: String,
    middleName: String,
    profilePicture: String,
    bio: String,
    degreeProgram: String,
    college: String,
    isActive: Boolean,
    canReserve: Boolean,
});

export const studentModel = mongoose.model("students", StudentSchema);

export const TechnicianSchema = new mongoose.Schema({
    username: String,
    email: String,
    passwordHash: String,
    lastName: String,
    firstName: String,
    middleName: String,
    profilePicture: String,
    bio: String,
    isActive: Boolean,
    employeeID: String,
    department: String,
    role: String
});

export const technicianModel = mongoose.model("technicians", TechnicianSchema);

export const ReservationSchema = new mongoose.Schema({
    reservationID: String,
    status: {
        type: String,
        enum: {
            values: ['Pending', 'Active', 'Cancelled', 'Completed']
        },
        default: 'Pending'
    },
    seatID: String,
    idNumber: Number,
    dateRequested: Date,
    startTime: Date,
    endTime: Date,
    isAnonymous: Boolean,
    reservationType: {
        type: String,
        enum: {
            values: ['Student', 'Walk In', 'Blocked'] 
        },
        default: 'Student'
    },
    description: String
});

export const reservationModel = mongoose.model("reservations", ReservationSchema);

export const RoomSchema = new mongoose.Schema({
    roomID: String
});

export const roomModel = mongoose.model("rooms", RoomSchema);

export const SeatSchema = new mongoose.Schema({
    seatID: String,
    roomID: String
});

export const seatModel = mongoose.model("seats", SeatSchema);