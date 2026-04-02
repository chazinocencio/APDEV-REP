import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

export function verifyToken(req, res, next) {
	let token;

	if (req.cookies && req.cookies.token) {
		token = req.cookies.token;
	} else {
		const authHeader = req.headers['authorization'] || req.headers['Authorization'];
		if (!authHeader) return res.status(401).json({ message: 'Missing Authorization header' });

		const parts = authHeader.split(' ');
		if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Invalid Authorization format' });

		token = parts[1];
	}
	
	
	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded;

		// if (decoded.rememberMe) {
		// 	const { exp, iat, ...cleanPayload } = decoded;
		// 	const newToken = jwt.sign(
		// 		cleanPayload,
		// 		JWT_SECRET,
		// 		{ expiresIn: "21d" }
		// 	);

		// 	res.cookie("token", newToken, {
		// 		httpOnly: true,
		// 		secure: true,
		// 		sameSite: "strict",
		// 		maxAge: 21 * 24 * 60 * 60 * 1000
		// 	});
		// }

		next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid or expired token' });
	}
}

export default { verifyToken };
