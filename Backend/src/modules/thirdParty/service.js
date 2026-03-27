import ThirdParty from './model.js';

class ThirdPartyService {
    static async create(data) {
        return await ThirdParty.create(data);
    }

    static async findAll() {
        return await ThirdParty.find();
    }

    static async findById(id) {
        return await ThirdParty.findById(id);
    }

    static async update(id, data) {
        return await ThirdParty.findByIdAndUpdate(id, data, { new: true });
    }

    static async delete(id) {
        return await ThirdParty.findByIdAndDelete(id);
    }

    static async findByEmail(email) {
        return await ThirdParty.findOne({ email });
    }
}

export default ThirdPartyService;
