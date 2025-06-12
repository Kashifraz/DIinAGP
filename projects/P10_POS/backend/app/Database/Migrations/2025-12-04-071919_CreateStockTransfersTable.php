<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateStockTransfersTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'INT',
                'constraint'     => 11,
                'unsigned'       => true,
                'auto_increment' => true,
            ],
            'from_store_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'to_store_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'status' => [
                'type'       => 'ENUM',
                'constraint' => ['pending', 'approved', 'in_transit', 'completed', 'cancelled'],
                'default'    => 'pending',
            ],
            'requested_by' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'approved_by' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
                'null'       => true,
            ],
            'requested_at' => [
                'type' => 'DATETIME',
            ],
            'completed_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'notes' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'updated_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addKey('from_store_id');
        $this->forge->addKey('to_store_id');
        $this->forge->addKey('status');
        $this->forge->addKey('requested_by');
        
        // Add foreign keys
        $this->forge->addForeignKey('from_store_id', 'stores', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('to_store_id', 'stores', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('requested_by', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('approved_by', 'users', 'id', 'CASCADE', 'SET NULL');
        
        $this->forge->createTable('stock_transfers');
    }

    public function down()
    {
        $this->forge->dropTable('stock_transfers');
    }
}
