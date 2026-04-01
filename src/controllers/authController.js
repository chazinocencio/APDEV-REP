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
		
		user = user.toObject()
		user.role = role;
		if (!user) return res.status(404).json({ message: 'User not found' });

		var match = await bcrypt.compare(password, user.passwordHash);

		if (!match) return res.status(401).json({ message: 'Invalid credentials' });

		const payload = { id: user._id, role, email: user.email };
		const token = jwt.sign(payload, JWT_SECRET, { expiresIn: rememberMe ? '21d' : '1h' });

		res.json({ success: true, token, user: sanitizeUser(user) });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
}

export async function verifyTokenEndpoint(req, res) {
	// req.user is attached by middleware
	res.json({ success: true, user: req.user });
}

export default { register, login, verifyTokenEndpoint };
