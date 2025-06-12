<?php

namespace App\Controllers\Api;

use App\Models\TransactionModel;
use App\Models\TransactionItemModel;
use App\Models\CustomerModel;
use App\Models\PaymentModel;
use App\Models\ReceiptModel;
use App\Models\StoreModel;
use App\Models\ProductModel;
use App\Models\InventoryModel;
use App\Models\DiscountModel;
use App\Models\TransactionDiscountModel;
use CodeIgniter\HTTP\ResponseInterface;

class TransactionController extends BaseApiController
{
    protected $transactionModel;
    protected $transactionItemModel;
    protected $customerModel;
    protected $paymentModel;
    protected $receiptModel;
    protected $storeModel;
    protected $productModel;
    protected $inventoryModel;
    protected $discountModel;
    protected $transactionDiscountModel;

    public function __construct()
    {
        parent::__construct();
        $this->transactionModel = new TransactionModel();
        $this->transactionItemModel = new TransactionItemModel();
        $this->customerModel = new CustomerModel();
        $this->paymentModel = new PaymentModel();
        $this->receiptModel = new ReceiptModel();
        $this->storeModel = new StoreModel();
        $this->productModel = new ProductModel();
        $this->inventoryModel = new InventoryModel();
        $this->discountModel = new DiscountModel();
        $this->transactionDiscountModel = new TransactionDiscountModel();
    }

    /**
     * Start a new transaction
     * POST /api/transactions/start
     */
    public function start()
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            // Only cashiers can start transactions
            if ($userRole !== 'cashier') {
                return $this->forbidden('Only cashiers can start transactions');
            }

            $json = $this->request->getJSON(true);
            $storeId = $json['store_id'] ?? $this->request->getPost('store_id');

            if (!$storeId) {
                return $this->error('Store ID is required', null, 400);
            }

            // Verify store access
            if (!$this->storeModel->hasAccess((int) $storeId, (int) $userId, $userRole)) {
                return $this->forbidden('You do not have access to this store');
            }

            // Create new transaction
            $transactionData = [
                'store_id'   => $storeId,
                'cashier_id' => $userId,
                'status'     => 'pending',
                'subtotal'   => 0,
                'tax_amount' => 0,
                'discount_amount' => 0,
                'total_amount' => 0,
            ];

            $transactionId = $this->transactionModel->insert($transactionData);

            if (!$transactionId) {
                return $this->error('Failed to create transaction', $this->transactionModel->errors(), 500);
            }

