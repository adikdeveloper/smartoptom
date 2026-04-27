const router = require('express').Router();
const Debt = require('../models/Debt');
const Customer = require('../models/Customer');
const Income = require('../models/Income');

// GET - barcha qarzdorliklar
router.get('/', async (req, res) => {
  try {
    const { status, customer } = req.query;
    let query = {};
    if (status) query.status = status;
    if (customer) query.customer = customer;

    const debts = await Debt.find(query)
      .populate('customer', 'name phone address company type')
      .populate('order', 'orderNumber totalAmount createdAt')
      .sort({ createdAt: -1 });

    const totalDebt = debts.reduce((s, d) => s + d.remaining, 0);
    const totalCount = debts.length;
    const unpaidCount = debts.filter(d => d.status === 'tolanmagan').length;

    res.json({ debts, totalDebt, totalCount, unpaidCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - bitta mijozning qarzlari
router.get('/customer/:customerId', async (req, res) => {
  try {
    const debts = await Debt.find({ customer: req.params.customerId, status: { $ne: 'tolangan' } })
      .populate('order', 'orderNumber totalAmount');
    const total = debts.reduce((s, d) => s + d.remaining, 0);
    res.json({ debts, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - qo'lda qarz qo'shish
router.post('/', async (req, res) => {
  try {
    const { customer, totalAmount, paidAmount = 0, dueDate, notes } = req.body;
    const remaining = totalAmount - paidAmount;

    const debt = new Debt({
      customer,
      totalAmount,
      paidAmount,
      remaining,
      dueDate,
      notes,
      status: remaining <= 0 ? 'tolangan' : paidAmount > 0 ? 'qisman' : 'tolanmagan',
    });
    await debt.save();

    // Mijoz qarzini yangilash
    await Customer.findByIdAndUpdate(customer, { $inc: { debt: remaining } });

    const populated = await Debt.findById(debt._id)
      .populate('customer', 'name phone');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST - qarz to'lovi qilish
router.post('/:id/pay', async (req, res) => {
  try {
    const { amount, paymentMethod = 'naqd', notes } = req.body;
    const debt = await Debt.findById(req.params.id);
    if (!debt) return res.status(404).json({ message: 'Qarz topilmadi' });

    const payAmount = Math.min(+amount, debt.remaining);

    debt.paidAmount += payAmount;
    debt.remaining -= payAmount;
    debt.payments.push({ amount: payAmount, paymentMethod, notes });

    if (debt.remaining <= 0) {
      debt.remaining = 0;
      debt.status = 'tolangan';
    } else {
      debt.status = 'qisman';
    }

    await debt.save();

    // Mijoz qarzini kamaytirish
    await Customer.findByIdAndUpdate(debt.customer, { $inc: { debt: -payAmount } });

    // Kirim yozish
    await Income.create({
      title: `Qarz to'lovi`,
      amount: payAmount,
      category: 'qaytarilgan_pul',
      paymentMethod,
      customer: debt.customer,
      notes: notes || `Qarz to'lovi`,
    });

    const populated = await Debt.findById(debt._id)
      .populate('customer', 'name phone');
    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE - qarzni o'chirish
router.delete('/:id', async (req, res) => {
  try {
    const debt = await Debt.findById(req.params.id);
    if (!debt) return res.status(404).json({ message: 'Topilmadi' });
    await Customer.findByIdAndUpdate(debt.customer, { $inc: { debt: -debt.remaining } });
    await Debt.findByIdAndDelete(req.params.id);
    res.json({ message: "Qarz o'chirildi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
