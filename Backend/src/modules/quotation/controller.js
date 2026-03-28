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
            const { status, message } = req.body;
            
            // Logic: 
            // - Ad Sellers: Mark as 'paid' (when paying) OR 'accepted' (when clicking "Accept Rates")
            // - Theater Owners: Mark as 'accepted', 'rejected', OR 'published' (if paid)
            // - Third Parties (Brokers): Mark as 'proposed' or 'rejected'

            if (req.user.role === 'adSeller' && !['paid', 'accepted'].includes(status)) {
                return res.status(403).json({ success: false, message: 'Publishers can only accept rates or mark as paid' });
            }
            if (req.user.role === 'theaterOwner' && !['accepted', 'rejected', 'published'].includes(status)) {
                return res.status(403).json({ success: false, message: 'Theater Owners can only accept, reject, or publish ads' });
            }
            if (req.user.role === 'thirdParty' && !['proposed', 'rejected'].includes(status)) {
                return res.status(403).json({ success: false, message: 'Brokers can only propose rates or reject' });
            }

            const updateData = { status, message };

            // Extract screen and showtime when Theater Owner is publishing
            if (req.user.role === 'theaterOwner' && status === 'published') {
                const { screenNumber, showTime } = req.body;
                if (screenNumber) updateData.screenNumber = screenNumber;
                if (showTime) updateData.showTime = showTime;
            }
            
            // Extract commission data and updated price when Broker is proposing
            if (req.user.role === 'thirdParty' && status === 'proposed') {
                const { theaterOwnerShare, thirdPartyShare, adSellerShare, theaterOwnerId, price, basePrice } = req.body;
                if (theaterOwnerShare !== undefined) updateData.theaterOwnerShare = theaterOwnerShare;
                if (thirdPartyShare !== undefined) updateData.thirdPartyShare = thirdPartyShare;
                if (adSellerShare !== undefined) updateData.adSellerShare = adSellerShare;
                if (theaterOwnerId) updateData.theaterOwnerId = theaterOwnerId;
                if (price !== undefined) updateData.price = price;
                if (basePrice !== undefined) updateData.basePrice = basePrice;
            }

            const quotation = await QuotationService.update(req.params.id, updateData);
            
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

    static async getByThirdParty(req, res) {
        try {
            const quotes = await QuotationService.findByThirdPartyId(req.user.id);
            res.status(200).json({ success: true, data: quotes });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const quotation = await QuotationService.delete(req.params.id);
            if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });
            res.status(200).json({ success: true, message: 'Quotation deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

export default QuotationController;
