const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { validationResult } = require('express-validator');

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, reservationId } = req.body;

    // Calculate total price and populate item details
    let totalPrice = 0;
    const populatedItems = await Promise.all(
      items.map(async (item) => {
        const menuItem = await MenuItem.findById(item.menuItemId);
        if (!menuItem) {
          throw new Error(`Menu item ${item.menuItemId} not found`);
        }
        const itemTotal = menuItem.price * item.quantity;
        totalPrice += itemTotal;
        return {
          menuItemId: item.menuItemId,
          name: menuItem.name,
          quantity: item.quantity,
          price: menuItem.price
        };
      })
    );

    const order = await Order.create({
      userId: req.user.id,
      reservationId: reservationId || null,
      items: populatedItems,
      totalPrice
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('menuItemId', 'name description image')
      .populate('userId', 'name email')
      .populate('reservationId');

    res.status(201).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/orders
// @desc    Get user's orders or all orders (admin)
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { userId: req.user.id };
    
    const orders = await Order.find(query)
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

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('reservationId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order or is admin
    if (order.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this order' });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    if (!['Pending', 'Preparing', 'Ready', 'Completed'].includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
