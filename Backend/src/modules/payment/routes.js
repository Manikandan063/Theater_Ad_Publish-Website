import express from 'express';
import PaymentController from './controller.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// Admin can see all payments
router.get('/', protect(['admin']), PaymentController.getAll);
router.get('/:id', protect(['admin']), PaymentController.getById);

// Process a new payment (Commission calculated automatically by Ad Seller paying Theater Owner)
router.post('/process', protect(['theaterOwner', 'adSeller', 'admin']), PaymentController.processPayment);

// My payments and summary reports (Based on role: owner, seller, admin)
router.get('/my/history', protect(['theaterOwner', 'adSeller', 'admin']), PaymentController.getMyPayments);

// Update/Delete (Admin only)
router.put('/:id', protect(['admin']), PaymentController.update);
router.delete('/:id', protect(['admin']), PaymentController.delete);

export default router;
