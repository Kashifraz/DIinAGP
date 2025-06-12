<?php

namespace App\Models;

use CodeIgniter\Model;

class TransactionItemModel extends Model
{
    protected $table            = 'transaction_items';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'transaction_id',
        'product_id',
        'variant_id',
        'quantity',
        'unit_price',
        'discount_amount',
        'tax_amount',
        'line_total',
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = ''; // No updated_at for transaction items

    // Validation
    protected $validationRules = [
        'transaction_id'  => 'required|integer|is_not_unique[transactions.id]',
        'product_id'      => 'required|integer|is_not_unique[products.id]',
        'variant_id'      => 'permit_empty|integer|is_not_unique[product_variants.id]',
        'quantity'        => 'required|integer|greater_than[0]',
        'unit_price'      => 'required|decimal|greater_than_equal_to[0]',
        'discount_amount' => 'permit_empty|decimal|greater_than_equal_to[0]',
        'tax_amount'      => 'permit_empty|decimal|greater_than_equal_to[0]',
        'line_total'      => 'permit_empty|decimal|greater_than_equal_to[0]', // Auto-calculated in beforeInsert
    ];
    protected $validationMessages = [];
    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeInsert   = ['calculateLineTotal'];
    protected $afterInsert    = [];
    protected $beforeUpdate   = ['calculateLineTotal'];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = [];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];

    /**
     * Calculate line total before insert/update
     */
    protected function calculateLineTotal(array $data)
    {
        if (isset($data['data']['quantity']) && isset($data['data']['unit_price'])) {
            $quantity = $data['data']['quantity'];
            $unitPrice = $data['data']['unit_price'];
            $discount = $data['data']['discount_amount'] ?? 0;
            $tax = $data['data']['tax_amount'] ?? 0;
            
            $lineTotal = ($quantity * $unitPrice) + $tax - $discount;
            $data['data']['line_total'] = number_format($lineTotal, 2, '.', '');
        }
        return $data;
    }

    /**
     * Get transaction items with product details
     */
    public function getItemsWithDetails(int $transactionId)
    {
        return $this->builder()
                    ->select('transaction_items.*, products.name as product_name, products.sku, products.barcode, product_variants.variant_name, product_variants.variant_value')
                    ->join('products', 'products.id = transaction_items.product_id', 'left')
                    ->join('product_variants', 'product_variants.id = transaction_items.variant_id', 'left')
                    ->where('transaction_items.transaction_id', $transactionId)
                    ->get()
                    ->getResultArray();
    }
}

