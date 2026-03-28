import mongoose from 'mongoose';

const quotationSchema = new mongoose.Schema({
    advertisementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Advertisement', required: true },
    theaterOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'TheaterOwner', required: false },
    thirdPartyId: { type: mongoose.Schema.Types.ObjectId, ref: 'ThirdParty', required: false },
    adSellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdSeller', required: true },
    price: { type: Number },
    basePrice: { type: Number },
    numberOfScreens: { type: Number, required: true, default: 1 },
    theaterOwnerShare: { type: Number, default: 0 },
    adSellerShare: { type: Number, default: 0 },
    thirdPartyShare: { type: Number, default: 0 },
    validUntil: { type: Date, required: false }, // Made validUntil optional for flexibility
    screenNumber: { type: String }, // e.g., "Screen 1"
    showTime: { type: String },    // e.g., "Morning Show (10 AM)"
    durationUnit: { type: String, enum: ['Weekly', 'Monthly'], default: 'Weekly' }, 
    status: { type: String, enum: ['pending', 'proposed', 'accepted', 'rejected', 'paid', 'approved', 'published'], default: 'pending' },
    message: { type: String },
    createdAt: { type: Date, default: Date.now },
});

const Quotation = mongoose.model('Quotation', quotationSchema);
export default Quotation;
