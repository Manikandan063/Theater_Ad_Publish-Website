import PaymentService from './service.js';
import { calculateCommission, summarizePayments } from '../../utils/payment.js';

class PaymentController {
    static async processPayment(req, res) {
        try {
            const { advertisementId, theaterOwnerId, adSellerId, thirdPartyId, amount, paymentType, numberOfScreens, remarks } = req.body;
            
            if (!advertisementId || (!theaterOwnerId && !thirdPartyId) || !adSellerId || !amount || !paymentType) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }

            const shares = req.body.theaterOwnerShare !== undefined ? {
                theaterOwnerShare: req.body.theaterOwnerShare,
                adSellerShare: req.body.adSellerShare,
                thirdPartyShare: req.body.thirdPartyShare
            } : calculateCommission(amount);

            const payment = await PaymentService.create({
                advertisementId,
                theaterOwnerId: theaterOwnerId || null,
                thirdPartyId: thirdPartyId || null,
                adSellerId,
                amount,
                numberOfScreens: numberOfScreens || 1,
                ...shares,
                paymentType,
                transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                status: 'paid',
                remarks,
            });

            res.status(201).json({
                success: true,
                message: 'Payment processed successfully',
                data: payment,
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getAll(req, res) {
        try {
            const payments = await PaymentService.findAll();
            res.status(200).json({ success: true, count: payments.length, data: payments });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const payment = await PaymentService.findById(req.params.id);
            if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
            res.status(200).json({ success: true, data: payment });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async update(req, res) {
        try {
            const payment = await PaymentService.update(req.params.id, req.body);
            if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
            res.status(200).json({ success: true, data: payment });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const payment = await PaymentService.delete(req.params.id);
            if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
            res.status(200).json({ success: true, message: 'Payment record removed' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getMyPayments(req, res) {
        try {
            let payments;
            if (req.user.role === 'theaterOwner') {
                payments = await PaymentService.findByTheaterOwner(req.user.id);
            } else if (req.user.role === 'adSeller') {
                payments = await PaymentService.findByAdSeller(req.user.id);
            } else {
                payments = await PaymentService.findAll();
            }

            const summary = summarizePayments(payments);

            res.status(200).json({ 
                success: true, 
                count: payments.length, 
                summary,
                data: payments 
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

export default PaymentController;
