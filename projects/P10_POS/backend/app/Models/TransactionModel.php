<?php

namespace App\Models;

use CodeIgniter\Model;

class TransactionModel extends Model
{
    protected $table            = 'transactions';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'store_id',
        'cashier_id',
        'customer_id',
        'transaction_number',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'status',
        'notes',
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    // Validation
    protected $validationRules = [
        'store_id'           => 'required|integer|is_not_unique[stores.id]',
        'cashier_id'        => 'required|integer|is_not_unique[users.id]',
        'customer_id'       => 'permit_empty|integer|is_not_unique[customers.id]',
        'transaction_number' => 'permit_empty|max_length[50]|is_unique[transactions.transaction_number,id,{id}]',
        'subtotal'          => 'required|decimal|greater_than_equal_to[0]',
        'tax_amount'        => 'permit_empty|decimal|greater_than_equal_to[0]',
        'discount_amount'   => 'permit_empty|decimal|greater_than_equal_to[0]',
        'total_amount'      => 'required|decimal|greater_than_equal_to[0]',
        'status'            => 'required|in_list[pending,completed,voided,cancelled]',
        'notes'             => 'permit_empty',
    ];
    protected $validationMessages = [];
    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeInsert   = ['generateTransactionNumber'];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = [];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];

    /**
     * Generate unique transaction number
     */
    protected function generateTransactionNumber(array $data)
    {
        if (empty($data['data']['transaction_number'])) {
            $data['data']['transaction_number'] = $this->generateUniqueTransactionNumber();
        }
        return $data;
    }

    /**
     * Generate unique transaction number
     */
    protected function generateUniqueTransactionNumber(): string
    {
        do {
            // Format: TXN-YYYYMMDD-HHMMSS-XXXX
            $date = date('Ymd');
            $time = date('His');
            $random = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
            $transactionNumber = 'TXN-' . $date . '-' . $time . '-' . $random;
        } while ($this->where('transaction_number', $transactionNumber)->countAllResults() > 0);

        return $transactionNumber;
    }

    /**
     * Get transaction with all related data
     */
    public function getTransactionWithDetails(int $transactionId)
    {
        $transaction = $this->find($transactionId);
        
        if (!$transaction) {
            return null;
        }

        // Load items
        $transactionItemModel = new TransactionItemModel();
        $transaction['items'] = $transactionItemModel->where('transaction_id', $transactionId)->findAll();

        // Load customer
        if ($transaction['customer_id']) {
            $customerModel = new CustomerModel();
            $transaction['customer'] = $customerModel->find($transaction['customer_id']);
        }

        // Load payments
        $paymentModel = new PaymentModel();
        $transaction['payments'] = $paymentModel->where('transaction_id', $transactionId)->findAll();

        // Load transaction discounts
        $transactionDiscountModel = new TransactionDiscountModel();
        $transactionDiscounts = $transactionDiscountModel->where('transaction_id', $transactionId)->findAll();
        $discountModel = new DiscountModel();
        foreach ($transactionDiscounts as &$td) {
            if ($td['discount_id']) {
                $td['discount'] = $discountModel->find($td['discount_id']);
            }
        }
        $transaction['transaction_discounts'] = $transactionDiscounts;

        // Load cashier
        $userModel = new UserModel();
        $transaction['cashier'] = $userModel->find($transaction['cashier_id']);

        // Load store
        $storeModel = new StoreModel();
        $transaction['store'] = $storeModel->find($transaction['store_id']);

        return $transaction;
    }

    /**
     * Alias for getTransactionWithDetails (for consistency)
     */
    public function getTransactionWithRelations(int $transactionId)
    {
        return $this->getTransactionWithDetails($transactionId);
    }

    /**
     * Get transactions with filters
     */
    public function getTransactionsWithFilters(array $filters = [], int $page = 1, int $perPage = 10)
    {
        $builder = $this->builder();

        if (isset($filters['store_id']) && $filters['store_id']) {
            $builder->where('store_id', $filters['store_id']);
        }
        if (isset($filters['cashier_id']) && $filters['cashier_id']) {
            $builder->where('cashier_id', $filters['cashier_id']);
        }
        if (isset($filters['customer_id']) && $filters['customer_id']) {
            $builder->where('customer_id', $filters['customer_id']);
        }
        if (isset($filters['status']) && $filters['status']) {
            $builder->where('status', $filters['status']);
        }
        if (isset($filters['transaction_number']) && $filters['transaction_number']) {
            $builder->like('transaction_number', $filters['transaction_number']);
        }
        if (isset($filters['date_from']) && $filters['date_from']) {
            $builder->where('created_at >=', $filters['date_from']);
        }
        if (isset($filters['date_to']) && $filters['date_to']) {
            $builder->where('created_at <=', $filters['date_to'] . ' 23:59:59');
        }

        return $builder;
    }

    /**
     * Calculate totals for a transaction
     */
    public function calculateTotals(int $transactionId): array
    {
        $transactionItemModel = new TransactionItemModel();
        $transactionDiscountModel = new TransactionDiscountModel();
        
        $items = $transactionItemModel->where('transaction_id', $transactionId)->findAll();
        $transactionDiscounts = $transactionDiscountModel->where('transaction_id', $transactionId)->findAll();

        $subtotal = 0;
        $totalTax = 0;
        $totalDiscount = 0;

        // Calculate from items
        foreach ($items as $item) {
            $subtotal += ($item['unit_price'] * $item['quantity']);
            $totalTax += $item['tax_amount'];
            $totalDiscount += $item['discount_amount'];
        }

        // Add transaction-level discounts
        foreach ($transactionDiscounts as $discount) {
            $totalDiscount += $discount['applied_amount'];
        }

        $totalAmount = $subtotal + $totalTax - $totalDiscount;

        return [
            'subtotal'       => number_format($subtotal, 2, '.', ''),
            'tax_amount'     => number_format($totalTax, 2, '.', ''),
            'discount_amount' => number_format($totalDiscount, 2, '.', ''),
            'total_amount'   => number_format($totalAmount, 2, '.', ''),
        ];
    }
}

