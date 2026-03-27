import express from 'express';
import AdSellerController from './controller.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.post('/register', AdSellerController.register);
router.post('/login', AdSellerController.login);

// Protected routes (Roles: adSeller, theaterOwner, thirdParty, admin)
router.get('/', protect(['adSeller', 'admin']), AdSellerController.getAll);
router.get('/:id', protect(['adSeller', 'admin']), AdSellerController.getById);
router.put('/:id', protect(['adSeller', 'admin']), AdSellerController.update);
router.delete('/:id', protect(['adSeller', 'admin']), AdSellerController.delete);

export default router;
