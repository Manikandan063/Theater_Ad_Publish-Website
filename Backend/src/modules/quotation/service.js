import Quotation from './model.js';

class QuotationService {
    static async create(data) {
        return await Quotation.create(data);
    }

    static async findAll() {
        return await Quotation.find()
            .populate('advertisementId', 'title description')
            .populate('theaterOwnerId', 'name theaterName')
            .populate('adSellerId', 'name agencyName');
    }

    static async findById(id) {
        return await Quotation.findById(id)
            .populate('advertisementId', 'title description')
            .populate('theaterOwnerId', 'name theaterName')
            .populate('adSellerId', 'name agencyName');
    }

    static async update(id, data) {
        return await Quotation.findByIdAndUpdate(id, data, { new: true });
    }

    static async delete(id) {
        return await Quotation.findByIdAndDelete(id);
    }

    static async findByAdId(adId) {
        return await Quotation.find({ advertisementId: adId });
    }

    static async findByTheaterOwnerId(ownerId) {
        return await Quotation.find({ theaterOwnerId: ownerId });
    }

    static async findByAdSellerId(sellerId) {
        return await Quotation.find({ adSellerId: sellerId });
    }
}

export default QuotationService;
