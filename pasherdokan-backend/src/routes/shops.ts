import { Router, Request, Response } from 'express';
import Shop from '../models/Shop';
import authenticateToken from '../middleware/auth';

const router: Router = Router();

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

export default router;