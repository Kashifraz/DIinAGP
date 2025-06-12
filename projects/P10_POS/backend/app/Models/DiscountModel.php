<?php

namespace App\Models;

use CodeIgniter\Model;

class DiscountModel extends Model
{
    protected $table            = 'discounts';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'name',
        'type',
        'value',
        'product_id',
        'category_id',
        'store_id',
        'min_purchase',
        'valid_from',
        'valid_to',
        'status',
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    // Validation
    protected $validationRules = [
        'name'         => 'required|max_length[255]',
        'type'         => 'required|in_list[percentage,fixed]',
        'value'        => 'required|decimal|greater_than[0]',
        'product_id'   => 'permit_empty|integer|is_not_unique[products.id]',
        'category_id'  => 'permit_empty|integer|is_not_unique[product_categories.id]',
        'store_id'     => 'permit_empty|integer|is_not_unique[stores.id]',
        'min_purchase' => 'permit_empty|decimal|greater_than_equal_to[0]',
        'valid_from'   => 'permit_empty|valid_date',
        'valid_to'     => 'permit_empty|valid_date',
        'status'       => 'required|in_list[active,inactive,expired]',
    ];
    protected $validationMessages = [];
    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeInsert   = [];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = [];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];

    /**
     * Get active discounts for a product
     */
    public function getProductDiscounts(int $productId, int $storeId, float $subtotal = 0): array
    {
        $now = date('Y-m-d H:i:s');
        $productModel = new ProductModel();
        $product = $productModel->find($productId);
        $categoryId = $product && $product['category_id'] ? $product['category_id'] : null;
        
        $builder = $this->builder();
        $builder->where('status', 'active')
                ->groupStart()
                    ->where('valid_from IS NULL')
                    ->orWhere('valid_from <=', $now)
                ->groupEnd()
                ->groupStart()
                    ->where('valid_to IS NULL')
                    ->orWhere('valid_to >=', $now)
                ->groupEnd()
                ->groupStart()
                    ->where('product_id', $productId)
                    ->orGroupStart()
                        ->where('category_id', $categoryId)
                        ->where('category_id IS NOT NULL')
                    ->groupEnd()
                    ->orGroupStart()
                        ->where('product_id IS NULL')
                        ->where('category_id IS NULL')
                        ->where('store_id', $storeId)
                    ->groupEnd()
                ->groupEnd();

        if ($subtotal > 0) {
            $builder->groupStart()
                    ->where('min_purchase IS NULL')
                    ->orWhere('min_purchase <=', $subtotal)
                    ->groupEnd();
        }

        return $builder->orderBy('value', 'DESC')->get()->getResultArray();
    }

    /**
     * Get active discounts for a category
     */
    public function getCategoryDiscounts(int $categoryId, int $storeId, float $subtotal = 0): array
    {
        $now = date('Y-m-d H:i:s');
        
        $builder = $this->builder();
        $builder->where('status', 'active')
                ->groupStart()
                    ->where('valid_from IS NULL')
                    ->orWhere('valid_from <=', $now)
                ->groupEnd()
                ->groupStart()
                    ->where('valid_to IS NULL')
                    ->orWhere('valid_to >=', $now)
                ->groupEnd()
                ->groupStart()
                    ->where('category_id', $categoryId)
                    ->orGroupStart()
                        ->where('product_id IS NULL')
                        ->where('category_id IS NULL')
                        ->where('store_id', $storeId)
                    ->groupEnd()
                ->groupEnd();

        if ($subtotal > 0) {
            $builder->groupStart()
                    ->where('min_purchase IS NULL')
                    ->orWhere('min_purchase <=', $subtotal)
                    ->groupEnd();
        }

        return $builder->orderBy('value', 'DESC')->get()->getResultArray();
    }

    /**
     * Get active store-wide discounts
     */
    public function getStoreDiscounts(int $storeId, float $subtotal = 0): array
    {
        $now = date('Y-m-d H:i:s');
        
        $builder = $this->builder();
        $builder->where('status', 'active')
                ->where('product_id IS NULL')
                ->where('category_id IS NULL')
                ->where('store_id', $storeId)
                ->groupStart()
                    ->where('valid_from IS NULL')
                    ->orWhere('valid_from <=', $now)
                ->groupEnd()
                ->groupStart()
                    ->where('valid_to IS NULL')
                    ->orWhere('valid_to >=', $now)
                ->groupEnd();

        if ($subtotal > 0) {
            $builder->groupStart()
                    ->where('min_purchase IS NULL')
                    ->orWhere('min_purchase <=', $subtotal)
                    ->groupEnd();
        }

        return $builder->orderBy('value', 'DESC')->get()->getResultArray();
    }

    /**
     * Calculate discount amount
     */
    public function calculateDiscountAmount(array $discount, float $amount): float
    {
        if ($discount['type'] === 'percentage') {
            return ($amount * $discount['value']) / 100;
        } else {
            // Fixed amount - return the discount value, but not more than the amount
            return min($discount['value'], $amount);
        }
    }

    /**
     * Get best applicable discount for a product
     * Priority: Product > Category > Store-wide
     */
    public function getBestDiscount(int $productId, int $storeId, float $subtotal = 0): ?array
    {
        $productModel = new ProductModel();
        $product = $productModel->find($productId);
        
        if (!$product) {
            return null;
        }

        $now = date('Y-m-d H:i:s');
        
        // Try product-level discount first
        $productDiscounts = $this->where('status', 'active')
            ->where('product_id', $productId)
            ->groupStart()
                ->where('valid_from IS NULL')
                ->orWhere('valid_from <=', $now)
            ->groupEnd()
            ->groupStart()
                ->where('valid_to IS NULL')
                ->orWhere('valid_to >=', $now)
            ->groupEnd()
            ->groupStart()
                ->where('min_purchase IS NULL')
                ->orWhere('min_purchase <=', $subtotal)
            ->groupEnd()
            ->orderBy('value', 'DESC')
            ->findAll();

        if (!empty($productDiscounts)) {
            return $productDiscounts[0];
        }

        // Try category-level discount
        if ($product['category_id']) {
            $categoryDiscounts = $this->where('status', 'active')
                ->where('category_id', $product['category_id'])
                ->groupStart()
                    ->where('valid_from IS NULL')
                    ->orWhere('valid_from <=', $now)
                ->groupEnd()
                ->groupStart()
                    ->where('valid_to IS NULL')
                    ->orWhere('valid_to >=', $now)
                ->groupEnd()
                ->groupStart()
                    ->where('min_purchase IS NULL')
                    ->orWhere('min_purchase <=', $subtotal)
                ->groupEnd()
                ->orderBy('value', 'DESC')
                ->findAll();

            if (!empty($categoryDiscounts)) {
                return $categoryDiscounts[0];
            }
        }

        // Try store-wide discount
        $storeDiscounts = $this->where('status', 'active')
            ->where('product_id IS NULL')
            ->where('category_id IS NULL')
            ->where('store_id', $storeId)
            ->groupStart()
                ->where('valid_from IS NULL')
                ->orWhere('valid_from <=', $now)
            ->groupEnd()
            ->groupStart()
                ->where('valid_to IS NULL')
                ->orWhere('valid_to >=', $now)
            ->groupEnd()
            ->groupStart()
                ->where('min_purchase IS NULL')
                ->orWhere('min_purchase <=', $subtotal)
            ->groupEnd()
            ->orderBy('value', 'DESC')
            ->findAll();

        if (!empty($storeDiscounts)) {
            return $storeDiscounts[0];
        }

        return null;
    }

    /**
     * Validate discount eligibility
     */
    public function isEligible(array $discount, float $subtotal = 0): bool
    {
        $now = date('Y-m-d H:i:s');

        // Check status
        if ($discount['status'] !== 'active') {
            return false;
        }

        // Check date range
        if ($discount['valid_from'] && $discount['valid_from'] > $now) {
            return false;
        }

        if ($discount['valid_to'] && $discount['valid_to'] < $now) {
            return false;
        }

        // Check minimum purchase
        if ($discount['min_purchase'] && $subtotal < $discount['min_purchase']) {
            return false;
        }

        return true;
    }
}

