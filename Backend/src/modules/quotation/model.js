import mongoose from 'mongoose';

const quotationSchema = new mongoose.Schema({
    advertisementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Advertisement', required: true },
    theaterOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'TheaterOwner', required: true },
    adSellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdSeller', required: true },
    price: { type: Number, required: true },
    validUntil: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    message: { type: String },
    createdAt: { type: Date, default: Date.now },
});

const Quotation = mongoose.model('Quotation', quotationSchema);
export default Quotation;
