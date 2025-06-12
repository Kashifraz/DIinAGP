<?php

namespace App\Controllers\Api;

use App\Models\StockTransferModel;
use App\Models\StockTransferItemModel;
use App\Models\StoreModel;
use App\Models\InventoryModel;
use CodeIgniter\HTTP\ResponseInterface;

class StockTransferController extends BaseApiController
{
    protected $transferModel;
    protected $transferItemModel;
    protected $storeModel;
    protected $inventoryModel;

    public function __construct()
    {
        $this->transferModel = new StockTransferModel();
        $this->transferItemModel = new StockTransferItemModel();
        $this->storeModel = new StoreModel();
        $this->inventoryModel = new InventoryModel();
    }

    /**
     * List stock transfers
     * GET /api/transfers
     * Filtered by store (Manager sees only their store, Admin sees all)
     */
    public function index()
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            // Only Manager and Admin can view transfers
            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only managers and admins can view stock transfers');
            }

            $page = (int) ($this->request->getGet('page') ?? 1);
            $perPage = (int) ($this->request->getGet('per_page') ?? 10);
            $storeId = $this->request->getGet('store_id');
            $status = $this->request->getGet('status');
            $startDate = $this->request->getGet('start_date');
            $endDate = $this->request->getGet('end_date');

            $filters = [];
            if ($status) {
                $filters['status'] = $status;
            }
            if ($startDate) {
                $filters['start_date'] = $startDate;
            }
            if ($endDate) {
                $filters['end_date'] = $endDate;
            }

            // If manager, restrict to their assigned stores
            if ($userRole === 'manager') {
                $accessibleStores = $this->storeModel->getAccessibleStores($userId, $userRole);
                $accessibleStoreIds = array_column($accessibleStores, 'id');
                
                if (empty($accessibleStoreIds)) {
                    return $this->success(['data' => [], 'pagination' => [
                        'current_page' => $page,
                        'per_page' => $perPage,
                        'total' => 0,
                        'last_page' => 1,
                    ]], 'No transfers found');
                }

                // If store_id is provided, verify access
                if ($storeId && !in_array((int)$storeId, $accessibleStoreIds)) {
                    return $this->forbidden('You do not have access to this store');
                }

                // Get transfers for accessible stores
                $result = $this->transferModel->getTransfersByStore(
                    $storeId ? (int)$storeId : $accessibleStoreIds[0],
                    $filters,
                    $page,
                    $perPage
                );

                // Filter to only show transfers involving accessible stores
                if (!$storeId) {
                    $filteredData = [];
                    foreach ($result['data'] as $transfer) {
                        if (in_array($transfer['from_store_id'], $accessibleStoreIds) || 
                            in_array($transfer['to_store_id'], $accessibleStoreIds)) {
                            $filteredData[] = $transfer;
                        }
                    }
                    $result['data'] = $filteredData;
                    $result['total'] = count($filteredData);
                }
            } else {
                // Admin can see all stores
                if ($storeId) {
                    $filters['store_id'] = (int)$storeId;
                }
                $result = $this->transferModel->getAllTransfers($filters, $page, $perPage);
            }

            // Load related data for each transfer
            foreach ($result['data'] as &$transfer) {
                $transfer = $this->transferModel->getTransferWithRelations($transfer['id']);
            }

            return $this->success([
                'data' => $result['data'],
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => $result['total'],
                    'last_page' => $perPage > 0 ? (int) ceil($result['total'] / $perPage) : 1,
                ],
            ], 'Stock transfers retrieved successfully');

        } catch (\Exception $e) {
            log_message('error', '[StockTransferController::index] Error: ' . $e->getMessage());
            return $this->error('An error occurred while retrieving stock transfers: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get transfer by ID
     * GET /api/transfers/:id
     */
    public function show($id = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only managers and admins can view stock transfers');
            }

            $transfer = $this->transferModel->getTransferWithRelations($id);

            if (!$transfer) {
                return $this->notFound('Stock transfer not found');
            }

            // Check store access
            if ($userRole === 'manager') {
                $accessibleStores = $this->storeModel->getAccessibleStores($userId, $userRole);
                $accessibleStoreIds = array_column($accessibleStores, 'id');
                
                if (!in_array($transfer['from_store_id'], $accessibleStoreIds) && 
                    !in_array($transfer['to_store_id'], $accessibleStoreIds)) {
                    return $this->forbidden('You do not have access to this transfer');
                }
            }

            return $this->success($transfer, 'Stock transfer retrieved successfully');

        } catch (\Exception $e) {
            log_message('error', '[StockTransferController::show] Error: ' . $e->getMessage());
            return $this->error('An error occurred while retrieving stock transfer: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Create stock transfer
     * POST /api/transfers
     * Manager only
     */
    public function create()
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only managers and admins can create stock transfers');
            }

            // Get JSON data, handle both JSON and form data
            $json = null;
            try {
                $json = $this->request->getJSON(true);
            } catch (\Exception $e) {
                // If JSON parsing fails, try to get from raw input
                $rawInput = $this->request->getBody();
                if (!empty($rawInput)) {
                    $json = json_decode($rawInput, true);
                }
            }
            
            if ($json === null || !is_array($json)) {
                $json = [];
            }
            
            $fromStoreId = $json['from_store_id'] ?? $this->request->getPost('from_store_id');
            $toStoreId = $json['to_store_id'] ?? $this->request->getPost('to_store_id');
            $items = $json['items'] ?? $this->request->getPost('items') ?? [];
            $notes = $json['notes'] ?? $this->request->getPost('notes');
            
            // Handle items if it's a JSON string
            if (is_string($items)) {
                $items = json_decode($items, true) ?? [];
            }

            if (!$fromStoreId || !$toStoreId) {
                return $this->error('Source and destination stores are required', null, 400);
            }

            if ($fromStoreId == $toStoreId) {
                return $this->error('Source and destination stores must be different', null, 400);
            }

            if (empty($items) || !is_array($items)) {
                return $this->error('At least one item is required', null, 400);
            }

            // Validate store access for managers
            if ($userRole === 'manager') {
                if (!$this->storeModel->hasAccess($fromStoreId, $userId, $userRole)) {
                    return $this->forbidden('You do not have access to the source store');
                }
                // Managers can transfer to any store (destination doesn't need to be their store)
            }

            // Validate that source store has sufficient inventory
            foreach ($items as $item) {
                $productId = $item['product_id'] ?? null;
                $variantId = $item['variant_id'] ?? null;
                $quantity = $item['quantity'] ?? 0;

                if (!$productId || $quantity <= 0) {
                    return $this->error('Invalid item data: product_id and quantity are required', null, 400);
                }

                $inventoryItem = $this->inventoryModel->getInventoryItem($fromStoreId, $productId, $variantId);
                if (!$inventoryItem) {
                    return $this->error("Product not found in source store inventory", null, 400);
                }

                if ($inventoryItem['quantity'] < $quantity) {
                    return $this->error("Insufficient inventory for product. Available: {$inventoryItem['quantity']}, Requested: {$quantity}", null, 400);
                }
            }

            // Create transfer
            $transferData = [
                'from_store_id' => $fromStoreId,
                'to_store_id'   => $toStoreId,
                'status'        => 'pending',
                'requested_by'  => $userId,
                'requested_at'  => date('Y-m-d H:i:s'),
                'notes'         => $notes,
            ];

            $db = \Config\Database::connect();
            $db->transStart();

            try {
                if (!$this->transferModel->insert($transferData)) {
                    $db->transRollback();
                    return $this->validationError($this->transferModel->errors(), 'Validation failed');
                }

                $transferId = $this->transferModel->getInsertID();

                // Create transfer items
                foreach ($items as $item) {
                    $itemData = [
                        'transfer_id' => $transferId,
                        'product_id'  => $item['product_id'],
                        'quantity'   => $item['quantity'],
                    ];
                    
                    // Only include variant_id if it's not null/empty
                    if (!empty($item['variant_id'])) {
                        $itemData['variant_id'] = $item['variant_id'];
                    }

                    if (!$this->transferItemModel->insert($itemData)) {
                        $db->transRollback();
                        return $this->validationError($this->transferItemModel->errors(), 'Failed to create transfer items');
                    }
                }

                $db->transComplete();

                if ($db->transStatus() === false) {
                    return $this->error('Failed to create stock transfer', null, 500);
                }

                $transfer = $this->transferModel->getTransferWithRelations($transferId);
                return $this->success($transfer, 'Stock transfer created successfully', 201);

            } catch (\Exception $e) {
                $db->transRollback();
                throw $e;
            }

        } catch (\Exception $e) {
            log_message('error', '[StockTransferController::create] Error: ' . $e->getMessage());
            return $this->error('An error occurred while creating stock transfer: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Approve stock transfer
     * POST /api/transfers/:id/approve
     * Manager/Admin only
     */
    public function approve($id = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only managers and admins can approve stock transfers');
            }

            $transfer = $this->transferModel->find($id);
            if (!$transfer) {
                return $this->notFound('Stock transfer not found');
            }

            if (!$this->transferModel->canApprove($id)) {
                return $this->error('Transfer cannot be approved. Current status: ' . $transfer['status'], null, 400);
            }

            // Check store access for managers
            if ($userRole === 'manager') {
                $accessibleStores = $this->storeModel->getAccessibleStores($userId, $userRole);
                $accessibleStoreIds = array_column($accessibleStores, 'id');
                
                // Manager can approve if they have access to destination store
                if (!in_array($transfer['to_store_id'], $accessibleStoreIds)) {
                    return $this->forbidden('You do not have access to approve this transfer');
                }
            }

            if (!$this->transferModel->updateStatus($id, 'approved', $userId)) {
                return $this->error('Failed to approve transfer', null, 500);
            }

            $updatedTransfer = $this->transferModel->getTransferWithRelations($id);
            return $this->success($updatedTransfer, 'Stock transfer approved successfully');

        } catch (\Exception $e) {
            log_message('error', '[StockTransferController::approve] Error: ' . $e->getMessage());
            return $this->error('An error occurred while approving stock transfer: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Complete stock transfer
     * POST /api/transfers/:id/complete
     * Manager/Admin only
     * Updates inventory at both stores
     */
    public function complete($id = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only managers and admins can complete stock transfers');
            }

            $transfer = $this->transferModel->find($id);
            if (!$transfer) {
                return $this->notFound('Stock transfer not found');
            }

            if (!$this->transferModel->canComplete($id)) {
                return $this->error('Transfer cannot be completed. Current status: ' . $transfer['status'], null, 400);
            }

            // Check store access for managers
            if ($userRole === 'manager') {
                $accessibleStores = $this->storeModel->getAccessibleStores($userId, $userRole);
                $accessibleStoreIds = array_column($accessibleStores, 'id');
                
                // Manager can complete if they have access to destination store
                if (!in_array($transfer['to_store_id'], $accessibleStoreIds)) {
                    return $this->forbidden('You do not have access to complete this transfer');
                }
            }

            // Get transfer items
            $items = $this->transferItemModel->getItemsByTransferIdSimple($id);
            if (empty($items)) {
                return $this->error('Transfer has no items', null, 400);
            }

            $db = \Config\Database::connect();
            $db->transStart();

            try {
                // Update inventory for each item
                foreach ($items as $item) {
                    $productId = $item['product_id'];
                    $variantId = $item['variant_id'];
                    $quantity = $item['quantity'];

                    // Deduct from source store
                    $sourceInventory = $this->inventoryModel->getInventoryItem(
                        $transfer['from_store_id'],
                        $productId,
                        $variantId
                    );

                    if (!$sourceInventory) {
                        $db->transRollback();
                        return $this->error("Source inventory not found for product", null, 400);
                    }

                    if ($sourceInventory['quantity'] < $quantity) {
                        $db->transRollback();
                        return $this->error("Insufficient inventory in source store. Available: {$sourceInventory['quantity']}, Required: {$quantity}", null, 400);
                    }

                    // Deduct from source
                    if (!$this->inventoryModel->adjustQuantity(
                        $sourceInventory['id'],
                        -$quantity,
                        'transfer_out',
                        'Stock transfer #' . $id . ' to store ' . $transfer['to_store_id'],
                        $userId
                    )) {
                        $db->transRollback();
                        return $this->error('Failed to deduct inventory from source store', null, 500);
                    }

                    // Add to destination store
                    // Convert empty string or null to null for proper handling
                    $destVariantId = (!empty($variantId)) ? $variantId : null;
                    $destInventory = $this->inventoryModel->getInventoryItem(
                        $transfer['to_store_id'],
                        $productId,
                        $destVariantId
                    );

                    if ($destInventory) {
                        // Update existing inventory
                        if (!$this->inventoryModel->adjustQuantity(
                            $destInventory['id'],
                            $quantity,
                            'transfer_in',
                            'Stock transfer #' . $id . ' from store ' . $transfer['from_store_id'],
                            $userId
                        )) {
                            $db->transRollback();
                            return $this->error('Failed to add inventory to destination store', null, 500);
                        }
                    } else {
                        // Create new inventory record
                        $newInventoryData = [
                            'store_id'     => $transfer['to_store_id'],
                            'product_id'   => $productId,
                            'quantity'    => $quantity,
                            'reorder_level' => 0,
                        ];
                        
                        // Only include variant_id if it's not null/empty
                        if (!empty($destVariantId)) {
                            $newInventoryData['variant_id'] = $destVariantId;
                        }

                        if (!$this->inventoryModel->insert($newInventoryData)) {
                            $db->transRollback();
                            $errors = $this->inventoryModel->errors();
                            log_message('error', '[StockTransferController::complete] Failed to create inventory: ' . json_encode($errors));
                            return $this->error('Failed to create inventory in destination store: ' . json_encode($errors), null, 500);
                        }

                        // Record history for new inventory
                        $inventoryHistoryModel = model('InventoryHistoryModel');
                        $newInventoryId = $this->inventoryModel->getInsertID();
                        if (!$inventoryHistoryModel->insert([
                            'inventory_id'      => $newInventoryId,
                            'change_type'        => 'transfer_in',
                            'quantity_change'    => $quantity,
                            'previous_quantity'  => 0,
                            'new_quantity'       => $quantity,
                            'reason'             => 'Stock transfer #' . $id . ' from store ' . $transfer['from_store_id'],
                            'user_id'            => $userId,
                        ])) {
                            $db->transRollback();
                            log_message('error', '[StockTransferController::complete] Failed to create inventory history');
                            return $this->error('Failed to create inventory history', null, 500);
                        }
                    }
                }

                // Update transfer status
                if (!$this->transferModel->updateStatus($id, 'completed', $userId)) {
                    $db->transRollback();
                    return $this->error('Failed to update transfer status', null, 500);
                }

                $db->transComplete();

                if ($db->transStatus() === false) {
                    return $this->error('Failed to complete stock transfer', null, 500);
                }

                $completedTransfer = $this->transferModel->getTransferWithRelations($id);
                return $this->success($completedTransfer, 'Stock transfer completed successfully');

            } catch (\Exception $e) {
                $db->transRollback();
                throw $e;
            }

        } catch (\Exception $e) {
            log_message('error', '[StockTransferController::complete] Error: ' . $e->getMessage());
            return $this->error('An error occurred while completing stock transfer: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Cancel stock transfer
     * POST /api/transfers/:id/cancel
     * Manager/Admin only
     */
    public function cancel($id = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only managers and admins can cancel stock transfers');
            }

            $transfer = $this->transferModel->find($id);
            if (!$transfer) {
                return $this->notFound('Stock transfer not found');
            }

            if (!$this->transferModel->canCancel($id)) {
                return $this->error('Transfer cannot be cancelled. Current status: ' . $transfer['status'], null, 400);
            }

            // Check store access for managers
            if ($userRole === 'manager') {
                $accessibleStores = $this->storeModel->getAccessibleStores($userId, $userRole);
                $accessibleStoreIds = array_column($accessibleStores, 'id');
                
                if (!in_array($transfer['from_store_id'], $accessibleStoreIds) && 
                    !in_array($transfer['to_store_id'], $accessibleStoreIds)) {
                    return $this->forbidden('You do not have access to cancel this transfer');
                }
            }

            if (!$this->transferModel->updateStatus($id, 'cancelled', $userId)) {
                return $this->error('Failed to cancel transfer', null, 500);
            }

            $updatedTransfer = $this->transferModel->getTransferWithRelations($id);
            return $this->success($updatedTransfer, 'Stock transfer cancelled successfully');

        } catch (\Exception $e) {
            log_message('error', '[StockTransferController::cancel] Error: ' . $e->getMessage());
            return $this->error('An error occurred while cancelling stock transfer: ' . $e->getMessage(), null, 500);
        }
    }
}

