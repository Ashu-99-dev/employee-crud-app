// Database Configuration
// Uses the 'pg' (node-postgres) library to connect to PostgreSQL.
// Connection details are loaded from environment variables.

const { Pool } = require('pg');

// Create a connection pool.
// A pool manages multiple connections and reuses them, which is
// much more efficient than opening a new connection for every query.
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'employee_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  // Pool configuration
  max: 20,               // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 5000, // Fail if connection takes > 5 seconds
});

// Log pool errors (e.g., unexpected disconnections)
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

// Test the database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Database connected successfully at:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};

module.exports = { pool, testConnection };
