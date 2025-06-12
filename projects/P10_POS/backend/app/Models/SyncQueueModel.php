<?php

namespace App\Models;

use CodeIgniter\Model;

class SyncQueueModel extends Model
{
    protected $table            = 'sync_queue';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'store_id',
        'user_id',
        'operation_type',
        'entity_type',
        'entity_id',
        'data',
        'status',
        'synced_at',
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = null; // No updated_at field

    // Validation
    protected $validationRules = [
        'store_id'      => 'required|integer|is_not_unique[stores.id]',
        'user_id'       => 'required|integer|is_not_unique[users.id]',
        'operation_type' => 'required|in_list[create,update,delete]',
        'entity_type'   => 'required|max_length[50]',
        'entity_id'     => 'permit_empty|integer',
        'data'          => 'required',
        'status'        => 'required|in_list[pending,syncing,synced,failed]',
    ];

    protected $validationMessages = [];
    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;

    /**
     * Get pending sync items for a store/user
     */
    public function getPendingItems(int $storeId = null, int $userId = null, int $limit = 100)
    {
        $builder = $this->builder();
        $builder->where('status', 'pending');
        
        if ($storeId) {
            $builder->where('store_id', $storeId);
        }
        if ($userId) {
            $builder->where('user_id', $userId);
        }
        
        $builder->orderBy('created_at', 'ASC');
        $builder->limit($limit);
        
        return $builder->get()->getResultArray();
    }

    /**
     * Get sync items by status
     */
    public function getItemsByStatus(string $status, int $storeId = null, int $limit = 100)
    {
        $builder = $this->builder();
        $builder->where('status', $status);
        
        if ($storeId) {
            $builder->where('store_id', $storeId);
        }
        
        $builder->orderBy('created_at', 'ASC');
        $builder->limit($limit);
        
        return $builder->get()->getResultArray();
    }

    /**
     * Mark item as syncing
     */
    public function markAsSyncing(int $id): bool
    {
        return $this->update($id, ['status' => 'syncing']);
    }

    /**
     * Mark item as synced
     */
    public function markAsSynced(int $id): bool
    {
        return $this->update($id, [
            'status' => 'synced',
            'synced_at' => date('Y-m-d H:i:s')
        ]);
    }

    /**
     * Mark item as failed
     */
    public function markAsFailed(int $id, string $errorMessage = null): bool
    {
        $data = ['status' => 'failed'];
        if ($errorMessage) {
            // Store error in sync_logs
            $syncLogModel = new SyncLogModel();
            $syncLogModel->insert([
                'sync_id' => $id,
                'status' => 'failed',
                'error_message' => $errorMessage,
            ]);
        }
        return $this->update($id, $data);
    }

    /**
     * Get sync statistics
     */
    public function getSyncStats(int $storeId = null, int $userId = null)
    {
        $builder = $this->builder();
        
        if ($storeId) {
            $builder->where('store_id', $storeId);
        }
        if ($userId) {
            $builder->where('user_id', $userId);
        }
        
        $total = $builder->countAllResults(false);
        
        $stats = [
            'total' => $total,
            'pending' => 0,
            'syncing' => 0,
            'synced' => 0,
            'failed' => 0,
        ];
        
        foreach (['pending', 'syncing', 'synced', 'failed'] as $status) {
            $statusBuilder = $this->builder();
            if ($storeId) {
                $statusBuilder->where('store_id', $storeId);
            }
            if ($userId) {
                $statusBuilder->where('user_id', $userId);
            }
            $stats[$status] = $statusBuilder->where('status', $status)->countAllResults();
        }
        
        return $stats;
    }
}

