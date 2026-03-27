import express from 'express';
import QuotationController from './controller.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.post('/', protect(['adSeller', 'admin']), QuotationController.create);
router.get('/', protect(['admin', 'theaterOwner', 'adSeller']), QuotationController.getAll);

// Specialized retrieval — MUST be before /:id to avoid param collision
router.get('/my/owner-quotes', protect(['theaterOwner', 'admin']), QuotationController.getByOwner);
router.get('/my/seller-quotes', protect(['adSeller', 'admin']), QuotationController.getBySeller);

// Update status (Respond to quote) -> Done by Theater Owner
router.patch('/:id/status', protect(['theaterOwner', 'admin']), QuotationController.updateStatus);
router.get('/:id', protect(['admin', 'theaterOwner', 'adSeller']), QuotationController.getById);

export default router;
