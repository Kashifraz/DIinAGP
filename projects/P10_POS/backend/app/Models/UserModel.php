<?php

namespace App\Models;

use CodeIgniter\Model;

class UserModel extends Model
{
    protected $table            = 'users';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'email',
        'password_hash',
        'name',
        'phone',
        'role',
        'status',
        'remember_token',
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    // Validation
    protected $validationRules = [
        'email'        => 'required|valid_email|is_unique[users.email,id,{id}]',
        'password_hash' => 'permit_empty|min_length[8]',
        'name'         => 'required|min_length[3]|max_length[255]',
        'phone'        => 'permit_empty|max_length[20]',
        'role'         => 'required|in_list[admin,manager,cashier]',
        'status'       => 'required|in_list[active,inactive]',
    ];

    protected $validationMessages = [
        'email' => [
            'required'    => 'Email is required',
            'valid_email' => 'Please provide a valid email address',
            'is_unique'   => 'This email is already registered',
        ],
        'password_hash' => [
            'required'   => 'Password is required',
            'min_length' => 'Password must be at least 8 characters long',
        ],
        'name' => [
            'required'   => 'Name is required',
            'min_length' => 'Name must be at least 3 characters long',
        ],
        'role' => [
            'required' => 'Role is required',
            'in_list'  => 'Role must be one of: admin, manager, cashier',
        ],
    ];

    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeInsert   = ['hashPassword'];
    protected $beforeUpdate   = ['hashPasswordIfChanged'];

    /**
     * Hash password before insert
     */
    protected function hashPassword(array $data)
    {
        if (isset($data['data']['password_hash'])) {
            $data['data']['password_hash'] = password_hash($data['data']['password_hash'], PASSWORD_BCRYPT);
        }
        return $data;
    }

    /**
     * Hash password before update if it changed
     */
    protected function hashPasswordIfChanged(array $data)
    {
        if (isset($data['data']['password_hash']) && !empty($data['data']['password_hash'])) {
            $data['data']['password_hash'] = password_hash($data['data']['password_hash'], PASSWORD_BCRYPT);
        } else {
            // Remove password_hash from update if empty
            unset($data['data']['password_hash']);
        }
        return $data;
    }

    /**
     * Find user by email
     */
    public function findByEmail(string $email)
    {
        return $this->where('email', $email)->first();
    }

    /**
     * Verify password
     */
    public function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    /**
     * Get users by role
     */
    public function getByRole(string $role)
    {
        return $this->where('role', $role)->findAll();
    }

    /**
     * Get active users
     */
    public function getActiveUsers()
    {
        return $this->where('status', 'active')->findAll();
    }
}

