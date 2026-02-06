const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please provide a reservation date']
  },
  time: {
    type: String,
    required: [true, 'Please provide a reservation time'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time format (HH:MM)']
  },
  tableSize: {
    type: Number,
    required: [true, 'Please provide table size'],
    min: [1, 'Table size must be at least 1'],
    max: [20, 'Table size cannot exceed 20']
  },
  orderItems: [{
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price must be positive']
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reservation', reservationSchema);
