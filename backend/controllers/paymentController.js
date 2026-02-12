const { validationResult } = require('express-validator');
const { getDb, admin } = require('../config/firebaseAdmin');

// @route   POST /api/payments
// @desc    Create a payment
// @access  Private
exports.createPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId, method } = req.body;
    const db = getDb();

    // Get order details
    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderDoc.data();

    // Check if user owns the order
    if (order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to pay for this order' });
    }

    // Simulate payment processing
    // In a real application, you would integrate with a payment gateway here
    const payload = {
      orderId,
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      amount: order.totalPrice,
      method: method || 'Online Payment',
      status: 'Completed',
      transactionId: `TXN${Date.now()}${Math.random().toString(36).slice(2, 9)}`,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const paymentRef = await db.collection('payments').add(payload);

    // Update order payment status
    await db.collection('orders').doc(orderId).update({
      paymentStatus: 'Paid',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const populatedPayment = { id: paymentRef.id, ...payload };

    res.status(201).json({
      success: true,
      data: populatedPayment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/payments
// @desc    Get user's payments or all payments (admin)
// @access  Private
exports.getPayments = async (req, res) => {
  try {
    const db = getDb();
    let query = db.collection('payments');

    if (req.user.role !== 'admin') {
      query = query.where('userId', '==', req.user.id);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const payments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/payments/:id
// @desc    Get single payment
// @access  Private
exports.getPayment = async (req, res) => {
  try {
    const db = getDb();
    const doc = await db.collection('payments').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const payment = { id: doc.id, ...doc.data() };

    // Check if user owns the payment or is admin
    if (payment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this payment' });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
