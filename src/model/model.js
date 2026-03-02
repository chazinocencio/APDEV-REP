/**
 * Computer Lab Reservation System - Data Models
 * Defines all schemas using Mongoose with relationships, validation, and constraints
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ============================================================================
// USER SCHEMA (Base class for Student and Technician)
// ============================================================================
export const UserSchema = new mongoose.Schema(
    {
        // Unique identifier for user
        user_id: {
            type: String,
            unique: true,
            sparse: true, // Allows null for polymorphic usage
        },

        // DLSU email - must be unique
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            match: /.+\@.+\..+/, // Basic email validation
            trim: true,
        },

        // Hashed password using bcrypt
        password_hash: {
            type: String,
            required: true,
        },

        // User's name fields
        last_name: {
            type: String,
            required: true,
            trim: true,
        },

        first_name: {
            type: String,
            required: true,
            trim: true,
        },

        middle_name: {
            type: String,
            trim: true,
            default: "",
        },

        // Unique username for identification
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
        },

        // Profile picture URL
        profile_picture: {
            type: String,
            default: null,
        },

        // User bio/description
        bio: {
            type: String,
            default: "",
            maxlength: 500,
        },

        // Determines if user account is active/inactive
        is_active: {
            type: Boolean,
            default: true,
        },

        // User type discriminator for polymorphic queries
        user_type: {
            type: String,
            enum: ["Student", "Technician"],
            required: true,
        },
    },
    { timestamps: true, discriminatorKey: "user_type" }
);

// Index for frequently queried fields
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });

// Hash password before saving
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password_hash")) return next();

    try {
        const hashedPassword = await bcrypt.hash(this.password_hash, 10);
        this.password_hash = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password_hash);
};

export const userModel = mongoose.model("User", UserSchema);

// ============================================================================
// STUDENT SCHEMA (Inherits from User)
// ============================================================================
export const StudentSchema = new mongoose.Schema(
    {
        // Student ID number (unique)
        id_number: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        // Degree program (e.g., "BS Computer Science")
        degree_program: {
            type: String,
            required: true,
        },

        // Determines if student can make reservations
        can_reserve: {
            type: Boolean,
            default: true,
        },

        // Reference to User document via discriminator
        // (Automatically handled by discriminator)
    },
    { timestamps: true }
);

// Index for quick lookups
StudentSchema.index({ id_number: 1 });

export const studentModel = userModel.discriminator(
    "Student",
    StudentSchema
);

// ============================================================================
// TECHNICIAN SCHEMA (Inherits from User)
// ============================================================================
export const TechnicianSchema = new mongoose.Schema(
    {
        // Employee ID number (unique)
        employee_id: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        // Reference to User document via discriminator
        // (Automatically handled by discriminator)
    },
    { timestamps: true }
);

// Index for quick lookups
TechnicianSchema.index({ employee_id: 1 });

export const technicianModel = userModel.discriminator(
    "Technician",
    TechnicianSchema
);

// ============================================================================
// ROOM SCHEMA
// ============================================================================
export const RoomSchema = new mongoose.Schema(
    {
        // Room ID - Primary Key (e.g., "G301", "G302")
        room_id: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        // Room name or description
        room_name: {
            type: String,
            required: true,
        },

        // Building location
        building: {
            type: String,
            default: "Engineering Building",
        },

        // Total number of seats in the room
        capacity: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    { timestamps: true }
);

// Index for room lookups
RoomSchema.index({ room_id: 1 });

export const roomModel = mongoose.model("Room", RoomSchema);

// ============================================================================
// SEAT SCHEMA
// ============================================================================
export const SeatSchema = new mongoose.Schema(
    {
        // Seat ID - Primary Key (e.g., "G302-7")
        seat_id: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        // Room ID - Foreign Key reference to Room
        room_id: {
            type: String,
            required: true,
            ref: "Room",
        },

        // Seat number within the room
        seat_number: {
            type: Number,
            required: true,
            min: 1,
        },

        // Current status of the seat
        current_status: {
            type: String,
            enum: ["available", "reserved", "blocked", "maintenance"],
            default: "available",
        },

        // Additional metadata
        seat_type: {
            type: String,
            enum: ["standard", "accessible"],
            default: "standard",
        },
    },
    { timestamps: true }
);

// Compound index to ensure unique seat per room
SeatSchema.index({ room_id: 1, seat_number: 1 }, { unique: true });
SeatSchema.index({ seat_id: 1 });

export const seatModel = mongoose.model("Seat", SeatSchema);

// ============================================================================
// RESERVATION SCHEMA
// ============================================================================
export const ReservationSchema = new mongoose.Schema(
    {
        // Reservation ID - Primary Key (auto-generated ObjectId)
        // Note: MongoDB generates _id automatically

        // Foreign Key to Seat
        seat_id: {
            type: String,
            required: true,
            ref: "Seat",
        },

        // Foreign Key to Student (nullable for walk-ins)
        id_number: {
            type: String,
            ref: "Student",
            default: null, // Null for walk-ins or blocked seats
        },

        // Reservation start time
        start: {
            type: Date,
            required: true,
        },

        // Reservation end time
        end: {
            type: Date,
            required: true,
        },

        // Status of the reservation
        status: {
            type: String,
            enum: ["Pending", "Active", "Cancelled", "Completed"],
            default: "Pending",
        },

        // Indicates if reservation is anonymous
        is_anonymous: {
            type: Boolean,
            default: false,
        },

        // Type of reservation
        reservation_type: {
            type: String,
            enum: ["STUDENT", "WALK_IN", "BLOCKED"],
            default: "STUDENT",
        },

        // Description or reason for reservation
        description: {
            type: String,
            maxlength: 500,
            default: "",
        },

        // Technician who created blocked reservation
        created_by: {
            type: String,
            ref: "Technician",
            default: null,
        },
    },
    { timestamps: true }
);

// UNIQUE constraint: no overlapping reservations for the same seat
ReservationSchema.index(
    { seat_id: 1, start: 1, end: 1 },
    { unique: false } // Handled in application logic due to date ranges
);

// Indexes for common queries
ReservationSchema.index({ id_number: 1, status: 1 });
ReservationSchema.index({ start: 1, end: 1 });
ReservationSchema.index({ seat_id: 1, status: 1 });

export const reservationModel = mongoose.model("Reservation", ReservationSchema);