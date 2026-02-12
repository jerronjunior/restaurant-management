const { validationResult } = require('express-validator');
const { getDb, admin } = require('../config/firebaseAdmin');

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
    const db = getDb();

    // Calculate total price from order items
    let totalPrice = 0;
    const populatedOrderItems = await Promise.all(
      orderItems.map(async (item) => {
        const menuDoc = await db.collection('menuItems').doc(item.menuItemId).get();
        if (!menuDoc.exists) {
          throw new Error(`Menu item ${item.menuItemId} not found`);
        }
        const menuItem = menuDoc.data();
        const itemTotal = menuItem.price * item.quantity;
        totalPrice += itemTotal;
        return {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: menuItem.price,
          name: menuItem.name,
          description: menuItem.description,
          image: menuItem.image
        };
      })
    );

    const payload = {
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      date: admin.firestore.Timestamp.fromDate(new Date(date)),
      time,
      tableSize,
      orderItems: populatedOrderItems,
      totalPrice,
      status: 'Pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('reservations').add(payload);
    const populatedReservation = { id: docRef.id, ...payload };

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
    const db = getDb();
    let query = db.collection('reservations');

    if (req.user.role !== 'admin') {
      query = query.where('userId', '==', req.user.id);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const reservations = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

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
    const db = getDb();
    const doc = await db.collection('reservations').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const reservation = { id: doc.id, ...doc.data() };

    // Check if user owns the reservation or is admin
    if (reservation.userId !== req.user.id && req.user.role !== 'admin') {
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
    const db = getDb();
    const docRef = db.collection('reservations').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const reservation = { id: doc.id, ...doc.data() };

    // Check if user owns the reservation or is admin
    if (reservation.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
    }

    // Only allow cancellation if status is Pending
    if (reservation.status !== 'Pending') {
      return res.status(400).json({ message: 'Cannot cancel a reservation that is not pending' });
    }

    await docRef.update({
      status: 'Cancelled',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      data: { ...reservation, status: 'Cancelled' }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
