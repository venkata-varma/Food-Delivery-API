import mongoose, { Schema, model } from 'mongoose'
const ObjectId = mongoose.Schema.Types.ObjectId



const couponSchema = new Schema({
    couponName: {
        type: String,
        trim: true,
        uppercase: true
    },

    discountPercent: {
        type: Number,
    },
    minRangeOfOrderValue: Number,
    discountInAmount: Number,

    activeStatus: {
        type: Boolean,
        default: false
    },
    description: String,
    maxRangeofDiscount: Number,
    t0c1: String,
    toc2: String,
    toc3: String,
    applcablePerDay: Number

},
    { timestamps: true }
);

const couponModel = model('coupon', couponSchema)
export default couponModel