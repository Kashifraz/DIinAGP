<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddReceiptTemplateToStores extends Migration
{
    public function up()
    {
        $fields = [
            'receipt_template' => [
                'type' => 'TEXT',
                'null' => true,
                'comment' => 'Custom receipt template (HTML/JSON) for store-specific formatting',
            ],
        ];
        $this->forge->addColumn('stores', $fields);
    }

    public function down()
    {
        $this->forge->dropColumn('stores', 'receipt_template');
    }
}

