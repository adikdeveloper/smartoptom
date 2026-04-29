const mongoose = require('mongoose');

const firmTransactionSchema = new mongoose.Schema(
  {
    firm: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm', required: true },
    type: { type: String, enum: ['tolov', 'qarz'], required: true }, // tolov = qarzni uzish, qarz = mahsulot olish
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['naqd', 'plastik', 'bank'] }, // faqat 'tolov' bo'lsa
    notes: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FirmTransaction', firmTransactionSchema);
