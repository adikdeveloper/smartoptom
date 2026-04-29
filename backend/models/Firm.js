const mongoose = require('mongoose');

const firmSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    products: { type: String, trim: true }, // Nima mahsulot sotadi
    debt: { type: Number, default: 0 }, // Bizning qarzdorligimiz
  },
  { timestamps: true }
);

module.exports = mongoose.model('Firm', firmSchema);
