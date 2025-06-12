<?php

namespace App\Controllers\Api;

use App\Models\ProductCategoryModel;
use CodeIgniter\HTTP\ResponseInterface;

class ProductCategoryController extends BaseApiController
{
    protected $categoryModel;

    public function __construct()
    {
        $this->categoryModel = new ProductCategoryModel();
    }

    /**
     * List categories
     * GET /api/categories
     */
    public function index()
    {
        try {
            $hierarchy = $this->request->getGet('hierarchy') === 'true';
            
            if ($hierarchy) {
                $categories = $this->categoryModel->getCategoriesWithHierarchy();
            } else {
                $categories = $this->categoryModel->getFlatList();
            }

            return $this->success($categories, 'Categories retrieved successfully');
        } catch (\Exception $e) {
            log_message('error', 'Category list error: ' . $e->getMessage());
            return $this->error('Failed to retrieve categories: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get category by ID
     * GET /api/categories/:id
     */
    public function show($id = null)
    {
        try {
            $category = $this->categoryModel->find($id);

            if (!$category) {
                return $this->notFound('Category not found');
            }

            return $this->success($category, 'Category retrieved successfully');
        } catch (\Exception $e) {
            log_message('error', 'Category show error: ' . $e->getMessage());
            return $this->error('Failed to retrieve category: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Create category
     * POST /api/categories
     * Manager/Admin only
     */
    public function create()
    {
        try {
            $userRole = $this->request->user['role'] ?? null;

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only admins and managers can create categories');
            }

            // Get JSON input if available, otherwise get POST data
            $json = $this->request->getJSON(true);
            $name = $json['name'] ?? $this->request->getPost('name');
            $parentId = $json['parent_id'] ?? $this->request->getPost('parent_id');
            $description = $json['description'] ?? $this->request->getPost('description');

            $rules = [
                'name'        => 'required|min_length[2]|max_length[255]',
                'parent_id'   => 'permit_empty|integer|is_not_unique[product_categories.id]',
                'description' => 'permit_empty',
            ];

            $validationData = [
                'name'        => $name,
                'parent_id'   => $parentId ?: null,
                'description' => $description ?: null,
            ];

            if (!$this->validate($rules, $validationData)) {
                return $this->validationError($this->validator->getErrors());
            }

            $data = [
                'name'        => $name,
                'parent_id'   => $parentId ?: null,
                'description' => $description ?: null,
            ];

            $categoryId = $this->categoryModel->insert($data);

            if (!$categoryId) {
                return $this->error('Failed to create category', $this->categoryModel->errors(), 500);
            }

            $category = $this->categoryModel->find($categoryId);
            return $this->success($category, 'Category created successfully', 201);
        } catch (\Exception $e) {
            log_message('error', 'Category create error: ' . $e->getMessage());
            return $this->error('Failed to create category: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Update category
     * PUT /api/categories/:id
     * Manager/Admin only
     */
    public function update($id = null)
    {
        try {
            $userRole = $this->request->user['role'] ?? null;

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only admins and managers can update categories');
            }

            $category = $this->categoryModel->find($id);

            if (!$category) {
                return $this->notFound('Category not found');
            }

            // Prevent setting parent to itself or creating circular references
            $json = $this->request->getJSON(true);
            $parentId = $json['parent_id'] ?? $this->request->getPost('parent_id') ?? $this->request->getVar('parent_id');
            
            if ($parentId && (int)$parentId === (int)$id) {
                return $this->error('Category cannot be its own parent', null, 400);
            }

            // Get other fields
            $name = $json['name'] ?? $this->request->getPost('name') ?? $this->request->getVar('name');
            $description = $json['description'] ?? $this->request->getPost('description') ?? $this->request->getVar('description');

            $rules = [
                'name'        => 'permit_empty|min_length[2]|max_length[255]',
                'parent_id'   => 'permit_empty|integer|is_not_unique[product_categories.id]',
                'description' => 'permit_empty',
            ];

            $data = [];
            if ($name !== null && $name !== '') {
                $data['name'] = $name;
            }
            if ($parentId !== null) {
                $data['parent_id'] = $parentId ?: null;
            }
            if ($description !== null) {
                $data['description'] = $description ?: null;
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

            if (!$this->categoryModel->update($id, $data)) {
                return $this->error('Failed to update category', $this->categoryModel->errors(), 500);
            }

            $updatedCategory = $this->categoryModel->find($id);
            return $this->success($updatedCategory, 'Category updated successfully');
        } catch (\Exception $e) {
            log_message('error', 'Category update error: ' . $e->getMessage());
            return $this->error('Failed to update category: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Delete category
     * DELETE /api/categories/:id
     * Manager/Admin only
     */
    public function delete($id = null)
    {
        try {
            $userRole = $this->request->user['role'] ?? null;

            if (!in_array($userRole, ['admin', 'manager'])) {
                return $this->forbidden('Only admins and managers can delete categories');
            }

            $category = $this->categoryModel->find($id);

            if (!$category) {
                return $this->notFound('Category not found');
            }

            // Check if category has children
            if ($this->categoryModel->hasChildren($id)) {
                return $this->error('Cannot delete category with subcategories. Please delete or move subcategories first.', null, 400);
            }

            // Check if category has products
            if ($this->categoryModel->hasProducts($id)) {
                return $this->error('Cannot delete category with products. Please remove or reassign products first.', null, 400);
            }

            if (!$this->categoryModel->delete($id)) {
                return $this->error('Failed to delete category', null, 500);
            }

            return $this->success(null, 'Category deleted successfully');
        } catch (\Exception $e) {
            log_message('error', 'Category delete error: ' . $e->getMessage());
            return $this->error('Failed to delete category: ' . $e->getMessage(), null, 500);
        }
    }
}

