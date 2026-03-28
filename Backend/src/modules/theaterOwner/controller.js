import TheaterOwnerService from './service.js';
import { generateToken } from '../../utils/auth.js';

class TheaterOwnerController {
    static async register(req, res) {
        try {
            const { name, email, password, theaterName, location, contactNumber } = req.body;
            
            if (!name || !email || !password || !theaterName || !location || !contactNumber) {
                return res.status(400).json({ success: false, message: 'Please provide all required fields' });
            }

            const existingOwner = await TheaterOwnerService.findByEmail(email);
            if (existingOwner) {
                return res.status(400).json({ success: false, message: 'User already exists' });
            }

            const owner = await TheaterOwnerService.create({
                name,
                email,
                password,
                theaterName,
                location,
                contactNumber,
            });

            res.status(201).json({
                success: true,
                token: generateToken(owner._id, 'theaterOwner'),
                data: {
                    id: owner._id,
                    name: owner.name,
                    email: owner.email,
                    theaterName: owner.theaterName,
                    location: owner.location,
                },
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const owner = await TheaterOwnerService.findByEmail(email);

            if (owner && (await owner.matchPassword(password))) {
                res.status(200).json({
                    success: true,
                    token: generateToken(owner._id, 'theaterOwner'),
                    data: {
                        id: owner._id,
                        name: owner.name,
                        email: owner.email,
                        theaterName: owner.theaterName,
                        location: owner.location,
                    },
                });
            } else {
                res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getOwners(req, res) {
        try {
            const owners = await TheaterOwnerService.findAll();
            res.status(200).json({ success: true, data: owners });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getOwnerById(req, res) {
        try {
            const owner = await TheaterOwnerService.findById(req.params.id);
            if (!owner) {
                return res.status(404).json({ success: false, message: 'Owner not found' });
            }
            res.status(200).json({ success: true, data: owner });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async updateOwner(req, res) {
        try {
            const owner = await TheaterOwnerService.update(req.params.id, req.body);
            if (!owner) {
                return res.status(404).json({ success: false, message: 'Owner not found' });
            }
            res.status(200).json({ success: true, data: owner });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async deleteOwner(req, res) {
        try {
            const owner = await TheaterOwnerService.delete(req.params.id);
            if (!owner) {
                return res.status(404).json({ success: false, message: 'Owner not found' });
            }
            res.status(200).json({ success: true, message: 'Owner removed' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

export default TheaterOwnerController;
