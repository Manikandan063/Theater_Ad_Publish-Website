import express from 'express';
import AdvertisementController from './controller.js';
import { protect } from '../../middleware/auth.js';

import upload from '../../middleware/upload.js';

const router = express.Router();

// Protected routes (Seller/Admin specific)
// IMPORTANT: /my-ads must come BEFORE /:id to prevent Express treating 'my-ads' as an id param
router.get('/my-ads', protect(['adSeller', 'admin']), AdvertisementController.getMyAds);
router.post('/', protect(['adSeller', 'admin']), upload.single('videoFile'), AdvertisementController.create);
router.put('/:id', protect(['adSeller', 'admin']), upload.single('videoFile'), AdvertisementController.update);
router.delete('/:id', protect(['adSeller', 'admin']), AdvertisementController.delete);

// Public routes
router.get('/', AdvertisementController.getAll);
router.get('/:id', AdvertisementController.getById);

export default router;
