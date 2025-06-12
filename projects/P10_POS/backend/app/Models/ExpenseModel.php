<?php

namespace App\Models;

use CodeIgniter\Model;

class ExpenseModel extends Model
{
    protected $table            = 'expenses';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'store_id',
        'category_id',
        'amount',
        'description',
        'expense_date',
        'receipt_url',
        'created_by',
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    // Validation
    protected $validationRules = [
        'store_id'     => 'required|integer|is_not_unique[stores.id]',
        'category_id'  => 'required|integer|is_not_unique[expense_categories.id]',
        'amount'       => 'required|decimal|greater_than[0]',
        'description'  => 'permit_empty',
        'expense_date' => 'required|valid_date[Y-m-d]',
        'receipt_url'  => 'permit_empty|max_length[500]',
        'created_by'   => 'required|integer|is_not_unique[users.id]',
    ];

    protected $validationMessages = [
        'store_id' => [
            'required'      => 'Store is required',
            'is_not_unique' => 'Invalid store selected',
        ],
        'category_id' => [
            'required'      => 'Category is required',
            'is_not_unique' => 'Invalid category selected',
        ],
        'amount' => [
            'required'    => 'Amount is required',
            'greater_than' => 'Amount must be greater than 0',
        ],
        'expense_date' => [
            'required'    => 'Expense date is required',
            'valid_date' => 'Invalid date format',
        ],
    ];

    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;

    /**
     * Get expense with related data
     */
    public function getExpenseWithRelations(int $expenseId)
    {
        $expense = $this->find($expenseId);
        
        if (!$expense) {
            return null;
        }

        // Load store
        $storeModel = new StoreModel();
        $expense['store'] = $storeModel->find($expense['store_id']);

        // Load category
        $categoryModel = new ExpenseCategoryModel();
        $expense['category'] = $categoryModel->find($expense['category_id']);

        // Load creator
        $userModel = new UserModel();
        $expense['creator'] = $userModel->find($expense['created_by']);

        return $expense;
    }

    /**
     * Get expenses by store with filters
     */
    public function getExpensesByStore(int $storeId, array $filters = [])
    {
        $builder = $this->builder();
        $builder->where('store_id', $storeId);

        // Date range filter
        if (isset($filters['start_date']) && !empty($filters['start_date'])) {
            $builder->where('expense_date >=', $filters['start_date']);
        }
        if (isset($filters['end_date']) && !empty($filters['end_date'])) {
            $builder->where('expense_date <=', $filters['end_date']);
        }

        // Category filter
        if (isset($filters['category_id']) && !empty($filters['category_id'])) {
            $builder->where('category_id', $filters['category_id']);
        }

        // Order by expense_date descending
        $builder->orderBy('expense_date', 'DESC');
        $builder->orderBy('created_at', 'DESC');

        return $builder->get()->getResultArray();
    }

    /**
     * Get expense summary by store
     */
    public function getExpenseSummary(int $storeId, string $startDate = null, string $endDate = null)
    {
        $builder = $this->builder();
        $builder->where('store_id', $storeId);

        if ($startDate) {
            $builder->where('expense_date >=', $startDate);
        }
        if ($endDate) {
            $builder->where('expense_date <=', $endDate);
        }

        $expenses = $builder->get()->getResultArray();

        $summary = [
            'total_amount'      => 0,
            'total_count'       => count($expenses),
            'by_category'       => [],
            'by_date'           => [],
        ];

        $categoryModel = new ExpenseCategoryModel();

        foreach ($expenses as $expense) {
            $summary['total_amount'] += (float) $expense['amount'];

            // Group by category
            $categoryId = $expense['category_id'];
            if (!isset($summary['by_category'][$categoryId])) {
                $category = $categoryModel->find($categoryId);
                $summary['by_category'][$categoryId] = [
                    'category_id'   => $categoryId,
                    'category_name' => $category['name'] ?? 'Unknown',
                    'total_amount'  => 0,
                    'count'         => 0,
                ];
            }
            $summary['by_category'][$categoryId]['total_amount'] += (float) $expense['amount'];
            $summary['by_category'][$categoryId]['count']++;

            // Group by date
            $date = $expense['expense_date'];
            if (!isset($summary['by_date'][$date])) {
                $summary['by_date'][$date] = [
                    'date'         => $date,
                    'total_amount' => 0,
                    'count'        => 0,
                ];
            }
            $summary['by_date'][$date]['total_amount'] += (float) $expense['amount'];
            $summary['by_date'][$date]['count']++;
        }

        // Convert associative arrays to indexed arrays
        $summary['by_category'] = array_values($summary['by_category']);
        $summary['by_date'] = array_values($summary['by_date']);

        // Format total amount
        $summary['total_amount'] = number_format($summary['total_amount'], 2, '.', '');

        return $summary;
    }
}

