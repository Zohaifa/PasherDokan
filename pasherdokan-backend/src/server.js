const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/shops', require('./routes/shops'));
app.use('/products', require('./routes/products'));
app.use('/orders', require('./routes/orders'));

// Connect to MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Atlas connected'))
  .catch((err) => console.error('MongoDB Atlas connection error:', err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});