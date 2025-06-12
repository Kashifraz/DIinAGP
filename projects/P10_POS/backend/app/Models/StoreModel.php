<?php

namespace App\Models;

use CodeIgniter\Model;

class StoreModel extends Model
{
    protected $table            = 'stores';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = true;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'name',
        'address',
        'phone',
        'email',
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
        'name'   => 'required|min_length[3]|max_length[255]',
        'address' => 'permit_empty',
        'phone'  => 'permit_empty|max_length[20]',
        'email'  => 'permit_empty|valid_email|max_length[255]',
        'status' => 'required|in_list[active,inactive]',
    ];

    protected $validationMessages = [
        'name' => [
            'required'   => 'Store name is required',
            'min_length' => 'Store name must be at least 3 characters long',
        ],
        'email' => [
            'valid_email' => 'Please provide a valid email address',
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
    protected $beforeInsert   = [];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = [];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];

    /**
     * Get stores accessible by user
     * Admin can see all stores
     * Manager/Cashier can only see assigned stores
     */
    public function getAccessibleStores(int $userId, string $userRole)
    {
        if ($userRole === 'admin') {
            return $this->findAll();
        }

        // For manager/cashier, get stores through assignments
        $db = \Config\Database::connect();
        return $db->table('user_store_assignments')
            ->select('stores.*')
            ->join('stores', 'stores.id = user_store_assignments.store_id')
            ->where('user_store_assignments.user_id', $userId)
            ->where('stores.deleted_at', null)
            ->get()
            ->getResultArray();
    }

    /**
     * Check if user has access to store
     */
    public function hasAccess(int $storeId, int $userId, string $userRole): bool
    {
        if ($userRole === 'admin') {
            return true;
        }

        $db = \Config\Database::connect();
        $assignment = $db->table('user_store_assignments')
            ->where('store_id', $storeId)
            ->where('user_id', $userId)
            ->get()
            ->getRowArray();

        return $assignment !== null;
    }

    /**
     * Get store with team members
     */
    public function getStoreWithTeam(int $storeId)
    {
        $store = $this->find($storeId);
        if (!$store) {
            return null;
        }

        $db = \Config\Database::connect();
        $team = $db->table('user_store_assignments')
            ->select('user_store_assignments.*, users.name, users.email, users.phone')
            ->join('users', 'users.id = user_store_assignments.user_id')
            ->where('user_store_assignments.store_id', $storeId)
            ->get()
            ->getResultArray();

        $store['team'] = $team;
        return $store;
    }
}

