import AdSeller from './model.js';

class AdSellerService {
    static async create(data) {
        return await AdSeller.create(data);
    }

    static async findAll() {
        return await AdSeller.find();
    }

    static async findById(id) {
        return await AdSeller.findById(id);
    }

    static async update(id, data) {
        return await AdSeller.findByIdAndUpdate(id, data, { new: true });
    }

    static async delete(id) {
        return await AdSeller.findByIdAndDelete(id);
    }

    static async findByEmail(email) {
        return await AdSeller.findOne({ email });
    }
}

export default AdSellerService;
