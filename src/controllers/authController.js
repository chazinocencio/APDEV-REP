import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import * as model from '../model/model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';
var countSalt = 10; // salt value for password hashing

function sanitizeUser(user) {
	const obj = user.toObject ? user.toObject() : { ...user };
	delete obj.passwordHash;
	return obj;
}

export async function register(req, res) {
	try {
		const isStudent = req.path.includes('/student');
		const body = req.body;

		const saltRounds = countSalt;
		const passwordHash = await bcrypt.hash(body.password, saltRounds)

		if (isStudent) {
		const exists = await model.studentModel.findOne({ email: body.email });
		if (exists) return res.status(409).json({ message: 'Email already registered' });

		const newStudent = new model.studentModel({
			username: body.username,
			idNumber: body.IDnumber || body.idNumber,
			email: body.email,
			passwordHash: passwordHash,
			lastName: body.last_name || body.lastName,
			firstName: body.first_name || body.firstName,
			middleName: body.middle_name || body.middleName,
			profilePicture: body.profilePicture || 'null',
			college: body.college || '',
			bio: body.bio || '',
			degreeProgram: body.degree_program || body.degreeProgram || '',
			isActive: true,
			canReserve: true
		});

		await newStudent.save();
		res.status(201).json({ message: 'Registered successfully', user: sanitizeUser(newStudent) });
		return;
		}

		// technician registration
		const existsTech = await model.technicianModel.findOne({ email: body.email });
		if (existsTech) return res.status(409).json({ message: 'Email already registered' });

		const newTech = new model.technicianModel({
			userName: body.userName || body.username,
			email: body.email,
			passwordHash: passwordHash,
			lastName: body.last_name || body.lastName,
			firstName: body.first_name || body.firstName,
			middleName: body.middle_name || body.middleName,
			profilePicture: body.profilePicture || 'null',
			bio: body.bio || '',
			isActive: true,
			employeeID: body.employeeID || '',
			department: body.department || '',
			role: body.role || ''
			});

		await newTech.save();
		res.status(201).json({ message: 'Registered successfully', user: sanitizeUser(newTech) });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
}

export async function login(req, res) {
	try {
		const { email, password, rememberMe } = req.body;
		if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
		const path = req.path.includes('/student');
		let user;
		let role;

		// try student
		if (path){
			user = await model.studentModel.findOne({ email: email });
			role = 'student'
		}
		else {
			user = await model.technicianModel.findOne({ email: email });
			role = 'technician'
		}
		
		if (!user) return res.status(404).json({ message: 'User not found.' });
		user = user.toObject()
		user.role = role;

		var match = await bcrypt.compare(password, user.passwordHash);

		if (!match) return res.status(401).json({ message: 'Email or Password is incorrect.' });

		const duration = rememberMe ? '21d' : '1h';
		
		const payload = { 
			id: user._id, 
			role: role, 
			email: user.email,
			username: user.username,
			rememberMe: rememberMe 
		};

		if (role === 'student') payload.idNumber = user.idNumber
		else payload.employeeID = user.employeeID

		const token = jwt.sign(payload, JWT_SECRET, { expiresIn: duration });

		res.cookie("token", token, {
			httpOnly: true,
			secure: true, // set to false if not using HTTPS locally
			sameSite: "strict",
			maxAge: rememberMe 
				? 1000 * 60 * 60 * 24 * 21 // 3 weeks
				: undefined // session cookie
		});

		res.json({ success: true, user: sanitizeUser(user) });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
}

export async function logout(req, res) {
	try {
		res.clearCookie("token", {
			httpOnly: true,
			secure: true,
			sameSite: "strict"
		});

		res.json({ success: true });
	} catch (err) {
		res.status(500).json({message: err.message});
	}
}

export async function checkAuth(req, res){
	const token = req.cookies.token;

	if(token) {
		try {
			const decoded = jwt.verify(token, JWT_SECRET);
			req.user = decoded;
			res.json({
				success: true,
				user: req.user,
				message: 'Cookie found'
			})
			if (decoded.rememberMe) {
				const { exp, iat, ...cleanPayload } = decoded;
				const newToken = jwt.sign(
					cleanPayload,
					JWT_SECRET,
					{ expiresIn: "21d" }
				);
	
				res.cookie("token", newToken, {
					httpOnly: true,
					secure: true,
					sameSite: "strict",
					maxAge: 21 * 24 * 60 * 60 * 1000
				});
			}

		} catch(err) {
			res.json({
				message: 'Token expired'
			})
		}
	} else {
		res.json({
			message: 'No cookie found'
		})
	}
}

export async function verifyTokenEndpoint(req, res) {
	// req.user is attached by middleware
	res.json({ success: true, user: req.user });
}

export default { register, login, verifyTokenEndpoint };
