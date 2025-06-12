<?php

namespace App\Models;

use CodeIgniter\Model;

class TransactionDiscountModel extends Model
{
    protected $table            = 'transaction_discounts';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'transaction_id',
        'discount_id',
        'applied_amount',
    ];

    // Dates - manually handle created_at since we don't have updated_at
    protected $useTimestamps = false;

    // Validation
    protected $validationRules = [
        'transaction_id' => 'required|integer|is_not_unique[transactions.id]',
        'discount_id'    => 'permit_empty|if_exist|integer|is_not_unique[discounts.id]',
        'applied_amount' => 'required|decimal|greater_than_equal_to[0]',
    ];
    protected $validationMessages = [];
    protected $skipValidation       = false;
    protected $cleanValidationRules = true;
}

