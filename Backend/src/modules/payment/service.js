import Payment from './model.js';

class PaymentService {
    static async create(data) {
        return await Payment.create(data);
    }

    static async findAll() {
        return await Payment.find()
            .populate('advertisementId', 'title')
            .populate('theaterOwnerId', 'name theaterName')
            .populate('adSellerId', 'name agencyName');
    }

    static async findById(id) {
        return await Payment.findById(id)
            .populate('advertisementId', 'title')
            .populate('theaterOwnerId', 'name theaterName')
            .populate('adSellerId', 'name agencyName');
    }

    static async findByTheaterOwner(id) {
        return await Payment.find({ theaterOwnerId: id });
    }

    static async findByAdSeller(id) {
        return await Payment.find({ adSellerId: id });
    }

    static async findByThirdParty() {
        // System wide (Third party can see all usually if they are the platform)
        return await Payment.find();
    }

    static async update(id, data) {
        return await Payment.findByIdAndUpdate(id, data, { new: true });
    }

    static async delete(id) {
        return await Payment.findByIdAndDelete(id);
    }
}

export default PaymentService;
