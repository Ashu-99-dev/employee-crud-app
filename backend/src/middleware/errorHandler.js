// Centralized Error Handler Middleware
// Express error-handling middleware has 4 parameters: (err, req, res, next).
// This catches any errors thrown or passed via next(error) in route handlers.

const errorHandler = (err, req, res, next) => {
  // Log the error for debugging (visible in `docker compose logs backend`)
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Handle specific PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        return res.status(400).json({
          error: 'A record with this value already exists',
        });
      case '23503': // foreign_key_violation
        return res.status(400).json({
          error: 'Referenced record does not exist',
        });
      case '23502': // not_null_violation
        return res.status(400).json({
          error: `Missing required field: ${err.column}`,
        });
      case 'ECONNREFUSED':
        return res.status(503).json({
          error: 'Database connection failed. Please try again later.',
        });
      default:
        break;
    }
  }

  // Default: Internal Server Error
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
