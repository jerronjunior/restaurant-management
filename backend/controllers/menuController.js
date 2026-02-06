const MenuItem = require('../models/MenuItem');
const { validationResult } = require('express-validator');

// @route   GET /api/menu
// @desc    Get all menu items
// @access  Public
exports.getMenuItems = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category, available: true } : { available: true };
    
    const menuItems = await MenuItem.find(query).sort({ createdAt: -1 });
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
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({
      success: true,
      data: menuItem
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

    const menuItem = await MenuItem.create(req.body);
    res.status(201).json({
      success: true,
      data: menuItem
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

    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({
      success: true,
      data: menuItem
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
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
