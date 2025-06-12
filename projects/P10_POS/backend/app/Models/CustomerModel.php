<?php

namespace App\Models;

use CodeIgniter\Model;

class CustomerModel extends Model
{
    protected $table            = 'customers';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = ['name', 'email', 'phone'];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    // Validation
    protected $validationRules = [
        'name'  => 'required|min_length[2]|max_length[255]',
        'email' => 'permit_empty|valid_email|max_length[255]|is_unique[customers.email,id,{id}]',
        'phone' => 'permit_empty|max_length[20]',
    ];
    protected $validationMessages = [
        'name' => [
            'required'   => 'Customer name is required',
            'min_length' => 'Customer name must be at least 2 characters long',
        ],
        'email' => [
            'valid_email' => 'Please provide a valid email address',
            'is_unique'   => 'This email is already registered',
        ],
    ];
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
     * Search customers by name, email, or phone
     */
    public function searchCustomers(string $query, int $limit = 10)
    {
        return $this->builder()
                    ->groupStart()
                        ->like('name', $query)
                        ->orLike('email', $query)
                        ->orLike('phone', $query)
                    ->groupEnd()
                    ->limit($limit)
                    ->get()
                    ->getResultArray();
    }

    /**
     * Find customer by email or phone
     */
    public function findByEmailOrPhone(string $email = null, string $phone = null)
    {
        $builder = $this->builder();
        
        if ($email) {
            $builder->where('email', $email);
        }
        
        if ($phone) {
            if ($email) {
                $builder->orWhere('phone', $phone);
            } else {
                $builder->where('phone', $phone);
            }
        }
        
        return $builder->get()->getRowArray();
    }
}

