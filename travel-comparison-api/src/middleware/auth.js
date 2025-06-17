const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { JWT_SECRET } = process.env;

// Middleware for authentication
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    const decoded = await promisify(jwt.verify)(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth;