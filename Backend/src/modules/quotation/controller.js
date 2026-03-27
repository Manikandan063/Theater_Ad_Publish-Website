import QuotationService from './service.js';

class QuotationController {
    static async create(req, res) {
        try {
            // Check if user is an adSeller
            if (req.user.role !== 'adSeller') {
                return res.status(403).json({ success: false, message: 'Only Ad Sellers can request quotations' });
            }

            const quotation = await QuotationService.create({
                ...req.body,
                adSellerId: req.user.id,
            });

            res.status(201).json({ success: true, data: quotation });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getAll(req, res) {
        try {
            const quotations = await QuotationService.findAll();
            res.status(200).json({ success: true, data: quotations });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const quotation = await QuotationService.findById(req.params.id);
            if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });
            res.status(200).json({ success: true, data: quotation });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async updateStatus(req, res) {
        try {
            // Check if user is a theater owner to update status (accept/reject)
            if (req.user.role !== 'theaterOwner') {
                return res.status(403).json({ success: false, message: 'Only Theater Owners can respond to quotations' });
            }

            const { status, message } = req.body;
            const quotation = await QuotationService.update(req.params.id, { status, message });
            
            if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });
            res.status(200).json({ success: true, data: quotation });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getByOwner(req, res) {
        try {
            const quotes = await QuotationService.findByTheaterOwnerId(req.user.id);
            res.status(200).json({ success: true, data: quotes });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getBySeller(req, res) {
        try {
            const quotes = await QuotationService.findByAdSellerId(req.user.id);
            res.status(200).json({ success: true, data: quotes });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

export default QuotationController;
