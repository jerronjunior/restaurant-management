const express = require('express');
const router = express.Router();
const {
  getStats,
  getAllReservations,
  getAllOrders,
  getCustomers,
  updateCustomerBlock,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  getDeliveries,
  createDelivery,
  updateDelivery,
  deleteDelivery,
  getSettings,
  updateSettings,
  getSalesReports,
  streamOrders,
  streamMenuItems,
  streamDeliveries,
  streamCategories,
  streamOffers
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(admin);

// Routes
router.get('/stats', getStats);
router.get('/reservations', getAllReservations);
router.get('/orders/stream', streamOrders);
router.get('/menu/stream', streamMenuItems);
router.get('/orders', getAllOrders);
router.get('/customers', getCustomers);
router.put('/customers/:id/block', updateCustomerBlock);
router.get('/categories', getCategories);
router.get('/categories/stream', streamCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);
router.get('/offers', getOffers);
router.get('/offers/stream', streamOffers);
router.post('/offers', createOffer);
router.put('/offers/:id', updateOffer);
router.delete('/offers/:id', deleteOffer);
router.get('/deliveries', getDeliveries);
router.get('/deliveries/stream', streamDeliveries);
router.post('/deliveries', createDelivery);
router.put('/deliveries/:id', updateDelivery);
router.delete('/deliveries/:id', deleteDelivery);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/reports', getSalesReports);

module.exports = router;
