import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = payload => jwt.sign(payload, process.env.JWT_SECRET, {
  expiresIn: '7d',
});

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const role = 'user';

    const user = await User.create({ name, email, password: hashedPassword, role });
    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token: generateToken({ id: user._id, name: user.name, email: user.email, role: user.role }),
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token: generateToken({ id: user._id, name: user.name, email: user.email, role: user.role }),
    });
  } catch (error) {
    next(error);
  }
};
