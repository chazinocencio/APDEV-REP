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