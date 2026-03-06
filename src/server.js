/**
 * The executable to connect to the database and start the server
 * Initializes Express app, middleware, and routes
 */

import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import { authErrorHandler } from "./middleware/auth.js";
import { engine } from "express-handlebars";

<<<<<<< HEAD
// Import routes
import routes from "./routes/routes.js";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import technicianRoutes from "./routes/technicianRoutes.js";
=======
import routes from './routes/routes.js'
import studentRoutes from './routes/student_routes.js'
import technicianRoutes from './routes/technician_routes.js'
>>>>>>> origin/main

const app = express();
const port = process.env.PORT || 5000;

// Handlebars view engine setup
app.engine("hbs", engine({ extname: ".hbs", defaultLayout: "main" }));
app.set("view engine", "hbs");
app.set("views", "./views");

// ============================================================================
// DATABASE CONNECTION
// ============================================================================
connectDB();

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware - allows requests from frontend
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        credentials: true,
    })
);

// Static file serving
app.use(express.static("views"));

// ============================================================================
// ROUTE MOUNTING
// ============================================================================

// Authentication Routes (public)
app.use("/api/auth", authRoutes);

// API Routes
app.use("/api/users", routes);

// Student & Technician Routes
app.use("/api/student", studentRoutes);
app.use("/api/technician", technicianRoutes);

// Student API Routes (with authentication middleware)
/**
 * Student Endpoints:
 * - GET /api/student/reservations - Get all reservations
 * - GET /api/student/reservations/:reservationID - Get reservation details
 * - POST /api/student/reservations - Create new reservation
 * - PUT /api/student/reservations/:reservationID - Update reservation
 * - PUT /api/student/reservations/:reservationID/cancel - Cancel reservation
 * - GET /api/student/seats/:roomID - Get seats for a room
 */
app.use("/api/student", studentRoutes);

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

// Authentication error handler
app.use(authErrorHandler);

// Global error handler (must be last)
app.use((err, req, res, next) => {
    console.error("Global error:", err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err : {},
    });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log("MongoDB connected");
    console.log("Press Ctrl + C to stop server");
    console.log("\nAvailable routes:");
    console.log("- POST /api/auth/student/login - Student login");
    console.log("- POST /api/auth/student/register - Student registration");
    console.log("- POST /api/auth/verify - Verify JWT token");
    console.log("- GET /api/users - Sample users API");
    console.log("- Student APIs: /api/student/*");
});