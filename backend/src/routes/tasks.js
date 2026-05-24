const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

const router = express.Router();

const getProjectAndCheckAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return { error: 'Project not found', status: 404 };
  const member = project.members.find(m => m.user.toString() === userId.toString());
  if (!member) return { error: 'Access denied', status: 403 };
  return { project, role: member.role };
};

router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const { error, status } = await getProjectAndCheckAccess(req.params.projectId, req.user._id);
    if (error) return res.status(status).json({ message: error });

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { title, description, dueDate, priority, projectId, assignedTo } = req.body;
    if (!title || !projectId) return res.status(400).json({ message: 'Title and project are required' });

    const { role, error, status } = await getProjectAndCheckAccess(projectId, req.user._id);
    if (error) return res.status(status).json({ message: error });
    if (role !== 'Admin') return res.status(403).json({ message: 'Only admins can create tasks' });

    const task = await Task.create({
      title, description, dueDate, priority,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
    });
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { role, error, status } = await getProjectAndCheckAccess(task.project, req.user._id);
    if (error) return res.status(status).json({ message: error });

    if (role === 'Member') {
      if (task.assignedTo?.toString() !== req.user._id.toString())
        return res.status(403).json({ message: 'You can only update your assigned tasks' });
      task.status = req.body.status || task.status;
    } else {
      const { title, description, dueDate, priority, status: taskStatus, assignedTo } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (priority) task.priority = priority;
      if (taskStatus) task.status = taskStatus;
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { role, error, status } = await getProjectAndCheckAccess(task.project, req.user._id);
    if (error) return res.status(status).json({ message: error });
    if (role !== 'Admin') return res.status(403).json({ message: 'Only admins can delete tasks' });

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;