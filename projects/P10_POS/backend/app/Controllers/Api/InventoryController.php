<?php

namespace App\Controllers\Api;

use App\Models\InventoryModel;
use App\Models\InventoryHistoryModel;
use App\Models\StoreModel;
use CodeIgniter\HTTP\ResponseInterface;

class InventoryController extends BaseApiController
{
    protected $inventoryModel;
    protected $historyModel;
    protected $storeModel;

    public function __construct()
    {
        $this->inventoryModel = new InventoryModel();
        $this->historyModel = new InventoryHistoryModel();
        $this->storeModel = model('StoreModel');
    }

    /**
     * List inventory for a store
     * GET /api/stores/:storeId/inventory
     */
    public function index($storeId = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized();
            }

            // Check store access
            if (!$this->storeModel->hasAccess($storeId, $userId, $userRole)) {
                return $this->forbidden('You do not have access to this store');
            }

            $page = (int) ($this->request->getGet('page') ?? 1);
            $perPage = (int) ($this->request->getGet('per_page') ?? 10);
            $productId = $this->request->getGet('product_id');
            $lowStock = $this->request->getGet('low_stock') === 'true';
            $search = $this->request->getGet('search');

            $filters = [];
            if ($productId) {
                $filters['product_id'] = $productId;
            }
            if ($lowStock) {
                $filters['low_stock'] = true;
            }
            if ($search) {
                $filters['search'] = $search;
            }

            // Build query using database connection directly
            $db = \Config\Database::connect();
            $builder = $db->table('inventory');
            $builder->select('inventory.*, products.name as product_name, products.sku, products.barcode, products.base_price, product_categories.name as category_name')
                ->join('products', 'products.id = inventory.product_id', 'left')
                ->join('product_categories', 'product_categories.id = products.category_id', 'left')
                ->where('inventory.store_id', $storeId);

            if (!empty($filters['product_id'])) {
                $builder->where('inventory.product_id', $filters['product_id']);
            }

            if (!empty($filters['low_stock'])) {
                $builder->where('inventory.quantity <= inventory.reorder_level', null, false);
            }

            if (!empty($filters['search'])) {
                $builder->groupStart()
                    ->like('products.name', $filters['search'])
                    ->orLike('products.sku', $filters['search'])
                    ->orLike('products.barcode', $filters['search'])
                    ->groupEnd();
            }

            // Get total count (before limit/offset)
            $total = $builder->countAllResults(false);

            // Get paginated results
            $inventory = $builder->limit($perPage, ($page - 1) * $perPage)
                ->orderBy('inventory.last_updated', 'DESC')
                ->get()
                ->getResultArray();

