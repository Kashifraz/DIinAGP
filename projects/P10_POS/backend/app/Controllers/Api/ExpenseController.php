<?php

namespace App\Controllers\Api;

use App\Models\ExpenseModel;
use App\Models\StoreModel;
use CodeIgniter\HTTP\ResponseInterface;

class ExpenseController extends BaseApiController
{
    protected $expenseModel;
    protected $storeModel;

    public function __construct()
    {
        $this->expenseModel = new ExpenseModel();
        $this->storeModel = new StoreModel();
    }

    /**
     * List expenses
     * GET /api/expenses
     * Filtered by store (Manager sees only their store, Admin sees all)
     */
    public function index()
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            // Only Manager and Admin can view expenses
            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only managers and admins can view expenses');
            }

            $page = (int) ($this->request->getGet('page') ?? 1);
            $perPage = (int) ($this->request->getGet('per_page') ?? 10);
            $storeId = $this->request->getGet('store_id');
            $categoryId = $this->request->getGet('category_id');
            $startDate = $this->request->getGet('start_date');
            $endDate = $this->request->getGet('end_date');

            // If manager, restrict to their assigned stores
            if ($userRole === 'manager') {
                $accessibleStores = $this->storeModel->getAccessibleStores($userId, $userRole);
                $accessibleStoreIds = array_column($accessibleStores, 'id');
                
                if (empty($accessibleStoreIds)) {
                    return $this->success(['data' => [], 'pagination' => [
                        'current_page' => $page,
                        'per_page' => $perPage,
                        'total' => 0,
                        'last_page' => 1,
                    ]], 'No expenses found');
                }

                // If store_id is provided, verify access
                if ($storeId && !in_array((int)$storeId, $accessibleStoreIds)) {
                    return $this->forbidden('You do not have access to this store');
                }

                // If no store_id provided, filter by accessible stores
                if (!$storeId) {
                    $builder = $this->expenseModel->builder();
                    $builder->whereIn('store_id', $accessibleStoreIds);
                } else {
                    $builder = $this->expenseModel->builder();
                    $builder->where('store_id', $storeId);
                }
            } else {
                // Admin can see all stores
                $builder = $this->expenseModel->builder();
                if ($storeId) {
                    $builder->where('store_id', $storeId);
                }
            }

            // Apply filters
            if ($categoryId) {
                $builder->where('category_id', $categoryId);
            }
            if ($startDate) {
                $builder->where('expense_date >=', $startDate);
            }
            if ($endDate) {
                $builder->where('expense_date <=', $endDate);
            }

            $total = $builder->countAllResults(false);
            $expenses = $builder->orderBy('expense_date', 'DESC')
                ->orderBy('created_at', 'DESC')
                ->limit($perPage, ($page - 1) * $perPage)
                ->get()
                ->getResultArray();

            // Load related data
            foreach ($expenses as &$expense) {
                $expense = $this->expenseModel->getExpenseWithRelations($expense['id']);
            }

            return $this->success([
                'data' => $expenses,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => $total,
                    'last_page' => $perPage > 0 ? (int) ceil($total / $perPage) : 1,
                ],
            ], 'Expenses retrieved successfully');

        } catch (\Exception $e) {
            log_message('error', '[ExpenseController::index] Error: ' . $e->getMessage());
            return $this->error('An error occurred while retrieving expenses: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get expense by ID
     * GET /api/expenses/:id
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
                return $this->forbidden('Only managers and admins can view expenses');
            }

            $expense = $this->expenseModel->getExpenseWithRelations($id);

            if (!$expense) {
                return $this->notFound('Expense not found');
            }

            // Check store access
            if ($userRole === 'manager') {
                if (!$this->storeModel->hasAccess($expense['store_id'], $userId, $userRole)) {
                    return $this->forbidden('You do not have access to this expense');
                }
            }

            return $this->success($expense, 'Expense retrieved successfully');

        } catch (\Exception $e) {
            log_message('error', '[ExpenseController::show] Error: ' . $e->getMessage());
            return $this->error('An error occurred while retrieving expense: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Create expense
     * POST /api/expenses
     * Manager only
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
                return $this->forbidden('Only managers and admins can create expenses');
            }

            $json = $this->request->getJSON(true);
            $data = [
                'store_id'     => $json['store_id'] ?? $this->request->getPost('store_id'),
                'category_id'  => $json['category_id'] ?? $this->request->getPost('category_id'),
                'amount'       => $json['amount'] ?? $this->request->getPost('amount'),
                'description'  => $json['description'] ?? $this->request->getPost('description'),
                'expense_date' => $json['expense_date'] ?? $this->request->getPost('expense_date'),
                'receipt_url'  => $json['receipt_url'] ?? $this->request->getPost('receipt_url'),
                'created_by'   => $userId,
            ];

            // Validate store access for managers
            if ($userRole === 'manager') {
                if (!$this->storeModel->hasAccess($data['store_id'], $userId, $userRole)) {
                    return $this->forbidden('You do not have access to this store');
                }
            }

            if (!$this->expenseModel->insert($data)) {
                return $this->validationError($this->expenseModel->errors(), 'Validation failed');
            }

            $expense = $this->expenseModel->getExpenseWithRelations($this->expenseModel->getInsertID());
            return $this->success($expense, 'Expense created successfully', 201);

        } catch (\Exception $e) {
            log_message('error', '[ExpenseController::create] Error: ' . $e->getMessage());
            return $this->error('An error occurred while creating expense: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Update expense
     * PUT /api/expenses/:id
     * Manager only
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
                return $this->forbidden('Only managers and admins can update expenses');
            }

            $expense = $this->expenseModel->find($id);
            if (!$expense) {
                return $this->notFound('Expense not found');
            }

            // Check store access
            if ($userRole === 'manager') {
                if (!$this->storeModel->hasAccess($expense['store_id'], $userId, $userRole)) {
                    return $this->forbidden('You do not have access to this expense');
                }
            }

            $json = $this->request->getJSON(true);
            $data = [];

            if (isset($json['category_id']) || $this->request->getPost('category_id') !== null) {
                $data['category_id'] = $json['category_id'] ?? $this->request->getPost('category_id');
            }
            if (isset($json['amount']) || $this->request->getPost('amount') !== null) {
                $data['amount'] = $json['amount'] ?? $this->request->getPost('amount');
            }
            if (isset($json['description']) || $this->request->getPost('description') !== null) {
                $data['description'] = $json['description'] ?? $this->request->getPost('description');
            }
            if (isset($json['expense_date']) || $this->request->getPost('expense_date') !== null) {
                $data['expense_date'] = $json['expense_date'] ?? $this->request->getPost('expense_date');
            }
            if (isset($json['receipt_url']) || $this->request->getPost('receipt_url') !== null) {
                $data['receipt_url'] = $json['receipt_url'] ?? $this->request->getPost('receipt_url');
            }

            // Managers cannot change store_id
            if ($userRole === 'admin' && (isset($json['store_id']) || $this->request->getPost('store_id') !== null)) {
                $newStoreId = $json['store_id'] ?? $this->request->getPost('store_id');
                // Validate store access if manager
                if ($userRole === 'manager' && !$this->storeModel->hasAccess($newStoreId, $userId, $userRole)) {
                    return $this->forbidden('You do not have access to this store');
                }
                $data['store_id'] = $newStoreId;
            }

            if (empty($data)) {
                return $this->error('No data provided for update', null, 400);
            }

            if (!$this->expenseModel->update($id, $data)) {
                return $this->validationError($this->expenseModel->errors(), 'Validation failed');
            }

            $updatedExpense = $this->expenseModel->getExpenseWithRelations($id);
            return $this->success($updatedExpense, 'Expense updated successfully');

        } catch (\Exception $e) {
            log_message('error', '[ExpenseController::update] Error: ' . $e->getMessage());
            return $this->error('An error occurred while updating expense: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Delete expense
     * DELETE /api/expenses/:id
     * Manager only
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
                return $this->forbidden('Only managers and admins can delete expenses');
            }

            $expense = $this->expenseModel->find($id);
            if (!$expense) {
                return $this->notFound('Expense not found');
            }

            // Check store access
            if ($userRole === 'manager') {
                if (!$this->storeModel->hasAccess($expense['store_id'], $userId, $userRole)) {
                    return $this->forbidden('You do not have access to this expense');
                }
            }

            if (!$this->expenseModel->delete($id)) {
                return $this->error('Failed to delete expense', null, 500);
            }

            return $this->success(null, 'Expense deleted successfully');

        } catch (\Exception $e) {
            log_message('error', '[ExpenseController::delete] Error: ' . $e->getMessage());
            return $this->error('An error occurred while deleting expense: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get expense summary
     * GET /api/expenses/summary
     */
    public function summary()
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only managers and admins can view expense summary');
            }

            $storeId = $this->request->getGet('store_id');
            $startDate = $this->request->getGet('start_date');
            $endDate = $this->request->getGet('end_date');

            // If manager, restrict to their assigned stores
            if ($userRole === 'manager') {
                $accessibleStores = $this->storeModel->getAccessibleStores($userId, $userRole);
                $accessibleStoreIds = array_column($accessibleStores, 'id');
                
                if (empty($accessibleStoreIds)) {
                    return $this->success([
                        'total_amount' => '0.00',
                        'total_count' => 0,
                        'by_category' => [],
                        'by_date' => [],
                    ], 'Expense summary retrieved successfully');
                }

                // If store_id is provided, verify access
                if ($storeId && !in_array((int)$storeId, $accessibleStoreIds)) {
                    return $this->forbidden('You do not have access to this store');
                }

                // If no store_id provided, get summary for all accessible stores
                if (!$storeId) {
                    $summary = [
                        'total_amount' => 0,
                        'total_count' => 0,
                        'by_category' => [],
                        'by_date' => [],
                    ];

                    foreach ($accessibleStoreIds as $sid) {
                        $storeSummary = $this->expenseModel->getExpenseSummary($sid, $startDate, $endDate);
                        $summary['total_amount'] += (float) $storeSummary['total_amount'];
                        $summary['total_count'] += $storeSummary['total_count'];
                        
                        // Merge category data
                        foreach ($storeSummary['by_category'] as $cat) {
                            $catId = $cat['category_id'];
                            if (!isset($summary['by_category'][$catId])) {
                                $summary['by_category'][$catId] = $cat;
                            } else {
                                $summary['by_category'][$catId]['total_amount'] += (float) $cat['total_amount'];
                                $summary['by_category'][$catId]['count'] += $cat['count'];
                            }
                        }

                        // Merge date data
                        foreach ($storeSummary['by_date'] as $date) {
                            $dateKey = $date['date'];
                            if (!isset($summary['by_date'][$dateKey])) {
                                $summary['by_date'][$dateKey] = $date;
                            } else {
                                $summary['by_date'][$dateKey]['total_amount'] += (float) $date['total_amount'];
                                $summary['by_date'][$dateKey]['count'] += $date['count'];
                            }
                        }
                    }

                    $summary['total_amount'] = number_format($summary['total_amount'], 2, '.', '');
                    $summary['by_category'] = array_values($summary['by_category']);
                    $summary['by_date'] = array_values($summary['by_date']);

                    return $this->success($summary, 'Expense summary retrieved successfully');
                }
            }

            // Get summary for specific store
            if (!$storeId) {
                return $this->error('store_id is required', null, 400);
            }

            $summary = $this->expenseModel->getExpenseSummary($storeId, $startDate, $endDate);
            return $this->success($summary, 'Expense summary retrieved successfully');

        } catch (\Exception $e) {
            log_message('error', '[ExpenseController::summary] Error: ' . $e->getMessage());
            return $this->error('An error occurred while retrieving expense summary: ' . $e->getMessage(), null, 500);
        }
    }
}

