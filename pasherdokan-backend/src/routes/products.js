const express = require('express');
const asyncHandler = require('express-async-handler');
const router = express.Router();
const Product = require('../models/Product');

// Create a product
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  })
);

// Get products by shop
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { shop } = req.query;
    const products = await Product.find({ shop });
    res.json(products);
  })
);

module.exports = router;