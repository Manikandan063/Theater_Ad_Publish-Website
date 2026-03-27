import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    advertisementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Advertisement', required: true },
    theaterOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'TheaterOwner', required: true },
    adSellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdSeller', required: true },
    thirdPartyId: { type: mongoose.Schema.Types.ObjectId, ref: 'ThirdParty' }, // Optional, for system management
    amount: { type: Number, required: true },
    numberOfScreens: { type: Number, default: 1 },
    theaterOwnerShare: { type: Number, required: true },
    adSellerShare: { type: Number, required: true },
    thirdPartyShare: { type: Number, required: true },
    paymentType: { 
        type: String, 
        enum: ['screen-wise', 'total', 'weekly', 'monthly'], 
        required: true 
    },
    paymentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'paid' },
    transactionId: { type: String, required: true, unique: true },
    remarks: { type: String },
    createdAt: { type: Date, default: Date.now },
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
