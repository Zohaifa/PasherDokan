const express = require('express');
const asyncHandler = require('express-async-handler');
const router = express.Router();
const Order = require('../models/Order');

// Create an order
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  })
);

module.exports = router;