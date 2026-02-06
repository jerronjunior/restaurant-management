const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { validationResult } = require('express-validator');

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

    // Get order details
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to pay for this order' });
    }

    // Simulate payment processing
    // In a real application, you would integrate with a payment gateway here
    const payment = await Payment.create({
      orderId,
      userId: req.user.id,
      amount: order.totalPrice,
      method: method || 'Online Payment',
      status: 'Completed', // Simulated - always succeeds
      transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`
    });

    // Update order payment status
    order.paymentStatus = 'Paid';
    await order.save();

    const populatedPayment = await Payment.findById(payment._id)
      .populate('orderId')
      .populate('userId', 'name email');

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
    const query = req.user.role === 'admin' ? {} : { userId: req.user.id };
    
    const payments = await Payment.find(query)
      .populate('orderId')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

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
    const payment = await Payment.findById(req.params.id)
      .populate('orderId')
      .populate('userId', 'name email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user owns the payment or is admin
    if (payment.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
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
