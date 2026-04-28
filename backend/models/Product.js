const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['19L', '10L', '5L', '1.5L', '1.0L', '0.5L'],
      default: '19L',
    },
    buyPrice: { type: Number, required: true }, // kelish narxi
    sellPrice: { type: Number, required: true }, // sotish narxi
    wholesalePrice: { type: Number }, // optom narxi
    unit: { type: String, default: 'dona' },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
