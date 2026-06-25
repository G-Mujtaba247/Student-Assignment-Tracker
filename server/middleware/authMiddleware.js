import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@school.com').toLowerCase();
    const studentEmail = (process.env.STUDENT_EMAIL || 'student@test.com').toLowerCase();

    if (decoded.id === 'admin' && decoded.role === 'admin' && decoded.email?.toLowerCase() === adminEmail) {
      req.user = {
        id: decoded.id,
        name: decoded.name || 'Administrator',
        email: decoded.email,
        role: decoded.role,
      };
      return next();
    }

    if (decoded.id === 'student' && decoded.role === 'user' && decoded.email?.toLowerCase() === studentEmail) {
      req.user = {
        id: decoded.id,
        name: decoded.name || 'Demo Student',
        email: decoded.email,
        role: decoded.role,
      };
      return next();
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }
    req.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token invalid.' });
  }
};

export default protect;
