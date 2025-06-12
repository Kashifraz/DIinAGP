<?php

namespace App\Controllers\Api;

use App\Models\DiscountModel;
use App\Models\TransactionModel;
use App\Models\TransactionDiscountModel;
use App\Models\ProductModel;
use CodeIgniter\HTTP\ResponseInterface;

class DiscountController extends BaseApiController
{
    protected $discountModel;
    protected $transactionModel;
    protected $transactionDiscountModel;
    protected $productModel;

    public function __construct()
    {
        $this->discountModel = new DiscountModel();
        $this->transactionModel = new TransactionModel();
        $this->transactionDiscountModel = new TransactionDiscountModel();
        $this->productModel = new ProductModel();
    }

    /**
     * List discounts with filters
     * GET /api/discounts
     */
    public function index()
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            // Only Manager and Admin can view discounts
            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only managers and admins can view discounts');
            }

            $page = (int) ($this->request->getGet('page') ?? 1);
            $perPage = (int) ($this->request->getGet('per_page') ?? 10);
            $storeId = $this->request->getGet('store_id');
            $status = $this->request->getGet('status');
            $type = $this->request->getGet('type');

            $builder = $this->discountModel->builder();
            
            if ($storeId) {
                $builder->where('store_id', $storeId);
            }
            if ($status) {
                $builder->where('status', $status);
            }
            if ($type) {
                $builder->where('type', $type);
            }

            $total = $builder->countAllResults(false);
            $discounts = $builder->orderBy('created_at', 'DESC')
                ->limit($perPage, ($page - 1) * $perPage)
                ->get()
                ->getResultArray();

            return $this->success([
                'data' => $discounts,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => $total,
                    'last_page' => $perPage > 0 ? (int) ceil($total / $perPage) : 1,
                ],
            ], 'Discounts retrieved successfully');

        } catch (\Exception $e) {
            log_message('error', '[DiscountController::index] Error: ' . $e->getMessage());
            return $this->error('An error occurred while retrieving discounts: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get discount by ID
     * GET /api/discounts/:id
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
                return $this->forbidden('Only managers and admins can view discounts');
            }

            $discount = $this->discountModel->find($id);
            if (!$discount) {
                return $this->notFound('Discount not found');
            }

            return $this->success($discount, 'Discount retrieved successfully');

        } catch (\Exception $e) {
            log_message('error', '[DiscountController::show] Error: ' . $e->getMessage());
            return $this->error('An error occurred while retrieving discount: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Create new discount
     * POST /api/discounts
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
                return $this->forbidden('Only managers and admins can create discounts');
            }

            $json = $this->request->getJSON(true);
            $data = [
                'name' => $json['name'] ?? $this->request->getPost('name'),
                'type' => $json['type'] ?? $this->request->getPost('type'),
                'value' => $json['value'] ?? $this->request->getPost('value'),
                'product_id' => $json['product_id'] ?? $this->request->getPost('product_id'),
                'category_id' => $json['category_id'] ?? $this->request->getPost('category_id'),
                'store_id' => $json['store_id'] ?? $this->request->getPost('store_id'),
                'min_purchase' => $json['min_purchase'] ?? $this->request->getPost('min_purchase'),
                'valid_from' => $json['valid_from'] ?? $this->request->getPost('valid_from'),
                'valid_to' => $json['valid_to'] ?? $this->request->getPost('valid_to'),
                'status' => $json['status'] ?? $this->request->getPost('status') ?? 'active',
            ];

            // Validate mutual exclusivity: product_id and category_id cannot both be set
            if (!empty($data['product_id']) && !empty($data['category_id'])) {
                return $this->error('product_id and category_id cannot both be set. They are mutually exclusive.', null, 400);
            }

            // Convert empty strings to null
            if (empty($data['product_id'])) {
                $data['product_id'] = null;
            }
            if (empty($data['category_id'])) {
                $data['category_id'] = null;
            }
            if (empty($data['store_id'])) {
                $data['store_id'] = null;
            }
            if (empty($data['min_purchase'])) {
                $data['min_purchase'] = null;
            }
            if (empty($data['valid_from'])) {
                $data['valid_from'] = null;
            }
            if (empty($data['valid_to'])) {
                $data['valid_to'] = null;
            }

            if (!$this->discountModel->insert($data)) {
                return $this->validationError($this->discountModel->errors(), 'Validation failed');
            }

            $discount = $this->discountModel->find($this->discountModel->getInsertID());
            return $this->success($discount, 'Discount created successfully', 201);

        } catch (\Exception $e) {
            log_message('error', '[DiscountController::create] Error: ' . $e->getMessage());
            return $this->error('An error occurred while creating discount: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Update discount
     * PUT /api/discounts/:id
     */
    public function update($id = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only managers and admins can update discounts');
            }

            $discount = $this->discountModel->find($id);
            if (!$discount) {
                return $this->notFound('Discount not found');
            }

            $json = $this->request->getJSON(true);
            $data = [];

            if (isset($json['name']) || $this->request->getPost('name') !== null) {
                $data['name'] = $json['name'] ?? $this->request->getPost('name');
            }
            if (isset($json['type']) || $this->request->getPost('type') !== null) {
                $data['type'] = $json['type'] ?? $this->request->getPost('type');
            }
            if (isset($json['value']) || $this->request->getPost('value') !== null) {
                $data['value'] = $json['value'] ?? $this->request->getPost('value');
            }
            if (isset($json['product_id']) || $this->request->getPost('product_id') !== null) {
                $data['product_id'] = empty($json['product_id'] ?? $this->request->getPost('product_id')) ? null : ($json['product_id'] ?? $this->request->getPost('product_id'));
            }
            if (isset($json['category_id']) || $this->request->getPost('category_id') !== null) {
                $data['category_id'] = empty($json['category_id'] ?? $this->request->getPost('category_id')) ? null : ($json['category_id'] ?? $this->request->getPost('category_id'));
            }
            if (isset($json['store_id']) || $this->request->getPost('store_id') !== null) {
                $data['store_id'] = empty($json['store_id'] ?? $this->request->getPost('store_id')) ? null : ($json['store_id'] ?? $this->request->getPost('store_id'));
            }
            if (isset($json['min_purchase']) || $this->request->getPost('min_purchase') !== null) {
                $data['min_purchase'] = empty($json['min_purchase'] ?? $this->request->getPost('min_purchase')) ? null : ($json['min_purchase'] ?? $this->request->getPost('min_purchase'));
            }
            if (isset($json['valid_from']) || $this->request->getPost('valid_from') !== null) {
                $data['valid_from'] = empty($json['valid_from'] ?? $this->request->getPost('valid_from')) ? null : ($json['valid_from'] ?? $this->request->getPost('valid_from'));
            }
            if (isset($json['valid_to']) || $this->request->getPost('valid_to') !== null) {
                $data['valid_to'] = empty($json['valid_to'] ?? $this->request->getPost('valid_to')) ? null : ($json['valid_to'] ?? $this->request->getPost('valid_to'));
            }
            if (isset($json['status']) || $this->request->getPost('status') !== null) {
                $data['status'] = $json['status'] ?? $this->request->getPost('status');
            }

            // Validate mutual exclusivity
            $finalProductId = $data['product_id'] ?? $discount['product_id'];
            $finalCategoryId = $data['category_id'] ?? $discount['category_id'];
            if (!empty($finalProductId) && !empty($finalCategoryId)) {
                return $this->error('product_id and category_id cannot both be set. They are mutually exclusive.', null, 400);
            }

            if (empty($data)) {
                return $this->error('No data provided for update', null, 400);
            }

            if (!$this->discountModel->update($id, $data)) {
                return $this->validationError($this->discountModel->errors(), 'Validation failed');
            }

            $updatedDiscount = $this->discountModel->find($id);
            return $this->success($updatedDiscount, 'Discount updated successfully');

        } catch (\Exception $e) {
            log_message('error', '[DiscountController::update] Error: ' . $e->getMessage());
            return $this->error('An error occurred while updating discount: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Delete discount
     * DELETE /api/discounts/:id
     */
    public function delete($id = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only managers and admins can delete discounts');
            }

            $discount = $this->discountModel->find($id);
            if (!$discount) {
                return $this->notFound('Discount not found');
            }

            if (!$this->discountModel->delete($id)) {
                return $this->error('Failed to delete discount', null, 500);
            }

            return $this->success(null, 'Discount deleted successfully');

        } catch (\Exception $e) {
            log_message('error', '[DiscountController::delete] Error: ' . $e->getMessage());
            return $this->error('An error occurred while deleting discount: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get applicable discounts for a transaction
     * GET /api/discounts/applicable?store_id=:storeId&subtotal=:subtotal&transaction_id=:transactionId
     */
    public function getApplicable()
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            $storeId = $this->request->getGet('store_id');
            $subtotal = (float) ($this->request->getGet('subtotal') ?? 0);
            $transactionId = $this->request->getGet('transaction_id');

            if (!$storeId) {
                return $this->error('store_id is required', null, 400);
            }

            $now = date('Y-m-d H:i:s');
            $allDiscounts = [];

            // If transaction_id is provided, get product-specific and category discounts
            if ($transactionId) {
                $transactionModel = new \App\Models\TransactionModel();
                $transaction = $transactionModel->getTransactionWithRelations($transactionId);
                
                if ($transaction && isset($transaction['items'])) {
                    $productIds = [];
                    $categoryIds = [];
                    $productModel = new \App\Models\ProductModel();
                    
                    // Collect product IDs and category IDs from transaction items
                    foreach ($transaction['items'] as $item) {
                        if (isset($item['product_id']) && $item['product_id']) {
                            $productIds[] = (int)$item['product_id'];
                            $product = $productModel->find($item['product_id']);
                            if ($product && isset($product['category_id']) && $product['category_id']) {
                                $categoryIds[] = (int)$product['category_id'];
                            }
                        }
                    }
                    
                    $productIds = array_unique($productIds);
                    $categoryIds = array_unique($categoryIds);
                    
                    // Get product-specific discounts (product_id must NOT be NULL)
                    if (!empty($productIds)) {
                        // Build the query step by step
                        // For product discounts: product_id must be set, category_id must be NULL
                        // Create a completely fresh builder instance
                        $db = \Config\Database::connect();
                        $productDiscountsQuery = $db->table('discounts');
                        
                        $productDiscountsQuery->where('status', 'active')
                            ->where('store_id', $storeId)
                            ->whereIn('product_id', $productIds)
                            ->where('category_id IS NULL', null, false); // Use raw SQL for IS NULL check
                        
                        // Date validation: discount must be currently valid
                        // valid_from must be NULL or <= now (discount has started)
                        // valid_to must be NULL or >= now (discount hasn't expired)
                        $productDiscountsQuery->groupStart()
                            ->where('valid_from IS NULL', null, false)
                            ->orWhere('valid_from <=', $now)
                            ->groupEnd();
                        $productDiscountsQuery->groupStart()
                            ->where('valid_to IS NULL', null, false)
                            ->orWhere('valid_to >=', $now)
                            ->groupEnd();
                        
                        // Min purchase validation
                        if ($subtotal > 0) {
                            $productDiscountsQuery->groupStart()
                                ->where('min_purchase IS NULL', null, false)
                                ->orWhere('min_purchase <=', $subtotal)
                                ->groupEnd();
                        }
                        
                        // Order and execute
                        $productDiscountsQuery->orderBy('value', 'DESC');
                        
                        // Debug: Log the query and parameters
                        log_message('error', '[DiscountController::getApplicable] Product IDs: ' . json_encode($productIds));
                        log_message('error', '[DiscountController::getApplicable] Store ID: ' . $storeId);
                        log_message('error', '[DiscountController::getApplicable] Subtotal: ' . $subtotal);
                        log_message('error', '[DiscountController::getApplicable] Now: ' . $now);
                        log_message('error', '[DiscountController::getApplicable] Category IDs: ' . json_encode($categoryIds));
                        
                        $productDiscounts = $productDiscountsQuery->get()->getResultArray();
                        
                        // Debug logging
                        log_message('error', '[DiscountController::getApplicable] Product discounts found: ' . count($productDiscounts));
                        if (count($productDiscounts) > 0) {
                            log_message('error', '[DiscountController::getApplicable] Product discounts: ' . json_encode($productDiscounts));
                        } else {
                            // Diagnostic queries to find what's filtering out the discounts
                            // Check 1: All product discounts for these products (no filters)
                            $check1Builder = $db->table('discounts');
                            $check1 = $check1Builder
                                ->where('store_id', $storeId)
                                ->whereIn('product_id', $productIds)
                                ->get()->getResultArray();
                            log_message('error', '[DiscountController::getApplicable] Check 1 - All product discounts (no filters): ' . count($check1));
                            if (count($check1) > 0) {
                                log_message('error', '[DiscountController::getApplicable] Check 1 discounts: ' . json_encode($check1));
                            }
                            
                            // Check 2: With status filter
                            $check2Builder = $db->table('discounts');
                            $check2 = $check2Builder
                                ->where('status', 'active')
                                ->where('store_id', $storeId)
                                ->whereIn('product_id', $productIds)
                                ->get()->getResultArray();
                            log_message('error', '[DiscountController::getApplicable] Check 2 - With status=active: ' . count($check2));
                            if (count($check2) > 0) {
                                log_message('error', '[DiscountController::getApplicable] Check 2 discounts: ' . json_encode($check2));
                            }
                            
                            // Check 3: With category_id IS NULL
                            $check3Builder = $db->table('discounts');
                            $check3 = $check3Builder
                                ->where('status', 'active')
                                ->where('store_id', $storeId)
                                ->whereIn('product_id', $productIds)
                                ->where('category_id IS NULL', null, false)
                                ->get()->getResultArray();
                            log_message('error', '[DiscountController::getApplicable] Check 3 - With category_id IS NULL: ' . count($check3));
                            if (count($check3) > 0) {
                                log_message('error', '[DiscountController::getApplicable] Check 3 discounts: ' . json_encode($check3));
                            }
                            
                            // Check 4: With date filters
                            $check4Builder = $db->table('discounts');
                            $check4 = $check4Builder
                                ->where('status', 'active')
                                ->where('store_id', $storeId)
                                ->whereIn('product_id', $productIds)
                                ->where('category_id IS NULL', null, false)
                                ->groupStart()
                                    ->where('valid_from IS NULL', null, false)
                                    ->orWhere('valid_from <=', $now)
                                ->groupEnd()
                                ->groupStart()
                                    ->where('valid_to IS NULL', null, false)
                                    ->orWhere('valid_to >=', $now)
                                ->groupEnd()
                                ->get()->getResultArray();
                            log_message('error', '[DiscountController::getApplicable] Check 4 - With date filters: ' . count($check4));
                            if (count($check4) > 0) {
                                log_message('error', '[DiscountController::getApplicable] Check 4 discounts: ' . json_encode($check4));
                            }
                        }
                        
                        $allDiscounts = array_merge($allDiscounts, $productDiscounts);
                    }
                    
                    // Get category discounts (category_id must NOT be NULL, product_id must be NULL)
                    if (!empty($categoryIds)) {
                        // Create a completely fresh builder instance
                        $db = \Config\Database::connect();
                        $categoryDiscountsBuilder = $db->table('discounts');
                        
                        $categoryDiscountsBuilder->where('status', 'active')
                            ->where('store_id', $storeId)
                            ->where('category_id IS NOT NULL', null, false)
                            ->whereIn('category_id', $categoryIds)
                            ->where('product_id IS NULL', null, false) // Ensure it's category-level, not product-specific
                            ->groupStart()
                                ->where('valid_from IS NULL', null, false)
                                ->orWhere('valid_from <=', $now)
                            ->groupEnd()
                            ->groupStart()
                                ->where('valid_to IS NULL', null, false)
                                ->orWhere('valid_to >=', $now)
                            ->groupEnd();
                        
                        if ($subtotal > 0) {
                            $categoryDiscountsBuilder->groupStart()
                                ->where('min_purchase IS NULL', null, false)
                                ->orWhere('min_purchase <=', $subtotal)
                                ->groupEnd();
                        }
                        
                        $categoryDiscounts = $categoryDiscountsBuilder->orderBy('value', 'DESC')->get()->getResultArray();
                        
                        // Debug logging for category discounts
                        log_message('error', '[DiscountController::getApplicable] Category discounts found: ' . count($categoryDiscounts));
                        if (count($categoryDiscounts) > 0) {
                            log_message('error', '[DiscountController::getApplicable] Category discounts: ' . json_encode($categoryDiscounts));
                        } else {
                            // Diagnostic query for category discounts
                            $catCheckBuilder = $db->table('discounts');
                            $catCheck = $catCheckBuilder
                                ->where('status', 'active')
                                ->where('store_id', $storeId)
                                ->where('category_id IS NOT NULL', null, false)
                                ->whereIn('category_id', $categoryIds)
                                ->where('product_id IS NULL', null, false)
                                ->get()->getResultArray();
                            log_message('error', '[DiscountController::getApplicable] Category check (no date filters): ' . count($catCheck));
                            if (count($catCheck) > 0) {
                                log_message('error', '[DiscountController::getApplicable] Category check discounts: ' . json_encode($catCheck));
                            }
                        }
                        
                        $allDiscounts = array_merge($allDiscounts, $categoryDiscounts);
                    }
                }
            }
            
            // Get store-wide discounts (always include these)
            $db = \Config\Database::connect();
            $storeDiscountsBuilder = $db->table('discounts');
            
            $storeDiscountsBuilder->where('status', 'active')
                ->where('store_id', $storeId)
                ->where('product_id IS NULL', null, false)
                ->where('category_id IS NULL', null, false)
                ->groupStart()
                    ->where('valid_from IS NULL', null, false)
                    ->orWhere('valid_from <=', $now)
                ->groupEnd()
                ->groupStart()
                    ->where('valid_to IS NULL', null, false)
                    ->orWhere('valid_to >=', $now)
                ->groupEnd();
            
            if ($subtotal > 0) {
                $storeDiscountsBuilder->groupStart()
                    ->where('min_purchase IS NULL', null, false)
                    ->orWhere('min_purchase <=', $subtotal)
                    ->groupEnd();
            }
            
            $storeDiscounts = $storeDiscountsBuilder->orderBy('value', 'DESC')->get()->getResultArray();
            $allDiscounts = array_merge($allDiscounts, $storeDiscounts);
            
            // Remove duplicates and sort by priority: product > category > store-wide
            $uniqueDiscounts = [];
            $seenIds = [];
            foreach ($allDiscounts as $discount) {
                if (!in_array($discount['id'], $seenIds)) {
                    $uniqueDiscounts[] = $discount;
                    $seenIds[] = $discount['id'];
                }
            }
            
            // Sort by priority: product discounts first, then category, then store-wide
            usort($uniqueDiscounts, function($a, $b) {
                $priorityA = !empty($a['product_id']) ? 1 : (!empty($a['category_id']) ? 2 : 3);
                $priorityB = !empty($b['product_id']) ? 1 : (!empty($b['category_id']) ? 2 : 3);
                
                if ($priorityA !== $priorityB) {
                    return $priorityA - $priorityB;
                }
                
                // If same priority, sort by value descending
                return (float)$b['value'] <=> (float)$a['value'];
            });
            
            return $this->success($uniqueDiscounts, 'Applicable discounts retrieved successfully');

        } catch (\Exception $e) {
            log_message('error', '[DiscountController::getApplicable] Error: ' . $e->getMessage());
            return $this->error('An error occurred while retrieving applicable discounts: ' . $e->getMessage(), null, 500);
        }
    }
}

