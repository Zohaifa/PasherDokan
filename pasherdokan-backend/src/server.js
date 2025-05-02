const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(express.json());

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expecting "Bearer TOKEN"

  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token.' });
    req.user = user;
    next();
  });
};

// Routes
app.use('/shops', authenticateToken, require('./routes/shops'));
app.use('/products', authenticateToken, require('./routes/products'));
app.use('/orders', authenticateToken, require('./routes/orders'));

// Debug: Log the MONGODB_URI to verify it's loaded
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://jalaldevdesign:pasherdokan@cluster0.rcicfel.mongodb.net/pasherdokan?retryWrites=true&w=majority&appName=Cluster0';
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in the .env file');
}
mongoose
  .connect(MONGODB_URI, {
    tls: true,
    tlsInsecure: false,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log('MongoDB Atlas connected'))
  .catch((err) => console.error('MongoDB Atlas connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});