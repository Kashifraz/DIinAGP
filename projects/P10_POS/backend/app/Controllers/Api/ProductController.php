<?php

namespace App\Controllers\Api;

use App\Models\ProductModel;
use App\Models\ProductVariantModel;
use CodeIgniter\HTTP\ResponseInterface;

class ProductController extends BaseApiController
{
    protected $productModel;
    protected $variantModel;

    public function __construct()
    {
        $this->productModel = new ProductModel();
        $this->variantModel = new ProductVariantModel();
    }

    /**
     * List products with search, filter, and pagination
     * GET /api/products
     */
    public function index()
    {
        try {
            $page = (int) ($this->request->getGet('page') ?? 1);
            $perPage = (int) ($this->request->getGet('per_page') ?? 10);
            $categoryId = $this->request->getGet('category_id');
            $status = $this->request->getGet('status');
            $search = $this->request->getGet('search');

            $filters = [];
            if ($categoryId) {
                $filters['category_id'] = $categoryId;
            }
            if ($status) {
                $filters['status'] = $status;
            }
            if ($search) {
                $filters['search'] = $search;
            }

            // Build query
            $builder = $this->productModel->getProductsWithFilters($filters);

            // Get total count
            $total = $builder->countAllResults(false);

            // Get paginated results
            $products = $builder->select('products.*')
                ->limit($perPage, ($page - 1) * $perPage)
                ->orderBy('products.created_at', 'DESC')
                ->get()
                ->getResultArray();

            return $this->success([
                'data' => $products,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => $total,
                    'last_page' => $perPage > 0 ? (int) ceil($total / $perPage) : 1,
                ],
            ], 'Products retrieved successfully');
        } catch (\Exception $e) {
            log_message('error', 'Product list error: ' . $e->getMessage());
            return $this->error('Failed to retrieve products: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get product by ID
     * GET /api/products/:id
     */
    public function show($id = null)
    {
        try {
            $product = $this->productModel->getProductWithDetails($id);

            if (!$product) {
                return $this->notFound('Product not found');
            }

            return $this->success($product, 'Product retrieved successfully');
        } catch (\Exception $e) {
            log_message('error', 'Product show error: ' . $e->getMessage());
            return $this->error('Failed to retrieve product: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Create product
     * POST /api/products
     * Manager/Admin only
     */
    public function create()
    {
        try {
            $userRole = $this->request->user['role'] ?? null;

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only admins and managers can create products');
            }

            // Get JSON input if available, otherwise get POST data
            $json = $this->request->getJSON(true);
            $name = $json['name'] ?? $this->request->getPost('name');
            $description = $json['description'] ?? $this->request->getPost('description');
            $sku = $json['sku'] ?? $this->request->getPost('sku');
            $barcode = $json['barcode'] ?? $this->request->getPost('barcode');
            $basePrice = $json['base_price'] ?? $this->request->getPost('base_price');
            $categoryId = $json['category_id'] ?? $this->request->getPost('category_id');
            $imageUrl = $json['image_url'] ?? $this->request->getPost('image_url');
            $status = $json['status'] ?? $this->request->getPost('status') ?? 'active';
            $variants = $json['variants'] ?? [];

            $rules = [
                'name'        => 'required|min_length[3]|max_length[255]',
                'description' => 'permit_empty',
                'sku'         => 'permit_empty|max_length[100]|is_unique[products.sku]',
                'barcode'     => 'permit_empty|max_length[100]|is_unique[products.barcode]',
                'base_price'  => 'required|decimal|greater_than_equal_to[0]',
                'category_id' => 'permit_empty|integer|is_not_unique[product_categories.id]',
                'image_url'   => 'permit_empty|max_length[500]',
                'status'      => 'permit_empty|in_list[active,inactive]',
            ];

            $validationData = [
                'name'        => $name,
                'description' => $description,
                'sku'         => $sku,
                'barcode'     => $barcode,
                'base_price'  => $basePrice,
                'category_id' => $categoryId,
                'image_url'   => $imageUrl,
                'status'      => $status,
            ];

            if (!$this->validate($rules, $validationData)) {
                return $this->validationError($this->validator->getErrors());
            }

            $data = [
                'name'        => $name,
                'description' => $description ?: null,
                'sku'         => $sku ?: null,
                'barcode'     => $barcode ?: null,
                'base_price'  => $basePrice,
                'category_id' => $categoryId ?: null,
                'image_url'   => $imageUrl ?: null,
                'status'      => $status,
            ];

            $productId = $this->productModel->insert($data);

            if (!$productId) {
                return $this->error('Failed to create product', $this->productModel->errors(), 500);
            }

            // Create variants if provided
            if (!empty($variants) && is_array($variants)) {
                foreach ($variants as $variant) {
                    $variantData = [
                        'product_id'      => $productId,
                        'variant_name'    => $variant['variant_name'] ?? '',
                        'variant_value'   => $variant['variant_value'] ?? '',
                        'price_adjustment' => $variant['price_adjustment'] ?? 0,
                        'sku_suffix'      => $variant['sku_suffix'] ?? null,
                    ];
                    $this->variantModel->insert($variantData);
                }
            }

            $product = $this->productModel->getProductWithDetails($productId);
            return $this->success($product, 'Product created successfully', 201);
        } catch (\Exception $e) {
            log_message('error', 'Product create error: ' . $e->getMessage());
            return $this->error('Failed to create product: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Update product
     * PUT /api/products/:id
     * Manager/Admin only
     */
    public function update($id = null)
    {
        try {
            $userRole = $this->request->user['role'] ?? null;

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only admins and managers can update products');
            }

            $product = $this->productModel->find($id);

            if (!$product) {
                return $this->notFound('Product not found');
            }

            // Get JSON input if available, otherwise get POST/PUT data
            $json = $this->request->getJSON(true);
            $name = $json['name'] ?? $this->request->getPost('name') ?? $this->request->getVar('name');
            $description = $json['description'] ?? $this->request->getPost('description') ?? $this->request->getVar('description');
            $sku = $json['sku'] ?? $this->request->getPost('sku') ?? $this->request->getVar('sku');
            $barcode = $json['barcode'] ?? $this->request->getPost('barcode') ?? $this->request->getVar('barcode');
            $basePrice = $json['base_price'] ?? $this->request->getPost('base_price') ?? $this->request->getVar('base_price');
            $categoryId = $json['category_id'] ?? $this->request->getPost('category_id') ?? $this->request->getVar('category_id');
            $imageUrl = $json['image_url'] ?? $this->request->getPost('image_url') ?? $this->request->getVar('image_url');
            $status = $json['status'] ?? $this->request->getPost('status') ?? $this->request->getVar('status');

            $rules = [
                'name'        => 'permit_empty|min_length[3]|max_length[255]',
                'description' => 'permit_empty',
                'sku'         => 'permit_empty|max_length[100]',
                'barcode'     => 'permit_empty|max_length[100]',
                'base_price'  => 'permit_empty|decimal|greater_than_equal_to[0]',
                'category_id' => 'permit_empty|integer|is_not_unique[product_categories.id]',
                'image_url'   => 'permit_empty|max_length[500]',
                'status'      => 'permit_empty|in_list[active,inactive]',
            ];

            $data = [];
            if ($name !== null && $name !== '') {
                $data['name'] = $name;
            }
            if ($description !== null) {
                $data['description'] = $description ?: null;
            }
            if ($sku !== null) {
                // Only validate uniqueness if SKU is being changed
                if ($sku !== $product['sku']) {
                    // Check if new SKU already exists
                    $existingProduct = $this->productModel->where('sku', $sku)->where('id !=', $id)->first();
                    if ($existingProduct) {
                        return $this->error('SKU already exists', ['sku' => 'The sku field must contain a unique value.'], 400);
                    }
                }
                $data['sku'] = $sku ?: null;
            }
            if ($barcode !== null) {
                // Only validate uniqueness if barcode is being changed
                if ($barcode !== $product['barcode']) {
                    // Check if new barcode already exists
                    $existingProduct = $this->productModel->where('barcode', $barcode)->where('id !=', $id)->first();
                    if ($existingProduct) {
                        return $this->error('Barcode already exists', ['barcode' => 'The barcode field must contain a unique value.'], 400);
                    }
                }
                $data['barcode'] = $barcode ?: null;
            }
            if ($basePrice !== null && $basePrice !== '') {
                $data['base_price'] = $basePrice;
            }
            if ($categoryId !== null) {
                $data['category_id'] = $categoryId ?: null;
            }
            if ($imageUrl !== null) {
                $data['image_url'] = $imageUrl ?: null;
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

            // Skip model validation since we've already validated in the controller
            // and handled uniqueness checks manually
            $this->productModel->skipValidation(true);
            
            if (!$this->productModel->update($id, $data)) {
                $this->productModel->skipValidation(false);
                return $this->error('Failed to update product', $this->productModel->errors(), 500);
            }
            
            $this->productModel->skipValidation(false);

            $updatedProduct = $this->productModel->getProductWithDetails($id);
            return $this->success($updatedProduct, 'Product updated successfully');
        } catch (\Exception $e) {
            log_message('error', 'Product update error: ' . $e->getMessage());
            return $this->error('Failed to update product: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Delete product
     * DELETE /api/products/:id
     * Manager/Admin only
     */
    public function delete($id = null)
    {
        try {
            $userRole = $this->request->user['role'] ?? null;

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only admins and managers can delete products');
            }

            $product = $this->productModel->find($id);

            if (!$product) {
                return $this->notFound('Product not found');
            }

            // Delete variants first
            $this->variantModel->where('product_id', $id)->delete();

            if (!$this->productModel->delete($id)) {
                return $this->error('Failed to delete product', null, 500);
            }

            return $this->success(null, 'Product deleted successfully');
        } catch (\Exception $e) {
            log_message('error', 'Product delete error: ' . $e->getMessage());
            return $this->error('Failed to delete product: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Search products
     * GET /api/products/search?q=query
     */
    public function search()
    {
        try {
            $query = $this->request->getGet('q');
            $limit = (int) ($this->request->getGet('limit') ?? 20);

            if (empty($query)) {
                return $this->error('Search query is required', null, 400);
            }

            $products = $this->productModel->searchProducts($query, $limit);

            return $this->success($products, 'Products retrieved successfully');
        } catch (\Exception $e) {
            log_message('error', 'Product search error: ' . $e->getMessage());
            return $this->error('Failed to search products: ' . $e->getMessage(), null, 500);
        }
    }
}

