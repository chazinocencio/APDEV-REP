/**
 * Connection to the Database
 */

import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        //change "sample" to database name
        await mongoose.connect('mongodb://localhost:27017/ccapdev-lab-reservation');
        console.log("MongoDB connected!");
    } catch (error) {
        console.log("Unable to connect to MongoDB.");
        process.exit(1);
    }
};