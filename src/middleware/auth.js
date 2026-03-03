/**
 * Authentication and Authorization Middleware
 * Handles JWT verification and role-based access control
 */

import jwt from "jsonwebtoken";

// JWT secret key (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// ============================================================================
// JWT VERIFICATION MIDDLEWARE
// ============================================================================
/**
 * Middleware to verify JWT token from request headers
 * Extracts and validates the token, stores user info in req.user
 *
 * Expected Header: Authorization: Bearer <token>
 */
export const verifyToken = (req, res, next) => {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "No token provided or invalid format",
        });
    }

    // Remove "Bearer " prefix
    const token = authHeader.substring(7);

    try {
        // Verify and decode token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Store user info for use in route handlers
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: "Invalid or expired token",
            error: error.message,
        });
    }
};

// ============================================================================
// ROLE-BASED ACCESS CONTROL MIDDLEWARE
// ============================================================================
/**
 * Middleware factory to enforce role-based access
 * Usage: app.use(requireRole("Student"))
 *
 * @param {string} requiredRole - The role required to access the route
 * @returns {Function} Middleware function
 */
export const requireRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        if (req.user.user_type !== requiredRole) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${requiredRole}`,
                userRole: req.user.user_type,
            });
        }

        next();
    };
};

// ============================================================================
// JWT TOKEN GENERATION UTILITY
// ============================================================================
/**
 * Generate JWT token for authenticated user
 * Should be used after user login verification
 *
 * @param {Object} user - User object from database
 * @returns {string} JWT token
 */
export const generateToken = (user) => {
    const payload = {
        user_id: user._id,
        username: user.username,
        email: user.email,
        user_type: user.user_type,
        id_number: user.id_number || null, // Included for Students
        employee_id: user.employee_id || null, // Included for Technicians
    };

    // Token expires in 24 hours
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
};

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================
/**
 * Centralized error handling middleware for authentication errors
 */
export const authErrorHandler = (err, req, res, next) => {
    if (err.name === "JsonWebTokenError") {
        return res.status(403).json({
            success: false,
            message: "Invalid token",
            error: err.message,
        });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Token expired",
            error: err.message,
        });
    }

    next(err);
};
