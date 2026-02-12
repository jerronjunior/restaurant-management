const { validationResult } = require('express-validator');
const { getDb, admin } = require('../config/firebaseAdmin');

// @route   GET /api/menu
// @desc    Get all menu items
// @access  Public
exports.getMenuItems = async (req, res) => {
  try {
    const { category } = req.query;
    const db = getDb();
    let query = db.collection('menuItems').where('available', '==', true);

    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const menuItems = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/menu/:id
// @desc    Get single menu item
// @access  Public
exports.getMenuItem = async (req, res) => {
  try {
    const db = getDb();
    const doc = await db.collection('menuItems').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({
      success: true,
      data: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST /api/menu
// @desc    Create new menu item (Admin only)
// @access  Private/Admin
exports.createMenuItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const db = getDb();
    const payload = {
      ...req.body,
      available: req.body.available ?? true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    const docRef = await db.collection('menuItems').add(payload);
    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...payload }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/menu/:id
// @desc    Update menu item (Admin only)
// @access  Private/Admin
exports.updateMenuItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const db = getDb();
    const docRef = db.collection('menuItems').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    const payload = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await docRef.update(payload);

    res.json({
      success: true,
      data: { id: doc.id, ...doc.data(), ...payload }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   DELETE /api/menu/:id
// @desc    Delete menu item (Admin only)
// @access  Private/Admin
exports.deleteMenuItem = async (req, res) => {
  try {
    const db = getDb();
    const docRef = db.collection('menuItems').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    await docRef.delete();

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
