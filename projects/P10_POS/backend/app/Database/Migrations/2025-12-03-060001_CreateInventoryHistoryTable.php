<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateInventoryHistoryTable extends Migration
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
            'inventory_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'change_type' => [
                'type'       => 'ENUM',
                'constraint' => ['sale', 'purchase', 'adjustment', 'transfer_in', 'transfer_out', 'return', 'damage', 'expired'],
                'default'    => 'adjustment',
            ],
            'quantity_change' => [
                'type'       => 'INT',
                'constraint' => 11,
            ],
            'previous_quantity' => [
                'type'       => 'INT',
                'constraint' => 11,
            ],
            'new_quantity' => [
                'type'       => 'INT',
                'constraint' => 11,
            ],
            'reason' => [
                'type'       => 'VARCHAR',
                'constraint' => '255',
                'null'       => true,
            ],
            'user_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
                'null'       => true,
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addKey('inventory_id');
        $this->forge->addKey('change_type');
        $this->forge->addKey('user_id');
        $this->forge->addKey('created_at');
        
        // Add foreign keys
        $this->forge->addForeignKey('inventory_id', 'inventory', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('user_id', 'users', 'id', 'SET NULL', 'CASCADE');
        
        $this->forge->createTable('inventory_history');
    }

    public function down()
    {
        $this->forge->dropTable('inventory_history');
    }
}

