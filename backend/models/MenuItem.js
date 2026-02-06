const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a menu item name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price must be positive']
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/300x200?text=Food+Item'
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Salad', 'Soup'],
    default: 'Main Course'
  },
  available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
