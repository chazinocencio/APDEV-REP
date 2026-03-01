/**
 * Where all models(objects) will be placed
 */

import mongoose from "mongoose";

//sample schema and model
export const UserSchema = new mongoose.Schema({
    name: String,
    age: Number
});

export const userModel = mongoose.model("users", UserSchema);

export const StudentSchema = new mongoose.Schema({
    username: String,
    idNumber: Number,
    email: String,
    passwordHash: String,
    last_name: String,
    firstName: String,
    middleName: String,
    lastName: String,
    profilePicture: String,
    bio: String,
    degreeProgram: String,
    isActive: Boolean,
    canReserve: Boolean,
});

export const studentModel = mongoose.model("students", StudentSchema);