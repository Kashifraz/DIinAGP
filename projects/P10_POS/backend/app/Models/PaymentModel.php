<?php

namespace App\Models;

use CodeIgniter\Model;

class PaymentModel extends Model
{
    protected $table            = 'payments';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'transaction_id',
        'payment_method',
        'amount',
        'change_amount',
        'status',
        'reference_number',
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = ''; // No updated_at for payments

    // Validation
    protected $validationRules = [
        'transaction_id'    => 'required|integer|is_not_unique[transactions.id]',
        'payment_method'   => 'required|in_list[cash,card,mobile_payment,bank_transfer,other]',
        'amount'           => 'required|decimal|greater_than[0]',
        'change_amount'    => 'permit_empty|decimal|greater_than_equal_to[0]',
        'status'           => 'required|in_list[pending,completed,failed,refunded]',
        'reference_number' => 'permit_empty|max_length[100]',
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
     * Get total payment amount for a transaction
     */
    public function getTotalPayment(int $transactionId): float
    {
        $result = $this->builder()
                       ->selectSum('amount')
                       ->where('transaction_id', $transactionId)
                       ->where('status', 'completed')
                       ->get()
                       ->getRowArray();
        
        return (float) ($result['amount'] ?? 0);
    }

    /**
     * Check if transaction is fully paid
     */
    public function isTransactionPaid(int $transactionId, float $totalAmount): bool
    {
        $totalPaid = $this->getTotalPayment($transactionId);
        return $totalPaid >= $totalAmount;
    }
}

