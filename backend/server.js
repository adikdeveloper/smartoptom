const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/customers', require('./routes/customers'));
app.use('/api/products',  require('./routes/products'));
app.use('/api/orders',    require('./routes/orders'));
app.use('/api/income',    require('./routes/income'));
app.use('/api/expenses',  require('./routes/expenses'));
app.use('/api/stock',     require('./routes/stock'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/debts',     require('./routes/debts'));
app.use('/api/reports',   require('./routes/reports'));

// Production — frontend build papkasini serve qilish
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// MongoDB Atlas ulanish
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB ga ulandi!');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server ${process.env.PORT || 5000}-portda ishlamoqda`);
    });
  })
  .catch((err) => console.error('❌ MongoDB ulanish xatosi:', err.message));
