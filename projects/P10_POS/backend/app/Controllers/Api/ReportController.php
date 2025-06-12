<?php

namespace App\Controllers\Api;

use App\Models\TransactionModel;
use App\Models\TransactionItemModel;
use App\Models\InventoryModel;
use App\Models\ExpenseModel;
use App\Models\StoreModel;
use App\Models\ProductModel;
use App\Models\UserModel;
use CodeIgniter\HTTP\ResponseInterface;

class ReportController extends BaseApiController
{
    protected $transactionModel;
    protected $transactionItemModel;
    protected $inventoryModel;
    protected $expenseModel;
    protected $storeModel;
    protected $productModel;
    protected $userModel;

    public function __construct()
    {
        $this->transactionModel = new TransactionModel();
        $this->transactionItemModel = new TransactionItemModel();
        $this->inventoryModel = new InventoryModel();
        $this->expenseModel = new ExpenseModel();
        $this->storeModel = new StoreModel();
        $this->productModel = new ProductModel();
        $this->userModel = new UserModel();
    }

    /**
     * Get accessible store IDs for the current user
     */
    protected function getAccessibleStoreIds(int $userId, string $userRole): array
    {
        if ($userRole === 'admin') {
            $stores = $this->storeModel->findAll();
            return array_column($stores, 'id');
        } else {
            $accessibleStores = $this->storeModel->getAccessibleStores($userId, $userRole);
            return array_column($accessibleStores, 'id');
        }
    }

