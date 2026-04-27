const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    remainingDebt: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ['naqd', 'plastik', 'nasiya', 'bank'],
      default: 'naqd',
    },
    status: {
      type: String,
      enum: ['yangi', 'tasdiqlangan', 'yetkazilgan', 'bekor'],
      default: 'yangi',
    },
    deliveryAddress: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

// Auto order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `SUV-${String(count + 1).padStart(4, '0')}`;
  }
  this.remainingDebt = this.totalAmount - this.paidAmount;
  next();
});

module.exports = mongoose.model('Order', orderSchema);
