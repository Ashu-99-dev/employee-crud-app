// Employee Management System - Frontend JavaScript
// Handles all CRUD operations by communicating with the backend API.

// --------------------------------------------------
// API Configuration
// --------------------------------------------------
// When running inside Docker with the Nginx reverse proxy,
// API requests to /api/employees are proxied to the backend container.
// This means we use a relative URL (no need for http://localhost:3000).
const API_BASE_URL = '/api/employees';

// --------------------------------------------------
// State
// --------------------------------------------------
let employees = [];      // Current list of employees
let editingId = null;    // ID of employee being edited (null = creating new)

// --------------------------------------------------
// DOM Elements
// --------------------------------------------------
const employeeTableBody = document.getElementById('employeeTableBody');
const employeeForm = document.getElementById('employeeForm');
const employeeModalLabel = document.getElementById('employeeModalLabel');
const alertContainer = document.getElementById('alertContainer');
const employeeCount = document.getElementById('employeeCount');
const loadingSpinner = document.getElementById('loadingSpinner');
const emptyState = document.getElementById('emptyState');

// Bootstrap modal instance (initialized after DOM loads)
let employeeModal;

// --------------------------------------------------
// Initialize
// --------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  employeeModal = new bootstrap.Modal(document.getElementById('employeeModal'));
  loadEmployees();
});

// --------------------------------------------------
// API Functions
// --------------------------------------------------

/**
 * Fetch all employees from the API and render the table.
 */
async function loadEmployees() {
  showLoading(true);
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) throw new Error('Failed to fetch employees');

    employees = await response.json();
    renderEmployeeTable();
  } catch (error) {
    showAlert('danger', `Error loading employees: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

/**
 * Create a new employee via POST request.
 */
async function createEmployee(data) {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || result.details?.join(', ') || 'Failed to create employee');
  }

  return result;
}

/**
 * Update an existing employee via PUT request.
 */
async function updateEmployee(id, data) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || result.details?.join(', ') || 'Failed to update employee');
  }

  return result;
}

/**
 * Delete an employee via DELETE request.
 */
async function deleteEmployee(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to delete employee');
  }

  return result;
}

// --------------------------------------------------
// UI Rendering
// --------------------------------------------------

/**
 * Render the employee table from the current employees array.
 */
function renderEmployeeTable() {
  // Update the employee count badge
  employeeCount.textContent = employees.length;

  // Show empty state if no employees
  if (employees.length === 0) {
    employeeTableBody.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  employeeTableBody.innerHTML = employees.map(emp => `
    <tr>
      <td><strong>#${emp.id}</strong></td>
      <td>${escapeHtml(emp.name)}</td>
      <td><a href="mailto:${escapeHtml(emp.email)}">${escapeHtml(emp.email)}</a></td>
      <td>${escapeHtml(emp.department || '—')}</td>
      <td>${escapeHtml(emp.designation || '—')}</td>
      <td class="salary-badge">$${formatSalary(emp.salary)}</td>
      <td>
        <button class="btn btn-outline-primary btn-action me-1" onclick="openEditModal(${emp.id})" title="Edit">
          <i class="bi bi-pencil-square"></i> Edit
        </button>
        <button class="btn btn-outline-danger btn-action" onclick="confirmDelete(${emp.id}, '${escapeHtml(emp.name)}')" title="Delete">
          <i class="bi bi-trash"></i> Delete
        </button>
      </td>
    </tr>
  `).join('');
}

// --------------------------------------------------
// Modal Handling
// --------------------------------------------------

/**
 * Open the modal to create a new employee.
 */
function openAddModal() {
  editingId = null;
  employeeModalLabel.textContent = 'Add New Employee';
  employeeForm.reset();
  employeeModal.show();
}

/**
 * Open the modal to edit an existing employee.
 */
async function openEditModal(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) throw new Error('Employee not found');

    const employee = await response.json();

    editingId = id;
    employeeModalLabel.textContent = 'Edit Employee';

    // Populate form fields
    document.getElementById('empName').value = employee.name || '';
    document.getElementById('empEmail').value = employee.email || '';
    document.getElementById('empDepartment').value = employee.department || '';
    document.getElementById('empDesignation').value = employee.designation || '';
    document.getElementById('empSalary').value = employee.salary || '';

    employeeModal.show();
  } catch (error) {
    showAlert('danger', `Error loading employee: ${error.message}`);
  }
}

// --------------------------------------------------
// Form Submission
// --------------------------------------------------

/**
 * Handle the employee form submission (create or update).
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  const data = {
    name: document.getElementById('empName').value.trim(),
    email: document.getElementById('empEmail').value.trim(),
    department: document.getElementById('empDepartment').value.trim(),
    designation: document.getElementById('empDesignation').value.trim(),
    salary: document.getElementById('empSalary').value ? parseFloat(document.getElementById('empSalary').value) : null,
  };

  try {
    if (editingId) {
      await updateEmployee(editingId, data);
      showAlert('success', 'Employee updated successfully!');
    } else {
      await createEmployee(data);
      showAlert('success', 'Employee created successfully!');
    }

    employeeModal.hide();
    loadEmployees(); // Refresh the table
  } catch (error) {
    showAlert('danger', error.message);
  }
}

// --------------------------------------------------
// Delete Confirmation
// --------------------------------------------------

/**
 * Confirm and delete an employee.
 */
async function confirmDelete(id, name) {
  if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
    return;
  }

  try {
    await deleteEmployee(id);
    showAlert('success', `Employee "${name}" deleted successfully.`);
    loadEmployees(); // Refresh the table
  } catch (error) {
    showAlert('danger', `Error deleting employee: ${error.message}`);
  }
}

// --------------------------------------------------
// Utility Functions
// --------------------------------------------------

/**
 * Display a Bootstrap alert at the top of the page.
 */
function showAlert(type, message) {
  const alertId = `alert-${Date.now()}`;
  const alertHtml = `
    <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${type === 'success' ? '<i class="bi bi-check-circle-fill"></i>' : '<i class="bi bi-exclamation-triangle-fill"></i>'}
      ${escapeHtml(message)}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  alertContainer.innerHTML = alertHtml;

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    const alertEl = document.getElementById(alertId);
    if (alertEl) {
      alertEl.classList.remove('show');
      setTimeout(() => alertEl.remove(), 150);
    }
  }, 5000);
}

/**
 * Show or hide the loading spinner.
 */
function showLoading(show) {
  loadingSpinner.style.display = show ? 'flex' : 'none';
}

/**
 * Format a salary number with commas.
 */
function formatSalary(salary) {
  if (salary === null || salary === undefined) return '0.00';
  return parseFloat(salary).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Escape HTML to prevent XSS attacks.
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
