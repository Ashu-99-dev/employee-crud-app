// Employee Model
// Handles all database operations for the employees table.
// Uses PARAMETERIZED QUERIES to prevent SQL injection.
//
// IMPORTANT: Never concatenate user input into SQL strings!
// Bad:  `SELECT * FROM employees WHERE id = ${id}`
// Good: `SELECT * FROM employees WHERE id = $1`, [id]

const { pool } = require('../config/database');

const EmployeeModel = {
  // Get all employees, ordered by most recently created first
  async getAll() {
    const query = 'SELECT * FROM employees ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  },

  // Get a single employee by ID
  async getById(id) {
    const query = 'SELECT * FROM employees WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0]; // Returns undefined if not found
  },

  // Create a new employee
  async create(employee) {
    const query = `
      INSERT INTO employees (name, email, department, designation, salary)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      employee.name,
      employee.email,
      employee.department || null,
      employee.designation || null,
      employee.salary || null,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Update an existing employee
  async update(id, employee) {
    const query = `
      UPDATE employees
      SET name = $1,
          email = $2,
          department = $3,
          designation = $4,
          salary = $5,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;
    const values = [
      employee.name,
      employee.email,
      employee.department || null,
      employee.designation || null,
      employee.salary || null,
      id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0]; // Returns undefined if not found
  },

  // Delete an employee by ID
  async delete(id) {
    const query = 'DELETE FROM employees WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0]; // Returns undefined if not found
  },
};

module.exports = EmployeeModel;
