import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import assignmentRoutes from './routes/assignments.js';
import adminRoutes from './routes/admin.js';
import User from './models/User.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

const createDefaultLogin = async () => {
  try {
    const email = 'mujtabakhokhar247@gmail.com';
    const password = 'qwerty123';
    const name = 'Mujtaba Khokhar';

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`✅ Default login user already exists: ${email}`);
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
    });

    console.log(`✅ Default login created: ${email}`);
  } catch (error) {
    console.error('❌ Could not create default login user:', error.message);
  }
};

connectDB().then(async () => {
  await createDefaultLogin();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
