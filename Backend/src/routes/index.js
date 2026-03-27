import express from 'express';
import theaterOwnerRoutes from '../modules/theaterOwner/routes.js';
import adSellerRoutes from '../modules/adSeller/routes.js';
import thirdPartyRoutes from '../modules/thirdParty/routes.js';
import advertisementRoutes from '../modules/advertisement/routes.js';
import quotationRoutes from '../modules/quotation/routes.js';
import paymentRoutes from '../modules/payment/routes.js';

const router = express.Router();

router.use('/theater-owners', theaterOwnerRoutes);
router.use('/ad-sellers', adSellerRoutes);
router.use('/third-parties', thirdPartyRoutes);
router.use('/advertisements', advertisementRoutes);
router.use('/quotations', quotationRoutes);
router.use('/payments', paymentRoutes);

export default router;
