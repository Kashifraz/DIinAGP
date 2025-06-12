<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateReceiptsTable extends Migration
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
            'transaction_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
                'unique'     => true,
            ],
            'receipt_number' => [
                'type'       => 'VARCHAR',
                'constraint' => '50',
                'unique'     => true,
            ],
            'receipt_data' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);
        $this->forge->addKey('id', true);
        // Note: transaction_id already has unique index from 'unique' => true above
        // Note: receipt_number already has unique index from 'unique' => true above
        
        // Add foreign key (transaction_id already has unique index, so this won't create duplicate)
        $this->forge->addForeignKey('transaction_id', 'transactions', 'id', 'CASCADE', 'CASCADE');
        
        $this->forge->createTable('receipts');
    }

    public function down()
    {
        $this->forge->dropTable('receipts');
    }
}

