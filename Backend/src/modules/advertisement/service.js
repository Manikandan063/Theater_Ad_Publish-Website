import Advertisement from './model.js';

class AdvertisementService {
    static async create(data) {
        return await Advertisement.create(data);
    }

    static async findAll() {
        return await Advertisement.find().populate('adSellerId', 'name email agencyName');
    }

    static async findById(id) {
        return await Advertisement.findById(id).populate('adSellerId', 'name email agencyName');
    }

    static async update(id, data) {
        return await Advertisement.findByIdAndUpdate(id, data, { new: true });
    }

    static async delete(id) {
        return await Advertisement.findByIdAndDelete(id);
    }

    static async findBySellerId(sellerId) {
        return await Advertisement.find({ adSellerId: sellerId });
    }
}

export default AdvertisementService;
