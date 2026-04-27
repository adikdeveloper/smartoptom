const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: {
      type: String,
      enum: ['sotuv', 'qaytarilgan_pul', 'boshqa'],
      default: 'sotuv',
    },
    paymentMethod: {
      type: String,
      enum: ['naqd', 'plastik', 'bank'],
      default: 'naqd',
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    date: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Income', incomeSchema);
