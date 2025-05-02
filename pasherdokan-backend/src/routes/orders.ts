import { Router, Request, Response } from 'express';
import Order from '../models/Order';
import authenticateToken from '../middleware/auth';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        [key: string]: any;
      }
    }
  }
}

const router: Router = Router();

router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { shopId, products, totalPrice } = req.body;
    const order = new Order({ customerId: req.user!.id, shopId, products, totalPrice });
    await order.save();
    res.status(201).json(order);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/customer', authenticateToken, async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ customerId: req.user!.id }).populate('products.productId');
    res.json(orders);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(order);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;