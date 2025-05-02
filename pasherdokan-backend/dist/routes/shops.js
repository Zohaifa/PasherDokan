"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Shop_1 = __importDefault(require("../models/Shop"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
router.post('/', auth_1.default, async (req, res) => {
    try {
        const { name, type, location } = req.body;
        const shop = new Shop_1.default({ name, type, location, shopkeeperId: req.user.id });
        await shop.save();
        res.status(201).json(shop);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.get('/', auth_1.default, async (req, res) => {
    try {
        const shops = await Shop_1.default.find({ shopkeeperId: req.user.id });
        res.json(shops);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.default = router;
