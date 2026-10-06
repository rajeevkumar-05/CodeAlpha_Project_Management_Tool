const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/projects', require('./src/routes/projectRoutes'));
app.use('/api/tasks', require('./src/routes/taskRoutes'));
app.use('/api/comments', require('./src/routes/commentRoutes'));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'CodeAlpha Project Management API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.send('CodeAlpha Project Management API is running');
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check available at http://localhost:${PORT}/api/health`);
});
