const router = require('express').Router();
const Order = require('../models/Order');
const Income = require('../models/Income');
const Debt = require('../models/Debt');
const Customer = require('../models/Customer');
const { Stock, StockMovement } = require('../models/Stock');

// GET - barcha buyurtmalar
router.get('/', async (req, res) => {
  try {
    const { status, customer } = req.query;
    let query = {};
    if (status) query.status = status;
    if (customer) query.customer = customer;
    const orders = await Order.find(query)
      .populate('customer', 'name phone')
      .populate('items.product', 'name category')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer')
      .populate('items.product');
    if (!order) return res.status(404).json({ message: "Buyurtma topilmadi" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - yangi buyurtma
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();

    // Agar to'lov bo'lsa, kirim yaratish
    if (order.paidAmount > 0) {
      await Income.create({
        title: `Buyurtma to'lovi - ${order.orderNumber}`,
        amount: order.paidAmount,
        category: 'sotuv',
        paymentMethod: order.paymentMethod,
        customer: order.customer,
        order: order._id,
      });
    }

    // Agar qarz bo'lsa, qarzdorlik yozish
    if (order.remainingDebt > 0) {
      await Debt.create({
        customer: order.customer,
        order: order._id,
        totalAmount: order.totalAmount,
        paidAmount: order.paidAmount,
        remaining: order.remainingDebt,
        status: order.paidAmount > 0 ? 'qisman' : 'tolanmagan',
        notes: `Buyurtma: ${order.orderNumber}`,
      });
      // Mijoz umumiy qarzini yangilash
      await Customer.findByIdAndUpdate(order.customer, {
        $inc: { debt: order.remainingDebt },
      });
    }

    // Sklad dan chiqim — avval yetarliligini tekshirish
    for (const item of order.items) {
      const stock = await Stock.findOne({ product: item.product });
      const available = stock?.quantity || 0;
      if (available < item.quantity) {
        // Buyurtmani o'chirib, xato qaytaramiz
        await Order.findByIdAndDelete(order._id);
        const prod = await require('../models/Product').findById(item.product);
        return res.status(400).json({
          message: `"${prod?.name || 'Mahsulot'}" uchun skladda yetarli miqdor yo'q! Mavjud: ${available} ta`,
        });
      }
    }

    for (const item of order.items) {
      await StockMovement.create({
        product: item.product,
        type: 'chiqim',
        quantity: item.quantity,
        reason: 'sotildi',
        reference: order.orderNumber,
      });

      await Stock.findOneAndUpdate(
        { product: item.product },
        // $max:0 manfiy bo'lishini oldini oladi
        [{ $set: { quantity: { $max: [{ $subtract: ['$quantity', item.quantity] }, 0] } } }],
        { upsert: true, new: true }
      );
    }

    const populated = await Order.findById(order._id).populate('customer', 'name phone').populate('items.product', 'name');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT - buyurtmani yangilash
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Buyurtma o'chirildi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
