<?php

namespace App\Models;

use CodeIgniter\Model;

class ProductVariantModel extends Model
{
    protected $table            = 'product_variants';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'product_id',
        'variant_name',
        'variant_value',
        'price_adjustment',
        'sku_suffix',
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    // Validation
    protected $validationRules = [
        'product_id'      => 'required|integer|is_not_unique[products.id]',
        'variant_name'    => 'required|max_length[100]',
        'variant_value'   => 'required|max_length[100]',
        'price_adjustment' => 'permit_empty|decimal',
        'sku_suffix'      => 'permit_empty|max_length[50]',
    ];

    protected $validationMessages = [
        'product_id' => [
            'required'      => 'Product ID is required',
            'is_not_unique' => 'Product does not exist',
        ],
        'variant_name' => [
            'required' => 'Variant name is required',
        ],
        'variant_value' => [
            'required' => 'Variant value is required',
        ],
    ];

    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;

    /**
     * Get variants for a product
     */
    public function getProductVariants(int $productId)
    {
        return $this->where('product_id', $productId)->findAll();
    }

    /**
     * Get variant by product and variant details
     */
    public function getVariantByDetails(int $productId, string $variantName, string $variantValue)
    {
        return $this->where('product_id', $productId)
            ->where('variant_name', $variantName)
            ->where('variant_value', $variantValue)
            ->first();
    }
}

