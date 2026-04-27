const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: {
      type: String,
      enum: [
        'xom_ashyo',
        'yetkazib_berish',
        'ish_haqi',
        'ijara',
        'kommunal',
        'transport',
        'boshqa',
      ],
      default: 'boshqa',
    },
    paymentMethod: {
      type: String,
      enum: ['naqd', 'plastik', 'bank'],
      default: 'naqd',
    },
    date: { type: Date, default: Date.now },
    notes: { type: String },
    receipt: { type: String }, // chek raqami yoki fayl
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
