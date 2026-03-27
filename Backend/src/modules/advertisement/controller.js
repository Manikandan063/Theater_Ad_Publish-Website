import AdvertisementService from './service.js';

class AdvertisementController {
    static async create(req, res) {
        try {
            // Check if user is an adSeller
            if (req.user.role !== 'adSeller') {
                return res.status(403).json({ success: false, message: 'Only Ad Sellers can create ads' });
            }

            const ad = await AdvertisementService.create({
                ...req.body,
                adSellerId: req.user.id,
            });

            res.status(201).json({ success: true, data: ad });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getAll(req, res) {
        try {
            const ads = await AdvertisementService.findAll();
            res.status(200).json({ success: true, data: ads });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const ad = await AdvertisementService.findById(req.params.id);
            if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });
            res.status(200).json({ success: true, data: ad });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async update(req, res) {
        try {
            const ad = await AdvertisementService.update(req.params.id, req.body);
            if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });
            res.status(200).json({ success: true, data: ad });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const ad = await AdvertisementService.delete(req.params.id);
            if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });
            res.status(200).json({ success: true, message: 'Ad removed' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getMyAds(req, res) {
        try {
            const ads = await AdvertisementService.findBySellerId(req.user.id);
            res.status(200).json({ success: true, data: ads });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

export default AdvertisementController;
