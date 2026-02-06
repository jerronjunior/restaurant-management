const express = require('express');
const router = express.Router();
const {
  getStats,
  getAllReservations,
  getAllOrders
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(admin);

// Routes
router.get('/stats', getStats);
router.get('/reservations', getAllReservations);
router.get('/orders', getAllOrders);

module.exports = router;
