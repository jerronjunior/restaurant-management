const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide payment amount'],
    min: [0, 'Amount must be positive']
  },
  method: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'Cash', 'Online Payment'],
    default: 'Online Payment'
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  transactionId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
