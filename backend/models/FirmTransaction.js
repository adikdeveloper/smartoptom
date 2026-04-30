const mongoose = require('mongoose');

const firmTransactionSchema = new mongoose.Schema(
  {
    firm: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm', required: true },
    type: { type: String, enum: ['tolov', 'qarz'], required: true }, // tolov = qarzni uzish, qarz = mahsulot olish
    productName: { type: String },
    quantity: { type: Number },
    price: { type: Number },
    amount: { type: Number, required: true }, // umumiy summa
    paidAmount: { type: Number, default: 0 }, // berilgan pul
    paymentMethod: { type: String, enum: ['naqd', 'plastik', 'bank'] },
    notes: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FirmTransaction', firmTransactionSchema);
