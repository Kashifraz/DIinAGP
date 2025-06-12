<?php

namespace App\Controllers\Api;

use App\Models\ProductVariantModel;
use App\Models\ProductModel;
use CodeIgniter\HTTP\ResponseInterface;

class ProductVariantController extends BaseApiController
{
    protected $variantModel;
    protected $productModel;

    public function __construct()
    {
        $this->variantModel = new ProductVariantModel();
        $this->productModel = new ProductModel();
    }

    /**
     * Get variants for a product
     * GET /api/products/:productId/variants
     */
    public function index($productId = null)
    {
        try {
            $product = $this->productModel->find($productId);
            if (!$product) {
                return $this->notFound('Product not found');
            }

            $variants = $this->variantModel->getProductVariants($productId);
            return $this->success($variants, 'Variants retrieved successfully');
        } catch (\Exception $e) {
            log_message('error', 'Variant list error: ' . $e->getMessage());
            return $this->error('Failed to retrieve variants: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Create variant
     * POST /api/products/:productId/variants
     * Manager/Admin only
     */
    public function create($productId = null)
    {
        try {
            $userRole = $this->request->user['role'] ?? null;

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only admins and managers can create variants');
            }

            $product = $this->productModel->find($productId);
            if (!$product) {
                return $this->notFound('Product not found');
            }

            // Get JSON input if available, otherwise get POST data
            $json = $this->request->getJSON(true);
            $variantName = $json['variant_name'] ?? $this->request->getPost('variant_name');
            $variantValue = $json['variant_value'] ?? $this->request->getPost('variant_value');
            $priceAdjustment = $json['price_adjustment'] ?? $this->request->getPost('price_adjustment') ?? 0;
            $skuSuffix = $json['sku_suffix'] ?? $this->request->getPost('sku_suffix');

            $rules = [
                'variant_name'    => 'required|max_length[100]',
                'variant_value'   => 'required|max_length[100]',
                'price_adjustment' => 'permit_empty|decimal',
                'sku_suffix'      => 'permit_empty|max_length[50]',
            ];

            $validationData = [
                'variant_name'    => $variantName,
                'variant_value'   => $variantValue,
                'price_adjustment' => $priceAdjustment,
                'sku_suffix'      => $skuSuffix,
            ];

            if (!$this->validate($rules, $validationData)) {
                return $this->validationError($this->validator->getErrors());
            }

            // Check if variant already exists
            $existing = $this->variantModel->getVariantByDetails($productId, $variantName, $variantValue);
            if ($existing) {
                return $this->error('Variant with this name and value already exists', null, 400);
            }

            $data = [
                'product_id'      => $productId,
                'variant_name'    => $variantName,
                'variant_value'   => $variantValue,
                'price_adjustment' => $priceAdjustment,
                'sku_suffix'      => $skuSuffix ?: null,
            ];

            $variantId = $this->variantModel->insert($data);

            if (!$variantId) {
                return $this->error('Failed to create variant', $this->variantModel->errors(), 500);
            }

            $variant = $this->variantModel->find($variantId);
            return $this->success($variant, 'Variant created successfully', 201);
        } catch (\Exception $e) {
            log_message('error', 'Variant create error: ' . $e->getMessage());
            return $this->error('Failed to create variant: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Update variant
     * PUT /api/products/:productId/variants/:id
     * Manager/Admin only
     */
    public function update($productId = null, $id = null)
    {
        try {
            $userRole = $this->request->user['role'] ?? null;

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only admins and managers can update variants');
            }

            $variant = $this->variantModel->find($id);
            if (!$variant || $variant['product_id'] != $productId) {
                return $this->notFound('Variant not found');
            }

            // Get JSON input if available, otherwise get POST/PUT data
            $json = $this->request->getJSON(true);
            $variantName = $json['variant_name'] ?? $this->request->getPost('variant_name') ?? $this->request->getVar('variant_name');
            $variantValue = $json['variant_value'] ?? $this->request->getPost('variant_value') ?? $this->request->getVar('variant_value');
            $priceAdjustment = $json['price_adjustment'] ?? $this->request->getPost('price_adjustment') ?? $this->request->getVar('price_adjustment');
            $skuSuffix = $json['sku_suffix'] ?? $this->request->getPost('sku_suffix') ?? $this->request->getVar('sku_suffix');

            $rules = [
                'variant_name'    => 'permit_empty|max_length[100]',
                'variant_value'   => 'permit_empty|max_length[100]',
                'price_adjustment' => 'permit_empty|decimal',
                'sku_suffix'      => 'permit_empty|max_length[50]',
            ];

            $data = [];
            if ($variantName !== null && $variantName !== '') {
                $data['variant_name'] = $variantName;
            }
            if ($variantValue !== null && $variantValue !== '') {
                $data['variant_value'] = $variantValue;
            }
            if ($priceAdjustment !== null) {
                $data['price_adjustment'] = $priceAdjustment;
            }
            if ($skuSuffix !== null) {
                $data['sku_suffix'] = $skuSuffix ?: null;
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

            if (!$this->variantModel->update($id, $data)) {
                return $this->error('Failed to update variant', $this->variantModel->errors(), 500);
            }

            $updatedVariant = $this->variantModel->find($id);
            return $this->success($updatedVariant, 'Variant updated successfully');
        } catch (\Exception $e) {
            log_message('error', 'Variant update error: ' . $e->getMessage());
            return $this->error('Failed to update variant: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Delete variant
     * DELETE /api/products/:productId/variants/:id
     * Manager/Admin only
     */
    public function delete($productId = null, $id = null)
    {
        try {
            $userRole = $this->request->user['role'] ?? null;

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only admins and managers can delete variants');
            }

            $variant = $this->variantModel->find($id);
            if (!$variant || $variant['product_id'] != $productId) {
                return $this->notFound('Variant not found');
            }

            if (!$this->variantModel->delete($id)) {
                return $this->error('Failed to delete variant', null, 500);
            }

            return $this->success(null, 'Variant deleted successfully');
        } catch (\Exception $e) {
            log_message('error', 'Variant delete error: ' . $e->getMessage());
            return $this->error('Failed to delete variant: ' . $e->getMessage(), null, 500);
        }
    }
}

