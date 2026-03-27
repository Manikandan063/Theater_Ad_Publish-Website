import TheaterOwner from './model.js';

class TheaterOwnerService {
    static async create(data) {
        return await TheaterOwner.create(data);
    }

    static async findAll() {
        return await TheaterOwner.find();
    }

    static async findById(id) {
        return await TheaterOwner.findById(id);
    }

    static async update(id, data) {
        return await TheaterOwner.findByIdAndUpdate(id, data, { new: true });
    }

    static async delete(id) {
        return await TheaterOwner.findByIdAndDelete(id);
    }

    static async findByEmail(email) {
        return await TheaterOwner.findOne({ email });
    }
}

export default TheaterOwnerService;
