<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateSyncQueueTable extends Migration
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
            'store_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'user_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'operation_type' => [
                'type'       => 'VARCHAR',
                'constraint' => '50',
            ],
            'entity_type' => [
                'type'       => 'VARCHAR',
                'constraint' => '50',
            ],
            'entity_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
                'null'       => true,
            ],
            'data' => [
                'type' => 'TEXT',
            ],
            'status' => [
                'type'       => 'ENUM',
                'constraint' => ['pending', 'syncing', 'synced', 'failed'],
                'default'    => 'pending',
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'synced_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addKey('store_id');
        $this->forge->addKey('user_id');
        $this->forge->addKey('status');
        $this->forge->addKey('entity_type');
        $this->forge->addKey('created_at');
        
        // Add foreign keys
        $this->forge->addForeignKey('store_id', 'stores', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'CASCADE');
        
        $this->forge->createTable('sync_queue');
    }

    public function down()
    {
        $this->forge->dropTable('sync_queue');
    }
}
