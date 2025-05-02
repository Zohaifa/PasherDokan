import express from 'express';
import path from 'path';
import * as dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://192.168.1.100:8081', // Adjust based on your frontend URL
  credentials: true,
}));

// Routes
app.use('/api/auth', require('./routes/auth').default);
app.use('/api/shops', require('./routes/shops').default);
app.use('/api/products', require('./routes/products').default);
app.use('/api/orders', require('./routes/orders').default);

// Connect to MongoDB
connectDB();

// Start server
const PORT = parseInt(process.env.PORT || '5000', 10);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});