import Assignment from '../models/Assignment.js';

export const getAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ createdBy: req.user.id }).sort({ dueDate: 1, createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    next(error);
  }
};

export const createAssignment = async (req, res, next) => {
  try {
    const { title, description, dueDate, studentName, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const assignment = await Assignment.create({
      title,
      description,
      dueDate,
      studentName,
      status,
      createdBy: req.user.id,
    });

    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
};

export const updateAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    Object.assign(assignment, req.body);
    const updated = await assignment.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }
    res.json({ message: 'Assignment deleted.' });
  } catch (error) {
    next(error);
  }
};
