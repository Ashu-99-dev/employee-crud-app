// Employee CRUD API - Main Server
// This is the entry point for the backend application.

// Load environment variables from .env file (for local development).
// In Docker, environment variables are injected via docker-compose.yml.
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const employeeRoutes = require('./routes/employeeRoutes');
const errorHandler = require('./middleware/errorHandler');
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------
// Middleware
// ---------------------

// Helmet: Sets various HTTP security headers to protect against
// common web vulnerabilities (XSS, clickjacking, MIME sniffing, etc.)
app.use(helmet());

// CORS: Cross-Origin Resource Sharing
// This allows the frontend (running on a different origin/port)
// to make API requests to this backend.
// In production, you would restrict this to specific origins.
app.use(cors({
  origin: '*',           // Allow all origins (restrict in production)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// ---------------------
// Routes
// ---------------------

// Health check endpoint - used by Docker health checks and monitoring
app.get('/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({
      status: dbConnected ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'employee-crud-backend',
      database: dbConnected ? 'connected' : 'disconnected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// Employee API routes - mounted at /api/employees
app.use('/api/employees', employeeRoutes);

// Handle 404 - Route not found
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Centralized error handler (must be last middleware)
app.use(errorHandler);

// ---------------------
// Start Server
// ---------------------

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(`  Employee CRUD API Server`);
  console.log(`  Running on port: ${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/health`);
  console.log(`  API base: http://localhost:${PORT}/api/employees`);
  console.log(`========================================\n`);

  // Test database connection on startup
  testConnection();
});
