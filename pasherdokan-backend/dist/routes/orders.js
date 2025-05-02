"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Order_1 = __importDefault(require("../models/Order"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
router.post('/', auth_1.default, async (req, res) => {
    try {
        const { shopId, products, totalPrice } = req.body;
        const order = new Order_1.default({ customerId: req.user.id, shopId, products, totalPrice });
        await order.save();
        res.status(201).json(order);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.get('/customer', auth_1.default, async (req, res) => {
    try {
        const orders = await Order_1.default.find({ customerId: req.user.id }).populate('products.productId');
        res.json(orders);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.put('/:id/status', auth_1.default, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(order);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.default = router;
