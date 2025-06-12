<?php

namespace App\Controllers\Api;

use App\Models\UserModel;
use CodeIgniter\HTTP\ResponseInterface;

class UserController extends BaseApiController
{
    protected $userModel;

    public function __construct()
    {
        $this->userModel = new UserModel();
    }

    /**
     * List users with pagination and filters
     * GET /api/users
     */
    public function index()
    {
        try {
            $page = (int) ($this->request->getGet('page') ?? 1);
            $perPage = (int) ($this->request->getGet('per_page') ?? 10);
            $role = $this->request->getGet('role');
            $status = $this->request->getGet('status');
            $search = $this->request->getGet('search');

            // Build query for counting
            $countBuilder = $this->userModel->builder();

            // Apply filters for count
            if (!empty($role)) {
                $countBuilder->where('role', $role);
            }

            if (!empty($status)) {
                $countBuilder->where('status', $status);
            }

            if (!empty($search)) {
                $countBuilder->groupStart()
                    ->like('name', $search)
                    ->orLike('email', $search)
                    ->groupEnd();
            }

            // Get total count
            $total = $countBuilder->countAllResults();

            // Build query for data (rebuild with same filters)
            $dataBuilder = $this->userModel->builder();

            // Apply filters for data
            if (!empty($role)) {
                $dataBuilder->where('role', $role);
            }

            if (!empty($status)) {
                $dataBuilder->where('status', $status);
            }

            if (!empty($search)) {
                $dataBuilder->groupStart()
                    ->like('name', $search)
                    ->orLike('email', $search)
                    ->groupEnd();
            }

            // Get paginated results
            $users = $dataBuilder->select('id, email, name, phone, role, status, created_at, updated_at')
                ->limit($perPage, ($page - 1) * $perPage)
                ->orderBy('created_at', 'DESC')
                ->get()
                ->getResultArray();

            return $this->success([
                'data' => $users,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => $total,
                    'last_page' => $perPage > 0 ? (int) ceil($total / $perPage) : 1,
                ],
            ], 'Users retrieved successfully');
        } catch (\Exception $e) {
            log_message('error', 'User list error: ' . $e->getMessage());
            log_message('error', 'Stack trace: ' . $e->getTraceAsString());
            return $this->error('Failed to retrieve users: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get user by ID
     * GET /api/users/:id
     */
    public function show($id = null)
    {
        $user = $this->userModel->find($id);

        if (!$user) {
            return $this->notFound('User not found');
        }

        // Remove sensitive data
        unset($user['password_hash']);
        unset($user['remember_token']);

        return $this->success($user, 'User retrieved successfully');
    }

    /**
     * Create new user
     * POST /api/users
     */
    public function create()
    {
        try {
            // Get JSON input if available, otherwise get POST data
            $json = $this->request->getJSON(true);
            $email = $json['email'] ?? $this->request->getPost('email');
            $password = $json['password'] ?? $this->request->getPost('password');
            $name = $json['name'] ?? $this->request->getPost('name');
            $phone = $json['phone'] ?? $this->request->getPost('phone');
            $role = $json['role'] ?? $this->request->getPost('role');
            $status = $json['status'] ?? $this->request->getPost('status') ?? 'active';

            $rules = [
                'email'    => 'required|valid_email|is_unique[users.email]',
                'password' => 'required|min_length[8]',
                'name'     => 'required|min_length[3]|max_length[255]',
                'phone'    => 'permit_empty|max_length[20]',
                'role'     => 'required|in_list[admin,manager,cashier]',
                'status'   => 'permit_empty|in_list[active,inactive]',
            ];

            $validationData = [
                'email' => $email,
                'password' => $password,
                'name' => $name,
                'phone' => $phone,
                'role' => $role,
                'status' => $status,
            ];

            if (!$this->validate($rules, $validationData)) {
                return $this->validationError($this->validator->getErrors());
            }

            $insertData = [
                'email'         => $email,
                'password_hash' => $password, // Will be hashed by model
                'name'          => $name,
                'phone'         => $phone ?: null,
                'role'          => $role,
                'status'        => $status,
            ];

            $userId = $this->userModel->insert($insertData);

            if (!$userId) {
                return $this->error('Failed to create user', $this->userModel->errors(), 500);
            }

            $user = $this->userModel->find($userId);
            if (!$user) {
                return $this->error('User created but could not retrieve', null, 500);
            }

            // Remove sensitive data
            unset($user['password_hash']);
            unset($user['remember_token']);

            return $this->success($user, 'User created successfully', 201);
        } catch (\Exception $e) {
            log_message('error', 'User create error: ' . $e->getMessage());
            log_message('error', 'Stack trace: ' . $e->getTraceAsString());
            return $this->error('Failed to create user: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Update user
     * PUT /api/users/:id
     */
    public function update($id = null)
    {
        try {
            $user = $this->userModel->find($id);

            if (!$user) {
                return $this->notFound('User not found');
            }

            // Get JSON input if available, otherwise get POST/PUT data
            $json = $this->request->getJSON(true);
            $email = $json['email'] ?? $this->request->getPost('email') ?? $this->request->getVar('email');
            $name = $json['name'] ?? $this->request->getPost('name') ?? $this->request->getVar('name');
            $phone = $json['phone'] ?? $this->request->getPost('phone') ?? $this->request->getVar('phone');
            $role = $json['role'] ?? $this->request->getPost('role') ?? $this->request->getVar('role');
            $status = $json['status'] ?? $this->request->getPost('status') ?? $this->request->getVar('status');
            $password = $json['password'] ?? $this->request->getPost('password') ?? $this->request->getVar('password');

            $rules = [
                'email'  => "permit_empty|valid_email|is_unique[users.email,id,{$id}]",
                'name'   => 'permit_empty|min_length[3]|max_length[255]',
                'phone'  => 'permit_empty|max_length[20]',
                'role'   => 'permit_empty|in_list[admin,manager,cashier]',
                'status' => 'permit_empty|in_list[active,inactive]',
                'password' => 'permit_empty|min_length[8]',
            ];

            $data = [];
            if ($email !== null && $email !== '') {
                $data['email'] = $email;
            }
            if ($name !== null && $name !== '') {
                $data['name'] = $name;
            }
            if ($phone !== null) {
                $data['phone'] = $phone ?: null;
            }
            if ($role !== null && $role !== '') {
                $data['role'] = $role;
            }
            if ($status !== null && $status !== '') {
                $data['status'] = $status;
            }
            if ($password !== null && $password !== '') {
                $data['password_hash'] = $password; // Will be hashed by model
            }

            if (empty($data)) {
                return $this->error('No data provided for update', null, 400);
            }

            $validationData = array_filter([
                'email' => $email,
                'name' => $name,
                'phone' => $phone,
                'role' => $role,
                'status' => $status,
                'password' => $password,
            ], function($value) {
                return $value !== null && $value !== '';
            });

            if (!$this->validate($rules, $validationData)) {
                return $this->validationError($this->validator->getErrors());
            }

            if (!$this->userModel->update($id, $data)) {
                return $this->error('Failed to update user', $this->userModel->errors(), 500);
            }

            $updatedUser = $this->userModel->find($id);
            if (!$updatedUser) {
                return $this->error('User updated but could not retrieve', null, 500);
            }

            unset($updatedUser['password_hash']);
            unset($updatedUser['remember_token']);

            return $this->success($updatedUser, 'User updated successfully');
        } catch (\Exception $e) {
            log_message('error', 'User update error: ' . $e->getMessage());
            log_message('error', 'Stack trace: ' . $e->getTraceAsString());
            return $this->error('Failed to update user: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Delete user
     * DELETE /api/users/:id
     */
    public function delete($id = null)
    {
        $user = $this->userModel->find($id);

        if (!$user) {
            return $this->notFound('User not found');
        }

        // Prevent deleting yourself
        $currentUserId = $this->request->user['user_id'] ?? null;
        if ($id == $currentUserId) {
            return $this->error('You cannot delete your own account', null, 400);
        }

        if (!$this->userModel->delete($id)) {
            return $this->error('Failed to delete user', null, 500);
        }

        return $this->success(null, 'User deleted successfully');
    }
}

