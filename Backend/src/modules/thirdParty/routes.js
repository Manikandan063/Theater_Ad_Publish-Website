import express from 'express';
import ThirdPartyController from './controller.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.post('/register', ThirdPartyController.register);
router.post('/login', ThirdPartyController.login);

// Protected routes
router.get('/', protect(['thirdParty', 'admin', 'adSeller']), ThirdPartyController.getAll);
router.get('/:id', protect(['thirdParty', 'admin']), ThirdPartyController.getById);
router.put('/:id', protect(['thirdParty', 'admin']), ThirdPartyController.update);
router.delete('/:id', protect(['thirdParty', 'admin']), ThirdPartyController.delete);

export default router;
