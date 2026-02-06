const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createReservation,
  getReservations,
  getReservation,
  cancelReservation
} = require('../controllers/reservationController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

// Validation rules
const reservationValidation = [
  body('date').notEmpty().withMessage('Date is required'),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
  body('tableSize').isInt({ min: 1, max: 20 }).withMessage('Table size must be between 1 and 20'),
  body('orderItems').isArray({ min: 0 }).withMessage('Order items must be an array'),
  body('orderItems.*.menuItemId').notEmpty().withMessage('Menu item ID is required'),
  body('orderItems.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

// Routes
router.post('/', protect, reservationValidation, handleValidationErrors, createReservation);
router.get('/', protect, getReservations);
router.get('/:id', protect, getReservation);
router.put('/:id/cancel', protect, cancelReservation);

module.exports = router;
