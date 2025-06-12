<?php

namespace App\Models;

use CodeIgniter\Model;

class ProductModel extends Model
{
    protected $table            = 'products';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = true;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'name',
        'description',
        'sku',
        'barcode',
        'base_price',
        'category_id',
        'image_url',
        'status',
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    // Validation
    protected $validationRules = [
        'name'        => 'required|min_length[3]|max_length[255]',
        'description' => 'permit_empty',
        'sku'         => 'permit_empty|max_length[100]|is_unique[products.sku,id,{id}]',
        'barcode'     => 'permit_empty|max_length[100]|is_unique[products.barcode,id,{id}]',
        'base_price'  => 'required|decimal|greater_than_equal_to[0]',
        'category_id' => 'permit_empty|integer|is_not_unique[product_categories.id]',
        'image_url'   => 'permit_empty|max_length[500]',
        'status'      => 'required|in_list[active,inactive]',
    ];

    protected $validationMessages = [
        'name' => [
            'required'   => 'Product name is required',
            'min_length' => 'Product name must be at least 3 characters long',
        ],
        'base_price' => [
            'required' => 'Base price is required',
            'decimal'  => 'Base price must be a valid decimal number',
        ],
        'status' => [
            'required' => 'Status is required',
            'in_list'  => 'Status must be either active or inactive',
        ],
    ];

    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeInsert   = ['generateBarcode', 'generateSku'];
    protected $beforeUpdate   = ['generateBarcodeIfEmpty', 'generateSkuIfEmpty'];

    /**
     * Generate barcode before insert
     */
    protected function generateBarcode(array $data)
    {
        if (empty($data['data']['barcode'])) {
            $data['data']['barcode'] = $this->generateUniqueBarcode();
        }
        return $data;
    }

    /**
     * Generate barcode before update if empty
     */
    protected function generateBarcodeIfEmpty(array $data)
    {
        if (isset($data['data']['barcode']) && empty($data['data']['barcode'])) {
            $data['data']['barcode'] = $this->generateUniqueBarcode();
        }
        return $data;
    }

    /**
     * Generate SKU before insert
     */
    protected function generateSku(array $data)
    {
        if (empty($data['data']['sku'])) {
            $data['data']['sku'] = $this->generateUniqueSku($data['data']['name'] ?? '');
        }
        return $data;
    }

    /**
     * Generate SKU before update if empty
     */
    protected function generateSkuIfEmpty(array $data)
    {
        if (isset($data['data']['sku']) && empty($data['data']['sku'])) {
            $product = $this->find($data['id'][0] ?? null);
            $name = $data['data']['name'] ?? $product['name'] ?? '';
            $data['data']['sku'] = $this->generateUniqueSku($name);
        }
        return $data;
    }

    /**
     * Generate unique barcode
     */
    protected function generateUniqueBarcode(): string
    {
        do {
            $barcode = 'BC' . str_pad(rand(1000000, 9999999), 7, '0', STR_PAD_LEFT);
        } while ($this->where('barcode', $barcode)->countAllResults() > 0);

        return $barcode;
    }

    /**
     * Generate unique SKU from product name
     */
    protected function generateUniqueSku(string $name): string
    {
        // Generate SKU from name (first 3 letters + numbers)
        $prefix = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $name), 0, 3));
        if (empty($prefix)) {
            $prefix = 'PRD';
        }

        $counter = 1;
        do {
            $sku = $prefix . str_pad($counter, 5, '0', STR_PAD_LEFT);
            $counter++;
        } while ($this->where('sku', $sku)->countAllResults() > 0 && $counter < 99999);

        return $sku;
    }

    /**
     * Get products with category and variants
     */
    public function getProductWithDetails(int $productId)
    {
        $product = $this->find($productId);
        if (!$product) {
            return null;
        }

        // Load category
        if ($product['category_id']) {
            $categoryModel = model('ProductCategoryModel');
            $product['category'] = $categoryModel->find($product['category_id']);
        }

        // Load variants
        $variantModel = model('ProductVariantModel');
        $product['variants'] = $variantModel->where('product_id', $productId)->findAll();

        return $product;
    }

    /**
     * Search products by name, SKU, or barcode
     */
    public function searchProducts(string $query, int $limit = 20)
    {
        return $this->groupStart()
            ->like('name', $query)
            ->orLike('sku', $query)
            ->orLike('barcode', $query)
            ->groupEnd()
            ->where('status', 'active')
            ->limit($limit)
            ->findAll();
    }

    /**
     * Get products with filters
     */
    public function getProductsWithFilters(array $filters = [])
    {
        $builder = $this->builder();

        if (!empty($filters['category_id'])) {
            $builder->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['status'])) {
            $builder->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $builder->groupStart()
                ->like('name', $filters['search'])
                ->orLike('sku', $filters['search'])
                ->orLike('barcode', $filters['search'])
                ->orLike('description', $filters['search'])
                ->groupEnd();
        }

        return $builder;
    }
}

