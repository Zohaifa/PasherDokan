import { Router, Request, Response } from 'express';
import Product from '../models/Product';
import authenticateToken from '../middleware/auth';

const router: Router = Router();

router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { name, category, price, stock, shopId } = req.body;
    const product = new Product({ name, category, price, stock, shopId });
    await product.save();
    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/shop/:shopId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ shopId: req.params.shopId });
    res.json(products);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Only allow certain fields to be updated
    const allowedUpdates = ['name', 'price', 'stock', 'category'];
    const isValidOperation = Object.keys(updates).every(update => 
      allowedUpdates.includes(update)
    );
    
    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates!' });
    }
    
    const product = await Product.findByIdAndUpdate(id, updates, { 
      new: true, 
      runValidators: true 
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;