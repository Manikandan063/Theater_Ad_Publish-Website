import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TheaterOwner from './src/modules/theaterOwner/model.js';
import AdSeller from './src/modules/adSeller/model.js';
import ThirdParty from './src/modules/thirdParty/model.js';
import Advertisement from './src/modules/advertisement/model.js';
import Quotation from './src/modules/quotation/model.js';
import Payment from './src/modules/payment/model.js';

dotenv.config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🌱 Connected to MongoDB Atlas for Seeding...');

        // 1. Wipe existing data
        await TheaterOwner.deleteMany({});
        await AdSeller.deleteMany({});
        await ThirdParty.deleteMany({});
        await Advertisement.deleteMany({});
        await Quotation.deleteMany({});
        await Payment.deleteMany({});
        console.log('🧹 Cleaned existing collections...');

        // 2. Seed Admin & Theater Owners
        const admin = await TheaterOwner.create({
            name: "Super Admin",
            email: "admin@theater.com",
            password: "admin123_Secure", 
            theaterName: "HQ System Control",
            location: "Central Hub",
            contactNumber: "9998887776",
            role: "admin"
        });

        const owner1 = await TheaterOwner.create({
            name: "Manikandan Owner",
            email: "owner@theater.com",
            password: "password123",
            theaterName: "Xtown Cinema Hall",
            location: "Chennai",
            contactNumber: "9345577285",
            role: "theaterOwner"
        });

        const owner2 = await TheaterOwner.create({
            name: "John Cinema",
            email: "john@theater.com",
            password: "password123",
            theaterName: "Grand Imperial Cinemas",
            location: "Bangalore",
            contactNumber: "9876543210",
            role: "theaterOwner"
        });

        // 3. Seed Ad Sellers
        const seller1 = await AdSeller.create({
            name: "Alice Seller",
            email: "seller@agency.com",
            password: "password123",
            agencyName: "Pro Ads Media",
            contactPerson: "Alice",
            contactNumber: "9123456789",
            address: "Tech Park, Chennai",
            role: "adSeller"
        });

        // 4. Seed Third Party
        const thirdParty1 = await ThirdParty.create({
            name: "Partner Service",
            email: "partner@thirdparty.com",
            password: "password123",
            companyName: "Integrate Systems",
            website: "https://thirdparty.com",
            contactNumber: "9876543211",
            role: "thirdParty"
        });

        console.log('👥 Users & Roles Seeded...');

        // 5. Seed Advertisements
        const ad1 = await Advertisement.create({
            title: "Nike Sports Campaign",
            description: "Premium 30s Sports Video Ad for interval",
            mediaUrl: "https://example.com/nike.mp4",
            adSellerId: seller1._id,
            duration: 30,
            adType: "video",
            targetAudience: "General"
        });

        const ad2 = await Advertisement.create({
            title: "Cool Brew Summer Promo",
            description: "Refreshing summer drinks ad",
            mediaUrl: "https://example.com/coolbrew.jpg",
            adSellerId: seller1._id,
            duration: 15,
            adType: "static",
            targetAudience: "Youth"
        });

        console.log('📢 Advertisements Seeded...');

        // 6. Seed Quotations
        await Quotation.create({
            advertisementId: ad1._id,
            theaterOwnerId: owner1._id,
            adSellerId: seller1._id,
            price: 7500,
            validUntil: new Date("2026-12-31"),
            status: "pending",
            message: "Requesting Prime Time Evening Slots"
        });

        await Quotation.create({
            advertisementId: ad2._id,
            theaterOwnerId: owner2._id,
            adSellerId: seller1._id,
            price: 5000,
            validUntil: new Date("2026-10-15"),
            status: "accepted",
            message: "Confirmed for normal screening slots"
        });

        console.log('💬 Quotations & Negotiations Seeded...');

        // 7. Seed Payments & Custom Commissions (80 / 0 / 20 logic visualised)
        const amount = 10000;
        await Payment.create({
            advertisementId: ad1._id,
            theaterOwnerId: owner1._id,
            adSellerId: seller1._id,
            thirdPartyId: thirdParty1._id,
            amount: amount,
            numberOfScreens: 4,
            theaterOwnerShare: amount * 0.80,
            adSellerShare: 0,
            thirdPartyShare: amount * 0.20,
            paymentType: "weekly",
            transactionId: `TXN-${Date.now()}-A92B`,
            status: "paid",
            remarks: "Standard 4 Screen weekly interval payment"
        });

        console.log('💳 Payments & Auto-Commissions Seeded...');
        console.log('🚀 SEEDING COMPLETE! ALL MOCK DATA LOADED! 🌱');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error during database seeding:', error);
        process.exit(1);
    }
};

seedDatabase();