            return $this->success([
                'data' => $inventory,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => $total,
                    'last_page' => $perPage > 0 ? (int) ceil($total / $perPage) : 1,
                ],
            ], 'Inventory retrieved successfully');
        } catch (\Exception $e) {
            log_message('error', 'Inventory list error: ' . $e->getMessage());
            return $this->error('Failed to retrieve inventory: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get inventory item details
     * GET /api/stores/:storeId/inventory/:id
     */
    public function show($storeId = null, $id = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized();
            }

            // Check store access
            if (!$this->storeModel->hasAccess($storeId, $userId, $userRole)) {
                return $this->forbidden('You do not have access to this store');
            }

            $inventory = $this->inventoryModel->find($id);

            if (!$inventory || $inventory['store_id'] != $storeId) {
                return $this->notFound('Inventory item not found');
            }

            // Load product details
            $productModel = model('ProductModel');
            $inventory['product'] = $productModel->find($inventory['product_id']);

            // Load history
            $inventory['history'] = $this->historyModel->getInventoryHistory($id, 20);

            return $this->success($inventory, 'Inventory item retrieved successfully');
        } catch (\Exception $e) {
            log_message('error', 'Inventory show error: ' . $e->getMessage());
            return $this->error('Failed to retrieve inventory item: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Create or update inventory item
     * POST /api/stores/:storeId/inventory
     * Manager/Admin only
     */
    public function create($storeId = null)
    {
        try {
            $userRole = $this->request->user['role'] ?? null;
            $userId = $this->request->user['user_id'] ?? null;

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only admins and managers can manage inventory');
            }

            // Check store access
            if (!$this->storeModel->hasAccess($storeId, $userId, $userRole)) {
                return $this->forbidden('You do not have access to this store');
            }

            // Get JSON input if available, otherwise get POST data
            $json = $this->request->getJSON(true);
            $productId = $json['product_id'] ?? $this->request->getPost('product_id');
            $variantId = $json['variant_id'] ?? $this->request->getPost('variant_id');
            $quantity = $json['quantity'] ?? $this->request->getPost('quantity') ?? 0;
            $reorderLevel = $json['reorder_level'] ?? $this->request->getPost('reorder_level') ?? 0;

            $rules = [
                'product_id'    => 'required|integer|is_not_unique[products.id]',
                'variant_id'    => 'permit_empty|integer|is_not_unique[product_variants.id]',
                'quantity'      => 'required|integer|greater_than_equal_to[0]',
                'reorder_level' => 'permit_empty|integer|greater_than_equal_to[0]',
            ];

            $validationData = [
                'product_id'    => $productId,
                'variant_id'    => $variantId,
                'quantity'      => $quantity,
                'reorder_level' => $reorderLevel,
            ];

            if (!$this->validate($rules, $validationData)) {
                return $this->validationError($this->validator->getErrors());
            }

            // Check if inventory item already exists
            $existing = $this->inventoryModel->getInventoryItem($storeId, $productId, $variantId ?: null);

            if ($existing) {
                // Update existing inventory
                $this->inventoryModel->skipValidation(true);
                $this->inventoryModel->update($existing['id'], [
                    'quantity'      => $quantity,
                    'reorder_level' => $reorderLevel,
                ]);
                $this->inventoryModel->skipValidation(false);

                // Record history
                $quantityChange = $quantity - $existing['quantity'];
                if ($quantityChange != 0) {
                    $this->historyModel->insert([
                        'inventory_id'      => $existing['id'],
                        'change_type'       => 'adjustment',
                        'quantity_change'   => $quantityChange,
                        'previous_quantity' => $existing['quantity'],
                        'new_quantity'      => $quantity,
                        'reason'            => 'Manual adjustment',
                        'user_id'           => $userId,
                    ]);
                }

                $inventory = $this->inventoryModel->find($existing['id']);
            } else {
                // Create new inventory item
                $data = [
                    'store_id'     => $storeId,
                    'product_id'   => $productId,
                    'variant_id'   => $variantId ?: null,
                    'quantity'     => $quantity,
                    'reorder_level' => $reorderLevel,
                    'last_updated' => date('Y-m-d H:i:s'),
                ];

                $inventoryId = $this->inventoryModel->insert($data);

                if (!$inventoryId) {
                    return $this->error('Failed to create inventory item', $this->inventoryModel->errors(), 500);
                }

                // Record initial history
                $this->historyModel->insert([
                    'inventory_id'      => $inventoryId,
                    'change_type'       => 'adjustment',
                    'quantity_change'   => $quantity,
                    'previous_quantity' => 0,
                    'new_quantity'      => $quantity,
                    'reason'            => 'Initial stock',
                    'user_id'           => $userId,
                ]);

                $inventory = $this->inventoryModel->find($inventoryId);
            }

            return $this->success($inventory, 'Inventory item saved successfully', 201);
        } catch (\Exception $e) {
            log_message('error', 'Inventory create error: ' . $e->getMessage());
            return $this->error('Failed to save inventory item: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Update inventory item
     * PUT /api/stores/:storeId/inventory/:id
     * Manager/Admin only
     */
    public function update($storeId = null, $id = null)
    {
        try {
            $userRole = $this->request->user['role'] ?? null;
            $userId = $this->request->user['user_id'] ?? null;

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only admins and managers can update inventory');
            }

            // Check store access
            if (!$this->storeModel->hasAccess($storeId, $userId, $userRole)) {
                return $this->forbidden('You do not have access to this store');
            }

            $inventory = $this->inventoryModel->find($id);

            if (!$inventory || $inventory['store_id'] != $storeId) {
                return $this->notFound('Inventory item not found');
            }

            // Get JSON input if available, otherwise get POST/PUT data
            $json = $this->request->getJSON(true);
            $quantity = $json['quantity'] ?? $this->request->getPost('quantity') ?? $this->request->getVar('quantity');
            $reorderLevel = $json['reorder_level'] ?? $this->request->getPost('reorder_level') ?? $this->request->getVar('reorder_level');

            $rules = [
                'quantity'      => 'permit_empty|integer|greater_than_equal_to[0]',
                'reorder_level' => 'permit_empty|integer|greater_than_equal_to[0]',
            ];

            $data = [];
            if ($quantity !== null && $quantity !== '') {
                $data['quantity'] = (int) $quantity;
            }
            if ($reorderLevel !== null && $reorderLevel !== '') {
                $data['reorder_level'] = (int) $reorderLevel;
            }

            if (empty($data)) {
                return $this->error('No data provided for update', null, 400);
            }

            $validationData = array_filter($data, function($value) {
                return $value !== null;
            });

            if (!$this->validate($rules, $validationData)) {
                return $this->validationError($this->validator->getErrors());
            }

            // Record quantity change in history
            if (isset($data['quantity']) && $data['quantity'] != $inventory['quantity']) {
                $quantityChange = $data['quantity'] - $inventory['quantity'];
                $this->historyModel->insert([
                    'inventory_id'      => $id,
                    'change_type'       => 'adjustment',
                    'quantity_change'   => $quantityChange,
                    'previous_quantity' => $inventory['quantity'],
                    'new_quantity'      => $data['quantity'],
                    'reason'            => $json['reason'] ?? 'Manual adjustment',
                    'user_id'           => $userId,
                ]);
            }

            $this->inventoryModel->skipValidation(true);
            if (!$this->inventoryModel->update($id, $data)) {
                $this->inventoryModel->skipValidation(false);
                return $this->error('Failed to update inventory item', $this->inventoryModel->errors(), 500);
            }
            $this->inventoryModel->skipValidation(false);

            $updatedInventory = $this->inventoryModel->find($id);
            return $this->success($updatedInventory, 'Inventory item updated successfully');
        } catch (\Exception $e) {
            log_message('error', 'Inventory update error: ' . $e->getMessage());
            return $this->error('Failed to update inventory item: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Adjust inventory quantity
     * POST /api/stores/:storeId/inventory/:id/adjust
     * Manager/Admin only
     */
    public function adjust($storeId = null, $id = null)
    {
        try {
            $userRole = $this->request->user['role'] ?? null;
            $userId = $this->request->user['user_id'] ?? null;

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only admins and managers can adjust inventory');
            }

            // Check store access
            if (!$this->storeModel->hasAccess($storeId, $userId, $userRole)) {
                return $this->forbidden('You do not have access to this store');
            }

            $inventory = $this->inventoryModel->find($id);

            if (!$inventory || $inventory['store_id'] != $storeId) {
                return $this->notFound('Inventory item not found');
            }

            // Get JSON input if available, otherwise get POST data
            $json = $this->request->getJSON(true);
            $quantityChange = $json['quantity_change'] ?? $this->request->getPost('quantity_change');
            $changeType = $json['change_type'] ?? $this->request->getPost('change_type') ?? 'adjustment';
            $reason = $json['reason'] ?? $this->request->getPost('reason');

            if ($quantityChange === null || $quantityChange === '') {
                return $this->error('Quantity change is required', null, 400);
            }

            $quantityChange = (int) $quantityChange;
            if ($quantityChange == 0) {
                return $this->error('Quantity change cannot be zero', null, 400);
            }

            $success = $this->inventoryModel->adjustQuantity($id, $quantityChange, $changeType, $reason, $userId);

            if (!$success) {
                return $this->error('Failed to adjust inventory. Check if quantity would go negative.', null, 400);
            }

            $updatedInventory = $this->inventoryModel->find($id);
            return $this->success($updatedInventory, 'Inventory adjusted successfully');
        } catch (\Exception $e) {
            log_message('error', 'Inventory adjust error: ' . $e->getMessage());
            return $this->error('Failed to adjust inventory: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get low stock alerts
     * GET /api/stores/:storeId/inventory/low-stock
     */
    public function getLowStock($storeId = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized();
            }

            // Check store access
            if (!$this->storeModel->hasAccess($storeId, $userId, $userRole)) {
                return $this->forbidden('You do not have access to this store');
            }

            $lowStockItems = $this->inventoryModel->getLowStockItems($storeId);

            // Enrich with product details
            $productModel = model('ProductModel');
            foreach ($lowStockItems as &$item) {
                $product = $productModel->find($item['product_id']);
                if ($product) {
                    $item['product'] = $product;
                }
            }

            return $this->success($lowStockItems, 'Low stock items retrieved successfully');
        } catch (\Exception $e) {
            log_message('error', 'Low stock error: ' . $e->getMessage());
            return $this->error('Failed to retrieve low stock items: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get inventory history
     * GET /api/stores/:storeId/inventory/:id/history
     */
    public function getHistory($storeId = null, $id = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized();
            }

            // Check store access
            if (!$this->storeModel->hasAccess($storeId, $userId, $userRole)) {
                return $this->forbidden('You do not have access to this store');
            }

            $inventory = $this->inventoryModel->find($id);

            if (!$inventory || $inventory['store_id'] != $storeId) {
                return $this->notFound('Inventory item not found');
            }

            $limit = (int) ($this->request->getGet('limit') ?? 50);
            $history = $this->historyModel->getInventoryHistory($id, $limit);

            // Enrich with user details
            $userModel = model('UserModel');
            foreach ($history as &$entry) {
                if ($entry['user_id']) {
                    $user = $userModel->find($entry['user_id']);
                    if ($user) {
                        $entry['user'] = [
                            'id' => $user['id'],
                            'name' => $user['name'],
                            'email' => $user['email'],
                        ];
                    }
                }
            }

            return $this->success($history, 'Inventory history retrieved successfully');
        } catch (\Exception $e) {
            log_message('error', 'Inventory history error: ' . $e->getMessage());
            return $this->error('Failed to retrieve inventory history: ' . $e->getMessage(), null, 500);
        }
    }
}

