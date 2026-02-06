const Order = require('../models/Order');
const Reservation = require('../models/Reservation');
const Payment = require('../models/Payment');

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private/Admin
exports.getStats = async (req, res) => {
  try {
    // Get total revenue (from completed payments)
    const payments = await Payment.find({ status: 'Completed' });
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Get daily revenue (today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayPayments = await Payment.find({
      status: 'Completed',
      createdAt: { $gte: today, $lt: tomorrow }
    });
    const dailyRevenue = todayPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Get counts
    const totalOrders = await Order.countDocuments();
    const totalReservations = await Reservation.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
    const confirmedReservations = await Reservation.countDocuments({ status: 'Confirmed' });

    res.json({
      success: true,
      data: {
        totalRevenue,
        dailyRevenue,
        totalOrders,
        totalReservations,
        pendingOrders,
        confirmedReservations
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/admin/reservations
// @desc    Get all reservations (Admin)
// @access  Private/Admin
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('orderItems.menuItemId', 'name description image price')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/admin/orders
// @desc    Get all orders (Admin)
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('reservationId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
