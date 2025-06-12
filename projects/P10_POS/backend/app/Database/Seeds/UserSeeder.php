<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use App\Models\UserModel;

class UserSeeder extends Seeder
{
    public function run()
    {
        $userModel = new UserModel();

        // Create admin user
        $adminData = [
            'email'         => 'admin@pos.com',
            'password_hash' => 'admin123', // Will be hashed by model
            'name'          => 'System Administrator',
            'phone'         => '1234567890',
            'role'          => 'admin',
            'status'        => 'active',
        ];

        $userModel->insert($adminData);

        // Create manager user
        $managerData = [
            'email'         => 'manager@pos.com',
            'password_hash' => 'manager123',
            'name'          => 'Store Manager',
            'phone'         => '1234567891',
            'role'          => 'manager',
            'status'        => 'active',
        ];

        $userModel->insert($managerData);

        // Create cashier user
        $cashierData = [
            'email'         => 'cashier@pos.com',
            'password_hash' => 'cashier123',
            'name'          => 'Cashier User',
            'phone'         => '1234567892',
            'role'          => 'cashier',
            'status'        => 'active',
        ];

        $userModel->insert($cashierData);

        echo "Users seeded successfully!\n";
        echo "Admin: admin@pos.com / admin123\n";
        echo "Manager: manager@pos.com / manager123\n";
        echo "Cashier: cashier@pos.com / cashier123\n";
    }
}

