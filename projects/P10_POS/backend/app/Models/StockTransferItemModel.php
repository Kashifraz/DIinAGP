<?php

namespace App\Models;

use CodeIgniter\Model;

class StockTransferItemModel extends Model
{
    protected $table            = 'stock_transfer_items';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'transfer_id',
        'product_id',
        'variant_id',
        'quantity',
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = ''; // No updated_at field

    // Validation
    protected $validationRules = [
        'transfer_id' => 'required|integer|is_not_unique[stock_transfers.id]',
        'product_id'  => 'required|integer|is_not_unique[products.id]',
        'variant_id'  => 'permit_empty|integer|is_not_unique[product_variants.id]',
        'quantity'    => 'required|integer|greater_than[0]',
    ];

    protected $validationMessages = [
        'transfer_id' => [
            'required'      => 'Transfer ID is required',
            'is_not_unique' => 'Invalid transfer selected',
        ],
        'product_id' => [
            'required'      => 'Product is required',
            'is_not_unique' => 'Invalid product selected',
        ],
        'quantity' => [
            'required'    => 'Quantity is required',
            'greater_than' => 'Quantity must be greater than 0',
        ],
    ];

    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;

    /**
     * Get items by transfer ID with product details
     */
    public function getItemsByTransferId(int $transferId)
    {
        $items = $this->where('transfer_id', $transferId)->findAll();
        
        if (empty($items)) {
            return [];
        }

        $productModel = new ProductModel();
        $productVariantModel = new ProductVariantModel();

        foreach ($items as &$item) {
            // Load product
            $item['product'] = $productModel->find($item['product_id']);
            
            // Load variant if exists
            if ($item['variant_id']) {
                $item['variant'] = $productVariantModel->find($item['variant_id']);
            } else {
                $item['variant'] = null;
            }
        }

        return $items;
    }

    /**
     * Get items by transfer ID (simple, without relations)
     */
    public function getItemsByTransferIdSimple(int $transferId)
    {
        return $this->where('transfer_id', $transferId)->findAll();
    }

    /**
     * Delete all items for a transfer
     */
    public function deleteByTransferId(int $transferId): bool
    {
        return $this->where('transfer_id', $transferId)->delete();
    }
}

