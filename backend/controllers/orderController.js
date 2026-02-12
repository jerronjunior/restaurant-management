const { validationResult } = require('express-validator');
const { getDb, admin } = require('../config/firebaseAdmin');

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
    const db = getDb();

    // Calculate total price and populate item details
    let totalPrice = 0;
    const populatedItems = await Promise.all(
      items.map(async (item) => {
        const menuDoc = await db.collection('menuItems').doc(item.menuItemId).get();
        if (!menuDoc.exists) {
          throw new Error(`Menu item ${item.menuItemId} not found`);
        }
        const menuItem = menuDoc.data();
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

    const payload = {
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      reservationId: reservationId || null,
      items: populatedItems,
      totalPrice,
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('orders').add(payload);
    const populatedOrder = { id: docRef.id, ...payload };

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
    const db = getDb();
    let query = db.collection('orders');

    if (req.user.role !== 'admin') {
      query = query.where('userId', '==', req.user.id);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

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
    const db = getDb();
    const doc = await db.collection('orders').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = { id: doc.id, ...doc.data() };

    // Check if user owns the order or is admin
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
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

    const db = getDb();
    const docRef = db.collection('orders').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await docRef.update({
      orderStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const order = { id: doc.id, ...doc.data(), orderStatus };

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
