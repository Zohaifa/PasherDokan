"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI, {
            tls: true,
            tlsInsecure: false,
            serverSelectionTimeoutMS: 10000,
        });
        console.log('MongoDB Atlas connected');
    }
    catch (error) {
        console.error('MongoDB Atlas connection error:', error);
        process.exit(1);
    }
};
exports.default = connectDB;
