<?php

namespace App\Models;

use CodeIgniter\Model;

class InventoryModel extends Model
{
    protected $table            = 'inventory';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'store_id',
        'product_id',
        'variant_id',
        'quantity',
        'reorder_level',
        'last_updated',
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    // Validation
    protected $validationRules = [
        'store_id'     => 'required|integer|is_not_unique[stores.id]',
        'product_id'   => 'required|integer|is_not_unique[products.id]',
        'variant_id'   => 'permit_empty|integer|is_not_unique[product_variants.id]',
        'quantity'     => 'required|integer',
        'reorder_level' => 'permit_empty|integer|greater_than_equal_to[0]',
    ];

    protected $validationMessages = [
        'store_id' => [
            'required'      => 'Store ID is required',
            'is_not_unique' => 'Store does not exist',
        ],
        'product_id' => [
            'required'      => 'Product ID is required',
            'is_not_unique' => 'Product does not exist',
        ],
        'quantity' => [
            'required' => 'Quantity is required',
            'integer'  => 'Quantity must be an integer',
        ],
    ];

    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeUpdate   = ['setLastUpdated'];

    /**
     * Set last_updated timestamp before update
     */
    protected function setLastUpdated(array $data)
    {
        $data['data']['last_updated'] = date('Y-m-d H:i:s');
        return $data;
    }

    /**
     * Get inventory for a store
     */
    public function getStoreInventory(int $storeId, array $filters = [])
    {
        $builder = $this->builder();
        $builder->where('inventory.store_id', $storeId);
        
        if (!empty($filters['product_id'])) {
            $builder->where('inventory.product_id', $filters['product_id']);
        }
        
        if (!empty($filters['low_stock'])) {
            $builder->where('inventory.quantity <=', 'inventory.reorder_level', false);
        }
        
        return $builder;
    }

    /**
     * Get inventory item by store, product, and variant
     */
    public function getInventoryItem(int $storeId, int $productId, ?int $variantId = null)
    {
        $builder = $this->where('store_id', $storeId)
            ->where('product_id', $productId);
        
        if ($variantId !== null) {
            $builder->where('variant_id', $variantId);
        } else {
            $builder->where('variant_id IS NULL');
        }
        
        return $builder->first();
    }

    /**
     * Adjust inventory quantity
     */
    public function adjustQuantity(int $inventoryId, int $quantityChange, string $changeType = 'adjustment', ?string $reason = null, ?int $userId = null): bool
    {
        $inventory = $this->find($inventoryId);
        if (!$inventory) {
            return false;
        }

        $previousQuantity = $inventory['quantity'];
        $newQuantity = $previousQuantity + $quantityChange;

        // Prevent negative quantities (unless explicitly allowed for certain change types)
        if ($newQuantity < 0 && !in_array($changeType, ['sale', 'damage', 'expired'])) {
            return false;
        }

        // Update inventory
        $this->update($inventoryId, ['quantity' => $newQuantity]);

        // Record history
        $historyModel = model('InventoryHistoryModel');
        $historyModel->insert([
            'inventory_id'      => $inventoryId,
            'change_type'        => $changeType,
            'quantity_change'    => $quantityChange,
            'previous_quantity'  => $previousQuantity,
            'new_quantity'       => $newQuantity,
            'reason'             => $reason,
            'user_id'            => $userId,
        ]);

        return true;
    }

    /**
     * Get low stock items for a store
     */
    public function getLowStockItems(int $storeId)
    {
        return $this->where('store_id', $storeId)
            ->where('quantity <= reorder_level')
            ->findAll();
    }

    /**
     * Get inventory with product details
     * Note: This method is kept for backward compatibility but the controller builds the query directly
     */
    public function getInventoryWithDetails(int $storeId, array $filters = [])
    {
        $db = \Config\Database::connect();
        $builder = $db->table('inventory');
        $builder->select('inventory.*, products.name as product_name, products.sku, products.barcode, products.base_price, product_categories.name as category_name')
            ->join('products', 'products.id = inventory.product_id', 'left')
            ->join('product_categories', 'product_categories.id = products.category_id', 'left')
            ->where('inventory.store_id', $storeId);

        if (!empty($filters['product_id'])) {
            $builder->where('inventory.product_id', $filters['product_id']);
        }

        if (!empty($filters['low_stock'])) {
            $builder->where('inventory.quantity <= inventory.reorder_level', null, false);
        }

        if (!empty($filters['search'])) {
            $builder->groupStart()
                ->like('products.name', $filters['search'])
                ->orLike('products.sku', $filters['search'])
                ->orLike('products.barcode', $filters['search'])
                ->groupEnd();
        }

        return $builder;
    }
}

