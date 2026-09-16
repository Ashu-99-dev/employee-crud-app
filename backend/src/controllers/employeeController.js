// Employee Controller
// Handles HTTP request/response logic for employee endpoints.
// Validates input, calls the model, and returns appropriate responses.

const EmployeeModel = require('../models/employeeModel');

// Simple email validation regex
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Validate employee input fields
const validateEmployee = (data) => {
  const errors = [];

  if (!data.name || data.name.trim() === '') {
    errors.push('Name is required');
  }

  if (!data.email || data.email.trim() === '') {
    errors.push('Email is required');
  } else if (!isValidEmail(data.email)) {
    errors.push('Email format is invalid');
  }

  if (data.salary !== undefined && data.salary !== null && data.salary !== '') {
    const salary = Number(data.salary);
    if (isNaN(salary)) {
      errors.push('Salary must be a valid number');
    } else if (salary < 0) {
      errors.push('Salary must be non-negative');
    }
  }

  return errors;
};

const employeeController = {
  // GET /api/employees
  async getAll(req, res, next) {
    try {
      const employees = await EmployeeModel.getAll();
      res.json(employees);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/employees/:id
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      // Validate that id is a number
      if (isNaN(parseInt(id, 10))) {
        return res.status(400).json({ error: 'Invalid employee ID' });
      }

      const employee = await EmployeeModel.getById(id);

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      res.json(employee);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/employees
  async create(req, res, next) {
    try {
      const errors = validateEmployee(req.body);

      if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
      }

      const employee = await EmployeeModel.create(req.body);

      res.status(201).json({
        message: 'Employee created successfully',
        employee,
      });
    } catch (error) {
      // Handle duplicate email (PostgreSQL error code 23505 = unique_violation)
      if (error.code === '23505') {
        return res.status(400).json({ error: 'An employee with this email already exists' });
      }
      next(error);
    }
  },

  // PUT /api/employees/:id
  async update(req, res, next) {
    try {
      const { id } = req.params;

      if (isNaN(parseInt(id, 10))) {
        return res.status(400).json({ error: 'Invalid employee ID' });
      }

      const errors = validateEmployee(req.body);

      if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
      }

      const employee = await EmployeeModel.update(id, req.body);

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      res.json({
        message: 'Employee updated successfully',
        employee,
      });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'An employee with this email already exists' });
      }
      next(error);
    }
  },

  // DELETE /api/employees/:id
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      if (isNaN(parseInt(id, 10))) {
        return res.status(400).json({ error: 'Invalid employee ID' });
      }

      const employee = await EmployeeModel.delete(id);

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      res.json({
        message: 'Employee deleted successfully',
        employee,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = employeeController;
