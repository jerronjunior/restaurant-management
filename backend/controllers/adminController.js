const { getDb, admin } = require('../config/firebaseAdmin');

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private/Admin
exports.getStats = async (req, res) => {
  try {
    // Get total revenue (from completed payments)
    const db = getDb();
    const paymentsSnapshot = await db.collection('payments')
      .where('status', '==', 'Completed')
      .get();
    const payments = paymentsSnapshot.docs.map((doc) => doc.data());
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Get daily revenue (today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayPaymentsSnapshot = await db.collection('payments')
      .where('status', '==', 'Completed')
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(today))
      .where('createdAt', '<', admin.firestore.Timestamp.fromDate(tomorrow))
      .get();
    const todayPayments = todayPaymentsSnapshot.docs.map((doc) => doc.data());
    const dailyRevenue = todayPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Get counts
    const ordersSnapshot = await db.collection('orders').get();
    const reservationsSnapshot = await db.collection('reservations').get();
    const pendingOrdersSnapshot = await db.collection('orders')
      .where('orderStatus', '==', 'Pending')
      .get();
    const confirmedReservationsSnapshot = await db.collection('reservations')
      .where('status', '==', 'Confirmed')
      .get();

    const totalOrders = ordersSnapshot.size;
    const totalReservations = reservationsSnapshot.size;
    const pendingOrders = pendingOrdersSnapshot.size;
    const confirmedReservations = confirmedReservationsSnapshot.size;

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
    const db = getDb();
    const reservationsSnapshot = await db.collection('reservations')
      .orderBy('createdAt', 'desc')
      .get();
    const reservations = reservationsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

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
    const db = getDb();
    const ordersSnapshot = await db.collection('orders')
      .orderBy('createdAt', 'desc')
      .get();
    const orders = ordersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
