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

        const role = process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
      ? 'admin'
      : 'user';

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

    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const studentEmail = process.env.STUDENT_EMAIL?.toLowerCase();
    const studentPassword = process.env.STUDENT_PASSWORD;

    if (adminEmail && adminPassword && email.toLowerCase() === adminEmail) {
      if (password !== adminPassword) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const adminUser = {
        id: '000000000000000000000001',
        name: 'Administrator',
        email: adminEmail,
        role: 'admin',
      };

      return res.json({
        user: adminUser,
        token: generateToken(adminUser),
      });
    }

    if (studentEmail && studentPassword && email.toLowerCase() === studentEmail) {
      if (password !== studentPassword) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const demoStudent = {
        id: '000000000000000000000002',
        name: 'Demo Student',
        email: studentEmail,
        role: 'user',
      };

      return res.json({
        user: demoStudent,
        token: generateToken(demoStudent),
      });
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
