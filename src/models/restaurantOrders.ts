import mongoose from 'mongoose'

const restaurantOrdersSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },

    userName: String,
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurants'
    },

    orderItems: [{
        dishName: String,
        dishId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Food'
        },
        price: Number,
        quantity: Number,

        addSuggestions: String

    }],
    address: String,
    state: String,
    mobile: Number,
    email: String,
    city: String,
    pinCode: Number,
    deliveryStatus: {
        type: String,
        default: "Pending",
        enum: ["Pending", "Delivered"]
    },
    couponApplied: Boolean,
    appliedCoupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'coupon'
    },
    pickedUpStatus: Boolean,
    orderAcceptanceStatus: Boolean,
    totalOrderPrice: Number,
    deliveryCharge: Number,
    amountReceived: Number,
    currency: String,
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

},
    { timestamps: true }
)
const restaurantOrders = mongoose.model('restaurantOrders', restaurantOrdersSchema)
export default restaurantOrders