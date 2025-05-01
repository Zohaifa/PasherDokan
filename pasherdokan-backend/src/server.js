const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/shops', require('./routes/shops'));
app.use('/products', require('./routes/products'));
app.use('/orders', require('./routes/orders'));

// Debug: Log the MONGO_URI to verify it's loaded
console.log('MONGO_URI:', process.env.MONGO_URI);

// Connect to MongoDB Atlas with enhanced debugging
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error('MONGO_URI is not defined in the .env file');
}
mongoose
  .connect(MONGO_URI, {
    tls: true,
    tlsInsecure: false, // Ensures strict TLS validation
    serverSelectionTimeoutMS: 5000, // Timeout for server selection
  })
  .then(() => console.log('MongoDB Atlas connected'))
  .catch((err) => console.error('MongoDB Atlas connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});