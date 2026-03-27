import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TheaterOwner from './src/modules/theaterOwner/model.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Check if admin already exists
        const existingAdmin = await TheaterOwner.findOne({ email: 'admin@theater.com' });
        
        if (existingAdmin) {
            console.log('Super Admin already exists in the database.');
        } else {
            // Create Super Admin
            const admin = new TheaterOwner({
                name: "Super Admin",
                email: "admin@theater.com",
                password: "admin123_Secure", 
                theaterName: "System Administrator View",
                location: "Central Dashboard",
                contactNumber: "9998887776",
                role: "admin" // Overriding the default 'theaterOwner' role
            });

            await admin.save();
            console.log('✅ Super Admin created successfully!');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

seedAdmin();
