/**
 * Connection to the Database
 */

import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ccapdev-lab-reservation'

export const connectDB = async () => {
    try {
        //change "sample" to database name
        await mongoose.connect(MONGO_URI, {
            dbName: 'ccapdev-lab-reservation'
        });
        console.log("MongoDB connected!");
    } catch (error) {
        console.log("Unable to connect to MongoDB.");
        process.exit(1);
    }
};