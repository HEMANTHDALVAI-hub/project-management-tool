const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const { getIO } = require('../socket/socketHandler');

// @desc    Get comments for a task
// @route   GET /api/tasks/:taskId/comments
// @access  Private
exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('author', 'name email avatar')
      .sort({ createdAt: 1 });

    res.json({ success: true, count: comments.length, comments });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a task
// @route   POST /api/tasks/:taskId/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty' });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const comment = await Comment.create({
      task: task._id,
      author: req.user.id,
      content: content.trim(),
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      'author',
      'name email avatar'
    );

    await Activity.create({
      project: task.project,
      user: req.user.id,
      action: 'commented on task',
      target: task.title,
    });

    // Notify assignee or creator if comment author is someone else
    const recipients = new Set();
    if (task.assignee && task.assignee.toString() !== req.user.id.toString()) {
      recipients.add(task.assignee.toString());
    }
    if (task.creator && task.creator.toString() !== req.user.id.toString()) {
      recipients.add(task.creator.toString());
    }

    for (const recipientId of recipients) {
      const notif = await Notification.create({
        recipient: recipientId,
        sender: req.user.id,
        type: 'TASK_COMMENT',
        message: `${req.user.name} commented on "${task.title}"`,
        relatedProject: task.project,
        relatedTask: task._id,
      });

      try {
        getIO().to(`user:${recipientId}`).emit('notification:new', notif);
      } catch (e) {}
    }

    // Broadcast comment:added to project room
    try {
      getIO()
        .to(`project:${task.project.toString()}`)
        .emit('comment:added', { taskId: task._id, comment: populatedComment });
    } catch (e) {}

    res.status(201).json({ success: true, comment: populatedComment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only edit your own comments' });
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty' });
    }

    comment.content = content.trim();
    await comment.save();

    const updated = await Comment.findById(comment._id).populate('author', 'name email avatar');

    res.json({ success: true, comment: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only delete your own comments' });
    }

    const taskId = comment.task;
    await comment.deleteOne();

    res.json({ success: true, message: 'Comment deleted', taskId, commentId: req.params.id });
  } catch (error) {
    next(error);
  }
};
