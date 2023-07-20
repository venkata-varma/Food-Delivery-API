
import express, { Request, Response, NextFunction } from 'express'
import couponModel from '../models/couponModel'


export const createCoupon = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const coupon: any = await couponModel.create(req.body)
        res.status(201).json({
            success: true,
            id: coupon._id,
            name: coupon.couponName,
            active: coupon.activeStatus,
            range: coupon.minRangeOfOrderValue,
            description: coupon.description
        })

    } catch (err: any) {
        res.status(404).json({
            success: false,
            message: err.message
        })
    }
}

export const activateCoupons = async (req: Request, res: Response) => {
    try {
        const { couponId } = req.params
        if (!couponId) {
            return res.status(404).json({
                success: false,
                message: "No necessary detail"
            })
        }
        const activeCoupon: any = await couponModel.findByIdAndUpdate(couponId, { $set: { activeStatus: req.body.status } }, { new: true, runValidators: true })
        res.status(200).json({
            success: true,
            status: activeCoupon.activeStatus,
            name: activeCoupon.couponName
        })
    } catch (Err: any) {
        res.status(404).json({
            success: false,
            message: Err.message
        })
    }
}

export const getActiveCoupons = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const coupons = await couponModel.find({ activeStatus: true })
        res.status(200).json({
            success: true,
            coupons
        })


    } catch (err: any) {
        res.status(404).json({
            success: false,
            message: err.message
        })
    }
}