<?php

namespace App\Controllers\Api;

use App\Models\ExpenseCategoryModel;
use CodeIgniter\HTTP\ResponseInterface;

class ExpenseCategoryController extends BaseApiController
{
    protected $categoryModel;

    public function __construct()
    {
        $this->categoryModel = new ExpenseCategoryModel();
    }

    /**
     * List expense categories
     * GET /api/expense-categories
     */
    public function index()
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            // Only Manager and Admin can view expense categories
            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only managers and admins can view expense categories');
            }

            $categories = $this->categoryModel->orderBy('name', 'ASC')->findAll();

            return $this->success($categories, 'Expense categories retrieved successfully');
        } catch (\Exception $e) {
            log_message('error', '[ExpenseCategoryController::index] Error: ' . $e->getMessage());
            return $this->error('Failed to retrieve expense categories: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get expense category by ID
     * GET /api/expense-categories/:id
     */
    public function show($id = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only managers and admins can view expense categories');
            }

            $category = $this->categoryModel->find($id);

            if (!$category) {
                return $this->notFound('Expense category not found');
            }

            return $this->success($category, 'Expense category retrieved successfully');
        } catch (\Exception $e) {
            log_message('error', '[ExpenseCategoryController::show] Error: ' . $e->getMessage());
            return $this->error('Failed to retrieve expense category: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Create expense category
     * POST /api/expense-categories
     * Manager/Admin only
     */
    public function create()
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only managers and admins can create expense categories');
            }

            $json = $this->request->getJSON(true);
            $data = [
                'name'        => $json['name'] ?? $this->request->getPost('name'),
                'description' => $json['description'] ?? $this->request->getPost('description'),
            ];

            if (!$this->categoryModel->insert($data)) {
                return $this->validationError($this->categoryModel->errors(), 'Validation failed');
            }

            $category = $this->categoryModel->find($this->categoryModel->getInsertID());
            return $this->success($category, 'Expense category created successfully', 201);

        } catch (\Exception $e) {
            log_message('error', '[ExpenseCategoryController::create] Error: ' . $e->getMessage());
            return $this->error('An error occurred while creating expense category: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Update expense category
     * PUT /api/expense-categories/:id
     * Manager/Admin only
     */
    public function update($id = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only managers and admins can update expense categories');
            }

            $category = $this->categoryModel->find($id);
            if (!$category) {
                return $this->notFound('Expense category not found');
            }

            $json = $this->request->getJSON(true);
            $data = [];

            if (isset($json['name']) || $this->request->getPost('name') !== null) {
                $data['name'] = $json['name'] ?? $this->request->getPost('name');
            }
            if (isset($json['description']) || $this->request->getPost('description') !== null) {
                $data['description'] = $json['description'] ?? $this->request->getPost('description');
            }

            if (empty($data)) {
                return $this->error('No data provided for update', null, 400);
            }

            if (!$this->categoryModel->update($id, $data)) {
                return $this->validationError($this->categoryModel->errors(), 'Validation failed');
            }

            $updatedCategory = $this->categoryModel->find($id);
            return $this->success($updatedCategory, 'Expense category updated successfully');

        } catch (\Exception $e) {
            log_message('error', '[ExpenseCategoryController::update] Error: ' . $e->getMessage());
            return $this->error('An error occurred while updating expense category: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Delete expense category
     * DELETE /api/expense-categories/:id
     * Manager/Admin only
     */
    public function delete($id = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only managers and admins can delete expense categories');
            }

            $category = $this->categoryModel->find($id);
            if (!$category) {
                return $this->notFound('Expense category not found');
            }

            // Check if category has expenses
            if ($this->categoryModel->hasExpenses($id)) {
                return $this->error('Cannot delete category that has expenses', null, 400);
            }

            if (!$this->categoryModel->delete($id)) {
                return $this->error('Failed to delete expense category', null, 500);
            }

            return $this->success(null, 'Expense category deleted successfully');

        } catch (\Exception $e) {
            log_message('error', '[ExpenseCategoryController::delete] Error: ' . $e->getMessage());
            return $this->error('An error occurred while deleting expense category: ' . $e->getMessage(), null, 500);
        }
    }
}

