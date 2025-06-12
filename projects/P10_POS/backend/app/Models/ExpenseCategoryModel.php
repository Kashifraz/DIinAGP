<?php

namespace App\Models;

use CodeIgniter\Model;

class ExpenseCategoryModel extends Model
{
    protected $table            = 'expense_categories';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'name',
        'description',
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    // Validation
    protected $validationRules = [
        'name'        => 'required|min_length[2]|max_length[255]|is_unique[expense_categories.name,id,{id}]',
        'description' => 'permit_empty',
    ];

    protected $validationMessages = [
        'name' => [
            'required'   => 'Category name is required',
            'min_length' => 'Category name must be at least 2 characters long',
            'is_unique'  => 'Category name already exists',
        ],
    ];

    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;

    /**
     * Check if category has expenses
     */
    public function hasExpenses(int $categoryId): bool
    {
        $db = \Config\Database::connect();
        return $db->table('expenses')
            ->where('category_id', $categoryId)
            ->countAllResults() > 0;
    }
}

