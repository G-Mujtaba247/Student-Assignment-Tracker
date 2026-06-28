import Assignment from '../models/Assignment.js';

export const getAssignments = async (req, res, next) => {
  try {
    let query;
    if (req.user.role === 'admin') {
      query = { createdBy: req.user.id };
    } else {
      query = { studentName: req.user.name };
    }
    const assignments = await Assignment.find(query).sort({ dueDate: 1, createdAt: -1 });
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
      status: status || 'pending',
      createdBy: req.user.id,
      isSubmitted: false,
      submittedAt: null,
      startedAt: status === 'in progress' ? new Date() : null,
    });

    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
};

export const updateAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    if (req.user.role === 'admin' && assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this assignment.' });
    }

    if (req.user.role === 'user' && assignment.studentName !== req.user.name) {
      return res.status(403).json({ message: 'Not authorized to update this assignment.' });
    }

    if (req.user.role === 'user' && assignment.submitted) {
      return res.status(403).json({ message: 'Cannot update a submitted assignment.' });
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
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    if (assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only creator can delete this assignment.' });
    }

    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assignment deleted.' });
  } catch (error) {
    next(error);
  }
};

export const submitAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    if (assignment.studentName !== req.user.name) {
      return res.status(403).json({ message: 'Not authorized to submit this assignment.' });
    }

    if (assignment.submitted) {
      return res.status(400).json({ message: 'Assignment already submitted.' });
    }

    const { studentWork } = req.body;
    if (!studentWork) {
      return res.status(400).json({ message: 'Student work cannot be empty.' });
    }

    assignment.studentWork = studentWork;
    assignment.submitted = true;
    assignment.submittedAt = new Date();
    assignment.status = 'completed';
    const updated = await assignment.save();

    res.json({
      message: 'Assignment submitted successfully.',
      assignment: updated,
    });
  } catch (error) {
    next(error);
  }
};
