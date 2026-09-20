const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { getIO } = require('../socket/socketHandler');

// Helper to check user permission level in project
const getUserRole = (project, userId) => {
  if (!project || !userId) return null;
  const ownerId = project.owner?._id ? project.owner._id.toString() : project.owner?.toString();
  if (ownerId === userId.toString()) return 'OWNER';
  
  if (Array.isArray(project.members)) {
    const member = project.members.find((m) => {
      const mUserId = m.user?._id ? m.user._id.toString() : m.user?.toString();
      return mUserId === userId.toString();
    });
    return member ? member.role : null;
  }
  return null;
};

exports.getUserRole = getUserRole;

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { 'members.user': req.user.id }],
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    // Calculate progress and task counts for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await Task.countDocuments({ project: project._id });
        const completedTasks = await Task.countDocuments({
          project: project._id,
          status: 'DONE',
        });
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          ...project.toObject(),
          totalTasks,
          completedTasks,
          progress,
        };
      })
    );

    res.json({ success: true, projects: projectsWithStats });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, color, startDate, dueDate } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      description,
      color: color || '#10B981',
      owner: req.user.id,
      startDate: startDate || new Date(),
      dueDate: dueDate || null,
      members: [{ user: req.user.id, role: 'OWNER' }],
    });

    await Activity.create({
      project: project._id,
      user: req.user.id,
      action: 'created project',
      target: project.name,
    });

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.status(201).json({
      success: true,
      project: {
        ...populated.toObject(),
        totalTasks: 0,
        completedTasks: 0,
        progress: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID with members & tasks
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const role = getUserRole(project, req.user.id);
    if (!role) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this project' });
    }

    const tasks = await Task.find({ project: project._id })
      .populate('assignee', 'name email avatar')
      .populate('creator', 'name email avatar')
      .sort({ position: 1, createdAt: -1 });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      success: true,
      project: {
        ...project.toObject(),
        userRole: role,
        totalTasks,
        completedTasks,
        progress,
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const role = getUserRole(project, req.user.id);
    if (role !== 'OWNER' && role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only project owners and admins can update settings' });
    }

    const { name, description, color, startDate, dueDate } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (color) project.color = color;
    if (startDate) project.startDate = startDate;
    if (dueDate !== undefined) project.dueDate = dueDate;

    await project.save();

    await Activity.create({
      project: project._id,
      user: req.user.id,
      action: 'updated project settings',
      target: project.name,
    });

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json({ success: true, project: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the project owner can delete this project' });
    }

    // Delete tasks and activities associated with project
    await Task.deleteMany({ project: project._id });
    await Activity.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private
exports.addMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const userRole = getUserRole(project, req.user.id);
    if (userRole !== 'OWNER' && userRole !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only owners and admins can invite members' });
    }

    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found with this email' });
    }

    const isMember = project.members.some((m) => {
      const mId = m.user?._id ? m.user._id.toString() : m.user?.toString();
      return mId === targetUser._id.toString();
    });
    if (isMember) {
      return res.status(400).json({ success: false, message: 'User is already a project member' });
    }

    project.members.push({ user: targetUser._id, role: role || 'MEMBER' });
    await project.save();

    await Activity.create({
      project: project._id,
      user: req.user.id,
      action: 'added member',
      target: targetUser.name,
    });

    const notif = await Notification.create({
      recipient: targetUser._id,
      sender: req.user.id,
      type: 'PROJECT_INVITE',
      message: `${req.user.name} added you to project "${project.name}"`,
      relatedProject: project._id,
    });

    try {
      getIO().to(`user:${targetUser._id}`).emit('notification:new', notif);
    } catch (e) {}

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json({ success: true, project: updated, message: `${targetUser.name} added to project` });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private
exports.removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const userRole = getUserRole(project, req.user.id);
    if (userRole !== 'OWNER' && userRole !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only owners and admins can remove members' });
    }

    const ownerId = project.owner?._id ? project.owner._id.toString() : project.owner?.toString();
    if (ownerId === req.params.userId.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot remove the project owner' });
    }

    project.members = project.members.filter((m) => {
      const mId = m.user?._id ? m.user._id.toString() : m.user?.toString();
      return mId !== req.params.userId.toString();
    });
    await project.save();

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json({ success: true, project: updated, message: 'Member removed from project' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project activity log
// @route   GET /api/projects/:id/activity
// @access  Private
exports.getProjectActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find({ project: req.params.id })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, activities });
  } catch (error) {
    next(error);
  }
};
