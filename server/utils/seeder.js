const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

const seedData = async () => {
  try {
    const existingDemoUser = await User.findOne({ email: 'demo@taskflow.com' });
    if (existingDemoUser) {
      console.log('[Seeder] Demo database is already populated.');
      return;
    }

    console.log('[Seeder] Pre-populating demo database with sample users, projects, and tasks...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Demo@12345', salt);

    // Create users
    const demoUser = await User.create({
      name: 'Demo Admin',
      email: 'demo@taskflow.com',
      password: hashedPassword,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DemoAdmin',
      role: 'admin',
      bio: 'Product Manager leading SaaS platform development.',
    });

    const alexUser = await User.create({
      name: 'Alex Rivers',
      email: 'alex@taskflow.com',
      password: hashedPassword,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexRivers',
      bio: 'Lead Frontend Developer & UI Architect',
    });

    const priyaUser = await User.create({
      name: 'Priya Sharma',
      email: 'priya@taskflow.com',
      password: hashedPassword,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaSharma',
      bio: 'Full Stack Engineer & Security Specialist',
    });

    const rahulUser = await User.create({
      name: 'Rahul Verma',
      email: 'rahul@taskflow.com',
      password: hashedPassword,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RahulVerma',
      bio: 'Product Designer & UX Researcher',
    });

    // Create Projects
    const project1 = await Project.create({
      name: 'SaaS Platform Redesign',
      description: 'Modernizing core application design system, landing pages, and user dashboards for 2.0 release.',
      color: '#10B981',
      owner: demoUser._id,
      startDate: new Date(Date.now() - 14 * 86400000),
      dueDate: new Date(Date.now() + 21 * 86400000),
      members: [
        { user: demoUser._id, role: 'OWNER' },
        { user: alexUser._id, role: 'ADMIN' },
        { user: priyaUser._id, role: 'MEMBER' },
        { user: rahulUser._id, role: 'MEMBER' },
      ],
    });

    const project2 = await Project.create({
      name: 'Mobile App Development',
      description: 'Cross-platform iOS and Android app for real-time task notifications and offline access.',
      color: '#3B82F6',
      owner: demoUser._id,
      startDate: new Date(Date.now() - 7 * 86400000),
      dueDate: new Date(Date.now() + 45 * 86400000),
      members: [
        { user: demoUser._id, role: 'OWNER' },
        { user: priyaUser._id, role: 'ADMIN' },
        { user: alexUser._id, role: 'MEMBER' },
      ],
    });

    // Create Tasks for Project 1
    const task1 = await Task.create({
      title: 'Design Homepage & Hero Visuals',
      description: 'Create high-fidelity Figma mockups for the landing page with glassmorphism and modern hero animations.',
      project: project1._id,
      assignee: rahulUser._id,
      creator: demoUser._id,
      status: 'DONE',
      priority: 'HIGH',
      dueDate: new Date(Date.now() - 2 * 86400000),
      labels: ['Design', 'Frontend'],
      checklist: [
        { text: 'Wireframe hero layout', completed: true },
        { text: 'Design dark mode variation', completed: true },
        { text: 'Export SVG icon set', completed: true },
      ],
    });

    const task2 = await Task.create({
      title: 'Implement JWT & Socket.IO Authentication',
      description: 'Secure backend Express routes with JSON Web Tokens and set up Socket.IO user rooms for real-time alerts.',
      project: project1._id,
      assignee: priyaUser._id,
      creator: demoUser._id,
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      dueDate: new Date(Date.now() + 3 * 86400000),
      labels: ['Backend', 'Security'],
      checklist: [
        { text: 'Setup bcrypt password hashing', completed: true },
        { text: 'Build auth middleware', completed: true },
        { text: 'Add socket room authorization', completed: false },
      ],
    });

    const task3 = await Task.create({
      title: 'Build Drag & Drop Kanban Board',
      description: 'Implement interactive Kanban column drag and drop with optimistic UI updates and real-time socket syncing.',
      project: project1._id,
      assignee: alexUser._id,
      creator: demoUser._id,
      status: 'REVIEW',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 5 * 86400000),
      labels: ['Frontend', 'Kanban'],
      checklist: [
        { text: 'Setup column containers', completed: true },
        { text: 'Implement drag handlers', completed: true },
        { text: 'Touch gestures support for mobile', completed: false },
      ],
    });

    const task4 = await Task.create({
      title: 'User Analytics & Progress Dashboard',
      description: 'Create interactive project summary cards, activity timeline stream, and completed task charts.',
      project: project1._id,
      assignee: demoUser._id,
      creator: demoUser._id,
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 10 * 86400000),
      labels: ['Dashboard', 'Analytics'],
      checklist: [
        { text: 'Design statistical stat widgets', completed: false },
        { text: 'Integrate activity feed API', completed: false },
      ],
    });

    // Create Tasks for Project 2
    const task5 = await Task.create({
      title: 'Setup React Native Repository',
      description: 'Initialize Expo app structure, navigation stacks, and state management.',
      project: project2._id,
      assignee: priyaUser._id,
      creator: demoUser._id,
      status: 'DONE',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() - 5 * 86400000),
      labels: ['Mobile', 'Setup'],
      checklist: [
        { text: 'Install dependencies', completed: true },
        { text: 'Configure TypeScript', completed: true },
      ],
    });

    const task6 = await Task.create({
      title: 'Push Notification Integration',
      description: 'Connect Firebase Cloud Messaging for instant task assignment notifications on mobile devices.',
      project: project2._id,
      assignee: priyaUser._id,
      creator: demoUser._id,
      status: 'TODO',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 12 * 86400000),
      labels: ['Mobile', 'Notifications'],
      checklist: [
        { text: 'Configure APNs certificate', completed: false },
        { text: 'Setup Android FCM channel', completed: false },
      ],
    });

    // Add Comments
    await Comment.create({
      task: task1._id,
      author: rahulUser._id,
      content: 'Hero visual designs completed and exported to the assets folder! Let me know if any tweaks are needed.',
    });

    await Comment.create({
      task: task1._id,
      author: demoUser._id,
      content: 'Looks incredible Rahul! The dark mode theme is super sleek.',
    });

    await Comment.create({
      task: task2._id,
      author: priyaUser._id,
      content: 'JWT auth is live and verified. Working on Socket.IO room broadcast for live task updates next.',
    });

    // Add Activities
    await Activity.create({
      project: project1._id,
      user: demoUser._id,
      action: 'created project',
      target: 'SaaS Platform Redesign',
    });

    await Activity.create({
      project: project1._id,
      user: rahulUser._id,
      action: 'moved task from IN_PROGRESS to DONE',
      target: 'Design Homepage & Hero Visuals',
    });

    await Activity.create({
      project: project1._id,
      user: priyaUser._id,
      action: 'commented on task',
      target: 'Implement JWT & Socket.IO Authentication',
    });

    // Add Notifications for Demo User
    await Notification.create({
      recipient: demoUser._id,
      sender: rahulUser._id,
      type: 'TASK_STATUS',
      message: 'Rahul Verma completed task "Design Homepage & Hero Visuals"',
      relatedProject: project1._id,
      relatedTask: task1._id,
      read: false,
    });

    await Notification.create({
      recipient: demoUser._id,
      sender: priyaUser._id,
      type: 'TASK_COMMENT',
      message: 'Priya Sharma commented on "Implement JWT & Socket.IO Authentication"',
      relatedProject: project1._id,
      relatedTask: task2._id,
      read: false,
    });

    console.log('[Seeder] Demo database successfully seeded!');
  } catch (error) {
    console.error('[Seeder] Error seeding database:', error.message);
  }
};

module.exports = seedData;
