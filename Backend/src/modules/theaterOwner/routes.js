import express from 'express';
import TheaterOwnerController from './controller.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.post('/register', TheaterOwnerController.register);
router.post('/login', TheaterOwnerController.login);

// Protected routes — adSeller can read theater list to send quotations
router.get('/', protect(['theaterOwner', 'admin', 'adSeller', 'thirdParty']), TheaterOwnerController.getOwners);
router.get('/:id', protect(['theaterOwner', 'admin', 'adSeller']), TheaterOwnerController.getOwnerById);
router.put('/:id', protect(['theaterOwner', 'admin']), TheaterOwnerController.updateOwner);
router.delete('/:id', protect(['theaterOwner', 'admin']), TheaterOwnerController.deleteOwner);

export default router;
