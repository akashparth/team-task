const express = require('express');
const Project = require('../models/Project');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ admin: req.user._id }, { 'members.user': req.user._id }]
    }).populate('admin', 'name email').populate('members.user', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required' });

    const project = await Project.create({
      name, description,
      admin: req.user._id,
      members: [{ user: req.user._id, role: 'Admin' }]
    });
    await project.populate('admin', 'name email');
    await project.populate('members.user', 'name email');
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('admin', 'name email')
      .populate('members.user', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember = project.members.some(m => m.user._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access denied' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/members', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.admin.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only admin can add members' });

    const userToAdd = await User.findOne({ email: req.body.email });
    if (!userToAdd) return res.status(404).json({ message: 'User not found' });

    const alreadyMember = project.members.some(m => m.user.toString() === userToAdd._id.toString());
    if (alreadyMember) return res.status(400).json({ message: 'User already a member' });

    project.members.push({ user: userToAdd._id, role: 'Member' });
    await project.save();
    await project.populate('members.user', 'name email');
    await project.populate('admin', 'name email');
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id/members/:userId', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.admin.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only admin can remove members' });

    project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
    await project.save();
    await project.populate('members.user', 'name email');
    await project.populate('admin', 'name email');
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.admin.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only admin can delete the project' });

    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;