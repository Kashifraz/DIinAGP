<?php

namespace App\Controllers\Api;

use App\Models\SyncQueueModel;
use App\Models\SyncLogModel;
use App\Models\TransactionModel;
use App\Models\ProductModel;
use App\Models\InventoryModel;
use App\Models\StoreModel;
use CodeIgniter\HTTP\ResponseInterface;

class SyncController extends BaseApiController
{
    protected $syncQueueModel;
    protected $syncLogModel;
    protected $transactionModel;
    protected $productModel;
    protected $inventoryModel;
    protected $storeModel;

    public function __construct()
    {
        $this->syncQueueModel = new SyncQueueModel();
        $this->syncLogModel = new SyncLogModel();
        $this->transactionModel = new TransactionModel();
        $this->productModel = new ProductModel();
        $this->inventoryModel = new InventoryModel();
        $this->storeModel = new StoreModel();
    }

    /**
     * Get sync status
     * GET /api/sync/status
     */
    public function status()
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            $storeId = $this->request->getGet('store_id');

            // Get sync statistics
            $stats = $this->syncQueueModel->getSyncStats($storeId, $userId);

            // Get last sync time
            $lastSync = $this->syncQueueModel->builder()
                ->where('user_id', $userId)
                ->where('status', 'synced')
                ->orderBy('synced_at', 'DESC')
                ->limit(1)
                ->get()
                ->getRowArray();

            $status = [
                'stats' => $stats,
                'last_sync' => $lastSync['synced_at'] ?? null,
                'has_pending' => $stats['pending'] > 0,
                'has_failed' => $stats['failed'] > 0,
            ];

