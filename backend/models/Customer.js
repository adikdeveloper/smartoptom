const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    address: { type: String },
    company: { type: String },
    type: {
      type: String,
      enum: ['oddiy', 'vip', 'ulgurji'],
      default: 'oddiy',
    },
    debt: { type: Number, default: 0 }, // qarzdorlik
    totalBought: { type: Number, default: 0 },
    notes: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);
