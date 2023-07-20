import express from "express";
const router = express.Router();
import * as couponController from "../controllers/couponController";

router.post('/create-coupon', couponController.createCoupon)
router.patch('/activate-coupon/:couponId', couponController.activateCoupons)
router.get('/get-active-coupons', couponController.getActiveCoupons)
export default router


