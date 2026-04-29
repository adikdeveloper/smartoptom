const router = require('express').Router();
const Firm = require('../models/Firm');
const FirmTransaction = require('../models/FirmTransaction');
const Expense = require('../models/Expense');

// Barcha firmalarni olish
router.get('/', async (req, res) => {
  try {
    const firms = await Firm.find().sort({ createdAt: -1 });
    res.json(firms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Yangi firma qo'shish
router.post('/', async (req, res) => {
  try {
    const firm = new Firm(req.body);
    await firm.save();
    res.status(201).json(firm);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Firmani yangilash
router.put('/:id', async (req, res) => {
  try {
    const firm = await Firm.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(firm);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Firmani o'chirish
router.delete('/:id', async (req, res) => {
  try {
    await Firm.findByIdAndDelete(req.params.id);
    await FirmTransaction.deleteMany({ firm: req.params.id });
    res.json({ message: "Firma o'chirildi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Firma tranzaksiyalarini olish
router.get('/:id/transactions', async (req, res) => {
  try {
    const txs = await FirmTransaction.find({ firm: req.params.id }).sort({ date: -1 });
    res.json(txs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Tranzaksiya qo'shish (To'lov yoki Qarz)
router.post('/:id/transactions', async (req, res) => {
  try {
    const firmId = req.params.id;
    const { type, amount, paymentMethod, notes } = req.body;
    
    const firm = await Firm.findById(firmId);
    if (!firm) return res.status(404).json({ message: 'Firma topilmadi' });

    const tx = new FirmTransaction({
      firm: firmId,
      type,
      amount,
      paymentMethod: type === 'tolov' ? paymentMethod : undefined,
      notes
    });
    await tx.save();

    if (type === 'tolov') {
      firm.debt -= amount;
      // To'lov qilinganda umumiy chiqimga ham yoziladi
      await Expense.create({
        title: `Firmaga to'lov: ${firm.name}`,
        amount,
        category: 'xom_ashyo',
        paymentMethod,
        notes: notes || 'Firmaga qarzni uzish',
      });
    } else if (type === 'qarz') {
      firm.debt += amount;
      // Qarzga mahsulot olinganda faqat qarz oshadi, real pul kamaymaydi (Expense yaratilmaydi)
    }

    await firm.save();
    res.status(201).json({ tx, firm });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
