<?php

namespace App\Controllers\Api;

use App\Models\StoreModel;
use App\Models\UserStoreAssignmentModel;
use App\Models\UserModel;
use CodeIgniter\HTTP\ResponseInterface;

class StoreController extends BaseApiController
{
    protected $storeModel;
    protected $assignmentModel;
    protected $userModel;

    public function __construct()
    {
        $this->storeModel = new StoreModel();
        $this->assignmentModel = new UserStoreAssignmentModel();
        $this->userModel = new UserModel();
    }

    /**
     * List stores
     * GET /api/stores
     * Admin sees all, Manager/Cashier see assigned stores
     */
    public function index()
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized();
            }

            $stores = $this->storeModel->getAccessibleStores($userId, $userRole);

            return $this->success($stores, 'Stores retrieved successfully');
        } catch (\Exception $e) {
            log_message('error', 'Store list error: ' . $e->getMessage());
            return $this->error('Failed to retrieve stores: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get store by ID
     * GET /api/stores/:id
     */
    public function show($id = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized();
            }

            // Check access
            if (!$this->storeModel->hasAccess($id, $userId, $userRole)) {
                return $this->forbidden('You do not have access to this store');
            }

            $store = $this->storeModel->find($id);

            if (!$store) {
                return $this->notFound('Store not found');
            }

            return $this->success($store, 'Store retrieved successfully');
        } catch (\Exception $e) {
            log_message('error', 'Store show error: ' . $e->getMessage());
            return $this->error('Failed to retrieve store: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Create new store
     * POST /api/stores
     * Admin only
     */
    public function create()
    {
        try {
            $userRole = $this->request->user['role'] ?? null;

            if ($userRole !== 'admin') {
                return $this->forbidden('Only admins can create stores');
            }

            // Get JSON input if available, otherwise get POST data
            $json = $this->request->getJSON(true);
            $name = $json['name'] ?? $this->request->getPost('name');
            $address = $json['address'] ?? $this->request->getPost('address');
            $phone = $json['phone'] ?? $this->request->getPost('phone');
            $email = $json['email'] ?? $this->request->getPost('email');
            $status = $json['status'] ?? $this->request->getPost('status') ?? 'active';

            $rules = [
                'name'    => 'required|min_length[3]|max_length[255]',
                'address' => 'permit_empty',
                'phone'   => 'permit_empty|max_length[20]',
                'email'   => 'permit_empty|valid_email|max_length[255]',
                'status'  => 'permit_empty|in_list[active,inactive]',
            ];

            $validationData = [
                'name' => $name,
                'address' => $address,
                'phone' => $phone,
                'email' => $email,
                'status' => $status,
            ];

            if (!$this->validate($rules, $validationData)) {
                return $this->validationError($this->validator->getErrors());
            }

            $data = [
                'name'    => $name,
                'address' => $address ?: null,
                'phone'   => $phone ?: null,
                'email'   => $email ?: null,
                'status'  => $status,
            ];

            $storeId = $this->storeModel->insert($data);

            if (!$storeId) {
                return $this->error('Failed to create store', $this->storeModel->errors(), 500);
            }

            $store = $this->storeModel->find($storeId);
            return $this->success($store, 'Store created successfully', 201);
        } catch (\Exception $e) {
            log_message('error', 'Store create error: ' . $e->getMessage());
            return $this->error('Failed to create store: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Update store
     * PUT /api/stores/:id
     * Admin only
     */
    public function update($id = null)
    {
        try {
            $userRole = $this->request->user['role'] ?? null;

            if ($userRole !== 'admin') {
                return $this->forbidden('Only admins can update stores');
            }

            $store = $this->storeModel->find($id);

            if (!$store) {
                return $this->notFound('Store not found');
            }

            // Get JSON input if available, otherwise get POST/PUT data
            $json = $this->request->getJSON(true);
            $name = $json['name'] ?? $this->request->getPost('name') ?? $this->request->getVar('name');
            $address = $json['address'] ?? $this->request->getPost('address') ?? $this->request->getVar('address');
            $phone = $json['phone'] ?? $this->request->getPost('phone') ?? $this->request->getVar('phone');
            $email = $json['email'] ?? $this->request->getPost('email') ?? $this->request->getVar('email');
            $status = $json['status'] ?? $this->request->getPost('status') ?? $this->request->getVar('status');

            $rules = [
                'name'    => 'permit_empty|min_length[3]|max_length[255]',
                'address' => 'permit_empty',
                'phone'   => 'permit_empty|max_length[20]',
                'email'   => 'permit_empty|valid_email|max_length[255]',
                'status'  => 'permit_empty|in_list[active,inactive]',
            ];

            $data = [];
            if ($name !== null && $name !== '') {
                $data['name'] = $name;
            }
            if ($address !== null) {
                $data['address'] = $address ?: null;
            }
            if ($phone !== null) {
                $data['phone'] = $phone ?: null;
            }
            if ($email !== null) {
                $data['email'] = $email ?: null;
            }
            if ($status !== null && $status !== '') {
                $data['status'] = $status;
            }

            if (empty($data)) {
                return $this->error('No data provided for update', null, 400);
            }

            $validationData = array_filter($data, function($value) {
                return $value !== null;
            });

            if (!$this->validate($rules, $validationData)) {
                return $this->validationError($this->validator->getErrors());
            }

            if (!$this->storeModel->update($id, $data)) {
                return $this->error('Failed to update store', $this->storeModel->errors(), 500);
            }

            $updatedStore = $this->storeModel->find($id);
            return $this->success($updatedStore, 'Store updated successfully');
        } catch (\Exception $e) {
            log_message('error', 'Store update error: ' . $e->getMessage());
            return $this->error('Failed to update store: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Delete store
     * DELETE /api/stores/:id
     * Admin only
     */
    public function delete($id = null)
    {
        try {
            $userRole = $this->request->user['role'] ?? null;

            if ($userRole !== 'admin') {
                return $this->forbidden('Only admins can delete stores');
            }

            $store = $this->storeModel->find($id);

            if (!$store) {
                return $this->notFound('Store not found');
            }

            // Check if store has assignments
            $assignments = $this->assignmentModel->where('store_id', $id)->countAllResults();
            if ($assignments > 0) {
                return $this->error('Cannot delete store with assigned users. Please remove all assignments first.', null, 400);
            }

            if (!$this->storeModel->delete($id)) {
                return $this->error('Failed to delete store', null, 500);
            }

            return $this->success(null, 'Store deleted successfully');
        } catch (\Exception $e) {
            log_message('error', 'Store delete error: ' . $e->getMessage());
            return $this->error('Failed to delete store: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Assign manager to store
     * POST /api/stores/:id/assign-manager
     * Admin only
     */
    public function assignManager($id = null)
    {
        try {
            $userRole = $this->request->user['role'] ?? null;

            if ($userRole !== 'admin') {
                return $this->forbidden('Only admins can assign managers');
            }

            $store = $this->storeModel->find($id);
            if (!$store) {
                return $this->notFound('Store not found');
            }

            // Get JSON input if available, otherwise get POST data
            $json = $this->request->getJSON(true);
            $userId = $json['user_id'] ?? $this->request->getPost('user_id');

            if (!$userId) {
                return $this->error('User ID is required', null, 400);
            }

            // Verify user exists and is not already assigned as manager to another store
            $user = $this->userModel->find($userId);
            if (!$user) {
                return $this->notFound('User not found');
            }

            // Check if user is already manager of this store
            $existingAssignment = $this->assignmentModel
                ->where('store_id', $id)
                ->where('user_id', $userId)
                ->where('role', 'manager')
                ->first();

            if ($existingAssignment) {
                return $this->error('User is already assigned as manager to this store', null, 400);
            }

            // Remove existing manager from this store (if any)
            $this->assignmentModel->removeManager($id);

            // Assign new manager
            $assignmentData = [
                'user_id'  => $userId,
                'store_id' => $id,
                'role'     => 'manager',
            ];

            $assignmentId = $this->assignmentModel->insert($assignmentData);

            if (!$assignmentId) {
                return $this->error('Failed to assign manager', $this->assignmentModel->errors(), 500);
            }

            $store = $this->storeModel->getStoreWithTeam($id);
            return $this->success($store, 'Manager assigned successfully');
        } catch (\Exception $e) {
            log_message('error', 'Assign manager error: ' . $e->getMessage());
            return $this->error('Failed to assign manager: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Assign cashier to store
     * POST /api/stores/:id/assign-cashier
     * Admin only
     */
    public function assignCashier($id = null)
    {
        try {
            $userRole = $this->request->user['role'] ?? null;

            if ($userRole !== 'admin') {
                return $this->forbidden('Only admins can assign cashiers');
            }

            $store = $this->storeModel->find($id);
            if (!$store) {
                return $this->notFound('Store not found');
            }

            // Get JSON input if available, otherwise get POST data
            $json = $this->request->getJSON(true);
            $userId = $json['user_id'] ?? $this->request->getPost('user_id');

            if (!$userId) {
                return $this->error('User ID is required', null, 400);
            }

            // Verify user exists
            $user = $this->userModel->find($userId);
            if (!$user) {
                return $this->notFound('User not found');
            }

            // Check if user is already assigned as cashier to this store
            $existingAssignment = $this->assignmentModel
                ->where('store_id', $id)
                ->where('user_id', $userId)
                ->where('role', 'cashier')
                ->first();

            if ($existingAssignment) {
                return $this->error('User is already assigned as cashier to this store', null, 400);
            }

            // Assign cashier
            $assignmentData = [
                'user_id'  => $userId,
                'store_id' => $id,
                'role'     => 'cashier',
            ];

            $assignmentId = $this->assignmentModel->insert($assignmentData);

            if (!$assignmentId) {
                return $this->error('Failed to assign cashier', $this->assignmentModel->errors(), 500);
            }

            $store = $this->storeModel->getStoreWithTeam($id);
            return $this->success($store, 'Cashier assigned successfully');
        } catch (\Exception $e) {
            log_message('error', 'Assign cashier error: ' . $e->getMessage());
            return $this->error('Failed to assign cashier: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Remove user assignment from store
     * DELETE /api/stores/:id/users/:userId
     * Admin only
     */
    public function removeUserAssignment($id = null, $userId = null)
    {
        try {
            $userRole = $this->request->user['role'] ?? null;

            if ($userRole !== 'admin') {
                return $this->forbidden('Only admins can remove user assignments');
            }

            $store = $this->storeModel->find($id);
            if (!$store) {
                return $this->notFound('Store not found');
            }

            $assignment = $this->assignmentModel
                ->where('store_id', $id)
                ->where('user_id', $userId)
                ->first();

            if (!$assignment) {
                return $this->notFound('User assignment not found');
            }

            if (!$this->assignmentModel->where('store_id', $id)->where('user_id', $userId)->delete()) {
                return $this->error('Failed to remove user assignment', null, 500);
            }

            $store = $this->storeModel->getStoreWithTeam($id);
            return $this->success($store, 'User assignment removed successfully');
        } catch (\Exception $e) {
            log_message('error', 'Remove assignment error: ' . $e->getMessage());
            return $this->error('Failed to remove user assignment: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get store team
     * GET /api/stores/:id/team
     */
    public function getTeam($id = null)
    {
        try {
            $userId = $this->request->user['user_id'] ?? null;
            $userRole = $this->request->user['role'] ?? null;

            if (!$userId || !$userRole) {
                return $this->unauthorized();
            }

            // Check access
            if (!$this->storeModel->hasAccess($id, $userId, $userRole)) {
                return $this->forbidden('You do not have access to this store');
            }

            $store = $this->storeModel->find($id);
            if (!$store) {
                return $this->notFound('Store not found');
            }

            $team = $this->assignmentModel->getTeam($id);

            // Enrich with user details
            $enrichedTeam = [];
            foreach ($team as $assignment) {
                $user = $this->userModel->find($assignment['user_id']);
                if ($user) {
                    $enrichedTeam[] = [
                        'assignment_id' => $assignment['id'],
                        'user_id' => $user['id'],
                        'name' => $user['name'],
                        'email' => $user['email'],
                        'phone' => $user['phone'],
                        'role' => $assignment['role'],
                        'assigned_at' => $assignment['assigned_at'],
                    ];
                }
            }

            return $this->success($enrichedTeam, 'Store team retrieved successfully');
        } catch (\Exception $e) {
            log_message('error', 'Get team error: ' . $e->getMessage());
            return $this->error('Failed to retrieve store team: ' . $e->getMessage(), null, 500);
        }
    }
}

