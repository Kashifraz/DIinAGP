<?php

namespace App\Controllers\Api;

use App\Models\TransactionModel;
use App\Models\ReceiptModel;
use App\Models\StoreModel;
use CodeIgniter\HTTP\ResponseInterface;

class ReceiptController extends BaseApiController
{
    protected $transactionModel;
    protected $receiptModel;
    protected $storeModel;

    public function __construct()
    {
        parent::__construct();
        helper('receipt'); // Load receipt helper
        $this->transactionModel = new TransactionModel();
        $this->receiptModel = new ReceiptModel();
        $this->storeModel = new StoreModel();
    }

    /**
     * Get receipt data for a transaction
     * GET /api/transactions/:id/receipt
     */
    public function getReceipt($transactionId = null)
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
                return $this->forbidden('You can only view receipts for your own transactions');
            }

            // Get or create receipt
            $receipt = $this->receiptModel->getReceiptByTransaction($transactionId);

            // Get store for receipt generation
            $store = $this->storeModel->find($transaction['store_id']);
            helper('receipt'); // Ensure helper is loaded

            if (!$receipt) {
                // Generate receipt if it doesn't exist
                $receiptData = generate_receipt_data($transaction, $store);

                // Create receipt record
                $receiptRecord = [
                    'transaction_id' => $transactionId,
                    'receipt_data' => json_encode($receiptData),
                ];
                $receiptId = $this->receiptModel->insert($receiptRecord);
                $receipt = $this->receiptModel->find($receiptId);
                
                // Add receipt number to data if it exists
                if ($receipt && isset($receipt['receipt_number'])) {
                    $receiptData['receipt_number'] = $receipt['receipt_number'];
                }
            } else {
                // Decode receipt data if exists
                $receiptData = null;
                if (isset($receipt['receipt_data']) && !empty($receipt['receipt_data'])) {
                    $decoded = json_decode($receipt['receipt_data'], true);
                    if ($decoded !== null && is_array($decoded)) {
                        $receiptData = $decoded;
                    }
                }
                
                if (!$receiptData) {
                    // If receipt_data is invalid or missing, regenerate
                    $receiptData = generate_receipt_data($transaction, $store);
                    
                    // Update receipt
                    $this->receiptModel->update($receipt['id'], [
                        'receipt_data' => json_encode($receiptData),
                    ]);
                }
                
                // Add receipt number to data if it exists
                if (isset($receipt['receipt_number'])) {
                    $receiptData['receipt_number'] = $receipt['receipt_number'];
                }
            }

            return $this->success($receiptData, 'Receipt retrieved successfully');

        } catch (\Exception $e) {
            log_message('error', '[ReceiptController::getReceipt] Error: ' . $e->getMessage());
            return $this->error('An error occurred while fetching receipt: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get receipt as HTML
     * GET /api/transactions/:id/receipt/html
     */
    public function getReceiptHtml($transactionId = null)
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
                return $this->forbidden('You can only view receipts for your own transactions');
            }

            $store = $this->storeModel->find($transaction['store_id']);
            $receiptData = generate_receipt_data($transaction, $store);

            // Get receipt number if exists
            $receipt = $this->receiptModel->getReceiptByTransaction($transactionId);
            if ($receipt) {
                $receiptData['receipt_number'] = $receipt['receipt_number'];
            }

            $html = format_receipt_html($receiptData);

            $response = service('response');
            return $response->setContentType('text/html')->setBody($html);

        } catch (\Exception $e) {
            log_message('error', '[ReceiptController::getReceiptHtml] Error: ' . $e->getMessage());
            return $this->error('An error occurred while generating receipt HTML: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get receipt as plain text (for thermal printers)
     * GET /api/transactions/:id/receipt/text
     */
    public function getReceiptText($transactionId = null)
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
                return $this->forbidden('You can only view receipts for your own transactions');
            }

            $store = $this->storeModel->find($transaction['store_id']);
            $receiptData = generate_receipt_data($transaction, $store);

            // Get receipt number if exists
            $receipt = $this->receiptModel->getReceiptByTransaction($transactionId);
            if ($receipt) {
                $receiptData['receipt_number'] = $receipt['receipt_number'];
            }

            $text = format_receipt_text($receiptData);

            $response = service('response');
            return $response->setContentType('text/plain')->setBody($text);

        } catch (\Exception $e) {
            log_message('error', '[ReceiptController::getReceiptText] Error: ' . $e->getMessage());
            return $this->error('An error occurred while generating receipt text: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Regenerate receipt for a transaction
     * POST /api/transactions/:id/receipt/regenerate
     */
    public function regenerateReceipt($transactionId = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            // Only admin and manager can regenerate receipts
            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only administrators and managers can regenerate receipts');
            }

            $transaction = $this->transactionModel->getTransactionWithDetails($transactionId);

            if (!$transaction) {
                return $this->notFound('Transaction not found');
            }

            $store = $this->storeModel->find($transaction['store_id']);
            $receiptData = generate_receipt_data($transaction, $store);

            // Update or create receipt
            $receipt = $this->receiptModel->getReceiptByTransaction($transactionId);

            if ($receipt) {
                $this->receiptModel->update($receipt['id'], [
                    'receipt_data' => json_encode($receiptData),
                ]);
                if (isset($receipt['receipt_number'])) {
                    $receiptData['receipt_number'] = $receipt['receipt_number'];
                }
            } else {
                $receiptRecord = [
                    'transaction_id' => $transactionId,
                    'receipt_data' => json_encode($receiptData),
                ];
                $receiptId = $this->receiptModel->insert($receiptRecord);
                $receipt = $this->receiptModel->find($receiptId);
                if ($receipt && isset($receipt['receipt_number'])) {
                    $receiptData['receipt_number'] = $receipt['receipt_number'];
                }
            }

            return $this->success($receiptData, 'Receipt regenerated successfully');

        } catch (\Exception $e) {
            log_message('error', '[ReceiptController::regenerateReceipt] Error: ' . $e->getMessage());
            return $this->error('An error occurred while regenerating receipt: ' . $e->getMessage(), null, 500);
        }
    }
}

