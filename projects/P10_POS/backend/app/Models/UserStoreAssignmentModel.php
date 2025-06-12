<?php

namespace App\Models;

use CodeIgniter\Model;

class UserStoreAssignmentModel extends Model
{
    protected $table            = 'user_store_assignments';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'user_id',
        'store_id',
        'role',
        'assigned_at',
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    // Validation
    protected $validationRules = [
        'user_id'  => 'required|integer|is_not_unique[users.id]',
        'store_id' => 'required|integer|is_not_unique[stores.id]',
        'role'     => 'required|in_list[manager,cashier]',
    ];

    protected $validationMessages = [
        'user_id' => [
            'required'      => 'User ID is required',
            'is_not_unique' => 'User does not exist',
        ],
        'store_id' => [
            'required'      => 'Store ID is required',
            'is_not_unique' => 'Store does not exist',
        ],
        'role' => [
            'required' => 'Role is required',
            'in_list'  => 'Role must be either manager or cashier',
        ],
    ];

    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeInsert   = ['setAssignedAt'];

    /**
     * Set assigned_at timestamp before insert
     */
    protected function setAssignedAt(array $data)
    {
        if (!isset($data['data']['assigned_at'])) {
            $data['data']['assigned_at'] = date('Y-m-d H:i:s');
        }
        return $data;
    }

    /**
     * Get manager for a store
     */
    public function getManager(int $storeId)
    {
        return $this->where('store_id', $storeId)
            ->where('role', 'manager')
            ->first();
    }

    /**
     * Get cashiers for a store
     */
    public function getCashiers(int $storeId)
    {
        return $this->where('store_id', $storeId)
            ->where('role', 'cashier')
            ->findAll();
    }

    /**
     * Get all team members for a store
     */
    public function getTeam(int $storeId)
    {
        return $this->where('store_id', $storeId)
            ->orderBy('role', 'ASC')
            ->orderBy('assigned_at', 'DESC')
            ->findAll();
    }

    /**
     * Check if store has a manager
     */
    public function hasManager(int $storeId): bool
    {
        return $this->where('store_id', $storeId)
            ->where('role', 'manager')
            ->countAllResults() > 0;
    }

    /**
     * Remove manager from store (before assigning new one)
     */
    public function removeManager(int $storeId)
    {
        return $this->where('store_id', $storeId)
            ->where('role', 'manager')
            ->delete();
    }
}

