import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "replace_this_with_a_secure_secret";

// Middleware to verify JWT and attach decoded payload to req.user
export const verifyToken = (req, res, next) => {
	const authHeader = req.headers["authorization"] || req.headers["Authorization"];
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		const err = new Error("No token provided");
		err.status = 401;
		return next(err);
	}

	const token = authHeader.split(" ")[1];
	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded;
		return next();
	} catch (error) {
		error.status = 401;
		return next(error);
	}
};

// Simple auth-related error handler to normalize JWT errors
export const authErrorHandler = (err, req, res, next) => {
	if (!err) return next();

	if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError" || err.message === "No token provided") {
		return res.status(err.status || 401).json({ success: false, message: err.message });
	}

	return next(err);
};
