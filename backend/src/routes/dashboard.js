const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/:projectId', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('members.user', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember = project.members.some(m => m.user._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email');

    const now = new Date();
    const byStatus = { 'To Do': 0, 'In Progress': 0, 'Done': 0 };
    tasks.forEach(t => { byStatus[t.status] = (byStatus[t.status] || 0) + 1; });

    const overdue = tasks.filter(t =>
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done'
    );

    const perUser = {};
    tasks.forEach(t => {
      if (t.assignedTo) {
        const key = t.assignedTo._id.toString();
        if (!perUser[key]) perUser[key] = { name: t.assignedTo.name, count: 0 };
        perUser[key].count++;
      }
    });

    res.json({
      totalTasks: tasks.length,
      byStatus,
      overdueCount: overdue.length,
      overdueTasks: overdue,
      perUser: Object.values(perUser),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;