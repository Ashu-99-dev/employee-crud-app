// Employee Routes
// Defines the REST API endpoints for employee CRUD operations.
// Each route maps an HTTP method + path to a controller function.

const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// GET    /api/employees     - List all employees
router.get('/', employeeController.getAll);

// GET    /api/employees/:id - Get a single employee
router.get('/:id', employeeController.getById);

// POST   /api/employees     - Create a new employee
router.post('/', employeeController.create);

// PUT    /api/employees/:id - Update an employee
router.put('/:id', employeeController.update);

// DELETE /api/employees/:id - Delete an employee
router.delete('/:id', employeeController.delete);

module.exports = router;
