"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Order_1 = __importDefault(require("../models/Order"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
router.post('/', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shopId, products, totalPrice } = req.body;
        const order = new Order_1.default({ customerId: req.user.id, shopId, products, totalPrice });
        yield order.save();
        res.status(201).json(order);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
router.get('/customer', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield Order_1.default.find({ customerId: req.user.id }).populate('products.productId');
        res.json(orders);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
router.put('/:id/status', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const order = yield Order_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(order);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
exports.default = router;
