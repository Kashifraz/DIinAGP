<?php

namespace App\Controllers\Api;

use App\Models\CustomerModel;
use CodeIgniter\HTTP\ResponseInterface;

class CustomerController extends BaseApiController
{
    protected $customerModel;

    public function __construct()
    {
        parent::__construct();
        $this->customerModel = new CustomerModel();
    }

    /**
     * Search customers
     * GET /api/customers/search?q=query
     */
    public function search()
    {
        try {
            $query = $this->request->getGet('q');
            $limit = (int) ($this->request->getGet('limit') ?? 10);

            if (empty($query)) {
                return $this->error('Search query cannot be empty', null, 400);
            }

            $customers = $this->customerModel->searchCustomers($query, $limit);
            return $this->success($customers, 'Customers found successfully');

        } catch (\Exception $e) {
            log_message('error', '[CustomerController::search] Error: ' . $e->getMessage());
            return $this->error('An error occurred during customer search: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Create customer
     * POST /api/customers
     */
    public function create()
    {
        try {
            $json = $this->request->getJSON(true);
            $data = [
                'name'  => $json['name'] ?? $this->request->getPost('name'),
                'email' => $json['email'] ?? $this->request->getPost('email'),
                'phone' => $json['phone'] ?? $this->request->getPost('phone'),
            ];

            // Check if customer already exists by email or phone
            if (!empty($data['email']) || !empty($data['phone'])) {
                $existing = $this->customerModel->findByEmailOrPhone($data['email'] ?? null, $data['phone'] ?? null);
                if ($existing) {
                    return $this->success($existing, 'Customer already exists');
                }
            }

            if (!$this->validate($this->customerModel->validationRules, $data)) {
                return $this->validationError($this->validator->getErrors());
            }

            $customerId = $this->customerModel->insert($data);

            if (!$customerId) {
                return $this->error('Failed to create customer', $this->customerModel->errors(), 500);
            }

            $customer = $this->customerModel->find($customerId);
            return $this->success($customer, 'Customer created successfully', 201);

        } catch (\Exception $e) {
            log_message('error', '[CustomerController::create] Error: ' . $e->getMessage());
            return $this->error('An error occurred during customer creation: ' . $e->getMessage(), null, 500);
        }
    }
}

