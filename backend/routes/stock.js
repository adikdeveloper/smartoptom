const router = require('express').Router();
const { Stock, StockMovement } = require('../models/Stock');

// GET - barcha sklad ma'lumotlari
router.get('/', async (req, res) => {
  try {
    const stocks = await Stock.find().populate('product', 'name category unit');
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - sklad harakatlari
router.get('/movements', async (req, res) => {
  try {
    const { type, product } = req.query;
    let query = {};
    if (type) query.type = type;
    if (product) query.product = product;
    const movements = await StockMovement.find(query)
      .populate('product', 'name category')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(movements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - sklad kirim (mahsulot qo'shish)
router.post('/add', async (req, res) => {
  try {
    const { product, quantity, notes, performedBy } = req.body;

    await StockMovement.create({
      product, quantity, type: 'kirim',
      reason: 'qo\'lda kirim', notes, performedBy,
    });

    const stock = await Stock.findOneAndUpdate(
      { product },
      { $inc: { quantity } },
      { upsert: true, new: true }
    ).populate('product', 'name category unit');

    res.json(stock);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT - minimal miqdor yangilash
router.put('/:id', async (req, res) => {
  try {
    const stock = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(stock);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET - kam qolgan mahsulotlar (100 ta yoki undan kam)
router.get('/low-stock', async (req, res) => {
  try {
    const stocks = await Stock.find().populate('product', 'name category unit');
    const lowStock = stocks.filter(s => s.quantity <= 100);
    res.json(lowStock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