            $transaction = $this->transactionModel->getTransactionWithDetails($transactionId);
            return $this->success($transaction, 'Transaction started successfully', 201);

        } catch (\Exception $e) {
            log_message('error', '[TransactionController::start] Error: ' . $e->getMessage());
            return $this->error('An error occurred while starting transaction: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Add item to transaction
     * POST /api/transactions/:id/items
     */
    public function addItem($transactionId = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            $transaction = $this->transactionModel->find($transactionId);
            if (!$transaction) {
                return $this->notFound('Transaction not found');
            }

            // Verify access
            if ($transaction['cashier_id'] != $userId && $userRole !== 'admin') {
                return $this->forbidden('You can only modify your own transactions');
            }

            if ($transaction['status'] !== 'pending') {
                return $this->error('Cannot modify completed transaction', null, 400);
            }

            $json = $this->request->getJSON(true);
            $productId = $json['product_id'] ?? $this->request->getPost('product_id');
            $variantId = $json['variant_id'] ?? $this->request->getPost('variant_id');
            $quantity = $json['quantity'] ?? $this->request->getPost('quantity') ?? 1;

            if (!$productId) {
                return $this->error('Product ID is required', null, 400);
            }

            // Get product
            $product = $this->productModel->getProductWithDetails($productId);
            if (!$product) {
                return $this->notFound('Product not found');
            }

            // Calculate unit price
            $unitPrice = $product['base_price'];
            if ($variantId && isset($product['variants'])) {
                foreach ($product['variants'] as $variant) {
                    if ($variant['id'] == $variantId) {
                        $unitPrice += $variant['price_adjustment'];
                        break;
                    }
                }
            }

            // Check inventory
            $inventoryItem = $this->inventoryModel->getInventoryItem(
                $transaction['store_id'],
                $productId,
                $variantId ?: null
            );

            if (!$inventoryItem || $inventoryItem['quantity'] < $quantity) {
                return $this->error('Insufficient inventory', null, 400);
            }

            // Create transaction item
            $itemData = [
                'transaction_id'  => $transactionId,
                'product_id'      => $productId,
                'variant_id'      => $variantId ?: null,
                'quantity'        => $quantity,
                'unit_price'      => $unitPrice,
                'discount_amount' => 0,
                'tax_amount'      => 0,
            ];

            $itemId = $this->transactionItemModel->insert($itemData);

            if (!$itemId) {
                return $this->error('Failed to add item', $this->transactionItemModel->errors(), 500);
            }

            // Recalculate totals
            $totals = $this->transactionModel->calculateTotals($transactionId);
            $this->transactionModel->update($transactionId, $totals);

            $item = $this->transactionItemModel->find($itemId);
            return $this->success($item, 'Item added successfully', 201);

        } catch (\Exception $e) {
            log_message('error', '[TransactionController::addItem] Error: ' . $e->getMessage());
            return $this->error('An error occurred while adding item: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Update transaction item
     * PUT /api/transactions/:id/items/:itemId
     */
    public function updateItem($transactionId = null, $itemId = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            $transaction = $this->transactionModel->find($transactionId);
            if (!$transaction) {
                return $this->notFound('Transaction not found');
            }

            if ($transaction['status'] !== 'pending') {
                return $this->error('Cannot modify completed transaction', null, 400);
            }

            $item = $this->transactionItemModel->find($itemId);
            if (!$item || $item['transaction_id'] != $transactionId) {
                return $this->notFound('Transaction item not found');
            }

            $json = $this->request->getJSON(true);
            $quantity = $json['quantity'] ?? $this->request->getPost('quantity');
            $discountAmount = $json['discount_amount'] ?? $this->request->getPost('discount_amount');

            $updateData = [];
            if ($quantity !== null) {
                // Check inventory
                $inventoryItem = $this->inventoryModel->getInventoryItem(
                    $transaction['store_id'],
                    $item['product_id'],
                    $item['variant_id'] ?: null
                );

                if (!$inventoryItem || $inventoryItem['quantity'] < $quantity) {
                    return $this->error('Insufficient inventory', null, 400);
                }
                $updateData['quantity'] = $quantity;
            }
            if ($discountAmount !== null) {
                $updateData['discount_amount'] = $discountAmount;
            }

            if (empty($updateData)) {
                return $this->error('No data provided for update', null, 400);
            }

            if (!$this->transactionItemModel->update($itemId, $updateData)) {
                return $this->error('Failed to update item', $this->transactionItemModel->errors(), 500);
            }

            // Recalculate totals
            $totals = $this->transactionModel->calculateTotals($transactionId);
            $this->transactionModel->update($transactionId, $totals);

            $updatedItem = $this->transactionItemModel->find($itemId);
            return $this->success($updatedItem, 'Item updated successfully');

        } catch (\Exception $e) {
            log_message('error', '[TransactionController::updateItem] Error: ' . $e->getMessage());
            return $this->error('An error occurred while updating item: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Remove item from transaction
     * DELETE /api/transactions/:id/items/:itemId
     */
    public function removeItem($transactionId = null, $itemId = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            $transaction = $this->transactionModel->find($transactionId);
            if (!$transaction) {
                return $this->notFound('Transaction not found');
            }

            if ($transaction['status'] !== 'pending') {
                return $this->error('Cannot modify completed transaction', null, 400);
            }

            $item = $this->transactionItemModel->find($itemId);
            if (!$item || $item['transaction_id'] != $transactionId) {
                return $this->notFound('Transaction item not found');
            }

            if (!$this->transactionItemModel->delete($itemId)) {
                return $this->error('Failed to remove item', null, 500);
            }

            // Recalculate totals
            $totals = $this->transactionModel->calculateTotals($transactionId);
            $this->transactionModel->update($transactionId, $totals);

            return $this->success(null, 'Item removed successfully');

        } catch (\Exception $e) {
            log_message('error', '[TransactionController::removeItem] Error: ' . $e->getMessage());
            return $this->error('An error occurred while removing item: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get transaction totals
     * GET /api/transactions/:id/totals
     */
    public function getTotals($transactionId = null)
    {
        try {
            $transaction = $this->transactionModel->find($transactionId);
            if (!$transaction) {
                return $this->notFound('Transaction not found');
            }

            $totals = $this->transactionModel->calculateTotals($transactionId);
            return $this->success($totals, 'Totals calculated successfully');

        } catch (\Exception $e) {
            log_message('error', '[TransactionController::getTotals] Error: ' . $e->getMessage());
            return $this->error('An error occurred while calculating totals: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Add customer to transaction
     * POST /api/transactions/:id/customer
     */
    public function addCustomer($transactionId = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            $transaction = $this->transactionModel->find($transactionId);
            if (!$transaction) {
                return $this->notFound('Transaction not found');
            }

            if ($transaction['status'] !== 'pending') {
                return $this->error('Cannot modify completed transaction', null, 400);
            }

            $json = $this->request->getJSON(true);
            $customerId = $json['customer_id'] ?? $this->request->getPost('customer_id');

            if (!$customerId) {
                return $this->error('Customer ID is required', null, 400);
            }

            $customer = $this->customerModel->find($customerId);
            if (!$customer) {
                return $this->notFound('Customer not found');
            }

            if (!$this->transactionModel->update($transactionId, ['customer_id' => $customerId])) {
                return $this->error('Failed to add customer', $this->transactionModel->errors(), 500);
            }

            $updatedTransaction = $this->transactionModel->getTransactionWithRelations($transactionId);
            return $this->success($updatedTransaction, 'Customer added successfully');

        } catch (\Exception $e) {
            log_message('error', '[TransactionController::addCustomer] Error: ' . $e->getMessage());
            return $this->error('An error occurred while adding customer: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Remove customer from transaction
     * DELETE /api/transactions/:id/customer
     */
    public function removeCustomer($transactionId = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            $transaction = $this->transactionModel->find($transactionId);
            if (!$transaction) {
                return $this->notFound('Transaction not found');
            }

            if ($transaction['status'] !== 'pending') {
                return $this->error('Cannot modify completed transaction', null, 400);
            }

            if (!$this->transactionModel->update($transactionId, ['customer_id' => null])) {
                return $this->error('Failed to remove customer', $this->transactionModel->errors(), 500);
            }

            $updatedTransaction = $this->transactionModel->getTransactionWithRelations($transactionId);
            return $this->success($updatedTransaction, 'Customer removed successfully');

        } catch (\Exception $e) {
            log_message('error', '[TransactionController::removeCustomer] Error: ' . $e->getMessage());
            return $this->error('An error occurred while removing customer: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Process payment
     * POST /api/transactions/:id/payment
     */
    public function processPayment($transactionId = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            $transaction = $this->transactionModel->find($transactionId);
            if (!$transaction) {
                return $this->notFound('Transaction not found');
            }

            if ($transaction['status'] !== 'pending') {
                return $this->error('Transaction is not pending', null, 400);
            }

            $json = $this->request->getJSON(true);
            $paymentMethod = $json['payment_method'] ?? $this->request->getPost('payment_method') ?? 'cash';
            $amount = $json['amount'] ?? $this->request->getPost('amount');
            $referenceNumber = $json['reference_number'] ?? $this->request->getPost('reference_number');

            if (!$amount || $amount < $transaction['total_amount']) {
                return $this->error('Payment amount must be at least the total amount', null, 400);
            }

            $changeAmount = $amount - $transaction['total_amount'];

            // Create payment record
            $paymentData = [
                'transaction_id'   => $transactionId,
                'payment_method'   => $paymentMethod,
                'amount'           => $amount,
                'change_amount'    => $changeAmount,
                'status'           => 'completed',
                'reference_number' => $referenceNumber,
            ];

            $paymentId = $this->paymentModel->insert($paymentData);

            if (!$paymentId) {
                return $this->error('Failed to process payment', $this->paymentModel->errors(), 500);
            }

            $payment = $this->paymentModel->find($paymentId);
            return $this->success($payment, 'Payment processed successfully', 201);

        } catch (\Exception $e) {
            log_message('error', '[TransactionController::processPayment] Error: ' . $e->getMessage());
            return $this->error('An error occurred while processing payment: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Complete transaction
     * POST /api/transactions/:id/complete
     */
    public function complete($transactionId = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            $transaction = $this->transactionModel->find($transactionId);
            if (!$transaction) {
                return $this->notFound('Transaction not found');
            }

            if ($transaction['status'] !== 'pending') {
                return $this->error('Transaction is not pending', null, 400);
            }

            // Check if payment is completed
            $totalPaid = $this->paymentModel->getTotalPayment($transactionId);
            if ($totalPaid < $transaction['total_amount']) {
                return $this->error('Transaction is not fully paid', null, 400);
            }

            // Deduct inventory
            $items = $this->transactionItemModel->where('transaction_id', $transactionId)->findAll();
            foreach ($items as $item) {
                $inventoryItem = $this->inventoryModel->getInventoryItem(
                    $transaction['store_id'],
                    $item['product_id'],
                    $item['variant_id'] ?: null
                );

                if ($inventoryItem) {
                    $this->inventoryModel->adjustQuantity(
                        $inventoryItem['id'],
                        -$item['quantity'],
                        'sale',
                        'Sale transaction #' . $transaction['transaction_number'],
                        $userId
                    );
                }
            }

            // Update transaction status
            $this->transactionModel->update($transactionId, ['status' => 'completed']);

            // Generate receipt
            $receiptData = [
                'transaction_id' => $transactionId,
                'receipt_data'  => json_encode($this->transactionModel->getTransactionWithDetails($transactionId)),
            ];
            $this->receiptModel->insert($receiptData);

            $completedTransaction = $this->transactionModel->getTransactionWithDetails($transactionId);
            return $this->success($completedTransaction, 'Transaction completed successfully');

        } catch (\Exception $e) {
            log_message('error', '[TransactionController::complete] Error: ' . $e->getMessage());
            return $this->error('An error occurred while completing transaction: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Void transaction
     * POST /api/transactions/:id/void
     */
    public function void($transactionId = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            // Only admin and manager can void transactions
            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only administrators and managers can void transactions');
            }

            $transaction = $this->transactionModel->find($transactionId);
            if (!$transaction) {
                return $this->notFound('Transaction not found');
            }

            if ($transaction['status'] === 'voided') {
                return $this->error('Transaction is already voided', null, 400);
            }

            if ($transaction['status'] === 'completed') {
                // Restore inventory
                $items = $this->transactionItemModel->where('transaction_id', $transactionId)->findAll();
                foreach ($items as $item) {
                    $inventoryItem = $this->inventoryModel->getInventoryItem(
                        $transaction['store_id'],
                        $item['product_id'],
                        $item['variant_id'] ?: null
                    );

                    if ($inventoryItem) {
                        $this->inventoryModel->adjustQuantity(
                            $inventoryItem['id'],
                            $item['quantity'],
                            'return',
                            'Void transaction #' . $transaction['transaction_number'],
                            $userId
                        );
                    }
                }
            }

            // Update transaction status
            $this->transactionModel->update($transactionId, ['status' => 'voided']);

            $voidedTransaction = $this->transactionModel->find($transactionId);
            return $this->success($voidedTransaction, 'Transaction voided successfully');

        } catch (\Exception $e) {
            log_message('error', '[TransactionController::void] Error: ' . $e->getMessage());
            return $this->error('An error occurred while voiding transaction: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * List transactions
     * GET /api/transactions
     */
    public function index()
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            $page = (int) ($this->request->getGet('page') ?? 1);
            $perPage = (int) ($this->request->getGet('per_page') ?? 10);

            $filters = [];
            if ($this->request->getGet('store_id')) {
                $filters['store_id'] = $this->request->getGet('store_id');
            }
            if ($this->request->getGet('cashier_id')) {
                $filters['cashier_id'] = $this->request->getGet('cashier_id');
            }
            if ($this->request->getGet('customer_id')) {
                $filters['customer_id'] = $this->request->getGet('customer_id');
            }
            if ($this->request->getGet('status')) {
                $filters['status'] = $this->request->getGet('status');
            }
            if ($this->request->getGet('transaction_number')) {
                $filters['transaction_number'] = $this->request->getGet('transaction_number');
            }
            if ($this->request->getGet('date_from')) {
                $filters['date_from'] = $this->request->getGet('date_from');
            }
            if ($this->request->getGet('date_to')) {
                $filters['date_to'] = $this->request->getGet('date_to');
            }

            // Cashiers can only see their own transactions
            if ($userRole === 'cashier') {
                $filters['cashier_id'] = $userId;
            }

            $builder = $this->transactionModel->getTransactionsWithFilters($filters);
            $total = $builder->countAllResults(false);

            $transactions = $builder->orderBy('created_at', 'DESC')
                                    ->limit($perPage, ($page - 1) * $perPage)
                                    ->get()
                                    ->getResultArray();

            return $this->success([
                'data' => $transactions,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => $total,
                    'last_page' => $perPage > 0 ? (int) ceil($total / $perPage) : 1,
                ],
            ], 'Transactions retrieved successfully');

        } catch (\Exception $e) {
            log_message('error', '[TransactionController::index] Error: ' . $e->getMessage());
            return $this->error('An error occurred while fetching transactions: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get transaction details
     * GET /api/transactions/:id
     */
    public function show($transactionId = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            $transaction = $this->transactionModel->getTransactionWithDetails($transactionId);

            if (!$transaction) {
                return $this->notFound('Transaction not found');
            }

            // Cashiers can only see their own transactions
            if ($userRole === 'cashier' && $transaction['cashier_id'] != $userId) {
                return $this->forbidden('You can only view your own transactions');
            }

            return $this->success($transaction, 'Transaction retrieved successfully');

        } catch (\Exception $e) {
            log_message('error', '[TransactionController::show] Error: ' . $e->getMessage());
            return $this->error('An error occurred while fetching transaction: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Apply discount to transaction
     * POST /api/transactions/:id/discounts
     */
    public function applyDiscount($transactionId = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            $transaction = $this->transactionModel->find($transactionId);
            if (!$transaction) {
                return $this->notFound('Transaction not found');
            }

            if ($transaction['status'] !== 'pending') {
                return $this->error('Cannot modify completed transaction', null, 400);
            }

            $json = $this->request->getJSON(true);
            $discountId = $json['discount_id'] ?? $this->request->getPost('discount_id');
            $manualAmount = isset($json['manual_amount']) ? (float) $json['manual_amount'] : null;

            if (!$discountId && !$manualAmount) {
                return $this->error('Either discount_id or manual_amount is required', null, 400);
            }

            // If manual amount, require manager/admin role
            if ($manualAmount !== null && !in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only managers and admins can apply manual discounts');
            }

            $appliedAmount = 0;

            if ($discountId) {
                $discount = $this->discountModel->find($discountId);
                if (!$discount) {
                    return $this->notFound('Discount not found');
                }

                // Validate discount eligibility
                $subtotal = (float) $transaction['subtotal'];
                if (!$this->discountModel->isEligible($discount, $subtotal)) {
                    return $this->error('Discount is not eligible for this transaction', null, 400);
                }

                // Calculate discount amount
                $appliedAmount = $this->discountModel->calculateDiscountAmount($discount, $subtotal);
            } else {
                $appliedAmount = $manualAmount;
            }

            // Check if discount already applied (only for discount_id, not manual)
            if ($discountId) {
                $existingDiscount = $this->transactionDiscountModel
                    ->where('transaction_id', $transactionId)
                    ->where('discount_id', $discountId)
                    ->first();

                if ($existingDiscount) {
                    return $this->error('Discount already applied to this transaction', null, 400);
                }
            }

            // Apply discount
            $transactionDiscountData = [
                'transaction_id' => $transactionId,
                'applied_amount' => number_format($appliedAmount, 2, '.', ''),
                'created_at' => date('Y-m-d H:i:s'),
            ];
            
            // Only add discount_id if it's provided (not manual discount)
            if ($discountId) {
                $transactionDiscountData['discount_id'] = $discountId;
            }

            // Skip validation for manual discounts (discount_id is null)
            if (!$discountId) {
                $this->transactionDiscountModel->skipValidation(true);
            }
            
            if (!$this->transactionDiscountModel->insert($transactionDiscountData)) {
                // Re-enable validation
                $this->transactionDiscountModel->skipValidation(false);
                return $this->error('Failed to apply discount', $this->transactionDiscountModel->errors(), 500);
            }
            
            // Re-enable validation
            $this->transactionDiscountModel->skipValidation(false);

            // Recalculate totals
            $totals = $this->transactionModel->calculateTotals($transactionId);
            $this->transactionModel->update($transactionId, $totals);

            $updatedTransaction = $this->transactionModel->getTransactionWithRelations($transactionId);
            return $this->success($updatedTransaction, 'Discount applied successfully');

        } catch (\Exception $e) {
            log_message('error', '[TransactionController::applyDiscount] Error: ' . $e->getMessage());
            return $this->error('An error occurred while applying discount: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Remove discount from transaction
     * DELETE /api/transactions/:id/discounts/:discountId
     */
    public function removeDiscount($transactionId = null, $discountId = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            $transaction = $this->transactionModel->find($transactionId);
            if (!$transaction) {
                return $this->notFound('Transaction not found');
            }

            if ($transaction['status'] !== 'pending') {
                return $this->error('Cannot modify completed transaction', null, 400);
            }

            $transactionDiscount = $this->transactionDiscountModel
                ->where('transaction_id', $transactionId)
                ->where('discount_id', $discountId)
                ->first();

            if (!$transactionDiscount) {
                return $this->notFound('Discount not found on this transaction');
            }

            if (!$this->transactionDiscountModel->delete($transactionDiscount['id'])) {
                return $this->error('Failed to remove discount', null, 500);
            }

            // Recalculate totals
            $totals = $this->transactionModel->calculateTotals($transactionId);
            $this->transactionModel->update($transactionId, $totals);

            $updatedTransaction = $this->transactionModel->getTransactionWithRelations($transactionId);
            return $this->success($updatedTransaction, 'Discount removed successfully');

        } catch (\Exception $e) {
            log_message('error', '[TransactionController::removeDiscount] Error: ' . $e->getMessage());
            return $this->error('An error occurred while removing discount: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Apply price override (Manager only)
     * PUT /api/transactions/:id/items/:itemId/price-override
     */
    public function priceOverride($transactionId = null, $itemId = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only managers and admins can override prices');
            }

            $transaction = $this->transactionModel->find($transactionId);
            if (!$transaction) {
                return $this->notFound('Transaction not found');
            }

            if ($transaction['status'] !== 'pending') {
                return $this->error('Cannot modify completed transaction', null, 400);
            }

            $item = $this->transactionItemModel->find($itemId);
            if (!$item || $item['transaction_id'] != $transactionId) {
                return $this->notFound('Transaction item not found');
            }

            $json = $this->request->getJSON(true);
            $newPrice = isset($json['unit_price']) ? (float) $json['unit_price'] : ((float) $this->request->getPost('unit_price') ?: null);

            if ($newPrice === null || $newPrice < 0) {
                return $this->error('Valid unit_price is required', null, 400);
            }

            // Calculate new line total
            $lineTotal = $newPrice * $item['quantity'];
            
            // Update item price
            if (!$this->transactionItemModel->update($itemId, [
                'unit_price' => number_format($newPrice, 2, '.', ''),
                'line_total' => number_format($lineTotal, 2, '.', ''),
            ])) {
                return $this->error('Failed to update price', $this->transactionItemModel->errors(), 500);
            }

            // Recalculate totals
            $totals = $this->transactionModel->calculateTotals($transactionId);
            $this->transactionModel->update($transactionId, $totals);

            $updatedItem = $this->transactionItemModel->find($itemId);
            return $this->success($updatedItem, 'Price overridden successfully');

        } catch (\Exception $e) {
            log_message('error', '[TransactionController::priceOverride] Error: ' . $e->getMessage());
            return $this->error('An error occurred while overriding price: ' . $e->getMessage(), null, 500);
        }
    }
}

