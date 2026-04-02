import express from "express"; 
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from './db.js';

import routes from './routes/routes.js'
import studentRoutes from './routes/student_routes.js'
import technicianRoutes from './routes/technician_routes.js'
import commonRoutes from './routes/common_routes.js'
import authRoutes from './routes/authRoutes.js'

const app = express();
const port = 3000;

connectDB();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());
app.use(express.static("views"));
app.use(cookieParser());
app.use("/uploads", express.static("src/uploads"));

// route to the user api keys
app.use("/api/users", routes); // sample

app.use("/api/student", studentRoutes);
app.use("/api/technician", technicianRoutes);
app.use("/api/common_routes", commonRoutes);
app.use("/api/auth", authRoutes);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log('Ctrl + C to stop server.');
});