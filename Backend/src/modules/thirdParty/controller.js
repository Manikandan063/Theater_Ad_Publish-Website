import ThirdPartyService from './service.js';
import { generateToken } from '../../utils/auth.js';

class ThirdPartyController {
    static async register(req, res) {
        try {
            const { name, email, password, companyName, website, contactNumber } = req.body;
            
            if (!name || !email || !password || !companyName || !contactNumber) {
                return res.status(400).json({ success: false, message: 'Please provide all required fields' });
            }

            const existingParty = await ThirdPartyService.findByEmail(email);
            if (existingParty) {
                return res.status(400).json({ success: false, message: 'User already exists' });
            }

            const party = await ThirdPartyService.create({
                name,
                email,
                password,
                companyName,
                website,
                contactNumber,
            });

            res.status(201).json({
                success: true,
                token: generateToken(party._id, 'thirdParty'),
                data: {
                    id: party._id,
                    name: party.name,
                    email: party.email,
                },
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const party = await ThirdPartyService.findByEmail(email);

            if (party && (await party.matchPassword(password))) {
                res.status(200).json({
                    success: true,
                    token: generateToken(party._id, 'thirdParty'),
                    data: {
                        id: party._id,
                        name: party.name,
                        email: party.email,
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
            const items = await ThirdPartyService.findAll();
            res.status(200).json({ success: true, data: items });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const item = await ThirdPartyService.findById(req.params.id);
            if (!item) return res.status(404).json({ success: false, message: 'Not found' });
            res.status(200).json({ success: true, data: item });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async update(req, res) {
        try {
            const item = await ThirdPartyService.update(req.params.id, req.body);
            if (!item) return res.status(404).json({ success: false, message: 'Not found' });
            res.status(200).json({ success: true, data: item });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const item = await ThirdPartyService.delete(req.params.id);
            if (!item) return res.status(404).json({ success: false, message: 'Not found' });
            res.status(200).json({ success: true, message: 'Third Party removed' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

export default ThirdPartyController;
