import express from 'express';
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
} from '../controllers/assignmentController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.route('/').get(getAssignments).post(createAssignment);
router.route('/:id').put(updateAssignment).delete(deleteAssignment);
router.route('/:id/submit').put(submitAssignment);

export default router;
