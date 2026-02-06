const Reservation = require('../models/Reservation');
const MenuItem = require('../models/MenuItem');
const { validationResult } = require('express-validator');

// @route   POST /api/reservations
// @desc    Create a new reservation
// @access  Private
exports.createReservation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, time, tableSize, orderItems } = req.body;

    // Calculate total price from order items
    let totalPrice = 0;
    const populatedOrderItems = await Promise.all(
      orderItems.map(async (item) => {
        const menuItem = await MenuItem.findById(item.menuItemId);
        if (!menuItem) {
          throw new Error(`Menu item ${item.menuItemId} not found`);
        }
        const itemTotal = menuItem.price * item.quantity;
        totalPrice += itemTotal;
        return {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: menuItem.price
        };
      })
    );

    const reservation = await Reservation.create({
      userId: req.user.id,
      date,
      time,
      tableSize,
      orderItems: populatedOrderItems,
      totalPrice
    });

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('orderItems.menuItemId', 'name description image')
      .populate('userId', 'name email');

    res.status(201).json({
      success: true,
      data: populatedReservation
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/reservations
// @desc    Get user's reservations or all reservations (admin)
// @access  Private
exports.getReservations = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { userId: req.user.id };
    
    const reservations = await Reservation.find(query)
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

// @route   GET /api/reservations/:id
// @desc    Get single reservation
// @access  Private
exports.getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('orderItems.menuItemId', 'name description image price')
      .populate('userId', 'name email');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check if user owns the reservation or is admin
    if (reservation.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this reservation' });
    }

    res.json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/reservations/:id/cancel
// @desc    Cancel a reservation
// @access  Private
exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check if user owns the reservation or is admin
    if (reservation.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
    }

    // Only allow cancellation if status is Pending
    if (reservation.status !== 'Pending') {
      return res.status(400).json({ message: 'Cannot cancel a reservation that is not pending' });
    }

    reservation.status = 'Cancelled';
    await reservation.save();

    res.json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
