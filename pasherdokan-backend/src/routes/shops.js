const express = require('express');
const asyncHandler = require('express-async-handler');
const router = express.Router();
const Shop = require('../models/Shop');

// Create a shop
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const shop = new Shop(req.body);
    await shop.save();
    res.status(201).json(shop);
  })
);

// Get nearby shops (within 2 km)
router.get(
  '/nearby',
  asyncHandler(async (req, res) => {
    const { lat, lng } = req.query;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // Approximate 2 km in degrees (1 degree ≈ 111 km)
    const distance = 2 / 111;

    const shops = await Shop.find({
      'location.latitude': { $gte: latitude - distance, $lte: latitude + distance },
      'location.longitude': { $gte: longitude - distance, $lte: longitude + distance },
    });

    res.json(shops);
  })
);

module.exports = router;