"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Product_1 = __importDefault(require("../models/Product"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
router.post('/', auth_1.default, async (req, res) => {
    try {
        const { name, category, price, stock, shopId } = req.body;
        const product = new Product_1.default({ name, category, price, stock, shopId });
        await product.save();
        res.status(201).json(product);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.get('/shop/:shopId', auth_1.default, async (req, res) => {
    try {
        const products = await Product_1.default.find({ shopId: req.params.shopId });
        res.json(products);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.default = router;
