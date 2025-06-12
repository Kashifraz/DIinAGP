<?php

namespace App\Models;

use CodeIgniter\Model;

class ProductCategoryModel extends Model
{
    protected $table            = 'product_categories';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'name',
        'parent_id',
        'description',
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    // Validation
    protected $validationRules = [
        'name'        => 'required|min_length[2]|max_length[255]',
        'parent_id'   => 'permit_empty|integer|is_not_unique[product_categories.id]',
        'description' => 'permit_empty',
    ];

    protected $validationMessages = [
        'name' => [
            'required'   => 'Category name is required',
            'min_length' => 'Category name must be at least 2 characters long',
        ],
    ];

    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;

    /**
     * Get categories with hierarchy
     */
    public function getCategoriesWithHierarchy()
    {
        $categories = $this->findAll();
        return $this->buildHierarchy($categories);
    }

    /**
     * Build category hierarchy
     */
    protected function buildHierarchy(array $categories, $parentId = null)
    {
        $branch = [];
        foreach ($categories as $category) {
            if ($category['parent_id'] == $parentId) {
                $children = $this->buildHierarchy($categories, $category['id']);
                if ($children) {
                    $category['children'] = $children;
                }
                $branch[] = $category;
            }
        }
        return $branch;
    }

    /**
     * Get flat list of categories
     */
    public function getFlatList()
    {
        return $this->orderBy('name', 'ASC')->findAll();
    }

    /**
     * Check if category has children
     */
    public function hasChildren(int $categoryId): bool
    {
        return $this->where('parent_id', $categoryId)->countAllResults() > 0;
    }

    /**
     * Check if category has products
     */
    public function hasProducts(int $categoryId): bool
    {
        $db = \Config\Database::connect();
        return $db->table('products')
            ->where('category_id', $categoryId)
            ->where('deleted_at', null)
            ->countAllResults() > 0;
    }
}

