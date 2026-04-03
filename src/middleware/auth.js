import jwt from 'jsonwebtoken';

export function getJWTSecret(){
	const JWT_SECRET = process.env.JWT_SECRET;
	return JWT_SECRET
}

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
		const decoded = jwt.verify(token, getJWTSecret());
		req.user = decoded;

		next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid or expired token' });
	}
}

export default { verifyToken };