    /**
     * Sales Report
     * GET /api/reports/sales
     */
    public function sales()
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only managers and admins can view sales reports');
            }

            $storeId = $this->request->getGet('store_id');
            $startDate = $this->request->getGet('start_date');
            $endDate = $this->request->getGet('end_date');
            $groupBy = $this->request->getGet('group_by') ?? 'day'; // day, week, month, product, category, cashier

            $accessibleStoreIds = $this->getAccessibleStoreIds($userId, $userRole);

            if ($storeId && !in_array((int)$storeId, $accessibleStoreIds)) {
                return $this->forbidden('You do not have access to this store');
            }

            $storeIds = $storeId ? [(int)$storeId] : $accessibleStoreIds;

            $builder = $this->transactionModel->builder();
            $builder->where('status', 'completed');
            $builder->whereIn('store_id', $storeIds);

            if ($startDate) {
                $builder->where('DATE(created_at) >=', $startDate);
            }
            if ($endDate) {
                $builder->where('DATE(created_at) <=', $endDate);
            }

            $transactions = $builder->get()->getResultArray();

            $report = [
                'summary' => [
                    'total_transactions' => count($transactions),
                    'total_revenue' => '0.00',
                    'total_subtotal' => '0.00',
                    'total_tax' => '0.00',
                    'total_discount' => '0.00',
                ],
                'by_date' => [],
                'by_store' => [],
                'by_product' => [],
                'by_category' => [],
                'by_cashier' => [],
            ];

            $totalRevenue = 0;
            $totalSubtotal = 0;
            $totalTax = 0;
            $totalDiscount = 0;

            foreach ($transactions as $transaction) {
                $totalRevenue += (float) $transaction['total_amount'];
                $totalSubtotal += (float) $transaction['subtotal'];
                $totalTax += (float) $transaction['tax_amount'];
                $totalDiscount += (float) $transaction['discount_amount'];

                // Group by date
                $date = date('Y-m-d', strtotime($transaction['created_at']));
                if (!isset($report['by_date'][$date])) {
                    $report['by_date'][$date] = [
                        'date' => $date,
                        'transactions' => 0,
                        'revenue' => 0,
                    ];
                }
                $report['by_date'][$date]['transactions']++;
                $report['by_date'][$date]['revenue'] += (float) $transaction['total_amount'];

                // Group by store
                $storeIdKey = $transaction['store_id'];
                if (!isset($report['by_store'][$storeIdKey])) {
                    $store = $this->storeModel->find($storeIdKey);
                    $report['by_store'][$storeIdKey] = [
                        'store_id' => $storeIdKey,
                        'store_name' => $store['name'] ?? 'Unknown',
                        'transactions' => 0,
                        'revenue' => 0,
                    ];
                }
                $report['by_store'][$storeIdKey]['transactions']++;
                $report['by_store'][$storeIdKey]['revenue'] += (float) $transaction['total_amount'];

                // Group by cashier
                $cashierId = $transaction['cashier_id'];
                if (!isset($report['by_cashier'][$cashierId])) {
                    $cashier = $this->userModel->find($cashierId);
                    $report['by_cashier'][$cashierId] = [
                        'cashier_id' => $cashierId,
                        'cashier_name' => $cashier['username'] ?? 'Unknown',
                        'transactions' => 0,
                        'revenue' => 0,
                    ];
                }
                $report['by_cashier'][$cashierId]['transactions']++;
                $report['by_cashier'][$cashierId]['revenue'] += (float) $transaction['total_amount'];
            }

            // Get product and category data from transaction items
            $transactionIds = array_column($transactions, 'id');
            if (!empty($transactionIds)) {
                $items = $this->transactionItemModel->builder()
                    ->whereIn('transaction_id', $transactionIds)
                    ->get()
                    ->getResultArray();

                foreach ($items as $item) {
                    $product = $this->productModel->find($item['product_id']);
                    if ($product) {
                        // Group by product
                        $productId = $item['product_id'];
                        if (!isset($report['by_product'][$productId])) {
                            $report['by_product'][$productId] = [
                                'product_id' => $productId,
                                'product_name' => $product['name'],
                                'quantity_sold' => 0,
                                'revenue' => 0,
                            ];
                        }
                        $report['by_product'][$productId]['quantity_sold'] += $item['quantity'];
                        $report['by_product'][$productId]['revenue'] += (float) $item['line_total'];

                        // Group by category
                        if ($product['category_id']) {
                            $categoryId = $product['category_id'];
                            if (!isset($report['by_category'][$categoryId])) {
                                $categoryModel = new \App\Models\ProductCategoryModel();
                                $category = $categoryModel->find($categoryId);
                                $report['by_category'][$categoryId] = [
                                    'category_id' => $categoryId,
                                    'category_name' => $category['name'] ?? 'Unknown',
                                    'quantity_sold' => 0,
                                    'revenue' => 0,
                                ];
                            }
                            $report['by_category'][$categoryId]['quantity_sold'] += $item['quantity'];
                            $report['by_category'][$categoryId]['revenue'] += (float) $item['line_total'];
                        }
                    }
                }
            }

            $report['summary']['total_revenue'] = number_format($totalRevenue, 2, '.', '');
            $report['summary']['total_subtotal'] = number_format($totalSubtotal, 2, '.', '');
            $report['summary']['total_tax'] = number_format($totalTax, 2, '.', '');
            $report['summary']['total_discount'] = number_format($totalDiscount, 2, '.', '');

            // Format revenue in grouped data
            foreach ($report['by_date'] as &$dateData) {
                $dateData['revenue'] = number_format($dateData['revenue'], 2, '.', '');
            }
            foreach ($report['by_store'] as &$storeData) {
                $storeData['revenue'] = number_format($storeData['revenue'], 2, '.', '');
            }
            foreach ($report['by_product'] as &$productData) {
                $productData['revenue'] = number_format($productData['revenue'], 2, '.', '');
            }
            foreach ($report['by_category'] as &$categoryData) {
                $categoryData['revenue'] = number_format($categoryData['revenue'], 2, '.', '');
            }
            foreach ($report['by_cashier'] as &$cashierData) {
                $cashierData['revenue'] = number_format($cashierData['revenue'], 2, '.', '');
            }

            // Convert to indexed arrays
            $report['by_date'] = array_values($report['by_date']);
            $report['by_store'] = array_values($report['by_store']);
            $report['by_product'] = array_values($report['by_product']);
            $report['by_category'] = array_values($report['by_category']);
            $report['by_cashier'] = array_values($report['by_cashier']);

            return $this->success($report, 'Sales report retrieved successfully');

        } catch (\Exception $e) {
            log_message('error', '[ReportController::sales] Error: ' . $e->getMessage());
            return $this->error('An error occurred while retrieving sales report: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Inventory Report
     * GET /api/reports/inventory
     */
    public function inventory()
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only managers and admins can view inventory reports');
            }

            $storeId = $this->request->getGet('store_id');
            $includeLowStock = $this->request->getGet('include_low_stock') === '1';

            $accessibleStoreIds = $this->getAccessibleStoreIds($userId, $userRole);

            if ($storeId && !in_array((int)$storeId, $accessibleStoreIds)) {
                return $this->forbidden('You do not have access to this store');
            }

            $storeIds = $storeId ? [(int)$storeId] : $accessibleStoreIds;

            $builder = $this->inventoryModel->builder();
            $builder->whereIn('inventory.store_id', $storeIds);

            if ($includeLowStock) {
                $builder->where('inventory.quantity <=', 'inventory.reorder_level', false);
            }

            $inventoryItems = $builder->get()->getResultArray();

            $report = [
                'summary' => [
                    'total_items' => count($inventoryItems),
                    'total_valuation' => '0.00',
                    'low_stock_count' => 0,
                ],
                'by_store' => [],
                'by_product' => [],
                'low_stock_items' => [],
            ];

            $totalValuation = 0;
            $lowStockCount = 0;

            foreach ($inventoryItems as $item) {
                $product = $this->productModel->find($item['product_id']);
                $itemValue = (float) $product['base_price'] * $item['quantity'];
                $totalValuation += $itemValue;

                if ($item['quantity'] <= $item['reorder_level']) {
                    $lowStockCount++;
                    $report['low_stock_items'][] = [
                        'inventory_id' => $item['id'],
                        'store_id' => $item['store_id'],
                        'product_id' => $item['product_id'],
                        'product_name' => $product['name'] ?? 'Unknown',
                        'quantity' => $item['quantity'],
                        'reorder_level' => $item['reorder_level'],
                    ];
                }

                // Group by store
                $storeIdKey = $item['store_id'];
                if (!isset($report['by_store'][$storeIdKey])) {
                    $store = $this->storeModel->find($storeIdKey);
                    $report['by_store'][$storeIdKey] = [
                        'store_id' => $storeIdKey,
                        'store_name' => $store['name'] ?? 'Unknown',
                        'items_count' => 0,
                        'valuation' => 0,
                    ];
                }
                $report['by_store'][$storeIdKey]['items_count']++;
                $report['by_store'][$storeIdKey]['valuation'] += $itemValue;

                // Group by product
                $productId = $item['product_id'];
                if (!isset($report['by_product'][$productId])) {
                    $report['by_product'][$productId] = [
                        'product_id' => $productId,
                        'product_name' => $product['name'] ?? 'Unknown',
                        'total_quantity' => 0,
                        'valuation' => 0,
                    ];
                }
                $report['by_product'][$productId]['total_quantity'] += $item['quantity'];
                $report['by_product'][$productId]['valuation'] += $itemValue;
            }

            $report['summary']['total_valuation'] = number_format($totalValuation, 2, '.', '');
            $report['summary']['low_stock_count'] = $lowStockCount;

            // Format valuation in grouped data
            foreach ($report['by_store'] as &$storeData) {
                $storeData['valuation'] = number_format($storeData['valuation'], 2, '.', '');
            }
            foreach ($report['by_product'] as &$productData) {
                $productData['valuation'] = number_format($productData['valuation'], 2, '.', '');
            }

            // Convert to indexed arrays
            $report['by_store'] = array_values($report['by_store']);
            $report['by_product'] = array_values($report['by_product']);

            return $this->success($report, 'Inventory report retrieved successfully');

        } catch (\Exception $e) {
            log_message('error', '[ReportController::inventory] Error: ' . $e->getMessage());
            return $this->error('An error occurred while retrieving inventory report: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Expense Report
     * GET /api/reports/expenses
     */
    public function expenses()
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only managers and admins can view expense reports');
            }

            $storeId = $this->request->getGet('store_id');
            $startDate = $this->request->getGet('start_date');
            $endDate = $this->request->getGet('end_date');

            $accessibleStoreIds = $this->getAccessibleStoreIds($userId, $userRole);

            if ($storeId && !in_array((int)$storeId, $accessibleStoreIds)) {
                return $this->forbidden('You do not have access to this store');
            }

            $storeIds = $storeId ? [(int)$storeId] : $accessibleStoreIds;

            $builder = $this->expenseModel->builder();
            $builder->whereIn('expenses.store_id', $storeIds);

            if ($startDate) {
                $builder->where('expenses.expense_date >=', $startDate);
            }
            if ($endDate) {
                $builder->where('expenses.expense_date <=', $endDate);
            }

            $expenses = $builder->get()->getResultArray();

            $report = [
                'summary' => [
                    'total_expenses' => count($expenses),
                    'total_amount' => '0.00',
                ],
                'by_store' => [],
                'by_category' => [],
                'by_date' => [],
            ];

            $totalAmount = 0;

            foreach ($expenses as $expense) {
                $amount = (float) $expense['amount'];
                $totalAmount += $amount;

                // Group by store
                $storeIdKey = $expense['store_id'];
                if (!isset($report['by_store'][$storeIdKey])) {
                    $store = $this->storeModel->find($storeIdKey);
                    $report['by_store'][$storeIdKey] = [
                        'store_id' => $storeIdKey,
                        'store_name' => $store['name'] ?? 'Unknown',
                        'count' => 0,
                        'total_amount' => 0,
                    ];
                }
                $report['by_store'][$storeIdKey]['count']++;
                $report['by_store'][$storeIdKey]['total_amount'] += $amount;

                // Group by category
                $categoryId = $expense['category_id'];
                if (!isset($report['by_category'][$categoryId])) {
                    $categoryModel = new \App\Models\ExpenseCategoryModel();
                    $category = $categoryModel->find($categoryId);
                    $report['by_category'][$categoryId] = [
                        'category_id' => $categoryId,
                        'category_name' => $category['name'] ?? 'Unknown',
                        'count' => 0,
                        'total_amount' => 0,
                    ];
                }
                $report['by_category'][$categoryId]['count']++;
                $report['by_category'][$categoryId]['total_amount'] += $amount;

                // Group by date
                $date = $expense['expense_date'];
                if (!isset($report['by_date'][$date])) {
                    $report['by_date'][$date] = [
                        'date' => $date,
                        'count' => 0,
                        'total_amount' => 0,
                    ];
                }
                $report['by_date'][$date]['count']++;
                $report['by_date'][$date]['total_amount'] += $amount;
            }

            $report['summary']['total_amount'] = number_format($totalAmount, 2, '.', '');

            // Format amounts in grouped data
            foreach ($report['by_store'] as &$storeData) {
                $storeData['total_amount'] = number_format($storeData['total_amount'], 2, '.', '');
            }
            foreach ($report['by_category'] as &$categoryData) {
                $categoryData['total_amount'] = number_format($categoryData['total_amount'], 2, '.', '');
            }
            foreach ($report['by_date'] as &$dateData) {
                $dateData['total_amount'] = number_format($dateData['total_amount'], 2, '.', '');
            }

            // Convert to indexed arrays
            $report['by_store'] = array_values($report['by_store']);
            $report['by_category'] = array_values($report['by_category']);
            $report['by_date'] = array_values($report['by_date']);

            return $this->success($report, 'Expense report retrieved successfully');

        } catch (\Exception $e) {
            log_message('error', '[ReportController::expenses] Error: ' . $e->getMessage());
            return $this->error('An error occurred while retrieving expense report: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Financial Summary Report
     * GET /api/reports/financial
     */
    public function financial()
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only managers and admins can view financial reports');
            }

            $storeId = $this->request->getGet('store_id');
            $startDate = $this->request->getGet('start_date');
            $endDate = $this->request->getGet('end_date');

            $accessibleStoreIds = $this->getAccessibleStoreIds($userId, $userRole);

            if ($storeId && !in_array((int)$storeId, $accessibleStoreIds)) {
                return $this->forbidden('You do not have access to this store');
            }

            $storeIds = $storeId ? [(int)$storeId] : $accessibleStoreIds;

            // Get sales data
            $salesBuilder = $this->transactionModel->builder();
            $salesBuilder->where('status', 'completed');
            $salesBuilder->whereIn('store_id', $storeIds);
            if ($startDate) {
                $salesBuilder->where('DATE(created_at) >=', $startDate);
            }
            if ($endDate) {
                $salesBuilder->where('DATE(created_at) <=', $endDate);
            }
            $transactions = $salesBuilder->get()->getResultArray();

            // Get expense data
            $expenseBuilder = $this->expenseModel->builder();
            $expenseBuilder->whereIn('expenses.store_id', $storeIds);
            if ($startDate) {
                $expenseBuilder->where('expenses.expense_date >=', $startDate);
            }
            if ($endDate) {
                $expenseBuilder->where('expenses.expense_date <=', $endDate);
            }
            $expenses = $expenseBuilder->get()->getResultArray();

            $totalRevenue = 0;
            $totalExpenses = 0;

            foreach ($transactions as $transaction) {
                $totalRevenue += (float) $transaction['total_amount'];
            }

            foreach ($expenses as $expense) {
                $totalExpenses += (float) $expense['amount'];
            }

            $profit = $totalRevenue - $totalExpenses;
            $profitMargin = $totalRevenue > 0 ? ($profit / $totalRevenue) * 100 : 0;

            $report = [
                'summary' => [
                    'total_revenue' => number_format($totalRevenue, 2, '.', ''),
                    'total_expenses' => number_format($totalExpenses, 2, '.', ''),
                    'profit' => number_format($profit, 2, '.', ''),
                    'profit_margin' => number_format($profitMargin, 2, '.', ''),
                    'transaction_count' => count($transactions),
                    'expense_count' => count($expenses),
                ],
                'by_store' => [],
            ];

            // Group by store
            foreach ($storeIds as $sid) {
                $storeRevenue = 0;
                $storeExpenses = 0;

                foreach ($transactions as $transaction) {
                    if ($transaction['store_id'] == $sid) {
                        $storeRevenue += (float) $transaction['total_amount'];
                    }
                }

                foreach ($expenses as $expense) {
                    if ($expense['store_id'] == $sid) {
                        $storeExpenses += (float) $expense['amount'];
                    }
                }

                $storeProfit = $storeRevenue - $storeExpenses;
                $store = $this->storeModel->find($sid);

                $report['by_store'][] = [
                    'store_id' => $sid,
                    'store_name' => $store['name'] ?? 'Unknown',
                    'revenue' => number_format($storeRevenue, 2, '.', ''),
                    'expenses' => number_format($storeExpenses, 2, '.', ''),
                    'profit' => number_format($storeProfit, 2, '.', ''),
                ];
            }

            return $this->success($report, 'Financial report retrieved successfully');

        } catch (\Exception $e) {
            log_message('error', '[ReportController::financial] Error: ' . $e->getMessage());
            return $this->error('An error occurred while retrieving financial report: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Product Performance Report
     * GET /api/reports/products
     */
    public function products()
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only managers and admins can view product performance reports');
            }

            $storeId = $this->request->getGet('store_id');
            $startDate = $this->request->getGet('start_date');
            $endDate = $this->request->getGet('end_date');
            $limit = (int) ($this->request->getGet('limit') ?? 20);

            $accessibleStoreIds = $this->getAccessibleStoreIds($userId, $userRole);

            if ($storeId && !in_array((int)$storeId, $accessibleStoreIds)) {
                return $this->forbidden('You do not have access to this store');
            }

            $storeIds = $storeId ? [(int)$storeId] : $accessibleStoreIds;

            // Get completed transactions
            $transactionBuilder = $this->transactionModel->builder();
            $transactionBuilder->where('status', 'completed');
            $transactionBuilder->whereIn('store_id', $storeIds);
            if ($startDate) {
                $transactionBuilder->where('DATE(created_at) >=', $startDate);
            }
            if ($endDate) {
                $transactionBuilder->where('DATE(created_at) <=', $endDate);
            }
            $transactions = $transactionBuilder->get()->getResultArray();
            $transactionIds = array_column($transactions, 'id');

            if (empty($transactionIds)) {
                return $this->success([
                    'products' => [],
                    'summary' => [
                        'total_products' => 0,
                        'total_quantity_sold' => 0,
                        'total_revenue' => '0.00',
                    ],
                ], 'Product performance report retrieved successfully');
            }

            // Get transaction items
            $items = $this->transactionItemModel->builder()
                ->whereIn('transaction_id', $transactionIds)
                ->get()
                ->getResultArray();

            $productStats = [];

            foreach ($items as $item) {
                $productId = $item['product_id'];
                if (!isset($productStats[$productId])) {
                    $product = $this->productModel->find($productId);
                    $productStats[$productId] = [
                        'product_id' => $productId,
                        'product_name' => $product['name'] ?? 'Unknown',
                        'sku' => $product['sku'] ?? 'N/A',
                        'quantity_sold' => 0,
                        'revenue' => 0,
                        'transaction_count' => 0,
                    ];
                }
                $productStats[$productId]['quantity_sold'] += $item['quantity'];
                $productStats[$productId]['revenue'] += (float) $item['line_total'];
            }

            // Count unique transactions per product
            foreach ($items as $item) {
                $productId = $item['product_id'];
                $transactionId = $item['transaction_id'];
                if (!isset($productStats[$productId]['transactions'])) {
                    $productStats[$productId]['transactions'] = [];
                }
                $productStats[$productId]['transactions'][$transactionId] = true;
            }

            foreach ($productStats as &$stat) {
                $stat['transaction_count'] = isset($stat['transactions']) ? count($stat['transactions']) : 0;
                unset($stat['transactions']);
                $stat['revenue'] = number_format($stat['revenue'], 2, '.', '');
            }

            // Sort by revenue descending
            usort($productStats, function($a, $b) {
                return (float) $b['revenue'] - (float) $a['revenue'];
            });

            // Limit results
            $productStats = array_slice($productStats, 0, $limit);

            $totalQuantity = array_sum(array_column($productStats, 'quantity_sold'));
            $totalRevenue = array_sum(array_map(function($p) { return (float) $p['revenue']; }, $productStats));

            $report = [
                'products' => $productStats,
                'summary' => [
                    'total_products' => count($productStats),
                    'total_quantity_sold' => $totalQuantity,
                    'total_revenue' => number_format($totalRevenue, 2, '.', ''),
                ],
            ];

            return $this->success($report, 'Product performance report retrieved successfully');

        } catch (\Exception $e) {
            log_message('error', '[ReportController::products] Error: ' . $e->getMessage());
            return $this->error('An error occurred while retrieving product performance report: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Cashier Performance Report
     * GET /api/reports/cashiers
     */
    public function cashiers()
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized('Authentication required');
            }

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only managers and admins can view cashier performance reports');
            }

            $storeId = $this->request->getGet('store_id');
            $startDate = $this->request->getGet('start_date');
            $endDate = $this->request->getGet('end_date');

            $accessibleStoreIds = $this->getAccessibleStoreIds($userId, $userRole);

            if ($storeId && !in_array((int)$storeId, $accessibleStoreIds)) {
                return $this->forbidden('You do not have access to this store');
            }

            $storeIds = $storeId ? [(int)$storeId] : $accessibleStoreIds;

            $builder = $this->transactionModel->builder();
            $builder->where('status', 'completed');
            $builder->whereIn('store_id', $storeIds);

            if ($startDate) {
                $builder->where('DATE(created_at) >=', $startDate);
            }
            if ($endDate) {
                $builder->where('DATE(created_at) <=', $endDate);
            }

            $transactions = $builder->get()->getResultArray();

            $cashierStats = [];

            foreach ($transactions as $transaction) {
                $cashierId = $transaction['cashier_id'];
                if (!isset($cashierStats[$cashierId])) {
                    $cashier = $this->userModel->find($cashierId);
                    $cashierStats[$cashierId] = [
                        'cashier_id' => $cashierId,
                        'cashier_name' => $cashier['username'] ?? 'Unknown',
                        'transaction_count' => 0,
                        'total_revenue' => 0,
                        'average_transaction' => 0,
                    ];
                }
                $cashierStats[$cashierId]['transaction_count']++;
                $cashierStats[$cashierId]['total_revenue'] += (float) $transaction['total_amount'];
            }

            // Calculate averages and format
            foreach ($cashierStats as &$stat) {
                $stat['average_transaction'] = $stat['transaction_count'] > 0
                    ? number_format($stat['total_revenue'] / $stat['transaction_count'], 2, '.', '')
                    : '0.00';
                $stat['total_revenue'] = number_format($stat['total_revenue'], 2, '.', '');
            }

            // Sort by total revenue descending
            usort($cashierStats, function($a, $b) {
                return (float) $b['total_revenue'] - (float) $a['total_revenue'];
            });

            $report = [
                'cashiers' => array_values($cashierStats),
                'summary' => [
                    'total_cashiers' => count($cashierStats),
                    'total_transactions' => count($transactions),
                ],
            ];

            return $this->success($report, 'Cashier performance report retrieved successfully');

        } catch (\Exception $e) {
            log_message('error', '[ReportController::cashiers] Error: ' . $e->getMessage());
            return $this->error('An error occurred while retrieving cashier performance report: ' . $e->getMessage(), null, 500);
        }
    }
}

