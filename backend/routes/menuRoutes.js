const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getMenuItems,
  getMenuCategories,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menuController');
const { protect, admin } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

// Validation rules
const menuItemValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').optional().isIn([
    'Starters',
    'Main Courses',
    'Rice & Noodles',
    'Burgers & Fast Food',
    'Pizza',
    'Desserts',
    'Beverages',
    "Chef's Specials"
  ])
    .withMessage('Invalid category')
];

// Routes
router.get('/categories', getMenuCategories);
router.get('/', getMenuItems);
router.get('/:id', getMenuItem);
router.post('/', protect, admin, menuItemValidation, handleValidationErrors, createMenuItem);
router.put('/:id', protect, admin, menuItemValidation, handleValidationErrors, updateMenuItem);
router.delete('/:id', protect, admin, deleteMenuItem);

module.exports = router;
