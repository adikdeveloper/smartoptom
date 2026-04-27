const router = require('express').Router();
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Order = require('../models/Order');
const Customer = require('../models/Customer');

// GET /api/reports/summary — umumiy hisobot
router.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery.date = {};
      if (startDate) dateQuery.date.$gte = new Date(startDate);
      if (endDate)   dateQuery.date.$lte = new Date(new Date(endDate).setHours(23,59,59));
    }

    const [incomes, expenses, orders, customers] = await Promise.all([
      Income.find(dateQuery),
      Expense.find(dateQuery),
      Order.find(startDate || endDate ? { createdAt: dateQuery.date } : {}),
      Customer.countDocuments({ isActive: true }),
    ]);

    const totalIncome  = incomes.reduce((s, i) => s + i.amount, 0);
    const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
    const netProfit    = totalIncome - totalExpense;

    // Kategoriya bo'yicha chiqimlar
    const expenseByCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    // Kategoriya bo'yicha kirimlar
    const incomeByCategory = incomes.reduce((acc, i) => {
      acc[i.category] = (acc[i.category] || 0) + i.amount;
      return acc;
    }, {});

    // To'lov usuli bo'yicha
    const incomeByMethod = incomes.reduce((acc, i) => {
      acc[i.paymentMethod] = (acc[i.paymentMethod] || 0) + i.amount;
      return acc;
    }, {});

    res.json({
      totalIncome, totalExpense, netProfit,
      totalOrders: orders.length,
      totalCustomers: customers,
      incomeCount: incomes.length,
      expenseCount: expenses.length,
      expenseByCategory,
      incomeByCategory,
      incomeByMethod,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reports/monthly — oylik dinamika (so'nggi 6 oy)
router.get('/monthly', async (req, res) => {
  try {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const label = start.toLocaleString('uz-UZ', { month: 'short', year: '2-digit' });

      const [inc, exp] = await Promise.all([
        Income.aggregate([{ $match: { date: { $gte: start, $lte: end } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        Expense.aggregate([{ $match: { date: { $gte: start, $lte: end } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      ]);

      months.push({
        name: label,
        kirim: inc[0]?.total || 0,
        chiqim: exp[0]?.total || 0,
        foyda: (inc[0]?.total || 0) - (exp[0]?.total || 0),
      });
    }
    res.json(months);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