            return $this->success($status, 'Sync status retrieved successfully');

        } catch (\Exception $e) {
            log_message('error', '[SyncController::status] Error: ' . $e->getMessage());
            return $this->error('An error occurred while retrieving sync status: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Push queued operations to server
     * POST /api/sync/push
     */
    public function push()
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            $json = $this->request->getJSON(true);
            if ($json === null || !is_array($json)) {
                $json = [];
            }

            $operations = $json['operations'] ?? [];
            $storeId = $json['store_id'] ?? $this->request->getPost('store_id');

            if (!$storeId) {
                return $this->error('store_id is required', null, 400);
            }

            // Validate store access
            if ($userRole === 'manager') {
                if (!$this->storeModel->hasAccess($storeId, $userId, $userRole)) {
                    return $this->forbidden('You do not have access to this store');
                }
            }

            if (empty($operations)) {
                return $this->success(['synced' => 0, 'failed' => 0], 'No operations to sync');
            }

            $synced = 0;
            $failed = 0;
            $results = [];

            $db = \Config\Database::connect();
            $db->transStart();

            try {
                foreach ($operations as $operation) {
                    $operationType = $operation['operation_type'] ?? null;
                    $entityType = $operation['entity_type'] ?? null;
                    $entityId = $operation['entity_id'] ?? null;
                    $data = $operation['data'] ?? null;

                    if (!$operationType || !$entityType || !$data) {
                        $failed++;
                        $results[] = [
                            'operation' => $operation,
                            'status' => 'failed',
                            'error' => 'Missing required fields'
                        ];
                        continue;
                    }

                    // Process the operation based on entity type
                    $result = $this->processOperation($operationType, $entityType, $entityId, $data, $storeId, $userId);

                    if ($result['success']) {
                        $synced++;
                        $results[] = [
                            'operation' => $operation,
                            'status' => 'success',
                            'entity_id' => $result['entity_id'] ?? $entityId
                        ];
                    } else {
                        $failed++;
                        $results[] = [
                            'operation' => $operation,
                            'status' => 'failed',
                            'error' => $result['error'] ?? 'Unknown error'
                        ];
                    }
                }

                $db->transComplete();

                if ($db->transStatus() === false) {
                    return $this->error('Transaction failed during sync', null, 500);
                }

                return $this->success([
                    'synced' => $synced,
                    'failed' => $failed,
                    'results' => $results
                ], 'Sync push completed');

            } catch (\Exception $e) {
                $db->transRollback();
                throw $e;
            }

        } catch (\Exception $e) {
            log_message('error', '[SyncController::push] Error: ' . $e->getMessage());
            return $this->error('An error occurred while processing sync push: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Pull updated data from server
     * GET /api/sync/pull
     */
    public function pull()
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            $storeId = $this->request->getGet('store_id');
            $lastSyncTime = $this->request->getGet('last_sync'); // ISO datetime string
            $entityTypes = $this->request->getGet('entity_types'); // Comma-separated: transactions,products,inventory

            if (!$storeId) {
                return $this->error('store_id is required', null, 400);
            }

            // Validate store access
            if ($userRole === 'manager') {
                if (!$this->storeModel->hasAccess($storeId, $userId, $userRole)) {
                    return $this->forbidden('You do not have access to this store');
                }
            }

            $entityTypesArray = $entityTypes ? explode(',', $entityTypes) : ['transactions', 'products', 'inventory'];
            $data = [];

            // Get updated transactions
            if (in_array('transactions', $entityTypesArray)) {
                $data['transactions'] = $this->getUpdatedTransactions($storeId, $lastSyncTime);
            }

            // Get updated products
            if (in_array('products', $entityTypesArray)) {
                $data['products'] = $this->getUpdatedProducts($lastSyncTime);
            }

            // Get updated inventory
            if (in_array('inventory', $entityTypesArray)) {
                $data['inventory'] = $this->getUpdatedInventory($storeId, $lastSyncTime);
            }

            return $this->success([
                'data' => $data,
                'sync_time' => date('Y-m-d H:i:s'),
            ], 'Sync pull completed successfully');

        } catch (\Exception $e) {
            log_message('error', '[SyncController::pull] Error: ' . $e->getMessage());
            return $this->error('An error occurred while processing sync pull: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Process a single operation
     */
    protected function processOperation(string $operationType, string $entityType, ?int $entityId, array $data, int $storeId, int $userId): array
    {
        try {
            switch ($entityType) {
                case 'transaction':
                    return $this->processTransactionOperation($operationType, $entityId, $data, $storeId, $userId);
                
                case 'inventory':
                    return $this->processInventoryOperation($operationType, $entityId, $data, $storeId, $userId);
                
                default:
                    return ['success' => false, 'error' => 'Unsupported entity type: ' . $entityType];
            }
        } catch (\Exception $e) {
            log_message('error', '[SyncController::processOperation] Error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Process transaction operation
     */
    protected function processTransactionOperation(string $operationType, ?int $entityId, array $data, int $storeId, int $userId): array
    {
        if ($operationType === 'create') {
            // Create transaction from offline data
            $transactionData = [
                'store_id' => $storeId,
                'cashier_id' => $userId,
                'customer_id' => $data['customer_id'] ?? null,
                'subtotal' => $data['subtotal'] ?? '0.00',
                'tax_amount' => $data['tax_amount'] ?? '0.00',
                'discount_amount' => $data['discount_amount'] ?? '0.00',
                'total_amount' => $data['total_amount'] ?? '0.00',
                'status' => 'completed',
                'notes' => $data['notes'] ?? null,
            ];

            // If transaction_number is provided, use it (for offline transactions)
            if (isset($data['transaction_number'])) {
                $transactionData['transaction_number'] = $data['transaction_number'];
            }

            $transactionId = $this->transactionModel->insert($transactionData);
            
            if (!$transactionId) {
                return ['success' => false, 'error' => 'Failed to create transaction: ' . json_encode($this->transactionModel->errors())];
            }

            // Create transaction items
            if (isset($data['items']) && is_array($data['items'])) {
                $transactionItemModel = new \App\Models\TransactionItemModel();
                foreach ($data['items'] as $item) {
                    $itemData = [
                        'transaction_id' => $transactionId,
                        'product_id' => $item['product_id'],
                        'variant_id' => $item['variant_id'] ?? null,
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'discount_amount' => $item['discount_amount'] ?? '0.00',
                        'tax_amount' => $item['tax_amount'] ?? '0.00',
                        'line_total' => $item['line_total'],
                    ];
                    $transactionItemModel->insert($itemData);
                }
            }

            // Create payment if provided
            if (isset($data['payment'])) {
                $paymentModel = new \App\Models\PaymentModel();
                $paymentData = [
                    'transaction_id' => $transactionId,
                    'payment_method' => $data['payment']['payment_method'] ?? 'cash',
                    'amount' => $data['payment']['amount'] ?? $data['total_amount'],
                    'change_amount' => $data['payment']['change_amount'] ?? '0.00',
                    'status' => 'completed',
                    'reference_number' => $data['payment']['reference_number'] ?? null,
                ];
                $paymentModel->insert($paymentData);
            }

            return ['success' => true, 'entity_id' => $transactionId];
        }

        return ['success' => false, 'error' => 'Unsupported operation type for transactions'];
    }

    /**
     * Process inventory operation
     */
    protected function processInventoryOperation(string $operationType, ?int $entityId, array $data, int $storeId, int $userId): array
    {
        if ($operationType === 'update') {
            // Update inventory from offline adjustment
            $inventoryItem = $this->inventoryModel->getInventoryItem(
                $storeId,
                $data['product_id'],
                $data['variant_id'] ?? null
            );

            if (!$inventoryItem) {
                // Create new inventory record
                $inventoryData = [
                    'store_id' => $storeId,
                    'product_id' => $data['product_id'],
                    'variant_id' => $data['variant_id'] ?? null,
                    'quantity' => $data['quantity'] ?? 0,
                    'reorder_level' => $data['reorder_level'] ?? 0,
                ];
                $inventoryId = $this->inventoryModel->insert($inventoryData);
                return ['success' => true, 'entity_id' => $inventoryId];
            }

            // Update existing inventory
            $quantityChange = $data['quantity_change'] ?? 0;
            $changeType = $data['change_type'] ?? 'adjustment';
            $reason = $data['reason'] ?? 'Offline sync';

            if ($this->inventoryModel->adjustQuantity($inventoryItem['id'], $quantityChange, $changeType, $reason, $userId)) {
                return ['success' => true, 'entity_id' => $inventoryItem['id']];
            }

            return ['success' => false, 'error' => 'Failed to adjust inventory'];
        }

        return ['success' => false, 'error' => 'Unsupported operation type for inventory'];
    }

    /**
     * Get updated transactions since last sync
     */
    protected function getUpdatedTransactions(int $storeId, ?string $lastSyncTime): array
    {
        $builder = $this->transactionModel->builder();
        $builder->where('store_id', $storeId);
        $builder->where('status', 'completed');

        if ($lastSyncTime) {
            $builder->where('updated_at >=', $lastSyncTime);
        } else {
            // If no last sync time, return last 100 transactions
            $builder->orderBy('created_at', 'DESC');
            $builder->limit(100);
        }

        $transactions = $builder->get()->getResultArray();

        // Load related data
        foreach ($transactions as &$transaction) {
            $transaction = $this->transactionModel->getTransactionWithDetails($transaction['id']);
        }

        return $transactions;
    }

    /**
     * Get updated products since last sync
     */
    protected function getUpdatedProducts(?string $lastSyncTime): array
    {
        $builder = $this->productModel->builder();
        $builder->where('status', 'active');

        if ($lastSyncTime) {
            $builder->where('updated_at >=', $lastSyncTime);
        } else {
            // If no last sync time, return all active products
            $builder->limit(1000);
        }

        return $builder->get()->getResultArray();
    }

    /**
     * Get updated inventory since last sync
     */
    protected function getUpdatedInventory(int $storeId, ?string $lastSyncTime): array
    {
        $builder = $this->inventoryModel->builder();
        $builder->where('store_id', $storeId);

        if ($lastSyncTime) {
            $builder->where('updated_at >=', $lastSyncTime);
        }

        return $builder->get()->getResultArray();
    }

    /**
     * Get sync queue items
     * GET /api/sync/queue
     */
    public function queue()
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            $storeId = $this->request->getGet('store_id');
            $status = $this->request->getGet('status') ?? 'pending';
            $limit = (int) ($this->request->getGet('limit') ?? 100);

            $items = $this->syncQueueModel->getItemsByStatus($status, $storeId, $limit);

            return $this->success($items, 'Sync queue retrieved successfully');

        } catch (\Exception $e) {
            log_message('error', '[SyncController::queue] Error: ' . $e->getMessage());
            return $this->error('An error occurred while retrieving sync queue: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Retry failed sync items
     * POST /api/sync/retry
     */
    public function retry()
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            $json = $this->request->getJSON(true);
            if ($json === null || !is_array($json)) {
                $json = [];
            }

            $syncIds = $json['sync_ids'] ?? [];
            if (empty($syncIds)) {
                return $this->error('sync_ids array is required', null, 400);
            }

            $retried = 0;
            $failed = 0;

            foreach ($syncIds as $syncId) {
                $syncItem = $this->syncQueueModel->find($syncId);
                if (!$syncItem) {
                    $failed++;
                    continue;
                }

                // Reset status to pending
                if ($this->syncQueueModel->update($syncId, ['status' => 'pending'])) {
                    $retried++;
                } else {
                    $failed++;
                }
            }

            return $this->success([
                'retried' => $retried,
                'failed' => $failed
            ], 'Retry operation completed');

        } catch (\Exception $e) {
            log_message('error', '[SyncController::retry] Error: ' . $e->getMessage());
            return $this->error('An error occurred while retrying sync: ' . $e->getMessage(), null, 500);
        }
    }
}

