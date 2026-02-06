const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createPayment,
  getPayments,
  getPayment
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

// Validation rules
const paymentValidation = [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('method').optional().isIn(['Credit Card', 'Debit Card', 'Cash', 'Online Payment'])
    .withMessage('Invalid payment method')
];

// Routes
router.post('/', protect, paymentValidation, handleValidationErrors, createPayment);
router.get('/', protect, getPayments);
router.get('/:id', protect, getPayment);

module.exports = router;
