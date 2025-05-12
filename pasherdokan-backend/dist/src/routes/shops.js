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
const Shop_1 = __importDefault(require("../models/Shop"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
console.log('Registering shops routes...');
router.get('/test', (req, res) => {
    res.status(200).json({ message: 'Shops router is loaded' });
});
router.post('/', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, type, location } = req.body;
        const shop = new Shop_1.default({ name, type, location, shopkeeperId: req.user.id });
        yield shop.save();
        res.status(201).json(shop);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
router.get('/', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shops = yield Shop_1.default.find({ shopkeeperId: req.user.id });
        res.json(shops);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
router.delete('/:id', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`DELETE request received for shop ID: ${req.params.id}`);
        const shop = yield Shop_1.default.findById(req.params.id);
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }
        if (shop.shopkeeperId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this shop' });
        }
        yield shop.deleteOne();
        console.log(`Shop ${req.params.id} deleted successfully`);
        res.status(200).json({ message: 'Shop deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting shop:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}));
exports.default = router;
