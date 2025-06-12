<?php

namespace App\Models;

use CodeIgniter\Model;

class InventoryHistoryModel extends Model
{
    protected $table            = 'inventory_history';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'inventory_id',
        'change_type',
        'quantity_change',
        'previous_quantity',
        'new_quantity',
        'reason',
        'user_id',
        'created_at', // Allow created_at for manual setting if needed
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = ''; // This table doesn't have updated_at - use empty string, not null

    // Validation
    protected $validationRules = [
        'inventory_id'     => 'required|integer|is_not_unique[inventory.id]',
        'change_type'      => 'required|in_list[sale,purchase,adjustment,transfer_in,transfer_out,return,damage,expired]',
        'quantity_change'  => 'required|integer',
        'previous_quantity' => 'required|integer',
        'new_quantity'     => 'required|integer',
        'reason'           => 'permit_empty|max_length[255]',
        'user_id'          => 'permit_empty|integer|is_not_unique[users.id]',
    ];

    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;

    /**
     * Get history for an inventory item
     */
    public function getInventoryHistory(int $inventoryId, int $limit = 50)
    {
        return $this->where('inventory_id', $inventoryId)
            ->orderBy('created_at', 'DESC')
            ->limit($limit)
            ->findAll();
    }

    /**
     * Get history for a store
     */
    public function getStoreHistory(int $storeId, array $filters = [], int $limit = 100)
    {
        $builder = $this->builder();
        $builder->select('inventory_history.*')
            ->join('inventory', 'inventory.id = inventory_history.inventory_id', 'left')
            ->where('inventory.store_id', $storeId);

        if (!empty($filters['change_type'])) {
            $builder->where('inventory_history.change_type', $filters['change_type']);
        }

        if (!empty($filters['date_from'])) {
            $builder->where('inventory_history.created_at >=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $builder->where('inventory_history.created_at <=', $filters['date_to']);
        }

        return $builder->orderBy('inventory_history.created_at', 'DESC')
            ->limit($limit)
            ->get()
            ->getResultArray();
    }
}

