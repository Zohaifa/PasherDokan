import { Router, Request, Response } from 'express';
import Shop from '../models/Shop';
import authenticateToken from '../middleware/auth';

const router: Router = Router();

console.log('Registering shops routes...');

router.get('/test', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Shops router is loaded' });
});

router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { name, type, location } = req.body;
    const shop = new Shop({ name, type, location, shopkeeperId: req.user!.id });
    await shop.save();
    res.status(201).json(shop);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const shops = await Shop.find({ shopkeeperId: req.user!.id });
    res.json(shops);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    console.log(`DELETE request received for shop ID: ${req.params.id}`);
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    if (shop.shopkeeperId.toString() !== req.user!.id) {
      return res.status(403).json({ message: 'Not authorized to delete this shop' });
    }

    await shop.deleteOne();
    console.log(`Shop ${req.params.id} deleted successfully`);
    res.status(200).json({ message: 'Shop deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting shop:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;