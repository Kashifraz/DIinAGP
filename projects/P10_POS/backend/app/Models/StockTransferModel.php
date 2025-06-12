<?php

namespace App\Models;

use CodeIgniter\Model;

class StockTransferModel extends Model
{
    protected $table            = 'stock_transfers';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'from_store_id',
        'to_store_id',
        'status',
        'requested_by',
        'approved_by',
        'requested_at',
        'completed_at',
        'notes',
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    // Validation
    protected $validationRules = [
        'from_store_id' => 'required|integer|is_not_unique[stores.id]',
        'to_store_id'   => 'required|integer|is_not_unique[stores.id]|differs[from_store_id]',
        'status'        => 'required|in_list[pending,approved,in_transit,completed,cancelled]',
        'requested_by'  => 'required|integer|is_not_unique[users.id]',
        'approved_by'   => 'permit_empty|integer|is_not_unique[users.id]',
        'requested_at'  => 'required|valid_date',
        'completed_at'  => 'permit_empty|valid_date',
        'notes'         => 'permit_empty',
    ];

    protected $validationMessages = [
        'from_store_id' => [
            'required'      => 'Source store is required',
            'is_not_unique' => 'Invalid source store selected',
        ],
        'to_store_id' => [
            'required'      => 'Destination store is required',
            'is_not_unique' => 'Invalid destination store selected',
            'differs'       => 'Source and destination stores must be different',
        ],
        'status' => [
            'required' => 'Status is required',
            'in_list'  => 'Invalid status value',
        ],
        'requested_by' => [
            'required'      => 'Requested by user is required',
            'is_not_unique' => 'Invalid user selected',
        ],
    ];

    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeInsert   = ['setRequestedAt'];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = [];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];

    /**
     * Set requested_at if not provided
     */
    protected function setRequestedAt(array $data)
    {
        if (empty($data['data']['requested_at'])) {
            $data['data']['requested_at'] = date('Y-m-d H:i:s');
        }
        return $data;
    }

    /**
     * Get transfer with all related data
     */
    public function getTransferWithRelations(int $transferId)
    {
        $transfer = $this->find($transferId);
        
        if (!$transfer) {
            return null;
        }

        // Load from store
        $storeModel = new StoreModel();
        $transfer['from_store'] = $storeModel->find($transfer['from_store_id']);
        $transfer['to_store'] = $storeModel->find($transfer['to_store_id']);

        // Load requested by user
        $userModel = new UserModel();
        $transfer['requested_by_user'] = $userModel->find($transfer['requested_by']);
        
        // Load approved by user if exists
        if ($transfer['approved_by']) {
            $transfer['approved_by_user'] = $userModel->find($transfer['approved_by']);
        }

        // Load transfer items
        $transferItemModel = new StockTransferItemModel();
        $transfer['items'] = $transferItemModel->getItemsByTransferId($transferId);

        return $transfer;
    }

    /**
     * Get transfers by store with filters
     */
    public function getTransfersByStore(int $storeId, array $filters = [], int $page = 1, int $perPage = 10)
    {
        $builder = $this->builder();
        $builder->groupStart()
                ->where('from_store_id', $storeId)
                ->orWhere('to_store_id', $storeId)
                ->groupEnd();

        // Status filter
        if (isset($filters['status']) && !empty($filters['status'])) {
            $builder->where('status', $filters['status']);
        }

        // Date range filter
        if (isset($filters['start_date']) && !empty($filters['start_date'])) {
            $builder->where('requested_at >=', $filters['start_date']);
        }
        if (isset($filters['end_date']) && !empty($filters['end_date'])) {
            $builder->where('requested_at <=', $filters['end_date']);
        }

        // Order by requested_at descending
        $builder->orderBy('requested_at', 'DESC');
        $builder->orderBy('created_at', 'DESC');

        $total = $builder->countAllResults(false);
        $transfers = $builder->limit($perPage, ($page - 1) * $perPage)
                             ->get()
                             ->getResultArray();

        return ['data' => $transfers, 'total' => $total];
    }

    /**
     * Get all transfers with filters (for Admin)
     */
    public function getAllTransfers(array $filters = [], int $page = 1, int $perPage = 10)
    {
        $builder = $this->builder();

        // Status filter
        if (isset($filters['status']) && !empty($filters['status'])) {
            $builder->where('status', $filters['status']);
        }

        // Store filter
        if (isset($filters['store_id']) && !empty($filters['store_id'])) {
            $builder->groupStart()
                    ->where('from_store_id', $filters['store_id'])
                    ->orWhere('to_store_id', $filters['store_id'])
                    ->groupEnd();
        }

        // Date range filter
        if (isset($filters['start_date']) && !empty($filters['start_date'])) {
            $builder->where('requested_at >=', $filters['start_date']);
        }
        if (isset($filters['end_date']) && !empty($filters['end_date'])) {
            $builder->where('requested_at <=', $filters['end_date']);
        }

        // Order by requested_at descending
        $builder->orderBy('requested_at', 'DESC');
        $builder->orderBy('created_at', 'DESC');

        $total = $builder->countAllResults(false);
        $transfers = $builder->limit($perPage, ($page - 1) * $perPage)
                             ->get()
                             ->getResultArray();

        return ['data' => $transfers, 'total' => $total];
    }

    /**
     * Update transfer status
     */
    public function updateStatus(int $transferId, string $status, int $userId = null): bool
    {
        $data = ['status' => $status];
        
        if ($status === 'approved' && $userId) {
            $data['approved_by'] = $userId;
        }
        
        if ($status === 'completed') {
            $data['completed_at'] = date('Y-m-d H:i:s');
        }

        return $this->update($transferId, $data);
    }

    /**
     * Check if transfer can be approved
     */
    public function canApprove(int $transferId): bool
    {
        $transfer = $this->find($transferId);
        return $transfer && $transfer['status'] === 'pending';
    }

    /**
     * Check if transfer can be completed
     */
    public function canComplete(int $transferId): bool
    {
        $transfer = $this->find($transferId);
        return $transfer && in_array($transfer['status'], ['approved', 'in_transit']);
    }

    /**
     * Check if transfer can be cancelled
     */
    public function canCancel(int $transferId): bool
    {
        $transfer = $this->find($transferId);
        return $transfer && in_array($transfer['status'], ['pending', 'approved', 'in_transit']);
    }
}

