import Payment from './model.js';

class PaymentService {
    static async create(data) {
        return await Payment.create(data);
    }

    static async findAll() {
        return await Payment.find()
            .populate('advertisementId', 'title duration')
            .populate('theaterOwnerId', 'name theaterName')
            .populate('adSellerId', 'name agencyName');
    }

    static async findById(id) {
        return await Payment.findById(id)
            .populate('advertisementId', 'title duration')
            .populate('theaterOwnerId', 'name theaterName')
            .populate('adSellerId', 'name agencyName');
    }

    static async findByTheaterOwner(id) {
        return await Payment.find({ theaterOwnerId: id })
            .populate('advertisementId', 'title duration')
            .populate('adSellerId', 'name agencyName');
    }

    static async findByAdSeller(id) {
        return await Payment.find({ adSellerId: id })
            .populate('advertisementId', 'title duration')
            .populate('theaterOwnerId', 'name theaterName');
    }

    static async findByThirdParty(id) {
        return await Payment.find({ thirdPartyId: id })
            .populate('advertisementId', 'title duration')
            .populate('theaterOwnerId', 'name theaterName')
            .populate('adSellerId', 'name agencyName');
    }

    static async update(id, data) {
        return await Payment.findByIdAndUpdate(id, data, { new: true });
    }

    static async delete(id) {
        return await Payment.findByIdAndDelete(id);
    }
}

export default PaymentService;
