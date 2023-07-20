import mongoose from "mongoose"
import { Schema, model } from 'mongoose'


const userOrderSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Users"
    },
    userName: String,
    orderItems: [
        {

            qty: { type: Number },
            image: { type: String },
            price: { type: Number },
            foodDishName: { type: String },

            foodDishId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Food'
            },
            deliveredDate: Date,
            addSuggestion: String
        }
    ],

    restaurantName: String,
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurants'
    },

    address: String,
    city: String,
    state: String,
    pincode: Number,

    deliveryCharge: {
        type: Number,
        default: 0.0,
    },
    packingCharge: {
        type: Number,

    },
    mobile: {
        type: String,

    },
    totalPrice: {
        type: Number,
        default: 0.0,
    },
    currency: String,
    couponApplied: {
        type: Boolean
    },
    appliedCoupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'coupon'
    },
    deliveryStatus: {
        type: String,
        default: "Pending",
        enum: ["Pending", "Delivered"]
    },
    orderId: String,
    transactionId: String,
    paymentStatus: {
        type: String,
        enum: ["Success", "Failed", "Pending", "Progress"]

    },
    isCancelled: {
        type: Boolean,
        default: false
    },
    amountRefunded: Boolean,
    pickedUpStatus: Boolean,
    orderAcceptanceStatus: {
        type: Boolean,
        default: false
    },
    deliveryTimeStamp: Date,

},

    {
        timestamps: true,
    }
)
const userOrderModel = model('userOrders', userOrderSchema)
export default userOrderModel
