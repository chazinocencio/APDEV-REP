import jwt from "jsonwebtoken";
import { studentModel } from "../model/model.js";

const JWT_SECRET = process.env.JWT_SECRET || "replace_this_with_a_secure_secret";

// Register a new student
export const register = async (req, res, next) => {
    try {
        const body = req.body || {};

        const studentData = {
            email: body.email,
            password_hash: body.password, // pre-save hook will hash
            last_name: body.last_name,
            first_name: body.first_name,
            middle_name: body.middle_name || "",
            username: body.username,
            profile_picture: body.profile_picture || null,
            bio: body.bio || "",
            user_type: "Student",
            id_number: body.id_number,
            degree_program: body.degree_program,
        };

        const student = new studentModel(studentData);
        await student.save();

        const returned = student.toObject();
        delete returned.password_hash;

        return res.status(201).json({ success: true, user: returned });
    } catch (error) {
        return next(error);
    }
};

// Login student: find by email, compare password, sign JWT
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });

        const user = await studentModel.findOne({ email: email.toLowerCase() }).lean();
        if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

        // Need a full document instance to use comparePassword (method is on schema)
        const userDoc = await studentModel.findById(user._id);
        const isMatch = await userDoc.comparePassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

        const payload = {
            id: userDoc._id,
            email: userDoc.email,
            username: userDoc.username,
            user_type: userDoc.user_type,
            id_number: userDoc.id_number || null,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });

        return res.json({ success: true, token, user: payload });
    } catch (error) {
        return next(error);
    }
};

// Protected endpoint: returns decoded user set by middleware
export const verifyToken = async (req, res, next) => {
    try {
        // `verifyToken` middleware attaches decoded payload to `req.user`
        if (!req.user) return res.status(401).json({ success: false, message: "Not authenticated" });

        return res.json({ success: true, user: req.user });
    } catch (error) {
        return next(error);
    }
};

export default { register, login, verifyToken };
