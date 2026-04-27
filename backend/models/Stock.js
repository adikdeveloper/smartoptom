const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, default: 0 },
    minQuantity: { type: Number, default: 10 }, // minimal chegara (ogohlantirish uchun)
    location: { type: String, default: 'Asosiy sklad' },
  },
  { timestamps: true }
);

// Sklad harakatlari (kirim/chiqim)
const stockMovementSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    type: { type: String, enum: ['kirim', 'chiqim'], required: true },
    quantity: { type: Number, required: true },
    reason: { type: String }, // sabab: sotildi, qaytarildi, etc.
    reference: { type: String }, // order ID yoki boshqa reference
    notes: { type: String },
    performedBy: { type: String, default: 'Admin' },
  },
  { timestamps: true }
);

const Stock = mongoose.model('Stock', stockSchema);
const StockMovement = mongoose.model('StockMovement', stockMovementSchema);

module.exports = { Stock, StockMovement };
