import User from '../models/User.js';
import Assignment from '../models/Assignment.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const getAllAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find()
      .populate('createdBy', 'name email role')
      .sort({ dueDate: 1, createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    next(error);
  }
};

export const deleteAssignmentAsAdmin = async (req, res, next) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }
    res.json({ message: 'Assignment deleted by admin.' });
  } catch (error) {
    next(error);
  }
};
