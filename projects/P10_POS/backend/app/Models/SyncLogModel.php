<?php

namespace App\Models;

use CodeIgniter\Model;

class SyncLogModel extends Model
{
    protected $table            = 'sync_logs';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'sync_id',
        'status',
        'error_message',
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = null; // No updated_at field

    // Validation
    protected $validationRules = [
        'sync_id'       => 'required|integer|is_not_unique[sync_queue.id]',
        'status'        => 'required|in_list[success,failed,warning]',
        'error_message' => 'permit_empty',
    ];

    protected $validationMessages = [];
    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;

    /**
     * Get logs for a sync item
     */
    public function getLogsBySyncId(int $syncId)
    {
        return $this->where('sync_id', $syncId)
                    ->orderBy('created_at', 'DESC')
                    ->findAll();
    }

    /**
     * Get failed sync logs
     */
    public function getFailedLogs(int $limit = 50)
    {
        return $this->where('status', 'failed')
                    ->orderBy('created_at', 'DESC')
                    ->limit($limit)
                    ->findAll();
    }
}

