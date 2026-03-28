import Quotation from './model.js';

class QuotationService {
    static async create(data) {
        return await Quotation.create(data);
    }

    static async findAll() {
        return await Quotation.find()
            .populate('advertisementId', 'title description mediaUrl adType')
            .populate('theaterOwnerId', 'name theaterName')
            .populate('adSellerId', 'name agencyName')
            .populate('thirdPartyId', 'name companyName');
    }

    static async findById(id) {
        return await Quotation.findById(id)
            .populate('advertisementId', 'title description mediaUrl adType')
            .populate('theaterOwnerId', 'name theaterName')
            .populate('adSellerId', 'name agencyName')
            .populate('thirdPartyId', 'name companyName');
    }

    static async update(id, data) {
        return await Quotation.findByIdAndUpdate(id, data, { new: true });
    }

    static async delete(id) {
        return await Quotation.findByIdAndDelete(id);
    }

    static async findByAdId(adId) {
        return await Quotation.find({ advertisementId: adId })
            .populate('theaterOwnerId', 'name theaterName')
            .populate('adSellerId', 'name agencyName');
    }

    static async findByTheaterOwnerId(ownerId) {
        return await Quotation.find({ theaterOwnerId: ownerId })
            .populate('advertisementId', 'title description duration mediaUrl adType')
            .populate('adSellerId', 'name agencyName')
            .populate('thirdPartyId', 'name companyName');
    }

    static async findByThirdPartyId(brokerId) {
        return await Quotation.find({ thirdPartyId: brokerId })
            .populate('advertisementId', 'title description duration mediaUrl adType')
            .populate('adSellerId', 'name agencyName')
            .populate('theaterOwnerId', 'name theaterName');
    }

    static async findByAdSellerId(sellerId) {
        return await Quotation.find({ adSellerId: sellerId })
            .populate('advertisementId', 'title description mediaUrl adType')
            .populate('theaterOwnerId', 'name theaterName')
            .populate('thirdPartyId', 'name companyName');
    }
}

export default QuotationService;
