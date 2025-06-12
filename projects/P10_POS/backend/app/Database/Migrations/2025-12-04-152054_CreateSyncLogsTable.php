<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateSyncLogsTable extends Migration
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
            'sync_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'status' => [
                'type'       => 'ENUM',
                'constraint' => ['success', 'failed', 'warning'],
                'default'    => 'success',
            ],
            'error_message' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addKey('sync_id');
        $this->forge->addKey('status');
        $this->forge->addKey('created_at');
        
        // Add foreign key
        $this->forge->addForeignKey('sync_id', 'sync_queue', 'id', 'CASCADE', 'CASCADE');
        
        $this->forge->createTable('sync_logs');
    }

    public function down()
    {
        $this->forge->dropTable('sync_logs');
    }
}
