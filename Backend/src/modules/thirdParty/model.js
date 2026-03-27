import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const thirdPartySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    companyName: { type: String, required: true },
    website: { type: String },
    contactNumber: { type: String, required: true },
    role: { type: String, default: 'thirdParty' },
    createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
thirdPartySchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
thirdPartySchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const ThirdParty = mongoose.model('ThirdParty', thirdPartySchema);
export default ThirdParty;
