/**
 * Connection to the Database
 */

import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ccapdev-lab-reservation';
        await mongoose.connect(URI, {
            dbName: 'ccapdev-lab-reservation'
        });
        console.log("MongoDB connected!");
        console.log(URI);
    } catch (error) {
        console.log("Unable to connect to MongoDB.");
        process.exit(1);
    }
};