const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const seedData = require('./utils/seeder');
const { initSocket } = require('./socket/socketHandler');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/notifications', require('./routes/notifications'));

// Root Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'TASKFLOW Server',
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server & Connect Database
const startServer = async () => {
  try {
    await connectDB();
    await seedData();

    server.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`🚀 TASKFLOW Server running on http://localhost:${PORT}`);
      console.log(`🔑 Demo User: demo@taskflow.com | Password: Demo@12345`);
      console.log(`==================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
