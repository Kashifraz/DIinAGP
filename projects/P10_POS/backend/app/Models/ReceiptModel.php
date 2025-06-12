<?php

namespace App\Models;

use CodeIgniter\Model;

class ReceiptModel extends Model
{
    protected $table            = 'receipts';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'transaction_id',
        'receipt_number',
        'receipt_data',
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = ''; // No updated_at for receipts

    // Validation
    protected $validationRules = [
        'transaction_id'  => 'required|integer|is_not_unique[transactions.id]',
        'receipt_number'   => 'required|max_length[50]|is_unique[receipts.receipt_number,id,{id}]',
        'receipt_data'     => 'permit_empty',
    ];
    protected $validationMessages = [];
    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeInsert   = ['generateReceiptNumber'];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = [];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];

    /**
     * Generate unique receipt number
     */
    protected function generateReceiptNumber(array $data)
    {
        if (empty($data['data']['receipt_number'])) {
            $data['data']['receipt_number'] = $this->generateUniqueReceiptNumber();
        }
        return $data;
    }

    /**
     * Generate unique receipt number
     */
    protected function generateUniqueReceiptNumber(): string
    {
        do {
            // Format: RCP-YYYYMMDD-HHMMSS-XXXX
            $date = date('Ymd');
            $time = date('His');
            $random = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
            $receiptNumber = 'RCP-' . $date . '-' . $time . '-' . $random;
        } while ($this->where('receipt_number', $receiptNumber)->countAllResults() > 0);

        return $receiptNumber;
    }

    /**
     * Get receipt by transaction ID
     */
    public function getReceiptByTransaction(int $transactionId)
    {
        return $this->where('transaction_id', $transactionId)->first();
    }
}

