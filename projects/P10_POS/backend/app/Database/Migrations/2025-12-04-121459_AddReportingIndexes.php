<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddReportingIndexes extends Migration
{
    public function up()
    {
        // Composite indexes for transaction reporting queries
        // Optimize queries filtering by store and date range
        $this->db->query('CREATE INDEX idx_transactions_store_date ON transactions(store_id, created_at)');
        $this->db->query('CREATE INDEX idx_transactions_store_status_date ON transactions(store_id, status, created_at)');
        
        // Optimize cashier performance queries
        $this->db->query('CREATE INDEX idx_transactions_cashier_date ON transactions(cashier_id, created_at)');
        
        // Composite indexes for transaction_items reporting
        // Optimize product performance queries
        $this->db->query('CREATE INDEX idx_transaction_items_product ON transaction_items(product_id, transaction_id)');
        
        // Composite indexes for expense reporting queries
        // Optimize queries filtering by store and date range
        $this->db->query('CREATE INDEX idx_expenses_store_date ON expenses(store_id, expense_date)');
        
        // Composite indexes for inventory reporting
        // Optimize stock valuation queries
        $this->db->query('CREATE INDEX idx_inventory_store_product ON inventory(store_id, product_id)');
    }

    public function down()
    {
        $this->db->query('DROP INDEX idx_transactions_store_date ON transactions');
        $this->db->query('DROP INDEX idx_transactions_store_status_date ON transactions');
        $this->db->query('DROP INDEX idx_transactions_cashier_date ON transactions');
        $this->db->query('DROP INDEX idx_transaction_items_product ON transaction_items');
        $this->db->query('DROP INDEX idx_expenses_store_date ON expenses');
        $this->db->query('DROP INDEX idx_inventory_store_product ON inventory');
    }
}
