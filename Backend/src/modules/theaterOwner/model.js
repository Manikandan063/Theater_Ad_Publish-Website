import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const theaterOwnerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    theaterName: { type: String, required: true },
    location: { type: String, required: true },
    contactNumber: { type: String, required: true },
    role: { type: String, default: 'theaterOwner' },
    createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
theaterOwnerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
theaterOwnerSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const TheaterOwner = mongoose.model('TheaterOwner', theaterOwnerSchema);
export default TheaterOwner;
