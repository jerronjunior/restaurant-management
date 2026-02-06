const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

// Validation rules
const orderValidation = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.menuItemId').notEmpty().withMessage('Menu item ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

// Routes
router.post('/', protect, orderValidation, handleValidationErrors, createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
