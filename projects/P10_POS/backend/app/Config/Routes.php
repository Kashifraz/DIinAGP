<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

// API Routes
$routes->group('api', ['filter' => 'cors'], function ($routes) {
    // Test endpoints (public)
    $routes->get('test', 'Api\TestController::index');
    $routes->get('test/database', 'Api\TestController::database');
    
    // Authentication endpoints (public, with rate limiting)
    $routes->group('auth', ['filter' => 'throttle:10'], function ($routes) {
        $routes->post('login', 'Api\AuthController::login');
        $routes->post('password/reset-request', 'Api\AuthController::passwordResetRequest');
        $routes->post('password/reset', 'Api\AuthController::passwordReset');
        
        // Protected auth endpoints
        $routes->group('', ['filter' => 'auth'], function ($routes) {
            $routes->post('logout', 'Api\AuthController::logout');
            $routes->get('me', 'Api\AuthController::me');
            $routes->post('refresh', 'Api\AuthController::refresh');
        });
    });
    
    // User management endpoints (Admin only)
    // RoleFilter already handles authentication, so we just need role filter
    $routes->group('users', ['filter' => 'role:admin'], function ($routes) {
        $routes->get('/', 'Api\UserController::index');
        $routes->get('(:num)', 'Api\UserController::show/$1');
        $routes->post('/', 'Api\UserController::create');
        $routes->put('(:num)', 'Api\UserController::update/$1');
        $routes->delete('(:num)', 'Api\UserController::delete/$1');
    });
    
    // Store management endpoints
    $routes->group('stores', ['filter' => 'auth'], function ($routes) {
        $routes->get('/', 'Api\StoreController::index');
        $routes->get('(:num)', 'Api\StoreController::show/$1');
        $routes->get('(:num)/team', 'Api\StoreController::getTeam/$1');
        
        // Admin only endpoints
        $routes->group('', ['filter' => 'role:admin'], function ($routes) {
            $routes->post('/', 'Api\StoreController::create');
            $routes->put('(:num)', 'Api\StoreController::update/$1');
            $routes->delete('(:num)', 'Api\StoreController::delete/$1');
            $routes->post('(:num)/assign-manager', 'Api\StoreController::assignManager/$1');
            $routes->post('(:num)/assign-cashier', 'Api\StoreController::assignCashier/$1');
            $routes->delete('(:num)/users/(:num)', 'Api\StoreController::removeUserAssignment/$1/$2');
        });
        
        // Inventory management endpoints
        $routes->get('(:num)/inventory', 'Api\InventoryController::index/$1');
        $routes->get('(:num)/inventory/low-stock', 'Api\InventoryController::getLowStock/$1');
        $routes->get('(:num)/inventory/(:num)', 'Api\InventoryController::show/$1/$2');
        $routes->get('(:num)/inventory/(:num)/history', 'Api\InventoryController::getHistory/$1/$2');
        
        // Manager/Admin only inventory endpoints
        $routes->post('(:num)/inventory', 'Api\InventoryController::create/$1');
        $routes->put('(:num)/inventory/(:num)', 'Api\InventoryController::update/$1/$2');
        $routes->post('(:num)/inventory/(:num)/adjust', 'Api\InventoryController::adjust/$1/$2');
    });
    
    // Product Category endpoints
    $routes->group('categories', ['filter' => 'auth'], function ($routes) {
        $routes->get('/', 'Api\ProductCategoryController::index');
        $routes->get('(:num)', 'Api\ProductCategoryController::show/$1');
        
        // Manager/Admin only endpoints (role check in controller)
        $routes->post('/', 'Api\ProductCategoryController::create');
        $routes->put('(:num)', 'Api\ProductCategoryController::update/$1');
        $routes->delete('(:num)', 'Api\ProductCategoryController::delete/$1');
    });
    
    // Product management endpoints
    $routes->group('products', ['filter' => 'auth'], function ($routes) {
        $routes->get('/', 'Api\ProductController::index');
        $routes->get('search', 'Api\ProductController::search');
        $routes->get('(:num)', 'Api\ProductController::show/$1');
        
        // Manager/Admin only endpoints (role check in controller)
        $routes->post('/', 'Api\ProductController::create');
        $routes->put('(:num)', 'Api\ProductController::update/$1');
        $routes->delete('(:num)', 'Api\ProductController::delete/$1');
        
        // Variant management endpoints
        $routes->get('(:num)/variants', 'Api\ProductVariantController::index/$1');
        $routes->post('(:num)/variants', 'Api\ProductVariantController::create/$1');
        $routes->put('(:num)/variants/(:num)', 'Api\ProductVariantController::update/$1/$2');
        $routes->delete('(:num)/variants/(:num)', 'Api\ProductVariantController::delete/$1/$2');
    });

    // Customer endpoints
    $routes->group('customers', ['filter' => 'auth'], function ($routes) {
        $routes->get('search', 'Api\CustomerController::search');
        $routes->post('/', 'Api\CustomerController::create');
    });

    // Transaction endpoints
    $routes->group('transactions', ['filter' => 'auth'], function ($routes) {
        $routes->post('start', 'Api\TransactionController::start');
        $routes->get('/', 'Api\TransactionController::index');
        $routes->get('(:num)', 'Api\TransactionController::show/$1');
        $routes->get('(:num)/totals', 'Api\TransactionController::getTotals/$1');
        $routes->post('(:num)/items', 'Api\TransactionController::addItem/$1');
        $routes->put('(:num)/items/(:num)', 'Api\TransactionController::updateItem/$1/$2');
        $routes->delete('(:num)/items/(:num)', 'Api\TransactionController::removeItem/$1/$2');
        $routes->post('(:num)/customer', 'Api\TransactionController::addCustomer/$1');
        $routes->delete('(:num)/customer', 'Api\TransactionController::removeCustomer/$1');
        $routes->post('(:num)/payment', 'Api\TransactionController::processPayment/$1');
        $routes->post('(:num)/complete', 'Api\TransactionController::complete/$1');
        $routes->post('(:num)/void', 'Api\TransactionController::void/$1');
        
        // Discount endpoints
        $routes->post('(:num)/discounts', 'Api\TransactionController::applyDiscount/$1');
        $routes->delete('(:num)/discounts/(:num)', 'Api\TransactionController::removeDiscount/$1/$2');
        
        // Price override endpoint (Manager/Admin)
        $routes->put('(:num)/items/(:num)/price-override', 'Api\TransactionController::priceOverride/$1/$2');
        
        // Receipt endpoints
        $routes->get('(:num)/receipt', 'Api\ReceiptController::getReceipt/$1');
        $routes->get('(:num)/receipt/html', 'Api\ReceiptController::getReceiptHtml/$1');
        $routes->get('(:num)/receipt/text', 'Api\ReceiptController::getReceiptText/$1');
        $routes->post('(:num)/receipt/regenerate', 'Api\ReceiptController::regenerateReceipt/$1');
    });
    
    // Discount management endpoints
    $routes->group('discounts', ['filter' => 'auth'], function ($routes) {
        $routes->get('/', 'Api\DiscountController::index');
        $routes->get('applicable', 'Api\DiscountController::getApplicable');
        $routes->get('(:num)', 'Api\DiscountController::show/$1');
        
        // Manager/Admin only endpoints
        $routes->post('/', 'Api\DiscountController::create');
        $routes->put('(:num)', 'Api\DiscountController::update/$1');
        $routes->delete('(:num)', 'Api\DiscountController::delete/$1');
    });
    
    // Expense Category endpoints
    $routes->group('expense-categories', ['filter' => 'auth'], function ($routes) {
        $routes->get('/', 'Api\ExpenseCategoryController::index');
        $routes->get('(:num)', 'Api\ExpenseCategoryController::show/$1');
        
        // Manager/Admin only endpoints (role check in controller)
        $routes->post('/', 'Api\ExpenseCategoryController::create');
        $routes->put('(:num)', 'Api\ExpenseCategoryController::update/$1');
        $routes->delete('(:num)', 'Api\ExpenseCategoryController::delete/$1');
    });
    
    // Expense management endpoints
    $routes->group('expenses', ['filter' => 'auth'], function ($routes) {
        $routes->get('/', 'Api\ExpenseController::index');
        $routes->get('summary', 'Api\ExpenseController::summary');
        $routes->get('(:num)', 'Api\ExpenseController::show/$1');
        
        // Manager/Admin only endpoints (role check in controller)
        $routes->post('/', 'Api\ExpenseController::create');
        $routes->put('(:num)', 'Api\ExpenseController::update/$1');
        $routes->delete('(:num)', 'Api\ExpenseController::delete/$1');
    });
    
    // Stock Transfer endpoints
    $routes->group('transfers', ['filter' => 'auth'], function ($routes) {
        $routes->get('/', 'Api\StockTransferController::index');
        $routes->get('(:num)', 'Api\StockTransferController::show/$1');
        
        // Manager/Admin only endpoints (role check in controller)
        $routes->post('/', 'Api\StockTransferController::create');
        $routes->post('(:num)/approve', 'Api\StockTransferController::approve/$1');
        $routes->post('(:num)/complete', 'Api\StockTransferController::complete/$1');
        $routes->post('(:num)/cancel', 'Api\StockTransferController::cancel/$1');
    });
    
    // Reporting endpoints
    $routes->group('reports', ['filter' => 'auth'], function ($routes) {
        $routes->get('sales', 'Api\ReportController::sales');
        $routes->get('inventory', 'Api\ReportController::inventory');
        $routes->get('expenses', 'Api\ReportController::expenses');
        $routes->get('financial', 'Api\ReportController::financial');
        $routes->get('products', 'Api\ReportController::products');
        $routes->get('cashiers', 'Api\ReportController::cashiers');
    });

    // Sync endpoints
    $routes->group('sync', ['filter' => 'auth'], function ($routes) {
        $routes->get('status', 'Api\SyncController::status');
        $routes->get('pull', 'Api\SyncController::pull');
        $routes->post('push', 'Api\SyncController::push');
        $routes->get('queue', 'Api\SyncController::queue');
        $routes->post('retry', 'Api\SyncController::retry');
    });
});
