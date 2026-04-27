const router = require('express').Router();
const Order = require('../models/Order');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Customer = require('../models/Customer');
const { Stock } = require('../models/Stock');

router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));

    const [
      totalCustomers,
      totalOrders,
      monthIncome,
      monthExpense,
      todayOrders,
      lowStock,
      recentOrders,
    ] = await Promise.all([
      Customer.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Income.aggregate([
        { $match: { date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      Stock.find().populate('product', 'name').then(s => s.filter(x => x.quantity <= x.minQuantity)),
      Order.find()
        .populate('customer', 'name phone')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const totalIncome = monthIncome[0]?.total || 0;
    const totalExpense = monthExpense[0]?.total || 0;

    res.json({
      totalCustomers,
      totalOrders,
      monthIncome: totalIncome,
      monthExpense: totalExpense,
      netProfit: totalIncome - totalExpense,
      todayOrders,
      lowStockCount: lowStock.length,
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
