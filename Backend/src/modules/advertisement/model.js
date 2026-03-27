import mongoose from 'mongoose';

const advertisementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    mediaUrl: { type: String, required: true },
    adSellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdSeller', required: true },
    duration: { type: Number, required: true }, // duration in seconds
    adType: { type: String, enum: ['video', 'static'], default: 'video' },
    targetAudience: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

const Advertisement = mongoose.model('Advertisement', advertisementSchema);
export default Advertisement;
