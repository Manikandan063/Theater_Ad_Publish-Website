import AdSellerService from './service.js';
import { generateToken } from '../../utils/auth.js';

class AdSellerController {
    static async register(req, res) {
        try {
            const { name, email, password, agencyName, contactPerson, contactNumber, address } = req.body;
            
            if (!name || !email || !password || !agencyName || !contactPerson || !contactNumber || !address) {
                return res.status(400).json({ success: false, message: 'Please provide all required fields' });
            }

            const existingSeller = await AdSellerService.findByEmail(email);
            if (existingSeller) {
                return res.status(400).json({ success: false, message: 'User already exists' });
            }

            const seller = await AdSellerService.create({
                name,
                email,
                password,
                agencyName,
                contactPerson,
                contactNumber,
                address,
            });

            res.status(201).json({
                success: true,
                token: generateToken(seller._id, 'adSeller'),
                data: {
                    id: seller._id,
                    name: seller.name,
                    email: seller.email,
                    agencyName: seller.agencyName,
                },
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const seller = await AdSellerService.findByEmail(email);

            if (seller && (await seller.matchPassword(password))) {
                res.status(200).json({
                    success: true,
                    token: generateToken(seller._id, 'adSeller'),
                    data: {
                        id: seller._id,
                        name: seller.name,
                        email: seller.email,
                        agencyName: seller.agencyName,
                    },
                });
            } else {
                res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getAll(req, res) {
        try {
            const sellers = await AdSellerService.findAll();
            res.status(200).json({ success: true, data: sellers });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const seller = await AdSellerService.findById(req.params.id);
            if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });
            res.status(200).json({ success: true, data: seller });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async update(req, res) {
        try {
            const seller = await AdSellerService.update(req.params.id, req.body);
            if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });
            res.status(200).json({ success: true, data: seller });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const seller = await AdSellerService.delete(req.params.id);
            if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });
            res.status(200).json({ success: true, message: 'Ad Seller removed' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

export default AdSellerController;
