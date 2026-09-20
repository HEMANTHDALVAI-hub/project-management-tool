const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const { getIO } = require('../socket/socketHandler');
const { getUserRole } = require('./projectController');

// @desc    Get tasks (filtered by user or project)
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const { project, myTasks, search, priority, status } = req.query;
    let query = {};

    if (project) {
      query.project = project;
    } else if (myTasks === 'true') {
      query.assignee = req.user.id;
    } else {
      // Find projects user has access to
      const userProjects = await Project.find({
        $or: [{ owner: req.user.id }, { 'members.user': req.user.id }],
      }).select('_id');
      const projectIds = userProjects.map((p) => p._id);
      query.project = { $in: projectIds };
    }

    if (priority) query.priority = priority;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignee', 'name email avatar')
      .populate('creator', 'name email avatar')
      .populate('project', 'name color')
      .sort({ position: 1, dueDate: 1, createdAt: -1 });

    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    next(error);
  }
};

const normalizeStatus = (status) => {
  if (!status) return 'TODO';
  const str = String(status).toUpperCase().trim().replace(/[-\s]/g, '_');
  if (str === 'TO_DO' || str === 'TODO') return 'TODO';
  if (str === 'INPROGRESS' || str === 'IN_PROGRESS') return 'IN_PROGRESS';
  if (str === 'REVIEW') return 'REVIEW';
  if (str === 'DONE' || str === 'COMPLETED') return 'DONE';
  return str;
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      project: projectId,
      assignee,
      status,
      priority,
      dueDate,
      labels,
      checklist,
    } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ success: false, message: 'Title and project are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const role = getUserRole(project, req.user.id);
    if (!role) {
      return res.status(403).json({ success: false, message: 'Not authorized to add tasks to this project' });
    }

    const cleanAssignee = (assignee && assignee !== '') ? assignee : null;
    const cleanDueDate = (dueDate && dueDate !== '') ? dueDate : null;
    const cleanStatus = normalizeStatus(status);

    const task = await Task.create({
      title,
      description: description || '',
      project: projectId,
      assignee: cleanAssignee,
      creator: req.user.id,
      status: cleanStatus,
      priority: priority || 'MEDIUM',
      dueDate: cleanDueDate,
      labels: labels || [],
      checklist: checklist || [],
    });

    await Activity.create({
      project: projectId,
      user: req.user.id,
      action: 'created task',
      target: task.title,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar')
      .populate('creator', 'name email avatar')
      .populate('project', 'name color');

    // Notify assignee if assigned to someone else
    if (cleanAssignee && cleanAssignee.toString() !== req.user.id.toString()) {
      const notif = await Notification.create({
        recipient: cleanAssignee,
        sender: req.user.id,
        type: 'TASK_ASSIGNED',
        message: `${req.user.name} assigned you a task: "${task.title}"`,
        relatedProject: projectId,
        relatedTask: task._id,
      });

      try {
        getIO().to(`user:${cleanAssignee}`).emit('notification:new', notif);
      } catch (e) {}
    }

    // Emit Socket.IO event to project room
    try {
      getIO().to(`project:${projectId}`).emit('task:created', populatedTask);
    } catch (e) {}

    res.status(201).json({ success: true, task: populatedTask });
  } catch (error) {
    next(error);
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('creator', 'name email avatar')
      .populate('project', 'name color owner members');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const previousStatus = task.status;
    const previousAssignee = task.assignee ? task.assignee.toString() : null;

    const fieldsToUpdate = [
      'title',
      'description',
      'status',
      'priority',
      'assignee',
      'dueDate',
      'labels',
      'checklist',
      'position',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'assignee') {
          task.assignee = (req.body.assignee && req.body.assignee !== '') ? req.body.assignee : null;
        } else if (field === 'dueDate') {
          task.dueDate = (req.body.dueDate && req.body.dueDate !== '') ? req.body.dueDate : null;
        } else if (field === 'status') {
          task.status = normalizeStatus(req.body.status);
        } else {
          task[field] = req.body[field];
        }
      }
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar')
      .populate('creator', 'name email avatar')
      .populate('project', 'name color');

    // Create activity log for status move or assignment
    if (req.body.status && req.body.status !== previousStatus) {
      await Activity.create({
        project: task.project,
        user: req.user.id,
        action: `moved task from ${previousStatus} to ${req.body.status}`,
        target: task.title,
      });

      // Notify task assignee if someone else moved it
      if (task.assignee && task.assignee.toString() !== req.user.id.toString()) {
        const notif = await Notification.create({
          recipient: task.assignee,
          sender: req.user.id,
          type: 'TASK_STATUS',
          message: `${req.user.name} moved "${task.title}" to ${task.status.replace('_', ' ')}`,
          relatedProject: task.project,
          relatedTask: task._id,
        });

        try {
          getIO().to(`user:${task.assignee}`).emit('notification:new', notif);
        } catch (e) {}
      }
    }

    // Notify new assignee if changed
    const newAssignee = req.body.assignee ? req.body.assignee.toString() : null;
    if (newAssignee && newAssignee !== previousAssignee && newAssignee !== req.user.id.toString()) {
      const notif = await Notification.create({
        recipient: newAssignee,
        sender: req.user.id,
        type: 'TASK_ASSIGNED',
        message: `${req.user.name} assigned you task: "${task.title}"`,
        relatedProject: task.project,
        relatedTask: task._id,
      });

      try {
        getIO().to(`user:${newAssignee}`).emit('notification:new', notif);
      } catch (e) {}
    }

    // Emit Socket.IO event to project room
    try {
      getIO().to(`project:${task.project.toString()}`).emit('task:updated', populatedTask);
    } catch (e) {}

    res.json({ success: true, task: populatedTask });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const projectId = task.project;
    const taskTitle = task.title;

    await task.deleteOne();

    await Activity.create({
      project: projectId,
      user: req.user.id,
      action: 'deleted task',
      target: taskTitle,
    });

    try {
      getIO().to(`project:${projectId.toString()}`).emit('task:deleted', { taskId: req.params.id, projectId });
    } catch (e) {}

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};
