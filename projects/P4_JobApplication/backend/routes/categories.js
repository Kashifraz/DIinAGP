const express = require('express');
const { 
  getCategories, 
  getCategory, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  getCategoryStats,
  reorderCategories
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/stats', getCategoryStats);
router.get('/:id', getCategory);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize('admin'));

router.post('/', validate(schemas.category), createCategory);
router.put('/:id', validate(schemas.categoryUpdate), updateCategory);
router.delete('/:id', deleteCategory);
router.put('/reorder', validate(schemas.categoryReorder), reorderCategories);

module.exports = router;