const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    totalAmount: { type: Number, required: true },   // umumiy qarz
    paidAmount: { type: Number, default: 0 },         // to'langan
    remaining: { type: Number, required: true },       // qolgan qarz
    dueDate: { type: Date },                           // to'lash muddati
    status: {
      type: String,
      enum: ['tolanmagan', 'qisman', 'tolangan'],
      default: 'tolanmagan',
    },
    notes: { type: String },
    payments: [
      {
        amount: Number,
        paymentMethod: { type: String, enum: ['naqd', 'plastik', 'bank'], default: 'naqd' },
        date: { type: Date, default: Date.now },
        notes: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Debt', debtSchema);
