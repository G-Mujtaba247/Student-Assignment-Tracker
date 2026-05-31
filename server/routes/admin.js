import express from 'express';
import protect from '../middleware/authMiddleware.js';
import admin from '../middleware/adminMiddleware.js';
import {
  getUsers,
  getAllAssignments,
  deleteAssignmentAsAdmin,
} from '../controllers/adminController.js';

const router = express.Router();

router.use(protect, admin);
router.get('/users', getUsers);
router.get('/assignments', getAllAssignments);
router.delete('/assignments/:id', deleteAssignmentAsAdmin);

export default router;
