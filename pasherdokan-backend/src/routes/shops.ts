import { Router, Request, Response } from 'express';
import Shop from '../models/Shop';
import authenticateToken from '../middleware/auth';

const router: Router = Router();

console.log('Registering shops routes...');

router.get('/test', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Shops router is loaded' });
});

// Add the nearby endpoint - accessible without authentication
router.get('/nearby', async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const maxDistance = parseInt(radius as string);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: 'Invalid latitude or longitude values' });
    }

    console.log(`Searching for shops near [${longitude}, ${latitude}] with radius ${maxDistance}m`);

    // Find shops near the given coordinates
    const shops = await Shop.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude] // MongoDB uses [lng, lat] order
          },
          $maxDistance: maxDistance
        }
      }
    });

    console.log(`Found ${shops.length} shops nearby`);
    
    // Transform data format to match frontend expectations
    const formattedShops = shops.map(shop => ({
      _id: shop._id,
      name: shop.name,
      shopType: shop.type, // Convert type to shopType for frontend
      location: {
        latitude: shop.location.coordinates[1],  // Convert from [lng, lat] to {latitude, longitude}
        longitude: shop.location.coordinates[0]
      }
    }));

    res.json(formattedShops);
  } catch (error: any) {
    console.error('Error finding nearby shops:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
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